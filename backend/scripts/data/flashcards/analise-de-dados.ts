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
    },
};
