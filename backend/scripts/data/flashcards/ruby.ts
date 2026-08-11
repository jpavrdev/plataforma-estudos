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
    },
};
