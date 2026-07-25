// Seed da trilha Linux e Linha de Comando (do básico ao avançado). Conteúdo
// autoral, quiz-only. Idempotente: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-linux.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Linux e Linha de Comando";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Linux do básico ao avançado, a base do trabalho de DevOps: o sistema e o kernel, o filesystem e o boot, a linha de comando, permissões, usuários e processos, as chamadas de sistema (syscalls) e o que o kernel faz, scripting em Bash, o sistema em operação com systemd, logs, pacotes e agendamento, e o Linux para DevOps com SSH, ambiente, disco e limites de recurso. O sistema operacional por trás de servidores, containers e nuvem.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

// Preenchido na montagem, um módulo por vez, a partir da autoria por subagente.
const MODULOS = [
    {
        "titulo": "Módulo 1 - O sistema Linux",
        "aulas": [
            {
                "titulo": "O que é Linux e o kernel",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Linux é o kernel\n\nNo dia a dia chamamos de Linux o sistema operacional inteiro, mas, tecnicamente, Linux é apenas o kernel: o núcleo do sistema. O kernel é o programa que fica entre os seus aplicativos e o hardware da máquina. Ele foi criado por Linus Torvalds em 1991 e segue em desenvolvimento por milhares de pessoas no mundo todo.\n\nO kernel sozinho não entrega muito ao usuário. Ele não tem interface, não traz comandos como `ls` ou `cp` e não vem com editor de texto. Para virar um sistema operacional utilizável, o kernel precisa de uma coleção de programas ao redor dele, o chamado userland (espaço de usuário)."
                    },
                    {
                        "type": "text",
                        "value": "## Kernel e userland\n\nO sistema operacional que você usa é a soma de duas partes:\n\n- **Kernel**: gerencia o hardware e os recursos, roda em modo privilegiado (kernel space).\n- **Userland**: os programas que você executa, do shell aos utilitários, rodam em modo restrito (user space).\n\nBoa parte do userland clássico vem do projeto GNU (o shell Bash, o coreutils com `ls`, `cat` e `cp`, o compilador GCC). Por isso muita gente chama o sistema de GNU/Linux: o GNU fornece as ferramentas e o Linux fornece o kernel. Some a isso rede, serviços e um instalador e você tem um sistema completo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Recurso\", \"O que o kernel faz\"], [\"Processos\", \"Cria, agenda e encerra os programas em execução\"], [\"Memória\", \"Reparte a RAM entre os processos e isola cada um\"], [\"Arquivos\", \"Lê e grava em disco pelos sistemas de arquivos\"], [\"Hardware\", \"Conversa com dispositivos por meio de drivers\"], [\"Rede\", \"Trata pacotes e conexões pela pilha de rede\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Livre e em todo lugar\n\nO kernel Linux é software livre, sob a licença GPL: qualquer pessoa pode ler, usar, modificar e redistribuir o código. Isso permitiu que empresas e comunidades construíssem sistemas sobre ele sem pagar licença nem pedir permissão.\n\nO resultado é que o Linux domina onde custo e escala pesam:\n\n- **Servidores**: a maioria dos servidores web e de banco de dados roda Linux.\n- **Nuvem**: as máquinas virtuais dos provedores são, em peso, Linux.\n- **Containers**: Docker e Kubernetes nasceram sobre recursos do kernel Linux, então todo container roda sobre ele.\n\nPara quem trabalha com DevOps, saber Linux não é opcional: é o chão onde quase tudo acontece."
                    },
                    {
                        "type": "code",
                        "value": "uname -r\n# 6.8.0-45-generic   (versao do kernel Linux em execucao)\n\nuname -o\n# GNU/Linux           (kernel Linux mais o userland GNU)"
                    },
                    {
                        "type": "quote",
                        "value": "Linux é o kernel, não o sistema operacional inteiro. O sistema é o kernel (Linux) mais o userland (GNU e outros utilitários). O kernel gerencia processos, memória, arquivos, hardware e rede; os programas pedem esses recursos ao kernel."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em uma conversa, alguém afirma que Linux é o sistema operacional completo, com shell e utilitários. Qual correção é a mais precisa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Linux é o kernel; o sistema soma kernel e userland",
                                "isCorrect": true
                            },
                            {
                                "text": "Linux é o shell Bash usado para digitar comandos",
                                "isCorrect": false
                            },
                            {
                                "text": "Linux é o conjunto de utilitários e comandos do GNU",
                                "isCorrect": false
                            },
                            {
                                "text": "Linux é a interface gráfica que aparece na tela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor pergunta o que exatamente o kernel do Linux gerencia. Qual item faz parte dessa responsabilidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Agendar processos e repartir a memória entre eles",
                                "isCorrect": true
                            },
                            {
                                "text": "Renderizar a página web aberta no navegador",
                                "isCorrect": false
                            },
                            {
                                "text": "Formatar o texto de um documento no editor",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar o tema visual da área de trabalho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que muita gente se refere ao sistema como GNU/Linux, e não apenas como Linux?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque boa parte do userland vem do projeto GNU",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a GNU foi quem escreveu o kernel Linux original",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque GNU é a empresa dona da marca Linux",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque GNU é a versão paga e Linux a gratuita",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um programa precisa ler um arquivo do disco. Em um sistema Linux, como ele obtém esse dado do hardware?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pede ao kernel por uma chamada de sistema (syscall)",
                                "isCorrect": true
                            },
                            {
                                "text": "Acessa o disco direto, sem passar pelo kernel",
                                "isCorrect": false
                            },
                            {
                                "text": "Escreve o driver do disco no momento da leitura",
                                "isCorrect": false
                            },
                            {
                                "text": "Aciona o firmware da placa para ler o setor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe vai justificar por que a base de containers e nuvem é Linux. Qual afirmação sustenta melhor essa escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O kernel é livre e traz o isolamento que os containers usam",
                                "isCorrect": true
                            },
                            {
                                "text": "O kernel Linux é o único que roda máquinas virtuais na nuvem",
                                "isCorrect": false
                            },
                            {
                                "text": "O Linux exige licença paga, o que garante o suporte na nuvem",
                                "isCorrect": false
                            },
                            {
                                "text": "Os containers rodam sem kernel, e o Linux facilita isso tudo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Distribuições",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é uma distribuição\n\nO kernel Linux sozinho não se instala nem se usa. Para chegar a um sistema pronto, alguém precisa juntar o kernel com um monte de programas, configurar tudo e empacotar. Esse conjunto pronto para instalar é uma distribuição (distro).\n\nUma distro reúne:\n\n- o **kernel** Linux (às vezes com ajustes próprios),\n- uma coleção de **pacotes** (programas e bibliotecas já compilados),\n- um **gerenciador de pacotes** para instalar, atualizar e remover software,\n- **ferramentas** de sistema, instalador e configurações padrão.\n\nDebian, Ubuntu, Fedora e Arch são distros diferentes montadas sobre o mesmo kernel."
                    },
                    {
                        "type": "text",
                        "value": "## O gerenciador de pacotes\n\nO item que mais define o dia a dia em uma distro é o gerenciador de pacotes. Ele resolve um problema chato: um programa depende de bibliotecas, que dependem de outras. O gerenciador baixa o pacote, instala junto com as dependências e mantém um registro do que está no sistema.\n\nCada família tem o seu, com um formato de pacote próprio:\n\n- distros Debian usam pacotes `.deb`, instalados com `apt` (e o `dpkg` por baixo),\n- distros Red Hat usam pacotes `.rpm`, instalados com `dnf` (antes o `yum`),\n- o Arch usa o `pacman`, com formato próprio.\n\nTraduzir um comando de uma família para outra (por exemplo `apt install` para `dnf install`) é rotina em DevOps."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Família\", \"Exemplos\", \"Gerenciador\", \"Formato\", \"Release\"], [\"Debian\", \"Debian, Ubuntu\", \"apt\", \"deb\", \"fixo, previsível\"], [\"Red Hat\", \"RHEL, Fedora, Rocky\", \"dnf\", \"rpm\", \"fixo (Fedora rápido)\"], [\"Arch\", \"Arch, Manjaro\", \"pacman\", \"pkg.tar.zst\", \"rolling release\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que muda e o que é comum\n\nEntre as distros muda a embalagem e o ritmo, não o núcleo:\n\n- **Gerenciador e formato de pacote**: `apt`/`.deb`, `dnf`/`.rpm`, `pacman`.\n- **Ciclo de release**: umas lançam versões fixas com data (Debian, RHEL), outras entregam atualização contínua (Arch, no modelo rolling release).\n- **Filosofia**: umas priorizam estabilidade (RHEL em servidor), outras software recente (Fedora, Arch).\n\nO que quase não muda é o kernel: as distros usam o mesmo Linux, às vezes em versões diferentes. Um script em Bash ou um `ls` funciona igual em todas, porque o kernel e os utilitários base são os mesmos. Por isso aprender Linux vale para qualquer distro."
                    },
                    {
                        "type": "code",
                        "value": "# Debian / Ubuntu\napt install nginx\n\n# RHEL / Fedora\ndnf install nginx\n\n# Arch\npacman -S nginx"
                    },
                    {
                        "type": "quote",
                        "value": "Uma distribuição é o kernel Linux mais pacotes, um gerenciador de pacotes e ferramentas. O que separa as famílias é sobretudo o gerenciador (apt, dnf, pacman) e o ciclo de release; o kernel por baixo é o mesmo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Alguém pergunta por que existem Ubuntu, Fedora e Arch se todos são Linux. Qual explicação está correta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "São distros diferentes sobre o mesmo kernel Linux",
                                "isCorrect": true
                            },
                            {
                                "text": "São kernels concorrentes, escritos cada um do zero",
                                "isCorrect": false
                            },
                            {
                                "text": "São versões pagas de um mesmo produto fechado",
                                "isCorrect": false
                            },
                            {
                                "text": "São apenas temas visuais aplicados ao Ubuntu",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um servidor Ubuntu, você precisa instalar o pacote do Nginx. Qual ferramenta é a usada nessa família?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "apt, o gerenciador de pacotes das distros Debian",
                                "isCorrect": true
                            },
                            {
                                "text": "dnf, o gerenciador das distros da família Red Hat",
                                "isCorrect": false
                            },
                            {
                                "text": "pacman, o gerenciador usado pelo Arch Linux",
                                "isCorrect": false
                            },
                            {
                                "text": "yum, o instalador padrão das distros Arch",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma distro entrega atualizações de forma contínua, sem versões numeradas com data de lançamento. Como se chama esse modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Rolling release, adotado por distros como o Arch",
                                "isCorrect": true
                            },
                            {
                                "text": "Long term support, com suporte fixo por dez anos",
                                "isCorrect": false
                            },
                            {
                                "text": "Release fixo, com nova versão a cada dois anos",
                                "isCorrect": false
                            },
                            {
                                "text": "Snapshot, que congela a distro numa imagem só",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você tem um script feito para Ubuntu e vai rodá-lo em um Fedora. O que provavelmente precisa mudar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os comandos de pacote, de apt para dnf",
                                "isCorrect": true
                            },
                            {
                                "text": "Os comandos do kernel, que são diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "A sintaxe do Bash, própria de cada distro",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando ls, que muda de nome no Fedora",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pacote vem no formato .rpm. Em qual família de distribuições ele se instala nativamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Na família Red Hat, com dnf (RHEL e Fedora)",
                                "isCorrect": true
                            },
                            {
                                "text": "Na família Debian, com apt (Debian e Ubuntu)",
                                "isCorrect": false
                            },
                            {
                                "text": "No Arch, com pacman, após uma conversão",
                                "isCorrect": false
                            },
                            {
                                "text": "Em qualquer distro, pois o formato é único",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O filesystem hierarchy (FHS)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Em Linux, quase tudo é arquivo\n\nO Linux trata quase tudo como arquivo: um documento é um arquivo, mas um disco, um terminal e até informações do kernel também aparecem como arquivos. Isso dá uma interface única, você lê e escreve nesses arquivos com as mesmas ferramentas.\n\nE todos eles vivem em uma única árvore. Diferente do Windows, que tem `C:` e `D:` separados, o Linux tem uma raiz só, representada pela barra `/`. Tudo pendura a partir dela: `/etc`, `/home`, `/var` e por aí vai. Essa organização segue um padrão, o FHS (Filesystem Hierarchy Standard), que define o que vai em cada diretório. Seguir o padrão é o que faz um administrador achar as coisas em qualquer distro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Diretório\", \"O que guarda\"], [\"/etc\", \"Arquivos de configuração do sistema\"], [\"/var\", \"Dados que variam: logs, filas, caches\"], [\"/home\", \"Pastas pessoais dos usuários\"], [\"/usr\", \"Programas e bibliotecas instalados\"], [\"/bin\", \"Binários essenciais (comandos básicos)\"], [\"/tmp\", \"Arquivos temporários, apagados no boot\"], [\"/dev\", \"Dispositivos (discos, terminais)\"], [\"/proc\", \"Informação do kernel e dos processos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Os diretórios que mais aparecem\n\nAlguns diretórios você visita todo dia em DevOps:\n\n- **/etc**: onde ficam as configurações. Editar `/etc/ssh/sshd_config` muda o comportamento do SSH.\n- **/var**: dados que crescem com o uso. Os logs em `/var/log` são o primeiro lugar para investigar um problema.\n- **/home**: os arquivos de cada usuário, como `/home/ana`. O root usa `/root`, à parte.\n- **/usr**: o grosso dos programas instalados, com `/usr/bin` e `/usr/lib`.\n- **/dev** e **/proc**: não são arquivos comuns em disco. `/dev/sda` representa um disco; `/proc` é gerado pelo kernel na hora, com dados de processos e do sistema."
                    },
                    {
                        "type": "text",
                        "value": "## Montar sistemas de arquivos\n\nA árvore única não vem toda de um disco só. Cada sistema de arquivos (uma partição, um pen drive, um compartilhamento de rede) é conectado a um diretório da árvore. Esse ato de conectar se chama montar (mount), e o diretório onde ele aparece é o ponto de montagem.\n\nPor exemplo, um segundo disco pode ser montado em `/dados`. A partir daí, tudo abaixo de `/dados` vive naquele disco, de forma transparente para os programas. É assim que o Linux junta vários dispositivos em uma árvore só, sem letras de unidade."
                    },
                    {
                        "type": "code",
                        "value": "ls /\n# bin  boot  dev  etc  home  proc  root  tmp  usr  var\n\nmount /dev/sdb1 /dados   # conecta o disco no ponto /dados\ndf -h                    # mostra o que esta montado e onde"
                    },
                    {
                        "type": "quote",
                        "value": "Em Linux tudo pende de uma raiz única, a `/`, seguindo o padrão FHS: `/etc` (config), `/var` (logs e dados variáveis), `/home` (usuários), `/dev` (dispositivos), `/proc` (kernel). Discos e partições entram na árvore por montagem (mount)."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você precisa alterar a configuração do serviço SSH em um servidor Linux. Em qual diretório procurar o arquivo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "/etc, que guarda as configurações do sistema",
                                "isCorrect": true
                            },
                            {
                                "text": "/var, que guarda logs e dados variáveis",
                                "isCorrect": false
                            },
                            {
                                "text": "/home, que guarda os arquivos dos usuários",
                                "isCorrect": false
                            },
                            {
                                "text": "/tmp, que guarda arquivos temporários",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço apresentou erro e você vai investigar os logs. Qual diretório costuma guardar os arquivos de log?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "/var/log, onde ficam os logs do sistema",
                                "isCorrect": true
                            },
                            {
                                "text": "/etc/log, onde ficam as configurações",
                                "isCorrect": false
                            },
                            {
                                "text": "/proc/log, gerado pelo kernel em memória",
                                "isCorrect": false
                            },
                            {
                                "text": "/tmp/log, que some a cada reinício",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Alguém vindo do Windows pergunta onde fica o C: no Linux. Qual resposta descreve o modelo do Linux?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não há letras; tudo pende de uma raiz única, a /",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada disco vira uma letra, como no Windows",
                                "isCorrect": false
                            },
                            {
                                "text": "A raiz fica em C: e as pastas descem dela",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada usuário tem a sua própria raiz separada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você conectou um segundo disco e quer que ele apareça em /dados na árvore de arquivos. Qual operação faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Montar (mount) o disco no ponto /dados",
                                "isCorrect": true
                            },
                            {
                                "text": "Formatar o disco com uma letra de unidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Copiar a raiz / inteira para dentro do disco",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um atalho de /dados para o disco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao listar /proc, você vê arquivos com dados de processos e do kernel que não ocupam espaço em disco. Por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "/proc é gerado pelo kernel em memória, na hora",
                                "isCorrect": true
                            },
                            {
                                "text": "/proc é um cache temporário que o boot apaga",
                                "isCorrect": false
                            },
                            {
                                "text": "/proc é um disco virtual montado pela rede",
                                "isCorrect": false
                            },
                            {
                                "text": "/proc guarda os binários essenciais do sistema",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O boot do Linux",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Ligou a máquina, e agora?\n\nEntre apertar o botão e ver o login, o Linux passa por uma sequência de etapas, e cada uma entrega o controle para a próxima. Entender essa cadeia ajuda a diagnosticar uma máquina que não sobe: dá para saber em qual etapa ela travou.\n\nA ordem é sempre a mesma:\n\n1. o **firmware** (BIOS ou UEFI) testa o hardware e acha o disco de boot,\n2. o **bootloader** (o GRUB, em geral) carrega o kernel,\n3. o **kernel** inicia o hardware e monta a raiz `/`,\n4. o **init** (o systemd, hoje) sobe os serviços até o sistema ficar pronto."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\", \"Programa\", \"Papel\"], [\"Firmware\", \"BIOS ou UEFI\", \"Testa o hardware e acha o disco de boot\"], [\"Bootloader\", \"GRUB\", \"Carrega o kernel na memória e o inicia\"], [\"Kernel\", \"Linux\", \"Inicia o hardware e monta a raiz\"], [\"Init\", \"systemd\", \"Sobe os serviços do sistema\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Do firmware ao kernel\n\nQuando a máquina liga, quem assume é o firmware da placa-mãe. Antigamente era a BIOS; hoje é a UEFI, mais moderna. O firmware faz um autoteste, escolhe o disco de boot e passa o controle ao que estiver no início desse disco: o bootloader.\n\nO bootloader mais comum no Linux é o GRUB. É ele que mostra aquele menu para escolher o sistema ou a versão do kernel. Sua função é achar o kernel no disco, carregá-lo na memória e iniciá-lo. A partir daí o kernel assume: reconhece o hardware, carrega drivers e monta o sistema de arquivos raiz. Por fim, o kernel inicia um único processo de userland, o init, que recebe o PID 1."
                    },
                    {
                        "type": "text",
                        "value": "## O init e os targets\n\nO init é o primeiro processo do espaço de usuário e a raiz de todos os outros (por isso PID 1). Sua tarefa é subir o resto do sistema: montar os demais discos, ligar a rede e iniciar os serviços (SSH, servidor web, banco). Hoje o init padrão na maioria das distros é o systemd.\n\nO systemd organiza o estado do sistema em targets, que agrupam o que deve estar no ar. Eles substituem os antigos runlevels do init clássico:\n\n- `multi-user.target`: modo texto com rede e serviços (equivale ao runlevel 3),\n- `graphical.target`: o anterior mais a interface gráfica (runlevel 5).\n\nEm servidor, o alvo típico é o `multi-user.target`, sem ambiente gráfico."
                    },
                    {
                        "type": "code",
                        "value": "systemctl get-default\n# multi-user.target        (alvo padrao no boot)\n\nsystemd-analyze\n# Startup finished in ... = 4.2s   (quanto o boot levou)"
                    },
                    {
                        "type": "quote",
                        "value": "A ordem do boot é firmware (BIOS/UEFI), bootloader (GRUB), kernel e init (systemd). O kernel monta a raiz e inicia o init como PID 1; o systemd sobe os serviços e leva o sistema a um target, que substitui o antigo runlevel."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você quer entender a ordem em que o Linux inicializa, do botão ao login. Qual sequência está correta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Firmware, bootloader, kernel e por fim o init",
                                "isCorrect": true
                            },
                            {
                                "text": "Kernel, firmware, init e por fim o bootloader",
                                "isCorrect": false
                            },
                            {
                                "text": "Bootloader, kernel, firmware e por fim o init",
                                "isCorrect": false
                            },
                            {
                                "text": "Init, kernel, bootloader e por fim o firmware",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao ligar o servidor, aparece um menu para escolher a versão do kernel. Qual componente exibe esse menu?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O GRUB, o bootloader que carrega o kernel",
                                "isCorrect": true
                            },
                            {
                                "text": "A BIOS, o firmware que testa o hardware",
                                "isCorrect": false
                            },
                            {
                                "text": "O systemd, o init que sobe os serviços",
                                "isCorrect": false
                            },
                            {
                                "text": "O kernel, que monta o sistema de arquivos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que o kernel monta a raiz, ele inicia um processo de userland que recebe o PID 1. Que processo é esse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O init (systemd), que sobe os serviços",
                                "isCorrect": true
                            },
                            {
                                "text": "O GRUB, que segue carregando o kernel",
                                "isCorrect": false
                            },
                            {
                                "text": "O firmware, que ainda testa o hardware",
                                "isCorrect": false
                            },
                            {
                                "text": "O shell Bash, aberto direto pelo kernel",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Logo que a máquina é ligada, antes de qualquer bootloader, quem assume o controle do hardware?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O firmware, a BIOS ou a UEFI da placa",
                                "isCorrect": true
                            },
                            {
                                "text": "O kernel Linux, já carregado na memória",
                                "isCorrect": false
                            },
                            {
                                "text": "O init, o primeiro processo do sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "O GRUB, gravado no início do disco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um servidor sem interface gráfica, qual target do systemd costuma ser o alvo padrão do boot?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "multi-user.target, modo texto com rede",
                                "isCorrect": true
                            },
                            {
                                "text": "graphical.target, que adiciona o ambiente gráfico",
                                "isCorrect": false
                            },
                            {
                                "text": "rescue.target, usado para manutenção mínima",
                                "isCorrect": false
                            },
                            {
                                "text": "reboot.target, que reinicia a máquina ao subir",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Usuários e o modelo de acesso",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## root e usuário comum\n\nNo Linux, todo processo roda em nome de um usuário, e o sistema decide o que ele pode fazer com base nisso. Existe um usuário especial, o root, também chamado de superusuário: ele pode tudo. Ler qualquer arquivo, encerrar qualquer processo, mudar qualquer configuração. Nenhuma permissão barra o root.\n\nO que identifica o root não é o nome, é o número: o root tem UID 0. Qualquer conta com UID 0 é tratada como superusuário. Os demais são usuários comuns, com poderes limitados: mexem nos próprios arquivos, mas não nos do sistema nem nos de outro usuário, a menos que recebam permissão."
                    },
                    {
                        "type": "text",
                        "value": "## UID e GID\n\nO sistema não trabalha com nomes, e sim com números:\n\n- **UID** (User ID): o número que identifica cada usuário. O root é 0; os humanos costumam começar em 1000.\n- **GID** (Group ID): o número do grupo. Grupos juntam usuários para dar acesso em bloco, por exemplo um grupo `docker` cujos membros podem usar o Docker.\n\nCada usuário tem um UID e um grupo principal (GID), e pode participar de vários grupos. As permissões de um arquivo são checadas contra o UID e os grupos de quem tenta acessá-lo. O nome que você vê (ana, root) é só uma etiqueta amigável para esses números."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Arquivo\", \"Guarda\", \"Quem lê\"], [\"/etc/passwd\", \"Contas: nome, UID, GID, shell, home\", \"Todos leem\"], [\"/etc/shadow\", \"Senhas com hash e regras de expiração\", \"Só o root\"], [\"/etc/group\", \"Grupos e seus membros\", \"Todos leem\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que não viver como root\n\nComo o root não encontra barreira nenhuma, trabalhar logado como ele o dia todo é arriscado:\n\n- um erro de digitação (um `rm` no diretório errado) apaga o sistema sem avisar,\n- um comando malicioso ou um script comprometido roda com poder total,\n- some o registro de quem fez o quê, tudo aparece como root.\n\nA prática recomendada é usar uma conta comum no dia a dia e escalar para root só quando necessário, com `sudo`, que executa um comando como root e deixa registro. Assim o acesso total fica pontual e auditável, não o padrão."
                    },
                    {
                        "type": "code",
                        "value": "id\n# uid=1000(ana) gid=1000(ana) groups=1000(ana),27(sudo),999(docker)\n\ngrep ana /etc/passwd\n# ana:x:1000:1000:Ana:/home/ana:/bin/bash\n# (o x indica que a senha esta em /etc/shadow)"
                    },
                    {
                        "type": "quote",
                        "value": "root é o superusuário, identificado pelo UID 0, sem limite de permissão. As contas ficam em /etc/passwd (legível por todos) e as senhas com hash em /etc/shadow (só root). No dia a dia, use conta comum e escale com sudo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um sistema tem uma conta chamada admin com UID 0. Como o Linux vai tratar essa conta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Como root, pois o UID 0 define o superusuário",
                                "isCorrect": true
                            },
                            {
                                "text": "Como usuário comum, pois o nome não é root",
                                "isCorrect": false
                            },
                            {
                                "text": "Como conta bloqueada, por ter UID igual a zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Como grupo de sistema, sem poder de login",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer ver a lista de contas do sistema, com nome, UID e shell de cada uma. Qual arquivo consultar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "/etc/passwd, legível por todos os usuários",
                                "isCorrect": true
                            },
                            {
                                "text": "/etc/shadow, legível apenas pelo root",
                                "isCorrect": false
                            },
                            {
                                "text": "/etc/group, que lista somente os grupos",
                                "isCorrect": false
                            },
                            {
                                "text": "/etc/hosts, que mapeia nomes de rede",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As senhas dos usuários não ficam em /etc/passwd. Onde ficam os hashes das senhas e quem pode lê-los?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Em /etc/shadow, que só o root consegue ler",
                                "isCorrect": true
                            },
                            {
                                "text": "Em /etc/passwd, que qualquer usuário lê",
                                "isCorrect": false
                            },
                            {
                                "text": "Em /etc/group, junto com a lista de grupos",
                                "isCorrect": false
                            },
                            {
                                "text": "Em um arquivo oculto no home do usuário",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe administra servidores e discute a rotina de acesso. Qual prática é a recomendada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar conta comum e escalar com sudo se preciso",
                                "isCorrect": true
                            },
                            {
                                "text": "Ficar logado como root o dia todo por agilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Compartilhar a senha do root com todo o time",
                                "isCorrect": false
                            },
                            {
                                "text": "Dar UID 0 a cada conta pessoal da equipe",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao rodar id, você vê uid=1000(ana) e gid=1000(ana), além de outros grupos. O que o GID representa nesse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O grupo principal do usuário ana",
                                "isCorrect": true
                            },
                            {
                                "text": "O número pessoal do usuário ana",
                                "isCorrect": false
                            },
                            {
                                "text": "A senha com hash da conta ana",
                                "isCorrect": false
                            },
                            {
                                "text": "O diretório home da conta ana",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Linha de comando essencial",
        "aulas": [
            {
                "titulo": "Shell e terminal",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Terminal e shell não são a mesma coisa\n\nQuando você abre um terminal, vê uma janela esperando comandos. Mas o terminal é só a interface: ele mostra texto na tela e captura o que você digita. Quem lê os comandos, executa e devolve o resultado é o shell, um programa que roda dentro do terminal.\n\nO shell mais comum no Linux é o bash (Bourne Again Shell). Existem outros, como zsh, fish e o sh original, mas em servidores e pipelines de DevOps o bash é o padrão que você encontra na maioria esmagadora das vezes.\n\n- Terminal: a janela que exibe e recebe texto.\n- Shell: o interpretador que transforma o que você digita em ações."
                    },
                    {
                        "type": "text",
                        "value": "## A anatomia de um comando\n\nTodo comando segue mais ou menos a mesma estrutura: o nome do comando, seguido de opções, que mudam o comportamento, e argumentos, o alvo da ação.\n\n- Comando: o programa a executar, como `ls`.\n- Opções (ou flags): ajustam o comportamento e costumam começar com `-` na forma curta ou `--` na forma longa, como `-l` e `--all`.\n- Argumentos: aquilo sobre o que o comando age, como um arquivo ou um diretório.\n\nEm `ls -l /etc`, o `ls` é o comando, `-l` é a opção e `/etc` é o argumento. Opções curtas podem ser agrupadas: `ls -la` é o mesmo que `ls -l -a`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Parte\",\"Exemplo\",\"Papel\"],[\"Comando\",\"ls\",\"o programa que roda\"],[\"Opção curta\",\"-l\",\"liga um comportamento, uma letra\"],[\"Opção longa\",\"--all\",\"mesma ideia, nome por extenso\"],[\"Argumento\",\"/etc\",\"o alvo do comando\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# sem argumento, o ls age no diretório atual\nls\n\n# com opção e argumento\nls -la /home"
                    },
                    {
                        "type": "text",
                        "value": "## O prompt e onde os comandos moram\n\nAntes do cursor, o shell mostra o prompt, um texto que costuma exibir usuário, máquina e diretório atual, terminando em `$` para usuário comum ou `#` para root. Ele sinaliza que o shell está pronto para receber um comando.\n\nQuando você digita `ls`, o shell não adivinha onde esse programa está. Ele procura o executável nos diretórios listados na variável PATH, testando um a um até encontrar. Por isso `ls` e `cat` funcionam de qualquer lugar: as pastas onde eles vivem já estão no PATH.\n\n## Pedindo ajuda\n\nNinguém decora todas as opções. Duas formas rápidas de consultar:\n\n- `man comando` abre o manual completo, com descrição e todas as opções.\n- `comando --help` mostra um resumo rápido no próprio terminal."
                    },
                    {
                        "type": "quote",
                        "value": "O terminal é a janela; o shell, quase sempre o bash, é o programa que interpreta seus comandos. Um comando se divide em nome, opções e argumentos."
                    }
                ],
                "questions": [
                    {
                        "statement": "No comando `ls -la /home`, qual elemento é o argumento?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`/home`",
                                "isCorrect": true
                            },
                            {
                                "text": "`ls`",
                                "isCorrect": false
                            },
                            {
                                "text": "`-la`",
                                "isCorrect": false
                            },
                            {
                                "text": "`-l`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um colega novo em DevOps pergunta qual a diferença entre terminal e shell. Qual resposta está correta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O terminal exibe e recebe texto; o shell executa os comandos.",
                                "isCorrect": true
                            },
                            {
                                "text": "O terminal executa os comandos; o shell apenas exibe o texto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Terminal e shell são dois nomes para o mesmo programa.",
                                "isCorrect": false
                            },
                            {
                                "text": "O shell é a janela e o terminal executa tudo por baixo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você digita `htop` e recebe `command not found`, mesmo com o programa instalado. Onde o shell procura o executável de um comando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nos diretórios listados na variável PATH.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas no diretório atual onde você está.",
                                "isCorrect": false
                            },
                            {
                                "text": "No manual acessado pelo comando `man`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente na pasta pessoal do usuário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer a lista completa de opções do comando `tar`, com descrições detalhadas. Qual recurso usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`man tar`, que abre o manual completo.",
                                "isCorrect": true
                            },
                            {
                                "text": "`tar --version`, que lista todas as opções.",
                                "isCorrect": false
                            },
                            {
                                "text": "`which tar`, que descreve todas as opções.",
                                "isCorrect": false
                            },
                            {
                                "text": "`help tar`, que abre o manual do tar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No comando `grep -i -n erro app.log`, qual afirmação sobre sua estrutura está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "`erro` e `app.log` são argumentos; `-i` e `-n` são opções.",
                                "isCorrect": true
                            },
                            {
                                "text": "`-i` e `-n` são argumentos; `erro` é uma opção do grep.",
                                "isCorrect": false
                            },
                            {
                                "text": "`grep -i -n` é o comando; `erro` e `app.log` são opções.",
                                "isCorrect": false
                            },
                            {
                                "text": "`app.log` é a opção e `erro` é o argumento do grep.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Navegação e arquivos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Onde estou e o que tem aqui\n\nO primeiro reflexo em um servidor desconhecido é se localizar. O comando `pwd` (print working directory) mostra o caminho completo do diretório onde você está agora.\n\nPara ver o conteúdo do diretório, use `ls`. Sozinho ele lista os nomes, mas duas opções mudam o dia a dia:\n\n- `ls -l` mostra a listagem longa, com permissões, dono, tamanho e data de cada item.\n- `ls -a` mostra também os arquivos ocultos, cujo nome começa com ponto, como `.bashrc`.\n\nAs duas se combinam em `ls -la`."
                    },
                    {
                        "type": "text",
                        "value": "## Mudando de diretório\n\nPara entrar em outra pasta, use `cd` (change directory) seguido do caminho. Aqui aparece uma distinção central entre caminho absoluto e caminho relativo.\n\n- Caminho absoluto: começa na raiz `/` e descreve o trajeto inteiro, como `/var/log/nginx`. Vale de qualquer lugar.\n- Caminho relativo: parte de onde você está agora, como `nginx` ou `../config`.\n\nTrês atalhos aparecem o tempo todo:\n\n- `.` é o diretório atual.\n- `..` é o diretório acima, o pai.\n- `~` é a sua pasta pessoal, algo como `/home/joao`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\",\"O que faz\"],[\"pwd\",\"mostra o diretório atual\"],[\"ls -l\",\"lista com permissões, dono e tamanho\"],[\"ls -a\",\"inclui os arquivos ocultos\"],[\"cd ..\",\"sobe um nível, para o diretório pai\"],[\"cd ~\",\"volta para a pasta pessoal\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# criar um arquivo vazio e uma pasta\ntouch notas.txt\nmkdir projeto\n\n# copiar, mover ou renomear, e remover\ncp notas.txt backup.txt\nmv notas.txt projeto/\nrm backup.txt"
                    },
                    {
                        "type": "text",
                        "value": "## Criar, copiar, mover e remover\n\nPoucos comandos cobrem quase tudo:\n\n- `touch arquivo` cria um arquivo vazio ou atualiza a data de um já existente.\n- `mkdir pasta` cria um diretório; com `-p` ele cria a árvore inteira de uma vez.\n- `cp origem destino` copia; para pastas, use `cp -r`.\n- `mv origem destino` move ou renomeia, é o mesmo comando.\n- `rm arquivo` remove.\n\n## O perigo do rm -rf\n\nO `rm` não manda para uma lixeira: ele apaga de verdade. A combinação `rm -rf` remove de forma recursiva, com o `-r` entrando nas subpastas, e forçada, com o `-f` sem perguntar nada. Um `rm -rf` no caminho errado pode destruir um servidor inteiro sem aviso. Confira o caminho duas vezes antes do Enter."
                    },
                    {
                        "type": "quote",
                        "value": "Caminho absoluto começa na raiz `/` e vale de qualquer lugar; caminho relativo parte de onde você está. E o `rm -rf` apaga sem confirmar nem enviar à lixeira."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você acabou de conectar em um servidor e não sabe em qual diretório está. Qual comando mostra o caminho atual?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`pwd`",
                                "isCorrect": true
                            },
                            {
                                "text": "`cd`",
                                "isCorrect": false
                            },
                            {
                                "text": "`ls -a`",
                                "isCorrect": false
                            },
                            {
                                "text": "`mkdir`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer ver também os arquivos ocultos de configuração, cujos nomes começam com ponto. Qual opção do `ls` usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`ls -a`",
                                "isCorrect": true
                            },
                            {
                                "text": "`ls -l`",
                                "isCorrect": false
                            },
                            {
                                "text": "`ls -r`",
                                "isCorrect": false
                            },
                            {
                                "text": "`ls -h`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Estando em `/home/ana`, você executa `cd ..`. Em qual diretório você fica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`/home`",
                                "isCorrect": true
                            },
                            {
                                "text": "`/home/ana`",
                                "isCorrect": false
                            },
                            {
                                "text": "a raiz `/`",
                                "isCorrect": false
                            },
                            {
                                "text": "a pasta pessoal `~`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um script vai apagar uma pasta e todo o seu conteúdo, sem pedir confirmação. Qual comando tem esse efeito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`rm -rf pasta`, remove recursiva e forçada.",
                                "isCorrect": true
                            },
                            {
                                "text": "`rmdir pasta`, remove pastas com conteúdo.",
                                "isCorrect": false
                            },
                            {
                                "text": "`rm -i pasta`, remove sem confirmar nada.",
                                "isCorrect": false
                            },
                            {
                                "text": "`mv -rf pasta`, move e apaga a origem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa criar de uma vez a estrutura `projeto/src/utils`, e nenhuma dessas pastas existe ainda. Qual comando cria toda a árvore?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "`mkdir -p projeto/src/utils`",
                                "isCorrect": true
                            },
                            {
                                "text": "`mkdir projeto/src/utils`",
                                "isCorrect": false
                            },
                            {
                                "text": "`mkdir -r projeto/src/utils`",
                                "isCorrect": false
                            },
                            {
                                "text": "`touch -p projeto/src/utils`",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ver e editar arquivos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Vendo o conteúdo de um arquivo\n\nO jeito mais direto de ver um arquivo é `cat arquivo`, que despeja todo o conteúdo na tela de uma vez. Funciona bem para arquivos curtos, mas em um log de milhares de linhas ele rola tudo e o começo some no topo.\n\nPara arquivos grandes, use `less arquivo`. Ele abre um visualizador paginado: você navega com as setas ou com PageUp e PageDown, procura texto digitando `/palavra` e sai com `q`. O `less` não carrega o arquivo inteiro na memória, então abre um log gigante na hora."
                    },
                    {
                        "type": "text",
                        "value": "## Só o começo ou só o fim\n\nMuitas vezes você não quer o arquivo inteiro, só uma ponta dele:\n\n- `head arquivo` mostra as primeiras 10 linhas.\n- `tail arquivo` mostra as últimas 10 linhas.\n- `head -n 5` e `tail -n 5` ajustam quantas linhas aparecem.\n\nEm DevOps, a estrela é o `tail -f arquivo` (follow). Ele mostra o fim do arquivo e continua acompanhando em tempo real: cada linha nova escrita no log aparece na hora na sua tela. É o jeito clássico de assistir a um serviço enquanto ele roda. Saia com Ctrl+C."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\",\"Quando usar\"],[\"cat\",\"arquivo curto, tudo de uma vez\"],[\"less\",\"arquivo grande, navegação paginada\"],[\"head\",\"as primeiras linhas\"],[\"tail\",\"as últimas linhas\"],[\"tail -f\",\"acompanhar um log em tempo real\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Editando no terminal\n\nVer não basta; às vezes você precisa alterar. Dois editores rodam direto no terminal:\n\n- `nano arquivo` é o editor amigável para começar. Os atalhos aparecem no rodapé, onde o `^` significa a tecla Ctrl. Para gravar, use Ctrl+O; para sair, Ctrl+X.\n- `vim arquivo` é poderoso e onipresente em servidores, mas tem uma curva de aprendizado. Ele trabalha com modos, um normal para comandos e um de inserção para digitar, o que confunde no começo. Vale conhecer, porque em muitos servidores é o editor que está instalado."
                    },
                    {
                        "type": "code",
                        "value": "# criar um arquivo escrevendo direto nele\necho \"porta=8080\" > config.txt\n\n# ver as 20 primeiras linhas de um log\nhead -n 20 /var/log/syslog\n\n# acompanhar um log em tempo real\ntail -f /var/log/nginx/access.log"
                    },
                    {
                        "type": "quote",
                        "value": "O `cat` joga tudo na tela; o `less` pagina arquivos grandes; o `tail -f` acompanha um log em tempo real. Para começar a editar, o `nano` é o caminho mais simples."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você quer acompanhar em tempo real as novas linhas que um serviço escreve em `app.log`. Qual comando usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`tail -f app.log`",
                                "isCorrect": true
                            },
                            {
                                "text": "`cat app.log`",
                                "isCorrect": false
                            },
                            {
                                "text": "`head app.log`",
                                "isCorrect": false
                            },
                            {
                                "text": "`less app.log`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa ver apenas as 5 primeiras linhas de um arquivo de configuração. Qual comando traz isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`head -n 5 config.yml`",
                                "isCorrect": true
                            },
                            {
                                "text": "`tail -n 5 config.yml`",
                                "isCorrect": false
                            },
                            {
                                "text": "`cat -5 config.yml`",
                                "isCorrect": false
                            },
                            {
                                "text": "`less -5 config.yml`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No editor `nano`, o rodapé mostra `^O Gravar` e `^X Sair`. Como você salva o arquivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pressionando Ctrl+O.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pressionando Ctrl+S.",
                                "isCorrect": false
                            },
                            {
                                "text": "Digitando `:w` e Enter.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pressionando Ctrl+X.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sem abrir um editor, você quer criar `nota.txt` já com o texto `ok` dentro. Qual comando faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`echo \"ok\" > nota.txt`",
                                "isCorrect": true
                            },
                            {
                                "text": "`echo \"ok\" < nota.txt`",
                                "isCorrect": false
                            },
                            {
                                "text": "`cat \"ok\" > nota.txt`",
                                "isCorrect": false
                            },
                            {
                                "text": "`touch nota.txt ok`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um colega usou `cat` em um arquivo de 100 mil linhas e reclamou que o início sumiu da tela. Por que o `less` funcionaria melhor?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O `less` pagina e deixa rolar; o `cat` imprime tudo de corrida.",
                                "isCorrect": true
                            },
                            {
                                "text": "O `less` edita o arquivo; o `cat` apenas o apaga ao abrir.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `less` carrega tudo na memória; o `cat` lê linha a linha.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `less` mostra só o fim; o `cat` mostra só o começo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Pipes e redirecionamento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Os três fluxos de um comando\n\nTodo comando no Linux trabalha com três canais de dados, os fluxos padrão:\n\n- stdin (entrada padrão): por onde o comando recebe dados, em geral do teclado.\n- stdout (saída padrão): por onde ele manda o resultado normal, em geral para a tela.\n- stderr (saída de erro): um canal separado só para as mensagens de erro, que também vai para a tela por padrão.\n\nA sacada é que stdout e stderr são canais diferentes. Isso permite guardar o resultado em um arquivo e deixar os erros na tela, ou o contrário. Cada canal tem um número: stdin é 0, stdout é 1 e stderr é 2."
                    },
                    {
                        "type": "text",
                        "value": "## Redirecionando a saída\n\nRedirecionar é desviar um fluxo do seu destino padrão para outro lugar, quase sempre um arquivo:\n\n- `>` manda o stdout para um arquivo, sobrescrevendo todo o conteúdo anterior.\n- `>>` manda o stdout para um arquivo, anexando no final sem apagar o que já havia.\n- `2>` redireciona só o stderr, o canal de erro.\n\nOu seja, `comando > saida.txt` guarda o resultado e zera o que o arquivo tinha antes; `comando >> saida.txt` acrescenta ao fim. Atenção ao `>`: ele apaga o destino antes de escrever."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Operador\",\"O que faz\"],[\">\",\"envia o stdout e sobrescreve o arquivo\"],[\">>\",\"envia o stdout e anexa ao final\"],[\"2>\",\"redireciona só o stderr, os erros\"],[\"|\",\"liga a saída de um comando à entrada do próximo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O pipe: ligando comandos\n\nO pipe, o caractere `|`, é a ideia mais poderosa da linha de comando. Ele pega o stdout de um comando e entrega como stdin do comando seguinte, sem passar por arquivo nenhum.\n\nAssim você monta uma linha de montagem, em que cada comando faz uma coisa bem feita e passa o resultado adiante. Em `cat access.log | grep erro | wc -l`, o `cat` joga o log para o `grep`, que filtra as linhas com erro e passa para o `wc -l`, que conta quantas são. Três ferramentas simples resolvem juntas um problema real."
                    },
                    {
                        "type": "code",
                        "value": "# sobrescreve o arquivo com a data atual\ndate > registro.txt\n\n# anexa uma nova linha ao final\necho \"backup ok\" >> registro.txt\n\n# guarda os erros em um arquivo à parte\nls /pasta/inexistente 2> erros.txt\n\n# conta quantos processos do nginx estão rodando\nps aux | grep nginx | wc -l"
                    },
                    {
                        "type": "quote",
                        "value": "O `>` sobrescreve, o `>>` anexa e o `2>` desvia os erros (stderr). O pipe `|` conecta o stdout de um comando ao stdin do próximo, sem arquivo no meio."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você quer acrescentar uma linha ao final de um arquivo de log já existente, sem apagar o conteúdo. Qual operador usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`>>`",
                                "isCorrect": true
                            },
                            {
                                "text": "`>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`2>`",
                                "isCorrect": false
                            },
                            {
                                "text": "`|`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer usar a saída do comando `ps aux` como entrada do comando `grep`. O que liga um ao outro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "o pipe `|`",
                                "isCorrect": true
                            },
                            {
                                "text": "o operador `>`",
                                "isCorrect": false
                            },
                            {
                                "text": "o operador `2>`",
                                "isCorrect": false
                            },
                            {
                                "text": "o operador `>>`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O arquivo `dados.txt` já tem 100 linhas. Você executa `echo nova > dados.txt`. O que acontece com o conteúdo antigo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É apagado, e o arquivo fica com a nova linha.",
                                "isCorrect": true
                            },
                            {
                                "text": "É mantido, e a nova linha vai para o final.",
                                "isCorrect": false
                            },
                            {
                                "text": "É mantido, e a nova linha vai para o topo.",
                                "isCorrect": false
                            },
                            {
                                "text": "É duplicado junto com a nova linha inserida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um comando imprime o resultado e também mensagens de erro. Você quer guardar apenas os erros em `erros.txt`. Qual operador usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`2> erros.txt`",
                                "isCorrect": true
                            },
                            {
                                "text": "`> erros.txt`",
                                "isCorrect": false
                            },
                            {
                                "text": "`1> erros.txt`",
                                "isCorrect": false
                            },
                            {
                                "text": "`>> erros.txt`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre os fluxos padrão e seus números, qual associação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "stdout é o canal 1 e stderr é o canal 2.",
                                "isCorrect": true
                            },
                            {
                                "text": "stdin é o canal 1 e stdout é o canal 2.",
                                "isCorrect": false
                            },
                            {
                                "text": "stderr é o canal 0 e stdin é o canal 2.",
                                "isCorrect": false
                            },
                            {
                                "text": "stdout é o canal 2 e stderr é o canal 1.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Busca",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Achando arquivos com find\n\nO `find` procura arquivos e pastas percorrendo uma árvore de diretórios. A forma básica é `find caminho criterio`: primeiro o ponto de partida, com `.` para o diretório atual, e depois os filtros.\n\n- `find . -name \"*.log\"` procura pelo nome, aceitando curingas como `*`.\n- `find . -type d` filtra por tipo: `d` para diretório e `f` para arquivo comum.\n- `find . -size +100M` filtra por tamanho, aqui os maiores que 100 MB.\n\nOs critérios se combinam: `find /var -type f -name \"*.gz\"` acha arquivos comuns terminados em .gz dentro de `/var`."
                    },
                    {
                        "type": "text",
                        "value": "## Achando texto dentro dos arquivos\n\nEnquanto o `find` busca arquivos pelo nome, o `grep` busca texto dentro deles. Ele varre o conteúdo e mostra as linhas que casam com o que você procura:\n\n- `grep erro app.log` mostra as linhas de `app.log` que contêm a palavra erro.\n- `grep -i erro app.log` ignora maiúsculas e minúsculas, então acha Erro e ERRO também.\n- `grep -r erro .` busca recursivamente em todos os arquivos a partir do diretório atual.\n\nÉ a ferramenta que você mais usa para caçar uma mensagem no meio de milhares de linhas de log."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\",\"Para que serve\"],[\"find\",\"achar arquivos por nome, tipo ou tamanho\"],[\"grep\",\"achar linhas de texto dentro de arquivos\"],[\"wc -l\",\"contar linhas\"],[\"sort\",\"ordenar as linhas\"],[\"uniq\",\"remover linhas repetidas seguidas\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Contar e ordenar\n\nTrês comandos pequenos fecham o kit de análise:\n\n- `wc` conta; `wc -l` conta linhas, o uso mais comum, e ele também conta palavras e bytes.\n- `sort` ordena as linhas em ordem alfabética, ou numérica com `-n`.\n- `uniq` remove linhas repetidas, mas só quando estão coladas uma na outra. Por isso ele quase sempre vem depois de um `sort`, que junta as iguais.\n\nA dupla `sort | uniq -c` é clássica: ordena, agrupa as repetidas e conta quantas vezes cada linha aparece."
                    },
                    {
                        "type": "code",
                        "value": "# achar todos os .conf a partir de /etc\nfind /etc -name \"*.conf\"\n\n# contar quantas linhas têm a palavra erro\ngrep -i erro app.log | wc -l\n\n# os 5 IPs que mais aparecem no log de acesso\nsort access.log | uniq -c | sort -rn | head -n 5"
                    },
                    {
                        "type": "quote",
                        "value": "O `find` acha arquivos pelo nome, tipo ou tamanho; o `grep` acha texto dentro deles. E o `uniq` só junta as repetidas que estão adjacentes, por isso costuma vir depois de um `sort`."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você quer ver todas as linhas do arquivo `app.log` que contêm a palavra `timeout`. Qual comando usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`grep timeout app.log`",
                                "isCorrect": true
                            },
                            {
                                "text": "`find timeout app.log`",
                                "isCorrect": false
                            },
                            {
                                "text": "`wc timeout app.log`",
                                "isCorrect": false
                            },
                            {
                                "text": "`sort timeout app.log`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa localizar todos os arquivos terminados em `.log` a partir do diretório atual. Qual comando faz a busca por nome?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`find . -name \"*.log\"`",
                                "isCorrect": true
                            },
                            {
                                "text": "`grep . -name \"*.log\"`",
                                "isCorrect": false
                            },
                            {
                                "text": "`find . -type \"*.log\"`",
                                "isCorrect": false
                            },
                            {
                                "text": "`ls -name \"*.log\"`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um log tem Erro, ERRO e erro espalhados. Você quer todas as ocorrências, sem se importar com maiúsculas. Qual opção do grep usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`grep -i erro app.log`",
                                "isCorrect": true
                            },
                            {
                                "text": "`grep -r erro app.log`",
                                "isCorrect": false
                            },
                            {
                                "text": "`grep -v erro app.log`",
                                "isCorrect": false
                            },
                            {
                                "text": "`grep -l erro app.log`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer saber quantas linhas de `access.log` contêm `404`. Qual comando dá o número?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`grep 404 access.log | wc -l`",
                                "isCorrect": true
                            },
                            {
                                "text": "`grep 404 access.log | sort`",
                                "isCorrect": false
                            },
                            {
                                "text": "`find 404 access.log | wc -l`",
                                "isCorrect": false
                            },
                            {
                                "text": "`wc -l access.log | grep 404`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você tem uma lista de IPs repetidos, um por linha, e quer contar quantas vezes cada um aparece. Qual sequência resolve?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "`sort ips.txt | uniq -c`",
                                "isCorrect": true
                            },
                            {
                                "text": "`uniq -c ips.txt | sort`",
                                "isCorrect": false
                            },
                            {
                                "text": "`uniq ips.txt | wc -l`",
                                "isCorrect": false
                            },
                            {
                                "text": "`sort -c ips.txt | uniq`",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Permissões, usuários e processos",
        "aulas": [
            {
                "titulo": "Permissões de arquivo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O modelo rwx: dono, grupo e outros\n\nNo Linux, todo arquivo e todo diretório carrega um conjunto de permissões que decide quem pode fazer o quê. Essas permissões são divididas em três categorias de gente:\n\n- **Dono (user)**: o usuário dono do arquivo, normalmente quem o criou.\n- **Grupo (group)**: os usuários que pertencem ao grupo do arquivo.\n- **Outros (others)**: todo o resto, qualquer usuário que não seja o dono nem esteja no grupo.\n\nPara cada categoria existem três permissões, sempre na mesma ordem: **r** de leitura (read), **w** de escrita (write) e **x** de execução (execute). É o famoso modelo rwx."
                    },
                    {
                        "type": "text",
                        "value": "## Lendo a saída de ls -l\n\nO comando ls -l mostra as permissões no começo de cada linha, em dez caracteres. O primeiro indica o tipo: um traço para arquivo comum, a letra d para diretório, l para link. Os nove seguintes são três blocos de rwx, nesta ordem: dono, grupo e outros.\n\nNa permissão -rwxr-xr--, por exemplo, o dono tem rwx (lê, escreve e executa), o grupo tem r-x (lê e executa) e outros têm r-- (apenas leem). Um traço no lugar da letra significa que aquela permissão está ausente."
                    },
                    {
                        "type": "code",
                        "value": "$ ls -l deploy.sh\n-rwxr-xr-- 1 deploy devops 1240 jul 25 09:14 deploy.sh\n\n# tipo: -   blocos: rwx (dono) r-x (grupo) r-- (outros)\n# dono: deploy   grupo: devops"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Permissão\", \"Em um arquivo\", \"Em um diretório\"], [\"r (leitura)\", \"Ler o conteúdo do arquivo\", \"Listar os nomes que estão dentro\"], [\"w (escrita)\", \"Alterar o conteúdo do arquivo\", \"Criar, renomear e apagar entradas\"], [\"x (execução)\", \"Rodar o arquivo como programa\", \"Entrar no diretório e acessar os arquivos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Mudando permissões com chmod\n\nO comando chmod altera as permissões, e existem dois jeitos de usá-lo.\n\nNo **modo simbólico**, você informa a categoria (u para dono, g para grupo, o para outros, a para todos), a operação (+ adiciona, - remove, = define exatamente) e a permissão. Assim, chmod u+x deploy.sh adiciona execução só para o dono.\n\nNo **modo octal**, cada bloco rwx vira um número somando r=4, w=2 e x=1. Um bloco rwx é 4+2+1=7, r-x é 4+1=5 e r-- é 4. Por isso chmod 755 deixa o arquivo como rwxr-xr-x, e chmod 644 deixa como rw-r--r--."
                    },
                    {
                        "type": "quote",
                        "value": "No octal, some r=4, w=2 e x=1 em cada bloco: 755 é rwxr-xr-x e 644 é rw-r--r--."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você roda ls -l e a linha de um arquivo começa com -rwxr-xr--. Que permissões a categoria outros tem sobre esse arquivo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Apenas leitura.",
                                "isCorrect": true
                            },
                            {
                                "text": "Leitura e escrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Leitura e execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma permissão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O comando chmod 755 script.sh foi aplicado. Quais permissões o dono passou a ter?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Leitura, escrita e execução (rwx).",
                                "isCorrect": true
                            },
                            {
                                "text": "Leitura e execução, sem escrita (r-x).",
                                "isCorrect": false
                            },
                            {
                                "text": "Leitura e escrita, sem execução (rw-).",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente execução do arquivo (--x).",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O script deploy.sh está sem permissão de execução. Você quer adicionar execução apenas para o dono, sem mexer no resto, usando o modo simbólico. Qual comando usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "chmod u+x deploy.sh",
                                "isCorrect": true
                            },
                            {
                                "text": "chmod +x deploy.sh",
                                "isCorrect": false
                            },
                            {
                                "text": "chmod o+x deploy.sh",
                                "isCorrect": false
                            },
                            {
                                "text": "chmod u-x deploy.sh",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um diretório tem permissão r-- para o seu usuário: leitura, mas sem execução. O que você consegue fazer nele?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Listar os nomes, mas não acessar os arquivos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Entrar no diretório e abrir os arquivos que quiser.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar e remover arquivos no diretório.",
                                "isCorrect": false
                            },
                            {
                                "text": "Renomear os arquivos que já existem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você aplicou chmod 640 em um arquivo de configuração. Como ficam as permissões para dono, grupo e outros?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Dono lê e escreve, grupo só lê, outros nada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Dono lê, grupo escreve, outros apenas leem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dono e grupo leem e escrevem, e outros só leem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Todos leem, mas só o dono escreve nele.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Usuários e grupos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Todo arquivo tem um dono e um grupo\n\nAlém das permissões rwx, todo arquivo guarda duas informações de posse: qual **usuário** é o dono e qual **grupo** está associado a ele. Você vê os dois na saída de ls -l, logo depois das permissões: a primeira coluna de nome é o dono, a segunda é o grupo.\n\nÉ essa dupla que dá sentido ao modelo rwx. As permissões do bloco dono valem para o usuário dono, e as do bloco grupo valem para quem pertence ao grupo do arquivo."
                    },
                    {
                        "type": "text",
                        "value": "## chown e chgrp\n\nDois comandos mudam a posse de um arquivo:\n\n- **chown** troca o dono. Na forma dono:grupo, muda o dono e o grupo de uma vez só.\n- **chgrp** troca apenas o grupo.\n\nOs dois aceitam a opção -R para aplicar de forma recursiva a um diretório inteiro e a tudo que está dentro dele. Mudar a posse costuma exigir privilégio de root."
                    },
                    {
                        "type": "code",
                        "value": "$ chown deploy app.log          # muda o dono para deploy\n$ chown deploy:devops app.log   # muda dono e grupo de uma vez\n$ chgrp devops app.log          # muda apenas o grupo\n$ chown -R deploy:devops /var/www   # recursivo no diretório"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\", \"O que faz\"], [\"useradd\", \"Cria um novo usuário\"], [\"usermod\", \"Altera um usuário, por exemplo os grupos dele\"], [\"groupadd\", \"Cria um novo grupo\"], [\"groups\", \"Mostra a quais grupos um usuário pertence\"], [\"id\", \"Mostra UID, GID e os grupos do usuário\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A permissão efetiva depende do grupo\n\nQuando você tenta acessar um arquivo, o Linux não soma as permissões: ele escolhe um único bloco e para por ali. A ordem é:\n\n- Se você é o dono do arquivo, valem as permissões do dono.\n- Senão, se você pertence ao grupo do arquivo, valem as do grupo.\n- Senão, valem as de outros.\n\nPor isso o grupo importa tanto. Colocar um usuário no grupo certo, com usermod -aG, libera o acesso aos arquivos daquele grupo. O -a é essencial: sem ele, o usermod substitui a lista de grupos em vez de acrescentar."
                    },
                    {
                        "type": "quote",
                        "value": "O Linux aplica um único bloco de permissão, nesta ordem: dono, senão grupo, senão outros. Nunca os três somados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a função do comando chgrp aplicado a um arquivo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Mudar o grupo dono do arquivo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Mudar o usuário dono do arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mudar as permissões rwx do arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um novo grupo no sistema.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa transferir a propriedade do arquivo app.log para o usuário deploy. Qual comando faz isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "chown deploy app.log",
                                "isCorrect": true
                            },
                            {
                                "text": "chgrp deploy app.log",
                                "isCorrect": false
                            },
                            {
                                "text": "chmod deploy app.log",
                                "isCorrect": false
                            },
                            {
                                "text": "groups deploy app.log",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para dar à usuária maria acesso ao grupo docker sem remover os grupos que ela já tem, qual comando é o correto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "usermod -aG docker maria",
                                "isCorrect": true
                            },
                            {
                                "text": "usermod --groups docker maria",
                                "isCorrect": false
                            },
                            {
                                "text": "groupadd docker maria",
                                "isCorrect": false
                            },
                            {
                                "text": "chgrp docker maria",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O arquivo relatorio.txt pertence à usuária ana e ao grupo devs, com permissões rw-r-----. O usuário bob não é ana, mas está no grupo devs. O que bob pode fazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Apenas ler o arquivo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ler e escrever no arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada, nem sequer ler.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apagar e recriar o arquivo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um administrador rodou usermod -G docker joao, esquecendo o -a. Qual é a consequência provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "João perde os outros grupos e fica só no docker.",
                                "isCorrect": true
                            },
                            {
                                "text": "João entra no docker sem perder os grupos atuais.",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando falha, pois o -a é sempre exigido.",
                                "isCorrect": false
                            },
                            {
                                "text": "João passa a ser dono dos arquivos do docker.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "sudo e privilégio",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## root, o superusuário\n\nO root é a conta administrativa do Linux, identificada pelo UID 0. Ele passa por cima das permissões: pode ler, escrever e executar qualquer arquivo, instalar programas e mexer no sistema inteiro. É o dono absoluto da máquina.\n\nEsse poder é útil e perigoso ao mesmo tempo. Um comando errado como root pode apagar arquivos essenciais sem pedir confirmação. Por isso a recomendação é não viver logado como root."
                    },
                    {
                        "type": "text",
                        "value": "## sudo e o arquivo sudoers\n\nO sudo permite que um usuário comum rode um comando específico como root, digitando a própria senha. É mais seguro do que virar root: cada uso fica registrado e o acesso se limita ao que foi liberado.\n\nQuem pode usar sudo, e para quais comandos, é definido no arquivo /etc/sudoers. Ele não deve ser editado direto: usa-se o comando visudo, que confere a sintaxe antes de salvar e evita que um erro tranque o acesso administrativo. Em muitas distros, basta estar no grupo sudo ou wheel para ganhar esse direito."
                    },
                    {
                        "type": "code",
                        "value": "$ sudo apt update             # roda o apt como root\n$ sudo systemctl restart nginx\n$ sudo -u deploy ./tarefa.sh  # roda como o usuário deploy\n$ sudo visudo                 # edita o sudoers com verificação"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"su\", \"sudo\"], [\"Senha pedida\", \"A do usuário de destino\", \"A sua própria\"], [\"Escopo\", \"Abre uma sessão inteira\", \"Roda um comando por vez\"], [\"Registro\", \"Menos rastreável\", \"Cada comando fica logado\"], [\"Controle fino\", \"Tudo ou nada\", \"Definido no sudoers\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Princípio do menor privilégio\n\nA ideia é simples: cada um deve ter só o acesso necessário para a tarefa, e nada além. No dia a dia, isso significa trabalhar como usuário comum e recorrer ao sudo apenas nos momentos que exigem privilégio.\n\nManter uma sessão root aberta o tempo todo aumenta o estrago de qualquer erro ou de um comando malicioso. Usar o menor privilégio possível reduz a superfície de risco e deixa um rastro claro de quem fez o quê."
                    },
                    {
                        "type": "quote",
                        "value": "Trabalhe como usuário comum e use sudo só quando precisar: menor privilégio limita o estrago de um erro."
                    }
                ],
                "questions": [
                    {
                        "statement": "No Linux, o que caracteriza o usuário root?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É o superusuário, sem restrições de permissão.",
                                "isCorrect": true
                            },
                            {
                                "text": "É um usuário comum, com acesso bastante limitado.",
                                "isCorrect": false
                            },
                            {
                                "text": "É o grupo dono dos arquivos do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "É a conta usada só para tarefas de rede.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o comando sudo apt update faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Roda o apt update com privilégios de root.",
                                "isCorrect": true
                            },
                            {
                                "text": "Troca a sessão atual para o usuário root.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adiciona o usuário atual ao grupo sudo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lista os comandos permitidos pelo sudoers.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao virar root, qual é a diferença de senha entre usar sudo e usar su?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O sudo pede a sua senha; o su pede a de root.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois pedem a senha do usuário root.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois pedem a sua própria senha.",
                                "isCorrect": false
                            },
                            {
                                "text": "O sudo pede a de root; o su não pede senha alguma.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Seguindo o princípio do menor privilégio, como você deve trabalhar no dia a dia em um servidor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como usuário comum, usando sudo quando precisar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sempre logado como root, por comodidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como root para instalar e comum para todo o resto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desabilitando o sudo e usando apenas o su.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa editar as permissões de sudo de um usuário com segurança, evitando deixar o arquivo com erro de sintaxe. Qual é a forma recomendada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Editar o sudoers com o comando visudo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Abrir o /etc/sudoers direto no editor de texto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Alterar as permissões do arquivo com chmod.",
                                "isCorrect": false
                            },
                            {
                                "text": "Recriar o arquivo sudoers a partir do zero.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Processos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é um processo\n\nUm processo é um programa em execução. Quando você roda um comando, o sistema carrega o programa na memória e cria um processo para ele, com seus próprios dados e estado. O mesmo programa pode ter vários processos rodando ao mesmo tempo.\n\nCada processo recebe um identificador numérico único, o **PID** (Process ID). É por ele que você se refere ao processo para monitorar ou encerrar mais tarde."
                    },
                    {
                        "type": "text",
                        "value": "## PPID e o init, o ancestral de todos\n\nTodo processo é criado por outro processo. Aquele que cria é o **pai**, e o novo é o **filho**. O filho guarda o PID do pai no campo **PPID** (Parent Process ID).\n\nSeguindo essa cadeia para trás, você sempre chega ao processo de PID 1, o **init** (hoje o systemd na maioria das distribuições). Ele é o primeiro processo, iniciado pelo kernel no boot, e o ancestral de todos os demais. Quando um pai morre antes do filho, o init adota o órfão."
                    },
                    {
                        "type": "code",
                        "value": "$ ps aux | head -3\nUSER   PID %CPU %MEM    VSZ   RSS TTY   STAT START  TIME COMMAND\nroot     1  0.0  0.1 168540 11888 ?     Ss   08:00  0:02 /sbin/init\ndeploy 842  1.3  0.7 998200 58000 pts/0 Sl   09:14  0:05 node server.js"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Coluna do ps aux\", \"O que mostra\"], [\"USER\", \"Usuário dono do processo\"], [\"PID\", \"Identificador do processo\"], [\"%CPU / %MEM\", \"Uso de CPU e de memória\"], [\"STAT\", \"Estado, como S dormindo ou R rodando\"], [\"COMMAND\", \"O comando que originou o processo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Listar e monitorar processos\n\nPara ver os processos existem duas abordagens.\n\n- **Foto do momento**: o ps tira um retrato. O ps sozinho mostra os processos do seu terminal; o ps aux mostra todos os processos, de todos os usuários.\n- **Tempo real**: top e htop atualizam a tela sozinhos, mostrando quem consome mais CPU e memória naquele instante. O htop é uma versão mais amigável, com cores e navegação.\n\nProcessos também rodam em primeiro plano (foreground), prendendo o terminal, ou em segundo plano (background), liberando você para continuar trabalhando."
                    },
                    {
                        "type": "quote",
                        "value": "O init tem PID 1: é o primeiro processo do sistema e o ancestral de todos, adotando qualquer processo que fique órfão."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é o PID de um processo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O número que identifica o processo no sistema.",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome do programa que originou o processo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de memória usada por aquele processo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O usuário que iniciou aquele processo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando lista todos os processos em execução na máquina, de todos os usuários?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "ps aux",
                                "isCorrect": true
                            },
                            {
                                "text": "ps",
                                "isCorrect": false
                            },
                            {
                                "text": "jobs",
                                "isCorrect": false
                            },
                            {
                                "text": "kill -l",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual processo tem sempre o PID 1 e é o ancestral de todos os outros no Linux?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O init, hoje o systemd na maioria das distros.",
                                "isCorrect": true
                            },
                            {
                                "text": "O primeiro terminal que o usuário deixa aberto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O processo de rede que sobe no boot.",
                                "isCorrect": false
                            },
                            {
                                "text": "O shell de login da sessão atual.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer acompanhar em tempo real o consumo de CPU e memória dos processos, com a tela se atualizando sozinha. Qual ferramenta usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "top ou htop",
                                "isCorrect": true
                            },
                            {
                                "text": "ps aux uma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "cat do /proc/cpuinfo",
                                "isCorrect": false
                            },
                            {
                                "text": "kill -9 do processo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um processo pai termina antes do filho. O que acontece com o processo filho, agora órfão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "É adotado pelo init (PID 1) como novo pai.",
                                "isCorrect": true
                            },
                            {
                                "text": "É encerrado imediatamente junto com o pai.",
                                "isCorrect": false
                            },
                            {
                                "text": "Segue rodando sem nenhum processo pai associado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Toma o lugar do init e assume o PID 1.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Sinais e controle de processos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Encerrar processos com sinais\n\nVocê não encerra um processo diretamente: você envia um **sinal** a ele, e o comando kill faz isso. Apesar do nome, o kill serve para mandar qualquer sinal, não só para terminar.\n\nOs sinais mais usados no dia a dia:\n\n- **SIGTERM** (15): o padrão do kill. Pede educadamente que o processo termine, e ele ainda pode salvar dados e fechar arquivos antes de sair.\n- **SIGKILL** (9): força o fim na marra. O processo não consegue capturar nem ignorar esse sinal, mas também não tem chance de se limpar.\n- **SIGHUP** (1): originalmente o desligar do terminal. Muitos serviços o usam como pedido para recarregar a configuração."
                    },
                    {
                        "type": "code",
                        "value": "$ kill 842        # envia SIGTERM (padrão) ao PID 842\n$ kill -15 842    # o mesmo, SIGTERM explícito\n$ kill -9 842     # SIGKILL: força o encerramento\n$ kill -HUP 842   # SIGHUP: recarregar a configuração\n$ pkill node      # envia sinal pelo nome do processo"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinal\", \"Número\", \"Para que serve\"], [\"SIGTERM\", \"15\", \"Pede o encerramento (padrão do kill)\"], [\"SIGKILL\", \"9\", \"Força o fim, não pode ser ignorado\"], [\"SIGHUP\", \"1\", \"Recarregar config ou fim do terminal\"], [\"SIGINT\", \"2\", \"Interromper, é o Ctrl+C do teclado\"], [\"SIGTSTP\", \"20\", \"Suspender, é o Ctrl+Z do teclado\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Controle de jobs no shell\n\nO shell deixa você gerenciar comandos como jobs:\n\n- Terminar o comando com **&** já o inicia em segundo plano: ./backup.sh &.\n- **Ctrl+Z** suspende o processo em foreground e o deixa parado.\n- **jobs** lista os jobs do terminal atual, cada um com um número.\n- **fg %1** traz o job 1 de volta para o primeiro plano; **bg %1** o retoma rodando em segundo plano.\n\nPara um processo sobreviver ao fechamento do terminal, use o nohup ao iniciá-lo."
                    },
                    {
                        "type": "text",
                        "value": "## Prioridade com nice e renice\n\nCada processo tem um valor de **niceness**, de -20 a 19, que influencia quanto de CPU ele ganha. O nome ajuda a lembrar: quanto mais gentil (nice) o valor, mais alto o número e menor a prioridade. O padrão é 0.\n\n- **nice** define a niceness ao iniciar um comando: nice -n 10 ./tarefa.sh começa com prioridade baixa.\n- **renice** muda a niceness de um processo que já está rodando: renice 10 -p 842.\n\nSubir a prioridade, com valores negativos, exige root. Um usuário comum só consegue ser mais gentil, ou seja, baixar a prioridade dos próprios processos."
                    },
                    {
                        "type": "quote",
                        "value": "SIGTERM pede o fim e permite a limpeza; SIGKILL (kill -9) força e não pode ser capturado nem ignorado."
                    }
                ],
                "questions": [
                    {
                        "statement": "O comando kill, sem indicar um sinal, envia qual sinal por padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "SIGTERM, que pede o encerramento.",
                                "isCorrect": true
                            },
                            {
                                "text": "SIGKILL, que força o fim imediato do processo.",
                                "isCorrect": false
                            },
                            {
                                "text": "SIGHUP, que manda recarregar a configuração.",
                                "isCorrect": false
                            },
                            {
                                "text": "SIGSTOP, que apenas suspende a execução.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um processo travado ignora o SIGTERM e não encerra. Qual sinal força o fim, sem o processo poder capturá-lo ou bloqueá-lo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SIGKILL, enviado com kill -9.",
                                "isCorrect": true
                            },
                            {
                                "text": "SIGTERM, enviado com kill -15.",
                                "isCorrect": false
                            },
                            {
                                "text": "SIGHUP, enviado com kill -1.",
                                "isCorrect": false
                            },
                            {
                                "text": "SIGINT, enviado com Ctrl+C.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você iniciou um processo demorado em foreground e travou o terminal. Quer mandá-lo para segundo plano sem encerrá-lo. Qual sequência usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ctrl+Z para suspender e depois bg.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ctrl+C para suspender e depois fg.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ctrl+Z para encerrar e depois jobs.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ctrl+C para pausar e depois bg.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o caractere & faz no fim de um comando, como em ./backup.sh &?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Roda o comando em segundo plano (background).",
                                "isCorrect": true
                            },
                            {
                                "text": "Roda o comando com a prioridade mais alta possível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Encerra o comando assim que ele começa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Repete o comando até você cancelar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um processo de backup já em execução está pesando na CPU e você quer reduzir a prioridade dele. Qual comando e sentido de valor usar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "renice com niceness maior, que baixa a prioridade.",
                                "isCorrect": true
                            },
                            {
                                "text": "renice com niceness menor, que baixa a prioridade.",
                                "isCorrect": false
                            },
                            {
                                "text": "nice com niceness negativo, que sobe a prioridade.",
                                "isCorrect": false
                            },
                            {
                                "text": "kill -STOP, que reduz aos poucos a prioridade.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Kernel e chamadas de sistema",
        "aulas": [
            {
                "titulo": "O que o kernel faz",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O kernel, o núcleo do sistema\n\nO kernel é o programa central do sistema operacional. Ele carrega quando a máquina liga e fica na memória o tempo todo, coordenando tudo o que acontece. Quando você abre um editor, salva um arquivo ou dispara um `curl` para uma API, quem de fato conversa com o processador, a memória e o disco é o kernel.\n\nA ideia central é que os seus programas nunca falam direto com o hardware. Eles pedem, e o kernel executa. Isso vale para um script de deploy, um container ou o próprio shell: todos dependem do kernel para rodar. No Linux, esse núcleo é um projeto único, o mesmo código base que roda num notebook, num servidor na nuvem ou num Raspberry Pi. Dá para ver qual versão está ativa na máquina:"
                    },
                    {
                        "type": "code",
                        "value": "$ uname -r\n6.8.0-45-generic"
                    },
                    {
                        "type": "text",
                        "value": "## Dividir a CPU e a memória\n\nUm servidor roda dezenas de processos ao mesmo tempo, mas cada núcleo de CPU só executa um processo por vez. Quem resolve isso é o escalonador (scheduler): ele decide qual processo usa a CPU e por quanto tempo, alternando entre eles muito rápido. Essa troca é tão veloz que passa a impressão de que tudo corre junto. Com vários núcleos existe paralelismo de verdade, mas o escalonador continua sendo quem reparte o tempo entre bem mais processos do que núcleos disponíveis.\n\nA gerência de memória é o outro pilar. Cada processo enxerga um espaço de endereços só seu, a memória virtual, como se tivesse a máquina inteira à disposição. O kernel mapeia esses endereços virtuais para a RAM física em pedaços chamados páginas. Quando a RAM aperta, páginas pouco usadas podem ir para a área de troca (swap) no disco e voltar quando forem necessárias. Esse mesmo mapeamento impede que um processo leia a memória de outro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Subsistema\",\"Do que cuida\",\"No dia a dia\"],[\"Escalonador\",\"Reparte o tempo de CPU entre os processos\",\"Vários serviços no mesmo servidor\"],[\"Gerência de memória\",\"Memória virtual, paginação e swap\",\"Cada processo com seu espaço próprio\"],[\"Sistema de arquivos\",\"Organiza arquivos e diretórios no disco\",\"Ler e gravar em /var/log\"],[\"Drivers e I/O\",\"Fala com discos, rede e outros dispositivos\",\"Enviar um pacote pela placa de rede\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Arquivos, dispositivos e I/O\n\nO kernel também apresenta o disco como uma árvore de arquivos e diretórios. Você grava em `/var/log/app.log` sem saber em qual setor do disco aquilo cai, porque o sistema de arquivos do kernel cuida desse mapeamento. No Linux, formatos diferentes como ext4 e XFS, e até um pen drive, aparecem sob a mesma árvore graças a uma camada do kernel que padroniza o acesso.\n\nPara falar com cada peça de hardware, o kernel usa drivers: trechos de código que conhecem a linguagem de um modelo de disco, de uma placa de rede ou de uma GPU. Toda entrada e saída (I/O) passa por aí. Quando a aplicação lê um arquivo ou envia dados pela rede, ela entrega o pedido ao kernel, que aciona o driver certo e devolve o resultado. É por isso que dizemos que o kernel é o intermediário: ele fica entre os programas e o hardware, traduzindo pedidos em operações concretas."
                    },
                    {
                        "type": "quote",
                        "value": "Nenhum programa comum toca o hardware direto. Ele pede ao kernel, e o kernel é quem fala com a CPU, a memória e o disco."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num servidor com 4 núcleos rodam 200 processos ao mesmo tempo. O que garante que todos avançam, revezando o uso da CPU?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O escalonador de processos",
                                "isCorrect": true
                            },
                            {
                                "text": "O sistema de arquivos do disco",
                                "isCorrect": false
                            },
                            {
                                "text": "O driver de rede",
                                "isCorrect": false
                            },
                            {
                                "text": "O gerenciador de pacotes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação precisa gravar um log em /var/log/app.log. Quem faz a ponte entre esse pedido e o disco físico?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O kernel do sistema operacional",
                                "isCorrect": true
                            },
                            {
                                "text": "O próprio processo, sem intermediários",
                                "isCorrect": false
                            },
                            {
                                "text": "O shell que iniciou a aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "O compilador usado no build",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Cada processo de um servidor enxerga seu próprio espaço de endereços, como se tivesse toda a memória para si. Esse recurso do kernel se chama:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Memória virtual",
                                "isCorrect": true
                            },
                            {
                                "text": "Memória compartilhada",
                                "isCorrect": false
                            },
                            {
                                "text": "Cache de disco",
                                "isCorrect": false
                            },
                            {
                                "text": "Área de swap",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A RAM de um servidor encheu e o kernel moveu páginas pouco usadas para o disco, liberando espaço para o processo ativo. Esse mecanismo é a:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Paginação para o swap",
                                "isCorrect": true
                            },
                            {
                                "text": "Desfragmentação do disco",
                                "isCorrect": false
                            },
                            {
                                "text": "Troca de contexto da CPU",
                                "isCorrect": false
                            },
                            {
                                "text": "Recompilação do kernel",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para o kernel conversar com um modelo específico de placa de rede, ele usa um componente que conhece os detalhes daquele hardware. Como se chama esse componente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Driver",
                                "isCorrect": true
                            },
                            {
                                "text": "Daemon",
                                "isCorrect": false
                            },
                            {
                                "text": "Shell",
                                "isCorrect": false
                            },
                            {
                                "text": "Cron",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "User space x kernel space",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dois mundos com privilégios diferentes\n\nO código que roda numa máquina Linux vive em dois territórios. De um lado, o user space (espaço de usuário): onde ficam os seus programas, o shell, o servidor web, o banco de dados, os containers. Do outro, o kernel space (espaço de kernel): o território do próprio kernel e dos drivers.\n\nA diferença não é só de organização, é de privilégio. Um programa em user space roda restrito: não acessa o hardware direto, não lê a memória de outro processo e não executa instruções sensíveis do processador. O kernel space tem acesso total: mexe na memória física, fala com os dispositivos e comanda a CPU. Quando um programa precisa de algo desse nível, ele pede ao kernel em vez de fazer por conta própria."
                    },
                    {
                        "type": "text",
                        "value": "## Quem faz valer a regra é a CPU\n\nEssa separação não depende da boa vontade do programa: o próprio processador a impõe. A CPU tem modos de privilégio. No modo usuário, um conjunto de instruções fica bloqueado e o acesso à memória se limita ao que pertence àquele processo. No modo kernel (também chamado de supervisor), tudo é permitido. Nos processadores x86 esses níveis aparecem como anéis (rings): o kernel roda no anel 0 e os programas comuns no anel 3.\n\nSe um programa em modo usuário tenta executar uma instrução privilegiada ou tocar um endereço que não é dele, a CPU não obedece: ela dispara uma exceção e devolve o controle ao kernel, que decide o que fazer, quase sempre encerrando o processo infrator. Sair do modo usuário para o modo kernel só acontece por caminhos controlados, como uma chamada de sistema ou uma interrupção de hardware."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"User space\",\"Kernel space\"],[\"Quem roda ali\",\"Seus programas, shell e serviços\",\"O kernel e os drivers\"],[\"Acesso ao hardware\",\"Indireto, pedindo ao kernel\",\"Direto e total\"],[\"Modo da CPU (x86)\",\"Modo usuário, anel 3\",\"Modo kernel, anel 0\"],[\"Efeito de uma falha grave\",\"Encerra só aquele processo\",\"Pode derrubar o sistema todo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que essa parede protege o sistema\n\nIsolar os dois mundos evita que um programa qualquer comprometa a máquina inteira. O isolamento vale também entre processos: uma aplicação não lê a memória de outra nem espia dados do kernel, porque esses endereços ficam fora do alcance dela em modo usuário. É essa fronteira que permite rodar cargas de trabalho diferentes no mesmo servidor com alguma confiança.\n\nQuando um serviço tem um bug e tenta escrever num endereço inválido, a CPU barra o acesso e o kernel encerra apenas aquele processo, quase sempre com a mensagem `Segmentation fault`. Os outros serviços seguem no ar e o sistema continua de pé. Para afetar tudo, o problema teria que estar no próprio kernel space, que é bem menor e mais controlado do que o conjunto de aplicações."
                    },
                    {
                        "type": "code",
                        "value": "$ ./ponteiro-invalido\nSegmentation fault (core dumped)"
                    },
                    {
                        "type": "quote",
                        "value": "A barreira entre user space e kernel space é imposta pela CPU, não pelo programa. Por isso um processo com bug cai sozinho, sem levar o sistema junto."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um servidor web roda como um processo comum, sem privilégio de kernel. Em qual território ele está?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em user space",
                                "isCorrect": true
                            },
                            {
                                "text": "Em kernel space",
                                "isCorrect": false
                            },
                            {
                                "text": "No modo supervisor",
                                "isCorrect": false
                            },
                            {
                                "text": "No anel 0 da CPU",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um processo em modo usuário tenta executar uma instrução privilegiada do processador. O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A CPU bloqueia e aciona o kernel",
                                "isCorrect": true
                            },
                            {
                                "text": "A CPU executa a instrução sem restrição",
                                "isCorrect": false
                            },
                            {
                                "text": "O processo passa a rodar em modo kernel",
                                "isCorrect": false
                            },
                            {
                                "text": "O acesso ao hardware é liberado na hora",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação com bug tenta acessar um endereço de memória que não pertence a ela. Qual é o resultado mais comum?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O processo é encerrado com Segmentation fault",
                                "isCorrect": true
                            },
                            {
                                "text": "O kernel trava e o sistema precisa reiniciar",
                                "isCorrect": false
                            },
                            {
                                "text": "Os outros processos do servidor perdem a memória",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor inteiro reinicia automaticamente na hora",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Nos processadores x86, em qual anel de privilégio o código do kernel executa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Anel 0",
                                "isCorrect": true
                            },
                            {
                                "text": "Anel 3",
                                "isCorrect": false
                            },
                            {
                                "text": "Anel 1",
                                "isCorrect": false
                            },
                            {
                                "text": "Anel 2",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que rodar vários serviços no mesmo servidor é relativamente seguro, mesmo que um deles tenha uma falha grave?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cada processo é isolado e não vê a memória de outro",
                                "isCorrect": true
                            },
                            {
                                "text": "Os serviços compartilham memória e se corrigem entre si",
                                "isCorrect": false
                            },
                            {
                                "text": "O kernel move cada serviço para um disco separado",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada serviço roda em anel 0 com acesso total",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Chamadas de sistema (syscalls)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A fronteira entre o programa e o kernel\n\nUm programa em user space não pode abrir um arquivo, ler do disco ou criar outro processo por conta própria. Tudo isso mora no kernel space. Então, quando precisa de uma dessas operações, o programa faz uma chamada de sistema, ou syscall: um pedido formal ao kernel para executar algo que ele não tem permissão de fazer sozinho.\n\nA syscall é a porta de entrada controlada do kernel. O programa coloca o número da syscall e os argumentos em registradores do processador e executa uma instrução especial que passa a CPU para o modo kernel. O kernel confere o pedido, faz o trabalho e devolve um valor, voltando a CPU ao modo usuário. Cada operação de I/O, cada processo criado, cada arquivo aberto passa por esse caminho."
                    },
                    {
                        "type": "text",
                        "value": "## As syscalls essenciais\n\nBoa parte do que um programa faz se resume a um punhado de chamadas. Para arquivos, o ciclo básico é `open` para abrir ou criar e receber um descritor, `read` para ler, `write` para gravar e `close` para liberar o descritor no fim. Um descritor de arquivo é um número inteiro pequeno que o kernel devolve e o programa usa para se referir àquele arquivo aberto nas chamadas seguintes.\n\nPara processos, o padrão clássico do Unix são três chamadas. `fork` cria um novo processo duplicando o atual, gerando um processo filho. `exec` substitui o programa em execução por outro, sem criar um processo novo. E `wait` faz o processo pai esperar o filho terminar e recolher o resultado. É assim que o shell roda um comando: ele faz `fork`, o filho chama `exec` para virar o programa pedido, e o pai fica no `wait` até ele acabar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Syscall\",\"O que faz\",\"Retorno típico\"],[\"open\",\"Abre ou cria um arquivo\",\"Um descritor, ou -1 no erro\"],[\"read\",\"Lê bytes de um descritor\",\"Quantos bytes leu, 0 no fim do arquivo\"],[\"write\",\"Grava bytes num descritor\",\"Quantos bytes gravou, ou -1\"],[\"close\",\"Fecha um descritor\",\"0 no sucesso, -1 no erro\"],[\"fork\",\"Cria um processo filho\",\"PID do filho ao pai, 0 ao filho\"],[\"exec\",\"Troca o programa do processo atual\",\"Não retorna quando dá certo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A libc facilita a chamada\n\nNa prática, quase ninguém dispara a instrução de syscall na mão. Quem faz esse trabalho é a biblioteca C, a libc (no Linux, em geral a glibc). Ela oferece funções como `open()`, `read()` e `write()` que arrumam os argumentos, executam a syscall correta e ainda tratam o retorno. Você chama uma função C comum e a libc cuida da travessia para o kernel.\n\nQuando algo dá errado, a maioria das syscalls devolve -1 e coloca o motivo numa variável chamada `errno`, com códigos como `ENOENT` (arquivo não existe) ou `EACCES` (permissão negada). A libc traduz esses códigos em mensagens legíveis. Vale lembrar que nem toda função é uma syscall: `printf`, por exemplo, é da libc e acaba chamando `write` por baixo; já `malloc` administra memória em user space e só recorre ao kernel de vez em quando."
                    },
                    {
                        "type": "code",
                        "value": "int fd = open(\"/etc/hosts\", O_RDONLY);   // abre e recebe um descritor\nchar buf[256];\nssize_t n = read(fd, buf, sizeof(buf));  // le ate 256 bytes para o buffer\nwrite(1, buf, n);                        // grava no descritor 1 (saida padrao)\nclose(fd);                               // libera o descritor"
                    },
                    {
                        "type": "quote",
                        "value": "A syscall é a única porta pela qual um programa entra no kernel. Abrir arquivo, ler, gravar, criar processo: nada disso acontece sem passar por ela."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um programa em Python precisa abrir e ler um arquivo de configuração no disco. Para chegar até esse arquivo, o que ele necessariamente usa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma chamada de sistema (syscall)",
                                "isCorrect": true
                            },
                            {
                                "text": "Um acesso direto ao controlador do disco",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma instrução privilegiada em modo usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "Um driver carregado pelo próprio programa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No ciclo básico de manipulação de arquivos, qual syscall devolve o descritor usado pelas chamadas seguintes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "open",
                                "isCorrect": true
                            },
                            {
                                "text": "read",
                                "isCorrect": false
                            },
                            {
                                "text": "write",
                                "isCorrect": false
                            },
                            {
                                "text": "close",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O shell precisa executar o comando ls. Ele duplica a si mesmo e, no processo filho, troca a imagem em execução pelo programa ls. Quais syscalls representam esses dois passos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "fork e exec",
                                "isCorrect": true
                            },
                            {
                                "text": "open e read",
                                "isCorrect": false
                            },
                            {
                                "text": "read e write",
                                "isCorrect": false
                            },
                            {
                                "text": "wait e close",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma syscall open retornou -1 e definiu errno como EACCES. O que isso indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Permissão negada para o arquivo",
                                "isCorrect": true
                            },
                            {
                                "text": "O arquivo foi aberto com sucesso",
                                "isCorrect": false
                            },
                            {
                                "text": "O disco está sem espaço livre",
                                "isCorrect": false
                            },
                            {
                                "text": "O descritor foi fechado antes da hora",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor afirma que a função printf da linguagem C é uma chamada de sistema. Qual correção está certa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "printf é da libc e chama a syscall write",
                                "isCorrect": true
                            },
                            {
                                "text": "printf é uma syscall que grava direto no terminal",
                                "isCorrect": false
                            },
                            {
                                "text": "printf roda em modo kernel para imprimir o texto",
                                "isCorrect": false
                            },
                            {
                                "text": "printf substitui a syscall write dentro do kernel",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Observar syscalls com strace",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Ver o programa conversando com o kernel\n\nJá sabemos que todo acesso a arquivo, rede ou processo passa por uma syscall. O `strace` torna esse tráfego visível: ele roda um programa e imprime, linha a linha, cada chamada de sistema que o programa faz, com os argumentos e o valor de retorno. É como colocar um grampo na fronteira entre o user space e o kernel.\n\nIsso é ouro para depurar. Quando um serviço falha sem mensagem clara, o strace costuma apontar exatamente onde ele tropeçou: qual arquivo tentou abrir, qual configuração procurou, em que ponto o kernel respondeu com erro. Você usa `strace ./programa` para iniciar e acompanhar um comando, ou `strace -p PID` para se conectar a um processo que já está rodando."
                    },
                    {
                        "type": "code",
                        "value": "$ strace cat /etc/hostname\nexecve(\"/usr/bin/cat\", [\"cat\", \"/etc/hostname\"], ...) = 0\nopenat(AT_FDCWD, \"/etc/hostname\", O_RDONLY) = 3\nread(3, \"servidor-app\\n\", 131072)       = 13\nwrite(1, \"servidor-app\\n\", 13)          = 13\nread(3, \"\", 131072)                     = 0\nclose(3)                                = 0"
                    },
                    {
                        "type": "text",
                        "value": "## Como ler a saída\n\nCada linha segue sempre o mesmo formato: o nome da syscall, os argumentos entre parênteses e, depois do sinal de igual, o valor de retorno. No exemplo, `openat(...) = 3` quer dizer que o arquivo abriu e recebeu o descritor 3. O `read(3, ..., 131072) = 13` leu 13 bytes daquele descritor 3. O `write(1, ..., 13) = 13` gravou esses 13 bytes no descritor 1, que é a saída padrão. O segundo `read` devolveu 0, sinal de fim do arquivo, e então veio o `close`.\n\nO retorno é a parte mais importante na hora de depurar. Um número não negativo quase sempre significa sucesso, seja um descritor ou uma contagem de bytes. Um `-1` significa erro, e o strace ainda escreve ao lado o código, como `-1 ENOENT` ou `-1 EACCES`, com a explicação entre parênteses."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Forma de uso\",\"Para que serve\"],[\"strace ./app\",\"Inicia o programa e mostra as syscalls\"],[\"strace -p PID\",\"Conecta a um processo que já roda\"],[\"strace -f\",\"Segue os processos filhos criados com fork\"],[\"strace -e trace=open,read\",\"Filtra só as syscalls escolhidas\"],[\"strace -c\",\"Resume quantas vezes cada syscall foi chamada\"],[\"strace -o arquivo.txt\",\"Salva a saída num arquivo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Achar o erro e o primo ltrace\n\nImagine um serviço que não sobe e não explica o motivo. Rodando ele sob strace, a linha do erro entrega o problema. Se aparece `openat(AT_FDCWD, \"/etc/app/config.yml\", O_RDONLY) = -1 ENOENT (No such file or directory)`, o arquivo de configuração não está onde o programa procura. Se aparece `-1 EACCES (Permission denied)`, o arquivo existe, mas o usuário do processo não tem permissão de leitura. Em vez de adivinhar, você lê o motivo direto do kernel.\n\nExiste ainda o `ltrace`, um primo do strace. Em vez das chamadas ao kernel, ele mostra as chamadas a funções de biblioteca, como as da libc. Onde o strace exibe a syscall `write`, o ltrace exibe a função `printf` que a originou. Um observa a fronteira com o kernel; o outro, o uso das bibliotecas."
                    },
                    {
                        "type": "quote",
                        "value": "O strace não adivinha, ele mostra. A syscall que retornou -1 aponta o arquivo, a permissão ou o recurso que faltou."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o strace mostra quando você roda um programa sob ele?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "As syscalls que o programa executa",
                                "isCorrect": true
                            },
                            {
                                "text": "As linhas de código-fonte do programa",
                                "isCorrect": false
                            },
                            {
                                "text": "Os pacotes instalados na máquina",
                                "isCorrect": false
                            },
                            {
                                "text": "O consumo de energia do processador",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na saída do strace aparece openat(AT_FDCWD, \"/etc/app.conf\", O_RDONLY) = 3. O que significa o número 3?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O descritor de arquivo aberto",
                                "isCorrect": true
                            },
                            {
                                "text": "O número de bytes lidos do arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de tentativas de abertura",
                                "isCorrect": false
                            },
                            {
                                "text": "O código de erro retornado pelo kernel",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço não sobe. No strace aparece openat(..., \"/etc/app/config.yml\", O_RDONLY) = -1 ENOENT. Qual é a causa provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O arquivo de configuração não existe ali",
                                "isCorrect": true
                            },
                            {
                                "text": "A permissão do arquivo está negada para o usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "O disco encheu e não há espaço livre",
                                "isCorrect": false
                            },
                            {
                                "text": "O processo ficou sem descritores disponíveis",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa investigar um processo que já está em execução, sem reiniciá-lo. Qual forma do strace usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "strace -p PID",
                                "isCorrect": true
                            },
                            {
                                "text": "strace -c PID",
                                "isCorrect": false
                            },
                            {
                                "text": "strace -o PID",
                                "isCorrect": false
                            },
                            {
                                "text": "strace -f PID",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer ver as funções de biblioteca que um programa chama, como as da libc, e não as chamadas ao kernel. Qual ferramenta usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "ltrace",
                                "isCorrect": true
                            },
                            {
                                "text": "strace",
                                "isCorrect": false
                            },
                            {
                                "text": "dmesg",
                                "isCorrect": false
                            },
                            {
                                "text": "sysctl",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "/proc e /sys",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O kernel exposto como arquivos\n\nO Linux segue a ideia de que quase tudo pode ser tratado como arquivo, e isso vale até para o estado interno do kernel. Os diretórios `/proc` e `/sys` são sistemas de arquivos virtuais: não ocupam espaço no disco e não guardam arquivos de verdade. O kernel os gera na memória, no momento em que você lê, e devolve a informação como se fosse o conteúdo de um arquivo.\n\nPor isso um `cat /proc/meminfo` não abre nada gravado em lugar nenhum: ele pede ao kernel os números da memória naquele instante. Ferramentas como `top`, `ps` e `free` fazem exatamente isso por baixo, lendo desses diretórios em vez de inventar os dados. Reparar que os arquivos de `/proc` costumam ter tamanho zero ajuda a lembrar que o conteúdo é gerado sob demanda."
                    },
                    {
                        "type": "text",
                        "value": "## /proc: por processo e do sistema\n\nO `/proc` tem duas faces. Uma é por processo: para cada processo em execução existe um diretório com o número do PID, como `/proc/1420`. Lá dentro ficam detalhes daquele processo, como `status` (estado, memória e usuário), `cmdline` (o comando que o iniciou), `environ` (variáveis de ambiente) e `fd` (os descritores de arquivo abertos). O atalho `/proc/self` aponta sempre para o processo que está lendo.\n\nA outra face é do sistema inteiro. Arquivos como `/proc/cpuinfo` descrevem os núcleos da CPU, `/proc/meminfo` traz o uso de memória, `/proc/loadavg` mostra a carga média e `/proc/mounts` lista os sistemas de arquivos montados. É a forma mais direta de responder perguntas como quantos núcleos a máquina tem ou quanta memória sobrou, sem depender de nenhum programa extra."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Caminho\",\"O que expõe\"],[\"/proc/<pid>/status\",\"Estado, memória e usuário de um processo\"],[\"/proc/<pid>/fd\",\"Descritores de arquivo abertos pelo processo\"],[\"/proc/cpuinfo\",\"Detalhes de cada núcleo da CPU\"],[\"/proc/meminfo\",\"Uso de memória do sistema\"],[\"/proc/loadavg\",\"Carga média de trabalho recente\"],[\"/proc/sys\",\"Parâmetros ajustáveis do kernel\"]]"
                    },
                    {
                        "type": "code",
                        "value": "$ cat /proc/loadavg\n0.42 0.35 0.30 1/523 18042\n\n$ grep -c ^processor /proc/cpuinfo   # conta os nucleos logicos\n8\n\n$ ls /proc/self/fd                   # 0=entrada, 1=saida, 2=erro; 3 e o ls lendo o diretorio\n0  1  2  3"
                    },
                    {
                        "type": "text",
                        "value": "## Ajustar o kernel por /proc/sys\n\nUma parte especial é o `/proc/sys`: ali os arquivos não só mostram como também controlam o comportamento do kernel. Escrever num deles muda um parâmetro na hora, sem reiniciar. Gravar `1` em `/proc/sys/net/ipv4/ip_forward`, por exemplo, liga o encaminhamento de pacotes, passo comum ao configurar um roteador ou a rede de um host de containers.\n\nMexer nesses arquivos direto com `echo` funciona, mas o jeito recomendado é o comando `sysctl`. Ele lê e escreve os mesmos parâmetros usando um nome com pontos que espelha o caminho: `net.ipv4.ip_forward` corresponde a `/proc/sys/net/ipv4/ip_forward`. Assim, `sysctl vm.swappiness` mostra o valor atual e `sysctl -w vm.swappiness=10` ajusta na hora. Como essas mudanças se perdem no reboot, para torná-las permanentes coloca-se a linha em `/etc/sysctl.conf` ou num arquivo dentro de `/etc/sysctl.d/`."
                    },
                    {
                        "type": "quote",
                        "value": "/proc e /sys não são arquivos no disco: são o kernel se mostrando como texto. Ler ali é perguntar ao kernel; escrever em /proc/sys é mudá-lo em tempo real."
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao rodar cat /proc/meminfo, de onde vêm os números exibidos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O kernel os gera no momento da leitura",
                                "isCorrect": true
                            },
                            {
                                "text": "Estão gravados num arquivo fixo no disco",
                                "isCorrect": false
                            },
                            {
                                "text": "Vêm de um banco de dados do sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "São calculados pelo próprio comando cat",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer descobrir quantos núcleos de CPU o servidor tem, sem instalar nada. Qual arquivo virtual consultar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "/proc/cpuinfo",
                                "isCorrect": true
                            },
                            {
                                "text": "/proc/meminfo",
                                "isCorrect": false
                            },
                            {
                                "text": "/proc/loadavg",
                                "isCorrect": false
                            },
                            {
                                "text": "/proc/mounts",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de /proc, cada processo em execução tem um diretório próprio. Ele é identificado por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pelo PID do processo",
                                "isCorrect": true
                            },
                            {
                                "text": "Pelo nome do usuário dono",
                                "isCorrect": false
                            },
                            {
                                "text": "Pela porta de rede usada",
                                "isCorrect": false
                            },
                            {
                                "text": "Pelo caminho do executável",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa ligar o encaminhamento de pacotes gravando 1 em net.ipv4.ip_forward, de forma controlada. Qual comando faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "sysctl -w net.ipv4.ip_forward=1",
                                "isCorrect": true
                            },
                            {
                                "text": "cat /proc/sys/net/ipv4/ip_forward",
                                "isCorrect": false
                            },
                            {
                                "text": "sysctl net.ipv4.ip_forward",
                                "isCorrect": false
                            },
                            {
                                "text": "modprobe net.ipv4.ip_forward",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma mudança feita com sysctl -w vm.swappiness=10 desaparece depois que o servidor reinicia. Como torná-la permanente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Colocar a linha em /etc/sysctl.d/",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodar o mesmo comando como root",
                                "isCorrect": false
                            },
                            {
                                "text": "Gravar o valor duas vezes seguidas",
                                "isCorrect": false
                            },
                            {
                                "text": "Reiniciar o servidor logo em seguida",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Bash scripting",
        "aulas": [
            {
                "titulo": "Um script Bash",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é um script Bash\n\nUm script Bash é um arquivo de texto com uma sequência de comandos que o shell executa de cima para baixo, como se você os tivesse digitado um a um no terminal. Em vez de repetir a mesma sequência toda vez, você a guarda em um arquivo e roda quando precisar.\n\nPara quem trabalha com DevOps, isso é o pão de cada dia: automatizar deploy, backup, checagem de serviços e limpeza de arquivos. O mesmo script roda igual na sua máquina, no servidor e dentro de um container."
                    },
                    {
                        "type": "text",
                        "value": "## A primeira linha: o shebang\n\nA primeira linha de um script costuma ser o **shebang**: os caracteres `#!` seguidos do caminho do interpretador.\n\n```\n#!/bin/bash\n```\n\nEssa linha diz ao sistema qual programa deve interpretar o arquivo. Com `#!/bin/bash`, o kernel usa o Bash. Se você omitir o shebang, o sistema usa o shell padrão, que nem sempre é o Bash e pode não entender toda a sintaxe. O `#!` precisa ficar na primeira linha, logo no começo, sem espaço antes."
                    },
                    {
                        "type": "code",
                        "value": "#!/bin/bash\n\n# Isto é um comentário: o Bash ignora a linha\necho \"Olá, mundo\"\necho \"Meu primeiro script rodou\""
                    },
                    {
                        "type": "text",
                        "value": "## Tornar executável e rodar\n\nRecém-criado, o arquivo ainda não tem permissão de execução. Você concede essa permissão com `chmod +x` e depois roda com `./`:\n\n```\nchmod +x script.sh\n./script.sh\n```\n\nO `./` na frente indica que o script está no diretório atual. Sem ele, o shell procura o comando só nas pastas do `PATH` e não encontra o arquivo. Uma alternativa que dispensa o `chmod` é chamar o interpretador direto com `bash script.sh`. Nesse caso, o shebang é ignorado, porque você já escolheu o Bash na mão."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Passo\", \"Comando\", \"O que faz\"], [\"Escrever\", \"nano script.sh\", \"Abre um editor para criar o script\"], [\"Permissão\", \"chmod +x script.sh\", \"Dá ao arquivo o direito de executar\"], [\"Rodar\", \"./script.sh\", \"Executa o script do diretório atual\"], [\"Sem chmod\", \"bash script.sh\", \"Roda via interpretador, ignora o shebang\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O shebang #!/bin/bash na primeira linha define o interpretador. Depois de chmod +x, o script roda com ./script.sh."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a linha #!/bin/bash faz na primeira linha de um script?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Diz qual interpretador executa o script",
                                "isCorrect": true
                            },
                            {
                                "text": "Imprime a versão do Bash ao iniciar",
                                "isCorrect": false
                            },
                            {
                                "text": "Torna o arquivo executável de imediato",
                                "isCorrect": false
                            },
                            {
                                "text": "É um comentário comum, ignorado pelo shell",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando dá permissão de execução ao arquivo script.sh?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "chmod +x script.sh",
                                "isCorrect": true
                            },
                            {
                                "text": "chmod +r script.sh",
                                "isCorrect": false
                            },
                            {
                                "text": "chexec script.sh",
                                "isCorrect": false
                            },
                            {
                                "text": "exec +x script.sh",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você criou deploy.sh no diretório atual e digitou só 'deploy.sh'. Aparece 'command not found'. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Falta o ./ na frente, o shell só olha o PATH",
                                "isCorrect": true
                            },
                            {
                                "text": "Arquivos de script não podem terminar em .sh",
                                "isCorrect": false
                            },
                            {
                                "text": "O script precisa estar em /usr/bin para rodar",
                                "isCorrect": false
                            },
                            {
                                "text": "O Bash não roda arquivos criados no mesmo dia",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como se escreve um comentário em uma linha de um script Bash?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Começando a linha com #",
                                "isCorrect": true
                            },
                            {
                                "text": "Começando a linha com //",
                                "isCorrect": false
                            },
                            {
                                "text": "Envolvendo o texto em /* */",
                                "isCorrect": false
                            },
                            {
                                "text": "Começando a linha com --",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença entre rodar ./script.sh e bash script.sh?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "bash script.sh ignora o shebang e usa o Bash",
                                "isCorrect": true
                            },
                            {
                                "text": "Não há diferença, ambos exigem chmod +x antes",
                                "isCorrect": false
                            },
                            {
                                "text": "./script.sh sempre roda mais rápido que o outro",
                                "isCorrect": false
                            },
                            {
                                "text": "bash script.sh não funciona com comentários no arquivo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Variáveis e argumentos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Variáveis no Bash\n\nUma variável guarda um valor para você reusar depois. No Bash, defina com `nome=valor`, **sem espaços** ao redor do `=`:\n\n```\nnome=\"Ana\"\nporta=8080\n```\n\nEscrever `nome = \"Ana\"` não funciona: com os espaços, o Bash trata `nome` como um comando. Para ler o valor, coloque `$` na frente, como em `$nome`. Sempre que o valor puder conter espaços, proteja com aspas duplas: `echo \"$nome\"`."
                    },
                    {
                        "type": "text",
                        "value": "## Argumentos do script\n\nQuando você roda `./backup.sh /dados /destino`, o script recebe esses valores como argumentos posicionais:\n\n- `$1`, `$2`, `$3`: cada argumento, na ordem em que veio.\n- `$0`: o nome do próprio script.\n- `$@`: todos os argumentos, um a um.\n- `$#`: a quantidade de argumentos.\n\nAssim o mesmo script serve para entradas diferentes, sem valores fixos escondidos no meio do código."
                    },
                    {
                        "type": "code",
                        "value": "#!/bin/bash\n# Uso: ./saudacao.sh NOME\n\nnome=\"$1\"\necho \"Olá, $nome\"\necho \"Você passou $# argumento(s)\""
                    },
                    {
                        "type": "text",
                        "value": "## Ambiente, locais e substituição de comando\n\nUma variável comum vale só dentro do script. Para um processo filho também enxergá-la, exporte com `export`:\n\n```\nexport API_URL=\"https://exemplo.dev\"\n```\n\nVariáveis de ambiente como `HOME`, `USER` e `PATH` já vêm do sistema, e por convenção usam MAIÚSCULAS. Para guardar a saída de um comando numa variável, use a substituição de comando com `$( )`:\n\n```\nhoje=$(date +%F)\ntotal=$(ls | wc -l)\necho \"Hoje é $hoje e há $total itens aqui\"\n```"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Símbolo\", \"Representa\", \"Exemplo\"], [\"$1\", \"Primeiro argumento\", \"/dados\"], [\"$@\", \"Todos os argumentos\", \"/dados /destino\"], [\"$#\", \"Quantidade de argumentos\", \"2\"], [\"$0\", \"Nome do script\", \"./backup.sh\"], [\"$(cmd)\", \"Saída de um comando\", \"$(date +%F)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Defina variáveis com nome=valor, sem espaços, e leia com \"$nome\" entre aspas. Os argumentos chegam em $1, $2, $@ e $#."
                    }
                ],
                "questions": [
                    {
                        "statement": "Como se define uma variável chamada porta com o valor 8080?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "porta=8080",
                                "isCorrect": true
                            },
                            {
                                "text": "porta = 8080",
                                "isCorrect": false
                            },
                            {
                                "text": "$porta=8080",
                                "isCorrect": false
                            },
                            {
                                "text": "set porta=8080",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro do script, como você lê o valor guardado na variável nome?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "$nome",
                                "isCorrect": true
                            },
                            {
                                "text": "nome",
                                "isCorrect": false
                            },
                            {
                                "text": "&nome",
                                "isCorrect": false
                            },
                            {
                                "text": "val(nome)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No comando ./deploy.sh app1 app2 app3, quanto vale $# dentro do script?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "3",
                                "isCorrect": true
                            },
                            {
                                "text": "app1",
                                "isCorrect": false
                            },
                            {
                                "text": "4, contando também o nome do script",
                                "isCorrect": false
                            },
                            {
                                "text": "app1 app2 app3",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como guardar a data de hoje, saída de date +%F, na variável hoje?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "hoje=$(date +%F)",
                                "isCorrect": true
                            },
                            {
                                "text": "hoje=date +%F",
                                "isCorrect": false
                            },
                            {
                                "text": "$hoje = date +%F",
                                "isCorrect": false
                            },
                            {
                                "text": "hoje=$[date +%F]",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve o export em export API_URL=... dentro de um script?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Deixa a variável visível a processos filhos",
                                "isCorrect": true
                            },
                            {
                                "text": "Salva a variável de forma permanente no disco",
                                "isCorrect": false
                            },
                            {
                                "text": "Impede que a variável seja alterada mais tarde",
                                "isCorrect": false
                            },
                            {
                                "text": "Converte o valor guardado para número inteiro",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Condicionais",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tomando decisões com if\n\nUm condicional executa um bloco só quando a condição é verdadeira. A estrutura básica:\n\n```\nif CONDICAO; then\n    comandos\nelif OUTRA; then\n    comandos\nelse\n    comandos\nfi\n```\n\nOs blocos `elif` (senão, se) e `else` são opcionais. O condicional fecha com `fi`, que é `if` escrito de trás para frente. O `then` pode vir na mesma linha, após `;`, ou na linha seguinte."
                    },
                    {
                        "type": "code",
                        "value": "#!/bin/bash\nidade=\"$1\"\n\nif [ \"$idade\" -ge 18 ]; then\n    echo \"maior de idade\"\nelse\n    echo \"menor de idade\"\nfi"
                    },
                    {
                        "type": "text",
                        "value": "## Os testes [ ] e [[ ]]\n\nA condição costuma ser um teste entre colchetes, e há duas formas:\n\n- `[ ]` é o comando `test` clássico, presente em qualquer shell POSIX.\n- `[[ ]]` é uma versão do próprio Bash, mais segura: entende `&&` e `||` e lida melhor com variáveis vazias ou com espaço.\n\nNos dois, os espaços internos são obrigatórios: `[ \"$x\" = \"ok\" ]` funciona, mas `[\"$x\"=\"ok\"]` não. Em scripts Bash, na dúvida, prefira `[[ ]]`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Operador\", \"Compara\", \"Exemplo\"], [\"=\", \"Strings iguais\", \"[[ $a = ok ]]\"], [\"!=\", \"Strings diferentes\", \"[[ $a != ok ]]\"], [\"-eq\", \"Números iguais\", \"[ $n -eq 10 ]\"], [\"-lt\", \"Número menor que\", \"[ $n -lt 10 ]\"], [\"-gt\", \"Número maior que\", \"[ $n -gt 10 ]\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O exit code e o $?\n\nTodo comando termina com um **exit code**: 0 quer dizer sucesso, qualquer outro número quer dizer falha. O `if` decide justamente por esse código: ele roda o bloco `then` quando o comando da condição termina com 0.\n\nA variável especial `$?` guarda o exit code do último comando:\n\n```\ngrep -q erro app.log\necho \"resultado do grep: $?\"\n```\n\nPor isso `if grep -q erro app.log; then` funciona sem colchetes: o `if` olha direto o exit code do `grep`."
                    },
                    {
                        "type": "quote",
                        "value": "O if decide pelo exit code da condição: roda o then quando o comando termina com 0. A variável $? guarda o código do último comando."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual palavra encerra um bloco if no Bash?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "fi",
                                "isCorrect": true
                            },
                            {
                                "text": "endif",
                                "isCorrect": false
                            },
                            {
                                "text": "done",
                                "isCorrect": false
                            },
                            {
                                "text": "end",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual operador testa se dois números são iguais em um teste [ ]?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "-eq",
                                "isCorrect": true
                            },
                            {
                                "text": "==",
                                "isCorrect": false
                            },
                            {
                                "text": "-is",
                                "isCorrect": false
                            },
                            {
                                "text": "eq",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O teste [ \"$nome\" = admin ] dá erro quando $nome está vazio. Qual forma é mais segura no Bash?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "[[ \"$nome\" = admin ]]",
                                "isCorrect": true
                            },
                            {
                                "text": "if ( \"$nome\" == admin )",
                                "isCorrect": false
                            },
                            {
                                "text": "{ \"$nome\" = admin }",
                                "isCorrect": false
                            },
                            {
                                "text": "( \"$nome\" = admin )",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a variável $? guarda logo depois de um comando rodar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O exit code do último comando",
                                "isCorrect": true
                            },
                            {
                                "text": "O PID do último comando executado",
                                "isCorrect": false
                            },
                            {
                                "text": "A saída em texto do último comando",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do último comando rodado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em 'if grep -q erro app.log; then', quando o bloco then é executado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Quando o grep termina com exit code 0",
                                "isCorrect": true
                            },
                            {
                                "text": "Quando o grep termina com exit code 1",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o arquivo app.log existe no disco",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o grep imprime a palavra na tela",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Loops e funções",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Repetindo com loops\n\nLoops evitam copiar e colar o mesmo comando várias vezes. O `for` percorre uma lista de itens, um por vez:\n\n```\nfor servico in nginx postgres redis; do\n    echo \"checando $servico\"\ndone\n```\n\nA variável `servico` assume cada valor da lista a cada volta. O corpo do loop abre com `do` e fecha com `done`."
                    },
                    {
                        "type": "code",
                        "value": "#!/bin/bash\n# while repete enquanto a condição for verdadeira\ncontador=1\nwhile [ \"$contador\" -le 3 ]; do\n    echo \"tentativa $contador\"\n    contador=$((contador + 1))\ndone"
                    },
                    {
                        "type": "text",
                        "value": "## Funções\n\nUma função agrupa comandos sob um nome, para reaproveitar. Você define uma vez e chama pelo nome, sem parênteses na chamada:\n\n```\nsaudar() {\n    echo \"Olá, $1\"\n}\n\nsaudar Ana\nsaudar Bruno\n```\n\nOs argumentos da função chegam em `$1`, `$2` dentro dela, igual a um script. O `return` define o **exit code** da função (um número de 0 a 255, onde 0 é sucesso), não um texto. Para devolver texto, use `echo` e capture com `$( )`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Palavra\", \"O que faz\"], [\"for\", \"Percorre uma lista, item a item\"], [\"while\", \"Repete enquanto a condição vale\"], [\"do / done\", \"Abrem e fecham o corpo do loop\"], [\"break\", \"Sai do loop na hora\"], [\"continue\", \"Pula para a próxima iteração\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## break e continue\n\nDentro de um loop, dois comandos mudam o fluxo:\n\n- `break` encerra o loop na hora, mesmo que ainda haja itens na lista.\n- `continue` pula o resto da volta atual e vai para a próxima.\n\n```\nfor n in 1 2 3 4 5; do\n    if [ \"$n\" -eq 3 ]; then\n        continue\n    fi\n    echo \"$n\"\ndone\n```\n\nEsse loop imprime 1, 2, 4 e 5, pulando o 3."
                    },
                    {
                        "type": "quote",
                        "value": "for percorre listas e while repete enquanto a condição vale; os dois fecham com done. Em funções, return define o exit code, não o texto de saída."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual palavra fecha o corpo de um loop for ou while no Bash?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "done",
                                "isCorrect": true
                            },
                            {
                                "text": "end",
                                "isCorrect": false
                            },
                            {
                                "text": "fi",
                                "isCorrect": false
                            },
                            {
                                "text": "stop",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você definiu a função backup. Como chamá-la no script?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "backup",
                                "isCorrect": true
                            },
                            {
                                "text": "call backup",
                                "isCorrect": false
                            },
                            {
                                "text": "run backup",
                                "isCorrect": false
                            },
                            {
                                "text": "backup()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro da função copiar, como você acessa o primeiro argumento passado a ela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "$1",
                                "isCorrect": true
                            },
                            {
                                "text": "$0",
                                "isCorrect": false
                            },
                            {
                                "text": "$arg",
                                "isCorrect": false
                            },
                            {
                                "text": "${copiar[1]}",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que continue faz dentro de um loop?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pula para a próxima iteração",
                                "isCorrect": true
                            },
                            {
                                "text": "Encerra o loop imediatamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Reinicia o loop desde o início",
                                "isCorrect": false
                            },
                            {
                                "text": "Sai do script inteiro na hora",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função precisa devolver o caminho de um arquivo para quem a chamou. Qual a forma correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Usar echo e capturar com $( )",
                                "isCorrect": true
                            },
                            {
                                "text": "Devolver o caminho usando return",
                                "isCorrect": false
                            },
                            {
                                "text": "As funções do Bash não devolvem texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar o caminho em $? e ler depois",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Robustez e um script real",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Deixando o script seguro\n\nPor padrão, um script Bash segue em frente mesmo depois de um comando falhar, o que pode causar estrago (imagine apagar arquivos com base numa variável vazia). A linha abaixo, logo após o shebang, muda esse comportamento:\n\n```\nset -euo pipefail\n```\n\nSão três proteções de uma vez:\n\n- `-e`: encerra o script assim que um comando falha (exit code diferente de 0).\n- `-u`: trata variável não definida como erro, em vez de deixá-la virar vazio em silêncio.\n- `-o pipefail`: faz um pipe falhar se qualquer etapa dele falhar, não só a última."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Opção\", \"O que faz\"], [\"-e\", \"Encerra o script no primeiro erro\"], [\"-u\", \"Erro ao usar variável não definida\"], [\"-o pipefail\", \"Um pipe falha se qualquer etapa falha\"], [\"set -euo pipefail\", \"Liga as três proteções juntas\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Checar antes de usar\n\nAntes de depender de um comando externo, confira se ele existe com `command -v`:\n\n```\nif ! command -v tar > /dev/null; then\n    echo \"tar não encontrado\" >&2\n    exit 1\nfi\n```\n\nO `>&2` manda a mensagem para a saída de erro (stderr), separada da saída normal. O `exit 1` encerra com código de falha, avisando quem chamou o script. Um atalho comum é `comando || echo \"falhou\"`, que roda o lado direito só quando o comando falha."
                    },
                    {
                        "type": "text",
                        "value": "## Arrays em conceito\n\nUm array guarda vários valores sob um nome só. Você cria com parênteses e acessa por índice, começando em 0:\n\n```\nservicos=(nginx postgres redis)\necho \"${servicos[0]}\"     # nginx\necho \"${servicos[@]}\"     # todos os itens\necho \"${#servicos[@]}\"    # quantos itens: 3\n```\n\n`${servicos[@]}` expande todos os elementos, útil para percorrer com `for`. `${#servicos[@]}` dá a quantidade. As chaves `{ }` são necessárias ao mexer com índices."
                    },
                    {
                        "type": "code",
                        "value": "#!/bin/bash\nset -euo pipefail\n\n# Uso: ./backup.sh ORIGEM DESTINO\norigem=\"${1:?informe a origem}\"\ndestino=\"${2:?informe o destino}\"\n\nif ! command -v tar > /dev/null; then\n    echo \"tar não encontrado\" >&2\n    exit 1\nfi\n\nmkdir -p \"$destino\"\ndata=$(date +%F)\narquivo=\"$destino/backup-$data.tar.gz\"\n\ntar -czf \"$arquivo\" \"$origem\"\necho \"backup criado em $arquivo\""
                    },
                    {
                        "type": "quote",
                        "value": "set -euo pipefail transforma erro silencioso em parada na hora: -e para no primeiro erro, -u barra variável não definida e pipefail cobre falhas no meio do pipe."
                    }
                ],
                "questions": [
                    {
                        "statement": "No set -euo pipefail, o que a opção -e faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Encerra o script no primeiro erro",
                                "isCorrect": true
                            },
                            {
                                "text": "Mostra cada comando antes de rodar",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignora todos os erros do script",
                                "isCorrect": false
                            },
                            {
                                "text": "Apaga as variáveis não utilizadas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No set -euo pipefail, para que serve a opção -u?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Erro ao usar variável não definida",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixa a saída do script mais colorida",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignora comandos que não existem",
                                "isCorrect": false
                            },
                            {
                                "text": "Desliga a checagem de pipe",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando verifica se o programa docker está instalado, para checar antes de usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "command -v docker",
                                "isCorrect": true
                            },
                            {
                                "text": "verify command docker",
                                "isCorrect": false
                            },
                            {
                                "text": "docker --installed",
                                "isCorrect": false
                            },
                            {
                                "text": "exists docker",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No array servicos=(nginx postgres redis), o que ${#servicos[@]} devolve?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A quantidade de itens: 3",
                                "isCorrect": true
                            },
                            {
                                "text": "O primeiro item: nginx",
                                "isCorrect": false
                            },
                            {
                                "text": "O último índice usado: 2",
                                "isCorrect": false
                            },
                            {
                                "text": "Todos os itens de uma vez",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que colocar set -euo pipefail perto do início de um script de automação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Para parar no erro e não seguir causando estrago",
                                "isCorrect": true
                            },
                            {
                                "text": "Para instalar as dependências que estiverem faltando",
                                "isCorrect": false
                            },
                            {
                                "text": "Para imprimir logs coloridos de cada comando",
                                "isCorrect": false
                            },
                            {
                                "text": "Para o script terminar sempre mais rápido",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Sistema em operação",
        "aulas": [
            {
                "titulo": "systemd e serviços",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O init e o gerente de serviços\n\nQuando o kernel termina de subir, ele entrega o controle a um único processo em espaço de usuário: o init, que recebe o PID 1. Na maioria das distribuições atuais esse processo é o systemd. Como PID 1, ele é o ancestral de todos os outros processos, o primeiro a subir e o último a sair, e é ele que conduz a inicialização da máquina até o ponto em que ela está pronta para uso.\n\nAlém de iniciar o sistema, o systemd é o gerente de serviços do dia a dia. Um serviço (daemon) é um processo que roda em segundo plano, sem terminal, atendendo pedidos: um servidor web, um banco de dados, o próprio SSH. É o systemd que sobe esses processos, os mantém de pé, reinicia quando caem e guarda o estado de cada um."
                    },
                    {
                        "type": "text",
                        "value": "## Controlando serviços com systemctl\n\nO comando systemctl é a porta de entrada para falar com o systemd. Com ele você inicia, para e inspeciona serviços sem precisar saber como cada um é lançado por dentro. As ações do dia a dia são poucas e vale decorá-las.\n\nUma distinção que confunde no começo: iniciar um serviço e habilitar um serviço são coisas diferentes. O start sobe o serviço agora, na sessão atual, e nada garante que ele volte depois de um reboot. O enable registra o serviço para subir sozinho no boot, mas não o inicia agora. Para as duas coisas de uma vez, use enable --now."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\", \"O que faz\"], [\"systemctl start nginx\", \"Inicia o serviço agora\"], [\"systemctl stop nginx\", \"Para o serviço agora\"], [\"systemctl restart nginx\", \"Para e sobe o serviço de novo\"], [\"systemctl reload nginx\", \"Recarrega a config sem derrubar o serviço\"], [\"systemctl enable nginx\", \"Marca para subir no boot\"], [\"systemctl disable nginx\", \"Remove do boot\"], [\"systemctl status nginx\", \"Mostra estado, PID e logs recentes\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O unit file por trás do serviço\n\nCada serviço que o systemd conhece é descrito por um arquivo texto chamado unit file, com extensão .service. Nele ficam declaradas as informações que o systemd precisa: qual comando executar para subir o processo, quando ele pode iniciar em relação a outros serviços e o que fazer se ele cair.\n\nServiço é só um dos tipos de unit. Existem outros, como socket, timer, mount e target, cada um com sua extensão. Os arquivos entregues pelos pacotes ficam em /usr/lib/systemd/system, e os seus, criados ou sobrepostos pelo administrador, em /etc/systemd/system, que tem prioridade. Depois de mexer em um unit file, rode systemctl daemon-reload para o systemd reler o que mudou."
                    },
                    {
                        "type": "code",
                        "value": "# estado atual do serviço, com as últimas linhas de log\nsystemctl status ssh\n\n# subir agora e também deixar habilitado no boot\nsystemctl enable --now ssh\n\n# conferir se está ativo e se sobe no boot\nsystemctl is-active ssh\nsystemctl is-enabled ssh"
                    },
                    {
                        "type": "quote",
                        "value": "enable e start respondem a perguntas diferentes: enable decide se o serviço sobe sozinho no próximo boot, start decide se ele está rodando agora. Um não implica o outro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Depois de instalar o nginx você roda systemctl start nginx e o site responde. Na manhã seguinte, após um reboot, o serviço não subiu sozinho. O que faltou?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Habilitar o serviço com systemctl enable nginx",
                                "isCorrect": true
                            },
                            {
                                "text": "Recarregar a config com systemctl reload nginx",
                                "isCorrect": false
                            },
                            {
                                "text": "Conferir o estado com systemctl status nginx",
                                "isCorrect": false
                            },
                            {
                                "text": "Parar e subir de novo com systemctl restart nginx",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um servidor Linux atual, qual processo recebe o PID 1 e atua como init do sistema?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O systemd",
                                "isCorrect": true
                            },
                            {
                                "text": "O kernel",
                                "isCorrect": false
                            },
                            {
                                "text": "O SSH",
                                "isCorrect": false
                            },
                            {
                                "text": "O systemctl",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você editou o unit file de um serviço em /etc/systemd/system e rodou systemctl restart, mas o systemd ignora a mudança. Que passo foi esquecido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Rodar systemctl daemon-reload para reler",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodar systemctl enable para aplicar a config",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover o arquivo para /usr/lib/systemd/system",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar systemctl reload no lugar de restart",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa recarregar a configuração de um serviço que está no ar sem cortar as conexões atuais. Qual subcomando do systemctl serve para isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "reload",
                                "isCorrect": true
                            },
                            {
                                "text": "restart",
                                "isCorrect": false
                            },
                            {
                                "text": "status",
                                "isCorrect": false
                            },
                            {
                                "text": "enable",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço precisa estar rodando agora e também subir automaticamente após o próximo reboot, em um só comando. Qual usar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "systemctl enable --now nginx",
                                "isCorrect": true
                            },
                            {
                                "text": "systemctl start --now nginx",
                                "isCorrect": false
                            },
                            {
                                "text": "systemctl restart --boot nginx",
                                "isCorrect": false
                            },
                            {
                                "text": "systemctl enable nginx",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Logs",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Onde o sistema anota o que acontece\n\nTodo sistema Linux mantém um registro do que os serviços e o kernel fazem: quem subiu, quem falhou, quem foi acessado e quando. Esses registros são os logs, e são a primeira parada quando algo dá errado. Em vez de adivinhar por que um serviço não sobe, você lê o que ele deixou anotado.\n\nEm sistemas com systemd convivem dois lugares para isso. O journald, que é o serviço de log do próprio systemd, coleta as mensagens em um journal central. E os arquivos texto em /var/log, formato mais antigo, que muitos serviços ainda usam por conta própria."
                    },
                    {
                        "type": "text",
                        "value": "## journald e journalctl\n\nO journald recebe automaticamente o que cada serviço escreve na saída padrão e na saída de erro, mais as mensagens do kernel e do próprio boot, e guarda tudo em um journal estruturado, em formato binário e não em texto solto. Você não abre esse journal com um editor: consulta com o comando journalctl.\n\nSem argumentos, journalctl despeja o journal inteiro, do mais antigo para o mais novo. O valor está nos filtros. Para ver só um serviço, use -u com o nome da unit. Para acompanhar em tempo real, como um tail, use -f. E -b limita ao boot atual, útil para separar o que é desta subida do que ficou de antes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\", \"O que mostra\"], [\"journalctl -u ssh\", \"Só as mensagens do serviço ssh\"], [\"journalctl -u ssh -f\", \"Segue o log do ssh em tempo real\"], [\"journalctl -b\", \"Só o que aconteceu no boot atual\"], [\"journalctl -p err\", \"Só mensagens de prioridade erro ou pior\"], [\"journalctl --since \\\"1 hour ago\\\"\", \"A partir de uma hora atrás\"], [\"journalctl -k\", \"Só as mensagens do kernel\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Os arquivos em /var/log\n\nNem tudo passa pelo journal. Muitos serviços escrevem seus próprios arquivos de log em /var/log, e vale conhecer os nomes mais comuns. O log geral do sistema fica em /var/log/syslog no Debian e no Ubuntu, ou em /var/log/messages no RHEL e derivados. As tentativas de autenticação ficam em /var/log/auth.log no Debian, ou em /var/log/secure no RHEL. Serviços como o nginx costumam ter seu próprio diretório, como /var/log/nginx.\n\nEsses arquivos são texto puro, então as ferramentas de sempre servem: less para navegar, tail -f para acompanhar, grep para filtrar. A diferença de nomes entre distribuições é um detalhe que pega quem troca de ambiente."
                    },
                    {
                        "type": "code",
                        "value": "# seguir em tempo real só os erros de um serviço\njournalctl -u nginx -p err -f\n\n# acompanhar um log em arquivo texto tradicional\ntail -f /var/log/syslog"
                    },
                    {
                        "type": "quote",
                        "value": "Log de sistema e log de serviço respondem a perguntas diferentes: o do sistema conta o que a máquina como um todo fez, o do serviço conta o que aquele processo específico fez. journalctl -u recorta o segundo a partir do primeiro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você quer ver apenas as mensagens do serviço ssh no journal, sem o resto. Qual comando usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "journalctl -u ssh",
                                "isCorrect": true
                            },
                            {
                                "text": "journalctl -f ssh",
                                "isCorrect": false
                            },
                            {
                                "text": "journalctl -b ssh",
                                "isCorrect": false
                            },
                            {
                                "text": "journalctl -p ssh",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um deploy está em andamento e você quer acompanhar o log do serviço em tempo real, vendo cada linha nova aparecer. Que opção do journalctl faz isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "-f, que segue o log em tempo real",
                                "isCorrect": true
                            },
                            {
                                "text": "-b, que limita ao boot atual",
                                "isCorrect": false
                            },
                            {
                                "text": "-r, que inverte a ordem das linhas",
                                "isCorrect": false
                            },
                            {
                                "text": "-n, que corta por número de linhas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um servidor Ubuntu, onde procurar primeiro o registro geral do sistema, com mensagens de vários serviços?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "/var/log/syslog",
                                "isCorrect": true
                            },
                            {
                                "text": "/var/log/secure",
                                "isCorrect": false
                            },
                            {
                                "text": "/var/log/nginx",
                                "isCorrect": false
                            },
                            {
                                "text": "/etc/rsyslog.conf",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O journald guarda o journal em formato binário. Qual a consequência prática disso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Você consulta com journalctl, não com um editor",
                                "isCorrect": true
                            },
                            {
                                "text": "O journal não pode mais ser filtrado por serviço",
                                "isCorrect": false
                            },
                            {
                                "text": "Os logs deixam de registrar mensagens do kernel",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada serviço passa a escrever direto em /var/log",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de reiniciar a máquina, você quer investigar só as falhas do boot atual, ignorando o que ficou de sessões anteriores. Qual combinação usar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "journalctl -b -p err",
                                "isCorrect": true
                            },
                            {
                                "text": "journalctl -f -p err",
                                "isCorrect": false
                            },
                            {
                                "text": "journalctl -k --since boot",
                                "isCorrect": false
                            },
                            {
                                "text": "journalctl -u boot -p err",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Pacotes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que existe um gerenciador de pacotes\n\nInstalar software no Linux não é sair baixando executável e jogando numa pasta. Cada distribuição traz um gerenciador de pacotes: um programa que instala, atualiza e remove software de forma controlada, sabendo exatamente o que está na máquina e de onde veio.\n\nO ganho é grande. O gerenciador resolve dependências, isto é, as bibliotecas de que aquele software precisa, aplica atualizações de segurança em bloco, verifica a assinatura do que baixa e sabe apagar tudo direito na hora de remover. Baixar um binário solto da internet joga tudo isso fora: sem atualização automática, sem verificação de origem, sem registro do que foi parar onde."
                    },
                    {
                        "type": "text",
                        "value": "## As duas famílias: apt e dnf\n\nCada família de distribuições tem seu gerenciador. No Debian e no Ubuntu é o apt, que trabalha sobre pacotes .deb. No RHEL, no Fedora e derivados é o dnf, sucessor do yum, sobre pacotes .rpm. Os comandos mudam de nome, mas as ações são as mesmas: atualizar o índice, instalar, atualizar e remover.\n\nUm ponto que pega quem começa no apt: update e upgrade não são a mesma coisa. O apt update apenas baixa a lista mais recente do que existe nos repositórios, sem mexer em nada instalado. O apt upgrade é que de fato instala as versões novas. O hábito é rodar os dois em sequência."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ação\", \"Debian/Ubuntu (apt)\", \"RHEL/Fedora (dnf)\"], [\"Atualizar o índice\", \"apt update\", \"dnf check-update\"], [\"Instalar um pacote\", \"apt install nginx\", \"dnf install nginx\"], [\"Atualizar o instalado\", \"apt upgrade\", \"dnf upgrade\"], [\"Remover um pacote\", \"apt remove nginx\", \"dnf remove nginx\"], [\"Procurar um pacote\", \"apt search nginx\", \"dnf search nginx\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Repositórios: de onde vem o software\n\nO gerenciador não busca software em qualquer lugar. Ele consulta uma lista de repositórios: coleções de pacotes servidas por endereços confiáveis, normalmente mantidas pela própria distribuição. No apt essa lista fica em /etc/apt/sources.list e nos arquivos dentro de /etc/apt/sources.list.d; no dnf, em /etc/yum.repos.d.\n\nCada repositório é assinado com uma chave, e o gerenciador recusa pacotes cuja assinatura não bate. É por isso que instalar pelo repositório é mais seguro do que baixar à mão: a origem é verificada. Adicionar um repositório de terceiros é possível, mas é uma decisão consciente, porque amplia a lista de fontes em que você confia."
                    },
                    {
                        "type": "code",
                        "value": "# fluxo comum no Debian/Ubuntu\napt update\napt install nginx\n\n# remover, incluindo os arquivos de configuração\napt purge nginx"
                    },
                    {
                        "type": "quote",
                        "value": "apt update mexe no índice, apt upgrade mexe no que está instalado. Rodar update sozinho nunca atualiza um pacote, só descobre que existe versão nova."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em um servidor Ubuntu, qual comando instala o pacote do nginx pelo gerenciador?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "apt install nginx",
                                "isCorrect": true
                            },
                            {
                                "text": "apt update nginx",
                                "isCorrect": false
                            },
                            {
                                "text": "apt search nginx",
                                "isCorrect": false
                            },
                            {
                                "text": "dnf install nginx",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você está em uma máquina Fedora e precisa remover um pacote. Qual comando usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "dnf remove",
                                "isCorrect": true
                            },
                            {
                                "text": "apt remove",
                                "isCorrect": false
                            },
                            {
                                "text": "dnf search",
                                "isCorrect": false
                            },
                            {
                                "text": "rpm update",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você rodou apt update e estranhou que nenhum pacote foi atualizado. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "update só atualiza o índice, não os pacotes",
                                "isCorrect": true
                            },
                            {
                                "text": "update precisa da opção --all para valer",
                                "isCorrect": false
                            },
                            {
                                "text": "update atualiza apenas pacotes de segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "update só age depois de um apt purge",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que instalar pelo repositório da distribuição é mais seguro do que baixar um binário solto de um site qualquer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O gerenciador verifica origem e dependências",
                                "isCorrect": true
                            },
                            {
                                "text": "O binário solto ocupa mais espaço em disco",
                                "isCorrect": false
                            },
                            {
                                "text": "O repositório instala sempre a versão mais antiga",
                                "isCorrect": false
                            },
                            {
                                "text": "O binário solto não roda fora de /usr/bin",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao remover um serviço, você quer apagar também os arquivos de configuração que ele deixou. No apt, qual comando faz isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "apt purge nginx",
                                "isCorrect": true
                            },
                            {
                                "text": "apt remove nginx",
                                "isCorrect": false
                            },
                            {
                                "text": "apt clean nginx",
                                "isCorrect": false
                            },
                            {
                                "text": "apt autoremove nginx",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Agendamento de tarefas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Tarefas que rodam sozinhas\n\nBoa parte do trabalho de um servidor é repetitiva e precisa acontecer em horário certo, sem ninguém por perto: girar logs, fazer backup, limpar arquivos temporários, disparar um relatório de madrugada. Para isso existe o agendamento de tarefas, e a ferramenta clássica do Unix é o cron.\n\nO cron é um daemon que fica em segundo plano lendo tabelas de agendamento, as crontabs, e executando cada comando na hora marcada. Cada usuário tem a sua crontab, e há também crontabs de sistema. A tarefa em si é só uma linha: quando rodar, seguido do comando a rodar."
                    },
                    {
                        "type": "text",
                        "value": "## Os cinco campos do cron\n\nA parte que exige atenção é a sintaxe do horário. Antes do comando vêm cinco campos, sempre nesta ordem: minuto, hora, dia do mês, mês e dia da semana. Um asterisco em um campo significa qualquer valor.\n\nOs intervalos de cada campo: minuto de 0 a 59, hora de 0 a 23, dia do mês de 1 a 31, mês de 1 a 12 e dia da semana de 0 a 7, onde 0 e 7 são domingo. Além do asterisco, dá para usar listas com vírgula (1,15), intervalos com hífen (1-5) e passos com barra (*/10, a cada dez). Errar a ordem dos campos é o engano mais comum, e o comando roda na hora errada sem avisar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Agendamento\", \"minuto\", \"hora\", \"dia do mês\", \"mês\", \"dia da semana\"], [\"Todo dia às 03:00\", \"0\", \"3\", \"*\", \"*\", \"*\"], [\"A cada 15 minutos\", \"*/15\", \"*\", \"*\", \"*\", \"*\"], [\"Toda segunda às 09:00\", \"0\", \"9\", \"*\", \"*\", \"1\"], [\"Dia 1 de cada mês, às 02:30\", \"30\", \"2\", \"1\", \"*\", \"*\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Editando a crontab, e uma alternativa moderna\n\nVocê não edita o arquivo da crontab diretamente. O crontab -e abre a sua crontab em um editor e valida a sintaxe ao salvar; o crontab -l lista o que está agendado; e o crontab -r apaga a crontab inteira, sem pedir confirmação, então cuidado. E lembre que a tarefa roda em um ambiente enxuto, com PATH curto, o que torna comum usar caminhos completos como /usr/bin/ dentro dela.\n\nEm sistemas com systemd há uma alternativa ao cron: os systemd timers. Você define uma unit .timer com o horário, por exemplo com OnCalendar, apontando para uma unit .service com a tarefa. A vantagem é integrar com o resto do systemd: o log vai para o journal, dá para ver os próximos disparos com systemctl list-timers e uma execução perdida com a máquina desligada pode ser recuperada. Para agendamentos simples o cron resolve; para tarefas que já vivem no systemd, os timers encaixam melhor."
                    },
                    {
                        "type": "code",
                        "value": "# abrir a própria crontab e listar o que já existe\ncrontab -e\ncrontab -l\n\n# backup todos os dias às 02:30\n30 2 * * * /usr/local/bin/backup.sh"
                    },
                    {
                        "type": "quote",
                        "value": "Decore a ordem dos cinco campos: minuto, hora, dia do mês, mês, dia da semana. Trocar hora por dia do mês não dá erro, só faz o comando rodar na hora errada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na crontab, o que significa a linha 0 3 * * * antes do comando?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Todo dia às 03:00",
                                "isCorrect": true
                            },
                            {
                                "text": "Todo dia às 00:03",
                                "isCorrect": false
                            },
                            {
                                "text": "Às 03:00 só aos domingos",
                                "isCorrect": false
                            },
                            {
                                "text": "A cada 3 horas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando abre a sua crontab em um editor para adicionar uma tarefa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "crontab -e",
                                "isCorrect": true
                            },
                            {
                                "text": "crontab -l",
                                "isCorrect": false
                            },
                            {
                                "text": "crontab -r",
                                "isCorrect": false
                            },
                            {
                                "text": "crontab -a",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a ordem correta dos cinco campos do cron, da esquerda para a direita?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "minuto, hora, dia do mês, mês, dia da semana",
                                "isCorrect": true
                            },
                            {
                                "text": "hora, minuto, dia da semana, mês, dia do mês",
                                "isCorrect": false
                            },
                            {
                                "text": "minuto, hora, mês, dia do mês, dia da semana",
                                "isCorrect": false
                            },
                            {
                                "text": "dia da semana, dia do mês, mês, hora, minuto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer rodar um script a cada 15 minutos. Qual valor usar no campo de minuto, deixando os outros como asterisco?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "*/15",
                                "isCorrect": true
                            },
                            {
                                "text": "15",
                                "isCorrect": false
                            },
                            {
                                "text": "0-15",
                                "isCorrect": false
                            },
                            {
                                "text": "4",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um sistema com systemd, qual comando lista os timers e mostra quando cada um vai disparar da próxima vez?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "systemctl list-timers",
                                "isCorrect": true
                            },
                            {
                                "text": "crontab -l",
                                "isCorrect": false
                            },
                            {
                                "text": "systemctl status cron",
                                "isCorrect": false
                            },
                            {
                                "text": "journalctl -u timers",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Rede básica",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Enxergando a rede da máquina\n\nDiagnosticar rede é rotina em DevOps: o serviço não responde, a conexão cai, o nome não resolve. O primeiro passo é enxergar como a máquina está conectada, e as ferramentas modernas para isso vêm do pacote iproute2, com o comando ip à frente. Elas substituem utilitários antigos como ifconfig e route, que você ainda encontra em máquinas legadas.\n\nDuas consultas abrem qualquer investigação. O ip a, abreviação de ip address, mostra as interfaces de rede e os endereços IP de cada uma. O ip r, de ip route, mostra a tabela de rotas, incluindo a rota padrão (default), o caminho por onde sai o tráfego que não é local."
                    },
                    {
                        "type": "text",
                        "value": "## Portas, conexões e conectividade\n\nSaber quais portas a máquina tem abertas responde a metade das dúvidas de rede. O comando ss faz isso, no lugar do antigo netstat. A combinação mais útil é ss -tlnp: t de TCP, l de listening (só quem está escutando), n para mostrar números em vez de resolver nomes de porta, e p para revelar qual processo abriu cada porta.\n\nPara testar se o outro lado responde, dois caminhos. O ping envia pacotes ICMP e confirma se o host está alcançável na rede, lembrando que alguns servidores bloqueiam ICMP, então silêncio nem sempre é falha. Já curl e wget falam HTTP: servem para bater em uma URL e ver se o serviço responde de fato, não só se a máquina está de pé. O curl é a escolha para inspecionar uma API; o wget, para baixar um arquivo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\", \"Para que serve\"], [\"ip a\", \"Lista interfaces e endereços IP\"], [\"ip r\", \"Mostra a tabela de rotas e a rota padrão\"], [\"ss -tlnp\", \"Portas TCP em escuta e o processo de cada uma\"], [\"ping 1.1.1.1\", \"Testa se um host responde na rede\"], [\"curl -I https://exemplo.com\", \"Vê a resposta HTTP de um serviço\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Hostname e resolução de nomes\n\nToda máquina tem um hostname, o nome pelo qual ela se identifica na rede. Você consulta com o comando hostname e, em sistemas com systemd, com hostnamectl, que também mostra outros dados do host.\n\nQuando você usa um nome em vez de um IP, algo precisa traduzir um no outro. Essa é a resolução de nomes, e ela consulta fontes na ordem que o sistema define. Primeiro o arquivo /etc/hosts, uma tabela local e estática que mapeia nomes a IPs, útil para atalhos e testes. Não achando ali, entra o DNS, o serviço distribuído que traduz nomes de domínio da internet inteira em IPs. Quando um nome não resolve, esses dois pontos, o arquivo local e o DNS, são onde olhar."
                    },
                    {
                        "type": "code",
                        "value": "# endereços e rota padrão\nip a\nip r\n\n# quem está escutando em TCP, com o processo\nss -tlnp"
                    },
                    {
                        "type": "quote",
                        "value": "ping testa a máquina, curl testa o serviço. O host pode responder ao ping e mesmo assim a aplicação estar fora do ar; são camadas diferentes, e confundir as duas atrasa o diagnóstico."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você quer ver os endereços IP configurados nas interfaces da máquina. Qual comando usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "ip a",
                                "isCorrect": true
                            },
                            {
                                "text": "ip r",
                                "isCorrect": false
                            },
                            {
                                "text": "ss -tlnp",
                                "isCorrect": false
                            },
                            {
                                "text": "ping localhost",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando mostra a tabela de rotas, incluindo a rota padrão de saída?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "ip r",
                                "isCorrect": true
                            },
                            {
                                "text": "ip a",
                                "isCorrect": false
                            },
                            {
                                "text": "ss -r",
                                "isCorrect": false
                            },
                            {
                                "text": "curl -r",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço deveria estar escutando na porta 8080, mas ninguém consegue conectar. Qual comando confirma se há algo escutando nessa porta TCP e qual processo é?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ss -tlnp",
                                "isCorrect": true
                            },
                            {
                                "text": "ping 8080",
                                "isCorrect": false
                            },
                            {
                                "text": "ip r",
                                "isCorrect": false
                            },
                            {
                                "text": "curl -I 8080",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O ping para um servidor responde normalmente, mas a aplicação web nele não carrega. O que isso indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A máquina responde, mas o serviço está fora",
                                "isCorrect": true
                            },
                            {
                                "text": "O host está completamente inalcançável na rede",
                                "isCorrect": false
                            },
                            {
                                "text": "O DNS não resolveu o nome desse servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "A rota padrão da sua máquina foi removida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa que o nome app-interno aponte para um IP fixo só nesta máquina, sem depender de DNS, para um teste. Onde configurar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "No arquivo /etc/hosts",
                                "isCorrect": true
                            },
                            {
                                "text": "No arquivo /etc/hostname",
                                "isCorrect": false
                            },
                            {
                                "text": "Na saída de ip r",
                                "isCorrect": false
                            },
                            {
                                "text": "No comando ss -tlnp",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Linux para DevOps",
        "aulas": [
            {
                "titulo": "SSH e acesso remoto",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Acesso remoto com SSH\nNo trabalho de DevOps, os servidores quase nunca estão à sua frente: eles vivem em um datacenter ou na nuvem. O jeito padrão de operar essas máquinas é o **SSH** (Secure Shell), um protocolo que abre um terminal remoto por um canal criptografado.\n\nO SSH funciona em cliente e servidor. No servidor roda um serviço que escuta conexões (o `sshd`), por padrão na porta 22. Na sua máquina, o comando `ssh` é o cliente. Ao conectar, tudo o que trafega (comandos, senhas, saída) vai cifrado pela rede, ao contrário de protocolos antigos como o Telnet, que mandavam texto puro."
                    },
                    {
                        "type": "code",
                        "value": "# conectar como o usuário 'deploy' no servidor\nssh deploy@192.168.0.10\n\n# usar uma porta diferente da 22\nssh -p 2222 deploy@servidor.exemplo.com\n\n# rodar um único comando sem abrir sessão interativa\nssh deploy@servidor.exemplo.com 'df -h'"
                    },
                    {
                        "type": "text",
                        "value": "## Autenticação por par de chaves\nEntrar digitando senha funciona, mas o padrão profissional é a **autenticação por chave**. Você gera um par de chaves com o `ssh-keygen`:\n\n- A **chave privada** fica guardada na sua máquina (por padrão em `~/.ssh/id_ed25519`) e nunca deve sair dela.\n- A **chave pública** (`~/.ssh/id_ed25519.pub`) pode ser distribuída sem risco: é ela que você instala nos servidores.\n\nNo servidor, as chaves públicas autorizadas a entrar como um usuário ficam listadas no arquivo `~/.ssh/authorized_keys` daquele usuário. Quando você conecta, o servidor desafia quem tem a chave privada correspondente a alguma pública autorizada; se a prova bate, a sessão abre sem pedir senha."
                    },
                    {
                        "type": "code",
                        "value": "# gerar um par de chaves (algoritmo ed25519)\nssh-keygen -t ed25519 -C 'meu-notebook'\n\n# instalar a chave pública no servidor (adiciona ao authorized_keys)\nssh-copy-id deploy@192.168.0.10\n\n# copiar arquivos pela mesma conexão segura do SSH\nscp backup.tar.gz deploy@192.168.0.10:/opt/backups/"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Senha\", \"Par de chaves\"], [\"O que vai para a rede\", \"A senha, verificada no servidor\", \"Só uma prova; a privada não sai\"], [\"Resistência a força bruta\", \"Baixa, dá para tentar sem fim\", \"Alta, chave longa e aleatória\"], [\"Reuso entre servidores\", \"Costuma repetir a mesma senha\", \"Uma pública em vários hosts\"], [\"Automação em CI/CD\", \"Frágil e pouco segura\", \"Natural, sem interação humana\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A chave privada é o seu segredo e nunca sai da sua máquina; você só distribui a chave pública. Quem tem a pública consegue verificar você, mas não se passar por você."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você precisa administrar um servidor em um datacenter, sem acesso físico a ele. Qual ferramenta abre um terminal remoto por um canal criptografado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O SSH, que conecta ao servidor por um canal cifrado",
                                "isCorrect": true
                            },
                            {
                                "text": "O Telnet, por ser o protocolo mais moderno de acesso",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando df, que mostra o uso de disco remoto",
                                "isCorrect": false
                            },
                            {
                                "text": "O FTP, feito para abrir terminais interativos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em que arquivo, no servidor, ficam as chaves públicas autorizadas a entrar como um determinado usuário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "~/.ssh/authorized_keys",
                                "isCorrect": true
                            },
                            {
                                "text": "/etc/ssh/ssh_known_hosts",
                                "isCorrect": false
                            },
                            {
                                "text": "~/.ssh/id_ed25519",
                                "isCorrect": false
                            },
                            {
                                "text": "~/.bashrc",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao configurar acesso por chave, qual arquivo você copia para o servidor e qual jamais deve sair da sua máquina?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Copia a chave pública; a privada permanece com você",
                                "isCorrect": true
                            },
                            {
                                "text": "Copia a chave privada; a pública permanece com você",
                                "isCorrect": false
                            },
                            {
                                "text": "Copia as duas, pois o servidor precisa do par completo",
                                "isCorrect": false
                            },
                            {
                                "text": "Copia apenas a senha, que substitui o par de chaves",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer enviar um arquivo de backup ao servidor usando a mesma conexão segura do SSH. Qual comando faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "scp backup.tar.gz deploy@host:/backups/",
                                "isCorrect": true
                            },
                            {
                                "text": "ssh-keygen backup.tar.gz deploy@host",
                                "isCorrect": false
                            },
                            {
                                "text": "df -h backup.tar.gz enviando ao host",
                                "isCorrect": false
                            },
                            {
                                "text": "ping deploy@host anexando o backup.tar.gz",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a autenticação por chave é considerada mais segura que a por senha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A chave privada não trafega e resiste a força bruta",
                                "isCorrect": true
                            },
                            {
                                "text": "A senha é cifrada, mas a chave viaja em texto puro pela rede",
                                "isCorrect": false
                            },
                            {
                                "text": "A chave dispensa que exista o serviço sshd no servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "A senha exige a porta 22 e a chave dispensa a rede",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ambiente e configuração do shell",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O ambiente do shell\nToda sessão de shell carrega um **ambiente**: um conjunto de variáveis que descrevem o contexto em que os comandos rodam. Coisas como o seu diretório pessoal, o seu nome de usuário e onde procurar programas ficam guardadas em **variáveis de ambiente**.\n\nVocê lê uma variável com `$NOME` e lista todas com `env`. Definir `NOME=valor` cria a variável apenas no shell atual. Para que os processos filhos (os programas que você executa) também a enxerguem, use `export`. Sem `export`, a variável fica restrita à sessão e não é herdada pelos programas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Variável\", \"O que guarda\"], [\"HOME\", \"Diretório pessoal do usuário\"], [\"USER\", \"Nome do usuário atual\"], [\"PATH\", \"Onde o shell procura os comandos\"], [\"SHELL\", \"Caminho do shell em uso\"], [\"PWD\", \"Diretório de trabalho atual\"], [\"LANG\", \"Idioma e codificação da sessão\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como o shell acha os comandos\nQuando você digita `ls` ou `git`, o shell não adivinha onde o programa está: ele consulta o **PATH**. O PATH é uma lista de diretórios separados por dois-pontos (`:`), como `/usr/local/bin:/usr/bin:/bin`. O shell percorre esses diretórios **na ordem** e executa o primeiro programa com aquele nome que encontrar.\n\nSe um comando existe mas o shell responde 'command not found', quase sempre o diretório dele não está no PATH. O comando `which` mostra qual arquivo foi de fato escolhido. Para tornar um programa novo acessível, você adiciona o diretório dele ao PATH."
                    },
                    {
                        "type": "code",
                        "value": "# ver o conteúdo do PATH\necho $PATH\n\n# descobrir qual binário o shell usa para 'python'\nwhich python\n\n# adicionar um diretório ao fim do PATH\nexport PATH=\"$PATH:/opt/minha-ferramenta/bin\"\n\n# criar um atalho para um comando longo\nalias ll='ls -lah'"
                    },
                    {
                        "type": "text",
                        "value": "## Arquivos que configuram a sessão\nDe onde vêm as suas variáveis e atalhos toda vez que você abre um terminal? De **arquivos de perfil** que o shell lê ao iniciar. Em conceito:\n\n- `~/.profile` (ou `~/.bash_profile`) roda em shells de **login**, como quando você entra por SSH.\n- `~/.bashrc` roda em shells **interativos** que não são de login, como um novo terminal na sua sessão gráfica.\n\nÉ neles que você coloca os seus `export` e os seus `alias`, para que valham em toda sessão em vez de redigitar tudo. Um **alias** é um apelido para um comando: `alias ll='ls -lah'` faz `ll` expandir para o comando completo. Editar esses arquivos não muda a sessão já aberta; ou você reabre o terminal, ou recarrega com `source ~/.bashrc`."
                    },
                    {
                        "type": "quote",
                        "value": "Definir uma variável cria ela no shell atual; exportar com export é o que a torna visível aos programas que você executa. Sem export, o processo filho não a enxerga."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você definiu API_URL no terminal, mas o programa que executou não enxerga essa variável. O que provavelmente faltou?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Exportar a variável com export API_URL",
                                "isCorrect": true
                            },
                            {
                                "text": "Reiniciar o servidor inteiro para aplicar",
                                "isCorrect": false
                            },
                            {
                                "text": "Renomear a variável para letras minúsculas",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover a variável para dentro do PATH",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve a variável de ambiente PATH?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dizer ao shell onde procurar os comandos",
                                "isCorrect": true
                            },
                            {
                                "text": "Guardar a senha do usuário logado na sessão",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir o diretório pessoal do usuário atual",
                                "isCorrect": false
                            },
                            {
                                "text": "Registrar o histórico dos comandos digitados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você instalou uma ferramenta em /opt/app/bin, mas ao chamá-la aparece 'command not found', mesmo o binário existindo. Qual a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O diretório /opt/app/bin não está no PATH",
                                "isCorrect": true
                            },
                            {
                                "text": "O binário precisa ser renomeado com maiúsculas",
                                "isCorrect": false
                            },
                            {
                                "text": "O shell não roda programas fora do diretório home",
                                "isCorrect": false
                            },
                            {
                                "text": "A variável HOME está apontando para o lugar errado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer que o atalho alias ll='ls -lah' esteja disponível em todo novo terminal, sem redigitar. Onde colocá-lo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Em um arquivo de perfil, como o ~/.bashrc",
                                "isCorrect": true
                            },
                            {
                                "text": "Dentro da variável PATH da sua sessão atual",
                                "isCorrect": false
                            },
                            {
                                "text": "No arquivo authorized_keys do seu usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "Em uma variável exportada chamada ALIAS",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois diretórios listados no PATH têm um programa chamado deploy. Qual o shell executa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O do primeiro diretório na ordem do PATH",
                                "isCorrect": true
                            },
                            {
                                "text": "O do último diretório que aparece no PATH",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois ao mesmo tempo, em processos separados",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum, porque nomes repetidos são bloqueados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Disco e sistemas de arquivos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quanto espaço tem e o que o ocupa\nDisco cheio derruba serviço: banco para de gravar, log trava, deploy falha. Duas ferramentas respondem às perguntas do dia a dia.\n\nO `df` (disk free) mostra o espaço **por sistema de arquivos montado**: total, usado, livre e o percentual. Com `-h` (human), os tamanhos vêm em KB, MB e GB legíveis.\n\nO `du` (disk usage) mostra **quanto cada diretório ou arquivo ocupa**. É o `du` que responde 'o que encheu o disco?', varrendo uma árvore e somando os tamanhos. Um resume o todo, o outro aponta o culpado."
                    },
                    {
                        "type": "code",
                        "value": "# espaço livre por sistema de arquivos, em unidades legíveis\ndf -h\n\n# tamanho total de cada item do diretório atual\ndu -sh *\n\n# os maiores diretórios dentro de /var, ordenados\ndu -h /var --max-depth=1 | sort -h"
                    },
                    {
                        "type": "text",
                        "value": "## Partições e montagem\nUm disco físico costuma ser dividido em **partições**, fatias independentes. Cada partição recebe um **sistema de arquivos** (a estrutura que organiza arquivos e diretórios) e, para ser usada, precisa ser **montada**: ligada a um diretório da árvore, chamado ponto de montagem.\n\nNo Linux não existem letras de unidade como C: ou D:. Há uma única árvore que começa na raiz `/`, e outros discos aparecem montados em diretórios dela, por exemplo um segundo disco em `/mnt/dados`. O comando `mount` conecta um sistema de arquivos a um ponto; `umount` desconecta. As montagens que devem valer a cada boot ficam descritas em `/etc/fstab`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sistema de arquivos\", \"Nota\"], [\"ext4\", \"Padrão histórico do Linux, maduro e confiável\"], [\"xfs\", \"Bom com arquivos grandes; comum em servidores\"], [\"btrfs\", \"Traz snapshots e checksums dos dados\"], [\"tmpfs\", \"Vive na memória RAM; some ao reiniciar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O disco enche de duas formas\nEspaço livre não é a história completa. Um sistema de arquivos guarda os dados em **blocos**, mas guarda os metadados de cada arquivo (nome, dono, permissões, onde estão os blocos) em uma estrutura chamada **inode**. O número de inodes é definido quando o sistema de arquivos é criado.\n\nPor isso o disco pode encher de duas maneiras. A comum: acabaram os blocos, não há mais espaço para dados. A traiçoeira: acabaram os **inodes**, mesmo com espaço sobrando. Isso ocorre com uma enxurrada de arquivos minúsculos (milhões de arquivos de cache ou de sessão). O `df -h` mostra o espaço; o `df -i` mostra os inodes. Quando um disco 'sem motivo' está cheio, olhe os inodes."
                    },
                    {
                        "type": "quote",
                        "value": "O df responde quanto espaço resta; o du responde o que está ocupando. E o disco pode encher por falta de blocos ou por falta de inodes: sempre confira os dois."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um serviço parou de gravar dados e você suspeita de disco cheio. Qual comando mostra o espaço livre por sistema de arquivos, em unidades legíveis?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df -h",
                                "isCorrect": true
                            },
                            {
                                "text": "du -sh",
                                "isCorrect": false
                            },
                            {
                                "text": "ls -l",
                                "isCorrect": false
                            },
                            {
                                "text": "mount -a",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você confirmou que o disco está cheio e agora precisa achar qual diretório ocupa mais espaço. Qual ferramenta usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "du, que soma o tamanho de cada diretório",
                                "isCorrect": true
                            },
                            {
                                "text": "df, que só resume o espaço livre total",
                                "isCorrect": false
                            },
                            {
                                "text": "ssh, que abre uma sessão remota segura",
                                "isCorrect": false
                            },
                            {
                                "text": "export, que define variáveis de ambiente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Linux, como um segundo disco passa a ser acessível dentro da árvore de arquivos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É montado em um diretório, como /mnt/dados",
                                "isCorrect": true
                            },
                            {
                                "text": "Recebe uma letra de unidade própria, como D:",
                                "isCorrect": false
                            },
                            {
                                "text": "É adicionado automaticamente ao PATH",
                                "isCorrect": false
                            },
                            {
                                "text": "É listado apenas pelo comando df -i",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O df -h mostra espaço livre de sobra, mas o sistema acusa 'No space left on device' ao criar arquivos. Qual a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Os inodes acabaram, apesar de haver blocos livres",
                                "isCorrect": true
                            },
                            {
                                "text": "O comando du corrompeu a tabela de partições",
                                "isCorrect": false
                            },
                            {
                                "text": "O disco não foi incluído no arquivo authorized_keys",
                                "isCorrect": false
                            },
                            {
                                "text": "A variável PATH não inclui o ponto de montagem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que diferencia o papel do df do papel do du?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O df resume o espaço; o du aponta o que o ocupa",
                                "isCorrect": true
                            },
                            {
                                "text": "O df formata a partição; o du monta o filesystem",
                                "isCorrect": false
                            },
                            {
                                "text": "O df lista usuários; o du lista processos ativos",
                                "isCorrect": false
                            },
                            {
                                "text": "O df e o du fazem exatamente a mesma coisa",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Limites de recurso",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que limitar recursos\nUm único processo pode derrubar a máquina inteira: um vazamento de memória que cresce sem parar, um laço que satura a CPU, um bug que abre arquivos sem fechar. Em servidores, conter o estrago de um processo é essencial.\n\nO controle mais direto é o `ulimit`, que impõe **limites por processo** na sua sessão: número de arquivos abertos, tamanho máximo de arquivo, quantidade de processos. Cada limite tem um valor **soft** (o que vale agora, ajustável pelo usuário) e um **hard** (o teto, que só o administrador aumenta). Os limites são herdados pelos processos filhos, então valem para tudo que nasce daquela sessão."
                    },
                    {
                        "type": "code",
                        "value": "# listar todos os limites da sessão atual\nulimit -a\n\n# ver o limite de arquivos abertos por processo\nulimit -n\n\n# ajustar o limite (soft) de arquivos abertos para 4096\nulimit -n 4096"
                    },
                    {
                        "type": "text",
                        "value": "## cgroups: quanto cada grupo pode usar\nO `ulimit` cuida de um processo por vez. Para controlar **grupos de processos** com precisão, o kernel Linux oferece os **cgroups** (control groups). Um cgroup agrupa processos e impõe cotas de CPU, memória e I/O de disco a todos juntos, além de contabilizar quanto consomem.\n\nÉ o cgroup que permite dizer 'este conjunto de processos pode usar no máximo 512 MB de RAM e meio núcleo de CPU'. Se a memória estoura, o kernel age sobre o grupo. É o mecanismo que garante que um container não sufoque os vizinhos na mesma máquina."
                    },
                    {
                        "type": "text",
                        "value": "## namespaces: o que cada processo enxerga\nOs cgroups limitam **quanto** se usa; os **namespaces** limitam **o que** se vê. Um namespace dá a um processo uma visão isolada de um recurso do sistema, como se ele estivesse sozinho na máquina.\n\nHá vários tipos: o namespace de PID faz o processo enxergar a própria numeração (o que lá dentro é o PID 1 é outro processo no host); o de rede dá interfaces e portas próprias; o de mount dá a sua própria árvore de diretórios; o de usuários mapeia os IDs. Juntos, eles criam a ilusão de um sistema separado, sem precisar de uma segunda máquina virtual."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Mecanismo\", \"O que faz\", \"Exemplo\"], [\"cgroups\", \"Limita e contabiliza o consumo\", \"Teto de 512 MB de RAM ao grupo\"], [\"namespaces\", \"Isola a visão do sistema\", \"Ver só os próprios PIDs\"], [\"ulimit\", \"Limita um processo e seus filhos\", \"Máximo de arquivos abertos\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "cgroups limitam quanto um grupo de processos consome; namespaces isolam o que ele enxerga. Essa dupla, dentro do kernel, é a base técnica dos containers."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando ajusta limites de recurso, como o número de arquivos abertos, para a sua sessão de shell e os processos que ela inicia?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "ulimit",
                                "isCorrect": true
                            },
                            {
                                "text": "df",
                                "isCorrect": false
                            },
                            {
                                "text": "ssh-keygen",
                                "isCorrect": false
                            },
                            {
                                "text": "alias",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual mecanismo do kernel Linux limita quanta CPU e memória um grupo de processos pode consumir em conjunto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os cgroups (control groups)",
                                "isCorrect": true
                            },
                            {
                                "text": "O arquivo authorized_keys",
                                "isCorrect": false
                            },
                            {
                                "text": "A variável de ambiente PATH",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando scp de cópia",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um processo dentro de um container aparece como PID 1 lá dentro, mas tem outro número no host. Qual recurso do kernel cria essa visão isolada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os namespaces, que isolam o que ele vê",
                                "isCorrect": true
                            },
                            {
                                "text": "Os cgroups, que limitam quanta CPU ele usa",
                                "isCorrect": false
                            },
                            {
                                "text": "O ulimit, que conta os arquivos abertos",
                                "isCorrect": false
                            },
                            {
                                "text": "O PATH, que ordena a busca de comandos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer garantir que um conjunto de processos nunca ultrapasse 512 MB de RAM no total. O que usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um cgroup com teto de memória para o grupo",
                                "isCorrect": true
                            },
                            {
                                "text": "Um namespace de rede isolado só para o grupo",
                                "isCorrect": false
                            },
                            {
                                "text": "Um alias que reduz o uso de memória",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando du para medir a memória",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve corretamente a diferença entre cgroups e namespaces?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "cgroups limitam o quanto; namespaces isolam a visão",
                                "isCorrect": true
                            },
                            {
                                "text": "cgroups isolam a rede; namespaces limitam a CPU",
                                "isCorrect": false
                            },
                            {
                                "text": "ambos apenas contam os arquivos abertos por processo",
                                "isCorrect": false
                            },
                            {
                                "text": "cgroups substituem o SSH; namespaces, o disco",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Segurança e Linux em containers",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Endurecer o sistema (hardening)\nUm servidor exposto à internet é alvo constante. **Hardening** é o conjunto de práticas que reduz a superfície de ataque, ou seja, diminui o que um invasor pode explorar. Não é um produto, é disciplina, e alguns princípios cobrem a maior parte do caminho.\n\n**Manter atualizado**: a maioria dos ataques usa falhas já corrigidas; aplicar patches fecha essas portas. **Menor privilégio**: cada usuário e serviço recebe só a permissão de que precisa, nunca root 'por comodidade'. **Firewall**: bloquear por padrão e liberar apenas as portas necessárias. **Reduzir o que roda**: menos serviços ativos, menos alvos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Prática\", \"Por que reduz o risco\"], [\"Aplicar atualizações\", \"Fecha falhas já conhecidas e corrigidas\"], [\"Login root por SSH desabilitado\", \"Tira o alvo óbvio; exige usuário e sudo\"], [\"Autenticação só por chave\", \"Elimina senhas fracas e força bruta\"], [\"Firewall restritivo\", \"Só as portas necessárias ficam expostas\"], [\"Menor privilégio\", \"Um serviço invadido compromete menos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Firewall e o login root\nO **firewall** decide qual tráfego entra e sai por cada porta. No Linux, a base é o `iptables` (e o seu sucessor `nftables`); o `ufw` (uncomplicated firewall) é uma camada mais simples por cima, boa para o dia a dia. A regra de ouro é negar tudo por padrão e liberar só o essencial, por exemplo a porta 22 do SSH e a 443 do HTTPS.\n\nOutra medida clássica é **desabilitar o login direto como root por SSH**. O usuário root existe em todo Linux, então o nome dele já é metade do trabalho de um atacante. Ajustando `PermitRootLogin no` no servidor SSH, você obriga a entrar com um usuário nomeado e só então elevar privilégio com `sudo`, o que deixa rastro de quem fez o quê."
                    },
                    {
                        "type": "code",
                        "value": "# manter o sistema atualizado (família Debian/Ubuntu)\nsudo apt update && sudo apt upgrade\n\n# firewall: negar entrada por padrão e liberar só SSH e HTTPS\nsudo ufw default deny incoming\nsudo ufw allow 22\nsudo ufw allow 443\nsudo ufw enable\n\n# em /etc/ssh/sshd_config, desabilitar login direto como root:\n# PermitRootLogin no"
                    },
                    {
                        "type": "text",
                        "value": "## O container é um processo Linux\nCom disco, limites e segurança vistos, dá para desfazer o mistério dos containers. Um container **não é uma máquina virtual**. Ele é um processo Linux comum rodando no mesmo kernel do host, só que com a visão isolada pelos **namespaces** (PID, rede e mount próprios) e o consumo limitado pelos **cgroups**. A 'imagem' é apenas o sistema de arquivos que esse processo enxerga. Tudo o que parece mágica em uma ferramenta como o Docker são esses recursos do kernel, orquestrados.\n\nEste foi o fecho da trilha. Você partiu do sistema e do kernel, passou pelo filesystem, pela linha de comando, por permissões, processos e syscalls, por scripting e pelo sistema em operação com systemd, logs e pacotes, e chegou ao Linux aplicado a DevOps: acesso remoto, ambiente, disco, limites e segurança. O próximo passo natural é levar isso à prática com containers, orquestração e infraestrutura como código, temas que assentam exatamente sobre estas fundações de Linux."
                    },
                    {
                        "type": "quote",
                        "value": "Um container é um processo Linux isolado por namespaces e limitado por cgroups, no mesmo kernel do host. Entender Linux é entender o que roda por baixo de todo container."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual prática de hardening reduz o risco ao exigir o uso de um usuário nomeado com sudo, em vez de entrar direto como root?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Desabilitar o login root por SSH",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o limite do ulimit",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar todos os serviços como root",
                                "isCorrect": false
                            },
                            {
                                "text": "Abrir todas as portas no firewall",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve um firewall como o ufw ou o iptables em um servidor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Filtrar qual tráfego entra e sai do servidor",
                                "isCorrect": true
                            },
                            {
                                "text": "Medir quanto espaço em disco ainda resta livre",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerar os pares de chaves usados pelo SSH",
                                "isCorrect": false
                            },
                            {
                                "text": "Listar as variáveis de ambiente da sessão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um container é descrito como 'um processo Linux isolado', e não como uma máquina virtual?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Roda no mesmo kernel do host, isolado por namespaces",
                                "isCorrect": true
                            },
                            {
                                "text": "Emula um hardware completo, com seu próprio kernel dedicado",
                                "isCorrect": false
                            },
                            {
                                "text": "É apenas uma conexão SSH que ficou aberta no host",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui o kernel do host enquanto está em execução",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Seguindo o princípio de menor privilégio, como um serviço web deve rodar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Com um usuário restrito, só com o que precisa",
                                "isCorrect": true
                            },
                            {
                                "text": "Como root, para evitar qualquer erro de permissão",
                                "isCorrect": false
                            },
                            {
                                "text": "Com o login root por SSH sempre habilitado",
                                "isCorrect": false
                            },
                            {
                                "text": "Com o firewall desligado para não bloquear nada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao configurar o firewall de um servidor web, qual abordagem segue a boa prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Negar tudo por padrão e abrir só o necessário",
                                "isCorrect": true
                            },
                            {
                                "text": "Liberar todas as portas e ir bloqueando caso a caso",
                                "isCorrect": false
                            },
                            {
                                "text": "Abrir apenas a porta 22 e nenhuma porta web",
                                "isCorrect": false
                            },
                            {
                                "text": "Desligar o firewall e confiar só na senha",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    }
] as unknown as Modulo[];

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
    console.log(
        "Seed concluído: " + MODULOS.length + " módulos, " + totalAulas + " aulas, " + totalQuestoes + " questões.",
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
