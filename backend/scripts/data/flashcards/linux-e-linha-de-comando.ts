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
    },
};
