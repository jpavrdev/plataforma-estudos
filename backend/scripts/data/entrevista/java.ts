import type { TopicoDeEntrevista } from "../../seed-entrevista.ts";

/**
 * Perguntas de entrevista de Java.
 *
 * O nível segue o que a pergunta cobra, e não o assunto. Coleção aparece nos quatro
 * níveis: em estágio é "qual a diferença entre ArrayList e LinkedList", em sênior é
 * como o time decide o que usar sem transformar cada revisão numa discussão.
 */
export const java: TopicoDeEntrevista = {
    slug: "java",
    nome: "Java",
    position: 6,
    perguntas: {
        estagio: [
            {
                frente: "O que a JVM faz para o mesmo programa rodar em sistemas diferentes?",
                verso: "O compilador gera bytecode, que não é código de máquina de nenhum processador. Quem traduz para a máquina real é a JVM daquele sistema, na hora da execução. Por isso o mesmo jar roda em Linux, Windows e Mac, desde que exista uma JVM compatível instalada.",
            },
            {
                frente: "Qual a diferença entre JDK, JRE e JVM?",
                verso: "A JVM é quem executa o bytecode. O JRE é a JVM mais as bibliotecas padrão, o suficiente para rodar. O JDK acrescenta o compilador e as ferramentas de desenvolvimento. Para escrever código você precisa do JDK; para só executar, o JRE bastava.",
            },
            {
                frente: "Qual a diferença entre compilar e executar um programa Java?",
                verso: "Compilar transforma o código em bytecode e é quando erro de tipo e de sintaxe aparece. Executar é a JVM interpretar e otimizar esse bytecode, e é quando erro de lógica, nulo e falha de ambiente aparecem. Compilar sem erro não diz nada sobre o comportamento.",
            },
            {
                frente: "O que é uma classe e o que é um objeto?",
                verso: "A classe é o molde: descreve quais dados e comportamentos aquele tipo tem. O objeto é uma instância desse molde, criada com new, com seus próprios valores. Mil objetos da mesma classe compartilham o comportamento e não compartilham o estado.",
            },
            {
                frente: "Para que serve o construtor?",
                verso: "Para o objeto nascer num estado válido, recebendo o que ele precisa para funcionar. Se você não declara nenhum, o compilador cria um sem argumentos. Deixar campo obrigatório fora do construtor é o que produz objeto pela metade circulando pelo código.",
            },
            {
                frente: "O que o this representa?",
                verso: "A referência ao próprio objeto em que o método está rodando. Serve para diferenciar o campo do parâmetro de mesmo nome e para um construtor chamar outro da mesma classe. Em método estático ele não existe, porque não há instância.",
            },
            {
                frente: "Qual a diferença entre tipo primitivo e wrapper?",
                verso: "O primitivo guarda o valor direto e não pode ser nulo, como int e boolean. O wrapper é um objeto que embrulha esse valor, como Integer, e aceita nulo. Coleção só guarda objeto, então lista de números usa wrapper, e isso custa memória e uma indireção.",
            },
            {
                frente: "O que é autoboxing e que armadilha ele traz?",
                verso: "É a conversão automática entre primitivo e wrapper, como colocar um int numa List de Integer. A armadilha é o Integer nulo desembrulhado, que estoura NullPointerException numa linha que parece aritmética, e a comparação com == entre wrappers, que compara referência.",
            },
            {
                frente: "Por que String é imutável em Java?",
                verso: "Porque isso permite compartilhar a mesma instância com segurança entre threads e reaproveitar literais no pool. Também torna o hash estável, o que faz String ser boa chave de mapa. O custo é que toda alteração cria um novo objeto.",
            },
            {
                frente: "Quando você usaria == e quando usaria equals?",
                verso: "O == compara referência, ou seja, se as duas variáveis apontam para o mesmo objeto. O equals compara conteúdo, do jeito que a classe definiu. Para primitivo o == compara valor mesmo. Comparar String com == funciona às vezes por causa do pool, e é por isso que engana.",
            },
            {
                frente: "Como você compararia dois textos ignorando maiúsculas e minúsculas?",
                verso: "Com equalsIgnoreCase, que já trata a diferença sem criar cópias. Converter os dois para minúsculo antes de comparar também funciona, mas gera objetos à toa e esbarra em regra de idioma em alguns alfabetos. Antes disso, garanta que nenhum dos dois é nulo.",
            },
            {
                frente: "O que acontece se você sobrescrever equals e esquecer hashCode?",
                verso: "Dois objetos passam a ser iguais mas caem em posições diferentes de um HashMap ou HashSet. O resultado é elemento duplicado no conjunto e busca que não encontra o que foi guardado. O contrato é claro: objetos iguais precisam ter o mesmo hash.",
            },
            {
                frente: "Como você compararia dois objetos sem correr risco de nulo?",
                verso: "Com Objects.equals, que trata os dois lados nulos e só delega para o equals quando faz sentido. Chamar equals direto numa referência que pode ser nula é uma das causas mais comuns de NullPointerException em código que parece defensivo.",
            },
            {
                frente: "Por que concatenar String dentro de um laço é problema?",
                verso: "Cada concatenação cria um objeto novo e copia o conteúdo anterior, então o custo cresce com o quadrado do tamanho. Dentro de laço isso aparece rápido. StringBuilder acumula num buffer que cresce, e só materializa a String no final.",
            },
            {
                frente: "Quando você usaria String.format em vez de concatenar?",
                verso: "Quando o texto tem vários pontos variáveis e a leitura fica ruim com sinais de mais espalhados, ou quando há formatação de número e data envolvida. Para juntar duas partes simples, concatenar continua mais direto e mais rápido de ler.",
            },
            {
                frente: "O que muda entre um bloco de texto e uma String comum?",
                verso: "O bloco de texto usa três aspas e permite várias linhas sem escapar aspas nem juntar pedaços com n escapado. Serve muito bem para SQL, JSON e HTML embutidos. É açúcar de sintaxe: no fim continua sendo uma String comum.",
            },
            {
                frente: "Como você converteria um texto em número?",
                verso: "Com Integer.parseInt ou Double.parseDouble, lembrando que texto inválido lança NumberFormatException. Em entrada vinda de usuário isso precisa de tratamento, e não de confiança. Para valor decimal com vírgula, o formato local importa.",
            },
            {
                frente: "Por que não usar double para representar dinheiro?",
                verso: "Porque double é binário e não representa exatamente valores como 0,1, então somas acumulam erro e o total fecha errado por centavos. Para dinheiro se usa BigDecimal, criado a partir de String, ou um inteiro contando a menor unidade.",
            },
            {
                frente: "O que acontece ao dividir um número inteiro por zero?",
                verso: "Lança ArithmeticException na hora. Com ponto flutuante o comportamento é outro: o resultado vira infinito ou NaN, sem exceção nenhuma, e o problema só aparece páginas depois. Por isso divisão com denominador vindo de fora sempre precisa de checagem.",
            },
            {
                frente: "O que é um array em Java?",
                verso: "Uma sequência de tamanho fixo, definido na criação, com todos os elementos do mesmo tipo e acesso por índice a partir do zero. Índice fora do intervalo lança exceção em vez de ler memória qualquer. Na maior parte do código do dia a dia se usa List no lugar.",
            },
            {
                frente: "Qual a diferença entre length, length() e size()?",
                verso: "O length é campo de array, o length() é método de String, e o size() é método de coleção. Não é inconsistência à toa: são três tipos diferentes com histórias diferentes. Confundir os três é erro de compilação, então o compilador avisa.",
            },
            {
                frente: "Qual a diferença entre ArrayList e LinkedList?",
                verso: "O ArrayList guarda os elementos em um array, então acesso por índice é imediato e inserir no meio exige deslocar o resto. O LinkedList guarda nós ligados, e inserir no meio é barato se você já está na posição. Na prática o ArrayList vence quase sempre, por causa da localidade de memória.",
            },
            {
                frente: "Como você escolheria entre List, Set e Map?",
                verso: "List quando a ordem importa e a repetição é aceitável. Set quando cada elemento aparece uma vez só e você quer checar pertencimento rápido. Map quando cada valor é encontrado por uma chave. A escolha errada aparece como laço buscando dentro de laço.",
            },
            {
                frente: "Como você percorreria uma lista?",
                verso: "Com for aprimorado quando você só precisa do elemento, que é o caso comum e o mais legível. Com índice quando a posição importa. Com iterador quando precisa remover durante a passagem, porque remover pela lista dentro do for aprimorado lança ConcurrentModificationException.",
            },
            {
                frente: "O que é uma coleção imutável?",
                verso: "Uma coleção que recusa alteração depois de criada, como as devolvidas por List.of. Tentar adicionar lança UnsupportedOperationException. Serve para constante e para retorno que ninguém deve mexer, e evita que um chamador altere a lista interna de um objeto.",
            },
            {
                frente: "Como você juntaria uma lista de nomes numa única String?",
                verso: "Com String.join passando o separador, que já cuida de não sobrar separador no fim. Em fluxo com stream, o Collectors.joining faz o mesmo e ainda aceita prefixo e sufixo. Montar na mão com laço e if de primeira volta é onde o erro de vírgula aparece.",
            },
            {
                frente: "Qual a diferença entre interface e classe abstrata?",
                verso: "A interface declara o que um tipo sabe fazer, e uma classe pode implementar várias. A classe abstrata é herança de verdade, com estado e construtor, e só se herda de uma. A regra prática é usar interface para contrato e classe abstrata para compartilhar implementação.",
            },
            {
                frente: "O que é herança e quando ela ajuda?",
                verso: "É uma classe estender outra e receber comportamento e estado dela. Ajuda quando existe relação de é um de verdade e a subclasse pode substituir a superclasse sem surpresa. Para só reaproveitar código, composição costuma envelhecer melhor.",
            },
            {
                frente: "O que o super faz?",
                verso: "Chama o construtor da superclasse ou acessa o membro dela quando a subclasse sobrescreveu. É comum na primeira linha do construtor para inicializar a parte herdada. Sem chamada explícita, o compilador insere a chamada ao construtor sem argumentos.",
            },
            {
                frente: "O que é polimorfismo na prática?",
                verso: "Tratar objetos diferentes pelo mesmo tipo e deixar cada um responder do seu jeito. Uma lista de Forma chamando desenhar executa o código do círculo ou do quadrado conforme o objeto real. É o que substitui cadeia de if verificando tipo.",
            },
            {
                frente: "O que muda entre sobrecarga e sobrescrita de método?",
                verso: "Sobrecarga é ter métodos de mesmo nome e parâmetros diferentes na mesma classe, e o compilador escolhe qual chamar. Sobrescrita é a subclasse trocar o comportamento de um método herdado, e a escolha acontece em tempo de execução pelo tipo real do objeto.",
            },
            {
                frente: "O que a anotação Override faz?",
                verso: "Pede ao compilador que confirme que aquele método realmente sobrescreve algo. Se você errar a assinatura, ele acusa em vez de criar um método novo que nunca é chamado. É barata e evita um dos bugs mais silenciosos da linguagem.",
            },
            {
                frente: "O que o instanceof faz?",
                verso: "Testa se a referência aponta para um objeto daquele tipo, e devolve falso para nulo. Nas versões recentes ele já declara a variável convertida no mesmo teste. Cadeia grande de instanceof costuma ser sinal de que faltou polimorfismo.",
            },
            {
                frente: "Para que serve a palavra static?",
                verso: "Liga o membro à classe, e não a cada instância. Existe uma cópia só, acessível sem criar objeto. Serve para constante e método utilitário. O cuidado é que campo estático mutável vira estado global compartilhado entre todas as requisições.",
            },
            {
                frente: "O que final significa em variável, método e classe?",
                verso: "Em variável, o valor não pode ser reatribuído depois de definido, o que não impede alterar o objeto apontado. Em método, a subclasse não pode sobrescrever. Em classe, ninguém pode herdar. É uma forma de declarar intenção e evitar mudança acidental.",
            },
            {
                frente: "Como você declararia uma constante?",
                verso: "Como campo static final, em maiúsculas com palavras separadas por sublinhado, por convenção. O static evita uma cópia por objeto e o final impede reatribuição. Se a constante for uma coleção, ela ainda precisa ser imutável para valer de verdade.",
            },
            {
                frente: "Qual a diferença entre variável local, de instância e de classe?",
                verso: "A local vive dentro do método e some no fim dele. A de instância pertence a cada objeto e vive enquanto ele existir. A de classe é estática e existe uma só para todos. Escolher a errada é o que faz estado vazar entre requisições.",
            },
            {
                frente: "O que acontece com uma variável local não inicializada?",
                verso: "O compilador recusa o código se você tentar lê-la, o que é uma proteção e não um incômodo. Campo de instância é diferente: ele recebe o valor padrão do tipo, zero, falso ou nulo. Essa diferença explica muito NullPointerException em campo esquecido.",
            },
            {
                frente: "Qual a diferença entre exceção checada e não checada?",
                verso: "A checada precisa ser tratada ou declarada na assinatura, e o compilador cobra. A não checada, que herda de RuntimeException, não obriga nada. A ideia original era usar checada para falha esperada e recuperável, mas na prática muita gente só declara e repassa.",
            },
            {
                frente: "O que o bloco finally garante?",
                verso: "Que o trecho roda com ou sem exceção, e mesmo quando há return antes dele. É onde a liberação de recurso vive quando não se usa try com recursos. Não roda se a JVM morre no meio, então não serve como garantia de consistência de dado.",
            },
            {
                frente: "O que a pilha de execução de um erro está te dizendo?",
                verso: "A sequência de chamadas até o ponto onde a exceção nasceu, do mais recente para o mais antigo, e a causa encadeada quando existe. A primeira linha do seu pacote costuma ser onde investigar. Ler de baixo para cima ajuda a achar o que originou.",
            },
            {
                frente: "Como você trataria a leitura de um arquivo que pode não existir?",
                verso: "Checando antes ou tratando a exceção de entrada e saída, e decidindo o que fazer: usar um padrão, avisar o usuário ou falhar de forma clara. O que não pode é capturar e seguir em silêncio, porque aí o problema aparece como dado faltando muito depois.",
            },
            {
                frente: "O que os modificadores de visibilidade controlam?",
                verso: "Quem enxerga o membro. Private só a própria classe, sem modificador só o mesmo pacote, protected acrescenta as subclasses, e public todo mundo. Deixar tudo público transforma detalhe interno em contrato, e depois qualquer mudança quebra alguém.",
            },
            {
                frente: "O que é um pacote e por que ele importa?",
                verso: "É o agrupamento das classes, refletido na estrutura de pastas, que evita choque de nomes e organiza o projeto por assunto. Ele também é fronteira de visibilidade: membro sem modificador só é visto dentro do mesmo pacote.",
            },
            {
                frente: "O que acontece se duas bibliotecas tiverem classes de mesmo nome?",
                verso: "Nada, desde que estejam em pacotes diferentes, porque o nome completo inclui o pacote. No arquivo você importa uma e usa a outra pelo nome completo. O problema real é a mesma classe aparecer em duas versões no classpath, e aí vence a primeira encontrada.",
            },
            {
                frente: "O que o coletor de lixo faz, e o que ele não faz?",
                verso: "Libera memória de objetos que não são mais alcançáveis a partir das raízes do programa. Ele não fecha arquivo, conexão nem socket, e não roda em momento previsível. Objeto ainda referenciado por engano, como numa lista estática, nunca é recolhido.",
            },
            {
                frente: "Para que serve o var, e quando ele atrapalha?",
                verso: "Deixa o compilador inferir o tipo da variável local, tirando repetição de nomes longos. Atrapalha quando o lado direito não diz qual é o tipo, como uma chamada de método com nome vago, e quem lê o código precisa abrir outra classe para entender.",
            },
            {
                frente: "O que acontece quando você chama um método em uma referência nula?",
                verso: "A JVM lança NullPointerException no ponto da chamada. Nas versões recentes a mensagem diz qual referência era nula, o que reduz muito o tempo de investigação. Evitar o problema é questão de desenho: não devolver nulo onde a lista vazia serve.",
            },
            {
                frente: "Para que serve o Objects.requireNonNull?",
                verso: "Para falhar no construtor ou no início do método, e não vinte linhas depois com uma exceção sem contexto. Ele deixa a exigência explícita na leitura do código e permite passar uma mensagem dizendo qual argumento faltou.",
            },
            {
                frente: "O que o método main precisa ter para a JVM encontrá-lo?",
                verso: "Precisa ser público, estático, sem retorno e receber um array de String. A JVM procura essa assinatura exata na classe indicada. Assinatura parecida compila normalmente, mas a aplicação não sobe, e o erro só aparece na hora de rodar.",
            },
            {
                frente: "Como você leria uma entrada digitada no console?",
                verso: "Com Scanner sobre a entrada padrão, lendo linha ou valor conforme o caso. O cuidado clássico é misturar leitura de número com leitura de linha, que deixa a quebra de linha pendente e faz a próxima leitura vir vazia. Em serviço real isso quase não aparece.",
            },
            {
                frente: "Qual a diferença entre while e do while?",
                verso: "O while testa antes, então pode nunca executar. O do while executa uma vez e testa depois. Na prática o do while é raro, e aparece quando a primeira execução é obrigatória, como pedir entrada até vir algo válido.",
            },
            {
                frente: "Qual a diferença entre break e continue?",
                verso: "O break sai do laço inteiro, e o continue pula para a próxima iteração. Os dois deixam o fluxo mais difícil de acompanhar quando aparecem no meio de laço grande, e é aí que extrair um método com nome bom costuma resolver melhor.",
            },
            {
                frente: "Quando o switch é melhor que uma cadeia de if?",
                verso: "Quando você compara o mesmo valor contra várias opções fixas, como um enum. Fica mais legível e o compilador ajuda a cobrar todos os casos. Para condições diferentes entre si, if encadeado continua sendo o certo.",
            },
            {
                frente: "O que o operador ternário resolve?",
                verso: "Escolher entre dois valores numa única expressão, o que permite atribuir direto e usar em campo final. Ele deixa de ajudar quando é aninhado: dois ternários dentro de outro custam mais para ler do que um if bem escrito.",
            },
            {
                frente: "Como você faria um método devolver mais de um valor?",
                verso: "Criando um tipo que represente o resultado, que hoje costuma ser um record de duas ou três linhas. Isso dá nome aos campos e sobrevive à evolução. Devolver array, mapa ou lista de Object economiza uma classe e cobra em toda leitura futura.",
            },
            {
                frente: "Por que alterar um objeto dentro de um método afeta quem chamou, se Java é por valor?",
                verso: "Porque o que é copiado é a referência, e não o objeto. As duas variáveis apontam para o mesmo lugar, então alterar um campo é visível fora. Reatribuir o parâmetro, ao contrário, não muda nada para quem chamou.",
            },
            {
                frente: "Para que serve o método toString?",
                verso: "Para o objeto ter uma representação legível em log e depuração. O padrão herdado mostra o nome da classe e um número, que não ajuda ninguém. Ao sobrescrever, o cuidado é não vazar dado sensível, porque isso acaba em arquivo de log.",
            },
            {
                frente: "O que é uma classe anônima e onde ela ainda aparece?",
                verso: "É implementar uma interface ou estender uma classe no ponto de uso, sem dar nome. Aparecia muito em ouvinte de evento e comparador. Hoje lambda cobre a maior parte dos casos, e a classe anônima fica para quando é preciso mais de um método ou estado.",
            },
            {
                frente: "O que é o classpath?",
                verso: "A lista de lugares onde a JVM procura as classes e recursos que o programa usa. Erro de classe não encontrada em tempo de execução quase sempre é classpath, e não código. Ferramenta de build monta isso para você a partir das dependências declaradas.",
            },
            {
                frente: "Para que serve o Maven ou o Gradle num projeto Java?",
                verso: "Para declarar dependências e baixá-las com suas próprias dependências, padronizar a estrutura de pastas e rodar compilação, teste e empacotamento com um comando. Sem isso, cada máquina monta o classpath do seu jeito e o build da sua difere do da minha.",
            },
            {
                frente: "O que é um jar?",
                verso: "Um arquivo compactado com as classes compiladas e os recursos do projeto, mais um manifesto. Pode ser biblioteca ou executável, quando o manifesto aponta a classe principal. É a unidade que você publica ou entrega para rodar.",
            },
            {
                frente: "Como você escreveria um teste automatizado simples?",
                verso: "Com JUnit, um método anotado como teste que prepara a entrada, chama o código e verifica o resultado com uma asserção. Um caso por comportamento, com nome dizendo o que se espera. Teste que não falha quando o código quebra não está testando.",
            },
            {
                frente: "O que uma exceção interrompe?",
                verso: "O fluxo normal do método, que devolve o controle para quem chamou até alguém capturar. Nada depois da linha que lançou executa, exceto o finally e o fechamento do try com recursos. Por isso operação pela metade precisa de transação, e não de esperança.",
            },
            {
                frente: "Como você documentaria uma classe pública?",
                verso: "Com Javadoc dizendo o que ela faz e o que não faz, mais o significado dos parâmetros e do retorno. O que já está óbvio na assinatura não precisa ser repetido. Documentação que só reescreve o nome do método envelhece e ninguém corrige.",
            },
            {
                frente: "O que é sombreamento de variável?",
                verso: "É declarar no escopo interno um nome que já existe no externo, como parâmetro com o mesmo nome do campo. O interno esconde o externo, e a atribuição vai para o lugar errado sem erro de compilação. Por isso construtor usa this ao atribuir campo.",
            },
            {
                frente: "Como um laço infinito aparece por engano?",
                verso: "Quando a condição depende de algo que o corpo esqueceu de atualizar, ou quando o incremento está dentro de um if que nem sempre roda. O sintoma é uso de CPU no talo com o programa parado. Sair pelo meio com break é o remendo, não a correção.",
            },
            {
                frente: "O que muda ao declarar uma variável como o tipo da interface e não da classe?",
                verso: "O código passa a depender do contrato, e trocar a implementação vira uma linha. Declarar List e instanciar ArrayList é o caso mais comum. Declarar pelo tipo concreto amarra quem usa a detalhes que não precisava conhecer.",
            },
            {
                frente: "Como você organizaria as classes de um projeto pequeno?",
                verso: "Por assunto, e não por tipo técnico. Um pacote por área do problema, com o que muda junto ficando junto. Separar em controladores, serviços e repositórios espalha uma mudança simples por três pastas, e essa conta piora conforme o projeto cresce.",
            },
            {
                frente: "Que convenções de nome Java espera de você?",
                verso: "Classe em PascalCase, método e variável em camelCase, constante em maiúsculas com sublinhado e pacote em minúsculas. Não é firula: ferramenta, framework e quem revisa contam com isso. Nome que descreve o papel vale mais que nome curto.",
            },
        ],
        junior: [
            {
                frente: "Como um HashMap encontra um valor?",
                verso: "Calcula o hash da chave, usa esse número para escolher um balde e compara com equals dentro dele. Com boa distribuição, a busca é praticamente imediata. Quando muitas chaves caem no mesmo balde, a lista interna vira árvore para não degradar tanto.",
            },
            {
                frente: "O que quebra se a chave de um HashMap for mutável?",
                verso: "Alterar o campo que entra no hash muda o balde calculado, mas o objeto continua guardado no balde antigo. A entrada some das buscas e continua ocupando memória. Por isso chave boa é imutável, como String ou um record de campos finais.",
            },
            {
                frente: "Qual a diferença entre HashMap, LinkedHashMap e TreeMap?",
                verso: "O HashMap não garante ordem nenhuma. O LinkedHashMap mantém a ordem de inserção, ao custo de uma lista ligada extra. O TreeMap mantém as chaves ordenadas usando comparação, com custo logarítmico em vez de constante. Escolha pelo que a saída precisa garantir.",
            },
            {
                frente: "Como você implementaria equals corretamente?",
                verso: "Checando identidade primeiro, depois o tipo, depois cada campo que define igualdade, e sempre junto com hashCode usando os mesmos campos. Ele precisa ser simétrico, transitivo e consistente. Em tipo de dado, o record já entrega tudo isso pronto.",
            },
            {
                frente: "Quando você usaria um HashSet em vez de uma lista?",
                verso: "Quando a pergunta que você faz é se o elemento está lá, e não em que posição ele está. A checagem sai de percorrer tudo para praticamente imediata. Trocar contains de lista por conjunto costuma ser a otimização mais barata de um laço aninhado.",
            },
            {
                frente: "O que acontece se você alterar uma coleção enquanto itera sobre ela?",
                verso: "O iterador detecta a modificação e lança ConcurrentModificationException, mesmo sem thread nenhuma envolvida. Para remover durante a passagem, use o remove do próprio iterador ou removeIf. Copiar a lista antes resolve, mas paga uma cópia.",
            },
            {
                frente: "Como você percorreria um Map?",
                verso: "Iterando sobre entrySet, que dá chave e valor numa passada só. Percorrer keySet e chamar get para cada chave faz duas buscas por elemento sem necessidade. Para só um dos lados, existem keySet e values.",
            },
            {
                frente: "Quando você implementaria Comparable e quando passaria um Comparator?",
                verso: "Comparable quando o tipo tem uma ordem natural única, como data ou dinheiro. Comparator quando a ordem depende do contexto, como listar por nome numa tela e por valor em outra. Comparator também evita sujar o domínio com regra de apresentação.",
            },
            {
                frente: "Como você ordenaria uma lista por dois critérios?",
                verso: "Com Comparator.comparing no primeiro campo e thenComparing no seguinte, o que lê quase como a frase do requisito. Para inverter só um deles, reversed se aplica ao comparador construído até ali, e é onde a ordem das chamadas engana.",
            },
            {
                frente: "O que muda ao trocar um laço por um stream?",
                verso: "O código passa a descrever a transformação em vez do passo a passo, o que costuma ler melhor em filtro e mapeamento encadeados. Em troca, a pilha de erro fica mais confusa e depurar exige mais esforço. Para laço simples com efeito colateral, o for continua melhor.",
            },
            {
                frente: "Quando um stream é realmente executado?",
                verso: "Só quando chega uma operação terminal, como collect, forEach ou count. Antes disso as etapas apenas são registradas. É por isso que um stream sem terminal não faz nada e não dá erro, e que o elemento atravessa todas as etapas de uma vez, e não etapa por etapa em toda a coleção.",
            },
            {
                frente: "O que acontece se você reutilizar um stream já consumido?",
                verso: "Lança IllegalStateException, porque o stream é de passagem única. Se precisar de duas leituras, guarde a coleção e crie um stream novo a cada vez. Isso também explica por que não se guarda stream em campo nem se devolve um em API pública sem pensar.",
            },
            {
                frente: "Qual a diferença entre map e flatMap?",
                verso: "O map transforma cada elemento em outro, mantendo a contagem. O flatMap transforma cada elemento em um stream e junta todos num só, então serve para achatar lista de listas. Se o resultado do map já é uma coleção, o que você queria era flatMap.",
            },
            {
                frente: "Como você agruparia uma lista por um campo?",
                verso: "Com Collectors.groupingBy passando a função que extrai a chave, o que devolve um Map de chave para lista. Um segundo coletor permite contar, somar ou mapear cada grupo direto. É o caso onde stream ganha do laço com folga.",
            },
            {
                frente: "Qual a diferença entre findFirst e findAny?",
                verso: "O findFirst respeita a ordem do stream e devolve o primeiro. O findAny pode devolver qualquer um, o que permite parar mais cedo em stream paralelo. Em stream sequencial os dois costumam dar o mesmo resultado, mas o contrato é diferente.",
            },
            {
                frente: "Quando o Optional ajuda, e quando ele só empurra o problema?",
                verso: "Ajuda como retorno de método que pode não achar nada, porque obriga quem chama a decidir. Empurra o problema quando vira campo de entidade, parâmetro ou quando o código só chama get sem checar, que é o NullPointerException com outro nome.",
            },
            {
                frente: "Qual a diferença entre orElse e orElseGet?",
                verso: "O orElse recebe um valor, que é calculado sempre, mesmo quando o Optional tem conteúdo. O orElseGet recebe uma função, avaliada só quando falta valor. Quando o valor de reserva é caro, como uma consulta ao banco, essa diferença deixa de ser detalhe.",
            },
            {
                frente: "O que é uma interface funcional?",
                verso: "Uma interface com um único método abstrato, o que permite passá-la como lambda ou referência de método. É o que faz Runnable, Comparator e Function funcionarem com sintaxe curta. A anotação FunctionalInterface não cria a regra, apenas faz o compilador cobrá-la.",
            },
            {
                frente: "O que muda entre Function, Consumer, Supplier e Predicate?",
                verso: "Function recebe e devolve, Consumer recebe e não devolve, Supplier não recebe e devolve, e Predicate recebe e devolve booleano. São só nomes para as formas mais comuns de lambda, e conhecê-las evita criar interface própria para cada caso.",
            },
            {
                frente: "O que é uma referência de método?",
                verso: "Uma forma curta de escrever um lambda que só chama um método existente, como Usuario::getNome no lugar de u para u.getNome(). Lê melhor quando não há transformação extra. Quando há qualquer lógica no meio, o lambda explícito é mais honesto.",
            },
            {
                frente: "Como você trataria uma exceção checada dentro de um lambda?",
                verso: "Capturando dentro do próprio lambda e traduzindo para algo não checado, ou tirando o trecho para um método que já trata. As interfaces funcionais padrão não declaram exceção checada, então não existe jeito limpo de deixar subir sem envolver o erro.",
            },
            {
                frente: "O que o apagamento de tipos custa em generics?",
                verso: "O tipo genérico existe só na compilação, e em tempo de execução List de String e List de Integer são a mesma coisa. Isso impede checar o tipo com instanceof, criar array do tipo genérico e sobrecarregar métodos que só diferem no parâmetro genérico.",
            },
            {
                frente: "Para que serve o curinga numa assinatura genérica?",
                verso: "Para o método aceitar uma família de tipos em vez de um só. O extends serve para quem só lê da coleção, e o super para quem só escreve nela. Sem isso, um método que soma números não aceitaria uma lista de inteiros, porque generics não é covariante.",
            },
            {
                frente: "O que o try com recursos resolve?",
                verso: "Fecha o recurso automaticamente ao sair do bloco, na ordem inversa da abertura, inclusive quando há exceção. Evita o finally aninhado e o recurso esquecido aberto. Também guarda a exceção do fechamento como suprimida, em vez de esconder a original.",
            },
            {
                frente: "O que acontece se o finally lançar uma exceção?",
                verso: "Ela substitui a exceção original, que se perde sem deixar rastro. É por isso que finally não é lugar para lógica que pode falhar, e é uma das razões do try com recursos existir: lá a falha do fechamento vira exceção suprimida em vez de apagar a causa.",
            },
            {
                frente: "Como você deixaria uma classe imutável?",
                verso: "Campos finais e privados, sem setter, classe final ou construtor privado para ninguém herdar e furar a regra, e cópia defensiva do que entra e do que sai quando o campo é mutável. Um record já faz boa parte disso, menos a cópia defensiva.",
            },
            {
                frente: "Qual a diferença entre cópia rasa e cópia profunda?",
                verso: "A rasa copia os campos, então os objetos internos continuam sendo os mesmos e compartilhados. A profunda copia também o que está dentro. Devolver uma cópia rasa de uma lista de objetos mutáveis dá falsa sensação de proteção.",
            },
            {
                frente: "O que Cloneable tem de problemático?",
                verso: "É uma interface sem método, e o clone herdado é protegido, faz cópia rasa e não chama construtor. Na prática se usa construtor de cópia ou fábrica estática, que são explícitos e funcionam com campos finais. Clone é história antiga da linguagem.",
            },
            {
                frente: "O que um enum em Java pode fazer além de listar constantes?",
                verso: "Ter campos, construtor e métodos, inclusive comportamento diferente por constante. Isso permite trocar um switch espalhado por polimorfismo dentro do próprio enum. Ele também é a forma mais simples e segura de singleton na linguagem.",
            },
            {
                frente: "Quando um record é a escolha certa?",
                verso: "Quando o tipo existe para transportar dado, e a identidade dele é o conjunto dos valores. Ele já vem com construtor, acessores, equals, hashCode e toString coerentes. Não serve quando o objeto precisa de estado mutável ou de herança.",
            },
            {
                frente: "O que é uma classe selada, e que problema ela resolve?",
                verso: "É uma classe ou interface que declara quais tipos podem estendê-la. Isso fecha a hierarquia e permite ao compilador saber que os casos são aqueles, cobrando switch completo. Serve bem para modelar resultado com poucas variações conhecidas.",
            },
            {
                frente: "O que o switch com padrão mudou no código Java?",
                verso: "Permite decidir pelo tipo e já receber a variável convertida, com o compilador cobrando que todos os casos de uma hierarquia selada sejam tratados. Substitui cadeia de instanceof com conversão manual, que era onde o erro de esquecer um caso aparecia.",
            },
            {
                frente: "O que é um método default numa interface?",
                verso: "Um método com corpo dentro da interface, criado para permitir acrescentar comportamento sem quebrar quem já implementava. Serve para evolução de API, não para virar lugar de lógica de negócio. Se duas interfaces trazem o mesmo default, a classe precisa desempatar.",
            },
            {
                frente: "Qual a diferença entre classe interna estática e não estática?",
                verso: "A não estática guarda uma referência implícita ao objeto externo, o que a impede de ser coletada enquanto viver e vaza contexto sem ninguém perceber. A estática é apenas uma classe aninhada por organização. Na dúvida, estática.",
            },
            {
                frente: "O que é um bloco estático de inicialização?",
                verso: "Um trecho que roda uma vez quando a classe é carregada, usado para preparar constante que exige mais de uma linha. É difícil de testar e a ordem de carga engana, então quase sempre uma fábrica estática ou inicialização preguiçosa serve melhor.",
            },
            {
                frente: "Como você evitaria um construtor com dez parâmetros?",
                verso: "Agrupando o que anda junto em tipos próprios, o que quase sempre revela um conceito que faltava. Se ainda sobrar muita coisa opcional, um builder deixa a chamada legível e evita trocar dois parâmetros de mesmo tipo sem o compilador notar.",
            },
            {
                frente: "O que synchronized garante, além de exclusão mútua?",
                verso: "Garante visibilidade: o que uma thread escreveu antes de soltar o monitor fica visível para a próxima que o adquire. Sem isso, uma thread poderia ler um valor velho em cache. Exclusão sem visibilidade não resolveria nada em máquina com vários núcleos.",
            },
            {
                frente: "Por que criar uma Thread por tarefa é ruim?",
                verso: "Thread de plataforma custa memória e troca de contexto, então mil tarefas viram mil threads competindo. Um pool limita a concorrência, reaproveita as threads e dá um lugar para tratar fila e rejeição. Threads virtuais mudam essa conta, mas não a ideia de limitar.",
            },
            {
                frente: "Qual a diferença entre StringBuilder e StringBuffer?",
                verso: "Os dois acumulam texto num buffer que cresce. O StringBuffer sincroniza os métodos, o que só faz sentido se a mesma instância for compartilhada entre threads, algo raro. Como quase sempre a construção é local, o StringBuilder é a escolha padrão.",
            },
            {
                frente: "Como você trataria uma exceção que sua camada não sabe resolver?",
                verso: "Deixando subir, sem capturar para logar e relançar em cada nível. Se precisar traduzir para um tipo do domínio, sempre encadeando a causa original. Capturar e engolir é o que transforma erro em comportamento estranho meses depois.",
            },
            {
                frente: "Quando criar uma exceção própria compensa?",
                verso: "Quando quem chama precisa distinguir aquele caso para reagir diferente, como registro não encontrado e regra de negócio violada. Se ninguém vai tratar de forma específica, uma exceção existente com boa mensagem basta. Hierarquia inteira de exceções sem uso é peso morto.",
            },
            {
                frente: "Por que encadear a causa ao relançar uma exceção?",
                verso: "Porque sem a causa a pilha mostra só onde você embrulhou, e não onde quebrou. Passar a original no construtor preserva o rastro inteiro. Perder a causa é o motivo mais comum de log que diz que houve erro e não diz qual.",
            },
            {
                frente: "O que muda ao capturar Exception em vez do tipo específico?",
                verso: "Você passa a capturar também o que não previu, inclusive erro de programação, e trata tudo do mesmo jeito. Isso esconde bug e dificulta distinguir falha de negócio de falha técnica. Captura ampla só faz sentido na borda, para virar resposta de erro.",
            },
            {
                frente: "Como você testaria um método que depende de outra classe?",
                verso: "Injetando a dependência e passando um dublê no teste, seja um mock ou uma implementação simples de mentira. Se a classe cria a dependência com new dentro dela, não há como testar isoladamente, e o teste vira teste de integração sem querer.",
            },
            {
                frente: "Qual a diferença entre teste de unidade e de integração?",
                verso: "O de unidade exercita uma peça isolada, roda em milissegundos e falha apontando o lugar. O de integração exercita as peças juntas, com banco e rede de verdade, e é o que prova que a configuração funciona. Um não substitui o outro, e a proporção importa.",
            },
            {
                frente: "O que a anotação de transação faz num serviço Spring?",
                verso: "Abre a transação antes do método e confirma no fim, ou desfaz quando sobe exceção não checada. O detalhe que pega é que ela funciona por proxy: chamar o método anotado de dentro da mesma classe não passa pelo proxy e não abre transação nenhuma.",
            },
            {
                frente: "Qual a diferença entre um bean singleton e um prototype?",
                verso: "O singleton é criado uma vez e compartilhado pelo contêiner, então não pode guardar estado de requisição. O prototype é criado a cada pedido de injeção. Injetar um prototype dentro de um singleton congela a primeira instância, que é a armadilha clássica.",
            },
            {
                frente: "O que a injeção de dependência resolve num projeto Spring?",
                verso: "Tira da classe a responsabilidade de criar suas dependências, o que permite trocar implementação e passar dublê em teste sem mexer no código. O contêiner monta o grafo e cuida do ciclo de vida. O ganho real é testabilidade, não a anotação.",
            },
            {
                frente: "Por que injetar pelo construtor é preferível a injetar no campo?",
                verso: "Porque o objeto nasce completo e os campos podem ser finais, o que deixa a dependência obrigatória explícita. Também permite instanciar a classe num teste sem subir o contêiner. Injeção no campo esconde dependência e facilita a classe crescer sem ninguém notar.",
            },
            {
                frente: "O que um repositório do Spring Data entrega sem você escrever código?",
                verso: "As operações básicas de gravar, buscar por identificador, listar e paginar, mais consultas derivadas do nome do método. Para o que não cabe nisso, existe a consulta escrita à mão. O risco é o nome do método virar frase enorme que ninguém consegue ler.",
            },
            {
                frente: "O que é um DTO, e por que não devolver a entidade direto?",
                verso: "É um tipo que representa o que aquela fronteira precisa trafegar. Devolver a entidade acopla a resposta ao schema do banco, vaza campo que não deveria sair e dispara carga preguiçosa na serialização. O DTO deixa a mudança de banco invisível para o cliente.",
            },
            {
                frente: "Como você validaria o corpo de uma requisição?",
                verso: "Com as anotações de validação no objeto de entrada e a marcação que pede a checagem no controlador, deixando o framework juntar todos os erros de uma vez. Validação espalhada em if dentro do serviço devolve um erro por vez e cansa quem consome a API.",
            },
            {
                frente: "Como você devolveria um código de status diferente de 200?",
                verso: "Devolvendo uma resposta que carrega o status, ou lançando uma exceção que o manipulador global traduz. O importante é ser consistente: criação devolve 201, erro do cliente devolve 4xx, e falha inesperada devolve 5xx sem detalhe interno no corpo.",
            },
            {
                frente: "Como você deixaria uma configuração fora do código?",
                verso: "Num arquivo de propriedades por ambiente, com o valor podendo ser sobrescrito por variável de ambiente na hora do deploy. O código lê por injeção de configuração tipada. Segredo nunca entra no repositório, nem no arquivo de exemplo.",
            },
            {
                frente: "O que o Spring Boot faz de configuração automática?",
                verso: "Olha o que está no classpath e monta os beans padrão daquilo, como fonte de dados quando existe um driver e servidor web quando existe a dependência web. Isso acelera muito o começo, e cobra depois: quando algo estranho acontece, é preciso saber o que ele decidiu por você.",
            },
            {
                frente: "Por que usar uma fachada de log em vez de System.out?",
                verso: "Porque log tem nível, contexto e destino configuráveis, e a saída padrão não tem nada disso. Em contêiner, System.out ainda vai parar em algum lugar, mas sem nível não dá para reduzir ruído nem elevar detalhe num incidente sem mexer no código.",
            },
            {
                frente: "Como você escolheria o nível de um log?",
                verso: "Erro para o que exige alguém agir, aviso para o que degradou mas seguiu, informação para marco de negócio, e depuração para detalhe de investigação. Se tudo é erro, ninguém olha. O nível é o que separa alerta de ruído às três da manhã.",
            },
            {
                frente: "Como você serializaria um objeto para JSON?",
                verso: "Com uma biblioteca de mapeamento, expondo um tipo pensado para a saída em vez da entidade. Vale definir o que fazer com nulo, o formato de data e o nome dos campos. Deixar a serialização adivinhar é como surge campo interno vazando na resposta.",
            },
            {
                frente: "Qual a diferença entre LocalDate, LocalDateTime e Instant?",
                verso: "LocalDate é data sem hora nem fuso, boa para aniversário e vencimento. LocalDateTime tem data e hora, ainda sem fuso. Instant é um ponto na linha do tempo em UTC, que é o que você guarda quando o evento aconteceu de fato.",
            },
            {
                frente: "Como você calcularia a diferença entre duas datas?",
                verso: "Com Duration para tempo baseado em segundos e Period para diferença em anos, meses e dias de calendário. Subtrair milissegundos na mão erra em horário de verão e em mês de tamanhos diferentes, que é justamente o que a biblioteca de data resolve.",
            },
            {
                frente: "Qual a diferença entre List.of e new ArrayList?",
                verso: "List.of devolve uma lista imutável e recusa nulo, então tentar adicionar estoura UnsupportedOperationException. É ótimo para constante e para retorno que ninguém deve alterar. Quando a lista precisa crescer, ArrayList continua sendo o caminho.",
            },
            {
                frente: "O que você olharia antes de trocar um stream sequencial por paralelo?",
                verso: "Se o trabalho por elemento é pesado o bastante para pagar a divisão, se a fonte divide bem, e se a operação é livre de estado compartilhado. Em coleção pequena ou tarefa de entrada e saída, o paralelo costuma piorar, porque disputa o mesmo pool comum.",
            },
            {
                frente: "Como você mediria o tempo de um trecho de código?",
                verso: "Com nanoTime nas pontas para uma medida grosseira, ciente de que a primeira execução inclui carga de classe e ainda não passou pela compilação otimizada. Para comparar implementações a sério, o caminho é uma ferramenta de microbenchmark, e não um laço com cronômetro.",
            },
            {
                frente: "O que a interface Iterable permite ao seu tipo?",
                verso: "Ser percorrido com for aprimorado, porque o compilador só precisa do método que devolve um iterador. É a forma de expor uma coleção interna sem entregar a lista para quem chama alterar. Também casa com os utilitários que aceitam Iterable.",
            },
            {
                frente: "Como você exporia uma coleção interna sem deixar alterarem seu estado?",
                verso: "Devolvendo uma visão imutável ou uma cópia, e oferecendo métodos para as operações que fazem sentido no domínio. Devolver a lista original permite que qualquer chamador adicione item furando toda regra que a classe protege.",
            },
            {
                frente: "Quando você usaria varargs num método?",
                verso: "Quando a quantidade de argumentos varia e a chamada fica mais natural sem montar lista. Por baixo é um array, então é possível passar zero argumentos, e sobrecarga com varargs confunde a escolha do compilador. Para coleção que já existe, receber Collection é mais claro.",
            },
            {
                frente: "O que muda ao declarar o retorno como interface em vez de classe concreta?",
                verso: "Você fica livre para trocar a implementação depois sem quebrar quem chama. Devolver ArrayList amarra o contrato ao detalhe. O mesmo vale para parâmetro: receber Collection aceita mais entradas do que receber ArrayList.",
            },
            {
                frente: "Como você trataria um método que às vezes não tem resultado?",
                verso: "Devolvendo Optional quando a ausência é normal, ou lançando exceção quando ela é erro. O que não ajuda é devolver nulo sem documentar, porque quem chama descobre pelo NullPointerException em produção. Para coleção, o certo é lista vazia.",
            },
            {
                frente: "Como você mapearia uma requisição HTTP para um método?",
                verso: "Anotando a classe como controlador REST e cada método com o verbo e o caminho, declarando o que vem da rota, da consulta e do corpo. O framework cuida da conversão. Concentrar regra de negócio no controlador é o que depois impede testar sem subir a aplicação.",
            },
            {
                frente: "O que é um proxy, e por que ele explica comportamento estranho no Spring?",
                verso: "É um objeto gerado que embrulha o seu bean para aplicar transação, cache ou segurança antes de delegar. Como a chamada precisa passar por ele, método privado, final ou chamado de dentro da própria classe não recebe esse comportamento, e a anotação parece ignorada.",
            },
        ],
        pleno: [
            {
                frente: "Como você investigaria um vazamento de memória numa aplicação Java?",
                verso: "Confirmando primeiro pelo gráfico de heap depois das coletas completas, que sobe sem voltar. Depois tirando um despejo de memória em dois momentos e comparando o que cresceu. O caminho até a raiz costuma apontar cache sem limite, lista estática ou listener nunca removido.",
            },
            {
                frente: "Que armadilha de ThreadLocal aparece em servidor com pool de threads?",
                verso: "A thread volta para o pool com o valor ainda pendurado, e a próxima requisição herda dado de outro usuário. Além do vazamento, isso vira falha de segurança. A regra é limpar no finally, sempre, e desconfiar de qualquer contexto guardado por thread.",
            },
            {
                frente: "O que volatile garante, e o que ele não garante?",
                verso: "Garante que a escrita fica visível para as outras threads e impede reordenação em torno dela. Não garante atomicidade: um incremento continua sendo ler, somar e escrever, e duas threads ainda se atropelam. Para contador, o caminho é um tipo atômico.",
            },
            {
                frente: "O que a dupla checagem sem volatile tem de errado?",
                verso: "Outra thread pode enxergar a referência já atribuída antes de o construtor terminar, e usar um objeto pela metade. O campo precisa ser volatile para impedir essa reordenação. Na prática, inicialização por classe interna ou por enum evita o assunto inteiro.",
            },
            {
                frente: "Quando você usaria CompletableFuture em vez de simplesmente bloquear?",
                verso: "Quando há chamadas independentes que podem correr juntas, e o ganho é o tempo total virar o da mais lenta em vez da soma. Vale a pena com pool próprio e timeout definido. Encadear tudo em fluxo assíncrono só para parecer moderno cobra caro na depuração.",
            },
            {
                frente: "Por que ConcurrentHashMap não resolve toda corrida de dado?",
                verso: "Porque cada operação é atômica isoladamente, mas a sequência não é. Checar se a chave existe e depois inserir continua tendo uma janela entre as duas. Para isso existem operações compostas como computeIfAbsent e merge, que fazem tudo numa passada.",
            },
            {
                frente: "Como você escolheria entre synchronized e um lock explícito?",
                verso: "Synchronized quando basta exclusão simples num bloco, porque é mais difícil de errar e a JVM otimiza bem. Lock explícito quando você precisa de tentativa com timeout, aquisição interrompível ou condições separadas. O custo dele é lembrar de destravar no finally.",
            },
            {
                frente: "Como você limitaria a concorrência de uma operação cara?",
                verso: "Com um semáforo permitindo N execuções simultâneas, ou com um pool dedicado de tamanho fixo para aquele trabalho. O que não funciona é confiar no pool geral: uma operação pesada sem limite consome todas as threads e derruba o resto do serviço junto.",
            },
            {
                frente: "O que acontece quando o pool de threads enche?",
                verso: "As tarefas vão para a fila, e quando a fila também enche a política de rejeição decide: lançar erro, descartar ou executar na thread de quem chamou. Fila ilimitada parece gentil e é pior, porque troca erro rápido por latência crescente e memória subindo.",
            },
            {
                frente: "O que significa interromper uma thread em Java?",
                verso: "É apenas sinalizar uma marca que o código precisa observar. Métodos bloqueantes lançam InterruptedException, e o certo é encerrar o trabalho ou restaurar a marca. Capturar e ignorar essa exceção é o que faz uma aplicação não conseguir mais desligar.",
            },
            {
                frente: "Como você diagnosticaria um travamento entre threads?",
                verso: "Tirando um despejo de threads no momento do problema e procurando quem está esperando por qual monitor. A JVM ainda aponta ciclos de trava detectados. A correção estrutural é sempre adquirir travas na mesma ordem, ou não precisar de duas.",
            },
            {
                frente: "Como você diagnosticaria pausas longas de coleta de lixo?",
                verso: "Ligando o registro de coleta e olhando frequência, duração e quanto sobra depois de cada ciclo. Pausa longa costuma vir de heap pequeno demais, de promoção excessiva para a geração velha ou de objeto grande criado em rajada. Trocar de coletor é a última decisão, não a primeira.",
            },
            {
                frente: "O que muda ao rodar Java num contêiner com limite de memória?",
                verso: "A JVM moderna enxerga o limite do contêiner e dimensiona o heap por porcentagem dele. O ponto de atenção é que heap não é tudo: pilha por thread, metaespaço e buffers fora do heap somam. Se o total passar do limite, o processo é morto sem exceção nenhuma.",
            },
            {
                frente: "Como você reduziria o tempo de subida de um serviço Spring?",
                verso: "Medindo o que demora, porque costuma ser varredura de pacote grande, cliente que se conecta na subida e bean criado sem necessidade. Inicialização preguiçosa ajuda, e compilação nativa resolve de vez em troca de build mais complicado e reflexão declarada à mão.",
            },
            {
                frente: "O que causa o problema de N+1 consultas com JPA, e como você o encontra?",
                verso: "Carregar uma lista e, ao acessar uma associação preguiçosa de cada item, disparar uma consulta por linha. Aparece ligando o registro de SQL e vendo a mesma consulta repetida com parâmetros diferentes. Resolve com junção explícita, entity graph ou consulta em lote.",
            },
            {
                frente: "Como você trataria LazyInitializationException sem carregar tudo ansiosamente?",
                verso: "Buscando na consulta exatamente o que a tela precisa, com junção ou projeção direta para um DTO. O erro é sintoma de dado sendo acessado fora da transação, então a correção é decidir a fronteira, e não abrir a sessão até a camada de apresentação.",
            },
            {
                frente: "O que a propagação de transação muda no comportamento de um método?",
                verso: "Define se ele entra na transação de quem chamou, abre uma nova ou roda sem nenhuma. Requires new é o que permite gravar um registro de auditoria mesmo com a operação principal voltando atrás. O engano comum é anotar um método chamado de dentro da mesma classe, onde o proxy não age.",
            },
            {
                frente: "Como você escolheria o nível de isolamento de uma transação?",
                verso: "Pelo tipo de anomalia que aquele fluxo não pode aceitar, e não pelo nível mais alto disponível. Read committed serve para a maioria. Subir custa concorrência e bloqueio, então para casos pontuais costuma ser melhor travar a linha na consulta do que endurecer tudo.",
            },
            {
                frente: "Como você trataria duas requisições tentando alterar o mesmo registro?",
                verso: "Com trava otimista por versão, que falha na gravação e permite ao chamador refazer com o dado atual. Trava pessimista só quando o conflito é frequente e refazer é caro, ciente de que ela segura a linha e enfileira todo mundo atrás.",
            },
            {
                frente: "O que você olharia num travamento de banco durante um deploy?",
                verso: "Quais transações estão abertas e há quanto tempo, e qual comando está esperando. Migração que altera tabela grande pede trava e fica atrás de qualquer transação longa, segurando o resto. Por isso migração pesada roda separada do deploy, e com timeout de trava.",
            },
            {
                frente: "Como você dimensionaria o pool de conexões de uma aplicação?",
                verso: "Pelo que o banco aguenta e pelo tempo médio de consulta, e não pelo número de usuários. Pool grande demais empurra a fila para dentro do banco e piora a latência de todo mundo. Vale medir com carga real e observar tempo de espera por conexão.",
            },
            {
                frente: "Como você faria paginação eficiente numa tabela muito grande?",
                verso: "Paginando por chave, com filtro do tipo maior que o último identificador visto, em vez de deslocamento. Deslocamento alto obriga o banco a percorrer e descartar tudo que veio antes. A troca é perder o salto direto para uma página qualquer.",
            },
            {
                frente: "Como você atacaria uma consulta lenta?",
                verso: "Olhando o plano de execução antes de mexer no código, para saber se é varredura completa, junção ruim ou falta de índice. Depois medindo de novo. Adicionar índice sem olhar o plano costuma resolver por acaso, e ainda cobra em toda escrita.",
            },
            {
                frente: "Por que um índice existente pode não ser usado?",
                verso: "Porque a consulta aplica função sobre a coluna, converte tipo, usa curinga no começo do texto, ou porque o otimizador julgou que varrer é mais barato pelo volume esperado. Estatística desatualizada também engana o planejador.",
            },
            {
                frente: "Como você processaria um arquivo grande demais para caber na memória?",
                verso: "Lendo em fluxo, processando linha a linha e gravando em lotes, sem materializar a coleção inteira. O erro clássico é usar um método que lê tudo de uma vez e só descobrir na produção. Gravar em lote também evita ida e volta por registro.",
            },
            {
                frente: "Como você faria uma carga em lote sem estourar memória nem transação?",
                verso: "Em blocos de tamanho fixo, confirmando por bloco, limpando o contexto de persistência a cada bloco e desligando o que gera consulta por linha. Uma transação única de um milhão de registros trava tabela, incha o log do banco e não permite retomar do meio.",
            },
            {
                frente: "Como você garantiria que a mesma requisição não seja processada duas vezes?",
                verso: "Com chave de idempotência enviada pelo cliente e uma restrição de unicidade no banco, de modo que a segunda tentativa devolva o resultado da primeira. Repetição é normal em rede, e confiar que o cliente não repete é o que gera cobrança dobrada.",
            },
            {
                frente: "Como você publicaria um evento e gravaria no banco sem inconsistência?",
                verso: "Gravando o evento numa tabela dentro da mesma transação do dado, e publicando depois a partir dela. Escrever no banco e publicar na fila em passos separados sempre tem a janela em que um deu certo e o outro não, e reconciliar isso depois é caro.",
            },
            {
                frente: "Como você trataria uma mensagem que falha repetidamente numa fila?",
                verso: "Com um número limitado de tentativas, espera crescente e desvio para uma fila de mensagens mortas, com contexto suficiente para reprocessar depois. Sem esse desvio, uma mensagem envenenada trava o consumo e para o processamento de todo o resto.",
            },
            {
                frente: "Como você impediria uma tarefa agendada de rodar em duas instâncias?",
                verso: "Com trava compartilhada, seja uma linha no banco com dono e validade, seja um agendador que já coordena isso. Confiar em uma instância única é uma configuração esperando para quebrar no primeiro escalonamento horizontal.",
            },
            {
                frente: "Quando as threads virtuais mudam o desenho de um serviço?",
                verso: "Quando o gargalo é espera de entrada e saída, e não CPU. Elas permitem manter o código bloqueante e ainda assim ter milhares de tarefas em voo. O cuidado é que trecho bloqueante dentro de bloco sincronizado prende a thread carregadora, e que o limite passa a ser o pool de conexões.",
            },
            {
                frente: "Como você lidaria com chamadas a outro serviço que às vezes travam?",
                verso: "Timeout em toda chamada, sempre, porque sem ele a thread fica presa até o sistema operacional desistir. Depois um número pequeno de tentativas com espera crescente, só para erro transitório, e um disjuntor para parar de bater num serviço que já caiu.",
            },
            {
                frente: "Como você definiria o valor de um timeout?",
                verso: "A partir da latência observada do dependente, com folga sobre o percentil alto, e sempre menor que o timeout de quem chama você. Timeout maior que o do chamador é inútil: ele já desistiu, e você segue segurando thread e conexão por nada.",
            },
            {
                frente: "Quando repetir uma chamada que falhou é perigoso?",
                verso: "Quando a operação não é idempotente, porque a primeira pode ter chegado e só a resposta se perdeu. Repetir cobrança nesse caso duplica. Também é perigoso repetir em massa durante uma queda, porque a repetição de todos derruba de vez quem estava se recuperando.",
            },
            {
                frente: "Como você evitaria efeito cascata quando um dependente fica lento?",
                verso: "Isolando o acesso a ele num pool próprio, para a lentidão não consumir as threads do serviço inteiro. Somado a timeout curto, disjuntor e resposta degradada. Sem isolamento, um dependente lento vira indisponibilidade total, o que é pior do que a falha original.",
            },
            {
                frente: "Como você decidiria entre otimizar a consulta e colocar cache?",
                verso: "Otimizando primeiro, porque cache sobre consulta ruim esconde o problema e cobra na primeira invalidação. Cache entra quando o dado é lido muito mais do que escrito e tolera estar velho por um tempo definido. Antes disso é preciso saber quem invalida.",
            },
            {
                frente: "Como você trataria a expiração simultânea de muitas chaves de cache?",
                verso: "Espalhando o vencimento com uma variação aleatória e deixando só uma requisição recalcular enquanto as outras servem o valor antigo. Sem isso, todas as chaves vencem juntas e a carga cai inteira no banco no mesmo segundo.",
            },
            {
                frente: "O que muda ao sair de um cache local para um distribuído?",
                verso: "Você troca coerência entre instâncias por uma chamada de rede a cada acesso, com serialização e novo ponto de falha. Cache local é mais rápido e diverge entre instâncias. A escolha depende de o dado tolerar divergência de segundos ou não.",
            },
            {
                frente: "Como você exporia métricas úteis de uma aplicação Java?",
                verso: "Publicando contadores e histogramas por rota e por dependência, mais os do runtime, como heap, threads e coleta de lixo. Histograma permite ver percentil; média esconde a cauda. Métrica com rótulo de alta cardinalidade, como identificador de usuário, derruba o coletor.",
            },
            {
                frente: "Como você ligaria os logs de uma requisição que passa por vários serviços?",
                verso: "Propagando um identificador de rastreamento pelo cabeçalho e colocando ele no contexto de log de cada serviço. Com isso, uma busca reúne a requisição inteira. Sem isso, correlacionar por horário e mensagem é adivinhação em qualquer volume real.",
            },
            {
                frente: "O que você mudaria numa API para o cliente tratar erro sem adivinhar?",
                verso: "Código de status coerente, um corpo com formato fixo trazendo um identificador estável de erro, e mensagem separada do que é para o usuário final. Um manipulador global evita cada controlador inventar o seu. E nunca vazar pilha de execução na resposta.",
            },
            {
                frente: "Como você faria uma verificação de saúde que diz a verdade?",
                verso: "Separando a de vivacidade, que só diz que o processo não travou, da de prontidão, que checa dependências essenciais. Prontidão que consulta tudo a cada segundo vira carga e faz o serviço sair de rotação por soluço do dependente.",
            },
            {
                frente: "Como você faria a aplicação desligar sem derrubar requisição em andamento?",
                verso: "Tratando o sinal de término: parar de aceitar novas requisições, sair da rotação do balanceador, esperar as em andamento até um limite e só então fechar pools e conexões. Sem isso, cada deploy devolve erro para quem estava no meio de uma chamada.",
            },
            {
                frente: "Como você guardaria a senha dos usuários?",
                verso: "Com uma função de derivação lenta e com sal, feita para senha, como bcrypt ou Argon2, nunca com hash rápido de propósito geral. O custo é parâmetro, e precisa ser revisto com o tempo. Guardar em texto ou cifrado de forma reversível não é opção.",
            },
            {
                frente: "Como você evitaria injeção de SQL num projeto que usa JPA?",
                verso: "Usando parâmetros em toda consulta, inclusive nas escritas à mão, e nunca concatenando valor vindo do usuário. Ordenação dinâmica é o ponto fraco, porque nome de coluna não entra como parâmetro: ali a defesa é lista fixa de valores aceitos.",
            },
            {
                frente: "Como você evitaria vazar dado sensível nos logs?",
                verso: "Não logando objeto inteiro, controlando o toString das entidades, e mascarando campo sensível na serialização. Log é copiado para vários lugares e fica muito tempo, então o que vaza ali vaza para sempre. Vale ter um teste que impeça a regressão.",
            },
            {
                frente: "Como você validaria um token entre serviços?",
                verso: "Conferindo assinatura com a chave pública do emissor, mais expiração, emissor e público esperado, e a permissão exigida pela rota. Aceitar token sem checar o público é o que permite reaproveitar um token válido de outro serviço.",
            },
            {
                frente: "Como você protegeria uma API de abuso?",
                verso: "Limite por cliente e por rota, aplicado antes do trabalho caro, com resposta clara dizendo quando tentar de novo. Limite só na borda deixa o serviço interno exposto. E o limite precisa ser por identidade autenticada, senão troca de IP contorna.",
            },
            {
                frente: "Como você trataria upload de arquivo grande numa API?",
                verso: "Recebendo em fluxo direto para o armazenamento, com limite de tamanho e tipo checados antes, sem carregar tudo na memória. Melhor ainda é o cliente enviar direto para o armazenamento com uma URL assinada, e a API só registrar o resultado.",
            },
            {
                frente: "Como você testaria integração com banco sem depender da máquina de quem roda?",
                verso: "Subindo o banco real em contêiner efêmero durante o teste, com o mesmo motor e versão da produção. Banco em memória mente sobre dialeto e restrição, e passa teste que quebra em produção. Cada caso limpa o que criou, ou o banco sobe por classe.",
            },
            {
                frente: "Como você testaria código que depende da data de hoje?",
                verso: "Injetando um relógio em vez de chamar o agora direto, e fixando esse relógio no teste. Sem isso o teste passa hoje e falha na virada do mês, e a única forma de reproduzir é mexer no relógio da máquina.",
            },
            {
                frente: "Como você trataria um teste que falha de vez em quando?",
                verso: "Tratando como defeito, não como azar. As causas comuns são dependência de ordem, estado compartilhado entre casos, espera por tempo fixo e concorrência real. Repetir até passar esconde a causa e ensina o time a ignorar o vermelho.",
            },
            {
                frente: "Como você testaria um comportamento concorrente?",
                verso: "Forçando a sobreposição com barreira ou latch, em vez de esperar por sorte, e rodando o cenário muitas vezes. Mesmo assim o teste prova pouco, então a garantia real vem do desenho: estado imutável, tipos atômicos e seções críticas pequenas.",
            },
            {
                frente: "O que você olharia num perfilamento antes de otimizar código?",
                verso: "Onde o tempo realmente é gasto, com amostragem sob carga parecida com a de produção. Costuma ser espera de rede ou banco, e não o laço que parecia caro. Otimizar sem medir troca legibilidade por nada, e ainda esconde o gargalo verdadeiro.",
            },
            {
                frente: "Como você trataria datas e fusos numa API que atende vários países?",
                verso: "Guardando instante em UTC e convertendo só na borda, com o fuso vindo do contexto do usuário. Data sem hora é outro tipo, e misturar os dois é o que gera erro de um dia. Serializar em formato padrão evita cada cliente interpretar do seu jeito.",
            },
            {
                frente: "Como você versionaria o schema do banco junto com o código?",
                verso: "Com scripts de migração versionados no mesmo repositório, aplicados na subida ou no deploy, e nunca editando um script já aplicado. Toda mudança precisa ser compatível com a versão anterior da aplicação, senão o deploy vira janela de indisponibilidade.",
            },
            {
                frente: "Como você renomearia uma coluna usada em produção?",
                verso: "Em passos: criar a nova, passar a escrever nas duas, copiar o histórico, mudar a leitura e só depois remover a antiga. Cada passo é reversível sozinho. Renomear direto exige que código e banco troquem no mesmo instante, e isso não existe com várias instâncias.",
            },
            {
                frente: "Como você configuraria a mesma aplicação para vários ambientes?",
                verso: "Configuração em camadas, com o específico do ambiente sobrescrevendo o comum, e validação na subida para falhar cedo em vez de na primeira requisição. Segredo fora do repositório, injetado no deploy. Perfil serve para ligar comportamento, não para esconder valor.",
            },
            {
                frente: "O que faz um log ser útil durante um incidente?",
                verso: "Ter identificador de correlação atravessando as chamadas, contexto estruturado em vez de frase concatenada, e nível coerente para o volume não esconder o que importa. Log sem o dado que identifica a requisição obriga a adivinhar qual linha é do caso relatado.",
            },
            {
                frente: "Como você geraria identificadores em várias instâncias sem colisão?",
                verso: "Com UUID quando não importa a ordem, ou com um identificador ordenável no tempo quando o banco sofre com índice aleatório. Sequência no banco funciona e cria um ponto de coordenação. A escolha pesa colisão contra fragmentação de índice.",
            },
            {
                frente: "Como você lidaria com um serviço que consome mais CPU depois de um deploy?",
                verso: "Comparando com a versão anterior sob a mesma carga e tirando amostras de CPU em produção. Costuma ser serialização nova, log em nível alto, expressão regular cara em caminho quente ou coleta subindo por mais alocação. O perfil aponta em minutos o que a leitura do diff não acha.",
            },
            {
                frente: "Como você trataria a serialização de um campo que mudou de tipo?",
                verso: "Aceitando os dois formatos na leitura por um tempo e escrevendo só o novo, com versão no contrato quando faz sentido. Trocar o tipo de uma vez quebra consumidor antigo e mensagem já na fila, que é onde o problema costuma aparecer.",
            },
            {
                frente: "Como você lidaria com um relatório que derruba a aplicação quando roda?",
                verso: "Tirando ele do caminho das requisições: fila própria, réplica de leitura e resultado materializado. Relatório pesado no mesmo pool e no mesmo banco disputa conexão e cache com o fluxo normal, e o sintoma aparece como lentidão geral sem causa aparente.",
            },
            {
                frente: "Como você reduziria alocação num trecho crítico?",
                verso: "Evitando criar objeto por elemento em laço quente, reaproveitando buffer, usando tipos primitivos onde a coleção obriga a embrulhar, e cortando concatenação em log que nem será impresso. Só depois de medir: alocação barata é justamente o que a JVM faz bem.",
            },
            {
                frente: "Quando faz sentido cachear dentro da própria aplicação?",
                verso: "Quando o dado é pequeno, muito lido e tolera atraso, como tabela de domínio e configuração. Com limite de tamanho e vencimento, sempre. Cache sem limite é vazamento com outro nome, e é a causa mais comum de heap crescendo devagar até estourar.",
            },
            {
                frente: "Como você identificaria qual endpoint está segurando o pool de conexões?",
                verso: "Instrumentando tempo de espera por conexão e tempo de transação por rota, e olhando quem abre transação longa. Costuma ser um método que faz chamada externa dentro da transação. A correção é fechar a transação antes de sair para a rede.",
            },
            {
                frente: "Como você trataria uma dependência que só falha em produção?",
                verso: "Reproduzindo o ambiente, não o código: versão, configuração, latência e volume. Costuma ser timeout diferente, certificado, DNS ou dado real que o teste não tem. Log com contexto e um cenário reproduzível valem mais que tentativas às cegas em produção.",
            },
            {
                frente: "Como você montaria uma resposta que depende de três serviços diferentes?",
                verso: "Disparando as chamadas independentes em paralelo, com timeout por chamada e um orçamento total para a requisição. Depois decidindo o que é essencial e o que pode faltar, devolvendo resposta parcial em vez de erro. Encadear as três em sequência soma as latências sem motivo.",
            },
            {
                frente: "O que você mediria para saber se adianta subir mais instâncias?",
                verso: "Onde está a saturação. Se o gargalo é CPU da aplicação, mais instâncias ajudam. Se é o banco, a fila de conexões ou uma trava compartilhada, elas só aumentam a disputa e pioram a latência. Escalar sem medir troca um problema por uma conta maior.",
            },
            {
                frente: "Como você decidiria entre processar de forma síncrona ou por fila?",
                verso: "Pela pergunta: o usuário precisa do resultado agora? Se não precisa, fila tira latência da requisição e absorve pico. O custo é passar a lidar com repetição, ordem e falha assíncrona, e a explicar para o usuário que o trabalho está em andamento.",
            },
        ],
        senior: [
            {
                frente: "Como você conduziria a atualização de Java 8 para uma versão LTS recente?",
                verso: "Subindo primeiro o compilador com o código como está, resolvendo o que quebrou por remoção de módulo e reflexão fechada. Depois as dependências, que costumam ser o real bloqueio. Adotar recurso novo vem por último, e nunca no mesmo passo da migração.",
            },
            {
                frente: "Como você avaliaria trocar o Spring por algo mais enxuto?",
                verso: "Pelo que dói hoje: tempo de subida, consumo de memória por instância ou dificuldade de entender o que o contêiner faz. Se a dor é custo de contêiner, compilação nativa ou framework leve ajudam. Se é só gosto, a conta inclui reescrever integração que já funciona.",
            },
            {
                frente: "Quando faz sentido adotar outra linguagem da JVM no projeto?",
                verso: "Quando ela resolve uma dor concreta e o time inteiro sustenta, não só quem propôs. Conviver é possível, mas cada linguagem a mais é ferramental, revisão e contratação a mais. A pergunta honesta é quem mantém isso daqui a dois anos.",
            },
            {
                frente: "Como você revisaria código concorrente de outra pessoa?",
                verso: "Procurando estado mutável compartilhado sem proteção, trava adquirida em ordens diferentes, coleção comum onde deveria haver concorrente, e tarefa submetida sem timeout nem tratamento de falha. Depois perguntando qual invariante o autor acha que está protegendo.",
            },
            {
                frente: "Como você decidiria entre programação reativa e threads virtuais?",
                verso: "Pelo custo de manutenção. As duas resolvem espera de entrada e saída, mas a reativa muda o modelo mental do time inteiro e complica pilha de erro e depuração. Threads virtuais entregam boa parte do ganho mantendo o código direto, e hoje são o padrão razoável.",
            },
            {
                frente: "Como você definiria as fronteiras entre camadas num projeto Java grande?",
                verso: "Pelo sentido da dependência: o domínio não conhece framework nem banco, e a borda só orquestra. Se o domínio precisa de algo de fora, ele declara a interface e a infraestrutura implementa. Entidade de persistência atravessando até o controlador é o sinal de que a fronteira caiu.",
            },
            {
                frente: "Como você avaliaria adotar arquitetura hexagonal num projeto existente?",
                verso: "Pelo problema que ela resolve ali: trocar de fornecedor, testar domínio sem infraestrutura, ou isolar regra que muda muito. Sem essa dor, ela entrega três arquivos por caso de uso e o time paga sem receber. Vale aplicar primeiro no módulo que mais sofre.",
            },
            {
                frente: "Quando você aceitaria abrir mão da pureza arquitetural?",
                verso: "Quando o custo da abstração é maior que o risco que ela evita, como num serviço pequeno e estável, ou num prazo em que o certo é entregar e marcar a dívida. O que não pode é a exceção virar padrão sem ninguém registrar por que ela existiu.",
            },
            {
                frente: "Como você lidaria com um Hibernate que se espalhou por todo o domínio?",
                verso: "Sem reescrita grande. Isolando primeiro o que dói, tirando consulta do domínio para um repositório com contrato próprio, e devolvendo projeção em vez de entidade nas leituras. Depois medindo se o resto compensa, porque puxar tudo de uma vez rende meses sem comportamento novo.",
            },
            {
                frente: "Como você mediria a saúde de um serviço Java em produção?",
                verso: "Latência de cauda por rota e não média, taxa de erro, saturação de pool de threads e de conexões, tempo em coleta de lixo e uso de heap depois das coletas. Somado a um teste que exercite o caminho real, porque endpoint que só devolve OK não prova nada.",
            },
            {
                frente: "Como você decidiria o que vira alerta e o que só fica no painel?",
                verso: "Alerta é o que exige alguém acordar e agir agora, ligado a sintoma sentido pelo usuário, como erro e latência acima do acordado. Causa provável fica no painel para a investigação. Alerta que ninguém age treina o time a ignorar, e o próximo é real.",
            },
            {
                frente: "Como você definiria o alvo de disponibilidade de um serviço?",
                verso: "A partir do que o negócio perde com indisponibilidade, e não do número mais bonito. Cada nove a mais multiplica custo e complexidade, e exige redundância que o time precisa saber operar. Alvo definido também dá margem de erro para arriscar entregas.",
            },
            {
                frente: "Como você conduziria um incidente em produção?",
                verso: "Primeiro restaurar o serviço, depois entender: reverter, desligar a funcionalidade nova ou desviar carga vem antes de achar a causa raiz. Uma pessoa coordenando e comunicando, e registro do que foi feito. Investigar com o sistema fora do ar é como se perde a madrugada.",
            },
            {
                frente: "Como você conduziria a análise depois de um incidente?",
                verso: "Sem procurar culpado, porque isso só ensina o time a não relatar. Linha do tempo, o que faltou detectar, o que atrasou a recuperação, e um punhado de ações com dono e prazo. Documento sem ação vira ritual, e o mesmo incidente volta em três meses.",
            },
            {
                frente: "Como você lidaria com uma suíte de testes que passou de trinta minutos?",
                verso: "Medindo antes: quase sempre uma minoria dos testes domina o tempo, e são os que sobem contexto ou banco por caso. Separar unidade de integração devolve o ciclo curto. Paralelizar ajuda depois, e só funciona se os testes não compartilharem estado.",
            },
            {
                frente: "Como você desenharia a estratégia de testes de um sistema?",
                verso: "Muitos testes rápidos sobre a regra, um conjunto médio de integração cobrindo configuração e banco, e poucos de ponta a ponta nos fluxos que geram receita. O critério é confiança por minuto de execução, não porcentagem de linhas cobertas.",
            },
            {
                frente: "Como você lidaria com um serviço com cobertura alta e bugs em produção?",
                verso: "Olhando o que os testes exercitam: cobertura mede linha executada, não comportamento verificado. Costuma faltar caso de borda, integração real e asserção de verdade. Também vale ver se os bugs vêm de configuração e dado, que teste unitário nunca pega.",
            },
            {
                frente: "Como você lidaria com um time que não escreve testes?",
                verso: "Entendendo o motivo antes de cobrar: código difícil de testar, prazo, ou nunca terem visto teste que ajuda. Começar pelo bug recém corrigido, com um teste que falha antes, mostra valor rápido. Meta de cobertura imposta produz teste sem asserção.",
            },
            {
                frente: "Como você padronizaria o tratamento de erro entre times?",
                verso: "Definindo o formato da resposta, um catálogo de identificadores estáveis e quem traduz exceção para resposta. Depois entregando isso como biblioteca pequena, não como documento. Padrão que exige disciplina em cada controlador não sobrevive ao primeiro prazo apertado.",
            },
            {
                frente: "Como você padronizaria sem matar a autonomia dos times?",
                verso: "Padronizando o que atravessa fronteira, como contrato, log, métrica e segurança, e deixando o resto livre. Entregar como biblioteca e modelo pronto, que é mais fácil seguir do que ignorar. Padrão só no documento vira discussão de revisão toda semana.",
            },
            {
                frente: "Como você versionaria uma biblioteca interna usada por vários times?",
                verso: "Versão semântica levada a sério, acrescentando em vez de mudar assinatura, e marcando o que sai como obsoleto por pelo menos uma versão. Mudança maior precisa de prazo e caminho de migração escrito, senão os times travam na versão antiga e você mantém duas.",
            },
            {
                frente: "Como você trataria a mesma biblioteca reescrita por três times?",
                verso: "Escolhendo uma para sobreviver com base em quem a mantém e quem já depende dela, e migrando as outras com prazo. Antes disso vale perguntar por que duplicaram: costuma ser dificuldade de contribuir na primeira, e isso volta a acontecer se não mudar.",
            },
            {
                frente: "Como você decidiria dividir um serviço Java em dois?",
                verso: "Por motivo organizacional ou de escala independente, e não por estética. Se a fronteira não está clara entre pacotes do mesmo projeto, ela não vai ficar clara atravessando a rede: você só ganha latência, falha parcial e deploy que precisa ser coordenado.",
            },
            {
                frente: "Como você conduziria a quebra de um monólito Java?",
                verso: "Extraindo primeiro o que tem fronteira clara e escala diferente, com o monólito chamando o novo serviço, e mantendo a capacidade de voltar atrás. Dado por último, porque é a parte cara. Quebrar tudo de uma vez é como se troca um problema conhecido por vários novos.",
            },
            {
                frente: "Como você trataria dois serviços que compartilham o mesmo banco?",
                verso: "Tratando como acoplamento sério, porque um deles migra o schema e quebra o outro. O caminho é dar dono à tabela e expor o resto por API ou evento. Enquanto isso não acontece, ao menos migração coordenada e nenhuma escrita cruzada.",
            },
            {
                frente: "Como você garantiria compatibilidade de mensagens entre versões?",
                verso: "Só acrescentando campo opcional, nunca mudando significado, e mantendo o consumidor tolerante ao que não conhece. Mudança incompatível pede tópico ou versão nova, com os dois rodando por um tempo. Mensagem já na fila é a que quebra na virada.",
            },
            {
                frente: "Como você planejaria a evolução de uma API pública?",
                verso: "Com política de compatibilidade escrita, prazo de descontinuação e aviso antes, mais métrica de uso por versão para saber quem ainda depende do quê. Sem esse número, toda remoção vira aposta, e a decisão acaba sendo adiada para sempre.",
            },
            {
                frente: "Como você lidaria com clientes que não atualizam a versão da sua API?",
                verso: "Medindo quem são e quanto representam, dando prazo com aviso claro e ajuda para migrar. Se forem poucos e importantes, uma camada de compatibilidade paga o tempo. O que não funciona é manter tudo para sempre, porque o custo aparece em cada mudança futura.",
            },
            {
                frente: "Como você definiria o contrato entre dois times antes de existir código?",
                verso: "Escrevendo o contrato primeiro e concordando nele, com exemplo de requisição e resposta, incluindo erro. Depois cada lado desenvolve contra um dublê. Teste de contrato mantém isso honesto. Combinar por conversa e integrar no fim é o que estoura prazo.",
            },
            {
                frente: "Como você faria revisão de código sem virar gargalo do time?",
                verso: "Limitando o tamanho do que se pede para revisar, acordando prazo curto para responder, e separando o que bloqueia do que é sugestão. Automatizar estilo e checagem óbvia libera a revisão para o que importa: desenho, risco e caso de borda.",
            },
            {
                frente: "Como você trataria a diferença de experiência do time numa revisão?",
                verso: "Explicando o porquê e não só o quê, apontando o que bloqueia com clareza e deixando o resto como sugestão. Para quem está começando, revisão em par resolve em minutos o que trinta comentários não resolvem. Revisão também é onde o padrão da casa se ensina.",
            },
            {
                frente: "Como você garantiria que o conhecimento não fique com uma pessoa só?",
                verso: "Rodando quem faz o quê, revisando em par o que é crítico, e escrevendo o que só existe na cabeça de alguém. Documento curto sobre decisão e operação vale mais que manual grande. O teste é simples: essa pessoa consegue tirar férias?",
            },
            {
                frente: "Como você faria a integração de alguém novo num projeto Java grande?",
                verso: "Ambiente subindo em um comando no primeiro dia, uma tarefa pequena de verdade na primeira semana, e um mapa curto de como o sistema se divide. Aprender lendo o código inteiro não funciona, e mês de leitura sem entregar desanima antes de virar produtivo.",
            },
            {
                frente: "Como você ensinaria streams a um time que só escreveu laços?",
                verso: "Começando pelos casos onde ele ganha claramente, como filtrar, mapear e agrupar, e deixando claro que laço com efeito colateral continua legítimo. Mostrando também a pilha de erro de um stream quebrado, porque é o custo real que ninguém conta antes.",
            },
            {
                frente: "Como você trataria dependências desatualizadas num projeto antigo?",
                verso: "Automatizando a proposta de atualização e tratando como fluxo contínuo, não como mutirão anual. Priorizando por exposição e vulnerabilidade conhecida. Antes disso é preciso ter teste suficiente para confiar no verde, senão ninguém aprova a subida.",
            },
            {
                frente: "Como você avaliaria a segurança de uma dependência nova?",
                verso: "Olhando manutenção ativa, quantas dependências ela arrasta, histórico de vulnerabilidade e o que ela realmente precisa acessar. Biblioteca de duzentas linhas que puxa quinze pacotes custa mais do que escrever aquilo. E precisa haver quem atualize depois.",
            },
            {
                frente: "Como você conduziria a resposta a uma vulnerabilidade conhecida numa dependência?",
                verso: "Confirmando se o caminho vulnerável é usado, o que muda a urgência, e verificando exposição real. Depois corrigindo pela versão, ou mitigando na borda enquanto a correção não vem. E registrando, porque auditoria e cliente vão perguntar.",
            },
            {
                frente: "Como você agiria diante de um segredo vazado no repositório?",
                verso: "Revogando e trocando a credencial primeiro, porque o histórico já vazou e apagar commit não resolve. Depois checando uso indevido nos registros de acesso e colocando varredura automática para não repetir. Reescrever histórico é o último passo, e o menos urgente.",
            },
            {
                frente: "Como você decidiria adotar um framework novo no meio de um projeto?",
                verso: "Perguntando qual problema medido ele resolve, quem no time sustenta em uma madrugada de incidente, e como se volta atrás. Prova de conceito num fluxo real, com prazo. Adotar por bom marketing custa reescrita e uma base com dois jeitos de fazer a mesma coisa.",
            },
            {
                frente: "Como você avaliaria uma proposta de reescrever o sistema do zero?",
                verso: "Perguntando o que exatamente não dá para consertar de forma incremental, e quem paga o período em que dois sistemas existem. Reescrita perde regra de negócio que ninguém documentou e só aparece em produção. Reescrever por módulo costuma entregar o mesmo com menos risco.",
            },
            {
                frente: "Como você escolheria entre construir e contratar uma solução pronta?",
                verso: "Se é diferencial do produto, construir; se é infraestrutura que todo mundo tem, comprar costuma sair mais barato que manter. A conta precisa incluir operação, plantão e evolução, que é a parte esquecida quando se compara só com o tempo de escrever.",
            },
            {
                frente: "Como você priorizaria dívida técnica frente a entregas de produto?",
                verso: "Traduzindo dívida em risco e custo com números: tempo perdido por entrega, incidentes recorrentes, área que ninguém mexe sem medo. Assim ela entra na mesma fila e não numa disputa de gosto. Reservar uma fatia fixa da capacidade evita a negociação semanal.",
            },
            {
                frente: "Que dívida técnica você atacaria primeiro numa base Java legada?",
                verso: "A que impede mudar com segurança: ausência de teste no fluxo mais alterado. Com rede de segurança, o resto vira refatoração barata. Começar pela arquitetura bonita sem teste é como trocar a fundação com a casa cheia de gente dentro.",
            },
            {
                frente: "Como você documentaria uma decisão de arquitetura?",
                verso: "Um registro curto por decisão: contexto, opções, escolha e consequências, datado e versionado junto do código. O valor está em explicar por que não escolheram o outro caminho. Sem isso, seis meses depois alguém desfaz a decisão sem saber o que ela evitava.",
            },
            {
                frente: "Como você lidaria com uma decisão técnica que você discorda, mas que foi tomada?",
                verso: "Registrando a discordância com argumento e critério de revisão, e depois apoiando a execução de verdade. Sabotagem passiva custa mais que a decisão errada. Combinar o que faria o time reavaliar transforma opinião em experimento com data.",
            },
            {
                frente: "Como você lidaria com pressão para pular teste por causa de prazo?",
                verso: "Mostrando o custo em vez de discutir princípio: o que acontece se isso quebrar, quanto tempo leva para descobrir e corrigir. Depois oferecendo o corte mínimo, cobrindo só o caminho crítico. Dívida assumida com prazo é aceitável; dívida escondida não.",
            },
            {
                frente: "Como você trataria um requisito de desempenho vago como precisa ser rápido?",
                verso: "Transformando em número antes de codificar: qual operação, em qual percentil, com quanta carga e por quanto tempo. Sem isso não existe pronto nem otimização defensável. E o número costuma vir de comparação com o que o usuário já sente hoje.",
            },
            {
                frente: "Como você planejaria capacidade para um pico previsto de tráfego?",
                verso: "Medindo o que uma instância aguenta hoje, projetando o pico com folga e testando com carga real antes, não no dia. O gargalo raramente é a aplicação: costuma ser banco, conexão e serviço externo. E é preciso ter plano de degradação para o pior caso.",
            },
            {
                frente: "Como você investigaria latência alta só na cauda das requisições?",
                verso: "Olhando o percentil e não a média, e correlacionando com coleta de lixo, espera por conexão e chamada externa lenta. Cauda costuma ser fila em algum ponto saturado. Rastreamento distribuído mostra onde o tempo fica, o que log solto raramente revela.",
            },
            {
                frente: "Como você garantiria que a mesma versão gera o mesmo artefato?",
                verso: "Fixando versões em vez de faixas, travando o build com um arquivo de dependências resolvidas, e construindo em imagem controlada com JDK definido. Sem isso, o build de terça e o de quinta produzem artefatos diferentes, e depurar produção vira adivinhação.",
            },
            {
                frente: "Como você trataria o tempo de build crescendo sem parar?",
                verso: "Medindo por etapa antes de comprar máquina maior. Costuma ser teste de integração no caminho de todo mundo, cache mal aproveitado e módulo que recompila tudo. Build de vinte minutos muda o comportamento do time: as pessoas passam a agrupar mudanças e a arriscar mais.",
            },
            {
                frente: "Como você organizaria o código de vários serviços de um mesmo time?",
                verso: "Repositório único quando eles mudam juntos e o time é o mesmo, porque mudança atravessada vira um commit. Separados quando os ciclos e os donos são diferentes. O critério é onde a mudança dói, e não moda: os dois exigem ferramenta para não virar bagunça.",
            },
            {
                frente: "Como você definiria a política de branches e deploy?",
                verso: "Pela frequência de entrega que o time precisa. Branches curtos e integração diária evitam o inferno de conflito; fluxo com muitos branches longos só paga com versões suportadas em paralelo. O que decide é o tempo entre escrever e estar em produção.",
            },
            {
                frente: "Como você faria deploy sem indisponibilidade quando há mudança de banco?",
                verso: "Separando a migração do deploy e mantendo compatibilidade nos dois sentidos por uma versão: o schema novo funciona com o código antigo, e vice-versa. Assim as instâncias podem conviver durante a troca. É o que permite voltar atrás sem restaurar backup.",
            },
            {
                frente: "Como você avaliaria se um serviço está pronto para produção?",
                verso: "Por uma lista curta e objetiva: métrica e log, alerta ligado, verificação de saúde, limite de recurso, plano de reversão, segredo fora do código e alguém de plantão. Pronto não é funcionar na máquina de quem escreveu, é poder ser operado por outra pessoa.",
            },
            {
                frente: "Como você planejaria uma migração de dados sem parar a aplicação?",
                verso: "Em passos compatíveis: criar o novo, escrever nos dois, preencher o histórico em lotes, ler do novo e só depois remover o antigo. Cada passo sozinho é reversível. O que quebra deploy sem parada é mudança que exige código e schema trocarem no mesmo instante.",
            },
            {
                frente: "O que você exigiria antes de aprovar uso de reflexão numa base grande?",
                verso: "Um motivo que o código normal não resolve, escopo pequeno e teste cobrindo, porque reflexão quebra em silêncio quando alguém renomeia um campo. Em versões recentes ela também esbarra em módulo fechado, então o custo aparece na próxima atualização.",
            },
            {
                frente: "Como você estimaria a memória de um serviço para dimensionar o contêiner?",
                verso: "Contando heap, metaespaço, pilha por thread e memória fora do heap, e não só o heap. O limite do contêiner precisa sobrar acima disso, senão o processo é morto pelo sistema sem nem lançar erro. Medir sob carga real vale mais que qualquer fórmula.",
            },
            {
                frente: "Como você avaliaria o custo de infraestrutura de um serviço Java?",
                verso: "Custo por requisição, e não conta total: instâncias, memória reservada, banco e tráfego. Java costuma pesar em memória, então superdimensionar por medo é caro. Reduzir instância ociosa e ajustar limite com dado de uso rende mais que trocar de tecnologia.",
            },
            {
                frente: "Como você decidiria migrar para compilação nativa?",
                verso: "Se o ganho de subida e memória resolve uma dor real, como escala a zero ou muitas instâncias pequenas. O custo é reflexão declarada à mão, biblioteca incompatível e build lento. Para serviço que sobe e fica de pé, o ganho é pequeno demais para pagar.",
            },
            {
                frente: "Como você mediria a qualidade de uma base de código?",
                verso: "Por sinais de fora: tempo para entregar uma mudança pequena, taxa de defeito que volta, quanto tempo leva para alguém novo produzir, e quantas áreas ninguém quer tocar. Métrica interna de complexidade ajuda a localizar, mas sozinha vira meta que se engana.",
            },
            {
                frente: "Como você lidaria com um serviço que ninguém do time quer manter?",
                verso: "Descobrindo por que: costuma ser falta de teste, ambiente difícil e medo de quebrar. Melhorar o ciclo de desenvolvimento muda isso mais rápido que designar um responsável. Se ele não é mais essencial, a melhor manutenção é desligar e reduzir superfície.",
            },
            {
                frente: "Como você definiria quem é dono de cada parte do sistema?",
                verso: "Cada serviço com um time responsável, incluindo plantão, e isso visível no repositório. Sem dono, todo mundo é responsável e ninguém age no incidente. Dono não significa que só ele altera: significa que alguém revisa, decide e responde.",
            },
            {
                frente: "Como você escolheria entre corrigir a causa e mitigar o sintoma num incidente?",
                verso: "Mitigando primeiro para o usuário parar de sofrer, e registrando a causa como tarefa com prazo. Correção definitiva sob pressão costuma sair errada. O que não pode é a mitigação virar permanente sem ninguém saber que ela está lá segurando o serviço.",
            },
            {
                frente: "Como você lidaria com um time que registra quase tudo como singleton?",
                verso: "Mostrando o custo concreto: estado compartilhado entre requisições, dependência cativa e teste que passa isolado e falha em conjunto. Depois firmando um padrão simples, com o escopo de requisição como escolha inicial, e deixando singleton exigir justificativa na revisão.",
            },
            {
                frente: "Como você avaliaria uma proposta de adotar uma arquitetura orientada a eventos?",
                verso: "Perguntando qual acoplamento ela desfaz e quem opera a fila em produção. Ela paga quando há vários consumidores e picos a absorver. Adotada sem isso, troca chamada simples por depuração distribuída, ordem duvidosa e reprocessamento que ninguém desenhou.",
            },
            {
                frente: "Como você decidiria entre resolver no código e resolver na infraestrutura?",
                verso: "Pelo que fica mais fácil de operar e entender depois. Repetição, limite de taxa e roteamento costumam ficar melhores fora do código; regra de negócio, nunca. O risco de empurrar tudo para a infraestrutura é o comportamento sumir do repositório e ninguém achar.",
            },
            {
                frente: "Como você reduziria o risco de uma entrega grande e demorada?",
                verso: "Quebrando em partes que vão para produção desligadas atrás de uma chave, integrando cedo e medindo com uma fatia dos usuários. Entrega de três meses que vira ao vivo de uma vez concentra todo o risco no pior momento, que é a noite do lançamento.",
            },
            {
                frente: "Como você decidiria o que roda em cada ambiente antes da produção?",
                verso: "Pelo que cada um responde: o de desenvolvimento prova que compila e passa, e o de homologação precisa parecer produção em dado, volume e integração para valer alguma coisa. Ambiente que mente dá falsa confiança, e é mais barato ter menos ambientes e mais chave de funcionalidade.",
            },
            {
                frente: "Como você conduziria a padronização de observabilidade da casa?",
                verso: "Definindo o mínimo que todo serviço expõe, entregando como biblioteca com padrão pronto, e um painel modelo que nasce junto do serviço novo. Nome de métrica e formato de log precisam ser iguais, senão cada consulta em incidente vira tradução manual.",
            },
        ],
    },
};
