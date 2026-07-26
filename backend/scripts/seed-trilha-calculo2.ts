// Seed da trilha Cálculo 2 (técnicas de integração, séries e EDOs de 1ª ordem).
// Conteúdo autoral, quiz-only, com fórmulas em LaTeX ($...$ inline e $$...$$ em bloco).
// Idempotente: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-calculo2.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Cálculo 2";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Cálculo 2, a continuação do cálculo de uma variável: as técnicas de integração (por partes, substituição trigonométrica e frações parciais), as integrais impróprias, as aplicações da integral (área entre curvas, volumes por discos e por cascas, comprimento de arco e trabalho), as sequências e séries numéricas com os testes de convergência, as séries de potências e de Taylor e as equações diferenciais de 1ª ordem. As ferramentas de integração e de séries que aparecem em toda a engenharia e na física.";

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
        titulo: "Módulo 1 - Técnicas de integração I",
        aulas: [
            {
                titulo: "Integração por partes",
                blocks: [
                    {
                        type: "text",
                        value: "## Integração por partes\n\nA integração por partes é a contrapartida integral da **regra do produto** da derivação. Ela é a ferramenta natural para integrar produtos de funções de naturezas diferentes, como um polinômio multiplicando uma exponencial, ou até para integrar uma função isolada como $\\ln x$.\n\nPartindo da regra do produto, $\\frac{d}{dx}(uv) = u\\,\\frac{dv}{dx} + v\\,\\frac{du}{dx}$, e integrando os dois lados em relação a $x$, isolamos o primeiro termo e chegamos à fórmula central:\n\n$$\\int u\\,dv = uv - \\int v\\,du$$",
                    },
                    {
                        type: "text",
                        value: "## Como escolher $u$ e $dv$\n\nO sucesso do método depende de uma boa escolha: $u$ deve ser algo que **simplifica ao derivar**, e $dv$ algo que sabemos **integrar com facilidade**. Uma regra prática é o mnemônico **LIATE**, que dá a ordem de prioridade para escolher $u$:\n\n- **L**ogarítmica ($\\ln x$)\n- **I**nversa trigonométrica ($\\arctan x$)\n- **A**lgébrica ($x^n$)\n- **T**rigonométrica ($\\sin x$, $\\cos x$)\n- **E**xponencial ($e^x$)\n\nQuem aparece primeiro na lista vira $u$; o restante, junto com $dx$, vira $dv$. A ideia é que derivar a função da esquerda tende a simplificar o integrando.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: $\\int x e^x\\,dx$\n\nTemos o produto de uma função algébrica por uma exponencial. Por LIATE, escolhemos $u = x$ e $dv = e^x\\,dx$. Logo:\n\n$$u = x \\implies du = dx, \\qquad dv = e^x\\,dx \\implies v = e^x$$\n\nAplicando a fórmula:\n\n$$\\int x e^x\\,dx = x e^x - \\int e^x\\,dx = x e^x - e^x + C = e^x(x - 1) + C$$\n\nA integral que sobrou, $\\int e^x\\,dx$, é imediata. A escolha invertida ($u = e^x$, $dv = x\\,dx$) levaria a $\\int \\frac{x^2}{2}e^x\\,dx$, mais difícil que a original.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: $\\int x \\cos x\\,dx$\n\nProduto de algébrica por trigonométrica. Escolhemos $u = x$ e $dv = \\cos x\\,dx$:\n\n$$u = x \\implies du = dx, \\qquad dv = \\cos x\\,dx \\implies v = \\sin x$$\n\nEntão:\n\n$$\\int x \\cos x\\,dx = x \\sin x - \\int \\sin x\\,dx = x \\sin x + \\cos x + C$$\n\nAtenção ao sinal: como $\\int \\sin x\\,dx = -\\cos x$, o menos da fórmula vira mais na resposta final.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: $\\int \\ln x\\,dx$\n\nÀ primeira vista não há um produto, mas podemos escrever $dv = dx$ e deixar $u = \\ln x$. Esse é o truque clássico para integrar funções isoladas cuja derivada é mais simples que a primitiva:\n\n$$u = \\ln x \\implies du = \\frac{1}{x}\\,dx, \\qquad dv = dx \\implies v = x$$\n\nAssim:\n\n$$\\int \\ln x\\,dx = x \\ln x - \\int x \\cdot \\frac{1}{x}\\,dx = x \\ln x - \\int dx = x \\ln x - x + C$$",
                    },
                    {
                        type: "quote",
                        value: "Escolher u e dv é meio caminho andado: uma boa escolha transforma a integral, enquanto uma má escolha apenas a disfarça.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Fórmula: $\\int u\\,dv = uv - \\int v\\,du$, vinda da regra do produto.\n- Escolha $u$ pela ordem **LIATE**; o resto, com $dx$, é $dv$.\n- Boa escolha: $u$ simplifica ao derivar e $v$ é fácil de obter.\n- Casos típicos: $\\int x e^x\\,dx$, $\\int x \\cos x\\,dx$ e $\\int \\ln x\\,dx$.\n- Confira sempre o sinal ao integrar $\\sin$ e $\\cos$.",
                    },
                ],
                questions: [
                    {
                        statement: "Calcule a integral $\\int x e^x\\,dx$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x e^x - e^x + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$x e^x + e^x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$x e^x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{x^2}{2} e^x + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int x \\cos x\\,dx$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x \\sin x - \\cos x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\cos x + \\sin x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\sin x + \\cos x + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$-x \\sin x + \\cos x + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int \\ln x\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x \\ln x + x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\ln x - 1 + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{x} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\ln x - x + C$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int x \\sin x\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x \\cos x - \\sin x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$-x \\cos x + \\sin x + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$x \\cos x + \\sin x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$-x \\cos x - \\sin x + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int x e^{2x}\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{2} x e^{2x} + \\frac{1}{4} e^{2x} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2} x e^{2x} - \\frac{1}{2} e^{2x} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2} x e^{2x} - \\frac{1}{4} e^{2x} + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$2 x e^{2x} - 4 e^{2x} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Integração por partes repetida e cíclica",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando uma vez não basta\n\nÀs vezes uma única aplicação da integração por partes não resolve o problema: ou o grau do polinômio ainda é alto, ou a integral que sobra é tão difícil quanto a original. Duas situações merecem tratamento especial: a **integração por partes repetida** e a **integração por partes cíclica**.",
                    },
                    {
                        type: "text",
                        value: "## Partes repetida\n\nQuando $u$ é um polinômio de grau $n$, cada aplicação da fórmula reduz o grau em uma unidade. Repetindo o processo $n$ vezes, o polinômio some e a integral se fecha. É o caso de $\\int x^2 e^x\\,dx$, $\\int x^3 \\sin x\\,dx$ e semelhantes.\n\nA dica é manter a organização: a cada passo, o novo $u$ continua sendo a parte polinomial, que vai perdendo grau até virar constante.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: $\\int x^2 e^x\\,dx$\n\nComeçamos com $u = x^2$ e $dv = e^x\\,dx$, então $du = 2x\\,dx$ e $v = e^x$:\n\n$$\\int x^2 e^x\\,dx = x^2 e^x - \\int 2x e^x\\,dx = x^2 e^x - 2\\int x e^x\\,dx$$\n\nA integral $\\int x e^x\\,dx = e^x(x - 1)$ já foi calculada na aula anterior. Substituindo:\n\n$$\\int x^2 e^x\\,dx = x^2 e^x - 2 e^x(x - 1) + C = e^x(x^2 - 2x + 2) + C$$",
                    },
                    {
                        type: "text",
                        value: "## Partes cíclica\n\nEm integrais como $\\int e^x \\sin x\\,dx$, aplicar partes duas vezes faz **a integral original reaparecer** do lado direito. Em vez de um beco sem saída, isso é uma oportunidade: tratamos a integral como uma incógnita $I$, isolamos e resolvemos algebricamente.\n\nO detalhe crucial é manter a escolha **coerente** nos dois passos. Se no primeiro passo a exponencial foi $u$, no segundo ela também deve ser $u$. Trocar a escolha no meio do caminho desfaz o trabalho e devolve a integral inicial.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: $\\int e^x \\sin x\\,dx$\n\nChamemos $I = \\int e^x \\sin x\\,dx$. Tomando $u = e^x$ e $dv = \\sin x\\,dx$, temos $v = -\\cos x$:\n\n$$I = -e^x \\cos x + \\int e^x \\cos x\\,dx$$\n\nAplicamos partes de novo em $\\int e^x \\cos x\\,dx$, mantendo $u = e^x$ e $dv = \\cos x\\,dx$, logo $v = \\sin x$:\n\n$$\\int e^x \\cos x\\,dx = e^x \\sin x - \\int e^x \\sin x\\,dx = e^x \\sin x - I$$\n\nSubstituindo na primeira linha e isolando $I$:\n\n$$I = -e^x \\cos x + e^x \\sin x - I \\implies 2I = e^x(\\sin x - \\cos x)$$\n\n$$\\int e^x \\sin x\\,dx = \\frac{1}{2} e^x(\\sin x - \\cos x) + C$$",
                    },
                    {
                        type: "quote",
                        value: "Na integração cíclica a resposta não vem de integrar até o fim, e sim de reconhecer o padrão e resolver uma equação.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- **Repetida**: para $\\int P(x) e^{ax}\\,dx$, $\\int P(x)\\sin(ax)\\,dx$ e afins, aplique partes até o polinômio desaparecer, sempre mantendo o polinômio como $u$.\n- **Cíclica**: para $\\int e^{ax}\\sin(bx)\\,dx$ e $\\int e^{ax}\\cos(bx)\\,dx$, aplique partes duas vezes, escreva $I$ dos dois lados e isole.\n- Mantenha a escolha de $u$ coerente entre os passos na versão cíclica.\n- Resultados-chave: $\\int e^x \\sin x\\,dx = \\frac{1}{2}e^x(\\sin x - \\cos x) + C$ e $\\int e^x \\cos x\\,dx = \\frac{1}{2}e^x(\\sin x + \\cos x) + C$.",
                    },
                ],
                questions: [
                    {
                        statement: "Calcule a integral $\\int x^2 e^x\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$e^x(x^2 + 2x + 2) + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^x(x^2 - 2x + 2) + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$e^x(x^2 - 2x - 2) + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^x(x^2 - 2) + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int e^x \\sin x\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{2} e^x(\\sin x + \\cos x) + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2} e^x(\\cos x - \\sin x) + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^x(\\sin x - \\cos x) + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2} e^x(\\sin x - \\cos x) + C$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int e^x \\cos x\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{2} e^x(\\sin x + \\cos x) + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{2} e^x(\\sin x - \\cos x) + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2} e^x(\\cos x - \\sin x) + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^x(\\sin x + \\cos x) + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int x^2 \\sin x\\,dx$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$x^2 \\cos x + 2x \\sin x - 2\\cos x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$-x^2 \\cos x - 2x \\sin x - 2\\cos x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$-x^2 \\cos x + 2x \\sin x + 2\\cos x + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$-x^2 \\cos x + 2x \\sin x - 2\\cos x + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int (\\ln x)^2\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x(\\ln x)^2 + 2x \\ln x + 2x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$x(\\ln x)^2 - 2x \\ln x + 2x + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$x(\\ln x)^2 - 2x \\ln x - 2x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$x(\\ln x)^2 - 2\\ln x + 2x + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Integrais de seno e cosseno",
                blocks: [
                    {
                        type: "text",
                        value: "## Potências de seno e cosseno\n\nNesta aula atacamos integrais da forma $\\int \\sin^m x \\cos^n x\\,dx$, com $m$ e $n$ inteiros não negativos. A estratégia depende da **paridade** dos expoentes. A ideia central é reservar um fator para virar o $du$ de uma substituição e converter o resto usando a identidade $\\sin^2 x + \\cos^2 x = 1$.",
                    },
                    {
                        type: "text",
                        value: "## Quando há expoente ímpar\n\n**Cosseno com expoente ímpar** ($n$ ímpar): separe um fator $\\cos x$, converta os demais com $\\cos^2 x = 1 - \\sin^2 x$ e faça $u = \\sin x$, de modo que $du = \\cos x\\,dx$.\n\n**Seno com expoente ímpar** ($m$ ímpar): separe um fator $\\sin x$, converta os demais com $\\sin^2 x = 1 - \\cos^2 x$ e faça $u = \\cos x$, de modo que $du = -\\sin x\\,dx$.\n\nEm ambos os casos, o fator reservado é exatamente aquilo de que a substituição precisa.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: $\\int \\sin^3 x\\,dx$\n\nO expoente do seno é ímpar. Separamos um $\\sin x$ e reescrevemos o resto:\n\n$$\\int \\sin^3 x\\,dx = \\int (1 - \\cos^2 x)\\sin x\\,dx$$\n\nCom $u = \\cos x$ e $du = -\\sin x\\,dx$:\n\n$$\\int \\sin^3 x\\,dx = -\\int (1 - u^2)\\,du = -\\left(u - \\frac{u^3}{3}\\right) + C = -\\cos x + \\frac{\\cos^3 x}{3} + C$$",
                    },
                    {
                        type: "text",
                        value: "## Quando ambos são pares\n\nSe $m$ e $n$ forem ambos pares (incluindo o caso de um deles ser zero), não há fator ímpar para reservar. Recorremos às **fórmulas de redução de potência**, derivadas do arco duplo:\n\n$$\\sin^2 x = \\frac{1 - \\cos 2x}{2}, \\qquad \\cos^2 x = \\frac{1 + \\cos 2x}{2}$$\n\nElas trocam um quadrado por um cosseno de arco duplo, imediato de integrar. Em graus mais altos, aplicamos a redução repetidamente.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: $\\int \\cos^2 x\\,dx$\n\nUsando a redução de potência:\n\n$$\\int \\cos^2 x\\,dx = \\int \\frac{1 + \\cos 2x}{2}\\,dx = \\frac{1}{2}\\int dx + \\frac{1}{2}\\int \\cos 2x\\,dx$$\n\n$$= \\frac{x}{2} + \\frac{1}{2}\\cdot\\frac{\\sin 2x}{2} + C = \\frac{x}{2} + \\frac{\\sin 2x}{4} + C$$\n\nDe modo análogo, $\\int \\sin^2 x\\,dx = \\frac{x}{2} - \\frac{\\sin 2x}{4} + C$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: $\\int \\sin^2 x \\cos^3 x\\,dx$\n\nO cosseno tem expoente ímpar, então separamos um $\\cos x$:\n\n$$\\int \\sin^2 x \\cos^3 x\\,dx = \\int \\sin^2 x\\,(1 - \\sin^2 x)\\cos x\\,dx$$\n\nCom $u = \\sin x$ e $du = \\cos x\\,dx$:\n\n$$= \\int u^2(1 - u^2)\\,du = \\int (u^2 - u^4)\\,du = \\frac{u^3}{3} - \\frac{u^5}{5} + C = \\frac{\\sin^3 x}{3} - \\frac{\\sin^5 x}{5} + C$$",
                    },
                    {
                        type: "quote",
                        value: "A paridade dos expoentes decide a estratégia: procure primeiro quem é o expoente ímpar.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Expoente ímpar em $\\cos$: reserve $\\cos x$, use $\\cos^2 = 1 - \\sin^2$ e faça $u = \\sin x$.\n- Expoente ímpar em $\\sin$: reserve $\\sin x$, use $\\sin^2 = 1 - \\cos^2$ e faça $u = \\cos x$.\n- Ambos pares: use $\\sin^2 x = \\frac{1-\\cos 2x}{2}$ e $\\cos^2 x = \\frac{1+\\cos 2x}{2}$.\n- Se ambos forem ímpares, reserve o fator que deixar a conta mais curta.",
                    },
                ],
                questions: [
                    {
                        statement: "Calcule a integral $\\int \\sin^2 x\\,dx$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{x}{2} + \\frac{\\sin 2x}{4} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{x}{2} - \\frac{\\cos 2x}{4} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{x}{2} - \\frac{\\sin 2x}{4} + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\sin^3 x}{3} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int \\cos^2 x\\,dx$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{x}{2} + \\frac{\\sin 2x}{4} + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{x}{2} - \\frac{\\sin 2x}{4} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{x}{2} + \\frac{\\cos 2x}{4} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\cos^3 x}{3} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int \\sin^3 x\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\cos x - \\frac{\\cos^3 x}{3} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\cos x - \\frac{\\cos^3 x}{3} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sin^4 x}{4} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\cos x + \\frac{\\cos^3 x}{3} + C$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int \\cos^3 x\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-\\sin x + \\frac{\\sin^3 x}{3} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sin x - \\frac{\\sin^3 x}{3} + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sin x + \\frac{\\sin^3 x}{3} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\cos^4 x}{4} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int \\sin^2 x \\cos^3 x\\,dx$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{\\sin^3 x}{3} - \\frac{\\sin^5 x}{5} + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\sin^3 x}{3} + \\frac{\\sin^5 x}{5} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sin^5 x}{5} - \\frac{\\sin^3 x}{3} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\cos^3 x}{3} - \\frac{\\cos^5 x}{5} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Integrais de tangente e secante",
                blocks: [
                    {
                        type: "text",
                        value: "## Tangente e secante\n\nEsta aula trata de $\\int \\tan^m x \\sec^n x\\,dx$. O par $(\\tan, \\sec)$ funciona bem junto por causa de duas propriedades: a identidade $\\sec^2 x = 1 + \\tan^2 x$ e as derivadas $\\frac{d}{dx}\\tan x = \\sec^2 x$ e $\\frac{d}{dx}\\sec x = \\sec x \\tan x$. Vale ter na ponta da língua os tijolos básicos:\n\n$$\\int \\sec^2 x\\,dx = \\tan x + C, \\qquad \\int \\sec x \\tan x\\,dx = \\sec x + C$$",
                    },
                    {
                        type: "text",
                        value: "## As integrais de $\\tan x$ e $\\sec x$\n\nA integral da tangente sai por substituição simples. Escrevendo $\\tan x = \\frac{\\sin x}{\\cos x}$ e tomando $u = \\cos x$:\n\n$$\\int \\tan x\\,dx = -\\int \\frac{du}{u} = -\\ln|\\cos x| + C = \\ln|\\sec x| + C$$\n\nJá a da secante usa o truque de multiplicar e dividir por $\\sec x + \\tan x$, e o resultado convém memorizar:\n\n$$\\int \\sec x\\,dx = \\ln|\\sec x + \\tan x| + C$$",
                    },
                    {
                        type: "text",
                        value: "## Estratégia geral\n\nPara $\\int \\tan^m x \\sec^n x\\,dx$, olhe a paridade dos expoentes:\n\n- **Secante com expoente par** ($n$ par): reserve $\\sec^2 x$ para o $du$, converta o resto com $\\sec^2 x = 1 + \\tan^2 x$ e faça $u = \\tan x$.\n- **Tangente com expoente ímpar** ($m$ ímpar): reserve o fator $\\sec x \\tan x$, converta o resto com $\\tan^2 x = \\sec^2 x - 1$ e faça $u = \\sec x$.\n\nQuando nenhum dos dois casos se aplica, como em $\\sec x$ numa potência ímpar isolada, recorremos a partes ou a reduções específicas.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: $\\int \\tan^2 x\\,dx$\n\nNão há substituição direta, mas a identidade resolve na hora. Como $\\tan^2 x = \\sec^2 x - 1$:\n\n$$\\int \\tan^2 x\\,dx = \\int (\\sec^2 x - 1)\\,dx = \\tan x - x + C$$\n\nEsse é o padrão para potências pares de tangente: troque um $\\tan^2$ por $\\sec^2 - 1$ e repita se for preciso.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: $\\int \\tan^3 x\\,dx$\n\nO expoente da tangente é ímpar. Separamos $\\tan^2 x = \\sec^2 x - 1$:\n\n$$\\int \\tan^3 x\\,dx = \\int \\tan x(\\sec^2 x - 1)\\,dx = \\int \\tan x \\sec^2 x\\,dx - \\int \\tan x\\,dx$$\n\nNa primeira integral, $u = \\tan x$ e $du = \\sec^2 x\\,dx$, o que dá $\\frac{\\tan^2 x}{2}$. A segunda já conhecemos:\n\n$$\\int \\tan^3 x\\,dx = \\frac{\\tan^2 x}{2} - \\ln|\\sec x| + C$$",
                    },
                    {
                        type: "quote",
                        value: "Com tangente e secante, quase tudo se resolve decidindo qual fator vira a substituição antes de mexer no resto.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Tijolos: $\\int \\sec^2 x\\,dx = \\tan x + C$ e $\\int \\sec x \\tan x\\,dx = \\sec x + C$.\n- $\\int \\tan x\\,dx = \\ln|\\sec x| + C$ e $\\int \\sec x\\,dx = \\ln|\\sec x + \\tan x| + C$.\n- $n$ par em $\\sec$: reserve $\\sec^2 x$, use $\\sec^2 = 1 + \\tan^2$ e faça $u = \\tan x$.\n- $m$ ímpar em $\\tan$: reserve $\\sec x \\tan x$, use $\\tan^2 = \\sec^2 - 1$ e faça $u = \\sec x$.\n- Identidade curinga: $\\tan^2 x = \\sec^2 x - 1$.",
                    },
                ],
                questions: [
                    {
                        statement: "Calcule a integral $\\int \\sec^2 x\\,dx$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sec x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sec x \\tan x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sec^3 x}{3} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tan x + C$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int \\tan x\\,dx$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\ln|\\cos x| + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\ln|\\sec x| + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sec^2 x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\tan^2 x}{2} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int \\tan^2 x\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\tan x + x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sec^2 x - x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tan x - x + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\tan^3 x}{3} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int \\sec x\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\ln|\\sec x + \\tan x| + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\ln|\\sec x - \\tan x| + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\ln|\\sec x| + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sec x \\tan x + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int \\tan^3 x\\,dx$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{\\tan^2 x}{2} + \\ln|\\sec x| + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{\\tan^2 x}{2} - \\ln|\\sec x| + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\tan^4 x}{4} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\tan^2 x}{2} - \\ln|\\sec x| + C$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Produtos de seno e cosseno",
                blocks: [
                    {
                        type: "text",
                        value: "## Produtos com frequências diferentes\n\nQuando o integrando é um produto de senos e cossenos de **arcos diferentes**, como $\\sin 3x \\cos 2x$, as técnicas de paridade não ajudam. A saída é transformar o produto em uma **soma**, usando as fórmulas de produto em soma. Depois disso, cada parcela é uma integral imediata de $\\sin(kx)$ ou $\\cos(kx)$.",
                    },
                    {
                        type: "text",
                        value: "## Fórmulas de produto em soma\n\nAs três identidades a seguir vêm das fórmulas de soma e diferença de arcos e são o coração da técnica:\n\n$$\\sin A \\cos B = \\frac{1}{2}[\\sin(A - B) + \\sin(A + B)]$$\n\n$$\\sin A \\sin B = \\frac{1}{2}[\\cos(A - B) - \\cos(A + B)]$$\n\n$$\\cos A \\cos B = \\frac{1}{2}[\\cos(A - B) + \\cos(A + B)]$$\n\nRepare no sinal: apenas o produto $\\sin A \\sin B$ traz um menos entre os dois termos.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: $\\int \\sin 3x \\cos 2x\\,dx$\n\nCom $A = 3x$ e $B = 2x$, temos $A - B = x$ e $A + B = 5x$. Pela primeira fórmula:\n\n$$\\sin 3x \\cos 2x = \\frac{1}{2}[\\sin x + \\sin 5x]$$\n\nIntegrando parcela a parcela:\n\n$$\\int \\sin 3x \\cos 2x\\,dx = \\frac{1}{2}\\left(-\\cos x - \\frac{\\cos 5x}{5}\\right) + C = -\\frac{\\cos x}{2} - \\frac{\\cos 5x}{10} + C$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: $\\int \\sin 3x \\sin 2x\\,dx$\n\nAgora usamos a fórmula do produto de senos, com $A = 3x$, $B = 2x$, $A - B = x$ e $A + B = 5x$:\n\n$$\\sin 3x \\sin 2x = \\frac{1}{2}[\\cos x - \\cos 5x]$$\n\nIntegrando:\n\n$$\\int \\sin 3x \\sin 2x\\,dx = \\frac{1}{2}\\left(\\sin x - \\frac{\\sin 5x}{5}\\right) + C = \\frac{\\sin x}{2} - \\frac{\\sin 5x}{10} + C$$",
                    },
                    {
                        type: "text",
                        value: "## Por que isso importa: ortogonalidade\n\nEssa técnica é a base de um fato central nas séries de Fourier: em um período completo, senos e cossenos de frequências inteiras diferentes têm integral nula. Por exemplo, $\\int_0^{2\\pi} \\sin(mx)\\cos(nx)\\,dx = 0$ para quaisquer inteiros $m$ e $n$. Transformar produto em soma é justamente o que torna esse cálculo transparente, já que cada $\\sin(kx)$ ou $\\cos(kx)$ integra a zero ao longo de um período.",
                    },
                    {
                        type: "quote",
                        value: "Transformar produto em soma troca um integrando difícil por várias parcelas fáceis: é dividir para conquistar.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Para $\\int \\sin(ax)\\cos(bx)\\,dx$ e afins com $a \\neq b$, converta o produto em soma.\n- $\\sin A \\cos B = \\frac{1}{2}[\\sin(A-B) + \\sin(A+B)]$.\n- $\\sin A \\sin B = \\frac{1}{2}[\\cos(A-B) - \\cos(A+B)]$, o único com sinal de menos.\n- $\\cos A \\cos B = \\frac{1}{2}[\\cos(A-B) + \\cos(A+B)]$.\n- Depois, integre cada $\\sin(kx)$ e $\\cos(kx)$ lembrando de dividir por $k$.",
                    },
                ],
                questions: [
                    {
                        statement: "Calcule a integral $\\int \\sin 3x \\cos 2x\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-\\frac{\\cos x}{2} - \\frac{\\cos 5x}{10} + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\cos x}{2} + \\frac{\\cos 5x}{10} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{\\cos x}{2} + \\frac{\\cos 5x}{10} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sin x}{2} + \\frac{\\sin 5x}{10} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int \\cos 3x \\cos 2x\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{\\sin x}{2} - \\frac{\\sin 5x}{10} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{\\sin x}{2} - \\frac{\\sin 5x}{10} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{\\cos x}{2} - \\frac{\\cos 5x}{10} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sin x}{2} + \\frac{\\sin 5x}{10} + C$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int \\sin 3x \\sin 2x\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{\\sin x}{2} + \\frac{\\sin 5x}{10} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sin x}{2} - \\frac{\\sin 5x}{10} + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$-\\frac{\\sin x}{2} + \\frac{\\sin 5x}{10} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\cos x}{2} - \\frac{\\cos 5x}{10} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int \\sin 4x \\cos 2x\\,dx$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{\\cos 2x}{4} + \\frac{\\cos 6x}{12} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{\\cos 2x}{4} + \\frac{\\cos 6x}{12} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{\\cos 2x}{4} - \\frac{\\cos 6x}{12} + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\sin 2x}{4} + \\frac{\\sin 6x}{12} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule a integral $\\int \\cos 4x \\cos 2x\\,dx$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{\\sin 2x}{4} - \\frac{\\sin 6x}{12} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sin 2x}{4} + \\frac{\\sin 6x}{12} + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$-\\frac{\\sin 2x}{4} - \\frac{\\sin 6x}{12} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{\\cos 2x}{4} - \\frac{\\cos 6x}{12} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Técnicas de integração II",
        aulas: [
            {
                titulo: "Substituicao trigonometrica: raiz de $a^2 - x^2$",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando o integrando esconde $\\sqrt{a^2 - x^2}$\n\nSubstituicao simples e integracao por partes resolvem muitos problemas, mas integrais como $\\int \\sqrt{a^2 - x^2}\\,dx$ ou $\\int \\frac{dx}{x^2\\sqrt{a^2 - x^2}}$ resistem a essas ferramentas: nao existe um fator que seja a derivada natural de outro, e a raiz bloqueia as formulas de tabela.\n\nA ideia da **substituicao trigonometrica** e trocar $x$ por uma funcao trigonometrica que faz a raiz desaparecer, sempre guiada por uma identidade pitagorica.",
                    },
                    {
                        type: "text",
                        value: "## A substituicao $x = a\\sin\\theta$\n\nPara o radical $\\sqrt{a^2 - x^2}$, com $a > 0$, fazemos\n\n$$x = a\\sin\\theta, \\qquad dx = a\\cos\\theta\\,d\\theta,$$\n\ncom $\\theta \\in \\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$. Nesse intervalo $\\cos\\theta \\ge 0$, detalhe que sera importante ao simplificar a raiz.\n\nSubstituindo dentro do radical e usando $1 - \\sin^2\\theta = \\cos^2\\theta$:\n\n$$\\sqrt{a^2 - x^2} = \\sqrt{a^2 - a^2\\sin^2\\theta} = \\sqrt{a^2(1 - \\sin^2\\theta)} = \\sqrt{a^2\\cos^2\\theta} = a\\cos\\theta.$$\n\nA raiz sumiu e virou um produto simples.",
                    },
                    {
                        type: "text",
                        value: "## Voltando para a variavel $x$\n\nDepois de integrar em $\\theta$, precisamos retornar a $x$. O elo e a propria substituicao: de $x = a\\sin\\theta$ vem $\\sin\\theta = \\frac{x}{a}$.\n\nMontamos um triangulo retangulo em que $\\theta$ tem cateto oposto $x$ e hipotenusa $a$. O cateto adjacente vale $\\sqrt{a^2 - x^2}$, e dali lemos qualquer razao trigonometrica:\n\n$$\\cos\\theta = \\frac{\\sqrt{a^2 - x^2}}{a}, \\qquad \\tan\\theta = \\frac{x}{\\sqrt{a^2 - x^2}}, \\qquad \\cot\\theta = \\frac{\\sqrt{a^2 - x^2}}{x}.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nCalcular $\\int \\dfrac{dx}{x^2\\sqrt{4 - x^2}}$.\n\nAqui $a = 2$, entao $x = 2\\sin\\theta$, $dx = 2\\cos\\theta\\,d\\theta$ e $\\sqrt{4 - x^2} = 2\\cos\\theta$. Substituindo:\n\n$$\\int \\frac{2\\cos\\theta\\,d\\theta}{(4\\sin^2\\theta)(2\\cos\\theta)} = \\int \\frac{d\\theta}{4\\sin^2\\theta} = \\frac{1}{4}\\int \\csc^2\\theta\\,d\\theta = -\\frac{1}{4}\\cot\\theta + C.$$\n\nComo $\\cot\\theta = \\dfrac{\\sqrt{4 - x^2}}{x}$, concluimos\n\n$$\\int \\frac{dx}{x^2\\sqrt{4 - x^2}} = -\\frac{\\sqrt{4 - x^2}}{4x} + C.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nCalcular $\\int \\sqrt{9 - x^2}\\,dx$.\n\nCom $a = 3$: $x = 3\\sin\\theta$, $dx = 3\\cos\\theta\\,d\\theta$ e $\\sqrt{9 - x^2} = 3\\cos\\theta$. Logo\n\n$$\\int \\sqrt{9 - x^2}\\,dx = \\int (3\\cos\\theta)(3\\cos\\theta)\\,d\\theta = 9\\int \\cos^2\\theta\\,d\\theta.$$\n\nUsando $\\cos^2\\theta = \\frac{1 + \\cos 2\\theta}{2}$, obtemos $9\\int \\cos^2\\theta\\,d\\theta = \\frac{9}{2}\\theta + \\frac{9}{2}\\sin\\theta\\cos\\theta + C$.\n\nVoltando com $\\theta = \\arcsin\\frac{x}{3}$, $\\sin\\theta = \\frac{x}{3}$ e $\\cos\\theta = \\frac{\\sqrt{9 - x^2}}{3}$:\n\n$$\\int \\sqrt{9 - x^2}\\,dx = \\frac{9}{2}\\arcsin\\frac{x}{3} + \\frac{x\\sqrt{9 - x^2}}{2} + C.$$",
                    },
                    {
                        type: "text",
                        value: "## Observacoes uteis\n\nA substituicao $x = a\\sin\\theta$ vale quando $|x| \\le a$, condicao ja embutida no dominio de $\\sqrt{a^2 - x^2}$. Um caso particular merece ser memorizado:\n\n$$\\int \\frac{dx}{\\sqrt{a^2 - x^2}} = \\arcsin\\frac{x}{a} + C.$$\n\nSe o radical aparecer como $\\sqrt{a^2 - u^2}$ com $u$ linear em $x$, por exemplo $\\sqrt{4 - 9x^2}$ onde $u = 3x$, ajuste primeiro com uma substituicao linear e so depois aplique a trigonometrica.",
                    },
                    {
                        type: "quote",
                        value: "A ideia central da substituicao trigonometrica e trocar uma raiz dificil por uma funcao trigonometrica simples, sempre orientada por uma identidade pitagorica.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nDiante de $\\sqrt{a^2 - x^2}$:\n\n1. Faca $x = a\\sin\\theta$ e $dx = a\\cos\\theta\\,d\\theta$.\n2. Use $1 - \\sin^2\\theta = \\cos^2\\theta$ para reduzir a raiz a $a\\cos\\theta$.\n3. Integre em $\\theta$.\n4. Volte a $x$ com o triangulo retangulo de cateto oposto $x$ e hipotenusa $a$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Para calcular $\\int \\sqrt{16 - x^2}\\,dx$, qual substituicao e adequada?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = 4\\sin\\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 16\\sin\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 4\\sec\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 4\\tan\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com a substituicao $x = a\\sin\\theta$, o radical $\\sqrt{a^2 - x^2}$ torna-se:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$a\\sec\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$a\\cos\\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$a\\tan\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$a\\sin\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Usando $x = 2\\sin\\theta$, o diferencial $dx$ e igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2\\sin\\theta\\,d\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$-2\\cos\\theta\\,d\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\cos\\theta\\,d\\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{2}\\cos\\theta\\,d\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $\\int \\dfrac{dx}{\\sqrt{1 - x^2}}$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\arctan x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\arcsin x + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\arccos x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\ln|x| + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\int \\dfrac{x^2}{\\sqrt{9 - x^2}}\\,dx$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{9}{2}\\arcsin\\frac{x}{3} + \\frac{x\\sqrt{9 - x^2}}{2} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{9}{2}\\arccos\\frac{x}{3} - \\frac{x\\sqrt{9 - x^2}}{2} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{9}{2}\\arcsin\\frac{x}{3} - x\\sqrt{9 - x^2} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{9}{2}\\arcsin\\frac{x}{3} - \\frac{x\\sqrt{9 - x^2}}{2} + C$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Substituicao trigonometrica: raizes de $a^2 + x^2$ e $x^2 - a^2$",
                blocks: [
                    {
                        type: "text",
                        value: "## As outras duas raizes\n\nNa aula anterior, o seno resolveu $\\sqrt{a^2 - x^2}$. Faltam os radicais em que $x^2$ e a constante aparecem somados, $\\sqrt{a^2 + x^2}$, ou subtraidos na ordem contraria, $\\sqrt{x^2 - a^2}$. Cada um pede uma funcao trigonometrica diferente, sempre guiada por uma identidade pitagorica.\n\n| Radical | Substituicao | Identidade | A raiz vira |\n| --- | --- | --- | --- |\n| $\\sqrt{a^2 - x^2}$ | $x = a\\sin\\theta$ | $1 - \\sin^2\\theta = \\cos^2\\theta$ | $a\\cos\\theta$ |\n| $\\sqrt{a^2 + x^2}$ | $x = a\\tan\\theta$ | $1 + \\tan^2\\theta = \\sec^2\\theta$ | $a\\sec\\theta$ |\n| $\\sqrt{x^2 - a^2}$ | $x = a\\sec\\theta$ | $\\sec^2\\theta - 1 = \\tan^2\\theta$ | $a\\tan\\theta$ |",
                    },
                    {
                        type: "text",
                        value: "## Radical $\\sqrt{a^2 + x^2}$: a tangente\n\nFazemos $x = a\\tan\\theta$, com $\\theta \\in \\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$, de modo que $dx = a\\sec^2\\theta\\,d\\theta$. Entao\n\n$$\\sqrt{a^2 + x^2} = \\sqrt{a^2 + a^2\\tan^2\\theta} = \\sqrt{a^2(1 + \\tan^2\\theta)} = \\sqrt{a^2\\sec^2\\theta} = a\\sec\\theta,$$\n\npois $\\sec\\theta > 0$ nesse intervalo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nCalcular $\\int \\dfrac{dx}{\\sqrt{x^2 + 4}}$.\n\nCom $a = 2$: $x = 2\\tan\\theta$, $dx = 2\\sec^2\\theta\\,d\\theta$ e $\\sqrt{x^2 + 4} = 2\\sec\\theta$. Logo\n\n$$\\int \\frac{2\\sec^2\\theta\\,d\\theta}{2\\sec\\theta} = \\int \\sec\\theta\\,d\\theta = \\ln\\left|\\sec\\theta + \\tan\\theta\\right| + C.$$\n\nVoltando com $\\tan\\theta = \\frac{x}{2}$ e $\\sec\\theta = \\frac{\\sqrt{x^2 + 4}}{2}$:\n\n$$\\int \\frac{dx}{\\sqrt{x^2 + 4}} = \\ln\\left|\\frac{\\sqrt{x^2 + 4}}{2} + \\frac{x}{2}\\right| + C = \\ln\\left(x + \\sqrt{x^2 + 4}\\right) + C_1,$$\n\nabsorvendo a constante $-\\ln 2$ em $C_1$.",
                    },
                    {
                        type: "text",
                        value: "## Radical $\\sqrt{x^2 - a^2}$: a secante\n\nFazemos $x = a\\sec\\theta$, com $dx = a\\sec\\theta\\tan\\theta\\,d\\theta$. Tomando $\\theta \\in \\left[0, \\frac{\\pi}{2}\\right)$ para $x \\ge a$, temos\n\n$$\\sqrt{x^2 - a^2} = \\sqrt{a^2\\sec^2\\theta - a^2} = \\sqrt{a^2(\\sec^2\\theta - 1)} = \\sqrt{a^2\\tan^2\\theta} = a\\tan\\theta.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nCalcular $\\int \\dfrac{dx}{x^2\\sqrt{x^2 - 9}}$, para $x > 3$.\n\nCom $a = 3$: $x = 3\\sec\\theta$, $dx = 3\\sec\\theta\\tan\\theta\\,d\\theta$, $\\sqrt{x^2 - 9} = 3\\tan\\theta$ e $x^2 = 9\\sec^2\\theta$. Substituindo:\n\n$$\\int \\frac{3\\sec\\theta\\tan\\theta\\,d\\theta}{(9\\sec^2\\theta)(3\\tan\\theta)} = \\frac{1}{9}\\int \\frac{d\\theta}{\\sec\\theta} = \\frac{1}{9}\\int \\cos\\theta\\,d\\theta = \\frac{1}{9}\\sin\\theta + C.$$\n\nDo triangulo com $\\sec\\theta = \\frac{x}{3}$ obtemos $\\sin\\theta = \\frac{\\sqrt{x^2 - 9}}{x}$, portanto\n\n$$\\int \\frac{dx}{x^2\\sqrt{x^2 - 9}} = \\frac{\\sqrt{x^2 - 9}}{9x} + C.$$",
                    },
                    {
                        type: "text",
                        value: "## Cuidados ao voltar para $x$\n\nTres detalhes evitam erros no retorno a variavel original:\n\n1. Monte o triangulo retangulo a partir da substituicao. Para $x = a\\tan\\theta$, o oposto e $x$ e o adjacente e $a$; para $x = a\\sec\\theta$, a hipotenusa e $x$ e o adjacente e $a$.\n2. A integral $\\int \\sec\\theta\\,d\\theta = \\ln|\\sec\\theta + \\tan\\theta| + C$ aparece com frequencia e vale ter na ponta da lingua.\n3. Confira o dominio. Em $\\sqrt{x^2 - a^2}$ o caso $x \\le -a$ exige um intervalo diferente para $\\theta$ e pode mudar sinais.",
                    },
                    {
                        type: "quote",
                        value: "Escolher a substituicao certa e ler o sinal dentro da raiz: soma pede tangente, e a diferenca pede seno ou secante conforme a ordem dos termos.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nO sinal dentro da raiz decide a substituicao:\n\n- Soma $a^2 + x^2$: use $x = a\\tan\\theta$, e a raiz vira $a\\sec\\theta$.\n- Diferenca $x^2 - a^2$: use $x = a\\sec\\theta$, e a raiz vira $a\\tan\\theta$.\n\nEm ambos, integre em $\\theta$ e retorne com o triangulo retangulo correspondente.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Para $\\int \\dfrac{dx}{\\sqrt{x^2 + 16}}$, a substituicao adequada e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = 4\\tan\\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 4\\sin\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 4\\sec\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 16\\tan\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para o radical $\\sqrt{x^2 - 25}$, a substituicao adequada e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = 5\\sin\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 5\\sec\\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 5\\tan\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 25\\sec\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com $x = a\\tan\\theta$, o radical $\\sqrt{a^2 + x^2}$ torna-se:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$a\\tan\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$a\\cos\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$a\\sec\\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$a\\csc\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A integral $\\int \\sec\\theta\\,d\\theta$ e igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\sec\\theta\\tan\\theta + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tan\\theta + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\ln|\\csc\\theta + \\cot\\theta| + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\ln|\\sec\\theta + \\tan\\theta| + C$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\int \\dfrac{dx}{(x^2 + 1)^{3/2}}$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{x}{\\sqrt{x^2 + 1}} + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$-\\frac{x}{\\sqrt{x^2 + 1}} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\ln\\left(x + \\sqrt{x^2 + 1}\\right) + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{x^2 + 1} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Fracoes parciais: fatores lineares distintos",
                blocks: [
                    {
                        type: "text",
                        value: "## Integrando funcoes racionais\n\nUma funcao racional e um quociente de polinomios, $\\frac{P(x)}{Q(x)}$. Integrar diretamente costuma ser dificil, mas ha um caso trivial que serve de alvo:\n\n$$\\int \\frac{dx}{x - a} = \\ln|x - a| + C.$$\n\nA estrategia das **fracoes parciais** e justamente quebrar uma fracao complicada em uma soma de fracoes simples como essa, que integramos uma a uma.",
                    },
                    {
                        type: "text",
                        value: "## Primeiro: a fracao e propria?\n\nO metodo exige que o grau de $P$ seja menor que o grau de $Q$. Se nao for, faca a **divisao de polinomios** antes. Por exemplo,\n\n$$\\frac{x^2 + 1}{x^2 - 1} = 1 + \\frac{2}{x^2 - 1},$$\n\npois o numerador tem o mesmo grau do denominador. A parte polinomial se integra de imediato, e a fracao propria restante segue para a decomposicao.",
                    },
                    {
                        type: "text",
                        value: "## Fatores lineares distintos\n\nSuponha que $Q(x)$ se fatore em fatores lineares diferentes, sem repeticao:\n\n$$Q(x) = (x - r_1)(x - r_2)\\cdots(x - r_n).$$\n\nA decomposicao tem um termo por fator, cada um com uma constante no numerador:\n\n$$\\frac{P(x)}{(x - r_1)(x - r_2)\\cdots(x - r_n)} = \\frac{A_1}{x - r_1} + \\frac{A_2}{x - r_2} + \\cdots + \\frac{A_n}{x - r_n}.$$",
                    },
                    {
                        type: "text",
                        value: "## Encontrando as constantes\n\nMultiplique os dois lados pelo denominador comum para eliminar as fracoes. Restam polinomios iguais, e ha duas formas de achar as constantes:\n\n- **Substituir raizes:** troque $x$ por cada raiz $r_i$. Cada escolha zera todos os termos menos um e revela uma constante de imediato.\n- **Comparar coeficientes:** expanda e iguale os coeficientes de cada potencia de $x$, resolvendo o sistema.\n\nSubstituir raizes costuma ser o caminho mais curto para fatores lineares.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nCalcular $\\int \\dfrac{x + 7}{x^2 - x - 6}\\,dx$.\n\nFatorando, $x^2 - x - 6 = (x - 3)(x + 2)$. Escrevemos\n\n$$\\frac{x + 7}{(x - 3)(x + 2)} = \\frac{A}{x - 3} + \\frac{B}{x + 2}.$$\n\nMultiplicando por $(x - 3)(x + 2)$: $x + 7 = A(x + 2) + B(x - 3)$.\n\nEm $x = 3$: $10 = 5A$, logo $A = 2$. Em $x = -2$: $5 = -5B$, logo $B = -1$. Assim\n\n$$\\int \\frac{x + 7}{x^2 - x - 6}\\,dx = \\int \\left(\\frac{2}{x - 3} - \\frac{1}{x + 2}\\right)dx = 2\\ln|x - 3| - \\ln|x + 2| + C.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nCalcular $\\int \\dfrac{dx}{x^3 - x}$.\n\nFatorando o denominador, $x^3 - x = x(x - 1)(x + 1)$. A decomposicao e\n\n$$\\frac{1}{x(x - 1)(x + 1)} = \\frac{A}{x} + \\frac{B}{x - 1} + \\frac{C}{x + 1}.$$\n\nMultiplicando tudo: $1 = A(x - 1)(x + 1) + Bx(x + 1) + Cx(x - 1)$.\n\nEm $x = 0$: $1 = -A$, logo $A = -1$. Em $x = 1$: $1 = 2B$, logo $B = \\frac{1}{2}$. Em $x = -1$: $1 = 2C$, logo $C = \\frac{1}{2}$. Portanto\n\n$$\\int \\frac{dx}{x^3 - x} = -\\ln|x| + \\frac{1}{2}\\ln|x - 1| + \\frac{1}{2}\\ln|x + 1| + C.$$",
                    },
                    {
                        type: "quote",
                        value: "Fracoes parciais transformam um problema de integracao aparentemente complicado em varias integrais de logaritmo simples de resolver.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nPara integrar $\\frac{P(x)}{Q(x)}$ com fatores lineares distintos:\n\n1. Garanta uma fracao propria, dividindo os polinomios se necessario.\n2. Fatore $Q(x)$ e escreva um termo $\\frac{A_i}{x - r_i}$ para cada fator.\n3. Ache as constantes substituindo as raizes.\n4. Integre cada parcela como um logaritmo.",
                    },
                ],
                questions: [
                    {
                        statement: "O valor de $\\int \\dfrac{dx}{x - 5}$ e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\ln|x - 5| + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$5\\ln|x| + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{(x - 5)^2} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\ln|x| - 5 + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A decomposicao em fracoes parciais de $\\dfrac{1}{(x - 1)(x + 2)}$ tem a forma:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{A}{x - 1} + \\frac{Bx + C}{x + 2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{A}{x - 1} + \\frac{B}{x + 2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{Ax + B}{(x - 1)(x + 2)}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{A}{x - 1} \\cdot \\frac{B}{x + 2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Antes de decompor $\\dfrac{x^2}{x^2 - 4}$ em fracoes parciais, e necessario:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Fatorar apenas o numerador",
                                isCorrect: false,
                            },
                            {
                                text: "Aplicar substituicao trigonometrica",
                                isCorrect: false,
                            },
                            {
                                text: "Efetuar a divisao de polinomios",
                                isCorrect: true,
                            },
                            {
                                text: "Decompor diretamente sem ajustes",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na decomposicao $\\dfrac{x + 7}{(x - 3)(x + 2)} = \\dfrac{A}{x - 3} + \\dfrac{B}{x + 2}$, o valor de $A$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$10$",
                                isCorrect: false,
                            },
                            {
                                text: "$-1$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\int \\dfrac{5x - 4}{x^2 - x - 2}\\,dx$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$3\\ln|x - 2| + 2\\ln|x + 1| + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\ln|x - 2| + 3\\ln|x + 1| + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$2\\ln|x - 2| - 3\\ln|x + 1| + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\ln|x + 2| + 3\\ln|x - 1| + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Fracoes parciais: fatores repetidos e quadraticos",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando os fatores se repetem ou nao fatoram\n\nNem todo denominador se quebra em fatores lineares distintos. Dois casos novos aparecem com frequencia: fatores lineares **repetidos**, como $(x - r)^2$, e fatores **quadraticos irredutiveis**, como $x^2 + 1$, que nao tem raizes reais. Cada um muda a forma da decomposicao.",
                    },
                    {
                        type: "text",
                        value: "## Fatores lineares repetidos\n\nUm fator $(x - r)^k$ contribui com um termo para cada potencia, de $1$ ate $k$:\n\n$$\\frac{A_1}{x - r} + \\frac{A_2}{(x - r)^2} + \\cdots + \\frac{A_k}{(x - r)^k}.$$\n\nFaltar qualquer uma dessas parcelas deixa o sistema sem solucao. Ao integrar, as potencias maiores caem na regra $\\int (x - r)^{-m}\\,dx = \\frac{(x - r)^{1 - m}}{1 - m}$, para $m \\ge 2$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nCalcular $\\int \\dfrac{dx}{x(x - 1)^2}$.\n\nO fator repetido $(x - 1)^2$ pede duas parcelas:\n\n$$\\frac{1}{x(x - 1)^2} = \\frac{A}{x} + \\frac{B}{x - 1} + \\frac{C}{(x - 1)^2}.$$\n\nMultiplicando: $1 = A(x - 1)^2 + Bx(x - 1) + Cx$. Em $x = 0$: $A = 1$. Em $x = 1$: $C = 1$. Comparando os coeficientes de $x^2$: $0 = A + B$, logo $B = -1$. Assim\n\n$$\\int \\frac{dx}{x(x - 1)^2} = \\ln|x| - \\ln|x - 1| - \\frac{1}{x - 1} + C.$$",
                    },
                    {
                        type: "text",
                        value: "## Fatores quadraticos irredutiveis\n\nUm fator $x^2 + bx + c$ sem raizes reais (discriminante negativo) recebe um numerador **linear completo**:\n\n$$\\frac{Bx + C}{x^2 + bx + c}.$$\n\nSe ele estiver elevado a uma potencia, repita a ideia dos fatores lineares, uma parcela por potencia. Para integrar essas parcelas, dois blocos basicos resolvem quase tudo:\n\n$$\\int \\frac{dx}{x^2 + a^2} = \\frac{1}{a}\\arctan\\frac{x}{a} + C, \\qquad \\int \\frac{x\\,dx}{x^2 + a^2} = \\frac{1}{2}\\ln(x^2 + a^2) + C.$$\n\nQuando ha termo em $x$ no denominador, complete o quadrado antes, como em $x^2 + 2x + 5 = (x + 1)^2 + 4$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nCalcular $\\int \\dfrac{2x^2 - x + 4}{x^3 + 4x}\\,dx$.\n\nO denominador fatora em $x(x^2 + 4)$, com $x^2 + 4$ irredutivel. Entao\n\n$$\\frac{2x^2 - x + 4}{x(x^2 + 4)} = \\frac{A}{x} + \\frac{Bx + C}{x^2 + 4}.$$\n\nMultiplicando: $2x^2 - x + 4 = A(x^2 + 4) + (Bx + C)x = (A + B)x^2 + Cx + 4A$. Comparando coeficientes: $4A = 4$ da $A = 1$; $C = -1$; e $A + B = 2$ da $B = 1$. Logo\n\n$$\\int \\frac{2x^2 - x + 4}{x^3 + 4x}\\,dx = \\ln|x| + \\frac{1}{2}\\ln(x^2 + 4) - \\frac{1}{2}\\arctan\\frac{x}{2} + C.$$",
                    },
                    {
                        type: "text",
                        value: "## Panorama das quatro situacoes\n\n| Fator no denominador | Parcelas na decomposicao |\n| --- | --- |\n| Linear distinto $(x - r)$ | $\\dfrac{A}{x - r}$ |\n| Linear repetido $(x - r)^k$ | $\\dfrac{A_1}{x - r} + \\cdots + \\dfrac{A_k}{(x - r)^k}$ |\n| Quadratico irredutivel $x^2 + bx + c$ | $\\dfrac{Bx + C}{x^2 + bx + c}$ |\n| Quadratico repetido $(x^2 + bx + c)^k$ | $\\dfrac{B_1 x + C_1}{x^2 + bx + c} + \\cdots + \\dfrac{B_k x + C_k}{(x^2 + bx + c)^k}$ |",
                    },
                    {
                        type: "quote",
                        value: "Cada potencia de um fator repetido merece seu proprio termo, e todo fator quadratico irredutivel carrega um numerador linear completo.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Fator repetido $(x - r)^k$: uma parcela para cada potencia de $1$ a $k$.\n- Fator quadratico irredutivel: numerador linear $Bx + C$.\n- Integre os pedacos quadraticos com $\\arctan$ e com $\\ln$, completando o quadrado quando houver termo em $x$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A decomposicao de $\\dfrac{5x}{(x - 2)^2}$ em fracoes parciais tem a forma:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{A}{x - 2} + \\frac{Bx + C}{(x - 2)^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{A}{(x - 2)^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{A}{x - 2} + \\frac{B}{(x - 2)^2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{A}{x - 2} + \\frac{B}{x + 2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sendo $x^2 + 1$ irredutivel, a decomposicao de $\\dfrac{x + 1}{x(x^2 + 1)}$ tem a forma:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{A}{x} + \\frac{B}{x^2 + 1}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{A}{x} + \\frac{Bx + C}{x^2 + 1}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{Ax + B}{x} + \\frac{C}{x^2 + 1}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{A}{x} + \\frac{B}{x + 1} + \\frac{C}{x - 1}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $\\int \\dfrac{dx}{x^2 + 9}$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{3}\\ln(x^2 + 9) + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\arctan\\frac{x}{3} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{3}\\arctan\\frac{x}{3} + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{9}\\arctan\\frac{x}{3} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $\\int \\dfrac{x}{x^2 + 9}\\,dx$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{2}\\arctan\\frac{x}{3} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\ln(x^2 + 9) + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{3}\\arctan\\frac{x}{3} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}\\ln(x^2 + 9) + C$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na decomposicao $\\dfrac{1}{x(x - 1)^2} = \\dfrac{A}{x} + \\dfrac{B}{x - 1} + \\dfrac{C}{(x - 1)^2}$, os valores sao:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$A = 1$, $B = 1$, $C = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$A = 1$, $B = -1$, $C = 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$A = -1$, $B = 1$, $C = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$A = 1$, $B = -1$, $C = -1$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Escolhendo a tecnica de integracao",
                blocks: [
                    {
                        type: "text",
                        value: "## Um mapa para escolher a tecnica\n\nCom substituicao, integracao por partes, integrais de potencias trigonometricas, substituicao trigonometrica e fracoes parciais, o desafio deixa de ser calcular e passa a ser **decidir**. Diante de uma integral nova, qual ferramenta pegar primeiro? Esta aula organiza a decisao em poucos passos.",
                    },
                    {
                        type: "text",
                        value: "## Passo 1: simplifique antes de tudo\n\nMuitas integrais ficam faceis depois de um ajuste algebrico. Antes de escolher uma tecnica pesada, tente:\n\n- Expandir produtos ou separar uma fracao em somas.\n- Reunir termos com um denominador comum.\n- Aplicar identidades trigonometricas, como $\\sin^2 x = \\frac{1 - \\cos 2x}{2}$.\n\nAs vezes o integrando reescrito ja cai numa formula de tabela.",
                    },
                    {
                        type: "text",
                        value: "## Passo 2: procure uma substituicao\n\nVerifique se o integrando tem a forma $f(g(x))\\,g'(x)$, ou seja, uma funcao composta acompanhada da derivada da parte interna. Nesse caso $u = g(x)$ resolve.\n\nEsse e o teste mais barato e deve vir sempre antes das tecnicas mais elaboradas. Em $\\int x\\sqrt{x^2 + 1}\\,dx$, por exemplo, o fator $x$ e (a menos de constante) a derivada de $x^2 + 1$, entao $u = x^2 + 1$ resolve na hora, sem precisar de substituicao trigonometrica.",
                    },
                    {
                        type: "text",
                        value: "## Passo 3: classifique pela forma\n\nSe nada acima encerrou o problema, olhe a estrutura do integrando e escolha:\n\n| Forma do integrando | Tecnica indicada |\n| --- | --- |\n| $f(g(x))\\,g'(x)$ | Substituicao $u = g(x)$ |\n| Polinomio vezes exponencial, logaritmo ou trigonometrica | Integracao por partes (LIATE) |\n| Potencias de $\\sin$, $\\cos$, $\\tan$, $\\sec$ | Identidades trigonometricas |\n| $\\sqrt{a^2 - x^2}$, $\\sqrt{a^2 + x^2}$, $\\sqrt{x^2 - a^2}$ | Substituicao trigonometrica |\n| Quociente de polinomios | Fracoes parciais (apos dividir) |",
                    },
                    {
                        type: "text",
                        value: "## Classificando alguns exemplos\n\nRepare como a forma aponta a tecnica:\n\n- $\\int x e^{x}\\,dx$: polinomio vezes exponencial, entao integracao por partes.\n- $\\int \\dfrac{2x}{x^2 + 1}\\,dx$: a derivada de $x^2 + 1$ esta no numerador, entao $u = x^2 + 1$.\n- $\\int \\dfrac{dx}{\\sqrt{9 - x^2}}$: radical do tipo $\\sqrt{a^2 - x^2}$, entao substituicao trigonometrica.\n- $\\int \\dfrac{x + 1}{x^2 - 5x + 6}\\,dx$: quociente de polinomios, entao fracoes parciais.\n- $\\int \\sin^3 x\\cos^2 x\\,dx$: potencias de seno e cosseno, entao identidade trigonometrica.",
                    },
                    {
                        type: "text",
                        value: "## Combinar metodos e saber parar\n\nDuas advertencias fecham o quadro. Primeiro, integrais reais muitas vezes exigem **mais de uma tecnica**: uma substituicao que prepara uma integracao por partes, ou uma divisao de polinomios seguida de fracoes parciais.\n\nSegundo, nem toda funcao tem primitiva elementar. Integrais como $\\int e^{-x^2}\\,dx$ e $\\int \\frac{\\sin x}{x}\\,dx$ existem, mas nao se expressam por funcoes elementares. Insistir numa tecnica nesses casos nao leva a lugar nenhum.",
                    },
                    {
                        type: "quote",
                        value: "Metade do trabalho de integrar esta em reconhecer o padrao e decidir qual ferramenta pegar antes de fazer qualquer conta.",
                    },
                    {
                        type: "text",
                        value: "## Resumo: a lista de verificacao\n\n1. Simplifique o integrando.\n2. Tente uma substituicao $u = g(x)$.\n3. Reconheca formas de tabela.\n4. Classifique: produto pede partes; potencias trigonometricas pedem identidades; raizes pedem substituicao trigonometrica; quociente de polinomios pede fracoes parciais.\n5. Combine tecnicas quando preciso e lembre que algumas integrais nao tem primitiva elementar.",
                    },
                ],
                questions: [
                    {
                        statement: "A tecnica mais indicada para $\\int x\\cos x\\,dx$ e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Integracao por partes",
                                isCorrect: true,
                            },
                            {
                                text: "Fracoes parciais",
                                isCorrect: false,
                            },
                            {
                                text: "Substituicao trigonometrica",
                                isCorrect: false,
                            },
                            {
                                text: "Substituicao $u = \\cos x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A tecnica mais indicada para $\\int \\dfrac{3x + 1}{(x - 1)(x + 2)}\\,dx$ e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Integracao por partes",
                                isCorrect: false,
                            },
                            {
                                text: "Substituicao trigonometrica",
                                isCorrect: false,
                            },
                            {
                                text: "Fracoes parciais",
                                isCorrect: true,
                            },
                            {
                                text: "Identidade trigonometrica",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $\\int \\dfrac{x}{\\sqrt{x^2 + 4}}\\,dx$, a abordagem mais rapida e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Substituicao trigonometrica $x = 2\\tan\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "Substituicao $u = x^2 + 4$",
                                isCorrect: true,
                            },
                            {
                                text: "Integracao por partes",
                                isCorrect: false,
                            },
                            {
                                text: "Fracoes parciais",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual das integrais abaixo pede substituicao trigonometrica?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\int x\\sqrt{4 - x^2}\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int \\frac{x}{4 + x^2}\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int \\sqrt{4 - x^2}\\,dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\int \\frac{dx}{x + 4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\int \\dfrac{x^3}{x^2 + 1}\\,dx$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{x^2}{2} + \\frac{1}{2}\\ln(x^2 + 1) + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{x^2}{2} - \\frac{1}{2}\\ln(x^2 + 1) + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{x^2}{2} - \\arctan x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}\\ln(x^2 + 1) + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Integrais impróprias",
        aulas: [
            {
                titulo: "Integrais impróprias em intervalos infinitos",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando uma integral é imprópria\n\nAté aqui você calculou integrais definidas $\\int_a^b f(x)\\,dx$ em que o intervalo $[a,b]$ é limitado e a função é contínua nele. Uma **integral imprópria** aparece quando uma dessas hipóteses falha. Neste primeiro caso, tratamos do **intervalo de integração infinito**, ou seja, quando um dos extremos (ou ambos) é $\\infty$ ou $-\\infty$.\n\nA ideia é natural: não sabemos somar áreas até o infinito de uma vez, então integramos até um ponto finito $b$ e observamos o comportamento quando $b \\to \\infty$. Esse tipo é chamado de **integral imprópria de primeira espécie**.",
                    },
                    {
                        type: "text",
                        value: "## Definição com limite\n\nSeja $f$ contínua em $[a,\\infty)$. Definimos\n\n$$\\int_a^{\\infty} f(x)\\,dx = \\lim_{b\\to\\infty} \\int_a^{b} f(x)\\,dx.$$\n\nDe modo análogo, se $f$ é contínua em $(-\\infty,b]$,\n\n$$\\int_{-\\infty}^{b} f(x)\\,dx = \\lim_{a\\to-\\infty} \\int_a^{b} f(x)\\,dx.$$\n\nQuando o limite existe e é um número finito, dizemos que a integral **converge**. Quando o limite é $\\pm\\infty$ ou não existe, dizemos que ela **diverge**.",
                    },
                    {
                        type: "text",
                        value: "## Intervalo infinito nos dois extremos\n\nSe os dois extremos são infinitos, escolhemos um ponto qualquer $c$ (por exemplo $c=0$) e separamos:\n\n$$\\int_{-\\infty}^{\\infty} f(x)\\,dx = \\int_{-\\infty}^{c} f(x)\\,dx + \\int_{c}^{\\infty} f(x)\\,dx.$$\n\nA integral só converge se **cada uma** das duas parcelas convergir separadamente. Não vale calcular $\\lim_{t\\to\\infty}\\int_{-t}^{t} f(x)\\,dx$ e parar por aí: esse valor simétrico pode existir mesmo quando a integral diverge.",
                    },
                    {
                        type: "quote",
                        value: "Integrar até o infinito é, no fundo, perguntar o que sobra de área quando avançamos sem nunca parar.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: uma que converge\n\nVamos calcular $\\int_1^{\\infty} \\dfrac{1}{x^2}\\,dx$. Trocamos o infinito por um limite:\n\n$$\\int_1^{\\infty} \\frac{1}{x^2}\\,dx = \\lim_{b\\to\\infty} \\int_1^{b} x^{-2}\\,dx = \\lim_{b\\to\\infty} \\left[-\\frac{1}{x}\\right]_1^{b} = \\lim_{b\\to\\infty}\\left(1 - \\frac{1}{b}\\right).$$\n\nQuando $b\\to\\infty$, o termo $\\dfrac{1}{b}\\to 0$, logo o limite vale $1$. A integral **converge** e $\\int_1^{\\infty} \\dfrac{1}{x^2}\\,dx = 1$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: uma que diverge\n\nAgora $\\int_1^{\\infty} \\dfrac{1}{x}\\,dx$. O procedimento é o mesmo:\n\n$$\\int_1^{\\infty} \\frac{1}{x}\\,dx = \\lim_{b\\to\\infty} \\left[\\ln x\\right]_1^{b} = \\lim_{b\\to\\infty}\\left(\\ln b - 0\\right) = \\lim_{b\\to\\infty}\\ln b = \\infty.$$\n\nComo o limite é infinito, a integral **diverge**. Repare no contraste: $\\dfrac{1}{x^2}$ e $\\dfrac{1}{x}$ parecem próximas, mas a primeira fecha uma área finita e a segunda não. A velocidade com que a função vai a zero é o que decide.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: decaimento exponencial\n\nO decaimento de $e^{-x}$ é rápido o suficiente para dar área finita:\n\n$$\\int_0^{\\infty} e^{-x}\\,dx = \\lim_{b\\to\\infty} \\left[-e^{-x}\\right]_0^{b} = \\lim_{b\\to\\infty}\\left(1 - e^{-b}\\right) = 1,$$\n\npois $e^{-b}\\to 0$. Esse resultado reaparece em probabilidade e em transformadas, como veremos na última aula do módulo.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma integral com extremo $\\infty$ ou $-\\infty$ é imprópria de primeira espécie e se define por um **limite**.\n- $\\int_a^{\\infty} f(x)\\,dx = \\lim_{b\\to\\infty}\\int_a^{b} f(x)\\,dx$; converge se o limite for finito.\n- Com os dois extremos infinitos, separe em duas integrais e exija a convergência de ambas.\n- Casos-chave: $\\int_1^{\\infty}\\frac{1}{x^2}\\,dx = 1$ (converge), $\\int_1^{\\infty}\\frac{1}{x}\\,dx$ diverge, $\\int_0^{\\infty} e^{-x}\\,dx = 1$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A integral $\\int_1^{\\infty} \\frac{1}{x^2}\\,dx$ converge para qual valor?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "Diverge para $\\infty$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por definição, para $f$ contínua em $[a,\\infty)$, a integral $\\int_a^{\\infty} f(x)\\,dx$ é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\lim_{b\\to\\infty} \\int_a^{b} f(x)\\,dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\int_a^{b} f(x)\\,dx$ para $b$ finito qualquer",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lim_{b\\to 0} \\int_a^{b} f(x)\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(\\infty) - f(a)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre a integral $\\int_1^{\\infty} \\frac{1}{x}\\,dx$, é correto afirmar que ela:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Diverge para $\\infty$",
                                isCorrect: true,
                            },
                            {
                                text: "Converge para $1$",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $0$",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $\\ln 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $\\int_0^{\\infty} e^{-x}\\,dx$ é:",
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
                                text: "$-1$",
                                isCorrect: false,
                            },
                            {
                                text: "Diverge, pois o intervalo é infinito",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A integral $\\int_{-\\infty}^{\\infty} \\frac{1}{1+x^2}\\,dx$ vale:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\pi$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\pi}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "Diverge",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Integrais impróprias com descontinuidade no integrando",
                blocks: [
                    {
                        type: "text",
                        value: "## O segundo tipo de integral imprópria\n\nExiste outra situação em que a integral é imprópria mesmo com intervalo $[a,b]$ **limitado**: quando o **integrando fica ilimitado** dentro do intervalo, tipicamente por causa de uma assíntota vertical. Esse é o tipo de **segunda espécie**.\n\nPor exemplo, em $\\int_0^{1} \\dfrac{1}{\\sqrt{x}}\\,dx$ o intervalo é finito, mas $\\dfrac{1}{\\sqrt{x}} \\to \\infty$ quando $x\\to 0^+$. Não podemos avaliar a primitiva diretamente em $x=0$, então de novo recorremos a um limite.",
                    },
                    {
                        type: "text",
                        value: "## Descontinuidade em um extremo\n\nSe $f$ é contínua em $[a,b)$ e $\\lim_{x\\to b^-} |f(x)| = \\infty$, definimos\n\n$$\\int_a^{b} f(x)\\,dx = \\lim_{t\\to b^-} \\int_a^{t} f(x)\\,dx.$$\n\nSe $f$ é contínua em $(a,b]$ e explode em $x=a$, isto é $\\lim_{x\\to a^+}|f(x)| = \\infty$, então\n\n$$\\int_a^{b} f(x)\\,dx = \\lim_{t\\to a^+} \\int_t^{b} f(x)\\,dx.$$\n\nComo sempre, a integral **converge** se o limite for finito e **diverge** caso contrário.",
                    },
                    {
                        type: "text",
                        value: "## Descontinuidade no interior\n\nSe a descontinuidade está em um ponto interior $c$, com $a < c < b$, quebramos a integral em $c$:\n\n$$\\int_a^{b} f(x)\\,dx = \\int_a^{c} f(x)\\,dx + \\int_c^{b} f(x)\\,dx,$$\n\ne cada parcela é tratada como imprópria. A integral original converge apenas se **as duas** convergirem. Ignorar a descontinuidade interior e aplicar a primitiva direto nos extremos é um erro clássico que produz resultados sem sentido.",
                    },
                    {
                        type: "quote",
                        value: "Nem todo buraco no gráfico impede a área de ser finita: às vezes a função dispara, mas a área permanece domada.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: converge apesar da assíntota\n\nCalculemos $\\int_0^{1} \\dfrac{1}{\\sqrt{x}}\\,dx$. A descontinuidade está em $x=0$, então usamos limite pelo extremo inferior:\n\n$$\\int_0^{1} \\frac{1}{\\sqrt{x}}\\,dx = \\lim_{t\\to 0^+} \\int_t^{1} x^{-1/2}\\,dx = \\lim_{t\\to 0^+} \\left[\\,2\\sqrt{x}\\,\\right]_t^{1} = \\lim_{t\\to 0^+}\\left(2 - 2\\sqrt{t}\\right) = 2.$$\n\nComo $\\sqrt{t}\\to 0$, a integral **converge** e vale $2$. A função explode em $0$, mas de forma suave o bastante para a área ser finita.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: uma que diverge\n\nJá $\\int_0^{1} \\dfrac{1}{x}\\,dx$ tem comportamento diferente:\n\n$$\\int_0^{1} \\frac{1}{x}\\,dx = \\lim_{t\\to 0^+} \\left[\\ln x\\right]_t^{1} = \\lim_{t\\to 0^+}\\left(0 - \\ln t\\right) = +\\infty.$$\n\nLogo, **diverge**. Compare com o exemplo anterior: $\\dfrac{1}{\\sqrt{x}}$ cresce mais devagar perto de $0$ do que $\\dfrac{1}{x}$, e essa diferença de intensidade decide a convergência.",
                    },
                    {
                        type: "text",
                        value: "## Cuidado com a descontinuidade escondida\n\nConsidere $\\int_{-1}^{1} \\dfrac{1}{x^2}\\,dx$. Aplicar a primitiva sem pensar levaria a $\\left[-\\frac{1}{x}\\right]_{-1}^{1} = -1 - 1 = -2$, um número **negativo** para a integral de uma função positiva. Absurdo. O erro é ignorar a assíntota em $x=0$. Separando corretamente, $\\int_0^{1} \\dfrac{1}{x^2}\\,dx$ já diverge, portanto a integral toda **diverge**.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Integral imprópria de segunda espécie: intervalo finito, mas integrando **ilimitado** (assíntota vertical).\n- Descontinuidade num extremo: use limite pelo lado apropriado, $\\lim_{t\\to b^-}$ ou $\\lim_{t\\to a^+}$.\n- Descontinuidade interior em $c$: quebre em $c$ e exija a convergência das duas partes.\n- Referências: $\\int_0^{1}\\frac{1}{\\sqrt{x}}\\,dx = 2$ (converge), $\\int_0^{1}\\frac{1}{x}\\,dx$ diverge, e a armadilha de $\\int_{-1}^{1}\\frac{1}{x^2}\\,dx$, que diverge.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A integral $\\int_0^{1} \\frac{1}{\\sqrt{x}}\\,dx$ converge para:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "Diverge, pois explode em $x=0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em $\\int_0^{1} \\frac{1}{x}\\,dx$, o integrando é descontínuo (ilimitado) em qual ponto?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = \\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "Em nenhum ponto do intervalo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A integral $\\int_0^{1} \\frac{1}{x}\\,dx$:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Diverge para $\\infty$",
                                isCorrect: true,
                            },
                            {
                                text: "Converge para $1$",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $0$",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $\\ln 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $f$ é contínua em $[a,b)$ e $\\lim_{x\\to b^-} f(x) = \\infty$, então $\\int_a^{b} f(x)\\,dx$ é definida como:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\lim_{t\\to b^-} \\int_a^{t} f(x)\\,dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\lim_{t\\to b^+} \\int_a^{t} f(x)\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lim_{t\\to a^+} \\int_t^{b} f(x)\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_a^{b} f(x)\\,dx$ calculada diretamente",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre a integral $\\int_{-1}^{1} \\frac{1}{x^2}\\,dx$, a afirmação correta é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Diverge, pois explode em $x=0$",
                                isCorrect: true,
                            },
                            {
                                text: "Vale $-2$ pela primitiva direta",
                                isCorrect: false,
                            },
                            {
                                text: "Vale $2$ por causa da simetria",
                                isCorrect: false,
                            },
                            {
                                text: "Vale $0$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Convergência e divergência",
                blocks: [
                    {
                        type: "text",
                        value: "## O que significa convergir\n\nEm toda integral imprópria a definição passa por um limite. Dizemos que a integral **converge** quando esse limite existe e é um **número real finito**; nesse caso o valor da integral é justamente o limite. Quando o limite é $+\\infty$, $-\\infty$ ou simplesmente não existe, a integral **diverge**.\n\nMuitas vezes o valor exato não interessa tanto quanto a pergunta prévia: a integral converge ou não? Esta aula organiza as ferramentas para responder isso rapidamente em uma família muito frequente.",
                    },
                    {
                        type: "text",
                        value: "## As p-integrais no infinito\n\nConsidere a família $\\int_1^{\\infty} \\dfrac{1}{x^p}\\,dx$, com $p > 0$. Para $p \\ne 1$,\n\n$$\\int_1^{b} x^{-p}\\,dx = \\left[\\frac{x^{1-p}}{1-p}\\right]_1^{b} = \\frac{b^{1-p} - 1}{1-p}.$$\n\nQuando $b\\to\\infty$, o termo $b^{1-p}$ vai a $0$ se $1-p < 0$ (isto é, $p > 1$) e vai a $\\infty$ se $1-p > 0$ (isto é, $p < 1$). Para $p = 1$ recaímos em $\\ln b \\to \\infty$.",
                    },
                    {
                        type: "text",
                        value: "## Conclusão para o infinito\n\nJuntando os casos, obtemos um critério direto:\n\n$$\\int_1^{\\infty} \\frac{1}{x^p}\\,dx \\ \\text{converge} \\iff p > 1, \\quad \\text{e então vale } \\frac{1}{p-1}.$$\n\nPara $p \\le 1$ a integral diverge. Perceba a coerência com a Aula 1: $p=2$ dá $\\frac{1}{2-1}=1$, e $p=1$ diverge.",
                    },
                    {
                        type: "text",
                        value: "## As p-integrais perto de zero\n\nPerto de uma singularidade o critério **inverte**. Para $\\int_0^{1} \\dfrac{1}{x^p}\\,dx$ com $p\\ne 1$,\n\n$$\\int_t^{1} x^{-p}\\,dx = \\frac{1 - t^{1-p}}{1-p}.$$\n\nQuando $t\\to 0^+$, o termo $t^{1-p}$ vai a $0$ se $1-p > 0$ (isto é, $p < 1$) e explode se $p > 1$. Logo:\n\n$$\\int_0^{1} \\frac{1}{x^p}\\,dx \\ \\text{converge} \\iff p < 1, \\quad \\text{e então vale } \\frac{1}{1-p}.$$",
                    },
                    {
                        type: "text",
                        value: "## Quadro-resumo das p-integrais\n\nO contraste entre os dois cenários é o coração desta aula:\n\n| Integral | Converge quando | Valor (quando converge) |\n| --- | --- | --- |\n| $\\int_1^{\\infty} \\frac{1}{x^p}\\,dx$ | $p > 1$ | $\\frac{1}{p-1}$ |\n| $\\int_0^{1} \\frac{1}{x^p}\\,dx$ | $p < 1$ | $\\frac{1}{1-p}$ |\n\nNo infinito, precisamos de decaimento **rápido** ($p$ grande). Perto de zero, precisamos de singularidade **fraca** ($p$ pequeno). O caso limítrofe $p=1$ diverge nas duas situações.",
                    },
                    {
                        type: "quote",
                        value: "Convergir ou divergir é a primeira pergunta a fazer, muitas vezes antes mesmo de pensar em calcular qualquer valor.",
                    },
                    {
                        type: "text",
                        value: "## Exemplos rápidos\n\nCom o quadro em mãos, decidimos quase de cabeça:\n\n- $\\int_1^{\\infty} \\dfrac{1}{x^3}\\,dx$: aqui $p=3>1$, converge, e vale $\\dfrac{1}{3-1}=\\dfrac{1}{2}$.\n- $\\int_1^{\\infty} \\dfrac{1}{\\sqrt{x}}\\,dx$: aqui $p=\\tfrac{1}{2}\\le 1$, portanto **diverge**.\n- $\\int_0^{1} \\dfrac{1}{x^{2/3}}\\,dx$: aqui $p=\\tfrac{2}{3}<1$, converge, e vale $\\dfrac{1}{1-2/3}=3$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Converge significa que o limite da definição é finito; caso contrário, diverge.\n- No infinito: $\\int_1^{\\infty}\\frac{1}{x^p}\\,dx$ converge se e só se $p>1$, com valor $\\frac{1}{p-1}$.\n- Perto de zero: $\\int_0^{1}\\frac{1}{x^p}\\,dx$ converge se e só se $p<1$, com valor $\\frac{1}{1-p}$.\n- O expoente $p=1$ é a fronteira e diverge nos dois casos.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A integral $\\int_1^{\\infty} \\frac{1}{x^p}\\,dx$ converge exatamente quando:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$p > 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$p < 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$p = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$p \\ge 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $\\int_1^{\\infty} \\frac{1}{x^3}\\,dx$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "Diverge",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A integral $\\int_0^{1} \\frac{1}{x^p}\\,dx$ converge exatamente quando:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$p < 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$p > 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$p = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$p \\ge 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre $\\int_1^{\\infty} \\frac{1}{\\sqrt{x}}\\,dx$, temos que ela:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Diverge",
                                isCorrect: true,
                            },
                            {
                                text: "Converge para $2$",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $\\int_1^{\\infty} \\frac{1}{x^{3/2}}\\,dx$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{2}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "Diverge",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O critério da comparação",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando não dá para calcular\n\nNem sempre encontramos uma primitiva elementar. Integrais como $\\int_1^{\\infty} e^{-x^2}\\,dx$ ou $\\int_1^{\\infty} \\dfrac{1}{x^2+1}\\,dx$ nem sempre pedem o valor exato: muitas vezes basta saber se **convergem**. Nesses casos, o **critério da comparação** decide o destino da integral confrontando a função com outra mais simples, cujo comportamento já conhecemos.",
                    },
                    {
                        type: "text",
                        value: "## O teorema da comparação\n\nSejam $f$ e $g$ contínuas com $0 \\le f(x) \\le g(x)$ para todo $x \\ge a$. Então:\n\n$$\\text{(a) se } \\int_a^{\\infty} g(x)\\,dx \\text{ converge, então } \\int_a^{\\infty} f(x)\\,dx \\text{ converge};$$\n\n$$\\text{(b) se } \\int_a^{\\infty} f(x)\\,dx \\text{ diverge, então } \\int_a^{\\infty} g(x)\\,dx \\text{ diverge}.$$\n\nA intuição é geométrica: se a área maior (sob $g$) é finita, a menor (sob $f$) também é. E se a área menor já é infinita, a maior só pode ser infinita também.",
                    },
                    {
                        type: "text",
                        value: "## Como escolher a função de comparação\n\nA arte está em achar um $g$ conhecido. As p-integrais da aula anterior são as candidatas naturais. Para mostrar **convergência**, procuramos um $g$ **maior** que converge; para mostrar **divergência**, procuramos um $g$ **menor** que diverge. Uma dica prática: olhe o termo dominante quando $x\\to\\infty$ e compare com $\\dfrac{1}{x^p}$ ou com $e^{-x}$.",
                    },
                    {
                        type: "text",
                        value: "## O critério do limite\n\nÀs vezes a desigualdade termo a termo é chata de verificar. Uma variante útil é o **critério da comparação no limite**: se $f, g > 0$ e\n\n$$\\lim_{x\\to\\infty} \\frac{f(x)}{g(x)} = L, \\quad \\text{com } 0 < L < \\infty,$$\n\nentão $\\int_a^{\\infty} f(x)\\,dx$ e $\\int_a^{\\infty} g(x)\\,dx$ têm o mesmo destino, ou ambas convergem ou ambas divergem. Ele é cômodo quando as funções são semelhantes no infinito.",
                    },
                    {
                        type: "quote",
                        value: "Quando a conta é difícil, compare: uma função conhecida por cima ou por baixo já revela o destino da integral.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo de convergência\n\nAnalise $\\int_1^{\\infty} \\dfrac{1}{x^2+1}\\,dx$. Para $x \\ge 1$ vale\n\n$$0 < \\frac{1}{x^2+1} \\le \\frac{1}{x^2},$$\n\npois o denominador $x^2+1$ é maior que $x^2$. Como $\\int_1^{\\infty} \\dfrac{1}{x^2}\\,dx$ converge (p-integral com $p=2>1$), pelo item (a) a integral dada também **converge**. Não precisamos do valor exato para concluir isso.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo de divergência\n\nAnalise $\\int_2^{\\infty} \\dfrac{1}{\\ln x}\\,dx$. Para $x \\ge 2$ temos $\\ln x < x$, logo\n\n$$\\frac{1}{\\ln x} > \\frac{1}{x} > 0.$$\n\nComo $\\int_2^{\\infty} \\dfrac{1}{x}\\,dx$ diverge, pelo item (b) a integral maior também **diverge**. Aqui usamos uma minorante conhecida que já diverge para arrastar a integral junto.\n\n## Resumo\n\n- Comparação: com $0 \\le f \\le g$, convergência de $\\int g$ puxa a de $\\int f$; divergência de $\\int f$ puxa a de $\\int g$.\n- Para convergência, procure majorante convergente; para divergência, minorante divergente.\n- As p-integrais e $e^{-x}$ são as melhores funções de referência.\n- Critério do limite: se $f/g \\to L$ finito e positivo, ambas têm o mesmo destino.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Se $0 \\le f(x) \\le g(x)$ para $x \\ge a$ e $\\int_a^{\\infty} g(x)\\,dx$ converge, então:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\int_a^{\\infty} f(x)\\,dx$ converge",
                                isCorrect: true,
                            },
                            {
                                text: "$\\int_a^{\\infty} f(x)\\,dx$ diverge",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_a^{\\infty} f(x)\\,dx$ vale o mesmo que $\\int_a^{\\infty} g(x)\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "nada se pode concluir sobre $f$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Comparando com $\\frac{1}{x^2}$, a integral $\\int_1^{\\infty} \\frac{1}{x^2+1}\\,dx$:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Converge",
                                isCorrect: true,
                            },
                            {
                                text: "Diverge",
                                isCorrect: false,
                            },
                            {
                                text: "Vale $\\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "Não pode ser comparada com $\\frac{1}{x^2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $0 \\le g(x) \\le f(x)$ para $x \\ge a$ e $\\int_a^{\\infty} g(x)\\,dx$ diverge, então:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\int_a^{\\infty} f(x)\\,dx$ diverge",
                                isCorrect: true,
                            },
                            {
                                text: "$\\int_a^{\\infty} f(x)\\,dx$ converge",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_a^{\\infty} f(x)\\,dx$ converge para $0$",
                                isCorrect: false,
                            },
                            {
                                text: "nada se pode concluir sobre $f$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sabendo que $\\frac{1}{\\ln x} > \\frac{1}{x}$ para $x \\ge 2$, a integral $\\int_2^{\\infty} \\frac{1}{\\ln x}\\,dx$:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Diverge",
                                isCorrect: true,
                            },
                            {
                                text: "Converge",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $\\ln 2$",
                                isCorrect: false,
                            },
                            {
                                text: "Vale $0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A integral $\\int_1^{\\infty} e^{-x^2}\\,dx$ converge porque, para $x \\ge 1$:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$e^{-x^2} \\le e^{-x}$, cuja integral converge",
                                isCorrect: true,
                            },
                            {
                                text: "$e^{-x^2} \\ge e^{-x}$, cuja integral diverge",
                                isCorrect: false,
                            },
                            {
                                text: "$e^{-x^2} \\ge \\frac{1}{x}$, cuja integral converge",
                                isCorrect: false,
                            },
                            {
                                text: "$e^{-x^2} \\le \\frac{1}{x^2}$, cuja integral diverge",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Aplicações das integrais impróprias",
                blocks: [
                    {
                        type: "text",
                        value: "## Onde aparecem as integrais impróprias\n\nIntegrais impróprias não são apenas curiosidade teórica. Elas medem áreas de regiões que se estendem ao infinito, volumes de sólidos ilimitados, probabilidades de eventos e são a base de transformadas usadas em engenharia e física. Nesta aula reunimos aplicações que mostram o alcance da ideia.",
                    },
                    {
                        type: "text",
                        value: "## Área de uma região ilimitada\n\nA região sob $y = e^{-x}$ para $x \\ge 0$ se estende infinitamente para a direita, mas tem área finita:\n\n$$A = \\int_0^{\\infty} e^{-x}\\,dx = 1.$$\n\nEsse é o primeiro fato surpreendente do tema: uma figura infinitamente longa pode encerrar área finita, desde que a altura decaia rápido o suficiente.",
                    },
                    {
                        type: "text",
                        value: "## Volume da trombeta de Torricelli\n\nGirando a curva $y = \\dfrac{1}{x}$, para $x \\ge 1$, em torno do eixo horizontal, obtemos um sólido infinitamente longo. Pelo método dos discos, seu volume é\n\n$$V = \\pi \\int_1^{\\infty} \\left(\\frac{1}{x}\\right)^2 dx = \\pi \\int_1^{\\infty} \\frac{1}{x^2}\\,dx = \\pi \\cdot 1 = \\pi.$$\n\nO volume é finito e vale exatamente $\\pi$. O curioso é que a área da superfície desse mesmo sólido é **infinita**: daria para enchê-lo de tinta, mas não para pintá-lo por fora. É o famoso paradoxo da trombeta de Gabriel.",
                    },
                    {
                        type: "text",
                        value: "## Probabilidade: a distribuição exponencial\n\nEm probabilidade, uma densidade contínua precisa ter área total igual a $1$. A **distribuição exponencial**, muito usada para tempos de espera, tem densidade $f(x) = \\lambda e^{-\\lambda x}$ para $x \\ge 0$, com $\\lambda > 0$. De fato,\n\n$$\\int_0^{\\infty} \\lambda e^{-\\lambda x}\\,dx = \\lambda \\cdot \\frac{1}{\\lambda} = 1,$$\n\nconfirmando que é uma densidade legítima. A integral imprópria é o que garante a normalização.",
                    },
                    {
                        type: "quote",
                        value: "Volumes finitos com superfícies infinitas mostram que a intuição precisa, de vez em quando, se curvar diante da matemática.",
                    },
                    {
                        type: "text",
                        value: "## Transformadas e a função Gama\n\nDuas ferramentas centrais da matemática aplicada nascem de integrais impróprias. A **transformada de Laplace** de uma função $f$ é\n\n$$\\mathcal{L}\\{f\\}(s) = \\int_0^{\\infty} e^{-st} f(t)\\,dt,$$\n\nque converte problemas de equações diferenciais em problemas algébricos. Já a **função Gama** generaliza o fatorial:\n\n$$\\Gamma(n) = \\int_0^{\\infty} x^{n-1} e^{-x}\\,dx, \\qquad \\Gamma(n) = (n-1)! \\text{ para } n \\text{ inteiro positivo.}$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: média da exponencial\n\nVamos calcular a média (valor esperado) da distribuição exponencial, $E[X] = \\int_0^{\\infty} x\\,\\lambda e^{-\\lambda x}\\,dx$. Por partes, com $u = x$ e $dv = \\lambda e^{-\\lambda x}\\,dx$, chega-se a\n\n$$E[X] = \\lambda \\cdot \\frac{1}{\\lambda^2} = \\frac{1}{\\lambda}.$$\n\nComo caso particular da função Gama, note também que $\\Gamma(1) = \\int_0^{\\infty} e^{-x}\\,dx = 1$, coerente com $\\Gamma(1) = 0! = 1$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Regiões e sólidos ilimitados podem ter área ou volume finitos, como a trombeta de Torricelli, com $V = \\pi$.\n- Densidades de probabilidade se normalizam por integrais impróprias, como $\\int_0^{\\infty}\\lambda e^{-\\lambda x}\\,dx = 1$.\n- A transformada de Laplace é $\\int_0^{\\infty} e^{-st} f(t)\\,dt$ e a função Gama é $\\int_0^{\\infty} x^{n-1} e^{-x}\\,dx$.\n- A média da exponencial vale $\\frac{1}{\\lambda}$, obtida por integração por partes até o infinito.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O volume do sólido gerado ao girar $y = \\frac{1}{x}$, com $x \\ge 1$, em torno do eixo horizontal é $\\pi\\int_1^{\\infty} \\frac{1}{x^2}\\,dx$, ou seja:",
                        difficulty: "facil",
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
                                text: "Infinito",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para a densidade exponencial com $\\lambda > 0$, o valor de $\\int_0^{\\infty} \\lambda e^{-\\lambda x}\\,dx$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\lambda$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{\\lambda}$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A transformada de Laplace de uma função $f$ é definida por:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\int_0^{\\infty} e^{-st} f(t)\\,dt$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\int_0^{\\infty} e^{st} f(t)\\,dt$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_{-\\infty}^{\\infty} e^{-st} f(t)\\,dt$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_0^{\\infty} f(t)\\,dt$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $\\Gamma(1) = \\int_0^{\\infty} e^{-x}\\,dx$ é:",
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
                                text: "$e$",
                                isCorrect: false,
                            },
                            {
                                text: "Diverge",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A média da distribuição exponencial, $\\int_0^{\\infty} x\\,\\lambda e^{-\\lambda x}\\,dx$, vale:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{1}{\\lambda}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\lambda$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{\\lambda^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Aplicações da integral",
        aulas: [
            {
                titulo: "Área entre curvas",
                blocks: [
                    {
                        type: "text",
                        value: "# Área entre curvas\n\nQuando duas curvas $y = f(x)$ e $y = g(x)$ delimitam uma região no plano, a integral definida calcula a área exata dessa região. A ideia é a mesma da integral de Riemann: fatiamos a região em retângulos verticais finos, de largura $dx$, e somamos suas áreas.\n\nSe em todo o intervalo $[a, b]$ vale $f(x) \\ge g(x)$, cada retângulo tem altura $f(x) - g(x)$, e a área total é o limite dessas somas.",
                    },
                    {
                        type: "text",
                        value: "## A fórmula\n\nCom $f(x) \\ge g(x)$ em $[a, b]$, a área entre as curvas é\n\n$$A = \\int_a^b [f(x) - g(x)]\\,dx.$$\n\nO integrando é sempre a curva de cima menos a curva de baixo. Por isso o resultado nunca é negativo: se aparecer um valor negativo, as funções foram trocadas de posição.",
                    },
                    {
                        type: "text",
                        value: "## Encontrando os limites\n\nQuando o enunciado não fornece $a$ e $b$, eles vêm dos pontos de interseção das curvas, obtidos ao resolver $f(x) = g(x)$.\n\nÉ preciso verificar qual curva está por cima em cada trecho. Se as curvas trocam de posição dentro do intervalo, dividimos a região em partes e ajustamos o integrando em cada uma.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: reta e parábola\n\nVamos calcular a área entre $y = x$ e $y = x^2$.\n\n**Interseções:** de $x = x^2$ vem $x^2 - x = 0$, logo $x(x - 1) = 0$, com $x = 0$ e $x = 1$.\n\n**Quem está por cima:** em $x = \\tfrac{1}{2}$ temos $x = 0{,}5$ e $x^2 = 0{,}25$, então a reta está acima da parábola.\n\n**Integral:**\n\n$$A = \\int_0^1 (x - x^2)\\,dx = \\left[\\frac{x^2}{2} - \\frac{x^3}{3}\\right]_0^1 = \\frac{1}{2} - \\frac{1}{3} = \\frac{1}{6}.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: parábola e reta inclinada\n\nQual a área limitada por $y = x^2$ e $y = x + 2$?\n\n**Interseções:** de $x^2 = x + 2$ vem $x^2 - x - 2 = 0$, isto é, $(x - 2)(x + 1) = 0$, com $x = -1$ e $x = 2$.\n\n**Quem está por cima:** em $x = 0$, a reta vale $2$ e a parábola vale $0$, então $y = x + 2$ está acima.\n\n**Integral:**\n\n$$A = \\int_{-1}^{2} [(x + 2) - x^2]\\,dx = \\left[\\frac{x^2}{2} + 2x - \\frac{x^3}{3}\\right]_{-1}^{2} = \\frac{10}{3} - \\left(-\\frac{7}{6}\\right) = \\frac{9}{2}.$$",
                    },
                    {
                        type: "text",
                        value: "## Integrando em relação a $y$\n\nÀs vezes é mais simples fatiar em retângulos horizontais. Se as curvas são $x = p(y)$ (direita) e $x = q(y)$ (esquerda), com $p(y) \\ge q(y)$ em $[c, d]$, então\n\n$$A = \\int_c^d [p(y) - q(y)]\\,dy.$$\n\nEsse formato evita dividir a região em várias partes quando as curvas são funções naturais de $y$.",
                    },
                    {
                        type: "quote",
                        value: "Antes de integrar, esboce a região e identifique quem está por cima. Um gráfico rápido evita quase todos os erros de sinal e de limites.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Área entre curvas: $A = \\int_a^b [f(x) - g(x)]\\,dx$, com $f$ por cima.\n- Sem limites dados, resolva $f(x) = g(x)$ para encontrá-los.\n- Se as curvas trocam de posição, divida o intervalo.\n- Quando conveniente, integre em relação a $y$: $A = \\int_c^d [p(y) - q(y)]\\,dy$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A área entre as curvas $y = x$ e $y = x^2$ no intervalo $[0, 1]$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\dfrac{1}{6}$",
                                isCorrect: true,
                            },
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
                        ],
                    },
                    {
                        statement: "Para $f(x) \\ge g(x)$ em $[a, b]$, a área entre as curvas é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\int_a^b [f(x) - g(x)]\\,dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\int_a^b [g(x) - f(x)]\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_a^b [f(x) + g(x)]\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_a^b [f(x) - g(x)]^2\\,dx$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A área da região limitada por $y = x^2$ e $y = x + 2$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\dfrac{9}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{10}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{7}{6}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{9}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para calcular a área entre $y = \\sqrt{x}$ e $y = x$ em $[0, 1]$, o integrando correto é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\sqrt{x} - x$",
                                isCorrect: true,
                            },
                            {
                                text: "$x - \\sqrt{x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{x} + x$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^2 - \\sqrt{x}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A área da região limitada por $y = \\sqrt{x}$ e $y = x^2$ vale:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\dfrac{1}{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{1}{6}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{2}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{5}{6}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Volumes por discos e anéis",
                blocks: [
                    {
                        type: "text",
                        value: "# Volumes por discos e anéis\n\nAo girar uma região plana em torno de um eixo, obtemos um sólido de revolução. Para calcular seu volume, fatiamos o sólido em pedaços finos perpendiculares ao eixo de rotação. Cada fatia é aproximadamente um cilindro achatado, um disco, de espessura $dx$.",
                    },
                    {
                        type: "text",
                        value: "## Método dos discos\n\nSe a região sob $y = f(x)$, entre $x = a$ e $x = b$, gira em torno do eixo $x$, cada fatia é um disco de raio $f(x)$ e área $\\pi [f(x)]^2$. Somando as fatias:\n\n$$V = \\pi \\int_a^b [f(x)]^2\\,dx.$$\n\nNão esqueça do $\\pi$ nem do quadrado: o raio da fatia é $f(x)$, mas o que entra na integral é a área do disco.",
                    },
                    {
                        type: "text",
                        value: "## Método dos anéis\n\nQuando a região gira e deixa um vazio no meio, cada fatia é um anel. Se $R(x)$ é o raio externo e $r(x)$ o interno, a área da fatia é $\\pi([R(x)]^2 - [r(x)]^2)$, e\n\n$$V = \\pi \\int_a^b \\left([R(x)]^2 - [r(x)]^2\\right)\\,dx.$$\n\nAtenção: subtraímos os quadrados dos raios, nunca $(R - r)^2$. Esse é o erro mais comum do método.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: disco\n\nGire a região sob $y = \\sqrt{x}$, com $0 \\le x \\le 4$, em torno do eixo $x$.\n\nO raio de cada disco é $\\sqrt{x}$, então\n\n$$V = \\pi \\int_0^4 (\\sqrt{x})^2\\,dx = \\pi \\int_0^4 x\\,dx = \\pi \\left[\\frac{x^2}{2}\\right]_0^4 = 8\\pi.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: anel\n\nGire a região entre $y = x$ e $y = x^2$, com $0 \\le x \\le 1$, em torno do eixo $x$.\n\nComo $x \\ge x^2$ nesse intervalo, o raio externo é $R = x$ e o interno é $r = x^2$. Logo\n\n$$V = \\pi \\int_0^1 (x^2 - x^4)\\,dx = \\pi \\left[\\frac{x^3}{3} - \\frac{x^5}{5}\\right]_0^1 = \\pi\\left(\\frac{1}{3} - \\frac{1}{5}\\right) = \\frac{2\\pi}{15}.$$",
                    },
                    {
                        type: "text",
                        value: "## Disco ou anel?\n\n| Situação | Fatia | Integrando |\n| --- | --- | --- |\n| Região encostada no eixo | disco | $[f(x)]^2$ |\n| Região afastada do eixo | anel | $[R(x)]^2 - [r(x)]^2$ |\n\nEm ambos os casos o fator $\\pi$ multiplica a integral. A escolha depende apenas de existir ou não um vazio entre a região e o eixo de rotação.",
                    },
                    {
                        type: "quote",
                        value: "Desenhe o raio de uma fatia genérica antes de montar a integral. O raio é a distância da curva ao eixo, e é ele que define todo o cálculo.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Discos (região sem vazio): $V = \\pi \\int_a^b [f(x)]^2\\,dx$.\n- Anéis (região com vazio): $V = \\pi \\int_a^b ([R(x)]^2 - [r(x)]^2)\\,dx$.\n- Sempre eleve os raios ao quadrado e mantenha o $\\pi$.\n- Subtraia quadrados de raios, jamais $(R - r)^2$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Girando a região sob $y = \\sqrt{x}$, com $0 \\le x \\le 4$, em torno do eixo $x$, o volume é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$8\\pi$",
                                isCorrect: true,
                            },
                            {
                                text: "$8$",
                                isCorrect: false,
                            },
                            {
                                text: "$16\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$4\\pi$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O volume gerado ao girar a região sob $y = f(x)$ em torno do eixo $x$ (método dos discos) é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\pi \\int_a^b [f(x)]^2\\,dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\pi \\int_a^b f(x)\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_a^b [f(x)]^2\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\pi \\int_a^b [f(x)]^2\\,dx$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O volume do sólido obtido girando a região entre $y = x$ e $y = x^2$, com $0 \\le x \\le 1$, em torno do eixo $x$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\dfrac{2\\pi}{15}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{\\pi}{30}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{2}{15}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{8\\pi}{15}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No método dos anéis, o integrando correto com raio externo $R$ e interno $r$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$[R(x)]^2 - [r(x)]^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$(R(x) - r(x))^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$[R(x)]^2 + [r(x)]^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$R(x) - r(x)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Girando a região entre $y = \\sqrt{x}$ e $y = x$, com $0 \\le x \\le 1$, em torno do eixo $x$, o volume é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\dfrac{\\pi}{6}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{\\pi}{30}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{\\pi}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{5\\pi}{6}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Volumes por cascas cilíndricas",
                blocks: [
                    {
                        type: "text",
                        value: "# Volumes por cascas cilíndricas\n\nO método das cascas é uma alternativa aos discos e anéis, especialmente útil quando a rotação é em torno do eixo $y$ e a região é descrita por $y = f(x)$. Em vez de fatiar perpendicularmente ao eixo, fatiamos em retângulos paralelos ao eixo de rotação. Cada retângulo, ao girar, gera uma casca cilíndrica fina.",
                    },
                    {
                        type: "text",
                        value: "## A fórmula\n\nUma casca de raio $x$, altura $f(x)$ e espessura $dx$ tem volume aproximado igual a circunferência vezes altura vezes espessura: $2\\pi x \\cdot f(x)\\,dx$. Somando as cascas de $a$ até $b$:\n\n$$V = 2\\pi \\int_a^b x\\,f(x)\\,dx.$$\n\nO fator $2\\pi$ vem da circunferência $2\\pi x$ desenrolada. Aqui o raio não é elevado ao quadrado: a altura entra linearmente.",
                    },
                    {
                        type: "text",
                        value: "## Forma geral\n\nDe modo mais amplo, cada casca tem um raio (distância ao eixo) e uma altura (extensão da região naquele ponto):\n\n$$V = 2\\pi \\int_a^b (\\text{raio})(\\text{altura})\\,dx.$$\n\nSe a região está entre duas curvas, $y_1$ por cima e $y_2$ por baixo, a altura da casca é $y_1 - y_2$.",
                    },
                    {
                        type: "text",
                        value: "## Cascas ou discos?\n\n| Rotação em torno de | Fatia vertical vira | Método natural |\n| --- | --- | --- |\n| Eixo $y$ | casca | cascas |\n| Eixo $x$ | disco | discos |\n\nA vantagem das cascas aparece quando inverter a função para usar discos seria trabalhoso. Os dois métodos, quando aplicáveis, dão o mesmo volume.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: parábola em torno do eixo $y$\n\nGire a região sob $y = x^2$, com $0 \\le x \\le 2$, em torno do eixo $y$.\n\nA casca genérica tem raio $x$ e altura $x^2$, então\n\n$$V = 2\\pi \\int_0^2 x \\cdot x^2\\,dx = 2\\pi \\int_0^2 x^3\\,dx = 2\\pi \\left[\\frac{x^4}{4}\\right]_0^2 = 8\\pi.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: região entre duas curvas\n\nGire a região entre $y = x$ e $y = x^2$, com $0 \\le x \\le 1$, em torno do eixo $y$.\n\nComo $x \\ge x^2$ no intervalo, a altura da casca é $x - x^2$ e o raio é $x$. Assim\n\n$$V = 2\\pi \\int_0^1 x(x - x^2)\\,dx = 2\\pi \\int_0^1 (x^2 - x^3)\\,dx = 2\\pi\\left(\\frac{1}{3} - \\frac{1}{4}\\right) = \\frac{\\pi}{6}.$$",
                    },
                    {
                        type: "quote",
                        value: "Cascas ou discos são dois caminhos para o mesmo destino. Escolha o que deixa a integral mais simples e a montagem menos sujeita a erros.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Cascas cilíndricas: $V = 2\\pi \\int_a^b x\\,f(x)\\,dx$ para rotação em torno do eixo $y$.\n- Forma geral: $V = 2\\pi \\int_a^b (\\text{raio})(\\text{altura})\\,dx$.\n- O fator é $2\\pi$ e o raio entra linearmente, sem quadrado.\n- Entre duas curvas, a altura é a diferença $y_1 - y_2$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Pelo método das cascas cilíndricas, o volume ao girar a região sob $y = f(x)$ em torno do eixo $y$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$2\\pi \\int_a^b x\\,f(x)\\,dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\pi \\int_a^b x\\,f(x)\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\pi \\int_a^b [f(x)]^2\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\pi \\int_a^b f(x)\\,dx$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Girando a região sob $y = x^2$, com $0 \\le x \\le 2$, em torno do eixo $y$, o volume é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$8\\pi$",
                                isCorrect: true,
                            },
                            {
                                text: "$4\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$16\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$8$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O volume ao girar a região sob $y = x^2$, com $0 \\le x \\le 1$, em torno do eixo $y$ (cascas) é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\dfrac{\\pi}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{\\pi}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{\\pi}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\pi$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Girando a região entre $y = x$ e $y = x^2$, com $0 \\le x \\le 1$, em torno do eixo $y$, o volume é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\dfrac{\\pi}{6}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{\\pi}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{\\pi}{12}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{2\\pi}{15}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Girando a região sob $y = \\sqrt{x}$, com $0 \\le x \\le 4$, em torno do eixo $y$, o volume é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\dfrac{128\\pi}{5}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{128\\pi}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{64\\pi}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{128}{5}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Comprimento de arco",
                blocks: [
                    {
                        type: "text",
                        value: "# Comprimento de arco\n\nAlém de áreas e volumes, a integral definida mede o comprimento de uma curva. A ideia é aproximar a curva por muitos segmentos de reta pequenos e somar seus comprimentos. Quanto menores os segmentos, melhor a aproximação, e no limite obtemos uma integral.",
                    },
                    {
                        type: "text",
                        value: "## Da hipotenusa à integral\n\nUm pedaço da curva tem projeção horizontal $dx$ e vertical $dy$. Pelo teorema de Pitágoras, seu comprimento é $ds = \\sqrt{dx^2 + dy^2}$. Colocando $dx$ em evidência:\n\n$$ds = \\sqrt{1 + \\left(\\frac{dy}{dx}\\right)^2}\\,dx.$$\n\nIntegrando de $a$ até $b$, chegamos à fórmula do comprimento de arco:\n\n$$L = \\int_a^b \\sqrt{1 + [f'(x)]^2}\\,dx.$$",
                    },
                    {
                        type: "text",
                        value: "## Curva em função de $y$\n\nSe for mais conveniente descrever a curva como $x = g(y)$, com $y$ de $c$ a $d$, a fórmula é análoga:\n\n$$L = \\int_c^d \\sqrt{1 + [g'(y)]^2}\\,dy.$$\n\nA escolha entre integrar em $x$ ou em $y$ costuma depender de qual derivada gera uma raiz mais fácil de integrar.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: uma potência conveniente\n\nCalcule o comprimento de $y = \\frac{2}{3}x^{3/2}$ para $0 \\le x \\le 3$.\n\nA derivada é $f'(x) = x^{1/2} = \\sqrt{x}$, logo $[f'(x)]^2 = x$. Assim\n\n$$L = \\int_0^3 \\sqrt{1 + x}\\,dx = \\left[\\frac{2}{3}(1 + x)^{3/2}\\right]_0^3 = \\frac{2}{3}(8 - 1) = \\frac{14}{3}.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: o truque do quadrado perfeito\n\nCalcule o comprimento de $y = \\frac{x^3}{6} + \\frac{1}{2x}$ para $1 \\le x \\le 2$.\n\nA derivada é $f'(x) = \\frac{x^2}{2} - \\frac{1}{2x^2}$. Ao elevar ao quadrado e somar $1$, o integrando vira um quadrado perfeito:\n\n$$1 + [f'(x)]^2 = \\left(\\frac{x^2}{2} + \\frac{1}{2x^2}\\right)^2.$$\n\nA raiz desaparece e\n\n$$L = \\int_1^2 \\left(\\frac{x^2}{2} + \\frac{1}{2x^2}\\right)dx = \\left[\\frac{x^3}{6} - \\frac{1}{2x}\\right]_1^2 = \\frac{17}{12}.$$",
                    },
                    {
                        type: "text",
                        value: "## Quando a integral não fecha\n\nA fórmula do comprimento de arco quase sempre produz integrais difíceis, porque a raiz raramente simplifica. Os exemplos de sala são escolhidos justamente para que $1 + [f'(x)]^2$ vire um quadrado perfeito. Em casos reais, recorre-se a métodos numéricos para estimar $L$.",
                    },
                    {
                        type: "quote",
                        value: "O comprimento de arco tem uma fórmula elegante e um cálculo teimoso. Vale mais dominar a montagem correta do que forçar uma integral que não fecha.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Comprimento de arco em $x$: $L = \\int_a^b \\sqrt{1 + [f'(x)]^2}\\,dx$.\n- Em função de $y$: $L = \\int_c^d \\sqrt{1 + [g'(y)]^2}\\,dy$.\n- Dentro da raiz está a derivada ao quadrado, não a função.\n- Procure escrever $1 + [f'(x)]^2$ como quadrado perfeito quando possível.",
                    },
                ],
                questions: [
                    {
                        statement: "O comprimento de arco de $y = f(x)$ em $[a, b]$ é dado por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\int_a^b \\sqrt{1 + [f'(x)]^2}\\,dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\int_a^b \\sqrt{1 + [f''(x)]^2}\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_a^b \\sqrt{1 + f'(x)}\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_a^b (1 + [f'(x)]^2)\\,dx$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Pela fórmula do comprimento de arco, o comprimento de $y = 2x$ para $0 \\le x \\le 1$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sqrt{5}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sqrt{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O comprimento de $y = \\frac{2}{3}x^{3/2}$ para $0 \\le x \\le 3$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\dfrac{14}{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{7}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{16}{3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A integral que dá o comprimento de $y = x^2$ para $0 \\le x \\le 1$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\int_0^1 \\sqrt{1 + 4x^2}\\,dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\int_0^1 \\sqrt{1 + x^4}\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_0^1 \\sqrt{1 + 2x}\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_0^1 \\sqrt{1 + 2x^2}\\,dx$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O comprimento de $y = \\frac{x^3}{6} + \\frac{1}{2x}$ para $1 \\le x \\le 2$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\dfrac{17}{12}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{13}{12}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{17}{6}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{5}{6}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Trabalho e valor médio de uma função",
                blocks: [
                    {
                        type: "text",
                        value: "# Trabalho e valor médio de uma função\n\nA integral definida aparece naturalmente na física. Quando uma força varia ao longo do deslocamento, o trabalho realizado não é simplesmente força vezes distância: precisamos somar contribuições infinitesimais, e isso é uma integral. Nesta aula vemos o trabalho de forças variáveis e o valor médio de uma função.",
                    },
                    {
                        type: "text",
                        value: "## Trabalho de uma força variável\n\nSe uma força $F(x)$ atua na direção do movimento e o objeto se desloca de $x = a$ até $x = b$, o trabalho é\n\n$$W = \\int_a^b F(x)\\,dx.$$\n\nQuando a força é constante, a integral se reduz a $F \\cdot (b - a)$, a fórmula elementar. A integral generaliza esse caso para forças que mudam ao longo do caminho.",
                    },
                    {
                        type: "text",
                        value: "## Lei de Hooke e molas\n\nUma mola esticada ou comprimida reage com força proporcional à deformação: $F(x) = kx$, em que $k$ é a constante da mola. O trabalho para deformá-la de $0$ até $d$ é\n\n$$W = \\int_0^d kx\\,dx = \\frac{k d^2}{2}.$$\n\nRepare no fator $\\frac{1}{2}$, que vem da integração e costuma ser esquecido.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: esticando uma mola\n\nUma mola tem constante $k = 200$ N/m. Qual o trabalho para esticá-la $0{,}1$ m a partir do repouso?\n\nPela fórmula,\n\n$$W = \\frac{k d^2}{2} = \\frac{200 \\cdot (0{,}1)^2}{2} = \\frac{200 \\cdot 0{,}01}{2} = 1 \\text{ J}.$$\n\nSem o fator $\\frac{1}{2}$, chegaríamos a $2$ J, o dobro do valor correto.",
                    },
                    {
                        type: "text",
                        value: "## Valor médio de uma função\n\nO valor médio de $f$ em $[a, b]$ generaliza a média aritmética para uma quantidade contínua:\n\n$$f_{\\text{med}} = \\frac{1}{b - a} \\int_a^b f(x)\\,dx.$$\n\nGeometricamente, $f_{\\text{med}}$ é a altura de um retângulo de base $b - a$ com a mesma área que a região sob a curva.",
                    },
                    {
                        type: "text",
                        value: "## Teorema do valor médio para integrais\n\nSe $f$ é contínua em $[a, b]$, existe pelo menos um ponto $c$ nesse intervalo em que a função assume exatamente seu valor médio:\n\n$$f(c) = \\frac{1}{b - a} \\int_a^b f(x)\\,dx.$$\n\nOu seja, a curva cruza a altura média em algum ponto do intervalo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: valor médio\n\nQual o valor médio de $f(x) = x^2$ em $[0, 3]$?\n\n$$f_{\\text{med}} = \\frac{1}{3 - 0} \\int_0^3 x^2\\,dx = \\frac{1}{3} \\left[\\frac{x^3}{3}\\right]_0^3 = \\frac{1}{3} \\cdot 9 = 3.$$\n\nComo $x^2$ atinge o valor $3$ dentro de $[0, 3]$, em $x = \\sqrt{3}$, o teorema se confirma.",
                    },
                    {
                        type: "quote",
                        value: "Trabalho e valor médio mostram a integral fora da geometria: somar infinitas contribuições contínuas é a essência do cálculo integral.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Trabalho de força variável: $W = \\int_a^b F(x)\\,dx$.\n- Mola (lei de Hooke): $W = \\frac{k d^2}{2}$, sem esquecer o fator $\\frac{1}{2}$.\n- Valor médio: $f_{\\text{med}} = \\frac{1}{b - a} \\int_a^b f(x)\\,dx$.\n- Teorema do valor médio: existe $c$ com $f(c) = f_{\\text{med}}$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O trabalho de uma força variável $F(x)$ ao deslocar um objeto de $a$ até $b$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\int_a^b F(x)\\,dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$F(b) - F(a)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_a^b F'(x)\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$F(x) \\cdot (b - a)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor médio de uma função $f$ contínua em $[a, b]$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\dfrac{1}{b - a} \\int_a^b f(x)\\,dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\int_a^b f(x)\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$(b - a) \\int_a^b f(x)\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{b - a} \\int_a^b f'(x)\\,dx$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor médio de $f(x) = x^2$ em $[0, 3]$ é:",
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
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{9}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma mola de constante $k = 200$ N/m é esticada $0{,}1$ m. O trabalho realizado é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1 \\text{ J}$",
                                isCorrect: true,
                            },
                            {
                                text: "$2 \\text{ J}$",
                                isCorrect: false,
                            },
                            {
                                text: "$20 \\text{ J}$",
                                isCorrect: false,
                            },
                            {
                                text: "$10 \\text{ J}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor médio de $f(x) = \\sin x$ em $[0, \\pi]$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\dfrac{2}{\\pi}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{1}{\\pi}$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{\\pi}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Sequências e séries numéricas",
        aulas: [
            {
                titulo: "Sequências",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é uma sequência\n\nUma **sequência** é uma lista ordenada e infinita de números reais, um para cada número natural. Formalmente, uma sequência é uma função cujo domínio é o conjunto dos inteiros positivos: a cada $n$ associamos um termo $a_n$. Escrevemos a sequência como $\\{a_n\\}$, ou $\\{a_n\\}_{n=1}^{\\infty}$, ou ainda listando os termos $a_1, a_2, a_3, \\ldots$\n\nO número $a_n$ é o **termo geral** da sequência. Ele costuma vir de uma fórmula fechada. Por exemplo, $a_n = \\frac{n}{n+1}$ gera $\\frac{1}{2}, \\frac{2}{3}, \\frac{3}{4}, \\ldots$; a sequência também pode ser dada por recorrência, como $a_1 = 1$ e $a_{n+1} = \\frac{1}{2}\\left(a_n + \\frac{2}{a_n}\\right)$.\n\nNão confunda a sequência $\\{a_n\\}$, que é a lista dos termos, com a série $\\sum a_n$, que é a soma deles. A série é o assunto das próximas aulas; aqui estudamos apenas o comportamento dos termos $a_n$ quando $n$ cresce.",
                    },
                    {
                        type: "text",
                        value: "## Limite de uma sequência\n\nA pergunta central é: para onde os termos $a_n$ se aproximam quando $n \\to \\infty$? Dizemos que a sequência **converge** para o limite $L$ e escrevemos\n$$\\lim_{n\\to\\infty} a_n = L$$\nquando os termos ficam arbitrariamente próximos de $L$ para todo $n$ suficientemente grande. Com precisão: para cada $\\varepsilon > 0$ existe um índice $N$ tal que $|a_n - L| < \\varepsilon$ sempre que $n > N$.\n\nSe esse limite $L$ existe e é finito, a sequência é **convergente**. Caso contrário, ela é **divergente**. Uma sequência pode divergir por crescer sem limite, como $a_n = n^2$, ou por oscilar sem se fixar, como $a_n = (-1)^n$, que alterna entre $-1$ e $1$ e não se aproxima de nenhum valor.",
                    },
                    {
                        type: "text",
                        value: "## Ferramentas para calcular limites\n\nOs limites de sequências obedecem às mesmas leis dos limites de funções. Se $\\lim_{n\\to\\infty} a_n = L$ e $\\lim_{n\\to\\infty} b_n = M$, então $\\lim (a_n + b_n) = L + M$, $\\lim (a_n b_n) = LM$ e $\\lim \\frac{a_n}{b_n} = \\frac{L}{M}$ quando $M \\neq 0$.\n\nVale também a ponte com funções de variável real: se $f(x) \\to L$ quando $x \\to \\infty$ e $a_n = f(n)$, então $\\lim_{n\\to\\infty} a_n = L$. Isso autoriza usar a regra de L'Hôpital na variável contínua $x$ para depois voltar a $n$.\n\nTrês resultados aparecem o tempo todo:\n\n- **Teorema do confronto:** se $b_n \\le a_n \\le c_n$ e $\\lim b_n = \\lim c_n = L$, então $\\lim a_n = L$.\n- **Valor absoluto:** se $\\lim_{n\\to\\infty} |a_n| = 0$, então $\\lim_{n\\to\\infty} a_n = 0$.\n- **Função contínua:** se $\\lim a_n = L$ e $f$ é contínua em $L$, então $\\lim f(a_n) = f(L)$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: quociente de polinômios\n\nConsidere $a_n = \\frac{3n^2 + 2}{n^2 + 5n}$. Dividimos numerador e denominador pela maior potência de $n$ presente, aqui $n^2$:\n$$a_n = \\frac{3 + \\frac{2}{n^2}}{1 + \\frac{5}{n}}.$$\nQuando $n \\to \\infty$, os termos $\\frac{2}{n^2}$ e $\\frac{5}{n}$ tendem a zero. Logo\n$$\\lim_{n\\to\\infty} a_n = \\frac{3 + 0}{1 + 0} = 3.$$\nA sequência converge para $3$.\n\n## Exemplo 2: sinal alternado\n\nConsidere $a_n = \\frac{(-1)^n}{n}$, que gera $-1, \\frac{1}{2}, -\\frac{1}{3}, \\frac{1}{4}, \\ldots$ Os termos trocam de sinal, mas seu tamanho encolhe. Como\n$$|a_n| = \\left|\\frac{(-1)^n}{n}\\right| = \\frac{1}{n} \\to 0,$$\no teorema do valor absoluto garante que $\\lim_{n\\to\\infty} a_n = 0$. Repare que o sinal alternado, por si só, não impede a convergência: o que importa é que a distância até $0$ vai a zero.",
                    },
                    {
                        type: "text",
                        value: "## Sequências monótonas e limitadas\n\nUma sequência é **crescente** se $a_n \\le a_{n+1}$ para todo $n$, e **decrescente** se $a_n \\ge a_{n+1}$. Nos dois casos dizemos que ela é **monótona**. Ela é **limitada** se existe $M$ com $|a_n| \\le M$ para todo $n$.\n\nNem toda sequência limitada converge: $(-1)^n$ é limitada mas oscila. Nem toda sequência monótona converge: $a_n = n$ cresce sem parar. Mas juntando as duas condições obtemos um dos resultados mais úteis do assunto.\n\n**Teorema da convergência monótona:** toda sequência monótona e limitada é convergente.\n\nEsse teorema garante a existência do limite mesmo sem fornecer seu valor. Ele é a ferramenta natural para sequências definidas por recorrência, em que uma fórmula fechada não está disponível.",
                    },
                    {
                        type: "text",
                        value: "## Limites de referência\n\nVale memorizar alguns limites que servem de base para os demais. Em cada um deles $n \\to \\infty$:\n\n- $\\lim_{n\\to\\infty} \\frac{1}{n^p} = 0$ para todo $p > 0$.\n- $\\lim_{n\\to\\infty} r^n = 0$ se $|r| < 1$; o limite é $1$ se $r = 1$; e a sequência diverge se $r > 1$ ou $r \\le -1$.\n- $\\lim_{n\\to\\infty} \\sqrt[n]{n} = 1$ e $\\lim_{n\\to\\infty} \\sqrt[n]{c} = 1$ para toda constante $c > 0$.\n- $\\lim_{n\\to\\infty} \\left(1 + \\frac{x}{n}\\right)^n = e^{x}$.\n- $\\lim_{n\\to\\infty} \\frac{\\ln n}{n} = 0$ e, mais geralmente, potências de $n$ dominam potências de $\\ln n$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: passando pela variável contínua\n\nVamos calcular $\\lim_{n\\to\\infty} \\frac{\\ln n}{n}$. Trocamos $n$ pela variável real $x$ e olhamos $\\lim_{x\\to\\infty} \\frac{\\ln x}{x}$, que é uma indeterminação do tipo $\\frac{\\infty}{\\infty}$. Pela regra de L'Hôpital,\n$$\\lim_{x\\to\\infty} \\frac{\\ln x}{x} = \\lim_{x\\to\\infty} \\frac{1/x}{1} = 0.$$\nComo a função tende a $0$, a sequência associada também tende: $\\lim_{n\\to\\infty} \\frac{\\ln n}{n} = 0$.\n\nO mesmo raciocínio mostra que $\\lim_{n\\to\\infty} n^{1/n} = 1$: aplicando logaritmo, $\\ln\\left(n^{1/n}\\right) = \\frac{\\ln n}{n} \\to 0$, e como a exponencial é contínua, $n^{1/n} \\to e^{0} = 1$.",
                    },
                    {
                        type: "quote",
                        value: "Antes de somar infinitos números, é preciso entender para onde eles caminham. A sequência é o alfabeto; a série será a palavra.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma sequência $\\{a_n\\}$ é uma lista infinita de termos; ela **converge** para $L$ se $\\lim_{n\\to\\infty} a_n = L$ existe e é finito, e **diverge** caso contrário.\n- As leis de limite, o teorema do confronto, o teorema do valor absoluto e a ponte com a variável contínua (com L'Hôpital) são as ferramentas de cálculo.\n- Toda sequência monótona e limitada converge, mesmo quando não sabemos o valor do limite.\n- Os limites de referência ($\\frac{1}{n^p}$, $r^n$, $\\sqrt[n]{n}$, $\\left(1+\\frac{x}{n}\\right)^n$) resolvem a maioria dos casos.\n- Cuidado para não confundir a sequência $\\{a_n\\}$ com a série $\\sum a_n$: aqui estudamos só o destino dos termos, não a soma deles.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual o valor de $\\lim_{n\\to\\infty} \\frac{n}{n+1}$?",
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
                                text: "$+\\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "A sequência diverge",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A sequência $a_n = \\left(\\frac{1}{2}\\right)^n$ tem limite igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "A sequência diverge",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O limite $\\lim_{n\\to\\infty} \\frac{(-1)^n}{n}$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "A sequência diverge por oscilar",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$-1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $\\lim_{n\\to\\infty} \\frac{2n^2 + n}{n^2 + 3}$ é:",
                        difficulty: "medio",
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
                                text: "$+\\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{2}{3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O limite $\\lim_{n\\to\\infty} \\left(1 + \\frac{3}{n}\\right)^n$ é igual a:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$e^{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$e$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^{1/3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Séries e a série geométrica",
                blocks: [
                    {
                        type: "text",
                        value: "## De sequência para série\n\nDada uma sequência $\\{a_n\\}$, a **série** associada é a soma infinita de seus termos:\n$$\\sum_{n=1}^{\\infty} a_n = a_1 + a_2 + a_3 + \\cdots$$\nSomar infinitos números exige cuidado. Damos sentido a essa soma através das **somas parciais**: a $n$-ésima soma parcial é\n$$s_n = \\sum_{k=1}^{n} a_k = a_1 + a_2 + \\cdots + a_n.$$\nAs somas parciais formam, elas próprias, uma nova sequência $\\{s_n\\}$.\n\nDizemos que a série **converge** e tem soma $s$ quando a sequência de somas parciais converge: $\\lim_{n\\to\\infty} s_n = s$. Nesse caso escrevemos $\\sum_{n=1}^{\\infty} a_n = s$. Se $\\lim_{n\\to\\infty} s_n$ não existe ou é infinito, a série **diverge**. Ou seja, a convergência de uma série é, por definição, a convergência da sequência de suas somas parciais.",
                    },
                    {
                        type: "text",
                        value: "## A série geométrica\n\nA série mais importante de todo o curso é a **geométrica**, em que cada termo é o anterior multiplicado por uma razão fixa $r$:\n$$\\sum_{n=1}^{\\infty} a\\,r^{n-1} = a + ar + ar^2 + ar^3 + \\cdots \\qquad (a \\neq 0).$$\nPara achar a soma, escrevemos a soma parcial $s_n = a + ar + \\cdots + ar^{n-1}$ e subtraímos $r\\,s_n$:\n$$s_n - r\\,s_n = a - ar^n \\quad\\Longrightarrow\\quad s_n = a\\,\\frac{1 - r^n}{1 - r} \\quad (r \\neq 1).$$\nAgora tomamos $n \\to \\infty$. Se $|r| < 1$, então $r^n \\to 0$ e a soma parcial converge. Se $|r| \\ge 1$, o termo $r^n$ não vai a zero e a série diverge. Concluímos:\n$$\\sum_{n=1}^{\\infty} a\\,r^{n-1} = \\frac{a}{1 - r} \\quad \\text{se } |r| < 1, \\qquad \\text{e diverge se } |r| \\ge 1.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: uma série geométrica\n\nCalcule $\\sum_{n=1}^{\\infty} \\frac{3}{4^n}$. Reescrevemos o termo geral para identificar $a$ e $r$:\n$$\\frac{3}{4^n} = 3 \\cdot \\left(\\frac{1}{4}\\right)^{n} = \\frac{3}{4}\\left(\\frac{1}{4}\\right)^{n-1}.$$\nO primeiro termo (com $n = 1$) é $a = \\frac{3}{4}$ e a razão é $r = \\frac{1}{4}$. Como $|r| = \\frac{1}{4} < 1$, a série converge e\n$$\\sum_{n=1}^{\\infty} \\frac{3}{4^n} = \\frac{a}{1 - r} = \\frac{3/4}{1 - 1/4} = \\frac{3/4}{3/4} = 1.$$\nA chave é sempre identificar corretamente o primeiro termo $a$ e a razão $r$ antes de aplicar a fórmula.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: dízima periódica como série\n\nToda dízima periódica é uma série geométrica disfarçada. Tome $0{,}\\overline{7} = 0{,}7777\\ldots$ Escrevemos\n$$0{,}\\overline{7} = \\frac{7}{10} + \\frac{7}{100} + \\frac{7}{1000} + \\cdots = \\sum_{n=1}^{\\infty} \\frac{7}{10}\\left(\\frac{1}{10}\\right)^{n-1}.$$\nAqui $a = \\frac{7}{10}$ e $r = \\frac{1}{10}$, com $|r| < 1$. Logo\n$$0{,}\\overline{7} = \\frac{7/10}{1 - 1/10} = \\frac{7/10}{9/10} = \\frac{7}{9}.$$\nEsse é o motivo pelo qual $0{,}\\overline{9} = \\frac{9/10}{9/10} = 1$ de verdade, e não apenas por aproximação.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: série telescópica\n\nNem toda série somável é geométrica. Considere $\\sum_{n=1}^{\\infty} \\frac{1}{n(n+1)}$. Usamos frações parciais:\n$$\\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}.$$\nA soma parcial encaixa como uma luneta, cancelando termos vizinhos:\n$$s_n = \\left(1 - \\frac{1}{2}\\right) + \\left(\\frac{1}{2} - \\frac{1}{3}\\right) + \\cdots + \\left(\\frac{1}{n} - \\frac{1}{n+1}\\right) = 1 - \\frac{1}{n+1}.$$\nTomando $n \\to \\infty$, temos $\\frac{1}{n+1} \\to 0$, portanto\n$$\\sum_{n=1}^{\\infty} \\frac{1}{n(n+1)} = \\lim_{n\\to\\infty}\\left(1 - \\frac{1}{n+1}\\right) = 1.$$\nSéries desse tipo, chamadas **telescópicas**, são somadas diretamente pelas somas parciais.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades e um aviso\n\nSéries convergentes se comportam bem sob operações lineares. Se $\\sum a_n = A$ e $\\sum b_n = B$ convergem e $c$ é constante, então\n$$\\sum_{n=1}^{\\infty} (a_n \\pm b_n) = A \\pm B, \\qquad \\sum_{n=1}^{\\infty} c\\,a_n = c\\,A.$$\nAlém disso, acrescentar ou remover um número finito de termos não altera se a série converge ou diverge, embora possa alterar o valor da soma.\n\nUm aviso importante encerra a aula. A **série harmônica** $\\sum_{n=1}^{\\infty} \\frac{1}{n}$ tem termos que tendem a zero e, mesmo assim, **diverge**. Ou seja, os termos irem a zero não basta para a série convergir. Guarde esse contraexemplo: ele motiva todos os testes de convergência das próximas aulas.",
                    },
                    {
                        type: "quote",
                        value: "Convergir uma série é domar o infinito com uma sequência: a soma só existe se as somas parciais tiverem para onde ir.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A série $\\sum a_n$ converge, por definição, quando a sequência de somas parciais $s_n = \\sum_{k=1}^{n} a_k$ converge; sua soma é $\\lim_{n\\to\\infty} s_n$.\n- A série geométrica $\\sum_{n=1}^{\\infty} a\\,r^{n-1}$ converge para $\\frac{a}{1-r}$ quando $|r| < 1$ e diverge quando $|r| \\ge 1$.\n- Dízimas periódicas e séries telescópicas se resolvem em forma fechada: as primeiras pela fórmula geométrica e as segundas pelas somas parciais.\n- Séries convergentes podem ser somadas entre si e multiplicadas por constante termo a termo.\n- A série harmônica $\\sum \\frac{1}{n}$ diverge apesar de $\\frac{1}{n} \\to 0$: termos indo a zero não garantem convergência.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A soma da série $\\sum_{n=1}^{\\infty} \\frac{1}{2^n}$ é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "A série diverge",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A série geométrica $\\sum_{n=1}^{\\infty} a\\,r^{n-1}$ converge se, e somente se:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$|r| < 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$|r| > 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$r < 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$|r| \\le 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A soma de $\\sum_{n=1}^{\\infty} \\frac{2}{3^{n-1}}$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{3}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre a série $\\sum_{n=0}^{\\infty} \\left(\\frac{5}{4}\\right)^n$, é correto afirmar que:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ela diverge",
                                isCorrect: true,
                            },
                            {
                                text: "Converge para $-4$",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $4$",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $5$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A soma da série telescópica $\\sum_{n=1}^{\\infty} \\frac{1}{n(n+1)}$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "A série diverge",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Teste da divergência e teste da integral",
                blocks: [
                    {
                        type: "text",
                        value: "## O teste da divergência\n\nO primeiro teste é uma consequência direta da definição de convergência. Se $\\sum a_n$ converge com soma $s$, então tanto $s_n$ quanto $s_{n-1}$ tendem a $s$, e portanto\n$$a_n = s_n - s_{n-1} \\to s - s = 0.$$\nOu seja, **numa série convergente o termo geral tende a zero**. Lendo pela contrapositiva, obtemos um critério de divergência.\n\n**Teste da divergência (teste do $n$-ésimo termo):** se $\\lim_{n\\to\\infty} a_n \\neq 0$, ou se esse limite não existe, então a série $\\sum a_n$ **diverge**.\n\nÉ o primeiro teste a tentar em qualquer série, porque calcular $\\lim a_n$ costuma ser rápido. Se o limite não for zero, encerramos na hora: a série diverge.",
                    },
                    {
                        type: "text",
                        value: "## O que o teste NÃO diz\n\nMuito cuidado com a direção da implicação. O teste da divergência só conclui **divergência**. Ele nunca prova convergência.\n\nSe $\\lim_{n\\to\\infty} a_n = 0$, o teste é **inconclusivo**: a série pode convergir ou divergir, e é preciso outro método. O contraexemplo decisivo é a série harmônica:\n$$\\sum_{n=1}^{\\infty} \\frac{1}{n}, \\qquad \\text{com } \\lim_{n\\to\\infty} \\frac{1}{n} = 0, \\quad \\text{mas a série diverge}.$$\nPortanto, ver o termo geral ir a zero não autoriza nenhuma conclusão. Esse é o erro mais comum do assunto: confundir os termos indo a zero com a soma sendo finita.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: aplicando o teste da divergência\n\nAnalise $\\sum_{n=1}^{\\infty} \\frac{n}{2n + 1}$. Calculamos o limite do termo geral:\n$$\\lim_{n\\to\\infty} \\frac{n}{2n + 1} = \\lim_{n\\to\\infty} \\frac{1}{2 + \\frac{1}{n}} = \\frac{1}{2} \\neq 0.$$\nComo o termo geral não tende a zero, o teste da divergência garante que a série **diverge**. Não há necessidade de nenhum outro teste.\n\nCompare com $\\sum_{n=1}^{\\infty} \\frac{1}{2n+1}$, cujo termo geral tende a zero: para essa, o teste da divergência é inconclusivo e precisamos das ferramentas a seguir.",
                    },
                    {
                        type: "text",
                        value: "## O teste da integral\n\nQuando os termos são positivos e decrescentes, podemos comparar a soma com uma área sob um gráfico. Seja $f$ uma função **contínua, positiva e decrescente** em $[1, \\infty)$ e suponha $a_n = f(n)$. Então a série e a integral imprópria têm o mesmo destino:\n$$\\sum_{n=1}^{\\infty} a_n \\text{ converge} \\iff \\int_{1}^{\\infty} f(x)\\,dx \\text{ converge}.$$\nA ideia geométrica: os termos $a_n$ são áreas de retângulos de base $1$ que aproximam, por cima e por baixo, a área sob a curva $y = f(x)$. Se a área total é finita, a soma também é, e vice-versa.\n\nAtenção: o valor da soma **não** é igual ao valor da integral. O teste decide apenas se a série converge, não para quanto.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: as p-séries pelo teste da integral\n\nAplique o teste à $p$-série $\\sum_{n=1}^{\\infty} \\frac{1}{n^p}$ com $f(x) = \\frac{1}{x^p}$, que é positiva, contínua e decrescente para $x \\ge 1$ quando $p > 0$. Analisamos a integral:\n$$\\int_{1}^{\\infty} \\frac{1}{x^p}\\,dx.$$\nPara $p > 1$, essa integral vale $\\frac{1}{p-1}$, um número finito, então a série converge. Para $p = 1$ temos $\\int_1^{\\infty} \\frac{1}{x}\\,dx = \\lim_{b\\to\\infty} \\ln b = \\infty$, e a série diverge. Para $0 < p < 1$ a integral também diverge. Resulta o critério que usaremos como régua o tempo todo:\n$$\\sum_{n=1}^{\\infty} \\frac{1}{n^p} \\text{ converge} \\iff p > 1.$$",
                    },
                    {
                        type: "text",
                        value: "## A régua das p-séries\n\nVale fixar os casos mais frequentes numa tabela. Todas as p-séries têm termos que tendem a zero, mas só convergem quando $p > 1$.\n\n| Série | $p$ | Convergência |\n| --- | --- | --- |\n| $\\sum \\frac{1}{n}$ (harmônica) | $1$ | diverge |\n| $\\sum \\frac{1}{\\sqrt{n}}$ | $\\frac{1}{2}$ | diverge |\n| $\\sum \\frac{1}{n^2}$ | $2$ | converge |\n| $\\sum \\frac{1}{n^3}$ | $3$ | converge |\n\nA harmônica ($p = 1$) é a fronteira: ela e tudo abaixo dela diverge; qualquer expoente maior que $1$ converge.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: quando aparece um logaritmo\n\nAnalise $\\sum_{n=2}^{\\infty} \\frac{1}{n \\ln n}$. A função $f(x) = \\frac{1}{x \\ln x}$ é positiva, contínua e decrescente para $x \\ge 2$, então cabe o teste da integral. Com a substituição $u = \\ln x$, temos $du = \\frac{1}{x}\\,dx$, e a integral vira\n$$\\int \\frac{1}{u}\\,du = \\ln|u| = \\ln(\\ln x).$$\nAvaliando de $2$ até $\\infty$: quando $x \\to \\infty$, $\\ln(\\ln x) \\to \\infty$. A integral diverge, logo a série $\\sum \\frac{1}{n \\ln n}$ também **diverge**, ainda que muito devagar. Note que ela está logo acima da harmônica e mesmo assim não converge.",
                    },
                    {
                        type: "quote",
                        value: "Antes de qualquer teste sofisticado, olhe o termo geral: se ele não vai a zero, a série já está condenada a divergir.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- **Teste da divergência:** se $\\lim_{n\\to\\infty} a_n \\neq 0$ (ou não existe), a série diverge. Se $\\lim a_n = 0$, o teste é inconclusivo.\n- O termo geral ir a zero é necessário, mas não suficiente: a harmônica $\\sum \\frac{1}{n}$ tem $\\frac{1}{n} \\to 0$ e diverge.\n- **Teste da integral:** para $f$ contínua, positiva e decrescente com $a_n = f(n)$, a série $\\sum a_n$ e a integral $\\int_1^{\\infty} f\\,dx$ convergem juntas ou divergem juntas.\n- **p-séries:** $\\sum \\frac{1}{n^p}$ converge se, e somente se, $p > 1$. Elas são a régua de comparação das próximas aulas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Aplicando o teste da divergência a $\\sum_{n=1}^{\\infty} \\frac{n}{n+1}$, concluímos que a série:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Diverge",
                                isCorrect: true,
                            },
                            {
                                text: "Converge para $1$",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $0$",
                                isCorrect: false,
                            },
                            {
                                text: "É uma série telescópica",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre a série harmônica $\\sum_{n=1}^{\\infty} \\frac{1}{n}$, é correto dizer que ela:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Diverge",
                                isCorrect: true,
                            },
                            {
                                text: "Converge, pois $\\frac{1}{n} \\to 0$",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $1$",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $\\ln 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A série $\\sum_{n=1}^{\\infty} \\frac{1}{\\sqrt{n}}$:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Diverge",
                                isCorrect: true,
                            },
                            {
                                text: "Converge, por ser uma $p$-série",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $2$",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $\\sqrt{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $\\lim_{n\\to\\infty} a_n = 0$, o teste da divergência permite concluir que a série $\\sum a_n$:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Nada se pode concluir",
                                isCorrect: true,
                            },
                            {
                                text: "Converge com certeza",
                                isCorrect: false,
                            },
                            {
                                text: "Diverge com certeza",
                                isCorrect: false,
                            },
                            {
                                text: "Tem soma igual a zero",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A série $\\sum_{n=2}^{\\infty} \\frac{1}{n \\ln n}$, analisada pelo teste da integral, é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Divergente",
                                isCorrect: true,
                            },
                            {
                                text: "Convergente",
                                isCorrect: false,
                            },
                            {
                                text: "Convergente, com soma $\\ln(\\ln 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "Convergente por ser uma $p$-série",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Testes de comparação",
                blocks: [
                    {
                        type: "text",
                        value: "## A ideia da comparação\n\nMuitas séries não são geométricas nem p-séries, mas se **parecem** com uma delas. A estratégia é comparar o termo geral $a_n$ com o de uma série conhecida $b_n$, cujo comportamento já dominamos. Todos os testes desta aula valem para séries de **termos positivos**.\n\n**Teste da comparação direta:** suponha $0 \\le a_n \\le b_n$ para todo $n$ (a partir de certo índice). Então:\n\n- se a série maior $\\sum b_n$ **converge**, a série menor $\\sum a_n$ também converge;\n- se a série menor $\\sum a_n$ **diverge**, a série maior $\\sum b_n$ também diverge.\n\nEm palavras: quem é menor que uma soma finita também é finito; quem é maior que uma soma infinita também é infinito. As direções que faltam não dizem nada: ser menor que uma série divergente, ou maior que uma convergente, não conclui.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: comparação direta (convergência)\n\nAnalise $\\sum_{n=1}^{\\infty} \\frac{1}{n^2 + 1}$. Para todo $n \\ge 1$ vale $n^2 + 1 > n^2$, e portanto\n$$0 < \\frac{1}{n^2 + 1} < \\frac{1}{n^2}.$$\nA série maior $\\sum \\frac{1}{n^2}$ é uma $p$-série com $p = 2 > 1$, logo converge. Pela comparação direta, a série menor $\\sum \\frac{1}{n^2 + 1}$ também **converge**.\n\nO passo essencial foi escolher a régua certa: ao ver $n^2$ no denominador, a candidata natural é a $p$-série $\\sum \\frac{1}{n^2}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: comparação direta (divergência)\n\nAnalise $\\sum_{n=3}^{\\infty} \\frac{\\ln n}{n}$. Para $n \\ge 3$ temos $\\ln n > 1$, portanto\n$$\\frac{\\ln n}{n} > \\frac{1}{n} > 0.$$\nA série menor $\\sum \\frac{1}{n}$ é a harmônica, que diverge. Como a nossa série é **maior** que uma série divergente, a comparação direta garante que $\\sum \\frac{\\ln n}{n}$ também **diverge**.\n\nRepare no cuidado com a direção: aqui a desigualdade útil coloca a série a ser testada por cima da harmônica. Se a desigualdade viesse ao contrário, a comparação direta não concluiria nada e precisaríamos de outra ferramenta.",
                    },
                    {
                        type: "text",
                        value: "## O teste da comparação no limite\n\nÀs vezes a desigualdade não sai na direção conveniente, embora as duas séries tenham o mesmo comportamento assintótico. Para esses casos existe uma versão mais flexível.\n\n**Teste da comparação no limite:** sejam $a_n > 0$ e $b_n > 0$ e considere\n$$L = \\lim_{n\\to\\infty} \\frac{a_n}{b_n}.$$\nSe $L$ é um número **finito e positivo** ($0 < L < \\infty$), então $\\sum a_n$ e $\\sum b_n$ têm o mesmo destino: ou ambas convergem, ou ambas divergem.\n\nA vantagem é dispensar a desigualdade termo a termo. Basta que as duas sequências tenham a mesma ordem de grandeza, o que se traduz num quociente com limite finito e não nulo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: comparação no limite\n\nAnalise $\\sum_{n=1}^{\\infty} \\frac{3n^2 + 2}{n^3 + 5}$. Para $n$ grande, o termo geral se comporta como $\\frac{3n^2}{n^3} = \\frac{3}{n}$, então comparamos com a harmônica escolhendo $b_n = \\frac{1}{n}$. Calculamos o limite do quociente:\n$$L = \\lim_{n\\to\\infty} \\frac{\\frac{3n^2 + 2}{n^3 + 5}}{\\frac{1}{n}} = \\lim_{n\\to\\infty} \\frac{n(3n^2 + 2)}{n^3 + 5} = \\lim_{n\\to\\infty} \\frac{3n^3 + 2n}{n^3 + 5} = 3.$$\nComo $L = 3$ é finito e positivo e a série de comparação $\\sum \\frac{1}{n}$ **diverge**, o teste garante que $\\sum \\frac{3n^2 + 2}{n^3 + 5}$ também **diverge**.",
                    },
                    {
                        type: "text",
                        value: "## Como escolher a série de comparação\n\nA régua sai olhando apenas os termos dominantes de numerador e denominador, ou seja, as maiores potências de $n$. Descarte constantes e termos de ordem menor e veja com qual p-série ou geométrica o termo geral se parece.\n\n| Termo geral $a_n$ | Comparar com $b_n$ | Conclusão |\n| --- | --- | --- |\n| $\\frac{1}{n^2 + 1}$ | $\\frac{1}{n^2}$ | converge |\n| $\\frac{2n + 1}{n^3 + n}$ | $\\frac{1}{n^2}$ | converge |\n| $\\frac{3n^2 + 2}{n^3 + 5}$ | $\\frac{1}{n}$ | diverge |\n| $\\frac{1}{2^n - 1}$ | $\\frac{1}{2^n}$ | converge |\n\nSe a comparação direta não sair na direção certa, use a comparação no limite: ela conclui desde que $0 < L < \\infty$.",
                    },
                    {
                        type: "quote",
                        value: "Comparar é o ofício do analista: toda série difícil esconde, no seu esqueleto, uma p-série ou uma geométrica já conhecida.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- **Comparação direta:** com $0 \\le a_n \\le b_n$, se a maior $\\sum b_n$ converge então a menor $\\sum a_n$ converge; se a menor $\\sum a_n$ diverge então a maior $\\sum b_n$ diverge.\n- **Comparação no limite:** se $L = \\lim_{n\\to\\infty} \\frac{a_n}{b_n}$ é finito e positivo, as duas séries têm o mesmo destino.\n- A série de comparação sai dos termos dominantes: olhe as maiores potências de $n$ e descarte o resto.\n- As réguas de sempre são as p-séries $\\sum \\frac{1}{n^p}$ e as geométricas $\\sum r^n$.\n- Cuidado com a direção na comparação direta; quando ela não ajuda, a comparação no limite quase sempre resolve.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Comparando com uma $p$-série, a série $\\sum_{n=1}^{\\infty} \\frac{1}{n^2 + 1}$:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Converge",
                                isCorrect: true,
                            },
                            {
                                text: "Diverge",
                                isCorrect: false,
                            },
                            {
                                text: "É inconclusiva",
                                isCorrect: false,
                            },
                            {
                                text: "Converge para $1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $0 \\le a_n \\le b_n$ e $\\sum b_n$ converge, então $\\sum a_n$:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Converge",
                                isCorrect: true,
                            },
                            {
                                text: "Diverge",
                                isCorrect: false,
                            },
                            {
                                text: "Pode divergir",
                                isCorrect: false,
                            },
                            {
                                text: "Tem a mesma soma que $\\sum b_n$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A série $\\sum_{n=1}^{\\infty} \\frac{1}{2^n + 1}$, comparada com a geométrica $\\sum \\frac{1}{2^n}$:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Converge",
                                isCorrect: true,
                            },
                            {
                                text: "Diverge",
                                isCorrect: false,
                            },
                            {
                                text: "É inconclusiva pela comparação",
                                isCorrect: false,
                            },
                            {
                                text: "Só converge se somada a $\\sum \\frac{1}{2^n}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No teste da comparação no limite para $\\sum_{n=1}^{\\infty} \\frac{2n + 1}{n^3 + n}$, a melhor escolha de $b_n$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{n^2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{n^3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2^n}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Usando que $\\ln n > 1$ para $n \\ge 3$, a série $\\sum_{n=3}^{\\infty} \\frac{\\ln n}{n}$:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Diverge",
                                isCorrect: true,
                            },
                            {
                                text: "Converge",
                                isCorrect: false,
                            },
                            {
                                text: "Converge, por comparação com $\\sum \\frac{1}{n^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "É inconclusiva",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Testes da razão e da raiz e séries alternadas",
                blocks: [
                    {
                        type: "text",
                        value: "## O teste da razão\n\nPara séries com fatoriais ou potências $n$-ésimas, o teste mais eficiente compara cada termo com o anterior. Dada uma série $\\sum a_n$, calcule\n$$L = \\lim_{n\\to\\infty} \\left|\\frac{a_{n+1}}{a_n}\\right|.$$\nO valor de $L$ decide:\n\n- se $L < 1$, a série **converge absolutamente** (em particular, converge);\n- se $L > 1$ ou $L = \\infty$, a série **diverge**;\n- se $L = 1$, o teste é **inconclusivo** e nada se conclui.\n\nA intuição é comparar com uma geométrica de razão $L$: se cada termo é, no limite, uma fração $L < 1$ do anterior, a soma se comporta como uma geométrica convergente.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: fatorial no denominador\n\nAnalise $\\sum_{n=1}^{\\infty} \\frac{3^n}{n!}$. Montamos o quociente entre termos consecutivos:\n$$\\frac{a_{n+1}}{a_n} = \\frac{3^{n+1}/(n+1)!}{3^n/n!} = \\frac{3^{n+1}}{3^n} \\cdot \\frac{n!}{(n+1)!} = 3 \\cdot \\frac{1}{n+1} = \\frac{3}{n+1}.$$\nAgora tomamos o limite:\n$$L = \\lim_{n\\to\\infty} \\frac{3}{n+1} = 0 < 1.$$\nComo $L < 1$, a série **converge**. Sempre que aparecem fatoriais, o teste da razão costuma ser o caminho mais curto, pois $\\frac{(n+1)!}{n!} = n+1$ simplifica muito bem.",
                    },
                    {
                        type: "text",
                        value: "## O teste da raiz\n\nQuando o termo geral é uma expressão elevada à potência $n$, convém extrair a raiz $n$-ésima em vez de comparar termos. Calcule\n$$L = \\lim_{n\\to\\infty} \\sqrt[n]{|a_n|}.$$\nAs conclusões são idênticas às do teste da razão: $L < 1$ converge absolutamente, $L > 1$ ou $L = \\infty$ diverge, e $L = 1$ é inconclusivo.\n\nUse o teste da raiz de preferência quando todo o termo $a_n$ já vem na forma $(\\,\\cdot\\,)^n$, pois a raiz cancela o expoente de imediato.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: potência n-ésima\n\nAnalise $\\sum_{n=1}^{\\infty} \\left(\\frac{n}{2n + 1}\\right)^n$. Como o termo já está elevado a $n$, aplicamos a raiz $n$-ésima:\n$$\\sqrt[n]{|a_n|} = \\sqrt[n]{\\left(\\frac{n}{2n + 1}\\right)^n} = \\frac{n}{2n + 1}.$$\nNo limite,\n$$L = \\lim_{n\\to\\infty} \\frac{n}{2n + 1} = \\frac{1}{2} < 1,$$\nportanto a série **converge**. Repare como a raiz eliminou o expoente $n$ e reduziu o problema a um limite simples de quociente.",
                    },
                    {
                        type: "text",
                        value: "## Séries alternadas\n\nUma **série alternada** troca de sinal a cada termo, tendo a forma $\\sum (-1)^{n-1} b_n$ com $b_n > 0$. Para elas há um critério próprio, muito simples.\n\n**Teste da série alternada (Leibniz):** se a sequência $b_n$ é **decrescente** ($b_{n+1} \\le b_n$) e $\\lim_{n\\to\\infty} b_n = 0$, então a série alternada $\\sum (-1)^{n-1} b_n$ **converge**.\n\nÉ preciso separar dois tipos de convergência. A série $\\sum a_n$ **converge absolutamente** se $\\sum |a_n|$ converge, e a convergência absoluta implica convergência comum. Quando $\\sum a_n$ converge mas $\\sum |a_n|$ diverge, dizemos que ela **converge condicionalmente**.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: a harmônica alternada\n\nAnalise $\\sum_{n=1}^{\\infty} \\frac{(-1)^{n-1}}{n} = 1 - \\frac{1}{2} + \\frac{1}{3} - \\frac{1}{4} + \\cdots$ Aqui $b_n = \\frac{1}{n}$, que é decrescente e tem limite zero. Pelo teste de Leibniz, a série **converge**.\n\nNo entanto, a série dos valores absolutos é $\\sum \\frac{1}{n}$, a harmônica, que **diverge**. Logo a convergência não é absoluta: a harmônica alternada **converge condicionalmente**. Esse é o exemplo clássico de uma série que converge graças ao cancelamento entre termos positivos e negativos, e não porque suas parcelas encolham rápido o bastante.",
                    },
                    {
                        type: "text",
                        value: "## Qual teste usar\n\nCom todos os testes na mão, a dificuldade passa a ser escolher o certo. O guia abaixo resume os gatilhos mais comuns.\n\n| Cara da série | Teste indicado |\n| --- | --- |\n| $\\lim a_n \\neq 0$ | teste da divergência (diverge) |\n| Fatoriais ou potências $c^n$ | teste da razão |\n| Termo todo na forma $(\\,\\cdot\\,)^n$ | teste da raiz |\n| Parece p-série ou geométrica | comparação (direta ou no limite) |\n| $a_n = f(n)$ positiva e decrescente | teste da integral |\n| Sinais alternados $(-1)^{n-1} b_n$ | teste de Leibniz |\n\nComece sempre pelo teste da divergência, que é o mais barato. Se ele não decidir, escolha o teste sugerido pela forma do termo geral.",
                    },
                    {
                        type: "quote",
                        value: "Escolher o teste certo vale mais que dominar todos: leia a forma do termo geral e deixe que ela aponte a ferramenta.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- **Teste da razão:** com $L = \\lim_{n\\to\\infty} \\left|\\frac{a_{n+1}}{a_n}\\right|$, temos convergência absoluta se $L < 1$, divergência se $L > 1$, e nenhuma conclusão se $L = 1$. Ideal para fatoriais e potências.\n- **Teste da raiz:** com $L = \\lim_{n\\to\\infty} \\sqrt[n]{|a_n|}$, as conclusões são as mesmas. Ideal quando o termo já é uma potência $n$-ésima.\n- **Teste de Leibniz:** uma série alternada $\\sum (-1)^{n-1} b_n$ converge se $b_n$ decresce a zero.\n- **Convergência absoluta** ($\\sum |a_n|$ converge) implica convergência; se a série converge mas não absolutamente, a convergência é **condicional**, como na harmônica alternada.\n- Comece pelo teste da divergência e deixe a forma do termo geral indicar o teste seguinte.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "No teste da razão aplicado a $\\sum_{n=1}^{\\infty} \\frac{n}{2^n}$, o limite $L$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{4}$",
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
                        statement:
                            "A série harmônica alternada $\\sum_{n=1}^{\\infty} \\frac{(-1)^{n-1}}{n}$:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Converge condicionalmente",
                                isCorrect: true,
                            },
                            {
                                text: "Converge absolutamente",
                                isCorrect: false,
                            },
                            {
                                text: "Diverge pelo teste de Leibniz",
                                isCorrect: false,
                            },
                            {
                                text: "Diverge como a harmônica",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Pelo teste da razão, a série $\\sum_{n=1}^{\\infty} \\frac{3^n}{n!}$ tem $L = 0$ e portanto:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Converge",
                                isCorrect: true,
                            },
                            {
                                text: "Diverge",
                                isCorrect: false,
                            },
                            {
                                text: "É inconclusiva",
                                isCorrect: false,
                            },
                            {
                                text: "Converge apenas se $n > 3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Aplicando o teste da raiz a $\\sum_{n=1}^{\\infty} \\left(\\frac{2n}{n + 1}\\right)^n$, obtemos:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$L = 2$: diverge",
                                isCorrect: true,
                            },
                            {
                                text: "$L = \\frac{1}{2}$: converge",
                                isCorrect: false,
                            },
                            {
                                text: "$L = 1$: inconclusivo",
                                isCorrect: false,
                            },
                            {
                                text: "$L = 0$: converge",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao aplicar o teste da razão a $\\sum_{n=1}^{\\infty} \\frac{1}{n^2}$, obtemos $L = 1$. Isso significa que:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O teste nada conclui",
                                isCorrect: true,
                            },
                            {
                                text: "A série diverge",
                                isCorrect: false,
                            },
                            {
                                text: "A série converge",
                                isCorrect: false,
                            },
                            {
                                text: "A série converge condicionalmente",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Séries de potências e de Taylor",
        aulas: [
            {
                titulo: "Séries de potências e raio de convergência",
                blocks: [
                    {
                        type: "text",
                        value: "## De polinômios a somas infinitas\n\nUm polinômio é uma soma finita de potências de $x$. Uma **série de potências** leva essa ideia ao infinito: é uma soma da forma\n\n$$\\sum_{n=0}^{\\infty} c_n (x-a)^n = c_0 + c_1(x-a) + c_2(x-a)^2 + \\cdots,$$\n\nonde os números $c_n$ são os **coeficientes** e $a$ é o **centro** da série. Quando $a = 0$, ela assume a forma mais simples $\\sum_{n=0}^{\\infty} c_n x^n$.\n\nA pergunta central é: para quais valores de $x$ essa soma infinita converge para um número? A resposta define o domínio da função que a série representa.",
                    },
                    {
                        type: "text",
                        value: "## Os três cenários de convergência\n\nPara uma série de potências centrada em $a$ vale um resultado notável: existem apenas **três possibilidades**.\n\n1. A série converge somente em $x = a$, onde vale $c_0$.\n2. A série converge para **todo** número real $x$.\n3. Existe um número $R > 0$ tal que a série converge se $|x - a| < R$ e diverge se $|x - a| > R$.\n\nEsse número $R$ é o **raio de convergência**. Nos dois primeiros casos escrevemos $R = 0$ e $R = \\infty$. O conjunto de todos os $x$ em que a série converge é o **intervalo de convergência**, sempre centrado em $a$.",
                    },
                    {
                        type: "quote",
                        value: "Uma série de potências é uma função disfarçada de soma infinita, e o raio de convergência diz até onde esse disfarce funciona.",
                    },
                    {
                        type: "text",
                        value: "## Como achar o raio: o teste da razão\n\nA ferramenta padrão é o **teste da razão** aplicado aos termos $a_n = c_n (x-a)^n$. Calculamos\n\n$$L = \\lim_{n \\to \\infty} \\left| \\frac{c_{n+1}(x-a)^{n+1}}{c_n (x-a)^n} \\right| = |x - a| \\cdot \\lim_{n \\to \\infty} \\left| \\frac{c_{n+1}}{c_n} \\right|.$$\n\nA série converge absolutamente quando $L < 1$. Resolvendo essa desigualdade para $|x - a|$, lemos diretamente o raio. De forma equivalente,\n\n$$R = \\lim_{n \\to \\infty} \\left| \\frac{c_n}{c_{n+1}} \\right|,$$\n\nsempre que esse limite existir. Nas pontas do intervalo, onde $L = 1$, o teste é inconclusivo e cada extremo precisa ser analisado à parte.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: a série geométrica\n\nConsidere $\\sum_{n=0}^{\\infty} x^n = 1 + x + x^2 + \\cdots$, com todos os coeficientes iguais a $1$. Pelo teste da razão,\n\n$$L = \\lim_{n \\to \\infty} \\left| \\frac{x^{n+1}}{x^n} \\right| = |x|.$$\n\nA convergência exige $|x| < 1$, logo $R = 1$. Nas pontas: em $x = 1$ temos $1 + 1 + 1 + \\cdots$, que diverge; em $x = -1$ temos $1 - 1 + 1 - \\cdots$, que também diverge. O intervalo de convergência é $(-1, 1)$, e ali a soma vale $\\dfrac{1}{1-x}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: fatorial no denominador\n\nA série $\\sum_{n=0}^{\\infty} \\dfrac{x^n}{n!}$ tem $c_n = \\dfrac{1}{n!}$. Aplicando o teste da razão,\n\n$$L = |x| \\cdot \\lim_{n \\to \\infty} \\frac{n!}{(n+1)!} = |x| \\cdot \\lim_{n \\to \\infty} \\frac{1}{n+1} = 0.$$\n\nComo $L = 0 < 1$ para **qualquer** $x$, a série converge em toda a reta e $R = \\infty$. O fatorial no denominador cresce tão rápido que domina qualquer potência de $x$. Veremos adiante que essa série é justamente $e^x$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: quando as pontas discordam\n\nSeja $\\sum_{n=1}^{\\infty} \\dfrac{x^n}{n}$. O teste da razão dá\n\n$$L = |x| \\cdot \\lim_{n \\to \\infty} \\frac{n}{n+1} = |x|,$$\n\nentão $R = 1$. Agora as pontas se comportam de modo diferente. Em $x = 1$ surge a série harmônica $\\sum \\dfrac{1}{n}$, que **diverge**. Em $x = -1$ surge a série harmônica alternada $\\sum \\dfrac{(-1)^n}{n}$, que **converge**. O intervalo de convergência é $[-1, 1)$, fechado à esquerda e aberto à direita. Por isso cada extremo é testado separadamente.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma série de potências $\\sum c_n (x-a)^n$ converge num intervalo centrado em $a$.\n- Só há três casos: converge só em $a$ ($R = 0$), converge em toda a reta ($R = \\infty$), ou converge para $|x-a| < R$.\n- O teste da razão fornece $R = \\lim \\left| \\dfrac{c_n}{c_{n+1}} \\right|$ quando esse limite existe.\n- As pontas do intervalo, onde $|x-a| = R$, precisam ser verificadas uma a uma.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é o raio de convergência da série geométrica $\\sum_{n=0}^{\\infty} x^n$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$R = 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$R = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$R = \\infty$",
                                isCorrect: false,
                            },
                            {
                                text: "$R = 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para quais valores de $x$ a série $\\sum_{n=0}^{\\infty} \\dfrac{x^n}{n!}$ converge?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "todo $x$ real",
                                isCorrect: true,
                            },
                            {
                                text: "apenas $x = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "somente $|x| < 1$",
                                isCorrect: false,
                            },
                            {
                                text: "somente $|x| < e$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o raio de convergência de $\\sum_{n=0}^{\\infty} \\dfrac{x^n}{2^n}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$R = 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$R = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$R = \\dfrac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$R = \\infty$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o intervalo de convergência de $\\sum_{n=1}^{\\infty} \\dfrac{x^n}{n}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$[-1, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(-1, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$[-1, 1]$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-1, 1]$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o raio de convergência de $\\sum_{n=1}^{\\infty} \\dfrac{(x-2)^n}{n\\,3^n}$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$R = 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$R = 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$R = \\dfrac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$R = \\infty$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Representação de funções por séries de potências",
                blocks: [
                    {
                        type: "text",
                        value: "## A série geométrica como ponto de partida\n\nJá sabemos que, para $|x| < 1$,\n\n$$\\frac{1}{1-x} = \\sum_{n=0}^{\\infty} x^n = 1 + x + x^2 + x^3 + \\cdots.$$\n\nEssa igualdade é uma mina de ouro. A partir dela, com **substituições**, **derivação** e **integração** termo a termo, conseguimos representar uma coleção enorme de funções por séries de potências. Representar uma função assim permite integrá-la, derivá-la e aproximá-la com facilidade.",
                    },
                    {
                        type: "text",
                        value: "## Substituição: trocando a variável\n\nO truque mais simples é substituir $x$ por outra expressão. Trocando $x$ por $-x$:\n\n$$\\frac{1}{1+x} = \\frac{1}{1-(-x)} = \\sum_{n=0}^{\\infty} (-x)^n = \\sum_{n=0}^{\\infty} (-1)^n x^n = 1 - x + x^2 - \\cdots,$$\n\nválida para $|x| < 1$. Trocando $x$ por $x^2$:\n\n$$\\frac{1}{1+x^2} = \\sum_{n=0}^{\\infty} (-1)^n x^{2n} = 1 - x^2 + x^4 - \\cdots,$$\n\ntambém para $|x| < 1$. Cada substituição herda o raio de convergência da série original, ajustado pela nova variável.",
                    },
                    {
                        type: "quote",
                        value: "Conhecer bem uma única série, a geométrica, é conhecer em potencial dezenas de outras que dela nascem.",
                    },
                    {
                        type: "text",
                        value: "## Derivar e integrar termo a termo\n\nDentro do intervalo de convergência, isto é, para $|x - a| < R$, uma série de potências pode ser **derivada e integrada termo a termo**, e o raio $R$ se mantém. Se $f(x) = \\sum c_n (x-a)^n$, então\n\n$$f'(x) = \\sum_{n=1}^{\\infty} n\\,c_n (x-a)^{n-1}, \\qquad \\int f(x)\\,dx = C + \\sum_{n=0}^{\\infty} \\frac{c_n}{n+1}(x-a)^{n+1}.$$\n\nApenas o comportamento nas **pontas** pode mudar. Essa liberdade transforma a série geométrica em ponto de partida para logaritmos e arco-tangentes.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: a série do logaritmo\n\nPartimos de $\\dfrac{1}{1+x} = \\sum_{n=0}^{\\infty} (-1)^n x^n$. Como $\\displaystyle\\int \\frac{1}{1+x}\\,dx = \\ln(1+x)$, integramos termo a termo:\n\n$$\\ln(1+x) = \\sum_{n=0}^{\\infty} (-1)^n \\frac{x^{n+1}}{n+1} = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\frac{x^4}{4} + \\cdots.$$\n\nA constante de integração é $0$ porque $\\ln(1+0) = 0$. O raio continua $R = 1$, e nesse caso a série ainda converge em $x = 1$, dando a bela identidade $\\ln 2 = 1 - \\dfrac{1}{2} + \\dfrac{1}{3} - \\dfrac{1}{4} + \\cdots$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: a série do arco-tangente\n\nAgora usamos $\\dfrac{1}{1+x^2} = \\sum_{n=0}^{\\infty} (-1)^n x^{2n}$. Como $\\displaystyle\\int \\frac{1}{1+x^2}\\,dx = \\arctan x$, integrando termo a termo com constante nula:\n\n$$\\arctan x = \\sum_{n=0}^{\\infty} (-1)^n \\frac{x^{2n+1}}{2n+1} = x - \\frac{x^3}{3} + \\frac{x^5}{5} - \\cdots,$$\n\ncom $R = 1$. Em $x = 1$ ela converge e produz a famosa fórmula de Leibniz $\\dfrac{\\pi}{4} = 1 - \\dfrac{1}{3} + \\dfrac{1}{5} - \\dfrac{1}{7} + \\cdots$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: derivando a geométrica\n\nDerivar também gera séries úteis. Partindo de $\\dfrac{1}{1-x} = \\sum_{n=0}^{\\infty} x^n$ e derivando os dois lados:\n\n$$\\frac{1}{(1-x)^2} = \\sum_{n=1}^{\\infty} n\\,x^{n-1} = 1 + 2x + 3x^2 + 4x^3 + \\cdots,$$\n\nainda com $R = 1$. Repare como uma única derivada produziu a representação de uma função bem diferente. Combinando substituição, derivação e integração, montamos um verdadeiro catálogo de séries.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Tudo parte de $\\dfrac{1}{1-x} = \\sum x^n$, válida para $|x| < 1$.\n- Substituir $x$ por $-x$, por $x^2$ ou por múltiplos gera novas séries com raio herdado.\n- Séries podem ser derivadas e integradas termo a termo dentro do raio, que se mantém.\n- Integrando, obtemos $\\ln(1+x) = x - \\dfrac{x^2}{2} + \\cdots$ e $\\arctan x = x - \\dfrac{x^3}{3} + \\cdots$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A representação em série de potências de $\\dfrac{1}{1-x}$, para $|x| < 1$, é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sum_{n=0}^{\\infty} x^n$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} (-1)^n x^n$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} \\dfrac{x^n}{n!}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum_{n=1}^{\\infty} n\\,x^n$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a série de potências de $\\dfrac{1}{1+x}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sum_{n=0}^{\\infty} (-1)^n x^n$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} x^n$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} (-1)^n x^{2n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum_{n=1}^{\\infty} \\dfrac{(-1)^n x^n}{n}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Substituindo na série geométrica, qual é a representação de $\\dfrac{1}{1+x^2}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\sum_{n=0}^{\\infty} (-1)^n x^{2n}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} x^{2n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} (-1)^n x^n$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} (-1)^n x^{2n+1}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Integrando termo a termo a série de $\\dfrac{1}{1+x}$, obtemos a série de qual função?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\ln(1+x)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\arctan x$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\ln(1-x)$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a representação em série de potências de $\\dfrac{1}{3-x}$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\sum_{n=0}^{\\infty} \\dfrac{x^n}{3^{n+1}}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} \\dfrac{x^n}{3^n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} 3^n x^n$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} \\dfrac{(-1)^n x^n}{3^{n+1}}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Séries de Taylor e de Maclaurin",
                blocks: [
                    {
                        type: "text",
                        value: "## Qual série representa uma função?\n\nNa aula anterior fabricamos séries a partir da geométrica. Mas e uma função qualquer, como $e^x$ ou $\\sin x$? Existe uma fórmula direta para os coeficientes? A resposta é sim, e é uma das mais importantes do cálculo.\n\nSuponha que $f$ possa ser escrita como série de potências centrada em $a$:\n\n$$f(x) = \\sum_{n=0}^{\\infty} c_n (x-a)^n.$$\n\nVamos descobrir quem são os coeficientes $c_n$.",
                    },
                    {
                        type: "text",
                        value: "## Descobrindo os coeficientes\n\nAvaliando a série em $x = a$, todos os termos com $(x-a)$ somem e sobra $f(a) = c_0$. Derivando uma vez e avaliando em $a$, sobra $f'(a) = c_1$. Derivando duas vezes, $f''(a) = 2!\\,c_2$. Em geral, a $n$-ésima derivada em $a$ isola o coeficiente:\n\n$$f^{(n)}(a) = n!\\,c_n \\quad\\Longrightarrow\\quad c_n = \\frac{f^{(n)}(a)}{n!}.$$\n\nEsse é o coração da teoria. Os coeficientes de uma série de potências não são arbitrários: são ditados pelas derivadas da função no centro.",
                    },
                    {
                        type: "text",
                        value: "## Série de Taylor e série de Maclaurin\n\nSubstituindo os coeficientes, chegamos à **série de Taylor** de $f$ centrada em $a$:\n\n$$f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n = f(a) + f'(a)(x-a) + \\frac{f''(a)}{2!}(x-a)^2 + \\cdots.$$\n\nO caso particular em que o centro é $a = 0$ recebe nome próprio, a **série de Maclaurin**:\n\n$$f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(0)}{n!}x^n.$$\n\nToda série de Maclaurin é, portanto, uma série de Taylor centrada na origem.",
                    },
                    {
                        type: "quote",
                        value: "Os coeficientes de Taylor guardam, em cada derivada no centro, uma fotografia completa do comportamento local da função.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: a série de $e^x$\n\nSeja $f(x) = e^x$ com centro $a = 0$. Como a derivada de $e^x$ é o próprio $e^x$, todas as derivadas são iguais a $e^x$, e em $x = 0$ valem $e^0 = 1$. Assim $f^{(n)}(0) = 1$ para todo $n$, e\n\n$$e^x = \\sum_{n=0}^{\\infty} \\frac{1}{n!}x^n = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots.$$\n\nReconhecemos a série do exemplo da primeira aula, agora com nome e endereço: é a série de Maclaurin de $e^x$, válida para todo $x$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: $\\ln x$ centrada em $a = 1$\n\nAgora $f(x) = \\ln x$ com $a = 1$, pois $\\ln 1 = 0$ é conhecido. Calculando as derivadas:\n\n$$f'(x) = \\frac{1}{x}, \\quad f''(x) = -\\frac{1}{x^2}, \\quad f'''(x) = \\frac{2}{x^3}, \\quad \\ldots$$\n\nEm $x = 1$: $f(1) = 0$, $f'(1) = 1$, $f''(1) = -1$, $f'''(1) = 2$, e em geral $f^{(n)}(1) = (-1)^{n-1}(n-1)!$. Logo o coeficiente é $\\dfrac{(-1)^{n-1}(n-1)!}{n!} = \\dfrac{(-1)^{n-1}}{n}$, e\n\n$$\\ln x = \\sum_{n=1}^{\\infty} \\frac{(-1)^{n-1}}{n}(x-1)^n = (x-1) - \\frac{(x-1)^2}{2} + \\frac{(x-1)^3}{3} - \\cdots.$$",
                    },
                    {
                        type: "text",
                        value: "## Quando a função é igual à sua série\n\nUm ponto sutil: nem toda função infinitamente derivável coincide com sua série de Taylor. Escrevemos $f(x) = T_n(x) + R_n(x)$, onde $T_n$ é a soma parcial até o grau $n$ e $R_n$ é o **resto**. A função é igual à sua série de Taylor exatamente quando\n\n$$\\lim_{n \\to \\infty} R_n(x) = 0.$$\n\nA forma de Lagrange do resto é $R_n(x) = \\dfrac{f^{(n+1)}(z)}{(n+1)!}(x-a)^{n+1}$, para algum $z$ entre $a$ e $x$. Para $e^x$, $\\sin x$ e $\\cos x$ prova-se que $R_n \\to 0$ em toda a reta, e por isso elas valem suas séries em qualquer ponto.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Se $f(x) = \\sum c_n (x-a)^n$, então $c_n = \\dfrac{f^{(n)}(a)}{n!}$.\n- A série de Taylor de $f$ em $a$ é $\\sum \\dfrac{f^{(n)}(a)}{n!}(x-a)^n$; com $a = 0$ chama-se série de Maclaurin.\n- Cada coeficiente vem de uma derivada da função avaliada no centro.\n- A função coincide com sua série de Taylor apenas quando o resto $R_n(x)$ tende a zero.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A série de Maclaurin de uma função é a série de Taylor centrada em qual ponto?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$a = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$a = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$a = e$",
                                isCorrect: false,
                            },
                            {
                                text: "$a = \\pi$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na série de Taylor de $f$ em torno de $a$, o coeficiente de $(x-a)^n$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\dfrac{f^{(n)}(a)}{n!}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{f^{(n)}(a)}{n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$f^{(n)}(a)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{f^{(n)}(0)}{(n+1)!}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a série de Maclaurin de $e^x$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\sum_{n=0}^{\\infty} \\dfrac{x^n}{n!}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} x^n$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} \\dfrac{x^n}{n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} \\dfrac{x^n}{(2n)!}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na série de Taylor de $\\ln x$ centrada em $a = 1$, qual é o coeficiente de $(x-1)^2$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-\\dfrac{1}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-1$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\dfrac{1}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma função infinitamente derivável coincide com sua série de Taylor em torno de $a$ quando:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "o resto $R_n(x)$ tende a $0$",
                                isCorrect: true,
                            },
                            {
                                text: "a série de potências converge",
                                isCorrect: false,
                            },
                            {
                                text: "todas as derivadas em $a$ são positivas",
                                isCorrect: false,
                            },
                            {
                                text: "a função é contínua em $a$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Séries de Taylor de funções conhecidas",
                blocks: [
                    {
                        type: "text",
                        value: "## Um catálogo para ter na ponta da língua\n\nAlgumas séries de Maclaurin aparecem o tempo todo. Conhecê-las de cor economiza trabalho: em vez de recalcular derivadas, montamos séries novas a partir das já conhecidas por substituição, multiplicação e combinação. Nesta aula reunimos as séries mais importantes e mostramos como usá-las.",
                    },
                    {
                        type: "text",
                        value: "## Seno e cosseno\n\nPara $f(x) = \\sin x$, as derivadas em $0$ ciclam entre $\\sin 0 = 0$, $\\cos 0 = 1$, $-\\sin 0 = 0$ e $-\\cos 0 = -1$, repetindo em seguida. Sobram apenas as potências ímpares, com sinais alternados:\n\n$$\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\cdots = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n+1}}{(2n+1)!}.$$\n\nDerivando termo a termo, obtemos o cosseno, que fica com as potências pares:\n\n$$\\cos x = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\cdots = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{(2n)!}.$$\n\nAmbas convergem para todo $x$ real, com $R = \\infty$. Atenção aos sinais alternados e aos fatoriais: esquecer um deles é o erro mais comum.",
                    },
                    {
                        type: "text",
                        value: "## Tabela das séries essenciais\n\nGuarde estas representações de Maclaurin e seus intervalos de convergência:\n\n| Função | Série de Maclaurin | Intervalo |\n| --- | --- | --- |\n| $\\dfrac{1}{1-x}$ | $\\sum_{n=0}^{\\infty} x^n$ | $(-1, 1)$ |\n| $e^x$ | $\\sum_{n=0}^{\\infty} \\dfrac{x^n}{n!}$ | $(-\\infty, \\infty)$ |\n| $\\sin x$ | $\\sum_{n=0}^{\\infty} \\dfrac{(-1)^n x^{2n+1}}{(2n+1)!}$ | $(-\\infty, \\infty)$ |\n| $\\cos x$ | $\\sum_{n=0}^{\\infty} \\dfrac{(-1)^n x^{2n}}{(2n)!}$ | $(-\\infty, \\infty)$ |\n| $\\ln(1+x)$ | $\\sum_{n=1}^{\\infty} \\dfrac{(-1)^{n-1} x^n}{n}$ | $(-1, 1]$ |\n| $\\arctan x$ | $\\sum_{n=0}^{\\infty} \\dfrac{(-1)^n x^{2n+1}}{2n+1}$ | $[-1, 1]$ |\n\nComeçar por uma destas quase sempre é mais rápido do que derivar do zero.",
                    },
                    {
                        type: "quote",
                        value: "Quem domina meia dúzia de séries fundamentais raramente precisa voltar a derivar: constrói o que precisa a partir do que já sabe.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: substituição em $e^{-x^2}$\n\nA função $e^{-x^2}$ não tem primitiva elementar, mas sua série sai de graça. Na série de $e^x$, trocamos $x$ por $-x^2$:\n\n$$e^{-x^2} = \\sum_{n=0}^{\\infty} \\frac{(-x^2)^n}{n!} = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{n!} = 1 - x^2 + \\frac{x^4}{2!} - \\frac{x^6}{3!} + \\cdots.$$\n\nAgora podemos integrar termo a termo essa série, algo impossível de fazer com a função em forma fechada. É assim que se tratam integrais da curva normal em estatística.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: multiplicando por uma potência\n\nPara achar a série de $x \\cos x$, basta multiplicar a série do cosseno por $x$:\n\n$$x \\cos x = x \\left( 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\cdots \\right) = x - \\frac{x^3}{2!} + \\frac{x^5}{4!} - \\cdots.$$\n\nDe modo parecido, substituindo $x$ por $x^2$ na série do seno obtemos\n\n$$\\sin(x^2) = x^2 - \\frac{x^6}{3!} + \\frac{x^{10}}{5!} - \\cdots.$$\n\nManipular séries conhecidas é quase sempre mais rápido do que calcular dezenas de derivadas.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Vale memorizar as séries de $\\dfrac{1}{1-x}$, $e^x$, $\\sin x$, $\\cos x$, $\\ln(1+x)$ e $\\arctan x$.\n- $\\sin x$ tem só potências ímpares e $\\cos x$ só pares, ambas com sinais alternados e fatoriais.\n- Substituir $x$ por $-x^2$, $x^2$ e afins gera séries novas, como a de $e^{-x^2}$.\n- Multiplicar por potências de $x$ e combinar séries evita recalcular derivadas.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a série de Maclaurin de $\\sin x$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x - \\dfrac{x^3}{3!} + \\dfrac{x^5}{5!} - \\cdots$",
                                isCorrect: true,
                            },
                            {
                                text: "$1 - \\dfrac{x^2}{2!} + \\dfrac{x^4}{4!} - \\cdots$",
                                isCorrect: false,
                            },
                            {
                                text: "$x + \\dfrac{x^3}{3!} + \\dfrac{x^5}{5!} + \\cdots$",
                                isCorrect: false,
                            },
                            {
                                text: "$x - \\dfrac{x^2}{2!} + \\dfrac{x^3}{3!} - \\cdots$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a série de Maclaurin de $\\cos x$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1 - \\dfrac{x^2}{2!} + \\dfrac{x^4}{4!} - \\cdots$",
                                isCorrect: true,
                            },
                            {
                                text: "$1 + \\dfrac{x^2}{2!} + \\dfrac{x^4}{4!} + \\cdots$",
                                isCorrect: false,
                            },
                            {
                                text: "$x - \\dfrac{x^3}{3!} + \\dfrac{x^5}{5!} - \\cdots$",
                                isCorrect: false,
                            },
                            {
                                text: "$1 - \\dfrac{x^2}{2} + \\dfrac{x^3}{3} - \\cdots$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Substituindo na série de $e^x$, qual é a série de $e^{-x^2}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\sum_{n=0}^{\\infty} \\dfrac{(-1)^n x^{2n}}{n!}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} \\dfrac{x^{2n}}{n!}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} \\dfrac{(-1)^n x^{2n}}{(2n)!}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum_{n=0}^{\\infty} \\dfrac{(-1)^n x^n}{n!}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A série $\\sum_{n=0}^{\\infty} \\dfrac{(-1)^n x^{2n}}{(2n)!}$ representa qual função?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\cos x$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sin x$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^{-x^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Substituindo $x$ por $x^2$ na série do seno, qual é a série de $\\sin(x^2)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$x^2 - \\dfrac{x^6}{3!} + \\dfrac{x^{10}}{5!} - \\cdots$",
                                isCorrect: true,
                            },
                            {
                                text: "$x^2 - \\dfrac{x^4}{3!} + \\dfrac{x^6}{5!} - \\cdots$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^2 + \\dfrac{x^6}{3!} + \\dfrac{x^{10}}{5!} + \\cdots$",
                                isCorrect: false,
                            },
                            {
                                text: "$x - \\dfrac{x^3}{3!} + \\dfrac{x^5}{5!} - \\cdots$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Polinômios de Taylor e aproximação",
                blocks: [
                    {
                        type: "text",
                        value: "## Truncar a série para aproximar\n\nUma série de Taylor tem infinitos termos, mas na prática usamos só os primeiros. A soma parcial até o grau $n$ é o **polinômio de Taylor de grau $n$**:\n\n$$T_n(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(a)}{k!}(x-a)^k = f(a) + f'(a)(x-a) + \\cdots + \\frac{f^{(n)}(a)}{n!}(x-a)^n.$$\n\nPerto do centro $a$, $T_n(x)$ aproxima $f(x)$, e em geral quanto maior o grau, melhor a aproximação.",
                    },
                    {
                        type: "text",
                        value: "## Do linear ao quadrático\n\nOs primeiros graus têm interpretação geométrica clara. O polinômio de grau $1$,\n\n$$T_1(x) = f(a) + f'(a)(x-a),$$\n\né exatamente a **reta tangente**, a mesma aproximação linear já conhecida. O de grau $2$,\n\n$$T_2(x) = f(a) + f'(a)(x-a) + \\frac{f''(a)}{2}(x-a)^2,$$\n\nacrescenta a curvatura: é a parábola que melhor encosta no gráfico em $a$. Cada grau a mais captura um detalhe novo do formato da função.",
                    },
                    {
                        type: "quote",
                        value: "Um polinômio de Taylor é a função vista com poucas casas decimais: quanto mais termos guardamos, mais nítido fica o retrato.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: aproximando o cosseno\n\nA série de $\\cos x$ começa em $1 - \\dfrac{x^2}{2} + \\dfrac{x^4}{24} - \\cdots$, então o polinômio de grau $2$ em $a = 0$ é\n\n$$T_2(x) = 1 - \\frac{x^2}{2}.$$\n\nPara estimar $\\cos(0{,}1)$, avaliamos\n\n$$T_2(0{,}1) = 1 - \\frac{(0{,}1)^2}{2} = 1 - 0{,}005 = 0{,}995.$$\n\nO valor verdadeiro é $\\cos(0{,}1) = 0{,}9950042\\ldots$, ou seja, acertamos quatro casas decimais com um polinômio de grau apenas $2$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: estimando $e^{0{,}1}$\n\nA série de $e^x$ dá, no grau $3$,\n\n$$T_3(x) = 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6}.$$\n\nEm $x = 0{,}1$:\n\n$$T_3(0{,}1) = 1 + 0{,}1 + 0{,}005 + 0{,}000167 = 1{,}105167.$$\n\nO valor real é $e^{0{,}1} = 1{,}105171\\ldots$, com erro só na sexta casa decimal. Poucos termos já entregam uma precisão excelente perto do centro.",
                    },
                    {
                        type: "text",
                        value: "## Medindo o erro da aproximação\n\nO erro cometido é o resto $R_n(x) = f(x) - T_n(x)$. A **desigualdade de Taylor** o limita: se $|f^{(n+1)}(t)| \\le M$ para todo $t$ entre $a$ e $x$, então\n\n$$|R_n(x)| \\le \\frac{M}{(n+1)!}\\,|x-a|^{n+1}.$$\n\nRepare em dois efeitos: aumentar o grau $n$ faz o fatorial $(n+1)!$ crescer e derrubar o erro; e quanto mais perto de $a$, menor fica $|x-a|^{n+1}$. Para séries alternadas há um atalho ainda mais simples: o erro é menor que o primeiro termo desprezado.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O polinômio de Taylor $T_n(x)$ é a soma parcial da série até o grau $n$.\n- $T_1$ é a reta tangente e $T_2$ acrescenta a curvatura da função.\n- Perto do centro, poucos termos já dão ótimas aproximações, como $\\cos(0{,}1) \\approx 0{,}995$.\n- O erro é controlado pela desigualdade de Taylor $|R_n(x)| \\le \\dfrac{M}{(n+1)!}\\,|x-a|^{n+1}$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é o polinômio de Taylor de grau $2$ de $\\cos x$ em $a = 0$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1 - \\dfrac{x^2}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$1 + \\dfrac{x^2}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$1 - x^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x - \\dfrac{x^3}{6}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o polinômio de Taylor de grau $2$ de $e^x$ em $a = 0$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1 + x + \\dfrac{x^2}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$1 + x + x^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$1 + x$",
                                isCorrect: false,
                            },
                            {
                                text: "$1 + x + \\dfrac{x^2}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Usando $T_2(x) = 1 - \\dfrac{x^2}{2}$, qual é a estimativa de $\\cos(0{,}1)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0{,}995$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}99$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}9995$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}905$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o polinômio de Taylor de grau $3$ de $\\sin x$ em $a = 0$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x - \\dfrac{x^3}{6}$",
                                isCorrect: true,
                            },
                            {
                                text: "$x - \\dfrac{x^3}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$x + \\dfrac{x^3}{6}$",
                                isCorrect: false,
                            },
                            {
                                text: "$x - \\dfrac{x^2}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o polinômio de Taylor de grau $2$ de $f(x) = \\sqrt{x}$ em $a = 4$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$2 + \\dfrac{1}{4}(x-4) - \\dfrac{1}{64}(x-4)^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$2 + \\dfrac{1}{4}(x-4) - \\dfrac{1}{32}(x-4)^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$2 + \\dfrac{1}{4}(x-4) + \\dfrac{1}{64}(x-4)^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$2 + \\dfrac{1}{2}(x-4) - \\dfrac{1}{64}(x-4)^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Equações diferenciais de 1ª ordem",
        aulas: [
            {
                titulo: "Introdução às equações diferenciais",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é uma equação diferencial\n\nUma **equação diferencial** é uma equação que relaciona uma função desconhecida com suas derivadas. Quando a função depende de uma única variável independente, a equação é chamada de **equação diferencial ordinária** (EDO). Neste módulo estudamos as EDOs de **1ª ordem**, aquelas em que aparece apenas a primeira derivada.\n\nA forma geral de uma EDO de 1ª ordem é\n\n$$\\frac{dy}{dx} = f(x, y),$$\n\nonde $f$ é uma função dada e $y = y(x)$ é a função que queremos determinar. Resolver a equação significa encontrar todas as funções $y(x)$ que a satisfazem.",
                    },
                    {
                        type: "text",
                        value: "## Ordem e linearidade\n\nA **ordem** de uma equação diferencial é a ordem da derivada mais alta que nela aparece. Por exemplo, $\\frac{dy}{dx} + y = x$ é de 1ª ordem, enquanto $\\frac{d^2y}{dx^2} + \\frac{dy}{dx} = 0$ é de 2ª ordem.\n\nUma EDO de 1ª ordem é **linear** quando pode ser escrita na forma\n\n$$\\frac{dy}{dx} + P(x)\\,y = Q(x),$$\n\nisto é, quando $y$ e $\\frac{dy}{dx}$ aparecem apenas elevados à primeira potência e não multiplicados entre si. Caso contrário, dizemos que a equação é **não linear**. Por exemplo, $\\frac{dy}{dx} = y^2$ e $\\frac{dy}{dx} = \\sqrt{y}$ são não lineares.",
                    },
                    {
                        type: "text",
                        value: "## Solução geral e solução particular\n\nUma **solução** de uma EDO em um intervalo $I$ é uma função $y = \\varphi(x)$ que, substituída na equação, a transforma em uma identidade válida para todo $x \\in I$.\n\nComo integrar introduz constantes arbitrárias, a **solução geral** de uma EDO de 1ª ordem contém uma constante $C$ e representa uma família de curvas. Quando fixamos o valor de $C$ por meio de uma **condição inicial** $y(x_0) = y_0$, obtemos uma **solução particular**. O conjunto formado pela equação e por uma condição inicial é chamado de **problema de valor inicial** (PVI).",
                    },
                    {
                        type: "quote",
                        value: "Resolver uma equação diferencial é reconstruir a função a partir da lei que governa sua taxa de variação.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: verificando uma solução\n\nVamos mostrar que $y = Ce^{2x}$ é solução da equação $\\frac{dy}{dx} = 2y$ para qualquer constante $C$.\n\n**Passo 1.** Derivamos a candidata: $\\frac{dy}{dx} = 2Ce^{2x}$.\n\n**Passo 2.** Calculamos o lado direito: $2y = 2\\,(Ce^{2x}) = 2Ce^{2x}$.\n\n**Passo 3.** Como os dois lados coincidem, a igualdade $\\frac{dy}{dx} = 2y$ se verifica. Logo $y = Ce^{2x}$ é a solução geral. Se além disso exigirmos $y(0) = 5$, então $Ce^{0} = 5$, ou seja $C = 5$, e a solução particular é $y = 5e^{2x}$.",
                    },
                    {
                        type: "text",
                        value: "## Interpretação geométrica\n\nA equação $\\frac{dy}{dx} = f(x, y)$ fornece, em cada ponto $(x, y)$ do plano, o **coeficiente angular** da reta tangente à curva solução que passa por ali. Traçando pequenos segmentos com essas inclinações obtemos o **campo de direções**, que revela o comportamento das soluções mesmo antes de resolvermos a equação.\n\nCada condição inicial seleciona a curva do campo que passa pelo ponto $(x_0, y_0)$. Sob hipóteses razoáveis sobre $f$, por cada ponto passa exatamente uma curva solução, o que garante a unicidade da solução do PVI.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma EDO de 1ª ordem tem a forma $\\frac{dy}{dx} = f(x, y)$.\n- A **ordem** é a da derivada mais alta; a equação é **linear** se puder ser escrita como $\\frac{dy}{dx} + P(x)\\,y = Q(x)$.\n- A **solução geral** carrega uma constante $C$; uma **condição inicial** $y(x_0) = y_0$ fixa $C$ e produz a **solução particular**.\n- Para verificar uma solução, basta substituí-la na equação e conferir a identidade.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a ordem da equação $\\frac{d^2y}{dx^2} + 3\\frac{dy}{dx} = x$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ordem 2",
                                isCorrect: true,
                            },
                            {
                                text: "Ordem 1",
                                isCorrect: false,
                            },
                            {
                                text: "Ordem 3",
                                isCorrect: false,
                            },
                            {
                                text: "Ordem 0",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual das equações a seguir é uma EDO linear de 1ª ordem?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{dy}{dx} + xy = x^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{dy}{dx} = y^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{d^2y}{dx^2} + y = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$y\\,\\frac{dy}{dx} = x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A função $y = Ce^{3x}$ é solução geral de qual equação?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{dy}{dx} = 3y$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{dy}{dx} = 3x$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{dy}{dx} = -3y$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{dy}{dx} = y^3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Considere o PVI $\\frac{dy}{dx} = 2y$, $y(0) = 4$, de solução geral $y = Ce^{2x}$. Qual é a solução particular?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$y = 4e^{2x}$",
                                isCorrect: true,
                            },
                            {
                                text: "$y = 4e^{-2x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = e^{2x} + 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = 2e^{4x}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que valor de $r$ a função $y = e^{rx}$ é solução de $\\frac{dy}{dx} + 5y = 0$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$r = -5$",
                                isCorrect: true,
                            },
                            {
                                text: "$r = 5$",
                                isCorrect: false,
                            },
                            {
                                text: "$r = -\\frac{1}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$r = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Equações separáveis",
                blocks: [
                    {
                        type: "text",
                        value: "## Equações separáveis\n\nUma EDO de 1ª ordem é **separável** quando podemos escrever a derivada como um produto de uma função só de $x$ por uma função só de $y$:\n\n$$\\frac{dy}{dx} = g(x)\\,h(y).$$\n\nA ideia é **separar as variáveis**, colocando tudo que depende de $y$ de um lado e tudo que depende de $x$ do outro, e então integrar cada lado independentemente.",
                    },
                    {
                        type: "text",
                        value: "## O método passo a passo\n\nPartindo de $\\frac{dy}{dx} = g(x)\\,h(y)$ com $h(y) \\neq 0$:\n\n1. Separe as variáveis: $\\frac{dy}{h(y)} = g(x)\\,dx$.\n2. Integre os dois lados: $\\int \\frac{dy}{h(y)} = \\int g(x)\\,dx$.\n3. Some **uma única** constante $C$ ao final e, quando possível, isole $y$.\n\nEsquecer a constante de integração é o erro mais comum: sem ela, perdemos toda a família de soluções.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nResolver $\\frac{dy}{dx} = xy$.\n\n**Passo 1.** Separando as variáveis: $\\frac{dy}{y} = x\\,dx$.\n\n**Passo 2.** Integrando: $\\int \\frac{dy}{y} = \\int x\\,dx$, ou seja $\\ln|y| = \\frac{x^2}{2} + C$.\n\n**Passo 3.** Aplicando a exponencial: $|y| = e^{C}\\,e^{x^2/2}$. Absorvendo $\\pm e^{C}$ em uma nova constante, a solução geral é\n\n$$y = C\\,e^{x^2/2}.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2 (com condição inicial)\n\nResolver o PVI $\\frac{dy}{dx} = x^2 y$, com $y(0) = 3$.\n\n**Passo 1.** Separando: $\\frac{dy}{y} = x^2\\,dx$.\n\n**Passo 2.** Integrando: $\\ln|y| = \\frac{x^3}{3} + C$, logo $y = A\\,e^{x^3/3}$, com $A = \\pm e^{C}$.\n\n**Passo 3.** Impondo $y(0) = 3$: como $e^{0} = 1$, temos $A = 3$. Portanto\n\n$$y = 3\\,e^{x^3/3}.$$",
                    },
                    {
                        type: "quote",
                        value: "Separar variáveis é reorganizar a equação até que cada lado dependa de uma única variável, deixando a integral fazer o resto.",
                    },
                    {
                        type: "text",
                        value: "## Soluções de equilíbrio\n\nAo dividir por $h(y)$ supomos $h(y) \\neq 0$. Os valores de $y$ que anulam $h$ merecem atenção: se $h(y_0) = 0$, então a função constante $y = y_0$ também é solução, chamada **solução de equilíbrio**.\n\nNo Exemplo 1, com $\\frac{dy}{dx} = xy$, o valor $y = 0$ anula o lado direito, e de fato $y = 0$ é solução (recuperada tomando $C = 0$). Nem sempre a solução constante aparece na fórmula geral, por isso vale sempre verificá-la à parte.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma equação é **separável** se $\\frac{dy}{dx} = g(x)\\,h(y)$.\n- O método: separar como $\\frac{dy}{h(y)} = g(x)\\,dx$ e integrar os dois lados.\n- Some **uma** constante $C$ e isole $y$ quando possível; uma condição inicial fixa $C$.\n- Verifique as **soluções de equilíbrio** $y = y_0$ que anulam $h(y)$.",
                    },
                ],
                questions: [
                    {
                        statement: "Ao separar as variáveis em $\\frac{dy}{dx} = xy$, obtemos:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{dy}{y} = x\\,dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{dy}{x} = y\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{dy}{y} = \\frac{dx}{x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$y\\,dy = x\\,dx$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A solução geral de $\\frac{dy}{dx} = 2y$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$y = Ce^{2x}$",
                                isCorrect: true,
                            },
                            {
                                text: "$y = Ce^{-2x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = e^{2x} + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = 2x + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Resolvendo $\\frac{dy}{dx} = \\frac{x}{y}$, a solução geral (implícita) é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$y^2 = x^2 + C$",
                                isCorrect: true,
                            },
                            {
                                text: "$y^2 = -x^2 + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = x + C$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\ln|y| = \\frac{x^2}{2} + C$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A solução do PVI $\\frac{dy}{dx} = 3x^2 y$, $y(0) = 2$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$y = 2e^{x^3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$y = 2e^{-x^3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = e^{x^3} + 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = 2e^{3x^3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Resolvendo o PVI $\\frac{dy}{dx} = \\frac{\\cos x}{y}$, $y(0) = 2$, obtém-se:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$y = \\sqrt{2\\sin x + 4}$",
                                isCorrect: true,
                            },
                            {
                                text: "$y = \\sqrt{2\\sin x} + 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = \\sqrt{\\sin x + 4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = 2\\sin x + 4$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Equações lineares de 1ª ordem",
                blocks: [
                    {
                        type: "text",
                        value: "## Equações lineares de 1ª ordem\n\nUma EDO linear de 1ª ordem tem a **forma padrão**\n\n$$\\frac{dy}{dx} + P(x)\\,y = Q(x),$$\n\nonde $P$ e $Q$ são funções contínuas de $x$. Muitas equações lineares não vêm nessa forma; o primeiro passo é sempre **dividir pelo coeficiente de $\\frac{dy}{dx}$** para deixar esse coeficiente igual a $1$.",
                    },
                    {
                        type: "text",
                        value: "## O fator integrante\n\nA técnica consiste em multiplicar a equação por um **fator integrante** $\\mu(x)$ escolhido de modo que o lado esquerdo vire a derivada de um produto. O fator é\n\n$$\\mu(x) = e^{\\int P(x)\\,dx}.$$\n\nCom essa escolha, $\\frac{dy}{dx} + P(x)y$ multiplicado por $\\mu$ se torna exatamente $\\frac{d}{dx}\\big[\\mu(x)\\,y\\big]$. Ao calcular $\\int P(x)\\,dx$ não precisamos da constante de integração, pois qualquer primitiva serve.",
                    },
                    {
                        type: "text",
                        value: "## A solução\n\nApós multiplicar por $\\mu(x)$, a equação vira\n\n$$\\frac{d}{dx}\\big[\\mu(x)\\,y\\big] = \\mu(x)\\,Q(x).$$\n\nIntegrando os dois lados em relação a $x$ e isolando $y$:\n\n$$y = \\frac{1}{\\mu(x)}\\left(\\int \\mu(x)\\,Q(x)\\,dx + C\\right).$$\n\nA constante $C$ aparece uma única vez, ao integrar o lado direito.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nResolver $\\frac{dy}{dx} + 2y = 4$.\n\n**Passo 1.** Aqui $P(x) = 2$, logo $\\mu(x) = e^{\\int 2\\,dx} = e^{2x}$.\n\n**Passo 2.** Multiplicando a equação por $e^{2x}$: $\\frac{d}{dx}\\big[e^{2x}y\\big] = 4e^{2x}$.\n\n**Passo 3.** Integrando: $e^{2x}y = 2e^{2x} + C$.\n\n**Passo 4.** Isolando $y$: $y = 2 + Ce^{-2x}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2 (coeficiente variável)\n\nResolver $x\\frac{dy}{dx} + y = x^2$, para $x > 0$.\n\n**Passo 1.** Dividindo por $x$ para obter a forma padrão: $\\frac{dy}{dx} + \\frac{1}{x}\\,y = x$. Assim $P(x) = \\frac{1}{x}$.\n\n**Passo 2.** O fator integrante é $\\mu(x) = e^{\\int \\frac{1}{x}\\,dx} = e^{\\ln x} = x$.\n\n**Passo 3.** Multiplicando: $\\frac{d}{dx}\\big[x\\,y\\big] = x \\cdot x = x^2$.\n\n**Passo 4.** Integrando: $x y = \\frac{x^3}{3} + C$, portanto $y = \\frac{x^2}{3} + \\frac{C}{x}$.",
                    },
                    {
                        type: "quote",
                        value: "O fator integrante é o truque que transforma um lado inteiro da equação na derivada de um único produto, pronto para ser integrado.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Coloque a equação na forma padrão $\\frac{dy}{dx} + P(x)\\,y = Q(x)$.\n- Calcule o fator integrante $\\mu(x) = e^{\\int P(x)\\,dx}$.\n- Reescreva o lado esquerdo como $\\frac{d}{dx}\\big[\\mu(x)\\,y\\big]$ e integre: $\\mu y = \\int \\mu Q\\,dx + C$.\n- Isole $y$: a solução geral é $y = \\frac{1}{\\mu(x)}\\left(\\int \\mu(x)Q(x)\\,dx + C\\right)$.",
                    },
                ],
                questions: [
                    {
                        statement: "O fator integrante de $\\frac{dy}{dx} + 3y = x$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\mu(x) = e^{3x}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\mu(x) = e^{-3x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\mu(x) = e^{x/3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\mu(x) = 3x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O fator integrante de $\\frac{dy}{dx} + \\frac{2}{x}y = x$ (para $x > 0$) é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\mu(x) = x^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\mu(x) = 2\\ln x$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\mu(x) = e^{2x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\mu(x) = x^{-2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A solução geral de $\\frac{dy}{dx} + 2y = 4$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$y = 2 + Ce^{-2x}$",
                                isCorrect: true,
                            },
                            {
                                text: "$y = 2 + Ce^{2x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = 4 + Ce^{-2x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = Ce^{-2x}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a forma padrão de uma EDO linear de 1ª ordem?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{dy}{dx} + P(x)y = Q(x)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{dy}{dx} = P(x)\\,Q(y)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{dy}{dx} + P(x)y^2 = Q(x)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{d^2y}{dx^2} + P(x)y = Q(x)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A solução do PVI $\\frac{dy}{dx} + y = e^{x}$, $y(0) = 1$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$y = \\frac{1}{2}e^{x} + \\frac{1}{2}e^{-x}$",
                                isCorrect: true,
                            },
                            {
                                text: "$y = \\frac{1}{2}e^{x} - \\frac{1}{2}e^{-x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = e^{x} + e^{-x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = e^{x}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Aplicações: crescimento e decaimento",
                blocks: [
                    {
                        type: "text",
                        value: "## O modelo de crescimento e decaimento\n\nMuitos fenômenos têm taxa de variação **proporcional à quantidade presente**. Isso se traduz na equação\n\n$$\\frac{dy}{dt} = k\\,y,$$\n\nonde $k$ é a constante de proporcionalidade. É uma equação separável (e também linear). Separando e integrando, $\\frac{dy}{y} = k\\,dt$ leva a $\\ln|y| = kt + C$, e portanto\n\n$$y(t) = y_0\\,e^{kt},$$\n\nem que $y_0 = y(0)$ é a quantidade inicial.",
                    },
                    {
                        type: "text",
                        value: "## O papel do sinal de $k$\n\n- Se $k > 0$, a solução $y = y_0 e^{kt}$ **cresce** exponencialmente. É o modelo de populações com recursos abundantes ou de juros compostos contínuos.\n- Se $k < 0$, a solução **decai** exponencialmente rumo a zero. É o modelo do decaimento radioativo e da eliminação de fármacos pelo organismo.\n\nÉ comum escrever o decaimento como $y = y_0 e^{-kt}$ com $k > 0$, deixando o sinal negativo explícito no expoente.",
                    },
                    {
                        type: "text",
                        value: "## Meia-vida\n\nNo decaimento $y = y_0 e^{-kt}$, a **meia-vida** $t_{1/2}$ é o tempo necessário para a quantidade cair à metade. Impondo $y = \\frac{y_0}{2}$:\n\n$$\\frac{y_0}{2} = y_0\\,e^{-k\\,t_{1/2}} \\;\\Rightarrow\\; \\frac{1}{2} = e^{-k\\,t_{1/2}}.$$\n\nAplicando o logaritmo natural, $-k\\,t_{1/2} = \\ln\\frac{1}{2} = -\\ln 2$, de onde\n\n$$t_{1/2} = \\frac{\\ln 2}{k}.$$\n\nA meia-vida não depende da quantidade inicial: a cada intervalo $t_{1/2}$ o que resta é sempre dividido por dois.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: população que dobra\n\nUma cultura de bactérias cresce segundo $\\frac{dP}{dt} = kP$ e dobra de tamanho em $3$ horas. Qual é a constante $k$?\n\n**Passo 1.** A solução é $P(t) = P_0 e^{kt}$.\n\n**Passo 2.** Dobrar em $3$ horas significa $P(3) = 2P_0$, ou seja $2P_0 = P_0 e^{3k}$, logo $e^{3k} = 2$.\n\n**Passo 3.** Tomando o logaritmo: $3k = \\ln 2$, portanto\n\n$$k = \\frac{\\ln 2}{3} \\approx 0{,}231 \\text{ por hora}.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: datação por carbono-14\n\nO carbono-14 tem meia-vida de aproximadamente $5730$ anos. Um fóssil contém $25\\%$ do carbono-14 original. Qual é a sua idade?\n\n**Passo 1.** Como $25\\% = \\frac{1}{4} = \\left(\\frac{1}{2}\\right)^2$, o material passou por exatamente **duas** meias-vidas.\n\n**Passo 2.** Logo a idade é $2 \\times 5730 = 11460$ anos.\n\nDe forma equivalente, poderíamos resolver $\\frac{1}{4} = e^{-kt}$ com $k = \\frac{\\ln 2}{5730}$ e obter o mesmo resultado.",
                    },
                    {
                        type: "quote",
                        value: "No crescimento exponencial, quanto maior a quantidade, mais depressa ela aumenta, e é esse laço que faz a curva disparar.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O modelo $\\frac{dy}{dt} = ky$ tem solução $y = y_0 e^{kt}$.\n- $k > 0$ indica crescimento; $k < 0$ (ou expoente $-kt$) indica decaimento.\n- A **meia-vida** vale $t_{1/2} = \\frac{\\ln 2}{k}$ e independe da quantidade inicial.\n- Após $n$ meias-vidas, resta $\\left(\\frac{1}{2}\\right)^n$ da quantidade original.",
                    },
                ],
                questions: [
                    {
                        statement: "A solução do PVI $\\frac{dy}{dt} = ky$ com $y(0) = y_0$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$y = y_0 e^{kt}$",
                                isCorrect: true,
                            },
                            {
                                text: "$y = y_0 e^{-kt}$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = y_0 + e^{kt}$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = kt + y_0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No modelo $y = y_0 e^{kt}$, o decaimento exponencial ocorre quando:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$k < 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$k > 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A meia-vida de uma substância que decai segundo $y = y_0 e^{-kt}$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$t_{1/2} = \\frac{\\ln 2}{k}$",
                                isCorrect: true,
                            },
                            {
                                text: "$t_{1/2} = \\frac{k}{\\ln 2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$t_{1/2} = \\frac{\\ln 2}{2k}$",
                                isCorrect: false,
                            },
                            {
                                text: "$t_{1/2} = k\\ln 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma população obedece $\\frac{dP}{dt} = kP$ e dobra em $4$ anos. O valor de $k$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$k = \\frac{\\ln 2}{4}$",
                                isCorrect: true,
                            },
                            {
                                text: "$k = \\frac{\\ln 2}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = 4\\ln 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = \\frac{2}{\\ln 2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma substância radioativa tem meia-vida de $8$ dias. Que fração da amostra inicial resta após $24$ dias?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{1}{8}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{6}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{3}{8}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Aplicações: misturas e resfriamento",
                blocks: [
                    {
                        type: "text",
                        value: "## Lei do resfriamento de Newton\n\nA **lei do resfriamento de Newton** afirma que a taxa de variação da temperatura de um corpo é proporcional à diferença entre sua temperatura $T$ e a temperatura do meio $T_m$:\n\n$$\\frac{dT}{dt} = -k\\,(T - T_m),$$\n\ncom $k > 0$. É uma equação linear (e também separável). O sinal negativo garante que o corpo esfria quando está mais quente que o meio e esquenta quando está mais frio.",
                    },
                    {
                        type: "text",
                        value: "## Resolvendo a equação do resfriamento\n\nA substituição $u = T - T_m$ dá $\\frac{du}{dt} = -k\\,u$, cuja solução já conhecemos: $u = u_0 e^{-kt}$. Voltando a $T$:\n\n$$T(t) = T_m + (T_0 - T_m)\\,e^{-kt},$$\n\nonde $T_0 = T(0)$ é a temperatura inicial. Quando $t \\to \\infty$, o termo exponencial tende a zero e $T \\to T_m$: o corpo se aproxima da temperatura do ambiente, como esperado.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: o café esfriando\n\nUm café a $90^\\circ\\text{C}$ é deixado em uma sala a $20^\\circ\\text{C}$. Após $5$ minutos, sua temperatura é de $70^\\circ\\text{C}$. Determine a constante $k$.\n\n**Passo 1.** Aqui $T_m = 20$ e $T_0 = 90$, logo $T(t) = 20 + 70\\,e^{-kt}$.\n\n**Passo 2.** Usando $T(5) = 70$: $70 = 20 + 70\\,e^{-5k}$, ou seja $50 = 70\\,e^{-5k}$ e $e^{-5k} = \\frac{5}{7}$.\n\n**Passo 3.** Aplicando o logaritmo: $-5k = \\ln\\frac{5}{7}$, portanto\n\n$$k = \\frac{1}{5}\\ln\\frac{7}{5} \\approx 0{,}0673 \\text{ por minuto}.$$",
                    },
                    {
                        type: "text",
                        value: "## Problemas de mistura\n\nEm um tanque com líquido, seja $A(t)$ a quantidade de soluto (por exemplo, sal) no instante $t$. O balanço é\n\n$$\\frac{dA}{dt} = (\\text{taxa de entrada}) - (\\text{taxa de saída}).$$\n\nA **taxa de entrada** é a concentração que entra vezes a vazão de entrada. A **taxa de saída** é a concentração dentro do tanque, $\\frac{A}{V}$, vezes a vazão de saída, supondo mistura homogênea instantânea. Quando as vazões de entrada e saída são iguais, o volume $V$ permanece constante.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: tanque de salmoura\n\nUm tanque contém $100$ litros de água pura. Salmoura com $2$ g de sal por litro entra a $5$ L/min, e a mistura, mantida homogênea, sai também a $5$ L/min. Quanto sal há no tanque no instante $t$?\n\n**Passo 1.** O volume é constante ($100$ L). A taxa de entrada de sal é $2 \\cdot 5 = 10$ g/min; a de saída é $\\frac{A}{100}\\cdot 5 = \\frac{A}{20}$ g/min. Assim\n\n$$\\frac{dA}{dt} = 10 - \\frac{A}{20}, \\quad\\text{ou}\\quad \\frac{dA}{dt} + \\frac{1}{20}A = 10.$$\n\n**Passo 2.** É linear, com $\\mu = e^{t/20}$. Resolvendo, $A = 200 + Ce^{-t/20}$.\n\n**Passo 3.** Como o tanque começa com água pura, $A(0) = 0$, dando $C = -200$. Logo\n\n$$A(t) = 200\\left(1 - e^{-t/20}\\right).$$\n\nQuando $t \\to \\infty$, $A \\to 200$ g, que corresponde a $2$ g/L nos $100$ litros.",
                    },
                    {
                        type: "quote",
                        value: "Tanto o corpo que esfria quanto o tanque que se satura caminham para um equilíbrio, e a exponencial mede o quão rápido esse destino se aproxima.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- **Resfriamento de Newton:** $\\frac{dT}{dt} = -k(T - T_m)$, com solução $T = T_m + (T_0 - T_m)e^{-kt}$.\n- A temperatura tende a $T_m$ quando $t \\to \\infty$.\n- **Misturas:** $\\frac{dA}{dt} = \\text{entra} - \\text{sai}$, com saída igual a $\\frac{A}{V}$ vezes a vazão.\n- Com vazões iguais o volume é constante e a equação resultante é linear.",
                    },
                ],
                questions: [
                    {
                        statement: "A lei do resfriamento de Newton é modelada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{dT}{dt} = -k(T - T_m)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{dT}{dt} = -kT$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{dT}{dt} = k(T - T_m)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{dT}{dt} = -k(T + T_m)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A solução de $\\frac{dT}{dt} = -k(T - T_m)$ com $T(0) = T_0$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$T = T_m + (T_0 - T_m)e^{-kt}$",
                                isCorrect: true,
                            },
                            {
                                text: "$T = T_m + (T_0 - T_m)e^{kt}$",
                                isCorrect: false,
                            },
                            {
                                text: "$T = T_0 + (T_m - T_0)e^{-kt}$",
                                isCorrect: false,
                            },
                            {
                                text: "$T = (T_0 - T_m)e^{-kt}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quando $t \\to \\infty$, a temperatura $T = T_m + (T_0 - T_m)e^{-kt}$ tende a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$T_m$",
                                isCorrect: true,
                            },
                            {
                                text: "$T_0$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$T_0 - T_m$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em um tanque de volume constante $V$ com vazão de saída $r$, a taxa de saída do soluto (quantidade $A$) é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{A}{V}\\,r$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{V}{A}\\,r$",
                                isCorrect: false,
                            },
                            {
                                text: "$A\\,r$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{A}{V}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um tanque com $200$ L de água pura recebe salmoura de $3$ g/L a $4$ L/min, saindo à mesma vazão. Qual EDO modela a quantidade $A(t)$ de sal?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{dA}{dt} = 12 - \\frac{A}{50}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{dA}{dt} = 12 - \\frac{A}{200}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{dA}{dt} = 3 - \\frac{A}{50}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{dA}{dt} = 12 - \\frac{A}{800}$",
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
