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
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que as flags de interativo e terminal do docker exec fazem?",
                        verso: "Uma mantém a entrada aberta e a outra aloca um terminal.",
                    },
                    {
                        frente: "Que sinal o docker stop envia antes de forçar?",
                        verso: "O SIGTERM, pedindo que o processo encerre com calma.",
                    },
                    {
                        frente: "Como remover um container que ainda está rodando?",
                        verso: "Parando antes, ou usando a flag de força no próprio rm.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a tag latest realmente significa?",
                        verso: "Só a tag que aquele projeto chamou de latest naquele momento.",
                    },
                    {
                        frente: "Por que travar a versão da imagem base em vez de usar latest?",
                        verso: "O latest muda com o tempo e quebra o roda igual em qualquer lugar.",
                    },
                    {
                        frente: "O que o docker rmi afeta, e o que ele não afeta?",
                        verso: "Só a imagem local; o registry continua com ela publicada.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três coisas uma imagem oficial garante?",
                        verso: "Curadoria conjunta, documentação padronizada e correção de segurança.",
                    },
                    {
                        frente: "Que outros registries existem além do Docker Hub?",
                        verso: "O do GitHub, o de cada provedor de nuvem e registries privados.",
                    },
                    {
                        frente: "Quando escrever um Dockerfile próprio faz sentido?",
                        verso: "Pra sua aplicação, que é única; não pra infra padrão.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três problemas o COPY sem .dockerignore causa?",
                        verso: "Imagem maior, build mais lento e segredo dentro de uma camada.",
                    },
                    {
                        frente: "Que sintaxe o .dockerignore usa?",
                        verso: "Uma linha por padrão, cerquilha de comentário, asterisco e exceção.",
                    },
                    {
                        frente: "Quando o Docker lê o .dockerignore?",
                        verso: "Antes de montar o contexto, excluindo o que casar com os padrões.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três formas existem de passar configuração ao container?",
                        verso: "A flag por variável, o arquivo de env, e o ENV no Dockerfile.",
                    },
                    {
                        frente: "Quando o ENV do Dockerfile é a escolha certa?",
                        verso: "Pra valor padrão fixo, igual em toda imagem, e raramente segredo.",
                    },
                    {
                        frente: "Onde o arquivo de variáveis nunca pode entrar?",
                        verso: "No repositório nem na imagem: fica no gitignore e no dockerignore.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que camada o docker run acrescenta por cima da imagem?",
                        verso: "Uma camada gravável, exclusiva daquele container.",
                    },
                    {
                        frente: "A camada gravável é compartilhada entre containers da imagem?",
                        verso: "Não: cada container tem a sua, e a imagem segue só leitura.",
                    },
                    {
                        frente: "Que comandos preservam os dados gravados no container?",
                        verso: "stop, start e restart; só o rm apaga a camada gravável.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é o formato do -v ao montar um volume nomeado?",
                        verso: "Nome do volume, dois pontos e o caminho dentro do container.",
                    },
                    {
                        frente: "Precisa criar o volume antes de montá-lo?",
                        verso: "Não: o Docker cria na hora do run se ele ainda não existir.",
                    },
                    {
                        frente: "Que comando remove todos os volumes sem container usando?",
                        verso: "O volume prune, que limpa os que não estão em uso.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o Postgres faz ao achar arquivos de dados no caminho?",
                        verso: "Usa esses arquivos em vez de criar um banco vazio do zero.",
                    },
                    {
                        frente: "O que garante a continuidade dos dados entre containers?",
                        verso: "O volume montado no mesmo caminho pelos dois containers.",
                    },
                    {
                        frente: "O que acontece com bind mount numa pasta vazia do host?",
                        verso: "O banco novo nasce ali e persiste enquanto a pasta existir.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que caminho o bind mount aponta, ao contrário do volume?",
                        verso: "Direto pra uma pasta do host, escolhida por você.",
                    },
                    {
                        frente: "Que pegadinha o bind mount cria com o node_modules?",
                        verso: "O do host sobrescreve o da imagem; resolve com um segundo mount.",
                    },
                    {
                        frente: "Que ferramenta completa o hot reload dentro do container?",
                        verso: "Uma de reload, tipo o nodemon, reiniciando a cada alteração.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quem gerencia cada um dos dois tipos de montagem?",
                        verso: "O Docker gerencia o volume; o bind mount é pasta sua no host.",
                    },
                    {
                        frente: "Que três cuidados os dois tipos de montagem pedem?",
                        verso: "Não mexer na área do Docker, não versionar dados e olhar permissão.",
                    },
                    {
                        frente: "Por que a pasta de dados do volume não entra no Git?",
                        verso: "Os dados mudam a cada segundo e não fazem sentido num commit.",
                    },
                ],
            },
        },
    },
};
