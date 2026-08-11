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
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que quatro problemas o roteiro manual de docker run tem?",
                        verso: "Ordem frágil, flags demais, nada documentado e refazer é penoso.",
                    },
                    {
                        frente: "Que quatro passos o roteiro manual exige, na ordem?",
                        verso: "Criar a rede, subir o banco, subir o cache e por fim a API.",
                    },
                    {
                        frente: "O que o Compose substitui, em uma frase?",
                        verso: "A sequência de docker run por um arquivo declarativo único.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que sete chaves configuram um service no Compose?",
                        verso: "image ou build, ports, environment, volumes, depends_on e networks.",
                    },
                    {
                        frente: "Que formato e nome o arquivo do Compose costuma ter?",
                        verso: "Um YAML chamado docker-compose.yml, na raiz do projeto.",
                    },
                    {
                        frente: "O que significa o Compose ser declarativo?",
                        verso: "Você diz o que quer, e ele cria, conecta e sobe tudo sozinho.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que portas os três services da stack usam?",
                        verso: "3000 na API, 5432 no Postgres e 6379 no Redis.",
                    },
                    {
                        frente: "Onde os volumes nomeados são declarados no arquivo?",
                        verso: "Numa chave volumes no nível raiz, fora de qualquer service.",
                    },
                    {
                        frente: "O que o depends_on evita, e o que ele não elimina?",
                        verso: "Evita a ordem errada; não elimina o erro de conexão recusada.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que seis coisas o docker compose up faz de uma vez?",
                        verso: "Lê o arquivo, constrói, cria rede e volumes, sobe na ordem e junta logs.",
                    },
                    {
                        frente: "O que o up sozinho não percebe depois de mudar o Dockerfile?",
                        verso: "Que a imagem mudou: precisa da flag de build pra reconstruir.",
                    },
                    {
                        frente: "Quando rodar o up sem o modo desanexado ajuda?",
                        verso: "Só quando você está depurando o começo, com os logs na tela.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que peça resolve o nome do service dentro da rede?",
                        verso: "Um DNS interno do Compose, que aponta pro IP atual do container.",
                    },
                    {
                        frente: "Por que o localhost não serve entre containers?",
                        verso: "Cada um tem o próprio loopback, que aponta pra ele mesmo.",
                    },
                    {
                        frente: "O que acontece com o nome se o container reiniciar com outro IP?",
                        verso: "Continua funcionando: a resolução por nome acompanha o IP novo.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "O que muda na connection string ao containerizar a API?",
                        verso: "Só o host, de localhost pro nome do service; o resto é igual.",
                    },
                    {
                        frente: "Quando localhost faria sentido na connection string?",
                        verso: "Só se a API rodasse fora do compose, direto na máquina.",
                    },
                    {
                        frente: "O que o ioredis precisa mudar pra conectar no Redis do compose?",
                        verso: "Só o host da URL, de localhost pra redis; nada no código.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que o Postgres demora a aceitar conexão ao subir?",
                        verso: "Inicializa o diretório de dados e cria o banco antes de abrir a porta.",
                    },
                    {
                        frente: "Que duas defesas cobrem o intervalo até o banco ficar pronto?",
                        verso: "Retry na conexão da app e health check no Compose; se complementam.",
                    },
                    {
                        frente: "Que diferença o depends_on simples não enxerga?",
                        verso: "Entre container iniciado e processo lá dentro pronto pra uso.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que quatro parâmetros um healthcheck declara?",
                        verso: "test, interval, timeout e retries, no service do compose.",
                    },
                    {
                        frente: "Que código de saída marca o container como saudável?",
                        verso: "O zero: qualquer outro conta como falha na checagem.",
                    },
                    {
                        frente: "Que forma do depends_on espera o service ficar saudável?",
                        verso: "A longa, com a condição de service_healthy no lugar da lista.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que entrada extra protege o node_modules no compose de dev?",
                        verso: "Um mount só pra pasta do node_modules, por cima do bind mount.",
                    },
                    {
                        frente: "O que o compose de dev sobrescreve, além de montar o código?",
                        verso: "O comando, trocando o CMD por um watcher tipo o nodemon.",
                    },
                    {
                        frente: "Como se aponta o compose para o arquivo de produção?",
                        verso: "Com a flag de arquivo, indicando o docker-compose de produção.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que causa o erro de nome de host não encontrado indica?",
                        verso: "O nome do service está errado ou ele ficou fora da rede.",
                    },
                    {
                        frente: "Que causa o erro de banco inexistente aponta?",
                        verso: "O POSTGRES_DB e o banco da connection string não batem.",
                    },
                    {
                        frente: "O que o logs sem nome de service mostra?",
                        verso: "Todos misturados, com cada linha prefixada por quem gerou.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que cada FROM começa num Dockerfile multi-stage?",
                        verso: "Uma etapa nova, que pode ser nomeada com AS.",
                    },
                    {
                        frente: "Que três coisas sobram numa imagem de etapa única?",
                        verso: "As devDependencies, o código-fonte original e o cache de instalação.",
                    },
                    {
                        frente: "Qual etapa de um multi-stage vira a imagem de verdade?",
                        verso: "Só a final; as anteriores servem de apoio e não sobram.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que tamanhos aproximados as três bases do Node têm?",
                        verso: "Cerca de 1,1 GB na completa, 200 MB na slim e 150 MB na alpine.",
                    },
                    {
                        frente: "Por que instalar compilador na etapa de build não pesa depois?",
                        verso: "Ele fica naquela etapa, que não vira a imagem publicada.",
                    },
                    {
                        frente: "Que passo além do alpine existe em imagem base?",
                        verso: "As distroless: só o runtime e a app, sem shell nem gerenciador.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que comandos criam o usuário de sistema numa imagem alpine?",
                        verso: "O addgroup e o adduser em modo de sistema, sem senha nem privilégio.",
                    },
                    {
                        frente: "A partir do USER, o que passa a rodar com aquele usuário?",
                        verso: "Tudo que vem depois no Dockerfile, incluindo o CMD.",
                    },
                    {
                        frente: "Por que apagar um segredo numa instrução posterior não resolve?",
                        verso: "A camada anterior fica na imagem e o docker history revela.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o docker push envia de fato ao registry?",
                        verso: "Só as camadas que faltam lá, aproveitando o que já existe.",
                    },
                    {
                        frente: "Por que publicar uma tag de versão além da latest?",
                        verso: "Sem ela ninguém sabe qual build roda nem como voltar atrás.",
                    },
                    {
                        frente: "Que fluxo leva a imagem da sua máquina ao servidor?",
                        verso: "Construir e testar, taggear, autenticar, dar push e depois pull.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o Kubernetes faz em relação ao Docker?",
                        verso: "Não substitui: gerencia containers rodando em várias máquinas.",
                    },
                    {
                        frente: "Que quatro diferenças separam VPS de serviço gerenciado?",
                        verso: "Quem administra, como se entrega, escala automática e controle.",
                    },
                    {
                        frente: "O que um pipeline automatiza do que foi feito na mão aqui?",
                        verso: "Build, tag e push a cada envio de código, sem depender de ninguém.",
                    },
                ],
            },
        },
    },
};
