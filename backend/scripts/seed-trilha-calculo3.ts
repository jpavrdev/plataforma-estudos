// Seed da trilha Cálculo 3 (cálculo de várias variáveis). Conteúdo autoral,
// quiz-only, com fórmulas em LaTeX. Idempotente: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-calculo3.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Cálculo 3";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Cálculo de várias variáveis: funções de duas ou mais variáveis com limites e continuidade, as derivadas parciais e a diferenciabilidade, a regra da cadeia, o gradiente e a derivada direcional, os máximos e mínimos com multiplicadores de Lagrange, as integrais duplas e triplas (em coordenadas polares, cilíndricas e esféricas) e uma introdução ao cálculo vetorial (campos, integral de linha e o teorema de Green). O cálculo que descreve superfícies, volumes e campos, no coração da física e da engenharia.";

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
        titulo: "Módulo 1 - Funções de várias variáveis",
        aulas: [
            {
                titulo: "Funções de duas ou mais variáveis",
                blocks: [
                    {
                        type: "text",
                        value: "# Funções de duas ou mais variáveis\n\nNo Cálculo 1 e 2 você estudou funções de uma variável, $y = f(x)$, que associam a cada número real $x$ um único número real $y$. Muitos fenômenos, porém, dependem de mais de uma grandeza. A temperatura em uma chapa metálica depende da posição $(x, y)$ do ponto; o volume de um cilindro depende do raio $r$ e da altura $h$. Para modelar essas situações precisamos de **funções de várias variáveis**.\n\nUma **função de duas variáveis** é uma regra $f$ que associa a cada par ordenado $(x, y)$ de um conjunto $D \\subseteq \\mathbb{R}^2$ um único número real, denotado por $f(x, y)$. O conjunto $D$ é o **domínio** e o conjunto dos valores assumidos é a **imagem**.",
                    },
                    {
                        type: "text",
                        value: "## Notação e vocabulário\n\nEscrevemos\n$$z = f(x, y),$$\nonde $x$ e $y$ são as **variáveis independentes** e $z$ é a **variável dependente**. Pense em $f$ como uma máquina: você fornece um par $(x, y)$ e ela devolve o número $f(x, y)$.\n\nPor exemplo, na função $f(x, y) = x^2 + y^2$, ao entrar com o par $(3, 4)$ obtemos\n$$f(3, 4) = 3^2 + 4^2 = 9 + 16 = 25.$$\n\nAssim como no cálculo de uma variável, quando a função é dada apenas por uma expressão algébrica, convenciona-se que o domínio é o maior conjunto de pares $(x, y)$ para os quais a expressão faz sentido e produz um número real.",
                    },
                    {
                        type: "text",
                        value: "## Funções de três ou mais variáveis\n\nA ideia se estende naturalmente. Uma **função de três variáveis** associa a cada terno $(x, y, z)$ de um domínio $D \\subseteq \\mathbb{R}^3$ um número real $w = f(x, y, z)$. Por exemplo,\n$$f(x, y, z) = \\sqrt{x^2 + y^2 + z^2}$$\ndevolve a distância do ponto $(x, y, z)$ à origem.\n\nDe modo geral, uma **função de $n$ variáveis** associa a cada ponto $(x_1, x_2, \\ldots, x_n) \\in D \\subseteq \\mathbb{R}^n$ um único número real. Trabalharemos com muita frequência nos casos $n = 2$ e $n = 3$, pois são os que permitem visualização geométrica, mas toda a teoria vale para $n$ qualquer.",
                    },
                    {
                        type: "quote",
                        value: "Uma função de várias variáveis é apenas uma máquina que recebe um ponto do espaço e devolve um número. Toda a intuição do Cálculo 1 continua valendo, agora com mais entradas.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nSeja $g(x, y) = \\dfrac{x + y}{x - y}$. Calcule $g(2, 1)$, $g(0, 5)$ e $g(a, -a)$ para $a \\ne 0$.\n\n**Solução.** Basta substituir os valores nas variáveis.\n\nPara $(2, 1)$:\n$$g(2, 1) = \\frac{2 + 1}{2 - 1} = \\frac{3}{1} = 3.$$\n\nPara $(0, 5)$:\n$$g(0, 5) = \\frac{0 + 5}{0 - 5} = \\frac{5}{-5} = -1.$$\n\nPara $(a, -a)$ com $a \\ne 0$:\n$$g(a, -a) = \\frac{a + (-a)}{a - (-a)} = \\frac{0}{2a} = 0.$$\n\nNote que o par $(a, a)$ tornaria o denominador nulo, então os pontos da reta $y = x$ ficam de fora do domínio.",
                    },
                    {
                        type: "text",
                        value: "## O gráfico de uma função de duas variáveis\n\nO **gráfico** de $f(x, y)$ é o conjunto de todos os pontos $(x, y, z)$ do espaço tais que $z = f(x, y)$ e $(x, y) \\in D$. Enquanto o gráfico de uma função de uma variável é uma curva no plano, o gráfico de uma função de duas variáveis é, em geral, uma **superfície** no espaço $\\mathbb{R}^3$.\n\nPor exemplo, o gráfico de $f(x, y) = x^2 + y^2$ é um paraboloide que se abre para cima, com vértice na origem. Já o gráfico de uma função afim $f(x, y) = ax + by + c$ é sempre um plano.\n\nPara funções de três variáveis não conseguimos desenhar o gráfico, pois ele viveria em $\\mathbb{R}^4$. Por isso, para $n \\ge 3$ recorremos a outras ferramentas de visualização, como as superfícies de nível, que veremos adiante.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nUma caixa retangular sem tampa tem base $x$ por $y$ e altura $z$. Expresse a área total do material usado como função das dimensões.\n\n**Solução.** A caixa tem um fundo e quatro paredes laterais. O fundo é um retângulo de área $xy$. As paredes formam dois pares: duas de área $xz$ e duas de área $yz$. Logo, a área do material é a função de três variáveis\n$$A(x, y, z) = xy + 2xz + 2yz.$$\n\nSe soubermos, por exemplo, que o volume é fixo, $xyz = V$, podemos isolar uma variável e reduzir o problema a uma função de duas variáveis, técnica muito usada em problemas de otimização.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma função de várias variáveis associa a cada ponto de um domínio $D \\subseteq \\mathbb{R}^n$ um único número real.\n- Para duas variáveis escrevemos $z = f(x, y)$; para três, $w = f(x, y, z)$.\n- Avaliar a função é simplesmente substituir os valores das variáveis.\n- O gráfico de $f(x, y)$ é uma superfície em $\\mathbb{R}^3$; para três ou mais variáveis o gráfico não é visualizável diretamente.\n- Quando só a expressão é dada, o domínio é o maior conjunto onde ela faz sentido, assunto da próxima aula.",
                    },
                ],
                questions: [
                    {
                        statement: "Considere $f(x, y) = x^2 - 2y$. O valor de $f(-3, 2)$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$13$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$-7$",
                                isCorrect: false,
                            },
                            {
                                text: "$-13$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $h(x, y, z) = \\sqrt{x^2 + y^2 + z^2}$, o valor de $h(1, 2, 2)$ é:",
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
                                text: "$\\sqrt{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual das funções abaixo tem por gráfico um plano?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$f(x, y) = x^2 + y^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(x, y) = \\sqrt{x^2 + y^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(x, y) = 2x + y - 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$f(x, y) = x^2 - y^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O gráfico de uma função $z = f(x, y)$ é, em geral:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "uma curva no plano",
                                isCorrect: false,
                            },
                            {
                                text: "uma superfície em $\\mathbb{R}^2$",
                                isCorrect: false,
                            },
                            {
                                text: "um sólido em $\\mathbb{R}^3$",
                                isCorrect: false,
                            },
                            {
                                text: "uma superfície em $\\mathbb{R}^3$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma caixa retangular fechada tem dimensões $x$, $y$ e $z$. A área total de suas seis faces é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$xy + 2xz + 2yz$",
                                isCorrect: false,
                            },
                            {
                                text: "$2xy + 2xz + 2yz$",
                                isCorrect: true,
                            },
                            {
                                text: "$2(x + y + z)$",
                                isCorrect: false,
                            },
                            {
                                text: "$xyz$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Domínio e imagem",
                blocks: [
                    {
                        type: "text",
                        value: "# Domínio e imagem\n\nQuando uma função de duas variáveis é dada apenas por uma fórmula, adotamos a **convenção do domínio natural**: o domínio $D$ é o maior subconjunto de $\\mathbb{R}^2$ para o qual a expressão está definida e produz um número real. A **imagem** é o conjunto de todos os valores $z = f(x, y)$ obtidos quando $(x, y)$ percorre o domínio.\n\nDiferentemente do caso de uma variável, em que o domínio costuma ser um intervalo ou uma união de intervalos na reta, aqui o domínio é uma **região do plano** $\\mathbb{R}^2$ (ou do espaço, para três variáveis). Saber esboçar essa região é uma habilidade central desta aula.",
                    },
                    {
                        type: "text",
                        value: "## As três restrições mais comuns\n\nA maior parte dos domínios aparece por causa de três operações que não valem para qualquer número real:\n\n1. **Divisão:** o denominador não pode ser zero. Em $\\dfrac{1}{x - y}$ exigimos $x - y \\ne 0$, isto é, $y \\ne x$.\n2. **Raiz de índice par:** o radicando não pode ser negativo. Em $\\sqrt{x - y}$ exigimos $x - y \\ge 0$.\n3. **Logaritmo:** o argumento deve ser estritamente positivo. Em $\\ln(x + y)$ exigimos $x + y > 0$.\n\nQuando várias restrições aparecem juntas, o domínio é a **interseção** de todas as condições: o ponto precisa satisfazer todas simultaneamente.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nDetermine o domínio de $f(x, y) = \\sqrt{9 - x^2 - y^2}$.\n\n**Solução.** Por ser uma raiz quadrada, precisamos do radicando não negativo:\n$$9 - x^2 - y^2 \\ge 0 \\quad \\Longleftrightarrow \\quad x^2 + y^2 \\le 9.$$\n\nGeometricamente, $x^2 + y^2 = 9$ é a circunferência de centro na origem e raio $3$. A condição $x^2 + y^2 \\le 9$ descreve o **disco** formado por essa circunferência e todo o seu interior. Portanto,\n$$D = \\{ (x, y) \\in \\mathbb{R}^2 : x^2 + y^2 \\le 9 \\},$$\num disco fechado de raio $3$ centrado na origem.",
                    },
                    {
                        type: "text",
                        value: "## Domínios como regiões do plano\n\nEsboçar o domínio significa sombrear no plano $xy$ todos os pontos que satisfazem as condições. Vale a pena distinguir a **fronteira**:\n\n- Desigualdades com $\\ge$ ou $\\le$, vindas de raízes, **incluem** a curva de fronteira; costumamos desenhá-la como linha cheia.\n- Desigualdades estritas $>$ ou $<$, vindas de logaritmos, e as restrições de denominador **excluem** a fronteira; desenhamos linha tracejada.\n\nAssim, o domínio de $\\sqrt{y - x^2}$ é a região sobre e acima da parábola $y = x^2$, com a fronteira incluída, enquanto o domínio de $\\ln(y - x^2)$ é a região estritamente acima da mesma parábola, com a fronteira excluída.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nDetermine o domínio de $g(x, y) = \\dfrac{\\ln(x - y)}{\\sqrt{x}}$.\n\n**Solução.** Há duas restrições a combinar.\n\nO logaritmo exige argumento positivo:\n$$x - y > 0 \\quad \\Longleftrightarrow \\quad y < x.$$\n\nA raiz no denominador exige radicando não negativo e denominador não nulo; como $\\sqrt{x}$ está embaixo, precisamos de $x > 0$, pois o valor $x = 0$ zeraria o denominador.\n\nO domínio é a interseção das duas condições:\n$$D = \\{ (x, y) \\in \\mathbb{R}^2 : x > 0 \\text{ e } y < x \\}.$$\nÉ a faixa com $x$ positivo, abaixo da reta $y = x$.",
                    },
                    {
                        type: "text",
                        value: "## A imagem\n\nA imagem é o conjunto dos valores de saída. Para determiná-la, analisamos quais números $z$ a expressão pode atingir quando $(x, y)$ varia no domínio.\n\nRetomando $f(x, y) = \\sqrt{9 - x^2 - y^2}$: dentro do disco, a soma $x^2 + y^2$ varia de $0$, na origem, até $9$, na borda. Então $9 - x^2 - y^2$ varia de $0$ a $9$, e sua raiz quadrada varia de $0$ a $3$. Logo, a imagem é o intervalo $[0, 3]$.\n\nComo regra prática: a imagem de uma raiz quadrada nunca é negativa; a imagem de uma exponencial $e^{f}$ é sempre positiva; e uma soma de quadrados como $x^2 + y^2$ nunca é negativa. Reconhecer esses limites naturais ajuda a encontrar a imagem sem esforço.",
                    },
                    {
                        type: "quote",
                        value: "Encontrar o domínio é perguntar, antes de qualquer conta, onde a fórmula tem o direito de existir.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Pela convenção do domínio natural, $D$ é o maior conjunto de pontos onde a fórmula produz um número real.\n- Três restrições dominam: denominador $\\ne 0$, radicando de índice par $\\ge 0$ e argumento de logaritmo $> 0$.\n- Com várias restrições, o domínio é a **interseção** de todas.\n- O domínio de uma função de duas variáveis é uma região do plano; raízes incluem a fronteira, logaritmos e denominadores a excluem.\n- A imagem é o conjunto dos valores de saída, muitas vezes obtido observando os limites naturais da expressão.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O domínio de $f(x, y) = \\sqrt{x + y}$ é o conjunto dos pontos com:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x + y \\ge 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$x + y > 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x + y \\le 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x + y \\ne 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O domínio de $f(x, y) = \\dfrac{1}{x - y}$ é formado pelos pontos em que:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$y = x$",
                                isCorrect: false,
                            },
                            {
                                text: "$y > x$",
                                isCorrect: false,
                            },
                            {
                                text: "$y \\ne x$",
                                isCorrect: true,
                            },
                            {
                                text: "$y \\ge x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O domínio de $f(x, y) = \\sqrt{4 - x^2 - y^2}$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\{(x, y) : x^2 + y^2 \\le 4\\}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\{(x, y) : x^2 + y^2 \\ge 4\\}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\{(x, y) : x^2 + y^2 < 4\\}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\{(x, y) : x^2 + y^2 \\le 2\\}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A imagem de $f(x, y) = x^2 + y^2$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(-\\infty, +\\infty)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, +\\infty)$",
                                isCorrect: false,
                            },
                            {
                                text: "$[0, 1]$",
                                isCorrect: false,
                            },
                            {
                                text: "$[0, +\\infty)$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "O domínio de $f(x, y) = \\sqrt{x - 1} + \\ln(4 - y)$ é o conjunto dos pontos com:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$x > 1$ e $y \\le 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\ge 1$ e $y < 4$",
                                isCorrect: true,
                            },
                            {
                                text: "$x \\ge 1$ e $y > 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x \\le 1$ e $y < 4$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Curvas e superfícies de nível",
                blocks: [
                    {
                        type: "text",
                        value: "# Curvas e superfícies de nível\n\nO gráfico de $f(x, y)$ vive em três dimensões, o que dificulta desenhá-lo à mão. Uma alternativa poderosa é fatiar esse gráfico por planos horizontais e projetar as fatias no plano $xy$. Cada fatia dá origem a uma **curva de nível**.\n\nDado um número real $c$, a **curva de nível** de valor $c$ é o conjunto dos pontos do domínio em que a função vale exatamente $c$:\n$$\\{ (x, y) \\in D : f(x, y) = c \\}.$$\n\nEm outras palavras, é a curva $f(x, y) = c$ desenhada no plano $xy$. Ao longo dela a função é constante e igual a $c$.",
                    },
                    {
                        type: "text",
                        value: "## O mapa de contorno\n\nDesenhar várias curvas de nível para valores igualmente espaçados de $c$ produz um **mapa de contorno**, exatamente como os mapas topográficos usados em geografia. Nesses mapas, cada linha liga pontos de mesma altitude.\n\nA leitura do mapa revela o comportamento da função:\n\n- Curvas de nível muito próximas indicam que a função varia rapidamente ali, como um terreno íngreme.\n- Curvas de nível bem espaçadas indicam variação lenta, como um terreno plano.\n\nAssim, sem enxergar a superfície, deduzimos onde ela sobe depressa ou devagar apenas olhando o espaçamento das curvas.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nDescreva as curvas de nível de $f(x, y) = x^2 + y^2$.\n\n**Solução.** Fixado um valor $c$, a curva de nível é\n$$x^2 + y^2 = c.$$\n\nAnalisamos por casos:\n\n- Se $c > 0$, a equação $x^2 + y^2 = c$ é uma **circunferência** de centro na origem e raio $\\sqrt{c}$.\n- Se $c = 0$, a única solução é o ponto $(0, 0)$: a curva degenera em um ponto.\n- Se $c < 0$, não há solução, pois uma soma de quadrados não é negativa; não existe curva de nível.\n\nAs curvas de nível são, portanto, circunferências concêntricas. Como o raio $\\sqrt{c}$ cresce cada vez mais devagar à medida que $c$ aumenta, as circunferências ficam mais próximas para valores grandes de $c$, coerente com o paraboloide que se abre.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nDescreva as curvas de nível de $f(x, y) = y - x^2$.\n\n**Solução.** A curva de nível de valor $c$ satisfaz\n$$y - x^2 = c \\quad \\Longleftrightarrow \\quad y = x^2 + c.$$\n\nPara cada valor de $c$ obtemos uma **parábola** com concavidade para cima, idêntica a $y = x^2$ porém deslocada verticalmente por $c$ unidades. Quando $c$ aumenta, a parábola sobe; quando $c$ diminui, ela desce.\n\nRepare que aqui todas as curvas de nível têm a mesma forma e diferem apenas por translação, ao contrário do exemplo anterior, em que mudavam de raio.",
                    },
                    {
                        type: "text",
                        value: "## Curva de nível não é o gráfico\n\nUm erro frequente é confundir a curva de nível com o gráfico da função. São objetos diferentes:\n\n- O **gráfico** de $f(x, y)$ é uma superfície em $\\mathbb{R}^3$, formada pelos pontos $(x, y, f(x, y))$.\n- A **curva de nível** $f(x, y) = c$ é uma curva plana, desenhada em $\\mathbb{R}^2$, que corresponde à projeção da interseção do gráfico com o plano horizontal $z = c$.\n\nNo exemplo do paraboloide $z = x^2 + y^2$, o gráfico é a superfície tridimensional em forma de tigela; a curva de nível $c = 4$ é a circunferência de raio $2$ desenhada no plano. Uma é tridimensional, a outra é plana.",
                    },
                    {
                        type: "quote",
                        value: "Curvas de nível transformam uma superfície tridimensional em um mapa plano legível. Aprender a lê-las é como aprender a interpretar o mapa de uma montanha sem nunca subir nela.",
                    },
                    {
                        type: "text",
                        value: "## Superfícies de nível\n\nPara uma função de três variáveis $f(x, y, z)$ não podemos desenhar o gráfico, mas a mesma ideia se adapta. A **superfície de nível** de valor $c$ é o conjunto\n$$\\{ (x, y, z) : f(x, y, z) = c \\},$$\nformado pelos pontos do espaço em que a função vale $c$.\n\nPor exemplo, para $f(x, y, z) = x^2 + y^2 + z^2$, a superfície de nível $x^2 + y^2 + z^2 = c$ é, quando $c > 0$, uma **esfera** de raio $\\sqrt{c}$ centrada na origem. Variando $c$ obtemos esferas concêntricas, o análogo tridimensional das circunferências do primeiro exemplo. Para $c = 0$ resta só a origem e, para $c < 0$, não há pontos.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A curva de nível $f(x, y) = c$ reúne os pontos do plano em que a função vale $c$; ao longo dela $f$ é constante.\n- Um mapa de contorno é uma coleção de curvas de nível; o espaçamento indica se a função varia rápido ou devagar.\n- A curva de nível é plana, em $\\mathbb{R}^2$; o gráfico é uma superfície, em $\\mathbb{R}^3$. São objetos distintos.\n- Para três variáveis, o análogo é a superfície de nível $f(x, y, z) = c$.\n- Exemplos-chave: círculos concêntricos para $x^2 + y^2$, parábolas transladadas para $y - x^2$ e esferas para $x^2 + y^2 + z^2$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "As curvas de nível de $f(x, y) = x^2 + y^2$, para $c > 0$, são:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "circunferências centradas na origem",
                                isCorrect: true,
                            },
                            {
                                text: "retas paralelas entre si",
                                isCorrect: false,
                            },
                            {
                                text: "parábolas com eixo vertical",
                                isCorrect: false,
                            },
                            {
                                text: "hipérboles equiláteras",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A curva de nível de $f(x, y) = x + y$ correspondente a $c = 1$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "a reta $y = x$",
                                isCorrect: false,
                            },
                            {
                                text: "a circunferência $x^2 + y^2 = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "a reta $x + y = 1$",
                                isCorrect: true,
                            },
                            {
                                text: "a parábola $y = x^2 + 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A curva de nível de $f(x, y) = y - x^2$ correspondente a $c = 2$ é a curva:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$y = x^2 - 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = x^2 + 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$y = 2 - x^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre a diferença entre curva de nível e gráfico, é correto afirmar:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "a curva de nível está em $\\mathbb{R}^3$ e o gráfico em $\\mathbb{R}^2$",
                                isCorrect: false,
                            },
                            {
                                text: "a curva de nível e o gráfico são o mesmo conjunto",
                                isCorrect: false,
                            },
                            {
                                text: "o gráfico de $f(x, y)$ é sempre uma curva plana",
                                isCorrect: false,
                            },
                            {
                                text: "a curva de nível está em $\\mathbb{R}^2$ e o gráfico em $\\mathbb{R}^3$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "A curva de nível de $f(x, y) = x^2 - y^2$ correspondente a $c = 0$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "as retas $y = x$ e $y = -x$",
                                isCorrect: true,
                            },
                            {
                                text: "uma única hipérbole",
                                isCorrect: false,
                            },
                            {
                                text: "apenas a origem",
                                isCorrect: false,
                            },
                            {
                                text: "somente a reta $y = x$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Limites de funções de várias variáveis",
                blocks: [
                    {
                        type: "text",
                        value: "# Limites de funções de várias variáveis\n\nNo Cálculo 1, dizer que $\\lim_{x \\to a} f(x) = L$ significa que $f(x)$ se aproxima de $L$ quando $x$ se aproxima de $a$. Só há dois modos de se aproximar de $a$ na reta: pela esquerda e pela direita.\n\nPara funções de duas variáveis escrevemos\n$$\\lim_{(x, y) \\to (a, b)} f(x, y) = L,$$\ncom o significado de que $f(x, y)$ fica arbitrariamente próximo de $L$ sempre que $(x, y)$ está suficientemente próximo de $(a, b)$, com $(x, y) \\ne (a, b)$. A diferença fundamental, e a fonte de quase toda a dificuldade, aparece no modo como o ponto se aproxima.",
                    },
                    {
                        type: "text",
                        value: "## Infinitos caminhos de aproximação\n\nNo plano, um ponto pode se aproximar de $(a, b)$ por infinitas direções e trajetórias: por retas, por parábolas, por espirais. Para que o limite exista e valha $L$, é preciso que $f(x, y)$ tenda a $L$ **por todos os caminhos possíveis**.\n\nDaí surge o critério mais usado para mostrar que um limite **não existe**: se, ao aproximar-se de $(a, b)$ por dois caminhos diferentes, obtemos valores-limite distintos, então o limite não existe.\n\nAtenção a um ponto sutil: encontrar o mesmo valor por dois, três ou mil caminhos **não prova** que o limite exista, pois sempre restam infinitos outros caminhos. Caminhos servem com segurança apenas para provar a **não existência**.",
                    },
                    {
                        type: "text",
                        value: "## Quando a substituição direta funciona\n\nNem todo limite é problemático. Para funções construídas por somas, produtos e composições de polinômios e funções elementares, quando o ponto pertence ao domínio, o limite é obtido por **substituição direta**. Valem as propriedades usuais: o limite da soma é a soma dos limites, o do produto é o produto, e assim por diante.\n\nPor exemplo,\n$$\\lim_{(x, y) \\to (1, 2)} (x^2 + 3xy) = 1^2 + 3 \\cdot 1 \\cdot 2 = 7,$$\npois $x^2 + 3xy$ é um polinômio, contínuo em todo o plano. Os casos interessantes surgem quando a substituição gera uma indeterminação, tipicamente $\\frac{0}{0}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nCalcule $\\displaystyle \\lim_{(x, y) \\to (0, 0)} \\frac{x^2 y}{x^2 + y^2}$.\n\n**Solução.** A substituição direta dá $\\frac{0}{0}$, então precisamos investigar. Uma técnica eficaz é usar coordenadas polares, $x = r\\cos\\theta$ e $y = r\\sin\\theta$, com $r \\to 0^+$. Então $x^2 + y^2 = r^2$ e\n$$\\frac{x^2 y}{x^2 + y^2} = \\frac{r^2 \\cos^2\\theta \\cdot r \\sin\\theta}{r^2} = r \\cos^2\\theta \\sin\\theta.$$\n\nComo $|\\cos^2\\theta \\sin\\theta| \\le 1$, temos $|r \\cos^2\\theta \\sin\\theta| \\le r \\to 0$, independentemente de $\\theta$. Logo o valor tende a $0$ por qualquer direção e\n$$\\lim_{(x, y) \\to (0, 0)} \\frac{x^2 y}{x^2 + y^2} = 0.$$",
                    },
                    {
                        type: "text",
                        value: "## O teste dos caminhos na prática\n\nPara suspeitar que um limite não existe, comparamos aproximações por retas $y = mx$. Substituindo, obtemos uma expressão em função da inclinação $m$. Se o resultado **depende de $m$**, cada reta leva a um valor diferente e o limite não existe.\n\nCaminhos úteis para testar:\n\n- os eixos, $y = 0$ e $x = 0$;\n- retas pela origem, $y = mx$;\n- parábolas, como $y = x^2$, quando as retas não bastam.\n\nBasta encontrar **dois** caminhos com valores distintos para concluir a não existência.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nMostre que $\\displaystyle \\lim_{(x, y) \\to (0, 0)} \\frac{xy}{x^2 + y^2}$ não existe.\n\n**Solução.** Aproximamo-nos da origem por retas $y = mx$:\n$$\\frac{xy}{x^2 + y^2} = \\frac{x \\cdot mx}{x^2 + m^2 x^2} = \\frac{m x^2}{x^2 (1 + m^2)} = \\frac{m}{1 + m^2}.$$\n\nO resultado depende de $m$. Pelo eixo $x$, isto é $m = 0$, o valor é $0$; pela reta $y = x$, isto é $m = 1$, o valor é $\\frac{1}{2}$. Como dois caminhos fornecem limites diferentes, $0$ e $\\frac{1}{2}$, o limite\n$$\\lim_{(x, y) \\to (0, 0)} \\frac{xy}{x^2 + y^2}$$\nnão existe.",
                    },
                    {
                        type: "text",
                        value: "## Uma palavra sobre a definição formal\n\nAssim como no cálculo de uma variável há a definição $\\varepsilon$-$\\delta$, aqui dizemos que $\\lim_{(x, y) \\to (a, b)} f(x, y) = L$ quando, para todo $\\varepsilon > 0$, existe $\\delta > 0$ tal que\n$$0 < \\sqrt{(x - a)^2 + (y - b)^2} < \\delta \\;\\Rightarrow\\; |f(x, y) - L| < \\varepsilon.$$\n\nA distância $\\sqrt{(x - a)^2 + (y - b)^2}$ substitui o $|x - a|$ da reta. Intuitivamente: por menor que seja a tolerância $\\varepsilon$ em torno de $L$, conseguimos um disco de raio $\\delta$ em torno de $(a, b)$ dentro do qual a função respeita essa tolerância. No dia a dia usamos as técnicas anteriores; a definição formal garante o rigor.",
                    },
                    {
                        type: "quote",
                        value: "Em uma variável há dois caminhos para chegar a um ponto; no plano há infinitos. É por isso que limites de várias variáveis exigem tanto cuidado.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $\\lim_{(x, y) \\to (a, b)} f(x, y) = L$ exige que $f$ tenda a $L$ por **todos** os caminhos.\n- Para polinômios e funções elementares no domínio, o limite sai por substituição direta.\n- Se dois caminhos dão valores diferentes, o limite **não existe**; achar o mesmo valor por vários caminhos **não** prova existência.\n- Coordenadas polares ajudam a provar que um limite existe, mostrando que o valor tende a $L$ para todo ângulo.\n- O caso $\\frac{xy}{x^2 + y^2}$ na origem é o exemplo clássico de limite que não existe.",
                    },
                ],
                questions: [
                    {
                        statement: "O valor de $\\lim_{(x, y) \\to (2, 1)} (x^2 - 3y)$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$7$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$-1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para mostrar que um limite em várias variáveis não existe, basta:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "achar um caminho em que o limite é zero",
                                isCorrect: false,
                            },
                            {
                                text: "achar dois caminhos com limites diferentes",
                                isCorrect: true,
                            },
                            {
                                text: "verificar que o ponto não está no domínio",
                                isCorrect: false,
                            },
                            {
                                text: "calcular uma derivada parcial no ponto",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O valor de $\\lim_{(x, y) \\to (0, 0)} \\dfrac{x^2 y}{x^2 + y^2}$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "não existe",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{2}$",
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
                            "Aproximando-se de $(0, 0)$ pela reta $y = x$, a expressão $\\dfrac{xy}{x^2 + y^2}$ tende a:",
                        difficulty: "medio",
                        options: [
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
                            {
                                text: "$\\dfrac{1}{2}$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre $\\lim_{(x, y) \\to (0, 0)} \\dfrac{x^2 y}{x^4 + y^2}$, é correto afirmar que o limite:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "vale $0$",
                                isCorrect: false,
                            },
                            {
                                text: "não existe",
                                isCorrect: true,
                            },
                            {
                                text: "vale $\\dfrac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "vale $1$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Continuidade",
                blocks: [
                    {
                        type: "text",
                        value: "# Continuidade\n\nA noção de continuidade formaliza a ideia de uma função sem saltos nem buracos. Para funções de várias variáveis a definição espelha a de uma variável, agora com o limite tomado ao longo de todos os caminhos.\n\nDizemos que $f(x, y)$ é **contínua no ponto** $(a, b)$ quando três condições se cumprem:\n\n1. $f(a, b)$ está definida, ou seja, $(a, b)$ pertence ao domínio;\n2. o limite $\\lim_{(x, y) \\to (a, b)} f(x, y)$ existe;\n3. os dois coincidem: $\\lim_{(x, y) \\to (a, b)} f(x, y) = f(a, b)$.\n\nSe qualquer uma dessas condições falha, $f$ é **descontínua** em $(a, b)$.",
                    },
                    {
                        type: "text",
                        value: "## Funções sabidamente contínuas\n\nFelizmente, a maioria das funções com que trabalhamos é contínua em quase todo lugar. Valem os fatos:\n\n- Todo **polinômio** em $x$ e $y$ é contínuo em todo o plano $\\mathbb{R}^2$.\n- Toda **função racional**, quociente de polinômios, é contínua em todos os pontos do seu domínio, isto é, onde o denominador não se anula.\n- **Somas, produtos, quocientes e composições** de funções contínuas são contínuas, sempre respeitando os domínios.\n\nPor isso, funções como $e^{xy}$, $\\sin(x + y)$ e $\\dfrac{x - y}{x^2 + 1}$ são contínuas onde estão definidas. A continuidade só fica em xeque nos pontos de fronteira do domínio ou onde a função é definida por partes.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nVerifique que $f(x, y) = \\dfrac{x + y}{x^2 + y^2 + 1}$ é contínua em $(1, 2)$.\n\n**Solução.** O denominador $x^2 + y^2 + 1$ é sempre maior ou igual a $1$, logo nunca se anula, e a função é racional com domínio igual a todo o plano. Como funções racionais são contínuas em seu domínio, $f$ é contínua em $(1, 2)$.\n\nPodemos confirmar pela substituição direta:\n$$\\lim_{(x, y) \\to (1, 2)} \\frac{x + y}{x^2 + y^2 + 1} = \\frac{1 + 2}{1 + 4 + 1} = \\frac{3}{6} = \\frac{1}{2} = f(1, 2).$$\nAs três condições valem, então $f$ é contínua no ponto.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nConsidere a função definida por partes\n$$f(x, y) = \\begin{cases} \\dfrac{xy}{x^2 + y^2}, & (x, y) \\ne (0, 0), \\\\ 0, & (x, y) = (0, 0). \\end{cases}$$\nEla é contínua na origem?\n\n**Solução.** O valor $f(0, 0) = 0$ está definido, então a primeira condição vale. Resta o limite. Vimos na aula anterior que\n$$\\lim_{(x, y) \\to (0, 0)} \\frac{xy}{x^2 + y^2}$$\n**não existe**, pois retas com inclinações diferentes dão valores diferentes. Falhando a segunda condição, a função é **descontínua** na origem, por mais que tenhamos atribuído um valor ali. Fora da origem, sendo racional com denominador não nulo, $f$ é contínua.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 3\n\nAgora seja\n$$g(x, y) = \\begin{cases} \\dfrac{x^2 y}{x^2 + y^2}, & (x, y) \\ne (0, 0), \\\\ 0, & (x, y) = (0, 0). \\end{cases}$$\nVerifique a continuidade na origem.\n\n**Solução.** De novo $g(0, 0) = 0$ está definido. Quanto ao limite, mostramos na aula de limites, via coordenadas polares, que\n$$\\lim_{(x, y) \\to (0, 0)} \\frac{x^2 y}{x^2 + y^2} = 0.$$\n\nComo o limite existe e vale $0$, exatamente igual a $g(0, 0)$, as três condições se cumprem e $g$ **é contínua** na origem. A diferença em relação ao exemplo anterior está inteiramente no numerador, que agora força a expressão a tender a zero.",
                    },
                    {
                        type: "quote",
                        value: "Continuidade é a ponte entre o valor que a função assume em um ponto e os valores que ela assume ao redor. Onde essa ponte se rompe, aparece uma descontinuidade.",
                    },
                    {
                        type: "text",
                        value: "## Continuidade em uma região e onde procurar descontinuidades\n\nUma função é **contínua em uma região** quando é contínua em cada ponto dela. Na prática, para localizar possíveis descontinuidades de uma expressão, procuramos:\n\n- pontos que **anulam denominadores**, como a origem em $\\dfrac{1}{x^2 + y^2}$;\n- pontos de **fronteira do domínio** de raízes e logaritmos;\n- pontos onde a função **muda de definição**, nas funções por partes.\n\nNos demais pontos, as regras de soma, produto e composição garantem continuidade sem esforço adicional. Por exemplo, $h(x, y) = \\dfrac{1}{x - y}$ é contínua em todo o plano exceto sobre a reta $y = x$, onde nem sequer está definida.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $f$ é contínua em $(a, b)$ quando $f(a, b)$ existe, o limite existe e ambos coincidem.\n- Polinômios são contínuos em todo o plano; funções racionais e composições, em seus domínios.\n- Numa função por partes, a continuidade no ponto de junção depende de o limite existir e igualar o valor atribuído.\n- $\\frac{xy}{x^2 + y^2}$ com valor $0$ na origem é descontínua, pois o limite não existe; $\\frac{x^2 y}{x^2 + y^2}$ com valor $0$ é contínua, pois o limite é $0$.\n- Descontinuidades moram em denominadores nulos, fronteiras de domínio e pontos de troca de definição.",
                    },
                ],
                questions: [
                    {
                        statement: "Para que $f$ seja contínua em $(a, b)$, é necessário que:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\lim_{(x, y) \\to (a, b)} f(x, y) = f(a, b)$",
                                isCorrect: true,
                            },
                            {
                                text: "$f(a, b) > 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$f$ seja um polinômio",
                                isCorrect: false,
                            },
                            {
                                text: "a derivada exista em $(a, b)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Todo polinômio nas variáveis $x$ e $y$ é contínuo:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "apenas na origem",
                                isCorrect: false,
                            },
                            {
                                text: "somente onde é positivo",
                                isCorrect: false,
                            },
                            {
                                text: "em todo o plano $\\mathbb{R}^2$",
                                isCorrect: true,
                            },
                            {
                                text: "em nenhum ponto",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A função $h(x, y) = \\dfrac{1}{x - y}$ é descontínua:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "apenas na origem",
                                isCorrect: false,
                            },
                            {
                                text: "sobre a reta $y = x$",
                                isCorrect: true,
                            },
                            {
                                text: "sobre a reta $y = -x$",
                                isCorrect: false,
                            },
                            {
                                text: "em todo o plano",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $f(x, y) = \\dfrac{xy}{x^2 + y^2}$ para $(x, y) \\ne (0, 0)$ e $f(0, 0) = 0$. Na origem, $f$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "contínua, pois $f(0, 0)$ está definida",
                                isCorrect: false,
                            },
                            {
                                text: "contínua, pois é uma função racional",
                                isCorrect: false,
                            },
                            {
                                text: "descontínua, pois $f(0, 0)$ não existe",
                                isCorrect: false,
                            },
                            {
                                text: "descontínua, pois o limite não existe",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $g(x, y) = \\dfrac{x^2 y}{x^2 + y^2}$ para $(x, y) \\ne (0, 0)$ e $g(0, 0) = 0$. Na origem, $g$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "contínua, pois o limite vale $0 = g(0, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "descontínua, pois o limite não existe",
                                isCorrect: false,
                            },
                            {
                                text: "descontínua, pois $g(0, 0)$ não existe",
                                isCorrect: false,
                            },
                            {
                                text: "contínua, pois toda função por partes é contínua",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Derivadas parciais",
        aulas: [
            {
                titulo: "Derivadas parciais",
                blocks: [
                    {
                        type: "text",
                        value: "## O que e uma derivada parcial\n\nNo Calculo de uma variavel, a derivada $f'(x)$ mede a taxa de variacao de $f$ quando $x$ muda. Ao trabalhar com funcoes de varias variaveis, como $z = f(x, y)$, surge uma pergunta natural: como medir a variacao de $f$ se agora temos duas entradas que podem mudar ao mesmo tempo?\n\nA ideia central da **derivada parcial** e isolar o efeito de uma unica variavel. Congelamos todas as outras, tratando-as como constantes, e derivamos apenas em relacao aquela que nos interessa.",
                    },
                    {
                        type: "text",
                        value: "## Definicao pelo limite\n\nSeja $f(x, y)$ uma funcao de duas variaveis. A **derivada parcial de $f$ em relacao a $x$** no ponto $(x_0, y_0)$ e\n\n$$\\frac{\\partial f}{\\partial x}(x_0, y_0) = \\lim_{h \\to 0} \\frac{f(x_0 + h,\\, y_0) - f(x_0, y_0)}{h}$$\n\nDe modo analogo, a **derivada parcial em relacao a $y$** e\n\n$$\\frac{\\partial f}{\\partial y}(x_0, y_0) = \\lim_{h \\to 0} \\frac{f(x_0,\\, y_0 + h) - f(x_0, y_0)}{h}$$\n\nRepare que no primeiro limite apenas $x$ recebe o acrescimo $h$, enquanto $y_0$ permanece fixo. E exatamente isso que significa manter $y$ constante.",
                    },
                    {
                        type: "text",
                        value: "## Notacoes\n\nExistem varias formas de escrever a mesma derivada parcial. Todas aparecem com frequencia, entao vale conhece-las:\n\n| Notacao | Significado |\n| --- | --- |\n| $\\dfrac{\\partial f}{\\partial x}$ | derivada parcial em relacao a $x$ |\n| $f_x$ | forma compacta, tambem em relacao a $x$ |\n| $\\dfrac{\\partial f}{\\partial y}$ ou $f_y$ | derivada parcial em relacao a $y$ |\n| $\\dfrac{\\partial z}{\\partial x}$ | quando escrevemos $z = f(x, y)$ |\n\nO simbolo $\\partial$, chamado de 'del' ou 'd redondo', substitui o $d$ das derivadas ordinarias justamente para lembrar que ha outras variaveis sendo mantidas fixas.",
                    },
                    {
                        type: "quote",
                        value: "Derivar parcialmente e uma questao de foco: olhamos para uma variavel de cada vez e fingimos que o resto do mundo esta parado.",
                    },
                    {
                        type: "text",
                        value: "## Regra pratica\n\nNa pratica nao usamos o limite a cada conta. Basta aplicar as regras usuais de derivacao, com um cuidado so: a variavel que nao estamos derivando entra como se fosse um numero.\n\n**Exemplo 1.** Seja $f(x, y) = x^2 y + \\sin y$. Vamos calcular as duas derivadas parciais.\n\nPara $\\dfrac{\\partial f}{\\partial x}$, tratamos $y$ como constante:\n\n- o termo $x^2 y$ vira $2x y$, pois $y$ e constante e $\\frac{d}{dx}(x^2) = 2x$;\n- o termo $\\sin y$ nao depende de $x$, entao sua derivada e $0$.\n\nLogo $f_x = 2xy$.\n\nAgora $\\dfrac{\\partial f}{\\partial y}$, tratando $x$ como constante:\n\n- o termo $x^2 y$ vira $x^2$, pois $x^2$ e constante e $\\frac{d}{dy}(y) = 1$;\n- o termo $\\sin y$ vira $\\cos y$.\n\nLogo $f_y = x^2 + \\cos y$.",
                    },
                    {
                        type: "text",
                        value: "## Um exemplo polinomial\n\n**Exemplo 2.** Seja $f(x, y) = x^3 + x^2 y^3 - 2y^2$.\n\nDerivando em relacao a $x$ (com $y$ constante):\n\n$$\\frac{\\partial f}{\\partial x} = 3x^2 + 2x y^3$$\n\nO termo $-2y^2$ some, pois nao contem $x$.\n\nDerivando em relacao a $y$ (com $x$ constante):\n\n$$\\frac{\\partial f}{\\partial y} = 3x^2 y^2 - 4y$$\n\nAgora foi o termo $x^3$ que sumiu, por nao conter $y$.",
                    },
                    {
                        type: "text",
                        value: "## Avaliando num ponto\n\nDepois de encontrar a expressao da derivada parcial, podemos avalia-la em um ponto especifico. Retomando $f(x, y) = x^3 + x^2 y^3 - 2y^2$ e o ponto $(1, 2)$:\n\n$$f_x(1, 2) = 3(1)^2 + 2(1)(2)^3 = 3 + 16 = 19$$\n\n$$f_y(1, 2) = 3(1)^2 (2)^2 - 4(2) = 12 - 8 = 4$$\n\nOs numeros $19$ e $4$ sao as taxas instantaneas de variacao de $f$ nas direcoes de $x$ e de $y$, respectivamente, quando partimos do ponto $(1, 2)$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A derivada parcial mede a variacao de $f$ em relacao a uma variavel, com as demais mantidas constantes.\n- $\\dfrac{\\partial f}{\\partial x}$ e $\\dfrac{\\partial f}{\\partial y}$ sao definidas por limites, mas na pratica usamos as regras usuais de derivacao.\n- Para derivar em relacao a $x$, trate $y$ como numero; para derivar em relacao a $y$, trate $x$ como numero.\n- O resultado pode ser avaliado num ponto para obter uma taxa de variacao numerica.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Considere $f(x, y) = x^2 y + \\sin y$. Qual e $\\dfrac{\\partial f}{\\partial x}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$2xy$",
                                isCorrect: true,
                            },
                            {
                                text: "$x^2 + \\cos y$",
                                isCorrect: false,
                            },
                            {
                                text: "$2xy + \\cos y$",
                                isCorrect: false,
                            },
                            {
                                text: "$2xy + \\sin y$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $f(x, y) = x^3 + x^2 y^3 - 2y^2$. Qual e $\\dfrac{\\partial f}{\\partial y}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$3x^2 y^2 - 4y$",
                                isCorrect: true,
                            },
                            {
                                text: "$3x^2 + 2x y^3$",
                                isCorrect: false,
                            },
                            {
                                text: "$3x^2 y^2 - 2y$",
                                isCorrect: false,
                            },
                            {
                                text: "$3x^2 y^2 - 4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x, y) = e^{xy}$, a derivada parcial $\\dfrac{\\partial f}{\\partial x}$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$y\\,e^{xy}$",
                                isCorrect: true,
                            },
                            {
                                text: "$x\\,e^{xy}$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^{xy}$",
                                isCorrect: false,
                            },
                            {
                                text: "$xy\\,e^{xy}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual e $\\dfrac{\\partial f}{\\partial x}$ para $f(x, y) = \\ln(x^2 + y^2)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\dfrac{2x}{x^2 + y^2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{2y}{x^2 + y^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{x^2 + y^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{2x + 2y}{x^2 + y^2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $f(x, y) = \\dfrac{x}{x + y}$. Qual e $\\dfrac{\\partial f}{\\partial x}$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\dfrac{y}{(x + y)^2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{-x}{(x + y)^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{x + y}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{x}{(x + y)^2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Interpretacao geometrica das derivadas parciais",
                blocks: [
                    {
                        type: "text",
                        value: "## A superficie e suas fatias\n\nO grafico de uma funcao $z = f(x, y)$ e uma superficie no espaco tridimensional. Diferentemente de uma curva, uma superficie nao tem uma unica inclinacao em cada ponto: a inclinacao depende da direcao em que caminhamos. As derivadas parciais capturam duas dessas direcoes, as que seguem os eixos $x$ e $y$.",
                    },
                    {
                        type: "text",
                        value: "## Fixando $y$: a curva no plano vertical\n\nSuponha que queremos entender $\\dfrac{\\partial f}{\\partial x}$ no ponto $(a, b)$. Congelar $y = b$ equivale a cortar a superficie com o plano vertical $y = b$. Esse corte gera uma curva, que chamamos de **traco**, e sobre ela apenas $x$ varia.\n\nA curva do traco tem equacao $z = f(x, b)$, uma funcao de uma variavel so. A derivada parcial\n\n$$\\frac{\\partial f}{\\partial x}(a, b)$$\n\ne exatamente a inclinacao da reta tangente a essa curva no ponto onde $x = a$. Em outras palavras, e o coeficiente angular da reta tangente ao traco contido no plano $y = b$.",
                    },
                    {
                        type: "text",
                        value: "## Fixando $x$: a outra direcao\n\nDe forma simetrica, congelar $x = a$ corta a superficie com o plano vertical $x = a$ e produz o traco $z = f(a, y)$. A derivada parcial\n\n$$\\frac{\\partial f}{\\partial y}(a, b)$$\n\ne a inclinacao da reta tangente a esse segundo traco no ponto onde $y = b$.\n\nResumindo: cada derivada parcial e a inclinacao da superficie medida ao longo de uma direcao paralela a um dos eixos horizontais.",
                    },
                    {
                        type: "quote",
                        value: "Uma superficie nao tem uma inclinacao unica, e sim uma para cada direcao. As derivadas parciais escolhem duas direcoes privilegiadas e medem a subida em cada uma delas.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: o paraboloide\n\nSeja $f(x, y) = x^2 + y^2$, cujo grafico e um paraboloide que abre para cima. Vamos interpretar as derivadas parciais no ponto $(1, 1)$, onde $f(1, 1) = 2$.\n\nCalculando:\n\n$$f_x = 2x \\quad\\Rightarrow\\quad f_x(1, 1) = 2$$\n\n$$f_y = 2y \\quad\\Rightarrow\\quad f_y(1, 1) = 2$$\n\nO valor $f_x(1, 1) = 2$ significa que, andando na direcao do eixo $x$ a partir de $(1, 1)$, a superficie sobe com inclinacao $2$. Como o ponto e simetrico, a inclinacao na direcao de $y$ tambem e $2$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: inclinacoes de sinais diferentes\n\nConsidere $f(x, y) = 9 - x^2 - y^2$, um paraboloide que abre para baixo. No ponto $(1, 2)$:\n\n$$f_x = -2x \\quad\\Rightarrow\\quad f_x(1, 2) = -2$$\n\n$$f_y = -2y \\quad\\Rightarrow\\quad f_y(1, 2) = -4$$\n\nAmbas as inclinacoes sao negativas, o que faz sentido: estamos na parte da superficie que desce em todas as direcoes ao nos afastarmos do topo. A descida na direcao de $y$ e mais acentuada, pois $|-4| > |-2|$.",
                    },
                    {
                        type: "text",
                        value: "## Quando as duas inclinacoes se anulam\n\nSe em um ponto $(a, b)$ tivermos $f_x(a, b) = 0$ e $f_y(a, b) = 0$ ao mesmo tempo, os dois tracos tem tangentes horizontais. Isso costuma indicar um ponto de maximo, de minimo ou de sela, temas que serao estudados adiante. Por ora, guarde a leitura geometrica: derivada parcial nula em uma direcao significa traco plano naquela direcao.\n\nAlem da leitura de inclinacao, a derivada parcial tambem e uma **taxa de variacao**: $f_x(a, b)$ informa quanto $f$ cresce por unidade de avanco em $x$, util em contextos fisicos como temperatura, pressao ou custo.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O grafico de $z = f(x, y)$ e uma superficie, e sua inclinacao depende da direcao.\n- $f_x(a, b)$ e a inclinacao da reta tangente ao traco $z = f(x, b)$, obtido cortando a superficie com o plano $y = b$.\n- $f_y(a, b)$ e a inclinacao da reta tangente ao traco $z = f(a, y)$, obtido com o plano $x = a$.\n- Inclinacao positiva indica subida, negativa indica descida; ambas nulas indicam tangentes horizontais nas duas direcoes.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Geometricamente, $\\dfrac{\\partial f}{\\partial x}(a, b)$ representa:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "a inclinacao da tangente ao traco no plano $y = b$",
                                isCorrect: true,
                            },
                            {
                                text: "a inclinacao da tangente ao traco no plano $x = a$",
                                isCorrect: false,
                            },
                            {
                                text: "a inclinacao da superficie na direcao vertical $z$",
                                isCorrect: false,
                            },
                            {
                                text: "a taxa de variacao de $f$ em relacao a $y$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x, y) = x^2 + y^2$, a inclinacao da tangente ao traco no plano $y = 1$ no ponto $(2, 1)$ e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$4$",
                                isCorrect: true,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
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
                            "Seja $f(x, y) = 9 - x^2 - y^2$. A inclinacao do traco na direcao de $y$ no ponto $(1, 2)$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-4$",
                                isCorrect: true,
                            },
                            {
                                text: "$-2$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$-8$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma chapa tem temperatura $T(x, y) = 40 - x^2 - 2y^2$. No ponto $(3, 1)$, a taxa de variacao de $T$ na direcao do eixo $x$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-6$",
                                isCorrect: true,
                            },
                            {
                                text: "$-4$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
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
                            "A superficie $z = f(x, y)$ passa por $(2, 3)$ com $f_x(2, 3) = 5$ e $f_y(2, 3) = 0$. Sobre o traco no plano $x = 2$, e correto dizer que:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "sua reta tangente em $y = 3$ e horizontal",
                                isCorrect: true,
                            },
                            {
                                text: "sua reta tangente em $y = 3$ tem inclinacao $5$",
                                isCorrect: false,
                            },
                            {
                                text: "ele sobe com inclinacao $5$ na direcao de $y$",
                                isCorrect: false,
                            },
                            {
                                text: "ele nao possui reta tangente nesse ponto",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Derivadas parciais de ordem superior",
                blocks: [
                    {
                        type: "text",
                        value: "## Derivando de novo\n\nAs derivadas parciais $f_x$ e $f_y$ sao, elas mesmas, funcoes de $x$ e $y$. Nada nos impede de deriva-las outra vez. Assim surgem as **derivadas parciais de segunda ordem**, e podemos continuar para ordens ainda mais altas.",
                    },
                    {
                        type: "text",
                        value: "## As quatro derivadas de segunda ordem\n\nA partir de $f(x, y)$ obtemos $f_x$ e $f_y$. Derivando cada uma em relacao a $x$ e a $y$, chegamos a quatro derivadas de segunda ordem:\n\n$$f_{xx} = \\frac{\\partial}{\\partial x}\\left(\\frac{\\partial f}{\\partial x}\\right) = \\frac{\\partial^2 f}{\\partial x^2}$$\n\n$$f_{yy} = \\frac{\\partial}{\\partial y}\\left(\\frac{\\partial f}{\\partial y}\\right) = \\frac{\\partial^2 f}{\\partial y^2}$$\n\nAs duas restantes misturam as variaveis e sao chamadas de **derivadas mistas**:\n\n$$f_{xy} = \\frac{\\partial}{\\partial y}\\left(\\frac{\\partial f}{\\partial x}\\right) = \\frac{\\partial^2 f}{\\partial y\\, \\partial x}$$\n\n$$f_{yx} = \\frac{\\partial}{\\partial x}\\left(\\frac{\\partial f}{\\partial y}\\right) = \\frac{\\partial^2 f}{\\partial x\\, \\partial y}$$",
                    },
                    {
                        type: "text",
                        value: "## Atencao a ordem\n\nA notacao com indices e a notacao de Leibniz leem a ordem em sentidos opostos, entao convem memorizar a convencao. Em $f_{xy}$, os indices sao lidos da esquerda para a direita: primeiro derivamos em relacao a $x$, depois em relacao a $y$. Ja em $\\dfrac{\\partial^2 f}{\\partial y\\, \\partial x}$, o denominador e lido da direita para a esquerda: o $\\partial x$ mais proximo de $f$ age primeiro.\n\nAs duas escritas $f_{xy}$ e $\\dfrac{\\partial^2 f}{\\partial y\\, \\partial x}$ representam, portanto, a mesma derivada.",
                    },
                    {
                        type: "quote",
                        value: "Nas funcoes bem comportadas do dia a dia, a ordem em que derivamos duas vezes nao altera o resultado. Essa simetria discreta e um dos fatos mais elegantes do calculo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nSeja $f(x, y) = x^3 y^2$. Primeiro as derivadas de primeira ordem:\n\n$$f_x = 3x^2 y^2, \\qquad f_y = 2x^3 y$$\n\nAgora as de segunda ordem. Derivando $f_x$:\n\n$$f_{xx} = \\frac{\\partial}{\\partial x}(3x^2 y^2) = 6x y^2$$\n\n$$f_{xy} = \\frac{\\partial}{\\partial y}(3x^2 y^2) = 6x^2 y$$\n\nDerivando $f_y$:\n\n$$f_{yy} = \\frac{\\partial}{\\partial y}(2x^3 y) = 2x^3$$\n\n$$f_{yx} = \\frac{\\partial}{\\partial x}(2x^3 y) = 6x^2 y$$\n\nObserve que $f_{xy} = f_{yx} = 6x^2 y$.",
                    },
                    {
                        type: "text",
                        value: "## O teorema de Clairaut\n\nA igualdade $f_{xy} = f_{yx}$ que apareceu no exemplo nao e coincidencia. Ela e garantida pelo **teorema de Clairaut** (tambem atribuido a Schwarz):\n\nSe as derivadas mistas $f_{xy}$ e $f_{yx}$ sao continuas em uma regiao aberta em torno do ponto $(a, b)$, entao\n\n$$f_{xy}(a, b) = f_{yx}(a, b).$$\n\nNa pratica, para quase todas as funcoes que encontramos (polinomios, exponenciais, senos, cossenos e suas combinacoes), a hipotese de continuidade e satisfeita e a ordem de derivacao nao importa.",
                    },
                    {
                        type: "text",
                        value: "## Um exemplo com funcao trigonometrica\n\nSeja $f(x, y) = \\sin(xy)$. As primeiras derivadas, usando a regra da cadeia:\n\n$$f_x = y\\cos(xy), \\qquad f_y = x\\cos(xy)$$\n\nCalculando $f_{xy}$, derivamos $f_x = y\\cos(xy)$ em relacao a $y$ pela regra do produto:\n\n$$f_{xy} = \\cos(xy) + y\\,(-\\sin(xy))\\,x = \\cos(xy) - xy\\sin(xy)$$\n\nE $f_{yx}$, derivando $f_y = x\\cos(xy)$ em relacao a $x$:\n\n$$f_{yx} = \\cos(xy) + x\\,(-\\sin(xy))\\,y = \\cos(xy) - xy\\sin(xy)$$\n\nMais uma vez as mistas coincidem, como previa o teorema de Clairaut.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Derivando $f_x$ e $f_y$ novamente, obtemos quatro derivadas de segunda ordem: $f_{xx}$, $f_{yy}$, $f_{xy}$ e $f_{yx}$.\n- Em $f_{xy}$ deriva-se primeiro em $x$ e depois em $y$; a notacao de Leibniz $\\dfrac{\\partial^2 f}{\\partial y\\, \\partial x}$ diz o mesmo.\n- Pelo teorema de Clairaut, se as derivadas mistas sao continuas entao $f_{xy} = f_{yx}$.\n- O processo se estende naturalmente a derivadas de terceira ordem ou superiores.",
                    },
                ],
                questions: [
                    {
                        statement: "Seja $f(x, y) = x^3 y^2$. Qual e $f_{xx}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$6x y^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$3x^2 y^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$6x^2 y$",
                                isCorrect: false,
                            },
                            {
                                text: "$2x^3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ainda para $f(x, y) = x^3 y^2$, a derivada mista $f_{xy}$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$6x^2 y$",
                                isCorrect: true,
                            },
                            {
                                text: "$6x y^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$2x^3$",
                                isCorrect: false,
                            },
                            {
                                text: "$3x^2 y^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para $f(x, y) = x^2 y + \\sin y$, quanto vale $f_{xy}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2x$",
                                isCorrect: true,
                            },
                            {
                                text: "$2y$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^2 + \\cos y$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O teorema de Clairaut garante que $f_{xy} = f_{yx}$ desde que:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "as derivadas mistas sejam continuas em torno do ponto",
                                isCorrect: true,
                            },
                            {
                                text: "a funcao seja um polinomio de grau par",
                                isCorrect: false,
                            },
                            {
                                text: "as derivadas de primeira ordem sejam nulas",
                                isCorrect: false,
                            },
                            {
                                text: "a funcao dependa de uma unica variavel",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Seja $f(x, y) = e^{x} \\cos y$. Qual e $f_{yx}$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$-e^{x}\\sin y$",
                                isCorrect: true,
                            },
                            {
                                text: "$e^{x}\\cos y$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^{x}\\sin y$",
                                isCorrect: false,
                            },
                            {
                                text: "$-e^{x}\\cos y$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Diferenciabilidade e o plano tangente",
                blocks: [
                    {
                        type: "text",
                        value: "## Da reta tangente ao plano tangente\n\nNo calculo de uma variavel, uma funcao derivavel tem, em cada ponto, uma reta tangente que a aproxima bem por perto. Para funcoes de duas variaveis, o objeto que faz esse papel e o **plano tangente**: um plano que encosta na superficie $z = f(x, y)$ e a acompanha na vizinhanca do ponto de contato.",
                    },
                    {
                        type: "text",
                        value: "## Equacao do plano tangente\n\nSeja $z = f(x, y)$ uma funcao com derivadas parciais no ponto $(a, b)$. O plano tangente a superficie no ponto $(a, b, f(a, b))$ tem equacao\n\n$$z = f(a, b) + f_x(a, b)\\,(x - a) + f_y(a, b)\\,(y - b).$$\n\nA logica e natural: partimos da altura $f(a, b)$ e somamos as contribuicoes de cada direcao. O termo $f_x(a, b)(x - a)$ e a variacao prevista ao caminhar em $x$, e $f_y(a, b)(y - b)$ e a variacao prevista ao caminhar em $y$. Cada coeficiente angular vem da derivada parcial correspondente, coerente com a interpretacao geometrica das inclinacoes dos tracos.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: plano tangente ao paraboloide\n\nVamos achar o plano tangente a $f(x, y) = x^2 + y^2$ no ponto $(1, 1)$.\n\nPrimeiro os ingredientes:\n\n$$f(1, 1) = 2, \\qquad f_x = 2x \\Rightarrow f_x(1, 1) = 2, \\qquad f_y = 2y \\Rightarrow f_y(1, 1) = 2.$$\n\nSubstituindo na formula:\n\n$$z = 2 + 2(x - 1) + 2(y - 1).$$\n\nExpandindo, obtemos a forma simplificada:\n\n$$z = 2 + 2x - 2 + 2y - 2 = 2x + 2y - 2.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: uma superficie tipo sela\n\nConsidere $f(x, y) = x^2 - y^2$ no ponto $(2, 1)$.\n\n$$f(2, 1) = 4 - 1 = 3, \\qquad f_x = 2x \\Rightarrow f_x(2, 1) = 4, \\qquad f_y = -2y \\Rightarrow f_y(2, 1) = -2.$$\n\nO plano tangente e\n\n$$z = 3 + 4(x - 2) - 2(y - 1),$$\n\nque, simplificado, fica\n\n$$z = 4x - 2y - 3.$$",
                    },
                    {
                        type: "quote",
                        value: "O plano tangente e a melhor aproximacao plana de uma superficie: de perto, o mundo curvo parece reto.",
                    },
                    {
                        type: "text",
                        value: "## O que significa ser diferenciavel\n\nDizer que $f$ e **diferenciavel** em $(a, b)$ e dizer que o plano tangente realmente aproxima bem a superficie, com erro que desaparece mais rapido que a distancia ao ponto. Formalmente, a variacao\n\n$$\\Delta z = f(a + \\Delta x,\\, b + \\Delta y) - f(a, b)$$\n\npode ser escrita como\n\n$$\\Delta z = f_x(a, b)\\,\\Delta x + f_y(a, b)\\,\\Delta y + \\varepsilon_1 \\Delta x + \\varepsilon_2 \\Delta y,$$\n\nonde $\\varepsilon_1$ e $\\varepsilon_2$ tendem a zero quando $(\\Delta x, \\Delta y) \\to (0, 0)$.",
                    },
                    {
                        type: "text",
                        value: "## Um criterio pratico\n\nVerificar a definicao acima ponto a ponto seria trabalhoso. Felizmente, ha um resultado que resolve a maioria dos casos:\n\nSe as derivadas parciais $f_x$ e $f_y$ existem em uma vizinhanca de $(a, b)$ e sao continuas em $(a, b)$, entao $f$ e diferenciavel em $(a, b)$.\n\nVale um alerta importante: a simples existencia de $f_x$ e $f_y$ em um ponto nao garante diferenciabilidade. Existem funcoes cujas duas derivadas parciais existem na origem e que, mesmo assim, nao sao diferenciaveis ali. A continuidade das parciais e a hipotese que fecha a conta.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O plano tangente a $z = f(x, y)$ em $(a, b)$ e $z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$.\n- Os coeficientes angulares do plano sao as derivadas parciais avaliadas no ponto.\n- $f$ e diferenciavel em $(a, b)$ quando o plano tangente aproxima a superficie com erro que decai mais rapido que a distancia ao ponto.\n- Derivadas parciais continuas garantem diferenciabilidade; a mera existencia delas, nao.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O plano tangente a superficie $z = f(x, y)$ no ponto $(a, b)$ e dado por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$",
                                isCorrect: true,
                            },
                            {
                                text: "$z = f(a, b) + f_x(a, b)(x - a) - f_y(a, b)(y - b)$",
                                isCorrect: false,
                            },
                            {
                                text: "$z = f(a, b) + f_x(a, b)\\,x + f_y(a, b)\\,y$",
                                isCorrect: false,
                            },
                            {
                                text: "$z = f_x(a, b)(x - a) + f_y(a, b)(y - b)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x, y) = x^2 + y^2$, o plano tangente no ponto $(1, 1)$ e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$z = 2x + 2y - 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$z = 2x + 2y + 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$z = 2x + 2y$",
                                isCorrect: false,
                            },
                            {
                                text: "$z = x + y - 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O plano tangente a $f(x, y) = x^2 - y^2$ no ponto $(2, 1)$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$z = 4x - 2y - 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$z = 4x - 2y + 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$z = 4x + 2y - 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$z = 2x - 2y - 3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre diferenciabilidade de funcoes de duas variaveis, e correto afirmar que:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "derivadas parciais continuas em um ponto garantem diferenciabilidade ali",
                                isCorrect: true,
                            },
                            {
                                text: "a existencia das derivadas parciais ja garante diferenciabilidade",
                                isCorrect: false,
                            },
                            {
                                text: "toda funcao continua e automaticamente diferenciavel",
                                isCorrect: false,
                            },
                            {
                                text: "diferenciabilidade nao tem relacao com o plano tangente",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A superficie $z = f(x, y)$ tem plano tangente $z = 5 + 3(x - 1) - 4(y - 2)$ no ponto $(1, 2)$. Entao:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$f(1, 2) = 5$, $f_x(1, 2) = 3$ e $f_y(1, 2) = -4$",
                                isCorrect: true,
                            },
                            {
                                text: "$f(1, 2) = 5$, $f_x(1, 2) = -4$ e $f_y(1, 2) = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(1, 2) = 5$, $f_x(1, 2) = 1$ e $f_y(1, 2) = 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(1, 2) = 0$, $f_x(1, 2) = 3$ e $f_y(1, 2) = -4$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Aproximacao linear e diferencial",
                blocks: [
                    {
                        type: "text",
                        value: "## Trocar a superficie pelo plano\n\nSe o plano tangente acompanha bem a superficie perto do ponto de contato, podemos usa-lo para estimar valores de $f$ sem calcular a funcao exata. Essa e a ideia da **aproximacao linear**, uma das aplicacoes mais uteis das derivadas parciais.",
                    },
                    {
                        type: "text",
                        value: "## A linearizacao\n\nA funcao cujo grafico e o plano tangente em $(a, b)$ chama-se **linearizacao** de $f$ e e denotada por $L$:\n\n$$L(x, y) = f(a, b) + f_x(a, b)\\,(x - a) + f_y(a, b)\\,(y - b).$$\n\nPara pontos $(x, y)$ proximos de $(a, b)$, vale a aproximacao\n\n$$f(x, y) \\approx L(x, y).$$\n\nE a mesma expressao do plano tangente, agora usada como ferramenta de calculo aproximado.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: estimando um valor\n\nVamos estimar $f(3{,}02,\\ 3{,}99)$ para $f(x, y) = x^2 + y^2$, usando o ponto base $(3, 4)$.\n\nOs ingredientes no ponto base:\n\n$$f(3, 4) = 9 + 16 = 25, \\qquad f_x(3, 4) = 6, \\qquad f_y(3, 4) = 8.$$\n\nComo $x - a = 0{,}02$ e $y - b = -0{,}01$, a linearizacao da\n\n$$f(3{,}02,\\ 3{,}99) \\approx 25 + 6\\,(0{,}02) + 8\\,(-0{,}01) = 25 + 0{,}12 - 0{,}08 = 25{,}04.$$\n\nO valor exato e $25{,}0405$, entao a aproximacao erra apenas na quarta casa decimal.",
                    },
                    {
                        type: "text",
                        value: "## O diferencial total\n\nQuando trabalhamos com variacoes pequenas, e conveniente uma notacao propria. Chamamos de $dx$ e $dy$ os acrescimos (agora chamados **diferenciais**) das variaveis independentes. O **diferencial total** de $z = f(x, y)$ e\n\n$$dz = \\frac{\\partial f}{\\partial x}\\,dx + \\frac{\\partial f}{\\partial y}\\,dy = f_x\\,dx + f_y\\,dy.$$\n\nA variacao real $\\Delta z$ da funcao e aproximada pelo diferencial:\n\n$$\\Delta z \\approx dz.$$\n\nQuanto menores forem $dx$ e $dy$, melhor a aproximacao.",
                    },
                    {
                        type: "quote",
                        value: "O diferencial troca a variacao verdadeira, dificil de calcular, por uma soma linear de variacoes faceis. E a arte de linearizar o pequeno.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: propagacao de erro\n\nO diferencial e ideal para estimar como pequenos erros de medida afetam um resultado. Suponha um retangulo cujos lados sao medidos como $x = 30$ cm e $y = 24$ cm, cada um com erro possivel de ate $0{,}1$ cm.\n\nA area e $A = xy$, cujo diferencial e\n\n$$dA = \\frac{\\partial A}{\\partial x}\\,dx + \\frac{\\partial A}{\\partial y}\\,dy = y\\,dx + x\\,dy.$$\n\nUsando os valores medidos e $dx = dy = 0{,}1$:\n\n$$dA = 24\\,(0{,}1) + 30\\,(0{,}1) = 2{,}4 + 3{,}0 = 5{,}4 \\text{ cm}^2.$$\n\nOu seja, o erro na area calculada pode chegar a cerca de $5{,}4$ cm$^2$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: escrevendo um diferencial\n\nPara $f(x, y) = x^2 y$, as derivadas parciais sao $f_x = 2xy$ e $f_y = x^2$. Logo o diferencial total e\n\n$$dz = 2xy\\,dx + x^2\\,dy.$$\n\nEsse tipo de expressao resume, em uma linha, como a funcao responde a pequenas mudancas simultaneas em $x$ e em $y$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A linearizacao $L(x, y) = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$ aproxima $f$ perto de $(a, b)$.\n- O diferencial total e $dz = f_x\\,dx + f_y\\,dy$, e vale $\\Delta z \\approx dz$ para variacoes pequenas.\n- A aproximacao linear estima valores de funcoes sem calcula-las exatamente.\n- O diferencial e muito usado para estimar a propagacao de erros de medida.",
                    },
                ],
                questions: [
                    {
                        statement: "O diferencial total de $f(x, y) = x^2 y$ e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$dz = 2xy\\,dx + x^2\\,dy$",
                                isCorrect: true,
                            },
                            {
                                text: "$dz = x^2\\,dx + 2xy\\,dy$",
                                isCorrect: false,
                            },
                            {
                                text: "$dz = 2xy\\,dx + 2xy\\,dy$",
                                isCorrect: false,
                            },
                            {
                                text: "$dz = 2x\\,dx + x^2\\,dy$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A linearizacao de $f$ em torno do ponto $(a, b)$ e dada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$L = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$",
                                isCorrect: true,
                            },
                            {
                                text: "$L = f(a, b) + f_x(a, b)\\,dx + f_y(a, b)\\,dy$",
                                isCorrect: false,
                            },
                            {
                                text: "$L = f_x(a, b)(x - a) + f_y(a, b)(y - b)$",
                                isCorrect: false,
                            },
                            {
                                text: "$L = f(a, b) + f_x(a, b) + f_y(a, b)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Usando o diferencial, a estimativa de $f(3{,}02,\\ 3{,}99)$ para $f(x, y) = x^2 + y^2$ a partir de $(3, 4)$ e aproximadamente:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$25{,}04$",
                                isCorrect: true,
                            },
                            {
                                text: "$25{,}00$",
                                isCorrect: false,
                            },
                            {
                                text: "$25{,}40$",
                                isCorrect: false,
                            },
                            {
                                text: "$24{,}96$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um retangulo tem lados $x = 30$ e $y = 24$, cada um com erro de ate $0{,}1$. Usando $dA = y\\,dx + x\\,dy$, o erro estimado na area e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$5{,}4$",
                                isCorrect: true,
                            },
                            {
                                text: "$54$",
                                isCorrect: false,
                            },
                            {
                                text: "$2{,}7$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para $f(x, y) = \\dfrac{x}{y}$, o diferencial total e:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$dz = \\dfrac{1}{y}\\,dx - \\dfrac{x}{y^2}\\,dy$",
                                isCorrect: true,
                            },
                            {
                                text: "$dz = \\dfrac{1}{y}\\,dx + \\dfrac{x}{y^2}\\,dy$",
                                isCorrect: false,
                            },
                            {
                                text: "$dz = \\dfrac{1}{y}\\,dx - \\dfrac{1}{y^2}\\,dy$",
                                isCorrect: false,
                            },
                            {
                                text: "$dz = \\dfrac{x}{y}\\,dx - \\dfrac{x}{y^2}\\,dy$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Regra da cadeia, gradiente e derivada direcional",
        aulas: [
            {
                titulo: "A regra da cadeia",
                blocks: [
                    {
                        type: "text",
                        value: "## A regra da cadeia em várias variáveis\n\nNo cálculo de uma variável, a regra da cadeia diz como derivar uma composição de funções. Em várias variáveis existem várias versões dessa regra, uma para cada forma de encadear as dependências entre as grandezas. A ideia central continua a mesma: para saber como a saída varia, somamos as contribuições de cada caminho pelo qual a variação se propaga.\n\nVamos organizar os dois casos mais comuns e depois enunciar a versão geral.",
                    },
                    {
                        type: "text",
                        value: "## Caso 1: uma variável independente\n\nSuponha que $z = f(x, y)$ seja diferenciável e que $x = g(t)$ e $y = h(t)$ sejam funções deriváveis de $t$. Então $z$ é, no fim das contas, função só de $t$, e vale:\n\n$$\\frac{dz}{dt} = \\frac{\\partial z}{\\partial x} \\frac{dx}{dt} + \\frac{\\partial z}{\\partial y} \\frac{dy}{dt}$$\n\nNote a mistura de símbolos: usamos $\\partial$ para as derivadas de $z$ em relação a $x$ e $y$, pois $z$ depende de duas variáveis, e $d$ para as derivadas de $x$, $y$ e $z$ em relação a $t$, que são de uma variável só.",
                    },
                    {
                        type: "quote",
                        value: "A regra da cadeia é o que permite acompanhar como uma grandeza varia quando tudo de que ela depende também está mudando ao mesmo tempo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nSeja $z = x^2 y$, com $x = t^2$ e $y = t^3$. Vamos calcular $\\frac{dz}{dt}$.\n\n**Passo 1.** As derivadas parciais de $z$:\n\n$$\\frac{\\partial z}{\\partial x} = 2xy, \\qquad \\frac{\\partial z}{\\partial y} = x^2$$\n\n**Passo 2.** As derivadas de $x$ e $y$:\n\n$$\\frac{dx}{dt} = 2t, \\qquad \\frac{dy}{dt} = 3t^2$$\n\n**Passo 3.** Juntando na fórmula:\n\n$$\\frac{dz}{dt} = 2xy \\cdot 2t + x^2 \\cdot 3t^2$$\n\nSubstituindo $x = t^2$ e $y = t^3$:\n\n$$\\frac{dz}{dt} = 2t^5 \\cdot 2t + t^4 \\cdot 3t^2 = 4t^6 + 3t^6 = 7t^6$$\n\nConfira: como $z = (t^2)^2\\, t^3 = t^7$, temos $\\frac{dz}{dt} = 7t^6$, exatamente o mesmo resultado.",
                    },
                    {
                        type: "text",
                        value: "## Caso 2: duas variáveis independentes\n\nAgora suponha $z = f(x, y)$ com $x = g(s, t)$ e $y = h(s, t)$. Então $z$ depende de $s$ e de $t$, e temos uma fórmula para cada uma:\n\n$$\\frac{\\partial z}{\\partial s} = \\frac{\\partial z}{\\partial x} \\frac{\\partial x}{\\partial s} + \\frac{\\partial z}{\\partial y} \\frac{\\partial y}{\\partial s}$$\n\n$$\\frac{\\partial z}{\\partial t} = \\frac{\\partial z}{\\partial x} \\frac{\\partial x}{\\partial t} + \\frac{\\partial z}{\\partial y} \\frac{\\partial y}{\\partial t}$$\n\nPara achar a derivada em relação a uma variável independente, percorremos todos os caminhos do diagrama de árvore que ligam $z$ a essa variável, multiplicamos as derivadas ao longo de cada caminho e somamos.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nSeja $z = e^x \\sin y$, com $x = st^2$ e $y = s^2 t$. Vamos achar $\\frac{\\partial z}{\\partial s}$ e $\\frac{\\partial z}{\\partial t}$.\n\nAs parciais de $z$ são $\\frac{\\partial z}{\\partial x} = e^x \\sin y$ e $\\frac{\\partial z}{\\partial y} = e^x \\cos y$. As parciais dos intermediários:\n\n$$\\frac{\\partial x}{\\partial s} = t^2, \\quad \\frac{\\partial x}{\\partial t} = 2st, \\quad \\frac{\\partial y}{\\partial s} = 2st, \\quad \\frac{\\partial y}{\\partial t} = s^2$$\n\nLogo:\n\n$$\\frac{\\partial z}{\\partial s} = e^x \\sin y \\cdot t^2 + e^x \\cos y \\cdot 2st$$\n\n$$\\frac{\\partial z}{\\partial t} = e^x \\sin y \\cdot 2st + e^x \\cos y \\cdot s^2$$\n\nBasta lembrar que $x = st^2$ e $y = s^2 t$ para escrever tudo em função de $s$ e $t$.",
                    },
                    {
                        type: "text",
                        value: "## A versão geral\n\nSe $u$ é função diferenciável de $n$ variáveis $x_1, x_2, \\ldots, x_n$, e cada $x_j$ é função de $m$ variáveis $t_1, \\ldots, t_m$, então para cada índice $i$:\n\n$$\\frac{\\partial u}{\\partial t_i} = \\frac{\\partial u}{\\partial x_1} \\frac{\\partial x_1}{\\partial t_i} + \\frac{\\partial u}{\\partial x_2} \\frac{\\partial x_2}{\\partial t_i} + \\cdots + \\frac{\\partial u}{\\partial x_n} \\frac{\\partial x_n}{\\partial t_i}$$\n\nToda regra da cadeia é um caso particular desta. Conte quantas variáveis intermediárias existem, o que dá o número de parcelas, e quantas variáveis independentes existem, o que dá o número de fórmulas.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Com uma variável independente $t$: $\\frac{dz}{dt} = \\frac{\\partial z}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial z}{\\partial y}\\frac{dy}{dt}$.\n- Com várias variáveis independentes, há uma fórmula por variável, cada uma somando um termo por caminho.\n- Use $\\partial$ quando a função depende de mais de uma variável e $d$ quando depende de uma só.\n- Estratégia prática: desenhe o diagrama de árvore e some as contribuições de cada caminho.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Se $z = f(x, y)$ é diferenciável e $x = g(t)$, $y = h(t)$, qual expressão dá $\\frac{dz}{dt}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{\\partial z}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial z}{\\partial y}\\frac{dy}{dt}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\partial z}{\\partial x}\\frac{dy}{dt} + \\frac{\\partial z}{\\partial y}\\frac{dx}{dt}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\partial z}{\\partial x}\\frac{dx}{dt} - \\frac{\\partial z}{\\partial y}\\frac{dy}{dt}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\partial z}{\\partial x} + \\frac{dx}{dt} + \\frac{\\partial z}{\\partial y} + \\frac{dy}{dt}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $z = x^2 y$ com $x = t^2$ e $y = t^3$. Quanto vale $\\frac{dz}{dt}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$4t^6$",
                                isCorrect: false,
                            },
                            {
                                text: "$6t^5$",
                                isCorrect: false,
                            },
                            {
                                text: "$7t^6$",
                                isCorrect: true,
                            },
                            {
                                text: "$5t^6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $z = f(x, y)$ com $x = g(s, t)$ e $y = h(s, t)$, qual expressão dá $\\frac{\\partial z}{\\partial s}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial t} + \\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial t}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial s} + \\frac{\\partial z}{\\partial y}\\frac{\\partial x}{\\partial s}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\partial z}{\\partial s}\\frac{\\partial x}{\\partial s} + \\frac{\\partial z}{\\partial s}\\frac{\\partial y}{\\partial s}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial s} + \\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial s}$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $w = xy$ com $x = \\cos t$ e $y = \\sin t$. Qual o valor de $\\frac{dw}{dt}$ em $t = 0$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$-1$",
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
                            "Seja $z = f(x, y)$ com $x = r\\cos\\theta$ e $y = r\\sin\\theta$. Qual expressão dá $\\frac{\\partial z}{\\partial \\theta}$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{\\partial z}{\\partial x} \\cos\\theta + \\frac{\\partial z}{\\partial y} \\sin\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\partial z}{\\partial x} r\\cos\\theta + \\frac{\\partial z}{\\partial y} r\\sin\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{\\partial z}{\\partial x} r\\sin\\theta + \\frac{\\partial z}{\\partial y} r\\cos\\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$-\\frac{\\partial z}{\\partial x} r\\cos\\theta + \\frac{\\partial z}{\\partial y} r\\sin\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Derivação implícita",
                blocks: [
                    {
                        type: "text",
                        value: "## Funções definidas implicitamente\n\nMuitas curvas e superfícies aparecem como equações do tipo $F(x, y) = 0$ ou $F(x, y, z) = 0$, sem que uma variável esteja isolada. Ainda assim, sob condições adequadas, essas equações definem uma variável como função das outras. A regra da cadeia nos dá um jeito direto de derivar sem precisar isolar nada.",
                    },
                    {
                        type: "text",
                        value: "## O caso $F(x, y) = 0$\n\nSuponha que a equação $F(x, y) = 0$ defina $y$ como função derivável de $x$. Derivando os dois lados em relação a $x$ e usando a regra da cadeia, lembrando que $y$ depende de $x$:\n\n$$\\frac{\\partial F}{\\partial x} \\cdot 1 + \\frac{\\partial F}{\\partial y} \\cdot \\frac{dy}{dx} = 0$$\n\nIsolando a derivada, chegamos à fórmula da derivação implícita:\n\n$$\\frac{dy}{dx} = -\\frac{F_x}{F_y}, \\qquad \\text{desde que } F_y \\neq 0$$\n\nAqui $F_x$ e $F_y$ são as derivadas parciais de $F$. O sinal de menos é a parte que mais gera esquecimento.",
                    },
                    {
                        type: "quote",
                        value: "Nem toda relação entre variáveis se deixa escrever com y isolado, e é justamente aí que a derivação implícita mostra seu valor.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nConsidere a circunferência $x^2 + y^2 = 25$. Escrevendo $F(x, y) = x^2 + y^2 - 25$, temos:\n\n$$F_x = 2x, \\qquad F_y = 2y$$\n\nPortanto:\n\n$$\\frac{dy}{dx} = -\\frac{2x}{2y} = -\\frac{x}{y}$$\n\nPodemos conferir pela via explícita no ramo superior: $y = \\sqrt{25 - x^2}$ dá $\\frac{dy}{dx} = \\frac{-x}{\\sqrt{25 - x^2}} = -\\frac{x}{y}$, o mesmo resultado.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nO fólio de Descartes é a curva $x^3 + y^3 = 6xy$. Vamos achar $\\frac{dy}{dx}$.\n\nTomando $F(x, y) = x^3 + y^3 - 6xy$:\n\n$$F_x = 3x^2 - 6y, \\qquad F_y = 3y^2 - 6x$$\n\nAssim:\n\n$$\\frac{dy}{dx} = -\\frac{3x^2 - 6y}{3y^2 - 6x} = \\frac{2y - x^2}{y^2 - 2x}$$\n\nNa última passagem dividimos numerador e denominador por $3$ e usamos o sinal de menos para inverter os termos do numerador.",
                    },
                    {
                        type: "text",
                        value: "## O caso $F(x, y, z) = 0$\n\nSe a equação $F(x, y, z) = 0$ define $z$ como função de $x$ e $y$, o mesmo raciocínio, agora derivando em relação a $x$ com $y$ fixo, e depois em relação a $y$, leva a:\n\n$$\\frac{\\partial z}{\\partial x} = -\\frac{F_x}{F_z}, \\qquad \\frac{\\partial z}{\\partial y} = -\\frac{F_y}{F_z}$$\n\nsempre que $F_z \\neq 0$. O padrão é sempre o mesmo: menos a parcial em relação à variável desejada, dividida pela parcial em relação à variável que foi isolada.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3\n\nSeja $x^3 + y^3 + z^3 + 6xyz = 1$. Vamos achar $\\frac{\\partial z}{\\partial x}$.\n\nCom $F(x, y, z) = x^3 + y^3 + z^3 + 6xyz - 1$:\n\n$$F_x = 3x^2 + 6yz, \\qquad F_z = 3z^2 + 6xy$$\n\nLogo:\n\n$$\\frac{\\partial z}{\\partial x} = -\\frac{3x^2 + 6yz}{3z^2 + 6xy} = -\\frac{x^2 + 2yz}{z^2 + 2xy}$$\n\nDe modo análogo, $\\frac{\\partial z}{\\partial y} = -\\frac{y^2 + 2xz}{z^2 + 2xy}$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Para $F(x, y) = 0$: $\\frac{dy}{dx} = -\\frac{F_x}{F_y}$, com $F_y \\neq 0$.\n- Para $F(x, y, z) = 0$: $\\frac{\\partial z}{\\partial x} = -\\frac{F_x}{F_z}$ e $\\frac{\\partial z}{\\partial y} = -\\frac{F_y}{F_z}$.\n- O sinal de menos vem da regra da cadeia e nunca deve ser esquecido.\n- A vantagem é derivar sem isolar a variável, o que muitas vezes seria inviável.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Se $F(x, y) = 0$ define $y$ como função de $x$, qual é a fórmula para $\\frac{dy}{dx}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{F_x}{F_y}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{F_x}{F_y}$",
                                isCorrect: true,
                            },
                            {
                                text: "$-\\frac{F_y}{F_x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{F_y}{F_x}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para a curva $x^2 + y^2 = 25$, quanto vale $\\frac{dy}{dx}$ pela derivação implícita?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-\\frac{x}{y}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{x}{y}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{y}{x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{x^2}{y^2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para a curva $x^2 + xy + y^2 = 3$, qual é $\\frac{dy}{dx}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{2x + y}{x + 2y}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{x + 2y}{2x + y}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{2x + y}{2y}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{2x + y}{x + 2y}$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $F(x, y, z) = 0$ define $z$ como função de $x$ e $y$, qual expressão dá $\\frac{\\partial z}{\\partial x}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$-\\frac{F_x}{F_y}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{F_z}{F_x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\frac{F_x}{F_z}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{F_x}{F_z}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A equação $e^z = xyz$ define $z$ como função de $x$ e $y$. Quanto vale $\\frac{\\partial z}{\\partial x}$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{yz}{e^z - xy}$",
                                isCorrect: true,
                            },
                            {
                                text: "$-\\frac{yz}{e^z - xy}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{yz}{e^z}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{xy}{e^z - yz}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "A derivada direcional",
                blocks: [
                    {
                        type: "text",
                        value: "## Além das derivadas parciais\n\nAs derivadas parciais $f_x$ e $f_y$ medem a taxa de variação de $f$ quando andamos paralelamente aos eixos $x$ e $y$. Mas e se quisermos saber como $f$ varia ao caminhar em uma direção qualquer, digamos para o nordeste do plano? Para isso serve a derivada direcional.",
                    },
                    {
                        type: "text",
                        value: "## Definição\n\nA derivada direcional de $f$ no ponto $(x_0, y_0)$ na direção de um vetor unitário $\\vec{u} = \\langle a, b \\rangle$ é\n\n$$D_{\\vec{u}} f(x_0, y_0) = \\lim_{h \\to 0} \\frac{f(x_0 + ha, \\, y_0 + hb) - f(x_0, y_0)}{h}$$\n\nquando esse limite existe. Ela generaliza as parciais: tomando $\\vec{u} = \\langle 1, 0 \\rangle$ recuperamos $f_x$, e com $\\vec{u} = \\langle 0, 1 \\rangle$ recuperamos $f_y$.",
                    },
                    {
                        type: "text",
                        value: "## Fórmula prática\n\nSe $f$ é diferenciável, a derivada direcional se calcula sem limite algum:\n\n$$D_{\\vec{u}} f(x, y) = f_x(x, y)\\, a + f_y(x, y)\\, b$$\n\nonde $\\vec{u} = \\langle a, b \\rangle$ precisa ser um vetor **unitário**, isto é, $|\\vec{u}| = 1$. Este ponto é decisivo: se a direção vier dada por um vetor $\\vec{v}$ qualquer, primeiro normalize, tomando\n\n$$\\vec{u} = \\frac{\\vec{v}}{|\\vec{v}|}$$\n\nEsquecer de normalizar é o erro mais comum em todo o assunto.",
                    },
                    {
                        type: "quote",
                        value: "A derivada parcial responde como a função muda ao andar paralelo aos eixos; a derivada direcional responde o mesmo para qualquer rumo que você escolher.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nSeja $f(x, y) = x^2 y$. Vamos calcular a derivada direcional em $(1, 2)$ na direção do vetor $\\vec{v} = \\langle 3, 4 \\rangle$.\n\n**Passo 1. Normalizar.** Como $|\\vec{v}| = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$, o versor é $\\vec{u} = \\left\\langle \\frac{3}{5}, \\frac{4}{5} \\right\\rangle$.\n\n**Passo 2. Gradiente numérico.** Temos $f_x = 2xy$ e $f_y = x^2$. Em $(1, 2)$: $f_x = 4$ e $f_y = 1$.\n\n**Passo 3. Produto.**\n\n$$D_{\\vec{u}} f(1, 2) = 4 \\cdot \\frac{3}{5} + 1 \\cdot \\frac{4}{5} = \\frac{12 + 4}{5} = \\frac{16}{5}$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nSeja $f(x, y) = x e^{y}$, no ponto $(2, 0)$, na direção de $\\vec{v} = \\langle 1, 1 \\rangle$.\n\nNormalizando: $|\\vec{v}| = \\sqrt{2}$, logo $\\vec{u} = \\left\\langle \\frac{1}{\\sqrt{2}}, \\frac{1}{\\sqrt{2}} \\right\\rangle$.\n\nAs parciais são $f_x = e^y$ e $f_y = x e^y$. Em $(2, 0)$: $f_x = 1$ e $f_y = 2$. Então:\n\n$$D_{\\vec{u}} f(2, 0) = 1 \\cdot \\frac{1}{\\sqrt{2}} + 2 \\cdot \\frac{1}{\\sqrt{2}} = \\frac{3}{\\sqrt{2}} = \\frac{3\\sqrt{2}}{2}$$",
                    },
                    {
                        type: "text",
                        value: "## Direções por ângulo e mais variáveis\n\nQuando a direção é dada por um ângulo $\\theta$ medido a partir do eixo $x$ positivo, o versor já sai pronto: $\\vec{u} = \\langle \\cos\\theta, \\sin\\theta \\rangle$, que sempre tem módulo $1$.\n\nPara funções de três variáveis a ideia é a mesma. Com $\\vec{u} = \\langle a, b, c \\rangle$ unitário,\n\n$$D_{\\vec{u}} f = f_x\\, a + f_y\\, b + f_z\\, c$$\n\nNo próximo tema veremos que essa soma nada mais é do que um produto escalar com o vetor gradiente.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A derivada direcional mede a taxa de variação de $f$ em uma direção escolhida.\n- Fórmula: $D_{\\vec{u}} f = f_x a + f_y b$, com $\\vec{u} = \\langle a, b \\rangle$ unitário.\n- Sempre normalize a direção antes de usar: $\\vec{u} = \\vec{v} / |\\vec{v}|$.\n- Com direção por ângulo, $\\vec{u} = \\langle \\cos\\theta, \\sin\\theta \\rangle$ já é unitário.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Sendo $\\vec{u} = \\langle a, b \\rangle$ um vetor unitário, qual é a fórmula da derivada direcional $D_{\\vec{u}} f$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$f_x b + f_y a$",
                                isCorrect: false,
                            },
                            {
                                text: "$f_x a - f_y b$",
                                isCorrect: false,
                            },
                            {
                                text: "$f_x a + f_y b$",
                                isCorrect: true,
                            },
                            {
                                text: "$f_x + f_y$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o vetor unitário na direção de $\\vec{v} = \\langle 3, 4 \\rangle$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\langle 3, 4 \\rangle$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\left\\langle \\frac{3}{5}, \\frac{4}{5} \\right\\rangle$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\left\\langle \\frac{4}{5}, \\frac{3}{5} \\right\\rangle$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\left\\langle \\frac{3}{7}, \\frac{4}{7} \\right\\rangle$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x, y) = x^2 y$ em $(1, 2)$, com $f_x = 4$ e $f_y = 1$, qual a derivada direcional na direção de $\\vec{v} = \\langle 3, 4 \\rangle$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{16}{5}$",
                                isCorrect: true,
                            },
                            {
                                text: "$16$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{12}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{8}{5}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x, y) = x^2 + y^2$ em $(1, 2)$, qual a derivada direcional na direção de $\\vec{v} = \\langle 4, 3 \\rangle$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$20$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{14}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$8$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x, y, z) = xyz$ em $(1, 1, 1)$, qual a derivada direcional na direção de $\\vec{v} = \\langle 2, -1, 2 \\rangle$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{3}$",
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
                titulo: "O vetor gradiente",
                blocks: [
                    {
                        type: "text",
                        value: "## O vetor gradiente\n\nNa fórmula da derivada direcional, $D_{\\vec{u}} f = f_x a + f_y b$, o lado direito é o produto escalar de dois vetores: um que só depende do ponto, $\\langle f_x, f_y \\rangle$, e outro que é a direção, $\\langle a, b \\rangle$. O primeiro deles ganha nome e destaque: é o gradiente.",
                    },
                    {
                        type: "text",
                        value: "## Definição\n\nO gradiente de $f$ é o vetor formado pelas derivadas parciais:\n\n$$\\nabla f(x, y) = \\left\\langle \\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y} \\right\\rangle = \\frac{\\partial f}{\\partial x}\\vec{i} + \\frac{\\partial f}{\\partial y}\\vec{j}$$\n\nO símbolo $\\nabla$ se lê nabla. Para três variáveis, $\\nabla f = \\langle f_x, f_y, f_z \\rangle$. Com essa notação, a derivada direcional vira simplesmente\n\n$$D_{\\vec{u}} f = \\nabla f \\cdot \\vec{u}$$\n\no produto escalar do gradiente pelo versor da direção.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nSeja $f(x, y) = x^2 + y^2$. Então $\\nabla f = \\langle 2x, 2y \\rangle$. No ponto $(3, 4)$:\n\n$$\\nabla f(3, 4) = \\langle 6, 8 \\rangle$$\n\nSe quisermos a derivada direcional em $(3, 4)$ na direção de $\\vec{u} = \\left\\langle \\frac{3}{5}, \\frac{4}{5} \\right\\rangle$, basta o produto escalar:\n\n$$D_{\\vec{u}} f = \\langle 6, 8 \\rangle \\cdot \\left\\langle \\frac{3}{5}, \\frac{4}{5} \\right\\rangle = \\frac{18 + 32}{5} = 10$$",
                    },
                    {
                        type: "quote",
                        value: "O gradiente aponta sempre para onde a subida é mais íngreme, e seu comprimento diz o quanto essa subida é acentuada.",
                    },
                    {
                        type: "text",
                        value: "## A direção de maior crescimento\n\nEscrevendo o produto escalar em termos do ângulo $\\theta$ entre $\\nabla f$ e $\\vec{u}$:\n\n$$D_{\\vec{u}} f = \\nabla f \\cdot \\vec{u} = |\\nabla f|\\,|\\vec{u}|\\cos\\theta = |\\nabla f|\\cos\\theta$$\n\npois $|\\vec{u}| = 1$. Como $\\cos\\theta$ varia entre $-1$ e $1$, tiramos conclusões importantes:\n\n- O valor máximo de $D_{\\vec{u}} f$ é $|\\nabla f|$, atingido quando $\\theta = 0$, ou seja, quando $\\vec{u}$ aponta no sentido de $\\nabla f$. Essa é a direção de crescimento mais rápido.\n- O valor mínimo é $-|\\nabla f|$, na direção oposta $-\\nabla f$, que é a de decrescimento mais rápido.\n- Quando $\\vec{u}$ é perpendicular a $\\nabla f$, a derivada direcional é nula.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nEm que direção $f(x, y) = x^2 - xy + y^2$ cresce mais rápido no ponto $(1, -1)$, e qual é essa taxa máxima?\n\nAs parciais: $f_x = 2x - y$ e $f_y = -x + 2y$. Em $(1, -1)$:\n\n$$f_x = 2(1) - (-1) = 3, \\qquad f_y = -(1) + 2(-1) = -3$$\n\nLogo $\\nabla f(1, -1) = \\langle 3, -3 \\rangle$. A direção de maior crescimento é a desse vetor, e a taxa máxima é\n\n$$|\\nabla f| = \\sqrt{3^2 + (-3)^2} = \\sqrt{18} = 3\\sqrt{2}$$",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Gradiente: $\\nabla f = \\langle f_x, f_y \\rangle$, ou $\\langle f_x, f_y, f_z \\rangle$ em três variáveis.\n- Derivada direcional como produto escalar: $D_{\\vec{u}} f = \\nabla f \\cdot \\vec{u}$.\n- $f$ cresce mais rápido na direção de $\\nabla f$, e a taxa máxima é $|\\nabla f|$.\n- $f$ decresce mais rápido na direção de $-\\nabla f$; perpendicular a $\\nabla f$ a variação é zero.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a definição do vetor gradiente $\\nabla f$ de uma função $f(x, y)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\langle f_y, f_x \\rangle$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\langle f_x, -f_y \\rangle$",
                                isCorrect: false,
                            },
                            {
                                text: "$f_x + f_y$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\langle f_x, f_y \\rangle$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sendo $f(x, y) = x^2 + y^2$, quanto vale $\\nabla f$ no ponto $(3, 4)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\langle 6, 8 \\rangle$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\langle 3, 4 \\rangle$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\langle 8, 6 \\rangle$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\langle 9, 16 \\rangle$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A partir de um ponto, em qual direção a função $f$ cresce mais rapidamente?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "a direção de $-\\nabla f$",
                                isCorrect: false,
                            },
                            {
                                text: "uma direção perpendicular a $\\nabla f$",
                                isCorrect: false,
                            },
                            {
                                text: "a direção do próprio $\\nabla f$",
                                isCorrect: true,
                            },
                            {
                                text: "a direção em que $\\nabla f = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A taxa máxima de variação de $f$ em um ponto é igual a qual quantidade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-|\\nabla f|$",
                                isCorrect: false,
                            },
                            {
                                text: "$|\\nabla f|$",
                                isCorrect: true,
                            },
                            {
                                text: "$|\\nabla f|^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\nabla f$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a taxa máxima de variação de $f(x, y) = x^2 y$ no ponto $(2, 1)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$4\\sqrt{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$8$",
                                isCorrect: false,
                            },
                            {
                                text: "$16$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\langle 4, 4 \\rangle$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Gradiente e curvas de nível",
                blocks: [
                    {
                        type: "text",
                        value: "## Gradiente e curvas de nível\n\nAs curvas de nível de $f(x, y)$ são as curvas $f(x, y) = k$, ao longo das quais a função mantém valor constante. Existe uma relação geométrica elegante entre o gradiente e essas curvas, que também vale para superfícies de nível em três dimensões.",
                    },
                    {
                        type: "text",
                        value: "## O gradiente é perpendicular às curvas de nível\n\n**Teorema.** Em cada ponto, o vetor $\\nabla f(x_0, y_0)$ é perpendicular à curva de nível de $f$ que passa por $(x_0, y_0)$.\n\nA razão é direta. Ao caminhar sobre uma curva de nível, $f$ não muda, então a taxa de variação na direção tangente $\\vec{u}$ à curva é nula:\n\n$$D_{\\vec{u}} f = \\nabla f \\cdot \\vec{u} = 0$$\n\nUm produto escalar nulo significa que $\\nabla f$ é perpendicular à direção tangente, ou seja, perpendicular à curva de nível. O gradiente sempre cruza os níveis de forma ortogonal, apontando para os valores maiores de $f$.",
                    },
                    {
                        type: "quote",
                        value: "Sobre uma curva de nível a função não muda, então o gradiente, que mede a variação, só pode apontar para fora dela, cruzando-a de forma perpendicular.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nSeja $f(x, y) = x^2 + y^2$, cujas curvas de nível são circunferências centradas na origem. No ponto $(3, 4)$, temos $\\nabla f = \\langle 6, 8 \\rangle$.\n\nEsse vetor tem a mesma direção do raio que liga a origem a $(3, 4)$, e o raio é sempre perpendicular à circunferência. Ou seja, o gradiente aponta radialmente para fora, exatamente como o teorema prevê.",
                    },
                    {
                        type: "text",
                        value: "## Reta tangente a uma curva de nível\n\nComo $\\nabla f$ é normal à curva de nível, ele serve de vetor normal para escrever a reta tangente. A reta tangente à curva $f(x, y) = k$ em $(x_0, y_0)$ satisfaz\n\n$$\\nabla f(x_0, y_0) \\cdot \\langle x - x_0, \\, y - y_0 \\rangle = 0$$\n\n**Exemplo.** Para $x^2 + xy + y^2 = 3$ em $(1, 1)$: $\\nabla f = \\langle 2x + y, \\, x + 2y \\rangle = \\langle 3, 3 \\rangle$. A reta tangente é\n\n$$3(x - 1) + 3(y - 1) = 0 \\ \\Longrightarrow \\ x + y = 2$$",
                    },
                    {
                        type: "text",
                        value: "## Plano tangente a uma superfície de nível\n\nEm três variáveis, $\\nabla F(x_0, y_0, z_0)$ é normal à superfície de nível $F(x, y, z) = k$. Isso dá de imediato a equação do plano tangente:\n\n$$F_x(x - x_0) + F_y(y - y_0) + F_z(z - z_0) = 0$$\n\ncom as parciais avaliadas no ponto. A reta normal à superfície nesse ponto tem a direção de $\\nabla F$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nVamos achar o plano tangente à esfera $x^2 + y^2 + z^2 = 9$ no ponto $(2, 1, 2)$, notando que $4 + 1 + 4 = 9$.\n\nCom $F(x, y, z) = x^2 + y^2 + z^2$, temos $\\nabla F = \\langle 2x, 2y, 2z \\rangle$, que em $(2, 1, 2)$ vale $\\langle 4, 2, 4 \\rangle$. O plano tangente é\n\n$$4(x - 2) + 2(y - 1) + 4(z - 2) = 0$$\n\nSimplificando, $4x + 2y + 4z = 18$, ou seja, $2x + y + 2z = 9$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O gradiente é perpendicular às curvas de nível e às superfícies de nível.\n- Isso decorre de $\\nabla f \\cdot \\vec{u} = 0$ para $\\vec{u}$ tangente ao nível.\n- Reta tangente à curva $f = k$: $\\nabla f(x_0, y_0) \\cdot \\langle x - x_0, y - y_0 \\rangle = 0$.\n- Plano tangente à superfície $F = k$: $F_x(x - x_0) + F_y(y - y_0) + F_z(z - z_0) = 0$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Em relação à curva de nível que passa por um ponto, o vetor $\\nabla f$ nesse ponto é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "perpendicular a ela",
                                isCorrect: true,
                            },
                            {
                                text: "tangente a ela",
                                isCorrect: false,
                            },
                            {
                                text: "paralelo a ela",
                                isCorrect: false,
                            },
                            {
                                text: "inclinado a 45 graus",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x, y) = x^2 + y^2$ em $(1, 2)$, o gradiente é $\\langle 2, 4 \\rangle$. Qual vetor é tangente à curva de nível nesse ponto?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\langle 2, 4 \\rangle$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\langle 4, 2 \\rangle$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\langle 2, -4 \\rangle$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\langle -4, 2 \\rangle$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual equação representa o plano tangente à superfície $F(x, y, z) = k$ no ponto $(x_0, y_0, z_0)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$F_x(x - x_0) + F_y(y - y_0) + F_z(z - z_0) = k$",
                                isCorrect: false,
                            },
                            {
                                text: "$F_x(x - x_0) + F_y(y - y_0) + F_z(z - z_0) = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$F_x\\, x_0 + F_y\\, y_0 + F_z\\, z_0 = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x - x_0) + (y - y_0) + (z - z_0) = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a reta tangente à curva $x^2 + xy + y^2 = 3$ no ponto $(1, 1)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$3x + 3y = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x - y = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x + y = 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$x + y = 3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o plano tangente à esfera $x^2 + y^2 + z^2 = 9$ no ponto $(2, 1, 2)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$4x + 2y + 4z = 9$",
                                isCorrect: false,
                            },
                            {
                                text: "$2x + y + 2z = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x + y + z = 9$",
                                isCorrect: false,
                            },
                            {
                                text: "$2x + y + 2z = 9$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Máximos e mínimos",
        aulas: [
            {
                titulo: "Pontos críticos",
                blocks: [
                    {
                        type: "text",
                        value: "# Pontos críticos\n\nNo cálculo de uma variável, procuramos máximos e mínimos onde a derivada se anula. Em várias variáveis a ideia é a mesma, mas agora quem faz esse papel é o **gradiente**.\n\nDizemos que $(a, b)$ é um **ponto crítico** de $f(x, y)$ quando as duas derivadas parciais se anulam ao mesmo tempo, ou quando alguma delas não existe. No caso diferenciável, isso equivale a\n\n$$\\nabla f(a, b) = \\left(f_x(a, b),\\, f_y(a, b)\\right) = (0, 0)$$\n\nGeometricamente, num ponto crítico o plano tangente ao gráfico de $f$ é horizontal.",
                    },
                    {
                        type: "text",
                        value: "## Por que o gradiente se anula\n\nSe $f$ tem um máximo ou mínimo local em $(a, b)$ e é diferenciável ali, então esse ponto também é extremo de cada função de uma variável obtida fixando $x = a$ ou $y = b$. Pelo teorema de Fermat aplicado a cada uma delas,\n\n$$f_x(a, b) = 0 \\qquad \\text{e} \\qquad f_y(a, b) = 0$$\n\nEsse é o análogo, em várias variáveis, da condição $f'(x) = 0$. Todo extremo local no interior do domínio é ponto crítico, mas a recíproca é falsa: existem pontos críticos que não são nem máximo nem mínimo.",
                    },
                    {
                        type: "text",
                        value: "## Três possibilidades\n\nNum ponto crítico, o comportamento de $f$ pode ser de três tipos:\n\n- **Máximo local**: $f(a, b) \\ge f(x, y)$ para todo $(x, y)$ perto de $(a, b)$.\n- **Mínimo local**: $f(a, b) \\le f(x, y)$ para todo $(x, y)$ perto de $(a, b)$.\n- **Ponto de sela**: em certas direções o ponto parece mínimo e em outras parece máximo, logo não é extremo.\n\nAchar o ponto crítico é só o primeiro passo. Decidir em qual dos três casos ele se encaixa é tarefa do teste da segunda derivada, no próximo tópico.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: um mínimo claro\n\nConsidere $f(x, y) = x^2 + y^2$. As parciais são\n\n$$f_x = 2x, \\qquad f_y = 2y$$\n\nIgualando a zero, $2x = 0$ e $2y = 0$, logo o único ponto crítico é $(0, 0)$.\n\nComo $x^2 + y^2 \\ge 0$ e vale zero só na origem, $(0, 0)$ é um mínimo, na verdade global. O gráfico é um paraboloide com a boca para cima, e a origem é o fundo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: dois pontos críticos\n\nSeja $f(x, y) = x^3 + y^3 - 3xy$. Calculamos\n\n$$f_x = 3x^2 - 3y, \\qquad f_y = 3y^2 - 3x$$\n\nDe $f_x = 0$ vem $y = x^2$. Substituindo em $f_y = 0$:\n\n$$3(x^2)^2 - 3x = 3x^4 - 3x = 3x(x^3 - 1) = 0$$\n\nAssim $x = 0$ ou $x = 1$. Para $x = 0$ temos $y = 0$; para $x = 1$ temos $y = 1$. Os pontos críticos são $(0, 0)$ e $(1, 1)$. Ainda não sabemos a natureza de cada um, e voltaremos a esse exemplo com a Hessiana.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: uma sela\n\nPara $f(x, y) = x^2 - y^2$, temos $f_x = 2x$ e $f_y = -2y$, então o único ponto crítico é $(0, 0)$. Mas ele não é extremo: ao caminhar na direção do eixo $x$ a função cresce, como $x^2$, e na direção do eixo $y$ ela decresce, como $-y^2$. Esse é o exemplo canônico de ponto de sela, cujo gráfico lembra uma sela de cavalo.",
                    },
                    {
                        type: "quote",
                        value: "Encontrar os pontos críticos é resolver um sistema; classificá-los é entender a geometria em volta de cada solução.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Ponto crítico: onde $\\nabla f = 0$, ou onde alguma parcial não existe.\n- Todo máximo ou mínimo local interior é ponto crítico, mas nem todo ponto crítico é extremo.\n- As três naturezas possíveis são máximo local, mínimo local e ponto de sela.\n- Achar os pontos críticos costuma recair em resolver o sistema $f_x = 0$, $f_y = 0$.",
                    },
                ],
                questions: [
                    {
                        statement: "Um ponto crítico de uma função diferenciável $f(x, y)$ ocorre:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "onde $f_x = 0$ e $f_y = 0$ ao mesmo tempo",
                                isCorrect: true,
                            },
                            {
                                text: "onde $f_x = 0$ ou $f_y = 0$, bastando uma delas",
                                isCorrect: false,
                            },
                            {
                                text: "onde $f_{xx} = 0$ e $f_{yy} = 0$ ao mesmo tempo",
                                isCorrect: false,
                            },
                            {
                                text: "onde a função atinge seu maior valor global",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O ponto crítico de $f(x, y) = x^2 + y^2 - 4x + 6y$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(2, -3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(-2, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(4, -6)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 3)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Os pontos críticos de $f(x, y) = x^3 + y^3 - 3xy$ são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(0, 0)$ e $(1, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(0, 0)$ e $(-1, -1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 1)$ e $(-1, -1)$",
                                isCorrect: false,
                            },
                            {
                                text: "apenas $(0, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Sobre pontos críticos, é correto afirmar que:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "um ponto crítico pode ser máximo, mínimo ou sela",
                                isCorrect: true,
                            },
                            {
                                text: "todo ponto crítico é necessariamente um extremo local",
                                isCorrect: false,
                            },
                            {
                                text: "um ponto de sela nunca é um ponto crítico",
                                isCorrect: false,
                            },
                            {
                                text: "pontos críticos só existem em funções de uma variável",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quantos pontos críticos tem $f(x, y) = x^3 - 12x + y^3 - 3y$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$4$",
                                isCorrect: true,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
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
                titulo: "O teste da segunda derivada (Hessiana)",
                blocks: [
                    {
                        type: "text",
                        value: "# O teste da segunda derivada (Hessiana)\n\nJá sabemos achar os pontos críticos resolvendo $\\nabla f = 0$. Falta decidir se cada um é máximo, mínimo ou sela. Em uma variável, o sinal de $f''$ resolvia: $f'' > 0$ indica concavidade para cima, um mínimo, e $f'' < 0$, concavidade para baixo, um máximo. Em duas variáveis precisamos combinar as segundas parciais, e o objeto que faz isso é a matriz Hessiana.",
                    },
                    {
                        type: "text",
                        value: "## A Hessiana e o discriminante\n\nA **matriz Hessiana** reúne as segundas derivadas parciais:\n\n$$H = \\begin{pmatrix} f_{xx} & f_{xy} \\\\ f_{yx} & f_{yy} \\end{pmatrix}$$\n\nComo em geral $f_{xy} = f_{yx}$ para funções suaves, o que interessa é o determinante dela, chamado **discriminante**:\n\n$$D = f_{xx}\\, f_{yy} - (f_{xy})^2$$\n\nOs sinais de $D$ e de $f_{xx}$, avaliados no ponto crítico, dizem tudo.",
                    },
                    {
                        type: "text",
                        value: "## A regra do teste\n\nAvalie $D$ e $f_{xx}$ no ponto crítico $(a, b)$ e use a tabela:\n\n| Condição | Classificação |\n|---|---|\n| $D > 0$ e $f_{xx} > 0$ | Mínimo local |\n| $D > 0$ e $f_{xx} < 0$ | Máximo local |\n| $D < 0$ | Ponto de sela |\n| $D = 0$ | Teste inconclusivo |\n\nQuando $D > 0$, o sinal de $f_{yy}$ coincide com o de $f_{xx}$, então tanto faz olhar um ou outro. Se $D < 0$, é sela, sem precisar de mais nada. E se $D = 0$, o teste não decide, e é preciso analisar a função na mão.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: confirmando um mínimo\n\nPara $f(x, y) = x^2 + y^2$, as segundas parciais são constantes: $f_{xx} = 2$, $f_{yy} = 2$ e $f_{xy} = 0$. No ponto crítico $(0, 0)$,\n\n$$D = (2)(2) - 0^2 = 4 > 0, \\qquad f_{xx} = 2 > 0$$\n\nLogo $(0, 0)$ é mínimo local, como já esperávamos.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: sela e mínimo juntos\n\nRetomando $f(x, y) = x^3 + y^3 - 3xy$, temos\n\n$$f_{xx} = 6x, \\qquad f_{yy} = 6y, \\qquad f_{xy} = -3$$\n\ne portanto $D = 36xy - 9$.\n\nNo ponto $(0, 0)$: $D = 36(0)(0) - 9 = -9 < 0$, logo ponto de sela.\n\nNo ponto $(1, 1)$: $D = 36(1)(1) - 9 = 27 > 0$ e $f_{xx} = 6 > 0$, logo mínimo local.\n\nUm mesmo problema pode ter pontos críticos de naturezas diferentes.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: um máximo\n\nSeja $f(x, y) = 2x + 4y - x^2 - y^2$. De $f_x = 2 - 2x = 0$ e $f_y = 4 - 2y = 0$ vem o ponto crítico $(1, 2)$. As segundas parciais são $f_{xx} = -2$, $f_{yy} = -2$ e $f_{xy} = 0$, então\n\n$$D = (-2)(-2) - 0 = 4 > 0, \\qquad f_{xx} = -2 < 0$$\n\nComo $D > 0$ e $f_{xx} < 0$, o ponto $(1, 2)$ é máximo local.",
                    },
                    {
                        type: "text",
                        value: "## O caso $D = 0$\n\nQuando $D = 0$ o teste falha, e funções bem diferentes podem compartilhar esse valor. Por exemplo, $f(x, y) = x^4 + y^4$ tem mínimo na origem, enquanto $g(x, y) = x^3 + y^3$ tem uma sela ali, e ambas dão $D = 0$ em $(0, 0)$. Nesses casos, volte à definição e estude o sinal de $f$ perto do ponto.",
                    },
                    {
                        type: "quote",
                        value: "O discriminante é um atalho poderoso, mas quando ele zera não há atalho: só a análise direta resolve.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Hessiana: matriz das segundas parciais; seu determinante é $D = f_{xx} f_{yy} - (f_{xy})^2$.\n- $D > 0$ e $f_{xx} > 0$: mínimo; $D > 0$ e $f_{xx} < 0$: máximo.\n- $D < 0$: ponto de sela.\n- $D = 0$: teste inconclusivo, exige análise direta.",
                    },
                ],
                questions: [
                    {
                        statement: "O discriminante do teste da segunda derivada é dado por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$D = f_{xx} f_{yy} - (f_{xy})^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$D = f_{xx} f_{yy} + (f_{xy})^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$D = f_{xx} + f_{yy} - f_{xy}$",
                                isCorrect: false,
                            },
                            {
                                text: "$D = (f_{xx})^2 - f_{yy} f_{xy}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Num ponto crítico com $D > 0$ e $f_{xx} > 0$, tem-se:",
                        difficulty: "facil",
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
                                text: "ponto de sela",
                                isCorrect: false,
                            },
                            {
                                text: "teste inconclusivo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Num ponto crítico, $f_{xx} = 3$, $f_{yy} = 5$ e $f_{xy} = 4$. A classificação é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "ponto de sela, pois $D < 0$",
                                isCorrect: true,
                            },
                            {
                                text: "mínimo local, pois $f_{xx} > 0$",
                                isCorrect: false,
                            },
                            {
                                text: "máximo local, pois $D > 0$",
                                isCorrect: false,
                            },
                            {
                                text: "teste inconclusivo, pois $D = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para $f(x, y) = x^3 + y^3 - 3xy$, o ponto crítico $(1, 1)$ é:",
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
                                text: "ponto de sela",
                                isCorrect: false,
                            },
                            {
                                text: "teste inconclusivo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Num ponto crítico, $f_{xx} = -4$, $f_{yy} = -1$ e $f_{xy} = 2$. Então:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "o teste é inconclusivo",
                                isCorrect: true,
                            },
                            {
                                text: "é máximo local, pois $f_{xx} < 0$",
                                isCorrect: false,
                            },
                            {
                                text: "é mínimo local, pois $D > 0$",
                                isCorrect: false,
                            },
                            {
                                text: "é ponto de sela, pois $D < 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Máximos e mínimos absolutos em regiões",
                blocks: [
                    {
                        type: "text",
                        value: "# Máximos e mínimos absolutos em regiões\n\nUm **máximo absoluto** de $f$ numa região $R$ é o maior valor que $f$ assume em todo $R$; o **mínimo absoluto**, o menor. O teorema do valor extremo, de Weierstrass, garante que, se $f$ é contínua e $R$ é fechada e limitada, então esses dois valores existem e são atingidos em algum ponto de $R$.\n\nFechada quer dizer que a região inclui sua fronteira; limitada, que ela cabe dentro de algum disco. Sem essas hipóteses, o máximo ou o mínimo podem simplesmente não existir.",
                    },
                    {
                        type: "text",
                        value: "## O roteiro\n\nPara achar os extremos absolutos de $f$ contínua numa região fechada e limitada $R$:\n\n1. Ache os **pontos críticos** de $f$ no interior de $R$ e calcule $f$ neles.\n2. Ache os **valores extremos de $f$ na fronteira** de $R$.\n3. Compare todos os números obtidos: o maior é o máximo absoluto e o menor é o mínimo absoluto.\n\nRepare que na etapa 1 não é preciso classificar os pontos críticos com a Hessiana. Basta calcular o valor de $f$ em cada um e jogá-lo na comparação final.",
                    },
                    {
                        type: "text",
                        value: "## Lidando com a fronteira\n\nA fronteira costuma ser descrita por pedaços. Em cada pedaço, substituímos a equação da curva na função e caímos num problema de uma variável, que resolvemos com a derivada usual. Não esqueça de incluir os **vértices**, ou seja os extremos de cada pedaço, na lista de candidatos, pois o extremo pode ocorrer num canto.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: um retângulo\n\nVamos achar os extremos absolutos de $f(x, y) = x^2 - 2xy + 2y$ no retângulo $R$ dado por $0 \\le x \\le 3$ e $0 \\le y \\le 2$.\n\n**Interior.** De $f_x = 2x - 2y = 0$ e $f_y = -2x + 2 = 0$ vem $x = 1$ e $y = 1$. O ponto $(1, 1)$ está dentro de $R$, e\n\n$$f(1, 1) = 1 - 2 + 2 = 1$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: a fronteira\n\nPercorremos os quatro lados do retângulo:\n\n- $y = 0$, com $0 \\le x \\le 3$: $f = x^2$, que varia de $0$, em $x = 0$, até $9$, em $x = 3$.\n- $x = 3$, com $0 \\le y \\le 2$: $f = 9 - 4y$, que vai de $9$, em $y = 0$, até $1$, em $y = 2$.\n- $y = 2$, com $0 \\le x \\le 3$: $f = x^2 - 4x + 4 = (x - 2)^2$, que varia de $0$, em $x = 2$, até $4$, em $x = 0$.\n- $x = 0$, com $0 \\le y \\le 2$: $f = 2y$, que vai de $0$ até $4$.\n\nOs candidatos vindos da fronteira incluem os valores $0$, $1$, $4$ e $9$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: a comparação\n\nJuntando tudo, os valores candidatos são $f(1, 1) = 1$ no interior e, na fronteira, valores entre $0$ e $9$. O maior de todos é $9$, atingido em $(3, 0)$, e o menor é $0$, atingido em $(0, 0)$ e também em $(2, 2)$. Portanto,\n\n$$\\text{máximo absoluto} = 9, \\qquad \\text{mínimo absoluto} = 0$$",
                    },
                    {
                        type: "quote",
                        value: "Numa região fechada, o extremo se esconde em um de dois lugares: num ponto crítico do interior ou em algum ponto da fronteira.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Se $f$ é contínua e $R$ é fechada e limitada, o máximo e o mínimo absolutos existem.\n- Roteiro: pontos críticos do interior, depois extremos na fronteira, depois comparar os valores.\n- Na fronteira, reduza a uma variável e inclua os vértices.\n- Não é preciso classificar os pontos críticos do interior; só avaliar $f$ neles.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O teorema do valor extremo garante máximo e mínimo absolutos quando $f$ é contínua e a região é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "fechada e limitada",
                                isCorrect: true,
                            },
                            {
                                text: "aberta e limitada",
                                isCorrect: false,
                            },
                            {
                                text: "fechada e ilimitada",
                                isCorrect: false,
                            },
                            {
                                text: "aberta e ilimitada",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para achar os extremos absolutos numa região fechada e limitada, deve-se analisar:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "os pontos críticos e a fronteira",
                                isCorrect: true,
                            },
                            {
                                text: "apenas os pontos críticos do interior",
                                isCorrect: false,
                            },
                            {
                                text: "apenas os vértices da fronteira",
                                isCorrect: false,
                            },
                            {
                                text: "apenas o centro da região",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na aresta $y = 0$, com $0 \\le x \\le 3$, a função $f(x, y) = x^2 - 2xy + 2y$ vira $g(x) = x^2$. Seu valor máximo nessa aresta é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$9$, em $x = 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$0$, em $x = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$, em $x = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$, em $x = 3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Comparando os candidatos de $f$ numa região, obteve-se $f = 1$ no interior e $f = 9$ e $f = 0$ na fronteira. O máximo e o mínimo absolutos são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "máximo $9$ e mínimo $0$",
                                isCorrect: true,
                            },
                            {
                                text: "máximo $1$ e mínimo $0$",
                                isCorrect: false,
                            },
                            {
                                text: "máximo $9$ e mínimo $1$",
                                isCorrect: false,
                            },
                            {
                                text: "máximo $0$ e mínimo $9$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O valor máximo absoluto de $f(x, y) = 2 + 2x + 2y - x^2 - y^2$ no triângulo de vértices $(0, 0)$, $(9, 0)$ e $(0, 9)$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$4$, no ponto $(1, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$2$, no ponto $(0, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$9$, no ponto $(9, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$, no ponto $(0, 9)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Multiplicadores de Lagrange",
                blocks: [
                    {
                        type: "text",
                        value: "# Multiplicadores de Lagrange\n\nMuitos problemas pedem para otimizar $f(x, y)$ não em todo o plano, mas apenas sobre os pontos que satisfazem uma **restrição** $g(x, y) = k$. Um exemplo típico é maximizar uma área sujeita a um perímetro fixo. O método dos **multiplicadores de Lagrange** resolve exatamente esse tipo de problema, sem precisar isolar uma variável na restrição.",
                    },
                    {
                        type: "text",
                        value: "## A condição de Lagrange\n\nNo ponto de máximo ou mínimo de $f$ sobre a curva $g(x, y) = k$, os gradientes de $f$ e de $g$ são **paralelos**. Ou seja, existe um número $\\lambda$, o multiplicador, tal que\n\n$$\\nabla f = \\lambda\\, \\nabla g$$\n\nEm coordenadas, isso gera o sistema\n\n$$f_x = \\lambda\\, g_x, \\qquad f_y = \\lambda\\, g_y, \\qquad g(x, y) = k$$\n\nSão três equações e três incógnitas: $x$, $y$ e $\\lambda$. Resolvido o sistema, comparamos $f$ nos pontos encontrados para saber quais são máximos e quais são mínimos.",
                    },
                    {
                        type: "text",
                        value: "## Por que os gradientes se alinham\n\nAo caminhar sobre a curva $g = k$, procuramos o instante em que $f$ para de crescer. Isso acontece quando a curva é tangente a uma curva de nível de $f$. Como o gradiente é sempre perpendicular às curvas de nível, no ponto de tangência $\\nabla f$ e $\\nabla g$ apontam na mesma direção, a menos de escala, e é justamente essa escala que $\\lambda$ mede.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: maior produto\n\nMaximizar $f(x, y) = xy$ sujeito a $x + y = 10$. Aqui $g(x, y) = x + y$, com $\\nabla g = (1, 1)$. A condição $\\nabla f = \\lambda \\nabla g$ dá\n\n$$y = \\lambda, \\qquad x = \\lambda$$\n\nportanto $x = y$. Levando na restrição, $x + x = 10$, ou seja $x = 5$ e $y = 5$. O valor máximo é $f(5, 5) = 25$. É a tradução do fato de que, com soma fixa, o produto é máximo quando as parcelas são iguais.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: extremos sobre um círculo\n\nOtimizar $f(x, y) = x + y$ sobre o círculo $x^2 + y^2 = 1$. Com $g(x, y) = x^2 + y^2$, temos $\\nabla g = (2x, 2y)$, e a condição de Lagrange fica\n\n$$1 = 2\\lambda x, \\qquad 1 = 2\\lambda y$$\n\nDividindo uma equação pela outra, $x = y$. Na restrição, $2x^2 = 1$, então $x = \\pm \\frac{1}{\\sqrt{2}}$.\n\nNo ponto $\\left(\\frac{1}{\\sqrt{2}}, \\frac{1}{\\sqrt{2}}\\right)$ temos $f = \\sqrt{2}$, o máximo; no ponto oposto, $f = -\\sqrt{2}$, o mínimo.",
                    },
                    {
                        type: "text",
                        value: "## Comparando os candidatos\n\nLagrange entrega os candidatos a extremo, mas não diz sozinho qual é máximo e qual é mínimo. Numa restrição fechada e limitada, como um círculo, basta avaliar $f$ em cada candidato: o maior valor é o máximo e o menor é o mínimo. Não usamos a Hessiana aqui, pois o teste do discriminante $D$ vale para extremos livres, não para os condicionados.",
                    },
                    {
                        type: "quote",
                        value: "Lagrange troca a dificuldade de isolar uma variável pela elegância de alinhar dois gradientes.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Para otimizar $f$ sob $g = k$, resolva $\\nabla f = \\lambda \\nabla g$ junto com a restrição.\n- Em coordenadas: $f_x = \\lambda g_x$, $f_y = \\lambda g_y$ e $g(x, y) = k$.\n- Geometricamente, no extremo a curva de nível de $f$ tangencia a curva da restrição.\n- Compare $f$ nos pontos achados para separar máximos de mínimos.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O método dos multiplicadores de Lagrange para otimizar $f$ sob a restrição $g = k$ usa a condição:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\nabla f = \\lambda \\nabla g$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\nabla f = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\nabla f = \\nabla g$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\nabla f + \\nabla g = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No método de Lagrange, além de $\\nabla f = \\lambda \\nabla g$, o sistema inclui:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "a restrição $g(x, y) = k$",
                                isCorrect: true,
                            },
                            {
                                text: "a condição $f_{xx} > 0$",
                                isCorrect: false,
                            },
                            {
                                text: "o discriminante $D > 0$",
                                isCorrect: false,
                            },
                            {
                                text: "a segunda derivada de $g(x, y)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O máximo de $f(x, y) = xy$ sob a restrição $x + y = 10$ ocorre em:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(5, 5)$, com valor $25$",
                                isCorrect: true,
                            },
                            {
                                text: "$(10, 0)$, com valor $0$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 8)$, com valor $16$",
                                isCorrect: false,
                            },
                            {
                                text: "$(4, 6)$, com valor $24$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Os valores extremos de $f(x, y) = x + y$ sobre o círculo $x^2 + y^2 = 2$ são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "máximo $2$ e mínimo $-2$",
                                isCorrect: true,
                            },
                            {
                                text: "máximo $1$ e mínimo $-1$",
                                isCorrect: false,
                            },
                            {
                                text: "máximo $\\sqrt{2}$ e mínimo $-\\sqrt{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "máximo $4$ e mínimo $0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O valor mínimo de $f(x, y) = x^2 + y^2$ sob a restrição $xy = 1$ é:",
                        difficulty: "dificil",
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
                                text: "$\\sqrt{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Aplicações de otimização",
                blocks: [
                    {
                        type: "text",
                        value: "# Aplicações de otimização\n\nOtimização aparece o tempo todo na prática: usar o mínimo de material numa embalagem, maximizar o lucro, ajustar uma reta a dados. A matemática é a mesma dos tópicos anteriores; o desafio é **montar o modelo**. O roteiro costuma ser:\n\n1. Identificar a **função objetivo**, ou seja o que se quer maximizar ou minimizar.\n2. Escrever as **restrições** que ligam as variáveis.\n3. Otimizar, seja eliminando uma variável, seja com Lagrange.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: caixa com menos material\n\nUma caixa retangular sem tampa deve ter volume $32\\,\\text{m}^3$. Queremos as dimensões que usam a menor área de material. Sejam $x$ e $y$ os lados da base e $z$ a altura. O volume dá $xyz = 32$, logo $z = \\dfrac{32}{xy}$.\n\nA área, contando a base e as quatro laterais, mas não o topo, é\n\n$$S = xy + 2xz + 2yz = xy + \\frac{64}{y} + \\frac{64}{x}$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: resolvendo\n\nDerivando e igualando a zero:\n\n$$S_x = y - \\frac{64}{x^2} = 0, \\qquad S_y = x - \\frac{64}{y^2} = 0$$\n\nDa primeira equação, $y = \\dfrac{64}{x^2}$. Substituindo na segunda e simplificando, chega-se a $x^3 = 64$, ou seja $x = 4$. Por simetria, $y = 4$, e então $z = \\dfrac{32}{16} = 2$.\n\nA caixa ótima mede $4 \\times 4 \\times 2$, com área $S = 48\\,\\text{m}^2$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: a horta e o muro\n\nUma horta retangular será cercada com $100$ m de tela, aproveitando um muro reto num dos lados, de modo que só três lados recebem tela: $x + 2y = 100$. Queremos a maior área $A = xy$.\n\nIsolando $x = 100 - 2y$ na restrição,\n\n$$A(y) = (100 - 2y)\\,y = 100y - 2y^2$$\n\nDe $A'(y) = 100 - 4y = 0$ vem $y = 25$ e $x = 50$. A área máxima é $A = 50 \\cdot 25 = 1250\\,\\text{m}^2$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: ajuste de reta\n\nDados os pontos $(x_i, y_i)$, a reta $y = mx + b$ que melhor os aproxima pelo critério dos **mínimos quadrados** é a que minimiza\n\n$$S(m, b) = \\sum_i (y_i - m x_i - b)^2$$\n\nTrata-se de minimizar uma função de duas variáveis, $m$ e $b$. Impondo $\\dfrac{\\partial S}{\\partial m} = 0$ e $\\dfrac{\\partial S}{\\partial b} = 0$, obtemos as **equações normais**, cuja solução dá os coeficientes da reta. É otimização livre de duas variáveis aplicada à estatística.",
                    },
                    {
                        type: "quote",
                        value: "Todo problema de otimização bem posto começa com uma pergunta simples: o que exatamente eu quero tornar o maior, ou o menor, possível?",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Modelar é escolher a função objetivo e as restrições antes de derivar.\n- Com uma restrição, dá para eliminar uma variável ou usar Lagrange.\n- Problemas clássicos: menor material para um volume dado, maior área para um perímetro dado.\n- Mínimos quadrados são otimização livre de duas variáveis, a base do ajuste de retas.",
                    },
                ],
                questions: [
                    {
                        statement: "Ao modelar um problema de otimização, o primeiro passo é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "identificar a função objetivo",
                                isCorrect: true,
                            },
                            {
                                text: "calcular logo a matriz Hessiana",
                                isCorrect: false,
                            },
                            {
                                text: "escolher um valor para $\\lambda$",
                                isCorrect: false,
                            },
                            {
                                text: "derivar a resposta final direto",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma horta retangular será cercada com $100$ m de tela aproveitando um muro num dos lados, com $x + 2y = 100$. A área máxima $xy$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1250\\,\\text{m}^2$, com $x = 50$ e $y = 25$",
                                isCorrect: true,
                            },
                            {
                                text: "$625\\,\\text{m}^2$, com $x = 25$ e $y = 25$",
                                isCorrect: false,
                            },
                            {
                                text: "$2500\\,\\text{m}^2$, com $x = 50$ e $y = 50$",
                                isCorrect: false,
                            },
                            {
                                text: "$1000\\,\\text{m}^2$, com $x = 20$ e $y = 40$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma caixa sem tampa deve ter volume $32\\,\\text{m}^3$. As dimensões que minimizam o material são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "base $4 \\times 4$ e altura $2$",
                                isCorrect: true,
                            },
                            {
                                text: "base $2 \\times 2$ e altura $8$",
                                isCorrect: false,
                            },
                            {
                                text: "base $8 \\times 8$ e altura $0{,}5$",
                                isCorrect: false,
                            },
                            {
                                text: "base $4 \\times 2$ e altura $4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Entre as caixas retangulares fechadas de volume $27\\,\\text{cm}^3$, a de menor área total é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "a caixa $3 \\times 3 \\times 3$",
                                isCorrect: true,
                            },
                            {
                                text: "a caixa $1 \\times 3 \\times 9$",
                                isCorrect: false,
                            },
                            {
                                text: "a caixa $1 \\times 1 \\times 27$",
                                isCorrect: false,
                            },
                            {
                                text: "a caixa $1{,}5 \\times 3 \\times 6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O valor máximo do produto $xyz$ com $x + y + z = 12$ e $x, y, z > 0$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$64$",
                                isCorrect: true,
                            },
                            {
                                text: "$48$",
                                isCorrect: false,
                            },
                            {
                                text: "$36$",
                                isCorrect: false,
                            },
                            {
                                text: "$144$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Integrais duplas",
        aulas: [
            {
                titulo: "A integral dupla",
                blocks: [
                    {
                        type: "text",
                        value: "## A integral dupla\n\nNo cálculo de uma variável, a integral $\\int_a^b f(x)\\,dx$ mede a área sob a curva $y=f(x)$. Ao passar para funções de duas variáveis $z=f(x,y)$, queremos medir o **volume** sob a superfície. A ferramenta para isso é a integral dupla $\\iint_R f(x,y)\\,dA$.\n\nComeçamos pelo caso mais simples: uma função definida sobre um retângulo $R=[a,b]\\times[c,d]$.",
                    },
                    {
                        type: "text",
                        value: "## Somas de Riemann\n\nDividimos o retângulo $R$ em $m\\cdot n$ subretângulos $R_{ij}$, cada um com área $\\Delta A = \\Delta x\\,\\Delta y$. Em cada subretângulo escolhemos um ponto amostra $(x_{ij}^*, y_{ij}^*)$ e formamos a **soma dupla de Riemann**:\n\n$$\\sum_{i=1}^{m}\\sum_{j=1}^{n} f(x_{ij}^*, y_{ij}^*)\\,\\Delta A.$$\n\nCada parcela $f(x_{ij}^*, y_{ij}^*)\\,\\Delta A$ é o volume de uma caixa fina de base $R_{ij}$ e altura $f(x_{ij}^*, y_{ij}^*)$. Somando todas as caixas, aproximamos o volume total.",
                    },
                    {
                        type: "text",
                        value: "## Definição\n\nA integral dupla é o limite dessas somas quando a malha fica infinitamente fina:\n\n$$\\iint_R f(x,y)\\,dA = \\lim_{m,n\\to\\infty}\\sum_{i=1}^{m}\\sum_{j=1}^{n} f(x_{ij}^*, y_{ij}^*)\\,\\Delta A.$$\n\nQuando esse limite existe e independe das escolhas dos pontos amostra, dizemos que $f$ é **integrável** em $R$. Toda função contínua em $R$ é integrável.",
                    },
                    {
                        type: "text",
                        value: "## Interpretação como volume\n\nSe $f(x,y)\\ge 0$ em $R$, então $\\iint_R f(x,y)\\,dA$ é exatamente o volume do sólido limitado abaixo por $R$ e acima pela superfície $z=f(x,y)$.\n\nUm caso imediato: se $f$ é a função constante $f(x,y)=c$, o sólido é uma caixa de base $R$ e altura $c$, logo\n\n$$\\iint_R c\\,dA = c\\cdot A(R),$$\n\nonde $A(R)=(b-a)(d-c)$ é a área do retângulo.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades\n\nA integral dupla herda as propriedades da integral simples:\n\n| Propriedade | Fórmula |\n| --- | --- |\n| Linearidade | $\\iint_R (f+g)\\,dA = \\iint_R f\\,dA + \\iint_R g\\,dA$ |\n| Constante | $\\iint_R c\\,f\\,dA = c\\iint_R f\\,dA$ |\n| Aditividade | $\\iint_R f\\,dA = \\iint_{R_1} f\\,dA + \\iint_{R_2} f\\,dA$ |\n| Comparação | se $f\\ge g$, então $\\iint_R f\\,dA \\ge \\iint_R g\\,dA$ |\n\nNa aditividade, $R$ é dividido em duas partes $R_1$ e $R_2$ que não se sobrepõem.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: regra do ponto médio\n\nVamos estimar $\\iint_R (x^2+y)\\,dA$ sobre $R=[0,2]\\times[0,2]$ usando $m=n=2$ e os pontos médios de cada subretângulo.\n\nOs quatro subretângulos têm lado $1$, logo $\\Delta A = 1$. Os pontos médios são $(0{,}5,\\,0{,}5)$, $(1{,}5,\\,0{,}5)$, $(0{,}5,\\,1{,}5)$ e $(1{,}5,\\,1{,}5)$. Avaliando $f(x,y)=x^2+y$ obtemos\n\n$$0{,}75;\\quad 2{,}75;\\quad 1{,}75;\\quad 3{,}75.$$\n\nA soma vale $9$, e multiplicando por $\\Delta A=1$ chegamos à estimativa $\\iint_R (x^2+y)\\,dA \\approx 9$. O valor exato é $\\tfrac{28}{3}\\approx 9{,}33$, então a aproximação é razoável.",
                    },
                    {
                        type: "quote",
                        value: "Somar infinitos pedacinhos de volume e a ideia que transforma uma superficie num numero.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A integral dupla $\\iint_R f\\,dA$ é o limite de somas de Riemann sobre subretângulos.\n- Para $f\\ge 0$, ela dá o volume sob a superfície $z=f(x,y)$.\n- Vale $\\iint_R c\\,dA = c\\cdot A(R)$, além de linearidade, aditividade e comparação.\n- O **valor médio** de $f$ em $R$ é $f_{\\text{med}} = \\dfrac{1}{A(R)}\\iint_R f\\,dA$.\n\nNas próximas aulas veremos como calcular essas integrais na prática, sem recorrer ao limite.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O valor de $\\iint_R 5\\,dA$ sobre o retângulo $R=[0,3]\\times[0,2]$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$30$",
                                isCorrect: true,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$11$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $f(x,y)\\ge 0$ sobre o retângulo $R$, o valor de $\\iint_R f(x,y)\\,dA$ representa:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "o volume sob $z=f(x,y)$ acima de $R$",
                                isCorrect: true,
                            },
                            {
                                text: "a área da superfície curva $z=f(x,y)$ sobre $R$",
                                isCorrect: false,
                            },
                            {
                                text: "a área da base retangular $R$ no plano $xy$",
                                isCorrect: false,
                            },
                            {
                                text: "o comprimento do contorno da região $R$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na soma de Riemann de $\\iint_R f\\,dA$ sobre $R=[0,4]\\times[0,2]$ com $m=2$ e $n=2$ subdivisões iguais, cada $\\Delta A$ vale:",
                        difficulty: "medio",
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
                        statement:
                            "Se $\\iint_R f\\,dA = 24$ sobre $R=[0,2]\\times[0,3]$, o valor médio de $f$ em $R$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$4$",
                                isCorrect: true,
                            },
                            {
                                text: "$24$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$144$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Estimando $\\iint_R (x^2+y^2)\\,dA$ sobre $R=[0,2]\\times[0,2]$ pela regra do ponto médio com $m=n=2$, obtemos:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$10$",
                                isCorrect: true,
                            },
                            {
                                text: "$8$",
                                isCorrect: false,
                            },
                            {
                                text: "$12$",
                                isCorrect: false,
                            },
                            {
                                text: "$20$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Integrais iteradas e o teorema de Fubini",
                blocks: [
                    {
                        type: "text",
                        value: "## Como calcular sem o limite\n\nCalcular uma integral dupla direto pela definição de limite é inviável. O **teorema de Fubini** resolve o problema: ele transforma a integral dupla em duas integrais simples encadeadas, chamadas de **integrais iteradas**.",
                    },
                    {
                        type: "text",
                        value: "## Integração parcial e integrais iteradas\n\nA ideia é integrar em uma variável de cada vez, tratando a outra como constante. A notação\n\n$$\\int_a^b\\int_c^d f(x,y)\\,dy\\,dx = \\int_a^b\\left[\\int_c^d f(x,y)\\,dy\\right]dx$$\n\nsignifica: primeiro integre $f$ em relação a $y$, de $c$ a $d$, mantendo $x$ fixo; o resultado é uma função só de $x$, que então integramos de $a$ a $b$.\n\nO diferencial mais interno indica a **primeira** variável a ser integrada.",
                    },
                    {
                        type: "text",
                        value: "## Teorema de Fubini\n\nSe $f$ é contínua no retângulo $R=[a,b]\\times[c,d]$, então a integral dupla é igual a qualquer uma das duas integrais iteradas:\n\n$$\\iint_R f(x,y)\\,dA = \\int_a^b\\int_c^d f(x,y)\\,dy\\,dx = \\int_c^d\\int_a^b f(x,y)\\,dx\\,dy.$$\n\nEm palavras: podemos integrar primeiro em $y$ e depois em $x$, ou primeiro em $x$ e depois em $y$, que o resultado é o mesmo. Escolhemos a ordem mais conveniente.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nCalcular $\\int_0^2\\int_1^3 (x+2y)\\,dy\\,dx$.\n\n**Integral interna** (em $y$, com $x$ fixo):\n\n$$\\int_1^3 (x+2y)\\,dy = \\left[xy+y^2\\right]_{1}^{3} = (3x+9)-(x+1) = 2x+8.$$\n\n**Integral externa** (em $x$):\n\n$$\\int_0^2 (2x+8)\\,dx = \\left[x^2+8x\\right]_0^2 = 4+16 = 20.$$\n\nInvertendo a ordem para $dx\\,dy$, o resultado seria o mesmo, $20$, como garante Fubini.",
                    },
                    {
                        type: "text",
                        value: "## Funções separáveis\n\nQuando o integrando se fatora como $f(x,y)=g(x)\\,h(y)$ e a região é um retângulo, a integral dupla vira um produto de integrais simples:\n\n$$\\iint_R g(x)\\,h(y)\\,dA = \\left(\\int_a^b g(x)\\,dx\\right)\\left(\\int_c^d h(y)\\,dy\\right).$$\n\nIsso costuma poupar bastante conta.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nCalcular $\\int_0^1\\int_0^{\\pi/2} x\\,\\sin y\\,dy\\,dx$.\n\nComo o integrando é separável, escrevemos\n\n$$\\left(\\int_0^1 x\\,dx\\right)\\left(\\int_0^{\\pi/2}\\sin y\\,dy\\right).$$\n\nO primeiro fator vale $\\left[\\tfrac{x^2}{2}\\right]_0^1=\\tfrac{1}{2}$ e o segundo vale $\\left[-\\cos y\\right]_0^{\\pi/2}=1$. Logo a integral vale $\\tfrac{1}{2}\\cdot 1 = \\tfrac{1}{2}$.",
                    },
                    {
                        type: "quote",
                        value: "Integrar em duas variaveis e integrar uma vez e depois integrar o resultado.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma **integral iterada** resolve a integral dupla em duas etapas de integração simples.\n- O diferencial interno indica a primeira variável integrada; a outra fica constante nessa etapa.\n- **Fubini**: para $f$ contínua em um retângulo, as duas ordens dão o mesmo valor.\n- Se $f(x,y)=g(x)h(y)$, a integral sobre o retângulo é o produto das integrais simples.",
                    },
                ],
                questions: [
                    {
                        statement: "O valor de $\\int_0^1\\int_0^2 x\\,dy\\,dx$ é:",
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
                                text: "$4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O teorema de Fubini, para $f$ contínua em um retângulo, garante que:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "as duas ordens de integração dão o mesmo valor",
                                isCorrect: true,
                            },
                            {
                                text: "somente a ordem $dy\\,dx$ fornece o valor correto",
                                isCorrect: false,
                            },
                            {
                                text: "trocar a ordem de integração inverte o sinal do resultado",
                                isCorrect: false,
                            },
                            {
                                text: "a ordem $dx\\,dy$ multiplica o resultado final por dois",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $\\int_0^1\\int_0^1 (x+y)\\,dx\\,dy$ é:",
                        difficulty: "medio",
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
                                text: "$\\frac{1}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $\\int_0^2\\int_0^1 x^2 y\\,dy\\,dx$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{4}{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{8}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{2}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{3}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $\\int_0^2\\int_1^2 \\frac{x}{y}\\,dy\\,dx$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$2\\ln 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\ln 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$4\\ln 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{3}{2}\\ln 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Integrais duplas em regiões gerais",
                blocks: [
                    {
                        type: "text",
                        value: "## Além dos retângulos\n\nA maioria das regiões interessantes não é retangular: triângulos, discos, regiões entre duas curvas. Para integrar sobre elas, classificamos a região em dois tipos e ajustamos os limites de integração, que agora podem ser funções em vez de constantes.",
                    },
                    {
                        type: "text",
                        value: "## Regiões do tipo I (verticalmente simples)\n\nUma região do **tipo I** fica presa entre duas curvas em $y$:\n\n$$D=\\{(x,y): a\\le x\\le b,\\ g_1(x)\\le y\\le g_2(x)\\}.$$\n\nIntegramos primeiro em $y$, de $g_1(x)$ até $g_2(x)$, e depois em $x$:\n\n$$\\iint_D f(x,y)\\,dA = \\int_a^b\\int_{g_1(x)}^{g_2(x)} f(x,y)\\,dy\\,dx.$$\n\nOs limites internos dependem de $x$; os externos são sempre números.",
                    },
                    {
                        type: "text",
                        value: "## Regiões do tipo II (horizontalmente simples)\n\nUma região do **tipo II** fica presa entre duas curvas em $x$:\n\n$$D=\\{(x,y): c\\le y\\le d,\\ h_1(y)\\le x\\le h_2(y)\\}.$$\n\nAgora integramos primeiro em $x$ e depois em $y$:\n\n$$\\iint_D f(x,y)\\,dA = \\int_c^d\\int_{h_1(y)}^{h_2(y)} f(x,y)\\,dx\\,dy.$$\n\nUma mesma região pode ser dos dois tipos; escolhemos o que dá contas mais simples.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nCalcular $\\iint_D (x+y)\\,dA$, onde $D$ é a região entre $y=x^2$ e $y=x$.\n\nAs curvas se cruzam quando $x^2=x$, ou seja, em $x=0$ e $x=1$. Nesse intervalo $x^2\\le x$, então tratamos $D$ como tipo I com $x^2\\le y\\le x$:\n\n$$\\int_0^1\\int_{x^2}^{x}(x+y)\\,dy\\,dx.$$\n\nA integral interna vale $\\left[xy+\\tfrac{y^2}{2}\\right]_{x^2}^{x} = \\tfrac{3x^2}{2}-x^3-\\tfrac{x^4}{2}$. Integrando de $0$ a $1$:\n\n$$\\tfrac{1}{2}-\\tfrac{1}{4}-\\tfrac{1}{10}=\\tfrac{3}{20}.$$",
                    },
                    {
                        type: "text",
                        value: "## Invertendo a ordem de integração\n\nÀs vezes a integral em uma ordem é difícil ou impossível em termos elementares, mas fica simples na outra ordem. Para inverter, o passo essencial é **desenhar a região** e reescrever a mesma $D$ trocando os papéis de $x$ e $y$. Os limites mudam, mas a região integrada e o resultado permanecem os mesmos.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nCalcular $\\int_0^1\\int_x^1 e^{y^2}\\,dy\\,dx$.\n\nNão conhecemos uma primitiva elementar de $e^{y^2}$ em $y$, então invertemos a ordem. A região é $0\\le x\\le 1$, $x\\le y\\le 1$, que também se descreve como $0\\le y\\le 1$, $0\\le x\\le y$. Assim:\n\n$$\\int_0^1\\int_0^{y} e^{y^2}\\,dx\\,dy = \\int_0^1 y\\,e^{y^2}\\,dy = \\left[\\tfrac{1}{2}e^{y^2}\\right]_0^1 = \\tfrac{1}{2}(e-1).$$\n\nNa nova ordem a conta sai de imediato.",
                    },
                    {
                        type: "quote",
                        value: "Desenhar a regiao antes de montar os limites evita a maioria dos erros.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Região **tipo I**: $y$ entre duas funções de $x$; integra-se $dy\\,dx$.\n- Região **tipo II**: $x$ entre duas funções de $y$; integra-se $dx\\,dy$.\n- Nas regiões gerais os limites internos podem ser funções; os externos são sempre constantes.\n- A **área** de $D$ é $\\iint_D 1\\,dA$.\n- Inverter a ordem de integração pode transformar uma integral impossível em uma trivial.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A região $0\\le x\\le 2$, $0\\le y\\le x^2$ corresponde à integral iterada:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\int_0^2\\int_0^{x^2} f\\,dy\\,dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\int_0^2\\int_0^{x^2} f\\,dx\\,dy$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_0^{x^2}\\int_0^2 f\\,dy\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_0^2\\int_{x^2}^{0} f\\,dy\\,dx$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A área de uma região $D$ é dada por $\\iint_D f\\,dA$ quando o integrando $f$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$x$",
                                isCorrect: false,
                            },
                            {
                                text: "$x+y$",
                                isCorrect: false,
                            },
                            {
                                text: "$xy$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $\\int_0^1\\int_0^x 2y\\,dy\\,dx$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{3}$",
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
                                text: "$\\frac{2}{3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Invertendo a ordem de integração de $\\int_0^1\\int_0^x f(x,y)\\,dy\\,dx$, obtemos:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\int_0^1\\int_y^1 f\\,dx\\,dy$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\int_0^1\\int_0^y f\\,dx\\,dy$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_0^1\\int_y^1 f\\,dy\\,dx$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_0^1\\int_0^1 f\\,dx\\,dy$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O valor de $\\iint_D y\\,dA$, onde $D$ é o triângulo de vértices $(0,0)$, $(1,0)$ e $(1,1)$, é:",
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
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
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
                titulo: "Integrais duplas em coordenadas polares",
                blocks: [
                    {
                        type: "text",
                        value: "## Por que usar coordenadas polares\n\nRegiões circulares e integrandos que dependem de $x^2+y^2$ ficam desajeitados em coordenadas cartesianas, porque os limites envolvem raízes como $\\sqrt{a^2-x^2}$. As coordenadas polares descrevem discos e setores com limites constantes e simplificam muito essas contas.",
                    },
                    {
                        type: "text",
                        value: "## O elemento de área polar\n\nLembrando as relações $x=r\\cos\\theta$, $y=r\\sin\\theta$ e $x^2+y^2=r^2$. Ao trocar de variáveis, o elemento de área **não** é simplesmente $dr\\,d\\theta$: aparece um fator $r$ vindo do jacobiano da transformação:\n\n$$dA = r\\,dr\\,d\\theta.$$\n\nEsquecer esse $r$ é o erro mais comum em integrais polares. Ele reflete o fato de que, longe da origem, um mesmo incremento de ângulo cobre mais área.",
                    },
                    {
                        type: "text",
                        value: "## Integral dupla em polares\n\nSobre um retângulo polar $R=\\{(r,\\theta): a\\le r\\le b,\\ \\alpha\\le\\theta\\le\\beta\\}$, a integral dupla se escreve\n\n$$\\iint_R f(x,y)\\,dA = \\int_{\\alpha}^{\\beta}\\int_a^b f(r\\cos\\theta,\\,r\\sin\\theta)\\,r\\,dr\\,d\\theta.$$\n\nTrocamos $x$ e $y$ pelas expressões polares, incluímos o fator $r$ e ajustamos os limites para $r$ e $\\theta$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nCalcular $\\iint_D (x^2+y^2)\\,dA$, onde $D$ é o disco $x^2+y^2\\le 4$.\n\nO disco tem raio $2$, logo $0\\le r\\le 2$ e $0\\le\\theta\\le 2\\pi$. Como $x^2+y^2=r^2$, o integrando vira $r^2$, e não podemos esquecer o fator $r$ do $dA$:\n\n$$\\int_0^{2\\pi}\\int_0^2 r^2\\cdot r\\,dr\\,d\\theta = \\int_0^{2\\pi}\\int_0^2 r^3\\,dr\\,d\\theta.$$\n\nA integral interna vale $\\left[\\tfrac{r^4}{4}\\right]_0^2 = 4$, e $\\int_0^{2\\pi} 4\\,d\\theta = 8\\pi$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nCalcular $\\iint_D e^{x^2+y^2}\\,dA$ sobre o disco unitário $x^2+y^2\\le 1$.\n\nEssa integral é intratável em cartesianas, mas em polares $x^2+y^2=r^2$ e o fator $r$ cai perfeitamente:\n\n$$\\int_0^{2\\pi}\\int_0^1 e^{r^2}\\,r\\,dr\\,d\\theta.$$\n\nCom a substituição $u=r^2$, temos $\\int_0^1 e^{r^2}r\\,dr = \\tfrac{1}{2}(e-1)$. Multiplicando por $\\int_0^{2\\pi}d\\theta = 2\\pi$, o resultado é $\\pi(e-1)$.",
                    },
                    {
                        type: "text",
                        value: "## Regiões polares gerais\n\nQuando a fronteira externa varia com o ângulo, o raio vai de $0$ até uma função $h(\\theta)$:\n\n$$\\iint_D f\\,dA = \\int_{\\alpha}^{\\beta}\\int_0^{h(\\theta)} f(r\\cos\\theta,\\,r\\sin\\theta)\\,r\\,dr\\,d\\theta.$$\n\nÉ o análogo polar das regiões do tipo I e II: o limite interno pode depender de $\\theta$, enquanto os limites de $\\theta$ são constantes.",
                    },
                    {
                        type: "quote",
                        value: "Quando o problema tem simetria circular, pensar em polares costuma encurtar a conta.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Em polares, $x=r\\cos\\theta$, $y=r\\sin\\theta$ e $x^2+y^2=r^2$.\n- O elemento de área é $dA=r\\,dr\\,d\\theta$; nunca esqueça o fator $r$.\n- Sobre um disco de raio $R$ centrado na origem, $0\\le r\\le R$ e $0\\le\\theta\\le 2\\pi$.\n- Discos, setores e integrandos com $x^2+y^2$ são os candidatos naturais às polares.",
                    },
                ],
                questions: [
                    {
                        statement: "O elemento de área em coordenadas polares é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$r\\,dr\\,d\\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$dr\\,d\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$r^2\\,dr\\,d\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{r}\\,dr\\,d\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Em coordenadas polares, a expressão $x^2+y^2$ é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$r^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$r$",
                                isCorrect: false,
                            },
                            {
                                text: "$2r$",
                                isCorrect: false,
                            },
                            {
                                text: "$r\\cos\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Convertendo $\\iint_D f\\,dA$ sobre o disco $x^2+y^2\\le 9$ para polares, obtemos:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\int_0^{2\\pi}\\int_0^3 f\\,r\\,dr\\,d\\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\int_0^{2\\pi}\\int_0^3 f\\,dr\\,d\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_0^{\\pi}\\int_0^3 f\\,r\\,dr\\,d\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_0^{2\\pi}\\int_0^9 f\\,r\\,dr\\,d\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $\\int_0^{2\\pi}\\int_0^1 r\\,dr\\,d\\theta$ é:",
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
                                text: "$1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O valor de $\\iint_D (x^2+y^2)\\,dA$ sobre o disco $x^2+y^2\\le 1$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{\\pi}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{2\\pi}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\pi}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Aplicações: área, volume e massa",
                blocks: [
                    {
                        type: "text",
                        value: "## Três aplicações, uma integral\n\nÁrea, volume e massa são todas integrais duplas: muda apenas o integrando. Nesta aula reunimos essas aplicações e acrescentamos o cálculo de massa e centro de massa de lâminas planas.",
                    },
                    {
                        type: "text",
                        value: "## Área e volume\n\nA **área** de uma região plana $D$ é a integral do integrando constante $1$:\n\n$$A(D) = \\iint_D 1\\,dA.$$\n\nO **volume** do sólido sob a superfície $z=f(x,y)\\ge 0$ acima de $D$ é\n\n$$V = \\iint_D f(x,y)\\,dA.$$\n\nQuando o sólido está entre duas superfícies, $z=f_{\\text{sup}}$ por cima e $z=f_{\\text{inf}}$ por baixo, o volume é $\\iint_D (f_{\\text{sup}}-f_{\\text{inf}})\\,dA$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: volume de um paraboloide\n\nQual o volume do sólido limitado pelo paraboloide $z=4-x^2-y^2$ e pelo plano $z=0$?\n\nO sólido existe onde $z\\ge 0$, isto é, no disco $x^2+y^2\\le 4$. Em polares, $z=4-r^2$ e o disco tem $0\\le r\\le 2$:\n\n$$V=\\int_0^{2\\pi}\\int_0^2 (4-r^2)\\,r\\,dr\\,d\\theta = \\int_0^{2\\pi}\\int_0^2 (4r-r^3)\\,dr\\,d\\theta.$$\n\nA integral interna vale $\\left[2r^2-\\tfrac{r^4}{4}\\right]_0^2 = 8-4 = 4$, e $\\int_0^{2\\pi}4\\,d\\theta = 8\\pi$. O volume é $8\\pi$.",
                    },
                    {
                        type: "text",
                        value: "## Massa e densidade\n\nUma **lâmina** é uma placa fina que ocupa uma região $D$ com densidade superficial $\\rho(x,y)$, isto é, massa por unidade de área. Se a densidade varia de ponto a ponto, a massa total é\n\n$$m = \\iint_D \\rho(x,y)\\,dA.$$\n\nQuando a densidade é constante, a lâmina é homogênea e $m=\\rho\\cdot A(D)$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: massa de uma lâmina\n\nUma lâmina ocupa o triângulo de vértices $(0,0)$, $(1,0)$ e $(0,1)$, com densidade $\\rho(x,y)=x+y$. Qual a massa?\n\nA região é do tipo I com $0\\le x\\le 1$ e $0\\le y\\le 1-x$:\n\n$$m=\\int_0^1\\int_0^{1-x}(x+y)\\,dy\\,dx.$$\n\nA integral interna vale $\\left[xy+\\tfrac{y^2}{2}\\right]_0^{1-x} = \\tfrac{1}{2}(1-x^2)$. Integrando de $0$ a $1$:\n\n$$m=\\tfrac{1}{2}\\int_0^1 (1-x^2)\\,dx = \\tfrac{1}{2}\\cdot\\tfrac{2}{3} = \\tfrac{1}{3}.$$",
                    },
                    {
                        type: "text",
                        value: "## Centro de massa\n\nOs **momentos** da lâmina em relação aos eixos são\n\n$$M_x = \\iint_D y\\,\\rho(x,y)\\,dA,\\qquad M_y = \\iint_D x\\,\\rho(x,y)\\,dA.$$\n\nO **centro de massa** $(\\bar{x},\\bar{y})$ é obtido dividindo cada momento pela massa:\n\n$$\\bar{x} = \\frac{M_y}{m},\\qquad \\bar{y} = \\frac{M_x}{m}.$$\n\nRepare no cruzamento: $\\bar{x}$ usa $M_y$, que carrega o fator $x$, e $\\bar{y}$ usa $M_x$, que carrega o fator $y$.",
                    },
                    {
                        type: "quote",
                        value: "Area, volume e massa sao a mesma integral dupla com integrandos diferentes.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- **Área**: $A(D)=\\iint_D 1\\,dA$.\n- **Volume** sob $z=f\\ge 0$: $V=\\iint_D f\\,dA$; entre duas superfícies, integra-se a diferença.\n- **Massa** de uma lâmina de densidade $\\rho$: $m=\\iint_D \\rho\\,dA$.\n- **Centro de massa**: $\\bar{x}=M_y/m$ e $\\bar{y}=M_x/m$, com $M_x=\\iint_D y\\rho\\,dA$ e $M_y=\\iint_D x\\rho\\,dA$.\n- Muitas dessas integrais ficam mais simples em coordenadas polares quando há simetria circular.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A massa de uma lâmina de densidade $\\rho(x,y)$ sobre $D$ é dada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\iint_D \\rho\\,dA$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\iint_D 1\\,dA$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\iint_D x\\rho\\,dA$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\iint_D \\rho\\,dx$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O volume do sólido sob $z=f(x,y)\\ge 0$ acima de $D$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\iint_D f\\,dA$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\iint_D 1\\,dA$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\iint_D f^2\\,dA$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\iint_D (f-1)\\,dA$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O volume do sólido sob $z=2x$ acima de $R=[0,1]\\times[0,3]$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma lâmina homogênea de densidade $\\rho=4$ ocupa uma região de área $8$. Sua massa é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$32$",
                                isCorrect: true,
                            },
                            {
                                text: "$12$",
                                isCorrect: false,
                            },
                            {
                                text: "$8$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O volume do sólido limitado por $z=9-x^2-y^2$ e $z=0$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{81\\pi}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$81\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{81\\pi}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$27\\pi$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Integrais triplas",
        aulas: [
            {
                titulo: "A integral tripla",
                blocks: [
                    {
                        type: "text",
                        value: "## A integral tripla\n\nAssim como a integral dupla estende a integral de uma variavel para regioes do plano, a **integral tripla** estende a ideia para funcoes de tres variaveis definidas em solidos do espaco. Se $f(x,y,z)$ esta definida numa caixa retangular\n\n$$B = [a,b]\\times[c,d]\\times[p,q],$$\n\ndividimos $B$ em pequenas subcaixas e formamos uma soma. A integral tripla e o limite dessas somas quando as subcaixas ficam arbitrariamente pequenas, e a escrevemos como $\\iiint_B f(x,y,z)\\,dV$.",
                    },
                    {
                        type: "text",
                        value: "## Soma de Riemann e definicao\n\nDividindo cada aresta da caixa em subintervalos, obtemos $lmn$ subcaixas $B_{ijk}$ de volume $\\Delta V = \\Delta x\\,\\Delta y\\,\\Delta z$. Escolhendo um ponto amostral em cada uma, a soma de Riemann tripla e\n\n$$\\sum_{i=1}^{l}\\sum_{j=1}^{m}\\sum_{k=1}^{n} f(x_{ijk}^{*}, y_{ijk}^{*}, z_{ijk}^{*})\\,\\Delta V.$$\n\nQuando $f$ e continua, esse limite existe e nao depende das escolhas feitas. Ele define a integral tripla:\n\n$$\\iiint_B f(x,y,z)\\,dV = \\lim_{l,m,n\\to\\infty}\\ \\sum_{i=1}^{l}\\sum_{j=1}^{m}\\sum_{k=1}^{n} f(x_{ijk}^{*}, y_{ijk}^{*}, z_{ijk}^{*})\\,\\Delta V.$$",
                    },
                    {
                        type: "text",
                        value: "## Teorema de Fubini\n\nCalcular esse limite diretamente e inviavel na pratica. O **teorema de Fubini** garante que, para $f$ continua numa caixa, a integral tripla e igual a uma integral iterada, resolvida de dentro para fora:\n\n$$\\iiint_B f\\,dV = \\int_a^b\\int_c^d\\int_p^q f(x,y,z)\\,dz\\,dy\\,dx.$$\n\nComo a caixa tem limites constantes, podemos integrar em qualquer das seis ordens possiveis das variaveis, e todas dao o mesmo resultado. Escolhemos a ordem que torna as contas mais simples.",
                    },
                    {
                        type: "quote",
                        value: "A integral tripla troca o problema geometrico de medir um solido por tres integracoes simples encaixadas.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: integral separavel\n\nCalcule $\\iiint_B xyz\\,dV$, em que $B = [0,1]\\times[0,2]\\times[0,3]$.\n\nComo o integrando e um produto de funcoes de uma variavel cada e a caixa tem limites constantes, a integral se separa num produto de tres integrais:\n\n$$\\iiint_B xyz\\,dV = \\left(\\int_0^1 x\\,dx\\right)\\left(\\int_0^2 y\\,dy\\right)\\left(\\int_0^3 z\\,dz\\right).$$\n\nCalculando cada fator, $\\int_0^1 x\\,dx = \\tfrac{1}{2}$, $\\int_0^2 y\\,dy = 2$ e $\\int_0^3 z\\,dz = \\tfrac{9}{2}$. Logo\n\n$$\\iiint_B xyz\\,dV = \\tfrac{1}{2}\\cdot 2\\cdot\\tfrac{9}{2} = \\frac{9}{2}.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: integrando em soma\n\nCalcule $\\iiint_B (x+y+z)\\,dV$ sobre o cubo $B = [0,1]^3$. Como o integrando e uma soma, integramos passo a passo, comecando por $z$:\n\n$$\\int_0^1 (x+y+z)\\,dz = \\Big[xz + yz + \\tfrac{z^2}{2}\\Big]_0^1 = x + y + \\tfrac{1}{2}.$$\n\nAgora em $y$, mantendo $x$ fixo:\n\n$$\\int_0^1 \\Big(x + y + \\tfrac{1}{2}\\Big)\\,dy = x + \\tfrac{1}{2} + \\tfrac{1}{2} = x + 1.$$\n\nPor fim em $x$, $\\int_0^1 (x+1)\\,dx = \\tfrac{1}{2} + 1 = \\tfrac{3}{2}$. A integral vale $\\frac{3}{2}$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A integral tripla $\\iiint_B f\\,dV$ e o limite de somas de Riemann sobre subcaixas.\n- Para $f$ continua numa caixa, o teorema de Fubini reduz tudo a uma integral iterada com limites constantes, valida em qualquer das seis ordens.\n- Quando o integrando se fatora como produto de funcoes de uma variavel, a integral vira o produto de tres integrais simples.\n- Nas proximas aulas trocamos a caixa por solidos gerais e por sistemas de coordenadas adequados a geometria.",
                    },
                ],
                questions: [
                    {
                        statement: "A integral $\\iiint_E 1\\,dV$ fornece:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "o volume do solido $E$",
                                isCorrect: true,
                            },
                            {
                                text: "a area da superficie que limita $E$",
                                isCorrect: false,
                            },
                            {
                                text: "a area da base de $E$",
                                isCorrect: false,
                            },
                            {
                                text: "a massa de $E$ com densidade nula",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Pelo teorema de Fubini, quantas ordens de integracao iterada sao possiveis numa caixa retangular?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$6$",
                                isCorrect: true,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O valor de $\\int_0^1\\int_0^1\\int_0^1 xyz\\,dz\\,dy\\,dx$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{8}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{6}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{3}$",
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
                            "Calcule $\\iiint_B xyz\\,dV$ em $B=[0,1]\\times[0,2]\\times[0,3]$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{9}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                            {
                                text: "$36$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{9}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule $\\iiint_B (x+y+z)\\,dV$ no cubo $[0,1]^3$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{3}{2}$",
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
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Integrais triplas em regioes gerais",
                blocks: [
                    {
                        type: "text",
                        value: "## Regioes solidas gerais\n\nPoucos solidos sao caixas. Para uma regiao solida geral $E$, projetamos o solido sobre um dos planos coordenados e descrevemos a variavel restante entre duas superficies. Dizemos que $E$ e uma **regiao do tipo 1** quando esta entre os graficos de duas funcoes de $x$ e $y$:\n\n$$E = \\{(x,y,z) : (x,y)\\in D,\\ \\ u_1(x,y)\\le z\\le u_2(x,y)\\},$$\n\nonde $D$ e a projecao de $E$ no plano $xy$. Nesse caso\n\n$$\\iiint_E f\\,dV = \\iint_D\\left[\\int_{u_1(x,y)}^{u_2(x,y)} f(x,y,z)\\,dz\\right]dA.$$",
                    },
                    {
                        type: "text",
                        value: "## Tipos 2 e 3\n\nA integral interna em $z$ tem limites que dependem de $x$ e $y$: a superficie de baixo $z=u_1(x,y)$ e a de cima $z=u_2(x,y)$. Depois de resolve-la, sobra uma integral dupla sobre $D$, tratada com as tecnicas do plano.\n\nDe modo analogo, uma **regiao do tipo 2** projeta-se no plano $yz$, com $x$ preso entre duas superficies $x=u_1(y,z)$ e $x=u_2(y,z)$; uma **regiao do tipo 3** projeta-se no plano $xz$, com $y$ entre duas superficies. A escolha da projecao depende da geometria do solido e de qual variavel fica mais simples de isolar.",
                    },
                    {
                        type: "quote",
                        value: "O segredo das regioes gerais e ler o solido de dentro para fora: primeiro a variavel presa entre duas superficies, depois a sombra que ela projeta no plano.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: volume do tetraedro\n\nEncontre o volume do tetraedro $E$ limitado pelos planos coordenados e pelo plano $x+y+z=1$.\n\nO teto do solido e $z = 1-x-y$ e o piso e $z=0$, logo $0\\le z\\le 1-x-y$. A sombra $D$ no plano $xy$ e o triangulo $0\\le y\\le 1-x$, $0\\le x\\le 1$. Entao\n\n$$V = \\int_0^1\\int_0^{1-x}\\int_0^{1-x-y} dz\\,dy\\,dx = \\int_0^1\\int_0^{1-x} (1-x-y)\\,dy\\,dx.$$\n\nA integral em $y$ vale $\\int_0^{1-x}(1-x-y)\\,dy = \\frac{(1-x)^2}{2}$. Assim\n\n$$V = \\int_0^1 \\frac{(1-x)^2}{2}\\,dx = \\frac{1}{2}\\cdot\\frac{1}{3} = \\frac{1}{6}.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: integrando primeiro em z\n\nCalcule $\\iiint_E 6xy\\,dV$, onde $E$ esta sob o plano $z = 1+x+y$ e acima da regiao do plano $xy$ limitada por $y=\\sqrt{x}$, $y=0$ e $x=1$.\n\nTemos $0\\le z\\le 1+x+y$ e a projecao $D$: $0\\le y\\le\\sqrt{x}$, $0\\le x\\le 1$. Como $6xy$ nao depende de $z$, a integral interna e\n\n$$\\int_0^{1+x+y} 6xy\\,dz = 6xy\\,(1+x+y).$$\n\nLevando esse resultado a integral dupla sobre $D$,\n\n$$\\int_0^1\\int_0^{\\sqrt{x}} 6xy\\,(1+x+y)\\,dy\\,dx = \\int_0^1 \\big(3x^2 + 3x^3 + 2x^{5/2}\\big)\\,dx.$$\n\nIntegrando termo a termo, $\\int_0^1 3x^2\\,dx = 1$, $\\int_0^1 3x^3\\,dx = \\tfrac{3}{4}$ e $\\int_0^1 2x^{5/2}\\,dx = \\tfrac{4}{7}$. Somando, $1 + \\tfrac{3}{4} + \\tfrac{4}{7} = \\frac{65}{28}$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Numa regiao geral, resolva primeiro a variavel presa entre duas superficies; sobra uma integral dupla sobre a projecao $D$.\n- Os limites da integral interna dependem das outras variaveis; os da externa sao constantes.\n- Ha tres tipos de regiao, conforme a projecao seja no plano $xy$, $yz$ ou $xz$.\n- Trocar a ordem de integracao ou a projecao pode simplificar bastante as contas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Numa regiao do tipo 1, $E=\\{(x,y,z):(x,y)\\in D,\\ u_1\\le z\\le u_2\\}$, a integracao mais interna e feita em relacao a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$z$",
                                isCorrect: true,
                            },
                            {
                                text: "$x$",
                                isCorrect: false,
                            },
                            {
                                text: "$y$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O volume do tetraedro limitado pelos planos coordenados e por $x+y+z=1$ e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{1}{6}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{3}$",
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
                            "Para $E$ dada por $0\\le z\\le 1-x-y$ sobre uma projecao $D$, a integral $\\iiint_E f\\,dV$ e igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\iint_D\\left[\\int_0^{1-x-y} f\\,dz\\right]dA$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\iint_D\\left[\\int_0^{1} f\\,dz\\right]dA$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_0^{1-x-y}\\left[\\iint_D f\\,dA\\right]dz$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\iint_D\\left[\\int_{1-x-y}^{1} f\\,dz\\right]dA$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No calculo de $\\iiint_E 6xy\\,dV$ com $E$ sob $z=1+x+y$, a integral interna $\\int_0^{1+x+y} 6xy\\,dz$ resulta em:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$6xy\\,(1+x+y)$",
                                isCorrect: true,
                            },
                            {
                                text: "$3xy\\,(1+x+y)^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$6xy$",
                                isCorrect: false,
                            },
                            {
                                text: "$6xyz$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O valor de $\\iiint_E 6xy\\,dV$, com $E$ sob $z=1+x+y$ e $D$ limitada por $y=\\sqrt{x}$, $y=0$, $x=1$, e:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{65}{28}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{11}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{5}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{28}{65}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Coordenadas cilindricas",
                blocks: [
                    {
                        type: "text",
                        value: "## Coordenadas cilindricas\n\nSolidos com **simetria em torno de um eixo**, como cilindros, cones e paraboloides, ficam muito mais simples em **coordenadas cilindricas**. Um ponto e descrito por $(r,\\theta,z)$, em que $(r,\\theta)$ sao as coordenadas polares da projecao no plano $xy$ e $z$ e a mesma altura de sempre. As relacoes com as cartesianas sao\n\n$$x = r\\cos\\theta,\\qquad y = r\\sin\\theta,\\qquad z = z,$$\n\ncom $r\\ge 0$ e, em geral, $0\\le\\theta\\le 2\\pi$. Tambem valem $r^2 = x^2+y^2$ e $\\tan\\theta = y/x$.",
                    },
                    {
                        type: "text",
                        value: "## O elemento de volume\n\nAo trocar de variaveis, o elemento de volume ganha um fator igual ao jacobiano da transformacao. Para as cilindricas esse fator e $r$, de modo que\n\n$$dV = r\\,dz\\,dr\\,d\\theta.$$\n\nEsse $r$ e essencial, e esquece-lo e o erro mais comum. A formula de mudanca de variaveis fica\n\n$$\\iiint_E f(x,y,z)\\,dV = \\int_\\alpha^\\beta\\int_{h_1(\\theta)}^{h_2(\\theta)}\\int_{u_1(r,\\theta)}^{u_2(r,\\theta)} f(r\\cos\\theta,\\, r\\sin\\theta,\\, z)\\, r\\,dz\\,dr\\,d\\theta.$$",
                    },
                    {
                        type: "text",
                        value: "## Do cartesiano ao cilindrico\n\nA tabela compara o piso cartesiano com o cilindrico:\n\n| Sistema | Coordenadas | Elemento de volume $dV$ |\n| --- | --- | --- |\n| Cartesiano | $(x,y,z)$ | $dz\\,dy\\,dx$ |\n| Cilindrico | $(r,\\theta,z)$ | $r\\,dz\\,dr\\,d\\theta$ |\n\nA unica novidade em relacao as coordenadas polares do plano e a altura $z$, que entra sem alterar o fator $r$.",
                    },
                    {
                        type: "quote",
                        value: "Quando a sombra do solido no chao e um circulo ou um setor, as coordenadas cilindricas quase sempre valem a pena.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: volume sob um paraboloide\n\nCalcule o volume do solido limitado abaixo pelo paraboloide $z = x^2+y^2$ e acima pelo plano $z = 4$.\n\nEm cilindricas, $x^2+y^2 = r^2$, entao o solido e $r^2\\le z\\le 4$. A projecao no plano $xy$ e o disco $x^2+y^2\\le 4$, isto e $0\\le r\\le 2$ e $0\\le\\theta\\le 2\\pi$. Logo\n\n$$V = \\int_0^{2\\pi}\\int_0^2\\int_{r^2}^{4} r\\,dz\\,dr\\,d\\theta = \\int_0^{2\\pi}\\int_0^2 r\\,(4 - r^2)\\,dr\\,d\\theta.$$\n\nA integral em $r$ vale $\\int_0^2 (4r - r^3)\\,dr = 8 - 4 = 4$. Multiplicando pelo giro completo, $V = 2\\pi\\cdot 4 = 8\\pi$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: integrando com simetria axial\n\nCalcule $\\iiint_E \\sqrt{x^2+y^2}\\,dV$, em que $E$ e o interior do cilindro $x^2+y^2 = 16$ entre os planos $z = -5$ e $z = 4$.\n\nComo $\\sqrt{x^2+y^2} = r$, o integrando vira $r$ e, junto com o fator do volume, aparece $r\\cdot r = r^2$. Os limites sao $0\\le r\\le 4$, $0\\le\\theta\\le 2\\pi$ e $-5\\le z\\le 4$:\n\n$$\\iiint_E \\sqrt{x^2+y^2}\\,dV = \\int_0^{2\\pi}\\int_0^4\\int_{-5}^{4} r^2\\,dz\\,dr\\,d\\theta.$$\n\nA integral em $z$ da o fator $4-(-5)=9$. Entao\n\n$$9\\int_0^{2\\pi}\\!d\\theta\\int_0^4 r^2\\,dr = 9\\cdot 2\\pi\\cdot\\frac{64}{3} = 384\\pi.$$",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Em cilindricas, $x=r\\cos\\theta$, $y=r\\sin\\theta$, $z=z$, e o elemento de volume e $dV = r\\,dz\\,dr\\,d\\theta$.\n- Sao ideais quando o solido tem eixo de simetria ou projecao circular no plano $xy$.\n- Reescreva as superficies em funcao de $r$ e $z$ antes de montar os limites.\n- Nunca esqueca o fator $r$ que multiplica o integrando.",
                    },
                ],
                questions: [
                    {
                        statement: "Em coordenadas cilindricas, o elemento de volume e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$dV = r\\,dz\\,dr\\,d\\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$dV = dz\\,dr\\,d\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$dV = r^2\\,dz\\,dr\\,d\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$dV = \\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A conversao correta de cilindricas para cartesianas e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x=r\\cos\\theta,\\ y=r\\sin\\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$x=r\\sin\\theta,\\ y=r\\cos\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$x=r\\cos\\theta,\\ y=r\\cos\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$x=\\rho\\cos\\theta,\\ y=\\rho\\sin\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O volume do solido entre o paraboloide $z=x^2+y^2$ e o plano $z=4$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$8\\pi$",
                                isCorrect: true,
                            },
                            {
                                text: "$16\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$4\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{32\\pi}{3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para integrar sobre o disco $x^2+y^2\\le 9$ em cilindricas, os limites de $r$ e $\\theta$ sao:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0\\le r\\le 3,\\ 0\\le\\theta\\le 2\\pi$",
                                isCorrect: true,
                            },
                            {
                                text: "$0\\le r\\le 9,\\ 0\\le\\theta\\le 2\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$0\\le r\\le 3,\\ 0\\le\\theta\\le \\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$0\\le r\\le 9,\\ 0\\le\\theta\\le \\pi$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Calcule $\\iiint_E \\sqrt{x^2+y^2}\\,dV$ no cilindro $x^2+y^2\\le 16$ entre $z=-5$ e $z=4$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$384\\pi$",
                                isCorrect: true,
                            },
                            {
                                text: "$144\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$192\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$1152\\pi$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Coordenadas esfericas",
                blocks: [
                    {
                        type: "text",
                        value: "## Coordenadas esfericas\n\nSolidos com simetria em torno de um **ponto**, como bolas e cascas esfericas, ou limitados por cones, pedem **coordenadas esfericas**. Um ponto e dado por $(\\rho,\\phi,\\theta)$, onde $\\rho\\ge 0$ e a distancia ate a origem, $\\phi$ e o angulo medido a partir do eixo $z$ positivo (com $0\\le\\phi\\le\\pi$) e $\\theta$ e o mesmo angulo azimutal das cilindricas (com $0\\le\\theta\\le 2\\pi$). As conversoes sao\n\n$$x = \\rho\\sin\\phi\\cos\\theta,\\qquad y = \\rho\\sin\\phi\\sin\\theta,\\qquad z = \\rho\\cos\\phi,$$\n\ne ainda $\\rho^2 = x^2+y^2+z^2$.",
                    },
                    {
                        type: "text",
                        value: "## O elemento de volume\n\nO jacobiano da transformacao esferica e $\\rho^2\\sin\\phi$, portanto o elemento de volume e\n\n$$dV = \\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta.$$\n\nAssim como o $r$ das cilindricas, esse fator $\\rho^2\\sin\\phi$ nunca pode ser esquecido. A formula de mudanca de variaveis fica\n\n$$\\iiint_E f\\,dV = \\int_\\alpha^\\beta\\int_{\\phi_1}^{\\phi_2}\\int_{\\rho_1}^{\\rho_2} f(\\rho\\sin\\phi\\cos\\theta,\\, \\rho\\sin\\phi\\sin\\theta,\\, \\rho\\cos\\phi)\\ \\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta.$$",
                    },
                    {
                        type: "text",
                        value: "## Os tres sistemas e seus jacobianos\n\nReunindo os sistemas de coordenadas e o jacobiano de cada mudanca:\n\n| Sistema | Elemento de volume $dV$ | Jacobiano |\n| --- | --- | --- |\n| Cartesiano | $dz\\,dy\\,dx$ | $1$ |\n| Cilindrico | $r\\,dz\\,dr\\,d\\theta$ | $r$ |\n| Esferico | $\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$ | $\\rho^2\\sin\\phi$ |\n\nEscolher o sistema certo e metade do trabalho: cartesianas para caixas e solidos poliedricos, cilindricas para simetria axial e esfericas para simetria em torno da origem.",
                    },
                    {
                        type: "quote",
                        value: "Diante de uma esfera ou de um cone saindo da origem, troque para esfericas antes de escrever qualquer limite.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: volume da bola\n\nCalcule o volume da bola de raio $a$ centrada na origem.\n\nA bola e descrita por $0\\le\\rho\\le a$, $0\\le\\phi\\le\\pi$ e $0\\le\\theta\\le 2\\pi$, limites todos constantes. Entao\n\n$$V = \\int_0^{2\\pi}\\int_0^{\\pi}\\int_0^{a} \\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta.$$\n\nComo os limites sao constantes e o integrando se separa,\n\n$$V = \\left(\\int_0^{2\\pi}\\!d\\theta\\right)\\left(\\int_0^{\\pi}\\sin\\phi\\,d\\phi\\right)\\left(\\int_0^{a}\\rho^2\\,d\\rho\\right) = 2\\pi\\cdot 2\\cdot\\frac{a^3}{3} = \\frac{4\\pi a^3}{3}.$$\n\nRecuperamos a conhecida formula do volume da esfera.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: uma integral so tratavel em esfericas\n\nCalcule $\\iiint_B e^{(x^2+y^2+z^2)^{3/2}}\\,dV$, onde $B$ e a bola unitaria $x^2+y^2+z^2\\le 1$.\n\nO expoente e $(x^2+y^2+z^2)^{3/2} = (\\rho^2)^{3/2} = \\rho^3$, o que so fica tratavel em esfericas. Os limites sao $0\\le\\rho\\le 1$, $0\\le\\phi\\le\\pi$, $0\\le\\theta\\le 2\\pi$:\n\n$$\\int_0^{2\\pi}\\int_0^{\\pi}\\int_0^{1} e^{\\rho^3}\\,\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta.$$\n\nAs partes em $\\theta$ e $\\phi$ dao $2\\pi$ e $2$. Na parte radial, a substituicao $u=\\rho^3$, $du = 3\\rho^2\\,d\\rho$, leva a $\\int_0^1 \\rho^2 e^{\\rho^3}\\,d\\rho = \\tfrac{1}{3}(e-1)$. Portanto\n\n$$\\iiint_B e^{(x^2+y^2+z^2)^{3/2}}\\,dV = 2\\pi\\cdot 2\\cdot\\tfrac{1}{3}(e-1) = \\frac{4\\pi}{3}(e-1).$$",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Em esfericas, $x=\\rho\\sin\\phi\\cos\\theta$, $y=\\rho\\sin\\phi\\sin\\theta$, $z=\\rho\\cos\\phi$, e $dV = \\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$.\n- $\\phi$ e o angulo a partir do eixo $z$ (entre $0$ e $\\pi$); $\\theta$ e o giro em torno desse eixo (entre $0$ e $2\\pi$).\n- Esferas, cones e regioes limitadas por eles costumam ter limites constantes ou muito simples nesse sistema.\n- O fator $\\rho^2\\sin\\phi$ acompanha sempre o integrando.",
                    },
                ],
                questions: [
                    {
                        statement: "Em coordenadas esfericas, o elemento de volume e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$dV = \\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$dV = \\rho\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$dV = \\rho^2\\,d\\rho\\,d\\phi\\,d\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$dV = \\rho^2\\sin\\phi\\cos\\theta\\,d\\rho\\,d\\phi\\,d\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Nas coordenadas esfericas, a coordenada $z$ e dada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$z = \\rho\\cos\\phi$",
                                isCorrect: true,
                            },
                            {
                                text: "$z = \\rho\\sin\\phi$",
                                isCorrect: false,
                            },
                            {
                                text: "$z = \\rho\\cos\\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$z = \\rho\\sin\\phi\\cos\\theta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O intervalo de variacao do angulo $\\phi$ (medido a partir do eixo $z$) e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0\\le\\phi\\le\\pi$",
                                isCorrect: true,
                            },
                            {
                                text: "$0\\le\\phi\\le 2\\pi$",
                                isCorrect: false,
                            },
                            {
                                text: "$0\\le\\phi\\le\\tfrac{\\pi}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\pi\\le\\phi\\le\\pi$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O volume da bola de raio $2$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{32\\pi}{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{16\\pi}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{8\\pi}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$32\\pi$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Calcule $\\iiint_B e^{(x^2+y^2+z^2)^{3/2}}\\,dV$ na bola unitaria.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{4\\pi}{3}(e-1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$4\\pi(e-1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{2\\pi}{3}(e-1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{4\\pi}{3}\\,e$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Aplicacoes: volume, massa e centro de massa",
                blocks: [
                    {
                        type: "text",
                        value: "## Volume e massa\n\nAs integrais triplas medem grandezas fisicas de solidos. A mais direta e o **volume**, obtido integrando a funcao constante $1$:\n\n$$V(E) = \\iiint_E dV.$$\n\nSe o solido tem densidade variavel $\\delta(x,y,z)$, isto e, massa por unidade de volume, a **massa** total e\n\n$$m = \\iiint_E \\delta(x,y,z)\\,dV.$$\n\nUsamos $\\delta$ para a densidade a fim de nao confundir com a coordenada esferica $\\rho$.",
                    },
                    {
                        type: "text",
                        value: "## Momentos e centro de massa\n\nO **centro de massa** e o ponto $(\\bar{x},\\bar{y},\\bar{z})$ onde o solido se equilibraria. Suas coordenadas usam os **momentos** em relacao aos planos coordenados:\n\n$$M_{yz} = \\iiint_E x\\,\\delta\\,dV,\\qquad M_{xz} = \\iiint_E y\\,\\delta\\,dV,\\qquad M_{xy} = \\iiint_E z\\,\\delta\\,dV.$$\n\nCada coordenada e um momento dividido pela massa:\n\n$$\\bar{x} = \\frac{M_{yz}}{m},\\qquad \\bar{y} = \\frac{M_{xz}}{m},\\qquad \\bar{z} = \\frac{M_{xy}}{m}.$$\n\nQuando a densidade e constante, o centro de massa depende so da forma e recebe o nome de **centroide**.",
                    },
                    {
                        type: "quote",
                        value: "Massa e a densidade somada por todo o solido; centro de massa e a media das posicoes, ponderada por essa densidade.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: massa e centro de massa de um cubo\n\nUm cubo ocupa $E = [0,1]^3$ e tem densidade $\\delta(x,y,z) = x+y+z$. Encontre a massa e o centro de massa.\n\nA massa e $m = \\iiint_E (x+y+z)\\,dV = \\tfrac{3}{2}$, como calculado na primeira aula. Por simetria do cubo e da densidade, $\\bar{x} = \\bar{y} = \\bar{z}$, entao basta um momento:\n\n$$M_{yz} = \\iiint_E x(x+y+z)\\,dV = \\iiint_E (x^2 + xy + xz)\\,dV = \\tfrac{1}{3} + \\tfrac{1}{4} + \\tfrac{1}{4} = \\tfrac{5}{6}.$$\n\nLogo $\\bar{x} = \\dfrac{M_{yz}}{m} = \\dfrac{5/6}{3/2} = \\dfrac{5}{9}$, e o centro de massa e $\\left(\\tfrac{5}{9}, \\tfrac{5}{9}, \\tfrac{5}{9}\\right)$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: massa de um hemisferio\n\nEncontre a massa de um hemisferio solido de raio $a$ (metade superior da bola) cuja densidade e proporcional a distancia ao centro, $\\delta = K\\rho$.\n\nEm esfericas, o hemisferio e $0\\le\\rho\\le a$, $0\\le\\phi\\le\\tfrac{\\pi}{2}$, $0\\le\\theta\\le 2\\pi$. Com $dV = \\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$ e $\\delta = K\\rho$:\n\n$$m = \\int_0^{2\\pi}\\int_0^{\\pi/2}\\int_0^{a} K\\rho\\cdot\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta = K\\int_0^{2\\pi}\\!d\\theta\\int_0^{\\pi/2}\\sin\\phi\\,d\\phi\\int_0^a \\rho^3\\,d\\rho.$$\n\nOs fatores valem $2\\pi$, $1$ e $\\tfrac{a^4}{4}$, entao\n\n$$m = K\\cdot 2\\pi\\cdot 1\\cdot\\frac{a^4}{4} = \\frac{K\\pi a^4}{2}.$$",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Volume integra $1$, massa integra a densidade $\\delta$, e cada coordenada do centro de massa e um momento dividido pela massa.\n- Os momentos $M_{yz}$, $M_{xz}$ e $M_{xy}$ pesam, respectivamente, $x$, $y$ e $z$ pela densidade.\n- Escolha o sistema de coordenadas pela geometria do solido e pela forma da densidade.\n- Use as simetrias para prever igualdades entre coordenadas e poupar contas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A massa de um solido $E$ com densidade $\\delta(x,y,z)$ e dada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$m = \\iiint_E \\delta\\,dV$",
                                isCorrect: true,
                            },
                            {
                                text: "$m = \\iiint_E dV$",
                                isCorrect: false,
                            },
                            {
                                text: "$m = \\iint_E \\delta\\,dA$",
                                isCorrect: false,
                            },
                            {
                                text: "$m = \\iiint_E \\delta^2\\,dV$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O volume de um solido $E$ e calculado por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\iiint_E dV$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\iiint_E \\delta\\,dV$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\iint_E dA$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\iiint_E (x+y+z)\\,dV$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A coordenada $\\bar{x}$ do centro de massa e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\bar{x} = \\dfrac{M_{yz}}{m}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\bar{x} = \\dfrac{M_{xy}}{m}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\bar{x} = \\dfrac{m}{M_{yz}}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\bar{x} = M_{yz}\\,m$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um cubo $[0,1]^3$ tem densidade constante $\\delta_0$. Sua massa e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\delta_0$",
                                isCorrect: true,
                            },
                            {
                                text: "$3\\delta_0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tfrac{\\delta_0}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tfrac{3\\delta_0}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No cubo $[0,1]^3$ com densidade $\\delta=x+y+z$ (massa $\\tfrac{3}{2}$) e $M_{yz}=\\tfrac{5}{6}$, a coordenada $\\bar{x}$ e:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{5}{9}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{9}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{5}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Cálculo vetorial",
        aulas: [
            {
                titulo: "Campos vetoriais",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é um campo vetorial\n\nAté aqui estudamos funções que associam a cada ponto um número real, os campos escalares. No cálculo vetorial passamos a trabalhar com **campos vetoriais**, que associam a cada ponto do plano ou do espaço um **vetor**.\n\nPense no mapa de ventos de uma previsão do tempo: em cada ponto da cidade existe uma seta indicando a direção e a intensidade do vento naquele local. Essa é exatamente a ideia de um campo vetorial.",
                    },
                    {
                        type: "text",
                        value: "## Definição\n\nUm campo vetorial no plano é uma função que a cada ponto $(x, y)$ associa um vetor\n\n$$\\vec{F}(x, y) = P(x, y)\\,\\vec{i} + Q(x, y)\\,\\vec{j} = (P, Q)$$\n\nAs funções $P$ e $Q$ são as **componentes** do campo e são campos escalares comuns. No espaço, o campo passa a ter três componentes:\n\n$$\\vec{F}(x, y, z) = (P, Q, R)$$\n\nDizemos que o campo é contínuo, ou diferenciável, quando todas as suas componentes são contínuas, ou diferenciáveis.",
                    },
                    {
                        type: "text",
                        value: "## Alguns campos importantes\n\n**Campo radial:** $\\vec{F}(x, y) = (x, y)$. Em cada ponto o vetor aponta para longe da origem, com comprimento crescente conforme nos afastamos dela. É o padrão de uma fonte que empurra tudo para fora.\n\n**Campo de rotação:** $\\vec{F}(x, y) = (-y, x)$. Aqui o vetor em cada ponto é perpendicular ao raio e gira no sentido anti-horário. É o modelo de um fluido que roda em torno da origem.",
                    },
                    {
                        type: "text",
                        value: "## Campos gradiente\n\nUma fonte natural de campos vetoriais é o **gradiente** de uma função escalar $f$. O gradiente\n\n$$\\nabla f = \\left( \\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y} \\right)$$\n\né um campo vetorial que, em cada ponto, aponta na direção de maior crescimento de $f$.\n\nQuando um campo $\\vec{F}$ pode ser escrito como $\\vec{F} = \\nabla f$, dizemos que $f$ é uma **função potencial** de $\\vec{F}$. Voltaremos a essa ideia na aula sobre campos conservativos.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nAvalie o campo $\\vec{F}(x, y) = (x^2, x y)$ no ponto $(2, 3)$ e descreva o vetor obtido.\n\n**Passo 1.** Substituímos as coordenadas nas componentes:\n$$P(2, 3) = 2^2 = 4, \\qquad Q(2, 3) = 2 \\cdot 3 = 6$$\n\n**Passo 2.** Escrevemos o vetor:\n$$\\vec{F}(2, 3) = (4, 6)$$\n\nNo ponto $(2, 3)$ o campo aponta na direção do vetor $(4, 6)$, ou seja, para cima e para a direita.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nEncontre o campo gradiente de $f(x, y) = x^2 + y^2$.\n\n**Passo 1.** Calculamos as derivadas parciais:\n$$\\frac{\\partial f}{\\partial x} = 2x, \\qquad \\frac{\\partial f}{\\partial y} = 2y$$\n\n**Passo 2.** Montamos o gradiente:\n$$\\nabla f = (2x, 2y)$$\n\nEsse é o campo radial multiplicado por $2$: em cada ponto o vetor aponta para fora da origem, coerente com o fato de que $f$ cresce ao nos afastarmos dela.",
                    },
                    {
                        type: "quote",
                        value: "Um campo vetorial é a maneira do cálculo enxergar o mundo em movimento: a cada lugar, uma direção e uma intensidade.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Um campo vetorial associa a cada ponto um vetor, cujas componentes são campos escalares.\n- No plano escrevemos $\\vec{F} = (P, Q)$ e no espaço $\\vec{F} = (P, Q, R)$.\n- Campos radiais apontam para fora da origem e campos de rotação giram em torno dela.\n- O gradiente $\\nabla f$ é um campo vetorial, e quando $\\vec{F} = \\nabla f$ chamamos $f$ de função potencial.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Avalie o campo $\\vec{F}(x, y) = (x^2, x y)$ no ponto $(2, 3)$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(6, 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(4, 6)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(4, 9)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 6)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O campo gradiente de $f(x, y) = x^2 + y^2$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(x^2, y^2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x, y)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2x, 2y)$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "O campo gradiente de $f(x, y) = x^2 y$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(2xy, x^2)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(x^2, 2xy)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2xy, 2xy)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2x, x^2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual campo vetorial descreve uma rotação anti-horária em torno da origem?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\vec{F}(x, y) = (x, y)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{F}(x, y) = (y, x)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{F}(x, y) = (-y, x)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\vec{F}(x, y) = (x, -y)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Sobre campos vetoriais, qual afirmação está correta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Um campo vetorial associa um número real a cada ponto do plano.",
                                isCorrect: false,
                            },
                            {
                                text: "Um campo vetorial associa um vetor a cada ponto.",
                                isCorrect: true,
                            },
                            {
                                text: "O gradiente de uma função escalar é um campo escalar.",
                                isCorrect: false,
                            },
                            {
                                text: "Todo campo vetorial é o gradiente de alguma função.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Integral de linha",
                blocks: [
                    {
                        type: "text",
                        value: "## Integrando ao longo de uma curva\n\nA integral definida $\\int_a^b f(x)\\,dx$ soma valores de uma função ao longo de um segmento do eixo $x$. A **integral de linha** generaliza essa ideia: em vez de integrar sobre um intervalo reto, integramos ao longo de uma curva $C$ qualquer no plano ou no espaço.\n\nExistem dois tipos principais: a integral de linha de um campo escalar e a integral de linha de um campo vetorial. Vamos ver as duas.",
                    },
                    {
                        type: "text",
                        value: "## Integral de linha de um campo escalar\n\nSeja $C$ uma curva descrita pela parametrização $\\vec{r}(t) = (x(t), y(t))$, com $a \\le t \\le b$. A integral de linha de uma função $f$ ao longo de $C$ é\n\n$$\\int_C f(x, y)\\,ds = \\int_a^b f(x(t), y(t))\\,\\left| \\vec{r}'(t) \\right|\\,dt$$\n\nO termo $ds = \\left| \\vec{r}'(t) \\right|\\,dt$ é o **elemento de comprimento de arco**. Quando $f = 1$, a integral devolve o comprimento da curva.",
                    },
                    {
                        type: "text",
                        value: "## Integral de linha de um campo vetorial\n\nSe $\\vec{F}$ é um campo de forças, o trabalho realizado para mover uma partícula ao longo de $C$ é dado pela integral de linha do campo:\n\n$$\\int_C \\vec{F} \\cdot d\\vec{r} = \\int_a^b \\vec{F}(\\vec{r}(t)) \\cdot \\vec{r}'(t)\\,dt$$\n\nA ideia é somar, em cada instante, a componente do campo na direção do movimento. Diferente da integral escalar, aqui o **sentido de percurso importa**: inverter a orientação da curva troca o sinal da integral.",
                    },
                    {
                        type: "text",
                        value: "## A forma $P\\,dx + Q\\,dy$\n\nEscrevendo $\\vec{F} = (P, Q)$ e $d\\vec{r} = (dx, dy)$, o produto escalar dentro da integral se torna\n\n$$\\int_C \\vec{F} \\cdot d\\vec{r} = \\int_C P\\,dx + Q\\,dy$$\n\nEssa notação é muito usada e será a forma que aparece no teorema de Green. Para calcular, substituímos $x = x(t)$, $y = y(t)$, $dx = x'(t)\\,dt$ e $dy = y'(t)\\,dt$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nCalcule $\\int_C \\vec{F} \\cdot d\\vec{r}$, com $\\vec{F}(x, y) = (y, x)$, ao longo da curva $\\vec{r}(t) = (t, t^2)$, $0 \\le t \\le 1$.\n\n**Passo 1.** Derivada da parametrização: $\\vec{r}'(t) = (1, 2t)$.\n\n**Passo 2.** Campo sobre a curva: como $x = t$ e $y = t^2$, temos $\\vec{F}(\\vec{r}(t)) = (t^2, t)$.\n\n**Passo 3.** Produto escalar:\n$$\\vec{F}(\\vec{r}(t)) \\cdot \\vec{r}'(t) = (t^2)(1) + (t)(2t) = t^2 + 2t^2 = 3t^2$$\n\n**Passo 4.** Integramos:\n$$\\int_0^1 3t^2\\,dt = \\left[ t^3 \\right]_0^1 = 1$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nCalcule $\\int_C x\\,ds$, onde $C$ é o segmento de reta de $(0, 0)$ a $(1, 1)$.\n\n**Passo 1.** Parametrizamos o segmento por $\\vec{r}(t) = (t, t)$, com $0 \\le t \\le 1$. Então $\\vec{r}'(t) = (1, 1)$.\n\n**Passo 2.** Elemento de arco: $\\left| \\vec{r}'(t) \\right| = \\sqrt{1^2 + 1^2} = \\sqrt{2}$, logo $ds = \\sqrt{2}\\,dt$.\n\n**Passo 3.** Como $x = t$, a integral fica\n$$\\int_0^1 t \\sqrt{2}\\,dt = \\sqrt{2} \\cdot \\left[ \\frac{t^2}{2} \\right]_0^1 = \\frac{\\sqrt{2}}{2}$$",
                    },
                    {
                        type: "quote",
                        value: "Integrar ao longo de uma curva é medir o efeito acumulado de um campo por todo o caminho percorrido, e não apenas nos seus extremos.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A integral de linha estende a integral definida para curvas quaisquer.\n- Para um campo escalar usamos $\\int_C f\\,ds$, com $ds = \\left| \\vec{r}'(t) \\right|\\,dt$.\n- Para um campo vetorial usamos $\\int_C \\vec{F} \\cdot d\\vec{r} = \\int_a^b \\vec{F}(\\vec{r}(t)) \\cdot \\vec{r}'(t)\\,dt$, que mede trabalho.\n- A integral vetorial depende do sentido de percurso; inverter a orientação troca o sinal.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A integral $\\int_C \\vec{F} \\cdot d\\vec{r}$ de um campo de forças representa fisicamente:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "o comprimento total da curva percorrida.",
                                isCorrect: false,
                            },
                            {
                                text: "a área da região sob a curva.",
                                isCorrect: false,
                            },
                            {
                                text: "o trabalho realizado pela força.",
                                isCorrect: true,
                            },
                            {
                                text: "a massa da curva material.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para a parametrização $\\vec{r}(t) = (t, t)$, o vetor $\\vec{r}'(t)$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(1, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(t, t)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Calcule $\\int_C \\vec{F} \\cdot d\\vec{r}$ com $\\vec{F}(x, y) = (x, y)$ e $\\vec{r}(t) = (t, t)$, $0 \\le t \\le 1$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}$",
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
                    {
                        statement:
                            "Ao inverter o sentido de percurso de uma curva $C$, a integral $\\int_C \\vec{F} \\cdot d\\vec{r}$:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "permanece igual.",
                                isCorrect: false,
                            },
                            {
                                text: "troca de sinal.",
                                isCorrect: true,
                            },
                            {
                                text: "dobra de valor.",
                                isCorrect: false,
                            },
                            {
                                text: "se anula.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Calcule $\\int_C \\vec{F} \\cdot d\\vec{r}$ com $\\vec{F}(x, y) = (y^2, x)$ e $\\vec{r}(t) = (t, t^2)$, $0 \\le t \\le 1$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{2}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{13}{15}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{11}{15}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Campos conservativos e independência do caminho",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando o caminho não importa\n\nVimos que a integral de linha de um campo vetorial costuma depender da curva escolhida. Existe, porém, uma classe especial de campos para os quais a integral depende apenas dos pontos inicial e final: os **campos conservativos**. Eles aparecem naturalmente na física, por exemplo na força gravitacional e na força elétrica.",
                    },
                    {
                        type: "text",
                        value: "## Campo conservativo e função potencial\n\nUm campo vetorial $\\vec{F}$ é **conservativo** quando existe uma função escalar $f$ tal que\n\n$$\\vec{F} = \\nabla f$$\n\nA função $f$ é chamada **função potencial** de $\\vec{F}$. Em outras palavras, um campo conservativo é exatamente um campo gradiente.",
                    },
                    {
                        type: "text",
                        value: "## Teorema fundamental das integrais de linha\n\nSe $\\vec{F} = \\nabla f$ é contínuo e $C$ é uma curva que vai do ponto $A$ ao ponto $B$, então\n\n$$\\int_C \\vec{F} \\cdot d\\vec{r} = f(B) - f(A)$$\n\nA integral depende só dos valores do potencial nos extremos, e não do trajeto. Esse resultado é o análogo, para curvas, do teorema fundamental do cálculo.",
                    },
                    {
                        type: "text",
                        value: "## Independência do caminho e curvas fechadas\n\nUma consequência direta é a **independência do caminho**: se $C_1$ e $C_2$ têm os mesmos extremos, então\n\n$$\\int_{C_1} \\vec{F} \\cdot d\\vec{r} = \\int_{C_2} \\vec{F} \\cdot d\\vec{r}$$\n\nE se a curva for **fechada**, os pontos inicial e final coincidem, de modo que\n\n$$\\oint_C \\vec{F} \\cdot d\\vec{r} = 0$$\n\npara todo campo conservativo.",
                    },
                    {
                        type: "text",
                        value: "## Teste para campos conservativos no plano\n\nComo saber se $\\vec{F} = (P, Q)$ é conservativo sem procurar o potencial? Se $P$ e $Q$ têm derivadas parciais contínuas em uma região **simplesmente conexa**, isto é, sem buracos, então $\\vec{F}$ é conservativo se, e somente se,\n\n$$\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}$$\n\nSe as duas derivadas cruzadas forem diferentes, o campo não é conservativo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nVerifique se $\\vec{F}(x, y) = (2xy, x^2)$ é conservativo e, em caso afirmativo, encontre uma função potencial.\n\n**Passo 1.** Aplicamos o teste com $P = 2xy$ e $Q = x^2$:\n$$\\frac{\\partial P}{\\partial y} = 2x, \\qquad \\frac{\\partial Q}{\\partial x} = 2x$$\nComo são iguais, o campo é conservativo.\n\n**Passo 2.** Procuramos $f$ com $\\frac{\\partial f}{\\partial x} = 2xy$. Integrando em $x$:\n$$f(x, y) = x^2 y + g(y)$$\n\n**Passo 3.** Derivamos em $y$ e comparamos com $Q$: $\\frac{\\partial f}{\\partial y} = x^2 + g'(y) = x^2$, logo $g'(y) = 0$ e $g$ é constante. Uma função potencial é\n$$f(x, y) = x^2 y$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nUsando o potencial $f(x, y) = x^2 y$ do exemplo anterior, calcule $\\int_C \\vec{F} \\cdot d\\vec{r}$ ao longo de qualquer curva de $(0, 0)$ a $(1, 2)$.\n\n**Passo 1.** Pelo teorema fundamental das integrais de linha, basta avaliar o potencial nos extremos:\n$$\\int_C \\vec{F} \\cdot d\\vec{r} = f(1, 2) - f(0, 0)$$\n\n**Passo 2.** Calculamos: $f(1, 2) = 1^2 \\cdot 2 = 2$ e $f(0, 0) = 0$. Portanto\n$$\\int_C \\vec{F} \\cdot d\\vec{r} = 2 - 0 = 2$$\n\nRepare que não foi preciso parametrizar a curva: o resultado vale para qualquer caminho entre esses dois pontos.",
                    },
                    {
                        type: "quote",
                        value: "Em um campo conservativo, o que importa não é a viagem, mas apenas de onde você partiu e aonde chegou.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Um campo é conservativo quando é o gradiente de uma função potencial, $\\vec{F} = \\nabla f$.\n- Nesse caso vale $\\int_C \\vec{F} \\cdot d\\vec{r} = f(B) - f(A)$, dependendo só dos extremos.\n- Em curvas fechadas, a integral de um campo conservativo é zero.\n- No plano, em região simplesmente conexa, o teste é $\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}$.",
                    },
                ],
                questions: [
                    {
                        statement: "Um campo vetorial $\\vec{F}$ é conservativo quando:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "existe $f$ com $\\vec{F} = \\nabla f$.",
                                isCorrect: true,
                            },
                            {
                                text: "suas componentes são constantes.",
                                isCorrect: false,
                            },
                            {
                                text: "sua integral de linha é sempre positiva.",
                                isCorrect: false,
                            },
                            {
                                text: "ele é perpendicular a toda curva.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No plano, o teste para um campo $\\vec{F} = (P, Q)$ ser conservativo é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{\\partial P}{\\partial x} = \\frac{\\partial Q}{\\partial y}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\partial P}{\\partial x} = \\frac{\\partial Q}{\\partial x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\partial P}{\\partial y} = -\\frac{\\partial Q}{\\partial x}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre o campo $\\vec{F}(x, y) = (y, x)$, é correto afirmar que:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "não é conservativo.",
                                isCorrect: false,
                            },
                            {
                                text: "é conservativo, com potencial $f(x, y) = xy$.",
                                isCorrect: true,
                            },
                            {
                                text: "é conservativo, com potencial $f(x, y) = x + y$.",
                                isCorrect: false,
                            },
                            {
                                text: "é conservativo, com potencial $f(x, y) = y^2 - x^2$.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $\\vec{F} = \\nabla f$ com $f(x, y) = xy$, calcule $\\int_C \\vec{F} \\cdot d\\vec{r}$ de $(1, 1)$ a $(3, 2)$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$6$",
                                isCorrect: false,
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
                                text: "$5$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Qual dos campos abaixo NÃO é conservativo?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\vec{F}(x, y) = (y, x)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{F}(x, y) = (2x, 2y)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{F}(x, y) = (y, -x)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\vec{F}(x, y) = (2xy, x^2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O teorema de Green",
                blocks: [
                    {
                        type: "text",
                        value: "## Ligando a fronteira ao interior\n\nO teorema de Green é uma das joias do cálculo vetorial. Ele conecta uma integral de linha ao redor de uma curva fechada com uma integral dupla sobre a região delimitada por essa curva. Em outras palavras, transforma um problema na **fronteira** em um problema no **interior**, e muitas vezes o segundo é bem mais fácil de resolver.",
                    },
                    {
                        type: "text",
                        value: "## Enunciado\n\nSeja $C$ uma curva fechada simples, orientada positivamente e suave por partes, e seja $R$ a região limitada por $C$. Se $P$ e $Q$ têm derivadas parciais contínuas em uma região aberta que contém $R$, então\n\n$$\\oint_C P\\,dx + Q\\,dy = \\iint_R \\left( \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right) dA$$\n\nO símbolo $\\oint$ indica que a integral de linha é feita sobre uma curva fechada.",
                    },
                    {
                        type: "text",
                        value: "## Orientação positiva\n\nA **orientação positiva** de $C$ é o sentido anti-horário, aquele em que a região $R$ fica sempre à esquerda de quem percorre a curva. Se a curva for percorrida no sentido horário, o resultado troca de sinal.\n\nPrestar atenção à orientação é essencial: um erro de sentido leva a uma resposta com o sinal invertido.",
                    },
                    {
                        type: "text",
                        value: "## Cálculo de áreas\n\nEscolhendo $P$ e $Q$ de modo que $\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = 1$, a integral dupla se torna a própria área de $R$. Uma escolha simétrica muito usada leva à fórmula\n\n$$A = \\frac{1}{2} \\oint_C x\\,dy - y\\,dx$$\n\nAssim, é possível calcular a área de uma região usando apenas informação da sua fronteira.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nCalcule $\\oint_C -y\\,dx + x\\,dy$, onde $C$ é o círculo de raio $1$ centrado na origem, orientado no sentido anti-horário.\n\n**Passo 1.** Aqui $P = -y$ e $Q = x$. As derivadas parciais são\n$$\\frac{\\partial Q}{\\partial x} = 1, \\qquad \\frac{\\partial P}{\\partial y} = -1$$\n\n**Passo 2.** O integrando de Green é\n$$\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = 1 - (-1) = 2$$\n\n**Passo 3.** Aplicamos o teorema:\n$$\\oint_C -y\\,dx + x\\,dy = \\iint_R 2\\,dA = 2 \\cdot \\text{área}(R)$$\n\nComo $R$ é o disco de raio $1$, sua área é $\\pi$. Logo o resultado é $2\\pi$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nCalcule $\\oint_C x^2\\,dx + xy\\,dy$, onde $C$ é a fronteira do triângulo de vértices $(0, 0)$, $(1, 0)$ e $(0, 1)$, no sentido anti-horário.\n\n**Passo 1.** Com $P = x^2$ e $Q = xy$:\n$$\\frac{\\partial Q}{\\partial x} = y, \\qquad \\frac{\\partial P}{\\partial y} = 0$$\nO integrando de Green é $y - 0 = y$.\n\n**Passo 2.** A região $R$ é o triângulo onde $0 \\le x \\le 1$ e $0 \\le y \\le 1 - x$. Montamos a integral dupla:\n$$\\iint_R y\\,dA = \\int_0^1 \\int_0^{1-x} y\\,dy\\,dx$$\n\n**Passo 3.** Integramos em $y$:\n$$\\int_0^{1-x} y\\,dy = \\frac{(1-x)^2}{2}$$\n\n**Passo 4.** Integramos em $x$:\n$$\\int_0^1 \\frac{(1-x)^2}{2}\\,dx = \\frac{1}{2} \\cdot \\frac{1}{3} = \\frac{1}{6}$$",
                    },
                    {
                        type: "quote",
                        value: "O teorema de Green é uma ponte: ele nos deixa atravessar livremente entre o que acontece na borda e o que acontece dentro da região.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O teorema de Green transforma uma integral de linha fechada em uma integral dupla sobre a região interior.\n- A fórmula é $\\oint_C P\\,dx + Q\\,dy = \\iint_R \\left( \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right) dA$.\n- A orientação positiva é o sentido anti-horário; o sentido horário inverte o sinal.\n- Tomando o integrando igual a $1$, obtemos a área da região a partir da fronteira.",
                    },
                ],
                questions: [
                    {
                        statement: "No teorema de Green, o integrando da integral dupla é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{\\partial P}{\\partial x} - \\frac{\\partial Q}{\\partial y}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\partial P}{\\partial y} - \\frac{\\partial Q}{\\partial x}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\partial Q}{\\partial x} + \\frac{\\partial P}{\\partial y}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "A orientação positiva de uma curva fechada no teorema de Green é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "o sentido anti-horário.",
                                isCorrect: true,
                            },
                            {
                                text: "o sentido horário.",
                                isCorrect: false,
                            },
                            {
                                text: "do ponto mais alto ao mais baixo.",
                                isCorrect: false,
                            },
                            {
                                text: "da direita para a esquerda.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Calcule $\\oint_C -y\\,dx + x\\,dy$, onde $C$ delimita, no sentido positivo, uma região de área $5$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$10$",
                                isCorrect: true,
                            },
                            {
                                text: "$-10$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{5}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Pelo teorema de Green, a integral $\\oint_C x\\,dy$ ao longo da fronteira de $R$ é igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "o dobro da área de $R$.",
                                isCorrect: false,
                            },
                            {
                                text: "o perímetro de $R$.",
                                isCorrect: false,
                            },
                            {
                                text: "a área da região $R$.",
                                isCorrect: true,
                            },
                            {
                                text: "zero.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Calcule $\\oint_C y\\,dx + 2x\\,dy$, onde $C$ é a fronteira do quadrado $[0, 1] \\times [0, 1]$ no sentido anti-horário.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$-1$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Divergente e rotacional",
                blocks: [
                    {
                        type: "text",
                        value: "## Duas medidas de um campo\n\nDado um campo vetorial, duas operações revelam muito sobre o seu comportamento local: o **divergente**, que mede o quanto o campo se espalha a partir de um ponto, e o **rotacional**, que mede o quanto ele gira em torno de um ponto. As duas se escrevem de forma elegante com o operador nabla $\\nabla$.",
                    },
                    {
                        type: "text",
                        value: "## Divergente\n\nO divergente de um campo $\\vec{F} = (P, Q, R)$ é o **escalar**\n\n$$\\nabla \\cdot \\vec{F} = \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z}$$\n\nEle mede o fluxo líquido que sai de um ponto. Onde $\\nabla \\cdot \\vec{F} > 0$ há uma fonte, o campo se espalha, e onde $\\nabla \\cdot \\vec{F} < 0$ há um sorvedouro, o campo converge. Repare que o resultado é um número, não um vetor.",
                    },
                    {
                        type: "text",
                        value: "## Rotacional\n\nO rotacional de $\\vec{F} = (P, Q, R)$ é o **vetor**\n\n$$\\nabla \\times \\vec{F} = \\left( \\frac{\\partial R}{\\partial y} - \\frac{\\partial Q}{\\partial z},\\ \\frac{\\partial P}{\\partial z} - \\frac{\\partial R}{\\partial x},\\ \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right)$$\n\nEle mede a tendência do campo a girar em torno de cada ponto. A direção do rotacional é o eixo de rotação e o seu comprimento indica a intensidade do giro. Diferente do divergente, o rotacional é um vetor.",
                    },
                    {
                        type: "text",
                        value: "## O caso do plano\n\nPara um campo plano $\\vec{F} = (P, Q)$, só sobrevive a terceira componente do rotacional, o chamado **rotacional escalar**:\n\n$$\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}$$\n\nEsse é exatamente o integrando do teorema de Green. Assim, Green pode ser lido como: a circulação de $\\vec{F}$ ao redor de $C$ é igual à integral do rotacional sobre a região interior.",
                    },
                    {
                        type: "text",
                        value: "## Rotacional e campos conservativos\n\nHá uma ligação importante com a aula anterior: todo campo conservativo tem rotacional nulo. No plano, isso é apenas outra forma de escrever o teste $\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}$, pois nesse caso o rotacional escalar $\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}$ vale zero. Campos com rotacional nulo são chamados **irrotacionais**.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nCalcule o divergente de $\\vec{F}(x, y, z) = (xy, yz, xz)$.\n\n**Passo 1.** Identificamos as componentes: $P = xy$, $Q = yz$, $R = xz$.\n\n**Passo 2.** Derivamos cada uma em relação à sua variável:\n$$\\frac{\\partial P}{\\partial x} = y, \\qquad \\frac{\\partial Q}{\\partial y} = z, \\qquad \\frac{\\partial R}{\\partial z} = x$$\n\n**Passo 3.** Somamos:\n$$\\nabla \\cdot \\vec{F} = y + z + x$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nCalcule o rotacional escalar do campo plano $\\vec{F}(x, y) = (-y, x)$.\n\n**Passo 1.** Aqui $P = -y$ e $Q = x$.\n\n**Passo 2.** Aplicamos a fórmula:\n$$\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = 1 - (-1) = 2$$\n\nO rotacional escalar é $2$, positivo e constante, coerente com o fato de esse campo girar no sentido anti-horário em todo o plano.",
                    },
                    {
                        type: "quote",
                        value: "Divergente e rotacional são dois sentidos diferentes de leitura do mesmo campo: um enxerga o espalhar, o outro enxerga o girar.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O divergente $\\nabla \\cdot \\vec{F}$ é um escalar que mede o quanto o campo se espalha a partir de um ponto.\n- O rotacional $\\nabla \\times \\vec{F}$ é um vetor que mede o quanto o campo gira em torno de um ponto.\n- No plano, o rotacional se reduz ao escalar $\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}$, o integrando de Green.\n- Campos conservativos são irrotacionais: têm rotacional nulo.",
                    },
                ],
                questions: [
                    {
                        statement: "O divergente de um campo vetorial é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "um vetor.",
                                isCorrect: false,
                            },
                            {
                                text: "um escalar.",
                                isCorrect: true,
                            },
                            {
                                text: "uma matriz.",
                                isCorrect: false,
                            },
                            {
                                text: "outro campo vetorial.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule o divergente de $\\vec{F}(x, y) = (3x, 4y)$.",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$12$",
                                isCorrect: false,
                            },
                            {
                                text: "$3x + 4y$",
                                isCorrect: false,
                            },
                            {
                                text: "$7$",
                                isCorrect: true,
                            },
                            {
                                text: "$(3, 4)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule o rotacional escalar de $\\vec{F}(x, y) = (-y, x)$.",
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
                                text: "$-2$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Calcule o divergente de $\\vec{F}(x, y, z) = (xy, yz, xz)$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$xy + yz + xz$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-y, -z, -x)$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x + y + z$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Calcule o rotacional $\\nabla \\times \\vec{F}$ de $\\vec{F}(x, y, z) = (y, -x, 0)$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$(0, 0, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, 0, -2)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(0, 0, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, -2, 0)$",
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
