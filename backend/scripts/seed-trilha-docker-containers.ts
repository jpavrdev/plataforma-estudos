// Seed da trilha Docker e Containers (intermediario), estagio 8 do roadmap de Back-end.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-docker-containers.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Docker e Containers";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Empacote seu back-end pra rodar igual em qualquer lugar: o que são containers, Dockerfile e imagens, volumes, Docker Compose pra orquestrar app, banco e cache, imagens enxutas e seguras, e o caminho do container até o deploy. O fim do \"na minha máquina funciona\".";

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
        "titulo": "Módulo 1 - Por que containers",
        "aulas": [
            {
                "titulo": "O problema do \"na minha máquina funciona\"",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que containers existem\n\nVocê termina uma rota nova na sua API Express, os testes passam, o Postgres local responde rápido, o Redis guarda o cache certinho. Sobe pro servidor e alguma coisa quebra: um log de erro estranho, uma biblioteca que se comporta diferente, um npm install que não fecha do mesmo jeito que fechou na sua máquina.\n\nEsse é o problema clássico do \"na minha máquina funciona\". Não é frescura: é uma questão real de **ambiente**."
                    },
                    {
                        "type": "text",
                        "value": "## O que costuma mudar de uma máquina pra outra\n\nAlgumas diferenças comuns entre o seu ambiente e o do servidor:\n\n- **Versão do Node**: você desenvolve com uma versão, o servidor tem outra instalada, e alguma sintaxe ou API do runtime se comporta diferente.\n- **Versão do sistema operacional**: seu Linux ou macOS tem um conjunto de bibliotecas; a distribuição do servidor tem outro.\n- **Pacotes instalados globalmente**: aquele pacote que você instalou uma vez com npm install -g e esqueceu que não está listado no package.json.\n- **Variáveis de ambiente**: sua API espera uma DATABASE_URL configurada de um jeito; o servidor tem outra, ou nenhuma.\n- **Versão dos serviços de apoio**: o Postgres da sua máquina está numa versão, o do servidor está em outra. O Redis local tem uma configuração padrão diferente da de produção."
                    },
                    {
                        "type": "code",
                        "value": "# na sua máquina, durante o desenvolvimento\n$ node --version\nv20.11.0\n\n# no servidor, depois do deploy\n$ node --version\nv18.19.0\n\n# uma dependência que usa um recurso novo do runtime passa a falhar\n# so no servidor, mesmo com o codigo identico"
                    },
                    {
                        "type": "text",
                        "value": "## Não é só a versão do Node\n\nO mesmo tipo de divergência aparece em outras peças que você já conhece: o Postgres da trilha de banco pode estar numa versão na sua máquina e noutra no servidor; o Redis que você usa pro cache pode ter parâmetros de configuração padrão diferentes; até uma lib nativa do sistema operacional, usada por baixo dos panos por alguma dependência do Node, pode simplesmente não existir no servidor.\n\nCada uma dessas diferenças é pequena sozinha. Juntas, viram uma lista enorme de coisas pra conferir toda vez que a aplicação muda de máquina."
                    },
                    {
                        "type": "text",
                        "value": "## O jeito manual de resolver (e por que ele não escala)\n\nAntes de containers, preparar um ambiente novo era repetir um roteiro na mão: instalar o Node na versão certa, instalar o Postgres, instalar o Redis, configurar cada variável de ambiente, torcer pra nenhuma versão de dependência do sistema conflitar com outra aplicação que já rodava ali.\n\nO problema não é só saber o que instalar. É garantir que a combinação de versões seja a mesma na sua máquina, na do colega de time, no ambiente de teste e em produção. Um roteiro manual desatualiza rápido, e cada passo esquecido vira um motivo a mais pra travar o deploy."
                    },
                    {
                        "type": "quote",
                        "value": "\"Na minha máquina funciona\" é sintoma de um problema real: o ambiente não é o mesmo. É exatamente esse problema que o container resolve."
                    }
                ],
                "questions": [
                    {
                        "statement": "De forma geral, o que costuma causar o problema do \"na minha máquina funciona\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Diferenças de ambiente entre as máquinas, como a versão do Node instalada",
                                "isCorrect": true
                            },
                            {
                                "text": "Falta de testes automatizados cobrindo as rotas principais da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Uso de um editor de código diferente do usado pelo resto do time",
                                "isCorrect": false
                            },
                            {
                                "text": "Excesso de comentários explicando trechos simples do código",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é um exemplo real de diferença entre o ambiente de desenvolvimento e o servidor de produção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A versão do Postgres instalada pode divergir entre as máquinas",
                                "isCorrect": true
                            },
                            {
                                "text": "O tamanho do monitor usado por quem desenvolveu a aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome escolhido para a branch onde o código foi desenvolvido",
                                "isCorrect": false
                            },
                            {
                                "text": "A cor do tema escolhido no editor de código utilizado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sua API usa um recurso novo do Node que funciona no seu notebook. Depois do deploy, o mesmo código quebra no servidor com um erro de sintaxe não reconhecida. A causa mais provável é:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O servidor tem uma versão do Node mais antiga, que ainda não suporta esse recurso",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor está com o Postgres desatualizado em relação ao seu ambiente local",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis do servidor está configurado com uma porta diferente da esperada",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo de variáveis de ambiente do servidor não foi copiado no deploy",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar npm install -g de um pacote pra testar algo rápido, sua aplicação passou a depender dele sem perceber. No servidor, o deploy quebra porque:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O pacote não está listado no package.json nem foi instalado no servidor",
                                "isCorrect": true
                            },
                            {
                                "text": "O npm install -g só funciona em ambientes de desenvolvimento, nunca em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Pacotes globais são sempre removidos automaticamente durante qualquer deploy",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor bloqueia por padrão qualquer pacote instalado depois do primeiro deploy",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time consegue, quase sempre, manter dev, teste e produção com as mesmas versões de Node, Postgres e Redis usando só documentação e disciplina manual. O que torna essa abordagem frágil no longo prazo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Cada atualização feita manualmente numa máquina precisa ser repetida, sem erro, nas outras",
                                "isCorrect": true
                            },
                            {
                                "text": "A documentação escrita à mão nunca pode ser lida por mais de uma pessoa do time",
                                "isCorrect": false
                            },
                            {
                                "text": "Ferramentas de versionamento como o Git impedem esse tipo de sincronização entre máquinas",
                                "isCorrect": false
                            },
                            {
                                "text": "Node, Postgres e Redis não permitem versões diferentes instaladas em máquinas diferentes",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que é um container",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é, de fato, um container\n\nUm container é um **processo isolado** que roda no sistema operacional do host, carregando junto tudo que a aplicação precisa pra funcionar: o código, o runtime (o próprio Node, no caso de uma API Express), as bibliotecas do sistema e as dependências do projeto.\n\nNão é uma cópia inteira de um computador. É a sua aplicação, empacotada com tudo que ela usa, isolada do resto do sistema."
                    },
                    {
                        "type": "text",
                        "value": "## Isolado, mas no mesmo kernel\n\nPor baixo dos panos, no Linux, o Docker usa dois mecanismos do próprio sistema operacional:\n\n- **Namespaces**: isolam o que o processo enxerga, como rede, outros processos e sistema de arquivos.\n- **Cgroups**: limitam quanto de CPU e memória aquele processo pode consumir.\n\nO container usa esses dois recursos pra parecer uma \"caixinha\" isolada, mesmo rodando no mesmo kernel do host."
                    },
                    {
                        "type": "code",
                        "value": "$ docker run hello-world\n\nUnable to find image 'hello-world:latest' locally\nlatest: Pulling from library/hello-world\nStatus: Downloaded newer image for hello-world:latest\n\nHello from Docker!\nThis message shows that your installation appears to be working correctly.\n\n# o Docker nao achou a imagem hello-world na maquina local,\n# baixou do Docker Hub e rodou um container a partir dela"
                    },
                    {
                        "type": "text",
                        "value": "## Container é processo, não é sistema operacional\n\nUm jeito simples de pensar: o container é só mais um processo do Linux do host, só que isolado. Ele enxerga seu próprio sistema de arquivos, sua própria rede, seus próprios processos, mas na prática está usando o mesmo kernel que o host já tinha rodando.\n\nQuando o processo principal do container termina, o container termina junto."
                    },
                    {
                        "type": "text",
                        "value": "## A mesma imagem, o mesmo comportamento, em qualquer lugar\n\nÉ isso que resolve o problema da aula anterior: se a sua API Express roda dentro de um container com o Node, as libs e as dependências dela empacotadas junto, não importa se o host tem Node instalado, ou qual versão. O container leva o que precisa.\n\nSua máquina, a máquina do colega de time, o ambiente de teste, o servidor de produção: todos rodando o mesmo container, com o mesmo resultado."
                    },
                    {
                        "type": "quote",
                        "value": "Um container é, no fundo, um processo isolado que carrega junto tudo que a aplicação precisa pra rodar, igual, em qualquer lugar."
                    }
                ],
                "questions": [
                    {
                        "statement": "De forma simples, o que é um container?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um processo isolado que roda com suas dependências empacotadas junto",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma cópia completa de um sistema operacional rodando ao lado do host",
                                "isCorrect": false
                            },
                            {
                                "text": "Um arquivo de configuração que descreve como instalar dependências",
                                "isCorrect": false
                            },
                            {
                                "text": "Um serviço externo que hospeda o código da aplicação na nuvem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que acontece ao rodar o comando docker run hello-world numa máquina que nunca usou essa imagem antes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O Docker baixa a imagem do Docker Hub e roda um container a partir dela",
                                "isCorrect": true
                            },
                            {
                                "text": "O Docker instala o hello-world como programa permanente do sistema operacional",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker cria uma imagem nova a partir de um Dockerfile na pasta atual",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker pede confirmação antes de conectar a internet pela primeira vez",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sua API rodou dentro de um container tanto na sua máquina quanto no notebook de um colega, mesmo com versões de Node diferentes instaladas nos dois hosts. Isso acontece porque:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O container carrega consigo o próprio Node, empacotado dentro da imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "O Docker atualiza automaticamente o Node instalado em cada host",
                                "isCorrect": false
                            },
                            {
                                "text": "O container usa a rede pra baixar a versão certa do Node em tempo real",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker Hub sincroniza a versão do Node entre as duas máquinas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que um container isola do sistema operacional host, usando namespaces e cgroups?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O que o processo enxerga (rede, arquivos, processos) e quanto de CPU e memória usa",
                                "isCorrect": true
                            },
                            {
                                "text": "O hardware físico inteiro, dividido em partições exclusivas pra cada container",
                                "isCorrect": false
                            },
                            {
                                "text": "O kernel do sistema, já que cada container roda um kernel Linux só seu",
                                "isCorrect": false
                            },
                            {
                                "text": "A internet, já que containers não têm acesso à rede por padrão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você roda docker run alpine echo \"oi\". O comando imprime \"oi\" e, logo em seguida, o container para sozinho, sem nenhum comando extra. Por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O container existe enquanto o processo principal roda; quando termina, ele para",
                                "isCorrect": true
                            },
                            {
                                "text": "O Docker limita, por padrão, containers a poucos segundos de execução",
                                "isCorrect": false
                            },
                            {
                                "text": "A imagem alpine é configurada pra parar containers depois de uma saída no terminal",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando echo sempre finaliza o container em que foi executado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Container x máquina virtual",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Duas formas de isolar aplicações\n\nAntes de containers virarem populares, a forma comum de isolar aplicações num mesmo servidor físico já existia: a **máquina virtual**. Container e máquina virtual resolvem um problema parecido (isolar uma aplicação do resto) só que de jeitos bem diferentes."
                    },
                    {
                        "type": "text",
                        "value": "## Como a máquina virtual isola\n\nUma máquina virtual (VM) usa um **hypervisor** pra virtualizar o hardware e rodar, dentro dele, um sistema operacional completo, com o próprio kernel, independente do kernel do host.\n\nIsso quer dizer que cada VM carrega um sistema operacional inteiro: precisa dar boot, precisa de espaço em disco pra esse sistema todo, precisa de memória reservada pra ele funcionar, mesmo antes da aplicação em si começar a rodar."
                    },
                    {
                        "type": "text",
                        "value": "## Como o container isola\n\nO container não virtualiza um sistema operacional novo: ele compartilha o kernel do host e usa namespaces e cgroups (vistos na aula anterior) pra ficar isolado. Não existe boot de sistema operacional, porque o sistema operacional já está rodando, é o do host.\n\nO container só precisa iniciar o processo da aplicação. Por isso ele sobe muito mais rápido e ocupa muito menos espaço que uma VM."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Container\",\"Máquina virtual\"],[\"Peso\",\"Poucos MB até algumas centenas de MB\",\"Geralmente vários GB, com o sistema operacional inteiro\"],[\"Boot\",\"Segundos, só inicia um processo\",\"Minutos, precisa dar boot num sistema operacional completo\"],[\"Isolamento\",\"Compartilha o kernel do host, isolado por namespaces e cgroups\",\"Isolamento completo, cada VM roda seu próprio kernel\"],[\"Quantas por host\",\"Dezenas ou centenas, com pouco overhead\",\"Poucas, cada uma reserva CPU, memória e disco pra si\"]]"
                    },
                    {
                        "type": "code",
                        "value": "$ time docker run --rm alpine echo \"container no ar\"\ncontainer no ar\n\nreal\t0m0.412s\n\n# o comando sobe o container, roda o echo, termina o processo\n# e remove o container (--rm), tudo em menos de meio segundo"
                    },
                    {
                        "type": "text",
                        "value": "## Quando usar cada um\n\nContainer é a escolha natural quando o objetivo é rodar várias instâncias de uma aplicação, escalar rápido e usar o hardware de forma eficiente, como a sua API Express, um worker, ou um serviço de fila.\n\nMáquina virtual continua fazendo sentido quando é preciso isolamento mais forte entre cargas de diferentes clientes, ou quando é necessário rodar um kernel diferente do host (Linux e Windows, por exemplo, no mesmo servidor físico).\n\nNa prática, é comum ver os dois combinados: provedores de nuvem rodam containers dentro de VMs, somando o isolamento mais forte da VM com a leveza do container."
                    },
                    {
                        "type": "quote",
                        "value": "Container e máquina virtual isolam de formas diferentes: uma reparte o hardware inteiro entre sistemas operacionais completos, o outro reparte um único kernel de um jeito leve."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal diferença entre um container e uma máquina virtual?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O container compartilha o kernel do host; a VM virtualiza um sistema completo",
                                "isCorrect": true
                            },
                            {
                                "text": "O container só roda aplicações web; a VM roda qualquer tipo de aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "A VM sobe mais rápido, porque não depende do hardware físico do servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "O container guarda dados de forma permanente; a VM perde tudo ao reiniciar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um container costuma iniciar em segundos, enquanto uma máquina virtual pode levar minutos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O container não precisa dar boot em outro sistema, só inicia um processo",
                                "isCorrect": true
                            },
                            {
                                "text": "O container sempre usa menos memória RAM do que qualquer máquina virtual",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker pré-instala o sistema operacional inteiro durante sua instalação",
                                "isCorrect": false
                            },
                            {
                                "text": "A máquina virtual baixa uma imagem nova da internet toda vez que liga",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sua equipe precisa rodar dezenas de instâncias da API no mesmo servidor físico, aproveitando ao máximo a CPU e a memória disponíveis. Containers tendem a se sair melhor que VMs nesse cenário porque:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Compartilham o kernel do host e consomem pouco recurso extra por instância",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada container roda um kernel próprio, otimizado pro hardware disponível",
                                "isCorrect": false
                            },
                            {
                                "text": "Containers recebem prioridade automática mais alta no agendamento de CPU",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker distribui sozinho os containers entre vários servidores físicos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa precisa rodar, no mesmo servidor físico, cargas de trabalho totalmente isoladas, com kernels de sistemas operacionais diferentes entre si. A opção mais adequada nesse caso é:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Máquinas virtuais, porque cada uma leva seu próprio kernel completo",
                                "isCorrect": true
                            },
                            {
                                "text": "Containers, porque o Docker roda kernels Linux e Windows num só container",
                                "isCorrect": false
                            },
                            {
                                "text": "Containers, porque namespaces já garantem isolamento entre kernels diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Tanto faz, container e VM isolam o kernel exatamente do mesmo jeito",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em provedores de nuvem, é comum containers rodarem dentro de máquinas virtuais, e não direto no hardware físico. Isso costuma acontecer porque:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A VM soma uma camada extra de isolamento entre clientes do provedor",
                                "isCorrect": true
                            },
                            {
                                "text": "Containers não conseguem funcionar rodando direto sobre hardware físico",
                                "isCorrect": false
                            },
                            {
                                "text": "É a única forma de um container conseguir acesso à internet",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker exige um hypervisor instalado pra iniciar qualquer container",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Imagem x container",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O molde e a instância\n\nPra quem já trabalha com back-end, tem uma analogia direta: pensa numa classe e num objeto instanciado a partir dela. A **imagem** é a classe, a definição de tudo que a aplicação precisa. O **container** é o objeto, a instância rodando, com estado e ciclo de vida próprios."
                    },
                    {
                        "type": "text",
                        "value": "## O que tem dentro de uma imagem\n\nUma imagem é um pacote somente leitura: o código da aplicação, o runtime (Node, no caso de uma API Express), as bibliotecas do sistema, as dependências instaladas e o comando padrão pra iniciar tudo isso.\n\nUma vez construída, a imagem não muda. Pra alterar algo, o caminho é gerar uma imagem nova, não editar a que já existe."
                    },
                    {
                        "type": "code",
                        "value": "$ docker run -d --name web1 nginx\n$ docker run -d --name web2 nginx\n$ docker run -d --name web3 nginx\n$ docker ps\n\nCONTAINER ID   IMAGE   STATUS         NAMES\nc3f1a9e2b7d4   nginx   Up 4 seconds   web3\n9a8b7c6d5e4f   nginx   Up 7 seconds   web2\n1a2b3c4d5e6f   nginx   Up 11 seconds  web1"
                    },
                    {
                        "type": "text",
                        "value": "## Uma imagem, quantos containers forem precisos\n\nOs três comandos acima usam a mesma imagem (nginx) pra criar três containers diferentes, cada um com seu próprio nome, seu próprio processo, rodando ao mesmo tempo e de forma independente. Parar ou remover o web2 não afeta o web1, o web3, nem a imagem nginx que deu origem aos três.\n\nÉ a mesma lógica de instanciar várias vezes a partir de uma única definição."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Imagem\",\"Container\"],[\"O que é\",\"Um molde somente leitura com tudo que a aplicação precisa\",\"Uma instância em execução (ou parada), criada a partir de uma imagem\"],[\"Muda depois de pronta\",\"Não, é imutável; pra mudar, gera-se uma nova imagem\",\"Sim, tem um estado próprio enquanto existe\"],[\"Quantas a partir de uma só\",\"Uma imagem serve de base pra quantos containers forem necessários\",\"Cada container vem de exatamente uma imagem\"],[\"Onde vive\",\"Guardada localmente ou num registry, como o Docker Hub\",\"Existe como processo, criado com docker run\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Remover um container não apaga a imagem\n\nRemover um container (docker rm) tira de circulação só aquela instância: a imagem que deu origem a ele continua guardada, pronta pra criar outro container quando for preciso. Da mesma forma, gerar uma imagem nova a partir de um código atualizado não muda os containers que já estavam rodando com a imagem antiga: eles continuam do jeito que estavam até serem recriados."
                    },
                    {
                        "type": "quote",
                        "value": "A imagem é o molde, parado e imutável. O container é a instância viva, rodando a partir dele. Uma imagem, quantos containers forem precisos."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual opção descreve corretamente a diferença entre imagem e container?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Imagem é o molde imutável; container é uma instância rodando a partir dela",
                                "isCorrect": true
                            },
                            {
                                "text": "Imagem e container são dois nomes diferentes pro mesmo conceito",
                                "isCorrect": false
                            },
                            {
                                "text": "Container é o arquivo salvo em disco; imagem é o processo em execução",
                                "isCorrect": false
                            },
                            {
                                "text": "Imagem só existe depois que algum container é criado a partir dela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Rodar docker run nginx três vezes seguidas, com nomes diferentes pra cada container, resulta em:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Três containers independentes, todos criados a partir da mesma imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Três cópias separadas da imagem nginx, uma pra cada execução",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro, já que a mesma imagem não pode gerar mais de um container",
                                "isCorrect": false
                            },
                            {
                                "text": "Um único container, que reinicia sozinho a cada execução do comando",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você removeu, com o comando docker rm, um container que rodava a partir da imagem node:20. A imagem node:20 continua disponível pra criar novos containers depois?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, remover um container não afeta a imagem que deu origem a ele",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, remover o container também apaga a imagem usada por ele",
                                "isCorrect": false
                            },
                            {
                                "text": "Só continua disponível se o container tiver sido parado antes de removido",
                                "isCorrect": false
                            },
                            {
                                "text": "Só se a imagem for baixada de novo do Docker Hub logo em seguida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de alterar o código da API e gerar uma imagem nova com docker build, os containers que já estavam rodando a partir da imagem antiga:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Continuam rodando com o código antigo, sem nenhuma mudança automática",
                                "isCorrect": true
                            },
                            {
                                "text": "São atualizados sozinhos com o novo código na próxima requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Param de funcionar até serem recriados manualmente por erro de versão",
                                "isCorrect": false
                            },
                            {
                                "text": "Passam a usar a imagem nova assim que o build termina de rodar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois containers diferentes rodam a partir da mesma imagem myapp:1.0. Um deles grava um arquivo temporário no seu próprio sistema de arquivos. O que acontece com a imagem original e com o outro container?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nada muda nos dois: cada container tem seu próprio sistema de arquivos gravável",
                                "isCorrect": true
                            },
                            {
                                "text": "O arquivo aparece também no outro container, já que os dois compartilham disco",
                                "isCorrect": false
                            },
                            {
                                "text": "A imagem myapp:1.0 é alterada, afetando todo container futuro criado dela",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker bloqueia a escrita, porque a imagem já tem mais de um container",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Docker e por que containers mudaram o jogo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O Docker como ferramenta\n\n\"Container\" é um conceito do sistema operacional. **Docker** é a ferramenta que tornou esse conceito prático: um motor que constrói, roda e gerencia containers, uma linha de comando pra usar tudo isso no dia a dia, e um formato de imagem compartilhado com o Docker Hub.\n\nÉ por causa do Docker que empacotar uma aplicação em um container virou algo comum, e não um exercício acadêmico de sistemas operacionais."
                    },
                    {
                        "type": "text",
                        "value": "## Do \"na minha máquina funciona\" pro \"funciona em qualquer lugar\"\n\nVolta pro problema da primeira aula: versão de Node diferente, biblioteca de sistema diferente, variável de ambiente esquecida. Um container resolve isso porque empacota o ambiente inteiro junto com o código.\n\nA mesma imagem que roda no seu notebook roda no notebook do colega, no pipeline de teste e no servidor de produção. Não tem mais \"na minha máquina funciona\": tem uma imagem que funciona, e ponto."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\",\"Sem containers\",\"Com containers\"],[\"Preparar um servidor novo\",\"Instalar e configurar Node, Postgres, Redis e libs do sistema na mão\",\"Instalar o Docker e rodar a imagem já pronta\"],[\"Escalar a aplicação\",\"Provisionar e configurar cada máquina nova do zero\",\"Subir mais containers a partir da mesma imagem em segundos\"],[\"Onboarding de um dev novo\",\"Seguir um passo a passo manual, com risco de divergência\",\"Rodar a imagem já usada pelo resto do time\"],[\"Consistência dev/produção\",\"Os ambientes divergem aos poucos com o tempo\",\"A mesma imagem roda nos dois, sem surpresa de versão\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Escalar rápido é consequência do peso leve\n\nComo um container não precisa dar boot num sistema operacional novo (só inicia um processo, como visto na aula sobre container x VM), subir mais uma instância da API leva segundos. Precisou aguentar mais tráfego? Sobe mais um container a partir da mesma imagem, sem provisionar máquina nova do zero.\n\nEsse é o tipo de agilidade que muda o jeito de operar um back-end em produção."
                    },
                    {
                        "type": "code",
                        "value": "$ docker run node:20 node --version\nv20.11.0\n\n# nao importa a versao de Node instalada no host (ou se existe alguma):\n# o container leva a sua propria, empacotada dentro da imagem node:20"
                    },
                    {
                        "type": "text",
                        "value": "## O que vem a seguir\n\nAté aqui, tudo ficou no conceito: o que é um container, como ele se compara a uma VM, a diferença entre imagem e container. No próximo módulo a mão entra na massa: escrever um Dockerfile de verdade pra empacotar uma aplicação Node, com **FROM**, **WORKDIR**, **COPY**, **RUN** e **CMD**, e construir a primeira imagem com **docker build**."
                    },
                    {
                        "type": "quote",
                        "value": "Container não resolve só o \"funciona na minha máquina\": muda o jeito de construir, escalar e entregar software."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o papel do Docker nesse cenário de containers?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É a ferramenta que constrói, roda e compartilha containers na prática",
                                "isCorrect": true
                            },
                            {
                                "text": "É um sistema operacional novo que substitui o Linux nos servidores",
                                "isCorrect": false
                            },
                            {
                                "text": "É um serviço de nuvem que hospeda aplicações de forma automática",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma linguagem de programação usada pra escrever APIs mais rápidas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que containers ajudam a escalar uma aplicação com mais agilidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "São leves e iniciam em segundos, permitindo escalar mais rápido",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentam sozinhos a capacidade de CPU disponível no servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzem automaticamente o número de requisições que a API recebe",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminam de vez a necessidade de mais de um servidor físico",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor novo entrou no time. Com a aplicação containerizada, configurar o ambiente dele fica mais simples porque:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele só precisa instalar o Docker e usar as imagens do time",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele não precisa mais instalar nenhum programa na própria máquina",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker copia sozinho as configurações da máquina de outro colega",
                                "isCorrect": false
                            },
                            {
                                "text": "A aplicação passa a rodar direto no navegador, sem ambiente local",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A API que só funcionava na sua máquina agora roda dentro de um container e foi testada com sucesso no notebook de um colega, com sistema operacional diferente do seu. Isso é possível principalmente porque:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O container leva consigo o runtime e as dependências exatas da aplicação",
                                "isCorrect": true
                            },
                            {
                                "text": "O Docker converte sozinho o código da API pra linguagem nativa de cada SO",
                                "isCorrect": false
                            },
                            {
                                "text": "O colega precisou instalar as mesmas versões de Node e Postgres que você",
                                "isCorrect": false
                            },
                            {
                                "text": "Containers só funcionam de forma idêntica em hosts com o mesmo sistema",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de containers, era comum times manterem documentos de \"passo a passo de instalação\" pra cada ambiente novo. Com containers, esse tipo de documento perde parte da função porque:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A imagem já contém, de forma executável, o que antes era descrito em texto",
                                "isCorrect": true
                            },
                            {
                                "text": "Containers eliminam por completo a necessidade de documentar o projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker gera esse documento sozinho a partir do código da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Esse tipo de processo só existia antes das máquinas virtuais surgirem",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Sua primeira imagem: o Dockerfile",
        "aulas": [
            {
                "titulo": "O Dockerfile e suas instruções (FROM, WORKDIR, COPY, RUN, CMD)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O Dockerfile e suas instruções\n\nNo módulo passado você entendeu o que é uma imagem e o que é um container. Agora chegou a hora de criar a sua primeira imagem, e isso começa com um arquivo chamado `Dockerfile`.\n\nO Dockerfile é a receita da imagem: um arquivo de texto simples, sem extensão, com uma instrução por linha. O Docker lê essas instruções de cima pra baixo e vai montando a imagem passo a passo, camada por camada (a gente volta nisso com calma na aula 5).\n\nCada linha começa com uma instrução, escrita em maiúsculas por convenção, seguida do argumento. As mais usadas no dia a dia de uma API Node são seis: `FROM`, `WORKDIR`, `COPY`, `RUN`, `EXPOSE` e `CMD`. Com essas seis você já empacota praticamente qualquer aplicação."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Instrução\", \"O que faz\"], [\"FROM\", \"Define a imagem base que a sua imagem vai usar, por exemplo node:22\"], [\"WORKDIR\", \"Define a pasta de trabalho dentro do container pras instruções seguintes\"], [\"COPY\", \"Copia arquivos do seu projeto pra dentro da imagem sendo construída\"], [\"RUN\", \"Executa um comando durante a construção da imagem, como o npm install\"], [\"EXPOSE\", \"Documenta em qual porta a aplicação escuta dentro do container\"], [\"CMD\", \"Define o comando padrão executado quando o container é iniciado\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## FROM: de onde você parte\n\nToda imagem Docker parte de outra imagem. `FROM node:22` diz pro Docker começar com uma imagem oficial que já vem com o Node.js 22, o sistema operacional e as ferramentas básicas instaladas. É sempre a primeira instrução do Dockerfile.\n\n## WORKDIR: a pasta de trabalho\n\n`WORKDIR /app` cria (se ainda não existir) e entra na pasta `/app` dentro do container. Todas as instruções seguintes, como `COPY`, `RUN` e `CMD`, passam a valer a partir dali. Sem isso, os arquivos se espalham pela raiz do container e o Dockerfile fica mais difícil de manter."
                    },
                    {
                        "type": "text",
                        "value": "## COPY e RUN: trazendo arquivos e instalando\n\n`COPY` pega arquivos do seu projeto, a pasta onde você roda o `docker build`, e coloca dentro da imagem. `COPY package.json .` copia o `package.json` da pasta atual pro `WORKDIR` da imagem. Sem `COPY`, a imagem fica vazia, só com o sistema base do `FROM`.\n\nJá o `RUN` executa um comando enquanto a imagem está sendo construída, e o resultado fica gravado nela. `RUN npm install` instala as dependências do projeto uma vez, durante o build, e elas já ficam disponíveis na imagem pronta."
                    },
                    {
                        "type": "text",
                        "value": "## EXPOSE e CMD: a porta e o comando final\n\n`EXPOSE 3000` não abre porta nenhuma sozinho: ele só documenta que a aplicação escuta na porta 3000 dentro do container. Quem realmente libera o acesso de fora é o `-p` do `docker run`, que você vê na aula 4.\n\nJá o `CMD` define o que roda quando o container é iniciado, não quando a imagem é construída. É a diferença mais importante da aula: `RUN` roda no build (uma vez, vira parte da imagem), `CMD` roda no `docker run` (toda vez que um container novo sobe a partir dela)."
                    },
                    {
                        "type": "code",
                        "value": "FROM node:22\nWORKDIR /app\nCOPY package.json .\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]"
                    },
                    {
                        "type": "quote",
                        "value": "Um Dockerfile é uma sequência de instruções lidas de cima pra baixo: cada linha molda uma parte da imagem final."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual instrução do Dockerfile define a imagem base da qual a sua imagem vai partir?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "FROM, que define a imagem base usada como ponto de partida.",
                                "isCorrect": true
                            },
                            {
                                "text": "WORKDIR, que define a pasta de trabalho dentro do container.",
                                "isCorrect": false
                            },
                            {
                                "text": "COPY, que copia arquivos do host pra dentro da imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "CMD, que define o comando executado quando o container inicia.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a instrução WORKDIR faz num Dockerfile?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Copia os arquivos do projeto pra dentro da imagem sendo construída.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cria e define a pasta de trabalho usada pelas instruções seguintes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Executa um comando durante a construção da imagem, como o npm install.",
                                "isCorrect": false
                            },
                            {
                                "text": "Define o comando padrão executado quando o container é iniciado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Dockerfile, RUN npm install e CMD [\"npm\", \"start\"] parecem parecidos, mas rodam em momentos diferentes. Qual a diferença?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "RUN executa uma vez durante o build; CMD executa toda vez que o container inicia.",
                                "isCorrect": true
                            },
                            {
                                "text": "RUN roda toda vez que o container inicia; CMD roda uma vez durante o build da imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "RUN e CMD fazem exatamente a mesma coisa, a diferença é só de estilo de escrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "RUN só funciona dentro do WORKDIR; CMD funciona em qualquer pasta do container.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você colocou EXPOSE 3000 no Dockerfile, mas mesmo assim não conseguiu acessar a API pelo navegador depois de subir o container. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque EXPOSE só documenta a porta, quem publica é o -p do docker run.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque EXPOSE precisa ser declarado antes da instrução FROM no Dockerfile.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque EXPOSE só funciona quando o Dockerfile também define um WORKDIR.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque EXPOSE exige que o npm install já tenha instalado o express antes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que WORKDIR /app é preferível a usar RUN cd /app antes dos comandos seguintes num Dockerfile?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque cada RUN roda num processo novo e não guarda o cd pro próximo RUN.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o RUN cd /app não é um comando válido, o Dockerfile não reconhece o cd.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o WORKDIR precisa vir sempre antes do FROM pra definir a pasta certa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o RUN cd /app só funciona em imagens Linux, não em imagens baseadas em Node.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escrevendo o Dockerfile de uma API Node",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Empacotando a API Express\n\nLembra daquela API Express que você construiu nas trilhas de back-end, com rotas, alguma lógica de negócio e talvez até um banco por trás? Chegou a hora de empacotar ela numa imagem Docker, pra rodar igual no seu computador, no computador de um colega ou num servidor de produção.\n\nPra este exemplo, vamos usar uma API simples, só pra focar no Dockerfile: um `package.json` com o Express como dependência e um `server.js` que sobe um servidor na porta 3000."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"name\": \"minha-api\",\n  \"version\": \"1.0.0\",\n  \"main\": \"server.js\",\n  \"scripts\": {\n    \"start\": \"node server.js\"\n  },\n  \"dependencies\": {\n    \"express\": \"^4.19.2\"\n  }\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Planejando as instruções\n\nAntes de escrever, vale pensar no que o Dockerfile precisa fazer, na ordem certa:\n\n- Partir de uma imagem com Node.js instalado\n- Definir uma pasta de trabalho dentro do container\n- Copiar o `package.json` e instalar as dependências\n- Copiar o resto do código da aplicação\n- Documentar a porta que a API usa\n- Definir o comando que sobe o servidor\n\nRepare que copiar o `package.json` vem antes de copiar o resto do código. Isso não é acaso, é o que garante o cache de build rápido que você vê na aula 5."
                    },
                    {
                        "type": "code",
                        "value": "FROM node:22\n\nWORKDIR /app\n\nCOPY package.json .\n\nRUN npm install\n\nCOPY . .\n\nEXPOSE 3000\n\nCMD [\"npm\", \"start\"]"
                    },
                    {
                        "type": "text",
                        "value": "## Linha por linha\n\n`FROM node:22` parte da imagem oficial do Node.js na versão 22, já com o `node` e o `npm` prontos pra uso.\n\n`WORKDIR /app` define que, dali em diante, tudo acontece dentro da pasta `/app` do container.\n\n`COPY package.json .` copia só o `package.json` da sua máquina pro `WORKDIR` da imagem. O ponto (`.`) significa \"a pasta atual\", que é o `/app` definido no `WORKDIR`.\n\n`RUN npm install` lê aquele `package.json` recém copiado e instala o Express, e qualquer outra dependência, dentro da imagem."
                    },
                    {
                        "type": "text",
                        "value": "`COPY . .` agora copia todo o resto do projeto (o `server.js`, as rotas, tudo) da pasta atual do host pra pasta atual da imagem.\n\n`EXPOSE 3000` documenta que a API escuta na porta 3000 dentro do container.\n\n`CMD [\"npm\", \"start\"]` define o comando que sobe o servidor quando o container inicia. Essa é a forma \"exec\" do `CMD`, escrita como uma lista, e é a recomendada: ela roda o processo diretamente, sem passar por um shell no meio do caminho."
                    },
                    {
                        "type": "quote",
                        "value": "Um Dockerfile de API Node segue sempre o mesmo esqueleto: parte do Node, entra numa pasta, instala dependências, copia o código e define como rodar."
                    }
                ],
                "questions": [
                    {
                        "statement": "No Dockerfile da API Node, qual instrução é responsável por instalar as dependências do projeto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "RUN, que executa o npm install durante a construção da imagem.",
                                "isCorrect": true
                            },
                            {
                                "text": "COPY, que instala as dependências junto quando copia o package.json.",
                                "isCorrect": false
                            },
                            {
                                "text": "FROM, que já traz as dependências do projeto instaladas na imagem base.",
                                "isCorrect": false
                            },
                            {
                                "text": "WORKDIR, que instala as dependências na pasta de trabalho definida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que o Dockerfile builda a imagem, qual instrução decide o comando executado toda vez que um container novo sobe dela?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "CMD, definida como npm start ao final do Dockerfile.",
                                "isCorrect": true
                            },
                            {
                                "text": "RUN, definida como npm start ao final do Dockerfile.",
                                "isCorrect": false
                            },
                            {
                                "text": "COPY, definida como npm start ao final do Dockerfile.",
                                "isCorrect": false
                            },
                            {
                                "text": "EXPOSE, definida como npm start ao final do Dockerfile.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No package.json do projeto, scripts.start está definido como node server.js. No Dockerfile, isso faz o CMD [\"npm\", \"start\"] funcionar como quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como um atalho que, ao rodar, executa node server.js dentro do container.",
                                "isCorrect": true
                            },
                            {
                                "text": "Como um atalho que só funciona durante o docker build, nunca no docker run.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como um atalho que precisa ser repetido também na instrução RUN do Dockerfile.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como um atalho que substitui a necessidade de ter a instrução EXPOSE.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se você esquecer a instrução WORKDIR no Dockerfile da API, o que tende a acontecer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "COPY e RUN passam a atuar a partir da raiz do container, em vez de uma pasta própria.",
                                "isCorrect": true
                            },
                            {
                                "text": "O docker build falha de imediato, porque WORKDIR é obrigatório em todo Dockerfile.",
                                "isCorrect": false
                            },
                            {
                                "text": "O npm install para de funcionar, porque ele depende direto da instrução WORKDIR.",
                                "isCorrect": false
                            },
                            {
                                "text": "O CMD deixa de rodar quando o container inicia, mesmo estando no Dockerfile.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o Dockerfile da aula copia package.json e roda npm install antes de copiar o resto do código com COPY . . , em vez de copiar tudo de uma vez só no início?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Separar a cópia do package.json evita refazer o npm install sempre que só o código muda.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Docker não permite copiar mais de um arquivo numa única instrução COPY.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o npm install só funciona se rodar antes de qualquer instrução COPY existir.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um COPY . . logo no início ultrapassa o limite de tamanho de camada do Docker.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "docker build: construindo a imagem",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Da receita pra imagem pronta\n\nCom o Dockerfile escrito, ele ainda é só um arquivo de texto, uma receita. Pra transformar essa receita numa imagem de verdade, que pode virar um container, você usa o comando `docker build`."
                    },
                    {
                        "type": "code",
                        "value": "docker build -t minha-api .\n\n[+] Building 12.4s (10/10) FINISHED\n => [1/5] FROM docker.io/library/node:22\n => [2/5] WORKDIR /app\n => [3/5] COPY package.json .\n => [4/5] RUN npm install\n => [5/5] COPY . .\n => exporting to image\n => => naming to docker.io/library/minha-api:latest"
                    },
                    {
                        "type": "text",
                        "value": "## O -t: nomeando e taggeando a imagem\n\nSem o `-t`, a imagem é construída, mas fica só com um ID gerado automaticamente, tipo `a3f9c8e2b1d4`, difícil de lembrar e de usar depois. O `-t` (de \"tag\") dá um nome legível pra imagem.\n\n`docker build -t minha-api .` cria a imagem com o nome `minha-api` e a tag `latest` por padrão. Se quiser controlar a versão, dá pra ser explícito: `docker build -t minha-api:1.0 .` gera a mesma imagem com a tag `1.0`, o que ajuda muito quando você tem várias versões da mesma aplicação."
                    },
                    {
                        "type": "text",
                        "value": "## O ponto final: o contexto de build\n\nAquele `.` no fim do comando não é decoração, ele é o contexto de build: o caminho da pasta que o Docker vai enviar pro daemon pra construir a imagem. É dentro dessa pasta que o Docker procura o `Dockerfile` (por padrão) e é de dentro dela que instruções como `COPY . .` copiam arquivos.\n\nPor isso o `docker build` precisa ser rodado a partir da raiz do seu projeto, a pasta que contém o `Dockerfile`, o `package.json` e o código. Rodar de outro lugar faz o Docker não encontrar os arquivos esperados."
                    },
                    {
                        "type": "code",
                        "value": "docker images\n\nREPOSITORY   TAG       IMAGE ID       CREATED          SIZE\nminha-api    latest    a3f9c8e2b1d4   30 seconds ago   1.12GB"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Parte do comando\", \"O que significa\"], [\"docker build\", \"Comando que constrói uma imagem a partir de um Dockerfile\"], [\"-t minha-api\", \"Dá um nome (tag) pra imagem gerada, aqui minha-api:latest\"], [\"-t minha-api:1.0\", \"Dá um nome e uma versão específica pra imagem, aqui a tag 1.0\"], [\".\", \"O contexto de build: a pasta onde o Docker procura o Dockerfile e os arquivos\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "docker build -t minha-api . lê o Dockerfile da pasta atual e gera uma imagem chamada minha-api, pronta pra virar container."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando constrói uma imagem Docker a partir de um Dockerfile?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker build, executado na pasta que contém o Dockerfile.",
                                "isCorrect": true
                            },
                            {
                                "text": "docker run, executado na pasta que contém o Dockerfile.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker start, executado na pasta que contém o Dockerfile.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker pull, executado na pasta que contém o Dockerfile.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No comando docker build -t minha-api . , pra que serve a flag -t?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pra dar um nome (tag) à imagem que está sendo construída.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pra apontar o caminho onde o Dockerfile foi salvo no projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pra listar as camadas que serão criadas durante o build.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pra definir a porta que o container vai expor depois de pronto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você rodou docker build sem a flag -t. A imagem foi criada, mas o que aconteceu com o nome dela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ela ficou sem nome legível, identificada só por um ID gerado automaticamente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela recebeu automaticamente o nome da pasta onde está o Dockerfile.",
                                "isCorrect": false
                            },
                            {
                                "text": "O build falhou, porque a flag -t é obrigatória em todo docker build.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela recebeu automaticamente o nome latest, sem nenhum identificador extra.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Rodando docker build -t minha-api . de dentro de uma subpasta do projeto, sem o Dockerfile ali, o que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Docker não encontra o Dockerfile esperado ali e o build falha.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Docker sobe automaticamente até achar o Dockerfile na pasta certa.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker usa o último Dockerfile que foi construído com sucesso antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker cria um Dockerfile vazio automaticamente pra completar o build.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de docker build -t minha-api:1.0 . e, mais tarde, docker build -t minha-api:2.0 . a partir do mesmo Dockerfile, o que acontece com a imagem minha-api:1.0?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ela continua existindo normalmente, como uma tag separada de 2.0.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela é apagada automaticamente, porque só a tag mais nova pode existir.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela é renomeada automaticamente de 1.0 pra 2.0, sem manter as duas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela para de funcionar no docker run, só a mais nova pode rodar.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "docker run e o mapeamento de portas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Tirando a imagem do papel\n\nUma imagem parada não faz nada por conta própria, ela é só o molde. Pra ela virar um processo rodando de verdade, um container, você usa o `docker run`. E como a API escuta numa porta lá dentro do container, esse é o momento de aprender a mapear portas."
                    },
                    {
                        "type": "code",
                        "value": "docker run -p 3000:3000 minha-api\n\n> minha-api@1.0.0 start\n> node server.js\n\nServidor rodando na porta 3000"
                    },
                    {
                        "type": "text",
                        "value": "## Por que mapear a porta\n\nCada container roda isolado, com sua própria rede. Mesmo que o `server.js` esteja escutando na porta 3000 dentro do container, essa porta não fica automaticamente acessível no seu computador (o host). Sem mapear, a API está rodando, mas inacessível de fora.\n\nÉ pra isso que serve o `-p` (de \"publish\"): ele conecta uma porta do host a uma porta do container, criando um caminho de fora pra dentro."
                    },
                    {
                        "type": "text",
                        "value": "## Host:container, a ordem importa\n\nA sintaxe é sempre `-p porta_do_host:porta_do_container`. Em `docker run -p 3000:3000 minha-api`, a porta 3000 da sua máquina passa a apontar pra porta 3000 do container.\n\nAs duas portas não precisam ser iguais. `docker run -p 8080:3000 minha-api` deixa a API acessível em `localhost:8080` no seu navegador, mesmo ela continuando a escutar na porta 3000 lá dentro do container. Quem define a porta interna é a aplicação (o `server.js` e o `EXPOSE` do Dockerfile); quem define por onde você acessa de fora é o número antes dos dois pontos."
                    },
                    {
                        "type": "code",
                        "value": "docker run -p 8080:3000 minha-api\n\ndocker ps\n\nCONTAINER ID   IMAGE       COMMAND                  PORTS                    NAMES\n7e2a9f1c4b8d   minha-api   \"docker-entrypoint.s…\"   0.0.0.0:8080->3000/tcp   sharp_turing"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\", \"O que faz\"], [\"docker run minha-api\", \"Roda um container a partir da imagem, sem porta acessível de fora\"], [\"docker run -p 3000:3000 minha-api\", \"Mapeia a porta 3000 do host pra porta 3000 do container\"], [\"docker run -p 8080:3000 minha-api\", \"Mapeia a porta 8080 do host pra porta 3000 do container\"], [\"docker run -d -p 3000:3000 minha-api\", \"Roda o container em segundo plano (detached) com a porta mapeada\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O -p conecta uma porta do host a uma porta do container: sem ele, a aplicação até roda, mas ninguém de fora consegue acessar."
                    }
                ],
                "questions": [
                    {
                        "statement": "No comando docker run -p 3000:3000 minha-api, o que a flag -p faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Mapeia uma porta do host pra uma porta do container.",
                                "isCorrect": true
                            },
                            {
                                "text": "Define o nome que o container vai ter depois de criado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Define a imagem base que o container vai usar pra subir.",
                                "isCorrect": false
                            },
                            {
                                "text": "Roda o container em segundo plano, sem travar o terminal.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na flag -p 8080:3000, qual das duas portas é a porta usada dentro do container, onde a aplicação realmente escuta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A 3000, porque em host:container ela é a segunda porta da flag.",
                                "isCorrect": true
                            },
                            {
                                "text": "A 8080, porque em host:container ela é a primeira porta da flag.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas, porque host:container sempre precisa ser igual dos dois lados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma das duas, a porta real é sempre definida pelo EXPOSE do Dockerfile.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você rodou docker run minha-api, sem nenhuma flag -p, e a aplicação subiu certinho nos logs. Ainda assim, não consegue acessar em localhost:3000 no navegador. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque sem o -p nenhuma porta do container fica acessível de fora do container.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o comando docker run sempre precisa da flag -d pra funcionar direito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a imagem minha-api foi construída sem a instrução FROM node correta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o navegador só acessa containers que foram criados com docker compose.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois colegas rodam o mesmo docker run -p 3000:3000 minha-api ao mesmo tempo, cada um na própria máquina. Isso funciona sem conflito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, porque a porta 3000 de uma máquina não depende da porta da outra.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, porque a mesma porta não pode ser usada em duas máquinas diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só se as duas máquinas estiverem na mesma rede local conectadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque a imagem minha-api só permite rodar num container por vez.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois containers diferentes, os dois criados a partir da imagem minha-api, tentam usar docker run -p 3000:3000 minha-api ao mesmo tempo na mesma máquina. O que acontece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O segundo docker run falha, porque a porta 3000 do host já está em uso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois sobem normal, o Docker distribui as requisições entre eles.",
                                "isCorrect": false
                            },
                            {
                                "text": "O primeiro container é derrubado automaticamente pra abrir espaço pro segundo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois sobem normal, mas só o mais recente responde às requisições.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Camadas e cache de build (a ordem importa)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que o build às vezes é rápido, às vezes não\n\nVocê já deve ter reparado: da primeira vez que você roda `docker build`, ele demora, baixa a imagem base, instala tudo. Mas se você rodar de novo logo em seguida, sem mudar nada, ele termina quase instantâneo. Isso não é sorte, é o sistema de camadas (layers) do Docker trabalhando a seu favor."
                    },
                    {
                        "type": "text",
                        "value": "## O que é uma camada\n\nCada instrução do Dockerfile que mexe no sistema de arquivos (`FROM`, `COPY`, `RUN`) gera uma camada, uma espécie de \"fatia\" da imagem, empilhada sobre a anterior. O Docker guarda cada camada separadamente e calcula um hash a partir dela.\n\nNa hora de reconstruir a imagem, o Docker compara cada instrução com a camada que já existe em cache. Se a instrução e o que ela usa não mudaram, ele reaproveita a camada pronta em vez de executar tudo de novo. Isso é o cache de build."
                    },
                    {
                        "type": "code",
                        "value": "# primeira vez: tudo executa\ndocker build -t minha-api .\n => [1/5] FROM node:22                        4.8s\n => [2/5] WORKDIR /app                        0.1s\n => [3/5] COPY package.json .                 0.1s\n => [4/5] RUN npm install                     6.2s\n => [5/5] COPY . .                             0.2s\n\n# só mudou o server.js, sem mexer no package.json\ndocker build -t minha-api .\n => [1/5] FROM node:22                        0.0s CACHED\n => [2/5] WORKDIR /app                        0.0s CACHED\n => [3/5] COPY package.json .                 0.0s CACHED\n => [4/5] RUN npm install                     0.0s CACHED\n => [5/5] COPY . .                             0.2s"
                    },
                    {
                        "type": "text",
                        "value": "## Por que copiar o package.json antes do código\n\nRepare na ordem do Dockerfile que você escreveu na aula 2: primeiro `COPY package.json .`, depois `RUN npm install`, só depois `COPY . .` com o resto do código.\n\nO Docker invalida uma camada, e todas as que vêm depois dela, sempre que o que ela usa muda. Como o `server.js` muda com muito mais frequência que as dependências do projeto, colocar `COPY . .` por último garante que só essa última camada precise ser refeita na maioria das vezes. O `RUN npm install`, que é a etapa mais lenta, só roda de novo quando o `package.json` muda de verdade."
                    },
                    {
                        "type": "code",
                        "value": "# ordem que NÃO aproveita o cache direito\nFROM node:22\nWORKDIR /app\nCOPY . .\nRUN npm install\nEXPOSE 3000\nCMD [\"npm\", \"start\"]\n\n# qualquer alteração em qualquer arquivo, mesmo em server.js,\n# invalida o COPY . . e força o RUN npm install a rodar de novo"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"npm install reaproveita o cache?\"], [\"Só o server.js mudou, package.json igual (ordem correta)\", \"Sim, a camada do RUN npm install é reaproveitada\"], [\"O package.json mudou (nova dependência)\", \"Não, a camada é refeita porque a instrução anterior mudou\"], [\"COPY . . vem antes do RUN npm install (ordem ruim)\", \"Não, qualquer mudança no código já invalida o npm install\"], [\"Nada mudou no projeto desde o último build\", \"Sim, todas as camadas são reaproveitadas\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A ordem das instruções no Dockerfile não é estética, ela decide quanto do cache o Docker consegue reaproveitar a cada build."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é uma camada (layer) numa imagem Docker?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O resultado gravado de uma instrução do Dockerfile, empilhado sobre a anterior.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um tipo de container que roda várias aplicações ao mesmo tempo isoladas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um arquivo de configuração que lista todas as portas expostas pela imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma cópia completa e independente do sistema operacional usado no FROM.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quando uma instrução do Dockerfile não muda entre dois builds, o que o Docker faz com a camada correspondente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reaproveita a camada do cache, sem rodar a instrução de novo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Executa a instrução de novo mesmo assim, só pra garantir que nada mudou.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apaga a camada antiga e recria ela do zero em todo build seguinte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignora a instrução inteira e pula direto pra próxima do Dockerfile.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Dockerfile, COPY package.json . vem antes de RUN npm install, que vem antes de COPY . . com o resto do código. Mudando só um comentário no server.js e rodando o build de novo, o que tende a acontecer com a camada do RUN npm install?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ela é reaproveitada do cache, porque nada que ela usa (o package.json) mudou.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela roda de novo do zero, porque qualquer mudança no projeto reinicia o cache inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela é pulada completamente, porque o server.js não depende do npm install.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela roda de novo só pela metade, reinstalando apenas os pacotes mais recentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Dockerfile tem COPY . . logo depois do WORKDIR, e só depois vem RUN npm install. Um colega muda uma linha de comentário no server.js e o build refaz o npm install inteiro, do mesmo jeito de sempre. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o COPY . . antes do RUN invalida a camada do npm install a cada mudança.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o npm install sempre reinstala tudo, não importa a ordem das instruções.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque comentários no código contam como mudança de dependência pro Docker.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque esse Dockerfile não tem EXPOSE, o que desativa o cache de build.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Dockerfile correto copia e instala o package.json antes do resto do código. Um arquivo .env, que muda de valor toda hora, só é copiado no COPY . . final. Isso afeta a camada do RUN npm install?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não, porque o RUN npm install já rodou numa camada anterior ao COPY . . final.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque qualquer arquivo do projeto, incluindo o .env, refaz o npm install.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque arquivos .env são ignorados automaticamente pelo Docker no build.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só se o .env estiver listado dentro do package.json do projeto.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Trabalhando com containers e imagens",
        "aulas": [
            {
                "titulo": "Comandos do dia a dia com containers (ps, logs, exec, stop, rm)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Comandos do dia a dia com containers\n\nNo módulo anterior você escreveu um Dockerfile pra sua API Express, buildou a imagem com `docker build` e rodou o primeiro container com `docker run`. A partir de agora isso vira rotina: o container fica em segundo plano, e você precisa saber conversar com ele no dia a dia.\n\nNesta aula, os cinco comandos que mais aparecem no trabalho com Docker:\n\n- `docker ps`: o que está rodando agora\n- `docker logs`: o que o container está imprimindo\n- `docker exec`: entrar dentro do container\n- `docker stop`: parar um container\n- `docker rm`: remover um container de vez"
                    },
                    {
                        "type": "text",
                        "value": "## Observando o container: ps, logs e exec\n\n`docker ps` lista os containers em execução: ID, imagem usada, comando rodando, tempo de vida, status e portas. Container parado não aparece na lista padrão; pra ver todos, incluindo os parados, é `docker ps -a`.\n\n`docker logs` mostra a saída (stdout e stderr) do processo principal do container, o mesmo texto que apareceria no terminal se a aplicação rodasse direto na máquina. É o primeiro lugar pra olhar quando o container sobe e a aplicação não responde. Com `-f` (de \"follow\"), o log acompanha em tempo real.\n\nJá `docker exec -it container sh` abre um terminal interativo dentro de um container que já está rodando. `-i` mantém a entrada padrão aberta, `-t` aloca um terminal, juntas formam uma sessão interativa de verdade. `sh` costuma existir em qualquer imagem; se ela for baseada em Debian ou Ubuntu, `bash` também costuma funcionar."
                    },
                    {
                        "type": "code",
                        "value": "# ver os containers rodando\ndocker ps\n\n# ver todos, incluindo os parados\ndocker ps -a\n\n# acompanhar a saida da aplicacao\ndocker logs minha-api\n\n# acompanhar em tempo real (Ctrl+C pra sair)\ndocker logs -f minha-api\n\n# entrar no container pra investigar por dentro\ndocker exec -it minha-api sh\n# dentro do container:\n#   ls\n#   cat package.json\n#   ps aux\n#   exit"
                    },
                    {
                        "type": "text",
                        "value": "## Parar x remover: stop e rm\n\nEssa é a diferença que mais confunde no começo. `docker stop` envia um sinal pedindo pro processo principal encerrar com calma (SIGTERM) e, depois de um tempo limite, força o encerramento se ele não responder. O container para, mas continua existindo: aparece em `docker ps -a`, guarda o filesystem que tinha e pode ser religado com `docker start`.\n\n`docker rm` é outra coisa: remove o container de vez, apagando esse filesystem junto. Um container em execução não pode ser removido direto, primeiro precisa estar parado (ou usar `docker rm -f`, que força a parada e a remoção num único comando).\n\nResumindo: parar é pausar, remover é apagar. Enquanto o container só está parado, o que foi gravado nele ainda existe."
                    },
                    {
                        "type": "code",
                        "value": "docker stop minha-api\ndocker ps -a\n# STATUS: Exited (0) 10 seconds ago -> ainda existe, so parado\n\ndocker start minha-api\ndocker ps\n# STATUS: Up 2 seconds -> religou o mesmo container\n\ndocker stop minha-api\ndocker rm minha-api\ndocker ps -a\n# o container sumiu da lista"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\", \"O que faz\"], [\"docker ps\", \"Lista os containers em execução\"], [\"docker ps -a\", \"Lista todos os containers, incluindo os parados\"], [\"docker logs <nome>\", \"Mostra a saída do container\"], [\"docker logs -f <nome>\", \"Acompanha a saída em tempo real\"], [\"docker exec -it <nome> sh\", \"Abre um terminal dentro do container\"], [\"docker stop <nome>\", \"Para o container, mas mantém ele e os dados guardados\"], [\"docker rm <nome>\", \"Remove o container de vez\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "docker stop pausa o container, que continua existindo; docker rm apaga ele de vez, sem volta."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando mostra apenas os containers que estão rodando agora?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker ps, que lista os containers em execução.",
                                "isCorrect": true
                            },
                            {
                                "text": "docker ps -a, que lista também os containers parados.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker images, que lista as imagens da máquina.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker logs, que mostra a saída de um container.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Pra acompanhar a saída de um container em tempo real, sem repetir o comando a cada instante, qual opção usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker logs -f minha-api, que segue a saída em tempo real.",
                                "isCorrect": true
                            },
                            {
                                "text": "docker logs -a minha-api, que mostra todo o histórico salvo.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker ps -f minha-api, que filtra containers pelo nome.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker exec -f minha-api, que força a entrada no container.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de docker stop minha-api, o comando docker ps não mostra mais o container. Isso quer dizer que:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O container está parado, mas ainda existe.",
                                "isCorrect": true
                            },
                            {
                                "text": "O container foi removido e não existe mais.",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando falhou e o container segue rodando.",
                                "isCorrect": false
                            },
                            {
                                "text": "O container foi pausado com docker pause.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um colega roda docker exec -it minha-api bash e recebe um erro dizendo que o executável bash não foi encontrado. Qual a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A imagem usa Alpine, que não vem com bash, só sh.",
                                "isCorrect": true
                            },
                            {
                                "text": "O container está parado e precisa ser iniciado antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta a flag -i para abrir a entrada padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do container está escrito errado no comando.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer remover um container que está rodando, sem parar ele antes num comando separado. Qual comando faz isso num passo só?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "docker rm -f, que força a parada e a remoção juntas.",
                                "isCorrect": true
                            },
                            {
                                "text": "docker stop -r, que reinicia e já remove o container.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker rm --now, que ignora o tempo de espera do stop.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker kill -rm, que mata o processo e apaga tudo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Imagens, tags e o registry",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Imagens guardadas na máquina\n\nToda vez que você roda `docker build` ou `docker pull`, uma imagem fica salva localmente. `docker images` lista as imagens que existem na sua máquina: repositório, tag, ID, data de criação e tamanho.\n\nBaixar uma imagem pronta é `docker pull`. Em vez de escrever um Dockerfile pra ter o Postgres da trilha de banco ou o Redis que você usou pra cache rodando aqui, você baixa a imagem que a comunidade já mantém, do jeito que ela foi publicada."
                    },
                    {
                        "type": "code",
                        "value": "docker images\n\ndocker pull node:22-alpine\ndocker pull postgres:16\ndocker pull redis:7\n\ndocker images\n# as tres imagens aparecem na lista agora"
                    },
                    {
                        "type": "text",
                        "value": "## Tags: a versão da imagem\n\nToda imagem tem um nome no formato `repositorio:tag`, como `node:22-alpine` ou `postgres:16`. A tag marca a versão (e às vezes a variante) daquela imagem. Quando você não escreve nenhuma tag, o Docker assume `latest`.\n\n`latest` não significa \"a versão mais nova e estável\", significa só \"a tag que esse projeto decidiu chamar de latest\" no momento. `docker pull node:latest` rodado hoje pode trazer uma versão diferente da que traria daqui a alguns meses, o que vai contra a ideia de \"roda igual em qualquer lugar\". Por isso é comum travar a versão, como `node:22-alpine`, em vez de depender do `latest`."
                    },
                    {
                        "type": "code",
                        "value": "# as duas linhas abaixo baixam a mesma coisa\ndocker pull node\ndocker pull node:latest\n\n# essa trava numa versao especifica\ndocker pull node:22-alpine\n\n# variantes comuns da mesma imagem\ndocker pull node:22\ndocker pull node:22-alpine\ndocker pull node:22-slim"
                    },
                    {
                        "type": "text",
                        "value": "## Removendo imagens: docker rmi\n\n`docker rmi` remove uma imagem da máquina local (isso não afeta o registry, só o que está guardado no seu computador). Uma imagem usada por algum container, mesmo parado, não pode ser removida direto: o Docker recusa e pede pra remover o container primeiro."
                    },
                    {
                        "type": "code",
                        "value": "docker rmi node:22-slim\n# se algum container ainda usa essa imagem, o Docker recusa\n\ndocker rm meu-container-antigo\ndocker rmi node:22-slim\n# agora remove normalmente"
                    },
                    {
                        "type": "quote",
                        "value": "A tag é a versão da imagem: sem tag, o Docker assume latest, e latest muda com o tempo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando lista as imagens já baixadas na máquina local?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker images, que lista o que já foi baixado.",
                                "isCorrect": true
                            },
                            {
                                "text": "docker ps -a, que lista os containers parados.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker pull, que baixa uma imagem do registry.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker container ls, que lista containers ativos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em node:22-alpine, o que vem depois dos dois-pontos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A tag da imagem, que marca a versão.",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome do container que vai ser criado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O ID gerado pra identificar a imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do registry onde ela foi publicada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Dockerfile começa com FROM node, sem nenhuma tag depois do nome. Qual o efeito disso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usa a tag latest, que pode mudar de versão com o tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O build falha, porque toda imagem exige uma tag explícita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usa a versão de Node instalada na máquina host.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usa sempre a versão mais antiga disponível do Node.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "docker rmi minha-imagem retorna um erro dizendo que a imagem está em uso por um container. O que fazer pra remover mesmo assim?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Remover o container primeiro, ou usar docker rmi -f.",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodar docker pull de novo pra atualizar a imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reiniciar o Docker e tentar o comando de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar docker stop no lugar do docker rmi, que remove.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que node:22-alpine costuma ser bem menor que node:22-slim, mesmo sendo a mesma versão do Node?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Alpine parte de uma base Linux mais enxuta que a slim.",
                                "isCorrect": true
                            },
                            {
                                "text": "Slim inclui ferramentas de debug que a alpine remove.",
                                "isCorrect": false
                            },
                            {
                                "text": "Alpine não inclui o gerenciador de pacotes npm.",
                                "isCorrect": false
                            },
                            {
                                "text": "A diferença é só cosmética, os dois pesam quase o mesmo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Docker Hub e imagens oficiais",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O registry: onde as imagens moram\n\nQuando você roda `docker pull postgres`, de onde vem essa imagem? De um registry, um servidor que guarda imagens publicadas, indexadas por nome e tag. O registry padrão do Docker é o Docker Hub (`hub.docker.com`), mas existem outros: o GitHub Container Registry, o registry de cada provedor de nuvem, ou até um registry privado dentro da empresa.\n\nSem indicar nenhum registry, o Docker sempre procura no Docker Hub. É por isso que `docker pull redis:7` simplesmente funciona: o nome \"redis\" é procurado lá."
                    },
                    {
                        "type": "text",
                        "value": "## Imagens oficiais x imagens da comunidade\n\nNo Docker Hub existem dois tipos de publicação. As **imagens oficiais** (Node, Postgres, Redis, Nginx, Python, entre outras) têm a curadoria do time do Docker em conjunto com o projeto original, documentação padronizada e atualização frequente contra falhas de segurança. Já as **imagens da comunidade** são publicadas por qualquer conta, sem essa curadoria central: podem estar desatualizadas, mal documentadas, ou serem exatamente o que você precisa, depende de quem mantém.\n\nConvenção prática: comece pela imagem oficial do que você precisa (`node`, `postgres`, `redis`), e só recorra a uma da comunidade se a oficial não cobrir o seu caso."
                    },
                    {
                        "type": "code",
                        "value": "docker search postgres\n# lista imagens no Docker Hub relacionadas a \"postgres\",\n# com nome, descricao e se e oficial\n\ndocker pull postgres:16\ndocker pull redis:7-alpine\ndocker pull node:22-alpine"
                    },
                    {
                        "type": "text",
                        "value": "## Baixar pronto em vez de construir\n\nNão faz sentido escrever um Dockerfile do zero pra ter um Postgres rodando, o mesmo Postgres que você já usou na trilha de banco de dados: o time do Postgres publica uma imagem oficial testada, configurável por variável de ambiente, atualizada quando sai uma correção de segurança. Escrever seu próprio Dockerfile faz sentido pra sua aplicação, que é única; pra peças de infraestrutura padrão como banco, cache ou proxy, baixar a imagem pronta é o caminho normal.\n\nÉ o mesmo raciocínio de instalar o Postgres com um gerenciador de pacotes: aqui, o \"pacote\" é a imagem, e o \"instalador\" é o `docker pull`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Imagem oficial\", \"Imagem da comunidade\"], [\"Mantida por\", \"Time do Docker + projeto original\", \"Qualquer conta pública\"], [\"Exemplos\", \"node, postgres, redis, nginx\", \"Variações e forks de terceiros\"], [\"Documentação\", \"Padronizada, na página da imagem\", \"Varia de projeto pra projeto\"], [\"Quando usar\", \"Primeira opção pra peças de infra padrão\", \"Quando a oficial não cobre o caso\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Antes de escrever um Dockerfile pra banco, cache ou fila, procure a imagem oficial primeiro: alguém já resolveu isso."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quando você roda docker pull sem indicar nenhum outro endereço, de qual registry a imagem vem por padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Docker Hub, que é o registry padrão do Docker.",
                                "isCorrect": true
                            },
                            {
                                "text": "GitHub Container Registry, mantido pela Microsoft.",
                                "isCorrect": false
                            },
                            {
                                "text": "npm, o registry de pacotes do JavaScript.",
                                "isCorrect": false
                            },
                            {
                                "text": "ECR, o registry de containers da AWS.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que diferencia uma imagem oficial de uma da comunidade no Docker Hub?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A oficial tem curadoria do time do Docker e do projeto.",
                                "isCorrect": true
                            },
                            {
                                "text": "A oficial nunca recebe atualização, só a da comunidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "A oficial roda mais rápido que qualquer outra imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "A oficial existe só pra bancos de dados relacionais.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa de um Redis pra cache na sua API. Qual é a abordagem mais direta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Baixar a imagem oficial do Redis com docker pull redis.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrever um Dockerfile do zero instalando o Redis via apt.",
                                "isCorrect": false
                            },
                            {
                                "text": "Compilar o Redis a partir do código-fonte na imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Instalar o Redis direto na máquina host, fora de containers.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando permite pesquisar, direto no terminal, imagens do Docker Hub relacionadas a um termo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "docker search postgres, que pesquisa no Docker Hub.",
                                "isCorrect": true
                            },
                            {
                                "text": "docker find postgres, que localiza imagens no disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker hub postgres, que abre o site do Docker Hub.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker pull --list postgres, que lista antes de baixar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide sempre usar a imagem oficial do Postgres, nunca uma variante da comunidade, mesmo quando a da comunidade tem uma funcionalidade a mais. Qual é o raciocínio mais forte pra essa escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Atualização de segurança é mais previsível na oficial.",
                                "isCorrect": true
                            },
                            {
                                "text": "Imagens da comunidade nunca funcionam corretamente em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker Hub bloqueia o uso comercial de imagens não oficiais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Imagens oficiais são sempre menores em tamanho que as demais.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O .dockerignore: o que não deve entrar na imagem",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O problema: COPY . . copia tudo\n\nLembra do Dockerfile do módulo passado, com `COPY . .` copiando o projeto inteiro pra dentro da imagem? \"Tudo\" é literal: inclui a pasta `node_modules` (que vai ser reinstalada do zero com `npm install` dentro da imagem, então essa cópia é trabalho perdido), a pasta `.git` (todo o histórico de commits, sem nenhuma utilidade dentro de um container rodando) e o arquivo `.env` (que costuma guardar senha de banco, chave de API, segredo de sessão).\n\nTrês problemas aí: a imagem fica maior e mais lenta de transferir, o build fica mais lento (o Docker precisa ler e enviar tudo isso pro contexto de build antes mesmo de começar) e, o pior, segredo do `.env` vai parar dentro da imagem, acessível a qualquer um que tiver acesso a ela."
                    },
                    {
                        "type": "text",
                        "value": "## .dockerignore: o mesmo princípio do .gitignore\n\nA solução é um arquivo `.dockerignore` na raiz do projeto, ao lado do Dockerfile. Antes de montar o contexto de build, o Docker lê esse arquivo e exclui tudo que casar com os padrões listados, do mesmo jeito que o Git faz com o `.gitignore`. Uma linha por padrão, `#` pra comentário, `*` como coringa, `!` pra abrir uma exceção dentro de algo já ignorado."
                    },
                    {
                        "type": "code",
                        "value": "node_modules\n.git\n.env\n.env.*\nnpm-debug.log\nDockerfile\n.dockerignore\n*.md\n.vscode\ncoverage"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Padrão\", \"Por que ignorar\"], [\"node_modules\", \"Reinstalado dentro da imagem com npm install\"], [\".git\", \"Histórico do repositório, inútil dentro do container\"], [\".env\", \"Segredos: senha, chave de API, token\"], [\"*.md\", \"Documentação não afeta a aplicação rodando\"], [\"coverage\", \"Relatório de teste, gerado localmente\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que você ganha com isso\n\nCom o `.dockerignore` no lugar, `COPY . .` continua copiando \"tudo\", só que \"tudo\" agora exclui exatamente o que não devia entrar. A imagem fica menor (sem `node_modules` duplicado), o build fica mais rápido (menos dado pra ler e enviar) e, principalmente, nenhum segredo do `.env` vai parar numa camada da imagem, onde qualquer pessoa com acesso a ela poderia extrair."
                    },
                    {
                        "type": "code",
                        "value": "# sem .dockerignore, o contexto de build inclui tudo:\n# node_modules/ (poderia ter centenas de MB)\n# .git/ (todo o historico)\n# .env (senha do banco, chave de API)\n\n# com o .dockerignore no lugar:\ndocker build -t minha-api .\n# Sending build context to Docker daemon  4.2MB\n# (em vez de, por exemplo, 180MB sem o .dockerignore)"
                    },
                    {
                        "type": "quote",
                        "value": "O .dockerignore não é opcional: sem ele, seu .env pode acabar dentro da imagem, e imagem se compartilha."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a função do arquivo .dockerignore?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Excluir arquivos do contexto enviado ao build.",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir quais portas o container vai expor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Listar as dependências que serão instaladas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir a imagem base usada no Dockerfile.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que copiar node_modules pra dentro da imagem é desperdício?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque ele é reinstalado do zero com npm install na imagem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque ele nunca funciona corretamente dentro de containers.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o npm apaga essa pasta automaticamente no build.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Dockerfile já bloqueia pastas com esse nome.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dev sobe a imagem da API pra um registry público e, dias depois, percebe que a senha do banco estava dentro do .env copiado pro container. Qual prática teria evitado isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ter um .dockerignore listando .env antes do build.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ter trocado a senha do banco toda semana.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ter usado HTTPS para enviar a imagem ao registry.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ter compactado a imagem antes de publicar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto tem .gitignore configurado, ignorando node_modules e .env pro Git. Isso é suficiente pra manter esses arquivos fora da imagem Docker?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não, o Docker usa um arquivo separado, o .dockerignore.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, o Docker lê o .gitignore automaticamente também.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, arquivos ignorados pelo Git nunca entram em imagens.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, é preciso apagar esses arquivos manualmente antes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O Dockerfile tem COPY package.json . seguido de RUN npm install e depois COPY . . . Com .dockerignore listando node_modules, o que acontece nesse segundo COPY?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Copia o resto do projeto, sem mexer no node_modules.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reinstala o node_modules do zero, por cima do existente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falha o build, pois node_modules está no .dockerignore.",
                                "isCorrect": false
                            },
                            {
                                "text": "Copia o node_modules do host por cima da instalação.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Variáveis de ambiente e o problema dos dados que somem",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Configuração por fora da imagem\n\nUma imagem Docker deveria ser a mesma em qualquer ambiente: o que muda entre rodar sua API Express em desenvolvimento e em produção não é o código nem as dependências, é a configuração (endereço do banco, chave de API, nível de log). Se essas informações ficassem fixas dentro da imagem, seria preciso construir uma imagem por ambiente, o que vai contra a ideia de \"constrói uma vez, roda em qualquer lugar\".\n\nA solução é injetar configuração de fora, no momento de rodar o container, através de variáveis de ambiente. O código lê `process.env.DATABASE_URL` sem saber (nem precisar saber) se está em dev, staging ou produção; quem decide o valor é quem roda o container."
                    },
                    {
                        "type": "text",
                        "value": "## Passando variáveis: -e e --env-file\n\nPra uma variável avulsa, a flag `-e` no `docker run`. Pra várias de uma vez, um arquivo `.env` com a flag `--env-file`, que evita uma linha de comando gigante e mantém a configuração de cada ambiente guardada num arquivo (que, por sinal, deve estar no `.dockerignore` e no `.gitignore`, nunca commitado)."
                    },
                    {
                        "type": "code",
                        "value": "# uma variavel por vez\ndocker run -e DATABASE_URL=postgres://user:senha@db:5432/app -p 3000:3000 minha-api\n\n# varias variaveis\ndocker run -e NODE_ENV=production -e PORT=3000 -e LOG_LEVEL=info minha-api\n\n# a partir de um arquivo\ndocker run --env-file .env -p 3000:3000 minha-api"
                    },
                    {
                        "type": "code",
                        "value": "# .env\nNODE_ENV=production\nPORT=3000\nDATABASE_URL=postgres://user:senha@db:5432/app\nREDIS_URL=redis://redis:6379\nLOG_LEVEL=info"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Forma\", \"Quando usar\"], [\"-e VAR=valor\", \"Uma ou duas variáveis, teste rápido\"], [\"--env-file .env\", \"Várias variáveis, configuração de um ambiente inteiro\"], [\"ENV no Dockerfile\", \"Valor padrão fixo, igual em toda imagem (raramente segredo)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O problema: o que é gravado no container some\n\nSó que tem um limite pra isso. Tudo que a aplicação grava em disco dentro do container (um arquivo de upload, dados de um banco rodando ali dentro, um cache em arquivo) vive só enquanto aquele container existir. `docker stop` não apaga nada, mas `docker rm` remove o container e, junto, todo o filesystem que ele acumulou. Sobe um container novo da mesma imagem e ele começa do zero, sem histórico nenhum do anterior.\n\nPra configuração isso não é problema, ela vem de fora a cada `docker run`. Pra dados que precisam sobreviver ao container, como as tabelas de um Postgres, é um problema sério, e é exatamente o que o próximo módulo resolve com volumes."
                    },
                    {
                        "type": "quote",
                        "value": "Configuração entra por variável de ambiente e sobrevive porque vem de fora; dado gravado dentro do container não tem essa sorte."
                    }
                ],
                "questions": [
                    {
                        "statement": "No comando docker run, qual flag define uma variável de ambiente pro container?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "-e, que define uma variável direto na linha de comando.",
                                "isCorrect": true
                            },
                            {
                                "text": "-v, que monta um volume ou pasta dentro do container.",
                                "isCorrect": false
                            },
                            {
                                "text": "-p, que publica uma porta do container pro host.",
                                "isCorrect": false
                            },
                            {
                                "text": "-w, que define a pasta de trabalho dentro do container.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando roda um container passando várias variáveis de ambiente de uma vez, a partir de um arquivo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker run --env-file .env, que carrega as variáveis do arquivo.",
                                "isCorrect": true
                            },
                            {
                                "text": "docker run --env .env, que carrega o arquivo indicado.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker run -f .env, que aponta o arquivo de configuração.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker run --config .env, que aplica configurações do arquivo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer que a mesma imagem Docker rode em dev e em produção, mudando só o endereço do banco de dados. Qual é a abordagem correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ler o endereço de uma variável de ambiente no docker run.",
                                "isCorrect": true
                            },
                            {
                                "text": "Buildar duas imagens, uma pra dev e outra pra produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixar o endereço fixo no código e trocar antes do deploy.",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar os dois endereços na imagem e escolher em runtime.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time versiona um arquivo .env com a senha de produção direto no repositório Git, pra facilitar o uso do --env-file. Qual é o risco?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A senha fica exposta pra quem tiver acesso ao repositório.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Docker recusa rodar containers com esse tipo de arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O build da imagem fica consideravelmente mais lento.",
                                "isCorrect": false
                            },
                            {
                                "text": "A variável de ambiente deixa de funcionar em produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API grava arquivos de log num diretório dentro do container. O time roda docker rm nesse container pra liberar espaço e sobe outro da mesma imagem. Os logs antigos aparecem no novo container?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não, porque docker rm apaga o filesystem do container junto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque containers da mesma imagem compartilham disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque o Docker guarda um backup automático a cada rm.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, mas só porque o novo container usa outra tag.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Volumes e dados que persistem",
        "aulas": [
            {
                "titulo": "Por que o container é efêmero",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que o container é efêmero\n\nNo módulo passado você viu os comandos do dia a dia (docker ps, logs, exec, stop, rm) e esbarrou num detalhe importante: quando um container é removido, tudo que ele escreveu dentro de si mesmo desaparece junto. Essa aula explica por que isso acontece e por que isso é sério quando existe um banco de dados no meio."
                    },
                    {
                        "type": "text",
                        "value": "## O sistema de arquivos do container\n\nToda imagem Docker é formada por camadas somente leitura. Quando você roda docker run, o Docker adiciona por cima uma camada gravável, exclusiva daquele container. É nela que ficam os arquivos criados depois que o container está no ar: logs, arquivos temporários e, no caso de um banco, as próprias tabelas.\n\nEssa camada gravável vive junto com o container. Ela não é a imagem (a imagem continua intacta, só leitura) e não é compartilhada com outros containers da mesma imagem. Quando o container é removido com docker rm, essa camada some com ele."
                    },
                    {
                        "type": "code",
                        "value": "# 1. Sobe um container e grava um arquivo dentro dele\ndocker run --name teste alpine sh -c \"echo 'dado importante' > /dados.txt && cat /dados.txt\"\n# dado importante\n\n# 2. Remove o container (a camada gravável vai junto)\ndocker rm teste\n\n# 3. Sobe um container NOVO, a partir da mesma imagem\ndocker run --rm alpine cat /dados.txt\n# cat: can't open '/dados.txt': No such file or directory"
                    },
                    {
                        "type": "text",
                        "value": "## O problema pro banco de dados\n\nIsso é inofensivo com um arquivo de teste, mas pense no Postgres da trilha de banco rodando dentro de um container. Ele grava cada tabela, cada índice e cada linha inserida em arquivos dentro de /var/lib/postgresql/data, o diretório padrão de dados do Postgres. Se esse container for removido (por engano, numa atualização de imagem, ou porque docker compose down recria os containers), o banco inteiro volta a zero.\n\nIsso inviabiliza rodar um banco assim em qualquer ambiente sério. Ninguém aceita perder os dados de produção porque um container foi recriado. Resolver exatamente esse problema é o papel dos volumes, assunto da próxima aula."
                    },
                    {
                        "type": "code",
                        "value": "# Sobe um Postgres sem nenhum volume configurado\ndocker run --name meu-postgres -e POSTGRES_PASSWORD=senha123 -d postgres\n\n# Cria uma tabela e insere um registro\ndocker exec -it meu-postgres psql -U postgres -c \"CREATE TABLE alunos (id serial, nome text);\"\ndocker exec -it meu-postgres psql -U postgres -c \"INSERT INTO alunos (nome) VALUES ('Ana');\"\n\n# Remove o container\ndocker rm -f meu-postgres\n\n# Sobe um Postgres novo, com o mesmo comando\ndocker run --name meu-postgres -e POSTGRES_PASSWORD=senha123 -d postgres\ndocker exec -it meu-postgres psql -U postgres -c \"SELECT * FROM alunos;\"\n# ERROR:  relation \"alunos\" does not exist"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\",\"O que acontece com o container\",\"Dados gravados nele sobrevivem?\"],[\"docker stop\",\"Para o processo, mas mantém o container e seu sistema de arquivos\",\"Sim\"],[\"docker start\",\"Retoma um container parado do jeito que ele estava\",\"Sim\"],[\"docker restart\",\"Reinicia o processo dentro do mesmo container\",\"Sim\"],[\"docker rm\",\"Remove o container e sua camada gravável\",\"Não\"],[\"docker compose down\",\"Para e remove os containers do compose\",\"Não, sem volume\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O container guarda estado só enquanto ele existe. Remova o container e tudo que ele escreveu no próprio sistema de arquivos desaparece com ele."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que acontece com os arquivos que um container grava dentro de si mesmo quando ele é removido com docker rm?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Eles são apagados junto com o container removido",
                                "isCorrect": true
                            },
                            {
                                "text": "Eles são movidos automaticamente para a imagem original",
                                "isCorrect": false
                            },
                            {
                                "text": "Eles ficam guardados até o próximo docker run",
                                "isCorrect": false
                            },
                            {
                                "text": "Eles são copiados para o host antes da remoção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Onde fica a camada gravável de um container, aquela em que ele grava arquivos depois de iniciado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Numa camada exclusiva do container, sobre as camadas da imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Dentro da própria imagem, na última camada do docker build",
                                "isCorrect": false
                            },
                            {
                                "text": "No Docker Hub, junto com as camadas enviadas da imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Num arquivo de configuração gerado a partir do Dockerfile",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Postgres sem volume rodou por semanas num ambiente de teste. Depois de um docker compose down seguido de um docker compose up, os dados sumiram. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O compose down remove os containers, e sem volume os dados iam junto",
                                "isCorrect": true
                            },
                            {
                                "text": "O compose up sempre baixa uma imagem nova e zera os dados por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "O Postgres limpa as próprias tabelas quando o container reinicia",
                                "isCorrect": false
                            },
                            {
                                "text": "O compose down só funciona quando existe algum volume configurado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe roda docker stop no container do banco todo fim de expediente e docker start na manhã seguinte. O que acontece com os dados nesse ciclo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Eles continuam lá, porque stop não remove o container nem seus arquivos",
                                "isCorrect": true
                            },
                            {
                                "text": "Eles somem, porque o stop já apaga a camada gravável do container",
                                "isCorrect": false
                            },
                            {
                                "text": "Eles só continuam se existir um volume nomeado criado antes do stop",
                                "isCorrect": false
                            },
                            {
                                "text": "Eles são copiados pro host automaticamente durante o comando stop",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação grava um log dentro de um container. Depois que o container é removido com docker rm, o log não aparece em lugar nenhum, mesmo com a imagem original ainda no host. Por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O log foi escrito na camada gravável do container, que some quando ele é removido",
                                "isCorrect": true
                            },
                            {
                                "text": "O log foi escrito na imagem, mas o docker rm reverte a imagem pro estado do build",
                                "isCorrect": false
                            },
                            {
                                "text": "O log ficou num cache temporário do Docker que expira sozinho depois de minutos",
                                "isCorrect": false
                            },
                            {
                                "text": "O log foi enviado pro registry junto com a imagem, por isso não fica mais local",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Volumes nomeados (dados que sobrevivem)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um volume nomeado\n\nUm volume é um espaço de armazenamento gerenciado pelo próprio Docker, fora do ciclo de vida de qualquer container específico. Ele existe independente de qual container está rodando: você monta ele dentro de um container, num caminho determinado, e o que for gravado ali passa a viver no volume, não na camada gravável efêmera do container.\n\nQuando o container é removido, o volume não vai junto. Ele continua existindo, guardando os dados, esperando ser montado de novo (pelo mesmo container recriado, ou por outro completamente diferente)."
                    },
                    {
                        "type": "code",
                        "value": "# Cria um volume nomeado chamado dados-app\ndocker volume create dados-app\n\n# Lista todos os volumes existentes\ndocker volume ls\n\n# Mostra detalhes do volume, inclusive onde ele fica no host\ndocker volume inspect dados-app\n\n# Remove um volume que não está mais em uso\ndocker volume rm dados-app"
                    },
                    {
                        "type": "text",
                        "value": "## Montando um volume num container\n\nPra usar um volume, você monta ele num caminho dentro do container com a flag -v, no formato nome-do-volume:/caminho/no/container. Se o volume ainda não existir, o Docker cria ele automaticamente na hora do docker run, então nem sempre é preciso rodar o docker volume create antes."
                    },
                    {
                        "type": "code",
                        "value": "# Sobe um container, monta o volume dados-app em /dados, e grava um arquivo\ndocker run --name c1 -v dados-app:/dados alpine sh -c \"echo 'sobrevivi' > /dados/arquivo.txt\"\n\n# Remove o container (o volume continua existindo)\ndocker rm c1\n\n# Sobe um container NOVO, monta o MESMO volume, e lê o arquivo\ndocker run --rm -v dados-app:/dados alpine cat /dados/arquivo.txt\n# sobrevivi"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\",\"Pra que serve\"],[\"docker volume create <nome>\",\"Cria um volume nomeado vazio\"],[\"docker volume ls\",\"Lista os volumes existentes\"],[\"docker volume inspect <nome>\",\"Mostra detalhes do volume, como o caminho no host\"],[\"docker volume rm <nome>\",\"Remove um volume (precisa estar sem container usando)\"],[\"docker volume prune\",\"Remove todos os volumes que não estão em uso por nenhum container\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um volume nomeado é gerenciado pelo Docker e vive fora do container: nasce antes, sobrevive depois e pode ser montado por qualquer container que precisar dele."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando cria um volume nomeado chamado dados-app, sem associar ele a nenhum container ainda?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker volume create dados-app",
                                "isCorrect": true
                            },
                            {
                                "text": "docker create volume dados-app",
                                "isCorrect": false
                            },
                            {
                                "text": "docker run volume dados-app",
                                "isCorrect": false
                            },
                            {
                                "text": "docker volume new dados-app",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando lista todos os volumes que já existem no Docker?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker volume ls",
                                "isCorrect": true
                            },
                            {
                                "text": "docker volume list",
                                "isCorrect": false
                            },
                            {
                                "text": "docker ps -a",
                                "isCorrect": false
                            },
                            {
                                "text": "docker inspect volume",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar docker volume create dados-app e nunca montar esse volume em nenhum container, o que existe no sistema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um volume vazio chamado dados-app, pronto pra ser usado por um container",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada, o Docker só cria o volume de fato na primeira vez que for montado",
                                "isCorrect": false
                            },
                            {
                                "text": "Um container parado chamado dados-app, esperando receber uma imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro, porque todo volume precisa nascer junto com um docker run",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um container escreve um arquivo em /dados, caminho onde está montado o volume relatorios. O container é removido, e um novo container monta o mesmo volume relatorios em /saida. O arquivo aparece em /saida?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, o conteúdo é do volume, não do caminho usado no container anterior",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, porque o caminho de montagem precisa ser idêntico ao usado antes",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque cada caminho dentro do container tem seu próprio conteúdo",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas o arquivo aparece vazio até o container ser reiniciado uma vez",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois containers diferentes, de imagens diferentes, montam o mesmo volume nomeado dados-compartilhados, cada um num caminho interno diferente. Um grava um arquivo, o outro consegue ler esse arquivo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sim, porque os dois apontam pro mesmo volume, não importa a imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, porque volume só pode ser montado por containers da mesma imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque cada container enxerga uma cópia isolada desse volume",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só se as duas imagens usarem o mesmo sistema operacional base",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Persistindo o banco num volume",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Onde o Postgres guarda os dados\n\nA imagem oficial do postgres no Docker Hub grava todos os arquivos do banco (tabelas, índices, logs de transação) dentro de /var/lib/postgresql/data, o diretório padrão de dados do Postgres, o mesmo que você já viu rodando localmente na trilha de banco. Sem um volume montado nesse caminho, esses arquivos vivem na camada gravável do container e desaparecem se ele for removido, exatamente o problema da primeira aula."
                    },
                    {
                        "type": "code",
                        "value": "docker run --name meu-postgres \\\n  -e POSTGRES_PASSWORD=senha123 \\\n  -v dados-postgres:/var/lib/postgresql/data \\\n  -p 5432:5432 \\\n  -d postgres"
                    },
                    {
                        "type": "text",
                        "value": "## Testando a persistência\n\nCom o volume montado, o teste é o mesmo da aula anterior, só que agora com um banco de verdade: criar um dado, remover o container, subir outro e conferir se o dado continua lá."
                    },
                    {
                        "type": "code",
                        "value": "# Cria uma tabela e insere um registro\ndocker exec -it meu-postgres psql -U postgres -c \"CREATE TABLE alunos (id serial, nome text);\"\ndocker exec -it meu-postgres psql -U postgres -c \"INSERT INTO alunos (nome) VALUES ('Ana');\"\n\n# Remove o container (o volume dados-postgres continua existindo)\ndocker rm -f meu-postgres\n\n# Sobe um Postgres NOVO, montando o MESMO volume\ndocker run --name meu-postgres \\\n  -e POSTGRES_PASSWORD=senha123 \\\n  -v dados-postgres:/var/lib/postgresql/data \\\n  -p 5432:5432 \\\n  -d postgres\n\ndocker exec -it meu-postgres psql -U postgres -c \"SELECT * FROM alunos;\"\n#  id | nome\n# ----+------\n#   1 | Ana"
                    },
                    {
                        "type": "text",
                        "value": "## O volume não sabe que o container mudou\n\nRepare que o segundo container nem é o mesmo container do primeiro, e nem precisa ser. O que garante a continuidade dos dados é o volume dados-postgres, montado no mesmo caminho pelos dois. Quando o Postgres inicia e encontra arquivos de dados já existentes em /var/lib/postgresql/data, ele simplesmente usa esses arquivos em vez de criar um banco vazio do zero."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cenário\",\"Dados depois de recriar o container\"],[\"Postgres sem volume\",\"Banco vazio: dados anteriores perdidos\"],[\"Postgres com -v dados-postgres:/var/lib/postgresql/data\",\"Banco intacto: dados continuam\"],[\"Postgres com bind mount num caminho vazio do host\",\"Banco novo inicializado ali, e depois persiste enquanto a pasta existir\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O container do Postgres pode ir e vir. Enquanto o volume dados-postgres continuar montado no mesmo caminho, o banco continua de onde parou."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em qual caminho, dentro do container, a imagem oficial do Postgres grava os arquivos do banco?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "/var/lib/postgresql/data",
                                "isCorrect": true
                            },
                            {
                                "text": "/etc/postgresql/data",
                                "isCorrect": false
                            },
                            {
                                "text": "/usr/local/postgres/data",
                                "isCorrect": false
                            },
                            {
                                "text": "/data/postgresql",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando sobe um Postgres montando um volume nomeado dados-postgres no caminho de dados do Postgres?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker run -v dados-postgres:/var/lib/postgresql/data postgres",
                                "isCorrect": true
                            },
                            {
                                "text": "docker run -v /var/lib/postgresql/data:dados-postgres postgres",
                                "isCorrect": false
                            },
                            {
                                "text": "docker run -v dados-postgres /var/lib/postgresql/data postgres",
                                "isCorrect": false
                            },
                            {
                                "text": "docker run --volume dados-postgres=/var/lib/postgresql/data postgres",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de criar uma tabela num Postgres containerizado com volume montado, alguém roda docker restart no container, sem remover. O que acontece com a tabela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Continua lá, porque restart não remove o container nem o volume montado",
                                "isCorrect": true
                            },
                            {
                                "text": "Some, porque restart recria o container do zero a partir da imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Continua lá, mas só porque o volume foi montado como somente leitura",
                                "isCorrect": false
                            },
                            {
                                "text": "Some, porque o Postgres reseta o diretório de dados a cada reinício",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time troca, no docker run, a tag da imagem de postgres:15 pra postgres:16, mantendo o mesmo volume dados-postgres montado no mesmo caminho. Do ponto de vista do volume, o que acontece com os arquivos que já estavam lá?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Continuam lá normalmente, porque pertencem ao volume, não à imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "São apagados, porque toda nova tag baixa uma versão vazia do volume",
                                "isCorrect": false
                            },
                            {
                                "text": "Ficam inacessíveis até alguém recriar o volume do zero com a nova tag",
                                "isCorrect": false
                            },
                            {
                                "text": "Somem, porque o volume fica preso à tag de imagem usada na criação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um container Postgres é criado com -v dados-postgres:/var/lib/postgresql/data, mas o volume dados-postgres já existia, criado por um projeto anterior, com um banco diferente dentro. O que o novo container enxerga ao iniciar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O banco antigo, porque o Postgres reaproveita os dados existentes ali",
                                "isCorrect": true
                            },
                            {
                                "text": "Um banco novo e vazio, porque cada docker run reformata o volume informado",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro fatal, porque o Postgres exige um volume recém-criado e vazio",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois bancos ao mesmo tempo, o antigo e um novo, em esquemas separados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Bind mounts e o hot reload em dev",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um bind mount\n\nUm bind mount também usa a flag -v, mas em vez de apontar pra um volume gerenciado pelo Docker, ele aponta direto pra uma pasta do seu computador, o host. O formato é -v /caminho/no/host:/caminho/no/container. Tudo que existir naquela pasta do host aparece dentro do container, no caminho indicado, e o inverso também vale: o que o container escrever ali aparece na pasta do host."
                    },
                    {
                        "type": "code",
                        "value": "# Monta a pasta atual do host dentro de /app no container\ndocker run -v $PWD:/app -w /app node:20 ls\n\n# No Windows (PowerShell), o equivalente ao $PWD é:\ndocker run -v ${PWD}:/app -w /app node:20 ls"
                    },
                    {
                        "type": "text",
                        "value": "## Hot reload: o caso clássico de uso\n\nLembra do Dockerfile da sua API Express, lá do módulo 2? Ele faz COPY do código pra dentro da imagem. Isso é ótimo pra produção, mas péssimo pra desenvolvimento: qualquer alteração no código exigiria um docker build novo pra gerar outra imagem.\n\nO bind mount resolve isso em dev. Em vez de copiar o código pra dentro da imagem, você monta a pasta do projeto, do host, direto no container. O processo Node dentro do container passa a enxergar os mesmos arquivos que você está editando no seu editor, ao vivo. Com uma ferramenta de reload (nodemon, por exemplo) rodando dentro do container, cada alteração salva no host reinicia a aplicação lá dentro, sem rebuild de imagem nenhuma."
                    },
                    {
                        "type": "code",
                        "value": "docker run \\\n  --name api-dev \\\n  -v $PWD:/app \\\n  -w /app \\\n  -p 3000:3000 \\\n  node:20 \\\n  sh -c \"npm install && npx nodemon index.js\""
                    },
                    {
                        "type": "text",
                        "value": "## Um detalhe importante: o node_modules\n\nSe a imagem já tiver um node_modules instalado (via RUN npm install no Dockerfile) e você montar a pasta do host por cima com um bind mount, o node_modules do host (que pode nem existir, ou ser de outro sistema operacional) sobrescreve o de dentro do container. Essa é uma das pegadinhas mais comuns de quem começa com bind mount em dev. Uma solução comum é somar um segundo -v, só pro node_modules, apontando pra um volume anônimo (sem nome definido) que fica por cima do bind mount naquele caminho específico."
                    },
                    {
                        "type": "code",
                        "value": "docker run \\\n  --name api-dev \\\n  -v $PWD:/app \\\n  -v /app/node_modules \\\n  -w /app \\\n  -p 3000:3000 \\\n  node:20 \\\n  sh -c \"npm install && npx nodemon index.js\""
                    },
                    {
                        "type": "quote",
                        "value": "Bind mount é a ponte entre o código que você edita no host e o processo rodando dentro do container: edite aqui, o container vê na hora."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que um bind mount faz, na prática, quando você roda docker run -v $PWD:/app?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Monta a pasta atual do host dentro do caminho /app no container",
                                "isCorrect": true
                            },
                            {
                                "text": "Copia a pasta atual do host pra dentro da imagem, de forma permanente",
                                "isCorrect": false
                            },
                            {
                                "text": "Cria um volume novo chamado $PWD dentro do Docker, vazio",
                                "isCorrect": false
                            },
                            {
                                "text": "Monta a pasta /app do container dentro da pasta atual do host",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o propósito clássico de usar bind mount em desenvolvimento, montando o código do host dentro do container?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ver as mudanças do código refletidas no container na hora, sem rebuild",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a performance de disco do container frente a um volume nomeado",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o tamanho final da imagem gerada durante o docker build",
                                "isCorrect": false
                            },
                            {
                                "text": "Permitir que o container acesse a rede local do host diretamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de configurar um bind mount pro código com -v $PWD:/app, o desenvolvedor edita um arquivo no editor do host, mas a aplicação dentro do container, sem nenhuma ferramenta de reload, continua rodando com o código antigo. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O bind mount atualiza os arquivos, mas o processo Node segue em memória",
                                "isCorrect": true
                            },
                            {
                                "text": "O bind mount não propaga edições feitas depois que o container iniciou",
                                "isCorrect": false
                            },
                            {
                                "text": "O código do host só chega ao container depois de um novo docker build",
                                "isCorrect": false
                            },
                            {
                                "text": "As edições só aparecem depois de um docker cp manual dos arquivos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto usa docker run -v $PWD:/app -v /app/node_modules imagem. Pra que serve esse segundo -v, montando um caminho do próprio container sem apontar pra lugar nenhum do host?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cria um volume anônimo pro node_modules, protegendo o que já está instalado",
                                "isCorrect": true
                            },
                            {
                                "text": "Cria um atalho pra abrir o node_modules direto no editor do host",
                                "isCorrect": false
                            },
                            {
                                "text": "Impede que o container instale qualquer dependência nova depois de iniciado",
                                "isCorrect": false
                            },
                            {
                                "text": "Sincroniza o node_modules do host com o do container, nos dois sentidos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Dockerfile roda RUN npm install, instalando o node_modules dentro da imagem. Em dev, o time monta -v $PWD:/app, sem o volume extra pro node_modules, por cima. O que acontece com as dependências dentro do container em execução?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O node_modules da imagem fica encoberto pelo bind mount da raiz",
                                "isCorrect": true
                            },
                            {
                                "text": "O node_modules da imagem continua intacto, o bind mount não sobrescreve",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois node_modules se combinam automaticamente, sem nenhum conflito",
                                "isCorrect": false
                            },
                            {
                                "text": "O container ignora o bind mount ao encontrar um node_modules dentro",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Volume x bind mount, quando usar cada",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dois jeitos de montar dados, dois objetivos diferentes\n\nVolume e bind mount usam a mesma flag (-v) e resolvem o mesmo problema geral, dados que sobrevivem ao container, mas servem a propósitos bem diferentes. Volume é armazenamento que o Docker gerencia pra você. Bind mount é uma pasta sua, do jeito que ela já é, aparecendo dentro do container."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Volume nomeado\",\"Bind mount\"],[\"Quem gerencia\",\"O Docker\",\"Você, é uma pasta comum do host\"],[\"Onde fica\",\"Área interna do Docker no host\",\"Qualquer pasta que você escolher\"],[\"Uso típico\",\"Dados de banco em produção (Postgres, Redis)\",\"Código da aplicação em desenvolvimento\"],[\"Sintaxe no docker run\",\"-v nome-do-volume:/caminho\",\"-v /caminho/host:/caminho/container\"],[\"Sobrevive ao docker rm do container\",\"Sim\",\"Sim, é só uma pasta do host\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando usar cada um\n\nRegra prática: dado que o banco precisa manter (linhas de uma tabela, arquivos de um Redis com persistência) vai em volume nomeado. Código que você está escrevendo e quer ver refletido no container sem rebuild vai em bind mount. É por isso que, mais pra frente, o docker-compose.yml da sua aplicação vai ter as duas coisas ao mesmo tempo: um volume pro Postgres, um bind mount pra API em desenvolvimento."
                    },
                    {
                        "type": "code",
                        "value": "# Volume nomeado: dados do Postgres, gerenciados pelo Docker\ndocker run --name db -v dados-postgres:/var/lib/postgresql/data -e POSTGRES_PASSWORD=senha123 -d postgres\n\n# Bind mount: código da API, controlado por você no host\ndocker run --name api -v $PWD:/app -w /app -p 3000:3000 node:20 sh -c \"npm install && npx nodemon index.js\""
                    },
                    {
                        "type": "text",
                        "value": "## Cuidados\n\nAlguns pontos merecem atenção nos dois casos:\n\n- Onde o volume fica: o Docker guarda o conteúdo de um volume numa área própria do host, visível com docker volume inspect, mas não é pra você mexer direto ali. É acessado sempre através de um container.\n- Não versionar dados: nunca coloque a pasta de dados de um volume dentro do repositório Git. O que entra no controle de versão é o código; os dados do banco crescem e mudam a cada segundo, não fazem sentido num commit.\n- Permissões: num bind mount, os arquivos criados pelo container usam o usuário configurado dentro dele, o que às vezes gera arquivos no host pertencentes a um usuário diferente do seu. Vale atenção quando o processo dentro do container roda como root."
                    },
                    {
                        "type": "code",
                        "value": "docker volume inspect dados-postgres\n# [\n#   {\n#     \"Name\": \"dados-postgres\",\n#     \"Mountpoint\": \"/var/lib/docker/volumes/dados-postgres/_data\",\n#     \"Driver\": \"local\"\n#   }\n# ]"
                    },
                    {
                        "type": "quote",
                        "value": "Volume pra dado que o Docker deve gerenciar, bind mount pra pasta que você quer enxergar e editar. Um não substitui o outro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Pra persistir os dados de um Postgres em produção, qual das opções é a mais indicada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Volume nomeado, porque é um armazenamento gerenciado pelo Docker",
                                "isCorrect": true
                            },
                            {
                                "text": "Volume nomeado, porque sincroniza os dados direto com o repositório Git",
                                "isCorrect": false
                            },
                            {
                                "text": "Bind mount, porque aponta direto pra uma pasta escolhida por você",
                                "isCorrect": false
                            },
                            {
                                "text": "Bind mount, porque cria uma cópia dos dados dentro da própria imagem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Pra montar o código de uma API Express no container em desenvolvimento, com hot reload, qual opção faz mais sentido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Bind mount, porque reflete direto as edições feitas no host",
                                "isCorrect": true
                            },
                            {
                                "text": "Bind mount, porque grava uma cópia do código dentro da imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Volume nomeado, porque o Docker sincroniza com o editor sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Volume nomeado, porque cria automaticamente um túnel com o host",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time monta um volume nomeado no lugar do código da API em dev, em vez de bind mount. Depois de horas editando arquivos no editor do host, nada muda dentro do container. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O volume não é a pasta do host: editar lá não afeta o que está dentro dele",
                                "isCorrect": true
                            },
                            {
                                "text": "O volume nomeado exige reiniciar o Docker Desktop a cada edição salva",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta instalar o nodemon dentro do container pra o volume detectar mudanças",
                                "isCorrect": false
                            },
                            {
                                "text": "O volume nomeado só sincroniza edições feitas a partir de outro container",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um Dockerfile de produção não tem nenhum bind mount, só a imagem com o código copiado via COPY. Isso é um problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não, a imagem de produção já traz o código pronto, sem depender do host",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, toda imagem de produção também precisa de um bind mount do código",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, mas só funciona se houver um volume nomeado apontando pro código",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, sem bind mount o container não consegue iniciar o processo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O docker-compose.yml de um projeto usa, ao mesmo tempo, um volume nomeado pro Postgres e um bind mount pro código da API. Por que essa combinação faz sentido, em vez de usar só um tipo pros dois casos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o banco precisa de armazenamento gerenciado, e o código, do host",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque bind mount é mais rápido, mas não funciona com bancos de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque volume nomeado tem um limite de tamanho menor que bind mount",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só é possível montar um volume por vez em cada docker-compose.yml",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Orquestrando com Docker Compose",
        "aulas": [
            {
                "titulo": "O problema de subir vários containers na mão",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O problema de subir vários containers na mão\n\nNos módulos anteriores você aprendeu a empacotar uma API Node num Dockerfile, construir a imagem e rodar o container com `docker run`. Também viu como usar volumes pra guardar dados que sobrevivem além do container. Isso resolve bem o caso de UM container.\n\nMas uma aplicação de verdade quase nunca é só isso. Pensa na sua API: ela precisa de um Postgres pra guardar dados e de um Redis pra cache e fila (aquele mesmo Postgres da trilha de banco, aquele mesmo Redis da trilha de cache). São três peças, três containers, cada um com sua imagem, suas portas, suas variáveis de ambiente e, no caso do banco, seu volume.\n\n## Subindo tudo na mão\n\nPra essas três peças conversarem, elas precisam estar na mesma rede Docker. O roteiro manual seria mais ou menos assim: criar uma rede, subir o Postgres nela com usuário, senha e um volume pro dado, subir o Redis, e só depois subir a API, garantindo que ela recebeu o endereço certo do banco e do cache."
                    },
                    {
                        "type": "code",
                        "value": "# 1. criar uma rede pros containers se acharem\ndocker network create minha-app-net\n\n# 2. subir o Postgres, com volume pro dado e variaveis de acesso\ndocker run -d \\\n  --name db \\\n  --network minha-app-net \\\n  -e POSTGRES_USER=admin \\\n  -e POSTGRES_PASSWORD=senha123 \\\n  -e POSTGRES_DB=app \\\n  -v pgdata:/var/lib/postgresql/data \\\n  postgres:16\n\n# 3. subir o Redis\ndocker run -d \\\n  --name redis \\\n  --network minha-app-net \\\n  redis:7\n\n# 4. so agora subir a API, depois que o banco e o cache ja existem\ndocker run -d \\\n  --name api \\\n  --network minha-app-net \\\n  -p 3000:3000 \\\n  -e DATABASE_URL=postgresql://admin:senha123@db:5432/app \\\n  -e REDIS_URL=redis://redis:6379 \\\n  minha-api:1.0"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso dói\n\nEsse roteiro funciona, mas tem vários problemas:\n- **Ordem importa**: se você subir a API antes do banco existir, ela quebra na primeira query.\n- **Flags demais**: são quatro comandos, cada um com várias flags. Esquecer uma (tipo o `--network`) já quebra tudo.\n- **Nada fica documentado**: se outro dev do time precisar subir o ambiente, ele tem que adivinhar ou pedir esses comandos pra você.\n- **Refazer do zero é penoso**: se você quiser derrubar tudo e subir de novo, são quatro `docker stop`, quatro `docker rm`, e repetir os quatro `docker run`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Na mão (docker run)\", \"Docker Compose\"], [\"Onde fica o comando\", \"Decorado ou num script solto\", \"Um arquivo versionado (docker-compose.yml)\"], [\"Ordem de subida\", \"Você controla manualmente\", \"depends_on declara a ordem\"], [\"Rede entre containers\", \"Precisa criar e lembrar de usar em cada run\", \"O Compose cria e conecta tudo sozinho\"], [\"Subir tudo de novo\", \"Repetir vários comandos longos\", \"Um comando só\"], [\"Compartilhar com o time\", \"Copiar e colar comandos\", \"git pull e pronto\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que vem por aí\n\nEsse é exatamente o problema que o **Docker Compose** resolve. Em vez de uma sequência de comandos `docker run`, você descreve a stack inteira (API, Postgres, Redis, cada uma com sua configuração) em um único arquivo declarativo. Aí sobe tudo com um comando só, na ordem certa, na mesma rede. É isso que você vai escrever nas próximas aulas."
                    },
                    {
                        "type": "quote",
                        "value": "Cada container isolado até que precisa conversar com outro: é aí que o docker run na mão vira um roteiro frágil, e é aí que o Compose entra."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que uma aplicação real geralmente precisa de mais de um container?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque cada imagem Docker só roda por um tempo limitado antes de precisar ser trocada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ela depende de outras peças, como banco e cache, cada uma numa imagem própria.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Docker cria, por padrão, um container extra só pra cuidar da rede da aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um Dockerfile não pode ter mais de uma instrução RUN dentro do mesmo arquivo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo dos comandos na mão (docker run separados pra rede, banco, cache e API), o que acontece se a API subir antes do Postgres existir?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A API quebra ao tentar rodar a primeira query, porque o banco que ela espera ainda não existe.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada acontece, porque o Docker adia toda conexão de rede até os containers ficarem prontos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A API sobe normalmente, mas fica sem acesso à internet até o Postgres ser criado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker cancela a criação da API e refaz a ordem dos containers sozinho.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o papel da rede criada manualmente com docker network create no roteiro de subir os containers na mão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ela limita quanto de memória cada container pode usar durante a execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela substitui a necessidade de expor portas com a flag -p em qualquer container.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela permite que os containers conectados a ela consigam se encontrar e conversar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela impede que dois containers usem a mesma imagem ao mesmo tempo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além da ordem de subida, qual é outro problema prático de gerenciar vários docker run separados pra montar uma stack?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São vários comandos longos e cheios de flags, fáceis de esquecer e difíceis de repassar.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Docker cobra por cada comando docker run adicional executado no mesmo host.",
                                "isCorrect": false
                            },
                            {
                                "text": "Containers criados por comandos separados nunca conseguem compartilhar a mesma rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada docker run novo apaga silenciosamente os containers criados antes dele.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dev do time recebeu só a lista de comandos docker run usados pra montar a stack e tentou reproduzir o ambiente do zero numa outra máquina. Qual é o risco mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Docker recusa recriar containers com nomes usados antes, mesmo em outra máquina.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esquecer ou trocar uma flag, como a rede ou uma variável, e a stack subir incompleta.",
                                "isCorrect": true
                            },
                            {
                                "text": "As imagens usadas nos comandos somem do Docker Hub depois do primeiro uso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os volumes criados na máquina original são copiados sozinhos pra máquina nova.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O docker-compose.yml: services, ports, environment e volumes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O arquivo docker-compose.yml\n\nO Docker Compose usa um arquivo YAML, normalmente chamado `docker-compose.yml`, na raiz do projeto. Nele você descreve cada peça da sua stack como um **service**: a API, o Postgres, o Redis. O arquivo é declarativo, ou seja, você diz o que quer (essas três peças, com essas portas e variáveis) e o Compose cuida de criar, conectar e subir tudo."
                    },
                    {
                        "type": "text",
                        "value": "## Anatomia de um service\n\nDentro de `services`, cada chave é o nome de um service, e por baixo dele ficam as configurações daquele container:\n- **image**: qual imagem pronta usar (ex.: `postgres:16`, do Docker Hub).\n- **build**: em vez de uma imagem pronta, constrói a partir de um Dockerfile.\n- **ports**: quais portas do host mapeiam pra quais portas do container.\n- **environment**: variáveis de ambiente que o container recebe.\n- **volumes**: onde persistir dados ou montar código do host.\n- **depends_on**: em qual ordem os services devem subir.\n- **networks**: em quais redes o service participa (por padrão, o Compose já cria uma rede pra stack toda)."
                    },
                    {
                        "type": "code",
                        "value": "services:\n  redis:\n    image: redis:7\n    ports:\n      - \"6379:6379\""
                    },
                    {
                        "type": "text",
                        "value": "## image ou build\n\nPra peças prontas, como o banco ou o cache, você usa `image` e aponta pra uma imagem publicada no Docker Hub (é o mesmo Postgres e o mesmo Redis que você já conhece das trilhas de banco e cache). Já pra sua própria API, você não tem uma imagem pronta por aí: você usa `build`, apontando pro diretório que tem o Dockerfile (aquele que você escreveu no módulo 2). O Compose constrói a imagem local antes de subir o container."
                    },
                    {
                        "type": "code",
                        "value": "services:\n  api:\n    build: .\n    ports:\n      - \"3000:3000\"\n    environment:\n      - NODE_ENV=development\n      - PORT=3000\n    volumes:\n      - .:/app\n      - /app/node_modules"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Chave\", \"O que faz\", \"Exemplo\"], [\"image\", \"Usa uma imagem pronta de um registry\", \"image: postgres:16\"], [\"build\", \"Constrói a imagem a partir de um Dockerfile local\", \"build: .\"], [\"ports\", \"Mapeia porta do host pra porta do container\", \"ports: - \\\"3000:3000\\\"\"], [\"environment\", \"Define variáveis de ambiente do container\", \"environment: - PORT=3000\"], [\"volumes\", \"Persiste dados ou monta código do host\", \"volumes: - pgdata:/var/lib/postgresql/data\"], [\"depends_on\", \"Define a ordem de subida entre services\", \"depends_on: - db\"], [\"networks\", \"Liga o service a uma rede específica\", \"networks: - minha-rede\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O docker-compose.yml é a planta baixa da sua stack: cada service, sua imagem, suas portas e suas variáveis, tudo num lugar só, versionado junto com o código."
                    }
                ],
                "questions": [
                    {
                        "statement": "No docker-compose.yml, o que representa cada chave dentro de services?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um container da stack, com sua própria imagem, portas e variáveis de ambiente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma pasta do projeto que vai ser copiada pra dentro da imagem final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um comando isolado que o Compose só executa uma única vez ao subir a stack.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um usuário do sistema que vai ter permissão de rodar aquele container.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença entre usar image e usar build num service do compose?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "image baixa a imagem toda vez que sobe, build usa sempre uma imagem em cache.",
                                "isCorrect": false
                            },
                            {
                                "text": "image usa uma imagem pronta de um registry, build constrói a partir de um Dockerfile.",
                                "isCorrect": true
                            },
                            {
                                "text": "image só funciona pra bancos de dados, build só funciona pra aplicações próprias.",
                                "isCorrect": false
                            },
                            {
                                "text": "image cria um container temporário, build cria sempre um container permanente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Pra que serve a chave environment num service do docker-compose.yml?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pra escolher em qual sistema operacional a imagem daquele service vai rodar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pra definir quantas réplicas daquele container o Compose deve manter no ar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pra definir variáveis de ambiente que o container recebe assim que é criado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pra listar quais outros services precisam subir antes daquele service.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No service da api, o compose tem volumes com \".:/app\" e depois \"/app/node_modules\". Qual o efeito prático dessas duas linhas juntas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O código do host fica montado no container, sem que o node_modules do host o sobrescreva.",
                                "isCorrect": true
                            },
                            {
                                "text": "O container ganha duas cópias do código, uma só de leitura e outra de escrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Compose ignora a pasta node_modules em qualquer ambiente, dentro ou fora do container.",
                                "isCorrect": false
                            },
                            {
                                "text": "A imagem é reconstruída sozinha sempre que algum arquivo do host muda de nome.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um service tem build: . e o Dockerfile dele muda depois que a imagem já existe localmente. O que precisa acontecer pra imagem refletir essa mudança no próximo up?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nada: o Compose detecta sozinho qualquer alteração no Dockerfile a cada docker compose ps.",
                                "isCorrect": false
                            },
                            {
                                "text": "A imagem precisa ser reconstruída, já que o Compose não refaz o build sozinho a cada subida.",
                                "isCorrect": true
                            },
                            {
                                "text": "As variáveis de environment precisam ser apagadas antes de qualquer novo build funcionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O service precisa trocar de build: . pra image: . pra aceitar a mudança.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escrevendo um compose com API, Postgres e Redis",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Hora de juntar tudo\n\nVocê já viu a anatomia de um service e como usar image, build, ports, environment e volumes separadamente. Agora vamos escrever o docker-compose.yml completo pra uma stack de verdade: a API Node (construída a partir do Dockerfile do módulo 2), um Postgres e um Redis, exatamente as três peças que abriram esse módulo."
                    },
                    {
                        "type": "code",
                        "value": "# Dockerfile da api, o mesmo do modulo 2\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD [\"npm\", \"start\"]"
                    },
                    {
                        "type": "code",
                        "value": "services:\n  api:\n    build: .\n    ports:\n      - \"3000:3000\"\n    environment:\n      - NODE_ENV=development\n      - PORT=3000\n      - DATABASE_URL=postgresql://admin:senha123@db:5432/app\n      - REDIS_URL=redis://redis:6379\n    depends_on:\n      - db\n      - redis\n\n  db:\n    image: postgres:16\n    ports:\n      - \"5432:5432\"\n    environment:\n      - POSTGRES_USER=admin\n      - POSTGRES_PASSWORD=senha123\n      - POSTGRES_DB=app\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\n  redis:\n    image: redis:7\n    ports:\n      - \"6379:6379\"\n    volumes:\n      - redisdata:/data\n\nvolumes:\n  pgdata:\n  redisdata:"
                    },
                    {
                        "type": "text",
                        "value": "## Por trás de cada linha\n\n- O service `api` usa `build: .`: o Compose vai procurar um Dockerfile no diretório atual e construir a imagem antes de subir o container.\n- `DATABASE_URL` e `REDIS_URL` apontam pros hosts `db` e `redis`, que são exatamente os **nomes dos services** de Postgres e Redis, não `localhost`. Isso vai fazer mais sentido na aula sobre a rede do Compose.\n- `depends_on` garante que o Compose suba `db` e `redis` antes de `api`, o que evita (mas não elimina totalmente, como você vai ver no módulo 6) o erro de conexão recusada logo de cara.\n- No service `db`, as variáveis `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` são lidas pela própria imagem oficial do Postgres pra criar o banco inicial."
                    },
                    {
                        "type": "text",
                        "value": "## Os volumes nomeados\n\nNo fim do arquivo, a chave `volumes` (no nível raiz, não dentro de um service) declara os volumes nomeados usados pela stack: `pgdata` guarda os arquivos do Postgres, `redisdata` guarda o dump do Redis. Isso é o que você aprendeu no módulo 4: sem esse volume, os dados do banco sumiriam toda vez que o container `db` fosse removido. Com o Compose, esse volume sobrevive a um `docker compose down` (a não ser que você peça pra removê-lo também, como vai ver na próxima aula)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Service\", \"Imagem ou build\", \"Porta\", \"Guarda\"], [\"api\", \"build a partir do Dockerfile local\", \"3000\", \"o código da aplicação\"], [\"db\", \"postgres:16\", \"5432\", \"os dados do banco, no volume pgdata\"], [\"redis\", \"redis:7\", \"6379\", \"cache e filas, no volume redisdata\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um docker-compose.yml de verdade não é só sintaxe: cada porta, cada variável e cada volume ali é uma decisão sobre como as peças da aplicação vão se encontrar."
                    }
                ],
                "questions": [
                    {
                        "statement": "No docker-compose.yml dessa aula, por que o service api usa build: . em vez de image?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque containers de API não podem usar imagens publicadas em nenhum registry.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a API é uma aplicação própria, sem imagem pronta, então precisa ser construída ali.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque build: . deixa qualquer container rodar mais rápido do que usar uma image pronta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só é possível expor portas em services que usam build, nunca em image.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No service db do exemplo, pra que servem POSTGRES_USER, POSTGRES_PASSWORD e POSTGRES_DB em environment?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "São lidas pela imagem do Postgres pra criar o usuário, a senha e o banco.",
                                "isCorrect": true
                            },
                            {
                                "text": "Configuram o nome do container que vai aparecer no docker compose ps.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definem em qual porta do host o Postgres vai ficar disponível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolhem qual versão da imagem do Postgres vai ser baixada do Docker Hub.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a função de depends_on no service api, apontando pra db e redis?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Garante que api só suba se db e redis já tiverem, no mínimo, uma hora no ar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Garante que db e redis comecem a subir antes de api, na ordem declarada no arquivo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Impede que api seja removida enquanto db ou redis ainda existirem na máquina.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faz api herdar automaticamente as variáveis de ambiente definidas em db e redis.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o docker-compose.yml declara pgdata e redisdata na chave volumes do nível raiz, fora de qualquer service?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque assim eles ficam definidos como volumes nomeados, disponíveis pra qualquer service usar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque volumes só funcionam se forem declarados fora dos services, por limitação do Compose.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque isso faz o Compose montar esses volumes automaticamente em todos os services.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque colocar volumes dentro de um service impediria aquele container de expor portas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Rodando docker compose down (sem -v) depois de usar essa stack por um tempo, o que acontece com os dados gravados no Postgres via volume pgdata?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Somem junto com os containers, porque down remove containers e todos os volumes usados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ficam guardados dentro da imagem postgres:16, prontos pra qualquer novo container que a use.",
                                "isCorrect": false
                            },
                            {
                                "text": "Continuam existindo no volume nomeado, prontos pra serem montados de novo num próximo up.",
                                "isCorrect": true
                            },
                            {
                                "text": "São movidos automaticamente pra dentro do Dockerfile da api, como um backup de segurança.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "up, down, logs: gerenciando a stack",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Subindo e derrubando a stack\n\nCom o docker-compose.yml pronto (o da aula anterior), gerenciar a API, o Postgres e o Redis vira questão de poucos comandos. Esquece aqueles vários `docker run` na mão: agora é o Compose que orquestra tudo.\n\nUm único comando, `docker compose up`, faz o trabalho que antes exigia vários `docker run` em sequência:\n- lê o `docker-compose.yml` da pasta atual;\n- constrói a imagem da `api` (usa o `build: .`), caso essa imagem ainda não exista localmente;\n- cria uma rede pra stack, se ainda não existir;\n- cria os volumes nomeados (`pgdata`, `redisdata`), se ainda não existirem;\n- sobe os containers respeitando o `depends_on`: primeiro `db` e `redis`, depois `api`;\n- junta os logs dos três containers no mesmo terminal.\n\nUm detalhe importante: se você mudar o Dockerfile depois que a imagem já existe, o `up` sozinho não percebe a mudança. Pra forçar a reconstrução, use `docker compose up --build` ou `docker compose build` antes."
                    },
                    {
                        "type": "code",
                        "value": "# sobe tudo e fica preso ao terminal, mostrando os logs em tempo real\ndocker compose up\n\n# reconstroi as imagens antes de subir (necessario se o Dockerfile mudou)\ndocker compose up --build\n\n# Ctrl+C derruba a stack\n\n# sobe tudo em segundo plano (detached) e devolve o terminal\ndocker compose up -d"
                    },
                    {
                        "type": "text",
                        "value": "## Rodando em segundo plano\n\nNo dia a dia, o mais comum é usar `docker compose up -d`: a stack sobe em background e você continua usando o terminal pra outras coisas. Sem o `-d`, os logs de API, banco e cache ficam todos misturados na tela, o que só costuma ajudar quando você está depurando algo bem no início."
                    },
                    {
                        "type": "code",
                        "value": "# lista os containers da stack, com status e portas\ndocker compose ps\n\n# mostra os logs de todos os services\ndocker compose logs\n\n# segue os logs em tempo real, so da api\ndocker compose logs -f api\n\n# para e remove os containers e a rede, mas mantem os volumes\ndocker compose down\n\n# para e remove containers, rede E volumes (apaga os dados do banco e do cache)\ndocker compose down -v"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\", \"O que faz\"], [\"docker compose up\", \"Constrói se preciso, cria rede e volumes, sobe todos os services\"], [\"docker compose up -d\", \"A mesma coisa, mas em segundo plano\"], [\"docker compose ps\", \"Lista os containers da stack e o status de cada um\"], [\"docker compose logs\", \"Mostra os logs acumulados de todos os services\"], [\"docker compose logs -f api\", \"Segue em tempo real os logs de um service específico\"], [\"docker compose down\", \"Para e remove containers e rede, mantendo os volumes\"], [\"docker compose down -v\", \"Para e remove containers, rede e também os volumes\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "up sobe, down derruba, logs mostra o que está acontecendo: três comandos que substituem uma dezena de docker run decorados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a diferença prática entre docker compose up e docker compose up -d?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "up ocupa o terminal mostrando logs ao vivo, up -d sobe a stack em segundo plano.",
                                "isCorrect": true
                            },
                            {
                                "text": "up sobe só a api, up -d sobe api, db e redis juntos numa única vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "up cria os volumes da stack, up -d nunca cria volume nenhum em nenhuma hipótese.",
                                "isCorrect": false
                            },
                            {
                                "text": "up serve só pra produção, up -d serve só pro ambiente local de desenvolvimento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de subir a stack com docker compose up -d, qual comando mostra quais containers estão rodando e o status de cada um?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker compose build",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose logs",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose ps",
                                "isCorrect": true
                            },
                            {
                                "text": "docker compose down",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer acompanhar, em tempo real, só os logs novos do container da api, sem misturar com os de db e redis. Qual comando faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "docker compose logs api",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose logs -f api",
                                "isCorrect": true
                            },
                            {
                                "text": "docker compose ps api",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose logs db redis",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar docker compose down sem a flag -v, o que continua existindo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os volumes nomeados da stack, como pgdata, com os dados que já tinham sido gravados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os containers da stack, só que parados e prontos pra reiniciar com compose start.",
                                "isCorrect": false
                            },
                            {
                                "text": "A rede criada pelo Compose, ainda conectando os containers mesmo depois de removidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "As portas mapeadas no host, que continuam reservadas até o próximo compose up.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um container da api está reiniciando sem parar logo depois do docker compose up -d. Qual comando ajuda a entender o motivo sem derrubar a stack inteira?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "docker compose stop api, que impede o container de tentar subir de novo em qualquer situação.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose logs api, pra ver a mensagem de erro que está levando ao restart.",
                                "isCorrect": true
                            },
                            {
                                "text": "docker compose images, que mostra o conteúdo completo do Dockerfile usado pela imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose build --no-cache, que sempre resolve qualquer problema de container reiniciando.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A rede do Compose: um service acha o outro pelo nome",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que `db` e não `localhost`\n\nRepara de novo no `docker-compose.yml` da aula 3: a `api` se conecta ao banco usando `DATABASE_URL=postgresql://admin:senha123@db:5432/app` e ao Redis usando `REDIS_URL=redis://redis:6379`. Os hosts são `db` e `redis`, exatamente os nomes dos services no arquivo. Não é coincidência, e não seria `localhost`. Entender por quê é a peça que falta pra fechar o Compose.\n\nQuando você roda `docker compose up`, o Compose cria uma rede própria pra aquele projeto e conecta todos os services dela automaticamente. Você não precisou escrever nenhuma seção `networks` no seu `docker-compose.yml` pra isso funcionar: é o comportamento padrão. Isso já é uma diferença enorme em relação aos `docker run` na mão, onde você tinha que criar a rede manualmente e lembrar de usar `--network` em cada comando."
                    },
                    {
                        "type": "text",
                        "value": "## Resolvendo nomes por DNS\n\nDentro dessa rede, o Compose mantém um DNS interno que resolve o **nome do service** pro endereço IP do container certo. Quando o container da `api` tenta se conectar em `db`, o Docker resolve `db` pro IP atual do container do Postgres, sem você precisar descobrir ou fixar esse IP em lugar nenhum. Se o container do banco reiniciar e ganhar outro IP, a resolução por nome continua funcionando, então a API nem percebe a diferença."
                    },
                    {
                        "type": "text",
                        "value": "## Por que localhost não serve\n\nCada container tem seu próprio namespace de rede, com seu próprio `localhost` (o endereço de loopback `127.0.0.1`). Dentro do container da `api`, `localhost` aponta pro **próprio container da api**, não pro container do Postgres, nem pro computador que está rodando o Docker. Se você trocasse `DATABASE_URL` pra usar `localhost` em vez de `db`, a API tentaria abrir uma conexão Postgres dentro dela mesma, onde não existe Postgres nenhum rodando, e o resultado seria erro de conexão recusada."
                    },
                    {
                        "type": "code",
                        "value": "# entra no container da api com um shell\ndocker compose exec api sh\n\n# de dentro do container, o nome \"db\" resolve pro Postgres\ngetent hosts db\n\n# e \"redis\" resolve pro Redis\ngetent hosts redis\n\n# mas \"localhost\" aqui dentro e o proprio container da api\ngetent hosts localhost"
                    },
                    {
                        "type": "text",
                        "value": "## A própria plataforma funciona assim\n\nO ensina.dev roda em cima disso: o backend, o banco, o Redis e o frontend sobem via Docker Compose, e cada um acha o outro pelo nome do service, exatamente como no exemplo desse módulo. O backend fala com o Postgres pelo host `db` e com o Redis pelo host `redis`, nunca por `localhost`. É a mesma lógica que você acabou de aprender, rodando na plataforma que você usa pra estudar."
                    },
                    {
                        "type": "quote",
                        "value": "Dentro da rede do Compose, o nome do service é o endereço. localhost só serve pra falar com o próprio container."
                    }
                ],
                "questions": [
                    {
                        "statement": "No docker-compose.yml da aula 3, por que a API se conecta ao banco usando o host db, e não localhost?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque db é o nome do service do Postgres, e é por esse nome que os containers se acham na rede.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque localhost é uma palavra reservada que o Docker bloqueia em qualquer variável de ambiente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só é possível usar localhost quando o service usa image, nunca quando usa build.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque db é o endereço IP fixo que o Postgres sempre recebe em qualquer instalação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o Compose cria automaticamente pra conectar os services de um docker-compose.yml, mesmo sem você declarar nada em networks?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um volume nomeado compartilhado entre todos os services da stack.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma rede própria da stack, que conecta todos os services automaticamente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um túnel direto entre o host e cada container, ignorando a rede local.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um segundo Dockerfile, só pra configurar a parte de rede da aplicação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro do container da api, pra onde aponta o hostname localhost?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aponta pro container do Postgres, já que ele é o primeiro a subir na ordem do depends_on.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aponta pro computador que está rodando o Docker, fora de qualquer container.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aponta pro próprio container da api, não pros outros containers nem pro host.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aponta pra rede inteira do Compose, incluindo api, db e redis ao mesmo tempo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A api está configurada com DATABASE_URL usando localhost em vez de db, dentro de uma stack subida via Compose. O que deve acontecer ao tentar conectar no banco?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A conexão funciona normalmente, porque o Compose traduz localhost pro nome do service.",
                                "isCorrect": false
                            },
                            {
                                "text": "A conexão falha, porque dentro do container da api não existe Postgres nenhum rodando ali.",
                                "isCorrect": true
                            },
                            {
                                "text": "A conexão funciona, mas só depois que o container da api for reiniciado de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A conexão falha só na primeira tentativa, e depois passa a funcionar sozinha.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se o container do Postgres reiniciar e receber um novo endereço IP internamente, por que a api continua conseguindo se conectar em db sem nenhuma mudança de configuração?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o Compose fixa o mesmo IP pro container do Postgres pra sempre, mesmo depois de reiniciar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a api guarda em cache o primeiro IP do Postgres e ignora qualquer mudança depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a resolução acontece pelo nome do service, e o DNS interno aponta db pro IP atual.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque toda comunicação entre containers do Compose passa direto pelo host, sem depender de IP.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Juntando o back-end: app, Postgres e Redis",
        "aulas": [
            {
                "titulo": "Conectando a API ao Postgres e Redis pelo nome do service",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 6: juntando o back-end com Postgres e Redis\n\nNos módulos anteriores você escreveu um Dockerfile, subiu containers, persistiu dados com volumes e orquestrou tudo com o Docker Compose. Chegou a hora de juntar as peças: a API que você já construiu (com **Express**, **pg** pro Postgres e **ioredis** pro Redis) rodando ao lado do banco e do cache, todos containerizados.\n\nA primeira pergunta que todo mundo faz é simples: como a API acha o Postgres e o Redis, se eles não estão mais em localhost?\n\n## O host não é mais localhost\n\nNo Módulo 5 você viu que, dentro da rede que o Compose cria, cada service enxerga os outros pelo **nome do service**, não por localhost e não por IP fixo. Isso vale pra qualquer conexão de rede, incluindo a conexão da sua API com o banco e com o cache.\n\nSe o seu docker-compose.yml declara um service chamado **db** pro Postgres e um **redis** pro Redis, é esse nome que entra na connection string da API:\n\n- Postgres: host db\n- Redis: host redis\n\nNada de localhost, 127.0.0.1 ou o IP que o container recebeu. Esses endereços só fariam sentido se a API estivesse rodando fora do compose, direto na sua máquina."
                    },
                    {
                        "type": "code",
                        "value": "services:\n  backend:\n    build: .\n    ports:\n      - \"3000:3000\"\n    environment:\n      DATABASE_URL: postgres://app:app123@db:5432/app\n      REDIS_URL: redis://redis:6379\n    depends_on:\n      - db\n      - redis\n\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: app\n      POSTGRES_PASSWORD: app123\n      POSTGRES_DB: app\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\n  redis:\n    image: redis:7-alpine\n\nvolumes:\n  pgdata:"
                    },
                    {
                        "type": "text",
                        "value": "## A DATABASE_URL passada por environment\n\nRepare que a DATABASE_URL usa **db** como host, a porta 5432 de sempre, e as credenciais que o service db recebeu em POSTGRES_USER e POSTGRES_PASSWORD. Ela chega até o container da API pelo bloco **environment**, do mesmo jeito que outras variáveis em módulos anteriores.\n\nÉ o mesmo formato de connection string que você já usava com o pg fora de container. Muda o host (de localhost pra db), o resto é igual."
                    },
                    {
                        "type": "code",
                        "value": "// db.js\nconst { Pool } = require('pg');\n\nconst pool = new Pool({\n  connectionString: process.env.DATABASE_URL,\n});\n\nmodule.exports = pool;\n\n// routes/usuarios.js\nconst pool = require('../db');\n\napp.get('/usuarios', async (req, res) => {\n  const { rows } = await pool.query('SELECT id, nome FROM usuarios');\n  res.json(rows);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## O mesmo vale pro Redis\n\nO ioredis, que você já usa pra cache e filas, lê a REDIS_URL do mesmo jeito. Trocando o host de localhost pra **redis**, a API conecta no Redis do compose sem mudar mais nada no código."
                    },
                    {
                        "type": "code",
                        "value": "// cache.js\nconst Redis = require('ioredis');\n\nconst redis = new Redis(process.env.REDIS_URL);\n\nredis.on('connect', () => console.log('Conectado ao Redis'));\nredis.on('error', (err) => console.error('Erro no Redis:', err));\n\nmodule.exports = redis;"
                    },
                    {
                        "type": "quote",
                        "value": "A regra é uma só: dentro do Compose, um service acha o outro pelo nome do service. O host da sua DATABASE_URL e da sua REDIS_URL é db e redis, não localhost."
                    }
                ],
                "questions": [
                    {
                        "statement": "No docker-compose.yml, qual host a API deve usar pra conectar no Postgres do compose?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O nome do service do Postgres no compose, por exemplo db",
                                "isCorrect": true
                            },
                            {
                                "text": "localhost, do jeito que a API acessava antes de usar Docker",
                                "isCorrect": false
                            },
                            {
                                "text": "O IP interno do container, anotado à mão depois do build",
                                "isCorrect": false
                            },
                            {
                                "text": "127.0.0.1, já que os dois containers estão na mesma máquina",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Onde a API costuma receber a DATABASE_URL quando roda como service num docker-compose.yml?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "No bloco environment do service da API, no docker-compose.yml",
                                "isCorrect": true
                            },
                            {
                                "text": "Direto no código-fonte, escrita fixa na linha de conexão",
                                "isCorrect": false
                            },
                            {
                                "text": "Num arquivo dentro da imagem, copiado pelo Dockerfile",
                                "isCorrect": false
                            },
                            {
                                "text": "No comando docker build, como uma flag de build",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A API já usava pg e ioredis antes de virar container. O que muda no código pra ela rodar dentro do compose?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Praticamente nada no código, só o host na connection string muda",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar pg e ioredis por bibliotecas específicas pra Docker",
                                "isCorrect": false
                            },
                            {
                                "text": "Reescrever as queries pra usar a sintaxe de rede do Compose",
                                "isCorrect": false
                            },
                            {
                                "text": "Parar de usar variáveis de ambiente e fixar valores no código",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num compose com os services backend, db (Postgres) e redis, qual string de conexão do Redis está correta pra API rodando dentro do compose?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "redis://redis:6379",
                                "isCorrect": true
                            },
                            {
                                "text": "redis://localhost:6379",
                                "isCorrect": false
                            },
                            {
                                "text": "redis://backend:6379",
                                "isCorrect": false
                            },
                            {
                                "text": "redis://127.0.0.1:6379",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A API roda num container separado do Postgres. Por que ela não consegue usar localhost pra chegar no banco, mesmo os dois containers estando na mesma máquina host?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Cada container tem seu próprio localhost, que aponta pra ele mesmo, não pros outros",
                                "isCorrect": true
                            },
                            {
                                "text": "O Docker bloqueia o acesso a localhost por padrão dentro de todo o container",
                                "isCorrect": false
                            },
                            {
                                "text": "localhost só funcionaria se o Postgres também expusesse essa porta 5432 pro host",
                                "isCorrect": false
                            },
                            {
                                "text": "O Compose remove a interface de loopback de dentro de cada container da rede",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "depends_on: ordem não é o mesmo que pronto",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## depends_on garante ordem, não prontidão\n\nNo Módulo 5 você usou depends_on pra fazer o Compose subir o banco antes da API. Existe uma pegadinha aí que derruba muita gente: depends_on, na forma simples (uma lista de nomes), garante só a **ordem de início dos containers**. Ele não espera o Postgres ficar pronto pra aceitar conexões, só espera o container do Postgres começar a rodar.\n\nSão coisas diferentes. O container pode aparecer como \"Up\" no docker ps enquanto o processo do Postgres lá dentro ainda está inicializando."
                    },
                    {
                        "type": "code",
                        "value": "services:\n  backend:\n    build: .\n    environment:\n      DATABASE_URL: postgres://app:app123@db:5432/app\n      REDIS_URL: redis://redis:6379\n    depends_on:\n      - db\n      - redis\n\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: app\n      POSTGRES_PASSWORD: app123\n      POSTGRES_DB: app\n\n  redis:\n    image: redis:7-alpine"
                    },
                    {
                        "type": "text",
                        "value": "## Por que o Postgres demora pra ficar pronto\n\nQuando o container do db sobe pela primeira vez, o Postgres precisa inicializar o diretório de dados, criar o banco declarado em POSTGRES_DB e só então passar a aceitar conexões na porta 5432. Isso leva alguns segundos. Enquanto isso, o Docker já considera o container \"iniciado\", porque o processo principal (o postgres) começou a rodar.\n\nSe a API tentar conectar nesse intervalo, a conexão é recusada."
                    },
                    {
                        "type": "code",
                        "value": "$ docker compose up\n...\nbackend-1  | Iniciando servidor...\nbackend-1  | Error: connect ECONNREFUSED 172.19.0.3:5432\nbackend-1  |     at TCPConnectWrap.afterConnect [as oncomplete]\ndb-1       | 2026-07-12 10:15:03.100 UTC [1] LOG:  database system is ready to accept connections"
                    },
                    {
                        "type": "text",
                        "value": "## A saída: a app lida com isso\n\nComo o depends_on simples não espera o banco ficar pronto, é a própria aplicação que precisa se defender. Duas saídas comuns:\n\n- **Retry na conexão**: a API tenta conectar, falha, espera um pouco e tenta de novo, até conseguir.\n- **Health check no Compose**: o Compose só considera o db pronto quando um comando de verificação passar, e a API só sobe depois disso (é o assunto da próxima aula).\n\nAs duas se complementam: mesmo com health check na subida, uma boa API resiste a uma reconexão eventual, tipo um restart do banco em produção."
                    },
                    {
                        "type": "code",
                        "value": "// db.js\nconst { Pool } = require('pg');\n\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });\n\nasync function conectarComRetry(tentativas = 10, esperaMs = 2000) {\n  for (let i = 1; i <= tentativas; i++) {\n    try {\n      await pool.query('SELECT 1');\n      console.log('Postgres pronto, conexão OK');\n      return;\n    } catch (err) {\n      console.log('Tentativa ' + i + '/' + tentativas + ' falhou, esperando ' + esperaMs + 'ms');\n      await new Promise((r) => setTimeout(r, esperaMs));\n    }\n  }\n  throw new Error('Não conectou no Postgres depois de várias tentativas');\n}\n\nmodule.exports = { pool, conectarComRetry };"
                    },
                    {
                        "type": "quote",
                        "value": "depends_on decide a ordem em que os containers sobem. Não decide se o que está lá dentro já está pronto pra uso: isso é papel de um health check ou da própria aplicação."
                    }
                ],
                "questions": [
                    {
                        "statement": "No compose, o service backend tem depends_on apontando pra db, na forma simples de lista. O que exatamente isso garante?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que o container do db começa a subir antes do container do backend",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o Postgres do db já aceita conexões antes do backend subir",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o backend só inicia depois que o db rodar todas as migrations",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o backend reinicia sozinho se o container do db cair depois",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O compose só tem depends_on simples entre backend e db. Nos primeiros segundos de um docker compose up, a API loga connect ECONNREFUSED ao falar com o Postgres. Qual a explicação mais provável?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O container do db subiu, mas o Postgres ainda estava inicializando",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome do service db está digitado errado na DATABASE_URL da API",
                                "isCorrect": false
                            },
                            {
                                "text": "O volume de dados do Postgres foi apagado antes dessa subida",
                                "isCorrect": false
                            },
                            {
                                "text": "A porta 5432 não foi publicada no bloco ports do service db",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A API tenta conectar no Postgres, falha, espera um pouco e tenta de novo, até um número máximo de tentativas. Como esse padrão costuma ser chamado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Retry na conexão",
                                "isCorrect": true
                            },
                            {
                                "text": "Circuit breaker",
                                "isCorrect": false
                            },
                            {
                                "text": "Debounce de requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Pooling de conexões",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O compose só tem depends_on simples, sem healthcheck. O que reduz o risco da API cair por causa da demora do Postgres pra ficar pronto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A API tentar reconectar sozinha antes de aceitar requisições",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o número de réplicas do service backend no compose",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar a imagem do Postgres por uma versão mais recente",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o depends_on do compose pra subir mais rápido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A API já tem retry na conexão, rodado uma única vez na inicialização. Por que isso sozinho não protege contra o Postgres cair e voltar durante a execução?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O retry só roda no início, não cobre uma queda depois que a app já está no ar",
                                "isCorrect": true
                            },
                            {
                                "text": "O pg fecha e recria a pool de conexões automaticamente ao detectar uma queda",
                                "isCorrect": false
                            },
                            {
                                "text": "O Compose reinicia sozinho o container do backend sempre que o db cai",
                                "isCorrect": false
                            },
                            {
                                "text": "O healthcheck do db passa a falhar pra sempre depois da primeira queda registrada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Health check: esperando o banco ficar pronto",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um health check\n\nUm health check é um comando que o próprio Docker roda, de tempos em tempos, dentro do container, pra decidir se aquele service está \"saudável\" ou não. Pro Postgres, o comando clássico é o pg_isready, que já vem instalado na imagem oficial e responde se o servidor aceita conexões. Pro Redis, dá pra usar redis-cli ping, que responde PONG quando o servidor está no ar.\n\nDeclarado no compose, o health check vira parte do ciclo de vida do container: o Docker passa a saber a diferença entre \"container rodando\" e \"container pronto pra uso\"."
                    },
                    {
                        "type": "code",
                        "value": "services:\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: app\n      POSTGRES_PASSWORD: app123\n      POSTGRES_DB: app\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U app -d app\"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n\n  redis:\n    image: redis:7-alpine\n    healthcheck:\n      test: [\"CMD\", \"redis-cli\", \"ping\"]\n      interval: 5s\n      timeout: 3s\n      retries: 5"
                    },
                    {
                        "type": "text",
                        "value": "## Os parâmetros do healthcheck\n\n- **test**: o comando que o Docker executa dentro do container. Se sair com código 0, está saudável.\n- **interval**: de quanto em quanto tempo o Docker roda o teste.\n- **timeout**: quanto tempo esperar pela resposta antes de considerar falha.\n- **retries**: quantas falhas seguidas até marcar o service como \"unhealthy\".\n\nCom o healthcheck declarado, dá pra usar a forma longa do depends_on, com condition: service_healthy. Assim o Compose só libera a subida do backend depois que o db e o redis estiverem de fato saudáveis, não só \"iniciados\"."
                    },
                    {
                        "type": "code",
                        "value": "services:\n  backend:\n    build: .\n    environment:\n      DATABASE_URL: postgres://app:app123@db:5432/app\n      REDIS_URL: redis://redis:6379\n    depends_on:\n      db:\n        condition: service_healthy\n      redis:\n        condition: service_healthy"
                    },
                    {
                        "type": "code",
                        "value": "$ docker compose up -d\n$ docker ps\nCONTAINER ID   IMAGE                STATUS                    PORTS                    NAMES\na1b2c3d4e5f6   app-backend          Up 20 seconds             0.0.0.0:3000->3000/tcp   app-backend-1\nb2c3d4e5f6a1   postgres:16-alpine   Up 25 seconds (healthy)   0.0.0.0:5432->5432/tcp   app-db-1\nc3d4e5f6a1b2   redis:7-alpine       Up 25 seconds (healthy)   0.0.0.0:6379->6379/tcp   app-redis-1"
                    },
                    {
                        "type": "table",
                        "value": "[[\"depends_on\",\"O que garante\",\"Risco\"],[\"Forma simples (lista de services)\",\"Ordem de início dos containers\",\"App pode subir antes do banco aceitar conexão\"],[\"Forma longa (condition: service_healthy)\",\"Espera o service passar no healthcheck\",\"Depende de um healthcheck bem configurado\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Health check é o Docker perguntando pro service se ele está pronto de verdade antes de liberar quem depende dele. Sem isso, depends_on garante só a ordem de largada, não se o banco já está pronto pra uso."
                    }
                ],
                "questions": [
                    {
                        "statement": "O service db tem um healthcheck com o comando pg_isready. Pra que serve esse comando?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pro Docker checar, de tempos em tempos, se o Postgres já aceita conexões",
                                "isCorrect": true
                            },
                            {
                                "text": "Pro Postgres criar o banco declarado em POSTGRES_DB automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Pra medir quanto tempo o container do db leva pra ser destruído",
                                "isCorrect": false
                            },
                            {
                                "text": "Pra bloquear conexões externas até a API se autenticar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer que o Docker cheque, de tempos em tempos, se o Redis está respondendo. Qual comando faz sentido usar no test do healthcheck?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "redis-cli ping",
                                "isCorrect": true
                            },
                            {
                                "text": "redis-server status",
                                "isCorrect": false
                            },
                            {
                                "text": "redis check --alive",
                                "isCorrect": false
                            },
                            {
                                "text": "redis-cli healthcheck",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O service db tem healthcheck configurado, mas o backend ainda usa depends_on na forma simples de lista. O que falta pro Compose esperar o db ficar saudável antes de subir o backend?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar o depends_on pela forma longa, com condition: service_healthy",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada, a forma de lista já espera o healthcheck passar sozinha antes",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar um sleep manual bem no início do comando do backend",
                                "isCorrect": false
                            },
                            {
                                "text": "Diminuir bastante o interval do healthcheck pra ele rodar mais rápido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de subir o compose, docker ps mostra o container do db com o status Up 10 seconds (unhealthy). O que esse status indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O comando do healthcheck falhou o número de vezes definido em retries",
                                "isCorrect": true
                            },
                            {
                                "text": "O container travou e o Docker já está reiniciando ele automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "O healthcheck ainda não foi configurado pra esse service",
                                "isCorrect": false
                            },
                            {
                                "text": "O volume de dados do Postgres está corrompido e precisa recriar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O healthcheck do db está configurado com interval: 30s e retries: 5. No pior caso, quanto tempo o Compose pode levar pra marcar esse service como unhealthy depois dele parar de responder?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Perto de 5 intervalos de 30 segundos, algo em torno de 150 segundos",
                                "isCorrect": true
                            },
                            {
                                "text": "Exatamente 30 segundos, o tempo de apenas um único intervalo de teste",
                                "isCorrect": false
                            },
                            {
                                "text": "Instantâneo, o Docker detecta a falha assim que ela acontece",
                                "isCorrect": false
                            },
                            {
                                "text": "5 segundos, porque o retries sempre usa uma escala fixa em segundos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dev x produção: bind mount e hot reload x imagem pronta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O mesmo código, dois jeitos de rodar\n\nNo Módulo 4 você viu o bind mount: montar uma pasta do host dentro do container, editar o código fora e ver o efeito dentro, sem rebuildar a imagem. É essa técnica que sustenta o hot reload em desenvolvimento. Só que ela não faz sentido em produção: lá você quer a imagem com o código já dentro dela, testada e imutável, sem depender do que está (ou não) no disco do host.\n\nA prática comum, inclusive na própria ensina.dev, é manter dois arquivos de compose: um pro dia a dia de desenvolvimento, outro pra produção."
                    },
                    {
                        "type": "code",
                        "value": "FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD [\"node\", \"src/index.js\"]"
                    },
                    {
                        "type": "code",
                        "value": "# docker-compose.yml (desenvolvimento)\nservices:\n  backend:\n    build: .\n    command: npm run dev\n    ports:\n      - \"3000:3000\"\n    volumes:\n      - ./:/app\n      - /app/node_modules\n    environment:\n      DATABASE_URL: postgres://app:app123@db:5432/app\n      REDIS_URL: redis://redis:6379\n    depends_on:\n      db:\n        condition: service_healthy\n      redis:\n        condition: service_healthy\n\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: app\n      POSTGRES_PASSWORD: app123\n      POSTGRES_DB: app\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U app -d app\"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n\n  redis:\n    image: redis:7-alpine\n    healthcheck:\n      test: [\"CMD\", \"redis-cli\", \"ping\"]\n      interval: 5s\n      timeout: 3s\n      retries: 5"
                    },
                    {
                        "type": "code",
                        "value": "# docker-compose.prod.yml (produção)\nservices:\n  backend:\n    build: .\n    ports:\n      - \"3000:3000\"\n    environment:\n      DATABASE_URL: postgres://app:app123@db:5432/app\n      REDIS_URL: redis://redis:6379\n    depends_on:\n      db:\n        condition: service_healthy\n      redis:\n        condition: service_healthy\n\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: app\n      POSTGRES_PASSWORD: app123\n      POSTGRES_DB: app\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U app -d app\"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n\n  redis:\n    image: redis:7-alpine\n    healthcheck:\n      test: [\"CMD\", \"redis-cli\", \"ping\"]\n      interval: 5s\n      timeout: 3s\n      retries: 5\n\nvolumes:\n  pgdata:"
                    },
                    {
                        "type": "text",
                        "value": "## O que muda de um arquivo pro outro\n\nRepare nas diferenças:\n\n- O compose de dev tem volumes com ./:/app, o bind mount que joga o código do host pra dentro do container. Editou um arquivo, o container enxerga na hora.\n- O compose de dev também sobrescreve o CMD do Dockerfile com command: npm run dev, rodando um watcher tipo nodemon que reinicia o processo sozinho a cada mudança.\n- A entrada extra /app/node_modules impede que o bind mount apague o node_modules instalado dentro da imagem, trocando ele pelo (possivelmente vazio) da sua máquina.\n- O compose de produção não monta nada por cima do /app: o código que roda é o que o COPY colocou na imagem durante o docker build, e o comando é o CMD padrão do próprio Dockerfile, sem watcher.\n\nPra subir cada ambiente, o comando muda: docker compose up -d lê o docker-compose.yml de desenvolvimento por padrão; docker compose -f docker-compose.prod.yml up -d --build aponta pro arquivo de produção."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Desenvolvimento\",\"Produção\"],[\"Código no container\",\"Bind mount (./:/app)\",\"Copiado na imagem (COPY)\"],[\"Mudou um arquivo\",\"Reflete na hora, com hot reload\",\"Precisa gerar uma imagem nova\"],[\"Comando de start\",\"npm run dev (nodemon)\",\"node src/index.js (CMD do Dockerfile)\"],[\"Objetivo\",\"Ciclo rápido de edição e teste\",\"Estabilidade e reprodutibilidade\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Em dev, o container roda o seu código editado ao vivo, montado por bind mount. Em produção, a imagem já é o código: mudou algo, a resposta é buildar de novo, não montar um volume por cima."
                    }
                ],
                "questions": [
                    {
                        "statement": "No compose de desenvolvimento, o service backend tem volumes com a entrada ./:/app. Pra que serve esse bind mount?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pra refletir o código editado no host dentro do container, sem rebuildar",
                                "isCorrect": true
                            },
                            {
                                "text": "Pra fazer backup automático do código dentro de um volume nomeado",
                                "isCorrect": false
                            },
                            {
                                "text": "Pra impedir que o container acesse qualquer arquivo fora da pasta /app",
                                "isCorrect": false
                            },
                            {
                                "text": "Pra compartilhar o mesmo código entre o backend e o service do Postgres",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No compose de produção, o service backend não tem bind mount de código. De onde vem o código que roda dentro do container, então?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Do COPY feito durante o docker build, já dentro da imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "De um volume nomeado, criado e populado na primeira execução",
                                "isCorrect": false
                            },
                            {
                                "text": "De um download automático feito pelo Compose ao subir o service",
                                "isCorrect": false
                            },
                            {
                                "text": "Do host, copiado uma única vez no primeiro docker compose up",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você editou um arquivo da API rodando com o compose de produção e quer ver o efeito da mudança. O que precisa fazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Gerar uma imagem nova com docker build e subir o container com ela",
                                "isCorrect": true
                            },
                            {
                                "text": "Só salvar o arquivo, o container detecta a mudança sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar docker compose restart, sem precisar buildar de novo",
                                "isCorrect": false
                            },
                            {
                                "text": "Editar o arquivo direto de dentro do container, via docker exec",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No compose de dev, além de ./:/app, tem uma segunda entrada: /app/node_modules. Qual problema essa segunda linha evita?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que o bind mount do código sobrescreva o node_modules da imagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o node_modules do host seja enviado sem querer pro registry",
                                "isCorrect": false
                            },
                            {
                                "text": "Que duas versões diferentes do Node rodem ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o Postgres e o Redis compartilhem o mesmo node_modules",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A mesma imagem, construída a partir do mesmo Dockerfile, é usada no compose de dev (com command: npm run dev) e no de produção (sem command, usando o CMD padrão). O que muda de um pro outro nesse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O comando executado ao iniciar o container, não a imagem em si",
                                "isCorrect": true
                            },
                            {
                                "text": "A versão do Node instalada, que muda conforme o command usado",
                                "isCorrect": false
                            },
                            {
                                "text": "O Dockerfile usado, que é reescrito pelo compose em tempo real",
                                "isCorrect": false
                            },
                            {
                                "text": "As dependências instaladas, que variam de acordo com o command",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Depurando a stack",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quando a stack não sobe direito\n\nMesmo com health check e retry, chega a hora de alguma coisa dar errado: a API não conecta no banco, o Redis parece fora do ar, uma porta não responde. Depurar uma stack em containers segue um roteiro parecido, service por service: olhar os logs, checar o status e, se precisar, entrar no container pra investigar por dentro."
                    },
                    {
                        "type": "code",
                        "value": "$ docker compose ps\nNAME              SERVICE   STATUS\napp-backend-1     backend   Up 2 minutes\napp-db-1          db        Up 2 minutes (healthy)\napp-redis-1       redis     Restarting (1) 5 seconds ago\n\n$ docker compose logs backend\n$ docker compose logs -f backend\n$ docker compose logs --tail=50 db"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo os logs certo\n\ndocker compose logs seguido do nome do service mostra a saída daquele container desde que ele subiu. O -f (--follow) deixa acompanhando em tempo real, útil pra ver o exato momento em que a API tenta conectar e falha. O --tail=50 limita pras últimas linhas, bom quando o log já está enorme.\n\nSem o nome do service, docker compose logs mostra os logs de todos os services misturados, cada linha prefixada com o nome de quem gerou ela. Ajuda a ver a ordem dos eventos entre a API e o banco."
                    },
                    {
                        "type": "code",
                        "value": "$ docker compose exec backend sh\n/app # echo $DATABASE_URL\npostgres://app:app123@db:5432/app\n/app # node -e \"require('net').connect(5432,'db').on('connect',()=>{console.log('conectou');process.exit()}).on('error',e=>{console.error('erro:',e.message);process.exit(1)})\"\nconectou\n/app # exit"
                    },
                    {
                        "type": "text",
                        "value": "## As causas mais comuns\n\nQuando a API não conecta, é quase sempre uma destas:\n\n- **Host errado na connection string**: colocou localhost em vez do nome do service (db ou redis).\n- **Service ainda não subiu, ou não passou no health check**: a API tentou conectar cedo demais, sem retry nem condition: service_healthy.\n- **Porta errada**: publicou ou apontou pra uma porta diferente da que o service realmente escuta.\n- **Credencial divergente**: a senha ou o nome do banco na DATABASE_URL da API não bate com o que o db recebeu em POSTGRES_PASSWORD ou POSTGRES_DB."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Mensagem no log\",\"Causa mais provável\"],[\"ECONNREFUSED\",\"Service certo, mas ainda não aceita conexão nessa porta\"],[\"ENOTFOUND / getaddrinfo\",\"Nome do host não existe: service errado ou fora da rede\"],[\"password authentication failed\",\"Usuário ou senha diferentes entre a API e o banco\"],[\"database app does not exist\",\"POSTGRES_DB e o banco da connection string não batem\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Container que não conecta em outro quase sempre é logs, host e porta, nessa ordem. docker compose logs mostra o sintoma, docker compose exec deixa confirmar a causa por dentro do próprio container."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você quer acompanhar, em tempo real, o que o service backend está logando. Qual comando faz isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker compose logs -f backend",
                                "isCorrect": true
                            },
                            {
                                "text": "docker compose ps -f backend",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose exec -f backend",
                                "isCorrect": false
                            },
                            {
                                "text": "docker compose top backend",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "docker compose ps mostra o service redis com o status Restarting (1) 5 seconds ago. O que isso sugere?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O container do redis está falhando ao iniciar e o Docker insiste de novo",
                                "isCorrect": true
                            },
                            {
                                "text": "O Redis está processando um comando pesado e volta ao normal",
                                "isCorrect": false
                            },
                            {
                                "text": "O healthcheck do redis está rodando, e esse é o comportamento esperado",
                                "isCorrect": false
                            },
                            {
                                "text": "O container do redis está saudável, só reiniciando por rotina",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro do container do backend, echo $DATABASE_URL mostra postgres://app:app123@localhost:5432/app. Isso explica um erro de conexão. Qual é o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O host deveria ser o nome do service do Postgres, não localhost",
                                "isCorrect": true
                            },
                            {
                                "text": "A porta 5432 deveria estar entre aspas na variável de ambiente",
                                "isCorrect": false
                            },
                            {
                                "text": "O usuário app não existe de verdade dentro do container backend",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta declarar essa variável também no Dockerfile, com ENV",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A API loga password authentication failed for user app ao tentar falar com o Postgres. Onde faz mais sentido procurar o problema primeiro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Comparar a senha da DATABASE_URL da API com o POSTGRES_PASSWORD do db",
                                "isCorrect": true
                            },
                            {
                                "text": "Verificar se a porta 5432 foi realmente publicada no bloco ports do db",
                                "isCorrect": false
                            },
                            {
                                "text": "Conferir se o service db está de fato na mesma network que o backend",
                                "isCorrect": false
                            },
                            {
                                "text": "Checar se o volume de dados do Postgres foi montado do jeito certo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Rodando docker compose exec backend sh e testando a conexão com o Postgres via Node, ela falha. Mas psql direto da sua máquina, apontando pra localhost:5432, funciona normalmente. O que essa diferença indica?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O problema é específico da rede interna do compose, não do Postgres",
                                "isCorrect": true
                            },
                            {
                                "text": "O Postgres só aceita uma conexão simultânea, já usada pelo psql",
                                "isCorrect": false
                            },
                            {
                                "text": "A imagem do backend não tem suporte a conexões TCP com containers",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando usado no Node sempre falha ao testar portas de rede",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Imagens enxutas, seguras e o caminho do deploy",
        "aulas": [
            {
                "titulo": "Multi-stage build: a imagem final enxuta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 7: imagens enxutas, seguras e o caminho do deploy\n\nVocê já sabe empacotar sua API Express, conectar no Postgres e no Redis via Compose e manter os dados vivos com volumes. Falta o último passo: pegar essa imagem e deixá-la pronta pra produção de verdade, pequena, segura e fácil de distribuir.\n\nO primeiro problema é o tamanho. Se você seguiu os módulos anteriores à risca, sua imagem hoje provavelmente carrega coisa que a produção nunca vai usar: o TypeScript, o eslint, as devDependencies inteiras, o cache do `npm`, até o código-fonte original antes de compilar."
                    },
                    {
                        "type": "text",
                        "value": "## O problema: uma imagem só, com tudo dentro\n\nUm Dockerfile de etapa única faz o build e a execução no mesmo lugar. Funciona, mas carrega pra imagem final tudo que só foi necessário durante o build:\n\n- As devDependencies (TypeScript, bundler, linter, framework de teste)\n- O código-fonte original, além do já compilado\n- Cache de instalação e arquivos temporários\n\nRepare como isso costuma ser escrito:"
                    },
                    {
                        "type": "code",
                        "value": "# Dockerfile de etapa única (o build e a execução no mesmo lugar)\nFROM node:22\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\nEXPOSE 3000\nCMD [\"node\", \"dist/server.js\"]"
                    },
                    {
                        "type": "text",
                        "value": "## Multi-stage build: uma etapa builda, outra roda\n\nUm Dockerfile pode ter mais de um `FROM`. Cada `FROM` começa uma etapa nova, e você pode nomear cada uma com `AS`. A etapa final é a que vira a imagem de verdade; as etapas anteriores existem só de apoio pro build e não sobram na imagem final, a não ser o que você copiar explicitamente com `COPY --from`."
                    },
                    {
                        "type": "code",
                        "value": "# Etapa 1: build (tem TypeScript, devDependencies, código-fonte)\nFROM node:22 AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n# Etapa 2: imagem final (só o necessário pra rodar)\nFROM node:22-alpine\nWORKDIR /app\nENV NODE_ENV=production\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY --from=build /app/dist ./dist\nEXPOSE 3000\nCMD [\"node\", \"dist/server.js\"]"
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que fica na imagem\", \"Dockerfile de etapa única\", \"Multi-stage build\"], [\"Código-fonte (.ts, .js originais)\", \"Sim\", \"Não\"], [\"devDependencies (TypeScript, eslint...)\", \"Sim\", \"Não\"], [\"Apenas o código já compilado (dist)\", \"Sim, junto com o resto\", \"Sim, só isso\"], [\"Tamanho final típico\", \"Bem maior\", \"Bem menor\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Multi-stage build não é sobre ter um Dockerfile mais comprido, é sobre a imagem final esquecer tudo que só serviu pra construí-la."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza um multi-stage build no Dockerfile?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um Dockerfile com mais de um FROM, copiando só o necessário entre as etapas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um Dockerfile que builda a aplicação em vários containers ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Vários arquivos Dockerfile separados, um pra cada ambiente do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma flag do docker build que divide a imagem final em partes menores.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual instrução copia arquivos de uma etapa anterior pra etapa atual num multi-stage build?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "COPY --from=nome-da-etapa, referenciando a etapa pelo nome dado com AS.",
                                "isCorrect": true
                            },
                            {
                                "text": "IMPORT --stage=nome-da-etapa, referenciando a etapa pelo nome dado com AS.",
                                "isCorrect": false
                            },
                            {
                                "text": "FROM --copy=nome-da-etapa, referenciando a etapa pelo nome dado com AS.",
                                "isCorrect": false
                            },
                            {
                                "text": "RUN --source=nome-da-etapa, referenciando a etapa pelo nome dado com AS.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a imagem final de um multi-stage build não deve ter o TypeScript e as devDependencies instaladas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque elas só servem pra etapa de build, o runtime não precisa delas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Node não consegue executar pacotes listados em devDependencies.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Docker Hub rejeita imagens publicadas com devDependencies.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a licença padrão de devDependencies proíbe o uso em produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Seu Dockerfile tem FROM node:22 (sem AS nenhum) e depois tenta COPY --from=build /app/dist ./dist. O que o Docker faz?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Tenta interpretar build como o nome de uma imagem externa e busca puxá-la.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ignora o --from e copia da própria etapa atual, sem avisar o motivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usa a última etapa definida no arquivo, sem checar o nome pedido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falha o parse do Dockerfile antes mesmo de iniciar o build da imagem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Seu Dockerfile é multi-stage, mas a imagem final ficou quase do mesmo tamanho de uma versão de etapa única. Causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A etapa final copiou o node_modules inteiro vindo da etapa de build.",
                                "isCorrect": true
                            },
                            {
                                "text": "A etapa final usa node:22-alpine, que não reduz tamanho nesse caso.",
                                "isCorrect": false
                            },
                            {
                                "text": "O cache de build duplicou os arquivos entre as duas etapas do Dockerfile.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker manteve as camadas da etapa de build dentro da etapa final.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Imagens base pequenas: alpine e slim",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A imagem final também tem uma imagem base\n\nMulti-stage já cortou o código-fonte e as devDependencies. O próximo corte é a própria imagem base da etapa final. `node:22` sozinho já carrega um sistema operacional completo (Debian), com bibliotecas e ferramentas que sua API nunca vai chamar em produção."
                    },
                    {
                        "type": "text",
                        "value": "## As opções mais comuns\n\n- **node:22**: imagem completa, baseada em Debian, com bastante coisa pré-instalada\n- **node:22-slim**: o mesmo Debian, mas enxuto, sem bibliotecas de build nem documentação\n- **node:22-alpine**: baseada no Alpine Linux, que usa musl no lugar da glibc e parte de poucos megabytes de base\n\nOs números variam por versão do Node e por arquitetura, mas a diferença de grandeza entre elas se mantém:"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Imagem base\", \"Tamanho aproximado\", \"Sistema base\", \"Uso típico\"], [\"node:22\", \"~1.1 GB\", \"Debian completo\", \"Desenvolvimento, quando falta alguma lib do sistema\"], [\"node:22-slim\", \"~200 MB\", \"Debian enxuto\", \"Meio-termo, quando o alpine dá conflito\"], [\"node:22-alpine\", \"~150 MB\", \"Alpine Linux (musl)\", \"Imagem final de produção, na maioria dos casos\"]]"
                    },
                    {
                        "type": "code",
                        "value": "FROM node:22-alpine AS build\nWORKDIR /app\nRUN apk add --no-cache python3 make g++\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build"
                    },
                    {
                        "type": "text",
                        "value": "O `apk add` ali é necessário só nessa etapa: o Alpine não vem com compilador C/C++ por padrão, e alguns pacotes nativos (`bcrypt`, `sharp`, entre outros) precisam compilar código durante o `npm ci`. Como isso roda na etapa de build, essas ferramentas nunca chegam na imagem final.\n\n## Menos coisa instalada, menos risco e menos espera\n\nCada pacote a mais na imagem base é um pacote a mais que pode ter uma vulnerabilidade conhecida (CVE) um dia. Imagens menores também sobem e descem mais rápido do registry, o que importa toda vez que um container reinicia ou escala.\n\nExiste ainda um passo além do alpine: imagens **distroless** (mantidas pelo Google, por exemplo), que trazem só o runtime do Node e a aplicação, sem shell, sem gerenciador de pacotes, nada além do estritamente necessário pra rodar. É uma opção mais avançada, vale saber que existe."
                    },
                    {
                        "type": "code",
                        "value": "docker images node\n\nREPOSITORY   TAG          IMAGE ID       CREATED         SIZE\nnode         22           3f8a1c9d2b41   3 weeks ago     1.09GB\nnode         22-slim      7e2b4f6a91c3   3 weeks ago     199MB\nnode         22-alpine    9a1d5e8f3b27   3 weeks ago     152MB"
                    },
                    {
                        "type": "quote",
                        "value": "A imagem base que você escolhe pesa em cada pull, cada deploy e cada CVE que você não vai querer explicar depois. Alpine (ou algo ainda menor) deveria ser o padrão pra imagem final, não a exceção."
                    }
                ],
                "questions": [
                    {
                        "statement": "Entre as opções abaixo, qual costuma gerar a menor imagem final pra uma app Node?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "node:22-alpine, a imagem base mais enxuta entre as opções oficiais comuns.",
                                "isCorrect": true
                            },
                            {
                                "text": "node:22, a imagem completa baseada em Debian com tudo pré-instalado.",
                                "isCorrect": false
                            },
                            {
                                "text": "node:latest, que aponta pra versão mais recente disponível do Node.",
                                "isCorrect": false
                            },
                            {
                                "text": "node:22-slim, a versão enxuta do Debian, mas maior que a alpine.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que caracteriza a imagem node:22-alpine?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É baseada no Alpine Linux, que usa musl no lugar da glibc do Debian.",
                                "isCorrect": true
                            },
                            {
                                "text": "É uma versão do Node compilada sem nenhum suporte ao gerenciador npm.",
                                "isCorrect": false
                            },
                            {
                                "text": "É recomendada só pra ambiente de desenvolvimento, nunca pra produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma imagem sem sistema de arquivos, só o binário do Node sozinho.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No node:22-alpine, o npm ci falha ao instalar um pacote nativo (ex.: bcrypt), com erro de compilação. Causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Faltam ferramentas de build, como python3, make e g++, no alpine.",
                                "isCorrect": true
                            },
                            {
                                "text": "O pacote bcrypt não tem nenhuma versão compatível com o Node 22.",
                                "isCorrect": false
                            },
                            {
                                "text": "O alpine só aceita o npm install, nunca aceita o npm ci.",
                                "isCorrect": false
                            },
                            {
                                "text": "A imagem alpine bloqueia módulos nativos por padrão, por segurança.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além de ocupar menos disco, qual a vantagem prática de usar uma imagem base menor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Menos pacotes instalados, logo menos superfície pra uma vulnerabilidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "O runtime do Node processa as requisições bem mais rápido dentro dela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Imagens menores nunca mais vão precisar de atualização de segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker Hub cobra uma taxa menor pra armazenar imagens menores.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é, de forma resumida, uma imagem distroless?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma imagem com só o runtime e a aplicação, sem shell nem pacotes extras.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma imagem sem camadas nenhuma, tudo achatado num único layer final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma variante do Windows containers, sem nenhuma base Linux por trás.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma variante do alpine que remove todo o suporte a rede interna.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Segurança da imagem: nada de root, nada de segredo embutido",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Rodando como root sem perceber\n\nSem nenhuma instrução extra, o processo dentro do container roda como `root`. Isso passa despercebido porque tudo funciona normalmente, mas quer dizer que, se alguém explorar uma falha na sua aplicação (uma dependência vulnerável, um upload malicioso), o processo comprometido já nasce com privilégio total dentro do container."
                    },
                    {
                        "type": "code",
                        "value": "FROM node:22-alpine\nWORKDIR /app\nENV NODE_ENV=production\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY --from=build /app/dist ./dist\nRUN addgroup -S app && adduser -S app -G app\nUSER app\nEXPOSE 3000\nCMD [\"node\", \"dist/server.js\"]"
                    },
                    {
                        "type": "text",
                        "value": "`addgroup -S` e `adduser -S` criam um grupo e um usuário de sistema, sem senha e sem privilégio extra. A partir do `USER app`, tudo que vem depois no Dockerfile (e o próprio `CMD`) roda com esse usuário, nunca mais como root.\n\n## Segredo dentro da imagem é segredo público\n\nToda instrução do Dockerfile vira uma camada, e camadas ficam guardadas na imagem, mesmo as que uma instrução posterior tenta apagar. Colocar uma senha de banco num `ENV` ou copiar um `.env` de verdade pra dentro da imagem significa que qualquer pessoa com acesso a ela (um colega, alguém que puxou do registry, um `docker history`) consegue ler esse segredo. Ele não desaparece só porque um comando depois deletou o arquivo. No Compose vale o mesmo princípio: `env_file` aponta pra um arquivo que fica de fora da imagem e do Git, nunca dentro do Dockerfile."
                    },
                    {
                        "type": "code",
                        "value": "# Errado: segredo gravado na imagem\nFROM node:22-alpine\nWORKDIR /app\nENV DATABASE_PASSWORD=minhasenha123\nCOPY . .\nRUN npm ci --omit=dev\nCMD [\"node\", \"dist/server.js\"]\n\n# Certo: segredo entra só na hora de rodar, nunca no Dockerfile\ndocker run --env-file .env.production -p 3000:3000 minha-api:1.4.0"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Prática\", \"Risco\", \"Alternativa recomendada\"], [\"Rodar o processo como root (sem USER)\", \"Processo comprometido ganha privilégio total no container\", \"Criar um usuário próprio e usar USER\"], [\"Segredo em ENV ou COPY no Dockerfile\", \"Fica gravado na camada, legível por quem tiver a imagem\", \"Variável de ambiente ou secret injetado em runtime\"], [\"Nunca escanear a imagem final\", \"Vulnerabilidade conhecida passa despercebida\", \"Rodar um scanner antes de publicar\"]]"
                    },
                    {
                        "type": "code",
                        "value": "docker scout quickview minha-api:1.4.0\ndocker scout cves minha-api:1.4.0\n\n# alternativa com Trivy\ntrivy image minha-api:1.4.0"
                    },
                    {
                        "type": "quote",
                        "value": "Uma imagem segura não é a que nunca vai ser atacada, é a que roda sem privilégio de root e não entrega segredo de graça pra quem só queria baixar a aplicação."
                    }
                ],
                "questions": [
                    {
                        "statement": "Sem a instrução USER, com qual usuário o processo roda dentro do container, por padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "root, o usuário padrão de qualquer processo sem USER definido.",
                                "isCorrect": true
                            },
                            {
                                "text": "www-data, o usuário padrão criado pelas imagens baseadas em Debian.",
                                "isCorrect": false
                            },
                            {
                                "text": "node, o usuário que a imagem oficial já deixa pronto pra uso direto.",
                                "isCorrect": false
                            },
                            {
                                "text": "nobody, o usuário de baixo privilégio ativado por padrão no container.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual instrução do Dockerfile define com qual usuário os comandos seguintes vão rodar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "USER, que muda o usuário usado pelas instruções seguintes e pelo CMD.",
                                "isCorrect": true
                            },
                            {
                                "text": "RUN, que executa comandos durante a construção da imagem sendo criada.",
                                "isCorrect": false
                            },
                            {
                                "text": "ENTRYPOINT, que define o processo principal executado no container.",
                                "isCorrect": false
                            },
                            {
                                "text": "WORKDIR, que define a pasta de trabalho usada pelas instruções seguintes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que colocar ENV DATABASE_PASSWORD=minhasenha123 direto no Dockerfile é uma má prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A senha fica gravada na imagem, legível por qualquer um com acesso a ela.",
                                "isCorrect": true
                            },
                            {
                                "text": "A instrução ENV não aceita valores com números ou símbolos especiais.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker apaga variáveis ENV ao criar o container, quebrando a aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "A instrução ENV só funciona durante o build, nunca chega ao container.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você copiou um arquivo de segredo pra imagem e, numa instrução seguinte, rodou RUN rm arquivo-secreto, achando que assim ele some da imagem final. O que realmente acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O arquivo continua recuperável, porque a camada anterior com ele permanece.",
                                "isCorrect": true
                            },
                            {
                                "text": "O arquivo é removido de todas as camadas, e a estratégia funciona bem.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Docker compacta as camadas no final, então o rm resolve o problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso só vira problema se a imagem for enviada a um registry público.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a forma correta de entregar um segredo (ex.: senha de banco) pro container em produção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Como variável de ambiente injetada no run ou compose, fora da imagem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Como ARG no Dockerfile, já que um ARG não persiste na imagem final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como arquivo dentro de /app, protegido por permissão 600 no build.",
                                "isCorrect": false
                            },
                            {
                                "text": "Direto no CMD do Dockerfile, como argumento de linha de comando.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Enviando a imagem pro registry: tag, push e pull",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Sua imagem pronta, agora ela precisa viajar\n\nLá no módulo 3, cada `docker pull postgres` ou `docker pull redis` baixava uma imagem pronta de um registry, o Docker Hub. Agora é a sua imagem que precisa ir pro mesmo lugar: construída e testada na sua máquina, publicada num registry, e puxada de onde a aplicação realmente vai rodar."
                    },
                    {
                        "type": "code",
                        "value": "docker build -t minha-api:1.4.0 .\n\n# cria uma referência apontando pro seu usuário/repositório no registry\ndocker tag minha-api:1.4.0 seunome/minha-api:1.4.0\ndocker tag minha-api:1.4.0 seunome/minha-api:latest"
                    },
                    {
                        "type": "text",
                        "value": "## Autenticando e publicando\n\nAntes do primeiro push, é preciso autenticar com o registry. Depois disso, cada `docker push` envia só as camadas que o registry ainda não tem, aproveitando o cache. Vale publicar sempre uma tag de versão (`1.4.0`) além da `latest`: em produção, depender só da `latest` significa nunca ter certeza de qual build está rodando, nem como voltar pra versão anterior se algo quebrar.\n\nO Docker Hub é o registry público mais comum, mas o mesmo fluxo vale pra um registry privado (GitHub Container Registry, um registry próprio da empresa, entre outros)."
                    },
                    {
                        "type": "code",
                        "value": "docker login\n\ndocker push seunome/minha-api:1.4.0\ndocker push seunome/minha-api:latest"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\", \"O que faz\", \"Quando usar\"], [\"docker tag origem destino\", \"Cria uma nova referência pra mesma imagem\", \"Antes do push, apontando pro registry certo\"], [\"docker login\", \"Autentica com o registry\", \"Antes do primeiro push\"], [\"docker push nome:tag\", \"Envia a imagem (camadas que faltam) pro registry\", \"Depois de testar a imagem localmente\"], [\"docker pull nome:tag\", \"Baixa a imagem do registry pra máquina atual\", \"No servidor de produção, ou em máquina nova\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# no servidor de producao, sem precisar do codigo-fonte\ndocker pull seunome/minha-api:1.4.0\ndocker run -d --name minha-api -p 3000:3000 --env-file .env.production seunome/minha-api:1.4.0"
                    },
                    {
                        "type": "quote",
                        "value": "Depois do push, a imagem não pertence mais só à sua máquina: ela vira um artefato versionado que qualquer servidor autorizado consegue puxar e rodar, sem precisar de mais nada além do Docker."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando cria uma nova referência (tag) pra uma imagem já construída, sem reconstruir nada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker tag origem destino, criando uma nova referência pra mesma imagem.",
                                "isCorrect": true
                            },
                            {
                                "text": "docker build --rename destino, criando uma nova referência pra mesma imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker push --as destino, criando uma nova referência pra mesma imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker commit --tag destino, criando uma nova referência pra mesma imagem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que fazer antes do primeiro docker push num registry privado ou no Docker Hub?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "docker login, autenticando com suas credenciais no registry de destino.",
                                "isCorrect": true
                            },
                            {
                                "text": "docker init, criando localmente um registry novo antes do primeiro push.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker build --public, marcando a imagem construída como pública.",
                                "isCorrect": false
                            },
                            {
                                "text": "docker pull do mesmo nome, reservando o repositório antes de publicar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você publicou só a tag latest e, num pull posterior, veio uma versão diferente da esperada. Por que depender só da latest é arriscado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a tag latest pode apontar pra builds diferentes ao longo do tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o docker pull sempre usa o cache local, ignorando o registry.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Docker Hub demora até 24 horas pra propagar uma imagem nova.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a imagem antiga fica presa até alguém rodar docker rmi antes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a vantagem de publicar uma tag de versão (ex.: 1.4.2) além da latest?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dá pra saber qual build está rodando e voltar a uma versão anterior.",
                                "isCorrect": true
                            },
                            {
                                "text": "Tags de versão fazem a imagem ocupar menos espaço dentro do registry.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem tag de versão, o docker push falha com erro de permissão.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tag latest fica bloqueada pro Docker depois da primeira publicação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois do docker push, o que precisa existir no servidor de produção pra rodar a aplicação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Só o Docker instalado e acesso ao registry pra rodar o docker pull.",
                                "isCorrect": true
                            },
                            {
                                "text": "O código-fonte completo, pro Docker reconstruir a imagem antes do run.",
                                "isCorrect": false
                            },
                            {
                                "text": "O mesmo Dockerfile usado no build, pra validar a origem da imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "As devDependencies instaladas no host, caso precise recompilar algo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Do container ao deploy: o próximo passo é CI/CD",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Onde os containers rodam de verdade\n\nExistem dois caminhos comuns pra colocar sua imagem rodando em produção. O primeiro é uma VPS com Docker instalado: você (ou um script) faz `docker pull` e `docker run` (ou `docker compose up -d`) direto nela, como já fizemos até aqui. O segundo é um serviço gerenciado de nuvem (Cloud Run, ECS, Azure Container Apps, entre outros): você entrega a imagem, e o provedor cuida do servidor, da rede e do restart por trás."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"VPS com Docker\", \"Serviço gerenciado de nuvem\"], [\"Quem administra o servidor\", \"Você\", \"O provedor de nuvem\"], [\"Como você entrega a app\", \"docker pull + docker run/compose\", \"Aponta pra imagem no registry\"], [\"Escala automática\", \"Só se você configurar na mão\", \"Geralmente já embutida\"], [\"Controle sobre o ambiente\", \"Total\", \"Limitado ao que o serviço expõe\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando uma máquina só não basta: orquestração\n\nCom uma aplicação só, uma VPS ou um serviço gerenciado resolve. Quando o cenário cresce (muitos containers, várias máquinas, precisa reiniciar sozinho se cair, escalar sozinho se o tráfego subir), entra em cena orquestração, e o nome mais conhecido é **Kubernetes**. Ele não substitui o Docker: ele gerencia containers Docker (ou compatíveis) rodando em escala, num cluster de máquinas. É assunto pra uma trilha inteira à parte, mas vale reconhecer a peça:"
                    },
                    {
                        "type": "code",
                        "value": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: minha-api\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: minha-api\n  template:\n    metadata:\n      labels:\n        app: minha-api\n    spec:\n      containers:\n        - name: minha-api\n          image: seunome/minha-api:1.4.0\n          ports:\n            - containerPort: 3000"
                    },
                    {
                        "type": "text",
                        "value": "Perceba o `image: seunome/minha-api:1.4.0`: é a mesma imagem publicada na aula passada, e `replicas: 3` pede três containers dela rodando ao mesmo tempo, o Kubernetes é quem garante isso.\n\n## Recapitulando a trilha inteira\n\n- **Módulo 1**: por que empacotar em containers, o fim do \"na minha máquina funciona\"\n- **Módulo 2**: escrever um Dockerfile e construir sua primeira imagem\n- **Módulo 3**: o dia a dia com containers, imagens e o registry\n- **Módulo 4**: volumes, pra dado sobreviver além do container\n- **Módulo 5**: Docker Compose, subindo vários serviços com um comando\n- **Módulo 6**: sua API de verdade conversando com Postgres e Redis containerizados\n- **Módulo 7**: imagem enxuta (multi-stage, base pequena), segura (sem root, sem segredo) e publicada num registry"
                    },
                    {
                        "type": "text",
                        "value": "## O próximo estágio: CI/CD & Cloud\n\nTudo que você fez na mão nesse módulo (build, tag, push) é exatamente o que um pipeline de CI/CD automatiza: a cada `git push`, ele builda a imagem, roda os testes (lembra da trilha de testes?) e publica no registry sozinho, sem depender de alguém lembrar de rodar os comandos certos na ordem certa. Esse é o próximo estágio do roadmap de Back-end: CI/CD & Cloud."
                    },
                    {
                        "type": "quote",
                        "value": "De um Dockerfile de três linhas até uma imagem versionada, segura e publicada: o container virou a unidade que sai da sua máquina e chega igual em produção. O próximo passo é parar de fazer isso na mão."
                    }
                ],
                "questions": [
                    {
                        "statement": "Além de uma VPS com Docker instalado, onde mais uma imagem pode rodar em produção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Num serviço gerenciado de nuvem, que cuida do servidor por trás pra você.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só dentro do próprio Docker Hub, que também executa as imagens hospedadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Direto no navegador do usuário final, sem nenhum servidor envolvido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em qualquer editor de código que tenha a extensão do Docker instalada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é Kubernetes, de forma resumida?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma ferramenta que orquestra containers rodando em várias máquinas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um substituto do Docker, usado pra construir imagens do zero.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um registry de imagens alternativo ao Docker Hub tradicional.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um comando do Compose usado pra subir vários containers de vez.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a principal diferença entre rodar numa VPS própria e num serviço gerenciado de nuvem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Na VPS você cuida do servidor; no gerenciado, o provedor cuida por você.",
                                "isCorrect": true
                            },
                            {
                                "text": "Na VPS a imagem precisa ser reconstruída localmente antes de cada deploy.",
                                "isCorrect": false
                            },
                            {
                                "text": "Serviços gerenciados não aceitam imagens vindas do Docker Hub público.",
                                "isCorrect": false
                            },
                            {
                                "text": "Numa VPS o container roda sem passar por nenhuma virtualização.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time automatizou build, tag e push pra rodar sozinho a cada commit. Isso é o que a próxima etapa do roadmap, CI/CD, resolve?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, um pipeline de CI/CD repete build, tag e push a cada mudança.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, CI/CD só roda os testes, o push da imagem continua manual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, isso exige migrar direto pro Kubernetes, CI/CD não participa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só substitui o build, o push continua sendo manual.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a trilha de Docker vem antes da trilha de CI/CD & Cloud no roadmap?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque CI/CD automatiza os passos manuais aprendidos aqui: build, tag, push.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque CI/CD só funciona com imagens publicadas há meses no registry.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Kubernetes exige o Compose instalado antes de qualquer pipeline.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ferramentas de CI/CD nunca conseguem instalar o Docker sozinhas.",
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
