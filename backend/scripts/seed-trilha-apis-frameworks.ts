// Seed da trilha APIs e Frameworks (iniciante), estagio 3 do roadmap de Back-end.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-apis-frameworks.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "APIs e Frameworks";
const DESCRICAO =
    "Construa sua primeira API REST com Node.js e Express: rotas e recursos, middleware, validação de dados, tratamento de erros e a estrutura de um projeto de back-end de verdade.";

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
        "titulo": "Módulo 1 - Seu primeiro servidor com Node.js e Express",
        "aulas": [
            {
                "titulo": "O que é um framework e por que usar o Express",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 1 - Seu primeiro servidor com Node.js e Express\n\nNa trilha anterior você aprendeu como o protocolo HTTP funciona: métodos, status codes, headers e o ciclo de requisição e resposta. Chegou a hora de sair da teoria e construir uma API de verdade, que recebe requisições e devolve respostas rodando na sua própria máquina.\n\nEste módulo é o ponto de partida: você vai entender o que é um framework, por que o Express é a escolha mais comum do mercado para Node.js, e vai colocar no ar o seu primeiro servidor. Ao longo desta trilha, esse servidor vai crescer até virar uma API completa de tarefas, com rotas, validação, tratamento de erro e estrutura de projeto profissional."
                    },
                    {
                        "type": "text",
                        "value": "## O que é um framework\n\nUm framework é um conjunto de ferramentas e convenções que resolve os problemas repetitivos de um tipo de aplicação, para que você não precise reinventar a roda a cada projeto novo. No caso de um framework web como o Express, ele resolve coisas como:\n\n- Receber uma requisição HTTP e identificar o método e o caminho solicitado\n- Encaminhar essa requisição para o código certo que vai tratá-la\n- Facilitar a montagem da resposta (texto, JSON, status code, headers)\n- Organizar um pipeline de funções que processam a requisição antes da resposta final (os chamados middlewares, que você vai estudar a fundo mais adiante nesta trilha)\n\nO Node.js sozinho já é capaz de subir um servidor HTTP, através do módulo nativo http. O problema é que, sem um framework, cada projeto acaba reimplementando manualmente coisas como roteamento, leitura do corpo da requisição e tratamento de erros."
                    },
                    {
                        "type": "code",
                        "value": "const http = require('http');\n\nconst server = http.createServer((req, res) => {\n  if (req.method === 'GET' && req.url === '/') {\n    res.writeHead(200, { 'Content-Type': 'text/plain' });\n    res.end('Olá, mundo!');\n    return;\n  }\n\n  if (req.method === 'GET' && req.url === '/status') {\n    res.writeHead(200, { 'Content-Type': 'application/json' });\n    res.end(JSON.stringify({ status: 'ok' }));\n    return;\n  }\n\n  res.writeHead(404, { 'Content-Type': 'text/plain' });\n  res.end('Rota não encontrada');\n});\n\nserver.listen(3000, () => {\n  console.log('Servidor rodando na porta 3000');\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Por que Express\n\nRepare que, mesmo com apenas duas rotas, o código acima já ficou cheio de condicional aninhada, comparação manual de método e URL, e chamadas repetidas de writeHead e end. Em uma API real, com dezenas de rotas, esse estilo vira um pesadelo de manter.\n\nO Express resolve exatamente isso: oferece um sistema de rotas simples e declarativo, métodos prontos para montar a resposta (como res.send e res.json) e um jeito padronizado de organizar o código. Ele é minimalista de propósito: não impõe uma estrutura rígida de pastas nem decide por você como acessar banco de dados, autenticar usuários ou validar dados. Ele cuida bem do que é essencial (roteamento e middleware) e deixa o resto por conta do ecossistema de pacotes do npm.\n\nEssa filosofia minimalista, somada ao fato de ser o framework Node.js mais usado no mercado, com mais tutoriais, vagas de emprego e pacotes compatíveis, é o motivo de o Express ser o ponto de partida quase universal para quem aprende back-end com Node.js."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tarefa\",\"http nativo\",\"Express\"],[\"Definir uma rota\",\"Comparar manualmente req.method e req.url dentro de vários if\",\"app.get('/rota', handler)\"],[\"Responder em JSON\",\"JSON.stringify(objeto) e writeHead manual\",\"res.json(objeto)\"],[\"Identificar o método\",\"Comparação manual com req.method\",\"Implícito no nome do método: app.get, app.post...\"],[\"Organizar várias rotas\",\"Tudo manual, sem padrão definido\",\"Middlewares e Router prontos para uso\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Continuidade com o que você já sabe\n\nNada do que você aprendeu sobre HTTP muda aqui. O Express não substitui o protocolo, ele oferece uma API mais confortável para trabalhar com ele. O status 201 que você viu na trilha de Protocolos da Web continua sendo o status de recurso criado, só que agora você vai escrever res.status(201) em vez de montar o header manualmente. Os métodos GET, POST, PUT, PATCH e DELETE continuam com o mesmo significado, só que agora o Express oferece um método próprio do objeto app para cada um deles."
                    },
                    {
                        "type": "quote",
                        "value": "Um framework existe para eliminar trabalho repetitivo. O Express cuida do roteamento e da montagem de respostas HTTP para que você foque na regra de negócio da sua API, e não na reinvenção de mecanismos que toda aplicação web precisa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal vantagem de usar um framework como o Express em vez do módulo http nativo do Node.js para construir uma API?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Oferece rotas e respostas prontas, então você não reimplementa roteamento a cada projeto",
                                "isCorrect": true
                            },
                            {
                                "text": "É a única forma de aceitar requisições, pois o Node.js sozinho não abre servidor HTTP",
                                "isCorrect": false
                            },
                            {
                                "text": "O http nativo não tem como responder em JSON, apenas em texto puro",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui o protocolo HTTP por um protocolo próprio, mais rápido para APIs",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que descreve melhor a filosofia do Express como framework?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É um framework completo, já vem com banco de dados e autenticação prontos",
                                "isCorrect": false
                            },
                            {
                                "text": "É minimalista: cuida de rotas e middleware, deixa o resto para outros pacotes",
                                "isCorrect": true
                            },
                            {
                                "text": "Obriga toda aplicação a seguir uma estrutura fixa de pastas",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma linguagem própria, pensada para substituir o JavaScript no back-end",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe está decidindo entre escrever o servidor usando apenas o módulo http nativo do Node.js ou usar o Express, sabendo que o projeto vai crescer para dezenas de rotas nos próximos meses. Qual é a consequência mais provável de seguir apenas com o http nativo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não responde requisições GET, pois o http nativo só aceita o método POST",
                                "isCorrect": false
                            },
                            {
                                "text": "Não dá para escolher a porta do servidor sem o Express instalado",
                                "isCorrect": false
                            },
                            {
                                "text": "O código acumula condicionais de método e URL, difícil de manter",
                                "isCorrect": true
                            },
                            {
                                "text": "O Node.js passa a limitar o número de rotas sem um framework instalado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor usando apenas o módulo http nativo precisa, em cada rota, chamar manualmente res.writeHead com os headers corretos e depois res.end com o corpo já convertido para string. Qual recurso do Express foi criado justamente para eliminar essa repetição ao responder em JSON?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "app.use(), porque registra automaticamente o Content-Type de toda resposta",
                                "isCorrect": false
                            },
                            {
                                "text": "O objeto req, que formata e envia o corpo da resposta em JSON",
                                "isCorrect": false
                            },
                            {
                                "text": "require('http'), que precisa ser chamado dentro de cada rota do Express",
                                "isCorrect": false
                            },
                            {
                                "text": "res.json(), que define o Content-Type e serializa o objeto automaticamente",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que se diz que o Express é 'minimalista e não opinativo' (unopinionated) em comparação com outros frameworks web mais completos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque resolve bem rotas e middleware, mas não impõe banco de dados nem estrutura de pastas",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque não define nenhuma forma de criar rotas, e cada equipe implementa o roteamento do zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque obriga toda aplicação a usar um banco de dados específico para funcionar",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque foi descontinuado pela comunidade e substituído por frameworks mais completos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Iniciando um projeto Node.js com Express",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Verificando o ambiente\n\nPara seguir este módulo você precisa ter o Node.js instalado, o que já traz junto o npm (Node Package Manager), a ferramenta usada para instalar bibliotecas como o Express. Antes de criar o projeto, confirme no terminal que as duas ferramentas estão disponíveis. Qualquer versão do Node.js 18 ou superior funciona bem para este módulo."
                    },
                    {
                        "type": "code",
                        "value": "$ node -v\nv20.11.0\n\n$ npm -v\n10.2.4"
                    },
                    {
                        "type": "text",
                        "value": "## Criando o projeto com npm init\n\nCrie uma pasta para o projeto, entre nela e rode o comando npm init. Ele faz uma série de perguntas (nome, versão, descrição, ponto de entrada) e gera o arquivo package.json, que descreve o seu projeto Node.js: nome, dependências, scripts e outras configurações.\n\nPara pular as perguntas e aceitar os valores padrão direto, use a flag -y."
                    },
                    {
                        "type": "code",
                        "value": "$ mkdir tarefas-api\n$ cd tarefas-api\n$ npm init -y\n\n# gera o arquivo package.json:\n{\n  \"name\": \"tarefas-api\",\n  \"version\": \"1.0.0\",\n  \"description\": \"\",\n  \"main\": \"index.js\",\n  \"scripts\": {\n    \"test\": \"echo \\\"Error: no test specified\\\" && exit 1\"\n  },\n  \"keywords\": [],\n  \"author\": \"\",\n  \"license\": \"ISC\"\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Instalando o Express\n\nCom o package.json criado, instale o Express como dependência do projeto usando o npm install. O npm faz três coisas: baixa o pacote (e tudo que ele depende) para dentro da pasta node_modules, registra a dependência no package.json e grava as versões exatas instaladas no arquivo package-lock.json.\n\nA pasta node_modules pode ficar bem grande e nunca deve ser enviada para o controle de versão (ela entra no .gitignore); qualquer pessoa que clonar o projeto recria essa pasta rodando apenas npm install."
                    },
                    {
                        "type": "code",
                        "value": "$ npm install express\n\n# o package.json passa a ter uma nova seção de dependências:\n{\n  \"name\": \"tarefas-api\",\n  \"version\": \"1.0.0\",\n  \"description\": \"\",\n  \"main\": \"index.js\",\n  \"scripts\": {\n    \"test\": \"echo \\\"Error: no test specified\\\" && exit 1\"\n  },\n  \"dependencies\": {\n    \"express\": \"^5.2.1\"\n  },\n  \"keywords\": [],\n  \"author\": \"\",\n  \"license\": \"ISC\"\n}"
                    },
                    {
                        "type": "quote",
                        "value": "package.json é o documento de identidade do projeto: com ele, qualquer pessoa consegue instalar exatamente as mesmas dependências rodando apenas npm install, sem precisar copiar a pasta node_modules."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando cria o arquivo package.json de um projeto Node.js aceitando todos os valores padrão sem fazer perguntas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "npm install -y",
                                "isCorrect": false
                            },
                            {
                                "text": "npm init -y",
                                "isCorrect": true
                            },
                            {
                                "text": "npm start",
                                "isCorrect": false
                            },
                            {
                                "text": "node init",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar npm install express, onde o código-fonte do pacote Express fica efetivamente salvo dentro do projeto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dentro do próprio arquivo package.json",
                                "isCorrect": false
                            },
                            {
                                "text": "Em uma pasta oculta do sistema operacional, fora do projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "Na pasta node_modules",
                                "isCorrect": true
                            },
                            {
                                "text": "No arquivo .env do projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor clonou um projeto Express do GitHub, mas a pasta node_modules não foi enviada ao repositório (o que é o padrão, já que ela costuma estar no .gitignore). O que ele precisa rodar para instalar todas as dependências listadas no package.json antes de conseguir executar o projeto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "npm init -y",
                                "isCorrect": false
                            },
                            {
                                "text": "node app.js",
                                "isCorrect": false
                            },
                            {
                                "text": "npm publish",
                                "isCorrect": false
                            },
                            {
                                "text": "npm install",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a função do arquivo package-lock.json, gerado ou atualizado automaticamente após o npm install?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Registra as versões exatas de cada dependência, para instalações idênticas",
                                "isCorrect": true
                            },
                            {
                                "text": "Guarda variáveis de ambiente sensíveis do projeto, como senhas de banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui o package.json como arquivo principal de configuração do projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazena o código-fonte já compilado da aplicação, pronto para deploy",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar npm install express em um projeto que já tinha um package.json, o que muda dentro desse arquivo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O campo main é apagado, pois passa a apontar para dentro do Express",
                                "isCorrect": false
                            },
                            {
                                "text": "É adicionado o campo dependencies, com 'express' e a versão instalada",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome do projeto (campo name) é renomeado automaticamente para express",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada muda no package.json, a mudança fica restrita à pasta node_modules",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Subindo seu primeiro servidor Express",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Criando o arquivo principal\n\nCom o Express instalado, o próximo passo é criar o arquivo que vai dar vida ao servidor. Por convenção, muitos projetos chamam esse arquivo de index.js ou server.js. Crie um arquivo chamado server.js na raiz do projeto, no mesmo nível do package.json."
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\n\nconst app = express();\n\napp.listen(3000, () => {\n  console.log('Servidor rodando em http://localhost:3000');\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Entendendo cada linha\n\n- require('express') importa a função principal do pacote que você acabou de instalar\n- express() executa essa função e devolve a aplicação Express, guardada na variável app. É esse objeto app que você vai usar para declarar rotas, registrar middlewares e colocar o servidor no ar\n- app.listen(porta, callback) inicia o servidor HTTP e o deixa esperando (escutando) por conexões na porta informada. A função de callback é executada uma única vez, assim que o servidor termina de subir"
                    },
                    {
                        "type": "text",
                        "value": "## O que significa 'escutar numa porta'\n\nIsso conecta direto com o que você estudou na trilha de Protocolos da Web: um servidor precisa de um endereço (host) e uma porta para que os clientes saibam para onde enviar as requisições. Ao rodar app.listen(3000, ...), o sistema operacional reserva a porta 3000 para o seu processo Node.js, e qualquer requisição HTTP enviada para localhost:3000 chega até o Express, que decide o que fazer com ela.\n\nPortas abaixo de 1024 são consideradas privilegiadas e costumam exigir permissão especial do sistema operacional, por isso é comum usar portas como 3000, 4000, 5000 ou 8080 durante o desenvolvimento."
                    },
                    {
                        "type": "code",
                        "value": "$ node server.js\nServidor rodando em http://localhost:3000\n\n# o terminal fica ocupado, o processo continua rodando\n# para encerrar o servidor, use Ctrl+C"
                    },
                    {
                        "type": "code",
                        "value": "$ node server.js\nError: listen EADDRINUSE: address already in use :::3000\n    at Server.setupListenHandle (node:net:1740:16)\n    at listenInCluster (node:net:1788:12)\n    ...\n\n# solução: encerre o processo que já está usando a porta 3000,\n# ou troque a porta no app.listen, por exemplo para 3001"
                    },
                    {
                        "type": "quote",
                        "value": "app.listen abre a porta e mantém o processo Node.js vivo, esperando por requisições. Enquanto o terminal mostrar o processo rodando, o seu servidor está no ar e pronto para responder."
                    }
                ],
                "questions": [
                    {
                        "statement": "No trecho const app = express();, o que a variável app representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O arquivo package.json, carregado automaticamente ao iniciar o Express",
                                "isCorrect": false
                            },
                            {
                                "text": "A porta em que o servidor vai escutar por requisições",
                                "isCorrect": false
                            },
                            {
                                "text": "A aplicação Express, usada para declarar rotas e iniciar o servidor",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma cópia do módulo http nativo, criada pelo Express",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando executa o arquivo server.js e efetivamente coloca o servidor Express no ar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "npm init server.js",
                                "isCorrect": false
                            },
                            {
                                "text": "express server.js",
                                "isCorrect": false
                            },
                            {
                                "text": "npm install server.js",
                                "isCorrect": false
                            },
                            {
                                "text": "node server.js",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Ao rodar node server.js, o desenvolvedor recebe no terminal o erro Error: listen EADDRINUSE: address already in use :::3000. O que essa mensagem indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Outro processo já escuta na porta 3000; é preciso encerrá-lo ou trocar a porta",
                                "isCorrect": true
                            },
                            {
                                "text": "O Express não foi instalado corretamente, e por isso a porta não abre",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo server.js tem um erro de sintaxe que impede o servidor de subir",
                                "isCorrect": false
                            },
                            {
                                "text": "A porta 3000 é inválida e o sistema operacional nunca permite seu uso",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o papel da função de callback passada como segundo argumento em app.listen(3000, () => {...})?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É executada a cada requisição, antes de qualquer rota ser chamada",
                                "isCorrect": false
                            },
                            {
                                "text": "É executada uma única vez, quando o servidor termina de subir",
                                "isCorrect": true
                            },
                            {
                                "text": "Define qual rota o Express vai tratar primeiro, por ordem de prioridade",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui a necessidade de declarar rotas separadas com app.get",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que, durante o desenvolvimento local, é comum escolher portas como 3000, 4000 ou 8080 em vez de portas abaixo de 1024 (como a 80, usada por padrão em HTTP)?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o Express só permite configurar portas iguais ou acima da 3000 por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a porta 80 fica reservada exclusivamente para uso do Node.js",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque portas abaixo de 1024 exigem permissão especial do sistema operacional",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque portas abaixo de 1024 não têm suporte ao protocolo HTTP",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Sua primeira rota: recebendo requisições",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Uma aplicação Express sem rotas\n\nSe você rodar o servidor do jeito que ficou no final da aula anterior e abrir http://localhost:3000 no navegador, vai ver uma mensagem de erro parecida com 'Cannot GET /'. Isso acontece porque o Express está no ar, escutando a porta, mas ainda não sabe o que fazer quando chega uma requisição GET para o caminho /. Falta declarar uma rota."
                    },
                    {
                        "type": "text",
                        "value": "## Anatomia de uma rota no Express\n\nUma rota associa um método HTTP e um caminho a uma função handler, chamada sempre que uma requisição correspondente chega ao servidor. A sintaxe segue o padrão app.metodo(caminho, handler):"
                    },
                    {
                        "type": "code",
                        "value": "app.get('/', (req, res) => {\n  res.send('Olá, mundo!');\n});"
                    },
                    {
                        "type": "text",
                        "value": "Aqui, app.get registra uma rota para o método GET no caminho '/'. O handler recebe dois parâmetros, req (a requisição recebida) e res (a resposta que você constrói e envia). Dentro dele, res.send('Olá, mundo!') monta e envia a resposta para quem fez a requisição. Você vai estudar req e res em detalhe na próxima aula.\n\nPara cada método HTTP existe um método correspondente no objeto app. Nesta aula você vai usar apenas app.get, porque o foco é ler dados; a partir do próximo módulo, quando a API passar a criar, atualizar e remover tarefas, os outros métodos entram em cena."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método HTTP\",\"Método no Express\"],[\"GET\",\"app.get(caminho, handler)\"],[\"POST\",\"app.post(caminho, handler)\"],[\"PUT\",\"app.put(caminho, handler)\"],[\"PATCH\",\"app.patch(caminho, handler)\"],[\"DELETE\",\"app.delete(caminho, handler)\"]]"
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.send('Olá, mundo!');\n});\n\napp.get('/sobre', (req, res) => {\n  res.send('API de tarefas construída com Express.');\n});\n\napp.get('/tarefas', (req, res) => {\n  res.json([\n    { id: 1, titulo: 'Estudar Express' },\n    { id: 2, titulo: 'Criar a primeira rota' }\n  ]);\n});\n\napp.listen(3000, () => {\n  console.log('Servidor rodando em http://localhost:3000');\n});"
                    },
                    {
                        "type": "quote",
                        "value": "Uma rota é a combinação de método HTTP, caminho e uma função handler. É essa combinação que o Express usa para decidir qual código executar a cada requisição que chega."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual método do objeto app é usado para declarar uma rota que responde a requisições HTTP GET?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "app.route",
                                "isCorrect": false
                            },
                            {
                                "text": "app.request",
                                "isCorrect": false
                            },
                            {
                                "text": "app.listen",
                                "isCorrect": false
                            },
                            {
                                "text": "app.get",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Quais são, na ordem correta, os dois parâmetros que toda função handler de rota do Express recebe?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "req e res",
                                "isCorrect": true
                            },
                            {
                                "text": "res e req",
                                "isCorrect": false
                            },
                            {
                                "text": "app e port",
                                "isCorrect": false
                            },
                            {
                                "text": "error e next",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação Express foi iniciada com app.listen, mas ainda não tem nenhuma rota declarada. Ao acessar http://localhost:3000 no navegador, o que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O navegador fica esperando para sempre, porque o Express não responde sem rota",
                                "isCorrect": false
                            },
                            {
                                "text": "O navegador recebe um erro do Express, tipo 'Cannot GET /', pois nenhuma rota casa",
                                "isCorrect": true
                            },
                            {
                                "text": "O processo Node.js encerra sozinho, já que não há rota para atender",
                                "isCorrect": false
                            },
                            {
                                "text": "O Express cria uma rota padrão, respondendo automaticamente com status 200",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considere este trecho:\n\napp.get('/', (req, res) => { res.send('Home'); });\napp.get('/tarefas', (req, res) => { res.json([]); });\napp.get('/sobre', (req, res) => { res.send('Sobre'); });\n\nQual handler é executado quando chega uma requisição GET para /tarefas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O da primeira rota, pois o Express sempre executa a rota declarada primeiro",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum, porque só pode existir uma única rota GET em cada aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "O da rota app.get('/tarefas', ...), que responde com res.json([])",
                                "isCorrect": true
                            },
                            {
                                "text": "Todos os três handlers, um após o outro, na ordem em que foram declarados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor declara, nessa ordem, duas rotas para o mesmo caminho: app.get('/tarefas', handlerA) e, logo depois, app.get('/tarefas', handlerB). Ao receber uma requisição GET para /tarefas, o que o Express faz?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Executa apenas handlerB, pois a última rota declarada sobrescreve a anterior",
                                "isCorrect": false
                            },
                            {
                                "text": "Executa handlerA e depois handlerB, encadeados como middlewares",
                                "isCorrect": false
                            },
                            {
                                "text": "Lança um erro de rota duplicada e encerra o processo imediatamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Executa apenas handlerA; o Express para na primeira rota correspondente",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Os objetos req e res: testando no navegador e no curl",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## req e res: os dois objetos que toda rota recebe\n\nToda função handler que você registra com app.get (ou qualquer outro método) recebe automaticamente dois parâmetros: req e res. São esses dois objetos que carregam tudo o que você precisa para tratar uma requisição e devolver uma resposta. Nesta aula você vai conhecer os dois de perto e, por fim, aprender a testar o servidor de verdade, tanto pelo navegador quanto pelo terminal."
                    },
                    {
                        "type": "text",
                        "value": "## O objeto req (request)\n\nreq representa a requisição que chegou até o seu servidor. Ele carrega tudo o que o cliente enviou. Alguns dos dados mais usados nesta fase são:\n\n- req.method: o método HTTP da requisição ('GET', 'POST' etc.)\n- req.url: o caminho e a query string da requisição\n- req.headers: um objeto com todos os headers enviados pelo cliente\n- req.path: apenas o caminho da requisição, sem a query string\n\nMais adiante, no próximo módulo, você vai usar também req.params (para capturar partes dinâmicas da URL) e req.query (para ler a query string já separada em um objeto). Por enquanto, o importante é entender que req é sempre a porta de entrada dos dados da requisição."
                    },
                    {
                        "type": "code",
                        "value": "app.get('/tarefas', (req, res) => {\n  console.log(req.method);\n  console.log(req.url);\n  console.log(req.headers['user-agent']);\n\n  res.status(200).json([\n    { id: 1, titulo: 'Estudar Express' },\n    { id: 2, titulo: 'Criar a primeira rota' }\n  ]);\n});\n\napp.get('/tarefas/inexistente', (req, res) => {\n  res.status(404).send('Recurso não encontrado');\n});"
                    },
                    {
                        "type": "text",
                        "value": "## O objeto res (response)\n\nres representa a resposta que você está construindo para devolver ao cliente. No exemplo acima aparecem os métodos mais usados:\n\n- res.send(valor): envia a resposta. Se você mandar uma string, o Content-Type vira text/html; se mandar um objeto ou array, o Express detecta e converte para JSON automaticamente\n- res.json(valor): sempre serializa o valor como JSON e já define o header Content-Type como application/json, sendo a forma mais explícita e recomendada para respostas de API\n- res.status(codigo): define o status code da resposta. Repare que ele é encadeado antes do send ou do json, como em res.status(404).send('Recurso não encontrado')\n\nSe você não chamar res.status, o Express usa 200 como padrão em respostas bem-sucedidas."
                    },
                    {
                        "type": "text",
                        "value": "## Testando pelo navegador e pelo curl\n\nCom o servidor rodando (node server.js), você já pode testar. O navegador é prático, mas só faz requisições GET quando você digita um endereço na barra de endereços, e não mostra os headers nem o status code de forma direta, apenas o corpo da resposta.\n\nO curl, executado no terminal, é mais completo para testar uma API: funciona com qualquer método HTTP (isso vai importar de verdade a partir do próximo módulo, quando você criar rotas POST, PUT e DELETE) e permite ver a resposta completa, incluindo status code e headers, com a flag -i."
                    },
                    {
                        "type": "code",
                        "value": "$ curl http://localhost:3000/tarefas\n[{\"id\":1,\"titulo\":\"Estudar Express\"},{\"id\":2,\"titulo\":\"Criar a primeira rota\"}]\n\n$ curl -i http://localhost:3000/tarefas/inexistente\nHTTP/1.1 404 Not Found\nContent-Type: text/html; charset=utf-8\nContent-Length: 23\n... (outros headers omitidos)\n\nRecurso não encontrado"
                    },
                    {
                        "type": "quote",
                        "value": "req traz o que o cliente enviou, res é o que você constrói para responder. Dominar esses dois objetos é o alicerce de qualquer rota Express, e testar pelo navegador e pelo curl é o jeito mais rápido de confirmar que o comportamento é o esperado antes de seguir em frente."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual objeto, recebido pela função handler de uma rota Express, representa a requisição enviada pelo cliente (método, URL, headers)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "req",
                                "isCorrect": true
                            },
                            {
                                "text": "res",
                                "isCorrect": false
                            },
                            {
                                "text": "app",
                                "isCorrect": false
                            },
                            {
                                "text": "next",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual método do objeto res é o mais indicado para garantir, de forma explícita, que a resposta será enviada como JSON?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "res.status()",
                                "isCorrect": false
                            },
                            {
                                "text": "res.json()",
                                "isCorrect": true
                            },
                            {
                                "text": "app.get()",
                                "isCorrect": false
                            },
                            {
                                "text": "req.headers()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um handler de rota precisa responder com o status 404 e uma mensagem de texto simples avisando que o recurso não foi encontrado. Qual chamada faz exatamente isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "res.send(404, 'Recurso não encontrado')",
                                "isCorrect": false
                            },
                            {
                                "text": "req.status(404).send('Recurso não encontrado')",
                                "isCorrect": false
                            },
                            {
                                "text": "res.status(404).send('Recurso não encontrado')",
                                "isCorrect": true
                            },
                            {
                                "text": "res.404.send('Recurso não encontrado')",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor quer testar rapidamente, direto do terminal, o status code e os headers de resposta de uma rota GET, sem abrir o navegador. Qual comando permite isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "npm test http://localhost:3000/tarefas",
                                "isCorrect": false
                            },
                            {
                                "text": "node http://localhost:3000/tarefas",
                                "isCorrect": false
                            },
                            {
                                "text": "curl --only-headers http://localhost:3000/tarefas",
                                "isCorrect": false
                            },
                            {
                                "text": "curl -i http://localhost:3000/tarefas",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que testar uma API apenas pelo navegador, digitando o endereço na barra de endereços, é limitado quando comparado ao curl?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o navegador só envia GET, sem testar outros métodos nem ver headers direto",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o navegador não consegue exibir nenhuma resposta em formato JSON",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o curl é a única ferramenta capaz de se conectar à porta 3000",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o navegador só funciona quando o Express está configurado com certificado HTTPS",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Rotas e recursos",
        "aulas": [
            {
                "titulo": "Rotas para cada método HTTP",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Rotas para cada método HTTP\n\nNo módulo anterior você criou seu primeiro servidor Express e uma única rota: um `app.get('/', ...)` que respondia com um texto simples. Isso já prova que o servidor funciona, mas uma API de verdade responde a muito mais do que uma rota GET solta.\n\nNa trilha de Protocolos da Web você viu que o HTTP define vários métodos (verbos), e que cada um comunica uma intenção diferente: GET para ler, POST para criar, PUT e PATCH para atualizar, DELETE para remover. O Express deixa isso literal no código: existe um método do objeto `app` para cada verbo HTTP.\n\nNesta aula você vai aprender a definir rotas para os métodos GET, POST, PUT, PATCH e DELETE, e entender como o Express decide qual rota atende cada requisição."
                    },
                    {
                        "type": "text",
                        "value": "## Um método do Express para cada verbo HTTP\n\nO padrão é sempre o mesmo: `app.<metodo>(caminho, handler)`. Você já usou `app.get`; os outros seguem exatamente a mesma lógica, só trocando o nome do método."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método HTTP\",\"Método no Express\",\"Uso típico\"],[\"GET\",\"app.get\",\"Buscar ou listar um recurso, sem alterar nada\"],[\"POST\",\"app.post\",\"Criar um novo recurso\"],[\"PUT\",\"app.put\",\"Atualizar um recurso por completo\"],[\"PATCH\",\"app.patch\",\"Atualizar parte de um recurso\"],[\"DELETE\",\"app.delete\",\"Remover um recurso\"]]"
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\nconst app = express();\n\napp.use(express.json());\n\nlet tarefas = [\n  { id: 1, titulo: 'Estudar Express', completa: false },\n  { id: 2, titulo: 'Fazer compras', completa: true },\n];\n\napp.get('/tarefas', (req, res) => {\n  res.status(200).json(tarefas);\n});\n\napp.post('/tarefas', (req, res) => {\n  const novaTarefa = {\n    id: tarefas.length + 1,\n    titulo: req.body.titulo,\n    completa: false,\n  };\n  tarefas.push(novaTarefa);\n  res.status(201).json(novaTarefa);\n});\n\napp.listen(3000, () => {\n  console.log('Servidor rodando na porta 3000');\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Por que `app.use(express.json())`?\n\nRepare na linha `app.use(express.json())` logo no início. Ela liga um middleware embutido do Express que sabe interpretar um corpo de requisição no formato JSON e disponibilizar o resultado em `req.body`. Sem essa linha, `req.body` chega `undefined` mesmo que o cliente tenha enviado dados certinhos. Middleware é assunto do próximo módulo; por enquanto, basta saber que essa linha é obrigatória sempre que uma rota for ler `req.body`.\n\nRepare também que GET e POST em `/tarefas` não precisam saber qual tarefa: GET lista todas, POST cria uma nova. Já PUT, PATCH e DELETE agem sobre uma tarefa específica, então a rota precisa dizer qual id está sendo afetado. Isso é o assunto da próxima aula: parâmetros de rota."
                    },
                    {
                        "type": "code",
                        "value": "curl http://localhost:3000/tarefas\n\ncurl -X POST http://localhost:3000/tarefas -H \"Content-Type: application/json\" -d '{\"titulo\":\"Ler um capitulo\"}'"
                    },
                    {
                        "type": "quote",
                        "value": "Uma rota no Express é a combinação de um método HTTP e um caminho. GET, POST, PUT, PATCH e DELETE têm cada um seu método correspondente (`app.get`, `app.post`, `app.put`, `app.patch`, `app.delete`), e o Express só executa o handler quando os dois baterem: método e caminho."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o método HTTP mais indicado para criar um novo recurso em uma API REST?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "GET",
                                "isCorrect": false
                            },
                            {
                                "text": "POST",
                                "isCorrect": true
                            },
                            {
                                "text": "DELETE",
                                "isCorrect": false
                            },
                            {
                                "text": "PUT",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Express, qual é a forma correta de definir uma rota que responde a requisições GET no caminho /tarefas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "app.get('/tarefas', handler)",
                                "isCorrect": true
                            },
                            {
                                "text": "app.route.get('/tarefas', handler)",
                                "isCorrect": false
                            },
                            {
                                "text": "app.get(handler, '/tarefas')",
                                "isCorrect": false
                            },
                            {
                                "text": "app.listen('/tarefas', handler)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação define apenas app.get('/tarefas', ...) e app.post('/tarefas', ...). Um cliente envia uma requisição DELETE para /tarefas. O que o Express faz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Executa o handler da rota GET, pois é a primeira rota declarada",
                                "isCorrect": false
                            },
                            {
                                "text": "Executa o handler da rota POST, já que ambos os métodos convivem no mesmo caminho",
                                "isCorrect": false
                            },
                            {
                                "text": "Responde 404, porque nenhuma rota casa com o método DELETE nesse caminho",
                                "isCorrect": true
                            },
                            {
                                "text": "Trava o servidor, porque o método DELETE nunca foi importado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API precisa permitir que o cliente reenvie todos os campos de uma tarefa de uma vez, substituindo o registro por completo. Qual método HTTP é o mais adequado para essa rota?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "PATCH",
                                "isCorrect": false
                            },
                            {
                                "text": "POST",
                                "isCorrect": false
                            },
                            {
                                "text": "PUT",
                                "isCorrect": true
                            },
                            {
                                "text": "GET",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Foi definida a rota app.all('/tarefas/:id', function (req, res) { res.send('ok'); }). O que acontece quando um cliente faz uma requisição PATCH para /tarefas/5?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Express responde 404, porque app.all só cobre GET e POST",
                                "isCorrect": false
                            },
                            {
                                "text": "O handler roda normalmente, porque app.all responde a qualquer método HTTP naquele caminho",
                                "isCorrect": true
                            },
                            {
                                "text": "O Express responde 405 (Method Not Allowed), porque PATCH não foi declarado explicitamente",
                                "isCorrect": false
                            },
                            {
                                "text": "A aplicação não inicia, porque app.all não pode ser combinado com parâmetro de rota",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Parâmetros de rota com req.params",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Parâmetros de rota com req.params\n\nNa aula anterior, `GET /tarefas` e `POST /tarefas` funcionaram sem precisar saber qual tarefa específica estava em jogo: um lista tudo, o outro cria uma nova. Mas como você busca, atualiza ou remove a tarefa de id 7, especificamente?\n\nA resposta é um parâmetro de rota: um trecho do caminho que funciona como uma variável, escrito com dois pontos na frente, como em `/tarefas/:id`. O Express captura o valor real que o cliente mandou na URL e entrega pronto dentro de `req.params`."
                    },
                    {
                        "type": "text",
                        "value": "## Como declarar e ler um parâmetro\n\nBasta prefixar o trecho da URL com `:`. O nome que vem depois dos dois pontos vira a chave correspondente dentro de `req.params`."
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\nconst app = express();\n\nlet tarefas = [\n  { id: 1, titulo: 'Estudar Express', completa: false },\n  { id: 2, titulo: 'Fazer compras', completa: true },\n];\n\napp.get('/tarefas/:id', (req, res) => {\n  console.log(req.params); // { id: '1' }, por exemplo\n\n  const id = Number(req.params.id);\n  const tarefa = tarefas.find((t) => t.id === id);\n\n  if (!tarefa) {\n    return res.status(404).json({ erro: 'Tarefa nao encontrada' });\n  }\n\n  res.status(200).json(tarefa);\n});\n\napp.listen(3000);"
                    },
                    {
                        "type": "text",
                        "value": "## Duas pegadinhas comuns com parâmetros de rota\n\n1. req.params sempre entrega string. Não importa o que o cliente digitou na URL, o Express entrega o valor como texto. Em `/tarefas/1`, `req.params.id` é a string '1', não o número 1. Comparar direto com === contra um número falha sempre, porque tipos diferentes nunca são iguais com esse operador. Por isso o exemplo anterior usa `Number(req.params.id)` antes de comparar.\n\n2. A ordem das rotas importa. O Express testa as rotas na ordem em que foram definidas e usa a primeira que casar. Se `app.get('/tarefas/:id', ...)` for definida antes de `app.get('/tarefas/recentes', ...)`, uma requisição para `/tarefas/recentes` cai no handler de `:id`, tratando `recentes` como se fosse o valor do id. A regra prática: rotas fixas e mais específicas (`/tarefas/recentes`) vêm antes de rotas com parâmetro (`/tarefas/:id`)."
                    },
                    {
                        "type": "code",
                        "value": "app.put('/usuarios/:usuarioId/tarefas/:tarefaId', (req, res) => {\n  const { usuarioId, tarefaId } = req.params;\n  res.status(200).json({\n    mensagem: 'Atualizando a tarefa ' + tarefaId + ' do usuario ' + usuarioId,\n  });\n});"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Rota definida\",\"URL acessada\",\"req.params resultante\"],[\"/tarefas/:id\",\"/tarefas/7\",\"{ id: '7' }\"],[\"/usuarios/:usuarioId/tarefas/:tarefaId\",\"/usuarios/3/tarefas/9\",\"{ usuarioId: '3', tarefaId: '9' }\"],[\"/tarefas/recentes\",\"/tarefas/recentes\",\"{ } (nao ha parametro, o trecho e fixo)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um parâmetro de rota identifica qual recurso da coleção você quer. Ele sempre chega como string dentro de `req.params`, e a ordem em que as rotas são definidas no arquivo decide qual handler responde primeiro quando existe ambiguidade entre uma rota fixa e uma rota com parâmetro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na rota app.get('/tarefas/:id', (req, res) => { ... }), como você acessa dentro do handler o valor do parâmetro id que veio na URL?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "req.params.id",
                                "isCorrect": true
                            },
                            {
                                "text": "req.query.id",
                                "isCorrect": false
                            },
                            {
                                "text": "req.body.id",
                                "isCorrect": false
                            },
                            {
                                "text": "req.id",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual definição de rota Express captura corretamente um id variável na URL para buscar uma tarefa específica?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "app.get('/tarefas/id', handler)",
                                "isCorrect": false
                            },
                            {
                                "text": "app.get('/tarefas/{id}', handler)",
                                "isCorrect": false
                            },
                            {
                                "text": "app.get('/tarefas/:id', handler)",
                                "isCorrect": true
                            },
                            {
                                "text": "app.get('/tarefas/?id', handler)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de app.get('/tarefas/:id', ...), um desenvolvedor escreveu: if (req.params.id === 5). Mesmo acessando /tarefas/5, essa condição nunca é verdadeira. Qual é o motivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "req.params.id vem como string '5'; === compara tipo também, e falha",
                                "isCorrect": true
                            },
                            {
                                "text": "O parâmetro deveria se chamar req.params['5'], e não req.params.id",
                                "isCorrect": false
                            },
                            {
                                "text": "req.params só é preenchido dentro de rotas que usam o método POST",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltou declarar app.use(express.params()) antes de definir essa rota",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para representar uma rota que acessa a tarefa 12 do usuário 7, como em /usuarios/7/tarefas/12, qual definição de rota está correta no Express?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "app.get('/usuarios/usuarioId/tarefas/tarefaId', handler)",
                                "isCorrect": false
                            },
                            {
                                "text": "app.get('/usuarios/:id/tarefas/:id', handler)",
                                "isCorrect": false
                            },
                            {
                                "text": "app.get('/usuarios/:usuarioId/tarefas/:tarefaId', handler)",
                                "isCorrect": true
                            },
                            {
                                "text": "app.get('/usuarios/:usuarioId, tarefas/:tarefaId', handler)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um arquivo de rotas, app.get('/tarefas/:id', buscarPorId) foi definida antes de app.get('/tarefas/recentes', listarRecentes). O que acontece quando um cliente acessa /tarefas/recentes?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As duas rotas rodam em sequência, pois o Express nunca para na primeira rota que casa",
                                "isCorrect": false
                            },
                            {
                                "text": "O Express detecta que recentes não é numérico e pula para listarRecentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Cai no handler buscarPorId, tratando recentes como req.params.id, pois casa primeiro",
                                "isCorrect": true
                            },
                            {
                                "text": "O Express recusa iniciar o servidor, por causa da rota ambígua declarada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Query strings com req.query",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Query strings com req.query\n\nNa trilha de Protocolos da Web você já viu a query string: aquele trecho da URL depois do `?`, com pares chave e valor separados por `&`, como em `/tarefas?completa=true&ordenar=titulo`. Agora é a hora de usar isso dentro de uma rota Express.\n\nEnquanto um parâmetro de rota (`req.params`) identifica qual recurso você quer (a tarefa de id 7, por exemplo), a query string serve para modificar como uma coleção é devolvida: filtrar, ordenar, paginar. O Express entrega tudo isso pronto dentro de `req.query`."
                    },
                    {
                        "type": "text",
                        "value": "## Lendo a query string com req.query\n\nPara a URL `/tarefas?completa=true`, dentro da rota `app.get('/tarefas', ...)`, o Express monta automaticamente o objeto `req.query` com `{ completa: 'true' }`. Diferente do parâmetro de rota, você não declara nada no caminho: qualquer chave que vier depois do `?` aparece em `req.query`."
                    },
                    {
                        "type": "code",
                        "value": "app.get('/tarefas', (req, res) => {\n  const { completa } = req.query;\n\n  if (completa === undefined) {\n    return res.status(200).json(tarefas);\n  }\n\n  const filtradas = tarefas.filter((t) => t.completa === (completa === 'true'));\n  res.status(200).json(filtradas);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Query string é sempre opcional, e sempre string\n\nAssim como em `req.params`, todo valor de `req.query` chega como string. E como o cliente não é obrigado a mandar nenhuma chave, qualquer uma delas pode simplesmente não existir: nesse caso, `req.query.ordenar` vale `undefined`, não uma string vazia. É por isso que o exemplo anterior testa `completa === undefined` antes de filtrar: sem nenhuma query string, a rota devolve tudo.\n\nNa prática, isso significa que toda vez que você usa um valor de `req.query` para algo além de exibir na tela (comparar, fazer conta, paginar), normalmente precisa checar se o valor veio, converter para o tipo certo, e definir um padrão razoável quando fizer sentido."
                    },
                    {
                        "type": "code",
                        "value": "app.get('/tarefas', (req, res) => {\n  const pagina = Number(req.query.pagina) || 1;\n  const limite = Number(req.query.limite) || 10;\n\n  const inicio = (pagina - 1) * limite;\n  const fim = inicio + limite;\n\n  res.status(200).json({\n    pagina,\n    limite,\n    total: tarefas.length,\n    dados: tarefas.slice(inicio, fim),\n  });\n});\n\n// GET /tarefas?pagina=2&limite=5"
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"req.params\",\"req.query\"],[\"Onde fica na URL\",\"Faz parte do caminho: /tarefas/:id\",\"Vem depois do ?: /tarefas?completa=true\"],[\"Para que serve\",\"Identificar um recurso especifico\",\"Filtrar, ordenar ou paginar uma colecao\"],[\"E obrigatorio na rota?\",\"Sim, se a rota declara :id, o valor tem que vir\",\"Nao, o cliente pode simplesmente nao mandar\"],[\"Tipo do valor\",\"Sempre string\",\"Sempre string\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "req.params identifica qual recurso (é parte do caminho, e sempre presente quando a rota casa). req.query ajusta como a coleção é devolvida, como filtro, ordenação ou paginação, é sempre opcional, e assim como req.params, chega sempre como string."
                    }
                ],
                "questions": [
                    {
                        "statement": "Para a requisição GET /tarefas?completa=true, como você acessa dentro da rota o valor enviado na query string?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "req.query.completa",
                                "isCorrect": true
                            },
                            {
                                "text": "req.params.completa",
                                "isCorrect": false
                            },
                            {
                                "text": "req.body.completa",
                                "isCorrect": false
                            },
                            {
                                "text": "req.completa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual URL usa corretamente uma query string para filtrar as tarefas concluídas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "/tarefas/completa=true",
                                "isCorrect": false
                            },
                            {
                                "text": "/tarefas?completa=true",
                                "isCorrect": true
                            },
                            {
                                "text": "/tarefas:completa=true",
                                "isCorrect": false
                            },
                            {
                                "text": "/tarefas#completa=true",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota faz if (req.query.completa === true) para filtrar tarefas, mas o filtro nunca funciona, mesmo acessando /tarefas?completa=true. Qual é o motivo mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A query string deveria vir antes do caminho, como em ?completa=true/tarefas",
                                "isCorrect": false
                            },
                            {
                                "text": "req.query entrega tudo como string; é preciso comparar com 'true', não booleano",
                                "isCorrect": true
                            },
                            {
                                "text": "A chave deveria se chamar req.query.completo, no masculino, não completa",
                                "isCorrect": false
                            },
                            {
                                "text": "req.query só é preenchido em rotas que usam o método POST, não GET",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente faz uma requisição para /tarefas, sem nada depois do caminho. Dentro da rota, qual é o valor de req.query.ordenar, já que essa chave nunca foi enviada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "null",
                                "isCorrect": false
                            },
                            {
                                "text": "0",
                                "isCorrect": false
                            },
                            {
                                "text": "uma string vazia",
                                "isCorrect": false
                            },
                            {
                                "text": "undefined",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Você quer implementar paginação em GET /tarefas usando ?pagina e ?limite, com padrão de página 1 e limite 10 quando o cliente não informar nada. Qual trecho faz isso corretamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "const pagina = Number(req.params.pagina) || 1; const limite = Number(req.params.limite) || 10;",
                                "isCorrect": false
                            },
                            {
                                "text": "const pagina = String(req.query.pagina) || 1; const limite = String(req.query.limite) || 10;",
                                "isCorrect": false
                            },
                            {
                                "text": "const pagina = Number(req.query.pagina) || 1; const limite = Number(req.query.limite) || 10;",
                                "isCorrect": true
                            },
                            {
                                "text": "const pagina = Number(req.query.pagina) ?? 10; const limite = Number(req.query.limite) ?? 1;",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Mapeando um recurso REST completo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Mapeando um recurso REST completo\n\nVocê já sabe definir rotas por método, capturar parâmetros de rota e ler query strings. Chegou a hora de juntar tudo e mapear um recurso inteiro (as tarefas) em um conjunto de rotas consistente, seguindo as convenções REST que você conheceu na trilha de Protocolos da Web.\n\nA ideia central do REST é simples: a URL identifica o que (um recurso, geralmente um substantivo no plural, como `/tarefas`), e o método HTTP identifica a ação (GET, POST, PUT, PATCH, DELETE). O verbo da ação não deveria aparecer na URL."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ação\",\"Método\",\"Rota\",\"Status de sucesso\"],[\"Listar todas as tarefas\",\"GET\",\"/tarefas\",\"200\"],[\"Buscar uma tarefa pelo id\",\"GET\",\"/tarefas/:id\",\"200\"],[\"Criar uma nova tarefa\",\"POST\",\"/tarefas\",\"201\"],[\"Atualizar uma tarefa por completo\",\"PUT\",\"/tarefas/:id\",\"200\"],[\"Atualizar parte de uma tarefa\",\"PATCH\",\"/tarefas/:id\",\"200\"],[\"Remover uma tarefa\",\"DELETE\",\"/tarefas/:id\",\"204\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Cada ação tem um status de sucesso esperado\n\nLembra do status 201 que você estudou na trilha de Protocolos da Web, indicando que um recurso foi criado? Aqui ele vira código de verdade: `res.status(201).json(novaTarefa)`. Da mesma forma, uma remoção bem sucedida sem corpo de resposta vira `res.status(204).end()`, e uma busca ou atualização que deu certo vira `res.status(200).json(...)`."
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\nconst app = express();\n\napp.use(express.json());\n\nlet tarefas = [\n  { id: 1, titulo: 'Estudar Express', completa: false },\n  { id: 2, titulo: 'Fazer compras', completa: true },\n];\nlet proximoId = 3;\n\napp.get('/tarefas', (req, res) => {\n  const { completa } = req.query;\n\n  if (completa === undefined) {\n    return res.status(200).json(tarefas);\n  }\n\n  const filtradas = tarefas.filter((t) => t.completa === (completa === 'true'));\n  res.status(200).json(filtradas);\n});\n\napp.get('/tarefas/:id', (req, res) => {\n  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));\n  if (!tarefa) return res.status(404).json({ erro: 'Tarefa nao encontrada' });\n  res.status(200).json(tarefa);\n});\n\napp.post('/tarefas', (req, res) => {\n  const novaTarefa = { id: proximoId++, titulo: req.body.titulo, completa: false };\n  tarefas.push(novaTarefa);\n  res.status(201).json(novaTarefa);\n});\n\napp.put('/tarefas/:id', (req, res) => {\n  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));\n  if (!tarefa) return res.status(404).json({ erro: 'Tarefa nao encontrada' });\n\n  tarefa.titulo = req.body.titulo;\n  tarefa.completa = req.body.completa;\n  res.status(200).json(tarefa);\n});\n\napp.patch('/tarefas/:id', (req, res) => {\n  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));\n  if (!tarefa) return res.status(404).json({ erro: 'Tarefa nao encontrada' });\n\n  Object.assign(tarefa, req.body);\n  res.status(200).json(tarefa);\n});\n\napp.delete('/tarefas/:id', (req, res) => {\n  const indice = tarefas.findIndex((t) => t.id === Number(req.params.id));\n  if (indice === -1) return res.status(404).json({ erro: 'Tarefa nao encontrada' });\n\n  tarefas.splice(indice, 1);\n  res.status(204).end();\n});\n\napp.listen(3000, () => {\n  console.log('API de tarefas rodando na porta 3000');\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Por que PUT substitui tudo e PATCH atualiza só uma parte\n\nRepare na diferença entre as duas rotas de atualização no código acima: o PUT reescreve `titulo` e `completa` inteiros, então se o cliente esquecer de mandar `completa`, o valor vira `undefined`. Já o PATCH, com `Object.assign(tarefa, req.body)`, sobrescreve só as chaves que vieram no corpo da requisição, preservando o resto. Essa diferença de comportamento é exatamente o que os dois métodos prometem: substituição completa contra atualização parcial."
                    },
                    {
                        "type": "text",
                        "value": "## Erros comuns ao desenhar rotas REST\n\n- Colocar o verbo na URL, como /criarTarefa ou /tarefas/deletar/5: o método HTTP já diz a ação, repetir isso na URL é redundante e foge da convenção.\n- Misturar singular e plural entre as rotas do mesmo recurso, como /tarefa em um lugar e /tarefas em outro.\n- Ignorar o status code e devolver sempre 200, mesmo quando o recurso não existe ou acabou de ser criado.\n- Usar GET para causar um efeito colateral, como excluir um registro, quando uma requisição GET deveria ser segura para repetir sem consequência."
                    },
                    {
                        "type": "quote",
                        "value": "Um recurso REST vira um pequeno conjunto de rotas previsível: a URL, no plural e sem verbos, diz qual recurso; o método HTTP diz a ação; e o status da resposta confirma o que aconteceu. Esse padrão (GET lista e busca, POST cria, PUT e PATCH atualizam, DELETE remove) se repete em praticamente toda API REST que você vai encontrar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Seguindo as convenções REST desta aula, qual é a rota e o método usados para listar todas as tarefas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "POST /tarefas",
                                "isCorrect": false
                            },
                            {
                                "text": "GET /tarefas",
                                "isCorrect": true
                            },
                            {
                                "text": "GET /tarefas/listar",
                                "isCorrect": false
                            },
                            {
                                "text": "PUT /tarefas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a combinação correta de método e rota para remover a tarefa de id 8?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "GET /tarefas/8/remover",
                                "isCorrect": false
                            },
                            {
                                "text": "POST /tarefas/8/deletar",
                                "isCorrect": false
                            },
                            {
                                "text": "DELETE /tarefas?id=8",
                                "isCorrect": false
                            },
                            {
                                "text": "DELETE /tarefas/8",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Depois de criar uma nova tarefa com sucesso via POST /tarefas, qual é o status HTTP mais adequado para a resposta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "200",
                                "isCorrect": false
                            },
                            {
                                "text": "201",
                                "isCorrect": true
                            },
                            {
                                "text": "204",
                                "isCorrect": false
                            },
                            {
                                "text": "301",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente faz GET /tarefas/999, mas não existe nenhuma tarefa com esse id no array em memória. O que a rota deve responder?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Status 500, porque é um erro do servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Status 400, porque o cliente enviou um id inválido",
                                "isCorrect": false
                            },
                            {
                                "text": "Status 200, com um corpo vazio",
                                "isCorrect": false
                            },
                            {
                                "text": "Status 404, indicando que a tarefa não foi encontrada",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma API usa POST /tarefas/deletar/7 para remover tarefas e GET /tarefas/consultar/7 para buscar uma tarefa. Sob a ótica das convenções REST vistas nesta aula, qual é o principal problema desse desenho?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As rotas usam :id fixo no caminho, o que é sintaxe inválida no Express",
                                "isCorrect": false
                            },
                            {
                                "text": "O recurso deveria estar no singular (/tarefa), e não no plural (/tarefas)",
                                "isCorrect": false
                            },
                            {
                                "text": "O verbo está na URL (deletar, consultar) em vez do método HTTP (DELETE, GET)",
                                "isCorrect": true
                            },
                            {
                                "text": "Não existe problema; essa é inclusive a forma recomendada pelo próprio Express",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Organizando rotas com express.Router",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Organizando rotas com express.Router\n\nO arquivo da aula anterior já tem seis rotas só para o recurso de tarefas. Assim que você adicionar usuários, comentários, categorias, esse arquivo único vira um problema: fica difícil de navegar, difícil de revisar, e qualquer pessoa do time que mexer nele esbarra no código de todo mundo.\n\nO Express resolve isso com `express.Router()`: uma forma de agrupar rotas relacionadas em um mini aplicativo, que depois se conecta na aplicação principal. Nesta aula você vai separar as rotas de tarefas em um arquivo próprio, o padrão que qualquer projeto Express de verdade usa."
                    },
                    {
                        "type": "text",
                        "value": "## Criando um Router\n\nUm Router se comporta como o `app`: tem `.get`, `.post`, `.put`, `.patch`, `.delete`, tudo igual. A diferença é que ele não escuta porta nenhuma sozinho, ele só agrupa rotas para serem conectadas depois, dentro da aplicação principal."
                    },
                    {
                        "type": "code",
                        "value": "// routes/tarefas.js\nconst express = require('express');\nconst router = express.Router();\n\nlet tarefas = [\n  { id: 1, titulo: 'Estudar Express', completa: false },\n  { id: 2, titulo: 'Fazer compras', completa: true },\n];\nlet proximoId = 3;\n\nrouter.get('/', (req, res) => {\n  res.status(200).json(tarefas);\n});\n\nrouter.get('/:id', (req, res) => {\n  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));\n  if (!tarefa) return res.status(404).json({ erro: 'Tarefa nao encontrada' });\n  res.status(200).json(tarefa);\n});\n\nrouter.post('/', (req, res) => {\n  const novaTarefa = { id: proximoId++, titulo: req.body.titulo, completa: false };\n  tarefas.push(novaTarefa);\n  res.status(201).json(novaTarefa);\n});\n\nrouter.delete('/:id', (req, res) => {\n  const indice = tarefas.findIndex((t) => t.id === Number(req.params.id));\n  if (indice === -1) return res.status(404).json({ erro: 'Tarefa nao encontrada' });\n  tarefas.splice(indice, 1);\n  res.status(204).end();\n});\n\nmodule.exports = router;"
                    },
                    {
                        "type": "text",
                        "value": "## Reparou que as rotas não têm mais /tarefas?\n\nDentro do router, as rotas usam `'/'` e `'/:id'`, sem o prefixo `/tarefas`. Isso é proposital: o prefixo é definido uma única vez, no lugar onde o router se conecta à aplicação principal, não dentro do arquivo de rotas.\n\nIsso também organiza as pastas do projeto. Uma estrutura comum:\n- `app.js`, com a criação do app e a montagem dos routers\n- `routes/tarefas.js`, com as rotas de tarefas\n- `routes/usuarios.js`, com as rotas de usuários\n\nCada arquivo de rotas cuida só do seu recurso, e o `app.js` vira uma lista curta e legível de quais recursos existem e em qual prefixo cada um mora."
                    },
                    {
                        "type": "code",
                        "value": "// app.js\nconst express = require('express');\nconst app = express();\n\nconst tarefasRouter = require('./routes/tarefas');\nconst usuariosRouter = require('./routes/usuarios');\n\napp.use(express.json());\napp.use('/tarefas', tarefasRouter);\napp.use('/usuarios', usuariosRouter);\n\napp.listen(3000, () => {\n  console.log('Servidor rodando na porta 3000');\n});\n\n// A partir daqui, router.get('/:id') dentro de tarefas.js responde de verdade em GET /tarefas/:id"
                    },
                    {
                        "type": "code",
                        "value": "// routes/comentarios.js\n// Sub-recurso: so existe dentro de uma tarefa, ex.: /tarefas/5/comentarios\nconst express = require('express');\n\n// mergeParams: true faz este router enxergar os parametros\n// definidos no prefixo onde ele for montado (tarefaId, nesse caso)\nconst router = express.Router({ mergeParams: true });\n\nrouter.get('/', (req, res) => {\n  const { tarefaId } = req.params;\n  res.status(200).json({ mensagem: 'Comentarios da tarefa ' + tarefaId });\n});\n\nmodule.exports = router;\n\n// app.js\n// app.use('/tarefas/:tarefaId/comentarios', require('./routes/comentarios'));\n// sem mergeParams, req.params.tarefaId chegaria undefined dentro do router filho"
                    },
                    {
                        "type": "quote",
                        "value": "express.Router() agrupa rotas relacionadas em um arquivo próprio, com caminhos relativos ao prefixo onde ele for montado através de app.use(prefixo, router). Separar por recurso é o primeiro passo para organizar um projeto Express que vai crescer, e prepara o terreno para os próximos módulos: middleware, validação e uma estrutura completa de pastas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual função do Express é usada para criar um conjunto de rotas separado, que depois pode ser conectado à aplicação principal?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "express.Module()",
                                "isCorrect": false
                            },
                            {
                                "text": "express.Router()",
                                "isCorrect": true
                            },
                            {
                                "text": "express.Route()",
                                "isCorrect": false
                            },
                            {
                                "text": "express.app()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de criar const router = express.Router() e definir router.get('/', handler) dentro de routes/tarefas.js, como você conecta esse router na aplicação principal para que ele responda em /tarefas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "app.router('/tarefas', router)",
                                "isCorrect": false
                            },
                            {
                                "text": "app.include('/tarefas', router)",
                                "isCorrect": false
                            },
                            {
                                "text": "app.get('/tarefas', router)",
                                "isCorrect": false
                            },
                            {
                                "text": "app.use('/tarefas', router)",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um router foi montado com app.use('/tarefas', tarefasRouter), e dentro dele existe a rota tarefasRouter.get('/:id', handler). Qual URL completa essa rota responde?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "/:id, sem nenhum prefixo",
                                "isCorrect": false
                            },
                            {
                                "text": "/tarefas/tarefas/:id, com o prefixo duplicado",
                                "isCorrect": false
                            },
                            {
                                "text": "/tarefas/:id, ou seja, algo como /tarefas/5",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma, porque um router montado com app.use não aceita rotas com parâmetro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto tem routes/tarefas.js e routes/usuarios.js, cada um exportando seu próprio router com module.exports = router. O que ainda falta para que essas rotas funcionem de verdade na aplicação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nada, o Express carrega automaticamente qualquer arquivo dentro da pasta routes",
                                "isCorrect": false
                            },
                            {
                                "text": "Importar cada router no arquivo principal e conectar cada um com app.use(prefixo, router)",
                                "isCorrect": true
                            },
                            {
                                "text": "Renomear os dois arquivos para app.js, o único nome que o Express reconhece",
                                "isCorrect": false
                            },
                            {
                                "text": "Juntar as duas rotas em um único arquivo, porque o Express só aceita um router por projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As rotas de comentários foram separadas em um router próprio, montado assim: app.use('/tarefas/:tarefaId/comentarios', comentariosRouter). Dentro desse router, a rota router.get('/', handler) precisa do valor de tarefaId, mas req.params.tarefaId chega undefined. Como resolver?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Trocar req.params.tarefaId por req.query.tarefaId, que captura prefixos",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o app.use por app.get no arquivo principal da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar o router com express.Router({ mergeParams: true }), herdando os parâmetros do pai",
                                "isCorrect": true
                            },
                            {
                                "text": "Não é possível: routers montados em arquivos separados nunca compartilham parâmetros entre si",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Middleware: o coração do Express",
        "aulas": [
            {
                "titulo": "O que é middleware: o pipeline de requisição",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O problema que o middleware resolve\n\nAté agora cada rota que você criou (`app.get`, `app.post` e as outras) recebe uma requisição e responde sozinha. Mas em qualquer API de verdade existem tarefas que se repetem em quase toda rota: registrar num log que a requisição chegou, checar se o cliente está autenticado, ler o corpo de um POST antes de usar os dados enviados.\n\nCopiar essa lógica dentro de cada handler seria repetitivo e fácil de esquecer na próxima rota que você criar. O Express resolve isso com **middleware**: uma função que fica no meio do caminho entre a requisição chegar e a resposta sair, e que pode inspecionar, alterar ou até interromper o que está passando por ela."
                    },
                    {
                        "type": "text",
                        "value": "## A assinatura de um middleware\n\nUm middleware no Express é uma função com três parâmetros, sempre nessa ordem:\n\n- `req`: o objeto da requisição, o mesmo que você já usa dentro das rotas.\n- `res`: o objeto da resposta.\n- `next`: uma função que, quando chamada, entrega o controle para o próximo middleware (ou para a rota) que estiver esperando na fila.\n\nUm handler de rota, no fundo, é um caso particular dessa mesma ideia: ele recebe `req` e `res` e, em vez de chamar `next()`, normalmente encerra o ciclo enviando uma resposta com `res.json()`, `res.send()` ou `res.status()`."
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\nconst app = express();\n\nfunction logarRequisicao(req, res, next) {\n  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);\n  next();\n}\n\napp.use(logarRequisicao);\n\napp.get('/tarefas', (req, res) => {\n  res.json([{ id: 1, titulo: 'Estudar Express' }]);\n});\n\napp.listen(3000, () => console.log('Servidor rodando na porta 3000'));"
                    },
                    {
                        "type": "text",
                        "value": "## Por que o next() é essencial\n\n`app.use(logarRequisicao)` registra o middleware antes da rota `/tarefas`. Quando uma requisição chega, o Express não vai direto para o handler: ele passa primeiro por `logarRequisicao`, que imprime a linha no console e, ao chamar `next()`, avisa o Express que pode seguir para o próximo passo do pipeline.\n\nSe `logarRequisicao` não chamasse `next()`, o Express não teria como saber que deveria continuar. A requisição ficaria parada exatamente ali, sem nenhum erro aparecendo, e o handler de `/tarefas` nunca chegaria a rodar. Esse comportamento é comum o suficiente para merecer atenção especial mais adiante neste módulo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Passo\",\"O que acontece\"],[\"1\",\"A requisição GET /tarefas chega no servidor\"],[\"2\",\"logarRequisicao roda e imprime a linha no console\"],[\"3\",\"logarRequisicao chama next()\"],[\"4\",\"O Express passa para a próxima função registrada: o handler de app.get('/tarefas', ...)\"],[\"5\",\"O handler roda e chama res.json(), enviando a resposta e encerrando o ciclo\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// tambem e possivel encadear middlewares so numa rota especifica,\n// listando-os como argumentos antes do handler final\napp.get('/tarefas/:id', verificarToken, buscarTarefaPorId);"
                    },
                    {
                        "type": "quote",
                        "value": "Middleware é uma função (req, res, next) que roda entre a requisição chegar e a resposta ser enviada. Cada middleware decide: chama next() para deixar o pipeline seguir, ou responde com res e encerra o ciclo ali mesmo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você quer que uma função rode antes de toda rota da aplicação, registrando no console cada requisição recebida. Qual chamada registra esse middleware corretamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "app.get('/', logarRequisicao);",
                                "isCorrect": false
                            },
                            {
                                "text": "app.use(logarRequisicao);",
                                "isCorrect": true
                            },
                            {
                                "text": "app.middleware(logarRequisicao);",
                                "isCorrect": false
                            },
                            {
                                "text": "require('logarRequisicao');",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual alternativa descreve corretamente o parâmetro next em um middleware do Express?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É o valor do próximo item dentro do array de req.params",
                                "isCorrect": false
                            },
                            {
                                "text": "É um objeto com os dados da próxima requisição que ainda vai chegar ao servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma função que, quando chamada, passa o controle ao próximo middleware da fila",
                                "isCorrect": true
                            },
                            {
                                "text": "É uma função que envia a resposta pronta de volta ao cliente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um middleware foi registrado assim: app.use(function (req, res, next) { console.log(req.method); });, sem chamar next() em nenhum ponto. O que acontece quando uma requisição GET /tarefas chega?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O método é impresso, mas a requisição trava ali; a rota nunca chega a rodar",
                                "isCorrect": true
                            },
                            {
                                "text": "O Express chama next() automaticamente assim que a função termina de rodar",
                                "isCorrect": false
                            },
                            {
                                "text": "A requisição segue normalmente até a rota, só que pulando o passo do log",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor recusa iniciar, por causa do middleware sem next() declarado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação diferencia corretamente um middleware registrado com app.use de um handler de rota registrado com app.get?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Middleware e handler de rota são a mesma coisa, intercambiáveis em qualquer app.use ou app.get",
                                "isCorrect": false
                            },
                            {
                                "text": "Um handler de rota nunca recebe next, então nunca é possível encadear mais de uma função numa rota",
                                "isCorrect": false
                            },
                            {
                                "text": "app.use só aceita funções assíncronas, enquanto app.get exige funções síncronas",
                                "isCorrect": false
                            },
                            {
                                "text": "O handler só roda quando método e caminho batem; um middleware de app.use roda sem depender do método",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "No trecho:\napp.use(middlewareA);\napp.get('/tarefas', middlewareB, handlerFinal);\napp.use(middlewareC);\nSupondo que middlewareA e middlewareB chamem next() normalmente e que handlerFinal responda com res.json() sem chamar next(), o que acontece com middlewareC quando chega um GET /tarefas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "middlewareC roda antes de middlewareA, porque o Express reordena os middlewares por especificidade de rota",
                                "isCorrect": false
                            },
                            {
                                "text": "middlewareC não roda nessa requisição, pois handlerFinal já enviou a resposta antes",
                                "isCorrect": true
                            },
                            {
                                "text": "middlewareC roda depois de handlerFinal e consegue alterar a resposta que já foi enviada",
                                "isCorrect": false
                            },
                            {
                                "text": "middlewareC roda em paralelo com middlewareB, já que os dois foram registrados com app.use",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A ordem dos middlewares importa",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que a ordem de registro importa\n\nO Express executa middlewares e rotas na ordem exata em que foram registrados no código, de cima para baixo, para cada requisição que chega. Não existe nenhuma otimização por trás disso reordenando as coisas: se você registrar um middleware depois de uma rota, ele simplesmente não vai rodar antes dela.\n\nIsso parece óbvio quando está escrito assim, mas é uma das causas mais comuns de bug em quem está começando com Express: um middleware de verificação que parece não funcionar, só porque foi colocado no lugar errado do arquivo."
                    },
                    {
                        "type": "code",
                        "value": "// bug comum: o middleware de verificacao vem DEPOIS da rota que deveria proteger\napp.get('/tarefas/:id', buscarTarefaPorId);\n\nfunction verificarToken(req, res, next) {\n  const token = req.headers.authorization;\n\n  if (!token) {\n    return res.status(401).json({ erro: 'Token nao enviado' });\n  }\n\n  next();\n}\n\napp.use(verificarToken);"
                    },
                    {
                        "type": "text",
                        "value": "## Seguindo o rastro do bug\n\nPara uma requisição GET /tarefas/5, o Express varre o código de cima para baixo procurando algo que atenda essa requisição. Ele encontra `app.get('/tarefas/:id', buscarTarefaPorId)` primeiro, roda o handler e envia a resposta. `verificarToken` só aparece depois, então nunca chega a ser executado para essa rota, mesmo que o cliente não tenha mandado nenhum token.\n\nA correção é simples: registrar o middleware de verificação antes das rotas que ele precisa proteger."
                    },
                    {
                        "type": "code",
                        "value": "// corrigido: o middleware vem ANTES das rotas que ele protege\nfunction verificarToken(req, res, next) {\n  const token = req.headers.authorization;\n\n  if (!token) {\n    return res.status(401).json({ erro: 'Token nao enviado' });\n  }\n\n  next();\n}\n\napp.use(verificarToken);\n\napp.get('/tarefas/:id', buscarTarefaPorId);"
                    },
                    {
                        "type": "text",
                        "value": "## Escolhendo o alcance do middleware\n\nNem todo middleware deve valer para a aplicação inteira. O Express aceita algumas formas de limitar onde um middleware roda:\n\n- `app.use(middleware)`: roda em toda requisição, de qualquer método e caminho.\n- `app.use('/tarefas', middleware)`: roda só nas requisições cujo caminho começa com `/tarefas`.\n- `app.get('/tarefas/:id', middleware, handler)`: roda só nessa rota e método específicos, antes do handler final.\n\nQuanto mais específico o middleware (por exemplo, uma verificação que só faz sentido em rotas de escrita), mais vale a pena registrá-lo só onde ele é necessário, em vez de colocar tudo num `app.use` global."
                    },
                    {
                        "type": "code",
                        "value": "app.get('/tarefas', listarTarefas);\napp.post('/tarefas', verificarToken, criarTarefa);\napp.delete('/tarefas/:id', verificarToken, removerTarefa);\n// GET continua publica: so POST e DELETE passam por verificarToken"
                    },
                    {
                        "type": "quote",
                        "value": "No Express a ordem de registro é a ordem de execução. Um middleware só protege as rotas que estão depois dele no código, então ele precisa vir antes delas, seja de forma global ou só numa rota específica."
                    }
                ],
                "questions": [
                    {
                        "statement": "Para que um middleware de autenticação proteja as rotas de uma API, onde no arquivo ele deve ser registrado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Antes das rotas que ele deve proteger",
                                "isCorrect": true
                            },
                            {
                                "text": "Depois de todas as rotas, no final do arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Dentro da chamada de app.listen",
                                "isCorrect": false
                            },
                            {
                                "text": "A posição não importa, o Express organiza sozinho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No trecho: app.get('/tarefas/:id', buscarTarefaPorId); app.use(verificarToken);, uma requisição GET /tarefas/5 chega sem cabeçalho de autorização. O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Retorna 401, porque verificarToken sempre roda primeiro, não importa a posição no arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor recusa subir, por causa da ordem invertida entre rota e middleware",
                                "isCorrect": false
                            },
                            {
                                "text": "buscarTarefaPorId responde normalmente, pois a rota já foi atendida antes do middleware",
                                "isCorrect": true
                            },
                            {
                                "text": "verificarToken roda antes da rota, porque middlewares sempre têm prioridade sobre handlers",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "app.use('/tarefas', registrarAcesso) foi registrado no início do arquivo. Uma requisição chega em GET /usuarios. O que acontece com registrarAcesso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Roda normalmente, porque app.use sempre roda para qualquer caminho",
                                "isCorrect": false
                            },
                            {
                                "text": "Gera um erro 404 antes mesmo de chegar nas rotas",
                                "isCorrect": false
                            },
                            {
                                "text": "Roda, mas sem acesso ao req.url da requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Não roda, porque o caminho da requisição não começa com /tarefas",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual registro aplica verificarToken somente à rota de criação de tarefa (POST /tarefas), sem afetar as demais rotas da API?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "app.use(verificarToken);",
                                "isCorrect": false
                            },
                            {
                                "text": "app.post('/tarefas', criarTarefa, verificarToken);",
                                "isCorrect": false
                            },
                            {
                                "text": "app.post('/tarefas', verificarToken, criarTarefa);",
                                "isCorrect": true
                            },
                            {
                                "text": "app.get('/tarefas', verificarToken, criarTarefa);",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considere:\napp.use('/tarefas', logAcesso);\napp.use(express.json());\napp.post('/tarefas', criarTarefa);\nlogAcesso tenta imprimir JSON.stringify(req.body) no console. Uma requisição POST /tarefas chega com um corpo JSON. O que provavelmente aparece no log?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Express reordena os middlewares automaticamente para colocar express.json() primeiro",
                                "isCorrect": false
                            },
                            {
                                "text": "req.body aparece como undefined dentro de logAcesso, porque express.json() (que interpreta o corpo) só é registrado depois dele",
                                "isCorrect": true
                            },
                            {
                                "text": "req.body já vem populado corretamente, porque o Express sempre lê o corpo da requisição antes de rodar qualquer middleware",
                                "isCorrect": false
                            },
                            {
                                "text": "A aplicação trava ao tentar acessar req.body antes da hora",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Middlewares embutidos: express.json e companhia",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Middlewares que já vêm com o Express\n\nAlém dos middlewares que você escreve, o próprio pacote express expõe alguns prontos, disponíveis como propriedades do objeto express, sem precisar instalar nada além do que você já tem. O mais usado de todos é o `express.json()`, e é praticamente garantido que toda API que recebe dados vai precisar dele."
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\nconst app = express();\n\napp.post('/tarefas', (req, res) => {\n  console.log(req.body); // undefined\n  res.status(201).json({ titulo: req.body.titulo }); // TypeError: Cannot read properties of undefined\n});\n\napp.listen(3000);"
                    },
                    {
                        "type": "text",
                        "value": "## Por que req.body vem undefined\n\nO Node não interpreta o corpo de uma requisição automaticamente. Os dados chegam como um fluxo de bytes brutos, e alguém precisa ler esse fluxo, entender que é um JSON e transformar num objeto JavaScript. É exatamente isso que o `express.json()` faz: ele lê o corpo, faz o parse e disponibiliza o resultado em `req.body`.\n\nSem registrar esse middleware, `req.body` simplesmente não existe (fica undefined), e qualquer tentativa de acessar uma propriedade dele, como `req.body.titulo`, lança um erro."
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\nconst app = express();\n\napp.use(express.json());\n\napp.post('/tarefas', (req, res) => {\n  const { titulo } = req.body;\n  res.status(201).json({ id: 1, titulo });\n});\n\napp.listen(3000);"
                    },
                    {
                        "type": "text",
                        "value": "## Outros embutidos úteis\n\nO `express.json()` cuida de corpos no formato JSON, mas existem outros dois embutidos comuns:\n\n- `express.urlencoded({ extended: true })`: lê corpos no formato application/x-www-form-urlencoded, o mesmo que um formulário HTML tradicional envia.\n- `express.static(pasta)`: serve arquivos de uma pasta (imagens, CSS, um HTML pronto) diretamente por URL, sem precisar de uma rota programada para cada arquivo.\n\nOs três podem conviver na mesma aplicação, cada um cuidando de um tipo de conteúdo diferente."
                    },
                    {
                        "type": "code",
                        "value": "app.use(express.json());\napp.use(express.urlencoded({ extended: true }));\napp.use(express.static('public'));"
                    },
                    {
                        "type": "quote",
                        "value": "Sem express.json(), req.body é undefined. É o primeiro middleware que praticamente toda API Express registra, logo depois de criar o app."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma rota POST /tarefas tenta ler req.body.titulo e o servidor lança TypeError: Cannot read properties of undefined. O middleware express.json() não foi registrado. Qual é a correção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Trocar req.body por req.params dentro do handler da rota",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar app.use(express.json()) antes da rota que lê req.body",
                                "isCorrect": true
                            },
                            {
                                "text": "Reiniciar o servidor; o problema tende a se resolver sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar a palavra async antes da função handler da rota",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o middleware embutido express.json()?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ler o corpo da requisição no formato JSON e disponibilizar os dados em req.body",
                                "isCorrect": true
                            },
                            {
                                "text": "Converter a resposta da rota para o formato JSON antes de enviar ao cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "Validar se os dados enviados pelo cliente têm o formato esperado",
                                "isCorrect": false
                            },
                            {
                                "text": "Compactar a resposta antes de enviar para reduzir o tamanho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API recebe dados de um formulário HTML comum, enviados com o cabeçalho Content-Type: application/x-www-form-urlencoded (não é JSON). Qual middleware embutido é necessário para ler esse corpo em req.body?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "express.json({ extended: true })",
                                "isCorrect": false
                            },
                            {
                                "text": "express.urlencoded({ extended: true })",
                                "isCorrect": true
                            },
                            {
                                "text": "express.static('public', { extended: true })",
                                "isCorrect": false
                            },
                            {
                                "text": "express.formData({ extended: true })",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pasta chamada public guarda as imagens do projeto, e elas precisam ficar acessíveis direto por uma URL, sem que exista uma rota programada para cada arquivo. Qual middleware embutido resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "express.public('public')",
                                "isCorrect": false
                            },
                            {
                                "text": "app.static('public')",
                                "isCorrect": false
                            },
                            {
                                "text": "express.serveFiles('public')",
                                "isCorrect": false
                            },
                            {
                                "text": "express.static('public')",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "No arquivo:\napp.post('/tarefas', (req, res) => { res.status(201).json(req.body); });\napp.use(express.json());\nUma requisição POST /tarefas chega com um JSON válido no corpo. O que a resposta enviada ao cliente tende a conter?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Express move express.json() para o topo do arquivo automaticamente, então o corpo chega populado",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro 500 automático do Express, porque toda rota POST exige express.json() antes de ser declarada",
                                "isCorrect": false
                            },
                            {
                                "text": "req.body vazio ou undefined, porque express.json() foi registrado depois da rota que usa o corpo",
                                "isCorrect": true
                            },
                            {
                                "text": "O JSON enviado pelo cliente, processado normalmente, porque express.json() já está disponível em toda a aplicação assim que é importado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escrevendo middleware próprio: log e verificação",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Escrevendo seus próprios middlewares\n\nUm middleware é só uma função JavaScript seguindo a assinatura (req, res, next). Você já tem o conhecimento necessário para escrever os seus, e dois tipos aparecem em praticamente toda API: middlewares de log (para observar o que está acontecendo) e middlewares de verificação (para checar alguma condição antes de deixar a requisição seguir)."
                    },
                    {
                        "type": "code",
                        "value": "function logarRequisicao(req, res, next) {\n  const inicio = Date.now();\n\n  res.on('finish', () => {\n    const duracao = Date.now() - inicio;\n    console.log(`${req.method} ${req.url} ${res.statusCode} - ${duracao}ms`);\n  });\n\n  next();\n}\n\napp.use(logarRequisicao);"
                    },
                    {
                        "type": "text",
                        "value": "## Um log que espera a resposta terminar\n\nRepare que `logarRequisicao` chama `next()` logo de cara, sem esperar nada: a requisição continua seguindo o pipeline normalmente. Antes disso, porém, ele registra um ouvinte no evento `finish` do objeto `res`, que o Node dispara quando a resposta termina de ser enviada. É assim que o middleware consegue logar o status code e o tempo de resposta reais, sem atrasar a requisição em nenhum milissegundo."
                    },
                    {
                        "type": "code",
                        "value": "const CHAVES_VALIDAS = ['abc123', 'def456'];\n\nfunction verificarApiKey(req, res, next) {\n  const chave = req.headers['x-api-key'];\n\n  if (!chave) {\n    return res.status(401).json({ erro: 'Cabecalho x-api-key obrigatorio' });\n  }\n\n  if (!CHAVES_VALIDAS.includes(chave)) {\n    return res.status(403).json({ erro: 'Chave de API invalida' });\n  }\n\n  next();\n}\n\napp.use('/tarefas', verificarApiKey);"
                    },
                    {
                        "type": "text",
                        "value": "## Por que o return antes do res importa\n\nEm `verificarApiKey`, cada `res.status(...).json(...)` vem acompanhado de um `return`. Isso encerra a execução da função ali mesmo, garantindo que `next()` só seja chamado quando nenhuma das verificações barrou a requisição. Sem o `return`, o código continuaria rodando depois do if e chegaria até o `next()` no final, mesmo depois de já ter enviado uma resposta."
                    },
                    {
                        "type": "code",
                        "value": "// versao com bug: falta o return antes de next()\nfunction verificarApiKeyComBug(req, res, next) {\n  const chave = req.headers['x-api-key'];\n\n  if (!chave) {\n    res.status(401).json({ erro: 'Cabecalho x-api-key obrigatorio' });\n  }\n\n  next(); // roda mesmo depois de ja ter respondido\n}\n// resultado tipico: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client"
                    },
                    {
                        "type": "quote",
                        "value": "Um middleware próprio é só uma função (req, res, next): ela decide se chama next() para seguir o fluxo ou se responde e encerra o ciclo, nunca as duas coisas na mesma requisição."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você quer registrar no console o método e a URL de toda requisição que chega na API, antes de qualquer rota tratar o pedido. Qual é a forma correta de fazer isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma função (req, res, next) que loga e chama next(), via app.use antes das rotas",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrever o console.log dentro de cada handler de rota da aplicação, individualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Chamar app.log(req, res) logo no início do arquivo principal",
                                "isCorrect": false
                            },
                            {
                                "text": "Sobrescrever o método console.log padrão do Node antes de criar o app",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "verificarApiKey precisa responder 401 e interromper a requisição quando o cabeçalho x-api-key não vier. Qual trecho faz isso corretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "if (!chave) { res.status(401).json({ erro: 'Cabecalho obrigatorio' }); next(); }",
                                "isCorrect": false
                            },
                            {
                                "text": "if (!chave) { next(new Error()); }",
                                "isCorrect": false
                            },
                            {
                                "text": "if (!chave) { return res.status(401).json({ erro: 'Cabecalho obrigatorio' }); }",
                                "isCorrect": true
                            },
                            {
                                "text": "if (!chave) { return false; }",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um middleware chama res.status(403).json({ erro: 'Sem permissao' }) e, na linha seguinte, sem return, chama next(). O handler da próxima rota também chama res.json() para responder. O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A segunda resposta substitui a primeira normalmente, sem gerar nenhum aviso",
                                "isCorrect": false
                            },
                            {
                                "text": "O Express ignora silenciosamente a segunda chamada de res.json()",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas respostas são combinadas automaticamente em um único corpo JSON",
                                "isCorrect": false
                            },
                            {
                                "text": "O Node lança Cannot set headers after they are sent, por duas respostas enviadas",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de um middleware de log, qual evento do objeto res permite saber o status final da resposta sem atrasar a requisição?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "res.on('start', ...)",
                                "isCorrect": false
                            },
                            {
                                "text": "res.on('finish', ...)",
                                "isCorrect": true
                            },
                            {
                                "text": "req.on('response', ...)",
                                "isCorrect": false
                            },
                            {
                                "text": "app.on('sent', ...)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "app.use('/tarefas', verificarApiKey) foi registrado depois de app.get('/status', handlerStatus) no mesmo arquivo. Uma requisição GET /status chega sem o cabeçalho x-api-key. O que acontece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Bloqueada com 403, porque verificarApiKey roda para toda a aplicação, não só /tarefas",
                                "isCorrect": false
                            },
                            {
                                "text": "verificarApiKey roda, mas decide ignorar a ausência da chave nesse caso",
                                "isCorrect": false
                            },
                            {
                                "text": "Responde normalmente, pois /status não bate com o prefixo /tarefas do middleware",
                                "isCorrect": true
                            },
                            {
                                "text": "Erro de inicialização, porque a rota foi declarada antes do middleware",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Middlewares de terceiros e o que acontece se você esquecer o next()",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Além do que vem com o Express\n\nO ecossistema do Node tem uma quantidade enorme de pacotes publicados no npm que são, no fundo, middlewares prontos, seguindo o mesmo contrato (req, res, next) que você já conhece. Dois deles aparecem em praticamente toda API Express que vai para produção: `cors` e `helmet`."
                    },
                    {
                        "type": "code",
                        "value": "npm install cors helmet"
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\nconst cors = require('cors');\nconst helmet = require('helmet');\n\nconst app = express();\n\napp.use(cors());\napp.use(helmet());\napp.use(express.json());\n\napp.get('/tarefas', (req, res) => {\n  res.json([{ id: 1, titulo: 'Estudar Express' }]);\n});\n\napp.listen(3000);"
                    },
                    {
                        "type": "text",
                        "value": "## O que cors e helmet fazem de verdade\n\n`cors()` adiciona os cabeçalhos que controlam se um navegador rodando em outra origem (outro domínio ou porta) tem permissão para consumir essa API. Sem ele, um front-end separado do back-end costuma esbarrar num erro de CORS no console do navegador (assunto que volta com mais detalhes lá no módulo de boas práticas).\n\n`helmet()` define um conjunto de cabeçalhos HTTP relacionados a segurança, reduzindo a exposição a alguns ataques comuns, sem que você precise conhecer cada cabeçalho de cor para já sair com uma proteção básica.\n\nNote que `cors()` e `helmet()` são chamados com parênteses: cada um retorna uma função middleware pronta, e é essa função que o app.use registra, exatamente como você faria com uma função sua."
                    },
                    {
                        "type": "text",
                        "value": "## O que acontece se você esquecer o next()\n\nChegou a hora de deixar bem claro o que acontece quando um middleware não chama next() e também não envia nenhuma resposta. Nesse caso o Express não tem mais nada para fazer: ele está esperando uma instrução (seguir para o próximo passo ou encerrar respondendo) e nenhuma das duas chega.\n\nA requisição fica pendurada. A conexão continua aberta, o cliente (navegador, curl, um front-end fazendo fetch) fica esperando, e nenhum erro aparece no console do servidor, porque, do ponto de vista do Express, nada deu errado: ele só está aguardando. Depois de um tempo, o cliente costuma desistir com um erro de timeout."
                    },
                    {
                        "type": "code",
                        "value": "function verificarToken(req, res, next) {\n  const token = req.headers.authorization;\n\n  if (!token) {\n    console.log('Sem token, bloqueando');\n    return; // saiu da funcao sem chamar next() e sem responder\n  }\n\n  next();\n}\n\napp.use(verificarToken);\n\napp.get('/tarefas', (req, res) => {\n  res.json([]);\n});\n// requisicao sem token: fica pendurada para sempre, sem 401, sem erro, sem nada"
                    },
                    {
                        "type": "quote",
                        "value": "Todo middleware precisa terminar de um jeito: chamando next() para seguir o pipeline, ou enviando uma resposta com res.send, res.json ou res.end. Esquecer os dois deixa a requisição pendurada, sem nenhum erro aparecendo no console."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando de terminal instala os pacotes cors e helmet num projeto Node.js?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "npm install cors helmet",
                                "isCorrect": true
                            },
                            {
                                "text": "npm init cors helmet",
                                "isCorrect": false
                            },
                            {
                                "text": "node install cors helmet",
                                "isCorrect": false
                            },
                            {
                                "text": "npm add-express cors helmet",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o middleware cors() numa API Express?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Validar o formato do corpo de cada requisição recebida pela API",
                                "isCorrect": false
                            },
                            {
                                "text": "Adiciona cabeçalhos que liberam acesso à API por outra origem",
                                "isCorrect": true
                            },
                            {
                                "text": "Compactar o corpo das respostas para reduzir o tamanho enviado",
                                "isCorrect": false
                            },
                            {
                                "text": "Registrar em log cada requisição recebida, com método e horário",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O desenvolvedor instalou o helmet mas esqueceu de registrar app.use(helmet()) no arquivo principal da aplicação. O que isso significa na prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O servidor não consegue iniciar, pois helmet é obrigatório em qualquer app Express",
                                "isCorrect": false
                            },
                            {
                                "text": "Todas as rotas passam a responder com status 500 automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "O Express ativa o helmet sozinho, só por ele estar instalado no projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "A aplicação não ganha os cabeçalhos extras de segurança, mas nada quebra",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um middleware de verificação faz uma checagem, mas em um dos caminhos do if não chama next() nem envia nenhuma resposta (sem res.send, res.json ou res.end). O que o cliente que fez a requisição vai observar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Recebe de imediato um erro 500 gerado automaticamente pelo Express",
                                "isCorrect": false
                            },
                            {
                                "text": "A requisição fica pendurada, sem resposta, até estourar o tempo limite",
                                "isCorrect": true
                            },
                            {
                                "text": "Recebe um 404 informando que a rota não foi encontrada",
                                "isCorrect": false
                            },
                            {
                                "text": "O Express chama next() sozinho depois de alguns segundos parado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de um middleware: if (!token) { res.status(401); } next();, sem return e sem chamar .json() ou .send() depois do status. O que acontece de fato quando o token não vem?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "res.status(401) já envia a resposta completa sozinho, então o next() seguinte é ignorado pelo Express",
                                "isCorrect": false
                            },
                            {
                                "text": "O Express detecta a chamada de res.status e cancela automaticamente a execução do next() logo em seguida",
                                "isCorrect": false
                            },
                            {
                                "text": "Gera um erro de sintaxe, pois res.status sempre precisa vir acompanhado de um .json() na mesma linha",
                                "isCorrect": false
                            },
                            {
                                "text": "res.status(401) só define o código; como chama next(), é o próximo handler que envia a resposta de fato",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Recebendo e validando dados",
        "aulas": [
            {
                "titulo": "Os dados da requisição: body, params e query",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Os dados da requisição: body, params e query\n\nBem-vindo ao módulo sobre receber e validar dados. Até aqui sua API sabe abrir rotas e usar middleware, mas toda rota realmente útil depende de uma coisa: dados que chegam de fora, digitados por um usuário, enviados por um aplicativo ou por outro serviço. O Express te dá três portas de entrada para esses dados, e uma aula inteira só para elas já paga o investimento, porque é exatamente aqui que a maioria dos bugs (e das brechas de segurança) de uma API começa.\n\nAs três portas são: `req.params` (pedaços da própria URL), `req.query` (a query string depois do `?`) e `req.body` (o corpo da requisição, geralmente um JSON). Vamos relembrar rápido as duas primeiras, que você já viu no módulo de rotas, e focar o grosso da aula no `req.body`, que ainda não tinha entrado em cena."
                    },
                    {
                        "type": "text",
                        "value": "## Relembrando: req.params e req.query\n\n`req.params` guarda os pedaços **nomeados na própria rota**. Numa rota `/tarefas/:id`, uma requisição para `/tarefas/7` chega com `req.params` igual a `{ id: '7' }`. `req.query` guarda o que vem depois do `?` na URL, sempre como pares chave e valor. Uma chamada para `/tarefas?concluida=true&limite=5` chega com `req.query` igual a `{ concluida: 'true', limite: '5' }`.\n\nRepare num detalhe que vai importar a aula inteira: **tanto req.params quanto req.query chegam sempre como string**, mesmo quando parecem número (`'5'`) ou booleano (`'true'`). O Express não adivinha o tipo para você."
                    },
                    {
                        "type": "code",
                        "value": "app.get('/tarefas', (req, res) => {\n  console.log(req.query);\n  // GET /tarefas?concluida=true&limite=5\n  // req.query => { concluida: 'true', limite: '5' }\n\n  res.json({ recebido: req.query });\n});\n\napp.get('/tarefas/:id', (req, res) => {\n  console.log(req.params);\n  // GET /tarefas/7\n  // req.params => { id: '7' }\n\n  res.json({ idPedido: req.params.id, tipo: typeof req.params.id });\n  // tipo: 'string', mesmo o id parecendo um numero\n});"
                    },
                    {
                        "type": "text",
                        "value": "## req.body: o corpo da requisição\n\n`req.body` é onde chegam os dados que o cliente manda no **corpo** da requisição, comum em POST, PUT e PATCH. Diferente de `params` e `query`, o Express **não lê o corpo sozinho**: no módulo anterior você conheceu o middleware embutido `express.json()`, que interpreta um corpo com `Content-Type: application/json` e transforma em objeto JavaScript disponível em `req.body`. Sem `app.use(express.json())` lá no topo do arquivo, `req.body` chega `undefined`, e qualquer código que tente ler `req.body.titulo` quebra."
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\nconst app = express();\n\napp.use(express.json()); // sem isso, req.body fica undefined\n\napp.post('/tarefas', (req, res) => {\n  console.log(req.body);\n  // POST /tarefas com corpo { \"titulo\": \"Estudar Express\", \"prioridade\": 2 }\n  // req.body => { titulo: 'Estudar Express', prioridade: 2 }\n\n  res.status(201).json({ mensagem: 'Tarefa recebida', tarefa: req.body });\n});\n\napp.listen(3000, () => console.log('Servidor rodando na porta 3000'));"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fonte\",\"De onde vem\",\"Exemplo de acesso\",\"Tipo dos valores\"],[\"req.params\",\"Trechos nomeados da URL (rota /tarefas/:id)\",\"req.params.id\",\"Sempre string\"],[\"req.query\",\"Query string depois do ? na URL\",\"req.query.limite\",\"Sempre string\"],[\"req.body\",\"Corpo da requisição (exige o middleware express.json())\",\"req.body.titulo\",\"Depende do JSON enviado\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Três portas de entrada, uma regra só para as duas primeiras: `req.params` e `req.query` chegam sempre como string, e `req.body` só existe se o middleware `express.json()` estiver ligado. Nas próximas aulas você vai ver por que confiar cegamente no conteúdo dessas três fontes é a porta de entrada de bugs e ataques."
                    }
                ],
                "questions": [
                    {
                        "statement": "Considere a rota app.get('/tarefas/:id', ...). Uma requisição chega em GET /tarefas/42. O que req.params vale dentro do handler?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "{ id: '42' }, com o valor sempre como string",
                                "isCorrect": true
                            },
                            {
                                "text": "{ id: 42 }, com o valor já convertido para número",
                                "isCorrect": false
                            },
                            {
                                "text": "undefined, porque o id deveria vir em req.query",
                                "isCorrect": false
                            },
                            {
                                "text": "{ id: '42' }, mas só se express.json() estiver configurado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual middleware é necessário para que req.body venha preenchido com o JSON enviado no corpo de uma requisição POST?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "express.json()",
                                "isCorrect": true
                            },
                            {
                                "text": "express.static()",
                                "isCorrect": false
                            },
                            {
                                "text": "express.Router()",
                                "isCorrect": false
                            },
                            {
                                "text": "cors()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor quer filtrar a listagem de tarefas com GET /tarefas?concluida=true, esperando ler o valor em req.body.concluida dentro da rota. O que está errado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "concluida está em req.query, não em req.body; query nunca vai no corpo",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada está errado: req.body e req.query sempre trazem os mesmos dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltou adicionar express.json() para popular req.query corretamente",
                                "isCorrect": false
                            },
                            {
                                "text": "GET não aceita parâmetros, então concluida nunca chega em nenhuma rota",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma rota que recebe ?limite=5 em req.query não pode simplesmente somar req.query.limite + 1 e esperar o resultado 6?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "req.query.limite chega como string '5'; '5' + 1 em JS concatena e vira '51'",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque req.query só aceita valores do tipo booleano nessa versão do Express",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Express bloqueia qualquer operação matemática dentro de rotas GET",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque req.query.limite vem sempre como null até passar por validação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API tem app.use(express.json()) configurado, mas só depois da definição da rota app.post('/tarefas', ...) no arquivo. O que acontece quando uma requisição POST chega em /tarefas com corpo JSON?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "req.body chega undefined; express.json() só afeta rotas depois dele",
                                "isCorrect": true
                            },
                            {
                                "text": "req.body é populado normalmente, pois a ordem de app.use nunca importa",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor recusa a requisição com status 500 de forma automática",
                                "isCorrect": false
                            },
                            {
                                "text": "req.params é que fica undefined; req.body funciona normalmente",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Por que nunca confiar na entrada do cliente",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que nunca confiar na entrada do cliente\n\nSeu formulário no front-end exige que o campo \"título\" tenha entre 3 e 100 caracteres. Ótimo, só que isso protege exatamente zero o seu servidor. Como você viu ao estudar HTTP, quem fala com a sua API não é obrigatoriamente um navegador rodando aquele formulário bonitinho: pode ser o `curl`, o Postman, um script em Python ou alguém tentando quebrar o seu sistema de propósito. Toda validação que só existe no front-end é, do ponto de vista do servidor, inexistente.\n\nA regra desta aula é simples de enunciar e fácil de esquecer na prática: **o servidor nunca deve confiar em nada que vem do cliente**. Nem no tipo do dado, nem no tamanho, nem na presença dos campos obrigatórios, nem no formato. Cada requisição que chega em `req.body`, `req.params` ou `req.query` deve ser tratada como potencialmente incompleta, mal formatada ou deliberadamente maliciosa, até a rota provar o contrário."
                    },
                    {
                        "type": "code",
                        "value": "let proximoId = 1;\nconst tarefas = [];\n\n// rota sem nenhuma validacao\napp.post('/tarefas', (req, res) => {\n  const tarefa = {\n    id: proximoId++,\n    titulo: req.body.titulo.toUpperCase(),\n    prioridade: req.body.prioridade,\n  };\n  tarefas.push(tarefa);\n  res.status(201).json(tarefa);\n});"
                    },
                    {
                        "type": "code",
                        "value": "curl -X POST http://localhost:3000/tarefas -H \"Content-Type: application/json\" -d \"{}\"\n\n// resultado: TypeError: Cannot read properties of undefined (reading 'toUpperCase')\n// o servidor derruba a requisicao com um erro 500, so porque faltou um campo"
                    },
                    {
                        "type": "text",
                        "value": "## Nem todo problema vira um erro 500\n\nO exemplo anterior pelo menos quebra alto: um erro 500 avisa que algo deu errado. O cenário mais perigoso é quando a entrada inválida não quebra nada, ela só corrompe silenciosamente os dados. Se a rota espera `prioridade` como número e o cliente manda `\"prioridade\": \"alta\"` (uma string), o JavaScript não reclama na hora: a tarefa é salva do mesmo jeito, com um campo do tipo errado. O bug só aparece bem depois, talvez numa rota de relatório que tenta somar prioridades e recebe `NaN`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que o cliente pode mandar\",\"Consequência sem validação\"],[\"Campo obrigatório ausente\",\"TypeError ao tentar usar um valor undefined\"],[\"Tipo errado (string no lugar de número)\",\"Dado salvo incorreto, bug silencioso mais adiante\"],[\"Campos a mais que o esperado\",\"Sobrescrita de campos que deveriam ser internos\"],[\"Texto absurdamente longo\",\"Consumo desnecessário de memória e de banco\"],[\"Formato inválido (email sem @, data quebrada)\",\"Dado inconsistente, difícil de consultar depois\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O perigo dos campos extras\n\nExiste um risco mais sutil que passa batido com frequência: o cliente pode mandar campos que você nunca pediu. Imagine uma rota de cadastro assim: `const novoUsuario = { papel: 'usuario', ...req.body };`. A intenção é definir um valor padrão para `papel` e deixar o resto por conta do que o cliente mandou. O problema é a ordem: como `...req.body` vem depois, qualquer campo `papel` que o cliente incluir no JSON sobrescreve o valor padrão. Um cliente malicioso manda `{ \"nome\": \"Ana\", \"papel\": \"admin\" }` e, de brinde, ganha privilégios de administrador. Ler `req.body` inteiro e espalhá-lo direto num objeto que você salva é sempre arriscado. Você vai ver mais à frente como um schema resolve isso, aceitando só os campos esperados."
                    },
                    {
                        "type": "quote",
                        "value": "Regra da aula: valide sempre no servidor, mesmo que o front-end já valide. O front-end existe para dar uma boa experiência a quem usa o sistema normalmente; a validação no back-end existe para proteger o sistema de qualquer um, incluindo quem nunca vai passar pelo seu formulário."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um formulário HTML usa o atributo required para obrigar o preenchimento do campo email antes de enviar. Por que isso sozinho não protege a API?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um cliente pode chamar a API direto via curl, sem passar pelo formulário",
                                "isCorrect": true
                            },
                            {
                                "text": "O atributo required só funciona em navegadores mais antigos",
                                "isCorrect": false
                            },
                            {
                                "text": "O Express bloqueia automaticamente qualquer formulário com required",
                                "isCorrect": false
                            },
                            {
                                "text": "required impede qualquer requisição que não venha de um navegador comum",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual deve ser a postura padrão de uma rota de API em relação aos dados recebidos em req.body?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Tratar como não confiável e validar no servidor, mesmo com validação no front-end",
                                "isCorrect": true
                            },
                            {
                                "text": "Confiar nos dados sempre que a requisição tiver o header Content-Type correto",
                                "isCorrect": false
                            },
                            {
                                "text": "Validar apenas em rotas GET, já que POST e PUT vêm sempre de formulários confiáveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiar nos dados sempre que o front-end pertencer à mesma empresa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota sem validação faz req.body.titulo.toUpperCase(). O cliente envia um POST com corpo {} (sem o campo titulo). O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "toUpperCase() num valor undefined lança erro, e a resposta vira um 500",
                                "isCorrect": true
                            },
                            {
                                "text": "O Express substitui automaticamente o titulo por uma string vazia",
                                "isCorrect": false
                            },
                            {
                                "text": "A rota responde 400 automaticamente, sem exigir nenhum código extra",
                                "isCorrect": false
                            },
                            {
                                "text": "A tarefa é criada normalmente, com titulo valendo undefined",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a validação feita em JavaScript no navegador não é suficiente para proteger uma API, mesmo bem escrita?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quem envia a requisição pode ser qualquer programa, não só o navegador validando",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque navegadores modernos desativam JavaScript por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a validação no navegador é sempre mais lenta que no servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque JavaScript no navegador não consegue validar campos de texto, apenas números",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota de cadastro monta o novo registro assim: { papel: 'usuario', ...req.body }. Um cliente envia { \"nome\": \"Ana\", \"papel\": \"admin\" } no corpo da requisição. Qual o papel final do registro salvo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "admin, porque o spread de req.body vem depois do valor padrão e o sobrescreve",
                                "isCorrect": true
                            },
                            {
                                "text": "usuario, porque o valor definido antes do spread sempre tem prioridade",
                                "isCorrect": false
                            },
                            {
                                "text": "admin, mas apenas se o cliente também enviar um header de administrador",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum dos dois: o JavaScript rejeita objetos com a chave papel duplicada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Validando com Zod: o schema e o parse",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Validando com Zod: o schema e o parse\n\nVocê já viu por que não dá para confiar na entrada do cliente. Agora vem a parte prática: como validar de verdade, sem escrever uma sequência interminável de `if (!req.body.titulo) return ...` para cada campo. A ferramenta mais usada no ecossistema Node hoje para isso é uma biblioteca de validação baseada em schema, e a mais popular delas é o **Zod**.\n\nUm schema é uma descrição do formato que você espera para um dado: quais campos existem, o tipo de cada um, se são obrigatórios, quais as regras (tamanho mínimo, formato de email etc.). Você descreve o schema uma vez e pede para o Zod comparar qualquer dado com ele, campo por campo."
                    },
                    {
                        "type": "code",
                        "value": "npm install zod"
                    },
                    {
                        "type": "text",
                        "value": "## Definindo o schema\n\nUm schema do Zod costuma começar com `z.object({...})`, descrevendo cada campo esperado. Para a API de tarefas, uma tarefa nova precisa de um `titulo` (texto, entre 3 e 100 caracteres) e pode opcionalmente vir com uma `prioridade` (um número inteiro entre 1 e 3):"
                    },
                    {
                        "type": "code",
                        "value": "const { z } = require('zod');\n\nconst criarTarefaSchema = z.object({\n  titulo: z.string()\n    .min(3, 'O titulo precisa de ao menos 3 caracteres')\n    .max(100, 'O titulo pode ter no maximo 100 caracteres'),\n  prioridade: z.int().min(1).max(3).optional(),\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Usando o schema com .parse()\n\nCom o schema pronto, `criarTarefaSchema.parse(dado)` faz duas coisas: se `dado` bate com o schema, devolve o próprio dado (já validado); se não bate, lança uma exceção (`ZodError`) na hora, interrompendo a execução da função. Isso quer dizer que, sem tratar esse erro, a rota derruba a requisição com um 500, exatamente como no exemplo sem validação da aula passada. O `.parse()` sozinho não é suficiente: ele precisa vir acompanhado de um `try/catch`."
                    },
                    {
                        "type": "code",
                        "value": "const { ZodError } = require('zod');\n\napp.post('/tarefas', (req, res) => {\n  try {\n    const dados = criarTarefaSchema.parse(req.body);\n    // a partir daqui, dados esta validado: titulo existe e tem o tamanho certo\n\n    const tarefa = { id: proximoId++, titulo: dados.titulo, prioridade: dados.prioridade ?? 1 };\n    tarefas.push(tarefa);\n    res.status(201).json(tarefa);\n  } catch (erro) {\n    if (erro instanceof ZodError) {\n      return res.status(400).json({ erro: 'Dados invalidos', detalhes: erro.issues });\n    }\n    throw erro; // erro inesperado, nao e problema de validacao\n  }\n});"
                    },
                    {
                        "type": "quote",
                        "value": "O .parse() valida e, se der tudo certo, devolve o dado limpo. Se der errado, ele lança uma exceção, então todo .parse() dentro de uma rota precisa de um try/catch por perto. Na próxima aula você vai conhecer o .safeParse(), uma alternativa que evita o try/catch e deixa o tratamento do erro mais direto."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que um schema do Zod, como z.object({ titulo: z.string().min(3) }), descreve?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O formato esperado do dado: campos, tipos e regras de validação",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo de uma tabela inteira do banco de dados relacional",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma nova rota registrada dentro da aplicação Express",
                                "isCorrect": false
                            },
                            {
                                "text": "Um middleware que registra em log cada requisição recebida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o método .parse() de um schema Zod faz ao receber um dado que não bate com as regras definidas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Lança uma exceção (ZodError), interrompendo a execução na hora",
                                "isCorrect": true
                            },
                            {
                                "text": "Retorna null silenciosamente, sem lançar nenhum erro",
                                "isCorrect": false
                            },
                            {
                                "text": "Retorna o dado mesmo assim, removendo os campos inválidos",
                                "isCorrect": false
                            },
                            {
                                "text": "Retorna false, indicando que a validação não passou",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota chama criarTarefaSchema.parse(req.body) sem nenhum try/catch em volta. O cliente envia um corpo sem o campo titulo. O que o cliente recebe como resposta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um erro 500, porque a exceção lançada pelo parse não é tratada em lugar nenhum",
                                "isCorrect": true
                            },
                            {
                                "text": "Um 400 com a mensagem de validação, porque o Express trata isso automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Um 201, porque o parse ignora campos ausentes e segue em frente",
                                "isCorrect": false
                            },
                            {
                                "text": "Um 200 com titulo preenchido com um valor padrão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O schema define titulo: z.string().min(3, 'mensagem'). O cliente envia { \"titulo\": \"ok\" } (2 caracteres). O que .parse() faz com essa entrada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Lança uma ZodError, pois 'ok' é menor que o mínimo exigido",
                                "isCorrect": true
                            },
                            {
                                "text": "Aceita normalmente, porque 2 caracteres já é maior que zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Completa o texto automaticamente até atingir os 3 caracteres",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignora a regra de min, porque o valor já é uma string válida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No bloco catch do exemplo da aula, o código só responde 400 quando erro instanceof ZodError é verdadeiro, e faz throw erro nos outros casos. Por que não responder 400 direto para qualquer erro capturado no catch?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nem todo erro do try é de validação; uma falha de banco não é 'entrada inválida'",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque ZodError é o único tipo de erro que o JavaScript reconhece num catch",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque sem o instanceof, o Node.js se recusa a executar o bloco catch",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque throw erro converte automaticamente qualquer erro em um 400",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "safeParse e uma resposta 400 com mensagem clara",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# safeParse e uma resposta 400 com mensagem clara\n\nO .parse() que você usou na aula passada funciona, mas exige lembrar do try/catch toda vez: esquecer transforma um dado inválido num 500 em vez de um 400. O Zod tem uma alternativa pensada exatamente para esse fluxo dentro de uma rota: o `.safeParse()`. Ele nunca lança exceção; em vez disso, devolve um objeto contando se a validação deu certo ou não. O try/catch vira um simples if."
                    },
                    {
                        "type": "code",
                        "value": "const resultado = criarTarefaSchema.safeParse(req.body);\n\nif (resultado.success) {\n  console.log(resultado.data);\n  // dado validado, pronto para usar\n} else {\n  console.log(resultado.error.issues);\n  // array com um item por campo invalido, cada um com:\n  // path -> o campo, ex.: ['titulo']\n  // message -> o texto de erro definido no schema\n}"
                    },
                    {
                        "type": "code",
                        "value": "app.post('/tarefas', (req, res) => {\n  const resultado = criarTarefaSchema.safeParse(req.body);\n\n  if (!resultado.success) {\n    return res.status(400).json({\n      erro: 'Dados invalidos',\n      detalhes: resultado.error.issues.map((problema) => ({\n        campo: problema.path.join('.'),\n        mensagem: problema.message,\n      })),\n    });\n  }\n\n  const tarefa = {\n    id: proximoId++,\n    titulo: resultado.data.titulo,\n    prioridade: resultado.data.prioridade ?? 1,\n  };\n  tarefas.push(tarefa);\n  res.status(201).json(tarefa);\n});"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\".parse()\",\".safeParse()\"],[\"Dado inválido\",\"Lança exceção (ZodError)\",\"Devolve { success: false, error }\"],[\"Precisa de try/catch?\",\"Sim\",\"Não\"],[\"Retorno em caso de sucesso\",\"O próprio dado validado\",\"{ success: true, data }\"],[\"Uso típico\",\"Com tratamento de erro centralizado (próximo módulo)\",\"Responder 400 direto ali na rota\"]]"
                    },
                    {
                        "type": "code",
                        "value": "function validarBody(schema) {\n  return (req, res, next) => {\n    const resultado = schema.safeParse(req.body);\n    if (!resultado.success) {\n      return res.status(400).json({\n        erro: 'Dados invalidos',\n        detalhes: resultado.error.issues.map((p) => ({ campo: p.path.join('.'), mensagem: p.message })),\n      });\n    }\n    req.body = resultado.data; // substitui pelo dado ja validado (e sem campos extras)\n    next();\n  };\n}\n\napp.post('/tarefas', validarBody(criarTarefaSchema), (req, res) => {\n  // aqui dentro, req.body ja esta garantidamente valido\n  const tarefa = { id: proximoId++, titulo: req.body.titulo, prioridade: req.body.prioridade ?? 1 };\n  tarefas.push(tarefa);\n  res.status(201).json(tarefa);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso vale a pena\n\nRepare que `validarBody` só chama `next()` dentro do caminho de sucesso. Se a validação falhar, a resposta 400 já foi enviada ali mesmo e a função retorna sem chamar `next()`, então o handler final da rota nunca roda com dado inválido. Transformar a validação num middleware reaproveitável assim evita copiar o mesmo bloco de `safeParse` e resposta 400 em cada rota que recebe dados, que é exatamente o tipo de repetição que vale eliminar."
                    },
                    {
                        "type": "quote",
                        "value": "safeParse troca exceção por um objeto { success, data } ou { success, error }, o que deixa natural responder um 400 com mensagem clara, campo por campo. Transformar essa validação num middleware reaproveitável evita repetir o mesmo bloco de código em cada rota que recebe dados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual a principal diferença de comportamento entre .parse() e .safeParse() no Zod diante de um dado inválido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "safeParse nunca lança exceção e devolve um objeto de sucesso ou falha",
                                "isCorrect": true
                            },
                            {
                                "text": "safeParse é apenas mais rápido tecnicamente, mas aplica as mesmas regras do parse",
                                "isCorrect": false
                            },
                            {
                                "text": "parse só funciona com req.body, e safeParse só funciona com req.query",
                                "isCorrect": false
                            },
                            {
                                "text": "safeParse não aplica as regras de validação, só confere se os campos existem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao chamar schema.safeParse(dado) com um dado que não passa nas regras do schema, o que a propriedade success do resultado vale?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "false",
                                "isCorrect": true
                            },
                            {
                                "text": "true",
                                "isCorrect": false
                            },
                            {
                                "text": "undefined",
                                "isCorrect": false
                            },
                            {
                                "text": "Lança um erro antes mesmo de existir um success",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota monta a resposta de erro com resultado.error.issues.map(p => ({ campo: p.path.join('.'), mensagem: p.message })) em vez de devolver só { erro: 'dados invalidos' }. Qual a vantagem prática disso para quem consome a API?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fica claro qual campo falhou e por quê, sem precisar adivinhar",
                                "isCorrect": true
                            },
                            {
                                "text": "A resposta fica bem mais rápida de ser processada pelo servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso evita que o Zod lance uma exceção durante a validação",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso faz o status HTTP mudar de 400 para 422 de forma automática",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No middleware validarBody(schema) que envolve o safeParse, por que next() só é chamado dentro do bloco em que resultado.success é verdadeiro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Se a validação falhar, o handler final não deve rodar; o 400 já foi enviado",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque next() só pode ser chamado uma única vez durante toda a vida do servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque chamar next() já envia uma resposta 400 automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque isso evita que o Express registre a rota duas vezes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A rota A valida com criarTarefaSchema.parse(req.body) dentro de um try/catch que responde 400 no catch quando o erro é um ZodError. A rota B valida o mesmo schema com safeParse e responde 400 quando success é falso. Para uma mesma entrada inválida, qual a diferença de resposta que o cliente da API percebe entre A e B?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nenhuma: as duas aplicam as mesmas regras do schema; a diferença é só de estilo",
                                "isCorrect": true
                            },
                            {
                                "text": "A rota A é mais segura, porque lançar uma exceção impede qualquer ataque",
                                "isCorrect": false
                            },
                            {
                                "text": "A rota B não aplica as regras de min e max do schema, só confere a presença dos campos",
                                "isCorrect": false
                            },
                            {
                                "text": "A rota A sempre responde 500 e a rota B sempre responde 400, para a mesma entrada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Sanitização básica: limpando o que entra",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Sanitização básica: limpando o que entra\n\nValidar responde uma pergunta: esse dado serve? Sanitizar responde outra, complementar: dá para deixar esse dado num formato melhor antes de usar? Um email com espaços em volta (`\" ana@email.com \"`), um título de tarefa com maiúsculas e minúsculas inconsistentes, ou um campo extra que o cliente mandou sem você pedir, nada disso necessariamente invalida a requisição, mas todos esses casos merecem uma limpeza antes de guardar o dado. Esta aula fecha o módulo mostrando como fazer essa limpeza básica, boa parte dela usando o próprio Zod."
                    },
                    {
                        "type": "code",
                        "value": "const criarTarefaSchema = z.object({\n  titulo: z.string().trim().min(3, 'O titulo precisa de ao menos 3 caracteres').max(100),\n  responsavelEmail: z.email('Email invalido').trim().toLowerCase(),\n  prioridade: z.int().min(1).max(3).optional(),\n});\n\n// \"  Estudar Express  \" -> \"Estudar Express\" (trim)\n// \"Ana@Email.COM\" -> \"ana@email.com\" (trim + toLowerCase)"
                    },
                    {
                        "type": "text",
                        "value": "## Sanitizando dentro do próprio schema\n\n`.trim()` e `.toLowerCase()` são métodos que o Zod encadeia no schema (`z.string().trim()`) e que rodam automaticamente toda vez que o dado passa por `.parse()` ou `.safeParse()`, sem precisar de um passo separado. Isso é melhor do que sanitizar depois de validar, porque garante que a limpeza aconteça sempre, para todo mundo que usar aquele schema, sem depender de ninguém lembrar de chamar uma função extra. Quando a regra de limpeza é mais específica, o Zod tem `.transform()`, que recebe o valor já validado e devolve a versão transformada:"
                    },
                    {
                        "type": "code",
                        "value": "const buscaSchema = z.object({\n  termo: z.string().trim().min(1).transform((valor) => valor.split(' ').filter(Boolean).join(' ')),\n  // troca varios espacos seguidos por um so: \"tarefa   urgente\" -> \"tarefa urgente\"\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Campos que você não pediu\n\nLembra do risco de campos extras da aula sobre confiar no cliente? Por padrão, `z.object()` já resolve boa parte do problema sozinho: qualquer campo que o cliente mandar e não estiver descrito no schema é descartado silenciosamente do resultado de `.parse()`/`.safeParse()`. Se o schema só conhece `titulo` e `prioridade`, um `req.body` igual a `{ titulo: 'Estudar', prioridade: 2, papel: 'admin' }` sai do `.parse()` como `{ titulo: 'Estudar', prioridade: 2 }`, sem o `papel`. Quando você quer ser ainda mais rígido e rejeitar a requisição inteira ao ver um campo desconhecido, em vez de só ignorá-lo, troque `z.object({...})` por `z.object({...}).strict()`."
                    },
                    {
                        "type": "code",
                        "value": "const schemaEstrito = z.object({\n  titulo: z.string().trim().min(3).max(100),\n}).strict();\n\nschemaEstrito.safeParse({ titulo: 'Estudar Express', papel: 'admin' });\n// success: false, porque 'papel' nao esta no schema e o modo e estrito\n\n// req.query sempre chega como string; z.coerce converte antes de validar\nconst listarTarefasSchema = z.object({\n  limite: z.coerce.number().int().positive().optional(),\n});\n\nlistarTarefasSchema.safeParse({ limite: '10' });\n// success: true, data: { limite: 10 }, numero de verdade, nao mais string"
                    },
                    {
                        "type": "quote",
                        "value": "Sanitizar é normalizar o que já passou na validação: cortar espaços, padronizar caixa, descartar campos que não foram pedidos, limitar tamanhos e até converter tipos com z.coerce. É uma camada básica e importante, mas não substitui outros cuidados, como escapar dados na hora de exibi-los numa página HTML. Com body, params e query lidos, validados e sanitizados, sua API já rejeita entradas ruins com uma resposta clara. No próximo módulo, o foco muda para o outro lado da conversa: como estruturar toda resposta e tratar erros de forma consistente."
                    }
                ],
                "questions": [
                    {
                        "statement": "No schema z.string().trim().min(3), o que .trim() faz com o valor recebido antes de aplicar o restante das regras?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Remove espaços em branco do início e do fim do texto",
                                "isCorrect": true
                            },
                            {
                                "text": "Corta o texto para no máximo 3 caracteres",
                                "isCorrect": false
                            },
                            {
                                "text": "Transforma o texto em minúsculas",
                                "isCorrect": false
                            },
                            {
                                "text": "Remove todos os espaços, inclusive os do meio do texto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por padrão, o que o z.object() do Zod faz com um campo que chega em req.body mas não está descrito no schema?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Descarta esse campo em silêncio, fora do resultado validado",
                                "isCorrect": true
                            },
                            {
                                "text": "Lança um erro de validação automaticamente, mesmo em modo padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Mantém o campo extra normalmente dentro do resultado validado",
                                "isCorrect": false
                            },
                            {
                                "text": "Converte o campo extra para string antes de mantê-lo no resultado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um schema é definido com .strict() no final. O cliente envia um campo que não existe no schema. Qual o comportamento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A validação falha, porque o modo estrito rejeita qualquer campo desconhecido",
                                "isCorrect": true
                            },
                            {
                                "text": "O campo extra é descartado e a validação passa normalmente, como no modo padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "O campo extra é aceito e incluído no resultado validado",
                                "isCorrect": false
                            },
                            {
                                "text": "O Zod ignora o .strict() quando o campo extra é uma string",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API valida o cadastro com criarUsuarioSchema = z.object({ nome: z.string(), email: z.email() }), sem nenhum campo de permissão no schema. O cliente envia, no corpo, nome, email e também isAdmin: true. O resultado de .parse() contém isAdmin?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não: campos fora do schema são descartados por padrão automaticamente",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque parse sempre preserva o req.body original por completo",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só porque o valor enviado é do tipo booleano",
                                "isCorrect": false
                            },
                            {
                                "text": "Depende da ordem em que os campos aparecem no JSON enviado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota GET /tarefas?limite=10 precisa validar limite como número usando Zod, mas req.query.limite chega como a string \"10\". Qual abordagem resolve isso corretamente dentro do schema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Usar z.coerce.number() no campo, que converte o valor para número antes de aplicar o restante das regras",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar z.number() normalmente, já que o Zod converte strings numéricas automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar req.query por req.params nessa rota, que já chega como número",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é possível validar valores de query com Zod; a conversão precisa ser manual antes de chamar o schema",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Respostas, status e tratamento de erros",
        "aulas": [
            {
                "titulo": "Enviando respostas com res.status().json()",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Toda resposta é status e corpo\n\nDesde o Módulo 1 suas rotas devolvem alguma coisa para quem chamou, mas até agora o foco estava em fazer a rota funcionar, não em responder direito. Uma resposta HTTP sempre tem duas partes: um **status** (o código de três dígitos que você já viu na trilha de Protocolos da Web, tipo 200 ou 404) e um **corpo**, quase sempre JSON numa API.\n\nNo Express, quem monta essa resposta é o objeto `res`. Os dois métodos que você vai usar o tempo todo são `res.status()` e `res.json()`, encadeados assim: `res.status(200).json(dados)`."
                    },
                    {
                        "type": "code",
                        "value": "const express = require('express');\nconst app = express();\n\napp.use(express.json());\n\nconst tarefas = [\n  { id: 1, titulo: 'Estudar Express', concluida: false },\n  { id: 2, titulo: 'Revisar Zod', concluida: true },\n];\n\napp.get('/tarefas', (req, res) => {\n  res.status(200).json(tarefas);\n});\n\napp.listen(3000, () => console.log('Servidor rodando na porta 3000'));"
                    },
                    {
                        "type": "text",
                        "value": "`res.status(200)` define o código de status da resposta e devolve o próprio `res`, por isso dá pra encadear o `.json()` na sequência. `res.json(tarefas)` transforma o array em JSON, define o cabeçalho `Content-Type: application/json` e envia a resposta.\n\nSe você não chamar `.status()`, o Express manda **200** por padrão. Tecnicamente `res.json(tarefas)` sozinho já resolveria esse GET. Ainda assim, o hábito de escrever `.status()` de forma explícita vale a pena: quando a rota cresce e passa a ter vários caminhos possíveis (achou o recurso, não achou, deu erro), fica claro pra quem lê o código qual status cada caminho devolve, sem depender de um padrão implícito."
                    },
                    {
                        "type": "code",
                        "value": "app.post('/tarefas', (req, res) => {\n  const novaTarefa = {\n    id: tarefas.length + 1,\n    titulo: req.body.titulo,\n    concluida: false,\n  };\n\n  tarefas.push(novaTarefa);\n\n  res.status(201).json(novaTarefa);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## res.json() ou res.send()?\n\nO Express também tem `res.send()`, e é comum ver os dois sendo usados meio ao acaso. Na prática, quando você manda um objeto ou array, os dois se comportam igual: `res.send(tarefas)` funciona porque, por baixo dos panos, o Express percebe que o valor não é string nem Buffer e chama `res.json()` para você.\n\nA diferença aparece com valores simples. `res.send('ok')` manda o texto puro ok, com `Content-Type: text/html`. Já `res.json('ok')` manda \"ok\" entre aspas, como JSON válido, com `Content-Type: application/json`. Numa API que promete sempre devolver JSON, `res.json()` é a escolha mais segura: o formato da resposta não muda dependendo do tipo do valor que você passou para ela."
                    },
                    {
                        "type": "code",
                        "value": "// para um objeto, o efeito e o mesmo:\nres.send(novaTarefa);\nres.json(novaTarefa);\n\n// mas para um valor simples, o resultado muda:\nres.send('ok');   // corpo: ok            (Content-Type: text/html)\nres.json('ok');   // corpo: \"ok\"          (Content-Type: application/json)"
                    },
                    {
                        "type": "quote",
                        "value": "Toda resposta é status e corpo. Prefira sempre `res.status(codigo).json(dados)`, mesmo quando o status é 200: isso deixa explícito o que a rota está prometendo para quem chama."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a forma idiomática de responder com status 201 e um corpo JSON no Express?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "res.status(201).json(dados)",
                                "isCorrect": true
                            },
                            {
                                "text": "res.json(201, dados)",
                                "isCorrect": false
                            },
                            {
                                "text": "res.send(201).json(dados)",
                                "isCorrect": false
                            },
                            {
                                "text": "res(201).json(dados)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se uma rota chama apenas res.json(dados), sem chamar .status() antes, qual status é enviado na resposta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "200, porque é o status padrão do Express quando nada é definido",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum status é enviado, e a requisição fica pendente para sempre",
                                "isCorrect": false
                            },
                            {
                                "text": "500, porque faltou definir o status manualmente antes do corpo",
                                "isCorrect": false
                            },
                            {
                                "text": "204, porque não houve nenhuma chamada explícita a status()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota GET /tarefas precisa devolver a lista de tarefas garantindo que o cabeçalho Content-Type da resposta seja application/json, sem depender do tipo do valor retornado. Qual chamada atende isso da forma mais direta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "res.json(tarefas)",
                                "isCorrect": true
                            },
                            {
                                "text": "res.write(JSON.stringify(tarefas))",
                                "isCorrect": false
                            },
                            {
                                "text": "res.send(tarefas.toString())",
                                "isCorrect": false
                            },
                            {
                                "text": "res.end(tarefas)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota estava usando res.send(novaTarefa) para devolver um objeto recém criado, e funcionava normalmente. Mesmo assim, o time decidiu padronizar todas as rotas da API para usar sempre res.json(). Qual é a justificativa técnica mais forte para essa escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "res.json() sempre fixa Content-Type JSON; res.send() varia com o tipo do valor",
                                "isCorrect": true
                            },
                            {
                                "text": "res.send() não existe mais nas versões mais recentes do Express, foi removido",
                                "isCorrect": false
                            },
                            {
                                "text": "res.json() roda mais rápido que res.send(), otimizado pelo motor do Node.js",
                                "isCorrect": false
                            },
                            {
                                "text": "res.send() não aceita objetos JavaScript como argumento, só texto puro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um handler escreveu res.json(tarefa).status(201) no lugar de res.status(201).json(tarefa). Qual o efeito prático dessa inversão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sai com status 200 padrão, pois .json() já envia a resposta antes do .status()",
                                "isCorrect": true
                            },
                            {
                                "text": "O Express detecta a inversão e reordena as chamadas, enviando 201 do mesmo jeito",
                                "isCorrect": false
                            },
                            {
                                "text": "O código não executa, pois .json() não pode ser encadeado antes de .status()",
                                "isCorrect": false
                            },
                            {
                                "text": "Sai com status 404, porque o Express lê a ordem invertida como rota inexistente",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escolhendo o status HTTP certo na prática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Da teoria pra rota de verdade\n\nNa trilha de Protocolos da Web você viu as famílias de status: 2xx para sucesso, 4xx para erro de quem fez a requisição, 5xx para erro do servidor. Agora é hora de aplicar isso rota por rota, na API de tarefas que você vem construindo.\n\nA pergunta que toda rota deveria responder é: o que aconteceu aqui, exatamente? Achou o recurso? Criou um novo? Removeu? O cliente mandou algo inválido? Cada situação tem um status certo, e usar o errado (por exemplo, devolver 200 quando na verdade deu erro) engana quem está do outro lado da API."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ação\",\"Status\",\"Quando usar\"],[\"GET /tarefas\",\"200 OK\",\"Listou as tarefas (mesmo que a lista esteja vazia)\"],[\"GET /tarefas/:id (achou)\",\"200 OK\",\"Encontrou o recurso pedido\"],[\"POST /tarefas\",\"201 Created\",\"Criou um recurso novo com sucesso\"],[\"PUT ou PATCH /tarefas/:id\",\"200 OK\",\"Atualizou um recurso existente\"],[\"DELETE /tarefas/:id\",\"204 No Content\",\"Removeu com sucesso, sem corpo na resposta\"],[\"Corpo da requisição inválido\",\"400 Bad Request\",\"Os dados enviados não passam na validação\"],[\"GET, PUT ou DELETE com id inexistente\",\"404 Not Found\",\"O id não corresponde a nenhum recurso\"],[\"Erro inesperado no servidor\",\"500 Internal Server Error\",\"Uma exceção que não era esperada estourou no meio do caminho\"]]"
                    },
                    {
                        "type": "code",
                        "value": "app.delete('/tarefas/:id', (req, res) => {\n  const indice = tarefas.findIndex((t) => t.id === Number(req.params.id));\n\n  if (indice === -1) {\n    return res.status(404).json({ error: { message: 'Tarefa não encontrada' } });\n  }\n\n  tarefas.splice(indice, 1);\n\n  res.status(204).end();\n});"
                    },
                    {
                        "type": "text",
                        "value": "Repare no `res.status(204).end()`: o status 204 significa \"deu certo, e não tem nada pra te mostrar de volta\". Por isso a resposta não leva corpo nenhum, nem um JSON vazio. `.end()` finaliza a resposta sem escrever nada nela. `res.status(204).json({})` até funcionaria tecnicamente, mas iria contra o que o próprio status promete: 204 é \"sem conteúdo\"."
                    },
                    {
                        "type": "text",
                        "value": "## O 404 tem duas origens diferentes\n\nSe o cliente chamar uma rota que não existe (por exemplo, `GET /tarefass`, com um \"s\" a mais), o próprio Express já devolve 404 sozinho, sem você escrever nada: nenhuma rota bateu com aquele caminho.\n\nO 404 que você precisa tratar na mão é outro: a rota existe (`GET /tarefas/:id` bateu certinho), mas o recurso pedido não existe nos dados da aplicação. Isso o Express não sabe decidir sozinho, porque só o seu código conhece as regras da aplicação."
                    },
                    {
                        "type": "code",
                        "value": "app.get('/tarefas/:id', (req, res) => {\n  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));\n\n  if (!tarefa) {\n    return res.status(404).json({ error: { message: 'Tarefa não encontrada' } });\n  }\n\n  res.status(200).json(tarefa);\n});"
                    },
                    {
                        "type": "quote",
                        "value": "200 leu, 201 criou, 204 removeu sem corpo, 400 o cliente errou, 404 não achou, 500 o servidor quebrou. Esses seis status cobrem a grande maioria das respostas de uma API REST."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual status HTTP é o mais adequado para uma rota POST que cria um novo recurso com sucesso?",
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
                                "text": "500 Internal Server Error",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota DELETE /tarefas/:id remove a tarefa com sucesso e a resposta não tem nenhum corpo. Qual status representa melhor essa situação?",
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
                                "text": "202 Accepted",
                                "isCorrect": false
                            },
                            {
                                "text": "404 Not Found",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A rota GET /tarefas/:id procura uma tarefa pelo id recebido e não encontra nenhuma correspondente nos dados da aplicação. O que a rota deve responder?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "status 404 com um corpo JSON explicando que o recurso não foi encontrado",
                                "isCorrect": true
                            },
                            {
                                "text": "status 200 com um array vazio no lugar do objeto esperado",
                                "isCorrect": false
                            },
                            {
                                "text": "status 400, já que um id que não existe é considerado uma requisição inválida",
                                "isCorrect": false
                            },
                            {
                                "text": "nenhuma resposta, deixando a conexão em aberto até o cliente desistir",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa rota POST /tarefas, o corpo da requisição chega sem o campo titulo, que é obrigatório pela validação. Qual o status HTTP correto para essa resposta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "400 Bad Request",
                                "isCorrect": true
                            },
                            {
                                "text": "404 Not Found",
                                "isCorrect": false
                            },
                            {
                                "text": "200 OK, já que a rota conseguiu processar a requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "500 Internal Server Error",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente faz uma requisição para um caminho que não corresponde a nenhuma rota definida na aplicação Express, algo como GET /tarefass em vez de /tarefas. Qual status o cliente recebe, e por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "404, porque o Express já responde sozinho quando nenhuma rota bate com o caminho",
                                "isCorrect": true
                            },
                            {
                                "text": "500, porque toda rota inexistente é tratada como erro interno do servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "400, porque o Express interpreta um caminho desconhecido como requisição malformada",
                                "isCorrect": false
                            },
                            {
                                "text": "nenhum status é enviado, porque só rotas explícitas geram alguma resposta",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Um formato de erro consistente para toda a API",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Erro também é contrato\n\nRepare como, na aula passada, toda resposta de erro que escrevemos seguiu o mesmo desenho: `{ error: { message: '...' } }`. Isso não foi acaso. Uma API que devolve erro de um jeito numa rota e de outro jeito na rota vizinha obriga quem consome ela (o front-end, um app mobile, outro serviço) a tratar cada chamada de um jeito diferente. Isso é tão ruim quanto mudar o formato dos dados de sucesso de rota pra rota.\n\nFormato de erro consistente é parte do contrato da sua API, do mesmo jeito que o formato dos dados de sucesso é."
                    },
                    {
                        "type": "code",
                        "value": "// tres rotas da mesma API, tres formatos de erro diferentes: um problema real\napp.get('/tarefas/:id', (req, res) => {\n  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));\n  if (!tarefa) return res.status(404).send('nao encontrado');\n  res.json(tarefa);\n});\n\napp.post('/tarefas', (req, res) => {\n  if (!req.body.titulo) return res.status(400).json({ msg: 'titulo obrigatorio' });\n  // ...\n});\n\napp.delete('/tarefas/:id', (req, res) => {\n  const indice = tarefas.findIndex((t) => t.id === Number(req.params.id));\n  if (indice === -1) return res.status(404).json({ erro: 'nao existe' });\n  // ...\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Um envelope só, para toda rota\n\nA solução é escolher um formato e usar em toda resposta de erro da API, sem exceção. Um envelope simples, que cobre a maioria dos casos:\n\n- **message**: texto legível explicando o que deu errado, para exibir ou logar.\n- **details**: opcional, informação extra estruturada, por exemplo quais campos falharam numa validação.\n\nEm JSON: `{ \"error\": { \"message\": \"Tarefa não encontrada\" } }`. Sempre dentro de uma chave `error`, sempre com `message`, e `details` só quando fizer sentido."
                    },
                    {
                        "type": "code",
                        "value": "function erroResposta(res, status, message, details) {\n  return res.status(status).json({\n    error: {\n      message,\n      ...(details && { details }),\n    },\n  });\n}\n\napp.get('/tarefas/:id', (req, res) => {\n  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));\n\n  if (!tarefa) {\n    return erroResposta(res, 404, 'Tarefa não encontrada');\n  }\n\n  res.status(200).json(tarefa);\n});"
                    },
                    {
                        "type": "code",
                        "value": "// safeParse e parecido com o parse() do modulo passado, mas em vez de lancar\n// um erro quando os dados sao invalidos, devolve um objeto com \"success\" e,\n// quando success e false, o \"error\" com os detalhes\nconst { tarefaSchema } = require('./schemas/tarefa');\n\napp.post('/tarefas', (req, res) => {\n  const resultado = tarefaSchema.safeParse(req.body);\n\n  if (!resultado.success) {\n    return erroResposta(res, 400, 'Dados inválidos', resultado.error.flatten().fieldErrors);\n  }\n\n  const novaTarefa = { id: tarefas.length + 1, ...resultado.data, concluida: false };\n  tarefas.push(novaTarefa);\n  res.status(201).json(novaTarefa);\n});"
                    },
                    {
                        "type": "text",
                        "value": "Do outro lado, quem consome essa API escreve uma única função para tratar qualquer erro, de qualquer rota: lê `error.message` para mostrar ao usuário e, se precisar, `error.details` para saber exatamente quais campos corrigir. Sem esse combinado, cada chamada de API no front precisaria de um tratamento especial, só porque uma rota manda `msg` e outra manda `erro`."
                    },
                    {
                        "type": "quote",
                        "value": "Formato de erro consistente é um contrato: sempre `{ error: { message, details } }`, em toda rota, sem exceção. Isso importa mais do que parece, sobretudo quando a API cresce e várias pessoas passam a mexer nela."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que é importante que todas as rotas de uma API sigam o mesmo formato de resposta de erro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque quem consome a API trata qualquer erro de forma genérica, sem código extra",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Express recusa iniciar se detectar formatos de erro diferentes entre rotas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque isso deixa a resposta HTTP visivelmente mais rápida de ser enviada",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque é a única forma correta de usar res.status() no Express",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No envelope de erro { error: { message, details } }, qual conteúdo é mais adequado para o campo message?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "uma descrição legível do problema, como \"Tarefa não encontrada\"",
                                "isCorrect": true
                            },
                            {
                                "text": "o stack trace completo do erro, para facilitar a depuração pelo cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "o código-fonte da rota que gerou o erro",
                                "isCorrect": false
                            },
                            {
                                "text": "o identificador interno do processo do Node.js que atendeu a requisição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API tem hoje três formatos de erro diferentes entre suas rotas: uma devolve uma string simples, outra devolve { msg: \"...\" }, outra devolve { erro: \"...\" }. O time de front-end reclama que precisa de um tratamento diferente para cada chamada. Qual é a solução mais direta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "padronizar todas as rotas para responder erro sempre no mesmo formato",
                                "isCorrect": true
                            },
                            {
                                "text": "orientar o front-end a colocar cada chamada dentro de um try/catch separado",
                                "isCorrect": false
                            },
                            {
                                "text": "remover as mensagens de erro das respostas, deixando só o status HTTP",
                                "isCorrect": false
                            },
                            {
                                "text": "trocar o Express por outro framework que já obrigue um formato fixo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma validação com Zod falha e devolve uma lista dos campos que não passaram. Nessa lista, dentro do envelope { error: { message, details } }, onde ela deveria entrar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "no campo details, mantendo message como um resumo curto do problema",
                                "isCorrect": true
                            },
                            {
                                "text": "direto na raiz do JSON de resposta, fora do objeto error",
                                "isCorrect": false
                            },
                            {
                                "text": "concatenada dentro do próprio message, junto com o resumo",
                                "isCorrect": false
                            },
                            {
                                "text": "em uma rota separada, que o cliente precisa consultar depois para saber o motivo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função erroResposta(res, status, message, details) monta sempre o mesmo envelope de erro. Em uma rota de validação, um desenvolvedor chama erroResposta(res, 200, \"Dados inválidos\") por engano, passando 200 no lugar de 400. O corpo JSON sai no formato certo. O que quebra mesmo assim?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "o cliente entende a resposta como sucesso, pois 200 não combina com um corpo de erro",
                                "isCorrect": true
                            },
                            {
                                "text": "o Express rejeita o envio, porque status de sucesso e corpo de erro são incompatíveis",
                                "isCorrect": false
                            },
                            {
                                "text": "o JSON fica malformado, já que o status errado invalida a serialização",
                                "isCorrect": false
                            },
                            {
                                "text": "a função lança uma exceção ao perceber que o status não combina com um erro",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tratamento centralizado com middleware de erro",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Parar de repetir o mesmo tratamento em toda rota\n\nOlhando pro que você escreveu até aqui, um padrão chato aparece: quase toda rota tem um pedaço de código só para montar a resposta de erro, chamando `erroResposta` (ou escrevendo `res.status().json()` na mão) em vários pontos diferentes. Funciona, mas espalha a mesma responsabilidade por dezenas de rotas.\n\nO Express tem um jeito de centralizar isso: um tipo especial de middleware, que só existe para tratar erros."
                    },
                    {
                        "type": "text",
                        "value": "## O middleware com quatro parâmetros\n\nTodo middleware normal no Express recebe três parâmetros: `(req, res, next)`. Um middleware de tratamento de erro recebe **quatro**, sempre com o erro em primeiro lugar: `(err, req, res, next)`.\n\nEssa contagem não é estilo, é como o Express reconhece a função como tratadora de erro. Os quatro parâmetros são obrigatórios, mesmo que você não use `next` dentro da função. E chamar `next(erro)`, passando um valor, é diferente de chamar `next()` sem nada: `next()` sozinho segue para o próximo middleware normal da fila, enquanto `next(erro)` pula direto para o primeiro middleware de erro que existir na pilha."
                    },
                    {
                        "type": "code",
                        "value": "// ERRADO: 3 parametros, o Express trata como middleware comum\n// e essa funcao NUNCA e chamada quando um erro acontece\nfunction tratadorDeErros(req, res, next) {\n  res.status(500).json({ error: { message: 'algo deu errado' } });\n}\n\n// CORRETO: 4 parametros, com o erro em primeiro lugar\nfunction tratadorDeErros(err, req, res, next) {\n  res.status(500).json({ error: { message: 'algo deu errado' } });\n}"
                    },
                    {
                        "type": "code",
                        "value": "class ErroHttp extends Error {\n  constructor(status, message) {\n    super(message);\n    this.status = status;\n  }\n}\n\napp.get('/tarefas/:id', (req, res, next) => {\n  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));\n\n  if (!tarefa) {\n    return next(new ErroHttp(404, 'Tarefa não encontrada'));\n  }\n\n  res.status(200).json(tarefa);\n});"
                    },
                    {
                        "type": "code",
                        "value": "function tratadorDeErros(err, req, res, next) {\n  console.error(err);\n\n  const status = err.status || 500;\n  const message = err.status ? err.message : 'Erro interno do servidor';\n\n  res.status(status).json({ error: { message } });\n}\n\n// rotas primeiro\napp.get('/tarefas', (req, res) => { /* ... */ });\napp.post('/tarefas', (req, res) => { /* ... */ });\napp.get('/tarefas/:id', (req, res, next) => { /* ... */ });\n\n// middleware de erro por ultimo, depois de todas as rotas\napp.use(tratadorDeErros);\n\napp.listen(3000);"
                    },
                    {
                        "type": "text",
                        "value": "A posição de `app.use(tratadorDeErros)` importa: ele precisa vir **depois** de todas as rotas e demais middlewares no arquivo. O Express percorre a pilha na ordem em que ela foi registrada, então um middleware de erro declarado antes das rotas nunca seria alcançado por elas.\n\nRepare também que, para um erro inesperado (sem `status` definido, ou seja, um bug de verdade), a mensagem que volta pro cliente é genérica, enquanto `console.error(err)` guarda o detalhe completo só no log do servidor. Detalhe interno de erro é informação para quem mantém a API, não para quem consome ela."
                    },
                    {
                        "type": "quote",
                        "value": "Middleware de erro: quatro parâmetros `(err, req, res, next)`, registrado por último, acionado com `next(err)`. Ele é o único lugar que decide como cada erro vira uma resposta HTTP."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quantos parâmetros uma função de middleware precisa declarar para o Express reconhecê-la como middleware de tratamento de erro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "4: (err, req, res, next)",
                                "isCorrect": true
                            },
                            {
                                "text": "3: (req, res, next)",
                                "isCorrect": false
                            },
                            {
                                "text": "2: (err, next)",
                                "isCorrect": false
                            },
                            {
                                "text": "1: (err)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em relação às rotas da aplicação, onde o middleware de tratamento de erro deve ser registrado com app.use()?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "depois de todas as rotas e demais middlewares, por último no arquivo",
                                "isCorrect": true
                            },
                            {
                                "text": "antes de todas as rotas, logo no início do arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "em qualquer posição, já que o Express reordena os middlewares automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "entre os middlewares embutidos e os de terceiros, sempre no meio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de uma rota, um erro precisa acionar o middleware de tratamento de erro central, em vez de a própria rota montar a resposta. Qual chamada faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "next(err), passando o erro adiante",
                                "isCorrect": true
                            },
                            {
                                "text": "next(), chamado sem nenhum argumento",
                                "isCorrect": false
                            },
                            {
                                "text": "res.error(err), direto no handler",
                                "isCorrect": false
                            },
                            {
                                "text": "return err, dentro do corpo da rota",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time registrou app.use(tratadorDeErros) logo depois de app.use(express.json()), mas antes de todas as rotas (app.get, app.post etc). Ao testar, os erros das rotas nunca chegam no tratadorDeErros. Qual o motivo mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "o middleware de erro precisa vir depois das rotas, senão o Express nunca o alcança",
                                "isCorrect": true
                            },
                            {
                                "text": "o nome da função tratadorDeErros está incorreto e precisa ser exatamente errorHandler",
                                "isCorrect": false
                            },
                            {
                                "text": "faltou chamar app.listen() imediatamente depois do middleware de erro",
                                "isCorrect": false
                            },
                            {
                                "text": "o Express só aceita um middleware de erro por arquivo de rotas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um middleware de erro foi escrito assim: function tratadorDeErros(req, res, next) { res.status(500).json({ error: { message: err.message } }); }. Ele nunca é chamado quando as rotas fazem next(err). Qual é o bug?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "falta o parâmetro err; com três parâmetros, vira middleware comum, não de erro",
                                "isCorrect": true
                            },
                            {
                                "text": "o res.status(500) deveria vir depois do res.json() na mesma linha",
                                "isCorrect": false
                            },
                            {
                                "text": "as chamadas next(err) nas rotas deveriam usar await next(err)",
                                "isCorrect": false
                            },
                            {
                                "text": "a função precisa se chamar exatamente errorHandler para o Express reconhecer",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Erros em código assíncrono: try/catch e next(err)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O middleware de erro não pega tudo sozinho\n\nO `tratadorDeErros` que você acabou de montar funciona muito bem para erros síncronos: se algo dentro de uma rota lança uma exceção na hora (um `throw`, ou um `next(erro)` direto), o Express intercepta e encaminha para o middleware de erro sem você precisar fazer nada extra.\n\nSó que sua API de tarefas vai crescer, e cedo ou tarde vai precisar esperar por alguma coisa: uma consulta a um banco de dados, uma chamada para outro serviço. Isso significa código assíncrono, com `async`/`await`. E aí a regra muda."
                    },
                    {
                        "type": "code",
                        "value": "// simula uma operacao que so fica pronta depois de um tempo,\n// como aconteceria numa consulta a um banco de dados de verdade\nfunction buscarTarefaAsync(id) {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      const tarefa = tarefas.find((t) => t.id === id);\n      if (!tarefa) return reject(new ErroHttp(404, 'Tarefa não encontrada'));\n      resolve(tarefa);\n    }, 50);\n  });\n}\n\n// ARRISCADO: sem try/catch\napp.get('/tarefas/:id', async (req, res) => {\n  const tarefa = await buscarTarefaAsync(Number(req.params.id));\n  res.status(200).json(tarefa);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso é arriscado\n\nQuando `buscarTarefaAsync` rejeita, esse erro estoura dentro da função `async`, mas de um jeito diferente de um `throw` síncrono. O Express consegue interceptar sozinho um erro que acontece direto dentro do corpo da rota, no momento em que ela é chamada. Uma Promise que rejeita depois de um `await` acontece mais tarde, fora desse momento inicial: nem toda versão do Express consegue pegar isso sozinha (no Express 4, por exemplo, não pega).\n\nPor isso tratar erro assíncrono na mão, com `try`/`catch` e `next(err)` dentro do `catch`, é o caminho mais seguro: funciona sempre, não importa a versão do framework, e ainda te dá a chance de fazer algo com o erro antes de repassar. Sem esse cuidado, a resposta pode nunca ser enviada, o cliente fica esperando, e o `tratadorDeErros` não é chamado."
                    },
                    {
                        "type": "code",
                        "value": "app.get('/tarefas/:id', async (req, res, next) => {\n  try {\n    const tarefa = await buscarTarefaAsync(Number(req.params.id));\n    res.status(200).json(tarefa);\n  } catch (err) {\n    next(err);\n  }\n});\n\napp.post('/tarefas', async (req, res, next) => {\n  try {\n    const dados = tarefaSchema.parse(req.body); // lanca ZodError se for invalido\n    const novaTarefa = await salvarTarefaAsync({ ...dados, concluida: false });\n    res.status(201).json(novaTarefa);\n  } catch (err) {\n    next(err);\n  }\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Evitando repetir o mesmo try/catch\n\nReparou que as duas rotas acima têm exatamente a mesma casca ao redor, um `try` que termina em `catch (err) { next(err); }`? É repetitivo, e é fácil esquecer numa rota nova daqui a três meses. Uma solução comum (não é algo embutido no Express, é uma função pequena que você mesmo escreve, no mesmo espírito de pacotes como o `express-async-handler`) é um wrapper: uma função que recebe seu handler assíncrono e devolve outra já com o `.catch(next)` embutido."
                    },
                    {
                        "type": "code",
                        "value": "function asyncHandler(fn) {\n  return (req, res, next) => {\n    fn(req, res, next).catch(next);\n  };\n}\n\napp.get('/tarefas/:id', asyncHandler(async (req, res) => {\n  const tarefa = await buscarTarefaAsync(Number(req.params.id));\n  res.status(200).json(tarefa);\n}));"
                    },
                    {
                        "type": "quote",
                        "value": "Em rota assíncrona, não conte com o Express para pegar sozinho o erro de uma Promise rejeitada. A regra é sempre a mesma: `try`, `await`, `catch (err)`, `next(err)`. É esse `next(err)` que liga o código assíncrono ao middleware de tratamento de erro que você centralizou na aula passada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o padrão correto para garantir que um erro dentro de uma rota async chegue até o middleware de tratamento de erro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "envolver o código em try/catch e chamar next(err) dentro do catch",
                                "isCorrect": true
                            },
                            {
                                "text": "usar apenas await, já que o Express detecta e encaminha erros assíncronos sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "chamar res.status(500) diretamente dentro do catch, sem usar next()",
                                "isCorrect": false
                            },
                            {
                                "text": "não é preciso try/catch: qualquer função async já propaga erros para o Express automaticamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro do bloco catch de uma rota async, qual chamada encaminha o erro para o middleware de tratamento de erro central, em vez de responder diretamente ao cliente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "next(err)",
                                "isCorrect": true
                            },
                            {
                                "text": "return err",
                                "isCorrect": false
                            },
                            {
                                "text": "res.json(err)",
                                "isCorrect": false
                            },
                            {
                                "text": "throw new Error(err)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota async executa await buscarTarefaAsync(id) sem nenhum try/catch ao redor. Se essa Promise for rejeitada, por que não é seguro contar apenas com o comportamento padrão do Express para essa rota chegar até o middleware de erro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "uma rejeição após await não é como um throw síncrono; nem todo Express encaminha isso sozinho",
                                "isCorrect": true
                            },
                            {
                                "text": "porque o Express nunca consegue processar código assíncrono dentro de rotas, em nenhuma versão",
                                "isCorrect": false
                            },
                            {
                                "text": "porque await só funciona dentro de middlewares, nunca dentro de rotas",
                                "isCorrect": false
                            },
                            {
                                "text": "porque a Promise precisa ser convertida em string antes de o Express conseguir lê-la",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor criou uma função asyncHandler(fn) que envolve rotas async e executa fn(req, res, next).catch(next) automaticamente. Qual o principal benefício de usar essa função nas rotas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "evita repetir try/catch em cada rota; encaminha a rejeição direto para next(err)",
                                "isCorrect": true
                            },
                            {
                                "text": "faz as rotas responderem mais rápido, pulando a execução do middleware de erro",
                                "isCorrect": false
                            },
                            {
                                "text": "substitui a necessidade de declarar o middleware de erro com 4 parâmetros",
                                "isCorrect": false
                            },
                            {
                                "text": "é um recurso nativo do Express a partir da versão 4, embutido no framework",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota está assim: app.post(\"/tarefas\", async (req, res, next) => { try { const dados = tarefaSchema.parse(req.body); const nova = await salvarTarefaAsync(dados); res.status(201).json(nova); } catch (err) { res.status(400).json({ error: { message: err.message } }); } }). Qual problema existe nesse catch, mesmo capturando o erro corretamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "o catch sempre responde 400, mesmo quando o erro real mereceria 500",
                                "isCorrect": true
                            },
                            {
                                "text": "a sintaxe do try/catch está incorreta quando usada dentro de uma função async",
                                "isCorrect": false
                            },
                            {
                                "text": "async e try/catch não podem ser combinados na mesma função no Express",
                                "isCorrect": false
                            },
                            {
                                "text": "res.status(400) precisaria ser chamado antes do await, não depois",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Estrutura de um projeto de API",
        "aulas": [
            {
                "titulo": "Por que dividir em camadas: rotas, controllers e services",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que dividir em camadas: rotas, controllers e services\n\nNos módulos anteriores o seu projeto cresceu rápido. Você definiu rotas para o recurso `tarefas`, aprendeu a organizar tudo com `express.Router`, montou uma cadeia de middlewares (log, `express.json`, `cors`, `helmet`), validou o corpo da requisição com Zod e centralizou o tratamento de erros num middleware de 4 argumentos. Cada peça, isolada, fazia sentido. O problema é que, se você foi escrevendo tudo dentro de um ou dois arquivos, esse arquivo hoje provavelmente já está gigante, com rotas, validação e regra de negócio todas misturadas na mesma função.\n\nEste módulo resolve isso: você vai aprender a **organizar um projeto Express de verdade**, separando responsabilidades em camadas, e vai fechar com um CRUD completo de tarefas construído do jeito certo, de ponta a ponta."
                    },
                    {
                        "type": "code",
                        "value": "// app.js (do jeito que não deve ficar, a partir de um certo tamanho)\nconst express = require(\"express\");\nconst { z } = require(\"zod\");\nconst app = express();\napp.use(express.json());\n\nlet tarefas = [];\nlet proximoId = 1;\n\nconst tarefaSchema = z.object({ titulo: z.string().min(3) });\n\napp.get(\"/tarefas\", (req, res) => {\n  res.status(200).json(tarefas);\n});\n\napp.post(\"/tarefas\", (req, res) => {\n  const resultado = tarefaSchema.safeParse(req.body);\n  if (!resultado.success) {\n    return res.status(400).json({ erro: \"Dados inválidos\" });\n  }\n  const novaTarefa = { id: proximoId++, titulo: resultado.data.titulo, concluida: false };\n  tarefas.push(novaTarefa);\n  res.status(201).json(novaTarefa);\n});\n\n// ... e mais umas 10 rotas assim, cada uma repetindo validação,\n// regra de negócio e acesso aos dados na própria função da rota\n\napp.listen(3000);"
                    },
                    {
                        "type": "text",
                        "value": "## Os sintomas de um arquivo que cresceu demais\n\nEsse `app.js` funciona, mas cobra um preço conforme o projeto cresce:\n\n- **Fica difícil de achar coisa.** Precisa mexer na regra de criação de tarefa? É preciso ler a rota inteira para separar o que é HTTP (ler `req.body`, devolver status) do que é regra de negócio (gerar o id, decidir valores padrão).\n- **Mistura camadas diferentes.** A mesma função sabe como ler uma requisição, como validar dados e como guardar uma tarefa. Três responsabilidades, uma função só.\n- **Difícil de testar isoladamente.** Para testar só a regra \"toda tarefa nova nasce com concluida igual a false\", você precisaria simular um req e um res inteiros, só para chegar na regra de negócio escondida no meio da rota.\n- **Difícil de reaproveitar.** Se amanhã você precisar criar uma tarefa a partir de outro lugar (um script de importação, uma tarefa agendada), a lógica está presa dentro do handler da rota, acoplada ao Express.\n- **Gera conflito de equipe.** Com várias pessoas mexendo no mesmo arquivo enorme, toda mudança pequena vira um conflito de merge."
                    },
                    {
                        "type": "text",
                        "value": "## A solução: três camadas, três responsabilidades\n\nA organização mais comum (e a que você vai usar daqui pra frente) separa o projeto em três camadas:\n\n- **Rotas**: dizem qual caminho e método aciona qual função. Não têm lógica, só ligação.\n- **Controllers**: falam a língua do HTTP. Recebem `req` e `res`, extraem o que interessa da requisição, chamam a camada de baixo e devolvem a resposta com o status certo.\n- **Services**: guardam a regra de negócio de verdade. Não sabem o que é um `req` ou um `res`; sabem como criar uma tarefa, como decidir se ela pode ser removida, como calcular o que precisa ser calculado.\n\nUma forma de fixar a ideia: pense num restaurante. A rota é a placa que diz qual mesa fica em qual corredor. O garçom (controller) anota o pedido do cliente, traduz para a cozinha e depois traz o prato de volta. A cozinha (service) é quem realmente prepara a comida, sem nunca conversar diretamente com o cliente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\",\"O que faz\",\"Conhece\",\"Não deveria fazer\"],[\"Rotas\",\"Liga um método + caminho a uma função do controller\",\"express.Router, os controllers\",\"Ler req.body, validar dados, guardar tarefas\"],[\"Controllers\",\"Lê a requisição, chama o service, monta a resposta HTTP\",\"req, res, next, os services\",\"Regra de negócio, acesso direto aos dados\"],[\"Services\",\"Executa a regra de negócio e mexe nos dados\",\"As próprias regras e a fonte de dados\",\"req, res, status HTTP\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// versão resumida, só para mostrar o fluxo entre as camadas\n// (tratamento de erro completo vem nas próximas aulas)\n\n// routes/tarefas.routes.js\nrouter.post(\"/\", tarefasController.criar);\n\n// controllers/tarefas.controller.js\nasync function criar(req, res, next) {\n  const novaTarefa = await tarefaService.criar(req.body);\n  res.status(201).json(novaTarefa);\n}\n\n// services/tarefas.service.js\nfunction criar(dados) {\n  return { id: proximoId++, titulo: dados.titulo, concluida: false };\n}"
                    },
                    {
                        "type": "quote",
                        "value": "Rotas ligam, controllers traduzem HTTP, services executam a regra de negócio. Cada camada só conhece a de baixo, nunca a de cima: um service não sabe que existe um Express rodando por trás dele. Essa regra simples é o que mantém um projeto grande organizado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal vantagem de separar um projeto Express em rotas, controllers e services, em vez de deixar tudo em um único arquivo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cada camada ganha responsabilidade clara, mais fácil de achar e testar.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Express passa a responder as requisições visivelmente mais rápido.",
                                "isCorrect": false
                            },
                            {
                                "text": "O projeto deixa de precisar de um arquivo principal, tipo app.js.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Node.js exige essa separação a partir de um certo número de rotas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na arquitetura em camadas rotas -> controllers -> services, qual é a responsabilidade do controller?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Acessar diretamente o banco de dados e devolver o resultado bruto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Receber a requisição, chamar o service e devolver a resposta HTTP com o status adequado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir os middlewares globais da aplicação, como cors e helmet.",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar as regras de negócio, como o cálculo de valores e verificações de duplicidade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A função criarTarefa do service é chamada tanto pela rota POST /tarefas quanto por um script de importação em lote que roda fora do Express. Por que isso é possível sem duplicar código?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a regra de negócio vive isolada no service, sem depender do Express.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Express permite rodar scripts externos dentro do mesmo processo do servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o controller intercepta chamadas externas automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Node.js compartilha variáveis entre todos os arquivos do projeto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O arquivo app.js de um projeto cresceu para mais de 400 linhas, misturando definição de rotas, validação com Zod e regra de negócio na mesma função. Qual é um risco real dessa organização?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Node.js recusa executar arquivos acima de um certo número de linhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fica difícil testar a regra de negócio isoladamente, porque ela está amarrada a req e res.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Express passa a exigir o uso obrigatório de TypeScript.",
                                "isCorrect": false
                            },
                            {
                                "text": "A aplicação passa a consumir mais memória RAM proporcionalmente ao número de linhas do arquivo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa arquitetura de camadas bem separada, qual das opções abaixo é uma prática que o controller deveria evitar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Chamar uma função do service passando os dados já extraídos de req.body.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar next(erro) para repassar ao middleware de erro um problema capturado no catch.",
                                "isCorrect": false
                            },
                            {
                                "text": "Acessar diretamente o array de dados para filtrar registros, sem passar pelo service.",
                                "isCorrect": true
                            },
                            {
                                "text": "Responder com res.status(201).json(resultado) depois de chamar o service.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Controllers: a camada que fala com o mundo HTTP",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Controllers: a camada que fala com o mundo HTTP\n\nNa aula anterior você viu o papel do controller em teoria: é ele quem recebe a requisição, aciona o service e devolve a resposta. Agora é hora de escrever um controller de verdade para o recurso `tarefas`, aplicando tudo que você já sabe sobre `req`, `res`, `next` e tratamento de erro assíncrono."
                    },
                    {
                        "type": "text",
                        "value": "## O que entra (e o que não entra) num controller\n\nUm bom controller segue um roteiro curto:\n\n1. Extrai o que precisa da requisição (`req.body`, `req.params`, `req.query`).\n2. Chama a função correspondente do service, passando só os dados brutos que ele extraiu.\n3. Recebe o resultado do service e monta a resposta com `res.status(...).json(...)`.\n4. Se algo dá errado, repassa o erro com `next(err)`, exatamente como você viu no módulo de tratamento de erros.\n\nO que não deveria aparecer num controller: cálculo de regra de negócio, verificação de duplicidade, decisão sobre como os dados são armazenados. Se você está escrevendo um \"if\" que decide se uma tarefa pode ou não ser criada, essa decisão pertence ao service, não ao controller."
                    },
                    {
                        "type": "code",
                        "value": "// controllers/tarefas.controller.js\nconst tarefaService = require(\"../services/tarefas.service\");\n\nasync function listar(req, res, next) {\n  try {\n    const tarefas = await tarefaService.listar();\n    res.status(200).json(tarefas);\n  } catch (err) {\n    next(err);\n  }\n}\n\nasync function criar(req, res, next) {\n  try {\n    const novaTarefa = await tarefaService.criar(req.body);\n    res.status(201).json(novaTarefa);\n  } catch (err) {\n    next(err);\n  }\n}\n\nmodule.exports = { listar, criar };\n\n// o service completo vem na próxima aula; por enquanto,\n// repare que o controller não sabe COMO a tarefa é guardada"
                    },
                    {
                        "type": "text",
                        "value": "## Por que manter o controller \"magro\"\n\nRepare que nenhuma das duas funções acima sabe se `tarefas` é um array em memória, um arquivo ou um banco de dados. Isso é proposital. Um bom teste para saber se o seu controller está bem desenhado: se você trocar a forma como os dados são guardados, o controller muda? Se a resposta for não (só o service muda), a separação está funcionando.\n\nEsse desenho também facilita testar: dá para testar a função criar do service chamando ela diretamente, com um objeto JavaScript simples, sem precisar montar um req e um res falsos."
                    },
                    {
                        "type": "code",
                        "value": "// routes/tarefas.routes.js\nconst express = require(\"express\");\nconst router = express.Router();\nconst tarefasController = require(\"../controllers/tarefas.controller\");\n\nrouter.get(\"/\", tarefasController.listar);\nrouter.post(\"/\", tarefasController.criar);\n\nmodule.exports = router;\n\n// no app.js: app.use(\"/tarefas\", require(\"./routes/tarefas.routes\"));"
                    },
                    {
                        "type": "quote",
                        "value": "O controller é o tradutor entre o mundo HTTP e a regra de negócio: ele lê req, chama o service e devolve res. Se uma função de controller precisa de mais que umas poucas linhas para isso, provavelmente tem regra de negócio se escondendo ali dentro."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que um controller deve fazer, dentro da arquitetura rotas -> controllers -> services?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Orquestrar a requisição: extrair dados, chamar o service e devolver a resposta HTTP.",
                                "isCorrect": true
                            },
                            {
                                "text": "Conectar diretamente no banco de dados para buscar os registros.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validar o schema dos dados recebidos com Zod, substituindo a validação da rota.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir em qual porta o servidor vai escutar as requisições.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de uma função de controller assíncrona, usando try/catch, o que deve ser feito quando a chamada ao service lança um erro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Chamar next(err), repassando o erro ao middleware de tratamento central.",
                                "isCorrect": true
                            },
                            {
                                "text": "Responder direto com res.send(err), devolvendo o erro cru ao cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignorar o erro e responder normalmente com uma lista vazia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lançar o erro de novo com throw err, sem chamar next.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O middleware de validação da rota já garantiu que req.body está correto antes de chegar ao controller criar. O que o controller deve fazer a seguir?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Chamar o service com os dados, aguardar o resultado e responder o status certo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validar os dados de novo, por segurança, antes de qualquer outra coisa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Gravar a nova tarefa diretamente num array dentro do próprio controller.",
                                "isCorrect": false
                            },
                            {
                                "text": "Devolver os dados recebidos sem processar, já que a validação já ocorreu.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é considerado uma má prática colocar regra de negócio, como verificar duplicidade ou calcular valores, dentro de uma função de controller?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o Express bloqueia funções de controller acima de um certo tamanho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque mistura a camada HTTP com a lógica da aplicação, dificultando testar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Node.js limita o número de linhas de um arquivo de controller.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque isso deixa a resposta HTTP visivelmente mais lenta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual característica de um controller bem projetado facilita escrever testes automatizados para a regra de negócio da aplicação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O controller ter o maior número possível de funções auxiliares internas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A regra de negócio não estar no controller, dá para testar o service isolado.",
                                "isCorrect": true
                            },
                            {
                                "text": "O controller importar diretamente o objeto Router do Express.",
                                "isCorrect": false
                            },
                            {
                                "text": "O controller sempre responder com status 200, independente da operação.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Services: onde mora a regra de negócio",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Services: onde mora a regra de negócio\n\nO controller sabe conversar com o HTTP, mas não faz nada sozinho: ele sempre chama alguém de baixo. Essa aula é sobre esse alguém, o service. É aqui que fica a resposta para perguntas como \"o que significa criar uma tarefa\", \"o que fazer quando pedem uma tarefa que não existe\" e \"como os dados ficam guardados enquanto o servidor está de pé\"."
                    },
                    {
                        "type": "text",
                        "value": "## O que entra num service\n\nUm service concentra duas coisas:\n\n- **Regra de negócio**: as decisões que fazem parte do domínio da aplicação, como \"toda tarefa nova nasce com concluida igual a false\" ou \"não é possível remover uma tarefa que não existe\".\n- **Acesso aos dados**: a forma como as tarefas são guardadas e recuperadas. Nesta trilha ainda não chegamos a banco de dados (isso vem no próximo estágio do roadmap), então por enquanto o service guarda tudo num array em memória. Quando um banco de verdade entrar em cena, é o service que muda: os controllers e as rotas continuam exatamente iguais.\n\nUm service não conhece req, não conhece res, não decide status HTTP. Se você abrir um arquivo de service e encontrar req.body lá dentro, é sinal de que uma responsabilidade vazou de camada."
                    },
                    {
                        "type": "code",
                        "value": "// services/tarefas.service.js\nlet tarefas = [];\nlet proximoId = 1;\n\nfunction listar() {\n  return tarefas;\n}\n\nfunction buscarPorId(id) {\n  return tarefas.find((tarefa) => tarefa.id === id) || null;\n}\n\nfunction criar(dados) {\n  const novaTarefa = {\n    id: proximoId++,\n    titulo: dados.titulo,\n    descricao: dados.descricao || \"\",\n    concluida: false,\n    criadaEm: new Date().toISOString(),\n  };\n  tarefas.push(novaTarefa);\n  return novaTarefa;\n}\n\nfunction atualizar(id, dados) {\n  const tarefa = buscarPorId(id);\n  if (!tarefa) return null;\n  Object.assign(tarefa, dados);\n  return tarefa;\n}\n\nfunction remover(id) {\n  const indice = tarefas.findIndex((tarefa) => tarefa.id === id);\n  if (indice === -1) return false;\n  tarefas.splice(indice, 1);\n  return true;\n}\n\nmodule.exports = { listar, buscarPorId, criar, atualizar, remover };"
                    },
                    {
                        "type": "text",
                        "value": "## Como o service avisa que algo não foi encontrado\n\nRepare como buscarPorId, atualizar e remover reagem quando a tarefa não existe: devolvem null ou false, nunca um erro 404. Isso é proposital: 404 é um conceito de HTTP, e o service não sabe o que é HTTP. Quem transforma \"o service devolveu null\" em \"responder com status 404\" é o controller, que é a camada que entende de protocolo web.\n\nEssa divisão pode parecer sutil, mas é ela que permite usar o mesmo service em contextos diferentes (uma API HTTP, uma fila de processamento, um script de linha de comando) sem carregar suposições sobre o meio de transporte."
                    },
                    {
                        "type": "code",
                        "value": "// exemplo: usando o service sem nenhum Express por perto\nconst tarefaService = require(\"./services/tarefas.service\");\n\nconst tarefa = tarefaService.criar({ titulo: \"Estudar Express\" });\nconsole.log(tarefa);\n// { id: 1, titulo: \"Estudar Express\", descricao: \"\", concluida: false, criadaEm: \"...\" }\n\nconsole.log(tarefaService.buscarPorId(999));\n// null, mesmo sem nenhuma requisição HTTP envolvida"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Função\",\"Parâmetros\",\"O que faz\",\"Retorno quando não encontra\"],[\"listar\",\"nenhum\",\"Devolve todas as tarefas\",\"Array vazio, nunca null\"],[\"buscarPorId\",\"id\",\"Procura uma tarefa pelo id\",\"null\"],[\"criar\",\"dados\",\"Monta uma nova tarefa com id e concluida geradas pelo service\",\"Não se aplica\"],[\"atualizar\",\"id, dados\",\"Mescla os dados novos na tarefa existente\",\"null\"],[\"remover\",\"id\",\"Remove a tarefa do array\",\"false\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O service é onde mora o conhecimento sobre o negócio: o que é uma tarefa, como ela nasce, quando pode ser alterada ou removida. Ele não sabe que existe um Express, um req ou um res rodando por cima dele, e é exatamente por isso que pode ser testado e reaproveitado sozinho."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que deve ficar concentrado na camada de service de uma API Express?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A regra de negócio da aplicação e o acesso aos dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "A definição de qual método HTTP cada rota aceita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os middlewares globais, como cors e helmet.",
                                "isCorrect": false
                            },
                            {
                                "text": "A leitura direta de req.params e req.query.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No service de tarefas deste módulo, o que a função buscarPorId devolve quando não encontra nenhuma tarefa com o id informado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Lança uma exceção com status 404.",
                                "isCorrect": false
                            },
                            {
                                "text": "Devolve null.",
                                "isCorrect": true
                            },
                            {
                                "text": "Devolve um array vazio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Devolve res.status(404).",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que as funções do service de tarefas (listar, criar, buscarPorId etc.) não recebem req nem res como parâmetro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o Express não permite passar req para fora do controller.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o service precisa funcionar sozinho, sem depender do Express.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque req e res só existem depois que o banco de dados responde.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque isso deixaria o código mais lento em produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quando o service atualizar(id, dados) não encontra a tarefa e devolve null, qual é a forma correta de tratar isso no controller?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O controller verifica o retorno null e responde com um status 404, criando o erro correspondente.",
                                "isCorrect": true
                            },
                            {
                                "text": "O controller repassa o null direto no corpo da resposta com status 200.",
                                "isCorrect": false
                            },
                            {
                                "text": "O service deveria ter respondido diretamente com res.status(404), sem passar pelo controller.",
                                "isCorrect": false
                            },
                            {
                                "text": "O controller ignora o caso, já que o Express trata automaticamente valores null.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Hoje o service de tarefas guarda tudo num array em memória. Se, mais adiante, essa aplicação passar a usar um banco de dados de verdade, o que idealmente precisa mudar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Só a implementação interna do service; rotas e controllers continuam iguais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os controllers, que passam a montar as instruções de banco de dados diretamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "As rotas, que precisam trocar os métodos HTTP usados em cada operação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada muda no código; o Express detecta o banco de dados automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Configuração e variáveis de ambiente com .env",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Configuração e variáveis de ambiente com .env\n\nAté aqui, toda vez que o projeto precisou de um valor de configuração (a porta do servidor, por exemplo), esse valor provavelmente ficou escrito direto no código, algo como app.listen(3000). Funciona enquanto o projeto é pequeno e roda só na sua máquina, mas quebra assim que você precisa rodar a mesma aplicação em lugares diferentes (sua máquina, a máquina de outro dev, um servidor de produção), cada um com necessidades próprias. Esta aula mostra como tirar essas configurações de dentro do código."
                    },
                    {
                        "type": "code",
                        "value": "// server.js (configuração presa no código)\nconst express = require(\"express\");\nconst app = express();\n\n// a porta está fixa\n// e, se um dia precisar de uma chave de API, também ficaria fixa aqui\napp.listen(3000, () => {\n  console.log(\"Servidor rodando na porta 3000\");\n});"
                    },
                    {
                        "type": "text",
                        "value": "## O que são variáveis de ambiente\n\nUma variável de ambiente é um valor que vive fora do código, no ambiente onde o processo está rodando (o sistema operacional, o container, o serviço de deploy). O Node.js dá acesso a elas pelo objeto global `process.env`. Algumas já existem por convenção, como `NODE_ENV` (indicando se é development, test ou production); outras você cria, como a porta do servidor ou a URL de um serviço externo.\n\nO problema é que definir manualmente cada variável no terminal antes de rodar o projeto é chato e fácil de esquecer. É aí que entra o pacote dotenv: ele lê um arquivo .env na raiz do projeto e injeta cada linha dele dentro de process.env, automaticamente."
                    },
                    {
                        "type": "code",
                        "value": "# instalar o pacote na raiz do projeto\nnpm install dotenv\n\n# arquivo .env, na raiz do projeto (nunca vai para o Git)\nPORT=3000\nNODE_ENV=development"
                    },
                    {
                        "type": "code",
                        "value": "// no topo do arquivo principal (ex.: server.js), antes de tudo\nrequire(\"dotenv\").config();\n\nconst express = require(\"express\");\nconst app = express();\n\n// process.env.PORT vem do .env; o valor depois do || só é usado se a variável não existir\nconst porta = process.env.PORT || 3000;\n\napp.listen(porta, () => {\n  console.log(`Servidor rodando na porta ${porta}`);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Boas práticas com .env\n\nAlgumas regras evitam dor de cabeça (e vazamento de segredo):\n\n- **Nunca commite o .env.** Ele deve estar listado no .gitignore, junto com node_modules. Ele existe só na sua máquina (ou é configurado direto no serviço de deploy).\n- **Suba um .env.example versionado**, com as mesmas chaves e sem os valores reais (PORT=, NODE_ENV=), documentando quais variáveis a aplicação espera.\n- **Sempre defina um valor padrão sensato** para configurações não sensíveis, como a porta (process.env.PORT || 3000), para o projeto não quebrar se alguém esquecer de definir a variável.\n- **Centralize a leitura em um único lugar**, como um arquivo config/index.js, em vez de espalhar process.env.ALGUMA_COISA pelo projeto inteiro. Fica mais fácil saber, num só lugar, tudo que a aplicação precisa para rodar."
                    },
                    {
                        "type": "quote",
                        "value": "Configuração não é código: é o que muda de um ambiente para o outro. Tirar esses valores do código-fonte e colocá-los em variáveis de ambiente é o que permite rodar a mesma aplicação, sem alterar uma linha sequer, na sua máquina, no ambiente de testes e em produção."
                    }
                ],
                "questions": [
                    {
                        "statement": "Para que serve o pacote dotenv num projeto Express?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Para carregar as variáveis de um arquivo .env dentro de process.env.",
                                "isCorrect": true
                            },
                            {
                                "text": "Para validar automaticamente o corpo das requisições recebidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para gerar as rotas da API a partir do banco de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para compactar os arquivos do projeto antes do deploy.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O arquivo .env de um projeto guarda a porta do servidor e uma chave secreta de um serviço externo. O que deve ser feito com esse arquivo em relação ao controle de versão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Commitar normalmente, porque facilita o deploy em outras máquinas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar .env ao .gitignore, para que ele nunca seja enviado ao repositório.",
                                "isCorrect": true
                            },
                            {
                                "text": "Renomear para .env.js e importar como um módulo comum.",
                                "isCorrect": false
                            },
                            {
                                "text": "Enviar o conteúdo por mensagem para o time e apagar o arquivo do projeto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que escrever const porta = process.env.PORT || 3000; costuma ser melhor do que const porta = process.env.PORT; sozinho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque converte automaticamente o valor de PORT para o tipo number.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque garante um valor padrão quando a variável de ambiente não existe.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque essa é a única sintaxe aceita pelo método app.listen.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque isso criptografa o número da porta antes de abrir o servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a vantagem de centralizar a leitura de variáveis de ambiente em um único arquivo, como config/index.js, em vez de espalhar process.env pelo código?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É a única forma de o Node.js reconhecer variáveis de ambiente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduz visivelmente o tempo de resposta das requisições da API.",
                                "isCorrect": false
                            },
                            {
                                "text": "Facilita localizar e ajustar todas as configurações num só lugar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Permite que o Express crie rotas automaticamente a partir das variáveis.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time versiona um arquivo .env.example junto do código-fonte, mas nunca versiona o .env real. Qual é o objetivo dessa prática?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Fazer o Express carregar duas configurações diferentes ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Documentar as variáveis esperadas, sem expor valores sensíveis reais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Permitir rodar dois servidores simultâneos em portas diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir a necessidade de configurar um .gitignore.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Projeto integrador: o CRUD completo de tarefas de ponta a ponta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Projeto integrador: o CRUD completo de tarefas de ponta a ponta\n\nChegou a hora de juntar tudo. Nesta aula você vai ver a estrutura de pastas completa de uma API Express organizada, com rotas, controllers, services, validação e tratamento de erro cada um no seu lugar, e vai fechar o módulo com as cinco operações de um CRUD (criar, listar, buscar por id, atualizar e remover) funcionando de ponta a ponta sobre o recurso tarefas."
                    },
                    {
                        "type": "code",
                        "value": "tarefas-api/\n  src/\n    config/\n      index.js\n    routes/\n      tarefas.routes.js\n    controllers/\n      tarefas.controller.js\n    services/\n      tarefas.service.js\n    schemas/\n      tarefa.schema.js\n    middlewares/\n      validar.js\n      tratarErro.js\n    app.js\n  .env\n  .env.example\n  .gitignore\n  package.json"
                    },
                    {
                        "type": "text",
                        "value": "## O papel de cada pasta\n\n- **config/**: lê o .env (aula anterior) e exporta um objeto único com as configurações da aplicação.\n- **routes/**: define os caminhos e métodos HTTP, e liga cada um a uma função do controller (o que você viu desde o Módulo 2).\n- **controllers/**: a camada que fala HTTP, chama o service e devolve a resposta certa.\n- **services/**: a regra de negócio e os dados das tarefas, ainda em memória.\n- **schemas/**: os schemas Zod usados para validar o corpo das requisições (Módulo 4).\n- **middlewares/**: o middleware de validação e o middleware de erro centralizado, de 4 argumentos (Módulo 5).\n\nNo app.js, tudo se conecta: app.use(express.json()) para ler o corpo, app.use(\"/tarefas\", tarefasRoutes) para montar as rotas do recurso, e app.use(tratarErro) por último, depois de todas as rotas, para capturar qualquer erro repassado com next(err)."
                    },
                    {
                        "type": "code",
                        "value": "// routes/tarefas.routes.js\nconst express = require(\"express\");\nconst router = express.Router();\n\nconst tarefasController = require(\"../controllers/tarefas.controller\");\nconst { validar } = require(\"../middlewares/validar\");\nconst { tarefaSchema, atualizarTarefaSchema } = require(\"../schemas/tarefa.schema\");\n\nrouter.get(\"/\", tarefasController.listar);\nrouter.get(\"/:id\", tarefasController.buscarPorId);\nrouter.post(\"/\", validar(tarefaSchema), tarefasController.criar);\nrouter.put(\"/:id\", validar(atualizarTarefaSchema), tarefasController.atualizar);\nrouter.delete(\"/:id\", tarefasController.remover);\n\nmodule.exports = router;"
                    },
                    {
                        "type": "code",
                        "value": "// controllers/tarefas.controller.js\nconst tarefaService = require(\"../services/tarefas.service\");\n\nfunction erroNaoEncontrado() {\n  const erro = new Error(\"Tarefa não encontrada\");\n  erro.status = 404;\n  return erro;\n}\n\nasync function listar(req, res, next) {\n  try {\n    const tarefas = await tarefaService.listar();\n    res.status(200).json(tarefas);\n  } catch (err) {\n    next(err);\n  }\n}\n\nasync function buscarPorId(req, res, next) {\n  try {\n    const id = Number(req.params.id);\n    const tarefa = await tarefaService.buscarPorId(id);\n    if (!tarefa) return next(erroNaoEncontrado());\n    res.status(200).json(tarefa);\n  } catch (err) {\n    next(err);\n  }\n}\n\nasync function criar(req, res, next) {\n  try {\n    const novaTarefa = await tarefaService.criar(req.body);\n    res.status(201).json(novaTarefa);\n  } catch (err) {\n    next(err);\n  }\n}\n\nasync function atualizar(req, res, next) {\n  try {\n    const id = Number(req.params.id);\n    const tarefaAtualizada = await tarefaService.atualizar(id, req.body);\n    if (!tarefaAtualizada) return next(erroNaoEncontrado());\n    res.status(200).json(tarefaAtualizada);\n  } catch (err) {\n    next(err);\n  }\n}\n\nasync function remover(req, res, next) {\n  try {\n    const id = Number(req.params.id);\n    const removida = await tarefaService.remover(id);\n    if (!removida) return next(erroNaoEncontrado());\n    res.status(204).send();\n  } catch (err) {\n    next(err);\n  }\n}\n\nmodule.exports = { listar, buscarPorId, criar, atualizar, remover };"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método\",\"Rota\",\"Ação do CRUD\",\"Status de sucesso\"],[\"GET\",\"/tarefas\",\"Listar todas as tarefas\",\"200\"],[\"GET\",\"/tarefas/:id\",\"Buscar uma tarefa pelo id\",\"200\"],[\"POST\",\"/tarefas\",\"Criar uma nova tarefa\",\"201\"],[\"PUT\",\"/tarefas/:id\",\"Atualizar uma tarefa existente\",\"200\"],[\"DELETE\",\"/tarefas/:id\",\"Remover uma tarefa\",\"204\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Rota decide qual caminho e método aciona o quê; controller traduz HTTP para chamadas de service e monta a resposta; service guarda a regra de negócio e os dados. Com as cinco operações do CRUD ligadas de ponta a ponta, seu projeto Express deixou de ser um arquivo único e virou uma aplicação organizada, pronta para crescer."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num CRUD REST para o recurso tarefas, qual é a combinação correta de método HTTP e status de sucesso para criar uma nova tarefa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "POST /tarefas, respondendo com status 201.",
                                "isCorrect": true
                            },
                            {
                                "text": "GET /tarefas, respondendo com status 200.",
                                "isCorrect": false
                            },
                            {
                                "text": "PUT /tarefas, respondendo com status 200.",
                                "isCorrect": false
                            },
                            {
                                "text": "POST /tarefas, respondendo com status 204.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na rota DELETE /tarefas/:id do exemplo integrador, depois de remover a tarefa com sucesso, qual resposta o controller envia?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "res.status(200).json(tarefa removida).",
                                "isCorrect": false
                            },
                            {
                                "text": "res.status(204).send(), sem corpo.",
                                "isCorrect": true
                            },
                            {
                                "text": "res.status(201).json(novaTarefa).",
                                "isCorrect": false
                            },
                            {
                                "text": "res.status(404).json({ erro: ... }).",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na rota PUT /tarefas/:id do projeto integrador, o middleware validar(atualizarTarefaSchema) roda antes do controller atualizar. O que acontece se req.body não passar na validação do schema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O middleware chama next() mesmo assim, e o controller decide se ignora os dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O middleware responde 400 direto, e o controller atualizar nunca chega a rodar.",
                                "isCorrect": true
                            },
                            {
                                "text": "O erro só é percebido dentro do service, quando tenta salvar a tarefa.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Express ignora a validação em rotas PUT, aplicando apenas em POST.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No controller buscarPorId do exemplo integrador, ao não encontrar a tarefa, o código chama next(erroNaoEncontrado()) em vez de res.status(404).json(...) direto na função. Por que isso é útil?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque next() é mais rápido de executar do que res.status().json().",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque centraliza a resposta de erro, mantendo o formato consistente na API.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Express exige next() sempre que uma rota tem parâmetro na URL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque isso evita que o service seja chamado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na estrutura de pastas do projeto integrador (routes, controllers, services, schemas, middlewares, config), se o requisito mudar de \"guardar tarefas em memória\" para \"guardar tarefas num banco de dados\", quais arquivos devem mudar, seguindo a separação de camadas ensinada no módulo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Só o arquivo em services/, mantendo as assinaturas que routes/ e controllers/ já usam.",
                                "isCorrect": true
                            },
                            {
                                "text": "Todos os arquivos de routes/, controllers/ e services/ precisam ser reescritos juntos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o schemas/tarefa.schema.js, já que a validação depende de onde os dados são salvos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas app.js, porque é lá que o banco de dados é configurado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Boas práticas e o próximo passo",
        "aulas": [
            {
                "titulo": "Logging de requisições: enxergando o que acontece no servidor",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Logging de requisições: enxergando o que acontece no servidor\n\nVocê chegou ao último módulo da trilha. Nos módulos anteriores sua API ganhou rotas, middleware, validação, tratamento de erro e uma estrutura decente de pastas. Ela já parece, de verdade, com uma API que alguém colocaria em produção. Mas antes de colocar qualquer coisa no ar, faltam alguns hábitos que separam um projeto de estudo de um serviço em que se pode confiar: registrar o que acontece, se proteger de abuso, aceitar chamadas do front-end sem drama e se comportar diferente em desenvolvimento e em produção. É isso que este módulo cobre, terminando com uma visão de para onde ir depois desta trilha.\n\nComeçamos pelo logging. Quando a API roda na sua máquina, qualquer erro aparece na hora, no terminal, bem debaixo dos seus olhos. Em produção isso desaparece: não existe terminal aberto, não existe DevTools, só o servidor rodando sozinho. Se algo falhar de madrugada, a única testemunha do que aconteceu é o que a aplicação tiver escrito em algum lugar. Registrar essas informações, de forma sistemática, é o que chamamos de **logging**."
                    },
                    {
                        "type": "text",
                        "value": "## O que vale a pena registrar em cada requisição\n\nUm log de requisição útil costuma trazer, no mínimo:\n\n- O **método** e a **rota** chamados (`GET /tarefas/42`).\n- O **status code** da resposta (o servidor respondeu 200? 404? 500?).\n- O **tempo de resposta**, em milissegundos, para enxergar rotas lentas.\n- Um **timestamp**, para saber quando aconteceu.\n\nO que **não** deve aparecer no log: senhas, tokens de autenticação, números de cartão ou qualquer dado sensível do corpo da requisição. Um log é lido por várias pessoas (e às vezes guardado por anos), e vazar credenciais ali é tão grave quanto vazar no banco de dados."
                    },
                    {
                        "type": "code",
                        "value": "// um middleware de log simples, escrito na mao\nfunction logger(req, res, next) {\n  const inicio = Date.now();\n\n  // 'finish' dispara quando a resposta termina de ser enviada;\n  // so nesse momento o res.statusCode reflete o valor final\n  res.on('finish', () => {\n    const duracaoMs = Date.now() - inicio;\n    console.log(\n      `${req.method} ${req.originalUrl} ${res.statusCode} ${duracaoMs}ms`\n    );\n  });\n\n  next();\n}\n\napp.use(logger);\n\n// GET /tarefas 200 4ms\n// POST /tarefas 201 12ms\n// GET /tarefas/999 404 2ms"
                    },
                    {
                        "type": "text",
                        "value": "## Logging com uma biblioteca: morgan\n\nEscrever seu próprio logger é um bom exercício, mas no dia a dia a maioria dos projetos Express usa uma biblioteca pronta para isso: o **morgan**. Ele resolve exatamente o mesmo problema (logar cada requisição), com formatos prontos, testados e usados por milhares de projetos.\n\nO morgan vem com alguns formatos prontos para escolher. `'dev'` é colorido e enxuto, ótimo para acompanhar o terminal durante o desenvolvimento. `'combined'` é mais completo (inclui IP de origem, user-agent e mais detalhes), o formato clássico de log de servidor web, mais adequado para produção, onde esses detalhes viram material de investigação."
                    },
                    {
                        "type": "code",
                        "value": "npm install morgan\n\nimport express from 'express';\nimport morgan from 'morgan';\n\nconst app = express();\n\n// formato enxuto, bom para o dia a dia de desenvolvimento\napp.use(morgan('dev'));\n\n// GET /tarefas 200 3.412 ms - 128\n// POST /tarefas 201 8.190 ms - 64\n// GET /tarefas/999 404 1.203 ms - 27"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Formato\",\"Uso recomendado\",\"O que inclui\"],[\"dev\",\"Desenvolvimento local\",\"Método, rota, status colorido por faixa e tempo de resposta\"],[\"combined\",\"Produção\",\"IP de origem, data, método, rota, status, tamanho da resposta e user-agent\"],[\"common\",\"Produção (mais enxuto que combined)\",\"Parecido com o combined, sem o user-agent\"],[\"tiny\",\"Ambientes com pouco espaço em log\",\"Só o essencial: método, rota, status e tamanho\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Todo log de requisição deve responder três perguntas rapidamente: o que foi pedido, o que o servidor respondeu e quanto tempo levou. Em desenvolvimento, um formato enxuto como o `dev` do morgan já ajuda bastante; em produção, prefira um formato mais completo, como o `combined`, e nunca registre senhas, tokens ou dados sensíveis do corpo da requisição."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que registrar logs de requisição é importante em produção, e não só durante o desenvolvimento?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em produção não há terminal nem DevTools; o log é o registro do que houve.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Express exige pelo menos um log por rota para funcionar corretamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque logs substituem a necessidade de tratamento de erros no código.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque sem logs o Node.js não consegue processar requisições simultâneas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual dessas informações é inadequada para aparecer em um log de requisição?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O método HTTP e a rota que foi chamada",
                                "isCorrect": false
                            },
                            {
                                "text": "O status code de cada resposta enviada",
                                "isCorrect": false
                            },
                            {
                                "text": "A senha enviada pelo usuário no corpo da requisição",
                                "isCorrect": true
                            },
                            {
                                "text": "O tempo de resposta de cada rota, em milissegundos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um middleware de log escrito à mão precisa registrar o status code da resposta, mas ao tentar ler res.statusCode logo na primeira linha do middleware, antes de chamar next(), o valor sempre aparece como 200, mesmo quando a rota responde 404. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O status code só é definitivo após a resposta ser enviada, no evento 'finish'.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Express não permite middlewares personalizados de log, só bibliotecas como o morgan.",
                                "isCorrect": false
                            },
                            {
                                "text": "req.originalUrl precisa ser usado no lugar de res.statusCode.",
                                "isCorrect": false
                            },
                            {
                                "text": "O status code só existe se express.json() estiver configurado antes do logger.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao configurar o morgan em uma API que já vai para produção, qual escolha de formato costuma ser mais adequada, e por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "'dev', porque a saída colorida facilita a leitura em qualquer ambiente",
                                "isCorrect": false
                            },
                            {
                                "text": "'combined', porque registra IP e user-agent, úteis para investigar em produção",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum formato pronto do morgan; produção exige sempre um logger escrito do zero",
                                "isCorrect": false
                            },
                            {
                                "text": "'dev', porque é o único formato compatível com Express em modo produção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide logar o req.body inteiro de toda requisição POST para 'facilitar debug', incluindo as rotas de login e cadastro. Algumas semanas depois, um incidente expõe o arquivo de logs. Qual é o problema central dessa prática e a correção mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Logar o corpo sem filtro grava senhas em texto puro; a correção é mascarar dados sensíveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "O problema é que req.body não deveria existir sem express.json(); a correção é remover o middleware.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é o uso do morgan em vez de um logger próprio; a correção é escrever tudo manualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é registrar POST; apenas requisições GET deveriam gerar log.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Segurança básica: dificultando a vida de quem ataca",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Segurança básica: dificultando a vida de quem ataca\n\nUma API pequena, feita para estudo, ainda assim recebe tráfego indesejado assim que fica acessível na internet: scanners automáticos testam rotas conhecidas, bots tentam adivinhar senhas e ferramentas varrem cabeçalhos em busca de versões vulneráveis. Segurança não é um luxo reservado para sistemas grandes, é uma camada básica que qualquer API exposta precisa ter. Nesta aula você vai adicionar três defesas simples e de alto impacto: cabeçalhos HTTP mais seguros com o helmet, um limite de requisições com o express-rate-limit e o cuidado de nunca devolver ao cliente os detalhes internos de um erro."
                    },
                    {
                        "type": "text",
                        "value": "## Helmet: cabeçalhos HTTP que dificultam ataques comuns\n\nO navegador (e outros clientes HTTP) respeitam uma série de cabeçalhos de resposta que instruem como tratar o conteúdo recebido: se pode ser exibido dentro de um `<iframe>` de outro site, se o tipo do arquivo deve ser respeitado à risca, se a conexão deve sempre usar HTTPS, entre outros. Configurar cada um manualmente é chato e fácil de esquecer, então a comunidade Express criou o **helmet**: um middleware que aplica, de uma vez, um conjunto de cabeçalhos de segurança considerados boas práticas.\n\nO helmet também remove o cabeçalho `X-Powered-By`, que o Express envia por padrão anunciando 'Express' para quem quiser ver. Parece pouco, mas é uma informação a menos entregue de graça para quem está reconhecendo o alvo antes de atacar."
                    },
                    {
                        "type": "code",
                        "value": "npm install helmet\n\nimport express from 'express';\nimport helmet from 'helmet';\n\nconst app = express();\n\n// aplica um conjunto de cabecalhos de seguranca recomendados,\n// incluindo a remocao do cabecalho X-Powered-By\napp.use(helmet());\n\napp.get('/tarefas', (req, res) => {\n  res.json({ tarefas: [] });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Rate limiting: limitando quantas vezes alguém pode bater na sua porta\n\nSem limite nenhum, um mesmo cliente (ou um script malicioso) pode disparar milhares de requisições por segundo contra a sua API: tentando adivinhar senhas por força bruta, sobrecarregando o servidor ou simplesmente raspando todos os seus dados. **Rate limiting** é a técnica de contar quantas requisições cada origem (normalmente identificada pelo IP) fez em uma janela de tempo e bloquear quem passar do limite, devolvendo o status `429 Too Many Requests`.\n\nO pacote **express-rate-limit** implementa isso como um middleware, sem você precisar controlar contadores na mão."
                    },
                    {
                        "type": "code",
                        "value": "npm install express-rate-limit\n\nimport rateLimit from 'express-rate-limit';\n\nconst limiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // janela de 15 minutos\n  limit: 100,               // no maximo 100 requisicoes por IP nessa janela\n  message: { erro: 'Muitas requisicoes, tente novamente mais tarde' }\n});\n\n// aplica o limite a toda a API\napp.use(limiter);\n\n// ou aplica so numa rota mais sensivel, como o login\napp.post('/login', limiter, (req, res) => {\n  // ...\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Não entregue os detalhes internos de um erro ao cliente\n\nNo módulo sobre respostas e erros, você centralizou o tratamento de erros num middleware de quatro argumentos. Existe uma armadilha comum nesse middleware: devolver `err.message` e `err.stack` direto no corpo da resposta, para 'facilitar o debug'. O problema é que isso também facilita a vida de quem ataca: um stack trace revela caminhos de arquivo no servidor, nomes de bibliotecas e versões, e às vezes até trechos de uma consulta SQL malformada. Cada detalhe é uma pista a menos que o atacante precisa descobrir sozinho.\n\nA prática correta é: registrar o erro completo no log do servidor (com `console.error` ou uma ferramenta de log) e devolver ao cliente só uma mensagem genérica e um status code adequado. Na próxima aula você vai ver como fazer essa mensagem variar automaticamente entre desenvolvimento e produção, usando o `NODE_ENV`."
                    },
                    {
                        "type": "quote",
                        "value": "Três defesas simples cobrem boa parte do básico de segurança em uma API Express: `helmet()` para cabeçalhos HTTP mais seguros, um rate limit para barrar abuso e força bruta, e uma resposta de erro genérica para o cliente, guardando os detalhes completos só no log do servidor."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a função do middleware helmet em uma aplicação Express?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Aplicar cabeçalhos HTTP de segurança, removendo o X-Powered-By.",
                                "isCorrect": true
                            },
                            {
                                "text": "Validar o corpo das requisições recebidas, como o Zod.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir o express.json() na leitura do corpo das requisições.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar automaticamente rotas de autenticação para a API.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API sem nenhum rate limiting configurado recebe milhares de tentativas de login por minuto vindas do mesmo IP. Qual status code o servidor deveria passar a responder para as tentativas que excedem o limite definido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "200 OK",
                                "isCorrect": false
                            },
                            {
                                "text": "401 Unauthorized",
                                "isCorrect": false
                            },
                            {
                                "text": "429 Too Many Requests",
                                "isCorrect": true
                            },
                            {
                                "text": "500 Internal Server Error",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No middleware de erro de uma API, o desenvolvedor escreveu: res.status(500).json({ erro: err.message, stack: err.stack }). Qual é o risco dessa prática em produção?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O stack trace expõe caminhos, bibliotecas e versões internas, úteis para um atacante.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Express não permite enviar mais de uma propriedade no corpo da resposta de erro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O status 500 está incorreto; deveria ser sempre 400 nesse tipo de erro.",
                                "isCorrect": false
                            },
                            {
                                "text": "err.stack não existe em JavaScript, então o código lançaria uma exceção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre a configuração de um rate limiter com express-rate-limit, o que representam as opções windowMs e limit?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "windowMs define o tempo máximo de resposta da API, e limit define quantas rotas podem existir.",
                                "isCorrect": false
                            },
                            {
                                "text": "windowMs define a duração da janela de tempo; limit define o total de requisições por origem.",
                                "isCorrect": true
                            },
                            {
                                "text": "windowMs define o número de usuários simultâneos, e limit define o tamanho máximo do corpo da requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "windowMs e limit são opções exclusivas do helmet, não do rate limiter.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API aplica app.use(limiter) com um limite de 100 requisições a cada 15 minutos por IP, e também usa helmet(). Mesmo assim, um atacante consegue testar milhares de senhas na rota de login em poucos minutos usando uma rede de milhares de IPs diferentes (uma botnet). O que essa situação revela sobre as defesas aplicadas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Rate limit por IP não barra um ataque distribuído por muitos IPs; faltam defesas extras, tipo CAPTCHA.",
                                "isCorrect": true
                            },
                            {
                                "text": "O helmet deveria ter bloqueado a botnet automaticamente, então o problema é a ordem dos middlewares.",
                                "isCorrect": false
                            },
                            {
                                "text": "O rate limit não funciona com o método POST, só com GET, então a rota de login nunca foi protegida de fato.",
                                "isCorrect": false
                            },
                            {
                                "text": "O uso de rate limiting e helmet juntos é incompatível e cancela a proteção de ambos.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "CORS na prática: por que o front reclama e como o Express resolve",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# CORS na prática: por que o front reclama e como o Express resolve\n\nVocê termina a API, sobe o servidor em `http://localhost:3000`, abre o front-end em `http://localhost:5173` (rodando com Vite, por exemplo) e dispara um fetch para a API. O resultado: nada aparece na tela, e o console do navegador mostra uma mensagem parecida com a do bloco de código abaixo.\n\nEssa é, provavelmente, a mensagem de erro mais comum na vida de quem começa a integrar front e back separados. E ela costuma vir acompanhada de uma reação repetida: achar que o back-end 'não está funcionando'. Nesta aula você vai entender exatamente o que essa mensagem significa e como resolver com o Express."
                    },
                    {
                        "type": "code",
                        "value": "Access to fetch at 'http://localhost:3000/tarefas' from origin 'http://localhost:5173'\nhas been blocked by CORS policy: No 'Access-Control-Allow-Origin' header\nis present on the requested resource.\n\nIf an opaque response serves your needs, set the request's mode to 'no-cors'\nto fetch the resource with CORS disabled."
                    },
                    {
                        "type": "text",
                        "value": "## De quem é a culpa, afinal\n\nA primeira coisa a entender: quem bloqueia essa requisição não é o seu back-end, é o **navegador**. Todo navegador aplica uma regra de segurança chamada **Same-Origin Policy** (política de mesma origem): por padrão, o JavaScript rodando numa página só pode ler livremente respostas de requisições feitas para a mesma **origem** (mesmo esquema, mesmo domínio e mesma porta) da própria página.\n\n`http://localhost:5173` (o front) e `http://localhost:3000` (a API) têm portas diferentes, então são origens diferentes aos olhos do navegador. A requisição chega a sair do navegador e, muitas vezes, até chega a ser processada pelo Express, mas o navegador **bloqueia a leitura da resposta** no lado do front, a não ser que o servidor diga explicitamente que autoriza aquela origem. É exatamente isso que o **CORS** (Cross-Origin Resource Sharing) permite fazer: o servidor declara, por meio de cabeçalhos de resposta, quais origens têm permissão para ler o que ele devolve."
                    },
                    {
                        "type": "text",
                        "value": "## Resolvendo com o pacote cors\n\nDá para configurar esses cabeçalhos manualmente em cada resposta, mas o jeito idiomático no Express é usar o middleware **cors**, que faz exatamente isso por você, inclusive cuidando da requisição de verificação (**preflight**) que o navegador dispara automaticamente com o método `OPTIONS` antes de requisições mais sensíveis (como um POST com corpo em JSON).\n\nO uso mais simples libera qualquer origem, o que é aceitável durante o desenvolvimento, mas raramente é uma boa ideia em produção. O ideal é declarar explicitamente quais origens podem acessar a API."
                    },
                    {
                        "type": "code",
                        "value": "npm install cors\n\nimport express from 'express';\nimport cors from 'cors';\n\nconst app = express();\n\n// liberado geral: qualquer origem pode ler a resposta (uso comum so em dev)\napp.use(cors());\n\n// restrito: so essas origens tem permissao (mais adequado para producao)\nconst origensPermitidas = ['https://meufront.com', 'http://localhost:5173'];\n\napp.use(cors({\n  origin: origensPermitidas,\n  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],\n  credentials: true\n}));\n\napp.get('/tarefas', (req, res) => {\n  res.json({ tarefas: [] });\n});"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cabeçalho de resposta\",\"O que faz\"],[\"Access-Control-Allow-Origin\",\"Diz qual origem tem permissão para ler a resposta (ou * para qualquer uma)\"],[\"Access-Control-Allow-Methods\",\"Lista os métodos HTTP aceitos em requisições cross-origin\"],[\"Access-Control-Allow-Headers\",\"Lista os cabeçalhos customizados que o cliente pode enviar\"],[\"Access-Control-Allow-Credentials\",\"Permite que cookies e credenciais sejam enviados junto da requisição\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "CORS não é uma trava do back-end nem um bug do navegador: é o mecanismo pelo qual o servidor autoriza, de forma explícita, que outra origem leia sua resposta. Quando o console mostrar 'blocked by CORS policy', a solução mora no back-end, com o middleware cors() configurado para aceitar a origem correta."
                    }
                ],
                "questions": [
                    {
                        "statement": "O console do navegador exibe um erro de 'blocked by CORS policy' ao tentar consumir uma API. Quem aplica esse bloqueio?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O navegador, que aplica a Same-Origin Policy sem autorização do servidor.",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor Express, que rejeita ativamente a requisição antes de processá-la.",
                                "isCorrect": false
                            },
                            {
                                "text": "O sistema operacional, que bloqueia portas diferentes de 80 e 443.",
                                "isCorrect": false
                            },
                            {
                                "text": "O provedor de hospedagem, por padrão, em qualquer ambiente de produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas URLs são consideradas da mesma origem quando têm em comum:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O mesmo caminho e os mesmos parâmetros de query da URL",
                                "isCorrect": false
                            },
                            {
                                "text": "O mesmo esquema, o mesmo domínio e a mesma porta",
                                "isCorrect": true
                            },
                            {
                                "text": "O mesmo método HTTP usado em cada requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "O mesmo corpo de resposta, ou seja, o mesmo Content-Type",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um front-end em https://app.exemplo.com faz um POST com corpo JSON para https://api.exemplo.com. O navegador dispara antes uma requisição extra com o método OPTIONS. O que é essa requisição?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É o preflight: o navegador confere antes se a chamada cross-origin é permitida.",
                                "isCorrect": true
                            },
                            {
                                "text": "É um erro de configuração do front-end; requisições POST nunca deveriam gerar uma chamada extra.",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma tentativa de ataque que o navegador está reportando ao servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "É a forma como o Express solicita autenticação antes de processar o POST.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao configurar app.use(cors({ origin: ['https://meufront.com'] })) em uma API Express, o que essa configuração faz na prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Bloqueia completamente qualquer requisição vinda de fora do Brasil.",
                                "isCorrect": false
                            },
                            {
                                "text": "Impede que a API receba requisições de métodos diferentes de GET.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adiciona o cabeçalho que autoriza só https://meufront.com a ler as respostas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Substitui totalmente a necessidade de validar o corpo da requisição com um schema Zod.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API usa app.use(cors()) sem nenhuma configuração (liberando qualquer origem) e, ao mesmo tempo, depende de cookies de sessão para identificar o usuário logado (credentials: true). Por que essa combinação é arriscada em produção, e qual seria o ajuste mais adequado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Liberar qualquer origem com credenciais deixa sites maliciosos fazerem requisições autenticadas; o certo é restringir origin.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não há risco real, porque cookies de sessão nunca são enviados em requisições cross-origin, independentemente da configuração de CORS.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é usar cors() em vez de helmet(), que é o middleware correto para lidar com cookies.",
                                "isCorrect": false
                            },
                            {
                                "text": "A combinação é segura desde que o servidor rode em HTTPS, independentemente da configuração de origin.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ambientes de desenvolvimento e produção: o papel do NODE_ENV",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ambientes de desenvolvimento e produção: o papel do NODE_ENV\n\nAté aqui, tudo o que você configurou (logs, helmet, rate limit, cors) foi pensado com uma pergunta em aberto: isso deveria se comportar igual na sua máquina e no servidor de produção? Na prática, não. Em desenvolvimento você quer logs detalhados, mensagens de erro completas e um front-end local liberado no CORS. Em produção você quer logs enxutos, erros genéricos para o cliente e uma lista fechada de origens permitidas. A forma padrão do mundo Node.js de saber em qual desses dois mundos o código está rodando é uma variável de ambiente: `NODE_ENV`."
                    },
                    {
                        "type": "text",
                        "value": "## O que é NODE_ENV e de onde ele vem\n\n`NODE_ENV` é uma variável de ambiente comum (não é algo exclusivo do Express) que, por convenção, recebe o valor `'development'`, `'production'` ou, às vezes, `'test'`. Ela fica disponível no seu código Node.js em `process.env.NODE_ENV`.\n\nO próprio Express lê essa variável internamente: `app.get('env')` devolve o valor de `NODE_ENV`, ou `'development'` como padrão caso a variável não esteja definida. É por isso que, sem nenhuma configuração extra, o Express já assume que você está desenvolvendo.\n\nVocê define o valor antes de rodar a aplicação, direto na linha de comando ou em um script do `package.json`."
                    },
                    {
                        "type": "code",
                        "value": "// package.json\n{\n  \"scripts\": {\n    \"dev\": \"NODE_ENV=development nodemon server.js\",\n    \"start\": \"NODE_ENV=production node server.js\"\n  }\n}\n\n// no Windows (cmd/PowerShell) essa sintaxe de atribuicao inline nao funciona;\n// o jeito multiplataforma e instalar o pacote cross-env:\n// npm install --save-dev cross-env\n// \"dev\": \"cross-env NODE_ENV=development nodemon server.js\"\n\n// dentro do codigo, em qualquer arquivo:\nconsole.log(process.env.NODE_ENV); // 'development' ou 'production'"
                    },
                    {
                        "type": "text",
                        "value": "## Usando o NODE_ENV para mudar o comportamento da API\n\nCom a variável disponível, o próprio código passa a decidir, em tempo de execução, como se comportar. O padrão mais comum é guardar um booleano no topo do arquivo principal e usá-lo para ramificar as configurações que você já viu nesta trilha: qual formato de log usar, quais origens liberar no CORS e quanto detalhe devolver num erro."
                    },
                    {
                        "type": "code",
                        "value": "import express from 'express';\nimport morgan from 'morgan';\nimport cors from 'cors';\n\nconst app = express();\nconst emProducao = process.env.NODE_ENV === 'production';\n\n// log enxuto em dev, log completo em producao\napp.use(morgan(emProducao ? 'combined' : 'dev'));\n\n// CORS liberado em dev, restrito em producao\napp.use(cors({\n  origin: emProducao ? ['https://meusite.com'] : '*'\n}));\n\napp.get('/tarefas', (req, res) => {\n  res.json({ tarefas: [] });\n});\n\n// middleware de erro (4 argumentos): detalhado em dev, generico em producao\napp.use((err, req, res, next) => {\n  console.error(err); // o log completo sempre fica no servidor\n\n  res.status(err.status || 500).json({\n    erro: emProducao ? 'Erro interno do servidor' : err.message,\n    ...(emProducao ? {} : { stack: err.stack })\n  });\n});"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Desenvolvimento\",\"Produção\"],[\"Formato de log\",\"Enxuto e colorido (ex.: morgan 'dev')\",\"Completo, para investigação (ex.: morgan 'combined')\"],[\"Mensagem de erro ao cliente\",\"Detalhada, com stack trace\",\"Genérica, sem detalhes internos\"],[\"CORS\",\"Costuma liberar localhost à vontade\",\"Lista fechada de origens confiáveis\"],[\"Reinício do servidor\",\"Automático a cada alteração (nodemon)\",\"Processo estável, sem recarregar sozinho\"],[\"Variáveis de ambiente\",\"Arquivo .env local, nunca commitado\",\"Definidas no ambiente do servidor ou do CI\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "NODE_ENV é a forma padrão do Node.js de responder a uma pergunta simples: em qual ambiente este código está rodando agora? A partir dela, sua API decide sozinha o formato de log, as origens liberadas no CORS e o quanto revelar num erro, sem precisar manter dois projetos separados para dev e produção."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a variável de ambiente NODE_ENV normalmente indica em uma aplicação Node.js?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em qual ambiente a aplicação roda, tipo 'development' ou 'production'.",
                                "isCorrect": true
                            },
                            {
                                "text": "A versão exata do Node.js que está instalada na máquina atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número da porta em que o servidor Express deve escutar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do banco de dados que a aplicação deve usar em cada ambiente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como o código acessa o valor de NODE_ENV dentro de uma aplicação Node.js?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "app.env.NODE_ENV",
                                "isCorrect": false
                            },
                            {
                                "text": "process.env.NODE_ENV",
                                "isCorrect": true
                            },
                            {
                                "text": "req.env.NODE_ENV",
                                "isCorrect": false
                            },
                            {
                                "text": "express.NODE_ENV",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API sobe em produção sem que ninguém tenha definido explicitamente a variável NODE_ENV no ambiente do servidor. Qual valor o Express assume por padrão para app.get('env') nessa situação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "'production', porque é sempre o padrão mais seguro do Express",
                                "isCorrect": false
                            },
                            {
                                "text": "'development', valor padrão do Express quando NODE_ENV não existe",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro é lançado de imediato e o servidor não sobe",
                                "isCorrect": false
                            },
                            {
                                "text": "'test', porque é o valor padrão definido pelo próprio Node.js",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um middleware de erro escrito como res.status(err.status || 500).json({ erro: emProducao ? 'Erro interno do servidor' : err.message }), qual é o objetivo de usar a variável emProducao dessa forma?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Melhorar visivelmente a performance do servidor em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mostrar erro detalhado em dev, e algo genérico em produção, sem vazar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Impedir totalmente que o middleware de erro seja executado em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir automaticamente o status code correto para cada tipo de erro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time definiu o script 'dev': 'NODE_ENV=development nodemon server.js' no package.json, testado e funcionando no Linux e no macOS de todos, exceto no notebook de um colega que usa Windows (cmd.exe), onde o mesmo comando falha ao rodar npm run dev. Qual é a explicação mais provável, e como o time deveria corrigir o script para funcionar em qualquer sistema operacional?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O cmd.exe não aceita a sintaxe de variável inline; a correção é usar o pacote cross-env.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Node.js não roda no Windows, então a equipe precisa manter dois servidores diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "NODE_ENV só pode ser lida corretamente em sistemas Unix; no Windows, o valor precisa vir fixo no código.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nodemon é incompatível com Windows, então o problema não tem relação com NODE_ENV.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Testando um endpoint e os próximos passos da sua jornada back-end",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Testando um endpoint e os próximos passos da sua jornada back-end\n\nChegamos à última aula da trilha. Sua API já tem rotas organizadas, middleware, validação, tratamento de erro centralizado, uma estrutura de projeto decente e, agora, logging, segurança básica, CORS e um comportamento consciente de ambiente. Falta um hábito importante: testar. Não só testar 'na mão' de vez em quando, mas ter uma forma confiável de saber se um endpoint continua funcionando depois de qualquer mudança no código."
                    },
                    {
                        "type": "text",
                        "value": "## Testando manualmente: ainda útil, mas não suficiente sozinho\n\nDesde o módulo 1 você testa rotas manualmente: pelo navegador, por `curl` no terminal ou por um cliente gráfico como Insomnia, Postman ou a extensão Thunder Client. Esse tipo de teste continua tendo valor, principalmente para explorar uma rota nova ou reproduzir um bug relatado.\n\nO problema aparece quando a API cresce: ninguém vai reabrir manualmente as vinte rotas existentes toda vez que mudar uma linha de código só para garantir que nada quebrou. É aí que entram os **testes automatizados**: código que chama seus próprios endpoints e verifica a resposta, de forma repetível e rápida."
                    },
                    {
                        "type": "code",
                        "value": "# testar manualmente uma rota de criacao de tarefa\ncurl -X POST http://localhost:3000/tarefas \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"titulo\": \"Estudar Express\", \"concluida\": false}'\n\n# resposta esperada: 201 Created\n# {\"id\":1,\"titulo\":\"Estudar Express\",\"concluida\":false}\n\n# testar uma rota que deveria falhar (titulo ausente)\ncurl -X POST http://localhost:3000/tarefas \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"concluida\": false}'\n\n# resposta esperada: 400 Bad Request\n# {\"erro\":\"Dados invalidos\",\"detalhes\":[\"titulo e obrigatorio\"]}"
                    },
                    {
                        "type": "text",
                        "value": "## Uma primeira olhada em testes automatizados com supertest\n\nPara testar uma API Express de forma automatizada, a combinação mais comum é um test runner (como **Vitest** ou **Jest**) com a biblioteca **supertest**, que sabe fazer requisições HTTP diretamente contra sua aplicação Express, sem precisar de um servidor realmente escutando numa porta.\n\nPara isso funcionar bem, vale um ajuste de estrutura: separe a criação do `app` (com todas as rotas e middlewares) do código que efetivamente chama `app.listen()`. Um arquivo `app.js` exporta o `app` configurado; um arquivo `server.js`, bem pequeno, importa esse `app` e só ele chama `listen()`. Os testes importam o `app.js` e nunca sobem um servidor de verdade."
                    },
                    {
                        "type": "code",
                        "value": "// app.js: monta toda a aplicacao e EXPORTA o app, sem dar listen\nimport express from 'express';\nconst app = express();\n\napp.use(express.json());\n\napp.get('/tarefas', (req, res) => {\n  res.json({ tarefas: [] });\n});\n\nexport default app;\n\n// server.js: so esse arquivo sobe o servidor de verdade\nimport app from './app.js';\n\nconst PORTA = process.env.PORT || 3000;\napp.listen(PORTA, () => {\n  console.log(`Servidor rodando na porta ${PORTA}`);\n});\n\n// tarefas.test.js: o teste importa o app, nunca o server.js\n// test() e expect() vem do seu test runner (Jest ou Vitest)\nimport request from 'supertest';\nimport app from './app.js';\n\ntest('GET /tarefas responde 200 com uma lista', async () => {\n  const resposta = await request(app).get('/tarefas');\n\n  expect(resposta.status).toBe(200);\n  expect(Array.isArray(resposta.body.tarefas)).toBe(true);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Fechando a trilha: o que vem depois\n\nOlhe para trás por um instante. Você começou subindo um servidor Express que só respondia 'olá mundo'. De lá para cá, aprendeu a mapear recursos em rotas, a usar middleware para organizar o pipeline de requisição, a validar entrada sem confiar no cliente, a responder com o status certo e um formato de erro consistente, a estruturar um projeto em rotas, controllers e services, e agora a proteger, logar e testar essa API.\n\nMas se você reparar bem, ainda existem duas lacunas grandes. Primeira: os dados provavelmente ainda vivem num array em memória, o que significa que tudo se perde a cada reinício do servidor. Segunda: qualquer pessoa pode chamar qualquer rota, não existe conceito de usuário logado nem de dono de um recurso. São exatamente essas duas lacunas que os próximos estágios do roadmap de back-end atacam: **banco de dados** (persistir os dados de verdade, com SQL e um driver ou ORM como o Drizzle) e **autenticação** (login, tokens como JWT, e um middleware que protege rotas exigindo um usuário identificado, o mesmo padrão de middleware que você já domina desde o módulo 3)."
                    },
                    {
                        "type": "quote",
                        "value": "Você fechou a trilha de APIs e Frameworks sabendo construir, com Express, uma API REST completa: rotas, middleware, validação, tratamento de erro, estrutura de projeto e boas práticas de produção. O próximo passo natural não é aprender mais sintaxe, é dar profundidade ao que já existe: trocar o array em memória por um banco de dados de verdade e adicionar autenticação para saber quem está do outro lado de cada requisição."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal limitação de testar uma API apenas manualmente (pelo navegador, curl ou um cliente como Insomnia), à medida que o projeto cresce?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Não é prático reexecutar tudo manualmente a cada mudança no código.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ferramentas como curl e Insomnia não conseguem enviar requisições POST.",
                                "isCorrect": false
                            },
                            {
                                "text": "Testes manuais não conseguem verificar o status code da resposta.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Express bloqueia requisições feitas fora do navegador.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual biblioteca é comumente usada junto de um test runner (como Vitest ou Jest) para fazer requisições HTTP diretamente contra uma aplicação Express nos testes automatizados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "morgan",
                                "isCorrect": false
                            },
                            {
                                "text": "cors",
                                "isCorrect": false
                            },
                            {
                                "text": "supertest",
                                "isCorrect": true
                            },
                            {
                                "text": "helmet",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para testar uma API Express com supertest sem precisar subir um servidor numa porta real, qual prática de organização do código é recomendada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Separar a criação do app num arquivo que só exporta; app.listen() fica isolado em outro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sempre chamar app.listen() dentro do próprio arquivo de teste, numa porta aleatória.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar apenas testes manuais, já que o supertest exige um servidor real rodando.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover toda a lógica de rotas para dentro dos arquivos de teste.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No roadmap de back-end desta plataforma, depois da trilha de APIs e Frameworks, quais são os dois próximos estágios naturais para dar profundidade à API construída?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Design de interfaces e testes de usabilidade com usuários reais",
                                "isCorrect": false
                            },
                            {
                                "text": "Banco de dados (persistência real) e autenticação (proteger rotas)",
                                "isCorrect": true
                            },
                            {
                                "text": "Deploy em nuvem e otimização de imagens para produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Aprender uma segunda linguagem de programação e migrar o projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API ainda guarda as tarefas num array em memória (const tarefas = []) e não tem nenhuma verificação de usuário logado nas rotas. Um teste automatizado com supertest confirma que todas as rotas respondem com o status esperado. Isso é suficiente para considerar a API pronta para produção? Por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não. Os testes confirmam as rotas agora, mas faltam persistência real e autenticação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque testes automatizados aprovados garantem que os dados nunca serão perdidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, desde que o rate limiting esteja configurado, o que substitui a necessidade de autenticação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque testes automatizados com supertest não conseguem verificar rotas GET, apenas POST.",
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
