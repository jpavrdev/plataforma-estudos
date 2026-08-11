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
        3: {
            1: {
                neutra: [
                    {
                        frente: "Por que as barras do histograma ficam coladas?",
                        verso: "Elas representam faixas contínuas, não categorias soltas.",
                    },
                    {
                        frente: "Que agrupamento os dados contínuos exigem na contagem?",
                        verso: "Faixas de valores, porque cada valor exato quase não repete.",
                    },
                    {
                        frente: "O que a frequência relativa mostra além da contagem?",
                        verso: "A fatia do total que cada valor ocupa, em porcentagem.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que parte da distribuição dá nome à assimetria?",
                        verso: "A cauda longa, nunca a altura ou a posição do pico.",
                    },
                    {
                        frente: "Que três medidas coincidem numa simétrica de um pico só?",
                        verso: "A média, a mediana e a moda dão o mesmo valor.",
                    },
                    {
                        frente: "Como média e mediana se ordenam num skew negativo?",
                        verso: "A média fica abaixo da mediana, puxada pela cauda.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que outro nome a distribuição normal recebe?",
                        verso: "Curva do sino, ou bell curve, pelo formato dela.",
                    },
                    {
                        frente: "Que outro nome a regra 68-95-99.7 carrega?",
                        verso: "Regra empírica, válida para qualquer normal.",
                    },
                    {
                        frente: "Que tipo de dado a aula cita como não normal?",
                        verso: "A renda, que costuma ser assimétrica à direita.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que regra do IQR marca um valor como outlier?",
                        verso: "Ficar abaixo de Q1 menos 1,5 IQR ou acima de Q3 mais 1,5.",
                    },
                    {
                        frente: "Que corte de z-score também acusa um valor fora da curva?",
                        verso: "Passar de 3 ou ficar abaixo de menos 3.",
                    },
                    {
                        frente: "Que medida o outlier distorce ainda mais do que a média?",
                        verso: "O desvio padrão, que no exemplo saltou mais de seis vezes.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o sinal do z-score diz sobre o valor?",
                        verso: "Positivo fica acima da média; negativo, abaixo; zero é a média.",
                    },
                    {
                        frente: "Que comparação impossível o z-score torna possível?",
                        verso: "A de notas em escalas diferentes, na mesma régua.",
                    },
                    {
                        frente: "Como a regra empírica se escreve em z-score?",
                        verso: "68% entre menos 1 e 1, e 95% entre menos 2 e 2.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que duas visões de probabilidade a aula compara?",
                        verso: "A frequentista, que observa repetindo, e a teórica, que conta.",
                    },
                    {
                        frente: "O que um evento é, em relação ao espaço amostral?",
                        verso: "Um subconjunto dele, com os resultados que interessam.",
                    },
                    {
                        frente: "Que razão calcula a probabilidade teórica de um evento?",
                        verso: "Resultados favoráveis divididos pelo total de possíveis.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que fórmula dá a probabilidade de um evento não ocorrer?",
                        verso: "Um menos a probabilidade dele acontecer.",
                    },
                    {
                        frente: "Por que a regra da adição desconta a sobreposição?",
                        verso: "Sem isso, quem está nos dois grupos seria contado duas vezes.",
                    },
                    {
                        frente: "Quanto vale a interseção de dois eventos exclusivos?",
                        verso: "Zero, e por isso a soma direta já basta.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que expressão no enunciado denuncia evento dependente?",
                        verso: "Tirar sem devolver, porque o conjunto muda depois.",
                    },
                    {
                        frente: "Quanto vale tirar o mesmo número em dois dados?",
                        verso: "Um trinta e seis avos, menos de três por cento.",
                    },
                    {
                        frente: "Que conta o baralho exige ao tirar dois reis sem repor?",
                        verso: "Quatro em 52 vezes três em 51, com o baralho reduzido.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que fórmula define a probabilidade condicional?",
                        verso: "A da interseção dividida pela probabilidade do que se sabe.",
                    },
                    {
                        frente: "Que dois nomes a crença recebe antes e depois da evidência?",
                        verso: "A priori antes, a posteriori depois da atualização.",
                    },
                    {
                        frente: "Que erro clássico troca dois valores condicionais?",
                        verso: "Tomar a probabilidade de A dado B como a de B dado A.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que conta define o valor esperado de uma variável discreta?",
                        verso: "A soma de cada valor multiplicado pela probabilidade dele.",
                    },
                    {
                        frente: "Por que 3,5 não contradiz o valor esperado do dado?",
                        verso: "Ele é a média de longo prazo, não um resultado possível.",
                    },
                    {
                        frente: "Que distribuição o lançamento de um dado honesto segue?",
                        verso: "A uniforme, com a mesma chance para cada face.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que três motivos deixam a população fora de alcance?",
                        verso: "Custo e tempo, população em movimento e teste destrutivo.",
                    },
                    {
                        frente: "Que qualidade uma boa amostra precisa ter acima de tudo?",
                        verso: "Representar a população, e não apenas ser grande.",
                    },
                    {
                        frente: "Que comparação mostra que tamanho não basta?",
                        verso: "Quarenta bem sorteados vencem 40 mil escolhidos errado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que uma amostra enviesada ganha ao crescer de tamanho?",
                        verso: "Só mais confiança na conclusão errada, nunca correção.",
                    },
                    {
                        frente: "Que história clássica ilustra o viés de sobrevivência?",
                        verso: "A dos aviões que voltavam, analisados por Abraham Wald.",
                    },
                    {
                        frente: "Em que momento o viés deixa de ter conserto?",
                        verso: "Depois da coleta: nenhuma fórmula o corrige.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que erro a variabilidade amostral não indica?",
                        verso: "Nem falha de cálculo, nem viés: ela é natural.",
                    },
                    {
                        frente: "Como o tamanho da amostra afeta a oscilação da média?",
                        verso: "Amostra pequena varia mais; a maior aproxima as médias.",
                    },
                    {
                        frente: "Que população o dado representa nesse laboratório?",
                        verso: "A de todas as rolagens possíveis daquele dado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que a média de 30 rolagens dificilmente cai longe de 3,5?",
                        verso: "A maioria das rolagens teria de sair longe da média junto.",
                    },
                    {
                        frente: "Que propriedade torna uma amostra só útil para estimar?",
                        verso: "A concentração das médias amostrais perto do valor real.",
                    },
                    {
                        frente: "Que desvio padrão as médias tiveram ante as rolagens?",
                        verso: "0,31 contra 1,72 das rolagens individuais do dado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que condição o TCL dispensa nos dados originais?",
                        verso: "Que eles já sejam normais; basta a amostra crescer.",
                    },
                    {
                        frente: "Que fórmula calcula o erro padrão da média?",
                        verso: "O desvio padrão dividido pela raiz do tamanho da amostra.",
                    },
                    {
                        frente: "Quanto a amostra cresce para o erro cair à metade?",
                        verso: "Quatro vezes, porque a raiz de n está no denominador.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que limitação a estimativa pontual carrega?",
                        verso: "Ela não diz o quanto o palpite mudaria com outra amostra.",
                    },
                    {
                        frente: "Que nome a faixa de valores plausíveis recebe?",
                        verso: "Intervalo de confiança, a chamada estimativa intervalar.",
                    },
                    {
                        frente: "Por que três amostras dão três médias sem nenhuma errar?",
                        verso: "A variabilidade amostral é natural, e todas são válidas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que valor crítico o intervalo de 95% usa?",
                        verso: "Aproximadamente 1,96, multiplicando o erro padrão.",
                    },
                    {
                        frente: "De que a confiança de 95% é propriedade, afinal?",
                        verso: "Do procedimento repetido, não do intervalo já calculado.",
                    },
                    {
                        frente: "O que acontece com o intervalo ao pedir 99% de confiança?",
                        verso: "Ele fica mais largo; amostra maior é que o estreita.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o teste nunca consegue provar sobre H0?",
                        verso: "Que ela é verdadeira; ela só deixa de ser rejeitada.",
                    },
                    {
                        frente: "Que analogia jurídica descreve a lógica do teste?",
                        verso: "A presunção de inocência, com H0 valendo até prova.",
                    },
                    {
                        frente: "Que diferença separa teste bicaudal de unicaudal?",
                        verso: "O bicaudal testa qualquer diferença; o unicaudal, uma direção.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Sob que suposição o p-valor é calculado?",
                        verso: "Assumindo H0 verdadeira, do começo ao fim da conta.",
                    },
                    {
                        frente: "Que três leituras o p-valor não sustenta?",
                        verso: "Chance de H0 ser verdade, prova de H1 e tamanho do efeito.",
                    },
                    {
                        frente: "Quando o nível de significância deve ser escolhido?",
                        verso: "Antes de rodar o teste, com 0,05 como convenção.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que probabilidade corresponde exatamente ao erro tipo I?",
                        verso: "O alfa escolhido para o teste, 5% quando vale 0,05.",
                    },
                    {
                        frente: "Que nome tem a chance de detectar um efeito que existe?",
                        verso: "O poder do teste, igual a um menos o beta.",
                    },
                    {
                        frente: "Por que amostra grande exige olhar o tamanho de efeito?",
                        verso: "Ela detecta até diferença trivial, sem valor prático.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que outro nome o diagrama de dispersão carrega?",
                        verso: "Scatter plot, com um ponto por observação.",
                    },
                    {
                        frente: "Que três padrões a direção de uma relação admite?",
                        verso: "Positiva, negativa e a ausência de relação aparente.",
                    },
                    {
                        frente: "O que a direção sozinha ainda não responde?",
                        verso: "O quanto as variáveis andam juntas, que é a força.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que medida serve de matéria-prima para a correlação?",
                        verso: "A covariância, média dos produtos dos desvios.",
                    },
                    {
                        frente: "Que defeito da covariância a correlação corrige?",
                        verso: "A escala presa à unidade, que impedia comparar pares.",
                    },
                    {
                        frente: "Que tipo de relação forte o r de Pearson não enxerga?",
                        verso: "A curva, como o arco de desempenho ao longo da vida.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três motivos quebram o elo entre correlação e causa?",
                        verso: "Coincidência espúria, variável de confusão e causa reversa.",
                    },
                    {
                        frente: "Que exemplo a aula dá de causalidade reversa?",
                        verso: "Exercício e depressão: sentir-se melhor pode vir antes.",
                    },
                    {
                        frente: "Que palavra torna o experimento controlado uma prova?",
                        verso: "Aleatoriamente: o sorteio equilibra os dois grupos.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que nome a distância vertical até a reta recebe?",
                        verso: "Resíduo, a diferença entre o y real e o previsto.",
                    },
                    {
                        frente: "Que dois nomes separam prever dentro e fora da faixa?",
                        verso: "Interpolar dentro do observado e extrapolar fora dele.",
                    },
                    {
                        frente: "Que valor a reta previu para 10 horas, e por que assusta?",
                        verso: "Nota 10,35, impossível numa prova que vai só até 10.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que arco a trilha inteira percorre, de ponta a ponta?",
                        verso: "De descrever uma pilha de números a prever um ainda não visto.",
                    },
                    {
                        frente: "Que papel cada bloco cumpre no fio condutor da trilha?",
                        verso: "Descritiva resume, probabilidade modela e a inferência generaliza.",
                    },
                    {
                        frente: "Que ganho a aula chama de maior do que decorar fórmula?",
                        verso: "A desconfiança treinada diante de qualquer número pronto.",
                    },
                ],
            },
        },
    },
};
