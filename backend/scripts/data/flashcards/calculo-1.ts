import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Cálculo 1, segunda trilha do roadmap de Matemática.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a conta feita;
 * as cartas guardam as definições fechadas, as condições dos teoremas e as
 * armadilhas que a aula enuncia de passagem.
 *
 * As fórmulas vão por extenso, em palavras: a carta é lida no verso curto
 * do baralho, sem a renderização de LaTeX que as aulas usam.
 */
export const calculo1: CartasDaTrilha = {
    trilha: "Cálculo 1",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que o limite pergunta sobre a função?",
                        verso: "Para onde ela aponta perto do ponto, não quanto vale nele.",
                    },
                    {
                        frente: "Que aproximação a noção intuitiva de limite usa?",
                        verso: "Chegar cada vez mais perto do ponto, pelos dois lados.",
                    },
                    {
                        frente: "Que valor pode faltar sem impedir o limite?",
                        verso: "O da função no ponto, que o limite dispensa.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que condição os limites laterais impõem à existência?",
                        verso: "Os dois lados precisam apontar para o mesmo valor.",
                    },
                    {
                        frente: "Que notação marca o lado da aproximação?",
                        verso: "Um sinal de mais ou de menos junto do ponto.",
                    },
                    {
                        frente: "Onde os limites laterais costumam divergir?",
                        verso: "No salto de uma função por partes, na fronteira dos pedaços.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando calcular limite é só substituir?",
                        verso: "Quando o denominador não zera e a função é bem comportada.",
                    },
                    {
                        frente: "Que propriedade vale para soma e produto de limites?",
                        verso: "O limite da soma é a soma dos limites, e o mesmo no produto.",
                    },
                    {
                        frente: "Que restrição a propriedade do quociente carrega?",
                        verso: "O limite do denominador precisa ser diferente de zero.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a indeterminação zero sobre zero indica?",
                        verso: "Que há fator comum a cancelar, e não um beco sem saída.",
                    },
                    {
                        frente: "Que técnica resolve a raiz na indeterminação?",
                        verso: "Multiplicar pelo conjugado para racionalizar a expressão.",
                    },
                    {
                        frente: "Que gesto a indeterminação zero sobre zero pede?",
                        verso: "Fatorar e cancelar o fator que anula os dois lados.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "A quanto tende seno de x sobre x com x indo a zero?",
                        verso: "A um, o limite trigonométrico fundamental.",
                    },
                    {
                        frente: "Que disfarce todo limite trigonométrico em zero usa?",
                        verso: "O mesmo fato: seno de algo sobre esse mesmo algo tende a um.",
                    },
                    {
                        frente: "Que ajuste faz o limite valer com seno de 3x?",
                        verso: "Casar o denominador com o argumento, compensando o fator.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Quem manda numa função racional no infinito?",
                        verso: "O termo de maior grau, em cima e embaixo da fração.",
                    },
                    {
                        frente: "Que limite uma racional de graus iguais tem?",
                        verso: "A razão entre os coeficientes dos termos de maior grau.",
                    },
                    {
                        frente: "Que limite sobra com o denominador de grau maior?",
                        verso: "Zero, porque o de baixo cresce mais rápido que o de cima.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que uma assíntota vertical marca no gráfico?",
                        verso: "O ponto onde a função explode, sem valor finito.",
                    },
                    {
                        frente: "Que limite revela uma assíntota horizontal?",
                        verso: "O da função no infinito, quando resulta num número finito.",
                    },
                    {
                        frente: "Onde procurar candidata a assíntota vertical?",
                        verso: "Nas raízes do denominador que sobrevivem à simplificação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que promessa a continuidade faz num ponto?",
                        verso: "O valor para onde a função aponta é o que ela entrega.",
                    },
                    {
                        frente: "Que três condições a continuidade num ponto exige?",
                        verso: "A função existe ali, o limite existe e os dois coincidem.",
                    },
                    {
                        frente: "Que desenho a função contínua permite?",
                        verso: "Percorrer o gráfico num traço só, sem levantar o lápis.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que decide se a descontinuidade é removível?",
                        verso: "Os limites laterais concordarem num mesmo valor finito.",
                    },
                    {
                        frente: "Que descontinuidade o salto caracteriza?",
                        verso: "A de limites laterais finitos, porém diferentes entre si.",
                    },
                    {
                        frente: "Que descontinuidade a assíntota vertical produz?",
                        verso: "A infinita, com pelo menos um dos lados disparando.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que tipo de conclusão o teorema do valor intermediário dá?",
                        verso: "De existência: garante que existe, sem dizer onde.",
                    },
                    {
                        frente: "Que hipótese o teorema do valor intermediário exige?",
                        verso: "Função contínua num intervalo fechado, com os extremos definidos.",
                    },
                    {
                        frente: "Que uso prático o teorema do valor intermediário tem?",
                        verso: "Provar que há raiz entre dois pontos de sinais opostos.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que reta melhor imita a curva bem de perto?",
                        verso: "A tangente, que aponta na mesma direção no ponto de contato.",
                    },
                    {
                        frente: "Que reta a taxa de variação média desenha?",
                        verso: "A secante, que corta a curva em dois pontos.",
                    },
                    {
                        frente: "Como a secante vira tangente?",
                        verso: "Aproximando o segundo ponto do primeiro até quase encostar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que roteiro derivar pela definição sempre segue?",
                        verso: "Montar o quociente, simplificar a divisão por zero e só então o limite.",
                    },
                    {
                        frente: "Que quociente a definição de derivada usa?",
                        verso: "O da variação da função pela variação da entrada.",
                    },
                    {
                        frente: "Por que simplificar antes de aplicar o limite?",
                        verso: "Sem isso o quociente cai numa divisão por zero.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que implicação liga derivabilidade e continuidade?",
                        verso: "Toda função derivável é contínua, e nunca o contrário.",
                    },
                    {
                        frente: "Que exemplo clássico é contínuo e não derivável?",
                        verso: "O do módulo na origem, onde o gráfico faz um bico.",
                    },
                    {
                        frente: "Que tipo de condição a continuidade é para derivar?",
                        verso: "Necessária, porém não suficiente.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que pergunta sobre ritmo a derivada responde?",
                        verso: "Se a grandeza sobe ou desce agora, e com que rapidez.",
                    },
                    {
                        frente: "O que o sinal da derivada informa no instante?",
                        verso: "Positivo indica subida e negativo, descida.",
                    },
                    {
                        frente: "Que grandeza a derivada da posição representa?",
                        verso: "A velocidade, a taxa instantânea de mudança.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que derivar devolve, além de um número?",
                        verso: "Uma nova função, que pode ser derivada outra vez.",
                    },
                    {
                        frente: "Que camadas as derivadas sucessivas revelam?",
                        verso: "As do comportamento original, uma a cada nova derivação.",
                    },
                    {
                        frente: "Que nome a derivada da derivada recebe?",
                        verso: "Segunda derivada.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que a regra da potência faz com o expoente?",
                        verso: "Desce como fator e diminui uma unidade no expoente.",
                    },
                    {
                        frente: "Quanto vale a derivada de uma constante?",
                        verso: "Zero, porque nada varia.",
                    },
                    {
                        frente: "Que liberdade a constante multiplicando tem?",
                        verso: "Sai da derivada e multiplica o resultado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que armadilha a derivada do produto esconde?",
                        verso: "Não é o produto das derivadas, o erro mais comum do cálculo.",
                    },
                    {
                        frente: "Que forma a regra do produto tem em palavras?",
                        verso: "Derivada do primeiro vezes o segundo, mais o primeiro vezes a do segundo.",
                    },
                    {
                        frente: "Que detalhe do quociente muda em relação ao produto?",
                        verso: "O sinal de menos no meio e o denominador ao quadrado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que estrutura pede a regra da cadeia?",
                        verso: "A função composta, uma encaixada dentro da outra.",
                    },
                    {
                        frente: "Que produto a regra da cadeia monta?",
                        verso: "O da derivada de fora pela derivada de dentro.",
                    },
                    {
                        frente: "Que descuido a regra da cadeia costuma cobrar?",
                        verso: "Esquecer a derivada de dentro no fim da conta.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que função coincide com a própria derivada?",
                        verso: "A exponencial natural, de base e.",
                    },
                    {
                        frente: "Que fator aparece ao derivar uma base diferente?",
                        verso: "O logaritmo natural da base, multiplicando a exponencial.",
                    },
                    {
                        frente: "Que derivada o logaritmo natural tem?",
                        verso: "Um sobre x, com x positivo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que derivada o seno tem?",
                        verso: "O cosseno, sem troca de sinal.",
                    },
                    {
                        frente: "Que sinal aparece ao derivar o cosseno?",
                        verso: "O de menos, devolvendo menos seno.",
                    },
                    {
                        frente: "Em torno de que par giram as derivadas trigonométricas?",
                        verso: "Do seno e do cosseno, base para todas as outras.",
                    },
                ],
            },
        },
    },
};
