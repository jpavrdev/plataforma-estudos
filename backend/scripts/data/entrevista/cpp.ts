import type { TopicoDeEntrevista } from "../../seed-entrevista.ts";

/**
 * Perguntas de entrevista de C++.
 *
 * A pergunta sobre evitar vazamento de memória veio de uma entrevista real, com a
 * redação preservada. Em volta dela ficam as companheiras que a conversa encadeia:
 * RAII, ponteiro inteligente, ciclo de shared_ptr e as ferramentas que provam o
 * vazamento em vez de só suspeitar dele.
 */
export const cpp: TopicoDeEntrevista = {
    slug: "cpp",
    nome: "C++",
    position: 4,
    perguntas: {
        estagio: [
            {
                frente: "Qual a diferença entre a pilha e o heap?",
                verso: "A pilha guarda variável local, cresce e encolhe junto com a chamada e é liberada sozinha no retorno. O heap guarda o que você aloca explicitamente e vive até ser liberado, com o endereço guardado num ponteiro. Pilha é rápida e limitada; heap é grande e cobra gestão.",
            },
            {
                frente: "O que é um ponteiro e o que é uma referência?",
                verso: "Ponteiro guarda um endereço, pode ser nulo e pode ser reapontado. Referência é um apelido para um objeto existente, não pode ser nula nem trocada depois de ligada. A referência é a escolha padrão em parâmetro; o ponteiro entra quando ausência é um estado válido.",
            },
            {
                frente: "O que acontece quando você passa um objeto por valor?",
                verso: "Ele é copiado, o que chama o construtor de cópia e pode custar caro em objeto grande. Por isso o padrão em parâmetro é referência constante, que evita a cópia e deixa claro que a função não vai alterar. Passar por valor é escolha, e não descuido.",
            },
            {
                frente: "O que é um destrutor e quando ele roda?",
                verso: "É o método chamado quando o objeto morre: no fim do escopo para objeto local, ou no delete para objeto do heap. É onde o objeto devolve o que segurava. Esse encadeamento automático é a base do idioma que evita vazamento em C++.",
            },
            {
                frente: "Para que serve a palavra const numa declaração?",
                verso: "Marca o que não pode mudar, e o compilador cobra. Em parâmetro por referência, promete que a função não altera o argumento. Em método, promete que ele não altera o objeto. É documentação que o compilador verifica, e não comentário.",
            },
            {
                frente: "Qual a diferença entre new e delete e entre malloc e free?",
                verso: "new aloca e chama o construtor; delete chama o destrutor e libera. malloc e free vêm de C e só cuidam da memória, sem construir nem destruir. Misturar os pares é erro grave. Em código moderno, nenhum dos dois aparece direto no dia a dia.",
            },
            {
                frente: "O que é o cabeçalho e para que serve o arquivo .h?",
                verso: "Declara o que existe, para outros arquivos poderem usar sem ver a implementação. O .cpp traz a definição. A compilação é por unidade de tradução, e o ligador junta tudo no fim. Guarda contra inclusão repetida é o que evita declarar duas vezes.",
            },
            {
                frente: "O que é um vector e por que ele é o padrão?",
                verso: "É o array que cresce sozinho, com os elementos contíguos na memória. Cresce realocando quando enche, o que invalida ponteiros para os elementos antigos. A contiguidade é o que faz ele ganhar de estruturas encadeadas na maioria dos casos, por causa do cache.",
            },
            {
                frente: "O que é a biblioteca padrão do C++ e o que ela cobre?",
                verso: "Traz contêineres, algoritmos, string, entrada e saída, utilidades de tempo e concorrência. A ideia é você quase nunca escrever laço de busca ou ordenação: chamar o algoritmo pronto costuma render código mais claro e mais rápido do que a versão manual.",
            },
            {
                frente: "O que significa dizer que C++ é compilado e tipado estaticamente?",
                verso: "O tipo de cada expressão é conhecido na compilação, e o binário gerado roda direto no processador, sem máquina virtual. Erro de tipo aparece antes de rodar, e não há custo de verificação em execução. O preço é compilar para cada plataforma.",
            },
            {
                frente: "O que é sobrecarga de função?",
                verso: "Declarar funções com o mesmo nome e parâmetros diferentes, e o compilador escolhe pela chamada. Serve para a mesma ideia ter uma forma por tipo. Não confundir com sobrescrita, que é substituir o comportamento de um método virtual do pai.",
            },
            {
                frente: "O que é uma classe abstrata em C++?",
                verso: "A que tem ao menos um método virtual puro, declarado com igual a zero, e por isso não pode ser instanciada. Serve para definir contrato. Toda classe base com herança precisa de destrutor virtual, senão apagar pelo ponteiro do pai não destrói o filho inteiro.",
            },
            {
                frente: "Para que servem os templates?",
                verso: "Escrever código uma vez para vários tipos, com o compilador gerando a versão de cada uso. É como vector serve int e string sem duplicação. O custo é mensagem de erro longa e tempo de compilação maior, porque o corpo vive no cabeçalho.",
            },
            {
                frente: "O que acontece se você ler um ponteiro não inicializado?",
                verso: "Comportamento indefinido: pode funcionar, pode ler lixo, pode derrubar o programa, e o compilador não é obrigado a avisar. Inicializar sempre, de preferência com nullptr quando ainda não há alvo, é a defesa mais barata que existe.",
            },
            {
                frente: "Qual a diferença entre nullptr e NULL?",
                verso: "nullptr tem tipo próprio de ponteiro nulo, então não é confundido com o inteiro zero na escolha de sobrecarga. NULL vem de C e costuma ser zero, o que gera ambiguidade. Em código novo, nullptr sempre.",
            },
            {
                frente: "O que é o escopo de uma variável em C++?",
                verso: "A região onde ela existe, delimitada por chaves. Ao sair do escopo, variável local é destruída, com o destrutor rodando. Esse fim previsível é exatamente o gancho que o C++ usa para liberar recurso sem coletor de lixo.",
            },
            {
                frente: "Para que serve o auto?",
                verso: "Deixa o compilador deduzir o tipo pela inicialização. O tipo continua fixo e verificado. Evita repetir nome longo de iterador ou de template, e reduz erro de conversão silenciosa. A recomendação é evitá-lo quando o tipo importa para quem lê.",
            },
            {
                frente: "O que é um struct em C++ e como difere de uma classe?",
                verso: "Tecnicamente só o padrão de visibilidade: struct é público por padrão e class é privado. Por convenção, struct fica para agregado simples de dados sem invariante, e class para tipo com regra própria e estado a proteger.",
            },
            {
                frente: "O que é compilação separada e o que o ligador faz?",
                verso: "Cada .cpp vira um objeto independente, e o ligador junta resolvendo os símbolos que faltavam. É por isso que existe erro de referência indefinida: a declaração existia no cabeçalho, mas a definição não foi compilada nem ligada.",
            },
            {
                frente: "O que é a assinatura de um método const, e por que ela importa?",
                verso: "Um método marcado const promete não alterar o objeto, e só ele pode ser chamado através de referência constante. Sem essa marcação, passar o objeto como const trava metade da API. É o tipo de detalhe que aparece cedo em revisão.",
            },
        ],
        junior: [
            {
                frente: "O que você faria para evitar vazamento de memória num projeto C++?",
                verso: "Não gerenciar memória na mão: usar RAII, em que o recurso é adquirido no construtor e devolvido no destrutor, e ponteiro inteligente no lugar de new e delete soltos. unique_ptr para dono único, shared_ptr quando a posse é compartilhada, e contêiner da biblioteca padrão no lugar de array alocado.",
            },
            {
                frente: "O que é RAII e por que ele é o centro do C++ moderno?",
                verso: "O recurso é adquirido na construção e devolvido na destruição, então o fim do escopo libera tudo, inclusive quando há exceção. Vale para memória, arquivo, trava e conexão. É o que substitui o bloco de limpeza manual, que sempre esquece um caminho de saída.",
            },
            {
                frente: "Quando usar unique_ptr e quando usar shared_ptr?",
                verso: "unique_ptr quando há um dono só, que é a maioria dos casos: ele é do tamanho de um ponteiro e não custa nada em execução. shared_ptr quando a posse é realmente compartilhada e ninguém sabe quem morre por último, ao custo de uma contagem atômica.",
            },
            {
                frente: "Como um ciclo de shared_ptr causa vazamento, e como se resolve?",
                verso: "Dois objetos que se apontam mantêm a contagem um do outro acima de zero, então nenhum é destruído mesmo sem ninguém de fora usando. A saída é quebrar o ciclo com weak_ptr num dos lados, tipicamente na referência de volta para o pai.",
            },
            {
                frente: "Que ferramentas você usaria para provar que existe vazamento?",
                verso: "Sanitizador de endereço e de vazamento na compilação, que acusam com pilha na hora do erro, e Valgrind quando não dá para recompilar. Prova é melhor que suspeita: memória crescendo pode ser fragmentação ou cache, e não vazamento.",
            },
            {
                frente: "O que é a regra dos três, cinco e zero?",
                verso: "Se você precisou escrever destrutor, construtor de cópia ou atribuição de cópia, provavelmente precisa dos três, e com movimento viram cinco. A regra do zero é a preferida: usar membros que já se gerenciam, para não escrever nenhum deles.",
            },
            {
                frente: "Qual a diferença entre cópia e movimento?",
                verso: "Cópia duplica o conteúdo. Movimento transfere a posse do recurso e deixa a origem num estado válido porém vazio, sem duplicar. É o que faz devolver um vector grande de uma função deixar de ser caro, e é escolhido pelo compilador quando a origem é temporária.",
            },
            {
                frente: "O que acontece se uma exceção é lançada no meio de uma função?",
                verso: "A pilha é desenrolada e os destrutores dos objetos locais rodam na ordem inversa. É por isso que RAII funciona mesmo com exceção, e por que liberar na mão depois do ponto de falha não roda. Destrutor não deve lançar, senão o programa encerra.",
            },
            {
                frente: "O que é comportamento indefinido e por que ele é perigoso?",
                verso: "Situação em que o padrão não exige nada do compilador, como estourar índice ou ler variável não inicializada. O perigo é o programa parecer correto em teste e quebrar em produção, porque o otimizador pode assumir que aquilo nunca acontece.",
            },
            {
                frente: "Por que uma classe base com herança precisa de destrutor virtual?",
                verso: "Sem ele, apagar pelo ponteiro do tipo base só destrói a parte base, e o que o filho segurava vaza. É um vazamento silencioso que não aparece em teste simples. A regra prática é: se a classe tem método virtual, o destrutor também é virtual.",
            },
            {
                frente: "O que invalida um iterador ou uma referência para elemento de vector?",
                verso: "Qualquer operação que realoque, como push_back estourando a capacidade, e remoção que desloque elementos. Guardar ponteiro para elemento e continuar usando depois de inserir é uma fonte clássica de acesso a memória liberada.",
            },
            {
                frente: "Quando escolher um contêiner ordenado e quando escolher um baseado em hash?",
                verso: "Ordenado quando você precisa percorrer em ordem ou buscar por intervalo, com custo logarítmico. Hash quando só importa achar pela chave, com custo médio constante e sem ordem nenhuma. Para poucos elementos, um vector varrido costuma ganhar dos dois.",
            },
            {
                frente: "O que a palavra explicit resolve num construtor?",
                verso: "Impede conversão implícita a partir de um argumento, que gera chamada inesperada e cópia escondida. Sem ela, passar um int onde se espera a classe pode compilar e construir um objeto sem ninguém pedir. A recomendação é marcar por padrão.",
            },
            {
                frente: "Qual a diferença entre override e um método virtual comum?",
                verso: "override diz ao compilador que aquele método substitui um virtual do pai, e ele reclama se a assinatura não bater. Sem essa marcação, um erro de assinatura cria um método novo em silêncio, e a chamada continua indo para o do pai.",
            },
            {
                frente: "O que é um lambda e onde ele aparece mais?",
                verso: "Função anônima declarada no ponto de uso, com captura opcional do que está em volta. Aparece em algoritmos da biblioteca padrão, como critério de ordenação e de filtro. Capturar por referência algo que morre antes do lambda é a armadilha do recurso.",
            },
            {
                frente: "Para que serve o move quando você já tem cópia?",
                verso: "Para transferir posse sem duplicar, quando a origem não será mais usada. Devolver um contêiner grande, guardar um unique_ptr num vector e passar adiante um recurso exclusivo dependem disso. Usar a origem depois de mover é erro comum.",
            },
            {
                frente: "O que muda ao compilar com otimização em relação ao modo de depuração?",
                verso: "O compilador reordena, embute e remove código, então a execução deixa de acompanhar as linhas na ordem, e variável pode nem existir no depurador. Bug que só aparece com otimização costuma indicar comportamento indefinido que o otimizador explorou.",
            },
            {
                frente: "Como você passaria um contêiner grande para uma função?",
                verso: "Por referência constante quando só vai ler, o que evita a cópia. Por referência não constante quando vai alterar no lugar. Por valor apenas quando a função precisa de uma cópia própria, e aí vale receber por valor e mover para dentro.",
            },
            {
                frente: "O que é o operador de resolução de escopo e quando ele importa?",
                verso: "O par de dois pontos que qualifica a que namespace ou classe o nome pertence. Importa para evitar ambiguidade, e é por isso que abrir um namespace inteiro com using no cabeçalho é desaconselhado: espalha nomes para todo mundo que incluir.",
            },
            {
                frente: "Quando um ponteiro cru ainda é a escolha certa?",
                verso: "Quando ele só observa e não é dono, como parâmetro que pode ser nulo ou membro que aponta para algo de vida garantidamente maior. O problema nunca foi o ponteiro cru em si, foi ele carregar posse. Posse pede tipo que se gerencia; observação, não.",
            },
        ],
        pleno: [
            {
                frente: "Como você investigaria memória crescendo num serviço C++ em produção?",
                verso: "Separando vazamento de fragmentação e de cache que cresce: o sanitizador de vazamento acusa bloco perdido com a pilha de alocação, enquanto crescimento sem bloco perdido aponta para retenção legítima ou fragmentação do alocador. Medir antes de mexer no código.",
            },
            {
                frente: "Quando um shared_ptr é a escolha errada?",
                verso: "Quando a posse é única e ele entrou só por hábito: custa contagem atômica em toda cópia e esconde quem é o dono. Também quando cria ciclo. Passar shared_ptr por valor para função que só vai ler é desperdício, porque uma referência bastaria.",
            },
            {
                frente: "Como você projetaria uma classe que segura um recurso do sistema?",
                verso: "Adquirindo no construtor e devolvendo no destrutor, proibindo cópia e permitindo movimento, para haver um dono só e a transferência ser explícita. Se copiar fizer sentido, aí a semântica precisa ser definida, e não deixada no padrão do compilador.",
            },
            {
                frente: "O que é fragmentação de memória e como ela se manifesta?",
                verso: "Espaço livre existente porém picado, que não atende uma alocação grande. O processo cresce sem vazamento nenhum. Aparece em serviço de vida longa com alocação de tamanhos variados, e a saída costuma ser reaproveitar blocos por pool ou arena.",
            },
            {
                frente: "Como você evitaria alocação em caminho quente?",
                verso: "Reservando capacidade antes do laço, reaproveitando buffer entre iterações, preferindo tipos com armazenamento local pequeno e evitando conversão que cria temporário. E medindo: perfil de alocação mostra onde vale, e o resto costuma ser otimização cega.",
            },
            {
                frente: "O que é corrida de dado e como você a evitaria?",
                verso: "Dois threads acessando a mesma memória sem sincronização, com ao menos um escrevendo, o que é comportamento indefinido. Evita-se com trava, com tipo atômico ou não compartilhando: cada thread com o seu dado. O sanitizador de thread acusa o que passou.",
            },
            {
                frente: "Qual a diferença entre atômico e trava?",
                verso: "Atômico garante que uma operação simples não seja vista pela metade, sem bloquear ninguém. Trava protege uma região inteira, permitindo invariante entre várias variáveis. Contador vira atômico; estrutura com dois campos que precisam concordar pede trava.",
            },
            {
                frente: "Como você garantiria que uma trava sempre é liberada?",
                verso: "Nunca travando na mão: usar o guarda que trava no construtor e destrava no destrutor. Assim retorno antecipado e exceção liberam do mesmo jeito. Travar e destravar explicitamente é o caminho mais curto para travamento permanente sob erro.",
            },
            {
                frente: "Como você depuraria uma falha de segmentação que só acontece às vezes?",
                verso: "Recompilando com sanitizador de endereço, que costuma acusar no ponto do erro em vez de no colapso. Depois, analisando o dump para ver a pilha real. Intermitência aponta para acesso a memória já liberada, corrida de dado ou índice fora do limite.",
            },
            {
                frente: "O que é uso depois de liberar, e por que ele é tão difícil de achar?",
                verso: "Acessar memória que já foi devolvida ao alocador. O bloco pode continuar legível por um tempo, então o programa parece funcionar e falha depois, longe da causa. Ponteiro inteligente com posse clara e sanitizador são o que transformam isso em erro visível.",
            },
            {
                frente: "Quando faz sentido escrever seu próprio alocador?",
                verso: "Quando o perfil provou que a alocação domina, e o padrão de uso é previsível: muitos objetos do mesmo tamanho, ou tudo liberado de uma vez no fim de uma fase. Fora disso, o alocador do sistema costuma ganhar de qualquer versão escrita às pressas.",
            },
            {
                frente: "Como você reduziria tempo de compilação numa base grande?",
                verso: "Cortando inclusão desnecessária em cabeçalho, usando declaração antecipada onde só o ponteiro é preciso, e movendo template pesado para onde ele é usado. Cache de compilação e build incremental ajudam, mas o ganho real vem do grafo de inclusão.",
            },
            {
                frente: "O que muda ao expor uma interface C++ entre bibliotecas?",
                verso: "Tipo da biblioteca padrão e layout de classe dependem de compilador e de opções, então cruzar fronteira binária com eles quebra. A saída usual é expor interface em C, ou fixar compilador e opções para os dois lados, e documentar isso.",
            },
            {
                frente: "Como você lidaria com código legado que usa new e delete por todo lado?",
                verso: "Sem varrer tudo de uma vez: primeiro fechando os pontos de vazamento provados pela ferramenta, envolvendo cada recurso num tipo que se gerencia. A migração fica por módulo, e o critério de parada é o sanitizador ficar limpo naquele caminho.",
            },
            {
                frente: "Qual o custo real de um método virtual?",
                verso: "Uma indireção pela tabela de funções e a perda da possibilidade de embutir a chamada. Em laço muito quente isso aparece; na maioria do código, não. Trocar polimorfismo por template resolve quando o tipo é conhecido na compilação.",
            },
            {
                frente: "Como você trataria erro numa base que não usa exceção?",
                verso: "Com um tipo de retorno que carrega valor ou erro, verificado por quem chama, e sem código de erro solto ignorado em silêncio. O importante é ser consistente: metade da base com exceção e metade com código de retorno é o pior dos dois mundos.",
            },
            {
                frente: "O que é a otimização de valor de retorno e por que ela importa?",
                verso: "O compilador constrói o objeto de retorno direto no destino, sem cópia nem movimento. É por isso que devolver um contêiner grande por valor deixou de ser problema. Tentar ajudar com move no return costuma atrapalhar e impedir a otimização.",
            },
            {
                frente: "Como você testaria código C++ que fala com hardware ou com o sistema?",
                verso: "Isolando a fronteira atrás de uma interface fina e testando a lógica contra uma implementação de mentira. O pedaço que toca o hardware fica pequeno o bastante para ser verificado à mão ou em banca. Sem esse corte, quase nada é testável.",
            },
            {
                frente: "O que você olharia num código C++ em revisão, além da lógica?",
                verso: "Quem é o dono de cada recurso, se há cópia escondida em parâmetro por valor, destrutor virtual em classe base, iterador guardado depois de realocação, e captura por referência em lambda que sobrevive ao escopo. São os erros que compilam sem aviso.",
            },
            {
                frente: "Como você garantiria que um recurso é liberado mesmo se o construtor falhar?",
                verso: "Deixando cada recurso num membro que se gerencia sozinho. Se o construtor lança, os membros já construídos são destruídos e o destrutor da classe não roda, então recurso adquirido com new solto no corpo do construtor vaza. Um recurso por objeto resolve.",
            },
        ],
        senior: [
            {
                frente: "Quando você escolheria C++ hoje, e quando recomendaria outra linguagem?",
                verso: "Escolheria onde controle de memória e latência previsível são requisito: embarcado, tempo real, motor de jogo, processamento pesado. Recomendaria outra onde produtividade e segurança de memória pesam mais que o último microssegundo, porque o custo humano é alto.",
            },
            {
                frente: "Como você conduziria a modernização de uma base C++ antiga?",
                verso: "Por módulo e com rede de proteção antes: teste no que existe, sanitizador na integração contínua e um padrão escrito do que passa a ser aceito. Ponteiro inteligente e RAII primeiro, porque são os que removem classe inteira de erro, e não os recursos novos vistosos.",
            },
            {
                frente: "Como você definiria o padrão de código C++ de uma equipe?",
                verso: "Poucas regras que o compilador ou a ferramenta consigam cobrar, e não um documento longo que ninguém lê. Formatação automática, avisos como erro, sanitizador na integração e um guia curto para o que é decisão de projeto, como política de exceção e de posse.",
            },
            {
                frente: "Como você avaliaria adotar um recurso novo do padrão numa base grande?",
                verso: "Pelo problema que ele remove, não pela novidade. Perguntar quantos lugares melhoram, se o time entende sem treinamento longo e se o compilador de todos os alvos suporta. Recurso adotado por entusiasmo costuma dividir a base em dois estilos.",
            },
            {
                frente: "Como você trataria uma equipe que evita ponteiro inteligente por causa de desempenho?",
                verso: "Com medida, e não com discurso: unique_ptr não custa nada em execução, e shared_ptr custa contagem atômica que raramente aparece no perfil. Onde de fato pesar, o caminho é reduzir a partilha, e não voltar a delete manual espalhado.",
            },
            {
                frente: "Como você garantiria segurança de memória sem trocar de linguagem?",
                verso: "Combinando disciplina e ferramenta: RAII e posse explícita no código, sanitizadores na integração contínua, análise estática, avisos tratados como erro e testes com entrada gerada. Não elimina a classe de erro, mas transforma a maioria em falha visível cedo.",
            },
            {
                frente: "Como você decidiria entre polimorfismo por herança e por template?",
                verso: "Herança quando o tipo só é conhecido em execução e a lista pode crescer sem recompilar. Template quando é conhecido na compilação e o custo da indireção importa. Template espalha o corpo pelos cabeçalhos e cobra em tempo de build, que é o preço escondido.",
            },
            {
                frente: "Como você lidaria com dependência de terceiro sem manutenção numa base C++?",
                verso: "Isolando atrás de uma interface própria, fixando a versão e mantendo o código dela construível junto. Depois, plano de saída com custo estimado. Em C++ isso pesa mais que em outras linguagens, porque troca de biblioteca costuma implicar troca de modelo de posse.",
            },
            {
                frente: "Como você mediria se uma otimização em C++ valeu a pena?",
                verso: "Com perfil antes e depois, na carga real e não num microbenchmark isolado, olhando latência de cauda além da média. E comparando com o custo de manutenção: código mais rápido e ilegível é dívida que a próxima pessoa paga sem saber por quê.",
            },
            {
                frente: "Como você ensinaria C++ a quem vem de linguagem com coletor de lixo?",
                verso: "Começando por tempo de vida e posse, que é o conceito que não existe do outro lado, e só depois pela sintaxe. Mostrar RAII antes de new e delete evita que a pessoa aprenda o modelo antigo primeiro e passe anos desaprendendo.",
            },
            {
                frente: "Como você revisaria código concorrente em C++?",
                verso: "Perguntando qual dado é compartilhado e o que o protege, se alguma trava é segurada durante chamada demorada, e se a ordem de aquisição é a mesma em todo lugar. Depois exigindo sanitizador de thread na integração, porque leitura não pega corrida.",
            },
            {
                frente: "Como você trataria tempo de build que virou gargalo do time?",
                verso: "Medindo o que domina, que costuma ser cabeçalho pesado incluído por todo mundo e template instanciado demais. Depois cortando o grafo de inclusão, e só então investindo em cache e máquina. Comprar hardware sem cortar inclusão adia o problema.",
            },
            {
                frente: "Quando um módulo C++ deveria virar um processo separado?",
                verso: "Quando o isolamento de falha vale mais que o custo da comunicação: um plugin de terceiro que pode derrubar o processo inteiro, ou uma parte que precisa de ciclo de vida próprio. Dentro do mesmo processo, não há fronteira que sobreviva a ponteiro solto.",
            },
            {
                frente: "Como você trataria a diferença de comportamento entre compiladores e plataformas?",
                verso: "Compilando com mais de um na integração contínua, ligando avisos e tratando como erro, e evitando o que o padrão deixa em aberto, como ordem de avaliação e tamanho de tipo. O que sobrar de específico fica isolado num ponto só, com o motivo escrito.",
            },
            {
                frente: "O que você olharia primeiro numa base C++ que acabou de herdar?",
                verso: "Como o build funciona e se ele é reproduzível, quais avisos estão desligados, se há sanitizador em algum lugar, e o modelo de posse: onde aparece new solto, ponteiro cru guardado em membro e destrutor não virtual em classe base.",
            },
            {
                frente: "Como você lidaria com uma otimização que introduziu comportamento indefinido?",
                verso: "Reconhecendo que o problema é o comportamento indefinido, e não o otimizador: código que só funcionava sem otimização já estava errado. Reproduzir com sanitizador, corrigir a causa, e acrescentar teste. Desligar a otimização é esconder, não resolver.",
            },
            {
                frente: "Como você equilibraria abstração e desempenho numa API C++?",
                verso: "Buscando abstração sem custo em execução, que é a promessa da linguagem: template e inline entregam isso quando o tipo é conhecido. Onde não dá, expor os dois níveis, com a interface confortável por cima e a de baixo disponível para quem precisa.",
            },
            {
                frente: "Como você decidiria entre corrigir e reescrever um módulo C++ problemático?",
                verso: "Pelo que se sabe do comportamento atual: sem teste, reescrever é apostar que ninguém dependia de um detalhe não documentado. O caminho costuma ser caracterizar com teste primeiro, e só então trocar por dentro, mantendo a interface.",
            },
            {
                frente: "Como você trataria uma decisão de posse de memória tomada errado há anos?",
                verso: "Sem varrer tudo: introduzindo o tipo que expressa a posse correta na fronteira e convertendo por módulo, com o sanitizador provando cada etapa. Trocar o modelo de posse de uma vez numa base grande é onde projetos de modernização costumam parar.",
            },
            {
                frente: "Como você justificaria para a liderança o investimento em ferramenta de análise?",
                verso: "Traduzindo em incidente evitado: cada falha de memória em produção custa plantão, diagnóstico longe da causa e confiança. Sanitizador e análise estática movem esse custo para a integração contínua, onde ele é minutos de build e ninguém acorda de madrugada.",
            },
        ],
    },
};
