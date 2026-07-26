// Seed da trilha Pré-cálculo (base para o Cálculo 1). Conteúdo autoral, quiz-only,
// com fórmulas em LaTeX ($...$ inline e $$...$$ em bloco). Idempotente: se a trilha
// já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-precalculo.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Pré-cálculo";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const DESCRICAO =
    "Pré-cálculo para encarar o Cálculo 1 com segurança: dos números reais e da álgebra (potências, radicais, produtos notáveis e fatoração) às equações e inequações, ao conceito de função (domínio, imagem, gráfico, composição e inversa), às funções afim, quadrática, polinomial e racional, à exponencial e ao logaritmo, à trigonometria (círculo trigonométrico, funções e identidades) e à preparação para o cálculo (comportamento assintótico, noção intuitiva de limite e taxa de variação). A base sólida que falta pra derivar e integrar depois.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

// Preenchido na montagem, um módulo por vez, a partir da autoria por subagente.
const MODULOS = [
    {
        titulo: "Módulo 1 - Números reais e álgebra",
        aulas: [
            {
                titulo: "Conjuntos numéricos e a reta real",
                blocks: [
                    {
                        type: "text",
                        value: "# Conjuntos numéricos e a reta real\n\nAntes de estudar Cálculo, precisamos ter clareza sobre **quais números** estamos usando. Nesta aula vamos organizar os números em conjuntos, do mais simples ao mais completo, e ver como todos eles cabem em uma única linha, a **reta real**.",
                    },
                    {
                        type: "text",
                        value: "## Naturais e inteiros\n\nOs **números naturais** são os que usamos para contar:\n\n$$\\mathbb{N} = \\{0, 1, 2, 3, 4, \\dots\\}$$\n\nQuando incluímos os negativos, obtemos os **inteiros**:\n\n$$\\mathbb{Z} = \\{\\dots, -3, -2, -1, 0, 1, 2, 3, \\dots\\}$$\n\nTodo número natural também é inteiro, ou seja, $\\mathbb{N} \\subset \\mathbb{Z}$.",
                    },
                    {
                        type: "text",
                        value: "## Números racionais\n\nUm número é **racional** quando pode ser escrito como uma fração $\\frac{a}{b}$, com $a$ e $b$ inteiros e $b \\neq 0$:\n\n$$\\mathbb{Q} = \\left\\{ \\frac{a}{b} : a, b \\in \\mathbb{Z},\\ b \\neq 0 \\right\\}$$\n\nEntram aqui as frações como $\\frac{3}{4}$, os próprios inteiros (pois $5 = \\frac{5}{1}$) e as **dízimas periódicas**, como $0{,}\\overline{3} = \\frac{1}{3}$.\n\nPara transformar uma dízima periódica simples em fração, escrevemos o período sobre tantos noves quantos forem os algarismos que se repetem. Por exemplo, $0{,}\\overline{7} = \\frac{7}{9}$ e $0{,}\\overline{12} = \\frac{12}{99} = \\frac{4}{33}$.",
                    },
                    {
                        type: "text",
                        value: "## Irracionais e o conjunto dos reais\n\nAlguns números **não** podem ser escritos como fração: sua representação decimal é infinita e não periódica. Eles são os **irracionais**. Exemplos clássicos:\n\n$$\\sqrt{2} \\approx 1{,}4142\\dots \\qquad \\pi \\approx 3{,}1415\\dots$$\n\nA união dos racionais com os irracionais forma os **números reais**, indicados por $\\mathbb{R}$. Vale a cadeia de inclusões:\n\n$$\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$$",
                    },
                    {
                        type: "text",
                        value: "## A reta real\n\nPodemos representar **todos** os números reais como pontos de uma reta. Escolhemos um ponto para o zero (a origem), um sentido positivo (para a direita) e uma unidade de medida. Cada número real corresponde a exatamente um ponto, e cada ponto corresponde a exatamente um número real.\n\nQuanto mais à direita, maior o número. Por exemplo, $-3 < -1 < 0 < 2 < \\pi$.",
                    },
                    {
                        type: "text",
                        value: "## Módulo e distância\n\nO **módulo** (ou valor absoluto) de um número real $x$ mede sua distância até a origem, sem levar em conta o sinal. Se $x$ é positivo ou zero, então $|x| = x$; se $x$ é negativo, então $|x| = -x$. Assim, $|5| = 5$ e $|-5| = 5$.\n\nDe modo geral, a distância entre dois pontos $a$ e $b$ da reta é $|a - b|$. Por exemplo, a distância entre $3$ e $8$ é $|3 - 8| = |-5| = 5$.",
                    },
                    {
                        type: "text",
                        value: "## Intervalos\n\nSubconjuntos da reta formados por todos os números entre dois extremos são chamados de **intervalos**. Usamos colchete para incluir o extremo e parêntese para excluir.\n\n| Notação de conjunto | Intervalo | Significado |\n| --- | --- | --- |\n| $a \\le x \\le b$ | $[a, b]$ | fechado nos dois lados |\n| $a < x < b$ | $(a, b)$ | aberto nos dois lados |\n| $a \\le x < b$ | $[a, b)$ | fechado só à esquerda |\n| $x \\ge a$ | $[a, +\\infty)$ | ilimitado à direita |\n\nPor exemplo, o conjunto $\\{x \\in \\mathbb{R} : -2 \\le x < 5\\}$ é escrito como $[-2, 5)$.",
                    },
                    {
                        type: "quote",
                        value: "Os números se organizam em naturais, inteiros, racionais e reais, cada conjunto contido no seguinte. Todo ponto da reta real corresponde a um número, o módulo mede a distância até a origem e os intervalos descrevem trechos contínuos da reta.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual dos números a seguir é irracional?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sqrt{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{7}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}25$",
                                isCorrect: false,
                            },
                            {
                                text: "$-3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em notação de intervalo, o conjunto $\\{x \\in \\mathbb{R} : -2 \\le x < 5\\}$ é escrito como:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$[-2, 5)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(-2, 5]$",
                                isCorrect: false,
                            },
                            {
                                text: "$[-2, 5]$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-2, 5)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual cadeia de inclusões entre os conjuntos numéricos está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\mathbb{Z} \\subset \\mathbb{N} \\subset \\mathbb{Q} \\subset \\mathbb{R}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\mathbb{Q} \\subset \\mathbb{Z} \\subset \\mathbb{N} \\subset \\mathbb{R}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\mathbb{R} \\subset \\mathbb{Q} \\subset \\mathbb{Z} \\subset \\mathbb{N}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A distância entre os pontos $3$ e $8$ na reta real, dada por $|3 - 8|$, vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$-5$",
                                isCorrect: false,
                            },
                            {
                                text: "$11$",
                                isCorrect: false,
                            },
                            {
                                text: "$-11$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A dízima periódica $0{,}\\overline{12}$ corresponde a qual fração irredutível?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{4}{33}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{12}{100}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{2}{15}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{6}{50}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Potências e propriedades",
                blocks: [
                    {
                        type: "text",
                        value: "# Potências e propriedades\n\nA **potência** é uma forma compacta de escrever multiplicações repetidas. Dominar suas propriedades é essencial para manipular expressões em Cálculo, especialmente ao trabalhar com limites e derivadas.",
                    },
                    {
                        type: "text",
                        value: "## O que é uma potência\n\nDado um número real $a$ (a **base**) e um natural $n$ (o **expoente**), a potência $a^n$ é o produto de $n$ fatores iguais a $a$:\n\n$$a^n = \\underbrace{a \\cdot a \\cdots a}_{n \\text{ fatores}}$$\n\nPor exemplo, $2^4 = 2 \\cdot 2 \\cdot 2 \\cdot 2 = 16$ e $5^2 = 25$.",
                    },
                    {
                        type: "text",
                        value: "## Expoentes zero, um e negativo\n\nAlgumas convenções importantes, válidas para $a \\neq 0$:\n\n$$a^1 = a \\qquad a^0 = 1 \\qquad a^{-n} = \\frac{1}{a^n}$$\n\nO expoente negativo indica o **inverso**. Por exemplo, $3^{-2} = \\frac{1}{3^2} = \\frac{1}{9}$.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades das potências\n\nAs regras a seguir são a base de toda manipulação com potências:\n\n| Propriedade | Fórmula |\n| --- | --- |\n| Produto de mesma base | $a^m \\cdot a^n = a^{m+n}$ |\n| Quociente de mesma base | $\\frac{a^m}{a^n} = a^{m-n}$ |\n| Potência de potência | $(a^m)^n = a^{m \\cdot n}$ |\n| Potência de um produto | $(a \\cdot b)^n = a^n \\cdot b^n$ |\n| Potência de um quociente | $\\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n}$ |\n\nO erro mais comum é **multiplicar** os expoentes no produto de mesma base. Lembre: no produto os expoentes se **somam**, e só se multiplicam na potência de potência.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nVamos simplificar $\\dfrac{(2x^3)^2 \\cdot x}{4x^4}$.\n\n1. Aplicamos a potência de um produto no numerador: $(2x^3)^2 = 2^2 \\cdot (x^3)^2 = 4x^6$.\n2. Multiplicamos pelo $x$ que estava sozinho: $4x^6 \\cdot x = 4x^7$.\n3. Dividimos pelo denominador, subtraindo os expoentes: $\\dfrac{4x^7}{4x^4} = x^{7-4} = x^3$.\n\nLogo, a expressão vale $x^3$.",
                    },
                    {
                        type: "text",
                        value: "## Cuidado com o sinal\n\nPreste atenção na posição do sinal de menos. Em $(-2)^2$ o expoente age sobre todo o $-2$, então $(-2)^2 = 4$. Já em $-2^2$ o expoente age apenas sobre o $2$, então $-2^2 = -4$. Os parênteses fazem toda a diferença.",
                    },
                    {
                        type: "quote",
                        value: "Potência é multiplicação repetida. No produto de mesma base os expoentes somam, no quociente subtraem e na potência de potência multiplicam. Expoente zero dá um, e expoente negativo indica o inverso.",
                    },
                ],
                questions: [
                    {
                        statement: "Simplificando $2^3 \\cdot 2^4$, obtemos:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$2^7$",
                                isCorrect: true,
                            },
                            {
                                text: "$2^{12}$",
                                isCorrect: false,
                            },
                            {
                                text: "$4^7$",
                                isCorrect: false,
                            },
                            {
                                text: "$4^{12}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O resultado de $(x^2)^5$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x^{10}$",
                                isCorrect: true,
                            },
                            {
                                text: "$x^7$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^{25}$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Simplificando $\\dfrac{a^7}{a^3}$, obtemos:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$a^4$",
                                isCorrect: true,
                            },
                            {
                                text: "$a^{10}$",
                                isCorrect: false,
                            },
                            {
                                text: "$a^{21}$",
                                isCorrect: false,
                            },
                            {
                                text: "$a^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $3^{-2}$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{9}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{6}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-9$",
                                isCorrect: false,
                            },
                            {
                                text: "$-6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Simplificando $\\dfrac{(2x^3)^2 \\cdot x}{4x^4}$, obtemos:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$x^3$",
                                isCorrect: true,
                            },
                            {
                                text: "$x^5$",
                                isCorrect: false,
                            },
                            {
                                text: "$2x^3$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{x^3}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Radicais e expoentes racionais",
                blocks: [
                    {
                        type: "text",
                        value: "# Radicais e expoentes racionais\n\nA **radiciação** é a operação inversa da potência. Nesta aula vamos ver como raízes e potências estão ligadas, escrevendo radicais como expoentes fracionários, o que facilita muito os cálculos.",
                    },
                    {
                        type: "text",
                        value: "## Raiz n-ésima\n\nDado um natural $n \\ge 2$, a **raiz n-ésima** de $a$ é o número que, elevado a $n$, resulta em $a$:\n\n$$\\sqrt[n]{a} = b \\iff b^n = a$$\n\nChamamos $n$ de **índice** e $a$ de **radicando**. Quando o índice é $2$, escrevemos apenas $\\sqrt{a}$. Por exemplo, $\\sqrt[3]{27} = 3$ porque $3^3 = 27$.",
                    },
                    {
                        type: "text",
                        value: "## Expoentes racionais\n\nPodemos escrever qualquer raiz como uma potência de expoente fracionário. Para $a \\ge 0$:\n\n$$a^{1/n} = \\sqrt[n]{a} \\qquad a^{m/n} = \\sqrt[n]{a^m} = \\left(\\sqrt[n]{a}\\right)^m$$\n\nEssa ponte é poderosa porque permite usar todas as propriedades de potências também com radicais. Por exemplo:\n\n$$8^{2/3} = \\left(\\sqrt[3]{8}\\right)^2 = 2^2 = 4$$",
                    },
                    {
                        type: "text",
                        value: "## Propriedades dos radicais\n\nComo consequência das regras de potência, valem as propriedades a seguir (para radicandos não negativos):\n\n| Propriedade | Fórmula |\n| --- | --- |\n| Raiz de um produto | $\\sqrt[n]{a \\cdot b} = \\sqrt[n]{a} \\cdot \\sqrt[n]{b}$ |\n| Raiz de um quociente | $\\sqrt[n]{\\dfrac{a}{b}} = \\dfrac{\\sqrt[n]{a}}{\\sqrt[n]{b}}$ |\n| Raiz de uma potência | $\\sqrt[n]{a^m} = a^{m/n}$ |",
                    },
                    {
                        type: "text",
                        value: "## Simplificando radicais\n\nPara simplificar $\\sqrt{50}$, procuramos um fator quadrado perfeito dentro do radicando. Como $50 = 25 \\cdot 2$ e $25 = 5^2$:\n\n$$\\sqrt{50} = \\sqrt{25 \\cdot 2} = \\sqrt{25} \\cdot \\sqrt{2} = 5\\sqrt{2}$$",
                    },
                    {
                        type: "text",
                        value: "## Racionalização\n\nQuando aparece uma raiz no denominador, costumamos **racionalizar**, ou seja, reescrever a fração sem raiz embaixo. Multiplicamos numerador e denominador pela mesma raiz:\n\n$$\\frac{3}{\\sqrt{5}} = \\frac{3}{\\sqrt{5}} \\cdot \\frac{\\sqrt{5}}{\\sqrt{5}} = \\frac{3\\sqrt{5}}{5}$$\n\nO denominador vira $\\sqrt{5} \\cdot \\sqrt{5} = 5$, um número sem raiz.",
                    },
                    {
                        type: "quote",
                        value: "A raiz n-ésima desfaz a potência de expoente n e pode ser escrita como potência de expoente fracionário. Isso permite aplicar as propriedades de potências aos radicais, além de simplificar raízes e racionalizar denominadores.",
                    },
                ],
                questions: [
                    {
                        statement: "O valor de $\\sqrt[3]{27}$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$27$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Escrevendo $\\sqrt{x}$ como potência de expoente racional, obtemos:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x^{1/2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$x^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^{-1/2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $8^{2/3}$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$4$",
                                isCorrect: true,
                            },
                            {
                                text: "$16$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{16}{3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A forma simplificada de $\\sqrt{50}$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$5\\sqrt{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$2\\sqrt{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$25\\sqrt{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$10\\sqrt{5}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Racionalizando o denominador de $\\dfrac{3}{\\sqrt{5}}$, obtemos:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{3\\sqrt{5}}{5}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{3\\sqrt{5}}{25}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sqrt{5}}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{3}{5}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Produtos notáveis",
                blocks: [
                    {
                        type: "text",
                        value: "# Produtos notáveis\n\nAlguns produtos de expressões algébricas aparecem com tanta frequência que vale a pena memorizar seus resultados. São os **produtos notáveis**, atalhos que evitam refazer a mesma multiplicação toda vez.",
                    },
                    {
                        type: "text",
                        value: "## Quadrado da soma\n\nO quadrado de uma soma é:\n\n$$(a + b)^2 = a^2 + 2ab + b^2$$\n\nRepare no termo do meio, $2ab$, que é justamente onde mais se erra. Ele nasce da multiplicação cruzada. Por exemplo:\n\n$$(x + 3)^2 = x^2 + 2 \\cdot x \\cdot 3 + 3^2 = x^2 + 6x + 9$$",
                    },
                    {
                        type: "text",
                        value: "## Quadrado da diferença\n\nMuito parecido, mudando apenas o sinal do termo do meio:\n\n$$(a - b)^2 = a^2 - 2ab + b^2$$\n\nO último termo continua **positivo**, pois é um quadrado. Por exemplo, $(x - 4)^2 = x^2 - 8x + 16$.",
                    },
                    {
                        type: "text",
                        value: "## Produto da soma pela diferença\n\nQuando multiplicamos a soma pela diferença dos mesmos termos, o termo do meio se cancela e sobra a **diferença de quadrados**:\n\n$$(a + b)(a - b) = a^2 - b^2$$\n\nPor exemplo, $(x - 5)(x + 5) = x^2 - 25$. Esse é um dos produtos mais úteis, e vamos reencontrá-lo na próxima aula, ao fatorar.",
                    },
                    {
                        type: "text",
                        value: "## Cubo da soma\n\nPara o cubo, aparecem quatro termos:\n\n$$(a + b)^3 = a^3 + 3a^2 b + 3ab^2 + b^3$$\n\nOs coeficientes $1, 3, 3, 1$ vêm do triângulo de Pascal. A versão com diferença troca o sinal dos termos de grau ímpar em $b$:\n\n$$(a - b)^3 = a^3 - 3a^2 b + 3ab^2 - b^3$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nVamos expandir $(2x + 1)^2$ usando o quadrado da soma, com $a = 2x$ e $b = 1$:\n\n1. Quadrado do primeiro: $(2x)^2 = 4x^2$.\n2. Dobro do produto: $2 \\cdot (2x) \\cdot 1 = 4x$.\n3. Quadrado do segundo: $1^2 = 1$.\n\nSomando os três, $(2x + 1)^2 = 4x^2 + 4x + 1$.",
                    },
                    {
                        type: "quote",
                        value: "Memorize os quatro produtos notáveis principais. O quadrado da soma e o da diferença têm o termo do meio igual ao dobro do produto, mudando apenas o sinal. A soma pela diferença gera a diferença de quadrados, e o cubo segue os coeficientes um, três, três, um.",
                    },
                ],
                questions: [
                    {
                        statement: "Desenvolvendo $(x + 3)^2$, obtemos:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x^2 + 6x + 9$",
                                isCorrect: true,
                            },
                            {
                                text: "$x^2 + 3x + 9$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^2 + 6x + 6$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^2 + 9$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O resultado de $(x - 5)(x + 5)$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x^2 - 25$",
                                isCorrect: true,
                            },
                            {
                                text: "$x^2 + 25$",
                                isCorrect: false,
                            },
                            {
                                text: "$25 - x^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^4 - 25$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Desenvolvendo $(2x + 1)^2$, obtemos:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$4x^2 + 4x + 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$2x^2 + 4x + 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$4x^2 + 2x + 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$4x^2 + 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Desenvolvendo $(x - 4)^2$, obtemos:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x^2 - 8x + 16$",
                                isCorrect: true,
                            },
                            {
                                text: "$x^2 + 8x + 16$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^2 - 8x - 16$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^2 - 16$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Desenvolvendo $(a + b)^3$, obtemos:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$a^3 + 3a^2 b + 3ab^2 + b^3$",
                                isCorrect: true,
                            },
                            {
                                text: "$a^3 - 3a^2 b + 3ab^2 - b^3$",
                                isCorrect: false,
                            },
                            {
                                text: "$a^3 + 3a^2 b - 3ab^2 + b^3$",
                                isCorrect: false,
                            },
                            {
                                text: "$a^3 + 2a^2 b + 2ab^2 + b^3$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Fatoração e frações algébricas",
                blocks: [
                    {
                        type: "text",
                        value: "# Fatoração e frações algébricas\n\n**Fatorar** é escrever uma expressão como um produto de fatores mais simples. É a operação inversa da distributiva e dos produtos notáveis, e é o que nos permite simplificar frações algébricas, resolver equações e calcular limites em Cálculo.",
                    },
                    {
                        type: "text",
                        value: "## Fator comum em evidência\n\nA técnica mais básica é colocar em evidência aquilo que aparece em todos os termos. Procuramos o maior fator comum e o extraímos:\n\n$$6x^2 + 9x = 3x(2x + 3)$$\n\nAqui, $3x$ é comum aos dois termos. Para conferir, basta aplicar a distributiva de volta e recuperar a expressão original.",
                    },
                    {
                        type: "text",
                        value: "## Diferença de quadrados\n\nLendo o produto notável ao contrário, toda diferença de dois quadrados se fatora assim:\n\n$$a^2 - b^2 = (a + b)(a - b)$$\n\nPor exemplo, $x^2 - 9 = (x + 3)(x - 3)$, pois $9 = 3^2$.",
                    },
                    {
                        type: "text",
                        value: "## Trinômios do segundo grau\n\nUm **trinômio quadrado perfeito** é o resultado de um quadrado da soma ou da diferença, então se fatora como:\n\n$$x^2 + 2ax + a^2 = (x + a)^2$$\n\nJá um trinômio geral $x^2 + Sx + P$ se fatora procurando dois números cuja **soma** seja $S$ e cujo **produto** seja $P$:\n\n$$x^2 + 5x + 6 = (x + 2)(x + 3)$$\n\npois $2 + 3 = 5$ e $2 \\cdot 3 = 6$.",
                    },
                    {
                        type: "text",
                        value: "## Simplificando frações algébricas\n\nUma **fração algébrica** é um quociente de polinômios. Para simplificá-la, fatoramos o numerador e o denominador e cancelamos os fatores comuns. Veja:\n\n$$\\frac{x^2 - 4}{x + 2} = \\frac{(x + 2)(x - 2)}{x + 2} = x - 2$$\n\nO cancelamento vale para $x \\neq -2$, valor que anularia o denominador original.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nVamos simplificar $\\dfrac{x^2 - 1}{x^2 + 2x + 1}$.\n\n1. Fatoramos o numerador como diferença de quadrados: $x^2 - 1 = (x + 1)(x - 1)$.\n2. Fatoramos o denominador como trinômio quadrado perfeito: $x^2 + 2x + 1 = (x + 1)^2$.\n3. Cancelamos o fator comum $(x + 1)$:\n\n$$\\frac{(x + 1)(x - 1)}{(x + 1)^2} = \\frac{x - 1}{x + 1}$$\n\nválido para $x \\neq -1$.",
                    },
                    {
                        type: "quote",
                        value: "Fatorar é escrever como produto. As técnicas principais são fator comum, diferença de quadrados e fatoração de trinômios pela soma e produto. Fatorar numerador e denominador é o caminho para simplificar frações algébricas, sempre respeitando os valores que anulam o denominador.",
                    },
                ],
                questions: [
                    {
                        statement: "Fatorando $x^2 - 9$, obtemos:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(x + 3)(x - 3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(x + 3)^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x - 3)^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x + 9)(x - 1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Colocando o fator comum em evidência, $6x^2 + 9x$ é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$3x(2x + 3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$3x(2x + 9)$",
                                isCorrect: false,
                            },
                            {
                                text: "$6x(x + 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$3(2x + 3)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Fatorando o trinômio $x^2 + 5x + 6$, obtemos:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(x + 2)(x + 3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(x + 1)(x + 6)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x - 2)(x - 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x + 5)(x + 6)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Simplificando a fração $\\dfrac{x^2 - 4}{x + 2}$ (para $x \\neq -2$), obtemos:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x - 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x + 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x - 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^2 - 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Simplificando $\\dfrac{x^2 - 1}{x^2 + 2x + 1}$ (para $x \\neq -1$), obtemos:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{x - 1}{x + 1}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{x + 1}{x - 1}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{x + 1}$",
                                isCorrect: false,
                            },
                            {
                                text: "$x - 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Equações e inequações",
        aulas: [
            {
                titulo: "Equações do 1º grau",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é uma equação do 1º grau\n\nUma **equação do primeiro grau** na incógnita $x$ é toda igualdade que pode ser escrita na forma $ax + b = 0$, com $a$ e $b$ números reais e $a \\ne 0$.\n\nO expoente da incógnita é sempre $1$, e por isso a equação tem, no máximo, uma única solução. Resolver a equação é encontrar o valor de $x$ que torna a igualdade verdadeira.",
                    },
                    {
                        type: "text",
                        value: "## O princípio de equivalência\n\nPara isolar a incógnita usamos operações que não mudam as soluções. Duas delas são a base de tudo:\n\n- Somar ou subtrair o mesmo número dos dois lados.\n- Multiplicar ou dividir os dois lados pelo mesmo número diferente de zero.\n\nPense na equação como uma balança em equilíbrio: o que você faz de um lado precisa fazer do outro.",
                    },
                    {
                        type: "text",
                        value: "## A solução geral\n\nPartindo de $ax + b = 0$, subtraímos $b$ dos dois lados e depois dividimos por $a$:\n\n$$ax = -b \\quad \\Rightarrow \\quad x = \\frac{-b}{a}$$\n\nComo $a \\ne 0$, a divisão é sempre possível e o valor de $x$ é único.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nResolva $3x - 7 = 5$.\n\nSomamos $7$ aos dois lados: $3x = 12$.\n\nDividimos por $3$: $x = 4$.\n\nPara conferir, substituímos na equação original: $3 \\cdot 4 - 7 = 12 - 7 = 5$. Confere.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2 (com frações)\n\nResolva $\\frac{x}{2} + \\frac{x}{3} = 5$.\n\nO menor múltiplo comum de $2$ e $3$ é $6$. Multiplicamos os dois lados por $6$ para eliminar as frações:\n\n$$6 \\cdot \\frac{x}{2} + 6 \\cdot \\frac{x}{3} = 6 \\cdot 5 \\quad \\Rightarrow \\quad 3x + 2x = 30$$\n\nSomando os termos semelhantes, $5x = 30$, portanto $x = 6$.",
                    },
                    {
                        type: "text",
                        value: "## Quando não há solução única\n\nNem toda equação linear tem uma resposta numérica. Ao simplificar, pode sobrar uma sentença só com números:\n\n- Se sobrar algo falso, como $0 = 5$, a equação **não tem solução**.\n- Se sobrar algo sempre verdadeiro, como $0 = 0$, qualquer número serve e há **infinitas soluções**. Esse caso é chamado de identidade.",
                    },
                    {
                        type: "quote",
                        value: "Isolar a incógnita é fazer e desfazer operações na ordem certa: primeiro cuide das somas e subtrações, depois das multiplicações e divisões. No fim, substitua a resposta para conferir.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Forma geral $ax + b = 0$ com $a \\ne 0$, e solução única $x = \\frac{-b}{a}$.\n- Some ou subtraia o mesmo valor dos dois lados; multiplique ou divida por um número diferente de zero.\n- Com frações, multiplique tudo pelo mínimo múltiplo comum dos denominadores.\n- Chegar a $0 = k$ falso indica nenhuma solução; chegar a $0 = 0$ indica infinitas soluções.",
                    },
                ],
                questions: [
                    {
                        statement: "Resolva a equação $2x + 8 = 0$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = -4$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = -16$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 16$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a solução de $5x - 3 = 2x + 9$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 4$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = -4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 12$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Resolva a equação $\\frac{x - 1}{2} = \\frac{x + 3}{5}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x = \\frac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = \\frac{11}{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = \\frac{11}{7}$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = -\\frac{11}{3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um número somado ao seu triplo resulta em $24$. Qual é esse número?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$8$",
                                isCorrect: false,
                            },
                            {
                                text: "$12$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: true,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Resolva a equação $3x + 5 = 3x - 2$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Infinitas soluções",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma solução",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 7$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Equações do 2º grau",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é uma equação do 2º grau\n\nUma **equação do segundo grau** na incógnita $x$ tem a forma $ax^2 + bx + c = 0$, com $a \\ne 0$. O maior expoente da incógnita é $2$.\n\nDependendo dos coeficientes, ela pode ter duas raízes reais, uma só ou nenhuma.",
                    },
                    {
                        type: "text",
                        value: "## A fórmula de Bhaskara\n\nAs raízes saem da fórmula:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\nO termo dentro da raiz recebe um nome próprio, o discriminante:\n\n$$\\Delta = b^2 - 4ac$$\n\nCom ele, a fórmula fica mais enxuta: $x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.",
                    },
                    {
                        type: "text",
                        value: "## O que o discriminante revela\n\nO sinal de $\\Delta$ diz quantas raízes reais existem, antes mesmo de terminar a conta:\n\n| Valor de $\\Delta$ | Raízes reais |\n| --- | --- |\n| $\\Delta > 0$ | duas raízes distintas |\n| $\\Delta = 0$ | uma raiz (dupla) |\n| $\\Delta < 0$ | nenhuma raiz real |\n\nO símbolo $\\pm$ é o que gera as duas raízes quando $\\Delta > 0$: uma com o sinal de mais, outra com o de menos.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nResolva $x^2 - 5x + 6 = 0$.\n\nAqui $a = 1$, $b = -5$ e $c = 6$. Calculamos o discriminante:\n\n$$\\Delta = (-5)^2 - 4 \\cdot 1 \\cdot 6 = 25 - 24 = 1$$\n\nComo $\\Delta > 0$, há duas raízes. Aplicamos a fórmula:\n\n$$x = \\frac{-(-5) \\pm \\sqrt{1}}{2 \\cdot 1} = \\frac{5 \\pm 1}{2}$$\n\nLogo $x = \\frac{5 + 1}{2} = 3$ ou $x = \\frac{5 - 1}{2} = 2$.",
                    },
                    {
                        type: "text",
                        value: "## Equações incompletas\n\nQuando falta o termo $b$ ou o termo $c$, resolver fica mais rápido sem usar Bhaskara.\n\n- Se $c = 0$, coloque $x$ em evidência. Por exemplo, $x^2 + 2x = 0$ vira $x(x + 2) = 0$, então $x = 0$ ou $x = -2$.\n- Se $b = 0$, isole o quadrado. Por exemplo, $x^2 - 9 = 0$ vira $x^2 = 9$, então $x = \\pm 3$.",
                    },
                    {
                        type: "text",
                        value: "## Soma e produto das raízes\n\nChamando as raízes de $x_1$ e $x_2$, valem as relações de Girard:\n\n$$x_1 + x_2 = -\\frac{b}{a} \\qquad x_1 \\cdot x_2 = \\frac{c}{a}$$\n\nElas ajudam a conferir as raízes encontradas e, às vezes, a descobri-las de cabeça.",
                    },
                    {
                        type: "quote",
                        value: "Antes de aplicar a fórmula, calcule o discriminante e observe o sinal dele. Isso já antecipa quantas raízes reais você vai encontrar e evita tirar a raiz quadrada de um número negativo sem perceber.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Forma geral $ax^2 + bx + c = 0$ com $a \\ne 0$.\n- Fórmula de Bhaskara $x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$, com $\\Delta = b^2 - 4ac$.\n- $\\Delta > 0$ dá duas raízes, $\\Delta = 0$ dá uma, $\\Delta < 0$ não dá raiz real.\n- Soma das raízes $-\\frac{b}{a}$ e produto $\\frac{c}{a}$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é o discriminante $\\Delta$ da equação $x^2 - 5x + 6 = 0$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\Delta = 49$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\Delta = 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\Delta = -1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\Delta = 25$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quais são as raízes de $x^2 - 5x + 6 = 0$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$-2$ e $-3$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$ e $6$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$ e $3$",
                                isCorrect: true,
                            },
                            {
                                text: "$5$ e $6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Resolva a equação incompleta $x^2 - 49 = 0$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x = \\pm 7$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 7$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = \\pm 49$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = -7$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a soma das raízes de $x^2 - 7x + 10 = 0$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-7$",
                                isCorrect: false,
                            },
                            {
                                text: "$10$",
                                isCorrect: false,
                            },
                            {
                                text: "$7$",
                                isCorrect: true,
                            },
                            {
                                text: "$-10$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Resolva a equação $3x^2 - 2x - 1 = 0$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$-1$ e $\\frac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$ e $-\\frac{1}{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$1$ e $\\frac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-1$ e $-\\frac{1}{3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Sistemas de equações lineares",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é um sistema linear\n\nUm **sistema de equações lineares** reúne duas ou mais equações do primeiro grau que devem valer ao mesmo tempo. No caso mais comum temos duas equações e duas incógnitas, $x$ e $y$.\n\nResolver o sistema é achar o par $(x, y)$ que satisfaz todas as equações de uma vez.",
                    },
                    {
                        type: "text",
                        value: "## Uma leitura geométrica\n\nUm exemplo de sistema:\n\n$$\\begin{cases} x + y = 10 \\\\ x - y = 2 \\end{cases}$$\n\nCada equação representa uma reta no plano, e a solução é o ponto onde as duas retas se cruzam.",
                    },
                    {
                        type: "text",
                        value: "## Método da substituição\n\nIsolamos uma incógnita em uma das equações e substituímos na outra. Considere:\n\n$$\\begin{cases} y = 2x - 1 \\\\ x + y = 5 \\end{cases}$$\n\nA primeira equação já dá $y$ em função de $x$. Substituindo na segunda:\n\n$$x + (2x - 1) = 5 \\quad \\Rightarrow \\quad 3x - 1 = 5 \\quad \\Rightarrow \\quad x = 2$$\n\nVoltando em $y = 2x - 1$, obtemos $y = 3$. A solução é $(x, y) = (2, 3)$.",
                    },
                    {
                        type: "text",
                        value: "## Método da adição\n\nSomamos as equações de modo que uma das incógnitas desapareça. Funciona bem quando os coeficientes de uma variável são opostos.\n\nNo sistema $\\begin{cases} x + y = 10 \\\\ x - y = 2 \\end{cases}$, somando as duas equações o $y$ se cancela:\n\n$$2x = 12 \\quad \\Rightarrow \\quad x = 6$$\n\nSubstituindo em $x + y = 10$, achamos $y = 4$. A solução é $(6, 4)$.",
                    },
                    {
                        type: "text",
                        value: "## Ajustando os coeficientes\n\nÀs vezes é preciso multiplicar uma equação inteira por um número antes de somar, para criar coeficientes opostos.\n\nPara eliminar $x$ em $\\begin{cases} 2x + 3y = 8 \\\\ 3x + 2y = 7 \\end{cases}$, multiplicamos a primeira por $3$ e a segunda por $2$. Os coeficientes de $x$ ficam iguais a $6$, e a subtração das equações elimina o $x$.",
                    },
                    {
                        type: "text",
                        value: "## Quantas soluções um sistema pode ter\n\n- **Uma única solução**: as retas se cruzam em um ponto. É o caso mais comum, chamado de sistema possível e determinado.\n- **Infinitas soluções**: as duas equações descrevem a mesma reta (sistema possível e indeterminado).\n- **Nenhuma solução**: as retas são paralelas e distintas, como em $x + y = 2$ e $x + y = 5$ (sistema impossível).",
                    },
                    {
                        type: "quote",
                        value: "Depois de encontrar o par de valores, substitua nas duas equações originais. Só é solução do sistema o par que satisfaz todas as equações ao mesmo tempo, e não apenas uma delas.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Um sistema $2 \\times 2$ procura o par $(x, y)$ comum às duas equações.\n- Na substituição, isole uma incógnita e leve para a outra equação.\n- Na adição, combine as equações para cancelar uma incógnita, ajustando coeficientes se preciso.\n- O sistema pode ter uma, infinitas ou nenhuma solução.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Resolva o sistema $\\begin{cases} x + y = 7 \\\\ x - y = 1 \\end{cases}$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(x, y) = (4, 3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(x, y) = (3, 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x, y) = (4, -3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x, y) = (5, 2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Usando substituição, resolva $\\begin{cases} y = x + 1 \\\\ 2x + y = 10 \\end{cases}$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(x, y) = (4, 5)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x, y) = (3, 4)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(x, y) = (2, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x, y) = (3, 7)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Resolva o sistema $\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(x, y) = (1, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x, y) = (2, -1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x, y) = (2, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(x, y) = (3, 1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quantas soluções tem o sistema $\\begin{cases} x + y = 2 \\\\ x + y = 5 \\end{cases}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Infinitas",
                                isCorrect: false,
                            },
                            {
                                text: "Exatamente uma",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma",
                                isCorrect: true,
                            },
                            {
                                text: "Exatamente duas",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Resolva o sistema $\\begin{cases} 2x + 3y = 8 \\\\ 3x + 2y = 7 \\end{cases}$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$(x, y) = (2, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x, y) = (1, 2)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(x, y) = (1, -2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x, y) = (-1, 2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Inequações",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é uma inequação\n\nUma **inequação** compara duas expressões usando um dos sinais de desigualdade: menor que ($<$), menor ou igual ($\\le$), maior que ($>$) ou maior ou igual ($\\ge$).\n\nEnquanto uma equação costuma ter poucos valores como resposta, a solução de uma inequação é em geral um **intervalo** inteiro de números.",
                    },
                    {
                        type: "text",
                        value: "## As regras do jogo\n\nQuase tudo que vale para equações vale para inequações. Podemos somar ou subtrair o mesmo número dos dois lados sem alterar a desigualdade.\n\nA diferença decisiva está na multiplicação e na divisão por um número **negativo**: nesse caso o sinal da desigualdade se inverte.\n\nPor exemplo, de $-x < 3$ multiplicamos os dois lados por $-1$ e obtemos $x > -3$, trocando o $<$ por $>$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nResolva $2x - 3 < 5$.\n\nSomamos $3$ aos dois lados: $2x < 8$.\n\nDividimos por $2$, que é positivo, então o sinal não muda: $x < 4$.\n\nA solução é o intervalo $(-\\infty, 4)$, ou seja, todos os números menores que $4$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2 (multiplicando por negativo)\n\nResolva $-3x + 1 \\le 7$.\n\nSubtraímos $1$ dos dois lados: $-3x \\le 6$.\n\nDividimos por $-3$ e **invertemos** o sinal: $x \\ge -2$.\n\nA solução é o intervalo $[-2, +\\infty)$.",
                    },
                    {
                        type: "text",
                        value: "## Notação de intervalos\n\nCada desigualdade corresponde a um intervalo na reta. O colchete indica que o extremo entra no conjunto; o parêntese, que ele fica de fora.\n\n| Desigualdade | Intervalo |\n| --- | --- |\n| $x < a$ | $(-\\infty, a)$ |\n| $x \\le a$ | $(-\\infty, a]$ |\n| $x > a$ | $(a, +\\infty)$ |\n| $a \\le x < b$ | $[a, b)$ |",
                    },
                    {
                        type: "text",
                        value: "## Inequação dupla\n\nUma inequação como $-1 < 2x + 1 \\le 5$ tem dois limites ao mesmo tempo. Operamos nas três partes de uma vez.\n\nSubtraímos $1$ de tudo: $-2 < 2x \\le 4$.\n\nDividimos tudo por $2$: $-1 < x \\le 2$.",
                    },
                    {
                        type: "quote",
                        value: "O descuido mais comum em inequações é esquecer de virar o sinal ao multiplicar ou dividir por um número negativo. Sempre que fizer essa operação, pare e inverta a desigualdade antes de seguir.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Os sinais são $<$, $\\le$, $>$ e $\\ge$, e a solução costuma ser um intervalo.\n- Somar e subtrair funciona igual às equações.\n- Multiplicar ou dividir por número negativo inverte o sinal da desigualdade.\n- Colchete inclui o extremo; parêntese exclui, como em $[-2, +\\infty)$.",
                    },
                ],
                questions: [
                    {
                        statement: "Resolva a inequação $3x - 6 > 0$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x > 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x < 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x > -2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x > 18$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Resolva a inequação $-2x < 8$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x < -4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x > -4$",
                                isCorrect: true,
                            },
                            {
                                text: "$x > 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x < 4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Resolva a inequação $5 - 2x \\ge 1$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x \\ge 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\le 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\le 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x \\le -2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Resolva a inequação dupla $-3 \\le 2x - 1 < 5$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-1 < x \\le 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$-1 \\le x < 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$-2 \\le x < 6$",
                                isCorrect: false,
                            },
                            {
                                text: "$1 \\le x < 3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Resolva a inequação $x^2 - 4 < 0$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$x < -2$ ou $x > 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$-2 < x < 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x < 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$-4 < x < 4$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Equações e inequações com módulo",
                blocks: [
                    {
                        type: "text",
                        value: "## O módulo de um número\n\nO **módulo** (ou valor absoluto) de um número mede a distância dele até o zero na reta, sem levar em conta o sinal. Escrevemos $|x|$.\n\nPor definição:\n\n$$|x| = \\begin{cases} x, & \\text{se } x \\ge 0 \\\\ -x, & \\text{se } x < 0 \\end{cases}$$\n\nAssim, $|5| = 5$ e $|-5| = 5$. O resultado nunca é negativo.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades úteis\n\n- $|x| \\ge 0$ para todo $x$, e $|x| = 0$ apenas quando $x = 0$.\n- $|x| = |-x|$, pois a distância não depende do sinal.\n- $|x \\cdot y| = |x| \\cdot |y|$.\n\nEnxergar o módulo como distância é a chave para resolver equações e inequações com ele.",
                    },
                    {
                        type: "text",
                        value: "## Equações com módulo\n\nA ideia central é simples: se $|E| = k$ com $k \\ge 0$, então a expressão $E$ que está dentro do módulo pode valer $k$ ou $-k$. Resolvemos os dois casos.\n\nSe $k < 0$, a equação não tem solução, pois um módulo nunca é negativo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nResolva $|2x - 1| = 7$.\n\nAbrimos os dois casos:\n\n- Caso positivo: $2x - 1 = 7 \\Rightarrow 2x = 8 \\Rightarrow x = 4$.\n- Caso negativo: $2x - 1 = -7 \\Rightarrow 2x = -6 \\Rightarrow x = -3$.\n\nAs soluções são $x = 4$ e $x = -3$.",
                    },
                    {
                        type: "text",
                        value: "## Inequações com módulo\n\nTambém aqui pensamos em distância. Para $k > 0$:\n\n- $|x| < k$ significa que $x$ está a menos de $k$ do zero, logo $-k < x < k$.\n- $|x| > k$ significa que $x$ está a mais de $k$ do zero, logo $x < -k$ ou $x > k$.\n\nOs sinais $\\le$ e $\\ge$ seguem a mesma ideia, apenas incluindo os extremos.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nResolva $|x - 3| < 2$.\n\nComo o sinal é de menor, escrevemos a desigualdade dupla:\n\n$$-2 < x - 3 < 2$$\n\nSomamos $3$ nas três partes: $1 < x < 5$. A solução é o intervalo $(1, 5)$.",
                    },
                    {
                        type: "quote",
                        value: "Traduza o módulo para a linguagem de distância. Uma igualdade vira dois casos, o sinal de menor vira um intervalo entre dois valores, e o sinal de maior vira dois pedaços separados na reta.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $|x|$ é a distância de $x$ até o zero, sempre maior ou igual a zero.\n- $|E| = k$ com $k \\ge 0$ gera os casos $E = k$ e $E = -k$.\n- $|x| < k$ vira $-k < x < k$.\n- $|x| > k$ vira $x < -k$ ou $x > k$.",
                    },
                ],
                questions: [
                    {
                        statement: "Resolva a equação $|x| = 9$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = 9$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = \\pm 9$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = -9$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = \\pm 18$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Resolva a equação $|x + 2| = 6$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$4$ e $8$",
                                isCorrect: false,
                            },
                            {
                                text: "$-4$ e $8$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$ e $-8$",
                                isCorrect: true,
                            },
                            {
                                text: "$-4$ e $-8$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Resolva a equação $|2x - 1| = 7$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$3$ e $-4$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$ e $-3$",
                                isCorrect: true,
                            },
                            {
                                text: "$4$ e $3$",
                                isCorrect: false,
                            },
                            {
                                text: "$-4$ e $-3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Resolva a inequação $|x| < 5$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x < -5$ ou $x > 5$",
                                isCorrect: false,
                            },
                            {
                                text: "$-5 < x < 5$",
                                isCorrect: true,
                            },
                            {
                                text: "$x < 5$",
                                isCorrect: false,
                            },
                            {
                                text: "$0 < x < 5$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Resolva a inequação $|x - 2| \\ge 3$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$-1 \\le x \\le 5$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\le -1$ ou $x \\ge 5$",
                                isCorrect: true,
                            },
                            {
                                text: "$x \\le -5$ ou $x \\ge 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$-1 < x < 5$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Funções",
        aulas: [
            {
                titulo: "O conceito de função: domínio e imagem",
                blocks: [
                    {
                        type: "text",
                        value: "Uma **função** é uma regra que associa a cada elemento de um conjunto de entrada exatamente um elemento de um conjunto de saída. Escrevemos $f: A \\to B$ para dizer que $f$ leva elementos de $A$ em elementos de $B$. Se $x$ pertence a $A$, o elemento associado a ele é $f(x)$, lido como *f de x*.\n\nA palavra-chave é *exatamente um*: para cada entrada, uma única saída. Se uma mesma entrada pudesse gerar dois valores diferentes, não teríamos uma função.",
                    },
                    {
                        type: "text",
                        value: "Três conjuntos aparecem sempre que falamos de uma função:\n\n- **Domínio**: o conjunto de todas as entradas permitidas, onde $x$ pode viver.\n- **Contradomínio**: o conjunto de chegada $B$, onde os valores de saída moram.\n- **Imagem**: o conjunto dos valores que realmente saem, ou seja, todo $f(x)$ obtido quando $x$ percorre o domínio.\n\nA imagem está sempre contida no contradomínio, mas os dois nem sempre coincidem. Em $f(x) = x^2$ com $f: \\mathbb{R} \\to \\mathbb{R}$, o contradomínio é $\\mathbb{R}$, mas a imagem é apenas $[0, +\\infty)$, pois um quadrado nunca é negativo.",
                    },
                    {
                        type: "quote",
                        value: "Pense numa função como uma máquina: você coloca um número na entrada e ela devolve um único número na saída.",
                    },
                    {
                        type: "text",
                        value: "Quando a função é dada só pela fórmula, combinamos que o domínio é o maior conjunto de reais para o qual a conta faz sentido. Três situações costumam restringir esse domínio:\n\n1. **Denominador**: não pode ser zero, pois não existe divisão por zero.\n2. **Raiz de índice par**: o que está dentro precisa ser maior ou igual a zero, já que a raiz quadrada de um número negativo não é um número real.\n3. **Logaritmo**: o argumento precisa ser estritamente positivo.\n\nSem nenhum desses obstáculos, como num polinômio, o domínio é $\\mathbb{R}$ inteiro.",
                    },
                    {
                        type: "text",
                        value: "**Exemplo 1.** Qual o domínio de $f(x) = \\frac{1}{x - 3}$?\n\nO único cuidado é o denominador, que não pode ser zero. Impomos:\n$$x - 3 \\ne 0 \\Rightarrow x \\ne 3.$$\nLogo o domínio é $D(f) = \\{x \\in \\mathbb{R} : x \\ne 3\\}$, ou seja, todos os reais menos o $3$.",
                    },
                    {
                        type: "text",
                        value: "**Exemplo 2.** Qual o domínio e a imagem de $f(x) = \\sqrt{x - 2}$?\n\nPor ser uma raiz quadrada, exigimos que o radicando não seja negativo:\n$$x - 2 \\ge 0 \\Rightarrow x \\ge 2.$$\nO domínio é $D(f) = [2, +\\infty)$. Para a imagem, note que $\\sqrt{x - 2}$ começa em $0$, quando $x = 2$, e cresce sem limite. Assim, a imagem é $[0, +\\infty)$.",
                    },
                    {
                        type: "text",
                        value: "**Resumo.** Uma função associa a cada entrada uma única saída. O domínio reúne as entradas válidas, o contradomínio é o conjunto de chegada e a imagem são os valores efetivamente atingidos. Para achar o domínio de uma fórmula, evite divisão por zero, raiz par de número negativo e logaritmo de número não positivo.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o domínio de $f(x) = \\sqrt{x - 2}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x \\ge 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x > 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\le 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\ne 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o domínio de $f(x) = \\frac{1}{x - 3}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x \\ne 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\ge 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\ne -3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Se $f(x) = 2x + 1$, quanto vale $f(3)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$7$",
                                isCorrect: true,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com $f: \\mathbb{R} \\to \\mathbb{R}$, qual é a imagem de $f(x) = x^2$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$y \\ge 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$y > 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\mathbb{R}$",
                                isCorrect: false,
                            },
                            {
                                text: "$y \\le 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o domínio de $f(x) = \\frac{x + 1}{x^2 - 4}$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$x \\ne 2$ e $x \\ne -2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x \\ne 4$ e $x \\ne -4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\ne -1$ e $x \\ne 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\ne 2$ e $x \\ne 4$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Gráfico de uma função",
                blocks: [
                    {
                        type: "text",
                        value: "O **gráfico** de uma função $f$ é o conjunto de todos os pontos $(x, y)$ do plano cartesiano em que $y = f(x)$, com $x$ percorrendo o domínio. Cada entrada $x$ vira a abscissa, a posição horizontal, e a saída $f(x)$ vira a ordenada, a posição vertical do ponto.\n\nVisualizar o gráfico é enxergar de uma vez o comportamento inteiro da função: onde ela sobe, onde desce, onde cruza os eixos.",
                    },
                    {
                        type: "text",
                        value: "Para esboçar um gráfico à mão, escolhemos alguns valores de $x$, calculamos $f(x)$ e marcamos os pontos $(x, f(x))$. Depois ligamos os pontos respeitando o tipo de função.\n\nPara $f(x) = 2x - 1$, por exemplo:\n\n| $x$ | $f(x) = 2x - 1$ |\n|:---:|:---:|\n| $-1$ | $-3$ |\n| $0$ | $-1$ |\n| $1$ | $1$ |\n| $2$ | $3$ |\n\nMarcando esses quatro pontos e ligando, obtemos uma reta, como era de esperar para uma função do primeiro grau.",
                    },
                    {
                        type: "text",
                        value: "**Teste da reta vertical.** Nem toda curva desenhada no plano é gráfico de função. Como cada $x$ do domínio tem uma única imagem, nenhuma reta vertical pode cortar o gráfico em mais de um ponto.\n\nSe existe uma reta vertical que toca a curva em dois ou mais pontos, aquele $x$ teria duas saídas diferentes, e portanto a curva não representa uma função. Uma circunferência, por exemplo, não passa no teste.",
                    },
                    {
                        type: "text",
                        value: "O gráfico também revela domínio e imagem. Projetando a curva sobre o eixo $x$, o eixo horizontal, obtemos o **domínio**: todos os valores de $x$ efetivamente usados. Projetando sobre o eixo $y$, o eixo vertical, obtemos a **imagem**: todas as alturas atingidas.\n\nÉ a leitura da sombra no chão, que dá o domínio, e da sombra na parede, que dá a imagem.",
                    },
                    {
                        type: "text",
                        value: "Dois lugares do gráfico merecem atenção especial:\n\n- **Interseção com o eixo $y$**: acontece em $x = 0$ e vale $f(0)$. O ponto é $(0, f(0))$.\n- **Interseções com o eixo $x$**: são as **raízes**, ou **zeros**, da função, os valores de $x$ com $f(x) = 0$.\n\nPara $f(x) = 3x - 6$, o corte no eixo $y$ é $f(0) = -6$, no ponto $(0, -6)$. A raiz vem de $3x - 6 = 0$, ou seja $x = 2$, no ponto $(2, 0)$.",
                    },
                    {
                        type: "quote",
                        value: "Antes de decorar fórmulas, aprenda a ler o desenho: o gráfico conta a história da função de um só olhar.",
                    },
                    {
                        type: "text",
                        value: "**Exemplo.** O ponto $(2, 5)$ pertence ao gráfico de $f(x) = 2x + 1$?\n\nUm ponto $(a, b)$ está no gráfico quando $b = f(a)$. Aqui basta testar $x = 2$:\n$$f(2) = 2 \\cdot 2 + 1 = 5.$$\nComo $f(2) = 5$ coincide com a ordenada dada, o ponto $(2, 5)$ pertence ao gráfico.",
                    },
                    {
                        type: "text",
                        value: "**Resumo.** O gráfico é o conjunto dos pontos $(x, f(x))$. Construímos por tabela de valores; validamos se uma curva é função pelo teste da reta vertical; lemos o domínio na projeção horizontal e a imagem na vertical. As raízes ficam onde a curva corta o eixo $x$, e o corte no eixo $y$ é $f(0)$.",
                    },
                ],
                questions: [
                    {
                        statement: "Em que ponto o gráfico de $f(x) = 3x - 6$ corta o eixo $y$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(0, -6)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(0, 6)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-6, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a raiz (o zero) de $f(x) = 3x - 6$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = -2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 6$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = -6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O ponto $(1, 3)$ pertence ao gráfico de $f(x) = 2x + 1$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Sim, pois $f(1) = 3$",
                                isCorrect: true,
                            },
                            {
                                text: "Não, pois $f(1) = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, pois $f(1) = 2$",
                                isCorrect: false,
                            },
                            {
                                text: "Não, pois $f(1) = 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Pelo teste da reta vertical, qual curva NÃO é gráfico de uma função de $x$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Uma circunferência",
                                isCorrect: true,
                            },
                            {
                                text: "A reta $y = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "Uma reta inclinada",
                                isCorrect: false,
                            },
                            {
                                text: "A parábola $y = x^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma função tem ponto mais baixo em $y = -2$ e sobe sem limite. Qual é a sua imagem?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$y \\ge -2$",
                                isCorrect: true,
                            },
                            {
                                text: "$y \\le -2$",
                                isCorrect: false,
                            },
                            {
                                text: "$y \\ge 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\ge -2$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Crescimento, decrescimento e paridade",
                blocks: [
                    {
                        type: "text",
                        value: "Dizemos que uma função é **crescente** num intervalo quando, ao aumentar $x$, o valor $f(x)$ também aumenta. Em símbolos, para quaisquer $x_1 < x_2$ do intervalo vale $f(x_1) < f(x_2)$.\n\nEla é **decrescente** quando ao aumentar $x$ o valor $f(x)$ diminui, isto é, $x_1 < x_2 \\Rightarrow f(x_1) > f(x_2)$. A mesma função pode crescer num pedaço do domínio e decrescer em outro.",
                    },
                    {
                        type: "text",
                        value: "**Exemplo.** A parábola $f(x) = x^2$ decresce enquanto $x$ vai de $-\\infty$ até $0$ e cresce de $0$ até $+\\infty$.\n\nConfira com valores: de $x = -2$ para $x = -1$, os valores caem de $4$ para $1$, decrescendo. De $x = 1$ para $x = 2$, sobem de $1$ para $4$, crescendo. O ponto de virada é $x = 0$.",
                    },
                    {
                        type: "text",
                        value: "A **paridade** classifica a simetria do gráfico. Uma função é **par** quando trocar $x$ por $-x$ não muda o resultado, ou seja, $f(-x) = f(x)$ para todo $x$ do domínio.\n\nGraficamente, o gráfico de uma função par é simétrico em relação ao eixo $y$: a metade da esquerda é o espelho da metade da direita. O exemplo clássico é $f(x) = x^2$, pois $(-x)^2 = x^2$.",
                    },
                    {
                        type: "text",
                        value: "Uma função é **ímpar** quando trocar $x$ por $-x$ inverte o sinal do resultado, isto é, $f(-x) = -f(x)$ para todo $x$ do domínio.\n\nO gráfico de uma função ímpar tem simetria em relação à origem: girando $180^\\circ$ em torno do ponto $(0, 0)$, ele coincide consigo mesmo. O exemplo clássico é $f(x) = x^3$, pois $(-x)^3 = -x^3$.",
                    },
                    {
                        type: "text",
                        value: "Para descobrir a paridade, calcule $f(-x)$ e compare:\n\n- se $f(-x) = f(x)$, a função é **par**;\n- se $f(-x) = -f(x)$, a função é **ímpar**;\n- se não cair em nenhum dos dois casos, a função **não tem paridade**, nem par nem ímpar.\n\nMuitas funções não são nem pares nem ímpares, então esse resultado também é comum.",
                    },
                    {
                        type: "quote",
                        value: "Par é espelho no eixo vertical; ímpar é giro de meia volta em torno da origem. A simetria é a assinatura da paridade.",
                    },
                    {
                        type: "text",
                        value: "**Exemplo resolvido.** Classifique quanto à paridade.\n\n$g(x) = x^3 - x$. Calculamos $g(-x) = (-x)^3 - (-x) = -x^3 + x = -(x^3 - x) = -g(x)$. Logo $g$ é **ímpar**.\n\n$h(x) = x^2 + x$. Aqui $h(-x) = (-x)^2 + (-x) = x^2 - x$. Isso não é igual a $h(x) = x^2 + x$ nem ao seu oposto $-h(x) = -x^2 - x$. Portanto $h$ **não é par nem ímpar**.",
                    },
                    {
                        type: "text",
                        value: "**Resumo.** Uma função cresce quando $f(x)$ acompanha o aumento de $x$ e decresce quando $f(x)$ cai. Quanto à paridade, calcule $f(-x)$: igual a $f(x)$ indica função par, simétrica no eixo $y$; igual a $-f(x)$ indica função ímpar, simétrica na origem; nenhum dos casos indica função sem paridade.",
                    },
                ],
                questions: [
                    {
                        statement: "Classifique a função $f(x) = x^4$ quanto à paridade.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Função par",
                                isCorrect: true,
                            },
                            {
                                text: "Função ímpar",
                                isCorrect: false,
                            },
                            {
                                text: "Sem paridade",
                                isCorrect: false,
                            },
                            {
                                text: "Par e ímpar",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Classifique a função $f(x) = x^3$ quanto à paridade.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Função ímpar",
                                isCorrect: true,
                            },
                            {
                                text: "Função par",
                                isCorrect: false,
                            },
                            {
                                text: "Sem paridade",
                                isCorrect: false,
                            },
                            {
                                text: "Par e ímpar",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Classifique a função $f(x) = x^2 + x$ quanto à paridade.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Sem paridade",
                                isCorrect: true,
                            },
                            {
                                text: "Função par",
                                isCorrect: false,
                            },
                            {
                                text: "Função ímpar",
                                isCorrect: false,
                            },
                            {
                                text: "Par e ímpar",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Em qual intervalo a função $f(x) = x^2$ é decrescente?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(-\\infty, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(0, +\\infty)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-\\infty, +\\infty)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-2, 2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Classifique a função $f(x) = x^3 + 1$ quanto à paridade.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Sem paridade",
                                isCorrect: true,
                            },
                            {
                                text: "Função ímpar",
                                isCorrect: false,
                            },
                            {
                                text: "Função par",
                                isCorrect: false,
                            },
                            {
                                text: "Par e ímpar",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Transformações de gráficos",
                blocks: [
                    {
                        type: "text",
                        value: "Muitas funções novas são apenas versões *deslocadas*, *refletidas* ou *esticadas* de uma função que já conhecemos. Em vez de montar uma tabela do zero, partimos de um gráfico base, como $f(x) = x^2$, e aplicamos transformações. Dominar isso acelera muito o esboço de gráficos.",
                    },
                    {
                        type: "text",
                        value: "**Translação vertical.** Somar uma constante $k > 0$ à função,\n$$g(x) = f(x) + k,$$\ndesloca o gráfico inteiro $k$ unidades para cima. Subtrair, isto é $f(x) - k$, desloca $k$ unidades para baixo. A forma da curva não muda, só a altura.",
                    },
                    {
                        type: "text",
                        value: "**Translação horizontal.** Aqui o sinal engana. Trocar $x$ por $x - h$,\n$$g(x) = f(x - h),$$\ndesloca o gráfico $h$ unidades para a **direita** quando $h > 0$. Já $f(x + h)$ desloca para a **esquerda**. Parece invertido, mas faz sentido: para o novo gráfico atingir em $x = h$ o mesmo valor que o antigo atingia em $x = 0$, é preciso *atrasar* a entrada.",
                    },
                    {
                        type: "text",
                        value: "**Reflexões.** Colocar um sinal de menos na frente,\n$$g(x) = -f(x),$$\nreflete o gráfico em relação ao eixo $x$, virando a curva de cabeça para baixo. Trocar o sinal de dentro, $g(x) = f(-x)$, reflete em relação ao eixo $y$, espelhando esquerda com direita.",
                    },
                    {
                        type: "text",
                        value: "**Alongamento e compressão vertical.** Multiplicar a função por uma constante $a > 0$,\n$$g(x) = a \\cdot f(x),$$\nestica o gráfico verticalmente quando $a > 1$, deixando a curva mais alta, e comprime quando $0 < a < 1$, deixando a curva mais achatada. Se $a$ for negativo, além de esticar ou comprimir, também reflete no eixo $x$.",
                    },
                    {
                        type: "quote",
                        value: "O que está por fora da função mexe na altura do gráfico; o que está junto do x mexe na horizontal, e quase sempre ao contrário do que se espera.",
                    },
                    {
                        type: "text",
                        value: "**Exemplo resolvido.** Como obter o gráfico de $g(x) = (x - 2)^2 + 3$ a partir de $f(x) = x^2$?\n\nLeia por partes:\n\n1. O $(x - 2)$ dentro do quadrado desloca a parábola $2$ unidades para a **direita**.\n2. O $+3$ por fora desloca $3$ unidades para **cima**.\n\nJuntando, o vértice sai de $(0, 0)$ e vai para $(2, 3)$, mantendo o formato da parábola original.",
                    },
                    {
                        type: "text",
                        value: "**Resumo.** Transformações reaproveitam gráficos conhecidos. Por fora do $f$: $f(x) + k$ sobe ou desce, $a \\cdot f(x)$ estica ou comprime, $-f(x)$ reflete no eixo $x$. Por dentro, junto do $x$: $f(x - h)$ desloca na horizontal, para a direita se $h > 0$, e $f(-x)$ reflete no eixo $y$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Em relação ao gráfico de $f$, o gráfico de $g(x) = f(x) + 3$ fica deslocado",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$3$ para cima",
                                isCorrect: true,
                            },
                            {
                                text: "$3$ para baixo",
                                isCorrect: false,
                            },
                            {
                                text: "$3$ para a direita",
                                isCorrect: false,
                            },
                            {
                                text: "$3$ para a esquerda",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em relação ao gráfico de $f$, o gráfico de $g(x) = f(x - 2)$ fica deslocado",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$2$ para a direita",
                                isCorrect: true,
                            },
                            {
                                text: "$2$ para a esquerda",
                                isCorrect: false,
                            },
                            {
                                text: "$2$ para cima",
                                isCorrect: false,
                            },
                            {
                                text: "$2$ para baixo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O gráfico de $g(x) = -f(x)$ é o gráfico de $f$ refletido",
                        difficulty: "medio",
                        options: [
                            {
                                text: "no eixo $x$",
                                isCorrect: true,
                            },
                            {
                                text: "no eixo $y$",
                                isCorrect: false,
                            },
                            {
                                text: "na origem",
                                isCorrect: false,
                            },
                            {
                                text: "na reta $y = x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Partindo de $f(x) = x^2$, o gráfico de $g(x) = (x + 1)^2$ é a parábola deslocada",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1$ para a esquerda",
                                isCorrect: true,
                            },
                            {
                                text: "$1$ para a direita",
                                isCorrect: false,
                            },
                            {
                                text: "$1$ para cima",
                                isCorrect: false,
                            },
                            {
                                text: "$1$ para baixo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o vértice do gráfico de $g(x) = (x - 2)^2 + 3$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$(2, 3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(-2, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, -3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Composição e função inversa",
                blocks: [
                    {
                        type: "text",
                        value: "A **composição** de duas funções aplica uma depois da outra. Dadas $f$ e $g$, a função composta $g \\circ f$ é definida por\n$$(g \\circ f)(x) = g(f(x)).$$\nLeia de dentro para fora: primeiro aplicamos $f$ em $x$, depois aplicamos $g$ no resultado. O símbolo $\\circ$ se lê *bola* ou *composta com*.",
                    },
                    {
                        type: "text",
                        value: "A ordem importa. Em geral,\n$$(g \\circ f)(x) \\ne (f \\circ g)(x).$$\nTrocar a ordem muda qual função age primeiro e costuma dar resultados diferentes. Além disso, para $g(f(x))$ fazer sentido, a saída de $f$ precisa ser uma entrada válida para $g$.",
                    },
                    {
                        type: "text",
                        value: "**Exemplo resolvido.** Sejam $f(x) = x + 1$ e $g(x) = x^2$. Vamos compor nas duas ordens.\n\n$(g \\circ f)(x) = g(f(x)) = g(x + 1) = (x + 1)^2$.\n\n$(f \\circ g)(x) = f(g(x)) = f(x^2) = x^2 + 1$.\n\nSão claramente diferentes: $(x + 1)^2$ não é o mesmo que $x^2 + 1$. Isso confirma que a ordem da composição altera o resultado.",
                    },
                    {
                        type: "text",
                        value: "Para um valor específico, basta ir substituindo. Ainda com $f(x) = x + 1$ e $g(x) = x^2$, calculamos $(g \\circ f)(3)$:\n$$(g \\circ f)(3) = g(f(3)) = g(4) = 16.$$\nPrimeiro $f(3) = 4$; depois $g(4) = 4^2 = 16$.",
                    },
                    {
                        type: "text",
                        value: "A **função inversa** de $f$, escrita $f^{-1}$, desfaz o que $f$ fez. Se $f$ leva $a$ em $b$, então $f^{-1}$ leva $b$ de volta em $a$. Assim,\n$$f^{-1}(f(x)) = x.$$\nAtenção: o $-1$ em $f^{-1}$ é notação de inversa, **não** é expoente. Ou seja, $f^{-1}(x)$ não significa $\\frac{1}{f(x)}$.",
                    },
                    {
                        type: "text",
                        value: "**Como achar a inversa.** Um roteiro prático:\n\n1. escreva $y = f(x)$;\n2. troque $x$ por $y$ e $y$ por $x$;\n3. isole o novo $y$;\n4. esse $y$ é $f^{-1}(x)$.\n\n**Exemplo.** Para $f(x) = 2x + 1$, partimos de $y = 2x + 1$. Trocando, $x = 2y + 1$. Isolando $y$: $x - 1 = 2y$, logo $y = \\frac{x - 1}{2}$. Portanto $f^{-1}(x) = \\frac{x - 1}{2}$.",
                    },
                    {
                        type: "quote",
                        value: "Compor é encaixar uma função na outra; inverter é desfazer o caminho e voltar ao ponto de partida.",
                    },
                    {
                        type: "text",
                        value: "Nem toda função tem inversa: só as que são **injetoras**, em que entradas diferentes levam a saídas diferentes, podem ser desfeitas sem ambiguidade. Uma consequência bonita é que os gráficos de $f$ e $f^{-1}$ são simétricos em relação à reta $y = x$.\n\n**Resumo.** A composta $(g \\circ f)(x) = g(f(x))$ aplica $f$ e depois $g$, e a ordem importa. A inversa $f^{-1}$ desfaz $f$, com $f^{-1}(f(x)) = x$; para encontrá-la, troque $x$ e $y$ e isole. Só funções injetoras têm inversa.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Sejam $f(x) = x + 1$ e $g(x) = x^2$. Quanto vale $(g \\circ f)(3)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$16$",
                                isCorrect: true,
                            },
                            {
                                text: "$10$",
                                isCorrect: false,
                            },
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A composta $(f \\circ g)(x)$ é definida como",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$f(g(x))$",
                                isCorrect: true,
                            },
                            {
                                text: "$g(f(x))$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(x) \\cdot g(x)$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(x) + g(x)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a inversa de $f(x) = 2x + 1$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$f^{-1}(x) = \\frac{x - 1}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$f^{-1}(x) = \\frac{x + 1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$f^{-1}(x) = 2x - 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$f^{-1}(x) = \\frac{1}{2x + 1}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Sejam $f(x) = x + 1$ e $g(x) = x^2$. Qual é $(g \\circ f)(x)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(x + 1)^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x^2 + 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x - 1)^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^2 - 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Sejam $f(x) = x + 1$ e $g(x) = 2x$. Qual é $(f \\circ g)(x)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$2x + 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$2x + 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$2x$",
                                isCorrect: false,
                            },
                            {
                                text: "$x + 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Funções afim, quadrática e polinomial",
        aulas: [
            {
                titulo: "Função afim",
                blocks: [
                    {
                        type: "text",
                        value: "# Função afim\n\nUma **função afim** é toda função que pode ser escrita na forma $f(x) = ax + b$, com $a$ e $b$ reais e $a \\neq 0$. O número $a$ é o **coeficiente angular** e $b$ é o **coeficiente linear**.\n\nO gráfico de uma função afim é sempre uma **reta**. Ela modela situações de variação constante, como o valor de uma corrida de aplicativo com uma taxa fixa de embarque somada a um preço por quilômetro rodado.",
                    },
                    {
                        type: "text",
                        value: "## O que cada coeficiente representa\n\nO coeficiente linear $b$ diz onde a reta cruza o eixo vertical, pois $f(0) = a \\cdot 0 + b = b$. Já o coeficiente angular $a$ mede a inclinação da reta: a cada aumento de $1$ unidade em $x$, o valor de $f(x)$ varia $a$ unidades.\n\nConhecendo dois pontos $(x_1, y_1)$ e $(x_2, y_2)$ da reta, calculamos o coeficiente angular pela razão entre as variações:\n\n$$a = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}$$",
                    },
                    {
                        type: "text",
                        value: "## Crescente ou decrescente\n\nO sinal de $a$ determina o comportamento da função:\n\n- Se $a > 0$, a função é **crescente**: quando $x$ aumenta, $f(x)$ também aumenta.\n- Se $a < 0$, a função é **decrescente**: quando $x$ aumenta, $f(x)$ diminui.\n\nQuando $a = 0$, a expressão vira $f(x) = b$, uma função constante, que não é considerada afim justamente por não ter inclinação.",
                    },
                    {
                        type: "text",
                        value: "## Raiz da função afim\n\nA **raiz** (ou zero) da função é o valor de $x$ que torna $f(x) = 0$, ou seja, o ponto em que a reta cruza o eixo horizontal. Basta resolver a equação $ax + b = 0$:\n\n$$x = -\\frac{b}{a}$$\n\nComo $a \\neq 0$, toda função afim tem exatamente uma raiz.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nVamos analisar a função $f(x) = 2x - 6$.\n\n1. Coeficientes: $a = 2$ e $b = -6$.\n2. Como $a = 2 > 0$, a função é crescente.\n3. Raiz: resolvemos $2x - 6 = 0$, logo $2x = 6$ e $x = 3$.\n\nPortanto, a reta cruza o eixo horizontal em $x = 3$ e o eixo vertical em $y = -6$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nQual é a função afim cujo gráfico passa pelos pontos $(1, 5)$ e $(3, 9)$?\n\nPrimeiro achamos o coeficiente angular:\n\n$$a = \\frac{9 - 5}{3 - 1} = \\frac{4}{2} = 2$$\n\nAgora usamos um dos pontos para descobrir $b$. Substituindo $(1, 5)$ em $f(x) = 2x + b$, temos $5 = 2 \\cdot 1 + b$, o que dá $b = 3$. A função procurada é $f(x) = 2x + 3$.",
                    },
                    {
                        type: "quote",
                        value: "Uma reta fica completamente determinada por dois pontos: descubra a inclinação e um ponto por onde ela passa, e você conhece a função inteira.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Função afim: $f(x) = ax + b$, com $a \\neq 0$, e gráfico em forma de reta.\n- $a$ é o coeficiente angular (inclinação) e $b$ é o coeficiente linear (cruza o eixo vertical).\n- $a > 0$ indica função crescente e $a < 0$ indica função decrescente.\n- A raiz é $x = -\\frac{b}{a}$, ponto em que a reta cruza o eixo horizontal.",
                    },
                ],
                questions: [
                    {
                        statement: "Na função afim $f(x) = 3x - 6$, qual é o coeficiente angular?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$-6$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$-3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a raiz da função afim $f(x) = 2x - 8$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = 4$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = -4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 8$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 16$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A função afim $f(x) = -5x + 2$ é classificada como:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "decrescente, pois $a < 0$",
                                isCorrect: true,
                            },
                            {
                                text: "crescente, pois $a > 0$",
                                isCorrect: false,
                            },
                            {
                                text: "crescente, pois $b = 2$ é positivo",
                                isCorrect: false,
                            },
                            {
                                text: "constante, pois $a < 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma reta passa pelos pontos $(1, 3)$ e $(3, 7)$. Qual é o seu coeficiente angular?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-2$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma função afim satisfaz $f(0) = 5$ e $f(2) = 1$. Qual é a sua lei de formação?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$f(x) = -2x + 5$",
                                isCorrect: true,
                            },
                            {
                                text: "$f(x) = 2x + 5$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(x) = -4x + 5$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(x) = -2x - 5$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Função quadrática",
                blocks: [
                    {
                        type: "text",
                        value: "# Função quadrática\n\nUma **função quadrática** (ou função do segundo grau) tem a forma $f(x) = ax^2 + bx + c$, com $a$, $b$ e $c$ reais e $a \\neq 0$. Seu gráfico é uma curva chamada **parábola**.\n\nEsse modelo aparece em lançamentos de projéteis, no cálculo de áreas e em problemas de otimização, sempre que existe um ponto de máximo ou de mínimo a ser encontrado.",
                    },
                    {
                        type: "text",
                        value: "## Concavidade\n\nO sinal do coeficiente $a$ indica para onde a parábola se abre:\n\n- Se $a > 0$, a concavidade fica voltada para **cima** e a parábola tem um ponto de mínimo.\n- Se $a < 0$, a concavidade fica voltada para **baixo** e a parábola tem um ponto de máximo.\n\nO coeficiente $c$ marca onde a parábola cruza o eixo vertical, pois $f(0) = c$.",
                    },
                    {
                        type: "text",
                        value: "## Discriminante e raízes\n\nAs raízes são os valores de $x$ com $f(x) = 0$. Para encontrá-las usamos a fórmula de Bhaskara, que depende do **discriminante** $\\Delta = b^2 - 4ac$:\n\n$$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$\n\nO valor de $\\Delta$ revela quantas raízes reais existem:\n\n- $\\Delta > 0$: duas raízes reais e distintas.\n- $\\Delta = 0$: uma única raiz real (dupla).\n- $\\Delta < 0$: nenhuma raiz real.",
                    },
                    {
                        type: "text",
                        value: "## Vértice\n\nO **vértice** é o ponto de máximo ou de mínimo da parábola. Suas coordenadas são:\n\n$$x_v = -\\frac{b}{2a} \\qquad y_v = -\\frac{\\Delta}{4a}$$\n\nUm erro comum é esquecer de dividir por $2a$ e usar apenas $-b$ no cálculo de $x_v$. Se preferir, encontre $y_v$ substituindo $x_v$ na função, ou seja, $y_v = f(x_v)$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nVamos resolver a equação $x^2 - 5x + 6 = 0$.\n\n1. Coeficientes: $a = 1$, $b = -5$ e $c = 6$.\n2. Discriminante: $\\Delta = (-5)^2 - 4 \\cdot 1 \\cdot 6 = 25 - 24 = 1$.\n3. Raízes: $x = \\frac{5 \\pm \\sqrt{1}}{2} = \\frac{5 \\pm 1}{2}$.\n\nAssim, $x = 3$ ou $x = 2$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nQual é o vértice da parábola $f(x) = x^2 - 4x + 3$?\n\nComeçamos pela abscissa do vértice:\n\n$$x_v = -\\frac{-4}{2 \\cdot 1} = \\frac{4}{2} = 2$$\n\nEm seguida calculamos a ordenada substituindo na função: $y_v = f(2) = 2^2 - 4 \\cdot 2 + 3 = 4 - 8 + 3 = -1$. Logo, o vértice é $(2, -1)$ e, como $a > 0$, trata-se de um ponto de mínimo.",
                    },
                    {
                        type: "quote",
                        value: "A parábola é simétrica: os dois ramos são imagens espelhadas em torno da reta vertical que passa pelo vértice.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Função quadrática: $f(x) = ax^2 + bx + c$, com $a \\neq 0$, e gráfico em forma de parábola.\n- $a > 0$ dá concavidade para cima (ponto de mínimo) e $a < 0$ dá concavidade para baixo (ponto de máximo).\n- Discriminante $\\Delta = b^2 - 4ac$ e raízes por $x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.\n- Vértice em $x_v = -\\frac{b}{2a}$ e $y_v = -\\frac{\\Delta}{4a}$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Na função quadrática $f(x) = 2x^2 - 3x + 1$, qual é o valor do coeficiente $a$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$-3$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$-2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A parábola da função $f(x) = -x^2 + 4x$ tem concavidade voltada para:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "baixo, pois $a < 0$",
                                isCorrect: true,
                            },
                            {
                                text: "cima, pois $a > 0$",
                                isCorrect: false,
                            },
                            {
                                text: "cima, pois o gráfico sobe",
                                isCorrect: false,
                            },
                            {
                                text: "baixo, pois $c = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o discriminante $\\Delta$ da equação $x^2 - 6x + 9 = 0$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "$36$",
                                isCorrect: false,
                            },
                            {
                                text: "$72$",
                                isCorrect: false,
                            },
                            {
                                text: "$-72$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quais são as raízes da equação $x^2 - 7x + 10 = 0$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2$ e $5$",
                                isCorrect: true,
                            },
                            {
                                text: "$-2$ e $-5$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$ e $10$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$ e $4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o vértice da parábola $f(x) = x^2 - 6x + 5$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$(3, -4)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(-3, -4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(6, -4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 4)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Estudo do sinal",
                blocks: [
                    {
                        type: "text",
                        value: "# Estudo do sinal\n\nFazer o **estudo do sinal** de uma função é determinar para quais valores de $x$ ela é positiva ($f(x) > 0$), negativa ($f(x) < 0$) ou nula ($f(x) = 0$). Esse é o ponto de partida para resolver **inequações** e para saber onde o gráfico fica acima ou abaixo do eixo horizontal.\n\nO primeiro passo é sempre encontrar as raízes, pois é apenas nelas que a função pode trocar de sinal.",
                    },
                    {
                        type: "text",
                        value: "## Sinal da função afim\n\nPara $f(x) = ax + b$, a raiz é $x = -\\frac{b}{a}$. A partir dela, o comportamento é:\n\n- Se $a > 0$: a função é negativa **antes** da raiz e positiva **depois**.\n- Se $a < 0$: a função é positiva **antes** da raiz e negativa **depois**.\n\nUma forma de lembrar: à direita da raiz, o sinal de $f$ é sempre o mesmo sinal de $a$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nEstudo do sinal de $f(x) = 2x - 6$. A raiz é $x = 3$ e, como $a = 2 > 0$, a função cresce.\n\n| Intervalo | $x < 3$ | $x = 3$ | $x > 3$ |\n| --- | --- | --- | --- |\n| Sinal de $f(x)$ | $-$ | $0$ | $+$ |\n\nConcluímos que $f(x) > 0$ para $x > 3$ e $f(x) < 0$ para $x < 3$.",
                    },
                    {
                        type: "text",
                        value: "## Sinal da função quadrática\n\nPara $f(x) = ax^2 + bx + c$, o sinal depende do discriminante $\\Delta$ e do coeficiente $a$:\n\n- $\\Delta > 0$ (duas raízes $x_1 < x_2$): a função tem o sinal de $a$ fora do intervalo entre as raízes e o sinal contrário entre elas.\n- $\\Delta = 0$ (uma raiz): a função tem o sinal de $a$ em toda parte, anulando-se apenas na raiz.\n- $\\Delta < 0$ (sem raízes reais): a função tem o sinal de $a$ para todo $x$ real.\n\nNo caso mais comum, com $a > 0$ e duas raízes, a parábola é positiva nas pontas e negativa no meio.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nEstudo do sinal de $f(x) = x^2 - 5x + 6$. As raízes são $x = 2$ e $x = 3$, e $a = 1 > 0$.\n\n| Intervalo | $x < 2$ | $2 < x < 3$ | $x > 3$ |\n| --- | --- | --- | --- |\n| Sinal de $f(x)$ | $+$ | $-$ | $+$ |\n\nLogo, $f(x) > 0$ para $x < 2$ ou $x > 3$, e $f(x) < 0$ para $2 < x < 3$. Em particular, a solução da inequação $x^2 - 5x + 6 < 0$ é o intervalo $2 < x < 3$.",
                    },
                    {
                        type: "quote",
                        value: "Resolver uma inequação é, no fundo, ler o estudo do sinal e selecionar os intervalos que interessam.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Estudar o sinal é dizer onde $f$ é positiva, negativa ou nula.\n- Comece sempre pelas raízes, pois é onde o sinal pode mudar.\n- Na função afim, o sinal de $f$ à direita da raiz é o mesmo sinal de $a$.\n- Na quadrática com $\\Delta > 0$, o sinal é o de $a$ fora das raízes e o contrário entre elas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Para a função $f(x) = x - 4$, quais valores de $x$ tornam $f(x) > 0$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x > 4$",
                                isCorrect: true,
                            },
                            {
                                text: "$x < 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x > -4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x < -4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para a função $f(x) = -2x + 8$, quais valores de $x$ tornam $f(x) > 0$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x < 4$",
                                isCorrect: true,
                            },
                            {
                                text: "$x > 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x > -4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x < -4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Considere $f(x) = x^2 - 9$. Para quais valores de $x$ temos $f(x) < 0$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-3 < x < 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$x < -3$ ou $x > 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$-9 < x < 9$",
                                isCorrect: false,
                            },
                            {
                                text: "$x < 3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "As raízes de $f(x) = x^2 - 4x + 3$ são $1$ e $3$, com $a > 0$. Para quais valores de $x$ temos $f(x) < 0$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1 < x < 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$x < 1$ ou $x > 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$x < 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$x > 3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Considere $f(x) = -x^2 + 4$, cujas raízes são $-2$ e $2$. Para quais valores de $x$ temos $f(x) > 0$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$-2 < x < 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x < -2$ ou $x > 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x > 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$-4 < x < 4$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Funções polinomiais e raízes",
                blocks: [
                    {
                        type: "text",
                        value: "# Funções polinomiais e raízes\n\nUma **função polinomial** de grau $n$ tem a forma\n\n$$p(x) = a_n x^n + a_{n-1} x^{n-1} + \\dots + a_1 x + a_0$$\n\ncom $a_n \\neq 0$. O **grau** é o maior expoente que aparece com coeficiente diferente de zero. As funções afim (grau $1$) e quadrática (grau $2$) são casos particulares de polinômios.",
                    },
                    {
                        type: "text",
                        value: "## Raízes e forma fatorada\n\nUma **raiz** de $p(x)$ é um número $r$ tal que $p(r) = 0$. Vale um resultado central: $r$ é raiz de $p$ se, e somente se, $(x - r)$ é um fator de $p(x)$.\n\nPor isso, conhecer as raízes permite escrever o polinômio na **forma fatorada**. Se um polinômio de grau $3$ tem raízes $r_1$, $r_2$ e $r_3$, então\n\n$$p(x) = a_3 (x - r_1)(x - r_2)(x - r_3)$$",
                    },
                    {
                        type: "text",
                        value: "## Quantas raízes um polinômio tem\n\nUm polinômio de grau $n$ tem **no máximo** $n$ raízes reais. Algumas podem se repetir: quando o fator $(x - r)$ aparece elevado a uma potência, dizemos que $r$ é uma raiz com certa **multiplicidade**.\n\nUma estratégia muito usada para encontrar raízes é **fatorar**. Quando o termo independente é zero, começamos colocando $x$ em evidência.",
                    },
                    {
                        type: "text",
                        value: "## Soma e produto das raízes\n\nNa equação do segundo grau $ax^2 + bx + c = 0$, as raízes $x_1$ e $x_2$ se relacionam com os coeficientes por:\n\n$$x_1 + x_2 = -\\frac{b}{a} \\qquad x_1 \\cdot x_2 = \\frac{c}{a}$$\n\nEssas relações ajudam a montar a equação a partir das raízes ou a conferir um resultado sem refazer toda a conta.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nVamos encontrar as raízes de $p(x) = x^3 - 4x$.\n\n1. Colocamos $x$ em evidência: $p(x) = x(x^2 - 4)$.\n2. Fatoramos a diferença de quadrados: $x^2 - 4 = (x - 2)(x + 2)$.\n3. Assim, $p(x) = x(x - 2)(x + 2)$.\n\nIgualando cada fator a zero, as raízes são $x = 0$, $x = 2$ e $x = -2$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nAgora as raízes de $p(x) = x^3 - x^2 - 6x$.\n\n1. Colocamos $x$ em evidência: $p(x) = x(x^2 - x - 6)$.\n2. O trinômio $x^2 - x - 6$ tem raízes $3$ e $-2$, pois a soma delas é $1$ e o produto é $-6$. Logo $x^2 - x - 6 = (x - 3)(x + 2)$.\n3. Portanto, $p(x) = x(x - 3)(x + 2)$.\n\nAs raízes são $x = 0$, $x = 3$ e $x = -2$.",
                    },
                    {
                        type: "quote",
                        value: "Fatorar é traduzir um polinômio para a linguagem das suas raízes: cada fator revela um ponto em que o gráfico toca o eixo horizontal.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Polinômio de grau $n$: $p(x) = a_n x^n + \\dots + a_1 x + a_0$, com $a_n \\neq 0$.\n- $r$ é raiz quando $p(r) = 0$, o que equivale a ter o fator $(x - r)$.\n- Um polinômio de grau $n$ tem no máximo $n$ raízes reais, possivelmente repetidas.\n- No segundo grau, $x_1 + x_2 = -\\frac{b}{a}$ e $x_1 \\cdot x_2 = \\frac{c}{a}$.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o grau da função polinomial $p(x) = 4x^3 - 2x + 7$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$7$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual dos valores a seguir é uma raiz de $p(x) = x^2 - 9$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 9$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = -9$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quais são as raízes de $p(x) = x(x - 5)(x + 1)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0$, $5$ e $-1$",
                                isCorrect: true,
                            },
                            {
                                text: "$0$, $-5$ e $1$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$, $5$ e $1$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$ e $-1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "As raízes de $p(x) = x^3 - 9x$ são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0$, $3$ e $-3$",
                                isCorrect: true,
                            },
                            {
                                text: "$0$, $9$ e $-9$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$ e $-3$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$, $3$ e $9$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma equação do segundo grau tem raízes $2$ e $-5$. Qual das equações abaixo tem exatamente essas raízes?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$x^2 + 3x - 10 = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$x^2 - 3x - 10 = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^2 - 3x + 10 = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^2 + 3x + 10 = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Funções racionais e assíntotas",
                blocks: [
                    {
                        type: "text",
                        value: "# Funções racionais e assíntotas\n\nUma **função racional** é o quociente de dois polinômios:\n\n$$f(x) = \\frac{p(x)}{q(x)}, \\qquad q(x) \\neq 0$$\n\nO exemplo mais simples é $f(x) = \\frac{1}{x}$. Essas funções trazem duas novidades importantes: existem valores de $x$ proibidos e o gráfico pode se aproximar de certas retas sem nunca tocá-las. Essas retas são as **assíntotas**.",
                    },
                    {
                        type: "text",
                        value: "## Domínio\n\nComo não podemos dividir por zero, o **domínio** de uma função racional exclui os valores que anulam o denominador. Para encontrá-los, resolvemos a equação $q(x) = 0$.\n\nPor exemplo, em $f(x) = \\frac{1}{x - 3}$ precisamos de $x - 3 \\neq 0$, ou seja, $x \\neq 3$. O domínio é o conjunto de todos os reais diferentes de $3$.",
                    },
                    {
                        type: "text",
                        value: "## Assíntota vertical\n\nUma **assíntota vertical** é uma reta vertical $x = a$ da qual o gráfico se aproxima quando $x$ tende a $a$. Ela aparece nos valores que anulam o denominador mas não o numerador.\n\nEm $f(x) = \\frac{1}{x - 3}$, o denominador zera em $x = 3$, então a reta $x = 3$ é assíntota vertical. Perto dela, os valores de $f(x)$ crescem ou decrescem sem limite.",
                    },
                    {
                        type: "text",
                        value: "## Assíntota horizontal\n\nUma **assíntota horizontal** é uma reta $y = L$ da qual o gráfico se aproxima quando $x$ tende a $+\\infty$ ou a $-\\infty$. Para encontrá-la, comparamos o grau do numerador com o do denominador:\n\n- Grau do numerador **menor** que o do denominador: a assíntota é $y = 0$.\n- Graus **iguais**: a assíntota é a razão entre os coeficientes líderes, numerador sobre denominador.\n- Grau do numerador **maior**: não existe assíntota horizontal.\n\nEm $f(x) = \\frac{1}{x}$, o grau de cima é menor, então $y = 0$ é assíntota horizontal.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nVamos analisar $f(x) = \\frac{1}{x - 2}$.\n\n1. Domínio: precisamos de $x - 2 \\neq 0$, logo $x \\neq 2$.\n2. Assíntota vertical: o denominador zera em $x = 2$, então a reta é $x = 2$.\n3. Assíntota horizontal: o grau do numerador ($0$) é menor que o do denominador ($1$), então $y = 0$.\n\nO gráfico se aproxima das retas $x = 2$ e $y = 0$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nAgora a função $f(x) = \\frac{2x + 1}{x - 1}$.\n\n1. Domínio: precisamos de $x - 1 \\neq 0$, logo $x \\neq 1$.\n2. Assíntota vertical: $x = 1$.\n3. Assíntota horizontal: os graus do numerador e do denominador são iguais (ambos $1$), então dividimos os coeficientes líderes: $y = \\frac{2}{1} = 2$.\n\nAs assíntotas são $x = 1$ e $y = 2$.",
                    },
                    {
                        type: "quote",
                        value: "A assíntota é um destino que o gráfico persegue de perto, chegando cada vez mais próximo sem jamais alcançar.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Função racional: $f(x) = \\frac{p(x)}{q(x)}$, com $q(x) \\neq 0$.\n- O domínio exclui os valores que anulam o denominador.\n- Há assíntota vertical nos zeros do denominador que não anulam o numerador.\n- A assíntota horizontal é $y = 0$ quando o grau de cima é menor, e é a razão dos coeficientes líderes quando os graus são iguais.\n\nEssa ideia de aproximação sem contato é a porta de entrada para os **limites**, o primeiro grande tema do Cálculo 1.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o domínio da função $f(x) = \\frac{1}{x - 5}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "todos os reais com $x \\neq 5$",
                                isCorrect: true,
                            },
                            {
                                text: "todos os reais com $x \\neq -5$",
                                isCorrect: false,
                            },
                            {
                                text: "todos os reais com $x \\neq 0$",
                                isCorrect: false,
                            },
                            {
                                text: "todos os reais com $x \\neq 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a assíntota vertical de $f(x) = \\frac{1}{x - 3}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = -3$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = 3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a assíntota horizontal de $f(x) = \\frac{1}{x}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$y = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a assíntota vertical de $f(x) = \\frac{x + 2}{x + 4}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x = -4$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = -2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a assíntota horizontal de $f(x) = \\frac{3x - 1}{x + 2}$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$y = 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$y = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = \\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = -2$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Exponencial e logaritmo",
        aulas: [
            {
                titulo: "Função exponencial",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é uma função exponencial\n\nUma **função exponencial** é toda função da forma\n\n$$f(x) = a^x$$\n\nem que a base $a$ é um número real positivo e diferente de $1$, ou seja, $a > 0$ e $a \\neq 1$. O que a caracteriza é a posição da variável: em $f(x) = a^x$ o $x$ está no **expoente**, e não na base. Isso a separa de funções como $g(x) = x^2$, em que a variável fica na base.",
                    },
                    {
                        type: "text",
                        value: "## Por que $a > 0$ e $a \\neq 1$\n\nAs restrições sobre a base têm motivo. Veja o que daria errado sem elas:\n\n- se $a = 1$, então $1^x = 1$ para todo $x$, e sobraria apenas uma função constante, sem interesse;\n- se $a = 0$, a expressão $0^x$ não faz sentido para $x \\leq 0$;\n- se $a < 0$, por exemplo $a = -2$, o valor $(-2)^{1/2} = \\sqrt{-2}$ não é um número real.\n\nPor isso exigimos sempre $a > 0$ e $a \\neq 1$.",
                    },
                    {
                        type: "text",
                        value: "## Domínio, imagem e o ponto $(0,1)$\n\nA função exponencial está definida para **qualquer** número real, então seu domínio é $\\mathbb{R}$. Já a imagem é o conjunto dos reais positivos, isto é, $f(x) > 0$ sempre.\n\nUm fato que vale para toda base: como $a^0 = 1$, o gráfico de $f(x) = a^x$ **sempre passa pelo ponto** $(0, 1)$. Além disso, a reta $y = 0$ (o eixo horizontal) é uma **assíntota horizontal**: o gráfico se aproxima dela sem nunca tocá-la.",
                    },
                    {
                        type: "text",
                        value: "## Crescimento e decaimento\n\nO comportamento do gráfico depende do valor da base:\n\n| Base | Comportamento | Exemplo |\n| --- | --- | --- |\n| $a > 1$ | crescente | $f(x) = 2^x$ |\n| $0 < a < 1$ | decrescente | $g(x) = \\left(\\frac{1}{2}\\right)^x$ |\n\nQuando $a > 1$, quanto maior o $x$, maior o valor de $f(x)$: temos **crescimento exponencial**. Quando $0 < a < 1$, quanto maior o $x$, menor o valor de $f(x)$: temos **decaimento exponencial**.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades das potências\n\nComo a função exponencial vem das potências, valem as regras já conhecidas. Para $a > 0$ e quaisquer expoentes reais $x$ e $y$:\n\n$$a^x \\cdot a^y = a^{x+y} \\qquad \\frac{a^x}{a^y} = a^{x-y}$$\n\n$$(a^x)^y = a^{x \\cdot y} \\qquad a^{-x} = \\frac{1}{a^x} \\qquad a^0 = 1$$\n\nEssas propriedades são a base para resolver equações exponenciais mais adiante.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nConsidere $f(x) = 2^x$ e vamos calcular alguns valores.\n\n- $f(3) = 2^3 = 8$\n- $f(0) = 2^0 = 1$\n- $f(-1) = 2^{-1} = \\frac{1}{2}$\n- $f(-3) = 2^{-3} = \\frac{1}{8}$\n\nRepare que, mesmo para $x$ negativo, o resultado continua **positivo**, como esperado pela imagem da função.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nVamos simplificar a expressão $\\dfrac{2^{x+3}}{2^x}$.\n\nUsando a propriedade do quociente de potências de mesma base, subtraímos os expoentes:\n\n$$\\frac{2^{x+3}}{2^x} = 2^{(x+3) - x} = 2^3 = 8$$\n\nOu seja, a expressão vale $8$ para qualquer valor de $x$.",
                    },
                    {
                        type: "text",
                        value: "## O número $e$ e a exponencial natural\n\nEntre todas as bases possíveis, uma é especialmente importante no Cálculo: o **número de Euler**, representado por $e$, com valor aproximado\n\n$$e \\approx 2{,}718$$\n\nA função $f(x) = e^x$ é chamada de **exponencial natural** e aparece o tempo todo em problemas de crescimento, juros e decaimento. Como $e > 1$, ela é crescente e também passa por $(0,1)$.",
                    },
                    {
                        type: "quote",
                        value: "A ideia central da exponencial é simples: a cada passo constante que damos no expoente, o resultado é multiplicado sempre pelo mesmo fator.",
                    },
                ],
                questions: [
                    {
                        statement: "Dada a função $f(x) = 2^x$, qual é o valor de $f(5)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$10$",
                                isCorrect: false,
                            },
                            {
                                text: "$32$",
                                isCorrect: true,
                            },
                            {
                                text: "$25$",
                                isCorrect: false,
                            },
                            {
                                text: "$64$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que $f(x) = a^x$ seja uma função exponencial, a base $a$ deve satisfazer qual condição?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$a > 0$ e $a \\neq 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$a > 1$ e $a \\neq 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$a < 0$ e $a \\neq 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$a \\neq 0$ e $a \\neq 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Simplificando a expressão $\\dfrac{2^{x+3}}{2^{x}}$, obtém-se:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2^{2x+3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2^{x+3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2^3$",
                                isCorrect: true,
                            },
                            {
                                text: "$2^{-3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre o gráfico de $f(x) = a^x$ com $a > 1$, é correto afirmar que a função:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "é decrescente e passa por $(1,0)$",
                                isCorrect: false,
                            },
                            {
                                text: "é crescente e passa por $(1,0)$",
                                isCorrect: false,
                            },
                            {
                                text: "é decrescente e passa por $(0,1)$",
                                isCorrect: false,
                            },
                            {
                                text: "é crescente e passa por $(0,1)$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $f(-2)$ para a função $f(x) = 3^x$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{1}{9}$",
                                isCorrect: true,
                            },
                            {
                                text: "$-9$",
                                isCorrect: false,
                            },
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{1}{9}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Logaritmo: definição e propriedades",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é um logaritmo\n\nO **logaritmo** responde a uma pergunta natural: a que expoente preciso elevar a base para obter um certo número? Formalmente,\n\n$$\\log_a b = c \\iff a^c = b$$\n\nLemos $\\log_a b$ como logaritmo de $b$ na base $a$. Aqui, $b$ é o **logaritmando**, $a$ é a **base** e $c$ é o próprio logaritmo, ou seja, o expoente procurado.",
                    },
                    {
                        type: "text",
                        value: "## Condições de existência\n\nPara que $\\log_a b$ exista, precisamos de:\n\n- base positiva e diferente de $1$: $a > 0$ e $a \\neq 1$;\n- logaritmando positivo: $b > 0$.\n\nNão existe logaritmo de número negativo nem de zero. Por exemplo, $\\log_2 0$ e $\\log_2(-4)$ **não estão definidos**, porque nenhuma potência de $2$ resulta em $0$ ou em número negativo.",
                    },
                    {
                        type: "text",
                        value: "## Consequências imediatas\n\nDireto da definição, valem as igualdades:\n\n$$\\log_a 1 = 0 \\qquad \\log_a a = 1$$\n\n$$\\log_a a^x = x \\qquad a^{\\log_a b} = b$$\n\nA primeira vale porque $a^0 = 1$; a segunda, porque $a^1 = a$. As duas últimas mostram que exponencial e logaritmo, na mesma base, desfazem um ao outro.",
                    },
                    {
                        type: "text",
                        value: "## Logaritmo decimal e logaritmo natural\n\nDuas bases aparecem com tanta frequência que ganham notação própria:\n\n- **logaritmo decimal**, base $10$: escrevemos $\\log b$ sem indicar a base, subentendendo $\\log_{10} b$;\n- **logaritmo natural**, base $e$: escrevemos $\\ln b$ no lugar de $\\log_e b$.\n\nO logaritmo natural é o que mais aparece no Cálculo, por causa do papel central do número $e$.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades operatórias\n\nAs propriedades a seguir transformam produtos e quocientes em somas e diferenças, o que simplifica muitos cálculos. Para $a > 0$, $a \\neq 1$, $x > 0$ e $y > 0$:\n\n$$\\log_a(x \\cdot y) = \\log_a x + \\log_a y$$\n\n$$\\log_a\\left(\\frac{x}{y}\\right) = \\log_a x - \\log_a y$$\n\n$$\\log_a(x^n) = n \\cdot \\log_a x$$\n\nUm erro muito comum é achar que $\\log_a(x + y)$ é igual a $\\log_a x + \\log_a y$. **Isso é falso**: a propriedade vale para o produto, não para a soma.",
                    },
                    {
                        type: "text",
                        value: "## Mudança de base\n\nÀs vezes precisamos reescrever um logaritmo em outra base, por exemplo para usar a calculadora, que costuma ter apenas $\\log$ e $\\ln$. A fórmula é\n\n$$\\log_a b = \\frac{\\log_c b}{\\log_c a}$$\n\nválida para qualquer base auxiliar $c$ (positiva e diferente de $1$). Por exemplo, $\\log_2 5 = \\dfrac{\\log 5}{\\log 2}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplos resolvidos\n\nVamos calcular $\\log_2 8$ e depois $\\log_5 \\dfrac{1}{25}$.\n\nPara $\\log_2 8$, procuramos o expoente $c$ tal que $2^c = 8$. Como $2^3 = 8$, temos $\\log_2 8 = 3$.\n\nPara $\\log_5 \\dfrac{1}{25}$, queremos $5^c = \\dfrac{1}{25}$. Como $\\dfrac{1}{25} = 5^{-2}$, concluímos que $\\log_5 \\dfrac{1}{25} = -2$.\n\nAgora com propriedades: $\\log_2(4 \\cdot 8) = \\log_2 4 + \\log_2 8 = 2 + 3 = 5$. Conferindo, $4 \\cdot 8 = 32 = 2^5$, logo $\\log_2 32 = 5$.",
                    },
                    {
                        type: "quote",
                        value: "Todo logaritmo é, no fundo, um expoente disfarçado: a resposta para a pergunta a que potência devo elevar a base.",
                    },
                ],
                questions: [
                    {
                        statement: "Calcule o valor de $\\log_2 8$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$16$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Pela definição de logaritmo, a igualdade $\\log_a b = c$ equivale a qual expressão?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$a^c = b$",
                                isCorrect: true,
                            },
                            {
                                text: "$b^c = a$",
                                isCorrect: false,
                            },
                            {
                                text: "$a^b = c$",
                                isCorrect: false,
                            },
                            {
                                text: "$c^a = b$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Usando as propriedades operatórias, o valor de $\\log_2(4 \\cdot 8)$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$32$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$12$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\log_5 \\dfrac{1}{25}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$-5$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-2$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sabendo que $\\log 2 \\approx 0{,}30$ e $\\log 3 \\approx 0{,}48$, o valor de $\\log 6$ é aproximadamente:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$0{,}78$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}14$",
                                isCorrect: false,
                            },
                            {
                                text: "$1{,}44$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}18$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Função logarítmica",
                blocks: [
                    {
                        type: "text",
                        value: "## A função logarítmica\n\nFixada uma base $a$ com $a > 0$ e $a \\neq 1$, a **função logarítmica** é definida por\n\n$$f(x) = \\log_a x$$\n\nEla associa a cada número positivo $x$ o seu logaritmo na base $a$. Como só existe logaritmo de número positivo, o **domínio** é o conjunto dos reais positivos, isto é, $x > 0$.",
                    },
                    {
                        type: "text",
                        value: "## Inversa da exponencial\n\nA função logarítmica é a **função inversa** da exponencial de mesma base. Isso quer dizer que\n\n$$y = \\log_a x \\iff x = a^y$$\n\nGraficamente, o gráfico de $f(x) = \\log_a x$ é o reflexo do gráfico de $g(x) = a^x$ em relação à reta $y = x$. Por isso tudo o que vale para uma tem um espelho na outra: onde a exponencial passa por $(0,1)$, a logarítmica passa por $(1,0)$.",
                    },
                    {
                        type: "text",
                        value: "## Domínio, imagem e assíntota\n\nResumindo o comportamento geral da função $f(x) = \\log_a x$:\n\n- **domínio**: $x > 0$;\n- **imagem**: todos os reais, ou seja, $\\mathbb{R}$;\n- o gráfico **sempre passa por** $(1, 0)$, pois $\\log_a 1 = 0$;\n- a reta $x = 0$ (o eixo vertical) é **assíntota vertical**.",
                    },
                    {
                        type: "text",
                        value: "## Crescente ou decrescente\n\nAssim como na exponencial, o valor da base decide o sentido do crescimento:\n\n| Base | Comportamento |\n| --- | --- |\n| $a > 1$ | crescente |\n| $0 < a < 1$ | decrescente |\n\nComo a maioria das aplicações usa base maior que $1$ (por exemplo $10$ ou $e$), o caso crescente é o mais comum: quanto maior o $x$, maior o valor de $\\log_a x$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nQual é o domínio de $f(x) = \\log_3(x - 4)$?\n\nO logaritmando precisa ser positivo, então impomos a condição\n\n$$x - 4 > 0 \\Rightarrow x > 4$$\n\nLogo, a função só está definida para $x > 4$. Qualquer valor de $x$ menor ou igual a $4$ deixaria o logaritmando nulo ou negativo, o que não é permitido.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nVamos calcular alguns valores de $f(x) = \\log_2 x$.\n\n- $f(1) = \\log_2 1 = 0$\n- $f(2) = \\log_2 2 = 1$\n- $f(8) = \\log_2 8 = 3$\n- $f\\left(\\frac{1}{2}\\right) = \\log_2 \\frac{1}{2} = -1$\n\nPerceba que, à medida que $x$ cresce, o valor de $f(x)$ também cresce, confirmando que a função é crescente (base $2 > 1$).",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nA função logarítmica $f(x) = \\log_a x$ é a inversa da exponencial: tem domínio nos reais positivos, imagem em todos os reais, passa por $(1,0)$ e tem o eixo vertical como assíntota. É crescente quando $a > 1$ e decrescente quando $0 < a < 1$.",
                    },
                    {
                        type: "quote",
                        value: "Enquanto a exponencial dispara multiplicando, a logarítmica avança devagar: ela conta quantas vezes a base foi multiplicada para chegar ali.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o domínio da função $f(x) = \\log_2 x$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x > 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$x \\geq 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\neq 0$",
                                isCorrect: false,
                            },
                            {
                                text: "todos os reais",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O gráfico da função $f(x) = \\log_a x$ sempre passa por qual ponto?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(0, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(0, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o domínio da função $f(x) = \\log_3(x - 4)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x > -4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x < 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\geq 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x > 4$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "A função $f(x) = \\log_a x$ com $0 < a < 1$ é classificada como:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "crescente",
                                isCorrect: false,
                            },
                            {
                                text: "constante",
                                isCorrect: false,
                            },
                            {
                                text: "decrescente",
                                isCorrect: true,
                            },
                            {
                                text: "sempre positiva",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A função logarítmica $f(x) = \\log_a x$ é a inversa de qual função?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$g(x) = a^x$",
                                isCorrect: true,
                            },
                            {
                                text: "$g(x) = x^a$",
                                isCorrect: false,
                            },
                            {
                                text: "$g(x) = \\frac{1}{a^x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$g(x) = a \\cdot x$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Equações e inequações exponenciais e logarítmicas",
                blocks: [
                    {
                        type: "text",
                        value: "## Equações exponenciais\n\nUma **equação exponencial** é aquela em que a incógnita aparece no expoente, como $2^x = 32$. A estratégia principal é a **redução à mesma base**: se conseguimos escrever os dois lados como potências de uma mesma base, podemos igualar os expoentes:\n\n$$a^{f(x)} = a^{g(x)} \\Rightarrow f(x) = g(x)$$\n\nIsso vale justamente porque a função exponencial é injetora, ou seja, nunca repete valores.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nVamos resolver $2^x = 32$.\n\nEscrevemos $32$ como potência de $2$. Como $32 = 2^5$, a equação vira\n\n$$2^x = 2^5 \\Rightarrow x = 5$$\n\nOutro exemplo: em $3^{x+1} = 27$, usamos $27 = 3^3$, logo $x + 1 = 3$ e portanto $x = 2$.",
                    },
                    {
                        type: "text",
                        value: "## Quando as bases não se ajustam\n\nÀs vezes não dá para igualar as bases, como em $2^x = 10$. Nesse caso, aplicamos logaritmo dos dois lados e usamos a propriedade da potência:\n\n$$2^x = 10 \\Rightarrow \\log(2^x) = \\log 10 \\Rightarrow x \\cdot \\log 2 = 1$$\n\nAssim, $x = \\dfrac{1}{\\log 2}$. O logaritmo é a ferramenta que traz o expoente para baixo.",
                    },
                    {
                        type: "text",
                        value: "## Equações logarítmicas\n\nNuma **equação logarítmica**, a incógnita aparece dentro do logaritmo. Duas ideias resolvem a maioria dos casos:\n\n- comparar logaritmos de mesma base: $\\log_a f(x) = \\log_a g(x) \\Rightarrow f(x) = g(x)$;\n- voltar à definição: $\\log_a f(x) = c \\Rightarrow f(x) = a^c$.\n\nEm todos os casos é obrigatório **verificar as condições de existência** no fim, garantindo que o logaritmando ficou positivo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nVamos resolver $\\log_2(x - 1) = 3$.\n\nPela definição, $x - 1 = 2^3 = 8$, logo\n\n$$x - 1 = 8 \\Rightarrow x = 9$$\n\nVerificando a condição de existência: o logaritmando é $x - 1 = 8 > 0$. Como a condição foi satisfeita, $x = 9$ é solução válida.",
                    },
                    {
                        type: "text",
                        value: "## Inequações: cuidado com a base\n\nEm **inequações** exponenciais e logarítmicas, reduzimos à mesma base como antes, mas há um detalhe decisivo:\n\n- se a base é **maior que $1$**, o sentido da desigualdade **se mantém**;\n- se a base está **entre $0$ e $1$**, o sentido da desigualdade **se inverte**.\n\nIsso acontece porque a função é crescente no primeiro caso e decrescente no segundo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 3\n\nResolva $2^x > 8$. Como $8 = 2^3$ e a base $2$ é maior que $1$, o sentido se mantém:\n\n$$2^x > 2^3 \\Rightarrow x > 3$$\n\nAgora resolva $\\left(\\frac{1}{2}\\right)^x > \\frac{1}{8}$. Aqui a base $\\frac{1}{2}$ está entre $0$ e $1$, então o sentido se inverte. De $\\left(\\frac{1}{2}\\right)^x > \\left(\\frac{1}{2}\\right)^3$ obtemos $x < 3$.",
                    },
                    {
                        type: "quote",
                        value: "Resolver uma equação exponencial ou logarítmica é quase sempre a mesma dança: deixe os dois lados na mesma base e compare o que sobra.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a solução da equação $2^x = 32$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = 16$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 5$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Resolvendo a equação $3^{x+1} = 27$, obtém-se:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 9$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 26$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a solução da equação $\\log_2(x - 1) = 3$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x = 7$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 9$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 8$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o conjunto solução da inequação $2^x > 8$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x < 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$x > 8$",
                                isCorrect: false,
                            },
                            {
                                text: "$x > 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x > 3$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a solução da inequação $\\left(\\dfrac{1}{2}\\right)^x > \\dfrac{1}{8}$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$x < 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$x > 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$x < -3$",
                                isCorrect: false,
                            },
                            {
                                text: "$x > 8$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Aplicações: crescimento, decaimento e escala logarítmica",
                blocks: [
                    {
                        type: "text",
                        value: "## Onde exponencial e logaritmo aparecem\n\nExponenciais e logaritmos não são só um assunto de prova: eles descrevem fenômenos reais em que uma grandeza **se multiplica** (ou se divide) por um fator fixo a cada intervalo de tempo. Nesta aula veremos três situações clássicas: crescimento, decaimento e escalas logarítmicas.",
                    },
                    {
                        type: "text",
                        value: "## Crescimento exponencial\n\nQuando uma população, um investimento ou uma cultura de bactérias cresce sempre na mesma proporção, usamos um modelo do tipo\n\n$$N(t) = N_0 \\cdot a^t$$\n\nem que $N_0$ é a quantidade inicial (no instante $t = 0$), $a > 1$ é o fator de crescimento por período e $t$ é o tempo. Se a grandeza dobra a cada período, então $a = 2$; se triplica, $a = 3$, e assim por diante.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nUma colônia de bactérias começa com $100$ indivíduos e **dobra a cada hora**. Quantas bactérias existem após $3$ horas?\n\nO modelo é $N(t) = 100 \\cdot 2^t$. Substituindo $t = 3$:\n\n$$N(3) = 100 \\cdot 2^3 = 100 \\cdot 8 = 800$$\n\nApós $3$ horas, a colônia tem $800$ bactérias.",
                    },
                    {
                        type: "text",
                        value: "## Decaimento e meia-vida\n\nNo **decaimento**, a grandeza diminui por um fator fixo, como na desintegração de um material radioativo. Um conceito central aqui é a **meia-vida**: o tempo necessário para que a quantidade caia pela metade.\n\nSe a meia-vida é $T$, depois de um intervalo $T$ resta metade; depois de $2T$, resta um quarto; depois de $3T$, um oitavo, e assim por diante. Cada meia-vida corta a quantidade ao meio.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nUma amostra de $80$ g de certo material tem **meia-vida de $5$ anos**. Quanto resta após $10$ anos?\n\nEm $10$ anos cabem duas meias-vidas, pois $10 = 2 \\cdot 5$. A cada meia-vida a massa é dividida por $2$:\n\n- após os primeiros $5$ anos: $80 \\div 2 = 40$ g;\n- após mais $5$ anos (total de $10$): $40 \\div 2 = 20$ g.\n\nPortanto, após $10$ anos restam $20$ g.",
                    },
                    {
                        type: "text",
                        value: "## Escala logarítmica\n\nAlgumas grandezas variam numa faixa gigantesca, de valores minúsculos a enormes. Para lidar com isso, usamos **escalas logarítmicas**, em que cada passo na escala corresponde a **multiplicar** por um fator fixo (em geral $10$), e não a somar.\n\nExemplos famosos: a escala **Richter** (terremotos), o nível sonoro em **decibéis** e o **pH** na química. Numa escala de base $10$, subir $1$ unidade significa multiplicar por $10$; subir $2$ unidades, multiplicar por $10^2 = 100$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 3\n\nO pH de uma solução é dado por $\\text{pH} = -\\log[\\text{H}^+]$, em que $[\\text{H}^+]$ é a concentração de íons de hidrogênio. Se $[\\text{H}^+] = 10^{-4}$, qual é o pH?\n\nSubstituindo na fórmula:\n\n$$\\text{pH} = -\\log(10^{-4}) = -(-4) = 4$$\n\nO sinal de menos na definição serve justamente para transformar o expoente negativo num número positivo e fácil de comparar.",
                    },
                    {
                        type: "quote",
                        value: "O que parece explosivo numa escala comum vira um passo tranquilo na escala logarítmica: é assim que domamos números gigantes.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nCrescimento e decaimento seguem modelos do tipo $N(t) = N_0 \\cdot a^t$: com $a > 1$ a grandeza cresce, com $0 < a < 1$ ela diminui, e a meia-vida mede o tempo para cair à metade. Já as escalas logarítmicas comprimem intervalos enormes, transformando multiplicações por $10$ em somas de $1$ na escala.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma população segue o modelo $N(t) = 100 \\cdot 2^t$. Qual é o seu valor após $3$ períodos?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$600$",
                                isCorrect: false,
                            },
                            {
                                text: "$800$",
                                isCorrect: true,
                            },
                            {
                                text: "$300$",
                                isCorrect: false,
                            },
                            {
                                text: "$1600$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma substância tem meia-vida de $5$ anos. Começando com $80$ g, quanto resta após $10$ anos?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$20$ g",
                                isCorrect: true,
                            },
                            {
                                text: "$40$ g",
                                isCorrect: false,
                            },
                            {
                                text: "$16$ g",
                                isCorrect: false,
                            },
                            {
                                text: "$10$ g",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A meia-vida de uma substância corresponde ao tempo necessário para que a quantidade se torne:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "a metade da inicial",
                                isCorrect: true,
                            },
                            {
                                text: "o dobro da inicial",
                                isCorrect: false,
                            },
                            {
                                text: "um terço da inicial",
                                isCorrect: false,
                            },
                            {
                                text: "igual a zero",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Numa escala logarítmica de base $10$, um aumento de $2$ unidades corresponde a multiplicar por qual fator?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$20$",
                                isCorrect: false,
                            },
                            {
                                text: "$10$",
                                isCorrect: false,
                            },
                            {
                                text: "$100$",
                                isCorrect: true,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O pH é dado por $\\text{pH} = -\\log[\\text{H}^+]$. Se $[\\text{H}^+] = 10^{-4}$, quanto vale o pH?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$4$",
                                isCorrect: true,
                            },
                            {
                                text: "$-4$",
                                isCorrect: false,
                            },
                            {
                                text: "$10$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}4$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Trigonometria",
        aulas: [
            {
                titulo: "Ângulos, graus e radianos",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é um ângulo\n\nUm ângulo mede a abertura entre duas semirretas que partem de um mesmo ponto, chamado vértice. Na trigonometria, é útil pensar num ângulo como uma rotação: partimos de uma semirreta inicial e giramos até a semirreta final. Quanto maior o giro, maior o ângulo.\n\nExistem duas unidades principais para medir esse giro: o grau e o radiano. Saber transitar entre elas é o primeiro passo para entender o círculo trigonométrico e, mais adiante, as funções que preparam o terreno para o Cálculo.",
                    },
                    {
                        type: "text",
                        value: "## A medida em graus\n\nO grau é a unidade mais familiar. A ideia é dividir uma volta completa em 360 partes iguais; cada parte vale 1° (um grau). Assim:\n\n- Uma volta completa tem 360°.\n- Meia volta tem 180°.\n- Um quarto de volta, o ângulo reto, tem 90°.\n\nO número 360 vem de tradições antigas da Babilônia e tem a vantagem de ser divisível por muitos inteiros, o que facilita as contas.",
                    },
                    {
                        type: "text",
                        value: "## A medida em radianos\n\nO radiano mede o ângulo pelo tamanho do arco que ele determina numa circunferência, usando o raio como unidade. Um ângulo de 1 radiano é aquele cujo arco tem exatamente o comprimento de um raio.\n\nComo o comprimento de uma circunferência de raio $r$ é $2\\pi r$, uma volta completa corresponde a $2\\pi$ raios, ou seja, $2\\pi$ radianos. Da mesma forma, meia volta vale $\\pi$ radianos. Essa é a chave de toda a conversão:\n\n$$180^\\circ = \\pi \\text{ rad}$$",
                    },
                    {
                        type: "quote",
                        value: "O radiano parece estranho no começo, mas é só uma régua diferente: em vez de contar fatias de uma volta, ele mede o ângulo pelo tamanho do arco que se abre.",
                    },
                    {
                        type: "text",
                        value: "## Convertendo entre graus e radianos\n\nDa relação $180^\\circ = \\pi$ rad saem duas receitas diretas:\n\n- De graus para radianos: multiplique por $\\frac{\\pi}{180}$.\n- De radianos para graus: multiplique por $\\frac{180}{\\pi}$.\n\nRepare que os fatores são inversos um do outro. Se você errar qual usar, o resultado sai com uma ordem de grandeza claramente fora do esperado, o que ajuda a perceber o engano.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: de graus para radianos\n\nVamos converter 60° em radianos. Multiplicamos por $\\frac{\\pi}{180}$:\n\n$$60^\\circ \\cdot \\frac{\\pi}{180} = \\frac{60\\pi}{180} = \\frac{\\pi}{3}$$\n\nSimplificamos a fração $\\frac{60}{180}$ dividindo em cima e embaixo por 60, chegando a $\\frac{1}{3}$. Logo, 60° equivalem a $\\frac{\\pi}{3}$ radianos.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: de radianos para graus\n\nAgora convertemos $\\frac{3\\pi}{4}$ radianos em graus. Multiplicamos por $\\frac{180}{\\pi}$:\n\n$$\\frac{3\\pi}{4} \\cdot \\frac{180}{\\pi} = \\frac{3 \\cdot 180}{4} = \\frac{540}{4} = 135^\\circ$$\n\nO $\\pi$ do numerador cancela com o do denominador e sobra uma conta simples com números inteiros. Portanto, $\\frac{3\\pi}{4}$ rad valem 135°.",
                    },
                    {
                        type: "text",
                        value: "## Ângulos notáveis nas duas unidades\n\nAlguns ângulos aparecem o tempo todo. Vale a pena memorizar a correspondência entre eles:\n\n| Graus | Radianos |\n| --- | --- |\n| 0° | $0$ |\n| 30° | $\\frac{\\pi}{6}$ |\n| 45° | $\\frac{\\pi}{4}$ |\n| 60° | $\\frac{\\pi}{3}$ |\n| 90° | $\\frac{\\pi}{2}$ |\n| 180° | $\\pi$ |\n| 270° | $\\frac{3\\pi}{2}$ |\n| 360° | $2\\pi$ |",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O grau divide a volta em 360 partes; o radiano mede o ângulo pelo arco, em unidades de raio.\n- A ponte entre as unidades é $180^\\circ = \\pi$ rad.\n- Para ir de graus a radianos, multiplique por $\\frac{\\pi}{180}$; no sentido inverso, por $\\frac{180}{\\pi}$.\n- Vale decorar os ângulos notáveis (30°, 45°, 60°, 90° e seus arcos), porque eles reaparecem em todo o restante da trigonometria.",
                    },
                ],
                questions: [
                    {
                        statement: "Convertendo 60° para radianos, obtemos:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{\\pi}{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\pi}{6}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\pi}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\pi}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quanto vale $\\pi$ radianos em graus?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "90°",
                                isCorrect: false,
                            },
                            {
                                text: "180°",
                                isCorrect: true,
                            },
                            {
                                text: "360°",
                                isCorrect: false,
                            },
                            {
                                text: "270°",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Convertendo $\\frac{3\\pi}{4}$ rad para graus, obtemos:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "120°",
                                isCorrect: false,
                            },
                            {
                                text: "45°",
                                isCorrect: false,
                            },
                            {
                                text: "135°",
                                isCorrect: true,
                            },
                            {
                                text: "150°",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A quantos radianos corresponde uma volta completa?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\pi}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{3\\pi}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\pi$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Convertendo 210° para radianos, obtemos:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{7\\pi}{6}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{5\\pi}{6}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{7\\pi}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{11\\pi}{6}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Círculo trigonométrico: seno, cosseno e tangente",
                blocks: [
                    {
                        type: "text",
                        value: "## O círculo trigonométrico\n\nO círculo trigonométrico é uma circunferência de raio 1 com centro na origem de um plano cartesiano. Ele transforma ângulos em coordenadas: para cada ângulo $\\theta$, marcamos o ponto onde o lado final do ângulo cruza a circunferência, girando no sentido anti-horário a partir do eixo horizontal positivo.\n\nA grande vantagem é que seno, cosseno e tangente deixam de ser apenas razões de um triângulo e passam a ter uma leitura geométrica direta no círculo.",
                    },
                    {
                        type: "text",
                        value: "## A origem no triângulo retângulo\n\nNum triângulo retângulo, as três razões trigonométricas de um ângulo agudo $\\theta$ são definidas assim:\n\n$$\\sin\\theta = \\frac{\\text{cateto oposto}}{\\text{hipotenusa}}, \\quad \\cos\\theta = \\frac{\\text{cateto adjacente}}{\\text{hipotenusa}}, \\quad \\tan\\theta = \\frac{\\text{cateto oposto}}{\\text{cateto adjacente}}$$\n\nO seno relaciona o lado oposto ao ângulo com a hipotenusa; o cosseno usa o lado adjacente; a tangente compara os dois catetos entre si.",
                    },
                    {
                        type: "text",
                        value: "## Seno e cosseno como coordenadas\n\nNo círculo de raio 1, o ponto associado ao ângulo $\\theta$ tem coordenadas $(\\cos\\theta, \\sin\\theta)$. Ou seja:\n\n- O cosseno é a abscissa (a coordenada $x$).\n- O seno é a ordenada (a coordenada $y$).\n\nComo o raio é 1, tanto o seno quanto o cosseno ficam sempre entre $-1$ e $1$. A tangente aparece como a razão entre eles:\n\n$$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$$\n\nPor isso a tangente não existe quando $\\cos\\theta = 0$: não dá para dividir por zero.",
                    },
                    {
                        type: "quote",
                        value: "No círculo, o cosseno anda na horizontal e o seno na vertical. Guardando só isso, você não troca mais um pelo outro na hora da prova.",
                    },
                    {
                        type: "text",
                        value: "## Os sinais em cada quadrante\n\nO plano se divide em quatro quadrantes, e o sinal de cada razão depende de onde o ponto cai:\n\n| Quadrante | Seno | Cosseno | Tangente |\n| --- | --- | --- | --- |\n| 1º (0° a 90°) | + | + | + |\n| 2º (90° a 180°) | + | - | - |\n| 3º (180° a 270°) | - | - | + |\n| 4º (270° a 360°) | - | + | - |\n\nUma forma de lembrar: no 1º quadrante tudo é positivo; depois, um de cada vez, seguem positivos apenas o seno (2º), a tangente (3º) e o cosseno (4º).",
                    },
                    {
                        type: "text",
                        value: "## Valores notáveis\n\nOs ângulos de 30°, 45° e 60° têm valores que vale a pena decorar:\n\n| Ângulo | $\\sin$ | $\\cos$ | $\\tan$ |\n| --- | --- | --- | --- |\n| 0° | $0$ | $1$ | $0$ |\n| 30° | $\\frac{1}{2}$ | $\\frac{\\sqrt{3}}{2}$ | $\\frac{\\sqrt{3}}{3}$ |\n| 45° | $\\frac{\\sqrt{2}}{2}$ | $\\frac{\\sqrt{2}}{2}$ | $1$ |\n| 60° | $\\frac{\\sqrt{3}}{2}$ | $\\frac{1}{2}$ | $\\sqrt{3}$ |\n| 90° | $1$ | $0$ | indefinida |\n\nRepare na simetria: do 30° para o 60°, os valores de seno e cosseno trocam de lugar.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: um ângulo do 1º quadrante\n\nQual é o cosseno de 60°? Pela tabela, $\\cos 60^\\circ = \\frac{1}{2}$. Cuidado para não confundir com o seno: $\\sin 60^\\circ = \\frac{\\sqrt{3}}{2}$. Como 60° está no 1º quadrante, os dois valores são positivos, o que confere com a tabela de sinais.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: um ângulo do 2º quadrante\n\nVamos achar $\\cos 150^\\circ$. O ângulo 150° está no 2º quadrante, onde o cosseno é negativo. Seu ângulo de referência (a distância até o eixo horizontal) é $180^\\circ - 150^\\circ = 30^\\circ$. Como $\\cos 30^\\circ = \\frac{\\sqrt{3}}{2}$, basta aplicar o sinal do quadrante:\n\n$$\\cos 150^\\circ = -\\frac{\\sqrt{3}}{2}$$\n\nO valor absoluto vem do ângulo de referência; o sinal vem do quadrante.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- No círculo de raio 1, o ponto do ângulo $\\theta$ é $(\\cos\\theta, \\sin\\theta)$: cosseno na horizontal, seno na vertical.\n- A tangente é $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$ e não existe quando $\\cos\\theta = 0$.\n- O sinal de cada razão depende do quadrante; só o 1º tem as três positivas.\n- Para ângulos fora do 1º quadrante, use o ângulo de referência para o valor e o quadrante para o sinal.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "No círculo trigonométrico, a abscissa (coordenada $x$) do ponto de um ângulo corresponde a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "o seno do ângulo",
                                isCorrect: false,
                            },
                            {
                                text: "o cosseno do ângulo",
                                isCorrect: true,
                            },
                            {
                                text: "a tangente do ângulo",
                                isCorrect: false,
                            },
                            {
                                text: "a secante do ângulo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor do cosseno de 60°?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{\\sqrt{3}}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sqrt{2}}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor da tangente de 45°?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{\\sqrt{2}}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sqrt{3}}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor do cosseno de 150°?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-\\frac{\\sqrt{3}}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\sqrt{3}}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor da tangente de 120°?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\sqrt{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\sqrt{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$-\\frac{\\sqrt{3}}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sqrt{3}}{3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Funções trigonométricas e seus gráficos",
                blocks: [
                    {
                        type: "text",
                        value: "## Do círculo para a função\n\nQuando deixamos o ângulo $x$ variar livremente e acompanhamos o valor de $\\sin x$, obtemos uma função: a cada entrada $x$ (em radianos) corresponde uma saída $\\sin x$. O mesmo vale para o cosseno e a tangente. Como o ângulo pode dar quantas voltas quisermos, essas funções se repetem de tempos em tempos: dizemos que são periódicas.\n\nEntender o formato desses gráficos ajuda a prever o comportamento das funções, algo essencial quando o Cálculo pedir limites e derivadas delas.",
                    },
                    {
                        type: "text",
                        value: "## A função seno\n\nA função $f(x) = \\sin x$ tem domínio em todos os números reais e imagem no intervalo $[-1, 1]$. Seu gráfico é uma onda suave, a senoide, que:\n\n- Vale $0$ quando $x = 0$.\n- Sobe até o máximo $1$ em $x = \\frac{\\pi}{2}$.\n- Volta a $0$ em $x = \\pi$, chega ao mínimo $-1$ em $x = \\frac{3\\pi}{2}$ e fecha o ciclo em $x = 2\\pi$.\n\nDepois disso o desenho se repete. O comprimento de um ciclo completo é o período, que para o seno vale $2\\pi$.",
                    },
                    {
                        type: "text",
                        value: "## A função cosseno\n\nA função $g(x) = \\cos x$ também tem domínio real, imagem $[-1, 1]$ e período $2\\pi$. A diferença está no ponto de partida: em $x = 0$, o cosseno já vale $1$, seu valor máximo. O gráfico do cosseno é igual ao do seno, só que adiantado: é a mesma onda deslocada $\\frac{\\pi}{2}$ para a esquerda.",
                    },
                    {
                        type: "quote",
                        value: "Seno e cosseno são a mesma onda com pontos de partida diferentes. Quase tudo que vale para um, com um pequeno deslocamento, vale para o outro.",
                    },
                    {
                        type: "text",
                        value: "## A função tangente\n\nA tangente se comporta de outro jeito. Como $\\tan x = \\frac{\\sin x}{\\cos x}$, ela não existe onde o cosseno zera, ou seja, em $x = \\frac{\\pi}{2}, \\frac{3\\pi}{2}, \\dots$ Nesses pontos o gráfico tem assíntotas verticais, retas das quais a curva chega perto sem nunca tocar.\n\nA imagem da tangente são todos os reais, e seu período é $\\pi$, a metade do período do seno e do cosseno. Entre duas assíntotas seguidas, a curva sobe de valores muito negativos a valores muito positivos.",
                    },
                    {
                        type: "text",
                        value: "## Amplitude e período\n\nMuitas aplicações usam funções do tipo $f(x) = a \\sin(bx)$ ou $f(x) = a \\cos(bx)$. Dois parâmetros controlam o formato:\n\n- A amplitude é $|a|$: ela estica ou comprime a onda na vertical, e a imagem passa a ser $[-|a|, |a|]$.\n- O período passa a ser $\\frac{2\\pi}{|b|}$: quanto maior o $b$, mais espremida na horizontal fica a onda.\n\nCom $a = 1$ e $b = 1$ voltamos ao seno e ao cosseno originais.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: mudando a amplitude\n\nConsidere $f(x) = 3\\cos x$. Aqui $a = 3$ e $b = 1$. A amplitude é $|3| = 3$, então a onda vai de $-3$ a $3$ e a imagem é $[-3, 3]$. Como $b = 1$, o período continua $2\\pi$, o mesmo do cosseno comum. O gráfico é o do cosseno esticado três vezes na vertical.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: mudando o período\n\nAgora veja $f(x) = \\sin(2x)$. Temos $a = 1$ e $b = 2$. A amplitude segue $1$, mas o período vira:\n\n$$\\frac{2\\pi}{|2|} = \\pi$$\n\nIsso significa que a onda completa um ciclo inteiro em $\\pi$, na metade do espaço que o seno comum usa. Entre $0$ e $2\\pi$ cabem dois ciclos completos.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Seno e cosseno têm domínio real, imagem $[-1, 1]$ e período $2\\pi$; a tangente tem imagem real, período $\\pi$ e assíntotas onde o cosseno zera.\n- Em $f(x) = a\\sin(bx)$, a amplitude é $|a|$ e o período é $\\frac{2\\pi}{|b|}$.\n- Aumentar $|a|$ estica a onda na vertical; aumentar $|b|$ a comprime na horizontal.\n- Reconhecer esses padrões deixa o gráfico previsível, sem precisar calcular ponto a ponto.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o período da função $f(x) = \\sin x$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\pi}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\pi$",
                                isCorrect: true,
                            },
                            {
                                text: "$4\\pi$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a imagem (conjunto de valores) da função $f(x) = \\sin x$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$[0, 1]$",
                                isCorrect: false,
                            },
                            {
                                text: "todos os números reais",
                                isCorrect: false,
                            },
                            {
                                text: "$[-2, 2]$",
                                isCorrect: false,
                            },
                            {
                                text: "$[-1, 1]$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o período da função $f(x) = \\tan x$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\pi$",
                                isCorrect: true,
                            },
                            {
                                text: "$2\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\pi}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$4\\pi$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a amplitude da função $f(x) = 3\\cos x$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o período da função $f(x) = \\sin\\left(\\frac{x}{2}\\right)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$2\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$4\\pi$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\pi}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Identidades trigonométricas",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é uma identidade\n\nUma identidade trigonométrica é uma igualdade que vale para todo ângulo em que as expressões fazem sentido, e não apenas para alguns valores especiais. Diferente de uma equação, que resolvemos para achar certos ângulos, a identidade já é sempre verdadeira e funciona como ferramenta: ela permite trocar uma expressão por outra equivalente, simplificando contas.\n\nAlgumas identidades são tão usadas que precisam estar na ponta da língua.",
                    },
                    {
                        type: "text",
                        value: "## A identidade fundamental\n\nA mais importante de todas vem direto do círculo de raio 1. Como o ponto $(\\cos\\theta, \\sin\\theta)$ está sobre a circunferência, a distância dele até a origem é 1. Aplicando o teorema de Pitágoras a esse ponto, chega-se à **relação fundamental da trigonometria**:\n\n$$\\sin^2\\theta + \\cos^2\\theta = 1$$\n\nCom ela, conhecendo o seno de um ângulo encontramos o cosseno (a menos do sinal, que o quadrante decide), e vice-versa.",
                    },
                    {
                        type: "text",
                        value: "## Identidades a partir da fundamental\n\nOutras relações saem da fundamental. Dividindo os dois lados por $\\cos^2\\theta$, chega-se a:\n\n$$1 + \\tan^2\\theta = \\sec^2\\theta$$\n\nAqui usamos $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$ e a secante $\\sec\\theta = \\frac{1}{\\cos\\theta}$. Ou seja, a partir de poucas relações básicas conseguimos gerar várias outras conforme a necessidade.",
                    },
                    {
                        type: "quote",
                        value: "Identidade não serve para resolver, serve para reescrever: é a chave que troca uma expressão embolada por outra mais simples, sem mudar o valor.",
                    },
                    {
                        type: "text",
                        value: "## Soma de arcos e arco duplo\n\nPara somar dois ângulos, usamos as fórmulas de adição:\n\n$$\\sin(a + b) = \\sin a \\cos b + \\cos a \\sin b$$\n\n$$\\cos(a + b) = \\cos a \\cos b - \\sin a \\sin b$$\n\nFazendo $a = b = \\theta$ na primeira, obtemos a fórmula do arco duplo do seno:\n\n$$\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta$$\n\ne, de modo parecido, $\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: achando o cosseno a partir do seno\n\nSuponha que $\\sin\\theta = \\frac{3}{5}$ e que $\\theta$ esteja no 1º quadrante. Pela identidade fundamental:\n\n$$\\cos^2\\theta = 1 - \\sin^2\\theta = 1 - \\frac{9}{25} = \\frac{16}{25}$$\n\nLogo $\\cos\\theta = \\pm\\frac{4}{5}$. Como $\\theta$ está no 1º quadrante, o cosseno é positivo, e ficamos com $\\cos\\theta = \\frac{4}{5}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: usando o arco duplo\n\nCom os mesmos dados, $\\sin\\theta = \\frac{3}{5}$ e $\\cos\\theta = \\frac{4}{5}$, vamos calcular $\\sin(2\\theta)$:\n\n$$\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta = 2 \\cdot \\frac{3}{5} \\cdot \\frac{4}{5} = \\frac{24}{25}$$\n\nRepare que não foi preciso descobrir o valor do ângulo $\\theta$: a identidade resolve tudo a partir do seno e do cosseno já conhecidos.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Identidade é uma igualdade válida para todo ângulo; serve para reescrever e simplificar.\n- A relação fundamental é $\\sin^2\\theta + \\cos^2\\theta = 1$, consequência direta do círculo de raio 1.\n- Dela saem outras, como $1 + \\tan^2\\theta = \\sec^2\\theta$.\n- As fórmulas de soma e de arco duplo, como $\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta$, ampliam o que dá para calcular sem conhecer o ângulo exato.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual das opções é a identidade trigonométrica fundamental?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sin^2\\theta - \\cos^2\\theta = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sin\\theta + \\cos\\theta = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sin^2\\theta + \\cos^2\\theta = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sin^2\\theta + \\cos^2\\theta = 1$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "A tangente $\\tan\\theta$ é igual a qual expressão?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{\\sin\\theta}{\\cos\\theta}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\cos\\theta}{\\sin\\theta}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sin\\theta \\cdot \\cos\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{\\sin\\theta}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $\\cos\\theta = \\frac{3}{5}$ e $\\theta$ está no 1º quadrante, quanto vale $\\sin\\theta$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{3}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{4}{5}$",
                                isCorrect: true,
                            },
                            {
                                text: "$-\\frac{4}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{2}{5}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A fórmula do arco duplo do seno, $\\sin(2\\theta)$, é igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\sin^2\\theta + \\cos^2\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\sin\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\sin\\theta\\cos\\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sin\\theta\\cos\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $\\sin\\theta = \\frac{1}{2}$ e $\\cos\\theta = \\frac{\\sqrt{3}}{2}$, quanto vale $\\sin(2\\theta)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{\\sqrt{3}}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sqrt{3}}{2}$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Equações trigonométricas",
                blocks: [
                    {
                        type: "text",
                        value: "## O que muda numa equação trigonométrica\n\nUma equação trigonométrica é aquela em que a incógnita aparece dentro de um seno, cosseno ou tangente, como em $\\sin x = \\frac{1}{2}$. Resolver significa encontrar os ângulos $x$ que tornam a igualdade verdadeira.\n\nA novidade em relação a outras equações é a periodicidade: como as funções se repetem a cada volta, uma equação desse tipo costuma ter infinitas soluções. Por isso é comum pedir apenas as soluções dentro de um intervalo, por exemplo $[0, 2\\pi)$.",
                    },
                    {
                        type: "text",
                        value: "## A estratégia no círculo\n\nO caminho é quase sempre o mesmo: isolar a função trigonométrica e perguntar quais ângulos do círculo têm aquele valor. Duas ideias ajudam:\n\n- O ângulo de referência dá o valor absoluto da solução.\n- Os quadrantes em que a função tem o sinal desejado dizem quantas e quais soluções existem na volta.\n\nDepois, se o enunciado pedir todas as soluções, somamos as voltas completas: $+\\, 2k\\pi$ para seno e cosseno, ou $+\\, k\\pi$ para a tangente, com $k$ inteiro.",
                    },
                    {
                        type: "text",
                        value: "## Equações com seno\n\nNo seno, dentro de $[0, 2\\pi)$ um valor positivo aparece em dois ângulos: um no 1º quadrante e outro no 2º. Por exemplo, $\\sin x = \\frac{1}{2}$ tem referência $\\frac{\\pi}{6}$, então:\n\n$$x = \\frac{\\pi}{6} \\quad \\text{ou} \\quad x = \\pi - \\frac{\\pi}{6} = \\frac{5\\pi}{6}$$\n\nConsiderando todas as voltas, a solução geral é $x = \\frac{\\pi}{6} + 2k\\pi$ ou $x = \\frac{5\\pi}{6} + 2k\\pi$.",
                    },
                    {
                        type: "text",
                        value: "## Equações com cosseno\n\nNo cosseno, as duas soluções de um mesmo valor são simétricas em relação ao eixo horizontal. Para $\\cos x = \\frac{1}{2}$, a referência é $\\frac{\\pi}{3}$, e em $[0, 2\\pi)$ temos:\n\n$$x = \\frac{\\pi}{3} \\quad \\text{ou} \\quad x = 2\\pi - \\frac{\\pi}{3} = \\frac{5\\pi}{3}$$\n\nUma cai no 1º quadrante e a outra no 4º, exatamente onde o cosseno é positivo.",
                    },
                    {
                        type: "quote",
                        value: "O erro mais comum não é achar o ângulo de referência, e sim esquecer a segunda solução da volta. Antes de fechar a conta, pergunte em quais quadrantes aquele sinal aparece.",
                    },
                    {
                        type: "text",
                        value: "## Equações com tangente\n\nComo a tangente tem período $\\pi$, e não $2\\pi$, suas soluções se repetem a cada meia volta. Para $\\tan x = 1$, a referência é $\\frac{\\pi}{4}$, e a solução geral é:\n\n$$x = \\frac{\\pi}{4} + k\\pi$$\n\nDentro de $[0, 2\\pi)$ isso dá dois valores: $\\frac{\\pi}{4}$ e $\\frac{5\\pi}{4}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: resolvendo passo a passo\n\nVamos resolver $2\\sin x - 1 = 0$ em $[0, 2\\pi)$. Primeiro isolamos o seno:\n\n$$2\\sin x = 1 \\implies \\sin x = \\frac{1}{2}$$\n\nO valor $\\frac{1}{2}$ é positivo, então as soluções estão no 1º e no 2º quadrantes, com referência $\\frac{\\pi}{6}$. Logo:\n\n$$x = \\frac{\\pi}{6} \\quad \\text{ou} \\quad x = \\frac{5\\pi}{6}$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: quando o valor é negativo\n\nAgora resolvemos $\\cos x = -\\frac{1}{2}$ em $[0, 2\\pi)$. O valor é negativo, e o cosseno é negativo no 2º e no 3º quadrantes. A referência vem de $\\frac{\\pi}{3}$, o ângulo cujo cosseno vale $\\frac{1}{2}$. Aplicando os quadrantes:\n\n$$x = \\pi - \\frac{\\pi}{3} = \\frac{2\\pi}{3} \\quad \\text{ou} \\quad x = \\pi + \\frac{\\pi}{3} = \\frac{4\\pi}{3}$$\n\nAs duas soluções ficam à esquerda no círculo, onde o cosseno (a coordenada horizontal) é negativo.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Numa equação trigonométrica, isole a função e procure os ângulos com aquele valor no círculo.\n- O ângulo de referência dá o valor; os quadrantes com o sinal certo dão as soluções da volta.\n- Em $[0, 2\\pi)$, seno e cosseno costumam ter duas soluções; some $+\\, 2k\\pi$ (ou $+\\, k\\pi$ na tangente) para a solução geral.\n- O deslize mais frequente é parar na primeira solução e esquecer a segunda.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Quantas soluções a equação $\\sin x = \\frac{1}{2}$ tem no intervalo $[0, 2\\pi)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "duas",
                                isCorrect: true,
                            },
                            {
                                text: "uma",
                                isCorrect: false,
                            },
                            {
                                text: "quatro",
                                isCorrect: false,
                            },
                            {
                                text: "infinitas",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Uma solução de $\\cos x = 1$ no intervalo $[0, 2\\pi)$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = \\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = \\frac{\\pi}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 2\\pi$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "As soluções de $\\sin x = \\frac{1}{2}$ em $[0, 2\\pi)$ são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{\\pi}{6}$ e $\\frac{7\\pi}{6}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\pi}{3}$ e $\\frac{2\\pi}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\pi}{6}$ e $\\frac{5\\pi}{6}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\pi}{6}$ e $\\frac{11\\pi}{6}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "As soluções de $\\cos x = \\frac{1}{2}$ em $[0, 2\\pi)$ são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{\\pi}{3}$ e $\\frac{2\\pi}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\pi}{6}$ e $\\frac{11\\pi}{6}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\pi}{3}$ e $\\frac{4\\pi}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\pi}{3}$ e $\\frac{5\\pi}{3}$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "As soluções de $\\cos x = -\\frac{\\sqrt{2}}{2}$ em $[0, 2\\pi)$ são:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{3\\pi}{4}$ e $\\frac{5\\pi}{4}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\pi}{4}$ e $\\frac{7\\pi}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{3\\pi}{4}$ e $\\frac{7\\pi}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\pi}{4}$ e $\\frac{3\\pi}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Preparação para o Cálculo",
        aulas: [
            {
                titulo: "Funcoes definidas por partes",
                blocks: [
                    {
                        type: "text",
                        value: "## Uma funcao, varias regras\n\nAte agora voce trabalhou com funcoes em que uma unica formula valia para todo o dominio, como $f(x) = 2x + 1$ ou $g(x) = x^2$. Mas muitas situacoes do dia a dia mudam de regra conforme a entrada.\n\nPense na conta de luz: ate um certo consumo voce paga uma tarifa; acima dele, paga outra. O preco do frete pode ser fixo ate 5 kg e crescer depois disso. Nesses casos, uma unica expressao nao da conta, e por isso usamos uma **funcao definida por partes**.",
                    },
                    {
                        type: "text",
                        value: "## A notacao de chaves\n\nUma funcao definida por partes usa uma chave para listar cada regra ao lado da condicao em que ela vale. Por exemplo:\n\n$$f(x) = \\begin{cases} x + 1, & \\text{se } x < 0 \\\\ x^2, & \\text{se } x \\ge 0 \\end{cases}$$\n\nLe-se assim: se a entrada $x$ for menor que zero, use a regra $x + 1$; se $x$ for maior ou igual a zero, use a regra $x^2$. Cada linha vale apenas no pedaco do dominio indicado pela condicao a direita.",
                    },
                    {
                        type: "text",
                        value: "## Como calcular o valor num ponto\n\nPara achar $f(a)$, o segredo e um so: primeiro descubra em qual pedaco o numero $a$ se encaixa e so entao aplique a regra daquele pedaco. Muita gente erra por aplicar a formula errada sem checar a condicao.\n\nUsando a funcao acima:\n\n$$f(x) = \\begin{cases} x + 1, & \\text{se } x < 0 \\\\ x^2, & \\text{se } x \\ge 0 \\end{cases}$$\n\nPara calcular $f(-3)$: como $-3 < 0$, usamos a primeira regra, $x + 1$. Logo $f(-3) = -3 + 1 = -2$.\n\nPara calcular $f(4)$: como $4 \\ge 0$, usamos a segunda regra, $x^2$. Logo $f(4) = 4^2 = 16$.\n\nRepare na fronteira $x = 0$. A condicao $x \\ge 0$ inclui o zero, entao $f(0) = 0^2 = 0$.",
                    },
                    {
                        type: "text",
                        value: "## Um exemplo do dia a dia\n\nUma loja cobra o frete assim: 10 reais para compras de ate 100 reais e frete gratis acima disso. Chamando de $x$ o valor da compra e de $F(x)$ o valor do frete, temos:\n\n$$F(x) = \\begin{cases} 10, & \\text{se } x \\le 100 \\\\ 0, & \\text{se } x > 100 \\end{cases}$$\n\nUma compra de 80 reais cai no primeiro pedaco, entao paga $F(80) = 10$ reais de frete. Uma compra de 150 reais cai no segundo, entao $F(150) = 0$. Aqui a funcao da um salto no ponto $x = 100$: logo antes o frete e 10, logo depois e 0. Esse salto e tipico de funcoes por partes.",
                    },
                    {
                        type: "text",
                        value: "## O que acontece no grafico\n\nO grafico de uma funcao por partes e montado juntando os pedacos, cada um desenhado apenas no trecho em que vale. Nas fronteiras podem aparecer duas situacoes:\n\n- Os pedacos se encontram na mesma altura e o grafico segue sem interrupcao.\n- Os pedacos chegam a alturas diferentes e o grafico da um salto.\n\nNo exemplo do frete, o grafico fica na altura 10 ate $x = 100$ e depois pula para a altura 0. Costuma-se usar uma bolinha cheia para o ponto que pertence ao pedaco e uma bolinha vazia para o que nao pertence. Essa ideia de salto vai reaparecer quando estudarmos limites e continuidade.",
                    },
                    {
                        type: "quote",
                        value: "Antes de aplicar qualquer regra em uma funcao por partes, pergunte-se: em qual pedaco a minha entrada se encaixa? A condicao vem primeiro, a conta vem depois.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma funcao definida por partes usa regras diferentes em pedacos diferentes do dominio.\n- Para calcular $f(a)$, primeiro identifique a qual pedaco $a$ pertence e so entao aplique a regra correspondente.\n- Preste atencao as fronteiras: o sinal $\\le$ ou $\\ge$ indica qual pedaco fica com o ponto de encontro.\n- Nas fronteiras a funcao pode seguir suave ou dar um salto, ideia que prepara o terreno para limites e continuidade.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Considere $f(x) = \\begin{cases} x + 1, & \\text{se } x < 0 \\\\ x^2, & \\text{se } x \\ge 0 \\end{cases}$. Qual o valor de $f(-2)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$-1$",
                                isCorrect: true,
                            },
                            {
                                text: "$-3$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $g(x) = \\begin{cases} 2x, & \\text{se } x \\le 3 \\\\ x + 5, & \\text{se } x > 3 \\end{cases}$. Quanto vale $g(3)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$8$",
                                isCorrect: false,
                            },
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: true,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma loja cobra frete de 12 reais para compras de ate 80 reais e 4 reais para compras acima de 80 reais. Qual o frete de uma compra de 120 reais?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$4$ reais",
                                isCorrect: true,
                            },
                            {
                                text: "$12$ reais",
                                isCorrect: false,
                            },
                            {
                                text: "$16$ reais",
                                isCorrect: false,
                            },
                            {
                                text: "$8$ reais",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para calcular $f(5)$ em $f(x) = \\begin{cases} 3x - 1, & \\text{se } x < 5 \\\\ x^2, & \\text{se } x \\ge 5 \\end{cases}$, qual regra usar e qual o resultado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "a regra $3x - 1$, dando $14$",
                                isCorrect: false,
                            },
                            {
                                text: "a regra $x^2$, dando $10$",
                                isCorrect: false,
                            },
                            {
                                text: "a regra $3x - 1$, dando $24$",
                                isCorrect: false,
                            },
                            {
                                text: "a regra $x^2$, dando $25$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Considere $h(x) = \\begin{cases} x + 2, & \\text{se } x < 1 \\\\ 4, & \\text{se } x \\ge 1 \\end{cases}$. O que acontece com o grafico de $h$ em $x = 1$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "da um salto, de perto de $4$ para $3$",
                                isCorrect: false,
                            },
                            {
                                text: "da um salto, de perto de $3$ para $4$",
                                isCorrect: true,
                            },
                            {
                                text: "e continuo e vale $3$ ali",
                                isCorrect: false,
                            },
                            {
                                text: "nao esta definido ali",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Comportamento assintotico e limites no infinito",
                blocks: [
                    {
                        type: "text",
                        value: "## Para onde a funcao vai la longe\n\nQuando estudamos uma funcao, uma pergunta natural e: o que acontece com $f(x)$ quando $x$ fica muito grande? Se voce pega valores de $x$ cada vez maiores, como $100$, $1000$ e ate um milhao, para onde vao os valores da funcao?\n\nEsse e o **comportamento no infinito**, tambem chamado de comportamento assintotico. Ele descreve a tendencia da funcao la longe, bem a direita ou bem a esquerda do grafico, e e uma das primeiras ideias de limite que o Calculo formaliza.",
                    },
                    {
                        type: "text",
                        value: "## A ideia central: dividir por algo enorme\n\nO fato mais importante e simples. Pense na fracao $\\frac{1}{x}$. Se $x = 10$, ela vale $0{,}1$. Se $x = 1000$, vale $0{,}001$. Quanto maior o $x$, mais perto de zero fica a fracao, sem nunca chegar exatamente a zero.\n\nEscrevemos isso assim:\n\n$$\\lim_{x \\to \\infty} \\frac{1}{x} = 0$$\n\nLe-se: o limite de $\\frac{1}{x}$ quando $x$ tende ao infinito e zero. A mesma ideia vale para $\\frac{1}{x^2}$, $\\frac{5}{x}$ ou $\\frac{1}{\\sqrt{x}}$: dividir um numero fixo por algo que cresce sem parar leva o resultado a zero.",
                    },
                    {
                        type: "text",
                        value: "## Os dois lados do infinito\n\nPodemos olhar tanto para a direita quanto para a esquerda:\n\n- $x \\to +\\infty$ significa $x$ crescendo sem limite, indo para a direita no grafico.\n- $x \\to -\\infty$ significa $x$ ficando cada vez mais negativo, indo para a esquerda.\n\nPara $f(x) = \\frac{1}{x}$, quando $x \\to +\\infty$ os valores se aproximam de $0$ por cima, positivos e minusculos; quando $x \\to -\\infty$ se aproximam de $0$ por baixo, negativos e minusculos. Nos dois casos:\n\n$$\\lim_{x \\to +\\infty} \\frac{1}{x} = 0 \\qquad \\lim_{x \\to -\\infty} \\frac{1}{x} = 0$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: uma funcao racional\n\nVamos analisar o comportamento de\n\n$$f(x) = \\frac{2x + 1}{x + 3}$$\n\nquando $x \\to \\infty$. O truque e dividir o numerador e o denominador pela maior potencia de $x$ que aparece, aqui o proprio $x$:\n\n$$f(x) = \\frac{2 + \\frac{1}{x}}{1 + \\frac{3}{x}}$$\n\nAgora usamos a ideia central. Quando $x \\to \\infty$, tanto $\\frac{1}{x}$ quanto $\\frac{3}{x}$ vao para zero. Sobra:\n\n$$\\lim_{x \\to \\infty} f(x) = \\frac{2 + 0}{1 + 0} = 2$$\n\nOu seja, la longe a funcao se aproxima da altura $2$.",
                    },
                    {
                        type: "text",
                        value: "## Regra pratica para funcoes racionais\n\nEm um quociente de polinomios, basta comparar os termos de maior grau de cima e de baixo:\n\n- Se o grau de cima e menor que o de baixo, o limite no infinito e $0$. Exemplo: $\\frac{x}{x^2 + 1} \\to 0$.\n- Se os graus sao iguais, o limite e a razao dos coeficientes dos termos de maior grau. Exemplo: $\\frac{2x + 1}{x + 3} \\to 2$.\n- Se o grau de cima e maior, a funcao cresce sem limite e nao tende a um numero finito.\n\nEssa regra e um atalho para o mesmo raciocinio de dividir pela maior potencia.",
                    },
                    {
                        type: "text",
                        value: "## Assintota horizontal\n\nQuando os valores de $f(x)$ se aproximam de um numero fixo $L$ a medida que $x \\to \\infty$ ou $x \\to -\\infty$, dizemos que a reta $y = L$ e uma **assintota horizontal** do grafico. A funcao chega cada vez mais perto dessa reta, mas em geral nao a toca.\n\nNo exemplo $f(x) = \\frac{2x + 1}{x + 3}$, a reta $y = 2$ e uma assintota horizontal. Se voce desenhasse o grafico, veria a curva colando na altura $2$ conforme se afasta para os lados.",
                    },
                    {
                        type: "quote",
                        value: "O infinito nao e um numero que voce alcanca, e sim uma direcao para onde caminhar. Perguntar o limite no infinito e perguntar para onde a funcao aponta la longe.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O comportamento no infinito descreve para onde vao os valores de $f(x)$ quando $x$ cresce ou decresce sem limite.\n- A ideia central e que dividir um numero fixo por algo enorme da quase zero: $\\lim_{x \\to \\infty} \\frac{1}{x} = 0$.\n- Em funcoes racionais, compare os graus: grau de cima menor leva a $0$; graus iguais levam a razao dos coeficientes.\n- Se $f(x)$ se aproxima de $L$ no infinito, a reta $y = L$ e uma assintota horizontal.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual e o valor de $\\lim_{x \\to \\infty} \\frac{1}{x}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "$-\\infty$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quanto vale $\\lim_{x \\to \\infty} \\frac{5}{x}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{5}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual e $\\lim_{x \\to \\infty} \\frac{3x + 2}{x - 4}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Determine $\\lim_{x \\to \\infty} \\frac{x + 1}{x^2 + 5}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{5}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual reta e a assintota horizontal do grafico de $f(x) = \\frac{6x - 1}{2x + 7}$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$y = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = \\frac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 3$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Nocao intuitiva de limite",
                blocks: [
                    {
                        type: "text",
                        value: "## A ideia de se aproximar\n\nO limite e a ideia mais importante do Calculo, e felizmente a intuicao por tras dele e bem natural.\n\nA pergunta e a seguinte: a medida que $x$ se aproxima de um numero $a$, para qual valor $f(x)$ se aproxima? Repare que nao estamos perguntando quanto vale $f$ exatamente em $a$, e sim para onde $f$ esta indo quando $x$ chega pertinho de $a$.",
                    },
                    {
                        type: "text",
                        value: "## Chegando perto por uma tabela\n\nConsidere $f(x) = x + 3$ e vamos investigar o que acontece quando $x$ se aproxima de $2$. Montamos uma tabela com valores de $x$ cada vez mais proximos de $2$, por baixo e por cima:\n\n| $x$ | $1{,}9$ | $1{,}99$ | $1{,}999$ | $2{,}001$ | $2{,}01$ | $2{,}1$ |\n| --- | --- | --- | --- | --- | --- | --- |\n| $f(x)$ | $4{,}9$ | $4{,}99$ | $4{,}999$ | $5{,}001$ | $5{,}01$ | $5{,}1$ |\n\nConforme $x$ se aproxima de $2$ pelos dois lados, os valores de $f(x)$ se aproximam de $5$. Dizemos que o limite de $f(x)$ quando $x$ tende a $2$ e $5$.",
                    },
                    {
                        type: "text",
                        value: "## A notacao de limite\n\nEscrevemos o que descobrimos assim:\n\n$$\\lim_{x \\to 2} (x + 3) = 5$$\n\nLe-se: o limite de $x + 3$ quando $x$ tende a $2$ e igual a $5$. A setinha $x \\to 2$ carrega a ideia de aproximacao: $x$ chega tao perto de $2$ quanto quisermos, mas nao precisa ser igual a $2$.\n\nEm funcoes simples e bem comportadas como essa, da para achar o limite apenas substituindo: $2 + 3 = 5$. Nem sempre sera tao direto, e e ai que o conceito de limite mostra a sua forca.",
                    },
                    {
                        type: "text",
                        value: "## Limite nao e o valor da funcao\n\nAqui esta a sacada que confunde muita gente. O limite se importa com a vizinhanca de $a$, nao com o ponto $a$ em si. E perfeitamente possivel que $\\lim_{x \\to a} f(x)$ seja um numero e que $f(a)$ seja outro, ou que $f(a)$ nem exista.\n\nImagine uma funcao igual a $x + 3$ em todo lugar, exceto que, exatamente em $x = 2$, alguem definiu $f(2) = 100$. A tabela de aproximacao nao muda em nada, porque ela usa valores perto de $2$, e nao o proprio $2$. Entao o limite continua sendo $5$, mesmo com $f(2) = 100$. Limite e sobre a viagem, nao sobre o destino isolado.",
                    },
                    {
                        type: "text",
                        value: "## Limites laterais\n\nAs vezes a funcao se comporta de um jeito quando chegamos pela esquerda e de outro quando chegamos pela direita. Por isso existem os **limites laterais**:\n\n- $\\lim_{x \\to a^-} f(x)$ e o limite pela esquerda, com $x$ um pouco menor que $a$.\n- $\\lim_{x \\to a^+} f(x)$ e o limite pela direita, com $x$ um pouco maior que $a$.\n\nO limite $\\lim_{x \\to a} f(x)$ so existe quando os dois lados concordam no mesmo valor. Se a esquerda aponta para um numero e a direita para outro, o limite nao existe.",
                    },
                    {
                        type: "text",
                        value: "## Quando o limite nao existe\n\nVolte a ideia de salto das funcoes por partes. Considere\n\n$$f(x) = \\begin{cases} 1, & \\text{se } x < 0 \\\\ 3, & \\text{se } x \\ge 0 \\end{cases}$$\n\nChegando por valores negativos, $f(x)$ vale sempre $1$, entao $\\lim_{x \\to 0^-} f(x) = 1$. Chegando por valores positivos, $f(x)$ vale $3$, entao $\\lim_{x \\to 0^+} f(x) = 3$. Como os dois lados discordam, $\\lim_{x \\to 0} f(x)$ nao existe. O salto no grafico e exatamente o motivo.",
                    },
                    {
                        type: "text",
                        value: "## Um limite que a substituicao nao resolve\n\nConsidere $g(x) = \\frac{x^2 - 1}{x - 1}$. Em $x = 1$ essa expressao vira $\\frac{0}{0}$, que nao faz sentido, entao $g(1)$ nao existe. Mesmo assim, o limite quando $x \\to 1$ existe.\n\nFatorando o numerador, $x^2 - 1 = (x - 1)(x + 1)$. Para $x \\neq 1$ podemos simplificar:\n\n$$g(x) = \\frac{(x - 1)(x + 1)}{x - 1} = x + 1$$\n\nPerto de $1$, sem ser $1$, a funcao se comporta como $x + 1$. Logo:\n\n$$\\lim_{x \\to 1} \\frac{x^2 - 1}{x - 1} = 1 + 1 = 2$$\n\nMesmo com $g(1)$ indefinido, o limite vale $2$. Esse tipo de conta reaparece o tempo todo no Calculo.",
                    },
                    {
                        type: "quote",
                        value: "Calcular um limite e observar para onde a funcao esta indo, sem se prender ao que acontece exatamente no ponto de chegada.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O limite $\\lim_{x \\to a} f(x)$ descreve o valor de que $f(x)$ se aproxima quando $x$ chega perto de $a$.\n- Ele nao depende de $f(a)$: o limite pode existir mesmo que a funcao nao esteja definida no ponto.\n- O limite so existe quando os limites laterais, pela esquerda e pela direita, coincidem.\n- Em funcoes bem comportadas o limite sai por substituicao; em casos como $\\frac{0}{0}$, e preciso simplificar antes.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual o valor de $\\lim_{x \\to 3} (2x - 1)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sabe-se que $\\lim_{x \\to 4} f(x) = 7$, mas $f(4) = 2$. Quanto vale $\\lim_{x \\to 4} f(x)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                            {
                                text: "$7$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma tabela mostra $f(1{,}99) = 8{,}97$, $f(1{,}999) = 8{,}997$, $f(2{,}001) = 9{,}003$ e $f(2{,}01) = 9{,}03$. De qual valor $f(x)$ se aproxima quando $x \\to 2$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$9$",
                                isCorrect: true,
                            },
                            {
                                text: "$8{,}97$",
                                isCorrect: false,
                            },
                            {
                                text: "$18$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x) = \\begin{cases} x, & \\text{se } x < 1 \\\\ x + 2, & \\text{se } x \\ge 1 \\end{cases}$, o que se pode dizer de $\\lim_{x \\to 1} f(x)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "e igual a $1$",
                                isCorrect: false,
                            },
                            {
                                text: "e igual a $3$",
                                isCorrect: false,
                            },
                            {
                                text: "nao existe",
                                isCorrect: true,
                            },
                            {
                                text: "e igual a $2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual e $\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$6$",
                                isCorrect: true,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                            {
                                text: "nao existe",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Taxa de variacao media e a reta tangente",
                blocks: [
                    {
                        type: "text",
                        value: "## Variacao dividida por variacao\n\nImagine uma viagem de carro. Se voce percorre $180$ km em $3$ horas, sua velocidade media foi $\\frac{180}{3} = 60$ km/h. Isso nao significa que o ponteiro ficou cravado em $60$ o tempo todo; e apenas a variacao total dividida pelo tempo total.\n\nEssa ideia de variacao dividida por variacao e a **taxa de variacao media** de uma funcao, e ela e o primeiro passo rumo a derivada.",
                    },
                    {
                        type: "text",
                        value: "## A formula da taxa media\n\nDada uma funcao $f$, a taxa de variacao media entre dois pontos $x = a$ e $x = b$ e a variacao de $f$ dividida pela variacao de $x$:\n\n$$\\text{taxa media} = \\frac{f(b) - f(a)}{b - a}$$\n\nCostumamos escrever a variacao com a letra grega delta: $\\Delta y = f(b) - f(a)$ e $\\Delta x = b - a$, de modo que a taxa media e $\\frac{\\Delta y}{\\Delta x}$.\n\nGeometricamente, esse numero e a inclinacao da reta que passa pelos pontos $(a, f(a))$ e $(b, f(b))$ do grafico. Essa reta que corta a curva em dois pontos e chamada de **reta secante**.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nSeja $f(x) = x^2$. Qual a taxa de variacao media entre $x = 1$ e $x = 3$?\n\nCalculamos os valores nas pontas: $f(1) = 1$ e $f(3) = 9$. Aplicando a formula:\n\n$$\\frac{f(3) - f(1)}{3 - 1} = \\frac{9 - 1}{3 - 1} = \\frac{8}{2} = 4$$\n\nEntre $x = 1$ e $x = 3$, a funcao $x^2$ cresce em media $4$ unidades de $y$ para cada unidade de $x$. Esse $4$ e a inclinacao da secante que liga os pontos $(1, 1)$ e $(3, 9)$.",
                    },
                    {
                        type: "text",
                        value: "## De media para instantanea\n\nA velocidade media de uma viagem esconde os detalhes: em alguns trechos voce foi mais rapido, em outros mais devagar. E se quisessemos a velocidade num instante exato, a que o velocimetro marca?\n\nA ideia genial do Calculo e **encolher o intervalo**. Para saber a taxa exatamente em $x = a$, calculamos a taxa media entre $a$ e um ponto $b$ cada vez mais perto de $a$. Conforme $b$ se aproxima de $a$, a taxa media se aproxima da taxa instantanea. Isso e um limite.",
                    },
                    {
                        type: "text",
                        value: "## Encolhendo o intervalo na pratica\n\nVamos achar a taxa instantanea de $f(x) = x^2$ em $x = 1$. Calculamos a taxa media entre $1$ e valores de $b$ cada vez mais proximos de $1$:\n\n| Intervalo | de 1 a 2 | de 1 a 1,5 | de 1 a 1,1 | de 1 a 1,01 |\n| --- | --- | --- | --- | --- |\n| Taxa media | 3 | 2,5 | 2,1 | 2,01 |\n\nPor exemplo, no intervalo de $1$ a $1{,}1$: $\\frac{f(1{,}1) - f(1)}{1{,}1 - 1} = \\frac{1{,}21 - 1}{0{,}1} = 2{,}1$. Conforme $b$ encosta em $1$, as taxas medias se aproximam de $2$.",
                    },
                    {
                        type: "text",
                        value: "## A reta tangente\n\nA medida que $b$ se aproxima de $a$, o segundo ponto desliza sobre a curva em direcao ao primeiro, e a reta secante gira ate virar a **reta tangente**: aquela que toca a curva em $x = a$ encostando nela, sem corta-la ali por perto.\n\nA inclinacao dessa reta tangente e a taxa de variacao instantanea em $x = a$. No exemplo de $f(x) = x^2$, encontramos que essa inclinacao em $x = 1$ e $2$. Guarde esse valor: no proximo passo do Calculo, ele ganhara o nome de derivada.",
                    },
                    {
                        type: "quote",
                        value: "A taxa media mede o que aconteceu ao longo de um trecho. A taxa instantanea captura o que acontece em um unico instante, encolhendo o trecho ate quase zero.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A taxa de variacao media entre $a$ e $b$ e $\\frac{f(b) - f(a)}{b - a}$, a inclinacao da reta secante.\n- Ela responde quanto $y$ variou, em media, por unidade de $x$ no intervalo.\n- Encolhendo o intervalo, fazendo $b$ tender a $a$, a taxa media se aproxima da taxa instantanea.\n- A taxa instantanea e a inclinacao da reta tangente em $x = a$, ideia que da origem a derivada.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual a taxa de variacao media de $f(x) = x^2$ entre $x = 2$ e $x = 4$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$12$",
                                isCorrect: false,
                            },
                            {
                                text: "$10$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "A taxa de variacao media de $f(x) = 3x + 1$ entre $x = 0$ e $x = 5$ e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$16$",
                                isCorrect: false,
                            },
                            {
                                text: "$15$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x) = -2x + 7$, a taxa de variacao media entre $x = 1$ e $x = 4$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$-6$",
                                isCorrect: false,
                            },
                            {
                                text: "$-2$",
                                isCorrect: true,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um objeto esta em $f(1) = 10$ metros e $f(5) = 30$ metros, com $x$ em segundos. Qual a velocidade media entre esses instantes?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$5$ m/s",
                                isCorrect: true,
                            },
                            {
                                text: "$20$ m/s",
                                isCorrect: false,
                            },
                            {
                                text: "$8$ m/s",
                                isCorrect: false,
                            },
                            {
                                text: "$4$ m/s",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x) = x^2$, a taxa de variacao media entre $x = 3$ e $x = 3{,}01$ vale cerca de $6{,}01$. Esse numero estima qual grandeza?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "a inclinacao da tangente em $x = 3{,}01$",
                                isCorrect: false,
                            },
                            {
                                text: "o valor de $f$ em $x = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "a area sob a curva de $3$ a $3{,}01$",
                                isCorrect: false,
                            },
                            {
                                text: "a inclinacao da tangente em $x = 3$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Continuidade e o caminho para a derivada",
                blocks: [
                    {
                        type: "text",
                        value: "## Desenhar sem tirar o lapis\n\nDe maneira intuitiva, uma funcao e **continua** quando voce consegue desenhar o grafico dela sem tirar o lapis do papel. Nao ha saltos, buracos nem interrupcoes: a curva flui.\n\nJa vimos exemplos do contrario. A funcao de frete que pula de $10$ para $0$ tem um salto. A funcao $\\frac{x^2 - 1}{x - 1}$ tem um buraco em $x = 1$. Nesses pontos, a funcao nao e continua. Vamos deixar essa ideia mais precisa.",
                    },
                    {
                        type: "text",
                        value: "## As tres condicoes da continuidade\n\nDizemos que $f$ e continua em um ponto $x = a$ quando tres coisas acontecem ao mesmo tempo:\n\n1. $f(a)$ existe, ou seja, o ponto esta definido.\n2. $\\lim_{x \\to a} f(x)$ existe, ou seja, os dois lados concordam.\n3. Os dois coincidem: $\\lim_{x \\to a} f(x) = f(a)$.\n\nA terceira condicao e o coracao da continuidade. Ela diz que o valor para onde a funcao aponta e exatamente o valor que ela assume. Onde a funcao vai e onde a funcao esta sao o mesmo lugar.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: verificando a continuidade\n\nA funcao $f(x) = x^2 + 1$ e continua em $x = 2$? Vamos checar as tres condicoes.\n\nPrimeiro, $f(2) = 2^2 + 1 = 5$, entao o ponto existe. Segundo, $\\lim_{x \\to 2} (x^2 + 1) = 5$, entao o limite existe. Terceiro, os dois valem $5$, entao coincidem.\n\nComo as tres condicoes valem, $f$ e continua em $x = 2$. Polinomios, alias, sao continuos em todos os pontos, e por isso seus limites saem por simples substituicao.",
                    },
                    {
                        type: "text",
                        value: "## Os tipos de interrupcao\n\nQuando a continuidade falha, costuma ser por um destes motivos:\n\n- **Buraco**, tambem chamado de removivel: o limite existe, mas $f(a)$ nao esta definido ou esta no lugar errado. E o caso de $\\frac{x^2 - 1}{x - 1}$ em $x = 1$, cujo limite e $2$ mas a funcao nem existe ali.\n- **Salto**: os limites laterais existem, porem apontam para valores diferentes, entao o limite nao existe. E o caso das funcoes por partes que pulam.\n\nEm ambos, algo se quebra em uma das tres condicoes.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: uma funcao que falha\n\nConsidere\n\n$$f(x) = \\begin{cases} x + 1, & \\text{se } x < 2 \\\\ 5, & \\text{se } x \\ge 2 \\end{cases}$$\n\nEm $x = 2$ temos $f(2) = 5$, entao o ponto existe. Mas os limites laterais discordam: pela esquerda, $x + 1 \\to 3$; pela direita e no proprio ponto, o valor e $5$. Como $\\lim_{x \\to 2^-} f(x) = 3$ e $\\lim_{x \\to 2^+} f(x) = 5$, o limite nao existe, e a segunda condicao falha. Portanto $f$ nao e continua em $x = 2$: ha um salto ali.",
                    },
                    {
                        type: "text",
                        value: "## Juntando tudo: o caminho para a derivada\n\nRepare como as ideias deste modulo se encaixam. Estudamos funcoes por partes e vimos saltos. Definimos limite como o valor de que a funcao se aproxima. Usamos continuidade para dizer quando nao ha quebras. E medimos a taxa de variacao media entre dois pontos.\n\nO passo final combina limite e taxa media. Para achar a taxa de variacao instantanea em $x = a$, calculamos a taxa media entre $a$ e $a + h$ e fazemos $h$ tender a zero:\n\n$$\\lim_{h \\to 0} \\frac{f(a + h) - f(a)}{h}$$",
                    },
                    {
                        type: "text",
                        value: "## A derivada\n\nEsse limite tem nome: **derivada** de $f$ em $a$. Ele mede a inclinacao da reta tangente, a taxa instantanea de variacao, a rapidez com que a funcao muda naquele ponto exato.\n\nA continuidade entra como um pre-requisito natural: onde a funcao salta ou tem buraco, nao ha uma reta tangente bem definida, e a derivada nao existe. Por isso pavimentamos o caminho com limites e continuidade antes de chegar aqui. Este e o portal de entrada do Calculo 1, e voce ja tem a intuicao para atravessa-lo.",
                    },
                    {
                        type: "quote",
                        value: "Continuidade e a promessa de que a funcao nao vai te surpreender com um salto. E sobre essa base firme que a derivada e construida.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Intuitivamente, uma funcao e continua quando seu grafico nao tem saltos nem buracos.\n- Formalmente, $f$ e continua em $a$ quando $f(a)$ existe, o limite existe e $\\lim_{x \\to a} f(x) = f(a)$.\n- As quebras mais comuns sao o buraco, ou removivel, e o salto.\n- A derivada e o limite da taxa media quando o intervalo encolhe: $\\lim_{h \\to 0} \\frac{f(a + h) - f(a)}{h}$, a inclinacao da tangente.",
                    },
                ],
                questions: [
                    {
                        statement: "A funcao $f(x) = x^2 + 1$ e continua em $x = 2$ porque:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\lim_{x \\to 2} f(x)$ nao existe",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lim_{x \\to 2} f(x) = f(2)$",
                                isCorrect: true,
                            },
                            {
                                text: "$f(2)$ nao esta definida",
                                isCorrect: false,
                            },
                            {
                                text: "ha um salto em $x = 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A funcao $\\frac{x^2 - 1}{x - 1}$ nao e continua em $x = 1$ porque:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "o limite nao existe em $x = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "os limites laterais discordam",
                                isCorrect: false,
                            },
                            {
                                text: "$f(1)$ nao esta definida",
                                isCorrect: true,
                            },
                            {
                                text: "existe um salto em $x = 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A funcao $f(x) = \\begin{cases} x + 1, & \\text{se } x < 2 \\\\ 5, & \\text{se } x \\ge 2 \\end{cases}$ e continua em $x = 2$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "nao, pois ha um salto em $x = 2$",
                                isCorrect: true,
                            },
                            {
                                text: "sim, pois $f(2) = 5$",
                                isCorrect: false,
                            },
                            {
                                text: "sim, pois e definida por partes",
                                isCorrect: false,
                            },
                            {
                                text: "nao, pois $f(2)$ nao existe",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que $f(x) = \\begin{cases} x + k, & \\text{se } x < 1 \\\\ 4, & \\text{se } x \\ge 1 \\end{cases}$ seja continua em $x = 1$, quanto deve valer $k$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$-3$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "O limite $\\lim_{h \\to 0} \\frac{f(a + h) - f(a)}{h}$ representa:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "a taxa de variacao media em $[a, b]$",
                                isCorrect: false,
                            },
                            {
                                text: "o valor de $f$ no ponto $a$",
                                isCorrect: false,
                            },
                            {
                                text: "a inclinacao da reta tangente em $x = a$",
                                isCorrect: true,
                            },
                            {
                                text: "a inclinacao da secante por $a$ e $b$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
] as unknown as Modulo[];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " já tem " + existentes.length + " aulas. Nada a fazer.");
        return;
    }

    let totalAulas = 0;
    let totalQuestoes = 0;
    for (let mi = 0; mi < MODULOS.length; mi++) {
        const m = MODULOS[mi];
        const [mod] = await db
            .insert(modules)
            .values({ trailId: trilha.id, title: m.titulo, position: mi + 1 })
            .returning();
        for (let li = 0; li < m.aulas.length; li++) {
            const a = m.aulas[li];
            const [lesson] = await db
                .insert(lessons)
                .values({
                    trailId: trilha.id,
                    moduleId: mod.id,
                    title: a.titulo,
                    content: null,
                    contentBlocks: a.blocks,
                    position: li + 1,
                    published: true,
                })
                .returning();
            for (let qi = 0; qi < a.questions.length; qi++) {
                const q = a.questions[qi];
                const [questao] = await db
                    .insert(questions)
                    .values({
                        lessonId: lesson.id,
                        statement: q.statement,
                        difficulty: q.difficulty,
                        position: qi + 1,
                    })
                    .returning();
                await db.insert(questionOptions).values(
                    q.options.map((o, k) => ({
                        questionId: questao.id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        position: k + 1,
                    })),
                );
            }
            totalAulas++;
            totalQuestoes += a.questions.length;
        }
    }
    console.log(
        "Seed concluído: " +
            MODULOS.length +
            " módulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questões.",
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
