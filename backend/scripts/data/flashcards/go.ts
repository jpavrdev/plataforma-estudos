import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Go, segunda trilha do roadmap de DevOps.
 *
 * Trilha de nove módulos de três aulas, sem trilhos de linguagem: tudo em
 * "neutra". O quiz cobra a leitura de código; as cartas ficam com as listas
 * fechadas, os nomes das ferramentas e as regras que a aula enuncia de passagem.
 */
export const go: CartasDaTrilha = {
    trilha: "Go",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que ferramentas conhecidas são escritas em Go?",
                        verso: "O Docker e o Kubernetes, além de muita infra de nuvem.",
                    },
                    {
                        frente: "Que problema o Go nasceu para resolver?",
                        verso: "Software de servidor rápido de compilar, simples de ler e concorrente.",
                    },
                    {
                        frente: "Que quatro escolhas de projeto definem o Go?",
                        verso: "Simplicidade, compilação rápida, concorrência embutida e formatação única.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre go run e go build?",
                        verso: "O run compila e executa de uma vez; o build gera o binário.",
                    },
                    {
                        frente: "O que o Go dispensa no fim de cada linha?",
                        verso: "O ponto e vírgula: a ferramenta cuida disso sozinha.",
                    },
                    {
                        frente: "O que o fmt.Println faz além de imprimir?",
                        verso: "Pula uma linha depois de imprimir o argumento.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que palavras o Go dispensa para controlar visibilidade?",
                        verso: "As de público e privado: a inicial do nome decide sozinha.",
                    },
                    {
                        frente: "Que pacotes da biblioteca padrão a aula cita?",
                        verso: "fmt para formatação, strings, math e os para o sistema.",
                    },
                    {
                        frente: "O que cada arquivo Go declara logo na primeira linha?",
                        verso: "A que pacote ele pertence.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Onde a forma curta com dois pontos e igual pode ser usada?",
                        verso: "Só dentro de funções; fora delas, usa-se var.",
                    },
                    {
                        frente: "Que zero value os números e os booleanos recebem?",
                        verso: "Zero nos números e false nos booleanos.",
                    },
                    {
                        frente: "Por que o Go trata variável não usada como erro?",
                        verso: "É escolha proposital para manter o código limpo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "De que tipos byte e rune são apelidos?",
                        verso: "byte é apelido de uint8 e rune, de int32.",
                    },
                    {
                        frente: "Quando uma constante do Go é resolvida?",
                        verso: "Em tempo de compilação; ela não aceita valor só conhecido ao rodar.",
                    },
                    {
                        frente: "De que depende o tamanho do tipo int em Go?",
                        verso: "Da plataforma; existem também int32 e int64 explícitos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que quatro verbos de formato o Printf usa com mais frequência?",
                        verso: "Um para inteiro, um para float, um para string e um para qualquer valor.",
                    },
                    {
                        frente: "Por que não se escreve uma atribuição recebendo i mais mais?",
                        verso: "O incremento é instrução, não expressão, então não devolve valor.",
                    },
                    {
                        frente: "O que o Printf não faz, ao contrário do Println?",
                        verso: "Pular linha: a quebra vai escrita na string de formato.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que instrução o if do Go aceita antes da condição?",
                        verso: "Uma inicialização curta, separada por ponto e vírgula.",
                    },
                    {
                        frente: "Com que tipo de função o if com inicialização mais combina?",
                        verso: "Com as que devolvem um valor e um erro de uma vez.",
                    },
                    {
                        frente: "De que linguagens o switch do Go se diferencia no fall-through?",
                        verso: "De C e Java: nele cada case para sozinho, sem break.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que laços o Go não tem, além do for?",
                        verso: "Nem while nem do-while: o for cobre todos os casos.",
                    },
                    {
                        frente: "Que três formas o for do Go assume?",
                        verso: "A clássica com três partes, só com a condição, ou sem nada.",
                    },
                    {
                        frente: "O que a forma clássica do for declara nas três partes?",
                        verso: "Inicialização, condição e passo, separados por ponto e vírgula.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Sobre que quatro tipos o for range consegue iterar?",
                        verso: "Slice, array, string e map.",
                    },
                    {
                        frente: "Que outro uso o identificador em branco tem, além do range?",
                        verso: "Descartar qualquer retorno que você não vai usar.",
                    },
                    {
                        frente: "Que dois valores o range entrega a cada volta?",
                        verso: "O índice e o valor do elemento atual, nessa ordem.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Como abreviar dois parâmetros seguidos do mesmo tipo?",
                        verso: "Escrevendo o tipo uma vez só, depois do último nome.",
                    },
                    {
                        frente: "Que ordem a assinatura de uma função Go segue?",
                        verso: "func, nome, parâmetros com tipo depois do nome, e o retorno.",
                    },
                    {
                        frente: "Para que os múltiplos retornos são mais usados no dia a dia?",
                        verso: "Devolver o resultado junto com um possível erro.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "No que os retornos nomeados se transformam dentro da função?",
                        verso: "Em variáveis já declaradas, prontas para receber valor.",
                    },
                    {
                        frente: "Com que moderação a aula recomenda usar retornos nomeados?",
                        verso: "Com parcimônia: usados assim, deixam a intenção clara.",
                    },
                    {
                        frente: "Que símbolo marca um parâmetro variádico na assinatura?",
                        verso: "Três pontos antes do tipo do parâmetro.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que ordem vários defer da mesma função rodam?",
                        verso: "Na inversa: o último agendado roda primeiro, como uma pilha.",
                    },
                    {
                        frente: "O que o defer garante, aconteça o que acontecer no meio?",
                        verso: "Que a chamada agendada roda quando a função retornar.",
                    },
                    {
                        frente: "Que padrão flexível as funções como valores sustentam?",
                        verso: "Passar uma função de comparação para ordenar uma lista.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Por que dois arrays de tamanhos diferentes são tipos diferentes?",
                        verso: "O tamanho do array faz parte do tipo dele.",
                    },
                    {
                        frente: "O que a notação de fatia inclui e o que ela exclui?",
                        verso: "Inclui o índice inicial e exclui o final.",
                    },
                    {
                        frente: "Sobre o que um slice se apoia por baixo?",
                        verso: "Sobre um array, que ele cobre com tamanho variável.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que duas formas criam um slice em Go?",
                        verso: "O literal com chaves e a função make com tipo e tamanho.",
                    },
                    {
                        frente: "O que acontece ao alterar uma fatia de um slice existente?",
                        verso: "Pode alterar o original, porque os dois dividem o mesmo array.",
                    },
                    {
                        frente: "Como obter uma cópia realmente independente de um slice?",
                        verso: "Com a função copy, escrevendo num slice novo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que dois jeitos criam um map em Go?",
                        verso: "A função make ou um literal com as chaves e valores.",
                    },
                    {
                        frente: "Que ambiguidade o comma-ok resolve num map?",
                        verso: "Distingue a chave que existe e vale zero da que não existe.",
                    },
                    {
                        frente: "Como se acessa e se remove uma chave de um map?",
                        verso: "Acessa com colchetes e remove com a função delete.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que palavra define um tipo novo agrupando campos?",
                        verso: "O type seguido de struct, com os campos entre chaves.",
                    },
                    {
                        frente: "Como se prefere criar um valor de struct?",
                        verso: "Informando o nome de cada campo, e não só a ordem.",
                    },
                    {
                        frente: "Que regra vale para a visibilidade dos campos de uma struct?",
                        verso: "A mesma dos pacotes: maiúscula exporta, minúscula esconde.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Onde o receiver fica na declaração de um método?",
                        verso: "Entre o func e o nome do método, entre parênteses.",
                    },
                    {
                        frente: "O que um receiver de valor recebe, ao ser chamado?",
                        verso: "Uma cópia: alterar campos ali não afeta o original.",
                    },
                    {
                        frente: "O que um ponteiro guarda, em vez do valor?",
                        verso: "O endereço da variável a que ele aponta.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o embedding omite, ao declarar o tipo embutido?",
                        verso: "O nome do campo: escreve-se só o tipo dentro da struct.",
                    },
                    {
                        frente: "Como o Go monta comportamento, sem hierarquia de classes?",
                        verso: "Combinando peças por composição, em vez de hierarquias rígidas.",
                    },
                    {
                        frente: "Como se preenche o tipo embutido ao criar o valor externo?",
                        verso: "Usando o nome do próprio tipo como se fosse o campo.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que acoplamento a interface implícita permite entre pacotes?",
                        verso: "Um pacote usa tipos de outro que a satisfazem sem saber dela.",
                    },
                    {
                        frente: "O que basta a um tipo ter para satisfazer uma interface?",
                        verso: "Os métodos que ela declara; nada mais precisa ser escrito.",
                    },
                    {
                        frente: "Que palavra o Go não tem, ao contrário de outras linguagens?",
                        verso: "A de implementar: a satisfação da interface é implícita.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que interface famosa da biblioteca padrão tem um método só?",
                        verso: "A Stringer, com o método que devolve a representação em texto.",
                    },
                    {
                        frente: "O que o tipo ganha ao implementar a Stringer?",
                        verso: "Controla como ele é impresso pelo pacote fmt.",
                    },
                    {
                        frente: "Por que interfaces enxutas são preferidas em Go?",
                        verso: "São fáceis de satisfazer e de combinar entre si.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que recurso trata vários tipos possíveis de uma vez?",
                        verso: "O type switch, que escolhe o caso pelo tipo dinâmico do valor.",
                    },
                    {
                        frente: "Quando a interface vazia é útil, na prática?",
                        verso: "Quando é preciso guardar um valor de tipo desconhecido.",
                    },
                    {
                        frente: "O que uma asserção de tipo sem comma-ok pode causar?",
                        verso: "Um panic, se o tipo não for o esperado no valor.",
                    },
                ],
            },
        },
        8: {
            1: {
                neutra: [
                    {
                        frente: "Que método a interface error declara?",
                        verso: "Um que devolve a mensagem do erro como texto.",
                    },
                    {
                        frente: "Por que a clareza do if de erro é proposital em Go?",
                        verso: "Nada de erro escondido saltando níveis, como acontece com exceção.",
                    },
                    {
                        frente: "Onde o fluxo de erro fica visível num programa Go?",
                        verso: "No próprio código, linha a linha, onde algo pode dar errado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que propagar um erro significa, em Go?",
                        verso: "Devolver pra cima, pra quem chamou decidir o que fazer.",
                    },
                    {
                        frente: "O que embrulhar um erro preserva, além do contexto novo?",
                        verso: "A causa original, que ferramentas ainda conseguem inspecionar.",
                    },
                    {
                        frente: "Que história a mensagem final de um erro embrulhado conta?",
                        verso: "O que aconteceu camada por camada, do topo até a causa.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que um panic faz com a pilha de chamadas?",
                        verso: "Começa a desmontá-la, interrompendo o fluxo normal.",
                    },
                    {
                        frente: "Que caso prático justifica usar recover num servidor?",
                        verso: "Não derrubar tudo por causa de uma requisição problemática.",
                    },
                    {
                        frente: "Que exemplos a aula dá de falha esperada, e não de panic?",
                        verso: "Arquivo não encontrado e entrada inválida: viram erro, não panic.",
                    },
                ],
            },
        },
        9: {
            1: {
                neutra: [
                    {
                        frente: "Quem gerencia as goroutines de um programa Go?",
                        verso: "O próprio runtime do Go, e não o sistema operacional.",
                    },
                    {
                        frente: "Qual é a diferença entre concorrência e paralelismo?",
                        verso: "Concorrência estrutura tarefas independentes; paralelismo as roda junto.",
                    },
                    {
                        frente: "O que o programa faz logo depois de iniciar uma goroutine?",
                        verso: "Segue adiante: ele não espera aquela goroutine terminar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que lema do Go orienta o uso de channels?",
                        verso: "Não comunicar compartilhando memória; compartilhar memória comunicando.",
                    },
                    {
                        frente: "O que o encontro de envio e recebimento dispensa?",
                        verso: "As travas manuais: a sincronização sai natural do channel.",
                    },
                    {
                        frente: "A que o select se compara, em estrutura?",
                        verso: "A um switch, só que para operações de canal.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três projetos pequenos a aula sugere para praticar?",
                        verso: "Ferramenta de linha de comando, API com net/http e processador concorrente.",
                    },
                    {
                        frente: "Que pacote padrão sobe uma API HTTP em Go?",
                        verso: "O net/http, da própria biblioteca padrão.",
                    },
                    {
                        frente: "Que caminhos naturais seguem depois dos fundamentos?",
                        verso: "Aprofundar a biblioteca padrão, escrever testes e fazer serviços de rede.",
                    },
                ],
            },
        },
    },
};
