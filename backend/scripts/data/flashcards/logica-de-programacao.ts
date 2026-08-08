import type { CartasDaTrilha } from "../../seed-flashcards.ts";

// A trilha tem duas variantes de cada aula, JavaScript e Python. O conceito costuma
// ser o mesmo e a sintaxe não, então o que é conceito fica em "neutra" e vale para as
// duas, e só o que muda de verdade ganha cartão por linguagem.
export const logicaDeProgramacao: CartasDaTrilha = {
    trilha: "Lógica de Programação",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Um algoritmo precisa de um computador para existir?",
                        verso: "Não. Receita de bolo e troca de pneu são algoritmos sem computador nenhum.",
                    },
                    {
                        frente: "Por que 'misture os ingredientes' é um passo ruim de algoritmo?",
                        verso: "É vago: não diz o que misturar nem em que ordem, então depende de adivinhação.",
                    },
                    {
                        frente: "O que falta no computador e obriga o programador a escrever todo passo?",
                        verso: "Senso comum. Ele não completa a etapa que você esqueceu de escrever.",
                    },
                    {
                        frente: "O que o computador faz com as linhas de comentário quando roda o programa?",
                        verso: "Nada. Comentário não é executado, serve para organizar o raciocínio.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Reconhecer um padrão que se repete costuma levar a criar o quê, no código?",
                        verso: "Uma função, reaproveitada em vez de reescrever a mesma lógica toda vez.",
                    },
                    {
                        frente: "Deixar detalhes de fora da solução, na abstração, é preguiça?",
                        verso: "Não, é foco: fica só o que importa para resolver aquele problema.",
                    },
                    {
                        frente: "O que costuma acontecer com quem encara um problema grande sem decompor?",
                        verso: "Trava, porque tenta resolver tudo de uma vez só.",
                    },
                    {
                        frente: "Um padrão deixa de valer quando os detalhes da situação mudam?",
                        verso: "Não. Trocar a lâmpada da cozinha ou do quarto segue os mesmos passos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "No exemplo do liquidificador, o que faz o papel de saída?",
                        verso: "O suco pronto, depois de bater as frutas com a água.",
                    },
                    {
                        frente: "Toda saída de um programa aparece na tela?",
                        verso: "Não. Pode ser um som, um arquivo salvo ou uma mensagem a outro programa.",
                    },
                    {
                        frente: "Por que o processamento é chamado de parte pensante do programa?",
                        verso: "É onde a entrada vira alguma coisa nova ou mais útil.",
                    },
                    {
                        frente: "O que um programa sem nenhuma entrada tem para trabalhar?",
                        verso: "Quase nada: sem informação recebida, não há o que somar ou comparar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Em um fluxograma, o que significa a caixa em formato de losango?",
                        verso: "Uma decisão: a pergunta que leva o algoritmo a caminhos diferentes.",
                    },
                    {
                        frente: "Dá para executar um pseudocódigo no computador?",
                        verso: "Não. Ele é rascunho em português, não é linguagem de programação.",
                    },
                    {
                        frente: "Ao rascunhar um algoritmo, o que vem primeiro: o 'o quê' ou o 'como'?",
                        verso: "O 'o quê', os passos que resolvem o problema. A sintaxe fica para depois.",
                    },
                    {
                        frente: "Em um fluxograma, qual formato representa um passo que faz algo, como calcular?",
                        verso: "O retângulo, reservado às ações do algoritmo.",
                    },
                ],
            },
            5: {
                javascript: [
                    {
                        frente: "O que acontece em JavaScript ao escrever Console.log com C maiúsculo?",
                        verso: "Dá erro. O comando diferencia maiúsculas e se escreve console.log.",
                    },
                    {
                        frente: "Esquecer o ponto e vírgula no fim da instrução quebra o código JavaScript?",
                        verso: "Quase sempre não, mas fechar cada instrução com ; é a boa prática.",
                    },
                    {
                        frente: "Onde entra, no comando console.log, aquilo que você quer mostrar?",
                        verso: "Dentro dos parênteses de .log( ), que significa escrever no console.",
                    },
                    {
                        frente: "Além de mostrar mensagem, para que o console serve no dia a dia?",
                        verso: "Para entender por que um programa não se comporta como o esperado.",
                    },
                ],
                python: [
                    {
                        frente: "O que acontece em Python ao escrever Print com P maiúsculo?",
                        verso: "Dá erro. O Python diferencia maiúsculas e o comando é print.",
                    },
                    {
                        frente: "Python exige ponto e vírgula no fim da instrução?",
                        verso: "Não. O próprio fim da linha já marca que o comando terminou ali.",
                    },
                    {
                        frente: "O que acontece ao abrir um texto com aspas duplas e fechar com aspas simples?",
                        verso: "O Python não acha o fim do texto e aponta erro de sintaxe.",
                    },
                    {
                        frente: "Além de mostrar mensagem, para que o terminal serve no dia a dia?",
                        verso: "Para entender por que um programa não se comporta como o esperado.",
                    },
                ],
            },
        },

        2: {
            1: {
                neutra: [
                    {
                        frente: "Reatribuir uma variável cria uma caixa nova na memória?",
                        verso: "Não. Troca o conteúdo da caixa que já existe, e por isso ela varia.",
                    },
                    {
                        frente: "Por que dar nome claro à variável, se o computador aceita qualquer um?",
                        verso: "O nome é recado para quem lê depois, e quem lê depois costuma ser você.",
                    },
                ],
                javascript: [
                    {
                        frente: "Qual é a recomendação padrão entre let e const ao criar uma variável?",
                        verso: "Começar por const e trocar para let só quando souber que o valor vai mudar.",
                    },
                    {
                        frente: "Usar let numa variável que nunca muda causa erro em JavaScript?",
                        verso: "Não, só desperdiça a trava: const avisaria que aquele valor não muda.",
                    },
                ],
                python: [
                    {
                        frente: "Por que a convenção de MAIÚSCULAS existe em Python, se ela não trava nada?",
                        verso: "É recado para quem lê o código: este valor não é para ser alterado.",
                    },
                    {
                        frente: "Python tem uma palavra para declarar constante, como outras linguagens?",
                        verso: "Não. O combinado é por convenção, com o nome todo em maiúsculas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: 'O que muda entre 10 e "10", se os dois aparecem igual na tela?',
                        verso: "O primeiro é número e entra em conta; o segundo é texto e age como texto.",
                    },
                    {
                        frente: "Quem decide o tipo de um valor: você ao declarar ou a linguagem ao olhar?",
                        verso: "A linguagem descobre sozinha, olhando para o valor que você escreveu.",
                    },
                ],
                javascript: [
                    {
                        frente: "Qual operador confere o tipo de um valor em JavaScript?",
                        verso: "O typeof, que devolve o nome do tipo como texto.",
                    },
                    {
                        frente: "JavaScript separa número inteiro de número com casas decimais?",
                        verso: "Não. Os dois são number; quem separa int de float é o Python.",
                    },
                ],
                python: [
                    {
                        frente: "Qual função confere o tipo de um valor em Python?",
                        verso: "A type(), que devolve o tipo daquele valor.",
                    },
                    {
                        frente: 'O que a expressão "ab" * 3 devolve em Python?',
                        verso: 'O texto "ababab". Entre texto e número, o asterisco repete o texto.',
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como forçar uma ordem de cálculo diferente da padrão?",
                        verso: "Com parênteses, exatamente como você faria no papel.",
                    },
                    {
                        frente: "Multiplicação e divisão são calculadas antes ou depois da soma?",
                        verso: "Antes, igual à matemática da escola.",
                    },
                ],
                javascript: [
                    {
                        frente: "Em JavaScript, 9 / 2 devolve 4 ou 4.5?",
                        verso: "4.5. A divisão não descarta a parte quebrada do resultado.",
                    },
                ],
                python: [
                    {
                        frente: "Em Python, 10 / 2 devolve 5 ou 5.0?",
                        verso: "5.0. A barra simples sempre devolve float, mesmo em conta exata.",
                    },
                    {
                        frente: "O que o operador // faz em Python?",
                        verso: "Divide e descarta a parte quebrada: 9 // 2 devolve 4.",
                    },
                    {
                        frente: "Qual operador eleva um número à potência em Python?",
                        verso: "O **, então 2 ** 3 devolve 8.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é sempre o tipo do resultado de uma comparação?",
                        verso: "Booleano: a resposta só pode ser verdadeiro ou falso.",
                    },
                ],
                javascript: [
                    {
                        frente: "Por que preferir === a == em JavaScript?",
                        verso: "O === compara valor e tipo juntos, sem conversão escondida no meio.",
                    },
                    {
                        frente: "O que o == faz de diferente do === em JavaScript?",
                        verso: "Ignora o tipo e converte um lado para tentar bater com o outro.",
                    },
                    {
                        frente: "Qual operador JavaScript pergunta se dois valores são diferentes?",
                        verso: "O !==, o par do === para a pergunta contrária.",
                    },
                ],
                python: [
                    {
                        frente: "Existe === em Python?",
                        verso: "Não, e usar dá erro. O == já compara levando o tipo em conta.",
                    },
                    {
                        frente: 'Quanto vale "10" == 10 em Python?',
                        verso: "False. Texto nunca é igual a número, e o Python não converte escondido.",
                    },
                    {
                        frente: "Qual operador Python pergunta se dois valores são diferentes?",
                        verso: "O !=, que devolve True quando os valores não batem.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Numa regra ligada por E, quantos lados precisam ser verdadeiros?",
                        verso: "Os dois. Basta um lado falso para o resultado inteiro ser falso.",
                    },
                    {
                        frente: "Numa regra ligada por OU, quantos lados precisam ser verdadeiros?",
                        verso: "Um só já basta para o resultado ser verdadeiro.",
                    },
                    {
                        frente: "Para que servem os parênteses ao misturar várias comparações?",
                        verso: "Deixam claro o que é calculado em cada parte, como nas contas.",
                    },
                ],
                javascript: [
                    {
                        frente: "Como se escrevem e, ou e não em JavaScript?",
                        verso: "&& para e, || para ou, ! para não.",
                    },
                ],
                python: [
                    {
                        frente: "Como se escrevem e, ou e não em Python?",
                        verso: "and, or e not, por extenso mesmo.",
                    },
                ],
            },
        },

        3: {
            1: {
                javascript: [
                    {
                        frente: "O que a aula recomenda sobre as chaves num if de uma linha só?",
                        verso: "Usar chaves sempre, mesmo quando o bloco tem uma linha.",
                    },
                    {
                        frente: "O que envolve a condição do if em JavaScript?",
                        verso: "Parênteses, e o bloco que depende dela vai entre chaves.",
                    },
                ],
                python: [
                    {
                        frente: "O que marca o fim da linha da condição do if em Python?",
                        verso: "Os dois-pontos, e o bloco começa na linha seguinte.",
                    },
                    {
                        frente: "O que define o que está dentro do bloco do if em Python?",
                        verso: "A indentação, com quatro espaços de recuo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O else pode ter uma condição própria?",
                        verso: "Não. Ele é o caso contrário, o que sobra quando o if deu falso.",
                    },
                    {
                        frente: "Usar if sem else é errado?",
                        verso: "Não. O else é opcional; sem ele, condição falsa apenas não faz nada.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando várias condições encadeadas são verdadeiras, quantas rodam?",
                        verso: "Uma só, a primeira de cima para baixo. As outras são ignoradas.",
                    },
                    {
                        frente: "Por que a ordem das condições encadeadas faz parte da lógica?",
                        verso: "O teste para na primeira verdadeira, então trocar a ordem troca o resultado.",
                    },
                    {
                        frente: "Quantas condições encadeadas cabem entre o if e o else final?",
                        verso: "Quantas o problema precisar, não existe limite fixo.",
                    },
                ],
                javascript: [
                    {
                        frente: "Como se escreve, em JavaScript, o encadeamento de mais uma condição?",
                        verso: "Com else if, entre o if e o else final.",
                    },
                ],
                python: [
                    {
                        frente: "Como o Python abrevia o else if?",
                        verso: "Como elif, numa palavra só.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Para saber se um número é o maior de três, o que a condição precisa?",
                        verso: "Duas comparações ao mesmo tempo: ele maior ou igual a cada um dos outros.",
                    },
                    {
                        frente: "O que o operador de negação faz com uma condição?",
                        verso: "Inverte a resposta: o que era verdadeiro vira falso, e o contrário também.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quando a comparação por casos ganha das condições encadeadas?",
                        verso: "Quando é sempre a mesma variável contra vários valores exatos.",
                    },
                ],
                javascript: [
                    {
                        frente: "O switch consegue testar uma faixa, como nota maior ou igual a 7?",
                        verso: "Não. Ele só compara igualdade; faixa pede else if.",
                    },
                    {
                        frente: "O que o default faz dentro de um switch?",
                        verso: "Cobre o que não bateu com nenhum case.",
                    },
                ],
                python: [
                    {
                        frente: "Python tem switch?",
                        verso: "Não. Uma cadeia de elif resolve, e desde a 3.10 existe o match e case.",
                    },
                    {
                        frente: "No match do Python é preciso break no fim de cada case?",
                        verso: "Não. Só o primeiro case que bate roda, sem escorregar para os seguintes.",
                    },
                    {
                        frente: "O que o case _ cobre num match do Python?",
                        verso: "O que sobrou, quando nenhum outro case bateu.",
                    },
                ],
            },
        },

        4: {
            1: {
                neutra: [
                    {
                        frente: "Quais são as três partes da receita de um laço?",
                        verso: "Um ponto de partida, uma condição para parar e algo que muda a cada volta.",
                    },
                    {
                        frente: "Quantas vezes a instrução repetida por um laço é escrita?",
                        verso: "Uma só. Quem repete é o computador, não você.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Onde a variável usada na condição do while precisa ser criada?",
                        verso: "Antes do laço. Criada dentro, ela voltaria ao início a cada volta.",
                    },
                    {
                        frente: "Quando o while confere a condição: antes ou depois de cada volta?",
                        verso: "Antes de cada volta, e por isso pode nem rodar uma vez.",
                    },
                ],
                javascript: [
                    {
                        frente: "No navegador, o que se vê quando um laço infinito roda?",
                        verso: "A página congela, porque o laço nunca devolve o controle.",
                    },
                ],
                python: [
                    {
                        frente: "No terminal, como se interrompe um laço infinito?",
                        verso: "À força, normalmente com Ctrl+C, porque ele nunca termina sozinho.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando o for costuma ser melhor escolha que o while?",
                        verso: "Quando você já sabe de antemão quantas voltas serão.",
                    },
                ],
                javascript: [
                    {
                        frente: "Quantas vezes a inicialização do for em JavaScript é executada?",
                        verso: "Uma só, antes da primeira volta.",
                    },
                    {
                        frente: "Em que momento o incremento do for é executado?",
                        verso: "No fim de cada volta, depois de o bloco rodar.",
                    },
                ],
                python: [
                    {
                        frente: "O número final do range entra na sequência?",
                        verso: "Não. range(1, 6) gera de 1 a 5, o fim fica de fora.",
                    },
                    {
                        frente: "Quem cria e atualiza a variável de controle no for do Python?",
                        verso: "O range, que gera a sequência; o for apenas percorre.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde o acumulador precisa ser criado, antes ou dentro do laço?",
                        verso: "Antes. Criado dentro, ele voltaria ao valor inicial a cada volta.",
                    },
                    {
                        frente: "Qual é a diferença entre acumulador e contador?",
                        verso: "O acumulador soma valores diferentes; o contador soma sempre 1.",
                    },
                    {
                        frente: "Com que valor um acumulador de soma começa?",
                        verso: "Zero, que é o valor neutro da soma e não altera o total.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Num laço dentro de outro, quantas voltas acontecem no total?",
                        verso: "O produto dos dois: cada volta de fora roda o laço de dentro inteiro.",
                    },
                    {
                        frente: "Depois de um continue, o laço para ou segue?",
                        verso: "Segue. Ele pula só o resto daquela volta e vai para a próxima.",
                    },
                ],
                python: [
                    {
                        frente: "Em Python, o que mostra que um laço está dentro do outro?",
                        verso: "A indentação: o laço de dentro tem um nível a mais de recuo.",
                    },
                ],
            },
        },

        5: {
            1: {
                neutra: [
                    {
                        frente: "Definir uma função é como programar o quê, na imagem da aula?",
                        verso: "Um botão de controle remoto: nada acontece só por ele ter sido programado.",
                    },
                ],
                javascript: [
                    {
                        frente: "Qual palavra abre a definição de uma função em JavaScript?",
                        verso: "function, seguida do nome, dos parênteses e do bloco entre chaves.",
                    },
                ],
                python: [
                    {
                        frente: "Qual palavra abre a definição de uma função em Python?",
                        verso: "def, seguida do nome, dos parênteses e dos dois-pontos.",
                    },
                    {
                        frente: "O que define o corpo de uma função em Python?",
                        verso: "A indentação das linhas abaixo dos dois-pontos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que uma função com parâmetro evita escrever uma função por caso?",
                        verso: "O mesmo corpo serve a valores diferentes, trocando só o argumento na chamada.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre mostrar na tela e devolver com return?",
                        verso: "Mostrar serve ao humano ler; devolver serve ao programa usar o valor depois.",
                    },
                ],
                javascript: [
                    {
                        frente: "O que se guarda ao atribuir o retorno de uma função JavaScript sem return?",
                        verso: "undefined, porque não houve valor devolvido.",
                    },
                ],
                python: [
                    {
                        frente: "O que se guarda ao atribuir o retorno de uma função Python sem return?",
                        verso: "None, porque não houve valor devolvido.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Na analogia da aula, o que representa a variável global?",
                        verso: "O aviso no mural da entrada: todo mundo que passa consegue ver.",
                    },
                    {
                        frente: "O que acontece com a variável local quando a função termina?",
                        verso: "Some, como o que ficou na sala de reunião depois que todos saíram.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Uma função pode chamar outra função?",
                        verso: "Pode, e é assim que partes pequenas montam a resposta final.",
                    },
                    {
                        frente: "Na analogia da festa, o que cada função representa?",
                        verso: "Um responsável por uma tarefa isolada: comida, decoração ou música.",
                    },
                ],
            },
        },

        6: {
            1: {
                neutra: [
                    {
                        frente: "Por que o índice do último elemento é o tamanho menos um?",
                        verso: "Porque a contagem das posições começa em zero, não em um.",
                    },
                ],
                javascript: [
                    {
                        frente: "O que dá o tamanho de um array em JavaScript?",
                        verso: "A propriedade length, escrita sem parênteses.",
                    },
                ],
                python: [
                    {
                        frente: "O que dá o tamanho de uma lista em Python?",
                        verso: "A função len(lista), e não lista.length como em outras linguagens.",
                    },
                    {
                        frente: "O que o índice negativo faz numa lista Python?",
                        verso: "Conta a partir do fim: o -1 é o último elemento.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "É preciso definir o tamanho da lista na hora de criá-la?",
                        verso: "Não. Ela cresce e encolhe conforme o programa roda.",
                    },
                ],
                javascript: [
                    {
                        frente: "O que unshift e shift fazem num array?",
                        verso: "Mexem no começo: unshift adiciona, shift remove e devolve o primeiro.",
                    },
                ],
                python: [
                    {
                        frente: "Como se adicionam vários itens de uma vez a uma lista Python?",
                        verso: "Com extend, passando a lista dos novos valores; o append entra um por vez.",
                    },
                    {
                        frente: "Como se remove o primeiro item de uma lista em Python?",
                        verso: "Com pop(0), passando o índice zero.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que não escrever lista[0], lista[1], lista[2] na mão?",
                        verso: "Só funciona sabendo o tamanho, e vira inviável com mil posições.",
                    },
                ],
                javascript: [
                    {
                        frente: "Quando usar for...of em vez do for com índice?",
                        verso: "Quando só o valor importa; com índice serve quando a posição importa.",
                    },
                ],
                python: [
                    {
                        frente: "Quando usar enumerate ao percorrer uma lista?",
                        verso: "Quando você precisa do valor e da posição ao mesmo tempo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que descrever uma pessoa com posições numeradas é frágil?",
                        verso: "Trocar a ordem sem querer quebraria o programa inteiro.",
                    },
                ],
                javascript: [
                    {
                        frente: "Quais são as duas formas de acessar uma propriedade de objeto em JavaScript?",
                        verso: "Com ponto, obj.chave, ou com colchetes e a chave entre aspas.",
                    },
                ],
                python: [
                    {
                        frente: "Como se acessa um valor dentro de um dicionário em Python?",
                        verso: "Sempre por colchetes, com a chave entre aspas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Com que estrutura conhecida uma lista de registros se parece?",
                        verso: "Uma planilha: cada posição é uma linha e cada campo é uma coluna.",
                    },
                ],
            },
        },

        7: {
            1: {
                neutra: [
                    {
                        frente: "Quais são os quatro passos do roteiro para atacar um problema?",
                        verso: "Entender, quebrar em passos, escolher as ferramentas e testar aos poucos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como funciona a busca linear?",
                        verso: "Percorre item a item comparando, e para assim que encontra o que procura.",
                    },
                    {
                        frente: "Qual é a receita para achar o maior valor de uma lista?",
                        verso: "Apostar no primeiro item como campeão e trocar sempre que aparecer alguém maior.",
                    },
                ],
                python: [
                    {
                        frente: "Que atalho o Python oferece para saber se um item está numa lista?",
                        verso: "O operador in, que já devolve True ou False.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é o passo que a ordenação por seleção repete?",
                        verso: "Achar o menor do trecho que falta e trocá-lo com o primeiro desse trecho.",
                    },
                    {
                        frente: "Vale escrever a ordenação na mão no dia a dia?",
                        verso: "Não. Entender a ideia ajuda a raciocinar, mas o pronto da linguagem resolve.",
                    },
                ],
                python: [
                    {
                        frente: "Qual é a diferença entre sorted() e .sort() em Python?",
                        verso: "O sorted devolve uma lista nova; o .sort reordena a própria lista.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que fazer quando o código roda, mas o resultado sai errado?",
                        verso: "Imprimir os valores em pontos-chave e testar uma hipótese de cada vez.",
                    },
                ],
                javascript: [
                    {
                        frente: "Que erro comum faz um if entrar sempre como verdadeiro?",
                        verso: "Usar = no lugar de ===, porque o = atribui em vez de comparar.",
                    },
                ],
                python: [
                    {
                        frente: "Que erro o Python acusa quando a indentação está desalinhada?",
                        verso: "IndentationError, e ele nem chega a rodar o programa.",
                    },
                    {
                        frente: "Onde fica, no traceback do Python, o tipo do problema?",
                        verso: "Na última linha, e logo acima aparece onde o erro aconteceu.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual padrão dos laços a função que conta pendentes reaproveita?",
                        verso: "O contador: começa em zero e soma 1 quando a condição bate.",
                    },
                ],
            },
        },
    },
};
