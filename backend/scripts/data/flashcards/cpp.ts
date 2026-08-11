import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de C++, segunda trilha do roadmap de C++ e Baixo Nível.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra saída de código
 * e escolha de construção; as cartas guardam os nomes próprios, as listas
 * fechadas e os detalhes que a aula enuncia de passagem.
 */
export const cpp: CartasDaTrilha = {
    trilha: "C++",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quem criou o C++, e em que década?",
                        verso: "Bjarne Stroustrup, nos anos 1980, estendendo o C.",
                    },
                    {
                        frente: "Que duas etapas o build de um programa percorre?",
                        verso: "O compilador traduz e o linker junta as bibliotecas.",
                    },
                    {
                        frente: "Que duas peças não existem entre o código e o hardware?",
                        verso: "A máquina virtual e o coletor de lixo automático.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o main devolve, e o que o zero significa?",
                        verso: "Um int ao sistema; o zero indica sucesso na execução.",
                    },
                    {
                        frente: "Que operador o cin usa para ler do usuário?",
                        verso: "O de extração, escrito com dois sinais de maior.",
                    },
                    {
                        frente: "O que o endl faz além de aparecer no fim da linha?",
                        verso: "Ele pula uma linha na saída padrão.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que projetos grandes evitam o using namespace?",
                        verso: "Ele traz tudo e pode causar colisão difícil de rastrear.",
                    },
                    {
                        frente: "Em que tipo de programa o using costuma ser aceito?",
                        verso: "Nos pequenos e de estudo, onde a colisão é improvável.",
                    },
                    {
                        frente: "Que namespace a biblioteca padrão do C++ ocupa?",
                        verso: "O std, onde vivem o cout, o cin e o endl.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que forma geral a declaração de variável segue?",
                        verso: "Tipo, nome e o valor inicial, nessa ordem.",
                    },
                    {
                        frente: "Que cabeçalho o texto exige, e o que ele substitui?",
                        verso: "O string, no lugar dos arrays de caractere herdados do C.",
                    },
                    {
                        frente: "Que duas coisas o tipo define sobre a variável?",
                        verso: "Que valores ela guarda e quanto espaço ela ocupa.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Desde que versão o auto existe, e o que ele não muda?",
                        verso: "Desde o C++11; o tipo continua estático e fixo.",
                    },
                    {
                        frente: "Onde o auto é mais útil no dia a dia?",
                        verso: "Com tipos longos, como os iteradores da biblioteca.",
                    },
                    {
                        frente: "O que o static_cast faz ao converter double para int?",
                        verso: "Trunca a parte decimal, sem arredondar o valor.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três famílias de operador a aula lista?",
                        verso: "Os aritméticos, os relacionais e os lógicos.",
                    },
                    {
                        frente: "Que mudança faz 7 dividido por 2 dar 3,5?",
                        verso: "Um dos operandos precisa ser double na conta.",
                    },
                    {
                        frente: "Que atalhos combinam operação e atribuição?",
                        verso: "O mais igual e os equivalentes de menos, vezes e divisão.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que nome o comportamento de cair no próximo case tem?",
                        verso: "Fall-through, causado por esquecer o break.",
                    },
                    {
                        frente: "Que tipos de valor o switch aceita comparar?",
                        verso: "Um inteiro ou um caractere, não qualquer expressão.",
                    },
                    {
                        frente: "Que cláusula do switch cobre os casos restantes?",
                        verso: "O default, executado quando nenhum case casa.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que dois comandos controlam o fluxo dentro do laço?",
                        verso: "O break, que interrompe, e o continue, que pula a volta.",
                    },
                    {
                        frente: "Que garantia o while não dá sobre o bloco?",
                        verso: "Que ele rode ao menos uma vez, se a condição já for falsa.",
                    },
                    {
                        frente: "Que cuidado evita o laço infinito?",
                        verso: "Garantir que algo avance em direção ao fim da condição.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três partes o for clássico reúne numa linha?",
                        verso: "A inicialização, a condição e o passo de cada volta.",
                    },
                    {
                        frente: "Que forma percorre sem copiar cada elemento?",
                        verso: "A referência constante no range-based for.",
                    },
                    {
                        frente: "Desde que versão o range-based for existe?",
                        verso: "Desde o C++11, lendo como para cada elemento em.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que tipo de retorno uma função sem devolução declara?",
                        verso: "O void, dizendo que ela não entrega nenhum valor.",
                    },
                    {
                        frente: "Que duas formas atendem à exigência de declarar antes?",
                        verso: "Definir acima do main ou declarar um protótipo no topo.",
                    },
                    {
                        frente: "Que custo a passagem por valor cobra em objeto grande?",
                        verso: "A cópia inteira, que pesa no desempenho do programa.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que metáfora descreve o que uma referência é?",
                        verso: "Um apelido para a própria variável de quem chamou.",
                    },
                    {
                        frente: "Que forma idiomática passa objeto grande só de leitura?",
                        verso: "A referência constante, sem cópia e sem permissão de mudar.",
                    },
                    {
                        frente: "O que o compilador impede numa referência constante?",
                        verso: "Qualquer alteração do objeto dentro da função.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que os parâmetros precisam diferir na sobrecarga?",
                        verso: "No número ou no tipo, para o compilador escolher.",
                    },
                    {
                        frente: "Onde os parâmetros com valor padrão devem ficar?",
                        verso: "Por último, depois dos que não têm padrão.",
                    },
                    {
                        frente: "Como o compilador decide qual sobrecarga chamar?",
                        verso: "Pelos argumentos usados naquela chamada.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que dois operadores fazem a ponte com o ponteiro?",
                        verso: "O de endereço e o de desreferência do valor apontado.",
                    },
                    {
                        frente: "O que acontece ao desreferenciar um ponteiro nulo?",
                        verso: "Erro grave, que costuma travar o programa na hora.",
                    },
                    {
                        frente: "Que valor o C++ moderno dá a um ponteiro sem destino?",
                        verso: "O nullptr, deixando explícito que ele não aponta.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que duas regiões de memória o programa usa?",
                        verso: "A stack das locais e a heap alocada sob seu controle.",
                    },
                    {
                        frente: "Que regra a alocação na heap impõe ao programador?",
                        verso: "Para cada new deve existir um delete correspondente.",
                    },
                    {
                        frente: "Que vantagem a stack tem sobre a heap?",
                        verso: "É rápida e libera as variáveis locais sozinha.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que efeito o vazamento tem num programa de vida longa?",
                        verso: "Ele consome memória cada vez maior até o fim.",
                    },
                    {
                        frente: "O que o ponteiro guarda depois de um delete?",
                        verso: "O endereço antigo, que já não pertence a ele.",
                    },
                    {
                        frente: "Que duas técnicas modernas dispensam new e delete?",
                        verso: "Os smart pointers e o RAII, que liberam sozinhos.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que três especificadores de acesso a classe tem?",
                        verso: "O public, o private e o protected das subclasses.",
                    },
                    {
                        frente: "Que diferença separa class de struct em C++?",
                        verso: "O padrão de acesso: private na class, public na struct.",
                    },
                    {
                        frente: "Que dois tipos de membro uma classe agrupa?",
                        verso: "Os atributos com o dado e os métodos com o comportamento.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que duas marcas identificam um construtor?",
                        verso: "O nome da classe e a ausência de tipo de retorno.",
                    },
                    {
                        frente: "Em que dois momentos o destrutor pode rodar?",
                        verso: "Ao sair de escopo na stack ou no delete da heap.",
                    },
                    {
                        frente: "Que par de métodos sustenta o RAII?",
                        verso: "O construtor que adquire e o destrutor que libera.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o const escrito depois do método promete?",
                        verso: "Que ele não altera o objeto ao ser executado.",
                    },
                    {
                        frente: "Que garantia o RAII mantém mesmo com erro no meio?",
                        verso: "O destrutor roda e libera o recurso do mesmo jeito.",
                    },
                    {
                        frente: "Que arranjo prático o encapsulamento produz na classe?",
                        verso: "Atributo privado com método público impondo as regras.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que relação a herança modela entre as classes?",
                        verso: "Um é um tipo de: o gato é um tipo de animal.",
                    },
                    {
                        frente: "Que recurso de herança o C++ permite e outras não?",
                        verso: "A múltipla, herdando de mais de uma base.",
                    },
                    {
                        frente: "Que risco a herança múltipla traz junto?",
                        verso: "Ambiguidades quando as bases têm o mesmo membro.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que palavra na derivada o compilador confere?",
                        verso: "O override, marcando que sobrescreve um método virtual.",
                    },
                    {
                        frente: "Sem o virtual, quando a versão chamada é decidida?",
                        verso: "Em tempo de compilação, pelo tipo do ponteiro.",
                    },
                    {
                        frente: "Que liberdade o polimorfismo dá a quem escreve o código?",
                        verso: "Trabalhar com a base sem saber o tipo exato do objeto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como um método virtual puro é declarado?",
                        verso: "Sem corpo, recebendo igual a zero na declaração.",
                    },
                    {
                        frente: "Que papel a classe abstrata cumpre para as derivadas?",
                        verso: "Serve de contrato que elas são obrigadas a implementar.",
                    },
                    {
                        frente: "O que falta ao deletar pela base sem destrutor virtual?",
                        verso: "O destrutor da derivada não roda, e o recurso vaza.",
                    },
                ],
            },
        },
        8: {
            1: {
                neutra: [
                    {
                        frente: "O que a sigla STL quer dizer, por extenso?",
                        verso: "Standard Template Library, com estruturas e algoritmos.",
                    },
                    {
                        frente: "Que três formas de uso o vector oferece de imediato?",
                        verso: "O push_back, o size e o acesso por índice.",
                    },
                    {
                        frente: "Que padrão o vector segue ao gerenciar a memória?",
                        verso: "O RAII, alocando e liberando sem new nem delete.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que dois métodos delimitam a varredura por iterador?",
                        verso: "O begin, no primeiro, e o end, marcando o fim.",
                    },
                    {
                        frente: "Como o valor de um iterador é acessado?",
                        verso: "Desreferenciando, do mesmo jeito que um ponteiro.",
                    },
                    {
                        frente: "O que o range-based for esconde de quem escreve?",
                        verso: "O iterador, fazendo o mesmo com menos código.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que declaração abre um template de função?",
                        verso: "A palavra template com o tipo genérico entre sinais.",
                    },
                    {
                        frente: "Que desempenho o template especializado mantém?",
                        verso: "O de código escrito à mão para cada tipo usado.",
                    },
                    {
                        frente: "Que parte da biblioteca padrão os templates sustentam?",
                        verso: "A STL inteira, genérica e eficiente ao mesmo tempo.",
                    },
                ],
            },
        },
        9: {
            1: {
                neutra: [
                    {
                        frente: "Que cabeçalho traz os smart pointers?",
                        verso: "O memory, com o unique_ptr e o shared_ptr.",
                    },
                    {
                        frente: "Que função cria um unique_ptr no C++ moderno?",
                        verso: "O make_unique, com o valor inicial entre parênteses.",
                    },
                    {
                        frente: "Quando o shared_ptr libera o recurso guardado?",
                        verso: "Quando o último dono some, pela contagem de referências.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que duas formas de captura a lambda aceita?",
                        verso: "Por cópia com o nome e por referência com o e comercial.",
                    },
                    {
                        frente: "Que recurso o std::move oferece no C++ moderno?",
                        verso: "Transferir recursos entre objetos em vez de copiar.",
                    },
                    {
                        frente: "Onde as lambdas mais brilham na biblioteca?",
                        verso: "Nos algoritmos da STL, como critério de ordenação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que projetos pequenos a aula sugere para praticar?",
                        verso: "Uma agenda com classes, uma calculadora e formas.",
                    },
                    {
                        frente: "Que três caminhos naturais a aula aponta depois?",
                        verso: "Aprofundar a STL, o movimento e áreas como jogos.",
                    },
                    {
                        frente: "Que assunto avançado fecha a lista de próximos passos?",
                        verso: "A semântica de movimento com as referências rvalue.",
                    },
                ],
            },
        },
    },
};
