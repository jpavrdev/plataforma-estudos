// Seed da trilha Autenticacao (iniciante), estagio 5 do roadmap de Back-end.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-autenticacao.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Autenticação";
const DESCRICAO =
    "Como um back-end sabe quem é o usuário e o que ele pode fazer: hash de senhas, sessões e cookies, tokens JWT, o fluxo completo de login numa API, autorização por papéis e OAuth com login social. A camada que protege a sua aplicação.";

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
        "titulo": "Módulo 1 - Autenticação x autorização: o problema da identidade",
        "aulas": [
            {
                "titulo": "Autenticar x autorizar: duas perguntas diferentes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Autenticar x autorizar: duas perguntas diferentes\n\nQuando um sistema decide se deixa alguém entrar ou fazer algo, ele está respondendo duas perguntas diferentes, mesmo que no dia a dia a gente costume misturar as duas:\n\n- **Quem é você?** (autenticação)\n- **O que você pode fazer?** (autorização)\n\nEssa trilha inteira existe para responder essas duas perguntas dentro de uma API. Antes de escrever qualquer linha de código, vale entender bem a diferença entre elas, porque confundir os dois conceitos é uma das causas mais comuns de falha de segurança em sistemas reais."
                    },
                    {
                        "type": "text",
                        "value": "## Autenticação: provar quem você é\n\n**Autenticação** (_authentication_) é o processo de provar uma identidade. Pense no crachá de um funcionário: ao passar pela catraca da empresa, o crachá (ou a digital, ou o reconhecimento facial da câmera) prova que aquela pessoa é, de fato, quem diz ser. Nesse momento a empresa ainda não está perguntando \"você pode entrar na sala do financeiro?\", só está perguntando \"você é mesmo o funcionário Fulano?\".\n\nEm uma API, autenticar normalmente significa validar um e-mail e uma senha, um token, ou algum outro jeito de provar identidade."
                    },
                    {
                        "type": "text",
                        "value": "## Autorização: decidir o que é permitido\n\n**Autorização** (_authorization_) vem depois, e responde a uma pergunta diferente: já sabendo quem você é, o que você tem permissão de fazer? Voltando ao crachá: depois que ele prova a identidade na catraca, o mesmo crachá pode abrir a porta da sala de reuniões, mas não abrir o cofre do financeiro. A empresa sabe exatamente quem você é (autenticação já resolvida) e, mesmo assim, nega o acesso a um lugar específico (autorização negada).\n\nEm uma API, autorizar normalmente significa checar se aquele usuário, já autenticado, tem o papel, a permissão ou a posse necessária para realizar a ação pedida."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Autenticação\", \"Autorização\"], [\"Pergunta que responde\", \"Quem é você?\", \"O que você pode fazer?\"], [\"Quando acontece\", \"Primeiro\", \"Depois, já sabendo quem é\"], [\"Exemplo do crachá\", \"Provar que é o funcionário Fulano\", \"Ter permissão de entrar na sala do financeiro\"], [\"Exemplo em API\", \"Login com e-mail e senha\", \"Checar se o usuário é admin antes de apagar algo\"], [\"Falha típica se quebrar\", \"Alguém consegue entrar sendo outra pessoa\", \"Usuário autenticado faz algo que não devia\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// Duas respostas HTTP que mostram a diferença na prática\n\n// Requisição sem autenticação válida (o servidor não sabe quem está pedindo)\nGET /perfil HTTP/1.1\nHost: api.exemplo.com\n\nHTTP/1.1 401 Unauthorized\nContent-Type: application/json\n\n{\"erro\": \"Você precisa fazer login para acessar isso\"}\n\n\n// Requisição autenticada, mas sem permissão (o servidor sabe quem é, mas nega a ação)\nGET /admin/usuarios HTTP/1.1\nHost: api.exemplo.com\nAuthorization: Bearer eyJhbGciOiJIUzI1NiJ9...\n\nHTTP/1.1 403 Forbidden\nContent-Type: application/json\n\n{\"erro\": \"Seu usuário não tem permissão para acessar isso\"}"
                    },
                    {
                        "type": "text",
                        "value": "## Por que separar os dois importa\n\nMisturar autenticação e autorização no código costuma abrir espaço para dois tipos de falha: rotas que deixam qualquer pessoa autenticada fazer qualquer coisa (faltou checar autorização), ou rotas que checam permissão mas confiam demais em quem afirma ser o usuário (faltou uma autenticação sólida). Ao longo desta trilha você vai construir as duas camadas em separado: primeiro uma autenticação sólida (senha guardada direito, sessão ou token), para só depois cuidar da autorização (papéis, permissões, dono do recurso)."
                    },
                    {
                        "type": "quote",
                        "value": "Autenticação prova quem você é. Autorização decide o que você pode fazer sendo quem você é. São duas perguntas diferentes, respondidas em momentos diferentes, e um sistema seguro nunca pode confundir uma com a outra."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções a seguir descreve corretamente a diferença entre autenticação e autorização?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Autenticação prova quem o usuário é; autorização decide o que esse usuário pode fazer.",
                                "isCorrect": true
                            },
                            {
                                "text": "Autenticação decide o que o usuário pode fazer; autorização prova quem ele é.",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticação e autorização são a mesma coisa dentro de um sistema, só muda o nome usado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticação só existe em sistemas com senha; autorização só existe em sistemas com papéis.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa usa crachás: eles provam a identidade do funcionário na catraca da entrada, mas só alguns crachás conseguem abrir a porta da sala do financeiro. Esse controle específico da porta do financeiro é um exemplo de qual conceito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Autorização, porque decide o que um funcionário já identificado pode acessar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Autenticação, porque é o crachá que confirma a identidade na catraca de entrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Identificação, porque o crachá exibe o nome e a foto do funcionário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografia, porque impede fisicamente a abertura do cofre sem a senha certa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API recebe uma requisição para apagar um post. O token enviado no header Authorization é válido e pertence a um usuário comum (não administrador), mas apenas administradores podem apagar posts. Qual resposta HTTP a API deveria devolver?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "403 Forbidden, porque o usuário está autenticado, mas não tem permissão para apagar posts.",
                                "isCorrect": true
                            },
                            {
                                "text": "401 Unauthorized, porque um token de usuário comum não conta como autenticação válida.",
                                "isCorrect": false
                            },
                            {
                                "text": "200 OK, porque qualquer token válido já autoriza automaticamente a exclusão de posts.",
                                "isCorrect": false
                            },
                            {
                                "text": "404 Not Found, porque o post pertence a outro usuário e por isso não pode ser encontrado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor implementou o login de uma API, mas esqueceu de checar se o usuário logado é o dono do pedido antes de permitir cancelá-lo. Com isso, qualquer usuário autenticado consegue cancelar pedidos de outras pessoas. Que tipo de falha é essa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Falha de autorização, já que a identidade foi confirmada mas a permissão não foi checada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Falha de autenticação, já que o sistema nunca confirma de fato a identidade de quem loga.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falha de criptografia, já que os dados do pedido trafegam sem nenhuma proteção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falha de identificação, já que o cancelamento não exige o nome de usuário no formulário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema exige login para acessar qualquer rota da API, mas depois de autenticado, todo usuário (comum ou admin) tem acesso às mesmas rotas e ações, sem nenhuma distinção de papel ou dono do recurso. O que se pode afirmar sobre esse sistema, do ponto de vista de autenticação e autorização?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ele tem autenticação, mas praticamente não tem autorização, pois não existe distinção do que cada um pode fazer.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele não tem autenticação nem autorização, pois as duas precisam sempre existir juntas ou nenhuma existe.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele tem autorização completa, porque só usuários autenticados chegam a ver qualquer rota da API.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele tem os dois implementados direito, já que pedir login em toda rota já garante o controle total de acesso.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Identificação, autenticação e os fatores (o que você sabe, tem e é)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Identificação, autenticação e os fatores (o que você sabe, tem e é)\n\nAntes de falar dos fatores de autenticação, vale destacar um conceito que costuma passar despercebido: **identificação**. Um login normalmente acontece em três passos, mesmo que a gente não perceba isso separadamente:\n\n1. **Identificação**: você afirma quem é (\"eu sou joao@email.com\").\n2. **Autenticação**: você prova que é mesmo essa pessoa (a senha certa, o código certo).\n3. **Autorização**: o sistema decide o que essa pessoa, já provada, pode fazer.\n\nSó dizer o e-mail não prova nada: qualquer um pode digitar o e-mail de outra pessoa em um formulário. A prova de verdade vem na autenticação."
                    },
                    {
                        "type": "text",
                        "value": "## Os três fatores de autenticação\n\nProvar quem você é sempre se apoia em pelo menos um destes três tipos de fator:\n\n- **Algo que você sabe**: uma senha, um PIN, a resposta de uma pergunta secreta.\n- **Algo que você tem**: o celular que recebe um código, um aplicativo autenticador, uma chave de segurança física.\n- **Algo que você é**: impressão digital, reconhecimento facial, outras biometrias.\n\nCada fator tem um jeito diferente de falhar ou ser roubado, e é justamente por isso que combinar mais de um fator deixa a autenticação bem mais forte."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fator\", \"Exemplo\", \"Principal risco\"], [\"Algo que você sabe\", \"Senha, PIN\", \"Pode vazar, ser adivinhada ou reutilizada em vários sites\"], [\"Algo que você tem\", \"Celular com aplicativo autenticador, chave física\", \"Pode ser perdido, roubado ou clonado\"], [\"Algo que você é\", \"Impressão digital, reconhecimento facial\", \"Não dá para trocar se vazar (você não troca de digital)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que combinar fatores: 2FA e MFA\n\nUsar um único fator (quase sempre a senha) significa que, se ela vazar, o jogo acabou: quem descobrir a senha vira você para o sistema. Por isso muitos serviços pedem um segundo fator depois da senha, ideia conhecida como **2FA** (autenticação de dois fatores) ou, de forma mais geral, **MFA** (autenticação multifator, quando são dois ou mais fatores).\n\nO detalhe importante é que os fatores precisam ser de categorias diferentes. Pedir a senha e, em seguida, pedir o nome do primeiro animal de estimação (outra coisa que você sabe) não é MFA de verdade, é só mais uma coisa que você sabe. MFA de verdade combina categorias diferentes: senha (algo que você sabe) mais código do celular (algo que você tem), por exemplo."
                    },
                    {
                        "type": "code",
                        "value": "// Passo 1: login com o primeiro fator (a senha)\nPOST /login HTTP/1.1\nHost: api.exemplo.com\nContent-Type: application/json\n\n{\"email\": \"joao@email.com\", \"senha\": \"minhaSenha123\"}\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\"mensagem\": \"Senha correta. Enviamos um código para o seu celular.\", \"exigeSegundoFator\": true}\n\n\n// Passo 2: confirmar o segundo fator (o código recebido no celular)\nPOST /login/verificar-codigo HTTP/1.1\nHost: api.exemplo.com\nContent-Type: application/json\n\n{\"email\": \"joao@email.com\", \"codigo\": \"482913\"}\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\"mensagem\": \"Login concluído com sucesso\"}"
                    },
                    {
                        "type": "text",
                        "value": "## Onde a identificação entra nisso tudo\n\nRepare que, nesse fluxo, a identificação (o e-mail) sozinha não prova nada. Ela só indica ao sistema qual conta checar. Em uma API, isso normalmente é o campo de e-mail ou nome de usuário enviado no formulário de login: ele diz ao servidor \"procure esse usuário\", mas quem prova que é você mesmo é a senha e, quando existir, o segundo fator."
                    },
                    {
                        "type": "quote",
                        "value": "Identificar é dizer quem você é. Autenticar é provar. E quanto mais fatores de categorias diferentes (algo que você sabe, tem e é) você combina para provar, mais difícil fica para outra pessoa se passar por você."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma pessoa digita o e-mail em uma tela de login, mas ainda não digitou a senha. Nesse momento, o que ela fez?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Se identificou, mas ainda não se autenticou.",
                                "isCorrect": true
                            },
                            {
                                "text": "Se autenticou por completo, sem precisar da senha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Foi autorizada a acessar qualquer área do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Provou quem é, porque o e-mail sozinho já basta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções a seguir é um exemplo do fator \"algo que você tem\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um aplicativo autenticador no celular, que gera códigos que mudam sozinhos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma senha memorizada, escolhida e guardada apenas na cabeça do próprio usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma impressão digital, lida por um sensor biométrico embutido no aparelho.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome de usuário cadastrado, que serve apenas para identificar qual é a conta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema pede a senha do usuário e, em seguida, pede a resposta de uma pergunta secreta (o nome do primeiro animal de estimação). O sistema afirma que isso é autenticação de dois fatores. Essa afirmação está correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não, porque as duas são \"algo que você sabe\"; MFA de verdade exige categorias diferentes de fator.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque qualquer segunda pergunta depois da senha já conta como um fator adicional de segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque a resposta sobre o animal de estimação é considerada um dado biométrico do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque MFA de verdade só é reconhecido quando pelo menos um dos fatores é biometria.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa perde o celular que usava para receber códigos de autenticação. Isso representa um risco relacionado a qual fator de autenticação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Algo que você tem, pois depende de um objeto físico que pode ser perdido ou roubado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Algo que você sabe, já que o código recebido por SMS é só uma informação para memorizar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Algo que você é, já que o aparelho perdido reconhece a digital cadastrada do dono.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum risco relevante, porque códigos enviados por SMS nunca chegam a ser interceptados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um atacante descobre a senha de uma vítima (por vazamento em outro site, por exemplo) e consegue fazer login normalmente, com e-mail e senha corretos. O sistema não exige nenhum segundo fator. Do ponto de vista de autenticação, por que isso é um problema mesmo o login tendo sido \"bem-sucedido\"?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque autenticação de um único fator não distingue o dono real de quem só descobriu a senha vazada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não é um problema, porque uma senha correta é sempre prova suficiente de que é o dono legítimo da conta.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um problema de autorização, e não de autenticação, já que a senha enviada realmente era a correta.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um problema de identificação, porque o e-mail usado no login não pertencia ao atacante de verdade.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O problema do HTTP sem estado",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O problema do HTTP sem estado\n\nToda vez que um cliente (o navegador, um app, ou qualquer outro programa) faz uma requisição HTTP para uma API, essa requisição chega ao servidor sozinha, sem nenhuma lembrança do que aconteceu antes. É isso que chamamos de **HTTP stateless** (sem estado): o protocolo não guarda, por conta própria, nenhuma informação de uma requisição para a próxima.\n\nIsso é um problema enorme para autenticação. Imagine que o usuário acabou de fazer login com sucesso em uma requisição. Na requisição seguinte, pedindo para ver o próprio perfil, o servidor não tem ideia de quem fez aquele login. Para o HTTP, são duas requisições completamente desconectadas."
                    },
                    {
                        "type": "code",
                        "value": "// Requisição 1: login\nPOST /login HTTP/1.1\nHost: api.exemplo.com\nContent-Type: application/json\n\n{\"email\": \"joao@email.com\", \"senha\": \"minhaSenha123\"}\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\"mensagem\": \"Login realizado com sucesso\"}\n\n\n// Requisição 2: pedir os dados do próprio perfil, logo em seguida\nGET /perfil HTTP/1.1\nHost: api.exemplo.com\n\nHTTP/1.1 401 Unauthorized\nContent-Type: application/json\n\n{\"erro\": \"Quem é você? Essa requisição não trouxe nenhuma informação de login.\"}"
                    },
                    {
                        "type": "text",
                        "value": "## Por que o servidor \"esquece\"\n\nO servidor esquece porque, por padrão, o HTTP não guarda nada de uma requisição para a outra. Cada requisição chega com seus próprios headers e seu próprio corpo, e é tratada de forma isolada. Se o código do servidor não fizer nada a mais, a segunda requisição do exemplo acima não tem como saber que a primeira aconteceu, mesmo vindo do mesmo navegador um segundo depois.\n\nEsse comportamento não é um defeito do HTTP, é assim que o protocolo foi desenhado desde o início: cada requisição deveria carregar tudo o que o servidor precisa para respondê-la, sem depender de um histórico guardado."
                    },
                    {
                        "type": "text",
                        "value": "## Uma analogia: o atendente sem memória\n\nPense em um atendente que, a cada pergunta que você faz, esquece completamente a conversa anterior. Você diz \"meu nome é João\" e ele responde. Na pergunta seguinte, ele não lembra que você é o João, porque para ele cada pergunta é a primeira que você já fez. Se você quiser que ele saiba quem você é, vai ter que repetir \"meu nome é João\" antes de cada pergunta nova.\n\nÉ exatamente esse o comportamento padrão de uma API HTTP: sem algum mecanismo extra, o servidor trata cada requisição como se fosse a primeira vez que aquele cliente aparece."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"HTTP puro, sem mecanismo extra\", \"Com um mecanismo de login\"], [\"O que o servidor sabe na requisição 2\", \"Nada sobre a requisição 1\", \"Quem fez login na requisição 1\"], [\"Quem precisa lembrar do login\", \"Ninguém, a informação se perde\", \"O servidor (sessão) ou o próprio cliente (token)\"], [\"Exemplo\", \"GET /perfil sem nenhum dado extra\", \"GET /perfil com cookie de sessão ou header Authorization\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O problema central desta trilha\n\nEsse \"esquecimento\" é o problema que toda a trilha resolve. Se cada requisição é isolada, autenticar o usuário uma única vez não basta: é preciso um jeito de a requisição seguinte provar que aquele login já aconteceu. Existem duas famílias de solução, que você vai ver em detalhe nos próximos módulos:\n\n- Guardar um estado no servidor (**sessão**) e entregar ao cliente apenas uma referência a esse estado, geralmente um id em um cookie.\n- Não guardar nada no servidor e enviar, a cada requisição, uma prova assinada de quem é o usuário (um **token**, como o JWT).\n\nAs duas resolvem o mesmo problema de jeitos diferentes, e você vai construir as duas ao longo da trilha."
                    },
                    {
                        "type": "quote",
                        "value": "HTTP não lembra de nada entre uma requisição e outra. Boa parte da engenharia de autenticação de uma API existe para contornar esse esquecimento, seja guardando estado no servidor, seja enviando uma prova a cada requisição."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que o HTTP é \"stateless\" (sem estado)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que cada requisição é tratada de forma independente, sem memória da requisição anterior.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o HTTP nunca permite enviar nenhum dado dentro do corpo de uma requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o servidor guarda para sempre o histórico de todas as requisições de cada cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o HTTP só serve para páginas estáticas, sem suporte a login algum.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário faz login com sucesso em uma API que ainda não implementa nenhum mecanismo de sessão ou token. Na requisição seguinte, pedindo os dados do próprio perfil, o que deve acontecer, considerando apenas o comportamento padrão do HTTP?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O servidor não reconhece o usuário, pois a nova requisição não carrega dado nenhum do login anterior.",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor vai lembrar automaticamente do login, já que as requisições vieram do mesmo navegador.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor vai negar a requisição por falta de autorização, presumindo que o usuário não é admin.",
                                "isCorrect": false
                            },
                            {
                                "text": "O HTTP guarda automaticamente, por padrão, o histórico de login de cada cliente por 24 horas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor iniciante implementou o login de uma API e ficou surpreso ao ver que, mesmo depois de um login bem-sucedido, a rota GET /perfil continuava respondendo como se o usuário não estivesse logado. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Falta implementar sessão ou token; sem isso, o servidor não sabe quem fez login antes.",
                                "isCorrect": true
                            },
                            {
                                "text": "O HTTP está com algum defeito, já que deveria lembrar sozinho de quem fez login.",
                                "isCorrect": false
                            },
                            {
                                "text": "A senha do usuário estava incorreta nessa segunda tentativa de acessar o perfil.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor está com a autorização mal configurada especificamente para a rota /perfil.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o comportamento sem estado do HTTP costuma ser descrito como uma característica de design do protocolo, e não como um defeito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o HTTP foi desenhado para que cada requisição já traga tudo que o servidor precisa para respondê-la.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque, na prática, todo navegador guarda a sessão automaticamente, então o problema nunca chega a aparecer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o HTTP só é usado hoje em sistemas antigos, que nunca chegaram a precisar de autenticação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque servidores modernos sempre lembram de tudo por padrão, o que torna essa característica irrelevante.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas equipes resolvem o problema do HTTP sem estado de formas diferentes: a equipe A guarda no servidor quem está logado e entrega ao cliente apenas uma referência a essa informação; a equipe B não guarda nada no servidor e faz o cliente enviar, a cada requisição, uma prova assinada de quem ele é. O que essas duas abordagens têm em comum?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As duas dão um jeito de a requisição seguinte \"lembrar\" o login que o HTTP esquece.",
                                "isCorrect": true
                            },
                            {
                                "text": "As duas eliminam de vez qualquer necessidade de autenticação em requisições futuras.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas fazem o HTTP deixar de ser stateless, mudando o funcionamento do protocolo.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas são, no fundo, exatamente a mesma técnica de autenticação, com outro nome.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Por que não mandar a senha em toda requisição",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que não mandar a senha em toda requisição\n\nSe o problema é que o servidor esquece quem fez login a cada requisição, a solução mais simples que vem à cabeça é: manda o e-mail e a senha de novo em toda requisição. Assim o servidor não precisa lembrar de nada, só confere a senha toda vez.\n\nEssa ideia existe de verdade e até tem nome: **HTTP Basic Authentication**. O cliente envia um header `Authorization` com o usuário e a senha, codificados em Base64, em toda requisição."
                    },
                    {
                        "type": "code",
                        "value": "// Header Authorization no esquema Basic\n// \"joao@email.com:minhaSenha123\" convertido para Base64\nGET /perfil HTTP/1.1\nHost: api.exemplo.com\nAuthorization: Basic am9hb0BlbWFpbC5jb206bWluaGFTZW5oYTEyMw==\n\n\n// Base64 não é criptografia, é apenas uma codificação reversível.\n// Qualquer um consegue decodificar, inclusive com uma linha de Node.js:\nBuffer.from('am9hb0BlbWFpbC5jb206bWluaGFTZW5oYTEyMw==', 'base64').toString()\n// resultado: 'joao@email.com:minhaSenha123'"
                    },
                    {
                        "type": "text",
                        "value": "## Problema 1: a senha viaja o tempo todo\n\nCom HTTP Basic (ou qualquer variação da mesma ideia), a senha em texto puro, apenas disfarçada em Base64, trafega em toda única requisição, para toda rota, durante todo o tempo em que o usuário usa o sistema. Isso multiplica as chances de a senha vazar: em um log mal configurado que grava headers, em uma ferramenta de proxy no meio do caminho, em qualquer ponto da rede capaz de inspecionar a requisição. Quanto mais vezes um segredo trafega, maior a superfície de risco."
                    },
                    {
                        "type": "text",
                        "value": "## Problema 2: não existe como deslogar\n\nSe a prova de identidade é sempre a própria senha, não existe um jeito de \"desligar\" um acesso específico sem trocar a senha inteira. Pense em alguém que fez login no computador de uma lan house e esqueceu de sair: com a abordagem de mandar a senha toda vez, não existe um botão de sair que realmente revogue aquele acesso, porque não existe nenhum estado de sessão para revogar. A única saída é trocar a senha, o que derruba o acesso em todos os lugares, não só naquele computador."
                    },
                    {
                        "type": "text",
                        "value": "## Problema 3: verificar a senha é caro (de propósito)\n\nVocê vai ver no próximo módulo que uma senha bem guardada usa um hash lento de propósito, como o bcrypt, especificamente para dificultar ataques de força bruta. Isso é ótimo para segurança, mas péssimo para performance se a verificação acontecer em toda requisição: um algoritmo lento por design, rodando em cada `GET`, `POST` e `PUT` da API, encareceria o tempo de resposta e o custo do servidor rapidamente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Mandar a senha em toda requisição\", \"Autenticar uma vez e reaproveitar depois\"], [\"Quantas vezes a senha trafega\", \"Em toda requisição\", \"Só uma vez, no momento do login\"], [\"Dá para deslogar um acesso específico\", \"Não, só trocando a senha inteira\", \"Sim, revogando a sessão ou o token\"], [\"Custo de verificar em cada requisição\", \"Alto (hash lento repetido sempre)\", \"Baixo (só confere um token ou id de sessão)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Mandar a senha em toda requisição até resolve o esquecimento do HTTP, mas cria três problemas piores: a senha vira um segredo viajando o tempo inteiro, não existe como deslogar de verdade, e verificar a senha em toda chamada sai caro. É por isso que sessão e token existem."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que mandar o usuário e a senha em toda requisição é considerado uma má prática?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque a senha passa a trafegar sempre, sem permitir logout real nem verificação barata.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o protocolo HTTP não permite, em nenhuma hipótese, enviar credenciais numa requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque reenviar a senha sempre a deixa automaticamente mais forte contra ataques.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque essa prática nunca chegou a ser usada de verdade fora de exemplos teóricos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No HTTP Basic Authentication, como a senha é enviada dentro do header Authorization?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Codificada em Base64, que não é criptografia e qualquer pessoa consegue reverter.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criptografada com uma chave secreta que pertence só ao servidor que recebe o login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transformada em um hash com bcrypt antes mesmo de sair do navegador do cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A senha em si nunca chega a ser enviada, apenas um token já derivado dela antes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa faz login em um computador público, em um sistema que manda usuário e senha em toda requisição (sem sessão nem token). Ao terminar de usar o sistema, ela quer garantir que ninguém mais consiga usar aquele acesso pelo mesmo computador. O que ela precisa fazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar a senha, pois não existe sessão nenhuma para revogar só aquele acesso específico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Clicar em um botão de logout, que revoga especificamente apenas aquele acesso usado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não precisa fazer nada, porque esse esquema expira sozinho ao fechar o navegador usado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esperar 24 horas, que é o tempo padrão de expiração de qualquer sessão em HTTP.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API guarda as senhas com bcrypt (um hash lento de propósito) e, por decisão de arquitetura, resolve reenviar e reconferir a senha em toda requisição, em vez de usar sessão ou token. Qual é a consequência mais provável disso, em uma API com muitas requisições por segundo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O tempo de resposta tende a subir bastante, pois um hash lento seria recalculado em toda requisição.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma consequência relevante, já que o bcrypt é rápido o bastante para qualquer volume de tráfego.",
                                "isCorrect": false
                            },
                            {
                                "text": "A API fica mais segura, e isso acontece sem nenhum custo adicional de performance no servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "O bcrypt para de funcionar corretamente depois de muitas verificações seguidas em pouco tempo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sessões e tokens resolvem os problemas de mandar a senha em toda requisição. Qual alternativa explica melhor o mecanismo por trás dessa solução?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O cliente passa a apresentar uma prova (sessão ou token) no lugar da senha, permitindo revogar e conferir barato.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sessões e tokens eliminam por completo a necessidade de autenticação, pois o login passa a valer para sempre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sessões e tokens criptografam a própria senha de um jeito que permite reenviá-la com segurança a toda requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sessões e tokens fazem o HTTP deixar de ser stateless, e assim o servidor lembra sozinho de cada cliente que chega.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O mapa da autenticação: da senha ao login social",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O mapa da autenticação: da senha ao login social\n\nNas aulas anteriores você viu que autenticação e autorização são perguntas diferentes, que existem fatores diferentes para provar identidade, e que o HTTP sem estado obriga a inventar um jeito de o servidor \"lembrar\" quem fez login, sem cair na armadilha de mandar a senha toda hora. Esta última aula do módulo é um mapa: para onde essa trilha vai a partir daqui."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\", \"Pergunta que resolve\", \"Onde fica na trilha\"], [\"Senha\", \"Como guardar a senha do jeito certo, sem expor o usuário se o banco vazar?\", \"Módulo 2\"], [\"Sessão e token\", \"Como o servidor lembra quem fez login, sem mandar a senha de novo?\", \"Módulos 3 e 4\"], [\"Login de ponta a ponta\", \"Como juntar tudo isso em uma API real, em Express?\", \"Módulo 5\"], [\"Papéis e permissões\", \"Já sabendo quem é o usuário, o que ele pode fazer?\", \"Módulo 6\"], [\"OAuth e login social\", \"Como deixar o usuário entrar com a conta do Google ou do GitHub?\", \"Módulo 7\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Senha, sessão/token e papéis, em uma frase cada\n\n- **Senha (módulo 2)**: a base de tudo. Se a senha for guardada errado, o resto da segurança perde o sentido. Você vai aprender a guardar senha com hash lento (bcrypt), nunca em texto puro e nunca com um hash rápido como MD5 ou SHA-256 puro.\n- **Sessão e token (módulos 3 e 4)**: as duas formas de resolver o esquecimento do HTTP sem voltar a mandar a senha toda hora. A sessão guarda estado no servidor; o token, como o JWT, carrega uma prova assinada que o próprio cliente guarda e reenvia.\n- **Papéis e permissões (módulo 6)**: depois de saber quem é o usuário, decidir o que ele pode fazer, como distinguir um admin de um usuário comum.\n- **OAuth e login social (módulo 7)**: delegar a autenticação para o Google ou o GitHub, em vez de o seu sistema guardar a senha desse usuário."
                    },
                    {
                        "type": "code",
                        "value": "// Um gostinho do que vem pela frente (módulos 4 e 5): uma rota protegida em Express\n// Por enquanto não se preocupe com os detalhes, é só para você ver onde a trilha chega\n\napp.get('/perfil', autenticar, (req, res) => {\n  // req.user foi preenchido pelo middleware \"autenticar\"\n  // depois de validar o token enviado no header Authorization\n  res.json({ nome: req.user.nome, email: req.user.email });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Como isso aparece na prática (inclusive aqui na plataforma)\n\nEsse mapa não é só teoria: é literalmente como a autenticação da ensina.dev funciona. As senhas são guardadas com hash, o login gera tokens JWT enviados no header `Authorization` no formato `Bearer`, existe um access token de vida curta e um refresh token de vida mais longa para renovar o acesso sem pedir a senha de novo, os usuários têm papéis (admin e aluno) que controlam o que cada um pode acessar, e também é possível entrar com GitHub ou Google, sem digitar senha nenhuma nesta plataforma. Cada um desses pontos vira uma aula futura desta trilha.\n\nSe você guardar só uma coisa deste módulo, guarde esta: autenticação e autorização são perguntas diferentes, o HTTP não ajuda a lembrar de nada sozinho, e mandar a senha toda hora é uma armadilha fácil de cair (mas fácil de evitar também). A partir do próximo módulo a trilha fica bem mais prática, com bcrypt, jsonwebtoken e Express de verdade: este módulo construiu o porquê, os próximos constroem o como."
                    },
                    {
                        "type": "quote",
                        "value": "Senha guardada direito, sessão ou token para lembrar do login, papéis para decidir o que cada um pode fazer, e OAuth para nem precisar guardar a senha de serviços de terceiros: esse é o mapa completo da autenticação que essa trilha constrói, peça por peça."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a ordem lógica em que essa trilha vai construir a autenticação de uma API, do problema mais básico ao mais avançado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Guardar a senha direito, depois sessão ou token, depois papéis, depois OAuth e login social.",
                                "isCorrect": true
                            },
                            {
                                "text": "OAuth primeiro, depois senha, depois sessão, já que login social é o mais simples de todos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Papéis e permissões primeiro, já que autorização importa mais do que autenticação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sessão e token primeiro, deixando a senha guardada como um detalhe só para o final.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo de uma rota protegida por um middleware chamado \"autenticar\", o que a rota espera encontrar em req.user depois que o middleware roda?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os dados do usuário identificado a partir do token validado, prontos para a rota usar.",
                                "isCorrect": true
                            },
                            {
                                "text": "A senha em texto puro do usuário, pronta para ser conferida dentro da própria rota.",
                                "isCorrect": false
                            },
                            {
                                "text": "A lista completa de todas as rotas que existem cadastradas na API.",
                                "isCorrect": false
                            },
                            {
                                "text": "O código-fonte completo do próprio middleware de autenticação usado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API já guarda as senhas dos usuários com bcrypt e emite um token no login, mas qualquer usuário autenticado consegue acessar rotas administrativas, mesmo sem ser administrador. Qual etapa do mapa desta trilha ainda está faltando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Papéis e permissões, pois autenticação e token já existem, mas falta checar permissões.",
                                "isCorrect": true
                            },
                            {
                                "text": "Senha guardada direito, já que o hash com bcrypt usado ainda não seria forte o bastante.",
                                "isCorrect": false
                            },
                            {
                                "text": "OAuth, porque somente login social seria capaz de resolver esse tipo de problema de acesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sessão, porque tokens jamais deveriam ser combinados com nenhum tipo de autorização.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma plataforma quer permitir login com a conta do Google, sem nunca armazenar nem visualizar a senha do Google do usuário. Qual etapa do mapa desta trilha resolve exatamente esse problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "OAuth e login social, que delegam a autenticação do usuário para o próprio Google.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sessão e cookie, guardando a senha do Google de forma criptografada no servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Hash de senha com bcrypt, aplicado diretamente à senha do Google antes de guardá-la.",
                                "isCorrect": false
                            },
                            {
                                "text": "Papéis e permissões, que decidem se a conta do Google pode autenticar o usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A ensina.dev usa um access token de vida curta e um refresh token de vida mais longa. Com base no que você aprendeu neste módulo sobre os riscos de expor a senha, qual é a principal vantagem de usar dois tokens em vez de um único token de vida longa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Limita o tempo útil de um token roubado: o access token expira rápido e o refresh renova o acesso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Elimina totalmente a necessidade de HTTPS, já que dois tokens bastam para proteger a comunicação toda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faz o HTTP deixar de ser stateless, porque agora existem dois tokens guardando o estado da conexão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui de vez a necessidade de hash de senha, já que os tokens sozinhos protegem a senha do usuário.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Senhas: o jeito certo de guardar",
        "aulas": [
            {
                "titulo": "Por que nunca guardar senha em texto puro",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que nunca guardar senha em texto puro\n\nImagina uma tabela `usuarios` bem simples: `id`, `email`, `senha`. No cadastro, o back-end recebe o que a pessoa digitou no formulário e grava esse valor direto na coluna `senha`. No login, ele compara o que veio no formulário com o que está guardado no banco. Funciona. E é exatamente o jeito errado de fazer isso.\n\nO problema não aparece no dia a dia do sistema funcionando normalmente. Ele aparece no dia em que alguém, de algum jeito, consegue ler essa tabela sem passar pela sua API: um backup mal configurado, uma injeção de SQL, uma cópia do banco de produção que foi parar num ambiente de teste menos protegido, um funcionário mal intencionado com acesso direto ao banco. Não importa qual foi a porta de entrada: se a senha está em texto puro, quem lê a tabela lê a senha de cada usuário, sem precisar quebrar absolutamente nada."
                    },
                    {
                        "type": "text",
                        "value": "## Vazamento não é hipótese, é histórico\n\nBancos de dados vazam com uma frequência desconfortável, e existem casos documentados que viraram referência exatamente por causa disso. Em 2009, o site RockYou sofreu uma invasão por injeção de SQL e expôs a base inteira de usuários (mais de 32 milhões de contas), com as senhas guardadas em texto puro. Não foi preciso quebrar hash nenhum: o atacante abriu a tabela e leu.\n\nEsse caso virou clássico de curso de segurança justamente por mostrar o cenário mais simples possível de vazamento: sem hash, sem salt, sem nenhuma barreira entre o banco e a senha real de cada pessoa. E o estrago não fica restrito àquele site."
                    },
                    {
                        "type": "code",
                        "value": "// ERRADO: isto é um exemplo do que NÃO fazer\n\nimport express from \"express\";\nimport { db } from \"../db.js\";\n\nconst router = express.Router();\n\nrouter.post(\"/cadastro\", async (req, res) => {\n  const { email, senha } = req.body;\n\n  // a senha que o usuário digitou vai pro banco exatamente como veio\n  const usuario = await db.query(\n    \"INSERT INTO usuarios (email, senha) VALUES ($1, $2) RETURNING id, email\",\n    [email, senha]\n  );\n\n  res.status(201).json(usuario.rows[0]);\n});\n\nexport default router;\n\n// se essa tabela vazar, toda senha de todo usuário vaza junto,\n// legível, sem nenhum esforço extra do atacante"
                    },
                    {
                        "type": "text",
                        "value": "## Uma senha vazada derruba mais de uma conta\n\nPraticamente ninguém usa uma senha diferente para cada serviço. É comum a mesma pessoa usar a mesma senha (ou uma variação previsível dela) no fórum onde ela mal entra, no email principal e no banco. Quando um site com segurança fraca vaza senhas em texto puro, um atacante não fica só com acesso àquele site: ele ganha uma lista pronta de \"email mais senha\" para testar em dezenas de outros serviços. Essa técnica de reaproveitar credenciais vazadas em outros lugares tem nome (credential stuffing) e a gente volta nela mais pra frente na trilha. Por enquanto, o ponto é este: guardar senha errado num sistema pequeno pode comprometer contas em sistemas completamente diferentes, só porque as pessoas repetem senha."
                    },
                    {
                        "type": "text",
                        "value": "## Então o que fazer?\n\nA regra é simples de enunciar: o banco de dados nunca deveria conter a senha real de ninguém. Nem mesmo você, como desenvolvedor do sistema, deveria conseguir abrir a tabela e descobrir a senha de um usuário. O que o banco guarda é o resultado de uma transformação da senha, feita de um jeito que não tem volta. Essa transformação se chama hash, e é o assunto da próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "Guardar senha em texto puro não é atalho, é uma aposta de que o banco nunca vai vazar. Mais cedo ou mais tarde, ele vaza."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma tabela `usuarios` guarda a senha exatamente como a pessoa digitou no cadastro, sem nenhuma transformação. Se esse banco de dados vazar, o que acontece?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Nada grave, porque o acesso ao banco de dados exige uma camada própria de autenticação, independente da tabela",
                                "isCorrect": false
                            },
                            {
                                "text": "Só as contas de administrador ficam expostas, porque são as únicas com privilégios elevados de acesso ao sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "Todos os usuários ficam com a senha exposta, pois o valor gravado já é a senha real",
                                "isCorrect": true
                            },
                            {
                                "text": "O atacante ainda precisa quebrar cada senha manualmente, uma por uma, num processo que pode levar anos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um vazamento de senhas em texto puro costuma prejudicar o usuário muito além daquele site específico?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque muita gente reutiliza a mesma senha, ou uma variação dela, em outros serviços",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o texto puro corrói fisicamente o disco onde o banco de dados é armazenado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o navegador passa a exibir avisos de perigo em todos os outros sites visitados",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque uma senha em texto puro ocupa um espaço muito maior no banco do que um hash",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor argumenta: \"não tem problema guardar a senha assim, só eu tenho acesso ao banco de produção\". Qual é o principal furo desse argumento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O argumento está certo, já que só um desenvolvedor com acesso direto representa risco real",
                                "isCorrect": false
                            },
                            {
                                "text": "Um banco pode vazar por outros caminhos, além do acesso do desenvolvedor, como backup exposto",
                                "isCorrect": true
                            },
                            {
                                "text": "Bancos de dados relacionais rejeitam colunas de texto longas, então a senha nunca chegaria a vazar inteira",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é apenas ético e contratual, sem nenhuma implicação técnica real para a segurança do sistema",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa rota de cadastro em Express, o valor que chega em `req.body.senha` vai direto para uma coluna `senha` no banco, sem nenhuma transformação. O que deveria acontecer com esse valor antes de ser gravado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nada, pois validar apenas o formato do email já garante a segurança do cadastro",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele deveria ser compactado antes de gravar, para ocupar menos espaço na tabela",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele deveria virar um hash antes de gravar, nunca a senha original",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele deveria ser convertido para maiúsculas, o que facilita a comparação no login",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um ataque só teve acesso a um backup antigo de um banco de dados, não ao banco de produção atual. As senhas nesse backup estavam em texto puro. Por que isso ainda é grave, mesmo o backup sendo antigo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não é grave, já que backups antigos deixam de valer como vazamento real de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Backups de banco de dados nunca incluem a tabela de usuários, apenas registros de configuração do sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "É grave apenas para as contas criadas no dia exato em que aquele backup foi gerado",
                                "isCorrect": false
                            },
                            {
                                "text": "Muitas pessoas não trocam de senha por anos, então a antiga tende a continuar válida hoje",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Hash x criptografia: mão única x reversível",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um hash\n\nUm hash é o resultado de uma função matemática que pega qualquer entrada (uma senha, um arquivo, um texto) e devolve uma saída de tamanho fixo, chamada de digest. A mesma entrada sempre produz a mesma saída, e mudar um único caractere da entrada muda completamente o resultado. Até aqui, nada assustador.\n\nA característica que importa para senha é outra: um hash é de mão única. Não existe operação de \"desfazer\" um hash para recuperar a entrada original. Dado só o resultado, não tem cálculo que devolva a senha que gerou aquele resultado. Você consegue gerar o hash de uma senha, mas não consegue pegar um hash pronto e abrir ele para ver a senha lá dentro."
                    },
                    {
                        "type": "text",
                        "value": "## O que é criptografia\n\nCriptografia é diferente: ela é reversível. Você criptografa um dado com uma chave, e existe uma operação inversa (descriptografar) que, com a chave certa, devolve o dado original exatamente como ele era. É assim que funciona, por exemplo, uma mensagem criptografada que o destinatário precisa conseguir ler depois, ou um arquivo protegido que alguém autorizado precisa conseguir abrir.\n\nA diferença central para o que a gente está estudando é essa: hash não tem chave e não tem volta; criptografia tem chave e tem volta."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Hash\",\"Criptografia\"],[\"Direção\",\"Mão única, não dá pra reverter\",\"Reversível, existe operação inversa\"],[\"Precisa de chave\",\"Não\",\"Sim, para criptografar e descriptografar\"],[\"Dá pra recuperar o valor original\",\"Nunca, só dá pra comparar resultados\",\"Sim, com a chave certa\"],[\"Uso correto para senha de login\",\"Sim\",\"Não\"],[\"Uso típico\",\"Checar integridade de um arquivo, comparar sem revelar\",\"Dado que alguém autorizado precisa ler de volta\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import { createHash } from \"node:crypto\";\n\nconst resultado = createHash(\"sha256\").update(\"minhaSenha123\").digest(\"hex\");\n\nconsole.log(resultado);\n// sempre a mesma saída pra mesma entrada, e não existe operação\n// que pegue esse resultado e devolva \"minhaSenha123\" de volta\n\n// (isto é só pra mostrar o que é um hash na prática; usar SHA-256\n// sozinho pra guardar senha é errado, o motivo é o assunto da próxima aula)"
                    },
                    {
                        "type": "text",
                        "value": "## Por isso senha usa hash\n\nPensa no que o login realmente precisa fazer: alguém digita uma senha, e o sistema precisa responder \"essa senha bate com a que foi cadastrada\" ou \"não bate\". Em nenhum momento o sistema precisa olhar a senha original de novo, ele só precisa comparar.\n\nÉ exatamente isso que o hash resolve: você guarda o hash da senha no cadastro, e no login gera o hash do que a pessoa digitou e compara os dois hashes. Se um sistema criptografa a senha em vez de gerar hash, ele está guardando algo que pode ser revertido para a senha real, sem nenhuma necessidade de fazer isso. E isso vira um risco enorme: quem tiver acesso à chave de descriptografia (por um bug, um funcionário mal intencionado, uma configuração errada) consegue ver a senha de qualquer usuário, mesmo anos depois do cadastro."
                    },
                    {
                        "type": "quote",
                        "value": "Hash não guarda a senha escondida, ele descarta a senha original e guarda só uma prova de que alguém sabia ela. Criptografia guarda a senha, só que trancada, e trancada ainda quer dizer recuperável."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal diferença entre hash e criptografia?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Hash é sempre mais lento de calcular do que criptografia, e essa seria a única diferença",
                                "isCorrect": false
                            },
                            {
                                "text": "Hash é de mão única e não pode ser revertido; criptografia é reversível com uma chave",
                                "isCorrect": true
                            },
                            {
                                "text": "Criptografia só serve para arquivos; hash só serve para senhas, cada um no seu domínio",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe diferença real entre as duas, são apenas dois nomes para a mesma técnica",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a senha de um usuário deve ser guardada como hash, e não com criptografia reversível?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque hash ocupa sempre menos espaço em disco do que qualquer forma de criptografia",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque usar criptografia para senha é proibido pela maioria das linguagens de programação",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o sistema nunca precisa recuperar a senha original, só confirmar se ela confere",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque hash é sempre mais rápido de calcular do que qualquer algoritmo de criptografia",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema criptografa a senha do usuário com uma chave secreta guardada no próprio servidor, em vez de gerar um hash. Qual é o risco direto dessa escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum risco relevante, desde que a chave secreta tenha um tamanho suficientemente grande",
                                "isCorrect": false
                            },
                            {
                                "text": "Quem tiver acesso à chave consegue descriptografar e ver a senha real de qualquer usuário",
                                "isCorrect": true
                            },
                            {
                                "text": "O login fica um pouco mais lento, mas isso não traz nenhum risco adicional de segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "Bancos de dados relacionais rejeitam automaticamente qualquer coluna com dados criptografados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em qual situação faz sentido usar criptografia reversível em vez de hash?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quando o próprio sistema precisa reler o valor original depois, como o texto de uma mensagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Quando se quer guardar a senha de login de um jeito ainda mais seguro e sofisticado do que com hash",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o dado guardado é pequeno, como um CEP, que dispensa qualquer proteção extra",
                                "isCorrect": false
                            },
                            {
                                "text": "Nunca, porque hash deveria substituir totalmente a criptografia em qualquer situação existente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa decide criptografar as senhas dos usuários, em vez de gerar hash, usando a mesma chave para todas as contas. Um atacante rouba o banco de dados, mas não consegue a chave nesse primeiro momento. Por que essa escolha ainda é mais arriscada do que usar hash com salt?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque dados criptografados ocupam sempre mais espaço em disco, o que sobrecarrega o banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a criptografia pode ser revertida, bastando a chave vazar algum dia no futuro",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque bancos de dados relacionais não aceitam, em nenhuma hipótese, colunas com valores criptografados",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque criptografar consome tanto processamento que a API de cadastro se torna inviável na prática",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Por que MD5 e SHA são rápidos demais para senha",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## MD5 e SHA também são hash, então por que não usar?\n\nDepois da última aula, faz sentido pensar: \"MD5 e SHA-256 são funções de hash de mão única, então servem para senha\". E, tecnicamente, dá pra calcular `sha256(senha)` e guardar o resultado. O problema não está na direção mão única, está em outra propriedade dessas funções: elas foram desenhadas para ser rápidas.\n\nRápido é uma qualidade ótima quando o hash serve para conferir a integridade de um arquivo baixado, validar um commit do Git ou compor uma assinatura digital. Nesses casos, você quer processar arquivos grandes sem demora perceptível. Para senha, essa mesma velocidade vira o problema inteiro."
                    },
                    {
                        "type": "text",
                        "value": "## O que um atacante faz com um hash rápido\n\nQuando um banco de senhas vaza, o atacante não recupera a senha \"desfazendo\" o hash (isso não existe, como você viu na aula passada). Ele faz o caminho contrário: pega uma lista enorme de senhas candidatas (as mais comuns, listas de vazamentos anteriores, combinações prováveis), calcula o hash de cada uma com o mesmo algoritmo, e compara com o hash vazado. Quando bate, ele achou a senha.\n\nO que torna esse ataque viável em escala é a velocidade do algoritmo. Hardware comum hoje, como uma boa placa de vídeo, calcula bilhões de hashes MD5 por segundo, e de centenas de milhões a bilhões de hashes SHA-256 por segundo. Com esse volume, um atacante testa listas de dicionário inteiras, e boa parte do espaço de senhas curtas, em muito pouco tempo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Hash rápido (MD5, SHA-1, SHA-256)\",\"Hash de senha (bcrypt, scrypt, argon2)\"],[\"Objetivo original\",\"Integridade de arquivo, assinatura digital, checksum\",\"Guardar senha resistindo a tentativa e erro\"],[\"Velocidade\",\"Extremamente rápida, de propósito\",\"Lenta, de propósito e ajustável\"],[\"Custo de uma tentativa para o atacante\",\"Baixíssimo, testa bilhões por segundo\",\"Alto, cada tentativa consome tempo real\"],[\"Serve para hash de senha\",\"Não\",\"Sim\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// isto é o raciocínio de um ATACANTE contra um hash rápido\n// (não é algo que você implementa no seu sistema)\n\nimport { createHash } from \"node:crypto\";\n\nfunction sha256(txt) {\n  return createHash(\"sha256\").update(txt).digest(\"hex\");\n}\n\nconst hashVazado = obterHashDoBancoVazado(); // veio de um vazamento\n\nconst candidatos = [\"123456\", \"senha123\", \"admin\", \"qwerty\" /* e mais alguns milhões */];\n\nfor (const candidato of candidatos) {\n  if (sha256(candidato) === hashVazado) {\n    console.log(\"senha encontrada:\", candidato);\n    break;\n  }\n}\n\n// com hardware comum, um laço como esse testa bilhões de candidatos\n// por segundo quando o hash usado é rápido, como SHA-256 ou MD5"
                    },
                    {
                        "type": "text",
                        "value": "## A lição não é \"nunca use SHA-256\", é \"use no lugar certo\"\n\nSHA-256 continua sendo uma escolha excelente para o que ele foi feito: gerar o checksum de um arquivo baixado, verificar se um download não foi corrompido, compor a assinatura de um commit. Nesses casos você quer velocidade, e não existe um atacante testando bilhões de arquivos por segundo para se preocupar.\n\nPara senha, o raciocínio se inverte por completo: você quer que cada tentativa de adivinhação custe caro, de propósito. É exatamente esse o problema que salt e os algoritmos feitos para senha resolvem, um de cada vez, nas próximas aulas."
                    },
                    {
                        "type": "quote",
                        "value": "Rápido é ótimo para conferir um arquivo. Para senha, rápido é exatamente o que dá ao atacante bilhões de chances por segundo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que MD5 e SHA-256, usados sozinhos, são uma má escolha para hash de senha?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque, na prática, essas funções não são realmente de mão única, como muita gente afirma",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque geram uma saída de tamanho variável, o que dificulta o armazenamento numa coluna do banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque não existem, em nenhuma linguagem popular, bibliotecas prontas para esses algoritmos de hash",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque foram projetados para calcular rápido, o que ajuda a testar bilhões de senhas por segundo",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Para qual finalidade o SHA-256 continua sendo uma ótima escolha?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Para verificar a integridade de um arquivo baixado, confirmando que ele não foi alterado",
                                "isCorrect": true
                            },
                            {
                                "text": "Para guardar a senha de login de um usuário, já que o hash sozinho já garante proteção",
                                "isCorrect": false
                            },
                            {
                                "text": "Para guardar a senha de acesso ao banco de produção, dispensando qualquer outra camada",
                                "isCorrect": false
                            },
                            {
                                "text": "Para guardar qualquer segredo que precise ser recuperado depois, como um número de cartão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um banco de dados vazado guarda os hashes SHA-256 das senhas dos usuários, sem nenhuma outra proteção. Por que um atacante consegue, na prática, recuperar boa parte das senhas originais em pouco tempo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o SHA-256 é reversível, bastando aplicar a chave de decodificação certa ao resultado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque hardware comum hoje calcula um volume enorme de hashes por segundo",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o SHA-256 sempre gera exatamente o mesmo resultado para senhas diferentes entre si",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque, por padrão, todo banco de dados guarda a senha original logo ao lado do hash salvo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual opção descreve corretamente a diferença de propósito entre um hash de arquivo (como um checksum SHA-256) e um hash de senha (como bcrypt)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O hash de arquivo precisa ser rápido, para grandes volumes; o de senha, lento de propósito",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois compartilham exatamente o mesmo objetivo e podem ser usados de forma totalmente intercambiável",
                                "isCorrect": false
                            },
                            {
                                "text": "O hash de arquivo depende de salt para funcionar; o hash de senha dispensa esse cuidado",
                                "isCorrect": false
                            },
                            {
                                "text": "O hash de senha precisa ser reversível, para que o suporte técnico recupere a senha quando pedido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Mesmo usando um salt único por usuário, ainda seria arriscado escolher SHA-256 (salt mais senha) como hash de senha, em vez de bcrypt. Por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque salt só é compatível com a família MD5, nunca funcionando junto com algoritmos SHA",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o SHA-256 com salt gera um resultado maior do que qualquer coluna de banco suporta",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o SHA-256 continua rápido, e o salt não barra bilhões de tentativas por segundo",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque adicionar salt transforma o SHA-256 num algoritmo de criptografia totalmente reversível",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Salt e o fim das rainbow tables",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é salt\n\nSalt é um valor aleatório, gerado para cada usuário, que entra na conta junto com a senha antes de calcular o hash. Em vez de guardar `hash(senha)`, o sistema guarda algo equivalente a `hash(salt + senha)`, com um salt diferente para cada conta cadastrada.\n\nParece um detalhe pequeno, mas ele resolve dois problemas sérios que existem quando você faz hash só da senha, sem mais nada."
                    },
                    {
                        "type": "text",
                        "value": "## Problema 1: senha igual, hash igual\n\nSem salt, duas pessoas que escolhem a mesma senha (e \"123456\" continua sendo uma escolha comum) acabam com o mesmo hash guardado no banco. Isso já é informação valiosa vazando: quem olha a tabela consegue ver quais contas compartilham senha, sem nem precisar quebrar hash nenhum. E pior, quebrar aquele hash uma única vez destrava todas as contas que o compartilham, de uma vez só.\n\n## Problema 2: rainbow table\n\nRainbow table é uma tabela pré-computada que liga senhas comuns aos seus hashes correspondentes, calculada uma única vez e reaproveitada contra qualquer banco vazado que não use salt. Em vez de calcular hash na hora do ataque, o atacante só consulta a tabela pronta: é praticamente instantâneo. Como o hash de \"123456\" sem salt é sempre o mesmo, em qualquer sistema, a mesma tabela pré-computada serve para atacar qualquer vazamento por aí.\n\nUm salt único por usuário quebra essa conta: o hash guardado deixa de ser `hash(senha)` e passa a ser `hash(salt + senha)`, com o salt mudando a cada conta. Para uma rainbow table continuar funcionando, o atacante precisaria de uma tabela pré-computada diferente para cada salt, ou seja, para cada usuário. Isso torna o ataque impraticável em qualquer escala."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\",\"Sem salt\",\"Com salt único por usuário\"],[\"Duas contas com a senha \\\"123456\\\"\",\"Hashes idênticos, dá pra notar de cara quem repete senha\",\"Hashes diferentes entre si\"],[\"Ataque de rainbow table\",\"Uma tabela pré-computada ataca o banco inteiro de uma vez\",\"Precisaria de uma tabela por salt, o que inviabiliza o ataque\"],[\"Onde o salt fica guardado\",\"Não existe\",\"Junto com o hash, no mesmo registro\"],[\"Quem gera o salt\",\"Ninguém\",\"O próprio sistema, de forma aleatória, a cada cadastro\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O salt não é secreto\n\nUm detalhe que costuma confundir: o salt não precisa (e normalmente não deveria) ser escondido. Ele fica guardado ao lado do próprio hash, muitas vezes dentro da mesma string, sem nenhum tipo de proteção especial. O trabalho do salt não é ser um segredo, é garantir que a mesma senha, em contas diferentes, produza hashes diferentes. Ele cumpre esse papel só por ser único, não por ser secreto."
                    },
                    {
                        "type": "code",
                        "value": "// isto é só pra entender a IDEIA por trás do salt.\n// na prática, quem gera e aplica o salt é o próprio bcrypt (próxima aula),\n// você não implementa essa parte na mão.\n\nfunction hashComSalt(senha, salt) {\n  return hashDeMaoUnica(salt + senha);\n}\n\nconst saltDoUsuarioA = gerarSaltAleatorio();\nconst saltDoUsuarioB = gerarSaltAleatorio();\n\nhashComSalt(\"123456\", saltDoUsuarioA); // um resultado\nhashComSalt(\"123456\", saltDoUsuarioB); // resultado diferente, mesma senha \"123456\""
                    },
                    {
                        "type": "quote",
                        "value": "O salt não esconde nada, ele garante que a mesma senha nunca produza o mesmo hash duas vezes. Isso sozinho já derruba as rainbow tables."
                    }
                ],
                "questions": [
                    {
                        "statement": "Para que serve o salt no hash de uma senha?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É uma segunda senha que o usuário precisa memorizar, além da principal, por segurança extra do sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "É o nome dado à tabela do banco de dados onde as senhas ficam efetivamente guardadas",
                                "isCorrect": false
                            },
                            {
                                "text": "É um valor aleatório, único por usuário, somado à senha antes do hash, para evitar repetição",
                                "isCorrect": true
                            },
                            {
                                "text": "É uma técnica que torna o hash reversível, permitindo recuperar a senha original se pedido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sem salt, dois usuários que escolhem a mesma senha (por exemplo, \"123456\") terão:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Hashes completamente diferentes entre si, mesmo com a senha sendo idêntica nos dois casos",
                                "isCorrect": false
                            },
                            {
                                "text": "Suas senhas trocadas automaticamente pelo sistema, como medida preventiva de segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "O mesmo hash gravado no banco, uma pista imediata de que as duas contas compartilham senha",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro no cadastro, já que o banco rejeita automaticamente senhas repetidas entre usuários",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é uma rainbow table, e por que um salt único por usuário praticamente inutiliza esse tipo de ataque?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É uma lista de emails vazados publicamente, sem nenhuma relação real com o funcionamento do salt",
                                "isCorrect": false
                            },
                            {
                                "text": "É um tipo de ataque que atinge apenas bancos de dados NoSQL, sem nenhuma relação real com hash",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma técnica de criptografia reversível, pensada para substituir completamente o uso de hash",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma tabela pré-computada de senhas e hashes; com salt, precisaria de uma por usuário",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O salt de uma senha precisa ser mantido em segredo, separado do hash, para cumprir sua função?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, o vazamento do salt junto ao hash reativa totalmente o ataque de rainbow table",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, o salt fica junto ao hash; sua função é garantir unicidade entre contas, não sigilo",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, o salt deveria existir apenas na memória do servidor, e nunca ser gravado em disco",
                                "isCorrect": false
                            },
                            {
                                "text": "Essa preocupação não existe: o salt é sempre igual para todos os usuários de um mesmo sistema",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe implementa hash de senha assim: `sha256(senha + salt)`, com um salt aleatório de 16 bytes, único por usuário, guardado ao lado do hash no banco. Isso já resolve o problema de rainbow table. O que ainda falta para essa solução ser considerada adequada para senhas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nada, com salt aleatório e único por usuário essa solução já seria totalmente equivalente ao bcrypt",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltaria criptografar o resultado do SHA-256 com uma segunda chave, guardada em local separado",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltaria trocar o SHA-256 por um algoritmo lento e ajustável, como bcrypt ou argon2",
                                "isCorrect": true
                            },
                            {
                                "text": "Faltaria reduzir o salt para apenas 4 bytes, já que 16 bytes deixa o cálculo do hash lento demais",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "bcrypt na prática: hash no cadastro, compare no login",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## bcrypt: hash lento de propósito\n\nAs duas aulas anteriores chegaram numa conclusão: hash de senha precisa ser lento, e precisa de salt. Escrever isso na mão, do zero, é terreno perigoso (criptografia caseira quase sempre tem furo que só aparece depois, quando já é tarde). Para isso existem algoritmos prontos, testados por anos, feitos especificamente para senha. Os mais usados hoje são bcrypt, scrypt e argon2 (esse último, na variante argon2id, é frequentemente recomendado como padrão em sistemas novos). Na prática, os três resolvem o mesmo problema: são deliberadamente lentos, com um custo que pode ser ajustado conforme o hardware fica mais rápido, e cuidam do salt sozinhos, sem que você precise gerar ou combinar nada manualmente.\n\nEste módulo usa bcrypt porque é o mais estabelecido no ecossistema Node e o que você vai encontrar com mais frequência em projetos reais em JavaScript e TypeScript."
                    },
                    {
                        "type": "text",
                        "value": "## O custo ajustável (salt rounds)\n\nQuando você chama `bcrypt.hash`, além da senha, você passa um número de rounds (também chamado de work factor, ou custo). Cada round a mais dobra aproximadamente o tempo de cálculo. Valores comuns em projetos Node ficam entre 10 e 12: caro o suficiente para desanimar um ataque de força bruta, barato o suficiente para não travar o cadastro ou o login do usuário legítimo, que só faz aquele cálculo uma vez.\n\nEsse número fica embutido no próprio resultado do bcrypt. Se daqui a alguns anos o hardware ficar mais rápido, novos cadastros podem simplesmente usar um número maior de rounds, sem quebrar a comparação dos hashes antigos."
                    },
                    {
                        "type": "code",
                        "value": "import bcrypt from \"bcrypt\";\nimport express from \"express\";\nimport { db } from \"../db.js\";\n\nconst router = express.Router();\nconst BCRYPT_COST = 10;\n\nrouter.post(\"/cadastro\", async (req, res) => {\n  const { email, senha } = req.body;\n\n  const senhaHash = await bcrypt.hash(senha, BCRYPT_COST);\n\n  const usuario = await db.query(\n    \"INSERT INTO usuarios (email, senha_hash) VALUES ($1, $2) RETURNING id, email\",\n    [email, senhaHash]\n  );\n\n  res.status(201).json(usuario.rows[0]);\n});\n\nexport default router;\n\n// senhaHash agora se parece com isto:\n// $2b$10$KixVYFhNlHXeQoBP0DkI1uCu.jZq0M5rY6xJgKZzT3vNnDvL4iBpS\n//\n// $2b$  -> versão do algoritmo\n// 10    -> custo (número de rounds)\n// resto -> salt gerado na hora + o hash em si, tudo numa única string"
                    },
                    {
                        "type": "code",
                        "value": "// continuando o mesmo arquivo de rotas, com \"router\" e \"db\" já\n// criados como no bloco de cadastro acima\n\nrouter.post(\"/login\", async (req, res) => {\n  const { email, senha } = req.body;\n\n  const resultado = await db.query(\"SELECT * FROM usuarios WHERE email = $1\", [email]);\n  const usuario = resultado.rows[0];\n\n  if (!usuario) {\n    return res.status(401).json({ erro: \"Email ou senha inválidos\" });\n  }\n\n  const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash);\n\n  if (!senhaConfere) {\n    return res.status(401).json({ erro: \"Email ou senha inválidos\" });\n  }\n\n  res.json({ mensagem: \"Login realizado com sucesso\" });\n});\n\n// a mensagem de erro é a MESMA para email que não existe e para senha errada,\n// de propósito, para não revelar qual dos dois estava errado"
                    },
                    {
                        "type": "text",
                        "value": "## Nunca compare hash com ===\n\nUm erro comum de quem está começando é tentar comparar hashes na mão: gerar de novo o hash da senha digitada e comparar a string resultante com a string guardada no banco usando `===`. Com bcrypt, isso quase sempre falha, mesmo quando a senha está certa. O motivo é que `bcrypt.hash` gera um salt novo e aleatório a cada chamada, então rodar `bcrypt.hash` duas vezes com a mesma senha produz duas strings diferentes.\n\n`bcrypt.compare(senhaDigitada, hashGuardado)` funciona de outro jeito: ele lê o salt e o custo que já estão embutidos no `hashGuardado`, refaz o cálculo do hash da senha digitada usando esse mesmo salt, e só então compara os resultados. É por isso que login sempre usa `compare`, nunca gera um hash novo para comparar com `===`."
                    },
                    {
                        "type": "text",
                        "value": "## Hash forte não substitui senha forte\n\nbcrypt protege o que está guardado no banco, mas não decide se a senha que a pessoa escolheu é boa. \"123456\" com bcrypt continua sendo uma senha fraca, só que agora um pouco mais cara de adivinhar. Por isso a validação de senha continua sendo sua primeira linha de defesa, e ela roda antes do hash: é nos dados que chegam do formulário, ainda em texto puro, que dá pra checar tamanho mínimo e variedade de caracteres. Depois de virar hash, essas informações não dão mais pra checar, porque o hash não guarda \"tinha 8 caracteres\" ou \"tinha um número em algum lugar\", ele só guarda o resultado final.\n\nSe você validou a senha com uma lib como o Zod (por exemplo, exigindo no mínimo 12 caracteres, misturando maiúscula, minúscula, número e caractere especial) lá na trilha de APIs, essa validação continua no lugar de sempre: roda em cima do `req.body.senha` antes de qualquer chamada a `bcrypt.hash`."
                    },
                    {
                        "type": "quote",
                        "value": "bcrypt.hash no cadastro, bcrypt.compare no login, nunca ===. É basicamente essa a régua de segurança de senha na prática."
                    }
                ],
                "questions": [
                    {
                        "statement": "No cadastro de um usuário, qual função do bcrypt deve ser usada para gerar o hash da senha antes de gravar no banco?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "bcrypt.compare(senha, hashGuardado)",
                                "isCorrect": false
                            },
                            {
                                "text": "bcrypt.hash(senha, saltRounds)",
                                "isCorrect": true
                            },
                            {
                                "text": "bcrypt.encrypt(senha, chave)",
                                "isCorrect": false
                            },
                            {
                                "text": "bcrypt.decode(hash, chave)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No login, depois de buscar o usuário pelo email, qual é a forma correta de conferir a senha digitada contra o hash guardado no banco?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Comparar as duas strings diretamente com o operador ===, já que ambas têm o mesmo formato",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerar um novo hash da senha digitada com bcrypt e comparar essa string diretamente com === contra o hash guardado",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar bcrypt.compare(senhaDigitada, hashGuardado), que faz essa verificação de forma segura",
                                "isCorrect": true
                            },
                            {
                                "text": "Decodificar o hash guardado para obter a senha original e então comparar as duas senhas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor escreve este código no login: gera `novoHash = bcrypt.hash(senha, 10)` e depois checa `if (novoHash === usuario.senha_hash)`. Por que esse código falha quase sempre, mesmo quando a senha está correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque bcrypt.hash gera um salt novo a cada chamada, então o hash muda mesmo com a senha igual",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque bcrypt.hash só pode ser chamado uma única vez para cada usuário em todo o sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o operador === nunca funciona corretamente para comparar strings na linguagem JavaScript",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o número de rounds precisaria ser 12 em vez de 10 para os dois hashes coincidirem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que representa o número (saltRounds, ou work factor) passado como segundo argumento de bcrypt.hash?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A quantidade de caracteres do salt que será gerado junto com o hash da senha",
                                "isCorrect": false
                            },
                            {
                                "text": "Um valor que controla o custo do hash: mais rounds, mais lento",
                                "isCorrect": true
                            },
                            {
                                "text": "A quantidade de vezes que o usuário precisa redigitar a senha durante o cadastro",
                                "isCorrect": false
                            },
                            {
                                "text": "O tamanho máximo, em caracteres, que a senha do usuário pode ter no cadastro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API valida, com uma lib como o Zod, que a senha tenha no mínimo 12 caracteres e misture maiúscula, minúscula, número e caractere especial, antes de chamar bcrypt.hash. Por que essa validação precisa acontecer antes do hash, e não depois?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o hash não guarda as características da senha original, como tamanho ou números",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque bcrypt.hash só aceita senhas que já passaram por um middleware específico de validação",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque validar a senha depois do hash deixaria o valor original visível nos logs do servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Não faz diferença nenhuma, a validação funciona igual antes ou depois de calcular o hash",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Sessões e cookies",
        "aulas": [
            {
                "titulo": "O que é uma sessão: o servidor lembrando de você",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é uma sessão: o servidor lembrando de você\n\nVocê já viu que o HTTP é stateless: cada requisição chega pro servidor sem nenhuma lembrança da anterior. Depois que alguém faz login (o servidor conferiu a senha comparando o hash, como você viu no módulo passado), essa informação não fica guardada em lugar nenhum. Assim que a resposta do login é enviada, o servidor já esqueceu quem acabou de entrar.\n\nA saída ingênua seria o cliente reenviar usuário e senha em toda requisição, e você já viu no módulo 1 por que isso é perigoso: a senha viajando o tempo todo, exposta a mais chances de vazar. A sessão resolve isso de outro jeito: o servidor passa a guardar, ele mesmo, um pedacinho de estado sobre quem está logado, e devolve pro cliente só uma referência a esse estado."
                    },
                    {
                        "type": "text",
                        "value": "## O fluxo, passo a passo\n\n1. O cliente manda usuário e senha pro `POST /login`.\n2. O servidor confere a senha (compara o hash, como no módulo 2).\n3. Se bateu, o servidor cria uma sessão: um registro do tipo `{ usuarioId: 42 }`, associado a um ID de sessão único e imprevisível.\n4. O servidor devolve esse ID de sessão pro cliente.\n5. Em toda requisição seguinte, o cliente manda esse mesmo ID de volta.\n6. O servidor usa o ID pra buscar a sessão guardada e descobrir quem está por trás da requisição, sem pedir a senha de novo.\n\nO ponto central: depois do login, o cliente nunca mais reenvia a senha. Ele carrega só uma referência que não significa nada sozinha, só faz sentido quando o servidor que a criou vai consultar."
                    },
                    {
                        "type": "code",
                        "value": "import crypto from \"node:crypto\";\n\n// Um jeito simples de imaginar o que o servidor guarda numa sessao\n// (a aula 4 mostra o express-session de verdade, com um \"store\" plugavel)\nconst sessoes = new Map();\n\nfunction criarSessao(usuarioId) {\n  const idDaSessao = crypto.randomUUID();\n  sessoes.set(idDaSessao, { usuarioId, criadaEm: Date.now() });\n  return idDaSessao;\n}\n\nfunction buscarUsuarioDaSessao(idDaSessao) {\n  const sessao = sessoes.get(idDaSessao);\n  return sessao ? sessao.usuarioId : null;\n}\n\n// Depois de validar a senha no login:\nconst idDaSessao = criarSessao(42);\n// idDaSessao fica algo como \"a1b2c3d4-e5f6-47a8-9b0c-d1e2f3a4b5c6\"\n// e esse valor, nao o usuarioId, que volta pro cliente"
                    },
                    {
                        "type": "text",
                        "value": "## Por que o ID de sessão precisa ser imprevisível\n\nRepare que o ID de sessão não pode ser algo óbvio como o próprio `usuarioId` (42, 43, 44...). Se fosse, qualquer pessoa poderia trocar o valor manualmente e se passar por outro usuário sem nunca saber a senha dele. Por isso o ID é gerado aleatório e longo (como um UUID), praticamente impossível de adivinhar ou testar por tentativa e erro."
                    },
                    {
                        "type": "text",
                        "value": "## Falta uma peça: como o ID viaja sozinho\n\nToda essa troca de ID de sessão só é prática porque existe um mecanismo do navegador que guarda esse valor e reenvia sozinho, sem o front-end escrever código pra isso. Essa peça é o cookie, assunto da próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "Sessão é o servidor decidindo lembrar de você: ele guarda quem você é num cantinho seu e te entrega só um crachá, o ID de sessão, pra apresentar depois. O HTTP continua sem memória, mas agora existe uma anotação em algum lugar do servidor."
                    }
                ],
                "questions": [
                    {
                        "statement": "Depois que o login é validado com sucesso, o que o servidor faz para conseguir reconhecer o usuário nas próximas requisições?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cria uma sessão associando um ID único aos dados do usuário e devolve esse ID pro cliente apresentar depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "Guarda a senha em texto puro numa variável do servidor, pra comparar direto nas próximas requisições.",
                                "isCorrect": false
                            },
                            {
                                "text": "Passa a exigir que o cliente reenvie usuário e senha em toda requisição futura, como confirmação extra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Delega a tarefa ao navegador, que passa a lembrar sozinho de quem fez login, sem envolver o servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que a sessão foi criada, por que o cliente não precisa mais reenviar a senha a cada requisição?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque a própria senha passa a ficar guardada dentro de um cookie, enviado automaticamente a cada requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ele passa a mandar só o ID de sessão, que o servidor usa pra identificar quem fez a requisição.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o servidor passa a memorizar o endereço IP de quem fez login e associa isso à identidade dele.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o HTTP deixa de ser stateless assim que o login acontece, passando a lembrar sozinho do cliente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor resolve usar o próprio id do usuário no banco (por exemplo, 42) como ID de sessão, sem gerar nada aleatório. Qual o principal risco dessa escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum risco relevante, já que o ID de sessão pode ser público sem trazer problema pro sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um atacante pode tentar outros números e se passar por outros usuários, já que o ID ficou previsível.",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor passa a gastar memória demais guardando esse id numérico, o que derruba o desempenho com o tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O bcrypt usado na validação da senha no login para de funcionar corretamente com esse tipo de id.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que precisa acontecer, a cada requisição depois do login, para o servidor saber quem está do outro lado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O cliente precisa reenviar o ID de sessão, que o servidor usa pra localizar a sessão correspondente já guardada.",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor precisa adivinhar quem está requisitando com base só no endereço IP de origem da chamada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O cliente precisa repetir o processo de login inteiro, enviando usuário e senha de novo a cada chamada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor precisa gravar um novo hash de senha a cada requisição recebida, pra validar quem está por trás.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre o ID de sessão, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ele já carrega a identidade do usuário embutida nele mesmo, sem precisar que o servidor consulte nada depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele é uma referência opaca, que só ganha significado quando o servidor a usa pra buscar os dados da sessão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Depois que a sessão é criada, o servidor volta a ser totalmente stateless, sem guardar mais nenhum dado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele substitui de vez a necessidade de comparar o hash da senha no momento em que o login acontece.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cookies: o crachá que o navegador reenvia sozinho",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Cookies: o crachá que o navegador reenvia sozinho\n\nNa aula passada ficou faltando uma peça: quem carrega o ID de sessão de volta pro servidor em toda requisição, sem o front-end precisar escrever código pra isso? Na web, essa peça é o cookie: um pedacinho de texto que o servidor manda o navegador guardar, e que o navegador devolve sozinho depois, feito um crachá que você não precisa lembrar de levar."
                    },
                    {
                        "type": "text",
                        "value": "## Set-Cookie: o servidor entrega o crachá\n\nQuando o login dá certo, a resposta do servidor vem com um header `Set-Cookie`, dizendo pro navegador: guarde este valor e me devolva depois. É aqui que o ID de sessão criado na aula passada vira, de fato, um cookie."
                    },
                    {
                        "type": "code",
                        "value": "HTTP/1.1 200 OK\nContent-Type: application/json\nSet-Cookie: idDeSessao=a1b2c3d4e5f647a89b0cd1e2f3a4b5c6; Path=/; HttpOnly\n\n{\"mensagem\":\"login efetuado\"}"
                    },
                    {
                        "type": "text",
                        "value": "## Cookie: o navegador devolve o crachá sozinho\n\nA partir daí, em toda requisição futura pro mesmo domínio, o navegador anexa sozinho um header `Cookie` com aquele valor. Nenhum JavaScript da aplicação precisa ler nada nem reenviar nada, é o próprio navegador que faz esse trabalho."
                    },
                    {
                        "type": "code",
                        "value": "GET /perfil HTTP/1.1\nHost: ensina.dev\nCookie: idDeSessao=a1b2c3d4e5f647a89b0cd1e2f3a4b5c6"
                    },
                    {
                        "type": "text",
                        "value": "## Um crachá que só vale pro domínio que emitiu\n\nO servidor lê o header Cookie, extrai o idDeSessao e busca a sessão correspondente (a mesma ideia da função buscarUsuarioDaSessao da aula anterior). O cookie fica associado ao domínio (e opcionalmente a um caminho específico) que o criou: o navegador não manda o cookie de `ensina.dev` numa requisição pra `outro-site.com`, por exemplo. Isso já ajuda, mas do jeito que está, o `Set-Cookie` da aula passada tem um problema: por padrão, esse cookie pode ser lido por JavaScript e enviado em situações que não deveriam acontecer. A próxima aula mostra os atributos que fecham essas brechas."
                    },
                    {
                        "type": "quote",
                        "value": "O cookie é o que transforma uma sessão em algo que funciona sozinho: o servidor entrega o crachá uma vez (Set-Cookie), e o navegador cuida de mostrar esse crachá em toda porta (Cookie) até alguém mandar ele esquecer."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual header HTTP o servidor usa pra mandar o navegador guardar um cookie?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cookie",
                                "isCorrect": false
                            },
                            {
                                "text": "Set-Cookie",
                                "isCorrect": true
                            },
                            {
                                "text": "Authorization",
                                "isCorrect": false
                            },
                            {
                                "text": "Content-Cookie",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que o navegador recebe um Set-Cookie do domínio ensina.dev, o que ele faz nas próximas requisições pra esse mesmo domínio?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pergunta ao usuário, numa caixa de diálogo, se pode reenviar aquele cookie a cada nova requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Envia esse cookie de volta sozinho, no header Cookie, sem precisar de nenhum código extra no front-end.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apaga o cookie automaticamente logo depois da primeira requisição em que ele chegou a ser usado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só envia o cookie de volta quando o JavaScript da página pede isso de forma explícita.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o navegador normalmente não envia o cookie de ensina.dev numa requisição pra outro-site.com?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque cookies nunca chegam a ser enviados pelo navegador, eles servem só pra leitura direta pelo back-end.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o cookie fica associado ao domínio (e opcionalmente ao caminho) que o criou, e só volta pra esse domínio.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque cookies expiram automaticamente assim que o usuário troca de aba dentro do mesmo navegador aberto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o protocolo HTTP proíbe o envio de cookies em requisições do tipo GET, permitindo só em POST.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois do login, o servidor manda Set-Cookie: idDeSessao=abc123. Na próxima requisição do navegador pro mesmo site, qual header carrega esse valor de volta automaticamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Set-Cookie: idDeSessao=abc123",
                                "isCorrect": false
                            },
                            {
                                "text": "Cookie: idDeSessao=abc123",
                                "isCorrect": true
                            },
                            {
                                "text": "Authorization: Bearer abc123",
                                "isCorrect": false
                            },
                            {
                                "text": "Session-Id: abc123",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre o mecanismo de cookies, qual afirmação é verdadeira?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O front-end precisa ler manualmente o header Set-Cookie da resposta e escrever código pra reenviar o valor depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cookies dispensam totalmente a necessidade de HTTPS pra proteger dados sensíveis trafegando entre cliente e servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "O que torna o cookie prático é o navegador guardar e reenviar o valor sozinho, sem o JavaScript precisar orquestrar nada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um cookie definido por um site é reenviado automaticamente pra qualquer outro domínio que o usuário visitar depois.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cookies seguros: HttpOnly, Secure e SameSite",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Cookies seguros: HttpOnly, Secure e SameSite\n\nUm cookie sem nenhuma configuração extra funciona, mas do jeito errado pra guardar algo sensível como um ID de sessão: por padrão, ele pode ser lido por JavaScript e enviado em situações que abrem brecha pra ataque. Os atributos desta aula são o que separam \"guardar a sessão num cookie\" de \"guardar a sessão num cookie com segurança\"."
                    },
                    {
                        "type": "text",
                        "value": "## HttpOnly: protege contra XSS lendo o cookie\n\nSe o site tiver uma falha de XSS (um script malicioso injetado na página, por exemplo através de um campo que não foi sanitizado), esse script roda como se fosse código legítimo da aplicação, com acesso a document.cookie. Sem proteção, ele consegue ler o ID de sessão e mandar pra um servidor do atacante. O atributo `HttpOnly` fecha essa porta: marca o cookie como inacessível pra JavaScript, só o navegador consegue enviá-lo nas requisições."
                    },
                    {
                        "type": "code",
                        "value": "// Cookie sem HttpOnly\nSet-Cookie: idDeSessao=abc123; Path=/\n\n// No navegador, um script (legitimo ou malicioso) consegue ler:\ndocument.cookie\n// \"idDeSessao=abc123\"\n\n// Cookie com HttpOnly\nSet-Cookie: idDeSessao=abc123; Path=/; HttpOnly\n\n// No navegador, o mesmo document.cookie nao mostra esse valor:\ndocument.cookie\n// \"\" (o idDeSessao fica de fora, so o navegador consegue enviar o cookie)"
                    },
                    {
                        "type": "text",
                        "value": "## Secure, SameSite e o resto dos atributos\n\n- Secure: o navegador só envia o cookie em conexões HTTPS. Sem isso, o cookie pode trafegar em texto puro numa rede não criptografada e ser capturado por quem estiver escutando o tráfego.\n- SameSite: controla se o cookie é enviado quando a requisição parte de outro site. Com Strict, o cookie só vai em requisições originadas do próprio site. Com Lax (o padrão na maioria dos navegadores hoje), ele ainda vai em navegações simples como clicar num link, mas fica de fora de requisições automáticas disparadas por outro site, como um formulário escondido. É essa restrição que atrapalha o ataque de CSRF.\n- Expires / Max-Age: definem até quando o cookie é válido. Depois disso, o navegador descarta ele sozinho.\n- Domain / Path: restringem pra quais domínios (e subdomínios) e caminhos o cookie deve ser enviado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Atributo\",\"O que faz\",\"Risco que mitiga\"],[\"HttpOnly\",\"Bloqueia a leitura do cookie via JavaScript (document.cookie)\",\"Um script malicioso injetado por XSS roubar o ID de sessão\"],[\"Secure\",\"Só envia o cookie em conexões HTTPS\",\"O cookie ser capturado em texto puro numa rede não criptografada\"],[\"SameSite\",\"Restringe o envio do cookie em requisições vindas de outro site\",\"CSRF: um site malicioso usar sua sessão sem você saber\"],[\"Expires / Max-Age\",\"Define até quando o cookie continua válido\",\"Uma sessão antiga continuar valendo indefinidamente\"],[\"Domain / Path\",\"Restringe pra quais domínios e caminhos o cookie é enviado\",\"O cookie vazar pra subdomínios ou rotas que não deveriam recebê-lo\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import session from \"express-session\";\n\napp.use(session({\n  secret: process.env.SESSION_SECRET,\n  resave: false,\n  saveUninitialized: false,\n  cookie: {\n    httpOnly: true,           // JavaScript nao consegue ler o cookie\n    secure: true,             // so envia em conexoes HTTPS\n    sameSite: \"lax\",          // bloqueia a maior parte dos ataques de CSRF\n    maxAge: 1000 * 60 * 60,   // 1 hora, em milissegundos\n  },\n}));"
                    },
                    {
                        "type": "quote",
                        "value": "Um cookie sem esses atributos é um crachá que qualquer script pode ler e qualquer site pode tentar usar em seu nome. HttpOnly, Secure e SameSite mitigam riscos diferentes, e o cookie de sessão ideal usa os três ao mesmo tempo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual atributo de cookie impede que o JavaScript da página leia o valor do cookie (por exemplo, via document.cookie)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Secure",
                                "isCorrect": false
                            },
                            {
                                "text": "HttpOnly",
                                "isCorrect": true
                            },
                            {
                                "text": "SameSite",
                                "isCorrect": false
                            },
                            {
                                "text": "Max-Age",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o atributo Secure num cookie?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Impede que o valor do cookie seja lido diretamente por JavaScript rodando na página.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faz o cookie expirar mais rápido do que o tempo configurado originalmente nele.",
                                "isCorrect": false
                            },
                            {
                                "text": "Garante que o cookie só seja enviado pelo navegador em conexões HTTPS.",
                                "isCorrect": true
                            },
                            {
                                "text": "Impede que o cookie seja enviado em requisições vindas de outros sites.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um site sofre um ataque de XSS: um script malicioso injetado na página tenta ler document.cookie pra roubar o ID de sessão. Esse cookie de sessão foi criado com o atributo HttpOnly. O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O ataque funciona normalmente, já que o atributo HttpOnly não tem nenhuma relação com falhas de XSS.",
                                "isCorrect": false
                            },
                            {
                                "text": "O script malicioso não consegue ler o cookie de sessão, porque HttpOnly bloqueia esse acesso via JavaScript.",
                                "isCorrect": true
                            },
                            {
                                "text": "O navegador bloqueia o carregamento da página inteira assim que detecta o atributo HttpOnly no cookie.",
                                "isCorrect": false
                            },
                            {
                                "text": "O cookie é enviado automaticamente pro atacante mesmo assim, porque HttpOnly não impede esse tipo de envio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um site malicioso cria um formulário escondido que dispara uma requisição pra transferir dinheiro em banco.com, esperando que o navegador use a sessão já autenticada da vítima nesse banco. Qual atributo do cookie de sessão do banco.com ajuda a bloquear esse ataque?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "HttpOnly",
                                "isCorrect": false
                            },
                            {
                                "text": "Domain",
                                "isCorrect": false
                            },
                            {
                                "text": "SameSite",
                                "isCorrect": true
                            },
                            {
                                "text": "Expires",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre os atributos de cookie, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Definir Expires ou Max-Age torna o cookie automaticamente protegido contra ataques de XSS na aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "HttpOnly impede que o cookie seja enviado pela rede, permitindo só a leitura dele localmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "HttpOnly, Secure e SameSite mitigam riscos diferentes entre si e podem ser combinados no mesmo cookie de sessão.",
                                "isCorrect": true
                            },
                            {
                                "text": "SameSite substitui completamente a necessidade de usar HTTPS pra proteger a conexão entre cliente e servidor.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Onde guardar as sessões (memória, Redis, banco)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Onde guardar as sessões (memória, Redis, banco)\n\nAté aqui, \"o servidor guarda a sessão\" ficou um pouco abstrato. Na prática, esse armazenamento precisa morar em algum lugar concreto, e a escolha de onde muda bastante o comportamento da aplicação, principalmente quando ela cresce."
                    },
                    {
                        "type": "text",
                        "value": "## Memória do processo: simples, mas frágil\n\nA opção mais direta é guardar as sessões numa estrutura dentro do próprio processo Node, do jeito que fizemos na aula 1 com aquele `Map`. É rápido e não exige nenhuma peça extra de infraestrutura. O problema aparece em dois cenários comuns: se o processo reinicia (um deploy, um crash), a memória some e todo mundo é deslogado de uma vez. E se a aplicação roda em mais de uma instância atrás de um load balancer, cada instância tem sua própria memória: uma sessão criada na instância A simplesmente não existe na instância B."
                    },
                    {
                        "type": "code",
                        "value": "import session from \"express-session\";\n\napp.use(session({\n  secret: process.env.SESSION_SECRET,\n  resave: false,\n  saveUninitialized: false,\n  // sem \"store\" definido, o express-session usa a MemoryStore por padrao\n}));\n\n// a propria biblioteca avisa no terminal ao subir o servidor:\n// \"Warning: connect.session() MemoryStore is not\n// designed for a production environment, as it will leak\n// memory, and will not scale past a single process.\""
                    },
                    {
                        "type": "text",
                        "value": "## Redis: o mais comum em produção\n\nRedis é um banco de dados em memória, mas que roda como um serviço à parte, fora do processo Node. Isso resolve as duas dores da memória local: qualquer instância do servidor consulta o mesmo Redis, então não importa qual delas atendeu a requisição, e reiniciar o processo Node não apaga nada, porque as sessões vivem em outro lugar. Redis também tem suporte nativo a expiração automática de chaves, o que combina bem com o tempo de vida de uma sessão."
                    },
                    {
                        "type": "code",
                        "value": "import session from \"express-session\";\nimport { RedisStore } from \"connect-redis\";\nimport { createClient } from \"redis\";\n\nconst redisClient = createClient({ url: process.env.REDIS_URL });\nawait redisClient.connect();\n\napp.use(session({\n  store: new RedisStore({ client: redisClient }),\n  secret: process.env.SESSION_SECRET,\n  resave: false,\n  saveUninitialized: false,\n}));\n\n// agora qualquer instancia do servidor consulta o mesmo Redis,\n// e reiniciar o processo Node nao apaga as sessoes existentes"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Onde guardar\",\"Vantagem\",\"Limitação\"],[\"Memória do processo\",\"Zero configuração, muito rápido\",\"Some ao reiniciar o processo; não funciona com múltiplas instâncias do servidor\"],[\"Redis\",\"Rápido, compartilhado entre instâncias, expira sozinho\",\"Mais uma peça de infraestrutura pra manter no ar\"],[\"Banco de dados\",\"Já existe na maioria dos sistemas, fácil de consultar e auditar\",\"Costuma ser mais lento que memória ou Redis pra uma leitura em toda requisição\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Sessão em memória é ótima pra aprender e prototipar. Em produção, com mais de um servidor rodando, ela vira um problema: cada instância lembra só de parte dos usuários. Redis (ou um banco) é a peça que faz todas as instâncias lembrarem da mesma coisa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por padrão, sem nenhuma configuração extra de store, onde o express-session guarda as sessões?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "No banco de dados PostgreSQL, de forma automática e sem nenhuma configuração adicional.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na memória do próprio processo Node, na chamada MemoryStore usada por padrão.",
                                "isCorrect": true
                            },
                            {
                                "text": "No Redis, que já vem configurado como store padrão do express-session.",
                                "isCorrect": false
                            },
                            {
                                "text": "No localStorage do navegador, sincronizado automaticamente a cada requisição feita.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal limitação de guardar sessões apenas na memória do processo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É de longe a opção mais lenta de todas as disponíveis para ler uma sessão a cada requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "As sessões somem quando o processo reinicia e não valem entre instâncias do servidor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não é possível usar o atributo HttpOnly em sessões que ficam guardadas apenas na memória.",
                                "isCorrect": false
                            },
                            {
                                "text": "A memória do processo só consegue manter um único usuário logado por vez em toda a aplicação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API roda em 3 instâncias atrás de um load balancer, cada uma guardando sessão na própria memória. Um usuário loga e a requisição cai na instância A. Na requisição seguinte, o load balancer manda pra instância B. O que provavelmente acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Tudo funciona normalmente, porque a memória é compartilhada automaticamente entre todas as instâncias do servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "A instância B não enxerga a sessão criada na instância A, e o usuário parece deslogado outra vez.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Redis assume automaticamente essa sessão nesse cenário, mesmo sem nunca ter sido configurado pela aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O load balancer copia sozinho a sessão de uma instância pra outra, sem precisar de Redis.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que Redis costuma ser escolhido em produção pra guardar sessões, em vez de deixar só na memória do processo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o Redis é a única forma possível de usar o atributo HttpOnly num cookie de sessão do servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Redis é compartilhado entre as instâncias e sobrevive a um reinício do processo Node.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Redis dispensa por completo a necessidade de existir qualquer ID de sessão no fluxo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Redis torna o cookie de sessão automaticamente Secure, sem precisar configurar mais nada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Comparando memória, Redis e banco de dados como opções de armazenamento de sessão, qual afirmação é mais precisa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Banco de dados nunca deve ser usado pra guardar sessão, só Redis é considerado válido em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Memória do processo é sempre a melhor escolha, inclusive em produção com várias instâncias rodando ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada opção troca simplicidade por escala: memória é simples, mas não escala nem sobrevive a reinícios.",
                                "isCorrect": true
                            },
                            {
                                "text": "O tipo de armazenamento escolhido muda o formato do ID de sessão enviado ao cliente a cada novo login.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Logout e os limites das sessões",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Logout e os limites das sessões\n\nCom sessão guardada no servidor, fazer logout parece óbvio: \"esquecer\" o usuário. Mas esse esquecimento precisa acontecer no lugar certo, senão o logout vira só uma ilusão pro cliente."
                    },
                    {
                        "type": "text",
                        "value": "## Destruir a sessão no servidor\n\nUm logout correto apaga o registro da sessão no armazenamento do servidor (memória, Redis ou banco, dependendo do que você viu na aula passada) e, junto, instrui o navegador a descartar o cookie. As duas partes importam: sem apagar no servidor, o ID de sessão continua tecnicamente válido até expirar sozinho."
                    },
                    {
                        "type": "code",
                        "value": "app.post(\"/logout\", (req, res) => {\n  req.session.destroy((erro) => {\n    if (erro) {\n      return res.status(500).json({ mensagem: \"Erro ao encerrar a sessao\" });\n    }\n    res.clearCookie(\"connect.sid\");\n    res.json({ mensagem: \"Logout efetuado\" });\n  });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## \"Esquecer no cliente\" x \"invalidar no servidor\"\n\nSe o logout só apaga o cookie no navegador (por exemplo, um document.cookie manual no front-end) sem nunca chamar uma rota no servidor, a sessão continua existindo lá, intacta. Qualquer cópia daquele ID de sessão, seja de um computador compartilhado, seja capturada antes por algum outro meio, continua funcionando normalmente até a sessão expirar sozinha. Invalidar no servidor é o que de fato revoga o acesso; esquecer no cliente só limpa a referência de quem tinha o hábito de usá-la."
                    },
                    {
                        "type": "text",
                        "value": "## Prós e contras de guardar estado no servidor\n\nEsse é o resumo do módulo inteiro: sessão dá controle total sobre quem está autenticado. Quer derrubar um usuário agora, sem esperar nada expirar? Apaga o registro da sessão dele no servidor e pronto, o acesso acaba na próxima requisição. Em troca, o servidor precisa guardar e sincronizar esse estado (memória, Redis ou banco), o que complica escalar horizontalmente: toda instância da aplicação precisa enxergar a mesma sessão, como você viu na aula 4.\n\nÉ justamente por causa desse trade-off que muitas APIs, incluindo o ensina.dev, preferem uma abordagem que não guarda nada no servidor: tokens. É o assunto do próximo módulo."
                    },
                    {
                        "type": "code",
                        "value": "// Jeito incompleto: so o cliente \"esquece\" o cookie, o servidor nunca sabe\ndocument.cookie = \"connect.sid=; Max-Age=0\";\n// a sessao continua valida no servidor ate expirar sozinha\n\n// Jeito correto: avisar o servidor pra invalidar a sessao\nawait fetch(\"/logout\", { method: \"POST\" });\n// o servidor roda req.session.destroy() e so entao o cookie e limpo de fato"
                    },
                    {
                        "type": "quote",
                        "value": "Enquanto a sessão existir no servidor, o crachá vale alguma coisa. Logout de verdade é apagar essa sessão lá, não só jogar o crachá fora no seu bolso."
                    }
                ],
                "questions": [
                    {
                        "statement": "Numa implementação correta de sessão, o que deve acontecer no servidor quando o usuário faz logout?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Nada muda no servidor, o próprio navegador sozinho cuida de todo o processo de logout.",
                                "isCorrect": false
                            },
                            {
                                "text": "A sessão correspondente àquele ID precisa ser destruída ou invalidada no armazenamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor deve trocar a senha atual do usuário de forma automática a cada logout realizado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor deve gerar um novo hash pra senha atual do usuário logo em seguida ao logout.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No express-session, qual método é usado pra encerrar (invalidar) a sessão atual no servidor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "req.session.destroy()",
                                "isCorrect": true
                            },
                            {
                                "text": "req.session.end()",
                                "isCorrect": false
                            },
                            {
                                "text": "req.session.remove()",
                                "isCorrect": false
                            },
                            {
                                "text": "req.session.clear()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um app implementa logout apagando só o cookie no navegador (document.cookie = \"connect.sid=; Max-Age=0\"), sem chamar nenhuma rota no servidor. Se alguém tiver uma cópia daquele valor de cookie de antes do logout, o que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Essa cópia deixa de funcionar automaticamente, porque o navegador do dono avisa o servidor ao apagar o cookie.",
                                "isCorrect": false
                            },
                            {
                                "text": "Essa cópia continua funcionando até a sessão expirar sozinha no servidor, porque nunca foi invalidada lá.",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor detecta essa duplicidade de cookies iguais e bloqueia o acesso das duas cópias imediatamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O ataque só funciona se quem tem a cópia também souber a senha original do usuário afetado no sistema.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal vantagem prática de a sessão guardar estado no servidor, em comparação com uma abordagem que não guarda nada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sessões nunca expiram nesse modelo, o que se torna mais conveniente pro usuário final.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor pode revogar o acesso na hora, bastando apagar aquele registro, forçando logout imediato.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sessões dispensam completamente o uso de HTTPS pra proteger a comunicação entre cliente e servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sessões eliminam por completo a necessidade de usar qualquer cookie pra identificar o cliente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o principal trade-off de sessões guardarem estado no servidor, considerando tudo que foi visto neste módulo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sessões são sempre mais rápidas que qualquer outra abordagem de autenticação, sem nenhuma desvantagem real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ganha-se controle total sobre o acesso, mas paga-se o preço de sincronizar o estado conforme a aplicação escala.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sessões eliminam por completo a necessidade de comparar hash de senha no momento do login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sessões só funcionam em aplicações que usam exclusivamente bancos de dados relacionais como armazenamento.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Tokens e JWT",
        "aulas": [
            {
                "titulo": "Autenticação por token: o cliente carrega a prova",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Autenticação por token: o cliente carrega a prova\n\nNo módulo anterior você viu a sessão: o servidor guarda, do seu lado, quem está logado (numa tabela, na memória ou no Redis) e entrega ao navegador só um cookie com um id opaco, que ele reenvia sozinho a cada requisição. Funciona bem, mas depende de o servidor lembrar de algo.\n\nA **autenticação por token** resolve o mesmo problema (lembrar quem é o usuário entre requisições, já que o HTTP é sem estado) de um jeito oposto: em vez de o servidor guardar a prova, é o **cliente** que carrega essa prova com ele, dentro de um token, e a apresenta em toda requisição. O servidor não precisa guardar nada sobre quem está logado: só precisa saber **verificar** se o token que chegou é autêntico."
                    },
                    {
                        "type": "text",
                        "value": "## O fluxo básico\n\n1. O cliente manda email e senha para /login, como você já viu.\n2. O servidor confere a senha (o bcrypt.compare do Módulo 2).\n3. Em vez de criar uma sessão no servidor, o servidor **gera e assina um token** e devolve ele na resposta.\n4. O cliente guarda esse token (no localStorage, numa variável em memória, no armazenamento seguro do app mobile).\n5. Em toda requisição seguinte a uma rota protegida, o cliente reenvia o token, e o servidor apenas **verifica a assinatura** dele antes de atender o pedido.\n\nRepare na diferença: com sessão, o cookie é reenviado **automaticamente** pelo navegador. Com token, normalmente é o **código do cliente** que precisa lembrar de anexar o token em cada chamada, porque ele não costuma ir num cookie."
                    },
                    {
                        "type": "code",
                        "value": "GET /perfil HTTP/1.1                 <- metodo e caminho do recurso\nHost: api.ensina.dev                 <- para qual servidor e a requisicao\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsIm5hbWUiOiJBbmEgU291emEiLCJyb2xlIjoiYWx1bm8iLCJpYXQiOjE3MjAwMDAwMDAsImV4cCI6MTcyMDAwMzYwMH0.bJPAuupjFaNpHPr0NqS88z-QIe4sHAGgsFa2jDP8lhM   <- a prova de identidade vai aqui\n\n(sem corpo: GET normalmente nao carrega um)"
                    },
                    {
                        "type": "text",
                        "value": "## Sem estado no servidor\n\nCom sessão, se você tivesse dois servidores atrás de um balanceador de carga, os dois precisariam enxergar o mesmo lugar onde a sessão está guardada (o mesmo Redis, o mesmo banco), senão um servidor não reconheceria a sessão criada pelo outro.\n\nCom token, qualquer servidor que conheça o segredo usado para assinar consegue verificar o token sozinho, sem consultar ninguém. Isso é o que se chama de **autenticação stateless** (sem estado): a prova de identidade viaja inteira dentro do token, a cada requisição."
                    },
                    {
                        "type": "code",
                        "value": "// Front-end: um interceptor de requisicao (axios) anexa o token automaticamente\napi.interceptors.request.use((config) => {\n  const token = localStorage.getItem(\"@App:accessToken\");\n\n  if (token) {\n    config.headers.Authorization = `Bearer ${token}`;\n  }\n\n  return config;\n});\n\n// sem esse passo, cada chamada sairia sem prova nenhuma, e o servidor devolveria 401"
                    },
                    {
                        "type": "quote",
                        "value": "Na autenticação por token, a prova de identidade não fica guardada em lugar nenhum do servidor: ela viaja com o cliente, dentro do próprio token, a cada requisição."
                    }
                ],
                "questions": [
                    {
                        "statement": "No módulo anterior, a sessão guardava no servidor o estado de quem estava logado. Na autenticação por token, o que muda nesse ponto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O servidor deixa de guardar estado sobre o login; só verifica a assinatura do token recebido a cada requisição.",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor passa a guardar a sessão numa tabela ainda mais rápida do banco, para não perder desempenho na troca.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor deixa de validar a senha no momento do login, já que o token substituiria essa conferência inicial.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor passa a exigir que o token venha sempre dentro de um cookie, do mesmo jeito que a sessão funcionava.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de receber o token no login, como o cliente deve enviá-lo nas próximas requisições a rotas protegidas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reenviando o email e a senha do usuário em cada requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dentro do corpo (body) de toda requisição GET.",
                                "isCorrect": false
                            },
                            {
                                "text": "No cabeçalho Authorization, no formato Bearer <token>.",
                                "isCorrect": true
                            },
                            {
                                "text": "Num cookie chamado sessao, criado automaticamente pelo navegador.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe está migrando a API de sessão para token, e um desenvolvedor pergunta se ainda precisa manter uma tabela sessions no banco só para saber quem está logado no momento. Qual é a resposta correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não é necessário: com token, a prova viaja com o cliente, e o servidor só verifica a assinatura a cada requisição.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, sessão e token sempre precisam conviver na mesma tabela do banco, para manter os dois mecanismos sincronizados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque o token só é considerado válido se existir uma sessão espelhada no servidor para conferência extra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Depende: só é dispensável se a aplicação for para celular, já que apps nativos não usam cookie.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No interceptor de requisição do axios, o front-end busca o token no localStorage e o inclui manualmente no cabeçalho Authorization antes de cada chamada à API. Por que isso é necessário, se o usuário já fez login uma vez?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o valor do token muda a cada requisição e precisa ser gerado de novo pelo front-end antes de cada chamada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque, ao contrário do cookie de sessão, o token não é reenviado automaticamente pelo navegador a cada requisição.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o servidor exige que o token venha em dobro, uma vez no cookie e outra no cabeçalho Authorization.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o localStorage apaga o token sozinho depois de alguns segundos, exigindo reenvio constante.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a autenticação por token permite que o servidor não guarde nenhum estado de login, mesmo assim conseguindo confirmar quem é o usuário a cada requisição?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o token é sempre enviado por HTTPS, e o HTTPS sozinho já garante quem é o usuário, sem necessidade de mais verificação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o navegador verifica o token antes de enviar, e o servidor só confirma o que o navegador já validou previamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o token nunca expira, então o servidor não precisa reconferir nada durante toda a sessão do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a informação que identifica o usuário viaja no token, e a assinatura confirma a autenticidade sem consultar nada.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Anatomia de um JWT: header, payload e assinatura",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Anatomia de um JWT: header, payload e assinatura\n\nO formato de token mais usado hoje é o **JWT**, sigla de JSON Web Token (a sigla costuma ser pronunciada como a palavra inglesa jot). Um JWT é uma única string de texto compacta, pensada para caber tranquilamente num cabeçalho HTTP ou até numa URL, dividida em **três partes separadas por ponto**: header.payload.signature.\n\nCada uma dessas três partes é um pedaço de JSON codificado em **Base64url** (uma variação do Base64 que troca os caracteres + e / por - e _, para não quebrar URLs). O resultado final é essa string cheia de letras, números, hífens e underscores que você já deve ter visto em algum cabeçalho Authorization."
                    },
                    {
                        "type": "code",
                        "value": "// Um JWT real, valido, gerado com o algoritmo HS256\neyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsIm5hbWUiOiJBbmEgU291emEiLCJyb2xlIjoiYWx1bm8iLCJpYXQiOjE3MjAwMDAwMDAsImV4cCI6MTcyMDAwMzYwMH0.bJPAuupjFaNpHPr0NqS88z-QIe4sHAGgsFa2jDP8lhM\n\n// separando pelos dois pontos finais:\n// header:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\n// payload:   eyJzdWIiOiI0MiIsIm5hbWUiOiJBbmEgU291emEiLCJyb2xlIjoiYWx1bm8iLCJpYXQiOjE3MjAwMDAwMDAsImV4cCI6MTcyMDAwMzYwMH0\n// signature: bJPAuupjFaNpHPr0NqS88z-QIe4sHAGgsFa2jDP8lhM"
                    },
                    {
                        "type": "text",
                        "value": "## O que tem dentro de cada parte\n\n- **Header**: um JSON pequeno dizendo qual algoritmo assina o token (alg, aqui HS256) e o tipo (typ, sempre JWT).\n- **Payload**: um JSON com as informações sobre o usuário e sobre o próprio token, chamadas de **claims**. É o que a próxima aula destrincha.\n- **Signature**: o carimbo criptográfico calculado sobre o header e o payload juntos, usando um segredo que só o servidor conhece. É o que a aula seguinte destrincha.\n\nUm detalhe que vai importar daqui a pouco: **Base64url não é criptografia**, é só uma **codificação**. Qualquer pessoa consegue decodificar um JWT de volta para o JSON original, sem precisar de senha nem segredo nenhum, porque decodificar Base64 não exige chave alguma."
                    },
                    {
                        "type": "code",
                        "value": "// Decodificando o header e o payload no Node, sem nenhuma lib de JWT:\nconst [header, payload] = token.split(\".\");\n\nconsole.log(Buffer.from(header, \"base64url\").toString());\nconsole.log(Buffer.from(payload, \"base64url\").toString());\n\n// saida:\n// {\"alg\":\"HS256\",\"typ\":\"JWT\"}\n// {\"sub\":\"42\",\"name\":\"Ana Souza\",\"role\":\"aluno\",\"iat\":1720000000,\"exp\":1720003600}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Parte\",\"Codificação\",\"O que contém\",\"Trecho neste exemplo\"],[\"Header\",\"Base64url\",\"Algoritmo de assinatura (alg) e tipo (typ)\",\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\"],[\"Payload\",\"Base64url\",\"As claims: dados sobre o usuário e sobre o token\",\"eyJzdWIiOiI0MiIsIm5hbWUi...\"],[\"Signature\",\"Base64url do resultado do HMAC (ou RSA)\",\"Carimbo que comprova que header e payload não foram alterados\",\"bJPAuupjFaNpHPr0NqS88z-QIe4sHAGgsFa2jDP8lhM\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um JWT é header.payload.signature: três blocos de JSON em Base64url. Isso não é segredo nem mistério, é só um jeito compacto e padronizado de empacotar informação para viajar dentro de um cabeçalho HTTP."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um JWT é dividido em três partes separadas por ponto. Qual é a ordem correta dessas partes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "header.payload.signature",
                                "isCorrect": true
                            },
                            {
                                "text": "payload.header.signature",
                                "isCorrect": false
                            },
                            {
                                "text": "signature.header.payload",
                                "isCorrect": false
                            },
                            {
                                "text": "header.signature.payload",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em que formato cada uma das três partes de um JWT é codificada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "AES de 256 bits, um algoritmo de criptografia simétrica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Base64url, uma variação do Base64 usada em URLs e cabeçalhos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Texto puro, sem qualquer codificação aplicada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Hexadecimal, a base 16 usada em hashes e cores.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor decodifica o payload de um JWT recebido numa requisição e consegue ler um JSON perfeitamente legível, sem informar senha nem segredo algum. Ele conclui que o token está corrompido, já que deveria estar protegido. Ele está certo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, um JWT correto nunca pode ser decodificado sem a senha do usuário, já que o payload deveria estar protegido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, isso só acontece quando o servidor esquece de assinar o token antes de enviar a resposta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não: o payload de um JWT é só Base64url, não é criptografia; conseguir lê-lo sem segredo é o comportamento esperado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, mas isso só é normal quando o token usa o algoritmo RS256 em vez de HS256 para assinar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao inspecionar um JWT, um time estranha o header trazer só duas informações (o algoritmo de assinatura e o tipo do token) e acha que esqueceram de configurar alguma coisa. O que está correto sobre o conteúdo esperado do header de um JWT?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Está correto: o header traz só o algoritmo de assinatura e o tipo; os dados do usuário ficam no payload.",
                                "isCorrect": true
                            },
                            {
                                "text": "Está errado: o header deveria conter os dados do usuário, como id e nome, para facilitar a leitura rápida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Está errado: o header deveria conter a senha do usuário, para permitir autenticação dupla no servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Está correto, mas só porque esse token usa RS256; em HS256 o header sempre traz mais campos que esses.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Header e payload de um JWT usam a mesma codificação Base64url que a assinatura. Por que, mesmo assim, não é correto dizer que um JWT criptografa as informações do usuário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque a assinatura embaralha o conteúdo do payload de um jeito que só o próprio servidor consegue desfazer depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque Base64url é reversível por qualquer um sem chave nenhuma; criptografia exigiria uma chave para reverter isso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o header também precisaria estar cifrado para o conjunto inteiro ser considerado criptografado de fato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só tokens assinados com RS256 são criptografados de verdade; tokens HS256, por outro lado, não seriam.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Claims e por que o payload não é secreto",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Claims e por que o payload não é secreto\n\nAs informações dentro do payload de um JWT são chamadas de **claims**, um termo em inglês para as declarações que o token carrega: pares chave-valor dentro de um objeto JSON, cada um dizendo alguma coisa sobre o usuário ou sobre o próprio token. A especificação do JWT já reserva alguns nomes de claims comuns, mas a aplicação também pode criar as suas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Claim\",\"O que significa\",\"Valor neste token\"],[\"sub\",\"Subject: quem é o dono do token (aqui, o id do usuário)\",\"42\"],[\"iat\",\"Issued at: quando o token foi emitido, em segundos desde 1970 (Unix time)\",\"1720000000\"],[\"exp\",\"Expiration: quando o token deixa de ser válido\",\"1720003600\"],[\"role\",\"Claim própria da aplicação, fora do padrão do JWT\",\"aluno\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Claims registradas e claims próprias\n\nAlgumas claims são padronizadas pela especificação do JWT (as chamadas registered claims), com nomes curtos de três letras: sub, iat, exp, entre outras. Elas não são obrigatórias, mas são tão comuns que praticamente toda lib de JWT sabe interpretá-las sozinha (por exemplo, checar se exp já passou).\n\nAlém delas, a aplicação pode adicionar **claims próprias**, com qualquer nome que fizer sentido para o seu domínio (role, plano, email, o que for). Não existe uma lista fechada de conteúdo permitido, só bom senso: o payload de um JWT costuma ser pequeno, porque ele viaja inteiro em toda requisição."
                    },
                    {
                        "type": "code",
                        "value": "// No console do navegador, sem estar logado em lugar nenhum e sem segredo algum:\nconst payloadB64 = token.split(\".\")[1];\nconst base64 = payloadB64.replace(/-/g, \"+\").replace(/_/g, \"/\");\nconst payload = JSON.parse(atob(base64));\n\nconsole.log(payload);\n// { sub: \"42\", name: \"Ana Souza\", role: \"aluno\", iat: 1720000000, exp: 1720003600 }\n\n// qualquer pessoa com o token em maos consegue rodar isso, atacante inclusive"
                    },
                    {
                        "type": "code",
                        "value": "// ERRADO: nunca guarde segredo, senha ou dado sensivel no payload\nconst payload = {\n  sub: usuario.id,\n  password: usuario.senhaEmTextoPuro,        // qualquer um le isso decodificando o token\n  cartaoDeCredito: \"4111 1111 1111 1111\"\n};\n\n// CERTO: so o necessario para identificar, nada sensivel\nconst payload = {\n  sub: usuario.id,\n  role: usuario.role\n};"
                    },
                    {
                        "type": "quote",
                        "value": "O payload de um JWT é uma vitrine, não um cofre: qualquer pessoa consegue ler o conteúdo dele sem precisar de senha nem segredo. Nunca guarde ali senha, número de cartão ou qualquer dado sensível."
                    }
                ],
                "questions": [
                    {
                        "statement": "O payload de um JWT pode ser lido por qualquer pessoa que tenha o token em mãos, sem precisar de senha nem segredo. Por quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o servidor manda a chave de leitura para o cliente junto com o próprio token, no mesmo pacote.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só tokens mal configurados por engano permitem esse tipo de leitura sem autorização prévia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o navegador descriptografa o payload automaticamente antes de exibir o conteúdo na tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o payload é só codificado em Base64url, uma codificação reversível sem chave, não criptografia.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual claim de um JWT costuma indicar o momento em que o token deixa de ser válido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "exp",
                                "isCorrect": true
                            },
                            {
                                "text": "sub",
                                "isCorrect": false
                            },
                            {
                                "text": "iat",
                                "isCorrect": false
                            },
                            {
                                "text": "role",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante uma revisão de código, um desenvolvedor propõe colocar a senha em texto puro do usuário dentro do payload do JWT, para o front-end poder exibi-la de novo caso ele peça confirmação da senha atual. Por que essa ideia deve ser recusada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o payload tem um limite fixo de tamanho que não permite guardar senhas de qualquer comprimento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o payload de um JWT não é secreto: qualquer um com o token consegue decodificá-lo e ler a senha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque claims customizadas, como password, não são permitidas pela especificação oficial do JWT.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque isso deixaria o token grande demais para caber no cabeçalho Authorization da requisição.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação guarda, na claim role do payload, o papel do usuário (comum ou administrador) para simplificar o front-end. O que é verdade sobre expor essa informação no payload?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não é problema de sigilo: role não é segredo e é visível a quem tem o token; o cuidado é não confiar nela cegamente.",
                                "isCorrect": true
                            },
                            {
                                "text": "É um erro grave, porque nenhuma claim além de sub e exp pode legalmente aparecer dentro do payload de um JWT.",
                                "isCorrect": false
                            },
                            {
                                "text": "É seguro porque o payload inteiro é criptografado antes de ser enviado, e ninguém além do servidor consegue lê-lo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só é seguro se o valor da claim role também for guardado hasheado, do mesmo jeito que se faz com uma senha.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um token JWT é interceptado por um atacante numa rede insegura. O atacante consegue ler todas as claims do payload, mas não consegue gerar um novo token válido com a claim role alterada para admin. O que explica essa diferença entre conseguir ler e não conseguir forjar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O atacante não consegue ler o payload, só a assinatura anexada ao final; por isso não sabe exatamente o que alterar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O payload muda de valor sozinho a cada minuto de forma totalmente aleatória, o que impede qualquer alteração útil.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ler o payload é só decodificar Base64url; forjar uma assinatura válida exige o segredo do servidor, que ele não tem.",
                                "isCorrect": true
                            },
                            {
                                "text": "A leitura do payload é possível, mas o servidor bloqueia automaticamente qualquer IP que tente decodificar um token.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A assinatura: como o servidor confia no token",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A assinatura: como o servidor confia no token\n\nVocê já viu que qualquer um consegue ler o payload de um JWT, e que isso é esperado (Base64url não é sigilo). Então o que, de fato, protege o token contra ser inventado ou alterado por qualquer pessoa? A resposta é a terceira parte: a **assinatura**.\n\nA assinatura é calculada em cima do header e do payload, usando um **segredo** que só o servidor conhece. Ela não esconde nada, mas garante duas coisas: que o token foi realmente emitido por quem diz ter emitido (**autenticidade**) e que ninguém alterou o conteúdo pelo caminho (**integridade**)."
                    },
                    {
                        "type": "text",
                        "value": "## Dois jeitos comuns de assinar\n\n- **HS256** (HMAC com SHA-256): o servidor usa **um único segredo** tanto para assinar quanto para verificar. Simples e rápido, ótimo quando é o mesmo servidor (ou um grupo de servidores que compartilham o segredo) que emite e valida os tokens.\n- **RS256** (RSA com SHA-256): usa um **par de chaves**. O servidor assina com a **chave privada** e qualquer serviço pode verificar com a **chave pública** correspondente, sem nunca precisar conhecer a chave privada. Útil quando outros serviços, de outras equipes ou até de outras empresas, precisam verificar o token sem poder emitir novos.\n\nNos dois casos, a lógica de confiança é a mesma: só quem tem a peça secreta (o segredo do HMAC, ou a chave privada do RSA) consegue gerar uma assinatura válida."
                    },
                    {
                        "type": "code",
                        "value": "// Payload original decodificado: { sub: \"42\", name: \"Ana Souza\", role: \"aluno\", ... }\n// Um atacante troca role para admin e recodifica so essa parte em base64url,\n// mantendo a assinatura antiga (ele nao tem o segredo pra gerar uma nova):\n\nconst tokenAdulterado =\n  \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\" + // header original\n  \".eyJzdWIiOiI0MiIsIm5hbWUiOiJBbmEgU291emEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MjAwMDAwMDAsImV4cCI6MTcyMDAwMzYwMH0\" + // payload com role trocado\n  \".bJPAuupjFaNpHPr0NqS88z-QIe4sHAGgsFa2jDP8lhM\"; // assinatura antiga, sem trocar\n\njwt.verify(tokenAdulterado, JWT_SECRET);\n// lanca JsonWebTokenError: invalid signature\n// o servidor recalcula a assinatura do header+payload que chegaram e ve que\n// nao bate com a assinatura anexada: rejeita na hora"
                    },
                    {
                        "type": "code",
                        "value": "import jwt from \"jsonwebtoken\";\n\nconst JWT_SECRET = process.env.JWT_SECRET; // nunca no codigo, sempre em variavel de ambiente\n\n// Emitir o token, por exemplo logo apos o login (o Modulo 5 monta essa rota inteira)\nconst token = jwt.sign(\n  { sub: usuario.id, role: usuario.role },\n  JWT_SECRET,\n  { expiresIn: \"15m\" }\n);\n\n// Verificar o token, por exemplo dentro de um middleware de autenticacao\ntry {\n  const payload = jwt.verify(token, JWT_SECRET);\n  console.log(payload.sub); // \"42\"\n} catch (erro) {\n  // assinatura invalida (token adulterado ou segredo errado) OU token expirado:\n  // jwt.verify lanca excecao nos dois casos, sem distinguir por padrao\n}"
                    },
                    {
                        "type": "text",
                        "value": "## O segredo mora só no servidor\n\nO segredo usado para assinar (a string usada no jwt.sign e no jwt.verify) nunca deve estar escrito direto no código. Ele fica numa **variável de ambiente** (process.env.JWT_SECRET), configurada fora do repositório, do mesmo jeito que você já protege a senha de conexão do banco. Se esse segredo vazar, qualquer pessoa consegue forjar tokens válidos para qualquer usuário, inclusive admin.\n\nAliás, repare que o middleware desta própria plataforma usa userId como nome da claim que identifica o usuário, em vez do sub padrão que você viu nas aulas anteriores. Funciona igual: o JWT não obriga nomes além dos poucos reservados, contanto que quem assina e quem verifica concordem sobre o nome usado.\n\nVale reforçar o que ficou da aula passada: a assinatura garante que o token não foi alterado, mas **não** torna o payload sigiloso. JWT é **assinado**, não **criptografado**: ele protege integridade e autenticidade, não protege confidencialidade."
                    },
                    {
                        "type": "quote",
                        "value": "A assinatura não esconde o conteúdo do token: ela garante que, se o header e o payload que chegaram baterem com a assinatura recalculada usando o segredo do servidor, ninguém alterou aquele token pelo caminho."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a assinatura de um JWT garante?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que o conteúdo do payload fica sigiloso e totalmente ilegível para qualquer pessoa que o intercepte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o token foi emitido por quem tem o segredo do servidor, e que o conteúdo não foi alterado depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o token nunca vai expirar, não importa quanto tempo passe desde que foi emitido originalmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a senha do usuário fica protegida e totalmente cifrada dentro do próprio conteúdo do token.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No jsonwebtoken do Node, quais funções emitem e verificam um token, respectivamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "jwt.sign() para emitir, jwt.verify() para verificar.",
                                "isCorrect": true
                            },
                            {
                                "text": "jwt.create() para emitir, jwt.check() para verificar.",
                                "isCorrect": false
                            },
                            {
                                "text": "jwt.encode() para emitir, jwt.decode() para verificar.",
                                "isCorrect": false
                            },
                            {
                                "text": "jwt.generate() para emitir, jwt.validate() para verificar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor está codificando a rota de login e decide escrever o segredo do JWT como uma string fixa direto na chamada de jwt.sign, dentro do próprio código-fonte, em vez de usar uma variável de ambiente. Qual é o problema real dessa prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum, contanto que o segredo escolhido tenha vários caracteres e alguma letra maiúscula no meio.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é só que isso deixaria o tempo de expiração do token bem mais curto do que deveria ser.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quem acessa o repositório, ou um vazamento dele, descobre o segredo e forja tokens de qualquer usuário.",
                                "isCorrect": true
                            },
                            {
                                "text": "É um problema só de estilo de código, não de segurança: funciona igual, só fica menos organizado assim.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de alterar manualmente o payload de um JWT (trocando o valor da claim role de aluno para admin, sem ter o segredo do servidor) e reenviar esse token alterado numa requisição, o que jwt.verify() faz no servidor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Recalcula a assinatura do header e do payload recebidos; como ela não bate com a anexada, rejeita o token.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aceita o token normalmente, porque o servidor confia em qualquer payload que esteja bem formatado em JSON.",
                                "isCorrect": false
                            },
                            {
                                "text": "Corrige sozinho o valor da claim role de volta para o original, sem interromper a requisição atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aceita o token, mas rebaixa automaticamente o usuário de volta para o papel correto no sistema todo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas equipes de serviços diferentes (A e B) precisam verificar tokens emitidos por um serviço central de autenticação, mas nenhuma das duas pode ter o poder de emitir novos tokens, só de validar os que chegam. Qual algoritmo de assinatura se encaixa melhor nesse cenário, e por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "HS256, porque o segredo único pode ser copiado com segurança para quantos serviços forem necessários, sem nenhum risco real.",
                                "isCorrect": false
                            },
                            {
                                "text": "RS256, porque nesse algoritmo a chave pública também permite emitir novos tokens, o que agiliza bastante o trabalho das equipes.",
                                "isCorrect": false
                            },
                            {
                                "text": "HS256, porque esse algoritmo dispensa qualquer tipo de segredo compartilhado entre os serviços A e B.",
                                "isCorrect": false
                            },
                            {
                                "text": "RS256: o serviço central assina com a chave privada e distribui só a chave pública, que verifica mas não pode assinar.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Sessão x JWT: qual escolher",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Sessão x JWT: qual escolher\n\nVocê já viu as duas abordagens completas: a **sessão** (Módulo 3), que guarda estado no servidor e entrega ao cliente só um id opaco num cookie, e o **JWT** (este módulo), que não guarda nada no servidor e entrega ao cliente um token autocontido e assinado. Nenhuma das duas é sempre a melhor: são jeitos diferentes de resolver o mesmo problema (lembrar quem é o usuário, apesar de o HTTP ser sem estado), com trocas diferentes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Critério\",\"Sessão (cookie + id)\",\"JWT (token)\"],[\"Onde fica o estado de login\",\"No servidor (memória, Redis ou banco)\",\"No próprio token, guardado pelo cliente\"],[\"Tamanho em cada requisição\",\"Pequeno: só um id opaco no cookie\",\"Maior: o token inteiro (header, payload e assinatura) vai e volta\"],[\"Revogar acesso antes da hora\",\"Fácil: apaga o registro da sessão no servidor\",\"Difícil: o token continua válido até expirar, a não ser que exista uma lista de revogação\"],[\"Escalar para vários servidores\",\"Exige estado compartilhado entre eles (Redis, banco)\",\"Qualquer servidor com o segredo verifica sozinho, sem estado compartilhado\"],[\"Uso típico\",\"Aplicação web tradicional, tudo no mesmo domínio\",\"API para SPA, app mobile ou vários serviços\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O ponto mais delicado: revogar\n\nO detalhe mais importante dessa comparação é a revogação. Numa sessão, o logout é simples: apaga a linha da sessão no servidor (ou no Redis), e o cookie vira inútil na próxima requisição.\n\nCom JWT, o servidor não guarda o token em lugar nenhum, então não existe uma linha para apagar. Um token assinado continua **válido** (a assinatura continua batendo) até a claim exp vencer, mesmo que o usuário já tenha feito logout ou tenha sido banido nesse meio tempo. É o preço de não guardar estado: você ganha escala, mas perde controle imediato."
                    },
                    {
                        "type": "text",
                        "value": "## Na prática, dá pra misturar\n\nUma saída comum, e é a que esta própria plataforma usa, é combinar os dois pontos fortes: um **JWT de vida curta** (um access token, valendo só alguns minutos) para as requisições do dia a dia, e um segundo token, opaco e de vida mais longa (um refresh token, esse sim guardado e revogável no banco), usado só para pedir um novo access token quando o atual expira. Assim, mesmo sem poder revogar o JWT em si, o estrago de um token vazado fica limitado a poucos minutos. Você vai construir esse fluxo completo no próximo módulo."
                    },
                    {
                        "type": "code",
                        "value": "// Formato de resposta usado nesta plataforma apos um login valido:\nres.cookie(\"refreshToken\", refreshToken, {\n  httpOnly: true,\n  secure: true,\n  sameSite: \"strict\",\n});\n\nres.json({\n  name: user.name,\n  email: user.email,\n  token: accessToken   // o JWT, de vida curta, usado no header Authorization\n});\n\n// o refresh token (nao e um JWT, e uma string aleatoria) fica so no cookie HttpOnly;\n// o access token (JWT) vai no corpo, e o front-end guarda e reenvia no header"
                    },
                    {
                        "type": "quote",
                        "value": "Sessão e JWT resolvem o mesmo problema de jeitos opostos: uma guarda estado no servidor e troca pouco a cada requisição, a outra não guarda nada e troca mais a cada requisição. A escolha certa depende de quanto controle você precisa ter para revogar acesso na hora."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em relação ao tamanho de cada requisição, o que costuma acontecer ao trocar sessão por JWT?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "As requisições ficam maiores, porque o token inteiro viaja a cada vez, não só um id pequeno como no cookie.",
                                "isCorrect": true
                            },
                            {
                                "text": "As requisições ficam menores, porque o JWT substitui todos os outros cabeçalhos da requisição HTTP inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não muda nada: o tamanho do cookie de sessão e do token JWT acabam sempre sendo exatamente iguais.",
                                "isCorrect": false
                            },
                            {
                                "text": "As requisições ficam maiores só quando o usuário logado é administrador do sistema todo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que revogar um JWT antes da hora (por exemplo, banir um usuário na hora) é mais difícil do que revogar uma sessão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o JWT não tem nenhuma claim de expiração, então ele nunca vence sozinho, em hipótese alguma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o servidor não guarda o JWT em lugar nenhum; ele segue válido até a claim exp vencer, sem mais nada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque revogar uma sessão também é sempre igualmente difícil, não existe diferença real entre as duas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o JWT é totalmente criptografado, e o servidor não consegue nem ler o que precisaria revogar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe está construindo uma API consumida por um app mobile e por múltiplos serviços de back-end, sem um domínio único compartilhado, e quer que qualquer serviço consiga validar quem está logado sem depender de consultar um Redis central a cada requisição. Qual abordagem tende a se encaixar melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "JWT, porque cada serviço verifica a assinatura sozinho, sem estado compartilhado a cada requisição.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sessão com cookie, porque cookies funcionam automaticamente em qualquer app mobile ou serviço externo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sessão em memória local de cada serviço, sem compartilhar absolutamente nada entre os serviços.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma das duas abordagens funciona fora de um único domínio compartilhado pelos serviços.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação web tradicional, toda num único domínio, precisa poder derrubar o acesso de um usuário instantaneamente sempre que o suporte marcar a conta como suspeita. Qual característica pesa a favor da sessão nesse caso, em vez de JWT puro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sessão sempre gera tokens bem menores que o JWT, o que já resolveria sozinho o requisito citado pelo suporte.",
                                "isCorrect": false
                            },
                            {
                                "text": "JWT não permite login em aplicações que rodam dentro de um único domínio compartilhado como esse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Com sessão, apagar o registro no servidor já corta o acesso; com JWT puro, o token seguiria válido até expirar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sessão dispensa completamente o uso de HTTPS, o que simplifica bastante o trabalho do time de suporte.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma plataforma usa um access token JWT de vida curta (poucos minutos) junto com um refresh token opaco de vida mais longa, guardado no banco. Por que essa combinação ataca justamente o ponto fraco do JWT puro discutido nesta aula, sem abrir mão da escala que o JWT oferece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o refresh token substitui totalmente a necessidade de assinatura e verificação no access token JWT.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o JWT curto limita o dano de um vazamento a minutos; o refresh token, revogável no banco, controla os acessos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o access token deixa de precisar de uma claim exp quando já existe um refresh token guardado no banco de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o refresh token é enviado sempre no mesmo cabeçalho Authorization que o access token, dobrando a segurança.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Login de ponta a ponta numa API",
        "aulas": [
            {
                "titulo": "Cadastro: criar o usuário com a senha em hash",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 5 - Login de ponta a ponta numa API\n\nNos módulos anteriores você separou os ingredientes: o bcrypt para nunca guardar senha em texto puro, e o JWT para autenticar sem o servidor precisar guardar estado. Chegou a hora de juntar tudo numa API Express de verdade, começando pelo primeiro passo de qualquer sistema de login: o cadastro.\n\nUma rota de cadastro (`POST /register`) recebe os dados do usuário, valida o que foi enviado, garante que o email ainda não está em uso, transforma a senha em hash e só então salva no banco, na tabela `usuarios`."
                    },
                    {
                        "type": "text",
                        "value": "## Validando a entrada antes de qualquer coisa\n\nAntes de tocar no banco, confira se os campos obrigatórios chegaram e se a senha atende a um tamanho mínimo. Isso importa porque o bcrypt transforma em hash qualquer coisa que você mandar para ele, até uma senha fraca como `123456`. Quem garante que a senha é forte é a validação, não o hash."
                    },
                    {
                        "type": "code",
                        "value": "const bcrypt = require('bcrypt');\nconst express = require('express');\nconst router = express.Router();\n\nrouter.post('/register', async (req, res) => {\n  const { nome, email, senha } = req.body;\n\n  if (!nome || !email || !senha) {\n    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });\n  }\n\n  if (senha.length < 8) {\n    return res.status(400).json({ erro: 'A senha precisa ter pelo menos 8 caracteres' });\n  }\n\n  const emailExistente = await db.query(\n    'SELECT id FROM usuarios WHERE email = $1',\n    [email]\n  );\n\n  if (emailExistente.rows.length > 0) {\n    return res.status(409).json({ erro: 'Este email já está cadastrado' });\n  }\n\n  const senhaHash = await bcrypt.hash(senha, 10);\n\n  const { rows } = await db.query(\n    `INSERT INTO usuarios (nome, email, senha_hash)\n     VALUES ($1, $2, $3)\n     RETURNING id, nome, email`,\n    [nome, email, senhaHash]\n  );\n\n  res.status(201).json(rows[0]);\n});\n\nmodule.exports = router;"
                    },
                    {
                        "type": "text",
                        "value": "## Nunca devolva a senha, nem o hash\n\nMesmo sendo praticamente impossível reverter um hash de bcrypt para a senha original, ele nunca deveria sair da API. Devolver `senha_hash` na resposta dá a quem for atacar sua aplicação material extra para tentar quebrar aquele hash offline, com calma e sem precisar da sua API no meio do caminho. A regra é simples: a resposta do cadastro (e de qualquer rota que devolva dados do usuário) inclui só os campos públicos, como `id`, `nome` e `email`, exatamente como o `RETURNING` da query acima já faz."
                    },
                    {
                        "type": "code",
                        "value": "// Resposta de sucesso (201 Created)\n{\n  \"id\": 42,\n  \"nome\": \"Marina Silva\",\n  \"email\": \"marina@exemplo.com\"\n}\n\n// Sem \"senha\" e sem \"senha_hash\" na resposta"
                    },
                    {
                        "type": "quote",
                        "value": "Cadastro não é só um INSERT: é validar a entrada, garantir que o email é único, transformar a senha em hash com bcrypt e nunca deixar a senha (ou o hash) aparecer na resposta."
                    }
                ],
                "questions": [
                    {
                        "statement": "Depois de gerar o hash da senha com bcrypt.hash, o que a rota de cadastro deve salvar na coluna de senha da tabela usuarios?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O hash gerado por bcrypt.hash, já que a senha original não pode ficar salva",
                                "isCorrect": true
                            },
                            {
                                "text": "A senha original digitada pelo usuário, caso ele esqueça e precise vê-la de novo",
                                "isCorrect": false
                            },
                            {
                                "text": "A senha e o hash juntos, para o login poder conferir de dois jeitos diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Um hash MD5 da senha, que é bem mais rápido de calcular do que o do bcrypt",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a rota de cadastro consulta o banco para ver se o email já existe antes de inserir o novo usuário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o bcrypt exige emails únicos para conseguir gerar o hash da senha",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o email precisa ser único para identificar a conta certa no login",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Express recusa emails repetidos sozinho, e a checagem confirma",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque, sem essa consulta, o jwt.sign não consegue emitir o token depois",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota de cadastro devolve, na resposta de sucesso, o registro inteiro do usuário como veio do banco, incluindo a coluna senha_hash. Qual é o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum, já que é um hash e não a senha em texto puro",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é só o tamanho da resposta ficar maior que o necessário",
                                "isCorrect": false
                            },
                            {
                                "text": "O hash nunca deveria sair da API, pois ajuda um atacante a quebrá-lo offline",
                                "isCorrect": true
                            },
                            {
                                "text": "O problema existiria apenas se a coluna se chamasse \"senha\", e não \"senha_hash\"",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um formulário de cadastro envia a senha 123456 e a API aceita sem restrição, calcula o hash e salva. O que está faltando na rota?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nada, pois o bcrypt torna qualquer senha segura sozinho, não importa o conteúdo",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o bcrypt por um algoritmo mais rápido para compensar a senha fraca",
                                "isCorrect": false
                            },
                            {
                                "text": "Pedir para o usuário confirmar a senha digitando tudo em letras maiúsculas",
                                "isCorrect": false
                            },
                            {
                                "text": "Validar a senha antes do hash, pois o bcrypt não recusa senha fraca",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Ao chamar bcrypt.hash(senha, 10), o que representa o segundo argumento (10)?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O custo do algoritmo, que define quantos rounds e quão lento é o hash",
                                "isCorrect": true
                            },
                            {
                                "text": "O tamanho máximo, em caracteres, que a senha pode ter por segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de tentativas de login, que bloqueia a conta após excedido",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo em minutos, que faz o hash expirar e exigir novo cadastro",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Login: conferir a senha e emitir o token",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Login: hora de conferir a senha e emitir o token\n\nCom o cadastro funcionando, a tabela `usuarios` já tem gente cadastrada com a senha em hash. A rota de login (`POST /login`) faz o caminho inverso: busca o usuário pelo email, usa `bcrypt.compare` para conferir se a senha enviada bate com o hash salvo e, se bater, emite um token com `jwt.sign`. Se não bater (ou o email nem existir), a resposta é `401`."
                    },
                    {
                        "type": "code",
                        "value": "const jwt = require('jsonwebtoken');\n\nrouter.post('/login', async (req, res) => {\n  const { email, senha } = req.body;\n\n  if (!email || !senha) {\n    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });\n  }\n\n  const { rows } = await db.query(\n    'SELECT id, email, senha_hash FROM usuarios WHERE email = $1',\n    [email]\n  );\n\n  const usuario = rows[0];\n\n  if (!usuario) {\n    return res.status(401).json({ erro: 'Email ou senha inválidos' });\n  }\n\n  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);\n\n  if (!senhaCorreta) {\n    return res.status(401).json({ erro: 'Email ou senha inválidos' });\n  }\n\n  const token = jwt.sign(\n    { sub: usuario.id, email: usuario.email },\n    process.env.JWT_SECRET,\n    { expiresIn: '15m' }\n  );\n\n  res.json({ token });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## A mesma mensagem para os dois casos de erro\n\nRepare que a rota acima responde com a mesma mensagem, \"Email ou senha inválidos\", tanto quando o email não é encontrado quanto quando a senha está errada. Isso é proposital. Se a API dissesse \"esse email não existe\", qualquer pessoa poderia testar uma lista de emails contra a sua rota de login e descobrir quem está cadastrado na plataforma, mesmo sem acertar nenhuma senha. Esse vazamento de informação tem nome, enumeração de usuários, e a defesa é simples: sempre a mesma resposta e o mesmo código `401` para os dois casos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"Resposta que vaza informação\", \"Resposta correta\"], [\"Email não cadastrado\", \"404, avisando que o email não existe\", \"401, mensagem genérica\"], [\"Senha errada\", \"401, avisando que a senha está errada\", \"401, mensagem genérica\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que colocar dentro do token\n\nO payload do `jwt.sign` carrega só o necessário para identificar o usuário nas próximas requisições, normalmente o `sub` (o id do usuário) e, se for útil, o email. Nada sensível entra ali: senha, hash ou qualquer segredo não têm lugar no payload, porque ele não é criptografado, só codificado em base64url. Qualquer pessoa com o token em mãos consegue decodificar e ler o payload; só não consegue alterá-lo sem invalidar a assinatura conferida pelo `jwt.verify`."
                    },
                    {
                        "type": "quote",
                        "value": "Login é bcrypt.compare para conferir a senha e jwt.sign para emitir o token, sempre com a mesma mensagem genérica de erro, não importa se o problema foi o email ou a senha."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na rota de login, qual chamada confere se a senha enviada bate com o hash salvo no banco?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "jwt.verify(senha, hashSalvo)",
                                "isCorrect": false
                            },
                            {
                                "text": "bcrypt.compare(senha, hashSalvo)",
                                "isCorrect": true
                            },
                            {
                                "text": "bcrypt.hash(hashSalvo, senha)",
                                "isCorrect": false
                            },
                            {
                                "text": "jwt.sign(senha, hashSalvo)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a rota de login devolve para o cliente quando a senha confere?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O hash da senha, direto da coluna senha_hash",
                                "isCorrect": false
                            },
                            {
                                "text": "O id da sessão criada no servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Um token JWT assinado, gerado com jwt.sign",
                                "isCorrect": true
                            },
                            {
                                "text": "A senha do usuário, em texto puro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a mensagem de erro do login deve ser a mesma tanto quando o email não existe quanto quando a senha está errada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque bcrypt.compare sempre devolve o mesmo erro nesses dois casos",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Express não permite personalizar mensagens de erro diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Só para simplificar o código e economizar linhas na rota",
                                "isCorrect": false
                            },
                            {
                                "text": "Para não revelar se aquele email está cadastrado na plataforma",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Numa rota de login, o email informado não é encontrado no banco. O que a rota deve responder?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "401, com a mesma mensagem genérica usada para senha errada",
                                "isCorrect": true
                            },
                            {
                                "text": "200, sugerindo que o usuário refaça o cadastro com aquele email",
                                "isCorrect": false
                            },
                            {
                                "text": "404, avisando que aquele email não está cadastrado no banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Redirecionar a requisição automaticamente para a rota de cadastro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que colocar a senha (ou o hash da senha) dentro do payload do jwt.sign seria um erro grave?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o jwt.sign apagaria a senha automaticamente ao montar o token",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o payload do JWT é só codificado em base64url, não criptografado",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o token deixaria de funcionar com o bcrypt.compare na próxima vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o payload tem um limite de 10 caracteres e a senha não caberia",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O middleware de autenticação: protegendo rotas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O middleware que protege as rotas\n\nEmitir o token no login resolve metade do problema. A outra metade é conferir esse token em toda rota que exige um usuário autenticado, sem repetir a mesma lógica em cada uma delas. É para isso que existe o middleware de autenticação: uma função que fica entre a requisição e a rota, e só deixa passar quem apresenta um token válido."
                    },
                    {
                        "type": "code",
                        "value": "const jwt = require('jsonwebtoken');\n\nfunction autenticar(req, res, next) {\n  const authHeader = req.headers.authorization;\n\n  if (!authHeader || !authHeader.startsWith('Bearer ')) {\n    return res.status(401).json({ erro: 'Token não informado' });\n  }\n\n  const token = authHeader.split(' ')[1];\n\n  try {\n    const payload = jwt.verify(token, process.env.JWT_SECRET);\n    req.userId = payload.sub;\n    next();\n  } catch (erro) {\n    return res.status(401).json({ erro: 'Token inválido ou expirado' });\n  }\n}\n\nmodule.exports = autenticar;"
                    },
                    {
                        "type": "text",
                        "value": "## Passo a passo do middleware\n\n- Lê o header `Authorization` e confere se ele começa com `Bearer `.\n- Se o header não existir ou estiver em outro formato, responde `401` na hora, sem chamar `next()`.\n- Extrai só o token, a parte que vem depois de `Bearer `.\n- Chama `jwt.verify(token, segredo)`. Se o token estiver adulterado, malformado ou expirado, essa chamada lança um erro.\n- Se o token for válido, guarda o que a rota vai precisar (aqui, `req.userId`) e chama `next()` para a requisição seguir adiante."
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\nconst autenticar = require('./middlewares/autenticar');\nconst router = express.Router();\n\nrouter.get('/perfil', autenticar, async (req, res) => {\n  const { rows } = await db.query(\n    'SELECT id, nome, email FROM usuarios WHERE id = $1',\n    [req.userId]\n  );\n\n  res.json(rows[0]);\n});\n\nmodule.exports = router;"
                    },
                    {
                        "type": "text",
                        "value": "## O mesmo padrão na prática\n\nÉ esse o papel do middleware `autenticar` usado nas rotas protegidas da própria ensina.dev: ele fica na frente de qualquer rota que exige login (marcar uma aula como concluída, editar o perfil, ver o progresso na trilha) e popula `req.userId` para que a rota use sem precisar decodificar o token de novo."
                    },
                    {
                        "type": "quote",
                        "value": "O middleware de autenticação é o pedágio antes da rota: sem token válido no header Authorization, ninguém passa; com token válido, req.userId chega pronto para a rota usar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Onde o middleware de autenticação lê o token enviado pelo cliente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "No corpo (body) da requisição, junto com a senha",
                                "isCorrect": false
                            },
                            {
                                "text": "Em um cookie de sessão que se chama token",
                                "isCorrect": false
                            },
                            {
                                "text": "No header Authorization, como Bearer <token>",
                                "isCorrect": true
                            },
                            {
                                "text": "Na URL, como parâmetro de busca (query string)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o middleware de autenticação faz depois de validar o token com sucesso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Envia a resposta final ao cliente e encerra a requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Apaga o token para impedir que seja reutilizado",
                                "isCorrect": false
                            },
                            {
                                "text": "Gera um novo token e o devolve na resposta",
                                "isCorrect": false
                            },
                            {
                                "text": "Guarda os dados do usuário (como req.userId) e chama next()",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota que deveria exigir login está respondendo normalmente mesmo sem o header Authorization na requisição. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O middleware de autenticação não foi adicionado antes dessa rota",
                                "isCorrect": true
                            },
                            {
                                "text": "O jwt.verify libera o acesso por padrão quando não recebe token",
                                "isCorrect": false
                            },
                            {
                                "text": "O bcrypt.compare está retornando true mesmo sem senha",
                                "isCorrect": false
                            },
                            {
                                "text": "O Express ignora headers ausentes e libera a rota sozinho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "jwt.verify lança um erro ao validar o token recebido numa rota protegida. O que o middleware deve fazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Deixar o erro estourar sem tratamento, travando toda a requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Capturar o erro num try/catch e responder 401, sem chamar next()",
                                "isCorrect": true
                            },
                            {
                                "text": "Gerar um novo token automaticamente e seguir com a requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Chamar next() mesmo assim e deixar a rota decidir o que fazer",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é melhor usar um middleware de autenticação compartilhado, como autenticar, em vez de repetir jwt.verify dentro de cada rota protegida?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque middlewares são executados mais rápido do que código dentro de uma rota",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque assim o token nunca expira, mesmo depois do tempo definido em expiresIn",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque centraliza a verificação num lugar, evitando duplicação e esquecimentos",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Express só aceita jwt.verify quando ele está dentro de um middleware",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Access token e refresh token: curto e longo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dois tokens, dois tempos de vida\n\nAté aqui, o login emitiu um único token. O problema é que um token de vida longa é perigoso (se vazar, o estrago dura enquanto ele continuar válido) e um token de vida curta é chato para quem usa a aplicação (o usuário seria deslogado toda hora). A solução usada na prática é separar as responsabilidades em dois tokens: o access token, curto, e o refresh token, longo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"Access token\", \"Refresh token\"], [\"Duração típica\", \"Curta (ex.: 15 minutos)\", \"Longa (ex.: 7 dias)\"], [\"Para que serve\", \"Autenticar cada requisição a rotas protegidas\", \"Pedir um novo access token quando o atual expira\"], [\"Onde costuma ficar\", \"Em memória no cliente, enviado no header Authorization\", \"Em um local mais protegido, como cookie HttpOnly\"], [\"Se vazar\", \"Estrago limitado, expira rápido\", \"Estrago maior, vale por mais tempo\"]]"
                    },
                    {
                        "type": "code",
                        "value": "const token = jwt.sign(\n  { sub: usuario.id, email: usuario.email },\n  process.env.JWT_SECRET,\n  { expiresIn: '15m' }\n);\n\nconst refreshToken = jwt.sign(\n  { sub: usuario.id },\n  process.env.JWT_REFRESH_SECRET,\n  { expiresIn: '7d' }\n);\n\nres.json({ token, refreshToken });"
                    },
                    {
                        "type": "text",
                        "value": "## O fluxo de renovação\n\nQuando o access token expira, 15 minutos depois de emitido, por exemplo, o cliente não precisa pedir a senha de novo para o usuário. Em vez disso, ele manda o refresh token para uma rota dedicada, `POST /refresh`, que confere se aquele refresh token ainda é válido e devolve um access token novo, pronto para as próximas requisições."
                    },
                    {
                        "type": "code",
                        "value": "router.post('/refresh', async (req, res) => {\n  const { refreshToken } = req.body;\n\n  if (!refreshToken) {\n    return res.status(401).json({ erro: 'Refresh token não informado' });\n  }\n\n  try {\n    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);\n\n    const novoToken = jwt.sign(\n      { sub: payload.sub },\n      process.env.JWT_SECRET,\n      { expiresIn: '15m' }\n    );\n\n    res.json({ token: novoToken });\n  } catch (erro) {\n    return res.status(401).json({ erro: 'Refresh token inválido ou expirado' });\n  }\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Onde cada token costuma ficar\n\nO access token normalmente fica em memória no cliente (uma variável, um estado da aplicação) e é anexado no header `Authorization` de cada requisição. O refresh token, por durar mais e valer mais a pena proteger, costuma ficar num lugar mais controlado, como um cookie `HttpOnly`, reduzindo o risco de ser lido por um script malicioso rodando na página."
                    },
                    {
                        "type": "quote",
                        "value": "Access token curto limita o estrago se vazar; refresh token longo evita que o usuário precise logar de novo a cada poucos minutos."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal razão para o access token ter uma duração curta, como 15 minutos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reduzir o tamanho do arquivo JSON gerado pelo jwt.sign a cada login",
                                "isCorrect": false
                            },
                            {
                                "text": "Fazer o bcrypt processar e comparar as senhas mais rápido",
                                "isCorrect": false
                            },
                            {
                                "text": "Evitar que o servidor precise usar um banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Limitar o estrago caso o token seja roubado, pois expira rápido",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o refresh token?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Para obter um novo access token sem pedir a senha de novo",
                                "isCorrect": true
                            },
                            {
                                "text": "Para substituir a senha do usuário na próxima vez que ele logar",
                                "isCorrect": false
                            },
                            {
                                "text": "Para criptografar o payload do access token a cada requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Para guardar os dados do usuário no lugar da tabela usuarios",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se o access token dura só 15 minutos, o usuário precisa digitar a senha de novo a cada 15 minutos para continuar usando a aplicação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, esse é o preço de usar tokens de curta duração",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque o cliente usa o refresh token para pedir um novo access token",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, porque o access token se renova sozinho, sem nenhuma requisição nova",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, a menos que a aplicação troque o JWT por sessão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o refresh token costuma ter uma duração muito maior que o access token, como dias em vez de minutos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque ele é assinado com um algoritmo diferente e mais forte que o access token",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ele nunca trafega pela rede, então não corre risco de ser interceptado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ele é usado bem menos, então pode durar mais sem tanto risco",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o jsonwebtoken exige um tempo mínimo de validade para refresh tokens",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na rota /refresh, o refresh token enviado está expirado. O que a rota deve fazer?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Gerar um novo access token mesmo assim, para não atrapalhar o usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignorar a expiração, já que refresh token não deveria expirar",
                                "isCorrect": false
                            },
                            {
                                "text": "Devolver o hash da senha para o cliente conferir localmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Responder 401, obrigando o usuário a logar de novo com email e senha",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O ciclo completo de uma requisição autenticada",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Juntando tudo: o ciclo completo\n\nChegou a hora de ver o fluxo inteiro, do login até a resposta de uma rota protegida, exatamente como acontece numa API real."
                    },
                    {
                        "type": "text",
                        "value": "## O caminho de uma requisição autenticada\n\n1. O cliente manda email e senha para `POST /login`.\n2. O servidor confere a senha com `bcrypt.compare` e, se bater, devolve um token gerado com `jwt.sign`.\n3. O cliente guarda o token (em memória, por exemplo) para usar nas próximas requisições.\n4. Em toda requisição a uma rota protegida, o cliente manda o token no header `Authorization: Bearer <token>`.\n5. O middleware `autenticar` roda antes da rota, valida o token com `jwt.verify` e popula `req.userId`.\n6. Se estiver tudo certo, a rota executa normalmente e responde; se o token faltar, estiver errado ou tiver expirado, o middleware responde `401` antes mesmo de a rota rodar."
                    },
                    {
                        "type": "code",
                        "value": "// 1. Login: envia email e senha, recebe o token\nconst respostaLogin = await fetch('https://api.ensina.dev/login', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ email, senha })\n});\n\nconst { token } = await respostaLogin.json();\n\n// 2. Guarda o token (aqui, em uma variável em memória)\nlet tokenAtual = token;\n\n// 3. Usa o token no header Authorization das próximas requisições\nconst respostaPerfil = await fetch('https://api.ensina.dev/perfil', {\n  headers: {\n    'Authorization': `Bearer ${tokenAtual}`\n  }\n});\n\nconst perfil = await respostaPerfil.json();"
                    },
                    {
                        "type": "text",
                        "value": "## Cuidados que valem para qualquer API com JWT\n\n- HTTPS sempre: sem ele, o token viaja em texto puro pela rede, e qualquer um no meio do caminho pode capturá-lo e usá-lo como se fosse o usuário dono dele.\n- Expiração é proteção, não detalhe: um access token curto reduz a janela de uso caso ele seja roubado.\n- Logout com JWT não é igual a logout com sessão: numa sessão, o servidor apaga o registro e o acesso cai na hora. Com JWT puro, o servidor não guarda estado nenhum, então o token continua tecnicamente válido até expirar, mesmo depois do usuário \"sair\" (que, do lado do cliente, é só apagar o token guardado)."
                    },
                    {
                        "type": "text",
                        "value": "## Do problema da identidade até aqui\n\nVocê começou esse percurso entendendo por que o HTTP esquece quem você é a cada requisição (Módulo 1), aprendeu a guardar senha do jeito certo com bcrypt (Módulo 2), viu como sessão e cookie resolvem o esquecimento guardando estado no servidor (Módulo 3) e como o JWT faz o mesmo sem estado nenhum (Módulo 4). Neste módulo, tudo isso virou código: cadastro, login, middleware, access e refresh token. Falta uma peça: saber não só quem é o usuário, mas o que ele pode fazer. Essa é a autorização, assunto do próximo módulo."
                    },
                    {
                        "type": "quote",
                        "value": "Autenticar é provar quem você é uma vez, no login; o token é a prova que você carrega depois, requisição após requisição, até expirar."
                    }
                ],
                "questions": [
                    {
                        "statement": "No ciclo de uma requisição autenticada, o que o cliente faz logo depois de receber o token na resposta do login?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Guarda o token em memória para reenviá-lo nas próximas requisições",
                                "isCorrect": true
                            },
                            {
                                "text": "Descarta o token, pois ele só vale para a resposta do login",
                                "isCorrect": false
                            },
                            {
                                "text": "Transforma o token numa nova senha para os próximos logins",
                                "isCorrect": false
                            },
                            {
                                "text": "Envia o token de volta ao servidor na mesma requisição, sem guardar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em qual header o cliente deve enviar o token nas requisições às rotas protegidas, seguindo o padrão Bearer?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O header Content-Type",
                                "isCorrect": false
                            },
                            {
                                "text": "O header Authorization",
                                "isCorrect": true
                            },
                            {
                                "text": "Um cookie chamado token",
                                "isCorrect": false
                            },
                            {
                                "text": "Um header chamado Token",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API que autentica com JWT no header Authorization está rodando em produção sem HTTPS, só HTTP puro. Qual é o risco?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum, já que o JWT é assinado e não pode ser lido por terceiros",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco existiria só se a senha fosse enviada, e não o token",
                                "isCorrect": false
                            },
                            {
                                "text": "O token pode ser interceptado na rede e usado para se passar pelo usuário",
                                "isCorrect": true
                            },
                            {
                                "text": "O Express detecta e bloqueia sozinho qualquer conexão que não seja HTTPS",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Diferente de uma sessão, fazer logout usando só JWT (sem lista de tokens revogados no servidor) tem qual limitação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O JWT é apagado automaticamente do servidor assim que o logout acontece",
                                "isCorrect": false
                            },
                            {
                                "text": "O logout com JWT funciona exatamente como o logout de sessão, sem diferença",
                                "isCorrect": false
                            },
                            {
                                "text": "É impossível implementar logout de qualquer forma numa API que usa JWT",
                                "isCorrect": false
                            },
                            {
                                "text": "O token continua válido até expirar, já que o servidor não guarda estado nenhum",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a ordem correta do ciclo de uma requisição autenticada usando JWT?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Login com email e senha -> servidor emite o token -> cliente envia no header Authorization -> middleware verifica -> rota responde",
                                "isCorrect": true
                            },
                            {
                                "text": "Cliente envia o token primeiro -> servidor cria uma senha nova -> middleware guarda a sessão -> rota confere o banco -> resposta é enviada",
                                "isCorrect": false
                            },
                            {
                                "text": "Servidor emite o token -> cliente faz login logo em seguida -> middleware apaga o token -> rota confere o banco -> resposta é enviada",
                                "isCorrect": false
                            },
                            {
                                "text": "Login com email e senha -> middleware verifica o token antes mesmo de ele existir -> servidor emite o token -> rota responde",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Autorização: papéis e permissões",
        "aulas": [
            {
                "titulo": "Autorização: estar logado não é poder tudo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 6 - Autorização: papéis e permissões\n\nNos módulos anteriores você resolveu a primeira metade do problema de identidade numa API: o usuário se cadastra, a senha vira hash com bcrypt antes de tocar o banco, ele faz login e recebe um JWT, e a cada requisição seguinte o middleware `autenticar` lê o header `Authorization`, verifica a assinatura do token e popula `req.user` com quem está fazendo aquele pedido. Isso é autenticação: o servidor sabe QUEM está do outro lado.\n\nSó que saber quem alguém é não diz nada sobre o que essa pessoa pode fazer. É essa segunda pergunta, a autorização, que abre este módulo.\n\nImagine uma API de tarefas onde qualquer pessoa pode criar conta. Um usuário comum se autentica normalmente, o token é válido, `req.user` vem populado, tudo funcionando como devia. Só que esse mesmo usuário decide chamar a rota que apaga uma trilha inteira do catálogo, uma ação que deveria ser exclusiva de um administrador. Se a única pergunta que o servidor faz for \"esse token é válido?\", a resposta é sim, e a ação passa. Esse é exatamente o buraco que a autorização existe para fechar."
                    },
                    {
                        "type": "text",
                        "value": "## Duas perguntas, duas checagens\n\nToda ação sensível numa API passa, na prática, por duas perguntas bem diferentes:\n\n1. **Autenticação**: quem é você? O token veio de um login legítimo, ainda vale, não foi adulterado.\n2. **Autorização**: você pode fazer isso? O seu papel permite essa ação, e (quando for o caso) esse recurso específico é seu.\n\nEstar autenticado só responde a primeira pergunta. Um token válido prova identidade, não prova permissão. As duas checagens são independentes e falham por motivos diferentes: dá para estar autenticado e mesmo assim barrado (um aluno tentando apagar uma trilha), e dá para nem chegar perto da segunda pergunta por já falhar na primeira (uma requisição sem token nenhum)."
                    },
                    {
                        "type": "code",
                        "value": "// rota ingênua: só verifica se existe um token válido\nconst express = require('express');\nconst { autenticar } = require('../middlewares/autenticar');\n\nconst router = express.Router();\n\n// PROBLEMA: qualquer usuário autenticado apaga qualquer trilha,\n// inclusive um aluno comum. Falta perguntar se ele TEM PERMISSÃO para isso.\nrouter.delete('/trilhas/:id', autenticar, async (req, res) => {\n  await apagarTrilha(req.params.id);\n  res.status(204).send();\n});\n\nmodule.exports = router;"
                    },
                    {
                        "type": "text",
                        "value": "## O checklist mental por trás de cada rota protegida\n\nAntes de escrever qualquer rota que mexe em dado sensível, vale rodar mentalmente três perguntas: quem está fazendo essa requisição, o que essa pessoa está pedindo para fazer, e se ela tem permissão para isso especificamente. As duas primeiras já ficam resolvidas pela autenticação e pelos parâmetros da própria rota. A terceira é autorização pura, e ela raramente é genérica: cada recurso tem sua própria regra de quem pode mexer nele.\n\nÉ por isso que autorização não dá para resolver de uma vez só, como a autenticação. Um único middleware `autenticar` cobre a API inteira, porque validar um token é sempre a mesma operação. Autorização muda de rota para rota: apagar uma trilha exige ser admin, editar uma tarefa exige ser o dono dela, ver o próprio progresso exige só estar logado. Cada regra pede sua própria checagem."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Autenticação\",\"Autorização\"],[\"Pergunta que responde\",\"Quem é você?\",\"O que você pode fazer?\"],[\"Quando roda\",\"Uma vez por requisição, ao validar o token\",\"A cada ação sensível, com regras específicas do recurso\"],[\"Onde mora a lógica\",\"Um middleware genérico (ex.: autenticar)\",\"Middlewares e checagens específicas (papel, dono do recurso)\"],[\"Se falhar\",\"401 Unauthorized: ninguém foi identificado\",\"403 Forbidden: identificado, mas sem permissão\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Do outro lado da tela: admin e aluno\n\nA própria ensina.dev vive esse problema todos os dias. Quem se cadastra na plataforma entra como aluno: consome trilhas, responde quiz, acompanha o próprio progresso. Só uma conta marcada como admin pode criar uma trilha nova, editar o conteúdo de uma aula ou mexer em dados de outros usuários. As duas contas passam pelo mesmíssimo login e pelo mesmíssimo middleware de autenticação, a diferença mora inteiramente na camada de autorização, que é o assunto das próximas aulas: como agrupar permissões em papéis, como proteger uma rota por papel, e como garantir que cada usuário só mexa no que é dele."
                    },
                    {
                        "type": "quote",
                        "value": "Autenticação prova quem você é. Autorização decide o que você pode fazer. Um token válido só resolve a primeira pergunta: a segunda tem que ser checada em toda ação sensível, sempre no servidor."
                    }
                ],
                "questions": [
                    {
                        "statement": "O middleware autenticar verificou o JWT com sucesso e populou req.user. Isso significa que:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O usuário está identificado, mas isso não garante que ele tenha permissão para a ação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pode executar qualquer ação, pois provar identidade também concede acesso total ao sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "É tratado como administrador, já que passou pela validação do token com sucesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma outra checagem é necessária, pois o middleware autenticar já cobre toda a rota.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota DELETE /trilhas/:id usa apenas o middleware autenticar e não faz nenhuma outra verificação. Qual é o risco?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Nenhum risco: um token válido já garante que quem está pedindo tem permissão para apagar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Qualquer usuário autenticado, mesmo um aluno comum, apaga uma trilha por faltar checagem de papel.",
                                "isCorrect": true
                            },
                            {
                                "text": "O risco só existe se o token estiver expirado, porque um token válido já basta para autorizar a ação.",
                                "isCorrect": false
                            },
                            {
                                "text": "A rota falha automaticamente, porque o Express exige checagem de papel em qualquer rota por padrão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que autenticação costuma ser resolvida por um único middleware genérico, enquanto autorização exige checagens específicas em cada rota?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o Express não permite reaproveitar o mesmo middleware de autenticação em rotas diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque autorização só é necessária em APIs que usam sessão, nunca em APIs baseadas em JWT.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque validar um token é sempre a mesma operação, mas as regras de acesso variam por recurso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque autenticação é uma etapa opcional da API, enquanto autorização é sempre obrigatória.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aluno da plataforma está autenticado (token válido) e tenta acessar a rota de criação de uma nova trilha, ação reservada a administradores. O que deveria acontecer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A autenticação deveria falhar, já que apenas administradores têm tokens considerados válidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A requisição deve ser aceita, porque um token válido já garante acesso total a qualquer rota.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor deve ignorar o token e pedir um novo login, já que o papel não veio especificado nele.",
                                "isCorrect": false
                            },
                            {
                                "text": "A autenticação passa, mas uma checagem de autorização separada barra a ação pelo papel dele.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma API só verifica se existe um token válido antes de executar qualquer ação sensível, incluindo apagar recursos e promover usuários a admin. Qual é o problema estrutural dessa abordagem?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ela trata autorização como sinônimo de autenticação, dando a todo usuário autenticado o mesmo poder.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela torna o JWT inválido antes da hora, porque cada ação sensível força a geração de um token novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela impede novos usuários de se cadastrarem, já que o cadastro também passa pela checagem de token válido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela é impossível de implementar usando Express e jsonwebtoken, que exigem checagem explícita de papel.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Papéis e RBAC: admin x usuário comum",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## RBAC: agrupar permissões em papéis\n\nDá para imaginar um sistema de autorização em que cada usuário tem sua própria lista de permissões, uma a uma: fulano pode criar trilha, fulano pode editar usuário, fulano pode ver relatório. Funciona para meia dúzia de contas, mas não escala: a cada usuário novo, alguém precisa montar a lista inteira de novo, e a menor inconsistência já vira uma brecha de segurança.\n\nO RBAC (Role-Based Access Control, controle de acesso baseado em papéis) resolve isso com um nível de indireção. Em vez de dar permissões direto para cada pessoa, você define papéis, que são pacotes de permissões com nome (admin, editor, aluno), e associa cada usuário a um papel. Trocar o que um papel pode fazer muda o comportamento de todo mundo que tem aquele papel, de uma vez só. Adicionar um usuário novo é só escolher qual papel ele recebe."
                    },
                    {
                        "type": "text",
                        "value": "## Admin e aluno na prática\n\nA ensina.dev usa RBAC da forma mais simples que existe, com dois papéis:\n\n- **Aluno**: o papel padrão de quem se cadastra. Consome trilhas, responde quiz, acompanha o próprio progresso, resolve desafios e simulados.\n- **Admin**: papel reservado para a equipe da plataforma. Além de tudo que um aluno faz, cria e edita trilhas, mexe no conteúdo das aulas e administra outros usuários.\n\nRepare que o papel não é uma permissão isolada, é um pacote delas. Perguntar 'esse usuário é admin?' já responde, de uma vez, a um monte de perguntas menores: pode criar trilha, pode editar aula, pode banir usuário. É exatamente essa compactação que faz o RBAC valer a pena."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ação\",\"Aluno\",\"Admin\"],[\"Ver trilhas e fazer aulas\",\"sim\",\"sim\"],[\"Responder quiz e ver o próprio progresso\",\"sim\",\"sim\"],[\"Criar ou editar uma trilha\",\"não\",\"sim\"],[\"Editar o conteúdo de uma aula\",\"não\",\"sim\"],[\"Ver ou alterar dados de outro usuário\",\"não\",\"sim\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## De onde vem o papel na hora de checar\n\nQuando uma requisição chega, de onde o servidor tira o papel do usuário para decidir se libera ou barra a ação? Duas respostas comuns:\n\n- **Claim dentro do token**: o papel vai junto no payload do JWT, gerado no momento do login. O middleware só decodifica o token e já tem o papel em mãos, sem tocar no banco de novo.\n- **Consulta ao banco**: o token carrega só o id do usuário, e uma consulta busca o papel atual na tabela de usuários a cada checagem.\n\nA primeira opção é mais rápida (zero consultas extras), mas tem um efeito colateral: se o papel de alguém mudar (um admin ser rebaixado, por exemplo), o token antigo continua com o papel antigo até expirar. A segunda opção custa uma consulta a mais, mas reflete qualquer mudança de papel imediatamente, na próxima requisição."
                    },
                    {
                        "type": "code",
                        "value": "// opção 1: o papel viaja dentro do token, como claim\nconst jwt = require('jsonwebtoken');\n\nfunction gerarToken(usuario) {\n  return jwt.sign(\n    { id: usuario.id, role: usuario.role }, // role: 'admin' ou 'aluno'\n    process.env.JWT_SECRET,\n    { expiresIn: '15m' }\n  );\n}\n\n// payload depois de decodificado, só para ilustrar:\n// { id: 'a1b2c3', role: 'aluno', iat: 1752120000, exp: 1752120900 }\n\n// o middleware de autenticação já devolve o papel dentro de req.user\nfunction autenticar(req, res, next) {\n  const authHeader = req.headers.authorization;\n  if (!authHeader) {\n    return res.status(401).json({ erro: 'Token não fornecido' });\n  }\n\n  const token = authHeader.split(' ')[1];\n\n  try {\n    const payload = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = { id: payload.id, role: payload.role };\n    next();\n  } catch {\n    return res.status(401).json({ erro: 'Token inválido' });\n  }\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Como a ensina.dev realmente faz\n\nVale contar como a própria plataforma resolve esse dilema: o token da ensina.dev carrega só o id do usuário, enxuto de propósito. Quando uma rota precisa confirmar que quem está pedindo é admin, um middleware dedicado (`exigirAdmin`) busca o papel direto na tabela de usuários, a cada checagem. Custa uma consulta extra ao banco, mas garante que revogar um admin tem efeito imediato, sem depender de esperar o access token antigo expirar. As duas abordagens são legítimas, a escolha é uma troca entre velocidade e atualização."
                    },
                    {
                        "type": "quote",
                        "value": "Um papel é um pacote de permissões com nome. Guardar esse papel no token é rápido, buscar do banco é mais atualizado. O que não pode existir é uma rota sensível sem checar papel nenhum."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é RBAC (Role-Based Access Control)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um protocolo de autenticação alternativo, pensado para substituir o JWT em APIs modernas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um jeito de agrupar permissões em papéis nomeados, associando cada usuário a um papel específico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma biblioteca do Node.js usada especificamente para gerar e assinar tokens de acesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tipo de criptografia usada especificamente para proteger as senhas antes de gravá-las no banco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na ensina.dev, qual é o papel padrão de quem acabou de se cadastrar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Admin, com acesso total até algum outro administrador rebaixar a conta manualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum papel, porque o cadastro fica pendente até um admin aprovar manualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aluno, o papel padrão de quem consome trilhas e acompanha o próprio progresso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Moderador, um papel intermediário até o usuário completar a primeira trilha.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide colocar o papel do usuário como claim dentro do JWT, em vez de consultar o banco a cada requisição. Qual é a consequência prática dessa escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhuma consequência relevante, porque o JWT sempre reflete o estado mais atual do banco de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O token deixa de poder ser verificado com jwt.verify, já que claims extras quebram a assinatura.",
                                "isCorrect": false
                            },
                            {
                                "text": "As requisições ficam mais rápidas, mas uma mudança de papel só vale quando o usuário pegar um token novo.",
                                "isCorrect": true
                            },
                            {
                                "text": "A aplicação passa a exigir cookies em vez de header Authorization, pois um payload maior não cabe no header.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário que era admin foi rebaixado para aluno no banco de dados, mas o token JWT dele (que carrega o papel como claim) ainda não expirou. O que acontece se ele tentar uma ação de admin nesse intervalo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A ação é barrada imediatamente, porque o servidor sempre confere o banco antes de aceitar o token.",
                                "isCorrect": false
                            },
                            {
                                "text": "O token se torna inválido automaticamente assim que o papel do usuário muda no banco de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O usuário é deslogado à força na próxima requisição, pois o servidor detecta a mudança de papel.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ação ainda é aceita, porque o middleware confia no papel gravado no token até ele expirar.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que faz sentido dizer que um papel (role) é diferente de uma permissão isolada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque papéis só podem existir em bancos relacionais, enquanto permissões vivem exclusivamente no JWT.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque uma permissão, uma vez atribuída a um papel, nunca poderia ser removida dele mais tarde.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque, na prática, todo usuário sempre tem exatamente um papel e uma permissão, sempre em par.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o papel agrupa várias permissões sob um nome e checá-lo responde muitas perguntas de uma vez.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Protegendo rotas por papel (401 x 403)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Um segundo middleware, depois do primeiro\n\nSaber que existe um papel não adianta nada se nenhuma rota checa ele. A peça que faltava é um middleware que roda depois do `autenticar` e decide, olhando `req.user.role`, se aquele papel específico pode passar. Como ele normalmente protege ações de administrador, é comum chamar essa função de `exigirAdmin` (e, quando a API tem mais papéis, algo mais genérico como `exigirPapel('admin')`).\n\nA ideia central é encadear os dois middlewares na mesma rota: primeiro confirma quem é a pessoa, depois confirma se o papel dela libera aquela ação específica."
                    },
                    {
                        "type": "code",
                        "value": "// middlewares/exigirAdmin.js\nfunction exigirAdmin(req, res, next) {\n  if (!req.user) {\n    return res.status(401).json({ erro: 'Não autenticado' });\n  }\n\n  if (req.user.role !== 'admin') {\n    return res.status(403).json({ erro: 'Apenas administradores podem fazer isso' });\n  }\n\n  next();\n}\n\nmodule.exports = { exigirAdmin };\n\n// routes/trilhas.js\nconst express = require('express');\nconst { autenticar } = require('../middlewares/autenticar');\nconst { exigirAdmin } = require('../middlewares/exigirAdmin');\n\nconst router = express.Router();\n\n// a rota agora exige token válido E papel de admin, nessa ordem\nrouter.delete('/trilhas/:id', autenticar, exigirAdmin, async (req, res) => {\n  await apagarTrilha(req.params.id);\n  res.status(204).send();\n});\n\nmodule.exports = router;"
                    },
                    {
                        "type": "text",
                        "value": "## O que acontece em cada cenário\n\nCom os dois middlewares encadeados, `autenticar` e `exigirAdmin`, três cenários são possíveis quando uma requisição chega em DELETE /trilhas/:id:\n\n- **Sem token, ou token inválido**: `autenticar` já responde 401 e a requisição nem chega perto de `exigirAdmin`.\n- **Token válido, papel aluno**: `autenticar` deixa passar, `exigirAdmin` barra com 403, porque a identidade está provada mas a permissão não.\n- **Token válido, papel admin**: os dois middlewares deixam passar, e o handler da rota finalmente executa.\n\nGuarde essa distinção, porque ela aparece o tempo todo numa API: **401 Unauthorized significa 'eu não sei quem você é'**, e **403 Forbidden significa 'eu sei quem você é, e mesmo assim não pode'**. São erros de naturezas diferentes, e confundir os dois manda a mensagem errada para quem está consumindo a API."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"401 Unauthorized\",\"403 Forbidden\"],[\"O que significa\",\"Não sabemos quem você é\",\"Sabemos quem você é, mas não pode\"],[\"Falta o quê\",\"Autenticação (token ausente, inválido ou expirado)\",\"Permissão (papel ou dono não confere)\"],[\"Quem barra\",\"O middleware autenticar\",\"Um middleware de papel, como exigirAdmin\"],[\"O que o cliente deve fazer\",\"Fazer login de novo, pegar um token válido\",\"Nada de login: pedir acesso, ou aceitar que não pode\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// sem token: autenticar responde 401 antes de chegar em exigirAdmin\nDELETE /trilhas/42 HTTP/1.1\nHost: api.ensina.dev\n\n// resposta:\nHTTP/1.1 401 Unauthorized\nContent-Type: application/json\n\n{\"erro\":\"Token não fornecido\"}\n\n// com token válido, mas de uma conta aluno: exigirAdmin responde 403\nDELETE /trilhas/42 HTTP/1.1\nHost: api.ensina.dev\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n\n// resposta:\nHTTP/1.1 403 Forbidden\nContent-Type: application/json\n\n{\"erro\":\"Apenas administradores podem fazer isso\"}"
                    },
                    {
                        "type": "text",
                        "value": "## O erro comum: trocar 401 por 403 (ou vice-versa)\n\nÉ tentador devolver 403 para tudo que é erro de acesso, ou 401 para qualquer coisa que barrar a requisição, mas a troca tem custo real. Se uma rota devolve 401 quando na verdade é problema de permissão, o front-end interpreta como sessão expirada e manda o usuário para a tela de login, um loop inútil, porque logar de novo não resolve nada: o problema nunca foi a identidade dele. Se devolve 403 quando o problema era token ausente ou expirado, o usuário não entende que basta logar de novo.\n\nRegra prática: 401 é sempre sobre a ausência ou invalidade da prova de identidade; 403 é sempre sobre uma identidade válida que não tem a permissão pedida."
                    },
                    {
                        "type": "quote",
                        "value": "401 é 'eu não sei quem você é'. 403 é 'eu sei quem você é, e mesmo assim não pode'. Confundir os dois manda a pessoa certa para a tela errada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma requisição chega sem nenhum header Authorization numa rota protegida. Qual status code é o mais adequado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "401 Unauthorized, porque o servidor não sabe quem está fazendo a requisição.",
                                "isCorrect": true
                            },
                            {
                                "text": "403 Forbidden, porque a ausência de header já conta como uma ação proibida.",
                                "isCorrect": false
                            },
                            {
                                "text": "404 Not Found, porque a rota deixa de existir para quem não envia token.",
                                "isCorrect": false
                            },
                            {
                                "text": "200 OK, porque a ausência de token é tratada como um acesso anônimo permitido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário está autenticado com um token válido, mas seu papel é aluno e ele tenta acessar uma rota que exige admin. Qual status code representa melhor essa situação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "400 Bad Request, porque o corpo dessa requisição está mal formatado ou incompleto.",
                                "isCorrect": false
                            },
                            {
                                "text": "403 Forbidden, porque a identidade está provada, mas o papel dele não permite essa ação.",
                                "isCorrect": true
                            },
                            {
                                "text": "500 Internal Server Error, porque o middleware de papel lançou uma exceção não tratada.",
                                "isCorrect": false
                            },
                            {
                                "text": "401 Unauthorized, porque a falta de permissão é tratada como se fosse falta de identidade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que faz sentido encadear autenticar e exigirAdmin nessa ordem, e não o contrário, numa rota Express?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o Express sempre executa o último middleware registrado na rota primeiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque exigirAdmin também valida a assinatura do token, o que torna autenticar redundante.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ordem não importa nesse caso, porque os dois middlewares fazem exatamente a mesma checagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque exigirAdmin depende de req.user, populado só depois que autenticar valida o token.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota devolve 401 sempre que o usuário autenticado não tem o papel necessário para a ação, mesmo com um token perfeitamente válido. Qual problema prático isso causa no front-end?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O front-end interpreta como sessão expirada e manda o usuário para o login, mesmo sem resolver nada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum problema prático, porque 401 e 403 são tratados como sinônimos por qualquer cliente HTTP moderno.",
                                "isCorrect": false
                            },
                            {
                                "text": "O navegador passa a bloquear automaticamente todas as futuras requisições daquele usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "O token passa a ser aceito em qualquer outra rota da API, mesmo as que exigem outro papel.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um middleware exigirAdmin verifica req.user.role, mas é registrado numa rota sem o autenticar antes dele. O que pode acontecer se req.user nunca tiver sido populado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Express insere automaticamente um req.user padrão com role admin, para não travar a rota.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada acontece, porque exigirAdmin sempre roda antes de qualquer outro middleware da rota.",
                                "isCorrect": false
                            },
                            {
                                "text": "A rota passa a exigir autenticação por cookie em vez de token, já que req.user ficou vazio.",
                                "isCorrect": false
                            },
                            {
                                "text": "A checagem de req.user.role pode falhar, ou, se mal feita, liberar quem não deveria passar.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Menor privilégio e a verificação de dono",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O princípio do menor privilégio\n\nDepois de aprender a proteger rotas por papel, surge uma tentação perigosa: já que dá trabalho pensar em permissão fina, por que não deixar todo mundo com um papel só, mais permissivo, e simplificar a vida? O princípio do menor privilégio existe exatamente para barrar esse atalho: cada usuário, cada papel, cada parte do sistema deve receber apenas as permissões estritamente necessárias para fazer o que precisa, nada além disso.\n\nA razão não é burocracia, é redução de dano. Se uma conta aluno vaza (senha reaproveitada, token roubado, sessão sequestrada), o estrago fica limitado ao que um aluno pode fazer. Se toda conta fosse admin por padrão, o mesmo vazamento daria ao atacante acesso para apagar trilhas, mexer em dados de outros usuários e reconfigurar a plataforma inteira.\n\n## Por que admin nunca deveria ser o padrão\n\nUm cadastro novo deve nascer no papel mais restrito possível (aluno, no caso da ensina.dev) e só ser promovido a admin por uma ação deliberada, feita por quem já é admin, nunca como resultado de um valor que o próprio usuário mandou. Uma rota de cadastro que lê um campo role do corpo da requisição e grava esse valor sem questionar abre uma porta gigante: bastaria o atacante incluir `role: 'admin'` no corpo do POST /cadastro para nascer administrador. A defesa é simples: a rota de cadastro nunca lê o papel do corpo da requisição, ela grava aluno de forma fixa, direto no código."
                    },
                    {
                        "type": "text",
                        "value": "## Uma segunda pergunta: além do papel, de quem é o recurso\n\nPapel resolve perguntas do tipo 'usuários com esse papel podem fazer X', mas não resolve uma pergunta menor e igualmente importante: dentro do que um aluno pode fazer, ele só pode mexer no que é dele? Um aluno pode editar tarefas, por exemplo, mas isso não deveria significar editar a tarefa de qualquer aluno, só a própria.\n\nPense numa rota PATCH /tarefas/:id. Checar o papel não ajuda aqui: qualquer aluno tem permissão para editar tarefas, a questão é qual tarefa. É preciso uma segunda checagem, a verificação de dono (ownership): buscar o recurso pelo id da URL e confirmar que o campo que identifica o dono bate com o id de quem está autenticado, antes de deixar a operação seguir."
                    },
                    {
                        "type": "code",
                        "value": "// routes/tarefas.js\nconst express = require('express');\nconst { autenticar } = require('../middlewares/autenticar');\n\nconst router = express.Router();\n\nrouter.patch('/tarefas/:id', autenticar, async (req, res) => {\n  const tarefa = await buscarTarefaPorId(req.params.id);\n\n  if (!tarefa) {\n    return res.status(404).json({ erro: 'Tarefa não encontrada' });\n  }\n\n  // a checagem que falta na versão ingênua: a tarefa é mesmo de quem está pedindo?\n  if (tarefa.usuarioId !== req.user.id) {\n    return res.status(403).json({ erro: 'Você não pode editar uma tarefa de outro usuário' });\n  }\n\n  const tarefaAtualizada = await atualizarTarefa(tarefa.id, {\n    titulo: req.body.titulo ?? tarefa.titulo,\n    completa: req.body.completa ?? tarefa.completa,\n  });\n\n  res.status(200).json(tarefaAtualizada);\n});\n\nmodule.exports = router;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Checagem de papel\",\"Checagem de dono\"],[\"Pergunta que responde\",\"Usuários com esse papel podem fazer essa ação?\",\"Esse recurso específico pertence a quem está pedindo?\"],[\"Granularidade\",\"O papel inteiro (admin, aluno)\",\"Um registro específico no banco\"],[\"Exemplo\",\"Só admin cria trilha\",\"Só o dono edita a própria tarefa\"],[\"Onde vem o dado comparado\",\"req.user.role\",\"O id do dono salvo no recurso x req.user.id\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## As duas checagens trabalham juntas, não uma no lugar da outra\n\nPapel e dono resolvem problemas diferentes, e a maioria das rotas de verdade combina os dois. Numa rota PATCH /tarefas/:id, por exemplo, a regra completa costuma ser: um admin pode editar qualquer tarefa (o papel já basta), um aluno só pode editar a própria (papel mais dono). Isso normalmente vira uma condicional que libera o admin antes mesmo de olhar o dono: se o papel já é admin, segue direto; caso contrário, ainda precisa bater o id do dono com quem está autenticado.\n\nÉ o menor privilégio aplicado na prática: o aluno recebe exatamente a permissão de mexer no que é dele, nem menos, nem mais."
                    },
                    {
                        "type": "quote",
                        "value": "Checar o papel garante que só quem pode fazer aquele tipo de ação chegue perto dela. Checar o dono garante que, mesmo podendo, a pessoa só mexa no que é dela. As duas perguntas são diferentes, e pular qualquer uma abre uma brecha."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que diz o princípio do menor privilégio?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Todo usuário novo deve começar como administrador, o que facilita o trabalho do suporte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada usuário deve receber apenas as permissões estritamente necessárias para o que precisa fazer.",
                                "isCorrect": true
                            },
                            {
                                "text": "Quanto mais permissões um usuário acumula, mais seguro o sistema inteiro fica contra falhas internas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Permissões devem ser atribuídas uma única vez, no cadastro, e nunca mais revistas depois.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma rota de cadastro não deve aceitar um campo role vindo do corpo da requisição e gravá-lo sem questionar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o Express bloqueia, por padrão, a leitura de campos extras no corpo da requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a presença do campo role sempre quebra a validação de senha durante o cadastro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o bcrypt deixa de funcionar em cadastros que incluem esse campo extra no corpo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um atacante se cadastraria como admin, só declarando isso no corpo da requisição.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota PATCH /tarefas/:id verifica corretamente que o usuário está autenticado, mas não confere se a tarefa pertence a ele. Um aluno autenticado consegue editar a tarefa de outro aluno?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, porque a checagem de autenticação sozinha não garante que o recurso pertence ao autenticado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, porque o Express bloqueia automaticamente qualquer edição em recursos de outros usuários.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque o próprio banco de dados rejeita updates que não venham acompanhados de checagem de dono.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só nos casos em que o aluno autenticado também tiver o papel de administrador.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa rota que edita tarefas, por que um admin costuma ter uma regra diferente de um aluno na checagem de dono?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque um admin nunca pode editar tarefa nenhuma, nem mesmo as que ele mesmo criou.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só o admin precisa passar pela checagem de dono, o aluno fica sempre dispensado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o campo usuarioId simplesmente não existe para tarefas associadas a contas admin.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o papel admin concede permissão mais ampla e libera a ação sem exigir a posse.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tarefa tem o campo usuarioId gravado no banco no momento da criação. Ao processar PATCH /tarefas/:id, por que comparar tarefa.usuarioId com req.user.id (vindo do token verificado) é seguro, mas comparar com um usuarioId enviado no corpo da requisição não seria?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque req.user.id vem de um token validado pelo servidor, e o corpo da requisição é escolhido por quem o envia.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o corpo da requisição nunca pode, tecnicamente, conter um campo chamado usuarioId em nenhuma circunstância.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque comparar um valor com o token é sempre mais lento de processar do que comparar com o corpo, mas não mais seguro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há diferença de segurança real entre as duas abordagens, apenas uma diferença de nomenclatura entre os campos.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "IDOR: quando trocar o id na URL vira um ataque",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O ataque mais simples que existe\n\nImagine a mesma API de tarefas da aula passada, agora sem a checagem de dono que acabamos de estudar. Um aluno se autentica normalmente, cria uma tarefa, e o servidor responde a GET /tarefas/123 com a tarefa dele. Só que, por curiosidade, ele edita a URL na barra de endereço, ou no Postman, para GET /tarefas/124. Se o servidor só confere se existe um token válido, sem checar de quem é a tarefa 124, a resposta vem inteira: título, conteúdo, tudo que pertence a outro aluno.\n\nIsso é um IDOR, sigla para Insecure Direct Object Reference (referência direta insegura a objeto). O nome é grande, a causa é pequena: a aplicação usa um identificador que veio do cliente (o :id da URL) para buscar um registro direto no banco, sem perguntar se quem está pedindo tem o direito de ver ou mexer naquele registro específico."
                    },
                    {
                        "type": "code",
                        "value": "// routes/tarefas.js (versão vulnerável: falta a checagem de dono)\nrouter.get('/tarefas/:id', autenticar, async (req, res) => {\n  const tarefa = await buscarTarefaPorId(req.params.id);\n\n  if (!tarefa) {\n    return res.status(404).json({ erro: 'Tarefa não encontrada' });\n  }\n\n  // PROBLEMA: devolve a tarefa para qualquer usuário autenticado,\n  // sem checar se req.user.id é o dono da tarefa\n  res.status(200).json(tarefa);\n});\n\nrouter.patch('/tarefas/:id', autenticar, async (req, res) => {\n  const tarefa = await buscarTarefaPorId(req.params.id);\n  if (!tarefa) {\n    return res.status(404).json({ erro: 'Tarefa não encontrada' });\n  }\n\n  // mesmo problema aqui: qualquer autenticado edita qualquer tarefa\n  const tarefaAtualizada = await atualizarTarefa(tarefa.id, req.body);\n  res.status(200).json(tarefaAtualizada);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Passo a passo do ataque\n\nNenhuma das duas rotas acima exige nada além de estar logado, e é exatamente aí que mora o problema. O ataque, se é que dá para chamar assim, é trivial:\n\n1. O aluno A faz login normalmente e recebe o próprio token, válido e legítimo.\n2. Ele acessa GET /tarefas/123, a própria tarefa. Funciona, como esperado.\n3. Ele troca o número na URL para GET /tarefas/124, uma tarefa que pertence ao aluno B, e reenvia a requisição com o mesmo token (o seu, de verdade).\n4. O servidor verifica o token, vê que é válido, e devolve a tarefa 124 inteira, porque nunca perguntou de quem ela é.\n\nRepare que o aluno A não precisou quebrar senha nenhuma, nem forjar token, nem explorar nenhuma falha sofisticada. Ele só editou um número numa URL. É por isso que IDOR aparece com tanta frequência em aplicações reais: a barreira que falta é simples de esquecer e simples de explorar."
                    },
                    {
                        "type": "code",
                        "value": "// routes/tarefas.js (corrigido: dono verificado antes de responder)\nrouter.get('/tarefas/:id', autenticar, async (req, res) => {\n  const tarefa = await buscarTarefaPorId(req.params.id);\n\n  if (!tarefa || tarefa.usuarioId !== req.user.id) {\n    // 404 aqui, e não só quando a tarefa não existe, evita confirmar\n    // para quem não é dono se aquele id existe ou não\n    return res.status(404).json({ erro: 'Tarefa não encontrada' });\n  }\n\n  res.status(200).json(tarefa);\n});\n\nrouter.patch('/tarefas/:id', autenticar, async (req, res) => {\n  const tarefa = await buscarTarefaPorId(req.params.id);\n\n  if (!tarefa || tarefa.usuarioId !== req.user.id) {\n    return res.status(404).json({ erro: 'Tarefa não encontrada' });\n  }\n\n  const tarefaAtualizada = await atualizarTarefa(tarefa.id, req.body);\n  res.status(200).json(tarefaAtualizada);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Por que às vezes a resposta é 404, e não 403\n\nRepare que a correção acima devolve 404 (não encontrada) quando a tarefa não é do usuário, o mesmo status que usaria se a tarefa nem existisse. É uma escolha deliberada: se a rota devolvesse 403 só quando a tarefa existe mas não é sua, e 404 quando ela realmente não existe, alguém tentando adivinhar ids alheios em sequência conseguiria descobrir quais ids existem, mesmo sem nunca ver o conteúdo. Devolver sempre 404 nesses casos esconde até a existência do recurso de quem não tem direito a ele. A aula anterior usou 403 na checagem de dono, e essa escolha também é válida, principalmente quando não existe informação sensível em só confirmar que um id existe. O que nunca pode faltar, com 403 ou com 404, é a checagem de dono em si.\n\n## Generalizando: nunca confie no id que vem do cliente\n\nO :id da URL não é diferente de um campo de formulário ou de um header: é entrada do usuário, e entrada do usuário pode ser qualquer coisa que quem está do outro lado quiser mandar. O mesmo raciocínio vale para um id escondido num campo de formulário, num JSON do corpo da requisição, ou numa query string. Um token válido prova quem está pedindo, nunca prova que o objeto pedido pertence a essa pessoa: essa segunda parte é sempre responsabilidade de uma checagem explícita no servidor, cruzando o dono salvo no banco com quem está autenticado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Operação\",\"Precisa checar o dono?\",\"Por quê\"],[\"GET /tarefas/:id\",\"sim\",\"Ler dado de outro usuário já é vazamento de informação\"],[\"PATCH /tarefas/:id\",\"sim\",\"Editar dado de outro usuário é ainda mais grave que só ler\"],[\"DELETE /tarefas/:id\",\"sim\",\"Apagar algo que não é seu é uma perda irreversível para o dono real\"],[\"POST /tarefas/:id/comentarios\",\"sim\",\"O sub-recurso também precisa confirmar o dono do recurso pai\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "IDOR não é uma técnica sofisticada de invasão, é trocar um número numa URL. A defesa também não é sofisticada: nunca confie no id que vem do cliente, sempre cruze o dono salvo no banco com quem está autenticado, em toda operação, não só na leitura."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um ataque IDOR (Insecure Direct Object Reference)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um ataque que quebra a assinatura de um token JWT para conseguir forjar um novo, válido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar um identificador, como o id na URL, para acessar um recurso alheio sem checagem de dono.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma técnica para descobrir a senha de outro usuário testando muitas combinações por força bruta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de configuração que deixa o banco de dados da aplicação acessível direto pela internet.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aluno autenticado troca a URL de GET /tarefas/123 (a própria tarefa) para GET /tarefas/124 (de outro aluno) e a API devolve os dados normalmente. Qual checagem está faltando no servidor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A verificação de que o token JWT foi assinado com o segredo correto do servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "A verificação de que a senha do aluno autenticado ainda é válida no momento da leitura.",
                                "isCorrect": false
                            },
                            {
                                "text": "A verificação de que a tarefa 124 pertence ao usuário autenticado antes de responder.",
                                "isCorrect": true
                            },
                            {
                                "text": "A verificação de que o método HTTP usado nessa requisição é realmente um GET.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um IDOR costuma ser considerado um ataque de baixa sofisticação técnica, mas de alto impacto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque ele só funciona contra servidores desatualizados, ainda sem os patches de segurança mais recentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque exige só editar um identificador numa requisição já autenticada, mas pode expor dados alheios.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque ele exige acesso físico direto ao servidor onde a aplicação está efetivamente hospedada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ele só funciona nos casos em que o atacante já é administrador do próprio sistema.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Trocar os ids sequenciais das tarefas por UUIDs aleatórios, mas manter as rotas sem checar o dono, resolve o problema de IDOR?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, porque sem ids sequenciais é impossível adivinhar o recurso de qualquer outra pessoa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, desde que o UUID gerado tenha pelo menos 32 caracteres de comprimento total.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não: o UUID dificulta adivinhar ids, mas se um vazar num link ou log, o recurso segue acessível.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não resolve o IDOR, e ainda por cima não ajuda em nada, então trocar os ids seria esforço perdido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota corrige o IDOR na leitura (GET /tarefas/:id confere o dono corretamente), mas a rota de exclusão (DELETE /tarefas/:id) continua só checando se existe um token válido. O sistema ainda está vulnerável a IDOR?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não, porque corrigir a checagem numa rota já corrige automaticamente todas as outras do mesmo recurso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque a operação DELETE nunca é considerada alvo de IDOR, só GET e PATCH são.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas apenas nos casos em que o usuário autenticado tiver o papel de administrador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim: a checagem de dono precisa existir em toda operação, e a exclusão aberta apaga tarefas alheias.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - OAuth, login social e boas práticas",
        "aulas": [
            {
                "titulo": "OAuth: entrar com o Google sem dar a senha do Google",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# OAuth: entrar com o Google sem dar a senha do Google\n\nVocê já deve ter visto (e usado) um botão **Entrar com o Google** ou **Entrar com o GitHub** em algum site. É exatamente esse mecanismo que fecha esta trilha: o **OAuth 2.0**, o protocolo por trás do login social.\n\nPare um segundo para pensar no problema que ele resolve. Imagine que o ensina.dev quisesse oferecer login com Google da forma mais ingênua possível: um formulário pedindo o seu email e a sua senha do Google, direto na nossa página. Você digitaria a senha da sua conta Google, e o ensina.dev guardaria (ou pelo menos usaria) essa senha para autenticar você junto ao Google. Isso é uma péssima ideia, por vários motivos ao mesmo tempo.\n\n## Por que isso seria um desastre\n\n- O ensina.dev passaria a conhecer a senha da sua conta Google inteira, não só do nosso site. Se vazar aqui, vaza lá também.\n- Não existiria um jeito de dar acesso limitado: ou você entrega a chave da casa toda, ou não entrega nada.\n- Você não teria como revogar o acesso do ensina.dev sem trocar a própria senha do Google.\n- O Google não teria controle nenhum sobre quem está usando a sua senha, nem quando.\n\nO **OAuth 2.0** existe justamente para eliminar essa necessidade. Ele permite que você autorize uma aplicação a acessar uma parte específica da sua conta em outro serviço, sem nunca revelar sua senha para essa aplicação."
                    },
                    {
                        "type": "text",
                        "value": "## Autorização delegada\n\nO nome técnico para o que o OAuth faz é **autorização delegada** (_delegated authorization_). A ideia central: em vez de você provar sua identidade diretamente para a aplicação (como faria com login e senha tradicionais), você prova sua identidade para o **provedor** (Google, GitHub), e é o próprio provedor quem entrega para a aplicação uma permissão limitada e revogável, na forma de um token.\n\nRepare na mudança de papel: com o login social, o ensina.dev nunca vê sua senha do Google. O que ele recebe, ao final do processo, é uma autorização para ler algumas informações específicas do seu perfil (normalmente nome e email), nada além disso. Você pode revogar esse acesso a qualquer momento direto nas configurações da sua conta Google, sem precisar trocar senha nenhuma."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Papel\", \"Quem é\", \"Exemplo no login social\"], [\"Resource Owner\", \"O dono dos dados, quem autoriza o acesso\", \"Você, o usuário, dono da conta Google\"], [\"Client\", \"A aplicação que quer acessar dados em nome do usuário\", \"O ensina.dev\"], [\"Authorization Server\", \"Quem autentica o usuário e emite a autorização\", \"O servidor de login do Google ou do GitHub\"], [\"Resource Server\", \"Quem guarda os dados protegidos e os entrega mediante token\", \"A API do Google que devolve nome e email\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// A forma ERRADA (nunca faca isso): pedir a senha do provedor\napp.post(\"/login-google-ingenuo\", async (req, res) => {\n  const { emailGoogle, senhaGoogle } = req.body;\n  // isso exigiria o ensina.dev logar no Google usando a senha do usuario\n  // um site NUNCA deveria ver ou guardar a senha de outro servico\n});\n\n// A forma CERTA: o Google autentica o usuario e devolve so uma autorizacao\n// o ensina.dev nunca ve a senha do Google, so recebe um \"code\" e depois um token\napp.get(\"/auth/google/callback\", async (req, res) => {\n  const { code } = req.query;\n  // troca o code por um token direto com o Google (aula seguinte)\n});"
                    },
                    {
                        "type": "text",
                        "value": "## OAuth puro x OpenID Connect\n\nUma pegadinha comum: o OAuth 2.0, sozinho, foi desenhado para **autorização** (dar acesso a um recurso), não exatamente para **autenticação** (provar identidade). Para padronizar o login por cima do OAuth, existe o **OpenID Connect (OIDC)**: uma camada fina sobre o OAuth 2.0 que padroniza como pedir e receber dados de identidade do usuário (nome, email, uma foto), usando um token especial chamado `id_token`. Na prática, quando você usa uma biblioteca pronta de login com Google, ela geralmente já fala OpenID Connect por baixo dos panos.\n\nO ensina.dev usa exatamente esse mecanismo: os botões **Entrar com o GitHub** e **Entrar com o Google** que você vê na tela de login são OAuth (com OpenID Connect, no caso do Google) por trás. Nas próximas aulas você vai ver o fluxo completo e como o back-end usa o que recebe."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** o OAuth 2.0 resolve o problema de dar acesso a uma aplicação sem entregar sua senha a ela. É autorização delegada: você autoriza no provedor (Google, GitHub), e o provedor entrega para a aplicação (o client) uma permissão limitada e revogável. Para login propriamente dito, o OAuth ganha uma camada de identidade chamada OpenID Connect."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual problema o OAuth 2.0 resolve ao permitir que um site ofereça a opção de login com a conta Google do usuário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Evita que o site peça ou guarde a senha do Google, usando um token de acesso limitado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Fortalece a senha do usuário, aplicando uma criptografia extra sobre ela a cada login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispensa o uso de HTTPS, já que o próprio token cuida da criptografia do tráfego.",
                                "isCorrect": false
                            },
                            {
                                "text": "Elimina a necessidade de login em qualquer outro site, unindo todas as sessões num token.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No login com Google do ensina.dev, qual papel o ensina.dev exerce no modelo do OAuth 2.0?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Client, a aplicação que solicita acesso aos dados do usuário junto ao Google.",
                                "isCorrect": true
                            },
                            {
                                "text": "Resource Owner, já que o ensina.dev é quem decide liberar o acesso aos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Authorization Server, pois é o ensina.dev quem autentica o login do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Resource Server, pois é o ensina.dev quem guarda os dados protegidos do usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um site pede, em formulário próprio, o email e a senha da conta Google do usuário, alegando que assim consegue integrar com o Google. Por que essa prática é perigosa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O site passaria a conhecer a senha inteira da conta Google, sem acesso limitado nem revogação simples.",
                                "isCorrect": true
                            },
                            {
                                "text": "Formulários HTML não suportam campos de senha, então o navegador acabaria expondo o texto digitado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Google bloqueia automaticamente qualquer senha digitada fora do próprio domínio dele.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há problema real, pois o HTTPS por si só já limita e revoga esse tipo de acesso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No modelo do OAuth 2.0, qual é o papel do Authorization Server?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Autenticar o usuário e emitir o token de autorização ao client, como faz o Google.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ser a aplicação cliente que solicita acesso aos dados do usuário em nome dele.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ser o banco de dados que guarda as tabelas e os registros da própria aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ser o navegador do usuário, responsável por armazenar os cookies da sessão ativa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O OAuth 2.0 puro foi originalmente desenhado para qual finalidade principal, sendo o OpenID Connect (OIDC) uma camada adicionada por cima para outra finalidade?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "OAuth 2.0 foi desenhado para autorização, dar acesso a recursos; o OIDC acrescenta autenticação de identidade por cima dele.",
                                "isCorrect": true
                            },
                            {
                                "text": "OAuth 2.0 foi desenhado para fazer hash de senhas; o OIDC acrescenta uma camada de criptografia simétrica sobre esse hash.",
                                "isCorrect": false
                            },
                            {
                                "text": "OAuth 2.0 foi desenhado para armazenar sessões em Redis; o OIDC acrescenta o uso de cookies HttpOnly sobre essas sessões.",
                                "isCorrect": false
                            },
                            {
                                "text": "OAuth 2.0 e o OIDC são, na prática, a mesma especificação original, apenas publicada sob dois nomes comerciais diferentes.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O fluxo do OAuth 2.0 por dentro (por cima)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O fluxo do OAuth 2.0 por dentro (por cima)\n\nNa aula anterior você viu por que o OAuth existe. Agora vamos abrir o capô e ver, em linhas gerais, como a autorização delegada acontece na prática. O fluxo mais usado para aplicações com back-end (como as que você constrói nesta trilha) se chama **Authorization Code Flow** (fluxo de código de autorização).\n\nA ideia por trás dele é simples de enunciar, mesmo com vários passos técnicos por dentro: a aplicação nunca fala diretamente com a senha do usuário no provedor; ela só recebe, no final, uma prova (um token) de que o provedor autorizou o acesso. Vamos ver os quatro grandes movimentos desse fluxo."
                    },
                    {
                        "type": "text",
                        "value": "## Os quatro movimentos do fluxo\n\n1. **Redirecionamento para o provedor**: a aplicação (o client) manda o navegador do usuário para uma URL do Google (ou GitHub), informando quem ela é (`client_id`), para onde o usuário deve voltar depois (`redirect_uri`) e quais dados quer acessar (`scope`, por exemplo o perfil e o email).\n2. **Login e consentimento no provedor**: o usuário faz login no site do Google, com a senha do Google, numa página que é do próprio Google, nunca da sua aplicação. Em seguida, o Google mostra uma tela de consentimento, perguntando se o usuário autoriza a aplicação a acessar nome e email.\n3. **Redirecionamento de volta com um code**: se o usuário permitir, o Google redireciona o navegador de volta para o `redirect_uri` da aplicação, anexando um código de autorização (`code`) temporário e de uso único na URL.\n4. **Troca do code por um token**: a aplicação, agora do próprio servidor (não mais pelo navegador do usuário), faz uma chamada direta ao Google levando esse `code`, o `client_id` e um segredo da aplicação (`client_secret`). O Google responde com um token de acesso (e, no caso do OpenID Connect, também um `id_token`)."
                    },
                    {
                        "type": "code",
                        "value": "// Passo 1: a aplicacao redireciona o navegador do usuario para o Google\nGET https://accounts.google.com/o/oauth2/v2/auth\n  ?client_id=123456.apps.googleusercontent.com\n  &redirect_uri=https://ensina.dev/auth/google/callback\n  &response_type=code\n  &scope=openid%20email%20profile\n  &state=um-valor-aleatorio-anti-csrf\n\n// Passo 2: o usuario faz login e consente NO SITE DO GOOGLE (nao no ensina.dev)\n\n// Passo 3: o Google redireciona de volta com um code de uso unico\nGET https://ensina.dev/auth/google/callback?code=4/0AY0e-g7...&state=um-valor-aleatorio-anti-csrf\n\n// Passo 4: o BACK-END do ensina.dev troca o code por um token, servidor a servidor\nPOST https://oauth2.googleapis.com/token\nContent-Type: application/x-www-form-urlencoded\n\ncode=4/0AY0e-g7...\n&client_id=123456.apps.googleusercontent.com\n&client_secret=GOCSPX-segredo-fica-so-no-servidor\n&redirect_uri=https://ensina.dev/auth/google/callback\n&grant_type=authorization_code"
                    },
                    {
                        "type": "text",
                        "value": "## Dois detalhes que fazem esse fluxo ser seguro\n\n- **O parâmetro state**: um valor aleatório que a aplicação gera antes do passo 1 e confere quando o Google redireciona de volta no passo 3. Ele existe para impedir um ataque de CSRF de login, em que alguém tentaria forjar um redirecionamento de volta com um code que não pertence à vítima.\n- **A troca do code por token acontece de servidor para servidor**: o `client_secret` (a senha da própria aplicação junto ao Google) nunca aparece no navegador nem na URL visível ao usuário. Só o back-end do ensina.dev conhece esse segredo, e é por isso que o passo 4 é uma chamada direta entre servidores, sem passar pelo navegador.\n\nO code do passo 3, por si só, não serve para nada sem o client_secret: mesmo que alguém o capture (o que já é dificultado pelo HTTPS e pelo state), não consegue trocá-lo por um token sem o segredo que só o servidor da aplicação possui."
                    },
                    {
                        "type": "text",
                        "value": "## O retorno: token de acesso e id_token\n\nAo final da troca do passo 4, o Google devolve (entre outras coisas) um token de acesso (para consultar a API do Google em nome do usuário, se necessário) e, como o ensina.dev pediu o escopo `openid`, também um `id_token`. Esse `id_token` é, na prática, um JWT (você já viu a anatomia dele no Módulo 4): um header.payload.signature assinado pelo Google, cujo payload já vem com claims como `email`, `name` e `sub` (o identificador único e estável do usuário no Google).\n\nÉ esse `id_token` que a aplicação usa para saber quem é o usuário, sem precisar fazer mais nenhuma chamada extra à API do Google."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** o Authorization Code Flow tem quatro movimentos: a aplicação redireciona o usuário para o provedor, o usuário loga e consente no site do provedor, o provedor redireciona de volta com um code de uso único, e o back-end da aplicação troca esse code por um token numa chamada servidor a servidor, usando o client_secret. O parâmetro state protege contra CSRF, e o client_secret nunca passa pelo navegador."
                    }
                ],
                "questions": [
                    {
                        "statement": "No Authorization Code Flow, onde o usuário digita a senha da sua conta Google?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Numa página do próprio Google, para onde a aplicação redireciona o navegador antes do login.",
                                "isCorrect": true
                            },
                            {
                                "text": "No formulário de login da própria aplicação, que depois repassa a senha ao Google por trás.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na URL de redirecionamento, como um parâmetro de consulta visível na barra de endereço.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dentro do próprio code que o Google devolve no redirecionamento final do fluxo de login.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a aplicação recebe no redirecionamento de volta enviado pelo Google, logo após o usuário consentir?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um código de autorização de uso único, que ainda precisa ser trocado por um token depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "A senha do usuário em texto claro, para a aplicação validar localmente contra o Google.",
                                "isCorrect": false
                            },
                            {
                                "text": "O token de acesso definitivo, já pronto para autenticar o usuário de forma imediata.",
                                "isCorrect": false
                            },
                            {
                                "text": "O client_secret da própria aplicação, reenviado pelo Google como confirmação do login.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a troca do código de autorização por um token de acesso acontece diretamente entre o servidor da aplicação e o servidor do provedor, em vez de passar pelo navegador do usuário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque essa troca exige o client_secret, que não pode ficar exposto no navegador nem em URLs visíveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque navegadores não conseguem enviar requisições do tipo POST para servidores externos como o Google.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Google só aceita essa troca vinda de endereços IP cadastrados como servidores de datacenter.",
                                "isCorrect": false
                            },
                            {
                                "text": "É apenas uma convenção sem motivo de segurança; o mesmo poderia ser feito direto pelo navegador.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a função do parâmetro state, enviado logo no início do fluxo OAuth?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Proteger contra CSRF, confirmando que o retorno do Google bate com a requisição enviada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir por quanto tempo o token de acesso emitido pelo Google ainda vai permanecer válido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Informar ao Google qual banco de dados a aplicação usa para guardar os usuários.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir a necessidade de HTTPS na comunicação entre a aplicação e os servidores do Google.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um atacante consegue interceptar o código de autorização de uma vítima assim que o Google redireciona de volta para a aplicação. Sozinho, o que esse atacante consegue fazer com esse código?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Pouca coisa: sem o client_secret, que fica só no servidor da aplicação, o código não vira um token válido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Consegue logar imediatamente como a vítima, já que o código sozinho equivale a um token de acesso pronto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consegue redefinir a senha da conta Google da vítima, usando esse código como comprovante de identidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consegue decodificar o código e obter diretamente a senha original da conta Google da vítima.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Login social na prática: criando o usuário local",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Login social na prática: criando o usuário local\n\nAs duas aulas anteriores explicaram o protocolo: como a aplicação recebe uma autorização do Google ou do GitHub sem nunca ver a senha do usuário. Mas o OAuth, sozinho, não é a autenticação completa da sua aplicação: ele só entrega dados do provedor. Falta o último passo, que é inteiramente responsabilidade do seu back-end: transformar esses dados num usuário local, do jeito que os módulos anteriores desta trilha já ensinaram (com id, papel, registro no seu próprio banco).\n\nÉ esse último trecho do caminho que vamos percorrer nesta aula, com um exemplo próximo do que roda no ensina.dev."
                    },
                    {
                        "type": "text",
                        "value": "## O que a aplicação recebe do provedor\n\nDepois de trocar o code pelo token (aula anterior), a aplicação tem em mãos, tipicamente:\n\n- Um **token de acesso**, que permite (se for o caso) chamar outras APIs do provedor em nome do usuário.\n- Um **id_token** (com OpenID Connect) ou uma chamada extra a um endpoint de perfil (`/userinfo`, no caso do Google, ou `/user`, no caso do GitHub), que devolve os dados básicos do usuário: um identificador único e estável (`sub`, no Google; `id`, no GitHub), o email e o nome.\n\nCom isso, o back-end da aplicação precisa decidir: esse é um usuário que já existe no meu banco (por email, ou por já ter logado com este provedor antes) ou é um usuário novo?"
                    },
                    {
                        "type": "code",
                        "value": "app.get(\"/auth/google/callback\", async (req, res) => {\n  const { code } = req.query;\n\n  // 1. troca o code pelo token (chamada servidor a servidor, vista na aula anterior)\n  const tokenResposta = await trocarCodePorToken(code);\n  const { id_token } = tokenResposta;\n\n  // 2. valida e decodifica o id_token para pegar os dados do usuario\n  const perfilGoogle = await verificarIdToken(id_token); // { sub, email, name }\n\n  // 3. encontra ou cria o usuario local\n  let usuario = await db.usuarios.buscarPorEmail(perfilGoogle.email);\n  if (!usuario) {\n    usuario = await db.usuarios.criar({\n      nome: perfilGoogle.name,\n      email: perfilGoogle.email,\n      googleId: perfilGoogle.sub,\n      senhaHash: null, // login social nao exige senha local\n      role: \"aluno\",\n    });\n  }\n\n  // 4. a partir daqui, e o MESMO fluxo do Modulo 5: emitir o JWT da aplicacao\n  const meuToken = jwt.sign({ sub: usuario.id, role: usuario.role }, process.env.JWT_SECRET, {\n    expiresIn: \"15m\",\n  });\n  res.cookie(\"token\", meuToken, { httpOnly: true, secure: true, sameSite: \"strict\" });\n  res.redirect(\"/dashboard\");\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Nunca confie cegamente no que chega\n\nUm erro perigoso seria pegar o id_token (ou qualquer dado vindo da URL de redirecionamento) e usá-lo sem checagem. O id_token é um JWT assinado pelo Google, e como você viu no Módulo 4, um JWT assinado precisa ser verificado, não só decodificado. Antes de confiar em qualquer campo dele, o back-end deve validar:\n\n- A **assinatura**, usando a chave pública do Google (as bibliotecas oficiais de OAuth cuidam disso automaticamente).\n- O **aud** (audience): que o token foi emitido para a sua aplicação, e não para outra.\n- O **iss** (issuer): que quem assinou foi realmente o Google, e não qualquer outro emissor.\n- O **exp**: que o token ainda não expirou.\n\nSe qualquer uma dessas checagens falhar, a aplicação deve rejeitar o login. Confiar num JWT sem verificar a assinatura é como aceitar um documento de identidade sem checar se ele é falso: os dados escritos ali podem ser qualquer coisa."
                    },
                    {
                        "type": "code",
                        "value": "// NAO faca isso: usar o id_token sem verificar nada\nconst payload = JSON.parse(atob(idToken.split(\".\")[1])); // so decodifica, nao confirma origem nem validade\n\n// Faca isso: verificar assinatura, emissor, audiencia e expiracao antes de confiar\nconst perfilGoogle = await client.verifyIdToken({\n  idToken: idToken,\n  audience: process.env.GOOGLE_CLIENT_ID,\n}); // lanca erro se assinatura, emissor ou audiencia nao baterem"
                    },
                    {
                        "type": "text",
                        "value": "## Vinculando contas existentes\n\nE se o usuário já tinha uma conta no ensina.dev criada com email e senha (Módulo 5), e um dia decide entrar pela primeira vez com o botão Entrar com o Google, usando o mesmo email? A prática comum, e a que a plataforma segue, é vincular pelo email: se já existe um usuário cadastrado com aquele email, o login social passa a ser só mais uma forma de entrar na mesma conta, não uma conta nova e duplicada. Isso costuma exigir guardar, na tabela de usuários, um campo para o identificador do provedor (`googleId`, `githubId`), permitindo, inclusive, que uma pessoa tenha os dois jeitos de entrar (senha local e login social) na mesma conta."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** depois da troca de token, a aplicação recebe dados do perfil do usuário (email, nome, um identificador estável) e precisa buscar ou criar um usuário local, com o mesmo modelo (id, papel) usado pelo login tradicional. O ponto crítico é nunca confiar cegamente nesses dados: o id_token é um JWT que precisa ter assinatura, emissor, audiência e expiração verificados antes de qualquer decisão de login."
                    }
                ],
                "questions": [
                    {
                        "statement": "Depois que o provedor (Google) autoriza o login, o que o back-end da aplicação ainda precisa fazer para o usuário conseguir usar o sistema normalmente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Buscar ou criar um usuário local vinculado aos dados do provedor, e emitir a sessão local.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada além disso; o usuário já pode navegar normalmente usando só o token do Google para sempre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pedir que o usuário cadastre também uma senha local, antes de liberar qualquer acesso ao sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Redirecionar o usuário de volta ao Google, para que a conta local seja criada lá no provedor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Que tipo de dado o provedor OAuth costuma devolver sobre o usuário, depois da autorização?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dados básicos do perfil, como email, nome e um identificador único no provedor.",
                                "isCorrect": true
                            },
                            {
                                "text": "A senha da conta do usuário no provedor, para a aplicação guardar localmente e reusar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número do cartão de crédito cadastrado na conta do usuário dentro do provedor.",
                                "isCorrect": false
                            },
                            {
                                "text": "O histórico completo de navegação do usuário dentro do site do provedor OAuth usado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação recebe o id_token do Google, apenas decodifica o JSON do payload e já confia nesses dados para logar o usuário, sem nenhuma outra checagem. Qual é o risco dessa prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sem checar assinatura, emissor e audiência do token, a aplicação aceitaria dados forjados ou alheios.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não há risco real, pois qualquer JWT já nasce confiável pelo simples fato de estar assinado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco é apenas de desempenho, já que decodificar sem verificar consome mais tempo de processamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco é o token ficar visível na URL de retorno do provedor, algo inevitável em qualquer fluxo OAuth.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário já tinha uma conta no ensina.dev criada com email e senha. Um dia, ele usa o login com Google pela primeira vez, com o mesmo email da conta antiga. Qual é a prática recomendada nesse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Vincular o login social à conta existente pelo email, permitindo entrar por senha ou pelo Google.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar automaticamente uma segunda conta separada, já que os métodos de login não podem coexistir.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloquear o login social sempre que já existir uma conta com senha cadastrada para aquele mesmo email.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apagar a senha antiga da conta e obrigar o uso exclusivo do login social dali em diante.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao validar um id_token recebido do Google, por que checar o campo aud (audience) é importante, além de verificar a assinatura?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque garante que o token foi emitido para a sua aplicação específica, e não para outra qualquer.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o campo aud define o tempo de expiração do token, evitando que ele seja usado depois desse prazo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o campo aud contém a senha criptografada do usuário, cifrada com a chave pública do Google.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque verificar o aud é opcional, servindo só para fins de log, sem qualquer impacto real de segurança.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ataques e defesas: o checklist de segurança",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ataques e defesas: o checklist de segurança\n\nChegamos à aula mais prática de revisão da trilha. Ao longo dos módulos anteriores, você viu peça por peça: hash de senha, sessão, cookie, token, JWT, papel e, agora, OAuth. Cada uma dessas peças existe porque alguma coisa, sem ela, dá errado de um jeito específico. Esta aula reúne os principais ataques contra autenticação e a defesa correspondente, num checklist que vale a pena guardar para qualquer API que você construir daqui para frente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ataque\", \"Como funciona\", \"Defesa\"], [\"Força bruta\", \"Tentar muitas senhas seguidas até acertar\", \"Rate limiting e bloqueio temporário após várias tentativas falhas\"], [\"Credential stuffing\", \"Testar pares de email e senha vazados de outros sites\", \"Rate limiting, autenticação em duas etapas e monitoramento de tentativas suspeitas\"], [\"Enumeração de usuário\", \"Descobrir quais emails têm conta pela diferença na mensagem de erro do login\", \"Mensagem genérica (email ou senha inválidos), igual para os dois casos\"], [\"Interceptação de tráfego (MITM)\", \"Ler senha ou token trafegando sem criptografia\", \"HTTPS em toda a aplicação, sem exceção\"], [\"Reuso de token roubado\", \"Usar um token capturado que ainda não expirou\", \"Expiração curta do token e renovação por refresh token\"], [\"Vazamento de segredo no código\", \"Segredo (JWT secret, client secret) exposto num repositório\", \"Guardar segredos em variável de ambiente, fora do código e do controle de versão\"]]"
                    },
                    {
                        "type": "code",
                        "value": "const rateLimit = require(\"express-rate-limit\");\n\nconst limitadorLogin = rateLimit({\n  windowMs: 15 * 60 * 1000, // janela de 15 minutos\n  max: 5,                   // no maximo 5 tentativas nessa janela, por IP\n  message: { erro: \"Muitas tentativas de login. Tente novamente mais tarde.\" },\n});\n\napp.post(\"/login\", limitadorLogin, async (req, res) => {\n  // ...verifica email e senha com bcrypt.compare, como no Modulo 5\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Não entregue pistas de graça\n\nUm erro comum é responder de forma diferente conforme o problema: uma mensagem quando o email não existe, outra quando o email existe mas a senha está errada. Essa diferença permite que um atacante descubra, testando emails em massa, quais contas existem na base, o primeiro passo para um ataque de força bruta ou credential stuffing direcionado. A defesa é simples: uma única mensagem genérica, como `Email ou senha inválidos`, para os dois casos."
                    },
                    {
                        "type": "code",
                        "value": "// NUNCA faca isso: segredo escrito direto no codigo\nconst JWT_SECRET = \"minha-chave-super-secreta-123\"; // vai parar no git, no historico, em todo lugar\n\n// Faca isso: segredo vem de variavel de ambiente, nunca commitada\n// arquivo .env, que fica listado no .gitignore, fora do repositorio:\n// JWT_SECRET=uma-chave-longa-e-aleatoria-gerada-so-para-producao\n// GOOGLE_CLIENT_SECRET=GOCSPX-...\n\nconst JWT_SECRET = process.env.JWT_SECRET;\nif (!JWT_SECRET) {\n  throw new Error(\"JWT_SECRET nao configurado\");\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Dois fundamentos que não saem da lista\n\nDois cuidados que já apareceram nos primeiros módulos continuam valendo, sempre:\n\n- **Hash de senha lento e com salt** (bcrypt ou argon2), nunca MD5 ou SHA puro: mesmo que o banco vaze, as senhas não saem em texto puro nem viram alvo fácil de rainbow table.\n- **Cookies seguros**, quando a aplicação usa sessão ou guarda o token em cookie: HttpOnly (JavaScript não lê o cookie, dificultando XSS), Secure (só trafega em HTTPS) e SameSite (dificulta CSRF).\n\nNenhuma dessas defesas funciona sozinha. Segurança de autenticação é a soma de várias camadas pequenas, cada uma cobrindo um jeito diferente de ataque."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** força bruta e credential stuffing se combatem com rate limiting; enumeração de usuário se evita com mensagens genéricas; interceptação de tráfego se evita com HTTPS sempre; tokens roubados se neutralizam com expiração curta; e segredos (JWT secret, client secret do OAuth) vivem em variável de ambiente, nunca no código ou no controle de versão. São camadas, e todas importam."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a defesa mais direta contra um ataque de força bruta na rota de login?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Rate limiting: limitar quantas tentativas de login um mesmo IP pode fazer num intervalo de tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar bcrypt por MD5, já que um hash mais rápido reduz a chance de erro na verificação da senha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o tamanho máximo da resposta HTTP, dificultando o processamento de tentativas automatizadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover a exigência de senha forte no cadastro, o que reduz a superfície de ataque do formulário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Onde o segredo usado para assinar o JWT (JWT secret) e o client secret do OAuth devem ficar guardados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em variáveis de ambiente, fora do código-fonte e fora do controle de versão do projeto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Direto no código-fonte, o que facilita a leitura e o versionamento junto com o resto do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "No próprio repositório Git, num arquivo de configuração versionado junto com o código-fonte.",
                                "isCorrect": false
                            },
                            {
                                "text": "No corpo da resposta enviada ao cliente, para que o front-end guarde e reenvie quando precisar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API devolve uma mensagem quando o email digitado não está cadastrado, e outra mensagem diferente quando o email existe mas a senha está incorreta. Qual problema de segurança essa diferença de mensagens cria?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Permite que um atacante descubra, por tentativa, quais emails têm conta (enumeração de usuários).",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum problema real, desde que as senhas estejam guardadas com hash bcrypt no banco de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é apenas de usabilidade, já que mensagens diferentes não revelam nada sobre a base.",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso, sozinho, já impede ataques de força bruta, pois confunde scripts automatizados de login.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que toda a comunicação envolvida no login (envio de senha, envio e recebimento de token) precisa acontecer sempre sobre HTTPS?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque, sem criptografia no transporte, senha e token viajam em texto claro e são interceptados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o HTTPS torna automaticamente o hash da senha mais forte contra ataques de força bruta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o protocolo HTTP puro não permite o uso de cookies para manter a sessão do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque HTTPS é opcional na prática; o que realmente importa é o hash da senha estar correto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação usa tokens JWT com expiração de 30 dias e nunca reduz esse prazo, para o usuário ficar sempre logado. Do ponto de vista de segurança, qual é o principal risco dessa escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Se um token vazar ou for roubado, ele segue válido e utilizável por um atacante por um período muito longo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum risco relevante, já que um token assinado não pode ser copiado nem reaproveitado por terceiros.",
                                "isCorrect": false
                            },
                            {
                                "text": "O único problema real é o tamanho do token, que cresce proporcionalmente quanto maior o prazo escolhido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tokens de longa duração reduzem automaticamente a chance de ataques de força bruta na rota de login.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Recapitulando a trilha e o próximo passo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Recapitulando a trilha e o próximo passo\n\nChegamos à última aula da trilha de Autenticação. Vale a pena parar e olhar para trás: você percorreu um caminho completo, peça por peça, e cada módulo resolveu um problema específico que o anterior deixava em aberto. Vamos reconstituir essa jornada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\", \"Pergunta que resolve\", \"Como\"], [\"Identidade\", \"Quem é o usuário, e por que o servidor esquece entre requisições?\", \"HTTP é stateless; mandar usuário e senha em toda requisição é a abordagem ingênua, e perigosa\"], [\"Senha\", \"Como guardar a senha sem virar um desastre se o banco vazar?\", \"Hash lento e com salt (bcrypt/argon2), nunca texto puro ou hash rápido\"], [\"Sessão\", \"Como o servidor lembra do usuário entre requisições?\", \"Estado guardado no servidor, id de sessão num cookie HttpOnly e Secure\"], [\"Token\", \"Como autenticar sem guardar estado no servidor?\", \"JWT assinado, com claims e expiração, enviado no header Authorization\"], [\"Login\", \"Como juntar tudo numa API real?\", \"Cadastro com hash, login que emite o token, middleware que verifica\"], [\"Autorização\", \"Depois de saber quem é, o que ele pode fazer?\", \"Papéis (RBAC), verificação de dono do recurso, princípio do menor privilégio\"], [\"OAuth\", \"Como logar com Google ou GitHub sem entregar a senha deles?\", \"Autorização delegada, Authorization Code Flow, OpenID Connect\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Um único sistema, não peças soltas\n\nRepare que nenhuma dessas peças funciona isolada. A própria API do ensina.dev, que você usou como referência a trilha inteira, combina todas elas ao mesmo tempo: senhas com hash bcrypt, autenticação por JWT enviado no header Authorization Bearer, um par de access token curto e refresh token longo, papéis (admin e aluno) verificados em middleware, e login social com GitHub e Google via OAuth. Isso não é coincidência: é o conjunto mínimo de peças que qualquer API séria em produção precisa ter para lidar com autenticação e autorização de forma responsável."
                    },
                    {
                        "type": "text",
                        "value": "## O que vem depois: colocar em produção com segurança\n\nEsta trilha fecha o bloco de fundação de back-end: você sabe modelar e consultar dados, construir uma API com Express e, agora, autenticar e autorizar usuários com segurança. O próximo passo natural do roteiro de Back-end é sair do ambiente de desenvolvimento e colocar essa aplicação em produção: variáveis de ambiente separadas por ambiente, HTTPS de verdade com certificado, logs e monitoramento, e os mesmos segredos (JWT secret, client secret do OAuth) guardados com o cuidado redobrado que um ambiente real exige.\n\nTudo o que você aprendeu aqui é pré-requisito direto para isso: não dá para falar em produção segura sem antes saber por que a senha leva hash, por que o token expira e por que o segredo não pode estar no código."
                    },
                    {
                        "type": "text",
                        "value": "## Encerrando\n\nSe você chegou até aqui, já sabe responder, com profundidade, perguntas que muita gente erra até em produção: por que nunca guardar senha em texto puro, a diferença entre autenticar e autorizar, o que um JWT realmente garante (e o que ele não garante), como proteger uma rota por papel e por dono do recurso, e como funciona o botão Entrar com o Google que você usa todo dia. Essa é a base real de autenticação para back-end, a mesma que sustenta aplicações em produção pelo mundo todo. Você está pronto para usar isso em qualquer API que construir daqui para frente."
                    },
                    {
                        "type": "quote",
                        "value": "**Fechando a trilha:** autenticação é a jornada identidade, senha, sessão, token, login, autorização e OAuth, e cada peça resolve um problema que a anterior deixava aberto. Com essa base, o próximo passo do roadmap de Back-end é colocar sua aplicação em produção com a mesma disciplina de segurança que você praticou aqui."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a ordem, do início ao fim, da jornada de autenticação percorrida por esta trilha?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Identidade, senha, sessão, token, login, autorização e, por fim, OAuth.",
                                "isCorrect": true
                            },
                            {
                                "text": "OAuth, senha, autorização, token, sessão, identidade e, por fim, login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Autorização, autenticação, OAuth, senha, sessão, token e, por fim, login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Token, sessão, senha, OAuth, autorização, identidade e, por fim, login.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois desta trilha de Autenticação, qual é o próximo passo natural sugerido no roadmap de Back-end?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Colocar a aplicação em produção com segurança: ambientes separados, HTTPS e segredos protegidos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Voltar ao início do roadmap e aprender HTML e CSS do zero, antes de seguir para frente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar toda a autenticação da aplicação por hash MD5, o que simplificaria bastante o código.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o uso de variáveis de ambiente, o que facilitaria e agilizaria o processo de deploy.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A API do ensina.dev combina hash bcrypt, JWT no header Authorization, access token curto com refresh token longo, papéis (admin e aluno) e login social com GitHub e Google. Por que uma API em produção precisa combinar essas peças, em vez de usar só uma delas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque cada peça resolve um problema diferente, e nenhuma delas sozinha cobre tudo o que é preciso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Express, por padrão, exige que todas essas tecnologias estejam configuradas ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque é apenas redundância; qualquer uma dessas peças, sozinha, já seria suficiente na prática.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um JWT, tecnicamente, não consegue funcionar sem o OAuth estar configurado antes dele.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença central entre autenticação e autorização, os dois pilares trabalhados nesta trilha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Autenticação prova quem é o usuário; autorização decide, depois disso, o que esse usuário pode fazer.",
                                "isCorrect": true
                            },
                            {
                                "text": "Autenticação decide qual papel o usuário tem; autorização verifica se a senha dele está correta.",
                                "isCorrect": false
                            },
                            {
                                "text": "São a mesma coisa na prática, apenas tratadas com nomes diferentes conforme o contexto do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticação é feita somente por OAuth; autorização é feita somente por meio de JWT assinado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação implementa hash de senha correto, JWT assinado, expiração de token e OAuth para login social, mas ainda guarda o client_secret do Google direto no código-fonte, versionado no Git. O que essa aplicação ainda não resolveu, apesar do restante estar correto?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A proteção dos segredos: chaves como o client_secret ficam fora do código e do controle de versão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada relevante; se o hash e o JWT já estão corretos, o restante deixa de ter peso para a segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é que o OAuth deveria ser removido do projeto, por ser, por natureza, o elo mais fraco.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é usar JWT junto com OAuth ao mesmo tempo, uma combinação que nunca deveria ser feita.",
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
        console.log("Trilha " + NOME + " ja tem " + existentes.length + " aulas. Nada a fazer.");
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
    console.log("Seed concluido: " + MODULOS.length + " modulos, " + totalAulas + " aulas, " + totalQuestoes + " questoes.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
