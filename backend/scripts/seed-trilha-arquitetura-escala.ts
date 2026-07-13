// Seed da trilha Arquitetura e Escala (avancado), estagio 10 do roadmap de Back-end.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-arquitetura-escala.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Arquitetura e Escala";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Como o back-end evolui pra aguentar carga: escala vertical x horizontal, monólito com réplicas stateless, banco em escala com réplicas e cache, comunicação assíncrona com filas, de monólito a serviços, e padrões de resiliência. O mapa da arquitetura que sustenta muitas requisições, e o fechamento do roadmap de back-end.";

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
        "titulo": "Módulo 1 - Arquitetura e escala: o problema",
        "aulas": [
            {
                "titulo": "O que é arquitetura de software",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 1: arquitetura e escala, o problema\n\nVocê chegou até aqui depois de nove trilhas de back-end: lógica de programação, os protocolos da web, uma API construída com Node.js e Express, banco de dados com PostgreSQL, autenticação com sessão e JWT, cache com Redis e filas com workers, testes automatizados, containers com Docker, e uma esteira de CI/CD levando tudo isso pro ar sozinho a cada push. Esta é a última trilha do roadmap de Back-end, e ela não ensina uma ferramenta nova. Ensina um jeito diferente de olhar pra tudo que você já construiu.\n\nAté agora, cada trilha resolveu um problema específico: como guardar dado, como autenticar usuário, como deixar uma rota mais rápida. A partir daqui, a pergunta muda de figura: como as peças que você já domina se organizam quando o sistema inteiro precisa crescer, e o que quebra quando essa organização não aguenta o tamanho que o produto virou. Isso é arquitetura."
                    },
                    {
                        "type": "text",
                        "value": "## Código do dia a dia x decisão de arquitetura\n\nNo dia a dia de programar, você toma dezenas de pequenas decisões: nomear uma variável, extrair uma função repetida num helper, escolher entre um for e um map, adicionar um campo novo numa resposta JSON. Se alguma dessas decisões se mostrar ruim amanhã, o conserto é local: reabre o arquivo, refatora, roda os testes de novo e segue em frente.\n\nArquitetura de software é outra categoria de decisão: as escolhas estruturais que definem como as partes do sistema se relacionam entre si, e que, uma vez tomadas, ficam entranhadas em tudo que é construído em cima delas. Não é sobre um arquivo, é sobre a forma do sistema inteiro: como o dado flui, quem depende de quem, o que fica em memória e o que atravessa a rede."
                    },
                    {
                        "type": "text",
                        "value": "## O critério real: quanto custa mudar de ideia depois\n\nO que separa as duas categorias não é o tamanho do commit, nem a dificuldade de escrever o código na hora. É o custo de reverter a decisão depois que o sistema já cresceu em cima dela. Renomear uma variável mal escolhida custa um find and replace. Trocar o banco relacional que guarda o dado de toda a aplicação, depois que já existem centenas de tabelas e anos de dado real, custa meses de projeto, migração cuidadosa e risco real de perder informação pelo caminho.\n\nO mesmo vale pra decidir se dois módulos conversam chamando uma função direto ou trocando mensagem por uma fila (aquela peça que você já viu na trilha de cache, filas e performance): trocar de ideia sobre isso é simples enquanto o sistema é pequeno, e vira um projeto à parte quando dezenas de outras partes já passaram a depender de como aquilo funciona hoje."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Decisão\", \"Custo de reverter depois\", \"Quem sente o efeito\"], [\"Nomear uma variável ou função\", \"Baixo: um find and replace resolve\", \"Só quem lê aquele arquivo\"], [\"Extrair um helper repetido\", \"Baixo: é refatoração local, os testes confirmam\", \"O módulo onde o helper vive\"], [\"Banco relacional ou não relacional pros dados centrais\", \"Alto: exige migrar dado e reescrever consultas\", \"O sistema inteiro\"], [\"Serviços conversam direto ou por fila\", \"Alto: outras partes passam a depender desse contrato\", \"Todo módulo que troca mensagem com aquele serviço\"], [\"Monólito ou dividido em serviços menores\", \"Altíssimo: redesenha fronteira, deploy e times\", \"A aplicação e a equipe inteira\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Você já vem tomando decisões de arquitetura\n\nRepare que você já tomou várias dessas decisões ao longo do roadmap, mesmo sem chamar assim. Escolher Postgres na trilha de banco de dados foi uma decisão de arquitetura. Colocar o Redis na frente do banco pra aliviar leitura, e tirar trabalho pesado da resposta HTTP jogando pra uma fila processada por um worker, também foram. Deixar a autenticação sem estado com JWT, em vez de depender de sessão guardada na memória de um único processo, foi outra. Empacotar tudo em containers e montar uma esteira de CI/CD que aplica migration e sobe a aplicação sozinha também mexeu na forma como o sistema se organiza e se movimenta.\n\nCada uma dessas escolhas resolveu um problema pontual, dentro de um sistema que você conseguia rodar e entender sozinho. O que muda a partir de agora é a escala: as mesmas categorias de decisão, só que pensadas pra um sistema que atende muito mais gente do que cabe na sua máquina de desenvolvimento."
                    },
                    {
                        "type": "text",
                        "value": "## Tamanho do código não é o critério\n\nVale uma ressalva: decisão de arquitetura não é sinônimo de mudança grande ou de muitas linhas de código. Uma única linha pode ser arquitetural, como decidir que toda escrita no banco vai gravar também um evento numa fila, porque isso passa a valer pra cada rota que grava dado dali em diante. E uma mudança grande, como trocar a biblioteca de testes usada no projeto inteiro, pode dar trabalho pra fazer, mas ser barata de reverter, porque não muda como o sistema se comporta em produção.\n\nO critério real é sempre o mesmo: quanto do sistema depende dessa decisão, e quão fundo outras decisões já foram construídas em cima dela."
                    },
                    {
                        "type": "quote",
                        "value": "Código do dia a dia se conserta com um refactor à tarde. Arquitetura se conserta com um projeto, um plano de migração e meses de trabalho cuidadoso. A diferença não é de importância, é de custo de mudar de ideia."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que diferencia uma decisão de arquitetura de uma decisão de código do dia a dia, como extrair uma função?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O custo de mudar de ideia depois: arquitetura afeta o sistema inteiro, não só um arquivo.",
                                "isCorrect": true
                            },
                            {
                                "text": "A quantidade de linhas de código: decisão de arquitetura sempre exige escrever mais código.",
                                "isCorrect": false
                            },
                            {
                                "text": "O cargo de quem decide: só quem é arquiteto de software pode tomar esse tipo de decisão.",
                                "isCorrect": false
                            },
                            {
                                "text": "A linguagem usada: decisão de arquitetura só existe em linguagens compiladas, nunca em Node.js.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time troca um for por um map dentro de uma única função de processamento de lista. Por que essa mudança não conta como decisão de arquitetura?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fica isolada num trecho de código, sem afetar outras partes do sistema.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque só decisão sobre banco de dados conta como decisão de arquitetura de verdade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque trocar estrutura de repetição nunca muda o resultado final do programa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque arquitetura só existe em sistemas com mais de um serviço rodando em produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe pequena começa o projeto com um único banco Postgres compartilhado por toda a aplicação. Meses depois, separar esse banco por módulo exigiria migrar dado aos poucos e reescrever consultas. O que esse cenário ilustra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O custo de uma decisão de arquitetura costuma só aparecer de verdade quando o sistema cresce.",
                                "isCorrect": true
                            },
                            {
                                "text": "Decisão de arquitetura é sempre reversível, bastando reservar uma sprint pra mudança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar um único banco Postgres nunca é decisão de arquitetura, só configuração de infraestrutura.",
                                "isCorrect": false
                            },
                            {
                                "text": "A equipe errou, porque toda aplicação deveria nascer já separada em vários bancos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na mesma sprint, um time renomeia uma variável usada só dentro de um serviço e faz o serviço de pagamentos passar a se comunicar com o de pedidos por fila, em vez de chamada direta. Por que só a segunda mudança é decisão de arquitetura?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A segunda muda a relação entre partes do sistema; a primeira fica isolada num arquivo só.",
                                "isCorrect": true
                            },
                            {
                                "text": "A segunda alterou mais arquivos no mesmo pull request do que a primeira mudança.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas são decisão de arquitetura, porque qualquer mudança em produção conta como tal.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só a chegada de uma tecnologia nova, como uma fila, define uma decisão de arquitetura.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um e-commerce roda como monólito há dois anos. O time avalia separar o catálogo de produtos num serviço à parte. Dado que arquitetura é cara de reverter, qual pergunta pesa mais nessa decisão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Se o ganho esperado compensa o custo de desfazer, caso a separação se mostre um erro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Se algum integrante do time já usou microsserviços num projeto anterior, em outra empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se a linguagem de programação do catálogo é diferente da usada no resto do monólito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se existe um framework de microsserviços pronto que o time possa instalar via npm.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Por que (e quando) pensar em escala",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O crescimento que não aparece na sua máquina\n\nRodando na sua máquina, com um banco de teste e você como único usuário, praticamente qualquer código funciona. O problema de escala é exatamente esse: ele não aparece enquanto o sistema é pequeno, e cresce em silêncio até um dia se tornar visível de uma vez, quase sempre no pior momento possível, quando o tráfego está mais alto.\n\nTrês eixos crescem juntos, e quase nunca no mesmo ritmo:\n\n- **Mais usuários simultâneos**: mais gente logada, navegando, comprando ao mesmo tempo.\n- **Mais dados acumulados**: a tabela de pedidos que tinha mil linhas no ano passado, hoje tem dez milhões.\n- **Mais requisições por segundo**: cada usuário a mais multiplica o tráfego que chega na API."
                    },
                    {
                        "type": "text",
                        "value": "## Os sintomas de não escalar, na prática\n\nEscalar mal não é um erro que aparece como uma mensagem clara no terminal. Aparece como sintoma, quase sempre numa hora ruim:\n\n- Rotas que respondiam em 80ms passam a responder em alguns segundos, sem nenhum deploy novo, só porque o tráfego subiu.\n- Um pico de acesso (uma promoção, uma matéria viral, o horário de pico do produto) derruba a aplicação inteira, enquanto o tráfego normal do dia a dia nunca deu problema.\n- O banco começa a recusar conexão nova, porque o pool de conexões (lembra da trilha de banco de dados) já está todo ocupado com query que não termina de rodar.\n- O health check que você configurou na trilha de CI/CD, aquele endpoint `/health` que o orquestrador consulta de tempos em tempos, começa a falhar, e a instância sai da lista do load balancer bem no momento em que mais gente estava tentando acessar.\n\nNenhum desses sintomas exige um bug novo no código. O código pode estar exatamente igual ao de ontem. Só o volume mudou."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinal\", \"O que costuma causar\"], [\"p99 de latência sobe bem mais que o p50\", \"Uma fatia das requisições esbarra num recurso disputado: conexão de banco, CPU, fila cheia\"], [\"Erro 500 ou timeout só em horário de pico\", \"O sistema aguenta o tráfego médio, mas não o pico\"], [\"Aplicação inteira cai quando um componente lentifica\", \"Falta de isolamento: um gargalo em um lugar derruba tudo\"], [\"Health check começa a falhar sob carga\", \"A instância está viva, mas não consegue mais responder a tempo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa pro negócio, não só pro código\n\nUm sistema que não escala custa dinheiro de um jeito bem concreto: usuário que desiste de comprar porque a página não carrega, cliente que perde confiança depois de uma queda em dia de pico, suporte lotado de reclamação de lentidão. Escala não é luxo de empresa grande, é o que decide se o produto aguenta o próprio sucesso.\n\nAo mesmo tempo, pensar em escala cedo demais, sem sinal nenhum de que o sistema vai precisar, tem um custo próprio: complexidade que ninguém usa, tempo de time gasto se preparando pra um volume que talvez nunca chegue. O equilíbrio certo entre os dois extremos é o fio condutor do resto desta trilha, e a última aula deste módulo entra nisso a fundo."
                    },
                    {
                        "type": "text",
                        "value": "## O gatilho certo não é o calendário, é o número\n\nA pergunta certa nunca é \"já faz tempo que lançamos, não devíamos escalar?\". É: o que os números estão dizendo agora? Latência subindo mês a mês mesmo sem mudança de código, uso de CPU ou memória perto do limite boa parte do dia, pool de conexão do banco esgotando em horário de pico: esses são gatilhos de verdade. Uma aplicação nova, com pouco tráfego, não tem nenhum desses sinais, e não tem por que se preocupar com escala ainda.\n\nIsso não quer dizer esperar o sistema cair pra agir. Quer dizer medir de verdade, com métrica, não com sensação, e agir quando o número mostrar uma tendência, não quando alguém achar que está na hora."
                    },
                    {
                        "type": "quote",
                        "value": "Escalar mal não avisa com um erro no terminal. Avisa com uma rota que foi ficando mais lenta mês a mês, até o dia em que um pico de tráfego transforma esse aviso em queda."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais são os três eixos que costumam crescer juntos num produto que dá certo, e que motivam pensar em escala?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Usuários simultâneos, volume de dados acumulado e requisições por segundo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Número de desenvolvedores no time, linhas de código e quantidade de testes automatizados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantidade de containers Docker, tamanho da imagem e número de branches no repositório.",
                                "isCorrect": false
                            },
                            {
                                "text": "Número de tabelas no banco, quantidade de índices e tamanho do arquivo de configuração.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API respondia em 80ms e, sem nenhum deploy novo, passa a responder em alguns segundos só durante o horário de pico. O que esse sintoma sugere?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O volume de tráfego subiu e o sistema não aguenta mais o pico, mesmo com o código igual.",
                                "isCorrect": true
                            },
                            {
                                "text": "Existe um bug novo no código, já que lentidão sem deploy só acontece por erro de programação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O relógio do servidor está errado, o que faz a latência parecer maior do que realmente é.",
                                "isCorrect": false
                            },
                            {
                                "text": "O horário de pico sempre altera o comportamento do código, independente do tráfego real.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o health check configurado na trilha de CI/CD pode começar a falhar justamente durante um pico de tráfego, mesmo sem a aplicação ter caído de vez?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A instância está viva, mas demora demais pra responder sob carga, e falha o teste de tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O health check é desligado automaticamente pelo orquestrador sempre que o tráfego sobe muito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pico de tráfego reinicia o endpoint `/health` e ele fica indisponível por alguns minutos.",
                                "isCorrect": false
                            },
                            {
                                "text": "O load balancer para de consultar o health check quando percebe tráfego acima do normal.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O pool de conexões do banco começa a recusar conexão nova só em horário de pico, mesmo a aplicação parecendo saudável no restante do dia. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sob mais tráfego, mais requisições disputam as mesmas conexões limitadas do pool ao mesmo tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Postgres reduz sozinho o limite de conexões disponíveis quando detecta tráfego alto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pool de conexões só existe pra ambiente de desenvolvimento, não deveria aparecer em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso indica que o driver pg tem um limite fixo de conexões, igual em qualquer aplicação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação nova, com pouco tráfego, ainda não mostra nenhum sinal de esgotamento: latência estável, CPU e memória longe do limite, pool de conexão nunca cheio. O que essa situação indica, considerando que o gatilho certo pra escalar é o número, não o calendário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ainda não há motivo pra investir em escalar; os números ainda não pedem essa mudança.",
                                "isCorrect": true
                            },
                            {
                                "text": "Já é hora de escalar, porque toda aplicação em produção deveria se preparar desde o primeiro dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ausência de sinais significa que o sistema nunca vai precisar escalar, em hipótese alguma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os números só importam depois de um ano de aplicação no ar, antes disso não valem nada.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escala vertical x horizontal",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Duas direções pra crescer\n\nLá na trilha de cache, filas e performance você já bateu de frente com essa escolha, na aula sobre escala vertical e horizontal: quando uma única instância da aplicação não aguenta mais o tráfego, existem exatamente dois caminhos pra aguentar mais carga. Aumentar a máquina que já existe, ou somar mais máquinas rodando a mesma aplicação. Esta trilha assume que você já viu o básico disso; aqui a ideia é fixar o vocabulário e olhar pra ele com a lente de arquitetura, porque essa escolha volta a aparecer em praticamente todo módulo daqui pra frente."
                    },
                    {
                        "type": "text",
                        "value": "## Escala vertical: uma máquina maior\n\nEscalar verticalmente é trocar o servidor por um mais forte: mais CPU, mais memória RAM, disco mais rápido, na mesma máquina única. É a forma mais simples de ganhar fôlego: não muda uma linha de código, só o tamanho da máquina onde a aplicação já roda.\n\nO problema é que toda máquina tem um teto físico. Sempre existe um processador mais rápido que o seu, mas também existe um limite de mercado pra quanto processador cabe numa máquina só. E o custo não cresce em linha reta: dobrar a capacidade de uma máquina já grande custa bem mais que o dobro do preço, porque hardware de ponta carrega um prêmio embutido. Escalar vertical funciona bem até um certo tamanho, e fica cada vez mais caro, e mais arriscado por depender de uma única máquina, conforme esse tamanho cresce."
                    },
                    {
                        "type": "text",
                        "value": "## Escala horizontal: mais máquinas\n\nEscalar horizontalmente é somar mais máquinas rodando cópias idênticas da aplicação, em vez de aumentar uma só. Em vez de uma instância gigante, três, dez ou cem instâncias médias, cada uma aguentando uma fatia do tráfego total.\n\nA vantagem central é que, em teoria, não existe teto: sempre dá pra somar mais uma instância. Mas essa liberdade cobra um preço de entrada que a escala vertical não cobra: a aplicação precisa estar preparada pra rodar em mais de um lugar ao mesmo tempo, sem que uma instância dependa de algo que só existe na memória de outra. Essa exigência, ficar sem estado local, o que você já viu de relance na trilha de cache, é justamente o assunto do próximo módulo desta trilha."
                    },
                    {
                        "type": "code",
                        "value": "1 servidor (escala vertical)\n\n    cliente\n       |\n       v\n[  servidor unico  ]   CPU: 4 -> 8 -> 16 nucleos\n[   app + banco     ]   RAM: 8GB -> 32GB -> 128GB\n\n# a maquina cresce ate bater no teto do hardware disponivel no mercado\n\n\nN servidores (escala horizontal)\n\n         cliente\n            |\n            v\n   [   load balancer   ]\n      |      |      |\n  [app 1] [app 2] [app 3]\n      |      |      |\n      +------+------+\n             |\n             v\n        [    banco    ]\n\n# a maquina nao cresce: o numero de maquinas cresce\n# o load balancer decide qual instancia atende cada requisicao"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pergunta\", \"Escala vertical\", \"Escala horizontal\"], [\"O que muda fisicamente\", \"A mesma máquina fica maior: mais CPU, RAM, disco\", \"Mais máquinas iguais somadas em paralelo\"], [\"Até onde dá pra crescer\", \"Até o maior hardware disponível no mercado\", \"Sem teto claro, soma quantas instâncias precisar\"], [\"Como o custo se comporta\", \"Cresce mais rápido que a capacidade ganha\", \"Cresce de forma mais próxima do tráfego real\"], [\"O que a aplicação precisa ter\", \"Nada de especial, funciona como está\", \"Nenhuma instância pode depender de estado só dela\"], [\"Risco se algo falhar\", \"A máquina única cai, o sistema inteiro para\", \"Uma instância cai, as outras seguem respondendo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Na prática, as duas se combinam\n\nNão é raro usar as duas ao mesmo tempo: cada instância roda numa máquina de tamanho razoável, nem a menor nem a maior disponível, e o número de instâncias sobe e desce conforme o tráfego, o chamado autoscaling, comum em provedor de nuvem. A escolha raramente é \"só vertical\" ou \"só horizontal\" pra sempre. É escalar vertical até onde for barato e simples, e horizontal quando o teto ou o custo da vertical começar a apertar."
                    },
                    {
                        "type": "quote",
                        "value": "Escala vertical é trocar a caixa por uma maior. Escala horizontal é somar mais caixas. A primeira esbarra num teto de hardware; a segunda esbarra na sua aplicação, se ela não estiver pronta pra rodar em mais de um lugar ao mesmo tempo."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é escala vertical?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Aumentar a capacidade de uma única máquina, com mais CPU, memória ou disco.",
                                "isCorrect": true
                            },
                            {
                                "text": "Somar mais máquinas rodando cópias da mesma aplicação em paralelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o banco de dados relacional por um banco não relacional mais rápido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de requisições que a aplicação processa por segundo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o principal limite da escala vertical, mesmo com orçamento disponível?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Existe um teto físico de hardware; a máquina mais forte do mercado ainda é finita.",
                                "isCorrect": true
                            },
                            {
                                "text": "Bancos de dados relacionais recusam rodar em máquinas com mais de 16GB de RAM.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escala vertical exige reescrever a aplicação inteira antes de trocar de máquina.",
                                "isCorrect": false
                            },
                            {
                                "text": "Provedores de nuvem limitam por contrato o uso de escala vertical a um ano.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação já roda na maior máquina que o provedor de nuvem oferece, e o tráfego continua subindo. Qual é a saída mais coerente com os limites da escala vertical?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Migrar pra escala horizontal, somando mais instâncias em vez de uma máquina maior.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar de provedor de nuvem, já que outro provedor certamente oferece máquina maior.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de usuários simultâneos permitidos, pra caber na máquina atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aguardar o hardware do mercado evoluir, já que toda máquina eventualmente fica mais forte.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que somar mais instâncias atrás de um load balancer não resolve, sozinho, o problema de escalar, se a aplicação guarda alguma informação só na memória do próprio processo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma requisição pode cair numa instância que nunca viu aquela informação guardada antes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque load balancer só distribui tráfego entre no máximo duas instâncias por padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque escala horizontal exige trocar toda a aplicação de linguagem de programação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque memória do processo é sempre compartilhada automaticamente entre instâncias.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide, por padrão, sempre escalar verticalmente primeiro antes de considerar horizontal, em qualquer situação de crescimento. Qual é o risco central dessa regra fixa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ignora que o custo da vertical cresce mais rápido que a capacidade e tem teto físico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escala vertical nunca funciona na prática, então a regra estaria sempre errada desde o início.",
                                "isCorrect": false
                            },
                            {
                                "text": "Máquina maior sempre exige trocar de linguagem de programação, o que a regra ignora.",
                                "isCorrect": false
                            },
                            {
                                "text": "Vertical é proibida por padrão em provedores de nuvem sérios, então a regra é inviável.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Latência x throughput",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Duas perguntas diferentes sobre performance\n\nVocê já viu latência e throughput a fundo na trilha de cache, filas e performance, incluindo por que a latência média engana e o p99 conta a história real. Vale voltar aos dois conceitos aqui, porque no nível de arquitetura eles deixam de ser só \"métrica de uma rota\" e passam a ser um critério pra decidir como o sistema inteiro é desenhado.\n\n**Latência** é quanto tempo uma requisição, sozinha, leva pra ir e voltar. **Throughput** é quantas requisições o sistema inteiro processa por segundo. Uma pergunta é sobre a experiência de uma pessoa; a outra é sobre a capacidade do sistema como um todo."
                    },
                    {
                        "type": "text",
                        "value": "## Por que melhorar um não melhora o outro de graça\n\nEscala vertical, o assunto da aula passada, tende a ajudar latência: uma CPU mais rápida termina um cálculo mais rápido, uma máquina com mais memória evita trocar dado com disco. Mas uma máquina só, mesmo forte, ainda processa um número limitado de requisições ao mesmo tempo, então o ganho de throughput tem limite.\n\nEscala horizontal tende a ajudar throughput: mais instâncias significam mais requisições atendidas em paralelo, no mesmo segundo. Mas cada requisição individual não fica mais rápida por causa disso, ela só divide espaço com menos concorrência. O load balancer na frente das instâncias ainda soma um salto de rede a mais no caminho, o que pode até aumentar, levemente, a latência de cada requisição isolada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pergunta\", \"Latência\", \"Throughput\"], [\"O que mede\", \"Tempo de uma requisição, do início ao fim\", \"Quantas requisições o sistema processa por segundo\"], [\"Unidade típica\", \"Milissegundos\", \"Requisições por segundo\"], [\"O que costuma ajudar\", \"CPU mais rápida, menos trabalho síncrono, menos saltos de rede\", \"Mais instâncias, mais paralelismo, fila absorvendo pico\"], [\"Quem sente na pele\", \"A pessoa esperando aquela resposta específica\", \"O sistema como um todo, sob muita gente ao mesmo tempo\"], [\"Exemplo de prioridade\", \"Finalizar compra: ninguém quer esperar\", \"Importação em lote: pode demorar, desde que processe tudo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O trade-off clássico: a fila troca latência por throughput\n\nA fila que você construiu na trilha de cache, filas e performance é o exemplo mais direto desse trade-off. Responder a requisição na hora, processando tudo de forma síncrona, dá a menor latência possível pra quem pediu: a resposta só sai depois que o trabalho todo termina. Mas isso limita quantas requisições simultâneas o sistema aguenta, porque cada uma ocupa um processo até o fim.\n\nJogar o trabalho pesado pra uma fila e responder de imediato faz o contrário: a latência da requisição cai, a resposta sai rápido, antes do trabalho de verdade terminar, e o throughput sobe, porque o sistema aceita muito mais pedidos por segundo sem ficar preso esperando cada um. O preço é que o resultado final do trabalho não está pronto na hora da resposta, só depois, quando o worker processar."
                    },
                    {
                        "type": "text",
                        "value": "## Cuidado: fila cheia também aumenta latência\n\nExiste um limite pra esse ganho. Se a fila cresce mais rápido do que os workers conseguem esvaziar, cada job novo espera mais tempo na fila antes de ser pego, e a latência de ponta a ponta, da chegada do pedido até o resultado ficar pronto, sobe de novo, mesmo a resposta HTTP inicial continuando rápida. Throughput alto na entrada não significa nada se o trabalho se acumula atrás, só empurrado pra depois."
                    },
                    {
                        "type": "quote",
                        "value": "Latência é o que uma pessoa sente esperando uma resposta. Throughput é quantas pessoas o sistema consegue atender ao mesmo tempo. Otimizar um pode não mexer no outro, e às vezes melhora um às custas do outro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a diferença central entre latência e throughput?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Latência é o tempo de uma requisição; throughput é quantas o sistema processa por segundo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Latência mede erro por segundo; throughput mede sucesso por segundo, sempre em porcentagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Latência só é medida em bancos de dados; throughput só é medido em filas de mensagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Latência e throughput são dois nomes diferentes pra exatamente a mesma métrica de performance.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Escalar horizontalmente, somando mais instâncias atrás de um load balancer, tende a melhorar qual métrica primeiro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Throughput, porque mais instâncias processam mais requisições em paralelo por segundo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Latência, porque cada requisição individual passa a rodar numa máquina mais rápida.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas melhoram sempre na mesma proporção, já que estão diretamente ligadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma das duas muda, escala horizontal só afeta o custo mensal da infraestrutura.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota passa a responder em poucos milissegundos depois de jogar o trabalho pesado pra uma fila processada por worker. O que aconteceu com a latência da resposta HTTP e com o throughput do sistema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A latência da resposta caiu e o throughput subiu, às custas do resultado sair depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "A latência e o throughput caíram juntos, porque fila sempre atrasa o sistema inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o throughput mudou; latência de resposta HTTP nunca é afetada por uso de fila.",
                                "isCorrect": false
                            },
                            {
                                "text": "A latência caiu, mas o throughput também caiu, porque o worker compete por CPU.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Os workers processam job mais devagar do que a fila recebe pedido novo, por um período sustentado. O que tende a acontecer com a latência de ponta a ponta, do pedido até o resultado ficar pronto, mesmo a resposta HTTP inicial continuando rápida?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sobe, porque cada job novo espera cada vez mais tempo na fila até ser processado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Continua igual, porque a resposta HTTP rápida já garante latência baixa em qualquer cenário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cai, porque fila cheia sempre acelera o processamento dos jobs mais antigos primeiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o throughput da fila é afetado, latência de ponta a ponta não depende do tamanho da fila.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um endpoint de finalizar compra e um endpoint de importação em massa de planilha têm perfis de uso bem diferentes. Qual prioridade de performance faz mais sentido pra cada um?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Finalizar compra prioriza latência baixa; importação aceita mais latência por mais throughput.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois deveriam priorizar throughput alto, já que latência só importa em endpoint público.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois deveriam priorizar latência baixa, throughput só importa em sistema com fila.",
                                "isCorrect": false
                            },
                            {
                                "text": "Importação prioriza latência baixa, porque planilha grande não pode esperar processamento.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Trade-offs e o perigo de otimizar cedo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Não existe decisão de arquitetura sem custo\n\nTodas as aulas deste módulo giraram em torno da mesma ideia, sem nomear ela diretamente: toda decisão de arquitetura troca uma coisa por outra. Escala vertical troca simplicidade por um teto físico. Escala horizontal troca esse teto por exigir uma aplicação sem estado local. Fila troca resposta imediata por throughput maior, e resultado pronto na hora por resultado pronto depois. Não existe uma escolha que só traz vantagem, sem custo em nenhum outro lugar. Se alguém oferecer uma solução de arquitetura sem nenhuma desvantagem, o problema não sumiu, só ainda não apareceu."
                    },
                    {
                        "type": "text",
                        "value": "## O mesmo padrão, em decisões que você já tomou\n\nEsse padrão não é novidade desta trilha. Cache troca dado sempre atualizado por resposta rápida, e por isso precisa de uma estratégia de invalidação (trilha de cache, filas e performance). Guardar sessão no servidor troca simplicidade por um estado que precisa ser compartilhado entre instâncias; usar JWT troca esse estado por um token que não dá pra revogar tão fácil quanto apagar uma sessão (trilha de autenticação). Um índice novo no banco troca leitura mais rápida por escrita um pouco mais lenta e mais espaço em disco (trilha de banco de dados). O resto desta trilha vai continuar mostrando o mesmo formato de decisão: ganha isso, perde aquilo, e cabe a quem projeta decidir qual perda é aceitável pro problema real."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Decisão\", \"O que você ganha\", \"O que você paga\"], [\"Escala vertical\", \"Simplicidade, nada muda na aplicação\", \"Teto físico e custo que cresce mais que a capacidade\"], [\"Escala horizontal\", \"Sem teto claro, resiste à queda de uma instância\", \"Aplicação precisa ficar sem estado local, mais peça pra operar\"], [\"Fila em vez de chamada direta\", \"Resposta mais rápida, mais throughput\", \"Resultado não fica pronto na hora, mais uma peça no sistema\"], [\"Dividir o monólito em serviços\", \"Times menores decidem e deployam por conta própria\", \"Mais rede, mais dado espalhado, mais difícil de depurar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O aviso central desta trilha: não otimize cedo demais\n\nComo cada decisão de arquitetura cobra um preço, complexidade que ninguém vai usar é uma decisão ruim, não uma decisão cautelosa. Preparar o sistema pra um milhão de usuários quando ele tem cem é pagar o custo de uma escala horizontal completa, de uma fila pra tudo, de serviços separados, sem nenhum dos benefícios que motivariam esse custo, porque o problema que essas peças resolvem ainda nem existe.\n\nUm monólito bem escrito, com índice nos lugares certos (trilha de banco), cache nos pontos caros (trilha de cache), sem N+1 escondido atrás de um include inocente, e rodando em algumas réplicas atrás de um load balancer, aguenta muito mais tráfego do que a maioria dos times imagina. A fama do monólito como algo que \"não escala\" é mais sobre monólito malfeito do que sobre a ideia de monólito em si."
                    },
                    {
                        "type": "text",
                        "value": "## Meça, não adivinhe\n\nA pergunta que decide quando escalar nunca é \"quanto tempo faz que lançamos\" ou \"quantas pessoas usam sistemas parecidos com o nosso\". É o número real do seu sistema: latência subindo, pool de conexão esgotando, CPU no limite boa parte do dia, os mesmos sinais da segunda aula deste módulo. Escalar sem esse número na mão é apostar recurso e tempo de time num problema que talvez nunca aconteça do jeito que foi imaginado.\n\nO resto desta trilha vai construir, peça por peça, o ferramental pra quando os números pedirem: escalar o monólito primeiro, colocar o banco pra aguentar mais leitura, desacoplar trabalho com fila, e só então considerar dividir em serviços. Mas todo esse ferramental parte do mesmo princípio que fecha este módulo: resolva o problema que os números mostram, não o que a imaginação antecipa."
                    },
                    {
                        "type": "quote",
                        "value": "Uma arquitetura mais simples do que o necessário quebra sob carga. Uma arquitetura mais complexa do que o necessário quebra por conta própria, antes mesmo de a carga chegar. Escalar no momento certo é medir, não adivinhar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a ideia central por trás de 'todo trade-off' em arquitetura de software?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Toda decisão de arquitetura troca um ganho por algum custo em outro lugar do sistema.",
                                "isCorrect": true
                            },
                            {
                                "text": "Toda decisão de arquitetura pode ser desfeita sem custo, bastando planejar bem antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só decisões envolvendo banco de dados carregam algum tipo de trade-off relevante.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trade-off é um problema exclusivo de sistemas distribuídos, não existe em monólitos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que 'preparar o sistema pra um milhão de usuários' quando ele ainda tem cem é considerado um erro, segundo a ideia de não otimizar cedo demais?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Paga o custo dessas peças sem nenhum dos benefícios, já que o problema ainda não existe.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque nenhum sistema real chega a um milhão de usuários, então o esforço é sempre inútil.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque escalar cedo demais é proibido por boas práticas de mercado, sem exceção alguma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um milhão de usuários exige trocar de linguagem de programação obrigatoriamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time mede os números do próprio sistema (latência estável, CPU longe do limite, pool de conexão nunca cheio) e, mesmo assim, decide dividir o monólito em cinco serviços 'por precaução'. O que essa decisão ignora?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que o custo de dividir em serviços deveria ser pago quando os números pedirem, não antes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que dividir em serviços nunca traz nenhum tipo de benefício, em nenhuma situação real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que monólito é sempre superior a serviços divididos, independente do tamanho do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que só empresas pequenas têm permissão de operar mais de um serviço em produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um monólito bem escrito, com índice nos lugares certos e cache nos pontos caros, aguenta um tráfego bem maior do que a fama de 'monólito não escala' sugere. O que essa observação aponta como causa real por trás dessa fama?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A fama costuma vir de monólito malfeito, não da ideia de monólito em si.",
                                "isCorrect": true
                            },
                            {
                                "text": "A fama está correta: nenhum monólito aguenta tráfego alto, independente de como é escrito.",
                                "isCorrect": false
                            },
                            {
                                "text": "A fama só existe porque monólito não pode rodar em mais de uma réplica atrás de load balancer.",
                                "isCorrect": false
                            },
                            {
                                "text": "A fama vem do fato de monólitos serem proibidos de usar índice ou cache no banco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois times enfrentam o mesmo sintoma: latência subindo, pool de conexão esgotando em pico. O time A decide medir onde exatamente está o gargalo antes de agir; o time B decide, direto, dividir o monólito em serviços, achando que essa é sempre a resposta pra escala. Qual é o risco maior na decisão do time B?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Pagar o custo de dividir em serviços sem saber se o gargalo real pedia essa solução.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum risco real, dividir em serviços sempre resolve qualquer sintoma de escala mostrado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco é só de prazo, já que dividir em serviços tem exatamente o mesmo custo de medir antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O time A está errado: medir antes de agir só atrasa a solução sem trazer benefício algum.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Escalar o monólito",
        "aulas": [
            {
                "titulo": "O monólito e suas virtudes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O monólito e suas virtudes\n\nAté aqui, ao longo de todo o roadmap de back-end, você construiu uma coisa só: uma aplicação única. Um processo Node.js que sobe, escuta numa porta, fala com um Postgres, usa um Redis, roda dentro de uma imagem Docker e sai pro ar através do seu pipeline de CI/CD. Isso tem nome: **monólito**.\n\nMonólito não é xingamento. É a forma mais comum, e na maioria das vezes mais correta, de começar um sistema."
                    },
                    {
                        "type": "text",
                        "value": "## As virtudes que ninguém deveria descartar\n\nUm monólito bem feito entrega coisas que um sistema distribuído paga caro pra recuperar depois:\n\n- **Simples de entender**: o código inteiro está num repositório só, com um fluxo de chamadas que dá pra seguir lendo de cima a baixo.\n- **Simples de testar**: uma função chama a outra dentro do mesmo processo, sem rede no meio e sem timeout de serviço vizinho pra simular.\n- **Simples de deployar**: um artefato só, um pipeline só, sobe e pronto.\n- **Simples de debugar**: um erro gera um stack trace só, dentro de um processo só, sem caçar log espalhado em três serviços diferentes.\n- **Sem complexidade de rede interna**: quando o módulo de autenticação chama o módulo de cursos, é uma chamada de função, não uma requisição que pode falhar, atrasar ou cair no meio do caminho."
                    },
                    {
                        "type": "code",
                        "value": "Cliente\n  |\n  v\n[ Aplicação (um processo) ]\n  HTTP/API -> Regras de negócio -> Acesso a dados\n  |\n  v\n[ Postgres (um banco) ]\n\nTudo dentro da mesma caixa: uma chamada de função,\nnão uma chamada de rede."
                    },
                    {
                        "type": "text",
                        "value": "## Monólito não é sinônimo de bagunça\n\nExiste uma confusão comum: achar que monólito é código todo misturado, sem fronteira nenhuma entre as partes. Não precisa ser assim. Dá pra ter um monólito com módulos internos bem definidos (autenticação, cursos, pagamento, cada um com sua responsabilidade), todos rodando no mesmo processo e no mesmo deploy. Esse desenho tem nome, monólito modular, e volta com força mais adiante nesta trilha, quando a discussão for se vale a pena quebrar o monólito em serviços separados."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\", \"Responsabilidade\", \"Conecta com\"], [\"HTTP/API\", \"Recebe a requisição, valida entrada e devolve resposta\", \"A trilha de APIs REST\"], [\"Regras de negócio\", \"Aplica a lógica da aplicação\", \"O que você já cobriu na trilha de testes\"], [\"Acesso a dados\", \"Fala com o banco de dados\", \"A trilha de banco de dados e o Postgres\"], [\"Sessão e autenticação\", \"Confere quem é o usuário logado\", \"A trilha de autenticação\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que começar aqui\n\nLembra do aviso do módulo anterior desta trilha: não otimize cedo demais, meça antes de agir. Um monólito bem escrito aguenta uma quantidade de tráfego bem maior do que a maioria dos times imagina antes de medir de verdade. Começar simples não é preguiça, é a decisão que dá menos trabalho total: menos infraestrutura pra manter, menos rede pra depurar, menos superfície pra errar, enquanto o produto ainda está descobrindo se vai precisar escalar."
                    },
                    {
                        "type": "quote",
                        "value": "Monólito não é gambiarra: é o jeito mais simples de entregar valor enquanto você ainda está descobrindo o que o sistema precisa ser."
                    }
                ],
                "questions": [
                    {
                        "statement": "No sentido usado nesta trilha, o que é um monólito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Todo o código roda num processo só e sobe num deploy único.",
                                "isCorrect": true
                            },
                            {
                                "text": "O código roda em vários serviços, cada um com deploy próprio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada módulo roda isolado, numa máquina virtual própria só dele.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados ficam espalhados em bancos completamente independentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time pequeno está começando um produto novo, sem histórico de tráfego. Qual é o argumento mais forte pra começar pelo monólito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Testar, deployar e debugar ficam mais simples com tudo num só processo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O monólito dispensa qualquer cuidado com a organização interna do código.",
                                "isCorrect": false
                            },
                            {
                                "text": "O monólito escala sozinho, sem precisar de réplicas ou load balancer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Times grandes trabalham juntos no monólito sem nenhum conflito de código.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que 'monólito' não deveria ser tratado como sinônimo de código bagunçado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um monólito pode ter módulos internos bem definidos, mesmo num processo só.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um monólito jamais tem mais de um arquivo de código dentro do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um monólito, por definição, roda sempre sem camada de acesso a dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um monólito impede qualquer separação entre regras de negócio e rotas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação roda inteira num processo, mas por dentro está organizada em módulos de autenticação, catálogo e pagamento, cada um com fronteira clara. O que esse desenho representa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um monólito modular, que organiza responsabilidades sem quebrar o deploy único.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um conjunto de microsserviços, já que existem fronteiras entre os módulos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma arquitetura orientada a eventos, por causa da separação de responsabilidades.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um sistema distribuído, porque cada módulo tem sua própria responsabilidade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual situação melhor justifica manter a arquitetura monolítica em vez de partir para múltiplos serviços?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O time é pequeno e o tráfego medido não chega perto do limite de capacidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "O produto já tem milhões de usuários ativos gerando picos constantes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Times diferentes precisam publicar mudanças em horários totalmente independentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada parte do sistema já precisa rodar numa linguagem de programação diferente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Réplicas atrás de um load balancer",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que significa escalar horizontalmente\n\nO módulo anterior desta trilha já separou os dois caminhos possíveis: escala vertical (uma máquina maior) e escala horizontal (mais máquinas). Escalar o monólito horizontalmente quer dizer uma coisa bem específica: pegar a mesma aplicação, a mesma imagem Docker, o mesmo código, e rodar várias cópias dela ao mesmo tempo. Cada cópia é uma **réplica**. Nenhuma réplica é a principal, todas são idênticas e substituíveis."
                    },
                    {
                        "type": "text",
                        "value": "## O load balancer entra em cena\n\nCom várias réplicas rodando, alguém precisa decidir pra qual delas cada requisição vai. Esse alguém é o **load balancer** (na prática, ferramentas como nginx e HAProxy, ou o balanceador gerenciado de um provedor de nuvem). Ele fica na frente de tudo, recebe o tráfego e distribui entre as réplicas saudáveis.\n\nA estratégia mais comum é o **round-robin**: a primeira requisição vai pra réplica 1, a segunda pra réplica 2, a terceira pra réplica 3, e volta pra réplica 1 depois. Simples e eficaz quando as réplicas têm capacidade parecida."
                    },
                    {
                        "type": "code",
                        "value": "upstream app_servers {\n    server app1:3000;\n    server app2:3000;\n    server app3:3000;\n    server app4:3000;\n}\n\nserver {\n    listen 80;\n\n    location / {\n        proxy_pass http://app_servers;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n    }\n}\n\n# Sem estratégia declarada, o nginx usa round-robin:\n# cada requisição vai pra próxima réplica da lista."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estratégia\", \"Como decide a próxima réplica\", \"Quando usar\"], [\"Round-robin\", \"Distribui em sequência, uma réplica de cada vez\", \"Réplicas com capacidade parecida, caso padrão\"], [\"Least connections\", \"Manda pra réplica com menos conexões abertas no momento\", \"Requisições com duração bem desigual entre si\"], [\"IP hash\", \"Calcula um hash a partir do IP do cliente\", \"Quando o mesmo cliente precisa cair sempre na mesma réplica\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Réplicas saudáveis, mais capacidade no papel\n\nUm load balancer só é útil se souber quais réplicas estão de pé. É aqui que o health check da trilha de deploy volta a aparecer: o load balancer bate periodicamente numa rota como `/health` de cada réplica e para de mandar tráfego pra quem não responde. Uma réplica travada, ou no meio de um restart, some da lista até voltar a responder.\n\nDobrar o número de réplicas dobra, em teoria, a capacidade de atender requisições em paralelo. Em teoria, porque isso só vale se a aplicação aguentar rodar em várias cópias ao mesmo tempo sem se atrapalhar, e essa é exatamente a exigência da próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "Escalar horizontalmente é multiplicar a mesma aplicação, não inventar uma nova. A régua da capacidade é o número de réplicas saudáveis atrás do load balancer."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é uma réplica, no contexto de escalar um monólito horizontalmente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma cópia idêntica da aplicação, rodando em paralelo com as outras.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma versão reduzida da aplicação, com menos funcionalidades ativas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um banco de dados secundário que guarda uma cópia dos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um serviço totalmente diferente que atende só parte das rotas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o papel principal do load balancer numa aplicação com várias réplicas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Distribuir as requisições recebidas entre as réplicas disponíveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "Guardar em cache as respostas mais pedidas por cada réplica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Executar as migrations do banco antes de cada novo deploy.",
                                "isCorrect": false
                            },
                            {
                                "text": "Compilar o código da aplicação antes de subir uma réplica nova.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num cluster com quatro réplicas de capacidade parecida e requisições de duração semelhante, qual estratégia do load balancer costuma ser suficiente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Round-robin, distribuindo as requisições em sequência entre as réplicas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sticky session, prendendo cada cliente sempre na mesma réplica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Enviar toda requisição direto pra réplica que subiu primeiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolher a réplica de forma aleatória, sem considerar carga nenhuma.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe configura um load balancer, mas esquece de configurar o health check das réplicas. O que tende a dar errado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O load balancer pode seguir mandando tráfego pra uma réplica travada.",
                                "isCorrect": true
                            },
                            {
                                "text": "As réplicas deixam automaticamente de compartilhar o mesmo código-fonte.",
                                "isCorrect": false
                            },
                            {
                                "text": "O round-robin passa a funcionar como sticky session sem configuração.",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco de dados perde a conexão com todas as réplicas ao mesmo tempo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que só adicionar mais réplicas atrás do load balancer não garante, sozinho, mais capacidade real de atendimento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Depende de a aplicação aguentar rodar em várias cópias sem conflito entre si.",
                                "isCorrect": true
                            },
                            {
                                "text": "O load balancer sempre limita o tráfego total a uma réplica por vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Réplicas adicionais reduzem automaticamente as conexões com o banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada réplica nova precisa rodar numa linguagem de programação diferente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Por que a app precisa ser stateless",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O problema do estado que mora na memória\n\nToda réplica é idêntica no código, mas cada uma roda no seu próprio processo, com sua própria memória. Se a aplicação guarda alguma coisa numa variável local (um objeto, um Map, um array em memória), essa informação existe só naquela réplica. Nenhuma outra enxerga.\n\nIsso é inofensivo até o load balancer mandar duas requisições do mesmo usuário pra réplicas diferentes, o que é exatamente o comportamento esperado de round-robin. Nesse momento, qualquer coisa que dependa daquele estado local quebra."
                    },
                    {
                        "type": "text",
                        "value": "## Onde o estado costuma se esconder\n\nOs culpados de sempre:\n\n- **Sessão de login**: guardada numa variável em memória, funciona na réplica que recebeu o login e falha em qualquer outra.\n- **Cache manual**: um objeto guardado em memória pra evitar reconsultar o banco existe só naquela réplica, as outras seguem sem cache nenhum.\n- **Arquivo enviado pelo usuário**: salvar um upload no disco local do container prende aquele arquivo àquela réplica específica.\n- **Contador em memória**: rate limiting, tentativa de login, qualquer contador que vive numa variável local, cada réplica conta o seu, nenhuma vê o total real."
                    },
                    {
                        "type": "code",
                        "value": "// Errado: sessão na memória do processo (padrão do express-session)\n// some no restart e não é compartilhada entre réplicas\n// app.use(session({ secret: process.env.SESSION_SECRET }))\n\n// Certo: sessão centralizada no Redis, qualquer réplica enxerga\nconst session = require('express-session');\nconst RedisStore = require('connect-redis').default;\nconst { createClient } = require('redis');\n\nconst redisClient = createClient({ url: process.env.REDIS_URL });\nredisClient.connect();\n\napp.use(session({\n  store: new RedisStore({ client: redisClient }),\n  secret: process.env.SESSION_SECRET,\n  resave: false,\n  saveUninitialized: false\n}));"
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que\", \"Jeito stateful (evitar)\", \"Jeito stateless (usar)\"], [\"Sessão do usuário\", \"Variável em memória, presa a uma réplica\", \"Redis, compartilhado entre todas as réplicas\"], [\"Arquivo enviado\", \"Disco local do container da réplica\", \"Storage externo, fora de qualquer réplica\"], [\"Cache de consulta\", \"Objeto guardado na memória do processo\", \"Redis, com TTL, visível a todas as réplicas\"], [\"Contador de limite\", \"Variável local incrementada em memória\", \"Contador no Redis, compartilhado e com expiração\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## JWT: uma saída sem estado no servidor\n\nA trilha de autenticação já mostrou outro caminho: o JWT. Em vez de o servidor guardar a sessão em algum lugar (memória ou Redis), o próprio token carrega os dados necessários, assinado, e o cliente reapresenta esse token a cada requisição. Qualquer réplica valida o token sozinha, sem consultar nada além da chave de assinatura. É stateless por natureza: em vez de mover o estado pra fora, elimina a necessidade de guardá-lo no servidor.\n\nA regra prática pra testar isso: se você desligar uma réplica agora e ninguém perceber, a aplicação é stateless de verdade."
                    },
                    {
                        "type": "quote",
                        "value": "Se uma réplica pode sumir agora sem ninguém perceber, a aplicação é stateless de verdade. Estado que mora na memória do processo é estado que vai sumir."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que uma aplicação é stateless?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ela não guarda estado da requisição na memória local do processo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela não usa banco de dados em nenhuma parte do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela roda sempre numa réplica única, sem load balancer na frente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela não aceita requisições autenticadas de nenhum tipo de usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que guardar a sessão do usuário numa variável em memória quebra com várias réplicas atrás de um load balancer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A réplica seguinte que atender o usuário não tem acesso àquela memória.",
                                "isCorrect": true
                            },
                            {
                                "text": "O load balancer bloqueia qualquer requisição vinda de um usuário logado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres rejeita conexões de réplicas que usam sessão em memória.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis apaga de forma automática qualquer sessão criada fora dele.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A aplicação salva os arquivos enviados pelos usuários direto no disco do container onde a réplica está rodando. Qual problema isso cria ao escalar horizontalmente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O arquivo só fica acessível através da réplica que recebeu o upload.",
                                "isCorrect": true
                            },
                            {
                                "text": "O disco local fica automaticamente sincronizado entre todas as réplicas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O load balancer passa a exigir sticky session pra qualquer requisição.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres perde a referência ao caminho salvo na coluna da tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação usa JWT pra autenticação, sem sessão guardada em nenhum lugar no servidor. Por que ela já nasce stateless nesse aspecto?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O token carrega os dados assinados, e qualquer réplica valida sozinha.",
                                "isCorrect": true
                            },
                            {
                                "text": "O JWT obriga todas as réplicas a compartilhar a mesma memória local.",
                                "isCorrect": false
                            },
                            {
                                "text": "O JWT substitui o Redis como banco principal da aplicação inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "O JWT impede qualquer réplica de consultar o Postgres depois do login.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação stateless usa sessão no Redis em vez de memória local. Qual cenário confirma, na prática, que o objetivo foi alcançado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Derrubar qualquer réplica não faz nenhum usuário logado perder a sessão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas a réplica que criou a sessão consegue validar o usuário depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis precisa reiniciar sempre que uma réplica nova é adicionada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada réplica mantém uma cópia própria da sessão, sincronizada por hora.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Sticky session x stateless",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A gambiarra que resolve na hora\n\nExiste um jeito de fazer sessão em memória funcionar mesmo com várias réplicas: configurar o load balancer pra sempre mandar o mesmo cliente pra mesma réplica. Isso se chama **sticky session** (ou session affinity). Na prática, o load balancer olha um cookie ou o IP de origem e usa isso pra decidir, sempre, o mesmo destino.\n\nFunciona. Só que resolve o sintoma e empurra o problema real pra frente."
                    },
                    {
                        "type": "code",
                        "value": "# Round-robin (aula anterior): qualquer réplica atende qualquer requisição\nupstream app_servers {\n    server app1:3000;\n    server app2:3000;\n    server app3:3000;\n}\n\n# Sticky por IP: o mesmo cliente sempre cai na mesma réplica\nupstream app_servers_sticky {\n    ip_hash;\n    server app1:3000;\n    server app2:3000;\n    server app3:3000;\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Por que sticky session atrapalha\n\n- **Distribuição desigual**: com o tempo, algumas réplicas acumulam mais clientes fixos que outras, e o balanceamento deixa de ser balanceado.\n- **Perda de estado em falha**: se a réplica trava ou é reiniciada num deploy, todo mundo preso nela perde sessão, carrinho, o que estiver guardado ali.\n- **Deploy mais arriscado**: tirar uma réplica de circulação, pra atualizar ou pra escalar pra baixo, expulsa à força quem estava grudado nela.\n- **Escalar fica mais difícil**: uma réplica nova não ajuda quem já está preso nas antigas, o balanceamento novo só vale pra conexões futuras."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Critério\", \"Sticky session\", \"App stateless\"], [\"Onde fica o estado\", \"Preso na memória de uma réplica\", \"Fora da réplica, num serviço como o Redis\"], [\"Réplica cai ou reinicia\", \"Quem estava presa nela perde o estado\", \"Ninguém percebe, qualquer réplica assume\"], [\"Distribuição de carga\", \"Desigual, alguns pegam mais clientes fixos\", \"Uniforme, qualquer réplica serve qualquer um\"], [\"Deploy e escala\", \"Remover uma réplica expulsa quem estava nela\", \"Trocar ou escalar réplica não afeta ninguém\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Uma exceção honesta\n\nConexões de longa duração, como WebSocket, realmente precisam ficar presas à réplica que abriu a conexão, porque a conexão em si é um estado de rede que não dá pra transferir entre réplicas no meio do caminho. Isso é diferente de guardar o estado da aplicação (sessão, cache, contador) em memória. Mesmo com uma conexão WebSocket presa a uma réplica, os dados que ela usa deveriam continuar vindo de fora (Redis, banco), pra réplica poder cair sem levar informação nenhuma junto."
                    },
                    {
                        "type": "quote",
                        "value": "Sticky session resolve o sintoma na hora e cobra a fatura depois, em réplica sobrecarregada e deploy mais arriscado. O estado nunca deveria ter ficado preso ali."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é sticky session?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O load balancer sempre manda o mesmo cliente pra mesma réplica.",
                                "isCorrect": true
                            },
                            {
                                "text": "O banco de dados grava a sessão em disco de forma permanente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A aplicação recusa qualquer requisição sem sessão ativa configurada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O load balancer distribui cada requisição pra uma réplica aleatória.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o principal risco de depender de sticky session em vez de tornar a aplicação stateless?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Perder a réplica derruba a sessão de todo mundo preso nela.",
                                "isCorrect": true
                            },
                            {
                                "text": "O load balancer para de funcionar com a segunda réplica ativa.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres passa a rejeitar conexões vindas de réplicas diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis vira obrigatório mesmo sem nenhuma sessão sendo usada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time percebe que uma das réplicas está recebendo bem mais tráfego que as outras, mesmo com o load balancer configurado. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O balanceador está configurado com sticky session, prendendo clientes fixos.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Postgres está distribuindo consultas de forma desigual entre réplicas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis está replicando cache só pra uma réplica específica.",
                                "isCorrect": false
                            },
                            {
                                "text": "O CI/CD publicou a aplicação em apenas uma réplica por engano.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação usa WebSocket pra atualizações em tempo real e mantém a conexão presa à réplica que a abriu. Isso contradiz a ideia de aplicação stateless?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não, a conexão fica presa por necessidade de rede, os dados vêm de fora.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, qualquer conexão presa a uma réplica torna a aplicação inteira stateful.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, WebSocket elimina de vez a necessidade de qualquer load balancer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, WebSocket exige que a sessão volte a ser guardada em memória.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Comparando as duas abordagens, o que diferencia sticky session de uma aplicação verdadeiramente stateless na hora de escalar pra cima?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Na sticky session, a réplica nova só recebe clientes novos, o resto segue igual.",
                                "isCorrect": true
                            },
                            {
                                "text": "Réplicas novas numa aplicação stateless nunca conseguem se conectar ao Redis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Réplicas novas na sticky session assumem automaticamente a sessão das antigas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Réplicas novas numa aplicação stateless exigem sticky session pra funcionar.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O banco como gargalo e quando o monólito dói",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Réplicas em paralelo, banco sozinho\n\nSuponha que a aplicação já esteja stateless, rodando em quatro réplicas atrás de um load balancer, tudo redondo. Tem um detalhe que escalar a aplicação sozinho não resolve: todas as quatro réplicas continuam falando com o **mesmo** Postgres. Multiplicar a aplicação multiplica a capacidade de processar requisição, não a capacidade do banco de aguentar consulta.\n\nEsse é o gancho pro próximo módulo desta trilha, inteiro sobre banco de dados em escala. Por enquanto, vale entender por que ele vira gargalo primeiro."
                    },
                    {
                        "type": "code",
                        "value": "4 réplicas x pool de 20 conexões cada = 80 conexões simultâneas\n\nPostgres, configuração padrão:\nmax_connections = 100\n\nAntes de qualquer pico de tráfego, o pool das réplicas sozinho\njá reserva 80% do limite de conexões do banco. Escalar de 4\npra 8 réplicas, sem mexer em mais nada, estoura esse limite."
                    },
                    {
                        "type": "text",
                        "value": "## Os sinais de que o banco já dói\n\n- Consultas que eram rápidas começam a demorar quando o tráfego sobe, mesmo sem o código ter mudado.\n- Erros de conexão esgotada aparecem nos logs, o limite de conexões do banco batendo.\n- Uma consulta N+1 que passava despercebida com pouco tráfego (aquela da trilha de banco de dados) vira um problema visível assim que várias réplicas disparam a mesma sequência repetida ao mesmo tempo.\n- Um índice que faltava, tolerável com poucos usuários, começa a custar caro em cada leitura."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinal\", \"Onde aparece\", \"Aponta pra\"], [\"Consultas lentas sob carga\", \"Tempo de resposta sobe quando o tráfego cresce\", \"Índices, N+1, cache na frente do banco\"], [\"Conexões esgotando\", \"Erro de limite de conexões nos logs do banco\", \"Connection pooling e réplicas de leitura\"], [\"Build e deploy demorados\", \"Pipeline de CI/CD cada vez mais lento\", \"Organização interna, monólito modular\"], [\"Times pisando no mesmo código\", \"Conflito de merge, deploys esperando a vez\", \"Fronteiras mais claras entre os módulos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando o monólito em si começa a doer\n\nAlém do banco, o código do monólito também manda sinais:\n\n- **Build e deploy cada vez mais lentos**: o pipeline de CI/CD que era rápido no começo cresce junto com o código, e o tempo entre terminar e estar no ar incomoda.\n- **Times pisando um no outro**: duas equipes mexendo no mesmo repositório, disputando os mesmos arquivos, esperando a vez de mergear e de deployar.\n- **Deploy tudo ou nada**: corrigir um bug pequeno numa parte do sistema obriga a subir a aplicação inteira de novo, mesmo que o resto não tenha mudado nada."
                    },
                    {
                        "type": "text",
                        "value": "## Ainda não é hora de microsserviços\n\nÉ tentador ouvir esses sinais e concluir que a resposta é quebrar tudo em serviços separados. Vale segurar essa ideia: boa parte dessa dor se resolve dentro do próprio monólito, com índice, connection pooling, cache na frente do banco (aquele Redis de novo) e uma organização interna mais clara entre os módulos (o monólito modular da primeira aula). Esta trilha ainda vai passar por banco de dados em escala e por mensageria antes de chegar em quando, e se, vale a pena partir pra serviços separados. Cada dor tem um remédio numa ordem, e o primeiro quase nunca é reescrever tudo."
                    },
                    {
                        "type": "quote",
                        "value": "Réplica de aplicação é barata de multiplicar. Banco de dados não. Quando todo mundo bate na mesma instância, o próximo gargalo já tem endereço certo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que o banco de dados costuma virar gargalo mesmo depois de escalar a aplicação horizontalmente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Todas as réplicas continuam se conectando à mesma instância de banco.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada réplica nova cria automaticamente uma cópia própria do banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "O load balancer impede que réplicas diferentes acessem o banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco de dados perde dados sempre que uma réplica é criada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe aumenta o número de réplicas da aplicação e passa a ver erros de conexão esgotada no banco. Qual é a explicação mais direta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A soma das conexões de todas as réplicas passou do limite do banco.",
                                "isCorrect": true
                            },
                            {
                                "text": "O load balancer parou de encaminhar requisições pra novas réplicas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis está recusando conexões vindas das réplicas mais recentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O CI/CD publicou uma versão antiga da aplicação nas réplicas novas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de meses, o time percebe que o pipeline de CI/CD demora cada vez mais e que duas equipes vivem esbarrando nos mesmos arquivos. O que esses sinais indicam?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O próprio monólito começou a doer, não só o banco de dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "O load balancer está mal configurado e precisa de mais réplicas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis está guardando cache antigo e corrompendo os deploys.",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco de dados atingiu o limite físico de armazenamento em disco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Diante dos sinais de dor do monólito (build lento, times esbarrando, deploy tudo ou nada), qual é a atitude mais honesta pra próxima decisão de arquitetura?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Investigar melhorias dentro do próprio monólito antes de partir pra serviços.",
                                "isCorrect": true
                            },
                            {
                                "text": "Migrar imediatamente pra microsserviços, já que eles resolvem esse tipo de dor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de réplicas até os sinais de dor pararem de aparecer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o banco de dados por um mais rápido antes de qualquer outra mudança.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta que buscava um registro por vez dentro de um laço (o problema N+1) passava despercebida com pouco tráfego. Por que ela vira crítica quando o monólito escala pra várias réplicas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Cada réplica dispara a mesma sequência de consultas, multiplicando a carga.",
                                "isCorrect": true
                            },
                            {
                                "text": "O load balancer transforma o N+1 automaticamente numa única consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "As réplicas passam a compartilhar entre si o resultado de cada consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis reescreve a consulta N+1 antes dela chegar ao banco de dados.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Banco de dados em escala",
        "aulas": [
            {
                "titulo": "Por que o banco é o primeiro gargalo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que o banco é o primeiro gargalo\n\nVocê já resolveu a parte da escala que dá pra resolver copiando: a aplicação roda em várias réplicas stateless atrás de um load balancer, e a sessão que antes vivia na memória de um único processo foi pro Redis, aquela solução que apareceu na trilha de autenticação e voltou na trilha de cache. Isso multiplica a capacidade de responder requisições HTTP. Só que sobra uma peça que não se multiplicou junto: o banco de dados. É nele que a escala costuma bater de frente pela primeira vez."
                    },
                    {
                        "type": "text",
                        "value": "## Um recurso compartilhado, não copiado\n\nCada réplica da aplicação é intercambiável: não guarda estado, então subir uma quinta ou uma décima réplica é só mais uma cópia idêntica atrás do load balancer. O banco é o oposto disso. Ele guarda o estado real do sistema, os dados que não podem divergir entre uma cópia e outra, então não dá pra simplesmente ligar mais uma instância sem pensar em como ela vai se manter igual às demais. Enquanto essa decisão não é tomada de propósito (assunto das próximas aulas), toda réplica da aplicação, sejam quatro ou quarenta, conversa com a mesma instância única de banco."
                    },
                    {
                        "type": "code",
                        "value": "clientes\n    |\n    v\n[ load balancer ]\n  |     |     |     |\n  v     v     v     v\napp-1  app-2  app-3  app-4   (stateless: qualquer uma responde qualquer requisicao)\n  |     |     |     |\n  +-----+-----+-----+\n        |\n        v\n[    PostgreSQL    ]  (uma instancia so: recebe leitura e escrita de todo mundo)"
                    },
                    {
                        "type": "text",
                        "value": "## Leitura e escrita competem pelo mesmo recurso\n\nToda consulta, seja um SELECT de leitura ou um INSERT, UPDATE ou DELETE de escrita, disputa os mesmos recursos físicos dentro do banco: CPU, memória usada pra manter páginas de dados em cache, disco pra gravar o WAL (o log de escrita à prova de falhas) e até locks em linhas específicas. Uma consulta de relatório pesada, rodando por alguns segundos, pode atrasar escritas simples que levariam poucos milissegundos. Com várias réplicas da aplicação mandando tráfego ao mesmo tempo, essa disputa fica mais intensa, não porque o banco piorou, mas porque agora chega muito mais gente pedindo a vez."
                    },
                    {
                        "type": "text",
                        "value": "## Conexões também são um recurso finito\n\nVocê já viu, na trilha de banco de dados, que abrir uma conexão nova a cada requisição é caro e que o Pool resolve isso reaproveitando conexões abertas. O que muda em escala é que agora existem várias réplicas da aplicação, cada uma com seu próprio pool, e o Postgres tem um teto de conexões simultâneas que aceita (algo perto de 100 numa instância padrão, antes de qualquer ajuste). Some o `max` de cada pool de cada réplica, e o resultado pode se aproximar perigosamente desse teto. Voltamos a esse número com calma na aula 3."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\",\"Ao escalar horizontalmente\",\"O que isso exige\"],[\"Aplicação (stateless)\",\"Cada réplica nova é uma cópia idêntica, sem coordenação especial\",\"Nada além de tirar o estado de dentro do processo\"],[\"Banco de dados (stateful)\",\"Continua sendo uma instância só, a menos que você decida replicar ou particionar\",\"Uma escolha deliberada: réplica de leitura, pool bem dimensionado, cache ou sharding\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O load balancer resolveu multiplicar a aplicação. O banco continua sendo um só até alguém decidir, de propósito, replicá-lo, protegê-lo com um pool bem pensado ou dividi-lo. Esse é o trabalho das próximas quatro aulas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Depois de colocar a aplicação atrás de um load balancer com várias réplicas stateless, qual peça da arquitetura normalmente continua sendo uma instância só?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O banco de dados, que guarda o estado real dos dados",
                                "isCorrect": true
                            },
                            {
                                "text": "O load balancer, que também precisa de várias cópias",
                                "isCorrect": false
                            },
                            {
                                "text": "A sessão do usuário, replicada em cada réplica da app",
                                "isCorrect": false
                            },
                            {
                                "text": "O código da aplicação, que muda entre cada réplica",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API com 6 réplicas atrás de um load balancer aponta todas para o mesmo Postgres. Sob pico de tráfego, a CPU do banco satura mesmo com a aplicação respondendo rápido às requisições. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Leitura e escrita de todas as réplicas sobrecarregam o único banco",
                                "isCorrect": true
                            },
                            {
                                "text": "O load balancer está distribuindo as requisições de forma desigual",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltam mais réplicas da aplicação pra aliviar a carga sobre o banco",
                                "isCorrect": false
                            },
                            {
                                "text": "A ausência de HTTPS entre o load balancer e as réplicas pesa na CPU",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Seis réplicas da aplicação, cada uma com um pool configurado para até 20 conexões, atendem tráfego normal sem problema. Em um pico, o Postgres começa a recusar conexões novas. Qual é a causa mais direta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A soma das conexões de todas as réplicas passou do limite do banco",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma das réplicas da aplicação parou e sobrecarregou as demais",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres reduz o próprio limite de conexões durante um pico",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta um índice na tabela mais consultada nesse horário de pico",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de identificar o banco como gargalo, a equipe cogita resolver aumentando ainda mais o número de réplicas da aplicação, sem mexer em nada do lado do banco. Por que essa ideia sozinha não resolve o problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Mais réplicas geram mais conexões e mais consultas no mesmo banco único",
                                "isCorrect": true
                            },
                            {
                                "text": "Mais réplicas da aplicação tornam cada requisição HTTP individual mais lenta",
                                "isCorrect": false
                            },
                            {
                                "text": "O load balancer já tem um limite fixo de réplicas, atingido há algum tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Mais réplicas da aplicação reduzem sozinhas o max_connections do banco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que multiplicar réplicas da camada de aplicação stateless é mais simples do que multiplicar o banco de dados?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Réplicas da aplicação são intercambiáveis; o banco guarda o estado real dos dados",
                                "isCorrect": true
                            },
                            {
                                "text": "O banco de dados não pode, em hipótese alguma, rodar dentro de um contêiner",
                                "isCorrect": false
                            },
                            {
                                "text": "A aplicação sempre consome menos memória do que o banco, em qualquer caso",
                                "isCorrect": false
                            },
                            {
                                "text": "O load balancer não sabe distribuir tráfego diretamente para bancos de dados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Réplicas de leitura e consistência eventual",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Réplicas de leitura e consistência eventual\n\nA aula anterior deixou um problema em aberto: enquanto a aplicação multiplica réplicas sem esforço, o banco continua sendo uma instância só, recebendo leitura e escrita de todo mundo ao mesmo tempo. A primeira alavanca clássica pra aliviar isso é separar os dois papéis: uma instância cuida da escrita, outra ou outras cuidam só da leitura."
                    },
                    {
                        "type": "text",
                        "value": "## Uma primária para escrita, réplicas para leitura\n\nNesse arranjo existe uma instância primária, a única que aceita INSERT, UPDATE e DELETE, e uma ou mais réplicas, que recebem uma cópia contínua de tudo que muda na primária (no Postgres, esse mecanismo se chama replicação por streaming) e respondem só consultas de leitura, os SELECT. A primária manda as mudanças; a réplica aplica essas mudanças na própria cópia dos dados assim que consegue."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Primária\",\"Réplica de leitura\"],[\"Aceita escrita (INSERT, UPDATE, DELETE)\",\"Sim\",\"Não\"],[\"Aceita leitura (SELECT)\",\"Sim\",\"Sim\"],[\"Atraso em relação à escrita mais recente\",\"Nenhum\",\"Pode existir, geralmente pequeno\"],[\"Se ela cair\",\"O sistema para de aceitar escrita\",\"As demais réplicas seguem servindo leitura\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Direcionando o tráfego: quem lê de onde\n\nEssa separação só funciona se a aplicação souber, pra cada consulta, se ela precisa ir na primária ou pode ir numa réplica. Isso normalmente vira uma escolha explícita no código: rotas de escrita (criar pedido, atualizar cadastro) usam uma conexão apontada pra primária, e rotas de leitura que toleram um pequeno atraso (listar produtos, exibir um relatório) usam uma conexão apontada pra uma réplica. Algumas equipes fazem esse roteamento num proxy dedicado na frente do banco, mas a ideia por trás é a mesma."
                    },
                    {
                        "type": "code",
                        "value": "const poolEscrita = new Pool({\n  host: process.env.DB_PRIMARIA_HOST,\n  max: 10,\n});\n\nconst poolLeitura = new Pool({\n  host: process.env.DB_REPLICA_HOST,\n  max: 20,\n});\n\nasync function criarPedido(dados) {\n  return poolEscrita.query(\n    'INSERT INTO pedidos (cliente_id, total) VALUES ($1, $2) RETURNING *',\n    [dados.clienteId, dados.total],\n  );\n}\n\nasync function listarPedidos() {\n  // leitura tolera um pequeno atraso, entao vai para a replica\n  return poolLeitura.query('SELECT * FROM pedidos ORDER BY criado_em DESC LIMIT 50');\n}\n\n// cuidado: logo apos criarPedido, uma chamada a listarPedidos\n// pode nao trazer o pedido recem criado ainda, por causa do lag de replicacao"
                    },
                    {
                        "type": "text",
                        "value": "## Consistência eventual: a réplica pode estar um passo atrás\n\nA cópia na réplica não chega instantaneamente: existe um pequeno intervalo entre o momento em que a primária grava e o momento em que a réplica aplica essa mesma mudança, chamado de lag de replicação. Na maior parte do tempo esse atraso é de milissegundos e passa despercebido, mas ele pode crescer sob escrita pesada ou problema de rede. É isso que se chama consistência eventual: a réplica vai chegar no mesmo estado da primária, só que não necessariamente agora."
                    },
                    {
                        "type": "quote",
                        "value": "Réplica de leitura não é uma cópia perfeita em tempo real, é uma cópia levemente atrasada que troca frescor por fôlego. Saber quando esse atraso importa é a parte que exige julgamento, não decoreba."
                    }
                ],
                "questions": [
                    {
                        "statement": "Numa arquitetura com uma primária e réplicas de leitura, para onde vai uma operação de UPDATE?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Sempre para a primária, a única que aceita escrita",
                                "isCorrect": true
                            },
                            {
                                "text": "Sempre para a réplica mais próxima de quem chamou",
                                "isCorrect": false
                            },
                            {
                                "text": "Para qualquer réplica escolhida pelo load balancer",
                                "isCorrect": false
                            },
                            {
                                "text": "Para as duas, primária e réplica, ao mesmo tempo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário cadastra um produto e é redirecionado direto pra lista de produtos, que lê de uma réplica. Às vezes o produto recém-criado não aparece nessa lista logo em seguida. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A réplica ainda não recebeu a mudança feita na primária",
                                "isCorrect": true
                            },
                            {
                                "text": "O produto foi salvo pela primária com um identificador inválido",
                                "isCorrect": false
                            },
                            {
                                "text": "A réplica descarta por padrão qualquer escrita feita há pouco tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "O load balancer perdeu a requisição de cadastro do produto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe considera enviar tanto leituras quanto escritas para as réplicas, pra aproveitar melhor a capacidade extra que elas têm. Por que essa ideia não funciona como pensado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Réplica de leitura normalmente rejeita qualquer INSERT, UPDATE ou DELETE",
                                "isCorrect": true
                            },
                            {
                                "text": "A réplica aceita escrita, mas só replica de volta depois de um dia inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres bloqueia leitura na réplica assim que uma escrita é enviada",
                                "isCorrect": false
                            },
                            {
                                "text": "A escrita na réplica funciona, porém nunca chega até a instância primária",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um painel interno de métricas, atualizado a cada minuto, e uma tela de confirmação de pagamento, que precisa refletir o estado mais recente na hora. Qual das duas é mais segura de ler numa réplica em vez da primária?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O painel de métricas, porque tolera um pequeno atraso nos dados",
                                "isCorrect": true
                            },
                            {
                                "text": "A confirmação de pagamento, porque réplicas respondem sempre mais rápido",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas, porque réplica e primária sempre mostram os mesmos dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma das duas, já que réplica não deveria servir a aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação direciona toda leitura pra réplica, inclusive a tela que confirma um cadastro logo depois de salvá-lo. Qual ajuste reduz o risco de o usuário não ver o próprio cadastro nesse instante?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ler esse dado específico direto da primária, logo após a escrita",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o número de réplicas até o lag de replicação zerar",
                                "isCorrect": false
                            },
                            {
                                "text": "Desligar a replicação assíncrona durante o horário de pico",
                                "isCorrect": false
                            },
                            {
                                "text": "Diminuir o TTL do cache da aplicação para compensar o lag",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Connection pooling",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Connection pooling\n\nA trilha de banco de dados já te apresentou o Pool do pg: em vez de abrir e fechar uma conexão a cada requisição, a aplicação mantém um conjunto de conexões já abertas e reaproveitadas. Isso resolveu o problema numa instância só. Agora a aplicação roda em várias réplicas, e o banco pode ter primária e réplica de leitura ao mesmo tempo: pooling deixa de ser só uma boa prática e vira uma peça que decide se o banco aguenta o tráfego real."
                    },
                    {
                        "type": "text",
                        "value": "## Por que o pool protege o banco\n\nCada conexão aberta com o Postgres custa memória e recursos do lado do banco, mesmo parada, esperando a próxima query. Sem pool, cada requisição HTTP abriria e fecharia sua própria conexão, e o número de conexões simultâneas cresceria junto com o tráfego, sem limite nenhum, até estourar o teto que o banco aceita. O pool acha um meio-termo: reaproveita um número fixo de conexões, então o banco lida com uma carga previsível, não com um pico sem controle."
                    },
                    {
                        "type": "text",
                        "value": "## Dimensionando o pool: nem grande demais, nem pequeno demais\n\nUm pool pequeno demais faz requisições esperarem na fila por uma conexão livre, mesmo que o banco em si esteja com folga de sobra, o que aparece como lentidão sem motivo aparente. Um pool grande demais, multiplicado pelo número de réplicas da aplicação, pode somar mais conexões do que o banco aceita, e aí quem sofre é todo mundo, não só a réplica que exagerou. O número certo depende do tráfego real e do teto do banco, não de um valor copiado de outro projeto."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sintoma\",\"Causa provável\",\"Ajuste\"],[\"Requisições esperando, banco com CPU tranquila\",\"max do pool baixo demais para o tráfego atual\",\"Aumentar o max, respeitando o teto do banco\"],[\"Erro de limite de conexões estourado no Postgres\",\"Soma dos pools de todas as réplicas passa do teto\",\"Reduzir o max por réplica ou usar um pooler externo\"],[\"Conexão que nunca volta pro pool\",\"Código que não trata erro e prende a conexão\",\"Garantir que toda query devolve a conexão\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Pooling por fora da aplicação\n\nQuando o número de réplicas cresce muito, ou a aplicação roda em ambientes que criam e destroem instâncias com frequência, coordenar um pool interno em cada uma pode virar complicado. Uma alternativa real é colocar um pooler externo, como o PgBouncer, entre a aplicação e o Postgres: ele mantém um conjunto menor de conexões reais com o banco e distribui entre muito mais conexões vindas da aplicação. É honestamente mais um componente pra manter no ar, então não é algo pra adicionar por padrão, só quando o pooling da aplicação sozinho já não é suficiente."
                    },
                    {
                        "type": "quote",
                        "value": "O pool não faz o banco aguentar mais tráfego: ele impede que a própria aplicação vire a causa do esgotamento. Dimensionado errado, de qualquer um dos dois lados, ele deixa de proteger e vira o novo gargalo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a função principal de um connection pool entre a aplicação e o banco de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reaproveitar conexões já abertas em vez de abrir uma nova a cada requisição",
                                "isCorrect": true
                            },
                            {
                                "text": "Guardar em cache o resultado das consultas repetidas com mais frequência",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar automaticamente um índice para cada coluna usada num filtro",
                                "isCorrect": false
                            },
                            {
                                "text": "Dividir uma consulta grande em partes menores executadas em paralelo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota está lenta e os logs mostram requisições esperando bastante tempo por uma conexão livre, mesmo com o banco de dados com baixo uso de CPU. O que isso sugere?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O max do pool está baixo demais para o tráfego atual da rota",
                                "isCorrect": true
                            },
                            {
                                "text": "Falta um índice na tabela consultada com mais frequência pela rota",
                                "isCorrect": false
                            },
                            {
                                "text": "A réplica de leitura usada por essa rota está com lag maior",
                                "isCorrect": false
                            },
                            {
                                "text": "O load balancer está enviando tráfego demais para uma réplica",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A aplicação roda em 8 réplicas, cada uma com pool configurado para até 15 conexões, e o Postgres aceita até 100 conexões simultâneas. Qual é o risco direto dessa configuração?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Em pico, as réplicas somadas podem pedir mais conexões do que o banco aceita",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum risco, já que cada pool é isolado e não conta para o teto do banco",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres divide automaticamente seu teto entre as réplicas da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco existe só para a réplica de leitura, nunca para a primária",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe cogita colocar um PgBouncer entre a aplicação e o Postgres, já que a aplicação tem muitas réplicas e cada uma mantém seu próprio pool. O que essa decisão traz, de forma honesta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Menos conexões reais no banco, mais um componente novo pra manter",
                                "isCorrect": true
                            },
                            {
                                "text": "Conexões ilimitadas com o banco, sem nenhum novo ponto de falha",
                                "isCorrect": false
                            },
                            {
                                "text": "A eliminação total da necessidade de configurar pool na aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "A substituição completa das réplicas de leitura, sem precisar delas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de perceber que o pool esgota com frequência, a equipe pensa em resolver só aumentando o max do pool em cada réplica da aplicação, sem mexer em mais nada. Por que isso pode piorar a situação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A soma pode passar do teto de conexões do banco e sobrecarregar mais ainda",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o max de um pool exige reiniciar o Postgres inteiro depois",
                                "isCorrect": false
                            },
                            {
                                "text": "O driver pg limita qualquer pool a no máximo 10 conexões simultâneas",
                                "isCorrect": false
                            },
                            {
                                "text": "Um pool maior ativa automaticamente novas réplicas de leitura no banco",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Índices e o problema N+1 sob carga",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Índices e o problema N+1 sob carga\n\nPool bem dimensionado garante que a aplicação não vira a causa do esgotamento de conexão. Mas uma conexão presa numa query lenta, multiplicada por muitas queries desnecessárias, esgota o pool de qualquer jeito. Esta aula retoma dois vilões clássicos da trilha de banco de dados (índice ausente e o problema N+1) e mostra por que os dois ficam bem mais graves quando a carga é real, não os poucos registros de um ambiente de teste."
                    },
                    {
                        "type": "text",
                        "value": "## Recapitulando: o que um índice muda\n\nSem índice numa coluna usada no WHERE ou no JOIN, o Postgres varre a tabela inteira, linha por linha (sequential scan), procurando o que bate com a condição. Com um índice na coluna certa, ele pula direto pras linhas que interessam (index scan). Numa tabela de algumas centenas de linhas isso quase não se nota; numa tabela de milhões, é a diferença entre uma resposta instantânea e uma consulta que trava a rota inteira."
                    },
                    {
                        "type": "code",
                        "value": "EXPLAIN SELECT * FROM pedidos WHERE cliente_id = 42;\n\n--  Seq Scan on pedidos  (cost=0.00..18455.00 rows=140 width=72)\n--    Filter: (cliente_id = 42)\n\nCREATE INDEX idx_pedidos_cliente_id ON pedidos(cliente_id);\n\nEXPLAIN SELECT * FROM pedidos WHERE cliente_id = 42;\n\n--  Index Scan using idx_pedidos_cliente_id on pedidos  (cost=0.42..312.10 rows=140 width=72)\n--    Index Cond: (cliente_id = 42)"
                    },
                    {
                        "type": "text",
                        "value": "## Recapitulando: o problema N+1\n\nN+1 é buscar uma lista (uma query) e, dentro de um laço, buscar informação relacionada a cada item dessa lista, uma query por item. Com 10 pedidos numa tela de teste, isso é 11 idas ao banco, imperceptível. Sob carga real, com milhares de pedidos e várias réplicas da aplicação atendendo tráfego ao mesmo tempo, o mesmo padrão vira milhares de queries por segundo batendo no mesmo banco, cada uma segurando uma conexão do pool pelo tempo que dura, ainda que curto."
                    },
                    {
                        "type": "code",
                        "value": "// N+1: uma query de itens por pedido, dentro do laco\nasync function listarPedidosComItensRuim() {\n  const { rows: pedidos } = await poolLeitura.query(\n    'SELECT id, cliente_id, criado_em FROM pedidos ORDER BY criado_em DESC LIMIT 50',\n  );\n  for (const pedido of pedidos) {\n    const { rows: itens } = await poolLeitura.query(\n      'SELECT * FROM itens WHERE pedido_id = $1',\n      [pedido.id],\n    );\n    pedido.itens = itens;\n  }\n  return pedidos; // 51 idas ao banco para 50 pedidos\n}\n\n// uma query so, trazendo os itens de todos os pedidos de uma vez\nasync function listarPedidosComItens() {\n  const { rows: pedidos } = await poolLeitura.query(\n    'SELECT id, cliente_id, criado_em FROM pedidos ORDER BY criado_em DESC LIMIT 50',\n  );\n  const ids = pedidos.map((pedido) => pedido.id);\n  const { rows: itens } = await poolLeitura.query(\n    'SELECT * FROM itens WHERE pedido_id = ANY($1)',\n    [ids],\n  );\n  const itensPorPedido = new Map();\n  for (const item of itens) {\n    const lista = itensPorPedido.get(item.pedido_id) || [];\n    lista.push(item);\n    itensPorPedido.set(item.pedido_id, lista);\n  }\n  for (const pedido of pedidos) pedido.itens = itensPorPedido.get(pedido.id) || [];\n  return pedidos; // 2 idas ao banco, nao importa quantos pedidos existam\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Por que N+1 dói mais em escala\n\nN+1 não é só lento, ele compete diretamente com tudo que as aulas anteriores tentaram proteger: cada query extra do laço ocupa uma conexão do pool pelo tempo da consulta, e multiplicada por várias réplicas da aplicação recebendo tráfego ao mesmo tempo, o mesmo padrão que passava despercebido em desenvolvimento vira o motivo do pool esgotar e do banco saturar de conexão. Corrigir o N+1 costuma aliviar o gargalo de conexão tanto quanto aumentar o pool, sem gastar recurso a mais nenhum."
                    },
                    {
                        "type": "quote",
                        "value": "Índice sem EXPLAIN é aposta; N+1 sem carga real é invisível. Os dois só aparecem de verdade quando alguém mede com dado e tráfego parecidos com produção, não quando alguém supõe."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o comando EXPLAIN mostra sobre uma consulta no Postgres?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O plano de execução escolhido, indicando se um índice foi usado",
                                "isCorrect": true
                            },
                            {
                                "text": "O tempo total que aquela consulta já rodou desde que foi criada",
                                "isCorrect": false
                            },
                            {
                                "text": "A lista completa de índices que existem no banco inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de conexões abertas no pool no momento da consulta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota que lista pedidos com seus itens faz uma query para os pedidos e mais uma query por pedido para buscar os itens, dentro de um laço. Com 10 pedidos de teste ela responde rápido; em produção, com milhares de pedidos e várias réplicas atendendo tráfego, ela fica lenta e o banco recusa conexão. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O padrão N+1 multiplica queries e conexões junto com pedidos e tráfego",
                                "isCorrect": true
                            },
                            {
                                "text": "Falta configurar uma réplica de leitura exclusiva só para essa rota",
                                "isCorrect": false
                            },
                            {
                                "text": "O índice da tabela de pedidos está corrompido e precisa ser recriado",
                                "isCorrect": false
                            },
                            {
                                "text": "O load balancer está enviando essa rota sempre para uma única réplica",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar EXPLAIN numa consulta lenta, o plano mostra Seq Scan numa tabela com milhões de linhas, filtrando por uma coluna sem índice. Qual é o próximo passo mais direto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar um índice na coluna e conferir com EXPLAIN se vira Index Scan",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o max do connection pool até o Seq Scan sumir do plano",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar essa consulta de SELECT para um INSERT equivalente a ela",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar só essa tabela para uma réplica de leitura dedicada a ela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas correções são propostas para o N+1 de uma listagem de pedidos com itens: (A) trazer os itens de todos os pedidos numa única query com WHERE pedido_id = ANY(lista), ou (B) manter uma query por pedido, mas disparar todas em paralelo. Por que A resolve o problema e B não?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A reduz o número de idas ao banco; B só paraleliza as mesmas idas",
                                "isCorrect": true
                            },
                            {
                                "text": "A é mais rápida só porque ANY ignora qualquer índice existente",
                                "isCorrect": false
                            },
                            {
                                "text": "B resolve igual a A, já que paralelizar e reduzir consultas dão no mesmo",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma resolve, o problema real está sempre na ausência de cache",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de logs recebe milhares de INSERT por minuto e é raramente consultada por colunas além da chave primária. Um dev sugere criar índice em todas as colunas para garantir performance. Por que essa ideia é arriscada nesse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Cada índice extra encarece toda escrita, e essa tabela escreve muito",
                                "isCorrect": true
                            },
                            {
                                "text": "Índice em tabela de log é bloqueado pelo Postgres por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar índice deixa qualquer tabela mais lenta também para leitura",
                                "isCorrect": false
                            },
                            {
                                "text": "Índice só funciona numa tabela que já tem réplica de leitura",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cache na frente, sharding e a noção de CAP",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Cache na frente, sharding e a noção de CAP\n\nRéplica divide leitura, pool contém conexão, índice acelera busca, corrigir N+1 evita trabalho à toa. Ainda sobra uma categoria de leitura que nem precisava chegar perto do banco de novo: a mesma consulta, repetida centenas de vezes, pedindo sempre a mesma resposta. É aí que entra o cache que você já conhece da trilha de cache, filas e performance, usado agora como a última camada de proteção antes do banco."
                    },
                    {
                        "type": "text",
                        "value": "## Cache na frente do banco: menos uma leitura repetida\n\nO padrão cache-aside que você viu com Redis resolve um problema diferente do que a réplica de leitura resolve. A réplica distribui entre várias instâncias as leituras que de fato chegam ao banco. O cache evita que boa parte dessas leituras chegue ao banco, ou à réplica, de novo: a aplicação pergunta ao cache primeiro, só busca no banco se for um miss, e guarda o resultado pra próxima chamada. As duas técnicas se somam, não competem."
                    },
                    {
                        "type": "code",
                        "value": "async function buscarProduto(id) {\n  const chave = `produto:${id}`;\n  const emCache = await redis.get(chave);\n  if (emCache) return JSON.parse(emCache);\n\n  const { rows } = await poolLeitura.query('SELECT * FROM produtos WHERE id = $1', [id]);\n  const produto = rows[0];\n  await redis.set(chave, JSON.stringify(produto), 'EX', 60); // TTL de 60s\n  return produto;\n}\n\n// na escrita, invalida em vez de esperar o TTL vencer sozinho\nasync function atualizarProduto(id, dados) {\n  await poolEscrita.query(\n    'UPDATE produtos SET nome = $1, preco = $2 WHERE id = $3',\n    [dados.nome, dados.preco, id],\n  );\n  await redis.del(`produto:${id}`);\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Uma noção honesta de particionamento horizontal\n\nRéplica, pool, índice e cache aliviam leitura, mas nenhuma delas ajuda quando o gargalo é a própria escrita, porque toda escrita ainda converge pra mesma primária. Quando isso acontece de verdade, a saída é o particionamento horizontal, também chamado de sharding: dividir os dados entre várias instâncias de banco, cada uma dona de uma fatia (por faixa de id, por região, por cliente), em vez de uma instância só dona de tudo. Isso é honesto: sharding resolve escrita em volume, mas cobra um preço real, consultas que cruzam dados de fatias diferentes ficam mais difíceis, e uma transação que mexe em duas fatias ao mesmo tempo deixa de ser simples. Não é algo pra adotar antes de esgotar réplica, pool, índice e cache."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Consistência forte\",\"Consistência eventual\"],[\"O que a leitura garante\",\"Sempre o dado mais recente já escrito\",\"Pode devolver um dado levemente atrasado\"],[\"Onde costuma aparecer\",\"Leitura direto na primária\",\"Leitura numa réplica ou vinda de um cache\"],[\"Custo de escolher essa opção\",\"Menos escala de leitura, mais coordenação\",\"Mais escala, ao preço de dado às vezes velho\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## CAP, sem formalismo: escolher entre consistência e disponibilidade\n\nO teorema CAP diz que um sistema distribuído, diante de uma falha de rede que separa suas partes (uma partição), não consegue garantir ao mesmo tempo consistência total e disponibilidade total: precisa escolher uma das duas enquanto a falha dura. Na prática, partição de rede vai acontecer mais cedo ou mais tarde em qualquer sistema com mais de uma máquina, então a escolha do dia a dia é entre responder rápido com um dado possivelmente atrasado, ou esperar até ter certeza do dado mais recente. Repare que essa escolha já apareceu antes nesta aula, sem o nome CAP: a réplica de leitura da aula 2 já é, na prática, uma aposta em disponibilidade e velocidade, aceitando consistência eventual em troca."
                    },
                    {
                        "type": "quote",
                        "value": "Cada técnica deste módulo ataca uma causa diferente do mesmo sintoma: réplica divide leitura, pool contém conexão, índice acelera busca, cache evita a viagem, sharding divide o próprio banco. Entender o que cada uma custa importa mais do que decorar a lista."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o papel do cache na frente do banco de dados, no contexto deste módulo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Evitar que leituras repetidas cheguem até o banco de novo",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir a réplica de leitura, tornando-a desnecessária",
                                "isCorrect": false
                            },
                            {
                                "text": "Garantir que toda escrita seja replicada de forma instantânea",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar automaticamente índices para as consultas mais frequentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Cache-aside e réplica de leitura atacam o mesmo problema, leitura pesada no banco, de formas diferentes. Qual é a principal diferença entre as duas táticas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cache evita tocar o banco; réplica distribui as leituras que ainda tocam",
                                "isCorrect": true
                            },
                            {
                                "text": "Réplica evita tocar o banco; cache distribui as leituras que ainda tocam",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas eliminam por completo a necessidade de índice nas tabelas",
                                "isCorrect": false
                            },
                            {
                                "text": "Cache resolve escrita pesada; réplica resolve leitura pesada no banco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de cache e réplicas de leitura, a escrita continua sendo o gargalo, porque toda escrita converge para a mesma primária. Qual técnica desta aula ataca diretamente esse limite de escrita?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Particionamento horizontal, dividindo os dados entre vários bancos",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o TTL do cache-aside para reduzir a frequência de escrita",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar mais réplicas de leitura conectadas à mesma primária",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o max do connection pool usado pela aplicação inteira",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante uma falha de rede que isola temporariamente uma réplica de leitura do resto do sistema, a aplicação escolhe continuar respondendo com o que a réplica tem, mesmo sabendo que pode estar um pouco atrasado. Que escolha essa decisão representa, na lógica do CAP?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Priorizar disponibilidade em vez da consistência mais recente",
                                "isCorrect": true
                            },
                            {
                                "text": "Priorizar consistência em vez de manter o sistema disponível agora",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminar a partição de rede, que é a causa real do problema todo",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma escolha real, porque o CAP só vale para bancos NoSQL",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma réplica de leitura que serve dados com alguns milissegundos de atraso, mesmo com a rede saudável e nenhuma falha acontecendo, já é uma manifestação prática de qual ideia?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A troca de consistência forte por disponibilidade e velocidade de leitura",
                                "isCorrect": true
                            },
                            {
                                "text": "A troca de disponibilidade por consistência forte, o oposto da réplica",
                                "isCorrect": false
                            },
                            {
                                "text": "A ausência total de qualquer trade-off, já que réplicas são idênticas",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma falha de configuração que precisa ser corrigida antes de produção",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Comunicação assíncrona e mensageria",
        "aulas": [
            {
                "titulo": "Síncrono x assíncrono: quem espera a resposta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 4 - Comunicação assíncrona e mensageria\n\nOs três módulos anteriores desta trilha mexeram na fundação: escalar o monólito, tirar carga do banco. Este módulo muda de assunto: como as partes do sistema conversam entre si, seja uma rota chamando outra, seja um serviço inteiro avisando outro que algo aconteceu. E tudo começa numa escolha que você já fez na prática, na trilha de Cache, Filas e Performance, talvez sem nomear: quem chama esse trabalho fica esperando a resposta, ou segue a vida?\n\n## Síncrono: ligar e esperar na linha\n\nUma ligação telefônica é síncrona: você liga, e enquanto a pessoa do outro lado não responde, você fica ali, esperando, sem fazer mais nada útil com aquela conversa. É o mesmo modelo de uma chamada HTTP clássica, request/response: o cliente manda a requisição e o processo que fez essa chamada fica bloqueado, esperando a resposta, antes de seguir em frente. Enquanto ela não chega, aquele fluxo está parado."
                    },
                    {
                        "type": "text",
                        "value": "## Assíncrono: mandar mensagem e seguir em frente\n\nMandar uma mensagem de texto é diferente: você escreve, envia, e segue com o que estava fazendo, sem ficar esperando a resposta aparecer. Quando ela chegar (se chegar), você trata dela naquele momento. É essa a lógica de uma chamada assíncrona: quem dispara o trabalho não espera o resultado ali, na hora. Ele segue em frente, e o resultado, se existir, chega depois, por outro caminho.\n\nVocê já fez isso: na trilha de Cache, Filas e Performance, a rota de cadastro colocava um job na fila com `emailQueue.add(...)` e respondia **202 Accepted** na hora, sem esperar o e-mail ser enviado de verdade. A rota não ficou bloqueada esperando o provedor de e-mail responder, ela entregou o trabalho para a fila e seguiu."
                    },
                    {
                        "type": "text",
                        "value": "## O mesmo princípio, agora entre serviços inteiros\n\nAté aqui, síncrono e assíncrono apareceram dentro de uma aplicação só: uma rota decidindo se espera ou não por um pedaço de trabalho. Mas o mesmo raciocínio vale quando são serviços inteiros conversando entre si. Se o serviço de pedidos chama o serviço de pagamento por HTTP e espera a resposta antes de continuar, essa é uma chamada síncrona entre serviços, com o mesmo efeito colateral: o serviço de pedidos fica refém do tempo (e da disponibilidade) do serviço de pagamento.\n\nEmpilhe chamadas síncronas numa cadeia (A chama B, que chama C, que chama D) e a latência sentida por A vira a soma de todo mundo, o mesmo encadeamento que o Módulo 1 desta trilha avisou para vigiar ao falar de latência. Cada serviço novo numa cadeia síncrona é mais um jeito de a resposta demorar, e mais um jeito de tudo falhar junto se um deles cair."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Síncrono (chamada direta)\", \"Assíncrono (mensagem/fila)\"], [\"Quem chama espera a resposta\", \"Sim, o fluxo fica bloqueado até ela voltar\", \"Não, segue em frente assim que entrega\"], [\"Acoplamento no tempo\", \"Alto: os dois lados precisam estar de pé ao mesmo tempo\", \"Baixo: quem recebe pode processar depois, mesmo se estava fora do ar\"], [\"Efeito de uma dependência lenta\", \"Atrasa quem chamou, na hora\", \"Fica isolado no tempo de processamento\"], [\"Quando o resultado é necessário\", \"Imediatamente, para decidir o próximo passo\", \"Depois, ou nem é necessário para quem chamou\"], [\"Exemplo típico\", \"Validar login antes de mostrar o painel\", \"Enviar e-mail de confirmação depois do cadastro\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// Cadeia sincrona: A espera B, que espera C. A latencia de A e a soma de todo mundo\nCliente -> [Servico A] --espera--> [Servico B] --espera--> [Servico C]\n           tempo total sentido pelo cliente = tempo(A) + tempo(B) + tempo(C)\n\n// Assincrono: A publica e responde na hora. B processa no seu proprio tempo\nCliente -> [Servico A] --publica evento, responde 202--> (cliente ja seguiu)\n                          |\n                          v\n                     [fila/broker] --consome quando der--> [Servico B]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando escolher cada um\n\nA pergunta certa não é qual dos dois é melhor (nenhum é, em geral), é: quem chama precisa do resultado para decidir o que fazer a seguir? Autenticar um usuário antes de mostrar o painel é síncrono por natureza, não faz sentido mostrar a tela e só descobrir depois se o login era válido. Já enviar um e-mail de confirmação, gerar um relatório ou processar uma imagem de upload não precisam bloquear ninguém: o cliente não decide o próximo passo com base no resultado imediato desse trabalho.\n\nUma pista prática: se a resposta HTTP da rota precisaria mentir ('deu tudo certo') mesmo sem saber ainda se o trabalho de fato terminou bem, esse trabalho provavelmente deveria estar numa fila, não dentro da requisição."
                    },
                    {
                        "type": "quote",
                        "value": "Síncrono e assíncrono não são bom e ruim: são dois jeitos de lidar com o tempo de espera. Síncrono empresta a espera para quem chamou; assíncrono guarda essa espera para depois, fora do caminho crítico da resposta."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza uma chamada síncrona entre dois serviços?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quem chama fica esperando a resposta antes de seguir em frente",
                                "isCorrect": true
                            },
                            {
                                "text": "Quem chama nunca recebe uma resposta do outro serviço",
                                "isCorrect": false
                            },
                            {
                                "text": "A mensagem fica guardada numa fila até alguém processar",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois serviços trocam dados sem nenhuma rede envolvida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota de checkout precisa confirmar, na hora, se o cartão do cliente foi aprovado antes de mostrar a tela de sucesso. Qual é o modelo de comunicação mais adequado para essa chamada ao gateway de pagamento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Síncrono, pois o próximo passo da rota depende desse resultado",
                                "isCorrect": true
                            },
                            {
                                "text": "Assíncrono, pois o gateway de pagamento é sempre lento",
                                "isCorrect": false
                            },
                            {
                                "text": "Assíncrono, pois toda chamada externa deveria usar uma fila",
                                "isCorrect": false
                            },
                            {
                                "text": "Síncrono, pois chamadas assíncronas não aceitam dados de cartão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O serviço de pedidos chama, de forma síncrona, o serviço de estoque, que por sua vez chama, também de forma síncrona, o serviço de precificação. Do ponto de vista de quem fez o pedido original, o que acontece com o tempo de resposta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele soma o tempo dos três serviços, um esperando o outro",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele reflete só o tempo do serviço de pedidos, isolado",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele cai pela metade, pois as chamadas rodam em paralelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele fica igual, porque o HTTP corta o tempo de espera",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time troca uma chamada síncrona entre dois serviços por uma mensagem assíncrona através de uma fila. O que o time ganha em acoplamento no tempo, e o que perde em troca?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ganha independência de disponibilidade entre os dois; perde a resposta imediata",
                                "isCorrect": true
                            },
                            {
                                "text": "Ganha resposta imediata; perde a necessidade de qualquer infraestrutura nova",
                                "isCorrect": false
                            },
                            {
                                "text": "Ganha mais throughput sempre; perde a possibilidade de qualquer erro",
                                "isCorrect": false
                            },
                            {
                                "text": "Ganha consistência forte entre os dois; perde parte da segurança",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação sobre escolher entre comunicação síncrona e assíncrona está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A escolha depende de quem chama precisar do resultado na hora",
                                "isCorrect": true
                            },
                            {
                                "text": "Assíncrono deveria substituir toda chamada síncrona, sempre que possível",
                                "isCorrect": false
                            },
                            {
                                "text": "Síncrono é uma técnica antiga, sem uso em sistemas modernos",
                                "isCorrect": false
                            },
                            {
                                "text": "Assíncrono elimina qualquer chance de erro durante o processamento",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Desacoplar com filas: absorvendo picos de carga",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A fila como a peça que já existia\n\nA trilha de Cache, Filas e Performance te deu a peça técnica: BullMQ por cima do Redis, com uma fila recebendo jobs de um produtor e um worker, rodando à parte, consumindo esses jobs. Este módulo não reinventa isso, retoma: fila é a forma mais comum de tornar concreto o que a aula passada chamou de assíncrono. Em vez de o serviço A esperar o trabalho terminar, ele descreve o trabalho, entrega para a fila, e segue.\n\nO que muda aqui é o motivo pelo qual você olha para isso agora: não é só deixar a rota rápida, é uma peça de arquitetura que resolve um problema maior, em escala."
                    },
                    {
                        "type": "text",
                        "value": "## Amortecer picos de carga\n\nImagine a ensina.dev abrindo matrícula gratuita numa trilha nova, e 5 mil pessoas se cadastrando no mesmo minuto. Se cada cadastro dispara, na hora, o envio de um e-mail de boas-vindas, o processamento da imagem de avatar e um evento de analytics, cada dependência recebe 5 mil pedidos de trabalho pesado de uma vez, no mesmo instante. Sem fila, esse pico bate direto em cada uma delas, e alguma provavelmente não aguenta.\n\nCom fila, o pico de 5 mil cadastros vira 5 mil jobs guardados no broker, e os workers processam num ritmo que conseguem sustentar, até o limite de `concurrency` configurado. Ninguém perde o trabalho: ele só espera um pouco mais na fila até ser processado. A fila transforma um pico abrupto de demanda numa fila, no sentido literal, de trabalho consumida num ritmo estável."
                    },
                    {
                        "type": "code",
                        "value": "import { Queue, Worker } from 'bullmq';\n\nconst connection = { host: '127.0.0.1', port: 6379 };\n\n// PRODUTOR: roda dentro da rota, so descreve o job e entrega para a fila\nconst relatorioQueue = new Queue('relatorios', { connection });\n\napp.post('/relatorios/vendas', async (req, res) => {\n  const { lojaId, mes } = req.body;\n\n  const job = await relatorioQueue.add('gerar-relatorio-vendas', { lojaId, mes });\n\n  res.status(202).json({ jobId: job.id, mensagem: 'Relatorio em geracao' });\n});\n\n// CONSUMIDOR: processo separado, escutando a fila 'relatorios'\nconst relatorioWorker = new Worker(\n  'relatorios',\n  async (job) => {\n    const { lojaId, mes } = job.data;\n    const dados = await buscarVendasDoMes(lojaId, mes);\n    const arquivo = await gerarPDF(dados);\n    await salvarRelatorioGerado(lojaId, mes, arquivo);\n  },\n  { connection, concurrency: 3 }\n);"
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Chamada direta (síncrona)\", \"Fila (assíncrona)\"], [\"Resposta ao cliente\", \"Espera o trabalho pesado terminar\", \"Confirma que o pedido foi aceito, na hora\"], [\"Sob pico de demanda\", \"Cada requisição nova soma carga imediata na dependência\", \"O excesso espera na fila, consumido no ritmo dos workers\"], [\"Se o worker (ou a dependência) cai\", \"A requisição inteira falha\", \"O job fica esperando, processa quando alguém voltar\"], [\"Escala independente\", \"Só escalando o serviço inteiro\", \"Dá para escalar só os workers, sem tocar na API\"], [\"Custo\", \"Mais simples, menos peças no ar\", \"Mais peças (fila, worker) para operar e monitorar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Escalar o consumo, não só a API\n\nO Módulo 2 mostrou como escalar o monólito horizontalmente: mais réplicas da aplicação atrás de um load balancer. Fila abre uma escala diferente, e independente dessa: como o trabalho pesado saiu da API e foi para os workers, dá para aumentar o número de workers sem tocar nas réplicas da API, e vice-versa. Se o gargalo é gerar relatório, sobe mais processos worker consumindo a fila `relatorios`. Se o gargalo é atender requisição HTTP, sobe mais réplicas da API. São dois recursos escaláveis de forma separada, cada um resolvendo o problema que é dele."
                    },
                    {
                        "type": "text",
                        "value": "## O preço, revisitado num nível maior\n\nVocê já sabe o preço de uma fila: mais uma peça no ar (o broker), mais um processo para gerenciar (o worker), resultado que não é mais imediato. Em escala, esse preço cresce junto: agora existe uma nova unidade de deploy, o worker, para versionar, monitorar e reiniciar, com sua própria saúde e seus próprios logs, separada da API. É o primeiro passo de uma ideia que a trilha retoma no Módulo 5: partes do sistema podem virar processos (ou serviços) independentes, cada um com seu ciclo próprio."
                    },
                    {
                        "type": "quote",
                        "value": "Fila não é só um jeito de deixar uma rota rápida: é um amortecedor entre quem gera trabalho e quem processa, que absorve picos sem exigir que os dois lados andem no mesmo ritmo."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que uma fila faz, de forma geral, entre quem produz um trabalho e quem o processa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Guarda o trabalho até que um worker esteja livre para processá-lo",
                                "isCorrect": true
                            },
                            {
                                "text": "Executa o trabalho imediatamente, dentro do próprio produtor",
                                "isCorrect": false
                            },
                            {
                                "text": "Apaga o trabalho automaticamente se nenhum worker responder logo",
                                "isCorrect": false
                            },
                            {
                                "text": "Converte o trabalho pesado numa chamada síncrona mais rápida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa promoção, uma trilha nova recebe 5 mil cadastros no mesmo minuto, cada um disparando um job de envio de e-mail. A fila absorve esse pico e os workers processam num ritmo estável. O que acontece com os jobs que ainda não foram processados nesse momento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ficam guardados na fila, esperando a vez de serem processados",
                                "isCorrect": true
                            },
                            {
                                "text": "São perdidos, pois a fila só guarda um pico por vez",
                                "isCorrect": false
                            },
                            {
                                "text": "São enviados direto pelo produtor, ignorando os workers",
                                "isCorrect": false
                            },
                            {
                                "text": "Fazem os workers travarem, pois excedem o limite da fila",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de mover a geração de relatório para uma fila, o gargalo agora é o tempo que os workers levam para processar cada relatório, enquanto a API continua respondendo rápido. Qual é o ajuste mais direto para esse gargalo específico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o número de processos worker consumindo essa fila",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o número de réplicas da API atrás do load balancer",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o tempo de vida (TTL) das entradas no cache",
                                "isCorrect": false
                            },
                            {
                                "text": "Diminuir o número de índices na tabela de relatórios",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe está decidindo entre chamar um serviço de geração de PDF de forma síncrona, dentro da rota, ou enfileirar esse trabalho e processá-lo à parte. O serviço de PDF é lento e, em dias de pico, recebe chamadas bem acima da média. Qual argumento pesa mais a favor da fila nesse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A fila absorve o pico, deixando os workers processarem no próprio ritmo",
                                "isCorrect": true
                            },
                            {
                                "text": "A fila elimina totalmente a necessidade de monitorar esse serviço",
                                "isCorrect": false
                            },
                            {
                                "text": "A fila garante que o PDF fica pronto antes da resposta HTTP",
                                "isCorrect": false
                            },
                            {
                                "text": "A fila resolve sozinha qualquer erro de geração dentro do PDF",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço interno faz uma consulta simples ao próprio banco, sem chamada externa, respondendo em poucos milissegundos mesmo sob carga alta. Um arquiteto sugere colocar essa consulta atrás de uma fila, para 'desacoplar tudo por padrão'. Qual é o problema mais provável dessa sugestão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Adiciona uma peça de infraestrutura sem resolver um problema real ali",
                                "isCorrect": true
                            },
                            {
                                "text": "Fila nunca pode ser usada para operações de leitura no banco",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis não suporta guardar jobs de consultas ao banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultas rápidas travam automaticamente qualquer worker que as processe",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Message broker: RabbitMQ, Kafka e o modelo produtor/consumidor",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é, de fato, um message broker\n\nNa trilha de Cache, Filas e Performance, a fila que você usou vivia dentro do Redis, coordenada pelo BullMQ. Isso é uma instância de uma ideia mais geral: um **message broker** é o serviço que fica no meio de quem produz uma mensagem e quem consome, guardando essa mensagem até que alguém esteja pronto para processá-la, e entregando com alguma garantia de ordem e de que ela não vai se perder no caminho.\n\nRedis, o mesmo que você já usa para cache e sessão, é uma opção de broker, mas não é a única, nem sempre a mais indicada dependendo da escala e da garantia que o sistema precisa."
                    },
                    {
                        "type": "text",
                        "value": "## Três nomes que você vai encontrar\n\n- **RabbitMQ**: um broker de filas tradicional, focado em entregar cada mensagem para quem deve processá-la, com roteamento flexível (uma mensagem pode ir para uma fila específica, ou ser replicada para várias, dependendo de regras). Boa escolha quando o que importa é distribuir tarefas entre consumidores.\n- **Kafka**: pensado para volume alto e para guardar um histórico de eventos por um tempo, não só até serem consumidos uma vez. Consumidores diferentes podem ler o mesmo fluxo de eventos em momentos diferentes, cada um na sua própria posição. Comum em arquiteturas orientadas a eventos com muitos serviços ouvindo os mesmos acontecimentos.\n- **Redis** (com Streams, ou com a fila do BullMQ): a opção mais simples de operar quando você já tem Redis no ar, suficiente para boa parte dos casos que não exigem o volume ou o histórico longo do Kafka.\n\nNenhum dos três é 'o certo': a escolha depende do volume de mensagens, de quanto tempo elas precisam ficar guardadas, e do que você já opera. Trocar de broker no meio de um projeto tem custo, então essa é uma decisão para pesar com calma, não para seguir modismo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Fila (queue)\", \"Tópico (pub-sub)\"], [\"Quantos consomem cada mensagem\", \"Um consumidor só processa cada mensagem\", \"Todo assinante recebe uma cópia da mensagem\"], [\"Uso típico\", \"Distribuir tarefas entre vários workers\", \"Avisar vários serviços interessados sobre o mesmo evento\"], [\"Exemplo\", \"Jobs de gerar relatório, um por vez, por algum worker livre\", \"Evento 'pedido criado' notificando estoque, e-mail e analytics ao mesmo tempo\"], [\"Depois de consumida\", \"Some da fila (ou vai para completed)\", \"Continua disponível para outros assinantes, dependendo do broker\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Produtor e consumidor, agora com mais de um consumidor\n\nO papel do produtor não muda: alguém publica uma mensagem descrevendo algo que aconteceu ou que precisa ser feito. O que muda, de broker para broker (e de fila para tópico), é quantos consumidores recebem essa mensagem.\n\nNuma fila clássica, como a que você já usa, vários workers podem escutar a mesma fila, mas cada mensagem é entregue para um só deles (é assim que o BullMQ distribui jobs entre processos worker, sem que dois peguem o mesmo job). Já num tópico, no modelo pub-sub, a mesma mensagem pode ser entregue para vários assinantes diferentes, cada um fazendo algo distinto com ela. Um evento 'pedido.criado' publicado num tópico pode ser lido, ao mesmo tempo, pelo serviço de estoque (para reservar o produto), pelo serviço de e-mail (para confirmar a compra) e por um serviço de analytics (para contar a venda), sem que um saiba da existência do outro."
                    },
                    {
                        "type": "code",
                        "value": "// Fila: um job, consumido por um worker so (o que voce ja viu com BullMQ)\nawait relatorioQueue.add('gerar-relatorio-vendas', { lojaId, mes });\n\n// Topico/pub-sub: um evento, entregue a todo assinante interessado\n// (sintaxe ilustrativa, cada broker tem a sua)\nawait eventBus.publish('pedido.criado', { pedidoId, clienteId, itens });\n\n// servico de estoque, e-mail e analytics assinam o mesmo topico,\n// cada um com seu proprio consumidor, sem saber um do outro\neventBus.subscribe('pedido.criado', reservarEstoque);\neventBus.subscribe('pedido.criado', enviarEmailConfirmacao);\neventBus.subscribe('pedido.criado', registrarVenda);"
                    },
                    {
                        "type": "text",
                        "value": "## Um broker não substitui julgamento\n\nAdicionar um message broker resolve o problema de entregar mensagens de forma confiável entre quem produz e quem consome, mas é mais uma peça de infraestrutura para manter no ar, com sua própria configuração, monitoramento e, eventualmente, defeito. Ele não substitui a pergunta feita na primeira aula deste módulo: essa comunicação específica precisa mesmo ser assíncrona? Uma validação de senha, uma checagem de saldo antes de aprovar uma compra, continuam candidatas naturais a uma chamada síncrona direta. Broker é para o trabalho que pode (e ganha em) esperar, não para tudo."
                    },
                    {
                        "type": "quote",
                        "value": "Um message broker é o correio do sistema: guarda a mensagem, garante que ela chega, e não se importa se quem vai ler está disponível agora ou só daqui a alguns minutos."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o papel de um message broker numa arquitetura assíncrona?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Guardar e entregar mensagens entre quem produz e quem consome",
                                "isCorrect": true
                            },
                            {
                                "text": "Executar o código de processamento de cada mensagem recebida",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir o banco de dados como lugar de guardar tudo",
                                "isCorrect": false
                            },
                            {
                                "text": "Validar a autenticação de cada usuário antes da requisição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema precisa que vários serviços diferentes leiam o mesmo fluxo de eventos de vendas, cada um em seu próprio ritmo, com bastante volume de eventos por segundo. Qual característica torna o Kafka uma escolha comum nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Guarda um histórico de eventos, lido por vários consumidores depois",
                                "isCorrect": true
                            },
                            {
                                "text": "É a única opção capaz de publicar mais de um evento por vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispensa a necessidade de ter qualquer consumidor no sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "Garante que nenhum evento chegue duplicado a um consumidor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um evento 'pedido criado' precisa ser recebido, ao mesmo tempo, pelo serviço de estoque, pelo de e-mail e por um serviço de analytics, cada um fazendo algo diferente com ele. Esse cenário se encaixa melhor em qual modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Tópico (pub-sub), pois cada assinante recebe sua própria cópia",
                                "isCorrect": true
                            },
                            {
                                "text": "Fila clássica, pois só um consumidor deve processar o evento",
                                "isCorrect": false
                            },
                            {
                                "text": "Chamada síncrona, pois os três serviços precisam responder juntos",
                                "isCorrect": false
                            },
                            {
                                "text": "Cache compartilhado, pois os três serviços leem o mesmo valor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Três processos worker escutam a mesma fila 'relatorios' no BullMQ, cada um pronto para processar. Um novo job de gerar relatório chega nessa fila. Quantos desses processos, de fato, executam esse job específico?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Só um: o BullMQ entrega esse job a um único worker",
                                "isCorrect": true
                            },
                            {
                                "text": "Os três ao mesmo tempo, cada um fazendo parte do relatório",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum, pois um job novo exige reiniciar todos os workers",
                                "isCorrect": false
                            },
                            {
                                "text": "Os três em sequência, um repetindo o trabalho do anterior",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe está adicionando RabbitMQ ao sistema e decide, por padrão, publicar toda chamada entre serviços como mensagem assíncrona, incluindo a checagem de saldo que precisa aprovar ou recusar uma compra na hora. Qual é o problema dessa decisão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Essa checagem precisa do resultado na hora; síncrono ainda é certo",
                                "isCorrect": true
                            },
                            {
                                "text": "RabbitMQ não consegue lidar com mensagens relacionadas a pagamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Mensagens assíncronas nunca chegam ao consumidor certo em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "O broker substitui completamente a necessidade de checar saldo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Arquitetura orientada a eventos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## De 'quem eu chamo' para 'o que aconteceu'\n\nAté aqui, mesmo na versão assíncrona, ainda existia um produtor pensando no consumidor: a rota de cadastro sabe que existe uma fila de e-mails, e enfileira ali de propósito. Arquitetura orientada a eventos (event-driven) muda essa pergunta: em vez de um serviço decidir quem chamar, direto ou por fila, para cada próximo passo, ele só anuncia que algo aconteceu, um evento, como 'pedido.criado' ou 'usuario.cadastrado', e quem tiver interesse, escuta.\n\nO serviço de pedidos não sabe (nem precisa saber) que o serviço de estoque vai reservar produto, que o serviço de e-mail vai mandar confirmação, ou que um serviço de analytics vai contar aquela venda. Ele só publica o fato: um pedido foi criado, com estes dados. O que acontece depois é problema de quem está ouvindo."
                    },
                    {
                        "type": "text",
                        "value": "## O ganho: desacoplamento de verdade\n\nNuma cadeia de chamadas diretas (mesmo assíncronas, via fila dedicada), o serviço de pedidos precisaria saber, no código, de cada fila que existe: enfileirar no 'reservar-estoque', enfileirar no 'enviar-email', enfileirar no 'registrar-analytics'. Adicionar um quarto interessado (um serviço de recomendação, por exemplo, que quer saber de toda compra) significa mexer no serviço de pedidos de novo, para adicionar mais um `queue.add`.\n\nCom eventos, o serviço de pedidos publica um evento só, 'pedido.criado', sem saber quem (nem quantos) está ouvindo. Adicionar o serviço de recomendação vira: esse novo serviço passa a assinar o evento que já existe. O serviço de pedidos nem precisa saber que ele existe, nem ser alterado. É o mesmo princípio de baixo acoplamento que você já viu de outras formas (uma API que não conhece os detalhes internos de quem consome, um cache que não sabe quem lê), agora aplicado a como serviços inteiros se avisam."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Chamada direta (orquestração)\", \"Evento (coreografia)\"], [\"Quem decide o próximo passo\", \"O serviço que inicia o fluxo, chamando cada um\", \"Cada serviço decide, sozinho, se reage ao evento\"], [\"Adicionar um novo interessado\", \"Precisa alterar o serviço de origem\", \"Só o novo serviço assina o evento existente\"], [\"Rastrear o fluxo completo\", \"Basta ler o código de quem orquestra\", \"Precisa juntar o que vários serviços fazem, cada um por conta\"], [\"Acoplamento\", \"Serviço de origem conhece todo mundo que chama\", \"Serviço de origem não conhece quem escuta\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// Orquestracao: o servico de pedidos conhece e chama cada interessado\n[Pedidos] --chama--> [Estoque]\n[Pedidos] --chama--> [E-mail]\n[Pedidos] --chama--> [Analytics]\n\n// Coreografia: o servico de pedidos so publica o evento\n[Pedidos] --publica 'pedido.criado'--> [broker]\n                                          |-- [Estoque]   (assina o evento)\n                                          |-- [E-mail]     (assina o evento)\n                                          |-- [Analytics]  (assina o evento)\n// Pedidos nao muda se um novo servico passar a assinar"
                    },
                    {
                        "type": "text",
                        "value": "## O preço: perder o fio da meada\n\nEsse desacoplamento cobra um preço real, e não é honesto vender arquitetura orientada a eventos como só vantagem. Numa chamada direta, para entender o que acontece depois que um pedido é criado, basta ler o código do serviço de pedidos: está tudo ali, em sequência. Com eventos, essa pergunta não tem uma resposta num lugar só: para saber tudo que reage a 'pedido.criado', é preciso procurar, em cada serviço do sistema, quem assina esse evento. Não existe um único arquivo, nem uma única função, que descreva o fluxo inteiro de ponta a ponta.\n\nÉ por isso que sistemas orientados a eventos, em produção, dependem muito de observabilidade (o mesmo tema do estágio de CI/CD do roadmap): tracing distribuído, logs correlacionados por um id do evento, dashboards que reconstroem o caminho depois do fato. Sem isso, um bug em produção vira um quebra-cabeça: o pedido foi criado, mas por que o estoque não foi reservado? O evento não chegou? O consumidor falhou? Ninguém sabe só de olhar para um lugar."
                    },
                    {
                        "type": "text",
                        "value": "## Não é a resposta para tudo\n\nEvento resolve desacoplamento, não resolve a necessidade de pensar. Nomear eventos com cuidado ('pedido.criado', não algo vago como 'atualização'), decidir o que vai no payload (dados demais e cada consumidor carrega peso desnecessário; dados de menos e cada consumidor volta a consultar o serviço de origem, reintroduzindo o acoplamento que o evento tentou evitar) e cuidar da compatibilidade quando o formato do evento muda continuam sendo decisões de design suas. E para fluxos onde a ordem e o resultado imediato importam de verdade, aprovar ou recusar uma compra na hora, por exemplo, a resposta continua sendo a síncrona direta da primeira aula, não um evento perdido no meio de uma cadeia de reações."
                    },
                    {
                        "type": "quote",
                        "value": "Evento troca 'eu sei quem preciso chamar' por 'eu aviso o que aconteceu': ganha-se liberdade para o sistema crescer sem reescrever quem já existe, paga-se em não ter mais um lugar só onde ler a história inteira."
                    }
                ],
                "questions": [
                    {
                        "statement": "Numa arquitetura orientada a eventos, o que um serviço faz ao terminar uma ação importante, como criar um pedido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Publica um evento descrevendo o que aconteceu, sem saber quem escuta",
                                "isCorrect": true
                            },
                            {
                                "text": "Chama, um por um, todos os serviços que podem se interessar",
                                "isCorrect": false
                            },
                            {
                                "text": "Espera que outro serviço pergunte se algo novo aconteceu",
                                "isCorrect": false
                            },
                            {
                                "text": "Grava o evento só no seu próprio banco de dados local",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema publica o evento 'pedido.criado' e hoje só o serviço de estoque assina esse evento. O time quer adicionar um serviço de recomendação que também reaja a toda compra nova. Numa arquitetura orientada a eventos, o que isso exige do serviço de pedidos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nada: o novo serviço passa a assinar o evento já publicado",
                                "isCorrect": true
                            },
                            {
                                "text": "Adicionar, no código de pedidos, uma chamada para a recomendação",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o evento 'pedido.criado' por um evento novo e maior",
                                "isCorrect": false
                            },
                            {
                                "text": "Publicar o mesmo evento duas vezes, uma para cada assinante",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Comparando chamar cada serviço interessado diretamente (orquestração) com publicar um evento e deixar cada serviço reagir (coreografia), qual é a principal diferença entre os dois modelos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Em orquestração, quem inicia conhece cada interessado; em eventos, não",
                                "isCorrect": true
                            },
                            {
                                "text": "Orquestração é sempre mais rápida, pois nunca usa rede entre serviços",
                                "isCorrect": false
                            },
                            {
                                "text": "Coreografia exige que todo serviço rode dentro do mesmo processo",
                                "isCorrect": false
                            },
                            {
                                "text": "Orquestração não permite mais de dois serviços no mesmo fluxo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de migrar para eventos, um pedido é criado mas o estoque não é reservado. Ninguém sabe, de imediato, se o evento não foi publicado, se o consumidor de estoque falhou, ou se algo mais quebrou. Qual é a causa arquitetural desse tipo de dificuldade?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O fluxo fica espalhado entre serviços, sem um dono único",
                                "isCorrect": true
                            },
                            {
                                "text": "Eventos, por definição, nunca registram log de nenhuma etapa",
                                "isCorrect": false
                            },
                            {
                                "text": "O broker apaga o evento assim que o primeiro assinante lê",
                                "isCorrect": false
                            },
                            {
                                "text": "Serviços orientados a eventos não podem ser monitorados nunca",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um fluxo de aprovação de crédito precisa devolver, na mesma resposta HTTP, se a compra foi aprovada ou recusada, para a tela decidir o que mostrar. Por que publicar um evento assíncrono para essa decisão específica seria uma escolha ruim?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A tela precisa do resultado na hora; evento não garante isso",
                                "isCorrect": true
                            },
                            {
                                "text": "Eventos não conseguem carregar informação sobre aprovação de crédito",
                                "isCorrect": false
                            },
                            {
                                "text": "Publicar eventos exige sempre mais de três serviços no sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "Um evento custa mais caro de processar do que uma fila",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Entrega at-least-once: por que idempotência importa",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A entrega quase nunca é 'exatamente uma vez'\n\nVocê já viu, na trilha de Cache, Filas e Performance, por que um job pode rodar mais de uma vez: o worker processa, mas cai antes de confirmar para o Redis que terminou, e quando volta, pega o mesmo job de novo, achando que ainda não foi feito. Isso não é um defeito do BullMQ, é uma característica de praticamente todo message broker sério, com um nome: **entrega at-least-once** (pelo menos uma vez). O broker garante que a mensagem chega, mas não garante que chega uma única vez.\n\nA razão é uma escolha de design, não um descuido. Existem três garantias possíveis, e nenhuma delas é de graça."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Garantia\", \"O que pode acontecer\", \"Escolha comum de quem\"], [\"At-most-once\", \"A mensagem pode se perder e nunca ser reprocessada\", \"Brokers simples, quando perder é aceitável (ex.: uma métrica)\"], [\"At-least-once\", \"A mensagem pode chegar duplicada, mas nunca se perde\", \"A maioria dos brokers sérios (RabbitMQ, Kafka, BullMQ), por padrão\"], [\"Exactly-once\", \"A mensagem chega uma única vez, garantido pelo broker sozinho\", \"Na prática, quase inatingível de forma genérica e barata\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que 'pelo menos uma vez' e não 'exatamente uma vez'\n\nUm broker entrega uma mensagem a um consumidor e espera uma confirmação (um ack) de que ela foi processada com sucesso, antes de marcar aquela mensagem como concluída e parar de se preocupar com ela. O problema mora exatamente na janela entre 'processei' e 'confirmei que processei': se o consumidor processa a mensagem (manda o e-mail, cobra o cartão, reserva o estoque) e cai, trava, ou perde a conexão antes de mandar esse ack, o broker não tem como saber se o trabalho foi feito. Da perspectiva dele, mais seguro é reentregar a mensagem para alguém processar de novo do que arriscar perder o trabalho para sempre.\n\nGarantir 'exatamente uma vez' de verdade exigiria que broker e consumidor concordassem, de forma atômica, sobre 'processei e confirmei' no mesmo instante, o que a maioria dos sistemas distribuídos não consegue prometer com segurança e desempenho ao mesmo tempo. Por isso a indústria, em geral, prefere at-least-once no broker, e empurra a responsabilidade de lidar com duplicata para o consumidor: idempotência."
                    },
                    {
                        "type": "code",
                        "value": "// Consumidor do evento 'pedido.criado' no servico de estoque\n// idempotencia via tabela de eventos ja processados, com constraint unica em event_id\nasync function processarPedidoCriado(evento) {\n  const { eventId, pedidoId, itens } = evento;\n\n  try {\n    // INSERT falha com violacao de unique se event_id ja existir\n    await db.query(\n      'INSERT INTO processed_events (event_id, processed_at) VALUES ($1, now())',\n      [eventId]\n    );\n  } catch (erro) {\n    if (erro.code === '23505') { // unique_violation no Postgres\n      console.log('Evento ' + eventId + ' ja processado, ignorando');\n      return;\n    }\n    throw erro;\n  }\n\n  await reservarEstoque(pedidoId, itens);\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Mesmo princípio, mecanismo diferente\n\nA chave de idempotência no Redis, que você já viu, e essa tabela `processed_events` no banco resolvem o mesmo problema (não fazer o trabalho arriscado duas vezes) de dois jeitos diferentes: o Redis expira sozinho (bom para uma janela de tempo curta, algumas horas), o registro no banco fica guardado por muito mais tempo, dentro da mesma transação que já grava o efeito daquele evento (bom quando o histórico do que já foi processado precisa durar, ou quando faz sentido essa garantia estar na mesma transação do banco que já registra o resultado). Não existe uma resposta única: a pergunta é por quanto tempo a duplicata pode acontecer, e onde já existe uma transação para aproveitar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"Prefira chamada direta (síncrona)\", \"Prefira fila / evento (assíncrona)\"], [\"Você precisa do resultado para decidir o próximo passo\", \"Sim\", \"Não\"], [\"O trabalho é lento ou depende de terceiro instável\", \"A espera vaza direto para quem chamou\", \"Isola a lentidão, com garantia de reentrega\"], [\"Pode haver picos grandes e repentinos de demanda\", \"Cada pico bate direto na dependência\", \"A fila absorve e distribui no tempo\"], [\"Vários serviços precisam saber do mesmo acontecimento\", \"Precisa chamar um por um\", \"Um evento serve a todos os interessados\"], [\"A operação exige idempotência garantida por você\", \"Ainda vale considerar, retries de rede existem\", \"Obrigatório: at-least-once torna duplicata questão de tempo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Comunicação assíncrona não é sobre deixar tudo mais rápido: é sobre não deixar a lentidão de uma parte do sistema contaminar todas as outras. E toda vez que uma fila, um tópico ou um evento desacopla duas partes, alguém, em algum lugar, precisa saber lidar com a mensagem chegando de novo."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que um broker entrega mensagens com garantia at-least-once?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A mensagem sempre chega, mas pode chegar mais de uma vez",
                                "isCorrect": true
                            },
                            {
                                "text": "A mensagem chega no máximo uma vez, podendo se perder",
                                "isCorrect": false
                            },
                            {
                                "text": "A mensagem só é entregue depois de um dia inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "A mensagem nunca chega mais de uma vez ao consumidor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um worker processa um job de cobrança com sucesso (o cartão é cobrado), mas cai antes de confirmar ao broker que terminou. O que o broker tende a fazer com esse job?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reentrega o job depois, achando que ele ainda não foi feito",
                                "isCorrect": true
                            },
                            {
                                "text": "Marca o job como concluído, mesmo sem receber confirmação",
                                "isCorrect": false
                            },
                            {
                                "text": "Apaga o job, pois a queda do worker invalida o trabalho",
                                "isCorrect": false
                            },
                            {
                                "text": "Espera indefinidamente até o mesmo worker voltar ao ar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um consumidor de eventos precisa de idempotência que sobreviva por meses, dentro da mesma transação que já grava o efeito do evento no banco. Qual mecanismo de deduplicação se encaixa melhor nesse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma tabela no banco com constraint única, na mesma transação",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma chave no Redis com TTL de alguns segundos apenas",
                                "isCorrect": false
                            },
                            {
                                "text": "Um contador em memória, dentro do próprio processo do worker",
                                "isCorrect": false
                            },
                            {
                                "text": "Um cabeçalho HTTP customizado, verificado pelo load balancer",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço de notificações passa a ser chamado por vários outros serviços toda vez que algo relevante acontece no sistema, e o volume de chamadas varia muito ao longo do dia, com picos difíceis de prever. Qual mudança de arquitetura melhor endereça esse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Publicar eventos num broker, consumidos no ritmo do serviço",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o timeout das chamadas diretas para aguentar picos",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar as chamadas diretas para conexões mais rápidas de rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de serviços que podem chamar notificações",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma consumidora de eventos argumenta que não precisa se preocupar em processar a mesma mensagem duas vezes, porque isso 'quase nunca acontece' na prática. Considerando a garantia at-least-once da maioria dos brokers, o que está errado nesse raciocínio?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Duplicata é esperada por design: o consumidor precisa ser idempotente",
                                "isCorrect": true
                            },
                            {
                                "text": "At-least-once garante, na prática, que duplicata nunca ocorre de fato",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema só existe em brokers antigos, já resolvido hoje",
                                "isCorrect": false
                            },
                            {
                                "text": "Duplicata só acontece se o produtor publicar o evento errado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - De monólito a serviços",
        "aulas": [
            {
                "titulo": "Quando (e se) quebrar o monólito",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Quando (e se) quebrar o monólito\n\nNas últimas trilhas você construiu, testou, containerizou e colocou no ar uma aplicação monolítica: uma base de código só, um processo de deploy só, rodando em várias réplicas stateless atrás de um load balancer, o desenho que fechou a trilha de CI/CD e Cloud. Esse desenho aguenta muito mais do que a maioria dos times imagina, e para boa parte dos produtos ele é a arquitetura certa para sempre, não uma fase de transição.\n\nEste módulo começa pela pergunta que mais importa antes de qualquer diagrama de microsserviços: quando (e se) vale a pena quebrar esse monólito em pedaços menores. A resposta curta, que vai se repetir de aula em aula: raramente, e só quando os sinais forem concretos."
                    },
                    {
                        "type": "text",
                        "value": "## Os sinais reais de que o monólito está doendo\n\nLá no Módulo 2 você já viu o primeiro aviso: o monólito começa a doer quando o build fica lento e os times pisam no pé um do outro. Esse é o ponto de partida certo, e ele tem duas faces bem diferentes:\n\n- **Times grandes demais para uma base só**: dezenas de desenvolvedores mexendo no mesmo repositório, na mesma pipeline de deploy, no mesmo processo em produção. Um deploy de um time trava a fila de deploy de outro, um bug introduzido por um módulo pode derrubar a aplicação inteira, mesmo a parte que outro time nunca tocou, e revisar código fica mais lento conforme a base cresce.\n- **Partes com necessidades de escala muito diferentes**: um serviço de geração de relatório pesado, que consome CPU e memória por minutos, rodando no mesmo processo que a API de checkout, que precisa responder em milissegundos. Escalar o monólito inteiro para dar conta do relatório significa pagar por réplicas caras só para acomodar uma fatia pequena do tráfego."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinal\",\"O que costuma significar\",\"Justifica quebrar o monólito?\"],[\"Vários times grandes travando uns aos outros no deploy e no code review\",\"A coordenação entre pessoas virou o gargalo, não a tecnologia\",\"Sim, é um dos dois sinais reais\"],[\"Uma parte do sistema com pico de CPU ou memória bem acima do resto\",\"Escalar tudo junto desperdiça recursos com a parte que não precisa\",\"Sim, é um dos dois sinais reais\"],[\"A aplicação está lenta sob carga\",\"Pode ser query sem índice, falta de cache ou falta de réplica de leitura\",\"Não direto, o Módulo 3 resolve isso antes\"],[\"O time achou microsserviços mais moderno\",\"Preferência de arquitetura sem nenhuma dor concreta por trás\",\"Não, isso é modismo, não sinal\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O contraponto: a maioria dos projetos não precisa\n\nVale repetir o mantra do Módulo 1: meça, não adivinhe. Microsserviços resolvem um problema de organização (times grandes demais para uma base só) e um problema de escala desigual (partes com necessidades muito diferentes). Se o time cabe numa mesa (ou duas), se o monólito builda e deploya rápido, e se nenhuma parte do sistema pede uma escala muito diferente do resto, quebrar em serviços menores não resolve nada. Só troca um problema conhecido, uma base grande, por um conjunto de problemas novos e mais difíceis, que a Aula 3 detalha.\n\nBoa parte da indústria adotou microsserviços olhando para empresas como Netflix ou Amazon, sem ter o mesmo problema que elas tinham: centenas de times, escala de milhões de usuários simultâneos, décadas de monólito acumulado. Copiar a solução sem ter o problema é a forma mais comum de complicar um sistema que estava bem."
                    },
                    {
                        "type": "text",
                        "value": "## Um teste prático antes de decidir\n\nAntes de desenhar qualquer serviço novo, vale responder três perguntas com dados, não com opinião:\n\n- O deploy está travando por coordenação entre times, e não por falta de automação?\n- Existe uma parte do sistema com uma curva de uso claramente diferente do resto, em tráfego, CPU, memória ou picos em horários diferentes?\n- O time tem estrutura para operar mais de um serviço (mais de um pipeline de deploy, mais de um banco, mais observabilidade) sem que isso vire um projeto paralelo sem fim?\n\nSe a resposta for não para as três, o monólito continua sendo a escolha certa, e a Aula 5 mostra um caminho intermediário antes de partir para microsserviços de verdade."
                    },
                    {
                        "type": "quote",
                        "value": "Quebrar o monólito não é uma evolução natural nem uma marca de maturidade. É uma resposta a uma dor concreta, e sem essa dor, é só complexidade a mais."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções abaixo é, segundo esta aula, um sinal real para considerar quebrar um monólito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Times grandes demais travando uns aos outros no deploy e no code review",
                                "isCorrect": true
                            },
                            {
                                "text": "O time acha que microsserviços deixariam o currículo mais interessante",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma rota específica ficou lenta depois que a tabela de pedidos cresceu",
                                "isCorrect": false
                            },
                            {
                                "text": "A equipe prefere usar uma linguagem de programação diferente por gosto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de 6 desenvolvedores mantém um monólito que builda em 2 minutos e deploya sem conflito entre squads. Alguém sugere migrar para microsserviços porque é o padrão do mercado. Qual é a avaliação mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Faz sentido migrar, porque adiar demais a decisão custa mais caro depois",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há sinal real de dor, o monólito atual já resolve bem esse cenário",
                                "isCorrect": true
                            },
                            {
                                "text": "Só faz sentido se o banco de dados for trocado por um mais escalável",
                                "isCorrect": false
                            },
                            {
                                "text": "Depende exclusivamente de qual linguagem de programação o time domina",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um e-commerce tem uma API de checkout leve e um serviço de geração de relatórios que consome bastante CPU por vários minutos, os dois rodando no mesmo monólito. Qual argumento a favor de extrair o relatório como serviço à parte é mais sólido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Relatórios escritos em outra linguagem de programação sempre rodam mais rápido",
                                "isCorrect": false
                            },
                            {
                                "text": "Escalar o monólito inteiro para atender ao relatório desperdiça recursos",
                                "isCorrect": true
                            },
                            {
                                "text": "Serviços separados eliminam qualquer necessidade futura de cache",
                                "isCorrect": false
                            },
                            {
                                "text": "Um serviço à parte dispensa completamente o uso de testes automatizados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma startup com 4 desenvolvedores decide, logo no início do produto, adotar 12 microsserviços separados, inspirada numa palestra de uma grande empresa de tecnologia. Três meses depois, a maior parte do tempo do time é gasta configurando comunicação entre serviços em vez de construir funcionalidade. O que essa situação ilustra melhor?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A empresa de referência tinha um problema bem diferente do da startup",
                                "isCorrect": true
                            },
                            {
                                "text": "Doze serviços é sempre um número tecnicamente inviável para qualquer time",
                                "isCorrect": false
                            },
                            {
                                "text": "Microsserviços exigem, no mínimo, uma dúzia de desenvolvedores para funcionar",
                                "isCorrect": false
                            },
                            {
                                "text": "O erro foi não ter escolhido gRPC em vez de REST entre os serviços",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema tem um time pequeno e coeso, sem nenhum atrito de deploy entre pessoas, mas uma única funcionalidade de processamento de vídeo consome bem mais CPU do que o resto da aplicação, obrigando a escalar o monólito inteiro por causa dela. Considerando os sinais desta aula, qual é a leitura mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Esse sinal de escala desigual já pode justificar extrair só essa funcionalidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma ação é necessária, pois times pequenos nunca sentem esse tipo de dor",
                                "isCorrect": false
                            },
                            {
                                "text": "O sistema inteiro deve virar microsserviços, já que um sinal foi encontrado",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema só se resolve trocando toda a aplicação para outra linguagem",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que são microsserviços",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que são microsserviços\n\nMicrosserviços são um jeito de organizar um sistema como um conjunto de serviços pequenos e independentes, cada um responsável por uma parte específica do negócio, em vez de uma aplicação única cuidando de tudo. Cada serviço roda seu próprio processo, tem seu próprio ciclo de deploy e, o ponto mais importante, tem seu próprio banco de dados: nenhum outro serviço acessa esse banco diretamente, só através da API (ou dos eventos) que o serviço expõe.\n\nIsso é bem diferente de só separar o código em pastas dentro do mesmo processo. Para valerem como microsserviços de verdade, dois serviços precisam poder ser deployados, escalados e até derrubados de forma independente, sem exigir coordenar um deploy único da aplicação inteira."
                    },
                    {
                        "type": "text",
                        "value": "## A promessa: times autônomos e escala por partes\n\nA ideia por trás dos microsserviços responde exatamente aos dois sinais vistos na Aula 1:\n\n- **Times autônomos**: cada serviço pode ter um time dono, que decide sua própria stack e seu próprio ritmo de deploy, sem esperar aprovação ou coordenação de outros times para colocar uma mudança no ar. Um bug no serviço de notificações não trava o deploy do serviço de pagamentos.\n- **Escalar cada parte separadamente**: o serviço que recebe mais tráfego, ou que consome mais CPU, ganha mais réplicas por conta própria, sem precisar escalar (e pagar por) o sistema inteiro junto. É a mesma ideia de escala horizontal do Módulo 2, só que aplicada por serviço, em vez de pela aplicação inteira."
                    },
                    {
                        "type": "code",
                        "value": "Um e-commerce dividido por domínio de negócio (cada caixa é um serviço,\ncom deploy e banco próprios):\n\ncliente/app\n    |\n    v\n+----------------+\n|  API Gateway   |\n+----------------+\n    |      |      |\n    v      v      v\n+--------+ +--------+ +------------+\n|Catalogo| |Pedidos | |Pagamentos  |\n+--------+ +--------+ +------------+\n    |          |            |\n    v          v            v\n+--------+ +--------+ +------------+\n| banco  | | banco  | |   banco    |\n+--------+ +--------+ +------------+\n\nO serviço de Pedidos não acessa o banco de Pagamentos direto: se precisar\nde algo de lá, chama a API do serviço de Pagamentos, ou reage a um evento\nque ele publica (a mensageria do Módulo 4)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Monólito\",\"Microsserviços\"],[\"Deploy\",\"Um artefato só, a aplicação inteira sobe junto\",\"Cada serviço deploya de forma independente\"],[\"Banco de dados\",\"Um banco compartilhado por toda a aplicação\",\"Cada serviço com seu próprio banco\"],[\"Escala\",\"Escala a aplicação inteira, mesmo que só uma parte precise\",\"Escala cada serviço separadamente, conforme a demanda\"],[\"Times\",\"Um time, ou vários, compartilhando a mesma base de código\",\"Cada serviço pode ter um time dono, com autonomia\"],[\"Comunicação interna\",\"Chamada de função, dentro do mesmo processo\",\"Chamada de rede, por HTTP, gRPC ou mensageria\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Um exemplo, não uma receita\n\nVale um aviso: dividir por domínio de negócio, catálogo, pedidos, pagamentos, no exemplo acima, é o critério certo, mas o número de serviços não é uma meta a perseguir. Um sistema pequeno pode ter dois ou três serviços de verdade; forçar uma divisão em quinze só porque é a moda do momento é o erro mais comum de quem adota microsserviços cedo demais, como já visto na Aula 1. A Aula 4 volta a esse critério de fronteira com mais detalhe."
                    },
                    {
                        "type": "quote",
                        "value": "Microsserviços são um jeito de organizar responsabilidade e escala por domínio de negócio. O número de serviços é consequência disso, nunca o objetivo."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que diferencia de fato um microsserviço de apenas separar o código da aplicação em pastas dentro do mesmo processo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ter banco de dados e ciclo de deploy próprios, independentes dos outros",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar nomes de pastas mais descritivos para cada parte do sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever os testes automatizados em arquivos separados por módulo",
                                "isCorrect": false
                            },
                            {
                                "text": "Documentar cada parte do sistema num arquivo próprio de referência",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time divide sua aplicação em serviços de Catálogo, Pedidos e Pagamentos, cada um com banco próprio. Qual opção descreve corretamente a promessa de autonomia desse desenho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cada time dono de um serviço decide seu deploy sem esperar os outros times",
                                "isCorrect": true
                            },
                            {
                                "text": "Todos os times passam a compartilhar exatamente o mesmo banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Um único pipeline de deploy passa a cuidar dos três serviços de uma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "As três equipes precisam aprovar em conjunto qualquer mudança de código",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que dividir os serviços de um e-commerce em Catálogo, Pedidos e Pagamentos costuma funcionar melhor do que dividir por camada técnica, como um serviço só de banco e outro só de validação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma mudança de negócio passaria a mexer em vários serviços técnicos",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque serviços técnicos sempre respondem mais rápido que os de negócio",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque bancos de dados não funcionam bem dentro de serviços de domínio",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque camadas técnicas não podem ser testadas de forma automatizada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe divide seu sistema em serviço de leitura e serviço de escrita, cortando por camada técnica em vez de por domínio de negócio. Toda funcionalidade nova, como adicionar um campo em pedidos, exige mudança coordenada nos dois serviços ao mesmo tempo. O que esse cenário evidencia?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que a fronteira foi definida por camada técnica, não por domínio de negócio",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o problema seria resolvido apenas com um banco de dados mais rápido",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o time deveria voltar a um monólito sem nenhuma divisão em serviços",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o roteamento do API Gateway está incorreto para esses dois serviços",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma startup pequena, ao adotar microsserviços, cria o maior número de serviços possível, separando até funções isoladas como calcular frete ou formatar CEP em serviços próprios. Qual é o problema central dessa abordagem?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O número de serviços virou meta, e não consequência da divisão por domínio",
                                "isCorrect": true
                            },
                            {
                                "text": "Funções isoladas sempre precisam de um banco de dados compartilhado",
                                "isCorrect": false
                            },
                            {
                                "text": "Serviços pequenos demais nunca conseguem ser escalados de forma independente",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcular frete e formatar CEP não são funcionalidades de negócio válidas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O custo real dos microsserviços",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O custo real dos microsserviços\n\nA Aula 2 mostrou o que os microsserviços prometem: times autônomos, escala por partes. Essa promessa é real, mas não vem de graça. Trocar um monólito por vários serviços também troca a natureza dos problemas que o time enfrenta: alguns problemas do monólito somem, mas problemas novos aparecem, e vários deles são mais difíceis de resolver do que os antigos. Esta aula é sobre a taxa que essa promessa cobra, quase sempre subestimada por quem decide migrar."
                    },
                    {
                        "type": "text",
                        "value": "## Complexidade de rede: uma chamada de função virou uma chamada que pode falhar\n\nDentro de um monólito, um serviço chamando outro é uma chamada de função: rápida, confiável, e se der erro, é um erro do próprio processo, fácil de rastrear. Em microsserviços, essa mesma chamada atravessa a rede: pode demorar mais, pode falhar no meio do caminho, pode dar timeout, pode até chegar duas vezes. Nada disso existia quando as duas partes viviam no mesmo processo.\n\nIsso muda a forma de programar: todo código que fala com outro serviço precisa lidar com timeout, com resposta que nunca chega e com falha parcial, quando uma chamada funciona e outra não. O Módulo 6 desta trilha é inteiro sobre como lidar com esse tipo de falha, e ela só existe porque a chamada agora atravessa uma rede."
                    },
                    {
                        "type": "text",
                        "value": "## Dados distribuídos: sem JOIN entre serviços, sem transação única\n\nNo banco único do monólito, uma operação que mexe em pedido e em estoque ao mesmo tempo pode virar uma transação só: ou as duas mudanças acontecem juntas, ou nenhuma acontece, o mesmo BEGIN e COMMIT que você já viu na trilha de banco de dados. Com um banco por serviço, isso deixa de existir: não dá para fazer um JOIN entre a tabela de Pedidos e a tabela de Estoque, porque elas vivem em bancos diferentes, e não existe uma transação única cobrindo os dois.\n\nNa prática, uma operação que precisa de consistência entre dois serviços passa a acontecer em etapas, cada uma confirmada separadamente, com o risco real de a primeira etapa concluir e a segunda falhar. Reenviar essa segunda etapa exige que ela seja idempotente, o mesmo cuidado que o Módulo 4 já pediu de quem consome uma fila, porque uma tentativa duplicada pode decrementar o estoque duas vezes."
                    },
                    {
                        "type": "text",
                        "value": "## Observabilidade mais difícil, e mais infraestrutura para manter\n\nNum monólito, um erro aparece num log só, de um processo só. Em microsserviços, uma requisição do cliente pode passar por quatro ou cinco serviços diferentes antes de voltar uma resposta, e um erro em qualquer um deles pode ser a causa. Descobrir qual serviço, entre vários, causou um problema específico exige seguir a requisição por todos eles, e o log de um processo isolado deixa de ser suficiente.\n\nAlém disso, vem mais infraestrutura atrás de cada serviço novo: seu próprio pipeline de deploy, seu próprio monitoramento, seu próprio banco de dados rodando e precisando de manutenção, sua própria forma de escalar. O que era cuidar de um sistema de infraestrutura vira, sem exagero, cuidar de vários ao mesmo tempo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ao quebrar o monólito em serviços\",\"O que se ganha\",\"O que se paga\"],[\"Deploy\",\"Cada serviço deploya sem esperar os outros\",\"Cada serviço precisa do próprio pipeline de deploy\"],[\"Escala\",\"Escala só a parte que precisa\",\"Mais peças de infraestrutura para operar e monitorar\"],[\"Dados\",\"Cada serviço dono dos seus próprios dados\",\"Sem JOIN nem transação única entre serviços\"],[\"Chamadas internas\",\"Times podem trocar de stack por serviço\",\"Chamada de função virou chamada de rede, que pode falhar\"],[\"Depuração\",\"Uma falha isolada não derruba o sistema inteiro\",\"Rastrear um erro exige seguir a requisição por vários serviços\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// Antes, no monólito: uma transação só, no mesmo banco\nasync function confirmarPedido(pedidoId, produtoId) {\n  await db.transaction(async (trx) => {\n    await trx('pedidos').where({ id: pedidoId }).update({ status: 'confirmado' });\n    await trx('estoque').where({ produto_id: produtoId }).decrement('quantidade', 1);\n  });\n  // ou as duas mudanças acontecem juntas, ou nenhuma acontece\n}\n\n// Depois, em microsserviços: duas chamadas de rede, sem transação única\nasync function confirmarPedido(pedidoId, produtoId) {\n  await pedidosApi.atualizarStatus(pedidoId, 'confirmado'); // serviço de Pedidos\n\n  // se a chamada abaixo falhar, o pedido já está confirmado\n  // e o estoque não foi baixado: os dois serviços ficaram inconsistentes\n  await estoqueApi.decrementar(produtoId, 1); // serviço de Estoque\n}"
                    },
                    {
                        "type": "quote",
                        "value": "Microsserviços não eliminam complexidade, eles a movem: da lógica de negócio dentro de um processo para a comunicação entre processos. E complexidade de rede costuma ser mais difícil de depurar do que complexidade de código."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que uma chamada entre dois microsserviços é considerada mais arriscada do que uma chamada de função dentro de um monólito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque ela atravessa a rede e pode falhar, atrasar ou nunca chegar",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a linguagem de programação usada é sempre mais lenta",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque bancos de dados diferentes não podem ficar no mesmo servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque APIs REST são proibidas de retornar códigos de erro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço de Pedidos confirma o pedido e, em seguida, chama o serviço de Estoque para dar baixa na quantidade. A chamada ao serviço de Pedidos funciona, mas a chamada ao serviço de Estoque falha por timeout. Qual situação isso ilustra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O risco de inconsistência entre dados que antes viviam na mesma transação",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro de sintaxe que só aparece quando dois bancos são usados juntos",
                                "isCorrect": false
                            },
                            {
                                "text": "A necessidade de sempre usar gRPC em vez de REST entre serviços",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma falha exclusiva de serviços que rodam sem API Gateway na frente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma requisição do cliente passa pelo API Gateway, depois pelo serviço de Pedidos, depois pelo serviço de Pagamentos, e volta com erro. Por que encontrar a causa desse erro é mais difícil do que num monólito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o erro pode ter surgido em qualquer serviço do caminho da requisição",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque, por padrão, serviços separados não geram log de erro algum",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o API Gateway sempre esconde erros vindos dos serviços internos",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque REST não permite retornar um código de status de erro claro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de migrar para microsserviços, um time percebe que uma falha no meio de um fluxo, confirmar pedido e depois baixar estoque, pode deixar os dois serviços com dados inconsistentes entre si. No monólito antigo, isso nunca acontecia. Por que essa garantia se perdeu?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque não existe mais uma transação só cobrindo os dois bancos",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o novo banco de dados não suporta os comandos BEGIN e COMMIT",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o serviço de Estoque não foi implementado com índices adequados",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a rede entre os serviços não usa o protocolo HTTPS por padrão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de 5 pessoas, sem histórico operando mais de um serviço em produção, decide dividir sua aplicação em 8 microsserviços de uma vez. Considerando o custo real descrito nesta aula, qual risco imediato é mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Gastar mais tempo com infraestrutura do que com funcionalidade nova",
                                "isCorrect": true
                            },
                            {
                                "text": "O código de cada serviço ficar tecnicamente impossível de testar",
                                "isCorrect": false
                            },
                            {
                                "text": "O API Gateway deixar de funcionar acima de cinco serviços simultâneos",
                                "isCorrect": false
                            },
                            {
                                "text": "Bancos de dados separados pararem de aceitar conexões simultâneas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Comunicação entre serviços e fronteiras",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Comunicação entre serviços e fronteiras\n\nDepois de aceitar o custo real da Aula 3, a pergunta prática é: como um serviço fala com o outro? Existem três formas principais, e a escolha entre elas não é estética, ela muda o comportamento do sistema inteiro.\n\n- **REST sobre HTTP**: o padrão mais comum, o mesmo modelo usado entre cliente e servidor desde a primeira trilha de APIs. Um serviço faz uma requisição HTTP para outro, espera a resposta, e só então segue com o resultado. Simples de entender e depurar, mas síncrono: quem chama fica esperando.\n- **gRPC**: um protocolo de chamada remota que usa contratos tipados (Protocol Buffers) e um formato binário, em vez de JSON em texto puro. É mais rápido e mais compacto que REST, comum na comunicação interna entre serviços, ao custo de ser menos amigável de inspecionar manualmente do que uma chamada REST comum.\n- **Mensageria e eventos**: retomando o Módulo 4 desta trilha, um serviço publica um evento num message broker (RabbitMQ, Kafka ou Redis) e segue seu caminho, sem esperar quem vai consumir. Assíncrono por natureza, com entrega at-least-once, então quem consome precisa ser idempotente, exatamente como você já viu."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Forma de comunicação\",\"Síncrono ou assíncrono\",\"Quando compensa usar\",\"Acoplamento entre serviços\"],[\"REST/HTTP\",\"Síncrono, quem chama espera a resposta\",\"Cliente externo precisa da resposta na hora, como consultar um pedido\",\"Alto: se o serviço chamado cai, a chamada falha\"],[\"gRPC\",\"Síncrono, mas mais rápido e compacto\",\"Comunicação interna entre serviços, com alto volume de chamadas\",\"Alto, mesma natureza do REST, só que mais eficiente\"],[\"Mensageria/eventos\",\"Assíncrono, quem publica não espera\",\"Tarefa pode esperar, ou vários serviços precisam reagir ao mesmo fato\",\"Baixo: o serviço publicador nem sabe quem vai consumir\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## API Gateway: a porta de entrada\n\nCom vários serviços, o cliente externo (o navegador, o app) não deveria precisar saber que existem vários serviços, nem chamar cada um diretamente. É para isso que serve o API Gateway: um ponto único de entrada que recebe toda requisição externa e a roteia para o serviço certo por dentro.\n\nVale uma distinção importante: um load balancer, do Módulo 2, distribui carga entre réplicas idênticas da mesma aplicação. Um API Gateway roteia entre serviços diferentes, cada um cuidando de uma parte do domínio. Além de rotear, o Gateway é um lugar natural para centralizar o que seria repetido em cada serviço: autenticação (validar o token JWT uma vez só, como você viu na trilha de autenticação), rate limiting e log de toda requisição que entra no sistema."
                    },
                    {
                        "type": "code",
                        "value": "// Um API Gateway simples, roteando por prefixo de rota\n// para o serviço interno responsável por cada domínio\n\nconst rotas = {\n  '/catalogo': 'http://servico-catalogo:3001',\n  '/pedidos': 'http://servico-pedidos:3002',\n  '/pagamentos': 'http://servico-pagamentos:3003',\n};\n\napp.use(async (req, res) => {\n  const prefixo = '/' + req.path.split('/')[1];\n  const destino = rotas[prefixo];\n\n  if (!destino) {\n    return res.status(404).json({ erro: 'rota nao mapeada para nenhum servico' });\n  }\n\n  // valida o token JWT uma vez, aqui, antes de repassar pro servico interno\n  const usuario = validarToken(req.headers.authorization);\n  if (!usuario) return res.status(401).json({ erro: 'nao autenticado' });\n\n  const resposta = await fetch(destino + req.path, {\n    method: req.method,\n    headers: { 'x-usuario-id': usuario.id },\n    body: req.body,\n  });\n\n  res.status(resposta.status).json(await resposta.json());\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Como definir a fronteira de um serviço\n\nO critério certo para separar um serviço do outro é o domínio de negócio, não a camada técnica. Catálogo, Pedidos e Pagamentos são domínios: cada um tem suas próprias regras, seus próprios dados, e muda por razões diferentes. Um serviço dedicado só a banco de dados, ou só a validação, separado por tipo de trabalho técnico em vez de por assunto de negócio, tende a dar errado: quase toda mudança de negócio real acaba mexendo em mais de um desses serviços técnicos ao mesmo tempo, e o time volta a ter a mesma coordenação apertada entre pessoas que os microsserviços prometiam resolver."
                    },
                    {
                        "type": "text",
                        "value": "## Um exemplo prático\n\nImagine dividir um sistema em serviço de Leitura e serviço de Escrita, uma fronteira técnica. Toda vez que um campo novo é adicionado num pedido, os dois serviços precisam mudar juntos, porque ambos conhecem a mesma entidade Pedido por dentro. Compare com dividir em serviço de Pedidos e serviço de Pagamentos, uma fronteira de domínio: adicionar um campo em Pedido é mudança só do serviço de Pedidos, o de Pagamentos nem precisa saber que isso aconteceu, a não ser que o campo apareça num evento que ele já consome.\n\nEsse é o teste prático: uma fronteira boa isola a mudança dentro de um serviço só. Se uma mudança de negócio comum obriga a mexer em vários serviços ao mesmo tempo, a fronteira foi desenhada por técnica, não por domínio."
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta que define uma boa fronteira de serviço não é que tecnologia esse pedaço usa, é que parte do negócio esse pedaço representa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual a principal diferença entre REST/HTTP e mensageria como forma de comunicação entre serviços?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "REST é síncrono e espera resposta; mensageria é assíncrona e não espera",
                                "isCorrect": true
                            },
                            {
                                "text": "REST só funciona dentro de um mesmo servidor físico, mensageria não",
                                "isCorrect": false
                            },
                            {
                                "text": "Mensageria não pode ser usada por mais de um serviço consumidor",
                                "isCorrect": false
                            },
                            {
                                "text": "REST não permite nenhum tipo de autenticação entre serviços",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço de Pedidos precisa emitir uma nota fiscal, mas o serviço de Nota Fiscal está temporariamente fora do ar. Se essa etapa for feita publicando um evento pedido-confirmado, em vez de uma chamada HTTP direta, qual vantagem imediata isso traz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O evento fica esperando no broker até o serviço de Nota Fiscal voltar",
                                "isCorrect": true
                            },
                            {
                                "text": "O serviço de Pedidos passa a validar a nota fiscal por conta própria",
                                "isCorrect": false
                            },
                            {
                                "text": "A chamada HTTP direta deixa de precisar de qualquer tipo de retry",
                                "isCorrect": false
                            },
                            {
                                "text": "O serviço de Nota Fiscal deixa de precisar de um banco de dados próprio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sem um API Gateway centralizando a autenticação, o que cada serviço interno precisaria fazer sozinho, repetindo trabalho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Validar o token de autenticação em cada requisição que recebe",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter sua própria cópia completa do banco de dados de Pedidos",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolher entre usar REST ou gRPC para conversar com o cliente externo",
                                "isCorrect": false
                            },
                            {
                                "text": "Publicar um evento no message broker a cada requisição recebida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema divide seus serviços em Leitura e Escrita, cortando por tipo de operação técnica. Ao adicionar um campo novo na entidade Pedido, o time precisa alterar os dois serviços ao mesmo tempo, toda vez. O que esse padrão de mudança indica sobre a fronteira escolhida?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que a fronteira foi desenhada por camada técnica, não por domínio de negócio",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o campo novo deveria ter sido adicionado direto via SQL no banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Que os dois serviços precisam obrigatoriamente compartilhar o mesmo banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a comunicação entre eles deveria trocar de REST para mensageria",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois serviços internos, sem exposição direta ao navegador, trocam um volume muito alto de chamadas curtas entre si, e a latência de cada chamada importa bastante, sem nenhuma etapa que possa esperar. Qual escolha de comunicação é mais adequada, considerando as opções desta aula?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "gRPC, pelo formato binário mais rápido e compacto que REST em JSON",
                                "isCorrect": true
                            },
                            {
                                "text": "Mensageria, porque toda comunicação interna deveria ser assíncrona",
                                "isCorrect": false
                            },
                            {
                                "text": "REST/HTTP, porque é sempre mais rápido que qualquer outro protocolo",
                                "isCorrect": false
                            },
                            {
                                "text": "API Gateway direto entre os dois serviços, sem nenhum outro protocolo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Monólito modular, o meio-termo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O meio-termo antes de partir para microsserviços\n\nAs últimas três aulas mostraram uma promessa real, times autônomos e escala por partes, e um custo real, rede que falha, dados distribuídos, observabilidade mais difícil. Entre o monólito simples da Aula 1 e os microsserviços completos, existe uma opção que resolve boa parte da dor de organização sem pagar o preço da rede e dos dados distribuídos: o monólito modular.\n\nMonólito modular é um monólito, no sentido que interessa aqui: uma aplicação só, um deploy só, um banco só. A diferença está por dentro: o código é organizado em módulos com fronteiras claras, cada um dono de uma parte do domínio, se comunicando dentro do processo através de interfaces bem definidas, em vez de uma bagunça onde qualquer parte do código chama qualquer outra livremente."
                    },
                    {
                        "type": "text",
                        "value": "## Como fica por dentro\n\nNa prática, cada domínio de negócio, catálogo, pedidos, pagamentos, do exemplo usado nas aulas anteriores, vira um módulo dentro da mesma base de código, com fronteira clara: as tabelas de pedidos só são acessadas pelo código do módulo de Pedidos, nunca direto por outro módulo. Se o módulo de Pagamentos precisa de um dado de Pedidos, ele chama uma função exposta pelo módulo de Pedidos, não faz uma query direto na tabela alheia.\n\nEssa disciplina é o mesmo tipo de fronteira por domínio da Aula 4, só que aplicada dentro de um único processo, sem o custo de rede. O deploy continua sendo um artefato único, o banco continua sendo um só (ainda que organizado em esquemas ou tabelas claramente separadas por módulo), e o time continua depurando um processo só."
                    },
                    {
                        "type": "code",
                        "value": "// Estrutura de um monólito modular, organizado por domínio\n// (não por camada técnica, como controllers/ ou services/ soltos)\n\nsrc/\n  modulos/\n    catalogo/\n      catalogo.controller.js\n      catalogo.service.js\n      catalogo.repositorio.js\n    pedidos/\n      pedidos.controller.js\n      pedidos.service.js\n      pedidos.repositorio.js\n    pagamentos/\n      pagamentos.controller.js\n      pagamentos.service.js\n      pagamentos.repositorio.js\n  app.js  // sobe um processo só, com as rotas dos três módulos\n\n// pedidos.service.js só importa de dentro de modulos/pedidos/\n// se precisar de algo de pagamentos, chama uma função exportada\n// por pagamentos/pagamentos.service.js, nunca a tabela direto"
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Monólito simples\",\"Monólito modular\",\"Microsserviços\"],[\"Deploy\",\"Um artefato só\",\"Um artefato só\",\"Um artefato por serviço\"],[\"Banco de dados\",\"Compartilhado, sem fronteira interna clara\",\"Compartilhado, organizado por módulo\",\"Um banco por serviço\"],[\"Comunicação interna\",\"Qualquer parte chama qualquer parte\",\"Só através de interfaces entre módulos\",\"Chamada de rede entre processos\"],[\"Escala\",\"A aplicação inteira, junto\",\"A aplicação inteira, junto\",\"Cada serviço, separadamente\"],[\"Complexidade operacional\",\"Baixa\",\"Baixa\",\"Alta, mais peças e mais infraestrutura\"],[\"Facilidade de extrair um serviço depois\",\"Baixa, tudo está emaranhado\",\"Alta, os módulos já têm fronteira definida\",\"Não se aplica, já são serviços\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Extrair um serviço por vez, quando a dor for real\n\nQuando a dor de fato aparece, voltando ao teste da Aula 1, um time grande demais para uma base só ou uma parte com escala muito diferente do resto, o monólito modular já deixa o caminho pronto: extrair um serviço não é reescrever o sistema do zero, é pegar um módulo que já tem fronteira clara e mover seu código, seu deploy e seu banco (ou parte dele) para fora do processo principal, um módulo de cada vez.\n\nEssa estratégia incremental é bem mais segura do que um projeto de reescrita completa: o sistema continua funcionando e sendo entregue durante a transição, cada extração é validada isoladamente, e se algo sair errado, o dano fica contido num serviço só, em vez de arriscar o sistema inteiro numa migração de uma vez."
                    },
                    {
                        "type": "text",
                        "value": "## Recapitulando: o caminho honesto\n\nEste módulo caminhou por quatro ideias que se encaixam: quebrar o monólito é resposta a uma dor concreta, não uma evolução natural (Aula 1); microsserviços entregam times autônomos e escala por partes (Aula 2), mas cobram um preço real em complexidade de rede, dados distribuídos e observabilidade (Aula 3); e a comunicação entre serviços, junto com a fronteira por domínio de negócio, e não por camada técnica, decide se esse preço vale a pena (Aula 4).\n\nA conclusão honesta: comece pelo monólito mais simples que resolver o problema. Organize-o por módulos com fronteira clara desde cedo, mesmo sem nenhuma intenção imediata de quebrá-lo. E só extraia um serviço quando a dor for real, medida, e um módulo de cada vez, nunca como reescrita completa de uma vez só. O Módulo 6 desta trilha assume que, cedo ou tarde, algum sistema vai ter mais de um serviço conversando entre si, e mostra como projetar para quando essa conversa falhar."
                    },
                    {
                        "type": "quote",
                        "value": "Não existe arquitetura certa fora de contexto. Existe a arquitetura certa para o time, o produto e o momento que você tem agora, e o monólito modular é, para a maioria, o ponto de partida mais honesto."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza um monólito modular?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Deploy único, organizado por dentro em módulos com fronteiras claras",
                                "isCorrect": true
                            },
                            {
                                "text": "Vários serviços pequenos, cada um com seu próprio banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma aplicação sem nenhuma separação interna entre suas funcionalidades",
                                "isCorrect": false
                            },
                            {
                                "text": "Um serviço único que se comunica com outros por mensageria",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time organiza seu monólito em módulos de Catálogo, Pedidos e Pagamentos, cada um só acessando suas próprias tabelas, se comunicando por funções expostas entre módulos. Meses depois, o módulo de Pagamentos precisa virar um serviço à parte por exigência de escala. Por que essa extração tende a ser mais simples do que num monólito sem essa organização?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a fronteira entre os módulos já estava definida antes da extração",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque módulos organizados eliminam qualquer necessidade de testes",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o monólito modular já roda em mais de um processo por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque módulos sempre usam gRPC internamente antes da extração",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num monólito modular, o módulo de Pagamentos precisa de um dado que pertence ao módulo de Pedidos. Qual prática mantém a fronteira entre os módulos saudável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Chamar uma função exposta por Pedidos, em vez de acessar a tabela direto",
                                "isCorrect": true
                            },
                            {
                                "text": "Copiar a tabela de Pedidos inteira para dentro do módulo de Pagamentos",
                                "isCorrect": false
                            },
                            {
                                "text": "Fazer uma query direta na tabela de Pedidos a partir de Pagamentos",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar os dois módulos para serviços separados imediatamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um produto tem um time de 8 pessoas, deploy que leva poucos minutos, e nenhuma parte do sistema com necessidade de escala muito diferente do resto. Ainda assim, o time já organiza o código internamente por módulos de domínio bem definidos. Qual é a avaliação mais adequada dessa situação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O monólito modular já resolve bem, sem necessidade de virar microsserviços",
                                "isCorrect": true
                            },
                            {
                                "text": "O time deveria migrar para microsserviços, já que os módulos estão prontos",
                                "isCorrect": false
                            },
                            {
                                "text": "A organização por módulos só faz sentido se for seguida de extração",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem múltiplos bancos de dados, a modularização do código é inútil",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de decidir que o serviço de Pagamentos precisa ser extraído do monólito modular, um time considera duas abordagens: reescrever o sistema inteiro do zero, já dividido em todos os serviços de uma vez, ou extrair só o módulo de Pagamentos primeiro, mantendo o resto do monólito rodando normalmente. Qual risco a primeira abordagem carrega que a segunda evita?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Arriscar o sistema inteiro numa migração só, sem validação incremental",
                                "isCorrect": true
                            },
                            {
                                "text": "Precisar manter documentação atualizada durante todo o processo",
                                "isCorrect": false
                            },
                            {
                                "text": "Ter que escolher entre REST e gRPC para o serviço de Pagamentos",
                                "isCorrect": false
                            },
                            {
                                "text": "Gastar mais tempo escrevendo testes automatizados para Pagamentos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Padrões de resiliência e disponibilidade",
        "aulas": [
            {
                "titulo": "Falhas são a regra, não a exceção",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Falhas são a regra, não a exceção\n\nAté aqui, cada módulo desta trilha resolveu um problema de escala adicionando uma peça nova: réplicas do monólito atrás de um load balancer (módulo 2), réplica de leitura e cache na frente do banco (módulo 3), fila e mensageria pra desacoplar trabalho (módulo 4), e talvez um ou outro serviço separado do resto (módulo 5). Cada peça aliviou uma dor real. Só que cada peça nova também é mais uma coisa que pode dar errado, e mais um cabo de rede entre duas partes do sistema que antes eram só uma chamada de função dentro do mesmo processo.\n\nUm sistema de processo único falha de um jeito só: ele trava, ou não trava. Um sistema distribuído falha de dezenas de jeitos parciais, e é sobre esses jeitos parciais que este módulo inteiro trata."
                    },
                    {
                        "type": "text",
                        "value": "## Onde a falha mora de verdade\n\nNenhum destes cenários é raro ou exótico. Em qualquer sistema com tráfego real, eles acontecem toda semana:\n\n- A rede entre duas máquinas perde um pacote, ou fica lenta o suficiente pra parecer fora do ar.\n- Um serviço do qual você depende (uma réplica sua, o serviço de outro time, uma API de terceiro) trava, reinicia ou fica sobrecarregado.\n- O banco, mesmo com réplica de leitura e connection pool (módulo 3), engasga sob um pico de tráfego real, ou por uma query cara que passou despercebida (o mesmo N+1 da trilha de banco de dados, agora com volume de produção).\n- O disco enche, a memória do processo estoura, o orquestrador mata e sobe o container de novo.\n\nCada um desses eventos, sozinho, não devia derrubar o sistema inteiro. O problema é quando o código foi escrito como se eles nunca fossem acontecer."
                    },
                    {
                        "type": "text",
                        "value": "## A suposição que todo mundo carrega sem perceber\n\nEnquanto o sistema é um monólito com um banco só, chamar uma função e chamar outra parte do sistema pela rede parecem a mesma coisa: escreve-se `await algumaCoisa()` e segue em frente. Existe até uma lista conhecida na engenharia de sistemas distribuídos, chamada as falácias da computação distribuída: suposições que todo desenvolvedor tende a carregar sem perceber, até apanhar na prática. Três das mais repetidas são \"a rede é confiável\", \"a latência é zero\" e \"a largura de banda é infinita\". Nenhuma das três é verdade, e um sistema com várias réplicas, uma fila e talvez serviços separados (módulos 2 a 5) depende de rede em muito mais pontos do que um monólito com um banco só.\n\nCódigo escrito em cima dessas suposições funciona perfeitamente no ambiente de desenvolvimento, com tudo rodando local, e quebra de formas surpreendentes em produção, com rede de verdade entre as partes."
                    },
                    {
                        "type": "text",
                        "value": "## Duas perguntas diferentes\n\nDiante disso, existem duas perguntas bem diferentes que um time pode fazer. A primeira é \"como eu evito que essa dependência falhe?\", e a resposta quase sempre é que não dá: não é possível impedir que a rede tenha uma instabilidade ou que um serviço de terceiro fique fora do ar por alguns minutos. A segunda pergunta é \"o que acontece com o MEU sistema quando essa dependência falhar?\", e essa é a pergunta certa, porque a resposta está inteiramente sob seu controle.\n\nResiliência é isso: não é a promessa de nunca falhar (nenhum sistema real cumpre essa promessa), é a prática de conter a falha antes que ela vire um problema maior do que precisava ser. O resto deste módulo é um conjunto de ferramentas concretas pra essa segunda pergunta."
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que falha\", \"Exemplo do dia a dia\", \"Onde este módulo resolve\"], [\"Uma dependência trava e não responde\", \"Uma chamada a outro serviço nunca volta\", \"Timeout (aula 2)\"], [\"A resposta ao erro é insistir sem controle\", \"Todo mundo tentando de novo ao mesmo tempo, na hora errada\", \"Retry com backoff e jitter (aula 2)\"], [\"A dependência já era, mas o sistema insiste nela\", \"Fila de requisições presas esperando um serviço fora do ar\", \"Circuit breaker (aula 3)\"], [\"Tentar de novo duplica um efeito\", \"Cobrar o cartão do cliente duas vezes\", \"Idempotência (aula 4)\"], [\"Uma réplica ou uma zona inteira cai\", \"O servidor onde a aplicação rodava reiniciou\", \"Redundância e health check (aula 5)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um sistema resiliente não é o que nunca falha, é o que continua entregando valor quando uma parte dele falha."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que um sistema distribuído (várias réplicas, banco com réplica, cache, fila) tem mais formas de falhar do que um sistema de processo único?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque cada peça nova é também um novo ponto que pode falhar sozinho",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque bancos com réplica de leitura são sempre menos confiáveis que um banco só",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque filas de mensagens perdem dados com mais frequência que chamadas diretas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um load balancer duplica automaticamente qualquer erro da aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time testa a integração com um serviço de terceiro rodando tudo localmente, na mesma máquina, e não trata nenhum erro de rede porque \"nunca falhou nos testes\". Qual suposição perigosa esse time carrega sem perceber?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que a rede entre serviços é sempre confiável e sempre rápida",
                                "isCorrect": true
                            },
                            {
                                "text": "Que testes locais sempre encontram todos os bugs de lógica",
                                "isCorrect": false
                            },
                            {
                                "text": "Que serviços de terceiro nunca cobram por chamada de API",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o banco de dados não precisa de índice em ambiente local",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença central entre \"evitar\" uma falha de dependência e \"conter\" uma falha de dependência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Evitar está fora do seu controle; conter o efeito dela está sob seu controle",
                                "isCorrect": true
                            },
                            {
                                "text": "Evitar é sempre mais barato de implementar do que conter, em qualquer sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "Conter só se aplica a falhas de banco de dados, não a falhas de rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Evitar e conter são a mesma prática, só com nomes diferentes na literatura",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação em produção, com réplicas (módulo 2), banco com réplica de leitura (módulo 3) e fila entre serviços (módulo 4), sofre uma lentidão parcial: só uma réplica está lenta, o resto do sistema responde normalmente. Por que isso é diferente de uma falha num sistema de processo único?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Num sistema distribuído a falha é parcial; num único, é tudo ou nada",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque sistemas distribuídos nunca sofrem lentidão, só falhas completas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um sistema de processo único também tem réplicas, só que ocultas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a fila entre serviços elimina qualquer chance de lentidão parcial",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a frase \"a rede é confiável\" é chamada de falácia por quem projeta sistemas distribuídos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque tratar a rede como sempre confiável leva a código sem plano pra falha",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque redes modernas de fibra óptica realmente nunca apresentam falha",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque essa suposição só se aplica a redes sem fio, não a redes cabeadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a confiabilidade da rede é irrelevante pro desempenho do sistema",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Timeouts e retries com backoff",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Nunca espere para sempre\n\nToda chamada pra fora do seu processo, seja pro banco, pro Redis, pra fila ou pra outro serviço, tem um cliente por trás (o driver do Postgres, o cliente do Redis, uma biblioteca HTTP) que decide, por padrão, quanto tempo esperar por uma resposta. Em muitos desses clientes, o padrão de fábrica é esperar bastante tempo, às vezes sem limite nenhum. Isso é perigoso: se a dependência do outro lado está lenta ou travada, sua requisição fica presa esperando, seguindo a lentidão dela.\n\nTimeout é a decisão consciente de não deixar isso acontecer: esperar no máximo X milissegundos por essa resposta, e se ela não vier, desistir e seguir em frente com um erro tratado, não com a requisição travada."
                    },
                    {
                        "type": "text",
                        "value": "## O timeout preso é pior do que parece\n\nSem timeout, uma dependência lenta não fica só lenta pra quem chamou ela: ela prende recursos. Uma requisição parada esperando o banco segura uma conexão do pool (aquele connection pooling do módulo 3); uma requisição parada esperando outro serviço segura memória e um espaço do event loop. Com tráfego real, dezenas dessas requisições presas ao mesmo tempo esgotam o pool ou a capacidade do processo, e a lentidão de UMA dependência derruba a SUA aplicação inteira, mesmo que o resto dela estivesse saudável.\n\nO valor certo de timeout depende do que está sendo chamado: uma consulta rápida numa réplica de leitura pode ter um timeout curto, algo como 1 a 3 segundos; uma chamada a um serviço de geração de relatório, sabidamente mais lento, pode justificar um timeout maior. Não existe um número universal, existe a pergunta \"quanto tempo faz sentido esperar aqui, antes de desistir?\"."
                    },
                    {
                        "type": "code",
                        "value": "async function comRetry(operacao, opcoes = {}) {\n  const tentativas = opcoes.tentativas ?? 5;\n  const baseMs = opcoes.baseMs ?? 200;\n  const maxMs = opcoes.maxMs ?? 8000;\n\n  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {\n    try {\n      return await operacao();\n    } catch (erro) {\n      const ultimaTentativa = tentativa === tentativas;\n      if (ultimaTentativa || !erroTransitorio(erro)) {\n        throw erro;\n      }\n\n      const espera = Math.min(maxMs, baseMs * 2 ** (tentativa - 1));\n      const comJitter = Math.random() * espera;\n      await new Promise((resolve) => setTimeout(resolve, comJitter));\n    }\n  }\n}\n\nfunction erroTransitorio(erro) {\n  return erro.codigo === 'ETIMEDOUT' || erro.status === 503;\n}\n\n// uso: buscar o pedido no serviço de pagamentos, com timeout e retry\nconst pedido = await comRetry(() =>\n  axios.get('http://pagamentos:3000/pedidos/42', { timeout: 2000 }),\n);"
                    },
                    {
                        "type": "text",
                        "value": "## O retry ingênuo piora a crise\n\nRetry sem cuidado pode ser pior do que não ter retry nenhum. Imagine uma dependência já sofrendo sob carga alta, respondendo devagar. Se cada uma das suas réplicas (módulo 2), ao levar timeout, tenta de novo imediatamente, e de novo, e de novo, o volume de requisições batendo nessa dependência aumenta justamente no momento em que ela tem menos capacidade de aguentar. Esse efeito tem nome, tempestade de retry, e já derrubou dependências que ainda estavam de pé, só lentas.\n\nDuas técnicas contêm isso. Backoff exponencial espaça as tentativas cada vez mais (200ms, depois 400ms, depois 800ms), dando tempo pra dependência se recuperar em vez de apanhar sem parar. Jitter, um componente aleatório somado ao tempo de espera, evita que múltiplas réplicas que erraram no mesmo instante voltem a tentar todas juntas de novo, sincronizadas numa nova onda."
                    },
                    {
                        "type": "text",
                        "value": "## Nem todo erro merece uma segunda tentativa\n\nRetry só faz sentido pra falhas prováveis de serem passageiras: um timeout, uma conexão recusada, um 503 (serviço indisponível). Um erro 400 (requisição inválida) ou 404 (recurso não existe) não vai virar sucesso na segunda tentativa, porque o problema não é passageiro, é estrutural; insistir nesses casos só desperdiça tempo e recursos. Vale também limitar o número de tentativas, já que um retry sem limite é só um jeito lento de nunca desistir.\n\nUma ressalva importa mais que as outras: só é seguro repetir automaticamente uma operação que pode rodar mais de uma vez sem duplicar efeito colateral, tema da aula 4 desta trilha."
                    },
                    {
                        "type": "quote",
                        "value": "Timeout é admitir que uma dependência pode estar lenta. Retry com backoff é insistir sem piorar a vida de quem já está sofrendo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a função de um timeout numa chamada a outra dependência (banco, cache, outro serviço)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Limitar quanto tempo a chamada espera por resposta antes de desistir",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar automaticamente a capacidade da dependência que está lenta",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloquear novas tentativas de chamada até a dependência voltar ao ar",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter qualquer erro de rede numa resposta de sucesso simulada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota chama um serviço de pagamentos que está respondendo devagar sob carga alta. Cada réplica da aplicação, ao levar timeout, tenta de novo na hora, sem nenhum espaçamento. Qual é o risco mais provável dessa estratégia?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar ainda mais a carga sobre o serviço de pagamentos, piorando a crise",
                                "isCorrect": true
                            },
                            {
                                "text": "Fazer o serviço de pagamentos responder mais rápido por receber mais chamadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de conexões abertas no pool da própria aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Forçar o serviço de pagamentos a reiniciar automaticamente sozinho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que backoff exponencial normalmente vem acompanhado de jitter, um componente aleatório no tempo de espera?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sem jitter, réplicas que falharam juntas tendem a tentar de novo juntas",
                                "isCorrect": true
                            },
                            {
                                "text": "Jitter reduz o número total de tentativas que o sistema pode realizar",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem jitter, o backoff exponencial deixa de crescer a cada nova tentativa",
                                "isCorrect": false
                            },
                            {
                                "text": "Jitter garante que a dependência chamada nunca mais vai falhar de novo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API externa responde com HTTP 400 (dados inválidos no corpo da requisição). O cliente HTTP da aplicação está configurado pra tentar de novo automaticamente, com backoff, em qualquer erro. O que essa configuração provavelmente vai causar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Tentativas repetidas sem sentido, já que o erro é estrutural, não passageiro",
                                "isCorrect": true
                            },
                            {
                                "text": "A correção automática do corpo da requisição a cada nova tentativa",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tempo de resposta cada vez menor a cada nova tentativa malsucedida",
                                "isCorrect": false
                            },
                            {
                                "text": "A troca automática do endpoint por uma versão que aceite os dados originais",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota crítica consulta a réplica de leitura do banco (módulo 3) e precisa responder rápido; outra rota, interna, gera um relatório pesado uma vez por dia. Qual abordagem de timeout faz mais sentido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Timeouts diferentes: curto na rota crítica, mais longo no relatório pesado",
                                "isCorrect": true
                            },
                            {
                                "text": "O mesmo timeout fixo nas duas rotas, pra manter o comportamento previsível",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum timeout no relatório, já que relatórios não devem ser interrompidos",
                                "isCorrect": false
                            },
                            {
                                "text": "Timeout maior na rota crítica, já que o usuário pode esperar um pouco mais",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Circuit breaker",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quando insistir vira parte do problema\n\nRetry com backoff (aula 2) resolve bem uma falha passageira: uma rede que engasgou por um segundo, uma dependência que teve um pico rápido de lentidão. Mas existe um cenário diferente, também comum: a dependência não está tendo um mau momento, ela está fora do ar de verdade, por minutos, enquanto reinicia, faz deploy ou se recupera de uma sobrecarga.\n\nNesse cenário, retry com backoff ainda assim continua tentando, só que mais espaçado. Cada tentativa espera o timeout de novo antes de desistir, o que significa que cada requisição do usuário fica presa alguns segundos até falhar de novo. Multiplique isso pelo volume normal de tráfego e o resultado é o mesmo de antes: recursos presos, réplicas (módulo 2) engasgadas, tudo isso batendo numa dependência que, no fundo, você já sabe que vai falhar de novo."
                    },
                    {
                        "type": "text",
                        "value": "## A ideia: um disjuntor pra chamadas de rede\n\nO nome vem da eletricidade: um disjuntor (circuit breaker) desarma antes que a sobrecarga queime a fiação, e alguém precisa ligá-lo de novo depois. A versão de software faz algo parecido, na frente de uma chamada arriscada (a um serviço, ao banco, a uma API externa): ela conta as falhas recentes, e quando esse número cruza um limite, abre o circuito.\n\nCom o circuito aberto, a aplicação para de sequer tentar chamar a dependência: qualquer chamada falha na hora, sem esperar timeout, sem gastar uma conexão, sem bater de novo em quem já está sofrendo. Depois de um tempo de espera, o circuit breaker deixa passar uma tentativa de teste pra ver se a dependência já voltou; se voltou, o circuito fecha de novo e o tráfego normal volta."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estado\", \"O que acontece\", \"Quando muda de estado\"], [\"Fechado\", \"As chamadas passam normalmente; o breaker só conta falhas e sucessos\", \"Depois de N falhas seguidas (ou uma taxa de erro alta), abre\"], [\"Aberto\", \"As chamadas falham na hora, sem nem tentar a dependência\", \"Depois de um tempo de espera configurado, passa a meio-aberto\"], [\"Meio-aberto\", \"Deixa passar um número pequeno de chamadas de teste\", \"Se as chamadas de teste funcionam, fecha de novo; se falham, volta a abrir\"]]"
                    },
                    {
                        "type": "code",
                        "value": "class CircuitBreaker {\n  constructor(operacao, opcoes = {}) {\n    this.operacao = operacao;\n    this.limiteFalhas = opcoes.limiteFalhas ?? 5;\n    this.tempoAberto = opcoes.tempoAberto ?? 30000;\n    this.estado = 'fechado';\n    this.falhasSeguidas = 0;\n    this.abriuEm = 0;\n  }\n\n  async executar(...args) {\n    if (this.estado === 'aberto') {\n      const jaPodeTestar = Date.now() - this.abriuEm > this.tempoAberto;\n      if (!jaPodeTestar) {\n        throw new Error('circuito aberto: dependencia em recuperacao');\n      }\n      this.estado = 'meio-aberto';\n    }\n\n    try {\n      const resultado = await this.operacao(...args);\n      this.falhasSeguidas = 0;\n      this.estado = 'fechado';\n      return resultado;\n    } catch (erro) {\n      this.falhasSeguidas++;\n      if (this.estado === 'meio-aberto' || this.falhasSeguidas >= this.limiteFalhas) {\n        this.estado = 'aberto';\n        this.abriuEm = Date.now();\n      }\n      throw erro;\n    }\n  }\n}\n\nconst breakerPagamentos = new CircuitBreaker(\n  (id) => axios.get(`http://pagamentos:3000/pedidos/${id}`, { timeout: 2000 }),\n  { limiteFalhas: 5, tempoAberto: 30000 },\n);\n\n// numa rota\nconst resposta = await breakerPagamentos.executar(42);"
                    },
                    {
                        "type": "text",
                        "value": "## Falhar rápido também é proteção\n\nQuando o circuito está aberto, a aplicação falha rápido (fail fast): em vez de fazer o usuário esperar um timeout inteiro pra descobrir que a dependência não respondeu, o erro volta na hora. Isso parece pior à primeira vista, mais erros aparecendo, mas é melhor pro sistema como um todo: libera recursos que ficariam presos esperando, e dá pra decidir o que fazer com esse erro imediatamente, inclusive servir uma resposta alternativa (o fallback da próxima aula) em vez de simplesmente devolver um erro pro usuário.\n\nNa prática, ninguém precisa implementar um circuit breaker do zero toda vez, existem bibliotecas prontas pra Node com esse padrão pronto pra usar. O importante é entender o mecanismo por trás, porque as decisões de configuração (quantas falhas abrem o circuito, quanto tempo esperar) dependem do comportamento real da dependência, não de um padrão genérico."
                    },
                    {
                        "type": "quote",
                        "value": "Um circuit breaker não conserta a dependência quebrada, só impede que insistir nela quebre você também."
                    }
                ],
                "questions": [
                    {
                        "statement": "No padrão circuit breaker, o que acontece quando o circuito está no estado aberto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "As chamadas falham imediatamente, sem tentar alcançar a dependência",
                                "isCorrect": true
                            },
                            {
                                "text": "As chamadas são enfileiradas até a dependência voltar a responder",
                                "isCorrect": false
                            },
                            {
                                "text": "As chamadas passam normalmente, mas com um timeout mais curto",
                                "isCorrect": false
                            },
                            {
                                "text": "As chamadas são redirecionadas automaticamente pra uma réplica",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um tempo com o circuito aberto, o circuit breaker deixa passar um número pequeno de chamadas de teste antes de decidir se fecha ou abre de novo. Como se chama esse estado intermediário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Meio-aberto",
                                "isCorrect": true
                            },
                            {
                                "text": "Fechado",
                                "isCorrect": false
                            },
                            {
                                "text": "Aberto",
                                "isCorrect": false
                            },
                            {
                                "text": "Intermitente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um circuit breaker está configurado com limite de 5 falhas seguidas pra abrir. Depois de 3 falhas seguidas, a próxima chamada tem sucesso. O que o breaker faz com a contagem de falhas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Zera a contagem de falhas seguidas, porque a chamada teve sucesso",
                                "isCorrect": true
                            },
                            {
                                "text": "Mantém a contagem em 3, esperando mais falhas antes de zerar",
                                "isCorrect": false
                            },
                            {
                                "text": "Abre o circuito mesmo assim, porque já passou de metade do limite",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduz a contagem pela metade, arredondando pra baixo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe configura um circuit breaker com limite de falhas bem baixo (2 falhas) e tempo de circuito aberto bem longo (10 minutos), numa dependência que tem picos curtos e normais de lentidão. Qual é o efeito mais provável dessa configuração?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O circuito abre com frequência por picos normais, bloqueando chamadas válidas",
                                "isCorrect": true
                            },
                            {
                                "text": "O circuito nunca abre, porque picos curtos não contam como falha real",
                                "isCorrect": false
                            },
                            {
                                "text": "A dependência recebe mais tráfego do que receberia sem o circuit breaker",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo de resposta das chamadas bem-sucedidas aumenta gradualmente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença central entre o que o retry com backoff (aula 2) resolve e o que o circuit breaker resolve?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Retry lida com falhas passageiras; o breaker contém uma falha persistente",
                                "isCorrect": true
                            },
                            {
                                "text": "Retry funciona só com bancos de dados; o breaker só com filas de mensagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Retry evita timeout; o breaker evita erros de validação do lado do cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "Retry é usado em produção; o breaker é usado apenas em ambiente de teste",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Idempotência, fallback e degradação graciosa",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Retry seguro depende de uma pergunta: dá pra repetir?\n\nAs aulas 2 e 3 resolveram \"o que fazer quando uma chamada falha\": esperar um tempo limite, tentar de novo com backoff, ou parar de insistir com um circuit breaker. Existe uma pergunta anterior a todas essas, e se ela não tiver resposta certa, retry vira um risco em vez de uma proteção: essa operação pode rodar mais de uma vez sem consequência?\n\nUma operação é idempotente quando executá-la uma vez ou várias vezes produz o mesmo resultado final. Consultar um produto é naturalmente idempotente, ler de novo não muda nada. Cobrar um cartão de crédito não é: cobrar duas vezes é cobrar em dobro, não é o mesmo resultado."
                    },
                    {
                        "type": "text",
                        "value": "## Onde você já viu esse problema\n\nEle não é novo nesta trilha. Lá no módulo 4, mensageria com garantia at-least-once significa exatamente isso: o broker garante que a mensagem chega pelo menos uma vez, o que inclui a possibilidade dela chegar duas. Um consumidor que processa a mesma mensagem duas vezes sem cuidado gera o efeito em dobro. E antes disso, na trilha de cache, filas e performance, um worker do BullMQ podia reprocessar um job por causa de um retry configurado ou de uma falha no meio do processamento, e a saída era a mesma: usar uma chave de idempotência pra garantir que cobrar o cartão ou mandar o email acontecesse uma vez só, não importa quantas vezes o job rodasse.\n\nRetry síncrono (aulas 2 e 3) é o mesmo problema com outra roupa: se a resposta de sucesso se perde na volta, a operação funcionou mas o timeout disparou antes da resposta chegar, o cliente tenta de novo sem saber que já tinha dado certo."
                    },
                    {
                        "type": "text",
                        "value": "## Como conseguir idempotência na prática\n\nDuas estratégias comuns, que se complementam:\n\n- Desenhar a operação pra ser naturalmente idempotente: um UPDATE que define `status = 'pago'` pode rodar dez vezes com o mesmo resultado; um UPDATE que faz `saldo = saldo + valor` não pode, porque cada execução soma de novo.\n- Usar uma chave de idempotência: o cliente gera um identificador único pra aquela operação específica (por exemplo, o id do pedido) e envia junto da requisição. O servidor guarda, junto do resultado, quais chaves já processou; se a mesma chave chegar de novo, ele devolve o resultado salvo sem repetir o efeito colateral.\n\nA segunda estratégia é a mais geral: funciona mesmo quando a operação, por natureza, não seria idempotente sozinha, como cobrar um cartão ou criar um pedido novo."
                    },
                    {
                        "type": "text",
                        "value": "## Degradação graciosa: servir algo em vez de nada\n\nIdempotência resolve o retry. Existe outro tipo de situação: a dependência está fora do ar ou lenta demais agora, e o usuário está esperando uma resposta neste segundo. Tentar de novo não ajuda se o problema não é passageiro, e um circuit breaker aberto só garante que a falha vai ser rápida, não que vai existir uma resposta boa pra dar.\n\nDegradação graciosa é a prática de, nesses casos, responder com alguma coisa útil em vez de um erro completo. Nem sempre dá pra fazer isso, algumas respostas exigem o dado certo na hora certa, mas quando dá, o usuário prefere uma resposta um pouco desatualizada a uma tela de erro."
                    },
                    {
                        "type": "code",
                        "value": "// db e redis já configurados, como nos módulos anteriores\nasync function buscarProduto(id) {\n  const chave = `produto:${id}`;\n\n  const doCache = await redis.get(chave);\n  if (doCache) return JSON.parse(doCache);\n\n  try {\n    const produto = await db.query('SELECT * FROM produtos WHERE id = $1', [id]);\n    await redis.set(chave, JSON.stringify(produto), 'EX', 300);\n    await redis.set(`${chave}:ultimo_bom`, JSON.stringify(produto));\n    return produto;\n  } catch (erro) {\n    const stale = await redis.get(`${chave}:ultimo_bom`);\n    if (stale) {\n      return { ...JSON.parse(stale), degradado: true };\n    }\n    throw erro;\n  }\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Onde vale a pena degradar, e onde não vale\n\nDado velho no lugar de erro funciona bem pra leitura: o preço ou a descrição de um produto de alguns minutos atrás raramente faz diferença prática. Não funciona pra tudo. Confirmar um pagamento, atualizar um estoque ou qualquer operação de escrita não tem uma versão \"meio certa\": ou aconteceu, ou não aconteceu, e fingir que aconteceu é pior do que mostrar um erro claro.\n\nA regra prática separa por criticidade: caminhos de leitura, sem consequência séria em mostrar algo levemente desatualizado, são bons candidatos a fallback. Caminhos de escrita, principalmente os que envolvem dinheiro ou dados que não podem ficar inconsistentes, devem falhar de forma clara em vez de degradar."
                    },
                    {
                        "type": "quote",
                        "value": "Idempotência torna o retry seguro. Degradação graciosa torna a falha suportável. Nenhuma das duas finge que o problema não aconteceu."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que uma operação é idempotente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Executá-la uma vez ou várias vezes produz o mesmo resultado final",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela nunca pode falhar, independente da dependência que chama",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela é processada em segundo plano, fora do ciclo da requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela sempre responde mais rápido que uma operação equivalente síncrona",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No módulo 4 desta trilha, mensageria com garantia at-least-once significa que uma mensagem pode chegar mais de uma vez ao consumidor. Por que isso torna a idempotência do consumidor obrigatória, não opcional?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sem idempotência, processar a mesma mensagem duas vezes duplica o efeito",
                                "isCorrect": true
                            },
                            {
                                "text": "Sem idempotência, o broker rejeita mensagens repetidas automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem idempotência, a fila trava e para de entregar novas mensagens",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem idempotência, o consumidor perde a mensagem original definitivamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota de pagamento usa uma chave de idempotência enviada pelo cliente. A mesma chave chega duas vezes, por causa de um retry depois de um timeout. O que o servidor deve fazer na segunda chegada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Devolver o resultado já processado, sem cobrar o cartão de novo",
                                "isCorrect": true
                            },
                            {
                                "text": "Cobrar o cartão de novo e somar o valor total antes de responder",
                                "isCorrect": false
                            },
                            {
                                "text": "Rejeitar as duas chamadas, pedindo uma chave de idempotência nova",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignorar a chave e processar a chamada como uma cobrança independente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O banco fica indisponível por alguns minutos. A listagem de produtos passa a servir a última versão salva no cache Redis, mesmo vencida, marcando a resposta como degradada. A confirmação de pagamento, na mesma situação, retorna erro em vez de tentar adivinhar se o pagamento passou. Por que faz sentido tratar as duas rotas de formas diferentes?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Servir dado velho tolera erro na leitura; inventar resultado de pagamento não",
                                "isCorrect": true
                            },
                            {
                                "text": "A rota de pagamento tem prioridade menor, então pode simplesmente falhar",
                                "isCorrect": false
                            },
                            {
                                "text": "O cache Redis não consegue armazenar nenhum dado relacionado a pagamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Listagem de produtos não pode usar timeout, só a rota de pagamento pode",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma operação executa `UPDATE contas SET saldo = saldo + 100 WHERE id = 1`, disparada por uma chamada que pode ser repetida por retry. Por que essa operação especificamente é arriscada sem uma proteção extra de idempotência?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Cada execução soma 100 de novo, então repetir muda o resultado final",
                                "isCorrect": true
                            },
                            {
                                "text": "O UPDATE trava a tabela inteira até o retry ser cancelado manualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "O SQL não permite WHERE em conjunto com uma operação de soma direta",
                                "isCorrect": false
                            },
                            {
                                "text": "Retry nunca chega a repetir comandos de UPDATE, só comandos de SELECT",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Redundância, health checks e os noves",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Sem ponto único de falha\n\nUma peça da qual o sistema inteiro depende, existindo numa cópia só, é um ponto único de falha: se ela cai, tudo cai com ela, não importa quão bem pensado seja o resto da arquitetura. Redundância é ter mais de uma cópia de qualquer peça crítica, de um jeito que perder uma não tire o sistema do ar.\n\nVocê já construiu a primeira camada disso no módulo 2: várias réplicas da aplicação atrás de um load balancer, em vez de uma instância só, o que só funciona porque as réplicas são stateless (nada de sessão guardada na memória do processo, a mesma exigência que vem lá da trilha de autenticação). O módulo 3 estendeu a ideia pro banco, com réplica de leitura. Redundância é aplicar esse mesmo raciocínio em toda peça que, sozinha, poderia derrubar o resto."
                    },
                    {
                        "type": "text",
                        "value": "## Multi-AZ: redundância um nível acima\n\nProvedores de nuvem organizam servidores em zonas de disponibilidade, fisicamente separadas (energia, rede, às vezes até prédios diferentes) dentro da mesma região. Espalhar réplicas em mais de uma zona, uma estratégia chamada multi-AZ, protege contra um problema raro mas real: uma zona inteira ficando indisponível, algo que nenhuma quantidade de réplicas dentro da MESMA zona resolveria.\n\nA lógica é a mesma da redundância de réplicas, um nível acima: não basta ter várias cópias, elas precisam estar em lugares que não falhem todas pelo mesmo motivo ao mesmo tempo."
                    },
                    {
                        "type": "text",
                        "value": "## Health check vira uma pergunta contínua\n\nLá no estágio de CI/CD você conheceu o endpoint `/health`: depois de subir uma versão nova, o deploy conferia se ele respondia antes de considerar a entrega concluída, e vimos a diferença entre liveness (o processo está vivo?) e readiness (está pronto pra receber tráfego?). Com várias réplicas redundantes, essa pergunta deixa de ser feita uma vez só, no deploy, e passa a ser feita o tempo todo: o load balancer bate no `/health` de cada réplica em intervalos curtos, e só manda tráfego pras que respondem bem.\n\nÉ isso que faz a redundância funcionar de verdade. Ter três réplicas não adianta nada se uma delas trava silenciosamente e continua recebendo um terço das requisições; é o health check contínuo que tira essa réplica doente de circulação e redistribui o tráfego pras outras duas, sem intervenção manual."
                    },
                    {
                        "type": "code",
                        "value": "app.get('/health/vivo', (req, res) => {\n  res.status(200).json({ status: 'ok' });\n});\n\napp.get('/health/pronto', async (req, res) => {\n  try {\n    await db.query('SELECT 1');\n    await redis.ping();\n    res.status(200).json({ status: 'ok' });\n  } catch (erro) {\n    res.status(503).json({ status: 'indisponivel' });\n  }\n});"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Disponibilidade\", \"Indisponibilidade por ano\", \"Indisponibilidade por mês\"], [\"99% (dois noves)\", \"cerca de 3,65 dias\", \"cerca de 7h12min\"], [\"99,9% (três noves)\", \"cerca de 8h46min\", \"cerca de 43min\"], [\"99,95%\", \"cerca de 4h23min\", \"cerca de 22min\"], [\"99,99% (quatro noves)\", \"cerca de 53min\", \"cerca de 4min20s\"], [\"99,999% (cinco noves)\", \"cerca de 5min15s\", \"cerca de 26s\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O preço da disponibilidade, e o que fica desta trilha\n\nCada nove a mais custa caro, e não só em dinheiro. Sair de 99,9% pra 99,99% de disponibilidade não é uma questão de configuração, é uma questão de arquitetura: mais réplicas, mais zonas, health check mais rigoroso, automação de failover, e uma operação capaz de sustentar tudo isso. Vale lembrar o aviso do módulo 1 desta trilha: meça o que o sistema realmente precisa. Um painel administrativo interno não precisa de cinco noves; um sistema de pagamento crítico pode precisar. Perseguir disponibilidade além do que o negócio exige é gastar complexidade à toa, o mesmo aviso que já valia pra escalar cedo demais ou quebrar em microsserviços sem necessidade (módulo 5).\n\nCom isso fecha o conjunto de ferramentas deste módulo: timeout e retry com backoff pra falhas passageiras, circuit breaker pra falhas persistentes, idempotência e fallback pra tentar de novo e degradar com segurança, redundância e health check pra não depender de uma cópia só. Nenhuma dessas peças evita que algo falhe; juntas, elas garantem que uma falha continue sendo um incidente pequeno, não um sistema inteiro fora do ar. Essa mentalidade, mais do que uma lista de ferramentas, é o que o módulo 7 vai costurar numa arquitetura completa."
                    },
                    {
                        "type": "quote",
                        "value": "Disponibilidade não é um número que se promete, é uma arquitetura que se constrói: réplica a réplica, health check a health check, cada ponto único de falha removido de propósito."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um ponto único de falha (single point of failure)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma peça crítica que existe numa cópia só, cuja queda derruba o sistema",
                                "isCorrect": true
                            },
                            {
                                "text": "Qualquer componente que já falhou pelo menos uma vez em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de código que só acontece numa única requisição específica",
                                "isCorrect": false
                            },
                            {
                                "text": "A primeira réplica criada quando a aplicação passa a rodar em várias cópias",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um load balancer distribui tráfego entre três réplicas da aplicação. Uma delas trava, mas continua de pé, sem responder às requisições. Sem health check configurado, o que tende a acontecer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Parte das requisições continua sendo enviada pra réplica travada",
                                "isCorrect": true
                            },
                            {
                                "text": "O load balancer detecta a falha sozinho, sem depender de health check",
                                "isCorrect": false
                            },
                            {
                                "text": "As outras duas réplicas assumem automaticamente a identidade da terceira",
                                "isCorrect": false
                            },
                            {
                                "text": "O tráfego para completamente até alguém reiniciar a réplica manualmente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que réplicas precisam ser stateless (módulo 2) pra que a redundância entre elas funcione de verdade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Se o estado ficasse só numa réplica, perder essa réplica perderia o estado",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque réplicas com estado gastam mais memória do que réplicas sem estado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o load balancer só sabe distribuir tráfego pra processos stateless",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque bancos de dados relacionais não aceitam conexão de processos com estado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema roda hoje com 99% de disponibilidade e o time considera migrar pra 99,99%. Olhando a tabela de indisponibilidade por ano, qual é a leitura mais correta dessa mudança?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sai de cerca de 3,65 dias de indisponibilidade por ano pra menos de uma hora",
                                "isCorrect": true
                            },
                            {
                                "text": "Sai de cerca de 3,65 dias por ano pra exatamente zero minutos de indisponibilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "A diferença é praticamente cosmética, já que os dois arredondam pra 99%",
                                "isCorrect": false
                            },
                            {
                                "text": "Sai de cerca de 3,65 dias por ano pra cerca de 3,65 horas por ano",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que \"meça o que o sistema realmente precisa\" (módulo 1) também vale pra decidir a disponibilidade alvo, e não só pra decidir quando escalar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque mais noves exigem mais réplicas, zonas e operação, sempre com custo",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque disponibilidade é medida em requisições por segundo, não em tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um sistema com 99,99% de disponibilidade nunca pode ter réplicas extras",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a disponibilidade de um sistema não depende da arquitetura escolhida",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Juntando tudo: uma arquitetura que escala",
        "aulas": [
            {
                "titulo": "A arquitetura completa, peça por peça",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 7 - Juntando tudo: uma arquitetura que escala\n\nSeis módulos atrás, esta trilha começou com uma pergunta simples: o que fazer quando um sistema precisa aguentar mais gente, mais dado, mais requisição. Desde então você viu escala vertical e horizontal, com o aviso de medir antes de otimizar (Módulo 1); o monólito rodando em várias réplicas atrás de um load balancer (Módulo 2); o banco de dados como gargalo, com réplica de leitura e cache aliviando a carga (Módulo 3); filas e mensageria desacoplando trabalho pesado (Módulo 4); quando, e quando não, quebrar o monólito em serviços (Módulo 5); e os padrões que mantêm tudo de pé quando alguma peça falha (Módulo 6).\n\nCada módulo tratou uma peça isolada, quase sempre a partir do mesmo back-end Node.js, com Postgres, Redis e filas, que você vem carregando desde trilhas anteriores. Chegou a hora de montar o quebra-cabeça inteiro: pegar cada peça e ver exatamente onde ela se encaixa numa arquitetura real, coesa, pensada pra aguentar carga de verdade. Esta aula faz esse passeio."
                    },
                    {
                        "type": "text",
                        "value": "## O caminho de uma requisição\n\nImagina uma requisição saindo de um navegador ou de um app mobile. Antes de tocar em qualquer servidor seu, ela passa por uma primeira bifurcação: é um arquivo estático (o JavaScript do front-end, uma imagem, uma fonte) ou é uma chamada dinâmica pra API?\n\nSe for estático, o ideal é ela nem chegar perto da sua aplicação. Um **CDN** (Content Delivery Network, serviços como Cloudflare ou o CloudFront da AWS) guarda cópias desses arquivos em servidores espalhados geograficamente, e entrega ao usuário a partir do ponto mais próximo dele. Mais rápido pro usuário, e uma requisição a menos pra sua aplicação processar.\n\nSe for dinâmico (criar um pedido, consultar um perfil, qualquer coisa que dependa da sua lógica de negócio e do seu banco), a requisição chega no primeiro componente da infraestrutura da aplicação: o **load balancer**."
                    },
                    {
                        "type": "text",
                        "value": "## Load balancer e réplicas stateless\n\nO load balancer (nginx, HAProxy, ou o balanceador de um provedor de nuvem) recebe a requisição num único endereço e escolhe pra qual réplica da aplicação mandar. Atrás dele não tem uma instância do monólito: tem várias, idênticas, subindo e descendo conforme a demanda (Módulo 2). Ele também é quem bate periodicamente no endpoint de health check de cada réplica, aquele `/health` que a trilha de CI/CD e Cloud apresentou, pra saber quais estão saudáveis.\n\nIsso só funciona porque essas réplicas são **stateless**. Nenhuma delas guarda, na própria memória, algo que a próxima requisição do mesmo usuário vai precisar. A sessão de login não fica numa variável local: ou vira um JWT auto-contido que qualquer réplica valida sozinha, ou vai pro Redis, visível por todas ao mesmo tempo (retomando a trilha de Autenticação). Caia a requisição em qual réplica for, o resultado é o mesmo."
                    },
                    {
                        "type": "code",
                        "value": "CLIENTES (navegador, app mobile)\n  |\n  +-- arquivo estático (JS, CSS, imagem) --------> [ CDN ]\n  |                                                (Cloudflare, CloudFront)\n  +-- requisição dinâmica (API, HTML)\n         |\n         v\n    [ LOAD BALANCER ]   nginx / HAProxy, distribui e confere /health\n         |\n         +----------------+----------------+\n         v                v                v\n     [ App 1 ]        [ App 2 ]        [ App 3 ]\n        réplicas stateless do monólito (sessão no Redis, nunca em memória local)\n         |                |                |\n         +----------------+----------------+\n                          |\n          +---------------+---------------------------+\n          v               v                           v\n    [   Redis   ]  [    Fila    ]           [ Postgres primário ]\n    cache, sessão, RabbitMQ / Kafka          (escrita)\n    rate limit            |                           |\n                           v                      replicação\n                    [  Workers  ]                      |\n                relatório, e-mail,                     v\n                processa imagem              [ Postgres réplica ]\n                                                  (leitura)"
                    },
                    {
                        "type": "text",
                        "value": "## As três válvulas de alívio: cache, fila e banco\n\nDepois do load balancer, cada réplica da aplicação depende de três outras peças pra não travar sob carga.\n\nO **cache** (Redis, na frente das leituras mais pedidas) evita bater no banco toda vez que alguém pede o mesmo dado que não mudou (Módulo 3, e a trilha de Cache, Filas e Performance). Uma listagem de produtos, um perfil de usuário, qualquer leitura cara e repetida é candidata.\n\nA **fila** (RabbitMQ, Kafka, ou o próprio Redis fazendo esse papel) tira da requisição qualquer trabalho que não precisa de resposta imediata: gerar um relatório, enviar um e-mail, processar uma imagem. A aplicação publica uma mensagem e responde ao cliente na hora; um **worker**, separado, consome a fila no seu próprio ritmo (Módulo 4).\n\nE o **banco**, mesmo aliviado por cache e fila, continua recebendo toda escrita e uma fatia de leitura. Separar leitura de escrita com uma **réplica de leitura** tira do banco primário boa parte do tráfego de consulta, deixando ele focado no que só ele pode fazer: escrever (Módulo 3)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Peça\", \"Problema que resolve\", \"Onde você viu isso antes\"], [\"CDN\", \"Tráfego de arquivo estático sobrecarregando a aplicação\", \"Esta aula, o próximo degrau depois do que veio antes\"], [\"Load balancer\", \"Distribuir requisições entre várias réplicas da aplicação\", \"Módulo 2 desta trilha\"], [\"Réplicas stateless\", \"Deixar qualquer réplica atender qualquer requisição\", \"Módulo 2, e a trilha de Autenticação (sessão fora do processo)\"], [\"Cache (Redis)\", \"Evitar repetir uma leitura cara no banco\", \"Módulo 3, e a trilha de Cache, Filas e Performance\"], [\"Fila e workers\", \"Tirar trabalho pesado de dentro da requisição\", \"Módulo 4, e a trilha de Cache, Filas e Performance\"], [\"Réplica de leitura\", \"Separar leitura de escrita quando o banco satura\", \"Módulo 3 desta trilha\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Nenhuma dessas peças existe sozinha. Uma arquitetura que escala não é a soma das peças: é o jeito como elas se protegem umas às outras."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza uma réplica stateless da aplicação, rodando atrás de um load balancer?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Não guarda, na memória local, dado que outra requisição use",
                                "isCorrect": true
                            },
                            {
                                "text": "Guarda a sessão do usuário numa variável local por pouco tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Só executa operações de leitura, nunca grava nada no banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Depende de sempre atender o mesmo usuário em toda requisição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa arquitetura com CDN, load balancer, réplicas, cache, fila e réplica de leitura, um usuário pede uma página com HTML dinâmico e um arquivo CSS. Qual componente atende o CSS, sem envolver o load balancer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O CDN, que guarda e entrega arquivos estáticos direto",
                                "isCorrect": true
                            },
                            {
                                "text": "O worker, que processa o CSS antes de responder",
                                "isCorrect": false
                            },
                            {
                                "text": "A réplica de leitura, feita pra esse tipo de arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis, que guarda arquivos estáticos por padrão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa arquitetura já com load balancer e réplicas, por que ainda vale colocar a geração de um relatório pesado numa fila, em vez de processar direto dentro da requisição que o usuário disparou?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque isso evita prender uma réplica inteira numa tarefa lenta",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque filas são sempre mais rápidas que qualquer processamento direto",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o load balancer recusa requisições acima de um segundo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque réplicas stateless não conseguem rodar tarefas mais longas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa arquitetura com load balancer, cache Redis e fila com workers, uma rota de checkout ainda demora muito porque grava o pedido no banco e processa o pagamento de forma síncrona, dentro da mesma requisição. Qual mudança ataca essa lentidão diretamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Publicar o processamento do pagamento numa fila e responder antes",
                                "isCorrect": true
                            },
                            {
                                "text": "Adicionar mais réplicas de leitura ao banco de dados primário",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o TTL do cache Redis usado nas rotas de leitura",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o load balancer por um com outro algoritmo de distribuição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na arquitetura completa desta aula, por que o worker que consome a fila não fica atrás do load balancer, junto com as réplicas da aplicação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque ele não atende requisição HTTP direta de nenhum cliente",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque workers não têm permissão de se conectar ao banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o load balancer só aceita, no máximo, três instâncias registradas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque filas exigem um load balancer dedicado, separado do da API",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Observabilidade em escala",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que observabilidade fica mais difícil em escala\n\nNuma aplicação de instância única, debugar era simples: olhar o terminal, ver o log, achar o erro. Com várias réplicas, um worker separado, um banco com réplica, cada peça gera seu próprio log e sua própria métrica, isoladamente. Sem juntar tudo, um problema vira caça ao tesouro: em qual das cinco réplicas caiu a requisição que falhou? O erro veio da API ou do worker? A lentidão é do banco primário ou da réplica?\n\nObservabilidade em escala é justamente responder essas perguntas sem precisar adivinhar. Retomando o que a trilha de CI/CD e Cloud já apresentou (logs, health check, métricas e alertas), esta aula estica esse mesmo assunto pra um sistema com várias peças conversando entre si."
                    },
                    {
                        "type": "text",
                        "value": "## Logs centralizados e correlação\n\nLog estruturado e nível de log (info, warn, error) já eram assunto lá na trilha de CI/CD. Em escala, log só ajuda de verdade se estiver centralizado (um agregador como a stack ELK, o Grafana Loki, ou um serviço gerenciado tipo Datadog, já citados naquela trilha) e se der pra correlacionar entre serviços.\n\nÉ aí que entra o **id de correlação** (ou `requestId`): um identificador único, gerado assim que a requisição entra no sistema, e propagado por todo lugar que ela toca, a réplica da API, a mensagem publicada na fila, o worker que processa. Sem esse id amarrando tudo, juntar as pontas de uma falha que atravessa vários processos é praticamente impossível."
                    },
                    {
                        "type": "code",
                        "value": "// middleware que gera (ou propaga) um id de correlacao por requisicao\nconst { randomUUID } = require('crypto');\n\napp.use((req, res, next) => {\n  req.requestId = req.headers['x-request-id'] || randomUUID();\n  res.setHeader('x-request-id', req.requestId);\n  next();\n});\n\napp.post('/relatorios', async (req, res) => {\n  logger.info('relatorio solicitado', { requestId: req.requestId });\n\n  await fila.publicar('gerar-relatorio', {\n    usuarioId: req.usuario.id,\n    requestId: req.requestId, // o worker loga com o mesmo id\n  });\n\n  res.status(202).json({ status: 'processando' });\n});\n\n// do outro lado da fila, o worker usa o mesmo id:\nworker.on('gerar-relatorio', async (job) => {\n  logger.info('worker iniciando job', { requestId: job.requestId });\n  // ...\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Distributed tracing, por cima\n\nO id de correlação já ajuda bastante, mas numa arquitetura com vários saltos (API, fila, worker, uma chamada externa) fica difícil enxergar quanto tempo cada salto consumiu, só olhando log. **Distributed tracing** é o próximo degrau: cada salto vira um **span**, com início, fim e duração, e todos os spans de uma mesma requisição ficam amarrados por um **trace id** (a mesma ideia do id de correlação, formalizada). O resultado é uma linha do tempo visual mostrando exatamente onde o tempo foi gasto.\n\nFerramentas como OpenTelemetry (o padrão mais comum hoje pra instrumentar isso), Jaeger e Zipkin cumprem esse papel. Fica como vocabulário por cima aqui: implementar tracing de ponta a ponta é trabalho pra depois que log e métrica já estiverem sólidos, não o primeiro passo."
                    },
                    {
                        "type": "text",
                        "value": "## Métricas e health check agregados\n\nOs quatro sinais de ouro (latência, tráfego, erros e saturação, recap da trilha de CI/CD e Cloud) continuam valendo, só que agora cada réplica expõe a própria métrica. O que importa pra decisão não é o número de uma réplica isolada: é a visão agregada, a latência p95 do serviço inteiro, a taxa de erro global, quantas réplicas estão saudáveis neste momento. Prometheus (coleta) e Grafana (visualização) são um par comum pra montar esse painel agregado.\n\nA réplica de leitura do banco ganha uma métrica que não existia com um banco único: o **atraso de replicação** (replication lag), o quanto ela está atrasada em relação ao primário. Ignorar essa métrica é arriscar servir dado desatualizado sem perceber, a consistência eventual do Módulo 3, agora visível num painel, não só um conceito."
                    },
                    {
                        "type": "text",
                        "value": "## Alertas: quando chamar alguém\n\nO cuidado de não transformar alerta em ruído, já visto na trilha de CI/CD, fica ainda mais importante em escala: agora existe uma métrica por réplica, uma por worker, uma pro banco, uma pra fila. A prática que funciona é alertar em cima do sintoma agregado que afeta o usuário (taxa de erro geral, latência p95 geral, fila crescendo sem parar), não em cada réplica isolada.\n\nE vale ter um **runbook**, o que fazer quando aquele alerta específico dispara, escrito antes da crise, não improvisado durante ela. Um alerta sem próximo passo claro só transfere a decisão pra quem está de plantão, no pior momento pra pensar com calma."
                    },
                    {
                        "type": "quote",
                        "value": "Sem observabilidade, escalar é voar às cegas: os motores continuam ligados, só que ninguém no comando sabe se estão funcionando."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a função de um id de correlação (requestId) propagado entre a API e o worker que processa uma fila?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Juntar, nos logs, tudo o que pertence à mesma requisição",
                                "isCorrect": true
                            },
                            {
                                "text": "Autenticar o worker antes de ele processar a mensagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir a ordem em que os jobs da fila são processados",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir o token JWT usado para identificar o usuário",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa arquitetura com réplica de leitura do banco, qual métrica passa a existir e merece acompanhamento, que não fazia sentido com um banco único?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O atraso de replicação (replication lag) da réplica",
                                "isCorrect": true
                            },
                            {
                                "text": "O tempo de resposta médio do load balancer principal",
                                "isCorrect": false
                            },
                            {
                                "text": "A taxa de acerto (hit rate) do cache Redis compartilhado",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de mensagens pendentes na fila de processamento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Com cinco réplicas da aplicação atrás de um load balancer, qual visão importa mais pra decidir se o serviço, como um todo, está saudável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A taxa de erro e a latência agregadas das cinco réplicas",
                                "isCorrect": true
                            },
                            {
                                "text": "O health check isolado de apenas uma réplica escolhida",
                                "isCorrect": false
                            },
                            {
                                "text": "O uso de CPU do load balancer, sem olhar as réplicas",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo de vida (uptime) da réplica mais antiga do grupo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um erro acontece em produção: a API publicou uma mensagem na fila, mas o worker nunca terminou o job. Sem log estruturado nem id de correlação compartilhado entre API e worker, o que fica difícil de fazer?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reconstruir o que houve com a requisição entre os processos",
                                "isCorrect": true
                            },
                            {
                                "text": "Reiniciar o worker manualmente até ele voltar a funcionar",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar um health check específico pra fila de jobs",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de réplicas da API pra aliviar a fila",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa arquitetura com dez réplicas, alguém configura um alerta pra disparar toda vez que uma réplica específica ultrapassa 80% de CPU por um segundo. Qual problema essa escolha tende a trazer?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ruído: picos isolados numa réplica são normais e não pedem ação",
                                "isCorrect": true
                            },
                            {
                                "text": "Segurança: réplica isolada não deveria expor métrica de CPU",
                                "isCorrect": false
                            },
                            {
                                "text": "Custo: alerta por réplica cobra mais caro que alerta agregado",
                                "isCorrect": false
                            },
                            {
                                "text": "Atraso: esse tipo de alerta demora minutos pra sequer disparar",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Custo, complexidade e evolução incremental",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Toda peça cobra um preço\n\nCDN, load balancer, réplicas, cache, fila, réplica de leitura: cada peça das últimas duas aulas resolve um problema real, mas nenhuma delas é grátis. Existe custo em dinheiro (mais servidor, mais serviço gerenciado), e existe custo em complexidade operacional: mais peça pra monitorar (Aula 2), mais peça que pode falhar (Módulo 6), mais peça que alguém no time precisa entender pra debugar às três da manhã.\n\nArquitetura não segue a lógica de \"quanto mais peça, melhor\". Segue a lógica da peça certa, no momento certo, pro problema que você de fato tem."
                    },
                    {
                        "type": "text",
                        "value": "## O que cada peça custa de verdade\n\nCache Redis exige alguém pensando em invalidação, o problema difícil que a trilha de Cache, Filas e Performance dedicou um módulo inteiro a resolver: cache mal invalidado serve dado velho sem avisar ninguém. Fila exige idempotência (Módulo 4) e alguém de olho no tamanho da fila, porque um worker lento vira uma fila crescendo sem parar. Réplica de leitura exige que a aplicação decida, em cada consulta, se pode tolerar consistência eventual, ou se aquela leitura específica precisa vir do primário.\n\nQuebrar o monólito em serviços (Módulo 5) multiplica tudo isso por N: rede entre serviços (REST, gRPC ou mensageria), deploy independente pra cada um, e observabilidade distribuída (Aula 2) virando obrigatória, não opcional. Cada peça nova não substitui a complexidade anterior: ela se soma."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Peça\", \"Custo principal\", \"Vale a pena quando...\"], [\"Réplicas + load balancer\", \"Mais servidor, exige a aplicação ser stateless\", \"CPU ou memória da instância única satura\"], [\"Cache (Redis)\", \"Invalidação errada serve dado desatualizado\", \"A mesma leitura cara se repete demais\"], [\"Fila + workers\", \"Exige idempotência e monitorar o tamanho da fila\", \"Uma tarefa lenta trava a requisição\"], [\"Réplica de leitura\", \"Consistência eventual, mais infraestrutura\", \"A leitura ainda pesa mesmo com cache\"], [\"CDN\", \"Configuração de cache na borda\", \"Arquivo estático pesa no tráfego da aplicação\"], [\"Microsserviços\", \"Rede, deploy e dados distribuídos\", \"Times e domínios não cabem mais num deploy só\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// nao e codigo de producao, e so o raciocinio em forma de checklist:\n// cada decisao apoiada num numero medido, nunca num \"vai que precisa\"\n\nfunction precisaDeCache(metricas) {\n  return metricas.leiturasRepetidas > LIMITE_REPETICAO\n      && metricas.custoDaQuery > LIMITE_ACEITAVEL;\n}\n\nfunction precisaDeMaisReplicas(metricas) {\n  return metricas.cpuMedia > 70 && metricas.latenciaP95 > META.latencia;\n}\n\nfunction precisaDeReplicaDeLeitura(metricas) {\n  return metricas.cargaDeLeituraNoBanco > LIMITE_CARGA\n      && metricas.cacheHitRate < 0.8;\n}\n\n// se a funcao correspondente nao retorna true, a peca ainda\n// nao se paga: o problema que ela resolve ainda nao apareceu"
                    },
                    {
                        "type": "text",
                        "value": "## Evoluir incremental: começar simples, crescer sob demanda\n\nA mensagem central desta aula: não construa o diagrama inteiro da Aula 1 no primeiro dia do projeto. Comece com o monólito e um banco de dados só. Adicione cada peça quando um número medido (o \"meça, não adivinhe\" do Módulo 1) mostrar que o problema que ela resolve já apareceu, não antes.\n\nIsso não é preguiça nem economia mal feita: é reconhecer que toda peça adicionada cedo demais é complexidade que o time paga todo dia, sem nenhum benefício real até o tráfego chegar lá. Um monólito simples, sem nenhuma dessas peças, aguenta muito mais tráfego do que a intuição costuma sugerir."
                    },
                    {
                        "type": "text",
                        "value": "## Uma ordem que costuma funcionar\n\nNão existe sequência universal, mas um padrão comum aparece na prática: medir antes de qualquer coisa (Módulo 1); cachear a leitura mais repetida antes de escalar a aplicação inteira; tirar trabalho pesado da requisição com fila antes de multiplicar réplicas só pra compensar lentidão; escalar horizontalmente quando o gargalo é mesmo a aplicação; separar leitura de escrita no banco quando o cache não for suficiente; e só considerar quebrar o monólito em serviços quando o problema for de time e domínio, não apenas de performance (Módulo 5).\n\nCada item dessa lista custa mais que o anterior. Pular etapas geralmente significa pagar uma complexidade que o problema atual ainda não pedia."
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta não é 'essa peça ajudaria?', quase sempre ajudaria. A pergunta é: o problema que eu tenho hoje já pede essa complexidade, ou eu estou resolvendo um problema que talvez nunca chegue?"
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo a ideia de evolução incremental desta aula, quando faz sentido adicionar uma nova peça, como cache ou réplica, à arquitetura?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quando um número medido mostra que o problema já apareceu",
                                "isCorrect": true
                            },
                            {
                                "text": "Quando outra empresa do mesmo mercado já usa essa peça",
                                "isCorrect": false
                            },
                            {
                                "text": "Assim que o projeto começa, pra não precisar mexer depois",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre que existir orçamento disponível pra mais infraestrutura",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além do custo financeiro, qual é o principal custo de adicionar uma réplica de leitura ao banco de dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Conviver com consistência eventual em parte das leituras",
                                "isCorrect": true
                            },
                            {
                                "text": "Perder a capacidade de escrever no banco principal",
                                "isCorrect": false
                            },
                            {
                                "text": "Precisar reescrever a aplicação numa linguagem diferente",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixar de precisar de índice nas consultas mais usadas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time mede a aplicação e descobre que o gargalo real, sob pico, é a CPU da aplicação, não o banco de dados. Qual decisão está mais alinhada com evolução incremental?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Adicionar réplicas da aplicação, sem mexer no banco ainda",
                                "isCorrect": true
                            },
                            {
                                "text": "Adicionar réplica de leitura, prevenindo o próximo gargalo",
                                "isCorrect": false
                            },
                            {
                                "text": "Quebrar o monólito em serviços, resolvendo os dois de uma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o banco de dados relacional por um mais rápido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe pequena, com produto ainda validando o mercado, adota de saída load balancer, cache, fila, réplica de leitura e três serviços separados. Qual é o risco mais direto dessa escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Gastar tempo de time com complexidade que o tráfego não pede",
                                "isCorrect": true
                            },
                            {
                                "text": "O sistema ficar tecnicamente incapaz de crescer no futuro",
                                "isCorrect": false
                            },
                            {
                                "text": "As peças pararem de funcionar juntas por incompatibilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "O código da aplicação deixar de rodar dentro de containers",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de medir, um time confirma que o banco satura de leitura mesmo com cache Redis bem configurado. Qual é o próximo passo mais coerente com evolução incremental, antes de considerar quebrar o monólito em serviços?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Adicionar uma réplica de leitura pra esse tráfego específico",
                                "isCorrect": true
                            },
                            {
                                "text": "Migrar direto para uma arquitetura de microsserviços completa",
                                "isCorrect": false
                            },
                            {
                                "text": "Desligar o cache, já que ele não resolveu o problema sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de réplicas stateless da aplicação",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Estudo de caso: de 100 a 1 milhão de usuários",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A mesma aplicação, crescendo de verdade\n\nPra fechar o assunto, vamos seguir uma API fictícia de pedidos, parecida com a que várias trilhas usaram como fio condutor, do dia em que ela tinha 100 usuários até o dia em que passa de 1 milhão. Nenhuma peça aparece porque \"seria legal ter\". Cada peça aparece porque um número específico mostrou que o gargalo daquele momento pedia exatamente aquilo, do jeito que a Aula 3 defendeu.\n\nNo começo: um container rodando a aplicação, um Postgres, os dois numa única VPS. Cem usuários mal fazem cócegas nisso. Tudo bem, sem gargalo, sem motivo pra mais nenhuma peça."
                    },
                    {
                        "type": "text",
                        "value": "## De 100 a 10 mil: a instância única não aguenta mais sozinha\n\nConforme o número de usuários cresce, o horário de pico começa a doer: a CPU da única instância passa a rodar perto de 100%, e a latência, que era baixa, sobe visivelmente pros usuários que caem justo nesse horário. O sintoma é claro: uma máquina só, não importa o quanto otimizada, tem teto.\n\nA resposta é escalar horizontalmente: subir várias réplicas da aplicação atrás de um load balancer (Módulo 2). Isso só funciona depois de garantir que a aplicação é stateless: a sessão de login, que talvez ainda estivesse numa variável local, migra pro Redis ou vira JWT (retomando a trilha de Autenticação). Sem esse passo primeiro, a segunda réplica já nasce quebrada."
                    },
                    {
                        "type": "text",
                        "value": "## De 10 mil a 100 mil: o banco sente as duas frentes\n\nCom várias réplicas no ar, o próximo gargalo migra pro banco, por dois motivos diferentes ao mesmo tempo. Primeiro, uma tela de listagem bem popular (o catálogo de produtos, por exemplo) bate no banco com a mesma consulta, repetida, milhares de vezes por minuto: a resposta certa é cache Redis na frente dessa leitura específica (Módulo 3, cache-aside). Segundo, uma ação do usuário, como gerar um relatório ou processar uma imagem, trava a requisição por vários segundos: a resposta certa é tirar esse trabalho da requisição com fila e workers, respondendo na hora e processando depois (Módulo 4).\n\nCache resolve leitura repetida. Fila resolve trabalho lento. São gargalos diferentes, com peças diferentes, mesmo aparecendo perto um do outro nessa fase."
                    },
                    {
                        "type": "text",
                        "value": "## De 100 mil a 1 milhão: o que sobra depois de cache e fila\n\nMesmo com cache bem configurado, uma fatia de leitura continua batendo direto no banco: relatórios e buscas variadas, que mudam a cada consulta e não cabem bem num cache. Essa fatia cresce junto com o volume de usuários, até virar gargalo de novo. A resposta é uma réplica de leitura, tirando esse tráfego do banco primário (Módulo 3). Ao mesmo tempo, o volume de arquivo estático (JavaScript, imagem, CSS) também cresce, e uma fração grande do tráfego da aplicação vira só isso: a resposta é um CDN, tirando esse tráfego da aplicação inteira (Aula 1).\n\nNesse ponto, com réplicas, cache, fila, réplica de leitura e CDN já em produção, vale um aviso honesto: quebrar o monólito em serviços não é o próximo passo automático. Um monólito bem escalado, com essas peças no lugar certo, aguenta muito mais do que a intuição sugere. Só vale considerar quebrar em serviços se o problema virar de time e domínio (times pisando um no pé do outro, deploys travando uns aos outros), não simplesmente porque o número de usuários passou de determinada marca (Módulo 5)."
                    },
                    {
                        "type": "code",
                        "value": "// um diario de bordo ficticio dessa aplicacao, com numeros\n// ilustrativos: o tipo de numero que justifica cada decisao\n\n// mes 3, ~800 usuarios: p95 = 180ms, CPU media 35%. sem mudanca.\n\n// mes 7, ~6 mil usuarios: p95 = 1.4s no pico, CPU media 92%.\n//   -> sobem 3 replicas atras de load balancer; sessao vai pro Redis.\n\n// mes 14, ~40 mil usuarios: 70% do tempo de banco e a mesma\n//   consulta de catalogo repetida.\n//   -> cache-aside no Redis; p95 volta pra ~190ms.\n\n// mes 16: rota de \"gerar relatorio\" prende replica inteira por ~8s.\n//   -> fila com workers; a rota responde em ~40ms e avisa depois.\n\n// mes 25, ~300 mil usuarios: banco primario com fila de leitura\n//   mesmo com cache, por causa de relatorios e buscas variadas.\n//   -> replica de leitura assume esse trafego.\n\n// mes 30, ~900 mil usuarios: ~40% do trafego e JS, CSS e imagem.\n//   -> CDN na frente; trafego na aplicacao cai quase esse tanto."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estágio (usuários)\", \"Gargalo que aparece\", \"Peça que resolve\"], [\"Cerca de 100\", \"Nenhum: uma instância aguenta tudo\", \"Nenhuma: monólito simples com um banco só\"], [\"Cerca de 1 mil a 10 mil\", \"CPU de uma instância só satura no pico\", \"Réplicas stateless atrás de um load balancer\"], [\"Cerca de 10 mil a 100 mil\", \"Banco sofre com leitura repetida e idêntica\", \"Cache Redis na frente dessa leitura\"], [\"Cerca de 10 mil a 100 mil\", \"Requisição trava numa tarefa lenta\", \"Fila com workers assíncronos\"], [\"Cerca de 100 mil a 500 mil\", \"Banco ainda pesa com leitura variada\", \"Réplica de leitura, separando leitura de escrita\"], [\"Cerca de 500 mil a 1 milhão\", \"Estático pesa no tráfego da aplicação\", \"CDN servindo os arquivos direto\"], [\"Acima de 1 milhão\", \"Times e domínios não cabem num deploy só\", \"Avaliar monólito modular ou quebra em serviços\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "De 100 a 1 milhão, nenhuma peça chegou antes do gargalo que ela resolve. É a mesma arquitetura da Aula 1, só que construída na ordem em que o tráfego de fato pediu."
                    }
                ],
                "questions": [
                    {
                        "statement": "No estudo de caso desta aula, qual é o primeiro sinal de que a aplicação com uma única instância precisa escalar horizontalmente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "CPU da instância no limite e latência subindo no pico",
                                "isCorrect": true
                            },
                            {
                                "text": "O número total de usuários cadastrados ultrapassar 100",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco de dados começar a rejeitar novas conexões",
                                "isCorrect": false
                            },
                            {
                                "text": "O time decidir, por preferência, adotar múltiplas réplicas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No estágio em que o banco sofre com leituras repetidas e idênticas, como o mesmo catálogo consultado o tempo todo, qual peça ataca esse gargalo primeiro, antes de pensar em réplica de leitura?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cache Redis na frente dessa leitura específica",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma réplica de leitura dedicada só a esse catálogo",
                                "isCorrect": false
                            },
                            {
                                "text": "Mais réplicas da aplicação, sem mexer no banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Um índice novo em todas as colunas da tabela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a aplicação do estudo de caso precisa se tornar stateless antes, não depois, de rodar em várias réplicas atrás de um load balancer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque, sem isso, a sessão do usuário se perde ao trocar de réplica",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o load balancer só aceita aplicações sem banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque réplicas com estado consomem mais CPU que réplicas comuns",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o cache Redis exige que a aplicação já esteja sem estado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na fase em que o banco primário ainda sofre mesmo com cache bem configurado, por causa de relatórios e buscas que mudam a cada consulta, qual é a solução mais direta no estudo de caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Réplica de leitura, tirando esse tráfego do banco principal",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o TTL do cache até essas consultas caberem nele",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de réplicas da aplicação pra aliviar o banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover essas consultas de leitura para dentro da fila",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Já com réplicas, cache, fila, réplica de leitura e CDN em produção, e o produto continuando a crescer, por que o estudo de caso trata quebrar o monólito em serviços como uma decisão à parte, não como o próximo passo automático?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque esse passo resolve problema de time e domínio, não só de tráfego",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque monólitos nunca ultrapassam a marca de 1 milhão de usuários",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cache e fila deixam de funcionar corretamente nesse volume",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque, tecnicamente, não é possível somar mais réplicas depois disso",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Fechando o roadmap e os próximos passos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Sete módulos depois\n\nEsta é a última aula da trilha Arquitetura e Escala, e também a última aula do roadmap inteiro de Back-end. Antes de olhar pra frente, vale o tempo de olhar pra trás.\n\nA trilha começou perguntando por que pensar em escala, com o aviso de não otimizar cedo demais (Módulo 1). Depois mostrou o monólito escalando horizontalmente, com réplicas stateless atrás de um load balancer (Módulo 2); o banco de dados virando o primeiro gargalo real, com réplica de leitura e cache aliviando a carga (Módulo 3); comunicação assíncrona tirando trabalho pesado da requisição, com filas e workers (Módulo 4); quando, e quando não, quebrar o monólito em serviços (Módulo 5); os padrões que mantêm tudo de pé quando algo falha, porque falha é rotina em escala (Módulo 6). E este módulo, o sétimo, juntou cada uma dessas peças numa arquitetura só, com um estudo de caso mostrando o crescimento de verdade, de 100 a 1 milhão de usuários."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Módulo\", \"Tema\", \"O que resolve\"], [\"1\", \"Arquitetura e escala: o problema\", \"Quando vale pensar em escalar, e o aviso de medir antes\"], [\"2\", \"Escalar o monólito\", \"Réplicas stateless atrás de um load balancer\"], [\"3\", \"Banco de dados em escala\", \"Réplica de leitura, cache e índice tirando peso do banco\"], [\"4\", \"Comunicação assíncrona e mensageria\", \"Filas e workers desacoplando trabalho pesado\"], [\"5\", \"De monólito a serviços\", \"Quando, e se, quebrar o monólito, e o custo real disso\"], [\"6\", \"Padrões de resiliência e disponibilidade\", \"Projetar pra falha: timeout, retry, circuit breaker\"], [\"7\", \"Juntando tudo: uma arquitetura que escala\", \"Todas as peças, numa arquitetura só, do início à escala\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Dez trilhas, um roadmap\n\nEssa mesma lógica, olhar pra trás pra enxergar o caminho inteiro, vale pro roadmap de Back-end completo, não só pra esta trilha.\n\nTudo começou em Lógica de Programação: pensar em algoritmo, variável, condicional, laço, sem nenhuma API ou banco no meio ainda, só o raciocínio que sustenta qualquer código depois disso. Em seguida, Protocolos da Web ensinou como cliente e servidor conversam: HTTP, métodos, status code, e os princípios de REST que toda API decente segue. Com essa base, APIs e Frameworks colocou a mão na massa: um servidor Node.js e Express de verdade, com rotas, middleware e validação.\n\nUma API sem dado que persiste não vai longe, e foi isso que Banco de Dados resolveu: SQL, modelagem, relacionamentos, e como conectar a aplicação a um Postgres com segurança. Autenticação veio na sequência, ensinando como o back-end sabe quem é o usuário e o que ele pode fazer, de hash de senha a JWT e OAuth.\n\nCom uma API completa, persistente e autenticada, a pergunta virou: e se vier muita gente ao mesmo tempo? Cache, Filas e Performance respondeu com medição, cache no Redis e processamento assíncrono. Testes e Qualidade garantiu que esse sistema, já mais complexo, continua correto conforme o código muda. Docker e Containers empacotou a aplicação pra rodar igual em qualquer lugar. CI/CD e Cloud automatizou o caminho do código até produção, com observabilidade pra saber que ela continua no ar. E Arquitetura e Escala, esta trilha, fechou o ciclo: como todas essas peças se juntam numa arquitetura pensada pra aguentar crescer."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Trilha\", \"O que ela deu a você\"], [\"Lógica de Programação\", \"O raciocínio algorítmico por trás de qualquer código\"], [\"Protocolos da Web\", \"Como cliente e servidor conversam, e os princípios de REST\"], [\"APIs e Frameworks\", \"Sua primeira API de verdade, com rotas e middleware\"], [\"Banco de Dados\", \"Persistência com SQL, modelagem e um Postgres real\"], [\"Autenticação\", \"Saber quem é o usuário, com senha, sessão, JWT e OAuth\"], [\"Cache, Filas e Performance\", \"Medir, cachear e processar trabalho de forma assíncrona\"], [\"Testes e Qualidade\", \"Confiança de que o código continua correto ao mudar\"], [\"Docker e Containers\", \"A aplicação empacotada, rodando igual em qualquer máquina\"], [\"CI/CD e Cloud\", \"O caminho automático do código até produção, no ar\"], [\"Arquitetura e Escala\", \"Como montar tudo isso numa arquitetura que aguenta crescer\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O mapa está completo, o território muda\n\nCom essas dez trilhas, você tem o mapa completo de back-end: da lógica mais básica até uma arquitetura pensada pra escala. Isso é real, e vale reconhecer: é um caminho longo, e você percorreu ele inteiro.\n\nSó que um mapa completo não é o mesmo que conhecer cada centímetro do território. Framework novo vai surgir, uma ferramenta que hoje é padrão vai ser substituída por outra, um jeito de fazer deploy vai parecer ultrapassado daqui a alguns anos. O que não muda, e é o que esta trilha tentou deixar mais claro que as outras, são os princípios: por que medir antes de otimizar, por que separar leitura de escrita quando o banco satura, por que projetar pra falha, por que a peça certa importa mais que a peça mais nova. Aprenda a ferramenta do momento, mas guarde o princípio: ele atravessa a ferramenta."
                    },
                    {
                        "type": "text",
                        "value": "## Próximos passos\n\nTerminar o roadmap não é terminar de aprender back-end. É ganhar a base pra aprender o resto sozinho, com critério. Alguns caminhos concretos a partir daqui:\n\n- **Construa algo do zero, do seu jeito**: um projeto pessoal que passe por tudo, API com autenticação, banco modelado direito, cache e fila onde fizer sentido, testado, containerizado, com CI/CD, pensado (não necessariamente implementado por inteiro) pra escalar. É diferente de resolver exercício guiado.\n- **Aprofunde um tema por vez**: escolha o módulo que mais te interessou (banco, mensageria, resiliência) e vá além do que essa trilha cobriu. Cada um desses temas sozinho sustenta anos de estudo.\n- **Leia sobre sistemas reais**: engenharia de empresas que já passaram por esse tipo de crescimento ensina mais que qualquer exemplo fictício, porque mostra o trade-off que foi escolhido, não só a solução final.\n- **Contribua com código aberto**: ler, e mexer em, um projeto que já roda em produção, com gente de verdade revisando seu código, é um tipo de aprendizado que nenhuma trilha sozinha reproduz."
                    },
                    {
                        "type": "quote",
                        "value": "O roadmap acaba aqui. O aprendizado, não: ele só fica mais seu, sem trilha pronta, guiado pelos problemas reais que você escolher enfrentar a partir de agora."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual trilha do roadmap de Back-end vem logo antes de Arquitetura e Escala?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "CI/CD e Cloud",
                                "isCorrect": true
                            },
                            {
                                "text": "Autenticação",
                                "isCorrect": false
                            },
                            {
                                "text": "Banco de Dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Protocolos da Web",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual foi o papel da trilha Testes e Qualidade dentro do roadmap, entre Cache, Filas e Performance e Docker e Containers?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Garantir que o sistema mais complexo continue correto ao mudar",
                                "isCorrect": true
                            },
                            {
                                "text": "Ensinar a montar containers antes de empacotar a aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir a necessidade de cache e fila em sistemas pequenos",
                                "isCorrect": false
                            },
                            {
                                "text": "Automatizar o deploy da aplicação direto para produção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Segundo o fechamento desta aula, o que continua valendo mesmo quando uma ferramenta ou framework específico fica ultrapassado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os princípios por trás da decisão, como medir antes de otimizar",
                                "isCorrect": true
                            },
                            {
                                "text": "A escolha exata de banco de dados feita lá no Módulo 3 da trilha",
                                "isCorrect": false
                            },
                            {
                                "text": "A versão específica do Node.js usada ao longo de toda a trilha",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome comercial do load balancer citado nos exemplos de código",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto pessoal nasce sem autenticação, sem teste e sem containerização, mas já com cache Redis, fila e réplica de leitura configurados 'porque pode precisar um dia'. Qual princípio revisto no roadmap essa escolha mais contraria?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Adicionar complexidade antes de o problema real pedir por ela",
                                "isCorrect": true
                            },
                            {
                                "text": "Separar autenticação e autorização em camadas diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever teste automatizado antes de qualquer funcionalidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Empacotar a aplicação em container antes de fazer deploy",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que esta aula trata 'ler sobre sistemas reais' e 'contribuir em código aberto' como passos diferentes de simplesmente refazer os exercícios guiados das trilhas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque expõem trade-off e revisão real, que exercício guiado não reproduz",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque exercícios guiados não usam nenhuma tecnologia real ou atual",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque código aberto substitui a necessidade de entender fundamentos",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque sistemas reais nunca aplicam os conceitos vistos no roadmap",
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
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO })
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
