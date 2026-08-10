import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Estatística e Probabilidade, terceira trilha do roadmap de
 * Ciência de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o cálculo e a
 * leitura do cenário; as cartas guardam as definições fechadas, os nomes
 * próprios de cada medida e as regras que a aula enuncia de passagem.
 */
export const estatisticaEProbabilidade: CartasDaTrilha = {
    trilha: "Estatística e Probabilidade",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que quatro ações a estatística estuda sobre os dados?",
                        verso: "Coletar, organizar, resumir e interpretar sob incerteza.",
                    },
                    {
                        frente: "Que peso a conclusão inferencial carrega que a descritiva não?",
                        verso: "A incerteza, porque ela vai além dos dados observados.",
                    },
                    {
                        frente: "Que erro comum a distinção entre os dois ramos evita?",
                        verso: "Tratar conclusão de amostra como fato sobre todo mundo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que quatro motivos justificam trabalhar com amostra?",
                        verso: "Tamanho, tempo, praticidade e a população que muda o tempo todo.",
                    },
                    {
                        frente: "Que exemplo mostra a medição destruindo a população?",
                        verso: "Testar a duração das lâmpadas queimaria todas elas.",
                    },
                    {
                        frente: "Que ponte a estatística faz entre amostra e população?",
                        verso: "Ela estima o parâmetro desconhecido a partir da amostra.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que operação de origem separa discreta de contínua?",
                        verso: "A discreta vem de contagem; a contínua, de medição.",
                    },
                    {
                        frente: "Que medidas fazem sentido numa variável nominal?",
                        verso: "Só a frequência de cada categoria e a moda.",
                    },
                    {
                        frente: "O que a variável ordinal permite, e o que ainda proíbe?",
                        verso: "Permite ordenar e achar a mediana; proíbe a média.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que outros dois nomes uma observação recebe?",
                        verso: "Registro e instância, sinônimos de linha na tabela.",
                    },
                    {
                        frente: "Que estrutura de Python já espelha essa tabela?",
                        verso: "A lista de dicionários: cada chave vira uma coluna.",
                    },
                    {
                        frente: "Que estrutura do pandas representa essa mesma tabela?",
                        verso: "O DataFrame, com as mesmas linhas e colunas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que cinco etapas um projeto de ciência de dados percorre?",
                        verso: "Coleta, exploração, hipótese, modelagem e comunicação.",
                    },
                    {
                        frente: "Que risco a coleta carrega se a amostragem for descuidada?",
                        verso: "Começar o projeto inteiro com dados enviesados.",
                    },
                    {
                        frente: "O que duas turmas de média parecida ainda podem esconder?",
                        verso: "Variações bem diferentes entre os valores de cada uma.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que nome um valor bem destoante do conjunto recebe?",
                        verso: "Outlier, capaz de puxar a média inteira para perto dele.",
                    },
                    {
                        frente: "Por que usar todo valor é força e fraqueza da média?",
                        verso: "Ninguém fica de fora, mas o destoante pesa como um comum.",
                    },
                    {
                        frente: "Que método do pandas calcula a média de uma coluna?",
                        verso: "O mean, aplicado direto na coluna inteira.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como se calcula a mediana quando a contagem é par?",
                        verso: "Pela média dos dois valores que ficam no meio da lista.",
                    },
                    {
                        frente: "Quantas modas um conjunto pode ter?",
                        verso: "Nenhuma, uma ou várias, se houver empate de frequência.",
                    },
                    {
                        frente: "Com que dados a moda se destaca das outras medidas?",
                        verso: "Com os categóricos, onde média e mediana não valem.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantos valores a amplitude olha, e quantos ela ignora?",
                        verso: "Olha só os dois extremos e ignora todo o resto.",
                    },
                    {
                        frente: "Que fragilidade um único valor extremo expõe na amplitude?",
                        verso: "Ele muda a medida inteira mesmo com o resto igual.",
                    },
                    {
                        frente: "Que papel a amplitude cumpre bem, apesar do limite?",
                        verso: "O de primeiro sinal de dispersão, nunca o de palavra final.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quanto sempre dá a soma dos desvios em torno da média?",
                        verso: "Zero, porque acima e abaixo se compensam exatamente.",
                    },
                    {
                        frente: "Que dois problemas elevar o desvio ao quadrado resolve?",
                        verso: "Impede o cancelamento e faz o desvio grande pesar mais.",
                    },
                    {
                        frente: "Que conta separa a variância do desvio padrão?",
                        verso: "A raiz quadrada, que devolve a unidade original.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como se acham Q1 e Q3 partindo da mediana?",
                        verso: "Tomando a mediana de cada metade, sem contar a central.",
                    },
                    {
                        frente: "Que cinco números resumem um conjunto por completo?",
                        verso: "Mínimo, Q1, mediana, Q3 e máximo do conjunto.",
                    },
                    {
                        frente: "Que desenho os cinco números produzem, peça por peça?",
                        verso: "O boxplot: caixa de Q1 a Q3, mediana dentro e whiskers.",
                    },
                ],
            },
        },
    },
};
