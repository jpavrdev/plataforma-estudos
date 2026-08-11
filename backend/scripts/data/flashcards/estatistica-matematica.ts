import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Estatística Matemática, sétima trilha do roadmap de Matemática.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a conta feita;
 * as cartas guardam as definições fechadas, os nomes das distribuições e
 * as condições que a aula enuncia de passagem.
 *
 * As fórmulas vão por extenso, em palavras: a carta é lida no verso curto
 * do baralho, sem a renderização de LaTeX que as aulas usam.
 */
export const estatisticaMatematica: CartasDaTrilha = {
    trilha: "Estatística Matemática",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que o espaço amostral reúne?",
                        verso: "Todos os resultados possíveis do experimento.",
                    },
                    {
                        frente: "Que trabalho vem antes de calcular a probabilidade?",
                        verso: "Descrever o evento com uniões, interseções e complementos.",
                    },
                    {
                        frente: "O que é um evento, na definição da aula?",
                        verso: "Um subconjunto do espaço amostral.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantos axiomas Kolmogorov enuncia?",
                        verso: "Três.",
                    },
                    {
                        frente: "Que faixa de valores a probabilidade ocupa?",
                        verso: "De zero a um, sem jamais sair desse intervalo.",
                    },
                    {
                        frente: "Que probabilidade o espaço amostral inteiro tem?",
                        verso: "Probabilidade igual a um.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que diferença separa arranjo de combinação?",
                        verso: "O arranjo leva a ordem em conta; a combinação não.",
                    },
                    {
                        frente: "Que princípio multiplica as escolhas de cada etapa?",
                        verso: "O princípio fundamental da contagem.",
                    },
                    {
                        frente: "Que pergunta escolhe entre arranjo e combinação?",
                        verso: "Se a ordem dos elementos muda o resultado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que condicionar faz com o espaço amostral?",
                        verso: "Troca por outro: o que era certeza vira o novo mundo.",
                    },
                    {
                        frente: "Que conta define a probabilidade condicional?",
                        verso: "A da interseção dividida pela probabilidade do que se sabe.",
                    },
                    {
                        frente: "Que probabilidade impede o condicionamento?",
                        verso: "A de zero no evento condicionante.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o teorema de Bayes não faz?",
                        verso: "Criar informação: ele só faz a priori conversar com a evidência.",
                    },
                    {
                        frente: "O que caracteriza dois eventos independentes?",
                        verso: "Saber de um não muda a probabilidade do outro.",
                    },
                    {
                        frente: "Que nome a probabilidade antes da evidência recebe?",
                        verso: "Probabilidade a priori.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que uma variável aleatória realmente é?",
                        verso: "Uma função que traduz o acaso em números reais.",
                    },
                    {
                        frente: "O que a função de distribuição acumula?",
                        verso: "A probabilidade até um valor, e não apenas nele.",
                    },
                    {
                        frente: "Que comportamento a função de distribuição sempre tem?",
                        verso: "Cresce sem voltar, indo de zero até um.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que pergunta a função de probabilidade responde?",
                        verso: "Uma pergunta pontual, sobre um valor exato.",
                    },
                    {
                        frente: "Que pergunta a função de distribuição responde?",
                        verso: "Uma pergunta acumulada, do tipo até aqui.",
                    },
                    {
                        frente: "Quanto a função de probabilidade soma no total?",
                        verso: "Um, somando todos os valores possíveis.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que probabilidade um ponto isolado carrega no contínuo?",
                        verso: "Probabilidade zero.",
                    },
                    {
                        frente: "O que pesa numa distribuição contínua?",
                        verso: "A área sob a curva, e não a altura num ponto.",
                    },
                    {
                        frente: "Quanto vale a área total sob a densidade?",
                        verso: "Área igual a um.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que imagem física a esperança tem?",
                        verso: "A de centro de gravidade da distribuição.",
                    },
                    {
                        frente: "Como a esperança de uma discreta é calculada?",
                        verso: "Somando cada valor multiplicado pela sua probabilidade.",
                    },
                    {
                        frente: "Que operação a esperança preserva sempre?",
                        verso: "A soma, mesmo sem independência entre as variáveis.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a variância diz, ao lado da esperança?",
                        verso: "O quanto a distribuição se espalha em volta dela.",
                    },
                    {
                        frente: "Que unidade o desvio padrão devolve?",
                        verso: "A da própria variável, ao contrário da variância.",
                    },
                    {
                        frente: "Que esperança define a variância?",
                        verso: "A do desvio ao quadrado em relação à média.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "De que experimento a binomial nasce?",
                        verso: "Da repetição independente do cara ou coroa.",
                    },
                    {
                        frente: "Quantos resultados o ensaio de Bernoulli tem?",
                        verso: "Dois: sucesso ou fracasso.",
                    },
                    {
                        frente: "Que dois parâmetros a binomial exige?",
                        verso: "O número de repetições e a probabilidade de sucesso.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que pergunta a distribuição geométrica faz?",
                        verso: "Quando o primeiro sucesso chega.",
                    },
                    {
                        frente: "Que pergunta a Poisson faz?",
                        verso: "Quantos eventos cabem num intervalo.",
                    },
                    {
                        frente: "Que parâmetro a Poisson usa?",
                        verso: "A taxa média de eventos no intervalo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que preferência a uniforme tem dentro do intervalo?",
                        verso: "Nenhuma: trechos de mesmo tamanho pesam igual.",
                    },
                    {
                        frente: "Que propriedade curiosa a exponencial tem?",
                        verso: "A falta de memória do tempo já decorrido.",
                    },
                    {
                        frente: "Que grandeza a exponencial costuma modelar?",
                        verso: "O tempo de espera até o próximo evento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que acontece ao somar muitos acasos pequenos?",
                        verso: "Reencontra-se a curva em forma de sino.",
                    },
                    {
                        frente: "Que dois parâmetros definem a normal?",
                        verso: "A média e o desvio padrão.",
                    },
                    {
                        frente: "Que simetria a curva normal tem?",
                        verso: "É simétrica em torno da média.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "De onde a distribuição certa se deduz?",
                        verso: "Da estrutura do experimento e das perguntas feitas.",
                    },
                    {
                        frente: "Que estrago escolher a distribuição no chute causa?",
                        verso: "Contas certas sobre um modelo que não descreve o caso.",
                    },
                    {
                        frente: "Que pergunta separa discreta de contínua?",
                        verso: "Se o resultado é contado ou medido.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que objeto é primário nas variáveis conjuntas?",
                        verso: "A distribuição conjunta, da qual as outras se extraem.",
                    },
                    {
                        frente: "O que a distribuição conjunta descreve?",
                        verso: "O comportamento das variáveis ao mesmo tempo.",
                    },
                    {
                        frente: "O que não se pode fazer a partir das marginais?",
                        verso: "Reconstruir a distribuição conjunta.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como uma marginal é obtida da conjunta?",
                        verso: "Somando ou integrando sobre a outra variável.",
                    },
                    {
                        frente: "O que a distribuição condicional fixa?",
                        verso: "Um valor de uma variável, remedindo a outra.",
                    },
                    {
                        frente: "Que informação a marginal perde?",
                        verso: "A da relação entre as variáveis.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Sobre o que a independência é uma afirmação?",
                        verso: "Sobre toda a distribuição conjunta.",
                    },
                    {
                        frente: "Que resumo não basta para provar independência?",
                        verso: "A covariância, que é um número só.",
                    },
                    {
                        frente: "Que fatoração a independência produz?",
                        verso: "A conjunta vira o produto das marginais.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que tipo de relação a covariância mede?",
                        verso: "Apenas o alinhamento linear entre as variáveis.",
                    },
                    {
                        frente: "O que passa despercebido pela covariância?",
                        verso: "Toda estrutura curva entre as variáveis.",
                    },
                    {
                        frente: "Que vantagem a correlação tem sobre a covariância?",
                        verso: "Fica entre menos um e um, sem depender da unidade.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que condição a esperança da soma exige?",
                        verso: "Nenhuma: é sempre a soma das esperanças.",
                    },
                    {
                        frente: "Que condição a variância da soma exige?",
                        verso: "Independência, ou a covariância entra na conta.",
                    },
                    {
                        frente: "Que termo entra na variância da soma sem independência?",
                        verso: "O dobro da covariância entre as variáveis.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Onde está a força da desigualdade de Chebyshev?",
                        verso: "Em valer para todas as distribuições ao mesmo tempo.",
                    },
                    {
                        frente: "O que Chebyshev limita?",
                        verso: "A probabilidade de se afastar muito da média.",
                    },
                    {
                        frente: "Que preço a generalidade de Chebyshev cobra?",
                        verso: "Um limite frouxo para qualquer distribuição específica.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a lei dos grandes números promete?",
                        verso: "Regularidade no acúmulo, não em cada tentativa.",
                    },
                    {
                        frente: "Para onde a média amostral caminha?",
                        verso: "Para a média verdadeira, conforme a amostra cresce.",
                    },
                    {
                        frente: "O que a lei não garante sobre uma tentativa isolada?",
                        verso: "Nada: o acaso individual continua valendo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que o sino aparece onde menos se espera?",
                        verso: "Ele é o destino comum das somas.",
                    },
                    {
                        frente: "Que forma a soma de muitas variáveis assume?",
                        verso: "A normal, mesmo sem as parcelas serem normais.",
                    },
                    {
                        frente: "Que condição o teorema central do limite pede?",
                        verso: "Amostras independentes e tamanho suficiente.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que toda estatística de uma amostra também é?",
                        verso: "Uma variável aleatória, com distribuição própria.",
                    },
                    {
                        frente: "Que efeito o tamanho da amostra tem na média?",
                        verso: "Reduz a dispersão da distribuição amostral.",
                    },
                    {
                        frente: "Que nome o desvio da distribuição amostral recebe?",
                        verso: "Erro padrão.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que preço estimar a dispersão pelos dados cobra?",
                        verso: "Caudas mais largas na distribuição usada.",
                    },
                    {
                        frente: "Quando a t de Student substitui a normal?",
                        verso: "Quando o desvio vem da própria amostra.",
                    },
                    {
                        frente: "Que parâmetro define a t de Student?",
                        verso: "Os graus de liberdade.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "O que a estatística faz com a incerteza?",
                        verso: "Organiza numa distribuição que dá para estudar.",
                    },
                    {
                        frente: "O que um estimador pontual entrega?",
                        verso: "Um único valor como palpite do parâmetro.",
                    },
                    {
                        frente: "Que diferença separa estimador de estimativa?",
                        verso: "O estimador é a regra; a estimativa, o número obtido.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um bom estimador precisa fazer?",
                        verso: "Errar cada vez menos conforme os dados se acumulam.",
                    },
                    {
                        frente: "O que o viés de um estimador mede?",
                        verso: "O erro sistemático em relação ao parâmetro.",
                    },
                    {
                        frente: "O que a consistência garante?",
                        verso: "Convergência ao parâmetro conforme a amostra cresce.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que receita antiga o método dos momentos usa?",
                        verso: "Igualar o que a teoria prevê ao que a amostra mostra.",
                    },
                    {
                        frente: "Que momentos entram nesse método?",
                        verso: "Os teóricos, igualados aos calculados na amostra.",
                    },
                    {
                        frente: "Que vantagem o método dos momentos tem?",
                        verso: "Simplicidade de cálculo, sem precisar otimizar nada.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que valor a máxima verossimilhança elege?",
                        verso: "Aquele sob o qual o observado era o mais esperado.",
                    },
                    {
                        frente: "Que função é maximizada nessa estimação?",
                        verso: "A verossimilhança, ou o logaritmo dela.",
                    },
                    {
                        frente: "Por que trabalhar com o logaritmo da verossimilhança?",
                        verso: "Ele troca produtos por somas, sem mudar o ponto de máximo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que um intervalo de confiança descreve?",
                        verso: "A confiabilidade do método que o produziu.",
                    },
                    {
                        frente: "O que o intervalo de confiança não afirma?",
                        verso: "Onde exatamente o parâmetro está.",
                    },
                    {
                        frente: "Que efeito aumentar a confiança tem no intervalo?",
                        verso: "Deixa o intervalo mais largo.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que se faz com a hipótese nula?",
                        verso: "Leva-se a julgamento, sem nunca prová-la verdadeira.",
                    },
                    {
                        frente: "Que erro rejeitar uma nula verdadeira produz?",
                        verso: "O erro do tipo um.",
                    },
                    {
                        frente: "Que erro não rejeitar uma nula falsa produz?",
                        verso: "O erro do tipo dois.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um resultado significativo responde?",
                        verso: "Se o efeito existe, não se ele é grande ou importante.",
                    },
                    {
                        frente: "O que o p-valor mede?",
                        verso: "A chance de um resultado tão extremo sob a nula.",
                    },
                    {
                        frente: "O que o nível de significância fixa antes do teste?",
                        verso: "O risco aceito de rejeitar a nula sem razão.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que preço trocar o desvio conhecido pela estimativa tem?",
                        verso: "Caudas mais pesadas e menos certeza sobre a média.",
                    },
                    {
                        frente: "Que distribuição o desvio conhecido permite usar?",
                        verso: "A normal.",
                    },
                    {
                        frente: "Que dados o teste para a média compara?",
                        verso: "A média amostral e o valor afirmado na hipótese.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que às vezes importa mais que o centro do processo?",
                        verso: "O quanto ele oscila, testado pela variância.",
                    },
                    {
                        frente: "Que aproximação o teste de proporção costuma usar?",
                        verso: "A normal, com amostra grande o bastante.",
                    },
                    {
                        frente: "Que distribuição o teste de variância utiliza?",
                        verso: "A qui-quadrado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "A favor de que o qui-quadrado nunca aponta?",
                        verso: "Da hipótese nula: ele só mede a discrepância.",
                    },
                    {
                        frente: "O que o teste qui-quadrado compara?",
                        verso: "As frequências observadas com as esperadas.",
                    },
                    {
                        frente: "Que usos clássicos o qui-quadrado tem?",
                        verso: "Aderência e independência entre categorias.",
                    },
                ],
            },
        },
    },
};
