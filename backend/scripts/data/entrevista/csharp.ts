import type { TopicoDeEntrevista } from "../../seed-entrevista.ts";

/**
 * Perguntas de entrevista de C# e .NET.
 *
 * Três destas vieram de uma entrevista real, com a redação preservada: os tempos de
 * vida do container, a diferença entre async e await, e injeção de dependência. Em
 * volta delas ficam as companheiras que a conversa costuma encadear, porque quem
 * pergunta tempo de vida quase sempre emenda em dependência cativa, e quem pergunta
 * async emenda em deadlock com Result.
 */
export const csharp: TopicoDeEntrevista = {
    slug: "csharp",
    nome: "C# e .NET",
    position: 3,
    perguntas: {
        estagio: [
            {
                frente: "O que é injeção de dependência e que problema ela resolve?",
                verso: "A classe recebe o que precisa de fora, em vez de criar por dentro. Resolve acoplamento: trocar a implementação deixa de exigir mexer em quem usa. E permite testar passando uma versão falsa. Em .NET, quem entrega as dependências é o container configurado na subida.",
            },
            {
                frente: "Qual a diferença entre C# e .NET?",
                verso: "C# é a linguagem. .NET é a plataforma: o runtime que executa, a biblioteca padrão e as ferramentas de build. Outras linguagens rodam no mesmo .NET, como F# e VB. O código C# vira uma linguagem intermediária, que o runtime compila para o processador na hora de executar.",
            },
            {
                frente: "Qual a diferença entre tipo de valor e tipo de referência?",
                verso: "Tipo de valor guarda o dado direto e é copiado na atribuição, como int e struct. Tipo de referência guarda o endereço, e duas variáveis podem apontar para o mesmo objeto, como classe, string e array. Alterar por uma referência é visto pela outra.",
            },
            {
                frente: "O que o coletor de lixo faz por você?",
                verso: "Libera a memória de objetos que ninguém mais alcança, sem você chamar nada. Isso remove a classe de erro de esquecer de liberar, mas não cobre recurso de fora da memória, como arquivo e conexão, que continuam exigindo fechamento explícito.",
            },
            {
                frente: "Quando usar StringBuilder no lugar de string?",
                verso: "Quando há muita concatenação em laço. String é imutável, então cada junção cria um objeto novo e o custo cresce rápido. StringBuilder acumula num buffer e monta a string uma vez no fim. Para poucas junções, string simples é mais legível e não pesa.",
            },
            {
                frente: "Qual a diferença entre classe abstrata e interface?",
                verso: "A interface só declara o contrato, e uma classe pode implementar várias. A classe abstrata pode trazer estado e implementação pronta, e só se herda uma. Use interface para dizer o que o tipo sabe fazer, e classe abstrata para compartilhar comportamento comum.",
            },
            {
                frente: "Para que serve o bloco using numa variável?",
                verso: "Garante que Dispose será chamado ao sair do bloco, mesmo se der exceção. É o jeito de fechar conexão, arquivo e outros recursos que o coletor de lixo não cuida. Existe também a forma de declaração, que libera ao fim do escopo sem precisar de chaves.",
            },
            {
                frente: "Qual a diferença entre um campo e uma propriedade?",
                verso: "Campo guarda o dado direto. Propriedade é um par de métodos com cara de campo, então dá para validar na escrita, calcular na leitura e mudar o comportamento depois sem quebrar quem usa. A convenção é expor propriedade e manter o campo privado.",
            },
            {
                frente: "Qual a diferença entre comparar com == e com Equals?",
                verso: "Para tipo de referência, == compara endereço por padrão, e Equals compara conteúdo se a classe o implementar. String é a exceção conhecida: ela sobrecarrega == para comparar texto. Para comparar conteúdo com segurança, use Equals ou um comparador explícito.",
            },
            {
                frente: "O que é um tipo anulável e para que ele serve?",
                verso: "Permite que um tipo de valor represente ausência, como int?. Nos projetos novos, o recurso de referência anulável faz o compilador avisar quando um objeto pode ser nulo e você não conferiu, o que troca erro em produção por aviso na compilação.",
            },
            {
                frente: "Para que serve o LINQ?",
                verso: "Consultar coleções com uma sintaxe única, seja lista em memória, banco ou XML. Filtrar, projetar, agrupar e ordenar viram chamadas encadeadas em vez de laços. No caso de banco, a consulta é traduzida para SQL pelo provedor, e não roda em memória.",
            },
            {
                frente: "Como se trata uma exceção em C#?",
                verso: "Com try, catch e finally. O catch captura o tipo que você sabe tratar, e o finally roda de qualquer jeito, com ou sem erro. Capturar Exception genérico e não fazer nada é o antipadrão clássico: esconde o problema e transforma falha em comportamento estranho.",
            },
            {
                frente: "Qual a diferença entre um array e uma List?",
                verso: "Array tem tamanho fixo, definido na criação. List cresce conforme você adiciona, guardando um array por baixo e realocando quando enche. Use array quando o tamanho é conhecido e fixo, e List no resto, que é a maioria dos casos.",
            },
            {
                frente: "O que é uma solução e o que é um projeto no .NET?",
                verso: "O projeto é a unidade que vira um binário, uma biblioteca ou um executável, com o próprio arquivo de configuração. A solução é o agrupamento de projetos que se referenciam. Um serviço grande costuma ter uma solução com vários projetos por responsabilidade.",
            },
            {
                frente: "Para que serve o NuGet?",
                verso: "É o gerenciador de pacotes do .NET. Declara as dependências no arquivo do projeto e baixa a versão pedida, com as dependências dela junto. Trava as versões para o build ser o mesmo em qualquer máquina, e serve também para publicar biblioteca interna.",
            },
            {
                frente: "Para que serve a palavra readonly?",
                verso: "Marca um campo que só pode ser atribuído na declaração ou no construtor. Depois disso ele não muda, e o compilador garante. É como se declara dependência recebida por injeção, deixando claro que ela é fixa durante a vida do objeto.",
            },
            {
                frente: "O que acontece quando você herda uma classe?",
                verso: "O tipo novo ganha os membros do pai e pode acrescentar ou substituir comportamento com override, quando o pai marcou o membro como virtual. C# tem herança simples: só um pai. Composição costuma ser preferida quando o objetivo é só reaproveitar código.",
            },
            {
                frente: "O que é um método estático?",
                verso: "Pertence ao tipo, e não a uma instância, então é chamado pelo nome da classe e não enxerga estado de objeto. Serve para função utilitária sem dependência. Estado estático mutável é armadilha: vira global compartilhado por todas as requisições.",
            },
            {
                frente: "Para que serve a palavra var?",
                verso: "Deixa o compilador inferir o tipo da variável local pelo valor atribuído. O tipo continua fixo e verificado: não é tipagem dinâmica. Serve para não repetir um nome de tipo longo, e a recomendação é evitá-la quando o tipo não fica óbvio na leitura.",
            },
            {
                frente: "O que é um enum e quando ele ajuda?",
                verso: "Um tipo com um conjunto fechado de valores nomeados, guardado como inteiro. Troca número solto e string mágica por nome com significado, e o compilador ajuda no uso. Cuidado ao persistir: mudar a ordem dos membros muda o número gravado no banco.",
            },
        ],
        junior: [
            {
                frente: "Quais são as diferenças entre os tempos de vida transient, scoped e singleton?",
                verso: "Transient cria uma instância a cada pedido ao container. Scoped cria uma por escopo, que numa API é uma por requisição, e ela é compartilhada dentro dela. Singleton cria uma só para a aplicação inteira, compartilhada entre todas as requisições e threads.",
            },
            {
                frente: "Qual a diferença entre async e await?",
                verso: "async marca o método como assíncrono e permite usar await dentro dele. await é quem espera: ele libera a thread enquanto a operação não termina e retoma o método depois. async sozinho não deixa nada assíncrono, e await sem async não compila.",
            },
            {
                frente: "Como você escolheria o tempo de vida de um serviço novo?",
                verso: "Singleton para o que não guarda estado de requisição e custa caro criar, como cliente HTTP e cache. Scoped para o que carrega contexto da requisição, como o contexto do banco. Transient para objeto leve e sem estado. Na dúvida, scoped é o padrão seguro numa API.",
            },
            {
                frente: "Qual a diferença entre IEnumerable e IQueryable?",
                verso: "IEnumerable itera em memória, então o filtro roda depois de trazer os dados. IQueryable monta uma árvore de expressão que o provedor traduz para SQL, e o filtro roda no banco. Trocar um pelo outro sem perceber traz a tabela inteira para a aplicação.",
            },
            {
                frente: "O que é execução adiada no LINQ?",
                verso: "A consulta não roda quando você a escreve, e sim quando ela é percorrida, por foreach, ToList ou similar. Isso permite compor filtros antes de executar, e explica dois problemas comuns: executar a mesma consulta várias vezes, e ela mudar se a fonte mudou no meio.",
            },
            {
                frente: "Qual a diferença entre Task e Thread?",
                verso: "Thread é uma linha de execução do sistema, cara de criar. Task é uma promessa de resultado, que pode ou não ocupar uma thread. Operação de entrada e saída assíncrona não segura thread nenhuma enquanto espera, que é justamente o ganho do modelo.",
            },
            {
                frente: "Quando usar Task.Run, e quando ele é desnecessário?",
                verso: "Serve para tirar trabalho de processador da thread atual, tipicamente numa interface gráfica. Numa API ele costuma ser desnecessário e até prejudicial: envolver uma chamada de banco já assíncrona só consome uma thread do pool sem ganho nenhum.",
            },
            {
                frente: "O que acontece se você não aguardar uma Task?",
                verso: "O método segue sem esperar, e a exceção de dentro dela é perdida em vez de subir. É o esqueça e siga: o trabalho pode nem terminar se o processo encerrar. Se a intenção é mesmo disparar sem esperar, o correto é tratar a falha explicitamente.",
            },
            {
                frente: "Para que serve o CancellationToken?",
                verso: "Levar o pedido de cancelamento até quem está esperando, para o trabalho parar quando o cliente desistiu ou o prazo estourou. A convenção é aceitá-lo como último parâmetro e repassá-lo para baixo. Quem ignora o token quebra a cadeia inteira.",
            },
            {
                frente: "O que é boxing, e por que ele importa?",
                verso: "É embrulhar um tipo de valor num objeto para ele caber onde se espera referência. Cada boxing aloca no heap, e em laço quente isso vira pressão de coleta. Genéricos existem em boa parte para evitá-lo, guardando o tipo sem embrulhar.",
            },
            {
                frente: "O que a interface IDisposable indica?",
                verso: "Que o objeto segura um recurso que o coletor de lixo não administra, como conexão, arquivo ou socket, e precisa ser liberado explicitamente. Quem consome deve usar o bloco using. A versão assíncrona existe para recurso cuja liberação também é assíncrona.",
            },
            {
                frente: "Qual a diferença entre const e readonly?",
                verso: "const é resolvido na compilação e vai embutido em quem usa, então mudar o valor exige recompilar todos os consumidores. readonly é resolvido em execução e pode ser definido no construtor. Para valor que pode mudar entre versões, readonly evita surpresa.",
            },
            {
                frente: "O que é um método de extensão?",
                verso: "Um método estático que aparenta pertencer a outro tipo, declarado numa classe estática com this no primeiro parâmetro. É como o LINQ acrescenta métodos a IEnumerable sem alterá-lo. Serve para estender tipo de terceiro sem herdar nem embrulhar.",
            },
            {
                frente: "O que um record traz que uma classe comum não traz?",
                verso: "Igualdade por valor em vez de por referência, cópia com mudança pelo with, e desconstrução, tudo gerado pelo compilador. Serve para dado imutável que representa um valor, como um DTO ou uma mensagem. Para entidade com identidade, classe continua sendo o certo.",
            },
            {
                frente: "Como funciona o pipeline de middleware do ASP.NET Core?",
                verso: "Cada middleware recebe a requisição, pode agir, chama o próximo e pode agir de novo na volta. A ordem do registro é a ordem de execução, e é ela que faz autenticação vir antes de autorização. Um middleware que não chama o próximo encerra a requisição ali.",
            },
            {
                frente: "Como você trataria erro numa API .NET de forma consistente?",
                verso: "Com um middleware de exceção no topo do pipeline, convertendo cada tipo conhecido no código HTTP certo e devolvendo um corpo padronizado. Assim o controller não repete try e catch, e nenhum detalhe interno vaza na resposta.",
            },
            {
                frente: "O que o change tracker do Entity Framework faz?",
                verso: "Guarda o estado das entidades carregadas pelo contexto e compara com o atual, para gerar só os comandos necessários no SaveChanges. É o que permite alterar um objeto e salvar sem escrever update. Também é o que faz consulta grande pesar mais do que parece.",
            },
            {
                frente: "Qual a diferença entre First e Single numa consulta?",
                verso: "First devolve o primeiro e não se importa se há mais. Single exige exatamente um e lança se houver dois, o que é útil para expressar que a chave é única. As versões OrDefault devolvem o padrão do tipo em vez de lançar quando não há nada.",
            },
            {
                frente: "Para que serve o padrão de opções com IOptions?",
                verso: "Levar configuração tipada até o serviço, em vez de espalhar leitura de chave por string. A classe é ligada a uma seção da configuração e validada na subida. Existe a variante que recarrega quando o arquivo muda, útil sem reiniciar o processo.",
            },
            {
                frente: "O que muda entre um controller e uma minimal API?",
                verso: "A minimal API declara a rota e o manipulador direto, com menos cerimônia e menos alocação por requisição. O controller traz agrupamento por classe, filtros e convenções, que ajudam quando há muitas rotas. Os dois usam o mesmo pipeline e o mesmo container.",
            },
        ],
        pleno: [
            {
                frente: "O que é dependência cativa e como ela aparece no container?",
                verso: "É um serviço de vida curta preso dentro de um de vida longa, tipicamente um scoped injetado num singleton. Como o singleton nunca é recriado, ele segura para sempre a primeira instância, e o contexto de banco daquela requisição vaza para todas as outras.",
            },
            {
                frente: "Como você resolveria um singleton que precisa de algo scoped?",
                verso: "Injetando a fábrica de escopo em vez do serviço, e criando um escopo próprio dentro da operação para pedir o que precisa. Assim cada uso pega uma instância nova e a descarta. Injetar o scoped direto é o caminho para a dependência cativa.",
            },
            {
                frente: "Por que chamar Result ou Wait numa Task pode travar a aplicação?",
                verso: "Porque bloqueia a thread esperando um trabalho que precisa dessa mesma thread para retomar, em contextos que exigem retomar no mesmo lugar. Fora isso, mesmo sem travar, ele segura uma thread do pool à toa e vira gargalo sob carga. O caminho é aguardar até o topo.",
            },
            {
                frente: "Para que serve ConfigureAwait com false, e quando ele importa hoje?",
                verso: "Diz que a retomada não precisa voltar ao contexto original, evitando o travamento clássico e economizando um salto. Importa em biblioteca, que não sabe onde será usada. Em ASP.NET Core não há mais contexto de sincronização, então ali ele deixou de fazer diferença.",
            },
            {
                frente: "Como você identificaria e resolveria o problema de N mais 1 no Entity Framework?",
                verso: "Pelo log de SQL, que mostra uma consulta na lista e uma por item ao acessar a navegação. A correção é carregar junto com Include, ou projetar só o necessário com Select. Em coleção grande, vale conferir se o Include virou junção com muita repetição.",
            },
            {
                frente: "Quando usar AsNoTracking, e o que se perde com ele?",
                verso: "Em leitura pura, para o contexto não guardar o estado de cada entidade, o que reduz memória e acelera. Perde-se a alteração automática: modificar e salvar não gera update. Numa API, quase toda consulta de leitura de listagem se beneficia.",
            },
            {
                frente: "Como você investigaria memória crescendo numa API .NET?",
                verso: "Com captura de dump e comparação de heap em dois momentos, olhando o que cresceu e quem segura a referência. Suspeitos comuns são evento não desinscrito, cache sem limite, estático acumulando, e dependência cativa segurando contexto de requisição.",
            },
            {
                frente: "O que muda no coletor de lixo entre as gerações?",
                verso: "Objeto novo nasce na geração zero, que é coletada com frequência e barata. Quem sobrevive sobe de geração e passa a ser coletado com menos frequência, mas com custo maior. Objeto de vida média que sobe sem precisar é o padrão que mais pesa.",
            },
            {
                frente: "O que é a heap de objetos grandes e por que ela importa?",
                verso: "Objetos acima de um limite de tamanho vão para uma área própria, coletada junto com a geração mais cara e sem compactação por padrão. Alocar array grande em laço a fragmenta e provoca pausas. Reaproveitar buffer por pool é a saída usual.",
            },
            {
                frente: "Como você testaria uma classe com muitas dependências?",
                verso: "Primeiro perguntando se ela não tem responsabilidades demais, porque construtor longo é sintoma. Depois, injetando dublês pelas interfaces e verificando só o comportamento que importa. Se o teste precisa configurar cinco dublês, o desenho está pedindo divisão.",
            },
            {
                frente: "Como você trataria concorrência entre duas atualizações do mesmo registro?",
                verso: "Com concorrência otimista: uma coluna de versão que entra na cláusula where do update. Se ninguém alterou, o update afeta uma linha; se alterou, afeta zero e o Entity Framework lança. Aí a aplicação decide entre recarregar, mesclar ou avisar o usuário.",
            },
            {
                frente: "Como você aplicaria migração de banco num deploy de API?",
                verso: "Fora da subida da aplicação, num passo próprio do pipeline, para não ter várias instâncias tentando migrar ao mesmo tempo. E com mudança compatível nos dois sentidos, para a versão antiga continuar funcionando enquanto o deploy acontece.",
            },
            {
                frente: "Como funciona o pool de conexões e o que é o esgotamento dele?",
                verso: "O provedor reaproveita conexões abertas em vez de criar a cada consulta. O esgotamento acontece quando conexões não são devolvidas, por contexto não descartado ou consulta lenta segurando, e aí novas requisições esperam até estourar o tempo.",
            },
            {
                frente: "Quando IAsyncEnumerable resolve melhor que devolver uma lista?",
                verso: "Quando o resultado é grande ou vem em fluxo, e você não quer materializar tudo em memória antes de começar a responder. O consumidor processa item a item conforme chegam. Para poucas dezenas de itens, a lista simples é mais direta.",
            },
            {
                frente: "Como você instrumentaria uma API .NET para produção?",
                verso: "Log estruturado com identificador de correlação atravessando as camadas, métricas de latência, erro e saturação, e rastro distribuído nas chamadas de saída. O .NET moderno traz a base disso, e o padrão do mercado é exportar por OpenTelemetry.",
            },
            {
                frente: "Onde você validaria a entrada de uma API, e por quê?",
                verso: "Na fronteira, antes de qualquer regra: o modelo de entrada valida formato e obrigatoriedade, e devolve um erro claro por campo. Regra de negócio fica no domínio, que não confia na fronteira. Misturar as duas espalha validação por toda a base.",
            },
            {
                frente: "Como você cacharia dados numa API .NET sem criar inconsistência?",
                verso: "Cache em memória para dado quente do processo, distribuído quando há várias instâncias. O ponto difícil é a invalidação: prazo curto para o que muda, e remoção explícita na escrita para o que não pode ficar velho. Cache sem limite é vazamento com outro nome.",
            },
            {
                frente: "Como você lidaria com uma biblioteca de terceiro que só tem API síncrona?",
                verso: "Não fingindo que ela é assíncrona: envolver em Task.Run só troca o bloqueio de lugar e consome thread do pool. O caminho honesto é isolar a chamada, limitar a concorrência dela e, se for pesada, tirá-la do caminho da requisição com fila.",
            },
            {
                frente: "O que o container faz quando duas implementações registram a mesma interface?",
                verso: "A última registrada vence quando você pede uma só, e todas vêm quando você pede a coleção delas. Isso é útil para pipeline de manipuladores, e é armadilha quando o registro duplicado foi acidente, porque o comportamento muda com a ordem do arquivo de subida.",
            },
            {
                frente: "Como você separaria o modelo de domínio do modelo do Entity Framework?",
                verso: "Deixando o domínio sem atributo de persistência e configurando o mapeamento por fora, com a API de configuração. Assim a regra não depende do ORM. Em projeto pequeno, aceitar o acoplamento é decisão legítima, desde que seja consciente.",
            },
        ],
        senior: [
            {
                frente: "Como você definiria as fronteiras de uma solução .NET em camadas?",
                verso: "Pelo sentido da dependência: o domínio não conhece infraestrutura, e a API só orquestra. O projeto de fora referencia o de dentro, nunca o contrário. Se o domínio precisa de algo externo, ele declara a interface e a infraestrutura implementa.",
            },
            {
                frente: "Quando o Entity Framework atrapalha, e o que você usaria no lugar?",
                verso: "Em consulta analítica pesada, atualização em massa e SQL que o tradutor não expressa bem. Nesses pontos, comando direto ou um mapeador leve entrega mais, e convivem no mesmo projeto. Trocar o ORM inteiro por causa de três consultas raramente compensa.",
            },
            {
                frente: "Como você conduziria a migração de .NET Framework para .NET moderno?",
                verso: "Mapeando o que não tem equivalente, como recursos só de Windows, e movendo por partes atrás de uma fachada. Biblioteca de domínio primeiro, borda por último. Rodar as duas versões lado a lado por um tempo é o que permite voltar atrás sem drama.",
            },
            {
                frente: "Como você lidaria com um time que registra quase tudo como singleton?",
                verso: "Mostrando o custo concreto: dependência cativa, estado compartilhado entre requisições e teste que passa isolado e falha em conjunto. Depois firmando um padrão simples, com scoped como escolha inicial, e deixando singleton exigir justificativa na revisão.",
            },
            {
                frente: "Como você decidiria entre exceção e um tipo de resultado para erro esperado?",
                verso: "Exceção para o que não deveria acontecer, resultado para o que faz parte do fluxo, como validação e registro não encontrado. O critério é se quem chama tem o que fazer com aquilo. Misturar os dois na mesma camada é o que produz código difícil de ler.",
            },
            {
                frente: "Como você avaliaria adotar um padrão como CQRS num projeto existente?",
                verso: "Perguntando qual dor ele resolve hoje, e não qual promessa ele traz. Ele paga quando leitura e escrita têm exigências muito diferentes. Adotado sem essa assimetria, entrega o dobro de arquivo para o mesmo comportamento e o time paga sem receber.",
            },
            {
                frente: "Como você revisaria código assíncrono de outra pessoa?",
                verso: "Procurando Result e Wait, método assíncrono devolvendo void, Task disparada sem espera nem tratamento, e token de cancelamento que não desce. Depois se a assincronia chega até a borda: assíncrono no meio e bloqueante na ponta não ganha nada.",
            },
            {
                frente: "Como você trataria a proliferação de DTOs numa solução grande?",
                verso: "Aceitando que fronteira diferente pede modelo diferente, e cortando só a duplicação sem propósito. Mapeamento automático esconde erro de campo e vira dor de depuração, então mapeamento explícito costuma envelhecer melhor do que parece no começo.",
            },
            {
                frente: "Como você mediria a saúde de uma API .NET em produção?",
                verso: "Latência de cauda e não média, taxa de erro por rota, saturação do pool de threads e do pool de conexões, e tempo em coleta de lixo. Somado a isso, um teste de disponibilidade que exercite o caminho real, e não um endpoint que só devolve OK.",
            },
            {
                frente: "Como você garantiria compatibilidade de uma biblioteca interna entre times?",
                verso: "Versionando por semântica de verdade, acrescentando em vez de mudar assinatura, e marcando o que sai como obsoleto antes de remover. Uma versão maior precisa de prazo e de caminho de migração escrito, senão os times ficam presos na antiga.",
            },
            {
                frente: "Como você lidaria com testes lentos numa solução grande?",
                verso: "Separando unidade de integração para o ciclo curto continuar curto, e olhando o que domina o tempo. Costuma ser banco recriado por caso e espera real disfarçada. Paralelizar ajuda, mas antes vale remover o que não precisava tocar infraestrutura.",
            },
            {
                frente: "Como você ensinaria assincronia a quem só escreveu código síncrono?",
                verso: "Começando pelo motivo: liberar a thread durante a espera para atender mais gente com a mesma máquina. Depois mostrando o custo do bloqueio sob carga, com número. A sintaxe é a parte fácil; o difícil é entender que assíncrono não é mais rápido, é mais escalável.",
            },
            {
                frente: "Como você trataria configuração e segredo em vários ambientes?",
                verso: "Configuração por camadas, com o específico do ambiente sobrescrevendo o comum, e validação na subida para falhar cedo. Segredo nunca no repositório: cofre gerenciado ou variável injetada no deploy, e nenhum valor real no arquivo de exemplo.",
            },
            {
                frente: "Como você trataria acoplamento do domínio ao ORM depois que ele já se espalhou?",
                verso: "Sem reescrita grande: isolando primeiro o que dói, com a consulta saindo do domínio para um repositório com contrato próprio. Depois medindo se o resto compensa. Puxar tudo de uma vez costuma render meses de mudança sem comportamento novo.",
            },
            {
                frente: "Como você decidiria dividir um serviço .NET em dois?",
                verso: "Por motivo organizacional ou de escala independente, e não por estética. Se a fronteira ainda não está clara entre projetos da mesma solução, ela não vai ficar clara atravessando a rede: só ganha latência, falha parcial e deploy coordenado.",
            },
            {
                frente: "Como você lidaria com uma decisão de arquitetura ruim já tomada?",
                verso: "Medindo o custo de conviver contra o de mudar, e propondo um caminho incremental com ponto de reversão. Reescrita completa vendida como solução costuma parar no meio. Registrar o motivo da mudança evita que a próxima pessoa refaça o mesmo debate.",
            },
            {
                frente: "Como você trataria dependência de terceiro que se tornou risco para o time?",
                verso: "Isolando atrás de uma interface própria para o resto do código não conhecer o nome dela, e mantendo um plano de troca com o custo estimado. Decidir sob incidente é o pior momento, então a conversa precisa acontecer antes do problema.",
            },
            {
                frente: "O que você olharia primeiro numa base .NET que acabou de herdar?",
                verso: "O arquivo de subida, que revela o desenho: o que é singleton, o que entra no pipeline e como a configuração chega. Depois o grafo de referência entre projetos, procurando dependência circular disfarçada, e a cobertura real dos testes que existem.",
            },
            {
                frente: "Como você lidaria com o que compila e passa nos testes mas quebra em produção?",
                verso: "Fechando a diferença entre os ambientes: mesma versão de runtime, mesma cultura, mesmo fuso e mesmo banco em teste de integração. Boa parte desses casos é configuração diferente ou concorrência que só aparece sob carga, e ambos são reproduzíveis se você quiser.",
            },
            {
                frente: "Como você decidiria entre injeção por construtor e resolver do container na hora?",
                verso: "Construtor quase sempre: as dependências ficam visíveis, o compilador cobra e o teste monta o objeto sem container. Resolver na hora esconde o acoplamento e transforma erro de registro em falha só em execução. A exceção é o que precisa de escopo próprio, criado sob demanda.",
            },
        ],
    },
};
