// Seed da trilha Protocolos da Web (iniciante), base do roadmap de Back-end. Idempotente
// e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-protocolos-web.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Protocolos da Web";
const DESCRICAO =
    "Como cliente e servidor conversam na web: HTTP por dentro, métodos, status codes, headers, cookies, JSON e os princípios de REST. A base para construir qualquer back-end.";

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
        "titulo": "Módulo 1 - Como a web funciona: cliente e servidor",
        "aulas": [
            {
                "titulo": "Cliente e servidor: o modelo por trás da web",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Cliente e servidor: o modelo por trás da web\n\nVocê usa a web todos os dias: abre o navegador, visita sites, usa aplicativos que buscam informação na internet. Mas o que acontece, de fato, entre o momento em que você pede alguma coisa e o momento em que ela aparece na tela?\n\nNesta trilha você vai aprender os **protocolos da web**, a base sobre a qual todo back-end é construído. O primeiro passo é entender a ideia mais fundamental de todas: a web funciona por meio de uma conversa entre dois papéis, o **cliente** e o **servidor**.\n\nEsta aula ainda não entra nos detalhes do HTTP (isso vem no Módulo 2). O objetivo aqui é formar o modelo mental correto: quem fala o quê, em que ordem, e por quê."
                    },
                    {
                        "type": "text",
                        "value": "## O que é um cliente\n\n**Cliente** é qualquer programa que **inicia** uma conversa pedindo alguma coisa. O exemplo mais comum é o navegador (Chrome, Firefox, Safari), mas não é o único: um aplicativo de celular, um comando `curl` no terminal, um script em Python ou até outro servidor podem agir como cliente sempre que fazem um pedido.\n\nO que define o cliente não é a tecnologia usada, é o **papel** que ele exerce na conversa: quem pede primeiro.\n\n## O que é um servidor\n\n**Servidor** é um programa que fica **esperando** pedidos chegarem e sabe **responder** a eles. Ele roda continuamente, pronto para atender qualquer cliente que bater à porta (o termo técnico é \"ficar escutando\", conceito que a aula 4 desta trilha explica em detalhe).\n\nUm ponto importante: servidor não é sinônimo de uma máquina física gigante numa sala fria. Servidor é o **programa**. Ele pode rodar no seu próprio notebook durante o desenvolvimento, ou em uma máquina na nuvem atendendo milhões de pessoas. O que importa é o papel: esperar e responder."
                    },
                    {
                        "type": "code",
                        "value": "Cliente (navegador)                          Servidor (ex.: site de uma loja)\n      |                                             |\n      |---- \"Me manda a pagina inicial\" ----------->|\n      |                                             |  (processa o pedido)\n      |<--- \"Aqui esta o HTML da pagina\" ------------|\n      |                                             |\n      |---- \"Me manda a lista de produtos\" -------->|\n      |                                             |  (busca no banco de dados)\n      |<--- \"Aqui esta a lista, em JSON\" -------------|\n\nCada seta de ida e uma REQUISICAO. Cada seta de volta e uma RESPOSTA."
                    },
                    {
                        "type": "text",
                        "value": "## O ciclo se repete, sempre na mesma ordem\n\nRepare no padrão do exemplo acima: o cliente sempre fala primeiro, e o servidor sempre responde depois. Isso é o **modelo requisição-resposta**, a regra de ouro da web:\n\n- O cliente **envia uma requisição** (pede algo: uma página, um dado, uma ação como \"salvar este formulário\").\n- O servidor **processa** o pedido (busca informação, calcula algo, grava no banco de dados).\n- O servidor **devolve uma resposta** (o resultado, ou um aviso de erro).\n- O servidor não inicia conversas por conta própria: ele só fala quando é chamado.\n\nEsse \"idioma\" combinado entre cliente e servidor, com regras claras sobre como pedir e como responder, é chamado de **protocolo**. Na web, o protocolo mais usado é o **HTTP** (Hypertext Transfer Protocol), que você vai destrinchar em detalhes no próximo módulo. Por enquanto, pense nele como o conjunto de regras que garante que qualquer cliente consiga conversar com qualquer servidor, desde que os dois falem HTTP."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cliente\",\"Exemplo de requisição que ele faz\"],[\"Navegador\",\"Pede o HTML de um site ao carregar um endereço\"],[\"Aplicativo de celular\",\"Pede a previsão do tempo a uma API\"],[\"curl ou Postman\",\"Monta manualmente uma requisição para testar uma API\"],[\"Outro servidor\",\"Um back-end pedindo dados a outro back-end, como um serviço de pagamento\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Recapitulando: a web funciona no modelo requisição-resposta. O cliente sempre inicia pedindo algo, o servidor sempre responde. Esse padrão se repete em toda troca na internet, seja um navegador carregando uma página, seja um aplicativo buscando dados em uma API."
                    }
                ],
                "questions": [
                    {
                        "statement": "No modelo cliente-servidor da web, quem inicia a comunicação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O cliente, enviando uma requisição; o servidor responde depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor, que envia dados assim que alguém se conecta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois lados iniciam ao mesmo tempo, de forma simultânea.",
                                "isCorrect": false
                            },
                            {
                                "text": "Depende do tipo de site: em uns é o cliente, em outros é o servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ana abre o navegador e digita o endereço de um site de notícias para lê-las. Nesse momento, qual papel o navegador de Ana está exercendo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cliente, porque é quem está iniciando o pedido de uma página.",
                                "isCorrect": true
                            },
                            {
                                "text": "Servidor, porque vai processar e devolver o conteúdo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum dos dois: papéis só existem depois que a página carrega.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cliente e servidor ao mesmo tempo, já que o navegador também guarda dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um estudante afirma: \"servidor é sempre uma máquina física grande, guardada em um data center\". Por que essa afirmação é imprecisa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque servidor é, antes de tudo, o programa que espera e responde requisições; ele pode rodar até no notebook do próprio desenvolvedor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque só o cliente pode rodar em uma máquina local; o servidor sempre precisa estar na nuvem.",
                                "isCorrect": false
                            },
                            {
                                "text": "A afirmação está correta: sem um data center dedicado, não existe servidor de verdade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque servidor e cliente são sempre o mesmo programa, apenas com nomes diferentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um script em Python faz uma chamada para buscar a cotação do dólar em uma API pública, sem usar navegador algum. Nessa troca, o script está agindo como o quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cliente, porque é ele quem inicia o pedido; qualquer programa que peça algo primeiro exerce esse papel, não só o navegador.",
                                "isCorrect": true
                            },
                            {
                                "text": "Servidor, porque está executando uma lógica própria.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nem cliente nem servidor: scripts não participam do modelo requisição-resposta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Servidor, porque scripts sempre respondem a outros programas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor júnior pergunta: \"se o servidor detectar um produto novo no estoque, ele pode simplesmente mandar essa informação para o navegador do cliente, sem que o cliente peça nada?\". No modelo requisição-resposta clássico da web, qual é a resposta correta para essa dúvida?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não: no modelo clássico o servidor só responde a pedidos que o cliente faz, então o cliente precisaria perguntar de novo (existem técnicas específicas para atualizações em tempo real, mas elas fogem do modelo básico).",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, qualquer servidor pode enviar dados a qualquer momento para qualquer cliente conectado à internet.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque o HTTP foi criado justamente para esse tipo de envio espontâneo do servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, e não existe nenhuma forma de um servidor avisar um cliente sobre mudanças; é uma limitação definitiva da web.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que acontece quando você digita uma URL e aperta Enter",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que acontece quando você digita uma URL e aperta Enter\n\nDigitar um endereço e apertar Enter parece instantâneo, mas por trás desse meio segundo acontece uma sequência bem definida de passos: decompor o endereço, descobrir para onde mandar a requisição, abrir uma conexão e, só então, conversar de fato com o servidor. Entender essa sequência é essencial para quem vai trabalhar com back-end, porque é literalmente o caminho que toda requisição percorre até chegar ao seu código.\n\nNesta aula você vai acompanhar essa jornada passo a passo, da URL digitada até a página completa na tela."
                    },
                    {
                        "type": "text",
                        "value": "## Anatomia de uma URL\n\nAntes de seguir o caminho, vale entender do que uma URL (Uniform Resource Locator) é feita. Ela não é um texto solto: tem uma estrutura fixa, com cada parte cumprindo um papel diferente."
                    },
                    {
                        "type": "code",
                        "value": "https://www.loja.com.br:443/produtos/tenis?cor=preto&tamanho=42#avaliacoes\n\nhttps               <- esquema (protocolo usado: http, https...)\nwww.loja.com.br     <- host (o dominio; \"quem\" vai responder)\n443                 <- porta (aqui e a porta padrao do https, por isso costuma ficar implicita)\n/produtos/tenis     <- caminho (path: qual recurso, dentro do site)\ncor=preto&tamanho=42 <- query string (parametros extras, depois do ?)\navaliacoes          <- fragmento (depois do #; usado so pelo navegador, nunca chega ao servidor)"
                    },
                    {
                        "type": "text",
                        "value": "## O caminho da requisição, passo a passo\n\nCom a URL decomposta, o navegador segue um roteiro parecido com este:\n\n1. Separa a URL em host, porta, caminho e o restante.\n2. Descobre o endereço IP correspondente ao host (a tradução de nome para IP é o **DNS**, tema da próxima aula).\n3. Abre uma conexão com o servidor naquele IP e naquela porta.\n4. Se o esquema for HTTPS, antes de trocar qualquer dado da aplicação acontece um \"aperto de mão\" de segurança (TLS), que passa a criptografar a conversa.\n5. Envia a requisição HTTP (por exemplo, um GET pedindo `/produtos/tenis`).\n6. O servidor recebe, processa (consulta um banco de dados, monta a página) e devolve uma resposta.\n7. O navegador recebe o HTML e começa a interpretá-lo e exibi-lo na tela."
                    },
                    {
                        "type": "code",
                        "value": "Resumo em linha do tempo:\n\nURL digitada\n  -> parse da URL (host, porta, caminho)\n  -> resolucao de DNS (nome -> IP)\n  -> conexao com o servidor (IP:porta)\n  -> [https] negociacao TLS\n  -> requisicao HTTP enviada\n  -> servidor processa e responde\n  -> navegador recebe e renderiza\n\nTudo isso, na maioria das vezes, em bem menos de um segundo."
                    },
                    {
                        "type": "text",
                        "value": "## Uma página é feita de várias requisições\n\nUm detalhe que costuma passar despercebido: o HTML que o servidor devolve raramente vem sozinho. Ao interpretá-lo, o navegador encontra referências a outros arquivos (folhas de estilo CSS, scripts JavaScript, imagens, fontes) e dispara uma **nova requisição para cada um deles**, seguindo exatamente o mesmo modelo requisição-resposta da aula anterior. Uma página \"simples\" pode facilmente significar dezenas de idas e vindas entre navegador e servidor antes de terminar de carregar."
                    },
                    {
                        "type": "quote",
                        "value": "Recapitulando: ao digitar uma URL, o navegador a decompõe em host, porta e caminho, descobre o IP do servidor, abre uma conexão, envia a requisição HTTP e processa a resposta. Como o HTML costuma referenciar outros arquivos, o processo se repete várias vezes até a página carregar por completo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a ordem correta, em linhas gerais, do que acontece ao digitar uma URL e pressionar Enter?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O navegador decompõe a URL, descobre o IP do servidor, abre uma conexão e só então envia a requisição.",
                                "isCorrect": true
                            },
                            {
                                "text": "O navegador renderiza a página e, depois, descobre para qual servidor mandar a requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor responde primeiro, e só depois o navegador monta a requisição correspondente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A resolução de DNS acontece depois que a resposta HTTP já foi recebida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Observe a URL: https://api.loja.com:8443/pedidos/77?status=pago. O que representa o trecho 8443 nessa URL?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A porta usada para se conectar ao servidor.",
                                "isCorrect": true
                            },
                            {
                                "text": "O identificador do pedido.",
                                "isCorrect": false
                            },
                            {
                                "text": "O protocolo de comunicação usado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um parâmetro de busca (query string).",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que o navegador recebe o HTML de uma página, ele costuma disparar diversas outras requisições. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o HTML costuma referenciar outros recursos, como CSS, JavaScript e imagens, que precisam ser buscados em requisições separadas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o HTML sempre chega corrompido na primeira tentativa e precisa ser pedido de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o servidor exige uma confirmação de recebimento antes de liberar qualquer conteúdo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o protocolo HTTP obriga o envio de cada requisição em duplicidade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de enviar a requisição HTTP propriamente dita, o navegador precisa descobrir o endereço IP do servidor a partir do nome digitado (por exemplo, loja.com). Em que momento do processo isso acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Antes de abrir a conexão com o servidor, já que é o IP que indica para onde o navegador deve se conectar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Depois de renderizar a página, apenas para validar o conteúdo já recebido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente quando o servidor solicita essa informação explicitamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Essa etapa não é necessária quando o site usa HTTPS.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma página carrega 1 arquivo HTML, 2 arquivos CSS, 3 arquivos JavaScript e 5 imagens. Do ponto de vista do modelo requisição-resposta, quantas trocas, no mínimo, acontecem entre navegador e servidor para montar essa página por completo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "11: uma requisição e uma resposta para cada um dos 11 arquivos (1 HTML + 2 CSS + 3 JS + 5 imagens).",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas 1, porque tudo vem junto na mesma resposta do HTML.",
                                "isCorrect": false
                            },
                            {
                                "text": "2: uma requisição para o HTML e outra agrupando todo o restante.",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso depende apenas do tamanho da página em megabytes, não da quantidade de arquivos.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O papel do navegador e do servidor",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O papel do navegador e do servidor\n\nNas aulas anteriores você viu que existe uma troca de requisição e resposta, e o caminho que uma URL percorre até virar uma página na tela. Agora é a hora de abrir cada um dos dois lados dessa conversa e detalhar exatamente o que o navegador faz, e o que o servidor faz: dois conjuntos de responsabilidades bem diferentes entre si."
                    },
                    {
                        "type": "text",
                        "value": "## O que o navegador faz\n\nO navegador é muito mais do que uma caixa que envia requisições. Ele é responsável por toda a experiência do lado do cliente:\n\n- Montar e enviar a requisição HTTP (o endereço, os dados de um formulário etc.).\n- Receber a resposta do servidor.\n- Interpretar o HTML recebido e construir a estrutura da página.\n- Aplicar o CSS, definindo a aparência visual.\n- Executar o JavaScript, que pode reagir a cliques, validar formulários e até disparar novas requisições por conta própria.\n- Guardar cookies, histórico e cache, para lembrar de dados entre visitas.\n- Aplicar regras de segurança do próprio navegador, como impedir que o script de um site leia dados de outro site aberto em outra aba."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Responsabilidade do navegador\",\"O que significa\"],[\"Requisitar\",\"Montar e enviar a requisição HTTP\"],[\"Interpretar\",\"Fazer o parse do HTML, CSS e JavaScript recebidos\"],[\"Renderizar\",\"Desenhar a página na tela para o usuário\"],[\"Gerenciar estado local\",\"Guardar cookies, cache e histórico de navegação\"],[\"Aplicar segurança do cliente\",\"Isolar scripts de sites diferentes entre si\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que o servidor faz\n\nDo outro lado da conversa, o servidor tem uma lista de responsabilidades bem diferente:\n\n- Ficar escutando em uma porta, esperando conexões chegarem.\n- Receber a requisição e identificar o que foi pedido: o caminho e o método usados.\n- Executar a lógica correspondente àquele pedido (é aqui que mora o back-end, tema da próxima aula).\n- Consultar um banco de dados, um arquivo ou outro serviço, quando necessário.\n- Montar a resposta, decidindo o status, os cabeçalhos e o corpo.\n- Atender, ao mesmo tempo, muitos clientes diferentes, sem misturar os pedidos de um com os de outro."
                    },
                    {
                        "type": "code",
                        "value": "Quando chega uma requisicao, o servidor decide o que fazer de acordo com o caminho pedido:\n\nGET /produtos/42\n  -> buscar o produto de id 42 no banco de dados\n  -> se existir: responder 200 com os dados em JSON\n  -> se nao existir: responder 404\n\nPOST /produtos\n  -> ler os dados enviados no corpo da requisicao\n  -> validar os dados\n  -> salvar um novo produto no banco de dados\n  -> responder 201 com o produto criado"
                    },
                    {
                        "type": "text",
                        "value": "## Dois lados, duas preocupações\n\nFica clara a divisão: o navegador cuida da **apresentação** (o que o usuário vê e como interage), enquanto o servidor cuida dos **dados e das regras** (o que pode ou não acontecer). E existe uma consequência prática importante: como o navegador roda inteiramente na máquina do usuário, o servidor não pode confiar cegamente em nada que vem de lá, ideia que você vai aprofundar mais adiante nesta trilha.\n\nVale lembrar também que nem todo cliente é um navegador: um aplicativo mobile ou um script que consome uma API não fazem parse de HTML nem aplicam CSS, mas continuam enviando requisições e tratando respostas, exercendo o mesmo papel de cliente."
                    },
                    {
                        "type": "quote",
                        "value": "Recapitulando: o navegador requisita, interpreta e renderiza, cuidando da experiência do usuário; o servidor escuta, processa e responde, cuidando da lógica e dos dados. Cada lado tem um trabalho diferente, e é exatamente por isso que a web consegue separar interface de regras de negócio."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das alternativas é uma responsabilidade tipicamente do navegador, e não do servidor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Interpretar o HTML recebido e renderizar a página na tela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Consultar o banco de dados para buscar informações.",
                                "isCorrect": false
                            },
                            {
                                "text": "Decidir qual status HTTP deve ser devolvido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Executar a lógica de negócio da aplicação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das alternativas é uma responsabilidade tipicamente do servidor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ficar escutando conexões em uma porta e responder às requisições que chegam.",
                                "isCorrect": true
                            },
                            {
                                "text": "Renderizar o HTML na tela do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar o CSS para estilizar a página.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerenciar o histórico de navegação do usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aplicativo mobile consome uma API que devolve dados em JSON, sem exibir nenhum HTML. Esse aplicativo deixa de ser um cliente por não renderizar páginas web?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não: cliente é definido pelo papel de iniciar a requisição e consumir a resposta, não pela forma como o conteúdo é exibido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, só o navegador pode ser considerado um cliente de verdade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque sem HTML não existe requisição HTTP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, mas nesse caso o aplicativo passa a exercer o papel de servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao carregar uma página, um trecho de JavaScript executado pelo navegador dispara uma nova requisição para buscar dados atualizados, sem recarregar a página inteira. Isso é possível porque...",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O JavaScript, executado pelo navegador, pode montar e enviar novas requisições HTTP por conta própria, continuando a exercer o papel de cliente.",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor assume o controle do navegador durante esse momento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso é, na verdade, uma exceção ao modelo requisição-resposta.",
                                "isCorrect": false
                            },
                            {
                                "text": "O HTML sozinho, sem JavaScript, já é capaz de enviar requisições.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor decide validar um formulário de cadastro apenas com JavaScript no navegador (conferindo se o e-mail é válido antes do envio), sem repetir essa validação no servidor. Considerando os papéis de cliente e servidor, qual é o principal risco dessa decisão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Como o navegador roda na máquina do usuário, ele pode ser manipulado ou ter o JavaScript desativado, permitindo o envio de dados inválidos direto ao servidor; validar só no cliente não impede dados incorretos de chegar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum risco relevante, já que o navegador sempre garante que a validação rodou antes do envio.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor rejeitaria automaticamente qualquer requisição que não tivesse passado por essa validação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco é apenas estético, já que o formato JSON é sempre validado pelo próprio protocolo HTTP.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Endereços na internet: IP, DNS e porta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Endereços na internet: IP, DNS e porta\n\nNa aula anterior você viu que, antes de enviar a requisição HTTP, o navegador precisa descobrir o **IP** do servidor e abrir uma conexão numa **porta** específica. Chegou a hora de abrir essas peças: o que é um **endereço IP**, o que é o **DNS** e o que é uma **porta**. Os três, juntos, respondem a uma pergunta simples: para onde, exatamente, essa requisição deve viajar?"
                    },
                    {
                        "type": "text",
                        "value": "## Endereço IP: a localização de uma máquina na rede\n\nTodo dispositivo conectado à internet (um servidor, o seu notebook, o seu celular) recebe um **endereço IP** (Internet Protocol): um número que identifica aquele dispositivo dentro da rede, de forma parecida com um endereço postal identificando uma casa. É para esse número que os dados efetivamente viajam.\n\nO formato mais comum ainda é o **IPv4**: quatro números de 0 a 255 separados por ponto, como `203.0.113.55`. Como o mundo tem mais dispositivos conectados do que endereços IPv4 disponíveis, existe também o **IPv6**, um formato mais novo e com espaço muito maior, escrito em grupos hexadecimais separados por dois-pontos, como `2001:db8::1`. Para os fins desta trilha, o que importa é o conceito: **um IP identifica uma máquina**, seja qual for o formato."
                    },
                    {
                        "type": "code",
                        "value": "1. Voce digita https://www.loja.com.br na barra de enderecos\n2. O navegador pergunta a um servidor DNS: qual e o IP de www.loja.com.br ?\n3. O DNS responde: 203.0.113.55\n4. O navegador abre a conexao com 203.0.113.55, na porta 443 (https)\n5. Dali em diante, a conversa acontece por IP e porta; o nome digitado ja cumpriu seu papel"
                    },
                    {
                        "type": "text",
                        "value": "## DNS: de nome para número\n\nDecorar números IP para visitar cada site seria inviável. O **DNS** (Domain Name System, Sistema de Nomes de Domínio) existe exatamente para resolver esse problema: ele funciona como uma agenda de contatos gigante e distribuída, que traduz nomes fáceis de lembrar (como `loja.com.br`) para o endereço IP correspondente.\n\nEsse processo de tradução se chama **resolução de DNS**. Ele acontece de forma automática e, na maior parte do tempo, rápida: o navegador (ou o sistema operacional) consulta servidores DNS até obter a resposta, muitas vezes usando um resultado já guardado em cache de uma consulta anterior. Sem DNS, a web ainda funcionaria tecnicamente, mas você precisaria saber o IP de cada site de cor."
                    },
                    {
                        "type": "text",
                        "value": "## Porta: qual serviço, dentro da mesma máquina\n\nUm único servidor físico (um único IP) costuma rodar **vários serviços ao mesmo tempo**: um servidor web, um banco de dados, um serviço de acesso remoto. Como o computador sabe para qual desses serviços entregar cada pacote de dados que chega? É aí que entra a **porta**: um número que identifica, dentro de uma máquina, qual programa deve receber aquela conexão.\n\nUma analogia útil: o **IP é o endereço do prédio**, e a **porta é o número do apartamento**. O prédio (a máquina) pode ter dezenas de apartamentos (serviços), cada um esperando visitas na sua própria porta.\n\nAlgumas portas são tão associadas a determinados serviços que viraram convenção (as chamadas portas conhecidas, ou well-known ports). Por isso a maioria das URLs não mostra a porta: quando você acessa https://loja.com, o navegador já assume a porta 443 por padrão. Só é preciso escrever a porta explicitamente, como em `http://localhost:3000`, quando o serviço usa uma porta fora do padrão."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Porta\",\"Serviço comum\"],[\"80\",\"HTTP, o protocolo web sem criptografia\"],[\"443\",\"HTTPS, o protocolo web com criptografia (TLS)\"],[\"22\",\"SSH, acesso remoto seguro a servidores\"],[\"5432\",\"PostgreSQL, um banco de dados relacional comum em back-ends\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Recapitulando: o IP identifica uma máquina na rede, o DNS traduz nomes de domínio (fáceis para humanos) em endereços IP (usados pelas máquinas), e a porta identifica qual serviço, dentro daquela máquina, deve atender a conexão. Toda requisição HTTP, no fim das contas, viaja até um par IP:porta."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a função do DNS?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Traduzir nomes de domínio, como loja.com.br, em endereços IP que as máquinas usam para se conectar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criptografar os dados trafegados entre cliente e servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir qual método HTTP deve ser usado em cada requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenar o HTML das páginas mais visitadas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma analogia comum, o endereço IP é comparado ao endereço de um prédio. Nessa mesma analogia, o que representa a porta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O número do apartamento, indicando qual serviço específico, dentro da máquina, deve atender a conexão.",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome da rua, outra forma de identificar o mesmo prédio.",
                                "isCorrect": false
                            },
                            {
                                "text": "O porteiro, que decide se a visita pode entrar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O CEP da região onde o prédio está localizado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma desenvolvedora sobe uma API na própria máquina, acessível em http://localhost:3000, enquanto o banco de dados PostgreSQL da mesma máquina escuta em outra porta, 5432. Por que os dois serviços podem rodar na mesma máquina sem conflito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque cada serviço escuta em uma porta diferente; o IP identifica a máquina, mas é a porta que direciona a conexão para o serviço correto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque cada serviço recebe automaticamente um endereço IP diferente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque apenas um serviço pode ficar ativo por vez, e eles se revezam.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o DNS separa os dois serviços automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao acessar https://loja.com no navegador, você não precisa digitar nenhuma porta. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque HTTPS usa por padrão a porta 443, e o navegador já assume esse valor quando nenhuma porta é informada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque sites HTTPS não usam portas, apenas endereços IP diretos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a porta é definida pelo DNS no momento da resolução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o navegador sempre tenta a porta 80 primeiro, e só usa a 443 se falhar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time percebe que o site principal, na porta 443, está fora do ar, mas o painel administrativo, hospedado no mesmo servidor (mesmo IP), só que na porta 8443, continua funcionando normalmente. O que essa situação demonstra sobre a relação entre IP e porta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que serviços diferentes na mesma máquina são independentes entre si quando escutam em portas diferentes; um pode falhar sem necessariamente afetar o outro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o IP do servidor mudou automaticamente para atender o painel administrativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a porta 8443 pertence, na verdade, a uma máquina diferente da porta 443.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o DNS redirecionou o tráfego da porta 443 para a 8443 automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que é um back-end e o que ele faz",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é um back-end e o que ele faz\n\nAo longo deste módulo você viu como cliente e servidor conversam, o que acontece ao digitar uma URL, os papéis do navegador e do servidor, e os conceitos de IP, DNS e porta. Chegou a hora de amarrar tudo isso na pergunta que dá origem a esta trilha, e à profissão que você está estudando: afinal, o que é um **back-end**, e o que ele faz de fato?"
                    },
                    {
                        "type": "text",
                        "value": "## O lado servidor da aplicação\n\n**Back-end** é o conjunto de código que roda no **servidor**: a parte da aplicação responsável pelas regras de negócio, pelo acesso a dados e pela segurança. Ele é, na prática, quem implementa o papel de \"servidor\" que você viu nas aulas anteriores: fica esperando requisições e devolve respostas.\n\nO oposto é o **front-end**: o código que roda no **navegador** do usuário (ou dentro de um aplicativo), responsável pela interface visual e pela interação. Front-end e back-end são, quase sempre, dois programas separados, que conversam entre si exatamente pelo modelo requisição-resposta que você aprendeu nesta trilha: o front-end (cliente) pede, o back-end (servidor) responde, tipicamente trocando dados em JSON (assunto do Módulo 6)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Front-end\",\"Back-end\"],[\"Onde roda\",\"No navegador do usuário\",\"No servidor\"],[\"Do que cuida\",\"Interface, interação, visual\",\"Regras de negócio, dados, segurança\"],[\"Exemplos de tecnologia\",\"HTML, CSS, JavaScript, React\",\"Node.js, Python, Java, C# e um banco de dados\"],[\"O usuário vê o código?\",\"Sim, é possível inspecionar\",\"Não, roda longe do usuário\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que um back-end faz, na prática\n\nNo dia a dia, construir um back-end costuma envolver:\n\n- Expor endpoints (URLs) que o front-end, um aplicativo ou outro serviço podem chamar.\n- Receber e validar os dados enviados pelo cliente.\n- Aplicar regras de negócio, como \"não permitir comprar mais itens do que há em estoque\".\n- Ler e gravar dados em um banco de dados.\n- Autenticar o usuário (quem é) e autorizar ações (o que ele pode fazer).\n- Se comunicar com outros serviços, como um gateway de pagamento ou um serviço de envio de e-mail.\n- Devolver uma resposta formatada, normalmente em JSON, com o resultado da operação."
                    },
                    {
                        "type": "code",
                        "value": "Cliente envia: POST /pedidos com o corpo {\"produtoId\": 42, \"quantidade\": 2}\n\nNo back-end, o servidor:\n1. Confere se o usuario esta autenticado (tem uma sessao ou token valido)\n2. Valida os dados recebidos (o produtoId existe? a quantidade e um numero positivo?)\n3. Consulta o banco de dados: o produto 42 tem estoque para 2 unidades?\n4. Aplica a regra de negocio: calcula o preco total, aplica desconto se houver\n5. Grava o novo pedido no banco de dados\n6. Devolve a resposta: HTTP/1.1 201 Created, com o pedido criado em JSON"
                    },
                    {
                        "type": "text",
                        "value": "## Fechando o módulo\n\nRepare como as peças se encaixam: o **cliente** (muitas vezes um front-end rodando no navegador) envia uma **requisição** para um **servidor**, que roda em algum lugar identificado por um **IP** (descoberto a partir de um nome de domínio, via **DNS**) e que escuta em uma **porta**. Do lado do servidor, o **back-end** processa o pedido, aplica regras, mexe em dados e devolve uma **resposta**.\n\nEsse é o alicerce. A partir do próximo módulo, você vai abrir o protocolo que sustenta essa conversa toda, o **HTTP**, e destrinchar cada detalhe de uma requisição e de uma resposta reais."
                    },
                    {
                        "type": "quote",
                        "value": "Recapitulando: back-end é o código que roda no servidor e cuida da lógica de negócio, dos dados e da segurança da aplicação, respondendo às requisições feitas pelo cliente (com frequência, um front-end). É essa peça que você vai aprender a construir ao longo de toda a trilha de back-end."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções descreve corretamente o back-end de uma aplicação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O código que roda no servidor e cuida de regras de negócio, dados e segurança.",
                                "isCorrect": true
                            },
                            {
                                "text": "O código que roda no navegador e monta a interface visual.",
                                "isCorrect": false
                            },
                            {
                                "text": "O design das telas e a experiência do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o banco de dados, sem nenhum código associado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das alternativas é uma responsabilidade típica de um back-end?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Validar os dados recebidos e gravar um novo registro no banco de dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Estilizar um botão com CSS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir a animação de transição entre duas telas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Renderizar o HTML diretamente na tela do usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação de e-commerce recebe um pedido de compra e precisa checar se ainda há estoque do produto antes de confirmar a venda. Onde essa verificação deve, obrigatoriamente, acontecer para ser confiável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No back-end, pois é o servidor quem tem acesso controlado aos dados reais de estoque e pode garantir que a regra seja realmente aplicada.",
                                "isCorrect": true
                            },
                            {
                                "text": "No front-end, pois é mais rápido para o usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tanto faz: front-end e back-end têm o mesmo nível de controle sobre os dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "No navegador do cliente, usando apenas JavaScript.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Front-end e back-end normalmente são dois programas separados. Como eles se comunicam?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pelo modelo requisição-resposta: o front-end (cliente) envia requisições, e o back-end (servidor) devolve respostas, geralmente com dados em JSON.",
                                "isCorrect": true
                            },
                            {
                                "text": "Compartilhando a mesma memória do processo, sem enviar nada pela rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "O back-end sempre inicia a conversa enviando dados ao front-end.",
                                "isCorrect": false
                            },
                            {
                                "text": "Front-end e back-end precisam estar escritos na mesma linguagem de programação para se comunicar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor implementa toda a validação de um cadastro (e-mail válido, senha forte, campos obrigatórios) apenas no front-end, em JavaScript, e nenhuma validação no back-end, argumentando que \"assim a resposta é mais rápida para o usuário\". Do ponto de vista da arquitetura cliente-servidor, qual é o problema dessa decisão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O back-end ficaria exposto a receber dados inválidos ou maliciosos diretamente, já que qualquer cliente pode enviar requisições que ignorem ou burlem a validação do front-end.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não há problema algum, já que o front-end sempre garante que os dados estão corretos antes de qualquer envio.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é apenas de desempenho, pois o front-end fica sobrecarregado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A validação no front-end torna a validação no back-end desnecessária por definição, já que os dados nunca mudam no caminho.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - HTTP por dentro",
        "aulas": [
            {
                "titulo": "A anatomia de uma requisição HTTP",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# HTTP por dentro\n\nNo módulo anterior você viu o modelo requisição resposta por fora: o navegador pede, o servidor responde, algo aparece na tela. Agora é hora de abrir essa requisição e olhar exatamente o que viaja pela rede.\n\nHTTP (HyperText Transfer Protocol) é o protocolo que define o formato dessa conversa. Não importa se o cliente é o Chrome, o curl ou um aplicativo de celular: toda requisição HTTP segue a mesma estrutura, dividida em três partes bem definidas."
                    },
                    {
                        "type": "text",
                        "value": "## As três partes de uma requisição\n\nUma requisição HTTP é, na essência, um texto formatado que o cliente monta e envia pela conexão de rede. Ela sempre tem:\n\n- **Linha de requisição**: o método, o caminho do recurso e a versão do protocolo.\n- **Headers**: linhas no formato `Chave: Valor` com metadados sobre a requisição.\n- **Corpo (opcional)**: os dados que o cliente está enviando, quando existem.\n\nEntre os headers e o corpo existe sempre uma linha em branco. É ela que separa \"os metadados acabaram\" de \"aqui começa o conteúdo\". Na especificação, cada linha termina com CRLF (\\r\\n), mas os exemplos deste curso usam quebra de linha simples para ficar mais fácil de ler."
                    },
                    {
                        "type": "code",
                        "value": "GET /produtos/42 HTTP/1.1\nHost: api.loja.com\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\nAccept: application/json\nConnection: keep-alive"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo a linha de requisição\n\nA primeira linha concentra as informações mais importantes:\n\n`GET /produtos/42 HTTP/1.1`\n\n- `GET` é o **método**: a ação que o cliente quer realizar (buscar, criar, atualizar, remover). O módulo 3 entra a fundo nisso.\n- `/produtos/42` é o **caminho (path)**: qual recurso, dentro daquele servidor, está sendo o alvo da requisição.\n- `HTTP/1.1` é a **versão do protocolo** que o cliente está falando.\n\nRepare que o domínio (`api.loja.com`) não aparece na linha de requisição. Ele vai no header `Host`, obrigatório desde o HTTP/1.1, porque um mesmo servidor físico pode responder por vários domínios diferentes."
                    },
                    {
                        "type": "code",
                        "value": "POST /carrinho HTTP/1.1\nHost: api.loja.com\nContent-Type: application/json\nContent-Length: 34\nAuthorization: Bearer eyJhbGciOiJIUzI1NiJ9...\n\n{\"produtoId\": 42, \"quantidade\": 2}"
                    },
                    {
                        "type": "text",
                        "value": "## O corpo e os headers que o descrevem\n\nUm `GET` normalmente não tem corpo: ele só pede algo, não envia dado nenhum. Já um `POST` costuma carregar um corpo com os dados a processar, como no exemplo acima.\n\nDois headers trabalham juntos para descrever esse corpo:\n\n- `Content-Type` diz **o formato** dos dados (aqui, JSON).\n- `Content-Length` diz **o tamanho em bytes** do corpo, para o servidor saber exatamente onde ele termina.\n\nQuando o servidor exige autenticação, também é comum ver o header `Authorization`, com um token que identifica quem está fazendo a requisição. O módulo 5 volta a esse header com calma."
                    },
                    {
                        "type": "quote",
                        "value": "Toda requisição HTTP tem linha de requisição, headers e, opcionalmente, um corpo separado por uma linha em branco. É um formato de texto simples, mas rígido: cliente e servidor só se entendem porque os dois seguem exatamente essa estrutura."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em qual parte de uma requisição HTTP fica o método (GET, POST etc.)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Na linha de requisição, junto com o caminho e a versão do protocolo",
                                "isCorrect": true
                            },
                            {
                                "text": "No header Content-Type",
                                "isCorrect": false
                            },
                            {
                                "text": "No corpo da requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "No header Host",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que separa os headers do corpo em uma requisição HTTP?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma linha em branco",
                                "isCorrect": true
                            },
                            {
                                "text": "O header Content-Length",
                                "isCorrect": false
                            },
                            {
                                "text": "O caractere ;",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe separação, eles ficam sempre juntos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor está montando uma requisição HTTP/1.1 manualmente, direto no socket, e esquece de incluir o header Host. Qual é a consequência mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Muitos servidores vão rejeitar a requisição, porque Host é obrigatório desde o HTTP/1.1",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma, o Host só é usado em requisições POST",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor vai assumir automaticamente que o caminho pedido é a raiz /",
                                "isCorrect": false
                            },
                            {
                                "text": "O próprio protocolo completa o Host sozinho usando o valor do Content-Type",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API recebe uma requisição POST /pedidos HTTP/1.1 com Content-Type: application/json e um corpo de 128 bytes, mas sem o header Content-Length. Qual é o principal problema disso para o servidor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O servidor pode não saber com precisão onde termina o corpo da requisição",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor vai rejeitar automaticamente por falta do header Accept",
                                "isCorrect": false
                            },
                            {
                                "text": "O método POST deixa de ser válido sem Content-Length",
                                "isCorrect": false
                            },
                            {
                                "text": "O JSON enviado deixa de ser sintaticamente válido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o domínio completo (como api.loja.com) normalmente não aparece na linha de requisição de um GET comum, aparecendo só o caminho /produtos/42?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o domínio já foi resolvido via DNS e usado para abrir a conexão com aquele servidor; o header Host informa por qual domínio a requisição deve ser tratada",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o HTTP/1.1 não permite o uso de domínios em nenhuma parte da requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o header Content-Type substitui a necessidade de informar o domínio",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o domínio só é necessário em requisições feitas por HTTPS",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A anatomia de uma resposta HTTP",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Se a requisição é a pergunta, a resposta é o que o servidor devolve depois de processar tudo. E ela segue uma lógica quase simétrica à da requisição, só que trocando a linha de requisição por uma **linha de status**.\n\n## As três partes de uma resposta\n\nAssim como a requisição, toda resposta HTTP tem:\n\n- **Linha de status**: versão do protocolo, código de status e uma frase curta.\n- **Headers**: metadados sobre a resposta.\n- **Corpo (opcional)**: o conteúdo devolvido, quando existe."
                    },
                    {
                        "type": "code",
                        "value": "HTTP/1.1 200 OK\nContent-Type: application/json\nContent-Length: 55\nDate: Fri, 10 Jul 2026 14:32:10 GMT\nServer: nginx/1.25\n\n{\"id\": 42, \"nome\": \"Teclado mecânico\", \"preco\": 350.0}"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo a linha de status\n\nA primeira linha da resposta concentra o resultado da requisição:\n\n`HTTP/1.1 200 OK`\n\n- `HTTP/1.1` é a versão do protocolo que o servidor está usando para responder.\n- `200` é o **código de status**: um número que classifica o resultado (sucesso, redirecionamento, erro do cliente, erro do servidor). O módulo 4 é inteiro dedicado a eles.\n- `OK` é a **reason phrase**, um texto curto que existe só para leitura humana. Quem decide o comportamento é o número: um sistema não deveria checar se essa frase é exatamente \"OK\", porque ela pode variar entre servidores."
                    },
                    {
                        "type": "code",
                        "value": "HTTP/1.1 404 Not Found\nContent-Type: application/json\nContent-Length: 38\nDate: Fri, 10 Jul 2026 14:33:02 GMT\n\n{\"erro\": \"Produto 42 não encontrado\"}"
                    },
                    {
                        "type": "text",
                        "value": "## Corpo e headers da resposta\n\nO corpo da resposta segue a mesma lógica do corpo da requisição: `Content-Type` diz o formato (JSON, HTML, imagem) e `Content-Length` diz o tamanho em bytes. Nem toda resposta tem corpo: um `204 No Content`, por exemplo, é uma resposta de sucesso que não devolve nada no corpo, só confirma que a operação deu certo.\n\nOutros headers comuns de resposta trazem informação sobre o servidor e sobre como o cliente deve tratar aquele conteúdo, como cache e a data em que a resposta foi gerada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Header\",\"Para que serve\"],[\"Content-Type\",\"Formato do corpo (application/json, text/html, image/png...)\"],[\"Content-Length\",\"Tamanho do corpo em bytes\"],[\"Date\",\"Data e hora em que o servidor gerou a resposta\"],[\"Server\",\"Identifica o software do servidor (nginx, Apache...)\"],[\"Cache-Control\",\"Instruções de cache para o cliente (módulo 5)\"],[\"Set-Cookie\",\"Pede ao cliente para guardar um cookie (módulo 5)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Requisição e resposta compartilham a mesma anatomia: uma primeira linha com o essencial, headers com metadados e um corpo opcional. Aprender a ler essa estrutura crua é o que permite depurar problemas de verdade, direto no DevTools ou no curl -v, sem depender de nenhuma biblioteca no meio do caminho."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a linha de status de uma resposta HTTP contém?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Versão do protocolo, código de status e uma frase descritiva",
                                "isCorrect": true
                            },
                            {
                                "text": "Método, caminho e versão do protocolo",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o código de status, sem mais nada",
                                "isCorrect": false
                            },
                            {
                                "text": "Content-Type e Content-Length",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das respostas abaixo é, por definição, uma resposta de sucesso que nunca vem acompanhada de corpo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "204 No Content",
                                "isCorrect": true
                            },
                            {
                                "text": "200 OK",
                                "isCorrect": false
                            },
                            {
                                "text": "201 Created",
                                "isCorrect": false
                            },
                            {
                                "text": "404 Not Found",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação cliente decide tratar como sucesso qualquer resposta cuja reason phrase contenha a palavra \"OK\", ignorando o código numérico. Por que essa prática é arriscada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a reason phrase é só texto para leitura humana e pode variar entre servidores; quem define o resultado é o código numérico",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque toda resposta HTTP usa exatamente a mesma reason phrase, então a checagem nunca funcionaria",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a reason phrase só existe em respostas de erro",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Content-Type já garante sozinho que a resposta foi bem-sucedida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O servidor devolve uma resposta com Content-Type: application/json e um corpo de 55 bytes, mas esquece de enviar o header Content-Length. Qual é o impacto mais direto disso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O cliente pode ter dificuldade para saber com precisão onde o corpo da resposta termina",
                                "isCorrect": true
                            },
                            {
                                "text": "A resposta deixa de ter uma linha de status válida",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor é obrigado a trocar o código de status para 500",
                                "isCorrect": false
                            },
                            {
                                "text": "O JSON do corpo deixa de poder ser interpretado pelo cliente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API devolve HTTP/1.1 200 OK para uma requisição que cria um novo recurso, mas parte do time defende que deveria ser 201 Created. Do ponto de vista da anatomia da resposta, qual é a diferença real entre usar 200 ou 201 nesse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nenhuma na estrutura da resposta, já que as duas têm linha de status, headers e corpo; a diferença está no código, que comunica de forma mais precisa que um novo recurso foi criado",
                                "isCorrect": true
                            },
                            {
                                "text": "200 não permite corpo na resposta, enquanto 201 exige corpo obrigatoriamente",
                                "isCorrect": false
                            },
                            {
                                "text": "201 obriga o uso de HTTP/2, enquanto 200 é exclusivo do HTTP/1.1",
                                "isCorrect": false
                            },
                            {
                                "text": "200 só pode ser usado com GET e 201 só com POST, então a escolha depende do método usado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "HTTP não tem memória: o que significa ser stateless",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Toda requisição HTTP que você viu até agora tem uma característica fundamental que ainda não foi nomeada: o servidor não guarda memória de uma requisição para a outra. Isso se chama **stateless** (sem estado), e é uma das decisões de design mais importantes do protocolo.\n\n## O que significa não ter estado\n\nCada requisição HTTP é tratada pelo servidor como um evento isolado e completo. Por padrão, o servidor não sabe que a requisição de agora veio do mesmo cliente que fez uma requisição há 2 segundos. Tudo que o servidor precisa para responder tem que estar **dentro daquela própria requisição**: nos headers, no corpo, na URL."
                    },
                    {
                        "type": "code",
                        "value": "POST /login HTTP/1.1\nHost: api.loja.com\nContent-Type: application/json\nContent-Length: 49\n\n{\"email\": \"ana@exemplo.com\", \"senha\": \"12345678\"}\n\n\nGET /pedidos HTTP/1.1\nHost: api.loja.com\nAccept: application/json"
                    },
                    {
                        "type": "text",
                        "value": "## Duas requisições, nenhuma lembrança\n\nNo exemplo acima, a primeira requisição faz login. A segunda pede a lista de pedidos, sem enviar nenhuma credencial. Se o servidor for realmente stateless, ele **não tem como saber** que as duas vieram da mesma pessoa: não existe uma variável guardada em algum lugar dizendo \"esse cliente é a Ana e ela acabou de fazer login\". Sem alguma informação extra repetida na segunda requisição, o servidor provavelmente responde com `401 Unauthorized`.\n\nIsso é bem diferente de um programa de desktop comum, que guarda na memória quem fez login e continua sabendo disso enquanto o programa estiver aberto. HTTP não funciona assim."
                    },
                    {
                        "type": "text",
                        "value": "## Então como as aplicações \"lembram\" de você?\n\nSe o protocolo não guarda estado, mas sites e aplicativos claramente sabem quem você é entre uma página e outra, alguma coisa está preenchendo essa lacuna. A resposta é: **o cliente reenvia, em cada requisição, alguma informação que identifica quem ele é**. O servidor nunca lembra sozinho, mas o cliente carrega essa lembrança por ele.\n\nAs duas formas mais comuns disso são um token de autenticação enviado no header `Authorization`, ou um identificador de sessão guardado em um cookie e reenviado automaticamente pelo navegador a cada requisição."
                    },
                    {
                        "type": "code",
                        "value": "GET /pedidos HTTP/1.1\nHost: api.loja.com\nAuthorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbmFAZXhlbXBsby5jb20ifQ.xyz\n\n\nGET /pedidos/99 HTTP/1.1\nHost: api.loja.com\nAuthorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbmFAZXhlbXBsby5jb20ifQ.xyz"
                    },
                    {
                        "type": "text",
                        "value": "## Por que projetar assim\n\nPode parecer estranho, à primeira vista, um protocolo que \"esquece\" tudo a cada requisição. Mas isso traz uma vantagem de escala: como nenhuma requisição depende de um estado guardado em um servidor específico, qualquer servidor de um cluster pode responder a qualquer requisição, sem precisar ser sempre o mesmo que atendeu o cliente da última vez.\n\nO preço dessa vantagem é que o próprio cliente, ou algum mecanismo como cookies, precisa carregar a identidade e o contexto em toda requisição. O módulo 5 aprofunda cookies, sessão e Authorization com mais detalhe."
                    },
                    {
                        "type": "quote",
                        "value": "Stateless não quer dizer que aplicações não têm memória: quer dizer que essa memória não vive no protocolo. HTTP trata cada requisição como se fosse a primeira vez que aquele cliente aparece, e cabe à aplicação reenviar o contexto necessário em cada uma delas."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que o HTTP é um protocolo stateless (sem estado)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que o servidor não guarda memória de requisições anteriores do mesmo cliente",
                                "isCorrect": true
                            },
                            {
                                "text": "Que as requisições nunca podem ter corpo",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o servidor sempre responde com o mesmo código de status",
                                "isCorrect": false
                            },
                            {
                                "text": "Que só é possível usar o método GET",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um servidor HTTP stateless, o que é necessário para o servidor saber que duas requisições vieram do mesmo usuário logado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Alguma informação de identidade precisa ser reenviada em cada requisição, como um token ou cookie",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada, o servidor reconhece automaticamente o usuário pelo endereço IP",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas requisições precisam usar a mesma conexão TCP para sempre",
                                "isCorrect": false
                            },
                            {
                                "text": "O navegador guarda o estado da sessão dentro do header Content-Type",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API faz login em POST /login e devolve um token. Em uma requisição seguinte, GET /pedidos é enviada sem o header Authorization. Supondo uma API stateless de verdade, qual é o resultado mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A API trata a requisição como se viesse de um cliente não autenticado, provavelmente respondendo 401 Unauthorized",
                                "isCorrect": true
                            },
                            {
                                "text": "A API reconhece a sessão automaticamente pelo endereço IP de origem",
                                "isCorrect": false
                            },
                            {
                                "text": "A API reaproveita a conexão TCP anterior e mantém o usuário logado",
                                "isCorrect": false
                            },
                            {
                                "text": "A API bloqueia o servidor inteiro até o token ser reenviado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe distribui as requisições de uma API entre vários servidores idênticos atrás de um balanceador de carga, sem que cada cliente precise sempre cair no mesmo servidor. Isso é viável de forma direta porque:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O HTTP é stateless, então qualquer servidor pode atender qualquer requisição, desde que ela carregue tudo que é preciso para respondê-la",
                                "isCorrect": true
                            },
                            {
                                "text": "O HTTP/1.1 sincroniza automaticamente a memória entre todos os servidores do cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "Os cookies são compartilhados automaticamente entre servidores diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso só é possível porque o Content-Length garante a ordem de chegada das requisições",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor guarda, na memória do processo do servidor, um dicionário que associa cada usuário logado ao seu carrinho de compras, sem enviar nenhum identificador do carrinho a cada requisição. Qual problema esse design tende a criar quando a aplicação passa a rodar em múltiplas instâncias do servidor?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O carrinho pode \"sumir\" quando o balanceador direcionar o usuário para uma instância diferente, porque o estado ficou preso na memória de um único servidor, contrariando a natureza stateless do HTTP",
                                "isCorrect": true
                            },
                            {
                                "text": "O JSON do carrinho vai automaticamente ultrapassar o limite do Content-Length",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor deixa de aceitar requisições GET a partir desse momento",
                                "isCorrect": false
                            },
                            {
                                "text": "O protocolo HTTP rejeita a requisição por excesso de headers",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "As versões do HTTP: 1.1, 2 e 3",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Até aqui, todo exemplo mostrou requisições e respostas no formato do HTTP/1.1: texto puro, linha por linha. Essa versão existe desde 1997 e ainda é extremamente usada, mas não é mais a única. HTTP/2 (2015) e HTTP/3 (2022) vieram depois, resolvendo problemas de performance sem mudar os conceitos que você já aprendeu: método, path, status, headers e corpo continuam existindo do mesmo jeito.\n\n## HTTP/1.1: simples e limitado"
                    },
                    {
                        "type": "text",
                        "value": "O HTTP/1.1 é um protocolo textual: uma requisição literalmente é uma sequência de caracteres, como nos exemplos que você já viu. Ele introduziu as conexões persistentes (`keep-alive`), permitindo reaproveitar a mesma conexão TCP para várias requisições em sequência, em vez de abrir uma conexão nova para cada uma.\n\nO problema é que, numa mesma conexão, as requisições são processadas basicamente uma de cada vez, em fila: se uma demorar, as próximas ficam esperando atrás dela. Isso é chamado de **head-of-line blocking** (bloqueio de fila) na camada de aplicação. Na prática, navegadores contornam isso abrindo várias conexões TCP em paralelo com o mesmo servidor, o que também tem custo."
                    },
                    {
                        "type": "code",
                        "value": ":method: GET\n:scheme: https\n:authority: api.loja.com\n:path: /produtos/42\naccept: application/json\nuser-agent: Mozilla/5.0"
                    },
                    {
                        "type": "text",
                        "value": "## HTTP/2: binário, comprimido e multiplexado\n\nO HTTP/2 resolve o problema sem quebrar a semântica: os mesmos métodos, status e headers continuam existindo, mas a forma de transportá-los muda. Em vez de texto puro, o HTTP/2 usa um formato **binário**, dividido em frames, mais compacto e mais rápido de processar. O bloco de código acima não é o formato literal de bytes (que é binário), mas mostra a ideia: o HTTP/2 não tem mais uma linha de requisição separada dos headers. Método, esquema, autoridade (host) e caminho viram pseudo-headers, que começam com `:` e viajam junto com os demais headers.\n\nA mudança mais importante é a **multiplexação**: numa única conexão TCP, várias requisições e respostas podem viajar intercaladas, ao mesmo tempo, sem que uma precise esperar a outra terminar. O HTTP/2 também comprime headers repetidos entre requisições (uma técnica chamada HPACK), economizando banda, já que headers como `User-Agent` e `Cookie` tendem a se repetir em quase toda requisição de um mesmo cliente."
                    },
                    {
                        "type": "text",
                        "value": "## HTTP/3: adeus TCP, olá QUIC\n\nO HTTP/2 melhorou muito a multiplexação na camada de aplicação, mas ainda depende do TCP, que garante entrega ordenada dos pacotes. Se um único pacote se perde, o TCP trava a entrega de tudo que vem depois dele até esse pacote ser reenviado, mesmo que os dados perdidos pertençam a uma única requisição entre várias. Isso é um head-of-line blocking na camada de transporte, e o HTTP/2 sozinho não resolve.\n\nO HTTP/3 ataca esse problema trocando o transporte: em vez de rodar sobre TCP, ele roda sobre o **QUIC**, um protocolo construído sobre UDP. O QUIC multiplexa de verdade também no transporte, então a perda de um pacote de uma requisição não trava as outras. Como bônus, o QUIC já embute criptografia TLS desde o início da conexão, o que tende a tornar a conexão inicial mais rápida."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Versão\",\"Formato\",\"Conexão\",\"Principal ganho\"],[\"HTTP/1.1\",\"Texto puro\",\"TCP, uma requisição por vez por conexão (com keep-alive)\",\"Simplicidade, fácil de ler e depurar\"],[\"HTTP/2\",\"Binário\",\"TCP, multiplexado na camada de aplicação\",\"Várias requisições em paralelo numa só conexão\"],[\"HTTP/3\",\"Binário\",\"QUIC sobre UDP, multiplexado no transporte\",\"Sem head-of-line blocking mesmo com perda de pacote\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Não é preciso escolher entre as versões na hora de programar um back-end comum: navegador e servidor negociam automaticamente qual usar. O que muda entre elas é a eficiência do transporte, não os conceitos de método, status, headers e corpo que você já domina."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal diferença de formato entre o HTTP/1.1 e o HTTP/2?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "HTTP/1.1 é texto puro e o HTTP/2 usa um formato binário",
                                "isCorrect": true
                            },
                            {
                                "text": "HTTP/1.1 não tem headers e o HTTP/2 tem",
                                "isCorrect": false
                            },
                            {
                                "text": "HTTP/1.1 só funciona com HTTPS e o HTTP/2 só com HTTP",
                                "isCorrect": false
                            },
                            {
                                "text": "HTTP/1.1 não permite corpo na resposta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre qual protocolo de transporte o HTTP/3 é construído, no lugar do TCP tradicional?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "QUIC, que roda sobre UDP",
                                "isCorrect": true
                            },
                            {
                                "text": "FTP",
                                "isCorrect": false
                            },
                            {
                                "text": "SMTP",
                                "isCorrect": false
                            },
                            {
                                "text": "TLS puro, sem nenhum protocolo de transporte abaixo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um site abre uma única conexão HTTP/2 com o servidor e, ainda assim, consegue carregar dezenas de arquivos (imagens, CSS, JS) praticamente ao mesmo tempo, sem que um precise esperar o outro terminar. Qual recurso do HTTP/2 explica isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Multiplexação: várias requisições e respostas trafegam intercaladas na mesma conexão",
                                "isCorrect": true
                            },
                            {
                                "text": "O uso de múltiplas conexões TCP abertas em paralelo com o servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "A compressão do corpo das respostas com gzip",
                                "isCorrect": false
                            },
                            {
                                "text": "O uso do método HEAD em todas as requisições",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma rede instável, com perda ocasional de pacotes, uma aplicação usando HTTP/3 tende a sofrer menos impacto ao carregar múltiplos recursos simultâneos do que a mesma aplicação em HTTP/2. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o QUIC, base do HTTP/3, multiplexa também na camada de transporte, então a perda de um pacote afeta só a requisição dele, não as outras",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o HTTP/3 elimina o uso de headers, reduzindo o tamanho dos pacotes",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o HTTP/3 não permite envio de corpo, só de headers",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o HTTP/3 abre uma conexão TCP separada para cada requisição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de back-end quer saber se precisa mudar o código da aplicação (rotas, handlers, validação de headers) para \"suportar\" HTTP/2 além do HTTP/1.1. Do ponto de vista da anatomia de requisição e resposta que a aplicação manipula, qual é a resposta mais precisa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Normalmente não: método, path, status, headers e corpo continuam com o mesmo significado; a negociação da versão do protocolo é resolvida nas camadas de conexão e servidor, não no código de rotas da aplicação",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, cada rota precisa ser reescrita porque o HTTP/2 usa um conjunto de métodos diferente do HTTP/1.1",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque no HTTP/2 os códigos de status têm significados diferentes dos usados no HTTP/1.1",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é possível ter as duas versões disponíveis no mesmo servidor ao mesmo tempo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "HTTP vs HTTPS: por que o TLS importa",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Tudo que você viu até agora (linha de requisição, headers, corpo) funciona igual tanto em HTTP quanto em HTTPS. A diferença entre os dois não está na estrutura da mensagem, está em **como** essa mensagem viaja pela rede.\n\n## HTTP puro: tudo em texto aberto\n\nQuando um cliente fala HTTP puro com um servidor, os bytes da requisição e da resposta trafegam **sem nenhuma proteção**. Qualquer equipamento no meio do caminho, seja o roteador do Wi-Fi público, o provedor de internet ou alguém rodando uma ferramenta de captura de pacotes na mesma rede, consegue ler o conteúdo inteiro: a URL, os headers, o corpo, incluindo senhas e tokens enviados em texto puro."
                    },
                    {
                        "type": "code",
                        "value": "POST /login HTTP/1.1\nHost: api.loja.com\nContent-Type: application/json\nContent-Length: 54\n\n{\"email\": \"ana@exemplo.com\", \"senha\": \"MinhaSenh@123\"}"
                    },
                    {
                        "type": "text",
                        "value": "Em uma conexão HTTP pura, é exatamente assim, sem nenhuma cifra, que esses bytes trafegam pela rede. Qualquer ferramenta de captura de pacotes mostra a senha `MinhaSenh@123` em texto legível. É esse risco concreto que o HTTPS existe para eliminar.\n\n## HTTPS = HTTP + TLS\n\nHTTPS não é um protocolo diferente do HTTP na semântica: é o mesmo HTTP, com os mesmos métodos, status e headers, rodando **por dentro** de uma camada de criptografia chamada TLS (Transport Layer Security). O S de HTTPS é justamente isso: Secure.\n\nO TLS entra em ação antes de qualquer byte de HTTP ser trocado. Cliente e servidor fazem um **handshake**: negociam quais algoritmos de criptografia vão usar, o servidor apresenta um certificado digital que comprova sua identidade, e os dois lados combinam uma chave de sessão usada para cifrar tudo que trafegar dali em diante. Por trás disso, o TLS mistura duas técnicas: criptografia assimétrica (chave pública e privada) para negociar essa chave com segurança, e criptografia simétrica, mais rápida, para cifrar o tráfego real usando a chave combinada."
                    },
                    {
                        "type": "text",
                        "value": "## O que o TLS garante, na prática\n\nTrês garantias importam mais para quem desenvolve back-end:\n\n- **Confidencialidade**: ninguém no meio do caminho consegue ler o conteúdo da requisição ou da resposta, só um emaranhado de bytes cifrados.\n- **Integridade**: se alguém tentar alterar os dados em trânsito, a alteração é detectada e a conexão é invalidada.\n- **Autenticidade**: o certificado apresentado pelo servidor, emitido por uma autoridade certificadora confiável, comprova que o cliente está realmente falando com `api.loja.com`, e não com um servidor se passando por ele."
                    },
                    {
                        "type": "code",
                        "value": "curl -v https://api.loja.com/produtos/42\n\n* Connected to api.loja.com (203.0.113.10) port 443\n* TLS handshake, Client hello (1)\n* TLS handshake, Server hello (2)\n* SSL connection using TLSv1.3\n* Server certificate: api.loja.com\n> GET /produtos/42 HTTP/1.1\n> Host: api.loja.com\n> Accept: */*\n>\n< HTTP/1.1 200 OK\n< Content-Type: application/json"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"HTTP\",\"HTTPS\"],[\"Porta padrão\",\"80\",\"443\"],[\"Dados na rede\",\"Texto aberto, legível por qualquer um no caminho\",\"Cifrados pelo TLS\"],[\"Certificado\",\"Não usa\",\"Exige certificado emitido por uma autoridade confiável\"],[\"Indicador no navegador\",\"Marcado como \\\"não seguro\\\", principalmente em formulários\",\"Tratado como conexão segura\"],[\"Estrutura da requisição/resposta\",\"Igual\",\"Igual (mesmos métodos, status e headers)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "HTTPS não muda o que você aprendeu sobre HTTP até aqui, muda o transporte por baixo dele. Hoje, HTTPS é o padrão esperado até para sites simples: sem TLS, qualquer dado sensível trafega exposto, e a maioria dos navegadores já marca conexões HTTP puras como não seguras."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o TLS acrescenta a uma conexão HTTP para transformá-la em HTTPS?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma camada de criptografia que protege os dados em trânsito",
                                "isCorrect": true
                            },
                            {
                                "text": "Um novo conjunto de métodos HTTP, como SGET e SPOST",
                                "isCorrect": false
                            },
                            {
                                "text": "A obrigação de usar apenas o método POST",
                                "isCorrect": false
                            },
                            {
                                "text": "A remoção dos headers da requisição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a porta padrão usada por conexões HTTPS?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "443",
                                "isCorrect": true
                            },
                            {
                                "text": "80",
                                "isCorrect": false
                            },
                            {
                                "text": "8080",
                                "isCorrect": false
                            },
                            {
                                "text": "21",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação envia login e senha via POST em uma conexão HTTP pura (sem TLS), em uma rede Wi-Fi pública. Qual é o risco concreto dessa situação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Qualquer pessoa capturando o tráfego dessa rede pode ler a senha em texto aberto, já que não há criptografia",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum, porque o método POST já criptografa o corpo da requisição automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum, porque o header Content-Type protege dados sensíveis",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco só existe se a senha tiver menos de 8 caracteres",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante o handshake TLS, o servidor apresenta um certificado digital ao cliente. Qual é o principal propósito desse certificado nesse momento da conexão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Comprovar a identidade do servidor, garantindo ao cliente que ele está falando com o domínio esperado e não com um impostor",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir qual método HTTP será usado na requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir a necessidade do header Host",
                                "isCorrect": false
                            },
                            {
                                "text": "Compactar o corpo da resposta para economizar banda",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide manter uma rota antiga de login funcionando só em HTTP puro, sem TLS, \"por compatibilidade\", enquanto o resto da API roda em HTTPS. Considerando o que você aprendeu sobre TLS e sobre o corpo de uma requisição de login, qual é o problema central dessa decisão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As credenciais enviadas no corpo dessa rota trafegariam sem cifra, expostas a qualquer um capturando a rede, mesmo que o restante da API esteja protegido",
                                "isCorrect": true
                            },
                            {
                                "text": "HTTP puro não permite o método POST, então a rota de login simplesmente pararia de funcionar",
                                "isCorrect": false
                            },
                            {
                                "text": "Misturar HTTP e HTTPS no mesmo domínio é tecnicamente impossível, então a API inteira deixaria de responder",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é só estético, já que o navegador oculta o aviso de \"não seguro\" em rotas de login",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Métodos HTTP",
        "aulas": [
            {
                "titulo": "GET: o método para ler dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# GET: o método para ler dados\n\nToda requisição HTTP carrega um método (também chamado de verbo) que diz ao servidor qual ação o cliente quer realizar sobre um recurso. Você já viu isso no Módulo 2, quando estudamos a linha de requisição: `GET /produtos/42 HTTP/1.1`. Ali, `GET` é o método.\n\nExistem vários métodos HTTP, cada um com um significado específico. Usar o método certo não é só formalidade: navegadores, proxies, caches e ferramentas de monitoramento tomam decisões automáticas com base nele. Errar o método pode causar bugs sutis, como dados sendo cacheados quando não deveriam ou, pior, sendo alterados por engano.\n\nVamos começar pelo mais comum de todos: o GET."
                    },
                    {
                        "type": "text",
                        "value": "## Para que serve o GET\n\nO GET pede um recurso ao servidor. É o método usado toda vez que você digita uma URL no navegador, clica em um link ou carrega uma imagem numa página. Abra as ferramentas de desenvolvedor do navegador (aba Network) enquanto navega em qualquer site: a grande maioria das requisições que aparecem ali é GET.\n\nDuas regras definem o GET:\n\n- GET **nunca** deve alterar dados no servidor.\n- GET **não tem corpo** (body) na requisição. Toda a informação necessária para o servidor entender o pedido vai na URL (caminho e query string) ou nos headers.\n\nPor isso, uma requisição GET nunca precisa dos headers `Content-Type` ou `Content-Length`: não existe corpo para eles descreverem. Se você precisa mandar informação junto de um GET, ela vai na própria URL, como parâmetro."
                    },
                    {
                        "type": "code",
                        "value": "GET /api/produtos?categoria=eletronicos&preco_max=500 HTTP/1.1\nHost: loja.exemplo.com\nAccept: application/json\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...\n\nHTTP/1.1 200 OK\nContent-Type: application/json\nCache-Control: max-age=60\n\n[\n  { \"id\": 42, \"nome\": \"Fone bluetooth\", \"preco\": 129.90 },\n  { \"id\": 58, \"nome\": \"Mouse sem fio\", \"preco\": 79.90 }\n]"
                    },
                    {
                        "type": "text",
                        "value": "## Parâmetros de um GET: path x query string\n\nExistem duas formas comuns de mandar dados num GET:\n\n- **Parâmetro de caminho (path param)**: identifica um recurso específico. Exemplo: `/produtos/42` busca o produto de id 42.\n- **Parâmetro de query (query string)**: filtra, ordena ou pagina uma coleção. Exemplo: `/produtos?categoria=eletronicos&pagina=2`.\n\nUma forma prática de pensar: se o dado identifica qual recurso você quer, ele vai no caminho. Se o dado ajusta como a busca deve ser feita, ele vai na query string."
                    },
                    {
                        "type": "code",
                        "value": "# Busca o produto de id 42\ncurl https://loja.exemplo.com/api/produtos/42\n\n# Busca produtos da categoria eletronicos, ordenados por preco\ncurl \"https://loja.exemplo.com/api/produtos?categoria=eletronicos&ordenar=preco\"\n\n# Envia um header customizado num GET\ncurl -H \"Authorization: Bearer eyJhbGciOiJIUzI1NiIs...\" https://loja.exemplo.com/api/perfil"
                    },
                    {
                        "type": "text",
                        "value": "## Por que o GET não deve alterar dados\n\nComo GET é considerado um método seguro (você vai estudar esse termo com precisão na Aula 5), o restante da web conta com essa promessa. Um navegador pode pré-carregar links de uma página. Um crawler de busca segue todos os links que encontra, sem nenhuma intenção humana por trás de cada clique. Um proxy pode guardar a resposta em cache e servir a mesma resposta várias vezes sem consultar o servidor de novo.\n\nSe uma API expõe algo como `GET /usuarios/42/deletar`, qualquer um desses agentes automáticos pode disparar a exclusão sem que um humano tenha decidido apagar nada, só por estar seguindo um link. É um dos erros mais conhecidos no design de APIs, e é justamente por isso que a especificação do HTTP é explícita: GET deve ser seguro, e garantir isso é responsabilidade do back-end, não de quem consome a API."
                    },
                    {
                        "type": "quote",
                        "value": "GET busca, nunca modifica. Não tem corpo, manda dados pela URL e pode ser cacheado, repetido e pré-carregado sem medo, porque a promessa do método é não ter efeito colateral no servidor."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal característica de uma requisição GET em relação ao corpo (body)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "GET sempre precisa de um corpo em JSON",
                                "isCorrect": false
                            },
                            {
                                "text": "GET nunca tem corpo, os dados vão na URL",
                                "isCorrect": true
                            },
                            {
                                "text": "GET usa corpo apenas quando a URL é muito longa",
                                "isCorrect": false
                            },
                            {
                                "text": "GET envia o corpo como texto plano, nunca como JSON",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API precisa permitir que o cliente filtre uma lista de pedidos por status e por data de criação usando uma requisição GET. Onde essa informação deve ir?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "No corpo da requisição, como JSON",
                                "isCorrect": false
                            },
                            {
                                "text": "Em um header customizado obrigatório",
                                "isCorrect": false
                            },
                            {
                                "text": "Na query string da URL",
                                "isCorrect": true
                            },
                            {
                                "text": "No path, criando um novo segmento de URL para cada filtro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema antigo expõe o endpoint GET /relatorios/42/exportar, que gera um PDF pesado e grava um log de auditoria toda vez que é chamado. Um crawler de busca indexou esse link e passou a acessá-lo repetidamente, gerando custo de processamento desnecessário. Qual é o problema de design nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "GET está sendo usado para uma ação com efeito colateral, o que viola a expectativa de que GET é seguro",
                                "isCorrect": true
                            },
                            {
                                "text": "O crawler está com bug e não deveria seguir links públicos",
                                "isCorrect": false
                            },
                            {
                                "text": "O endpoint deveria estar hospedado em outro domínio",
                                "isCorrect": false
                            },
                            {
                                "text": "O PDF deveria ser cacheado no navegador do crawler",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das alternativas descreve corretamente a diferença entre um parâmetro de caminho (path) e um parâmetro de query string num GET?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Parâmetro de caminho é sempre opcional; query string é sempre obrigatória",
                                "isCorrect": false
                            },
                            {
                                "text": "Query string identifica o recurso; caminho serve só para filtros",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há diferença prática entre os dois",
                                "isCorrect": false
                            },
                            {
                                "text": "Parâmetro de caminho identifica um recurso específico; query string ajusta como a busca é feita",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma API pública aceita GET /busca?q=<termo> mas alguns clientes passam a mandar um termo de busca extremamente longo, com dezenas de filtros adicionais na query string, e recebem erro 414 URI Too Long. Qual é a causa mais provável e a solução mais alinhada à semântica HTTP?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O servidor está com bug, GET nunca deveria ter limite de tamanho de URL",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é sempre do DNS, que não resolve URLs longas",
                                "isCorrect": false
                            },
                            {
                                "text": "A URL, incluindo a query string, ultrapassou o limite prático aceito pelo servidor ou por proxies no caminho; para payloads grandes de busca, um método com corpo, como POST, é mais adequado",
                                "isCorrect": true
                            },
                            {
                                "text": "O cliente deveria trocar o header Accept para text/plain",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "POST: o método para criar recursos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## POST: o método para criar recursos\n\nQuando você precisa criar algo novo (um usuário, um pedido, um comentário), o método adequado é o POST. Diferente do GET, o POST **tem corpo**: os dados do novo recurso vão no corpo da requisição, geralmente como JSON."
                    },
                    {
                        "type": "code",
                        "value": "POST /api/usuarios HTTP/1.1\nHost: api.exemplo.com\nContent-Type: application/json\nContent-Length: 55\n\n{\"nome\": \"Marina Silva\", \"email\": \"marina@exemplo.com\"}\n\nHTTP/1.1 201 Created\nContent-Type: application/json\nLocation: /api/usuarios/107\n\n{\n  \"id\": 107,\n  \"nome\": \"Marina Silva\",\n  \"email\": \"marina@exemplo.com\"\n}"
                    },
                    {
                        "type": "text",
                        "value": "## O que um POST bem feito costuma fazer\n\nRepare na resposta do exemplo acima. Um POST que cria um recurso normalmente:\n\n- Responde com status **201 Created** (não 200), indicando que algo novo passou a existir.\n- Inclui o header **Location**, apontando para a URL do recurso recém-criado.\n- Devolve o recurso criado no corpo, já com o id gerado pelo servidor.\n\nIsso é diferente do PUT, que você vai estudar na próxima aula: no POST, é o **servidor** quem decide a URL e o id do novo recurso. O cliente não escolhe `/api/usuarios/107`, ele manda os dados para a coleção `/api/usuarios` e o servidor responde onde o recurso ficou."
                    },
                    {
                        "type": "code",
                        "value": "curl -X POST https://api.exemplo.com/api/usuarios \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"nome\": \"Marina Silva\", \"email\": \"marina@exemplo.com\"}'\n\n# A resposta inclui o header Location com a URL do novo recurso:\n# Location: /api/usuarios/107"
                    },
                    {
                        "type": "text",
                        "value": "## POST não é só para criar\n\nPOST também é o método correto para ações que não se encaixam perfeitamente num CRUD simples: fazer login (`POST /login`), processar um pagamento (`POST /pagamentos`), disparar o envio de um e-mail (`POST /notificacoes/enviar`) ou executar uma busca complexa demais para caber numa query string (`POST /busca`, com um corpo JSON cheio de filtros).\n\nO ponto em comum é que essas ações têm efeito colateral no servidor e, em geral, cada chamada tende a gerar um resultado novo, sem garantia de que repetir a chamada produza o mesmo efeito. É isso que torna o POST diferente do PUT em termos de idempotência, assunto que fechamos na Aula 5.\n\nNa prática do dia a dia, montar esses corpos JSON à mão no curl fica cansativo rápido. Ferramentas como Postman e Insomnia existem exatamente para isso: preencher os campos numa interface visual e deixar a ferramenta montar a requisição."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"GET\", \"POST\"], [\"Tem corpo\", \"Não\", \"Sim\"], [\"Uso típico\", \"Ler um recurso\", \"Criar um recurso ou disparar uma ação\"], [\"Status de sucesso comum\", \"200 OK\", \"201 Created\"], [\"Idempotente\", \"Sim\", \"Não, em geral\"], [\"Pode ser cacheado por padrão\", \"Sim\", \"Não\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "POST cria e age. Tem corpo, o servidor decide a URL do recurso novo e a resposta de sucesso típica é 201 Created com um header Location apontando para onde o recurso ficou."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual status HTTP é normalmente retornado por um POST que cria um recurso com sucesso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "204 No Content",
                                "isCorrect": false
                            },
                            {
                                "text": "200 OK",
                                "isCorrect": false
                            },
                            {
                                "text": "302 Found",
                                "isCorrect": false
                            },
                            {
                                "text": "201 Created",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma API precisa receber os dados de um novo pedido: itens, endereço de entrega e forma de pagamento. Qual método HTTP é o mais adequado para essa operação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "GET, com os dados na query string",
                                "isCorrect": false
                            },
                            {
                                "text": "POST, com os dados no corpo da requisição",
                                "isCorrect": true
                            },
                            {
                                "text": "HEAD, seguido de um GET",
                                "isCorrect": false
                            },
                            {
                                "text": "OPTIONS, para descobrir como criar o pedido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo de POST /api/usuarios que cria um novo usuário, o que o header Location da resposta indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "De onde partiu a requisição original",
                                "isCorrect": false
                            },
                            {
                                "text": "O endereço de e-mail que foi cadastrado",
                                "isCorrect": false
                            },
                            {
                                "text": "A URL do recurso recém-criado",
                                "isCorrect": true
                            },
                            {
                                "text": "Para onde o navegador deve redirecionar automaticamente, sempre",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor implementa POST /api/pedidos e, para simplificar o código, deixa o cliente escolher o id do novo pedido enviando um campo id no corpo. Por que essa abordagem foge do uso convencional do POST?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Convencionalmente, quem decide a URL e o identificador do recurso criado é o servidor, não o cliente, no POST",
                                "isCorrect": true
                            },
                            {
                                "text": "POST não aceita nenhum campo chamado id no corpo, por restrição do protocolo",
                                "isCorrect": false
                            },
                            {
                                "text": "O id deveria obrigatoriamente ir na query string, nunca no corpo",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há problema nenhum, essa é exatamente a forma como o POST deve funcionar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente chama POST /api/pagamentos duas vezes seguidas por causa de uma falha de rede que fez a primeira resposta não chegar a tempo. O resultado foi a criação de dois pagamentos idênticos e uma cobrança em duplicidade. O que esse cenário ilustra sobre o método POST?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "POST é seguro (safe), então esse tipo de duplicidade não deveria ser possível",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é exclusivamente de rede e não tem nenhuma relação com o método HTTP escolhido",
                                "isCorrect": false
                            },
                            {
                                "text": "POST deveria ter sido trocado por GET para evitar a duplicidade",
                                "isCorrect": false
                            },
                            {
                                "text": "POST não é idempotente por padrão: repetir a chamada pode criar um novo recurso a cada vez, por isso operações sensíveis costumam usar estratégias como chave de idempotência",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "PUT e PATCH: atualização total e parcial",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Atualizar um recurso: tudo ou só uma parte\n\nDepois de criar um recurso com POST, o próximo passo natural é atualizá-lo. Só que \"atualizar\" pode significar duas coisas bem diferentes: substituir o recurso inteiro por uma nova versão, ou alterar só alguns campos, mantendo o resto como está. O HTTP tem um método para cada caso: **PUT** para substituição completa e **PATCH** para alteração parcial."
                    },
                    {
                        "type": "text",
                        "value": "## PUT: substitui o recurso inteiro\n\nPUT diz ao servidor: aqui está a representação completa e definitiva desse recurso, guarde exatamente isso no lugar do que existia antes. O cliente manda **todos os campos**, mesmo os que não mudaram. Um campo que falta na requisição costuma ser entendido como removido ou zerado, dependendo da implementação.\n\nDiferente do POST, no PUT é o **cliente** que informa a URL final do recurso, geralmente já com o id, porque PUT também pode ser usado para criar um recurso num id específico, se ele ainda não existir."
                    },
                    {
                        "type": "code",
                        "value": "PUT /api/usuarios/107 HTTP/1.1\nHost: api.exemplo.com\nContent-Type: application/json\n\n{\n  \"nome\": \"Marina Silva Costa\",\n  \"email\": \"marina@exemplo.com\",\n  \"ativo\": true\n}\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  \"id\": 107,\n  \"nome\": \"Marina Silva Costa\",\n  \"email\": \"marina@exemplo.com\",\n  \"ativo\": true\n}"
                    },
                    {
                        "type": "text",
                        "value": "## PATCH: altera só o que precisa mudar\n\nPATCH manda apenas os campos que devem mudar. O servidor aplica essa alteração parcial sobre o recurso existente, sem tocar no resto. Repare no exemplo a seguir: só o campo `ativo` é enviado, e só ele muda na resposta. `nome` e `email` continuam exatamente como estavam, sem precisar ser reenviados."
                    },
                    {
                        "type": "code",
                        "value": "PATCH /api/usuarios/107 HTTP/1.1\nHost: api.exemplo.com\nContent-Type: application/json\n\n{\n  \"ativo\": false\n}\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  \"id\": 107,\n  \"nome\": \"Marina Silva Costa\",\n  \"email\": \"marina@exemplo.com\",\n  \"ativo\": false\n}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"PUT\", \"PATCH\"], [\"O que o cliente envia\", \"O recurso inteiro\", \"Só os campos que mudam\"], [\"Campo omitido no corpo\", \"É removido ou zerado\", \"Continua com o valor atual\"], [\"Pode criar recurso novo\", \"Sim, se o id ainda não existir\", \"Normalmente não\"], [\"Idempotente\", \"Sim\", \"Depende da implementação, mas geralmente tratado como idempotente\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "PUT substitui o recurso inteiro, por isso manda todos os campos. PATCH altera só uma parte, por isso manda apenas o que precisa mudar. Confundir os dois é um jeito garantido de apagar dados por acidente."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a diferença essencial entre PUT e PATCH?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "PUT nunca tem corpo; PATCH sempre tem",
                                "isCorrect": false
                            },
                            {
                                "text": "PUT é usado para leitura; PATCH é usado para criação",
                                "isCorrect": false
                            },
                            {
                                "text": "PUT substitui o recurso inteiro; PATCH altera só uma parte dele",
                                "isCorrect": true
                            },
                            {
                                "text": "Não existe diferença real, os dois são sinônimos no HTTP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aplicativo de tarefas precisa marcar apenas o campo concluida como true, sem alterar título, descrição ou prazo da tarefa. Qual método é o mais adequado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "PUT, enviando todos os campos da tarefa",
                                "isCorrect": false
                            },
                            {
                                "text": "PATCH, enviando somente o campo concluida",
                                "isCorrect": true
                            },
                            {
                                "text": "POST, criando uma nova tarefa",
                                "isCorrect": false
                            },
                            {
                                "text": "DELETE, seguido de um POST",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor usa PUT /api/usuarios/107 enviando só o campo ativo no corpo, sem os demais campos do usuário. O que provavelmente acontece com os campos nome e email que não foram enviados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como PUT substitui o recurso inteiro, esses campos tendem a ser removidos ou zerados, já que não vieram na requisição",
                                "isCorrect": true
                            },
                            {
                                "text": "Eles permanecem inalterados automaticamente, como aconteceria num PATCH",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor busca os valores antigos no cache e os reaplica sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor sempre rejeita a requisição com erro 400 nesse caso",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além de atualizar um recurso existente, para que outra finalidade o PUT pode ser usado, segundo sua semântica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Para deletar o recurso quando o corpo vem vazio",
                                "isCorrect": false
                            },
                            {
                                "text": "Para listar todos os recursos de uma coleção",
                                "isCorrect": false
                            },
                            {
                                "text": "Para verificar se um recurso existe sem retornar corpo",
                                "isCorrect": false
                            },
                            {
                                "text": "Para criar um recurso num id específico definido pelo cliente, caso ele ainda não exista",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma API de e-commerce implementa PATCH /api/produtos/42, mas, internamente, o handler sempre sobrescreve o objeto inteiro com valores default para os campos ausentes, em vez de mesclar só o que foi enviado. Qual é o problema dessa implementação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não há problema, PATCH e PUT podem ser implementados de forma idêntica sem consequência",
                                "isCorrect": false
                            },
                            {
                                "text": "O handler está, na prática, se comportando como um PUT, o que quebra a expectativa semântica de atualização parcial do PATCH e pode apagar dados que o cliente não pretendia alterar",
                                "isCorrect": true
                            },
                            {
                                "text": "O problema está em usar JSON no corpo do PATCH, o formato correto seria outro",
                                "isCorrect": false
                            },
                            {
                                "text": "PATCH nunca deveria retornar o recurso atualizado no corpo da resposta",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "DELETE, HEAD e OPTIONS: remover e consultar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Remover recursos e consultar metadados\n\nAlém de ler, criar e atualizar, um back-end precisa saber remover recursos e, às vezes, responder perguntas sobre um recurso sem entregar o conteúdo inteiro. É para isso que existem DELETE, HEAD e OPTIONS."
                    },
                    {
                        "type": "text",
                        "value": "## DELETE: remove um recurso\n\nDELETE pede para o servidor remover o recurso identificado na URL. Normalmente não tem corpo (a especificação HTTP até permite corpo num DELETE, mas na prática quase nenhuma API usa isso). A resposta de sucesso mais comum é **204 No Content**: a remoção deu certo e não há nada a devolver, já que o recurso não existe mais."
                    },
                    {
                        "type": "code",
                        "value": "DELETE /api/usuarios/107 HTTP/1.1\nHost: api.exemplo.com\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...\n\nHTTP/1.1 204 No Content"
                    },
                    {
                        "type": "text",
                        "value": "## HEAD e OPTIONS: métodos de consulta, sem executar ação\n\nHEAD funciona como um GET, mas a resposta **nunca tem corpo**, só os headers que um GET para o mesmo recurso teria. Serve para checar se um recurso existe, seu tamanho (`Content-Length`) ou a data da última modificação (`Last-Modified`) sem baixar o conteúdo inteiro. Ferramentas de monitoramento usam HEAD para verificar se um servidor está no ar sem gastar banda desnecessária.\n\nOPTIONS pergunta ao servidor quais métodos são permitidos para um recurso, sem executar nenhuma ação. A resposta traz o header **Allow**, listando os métodos aceitos, por exemplo `Allow: GET, POST, PUT, DELETE`. É o método que o navegador dispara automaticamente na chamada de \"preflight\" do CORS, quando precisa confirmar se um servidor de outra origem aceita a requisição antes de mandar a de verdade (você vai estudar CORS a fundo no Módulo 5)."
                    },
                    {
                        "type": "code",
                        "value": "HEAD /arquivos/relatorio-anual.pdf HTTP/1.1\nHost: arquivos.exemplo.com\n\nHTTP/1.1 200 OK\nContent-Type: application/pdf\nContent-Length: 4832910\nLast-Modified: Tue, 03 Feb 2026 14:20:00 GMT\n\n# Nenhum byte do PDF foi transferido, só os headers acima.\n# O cliente já sabe o tamanho do arquivo antes de decidir baixar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método\", \"Corpo na resposta\", \"Uso típico\", \"Status comum\"], [\"DELETE\", \"Normalmente não\", \"Remover um recurso\", \"204 No Content\"], [\"HEAD\", \"Nunca\", \"Checar existência ou metadados sem baixar o conteúdo\", \"200 OK\"], [\"OPTIONS\", \"Não, informação vai no header Allow\", \"Descobrir métodos permitidos, preflight de CORS\", \"204 No Content ou 200 OK\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "DELETE remove, HEAD espia os headers sem baixar o corpo, OPTIONS pergunta o que é permitido. Nenhum dos três serve para alterar o conteúdo de um recurso além do que o próprio nome descreve."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual status é comumente retornado por um DELETE bem-sucedido, quando não há nada a devolver no corpo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "204 No Content",
                                "isCorrect": true
                            },
                            {
                                "text": "200 OK",
                                "isCorrect": false
                            },
                            {
                                "text": "201 Created",
                                "isCorrect": false
                            },
                            {
                                "text": "404 Not Found",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma ferramenta de monitoramento precisa checar, a cada minuto, se um servidor está no ar e qual o tamanho de um arquivo, sem baixar o arquivo inteiro. Qual método é o mais adequado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "GET",
                                "isCorrect": false
                            },
                            {
                                "text": "OPTIONS",
                                "isCorrect": false
                            },
                            {
                                "text": "HEAD",
                                "isCorrect": true
                            },
                            {
                                "text": "DELETE",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal diferença entre uma requisição HEAD e uma requisição GET para o mesmo recurso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "HEAD usa um caminho de URL diferente do GET",
                                "isCorrect": false
                            },
                            {
                                "text": "HEAD só funciona em recursos protegidos por autenticação",
                                "isCorrect": false
                            },
                            {
                                "text": "HEAD sempre retorna 204, independente do recurso pedido",
                                "isCorrect": false
                            },
                            {
                                "text": "HEAD retorna os mesmos headers que o GET retornaria, mas nunca com corpo na resposta",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O navegador de um usuário faz, via JavaScript, uma chamada para uma API de outra origem (outro domínio) usando o método PUT. Antes de enviar essa requisição PUT, o navegador dispara automaticamente uma requisição com outro método. Qual é esse método e o que ele verifica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "HEAD, para checar o tamanho do corpo que será enviado",
                                "isCorrect": false
                            },
                            {
                                "text": "OPTIONS, para checar com o servidor se aquela origem e aquele método são permitidos (preflight de CORS)",
                                "isCorrect": true
                            },
                            {
                                "text": "GET, para carregar uma página de erro caso a permissão falhe",
                                "isCorrect": false
                            },
                            {
                                "text": "DELETE, para limpar o cache do navegador antes da requisição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API remove um pedido com DELETE /api/pedidos/900 e retorna 204. Minutos depois, por um retry automático do cliente após uma instabilidade de rede, a mesma requisição DELETE /api/pedidos/900 é enviada de novo. O pedido já não existe mais nesse momento. Do ponto de vista da idempotência do DELETE, qual é o comportamento mais alinhado à semântica HTTP para essa segunda chamada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O servidor deveria recriar o pedido antes de deletar de novo, para manter coerência",
                                "isCorrect": false
                            },
                            {
                                "text": "DELETE não é idempotente, então esse comportamento indica um bug grave no cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "A segunda chamada deve obrigatoriamente retornar 204 de novo, senão o método deixou de ser idempotente",
                                "isCorrect": false
                            },
                            {
                                "text": "A segunda chamada pode retornar 404, mas o estado final do servidor é o mesmo de antes: o pedido não existe. Isso é compatível com DELETE ser idempotente, mesmo que o código de status individual mude",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Métodos seguros, idempotentes e erros comuns de semântica",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Seguro e idempotente: duas propriedades que mudam tudo\n\nAo longo desse módulo, os termos \"seguro\" (safe) e \"idempotente\" apareceram várias vezes. Chegou a hora de definir os dois com precisão, porque eles não são só teoria: caches, proxies, navegadores e bibliotecas HTTP tomam decisões automáticas, como repetir uma requisição ou guardar uma resposta em cache, com base nessas propriedades."
                    },
                    {
                        "type": "text",
                        "value": "## O que é um método seguro (safe)\n\nUm método é **seguro** quando ele não altera o estado do servidor. Chamar um método seguro uma vez ou cem vezes deve ter exatamente o mesmo efeito sobre os dados: nenhum. GET, HEAD e OPTIONS são seguros. Isso não significa que a chamada não tenha custo (pode gastar processamento, gerar um log de acesso), significa que ela não muda o que está armazenado como resultado direto da requisição."
                    },
                    {
                        "type": "text",
                        "value": "## O que é um método idempotente\n\nUm método é **idempotente** quando fazer a mesma chamada várias vezes produz o mesmo resultado final que fazer uma única vez. Repetir não piora nem multiplica o efeito. GET, HEAD, OPTIONS, PUT e DELETE são idempotentes. POST, em geral, não é: cada chamada tende a criar um novo recurso. PATCH fica no meio do caminho: depende de como a API implementa a alteração parcial, mas costuma ser tratado como idempotente quando o campo alterado recebe sempre o mesmo valor final.\n\nRepare que todo método seguro também é idempotente (não alterar nada, uma vez ou cem vezes, dá sempre o mesmo resultado). Mas nem todo método idempotente é seguro: PUT e DELETE alteram o servidor, então não são seguros, mas repetir a chamada não muda o resultado final, então são idempotentes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método\", \"Seguro (safe)\", \"Idempotente\", \"Tem corpo na requisição\", \"Uso típico\"], [\"GET\", \"Sim\", \"Sim\", \"Não\", \"Ler um recurso\"], [\"HEAD\", \"Sim\", \"Sim\", \"Não\", \"Ler só os headers de um recurso\"], [\"OPTIONS\", \"Sim\", \"Sim\", \"Não\", \"Descobrir métodos permitidos\"], [\"PUT\", \"Não\", \"Sim\", \"Sim\", \"Substituir um recurso inteiro\"], [\"DELETE\", \"Não\", \"Sim\", \"Normalmente não\", \"Remover um recurso\"], [\"PATCH\", \"Não\", \"Depende da implementação\", \"Sim\", \"Alterar parte de um recurso\"], [\"POST\", \"Não\", \"Não, em geral\", \"Sim\", \"Criar um recurso ou disparar uma ação\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Erros comuns de semântica\n\nO erro mais clássico é usar **GET para alterar dados**: um endpoint como `GET /produtos/42/excluir` ou `GET /carrinho/limpar`. Como GET é considerado seguro, crawlers, extensões de navegador e proxies podem disparar essa chamada sem nenhuma intenção de causar dano, e mesmo assim apagar dados.\n\nOutros erros comuns:\n\n- **Usar POST para tudo**, inclusive leituras simples, perdendo cache e a possibilidade de salvar ou compartilhar a URL de uma busca.\n- **Confundir PUT com PATCH**, mandando um objeto parcial num PUT e apagando campos sem querer, ou implementando um PATCH que, na prática, se comporta como um PUT completo.\n- **Ignorar a idempotência de PUT e DELETE** ao desenhar um cliente, evitando fazer retry automático nesses métodos por precaução, quando na verdade eles foram desenhados justamente para suportar retry com segurança."
                    },
                    {
                        "type": "code",
                        "value": "# ERRADO: GET com efeito colateral\nGET /api/carrinho/limpar HTTP/1.1\nHost: loja.exemplo.com\n\n# Um crawler ou uma extensão de navegador pode disparar isso sem querer,\n# esvaziando o carrinho do usuário sem nenhuma ação intencional dele.\n\n# CERTO: ação de escrita usando um método apropriado\nPOST /api/carrinho/limpar HTTP/1.1\nHost: loja.exemplo.com\nContent-Length: 0\n\nHTTP/1.1 204 No Content\n\n# Ainda melhor, modelando o carrinho como um recurso que pode ser removido:\nDELETE /api/carrinho HTTP/1.1\nHost: loja.exemplo.com\n\nHTTP/1.1 204 No Content"
                    },
                    {
                        "type": "quote",
                        "value": "Seguro é não alterar nada. Idempotente é repetir sem piorar. Guardar essas duas ideias evita o erro mais perigoso de uma API: uma leitura que, por engano, também escreve."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza um método HTTP como seguro (safe)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele não altera o estado do servidor",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele exige autenticação para ser chamado",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele usa HTTPS obrigatoriamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele sempre retorna status 200",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quais métodos são considerados seguros (safe)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "POST, PUT e PATCH",
                                "isCorrect": false
                            },
                            {
                                "text": "DELETE e PATCH",
                                "isCorrect": false
                            },
                            {
                                "text": "GET, HEAD e OPTIONS",
                                "isCorrect": true
                            },
                            {
                                "text": "Todos os métodos HTTP são seguros por padrão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide implementar a remoção de um item do carrinho como GET /carrinho/itens/9/remover, alegando que assim fica mais simples de testar direto pela barra de endereço do navegador. Qual é o principal risco dessa decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Navegadores não conseguem processar corretamente a resposta de um GET",
                                "isCorrect": false
                            },
                            {
                                "text": "GET não permite nenhum parâmetro na URL, então o id do item se perderia",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há risco real, é apenas uma questão de estilo de código sem consequência prática",
                                "isCorrect": false
                            },
                            {
                                "text": "Como GET é esperado como seguro, agentes automáticos como crawlers, prefetch de navegador e proxies podem disparar a remoção sem intenção do usuário",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que se diz que todo método seguro também é idempotente, mas nem todo método idempotente é seguro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque isso é uma regra arbitrária da especificação, sem relação com o comportamento real dos métodos",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque não alterar nada, repetido qualquer número de vezes, sempre resulta no mesmo estado (nenhuma alteração); já PUT e DELETE alteram o servidor, mas repetir a chamada leva ao mesmo resultado final",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque idempotência é apenas um sinônimo de segurança usado em contextos diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque PUT e DELETE nunca alteram o servidor de fato",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente HTTP configurado para fazer retry automático em caso de timeout reenvia, sem intervenção humana, uma requisição PATCH que alterava o saldo de uma carteira digital pela operação somar 50 ao saldo atual. Depois de dois retries causados por instabilidade de rede, o usuário percebe que o saldo foi incrementado três vezes. O que esse cenário revela sobre o design do PATCH nesse sistema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "PATCH é sempre idempotente por definição, então o bug deve estar em outra parte do sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é exclusivo do cliente HTTP, que nunca deveria fazer retry automático",
                                "isCorrect": false
                            },
                            {
                                "text": "O PATCH foi implementado de forma não idempotente, com um incremento relativo ao valor atual, o que o torna arriscado para retry automático; uma alternativa mais segura seria enviar o valor final desejado ou usar uma chave de idempotência",
                                "isCorrect": true
                            },
                            {
                                "text": "Deveria ter sido usado GET para essa operação, já que é mais simples de implementar",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Status codes",
        "aulas": [
            {
                "titulo": "As classes de status code: 1xx a 5xx",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um status code\n\nToda resposta HTTP começa com uma linha de status, algo como `HTTP/1.1 200 OK`. Isso você já viu no Módulo 2, quando estudamos a anatomia de uma resposta. Agora é hora de entender esse número de três dígitos a fundo: o **status code**.\n\nO status code é a forma como o servidor resume, num único número, o que aconteceu com a requisição. Ele não substitui o corpo da resposta nem os headers, mas é a primeira coisa que o cliente (navegador, app, outro servidor) olha pra decidir o que fazer em seguida: mostrar os dados, exibir um erro, seguir um redirecionamento, tentar de novo mais tarde.\n\nO primeiro dígito do status code define a **classe** da resposta. Os outros dois dígitos refinam o significado dentro dessa classe. Existem cinco classes, de 1xx a 5xx."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Classe\", \"Nome\", \"O que significa\"], [\"1xx\", \"Informational\", \"A requisição foi recebida e o processo continua\"], [\"2xx\", \"Success\", \"A requisição foi recebida, entendida e processada com sucesso\"], [\"3xx\", \"Redirection\", \"O cliente precisa fazer mais alguma coisa (geralmente ir para outra URL) para completar a requisição\"], [\"4xx\", \"Client Error\", \"Há um erro na requisição, e a responsabilidade é do cliente\"], [\"5xx\", \"Server Error\", \"O servidor falhou ao processar uma requisição que, aparentemente, estava correta\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## 1xx: a classe que você quase nunca vê\n\nAs respostas 1xx são intermediárias: o servidor avisa que recebeu parte da requisição e o cliente deve continuar. Um exemplo é o `100 Continue`, usado quando o cliente pergunta antes de enviar um corpo grande (via header `Expect: 100-continue`) se o servidor topa receber o restante antes de gastar banda enviando tudo.\n\nNa prática, quem desenvolve back-end raramente lida com 1xx diretamente no código da aplicação: navegadores e bibliotecas HTTP tratam isso nos bastidores. O que importa mesmo no dia a dia são as classes 2xx, 3xx, 4xx e 5xx, que são o assunto do restante deste módulo."
                    },
                    {
                        "type": "code",
                        "value": "Linhas de status de exemplo, cada uma de uma classe diferente:\n\nHTTP/1.1 200 OK\nHTTP/1.1 301 Moved Permanently\nHTTP/1.1 404 Not Found\nHTTP/1.1 500 Internal Server Error\n\nO texto depois do número (OK, Moved Permanently, Not Found...) é só descritivo, chamado de \"reason phrase\". Quem importa de verdade pro cliente é o número: é nele que o código da aplicação, o navegador e as ferramentas de monitoramento tomam decisões."
                    },
                    {
                        "type": "text",
                        "value": "## Um jeito simples de pensar nas 4 classes que importam\n\n- **2xx**: deu certo.\n- **3xx**: vá procurar em outro lugar.\n- **4xx**: você (cliente) errou algo na requisição.\n- **5xx**: eu (servidor) errei ao processar sua requisição.\n\nEssa divisão entre 4xx e 5xx é uma das mais importantes pra quem constrói APIs: ela diz de quem é a responsabilidade pelo problema, e isso muda completamente o que o cliente deve fazer a seguir. Um erro 4xx normalmente significa \"ajuste a requisição e tente de novo\". Um erro 5xx significa \"o problema não está na sua requisição, tente novamente mais tarde ou avise quem mantém o servidor\"."
                    },
                    {
                        "type": "text",
                        "value": "## O status não trabalha sozinho\n\nNa prática, o status code quase sempre vem acompanhado de headers e de um corpo que dão mais contexto. Um redirecionamento (3xx) normalmente traz um header `Location` com a nova URL. Um erro de limite de requisições (429) pode vir com `Retry-After`, avisando quanto tempo esperar. Um erro de validação (422) costuma vir com um corpo JSON detalhando quais campos falharam.\n\nSe você abrir o DevTools do navegador na aba Network, ou rodar `curl -i` num endpoint, vai ver essa combinação de status, headers e corpo em toda resposta. Nas próximas aulas, vamos olhar classe por classe, com exemplos de resposta completos."
                    },
                    {
                        "type": "quote",
                        "value": "O primeiro dígito do status code diz a categoria da resposta: 2xx é sucesso, 3xx é redirecionamento, 4xx é erro do cliente, 5xx é erro do servidor. Entender essa divisão é a base para escolher o status certo em qualquer situação."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual classe de status HTTP indica que uma requisição foi recebida, entendida e processada com sucesso pelo servidor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "2xx",
                                "isCorrect": true
                            },
                            {
                                "text": "1xx",
                                "isCorrect": false
                            },
                            {
                                "text": "3xx",
                                "isCorrect": false
                            },
                            {
                                "text": "4xx",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente faz uma requisição a uma API e recebe HTTP/1.1 404 Not Found. A qual classe esse status pertence, e de quem é a responsabilidade indicada por essa classe?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "4xx, responsabilidade do cliente",
                                "isCorrect": true
                            },
                            {
                                "text": "5xx, responsabilidade do servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "3xx, é preciso seguir outra URL",
                                "isCorrect": false
                            },
                            {
                                "text": "2xx, sucesso parcial",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante o upload de um arquivo grande, o cliente envia o header Expect: 100-continue e recebe HTTP/1.1 100 Continue antes de enviar o corpo da requisição. A qual classe pertence esse status, e o que ele indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "1xx, o servidor está avisando que o cliente pode continuar e enviar o restante da requisição",
                                "isCorrect": true
                            },
                            {
                                "text": "2xx, o servidor confirma que o arquivo já foi salvo",
                                "isCorrect": false
                            },
                            {
                                "text": "4xx, o corpo enviado até agora está incompleto",
                                "isCorrect": false
                            },
                            {
                                "text": "3xx, o upload deve ser redirecionado para outro servidor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de suporte percebe que um endpoint de exclusão de conta está respondendo HTTP/1.1 500 Internal Server Error para várias tentativas. Considerando o que a classe 5xx representa, qual a interpretação correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O servidor falhou ao processar uma requisição que, pelo que se pode ver, estava correta",
                                "isCorrect": true
                            },
                            {
                                "text": "O cliente enviou dados inválidos e precisa corrigir a requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "500 sempre indica um problema de conexão com o banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é possível saber de quem é o erro só pelo status 500",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve corretamente a diferença entre as classes 4xx e 5xx?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "4xx indica que o problema está na requisição enviada pelo cliente; 5xx indica que o servidor falhou mesmo diante de uma requisição aparentemente válida",
                                "isCorrect": true
                            },
                            {
                                "text": "4xx é usada apenas para erros de autenticação, e 5xx para todo o resto",
                                "isCorrect": false
                            },
                            {
                                "text": "4xx e 5xx podem ser usadas de forma intercambiável, dependendo do estilo da equipe",
                                "isCorrect": false
                            },
                            {
                                "text": "4xx indica um erro grave que derruba o servidor, e 5xx indica um erro leve que não afeta o cliente",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "2xx: a requisição deu certo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Sucesso tem mais de um sabor\n\nTodo status que começa com 2 significa que a requisição foi recebida, entendida e processada com sucesso. Mas \"sucesso\" não é sempre a mesma coisa: o que o servidor deve responder depende do que o cliente pediu. Buscar um dado, criar um recurso novo e apagar um recurso são três sucessos diferentes, e cada um tem um status mais preciso do que simplesmente \"200 para tudo\".\n\nNesta aula vamos ver os três status 2xx mais usados no dia a dia de uma API: **200**, **201** e **204**."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Status\", \"Nome\", \"Quando usar\"], [\"200\", \"OK\", \"Sucesso genérico, a resposta tem corpo (GET, PUT ou PATCH bem sucedidos)\"], [\"201\", \"Created\", \"Um novo recurso foi criado com sucesso (normalmente resposta de um POST)\"], [\"204\", \"No Content\", \"A requisição deu certo, mas não há corpo para devolver (ex: DELETE bem sucedido)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## 200 OK: o sucesso padrão\n\n200 OK é o status de sucesso mais genérico, usado quando a requisição deu certo e a resposta carrega um corpo com o resultado. É o mais comum em requisições GET que retornam dados, e também aparece em PUT ou PATCH quando o servidor devolve o recurso já atualizado.\n\nSe um cliente faz GET /usuarios/42 e o usuário existe, o servidor busca os dados e responde com 200 e o usuário no corpo:"
                    },
                    {
                        "type": "code",
                        "value": "HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  \"id\": 42,\n  \"nome\": \"Marina Silva\",\n  \"email\": \"marina@example.com\"\n}"
                    },
                    {
                        "type": "text",
                        "value": "## 201 Created: um recurso novo nasceu\n\n201 Created é o status de sucesso para quando a requisição cria um recurso novo, o caso clássico é a resposta de um POST. A convenção é acompanhar o 201 de um header Location, apontando para a URL do recurso recém criado, e um corpo com os dados desse recurso (incluindo o id gerado pelo servidor).\n\nRepare que criar um recurso é um sucesso diferente de simplesmente ler um: por isso 201 existe separado de 200. Já quando a requisição dá certo e não há nada para devolver, como num DELETE bem sucedido, o status certo é 204, sem corpo nenhum na resposta."
                    },
                    {
                        "type": "code",
                        "value": "Requisição:\n\nPOST /usuarios HTTP/1.1\nContent-Type: application/json\n\n{\n  \"nome\": \"João Pedro\",\n  \"email\": \"joao@example.com\"\n}\n\nResposta:\n\nHTTP/1.1 201 Created\nLocation: /usuarios/43\nContent-Type: application/json\n\n{\n  \"id\": 43,\n  \"nome\": \"João Pedro\",\n  \"email\": \"joao@example.com\"\n}\n\nJá num DELETE /carrinho/itens/7 que remove o item com sucesso e não tem nada a devolver:\n\nHTTP/1.1 204 No Content"
                    },
                    {
                        "type": "quote",
                        "value": "200 é sucesso com corpo, 201 é sucesso que criou um recurso novo (com Location apontando para ele), 204 é sucesso sem corpo para devolver. Escolher entre os três deixa a resposta mais precisa do que usar 200 para tudo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma API recebe GET /produtos/10 e o produto existe no banco. Junto com os dados do produto no corpo da resposta, qual status é o mais adequado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "200 OK",
                                "isCorrect": true
                            },
                            {
                                "text": "201 Created",
                                "isCorrect": false
                            },
                            {
                                "text": "204 No Content",
                                "isCorrect": false
                            },
                            {
                                "text": "301 Moved Permanently",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um POST /pedidos que cria um novo pedido com sucesso, qual status é o mais adequado para a resposta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "201 Created",
                                "isCorrect": true
                            },
                            {
                                "text": "200 OK",
                                "isCorrect": false
                            },
                            {
                                "text": "204 No Content",
                                "isCorrect": false
                            },
                            {
                                "text": "404 Not Found",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um endpoint DELETE /carrinho/itens/7 remove o item com sucesso e não precisa devolver nenhum dado no corpo da resposta. Qual o status mais adequado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "204 No Content",
                                "isCorrect": true
                            },
                            {
                                "text": "200 OK com corpo vazio",
                                "isCorrect": false
                            },
                            {
                                "text": "201 Created",
                                "isCorrect": false
                            },
                            {
                                "text": "400 Bad Request",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API recebe POST /usuarios para criar um usuário novo. Além do status 201, qual header é convenção usar para indicar em qual URL o recurso recém criado pode ser acessado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Location",
                                "isCorrect": true
                            },
                            {
                                "text": "Content-Location",
                                "isCorrect": false
                            },
                            {
                                "text": "Content-Type",
                                "isCorrect": false
                            },
                            {
                                "text": "Allow",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide que toda resposta de sucesso da API (incluindo criação de recursos e exclusões) vai usar status 200, com um campo \"created\": true ou \"deleted\": true no corpo para indicar o que aconteceu. Qual o problema dessa abordagem?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ela ignora status mais precisos como 201 e 204, obrigando quem consome a API a abrir o corpo para entender o que de fato aconteceu",
                                "isCorrect": true
                            },
                            {
                                "text": "Não há problema algum, o corpo é sempre a fonte da verdade, não o status",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é só estético e não afeta ferramentas nem clientes da API",
                                "isCorrect": false
                            },
                            {
                                "text": "200 não é um status HTTP válido para respostas de POST, apenas de GET",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "3xx: redirecionamentos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Vá procurar em outro lugar\n\nStatus 3xx dizem ao cliente que ele precisa fazer mais alguma coisa para completar a requisição, geralmente buscar o recurso em outra URL. Navegadores seguem a maioria dos redirecionamentos automaticamente: o usuário nem percebe que aconteceram várias requisições até chegar na página final.\n\nAs três situações mais comuns no dia a dia são: um recurso que mudou de endereço de vez (**301**), um recurso que está temporariamente em outro lugar (**302**) e um recurso que não mudou desde a última vez que o cliente pediu (**304**, ligado a cache)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Status\", \"Nome\", \"Significado\"], [\"301\", \"Moved Permanently\", \"O recurso mudou de URL definitivamente, atualize os links\"], [\"302\", \"Found\", \"O recurso está temporariamente em outra URL, a URL original continua valendo\"], [\"304\", \"Not Modified\", \"O recurso não mudou desde a última vez, o cliente pode usar a cópia em cache\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## 301 x 302: definitivo x temporário\n\n301 Moved Permanently diz que a mudança é para sempre: o cliente (e, no caso de navegação, os motores de busca) deve passar a usar a nova URL dali em diante. É o status certo quando um site migra de domínio, reorganiza suas URLs ou passa a exigir HTTPS no lugar de HTTP.\n\n302 Found diz que a mudança é temporária: a URL original continua sendo a referência válida, só que a resposta desta vez está em outro lugar. É comum em página de manutenção temporária, em redirecionar um usuário não autenticado para a tela de login, ou em voltar para a página anterior depois de um login bem sucedido.\n\nA diferença não é só teórica: 301 sinaliza que o cliente pode (e deve) atualizar a referência que guardou; 302 sinaliza que na próxima vez ele deve tentar a URL original de novo."
                    },
                    {
                        "type": "code",
                        "value": "Site migrou de domínio em definitivo:\n\nGET /produtos-antigos HTTP/1.1\nHost: loja-antiga.com\n\nHTTP/1.1 301 Moved Permanently\nLocation: https://loja-nova.com/produtos\n\nSite em manutenção temporária:\n\nGET /checkout HTTP/1.1\nHost: loja.com\n\nHTTP/1.1 302 Found\nLocation: /manutencao"
                    },
                    {
                        "type": "text",
                        "value": "## 304 Not Modified: economizando banda com cache\n\n304 Not Modified aparece num tipo diferente de fluxo: o cliente já tem uma cópia do recurso guardada em cache e pergunta ao servidor, numa requisição condicional, se ela ainda é válida. Se o recurso não mudou, o servidor responde 304 sem enviar o corpo de novo, só confirmando que o cache pode continuar sendo usado.\n\nEssa conversa entre cliente e servidor usa headers como If-None-Match (na requisição) e ETag (na resposta), que vamos estudar a fundo no Módulo 5, sobre headers e cache. Por enquanto, o que importa é: 304 é sucesso de um jeito particular, pois confirma que o cache está atualizado, e por isso não carrega corpo."
                    },
                    {
                        "type": "code",
                        "value": "Requisição condicional, o navegador manda o ETag que já tem guardado:\n\nGET /estilos.css HTTP/1.1\nIf-None-Match: \"abc123\"\n\nSe o arquivo não mudou:\n\nHTTP/1.1 304 Not Modified\n\nSe o arquivo mudou desde a última vez:\n\nHTTP/1.1 200 OK\nETag: \"def456\"\nContent-Type: text/css\n\nbody { margin: 0; }"
                    },
                    {
                        "type": "quote",
                        "value": "301 é redirecionamento permanente (atualize os links), 302 é temporário (a URL original continua valendo) e 304 confirma que o cache do cliente ainda é válido, economizando banda ao não reenviar o corpo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa migrou definitivamente seu site de www.loja-antiga.com para www.loja-nova.com. Qual status a loja antiga deve usar ao redirecionar as requisições?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "301 Moved Permanently",
                                "isCorrect": true
                            },
                            {
                                "text": "302 Found",
                                "isCorrect": false
                            },
                            {
                                "text": "304 Not Modified",
                                "isCorrect": false
                            },
                            {
                                "text": "404 Not Found",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a resposta HTTP/1.1 304 Not Modified indica ao navegador?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que o recurso solicitado não mudou desde a última vez, e o navegador pode usar a cópia em cache",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o recurso foi movido permanentemente para outra URL",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o recurso não existe mais no servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o servidor está temporariamente fora do ar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um site de e-commerce entra em manutenção programada por duas horas. Durante esse período, as requisições para as páginas de produto devem ser redirecionadas para uma página de aviso, e depois da manutenção o site volta a funcionar nas mesmas URLs de sempre. Qual status é mais adequado para esse redirecionamento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "302 Found",
                                "isCorrect": true
                            },
                            {
                                "text": "301 Moved Permanently",
                                "isCorrect": false
                            },
                            {
                                "text": "304 Not Modified",
                                "isCorrect": false
                            },
                            {
                                "text": "404 Not Found",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um navegador faz uma requisição condicional enviando o header If-None-Match com o ETag que já tem em cache, e o servidor confirma que o conteúdo não mudou. Qual característica está correta sobre a resposta 304 nesse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ela não tem corpo, economizando banda porque o navegador já tem o conteúdo em cache",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela repete o corpo inteiro do recurso para garantir consistência",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela redireciona o navegador para uma URL de cache dedicada",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela obriga o navegador a limpar o cache e buscar tudo de novo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a principal diferença prática entre usar 301 e 302 para redirecionar uma URL antiga para uma nova?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "301 sinaliza que a mudança é definitiva, então o cliente deve atualizar a referência; 302 sinaliza que é temporário e a URL original continua válida",
                                "isCorrect": true
                            },
                            {
                                "text": "301 é usado só em APIs REST, e 302 só em sites HTML",
                                "isCorrect": false
                            },
                            {
                                "text": "301 redireciona sem enviar o header Location, e 302 exige esse header",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe diferença prática entre os dois, ambos têm o mesmo efeito em navegadores",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "4xx: o erro é do cliente",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quando o problema está na requisição\n\nStatus 4xx dizem que a requisição tem algum problema causado pelo cliente: um formato inválido, uma credencial ausente, um recurso que não existe, dados que não passam na validação. A mensagem por trás de qualquer 4xx é sempre parecida: \"ajuste alguma coisa na requisição e tente de novo, repetir exatamente a mesma requisição não vai resolver\".\n\nExistem vários status 4xx, mas oito deles aparecem o tempo todo no dia a dia de uma API:"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Status\", \"Nome\", \"Quando usar\"], [\"400\", \"Bad Request\", \"A requisição está malformada (JSON inválido, parâmetro num formato que o servidor não entende)\"], [\"401\", \"Unauthorized\", \"O cliente não está autenticado, falta credencial ou ela é inválida\"], [\"403\", \"Forbidden\", \"O cliente está autenticado, mas não tem permissão para essa ação\"], [\"404\", \"Not Found\", \"O recurso solicitado não existe (ou o servidor não quer revelar que existe)\"], [\"405\", \"Method Not Allowed\", \"O método usado não é suportado por esse recurso\"], [\"409\", \"Conflict\", \"A requisição esbarra no estado atual do recurso\"], [\"422\", \"Unprocessable Entity\", \"A sintaxe está correta, mas os dados não passam na validação\"], [\"429\", \"Too Many Requests\", \"O cliente enviou requisições demais num intervalo curto de tempo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## 401 x 403: a confusão mais comum\n\n401 Unauthorized e 403 Forbidden parecem sinônimos, mas representam situações bem diferentes, e essa é uma das armadilhas mais comuns em quem está começando com APIs.\n\n401 é sobre **autenticação**: o servidor não sabe (ou não tem certeza de) quem está fazendo a requisição, porque falta uma credencial ou ela é inválida (token expirado, senha errada, header Authorization ausente). A resposta correta, tecnicamente, deve incluir um header WWW-Authenticate indicando como o cliente deve se autenticar.\n\n403 é sobre **autorização**: o servidor sabe exatamente quem está fazendo a requisição (a autenticação passou), mas essa pessoa não tem permissão para fazer aquilo. Um usuário comum tentando acessar um painel exclusivo de administradores é um 403 típico.\n\nRegra prática: se o problema é \"eu não sei quem você é\", é 401. Se o problema é \"eu sei quem você é, mas você não pode fazer isso\", é 403."
                    },
                    {
                        "type": "code",
                        "value": "Requisição sem token de autenticação:\n\nGET /admin/relatorios HTTP/1.1\n\nHTTP/1.1 401 Unauthorized\nWWW-Authenticate: Bearer\nContent-Type: application/json\n\n{\"erro\": \"Token de acesso ausente ou inválido\"}\n\nRequisição com token válido, mas de um usuário sem permissão de administrador:\n\nGET /admin/relatorios HTTP/1.1\nAuthorization: Bearer eyJhbGciOiJIUzI1NiJ9...\n\nHTTP/1.1 403 Forbidden\nContent-Type: application/json\n\n{\"erro\": \"Você não tem permissão para acessar este recurso\"}"
                    },
                    {
                        "type": "text",
                        "value": "## 400 x 422, e o resto da turma\n\nOutra confusão comum é entre 400 e 422. O 400 Bad Request é para quando a requisição em si está quebrada: um JSON com sintaxe inválida, um Content-Type que não bate com o corpo enviado, algo que impede o servidor de sequer interpretar direito o que foi pedido. Já o 422 Unprocessable Entity é para quando a requisição está perfeitamente bem formada e o servidor a entende sem problema, mas os **dados** violam uma regra de negócio: um campo obrigatório vazio, um e-mail num formato inválido, uma senha curta demais.\n\nOs outros quatro status completam o quadro:\n\n- **404 Not Found**: o recurso não existe. Vale notar que algumas APIs usam 404 de propósito no lugar de 403 para não revelar que um recurso existe (é o caso, por exemplo, de repositórios privados no GitHub: quem não tem acesso recebe 404, não 403).\n- **405 Method Not Allowed**: o método usado não é suportado naquele endpoint. A resposta deveria incluir um header Allow listando os métodos válidos.\n- **409 Conflict**: a requisição esbarra no estado atual de um recurso, como tentar cadastrar um e-mail que já existe. É diferente de 422 porque o problema não é o formato do dado, é ele colidir com algo que já existe.\n- **429 Too Many Requests**: o cliente estourou um limite de requisições (rate limit). Costuma vir com um header Retry-After avisando quanto tempo esperar."
                    },
                    {
                        "type": "code",
                        "value": "Cadastro com campo obrigatório inválido (422):\n\nHTTP/1.1 422 Unprocessable Entity\nContent-Type: application/json\n\n{\n  \"erro\": \"Dados inválidos\",\n  \"campos\": {\n    \"email\": \"campo obrigatório\",\n    \"senha\": \"deve ter no mínimo 8 caracteres\"\n  }\n}\n\nCliente estourou o limite de requisições (429):\n\nHTTP/1.1 429 Too Many Requests\nRetry-After: 60\nContent-Type: application/json\n\n{\"erro\": \"Limite de requisições excedido, tente novamente em 60 segundos\"}"
                    },
                    {
                        "type": "quote",
                        "value": "4xx sempre aponta para um ajuste que o cliente precisa fazer: 401 é \"eu não sei quem você é\", 403 é \"eu sei quem você é, mas não pode\", 400 é \"sua requisição está quebrada\" e 422 é \"sua requisição é válida, mas os dados não passam na validação\"."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um cliente tenta acessar um endpoint sem enviar nenhum token de autenticação, numa rota que exige login. Qual status é o mais adequado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "401 Unauthorized",
                                "isCorrect": true
                            },
                            {
                                "text": "403 Forbidden",
                                "isCorrect": false
                            },
                            {
                                "text": "400 Bad Request",
                                "isCorrect": false
                            },
                            {
                                "text": "404 Not Found",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário autenticado (login válido) tenta acessar o painel de administração, mas sua conta não tem permissão de administrador. Qual status é o mais adequado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "403 Forbidden",
                                "isCorrect": true
                            },
                            {
                                "text": "401 Unauthorized",
                                "isCorrect": false
                            },
                            {
                                "text": "400 Bad Request",
                                "isCorrect": false
                            },
                            {
                                "text": "405 Method Not Allowed",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API recebe POST /usuarios com um corpo JSON sintaticamente válido, mas o campo email está vazio, embora seja obrigatório pela regra de negócio. Qual status é mais preciso para essa resposta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "422 Unprocessable Entity",
                                "isCorrect": true
                            },
                            {
                                "text": "400 Bad Request",
                                "isCorrect": false
                            },
                            {
                                "text": "409 Conflict",
                                "isCorrect": false
                            },
                            {
                                "text": "401 Unauthorized",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API só aceita os métodos GET e POST no endpoint /relatorios, mas um cliente envia uma requisição DELETE para essa mesma URL. Qual o status mais adequado, e que header deveria acompanhar a resposta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "405 Method Not Allowed, com o header Allow listando os métodos suportados",
                                "isCorrect": true
                            },
                            {
                                "text": "404 Not Found, já que o método não existe",
                                "isCorrect": false
                            },
                            {
                                "text": "400 Bad Request, porque o corpo da requisição está errado",
                                "isCorrect": false
                            },
                            {
                                "text": "403 Forbidden, porque o cliente não tem permissão para deletar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao tentar cadastrar um novo usuário com um e-mail que já existe no banco de dados, qual status representa melhor essa situação, considerando que a requisição em si está bem formada e o e-mail tem um formato válido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "409 Conflict",
                                "isCorrect": true
                            },
                            {
                                "text": "422 Unprocessable Entity",
                                "isCorrect": false
                            },
                            {
                                "text": "400 Bad Request",
                                "isCorrect": false
                            },
                            {
                                "text": "401 Unauthorized",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "5xx e a escolha do status certo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quando o problema é do servidor\n\nStatus 5xx dizem o oposto dos 4xx: o servidor recebeu uma requisição que, pelo que ele pode identificar, estava correta, mas mesmo assim falhou ao processá-la. A diferença de responsabilidade importa muito na prática: um 4xx diz para o cliente \"conserte a requisição e tente de novo\", um 5xx diz \"o problema não é seu, tente de novo mais tarde ou avise quem cuida do servidor\".\n\nUm jeito prático de decidir qual classe usar, em qualquer situação, é seguir essa sequência de perguntas:\n\n1. O servidor conseguiu entender a requisição e ela é válida? Se não, é **4xx** (400, 422, ou o 4xx mais específico para o problema).\n2. É válida, mas o recurso está em outro lugar? É **3xx**.\n3. É válida, o servidor processou, e deu tudo certo? É **2xx** (200, 201 ou 204, dependendo do que aconteceu).\n4. É válida, o servidor tentou processar, mas algo quebrou do lado dele? É **5xx**.\n\nAs três situações 5xx mais comuns no dia a dia são **500**, **502** e **503**."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Status\", \"Nome\", \"Quando aparece\"], [\"500\", \"Internal Server Error\", \"Erro genérico e inesperado no servidor (exceção não tratada, bug)\"], [\"502\", \"Bad Gateway\", \"Um proxy ou gateway recebeu uma resposta inválida do servidor de origem\"], [\"503\", \"Service Unavailable\", \"O servidor está temporariamente indisponível (sobrecarga, manutenção)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## 500, 502 e 503 na prática\n\n500 Internal Server Error é o status genérico de \"algo quebrou aqui dentro\": uma exceção não tratada no código, uma falha ao conectar no banco de dados sem tratamento adequado, qualquer bug que derruba o processamento no meio do caminho.\n\n502 Bad Gateway aparece num cenário com mais de um servidor envolvido: um proxy reverso ou API gateway (como um Nginx ou um load balancer) encaminha a requisição para um servidor de aplicação, e esse servidor não responde corretamente ou nem responde. Quem recebe o 502 é o cliente, mas quem falhou foi o servidor de aplicação por trás do proxy, e é o próprio proxy quem gera a resposta 502 ao perceber a falha.\n\n503 Service Unavailable é usado quando o servidor está de propósito temporariamente fora do ar: em deploy, em manutenção programada, ou sobrecarregado além da capacidade. Idealmente vem acompanhado de um header Retry-After, avisando o cliente quando tentar de novo."
                    },
                    {
                        "type": "code",
                        "value": "HTTP/1.1 503 Service Unavailable\nRetry-After: 120\nContent-Type: application/json\n\n{\"erro\": \"Serviço em manutenção, tente novamente em alguns minutos\"}\n\nHTTP/1.1 502 Bad Gateway\nContent-Type: application/json\n\n{\"erro\": \"O servidor de aplicação não respondeu corretamente\"}"
                    },
                    {
                        "type": "text",
                        "value": "## A armadilha do \"200 mentiroso\"\n\nUma das armadilhas mais comuns em APIs é responder sempre 200 OK, mesmo quando algo deu errado, e colocar a informação do erro só no corpo, algo como {\"success\": false, \"error\": \"mensagem\"}. Isso quebra o contrato do protocolo HTTP: o status deixa de ser confiável.\n\nO problema é concreto. Ferramentas de cache, de monitoramento, bibliotecas HTTP e até o próprio curl (com a flag -f, por exemplo) tomam decisões com base no status code, sem abrir o corpo da resposta. Se tudo é 200, essas ferramentas enxergam sucesso onde na verdade houve falha, e quem consome a API é obrigado a inspecionar o corpo de toda resposta só para saber se deu certo."
                    },
                    {
                        "type": "code",
                        "value": "Anti-padrão (o famoso \"200 mentiroso\"):\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\"success\": false, \"error\": \"Usuário não encontrado\"}\n\nCorreto (o status já conta a história certa):\n\nHTTP/1.1 404 Not Found\nContent-Type: application/json\n\n{\"erro\": \"Usuário não encontrado\"}"
                    },
                    {
                        "type": "quote",
                        "value": "Escolher o status certo é responder, com um número, três perguntas: deu certo, precisa de outro lugar, o cliente errou ou o servidor falhou? O corpo da resposta complementa essa informação, mas nunca substitui um status correto."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um servidor recebe uma requisição totalmente válida, mas uma exceção não tratada no código faz a aplicação quebrar no meio do processamento. Qual classe de status é a mais adequada para a resposta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "5xx, porque o problema está no servidor",
                                "isCorrect": true
                            },
                            {
                                "text": "4xx, porque toda falha começa na requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "3xx, porque o cliente deve tentar outra URL",
                                "isCorrect": false
                            },
                            {
                                "text": "2xx, porque o servidor recebeu a requisição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual status HTTP é o mais adequado quando um servidor de aplicação está fora do ar temporariamente para manutenção programada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "503 Service Unavailable",
                                "isCorrect": true
                            },
                            {
                                "text": "500 Internal Server Error",
                                "isCorrect": false
                            },
                            {
                                "text": "502 Bad Gateway",
                                "isCorrect": false
                            },
                            {
                                "text": "404 Not Found",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um API gateway encaminha uma requisição para o servidor de aplicação, mas esse servidor não responde ou devolve uma resposta inválida. Qual status o gateway deve retornar ao cliente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "502 Bad Gateway",
                                "isCorrect": true
                            },
                            {
                                "text": "500 Internal Server Error",
                                "isCorrect": false
                            },
                            {
                                "text": "401 Unauthorized",
                                "isCorrect": false
                            },
                            {
                                "text": "400 Bad Request",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API sempre retorna HTTP/1.1 200 OK, mas quando algo dá errado ela inclui no corpo um campo {\"success\": false, \"error\": \"mensagem\"}. Qual o principal problema dessa prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ferramentas e clientes HTTP que confiam no status code (cache, monitoramento, bibliotecas) não conseguem identificar a falha sem inspecionar o corpo",
                                "isCorrect": true
                            },
                            {
                                "text": "Não existe problema, o importante é o corpo trazer a informação certa",
                                "isCorrect": false
                            },
                            {
                                "text": "O único problema é que o corpo da resposta fica maior do que precisaria",
                                "isCorrect": false
                            },
                            {
                                "text": "200 OK não é um status válido para respostas com erro, então a API vai quebrar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma requisição GET /pedidos/999 é feita para um pedido que não existe no banco de dados. O servidor está funcionando perfeitamente e entendeu a requisição sem problemas. Qual classe de status representa essa situação, e por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "4xx, porque o problema está na requisição do cliente (pedir um recurso que não existe), não numa falha do servidor",
                                "isCorrect": true
                            },
                            {
                                "text": "5xx, porque o servidor não conseguiu encontrar o dado no banco",
                                "isCorrect": false
                            },
                            {
                                "text": "3xx, porque o cliente deveria ser redirecionado para a lista de pedidos",
                                "isCorrect": false
                            },
                            {
                                "text": "2xx, porque a busca no banco foi executada com sucesso, mesmo sem resultado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Headers, cookies e negociação de conteúdo",
        "aulas": [
            {
                "titulo": "Headers: o que são e para que servem",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Headers: o que são e para que servem\n\nToda requisição HTTP e toda resposta trazem, além da linha inicial e do corpo, um conjunto de **headers** (cabeçalhos). Um header é um par `Nome: Valor` que carrega metadados: quem está fazendo a chamada, o que está sendo enviado, como o destinatário deve tratar aquele conteúdo.\n\nOs nomes dos headers não diferenciam maiúsculas de minúsculas (`content-type` e `Content-Type` são o mesmo header), mas a convenção é escrever cada palavra com inicial maiúscula, separada por hífen. Cada header ocupa uma linha própria, e uma linha em branco separa o bloco de headers do corpo da mensagem, exatamente como já vimos na anatomia da requisição e da resposta."
                    },
                    {
                        "type": "text",
                        "value": "## Dois lados: headers de requisição e de resposta\n\nOs headers existem nos dois sentidos da conversa:\n\n- **Headers de requisição**: enviados pelo cliente, descrevem quem ele é, o que ele quer e em que formato consegue receber a resposta.\n- **Headers de resposta**: enviados pelo servidor, descrevem o que está sendo devolvido e como o cliente deve lidar com aquilo (guardar em cache, tratar como um novo cookie, e assim por diante).\n\nAlguns nomes de header aparecem só de um lado (como `Set-Cookie`, que só faz sentido numa resposta), outros aparecem dos dois lados com papéis relacionados, como `Content-Type`, que descreve o corpo tanto de uma requisição quanto de uma resposta."
                    },
                    {
                        "type": "code",
                        "value": "GET /produtos/42 HTTP/1.1\nHost: loja.exemplo.com\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\nAccept: text/html,application/xhtml+xml\nAccept-Language: pt-BR,pt;q=0.9\nConnection: keep-alive\nCookie: sessao=a1b2c3d4"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Header\",\"Função\"],[\"Host\",\"Domínio (e porta) do servidor de destino. Obrigatório desde o HTTP/1.1\"],[\"User-Agent\",\"Identifica o cliente que fez a requisição: navegador, app, curl, bot\"],[\"Accept\",\"Formatos de resposta que o cliente entende, como application/json\"],[\"Accept-Language\",\"Idiomas preferidos do cliente, em ordem de prioridade\"],[\"Authorization\",\"Credenciais do cliente (token ou usuário/senha) para autenticação\"],[\"Cookie\",\"Devolve ao servidor os cookies que ele pediu para guardar\"],[\"Content-Type\",\"Formato do corpo enviado nesta requisição, quando ela tem corpo\"]]"
                    },
                    {
                        "type": "code",
                        "value": "HTTP/1.1 200 OK\nDate: Fri, 10 Jul 2026 14:32:01 GMT\nServer: nginx/1.25.3\nContent-Type: application/json; charset=utf-8\nContent-Length: 128\nCache-Control: no-store\nSet-Cookie: sessao=a1b2c3d4; HttpOnly; Secure; Path=/\n\n{\"id\": 42, \"nome\": \"Teclado mecânico\", \"preco\": 349.9}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Header\",\"Função\"],[\"Content-Type\",\"Formato do corpo devolvido, como application/json ou text/html\"],[\"Content-Length\",\"Tamanho em bytes do corpo da resposta\"],[\"Set-Cookie\",\"Pede ao cliente para guardar um cookie e reenviá-lo nas próximas requisições\"],[\"Cache-Control\",\"Regras de cache para o cliente e para proxies intermediários\"],[\"ETag\",\"Identificador da versão atual do recurso, usado em cache condicional\"],[\"Location\",\"Para onde o cliente deve ir: redirecionamentos ou endereço de um recurso recém-criado\"],[\"Server\",\"Informação sobre o software do servidor, às vezes omitida por segurança\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Headers não são o conteúdo da conversa, são o contexto dela. Praticamente todo comportamento relevante de um cliente ou servidor (cache, autenticação, formato, cookies) é decidido por algum header, não pelo corpo da mensagem."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é, de forma geral, um header HTTP?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um par nome/valor que carrega metadados sobre a requisição ou a resposta, separado do corpo",
                                "isCorrect": true
                            },
                            {
                                "text": "O corpo da requisição já convertido para texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Um parâmetro que aparece apenas na query string da URL, depois do ponto de interrogação",
                                "isCorrect": false
                            },
                            {
                                "text": "O código de status da resposta, escrito por extenso",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um administrador percebe, nos logs do servidor, que várias requisições recentes vieram de PostmanRuntime/7.36.0 em vez de um navegador comum. Qual header revelou essa informação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "User-Agent",
                                "isCorrect": true
                            },
                            {
                                "text": "Host",
                                "isCorrect": false
                            },
                            {
                                "text": "Accept-Language",
                                "isCorrect": false
                            },
                            {
                                "text": "Cookie",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação envia, pelo navegador, um formulário HTML comum (sem JavaScript) usando POST. Quais dois headers costumam aparecer nessa requisição para descrever e dimensionar o corpo enviado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Content-Type e Content-Length",
                                "isCorrect": true
                            },
                            {
                                "text": "Accept e Accept-Language",
                                "isCorrect": false
                            },
                            {
                                "text": "Host e User-Agent",
                                "isCorrect": false
                            },
                            {
                                "text": "Cache-Control e ETag",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual dos headers abaixo só faz sentido em uma resposta, nunca sendo enviado pelo cliente numa requisição?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Host",
                                "isCorrect": false
                            },
                            {
                                "text": "Accept",
                                "isCorrect": false
                            },
                            {
                                "text": "Set-Cookie",
                                "isCorrect": true
                            },
                            {
                                "text": "Authorization",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um mesmo servidor físico responde por vários domínios diferentes (como loja.exemplo.com e blog.exemplo.com), todos apontando para o mesmo endereço IP. Como o servidor sabe qual site o cliente quer acessar, já que o IP de destino é idêntico para os dois?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Pelo header Host, que o cliente envia informando o domínio desejado",
                                "isCorrect": true
                            },
                            {
                                "text": "Pelo header User-Agent, que identifica o site de origem da requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Pelo corpo da requisição, que traz o nome do domínio",
                                "isCorrect": false
                            },
                            {
                                "text": "Pela porta TCP, que é sempre diferente para cada domínio",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Content-Type e Accept: a negociação de conteúdo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Content-Type e Accept: a negociação de conteúdo\n\nUm mesmo recurso muitas vezes pode ser representado de mais de uma forma: uma API pode devolver os dados de um usuário em JSON ou em XML, uma página pode existir em HTML ou como texto puro. **Negociação de conteúdo** é o mecanismo pelo qual cliente e servidor combinam, a cada requisição, qual formato faz sentido usar. Dois headers fazem essa combinação acontecer: `Content-Type` e `Accept`."
                    },
                    {
                        "type": "text",
                        "value": "## Content-Type: o que está sendo enviado\n\n`Content-Type` descreve o formato do corpo de uma mensagem. Aparece numa requisição sempre que ela tem corpo (POST, PUT, PATCH) e aparece em praticamente toda resposta que devolve algum conteúdo. O valor segue o padrão `tipo/subtipo`, às vezes com parâmetros extras, como o `charset` (codificação de caracteres) ou o `boundary` (usado em uploads de arquivo).\n\nSe o `Content-Type` declarado não bate com o que realmente está no corpo, por exemplo dizer `application/json` e enviar um texto que não é um JSON válido, o servidor pode falhar ao interpretar a mensagem ou simplesmente rejeitá-la."
                    },
                    {
                        "type": "code",
                        "value": "POST /usuarios HTTP/1.1\nHost: api.exemplo.com\nContent-Type: application/json\nContent-Length: 47\n\n{\"nome\": \"Ana Souza\", \"email\": \"ana@exemplo.com\"}"
                    },
                    {
                        "type": "text",
                        "value": "## Accept: o que se está disposto a receber\n\n`Accept` é o espelho do `Content-Type`, só que do lado do que o cliente **quer receber** como resposta. O cliente pode listar mais de um formato, em ordem de preferência, usando o parâmetro `q` (de 0 a 1, quanto maior mais preferido). Um servidor bem comportado tenta atender o formato de maior prioridade que ele sabe produzir.\n\nQuando o cliente manda um `Content-Type` que o servidor não sabe processar, a resposta correta é **415 Unsupported Media Type**. Quando é o `Accept` que não bate com nenhum formato que o servidor sabe produzir, a resposta correta é **406 Not Acceptable**. Nos dois casos o problema está no formato, não no conteúdo em si."
                    },
                    {
                        "type": "code",
                        "value": "GET /usuarios/7 HTTP/1.1\nHost: api.exemplo.com\nAccept: application/json, application/xml;q=0.5, text/html;q=0.1\n\nHTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\n\n{\"id\": 7, \"nome\": \"Ana Souza\"}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Content-Type\",\"Quando aparece\"],[\"application/json\",\"Corpo em JSON. Padrão na maioria das APIs modernas\"],[\"application/x-www-form-urlencoded\",\"Formulário HTML simples, no formato campo=valor&campo2=valor2\"],[\"multipart/form-data\",\"Formulário com upload de arquivo\"],[\"text/html\",\"Página HTML, comum em respostas de sites tradicionais\"],[\"text/plain\",\"Texto puro, sem formatação\"],[\"application/xml\",\"Corpo em XML, comum em sistemas legados e alguns webhooks\"],[\"image/png ou image/jpeg\",\"Resposta contendo uma imagem\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Content-Type descreve o que está indo na mensagem; Accept descreve o que se aceita receber de volta. Confundir os dois é um erro comum: um Content-Type errado quebra a leitura do corpo enviado, um Accept ignorado devolve ao cliente um formato que ele não sabe processar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Numa requisição POST que envia um corpo, qual header descreve o formato desse corpo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Content-Type",
                                "isCorrect": true
                            },
                            {
                                "text": "Accept",
                                "isCorrect": false
                            },
                            {
                                "text": "Content-Length",
                                "isCorrect": false
                            },
                            {
                                "text": "Host",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente quer deixar claro que prefere receber a resposta em JSON, mas aceita XML como alternativa. Qual header ele deve enviar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Content-Type",
                                "isCorrect": false
                            },
                            {
                                "text": "Accept",
                                "isCorrect": true
                            },
                            {
                                "text": "Content-Length",
                                "isCorrect": false
                            },
                            {
                                "text": "Set-Cookie",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma requisição chega com o header Content-Type: application/xml, mas essa API só sabe processar corpos em JSON. Qual status HTTP é o mais adequado para o servidor responder?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "400 Bad Request",
                                "isCorrect": false
                            },
                            {
                                "text": "415 Unsupported Media Type",
                                "isCorrect": true
                            },
                            {
                                "text": "406 Not Acceptable",
                                "isCorrect": false
                            },
                            {
                                "text": "422 Unprocessable Entity",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente envia Accept: application/json, mas essa API só sabe responder em XML. O que o servidor deveria devolver?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "200 OK, com o corpo em XML mesmo assim",
                                "isCorrect": false
                            },
                            {
                                "text": "406 Not Acceptable",
                                "isCorrect": true
                            },
                            {
                                "text": "415 Unsupported Media Type",
                                "isCorrect": false
                            },
                            {
                                "text": "500 Internal Server Error",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No header Accept: text/html, application/json;q=0.8, */*;q=0.5, o que o parâmetro q representa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A preferência relativa do cliente entre os formatos, numa escala de 0 a 1, sendo maior valor igual a maior preferência",
                                "isCorrect": true
                            },
                            {
                                "text": "A versão mínima do protocolo HTTP exigida pelo cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade máxima de bytes que o cliente aceita receber na resposta",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de vezes que o cliente vai tentar a requisição antes de desistir",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cache: Cache-Control, ETag e o 304",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Cache: Cache-Control, ETag e o 304\n\nBuscar o mesmo recurso do zero a cada requisição é desperdício: de tempo, de banda e de trabalho do servidor. O HTTP tem, desde as primeiras versões, um sistema de cache que permite ao cliente (ou a um proxy no meio do caminho) reaproveitar uma resposta anterior em vez de perguntar tudo de novo ao servidor. Esse sistema depende de alguns headers específicos, e é isso que vamos abrir aqui."
                    },
                    {
                        "type": "text",
                        "value": "## Cache-Control: as regras do jogo\n\n`Cache-Control` é o header de resposta que diz como aquela resposta pode ser reaproveitada. Algumas diretivas comuns:\n\n- **no-store**: nunca guarde essa resposta, em cache nenhum.\n- **no-cache**: pode guardar, mas revalide com o servidor antes de reusar (apesar do nome, não proíbe o cache).\n- **max-age=N**: a resposta pode ser reaproveitada por N segundos sem perguntar nada ao servidor.\n- **public** / **private**: se caches compartilhados (CDN, proxy) podem guardar a resposta, ou só o navegador do próprio usuário.\n\nHeaders mais antigos como `Expires` e `Pragma` existem por compatibilidade, mas hoje quem manda é o `Cache-Control`."
                    },
                    {
                        "type": "code",
                        "value": "GET /static/logo-v3.png HTTP/1.1\nHost: cdn.exemplo.com\n\nHTTP/1.1 200 OK\nContent-Type: image/png\nCache-Control: public, max-age=31536000, immutable\nContent-Length: 15320"
                    },
                    {
                        "type": "text",
                        "value": "## Quando o cache expira: ETag e revalidação\n\nQuando o tempo de `max-age` acaba, ou quando a resposta é marcada como `no-cache`, o cliente precisa perguntar ao servidor se a cópia que ele guardou ainda vale. É aqui que entra o `ETag`: um identificador (uma espécie de impressão digital) da versão atual do recurso, enviado pelo servidor em toda resposta.\n\nNa requisição seguinte, o cliente devolve esse valor no header `If-None-Match`, perguntando se ainda é essa a versão atual. Se for, o servidor responde **304 Not Modified**, sem corpo algum, e o cliente reaproveita a cópia que já tem. Se o recurso mudou, o servidor responde normalmente, com **200 OK**, um corpo novo e um `ETag` novo."
                    },
                    {
                        "type": "code",
                        "value": "GET /api/perfil/7 HTTP/1.1\nHost: api.exemplo.com\n\nHTTP/1.1 200 OK\nContent-Type: application/json\nETag: \"33a64df551\"\nCache-Control: no-cache\n\n{\"id\": 7, \"nome\": \"Ana Souza\"}\n\n---- numa requisição seguinte ----\n\nGET /api/perfil/7 HTTP/1.1\nHost: api.exemplo.com\nIf-None-Match: \"33a64df551\"\n\nHTTP/1.1 304 Not Modified\nETag: \"33a64df551\""
                    },
                    {
                        "type": "table",
                        "value": "[[\"Header\",\"Papel\"],[\"Cache-Control\",\"Define se e por quanto tempo a resposta pode ser reaproveitada, como em max-age=3600 ou no-store\"],[\"ETag\",\"Identificador da versão atual do recurso, usado para revalidação\"],[\"If-None-Match\",\"Enviado pelo cliente com o ETag que ele já tem, perguntando se ainda é válido\"],[\"Last-Modified\",\"Data da última alteração do recurso, alternativa mais simples ao ETag\"],[\"If-Modified-Since\",\"Enviado pelo cliente com a data que ele tem, equivalente ao If-None-Match usando datas\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "304 Not Modified é uma vitória de performance: o servidor confirma que o cliente já tem a versão certa e economiza o corpo inteiro da resposta. Cache bem configurado é parte do que separa uma API rápida de uma API que refaz o mesmo trabalho a cada clique."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a função principal do header Cache-Control numa resposta HTTP?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Definir se e por quanto tempo a resposta pode ser reaproveitada sem uma nova ida ao servidor",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir o formato do corpo da resposta",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticar o cliente que fez a requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Redirecionar o cliente para outra URL",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que significa o servidor responder com o status 304 Not Modified?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Houve um erro ao processar a requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "O recurso não mudou desde a última vez que o cliente o buscou, então ele pode reaproveitar a cópia que já tem",
                                "isCorrect": true
                            },
                            {
                                "text": "O recurso foi criado com sucesso",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor não suporta o formato pedido pelo cliente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time quer que uma imagem, que praticamente nunca muda, fique guardada no navegador por um ano, sem que o navegador precise perguntar nada ao servidor nesse período. Qual configuração atende melhor a esse objetivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ETag sozinho, sem Cache-Control",
                                "isCorrect": false
                            },
                            {
                                "text": "Cache-Control: public, max-age=31536000",
                                "isCorrect": true
                            },
                            {
                                "text": "Cache-Control: no-store",
                                "isCorrect": false
                            },
                            {
                                "text": "Content-Type: image/png com um parâmetro de cache",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API devolve um recurso com o header ETag: \"abc123\". Numa requisição seguinte para esse mesmo recurso, o cliente quer perguntar ao servidor se essa versão ainda é válida, antes de baixar o corpo inteiro de novo. Qual header ele deve enviar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cache-Control: no-cache",
                                "isCorrect": false
                            },
                            {
                                "text": "If-None-Match: \"abc123\"",
                                "isCorrect": true
                            },
                            {
                                "text": "Accept: \"abc123\"",
                                "isCorrect": false
                            },
                            {
                                "text": "Content-Type: \"abc123\"",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença real entre Cache-Control: no-store e Cache-Control: no-cache?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "São sinônimos: os dois proíbem qualquer tipo de cache",
                                "isCorrect": false
                            },
                            {
                                "text": "no-store proíbe guardar a resposta em qualquer cache; no-cache permite guardar, mas exige revalidação com o servidor antes de reutilizar",
                                "isCorrect": true
                            },
                            {
                                "text": "no-store é usado em respostas de erro; no-cache é usado em respostas de sucesso",
                                "isCorrect": false
                            },
                            {
                                "text": "no-store se aplica a requisições; no-cache se aplica a respostas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Authorization: Bearer e Basic",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Authorization: Bearer e Basic\n\nCada requisição HTTP chega ao servidor isolada das demais (vamos voltar a esse ponto na próxima aula, com o tema da sessão). Isso significa que, se uma rota exige que o cliente esteja autenticado, ele precisa provar quem é a cada requisição, não só uma vez no início da conversa. O header padrão para isso é o `Authorization`."
                    },
                    {
                        "type": "text",
                        "value": "## O formato do header\n\nO valor de `Authorization` segue o padrão esquema mais credenciais, escritos um depois do outro separados por espaço. Existem vários esquemas definidos, mas dois aparecem o tempo todo no dia a dia de back-end: **Basic** e **Bearer**.\n\nQuando o cliente tenta acessar uma rota protegida sem enviar esse header, ou enviando um valor inválido, o servidor responde **401 Unauthorized** e pode incluir um header `WWW-Authenticate`, indicando qual esquema ele espera."
                    },
                    {
                        "type": "code",
                        "value": "GET /admin/relatorio HTTP/1.1\nHost: painel.exemplo.com\n\nHTTP/1.1 401 Unauthorized\nWWW-Authenticate: Basic realm=\"Painel administrativo\"\n\n---- cliente reenvia com credenciais ----\n\nGET /admin/relatorio HTTP/1.1\nHost: painel.exemplo.com\nAuthorization: Basic YWRtaW46c2VuaGExMjM="
                    },
                    {
                        "type": "text",
                        "value": "## Basic: simples, mas literal\n\n`YWRtaW46c2VuaGExMjM=` não é uma senha criptografada, é só o texto `admin:senha123` (usuário e senha separados por dois-pontos) convertido para base64. Base64 não é criptografia, é apenas uma codificação reversível: qualquer um consegue decodificar de volta ao texto original. Por isso o esquema Basic só faz sentido sobre HTTPS, e mesmo assim, reenviar a senha em toda requisição não é o ideal para a maioria das aplicações modernas.\n\n## Bearer: um token no lugar da senha\n\nNo esquema **Bearer**, o cliente não envia usuário e senha a cada chamada. Ele autentica uma vez, geralmente num endpoint de login, recebe um token de volta, e passa a enviar esse token em todas as requisições seguintes. Quem carrega o token (bearer, em inglês) é considerado autorizado, daí o nome. Esse token costuma ter validade e pode expirar, exigindo login de novo ou uma renovação."
                    },
                    {
                        "type": "code",
                        "value": "POST /login HTTP/1.1\nHost: api.exemplo.com\nContent-Type: application/json\n\n{\"email\": \"ana@exemplo.com\", \"senha\": \"minhaSenha123\"}\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\"token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"}\n\n---- requisições seguintes usam o token ----\n\nGET /pedidos HTTP/1.1\nHost: api.exemplo.com\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Basic\",\"Bearer\"],[\"O que viaja no header\",\"Usuário e senha, em base64, a cada requisição\",\"Um token, obtido uma vez, reenviado a cada requisição\"],[\"Precisa de HTTPS\",\"Sim, essencial\",\"Sim, essencial\"],[\"Expiração\",\"Não tem, por padrão, validade embutida\",\"Comum ter validade, com renovação do token\"],[\"Uso típico hoje\",\"Ferramentas internas, protótipos, painéis simples\",\"APIs públicas, aplicações modernas, mobile, SPAs\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Authorization não é sobre quem você é, é sobre o que você apresenta a cada requisição para provar isso. Proteger essas credenciais, tanto no cliente quanto no servidor, é parte do trabalho de quem constrói a API."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o formato geral do valor do header Authorization?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um esquema seguido das credenciais, como em Bearer eyJhbGci... ou Basic YWRtaW46c2VuaGE=",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas o código de status esperado pela requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "O mesmo valor usado no header Content-Type",
                                "isCorrect": false
                            },
                            {
                                "text": "Authorization não usa header, só aparece no corpo da requisição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um servidor recebe uma requisição sem nenhum header Authorization, numa rota que exige login. Qual status ele deve responder?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "403 Forbidden",
                                "isCorrect": false
                            },
                            {
                                "text": "401 Unauthorized",
                                "isCorrect": true
                            },
                            {
                                "text": "404 Not Found",
                                "isCorrect": false
                            },
                            {
                                "text": "400 Bad Request",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que exatamente está codificado dentro de um header como Authorization: Basic YWRtaW46c2VuaGExMjM=?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um token assinado digitalmente",
                                "isCorrect": false
                            },
                            {
                                "text": "O usuário e a senha, unidos por dois-pontos e convertidos para base64, sem nenhuma criptografia",
                                "isCorrect": true
                            },
                            {
                                "text": "O endereço IP do cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "Um identificador de sessão gerado pelo servidor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aplicativo mobile faz login uma única vez e, depois disso, passa a incluir um valor obtido naquele login em todas as próximas requisições, sem reenviar usuário e senha a cada chamada. Qual esquema de Authorization ele provavelmente está usando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Basic",
                                "isCorrect": false
                            },
                            {
                                "text": "Bearer",
                                "isCorrect": true
                            },
                            {
                                "text": "Content-Type",
                                "isCorrect": false
                            },
                            {
                                "text": "Cookie",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que enviar Authorization: Basic numa conexão HTTP comum, sem TLS, é considerado grave?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o header Basic tem tamanho limitado e corta a senha no meio",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque as credenciais em Basic são apenas codificadas em base64, não criptografadas, e podem ser decodificadas por quem interceptar o tráfego",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o servidor rejeita automaticamente qualquer uso de Basic sem HTTPS",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o esquema Basic exige, obrigatoriamente, um certificado digital do cliente",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cookies, sessão e uma introdução a CORS",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Cookies, sessão e uma introdução a CORS\n\nHTTP é, por natureza, sem estado: o servidor não guarda de uma requisição para a outra quem é o cliente do outro lado. Só que praticamente toda aplicação real precisa saber se um pedido é do mesmo usuário que acabou de fazer login. **Cookies** são o mecanismo mais clássico para resolver isso: uma forma de anexar um pedaço de estado em cima de um protocolo que, sozinho, não lembra de nada."
                    },
                    {
                        "type": "text",
                        "value": "## Como um cookie nasce e volta\n\nO fluxo é sempre o mesmo:\n\n1. O servidor manda um header `Set-Cookie` numa resposta, com um par nome=valor e alguns atributos.\n2. O navegador guarda esse cookie.\n3. Em toda requisição seguinte para aquele domínio (e caminho), o navegador anexa sozinho um header `Cookie` com o valor guardado.\n4. O servidor lê esse valor, geralmente um identificador de sessão, e busca os dados reais dessa sessão em algum lugar (memória, banco, cache), em vez de guardar tudo dentro do próprio cookie.\n\nO cookie, nesse esquema, não precisa carregar a sessão inteira. Ele só precisa carregar uma chave que aponta para ela."
                    },
                    {
                        "type": "code",
                        "value": "POST /login HTTP/1.1\nHost: loja.exemplo.com\nContent-Type: application/json\n\n{\"email\": \"ana@exemplo.com\", \"senha\": \"minhaSenha123\"}\n\nHTTP/1.1 200 OK\nSet-Cookie: sessao=f9a8b7c6d5; HttpOnly; Secure; SameSite=Lax; Max-Age=3600; Path=/\n\n---- o navegador já envia sozinho, nas próximas requisições ----\n\nGET /carrinho HTTP/1.1\nHost: loja.exemplo.com\nCookie: sessao=f9a8b7c6d5"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Atributo\",\"O que faz\"],[\"HttpOnly\",\"Impede que o cookie seja lido por JavaScript no navegador, proteção contra XSS\"],[\"Secure\",\"Só envia o cookie em conexões HTTPS\"],[\"SameSite\",\"Controla o envio do cookie em requisições vindas de outros sites, proteção contra CSRF\"],[\"Max-Age / Expires\",\"Por quanto tempo o cookie deve ser guardado antes de expirar\"],[\"Path\",\"Em quais caminhos do site o cookie é enviado\"],[\"Domain\",\"Em quais domínios e subdomínios o cookie é enviado\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Uma introdução a CORS\n\nAgora um problema diferente: uma página carregada a partir de `https://app.loja.com` tenta chamar, via JavaScript, uma API em `https://api.loja.com`. Mesmo sendo da mesma empresa, para o navegador esses dois endereços são **origens diferentes** (origem é a combinação de protocolo, domínio e porta).\n\nPor padrão, o navegador bloqueia essa chamada entre origens diferentes. Essa regra se chama **Same-Origin Policy** e existe por segurança: sem ela, um script malicioso rodando em qualquer site poderia usar os cookies que o navegador já guarda do usuário para chamar outros sites em nome dele, sem o usuário perceber.\n\n**CORS** (Cross-Origin Resource Sharing) é o mecanismo que abre uma exceção controlada a essa regra: o servidor decide, explicitamente, quais origens podem chamá-lo, através de headers de resposta como `Access-Control-Allow-Origin`. Para métodos ou headers menos comuns, o navegador ainda faz uma requisição extra antes da real, chamada de preflight, usando o método `OPTIONS`, perguntando ao servidor se aquela chamada vai ser permitida."
                    },
                    {
                        "type": "code",
                        "value": "GET /api/produtos HTTP/1.1\nHost: api.loja.com\nOrigin: https://app.loja.com\n\nHTTP/1.1 200 OK\nContent-Type: application/json\nAccess-Control-Allow-Origin: https://app.loja.com\n\n[{\"id\": 1, \"nome\": \"Mouse\"}, {\"id\": 2, \"nome\": \"Teclado\"}]"
                    },
                    {
                        "type": "quote",
                        "value": "Cookies dão memória a um protocolo sem memória. CORS decide quem, além do próprio site, pode usar essa memória a partir do navegador. Os dois existem pela mesma razão: proteger o usuário sem impedir que aplicações modernas conversem entre si."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual header o servidor usa para pedir que o navegador guarde um cookie?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Set-Cookie",
                                "isCorrect": true
                            },
                            {
                                "text": "Cookie",
                                "isCorrect": false
                            },
                            {
                                "text": "Cache-Control",
                                "isCorrect": false
                            },
                            {
                                "text": "Authorization",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é a origem (origin) de uma requisição, no contexto de CORS?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Apenas o domínio, sem considerar protocolo ou porta",
                                "isCorrect": false
                            },
                            {
                                "text": "A combinação de protocolo, domínio e porta, como em https://app.exemplo.com",
                                "isCorrect": true
                            },
                            {
                                "text": "O endereço IP do servidor de destino",
                                "isCorrect": false
                            },
                            {
                                "text": "O user agent do navegador que fez a requisição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cookie de sessão é criado com o atributo HttpOnly. Um script malicioso, injetado na página, tenta ler esse cookie usando JavaScript no navegador. O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O script consegue ler o cookie normalmente, HttpOnly não afeta o acesso via JavaScript",
                                "isCorrect": false
                            },
                            {
                                "text": "O script não consegue ler o cookie, porque HttpOnly bloqueia justamente esse tipo de acesso",
                                "isCorrect": true
                            },
                            {
                                "text": "O navegador bloqueia a página inteira de carregar",
                                "isCorrect": false
                            },
                            {
                                "text": "O cookie é apagado automaticamente assim que o script tenta lê-lo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma página em https://app.loja.com faz uma requisição via fetch para https://api.loja.com. O navegador bloqueia a leitura da resposta porque o servidor não enviou o header adequado. Qual header resolveria isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Content-Type: application/json",
                                "isCorrect": false
                            },
                            {
                                "text": "Access-Control-Allow-Origin: https://app.loja.com",
                                "isCorrect": true
                            },
                            {
                                "text": "Set-Cookie: permitido=true",
                                "isCorrect": false
                            },
                            {
                                "text": "Cache-Control: public",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que os navegadores bloqueiam, por padrão, que uma página de um site faça requisições para outro domínio via JavaScript?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o protocolo HTTP não permite tecnicamente requisições entre domínios diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque, sem essa restrição, um script malicioso em um site poderia usar os cookies e credenciais que o navegador já guarda do usuário para chamar outro site em nome dele, sem o usuário perceber",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque servidores diferentes sempre usam formatos de dados incompatíveis entre si",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque apenas requisições GET podem cruzar domínios, todas as outras são proibidas pelo próprio HTTP",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - JSON e formatos de dados",
        "aulas": [
            {
                "titulo": "A sintaxe do JSON: tipos, objetos e arrays",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# JSON: a sintaxe que virou padrão para trocar dados\n\nToda vez que um back-end devolve uma resposta para o navegador, para um aplicativo mobile ou para outro back-end, alguém precisa decidir como representar os dados em texto. O formato mais usado hoje para isso é o **JSON** (JavaScript Object Notation).\n\nApesar do nome, JSON não é exclusivo de JavaScript. É um formato de texto independente de linguagem: praticamente toda linguagem de programação tem uma biblioteca pronta para ler e escrever JSON. Nesta aula você vai ver a sintaxe por dentro: os tipos que existem, como objetos e arrays se organizam, e quais regras não podem ser quebradas."
                    },
                    {
                        "type": "text",
                        "value": "## Os seis tipos de valor do JSON\n\nO JSON define apenas seis tipos de valor. Qualquer dado que você queira representar precisa se encaixar em um deles:\n\n- **string**: texto entre aspas duplas, como `\"Recife\"`\n- **number**: número inteiro ou decimal, sem aspas, como `42` ou `19.9`\n- **boolean**: `true` ou `false`, sempre em minúsculas\n- **null**: representa ausência de valor, também em minúsculas\n- **object**: um conjunto de pares chave/valor entre chaves `{ }`\n- **array**: uma lista ordenada de valores entre colchetes `[ ]`\n\nObject e array podem conter os outros tipos dentro deles, inclusive outros objects e arrays. É essa capacidade de aninhar que permite representar estruturas complexas usando só essas seis peças."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"nome\": \"Maria Oliveira\",\n  \"idade\": 29,\n  \"altura\": 1.68,\n  \"ativa\": true,\n  \"planoPago\": false,\n  \"dataCancelamento\": null,\n  \"cargos\": [\"desenvolvedora\", \"revisora\"],\n  \"endereco\": {\n    \"cidade\": \"Recife\",\n    \"estado\": \"PE\"\n  }\n}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo\", \"Exemplo\", \"Observação\"], [\"string\", \"\\\"Recife\\\"\", \"Sempre entre aspas duplas, nunca simples\"], [\"number\", \"19.9 ou 42\", \"Sem aspas; não existe tipo separado para inteiro e decimal\"], [\"boolean\", \"true ou false\", \"Sempre em minúsculo, sem aspas\"], [\"null\", \"null\", \"Minúsculo; representa ausência de valor, diferente de uma string vazia\"], [\"object\", \"{ \\\"cidade\\\": \\\"Recife\\\" }\", \"Pares chave/valor entre chaves\"], [\"array\", \"[1, 2, 3]\", \"Lista ordenada entre colchetes; pode misturar tipos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Regras de sintaxe que não podem ser quebradas\n\nO JSON é deliberadamente mais rígido do que um objeto JavaScript comum. Algumas regras que geram erro de parsing se forem ignoradas:\n\n- Toda chave é uma string entre **aspas duplas**. `{nome: \"Ana\"}` e `{'nome': \"Ana\"}` são inválidos; o correto é `{\"nome\": \"Ana\"}`\n- Strings sempre usam aspas duplas, nunca aspas simples\n- Não existem comentários em JSON, nem `//` nem `/* */`\n- Não pode haver vírgula depois do último item de um object ou array (a chamada trailing comma)\n- Números não podem ter zero à esquerda (`012` é inválido) nem começar direto pelo ponto (`.5` é inválido; o certo é `0.5`)\n\nEssas regras existem para que qualquer parser, em qualquer linguagem, interprete o mesmo texto exatamente da mesma forma."
                    },
                    {
                        "type": "code",
                        "value": "// Isto NÃO é JSON válido, mesmo lembrando um objeto JavaScript\n{\n  nome: 'Ana',      // chave sem aspas, valor com aspas simples\n  idade: 25,\n  ativo: true,      // vírgula depois do último campo\n}\n\n// Versão corrigida, JSON válido\n{\n  \"nome\": \"Ana\",\n  \"idade\": 25,\n  \"ativo\": true\n}"
                    },
                    {
                        "type": "quote",
                        "value": "> JSON tem só seis tipos (string, number, boolean, null, object e array), chaves e strings sempre entre aspas duplas, sem comentários e sem vírgula sobrando. É pouca sintaxe de propósito: fácil para uma máquina parsear e fácil para um humano ler."
                    }
                ],
                "questions": [
                    {
                        "statement": "Antes de processar o corpo de uma requisição, um back-end valida se o texto recebido é um JSON sintaticamente válido. Qual das opções abaixo passaria nessa validação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "{\"nome\": \"Carlos\", \"idade\": 30,}",
                                "isCorrect": false
                            },
                            {
                                "text": "{\"nome\": \"Carlos\", \"idade\": 30}",
                                "isCorrect": true
                            },
                            {
                                "text": "{nome: \"Carlos\", idade: 30}",
                                "isCorrect": false
                            },
                            {
                                "text": "{'nome': 'Carlos', 'idade': 30}",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor recebeu um erro de parsing ao tentar ler um arquivo JSON que continha a linha // campo obrigatório logo abaixo de uma chave. Qual é o motivo do erro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O parser usado não suporta caracteres acentuados",
                                "isCorrect": false
                            },
                            {
                                "text": "O comentário deveria estar entre aspas duplas para ser válido",
                                "isCorrect": false
                            },
                            {
                                "text": "JSON não tem sintaxe de comentário, nem // nem /* */",
                                "isCorrect": true
                            },
                            {
                                "text": "JSON só aceita comentários no formato /* */, nunca //",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API precisa representar que o campo telefone existe no cadastro do usuário, mas ele não foi preenchido. Qual é o valor mais correto para esse campo em JSON?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "\"telefone\": undefined",
                                "isCorrect": false
                            },
                            {
                                "text": "\"telefone\": null",
                                "isCorrect": true
                            },
                            {
                                "text": "\"telefone\": \"\"",
                                "isCorrect": false
                            },
                            {
                                "text": "\"telefone\": false",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor enviou o campo \"codigoPostal\": 08415 dentro de um corpo JSON, e o servidor respondeu com 400 dizendo que o JSON era inválido. Qual é a causa mais provável do erro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O campo codigoPostal deveria ser um array de dígitos",
                                "isCorrect": false
                            },
                            {
                                "text": "Todo campo numérico em JSON precisa estar entre aspas duplas",
                                "isCorrect": false
                            },
                            {
                                "text": "JSON não aceita números com mais de quatro dígitos",
                                "isCorrect": false
                            },
                            {
                                "text": "Números em JSON não podem começar com zero à esquerda",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Durante uma revisão de código, um colega afirma que um array em JSON só pode conter valores de um único tipo, do mesmo jeito que um array tipado em outras linguagens. Qual afirmação sobre arrays em JSON está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um array não pode conter outro array; arrays aninhados são inválidos em JSON",
                                "isCorrect": false
                            },
                            {
                                "text": "Um array pode conter valores de tipos diferentes entre si, misturando números, strings, objects e até outros arrays",
                                "isCorrect": true
                            },
                            {
                                "text": "Um array precisa ter ao menos um elemento; arrays vazios são inválidos em JSON",
                                "isCorrect": false
                            },
                            {
                                "text": "Um array só pode conter valores do mesmo tipo, como o colega afirmou",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Aninhamento e estruturas de dados complexas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dados do mundo real raramente são planos\n\nUm object com poucos campos soltos, como { \"nome\": \"Ana\", \"idade\": 25 }, é fácil de entender de imediato. Mas a maior parte dos dados que um back-end manipula tem relações: um usuário tem endereço, um pedido tem vários itens, um post tem vários comentários. O JSON representa essas relações através do aninhamento, que é simplesmente colocar um object ou um array dentro de outro object ou array.\n\nNesta aula você vai ver os dois padrões de aninhamento mais comuns em APIs reais, e até onde vale a pena aninhar."
                    },
                    {
                        "type": "text",
                        "value": "## Object dentro de object\n\nA forma mais direta de aninhamento é um campo cujo valor é outro object. É assim que se representa uma relação de \"um para um\", ou simplesmente um agrupamento de campos relacionados, como o endereço de um usuário:"
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"id\": 501,\n  \"nome\": \"Fernanda Souza\",\n  \"endereco\": {\n    \"rua\": \"Av. Boa Viagem\",\n    \"numero\": 1220,\n    \"cidade\": \"Recife\",\n    \"estado\": \"PE\",\n    \"cep\": \"51020-000\"\n  }\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Array de objects\n\nQuando a relação é de \"um para muitos\", o padrão passa a ser um array em que cada posição é um object. É assim que uma API costuma representar, por exemplo, os itens de um pedido:"
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"pedidoId\": 8842,\n  \"cliente\": \"Fernanda Souza\",\n  \"itens\": [\n    { \"produto\": \"Teclado mecânico\", \"quantidade\": 1, \"precoUnitario\": 349.90 },\n    { \"produto\": \"Mouse sem fio\", \"quantidade\": 2, \"precoUnitario\": 89.90 }\n  ],\n  \"total\": 529.70\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Até onde vale a pena aninhar\n\nO JSON não impõe um limite oficial de profundidade de aninhamento, embora na prática parsers e servidores costumem limitar isso por segurança (um JSON propositalmente aninhado em milhares de níveis pode travar um parser mal preparado). O limite real costuma ser de legibilidade: se você precisa de mais de três ou quatro níveis para representar um dado, geralmente é sinal de que parte dessa informação deveria vir de outro endpoint, ou ser referenciada por id em vez de embutida por completo.\n\nUm erro comum de quem está começando é aninhar array dentro de array sem nomear o que cada posição representa, como em [[1, \"Recife\"], [2, \"Salvador\"]]. Funciona, mas obriga quem lê a decorar o que cada índice significa. Prefira sempre um array de objects com chaves nomeadas, mesmo que o JSON fique um pouco maior."
                    },
                    {
                        "type": "quote",
                        "value": "> Aninhamento é como o JSON representa relações entre dados: object dentro de object para uma relação um para um, array de objects para uma relação um para muitos. Regra prática: se a estrutura ficou difícil de ler ou passou de três ou quatro níveis, considere simplificar ou dividir em outra requisição."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma API de e-commerce precisa representar um pedido que tem vários produtos. Qual estrutura é a mais adequada para o campo itens desse pedido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um number representando apenas a quantidade total de itens",
                                "isCorrect": false
                            },
                            {
                                "text": "Um array de objects, com um object para cada item do pedido",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma string com os nomes dos produtos separados por vírgula",
                                "isCorrect": false
                            },
                            {
                                "text": "Um único object com um campo para cada item, numerado como item1, item2, item3",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em JSON, qual é a forma correta de representar que um usuário tem um endereço com vários campos, como rua, cidade e estado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um array com três strings soltas, sem indicar o que cada uma representa",
                                "isCorrect": false
                            },
                            {
                                "text": "Um object aninhado dentro do object do usuário, num campo chamado endereco",
                                "isCorrect": true
                            },
                            {
                                "text": "Três campos separados diretamente na raiz do JSON, sem nenhum agrupamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma única string concatenando rua, cidade e estado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dev recebeu de uma API o trecho \"coordenadas\": [[1, \"Recife\"], [2, \"Salvador\"]]. Qual é o principal problema dessa estrutura?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Misturar number e string no mesmo array é sintaticamente inválido em JSON",
                                "isCorrect": false
                            },
                            {
                                "text": "As posições de cada array interno não têm nome, obrigando quem lê a saber de cor o que cada índice representa",
                                "isCorrect": true
                            },
                            {
                                "text": "Um array aninhado só pode ter no máximo duas posições",
                                "isCorrect": false
                            },
                            {
                                "text": "JSON não permite um array dentro de outro array",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe está desenhando a resposta de uma API que retorna um post de blog junto com seus comentários. Qual estrutura representa melhor a relação de um post com muitos comentários?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "{ \"post\": {...}, \"comentario1\": {...}, \"comentario2\": {...} }, um campo por comentário",
                                "isCorrect": false
                            },
                            {
                                "text": "Um array em que o primeiro elemento é sempre o post e os demais são os comentários, sem nenhuma chave indicando qual é qual",
                                "isCorrect": false
                            },
                            {
                                "text": "{ \"post\": {...}, \"comentarios\": \"comentario1; comentario2\" }, concatenando tudo em uma string",
                                "isCorrect": false
                            },
                            {
                                "text": "{ \"post\": {...}, \"comentarios\": [{...}, {...}] }, com comentarios como array de objects",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Sobre profundidade de aninhamento em JSON, qual afirmação é correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A especificação do JSON define um limite oficial de cinco níveis de aninhamento",
                                "isCorrect": false
                            },
                            {
                                "text": "O limite de aninhamento é sempre igual ao número de elementos do array mais externo",
                                "isCorrect": false
                            },
                            {
                                "text": "A especificação do JSON não define um limite oficial de profundidade, mas parsers e servidores costumam impor limites práticos por segurança e desempenho",
                                "isCorrect": true
                            },
                            {
                                "text": "Um object nunca pode conter outro object diretamente; só arrays podem ser aninhados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Serialização e desserialização: do objeto ao texto e de volta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Da memória para a rede, e de volta\n\nQuando um back-end escrito em JavaScript, Python, Java ou qualquer outra linguagem monta uma resposta, os dados começam como estruturas na memória do programa: um object, um dicionário, uma lista, uma instância de classe. A rede não transmite objetos de memória, transmite bytes. É aí que entram dois processos complementares: serialização e desserialização."
                    },
                    {
                        "type": "text",
                        "value": "## Serializar e desserializar\n\nSerializar (também chamado de stringify, encode ou dump, dependendo da linguagem) é o processo de transformar uma estrutura de dados que existe na memória do programa em uma sequência de texto que pode ser enviada pela rede ou salva em um arquivo. É o que acontece quando o servidor pega o object que representa um usuário e transforma em uma string JSON para colocar no corpo da resposta HTTP.\n\nDesserializar (ou parse, decode, load) é o processo inverso: pegar o texto JSON recebido e reconstruir uma estrutura de dados que o programa consegue manipular de novo, como um object em JavaScript ou um dicionário em Python.\n\nToda requisição com corpo JSON passa por esse ciclo pelo menos duas vezes: o cliente serializa para enviar, o servidor desserializa para ler, e depois o servidor serializa a resposta, que o cliente desserializa para usar."
                    },
                    {
                        "type": "code",
                        "value": "// Serializar: de objeto JavaScript para string JSON\nconst usuario = { nome: \"Bruno\", idade: 34, ativo: true };\nconst textoJson = JSON.stringify(usuario);\n// textoJson é a string: '{\"nome\":\"Bruno\",\"idade\":34,\"ativo\":true}'\n\n// Desserializar: de string JSON de volta para objeto JavaScript\nconst objetoDeVolta = JSON.parse(textoJson);\n// objetoDeVolta.nome é \"Bruno\", um objeto JavaScript normal de novo"
                    },
                    {
                        "type": "code",
                        "value": "# Serializar: de dicionário Python para string JSON\nimport json\n\nusuario = {\"nome\": \"Bruno\", \"idade\": 34, \"ativo\": True}\ntexto_json = json.dumps(usuario)\n# texto_json é a string: '{\"nome\": \"Bruno\", \"idade\": 34, \"ativo\": true}'\n\n# Desserializar: de string JSON de volta para dicionário Python\nobjeto_de_volta = json.loads(texto_json)\n# objeto_de_volta[\"nome\"] é \"Bruno\", um dict Python normal de novo"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação ao serializar\", \"O que acontece\"], [\"Campo com valor undefined (JavaScript)\", \"O campo é removido do JSON; dentro de um array, vira null em vez de ser removido\"], [\"Uma função ou outro valor sem representação em JSON\", \"É ignorada; não existe tipo função em JSON\"], [\"Um objeto Date\", \"Normalmente é convertido para string no formato ISO 8601, como 2026-07-10T14:30:00Z\"], [\"NaN ou Infinity\", \"Não têm representação em JSON; a maioria das bibliotecas converte para null\"], [\"Chave que não é string (ex: número usado como chave em um dicionário Python)\", \"É convertida para string, já que em JSON toda chave de object é obrigatoriamente string\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Cuidados no ciclo de ida e volta\n\nNem tudo sobrevive intacto ao ciclo de serializar e desserializar. Alguns pontos que costumam gerar bugs sutis em produção:\n\n- Ordem das chaves: a especificação do JSON não garante ordem entre os pares chave/valor de um object. Na prática, a maioria das implementações preserva a ordem de inserção, mas isso não é uma garantia formal, então evite depender da ordem dos campos.\n- Precisão de números: o JSON não distingue inteiro de decimal, e a maioria das implementações usa ponto flutuante de 64 bits para representar number. Números muito grandes, como ids acima de 2^53 gerados por alguns bancos de dados, podem perder precisão ao serializar. Por isso é comum representar ids muito grandes como string.\n- Chaves duplicadas: um object como { \"nome\": \"Ana\", \"nome\": \"Bia\" } é aceito pela sintaxe de muitos parsers, mas o comportamento não é padronizado entre implementações. Evite gerar JSON com chaves repetidas."
                    },
                    {
                        "type": "quote",
                        "value": "> Serializar transforma dado da memória em texto para trafegar pela rede; desserializar faz o caminho de volta. O ciclo parece trivial, mas tipos que o JSON não conhece, como undefined, Date ou NaN, e detalhes como a precisão numérica, podem mudar o dado no meio do caminho."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o nome do processo de transformar um objeto que está na memória do programa em uma string de texto no formato JSON?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Renderização",
                                "isCorrect": false
                            },
                            {
                                "text": "Serialização",
                                "isCorrect": true
                            },
                            {
                                "text": "Validação",
                                "isCorrect": false
                            },
                            {
                                "text": "Desserialização",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um front-end recebeu, no corpo da resposta HTTP, uma string no formato JSON e precisa transformá-la em um objeto JavaScript para acessar os campos. Qual função nativa faz essa conversão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "JSON.stringify()",
                                "isCorrect": false
                            },
                            {
                                "text": "Object.fromJson()",
                                "isCorrect": false
                            },
                            {
                                "text": "JSON.parse()",
                                "isCorrect": true
                            },
                            {
                                "text": "JSON.serialize()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor serializou em JavaScript o objeto { nome: \"Ana\", callback: function() {} } usando JSON.stringify. O que acontece com o campo callback no resultado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O campo é removido do resultado; funções não têm representação em JSON e são ignoradas pelo stringify",
                                "isCorrect": true
                            },
                            {
                                "text": "O campo vira null automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "JSON.stringify lança um erro e interrompe a execução",
                                "isCorrect": false
                            },
                            {
                                "text": "O campo vira a string \"function() {}\"",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API retorna o id de um pedido, gerado pelo banco de dados, como number dentro do JSON. O front-end percebe que ids muito grandes chegam arredondados, diferentes do valor original salvo no banco. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O servidor esqueceu de colocar aspas duplas ao redor da chave \"id\"",
                                "isCorrect": false
                            },
                            {
                                "text": "Números muito grandes podem perder precisão porque o tipo number do JSON costuma ser representado em ponto flutuante de 64 bits; por isso é comum enviar ids grandes como string",
                                "isCorrect": true
                            },
                            {
                                "text": "JSON não suporta números com mais de cinco dígitos",
                                "isCorrect": false
                            },
                            {
                                "text": "O front-end está chamando JSON.parse de forma incorreta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre a ordem das chaves de um object JSON depois de um ciclo de serialização e desserialização, qual afirmação é correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O JSON reordena automaticamente as chaves pelo tamanho do valor associado a cada uma",
                                "isCorrect": false
                            },
                            {
                                "text": "A especificação do JSON exige que as chaves sejam sempre ordenadas em ordem alfabética",
                                "isCorrect": false
                            },
                            {
                                "text": "A ordem das chaves é sempre preservada de forma garantida por todas as implementações, sem exceção",
                                "isCorrect": false
                            },
                            {
                                "text": "A especificação do JSON não garante formalmente a ordem das chaves; o código não deveria depender dela, mesmo que muitas implementações preservem a ordem de inserção na prática",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Por que o JSON virou o padrão das APIs",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## De documentos pesados a texto leve: uma pequena história\n\nAntes do JSON dominar as APIs, o formato mais comum para troca de dados estruturados na web era o XML. Serviços do início dos anos 2000, sobretudo os baseados em SOAP, trocavam mensagens em XML: verboso, com abertura e fechamento de tag para cada elemento, mas com validação de estrutura madura através de XML Schema (XSD).\n\nO JSON nasceu dentro do próprio JavaScript: é praticamente um subconjunto da sintaxe de objetos e arrays da linguagem. Douglas Crockford popularizou o formato no início dos anos 2000 como uma forma simples de enviar dados para páginas dinâmicas, o que hoje chamamos de AJAX, e o formato foi formalizado depois em padrões como a RFC 8259. De lá para cá, o JSON foi tomando o lugar do XML como formato padrão de corpo de requisição e resposta na maioria das APIs web."
                    },
                    {
                        "type": "text",
                        "value": "## Por que o JSON venceu\n\nAlguns motivos concretos explicam a adoção maciça do JSON em APIs:\n\n- Menos verboso: não existe tag de abertura e fechamento repetindo o nome do campo, como em XML. Isso significa payloads menores trafegando pela rede.\n- Mapeamento direto para estruturas de programação: um object JSON vira quase automaticamente um objeto em JavaScript, um dicionário em Python, um map em Java. Não é preciso navegar em uma árvore de nós como em XML.\n- Mais simples de gerar e de ler: praticamente toda linguagem moderna tem biblioteca nativa ou de altíssima qualidade para lidar com JSON, muitas vezes já na biblioteca padrão.\n- Menos ambiguidade: em XML, o mesmo dado pode ser representado como atributo ou como elemento filho, o que gera decisões de design divergentes entre equipes diferentes. JSON tem só objects, arrays e valores simples, o que deixa menos formas diferentes de representar a mesma coisa.\n- Curva de aprendizado menor: a sintaxe do JSON cabe em poucas regras, como você viu na primeira aula deste módulo."
                    },
                    {
                        "type": "code",
                        "value": "<usuario>\n  <id>501</id>\n  <nome>Fernanda Souza</nome>\n  <ativo>true</ativo>\n  <cargos>\n    <cargo>desenvolvedora</cargo>\n    <cargo>revisora</cargo>\n  </cargos>\n</usuario>"
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"id\": 501,\n  \"nome\": \"Fernanda Souza\",\n  \"ativo\": true,\n  \"cargos\": [\"desenvolvedora\", \"revisora\"]\n}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"XML\", \"JSON\"], [\"Legibilidade para humanos\", \"Verboso; tag de abertura e fechamento para cada campo\", \"Compacto; menos caracteres repetidos\"], [\"Mapeamento para objetos da linguagem\", \"Exige parser de árvore (DOM ou SAX) e navegação por nós\", \"Vira object, array ou dict quase diretamente\"], [\"Suporte a comentários\", \"Sim, com <!-- comentário -->\", \"Não existe sintaxe de comentário\"], [\"Validação de schema nativa\", \"Madura, com XML Schema (XSD)\", \"Não nativa; existe o JSON Schema como padrão à parte\"], [\"Atributos além de elementos\", \"Sim, como em <cargo tipo=\\\"principal\\\">\", \"Não existe; tudo é par chave/valor\"], [\"Uso típico hoje\", \"Sistemas legados, SOAP, alguns bancos e órgãos públicos, configuração de sistemas Java antigos\", \"Praticamente padrão em APIs REST novas\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que o JSON abriu mão para ser simples\n\nA simplicidade do JSON tem um preço. Ele não tem sintaxe nativa para comentários, não distingue tipos numéricos (não existe int separado de float), não tem um jeito embutido de validar formato ou tipo de campos como o XSD faz para XML, e não representa bem dados binários. Para quem precisa de validação forte de estrutura, existe o JSON Schema, um padrão separado que descreve o formato esperado de um documento JSON, mas que não faz parte da especificação original do JSON e precisa ser adotado à parte.\n\nMesmo assim, para a grande maioria das APIs web, a simplicidade do JSON pesou mais do que a robustez extra do XML. Você ainda vai encontrar XML em sistemas legados, integrações SOAP de bancos e órgãos públicos, e configuração de sistemas corporativos mais antigos, assunto que a próxima aula retoma."
                    },
                    {
                        "type": "quote",
                        "value": "> O JSON não venceu por ser tecnicamente superior em tudo: venceu por ser simples o bastante para mapear direto em estruturas de qualquer linguagem, compacto o bastante para pesar menos na rede, e fácil o bastante para qualquer parser interpretar sem ambiguidade."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual formato de dados dominava a troca de informações em web services antes da popularização do JSON, sobretudo em integrações baseadas em SOAP?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "XML",
                                "isCorrect": true
                            },
                            {
                                "text": "YAML",
                                "isCorrect": false
                            },
                            {
                                "text": "CSV",
                                "isCorrect": false
                            },
                            {
                                "text": "Protocol Buffers",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um colega de equipe está defendendo a adoção do JSON no próximo projeto e lista quatro motivos, mas um deles está errado. Qual das afirmações abaixo NÃO é um motivo real para o JSON ter se tornado o formato padrão das APIs?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "JSON é menos verboso que XML, o que reduz o tamanho dos payloads trafegando pela rede",
                                "isCorrect": false
                            },
                            {
                                "text": "JSON tem menos ambiguidade de representação do que XML, que permite o mesmo dado como atributo ou como elemento",
                                "isCorrect": false
                            },
                            {
                                "text": "Objects JSON mapeiam quase diretamente para estruturas nativas da maioria das linguagens de programação",
                                "isCorrect": false
                            },
                            {
                                "text": "JSON exige que toda API defina um schema de validação antes de aceitar qualquer requisição",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um banco precisa validar rigorosamente o formato e os tipos de cada campo de uma mensagem antes de processá-la, usando um padrão de validação maduro e adotado há décadas em integrações corporativas. Historicamente, qual formato oferece essa validação de forma nativa, através do XSD?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "JSON",
                                "isCorrect": false
                            },
                            {
                                "text": "CSV",
                                "isCorrect": false
                            },
                            {
                                "text": "application/x-www-form-urlencoded",
                                "isCorrect": false
                            },
                            {
                                "text": "XML",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Comparando o mesmo dado representado em XML e em JSON, qual diferença entre os dois formatos é verdadeira?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "XML não permite representar listas de itens, só o JSON permite isso",
                                "isCorrect": false
                            },
                            {
                                "text": "A versão em JSON sempre ocupa mais bytes do que a versão equivalente em XML",
                                "isCorrect": false
                            },
                            {
                                "text": "JSON e XML sempre têm exatamente o mesmo tamanho em bytes para o mesmo dado",
                                "isCorrect": false
                            },
                            {
                                "text": "A versão em XML tende a ser mais verbosa, porque repete o nome de cada campo em uma tag de abertura e em uma de fechamento",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Sobre validação de estrutura em JSON, qual afirmação é correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O JSON não tem validação de schema nativa na sua especificação original; quando é preciso validar formato e tipos de forma rigorosa, é comum adotar um padrão à parte chamado JSON Schema",
                                "isCorrect": true
                            },
                            {
                                "text": "O JSON tem suporte nativo a schema na própria especificação, dispensando qualquer padrão adicional",
                                "isCorrect": false
                            },
                            {
                                "text": "Assim como XML com XSD, todo parser de JSON rejeita automaticamente campos com tipo errado, sem nenhuma configuração extra",
                                "isCorrect": false
                            },
                            {
                                "text": "JSON Schema é uma funcionalidade do JavaScript, e não um padrão independente de linguagem",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Alternativas ao JSON e o papel do Content-Type",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Nem toda requisição carrega JSON\n\nAs aulas anteriores deste módulo giraram em torno do JSON, e por um bom motivo: é o formato dominante em APIs novas. Mas um back-end raramente lida só com JSON. Formulários HTML tradicionais, upload de arquivo e integrações com sistemas mais antigos usam outros formatos, e reconhecê-los faz parte do trabalho.\n\nQuem informa qual formato está sendo usado é o header Content-Type, e ele aparece em dois papéis diferentes:\n\n- Na requisição, o Content-Type diz ao servidor como interpretar os bytes do corpo que está chegando: é JSON, é um formulário, é um arquivo? Sem essa informação, ou com ela errada, o servidor pode falhar ao processar o corpo, geralmente respondendo 400 ou 415.\n- Na resposta, o Content-Type diz ao cliente qual formato o servidor realmente devolveu, o que costuma seguir o que o cliente pediu através do header Accept, visto no módulo anterior.\n\nNesta aula você vai ver os dois formatos alternativos mais comuns no dia a dia de um back-end, e onde o XML de sistemas legados ainda aparece."
                    },
                    {
                        "type": "text",
                        "value": "## application/x-www-form-urlencoded\n\nÉ o formato padrão usado por um formulário HTML simples quando o atributo enctype não é especificado. Os dados são codificados como pares chave=valor separados por &, com caracteres especiais convertidos para o formato de URL: espaço vira + (ou %20), acentos e outros caracteres não permitidos em URL viram sequências %XX (percent-encoding).\n\nÉ um formato compacto e fácil de gerar, mas só representa pares chave/valor simples e planos. Não existe uma forma natural de aninhar um object dentro de outro, nem de enviar dados binários, como um arquivo."
                    },
                    {
                        "type": "code",
                        "value": "POST /login HTTP/1.1\nHost: ensina.dev\nContent-Type: application/x-www-form-urlencoded\n\nemail=ana.paula%40email.com&senha=Senha123&lembrar=true"
                    },
                    {
                        "type": "text",
                        "value": "## multipart/form-data\n\nQuando a requisição precisa enviar um arquivo, seja uma imagem de perfil, um PDF de currículo ou uma planilha, o application/x-www-form-urlencoded não serve: ele não foi desenhado para carregar dados binários de forma segura. Para isso existe o multipart/form-data.\n\nA ideia é dividir o corpo da requisição em partes, cada uma separada por um delimitador chamado boundary, definido no próprio Content-Type. Cada parte tem seus próprios headers, geralmente um Content-Disposition indicando o nome do campo (e o nome do arquivo, se for o caso) e, opcionalmente, um Content-Type próprio descrevendo o tipo daquele arquivo especificamente, como image/png.\n\nÉ o formato usado por qualquer formulário HTML com input de arquivo, e também aparece em chamadas de API que fazem upload direto, como enviar a foto de perfil de um usuário."
                    },
                    {
                        "type": "code",
                        "value": "POST /perfil/foto HTTP/1.1\nHost: ensina.dev\nContent-Type: multipart/form-data; boundary=LimiteDaEnsina\n\n--LimiteDaEnsina\nContent-Disposition: form-data; name=\"usuarioId\"\n\n501\n--LimiteDaEnsina\nContent-Disposition: form-data; name=\"foto\"; filename=\"perfil.png\"\nContent-Type: image/png\n\n<conteúdo binário do arquivo perfil.png>\n--LimiteDaEnsina--"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Formato\", \"Content-Type\", \"Quando usar\"], [\"JSON\", \"application/json\", \"Padrão em APIs REST modernas; dados estruturados, aninhados, com texto e números\"], [\"Form urlencoded\", \"application/x-www-form-urlencoded\", \"Formulário HTML simples, sem upload de arquivo; pares chave/valor planos\"], [\"Multipart\", \"multipart/form-data\", \"Upload de arquivo, sozinho ou junto com campos de texto no mesmo envio\"], [\"XML\", \"application/xml ou text/xml\", \"Sistemas legados, integrações SOAP, configuração de sistemas corporativos antigos\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "> O formato do corpo de uma requisição não é escolhido por acaso: JSON para dados estruturados, x-www-form-urlencoded para formulários simples, multipart/form-data quando existe upload de arquivo, e XML ainda sobrevive em sistemas legados. O Content-Type é o header que declara essa escolha, e é ele que o servidor usa para saber como interpretar cada byte que chega."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um formulário HTML simples, sem nenhum campo de upload de arquivo, é enviado sem o atributo enctype especificado na tag form. Qual Content-Type o navegador usa por padrão nesse envio?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "application/json",
                                "isCorrect": false
                            },
                            {
                                "text": "application/x-www-form-urlencoded",
                                "isCorrect": true
                            },
                            {
                                "text": "multipart/form-data",
                                "isCorrect": false
                            },
                            {
                                "text": "text/plain",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API precisa receber, na mesma requisição, um campo de texto com o nome do produto e um arquivo de imagem. Qual formato de corpo é o adequado para esse caso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "multipart/form-data",
                                "isCorrect": true
                            },
                            {
                                "text": "application/x-www-form-urlencoded",
                                "isCorrect": false
                            },
                            {
                                "text": "application/xml",
                                "isCorrect": false
                            },
                            {
                                "text": "text/csv",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente envia um corpo em JSON para uma API, mas esquece de definir o header Content-Type, que chega ao servidor com o valor padrão text/plain. O que provavelmente acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O corpo é convertido automaticamente para XML pelo servidor antes de processar",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor sempre detecta automaticamente que o conteúdo é JSON, independente do Content-Type, sem risco de erro",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor pode falhar ao interpretar o corpo como JSON, já que o Content-Type informado não corresponde ao formato real dos dados, o que costuma gerar erro de parsing ou resposta 415",
                                "isCorrect": true
                            },
                            {
                                "text": "A requisição é processada normalmente, já que o Content-Type não influencia o processamento do corpo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao montar manualmente uma requisição multipart/form-data, um desenvolvedor esqueceu de incluir o parâmetro boundary no header Content-Type. Qual é a consequência mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O corpo passa a ser interpretado automaticamente como application/json",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor assume um valor padrão de boundary definido pela especificação do HTTP",
                                "isCorrect": false
                            },
                            {
                                "text": "A requisição funciona normalmente, porque o boundary é opcional e serve só de documentação",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor não consegue identificar onde uma parte termina e a próxima começa, e falha ao separar os campos enviados",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Sobre as diferenças entre application/x-www-form-urlencoded e multipart/form-data, qual afirmação é correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "multipart/form-data não pode conter campos de texto simples, apenas arquivos",
                                "isCorrect": false
                            },
                            {
                                "text": "x-www-form-urlencoded suporta upload de arquivos binários com a mesma eficiência que multipart/form-data",
                                "isCorrect": false
                            },
                            {
                                "text": "multipart/form-data é necessário para enviar dados binários de forma segura, como arquivos, enquanto x-www-form-urlencoded é limitado a pares chave/valor de texto simples, sem uma forma nativa de representar aninhamento",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois formatos são idênticos em estrutura, mudando apenas o nome usado no Content-Type",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - REST e design de APIs",
        "aulas": [
            {
                "titulo": "REST: recursos e os princípios por trás de uma boa API",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# REST: recursos e os princípios por trás de uma boa API\n\nNos módulos anteriores desta trilha você aprendeu a língua que cliente e servidor falam: a anatomia de uma requisição e resposta HTTP, os métodos (GET, POST, PUT, PATCH, DELETE), os status codes, os headers e o JSON que viaja no corpo das mensagens. Este último módulo junta todas essas peças em um único objetivo prático: como desenhar uma API que faça sentido para quem vai usá-la.\n\nO ponto de partida é REST (Representational State Transfer), um estilo de arquitetura descrito por Roy Fielding em sua tese de doutorado, em 2000. REST não é um protocolo, não é um formato de dado e não é uma biblioteca: é um conjunto de restrições para desenhar sistemas distribuídos, e o HTTP foi desenhado justamente pensando nelas."
                    },
                    {
                        "type": "text",
                        "value": "## Tudo é um recurso\n\nA ideia central do REST é que tudo que a API expõe é um recurso: uma entidade ou uma coleção que pode ser identificada por uma URL. Um recurso é sempre um substantivo, nunca uma ação. Um usuário, um pedido, a lista de pedidos de um usuário, um produto: cada um desses é um recurso, endereçado por uma URL própria.\n\nA ação sobre o recurso não entra na URL: ela é expressa pelo método HTTP. `GET /pedidos/42` lê o pedido 42. `DELETE /pedidos/42` remove o pedido 42. A URL não muda entre as duas operações, porque o recurso é o mesmo. O que muda é o verbo, e o verbo em REST é sempre o método HTTP, nunca uma palavra dentro do caminho."
                    },
                    {
                        "type": "text",
                        "value": "## As restrições que definem REST\n\nFielding descreveu um pequeno conjunto de restrições. As mais relevantes para quem desenha uma API no dia a dia:\n\n- **Cliente-servidor**: interface e armazenamento de dados são responsabilidades separadas. O front-end pode mudar completamente sem que a API precise mudar, e vice-versa.\n- **Stateless (sem estado)**: cada requisição precisa carregar tudo que o servidor precisa para processá-la. O servidor não guarda, entre uma requisição e outra, em que etapa o cliente está.\n- **Cacheable**: a resposta deve deixar claro se pode ser reaproveitada por um tempo, evitando trabalho repetido (é para isso que existem Cache-Control e ETag).\n- **Interface uniforme**: todo recurso é acessado do mesmo jeito, através de URLs, dos métodos HTTP padrão e de representações (normalmente JSON), em vez de cada endpoint inventar sua própria convenção.\n- **Sistema em camadas**: o cliente não precisa saber se está falando direto com o servidor ou se existe um proxy, um load balancer ou um gateway no meio do caminho.\n- **Código sob demanda** (opcional): o servidor pode, opcionalmente, enviar código executável para o cliente rodar. É a restrição menos usada na prática de APIs."
                    },
                    {
                        "type": "code",
                        "value": "GET /pedidos/42 HTTP/1.1\nHost: api.loja.com\nAuthorization: Bearer eyJhbGciOiJIUzI1NiJ9.aaa111\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{ \"id\": 42, \"status\": \"pendente\" }\n\nGET /pedidos/43 HTTP/1.1\nHost: api.loja.com\nAuthorization: Bearer eyJhbGciOiJIUzI1NiJ9.aaa111\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{ \"id\": 43, \"status\": \"enviado\" }"
                    },
                    {
                        "type": "text",
                        "value": "Repare no exemplo acima: as duas requisições carregam o mesmo header Authorization, de forma independente. Se ele faltar em uma delas, o servidor não sabe quem está chamando, mesmo que a chamada anterior, um segundo antes, tenha vindo do mesmo cliente. Esse é o princípio stateless funcionando na prática.\n\n## REST \"de livro\" x REST na prática do mercado\n\nA descrição original de Fielding inclui um elemento chamado HATEOAS (Hypermedia as the Engine of Application State): a ideia de que cada resposta deveria trazer links descrevendo quais ações são possíveis a partir dali, parecido com um site que só mostra os botões que fazem sentido naquele momento.\n\nNa prática, a grande maioria das APIs chamadas de \"REST\" ou \"RESTful\" não implementa HATEOAS. Elas seguem os princípios que mais importam no dia a dia (recursos bem definidos, métodos e status usados corretamente, stateless) e deixam a navegação por hyperlinks de lado. Esse estilo costuma ser chamado de REST pragmático, e é o que você vai encontrar na maioria dos times e frameworks. Não é REST errado, é o nível de REST que o mercado adotou como padrão."
                    },
                    {
                        "type": "quote",
                        "value": "REST não é uma tecnologia para instalar, é uma forma de pensar: cada URL é um recurso, cada método HTTP é uma ação sobre ele, e cada resposta é independente das anteriores."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe desenha uma API em que o servidor não guarda em memória em qual \"passo\" cada cliente está: cada requisição chega com tudo que o servidor precisa para processá-la, como o token no header Authorization. Esse é um exemplo de qual princípio REST?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Statelessness (sem estado)",
                                "isCorrect": true
                            },
                            {
                                "text": "Cacheable",
                                "isCorrect": false
                            },
                            {
                                "text": "Interface uniforme",
                                "isCorrect": false
                            },
                            {
                                "text": "Sistema em camadas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das alternativas descreve corretamente o que é um \"recurso\" em REST?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um substantivo que representa uma entidade ou coleção manipulada pela API, como /usuarios ou /pedidos",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma função remota exposta pela API, como calcularFrete()",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do banco de dados usado pelo servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "O verbo HTTP usado na requisição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor implementa uma API em que, a cada requisição, o servidor consulta uma variável guardada na memória do processo para saber em qual etapa aquele cliente está, sem que essa informação venha na própria requisição. Esse design viola qual princípio do REST?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Statelessness",
                                "isCorrect": true
                            },
                            {
                                "text": "Cacheable",
                                "isCorrect": false
                            },
                            {
                                "text": "Cliente-servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Código sob demanda",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API retorna JSON, usa os métodos HTTP corretamente e os status certos, mas não inclui links de navegação indicando quais ações são possíveis a partir de cada resposta (HATEOAS). Como essa API costuma ser classificada na prática do mercado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como uma API RESTful pragmática, que segue os princípios mais usados no dia a dia mas não implementa HATEOAS por completo",
                                "isCorrect": true
                            },
                            {
                                "text": "Como uma API que não é REST de forma alguma, e precisa ser reescrita antes de ir para produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Como uma API RPC, já que toda API REST é obrigada a incluir HATEOAS",
                                "isCorrect": false
                            },
                            {
                                "text": "Como uma API stateful, já que toda API sem HATEOAS depende de sessão guardada no servidor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API expõe um endpoint GET /relatorio que demora 40 segundos para responder porque recalcula tudo do zero a cada chamada, mesmo quando os dados não mudaram nesse intervalo. Qual princípio REST essa API está deixando de aproveitar, e que mudança ajudaria mais diretamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Cacheable: a resposta poderia indicar que pode ser reaproveitada, por exemplo com Cache-Control ou ETag, até os dados mudarem",
                                "isCorrect": true
                            },
                            {
                                "text": "Stateless: a resposta deveria depender de uma sessão guardada no servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Interface uniforme: o endpoint deveria aceitar XML além de JSON",
                                "isCorrect": false
                            },
                            {
                                "text": "Código sob demanda: o servidor deveria enviar um script para o cliente calcular o relatório localmente",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Modelando URLs: recursos, hierarquia e o fim dos verbos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Modelando URLs: recursos, hierarquia e o fim dos verbos\n\nSe todo endpoint representa um recurso, o próximo passo é aprender a desenhar a URL desse recurso de um jeito previsível. Uma API bem desenhada tem URLs que um desenvolvedor consegue adivinhar antes mesmo de ler a documentação, porque seguem sempre as mesmas regras."
                    },
                    {
                        "type": "text",
                        "value": "## Regra 1: coleções no plural\n\nUse substantivos no plural para representar uma coleção, e o mesmo substantivo para acessar um item específico dela:\n\n- `GET /usuarios` lista a coleção inteira.\n- `GET /usuarios/42` busca um item específico dessa coleção.\n\nEvite misturar singular e plural (usar `/usuario` para listar e `/usuarios` para buscar um item, por exemplo). A consistência é o que permite adivinhar a URL de um recurso novo só de conhecer o padrão dos outros."
                    },
                    {
                        "type": "text",
                        "value": "## Regra 2: hierarquia representa posse real\n\nQuando um recurso pertence a outro, isso pode aparecer na URL como aninhamento: `/usuarios/42/pedidos` são os pedidos do usuário 42. `/pedidos/10/itens` são os itens do pedido 10.\n\nMas aninhar demais atrapalha mais do que ajuda. Uma URL como `/empresas/3/departamentos/8/funcionarios/15/pagamentos/12` já é difícil de ler e de montar no cliente. Na prática, além de dois ou três níveis, costuma valer mais a pena promover o recurso final a um caminho de primeiro nível e usar query string para filtrar: `GET /pagamentos?funcionarioId=15`."
                    },
                    {
                        "type": "text",
                        "value": "## Regra 3: o verbo é o método, não a URL\n\nO erro mais comum de quem está começando a desenhar APIs é colocar a ação dentro do caminho: `/criarUsuario`, `/listarPedidos`, `/deletarProduto/9`. Isso duplica uma informação que o método HTTP já carrega.\n\nO caso que mais gera dúvida é a ação que não é um CRUD simples, como \"cancelar um pedido\". Duas soluções ficam dentro do espírito REST:\n\n- Tratar como mudança de estado do recurso: `PATCH /pedidos/10` com `{\"status\": \"cancelado\"}`.\n- Tratar a ação como um sub-recurso que é criado: `POST /pedidos/10/cancelamentos`.\n\nAs duas evitam verbo na URL. A escolha entre elas depende de quanto essa ação precisa guardar histórico e detalhes próprios (nesse caso, o sub-recurso ganha mais sentido)."
                    },
                    {
                        "type": "code",
                        "value": "Rotas mal desenhadas (verbo na URL, inconsistência de plural/singular):\n\nGET /getUsuarios\nPOST /criarUsuario\nGET /usuario/buscarPorEmail?email=ana@email.com\nPOST /deletarUsuario/42\nGET /listarPedidosDoUsuario/42\n\nAs mesmas operações seguindo convenção REST:\n\nGET /usuarios\nPOST /usuarios\nGET /usuarios?email=ana@email.com\nDELETE /usuarios/42\nGET /usuarios/42/pedidos"
                    },
                    {
                        "type": "text",
                        "value": "## Query string é para refinar, não para identificar\n\nO caminho da URL (path) identifica o recurso. A query string serve para refinar uma coleção: filtrar, ordenar, paginar. `GET /pedidos?status=pendente` continua sendo o recurso `/pedidos`, só que filtrado. Isso é diferente de `GET /pedidos/10`, que identifica um pedido específico pelo seu id.\n\nUma forma simples de testar se uma URL está bem desenhada: o path deveria continuar fazendo sentido sozinho, sem os parâmetros da query string. `/pedidos` sozinho já é um recurso válido (a coleção inteira); `?status=pendente` só reduz o que vem naquela coleção."
                    },
                    {
                        "type": "quote",
                        "value": "URL é o endereço do recurso, e é sempre substantivo. Método é a ação sobre ele. Se o nome do endpoint tem um verbo, é sinal de que a ação deveria estar no método, não no caminho."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma API tem o endpoint GET /listarClientes. Qual é o principal problema de design dessa URL?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ela usa um verbo na URL quando a ação já está implícita no método GET",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela usa letras minúsculas",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela não começa com barra",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela deveria usar POST em vez de GET",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das URLs a seguir segue a convenção REST de nomear coleções no plural?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "GET /produtos",
                                "isCorrect": true
                            },
                            {
                                "text": "GET /produto",
                                "isCorrect": false
                            },
                            {
                                "text": "GET /getProdutos",
                                "isCorrect": false
                            },
                            {
                                "text": "GET /produto/lista",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API precisa listar os endereços cadastrados por um cliente específico, de id 7. Qual URL modela melhor essa relação de hierarquia?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "GET /clientes/7/enderecos",
                                "isCorrect": true
                            },
                            {
                                "text": "GET /enderecos?buscarPorCliente=7&acao=listar",
                                "isCorrect": false
                            },
                            {
                                "text": "GET /getEnderecosDoCliente/7",
                                "isCorrect": false
                            },
                            {
                                "text": "POST /clientes/enderecos/listar/7",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time recebe a tarefa \"permitir cancelar um pedido\". Alguém sugere criar o endpoint POST /pedidos/10/cancelar. Outro sugere PATCH /pedidos/10 com o corpo {\"status\": \"cancelado\"}. Do ponto de vista do design REST visto nesta aula, qual observação é mais correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A segunda opção evita verbo na URL ao tratar o cancelamento como mudança de estado do recurso; a primeira só ficaria alinhada a REST se o cancelamento virasse um sub-recurso, como POST /pedidos/10/cancelamentos",
                                "isCorrect": true
                            },
                            {
                                "text": "A primeira opção é sempre a única correta, porque toda ação que muda dados precisa de um verbo explícito na URL",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas formas são equivalentes em termos de design REST, a escolha é só uma questão de estilo pessoal",
                                "isCorrect": false
                            },
                            {
                                "text": "PATCH não pode ser usado para alterar o campo status de um recurso, apenas PUT tem essa permissão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma URL de uma API está desenhada como /empresas/3/departamentos/8/funcionarios/15/ajustes-salariais/12. Qual é o problema mais provável desse design, e a forma mais indicada de resolvê-lo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O aninhamento ficou profundo demais para ser previsível; o ideal é promover \"ajustes-salariais\" a um recurso de nível mais alto e filtrar por query string, como GET /ajustes-salariais?funcionarioId=15",
                                "isCorrect": true
                            },
                            {
                                "text": "Falta um verbo no início da URL indicando que a operação é uma busca",
                                "isCorrect": false
                            },
                            {
                                "text": "A URL deveria usar letras maiúsculas para deixar a hierarquia mais visível",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há problema: URLs REST devem sempre espelhar 100% da hierarquia real do domínio, não importa quantos níveis isso exija",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "CRUD na prática: ação, método, URL e status certos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## CRUD na prática: ação, método, URL e status certos\n\nAgora que você sabe modelar a URL de um recurso, falta juntar isso com o que já foi visto nos módulos de métodos HTTP e de status codes. Esta aula percorre o CRUD completo (create, read, update, delete) de um único recurso, `/pedidos`, mostrando exatamente qual método, qual URL e qual status esperar em cada ação."
                    },
                    {
                        "type": "text",
                        "value": "## As seis operações de um recurso\n\n- **Listar**: `GET /pedidos` devolve a coleção inteira (ou uma página dela). Responde 200 OK mesmo se a lista estiver vazia, porque um array vazio não é erro.\n- **Buscar um item**: `GET /pedidos/10` devolve o pedido 10. Responde 200 OK se existir, 404 Not Found se não existir.\n- **Criar**: `POST /pedidos` cria um novo pedido dentro da coleção. Responde 201 Created, normalmente com um header Location apontando para a URL do recurso criado e o próprio recurso no corpo.\n- **Substituir por completo**: `PUT /pedidos/10` troca o pedido inteiro pelo que veio no corpo da requisição. Responde 200 OK (com o recurso atualizado) ou 204 No Content.\n- **Atualizar em parte**: `PATCH /pedidos/10` altera só os campos enviados. Responde 200 OK ou 204 No Content.\n- **Remover**: `DELETE /pedidos/10` apaga o pedido. Responde 204 No Content, já que não sobra nada relevante para devolver."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ação\",\"Método\",\"URL\",\"Status de sucesso\"],[\"Listar pedidos\",\"GET\",\"/pedidos\",\"200 OK\"],[\"Buscar um pedido\",\"GET\",\"/pedidos/10\",\"200 OK\"],[\"Criar pedido\",\"POST\",\"/pedidos\",\"201 Created\"],[\"Substituir pedido inteiro\",\"PUT\",\"/pedidos/10\",\"200 OK ou 204 No Content\"],[\"Atualizar parte do pedido\",\"PATCH\",\"/pedidos/10\",\"200 OK ou 204 No Content\"],[\"Remover pedido\",\"DELETE\",\"/pedidos/10\",\"204 No Content\"],[\"Pedido inexistente\",\"GET, PUT, PATCH ou DELETE\",\"/pedidos/999\",\"404 Not Found\"]]"
                    },
                    {
                        "type": "code",
                        "value": "POST /pedidos HTTP/1.1\nHost: api.loja.com\nContent-Type: application/json\n\n{\n  \"clienteId\": 7,\n  \"itens\": [{ \"produtoId\": 3, \"quantidade\": 2 }]\n}\n\nHTTP/1.1 201 Created\nContent-Type: application/json\nLocation: /pedidos/11\n\n{\n  \"id\": 11,\n  \"clienteId\": 7,\n  \"status\": \"pendente\",\n  \"itens\": [{ \"produtoId\": 3, \"quantidade\": 2 }]\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Idempotência entra na jogada\n\nVocê já viu, no módulo de métodos HTTP, que GET, PUT e DELETE são idempotentes (repetir a mesma chamada várias vezes deixa o recurso no mesmo estado final) e que POST não é. Isso importa muito no design de uma API real: se a conexão cai depois que o cliente envia um `PUT /pedidos/10` e ele não sabe se a resposta chegou, ele pode simplesmente reenviar a mesma chamada sem medo.\n\nJá reenviar um `POST /pedidos` às cegas é arriscado: pode criar dois pedidos iguais. APIs que precisam desse tipo de proteção costumam aceitar uma chave de idempotência enviada pelo cliente, em um header como `Idempotency-Key`, que o servidor usa para reconhecer uma tentativa repetida e não duplicar a criação."
                    },
                    {
                        "type": "quote",
                        "value": "Cada ação do CRUD tem um método e uma família de status esperada. Se você está adivinhando qual status devolver, é sinal de que vale revisitar o que aquela ação realmente representa: leitura, criação, substituição, atualização parcial ou remoção."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um cliente envia POST /pedidos com os dados de um novo pedido, e o servidor consegue criar o registro com sucesso. Qual status code é o mais apropriado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "201 Created",
                                "isCorrect": true
                            },
                            {
                                "text": "200 OK",
                                "isCorrect": false
                            },
                            {
                                "text": "204 No Content",
                                "isCorrect": false
                            },
                            {
                                "text": "302 Found",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente faz GET /pedidos/999, mas não existe pedido com esse id. Qual status a API deve retornar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "404 Not Found",
                                "isCorrect": true
                            },
                            {
                                "text": "400 Bad Request",
                                "isCorrect": false
                            },
                            {
                                "text": "204 No Content",
                                "isCorrect": false
                            },
                            {
                                "text": "200 OK, com corpo vazio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API implementa DELETE /pedidos/10 e remove o pedido com sucesso, sem ter mais nada relevante para devolver no corpo da resposta. Qual status é o mais adequado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "204 No Content",
                                "isCorrect": true
                            },
                            {
                                "text": "200 OK",
                                "isCorrect": false
                            },
                            {
                                "text": "409 Conflict",
                                "isCorrect": false
                            },
                            {
                                "text": "404 Not Found",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente faz PUT /pedidos/10 e a conexão cai antes de a resposta chegar. Sem saber se o servidor processou a chamada, o cliente reenvia exatamente a mesma requisição PUT /pedidos/10 com o mesmo corpo. Como PUT é idempotente, qual é o resultado esperado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O estado final do pedido é o mesmo, tenha o servidor processado a chamada uma ou duas vezes; no máximo um campo de auditoria como \"atualizadoEm\" muda",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor deve rejeitar a segunda chamada com 409 Conflict, já que o recurso já foi atualizado",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor cria um segundo pedido, já que cada PUT gera uma nova versão do recurso",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor deve responder 405 Method Not Allowed na segunda tentativa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API expõe apenas PATCH /pedidos/10 para qualquer atualização, e o cliente sempre envia o objeto inteiro do pedido no corpo, mesmo quando só um campo mudou. Qual é a crítica mais precisa a esse design, do ponto de vista da semântica REST vista nesta aula?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Como o cliente sempre substitui o recurso inteiro, o verbo semanticamente mais correto seria PUT; usar só PATCH funciona, mas esconde a intenção de que a operação é sempre uma substituição completa",
                                "isCorrect": true
                            },
                            {
                                "text": "Não há diferença nenhuma entre PATCH e PUT em nenhuma implementação HTTP, então o design está correto",
                                "isCorrect": false
                            },
                            {
                                "text": "O correto seria substituir PATCH por GET, já que GET também pode ser usado para alterar dados no servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "O correto seria remover o pedido com DELETE e criar outro com POST a cada atualização",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Versionamento, paginação e filtros",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Versionamento, paginação e filtros\n\nUm endpoint isolado bem desenhado não é suficiente se a API inteira não pensar em como crescer. Três decisões aparecem em praticamente toda API que vive tempo suficiente em produção: como versionar mudanças, como devolver listas grandes e como deixar o cliente filtrar o que precisa."
                    },
                    {
                        "type": "text",
                        "value": "## Versionamento\n\nUma API muda com o tempo: campos são renomeados, comportamentos mudam, formatos evoluem. O problema é que clientes antigos (um aplicativo mobile que o usuário não atualizou, um sistema parceiro que integrou uma vez e nunca mais mexeu) continuam esperando o formato antigo.\n\nAs formas mais comuns de versionar:\n\n- **Na URL**: `/v1/pedidos`, `/v2/pedidos`. É a abordagem mais usada na prática, porque é visível e fácil de testar direto no navegador ou no curl.\n- **No header**: por exemplo `Accept: application/vnd.empresa.v2+json`. Mantém a URL limpa, mas exige que quem consome a API preste mais atenção aos headers.\n\nO importante não é qual técnica escolher, é decidir isso antes de precisar: descobrir que a API precisa de versionamento só depois de quebrar clientes em produção é um problema bem mais caro de resolver."
                    },
                    {
                        "type": "text",
                        "value": "## Paginação\n\nDevolver 50 mil registros em uma única resposta é lento para o servidor montar, pesado para trafegar e difícil para o cliente processar. Toda coleção que pode crescer sem limite precisa de paginação.\n\nDuas estratégias comuns:\n\n- **Por página** (offset): `GET /pedidos?page=2&limit=20`. Simples de implementar e de entender, mas pode repetir ou pular itens se a coleção mudar entre uma chamada e outra.\n- **Por cursor**: `GET /pedidos?cursor=eyJpZCI6MzB9&limit=20`, em que o cursor aponta para a posição exata do último item já visto. Mais estável em coleções grandes e com muita escrita concorrente, ao custo de ser um pouco mais trabalhosa de implementar."
                    },
                    {
                        "type": "code",
                        "value": "GET /pedidos?page=2&limit=2 HTTP/1.1\nHost: api.loja.com\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  \"data\": [\n    { \"id\": 23, \"status\": \"pendente\" },\n    { \"id\": 24, \"status\": \"enviado\" }\n  ],\n  \"meta\": {\n    \"page\": 2,\n    \"limit\": 2,\n    \"totalItens\": 57,\n    \"totalPaginas\": 29\n  }\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Filtros e ordenação\n\nA query string é o lugar certo para refinar uma coleção, como já vimos na aula sobre modelagem de URLs: `GET /pedidos?status=pendente&clienteId=42&ordenar=-criadoEm`. Aqui, `-criadoEm` é uma convenção comum para indicar ordem decrescente pelo campo criadoEm (o sinal de menos antes do nome do campo), enquanto `criadoEm` sem sinal indicaria ordem crescente.\n\nO nome exato dos parâmetros varia de API para API, mas o padrão estrutural se repete: filtros como pares campo e valor, e um parâmetro dedicado para ordenação."
                    },
                    {
                        "type": "text",
                        "value": "## Limites de uso também são design de API\n\nVocê já viu o status 429 Too Many Requests no módulo de status codes. Uma API bem desenhada não se limita a devolver esse status: ela comunica os limites antes de o cliente estourar, normalmente por headers na própria resposta, como o total de chamadas permitido na janela de tempo e quantas ainda restam. Esse cenário tem inclusive um header padronizado no HTTP, o `Retry-After`, que informa quanto tempo esperar antes da próxima tentativa."
                    },
                    {
                        "type": "quote",
                        "value": "Versionamento, paginação e filtros não são detalhes de acabamento: são o que separa uma API que funciona numa demonstração de uma API que aguenta anos de clientes reais integrados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe quer poder fazer mudanças incompatíveis na API no futuro, como mudar o formato de um campo, sem quebrar os clientes que já integraram. Qual prática ajuda diretamente com isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Versionamento da API, como em /v1/pedidos e /v2/pedidos",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar sempre o método GET em todos os endpoints",
                                "isCorrect": false
                            },
                            {
                                "text": "Retornar sempre o status 200, mesmo em erros",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o header Content-Type das respostas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma coleção /produtos tem 50 mil registros. Um cliente faz GET /produtos e a API tenta devolver todos de uma vez. Qual prática resolveria esse problema?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Paginação, retornando um subconjunto por vez com parâmetros como page e limit",
                                "isCorrect": true
                            },
                            {
                                "text": "Versionamento da URL",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o método GET por POST",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover os status codes das respostas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API de produtos com estoque mudando o tempo todo pagina a listagem usando page e limit (offset). O time percebe que, ao navegar pelas páginas, alguns produtos aparecem duas vezes e outros somem. Qual é a causa mais provável, e a alternativa mais indicada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A paginação por offset é sensível a inserções e remoções entre uma chamada e outra; paginação por cursor tende a ser mais estável nesse cenário",
                                "isCorrect": true
                            },
                            {
                                "text": "A causa é o uso do método GET para listar; trocar para POST resolveria o problema",
                                "isCorrect": false
                            },
                            {
                                "text": "A causa é a ausência de versionamento na URL da API",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso é esperado em qualquer API REST e não existe forma de evitar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente quer buscar os pedidos com status \"pendente\", ordenados do mais recente para o mais antigo. Qual desenho de URL é mais coerente com as convenções vistas nesta trilha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "GET /pedidos?status=pendente&ordenar=-criadoEm",
                                "isCorrect": true
                            },
                            {
                                "text": "GET /pedidos/pendente/ordenarPorData",
                                "isCorrect": false
                            },
                            {
                                "text": "POST /pedidos/filtrar, enviando o filtro no corpo da requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "GET /filtrarPedidosPendentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API pública passa a limitar quantas chamadas cada cliente pode fazer por minuto, respondendo 429 Too Many Requests quando o limite estoura, como visto no módulo de status codes. Além do status, o que mais uma API bem desenhada costuma comunicar nesse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Informações sobre o limite, normalmente em headers: o total permitido, quanto ainda resta na janela atual e, com o header padronizado Retry-After, quanto tempo esperar antes de tentar de novo",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada além do status 429; headers adicionais não têm nenhuma utilidade nesse cenário",
                                "isCorrect": false
                            },
                            {
                                "text": "A senha atual do cliente no corpo da resposta, para forçar uma reautenticação",
                                "isCorrect": false
                            },
                            {
                                "text": "A troca de todos os endpoints de GET para POST, já que POST não sofre limitação de taxa",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Erros consistentes e o que faz uma API bem desenhada",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Erros consistentes e o que faz uma API bem desenhada\n\nEsta é a última aula da trilha, e ela fecha um ciclo: depois de aprender a modelar recursos, escolher métodos e status certos e organizar URLs, falta um detalhe que separa uma API profissional de uma API amadora: o que ela devolve quando algo dá errado."
                    },
                    {
                        "type": "text",
                        "value": "## Por que o formato do erro importa tanto quanto o status\n\nO status code já diz a categoria do problema (400 é erro de quem chamou, 500 é erro do servidor, e assim por diante, como você viu no módulo de status codes). Mas só o número não é suficiente para o cliente decidir o que fazer com o erro ou o que mostrar para quem está usando o sistema.\n\nUma API bem desenhada devolve, em todo erro, um corpo com o mesmo formato: um código legível por máquina (para o cliente decidir programaticamente o que fazer), uma mensagem legível por humano (para debug ou para exibir) e, quando fizer sentido, detalhes estruturados, como qual campo falhou na validação e por quê. Existe até um padrão da própria IETF para isso, a RFC 7807 (\"Problem Details for HTTP APIs\"), que sugere campos como type, title, status e detail. Muitas APIs usam uma versão simplificada da mesma ideia, sem seguir a RFC ao pé da letra."
                    },
                    {
                        "type": "code",
                        "value": "Erro de validação (422 Unprocessable Entity):\n\nHTTP/1.1 422 Unprocessable Entity\nContent-Type: application/json\n\n{\n  \"error\": {\n    \"code\": \"VALIDATION_ERROR\",\n    \"message\": \"Não foi possível criar o pedido.\",\n    \"details\": [\n      { \"field\": \"email\", \"issue\": \"campo obrigatório\" },\n      { \"field\": \"quantidade\", \"issue\": \"deve ser maior que zero\" }\n    ]\n  }\n}\n\nRecurso inexistente (404 Not Found), mesmo formato:\n\nHTTP/1.1 404 Not Found\nContent-Type: application/json\n\n{\n  \"error\": {\n    \"code\": \"NOT_FOUND\",\n    \"message\": \"Pedido 999 não encontrado.\"\n  }\n}"
                    },
                    {
                        "type": "text",
                        "value": "## O que caracteriza uma API bem desenhada\n\nJuntando tudo o que essa trilha cobriu, uma API bem desenhada costuma ter:\n\n- Recursos bem nomeados, no plural, com hierarquia só onde faz sentido.\n- Métodos e status usados com o significado correto, sem responder tudo com 200 ou tudo com 500 e uma mensagem genérica.\n- URLs previsíveis, sem verbo, com filtros e ordenação na query string.\n- Erros no mesmo formato em toda a API, com código, mensagem e detalhes quando cabível.\n- Paginação em qualquer coleção que possa crescer, e versionamento pensado desde o início.\n- Documentação que descreva os endpoints, normalmente usando um padrão como o OpenAPI (também conhecido como Swagger), que permite gerar documentação interativa a partir de uma especificação."
                    },
                    {
                        "type": "text",
                        "value": "## A ponte para o próximo passo\n\nTudo o que essa trilha ensinou (a anatomia de uma requisição e resposta, os métodos, os status, os headers, o JSON e agora os princípios de REST) é exatamente o vocabulário que você precisa para dar o próximo passo do roadmap de back-end: APIs & Frameworks.\n\nUm framework web (como Express ou Fastify em Node.js, Django REST Framework ou FastAPI em Python, ou Spring em Java) é a ferramenta que transforma o design que você aprendeu a fazer aqui em código de verdade: ele recebe a requisição HTTP crua, direciona ela para a função certa com base no método e na URL, e ajuda a montar a resposta (status, headers, corpo) do jeito que você decidir. Antes de aprender a ferramenta, vale a pena entender exatamente o que ela faz por baixo dos panos, e é isso que essa trilha construiu."
                    },
                    {
                        "type": "quote",
                        "value": "Uma API bem desenhada é uma conversa clara entre dois programas: cada URL diz o que é, cada método diz o que fazer com aquilo, e cada status diz o que aconteceu. Aprender a ter essa conversa é a base para construir qualquer back-end."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma API retorna erros em formatos diferentes dependendo do endpoint: às vezes uma string simples, às vezes um objeto com \"msg\", às vezes um objeto com \"error\". Qual é o principal problema disso para quem consome a API?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O cliente precisa escrever um tratamento de erro diferente para cada endpoint, em vez de reaproveitar uma única lógica",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum: o status HTTP sozinho já é suficiente, o formato do corpo do erro não importa",
                                "isCorrect": false
                            },
                            {
                                "text": "É só uma questão estética, que não chega a afetar o código do cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "JSON não permite representar erros de formas diferentes, então isso nem seria possível na prática",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um corpo de erro padronizado como { \"error\": { \"code\": \"VALIDATION_ERROR\", \"message\": \"...\" } }, qual é a utilidade principal do campo \"code\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Permitir que o cliente trate o erro programaticamente, por exemplo com um switch, sem depender do texto exato da mensagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir a necessidade de devolver um status HTTP",
                                "isCorrect": false
                            },
                            {
                                "text": "Ser exibido diretamente ao usuário final, sem nenhuma tradução",
                                "isCorrect": false
                            },
                            {
                                "text": "Indicar qual método HTTP deve ser usado na próxima tentativa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente envia POST /pedidos com o campo \"quantidade\" preenchido como texto (\"dez\") em vez de número, e a API detecta o problema antes de tentar processar o pedido. Seguindo o que foi visto sobre status codes e sobre erros consistentes, qual resposta é mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "422 Unprocessable Entity (ou 400, dependendo da convenção da equipe), com um corpo de erro indicando o campo \"quantidade\" e o motivo da falha",
                                "isCorrect": true
                            },
                            {
                                "text": "500 Internal Server Error, já que qualquer falha ao processar uma requisição é responsabilidade do servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "200 OK, com uma mensagem de erro no corpo para não quebrar o cliente que não trata outros status",
                                "isCorrect": false
                            },
                            {
                                "text": "301 Moved Permanently, redirecionando para um formulário de correção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual conjunto de características está mais alinhado ao que essa trilha definiu como uma API bem desenhada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Recursos bem nomeados no plural, métodos e status usados com o significado correto, URLs previsíveis e erros no mesmo formato em toda a API",
                                "isCorrect": true
                            },
                            {
                                "text": "Todos os endpoints respondendo sempre 200, deixando o motivo real do erro só na mensagem dentro do corpo",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada endpoint com seu próprio formato de erro, ajustado ao contexto específico daquela funcionalidade",
                                "isCorrect": false
                            },
                            {
                                "text": "O menor uso possível de JSON, preferindo texto plano para reduzir o tamanho das respostas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe termina de desenhar, no papel, uma API REST completa: recursos no plural, hierarquia coerente, métodos e status corretos, paginação, versionamento e erro padronizado. Falta implementar isso de verdade, traduzindo requisições HTTP em código que rode no servidor. O que essa ferramenta representa dentro do roadmap de back-end?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um framework web, como Express, FastAPI ou Spring, responsável por rotear cada requisição até o código certo e montar a resposta HTTP conforme o design definido",
                                "isCorrect": true
                            },
                            {
                                "text": "Um banco de dados, já que um bom design de API elimina a necessidade de um servidor de aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Um navegador, já que é ele quem interpreta as URLs da API",
                                "isCorrect": false
                            },
                            {
                                "text": "Um novo protocolo que substitui o HTTP para simplificar a implementação",
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
