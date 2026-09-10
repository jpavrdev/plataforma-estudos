import type { TopicoDeEntrevista } from "../../seed-entrevista.ts";

/**
 * Perguntas de entrevista de Node.js.
 *
 * O nível segue o que a pergunta cobra, e não o assunto. O laço de eventos aparece
 * nos quatro níveis: em estágio é o que significa ser de thread única, em sênior é
 * decidir quando o problema não é do Node e sim da arquitetura em volta.
 */
export const node: TopicoDeEntrevista = {
    slug: "node",
    nome: "Node.js",
    position: 8,
    perguntas: {
        estagio: [
            {
                frente: "O que é o Node?",
                verso: "Um ambiente para executar JavaScript fora do navegador, usando o motor V8 e uma camada que dá acesso a arquivo, rede e processo. É o que permite escrever servidor, ferramenta de linha de comando e script com a mesma linguagem do front.",
            },
            {
                frente: "Que vantagem prática existe em usar a mesma linguagem no servidor e no cliente?",
                verso: "Compartilhar validação, tipos e utilitários, e reduzir a troca de contexto de quem trabalha nos dois lados. O ganho não é desempenho: é fluxo de trabalho. E o cuidado é lembrar que servidor e navegador têm ambientes e riscos diferentes.",
            },
            {
                frente: "O que significa dizer que o Node é de thread única?",
                verso: "Que o seu código roda numa thread só, a do laço de eventos. Entrada e saída acontece fora dela, e o resultado volta em forma de retorno de chamada. Por isso o Node aguenta muitas conexões esperando, e sofre com cálculo pesado, que trava essa única thread.",
            },
            {
                frente: "O que é o laço de eventos, em uma frase?",
                verso: "É o ciclo que fica pegando trabalho pronto numa fila e executando na thread principal. Enquanto ele estiver ocupado com o seu código, nada mais acontece: nenhuma requisição é atendida e nenhum retorno de chamada roda.",
            },
            {
                frente: "O que é uma operação assíncrona?",
                verso: "Uma operação que você inicia e não espera parado: o Node continua atendendo outras coisas e avisa quando ela termina. Leitura de arquivo, consulta ao banco e chamada HTTP são assim. É o que permite um processo só atender muitas conexões.",
            },
            {
                frente: "O que é um retorno de chamada?",
                verso: "Uma função passada para outra ser chamada quando o trabalho terminar. É o formato mais antigo de assíncrono no Node, com o erro no primeiro parâmetro. Encadear muitos deles é o que produz aquele código em degraus difícil de ler.",
            },
            {
                frente: "O que é uma Promise?",
                verso: "Um objeto que representa um valor que ainda vai existir, com três estados: pendente, resolvida e rejeitada. Ela permite encadear passos e tratar erro num lugar só, e é a base do async e await. Uma vez resolvida, ela não muda mais.",
            },
            {
                frente: "O que async e await fazem?",
                verso: "O async faz a função devolver uma promessa, e o await pausa aquela função até a promessa resolver, sem bloquear o laço de eventos. O código passa a ler de cima para baixo, mantendo o comportamento assíncrono por baixo.",
            },
            {
                frente: "Como você trata erro com async e await?",
                verso: "Com try e catch em volta do await, como em código síncrono. Sem isso, a promessa rejeitada sobe e vira uma rejeição não tratada. Em rota, o padrão é capturar e transformar em resposta de erro, e não deixar o processo lidar com isso.",
            },
            {
                frente: "O que acontece com uma promessa rejeitada que ninguém trata?",
                verso: "O Node emite um aviso de rejeição não tratada e, nas versões atuais, encerra o processo por padrão. É proposital: seguir rodando com um erro invisível costuma dar problema pior depois, com dado pela metade.",
            },
            {
                frente: "Qual a diferença entre require e import?",
                verso: "O require é do formato CommonJS, síncrono e resolvido em tempo de execução. O import é do formato de módulos padrão da linguagem, com análise estática e carregamento assíncrono. O que decide qual vale é a configuração do projeto e a extensão do arquivo.",
            },
            {
                frente: "O que o package.json guarda?",
                verso: "Nome, versão, ponto de entrada, scripts, dependências e configurações do projeto, como o tipo de módulo. É o arquivo que descreve o pacote para o gerenciador e para quem for usar. Sem ele, não há como instalar nem publicar de forma previsível.",
            },
            {
                frente: "Para que serve o arquivo de trava de dependências?",
                verso: "Para registrar a versão exata de tudo que foi instalado, inclusive das dependências das dependências. É o que faz a instalação de hoje ser igual à de três meses atrás. Ele precisa ser versionado no repositório, senão a máquina de cada um monta uma árvore diferente.",
            },
            {
                frente: "Qual a diferença entre dependência e dependência de desenvolvimento?",
                verso: "A primeira é necessária para o código rodar em produção; a segunda só para desenvolver e testar, como ferramenta de teste e de tipos. A separação reduz o que vai para a imagem final e deixa claro o que é usado de verdade em produção.",
            },
            {
                frente: "O que o versionamento semântico comunica?",
                verso: "Três números: quebra de compatibilidade, funcionalidade nova compatível e correção. O acento circunflexo na versão aceita atualizações que não quebram segundo esse contrato. Isso depende de quem publica respeitar a convenção, o que nem sempre acontece.",
            },
            {
                frente: "Para que servem os scripts do package.json?",
                verso: "Para dar nomes padronizados às tarefas do projeto, como subir, testar e construir, e permitir usar as ferramentas instaladas localmente sem instalar nada global. É o que faz um projeto novo rodar com um comando só.",
            },
            {
                frente: "Como você lê uma variável de ambiente?",
                verso: "Pelo objeto de ambiente do processo, e o valor sempre chega como texto, então número e booleano precisam de conversão. Vale validar na subida, porque variável faltando costuma aparecer como comportamento estranho no meio da primeira requisição.",
            },
            {
                frente: "Por que segredo não fica dentro do código?",
                verso: "Porque o repositório é copiado, clonado e compartilhado, e o histórico guarda tudo para sempre. Segredo vem de variável de ambiente injetada no deploy ou de um cofre. Arquivo de exemplo com nome das variáveis é o que fica versionado.",
            },
            {
                frente: "Como você lê um arquivo em Node?",
                verso: "Com a versão de promessas do módulo de arquivos, usando await. Para arquivo grande, o certo é ler em fluxo em vez de carregar tudo na memória. E é preciso decidir a codificação, senão o retorno vem como buffer, e não como texto.",
            },
            {
                frente: "Qual a diferença entre a versão síncrona e a assíncrona de uma função de arquivo?",
                verso: "A síncrona bloqueia o laço de eventos até terminar, então em servidor ela para o atendimento de todo mundo. Ela é aceitável em script e na subida da aplicação, quando ninguém está sendo atendido ainda.",
            },
            {
                frente: "Como você sobe um servidor HTTP simples?",
                verso: "Com o módulo HTTP nativo, criando um servidor com uma função que recebe requisição e resposta e ouvindo numa porta. Em projeto de verdade se usa um framework por causa de rotas, corpo e middlewares, mas o modelo por baixo continua esse.",
            },
            {
                frente: "O que é uma rota numa API?",
                verso: "A combinação de um método HTTP com um caminho, ligada a uma função que trata aquele pedido. É o que define o contrato: buscar num caminho é leitura, enviar no mesmo caminho é criação. Manter essa coerência é metade de uma API previsível.",
            },
            {
                frente: "O que os principais códigos de status significam?",
                verso: "Duzentos e pouco é sucesso, trezentos é redirecionamento, quatrocentos é erro de quem chamou e quinhentos é erro do servidor. Usar duzentos com uma mensagem de erro dentro obriga todo cliente a inventar a própria checagem.",
            },
            {
                frente: "Como você lê o corpo de uma requisição?",
                verso: "Com o middleware que interpreta JSON, que junta os pedaços e entrega o objeto. Sem ele, o corpo é um fluxo e chega vazio. Vale limitar o tamanho aceito, porque corpo enorme é um jeito barato de derrubar o serviço.",
            },
            {
                frente: "Como você devolve JSON numa resposta?",
                verso: "Com o método que serializa e já define o cabeçalho de tipo, junto com o código de status certo. O importante é ter um formato consistente para sucesso e para erro, para o cliente não precisar adivinhar o que vem em cada rota.",
            },
            {
                frente: "O que é um middleware?",
                verso: "Uma função que roda entre a chegada da requisição e o tratador final, com acesso à requisição, à resposta e ao próximo passo. Serve para autenticação, log, interpretação de corpo e tratamento de erro. A ordem em que são registrados importa.",
            },
            {
                frente: "Como você lê parâmetro de rota e de consulta?",
                verso: "Parâmetro de rota vem do caminho declarado, como o identificador num caminho de recurso. Parâmetro de consulta vem depois da interrogação e serve para filtro e paginação. Os dois chegam como texto e vêm do usuário, então precisam ser validados.",
            },
            {
                frente: "Como você trata uma rota que não existe?",
                verso: "Com um tratador registrado no fim, devolvendo o status de não encontrado num formato igual ao dos outros erros. Deixar o framework devolver a página padrão em HTML numa API quebra o cliente que espera JSON.",
            },
            {
                frente: "O que é o objeto process?",
                verso: "A representação do processo em execução: variáveis de ambiente, argumentos da linha de comando, saída padrão, sinais e código de saída. É por ele que você lê configuração e reage a um pedido de encerramento.",
            },
            {
                frente: "Como você encerra um processo indicando falha?",
                verso: "Saindo com código diferente de zero, para quem orquestra saber que deu errado. Isso importa em script de esteira e em contêiner. Sair com zero depois de um erro faz o orquestrador achar que tudo terminou bem.",
            },
            {
                frente: "O que é o EventEmitter?",
                verso: "A base do modelo de eventos do Node: um objeto que emite eventos nomeados e permite registrar ouvintes. Streams e servidores são construídos sobre ele. O detalhe que pega é o evento de erro: sem ouvinte, ele derruba o processo.",
            },
            {
                frente: "Qual a diferença entre setTimeout e setInterval?",
                verso: "O primeiro agenda uma execução depois do tempo; o segundo repete. O intervalo não espera o trabalho anterior terminar, então tarefa lenta se acumula. Por isso repetição costuma ser feita com agendamento no fim de cada execução.",
            },
            {
                frente: "Como você espera um tempo dentro de uma função assíncrona?",
                verso: "Com a versão em promessa dos temporizadores e await. Laço ocupando a CPU até o relógio passar bloqueia o laço de eventos e para o servidor inteiro, mesmo parecendo apenas uma espera curta.",
            },
            {
                frente: "O que é uma stream, em uma frase?",
                verso: "Um fluxo de dados processado em pedaços, em vez de tudo de uma vez. É o que permite ler um arquivo de gigabytes ou responder um download sem carregar tudo na memória. Requisição e resposta HTTP são streams.",
            },
            {
                frente: "Quando ler um arquivo inteiro de uma vez é problema?",
                verso: "Quando ele é grande o bastante para pesar na memória, ou quando muitos pedidos fazem isso ao mesmo tempo. Cada leitura ocupa memória até terminar, então dez requisições de cem megabytes derrubam um contêiner pequeno.",
            },
            {
                frente: "O que é um buffer?",
                verso: "Uma área de bytes crus, usada quando o dado não é texto ou quando a codificação ainda não foi decidida. Arquivo, rede e criptografia trabalham com buffer. Converter para texto sem informar a codificação é onde nascem os caracteres estranhos.",
            },
            {
                frente: "O que o JSON.parse pode lançar, e o que fazer?",
                verso: "Ele lança quando o texto não é JSON válido, o que é comum com corpo malformado ou resposta de erro em HTML. Precisa estar dentro de try, e o resultado precisa ser validado: JSON válido não significa que os campos esperados existem.",
            },
            {
                frente: "Por que confiar no corpo da requisição é perigoso?",
                verso: "Porque ele vem do cliente e pode ter qualquer coisa: campo faltando, tipo errado, campo a mais que você não deveria aceitar. Sem validação, isso vira erro em tempo de execução, ou pior, gravação de campo que o usuário não podia definir.",
            },
            {
                frente: "Como você valida a entrada de uma rota?",
                verso: "Com um esquema declarado para corpo, parâmetros e consulta, rejeitando cedo com uma mensagem clara. Assim o resto do código pode assumir dado válido. Validar com sequência de ifs espalhados devolve um erro por vez e sempre esquece um caso.",
            },
            {
                frente: "O que é CORS e por que ele aparece?",
                verso: "É a política do navegador que impede uma página de um domínio chamar outra API sem permissão explícita. A liberação vem em cabeçalhos da resposta do servidor. Não é proteção do servidor: quem chama por fora do navegador não passa por isso.",
            },
            {
                frente: "Como você serve arquivos estáticos?",
                verso: "Com o middleware que expõe uma pasta, cuidando para não expor mais do que deveria. Em produção, o normal é deixar isso com um servidor de borda ou uma rede de distribuição, que fazem cache e comprimem melhor que o processo Node.",
            },
            {
                frente: "O que significa a porta já estar em uso?",
                verso: "Que outro processo está ouvindo nela, muitas vezes uma execução anterior que não encerrou. A saída é encerrar o processo antigo ou usar outra porta, e no ambiente de desenvolvimento tornar a porta configurável para não travar quem trabalha em paralelo.",
            },
            {
                frente: "Como você roda o servidor recarregando ao salvar?",
                verso: "Com o modo de observação do próprio Node nas versões recentes, ou com uma ferramenta que reinicia o processo. Vale saber que recarregar não é atualização em memória: o processo morre e sobe de novo, perdendo o que estava guardado nele.",
            },
            {
                frente: "Como você depura um servidor Node?",
                verso: "Rodando com o inspetor ligado e conectando o depurador do editor ou do navegador, com pontos de parada. É bem mais rápido que espalhar impressões, principalmente em código assíncrono, onde a ordem das mensagens engana.",
            },
            {
                frente: "O que acontece se você fizer um cálculo pesado numa rota?",
                verso: "O laço de eventos fica preso, e nenhuma outra requisição é atendida enquanto isso, nem as que já estavam esperando. O sintoma é latência subindo para todo mundo por causa de um endpoint só. Esse trabalho precisa sair da thread principal.",
            },
            {
                frente: "Que tipo de trabalho não combina com Node?",
                verso: "Processamento intenso de CPU por longos períodos, como transformação de imagem e vídeo ou cálculo numérico pesado, porque a thread única vira o gargalo. Isso não impede usar Node: impede fazer esse trabalho dentro do processo que atende requisições.",
            },
            {
                frente: "O que é o npx?",
                verso: "Um atalho para executar um pacote sem instalar globalmente, usando a versão local do projeto quando existe. Serve para gerador de projeto e ferramenta de uso pontual, e evita a bagunça de instalações globais com versões diferentes por máquina.",
            },
            {
                frente: "Qual a diferença entre instalar e instalar limpo?",
                verso: "A instalação normal pode atualizar o arquivo de trava conforme as faixas de versão. A limpa apaga a pasta de dependências e instala exatamente o que a trava manda, falhando se ela estiver fora de sincronia. É a que se usa na esteira.",
            },
            {
                frente: "O que é uma dependência transitiva?",
                verso: "A dependência da sua dependência, que você não declarou mas está no seu projeto. É por isso que uma biblioteca pequena pode trazer dezenas de pacotes, e por isso vulnerabilidade aparece em coisa que você nunca instalou de propósito.",
            },
            {
                frente: "Como você descobre se um projeto tem dependência vulnerável?",
                verso: "Com o comando de auditoria do gerenciador, e melhor ainda com verificação automática na esteira. O resultado precisa ser lido com cuidado: nem todo alerta é explorável no seu uso, mas ignorar tudo por padrão é como se acumula risco.",
            },
            {
                frente: "O que significa uma versão do Node ser LTS?",
                verso: "Que ela tem suporte longo e recebe correções por mais tempo, o que a torna a escolha para produção. Versões ímpares são de vida curta. Ficar numa versão fora de suporte significa não receber correção de segurança.",
            },
            {
                frente: "Como você fixa a versão do Node de um projeto?",
                verso: "Declarando no campo de motores e num arquivo de versão que as ferramentas de troca reconhecem, e usando a mesma na imagem do contêiner e na esteira. Sem isso, cada máquina roda uma versão e o erro só aparece em produção.",
            },
            {
                frente: "O que é o CommonJS?",
                verso: "O formato de módulos original do Node, com require e exports, carregado de forma síncrona. Ele ainda é a maior parte do ecossistema. Convive com o formato padrão da linguagem, e é essa convivência que gera boa parte da confusão de importação.",
            },
            {
                frente: "O que o campo de tipo do package.json muda?",
                verso: "Define se os arquivos com extensão comum são tratados como módulos ES ou como CommonJS. É o que decide se import funciona sem extensão especial. Trocar esse campo num projeto existente quebra qualquer arquivo que ainda use require.",
            },
            {
                frente: "Por que não existe __dirname em módulos ES?",
                verso: "Porque essas variáveis eram do embrulho do CommonJS. No formato padrão, o caminho do arquivo é obtido a partir da URL do módulo. É uma das primeiras diferenças que aparecem ao migrar, e a correção é mecânica.",
            },
            {
                frente: "Por que juntar caminhos com o módulo de caminho em vez de concatenar?",
                verso: "Porque ele cuida do separador do sistema, de barras duplicadas e de trechos relativos. Concatenar com barra funciona até o dia em que roda noutro sistema ou recebe um trecho vazio, e aí o caminho aponta para o lugar errado.",
            },
            {
                frente: "Como você organizaria as pastas de uma API Node pequena?",
                verso: "Separando rota, regra de negócio e acesso a dado, com um lugar só para configuração. Não precisa de arquitetura elaborada no começo, mas colocar consulta de banco dentro do tratador de rota é o que impede testar e reaproveitar depois.",
            },
            {
                frente: "O que é uma API REST?",
                verso: "Um estilo em que recursos são identificados por caminhos e manipulados pelos métodos HTTP, com respostas em formato padrão e uso correto dos status. Não é regra rígida: o que importa é ser previsível para quem consome.",
            },
            {
                frente: "Como você trataria um erro que acontece dentro de uma rota?",
                verso: "Capturando, registrando com contexto e devolvendo uma resposta de erro no formato padrão da API, sem vazar pilha nem detalhe interno. Erro esperado, como registro não encontrado, é resposta de cliente; erro inesperado é falha de servidor.",
            },
            {
                frente: "Como você faria uma API devolver a lista de um recurso?",
                verso: "Com paginação desde o começo, mesmo que a tabela esteja pequena, e um formato que informe se há mais. Rota que devolve tudo funciona por meses e derruba o serviço no dia em que os dados crescerem.",
            },
            {
                frente: "O que o console.log tem de limitação em produção?",
                verso: "Não tem nível, não tem estrutura e não dá para filtrar sem mexer no código. Além disso ele pode bloquear dependendo do destino da saída. Log de produção precisa ser estruturado e ter nível, para reduzir ruído sem perder o que importa.",
            },
            {
                frente: "Como você guardaria dados numa API sem banco, para um exercício?",
                verso: "Num arquivo ou em memória, sabendo que memória some quando o processo reinicia e não é compartilhada entre instâncias. Serve para prototipar, e é justamente por essas duas razões que não sobrevive à primeira necessidade de escalar.",
            },
            {
                frente: "O que muda entre rodar o Node no seu computador e num contêiner?",
                verso: "Ambiente, versão, variáveis, limites de memória e usuário. A maior parte dos erros que só acontecem no contêiner vem dessas diferenças, e não do código. Por isso o objetivo é que os dois rodem a mesma imagem sempre que possível.",
            },
            {
                frente: "Como você trataria uma dependência que só funciona no navegador?",
                verso: "Não usando no servidor, porque objetos como janela e documento não existem lá. Se ela mistura os dois mundos, é preciso importar apenas o subcaminho que serve para servidor. Esse é um dos erros mais comuns ao mover código do front.",
            },
            {
                frente: "O que acontece quando duas requisições chegam ao mesmo tempo?",
                verso: "As duas entram no mesmo processo e são atendidas de forma intercalada: enquanto uma espera pelo banco, a outra avança. Não há paralelismo real no seu código, então uma operação que trava a thread atrasa a outra.",
            },
            {
                frente: "Por que variável global em módulo é arriscada num servidor?",
                verso: "Porque ela é compartilhada por todas as requisições daquele processo. Guardar o usuário atual ali faz uma requisição enxergar o dado da outra. Estado de requisição precisa viver na própria requisição, e não no módulo.",
            },
            {
                frente: "Como você trataria um valor numérico vindo da URL?",
                verso: "Convertendo explicitamente e checando o resultado, porque tudo chega como texto e uma conversão silenciosa devolve valor inválido. Passar isso direto para o banco é a origem de consulta estranha e de erro difícil de rastrear.",
            },
            {
                frente: "O que você colocaria num arquivo de exemplo de variáveis de ambiente?",
                verso: "O nome de todas as variáveis necessárias, com valor de exemplo inofensivo e um comentário curto quando o nome não basta. Nenhum valor real. É o que permite alguém subir o projeto sem perguntar quais variáveis existem.",
            },
            {
                frente: "Como você escreveria um teste para uma função assíncrona?",
                verso: "Deixando o teste ser assíncrono e usando await na chamada, e verificando também o caso de rejeição com a asserção própria para isso. Esquecer o await faz o teste terminar antes da asserção rodar, e ele passa mesmo com o código errado.",
            },
            {
                frente: "Como você instalaria uma dependência que só serve para rodar testes?",
                verso: "Como dependência de desenvolvimento, com a marcação própria, para ela não ir para a imagem de produção. Isso reduz o tamanho da imagem e a superfície de segurança. Instalar tudo como dependência normal é comum e passa despercebido até alguém olhar o que foi para o servidor.",
            },
        ],
        junior: [
            {
                frente: "Quais são as fases do laço de eventos?",
                verso: "Em ordem: temporizadores, retornos pendentes de entrada e saída, preparação, sondagem, checagem e fechamento. A sondagem é onde ele espera por trabalho novo. Saber isso importa para entender por que um temporizador de zero milissegundos não roda imediatamente.",
            },
            {
                frente: "Qual a diferença entre microtarefa e macrotarefa?",
                verso: "Microtarefa é a fila das promessas, esvaziada inteira depois de cada passo, antes de o laço seguir. Macrotarefa é o que entra nas fases, como temporizador e entrada e saída. Por isso um encadeamento de promessas roda antes de um temporizador já vencido.",
            },
            {
                frente: "O que o nextTick tem de diferente?",
                verso: "Ele roda antes das promessas, numa fila própria, esvaziada assim que a operação atual termina. Usado em excesso, ele deixa o laço de eventos sem avançar, porque a fila nunca acaba. É uma ferramenta de biblioteca, não de código de aplicação.",
            },
            {
                frente: "Se o Node é de thread única, como a leitura de arquivo é assíncrona?",
                verso: "Porque a operação é delegada. Parte vai para o sistema operacional e parte para um pool de threads da biblioteca interna, fora do seu código. Quando termina, o resultado volta como retorno de chamada na thread principal.",
            },
            {
                frente: "Que operações usam o pool de threads interno?",
                verso: "Arquivo, resolução de nomes por padrão, compressão e criptografia. Rede não usa: ela é assíncrona no próprio sistema. O pool tem tamanho fixo, então muitas operações de arquivo ou de hash de senha ao mesmo tempo formam fila invisível.",
            },
            {
                frente: "Como você identifica que o laço de eventos está travando?",
                verso: "Medindo o atraso do laço, que é a diferença entre quando um temporizador deveria disparar e quando ele disparou. Se esse número sobe junto com a latência das rotas, o problema é trabalho síncrono, e não banco nem rede.",
            },
            {
                frente: "Como você tiraria um trabalho pesado de CPU do caminho da requisição?",
                verso: "Passando para uma thread de trabalho, para um processo separado ou para uma fila com consumidor próprio. A escolha depende de precisar do resultado agora. O que não pode é o cálculo ficar na thread que atende todo mundo.",
            },
            {
                frente: "Qual a diferença entre cluster e threads de trabalho?",
                verso: "Cluster cria processos completos que dividem a mesma porta, e serve para usar todos os núcleos atendendo requisições. Threads de trabalho rodam dentro do mesmo processo, compartilham memória por buffers e servem para cálculo pesado.",
            },
            {
                frente: "Quando você usaria um processo filho?",
                verso: "Para executar um programa externo, como uma ferramenta de linha de comando, ou para isolar algo que pode travar. É preciso cuidar da entrada e saída para não encher o buffer, e nunca montar o comando concatenando texto vindo do usuário.",
            },
            {
                frente: "O que é contrapressão numa stream?",
                verso: "É o consumidor lento avisar que não dá conta, para o produtor parar de empurrar. Sem respeitar isso, os dados se acumulam na memória do processo. É a diferença entre transmitir um arquivo grande com memória estável ou ver o processo inchar até morrer.",
            },
            {
                frente: "Por que usar pipeline em vez de encadear pipe?",
                verso: "Porque o pipeline propaga erro e destrói todas as streams envolvidas quando uma falha. Com pipe encadeado, um erro no meio deixa as outras abertas, vazando descritor e memória. É a diferença entre limpar sozinho e vazar em silêncio.",
            },
            {
                frente: "Como você leria um arquivo enorme linha a linha?",
                verso: "Com uma stream de leitura passada para o utilitário de linhas, iterando com for await. Assim a memória fica constante independentemente do tamanho. Ler tudo e dividir por quebra de linha funciona no teste e derruba na produção.",
            },
            {
                frente: "Como você transformaria dados no meio de um fluxo?",
                verso: "Com uma stream de transformação entre a leitura e a escrita, que recebe pedaços e emite os transformados. É o que permite converter formato ou filtrar registros sem materializar o arquivo inteiro em memória.",
            },
            {
                frente: "Como você trata erro numa stream?",
                verso: "Ouvindo o evento de erro em todas elas, ou deixando o pipeline cuidar disso. Stream sem ouvinte de erro derruba o processo. E é preciso destruir as demais, senão o arquivo continua aberto e a conexão pendurada.",
            },
            {
                frente: "O que o for await permite?",
                verso: "Iterar sobre algo assíncrono, como uma stream ou um gerador, tratando cada item na sua vez. É a forma mais legível de consumir fluxo, e naturalmente respeita a contrapressão, porque o próximo item só é pedido quando o anterior termina.",
            },
            {
                frente: "Como você limitaria a concorrência de várias chamadas assíncronas?",
                verso: "Processando em blocos ou com um limitador que mantém no máximo N em voo. Disparar mil promessas de uma vez abre mil conexões e derruba o dependente. Concorrência controlada costuma ser mais rápida do que tudo de uma vez.",
            },
            {
                frente: "Qual a diferença entre esperar todas e esperar todas com resultado?",
                verso: "A primeira rejeita assim que uma falhar, descartando o resto, e é o que você quer quando tudo é obrigatório. A segunda espera todas e diz o que deu certo e o que não deu, e serve quando falha parcial é aceitável.",
            },
            {
                frente: "Como você colocaria um tempo limite numa promessa?",
                verso: "Correndo a promessa contra um temporizador, ou passando um sinal de aborto quando a API aceita. A segunda forma é melhor porque cancela o trabalho de verdade. Só correr contra o relógio deixa a operação original rodando até o fim.",
            },
            {
                frente: "Como você cancelaria uma requisição HTTP em andamento?",
                verso: "Com um controlador de aborto, passando o sinal para a chamada e abortando quando não interessa mais. Isso libera conexão e evita processar resposta que ninguém vai usar. O sinal precisa ser propagado para as chamadas internas também.",
            },
            {
                frente: "O que acontece com uma exceção lançada dentro de um retorno de chamada assíncrono?",
                verso: "Ela não é capturada pelo try que envolvia a chamada original, porque aquele bloco já terminou. Ela sobe como exceção não capturada e pode derrubar o processo. É um dos motivos de o padrão de promessas ter substituído esse estilo.",
            },
            {
                frente: "O que fazer quando acontece uma exceção não capturada?",
                verso: "Registrar com o máximo de contexto e encerrar o processo, deixando o orquestrador subir outro. Continuar rodando depois disso significa estado desconhecido, com conexão pela metade e dado inconsistente. Reiniciar é a opção conservadora.",
            },
            {
                frente: "Como você faria um encerramento gracioso?",
                verso: "Ouvindo o sinal de término, parando de aceitar conexões novas, esperando as requisições em andamento até um limite, fechando pool de banco e filas, e então saindo. Sem isso, todo deploy devolve erro para quem estava no meio de uma chamada.",
            },
            {
                frente: "Como você estruturaria os erros de uma API Node?",
                verso: "Com uma classe de erro própria carregando status, código estável e mensagem segura, e um tratador único traduzindo para resposta. Assim o resto do código só lança. Cada rota montando a própria resposta de erro é o que gera formatos diferentes.",
            },
            {
                frente: "Como você diferencia erro esperado de defeito?",
                verso: "Erro esperado faz parte do fluxo, como validação e registro não encontrado, e vira resposta de cliente. Defeito é o que não deveria acontecer e precisa de alerta. Tratar os dois igual enche o painel de erro com validação e esconde o que importa.",
            },
            {
                frente: "Por que um erro assíncrono pode não chegar ao middleware de erro?",
                verso: "Porque o framework só captura o que é lançado de forma síncrona ou passado adiante explicitamente, dependendo da versão. Sem embrulhar o tratador ou usar await com try, a rejeição escapa e a requisição fica pendurada até o timeout.",
            },
            {
                frente: "Como você limitaria o tamanho do corpo de uma requisição?",
                verso: "Configurando o limite no interpretador de corpo e, além disso, no servidor de borda. Sem limite, um corpo de centenas de megabytes consome memória e é a forma mais barata de derrubar um serviço Node.",
            },
            {
                frente: "Como você configuraria CORS de forma correta?",
                verso: "Listando as origens permitidas em vez de liberar todas, declarando métodos e cabeçalhos aceitos e tratando a requisição de verificação prévia. Liberar tudo com credenciais é o pior dos casos, porque permite qualquer site chamar a API com o cookie do usuário.",
            },
            {
                frente: "Como você guardaria a senha dos usuários?",
                verso: "Com uma função lenta e com sal, feita para senha, e nunca com hash rápido. No Node isso passa pelo pool de threads, então o custo precisa ser calibrado: parâmetro alto demais enfileira o pool e derruba a latência de todas as rotas.",
            },
            {
                frente: "Como você emitiria e validaria um token de autenticação?",
                verso: "Assinando com chave forte, com expiração curta e conferindo assinatura, expiração, emissor e público em toda requisição. Decodificar sem verificar a assinatura é um erro comum e transforma o token em texto que qualquer um edita.",
            },
            {
                frente: "Como você guardaria uma sessão com várias instâncias?",
                verso: "Num armazenamento compartilhado, como um cache distribuído, e não na memória do processo. Sessão em memória funciona com uma instância e quebra assim que houver duas, com o usuário caindo aleatoriamente conforme o balanceador escolhe.",
            },
            {
                frente: "Como você aplicaria limite de requisições numa API?",
                verso: "Contando por identidade e por rota num armazenamento compartilhado, respondendo com o status próprio e o cabeçalho que diz quando tentar de novo. Contador em memória com várias instâncias permite multiplicar o limite pelo número de processos.",
            },
            {
                frente: "Como você registraria logs úteis numa API?",
                verso: "Em formato estruturado, com nível, identificador de requisição, rota e duração, escrevendo na saída padrão para o coletor do ambiente. Frase concatenada não dá para filtrar nem agregar, e é o que transforma investigação em leitura de texto corrido.",
            },
            {
                frente: "Como você correlacionaria todos os logs de uma requisição?",
                verso: "Gerando ou propagando um identificador no cabeçalho e carregando ele no contexto até o fim da requisição, inclusive nas chamadas a outros serviços. Passar esse identificador por parâmetro em toda função é o que o armazenamento de contexto assíncrono resolve.",
            },
            {
                frente: "Como você testaria uma rota HTTP?",
                verso: "Subindo a aplicação em memória e fazendo a requisição de verdade contra ela, verificando status, corpo e efeito colateral. É mais valioso que testar o tratador isolado, porque exercita middleware, validação e serialização junto.",
            },
            {
                frente: "Como você isolaria o banco nos testes?",
                verso: "Subindo um banco real efêmero em contêiner e limpando entre casos, ou usando transação revertida no fim de cada teste. Substituir o banco por um dublê testa o seu código e não testa a consulta, que é justamente onde os erros aparecem.",
            },
            {
                frente: "O que o executor de testes nativo do Node oferece?",
                verso: "Estrutura de teste, asserções, execução paralela, cobertura e observação, sem dependência externa. Para projeto novo isso costuma bastar. A troca é ter menos ferramentas prontas de dublê e de teste de interface do que os ecossistemas maiores.",
            },
            {
                frente: "Quando um dublê de teste atrapalha mais do que ajuda?",
                verso: "Quando ele reproduz o comportamento que você acha que a dependência tem. O teste passa e a integração quebra. Para banco e serviço externo, é melhor o real efêmero ou a interceptação na camada de rede, que exercita o mesmo caminho.",
            },
            {
                frente: "Como você organizaria as camadas de uma API Node?",
                verso: "Rota cuidando de HTTP, serviço com a regra e um acesso a dado separado, com o domínio sem saber de framework. O sinal de que a fronteira caiu é o objeto de requisição chegando na função que fala com o banco.",
            },
            {
                frente: "Como você faria injeção de dependência sem framework?",
                verso: "Passando as dependências pelo construtor ou por parâmetro de uma função fábrica, montando tudo num ponto só na subida. É simples e testável. Importar o módulo do banco direto dentro do serviço é o que impede substituir no teste.",
            },
            {
                frente: "Como você validaria a configuração na subida?",
                verso: "Lendo todas as variáveis num módulo só, com esquema declarado, convertendo tipos e falhando com mensagem clara se faltar algo. Falhar na subida é muito melhor que descobrir a variável ausente na primeira requisição do dia seguinte.",
            },
            {
                frente: "Como você se conectaria a um banco de dados numa API?",
                verso: "Com um pool criado uma vez na subida e compartilhado, nunca abrindo conexão por requisição. O tamanho do pool precisa caber no que o banco aceita, considerando o número de instâncias. Abrir e fechar por requisição custa mais que a consulta.",
            },
            {
                frente: "O que acontece quando o pool de conexões esgota?",
                verso: "As requisições ficam esperando por uma conexão e a latência sobe, mesmo com o banco tranquilo. O sintoma engana. Costuma ser transação longa segurando conexão, ou chamada externa feita no meio da transação.",
            },
            {
                frente: "Como você trataria uma transação numa API Node?",
                verso: "Abrindo, executando e confirmando ou desfazendo dentro de um bloco que garante o fechamento, com a conexão passada explicitamente para as funções. O erro clássico é fazer chamada HTTP no meio da transação, segurando conexão pelo tempo da rede.",
            },
            {
                frente: "Como você evitaria injeção de SQL em Node?",
                verso: "Usando parâmetros em toda consulta, inclusive nas escritas à mão, e nunca montando SQL por concatenação de texto vindo do usuário. Nome de coluna e ordenação dinâmica não entram como parâmetro, e ali a defesa é aceitar só valores de uma lista fixa.",
            },
            {
                frente: "O que é injeção em banco de documentos, e como evitar?",
                verso: "É o cliente enviar um objeto onde o código espera um valor, transformando a comparação em operador de consulta. A defesa é validar o tipo antes de usar, rejeitando o que não for texto, e nunca passar o corpo da requisição direto para o filtro.",
            },
            {
                frente: "Como você trataria upload de arquivo numa API?",
                verso: "Recebendo em fluxo com limite de tamanho e tipo, gravando direto no armazenamento sem passar tudo pela memória. Melhor ainda é o cliente enviar direto para o armazenamento com uma URL assinada, e a API só registrar o resultado.",
            },
            {
                frente: "Como você versionaria uma API?",
                verso: "Por caminho quando a quebra é grande e visível, mantendo as duas versões por um tempo com prazo de descontinuação. Antes disso, vale evoluir sem quebrar: acrescentar campo, nunca mudar significado, e manter o cliente tolerante ao que não conhece.",
            },
            {
                frente: "O que torna uma rota idempotente, e por que isso importa?",
                verso: "Repetir a chamada com a mesma entrada produzir o mesmo efeito. Importa porque rede repete: cliente reenvia, proxy repete, usuário clica de novo. Sem isso, uma cobrança pode acontecer duas vezes por causa de uma resposta perdida.",
            },
            {
                frente: "Como você trataria data e fuso numa API Node?",
                verso: "Guardando instante em UTC, trafegando em formato padrão e convertendo só na apresentação. O objeto de data nativo é limitado e cheio de armadilhas, então operação de calendário costuma pedir biblioteca. Somar milissegundos erra no horário de verão.",
            },
            {
                frente: "Como você representaria valores monetários?",
                verso: "Em inteiro de menor unidade, como centavos, ou com uma biblioteca de decimal. Número de ponto flutuante acumula erro e faz o total fechar errado. Em JSON, valor muito grande também estoura a precisão do número, e aí o certo é trafegar como texto.",
            },
            {
                frente: "Quando um cache em memória é a escolha errada?",
                verso: "Quando existem várias instâncias e o dado precisa ser coerente entre elas, ou quando ele cresce sem limite. Cache em memória sem tamanho máximo é vazamento com outro nome, e é uma das causas mais comuns de processo crescendo devagar.",
            },
            {
                frente: "Como você faria paginação de uma listagem grande?",
                verso: "Por cursor, usando o último identificador visto, em vez de deslocamento, que obriga o banco a percorrer e descartar tudo antes. A resposta informa se há mais e qual o próximo cursor. A troca é perder o salto direto para uma página específica.",
            },
            {
                frente: "Como você documentaria uma API para quem consome?",
                verso: "Com uma especificação gerada a partir do código ou validada contra ele, com exemplos de requisição, resposta e erro. Documento escrito à parte envelhece em semanas, e é pior que não ter, porque as pessoas confiam nele.",
            },
            {
                frente: "Como você lidaria com dependências nativas num projeto?",
                verso: "Sabendo que elas compilam por plataforma e versão do Node, então a imagem precisa ter as ferramentas certas e a instalação precisa acontecer no mesmo ambiente de destino. Copiar a pasta de dependências do computador para o contêiner é o erro clássico.",
            },
            {
                frente: "Como você trataria uma resposta HTTP com status de erro numa chamada externa?",
                verso: "Checando o status explicitamente, porque a API de busca do navegador e do Node não rejeita em quatrocentos ou quinhentos. Sem essa checagem, o código segue tentando ler o corpo como se tudo tivesse dado certo.",
            },
            {
                frente: "Como você repetiria uma chamada externa que falhou?",
                verso: "Só para erro transitório, com poucas tentativas, espera crescente e um pouco de aleatoriedade, e nunca em operação que não é idempotente. Repetir erro de validação é desperdício, e repetir em massa durante uma queda derruba quem estava se recuperando.",
            },
            {
                frente: "Como você lidaria com um serviço externo que às vezes demora muito?",
                verso: "Timeout em toda chamada, sempre, porque sem ele a requisição fica pendurada até o outro lado desistir. Somado a limite de concorrência para aquele destino, evitando que a lentidão dele consuma toda a capacidade do seu serviço.",
            },
            {
                frente: "Como você processaria uma tarefa demorada disparada por uma rota?",
                verso: "Aceitando o pedido, gravando o trabalho numa fila e devolvendo aceito com uma forma de acompanhar. Fazer o trabalho dentro da requisição segura conexão, estoura timeout do balanceador e perde tudo se o processo reiniciar.",
            },
            {
                frente: "Como você agendaria uma rotina periódica?",
                verso: "Com um agendador que coordene entre instâncias, ou com trava compartilhada, porque um temporizador dentro do processo roda em todas as réplicas. E toda rotina precisa ser idempotente, porque ela vai rodar duas vezes algum dia.",
            },
            {
                frente: "Como você lidaria com um evento que chega duas vezes?",
                verso: "Guardando o identificador já processado e ignorando repetição, ou desenhando a operação para ser idempotente. Entrega ao menos uma vez é o padrão das filas, então duplicata não é exceção: é comportamento esperado.",
            },
            {
                frente: "Como você faria a verificação de saúde de um serviço Node?",
                verso: "Separando a que diz que o processo está vivo da que diz que ele está pronto, sendo que a de prontidão checa dependências essenciais. Verificação que consulta o banco a cada segundo vira carga, e tira o serviço de rotação por qualquer soluço.",
            },
            {
                frente: "Como você exporia métricas de uma API Node?",
                verso: "Contando requisições por rota e status, medindo duração em histograma, e expondo o atraso do laço de eventos e a memória. O atraso do laço é a métrica mais específica do Node, e é a que aponta bloqueio antes de virar latência para todo mundo.",
            },
            {
                frente: "Como você trataria dados sensíveis nos logs?",
                verso: "Com uma lista de campos mascarados na serialização do log e nunca registrando corpo inteiro de requisição. Log é copiado para vários lugares e fica muito tempo, então senha ou token que caiu ali precisa ser tratado como vazado.",
            },
            {
                frente: "Como você lidaria com uma variável de ambiente diferente entre ambientes?",
                verso: "Lendo tudo num módulo de configuração com valores padrão explícitos, e falhando quando obrigatório faltar. Espalhar leituras de ambiente pelo código faz surgir variável que só uma parte conhece, e ela é sempre a que falta no deploy.",
            },
            {
                frente: "Como você trataria diferenças entre desenvolvimento e produção no código?",
                verso: "Reduzindo ao mínimo, e sempre por configuração explícita, não por checagem de ambiente espalhada. Caminho que só roda em produção é caminho que ninguém testou, e é onde o erro aparece justamente quando dói mais.",
            },
            {
                frente: "Como você faria a subida da aplicação falhar cedo?",
                verso: "Validando configuração, testando a conexão com as dependências essenciais e saindo com código de erro se algo faltar. Subir e responder erro em toda requisição é pior que não subir: o orquestrador acha que está tudo bem.",
            },
            {
                frente: "Como você compartilharia código entre dois serviços Node?",
                verso: "Com um pacote interno versionado, e não copiando arquivo entre repositórios. Compartilhar cedo demais acopla os dois serviços a um ciclo de release comum, então vale reservar isso para o que é realmente estável, como contrato e utilitário.",
            },
            {
                frente: "Como você trataria uma expressão regular que veio do usuário?",
                verso: "Não aceitando, na maior parte dos casos. Expressão maliciosa provoca explosão de tempo de execução e trava a thread única inteira. Se for inevitável, é preciso um mecanismo com limite de tempo, fora do processo que atende requisições.",
            },
            {
                frente: "Como você limitaria o que uma rota pode devolver de dado?",
                verso: "Serializando por um tipo de saída explícito, e não devolvendo o objeto do banco. Assim campo novo não vaza sozinho quando alguém acrescenta uma coluna. Devolver o registro inteiro é como senha em hash e campos internos acabam expostos.",
            },
            {
                frente: "Como você trataria uma dependência que faz efeito colateral ao ser importada?",
                verso: "Isolando a importação atrás de uma função de inicialização, para o efeito acontecer quando você escolher. Módulo que conecta no banco ao ser importado quebra teste e torna a ordem de importação parte do comportamento.",
            },
        ],
        pleno: [
            {
                frente: "Como você investigaria um vazamento de memória num serviço Node?",
                verso: "Confirmando pelo gráfico de memória que sobe e não volta depois das coletas, e tirando dois retratos do heap em momentos diferentes para comparar o que cresceu. O caminho de retenção costuma apontar cache sem limite, ouvinte acumulado ou fechamento guardando contexto.",
            },
            {
                frente: "O que costuma vazar memória em Node?",
                verso: "Ouvinte de evento registrado a cada requisição e nunca removido, cache em memória sem tamanho máximo, mapa global crescendo por chave de usuário, e temporizador que nunca é limpo. Todos parecem inofensivos e só aparecem depois de horas de tráfego.",
            },
            {
                frente: "Como você perfilaria CPU num serviço em produção?",
                verso: "Coletando um perfil por amostragem durante a janela de lentidão, com o inspetor ou uma ferramenta contínua, e olhando o gráfico de chamadas. O que aparece no topo costuma ser serialização, expressão regular ou criptografia, e não a lógica que se suspeitava.",
            },
            {
                frente: "O que fazer quando o atraso do laço de eventos está alto?",
                verso: "Achar o trecho síncrono que domina: serialização de objeto gigante, laço sobre coleção grande, hash de senha malcalibrado ou compressão feita no processo. A correção é dividir, mover para thread de trabalho ou empurrar para a borda.",
            },
            {
                frente: "Como você dimensionaria processos e instâncias de um serviço Node?",
                verso: "Um processo por núcleo disponível, seja com cluster, seja com várias réplicas pequenas no orquestrador. Réplicas pequenas costumam ser melhores, porque o orquestrador já sabe distribuir e reiniciar. Mais processos que núcleos só aumenta troca de contexto.",
            },
            {
                frente: "Quando threads de trabalho realmente valem?",
                verso: "Quando existe cálculo pesado e frequente que precisa do resultado na mesma requisição, como processar imagem ou fazer parsing pesado. Para tarefa rara, um processo separado ou uma fila é mais simples. Elas não deixam entrada e saída mais rápida.",
            },
            {
                frente: "Como você compartilharia dados entre threads de trabalho?",
                verso: "Por mensagem, que copia, ou por buffer compartilhado quando o volume justifica evitar a cópia. Objeto comum não é compartilhado. Passar estruturas grandes de um lado para o outro toda hora pode custar mais que o cálculo que se queria acelerar.",
            },
            {
                frente: "Como você lidaria com estado em memória quando o serviço tem várias instâncias?",
                verso: "Tirando o estado do processo: cache e sessão vão para um armazenamento compartilhado, e o processo passa a ser descartável. Estado em memória sobrevive enquanto há uma instância e falha de forma intermitente quando surge a segunda, o que é pior de diagnosticar.",
            },
            {
                frente: "Como você propagaria o contexto de uma requisição por chamadas assíncronas?",
                verso: "Com o armazenamento de contexto assíncrono, que mantém o valor disponível ao longo da cadeia sem passar por parâmetro. É o que permite ter identificador de requisição no log de qualquer camada. Variável de módulo para isso mistura requisições.",
            },
            {
                frente: "Como você instrumentaria rastreamento distribuído?",
                verso: "Com a biblioteca padrão de instrumentação, que já enxerta nos módulos de HTTP e banco e propaga o contexto por cabeçalho. O trabalho manual fica para as fronteiras próprias, como consumo de fila. Sem propagação, cada serviço vira um rastro solto.",
            },
            {
                frente: "Como você trataria log em volume muito alto?",
                verso: "Reduzindo nível em produção, amostrando o que é repetitivo e mantendo cem por cento de erro. Escrita de log é trabalho síncrono na thread principal dependendo do destino, então log excessivo vira latência, além de custo de armazenamento.",
            },
            {
                frente: "Como você containerizaria um serviço Node?",
                verso: "Com build em múltiplos estágios, instalando dependências de produção na imagem final, usuário sem privilégio, e o processo Node como principal para receber os sinais. Copiar a pasta de dependências do computador quebra dependência nativa.",
            },
            {
                frente: "Por que o processo Node precisa receber os sinais no contêiner?",
                verso: "Porque é assim que ele sabe que precisa encerrar graciosamente. Se um shell for o processo principal, ele pode não repassar o sinal, e o orquestrador acaba matando à força depois do prazo, cortando requisições em andamento.",
            },
            {
                frente: "Como você definiria o limite de memória de um contêiner Node?",
                verso: "Medindo o uso real sob carga e deixando folga acima do heap, porque buffers e memória fora do heap somam. O limite do heap precisa ficar abaixo do limite do contêiner, senão o processo é morto pelo sistema antes de qualquer erro de memória do próprio Node.",
            },
            {
                frente: "O que acontece quando o Node bate no limite de heap?",
                verso: "Ele lança erro de memória esgotada e o processo morre, deixando rastro. Se o limite do contêiner for atingido antes, o sistema mata sem rastro nenhum, e o sintoma é o serviço sumindo sem log, o que engana bastante na investigação.",
            },
            {
                frente: "Como você reduziria o tamanho da imagem de um serviço Node?",
                verso: "Base enxuta, instalação só de dependências de produção, arquivos desnecessários fora com a lista de ignorados, e nada de ferramentas de build na imagem final. Imagem menor sobe mais rápido e reduz a superfície de vulnerabilidade.",
            },
            {
                frente: "Como você garantiria que a esteira instala exatamente o que foi testado?",
                verso: "Com instalação limpa a partir do arquivo de trava, que falha se ele estiver fora de sincronia com o manifesto. Somado a cache de dependências por hash do arquivo de trava. Instalação normal na esteira permite subir versão sem ninguém aprovar.",
            },
            {
                frente: "Como você conduziria a migração de CommonJS para módulos ES?",
                verso: "Por pacote e não por arquivo solto, ajustando o tipo do projeto, extensões nas importações e as variáveis de caminho. As dependências ainda em CommonJS continuam funcionando, mas o caminho contrário é o que dói: pacote só de módulo ES não é importável por require antigo.",
            },
            {
                frente: "Que problemas aparecem misturando os dois formatos de módulo?",
                verso: "Importação padrão que vem embrulhada num objeto, ausência de importação nomeada em pacote CommonJS, e ferramenta que resolve diferente do Node. O sintoma é a função existir no depurador e ser indefinida no import.",
            },
            {
                frente: "Como você escolheria entre compilar TypeScript e executá-lo direto?",
                verso: "Execução direta com remoção de tipos simplifica o ciclo e o Node moderno já faz isso, mas ela não checa nada: a checagem continua sendo um passo à parte. Compilar gera artefato previsível e mapas de origem. Os dois exigem checagem de tipos na esteira.",
            },
            {
                frente: "Por que tipos não protegem a borda da aplicação?",
                verso: "Porque eles desaparecem em tempo de execução: o corpo da requisição é declarado como um tipo e chega como qualquer coisa. A borda precisa de validação de verdade, que checa e converte. Confiar no tipo declarado é o erro mais comum em API TypeScript.",
            },
            {
                frente: "Como você faria streaming de uma resposta grande?",
                verso: "Escrevendo direto na resposta em pedaços, respeitando contrapressão, com o tipo de conteúdo correto e sem acumular tudo antes. Isso derruba o uso de memória e faz o cliente começar a receber antes. Vale também tratar o cliente que desconecta no meio.",
            },
            {
                frente: "Como você serviria arquivos grandes para download?",
                verso: "Delegando para o armazenamento com URL assinada, ou transmitindo em fluxo com suporte a faixa de bytes para permitir retomar. Ler o arquivo inteiro e enviar consome memória proporcional ao número de downloads simultâneos.",
            },
            {
                frente: "Como você lidaria com conexões longas, como eventos do servidor?",
                verso: "Contando com o custo de manter conexões abertas, com envio periódico para o intermediário não derrubar, e reconexão do lado do cliente. Um processo Node segura muitas conexões ociosas bem, mas cada uma ainda ocupa memória e descritor.",
            },
            {
                frente: "Como você escalaria WebSocket em várias instâncias?",
                verso: "Com sessão fixa ou com um barramento de mensagens entre as instâncias, porque o cliente conectado a uma não é visto pela outra. Sem isso, mensagem enviada para uma sala só chega a quem estiver na mesma réplica, e o bug parece aleatório.",
            },
            {
                frente: "Como você trataria reconexão numa conexão em tempo real?",
                verso: "Com espera crescente e aleatória do lado do cliente, e um mecanismo de retomada a partir do último evento recebido. Sem espera crescente, uma queda do servidor traz todos os clientes de volta ao mesmo tempo e impede a recuperação.",
            },
            {
                frente: "Como você trataria uma fila de trabalhos que começou a crescer?",
                verso: "Olhando primeiro se é produção acima do consumo ou consumidor travado, e só então escalando consumidores. Fila crescendo com consumidor ocioso é sinal de mensagem envenenada ou de trava. Escalar sem entender pode multiplicar o problema.",
            },
            {
                frente: "Como você garantiria que um trabalho da fila não rode duas vezes?",
                verso: "Com identificador de trabalho e registro do que já foi processado, ou desenhando o efeito para ser idempotente. Confirmar a mensagem só depois de concluir também importa, mas isso garante ao menos uma vez, e não exatamente uma vez.",
            },
            {
                frente: "Como você lidaria com um trabalho que falha sempre?",
                verso: "Limitando tentativas, com espera crescente, e mandando para uma fila de mensagens mortas com contexto suficiente para reprocessar depois. Sem esse desvio, a mensagem envenenada trava o consumo e para tudo que estava atrás dela.",
            },
            {
                frente: "Como você identificaria uma consulta lenta a partir da aplicação?",
                verso: "Instrumentando duração por consulta e registrando as que passam de um limite, com o texto e o tempo. Depois olhando o plano no banco. Sem essa medição, lentidão de banco aparece como latência da rota e leva a otimizar o lugar errado.",
            },
            {
                frente: "Como você evitaria o problema de N+1 consultas com um ORM?",
                verso: "Carregando as associações necessárias numa consulta só ou agrupando por lote. Aparece ligando o registro de consultas e vendo a mesma instrução repetida com parâmetros diferentes. É o erro de desempenho mais comum em API com ORM.",
            },
            {
                frente: "Como você decidiria entre ORM e SQL escrito à mão?",
                verso: "ORM para o trivial, que é a maior parte, e SQL para consulta analítica e atualização em massa, onde ele atrapalha. Os dois convivem no mesmo projeto. Trocar o ORM inteiro por causa de três consultas raramente compensa.",
            },
            {
                frente: "Como você aplicaria migrações de schema num serviço Node?",
                verso: "Com scripts versionados no repositório, aplicados num passo separado do deploy, e nunca editando migração já aplicada. Rodar migração na subida de cada instância cria corrida entre réplicas e trava a subida quando a migração é pesada.",
            },
            {
                frente: "Como você faria deploy sem indisponibilidade?",
                verso: "Com verificação de prontidão, subida gradual das novas instâncias e encerramento gracioso das antigas, mantendo compatibilidade de schema nos dois sentidos por uma versão. Sem encerramento gracioso, todo deploy corta requisições em andamento.",
            },
            {
                frente: "Como você reduziria o tempo de subida de um serviço Node?",
                verso: "Medindo o que demora: costuma ser importação de dependências pesadas no topo, conexão feita em série na subida e leitura de arquivo grande. Importar sob demanda o que só é usado em uma rota ajuda, e conectar em paralelo também.",
            },
            {
                frente: "Como você faria um teste de carga que diga algo útil?",
                verso: "Com carga parecida com a real em mistura de rotas e dados, subindo aos poucos até achar o ponto de saturação, e olhando latência por percentil junto com erro. Disparar mil requisições iguais em um endpoint mede o cache, e não o sistema.",
            },
            {
                frente: "Como você interpretaria o resultado de um teste de carga?",
                verso: "Procurando onde a latência começa a subir sem o rendimento acompanhar, que é a saturação. Depois identificando o recurso limitante: CPU, laço de eventos, pool de conexões ou dependente externo. Número de requisições por segundo sozinho não diz nada.",
            },
            {
                frente: "Como você testaria integração com um serviço externo?",
                verso: "Interceptando na camada HTTP com respostas gravadas, e mantendo um teste de contrato contra o ambiente real rodando fora do caminho crítico. Substituir a função do cliente esconde erro de URL, cabeçalho e serialização, que é onde a integração quebra.",
            },
            {
                frente: "Como você trataria segredo de forma segura numa aplicação Node?",
                verso: "Injetado por variável de ambiente ou lido de um cofre na subida, nunca no repositório, com rotação prevista e sem aparecer em log nem em mensagem de erro. Vale ter varredura automática no repositório, porque o vazamento costuma ser acidental.",
            },
            {
                frente: "Como você reagiria a uma vulnerabilidade numa dependência?",
                verso: "Verificando se o caminho vulnerável é realmente usado, o que define a urgência, e corrigindo pela versão. Se não houver correção, isolar o uso ou trocar a biblioteca. E registrar, porque auditoria e cliente vão perguntar depois.",
            },
            {
                frente: "Como você reduziria o risco de um pacote malicioso entrar no projeto?",
                verso: "Fixando versões pela trava, revisando dependência nova como se fosse código próprio, desligando scripts de instalação quando possível e usando verificação automática na esteira. Instalar pacote com nome parecido com o certo é um ataque comum e barato.",
            },
            {
                frente: "Como você trataria dados pessoais numa API?",
                verso: "Coletando o mínimo, cifrando em trânsito e no repouso, mascarando em log, com retenção definida e caminho para exclusão. E limitando quem consegue consultar no banco. A parte esquecida costuma ser o ambiente de homologação com cópia da produção.",
            },
            {
                frente: "Como você lidaria com uma rota que precisa chamar três serviços?",
                verso: "Disparando as chamadas independentes em paralelo, com timeout por chamada e um orçamento total para a requisição, e decidindo o que é essencial. Encadear em sequência soma as latências, e sem orçamento total a requisição fica presa pelo mais lento.",
            },
            {
                frente: "Como você evitaria que a lentidão de um dependente derrube o serviço?",
                verso: "Limitando a concorrência por destino, com timeout curto e disjuntor, e devolvendo resposta degradada. Sem limite, requisições presas se acumulam consumindo memória e conexões, e a queda de um dependente vira indisponibilidade total.",
            },
            {
                frente: "Como você lidaria com um pico de tráfego repentino?",
                verso: "Com limite de requisições na borda, fila para o que não precisa ser síncrono e escalonamento automático com folga, sabendo que subir instância leva tempo. Aceitar tudo e cair é pior que recusar parte com resposta clara.",
            },
            {
                frente: "Como você trataria compressão de resposta?",
                verso: "Deixando com o servidor de borda quando existe, porque comprimir no processo Node consome CPU da thread que atende requisições. Se for no Node, com limite de tamanho mínimo e sem comprimir o que já é comprimido, como imagem.",
            },
            {
                frente: "Como você lidaria com serialização de objetos muito grandes?",
                verso: "Evitando: paginar, projetar só os campos usados ou transmitir em fluxo. Serializar para JSON é síncrono e bloqueia o laço de eventos proporcionalmente ao tamanho, então uma resposta de dezenas de megabytes atrasa todas as outras requisições.",
            },
            {
                frente: "Como você trataria erro de conexão com o banco em tempo de execução?",
                verso: "Com repetição limitada na obtenção da conexão, verificação de prontidão refletindo o estado real e resposta de indisponibilidade em vez de erro genérico. E sem derrubar o processo a cada oscilação, senão o serviço entra em ciclo de reinício.",
            },
            {
                frente: "Como você garantiria que os testes não dependem uns dos outros?",
                verso: "Cada teste criando o próprio dado com identificadores únicos e limpando o que criou, e rodando em ordem aleatória de vez em quando para expor dependência escondida. Banco compartilhado com dado fixo é a origem clássica de teste que só passa numa ordem.",
            },
            {
                frente: "Como você trataria testes que dependem de tempo?",
                verso: "Injetando o relógio ou usando temporizadores falsos, para não haver espera real nem falha na virada do dia. Teste que espera dois segundos de verdade multiplica o tempo da suíte e ainda falha em máquina lenta.",
            },
            {
                frente: "Como você mediria a cobertura sem transformar o número em meta cega?",
                verso: "Olhando cobertura como mapa do que não é exercitado, principalmente em caminho de erro, e não como nota. Meta alta imposta produz teste que executa código sem verificar nada, o que dá falsa segurança e ainda custa manutenção.",
            },
            {
                frente: "Como você organizaria a configuração de vários ambientes?",
                verso: "Um esquema único com valores vindos do ambiente, sem arquivo por ambiente dentro do repositório, e valores padrão só para o que é seguro. Assim o que muda entre ambientes fica visível numa lista, e não espalhado em condicionais pelo código.",
            },
            {
                frente: "Como você trataria a diferença de fuso entre servidor e banco?",
                verso: "Padronizando UTC em todos os pontos e convertendo só na apresentação, com o driver configurado explicitamente. Metade dos erros de uma hora vem de servidor com fuso local e banco em UTC, ou o contrário, sem ninguém ter escolhido.",
            },
            {
                frente: "Como você identificaria qual rota está consumindo mais recursos?",
                verso: "Com métricas por rota de duração, contagem e erro, mais perfil de CPU segmentado por período. Costuma ser uma rota pouco chamada e muito cara, e não a mais popular. Sem separar por rota, o número agregado esconde o culpado.",
            },
            {
                frente: "Como você trataria uma requisição que precisa de resposta rápida mas de trabalho lento?",
                verso: "Respondendo com o que dá para responder e enfileirando o resto, com um recurso para consultar o resultado ou um aviso quando terminar. É melhor que segurar a conexão e depender de o cliente e o proxy esperarem sem desistir.",
            },
            {
                frente: "Como você lidaria com clientes que fazem muitas requisições pequenas?",
                verso: "Oferecendo um recurso que devolva o conjunto de uma vez, com cache e limite de requisições no meio tempo. Cada requisição carrega custo fixo de conexão e autenticação, então cem chamadas pequenas custam mais que uma grande bem desenhada.",
            },
            {
                frente: "Como você trataria uma dependência que só falha em produção?",
                verso: "Reproduzindo o ambiente antes do código: versão, variáveis, latência, certificado e volume de dado. Log com contexto suficiente e um cenário reproduzível valem mais que tentativa às cegas com deploy a cada hipótese.",
            },
            {
                frente: "Como você trataria memória crescendo lentamente em produção?",
                verso: "Instrumentando memória por instância, comparando com o tráfego e tirando retratos do heap periodicamente. Reiniciar por horário esconde o problema e é aceitável como medida temporária, desde que registrado com prazo para investigar.",
            },
            {
                frente: "Como você decidiria entre cache em memória e cache distribuído?",
                verso: "Cache em memória para dado pequeno, muito lido e que tolera divergir entre instâncias, sempre com limite de tamanho. Distribuído quando a coerência importa ou o volume não cabe. A conta inclui a chamada de rede a cada acesso.",
            },
            {
                frente: "Como você invalidaria cache depois de uma escrita?",
                verso: "Removendo a chave na mesma operação que escreve, ou trabalhando com vencimento curto quando dado velho por alguns segundos é aceitável. Invalidação espalhada por vários pontos é o que gera aquele dado antigo que só some quando o processo reinicia.",
            },
            {
                frente: "Como você lidaria com muitas chaves de cache vencendo ao mesmo tempo?",
                verso: "Espalhando o vencimento com uma variação aleatória e deixando só uma requisição recalcular enquanto as outras servem o valor antigo. Sem isso, a carga cai inteira no banco no mesmo segundo e derruba justamente no pico.",
            },
            {
                frente: "Como você trataria autenticação entre serviços internos?",
                verso: "Com credencial própria por serviço e verificação da identidade de quem chama, e não confiando na rede interna. Rede interna já foi considerada segura por padrão, e é assim que um serviço comprometido passa a acessar tudo.",
            },
            {
                frente: "Como você faria a rotação de uma credencial em uso?",
                verso: "Aceitando as duas por um período, trocando quem emite e só depois revogando a antiga. Sem essa sobreposição, a troca precisa ser simultânea em todos os pontos, o que sempre esquece um consumidor e vira incidente.",
            },
            {
                frente: "Como você trataria requisições concorrentes que alteram o mesmo registro?",
                verso: "Com trava otimista por versão, devolvendo conflito para o cliente refazer com o dado atual, ou com trava no banco quando o conflito é frequente. Ler, alterar em memória e gravar sem checagem é onde a atualização de um se perde.",
            },
            {
                frente: "Como você lidaria com um endpoint que precisa processar um arquivo enviado?",
                verso: "Recebendo em fluxo, gravando no armazenamento e enfileirando o processamento, devolvendo aceito. Processar no meio da requisição segura conexão, gasta memória e perde tudo se o processo reiniciar no meio.",
            },
            {
                frente: "Como você garantiria que o serviço se comporta igual em todas as instâncias?",
                verso: "Tirando estado do processo, garantindo mesma imagem e mesma configuração, e evitando comportamento dependente de tempo de subida. Diferença entre réplicas produz erro intermitente que só acontece com parte dos usuários, e é dos mais caros de achar.",
            },
            {
                frente: "Como você trataria uma dependência que exige inicialização assíncrona?",
                verso: "Inicializando na subida antes de aceitar tráfego, e refletindo isso na verificação de prontidão. Inicializar preguiçosamente na primeira requisição transforma a primeira chamada em lenta e cria corrida quando várias chegam juntas.",
            },
            {
                frente: "Como você lidaria com uma biblioteca que bloqueia a thread principal?",
                verso: "Medindo o custo dela com o atraso do laço, e movendo para thread de trabalho ou processo separado se for realmente necessária. Se existir versão assíncrona, é a primeira escolha. Biblioteca síncrona em caminho quente é um gargalo invisível no código.",
            },
            {
                frente: "Como você lidaria com um serviço que precisa manter ordem de processamento?",
                verso: "Particionando por chave, para tudo de um mesmo cliente cair no mesmo consumidor, em vez de exigir ordem global. Ordem total custa concorrência e vira gargalo. E mesmo assim é preciso tolerar reprocessamento, porque a entrega repete.",
            },
            {
                frente: "Como você monitoraria se o serviço está saudável de verdade?",
                verso: "Por sintoma do usuário: latência por percentil, taxa de erro e rendimento, mais o atraso do laço de eventos e a memória. Alerta em uso de CPU sozinho gera ruído; alerta em erro e latência aponta o que a pessoa realmente precisa olhar.",
            },
        ],
        senior: [
            {
                frente: "Quando você não usaria Node num projeto novo?",
                verso: "Quando o trabalho é dominado por CPU, quando o ecossistema da área é outro, como ciência de dados, ou quando o time não sustenta JavaScript no servidor. Node brilha em entrada e saída e em produtividade com o mesmo idioma do front, e não em cálculo pesado.",
            },
            {
                frente: "Como você escolheria o framework HTTP de um serviço Node?",
                verso: "Pelo que o time sustenta e pelo que o projeto precisa: maturidade do ecossistema, desempenho e quanto de estrutura você quer imposta. A escolha importa menos do que parece; o que dói depois é ter cinco serviços cada um com um framework diferente.",
            },
            {
                frente: "Como você avaliaria adotar um framework opinativo com injeção de dependência?",
                verso: "Pelo tamanho do time e pela quantidade de serviços: estrutura imposta ajuda a padronizar entre muitos times e cobra em cerimônia e curva de aprendizado. Para um serviço pequeno com duas pessoas, ele costuma entregar mais arquivo que valor.",
            },
            {
                frente: "Como você avaliaria funções sem servidor contra contêineres?",
                verso: "Pelo perfil de tráfego e pelo custo de operar. Carga esporádica e picos ganham com escala a zero; carga constante costuma sair mais barata em contêiner. A conta precisa incluir subida a frio, limite de tempo e conexões de banco por instância.",
            },
            {
                frente: "Como você padronizaria a estrutura entre vários serviços Node?",
                verso: "Com um modelo de projeto pronto que já traz log, configuração, erro, saúde e esteira, e uma biblioteca pequena para o que atravessa. Padrão em documento não sobrevive; padrão que nasce com o serviço sim.",
            },
            {
                frente: "Como você definiria a política de dependências de um time?",
                verso: "Poucas e revisadas: cada uma precisa de motivo, dono e caminho de saída. Verificação automática de vulnerabilidade e atualização contínua em vez de mutirão anual. O ecossistema Node facilita instalar demais, e é isso que produz árvore com mil pacotes.",
            },
            {
                frente: "Como você conduziria a adoção de TypeScript numa base JavaScript grande?",
                verso: "Ligando arquivo por arquivo, começando pelas bordas e pelo que é compartilhado, com regras estritas chegando aos poucos e checagem obrigatória na esteira desde o primeiro dia. Converter tudo de uma vez produz um mar de tipos frouxos que não protegem nada.",
            },
            {
                frente: "Como você conduziria a atualização da versão do Node em produção?",
                verso: "Subindo em ambiente igual ao de produção, rodando a suíte, revisando dependências nativas e mudanças de comportamento, e liberando com monitoramento por versão. O bloqueio real costuma ser dependência nativa antiga, e não o Node.",
            },
            {
                frente: "Como você lidaria com um serviço rodando numa versão do Node fora de suporte?",
                verso: "Tratando como risco de segurança com prazo, não como preferência. Primeiro subir para a versão de longo prazo mais próxima, resolvendo dependências, e depois seguir. Ficar sem correção de segurança é decisão, mesmo quando ninguém decidiu.",
            },
            {
                frente: "Como você desenharia o contrato entre dois serviços?",
                verso: "Escrito primeiro e acordado, com exemplo de sucesso e de erro, compatibilidade só aditiva e teste de contrato mantendo isso honesto. Combinar por conversa e integrar no fim é o que estoura prazo dos dois lados.",
            },
            {
                frente: "Como você evitaria acoplamento entre serviços pelo banco de dados?",
                verso: "Dando dono a cada tabela e obrigando o resto a passar por API ou evento. Serviço lendo a tabela do outro parece atalho e transforma toda migração em coordenação. Enquanto não dá para separar, ao menos escrita só pelo dono.",
            },
            {
                frente: "Como você decidiria dividir um serviço Node em dois?",
                verso: "Por escala independente ou por dono diferente, e não por estética. Se a fronteira não está clara entre módulos do mesmo projeto, ela não fica clara atravessando a rede: você ganha latência, falha parcial e deploy coordenado.",
            },
            {
                frente: "Como você avaliaria uma arquitetura orientada a eventos para o seu time?",
                verso: "Perguntando qual acoplamento ela desfaz e quem opera a fila. Ela paga com vários consumidores e picos a absorver. Sem isso, troca chamada simples por depuração distribuída, ordem duvidosa e reprocessamento que ninguém desenhou.",
            },
            {
                frente: "Como você trataria consistência entre serviços sem transação distribuída?",
                verso: "Com passos compensáveis e mensagens gravadas na mesma transação do dado, aceitando consistência eventual e deixando isso explícito para o produto. Prometer consistência forte entre serviços é o que leva a inventar transação distribuída caseira.",
            },
            {
                frente: "Como você mediria a saúde de um serviço Node em produção?",
                verso: "Latência por percentil e por rota, taxa de erro, rendimento, atraso do laço de eventos, memória e saturação do pool de conexões. Esses dois últimos são os que mais explicam incidente de latência sem culpa aparente no código.",
            },
            {
                frente: "Como você decidiria o que vira alerta?",
                verso: "O que exige alguém agir agora, ligado ao sintoma do usuário: erro e latência acima do acordado. Causa provável fica no painel. Alerta que ninguém age treina o time a ignorar, e o próximo, que era real, também passa despercebido.",
            },
            {
                frente: "Como você reduziria o ruído de alertas do time?",
                verso: "Revisando o que disparou no último mês e quantos exigiram ação, apagando o resto, agregando duplicados e agrupando por incidente. Alerta bom tem dono, ação clara e história de ser útil. Ruído é o que faz plantão virar castigo.",
            },
            {
                frente: "Como você conduziria um incidente num serviço Node?",
                verso: "Restaurando primeiro: reverter, desligar a funcionalidade nova ou reiniciar o processo que está com memória estourada. Uma pessoa coordenando e comunicando. Investigar causa raiz com o serviço fora do ar é como se perde a madrugada.",
            },
            {
                frente: "Como você conduziria a análise depois do incidente?",
                verso: "Sem procurar culpado, com linha do tempo, o que faltou detectar e o que atrasou a recuperação, e poucas ações com dono e prazo. Documento sem ação vira ritual, e o mesmo incidente volta em alguns meses com outro nome.",
            },
            {
                frente: "Como você organizaria o plantão de um time pequeno?",
                verso: "Com escala previsível, alertas enxutos e o poder de agir sem pedir permissão, incluindo reverter. Runbook curto por alerta. Plantão sem autonomia e sem alerta confiável só produz gente cansada e resposta lenta.",
            },
            {
                frente: "Como você lidaria com um monólito Node que ficou grande demais?",
                verso: "Definindo módulos com fronteira clara dentro do mesmo processo primeiro, e extraindo só o que tem escala ou dono diferente. Monólito organizado entrega quase todos os ganhos sem o custo de rede. Quebrar tudo de uma vez troca um problema por vários.",
            },
            {
                frente: "Como você trataria o custo de nuvem de um serviço Node crescendo?",
                verso: "Olhando custo por requisição e não a fatura total: instâncias superdimensionadas, log em excesso, tráfego entre zonas e chamada a serviço pago por uso. Costuma dar mais resultado cortar log e ajustar limites do que otimizar código.",
            },
            {
                frente: "Como você decidiria entre escalar horizontalmente e otimizar o código?",
                verso: "Medindo onde está a saturação. Se é CPU do processo, escalar resolve e custa dinheiro; se é banco ou trava compartilhada, escalar piora. Otimizar vale quando o gargalo é seu e a mudança é localizada. As duas coisas competem por tempo do time.",
            },
            {
                frente: "Como você planejaria capacidade para um evento de pico?",
                verso: "Medindo o que uma instância aguenta hoje, projetando com folga, testando com carga antes e definindo o plano de degradação. O gargalo raramente é o Node: costuma ser banco, pool de conexões e serviço externo com limite de taxa.",
            },
            {
                frente: "Como você definiria padrão de erro e de log entre times?",
                verso: "Como biblioteca compartilhada, com formato de resposta, catálogo de códigos e log estruturado com os mesmos nomes de campo. Assim uma consulta em incidente funciona em todos os serviços. Padrão só documentado diverge no terceiro serviço.",
            },
            {
                frente: "Como você versionaria uma API pública mantida pelo seu time?",
                verso: "Com política escrita de compatibilidade, prazo de descontinuação e métrica de uso por versão para saber quem ainda depende do quê. Sem esse número, toda remoção vira aposta e a decisão fica adiada para sempre.",
            },
            {
                frente: "Como você lidaria com consumidores que não migram de versão?",
                verso: "Medindo quem são e quanto representam, dando prazo com aviso e ajuda para migrar, e mantendo camada de compatibilidade só se poucos e importantes. Manter tudo para sempre é o que faz cada mudança futura custar três vezes mais.",
            },
            {
                frente: "Como você conduziria uma migração de dados grande sem parar o serviço?",
                verso: "Em passos compatíveis: criar o novo, escrever nos dois, preencher o histórico em lotes com controle de ritmo, ler do novo e só então remover o antigo. Cada passo reversível sozinho. Migração em lote sem controle de ritmo derruba o banco no meio.",
            },
            {
                frente: "Como você trataria dívida técnica num serviço Node antigo?",
                verso: "Traduzindo em risco e custo com número: incidentes recorrentes, tempo perdido por entrega, área que ninguém toca. Assim ela entra na mesma fila das entregas. Reservar uma fatia fixa da capacidade evita a negociação toda semana.",
            },
            {
                frente: "Que dívida você atacaria primeiro numa base Node sem testes?",
                verso: "A ausência de teste no fluxo mais alterado, com testes de rota que exercitam de ponta a ponta o caminho crítico. Com essa rede, o resto vira refatoração barata. Começar pela arquitetura sem teste é trocar a fundação com a casa cheia.",
            },
            {
                frente: "Como você faria revisão de código sem virar gargalo?",
                verso: "Limitando o tamanho do que se pede para revisar, prazo curto acordado e separando o que bloqueia do que é sugestão. Estilo e checagem óbvia ficam com a ferramenta. Revisão que volta com trinta comentários de formatação ensina o time a evitá-la.",
            },
            {
                frente: "O que você olharia primeiro num PR de backend Node?",
                verso: "Validação da entrada, tratamento de erro e o que acontece quando a dependência falha, mais transação e trabalho síncrono pesado. Depois se a rota é idempotente quando precisa ser. Nome de variável fica com o linter.",
            },
            {
                frente: "Como você lidaria com um PR gigante que já está pronto?",
                verso: "Revisando por partes acordadas com quem escreveu, priorizando risco, e combinando que os próximos serão fatiados. Recusar de saída desperdiça o trabalho feito. O problema é de processo, e ele só muda se o combinado ficar claro.",
            },
            {
                frente: "Como você faria a integração de alguém novo num serviço Node?",
                verso: "Ambiente rodando em um comando, uma tarefa real pequena na primeira semana e um mapa curto do fluxo de uma requisição. Documentar as três coisas que mais surpreendem economiza semanas de perguntas repetidas.",
            },
            {
                frente: "Como você garantiria que o conhecimento não fique com uma pessoa só?",
                verso: "Rodando quem faz o quê, revisando em par o que é crítico e escrevendo o que só existe na cabeça de alguém, principalmente operação. O teste é simples: essa pessoa consegue tirar férias sem o time travar?",
            },
            {
                frente: "Como você documentaria decisões técnicas do serviço?",
                verso: "Um registro curto por decisão, com contexto, opções, escolha e consequências, datado e no repositório. O valor está em dizer por que o outro caminho foi descartado. Sem isso, alguém desfaz a decisão sem saber o que ela evitava.",
            },
            {
                frente: "Como você lidaria com um time que quer reescrever o serviço em outra tecnologia?",
                verso: "Pedindo o que exatamente não dá para consertar como está e quem paga o período com dois sistemas. Muitas vezes a dor é ausência de teste e build lento, que não muda de linguagem. Se for mesmo o caminho, a reescrita precisa ser por fatia.",
            },
            {
                frente: "Como você trataria um requisito de desempenho vago?",
                verso: "Transformando em número antes de codificar: qual rota, em qual percentil, com quanta carga. Sem isso não existe pronto nem otimização defensável, e a discussão vira opinião na véspera da entrega.",
            },
            {
                frente: "Como você negociaria prazo quando existe risco técnico conhecido?",
                verso: "Nomeando o risco, o que acontece se ele se concretizar e qual o menor experimento que o reduz. Prazo com risco escondido vira surpresa na última semana. O que se negocia é escopo e ordem, e raramente a data.",
            },
            {
                frente: "Como você lidaria com pressão para pular teste por causa de prazo?",
                verso: "Mostrando o custo em vez de discutir princípio: o que quebra, quanto tempo leva para descobrir e para corrigir. Depois oferecendo o corte mínimo cobrindo só o caminho crítico. Dívida assumida com prazo é aceitável; escondida não.",
            },
            {
                frente: "Como você definiria o que é uma entrega pronta no backend?",
                verso: "Métrica e log, alerta, verificação de saúde, limites de recurso, migração compatível, plano de reversão e alguém de plantão. Pronto não é passar no teste local: é poder ser operado por outra pessoa às três da manhã.",
            },
            {
                frente: "Como você trataria o ambiente de homologação de um serviço Node?",
                verso: "Igual à produção no que importa: versão, configuração, volume plausível e integração com dublês fiéis. Ambiente que mente dá falsa confiança. Muitas vezes é melhor ter menos ambientes e mais chave de funcionalidade em produção.",
            },
            {
                frente: "Como você usaria chaves de funcionalidade num backend?",
                verso: "Para separar deploy de liberação, com valor padrão seguro, avaliação barata e data para a chave morrer. Sem prazo elas acumulam e viram combinações que ninguém testou. E precisam ser observáveis, para saber quem está no caminho novo.",
            },
            {
                frente: "Como você decidiria reverter em vez de corrigir?",
                verso: "Se a correção não é óbvia em minutos, reverter primeiro. Isso exige que reverter seja seguro, o que depende de migração compatível e de deploy pequeno. Times que não conseguem reverter acabam corrigindo sob pressão, que é quando se erra mais.",
            },
            {
                frente: "Como você trataria uma esteira de integração lenta?",
                verso: "Medindo por etapa: costuma ser instalação sem cache, teste de integração no caminho de todo mundo e ausência de paralelismo. Esteira de vinte minutos muda o comportamento do time, que agrupa mudanças e revisa menos.",
            },
            {
                frente: "Como você garantiria que o artefato testado é o que vai para produção?",
                verso: "Construindo a imagem uma vez, promovendo o mesmo artefato entre ambientes e configurando por variável. Reconstruir por ambiente permite que a produção rode algo que ninguém testou, mesmo com o mesmo commit.",
            },
            {
                frente: "Como você trataria segredos dentro da esteira?",
                verso: "Guardados no cofre do provedor, injetados só nos passos que precisam, mascarados no log e com escopo mínimo. Esteira costuma ter acesso a tudo, então é um dos alvos preferidos. Segredo em variável de repositório aberta é comprometido por qualquer PR.",
            },
            {
                frente: "Como você conduziria a resposta a um segredo vazado?",
                verso: "Revogando e trocando primeiro, porque o histórico já vazou e apagar commit não resolve, e depois checando uso indevido nos registros de acesso. Varredura automática para não repetir. Reescrever histórico é o último passo e o menos urgente.",
            },
            {
                frente: "Como você conduziria a escolha do banco de dados de um serviço novo?",
                verso: "Pelo formato de acesso e pelas garantias que o negócio exige, não pela moda. Relacional é o padrão que quase sempre serve. Banco especializado precisa de motivo, de quem opere e de plano quando ele virar o gargalo.",
            },
            {
                frente: "Como você lidaria com um serviço que ninguém quer manter?",
                verso: "Descobrindo por que: normalmente ambiente difícil, ausência de teste e medo de quebrar. Melhorar o ciclo muda isso mais rápido que designar dono. Se ele não é mais essencial, a melhor manutenção é desligar e reduzir superfície.",
            },
            {
                frente: "Como você definiria quem é dono de cada serviço?",
                verso: "Um time responsável por cada um, incluindo plantão, declarado no repositório. Sem dono, todo mundo é responsável e ninguém age no incidente. Dono não significa que só ele altera: significa que alguém revisa, decide e responde.",
            },
            {
                frente: "Como você avaliaria construir uma biblioteca interna em vez de usar uma pronta?",
                verso: "Pelo tanto que a pronta carrega de coisa que você não usa e pelo custo de manter a sua para sempre. Escrever trezentas linhas parece vitória até alguém precisar dar manutenção nelas por três anos. Biblioteca interna precisa de dono declarado.",
            },
            {
                frente: "Como você lidaria com uma dependência crítica abandonada?",
                verso: "Fixando a versão, isolando o uso atrás de um invólucro para baratear a troca, e avaliando substituto ou manutenção interna com prazo. Migrar às pressas depois de uma vulnerabilidade é bem pior do que planejar a saída.",
            },
            {
                frente: "Como você mediria a qualidade de uma base de código Node?",
                verso: "Por sinais de fora: tempo para entregar uma mudança pequena, defeito que volta, tempo para alguém novo produzir e quantas áreas ninguém quer tocar. Métrica interna ajuda a localizar, mas sozinha vira meta que se engana.",
            },
            {
                frente: "Como você trataria um serviço com muitos testes e muitos bugs em produção?",
                verso: "Olhando o que os testes exercitam: costumam faltar caso de erro, integração real e validação de borda. Boa parte dos defeitos de backend vem de configuração e dado, que teste unitário com dublê nunca pega.",
            },
            {
                frente: "Como você definiria a estratégia de testes de um serviço Node?",
                verso: "Muitos testes de rota rápidos com banco efêmero, poucos de contrato nas fronteiras e quase nenhum de ponta a ponta. O critério é confiança por minuto de execução, e que o vermelho seja levado a sério pelo time.",
            },
            {
                frente: "Como você lidaria com testes de integração lentos numa esteira?",
                verso: "Reaproveitando o contêiner de banco entre casos, paralelizando por arquivo com isolamento por esquema, e movendo o que não precisa de banco para teste puro. Antes disso, medir: quase sempre poucos testes dominam o tempo.",
            },
            {
                frente: "Como você trataria o crescimento do tempo de instalação de dependências?",
                verso: "Com cache por hash do arquivo de trava na esteira e revisão do que realmente precisa estar ali. Árvore de mil pacotes custa em tempo, em risco e em imagem. Cortar duas dependências grandes costuma render mais que qualquer ajuste de cache.",
            },
            {
                frente: "Como você lidaria com times que usam gerenciadores de pacote diferentes?",
                verso: "Padronizando um por repositório e travando na esteira, porque dois arquivos de trava no mesmo projeto produzem árvores diferentes e erro que só acontece na máquina de alguém. Qual deles importa menos que ser um só.",
            },
            {
                frente: "Como você organizaria um monorepo de serviços Node?",
                verso: "Com fronteiras explícitas entre pacotes, build incremental com cache e regra de quem depende de quem. Sem isso, a facilidade de importar qualquer coisa acopla tudo e a esteira passa a rodar o mundo a cada mudança de uma linha.",
            },
            {
                frente: "Como você compartilharia tipos entre backend e front?",
                verso: "Gerando a partir do contrato, ou publicando um pacote de tipos versionado, com validação em tempo de execução na borda mesmo assim. Importar tipos direto do outro projeto acopla os deploys e dá falsa sensação de segurança.",
            },
            {
                frente: "Como você trataria a diferença entre o que o tipo promete e o que chega na requisição?",
                verso: "Validando na borda com esquema e derivando o tipo dele, para não existirem duas verdades. Tipo declarado à mão sobre corpo de requisição é documentação, não proteção: em produção chega o que o cliente quiser mandar.",
            },
            {
                frente: "Como você lidaria com um serviço que precisa de disponibilidade muito alta?",
                verso: "Definindo o número com o negócio, porque cada nove multiplica custo e complexidade: redundância, multi zona, degradação e ensaio de falha. Antes disso, quase sempre há ganho maior em reduzir tempo de recuperação do que em evitar toda falha.",
            },
            {
                frente: "Como você conduziria um ensaio de falha em produção?",
                verso: "Começando pequeno e em horário combinado, com hipótese escrita, alerta armado e botão de parada. O objetivo é validar detecção e recuperação, não quebrar por esporte. Sem observabilidade confiável antes, o ensaio só gera susto.",
            },
            {
                frente: "Como você decidiria entre resolver no código e resolver na infraestrutura?",
                verso: "Pelo que fica mais fácil de operar depois. Limite de taxa, repetição e roteamento costumam ficar melhores na borda; regra de negócio nunca. O risco de empurrar tudo para fora é o comportamento sumir do repositório e ninguém achar.",
            },
            {
                frente: "Como você reduziria o tempo médio de recuperação de um incidente?",
                verso: "Deploy pequeno e reversível, alerta que aponta o sintoma certo, runbook curto e permissão para agir. A maior parte do tempo de um incidente é descobrir o que está errado e conseguir autorização, e não escrever a correção.",
            },
            {
                frente: "Como você lidaria com um pico de erros logo após um deploy?",
                verso: "Revertendo primeiro e comparando as métricas por versão para confirmar. Se a mudança estava atrás de chave, desligar é mais rápido. Investigar em produção com usuários vendo erro é o erro clássico de quem tem medo de reverter.",
            },
            {
                frente: "Como você trataria a expectativa de que Node é rápido por natureza?",
                verso: "Trocando a conversa por medição: Node atende bem muitas conexões esperando, e não faz cálculo pesado rápido. O gargalo típico é banco, serialização e trabalho síncrono. Comparações de rendimento entre frameworks quase nunca refletem o seu serviço.",
            },
            {
                frente: "Como você lidaria com uma API interna que virou dependência de todo mundo?",
                verso: "Tratando como produto: contrato estável, versionamento, prazo de descontinuação e limite de taxa mesmo para quem é de casa. Sem isso, qualquer mudança vira negociação com cinco times, e uma consulta mal feita de um deles derruba o serviço para os outros.",
            },
            {
                frente: "Como você decidiria adotar uma tecnologia nova no time?",
                verso: "Com problema medido, prova de conceito num fluxo real, prazo e critério de sucesso, e alguém que sustente em incidente. Sem caminho de volta definido, a adoção vira dívida permanente com um jeito a mais de fazer a mesma coisa.",
            },
        ],
    },
};
