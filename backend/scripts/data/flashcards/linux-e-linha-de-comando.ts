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
    },
};
