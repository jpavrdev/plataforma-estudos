import type { CartasDaTrilha } from "../../seed-flashcards.ts";

// Trilha com quiz denso: cinco questões por aula cobrindo boa parte do conteúdo.
// Onde a aula não sustenta um cartão distinto do que já é cobrado, ela fica sem
// cartão, porque forçar produziria repetição.
export const java: CartasDaTrilha = {
    trilha: "Java",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre JRE e JDK?",
                        verso: "O JRE roda programas Java; o JDK traz também o compilador.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como o arquivo precisa se chamar em relação à classe pública?",
                        verso: "Exatamente igual à classe, com a extensão .java.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o ponto e vírgula marca em Java?",
                        verso: "O fim de cada instrução.",
                    },
                ],
            },
        },
        2: {
            2: {
                neutra: [
                    {
                        frente: "O que a divisão entre dois inteiros devolve?",
                        verso: "Um inteiro, descartando a parte fracionária.",
                    },
                    {
                        frente: "O que o operador de resto entrega?",
                        verso: "O que sobra da divisão.",
                    },
                    {
                        frente: "O que a atribuição composta faz?",
                        verso: "Aplica a operação e guarda no mesmo lugar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que os operadores relacionais devolvem?",
                        verso: "Um valor booleano.",
                    },
                    {
                        frente: "O que o E lógico faz com o segundo operando?",
                        verso: "Nem avalia, se o primeiro já for falso.",
                    },
                    {
                        frente: "Que erro comum troca comparação por atribuição?",
                        verso: "Usar um sinal de igual onde precisa de dois.",
                    },
                ],
            },
            1: {
                neutra: [
                    {
                        frente: "Quantos caracteres um char guarda?",
                        verso: "Um só, escrito entre aspas simples.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quando a conversão de tipo é automática em Java?",
                        verso: "De tipo menor para maior, porque aí não há perda de informação.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que a condição de um if precisa ser?",
                        verso: "Uma expressão booleana.",
                    },
                    {
                        frente: "Quantos blocos de senão um encadeamento aceita?",
                        verso: "Vários intermediários e um final.",
                    },
                    {
                        frente: "O que acontece sem as chaves no bloco?",
                        verso: "Só a primeira instrução entra nele.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando o laço while testa a condição?",
                        verso: "Antes de executar o corpo.",
                    },
                    {
                        frente: "Quando o do-while testa?",
                        verso: "Depois, então o corpo roda ao menos uma vez.",
                    },
                    {
                        frente: "O que provoca um laço infinito?",
                        verso: "A condição nunca deixar de ser verdadeira.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o switch com seta evita?",
                        verso: "O fall-through, sem precisar escrever break em cada case.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quando o for clássico ganha do for-each?",
                        verso: "Quando você precisa do índice ou de controle fino da repetição.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que o tamanho de um array tem de especial?",
                        verso: "É fixo depois de criado.",
                    },
                    {
                        frente: "Em que índice o array começa?",
                        verso: "No zero.",
                    },
                    {
                        frente: "O que acontece ao acessar índice fora do intervalo?",
                        verso: "Uma exceção é lançada em execução.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que comparar String com == é errado em Java?",
                        verso: "O == compara se são o mesmo objeto na memória, não o conteúdo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que situação o StringBuilder mais compensa?",
                        verso: "Ao juntar muitas partes de texto dentro de um laço.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "O que uma classe é, em relação ao objeto?",
                        verso: "O molde a partir do qual ele é criado.",
                    },
                    {
                        frente: "O que a criação do objeto reserva?",
                        verso: "O espaço em memória para os dados dele.",
                    },
                    {
                        frente: "O que cada objeto guarda separadamente?",
                        verso: "Os próprios valores dos atributos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o modificador privado protege?",
                        verso: "O atributo do acesso direto de fora.",
                    },
                    {
                        frente: "O que os métodos de acesso oferecem?",
                        verso: "Um caminho controlado para ler e alterar.",
                    },
                    {
                        frente: "Que ganho o encapsulamento traz?",
                        verso: "Permite mudar o interior sem quebrar quem usa.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que acontece com um objeto sem nenhuma referência apontando para ele?",
                        verso: "Deixa de existir, e o coletor de lixo recolhe a memória.",
                    },
                ],
            },
        },
        7: {
            2: {
                neutra: [
                    {
                        frente: "O que a sobrescrita substitui?",
                        verso: "A implementação herdada da superclasse.",
                    },
                    {
                        frente: "O que o polimorfismo permite?",
                        verso: "Tratar objetos diferentes pela mesma referência.",
                    },
                    {
                        frente: "Quem decide qual versão do método roda?",
                        verso: "O tipo real do objeto, em tempo de execução.",
                    },
                ],
            },
            1: {
                neutra: [
                    {
                        frente: "Que relação a herança modela?",
                        verso: "A de é um tipo de: o cachorro é um tipo de animal.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantas classes base e quantas interfaces uma classe pode ter?",
                        verso: "Uma classe base só, mas várias interfaces ao mesmo tempo.",
                    },
                ],
            },
        },
        8: {
            1: {
                neutra: [
                    {
                        frente: "Que vantagem a lista tem sobre o array?",
                        verso: "Cresce e encolhe conforme os elementos entram e saem.",
                    },
                    {
                        frente: "O que ela guarda por baixo?",
                        verso: "Um array, redimensionado quando necessário.",
                    },
                    {
                        frente: "Que operação custa mais numa lista?",
                        verso: "Inserir ou remover no meio.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o generic acrescenta à coleção?",
                        verso: "O tipo dos elementos, verificado na compilação.",
                    },
                    {
                        frente: "O que ele dispensa na leitura?",
                        verso: "A conversão manual de tipo.",
                    },
                    {
                        frente: "O que acontece ao tentar inserir o tipo errado?",
                        verso: "O compilador recusa.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que diferença separa exceção verificada da não verificada?",
                        verso: "A verificada precisa ser declarada ou tratada.",
                    },
                    {
                        frente: "O que o bloco final garante?",
                        verso: "Que aquele trecho roda de qualquer forma.",
                    },
                    {
                        frente: "O que capturar exceção genérica esconde?",
                        verso: "O erro real, misturado com o que era esperado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Um Map permite valores repetidos?",
                        verso: "Sim. Só as chaves precisam ser únicas.",
                    },
                ],
            },
        },
        9: {
            3: {
                neutra: [
                    {
                        frente: "O que a trilha deixa como base?",
                        verso: "A sintaxe e a orientação a objetos da linguagem.",
                    },
                    {
                        frente: "Que passo natural vem depois?",
                        verso: "Um framework ou um projeto próprio.",
                    },
                    {
                        frente: "Que hábito o fechamento reforça?",
                        verso: "Ler o erro do compilador antes de mudar o código.",
                    },
                ],
            },
            1: {
                neutra: [
                    {
                        frente: "Qual símbolo escreve uma lambda em Java?",
                        verso: "A seta ->, entre os parâmetros e o corpo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre operação intermediária e terminal numa stream?",
                        verso: "A intermediária encadeia e não roda; a terminal encerra e produz o resultado.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que a assinatura de um método declara?",
                        verso: "O nome, os parâmetros e o tipo de retorno.",
                    },
                    {
                        frente: "O que um método sem retorno declara?",
                        verso: "O tipo vazio.",
                    },
                    {
                        frente: "O que a chamada do método precisa respeitar?",
                        verso: "A ordem e o tipo dos parâmetros.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como o argumento chega ao método em Java?",
                        verso: "Por valor, sempre.",
                    },
                    {
                        frente: "O que muda quando o argumento é um objeto?",
                        verso: "A cópia é da referência, e o objeto pode ser alterado.",
                    },
                    {
                        frente: "O que o retorno faz com a execução?",
                        verso: "Encerra o método e devolve o valor.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a sobrecarga permite?",
                        verso: "Métodos de mesmo nome, com listas de parâmetros diferentes.",
                    },
                    {
                        frente: "O que não basta para diferenciar uma sobrecarga?",
                        verso: "Apenas o tipo de retorno.",
                    },
                    {
                        frente: "Até onde vai o escopo de uma variável local?",
                        verso: "Até o fim do bloco onde ela foi declarada.",
                    },
                ],
            },
        },
    },
};
