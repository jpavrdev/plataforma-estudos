import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Análise de Dados, trilha de NumPy e pandas.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra saída de código
 * e escolha de comando; as cartas ficam com os nomes de função, o que cada
 * parâmetro significa e as regras que a aula enuncia de passagem.
 *
 * A trilha aparece em mais de um roadmap, então o fechamento não crava
 * roadmap nem trilha seguinte.
 */
export const analiseDeDados: CartasDaTrilha = {
    trilha: "Análise de Dados",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que a sigla NumPy quer dizer, por extenso?",
                        verso: "Numerical Python, a base numérica do ecossistema.",
                    },
                    {
                        frente: "Que quatro funções criam array sem partir de lista?",
                        verso: "arange, zeros, ones e linspace, cada uma com seu formato.",
                    },
                    {
                        frente: "Que pontas o linspace inclui, e o que ele recebe?",
                        verso: "As duas pontas, mais a quantidade de pontos igualmente espaçados.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três custos o laço Python paga a cada iteração?",
                        verso: "Checar o tipo, decidir a operação e empacotar o resultado.",
                    },
                    {
                        frente: "Que garantia do array permite o laço compilado em C?",
                        verso: "Todo elemento ter o mesmo dtype, num bloco contíguo.",
                    },
                    {
                        frente: "Que operações a vetorização cobre além da soma?",
                        verso: "Multiplicação, divisão, potência e comparação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que ordem o NumPy compara os formatos no broadcasting?",
                        verso: "De trás para frente, casando as últimas dimensões.",
                    },
                    {
                        frente: "Que cópia o broadcasting evita fazer de verdade?",
                        verso: "A duplicação do dado menor para igualar o formato.",
                    },
                    {
                        frente: "Que caso mais simples de broadcasting já é comum?",
                        verso: "Um escalar somado a cada posição de um array.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que duas formas chamam a mesma agregação no NumPy?",
                        verso: "Como função do módulo ou como método do próprio array.",
                    },
                    {
                        frente: "O que a agregação devolve quando o axis é omitido?",
                        verso: "Um único número, resumindo o array inteiro.",
                    },
                    {
                        frente: "O que o axis igual a zero percorre, e o que devolve?",
                        verso: "Percorre as linhas e devolve um valor por coluna.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que ponta o fatiamento inclui, e qual ele exclui?",
                        verso: "Inclui o início e exclui o fim, como nas listas.",
                    },
                    {
                        frente: "Que forma idiomática indexa linha e coluna no NumPy?",
                        verso: "Os dois índices no mesmo colchete, separados por vírgula.",
                    },
                    {
                        frente: "Que cuidado combinar condições numa máscara exige?",
                        verso: "Parênteses em cada condição, unidas pelos operadores de array.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que três coisas o pandas soma ao array do NumPy?",
                        verso: "Rótulo de coluna, índice de linha e tipos misturados.",
                    },
                    {
                        frente: "Como um DataFrame se descreve em termos de Series?",
                        verso: "Várias Series lado a lado, com o mesmo índice.",
                    },
                    {
                        frente: "Que analogia a aula usa para o pandas ante o Excel?",
                        verso: "A planilha programada, com cada passo virando código.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que dois acessos uma Series oferece a cada valor?",
                        verso: "Pelo rótulo com loc e pela posição com iloc.",
                    },
                    {
                        frente: "O que uma Series tem que a lista Python não tem?",
                        verso: "O rótulo colado em cada valor, além da posição.",
                    },
                    {
                        frente: "Que operação aritmética numa Series preserva o original?",
                        verso: "Todas: elas devolvem uma Series nova, sem alterar a antiga.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que raciocínio cada forma de montar o DataFrame pede?",
                        verso: "Dict de listas pensa por coluna; lista de dicts, por linha.",
                    },
                    {
                        frente: "Que origens de dado chegam como lista de dicionários?",
                        verso: "O retorno de API em JSON e o resultado de um SELECT.",
                    },
                    {
                        frente: "Que resultado as duas portas de entrada produzem?",
                        verso: "Exatamente a mesma tabela no fim.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que método troca o índice por uma coluna existente?",
                        verso: "O set_index, exigindo valores únicos naquela coluna.",
                    },
                    {
                        frente: "Que dtype o pandas dá a uma coluna de texto?",
                        verso: "O object, enquanto números viram int64 ou float64.",
                    },
                    {
                        frente: "O que muda numa soma quando a coluna é object?",
                        verso: "Ela concatena o texto em vez de somar os valores.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que bateria de comandos abre toda análise nova?",
                        verso: "O shape, o head, o info e o describe, nessa ordem.",
                    },
                    {
                        frente: "Que estatísticas o describe traz de uma vez?",
                        verso: "Contagem, média, desvio, mínimo, quartis e máximo.",
                    },
                    {
                        frente: "Que informação só o info entrega sobre as colunas?",
                        verso: "O tipo e a contagem de valores não nulos de cada uma.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que a sigla CSV quer dizer, por extenso?",
                        verso: "Comma-separated values, valores separados por vírgula.",
                    },
                    {
                        frente: "Que outras duas funções de leitura o pandas traz?",
                        verso: "read_excel para planilhas e read_json para arquivos JSON.",
                    },
                    {
                        frente: "Que três coisas o read_csv já faz sozinho?",
                        verso: "Cria o índice, separa as colunas e converte os tipos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que arquivos brasileiros usam ponto e vírgula?",
                        verso: "A vírgula já serve de separador decimal no número.",
                    },
                    {
                        frente: "Que parâmetro ensina o pandas a reconhecer um ausente?",
                        verso: "O na_values, com a lista de marcadores do arquivo.",
                    },
                    {
                        frente: "Que três parâmetros ajustam cabeçalho e índice na leitura?",
                        verso: "O header, o names e o index_col do read_csv.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que quatro perguntas a inspeção inicial responde?",
                        verso: "Quanto tem, de que tipo é, o que falta e como os números se distribuem.",
                    },
                    {
                        frente: "Que pergunta o shape e o dtypes deixam sem resposta?",
                        verso: "Se falta dado: só o info mostra os valores não nulos.",
                    },
                    {
                        frente: "Que colunas o describe ignora ao resumir?",
                        verso: "As de texto; ele só resume as numéricas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Em que ordem o value_counts devolve a contagem?",
                        verso: "Do valor mais frequente para o menos frequente.",
                    },
                    {
                        frente: "Que método lista os valores distintos sem contá-los?",
                        verso: "O unique, que devolve só quais valores existem.",
                    },
                    {
                        frente: "Que tipo de coluna esses três métodos investigam?",
                        verso: "As categóricas, que o describe deixa de fora.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o to_csv grava por padrão além das colunas?",
                        verso: "O índice do DataFrame, como se fosse mais uma coluna.",
                    },
                    {
                        frente: "Que parâmetro do read_csv também existe na gravação?",
                        verso: "O sep, para gravar com outro separador de coluna.",
                    },
                    {
                        frente: "Que três passos formam o fluxo básico do módulo?",
                        verso: "Carregar com read_csv, inspecionar e salvar com to_csv.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que pergunta decide entre colchete simples e duplo?",
                        verso: "Se você quer uma coluna isolada ou um pedaço da tabela.",
                    },
                    {
                        frente: "Que erro duas colunas sem lista dentro do colchete geram?",
                        verso: "KeyError: o pandas procura uma coluna com aquele nome composto.",
                    },
                    {
                        frente: "Quando o atalho de ponto para uma coluna falha?",
                        verso: "Com espaço, começando por número ou batendo com um método.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que ponta do fatiamento o loc inclui, e o iloc não?",
                        verso: "A última: o loc inclui o fim e o iloc exclui.",
                    },
                    {
                        frente: "Que operação faz rótulo e posição deixarem de coincidir?",
                        verso: "Um sort_values ou um filtro, que reordenam as linhas.",
                    },
                    {
                        frente: "Que regra mental escolhe entre os dois seletores?",
                        verso: "Pensou num nome, loc; pensou numa posição, iloc.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que o and do Python quebra ao filtrar uma Series?",
                        verso: "Ele espera um booleano só, e a Series traz um por linha.",
                    },
                    {
                        frente: "Que precedência obriga os parênteses em cada condição?",
                        verso: "A do operador de conjunto, maior que a das comparações.",
                    },
                    {
                        frente: "Que método atalha várias igualdades encadeadas?",
                        verso: "O isin, que testa se o valor está numa lista de opções.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que papel a segunda coluna cumpre num sort_values?",
                        verso: "O de desempate, só decidindo quando a primeira empata.",
                    },
                    {
                        frente: "Que método devolve a ordem original do índice?",
                        verso: "O sort_index, útil depois de um sort_values.",
                    },
                    {
                        frente: "Que atalho evita inverter o ascending e cortar o topo?",
                        verso: "O nlargest e o nsmallest, que já pegam o top N.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que forma de criar coluna deve ser sempre a primeira?",
                        verso: "A vetorizada, que roda em C e é a mais rápida.",
                    },
                    {
                        frente: "O que acontece com um valor fora do dicionário do map?",
                        verso: "Ele vira NaN na Series resultante.",
                    },
                    {
                        frente: "Por que a atribuição encadeada não altera o original?",
                        verso: "O pedaço filtrado vira uma cópia independente na hora.",
                    },
                ],
            },
        },
    },
};
