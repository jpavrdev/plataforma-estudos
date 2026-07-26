// Seed da trilha Cálculo 1 (limites, derivadas e integral). Conteúdo autoral,
// quiz-only, com fórmulas em LaTeX ($...$ inline e $$...$$ em bloco). Idempotente:
// se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-calculo1.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { backfillExplicacoes, mesclarSolucoes } from "./backfill-explicacoes.ts";

const NOME = "Cálculo 1";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Cálculo 1 de uma variável, dos limites à integral: o conceito de limite (laterais, propriedades, indeterminações e o limite trigonométrico fundamental), limites no infinito, assíntotas e continuidade, a derivada pela definição, as regras de derivação (produto, quociente, cadeia e as derivadas de exponencial, logaritmo e trigonométricas), as aplicações (máximos e mínimos, teorema do valor médio, concavidade, otimização, taxas relacionadas e L'Hôpital) e a integral (antiderivadas, integral definida, o Teorema Fundamental do Cálculo e substituição). O núcleo do cálculo diferencial e integral com que todo curso de exatas começa.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    explanation?: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

// Preenchido na montagem, um módulo por vez, a partir da autoria por subagente.
const MODULOS = [
    {
        titulo: "Módulo 1 - Limites",
        aulas: [
            {
                titulo: "Noção intuitiva de limite",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é um limite?\n\nO **limite** é a ideia central do Cálculo. De forma intuitiva, o limite descreve para onde os valores de uma função $f(x)$ se aproximam quando $x$ se aproxima de um certo número $a$, sem necessariamente atingir esse número.\n\nQuando escrevemos\n\n$$\\lim_{x \\to a} f(x) = L$$\n\nlemos: o limite de $f(x)$ quando $x$ tende a $a$ é igual a $L$. Isso significa que, tomando $x$ cada vez mais próximo de $a$, os valores de $f(x)$ ficam cada vez mais próximos de $L$.",
                    },
                    {
                        type: "text",
                        value: "## O ponto pode ser ignorado\n\nUm detalhe fundamental: o limite se interessa pelo comportamento de $f(x)$ **perto** de $a$, e não exatamente **em** $a$. A função pode nem estar definida em $x = a$ e, ainda assim, ter limite.\n\nÉ por isso que o limite é uma ferramenta tão poderosa: ele permite analisar o comportamento de uma função justamente nos pontos onde a substituição direta falha.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: aproximação numérica\n\nVamos observar $f(x) = 2x + 1$ quando $x$ se aproxima de $1$. Montamos uma tabela com valores de $x$ chegando perto de $1$ pelos dois lados:\n\n| $x$ | 0,9 | 0,99 | 0,999 | 1,001 | 1,01 | 1,1 |\n| --- | --- | --- | --- | --- | --- | --- |\n| $f(x)$ | 2,8 | 2,98 | 2,998 | 3,002 | 3,02 | 3,2 |\n\nConforme $x$ se aproxima de $1$, os valores de $f(x)$ se aproximam de $3$. Logo,\n\n$$\\lim_{x \\to 1} (2x + 1) = 3.$$\n\nNeste caso, o valor do limite coincide com $f(1) = 3$, o que acontece com funções bem comportadas.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: uma função com buraco\n\nConsidere $g(x) = \\frac{x^2 - 1}{x - 1}$. Em $x = 1$ a função não está definida, pois teríamos $\\frac{0}{0}$. Mesmo assim, podemos investigar o limite:\n\n| $x$ | 0,9 | 0,99 | 0,999 | 1,001 | 1,01 | 1,1 |\n| --- | --- | --- | --- | --- | --- | --- |\n| $g(x)$ | 1,9 | 1,99 | 1,999 | 2,001 | 2,01 | 2,1 |\n\nOs valores se aproximam de $2$ pelos dois lados. Portanto,\n\n$$\\lim_{x \\to 1} \\frac{x^2 - 1}{x - 1} = 2,$$\n\nmesmo que $g(1)$ não exista. Isso confirma que o limite não depende do valor da função no ponto.",
                    },
                    {
                        type: "quote",
                        value: "O limite não pergunta quanto vale a função no ponto, e sim para onde ela aponta.",
                    },
                    {
                        type: "text",
                        value: "## Quando o limite difere do valor da função\n\nTambém é possível que $f(a)$ exista, mas seja diferente do limite. Imagine uma função que vale $f(x) = x + 2$ para todo $x \\ne 3$, mas que foi definida com $f(3) = 10$ por algum motivo.\n\nAo analisar $x$ perto de $3$, os valores de $f(x)$ se aproximam de $5$, e não de $10$. Assim,\n\n$$\\lim_{x \\to 3} f(x) = 5 \\ne f(3).$$\n\nO limite descreve a tendência da função, ignorando o ponto isolado.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O limite $\\lim_{x \\to a} f(x) = L$ significa que $f(x)$ se aproxima de $L$ quando $x$ se aproxima de $a$.\n- O limite depende do comportamento **perto** de $a$, nunca do valor exato em $a$.\n- Uma função pode não estar definida em $a$ e ainda assim ter limite.\n- Em funções bem comportadas, o limite coincide com a substituição direta $f(a)$.",
                    },
                ],
                questions: [
                    {
                        statement: "Calcule o limite $\\lim_{x \\to 2} (3x)$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$6$",
                                isCorrect: true,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$8$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x \\to 1} (x + 4)$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre $g(x) = \\frac{x^2 - 4}{x - 2}$, que não está definida em $x = 2$, qual afirmação é correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O limite existe e vale $4$.",
                                isCorrect: true,
                            },
                            {
                                text: "O limite não existe porque $g(2)$ não está definida.",
                                isCorrect: false,
                            },
                            {
                                text: "O limite vale $0$, obtido pela substituição direta.",
                                isCorrect: false,
                            },
                            {
                                text: "O limite vale $2$, o mesmo valor de $x$.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x \\to 0} (x^2 + 3)$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$3$",
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
                                text: "$5$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma função vale $f(x) = x + 5$ para todo $x \\ne 2$, mas $f(2) = 100$. Qual o valor de $\\lim_{x \\to 2} f(x)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$7$",
                                isCorrect: true,
                            },
                            {
                                text: "$100$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Limites laterais",
                blocks: [
                    {
                        type: "text",
                        value: "## Aproximando por um lado só\n\nAté agora, deixamos $x$ se aproximar de $a$ pelos dois lados ao mesmo tempo. Mas o comportamento da função pode ser diferente dependendo do lado. Para tratar isso existem os **limites laterais**.\n\n- O **limite lateral à esquerda** considera apenas valores de $x$ menores que $a$ (chegando pela esquerda) e é escrito $\\lim_{x \\to a^-} f(x)$.\n- O **limite lateral à direita** considera apenas valores de $x$ maiores que $a$ (chegando pela direita) e é escrito $\\lim_{x \\to a^+} f(x)$.",
                    },
                    {
                        type: "text",
                        value: "## Relação com o limite\n\nVale a regra fundamental: o limite bilateral existe se, e somente se, os dois limites laterais existem e são iguais. Ou seja, precisamos de\n\n$$\\lim_{x \\to a^-} f(x) = \\lim_{x \\to a^+} f(x) = L.$$\n\nQuando isso acontece, escrevemos $\\lim_{x \\to a} f(x) = L$. Se os limites laterais forem diferentes, o limite **não existe** naquele ponto.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: os dois lados concordam\n\nConsidere a função definida por partes: $f(x) = x + 3$ para $x < 2$ e $f(x) = 2x + 1$ para $x \\ge 2$.\n\nPela esquerda usamos o ramo $x + 3$:\n\n$$\\lim_{x \\to 2^-} f(x) = 2 + 3 = 5.$$\n\nPela direita usamos o ramo $2x + 1$:\n\n$$\\lim_{x \\to 2^+} f(x) = 2 \\cdot 2 + 1 = 5.$$\n\nComo os dois lados dão $5$, o limite existe: $\\lim_{x \\to 2} f(x) = 5$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: um salto\n\nAgora seja $h(x) = x + 1$ para $x < 2$ e $h(x) = x^2$ para $x \\ge 2$.\n\nPela esquerda:\n\n$$\\lim_{x \\to 2^-} h(x) = 2 + 1 = 3.$$\n\nPela direita:\n\n$$\\lim_{x \\to 2^+} h(x) = 2^2 = 4.$$\n\nOs limites laterais são diferentes ($3 \\ne 4$), então $\\lim_{x \\to 2} h(x)$ **não existe**. Graficamente, há um salto no ponto $x = 2$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: a função sinal\n\nUm exemplo clássico é $s(x) = \\frac{|x|}{x}$, definida para $x \\ne 0$. Para $x > 0$ temos $|x| = x$, logo $s(x) = 1$. Para $x < 0$ temos $|x| = -x$, logo $s(x) = -1$.\n\nEntão o limite à direita vale $1$ e o limite à esquerda vale $-1$:\n\n$$\\lim_{x \\to 0^+} s(x) = 1 \\qquad \\lim_{x \\to 0^-} s(x) = -1.$$\n\nComo os valores são diferentes, $\\lim_{x \\to 0} s(x)$ não existe.",
                    },
                    {
                        type: "quote",
                        value: "Para o limite existir, os dois lados precisam contar a mesma história.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $\\lim_{x \\to a^-} f(x)$ olha a função vindo pela esquerda ($x < a$); $\\lim_{x \\to a^+} f(x)$, pela direita ($x > a$).\n- O limite bilateral existe apenas quando os dois limites laterais existem e são iguais.\n- Se os lados discordam, o limite não existe, o que costuma indicar um salto no gráfico.\n- Funções definidas por partes são o cenário natural para usar limites laterais.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Seja $f(x) = x + 4$ para $x < 1$ e $f(x) = 3x$ para $x \\ge 1$. Calcule $\\lim_{x \\to 1^-} f(x)$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
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
                            "Com $f(x) = x + 4$ para $x < 1$ e $f(x) = 3x$ para $x \\ge 1$, calcule $\\lim_{x \\to 1^+} f(x)$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
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
                            "Para $g(x) = x^2$ se $x < 2$ e $g(x) = x + 2$ se $x \\ge 2$, o que se pode afirmar sobre $\\lim_{x \\to 2} g(x)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Existe e vale $4$.",
                                isCorrect: true,
                            },
                            {
                                text: "Não existe, pois a função tem dois ramos.",
                                isCorrect: false,
                            },
                            {
                                text: "Existe e vale $2$.",
                                isCorrect: false,
                            },
                            {
                                text: "Não existe, pois os laterais diferem.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $f(x) = 2x$ para $x < 3$ e $f(x) = x + 5$ para $x \\ge 3$. Sobre $\\lim_{x \\to 3} f(x)$:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não existe, pois $6 \\ne 8$.",
                                isCorrect: true,
                            },
                            {
                                text: "Existe e vale $6$, o limite à esquerda.",
                                isCorrect: false,
                            },
                            {
                                text: "Existe e vale $8$, o limite à direita.",
                                isCorrect: false,
                            },
                            {
                                text: "Existe e vale $7$, a média dos laterais.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Considere $f(x) = \\frac{|x - 2|}{x - 2}$ para $x \\ne 2$. Qual o valor de $\\lim_{x \\to 2^-} f(x)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$-1$",
                                isCorrect: true,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "não existe",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Propriedades e cálculo de limites",
                blocks: [
                    {
                        type: "text",
                        value: "## As propriedades dos limites\n\nCalcular limites por tabelas é trabalhoso. Felizmente, existem propriedades que transformam esse cálculo em álgebra direta. Sejam $\\lim_{x \\to a} f(x) = L$ e $\\lim_{x \\to a} g(x) = M$, com $c$ constante. Então:\n\n- **Soma:** $\\lim_{x \\to a} [f(x) + g(x)] = L + M$.\n- **Diferença:** $\\lim_{x \\to a} [f(x) - g(x)] = L - M$.\n- **Constante:** $\\lim_{x \\to a} [c \\cdot f(x)] = c \\cdot L$.\n- **Produto:** $\\lim_{x \\to a} [f(x) \\cdot g(x)] = L \\cdot M$.\n- **Quociente:** $\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\frac{L}{M}$, desde que $M \\ne 0$.",
                    },
                    {
                        type: "text",
                        value: "## Potências, raízes e polinômios\n\nDuas consequências úteis:\n\n- **Potência:** $\\lim_{x \\to a} [f(x)]^n = L^n$.\n- **Raiz:** $\\lim_{x \\to a} \\sqrt{f(x)} = \\sqrt{L}$, quando a raiz faz sentido.\n\nA consequência mais prática de todas: para qualquer polinômio $p(x)$, vale\n\n$$\\lim_{x \\to a} p(x) = p(a).$$\n\nOu seja, para polinômios basta **substituir** $x$ por $a$. O mesmo funciona para funções racionais, desde que o denominador não se anule em $a$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: polinômio\n\nCalcule $\\lim_{x \\to 2} (x^2 + 3x - 1)$. Como é um polinômio, substituímos $x = 2$:\n\n$$\\lim_{x \\to 2} (x^2 + 3x - 1) = 2^2 + 3 \\cdot 2 - 1 = 4 + 6 - 1 = 9.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: função racional\n\nCalcule $\\lim_{x \\to 3} \\frac{x + 1}{x - 1}$. O denominador em $x = 3$ vale $3 - 1 = 2 \\ne 0$, então podemos substituir:\n\n$$\\lim_{x \\to 3} \\frac{x + 1}{x - 1} = \\frac{3 + 1}{3 - 1} = \\frac{4}{2} = 2.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: com raiz\n\nCalcule $\\lim_{x \\to 4} \\sqrt{x + 5}$. Primeiro achamos o limite de dentro da raiz e depois aplicamos a raiz:\n\n$$\\lim_{x \\to 4} \\sqrt{x + 5} = \\sqrt{4 + 5} = \\sqrt{9} = 3.$$\n\nRepare que combinamos a propriedade da soma (dentro da raiz) com a propriedade da raiz.",
                    },
                    {
                        type: "quote",
                        value: "Quando o denominador não zera, calcular limite é só substituir com cuidado.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Os limites respeitam soma, diferença, produto, quociente, potência e raiz.\n- Para polinômios, $\\lim_{x \\to a} p(x) = p(a)$: basta substituir.\n- Para funções racionais, a substituição funciona quando o denominador não se anula em $a$.\n- Se a substituição gera $\\frac{0}{0}$, as propriedades não bastam e precisamos de outras técnicas, tema da próxima aula.",
                    },
                ],
                questions: [
                    {
                        statement: "Calcule $\\lim_{x \\to 2} (x^2 + 1)$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$4$",
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
                        statement: "Calcule $\\lim_{x \\to 3} (2x - 1)$.",
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
                                text: "$7$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x \\to 2} \\frac{x + 4}{x + 1}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2$",
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
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x \\to 4} \\sqrt{2x + 1}$.",
                        difficulty: "medio",
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
                                text: "$\\sqrt{8}$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x \\to 1} \\frac{x^2 + 3}{\\sqrt{x + 3}}$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$8$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Indeterminação 0/0 e simplificação",
                blocks: [
                    {
                        type: "text",
                        value: "## O símbolo $\\frac{0}{0}$\n\nNa aula anterior, vimos que a substituição direta resolve muitos limites. Mas às vezes ela leva a\n\n$$\\frac{0}{0},$$\n\numa **indeterminação**. Esse símbolo não vale zero, nem um, nem infinito: ele apenas avisa que a substituição direta não decidiu o resultado. O limite pode existir e valer qualquer número, e precisamos investigar melhor.\n\nA indeterminação $\\frac{0}{0}$ costuma aparecer quando numerador e denominador têm um fator comum que se anula em $a$. A estratégia é justamente eliminar esse fator.",
                    },
                    {
                        type: "text",
                        value: "## A estratégia de fatorar e simplificar\n\nO plano de ataque é quase sempre o mesmo:\n\n1. Confirme que a substituição dá $\\frac{0}{0}$.\n2. Fatore o numerador e o denominador.\n3. Cancele o fator comum, aquele que causou o zero.\n4. Substitua de novo na expressão já simplificada.\n\nO cancelamento é legítimo porque, no limite, $x$ se aproxima de $a$ mas nunca é igual a $a$, então o fator que cancelamos nunca é de fato zero.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: diferença de quadrados\n\nCalcule $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$. Substituindo, obtemos $\\frac{4 - 4}{2 - 2} = \\frac{0}{0}$: indeterminação.\n\nFatoramos o numerador como diferença de quadrados: $x^2 - 4 = (x - 2)(x + 2)$. Então\n\n$$\\frac{x^2 - 4}{x - 2} = \\frac{(x - 2)(x + 2)}{x - 2} = x + 2.$$\n\nAgora substituímos: $\\lim_{x \\to 2} (x + 2) = 4$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: fatorando um trinômio\n\nCalcule $\\lim_{x \\to 3} \\frac{x^2 - 5x + 6}{x - 3}$. A substituição dá $\\frac{9 - 15 + 6}{0} = \\frac{0}{0}$.\n\nAs raízes de $x^2 - 5x + 6$ são $2$ e $3$, logo $x^2 - 5x + 6 = (x - 3)(x - 2)$. Assim\n\n$$\\frac{x^2 - 5x + 6}{x - 3} = \\frac{(x - 3)(x - 2)}{x - 3} = x - 2.$$\n\nPortanto $\\lim_{x \\to 3} (x - 2) = 1$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: racionalizando\n\nCalcule $\\lim_{x \\to 4} \\frac{\\sqrt{x} - 2}{x - 4}$. A substituição dá $\\frac{2 - 2}{4 - 4} = \\frac{0}{0}$.\n\nQuando aparece raiz, multiplicamos numerador e denominador pelo conjugado $\\sqrt{x} + 2$:\n\n$$\\frac{(\\sqrt{x} - 2)(\\sqrt{x} + 2)}{(x - 4)(\\sqrt{x} + 2)} = \\frac{x - 4}{(x - 4)(\\sqrt{x} + 2)} = \\frac{1}{\\sqrt{x} + 2}.$$\n\nUsamos que $(\\sqrt{x} - 2)(\\sqrt{x} + 2) = x - 4$. Agora substituímos: $\\lim_{x \\to 4} \\frac{1}{\\sqrt{x} + 2} = \\frac{1}{2 + 2} = \\frac{1}{4}$.",
                    },
                    {
                        type: "quote",
                        value: "A indeterminação não é um beco sem saída, é um convite para fatorar.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $\\frac{0}{0}$ é uma indeterminação: a substituição direta não decide o limite.\n- A técnica principal é fatorar numerador e denominador e cancelar o fator comum.\n- Havendo raízes, multiplicar pelo conjugado costuma revelar o fator que cancela.\n- Depois de simplificar, basta substituir na nova expressão.",
                    },
                ],
                questions: [
                    {
                        statement: "Calcule $\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$.",
                        difficulty: "facil",
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
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x \\to 1} \\frac{x^2 - 1}{x - 1}$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "não existe",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x \\to 2} \\frac{x^2 - 5x + 6}{x - 2}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-1$",
                                isCorrect: true,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$-5$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x \\to 5} \\frac{x^2 - 25}{x - 5}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$10$",
                                isCorrect: true,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$25$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x \\to 9} \\frac{\\sqrt{x} - 3}{x - 9}$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{1}{6}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O limite trigonométrico fundamental",
                blocks: [
                    {
                        type: "text",
                        value: "## O limite trigonométrico fundamental\n\nEntre todos os limites, um se destaca pela importância no Cálculo:\n\n$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1.$$\n\nÀ primeira vista ele parece uma indeterminação $\\frac{0}{0}$, já que $\\sin 0 = 0$ e o denominador também tende a zero. Mesmo assim, o quociente se aproxima de $1$. Esse resultado é a base para derivar as funções trigonométricas.",
                    },
                    {
                        type: "text",
                        value: "## Conferindo numericamente\n\nPodemos ganhar intuição observando valores de $\\frac{\\sin x}{x}$ com $x$ perto de zero (em radianos):\n\n| $x$ (rad) | 0,5 | 0,1 | 0,01 | -0,1 | -0,5 |\n| --- | --- | --- | --- | --- | --- |\n| $\\frac{\\sin x}{x}$ | 0,9589 | 0,9983 | 0,99998 | 0,9983 | 0,9589 |\n\nQuanto mais perto de zero, mais o quociente se aproxima de $1$, e isso vale pelos dois lados.",
                    },
                    {
                        type: "text",
                        value: "## Atenção: em radianos\n\nO limite $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$ só vale com $x$ medido em **radianos**. Se $x$ estivesse em graus, o resultado seria outro. Ao longo de todo o Cálculo, ângulos são sempre tratados em radianos, exatamente para que esse limite, e as derivadas que dependem dele, fiquem simples.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: ajustando o argumento\n\nCalcule $\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$. A ideia é fazer aparecer uma fração do tipo seno de um argumento dividido pelo mesmo argumento. Multiplicamos e dividimos por $3$:\n\n$$\\frac{\\sin(3x)}{x} = 3 \\cdot \\frac{\\sin(3x)}{3x}.$$\n\nQuando $x \\to 0$, também $3x \\to 0$, então $\\frac{\\sin(3x)}{3x} \\to 1$. Logo\n\n$$\\lim_{x \\to 0} \\frac{\\sin(3x)}{x} = 3 \\cdot 1 = 3.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: com tangente\n\nCalcule $\\lim_{x \\to 0} \\frac{\\tan x}{x}$. Lembrando que $\\tan x = \\frac{\\sin x}{\\cos x}$, escrevemos\n\n$$\\frac{\\tan x}{x} = \\frac{\\sin x}{x} \\cdot \\frac{1}{\\cos x}.$$\n\nQuando $x \\to 0$, temos $\\frac{\\sin x}{x} \\to 1$ e $\\cos x \\to 1$, portanto $\\frac{1}{\\cos x} \\to 1$. Assim\n\n$$\\lim_{x \\to 0} \\frac{\\tan x}{x} = 1 \\cdot 1 = 1.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: seno sobre seno\n\nCalcule $\\lim_{x \\to 0} \\frac{\\sin(2x)}{\\sin(5x)}$. Reescrevemos separando cada seno do seu próprio argumento:\n\n$$\\frac{\\sin(2x)}{\\sin(5x)} = \\frac{\\sin(2x)}{2x} \\cdot \\frac{5x}{\\sin(5x)} \\cdot \\frac{2x}{5x}.$$\n\nOs dois primeiros fatores tendem a $1$ (o segundo é o inverso de $\\frac{\\sin(5x)}{5x}$), e o último é a constante $\\frac{2}{5}$. Portanto\n\n$$\\lim_{x \\to 0} \\frac{\\sin(2x)}{\\sin(5x)} = 1 \\cdot 1 \\cdot \\frac{2}{5} = \\frac{2}{5}.$$",
                    },
                    {
                        type: "quote",
                        value: "Todo limite trigonométrico em zero é um disfarce do mesmo fato: seno de algo dividido por esse algo tende a um.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O limite fundamental é $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$, sempre com $x$ em radianos.\n- Para $\\frac{\\sin(kx)}{x}$, ajuste multiplicando e dividindo pela constante $k$: o limite dá $k$.\n- $\\frac{\\tan x}{x} \\to 1$, pois $\\cos x \\to 1$.\n- Em quocientes de senos, separe cada seno do seu argumento e junte as constantes.",
                    },
                ],
                questions: [
                    {
                        statement: "Calcule $\\lim_{x \\to 0} \\frac{\\sin x}{x}$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "não existe",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x \\to 0} \\frac{\\sin(5x)}{x}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{5}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x \\to 0} \\frac{\\sin(2x)}{3x}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{2}{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{3}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x \\to 0} \\frac{\\tan x}{x}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "não existe",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x \\to 0} \\frac{\\sin(3x)}{\\sin(4x)}$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{3}{4}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{4}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Limites no infinito, assíntotas e continuidade",
        aulas: [
            {
                titulo: "Limites no infinito",
                blocks: [
                    {
                        type: "text",
                        value: "## Limites no infinito\n\nAté aqui estudamos o comportamento de $f(x)$ quando $x$ se aproxima de um número fixo. Agora a pergunta muda: o que acontece com $f(x)$ quando $x$ cresce sem parar (escrevemos $x\\to+\\infty$) ou decresce sem parar ($x\\to-\\infty$)?\n\nQuando os valores de $f(x)$ ficam cada vez mais próximos de um número $L$ conforme $x$ cresce, dizemos que $\\lim_{x\\to+\\infty}f(x)=L$. A ideia é a mesma para $x\\to-\\infty$.",
                    },
                    {
                        type: "text",
                        value: "## O limite fundamental $1/x^n$\n\nO tijolo básico de quase todo limite no infinito é:\n\n$$\\lim_{x\\to+\\infty}\\frac{1}{x^n}=0 \\qquad\\text{e}\\qquad \\lim_{x\\to-\\infty}\\frac{1}{x^n}=0,\\quad n>0.$$\n\nIsso faz sentido intuitivo: dividir $1$ por um número gigante dá algo minúsculo, tão perto de zero quanto quisermos. Por exemplo, $\\lim_{x\\to+\\infty}\\frac{1}{x}=0$ e $\\lim_{x\\to+\\infty}\\frac{1}{x^2}=0$.",
                    },
                    {
                        type: "text",
                        value: "## Funções racionais: compare os graus\n\nPara um quociente de polinômios $\\frac{P(x)}{Q(x)}$ com $x\\to\\pm\\infty$, o resultado depende apenas dos termos de maior grau. Sejam $p$ o grau de $P$ e $q$ o grau de $Q$:\n\n- Se $p<q$, o limite é $0$.\n- Se $p=q$, o limite é a razão dos coeficientes líderes.\n- Se $p>q$, o limite é $+\\infty$ ou $-\\infty$, dependendo dos sinais.\n\nA técnica que justifica tudo isso é dividir o numerador e o denominador pela maior potência de $x$ que aparece.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: graus iguais\n\nCalcule $\\lim_{x\\to+\\infty}\\frac{3x^2+1}{x^2-5}$.\n\nDividimos numerador e denominador por $x^2$, a maior potência presente:\n\n$$\\frac{3x^2+1}{x^2-5}=\\frac{3+\\frac{1}{x^2}}{1-\\frac{5}{x^2}}.$$\n\nQuando $x\\to+\\infty$, tanto $\\frac{1}{x^2}$ quanto $\\frac{5}{x^2}$ tendem a $0$. Sobra:\n\n$$\\lim_{x\\to+\\infty}\\frac{3+\\frac{1}{x^2}}{1-\\frac{5}{x^2}}=\\frac{3+0}{1-0}=3.$$\n\nComo os graus são iguais, o valor $3$ é exatamente a razão dos coeficientes líderes $\\frac{3}{1}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: numerador de grau menor\n\nCalcule $\\lim_{x\\to+\\infty}\\frac{2x+1}{x^2+3}$.\n\nDividindo tudo por $x^2$:\n\n$$\\frac{2x+1}{x^2+3}=\\frac{\\frac{2}{x}+\\frac{1}{x^2}}{1+\\frac{3}{x^2}}\\longrightarrow\\frac{0+0}{1+0}=0.$$\n\nComo o grau do numerador, que é $1$, é menor que o grau do denominador, que é $2$, o limite é $0$, exatamente como a regra previa.",
                    },
                    {
                        type: "text",
                        value: "## Quando o limite é infinito\n\nSe o numerador tem grau maior, o quociente cresce sem parar. Por exemplo:\n\n$$\\lim_{x\\to+\\infty}\\frac{x^2+1}{x+1}=+\\infty,$$\n\npois dividindo por $x$ ficamos com $\\frac{x+\\frac{1}{x}}{1+\\frac{1}{x}}$, e o numerador cresce enquanto o denominador tende a $1$. Vale reforçar: escrever que um limite é $+\\infty$ não significa que ele exista como número, e sim que a função cresce ilimitadamente.",
                    },
                    {
                        type: "quote",
                        value: "No infinito, quem manda no comportamento de uma função racional é sempre o termo de maior grau.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $\\lim_{x\\to\\pm\\infty}\\frac{1}{x^n}=0$ para $n>0$ é a base de tudo.\n- Em $\\frac{P(x)}{Q(x)}$, compare os graus: menor no topo dá $0$; graus iguais dão a razão dos coeficientes líderes; maior no topo dá $\\pm\\infty$.\n- A ferramenta prática é dividir numerador e denominador pela maior potência de $x$.",
                    },
                ],
                questions: [
                    {
                        statement: "Calcule $\\lim_{x\\to+\\infty}\\frac{3x^2+1}{x^2-5}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$+\\infty$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x\\to+\\infty}\\frac{2x+1}{x^2+3}$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$+\\infty$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x\\to+\\infty}\\frac{5x^3-x}{2x^3+7}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{2}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{5}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$+\\infty$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x\\to+\\infty}\\frac{x^2+1}{x+1}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "$+\\infty$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\lim_{x\\to+\\infty}\\left(\\sqrt{x^2+x}-x\\right)$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$0$",
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
                            {
                                text: "$+\\infty$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Assíntotas horizontais e verticais",
                blocks: [
                    {
                        type: "text",
                        value: "## Assíntotas\n\nUma assíntota é uma reta da qual o gráfico de $f$ se aproxima cada vez mais, sem necessariamente tocá-la. Elas descrevem o comportamento da função longe da origem ou perto de pontos onde ela explode. Vamos tratar dos dois tipos mais comuns: as horizontais e as verticais.",
                    },
                    {
                        type: "text",
                        value: "## Assíntotas horizontais\n\nA reta $y=L$ é uma assíntota horizontal de $f$ quando\n\n$$\\lim_{x\\to+\\infty}f(x)=L \\qquad\\text{ou}\\qquad \\lim_{x\\to-\\infty}f(x)=L.$$\n\nOu seja, achar assíntota horizontal é exatamente calcular limites no infinito. Uma função pode ter até duas assíntotas horizontais diferentes, uma para cada lado.",
                    },
                    {
                        type: "text",
                        value: "## Assíntotas verticais\n\nA reta $x=a$ é uma assíntota vertical de $f$ quando pelo menos um dos limites laterais em $a$ é infinito:\n\n$$\\lim_{x\\to a^+}f(x)=\\pm\\infty \\qquad\\text{ou}\\qquad \\lim_{x\\to a^-}f(x)=\\pm\\infty.$$\n\nEm funções racionais, os candidatos a assíntota vertical são os pontos que anulam o denominador sem anular o numerador ao mesmo tempo.",
                    },
                    {
                        type: "text",
                        value: "## Receita para funções racionais\n\nDada $f(x)=\\frac{P(x)}{Q(x)}$ já simplificada:\n\n| Situação | O que procurar |\n| --- | --- |\n| Raízes de $Q$ com $P\\ne0$ ali | assíntota vertical |\n| Grau de $P$ menor que grau de $Q$ | assíntota horizontal $y=0$ |\n| Graus iguais | assíntota horizontal na razão dos coeficientes líderes |\n| Grau de $P$ maior | não há assíntota horizontal |\n\nRepare que a parte horizontal reaproveita exatamente as regras de limite no infinito.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: $f(x)=\\frac{1}{x-2}$\n\nO denominador zera em $x=2$, e ali o numerador vale $1\\ne0$. Perto de $x=2$ a fração explode, então $x=2$ é assíntota vertical.\n\nPara a horizontal, olhamos o infinito: $\\lim_{x\\to\\pm\\infty}\\frac{1}{x-2}=0$. Logo $y=0$ é assíntota horizontal. Esse é o gráfico clássico da hipérbole deslocada.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: $f(x)=\\frac{2x}{x-3}$\n\nO denominador zera em $x=3$, e ali o numerador vale $6\\ne0$, então $x=3$ é assíntota vertical.\n\nNo infinito, numerador e denominador têm o mesmo grau $1$, então o limite é a razão dos coeficientes líderes: $\\frac{2}{1}=2$. Portanto $y=2$ é assíntota horizontal.",
                    },
                    {
                        type: "text",
                        value: "## Cuidado com os cancelamentos\n\nNem toda raiz do denominador vira assíntota vertical. Considere $f(x)=\\frac{x-1}{x^2-1}$. Fatorando, $x^2-1=(x-1)(x+1)$, então\n\n$$f(x)=\\frac{x-1}{(x-1)(x+1)}=\\frac{1}{x+1},\\quad x\\ne1.$$\n\nEm $x=1$ o fator cancela: ali existe apenas um furo no gráfico, um ponto removido, e não uma assíntota. A assíntota vertical de verdade fica em $x=-1$. Por isso simplifique a fração antes de decidir.",
                    },
                    {
                        type: "quote",
                        value: "Assíntota vertical é onde a função explode; assíntota horizontal é para onde ela se acomoda no infinito.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Assíntota horizontal $y=L$ vem de $\\lim_{x\\to\\pm\\infty}f(x)=L$.\n- Assíntota vertical $x=a$ vem de um limite lateral infinito, tipicamente onde o denominador zera e o numerador não.\n- Sempre simplifique a fração antes: fatores que cancelam geram furos, não assíntotas.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a assíntota vertical de $f(x)=\\frac{1}{x-2}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x=2$",
                                isCorrect: true,
                            },
                            {
                                text: "$y=2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x=0$",
                                isCorrect: false,
                            },
                            {
                                text: "$y=0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a assíntota horizontal de $f(x)=\\frac{1}{x-2}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$y=1$",
                                isCorrect: false,
                            },
                            {
                                text: "$x=2$",
                                isCorrect: false,
                            },
                            {
                                text: "$y=2$",
                                isCorrect: false,
                            },
                            {
                                text: "$y=0$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a assíntota horizontal de $f(x)=\\frac{2x}{x-3}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$y=0$",
                                isCorrect: false,
                            },
                            {
                                text: "$y=3$",
                                isCorrect: false,
                            },
                            {
                                text: "$y=2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x=3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quais são as assíntotas verticais de $f(x)=\\frac{x}{x^2-9}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x=9$ e $x=-9$",
                                isCorrect: false,
                            },
                            {
                                text: "$x=3$ e $x=-3$",
                                isCorrect: true,
                            },
                            {
                                text: "apenas $x=3$",
                                isCorrect: false,
                            },
                            {
                                text: "$y=0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a assíntota vertical de $f(x)=\\frac{x-1}{x^2-1}$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$x=-1$",
                                isCorrect: true,
                            },
                            {
                                text: "$x=1$ e $x=-1$",
                                isCorrect: false,
                            },
                            {
                                text: "$x=1$",
                                isCorrect: false,
                            },
                            {
                                text: "$y=0$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Continuidade de funções",
                blocks: [
                    {
                        type: "text",
                        value: "## Continuidade: a ideia\n\nDe forma intuitiva, uma função é contínua quando dá para desenhar seu gráfico sem tirar o lápis do papel: não há saltos, buracos nem explosões. Para transformar essa imagem em algo preciso, usamos limites.",
                    },
                    {
                        type: "text",
                        value: "## Definição formal\n\nDizemos que $f$ é contínua em um ponto $a$ quando as três condições abaixo valem ao mesmo tempo:\n\n1. $f(a)$ está definida, ou seja, $a$ pertence ao domínio.\n2. $\\lim_{x\\to a}f(x)$ existe.\n3. $\\lim_{x\\to a}f(x)=f(a)$.\n\nA terceira condição é a que amarra tudo: o valor para onde a função tende tem que ser o valor que ela realmente assume. Se qualquer uma das três falhar, $f$ é descontínua em $a$.",
                    },
                    {
                        type: "text",
                        value: "## Continuidade em intervalos\n\nUma função é contínua em um intervalo quando é contínua em cada ponto dele. Nas extremidades de um intervalo fechado usamos limites laterais: em $a$ pedimos $\\lim_{x\\to a^+}f(x)=f(a)$ e em $b$ pedimos $\\lim_{x\\to b^-}f(x)=f(b)$. Uma função contínua em todo o seu domínio é chamada simplesmente de contínua.",
                    },
                    {
                        type: "text",
                        value: "## Quais funções são contínuas\n\nA boa notícia é que quase todas as funções elementares são contínuas onde estão definidas:\n\n- Polinômios são contínuos em todo $\\mathbb{R}$.\n- Funções racionais são contínuas em todo ponto onde o denominador não zera.\n- Raízes, exponenciais, logaritmos e as funções trigonométricas são contínuas em seus domínios.\n\nAlém disso, soma, diferença, produto, quociente com denominador não nulo e composição de funções contínuas resultam em funções contínuas. Isso permite concluir a continuidade de expressões complicadas sem calcular limite nenhum.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: função por partes\n\nSeja\n\n$$f(x)=\\begin{cases}x^2, & x\\le1,\\\\ 2x-1, & x>1.\\end{cases}$$\n\nVamos testar a continuidade em $x=1$. Temos $f(1)=1^2=1$. O limite pela esquerda usa o ramo $x^2$: $\\lim_{x\\to1^-}f(x)=1$. O limite pela direita usa $2x-1$: $\\lim_{x\\to1^+}f(x)=2(1)-1=1$. Como os dois limites laterais valem $1$ e coincidem com $f(1)=1$, a função é contínua em $x=1$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: descobrindo uma constante\n\nPara qual valor de $k$ a função\n\n$$g(x)=\\begin{cases}\\frac{x^2-9}{x-3}, & x\\ne3,\\\\ k, & x=3,\\end{cases}$$\n\né contínua em $x=3$? Para $x\\ne3$ podemos simplificar: $\\frac{x^2-9}{x-3}=\\frac{(x-3)(x+3)}{x-3}=x+3$. Assim $\\lim_{x\\to3}g(x)=3+3=6$. A continuidade exige $k=\\lim_{x\\to3}g(x)$, ou seja, $k=6$.",
                    },
                    {
                        type: "quote",
                        value: "Continuidade é a promessa de que o valor para onde a função aponta é exatamente o valor que ela entrega.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $f$ é contínua em $a$ quando $f(a)$ existe, $\\lim_{x\\to a}f(x)$ existe e os dois são iguais.\n- Polinômios, racionais, raízes, exponenciais, logaritmos e trigonométricas são contínuas em seus domínios.\n- Operações e composições de funções contínuas continuam contínuas, o que evita recalcular limites o tempo todo.",
                    },
                ],
                questions: [
                    {
                        statement: "Segundo a definição, $f$ é contínua em $a$ quando:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\lim_{x\\to a}f(x)=0$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(a)=0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lim_{x\\to a}f(x)=\\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lim_{x\\to a}f(x)=f(a)$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Em quais pontos um polinômio é contínuo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "em todo $\\mathbb{R}$",
                                isCorrect: true,
                            },
                            {
                                text: "apenas em $x=0$",
                                isCorrect: false,
                            },
                            {
                                text: "apenas onde $x>0$",
                                isCorrect: false,
                            },
                            {
                                text: "em nenhum ponto",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual valor de $f(3)$ torna $f(x)=\\frac{x^2-9}{x-3}$ contínua em $x=3$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: true,
                            },
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A função $f(x)=\\frac{x+1}{x^2-4}$ é contínua em todos os reais, exceto em:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x=-1$",
                                isCorrect: false,
                            },
                            {
                                text: "$x=2$ e $x=-2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x=4$ e $x=-4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x=1$ e $x=-1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $f(x)=\\frac{x^2-x-6}{x-3}$ para $x\\ne3$ e $f(3)=k$. Qual valor de $k$ torna $f$ contínua em $x=3$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$-2$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Tipos de descontinuidade",
                blocks: [
                    {
                        type: "text",
                        value: "## Classificando descontinuidades\n\nQuando uma função falha em ser contínua num ponto, essa falha tem um sabor. Existem três tipos principais de descontinuidade: removível, de salto e infinita. Saber classificá-las diz muito sobre o comportamento da função perto do ponto.",
                    },
                    {
                        type: "text",
                        value: "## Descontinuidade removível\n\nÉ o caso mais gentil. Acontece quando $\\lim_{x\\to a}f(x)$ existe e é um número finito, mas ou $f(a)$ não está definida, ou $f(a)$ é diferente desse limite. O nome vem do fato de que basta redefinir $f(a)$ como o valor do limite para consertar a continuidade.\n\nExemplo: $f(x)=\\frac{x^2-4}{x-2}$. Para $x\\ne2$ vale $f(x)=x+2$, então $\\lim_{x\\to2}f(x)=4$, mas $f(2)$ nem existe. Há um furo em $x=2$, e definir $f(2)=4$ remove a descontinuidade.",
                    },
                    {
                        type: "text",
                        value: "## Descontinuidade de salto\n\nAqui os dois limites laterais existem, mas são diferentes:\n\n$$\\lim_{x\\to a^-}f(x)\\ne\\lim_{x\\to a^+}f(x).$$\n\nO gráfico dá um pulo em $a$, e não há como remover isso redefinindo um único ponto. Exemplo clássico: $f(x)=\\frac{|x|}{x}$ em $x=0$. Pela esquerda o valor é $-1$, pela direita é $+1$. O salto tem tamanho $2$.",
                    },
                    {
                        type: "text",
                        value: "## Descontinuidade infinita\n\nOcorre quando pelo menos um limite lateral é $+\\infty$ ou $-\\infty$. Nesse ponto a função tem uma assíntota vertical. Exemplo: $f(x)=\\frac{1}{x-1}$ em $x=1$, onde $\\lim_{x\\to1^+}f(x)=+\\infty$ e $\\lim_{x\\to1^-}f(x)=-\\infty$. Esse tipo também é chamado de essencial, porque não existe valor que se possa atribuir ao ponto para restaurar a continuidade.",
                    },
                    {
                        type: "text",
                        value: "## Comparando os três tipos\n\n| Tipo | Limites laterais | Dá para remover? |\n| --- | --- | --- |\n| Removível | existem e são iguais e finitos | sim, redefinindo $f(a)$ |\n| Salto | existem, mas diferentes | não |\n| Infinita | pelo menos um é $\\pm\\infty$ | não |\n\nA pergunta guia é sempre a mesma: os limites laterais existem e são finitos? Se sim e apenas o valor no ponto está errado, é removível.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: qual é o tipo?\n\nConsidere\n\n$$f(x)=\\begin{cases}\\frac{x^2-1}{x-1}, & x\\ne1,\\\\ 5, & x=1.\\end{cases}$$\n\nPara $x\\ne1$, $\\frac{x^2-1}{x-1}=x+1$, então $\\lim_{x\\to1}f(x)=2$. O limite existe e é finito, mas $f(1)=5\\ne2$. Como o problema é só o valor no ponto, a descontinuidade é removível: bastaria redefinir $f(1)=2$. Note que ser removível não exige que $f(a)$ esteja errado de um jeito específico, exige apenas que o limite exista e seja finito.",
                    },
                    {
                        type: "quote",
                        value: "O que decide se uma descontinuidade é removível não é o buraco em si, mas se os limites laterais concordam num valor finito.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Removível: o limite existe e é finito, só o valor no ponto está ausente ou errado, e dá para consertar.\n- Salto: os limites laterais existem mas diferem, e o gráfico pula.\n- Infinita, também chamada essencial: algum limite lateral é $\\pm\\infty$ e há assíntota vertical.\n- Regra prática: olhe primeiro para os limites laterais.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Que tipo de descontinuidade $f(x)=\\frac{x^2-4}{x-2}$ apresenta em $x=2$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "de salto",
                                isCorrect: false,
                            },
                            {
                                text: "removível",
                                isCorrect: true,
                            },
                            {
                                text: "infinita",
                                isCorrect: false,
                            },
                            {
                                text: "não há descontinuidade",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Que tipo de descontinuidade $f(x)=\\frac{1}{x-3}$ apresenta em $x=3$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "removível",
                                isCorrect: false,
                            },
                            {
                                text: "de salto",
                                isCorrect: false,
                            },
                            {
                                text: "infinita",
                                isCorrect: true,
                            },
                            {
                                text: "contínua nesse ponto",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A função $f(x)=\\frac{|x|}{x}$ tem, em $x=0$, uma descontinuidade:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "de salto",
                                isCorrect: true,
                            },
                            {
                                text: "removível",
                                isCorrect: false,
                            },
                            {
                                text: "infinita",
                                isCorrect: false,
                            },
                            {
                                text: "inexistente",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Uma descontinuidade em $a$ é removível quando:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "os limites laterais são diferentes",
                                isCorrect: false,
                            },
                            {
                                text: "algum limite lateral é infinito",
                                isCorrect: false,
                            },
                            {
                                text: "$f$ é contínua em $a$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lim_{x\\to a}f(x)$ existe e é finito",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $f(x)=\\frac{x^2-1}{x-1}$ para $x\\ne1$ e $f(1)=5$. Em $x=1$, a descontinuidade é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "de salto",
                                isCorrect: false,
                            },
                            {
                                text: "removível",
                                isCorrect: true,
                            },
                            {
                                text: "infinita",
                                isCorrect: false,
                            },
                            {
                                text: "essencial",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O teorema do valor intermediário",
                blocks: [
                    {
                        type: "text",
                        value: "## O teorema do valor intermediário\n\nImagine uma função contínua num intervalo fechado $[a,b]$, saindo da altura $f(a)$ e chegando à altura $f(b)$. Como o gráfico não tem saltos nem buracos, ele precisa passar por toda altura entre $f(a)$ e $f(b)$ em algum momento. Essa ideia simples é o teorema do valor intermediário, ou TVI.",
                    },
                    {
                        type: "text",
                        value: "## O enunciado\n\nSe $f$ é contínua em $[a,b]$ e $N$ é um número qualquer entre $f(a)$ e $f(b)$, então existe pelo menos um $c$ em $(a,b)$ tal que\n\n$$f(c)=N.$$\n\nEm palavras: uma função contínua não pula nenhum valor intermediário. A continuidade é essencial. Sem ela, o gráfico pode saltar por cima do valor $N$ e o teorema falha.",
                    },
                    {
                        type: "text",
                        value: "## O caso das raízes, ou teorema de Bolzano\n\nO uso mais famoso do TVI é caçar raízes. Se $f$ é contínua em $[a,b]$ e $f(a)$ e $f(b)$ têm sinais opostos, então $N=0$ está entre eles, e o teorema garante um $c$ em $(a,b)$ com $f(c)=0$. Ou seja, sinais opostos nas pontas de um intervalo garantem uma raiz no meio. Esse é o coração do método da bisseção.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: existe raiz?\n\nMostre que $x^3+x-1=0$ tem uma solução em $(0,1)$. Seja $f(x)=x^3+x-1$, que é um polinômio, logo contínuo em $[0,1]$. Calculamos as pontas: $f(0)=-1$ e $f(1)=1$. Como $f(0)<0<f(1)$, o valor $0$ está entre $f(0)$ e $f(1)$. Pelo TVI, existe $c$ em $(0,1)$ com $f(c)=0$. A equação tem, portanto, ao menos uma raiz nesse intervalo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: uma equação transcendente\n\nSerá que $\\cos x = x$ tem solução? Defina $g(x)=\\cos x - x$, contínua em todo $\\mathbb{R}$. Nas pontas de $[0,\\frac{\\pi}{2}]$ temos $g(0)=\\cos 0-0=1>0$ e $g\\left(\\frac{\\pi}{2}\\right)=0-\\frac{\\pi}{2}<0$. Os sinais são opostos, então pelo TVI existe $c$ em $\\left(0,\\frac{\\pi}{2}\\right)$ com $g(c)=0$, isto é, $\\cos c = c$. A equação tem solução mesmo sem conseguirmos resolvê-la na mão.",
                    },
                    {
                        type: "text",
                        value: "## O que o TVI não promete\n\nDois cuidados importantes. Primeiro, o teorema garante que existe pelo menos um $c$, mas não diz quantos nem onde exatamente, pois pode haver vários. Segundo, ele não vale sem continuidade. A função $f(x)=\\frac{1}{x}$ satisfaz $f(-1)=-1$ e $f(1)=1$, mas nunca vale $0$; não há contradição, porque $f$ é descontínua em $x=0$ e portanto não é contínua em $[-1,1]$.",
                    },
                    {
                        type: "quote",
                        value: "O teorema do valor intermediário é uma máquina de provar que algo existe, mesmo quando não sabemos calcular onde.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- TVI: se $f$ é contínua em $[a,b]$ e $N$ está entre $f(a)$ e $f(b)$, existe $c$ em $(a,b)$ com $f(c)=N$.\n- Corolário de Bolzano: sinais opostos em $f(a)$ e $f(b)$ garantem uma raiz em $(a,b)$.\n- O teorema garante existência, não unicidade nem localização, e depende crucialmente da continuidade.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Para aplicar o teorema do valor intermediário em $[a,b]$, é essencial que $f$ seja:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "contínua em $[a,b]$",
                                isCorrect: true,
                            },
                            {
                                text: "derivável em $[a,b]$",
                                isCorrect: false,
                            },
                            {
                                text: "crescente em $[a,b]$",
                                isCorrect: false,
                            },
                            {
                                text: "um polinômio",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $f(x)=x^3+x-1$. Como $f(0)=-1$ e $f(1)=1$, o TVI garante em $(0,1)$:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "um ponto de máximo",
                                isCorrect: false,
                            },
                            {
                                text: "uma assíntota",
                                isCorrect: false,
                            },
                            {
                                text: "uma raiz de $f$",
                                isCorrect: true,
                            },
                            {
                                text: "uma descontinuidade",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f$ contínua, em qual caso o TVI garante uma raiz no intervalo $[1,4]$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$f(1)=3$ e $f(4)=2$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(1)=-3$ e $f(4)=2$",
                                isCorrect: true,
                            },
                            {
                                text: "$f(1)=-3$ e $f(4)=-2$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(1)=3$ e $f(4)=5$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $f$ é contínua em $[a,b]$ com $f(a)=-2$ e $f(b)=5$, o TVI garante um $c$ tal que:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$f(c)=7$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(c)=-3$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(c)=10$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(c)=0$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "A função $f(x)=\\frac{1}{x}$ tem $f(-1)=-1$ e $f(1)=1$, mas nunca vale $0$. Por que isso não contradiz o TVI?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "porque $f$ não é contínua em $[-1,1]$",
                                isCorrect: true,
                            },
                            {
                                text: "porque $0$ não está entre $-1$ e $1$",
                                isCorrect: false,
                            },
                            {
                                text: "porque $f$ é uma função ímpar",
                                isCorrect: false,
                            },
                            {
                                text: "porque o TVI vale só para polinômios",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - A derivada",
        aulas: [
            {
                titulo: "Taxa de variação e reta tangente",
                blocks: [
                    {
                        type: "text",
                        value: "## Taxa de variação: da média à instantânea\n\nMuitos fenômenos são descritos por **como uma quantidade muda em relação a outra**: a posição de um carro em relação ao tempo, o custo de produção em relação ao número de peças, a temperatura ao longo do dia. O cálculo nasce de uma pergunta simples: com que rapidez uma grandeza varia num dado instante?\n\nDada uma função $f$, a **taxa de variação média** de $f$ entre $x=a$ e $x=b$ é o quociente\n\n$$\\frac{\\Delta y}{\\Delta x} = \\frac{f(b)-f(a)}{b-a}.$$\n\nEsse número mede quanto $f$ variou, em média, por unidade de $x$ no intervalo $[a,b]$. Geometricamente, ele é a **inclinação da reta secante** que passa pelos pontos $(a, f(a))$ e $(b, f(b))$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: taxa média de $f(x)=x^2$\n\nVamos calcular a taxa de variação média de $f(x)=x^2$ no intervalo $[1,3]$.\n\nPrimeiro os valores nas extremidades: $f(1)=1$ e $f(3)=9$. Aplicando a definição,\n\n$$\\frac{f(3)-f(1)}{3-1} = \\frac{9-1}{3-1} = \\frac{8}{2} = 4.$$\n\nOu seja, entre $x=1$ e $x=3$ a função cresce, em média, $4$ unidades de $y$ para cada unidade de $x$. Esse é o coeficiente angular da reta secante que liga $(1,1)$ a $(3,9)$.",
                    },
                    {
                        type: "text",
                        value: "## Da secante à tangente\n\nA taxa média depende de um intervalo inteiro. Mas e se quisermos a taxa num único instante, digamos exatamente em $x=a$? A ideia central do cálculo é fixar o ponto $(a, f(a))$ e aproximar o segundo ponto cada vez mais dele.\n\nEscrevendo o segundo ponto como $(a+h,\\, f(a+h))$, a inclinação da reta secante é\n\n$$\\frac{f(a+h)-f(a)}{h}.$$\n\nÀ medida que $h$ fica pequeno, isto é, quando $h \\to 0$, o segundo ponto desliza em direção ao primeiro e as retas secantes se aproximam de uma posição-limite: a **reta tangente** ao gráfico em $(a, f(a))$. A inclinação dessa tangente é o limite das inclinações das secantes.",
                    },
                    {
                        type: "text",
                        value: "## A inclinação da reta tangente\n\nFormalizando, a **inclinação da reta tangente** ao gráfico de $f$ no ponto de abscissa $a$ é\n\n$$m = \\lim_{h \\to 0} \\frac{f(a+h)-f(a)}{h},$$\n\ndesde que esse limite exista. O ponto delicado é que, ao fazer $h \\to 0$, tanto o numerador quanto o denominador tendem a zero. Não podemos simplesmente substituir $h=0$, pois daria a indeterminação $\\frac{0}{0}$; é preciso simplificar a expressão antes de tomar o limite.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: reta tangente a $f(x)=x^2$ em $x=1$\n\nQueremos a inclinação da tangente ao gráfico de $f(x)=x^2$ no ponto $(1, 1)$. Aplicamos a definição com $a=1$:\n\n$$m = \\lim_{h \\to 0} \\frac{f(1+h)-f(1)}{h} = \\lim_{h \\to 0} \\frac{(1+h)^2 - 1}{h}.$$\n\nExpandindo o numerador, $(1+h)^2 - 1 = 1 + 2h + h^2 - 1 = 2h + h^2$. Logo\n\n$$m = \\lim_{h \\to 0} \\frac{2h + h^2}{h} = \\lim_{h \\to 0} \\frac{h(2 + h)}{h} = \\lim_{h \\to 0} (2 + h) = 2.$$\n\nRepare que a simplificação por $h$, válida porque $h \\neq 0$ no processo de limite, eliminou a indeterminação $\\frac{0}{0}$. A inclinação da tangente em $(1,1)$ é $m=2$.",
                    },
                    {
                        type: "text",
                        value: "## A equação da reta tangente\n\nCom a inclinação em mãos, a reta tangente sai da equação da reta na forma ponto-inclinação:\n\n$$y - f(a) = m\\,(x - a).$$\n\nNo exemplo anterior, $a=1$, $f(a)=1$ e $m=2$, então\n\n$$y - 1 = 2(x - 1) \\quad\\Longrightarrow\\quad y = 2x - 1.$$\n\nEssa reta encosta no gráfico de $f(x)=x^2$ em $(1,1)$ e tem ali exatamente a mesma inclinação da curva. É a melhor aproximação linear da função perto desse ponto.",
                    },
                    {
                        type: "quote",
                        value: "A reta tangente é a reta que melhor imita a curva bem de perto: no ponto de contato, curva e reta apontam para a mesma direção.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A **taxa de variação média** de $f$ em $[a,b]$ é $\\frac{f(b)-f(a)}{b-a}$ e equivale à inclinação da reta secante.\n- Fazendo o segundo ponto se aproximar do primeiro, com $h \\to 0$, a secante tende à **reta tangente**.\n- A **inclinação da tangente** em $x=a$ é $\\lim_{h \\to 0} \\frac{f(a+h)-f(a)}{h}$, quando o limite existe.\n- Para calcular esse limite, simplifique a expressão antes de fazer $h \\to 0$, eliminando a indeterminação $\\frac{0}{0}$.\n- A reta tangente em $(a, f(a))$ tem equação $y - f(a) = m\\,(x-a)$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a taxa de variação média de $f(x)=x^2$ no intervalo $[1,3]$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$4$",
                                isCorrect: true,
                            },
                            {
                                text: "$8$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
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
                            "A inclinação da reta tangente ao gráfico de $f$ no ponto de abscissa $a$ é dada por qual expressão?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\lim_{h \\to 0} \\frac{f(a+h)-f(a)}{h}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{f(a+h)-f(a)}{h}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lim_{h \\to 0} \\frac{f(a+h)+f(a)}{h}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{f(a)-f(a-h)}{h}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Usando o limite da definição, qual é a inclinação da reta tangente a $f(x)=x^2$ em $x=3$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$6$",
                                isCorrect: true,
                            },
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$12$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A reta tangente ao gráfico de $f(x)=x^2$ no ponto $(1,1)$ tem equação:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$y = 2x - 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$y = 2x + 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = 2x$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = x - 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Pela definição, qual é a inclinação da reta tangente a $f(x)=\\frac{1}{x}$ em $x=2$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$-\\frac{1}{4}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-1$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "A derivada pela definição",
                blocks: [
                    {
                        type: "text",
                        value: "## A derivada num ponto\n\nNo módulo anterior vimos que a inclinação da reta tangente ao gráfico de $f$ em $x=a$ é um limite. Esse número tem nome próprio: é a **derivada de $f$ em $a$**, escrita $f'(a)$. Por definição,\n\n$$f'(a) = \\lim_{h \\to 0} \\frac{f(a+h)-f(a)}{h},$$\n\nquando o limite existe. Nesse caso, dizemos que $f$ é **derivável** (ou diferenciável) em $a$.\n\nA derivada $f'(a)$ carrega, ao mesmo tempo, dois significados que exploraremos adiante: é a inclinação da tangente em $(a, f(a))$ e é a taxa de variação instantânea de $f$ em $x=a$.",
                    },
                    {
                        type: "text",
                        value: "## Uma forma equivalente\n\nTrocando $x = a + h$, de modo que $h = x - a$ e $h \\to 0$ equivale a $x \\to a$, a definição assume a forma equivalente\n\n$$f'(a) = \\lim_{x \\to a} \\frac{f(x)-f(a)}{x-a}.$$\n\nAs duas expressões dão o mesmo número; usamos a que for mais conveniente em cada conta. A primeira, com $h$, costuma ser mais prática para simplificar polinômios.",
                    },
                    {
                        type: "text",
                        value: "## Notações da derivada\n\nConvivem várias notações, todas com o mesmo significado. Se $y=f(x)$:\n\n- Lagrange: $f'(x)$ ou $y'$.\n- Leibniz: $\\frac{dy}{dx}$ ou $\\frac{df}{dx}$.\n- Operador: $D f(x)$.\n\nA notação de Leibniz $\\frac{dy}{dx}$ é sugestiva: lembra o quociente $\\frac{\\Delta y}{\\Delta x}$ do qual a derivada é o limite. Para a derivada avaliada num ponto $a$, escrevemos $f'(a)$ ou $\\left.\\frac{dy}{dx}\\right|_{x=a}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: derivada de $f(x)=x^2$\n\nVamos derivar $f(x)=x^2$ pela definição, agora num ponto genérico $x$:\n\n$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h} = \\lim_{h \\to 0} \\frac{(x+h)^2 - x^2}{h}.$$\n\nExpandindo, $(x+h)^2 - x^2 = x^2 + 2xh + h^2 - x^2 = 2xh + h^2$. Então\n\n$$f'(x) = \\lim_{h \\to 0} \\frac{2xh + h^2}{h} = \\lim_{h \\to 0} \\frac{h(2x + h)}{h} = \\lim_{h \\to 0} (2x + h) = 2x.$$\n\nLogo $f'(x) = 2x$. Em particular, $f'(1) = 2$ e $f'(3) = 6$, exatamente as inclinações que calculamos no módulo anterior.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: derivada de $f(x)=\\frac{1}{x}$\n\nAgora $f(x) = \\frac{1}{x}$, com $x \\neq 0$. Pela definição,\n\n$$f'(x) = \\lim_{h \\to 0} \\frac{\\frac{1}{x+h} - \\frac{1}{x}}{h}.$$\n\nSomando as frações do numerador: $\\frac{1}{x+h} - \\frac{1}{x} = \\frac{x - (x+h)}{x(x+h)} = \\frac{-h}{x(x+h)}$. Substituindo,\n\n$$f'(x) = \\lim_{h \\to 0} \\frac{1}{h} \\cdot \\frac{-h}{x(x+h)} = \\lim_{h \\to 0} \\frac{-1}{x(x+h)} = -\\frac{1}{x^2}.$$\n\nPortanto $f'(x) = -\\frac{1}{x^2}$. Note o sinal negativo: a função $\\frac{1}{x}$ é decrescente onde está definida, e a derivada negativa confirma isso.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: derivada de $f(x)=\\sqrt{x}$\n\nPara $f(x) = \\sqrt{x}$, com $x > 0$, aparece uma indeterminação que resolvemos multiplicando pelo conjugado:\n\n$$f'(x) = \\lim_{h \\to 0} \\frac{\\sqrt{x+h} - \\sqrt{x}}{h} \\cdot \\frac{\\sqrt{x+h} + \\sqrt{x}}{\\sqrt{x+h} + \\sqrt{x}}.$$\n\nNo numerador, $(\\sqrt{x+h} - \\sqrt{x})(\\sqrt{x+h} + \\sqrt{x}) = (x+h) - x = h$. Assim\n\n$$f'(x) = \\lim_{h \\to 0} \\frac{h}{h\\,(\\sqrt{x+h} + \\sqrt{x})} = \\lim_{h \\to 0} \\frac{1}{\\sqrt{x+h} + \\sqrt{x}} = \\frac{1}{2\\sqrt{x}}.$$\n\nOu seja, $f'(x) = \\frac{1}{2\\sqrt{x}}$.",
                    },
                    {
                        type: "quote",
                        value: "Derivar pela definição é sempre o mesmo roteiro: monte o quociente, simplifique até sumir a divisão por zero e só então faça o limite.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A **derivada de $f$ em $a$** é $f'(a) = \\lim_{h \\to 0} \\frac{f(a+h)-f(a)}{h}$, quando esse limite existe; nesse caso $f$ é **derivável** em $a$.\n- Forma equivalente: $f'(a) = \\lim_{x \\to a} \\frac{f(x)-f(a)}{x-a}$.\n- Notações usuais: $f'(x)$, $y'$, $\\frac{dy}{dx}$ e $D f(x)$.\n- Resultados obtidos pela definição: se $f(x)=x^2$ então $f'(x)=2x$; se $f(x)=\\frac{1}{x}$ então $f'(x)=-\\frac{1}{x^2}$; se $f(x)=\\sqrt{x}$ então $f'(x)=\\frac{1}{2\\sqrt{x}}$.\n- A estratégia é sempre eliminar a indeterminação $\\frac{0}{0}$, fatorando, somando frações ou usando o conjugado, antes de tomar o limite.",
                    },
                ],
                questions: [
                    {
                        statement: "Pela definição, a derivada $f'(x)$ é igual a qual limite?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\lim_{h \\to 0} \\frac{f(x+h)+f(x)}{h}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{f(x+h)-f(x)}{h}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a derivada da função constante $f(x)=7$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "$7$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{7}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Derivando $f(x)=x^2$ pela definição, obtém-se:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$f'(x)=2x$",
                                isCorrect: true,
                            },
                            {
                                text: "$f'(x)=2x+h$",
                                isCorrect: false,
                            },
                            {
                                text: "$f'(x)=x^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$f'(x)=2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a derivada da função afim $f(x)=mx+b$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$m$",
                                isCorrect: true,
                            },
                            {
                                text: "$b$",
                                isCorrect: false,
                            },
                            {
                                text: "$mx+b$",
                                isCorrect: false,
                            },
                            {
                                text: "$mx$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Pela definição, a derivada de $f(x)=\\sqrt{x}$, com $x>0$, é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{1}{2\\sqrt{x}}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{\\sqrt{x}}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}\\sqrt{x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\sqrt{x}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Derivabilidade e continuidade",
                blocks: [
                    {
                        type: "text",
                        value: "## O que significa ser derivável\n\nDizer que $f$ é **derivável em $a$** significa que o limite\n\n$$f'(a) = \\lim_{h \\to 0} \\frac{f(a+h)-f(a)}{h}$$\n\nexiste e é um número finito. Geometricamente, isso quer dizer que o gráfico tem uma reta tangente bem definida, e não vertical, no ponto $(a, f(a))$: a curva é lisa ali, sem quebras nem bicos.\n\nNeste módulo investigamos quando esse limite existe e qual a relação entre ser derivável e ser contínua.",
                    },
                    {
                        type: "text",
                        value: "## Derivável implica contínua\n\nVale o seguinte teorema: **se $f$ é derivável em $a$, então $f$ é contínua em $a$.**\n\nA justificativa é curta. Suponha que $f'(a)$ exista. Para $x \\neq a$, escrevemos\n\n$$f(x) - f(a) = \\frac{f(x)-f(a)}{x-a} \\cdot (x - a).$$\n\nTomando $x \\to a$, o primeiro fator tende a $f'(a)$ e o segundo tende a $0$. Logo\n\n$$\\lim_{x \\to a} \\big(f(x) - f(a)\\big) = f'(a) \\cdot 0 = 0,$$\n\nou seja, $\\lim_{x \\to a} f(x) = f(a)$. Isso é exatamente a definição de continuidade em $a$.",
                    },
                    {
                        type: "text",
                        value: "## A recíproca é falsa\n\nA implicação só vale num sentido. **Ser contínua não garante ser derivável.** Existem funções contínuas em todo ponto que, ainda assim, falham em ser deriváveis em alguns pontos.\n\nO contraexemplo clássico é $f(x) = |x|$ em $x = 0$: o gráfico é uma linha contínua, sem saltos, mas forma um bico na origem. Vamos ver por que o bico impede a derivada de existir.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: o bico de $f(x)=|x|$\n\nPara $f(x)=|x|$, testamos a derivada em $x=0$ pela definição:\n\n$$\\lim_{h \\to 0} \\frac{f(0+h)-f(0)}{h} = \\lim_{h \\to 0} \\frac{|h| - 0}{h} = \\lim_{h \\to 0} \\frac{|h|}{h}.$$\n\nEsse limite depende do lado. Pela direita, $h > 0$, então $|h| = h$ e o quociente vale $1$:\n\n$$\\lim_{h \\to 0^+} \\frac{|h|}{h} = 1.$$\n\nPela esquerda, $h < 0$, então $|h| = -h$ e o quociente vale $-1$:\n\n$$\\lim_{h \\to 0^-} \\frac{|h|}{h} = -1.$$\n\nComo os limites laterais são diferentes, pois $1 \\neq -1$, o limite não existe. Portanto $f(x)=|x|$ **não é derivável em $0$**, embora seja contínua ali. O bico corresponde a duas inclinações distintas se encontrando no ponto.",
                    },
                    {
                        type: "text",
                        value: "## Outra falha: tangente vertical\n\nUm bico não é o único jeito de a derivada não existir. Considere $f(x) = \\sqrt[3]{x}$ em $x = 0$. Essa função é contínua, mas\n\n$$\\lim_{h \\to 0} \\frac{\\sqrt[3]{h} - 0}{h} = \\lim_{h \\to 0} \\frac{1}{\\sqrt[3]{h^2}} = +\\infty.$$\n\nO limite é infinito, não um número finito. Geometricamente, a reta tangente ao gráfico em $0$ é **vertical**, e retas verticais não têm inclinação definida. Logo $f$ não é derivável em $0$, mais uma vez sendo contínua ali.",
                    },
                    {
                        type: "text",
                        value: "## Descontinuidade impede a derivada\n\nO teorema tem uma consequência prática, lida ao contrário, na forma contrapositiva: **se $f$ é descontínua em $a$, então $f$ não é derivável em $a$.**\n\nFaz sentido: se o gráfico dá um salto em $a$, nem tangente existe. Assim, sempre que uma função tem um salto, um buraco ou uma explosão em $a$, já podemos afirmar, sem calcular limite nenhum, que ela não é derivável nesse ponto.",
                    },
                    {
                        type: "quote",
                        value: "Toda função derivável é contínua, mas nem toda função contínua é derivável: a continuidade é necessária, porém não suficiente.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $f$ é **derivável em $a$** quando o limite que define $f'(a)$ existe e é finito.\n- **Teorema:** derivável em $a$ implica contínua em $a$.\n- A **recíproca é falsa**: há funções contínuas que não são deriváveis.\n- Três modos típicos de a derivada falhar: **bico** (limites laterais do quociente diferem, como $|x|$ em $0$), **tangente vertical** (o limite é infinito, como $\\sqrt[3]{x}$ em $0$) e **descontinuidade** (salto ou buraco).\n- Pela contrapositiva, descontínua em $a$ implica não derivável em $a$.",
                    },
                ],
                questions: [
                    {
                        statement: "A função $f(x)=|x|$ em $x=0$ é derivável?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Não, porque forma um bico em $x=0$",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, pois é contínua e sem salto em $x=0$",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, e vale $f'(0)=1$",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, e vale $f'(0)=0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $f$ é derivável em $x=a$, então nesse ponto $f$ é necessariamente:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "contínua",
                                isCorrect: true,
                            },
                            {
                                text: "constante",
                                isCorrect: false,
                            },
                            {
                                text: "descontínua",
                                isCorrect: false,
                            },
                            {
                                text: "crescente",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual afirmação sobre continuidade e derivabilidade é correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ser derivável em $a$ garante ser contínua em $a$",
                                isCorrect: true,
                            },
                            {
                                text: "Ser contínua em $a$ garante ser derivável em $a$",
                                isCorrect: false,
                            },
                            {
                                text: "Ser contínua em $a$ impede ser derivável em $a$",
                                isCorrect: false,
                            },
                            {
                                text: "Ser derivável em $a$ impede ser contínua em $a$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Se $f$ é descontínua em $x=a$, então em $x=a$ a função:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "não é derivável",
                                isCorrect: true,
                            },
                            {
                                text: "é derivável",
                                isCorrect: false,
                            },
                            {
                                text: "tem tangente horizontal",
                                isCorrect: false,
                            },
                            {
                                text: "tem derivada nula",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Sobre $f(x)=\\sqrt[3]{x}$ em $x=0$, é correto afirmar que:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "não é derivável, pois a tangente é vertical",
                                isCorrect: true,
                            },
                            {
                                text: "não é derivável, porque não é contínua em $0$",
                                isCorrect: false,
                            },
                            {
                                text: "é derivável, com $f'(0)=0$",
                                isCorrect: false,
                            },
                            {
                                text: "é derivável, com $f'(0)=1$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Interpretação da derivada",
                blocks: [
                    {
                        type: "text",
                        value: "## Dois significados da derivada\n\nO número $f'(a)$ pode ser lido de duas formas complementares, e saber transitar entre elas é o que torna a derivada tão útil.\n\n- **Interpretação geométrica:** $f'(a)$ é a inclinação da reta tangente ao gráfico de $f$ em $(a, f(a))$.\n- **Interpretação como taxa:** $f'(a)$ é a taxa de variação instantânea de $f$ em relação a $x$, no ponto $x=a$.\n\nA segunda leitura é a que dá sentido físico e prático à derivada. Ela responde: naquele instante exato, com que rapidez a grandeza está mudando?",
                    },
                    {
                        type: "text",
                        value: "## Posição, velocidade e aceleração\n\nO exemplo mais clássico vem do movimento. Seja $s(t)$ a posição de um objeto no instante $t$. A taxa de variação média da posição num intervalo é a velocidade média; a taxa instantânea é a **velocidade** naquele instante:\n\n$$v(t) = s'(t).$$\n\nDo mesmo modo, a taxa de variação instantânea da velocidade é a **aceleração**:\n\n$$a(t) = v'(t).$$\n\nOu seja, derivar a posição dá a velocidade, e derivar a velocidade dá a aceleração. Cada derivada mede a rapidez com que a grandeza anterior muda.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: velocidade a partir da posição\n\nSuponha que a posição de uma partícula seja $s(t) = t^2$, com $s$ em metros e $t$ em segundos. Qual a velocidade em $t = 3$ s?\n\nA velocidade é $v(t) = s'(t)$. Derivando pela definição,\n\n$$s'(t) = \\lim_{h \\to 0} \\frac{(t+h)^2 - t^2}{h} = \\lim_{h \\to 0} \\frac{2th + h^2}{h} = \\lim_{h \\to 0} (2t + h) = 2t.$$\n\nEntão $v(t) = 2t$ e, no instante pedido, $v(3) = 2 \\cdot 3 = 6$ m/s. Cuidado para não confundir: $s(3) = 9$ m é a **posição** em $t=3$, enquanto $v(3) = 6$ m/s é a **velocidade**. São grandezas diferentes, com unidades diferentes.",
                    },
                    {
                        type: "text",
                        value: "## O sinal da derivada\n\nO sinal de $f'$ conta como a função se comporta:\n\n- Se $f'(x) > 0$ num intervalo, a inclinação da tangente é positiva e $f$ é **crescente** ali.\n- Se $f'(x) < 0$, a tangente desce e $f$ é **decrescente**.\n- Se $f'(x) = 0$, a tangente é horizontal naquele ponto, um possível ponto de máximo, de mínimo ou apenas de passagem.\n\nAssim, além do valor, o próprio sinal da derivada já traz informação qualitativa sobre o gráfico.",
                    },
                    {
                        type: "text",
                        value: "## Unidades e interpretação marginal\n\nComo $f'(a)$ é uma taxa $\\frac{\\Delta y}{\\Delta x}$ no limite, sua unidade é unidade de $y$ por unidade de $x$. Se $s$ está em metros e $t$ em segundos, $s'(t)$ está em metros por segundo. Prestar atenção às unidades ajuda a interpretar o resultado.\n\nNa economia, essa leitura vira o conceito de **marginal**. Se $C(x)$ é o custo, em reais, para produzir $x$ unidades, então $C'(x)$ é o **custo marginal**: aproximadamente quanto custa produzir a próxima unidade. Por exemplo, $C'(200) = 8$ indica que, a partir de $200$ unidades, cada unidade adicional custa cerca de $8$ reais.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: lendo o sinal e o valor\n\nA temperatura de um forno é dada por $T(t)$, em graus Celsius, com $t$ em minutos. Suponha que num certo instante $T'(t_0) = -4$.\n\nComo a derivada é negativa, a temperatura está **caindo** nesse instante. O valor $4$ diz o ritmo: cerca de $4$ graus Celsius por minuto. Então, perto de $t_0$, esperamos que em um minuto a temperatura caia aproximadamente $4$ graus. Repare que $T'(t_0)$ não é a temperatura, o que seria $T(t_0)$, e sim a rapidez com que ela varia.",
                    },
                    {
                        type: "quote",
                        value: "A derivada responde a uma pergunta sobre ritmo: neste instante, a grandeza está subindo ou descendo, e com que rapidez?",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A derivada $f'(a)$ é ao mesmo tempo a **inclinação da tangente** e a **taxa de variação instantânea** de $f$ em $x=a$.\n- No movimento, $v(t) = s'(t)$ é a velocidade e $a(t) = v'(t)$ é a aceleração.\n- O **sinal** de $f'$ indica crescimento com $f'>0$, decrescimento com $f'<0$ ou tangente horizontal com $f'=0$.\n- A **unidade** de $f'$ é unidade de $y$ por unidade de $x$.\n- Em contextos aplicados, a derivada é a taxa **marginal**: $C'(x)$ estima o custo da próxima unidade.\n- Não confunda $f'(a)$, o ritmo da mudança, com $f(a)$, o valor da função.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Se $s(t)$ é a posição de um objeto no instante $t$, então $s'(t)$ representa:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "a velocidade instantânea",
                                isCorrect: true,
                            },
                            {
                                text: "a aceleração instantânea",
                                isCorrect: false,
                            },
                            {
                                text: "a posição média",
                                isCorrect: false,
                            },
                            {
                                text: "a distância total",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $f'(x)>0$ em todo um intervalo, então nesse intervalo $f$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "crescente",
                                isCorrect: true,
                            },
                            {
                                text: "decrescente",
                                isCorrect: false,
                            },
                            {
                                text: "constante",
                                isCorrect: false,
                            },
                            {
                                text: "descontínua",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A posição de uma partícula é $s(t)=t^2$, em metros e segundos. Qual a velocidade em $t=3$ s?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$6$ m/s",
                                isCorrect: true,
                            },
                            {
                                text: "$9$ m/s",
                                isCorrect: false,
                            },
                            {
                                text: "$3$ m/s",
                                isCorrect: false,
                            },
                            {
                                text: "$12$ m/s",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $C(x)$ é o custo em reais para produzir $x$ unidades e $C'(200)=8$, isso significa que:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "cada unidade a mais custa cerca de 8 reais",
                                isCorrect: true,
                            },
                            {
                                text: "o custo médio de cada unidade é de 8 reais",
                                isCorrect: false,
                            },
                            {
                                text: "produzir 200 unidades custa ao todo 8 reais",
                                isCorrect: false,
                            },
                            {
                                text: "produzir 8 unidades custa ao todo 200 reais",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A temperatura de um líquido é $T(t)$, em graus Celsius e $t$ em minutos. Se $T'(10)=-3$, então em $t=10$ a temperatura está:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "caindo a cerca de 3 graus por minuto",
                                isCorrect: true,
                            },
                            {
                                text: "subindo a cerca de 3 graus por minuto",
                                isCorrect: false,
                            },
                            {
                                text: "em um valor igual a $-3$ graus",
                                isCorrect: false,
                            },
                            {
                                text: "caindo 3 graus no total",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "A função derivada",
                blocks: [
                    {
                        type: "text",
                        value: "## De um ponto para uma função\n\nAté aqui calculamos a derivada em pontos específicos, $f'(a)$. Mas nada nos impede de deixar o ponto livre e pensar em $x$ como variável. Isso define uma **nova função**, a **função derivada** $f'$, dada por\n\n$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}.$$\n\nPara cada $x$ em que o limite existe, $f'(x)$ devolve a inclinação da tangente ali. Ou seja, $f'$ é a máquina que, a cada entrada $x$, entrega a taxa de variação instantânea de $f$ naquele ponto.",
                    },
                    {
                        type: "text",
                        value: "## O domínio da derivada\n\nO domínio de $f'$ é o conjunto dos pontos em que $f$ é derivável, que pode ser menor que o domínio de $f$. Por exemplo, $f(x)=|x|$ está definida em todos os reais, mas $f'$ só existe para $x \\neq 0$, já que há um bico na origem.\n\nDerivar é, portanto, uma operação que transforma uma função $f$ em outra função $f'$, possivelmente com domínio mais restrito.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: a derivada de $f(x)=x^2-3x$\n\nVamos obter a função derivada de $f(x) = x^2 - 3x$ pela definição. Montando o quociente:\n\n$$f'(x) = \\lim_{h \\to 0} \\frac{\\big[(x+h)^2 - 3(x+h)\\big] - \\big[x^2 - 3x\\big]}{h}.$$\n\nExpandindo o numerador, $(x^2 + 2xh + h^2 - 3x - 3h) - (x^2 - 3x) = 2xh + h^2 - 3h$. Logo\n\n$$f'(x) = \\lim_{h \\to 0} \\frac{2xh + h^2 - 3h}{h} = \\lim_{h \\to 0} (2x + h - 3) = 2x - 3.$$\n\nA função derivada é $f'(x) = 2x - 3$. Com ela, avaliamos a inclinação em qualquer ponto sem refazer o limite: $f'(0) = -3$, $f'(2) = 1$ e $f'\\left(\\frac{3}{2}\\right) = 0$.",
                    },
                    {
                        type: "text",
                        value: "## Ligando os gráficos de $f$ e $f'$\n\nA função derivada resume o comportamento de $f$:\n\n- Onde $f$ é **crescente**, temos $f'(x) > 0$, e o gráfico de $f'$ fica acima do eixo.\n- Onde $f$ é **decrescente**, temos $f'(x) < 0$, e o gráfico de $f'$ fica abaixo do eixo.\n- Onde $f$ tem **tangente horizontal**, temos $f'(x) = 0$, e o gráfico de $f'$ cruza o eixo.\n\nNo exemplo anterior, $f'(x) = 2x - 3$ é negativa para $x < \\frac{3}{2}$ e positiva para $x > \\frac{3}{2}$. Isso diz que $f(x) = x^2 - 3x$ decresce até $x = \\frac{3}{2}$ e cresce depois, com uma tangente horizontal exatamente em $x = \\frac{3}{2}$, o vértice da parábola.",
                    },
                    {
                        type: "text",
                        value: "## Derivadas de ordem superior\n\nComo $f'$ é uma função, podemos derivá-la de novo. A derivada de $f'$ é a **segunda derivada**, escrita $f''$ ou $\\frac{d^2 y}{dx^2}$:\n\n$$f''(x) = \\lim_{h \\to 0} \\frac{f'(x+h)-f'(x)}{h}.$$\n\nRepetindo o processo, chegamos à terceira derivada $f'''$, e assim por diante. No movimento essa ideia é familiar: derivando a posição obtemos a velocidade $s'$, e derivando de novo obtemos a aceleração $s''$. A segunda derivada mede a taxa de variação da própria taxa.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: a segunda derivada\n\nContinuando com $f(x) = x^2 - 3x$, já sabemos que $f'(x) = 2x - 3$. Vamos derivar mais uma vez, pela definição:\n\n$$f''(x) = \\lim_{h \\to 0} \\frac{\\big[2(x+h) - 3\\big] - \\big[2x - 3\\big]}{h} = \\lim_{h \\to 0} \\frac{2h}{h} = 2.$$\n\nEntão $f''(x) = 2$, constante e positiva. O sinal positivo da segunda derivada está de acordo com o formato da parábola $f(x)=x^2-3x$, que tem concavidade voltada para cima.",
                    },
                    {
                        type: "quote",
                        value: "Derivar não devolve apenas um número: devolve uma nova função, que pode ser derivada outra vez, e outra, revelando camadas do comportamento original.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A **função derivada** é $f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}$; ela associa a cada $x$ a inclinação da tangente de $f$ ali.\n- O **domínio** de $f'$ é o conjunto dos pontos onde $f$ é derivável, podendo ser menor que o de $f$.\n- Pela definição, se $f(x)=x^2-3x$ então $f'(x)=2x-3$.\n- O **sinal** de $f'$ diz onde $f$ cresce, com $f'>0$, decresce, com $f'<0$, ou tem tangente horizontal, com $f'=0$.\n- Derivando $f'$ obtemos a **segunda derivada** $f''$, e assim por diante; no exemplo, $f''(x)=2$.",
                    },
                ],
                questions: [
                    {
                        statement: "A função derivada $f'$ tem como domínio:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "os pontos em que $f$ é derivável",
                                isCorrect: true,
                            },
                            {
                                text: "todos os pontos do domínio de $f$",
                                isCorrect: false,
                            },
                            {
                                text: "os pontos em que $f$ se anula",
                                isCorrect: false,
                            },
                            {
                                text: "os pontos em que $f$ é descontínua",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Se $f(x)=x^2-3x$, então $f'(x)=2x-3$. Quanto vale $f'(0)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$-3$",
                                isCorrect: true,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$-6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Dada a derivada $f'(x)=2x-3$, em que ponto o gráfico de $f$ tem tangente horizontal?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x=\\frac{3}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$x=0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x=3$",
                                isCorrect: false,
                            },
                            {
                                text: "$x=-\\frac{3}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Num intervalo em que $f$ é decrescente, a função derivada $f'$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "negativa",
                                isCorrect: true,
                            },
                            {
                                text: "positiva",
                                isCorrect: false,
                            },
                            {
                                text: "nula",
                                isCorrect: false,
                            },
                            {
                                text: "crescente",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Se $f(x)=x^2-3x$, qual é a segunda derivada $f''(x)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$2x-3$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$2x$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Regras de derivação",
        aulas: [
            {
                titulo: "Regras básicas e regra da potência",
                blocks: [
                    {
                        type: "text",
                        value: "# Regras básicas e regra da potência\n\nCalcular derivadas pela definição, usando limites, funciona, mas é lento e repetitivo. Felizmente existem **regras de derivação** que transformam esse processo em algo quase mecânico. Neste módulo você vai montar um repertório de regras que cobre praticamente todas as funções elementares.\n\nComeçamos pelas regras mais básicas e pela poderosa **regra da potência**, que sozinha já deriva qualquer polinômio.",
                    },
                    {
                        type: "text",
                        value: "## Derivada de uma constante\n\nSe $f(x) = c$ é constante, seu gráfico é uma reta horizontal e a taxa de variação é nula em todo ponto:\n\n$$\\frac{d}{dx}(c) = 0$$\n\nPor exemplo, $\\frac{d}{dx}(5) = 0$ e $\\frac{d}{dx}(-\\sqrt{2}) = 0$.\n\nA derivada da função identidade também é imediata:\n\n$$\\frac{d}{dx}(x) = 1$$",
                    },
                    {
                        type: "text",
                        value: "## Regra da potência\n\nEsta é a regra mais usada de todo o cálculo. Para qualquer expoente real $n$:\n\n$$\\frac{d}{dx}\\left(x^n\\right) = n\\,x^{n-1}$$\n\nEm palavras: o expoente desce multiplicando e, no novo expoente, você subtrai $1$.\n\nA regra vale para expoentes inteiros, negativos e fracionários. Isso permite derivar raízes e frações reescrevendo-as como potências:\n\n$$\\sqrt{x} = x^{1/2}, \\qquad \\frac{1}{x^3} = x^{-3}$$",
                    },
                    {
                        type: "text",
                        value: "## Múltiplo constante, soma e diferença\n\nDuas propriedades tornam a regra da potência ainda mais útil. Se $c$ é constante e $f$, $g$ são deriváveis, então a constante sai para fora da derivada:\n\n$$\\frac{d}{dx}\\left(c\\,f\\right) = c\\,f'$$\n\nE a derivada de uma soma ou diferença é a soma ou diferença das derivadas:\n\n$$\\frac{d}{dx}\\left(f \\pm g\\right) = f' \\pm g'$$\n\nJuntas, elas dizem que a derivada é **linear**: pode-se derivar termo a termo mantendo os coeficientes. É exatamente o que se faz para derivar um polinômio.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: derivando um polinômio\n\nVamos derivar $f(x) = 3x^4 - 2x^2 + 7x - 1$.\n\nAplicamos a regra da potência em cada termo e usamos a linearidade:\n\n- $\\frac{d}{dx}(3x^4) = 3 \\cdot 4x^3 = 12x^3$\n- $\\frac{d}{dx}(-2x^2) = -2 \\cdot 2x = -4x$\n- $\\frac{d}{dx}(7x) = 7$\n- $\\frac{d}{dx}(-1) = 0$\n\nSomando os resultados:\n\n$$f'(x) = 12x^3 - 4x + 7$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: raízes e frações\n\nDerive $g(x) = \\sqrt{x} + \\frac{1}{x}$.\n\nReescrevemos cada parcela como potência antes de derivar:\n\n$$g(x) = x^{1/2} + x^{-1}$$\n\nAgora a regra da potência resolve tudo:\n\n$$g'(x) = \\frac{1}{2}x^{-1/2} + (-1)x^{-2} = \\frac{1}{2\\sqrt{x}} - \\frac{1}{x^2}$$\n\nO passo decisivo foi transformar raiz e fração em potências. Guarde esse hábito, ele será útil o módulo inteiro.",
                    },
                    {
                        type: "quote",
                        value: "Antes de decorar fórmulas, lembre que a derivada mede a taxa de variação instantânea de uma função.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n| Função | Derivada |\n|---|---|\n| $c$ (constante) | $0$ |\n| $x$ | $1$ |\n| $x^n$ | $n\\,x^{n-1}$ |\n| $c\\,f(x)$ | $c\\,f'(x)$ |\n| $f(x) \\pm g(x)$ | $f'(x) \\pm g'(x)$ |\n\nCom essas cinco linhas você já deriva qualquer polinômio e qualquer soma de potências, inclusive raízes e frações reescritas como $x^n$.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a derivada de $x^5$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$5x^5$",
                                isCorrect: false,
                            },
                            {
                                text: "$5x^4$",
                                isCorrect: true,
                            },
                            {
                                text: "$x^4$",
                                isCorrect: false,
                            },
                            {
                                text: "$4x^4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Se $f(x) = 7$, quanto vale $f'(x)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "$7$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$7x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Derive $f(x) = 3x^4 - 2x^2 + 7x - 1$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$12x^4 - 4x^2 + 7$",
                                isCorrect: false,
                            },
                            {
                                text: "$3x^3 - 2x + 7$",
                                isCorrect: false,
                            },
                            {
                                text: "$12x^3 - 4x + 7$",
                                isCorrect: true,
                            },
                            {
                                text: "$12x^3 - 4x + 6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a derivada de $\\frac{1}{x}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-\\frac{1}{x^2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{x^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{1}{x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{1}{2x^2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Derive $f(x) = \\sqrt[3]{x^2}$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{2}{3}\\sqrt[3]{x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{2}{3\\sqrt[3]{x^2}}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{3}{2\\sqrt[3]{x}}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{2}{3\\sqrt[3]{x}}$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Regra do produto e do quociente",
                blocks: [
                    {
                        type: "text",
                        value: "# Regra do produto e do quociente\n\nA linearidade da derivada é tão natural que gera uma expectativa falsa: muita gente imagina que a derivada de um produto seja o produto das derivadas. **Isso é falso.** Um contraexemplo rápido: se $f(x) = x$ e $g(x) = x$, então $f'g' = 1 \\cdot 1 = 1$, mas $(x \\cdot x)' = (x^2)' = 2x$. Os resultados não batem.\n\nPara produtos e quocientes existem regras próprias, e elas são o assunto desta aula.",
                    },
                    {
                        type: "text",
                        value: "## Regra do produto\n\nSe $f$ e $g$ são deriváveis, então:\n\n$$\\left(f\\,g\\right)' = f'\\,g + f\\,g'$$\n\nA leitura é: 'derivada do primeiro vezes o segundo, mais o primeiro vezes a derivada do segundo'. A ordem das parcelas não importa, já que a soma é comutativa, mas manter um padrão ajuda a não esquecer nenhum termo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: produto de dois fatores\n\nDerive $h(x) = (2x + 3)(x^2 - 5)$.\n\nIdentificamos os fatores e suas derivadas:\n\n$$f = 2x + 3, \\quad f' = 2, \\qquad g = x^2 - 5, \\quad g' = 2x$$\n\nAplicando a regra do produto:\n\n$$h'(x) = f'g + fg' = 2(x^2 - 5) + (2x + 3)(2x)$$\n\nExpandindo e somando:\n\n$$h'(x) = 2x^2 - 10 + 4x^2 + 6x = 6x^2 + 6x - 10$$\n\nVocê pode conferir expandindo antes de derivar: $h(x) = 2x^3 + 3x^2 - 10x - 15$, cuja derivada é $6x^2 + 6x - 10$. Os dois caminhos concordam.",
                    },
                    {
                        type: "text",
                        value: "## Regra do quociente\n\nPara o quociente de duas funções, com $g(x) \\neq 0$:\n\n$$\\left(\\frac{f}{g}\\right)' = \\frac{f'\\,g - f\\,g'}{g^2}$$\n\nAqui a ordem importa muito, porque há uma subtração no numerador. A regra começa pela derivada do numerador vezes o denominador, e só depois subtrai o numerador vezes a derivada do denominador. Trocar essa ordem inverte o sinal do resultado.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: um quociente\n\nDerive $q(x) = \\frac{x}{x^2 + 1}$.\n\nTemos $f = x$, $f' = 1$, $g = x^2 + 1$ e $g' = 2x$. Pela regra do quociente:\n\n$$q'(x) = \\frac{f'g - fg'}{g^2} = \\frac{1 \\cdot (x^2 + 1) - x \\cdot 2x}{(x^2 + 1)^2}$$\n\nSimplificando o numerador:\n\n$$q'(x) = \\frac{x^2 + 1 - 2x^2}{(x^2 + 1)^2} = \\frac{1 - x^2}{(x^2 + 1)^2}$$\n\nRepare que o denominador aparece **ao quadrado** no resultado, um detalhe que costuma ser esquecido.",
                    },
                    {
                        type: "text",
                        value: "## Uma observação útil\n\nAs duas regras se combinam com todas as outras. Assim que conhecermos as derivadas de seno, cosseno, exponencial e logaritmo, produtos como $x^2 \\sin x$ ou $x\\,e^x$ serão derivados com a mesma regra do produto, sem nenhuma novidade. Por exemplo, sabendo que $(\\sin x)' = \\cos x$:\n\n$$\\left(x^2 \\sin x\\right)' = 2x\\,\\sin x + x^2 \\cos x$$\n\nO importante agora é fixar a mecânica das duas regras.",
                    },
                    {
                        type: "quote",
                        value: "A derivada de um produto quase nunca é o produto das derivadas, e essa é a armadilha mais comum de todo o cálculo.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n| Regra | Fórmula |\n|---|---|\n| Produto | $(fg)' = f'g + fg'$ |\n| Quociente | $\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}$ |\n\nCuidados que evitam a maioria dos erros: no produto, não esqueça o segundo termo; no quociente, respeite a ordem da subtração e eleve o denominador ao quadrado.",
                    },
                ],
                questions: [
                    {
                        statement: "Pela regra do produto, $\\left(f\\,g\\right)'$ é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$f'g + fg'$",
                                isCorrect: true,
                            },
                            {
                                text: "$f'g'$",
                                isCorrect: false,
                            },
                            {
                                text: "$f'g - fg'$",
                                isCorrect: false,
                            },
                            {
                                text: "$fg' - f'g$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Pela regra do quociente, $\\left(\\frac{f}{g}\\right)'$ é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{fg' - f'g}{g^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{f'g - fg'}{g^2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{f'g + fg'}{g^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{f'g - fg'}{g}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Derive $h(x) = (2x + 3)(x^2 - 5)$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$4x$",
                                isCorrect: false,
                            },
                            {
                                text: "$2x^2 - 10$",
                                isCorrect: false,
                            },
                            {
                                text: "$6x^2 + 6x + 10$",
                                isCorrect: false,
                            },
                            {
                                text: "$6x^2 + 6x - 10$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Derive $q(x) = \\frac{x}{x^2 + 1}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1 - x^2}{(x^2 + 1)^2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{x^2 - 1}{(x^2 + 1)^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1 + x^2}{(x^2 + 1)^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1 - x^2}{x^2 + 1}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Derive $q(x) = \\frac{2x - 1}{3x + 2}$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{-7}{(3x + 2)^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{7}{3x + 2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{7}{(3x + 2)^2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{2}{3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Regra da cadeia",
                blocks: [
                    {
                        type: "text",
                        value: "# Regra da cadeia\n\nAté agora derivamos somas, produtos e quocientes. Falta a operação mais frequente de todas: a **composição** de funções. Expressões como $(3x + 1)^4$, $\\sqrt{x^2 + 1}$ ou $\\sin(2x)$ são funções dentro de funções, e derivá-las exige a regra da cadeia.",
                    },
                    {
                        type: "text",
                        value: "## O enunciado\n\nSe $y = f(g(x))$ é a composição de duas funções deriváveis, então:\n\n$$\\frac{d}{dx}\\,f\\left(g(x)\\right) = f'\\left(g(x)\\right) \\cdot g'(x)$$\n\nNa notação de Leibniz, escrevendo $y = f(u)$ com $u = g(x)$, a regra fica ainda mais sugestiva:\n\n$$\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$$\n\nÉ como se as derivadas se multiplicassem ao longo da cadeia de dependências, daí o nome.",
                    },
                    {
                        type: "text",
                        value: "## De fora para dentro\n\nUma forma prática de aplicar a regra:\n\n1. Identifique a função de fora e a de dentro.\n2. Derive a de fora, mantendo a de dentro intacta.\n3. Multiplique pela derivada da de dentro.\n\nEm $(3x + 1)^4$, a função de fora é 'elevar à quarta' e a de dentro é $3x + 1$. O erro mais comum é parar no passo 2 e esquecer de multiplicar por $g'(x)$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: uma potência composta\n\nDerive $y = (3x + 1)^4$.\n\nA de fora é $u^4$, cuja derivada é $4u^3$. A de dentro é $u = 3x + 1$, com $u' = 3$. Então:\n\n$$y' = 4(3x + 1)^3 \\cdot 3 = 12(3x + 1)^3$$\n\nSem o fator $3$ vindo da derivada interna, o resultado estaria errado.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: uma raiz\n\nDerive $y = \\sqrt{x^2 + 1}$.\n\nReescrevemos como potência: $y = (x^2 + 1)^{1/2}$. A de fora é $u^{1/2}$, com derivada $\\frac{1}{2}u^{-1/2}$; a de dentro é $u = x^2 + 1$, com $u' = 2x$. Logo:\n\n$$y' = \\frac{1}{2}(x^2 + 1)^{-1/2} \\cdot 2x = \\frac{2x}{2\\sqrt{x^2 + 1}} = \\frac{x}{\\sqrt{x^2 + 1}}$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: cadeia com mais de um elo\n\nA regra se aplica em cascata. Para $y = (x^2 - 4x + 1)^3$, a de fora é $u^3$ e a de dentro é $u = x^2 - 4x + 1$, com $u' = 2x - 4$:\n\n$$y' = 3(x^2 - 4x + 1)^2 \\cdot (2x - 4)$$\n\nQuando há três ou mais funções encaixadas, basta continuar multiplicando as derivadas de cada elo, sempre de fora para dentro.",
                    },
                    {
                        type: "quote",
                        value: "Toda função composta guarda uma cadeia de variações, e derivar é percorrer essa cadeia elo por elo.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nA regra da cadeia é a ponte que liga todas as outras:\n\n$$\\left[f(g(x))\\right]' = f'(g(x)) \\cdot g'(x)$$\n\nLembre-se sempre de multiplicar pela derivada interna $g'(x)$. Esquecer esse fator é, de longe, o erro mais frequente com composições, e ele reaparece em exponenciais, logaritmos e funções trigonométricas.",
                    },
                ],
                questions: [
                    {
                        statement: "Derive $y = (3x + 1)^4$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$4(3x + 1)^3$",
                                isCorrect: false,
                            },
                            {
                                text: "$4(3x + 1)^4$",
                                isCorrect: false,
                            },
                            {
                                text: "$12(3x + 1)^3$",
                                isCorrect: true,
                            },
                            {
                                text: "$12(3x + 1)^4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Derive $y = (x^2 + 1)^5$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$10x(x^2 + 1)^4$",
                                isCorrect: true,
                            },
                            {
                                text: "$5(x^2 + 1)^4$",
                                isCorrect: false,
                            },
                            {
                                text: "$5x(x^2 + 1)^4$",
                                isCorrect: false,
                            },
                            {
                                text: "$10x(x^2 + 1)^5$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Derive $y = \\sqrt{x^2 + 1}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{2\\sqrt{x^2 + 1}}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{x}{\\sqrt{x^2 + 1}}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{2x}{\\sqrt{x^2 + 1}}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{x}{2\\sqrt{x^2 + 1}}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Derive $y = \\frac{1}{(2x + 1)^2}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{-2}{(2x + 1)^3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{4}{(2x + 1)^3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{-4}{(2x + 1)^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{-4}{(2x + 1)^3}$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Derive $y = (x^2 - 4x + 1)^3$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$3(2x - 4)(x^2 - 4x + 1)^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$3(x^2 - 4x + 1)^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2x - 4)(x^2 - 4x + 1)^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$3(2x - 4)(x^2 - 4x + 1)^3$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Derivadas de exponencial e logaritmo",
                blocks: [
                    {
                        type: "text",
                        value: "# Derivadas de exponencial e logaritmo\n\nEntre todas as funções, a exponencial natural $e^x$ tem uma propriedade única e quase mágica: ela é igual à própria derivada. Essa característica faz de $e^x$ a base natural do cálculo e explica por que o número $e$ aparece em tantos fenômenos de crescimento e decaimento.",
                    },
                    {
                        type: "text",
                        value: "## Derivada da exponencial\n\nPara a base natural:\n\n$$\\frac{d}{dx}\\,e^x = e^x$$\n\nA taxa de variação de $e^x$ em cada ponto é igual ao próprio valor da função. Para uma base $a > 0$ qualquer, aparece um fator de correção:\n\n$$\\frac{d}{dx}\\,a^x = a^x \\ln a$$\n\nQuando $a = e$, temos $\\ln e = 1$ e a fórmula geral se reduz ao caso $e^x$.",
                    },
                    {
                        type: "text",
                        value: "## Derivada do logaritmo\n\nO logaritmo natural tem uma derivada notavelmente simples:\n\n$$\\frac{d}{dx}\\,\\ln x = \\frac{1}{x}, \\qquad x > 0$$\n\nPara um logaritmo de base $a$:\n\n$$\\frac{d}{dx}\\,\\log_a x = \\frac{1}{x \\ln a}$$\n\nDe novo, a base natural é o caso mais limpo, porque $\\ln e = 1$.",
                    },
                    {
                        type: "text",
                        value: "## Combinando com a regra da cadeia\n\nNa prática, o argumento raramente é apenas $x$. Compondo com a regra da cadeia:\n\n$$\\frac{d}{dx}\\,e^{g(x)} = e^{g(x)} \\cdot g'(x)$$\n\n$$\\frac{d}{dx}\\,\\ln g(x) = \\frac{g'(x)}{g(x)}$$\n\nA fórmula do logaritmo composto é fácil de lembrar: derivada do de dentro sobre o de dentro.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: exponenciais compostas\n\nDerive $y = e^{3x}$ e $z = e^{x^2}$.\n\nNo primeiro, a função interna é $3x$, com derivada $3$:\n\n$$y' = e^{3x} \\cdot 3 = 3e^{3x}$$\n\nNo segundo, a interna é $x^2$, com derivada $2x$:\n\n$$z' = e^{x^2} \\cdot 2x = 2x\\,e^{x^2}$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: logaritmo composto\n\nDerive $y = \\ln(x^2 + 1)$.\n\nAqui $g(x) = x^2 + 1$ e $g'(x) = 2x$. Aplicando a fórmula do logaritmo com cadeia:\n\n$$y' = \\frac{g'(x)}{g(x)} = \\frac{2x}{x^2 + 1}$$\n\nNão é preciso separar em $\\ln$ de nada; basta dividir a derivada interna pelo argumento.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: juntando regras\n\nDerive $y = x^2 e^x$. Este é um produto, então usamos a regra do produto com $f = x^2$ e $g = e^x$:\n\n$$y' = 2x \\cdot e^x + x^2 \\cdot e^x = e^x\\left(2x + x^2\\right)$$\n\nRepare que a derivada de $e^x$ continua sendo $e^x$, o que mantém a conta curta.",
                    },
                    {
                        type: "quote",
                        value: "A exponencial natural é a única função que coincide com a própria derivada, e isso a coloca no centro de todo o cálculo.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n| Função | Derivada |\n|---|---|\n| $e^x$ | $e^x$ |\n| $a^x$ | $a^x \\ln a$ |\n| $\\ln x$ | $\\frac{1}{x}$ |\n| $\\log_a x$ | $\\frac{1}{x \\ln a}$ |\n| $e^{g(x)}$ | $e^{g(x)} g'(x)$ |\n| $\\ln g(x)$ | $\\frac{g'(x)}{g(x)}$ |\n\nDois deslizes para evitar: aplicar a regra da potência em $e^x$ (ela não vale, o expoente é variável) e esquecer o fator $\\ln a$ quando a base não é $e$.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a derivada de $e^x$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$e^x$",
                                isCorrect: true,
                            },
                            {
                                text: "$x\\,e^{x-1}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\ln x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a derivada de $\\ln x$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$-\\frac{1}{x^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{\\ln x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{x}$",
                                isCorrect: true,
                            },
                            {
                                text: "$x \\ln x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Derive $y = e^{3x}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$e^{3x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$3e^{3x}$",
                                isCorrect: true,
                            },
                            {
                                text: "$3x\\,e^{3x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$3e^{x}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Derive $y = \\ln(x^2 + 1)$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{2x}{x^2 + 1}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{x^2 + 1}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{2x}{x^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2x \\ln(x^2 + 1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Derive $y = 2^x$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$x\\,2^{x-1}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2^x$",
                                isCorrect: false,
                            },
                            {
                                text: "$2^x \\ln x$",
                                isCorrect: false,
                            },
                            {
                                text: "$2^x \\ln 2$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Derivadas das funções trigonométricas",
                blocks: [
                    {
                        type: "text",
                        value: "# Derivadas das funções trigonométricas\n\nAs funções trigonométricas descrevem tudo que oscila: ondas, vibrações, movimentos circulares. Suas derivadas têm um padrão elegante, girando sempre em torno de seno e cosseno. Dominar as duas primeiras fórmulas praticamente resolve todas as outras.",
                    },
                    {
                        type: "text",
                        value: "## Seno e cosseno\n\nAs duas derivadas fundamentais são:\n\n$$\\frac{d}{dx}\\,\\sin x = \\cos x$$\n\n$$\\frac{d}{dx}\\,\\cos x = -\\sin x$$\n\nPreste muita atenção ao **sinal negativo** na derivada do cosseno. Trocar esse sinal é o erro mais cometido com funções trigonométricas. Uma forma de lembrar: derivar avança seno para cosseno, mas o retorno de cosseno para seno vem com sinal trocado.",
                    },
                    {
                        type: "text",
                        value: "## Tangente, secante e as outras\n\nA partir de seno e cosseno, as demais derivadas seguem:\n\n| Função | Derivada |\n|---|---|\n| $\\tan x$ | $\\sec^2 x$ |\n| $\\cot x$ | $-\\csc^2 x$ |\n| $\\sec x$ | $\\sec x \\tan x$ |\n| $\\csc x$ | $-\\csc x \\cot x$ |\n\nNote o padrão: as três co-funções ($\\cos$, $\\cot$, $\\csc$) carregam sinal negativo na derivada.",
                    },
                    {
                        type: "text",
                        value: "## De onde vem a derivada da tangente\n\nA fórmula $\\left(\\tan x\\right)' = \\sec^2 x$ não precisa ser decorada às cegas. Como $\\tan x = \\frac{\\sin x}{\\cos x}$, a regra do quociente dá:\n\n$$\\left(\\tan x\\right)' = \\frac{\\cos x \\cdot \\cos x - \\sin x \\cdot (-\\sin x)}{\\cos^2 x} = \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x}$$\n\nUsando a identidade $\\cos^2 x + \\sin^2 x = 1$:\n\n$$\\left(\\tan x\\right)' = \\frac{1}{\\cos^2 x} = \\sec^2 x$$",
                    },
                    {
                        type: "text",
                        value: "## Com a regra da cadeia\n\nAssim como as outras, as funções trigonométricas se compõem. Com $g(x)$ no lugar de $x$:\n\n$$\\frac{d}{dx}\\,\\sin g(x) = \\cos g(x) \\cdot g'(x)$$\n\nPor exemplo, derive $y = \\sin(3x)$. A interna é $3x$, com derivada $3$:\n\n$$y' = \\cos(3x) \\cdot 3 = 3\\cos(3x)$$\n\nE para $y = \\cos(x^2)$, a interna é $x^2$, com derivada $2x$, sem esquecer o sinal negativo do cosseno:\n\n$$y' = -\\sin(x^2) \\cdot 2x = -2x\\,\\sin(x^2)$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo com produto\n\nDerive $y = x \\sin x$. É um produto de $f = x$ por $g = \\sin x$:\n\n$$y' = 1 \\cdot \\sin x + x \\cdot \\cos x = \\sin x + x\\cos x$$\n\nTrês regras convivem sem conflito: produto, cadeia e as derivadas trigonométricas se encaixam conforme a expressão pede.",
                    },
                    {
                        type: "quote",
                        value: "Cada derivada trigonométrica gira em torno de um seno e um cosseno, então basta dominar bem esses dois.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nAs duas fórmulas que sustentam todas as outras:\n\n$$\\frac{d}{dx}\\,\\sin x = \\cos x, \\qquad \\frac{d}{dx}\\,\\cos x = -\\sin x$$\n\nE a mais usada em seguida, $\\left(\\tan x\\right)' = \\sec^2 x$. Guarde o cuidado central desta aula: o sinal negativo aparece ao derivar as co-funções (cosseno, cotangente e cossecante). Na dúvida, volte a seno e cosseno.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a derivada de $\\sin x$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$-\\cos x$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\cos x$",
                                isCorrect: true,
                            },
                            {
                                text: "$-\\sin x$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tan x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a derivada de $\\cos x$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$-\\sin x$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sin x$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\cos x$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sec x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a derivada de $\\tan x$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\sec^2 x$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sec x \\tan x$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\csc^2 x$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\cot x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Derive $y = \\sin(3x)$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\cos(3x)$",
                                isCorrect: false,
                            },
                            {
                                text: "$-3\\cos(3x)$",
                                isCorrect: false,
                            },
                            {
                                text: "$3\\cos(3x)$",
                                isCorrect: true,
                            },
                            {
                                text: "$3\\sin(3x)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Derive $y = \\cos(x^2)$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$2x\\sin(x^2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$-2x\\sin(x^2)$",
                                isCorrect: true,
                            },
                            {
                                text: "$-\\sin(x^2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$-2x\\cos(x^2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Aplicações da derivada: análise de funções",
        aulas: [
            {
                titulo: "Máximos, mínimos e pontos críticos",
                blocks: [
                    {
                        type: "text",
                        value: "# Máximos, mínimos e pontos críticos\n\nUma das aplicações mais importantes da derivada é localizar os **valores extremos** de uma função, ou seja, os pontos em que ela atinge seu maior ou menor valor. Esses problemas aparecem o tempo todo em otimização: maximizar lucro, minimizar custo, encontrar a maior área possível.\n\nAntes de otimizar, precisamos de vocabulário preciso. Vamos distinguir extremos **absolutos** (globais) de extremos **locais** (relativos).",
                    },
                    {
                        type: "text",
                        value: "## Extremos absolutos e locais\n\nSeja $f$ definida num domínio $D$ e $c \\in D$.\n\n- $f$ tem **máximo absoluto** em $c$ se $f(c) \\ge f(x)$ para todo $x \\in D$.\n- $f$ tem **mínimo absoluto** em $c$ se $f(c) \\le f(x)$ para todo $x \\in D$.\n\nJá os extremos locais valem apenas nas proximidades do ponto:\n\n- $f$ tem **máximo local** em $c$ se $f(c) \\ge f(x)$ para todo $x$ próximo de $c$.\n- $f$ tem **mínimo local** em $c$ se $f(c) \\le f(x)$ para todo $x$ próximo de $c$.\n\nO valor $f(c)$ é chamado de valor máximo (ou mínimo); o ponto $c$ é onde ele ocorre.",
                    },
                    {
                        type: "text",
                        value: "## Teorema de Fermat\n\nOs extremos locais estão ligados à derivada por um resultado fundamental.\n\n**Teorema de Fermat.** Se $f$ tem um extremo local em $c$ e $f'(c)$ existe, então $f'(c) = 0$.\n\nA ideia geométrica é simples: no topo de um pico ou no fundo de um vale suave, a reta tangente é horizontal. Cuidado com a recíproca: $f'(c) = 0$ **não** garante extremo. Por exemplo, $f(x) = x^3$ tem $f'(0) = 0$, mas $x = 0$ não é máximo nem mínimo.",
                    },
                    {
                        type: "text",
                        value: "## Pontos críticos\n\nO teorema de Fermat motiva a definição central desta aula.\n\nUm **número crítico** (ou ponto crítico) de $f$ é um valor $c$ do domínio tal que $f'(c) = 0$ **ou** $f'(c)$ não existe.\n\nTodo extremo local ocorre num ponto crítico, mas nem todo ponto crítico é extremo. Os pontos críticos são apenas os **candidatos** a extremo, que depois precisam ser testados.\n\nExemplo em que a derivada não existe: $f(x) = |x|$ tem um mínimo em $x = 0$, e ali $f'(0)$ não existe.",
                    },
                    {
                        type: "text",
                        value: "## Extremos em intervalos fechados\n\n**Teorema do Valor Extremo.** Se $f$ é contínua num intervalo fechado $[a, b]$, então $f$ atinge um máximo absoluto e um mínimo absoluto nesse intervalo.\n\nPara encontrá-los, usamos o **método do intervalo fechado**:\n\n1. Ache os números críticos de $f$ em $(a, b)$ e calcule $f$ neles.\n2. Calcule $f$ nos extremos $a$ e $b$.\n3. O maior desses valores é o máximo absoluto; o menor é o mínimo absoluto.\n\nNão esqueça de testar os extremos do intervalo: é comum que o máximo ou o mínimo aconteça justamente ali.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: encontrar e classificar pontos críticos\n\nConsidere $f(x) = x^3 - 3x$. Derivando:\n\n$$f'(x) = 3x^2 - 3 = 3(x - 1)(x + 1).$$\n\nComo $f'$ existe em toda a reta, os pontos críticos vêm de $f'(x) = 0$, ou seja, $x = -1$ e $x = 1$.\n\nCalculando os valores: $f(-1) = (-1)^3 - 3(-1) = 2$ e $f(1) = 1 - 3 = -2$. Estudando o sinal de $f'$, veremos nas próximas aulas que $x = -1$ é máximo local e $x = 1$ é mínimo local.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: método do intervalo fechado\n\nVamos achar os extremos absolutos de $f(x) = 2x^3 - 3x^2 - 12x + 1$ em $[-2, 3]$.\n\nDerivada: $f'(x) = 6x^2 - 6x - 12 = 6(x - 2)(x + 1)$, com números críticos $x = -1$ e $x = 2$, ambos dentro de $(-2, 3)$.\n\nAgora avaliamos $f$ nos críticos e nos extremos:\n\n- $f(-2) = -3$\n- $f(-1) = 8$\n- $f(2) = -19$\n- $f(3) = -8$\n\nComparando, o **máximo absoluto** é $8$ (em $x = -1$) e o **mínimo absoluto** é $-19$ (em $x = 2$).",
                    },
                    {
                        type: "quote",
                        value: "Todo extremo mora num ponto crítico, mas nem todo ponto crítico é um extremo: por isso testamos.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Extremos **absolutos** valem em todo o domínio; **locais**, só na vizinhança do ponto.\n- Pelo teorema de Fermat, se há extremo local em $c$ e $f'(c)$ existe, então $f'(c) = 0$.\n- **Pontos críticos** são os $c$ com $f'(c) = 0$ ou $f'(c)$ inexistente. Eles são candidatos a extremo.\n- Em $[a, b]$ contínuo, compare os valores de $f$ nos pontos críticos internos e nos dois extremos para achar os extremos absolutos.",
                    },
                ],
                questions: [
                    {
                        statement: "Quais são os pontos críticos de $f(x) = x^3 - 3x$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = -1$ e $x = 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 0$ apenas",
                                isCorrect: false,
                            },
                            {
                                text: "$x = -3$ e $x = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 3$ apenas",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Um número crítico de $f$ é um valor $c$ do domínio onde:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$f'(c) = 0$ ou $f'(c)$ não existe",
                                isCorrect: true,
                            },
                            {
                                text: "$f(c) = 0$ ou $f(c)$ não existe",
                                isCorrect: false,
                            },
                            {
                                text: "$f''(c) = 0$ ou $f''(c)$ não existe",
                                isCorrect: false,
                            },
                            {
                                text: "$f$ não é contínua em $c$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o máximo absoluto de $f(x) = x^2$ em $[-1, 2]$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$4$",
                                isCorrect: true,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
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
                            "A função $f(x) = x^3$ satisfaz $f'(0) = 0$. O que ocorre em $x = 0$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não há extremo local",
                                isCorrect: true,
                            },
                            {
                                text: "Há um máximo local",
                                isCorrect: false,
                            },
                            {
                                text: "Há um mínimo local",
                                isCorrect: false,
                            },
                            {
                                text: "A derivada não existe",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O máximo absoluto de $f(x) = 2x^3 - 3x^2 - 12x + 1$ em $[-2, 3]$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$8$",
                                isCorrect: true,
                            },
                            {
                                text: "$-19$",
                                isCorrect: false,
                            },
                            {
                                text: "$-8$",
                                isCorrect: false,
                            },
                            {
                                text: "$-3$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O teorema do valor médio",
                blocks: [
                    {
                        type: "text",
                        value: "# O teorema do valor médio\n\nO **teorema do valor médio** (TVM) é um dos resultados mais úteis do cálculo: ele conecta o comportamento da derivada com o comportamento da função no intervalo todo. Antes de enunciá-lo, vejamos um caso particular mais simples, o teorema de Rolle.",
                    },
                    {
                        type: "text",
                        value: "## Teorema de Rolle\n\n**Teorema de Rolle.** Seja $f$ uma função que satisfaz:\n\n1. $f$ é contínua no intervalo fechado $[a, b]$;\n2. $f$ é derivável no intervalo aberto $(a, b)$;\n3. $f(a) = f(b)$.\n\nEntão existe pelo menos um número $c$ em $(a, b)$ tal que $f'(c) = 0$.\n\nEm palavras: se a função começa e termina na mesma altura, em algum ponto intermediário a tangente é horizontal.",
                    },
                    {
                        type: "text",
                        value: "## O teorema do valor médio\n\nO TVM generaliza Rolle removendo a exigência $f(a) = f(b)$.\n\n**Teorema do Valor Médio.** Se $f$ é contínua em $[a, b]$ e derivável em $(a, b)$, então existe $c$ em $(a, b)$ tal que\n\n$$f'(c) = \\frac{f(b) - f(a)}{b - a}.$$\n\nO lado direito é a taxa de variação média de $f$ no intervalo; $f'(c)$ é a taxa instantânea em $c$. O teorema garante que, em algum ponto, a taxa instantânea iguala a média.",
                    },
                    {
                        type: "text",
                        value: "## Interpretação geométrica\n\nA fração $\\frac{f(b) - f(a)}{b - a}$ é a inclinação da reta **secante** que liga os pontos $(a, f(a))$ e $(b, f(b))$. Já $f'(c)$ é a inclinação da reta **tangente** em $c$.\n\nO TVM afirma que existe pelo menos um ponto do gráfico onde a tangente é **paralela** à secante. Pense num carro numa viagem: se a velocidade média foi de $80$ km/h, em algum instante o velocímetro marcou exatamente $80$ km/h.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: aplicando Rolle\n\nSeja $f(x) = x^2 - 4x + 3$ em $[1, 3]$. A função é polinomial, logo contínua e derivável. Além disso $f(1) = 1 - 4 + 3 = 0$ e $f(3) = 9 - 12 + 3 = 0$, então $f(1) = f(3)$.\n\nAs três hipóteses valem, e Rolle garante um $c$ com $f'(c) = 0$. Como $f'(x) = 2x - 4$, resolvemos $2x - 4 = 0$, obtendo $c = 2$, que de fato está em $(1, 3)$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: aplicando o TVM\n\nSeja $f(x) = x^2$ em $[0, 4]$. A taxa média vale\n\n$$\\frac{f(4) - f(0)}{4 - 0} = \\frac{16 - 0}{4} = 4.$$\n\nPelo TVM, existe $c$ em $(0, 4)$ com $f'(c) = 4$. Como $f'(x) = 2x$, resolvemos $2x = 4$, ou seja, $c = 2$. A tangente em $x = 2$ é paralela à secante que liga $(0, 0)$ a $(4, 16)$.",
                    },
                    {
                        type: "text",
                        value: "## Consequências importantes\n\nO TVM tem um corolário que usaremos muito nas próximas aulas:\n\n- Se $f'(x) = 0$ para todo $x$ num intervalo, então $f$ é **constante** nesse intervalo.\n- Se $f'(x) = g'(x)$ para todo $x$ num intervalo, então $f$ e $g$ diferem por uma constante.\n\nÉ esse resultado que justifica o sinal da derivada determinar se a função cresce ou decresce, tema da próxima aula.",
                    },
                    {
                        type: "quote",
                        value: "A velocidade média de uma viagem é atingida, em algum instante, pela velocidade do velocímetro.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- **Rolle**: com $f$ contínua em $[a, b]$, derivável em $(a, b)$ e $f(a) = f(b)$, existe $c$ com $f'(c) = 0$.\n- **TVM**: sem exigir $f(a) = f(b)$, existe $c$ com $f'(c) = \\frac{f(b) - f(a)}{b - a}$.\n- Geometricamente, há um ponto cuja tangente é paralela à secante pelos extremos.\n- Corolário: $f'(x) = 0$ em todo o intervalo implica $f$ constante.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Segundo o teorema do valor médio, existe $c$ em $(a, b)$ tal que $f'(c)$ é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{f(b) - f(a)}{b - a}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{f(b) + f(a)}{b - a}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{b - a}{f(b) - f(a)}$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(b) - f(a)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Além de continuidade e derivabilidade, o teorema de Rolle exige que:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$f(a) = f(b)$",
                                isCorrect: true,
                            },
                            {
                                text: "$f(a) = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$f'(a) = f'(b)$",
                                isCorrect: false,
                            },
                            {
                                text: "$a = b$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x) = x^2$ em $[0, 4]$, qual valor de $c$ o teorema do valor médio fornece?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$c = 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$c = 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$c = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$c = 8$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Aplicando Rolle a $f(x) = x^2 - 6x + 5$ em $[1, 5]$, o valor de $c$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$c = 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$c = 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$c = 5$",
                                isCorrect: false,
                            },
                            {
                                text: "$c = 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que o teorema de Rolle não se aplica a $f(x) = |x|$ em $[-1, 1]$, mesmo com $f(-1) = f(1)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$f$ não é derivável em $x = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$f$ não é contínua em $[-1, 1]$",
                                isCorrect: false,
                            },
                            {
                                text: "na verdade $f(-1) \\ne f(1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$f$ é constante no intervalo",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Crescimento e decrescimento",
                blocks: [
                    {
                        type: "text",
                        value: "# Crescimento e decrescimento\n\nSaber onde uma função **cresce** ou **decresce** é essencial para entender seu comportamento e localizar extremos. O sinal da primeira derivada responde exatamente a essa pergunta, graças ao teorema do valor médio da aula anterior.",
                    },
                    {
                        type: "text",
                        value: "## Teste crescimento/decrescimento\n\nSeja $f$ derivável num intervalo.\n\n- Se $f'(x) > 0$ em todo o intervalo, então $f$ é **crescente** ali.\n- Se $f'(x) < 0$ em todo o intervalo, então $f$ é **decrescente** ali.\n\nA intuição é direta: derivada positiva significa reta tangente com inclinação para cima, logo a função sobe. Derivada negativa, o contrário.",
                    },
                    {
                        type: "text",
                        value: "## Estudo do sinal de $f'$\n\nPara descobrir os intervalos de crescimento, seguimos um roteiro:\n\n1. Calcule $f'(x)$ e encontre os pontos críticos (onde $f' = 0$ ou não existe).\n2. Esses pontos dividem a reta em intervalos.\n3. Em cada intervalo, teste o sinal de $f'$ usando um valor qualquer.\n4. Monte uma tabela de sinais.\n\nOnde $f'$ é positiva, a função cresce; onde é negativa, decresce.",
                    },
                    {
                        type: "text",
                        value: "## Teste da primeira derivada\n\nA mudança de sinal de $f'$ num ponto crítico $c$ classifica o extremo:\n\n- Se $f'$ passa de **positiva para negativa** em $c$, então $c$ é **máximo local**.\n- Se $f'$ passa de **negativa para positiva** em $c$, então $c$ é **mínimo local**.\n- Se $f'$ **não muda de sinal**, não há extremo em $c$.\n\nPense no sinal como o sentido do movimento: subir e depois descer forma um pico; descer e depois subir forma um vale.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: $f(x) = x^3 - 3x$\n\nJá vimos que $f'(x) = 3(x - 1)(x + 1)$, com pontos críticos $x = -1$ e $x = 1$. Testando o sinal em cada intervalo:\n\n| Intervalo | Sinal de $f'(x)$ | Comportamento |\n|---|---|---|\n| $x < -1$ | $+$ | crescente |\n| $-1 < x < 1$ | $-$ | decrescente |\n| $x > 1$ | $+$ | crescente |\n\nEm $x = -1$, $f'$ passa de $+$ para $-$: **máximo local**, com $f(-1) = 2$. Em $x = 1$, passa de $-$ para $+$: **mínimo local**, com $f(1) = -2$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: $f(x) = x^4 - 2x^2$\n\nDerivando: $f'(x) = 4x^3 - 4x = 4x(x - 1)(x + 1)$. Os pontos críticos são $x = -1$, $x = 0$ e $x = 1$.\n\n| Intervalo | Sinal de $f'(x)$ | Comportamento |\n|---|---|---|\n| $x < -1$ | $-$ | decrescente |\n| $-1 < x < 0$ | $+$ | crescente |\n| $0 < x < 1$ | $-$ | decrescente |\n| $x > 1$ | $+$ | crescente |\n\nAssim: mínimo local em $x = -1$ e em $x = 1$ (ambos com $f = -1$), e máximo local em $x = 0$ (com $f = 0$).",
                    },
                    {
                        type: "quote",
                        value: "O sinal da primeira derivada conta se a função sobe ou desce; a troca de sinal marca os picos e vales.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $f'(x) > 0$ implica $f$ crescente; $f'(x) < 0$ implica $f$ decrescente.\n- Estude o sinal de $f'$ dividindo a reta pelos pontos críticos e testando cada intervalo.\n- **Teste da primeira derivada**: $+$ para $-$ indica máximo local; $-$ para $+$ indica mínimo local; sem troca, não há extremo.",
                    },
                ],
                questions: [
                    {
                        statement: "Se $f'(x) > 0$ em um intervalo, então nesse intervalo $f$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "crescente",
                                isCorrect: true,
                            },
                            {
                                text: "decrescente",
                                isCorrect: false,
                            },
                            {
                                text: "constante",
                                isCorrect: false,
                            },
                            {
                                text: "descontínua",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Em que intervalo a função $f(x) = x^2 - 4x$ é crescente?",
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
                                text: "$x > 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x < 4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Pelo teste da primeira derivada, se $f'$ passa de negativa para positiva em $c$, então $c$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "mínimo local",
                                isCorrect: true,
                            },
                            {
                                text: "máximo local",
                                isCorrect: false,
                            },
                            {
                                text: "ponto de inflexão",
                                isCorrect: false,
                            },
                            {
                                text: "assíntota vertical",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A função $f(x) = x^4 - 2x^2$ tem em $x = 0$ um:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "máximo local",
                                isCorrect: true,
                            },
                            {
                                text: "mínimo local",
                                isCorrect: false,
                            },
                            {
                                text: "ponto de inflexão",
                                isCorrect: false,
                            },
                            {
                                text: "ponto de descontinuidade",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Em que intervalo $f(x) = x^3 - 6x^2 + 9x$ é decrescente?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$1 < x < 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$x < 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$x > 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$-3 < x < -1$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Concavidade e pontos de inflexão",
                blocks: [
                    {
                        type: "text",
                        value: "# Concavidade e pontos de inflexão\n\nA primeira derivada diz se a função sobe ou desce. A **segunda derivada** revela como ela se curva: se o gráfico abre para cima ou para baixo. Essa informação, a **concavidade**, completa o retrato da função.",
                    },
                    {
                        type: "text",
                        value: "## Teste de concavidade\n\nA concavidade descreve para que lado a curva se dobra. Formalmente, olhamos o sinal de $f''$.\n\n- Se $f''(x) > 0$ em um intervalo, o gráfico é **côncavo para cima** (formato de $\\cup$).\n- Se $f''(x) < 0$ em um intervalo, o gráfico é **côncavo para baixo** (formato de $\\cap$).\n\nQuando $f'' > 0$, a inclinação $f'$ está aumentando; quando $f'' < 0$, a inclinação está diminuindo.",
                    },
                    {
                        type: "text",
                        value: "## Pontos de inflexão\n\nUm **ponto de inflexão** é um ponto do gráfico, contínuo, onde a concavidade **muda** (de cima para baixo ou vice-versa).\n\nOs candidatos a inflexão são os pontos onde $f''(x) = 0$ ou $f''$ não existe. Mas atenção: $f''(c) = 0$ sozinho não basta. É preciso que $f''$ realmente **troque de sinal** em $c$.",
                    },
                    {
                        type: "text",
                        value: "## Teste da segunda derivada\n\nA concavidade oferece um atalho para classificar pontos críticos. Suponha $f''$ contínua perto de $c$, com $f'(c) = 0$.\n\n- Se $f''(c) > 0$, o gráfico é côncavo para cima em $c$: **mínimo local**.\n- Se $f''(c) < 0$, o gráfico é côncavo para baixo em $c$: **máximo local**.\n- Se $f''(c) = 0$, o teste é **inconclusivo** (use o teste da primeira derivada).\n\nEsse teste costuma ser mais rápido que estudar o sinal de $f'$ em torno de $c$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: $f(x) = x^3 - 3x$\n\nTemos $f'(x) = 3x^2 - 3$ e $f''(x) = 6x$. A candidata a inflexão vem de $f''(x) = 0$, isto é, $x = 0$.\n\nComo $f'' < 0$ para $x < 0$ (côncavo para baixo) e $f'' > 0$ para $x > 0$ (côncavo para cima), há mudança de concavidade: $x = 0$ é ponto de inflexão, com $f(0) = 0$.\n\nAplicando o teste da segunda derivada aos críticos $x = \\pm 1$: $f''(-1) = -6 < 0$ dá máximo local, e $f''(1) = 6 > 0$ dá mínimo local.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: $f(x) = x^4 - 6x^2$\n\nCalculamos $f''(x) = 12x^2 - 12 = 12(x - 1)(x + 1)$, que zera em $x = -1$ e $x = 1$.\n\n| Intervalo | Sinal de $f''(x)$ | Concavidade |\n|---|---|---|\n| $x < -1$ | $+$ | para cima |\n| $-1 < x < 1$ | $-$ | para baixo |\n| $x > 1$ | $+$ | para cima |\n\nHá troca de concavidade em ambos, então $x = -1$ e $x = 1$ são pontos de inflexão, cada um com $f = -5$.",
                    },
                    {
                        type: "quote",
                        value: "A segunda derivada não diz se a função sobe, e sim como ela se curva ao subir ou descer.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $f'' > 0$: côncavo para cima; $f'' < 0$: côncavo para baixo.\n- **Ponto de inflexão**: onde a concavidade muda; candidatos em $f'' = 0$ ou $f''$ inexistente, com troca de sinal obrigatória.\n- **Teste da segunda derivada**: num crítico com $f'(c) = 0$, $f''(c) > 0$ dá mínimo, $f''(c) < 0$ dá máximo, $f''(c) = 0$ é inconclusivo.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Se $f''(x) > 0$ em um intervalo, o gráfico de $f$ nesse intervalo é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "côncavo para cima",
                                isCorrect: true,
                            },
                            {
                                text: "côncavo para baixo",
                                isCorrect: false,
                            },
                            {
                                text: "uma reta",
                                isCorrect: false,
                            },
                            {
                                text: "decrescente",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Os candidatos a ponto de inflexão de $f$ são os pontos onde:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$f''(x) = 0$ ou $f''$ não existe",
                                isCorrect: true,
                            },
                            {
                                text: "$f'(x) = 0$ ou $f'$ não existe",
                                isCorrect: false,
                            },
                            {
                                text: "$f(x) = 0$ ou $f$ não existe",
                                isCorrect: false,
                            },
                            {
                                text: "$f''(x) = 0$ mas $f''$ não troca de sinal",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x) = x^3 - 3x$, tem-se $f''(x) = 6x$. Em $x = 1$, o teste da segunda derivada indica:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "mínimo local",
                                isCorrect: true,
                            },
                            {
                                text: "máximo local",
                                isCorrect: false,
                            },
                            {
                                text: "ponto de inflexão",
                                isCorrect: false,
                            },
                            {
                                text: "teste inconclusivo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a abscissa do ponto de inflexão de $f(x) = x^3 - 6x^2$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x = 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = -2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x) = x^4$, tem-se $f''(0) = 0$, mas $x = 0$ não é ponto de inflexão. Por quê?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$f''$ não muda de sinal em $x = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$f''(0)$ na verdade não existe",
                                isCorrect: false,
                            },
                            {
                                text: "$f'(0)$ é diferente de zero",
                                isCorrect: false,
                            },
                            {
                                text: "$f$ não é derivável no ponto $x = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Esboço de gráficos",
                blocks: [
                    {
                        type: "text",
                        value: "# Esboço de gráficos\n\nAgora reunimos tudo. Com $f$, $f'$ e $f''$ na mão, conseguimos desenhar um gráfico fiel sem marcar dezenas de pontos. A ideia é extrair as **características qualitativas** da função e montá-las como um quebra-cabeça.",
                    },
                    {
                        type: "text",
                        value: "## Roteiro de análise\n\nUm esboço completo costuma seguir estes passos:\n\n1. **Domínio**: onde $f$ está definida.\n2. **Interceptos**: $f(0)$ dá o corte com o eixo $y$; resolver $f(x) = 0$ dá os cortes com o eixo $x$.\n3. **Simetria**: $f(-x) = f(x)$ indica função par; $f(-x) = -f(x)$, ímpar.\n4. **Assíntotas**: verticais e horizontais.\n5. **Crescimento/decrescimento e extremos**: sinal de $f'$.\n6. **Concavidade e inflexões**: sinal de $f''$.\n7. Junte tudo e **esboce**.",
                    },
                    {
                        type: "text",
                        value: "## Assíntotas\n\nAssíntotas são retas das quais o gráfico se aproxima.\n\n- **Vertical**: a reta $x = a$ é assíntota vertical se $f(x) \\to \\pm\\infty$ quando $x \\to a$. Em funções racionais, procure onde o denominador zera (sem zerar o numerador).\n- **Horizontal**: a reta $y = L$ é assíntota horizontal se $f(x) \\to L$ quando $x \\to \\infty$ ou $x \\to -\\infty$.\n\nPolinômios não têm assíntotas; elas aparecem tipicamente em funções racionais.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: $f(x) = x^3 - 3x$\n\nVamos aplicar o roteiro.\n\n- **Domínio**: todos os reais.\n- **Interceptos**: $f(0) = 0$; e $x^3 - 3x = x(x^2 - 3) = 0$ dá $x = 0$, $x = \\sqrt{3}$ e $x = -\\sqrt{3}$.\n- **Simetria**: $f(-x) = -x^3 + 3x = -f(x)$, função **ímpar** (simétrica em relação à origem).\n- **Assíntotas**: nenhuma, pois é polinômio.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: derivadas e esboço\n\nContinuando a análise de $f(x) = x^3 - 3x$:\n\n- **Monotonicidade**: $f'(x) = 3(x - 1)(x + 1)$. Cresce em $x < -1$ e $x > 1$, decresce em $-1 < x < 1$. Máximo local $(-1, 2)$ e mínimo local $(1, -2)$.\n- **Concavidade**: $f''(x) = 6x$. Côncava para baixo em $x < 0$, para cima em $x > 0$. Inflexão em $(0, 0)$.\n\nO esboço mostra uma curva que sobe até o pico $(-1, 2)$, desce até o vale $(1, -2)$ e volta a subir, cruzando o eixo $x$ em $-\\sqrt{3}$, $0$ e $\\sqrt{3}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: $f(x) = \\dfrac{x}{x - 1}$\n\nUma função racional exige atenção às assíntotas.\n\n- **Domínio**: $x \\ne 1$.\n- **Interceptos**: $f(0) = 0$, então passa pela origem.\n- **Assíntota vertical**: em $x = 1$ o denominador zera e o numerador não, logo $x = 1$ é assíntota vertical.\n- **Assíntota horizontal**: quando $x \\to \\pm\\infty$, $f(x) \\to 1$, então $y = 1$ é assíntota horizontal.\n- **Monotonicidade**: $f'(x) = \\dfrac{-1}{(x - 1)^2} < 0$, então $f$ é decrescente em $(-\\infty, 1)$ e em $(1, \\infty)$, sem extremos.\n\nO gráfico tem dois ramos que fogem da reta $x = 1$ e se achatam contra $y = 1$.",
                    },
                    {
                        type: "quote",
                        value: "Esboçar um gráfico é resolver um quebra-cabeça: cada derivada entrega uma peça do formato final.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Siga o roteiro: domínio, interceptos, simetria, assíntotas, sinal de $f'$ e sinal de $f''$.\n- $f'$ entrega crescimento, decrescimento e extremos; $f''$ entrega concavidade e inflexões.\n- Assíntotas verticais vêm de denominador nulo; horizontais, do limite no infinito.\n- Reúna todas as peças antes de traçar a curva.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o intercepto de $f(x) = x^3 - 3x$ com o eixo $y$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(0, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(0, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, -3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A função $f(x) = x^3 - 3x$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "ímpar",
                                isCorrect: true,
                            },
                            {
                                text: "par",
                                isCorrect: false,
                            },
                            {
                                text: "periódica",
                                isCorrect: false,
                            },
                            {
                                text: "constante",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a assíntota vertical de $f(x) = \\dfrac{x}{x - 1}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x = 1$",
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
                                text: "$x = -1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a assíntota horizontal de $f(x) = \\dfrac{x}{x - 1}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$y = 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$y = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = -1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quais são as abscissas dos cortes de $f(x) = x^3 - 3x$ com o eixo $x$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$x = 0$, $x = \\sqrt{3}$ e $x = -\\sqrt{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 0$, $x = 3$ e $x = -3$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = \\sqrt{3}$ e $x = -\\sqrt{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 0$, $x = \\sqrt{3}$, $x = -\\sqrt{3}$ e $x = 3$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Aplicações da derivada: otimização e taxas",
        aulas: [
            {
                titulo: "Problemas de otimização",
                blocks: [
                    {
                        type: "text",
                        value: "## Do máximo e mínimo à otimização\n\nNo módulo anterior aprendemos a localizar máximos e mínimos de uma função usando a derivada. Agora vamos usar essa ferramenta para resolver **problemas de otimização**, situações reais em que queremos o melhor resultado possível: a maior área, o menor custo, o volume máximo, o caminho mais curto.\n\nA ideia central é simples. Escrevemos a grandeza que queremos otimizar como uma função de uma única variável e procuramos seus pontos críticos. O cálculo faz o trabalho pesado de comparar infinitas possibilidades de uma vez só.",
                    },
                    {
                        type: "text",
                        value: "## Um roteiro confiável\n\nQuase todo problema de otimização segue os mesmos passos:\n\n1. **Identifique** a grandeza a otimizar (área, volume, custo) e dê um nome a ela.\n2. **Nomeie as variáveis** e faça um desenho quando possível.\n3. **Use a restrição** do problema (perímetro fixo, volume dado) para escrever tudo em função de **uma só** variável.\n4. **Determine o domínio** admissível dessa variável.\n5. **Derive**, iguale a zero e resolva para achar os pontos críticos.\n6. **Teste** cada candidato pelo teste da primeira ou da segunda derivada, sem esquecer de checar os extremos do domínio.\n7. **Responda** o que foi perguntado, com unidades.\n\nO passo 3 é o coração do método: sem a restrição, não conseguimos reduzir o problema a uma variável.",
                    },
                    {
                        type: "quote",
                        value: "Otimizar não é buscar o infinito, é encontrar a melhor escolha dentro dos limites que o problema impõe.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: o cercado à beira do rio\n\nUm agricultor tem $100$ metros de cerca e quer delimitar uma região retangular usando um rio reto como um dos lados, de modo que esse lado não precise de cerca. Qual é a maior área possível?\n\nChame de $x$ os dois lados perpendiculares ao rio e de $y$ o lado paralelo a ele. A cerca cobre três lados:\n\n$$2x + y = 100 \\quad\\Rightarrow\\quad y = 100 - 2x.$$\n\nA área é\n\n$$A(x) = x\\,y = x(100 - 2x) = 100x - 2x^2,$$\n\ncom $0 < x < 50$. Derivando e igualando a zero:\n\n$$A'(x) = 100 - 4x = 0 \\quad\\Rightarrow\\quad x = 25.$$\n\nComo $A''(x) = -4 < 0$, o ponto é um máximo. Então $y = 100 - 50 = 50$ e a área máxima é\n\n$$A(25) = 25 \\cdot 50 = 1250 \\text{ m}^2.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: a caixa sem tampa\n\nDe uma folha quadrada de lado $12$ cm, recortamos um quadradinho de lado $x$ em cada canto e dobramos as abas para cima, formando uma caixa sem tampa. Que valor de $x$ dá o volume máximo?\n\nA base da caixa fica com lado $12 - 2x$ e a altura é $x$, então\n\n$$V(x) = x(12 - 2x)^2, \\qquad 0 < x < 6.$$\n\nExpandindo, $V(x) = 4x^3 - 48x^2 + 144x$. Derivando:\n\n$$V'(x) = 12x^2 - 96x + 144 = 12(x - 2)(x - 6).$$\n\nOs pontos críticos são $x = 2$ e $x = 6$. Como $x = 6$ está fora do domínio (daria base nula), resta $x = 2$. Verificando com a segunda derivada, $V''(x) = 24x - 96$ e $V''(2) = -48 < 0$, confirmando um máximo. O volume máximo é\n\n$$V(2) = 2 \\cdot 8^2 = 128 \\text{ cm}^3.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: a lata mais econômica\n\nUm problema clássico da indústria: para um volume fixo $V$, qual formato de lata cilíndrica gasta menos material? Queremos minimizar a área total $S = 2\\pi r^2 + 2\\pi r h$ sujeita a $\\pi r^2 h = V$.\n\nIsolando $h = \\dfrac{V}{\\pi r^2}$ e substituindo:\n\n$$S(r) = 2\\pi r^2 + \\frac{2V}{r}.$$\n\nDerivando, $S'(r) = 4\\pi r - \\dfrac{2V}{r^2} = 0$, o que leva a $4\\pi r^3 = 2V$. Voltando à restrição, encontramos a relação elegante\n\n$$h = 2r,$$\n\nou seja, a lata ideal tem altura igual ao diâmetro. Vale registrar outro resultado famoso: entre todos os retângulos de perímetro fixo, o de **maior área é o quadrado**.",
                    },
                    {
                        type: "text",
                        value: "## Cuidados que evitam erros\n\nAlguns tropeços aparecem sempre:\n\n- **Esquecer o domínio.** Comprimentos e raios são positivos, então o intervalo admissível quase nunca é toda a reta.\n- **Confundir máximo com mínimo.** Um ponto crítico pode ser qualquer um dos dois. Use o teste da segunda derivada ($f'' < 0$ para máximo, $f'' > 0$ para mínimo) ou analise o sinal de $f'$.\n- **Ignorar os extremos do intervalo.** Quando o domínio é fechado, o máximo pode estar numa das pontas, e não num ponto crítico interno.\n- **Parar cedo demais.** Depois de achar a variável, volte e responda exatamente o que o problema pediu.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Otimização usa a derivada para achar o melhor valor de uma grandeza sob uma restrição.\n- O roteiro é modelar, reduzir a uma variável com a restrição, derivar, resolver $f'(x) = 0$ e testar os candidatos.\n- Sempre verifique o domínio e os extremos do intervalo, e classifique o ponto crítico com $f''$.\n- Resultados que valem lembrar: perímetro fixo dá área máxima no quadrado, e a lata de menor superfície tem $h = 2r$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Entre todos os retângulos de perímetro $40$ m, qual deles tem a maior área?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "o retângulo de $8$ m por $12$ m",
                                isCorrect: false,
                            },
                            {
                                text: "o quadrado de lado $10$ m",
                                isCorrect: true,
                            },
                            {
                                text: "o retângulo de $5$ m por $15$ m",
                                isCorrect: false,
                            },
                            {
                                text: "o retângulo de $4$ m por $16$ m",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com $60$ m de cerca deseja-se cercar um terreno retangular aproveitando um muro reto como um dos lados. Qual é a área máxima?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$400 \\text{ m}^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$225 \\text{ m}^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$450 \\text{ m}^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$900 \\text{ m}^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na caixa sem tampa de volume $V(x) = x(12 - 2x)^2$, qual valor de $x$ maximiza o volume?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x = 6$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A soma de dois números positivos é $10$. Qual é o maior valor possível do produto deles?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$24$",
                                isCorrect: false,
                            },
                            {
                                text: "$21$",
                                isCorrect: false,
                            },
                            {
                                text: "$20$",
                                isCorrect: false,
                            },
                            {
                                text: "$25$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma lata cilíndrica fechada deve ter volume fixo usando o mínimo de material. Qual é a relação entre a altura $h$ e o raio $r$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$h = 2r$",
                                isCorrect: true,
                            },
                            {
                                text: "$h = r$",
                                isCorrect: false,
                            },
                            {
                                text: "$h = 4r$",
                                isCorrect: false,
                            },
                            {
                                text: "$h = \\dfrac{r}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Taxas relacionadas",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando tudo muda ao mesmo tempo\n\nEm muitos fenômenos, duas ou mais grandezas estão ligadas por uma equação e variam **juntas** com o tempo. Se conhecemos a taxa de variação de uma delas, podemos descobrir a taxa da outra. Esses são os problemas de **taxas relacionadas**.\n\nExemplos típicos: um balão que infla e tem raio e volume crescendo, uma escada que escorrega na parede, o nível da água subindo num tanque. A palavra-chave é *relacionadas*: existe uma equação que amarra as grandezas, e vamos derivá-la em relação ao tempo.",
                    },
                    {
                        type: "text",
                        value: "## O papel da regra da cadeia\n\nA técnica é derivar a equação que liga as grandezas **em relação ao tempo** $t$, tratando cada variável como função de $t$. É aqui que a regra da cadeia entra em cena.\n\nPor exemplo, se $A = \\pi r^2$ e o raio depende do tempo, então\n\n$$\\frac{dA}{dt} = 2\\pi r \\, \\frac{dr}{dt}.$$\n\nRepare no fator $\\dfrac{dr}{dt}$: ele aparece justamente por causa da regra da cadeia. Esquecê-lo é o erro mais comum do assunto.\n\nO roteiro é:\n\n1. Faça um desenho e nomeie as grandezas variáveis.\n2. Escreva a equação que as relaciona.\n3. Derive os dois lados em relação a $t$.\n4. **Só então** substitua os valores do instante de interesse.\n5. Resolva para a taxa desejada.",
                    },
                    {
                        type: "quote",
                        value: "Numa equação que envolve o tempo, mexer numa grandeza faz todas as outras responderem no mesmo instante.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: a escada que escorrega\n\nUma escada de $5$ m está apoiada numa parede vertical. A base é puxada para longe da parede a $1$ m/s. A que velocidade o topo desce quando a base está a $3$ m da parede?\n\nSejam $x$ a distância da base à parede e $y$ a altura do topo. Pelo teorema de Pitágoras,\n\n$$x^2 + y^2 = 25.$$\n\nDerivando em relação a $t$:\n\n$$2x \\frac{dx}{dt} + 2y \\frac{dy}{dt} = 0.$$\n\nNo instante pedido, $x = 3$, logo $y = \\sqrt{25 - 9} = 4$. Com $\\dfrac{dx}{dt} = 1$:\n\n$$\\frac{dy}{dt} = -\\frac{x}{y} \\cdot \\frac{dx}{dt} = -\\frac{3}{4} \\cdot 1 = -0{,}75 \\text{ m/s}.$$\n\nO sinal negativo confirma que o topo **desce**, a $0{,}75$ m/s.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: o balão que infla\n\nAr é bombeado para dentro de um balão esférico à taxa de $100 \\text{ cm}^3/\\text{s}$. Com que velocidade o raio cresce quando ele mede $5$ cm?\n\nO volume da esfera é $V = \\dfrac{4}{3}\\pi r^3$. Derivando em relação a $t$:\n\n$$\\frac{dV}{dt} = 4\\pi r^2 \\, \\frac{dr}{dt}.$$\n\nSubstituindo $\\dfrac{dV}{dt} = 100$ e $r = 5$:\n\n$$100 = 4\\pi (5)^2 \\frac{dr}{dt} = 100\\pi \\frac{dr}{dt} \\quad\\Rightarrow\\quad \\frac{dr}{dt} = \\frac{1}{\\pi} \\approx 0{,}32 \\text{ cm/s}.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: dois carros se afastando\n\nDo mesmo cruzamento, um carro segue para o leste a $60$ km/h e outro para o norte a $80$ km/h. A que taxa a distância entre eles aumenta depois de $1$ hora?\n\nSejam $x$ e $y$ as distâncias percorridas e $D$ a distância entre os carros, com $D^2 = x^2 + y^2$. Derivando:\n\n$$2D \\frac{dD}{dt} = 2x \\frac{dx}{dt} + 2y \\frac{dy}{dt}.$$\n\nApós $1$ h temos $x = 60$, $y = 80$ e $D = \\sqrt{60^2 + 80^2} = 100$. Assim,\n\n$$100 \\frac{dD}{dt} = 60 \\cdot 60 + 80 \\cdot 80 = 10000 \\quad\\Rightarrow\\quad \\frac{dD}{dt} = 100 \\text{ km/h}.$$",
                    },
                    {
                        type: "text",
                        value: "## Erros que valem evitar\n\n- **Substituir cedo demais.** Coloque os valores numéricos apenas depois de derivar. Se você fixar $x = 3$ antes, ele vira constante e sua derivada some.\n- **Esquecer a regra da cadeia.** Toda variável que depende do tempo carrega seu $\\dfrac{d}{dt}$ ao ser derivada.\n- **Ignorar a geometria.** Em problemas com sombra, cone ou tanque, use **triângulos semelhantes** para relacionar as grandezas antes de derivar.\n- **Largar o sinal.** Taxa negativa significa grandeza diminuindo, e ela carrega informação física.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Taxas relacionadas ligam as velocidades de variação de grandezas conectadas por uma equação.\n- Deriva-se a equação em relação ao tempo, aplicando a regra da cadeia a cada variável.\n- Substitua os valores do instante somente após derivar.\n- O sinal da taxa indica se a grandeza cresce ou diminui.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Ar entra num balão esférico à taxa de $36\\pi \\text{ cm}^3/\\text{s}$. Sabendo que $\\dfrac{dV}{dt} = 4\\pi r^2 \\dfrac{dr}{dt}$, qual é $\\dfrac{dr}{dt}$ quando $r = 3$ cm?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1 \\text{ cm/s}$",
                                isCorrect: true,
                            },
                            {
                                text: "$2 \\text{ cm/s}$",
                                isCorrect: false,
                            },
                            {
                                text: "$4 \\text{ cm/s}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{3} \\text{ cm/s}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O raio de um círculo cresce a $2$ cm/s. A que taxa a área aumenta no instante em que $r = 5$ cm?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$10\\pi \\text{ cm}^2/\\text{s}$",
                                isCorrect: false,
                            },
                            {
                                text: "$20\\pi \\text{ cm}^2/\\text{s}$",
                                isCorrect: true,
                            },
                            {
                                text: "$25\\pi \\text{ cm}^2/\\text{s}$",
                                isCorrect: false,
                            },
                            {
                                text: "$4\\pi \\text{ cm}^2/\\text{s}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma escada de $10$ m apoiada na parede tem a base deslizando a $2$ m/s. Quando a base está a $6$ m da parede, com que velocidade o topo desce?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1{,}5 \\text{ m/s}$",
                                isCorrect: true,
                            },
                            {
                                text: "$2{,}0 \\text{ m/s}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2{,}7 \\text{ m/s}$",
                                isCorrect: false,
                            },
                            {
                                text: "$3{,}0 \\text{ m/s}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Dois carros partem juntos: um vai para o leste a $30$ km/h e outro para o norte a $40$ km/h. Depois de $1$ hora, a que taxa a distância entre eles cresce?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$70 \\text{ km/h}$",
                                isCorrect: false,
                            },
                            {
                                text: "$35 \\text{ km/h}$",
                                isCorrect: false,
                            },
                            {
                                text: "$50 \\text{ km/h}$",
                                isCorrect: true,
                            },
                            {
                                text: "$25 \\text{ km/h}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma pessoa de $2$ m de altura se afasta de um poste de $5$ m a $1{,}5$ m/s. A que velocidade a ponta da sombra se move no chão?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$1{,}0 \\text{ m/s}$",
                                isCorrect: false,
                            },
                            {
                                text: "$1{,}5 \\text{ m/s}$",
                                isCorrect: false,
                            },
                            {
                                text: "$3{,}75 \\text{ m/s}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2{,}5 \\text{ m/s}$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Regra de L'Hôpital",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando a substituição direta falha\n\nAo calcular um limite, o primeiro reflexo é substituir o valor. Mas às vezes isso produz expressões sem sentido imediato, como $\\dfrac{0}{0}$ ou $\\dfrac{\\infty}{\\infty}$. Elas são chamadas de **formas indeterminadas**: o resultado pode ser qualquer número, $0$, $\\infty$ ou nem existir, dependendo de como numerador e denominador se comportam.\n\nA **regra de L'Hôpital** é uma ferramenta poderosa para lidar exatamente com esses casos, trocando o limite de um quociente pelo limite do quociente das derivadas.",
                    },
                    {
                        type: "text",
                        value: "## O enunciado da regra\n\nSe $\\displaystyle\\lim_{x \\to a} \\frac{f(x)}{g(x)}$ tem a forma $\\dfrac{0}{0}$ ou $\\dfrac{\\infty}{\\infty}$, e se $f$ e $g$ são deriváveis perto de $a$ com $g'(x) \\neq 0$, então\n\n$$\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)},$$\n\ndesde que o limite da direita exista (ou seja $\\pm\\infty$). Vale para $a$ finito e para $a = \\pm\\infty$.\n\nAs formas indeterminadas mais comuns são:\n\n| Forma | Como aparece |\n| --- | --- |\n| 0/0 | quociente de duas funções que zeram |\n| ∞/∞ | quociente de duas funções que explodem |\n| 0 · ∞ | produto reescrito como quociente |\n| ∞ - ∞ | diferença com denominador comum |\n| 1^∞, 0^0, ∞^0 | potências tratadas com logaritmo |\n\nAs três últimas formas de potência se resolvem aplicando logaritmo antes de usar a regra.",
                    },
                    {
                        type: "quote",
                        value: "Uma forma indeterminada não é um beco sem saída, é um convite para olhar mais de perto como as funções crescem.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: o limite fundamental\n\nO limite $\\displaystyle\\lim_{x \\to 0} \\frac{\\sin x}{x}$ vale $1$ e é a base de toda a trigonometria do cálculo. Ao substituir $x = 0$ obtemos $\\dfrac{0}{0}$, uma indeterminação. Aplicando L'Hôpital, derivamos numerador e denominador:\n\n$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = \\lim_{x \\to 0} \\frac{\\cos x}{1} = \\cos 0 = 1.$$\n\nRápido e direto. Vale lembrar que esse limite também pode ser demonstrado por geometria, sem a regra.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: exponencial contra polinômio\n\nQuem cresce mais rápido, $e^x$ ou $x^2$? Vejamos $\\displaystyle\\lim_{x \\to \\infty} \\frac{e^x}{x^2}$, que tem a forma $\\dfrac{\\infty}{\\infty}$. Uma aplicação de L'Hôpital ainda deixa indeterminado:\n\n$$\\lim_{x \\to \\infty} \\frac{e^x}{x^2} = \\lim_{x \\to \\infty} \\frac{e^x}{2x}.$$\n\nAplicando de novo:\n\n$$\\lim_{x \\to \\infty} \\frac{e^x}{2x} = \\lim_{x \\to \\infty} \\frac{e^x}{2} = \\infty.$$\n\nConclusão: a exponencial vence qualquer potência. Às vezes é preciso aplicar a regra mais de uma vez, sempre checando se a indeterminação persiste.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: transformando um produto\n\nO limite $\\displaystyle\\lim_{x \\to 0^+} x \\ln x$ tem a forma $0 \\cdot (-\\infty)$, que não é diretamente atacável pela regra. O truque é reescrevê-lo como um quociente:\n\n$$x \\ln x = \\frac{\\ln x}{1/x}.$$\n\nAgora a forma é $\\dfrac{-\\infty}{\\infty}$. Aplicando L'Hôpital:\n\n$$\\lim_{x \\to 0^+} \\frac{\\ln x}{1/x} = \\lim_{x \\to 0^+} \\frac{1/x}{-1/x^2} = \\lim_{x \\to 0^+} (-x) = 0.$$\n\nProdutos $0 \\cdot \\infty$ viram $\\dfrac{0}{0}$ ou $\\dfrac{\\infty}{\\infty}$ conforme onde jogamos o fator.",
                    },
                    {
                        type: "text",
                        value: "## Cuidado: só com indeterminação\n\nO erro mais grave é aplicar L'Hôpital onde **não há** indeterminação. Considere\n\n$$\\lim_{x \\to 0} \\frac{x + 2}{x + 1}.$$\n\nA substituição direta dá $\\dfrac{2}{1} = 2$, e pronto, o limite é $2$. Se um aluno desatento derivar numerador e denominador, obtém $\\dfrac{1}{1} = 1$, um resultado **errado**. Antes de usar a regra, confirme sempre que a forma é $\\dfrac{0}{0}$ ou $\\dfrac{\\infty}{\\infty}$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Formas indeterminadas como $\\dfrac{0}{0}$ e $\\dfrac{\\infty}{\\infty}$ pedem cuidado extra.\n- A regra de L'Hôpital troca $\\lim \\dfrac{f}{g}$ por $\\lim \\dfrac{f'}{g'}$ quando a forma é indeterminada.\n- Pode ser aplicada repetidamente, e outras formas ($0 \\cdot \\infty$, $\\infty - \\infty$, potências) se reduzem a ela.\n- Nunca use a regra sem antes verificar que existe indeterminação.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é o valor de $\\displaystyle\\lim_{x \\to 0} \\frac{\\sin x}{x}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "não existe",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Aplicando L'Hôpital, quanto vale $\\displaystyle\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quanto vale $\\displaystyle\\lim_{x \\to \\infty} \\frac{\\ln x}{x}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "$e$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um estudante aplicou L'Hôpital em $\\displaystyle\\lim_{x \\to 0} \\frac{x + 3}{x + 1}$ e obteve $1$. Qual é o valor correto do limite?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\infty$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quanto vale $\\displaystyle\\lim_{x \\to \\infty} \\left(1 + \\frac{1}{x}\\right)^x$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "$e$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Diferencial e aproximação linear",
                blocks: [
                    {
                        type: "text",
                        value: "## A reta tangente como aproximação\n\nPerto de um ponto, uma função derivável se parece muito com sua reta tangente. Essa ideia simples é a base da **aproximação linear**: usamos a reta tangente em $x = a$ para estimar valores de $f$ próximos de $a$.\n\nA reta tangente em $a$ tem equação\n\n$$L(x) = f(a) + f'(a)(x - a),$$\n\nchamada de **linearização** de $f$ em $a$. Para $x$ perto de $a$, temos $f(x) \\approx L(x)$. Quanto mais perto de $a$, melhor a aproximação.",
                    },
                    {
                        type: "text",
                        value: "## O diferencial\n\nUma linguagem próxima é a dos **diferenciais**. Se $y = f(x)$, definimos\n\n$$dy = f'(x)\\, dx,$$\n\nonde $dx$ é uma pequena variação em $x$ e $dy$ é a variação correspondente ao longo da reta tangente. A variação real da função, $\\Delta y = f(x + dx) - f(x)$, é bem aproximada por $dy$ quando $dx$ é pequeno:\n\n$$\\Delta y \\approx dy = f'(x)\\, dx.$$\n\nOs diferenciais são especialmente úteis para estimar como pequenos erros de medida se propagam.",
                    },
                    {
                        type: "quote",
                        value: "A reta tangente é o melhor palpite linear que a função nos oferece sobre o que acontece logo ali ao lado.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: estimando uma raiz\n\nVamos aproximar $\\sqrt{4{,}1}$ sem calculadora. Tome $f(x) = \\sqrt{x}$ e $a = 4$, pois $\\sqrt{4} = 2$ é conhecido. Temos $f'(x) = \\dfrac{1}{2\\sqrt{x}}$, logo $f'(4) = \\dfrac{1}{4}$.\n\nA linearização é\n\n$$L(x) = 2 + \\frac{1}{4}(x - 4).$$\n\nAvaliando em $x = 4{,}1$:\n\n$$\\sqrt{4{,}1} \\approx L(4{,}1) = 2 + \\frac{1}{4}(0{,}1) = 2 + 0{,}025 = 2{,}025.$$\n\nO valor real é $2{,}0248\\ldots$, então o erro é minúsculo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: uma raiz cúbica\n\nAgora estimamos $\\sqrt[3]{8{,}1}$. Seja $f(x) = x^{1/3}$ e $a = 8$, com $f(8) = 2$. A derivada é $f'(x) = \\dfrac{1}{3} x^{-2/3}$, então $f'(8) = \\dfrac{1}{3} \\cdot \\dfrac{1}{4} = \\dfrac{1}{12}$.\n\nA linearização dá\n\n$$\\sqrt[3]{8{,}1} \\approx 2 + \\frac{1}{12}(0{,}1) = 2 + 0{,}0083 = 2{,}0083.$$\n\nDe novo, muito próximo do valor verdadeiro.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: propagação de erro\n\nO raio de um círculo é medido como $5$ cm, com incerteza de $\\pm 0{,}1$ cm. Qual o erro estimado na área?\n\nCom $A = \\pi r^2$, o diferencial é\n\n$$dA = 2\\pi r \\, dr.$$\n\nUsando $r = 5$ e $dr = 0{,}1$:\n\n$$dA = 2\\pi (5)(0{,}1) = \\pi \\approx 3{,}14 \\text{ cm}^2.$$\n\nUm pequeno erro no raio se traduz num erro de cerca de $3{,}14 \\text{ cm}^2$ na área. Note como o diferencial transforma incerteza de medida em incerteza no resultado.",
                    },
                    {
                        type: "text",
                        value: "## Sobre a qualidade da aproximação\n\nA aproximação linear é tão boa quanto $x$ estiver perto de $a$ e quanto menos a função se curvar por ali. Dois pontos práticos:\n\n- **Erro relativo.** Para $y = f(x)$, o erro relativo se propaga por $\\dfrac{dy}{y}$. Em $y = x^n$, por exemplo, $\\dfrac{dy}{y} = n \\dfrac{dx}{x}$: um erro de $1\\%$ em $x$ vira cerca de $n\\%$ em $y$.\n- **Distância importa.** Longe de $a$, a curvatura faz a reta tangente se afastar da função, e a estimativa perde precisão.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A linearização $L(x) = f(a) + f'(a)(x - a)$ aproxima $f$ perto de $a$.\n- O diferencial $dy = f'(x)\\, dx$ estima a variação de $f$ e a propagação de erros.\n- Boas escolhas de $a$ (valores conhecidos como $\\sqrt{4}$ ou $\\sqrt[3]{8}$) tornam a conta simples.\n- Em potências $y = x^n$, o erro relativo se multiplica por $n$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Usando a aproximação linear de $f(x) = \\sqrt{x}$ em $a = 4$, qual é a estimativa de $\\sqrt{4{,}1}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$2{,}025$",
                                isCorrect: true,
                            },
                            {
                                text: "$2{,}05$",
                                isCorrect: false,
                            },
                            {
                                text: "$2{,}1$",
                                isCorrect: false,
                            },
                            {
                                text: "$2{,}005$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a linearização de $f(x) = x^2$ em $a = 3$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$L(x) = 9 + 6(x - 3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$L(x) = 6 + 9(x - 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$L(x) = 9 + 3(x - 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$L(x) = 3 + 6(x - 3)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sabendo que a linearização de $e^x$ em $a = 0$ é $L(x) = 1 + x$, qual a estimativa de $e^{0{,}2}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1{,}02$",
                                isCorrect: false,
                            },
                            {
                                text: "$1{,}2$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}8$",
                                isCorrect: false,
                            },
                            {
                                text: "$2{,}0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O raio de um círculo é medido como $5$ cm com erro de $0{,}1$ cm. Usando diferenciais, qual o erro estimado na área?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\pi \\text{ cm}^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$2\\pi \\text{ cm}^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$5\\pi \\text{ cm}^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}5\\pi \\text{ cm}^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A aresta de um cubo é medida com erro relativo de $1\\%$. Qual é, aproximadamente, o erro relativo no volume?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$1\\%$",
                                isCorrect: false,
                            },
                            {
                                text: "$3\\%$",
                                isCorrect: true,
                            },
                            {
                                text: "$9\\%$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}3\\%$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O método de Newton",
                blocks: [
                    {
                        type: "text",
                        value: "## Encontrando raízes por aproximação\n\nMuitas equações não têm solução por fórmula fechada. Como resolver $x^3 - x - 1 = 0$ ou $\\cos x = x$? O **método de Newton** (ou Newton-Raphson) é um processo iterativo que produz aproximações cada vez melhores para uma raiz de $f(x) = 0$.\n\nA ideia geométrica é elegante: partindo de um chute inicial, seguimos a reta tangente até ela cruzar o eixo $x$, e esse cruzamento vira o próximo chute. Repetindo, chegamos muito perto da raiz.",
                    },
                    {
                        type: "text",
                        value: "## De onde vem a fórmula\n\nNo ponto $x_n$, a reta tangente ao gráfico de $f$ é\n\n$$y = f(x_n) + f'(x_n)(x - x_n).$$\n\nQueremos onde essa reta cruza o eixo $x$, isto é, $y = 0$. Isolando $x$:\n\n$$0 = f(x_n) + f'(x_n)(x - x_n) \\quad\\Rightarrow\\quad x = x_n - \\frac{f(x_n)}{f'(x_n)}.$$\n\nChamamos esse valor de $x_{n+1}$. A **fórmula de Newton** é, portanto,\n\n$$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}.$$\n\nRepare no sinal de menos e na ordem $\\dfrac{f}{f'}$: trocá-los é um erro clássico.",
                    },
                    {
                        type: "quote",
                        value: "Cada passo do método corrige o anterior, e a resposta certa emerge da repetição paciente.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: calculando a raiz de 2\n\nPara aproximar $\\sqrt{2}$, buscamos a raiz positiva de $f(x) = x^2 - 2$, com $f'(x) = 2x$. A fórmula fica\n\n$$x_{n+1} = x_n - \\frac{x_n^2 - 2}{2x_n} = \\frac{1}{2}\\left(x_n + \\frac{2}{x_n}\\right).$$\n\nComeçando com $x_0 = 1$:\n\n| n | xₙ | f(xₙ) |\n| --- | --- | --- |\n| 0 | 1,000000 | -1,000000 |\n| 1 | 1,500000 | 0,250000 |\n| 2 | 1,416667 | 0,006944 |\n| 3 | 1,414216 | 0,000006 |\n\nEm apenas três passos chegamos a $1{,}414216$, praticamente $\\sqrt{2} = 1{,}414214\\ldots$. A convergência é impressionantemente rápida.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: uma equação sem fórmula\n\nVamos resolver $x^3 - x - 1 = 0$, que não tem solução simples. Aqui $f(x) = x^3 - x - 1$ e $f'(x) = 3x^2 - 1$, então\n\n$$x_{n+1} = x_n - \\frac{x_n^3 - x_n - 1}{3x_n^2 - 1}.$$\n\nCom $x_0 = 1{,}5$:\n\n$$x_1 = 1{,}5 - \\frac{3{,}375 - 1{,}5 - 1}{6{,}75 - 1} = 1{,}5 - \\frac{0{,}875}{5{,}75} \\approx 1{,}3478.$$\n\nRepetindo o processo, $x_2 \\approx 1{,}3251$ e $x_3 \\approx 1{,}3247$. A raiz é aproximadamente $1{,}3247$, um número que nenhuma fórmula elementar entrega.",
                    },
                    {
                        type: "text",
                        value: "## Quando o método falha\n\nNewton é rápido, mas não infalível. Ele pode dar errado quando:\n\n- **A derivada se anula.** Se $f'(x_n) = 0$, a reta tangente é horizontal e a fórmula tenta dividir por zero.\n- **O chute inicial é ruim.** Longe da raiz, as iterações podem divergir ou pular para outra raiz.\n- **As iterações entram em ciclo.** Em certos casos, os valores ficam alternando sem nunca convergir.\n\nNa prática, um bom chute inicial (olhando o gráfico ou usando o teorema do valor intermediário) resolve a maioria dos problemas.",
                    },
                    {
                        type: "text",
                        value: "## Uma convergência veloz\n\nQuando funciona, o método de Newton tem **convergência quadrática**: a cada passo, o número de casas decimais corretas aproximadamente dobra. Foi o que vimos ao calcular $\\sqrt{2}$, em que três iterações já bastaram para seis casas certas.\n\nEssa rapidez explica por que o método está por trás de muitas rotinas de raiz quadrada e resolução de equações em calculadoras e computadores.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O método de Newton aproxima raízes de $f(x) = 0$ por iterações sucessivas.\n- A fórmula é $x_{n+1} = x_n - \\dfrac{f(x_n)}{f'(x_n)}$, obtida da reta tangente.\n- A convergência é muito rápida (quadrática) perto da raiz, mas depende de um bom chute inicial.\n- O método falha se $f'(x_n) = 0$ ou se o ponto de partida for inadequado.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Seja $f(x) = x^2 - 2$ com $x_0 = 1$. Qual é $x_1$ pelo método de Newton?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1{,}5$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}5$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a fórmula de iteração do método de Newton?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x_{n+1} = x_n - \\dfrac{f(x_n)}{f'(x_n)}$",
                                isCorrect: true,
                            },
                            {
                                text: "$x_{n+1} = x_n + \\dfrac{f(x_n)}{f'(x_n)}$",
                                isCorrect: false,
                            },
                            {
                                text: "$x_{n+1} = x_n - \\dfrac{f'(x_n)}{f(x_n)}$",
                                isCorrect: false,
                            },
                            {
                                text: "$x_{n+1} = x_n - f(x_n) \\cdot f'(x_n)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $f(x) = x^3 - 2$ com $x_0 = 1$. Qual é $x_1$ pelo método de Newton?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\dfrac{4}{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{2}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{3}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em qual situação o método de Newton pode falhar por não ser aplicável?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "quando a derivada $f'(x_n)$ se anula",
                                isCorrect: true,
                            },
                            {
                                text: "quando a função $f(x_n)$ se anula",
                                isCorrect: false,
                            },
                            {
                                text: "quando o chute inicial $x_0$ é positivo",
                                isCorrect: false,
                            },
                            {
                                text: "quando $f$ é contínua no intervalo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $f(x) = x^2 - 5$ com $x_0 = 2$. Após duas iterações de Newton, qual é o valor aproximado de $x_2$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$2{,}236$",
                                isCorrect: true,
                            },
                            {
                                text: "$2{,}250$",
                                isCorrect: false,
                            },
                            {
                                text: "$2{,}200$",
                                isCorrect: false,
                            },
                            {
                                text: "$2{,}500$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Integral",
        aulas: [
            {
                titulo: "Antiderivadas e a integral indefinida",
                blocks: [
                    {
                        type: "text",
                        value: "## Antiderivadas\n\nAté aqui você aprendeu a derivar: dada uma função $F$, encontrar sua derivada $F'$. Agora vamos inverter a pergunta. Dada uma função $f$, queremos achar uma função $F$ cuja derivada seja exatamente $f$. Essa função $F$ é chamada de **antiderivada** (ou primitiva) de $f$.\n\nFormalmente, $F$ é uma antiderivada de $f$ em um intervalo $I$ quando\n$$F'(x) = f(x)$$\npara todo $x$ em $I$. Por exemplo, $F(x) = x^2$ é uma antiderivada de $f(x) = 2x$, pois $F'(x) = 2x$.",
                    },
                    {
                        type: "text",
                        value: "## A constante de integração\n\nRepare que $x^2$, $x^2 + 1$ e $x^2 - 7$ têm todas a mesma derivada, $2x$. Como a derivada de uma constante é zero, existem infinitas antiderivadas de $f$, e todas diferem apenas por uma constante.\n\nPor isso escrevemos a antiderivada geral com uma constante $C$ livre:\n$$\\int f(x)\\, dx = F(x) + C$$\n\nEssa expressão é a **integral indefinida** de $f$. O símbolo $\\int$ é o sinal de integral, $f(x)$ é o integrando e $dx$ indica que a variável de integração é $x$. Esquecer o $+C$ é o erro mais comum do capítulo.",
                    },
                    {
                        type: "quote",
                        value: "Integrar é desfazer a derivada: a pergunta deixa de ser qual a taxa de variação e passa a ser de qual função ela veio.",
                    },
                    {
                        type: "text",
                        value: "## Regras básicas\n\nAs regras de integração vêm diretamente das regras de derivação, lidas de trás para frente. A mais usada é a regra da potência:\n$$\\int x^n\\, dx = \\frac{x^{n+1}}{n+1} + C, \\quad n \\neq -1$$\n\nO caso $n = -1$ fica de fora porque dividiríamos por zero; ele é tratado pelo logaritmo. Além disso, valem a regra da constante multiplicativa e a da soma:\n$$\\int k\\, f(x)\\, dx = k \\int f(x)\\, dx, \\qquad \\int [f(x) \\pm g(x)]\\, dx = \\int f(x)\\, dx \\pm \\int g(x)\\, dx$$\n\nA tabela a seguir reúne as integrais imediatas mais frequentes.\n\n| Função | Integral |\n| --- | --- |\n| $k$ constante | $kx + C$ |\n| $x^n$ com $n \\neq -1$ | $\\dfrac{x^{n+1}}{n+1} + C$ |\n| $\\dfrac{1}{x}$ | $\\ln \\lvert x \\rvert + C$ |\n| $e^x$ | $e^x + C$ |\n| $\\cos x$ | $\\sin x + C$ |\n| $\\sin x$ | $-\\cos x + C$ |\n| $\\sec^2 x$ | $\\tan x + C$ |",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nVamos calcular $\\int (3x^2 + 4x - 5)\\, dx$.\n\nIntegramos termo a termo, usando a regra da potência em cada parcela:\n$$\\int 3x^2\\, dx = 3 \\cdot \\frac{x^3}{3} = x^3, \\qquad \\int 4x\\, dx = 4 \\cdot \\frac{x^2}{2} = 2x^2, \\qquad \\int (-5)\\, dx = -5x$$\n\nSomando tudo e acrescentando uma única constante:\n$$\\int (3x^2 + 4x - 5)\\, dx = x^3 + 2x^2 - 5x + C$$\n\nPara conferir, basta derivar o resultado: a derivada de $x^3 + 2x^2 - 5x + C$ é $3x^2 + 4x - 5$, que é o integrando original.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nAgora $\\int \\left( \\sqrt{x} + \\dfrac{1}{x^2} \\right) dx$. O truque é reescrever tudo como potência de $x$ antes de integrar:\n$$\\sqrt{x} = x^{1/2}, \\qquad \\frac{1}{x^2} = x^{-2}$$\n\nAplicando a regra da potência a cada uma:\n$$\\int x^{1/2}\\, dx = \\frac{x^{3/2}}{3/2} = \\frac{2}{3} x^{3/2}, \\qquad \\int x^{-2}\\, dx = \\frac{x^{-1}}{-1} = -\\frac{1}{x}$$\n\nPortanto,\n$$\\int \\left( \\sqrt{x} + \\frac{1}{x^2} \\right) dx = \\frac{2}{3} x^{3/2} - \\frac{1}{x} + C$$",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nUma antiderivada de $f$ é qualquer função $F$ com $F'(x) = f(x)$. A integral indefinida $\\int f(x)\\, dx = F(x) + C$ reúne todas elas por meio da constante $C$. As ferramentas centrais são a regra da potência $\\int x^n\\, dx = \\frac{x^{n+1}}{n+1} + C$ (válida para $n \\neq -1$) e a linearidade, que permite integrar somas e constantes multiplicativas termo a termo. Sempre que possível, confira derivando o resultado, e nunca esqueça o $+C$.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o valor de $\\int 3x^2\\, dx$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$6x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^3 + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$3x^3 + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\int 7\\, dx$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$7 + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{7x^2}{2} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$7x + C$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Uma antiderivada de $f(x) = \\cos x$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sin x$",
                                isCorrect: true,
                            },
                            {
                                text: "$-\\sin x$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\cos x$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tan x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\int \\dfrac{1}{x}\\, dx$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-\\dfrac{1}{x^2} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\ln(x^2) + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\ln|x| + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{1}{2x^2} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o valor de $\\int \\left( \\sqrt{x} + \\dfrac{1}{x^2} \\right) dx$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\dfrac{2}{3}x^{3/2} + \\dfrac{1}{x} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{2}{3}x^{3/2} - \\dfrac{1}{x} + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{3}{2}x^{3/2} - \\dfrac{1}{x} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{2\\sqrt{x}} - \\dfrac{2}{x^3} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Área e a integral definida",
                blocks: [
                    {
                        type: "text",
                        value: "## O problema da área\n\nA segunda grande ideia do cálculo nasce de uma pergunta geométrica simples: qual é a área da região limitada pelo gráfico de uma função positiva $y = f(x)$, pelo eixo $x$ e pelas retas verticais $x = a$ e $x = b$?\n\nPara retângulos e triângulos sabemos responder na hora. Mas quando o topo da região é uma curva qualquer, precisamos de uma estratégia nova: aproximar a área por fatias que sabemos medir.",
                    },
                    {
                        type: "text",
                        value: "## Somas de Riemann\n\nDividimos o intervalo $[a, b]$ em $n$ subintervalos de mesma largura\n$$\\Delta x = \\frac{b - a}{n}$$\n\nEm cada subintervalo escolhemos um ponto $x_i^*$ e construímos um retângulo de altura $f(x_i^*)$ e base $\\Delta x$. A soma das áreas desses retângulos é a **soma de Riemann**:\n$$\\sum_{i=1}^{n} f(x_i^*)\\, \\Delta x$$\n\nQuanto maior o número de retângulos, mais fina é cada fatia e melhor a aproximação da área verdadeira.",
                    },
                    {
                        type: "quote",
                        value: "Antes de somar infinitos retângulos, lembre que a integral definida nasceu de uma ideia simples: aproximar uma área por fatias cada vez mais finas.",
                    },
                    {
                        type: "text",
                        value: "## A integral definida\n\nA **integral definida** de $f$ de $a$ até $b$ é o limite das somas de Riemann quando o número de retângulos cresce indefinidamente:\n$$\\int_a^b f(x)\\, dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i^*)\\, \\Delta x$$\n\nAqui $a$ é o limite inferior e $b$ o limite superior de integração. Diferente da integral indefinida, que é uma família de funções, a integral definida é um número. Quando $f(x) \\geq 0$ em $[a, b]$, esse número é exatamente a área sob a curva.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades\n\nDa definição seguem propriedades que facilitam os cálculos:\n$$\\int_a^a f(x)\\, dx = 0, \\qquad \\int_b^a f(x)\\, dx = -\\int_a^b f(x)\\, dx$$\n$$\\int_a^b k\\, dx = k(b - a), \\qquad \\int_a^b k\\, f(x)\\, dx = k \\int_a^b f(x)\\, dx$$\n$$\\int_a^b [f(x) + g(x)]\\, dx = \\int_a^b f(x)\\, dx + \\int_a^b g(x)\\, dx$$\n\nInverter os limites troca o sinal, e integrar de um ponto até ele mesmo dá zero.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nEnquanto não temos uma fórmula geral, dá para calcular algumas integrais definidas pela geometria da região.\n\nConsidere $\\int_0^2 x\\, dx$. A região sob a reta $y = x$, entre $x = 0$ e $x = 2$, é um triângulo de base $2$ e altura $2$. Logo,\n$$\\int_0^2 x\\, dx = \\frac{1}{2} \\cdot 2 \\cdot 2 = 2$$\n\nOutro caso elegante: $\\int_{-2}^{2} \\sqrt{4 - x^2}\\, dx$. O gráfico de $y = \\sqrt{4 - x^2}$ é a metade superior do círculo de raio $2$. A área desse semicírculo é\n$$\\frac{1}{2} \\pi r^2 = \\frac{1}{2} \\pi (2)^2 = 2\\pi$$",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nA integral definida $\\int_a^b f(x)\\, dx$ é o limite das somas de Riemann $\\sum f(x_i^*)\\, \\Delta x$ com $\\Delta x = \\frac{b-a}{n}$. Ela é um número, e para $f \\geq 0$ representa a área sob a curva entre $a$ e $b$. Vale a linearidade, inverter os limites troca o sinal e $\\int_a^a f = 0$. Em regiões simples como triângulos e semicírculos, a própria geometria fornece o valor da integral. Na próxima aula veremos um atalho poderoso para calcular essas integrais sem recorrer a limites.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Interpretando geometricamente, quanto vale $\\int_0^2 x\\, dx$ (área do triângulo sob a reta $y = x$)?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$8$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\int_a^a f(x)\\, dx$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(a)$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "$a$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\int_2^5 3\\, dx$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$9$",
                                isCorrect: true,
                            },
                            {
                                text: "$15$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na soma de Riemann para $[1, 5]$ com $n = 4$ subintervalos, qual é a largura $\\Delta x$?",
                        difficulty: "medio",
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
                                text: "$\\dfrac{1}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sabendo que $y = \\sqrt{9 - x^2}$ é o semicírculo superior de raio $3$, quanto vale $\\int_{-3}^{3} \\sqrt{9 - x^2}\\, dx$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$9\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{9\\pi}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{9\\pi}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$18\\pi$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O Teorema Fundamental do Cálculo",
                blocks: [
                    {
                        type: "text",
                        value: "## Duas ideias que se encontram\n\nNos módulos anteriores tratamos de dois problemas que pareciam independentes: o da tangente, que levou à derivada, e o da área, que levou à integral definida. O **Teorema Fundamental do Cálculo** (TFC) revela que esses dois problemas são, na verdade, um só, ligados por uma relação de operações inversas.",
                    },
                    {
                        type: "quote",
                        value: "O teorema fundamental é a ponte que liga o problema da tangente ao problema da área, as duas grandes questões que deram origem ao cálculo.",
                    },
                    {
                        type: "text",
                        value: "## Primeira parte\n\nSe $f$ é contínua em $[a, b]$, definimos a função área acumulada\n$$g(x) = \\int_a^x f(t)\\, dt$$\n\nA primeira parte do teorema afirma que $g$ é derivável e que sua derivada é a própria $f$:\n$$g'(x) = \\frac{d}{dx} \\int_a^x f(t)\\, dt = f(x)$$\n\nEm palavras: derivar uma integral desfaz a integração. Por isso dizemos que derivada e integral são operações inversas.",
                    },
                    {
                        type: "text",
                        value: "## Segunda parte\n\nA segunda parte é a que usamos para calcular. Se $f$ é contínua em $[a, b]$ e $F$ é **qualquer** antiderivada de $f$, então\n$$\\int_a^b f(x)\\, dx = F(b) - F(a)$$\n\nOu seja, para avaliar uma integral definida basta achar uma antiderivada $F$ e calcular a diferença $F(b) - F(a)$. Costumamos escrever esse passo com a notação\n$$\\int_a^b f(x)\\, dx = \\Big[ F(x) \\Big]_a^b = F(b) - F(a)$$\n\nComo a constante $C$ apareceria em $F(b)$ e em $F(a)$, ela se cancela na subtração. Por isso não precisamos do $+C$ nas integrais definidas.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nVamos calcular $\\int_1^3 x^2\\, dx$. Uma antiderivada de $x^2$ é $F(x) = \\dfrac{x^3}{3}$. Aplicando o TFC:\n$$\\int_1^3 x^2\\, dx = \\left[ \\frac{x^3}{3} \\right]_1^3 = \\frac{3^3}{3} - \\frac{1^3}{3} = \\frac{27}{3} - \\frac{1}{3} = \\frac{26}{3}$$\n\nNote como o resultado é apenas um número, obtido sem nenhum limite de somas de Riemann.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nAgora $\\int_0^{\\pi} \\sin x\\, dx$. A antiderivada de $\\sin x$ é $-\\cos x$. Cuidado com o sinal:\n$$\\int_0^{\\pi} \\sin x\\, dx = \\Big[ -\\cos x \\Big]_0^{\\pi} = (-\\cos \\pi) - (-\\cos 0)$$\n\nComo $\\cos \\pi = -1$ e $\\cos 0 = 1$,\n$$= -(-1) - (-1) = 1 + 1 = 2$$\n\nO erro clássico aqui é usar $\\cos x$ no lugar de $-\\cos x$ e chegar a $-2$. Um resultado negativo para a área sob $\\sin x$ entre $0$ e $\\pi$, região inteiramente acima do eixo, já seria um sinal de que algo saiu errado.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nO Teorema Fundamental do Cálculo une derivada e integral. A primeira parte diz que $\\frac{d}{dx}\\int_a^x f(t)\\, dt = f(x)$: derivar desfaz o integrar. A segunda parte fornece a receita de cálculo: $\\int_a^b f(x)\\, dx = F(b) - F(a)$, onde $F$ é qualquer antiderivada de $f$. Achar $F$, avaliar em $b$ e em $a$ e subtrair, nessa ordem, resolve qualquer integral definida de função contínua. Trocar a ordem para $F(a) - F(b)$ inverte o sinal do resultado.",
                    },
                ],
                questions: [
                    {
                        statement: "Aplicando o TFC, quanto vale $\\int_1^2 x\\, dx$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{3}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Aplicando o TFC, quanto vale $\\int_0^1 x^2\\, dx$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\dfrac{1}{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\int_0^{\\pi} \\sin x\\, dx$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-2$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo o TFC, se $F$ é uma antiderivada de $f$, então $\\int_a^b f(x)\\, dx$ é igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$F(b) - F(a)$",
                                isCorrect: true,
                            },
                            {
                                text: "$F(a) - F(b)$",
                                isCorrect: false,
                            },
                            {
                                text: "$F(b) + F(a)$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(b) - f(a)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\int_1^{e} \\dfrac{1}{x}\\, dx$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$e$",
                                isCorrect: false,
                            },
                            {
                                text: "$e - 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Integração por substituição",
                blocks: [
                    {
                        type: "text",
                        value: "## A regra da cadeia ao contrário\n\nNem toda integral se resolve por regras diretas. Como integrar $\\int 2x(x^2 + 1)^3\\, dx$? Expandir o cubo seria trabalhoso. A **integração por substituição** oferece um caminho melhor: ela é a regra da cadeia lida de trás para frente.\n\nA ideia é trocar de variável para transformar uma integral complicada em uma integral imediata.",
                    },
                    {
                        type: "text",
                        value: "## O método\n\nSe $u = g(x)$ é uma função derivável e $f$ é contínua, então\n$$\\int f(g(x))\\, g'(x)\\, dx = \\int f(u)\\, du$$\n\nA peça que faz a mágica funcionar é a diferencial. De $u = g(x)$ obtemos\n$$du = g'(x)\\, dx$$\n\nNa prática, seguimos cinco passos: escolher $u$ (em geral a função interna), calcular $du$, reescrever toda a integral em termos de $u$ e $du$, integrar e, por fim, voltar para a variável $x$. Se sobrar algum $x$ solto depois da troca, a escolha de $u$ não foi a ideal.",
                    },
                    {
                        type: "quote",
                        value: "Toda substituição bem escolhida transforma uma integral assustadora em uma que você já sabe resolver.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nCalcular $\\int 2x(x^2 + 1)^3\\, dx$.\n\nEscolhemos $u = x^2 + 1$, a função interna. Então $du = 2x\\, dx$, e repare que o fator $2x\\, dx$ já aparece inteiro na integral. Substituindo:\n$$\\int 2x(x^2 + 1)^3\\, dx = \\int u^3\\, du = \\frac{u^4}{4} + C$$\n\nVoltando para $x$:\n$$= \\frac{(x^2 + 1)^4}{4} + C$$\n\nO passo mais esquecido é o $du$: sem trocar $2x\\, dx$ por $du$, a integral fica misturando as duas variáveis e não se resolve.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nCalcular $\\int \\cos(5x)\\, dx$.\n\nAqui $u = 5x$, logo $du = 5\\, dx$, ou seja $dx = \\dfrac{du}{5}$. Substituindo:\n$$\\int \\cos(5x)\\, dx = \\int \\cos u \\cdot \\frac{du}{5} = \\frac{1}{5} \\int \\cos u\\, du = \\frac{1}{5} \\sin u + C$$\n\nVoltando para $x$:\n$$= \\frac{1}{5} \\sin(5x) + C$$\n\nQuando $du$ traz uma constante a mais, nós a ajustamos passando o fator para fora da integral.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 3\n\nEm integrais definidas, uma opção prática é trocar também os limites de integração para a nova variável, evitando voltar a $x$.\n\nCalcular $\\int_0^1 2x(x^2 + 1)^3\\, dx$. Com $u = x^2 + 1$ e $du = 2x\\, dx$, atualizamos os limites: quando $x = 0$, $u = 1$; quando $x = 1$, $u = 2$. Assim,\n$$\\int_0^1 2x(x^2 + 1)^3\\, dx = \\int_1^2 u^3\\, du = \\left[ \\frac{u^4}{4} \\right]_1^2 = \\frac{16}{4} - \\frac{1}{4} = \\frac{15}{4}$$",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nA integração por substituição inverte a regra da cadeia. Escolhe-se $u = g(x)$, calcula-se $du = g'(x)\\, dx$ e reescreve-se a integral inteira em termos de $u$, incluindo o $du$. Depois de integrar, volta-se para $x$ (ou, em integrais definidas, trocam-se os limites para $u$). A boa escolha de $u$ costuma ser a função interna, aquela cuja derivada aparece, a menos de uma constante, multiplicando o resto do integrando. Esquecer o $du$ é o erro mais comum do método.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Em $\\int 2x(x^2 + 1)^3\\, dx$, tomando $u = x^2 + 1$, quanto vale $du$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$du = 2x$",
                                isCorrect: false,
                            },
                            {
                                text: "$du = 2x\\, dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$du = x\\, dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$du = (x^2 + 1)\\, dx$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\int 2x(x^2 + 1)^3\\, dx$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(x^2 + 1)^4 + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{(x^2 + 1)^4}{4} + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{(x^2 + 1)^3}{3} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{(x^2 + 1)^4}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\int \\cos(5x)\\, dx$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\sin(5x) + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$5\\sin(5x) + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{5}\\sin(5x) + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$-\\dfrac{1}{5}\\sin(5x) + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a melhor escolha de $u$ para resolver $\\int 3x^2(x^3 + 2)^5\\, dx$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$u = x^3 + 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$u = 3x^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$u = x^3$",
                                isCorrect: false,
                            },
                            {
                                text: "$u = (x^3 + 2)^5$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Trocando os limites para a variável $u$, quanto vale $\\int_0^1 2x(x^2 + 1)^3\\, dx$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$15$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{15}{4}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{15}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Cálculo de áreas com a integral",
                blocks: [
                    {
                        type: "text",
                        value: "## Área sob uma curva\n\nCom o Teorema Fundamental do Cálculo em mãos, calcular áreas vira rotina. Se $f(x) \\geq 0$ em $[a, b]$, a área da região entre o gráfico de $f$ e o eixo $x$ é\n$$A = \\int_a^b f(x)\\, dx$$\n\nPor exemplo, a área sob $y = x^2$ de $x = 0$ a $x = 3$ é\n$$A = \\int_0^3 x^2\\, dx = \\left[ \\frac{x^3}{3} \\right]_0^3 = \\frac{27}{3} = 9$$",
                    },
                    {
                        type: "text",
                        value: "## Quando a curva fica abaixo do eixo\n\nSe $f(x) \\leq 0$ em parte do intervalo, a integral fica negativa, pois os retângulos de Riemann têm altura negativa. Como área é sempre positiva, tomamos o valor absoluto. A área entre o gráfico e o eixo $x$ é\n$$A = \\int_a^b |f(x)|\\, dx$$\n\nNa prática, identificamos onde $f$ é negativa e trocamos o sinal daquela parte da integral. Confundir o valor da integral com a área é um erro frequente quando a curva cruza o eixo.",
                    },
                    {
                        type: "quote",
                        value: "Calcular área com integral é escolher bem quem está por cima, quem está por baixo e onde as curvas se encontram.",
                    },
                    {
                        type: "text",
                        value: "## Área entre duas curvas\n\nPara a região entre duas curvas, com $f(x) \\geq g(x)$ em $[a, b]$, a área é a integral da diferença entre a curva de cima e a de baixo:\n$$A = \\int_a^b [f(x) - g(x)]\\, dx$$\n\nQuando os limites $a$ e $b$ não são dados, nós os encontramos resolvendo $f(x) = g(x)$, que fornece os pontos onde as curvas se cruzam. O sinal da diferença importa: subtrair a de baixo da de cima garante um integrando positivo e, portanto, uma área positiva.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nCalcular a área entre $y = x$ e $y = x^2$.\n\nPrimeiro achamos as interseções resolvendo $x = x^2$, isto é, $x^2 - x = 0$, ou $x(x - 1) = 0$. As curvas se cruzam em $x = 0$ e $x = 1$. Entre esses pontos, $x \\geq x^2$, então a reta está por cima. Logo,\n$$A = \\int_0^1 (x - x^2)\\, dx = \\left[ \\frac{x^2}{2} - \\frac{x^3}{3} \\right]_0^1 = \\frac{1}{2} - \\frac{1}{3} = \\frac{1}{6}$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nCalcular a área da região limitada por $y = 4 - x^2$ e o eixo $x$.\n\nA parábola corta o eixo onde $4 - x^2 = 0$, ou seja, em $x = -2$ e $x = 2$. Entre esses pontos $4 - x^2 \\geq 0$, então a região está acima do eixo e a área é a própria integral:\n$$A = \\int_{-2}^{2} (4 - x^2)\\, dx = \\left[ 4x - \\frac{x^3}{3} \\right]_{-2}^{2}$$\n\nAvaliando nos limites:\n$$= \\left( 8 - \\frac{8}{3} \\right) - \\left( -8 + \\frac{8}{3} \\right) = 16 - \\frac{16}{3} = \\frac{32}{3}$$",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nA área sob uma curva positiva é $\\int_a^b f(x)\\, dx$. Se a curva fica abaixo do eixo, a integral é negativa e a área pede o valor absoluto. Para a região entre duas curvas, integra-se a diferença entre a de cima e a de baixo, $\\int_a^b [f(x) - g(x)]\\, dx$, encontrando os limites, quando necessário, pela igualdade $f(x) = g(x)$. O cuidado central é sempre identificar quem está por cima e onde as curvas se cruzam antes de montar a integral.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a área sob a curva $y = x^2$ de $x = 0$ a $x = 3$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$9$",
                                isCorrect: true,
                            },
                            {
                                text: "$27$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x) \\geq g(x)$ em $[a, b]$, a área entre as curvas é dada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\int_a^b [f(x) - g(x)]\\, dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\int_a^b [g(x) - f(x)]\\, dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_a^b [f(x) + g(x)]\\, dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_a^b f(x)\\, g(x)\\, dx$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Em quais pontos as curvas $y = x$ e $y = x^2$ se cruzam?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x = 1$ apenas",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 0$ e $x = 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 0$ apenas",
                                isCorrect: false,
                            },
                            {
                                text: "$x = -1$ e $x = 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a área da região entre $y = x$ e $y = x^2$ de $x = 0$ a $x = 1$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\dfrac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{5}{6}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{6}$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a área da região limitada por $y = 4 - x^2$ e o eixo $x$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\dfrac{16}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$16$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{32}{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{32}{6}$",
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
    mesclarSolucoes(MODULOS, "calculo1");
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
        const n = await backfillExplicacoes(trilha.id, MODULOS);
        console.log("Trilha " + NOME + " já existe; " + n + " explicações atualizadas.");
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
                        explanation: q.explanation ?? null,
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
