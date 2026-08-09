import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Docker e Containers, oitava trilha do roadmap de Back-end.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a leitura de
 * comando e de cenário; as cartas ficam com as definições, as listas fechadas
 * de instrução e os detalhes de sintaxe que escapam depois de uma leitura.
 */
export const dockerEContainers: CartasDaTrilha = {
    trilha: "Docker e Containers",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que cinco diferenças costumam separar dev de produção?",
                        verso: "Versão do Node e do sistema, pacote global, variável e versão dos serviços.",
                    },
                    {
                        frente: "Qual é o problema real por trás do roteiro manual de instalação?",
                        verso: "Garantir a mesma combinação de versões em todas as máquinas.",
                    },
                    {
                        frente: "Que pacote esquecido quebra o deploy com frequência?",
                        verso: "O instalado com npm install global, que não está no package.json.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que dois mecanismos do Linux sustentam o container?",
                        verso: "Namespaces isolam o que ele enxerga; cgroups limitam CPU e memória.",
                    },
                    {
                        frente: "O que o container é, do ponto de vista do host?",
                        verso: "Só mais um processo do Linux, usando o mesmo kernel, isolado.",
                    },
                    {
                        frente: "Quando um container para sozinho?",
                        verso: "Quando o processo principal dele termina de rodar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que peso típico separa um container de uma máquina virtual?",
                        verso: "Poucas centenas de MB contra vários GB com o sistema inteiro.",
                    },
                    {
                        frente: "Que peça virtualiza o hardware numa máquina virtual?",
                        verso: "O hypervisor, que roda um sistema operacional completo dentro.",
                    },
                    {
                        frente: "Quando a máquina virtual continua fazendo mais sentido?",
                        verso: "Com isolamento mais forte entre clientes ou kernel diferente do host.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que analogia de programação explica imagem e container?",
                        verso: "A imagem é a classe; o container é o objeto instanciado dela.",
                    },
                    {
                        frente: "O que a imagem contém, exatamente?",
                        verso: "Código, runtime, bibliotecas, dependências e o comando padrão.",
                    },
                    {
                        frente: "Como se muda uma imagem já construída?",
                        verso: "Não se muda: gera-se uma nova, porque ela é imutável.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre container e Docker?",
                        verso: "Container é conceito do sistema; Docker é a ferramenta que o torna prático.",
                    },
                    {
                        frente: "Que três peças o Docker entrega?",
                        verso: "O motor, a linha de comando e o formato de imagem com o Docker Hub.",
                    },
                    {
                        frente: "O que a imagem substitui no onboarding de um dev novo?",
                        verso: "O passo a passo manual, que vira algo executável.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que seis instruções cobrem quase toda imagem de API Node?",
                        verso: "FROM, WORKDIR, COPY, RUN, EXPOSE e CMD.",
                    },
                    {
                        frente: "Que tipo de arquivo o Dockerfile é?",
                        verso: "Texto simples, sem extensão, com uma instrução por linha.",
                    },
                    {
                        frente: "O que o EXPOSE faz de fato?",
                        verso: "Só documenta a porta; quem publica é a flag de porta do run.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que forma do CMD é recomendada, e por quê?",
                        verso: "A exec, escrita como lista: roda o processo direto, sem shell.",
                    },
                    {
                        frente: "O que o ponto significa no COPY do package.json?",
                        verso: "A pasta atual da imagem, que é o WORKDIR definido antes.",
                    },
                    {
                        frente: "Que seis passos o Dockerfile de uma API Node executa?",
                        verso: "Parte do Node, entra na pasta, instala, copia o código, documenta e roda.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que tag o docker build usa quando não se informa nenhuma?",
                        verso: "A latest, aplicada por padrão ao nome da imagem.",
                    },
                    {
                        frente: "O que o ponto no fim do docker build representa?",
                        verso: "O contexto: a pasta enviada ao daemon e de onde o COPY copia.",
                    },
                    {
                        frente: "De onde o docker build precisa ser executado?",
                        verso: "Da raiz do projeto, onde estão o Dockerfile e o código.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é a ordem da sintaxe do mapeamento de porta?",
                        verso: "Porta do host, dois pontos, porta do container.",
                    },
                    {
                        frente: "Que flag roda o container em segundo plano?",
                        verso: "A de detached, junto com o mapeamento de porta.",
                    },
                    {
                        frente: "Por que a porta do container não fica acessível sozinha?",
                        verso: "Cada container roda isolado, com a própria rede.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que instruções do Dockerfile geram uma camada?",
                        verso: "As que mexem no sistema de arquivos: FROM, COPY e RUN.",
                    },
                    {
                        frente: "O que o Docker compara pra decidir se reaproveita o cache?",
                        verso: "O hash da camada contra a instrução e o que ela usa.",
                    },
                    {
                        frente: "O que acontece com as camadas depois de uma invalidada?",
                        verso: "Todas as seguintes também são refeitas, em cascata.",
                    },
                ],
            },
        },
    },
};
