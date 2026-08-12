import type { TopicoDeEntrevista } from "../../seed-entrevista.ts";

/**
 * Perguntas de entrevista de Go.
 *
 * O nível segue o que a pergunta cobra, e não o assunto. Concorrência aparece nos
 * quatro níveis: em estágio é "o que é uma goroutine", em sênior é "como você
 * revisaria código concorrente de outra pessoa".
 */
export const go: TopicoDeEntrevista = {
    slug: "go",
    nome: "Go",
    position: 1,
    perguntas: {
        estagio: [
            {
                frente: "O que muda no dia a dia por Go ser compilado?",
                verso: "Sai um binário único, sem runtime para instalar na máquina de destino. O erro de tipo aparece na compilação, e não em produção. Compilação rápida mantém o ciclo de editar e rodar parecido com o de linguagem interpretada.",
            },
            {
                frente: "Quando você usaria var, := e const?",
                verso: "O := declara e infere o tipo, e só funciona dentro de função. O var serve para declarar sem valor inicial, para deixar o tipo explícito e no escopo de pacote. O const é valor fixo de tempo de compilação, e não aceita resultado de chamada de função.",
            },
            {
                frente: "Qual a diferença entre array e slice?",
                verso: "O array tem tamanho fixo, que faz parte do tipo, então [3]int e [4]int são tipos diferentes. O slice é uma visão sobre um array, com ponteiro, tamanho e capacidade, e cresce com append. Na prática quase todo código usa slice.",
            },
            {
                frente: "O que acontece quando você passa um slice para uma função?",
                verso: "Go passa tudo por valor, então a cópia é do cabeçalho do slice. Como o cabeçalho aponta para o mesmo array, alterar um elemento dentro da função é visível fora. Já o append pode realocar, e aí a função passa a mexer noutro array.",
            },
            {
                frente: "Para que serve o defer?",
                verso: "Adia a chamada para quando a função retornar, inclusive em caso de pânico. Serve para não esquecer de fechar arquivo, conexão ou destravar mutex, deixando a liberação perto da aquisição. As chamadas adiadas rodam na ordem inversa.",
            },
            {
                frente: "Como Go trata erro, e por que não existe exception?",
                verso: "Erro é um valor devolvido junto com o resultado, e o chamador decide o que fazer. A escolha é deixar o caminho de falha visível no código, em vez de escondido num salto. O custo é verbosidade, e o ganho é não existir caminho invisível.",
            },
            {
                frente: "O que é uma goroutine?",
                verso: "Uma função rodando de forma concorrente, gerenciada pelo runtime de Go e não pelo sistema operacional. Começa com pilha de poucos kilobytes e cresce conforme precisa, então criar milhares é normal. Basta a palavra go antes da chamada.",
            },
            {
                frente: "Para que serve um canal?",
                verso: "Para goroutines trocarem valor e se sincronizarem sem compartilhar memória diretamente. Enviar e receber coordenam as duas pontas, o que evita boa parte das corridas de dado. A ideia da linguagem é comunicar para compartilhar, e não o contrário.",
            },
            {
                frente: "Por que o go fmt não tem opções de configuração?",
                verso: "Para acabar com a discussão de estilo. Todo código Go se parece, então ler projeto alheio não exige aprender a convenção da casa, e revisão de código deixa de gastar tempo com formatação. A ferramenta roda no editor ao salvar.",
            },
            {
                frente: "O que é o zero value e por que ele importa?",
                verso: "Toda variável declarada já nasce com um valor definido: zero para número, string vazia, false, nil para ponteiro, slice e map. Não existe leitura de lixo. Vários tipos são pensados para o zero value já ser útil, como sync.Mutex.",
            },
            {
                frente: "Qual a diferença entre um slice nil e um slice vazio?",
                verso: "Os dois têm tamanho zero e funcionam com append e range. O nil não aponta para array nenhum e é o zero value. A diferença aparece ao comparar com nil e ao serializar para JSON, onde o nil vira null e o vazio vira lista vazia.",
            },
            {
                frente: "Como você define um método em Go?",
                verso: "Declarando a função com um receptor antes do nome, como func (u Usuario) Nome() string. O método não vive dentro de um bloco de classe, e pode ser declarado para qualquer tipo definido no mesmo pacote, não só para struct.",
            },
            {
                frente: "O que é uma interface em Go?",
                verso: "Um conjunto de assinaturas de método. Qualquer tipo que tenha esses métodos satisfaz a interface, sem declarar nada: a satisfação é implícita. Isso permite escrever a interface no pacote que consome, e não no que implementa.",
            },
            {
                frente: "Para que serve o arquivo go.mod?",
                verso: "Declara o caminho do módulo, a versão de Go e as dependências com suas versões. É o que torna o projeto independente de onde ele está no disco, e o go.sum ao lado guarda o hash de cada dependência para garantir que ela não mudou.",
            },
            {
                frente: "Qual a diferença entre make e new?",
                verso: "O make só serve para slice, map e canal, e devolve o valor já pronto para uso, porque esses três precisam de estrutura interna inicializada. O new aloca zerado e devolve um ponteiro. Na prática se usa make, e new quase nunca.",
            },
            {
                frente: "Qual cuidado a iteração sobre um map exige?",
                verso: "A ordem não é definida e varia de propósito entre execuções, para ninguém depender dela. Se a saída precisa ser estável, colete as chaves, ordene e itere sobre a lista ordenada. Também não se deve inserir no map durante a iteração.",
            },
            {
                frente: "Por que Go não tem while nem do while?",
                verso: "Porque o for cobre os três casos. Com uma condição só ele vira while, e sem nada vira laço infinito. É a mesma escolha de deixar uma forma só de fazer cada coisa, que aparece também no gofmt e na ausência de operador ternário.",
            },
            {
                frente: "O que acontece se você declarar uma variável e não usar?",
                verso: "O código não compila. A escolha é deliberada: variável esquecida costuma indicar erro de lógica ou sobra de refatoração. Import não usado também quebra a compilação, pelo mesmo motivo, e as ferramentas removem sozinhas ao salvar.",
            },
            {
                frente: "Como você roda os testes de um projeto Go?",
                verso: "Com go test ./..., que percorre todos os pacotes. O arquivo termina em _test.go e a função começa com Test recebendo *testing.T. Não é preciso instalar biblioteca de teste, porque o essencial vem na biblioteca padrão.",
            },
            {
                frente: "O que diferencia o pacote main dos outros?",
                verso: "É o único que gera executável, e precisa de uma função main sem parâmetro e sem retorno, que é onde o programa começa. Qualquer outro nome de pacote produz biblioteca, para ser importada, e não um binário para rodar.",
            },
        ],
        junior: [
            {
                frente: "Como você trataria um erro que veio de três camadas abaixo?",
                verso: "Devolvendo com contexto em cada camada, usando fmt.Errorf com %w para embrulhar sem perder o original. Quem está no topo decide se registra, se responde ao usuário ou se tenta de novo. Camada do meio não deve engolir nem registrar duas vezes.",
            },
            {
                frente: "O que o %w faz no fmt.Errorf?",
                verso: "Embrulha o erro original dentro do novo, preservando a cadeia. Com isso errors.Is continua encontrando o erro alvo mais abaixo e errors.As continua conseguindo extrair o tipo concreto. Com %v o texto até aparece, mas a cadeia se perde.",
            },
            {
                frente: "Quando usar errors.Is e quando usar errors.As?",
                verso: "Is compara com um erro específico, como sql.ErrNoRows, percorrendo a cadeia. As tenta converter para um tipo concreto quando você precisa de campos daquele erro, como o código de um erro de banco. Comparar com == falha se houver embrulho.",
            },
            {
                frente: "Como você decide entre receptor por valor e por ponteiro?",
                verso: "Ponteiro quando o método altera o estado ou quando a struct é grande e copiar pesa. Valor quando o tipo é pequeno e imutável na prática. Vale manter todos os métodos do tipo no mesmo estilo, porque misturar confunde quem lê.",
            },
            {
                frente: "Por que o append às vezes surpreende quem está começando?",
                verso: "Porque ele pode devolver um slice novo. Se ainda há capacidade, ele escreve no mesmo array e outros slices que apontam para lá enxergam a mudança. Se não há, ele realoca e a ligação se perde. Por isso sempre se atribui o retorno.",
            },
            {
                frente: "Como você evita vazamento de goroutine?",
                verso: "Garantindo que toda goroutine tenha como terminar: canal que sempre é fechado, contexto que cancela, ou seleção com caso de saída. O vazamento clássico é a goroutine parada enviando para um canal que ninguém lê mais.",
            },
            {
                frente: "Para que serve o sync.WaitGroup?",
                verso: "Para esperar um grupo de goroutines terminar. Add antes de disparar, Done adiado dentro de cada uma e Wait no final. O erro comum é chamar Add dentro da goroutine, o que cria corrida com o Wait, ou copiar o WaitGroup ao passar adiante.",
            },
            {
                frente: "Qual a diferença prática entre canal com e sem buffer?",
                verso: "Sem buffer, envio e recebimento acontecem juntos, então o envio bloqueia até alguém receber, o que sincroniza as duas pontas. Com buffer, o envio segue enquanto houver espaço, o que absorve rajada e desacopla ritmo, mas esconde lentidão.",
            },
            {
                frente: "O que o select resolve?",
                verso: "Esperar em várias operações de canal ao mesmo tempo e seguir com a primeira que ficar pronta. É o que permite combinar trabalho com cancelamento e com timeout na mesma espera. Com default ele deixa de bloquear e tenta sem esperar.",
            },
            {
                frente: "Como você colocaria timeout numa chamada?",
                verso: "Com context.WithTimeout, passando o contexto para quem faz a chamada, porque a biblioteca padrão respeita o cancelamento. O defer do cancel é obrigatório para liberar o recurso. Cravar timeout dentro da função esconde a decisão de quem chama.",
            },
            {
                frente: "Para que serve o context, além de cancelar?",
                verso: "Carrega prazo, sinal de cancelamento e valores de escopo da requisição, como identificador de correlação. A convenção é ser o primeiro parâmetro e nunca ser guardado dentro de struct. Não serve para passar dependência do serviço.",
            },
            {
                frente: "Quando a interface vazia é sinal de problema?",
                verso: "Quando ela aparece só para fugir de definir o tipo, jogando a verificação para a execução. Ela cabe em serialização e em log, onde o tipo é desconhecido mesmo. Hoje boa parte dos casos antigos se resolve melhor com generics.",
            },
            {
                frente: "Por que uma interface pode não ser nil mesmo contendo um ponteiro nil?",
                verso: "Porque a interface guarda tipo e valor, e ela só é nil se os dois forem. Devolver um *MeuErro nil como error dá uma interface com tipo preenchido, que passa no teste err != nil. Por isso se devolve nil explícito em vez do ponteiro tipado.",
            },
            {
                frente: "Para que serve uma pasta internal num projeto Go?",
                verso: "Tudo dentro dela só pode ser importado por código sob o mesmo pai, e o compilador garante isso. É a forma de ter fronteira real de pacote sem depender de combinado, deixando público apenas o que você quer sustentar para fora.",
            },
            {
                frente: "Como você escreveria testes de vários casos sem repetir código?",
                verso: "Com tabela de casos: um slice de structs com entrada, esperado e um nome, e um laço chamando t.Run para cada. Cada caso vira um subteste com nome próprio no relatório, e acrescentar cenário passa a ser acrescentar uma linha.",
            },
            {
                frente: "O que o detector de corrida faz e quando você o usa?",
                verso: "Roda com go test -race e instrumenta os acessos à memória para acusar leitura e escrita concorrentes sem sincronização. Ele só acusa o que de fato aconteceu na execução, então vale rodar na integração contínua, não só na máquina local.",
            },
            {
                frente: "Como campos não exportados se comportam no JSON?",
                verso: "Ficam de fora, porque começam com minúscula e o pacote de codificação não os enxerga. Para renomear, omitir vazio ou ignorar de vez, usa-se a tag de struct com json. Sem tag, o nome do campo vai como está, com a maiúscula inicial.",
            },
            {
                frente: "Quando usar mutex e quando usar canal para proteger estado?",
                verso: "Mutex quando várias goroutines só precisam ler e escrever o mesmo dado, que é o caso mais comum e o mais simples. Canal quando o dado é passado adiante, com dono claro em cada etapa. Canal para proteger contador vira complexidade sem ganho.",
            },
            {
                frente: "O que é embedding e por que ele não é herança?",
                verso: "É embutir um tipo dentro de outro, e os métodos do embutido passam a ser chamados no de fora. Não há polimorfismo pelo tipo pai: o tipo de fora não pode ser usado onde o embutido é esperado, a menos que satisfaça a mesma interface.",
            },
            {
                frente: "Como você desligaria um servidor HTTP sem derrubar requisições em curso?",
                verso: "Escutando o sinal do sistema, chamando Shutdown com um contexto de prazo e deixando as requisições em andamento terminarem enquanto novas são recusadas. Depois se fecham banco, filas e workers, na ordem inversa da abertura.",
            },
        ],
        pleno: [
            {
                frente: "Como você desenharia a interface de um pacote que outro time vai consumir?",
                verso: "Interface pequena, definida no pacote que consome e não no que implementa. Exportar o mínimo, aceitar interface e devolver tipo concreto. Contexto como primeiro parâmetro, erro como último retorno, e nenhum estado global escondido.",
            },
            {
                frente: "Por que a regra é aceitar interface e devolver struct?",
                verso: "Aceitar interface deixa quem chama escolher a implementação e facilita teste. Devolver o tipo concreto não amarra o consumidor a um contrato que você adivinhou, e ele monta a interface que precisa do lado dele, com só os métodos que usa.",
            },
            {
                frente: "Como você investigaria um serviço Go com memória crescendo sem parar?",
                verso: "Com pprof de heap em dois momentos, comparando o que cresceu. As suspeitas comuns são goroutine vazando com o que ela segura, slice grande mantido vivo por um pedaço pequeno, cache sem limite e closure prendendo referência inesperada.",
            },
            {
                frente: "O que você controla no coletor de lixo do Go?",
                verso: "Pouco de propósito: GOGC muda a frequência trocando processamento por memória, e GOMEMLIMIT põe um teto que vale em container. O ganho real vem de alocar menos, reaproveitando buffer e evitando conversão desnecessária em caminho quente.",
            },
            {
                frente: "Como você limitaria a concorrência ao chamar um serviço externo?",
                verso: "Com um número fixo de workers lendo de um canal, ou um semáforo por canal com buffer do tamanho do limite. O limite vem do que a outra ponta aguenta, não do que a sua máquina permite. Sem isso, disparar goroutine por item derruba o vizinho.",
            },
            {
                frente: "Como você garante que o cancelamento chegue a toda a árvore de chamadas?",
                verso: "Passando o contexto para baixo em cada chamada e respeitando ctx.Done nos pontos de espera. Quem cria contexto derivado precisa chamar cancel, normalmente adiado. O elo que ignora o contexto quebra a cadeia inteira e vira o vazamento.",
            },
            {
                frente: "Como você implementaria retentativa numa chamada externa?",
                verso: "Só para falha transitória, nunca para erro de negócio. Espera crescente com um pouco de aleatoriedade, teto de tentativas e o contexto mandando no prazo total. Do outro lado, a operação precisa ser idempotente, senão a retentativa duplica.",
            },
            {
                frente: "Como você testaria código que depende do relógio?",
                verso: "Injetando o tempo como dependência, uma função ou interface que o teste substitui. Assim o teste controla o instante e não depende de espera real. Colocar sleep no teste deixa a suíte lenta e instável, e é o padrão que se quer evitar.",
            },
            {
                frente: "Quando o sync.Pool ajuda e quando ele atrapalha?",
                verso: "Ajuda em caminho muito quente que aloca e descarta objetos do mesmo tamanho, como buffer de serialização. Atrapalha quando vira cache: o pool pode ser esvaziado a qualquer coleta. E objeto devolvido sujo é fonte clássica de vazamento de dado.",
            },
            {
                frente: "O que é escape analysis e por que ele importa?",
                verso: "É a análise que decide se um valor cabe na pilha ou precisa ir para o heap. O que fica na pilha some no retorno e não custa coleta. Devolver ponteiro para local, guardar em interface e usar closure costumam empurrar o valor para o heap.",
            },
            {
                frente: "Como você faria injeção de dependência sem framework?",
                verso: "Passando as dependências no construtor da struct, guardadas como interface. A montagem acontece uma vez na main, que é o único lugar que conhece as implementações concretas. Sem container, sem reflexão e sem estado global.",
            },
            {
                frente: "Quando generics valem a pena e quando não?",
                verso: "Valem em estrutura de dado e utilitário que hoje repetem código por tipo, como Map e Filter. Não valem quando existe uma interface simples que resolve, nem para abstrair cedo demais. O critério é remover duplicação real, não parecer moderno.",
            },
            {
                frente: "Como você trataria pânico dentro de uma biblioteca?",
                verso: "Biblioteca não deve derrubar o programa de quem a usa: erro esperado volta como valor. Pânico fica para invariante quebrada, como uso impossível da API. Se a biblioteca sobe goroutine própria, ela recupera lá dentro e converte em erro.",
            },
            {
                frente: "Onde termina o erro e começa o pânico?",
                verso: "Erro é situação prevista, como arquivo ausente ou entrada inválida, e o chamador decide. Pânico é estado impossível, em que continuar é pior que parar. No servidor, o recover fica no middleware para uma requisição não derrubar o processo.",
            },
            {
                frente: "Como você estruturaria um projeto Go de tamanho médio?",
                verso: "Pacotes por domínio, e não por camada com nomes como models e utils. O que não é público vai para internal. A main monta tudo e é a única que conhece as implementações. Evitar pacote que todo mundo importa, que vira dependência circular.",
            },
            {
                frente: "Como você instrumentaria um serviço Go para produção?",
                verso: "Log estruturado com identificador de correlação vindo do contexto, métricas de latência, taxa de erro e saturação, e rastro distribuído nas chamadas externas. Somar as métricas do runtime, como goroutines vivas e pausas de coleta.",
            },
            {
                frente: "Como você descobriria que um mutex virou gargalo?",
                verso: "Com o perfil de bloqueio e o de mutex do pprof, que mostram onde as goroutines esperam. A latência sobe sem o processamento subir junto. As saídas são reduzir a região crítica, particionar o estado por chave ou trocar por leitura e escrita.",
            },
            {
                frente: "Como você implementaria um conjunto de workers?",
                verso: "Um canal de entrada, N goroutines lendo dele em laço, e um WaitGroup para esperar todas. O produtor fecha o canal quando acaba, o que encerra os workers. Erro vai por um canal de saída, e o contexto corta tudo no cancelamento.",
            },
            {
                frente: "Por que evitar a função init?",
                verso: "Ela roda antes da main, na ordem de importação, então o efeito colateral fica invisível para quem lê o código e difícil de testar. Registro em variável global feito ali cria acoplamento escondido. Melhor inicializar explicitamente na main.",
            },
            {
                frente: "Como você trataria uma configuração que hoje é lida por variável global?",
                verso: "Lendo uma vez na main, validando na subida e passando adiante como valor ou struct de dependência. Falha de configuração deve derrubar no início, e não na primeira requisição. Global espalha acoplamento e impede testar dois cenários juntos.",
            },
        ],
        senior: [
            {
                frente: "Quando você escolheria Go, e quando recomendaria outra linguagem?",
                verso: "Escolheria para serviço de rede, ferramenta de linha de comando e infraestrutura, onde concorrência, binário único e tempo de subida importam. Recomendaria outra para trabalho pesado de dados e ciência, onde o ecossistema resolve mais.",
            },
            {
                frente: "Como você argumentaria contra adotar um framework grande em Go?",
                verso: "Mostrando que a biblioteca padrão cobre roteamento, servidor e testes, e que o custo do framework aparece depois, no acoplamento e na migração. O argumento honesto reconhece o outro lado: framework dá padrão pronto para time grande e rotativo.",
            },
            {
                frente: "Como você definiria a fronteira entre pacotes num monólito Go?",
                verso: "Pelo domínio e pelo sentido da dependência: o pacote de dentro não conhece o de fora. Dependência circular é sinal de que a fronteira está errada. O que precisa ser sustentado fica público, o resto vai para internal, e a main costura tudo.",
            },
            {
                frente: "O modelo de erro como valor escala em código grande?",
                verso: "Escala, ao custo de disciplina. Sem convenção, vira erro embrulhado três vezes com o mesmo texto ou engolido no meio. O que sustenta é definir erros de domínio no pacote, embrulhar com contexto e decidir num lugar só o que vira resposta.",
            },
            {
                frente: "Como você revisaria um código concorrente de outra pessoa?",
                verso: "Perguntando de cada goroutine quem a encerra, de cada canal quem o fecha, e de cada estado compartilhado o que o protege. Depois, se o cancelamento chega ao fim da árvore. E exigindo teste com o detector de corrida antes de aprovar.",
            },
            {
                frente: "Como você conduziria a migração de uma biblioteca central em produção?",
                verso: "Isolando a biblioteca atrás de uma interface própria, trocando a implementação por trás e liberando por porcentagem, com métrica comparando os dois caminhos. Volta atrás por configuração, e não por reversão de código.",
            },
            {
                frente: "Como você saberia se a concorrência do serviço está bem dimensionada?",
                verso: "Olhando saturação, e não uso de processador: fila crescendo, latência subindo sem carga subir e goroutines vivas acumulando. Concorrência demais desloca o gargalo para o banco ou para o serviço vizinho, e o sintoma aparece lá, não aqui.",
            },
            {
                frente: "Como você trataria compatibilidade de uma API pública ao longo dos anos?",
                verso: "Só acrescentando, nunca mudando assinatura. Campo novo em struct de opções em vez de parâmetro novo, e função nova em vez de trocar a antiga. Quebra de contrato vira caminho de módulo com versão maior, e a antiga ganha prazo de aposentadoria.",
            },
            {
                frente: "Como você avaliaria introduzir generics num código legado?",
                verso: "Só onde existe duplicação real por tipo e o teste prova o comportamento igual. Reescrever o que já funciona com interface não paga o custo de revisão. E generics dificultam leitura para quem entra, então o ganho precisa ser visível.",
            },
            {
                frente: "Como você lidaria com um incidente de vazamento de goroutine?",
                verso: "Primeiro estancar, reiniciando ou limitando a entrada. Depois coletar o perfil de goroutines, que mostra a pilha de cada uma parada e revela o ponto de bloqueio. A correção estrutural é contexto com prazo e teste que conta goroutines.",
            },
            {
                frente: "Quando um serviço em Go deveria virar dois?",
                verso: "Quando o motivo é organizacional ou de escala independente, e não estético. Times que se atrapalham no mesmo repositório, ou parte que precisa escalar sozinha. Se a fronteira ainda não está clara entre pacotes, dividir em rede só piora.",
            },
            {
                frente: "Como você ensinaria Go a quem vem de linguagem com exception?",
                verso: "Começando pelo motivo do erro como valor, não pela sintaxe. Mostrando que o if err != nil deixa o caminho de falha visível, e que embrulhar com contexto substitui o rastro de pilha. E cortando a vontade de recriar herança com embedding.",
            },
            {
                frente: "Como você trataria a ausência de enum na linguagem?",
                verso: "Tipo próprio sobre string ou inteiro, com constantes declaradas e uma função de validação na fronteira do sistema. O compilador não garante exaustividade, então o switch precisa de caso padrão que falhe alto quando aparecer valor novo.",
            },
            {
                frente: "Como você identificaria que a coleta de lixo virou o gargalo?",
                verso: "Pelas métricas do runtime: pausas e fração de tempo em coleta subindo junto com a latência de cauda. O caminho é reduzir alocação no trecho quente, medindo com o perfil de alocação, antes de mexer em GOGC, que só troca memória por processamento.",
            },
            {
                frente: "O que você olharia primeiro num serviço Go que ficou lento?",
                verso: "Se a lentidão está no serviço ou no que ele chama, comparando latência interna com a das dependências. Depois perfil de processamento e de bloqueio, contagem de goroutines e fila de conexões do banco. Medir antes de otimizar qualquer trecho.",
            },
            {
                frente: "Como você avaliaria um código Go que acabou de herdar?",
                verso: "Rodando os testes e vendo o que eles cobrem, procurando estado global, init com efeito colateral, goroutine sem dono e uso de interface vazia. Depois o grafo de dependência entre pacotes, para ver se existe fronteira ou só um emaranhado.",
            },
            {
                frente: "Como você estruturaria os testes de integração de um serviço Go?",
                verso: "Banco real e efêmero em container, subindo por script, com as migrations aplicadas e limpeza entre casos. Separados dos de unidade por tag ou pasta, para o ciclo rápido continuar rápido. Sem simular o banco, que é onde os erros aparecem.",
            },
            {
                frente: "Como você lidaria com tempo de build e de teste crescendo demais?",
                verso: "Medindo antes: cache de build, paralelismo e quais pacotes dominam. Teste lento costuma ser espera real disfarçada de sleep e banco recriado por caso. Separar unidade de integração e paralelizar o que é independente resolve a maior parte.",
            },
            {
                frente: "Como você decidiria entre canal e mutex numa revisão de código?",
                verso: "Pelo que o código está fazendo: transferir a posse de um dado pede canal; proteger leitura e escrita de um estado pede mutex. Canal usado para proteger contador é complexidade sem ganho, e mutex segurado durante chamada de rede é gargalo.",
            },
            {
                frente: "Como você conduziria uma decisão técnica com a qual você discorda?",
                verso: "Registrando o desacordo com argumento e critério de reversão, e então apoiando a execução. Definir antes qual número mostraria que a escolha foi errada tira a discussão do campo da opinião e dá ao time uma saída sem ninguém perder a cara.",
            },
        ],
    },
};
