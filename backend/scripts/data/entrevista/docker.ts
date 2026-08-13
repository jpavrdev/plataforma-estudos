import type { TopicoDeEntrevista } from "../../seed-entrevista.ts";

/**
 * Perguntas de entrevista de Docker.
 *
 * A pergunta sobre a importância do Docker em integração e entrega contínuas veio de
 * uma entrevista real, com a redação preservada. Em volta dela ficam as companheiras
 * que a conversa encadeia: build reproduzível, promover o mesmo artefato entre
 * ambientes, e o que muda quando o container entra num orquestrador.
 */
export const docker: TopicoDeEntrevista = {
    slug: "docker",
    nome: "Docker",
    position: 2,
    perguntas: {
        estagio: [
            {
                frente: "O que é um container e como ele difere de uma máquina virtual?",
                verso: "É um processo isolado usando o núcleo do sistema hospedeiro, com sistema de arquivos e rede próprios. A máquina virtual carrega um sistema operacional inteiro por cima de um hipervisor. Por isso o container sobe em segundos e ocupa megabytes, e a máquina virtual leva minutos e gigabytes.",
            },
            {
                frente: "Qual a diferença entre uma imagem e um container?",
                verso: "A imagem é o pacote parado, com o sistema de arquivos e a instrução do que executar. O container é a imagem em execução, com uma camada de escrita própria por cima. A mesma imagem gera quantos containers você quiser, e eles não compartilham essa camada.",
            },
            {
                frente: "O que o Dockerfile descreve?",
                verso: "A receita da imagem: de qual base partir, o que copiar, o que instalar e qual processo executar. Cada instrução vira uma camada, e o resultado é sempre o mesmo conjunto de passos, o que torna a construção repetível em qualquer máquina.",
            },
            {
                frente: "Qual a diferença entre RUN, CMD e ENTRYPOINT?",
                verso: "RUN executa durante a construção e o resultado vira camada da imagem. CMD e ENTRYPOINT definem o que roda quando o container sobe. ENTRYPOINT é o comando fixo, e CMD são os argumentos padrão, que quem executa pode substituir na linha de comando.",
            },
            {
                frente: "O que é uma camada de imagem?",
                verso: "O resultado de uma instrução do Dockerfile, empilhado sobre a anterior e imutável. Camadas iguais são compartilhadas entre imagens e reaproveitadas no cache. Apagar um arquivo numa camada seguinte não o remove da anterior, então segredo copiado continua lá.",
            },
            {
                frente: "Para que serve o arquivo .dockerignore?",
                verso: "Excluir do contexto enviado ao construtor o que não deve ir para a imagem, como pasta de dependências local, arquivos de build e a pasta do git. Reduz o tamanho do contexto, acelera a construção e evita copiar segredo por acidente.",
            },
            {
                frente: "Qual a diferença entre EXPOSE e publicar uma porta?",
                verso: "EXPOSE é documentação na imagem, dizendo em qual porta o processo escuta, e não abre nada sozinho. Publicar, com a opção de porta na execução, é o que liga a porta do hospedeiro à do container e torna o serviço alcançável de fora.",
            },
            {
                frente: "O que acontece com os dados quando o container é removido?",
                verso: "Somem junto com a camada de escrita dele, que é descartada. Container é descartável por natureza. O que precisa sobreviver vai num volume, que existe fora do ciclo de vida do container e pode ser montado por outro depois.",
            },
            {
                frente: "O que é um volume e quando você usaria um?",
                verso: "Um espaço de armazenamento gerenciado pelo Docker, montado num caminho dentro do container e independente dele. Serve para dado de banco, upload e qualquer coisa que precise sobreviver a uma nova versão da imagem.",
            },
            {
                frente: "Como você olharia o que um container está registrando?",
                verso: "Pelo comando de logs, que mostra o que o processo escreveu na saída padrão e na de erro. É por isso que aplicação em container escreve log na saída padrão em vez de em arquivo: quem coleta é a plataforma, e não a aplicação.",
            },
            {
                frente: "O que é uma tag de imagem, e qual o problema de usar latest?",
                verso: "É o rótulo que identifica uma versão da imagem. O latest não significa mais recente por regra, é só um nome, e ele muda de conteúdo sem aviso. Isso quebra reprodutibilidade: o mesmo comando hoje e amanhã pode trazer imagens diferentes.",
            },
            {
                frente: "O que é um registry?",
                verso: "O repositório onde as imagens ficam guardadas e de onde são baixadas, público ou privado da empresa. Publicar envia a imagem para lá, e a execução baixa se ainda não tiver localmente. É ele que permite construir uma vez e rodar em qualquer lugar.",
            },
            {
                frente: "Para que serve o docker compose?",
                verso: "Descrever num arquivo um conjunto de serviços que sobem juntos, com rede, volumes e variáveis, e subir tudo com um comando. É o que faz o ambiente local de um sistema com banco, cache e aplicação deixar de ser um roteiro de instalação.",
            },
            {
                frente: "Como se passa configuração para um container?",
                verso: "Por variável de ambiente na execução ou no arquivo do compose, e por arquivo montado quando é grande. A regra é a imagem ser igual em todos os ambientes e a diferença vir de fora, senão você precisa de uma imagem por ambiente.",
            },
            {
                frente: "Qual a diferença entre parar e remover um container?",
                verso: "Parar encerra o processo e mantém o container e a camada de escrita, então dá para iniciar de novo. Remover apaga o container e essa camada. Imagem é outra coisa: ela continua na máquina mesmo depois de remover todos os containers dela.",
            },
            {
                frente: "Por que o container encerra quando o processo principal termina?",
                verso: "Porque o container existe para rodar aquele processo, e não é uma máquina. Se ele termina, com sucesso ou erro, o container acaba. Por isso não faz sentido rodar um comando que sai imediatamente e esperar que o container fique de pé.",
            },
            {
                frente: "Como uma imagem chega até a sua máquina?",
                verso: "O comando de execução procura localmente e, se não achar, baixa do registry configurado, camada por camada, pulando as que já existem. É essa reutilização de camada que faz a segunda imagem parecida baixar muito mais rápido.",
            },
            {
                frente: "O que significa dizer que a imagem é imutável?",
                verso: "Depois de construída ela não muda: alterar algo produz uma imagem nova, com identificador próprio. Mudança feita dentro de um container em execução vive só na camada de escrita dele, e some quando ele é removido.",
            },
            {
                frente: "Para que serve o WORKDIR?",
                verso: "Define o diretório onde as instruções seguintes rodam e onde o processo começa. Evita repetir caminho absoluto em cada comando e deixa claro qual é a raiz da aplicação dentro da imagem. Ele cria o diretório se não existir.",
            },
            {
                frente: "O que o docker ps mostra, e o que muda com a opção de todos?",
                verso: "Por padrão lista só os containers em execução, com imagem, comando, portas e nome. Com a opção de todos, inclui os que já encerraram, com o código de saída. É por ali que se começa a investigar um container que subiu e morreu.",
            },
        ],
        junior: [
            {
                frente: "Qual a importância do Docker nos fluxos atuais de integração e entrega contínuas?",
                verso: "Ele dá um artefato único e imutável: a esteira constrói a imagem uma vez, testa aquela imagem e promove exatamente ela para produção, sem reconstruir. Some a diferença entre ambientes, o teste roda no mesmo empacotamento que vai ao ar, e voltar atrás é subir a tag anterior.",
            },
            {
                frente: "Por que a ordem das instruções no Dockerfile importa tanto?",
                verso: "Porque o cache de construção é por camada e em cascata: alterar uma instrução invalida todas as seguintes. Por isso se copia o manifesto de dependências e se instala antes de copiar o código, senão qualquer mudança de código refaz a instalação inteira.",
            },
            {
                frente: "O que é construção em vários estágios e o que ela resolve?",
                verso: "Usar um estágio com compilador e ferramentas para construir, e copiar só o resultado para um estágio final enxuto. A imagem que vai a produção deixa de carregar toolchain, código-fonte e dependências de desenvolvimento, o que reduz tamanho e superfície de ataque.",
            },
            {
                frente: "Como você reduziria o tamanho de uma imagem?",
                verso: "Base menor, construção em vários estágios, e limpeza de cache de pacote na mesma instrução que instalou, porque apagar numa camada seguinte não recupera espaço. Somado a isso, um .dockerignore honesto para o contexto não levar o que não é preciso.",
            },
            {
                frente: "Por que não rodar o processo do container como root?",
                verso: "Porque se alguém escapar do processo, começa com privilégio total, e o identificador de usuário é o mesmo do hospedeiro em muitos casos. Criar um usuário sem privilégio e declarar USER custa duas linhas e remove a maior parte desse risco.",
            },
            {
                frente: "Como você evitaria que um segredo fique dentro da imagem?",
                verso: "Não copiando segredo no Dockerfile: ele fica na camada mesmo que você apague depois, e quem tiver a imagem consegue ler. Em construção, usa-se o mecanismo de segredo do construtor, que monta o valor só naquele passo. Em execução, variável ou arquivo montado.",
            },
            {
                frente: "O que invalida o cache de construção?",
                verso: "Qualquer mudança no conteúdo copiado ou no texto da instrução, e a partir daí todas as camadas seguintes são refeitas. Copiar o projeto inteiro logo no começo é o erro clássico: qualquer arquivo alterado joga fora o cache da instalação de dependências.",
            },
            {
                frente: "Qual a diferença entre volume nomeado e montar um diretório do hospedeiro?",
                verso: "O volume nomeado é gerenciado pelo Docker, portátil e o padrão para dado de produção. Montar um diretório aponta para um caminho da máquina, o que é ótimo em desenvolvimento para ver o código mudando ao vivo, e frágil em produção por depender do hospedeiro.",
            },
            {
                frente: "Como dois serviços do mesmo compose se enxergam?",
                verso: "Pela rede que o compose cria, usando o nome do serviço como nome de máquina. A aplicação chama o banco pelo nome declarado no arquivo, e não por endereço IP. Não é preciso publicar porta para isso: publicar só serve para alcançar de fora.",
            },
            {
                frente: "Para que serve um healthcheck no container?",
                verso: "Dizer se o processo está apto, e não só de pé. Sem ele, um serviço que subiu porém não conecta no banco parece saudável. Com ele, o compose e o orquestrador conseguem esperar a dependência ficar pronta e reiniciar o que travou.",
            },
            {
                frente: "Qual a diferença entre a forma exec e a forma shell de declarar o comando?",
                verso: "Na forma exec, com lista de argumentos, o processo vira o principal e recebe os sinais diretamente. Na forma shell, o processo roda como filho de um shell, que não repassa o sinal de término, e o container acaba sendo morto à força depois do tempo limite.",
            },
            {
                frente: "O que é o processo de identificador 1 dentro do container, e qual o problema dele?",
                verso: "É o processo principal, que herda o papel de recolher processos filhos encerrados. Uma aplicação comum não faz isso, então processos zumbis se acumulam, e sinais têm tratamento especial nesse identificador. Um init mínimo resolve quando a aplicação cria filhos.",
            },
            {
                frente: "Como você investigaria um container que sobe e morre logo em seguida?",
                verso: "Listando com a opção de todos para ver o código de saída, lendo os logs do container encerrado, e conferindo o comando declarado. Se o log estiver vazio, sobrepor o comando de entrada por um shell permite entrar na imagem e testar o passo à mão.",
            },
            {
                frente: "Qual a diferença entre COPY e ADD?",
                verso: "COPY só copia arquivos do contexto. ADD também baixa de URL e descompacta arquivo local, o que parece conveniente e torna o comportamento menos previsível. A recomendação é usar COPY, e ser explícito quando precisar baixar ou extrair algo.",
            },
            {
                frente: "Como você limitaria memória e processador de um container?",
                verso: "Com as opções de limite na execução ou na declaração do orquestrador, que se apoiam em cgroups. Sem limite, um container consome o que houver e derruba os vizinhos. Vale lembrar que estourar o limite de memória mata o processo sem aviso.",
            },
            {
                frente: "Como você versionaria as imagens de uma esteira?",
                verso: "Com uma tag imutável por construção, tipicamente o hash do commit, e opcionalmente uma tag móvel apontando para a última. O deploy referencia a imutável, para saber exatamente o que está no ar e conseguir voltar a uma versão específica.",
            },
            {
                frente: "O que muda ao rodar uma imagem em outra arquitetura de processador?",
                verso: "A imagem é construída para uma arquitetura, então uma feita em máquina com processador de um tipo não roda em outro sem emulação, que é lenta. A saída é publicar imagem de múltiplas plataformas, com o registry servindo a variante certa para cada máquina.",
            },
            {
                frente: "Por que o container é considerado efêmero, e o que isso exige da aplicação?",
                verso: "Porque ele pode ser derrubado e recriado a qualquer momento, em outra máquina. A aplicação precisa não guardar estado local, ler configuração do ambiente, escrever log na saída padrão e tolerar reinício a qualquer instante sem perder trabalho.",
            },
            {
                frente: "O que o comando de limpeza do sistema remove?",
                verso: "Containers parados, redes sem uso, cache de construção e imagens penduradas. Com a opção que inclui volumes, ele apaga dado, e é aí que costuma doer. Em máquina de esteira ele é rotina; em máquina com dado local, exige cuidado.",
            },
            {
                frente: "Como você faria o mesmo Dockerfile servir desenvolvimento e produção?",
                verso: "Com estágios: um final enxuto para produção e outro com ferramentas de desenvolvimento, escolhido no build. O compose local aponta para o estágio de desenvolvimento e monta o código; a esteira constrói o de produção. A base compartilhada evita as duas divergirem.",
            },
        ],
        pleno: [
            {
                frente: "Como você garantiria que a imagem testada é exatamente a que subiu?",
                verso: "Construindo uma vez, referenciando pelo digest e não pela tag, e promovendo o mesmo artefato entre ambientes. Reconstruir por ambiente quebra a garantia, porque a base pode ter mudado no meio. Assinar a imagem fecha o resto do caminho.",
            },
            {
                frente: "Como você garantiria uma construção reproduzível?",
                verso: "Fixando a base por digest em vez de tag, travando as versões das dependências com arquivo de trava, e evitando instrução que baixa o que estiver disponível no dia. Sem isso, a mesma construção em semanas diferentes produz imagens diferentes.",
            },
            {
                frente: "Como você trataria uma imagem base com vulnerabilidade conhecida?",
                verso: "Verificando se o pacote afetado é realmente usado, porque nem toda vulnerabilidade de base é explorável na sua aplicação. Depois, atualizando a base e reconstruindo, que costuma resolver. Escanear na esteira e falhar por severidade é o que evita descobrir tarde.",
            },
            {
                frente: "Como você depuraria um container que morre no boot em produção?",
                verso: "Pelo código de saída e pelos logs do container encerrado, antes de mexer em qualquer coisa. Causas comuns são variável faltando, permissão de arquivo, dependência ainda indisponível e limite de memória estourado. Reproduzir localmente com a mesma imagem e as mesmas variáveis confirma.",
            },
            {
                frente: "Como você lidaria com log de aplicação em container?",
                verso: "Escrevendo na saída padrão em formato estruturado, e deixando a coleta com a plataforma. Escrever em arquivo dentro do container cria dado que some no reinício e enche o disco do nó. Rotação e retenção são responsabilidade de quem coleta.",
            },
            {
                frente: "Como você aplicaria migração de banco num deploy com containers?",
                verso: "Num passo próprio, antes de subir a versão nova, e não no início da aplicação, senão várias réplicas tentam migrar ao mesmo tempo. E com mudança compatível nos dois sentidos, para a versão antiga continuar funcionando durante a troca.",
            },
            {
                frente: "O que muda quando o container passa a rodar num orquestrador?",
                verso: "Você deixa de gerenciar container e passa a declarar estado desejado. Endereço deixa de ser fixo, reinício e reagendamento viram rotina, e sondas de vivacidade e prontidão passam a decidir tráfego. Limite de recurso deixa de ser opcional.",
            },
            {
                frente: "Como você trataria um serviço com estado dentro de containers?",
                verso: "Tirando o estado do container: banco gerenciado ou volume persistente com identidade estável, e a aplicação sem nada local que importe. Se o estado precisa mesmo ficar junto, o orquestrador tem primitiva própria para isso, com armazenamento por réplica.",
            },
            {
                frente: "Como você reduziria o tempo de construção numa esteira?",
                verso: "Ordenando o Dockerfile para o que muda menos ficar antes, exportando e reimportando cache de camada entre execuções, e cortando o contexto enviado. Construção em vários estágios ajuda porque estágios independentes podem rodar em paralelo.",
            },
            {
                frente: "Como namespaces e cgroups sustentam o isolamento?",
                verso: "Namespaces dão visões separadas de processos, rede, montagens e usuários, então o container só enxerga o próprio mundo. Cgroups limitam quanto de processador, memória e entrada e saída ele consome. Não há máquina virtual no meio: é o mesmo núcleo.",
            },
            {
                frente: "Container é uma fronteira de segurança confiável?",
                verso: "É isolamento, e não uma barreira tão forte quanto a de uma máquina virtual: todos compartilham o núcleo, então uma falha nele atravessa. Por isso valem usuário sem privilégio, sistema de arquivos somente leitura, capacidades reduzidas e nada de modo privilegiado.",
            },
            {
                frente: "Como você trataria um container que consome memória até ser morto?",
                verso: "Confirmando pelo motivo de encerramento que foi o limite, e não outra falha. Depois separando vazamento real de cache que cresce e de coletor de lixo que só devolve sob pressão. Muita linguagem precisa ser avisada do limite, senão ela dimensiona pelo total da máquina.",
            },
            {
                frente: "Como você implementaria desligamento gracioso num container?",
                verso: "Garantindo que o processo é o principal, para receber o sinal de término, e tratando esse sinal: parar de aceitar novas requisições, terminar as em curso e fechar dependências. Sem isso, o tempo limite expira e o processo é morto no meio do trabalho.",
            },
            {
                frente: "Como você lidaria com uma dependência que ainda não subiu?",
                verso: "Tornando a aplicação tolerante: tentar reconectar com espera crescente em vez de morrer na subida. Ordem de inicialização declarada só garante que o container iniciou, não que o serviço está pronto, e em orquestrador não existe essa garantia mesmo.",
            },
            {
                frente: "Como você trataria uma imagem grande demais atrasando o deploy?",
                verso: "Medindo camada a camada para achar o que pesa, tirando toolchain com vários estágios e conferindo se algo grande foi copiado sem necessidade. Camadas compartilhadas com a versão anterior também ajudam, porque só o que mudou é baixado.",
            },
            {
                frente: "Como você lidaria com fuso horário e localidade dentro do container?",
                verso: "Fixando explicitamente, porque a imagem enxuta costuma vir sem base de fusos e cair em tempo universal. A recomendação é a aplicação trabalhar em tempo universal e converter só na apresentação, o que remove a dependência de configuração do container.",
            },
            {
                frente: "O que você olharia primeiro num Dockerfile em revisão?",
                verso: "Base fixada por digest, usuário sem privilégio, ausência de segredo copiado, ordem que preserva cache, comando na forma exec, e se a imagem final carrega ferramenta de construção. São os pontos que aparecem em quase toda revisão.",
            },
            {
                frente: "Como você faria observabilidade de containers em produção?",
                verso: "Métricas do próprio container, como uso contra limite de memória e processador, reinícios e motivo de encerramento, somadas às da aplicação. Reinício repetido é o sinal mais barato de que algo está errado, e costuma passar despercebido sem alerta.",
            },
            {
                frente: "Como você trataria configuração que muda por ambiente?",
                verso: "Fora da imagem, sempre: variável de ambiente para o simples, arquivo montado ou objeto de configuração do orquestrador para o resto, e cofre para segredo. A imagem precisa ser a mesma nos três ambientes, senão o que você testou não é o que subiu.",
            },
            {
                frente: "Como você reduziria a superfície de ataque de um container em produção?",
                verso: "Usuário sem privilégio, sistema de arquivos raiz somente leitura com volume só onde precisa escrever, capacidades do núcleo removidas, e nada de modo privilegiado nem de socket do Docker montado dentro. Somado a isso, imagem sem shell nem gerenciador de pacotes.",
            },
        ],
        senior: [
            {
                frente: "Quando containerizar não vale a pena?",
                verso: "Em carga que depende de acesso muito próximo ao hardware, em sistema legado que assume máquina fixa e estado local, e em time pequeno sem esteira nem plataforma para operar isso. Container sem automação em volta troca um problema por outro.",
            },
            {
                frente: "Como você padronizaria imagens numa empresa com muitos times?",
                verso: "Com imagens base internas mantidas por um time, já com usuário sem privilégio, certificados e agente de observabilidade, atualizadas de forma central. Os times herdam sem copiar Dockerfile alheio, e uma correção de segurança chega a todo mundo pela base.",
            },
            {
                frente: "Como você garantiria a cadeia de suprimento das suas imagens?",
                verso: "Construindo só na esteira e nunca em máquina pessoal, fixando base por digest, gerando inventário de componentes, assinando a imagem e verificando a assinatura na admissão. Assim o que roda em produção tem origem verificável, e não só um nome conhecido.",
            },
            {
                frente: "Como você lidaria com um time que roda tudo como root e em modo privilegiado?",
                verso: "Mostrando o alcance real com um exemplo concreto, e não com política abstrata. Depois oferecendo o caminho pronto, com base interna que já vem sem privilégio, e só então tornando a regra obrigatória na admissão, com exceção documentada quando houver motivo.",
            },
            {
                frente: "Como você mediria a saúde da esteira de construção?",
                verso: "Tempo até o feedback, taxa de falha por causa e não por total, tempo de fila e taxa de acerto do cache. Construção lenta muda o comportamento do time: as pessoas passam a agrupar mudanças, e aí o lote grande volta a ser o problema.",
            },
            {
                frente: "Como você conduziria a migração de máquinas virtuais para containers?",
                verso: "Começando pelo que já é sem estado e tem teste, e não pelo sistema central. Cada serviço migrado prova a esteira e a operação. O que depende de estado local fica por último, e às vezes a resposta honesta é ele continuar onde está.",
            },
            {
                frente: "Como você decidiria entre imagem base mínima e uma completa?",
                verso: "Mínima reduz superfície e tamanho, e cobra na depuração, porque falta shell e ferramenta. Completa facilita investigar e carrega mais risco. Um meio termo comum é produção mínima com uma variante de depuração da mesma versão, disponível quando precisar.",
            },
            {
                frente: "Como você trataria segredo em escala, com muitos serviços e ambientes?",
                verso: "Com cofre gerenciado e credencial de curta duração entregue por identidade da carga, em vez de variável fixa espalhada. O objetivo é ninguém precisar copiar segredo, e rotação deixar de ser um projeto. Segredo em variável é o mínimo, não o alvo.",
            },
            {
                frente: "Como você trataria a proliferação de Dockerfiles diferentes entre times?",
                verso: "Aceitando que alguma variação é legítima e atacando a duplicação sem propósito, com bases internas e modelos por tipo de aplicação. Padronizar por documento não funciona; padronizar por artefato que o time herda de graça funciona, porque o caminho fácil vira o certo.",
            },
            {
                frente: "Como você lidaria com um incidente causado por atualização de imagem base?",
                verso: "Voltando ao digest anterior, que é possível justamente por não usar tag móvel. Depois, escalonando a atualização de base em vez de aplicar em tudo de uma vez, com verificação automática num conjunto pequeno antes de propagar para o restante.",
            },
            {
                frente: "Como você equilibraria velocidade de entrega e rigor de segurança na esteira?",
                verso: "Separando o que bloqueia do que informa: falha só em severidade alta e com correção disponível, o resto vira relatório com prazo. Verificação que bloqueia sem correção possível ensina o time a ignorar, e aí a esteira perde autoridade para tudo.",
            },
            {
                frente: "Como você trataria um registro de imagens crescendo sem controle?",
                verso: "Com política de retenção por idade e por uso, preservando o que está em produção e as versões de referência. Custo de armazenamento costuma ser o menor problema: registro cheio de tag antiga esconde qual imagem é a boa na hora de voltar atrás.",
            },
            {
                frente: "Como você avaliaria trocar o runtime de container?",
                verso: "Pelo que a troca resolve de fato, já que a imagem segue o mesmo padrão aberto. Vale por segurança, por integração com a plataforma ou por licença. Trocar por preferência técnica custa retreinamento e ferramenta, sem entregar comportamento novo.",
            },
            {
                frente: "Como você ensinaria containers para quem nunca usou?",
                verso: "Começando pelo problema que eles resolvem, que é o ambiente divergir entre máquinas, e não pela lista de comandos. Depois, imagem contra container, e o ciclo de construir, publicar e executar. Camada e cache vêm quando a construção lenta começa a incomodar.",
            },
            {
                frente: "Como você lidaria com o funciona na minha máquina mesmo usando container?",
                verso: "Procurando o que ainda vem de fora: variável diferente, volume montado que só existe local, arquitetura de processador distinta e imagem baixada em momentos diferentes pela tag móvel. Container fecha o sistema de arquivos, não a configuração nem o dado.",
            },
            {
                frente: "Como você decidiria o que vai na imagem e o que vem do ambiente?",
                verso: "Na imagem, tudo que é igual em qualquer lugar: código, dependência e a forma de executar. Do ambiente, tudo que muda entre lugares: endereço, credencial e ajuste de comportamento. O teste é conseguir promover a mesma imagem sem reconstruir.",
            },
            {
                frente: "Como você trataria compatibilidade de arquitetura num time com máquinas diferentes?",
                verso: "Publicando imagem de múltiplas plataformas na esteira, para cada máquina baixar a variante certa sem emulação. E rodando o teste na arquitetura que vai a produção, porque diferença de desempenho e de biblioteca nativa aparece justamente ali.",
            },
            {
                frente: "Como você lidaria com construção lenta que virou gargalo do time?",
                verso: "Medindo por camada antes de mexer: costuma ser contexto grande demais, ordem que invalida o cache e instalação repetida. Cache compartilhado entre execuções resolve boa parte. Comprar máquina maior sem corrigir a ordem só adia o mesmo problema.",
            },
            {
                frente: "Qual o risco de tratar container como se fosse máquina virtual?",
                verso: "Aparece em vários lugares: instalar coisa dentro do container em execução, guardar estado local, rodar vários processos sem supervisor e tratar reinício como incidente. O modelo é processo descartável, e ignorar isso produz sistema frágil com aparência moderna.",
            },
            {
                frente: "Como você justificaria o investimento em containerizar para quem paga a conta?",
                verso: "Pelo que muda no negócio: tempo entre commit e produção, frequência de deploy, tempo para voltar atrás e horas gastas em ambiente divergente. Falar de imagem e camada não convence quem decide; mostrar que a entrega deixa de ser evento de fim de semana, sim.",
            },
        ],
    },
};
