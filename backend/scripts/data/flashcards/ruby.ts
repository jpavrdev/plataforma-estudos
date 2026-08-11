import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Ruby, trilha sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * código; as cartas guardam as convenções da linguagem, as regras práticas
 * e as armadilhas que a aula enuncia de passagem.
 */
export const ruby: CartasDaTrilha = {
    trilha: "Ruby",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que características definem o Ruby?",
                        verso: "Interpretada, de tipagem dinâmica e forte.",
                    },
                    {
                        frente: "Quanto do Ruby é orientado a objetos?",
                        verso: "Tudo: até um número é objeto.",
                    },
                    {
                        frente: "O que a tipagem forte impede?",
                        verso: "Conversão silenciosa entre tipos incompatíveis.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o irb oferece?",
                        verso: "Um console interativo para experimentar código.",
                    },
                    {
                        frente: "Que extensão um arquivo Ruby usa?",
                        verso: "A extensão rb.",
                    },
                    {
                        frente: "Como um script é executado?",
                        verso: "Pelo interpretador, apontando para o arquivo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que até os números têm em Ruby?",
                        verso: "Métodos, como qualquer objeto.",
                    },
                    {
                        frente: "O que uma classe é, nessa lógica?",
                        verso: "Também um objeto.",
                    },
                    {
                        frente: "O que essa uniformidade permite?",
                        verso: "Chamar método em qualquer valor.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Como uma constante é escrita?",
                        verso: "Começando com letra maiúscula.",
                    },
                    {
                        frente: "O que acontece ao reatribuir uma constante?",
                        verso: "O Ruby avisa, mas permite.",
                    },
                    {
                        frente: "Que prefixo marca uma variável de instância?",
                        verso: "O arroba.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o operador de aproximação aceita?",
                        verso: "Atualizações de correção, mas não de versão maior.",
                    },
                    {
                        frente: "O que entra numa faixa escrita com três números?",
                        verso: "Só as correções do último nível.",
                    },
                    {
                        frente: "O que o Gemfile declara?",
                        verso: "As dependências do projeto e suas faixas de versão.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que diferença separa inteiro de decimal em Ruby?",
                        verso: "O decimal carrega fração e o erro de arredondamento.",
                    },
                    {
                        frente: "O que a interpolação faz numa string?",
                        verso: "Insere o valor de uma expressão dentro do texto.",
                    },
                    {
                        frente: "Que aspas permitem interpolação?",
                        verso: "As duplas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que regra prática separa String de Symbol?",
                        verso: "Dado de fora é String; rótulo do seu código é Symbol.",
                    },
                    {
                        frente: "O que um símbolo é, na memória?",
                        verso: "Um valor único, reaproveitado a cada uso.",
                    },
                    {
                        frente: "Onde os símbolos aparecem mais?",
                        verso: "Como chaves de hash e nomes de método.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que um array guarda?",
                        verso: "Uma lista ordenada de objetos, de tipos quaisquer.",
                    },
                    {
                        frente: "O que o índice negativo acessa?",
                        verso: "As posições contadas do fim para o começo.",
                    },
                    {
                        frente: "O que acontece ao acessar índice inexistente?",
                        verso: "Devolve nulo, sem erro.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que método usar quando a chave do hash é obrigatória?",
                        verso: "O de busca que falha, e não os colchetes.",
                    },
                    {
                        frente: "O que os colchetes devolvem para chave ausente?",
                        verso: "Nulo.",
                    },
                    {
                        frente: "Por que isso é perigoso?",
                        verso: "O erro só aparece muito depois.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que um range representa?",
                        verso: "Um intervalo entre dois valores.",
                    },
                    {
                        frente: "Que diferença os dois pontos e os três pontos marcam?",
                        verso: "Incluir ou excluir o limite final.",
                    },
                    {
                        frente: "O que mudou com o Set na versão 4?",
                        verso: "Passou a fazer parte do núcleo da linguagem.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Com que condição usar a negação invertida?",
                        verso: "Só com condição simples.",
                    },
                    {
                        frente: "No que ela vira com operadores lógicos?",
                        verso: "Num quebra-cabeça para quem lê depois.",
                    },
                    {
                        frente: "O que um condicional devolve em Ruby?",
                        verso: "O valor da última expressão avaliada.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o case compara em cada cláusula?",
                        verso: "Se o valor se encaixa naquele padrão.",
                    },
                    {
                        frente: "O que o pattern matching consegue além de comparar?",
                        verso: "Desestruturar arrays e hashes na própria condição.",
                    },
                    {
                        frente: "O que acontece se nenhum padrão casar?",
                        verso: "O ramo padrão responde, ou um erro é lançado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o Ruby prefere ao laço com índice?",
                        verso: "O iterador, que percorre a coleção.",
                    },
                    {
                        frente: "O que o iterador recebe?",
                        verso: "Um bloco, executado para cada elemento.",
                    },
                    {
                        frente: "Que ganho o iterador traz sobre o laço manual?",
                        verso: "Menos controle de índice e menos erro de borda.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que um bloco é, na prática?",
                        verso: "Um trecho de código passado para um método.",
                    },
                    {
                        frente: "O que o yield faz dentro do método?",
                        verso: "Chama o bloco que foi passado.",
                    },
                    {
                        frente: "O que o bloco explícito permite?",
                        verso: "Guardar o bloco numa variável e repassá-lo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que conselho a aula dá na dúvida entre os dois?",
                        verso: "Usar lambda.",
                    },
                    {
                        frente: "O que o lambda faz com a quantidade de argumentos?",
                        verso: "Exige o número exato.",
                    },
                    {
                        frente: "Como o retorno se comporta no lambda?",
                        verso: "Volta do próprio lambda, como se espera.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que o mapeamento devolve?",
                        verso: "Uma coleção nova, do mesmo tamanho.",
                    },
                    {
                        frente: "O que a seleção devolve?",
                        verso: "Só os elementos que passaram no teste.",
                    },
                    {
                        frente: "O que a redução devolve?",
                        verso: "Um valor único, acumulado a cada passo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um método devolve sem retorno explícito?",
                        verso: "O valor da última expressão.",
                    },
                    {
                        frente: "O que um argumento com valor padrão permite?",
                        verso: "Chamar o método sem passar aquele valor.",
                    },
                    {
                        frente: "O que o operador de espalhamento faz nos argumentos?",
                        verso: "Recolhe os restantes num array.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Até quantos argumentos usar a forma posicional?",
                        verso: "Até dois.",
                    },
                    {
                        frente: "A partir de quantos usar os nomeados?",
                        verso: "De três em diante.",
                    },
                    {
                        frente: "O que compensa a digitação a mais?",
                        verso: "O ganho de leitura na chamada.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a interrogação no fim do nome indica?",
                        verso: "Que o método devolve verdadeiro ou falso.",
                    },
                    {
                        frente: "O que a exclamação indica?",
                        verso: "A versão perigosa, que altera o objeto ou levanta erro.",
                    },
                    {
                        frente: "O que essas convenções são?",
                        verso: "Combinação da comunidade, e não regra da linguagem.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o encadeamento monta?",
                        verso: "Uma sequência de transformações, uma alimentando a outra.",
                    },
                    {
                        frente: "Que cuidado o encadeamento longo pede?",
                        verso: "Quebrar em passos nomeados quando fica ilegível.",
                    },
                    {
                        frente: "O que cada elo do encadeamento devolve?",
                        verso: "Uma coleção nova, sem alterar a anterior.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Quando o método de inicialização é chamado?",
                        verso: "Ao criar a instância.",
                    },
                    {
                        frente: "Como um método privado não pode ser chamado?",
                        verso: "Com receptor explícito.",
                    },
                    {
                        frente: "Que exceção essa regra tem?",
                        verso: "A atribuição, que aceita o receptor.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o leitor de atributo gera?",
                        verso: "O método que devolve o valor.",
                    },
                    {
                        frente: "O que o escritor gera?",
                        verso: "O método que define o valor.",
                    },
                    {
                        frente: "O que o acessor faz?",
                        verso: "Gera os dois de uma vez.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a chamada ao pai faz sem argumentos?",
                        verso: "Repassa os mesmos argumentos recebidos.",
                    },
                    {
                        frente: "O que ela faz com parênteses vazios?",
                        verso: "Chama o método do pai sem passar nada.",
                    },
                    {
                        frente: "Quantas classes uma classe pode herdar?",
                        verso: "Uma só.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que dois papéis um módulo cumpre?",
                        verso: "Espaço de nomes e mistura de comportamento.",
                    },
                    {
                        frente: "O que a mistura acrescenta à classe?",
                        verso: "Os métodos do módulo, como se fossem dela.",
                    },
                    {
                        frente: "O que o módulo não pode fazer?",
                        verso: "Ser instanciado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o duck typing observa no objeto?",
                        verso: "O que ele sabe fazer, e não a classe dele.",
                    },
                    {
                        frente: "O que o módulo de comparação pede da classe?",
                        verso: "Um método que compare dois objetos.",
                    },
                    {
                        frente: "O que o módulo de enumeração pede?",
                        verso: "Um método que percorre os elementos.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "O que o bloco de garantia faz?",
                        verso: "Roda sempre, com ou sem exceção.",
                    },
                    {
                        frente: "O que o resgate captura?",
                        verso: "A exceção lançada dentro do bloco.",
                    },
                    {
                        frente: "Que exceção evitar capturar de forma ampla?",
                        verso: "A raiz da hierarquia, que engole tudo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "De onde uma exceção própria deve herdar?",
                        verso: "Da classe de erro padrão da aplicação.",
                    },
                    {
                        frente: "Que ganho uma hierarquia própria traz?",
                        verso: "Capturar por família, sem listar cada erro.",
                    },
                    {
                        frente: "O que o nome da exceção deve dizer?",
                        verso: "O que deu errado, no vocabulário do domínio.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o Minitest traz por padrão?",
                        verso: "Um framework de teste simples, já na biblioteca padrão.",
                    },
                    {
                        frente: "Que estilo ele usa?",
                        verso: "Asserções dentro de métodos de teste.",
                    },
                    {
                        frente: "O que um teste precisa deixar claro?",
                        verso: "O que se esperava e o que aconteceu.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que estilo o RSpec usa?",
                        verso: "O de especificação, descrevendo comportamento.",
                    },
                    {
                        frente: "O que um bloco de descrição agrupa?",
                        verso: "Os exemplos de um mesmo comportamento.",
                    },
                    {
                        frente: "O que a expectativa declara?",
                        verso: "O resultado esperado, em linguagem quase natural.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o RuboCop verifica?",
                        verso: "Estilo e padrões do código.",
                    },
                    {
                        frente: "O que ele consegue corrigir sozinho?",
                        verso: "Boa parte dos desvios de formatação.",
                    },
                    {
                        frente: "Que ferramenta ajuda a investigar em execução?",
                        verso: "O depurador da própria linguagem.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que uma versão maior costuma trazer junto?",
                        verso: "Recursos novos e mudanças que podem quebrar código.",
                    },
                    {
                        frente: "Onde conferir o que mudou?",
                        verso: "Nas notas de versão da linguagem.",
                    },
                    {
                        frente: "Que cuidado a atualização pede?",
                        verso: "Rodar a suíte de testes antes de adotar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um compilador em tempo de execução faz?",
                        verso: "Traduz o código mais usado para instruções nativas.",
                    },
                    {
                        frente: "Que ganho ele busca?",
                        verso: "Menos tempo de execução no trecho quente.",
                    },
                    {
                        frente: "Que custo ele traz?",
                        verso: "Mais memória e tempo de aquecimento.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que uma thread compartilha?",
                        verso: "A mesma memória do processo.",
                    },
                    {
                        frente: "O que uma fiber permite?",
                        verso: "Pausar e retomar a execução de forma cooperativa.",
                    },
                    {
                        frente: "O que um ractor isola?",
                        verso: "A memória, permitindo paralelismo real.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o Ruby::Box isola?",
                        verso: "Definições, alterações em classes e variáveis globais.",
                    },
                    {
                        frente: "Que estágio ele tem na versão 4?",
                        verso: "Experimental.",
                    },
                    {
                        frente: "O que isso implica para quem adota?",
                        verso: "A interface ainda pode mudar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o projeto final exercita?",
                        verso: "As decisões da trilha num programa inteiro.",
                    },
                    {
                        frente: "Que hábito a trilha deixa?",
                        verso: "Código legível, com testes e ferramenta de estilo.",
                    },
                    {
                        frente: "Para onde seguir depois?",
                        verso: "Para um framework ou para as bibliotecas do ecossistema.",
                    },
                ],
            },
        },
    },
};
