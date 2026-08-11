import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Linux e Linha de Comando, terceira trilha do roadmap de DevOps.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a escolha do
 * comando no cenário; as cartas ficam com as listas fechadas, os nomes por
 * extenso e os detalhes de sintaxe que escapam depois de uma leitura.
 */
export const linuxELinhaDeComando: CartasDaTrilha = {
    trilha: "Linux e Linha de Comando",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quem criou o kernel Linux, e em que ano?",
                        verso: "Linus Torvalds, em 1991, e milhares seguem desenvolvendo.",
                    },
                    {
                        frente: "Que cinco recursos o kernel gerencia?",
                        verso: "Processos, memória, arquivos, hardware e rede.",
                    },
                    {
                        frente: "Que peças do userland clássico o projeto GNU fornece?",
                        verso: "O shell Bash, o coreutils com ls, cat e cp, e o compilador GCC.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que quatro coisas uma distribuição reúne?",
                        verso: "O kernel, os pacotes, um gerenciador e as ferramentas de sistema.",
                    },
                    {
                        frente: "Que formato de pacote cada família usa?",
                        verso: "deb no Debian, rpm no Red Hat e um próprio no Arch.",
                    },
                    {
                        frente: "O que quase não muda entre distribuições diferentes?",
                        verso: "O kernel: por isso um script em Bash roda igual em todas.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a sigla FHS significa, e o que ela define?",
                        verso: "Filesystem Hierarchy Standard: o que vai em cada diretório.",
                    },
                    {
                        frente: "Que diretório o root usa, em vez de ficar em /home?",
                        verso: "O /root, à parte das pastas dos usuários comuns.",
                    },
                    {
                        frente: "Como se chama conectar um sistema de arquivos à árvore?",
                        verso: "Montar; o diretório onde ele aparece é o ponto de montagem.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que dois targets do systemd substituem os antigos runlevels?",
                        verso: "O multi-user, sem gráfico, e o graphical, com a interface.",
                    },
                    {
                        frente: "Que firmware moderno substituiu a BIOS?",
                        verso: "A UEFI, que testa o hardware e acha o disco de boot.",
                    },
                    {
                        frente: "Que target é o típico num servidor?",
                        verso: "O multi-user, modo texto com rede e serviços, sem gráfico.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em que número os UIDs de usuários humanos costumam começar?",
                        verso: "Em 1000; o root é sempre o UID zero.",
                    },
                    {
                        frente: "Que três riscos trabalhar logado como root traz?",
                        verso: "Erro de digitação apaga tudo, script roda com poder total e some o rastro.",
                    },
                    {
                        frente: "Que dois arquivos guardam grupos e senhas, além do passwd?",
                        verso: "O group, legível por todos, e o shadow, só do root.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que a sigla bash quer dizer?",
                        verso: "Bourne Again Shell, o interpretador padrão na maioria dos servidores.",
                    },
                    {
                        frente: "Que caractere no fim do prompt distingue root de usuário comum?",
                        verso: "A cerquilha para o root e o cifrão para o usuário comum.",
                    },
                    {
                        frente: "De que dois jeitos se consulta a ajuda de um comando?",
                        verso: "Com o man, que abre o manual, ou com a opção de ajuda.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três atalhos de caminho aparecem o tempo todo?",
                        verso: "O ponto para o atual, dois pontos para o pai e o til para o home.",
                    },
                    {
                        frente: "Que comando move e renomeia, sendo o mesmo?",
                        verso: "O mv: mover e renomear são a mesma operação.",
                    },
                    {
                        frente: "O que a opção de árvore do mkdir faz?",
                        verso: "Cria a árvore inteira de diretórios de uma vez.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantas linhas o head e o tail mostram por padrão?",
                        verso: "Dez, ajustáveis com a opção de número de linhas.",
                    },
                    {
                        frente: "Por que o less abre um log gigante na hora?",
                        verso: "Ele não carrega o arquivo inteiro na memória.",
                    },
                    {
                        frente: "Que dois modos o vim usa, e que confundem no começo?",
                        verso: "O normal, para comandos, e o de inserção, para digitar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que números identificam os três fluxos padrão?",
                        verso: "Zero na entrada, um na saída e dois na saída de erro.",
                    },
                    {
                        frente: "Que vantagem a separação entre stdout e stderr traz?",
                        verso: "Guardar o resultado num arquivo e deixar os erros na tela.",
                    },
                    {
                        frente: "O que o pipe dispensa ao ligar dois comandos?",
                        verso: "O arquivo no meio: a saída vira entrada direto.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três critérios o find combina com mais frequência?",
                        verso: "Nome com curinga, tipo de arquivo ou diretório, e tamanho.",
                    },
                    {
                        frente: "Por que o uniq quase sempre vem depois de um sort?",
                        verso: "Ele só junta as repetidas que estão coladas uma na outra.",
                    },
                    {
                        frente: "O que a dupla clássica de ordenar e contar entrega?",
                        verso: "Quantas vezes cada linha repetida aparece no arquivo.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que dez caracteres o ls -l mostra no começo da linha?",
                        verso: "Um do tipo e três blocos de rwx: dono, grupo e outros.",
                    },
                    {
                        frente: "Como se soma o valor octal de cada bloco de permissão?",
                        verso: "Leitura quatro, escrita dois e execução um, somados no bloco.",
                    },
                    {
                        frente: "O que a permissão de execução significa num diretório?",
                        verso: "Entrar nele e acessar os arquivos que estão dentro.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que ordem o Linux segue ao escolher o bloco de permissão?",
                        verso: "Dono, senão grupo, senão outros; nunca os três somados.",
                    },
                    {
                        frente: "Que comando mostra UID, GID e os grupos de um usuário?",
                        verso: "O id; o groups mostra só a lista de grupos.",
                    },
                    {
                        frente: "O que a opção de acréscimo do usermod evita?",
                        verso: "Substituir a lista de grupos em vez de acrescentar a ela.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que comando edita o sudoers, e por quê?",
                        verso: "O visudo: ele confere a sintaxe antes de salvar e evita trancar tudo.",
                    },
                    {
                        frente: "Que grupos costumam dar direito a sudo nas distros?",
                        verso: "O sudo ou o wheel, conforme a família da distribuição.",
                    },
                    {
                        frente: "Que diferença de escopo separa su de sudo?",
                        verso: "O su abre uma sessão inteira; o sudo roda um comando por vez.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que campo guarda o PID do processo pai?",
                        verso: "O PPID, que liga o filho a quem o criou.",
                    },
                    {
                        frente: "O que o init faz quando um pai morre antes do filho?",
                        verso: "Adota o órfão: ele é o ancestral de todos os processos.",
                    },
                    {
                        frente: "Que diferença separa o ps do top e do htop?",
                        verso: "O ps tira uma foto do momento; os outros atualizam sozinhos.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que sinais o Ctrl mais C e o Ctrl mais Z enviam?",
                        verso: "O de interromper e o de suspender, respectivamente.",
                    },
                    {
                        frente: "Para que muitos serviços usam o SIGHUP?",
                        verso: "Como pedido para recarregar a configuração sem reiniciar.",
                    },
                    {
                        frente: "Que faixa a niceness usa, e quem sobe a prioridade?",
                        verso: "De menos vinte a dezenove; só o root consegue subir.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que quatro subsistemas do kernel a aula separa?",
                        verso: "Escalonador, gerência de memória, sistema de arquivos e drivers.",
                    },
                    {
                        frente: "Em que unidade o kernel mapeia a memória virtual na física?",
                        verso: "Em páginas, que podem ir pro swap quando a RAM aperta.",
                    },
                    {
                        frente: "Que formatos diferentes convivem sob a mesma árvore?",
                        verso: "ext4 e XFS, por exemplo, padronizados por uma camada do kernel.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que anéis do x86 correspondem aos dois espaços?",
                        verso: "O anel zero no kernel e o anel três no usuário.",
                    },
                    {
                        frente: "Quem impõe a barreira entre os dois espaços?",
                        verso: "A própria CPU, com os seus modos de privilégio.",
                    },
                    {
                        frente: "Que dois caminhos controlados levam ao modo kernel?",
                        verso: "Uma chamada de sistema ou uma interrupção de hardware.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que trio clássico do Unix cria e roda um programa?",
                        verso: "fork para duplicar, exec para trocar o programa e wait para esperar.",
                    },
                    {
                        frente: "O que uma syscall devolve no erro, e onde vai o motivo?",
                        verso: "Devolve menos um e põe o código na variável de erro.",
                    },
                    {
                        frente: "Que biblioteca dispara a syscall no lugar do programador?",
                        verso: "A libc, que arruma os argumentos e ainda trata o retorno.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que opção do strace segue os processos filhos?",
                        verso: "A de follow, que acompanha o que o fork criar.",
                    },
                    {
                        frente: "Que formato cada linha do strace segue?",
                        verso: "Nome da syscall, argumentos entre parênteses e o retorno.",
                    },
                    {
                        frente: "O que o ltrace mostra, ao contrário do strace?",
                        verso: "As chamadas a funções de biblioteca, não as ao kernel.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Por que os arquivos de /proc costumam ter tamanho zero?",
                        verso: "O conteúdo é gerado sob demanda, não fica gravado em disco.",
                    },
                    {
                        frente: "Para onde o atalho /proc/self sempre aponta?",
                        verso: "Para o processo que está fazendo a leitura naquele momento.",
                    },
                    {
                        frente: "Que comando lê e escreve os parâmetros de /proc/sys?",
                        verso: "O sysctl, com nomes por ponto que espelham o caminho.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Onde exatamente o shebang precisa ficar no arquivo?",
                        verso: "Na primeira linha, logo no começo, sem espaço antes.",
                    },
                    {
                        frente: "O que acontece quando o script não tem shebang?",
                        verso: "O sistema usa o shell padrão, que nem sempre é o Bash.",
                    },
                    {
                        frente: "Que forma de rodar dispensa o chmod, e o que ela ignora?",
                        verso: "Chamar o interpretador direto; aí o shebang é ignorado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que a atribuição de variável não pode ter espaços em volta?",
                        verso: "Com espaço, o Bash trata o nome como se fosse um comando.",
                    },
                    {
                        frente: "O que o nome do script e a lista completa representam?",
                        verso: "O primeiro é o próprio script; a outra traz todos os argumentos.",
                    },
                    {
                        frente: "Que convenção os nomes de variáveis de ambiente seguem?",
                        verso: "Maiúsculas, como HOME, USER e PATH.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que espaços são obrigatórios nos testes entre colchetes?",
                        verso: "Os internos: sem eles o teste nem é reconhecido.",
                    },
                    {
                        frente: "Que vantagens o teste duplo do Bash tem sobre o simples?",
                        verso: "Entende os operadores lógicos e lida melhor com variável vazia.",
                    },
                    {
                        frente: "Que exit code significa sucesso, e o que o if faz com ele?",
                        verso: "O zero; o if roda o then quando a condição termina em zero.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que faixa o return de uma função aceita, e o que ele define?",
                        verso: "De zero a 255, e ele define o exit code, não um texto.",
                    },
                    {
                        frente: "Como uma função devolve texto, já que o return não serve?",
                        verso: "Com echo, capturado por quem chama com a substituição.",
                    },
                    {
                        frente: "Qual é a diferença entre break e continue num loop?",
                        verso: "O break encerra o loop; o continue pula só a volta atual.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a opção de pipefail acrescenta às outras duas?",
                        verso: "Faz o pipe falhar se qualquer etapa dele falhar, não só a última.",
                    },
                    {
                        frente: "Onde a linha de proteção do set costuma ficar?",
                        verso: "Logo depois do shebang, no começo do script.",
                    },
                    {
                        frente: "Em que índice um array do Bash começa?",
                        verso: "No zero, e as chaves são necessárias ao mexer com índice.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que comando sobe o serviço e o habilita de uma vez?",
                        verso: "O enable com a opção de agora, que faz as duas coisas.",
                    },
                    {
                        frente: "Que outros tipos de unit existem, além do serviço?",
                        verso: "socket, timer, mount e target, cada um com a sua extensão.",
                    },
                    {
                        frente: "Que diretório de unit tem prioridade sobre o do pacote?",
                        verso: "O do administrador, em /etc/systemd/system.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o journald recolhe automaticamente de cada serviço?",
                        verso: "A saída padrão e a de erro, mais o kernel e o boot.",
                    },
                    {
                        frente: "Em que formato o journal é guardado?",
                        verso: "Binário e estruturado, consultado só pelo journalctl.",
                    },
                    {
                        frente: "Que arquivos guardam autenticação em cada família?",
                        verso: "O auth.log no Debian e o secure no RHEL e derivados.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que quatro ganhos o gerenciador de pacotes entrega?",
                        verso: "Resolve dependência, atualiza em bloco, verifica assinatura e remove bem.",
                    },
                    {
                        frente: "Onde a lista de repositórios fica em cada família?",
                        verso: "Em sources.list e no diretório dele no apt; em yum.repos.d no dnf.",
                    },
                    {
                        frente: "O que o gerenciador faz com pacote de assinatura errada?",
                        verso: "Recusa: cada repositório é assinado com uma chave.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que faixa o campo de dia da semana usa no cron?",
                        verso: "De zero a sete, com zero e sete valendo domingo.",
                    },
                    {
                        frente: "Que opção do crontab apaga tudo sem pedir confirmação?",
                        verso: "A de remover, que apaga a crontab inteira de uma vez.",
                    },
                    {
                        frente: "Que vantagens os timers do systemd têm sobre o cron?",
                        verso: "Log no journal, lista dos próximos disparos e execução perdida coberta.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que letras compõem a combinação mais útil do ss?",
                        verso: "TCP, escutando, números em vez de nomes, e o processo.",
                    },
                    {
                        frente: "Que utilitários antigos o iproute2 e o ss substituem?",
                        verso: "O ifconfig e o route, e o ss substitui o netstat.",
                    },
                    {
                        frente: "Que fonte é consultada antes do DNS na resolução de nomes?",
                        verso: "O arquivo /etc/hosts, uma tabela local e estática.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Em que porta o serviço de SSH escuta por padrão?",
                        verso: "Na 22, atendida pelo sshd no lado do servidor.",
                    },
                    {
                        frente: "Que protocolo antigo o SSH substituiu, e por quê?",
                        verso: "O Telnet, que mandava tudo em texto puro pela rede.",
                    },
                    {
                        frente: "Que comando gera o par de chaves, e onde ele guarda?",
                        verso: "O ssh-keygen, dentro da pasta .ssh do usuário.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que separador o PATH usa, e em que ordem ele é lido?",
                        verso: "Dois pontos, e o shell percorre os diretórios na ordem.",
                    },
                    {
                        frente: "Que comando mostra qual arquivo o shell escolheu de fato?",
                        verso: "O which, que revela o caminho do executável usado.",
                    },
                    {
                        frente: "Que arquivo roda no shell de login, e qual no interativo?",
                        verso: "O profile no login e o bashrc no interativo sem login.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que arquivo descreve as montagens que valem a cada boot?",
                        verso: "O /etc/fstab, lido durante a subida do sistema.",
                    },
                    {
                        frente: "De que duas formas um disco pode encher?",
                        verso: "Acabando os blocos de dados ou acabando os inodes.",
                    },
                    {
                        frente: "Que opção do df revela o uso de inodes?",
                        verso: "A de inodes, útil quando sobra espaço e nada grava.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que dois valores todo limite do ulimit tem?",
                        verso: "O soft, ajustável pelo usuário, e o hard, só pelo administrador.",
                    },
                    {
                        frente: "Que quatro namespaces a aula cita?",
                        verso: "O de PID, o de rede, o de mount e o de usuários.",
                    },
                    {
                        frente: "Que diferença separa cgroups de namespaces?",
                        verso: "cgroups limitam quanto se usa; namespaces limitam o que se vê.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que quatro princípios cobrem a maior parte do hardening?",
                        verso: "Manter atualizado, menor privilégio, firewall e reduzir o que roda.",
                    },
                    {
                        frente: "Que camadas de firewall o Linux oferece?",
                        verso: "iptables e o sucessor nftables, com o ufw simplificando por cima.",
                    },
                    {
                        frente: "O que a imagem de um container é, no fim das contas?",
                        verso: "Só o sistema de arquivos que aquele processo enxerga.",
                    },
                ],
            },
        },
    },
};
