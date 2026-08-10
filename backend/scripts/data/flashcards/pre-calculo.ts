import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Pré-cálculo, primeira trilha do roadmap de Matemática.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a conta feita;
 * as cartas guardam as definições fechadas, os nomes das técnicas e as
 * armadilhas de sinal que a aula enuncia de passagem.
 *
 * As fórmulas vão por extenso, em palavras: a carta é lida no verso curto
 * do baralho, sem a renderização de LaTeX que as aulas usam.
 */
export const preCalculo: CartasDaTrilha = {
    trilha: "Pré-cálculo",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que cadeia de inclusões os conjuntos numéricos formam?",
                        verso: "Naturais dentro de inteiros, dentro de racionais, dentro de reais.",
                    },
                    {
                        frente: "Como uma dízima periódica simples vira fração?",
                        verso: "O período sobre tantos noves quantos os algarismos repetidos.",
                    },
                    {
                        frente: "Como se calcula a distância entre dois pontos da reta?",
                        verso: "Pelo módulo da diferença entre eles.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um expoente negativo indica na potência?",
                        verso: "O inverso: um sobre a mesma potência com expoente positivo.",
                    },
                    {
                        frente: "Que erro mais comum troca soma por multiplicação?",
                        verso: "Multiplicar expoentes no produto de mesma base, em vez de somar.",
                    },
                    {
                        frente: "Que diferença o sinal antes da base provoca?",
                        verso: "Com parênteses o expoente age no negativo; sem eles, só no número.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que dois nomes as partes de um radical recebem?",
                        verso: "O índice, fora, e o radicando, dentro da raiz.",
                    },
                    {
                        frente: "Que expoente fracionário corresponde à raiz n-ésima?",
                        verso: "Um sobre n, e a raiz de a elevado a m vira m sobre n.",
                    },
                    {
                        frente: "Que ganho a ponte entre raiz e potência traz?",
                        verso: "Todas as propriedades de potência passam a valer no radical.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que quatro produtos notáveis a aula manda memorizar?",
                        verso: "Quadrado da soma, da diferença, soma por diferença e o cubo.",
                    },
                    {
                        frente: "Que termo do meio o quadrado da soma carrega?",
                        verso: "O dobro do produto dos dois termos, com sinal positivo.",
                    },
                    {
                        frente: "Que resultado a soma pela diferença produz?",
                        verso: "A diferença dos quadrados, sem termo do meio.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que fatorar significa, em uma frase?",
                        verso: "Escrever a expressão como um produto de fatores.",
                    },
                    {
                        frente: "Que três técnicas de fatoração a aula prioriza?",
                        verso: "Fator comum, diferença de quadrados e trinômio por soma e produto.",
                    },
                    {
                        frente: "Que caminho simplifica uma fração algébrica?",
                        verso: "Fatorar numerador e denominador e cancelar o fator comum.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Em que ordem se desfazem as operações ao isolar?",
                        verso: "Primeiro soma e subtração, depois multiplicação e divisão.",
                    },
                    {
                        frente: "Que passo final toda equação resolvida merece?",
                        verso: "Substituir a resposta na equação original e conferir.",
                    },
                    {
                        frente: "O que isolar a incógnita significa na prática?",
                        verso: "Fazer e desfazer operações até ela ficar sozinha.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que cálculo precede a aplicação da fórmula?",
                        verso: "O do discriminante, cujo sinal antecipa as raízes reais.",
                    },
                    {
                        frente: "O que o discriminante negativo indica sobre as raízes?",
                        verso: "Que não existe raiz real, e a fórmula pararia ali.",
                    },
                    {
                        frente: "Quantas raízes o discriminante zero produz?",
                        verso: "Uma só, com as duas raízes coincidindo no mesmo valor.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que teste confirma a solução de um sistema?",
                        verso: "Substituir o par nas duas equações originais ao mesmo tempo.",
                    },
                    {
                        frente: "Que erro tratar uma equação só provoca?",
                        verso: "Aceitar um par que serve a uma e falha na outra do sistema.",
                    },
                    {
                        frente: "Que dois métodos clássicos resolvem um sistema?",
                        verso: "A substituição e a adição das equações.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que operação obriga a virar o sinal da desigualdade?",
                        verso: "Multiplicar ou dividir os dois lados por um negativo.",
                    },
                    {
                        frente: "Que descuido lidera os erros em inequação?",
                        verso: "Esquecer de inverter o sinal depois do negativo.",
                    },
                    {
                        frente: "Que forma a resposta de uma inequação assume?",
                        verso: "Um intervalo de valores, e não um número único.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em que linguagem o módulo deve ser traduzido?",
                        verso: "Na de distância até um ponto da reta real.",
                    },
                    {
                        frente: "Em quantos casos uma igualdade com módulo se abre?",
                        verso: "Em dois, um para cada sinal possível do interior.",
                    },
                    {
                        frente: "Que forma o sinal de maior com módulo produz?",
                        verso: "Dois pedaços separados na reta, e não um intervalo.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que metáfora a aula usa para explicar função?",
                        verso: "Uma máquina: entra um número e sai um único valor.",
                    },
                    {
                        frente: "Que exigência a definição de função impõe à saída?",
                        verso: "Uma só saída para cada entrada, sem ambiguidade.",
                    },
                    {
                        frente: "Que dois conjuntos toda função declara?",
                        verso: "O domínio das entradas e a imagem dos valores atingidos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que teste diz se um desenho é gráfico de função?",
                        verso: "A reta vertical cruzando o desenho em um ponto só.",
                    },
                    {
                        frente: "Que informação o gráfico entrega de um só olhar?",
                        verso: "A história da função: onde sobe, desce e cruza os eixos.",
                    },
                    {
                        frente: "Onde o gráfico corta o eixo vertical?",
                        verso: "No valor da função quando a entrada vale zero.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que simetria uma função par apresenta?",
                        verso: "Espelho no eixo vertical, com os dois lados iguais.",
                    },
                    {
                        frente: "Que simetria caracteriza a função ímpar?",
                        verso: "Giro de meia volta em torno da origem do plano.",
                    },
                    {
                        frente: "O que crescer significa num intervalo?",
                        verso: "Entrada maior devolvendo sempre saída maior ali.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que efeito o que está fora da função provoca?",
                        verso: "Mexe na altura do gráfico, no sentido vertical.",
                    },
                    {
                        frente: "Por que a mudança junto do x engana a intuição?",
                        verso: "Ela desloca na horizontal ao contrário do sinal escrito.",
                    },
                    {
                        frente: "Que transformação o sinal de menos na frente causa?",
                        verso: "Reflete o gráfico em relação ao eixo horizontal.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que compor duas funções significa?",
                        verso: "Encaixar uma na outra, usando a saída como entrada.",
                    },
                    {
                        frente: "O que a função inversa faz com o caminho?",
                        verso: "Desfaz e devolve ao ponto de partida original.",
                    },
                    {
                        frente: "Que condição uma função precisa ter para inverter?",
                        verso: "Ser injetora: nenhuma saída repetida entre entradas.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que dois dados determinam uma reta por completo?",
                        verso: "A inclinação e um ponto por onde ela passa.",
                    },
                    {
                        frente: "O que o coeficiente angular mede na reta?",
                        verso: "Quanto a saída muda a cada unidade de entrada.",
                    },
                    {
                        frente: "Onde o coeficiente linear aparece no gráfico?",
                        verso: "No ponto em que a reta corta o eixo vertical.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Em torno de que reta a parábola é simétrica?",
                        verso: "Da vertical que passa pelo vértice da curva.",
                    },
                    {
                        frente: "Que sinal do coeficiente principal abre para cima?",
                        verso: "O positivo; o negativo vira a parábola para baixo.",
                    },
                    {
                        frente: "Que ponto o vértice representa na parábola?",
                        verso: "O extremo: mínimo se abre para cima, máximo se para baixo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que resolver uma inequação se resume, no fundo?",
                        verso: "Ler o estudo do sinal e escolher os intervalos que servem.",
                    },
                    {
                        frente: "Que pontos dividem a reta no estudo do sinal?",
                        verso: "As raízes, onde a expressão troca de sinal.",
                    },
                    {
                        frente: "Que cuidado o denominador impõe ao estudo?",
                        verso: "A raiz dele nunca entra, porque anularia a fração.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que informação cada fator de um polinômio revela?",
                        verso: "Uma raiz, o ponto em que o gráfico toca o eixo horizontal.",
                    },
                    {
                        frente: "Que limite o grau impõe à quantidade de raízes?",
                        verso: "No máximo tantas raízes reais quanto o grau do polinômio.",
                    },
                    {
                        frente: "O que fatorar traduz, na linguagem da aula?",
                        verso: "O polinômio para a linguagem das próprias raízes.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que metáfora descreve o que é uma assíntota?",
                        verso: "Um destino perseguido de perto e jamais alcançado.",
                    },
                    {
                        frente: "Onde nasce a assíntota vertical de uma racional?",
                        verso: "Na raiz do denominador que não some na simplificação.",
                    },
                    {
                        frente: "Que valores o domínio de uma racional exclui?",
                        verso: "Os que anulam o denominador da expressão.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que efeito um passo constante no expoente produz?",
                        verso: "O resultado é multiplicado sempre pelo mesmo fator.",
                    },
                    {
                        frente: "Que ponto toda exponencial de base positiva atravessa?",
                        verso: "O de altura um, quando o expoente vale zero.",
                    },
                    {
                        frente: "Que base faz a exponencial decrescer?",
                        verso: "A entre zero e um, que encolhe a cada passo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que pergunta o logaritmo responde, no fundo?",
                        verso: "A que potência a base precisa ser elevada para chegar ali.",
                    },
                    {
                        frente: "Que restrição o logaritmando precisa respeitar?",
                        verso: "Ser positivo, porque potência de base positiva nunca zera.",
                    },
                    {
                        frente: "Em que o produto vira soma nas propriedades?",
                        verso: "No logaritmo, que troca produto por soma de logaritmos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que ritmo a logarítmica tem ante a exponencial?",
                        verso: "Ela avança devagar, enquanto a outra dispara multiplicando.",
                    },
                    {
                        frente: "Que relação liga a exponencial e a logarítmica?",
                        verso: "São inversas: uma desfaz exatamente o que a outra faz.",
                    },
                    {
                        frente: "Que valor a logarítmica conta, na leitura da aula?",
                        verso: "Quantas vezes a base foi multiplicada para chegar ali.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que dança resolve quase toda equação exponencial?",
                        verso: "Deixar os dois lados na mesma base e comparar o resto.",
                    },
                    {
                        frente: "Que conferência a equação logarítmica sempre exige?",
                        verso: "Checar se a solução mantém o logaritmando positivo.",
                    },
                    {
                        frente: "O que comparar depois de igualar as bases?",
                        verso: "Os expoentes, que passam a valer a mesma coisa.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que efeito a escala logarítmica tem no número gigante?",
                        verso: "Vira um passo tranquilo, no lugar de uma explosão.",
                    },
                    {
                        frente: "Que dois fenômenos a exponencial modela na aula?",
                        verso: "O crescimento e o decaimento ao longo do tempo.",
                    },
                    {
                        frente: "Que escalas conhecidas usam logaritmo por trás?",
                        verso: "As de terremoto e de som, entre outras do dia a dia.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Como o radiano mede um ângulo, afinal?",
                        verso: "Pelo tamanho do arco que ele abre no círculo.",
                    },
                    {
                        frente: "Quantos radianos uma volta completa vale?",
                        verso: "Dois pi, equivalentes aos 360 graus da volta.",
                    },
                    {
                        frente: "Que régua o grau usa, diferente do radiano?",
                        verso: "A das fatias de uma volta dividida em 360.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Em que direção o cosseno e o seno andam no círculo?",
                        verso: "O cosseno na horizontal e o seno na vertical.",
                    },
                    {
                        frente: "Que faixa de valores o seno e o cosseno ocupam?",
                        verso: "De menos um a um, sem nunca sair desse intervalo.",
                    },
                    {
                        frente: "Que razão a tangente representa no círculo?",
                        verso: "A do seno pelo cosseno, indefinida quando o cosseno zera.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que relação existe entre as ondas de seno e cosseno?",
                        verso: "São a mesma onda, com pontos de partida diferentes.",
                    },
                    {
                        frente: "Que período o seno e o cosseno repetem?",
                        verso: "O de uma volta completa, dois pi radianos.",
                    },
                    {
                        frente: "Que grandeza a amplitude mede numa onda?",
                        verso: "A altura máxima que ela alcança a partir do eixo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Para que serve uma identidade trigonométrica?",
                        verso: "Para reescrever a expressão, e não para resolvê-la.",
                    },
                    {
                        frente: "Que identidade fundamental relaciona seno e cosseno?",
                        verso: "A soma dos quadrados dos dois vale sempre um.",
                    },
                    {
                        frente: "Que garantia a identidade dá ao trocar a expressão?",
                        verso: "O valor não muda, só a forma de escrever.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que erro lidera as equações trigonométricas?",
                        verso: "Esquecer a segunda solução da volta completa.",
                    },
                    {
                        frente: "Que pergunta fechar a conta exige antes?",
                        verso: "Em quais quadrantes aquele sinal aparece na volta.",
                    },
                    {
                        frente: "Quantas soluções uma equação trigonométrica tem?",
                        verso: "Infinitas, repetindo a cada volta do círculo.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que pergunta vem antes da conta numa função por partes?",
                        verso: "Em qual pedaço a entrada se encaixa, pela condição.",
                    },
                    {
                        frente: "Que ordem a aula fixa para função por partes?",
                        verso: "A condição primeiro e a conta só depois dela.",
                    },
                    {
                        frente: "Onde uma função por partes costuma dar salto?",
                        verso: "Na fronteira entre dois pedaços, se os valores diferem.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o infinito representa num limite?",
                        verso: "Uma direção para onde caminhar, não um número a alcançar.",
                    },
                    {
                        frente: "Que pergunta o limite no infinito faz?",
                        verso: "Para onde a função aponta quando a entrada cresce sem fim.",
                    },
                    {
                        frente: "Que curva o comportamento assintótico descreve?",
                        verso: "A que se aproxima de um valor sem jamais tocá-lo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que calcular um limite realmente observa?",
                        verso: "Para onde a função vai, e não o que ocorre no ponto.",
                    },
                    {
                        frente: "Por que o valor no ponto pode ser ignorado?",
                        verso: "O limite olha a aproximação, não a chegada exata.",
                    },
                    {
                        frente: "Que situação torna o limite mais interessante?",
                        verso: "Quando a função nem está definida naquele ponto.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que diferença separa a taxa média da instantânea?",
                        verso: "A média cobre um trecho; a instantânea, um instante só.",
                    },
                    {
                        frente: "Como a taxa instantânea nasce da média?",
                        verso: "Encolhendo o trecho até quase zero de comprimento.",
                    },
                    {
                        frente: "Que reta a taxa instantânea determina no gráfico?",
                        verso: "A tangente, encostada na curva naquele ponto.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que promessa a continuidade faz sobre a função?",
                        verso: "Que ela não vai surpreender com um salto no caminho.",
                    },
                    {
                        frente: "Sobre que base a derivada é construída?",
                        verso: "Sobre a continuidade, a base firme sem salto.",
                    },
                    {
                        frente: "Que gesto simples testa a continuidade num desenho?",
                        verso: "Percorrer a curva sem tirar o lápis do papel.",
                    },
                ],
            },
        },
    },
};
