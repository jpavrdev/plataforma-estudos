// Seed da trilha Álgebra Linear (sistemas, matrizes, espaços vetoriais, autovalores).
// Conteúdo autoral, quiz-only, com fórmulas em LaTeX ($...$ inline e $$...$$ em bloco,
// matrizes com pmatrix/bmatrix). Idempotente: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-algebra-linear.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Álgebra Linear";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Álgebra Linear, a base de todo curso de exatas: sistemas de equações lineares e escalonamento, matrizes e suas operações, determinantes e a regra de Cramer, vetores e espaços vetoriais (combinação linear, independência, base e dimensão), transformações lineares (núcleo, imagem e a matriz de uma transformação), autovalores, autovetores e diagonalização, e o produto interno com ortogonalidade e Gram-Schmidt. A linguagem que sustenta computação gráfica, otimização, machine learning e a física.";

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
        titulo: "Módulo 1 - Sistemas lineares e escalonamento",
        aulas: [
            {
                titulo: "Equações e sistemas lineares",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é uma equação linear\n\nUma **equação linear** nas incógnitas $x_1, x_2, \\dots, x_n$ é toda equação que pode ser escrita na forma\n\n$$a_1 x_1 + a_2 x_2 + \\dots + a_n x_n = b,$$\n\nem que os números $a_1, a_2, \\dots, a_n$ são os **coeficientes** e $b$ é o **termo independente**. A marca registrada de uma equação linear é que cada incógnita aparece elevada apenas à primeira potência, nunca multiplicada por outra incógnita nem dentro de funções como raiz, seno ou logaritmo.",
                    },
                    {
                        type: "text",
                        value: "## Linear ou não linear\n\nSão lineares, por exemplo, $2x - 3y = 5$ e $x_1 + \\frac{1}{2} x_2 - x_3 = 0$. Já não são lineares:\n\n- $x^2 + y = 1$, pois a incógnita $x$ aparece ao quadrado;\n- $xy = 4$, que traz o produto de duas incógnitas;\n- $\\sqrt{x} + y = 2$, com a incógnita dentro de uma raiz.\n\nRepare que coeficientes fracionários ou irracionais, como em $\\sqrt{2}\\,x - \\pi y = 1$, não tiram a linearidade. O que importa é o modo como as incógnitas aparecem, e não os valores dos coeficientes.",
                    },
                    {
                        type: "text",
                        value: "## Sistemas lineares\n\nUm **sistema linear** de $m$ equações e $n$ incógnitas reúne várias equações lineares consideradas ao mesmo tempo:\n\n$$\\begin{cases} a_{11} x_1 + a_{12} x_2 + \\dots + a_{1n} x_n = b_1 \\\\ a_{21} x_1 + a_{22} x_2 + \\dots + a_{2n} x_n = b_2 \\\\ \\vdots \\\\ a_{m1} x_1 + a_{m2} x_2 + \\dots + a_{mn} x_n = b_m \\end{cases}$$\n\nNo coeficiente $a_{ij}$, o primeiro índice indica a equação (a linha) e o segundo indica a incógnita (a coluna).",
                    },
                    {
                        type: "text",
                        value: "## O que é uma solução\n\nUma **solução** do sistema é uma $n$-upla ordenada $(s_1, s_2, \\dots, s_n)$ que satisfaz todas as equações ao mesmo tempo. O conjunto de todas as soluções é o **conjunto solução**. Resolver um sistema significa descrever esse conjunto, que pode ter uma única solução, infinitas soluções ou nenhuma.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nConsidere o sistema\n\n$$\\begin{cases} x + y = 5 \\\\ 2x - y = 1 \\end{cases}$$\n\nSomando as duas equações, o termo em $y$ se cancela:\n\n$$(x + y) + (2x - y) = 5 + 1 \\implies 3x = 6 \\implies x = 2.$$\n\nSubstituindo $x = 2$ na primeira equação, temos $2 + y = 5$, logo $y = 3$. A única solução é o par ordenado $(x, y) = (2, 3)$. Podemos conferir na segunda equação: $2 \\cdot 2 - 3 = 1$, exatamente como esperado.",
                    },
                    {
                        type: "text",
                        value: "## Interpretação geométrica\n\nCada equação linear em duas incógnitas representa uma **reta** no plano. Resolver um sistema com duas incógnitas equivale a procurar os pontos comuns a essas retas. Há três situações possíveis:\n\n- as retas se cruzam em um único ponto, gerando uma solução;\n- as retas são coincidentes, gerando infinitas soluções;\n- as retas são paralelas distintas, sem nenhum ponto em comum.\n\nA mesma ideia vale em dimensões maiores, trocando retas por planos e por hiperplanos.",
                    },
                    {
                        type: "quote",
                        value: "Todo sistema linear termina em um de três lugares: uma solução, infinitas soluções ou nenhuma. Nunca duas, nunca sete.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma equação linear tem a forma $a_1 x_1 + \\dots + a_n x_n = b$, com cada incógnita de grau $1$.\n- Um sistema linear reúne várias equações lineares nas mesmas incógnitas.\n- Uma solução é uma $n$-upla que satisfaz todas as equações ao mesmo tempo.\n- O conjunto solução pode ser único, infinito ou vazio, o que corresponde, no plano, a retas concorrentes, coincidentes ou paralelas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual das equações a seguir é uma equação linear nas incógnitas $x$ e $y$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$3x - 2y = 7$",
                                isCorrect: true,
                            },
                            {
                                text: "$x^2 + y = 7$",
                                isCorrect: false,
                            },
                            {
                                text: "$x y = 7$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{x} + y = 7$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual par ordenado é a solução do sistema $\\begin{cases} x + y = 7 \\\\ x - y = 1 \\end{cases}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(4, 3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(3, 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(5, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 6)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Entre as equações $2x - y = 0$, $x + 3y = 4$, $x^2 - y = 1$ e $\\frac{x}{2} + y = 5$, quantas são lineares?",
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
                            "Resolvendo o sistema $\\begin{cases} 2x + y = 8 \\\\ x - y = 1 \\end{cases}$, qual é o valor de $x$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x = 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em um sistema de duas equações e duas incógnitas, as retas correspondentes são paralelas e distintas. Sobre o conjunto solução, é correto afirmar que ele",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "é vazio, pois as retas não têm ponto em comum",
                                isCorrect: true,
                            },
                            {
                                text: "tem um único ponto, o ponto médio entre as retas",
                                isCorrect: false,
                            },
                            {
                                text: "é toda uma das retas, com infinitos pontos",
                                isCorrect: false,
                            },
                            {
                                text: "tem dois pontos, um em cada reta",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Matriz aumentada e operações elementares",
                blocks: [
                    {
                        type: "text",
                        value: "## Da equação à matriz\n\nEm vez de carregar as incógnitas o tempo todo, podemos guardar apenas os números de um sistema em uma **matriz**. Para o sistema\n\n$$\\begin{cases} a_{11} x_1 + a_{12} x_2 = b_1 \\\\ a_{21} x_1 + a_{22} x_2 = b_2 \\end{cases}$$\n\na **matriz dos coeficientes** é $\\begin{pmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{pmatrix}$ e a coluna dos termos independentes é $\\begin{pmatrix} b_1 \\\\ b_2 \\end{pmatrix}$.",
                    },
                    {
                        type: "text",
                        value: "## Matriz aumentada\n\nA **matriz aumentada** acrescenta a coluna dos termos independentes à direita da matriz dos coeficientes. Para o sistema anterior, ela é\n\n$$\\begin{pmatrix} a_{11} & a_{12} & b_1 \\\\ a_{21} & a_{22} & b_2 \\end{pmatrix},$$\n\nem que a última coluna guarda os termos independentes. Muitos livros desenham uma barra vertical antes dessa coluna, para lembrar que ela vem do outro lado da igualdade. Cada linha corresponde a uma equação e cada coluna à esquerda corresponde a uma incógnita.",
                    },
                    {
                        type: "text",
                        value: "## Operações elementares sobre linhas\n\nHá três **operações elementares** que podemos aplicar às linhas de uma matriz aumentada sem alterar o sistema que ela representa:\n\n1. **trocar** duas linhas de posição, indicado por $L_i \\leftrightarrow L_j$;\n2. **multiplicar** uma linha por um número não nulo, indicado por $L_i \\to k L_i$, com $k \\neq 0$;\n3. **somar** a uma linha um múltiplo de outra, indicado por $L_i \\to L_i + k L_j$.\n\nA exigência $k \\neq 0$ na segunda operação é essencial, pois multiplicar uma linha por zero apagaria uma equação e mudaria o problema.",
                    },
                    {
                        type: "text",
                        value: "## Por que as soluções não mudam\n\nCada operação elementar corresponde a uma manipulação legítima do sistema original: trocar a ordem das equações, multiplicar uma equação inteira por uma constante não nula ou somar uma equação a outra. Nenhuma dessas ações cria nem destrói soluções. Duas matrizes ligadas por uma sequência de operações elementares são ditas **linha-equivalentes**, e sistemas linha-equivalentes têm exatamente o mesmo conjunto solução.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nVamos zerar o primeiro elemento da segunda linha na matriz aumentada do sistema $\\begin{cases} x + 2y = 5 \\\\ 3x + y = 5 \\end{cases}$, que é\n\n$$\\begin{pmatrix} 1 & 2 & 5 \\\\ 3 & 1 & 5 \\end{pmatrix}.$$\n\nAplicamos $L_2 \\to L_2 - 3L_1$, calculando entrada por entrada: $3 - 3 \\cdot 1 = 0$, depois $1 - 3 \\cdot 2 = -5$ e por fim $5 - 3 \\cdot 5 = -10$. O resultado é\n\n$$\\begin{pmatrix} 1 & 2 & 5 \\\\ 0 & -5 & -10 \\end{pmatrix}.$$\n\nA segunda linha passa a representar $-5y = -10$, ou seja, $y = 2$.",
                    },
                    {
                        type: "text",
                        value: "## Uma observação sobre sinais\n\nO erro mais comum ao usar $L_i \\to L_i + k L_j$ é trocar o sinal de $k$. Para **zerar** um elemento, escolha $k$ de modo que a soma dê zero na coluna desejada. No exemplo anterior, o pivô da primeira linha valia $1$ e o elemento a eliminar valia $3$, então usamos $k = -3$, e não $k = 3$. Conferir a coluna do pivô no fim é um bom hábito: ela precisa realmente zerar.",
                    },
                    {
                        type: "quote",
                        value: "Mexer na matriz aumentada é mexer no sistema, só que sem reescrever as incógnitas a cada passo.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A matriz aumentada reúne coeficientes e termos independentes em uma só tabela de números.\n- As três operações elementares são a troca de linhas, a multiplicação por escalar não nulo e a soma de um múltiplo de outra linha.\n- Multiplicar uma linha por zero não é permitido.\n- Operações elementares produzem matrizes linha-equivalentes, que representam sistemas com o mesmo conjunto solução.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a matriz aumentada do sistema $\\begin{cases} 2x - y = 3 \\\\ x + 4y = 1 \\end{cases}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 2 & -1 & 3 \\\\ 1 & 4 & 1 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 2 & 1 & 3 \\\\ 1 & 4 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 2 & -1 & 1 \\\\ 1 & 4 & 3 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 3 & -1 & 2 \\\\ 1 & 4 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual das operações a seguir não é uma operação elementar válida sobre as linhas de uma matriz?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Multiplicar uma linha por $0$",
                                isCorrect: true,
                            },
                            {
                                text: "Trocar duas linhas de posição",
                                isCorrect: false,
                            },
                            {
                                text: "Multiplicar uma linha por $3$",
                                isCorrect: false,
                            },
                            {
                                text: "Somar a uma linha o dobro de outra",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Partindo de $\\begin{pmatrix} 1 & 3 & 4 \\\\ 2 & 5 & 7 \\end{pmatrix}$, qual é o resultado de $L_2 \\to L_2 - 2L_1$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 1 & 3 & 4 \\\\ 0 & -1 & -1 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 3 & 4 \\\\ 0 & 1 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 3 & 4 \\\\ 4 & 11 & 15 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 0 & -1 & -1 \\\\ 2 & 5 & 7 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Duas matrizes aumentadas são linha-equivalentes. O que se pode afirmar sobre os sistemas que elas representam?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Têm exatamente o mesmo conjunto solução",
                                isCorrect: true,
                            },
                            {
                                text: "Têm sempre soluções diferentes entre si",
                                isCorrect: false,
                            },
                            {
                                text: "Um tem solução e o outro nunca tem",
                                isCorrect: false,
                            },
                            {
                                text: "Têm o mesmo número de linhas, mas soluções distintas",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na matriz $\\begin{pmatrix} 2 & 1 & 3 \\\\ 6 & 4 & 5 \\end{pmatrix}$, qual operação zera o primeiro elemento da segunda linha usando a primeira linha como pivô?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$L_2 \\to L_2 - 3L_1$",
                                isCorrect: true,
                            },
                            {
                                text: "$L_2 \\to L_2 + 3L_1$",
                                isCorrect: false,
                            },
                            {
                                text: "$L_2 \\to L_2 - 2L_1$",
                                isCorrect: false,
                            },
                            {
                                text: "$L_1 \\to L_1 - 3L_2$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Eliminação de Gauss",
                blocks: [
                    {
                        type: "text",
                        value: "## O objetivo da eliminação\n\nA **eliminação de Gauss** é um procedimento sistemático que usa operações elementares para transformar a matriz aumentada em uma forma mais simples, chamada **forma escalonada** (ou forma em escada). A partir dela, encontrar as soluções vira quase uma leitura direta, feita de baixo para cima.",
                    },
                    {
                        type: "text",
                        value: "## Forma escalonada\n\nUma matriz está na **forma escalonada** quando cumpre três condições:\n\n1. as linhas nulas, formadas só por zeros, ficam todas na parte de baixo;\n2. em cada linha não nula, o primeiro elemento diferente de zero, chamado **pivô**, está mais à direita do que o pivô da linha logo acima;\n3. abaixo de cada pivô só existem zeros.\n\nOs pivôs formam um padrão em escada, descendo da esquerda para a direita. Por exemplo, a matriz $\\begin{pmatrix} 2 & -1 & 3 \\\\ 0 & 1 & 4 \\\\ 0 & 0 & 5 \\end{pmatrix}$ está escalonada, com pivôs $2$, $1$ e $5$.",
                    },
                    {
                        type: "text",
                        value: "## Como escalonar\n\nA estratégia é trabalhar coluna por coluna, da esquerda para a direita:\n\n1. escolha um pivô não nulo na coluna atual e, se o candidato for zero, troque de linha;\n2. use a operação $L_i \\to L_i - k L_p$ para zerar todos os elementos **abaixo** do pivô;\n3. avance para a próxima coluna e para a próxima linha, repetindo o processo.\n\nEsse movimento de cima para baixo é chamado de **eliminação para frente**.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nVamos resolver\n\n$$\\begin{cases} x + y + z = 6 \\\\ 2x + 3y + z = 11 \\\\ x - y + 2z = 5 \\end{cases}$$\n\ncuja matriz aumentada é\n\n$$\\begin{pmatrix} 1 & 1 & 1 & 6 \\\\ 2 & 3 & 1 & 11 \\\\ 1 & -1 & 2 & 5 \\end{pmatrix}.$$\n\nCom o pivô $1$ da primeira linha, zeramos a primeira coluna abaixo dele usando $L_2 \\to L_2 - 2L_1$ e $L_3 \\to L_3 - L_1$:\n\n$$\\begin{pmatrix} 1 & 1 & 1 & 6 \\\\ 0 & 1 & -1 & -1 \\\\ 0 & -2 & 1 & -1 \\end{pmatrix}.$$\n\nAgora o pivô da segunda linha é $1$; zeramos o elemento abaixo dele com $L_3 \\to L_3 + 2L_2$:\n\n$$\\begin{pmatrix} 1 & 1 & 1 & 6 \\\\ 0 & 1 & -1 & -1 \\\\ 0 & 0 & -1 & -3 \\end{pmatrix}.$$\n\nA matriz agora está na forma escalonada.",
                    },
                    {
                        type: "text",
                        value: "## Substituição de baixo para cima\n\nCom a matriz escalonada, voltamos às equações e resolvemos de trás para frente. A última linha diz $-z = -3$, logo $z = 3$. A segunda linha diz $y - z = -1$ e, com $z = 3$, dá $y = 2$. A primeira linha diz $x + y + z = 6$ e, com $y = 2$ e $z = 3$, resulta em $x = 1$. A solução é $(x, y, z) = (1, 2, 3)$, que confere nas três equações originais.",
                    },
                    {
                        type: "text",
                        value: "## Quando o pivô é zero\n\nSe, ao chegar a uma coluna, o candidato a pivô for zero, ele não serve para eliminar os elementos abaixo. A saída é **trocar** aquela linha por outra, mais abaixo, que tenha valor não nulo naquela posição, usando $L_i \\leftrightarrow L_j$. Só quando toda a coluna, do pivô para baixo, é nula é que seguimos para a próxima coluna sem criar pivô ali.",
                    },
                    {
                        type: "quote",
                        value: "Escalonar é arrumar a bagunça: primeiro colocamos os zeros embaixo dos pivôs, depois a solução aparece quase sozinha.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A eliminação de Gauss leva a matriz aumentada à forma escalonada por meio de operações elementares.\n- Na forma escalonada, cada pivô fica à direita do pivô de cima e abaixo de cada pivô só há zeros.\n- A eliminação para frente zera os elementos abaixo de cada pivô, coluna após coluna.\n- Com a matriz escalonada, a substituição de baixo para cima devolve a solução do sistema.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual das matrizes a seguir está na forma escalonada?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 4 & 5 \\\\ 0 & 0 & 6 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 4 & 5 \\\\ 0 & 1 & 6 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 0 & 0 & 0 \\\\ 1 & 2 & 3 \\\\ 0 & 4 & 5 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 2 & 3 \\\\ 2 & 4 & 5 \\\\ 0 & 0 & 6 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em uma matriz na forma escalonada, o pivô de uma linha não nula é qual elemento?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O primeiro valor não nulo da linha",
                                isCorrect: true,
                            },
                            {
                                text: "O maior valor presente na linha",
                                isCorrect: false,
                            },
                            {
                                text: "O elemento sempre igual a $1$",
                                isCorrect: false,
                            },
                            {
                                text: "O último elemento não nulo da linha",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Aplicando $L_2 \\to L_2 - 2L_1$ e $L_3 \\to L_3 - L_1$ à matriz $\\begin{pmatrix} 1 & 1 & 2 \\\\ 2 & 3 & 7 \\\\ 1 & 0 & 1 \\end{pmatrix}$, obtemos",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 1 & 1 & 2 \\\\ 0 & 1 & 3 \\\\ 0 & -1 & -1 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 1 & 2 \\\\ 0 & -1 & -3 \\\\ 0 & -1 & -1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 1 & 2 \\\\ 0 & 5 & 11 \\\\ 0 & 1 & 3 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 1 & 2 \\\\ 0 & 1 & 3 \\\\ 1 & 0 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A forma escalonada de um sistema é $\\begin{pmatrix} 1 & 2 & -1 & 3 \\\\ 0 & 1 & 2 & 4 \\\\ 0 & 0 & 1 & 2 \\end{pmatrix}$. Qual é o valor de $z$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$z = 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$z = 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$z = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$z = -2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Escalonando e resolvendo o sistema $\\begin{cases} x + y = 3 \\\\ 2x + 3y + z = 8 \\\\ y + 2z = 3 \\end{cases}$, qual é a solução $(x, y, z)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$(2, 1, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(1, 2, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 1, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 1, 2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Forma escalonada reduzida (Gauss-Jordan)",
                blocks: [
                    {
                        type: "text",
                        value: "## Um passo além do escalonamento\n\nA forma escalonada já resolve o sistema por substituição, mas dá para ir além e tornar a leitura da solução ainda mais direta. Essa versão mais refinada é a **forma escalonada reduzida**, obtida pelo método de **Gauss-Jordan**.",
                    },
                    {
                        type: "text",
                        value: "## Forma escalonada reduzida\n\nUma matriz está na **forma escalonada reduzida** quando, além de já estar escalonada, cumpre duas condições extras:\n\n1. todo pivô é igual a $1$, chamado **pivô unitário**;\n2. em cada coluna que contém um pivô, todos os outros elementos são zero, tanto abaixo quanto **acima** do pivô.\n\nPor exemplo, a matriz $\\begin{pmatrix} 1 & 0 & 0 & 2 \\\\ 0 & 1 & 0 & 5 \\\\ 0 & 0 & 1 & 7 \\end{pmatrix}$ está na forma escalonada reduzida.",
                    },
                    {
                        type: "text",
                        value: "## O método de Gauss-Jordan\n\nO método de Gauss-Jordan continua de onde a eliminação de Gauss parou:\n\n1. escalone a matriz normalmente, com a eliminação para frente;\n2. divida cada linha pelo seu pivô, para que todo pivô se torne $1$;\n3. use cada pivô para zerar os elementos **acima** dele, agora de baixo para cima.\n\nO resultado é a forma escalonada reduzida, em que cada incógnita com pivô fica isolada em sua coluna.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nVamos aplicar Gauss-Jordan ao sistema $\\begin{cases} x + 2y = 4 \\\\ 3x + 4y = 10 \\end{cases}$, de matriz aumentada\n\n$$\\begin{pmatrix} 1 & 2 & 4 \\\\ 3 & 4 & 10 \\end{pmatrix}.$$\n\nPrimeiro, $L_2 \\to L_2 - 3L_1$ zera o elemento abaixo do pivô:\n\n$$\\begin{pmatrix} 1 & 2 & 4 \\\\ 0 & -2 & -2 \\end{pmatrix}.$$\n\nEm seguida tornamos o pivô da segunda linha igual a $1$ com $L_2 \\to -\\frac{1}{2} L_2$:\n\n$$\\begin{pmatrix} 1 & 2 & 4 \\\\ 0 & 1 & 1 \\end{pmatrix}.$$\n\nPor fim, usamos esse pivô para zerar o elemento acima dele com $L_1 \\to L_1 - 2L_2$:\n\n$$\\begin{pmatrix} 1 & 0 & 2 \\\\ 0 & 1 & 1 \\end{pmatrix}.$$",
                    },
                    {
                        type: "text",
                        value: "## A solução aparece pronta\n\nNa forma escalonada reduzida, cada linha isola uma incógnita. A matriz final do exemplo se traduz diretamente em $x = 2$ e $y = 1$, sem nenhuma conta extra de substituição. Essa é a grande vantagem do Gauss-Jordan: quando o sistema tem solução única, a última coluna da matriz reduzida é exatamente a lista de valores das incógnitas.",
                    },
                    {
                        type: "text",
                        value: "## A forma reduzida é única\n\nUma mesma matriz pode ter várias formas escalonadas diferentes, conforme as escolhas de pivô e de operações no caminho. Já a forma escalonada **reduzida** é única: qualquer sequência correta de operações elementares chega à mesma matriz reduzida. Por isso ela funciona como uma espécie de impressão digital do sistema, muito útil na teoria.",
                    },
                    {
                        type: "quote",
                        value: "A eliminação de Gauss deixa a solução a um passo de distância; Gauss-Jordan entrega a solução na bandeja.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A forma escalonada reduzida exige pivôs iguais a $1$ e zeros acima e abaixo de cada pivô.\n- O método de Gauss-Jordan escalona, normaliza os pivôs e depois elimina para cima.\n- Quando há solução única, a última coluna da matriz reduzida traz direto os valores das incógnitas.\n- Diferente da forma escalonada comum, a forma escalonada reduzida é única.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual das matrizes a seguir está na forma escalonada reduzida?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 1 & 0 & 5 \\\\ 0 & 1 & 3 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 2 & 5 \\\\ 0 & 1 & 3 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 2 & 0 & 5 \\\\ 0 & 1 & 3 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 0 & 5 \\\\ 0 & 3 & 3 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Além de a matriz já estar escalonada, o que a forma escalonada reduzida também exige?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Pivôs iguais a $1$ e zeros acima deles",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas que os pivôs sejam iguais a $1$",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas que haja zeros acima de cada pivô",
                                isCorrect: false,
                            },
                            {
                                text: "Que todos os elementos da matriz sejam $0$ ou $1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A forma escalonada reduzida de um sistema é $\\begin{pmatrix} 1 & 0 & 0 & -1 \\\\ 0 & 1 & 0 & 4 \\\\ 0 & 0 & 1 & 2 \\end{pmatrix}$. Qual é a solução?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(-1, 4, 2)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(1, 4, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-1, -4, -2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 4, -1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Partindo de $\\begin{pmatrix} 1 & 3 & 7 \\\\ 0 & 1 & 2 \\end{pmatrix}$, qual operação leva à forma escalonada reduzida?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$L_1 \\to L_1 - 3L_2$",
                                isCorrect: true,
                            },
                            {
                                text: "$L_1 \\to L_1 + 3L_2$",
                                isCorrect: false,
                            },
                            {
                                text: "$L_2 \\to L_2 - 3L_1$",
                                isCorrect: false,
                            },
                            {
                                text: "$L_1 \\to L_1 - L_2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Aplicando Gauss-Jordan à matriz $\\begin{pmatrix} 1 & 1 & 3 \\\\ 2 & 3 & 8 \\end{pmatrix}$, qual é a forma escalonada reduzida?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 1 & 0 & 1 \\\\ 0 & 1 & 2 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 0 & 2 \\\\ 0 & 1 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 1 & 3 \\\\ 0 & 1 & 2 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 0 & 1 \\\\ 0 & 1 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Classificação de sistemas lineares",
                blocks: [
                    {
                        type: "text",
                        value: "## Três desfechos possíveis\n\nTodo sistema linear se encaixa em exatamente uma de três categorias, de acordo com o tamanho do conjunto solução:\n\n- **sistema possível e determinado (SPD)**: tem uma única solução;\n- **sistema possível e indeterminado (SPI)**: tem infinitas soluções;\n- **sistema impossível (SI)**: não tem solução alguma.\n\nO termo *possível* indica que existe ao menos uma solução, e *determinado* indica que essa solução é única. Um sistema impossível também é chamado de **inconsistente**.",
                    },
                    {
                        type: "text",
                        value: "## Enxergando o tipo na forma escalonada\n\nA forma escalonada revela a classificação quase de imediato. Se em algum momento surge uma linha com todos os coeficientes nulos e termo independente diferente de zero, do tipo\n\n$$\\begin{pmatrix} 0 & 0 & 0 & c \\end{pmatrix}, \\quad c \\neq 0,$$\n\nessa linha representa a equação $0 = c$, que é impossível. Basta uma única linha assim para o sistema inteiro ser **impossível (SI)**.",
                    },
                    {
                        type: "text",
                        value: "## Contando pivôs\n\nSe nenhuma linha impossível apareceu, o sistema é possível, e então comparamos o número de **pivôs** com o número de **incógnitas**:\n\n- se cada incógnita tem o seu pivô, ou seja, o número de pivôs é igual ao de incógnitas, o sistema é **determinado (SPD)**;\n- se há menos pivôs do que incógnitas, sobram **variáveis livres**, e o sistema é **indeterminado (SPI)**, com infinitas soluções.\n\nAs incógnitas cujas colunas não têm pivô são exatamente as variáveis livres.",
                    },
                    {
                        type: "text",
                        value: "## Variáveis livres e solução geral\n\nEm um sistema indeterminado, tomamos as variáveis livres como parâmetros e escrevemos as demais em função delas. Por exemplo, se $z$ é livre, fazemos $z = t$ com $t \\in \\mathbb{R}$ e expressamos $x$ e $y$ em termos de $t$. Cada valor de $t$ gera uma solução diferente, e o conjunto de todas elas é a **solução geral** do sistema.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo de sistema impossível\n\nConsidere o sistema $\\begin{cases} x + y = 2 \\\\ 2x + 2y = 5 \\end{cases}$, de matriz aumentada $\\begin{pmatrix} 1 & 1 & 2 \\\\ 2 & 2 & 5 \\end{pmatrix}$. Aplicando $L_2 \\to L_2 - 2L_1$:\n\n$$\\begin{pmatrix} 1 & 1 & 2 \\\\ 0 & 0 & 1 \\end{pmatrix}.$$\n\nA segunda linha afirma que $0 = 1$, um absurdo. Logo o sistema é **impossível (SI)**. Geometricamente, as duas retas são paralelas e distintas.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo de sistema indeterminado\n\nAgora veja $\\begin{cases} x + y + z = 6 \\\\ x + 2y + 3z = 14 \\end{cases}$, com duas equações e três incógnitas, de matriz aumentada $\\begin{pmatrix} 1 & 1 & 1 & 6 \\\\ 1 & 2 & 3 & 14 \\end{pmatrix}$. Aplicando $L_2 \\to L_2 - L_1$:\n\n$$\\begin{pmatrix} 1 & 1 & 1 & 6 \\\\ 0 & 1 & 2 & 8 \\end{pmatrix}.$$\n\nA coluna de $z$ não tem pivô, então $z$ é variável livre. Fazendo $z = t$, a segunda linha dá $y = 8 - 2t$ e a primeira dá $x = t - 2$. A solução geral é $(x, y, z) = (t - 2,\\ 8 - 2t,\\ t)$, com $t \\in \\mathbb{R}$, ou seja, infinitas soluções, portanto **SPI**.",
                    },
                    {
                        type: "text",
                        value: "## Um caso especial: sistemas homogêneos\n\nUm sistema é **homogêneo** quando todos os termos independentes são iguais a zero. Ele nunca é impossível, pois a $n$-upla $(0, 0, \\dots, 0)$, chamada **solução trivial**, sempre satisfaz o sistema. Assim, todo sistema homogêneo é possível: ou tem apenas a solução trivial, sendo SPD, ou tem infinitas soluções, sendo SPI, quando surgem variáveis livres.",
                    },
                    {
                        type: "quote",
                        value: "Classificar um sistema é responder a uma pergunta curta: nenhuma, uma ou infinitas soluções?",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- SPD tem uma única solução, SPI tem infinitas soluções e SI não tem nenhuma.\n- Uma linha do tipo $0 = c$, com $c$ não nulo, indica um sistema impossível.\n- Sendo o sistema possível, número de pivôs igual ao de incógnitas dá SPD; menos pivôs do que incógnitas dá SPI.\n- As colunas sem pivô correspondem a variáveis livres, que parametrizam a solução geral.\n- Todo sistema homogêneo é possível, pois admite ao menos a solução trivial.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um sistema linear que possui exatamente uma solução é classificado como",
                        difficulty: "facil",
                        options: [
                            {
                                text: "possível e determinado (SPD)",
                                isCorrect: true,
                            },
                            {
                                text: "possível e indeterminado (SPI)",
                                isCorrect: false,
                            },
                            {
                                text: "impossível (SI)",
                                isCorrect: false,
                            },
                            {
                                text: "homogêneo e trivial",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao escalonar um sistema, surge a linha $\\begin{pmatrix} 0 & 0 & 0 & 4 \\end{pmatrix}$. Esse sistema é",
                        difficulty: "facil",
                        options: [
                            {
                                text: "impossível (SI)",
                                isCorrect: true,
                            },
                            {
                                text: "possível e determinado (SPD)",
                                isCorrect: false,
                            },
                            {
                                text: "possível e indeterminado (SPI)",
                                isCorrect: false,
                            },
                            {
                                text: "homogêneo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um sistema possível com $4$ incógnitas tem, na forma escalonada, apenas $2$ pivôs. Como ele é classificado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Indeterminado, com $2$ variáveis livres",
                                isCorrect: true,
                            },
                            {
                                text: "Determinado, com uma única solução exata",
                                isCorrect: false,
                            },
                            {
                                text: "Impossível, sem nenhuma solução",
                                isCorrect: false,
                            },
                            {
                                text: "Determinado, com $2$ variáveis livres",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Classifique o sistema $\\begin{cases} x - y = 1 \\\\ 2x - 2y = 2 \\end{cases}$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "SPI, pois as equações são a mesma reta",
                                isCorrect: true,
                            },
                            {
                                text: "SI, pois as retas são paralelas e distintas",
                                isCorrect: false,
                            },
                            {
                                text: "SPD, com solução única igual a $(1, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "SPD, com solução única igual a $(0, 1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para qual valor de $k$ o sistema $\\begin{cases} x + 2y = 3 \\\\ 2x + ky = 6 \\end{cases}$ é indeterminado (SPI)?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$k = 4$",
                                isCorrect: true,
                            },
                            {
                                text: "$k = 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = -4$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = 6$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Matrizes",
        aulas: [
            {
                titulo: "Operações com matrizes",
                blocks: [
                    {
                        type: "text",
                        value: 'Uma **matriz** é uma tabela retangular de números organizados em linhas e colunas. Dizemos que uma matriz $A$ tem ordem $m \\times n$ (lê-se "$m$ por $n$") quando ela possui $m$ linhas e $n$ colunas.\n\n$$A = \\begin{pmatrix} a_{11} & a_{12} & \\cdots & a_{1n} \\\\ a_{21} & a_{22} & \\cdots & a_{2n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ a_{m1} & a_{m2} & \\cdots & a_{mn} \\end{pmatrix}$$\n\nO elemento $a_{ij}$ ocupa a linha $i$ e a coluna $j$. Assim, em $a_{23}$ o primeiro índice indica a linha (2) e o segundo, a coluna (3).',
                    },
                    {
                        type: "text",
                        value: "Uma matriz costuma ser denotada de forma compacta por $A = (a_{ij})$. Quando $m = n$, dizemos que a matriz é **quadrada** de ordem $n$.\n\nDuas matrizes $A = (a_{ij})$ e $B = (b_{ij})$ são **iguais** quando têm a mesma ordem e todos os elementos correspondentes coincidem, ou seja, $a_{ij} = b_{ij}$ para todos os índices $i$ e $j$. Não basta terem os mesmos números: eles precisam estar nas mesmas posições.",
                    },
                    {
                        type: "text",
                        value: "A **soma** de duas matrizes de mesma ordem é feita somando os elementos que ocupam a mesma posição. Se $A$ e $B$ são $m \\times n$, então $(A + B)_{ij} = a_{ij} + b_{ij}$.\n\nPor exemplo:\n\n$$\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix} + \\begin{pmatrix} 5 & 0 \\\\ -1 & 2 \\end{pmatrix} = \\begin{pmatrix} 6 & 2 \\\\ 2 & 6 \\end{pmatrix}$$\n\nA **subtração** funciona da mesma maneira: $(A - B)_{ij} = a_{ij} - b_{ij}$. Só é possível somar ou subtrair matrizes de **mesma ordem**.",
                    },
                    {
                        type: "text",
                        value: "Na **multiplicação por escalar**, multiplicamos cada elemento da matriz pelo número real $k$. Se $A = (a_{ij})$, então $(kA)_{ij} = k \\cdot a_{ij}$.\n\nPor exemplo, com $k = 3$:\n\n$$3 \\cdot \\begin{pmatrix} 2 & -1 \\\\ 0 & 4 \\end{pmatrix} = \\begin{pmatrix} 6 & -3 \\\\ 0 & 12 \\end{pmatrix}$$\n\nMultiplicar por $-1$ troca o sinal de todos os elementos e produz a **matriz oposta** $-A$.",
                    },
                    {
                        type: "text",
                        value: "As operações de soma e multiplicação por escalar têm propriedades parecidas com as dos números reais. Sendo $A$, $B$ e $C$ matrizes de mesma ordem e $k$, $l$ escalares:\n\n- **Comutatividade da soma**: $A + B = B + A$.\n- **Associatividade da soma**: $(A + B) + C = A + (B + C)$.\n- **Elemento neutro**: existe a **matriz nula** $O$, com todos os elementos iguais a zero, tal que $A + O = A$.\n- **Elemento oposto**: $A + (-A) = O$.\n- **Distributividade**: $k(A + B) = kA + kB$ e $(k + l)A = kA + lA$.",
                    },
                    {
                        type: "text",
                        value: "**Exemplo resolvido.** Dadas $A = \\begin{pmatrix} 1 & 4 \\\\ 2 & 0 \\end{pmatrix}$ e $B = \\begin{pmatrix} 3 & -2 \\\\ 1 & 5 \\end{pmatrix}$, vamos calcular $2A - B$.\n\nPrimeiro multiplicamos $A$ por 2:\n\n$$2A = \\begin{pmatrix} 2 & 8 \\\\ 4 & 0 \\end{pmatrix}$$\n\nEm seguida subtraímos $B$ elemento a elemento:\n\n$$2A - B = \\begin{pmatrix} 2 - 3 & 8 - (-2) \\\\ 4 - 1 & 0 - 5 \\end{pmatrix} = \\begin{pmatrix} -1 & 10 \\\\ 3 & -5 \\end{pmatrix}$$",
                    },
                    {
                        type: "quote",
                        value: "As matrizes organizam informação em linhas e colunas, e é essa estrutura que transforma dados em objetos que podemos somar, escalar e, mais adiante, multiplicar.",
                    },
                    {
                        type: "text",
                        value: "**Resumo.** Uma matriz $m \\times n$ tem $m$ linhas e $n$ colunas, e cada elemento é identificado por $a_{ij}$. Soma e subtração são feitas elemento a elemento e exigem matrizes de mesma ordem. A multiplicação por escalar multiplica todos os elementos pelo mesmo número. Essas operações preparam o terreno para a multiplicação de matrizes, tema da próxima aula.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma matriz possui 3 linhas e 2 colunas. Qual é a sua ordem?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$2 \\times 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$3 \\times 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$3 \\times 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$2 \\times 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O resultado de $\\begin{pmatrix} 2 & 1 \\\\ 0 & 3 \\end{pmatrix} + \\begin{pmatrix} 1 & 4 \\\\ 5 & -1 \\end{pmatrix}$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 3 & 5 \\\\ 5 & 2 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & -3 \\\\ -5 & 4 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 3 & 5 \\\\ 5 & 4 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 2 & 4 \\\\ 0 & -3 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o resultado de $-2 \\cdot \\begin{pmatrix} 3 & -1 \\\\ 0 & 5 \\end{pmatrix}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\begin{pmatrix} -6 & -2 \\\\ 0 & -10 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} -6 & 2 \\\\ 0 & -10 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 6 & -2 \\\\ 0 & 10 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & -3 \\\\ -2 & 3 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $\\begin{pmatrix} x & 3 \\\\ 5 & y \\end{pmatrix} = \\begin{pmatrix} -2 & 3 \\\\ 5 & 7 \\end{pmatrix}$, então:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x = 7$ e $y = -2$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = -2$ e $y = 7$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 2$ e $y = 7$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = -2$ e $y = -7$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Dadas $A = \\begin{pmatrix} 1 & 0 \\\\ 2 & 3 \\end{pmatrix}$ e $B = \\begin{pmatrix} 2 & 1 \\\\ 1 & 0 \\end{pmatrix}$, o valor de $2A - 3B$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 8 & 3 \\\\ 7 & 6 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} -1 & -1 \\\\ 1 & 3 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} -4 & -3 \\\\ 1 & 6 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} -4 & -3 \\\\ 1 & -6 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Multiplicação de matrizes",
                blocks: [
                    {
                        type: "text",
                        value: "A multiplicação de matrizes **não** é feita elemento a elemento. Ela combina as **linhas** da primeira matriz com as **colunas** da segunda.\n\nPara que o produto $AB$ exista, o número de **colunas** de $A$ deve ser igual ao número de **linhas** de $B$. Se $A$ é $m \\times n$ e $B$ é $n \\times p$, o produto $AB$ tem ordem $m \\times p$.\n\n$$\\underset{m \\times n}{A} \\cdot \\underset{n \\times p}{B} = \\underset{m \\times p}{C}$$\n\nOs índices internos (o $n$) precisam coincidir; os externos ($m$ e $p$) definem a ordem do resultado.",
                    },
                    {
                        type: "text",
                        value: "Cada elemento $c_{ij}$ do produto é obtido multiplicando a **linha $i$ de $A$** pela **coluna $j$ de $B$** e somando os produtos correspondentes:\n\n$$c_{ij} = a_{i1}b_{1j} + a_{i2}b_{2j} + \\cdots + a_{in}b_{nj} = \\sum_{k=1}^{n} a_{ik} b_{kj}$$\n\nNa prática, percorremos a linha e a coluna ao mesmo tempo, multiplicando par a par e somando tudo.",
                    },
                    {
                        type: "text",
                        value: "**Exemplo 1.** Vamos multiplicar\n$$A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}, \\quad B = \\begin{pmatrix} 5 & 6 \\\\ 7 & 8 \\end{pmatrix}.$$\n\nO elemento $c_{11}$ usa a primeira linha de $A$ e a primeira coluna de $B$: $1 \\cdot 5 + 2 \\cdot 7 = 19$. Repetindo o processo nas demais posições:\n\n$$AB = \\begin{pmatrix} 1 \\cdot 5 + 2 \\cdot 7 & 1 \\cdot 6 + 2 \\cdot 8 \\\\ 3 \\cdot 5 + 4 \\cdot 7 & 3 \\cdot 6 + 4 \\cdot 8 \\end{pmatrix} = \\begin{pmatrix} 19 & 22 \\\\ 43 & 50 \\end{pmatrix}$$",
                    },
                    {
                        type: "text",
                        value: "**Exemplo 2.** O produto pode ter ordem diferente das matrizes originais. Seja $A$ de ordem $2 \\times 3$ e $B$ de ordem $3 \\times 1$:\n\n$$A = \\begin{pmatrix} 1 & 0 & 2 \\\\ -1 & 3 & 1 \\end{pmatrix}, \\quad B = \\begin{pmatrix} 4 \\\\ 2 \\\\ 1 \\end{pmatrix}.$$\n\nComo $A$ tem 3 colunas e $B$ tem 3 linhas, o produto existe e terá ordem $2 \\times 1$:\n\n$$AB = \\begin{pmatrix} 1 \\cdot 4 + 0 \\cdot 2 + 2 \\cdot 1 \\\\ -1 \\cdot 4 + 3 \\cdot 2 + 1 \\cdot 1 \\end{pmatrix} = \\begin{pmatrix} 6 \\\\ 3 \\end{pmatrix}$$",
                    },
                    {
                        type: "text",
                        value: "**A ordem importa.** Em geral, $AB \\neq BA$. Muitas vezes um dos produtos nem sequer existe e, mesmo quando ambos existem, os resultados costumam ser diferentes.\n\nCom $A = \\begin{pmatrix} 1 & 2 \\\\ 0 & 1 \\end{pmatrix}$ e $B = \\begin{pmatrix} 1 & 0 \\\\ 3 & 1 \\end{pmatrix}$:\n\n$$AB = \\begin{pmatrix} 7 & 2 \\\\ 3 & 1 \\end{pmatrix}, \\qquad BA = \\begin{pmatrix} 1 & 2 \\\\ 3 & 7 \\end{pmatrix}$$\n\nComo se vê, $AB \\neq BA$: a multiplicação de matrizes **não é comutativa**.",
                    },
                    {
                        type: "text",
                        value: 'Apesar de não ser comutativa, a multiplicação de matrizes satisfaz outras propriedades importantes, sempre que as ordens tornam os produtos possíveis:\n\n- **Associatividade**: $(AB)C = A(BC)$.\n- **Distributividade**: $A(B + C) = AB + AC$ e $(A + B)C = AC + BC$.\n- **Compatibilidade com escalar**: $k(AB) = (kA)B = A(kB)$.\n- **Elemento neutro**: a matriz identidade $I$ satisfaz $AI = IA = A$.\n\nComo a operação não é comutativa, não podemos trocar a ordem dos fatores nem "cancelar" matrizes livremente.',
                    },
                    {
                        type: "quote",
                        value: "Multiplicar matrizes é encadear transformações: primeiro aplicamos uma, depois a outra, e a ordem em que fazemos isso muda o resultado.",
                    },
                    {
                        type: "text",
                        value: "**Resumo.** O produto $AB$ só existe quando o número de colunas de $A$ é igual ao número de linhas de $B$, e o resultado tem ordem $m \\times p$. Cada entrada é a soma dos produtos de uma linha de $A$ por uma coluna de $B$. A operação é associativa e distributiva, mas **não comutativa**, de modo que $AB$ e $BA$ podem ser diferentes.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Se $A$ é uma matriz $2 \\times 3$ e $B$ é $3 \\times 4$, qual é a ordem do produto $AB$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$3 \\times 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$2 \\times 4$",
                                isCorrect: true,
                            },
                            {
                                text: "$4 \\times 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$2 \\times 3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O produto $\\begin{pmatrix} 2 & 1 \\\\ 0 & 3 \\end{pmatrix} \\begin{pmatrix} 1 & 4 \\\\ 2 & 1 \\end{pmatrix}$ é igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 2 & 4 \\\\ 0 & 3 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 4 & 9 \\\\ 6 & 3 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 2 & 13 \\\\ 4 & 5 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 4 & 6 \\\\ 9 & 3 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sendo $I = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$ a matriz identidade e $A$ uma matriz $2 \\times 2$ qualquer, o produto $AI$ é igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$A$",
                                isCorrect: true,
                            },
                            {
                                text: "$I$",
                                isCorrect: false,
                            },
                            {
                                text: "$2A$",
                                isCorrect: false,
                            },
                            {
                                text: "a matriz nula $O$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para que o produto $AB$ exista, é necessário que:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$A$ e $B$ tenham a mesma ordem",
                                isCorrect: false,
                            },
                            {
                                text: "$A$ e $B$ sejam ambas quadradas",
                                isCorrect: false,
                            },
                            {
                                text: "o número de colunas de $A$ seja igual ao número de linhas de $B$",
                                isCorrect: true,
                            },
                            {
                                text: "o número de linhas de $A$ seja igual ao número de colunas de $B$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $A = \\begin{pmatrix} 1 & -1 & 2 \\\\ 0 & 3 & 1 \\end{pmatrix}$ e $B = \\begin{pmatrix} 2 & 0 \\\\ 1 & 4 \\\\ -1 & 1 \\end{pmatrix}$. O produto $AB$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 5 & 6 \\\\ 2 & 13 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} -1 & -2 \\\\ 2 & 12 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} -1 & -2 \\\\ 2 & 13 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} -1 & 2 \\\\ -2 & 13 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Transposta e matrizes especiais",
                blocks: [
                    {
                        type: "text",
                        value: "A **transposta** de uma matriz $A$, denotada $A^T$, é obtida trocando linhas por colunas: a linha $i$ de $A$ vira a coluna $i$ de $A^T$. Em símbolos, $(A^T)_{ij} = a_{ji}$.\n\nSe $A$ tem ordem $m \\times n$, então $A^T$ tem ordem $n \\times m$. Por exemplo:\n\n$$A = \\begin{pmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\end{pmatrix} \\implies A^T = \\begin{pmatrix} 1 & 4 \\\\ 2 & 5 \\\\ 3 & 6 \\end{pmatrix}$$",
                    },
                    {
                        type: "text",
                        value: "A transposta tem propriedades muito úteis:\n\n- $(A^T)^T = A$: transpor duas vezes devolve a matriz original.\n- $(A + B)^T = A^T + B^T$.\n- $(kA)^T = k A^T$.\n- $(AB)^T = B^T A^T$: a transposta de um produto **inverte a ordem** dos fatores.\n\nA última propriedade costuma surpreender: ao transpor $AB$ não obtemos $A^T B^T$, e sim $B^T A^T$.",
                    },
                    {
                        type: "text",
                        value: "Algumas matrizes recebem nomes especiais pela sua forma.\n\nUma matriz **quadrada** tem o mesmo número de linhas e colunas. Nela, os elementos $a_{11}, a_{22}, \\ldots, a_{nn}$ formam a **diagonal principal**.\n\nUma matriz **diagonal** é quadrada e tem todos os elementos fora da diagonal principal iguais a zero. Quando, além disso, todos os elementos da diagonal valem 1, temos a **matriz identidade** $I_n$:\n\n$$I_3 = \\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}$$",
                    },
                    {
                        type: "text",
                        value: "Uma matriz quadrada é **triangular superior** quando todos os elementos abaixo da diagonal principal são nulos, e **triangular inferior** quando todos os elementos acima da diagonal são nulos.\n\n$$\\begin{pmatrix} 2 & 3 & 1 \\\\ 0 & 5 & 4 \\\\ 0 & 0 & 7 \\end{pmatrix} \\qquad \\begin{pmatrix} 2 & 0 & 0 \\\\ 6 & 5 & 0 \\\\ 1 & 4 & 7 \\end{pmatrix}$$\n\nA matriz da esquerda é triangular superior e a da direita é triangular inferior. Toda matriz diagonal é, ao mesmo tempo, triangular superior e inferior.",
                    },
                    {
                        type: "text",
                        value: 'Uma matriz quadrada é **simétrica** quando $A^T = A$, ou seja, $a_{ij} = a_{ji}$: ela fica "espelhada" em relação à diagonal principal.\n\n$$S = \\begin{pmatrix} 1 & 2 & 0 \\\\ 2 & 3 & 5 \\\\ 0 & 5 & 4 \\end{pmatrix}$$\n\nJá uma matriz é **antissimétrica** quando $A^T = -A$. Isso obriga a diagonal principal a ser toda de zeros, pois $a_{ii} = -a_{ii}$ implica $a_{ii} = 0$:\n\n$$K = \\begin{pmatrix} 0 & 2 & -3 \\\\ -2 & 0 & 1 \\\\ 3 & -1 & 0 \\end{pmatrix}$$',
                    },
                    {
                        type: "text",
                        value: "**Exemplo resolvido.** Vamos verificar se $A = \\begin{pmatrix} 4 & -1 \\\\ -1 & 6 \\end{pmatrix}$ é simétrica.\n\nCalculamos a transposta trocando linhas por colunas:\n\n$$A^T = \\begin{pmatrix} 4 & -1 \\\\ -1 & 6 \\end{pmatrix}$$\n\nComo $A^T = A$, concluímos que $A$ é **simétrica**. Isso acontece justamente porque os elementos fora da diagonal satisfazem $a_{12} = a_{21} = -1$.",
                    },
                    {
                        type: "quote",
                        value: "Reconhecer a forma de uma matriz adianta boa parte do trabalho: identidades, diagonais e simetrias carregam propriedades que simplificam as contas mais adiante.",
                    },
                    {
                        type: "text",
                        value: "**Resumo.** A transposta $A^T$ troca linhas por colunas, e vale $(AB)^T = B^T A^T$. Entre as matrizes especiais estão as diagonais, a identidade $I$, as triangulares (superior e inferior), as **simétricas** ($A^T = A$) e as **antissimétricas** ($A^T = -A$, com diagonal nula). Esses tipos aparecem com frequência no estudo de determinantes e inversas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A transposta de $\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 4 & 3 \\\\ 2 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 3 \\\\ 2 & 4 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 4 & 2 \\\\ 3 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma matriz quadrada em que todos os elementos fora da diagonal principal são nulos é chamada de:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "matriz diagonal",
                                isCorrect: true,
                            },
                            {
                                text: "matriz simétrica",
                                isCorrect: false,
                            },
                            {
                                text: "matriz transposta",
                                isCorrect: false,
                            },
                            {
                                text: "matriz nula",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Uma matriz quadrada $A$ é simétrica quando:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$A^T = A$",
                                isCorrect: true,
                            },
                            {
                                text: "$A^T = -A$",
                                isCorrect: false,
                            },
                            {
                                text: "$A^T = A^{-1}$",
                                isCorrect: false,
                            },
                            {
                                text: "$A \\cdot A^T = A$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para matrizes $A$ e $B$ tais que o produto $AB$ existe, $(AB)^T$ é igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$A^T B^T$",
                                isCorrect: false,
                            },
                            {
                                text: "$B^T A^T$",
                                isCorrect: true,
                            },
                            {
                                text: "$AB$",
                                isCorrect: false,
                            },
                            {
                                text: "$BA$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sabendo que $M = \\begin{pmatrix} 0 & 5 & -2 \\\\ a & 0 & 3 \\\\ 2 & b & 0 \\end{pmatrix}$ é antissimétrica, os valores de $a$ e $b$ são:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$a = 5$ e $b = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$a = -5$ e $b = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$a = -5$ e $b = -3$",
                                isCorrect: true,
                            },
                            {
                                text: "$a = -3$ e $b = -5$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "A matriz inversa",
                blocks: [
                    {
                        type: "text",
                        value: "Nos números reais, o inverso de $a \\neq 0$ é $a^{-1} = \\frac{1}{a}$, pois $a \\cdot a^{-1} = 1$. Com matrizes a ideia é parecida, mas o papel do número 1 é desempenhado pela **matriz identidade** $I$.\n\nDizemos que uma matriz quadrada $A$ é **invertível** (ou não singular) quando existe uma matriz $A^{-1}$ da mesma ordem tal que\n$$A \\cdot A^{-1} = A^{-1} \\cdot A = I.$$\n\nEssa matriz $A^{-1}$, quando existe, é chamada de **inversa** de $A$.",
                    },
                    {
                        type: "text",
                        value: "Dois fatos importantes:\n\n- Apenas matrizes **quadradas** podem ter inversa, embora nem toda matriz quadrada tenha.\n- Quando a inversa existe, ela é **única**.\n\nUma matriz quadrada que **não** possui inversa é chamada de **singular**. Veremos que isso está diretamente ligado a um número associado à matriz: o determinante.",
                    },
                    {
                        type: "text",
                        value: "Para uma matriz $2 \\times 2$ existe uma fórmula direta. Dada\n$$A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix},$$\no número $\\det(A) = ad - bc$ é o **determinante** de $A$. A inversa existe se, e somente se, $ad - bc \\neq 0$, e nesse caso:\n\n$$A^{-1} = \\frac{1}{ad - bc} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$$\n\nRepare no padrão: trocam-se $a$ e $d$ de posição, invertem-se os sinais de $b$ e $c$ e divide-se tudo pelo determinante.",
                    },
                    {
                        type: "text",
                        value: "**Exemplo resolvido.** Vamos inverter $A = \\begin{pmatrix} 4 & 3 \\\\ 2 & 1 \\end{pmatrix}$.\n\nO determinante é $\\det(A) = 4 \\cdot 1 - 3 \\cdot 2 = 4 - 6 = -2$. Como é diferente de zero, a inversa existe:\n\n$$A^{-1} = \\frac{1}{-2} \\begin{pmatrix} 1 & -3 \\\\ -2 & 4 \\end{pmatrix} = \\begin{pmatrix} -\\frac{1}{2} & \\frac{3}{2} \\\\ 1 & -2 \\end{pmatrix}$$\n\nPara conferir, basta multiplicar e verificar que $A \\cdot A^{-1} = I$.",
                    },
                    {
                        type: "text",
                        value: "**E quando o determinante é zero?** Considere $B = \\begin{pmatrix} 2 & 4 \\\\ 1 & 2 \\end{pmatrix}$. Aqui $\\det(B) = 2 \\cdot 2 - 4 \\cdot 1 = 0$.\n\nComo a fórmula exigiria dividir por zero, a inversa **não existe**: $B$ é singular. Repare que a primeira linha é o dobro da segunda, um sinal típico de matriz sem inversa.",
                    },
                    {
                        type: "text",
                        value: 'A inversa se comporta bem em relação às operações, desde que as matrizes envolvidas sejam invertíveis:\n\n- $(A^{-1})^{-1} = A$.\n- $(AB)^{-1} = B^{-1} A^{-1}$: como na transposta, a ordem se inverte.\n- $(A^T)^{-1} = (A^{-1})^T$.\n- $(kA)^{-1} = \\frac{1}{k} A^{-1}$, para $k \\neq 0$.\n\nA regra $(AB)^{-1} = B^{-1} A^{-1}$ faz sentido: para desfazer "aplicar $A$ e depois $B$", desfazemos $B$ primeiro e $A$ depois.',
                    },
                    {
                        type: "quote",
                        value: "A inversa é o que permite dividir no mundo das matrizes: ela desfaz exatamente aquilo que a matriz original faz.",
                    },
                    {
                        type: "text",
                        value: "**Resumo.** A inversa $A^{-1}$ de uma matriz quadrada satisfaz $A A^{-1} = A^{-1} A = I$. Nem toda matriz quadrada é invertível: quando $\\det(A) = 0$, ela é singular. No caso $2 \\times 2$ vale $A^{-1} = \\frac{1}{ad - bc} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$, e em geral $(AB)^{-1} = B^{-1} A^{-1}$. Na próxima aula veremos como inverter matrizes maiores por escalonamento.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A matriz inversa $A^{-1}$ de uma matriz quadrada $A$ é aquela que satisfaz:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$A A^{-1} = A^{-1} A = I$",
                                isCorrect: true,
                            },
                            {
                                text: "$A A^{-1} = A^{-1} A = O$",
                                isCorrect: false,
                            },
                            {
                                text: "$A + A^{-1} = I$",
                                isCorrect: false,
                            },
                            {
                                text: "$A A^{-1} = A$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O determinante da matriz $\\begin{pmatrix} 3 & 5 \\\\ 2 & 4 \\end{pmatrix}$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$22$",
                                isCorrect: false,
                            },
                            {
                                text: "$12$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$-2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A inversa de $A = \\begin{pmatrix} 2 & 1 \\\\ 3 & 2 \\end{pmatrix}$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 2 & -1 \\\\ -3 & 2 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 2 & 1 \\\\ 3 & 2 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} -2 & 1 \\\\ 3 & -2 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 2 & -3 \\\\ -1 & 2 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A matriz $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$ é invertível se, e somente se:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$ad - bc = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$ad - bc \\neq 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$ad + bc \\neq 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$ad \\neq 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A inversa de $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 2 & -1 \\\\ -\\frac{3}{2} & \\frac{1}{2} \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 4 & -2 \\\\ -3 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} -2 & 1 \\\\ \\frac{3}{2} & -\\frac{1}{2} \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} -2 & \\frac{3}{2} \\\\ 1 & -\\frac{1}{2} \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Cálculo da inversa por escalonamento",
                blocks: [
                    {
                        type: "text",
                        value: "A fórmula da inversa que vimos serve apenas para matrizes $2 \\times 2$. Para matrizes maiores usamos um método geral e sistemático: o **escalonamento**, também conhecido como método de Gauss-Jordan.\n\nA ideia central é transformar a matriz $A$ na identidade usando **operações elementares** sobre as linhas. As mesmas operações, aplicadas à identidade, constroem a inversa.",
                    },
                    {
                        type: "text",
                        value: "Existem três **operações elementares** com linhas, todas reversíveis:\n\n1. **Trocar** duas linhas de posição.\n2. **Multiplicar** uma linha inteira por um escalar **não nulo**.\n3. **Somar** a uma linha um múltiplo de outra linha.\n\nNenhuma delas altera a solução do sistema associado à matriz, e é isso que garante que o método funcione.",
                    },
                    {
                        type: "text",
                        value: "O procedimento é o seguinte. Escrevemos a **matriz aumentada** $[\\, A \\mid I \\,]$, com $A$ à esquerda e a identidade à direita, e aplicamos operações elementares até que o lado esquerdo se torne a identidade. Quando isso acontece, o lado direito terá se transformado exatamente em $A^{-1}$:\n\n$$[\\, A \\mid I \\,] \\longrightarrow [\\, I \\mid A^{-1} \\,]$$\n\nSe em algum momento surgir uma linha inteira de zeros no lado esquerdo, a matriz não pode virar a identidade e, portanto, é singular (não tem inversa).",
                    },
                    {
                        type: "text",
                        value: "**Exemplo resolvido.** Vamos inverter\n$$A = \\begin{pmatrix} 1 & 2 & 0 \\\\ 2 & 3 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}.$$\n\nMontamos a matriz aumentada e zeramos o elemento abaixo do primeiro pivô com a operação $L_2 \\to L_2 - 2L_1$:\n\n$$\\left[\\begin{array}{ccc|ccc} 1 & 2 & 0 & 1 & 0 & 0 \\\\ 2 & 3 & 0 & 0 & 1 & 0 \\\\ 0 & 0 & 1 & 0 & 0 & 1 \\end{array}\\right] \\longrightarrow \\left[\\begin{array}{ccc|ccc} 1 & 2 & 0 & 1 & 0 & 0 \\\\ 0 & -1 & 0 & -2 & 1 & 0 \\\\ 0 & 0 & 1 & 0 & 0 & 1 \\end{array}\\right]$$",
                    },
                    {
                        type: "text",
                        value: "Agora tornamos o pivô da segunda linha igual a 1 com $L_2 \\to -L_2$ e, em seguida, zeramos o elemento acima dele com $L_1 \\to L_1 - 2L_2$:\n\n$$\\left[\\begin{array}{ccc|ccc} 1 & 2 & 0 & 1 & 0 & 0 \\\\ 0 & 1 & 0 & 2 & -1 & 0 \\\\ 0 & 0 & 1 & 0 & 0 & 1 \\end{array}\\right] \\longrightarrow \\left[\\begin{array}{ccc|ccc} 1 & 0 & 0 & -3 & 2 & 0 \\\\ 0 & 1 & 0 & 2 & -1 & 0 \\\\ 0 & 0 & 1 & 0 & 0 & 1 \\end{array}\\right]$$\n\nO lado esquerdo virou a identidade, então o lado direito é a inversa procurada.",
                    },
                    {
                        type: "text",
                        value: "Portanto,\n$$A^{-1} = \\begin{pmatrix} -3 & 2 & 0 \\\\ 2 & -1 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}.$$\n\nVale sempre conferir o resultado calculando $A \\cdot A^{-1}$ e verificando que dá a identidade. Duas situações merecem destaque:\n\n- Se a matriz **for** invertível, o escalonamento sempre chega a $[\\, I \\mid A^{-1} \\,]$.\n- Se **não** for, surgirá uma linha de zeros à esquerda antes de completar a identidade, revelando que a matriz é singular.",
                    },
                    {
                        type: "quote",
                        value: "Escalonar é um roteiro fixo: as mesmas três operações, repetidas com paciência, resolvem sistemas, revelam se a inversa existe e a constroem quando existe.",
                    },
                    {
                        type: "text",
                        value: "**Resumo.** Para inverter uma matriz de qualquer ordem, montamos a matriz aumentada $[\\, A \\mid I \\,]$ e aplicamos operações elementares até obter $[\\, I \\mid A^{-1} \\,]$. As três operações permitidas são trocar linhas, multiplicar uma linha por escalar não nulo e somar a uma linha um múltiplo de outra. Se aparecer uma linha nula à esquerda, a matriz é singular. Esse método generaliza a fórmula $2 \\times 2$ e funciona em qualquer dimensão.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual das operações a seguir é uma operação elementar sobre as linhas de uma matriz?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Multiplicar uma linha por zero",
                                isCorrect: false,
                            },
                            {
                                text: "Trocar uma linha por uma coluna",
                                isCorrect: false,
                            },
                            {
                                text: "Somar a uma linha um múltiplo de outra linha",
                                isCorrect: true,
                            },
                            {
                                text: "Somar um mesmo número a todos os elementos de uma linha",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No método de Gauss-Jordan, partimos da matriz aumentada $[\\, A \\mid I \\,]$ e aplicamos operações elementares até obter:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$[\\, I \\mid A^{-1} \\,]$",
                                isCorrect: true,
                            },
                            {
                                text: "$[\\, A^{-1} \\mid I \\,]$",
                                isCorrect: false,
                            },
                            {
                                text: "$[\\, I \\mid A \\,]$",
                                isCorrect: false,
                            },
                            {
                                text: "$[\\, A^T \\mid I \\,]$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao escalonar $[\\, A \\mid I \\,]$, surge uma linha inteira de zeros no lado esquerdo. Isso indica que:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$A$ não é invertível (é singular)",
                                isCorrect: true,
                            },
                            {
                                text: "$A$ é a matriz identidade",
                                isCorrect: false,
                            },
                            {
                                text: "$A$ é simétrica",
                                isCorrect: false,
                            },
                            {
                                text: "o cálculo tem um erro e deve ser refeito",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Aplicando a operação $L_2 \\to L_2 - 3L_1$ na matriz $\\begin{pmatrix} 1 & 2 \\\\ 3 & 5 \\end{pmatrix}$, a nova segunda linha é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 0 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 0 & -1 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 6 & 11 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 0 & 2 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Usando escalonamento, a inversa de $\\begin{pmatrix} 1 & 2 \\\\ 1 & 3 \\end{pmatrix}$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 3 & 2 \\\\ 1 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} -3 & 2 \\\\ 1 & -1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 3 & -2 \\\\ -1 & 1 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & -2 \\\\ -1 & 3 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Determinantes",
        aulas: [
            {
                titulo: "Determinante de ordem 2 e 3",
                blocks: [
                    {
                        type: "text",
                        value: "## Determinante de ordem 2 e 3\n\nO **determinante** e um numero associado a toda matriz **quadrada**. Ele condensa a matriz inteira em um unico valor e serve para responder perguntas centrais da Algebra Linear, como saber se a matriz possui inversa ou se um sistema linear tem solucao unica.\n\nEscrevemos o determinante de uma matriz $A$ como $\\det(A)$ ou, de forma equivalente, trocando os parenteses da matriz por barras verticais. Neste modulo tratamos os casos de **ordem 2** e **ordem 3**, que possuem formulas diretas.",
                    },
                    {
                        type: "text",
                        value: "### Matriz de ordem 2\n\nDada $A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$, o determinante e o produto da diagonal principal menos o produto da diagonal secundaria:\n\n$$\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc$$\n\nA diagonal principal vai de $a$ ate $d$, e a secundaria vai de $b$ ate $c$. O sinal de subtracao entre os dois produtos e essencial.",
                    },
                    {
                        type: "quote",
                        value: "Um unico numero, o determinante, ja revela se a matriz pode ou nao ser invertida.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo resolvido (ordem 2)\n\nSeja $A = \\begin{pmatrix} 3 & 2 \\\\ 1 & 4 \\end{pmatrix}$. Aplicando a formula:\n\n$$\\det(A) = 3 \\cdot 4 - 2 \\cdot 1 = 12 - 2 = 10$$\n\nTrocar a ordem das diagonais mudaria o resultado, entao mantenha sempre principal menos secundaria.",
                    },
                    {
                        type: "text",
                        value: "### Matriz de ordem 3: regra de Sarrus\n\nPara $A = \\begin{pmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{pmatrix}$, a **regra de Sarrus** fornece:\n\n$$\\det(A) = a_{11}a_{22}a_{33} + a_{12}a_{23}a_{31} + a_{13}a_{21}a_{32} - a_{13}a_{22}a_{31} - a_{11}a_{23}a_{32} - a_{12}a_{21}a_{33}$$\n\nNa pratica, repetimos as duas primeiras colunas a direita da matriz, somamos os tres produtos das diagonais que descem para a direita e subtraimos os tres produtos das diagonais que descem para a esquerda.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo resolvido (ordem 3)\n\nSeja $B = \\begin{pmatrix} 2 & 0 & 1 \\\\ 1 & 3 & 2 \\\\ 4 & 1 & 5 \\end{pmatrix}$.\n\nSomando as diagonais principais:\n\n$$2 \\cdot 3 \\cdot 5 + 0 \\cdot 2 \\cdot 4 + 1 \\cdot 1 \\cdot 1 = 30 + 0 + 1 = 31$$\n\nSomando as diagonais secundarias:\n\n$$1 \\cdot 3 \\cdot 4 + 2 \\cdot 2 \\cdot 1 + 5 \\cdot 1 \\cdot 0 = 12 + 4 + 0 = 16$$\n\nPortanto $\\det(B) = 31 - 16 = 15$.",
                    },
                    {
                        type: "text",
                        value: "### Casos especiais e resumo\n\nVale a pena memorizar dois atalhos:\n\n- Em uma matriz **triangular** (com zeros de um lado da diagonal), o determinante e o **produto dos elementos da diagonal principal**.\n- A matriz **identidade** tem determinante igual a $1$.\n\n**Resumo.** Para ordem 2 use $ad - bc$. Para ordem 3 use Sarrus, com atencao aos sinais das diagonais secundarias. A regra de Sarrus vale **somente** para ordem 3; no proximo topico veremos um metodo geral por cofatores.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual e o determinante de $\\begin{pmatrix} 5 & 2 \\\\ 3 & 4 \\end{pmatrix}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$14$",
                                isCorrect: true,
                            },
                            {
                                text: "$-2$",
                                isCorrect: false,
                            },
                            {
                                text: "$-14$",
                                isCorrect: false,
                            },
                            {
                                text: "$26$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O determinante de $\\begin{pmatrix} 4 & -2 \\\\ 3 & 1 \\end{pmatrix}$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$10$",
                                isCorrect: true,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$-10$",
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
                            "Pela regra de Sarrus, o determinante de $\\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 4 \\\\ 5 & 6 & 0 \\end{pmatrix}$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-1$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$79$",
                                isCorrect: false,
                            },
                            {
                                text: "$39$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O determinante da matriz triangular $\\begin{pmatrix} 2 & 7 & -1 \\\\ 0 & 3 & 5 \\\\ 0 & 0 & 4 \\end{pmatrix}$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$-24$",
                                isCorrect: false,
                            },
                            {
                                text: "$24$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Pela regra de Sarrus, o determinante de $\\begin{pmatrix} 2 & -1 & 3 \\\\ 1 & 0 & -2 \\\\ 4 & 1 & 5 \\end{pmatrix}$ e:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$20$",
                                isCorrect: true,
                            },
                            {
                                text: "$11$",
                                isCorrect: false,
                            },
                            {
                                text: "$-20$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Determinante por cofatores (Laplace)",
                blocks: [
                    {
                        type: "text",
                        value: "## Determinante por cofatores (Laplace)\n\nA regra de Sarrus so funciona para matrizes de ordem 3. Para ordens maiores precisamos de um metodo geral: o **desenvolvimento de Laplace**, que calcula o determinante a partir de **menores** e **cofatores**.",
                    },
                    {
                        type: "text",
                        value: "### Menor e cofator\n\nO **menor complementar** $M_{ij}$ e o determinante da submatriz que sobra ao eliminar a linha $i$ e a coluna $j$.\n\nO **cofator** $C_{ij}$ e esse menor multiplicado por um sinal que depende da posicao:\n\n$$C_{ij} = (-1)^{i+j} \\, M_{ij}$$\n\nO fator $(-1)^{i+j}$ segue um padrao de tabuleiro de xadrez. Para ordem 3:\n\n$$\\begin{pmatrix} + & - & + \\\\ - & + & - \\\\ + & - & + \\end{pmatrix}$$",
                    },
                    {
                        type: "quote",
                        value: "Escolher a fila com mais zeros antes de expandir economiza um bom tempo de conta.",
                    },
                    {
                        type: "text",
                        value: "### O desenvolvimento de Laplace\n\nO determinante e a soma dos produtos dos elementos de uma fila (linha ou coluna) pelos seus respectivos cofatores. Expandindo pela linha $i$:\n\n$$\\det(A) = a_{i1}C_{i1} + a_{i2}C_{i2} + \\cdots + a_{in}C_{in}$$\n\nPodemos expandir por **qualquer** linha ou coluna, e o resultado e sempre o mesmo. A dica pratica e escolher a fila com **mais zeros**, pois cada zero anula um termo inteiro da soma.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo resolvido (ordem 3)\n\nVamos recalcular $B = \\begin{pmatrix} 2 & 0 & 1 \\\\ 1 & 3 & 2 \\\\ 4 & 1 & 5 \\end{pmatrix}$ expandindo pela **primeira linha**.\n\nOs cofatores necessarios sao:\n\n$$C_{11} = +\\begin{vmatrix} 3 & 2 \\\\ 1 & 5 \\end{vmatrix} = 15 - 2 = 13$$\n\n$$C_{13} = +\\begin{vmatrix} 1 & 3 \\\\ 4 & 1 \\end{vmatrix} = 1 - 12 = -11$$\n\nComo $a_{12} = 0$, o cofator $C_{12}$ nem precisa ser calculado. Logo:\n\n$$\\det(B) = 2 \\cdot 13 + 0 \\cdot C_{12} + 1 \\cdot (-11) = 26 - 11 = 15$$\n\nO valor bate com o obtido por Sarrus no topico anterior.",
                    },
                    {
                        type: "text",
                        value: "### Por que Laplace e mais geral\n\nA grande vantagem aparece em ordens maiores. Considere a matriz de ordem 4:\n\n$$\\begin{pmatrix} 2 & 1 & 0 & 3 \\\\ 0 & 0 & 4 & 0 \\\\ 1 & 2 & 0 & 1 \\\\ 3 & 0 & 0 & 2 \\end{pmatrix}$$\n\nA segunda linha tem tres zeros, entao expandimos por ela. So o termo com $a_{23} = 4$ sobrevive, e seu sinal e $(-1)^{2+3} = -1$:\n\n$$\\det = 4 \\cdot (-1) \\cdot \\begin{vmatrix} 2 & 1 & 3 \\\\ 1 & 2 & 1 \\\\ 3 & 0 & 2 \\end{vmatrix}$$\n\nO determinante $3 \\times 3$ restante vale $-9$ (por Sarrus), portanto $\\det = 4 \\cdot (-1) \\cdot (-9) = 36$.",
                    },
                    {
                        type: "text",
                        value: "### Resumo\n\n- Menor $M_{ij}$: determinante da submatriz sem a linha $i$ e a coluna $j$.\n- Cofator: $C_{ij} = (-1)^{i+j} M_{ij}$, com o sinal do tabuleiro de xadrez.\n- Laplace: some $a_{ij} C_{ij}$ ao longo de uma fila, de preferencia a que tiver mais zeros.\n\nO erro mais comum e esquecer o sinal $(-1)^{i+j}$ do cofator. Confira sempre a posicao antes de somar.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Numa matriz $3 \\times 3$, o cofator $C_{23}$ relaciona-se com o menor $M_{23}$ por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$C_{23} = (-1)^{2 \\cdot 3} M_{23}$",
                                isCorrect: false,
                            },
                            {
                                text: "$C_{23} = M_{23}$",
                                isCorrect: false,
                            },
                            {
                                text: "$C_{23} = M_{32}$",
                                isCorrect: false,
                            },
                            {
                                text: "$C_{23} = -M_{23}$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "O menor $M_{11}$ da matriz $\\begin{pmatrix} 2 & 1 & 4 \\\\ 0 & 3 & 5 \\\\ 1 & 2 & 6 \\end{pmatrix}$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$8$",
                                isCorrect: true,
                            },
                            {
                                text: "$28$",
                                isCorrect: false,
                            },
                            {
                                text: "$-8$",
                                isCorrect: false,
                            },
                            {
                                text: "$-28$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Expandindo por cofatores pela primeira linha, o determinante de $\\begin{pmatrix} 1 & 0 & 2 \\\\ 3 & 1 & 0 \\\\ 0 & 4 & 1 \\end{pmatrix}$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$23$",
                                isCorrect: false,
                            },
                            {
                                text: "$-23$",
                                isCorrect: false,
                            },
                            {
                                text: "$24$",
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
                            "Expandindo por Laplace, o determinante de $\\begin{pmatrix} 3 & 0 & 0 & 0 \\\\ 1 & 2 & 5 & 0 \\\\ 4 & 1 & 3 & 0 \\\\ 2 & 0 & 6 & 4 \\end{pmatrix}$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$24$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$12$",
                                isCorrect: true,
                            },
                            {
                                text: "$-12$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Expandindo pela segunda coluna, o determinante de $\\begin{pmatrix} 2 & 3 & 1 \\\\ 4 & 0 & 5 \\\\ 1 & 2 & 3 \\end{pmatrix}$ e:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$-9$",
                                isCorrect: false,
                            },
                            {
                                text: "$-33$",
                                isCorrect: true,
                            },
                            {
                                text: "$33$",
                                isCorrect: false,
                            },
                            {
                                text: "$-21$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Propriedades do determinante",
                blocks: [
                    {
                        type: "text",
                        value: "## Propriedades do determinante\n\nCalcular determinantes na forca bruta fica inviavel quando a ordem cresce. Felizmente, algumas **propriedades** permitem simplificar a matriz antes de calcular, ou ate tirar conclusoes sem calcular quase nada.",
                    },
                    {
                        type: "text",
                        value: "### Propriedades essenciais\n\nSeja $A$ uma matriz quadrada de ordem $n$.\n\n1. **Transposta:** $\\det(A^T) = \\det(A)$. Tudo o que vale para linhas vale igualmente para colunas.\n2. **Fila nula:** se uma linha ou coluna e toda de zeros, entao $\\det(A) = 0$.\n3. **Troca de filas:** trocar duas linhas (ou duas colunas) entre si **inverte o sinal** do determinante.\n4. **Filas proporcionais:** se duas linhas (ou colunas) sao iguais ou proporcionais, entao $\\det(A) = 0$.\n5. **Multiplicar uma fila por $k$:** multiplica o determinante por $k$.\n6. **Combinacao linear:** somar a uma linha um multiplo de outra **nao altera** o determinante.",
                    },
                    {
                        type: "text",
                        value: "### Tabela de operacoes\n\n| Operacao na matriz | Efeito no determinante |\n| --- | --- |\n| Trocar duas filas | Troca o sinal |\n| Multiplicar uma fila por $k$ | Fica multiplicado por $k$ |\n| Somar a uma fila um multiplo de outra | Nao muda |\n| Ter uma fila nula | Vale $0$ |\n| Ter duas filas proporcionais | Vale $0$ |\n| Transpor a matriz | Nao muda |",
                    },
                    {
                        type: "text",
                        value: "### Determinante de produtos e inversas\n\nTres identidades muito usadas:\n\n$$\\det(AB) = \\det(A)\\,\\det(B)$$\n\n$$\\det(kA) = k^n \\det(A)$$\n\n$$\\det(A^{-1}) = \\frac{1}{\\det(A)}$$\n\nAtencao ao fator $k^n$: ao multiplicar a matriz **inteira** por $k$, cada uma das $n$ linhas fica multiplicada por $k$, e os efeitos se acumulam.",
                    },
                    {
                        type: "quote",
                        value: "As propriedades transformam o calculo bracal do determinante em uma sequencia curta de simplificacoes.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo resolvido\n\nVamos calcular o determinante de $\\begin{pmatrix} 1 & 2 & 3 \\\\ 2 & 5 & 8 \\\\ 1 & 1 & 2 \\end{pmatrix}$ escalonando por linhas.\n\nFazendo $L_2 \\to L_2 - 2L_1$ e $L_3 \\to L_3 - L_1$ (operacoes que nao mudam o determinante):\n\n$$\\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 2 \\\\ 0 & -1 & -1 \\end{pmatrix}$$\n\nAgora $L_3 \\to L_3 + L_2$:\n\n$$\\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 2 \\\\ 0 & 0 & 1 \\end{pmatrix}$$\n\nA matriz ficou triangular, entao o determinante e o produto da diagonal: $1 \\cdot 1 \\cdot 1 = 1$.",
                    },
                    {
                        type: "text",
                        value: "### Resumo\n\nAntes de calcular um determinante, olhe para a matriz. Uma fila nula ou duas filas proporcionais ja entregam $0$. Trocas de filas custam apenas um sinal, e combinacoes lineares saem de graca, o que torna o escalonamento a estrategia mais eficiente para ordens altas.",
                    },
                ],
                questions: [
                    {
                        statement: "Se $\\det(A) = 7$, quanto vale $\\det(A^T)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$7$",
                                isCorrect: true,
                            },
                            {
                                text: "$-7$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{7}$",
                                isCorrect: false,
                            },
                            {
                                text: "$49$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma matriz quadrada que possui uma linha inteira de zeros tem determinante igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "o produto da diagonal",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "um valor indefinido",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A matriz $B$ e obtida de $A$ trocando duas linhas entre si. Se $\\det(A) = 5$, entao $\\det(B)$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$10$",
                                isCorrect: false,
                            },
                            {
                                text: "$-10$",
                                isCorrect: false,
                            },
                            {
                                text: "$-5$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $A$ e de ordem $3$ e $\\det(A) = 2$, entao $\\det(3A)$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$18$",
                                isCorrect: false,
                            },
                            {
                                text: "$162$",
                                isCorrect: false,
                            },
                            {
                                text: "$54$",
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
                            "Sejam $A$ e $B$ matrizes de ordem $n$ com $\\det(A) = 4$ e $\\det(B) = 3$. O valor de $\\det(AB^{-1})$ e:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{4}{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$7$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{3}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$12$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Determinante, inversa e sistemas",
                blocks: [
                    {
                        type: "text",
                        value: "## Determinante, inversa e sistemas\n\nO determinante e o teste definitivo de invertibilidade. Nesta aula ligamos $\\det(A)$ a existencia da matriz inversa e a unicidade da solucao de sistemas lineares.",
                    },
                    {
                        type: "text",
                        value: "### O criterio de invertibilidade\n\nUma matriz quadrada $A$ e **invertivel** (tambem dita **nao singular**) se e somente se:\n\n$$\\det(A) \\neq 0$$\n\nSe $\\det(A) = 0$, dizemos que $A$ e **singular**, e ela **nao** admite inversa. Esse unico teste resolve a questao sem precisar tentar construir a inversa.",
                    },
                    {
                        type: "text",
                        value: "### Inversa de uma matriz de ordem 2\n\nPara $A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$ com $\\det(A) = ad - bc \\neq 0$:\n\n$$A^{-1} = \\frac{1}{ad - bc} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$$\n\nRepare no padrao: trocam-se $a$ e $d$ de posicao, invertem-se os sinais de $b$ e $c$, e divide-se tudo pelo determinante.",
                    },
                    {
                        type: "quote",
                        value: "Se o determinante zera, a inversa desaparece e o sistema perde a garantia de solucao unica.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo resolvido (inversa)\n\nSeja $A = \\begin{pmatrix} 4 & 3 \\\\ 2 & 2 \\end{pmatrix}$. Como $\\det(A) = 4 \\cdot 2 - 3 \\cdot 2 = 2 \\neq 0$, a inversa existe:\n\n$$A^{-1} = \\frac{1}{2} \\begin{pmatrix} 2 & -3 \\\\ -2 & 4 \\end{pmatrix} = \\begin{pmatrix} 1 & -\\frac{3}{2} \\\\ -1 & 2 \\end{pmatrix}$$\n\nMultiplicando $A \\cdot A^{-1}$ obtemos a matriz identidade, o que confirma o resultado.",
                    },
                    {
                        type: "text",
                        value: "### Ligacao com sistemas lineares\n\nConsidere o sistema $Ax = b$ com $A$ quadrada.\n\n- Se $\\det(A) \\neq 0$, o sistema tem **solucao unica** dada por $x = A^{-1}b$.\n- Se $\\det(A) = 0$, o sistema **nao** tem solucao unica (pode nao ter solucao, ou ter infinitas).\n\nNo caso **homogeneo** $Ax = 0$, sempre existe a solucao trivial $x = 0$. Uma solucao **nao trivial** so aparece quando $\\det(A) = 0$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo resolvido (sistema)\n\nO sistema $\\begin{cases} 2x + y = 5 \\\\ 4x + 2y = 3 \\end{cases}$ tem matriz de coeficientes $\\begin{pmatrix} 2 & 1 \\\\ 4 & 2 \\end{pmatrix}$.\n\nSeu determinante e $2 \\cdot 2 - 1 \\cdot 4 = 0$, entao a matriz e singular e o sistema **nao** tem solucao unica. De fato, a segunda equacao tem coeficientes que sao o dobro da primeira, mas os termos independentes nao seguem a mesma proporcao, logo o sistema e impossivel.",
                    },
                    {
                        type: "text",
                        value: "### Resumo\n\nO determinante concentra em um numero a resposta para invertibilidade e unicidade: se $\\det(A) \\neq 0$, a matriz tem inversa e o sistema $Ax = b$ tem solucao unica; se $\\det(A) = 0$, nada disso e garantido. Guarde bem a formula da inversa de ordem 2, que cai com frequencia.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A matriz $\\begin{pmatrix} 2 & 4 \\\\ 1 & 2 \\end{pmatrix}$ e invertivel?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Sim, pois $\\det = 2$",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, pois $\\det = 8$",
                                isCorrect: false,
                            },
                            {
                                text: "Nao, pois $\\det = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "Nao, pois ela e quadrada",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Se $\\det(A) = 0$, entao a matriz quadrada $A$:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "e a matriz identidade",
                                isCorrect: false,
                            },
                            {
                                text: "e invertivel",
                                isCorrect: false,
                            },
                            {
                                text: "nao e invertivel",
                                isCorrect: true,
                            },
                            {
                                text: "tem uma unica inversa",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A inversa de $\\begin{pmatrix} 3 & 1 \\\\ 5 & 2 \\end{pmatrix}$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 2 & -1 \\\\ -5 & 3 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} -2 & 1 \\\\ 5 & -3 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 3 & -1 \\\\ -5 & 2 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 2 & 1 \\\\ 5 & 3 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O sistema homogeneo $Ax = 0$ admite solucao nao trivial se e somente se:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$A$ e quadrada",
                                isCorrect: false,
                            },
                            {
                                text: "$A = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\det(A) \\neq 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\det(A) = 0$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para qual valor de $k$ a matriz $\\begin{pmatrix} 2 & 1 & 0 \\\\ 1 & k & 1 \\\\ 0 & 1 & 2 \\end{pmatrix}$ e singular?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$k = 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = -1$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = 1$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Regra de Cramer",
                blocks: [
                    {
                        type: "text",
                        value: "## Regra de Cramer\n\nA **regra de Cramer** resolve sistemas lineares quadrados usando apenas determinantes. Ela e elegante e direta, ideal para sistemas de ordem 2 e 3 que tenham solucao unica.",
                    },
                    {
                        type: "text",
                        value: "### O enunciado\n\nSeja $Ax = b$ um sistema com $A$ quadrada de ordem $n$ e $\\det(A) \\neq 0$. Entao cada incognita e um quociente de determinantes:\n\n$$x_i = \\frac{\\det(A_i)}{\\det(A)}$$\n\nAqui $A_i$ e a matriz $A$ com a **coluna $i$ substituida pela coluna dos termos independentes** $b$. A condicao $\\det(A) \\neq 0$ e indispensavel, pois o determinante aparece no denominador.",
                    },
                    {
                        type: "quote",
                        value: "Cada incognita vira um quociente de determinantes, e resolver o sistema vira pura aritmetica.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo resolvido (ordem 2)\n\nResolva $\\begin{cases} 2x + 3y = 8 \\\\ x - y = -1 \\end{cases}$.\n\nA matriz dos coeficientes e $A = \\begin{pmatrix} 2 & 3 \\\\ 1 & -1 \\end{pmatrix}$, com $\\det(A) = -2 - 3 = -5$.\n\nSubstituindo a primeira coluna por $b$:\n\n$$\\det(A_x) = \\begin{vmatrix} 8 & 3 \\\\ -1 & -1 \\end{vmatrix} = -8 + 3 = -5 \\quad\\Rightarrow\\quad x = \\frac{-5}{-5} = 1$$\n\nSubstituindo a segunda coluna por $b$:\n\n$$\\det(A_y) = \\begin{vmatrix} 2 & 8 \\\\ 1 & -1 \\end{vmatrix} = -2 - 8 = -10 \\quad\\Rightarrow\\quad y = \\frac{-10}{-5} = 2$$\n\nA solucao e $(x, y) = (1, 2)$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo resolvido (ordem 3)\n\nResolva $\\begin{cases} x + y + z = 6 \\\\ 2x - y + z = 3 \\\\ x + 2y - z = 2 \\end{cases}$.\n\nA matriz $A = \\begin{pmatrix} 1 & 1 & 1 \\\\ 2 & -1 & 1 \\\\ 1 & 2 & -1 \\end{pmatrix}$ tem $\\det(A) = 7$ (por Sarrus).\n\nTrocando cada coluna pela coluna $b = \\begin{pmatrix} 6 \\\\ 3 \\\\ 2 \\end{pmatrix}$ e calculando os determinantes:\n\n$$\\det(A_x) = 7, \\qquad \\det(A_y) = 14, \\qquad \\det(A_z) = 21$$\n\nLogo $x = \\frac{7}{7} = 1$, $y = \\frac{14}{7} = 2$ e $z = \\frac{21}{7} = 3$. A solucao e $(1, 2, 3)$.",
                    },
                    {
                        type: "text",
                        value: "### Quando a regra nao se aplica\n\nSe $\\det(A) = 0$, a divisao fica impossivel e a regra de Cramer **nao** pode ser usada. Nesse caso o sistema nao tem solucao unica, e recorremos a outros metodos, como o escalonamento.\n\nVale lembrar que Cramer e excelente na teoria e para ordens pequenas, mas fica computacionalmente caro em ordens altas, pois exige calcular varios determinantes.",
                    },
                    {
                        type: "text",
                        value: "### Resumo\n\nPara aplicar Cramer: calcule $\\det(A)$ e confirme que e diferente de zero. Depois, para cada incognita, substitua a coluna correspondente pela coluna dos termos independentes, calcule o novo determinante e divida por $\\det(A)$. O erro classico e usar a coluna trocada, entao marque bem qual coluna corresponde a cada variavel.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Na regra de Cramer, para o sistema $Ax = b$, a incognita $x_i$ e dada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{\\det(A_i)}{\\det(A)}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\det(A)}{\\det(A_i)}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\det(A)}{\\det(b)}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\det(A_i)\\,\\det(A)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A regra de Cramer pode ser aplicada ao sistema $Ax = b$ quando:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$A$ nao e quadrada",
                                isCorrect: false,
                            },
                            {
                                text: "$\\det(A) = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\det(A) \\neq 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$b = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No sistema $\\begin{cases} x + 2y = 4 \\\\ 3x - y = 5 \\end{cases}$, o valor de $x$ pela regra de Cramer e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$14$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$-2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No sistema $\\begin{cases} 2x + y = 7 \\\\ x + 3y = 11 \\end{cases}$, o valor de $y$ pela regra de Cramer e:",
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
                                text: "$5$",
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
                            "No sistema $\\begin{cases} x + y + z = 6 \\\\ x - y + 2z = 5 \\\\ 2x + y - z = 1 \\end{cases}$, pela regra de Cramer o numerador de $y$ e o determinante de:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 1 & 6 & 1 \\\\ 1 & 5 & 2 \\\\ 2 & 1 & -1 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 1 & 6 \\\\ 1 & -1 & 5 \\\\ 2 & 1 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 1 & 1 \\\\ 6 & 5 & 1 \\\\ 2 & 1 & -1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 6 & 1 & 1 \\\\ 5 & -1 & 2 \\\\ 1 & 1 & -1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Vetores e espaços vetoriais",
        aulas: [
            {
                titulo: "Vetores no espaço $\\mathbb{R}^n$",
                blocks: [
                    {
                        type: "text",
                        value: "## O espaço $\\mathbb{R}^n$\n\nO conjunto $\\mathbb{R}^n$ é formado por todas as **ênuplas ordenadas** de números reais, ou seja, sequências com $n$ entradas:\n$$\\mathbb{R}^n = \\{ (x_1, x_2, \\dots, x_n) : x_i \\in \\mathbb{R} \\}.$$\nCada elemento de $\\mathbb{R}^n$ é chamado de **vetor**, e cada $x_i$ é uma **componente** (ou coordenada) do vetor. Quando $n = 2$ temos o plano $\\mathbb{R}^2$ e quando $n = 3$ temos o espaço tridimensional $\\mathbb{R}^3$, os casos que conseguimos visualizar geometricamente.\n\nÉ comum representar um vetor na forma de coluna:\n$$v = \\begin{pmatrix} x_1 \\\\ x_2 \\\\ \\vdots \\\\ x_n \\end{pmatrix}.$$\nDois vetores são **iguais** quando têm o mesmo número de componentes e todas as componentes correspondentes coincidem.",
                    },
                    {
                        type: "text",
                        value: "## Operações com vetores\n\nEm $\\mathbb{R}^n$ definimos duas operações fundamentais. Sejam $u = (u_1, \\dots, u_n)$ e $v = (v_1, \\dots, v_n)$ vetores e $\\alpha \\in \\mathbb{R}$ um escalar.\n\nA **soma** é feita componente a componente:\n$$u + v = (u_1 + v_1, \\; u_2 + v_2, \\; \\dots, \\; u_n + v_n).$$\nA **multiplicação por escalar** multiplica cada componente pelo mesmo número:\n$$\\alpha v = (\\alpha v_1, \\; \\alpha v_2, \\; \\dots, \\; \\alpha v_n).$$\nO vetor com todas as componentes nulas, $0 = (0, 0, \\dots, 0)$, é o **vetor nulo**. Para cada $v$, o vetor $-v = (-v_1, \\dots, -v_n)$ é o seu **oposto**, e vale $v + (-v) = 0$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: somando e escalando\n\nConsidere os vetores de $\\mathbb{R}^3$\n$$u = \\begin{pmatrix} 2 \\\\ -1 \\\\ 3 \\end{pmatrix}, \\qquad v = \\begin{pmatrix} 0 \\\\ 4 \\\\ -2 \\end{pmatrix}.$$\nVamos calcular $2u + 3v$ passo a passo. Primeiro multiplicamos cada vetor pelo seu escalar:\n$$2u = \\begin{pmatrix} 4 \\\\ -2 \\\\ 6 \\end{pmatrix}, \\qquad 3v = \\begin{pmatrix} 0 \\\\ 12 \\\\ -6 \\end{pmatrix}.$$\nAgora somamos componente a componente:\n$$2u + 3v = \\begin{pmatrix} 4 + 0 \\\\ -2 + 12 \\\\ 6 - 6 \\end{pmatrix} = \\begin{pmatrix} 4 \\\\ 10 \\\\ 0 \\end{pmatrix}.$$\nO resultado é o vetor $(4, 10, 0)$.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades das operações\n\nAs operações de soma e multiplicação por escalar em $\\mathbb{R}^n$ satisfazem, para quaisquer vetores $u, v, w$ e escalares $\\alpha, \\beta$:\n\n| Propriedade | Identidade |\n| --- | --- |\n| Comutativa da soma | $u + v = v + u$ |\n| Associativa da soma | $(u + v) + w = u + (v + w)$ |\n| Elemento neutro | $v + 0 = v$ |\n| Elemento oposto | $v + (-v) = 0$ |\n| Distributiva nos vetores | $\\alpha(u + v) = \\alpha u + \\alpha v$ |\n| Distributiva nos escalares | $(\\alpha + \\beta)v = \\alpha v + \\beta v$ |\n| Associativa do produto | $\\alpha(\\beta v) = (\\alpha\\beta)v$ |\n| Escalar unitário | $1 \\cdot v = v$ |\n\nEssas oito propriedades são exatamente os axiomas que, mais adiante, definem um espaço vetorial abstrato.",
                    },
                    {
                        type: "quote",
                        value: "Um vetor não é apenas uma flecha na lousa: é qualquer objeto que possamos somar e multiplicar por números respeitando as mesmas regras.",
                    },
                    {
                        type: "text",
                        value: "## Interpretação geométrica\n\nNo plano $\\mathbb{R}^2$, o vetor $v = (v_1, v_2)$ pode ser visto como uma seta que parte da origem e chega ao ponto de coordenadas $(v_1, v_2)$. A soma $u + v$ corresponde à **regra do paralelogramo**, e multiplicar por um escalar $\\alpha$ estica o vetor (se $|\\alpha| > 1$), encolhe (se $0 < |\\alpha| < 1$) ou inverte o sentido (se $\\alpha < 0$).\n\nPor exemplo, com $u = (3, 1)$ e $v = (1, 2)$, temos $u + v = (4, 3)$, que é a diagonal do paralelogramo formado por $u$ e $v$. Já $-2u = (-6, -2)$ aponta no sentido contrário a $u$ e tem o dobro do comprimento.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $\\mathbb{R}^n$ é o conjunto das ênuplas ordenadas de números reais, e seus elementos são chamados vetores.\n- A soma e a multiplicação por escalar são feitas componente a componente.\n- O vetor nulo $0$ é o elemento neutro da soma, e cada vetor tem um oposto.\n- As oito propriedades das operações são a base para a definição de espaço vetorial.\n- Em $\\mathbb{R}^2$ e $\\mathbb{R}^3$ as operações têm interpretação geométrica clara, como a regra do paralelogramo.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Sejam $u = (1, 2, -1)$ e $v = (3, 0, 2)$ em $\\mathbb{R}^3$. Quanto vale $u + v$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(4, 2, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(-2, 2, -3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 0, -2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(4, 2, 3)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Dado o vetor $v = (2, -3, 1)$, qual é o vetor $3v$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(6, -9, 3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(6, -3, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(5, 0, 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(6, 9, 3)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $u = (1, -2)$ e $v = (4, 3)$. O vetor $2u - v$ é igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(-2, -7)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(6, -1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-2, -1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-6, -10)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em $\\mathbb{R}^n$, qual igualdade é sempre verdadeira para todo vetor $v$ e escalar $\\alpha$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1 \\cdot v = v$",
                                isCorrect: true,
                            },
                            {
                                text: "$0 \\cdot v = v$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\alpha(u + v) = \\alpha u + v$",
                                isCorrect: false,
                            },
                            {
                                text: "$u + v = u - v$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para quais escalares vale $\\alpha(1, 2) + \\beta(0, 1) = (3, 5)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\alpha = 3, \\; \\beta = -1$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\alpha = 3, \\; \\beta = -5$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\alpha = -1, \\; \\beta = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\alpha = 5, \\; \\beta = 3$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Combinação linear e espaço gerado",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é uma combinação linear\n\nDados vetores $v_1, v_2, \\dots, v_k$ em $\\mathbb{R}^n$ e escalares $a_1, a_2, \\dots, a_k \\in \\mathbb{R}$, o vetor\n$$v = a_1 v_1 + a_2 v_2 + \\dots + a_k v_k$$\né chamado de **combinação linear** dos vetores $v_1, \\dots, v_k$. Os escalares $a_i$ são os **coeficientes** da combinação.\n\nEm palavras, uma combinação linear é qualquer vetor que possamos obter esticando cada $v_i$ por um fator e somando os resultados. Perguntar se um vetor $w$ é combinação linear de $v_1, \\dots, v_k$ equivale a perguntar se existem coeficientes $a_1, \\dots, a_k$ que satisfaçam a igualdade acima, o que sempre recai em resolver um sistema linear.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: montando uma combinação linear\n\nSejam $v_1 = (1, 0, 2)$ e $v_2 = (0, 1, -1)$ em $\\mathbb{R}^3$. A combinação linear com coeficientes $a_1 = 3$ e $a_2 = 2$ é\n$$3 v_1 + 2 v_2 = 3\\begin{pmatrix} 1 \\\\ 0 \\\\ 2 \\end{pmatrix} + 2\\begin{pmatrix} 0 \\\\ 1 \\\\ -1 \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ 0 \\\\ 6 \\end{pmatrix} + \\begin{pmatrix} 0 \\\\ 2 \\\\ -2 \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ 2 \\\\ 4 \\end{pmatrix}.$$\nPortanto o vetor $(3, 2, 4)$ é uma combinação linear de $v_1$ e $v_2$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: um vetor é combinação linear de outros?\n\nVamos verificar se $w = (5, 4)$ é combinação linear de $v_1 = (1, 1)$ e $v_2 = (1, -1)$. Precisamos encontrar $a_1, a_2$ tais que\n$$a_1 (1, 1) + a_2 (1, -1) = (5, 4).$$\nIgualando componente a componente, obtemos o sistema\n$$\\begin{cases} a_1 + a_2 = 5 \\\\ a_1 - a_2 = 4 \\end{cases}$$\nSomando as duas equações vem $2 a_1 = 9$, logo $a_1 = \\frac{9}{2}$. Substituindo na primeira, $a_2 = 5 - \\frac{9}{2} = \\frac{1}{2}$. Como encontramos coeficientes reais, concluímos que\n$$w = \\frac{9}{2} v_1 + \\frac{1}{2} v_2,$$\nou seja, $w$ é de fato uma combinação linear de $v_1$ e $v_2$.",
                    },
                    {
                        type: "text",
                        value: "## Espaço gerado\n\nO **espaço gerado** (ou span) dos vetores $v_1, \\dots, v_k$ é o conjunto de **todas** as combinações lineares possíveis desses vetores:\n$$[v_1, \\dots, v_k] = \\{ a_1 v_1 + \\dots + a_k v_k : a_1, \\dots, a_k \\in \\mathbb{R} \\}.$$\nTambém se escreve $\\text{span}(v_1, \\dots, v_k)$. Dizemos que os vetores $v_1, \\dots, v_k$ **geram** esse conjunto. Uma consequência importante: o espaço gerado nunca é vazio, pois tomando todos os coeficientes iguais a zero obtemos o vetor nulo. Assim, o vetor $0$ sempre pertence ao espaço gerado.",
                    },
                    {
                        type: "quote",
                        value: "Gerar um espaço é como ter um conjunto de ingredientes: o span reúne todos os pratos que dá para preparar combinando essas quantidades de qualquer maneira.",
                    },
                    {
                        type: "text",
                        value: "## Interpretação geométrica do span\n\nO aspecto do espaço gerado depende dos vetores escolhidos:\n\n- O span de um único vetor não nulo $v$ é a **reta** que passa pela origem na direção de $v$.\n- O span de dois vetores não paralelos em $\\mathbb{R}^3$ é um **plano** que passa pela origem.\n- Se um dos vetores já é combinação linear dos outros, ele não acrescenta nada, e o span permanece o mesmo.\n\nPor exemplo, em $\\mathbb{R}^3$ o span de $(1, 0, 0)$ e $(0, 1, 0)$ é o plano $z = 0$, formado por todos os vetores da forma $(a, b, 0)$. Acrescentar o vetor $(2, 3, 0)$, que já está nesse plano, não amplia o conjunto gerado.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma combinação linear de $v_1, \\dots, v_k$ é um vetor da forma $a_1 v_1 + \\dots + a_k v_k$.\n- Decidir se $w$ é combinação linear dos $v_i$ significa resolver um sistema linear nos coeficientes.\n- O espaço gerado $[v_1, \\dots, v_k]$ reúne todas as combinações lineares desses vetores.\n- O vetor nulo pertence a qualquer espaço gerado.\n- Geometricamente, o span pode ser uma reta, um plano ou todo o espaço, conforme os vetores.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Sejam $v_1 = (1, 2)$ e $v_2 = (3, -1)$. A combinação linear $2 v_1 + v_2$ é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(5, 3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(5, 5)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(4, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 8)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O espaço gerado por um único vetor não nulo $v$ em $\\mathbb{R}^3$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "uma reta que passa pela origem",
                                isCorrect: true,
                            },
                            {
                                text: "um plano que passa pela origem",
                                isCorrect: false,
                            },
                            {
                                text: "todo o espaço $\\mathbb{R}^3$",
                                isCorrect: false,
                            },
                            {
                                text: "apenas o vetor nulo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O vetor $(0, 0)$ pertence ao espaço gerado por $v_1 = (1, 3)$ e $v_2 = (2, 5)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Sim, pois $0 v_1 + 0 v_2 = (0, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "Não, nenhum coeficiente gera o nulo",
                                isCorrect: false,
                            },
                            {
                                text: "Somente se $v_1$ e $v_2$ forem paralelos",
                                isCorrect: false,
                            },
                            {
                                text: "Somente se $v_1 = v_2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que $w = (7, 1)$ seja combinação linear de $v_1 = (1, 1)$ e $v_2 = (1, -1)$, os coeficientes são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$a_1 = 4, \\; a_2 = 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$a_1 = 3, \\; a_2 = 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$a_1 = 7, \\; a_2 = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$a_1 = 4, \\; a_2 = -3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em $\\mathbb{R}^3$, qual vetor NÃO pertence ao span de $(1, 0, 0)$ e $(0, 1, 0)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$(0, 0, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(2, 3, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-1, 5, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(4, 0, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Dependência e independência linear",
                blocks: [
                    {
                        type: "text",
                        value: "## Independência e dependência linear\n\nConsidere vetores $v_1, v_2, \\dots, v_k$ em $\\mathbb{R}^n$. Analisamos a equação vetorial\n$$a_1 v_1 + a_2 v_2 + \\dots + a_k v_k = 0.$$\nEssa igualdade sempre admite a solução trivial $a_1 = a_2 = \\dots = a_k = 0$. A questão é saber se existe **outra** solução.\n\n- Se a **única** solução for a trivial, os vetores são **linearmente independentes** (LI).\n- Se existir alguma solução com pelo menos um coeficiente diferente de zero, os vetores são **linearmente dependentes** (LD).\n\nIntuitivamente, um conjunto é LD quando ao menos um dos vetores pode ser escrito como combinação linear dos demais, ou seja, algum vetor é redundante.",
                    },
                    {
                        type: "text",
                        value: "## Como testar na prática\n\nPara decidir entre LI e LD, montamos o sistema homogêneo associado à equação $a_1 v_1 + \\dots + a_k v_k = 0$ e o resolvemos:\n\n- Se o sistema tiver **apenas** a solução nula, o conjunto é LI.\n- Se tiver **infinitas** soluções, isto é, alguma não nula, o conjunto é LD.\n\nUm caminho prático é montar a matriz cujas colunas são os vetores e escaloná-la. Se toda coluna tiver pivô, o conjunto é LI; se sobrar alguma coluna sem pivô, é LD.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: um conjunto linearmente independente\n\nVamos testar $v_1 = (1, 0, 0)$, $v_2 = (1, 1, 0)$ e $v_3 = (1, 1, 1)$. Impondo $a_1 v_1 + a_2 v_2 + a_3 v_3 = 0$, chegamos ao sistema\n$$\\begin{cases} a_1 + a_2 + a_3 = 0 \\\\ a_2 + a_3 = 0 \\\\ a_3 = 0 \\end{cases}$$\nDa terceira equação, $a_3 = 0$. Substituindo na segunda, $a_2 = 0$. Por fim, na primeira, $a_1 = 0$. A única solução é a trivial, portanto $\\{v_1, v_2, v_3\\}$ é **linearmente independente**.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: um conjunto linearmente dependente\n\nAgora considere $v_1 = (1, 2)$ e $v_2 = (2, 4)$. Observe que $v_2 = 2 v_1$, isto é,\n$$2 v_1 - v_2 = 0,$$\numa combinação nula com coeficientes $2$ e $-1$, que não são ambos zero. Logo $\\{v_1, v_2\\}$ é **linearmente dependente**.\n\nDe modo geral, dois vetores em $\\mathbb{R}^n$ são LD exatamente quando um é múltiplo escalar do outro, ou seja, quando são paralelos.",
                    },
                    {
                        type: "quote",
                        value: "Independência linear é ausência de redundância: cada vetor do conjunto aponta para uma direção que os outros, juntos, não conseguem alcançar.",
                    },
                    {
                        type: "text",
                        value: "## Fatos úteis\n\nAlguns resultados ajudam a decidir rapidamente:\n\n- Todo conjunto que **contém o vetor nulo** é LD, pois $1 \\cdot 0 = 0$ já é uma combinação nula não trivial.\n- Em $\\mathbb{R}^n$, qualquer conjunto com **mais de $n$ vetores** é automaticamente LD.\n- Um único vetor $v$ é LI se, e somente se, $v \\ne 0$.\n- Se um subconjunto já é LD, então o conjunto todo também é LD.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A equação $a_1 v_1 + \\dots + a_k v_k = 0$ sempre tem a solução trivial; o que importa é se há outra.\n- Apenas a trivial significa LI; existir solução não trivial significa LD.\n- Testar LI ou LD é resolver um sistema homogêneo, ou escalonar a matriz das colunas.\n- Dois vetores são LD exatamente quando um é múltiplo do outro.\n- Conjuntos com o vetor nulo, ou com mais de $n$ vetores em $\\mathbb{R}^n$, são sempre LD.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Os vetores $v_1 = (1, 2)$ e $v_2 = (3, 6)$ em $\\mathbb{R}^2$ são:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "linearmente dependentes",
                                isCorrect: true,
                            },
                            {
                                text: "linearmente independentes",
                                isCorrect: false,
                            },
                            {
                                text: "uma base de $\\mathbb{R}^2$",
                                isCorrect: false,
                            },
                            {
                                text: "ortogonais entre si",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual conjunto de vetores é sempre linearmente dependente?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "todo conjunto com o vetor nulo",
                                isCorrect: true,
                            },
                            {
                                text: "todo conjunto de vetores não nulos",
                                isCorrect: false,
                            },
                            {
                                text: "todo conjunto que gera $\\mathbb{R}^n$",
                                isCorrect: false,
                            },
                            {
                                text: "todo conjunto com dois ou mais vetores",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em $\\mathbb{R}^2$, um conjunto formado por $3$ vetores é sempre:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "linearmente dependente",
                                isCorrect: true,
                            },
                            {
                                text: "linearmente independente",
                                isCorrect: false,
                            },
                            {
                                text: "uma base do plano",
                                isCorrect: false,
                            },
                            {
                                text: "um conjunto gerador e LI",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Os vetores $(1, 0, 0)$, $(0, 1, 0)$ e $(0, 0, 1)$ em $\\mathbb{R}^3$ são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "linearmente independentes",
                                isCorrect: true,
                            },
                            {
                                text: "linearmente dependentes",
                                isCorrect: false,
                            },
                            {
                                text: "todos paralelos entre si",
                                isCorrect: false,
                            },
                            {
                                text: "todos iguais ao vetor nulo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para qual valor de $k$ os vetores $v_1 = (1, 2)$ e $v_2 = (3, k)$ são linearmente dependentes?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$k = 6$",
                                isCorrect: true,
                            },
                            {
                                text: "$k = 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = 5$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Subespaços vetoriais",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é um subespaço vetorial\n\nSeja $V$ um espaço vetorial, por exemplo $\\mathbb{R}^n$. Um subconjunto $W \\subseteq V$ é um **subespaço vetorial** de $V$ quando ele próprio é um espaço vetorial com as mesmas operações. Na prática, não é preciso verificar os oito axiomas: basta checar três condições.\n\nUm subconjunto $W$ é subespaço de $V$ se, e somente se:\n\n1. O vetor nulo pertence a $W$, isto é, $0 \\in W$, e em particular $W$ não é vazio.\n2. $W$ é **fechado para a soma**: se $u, v \\in W$, então $u + v \\in W$.\n3. $W$ é **fechado para a multiplicação por escalar**: se $v \\in W$ e $\\alpha \\in \\mathbb{R}$, então $\\alpha v \\in W$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: verificando um subespaço\n\nConsidere $W = \\{ (x, y, z) \\in \\mathbb{R}^3 : x + y + z = 0 \\}$, o conjunto dos vetores cuja soma das componentes é zero. Vamos checar as três condições.\n\n**Vetor nulo:** para $(0, 0, 0)$ temos $0 + 0 + 0 = 0$, então $0 \\in W$.\n\n**Soma:** sejam $u = (x_1, y_1, z_1)$ e $v = (x_2, y_2, z_2)$ em $W$, de modo que $x_1 + y_1 + z_1 = 0$ e $x_2 + y_2 + z_2 = 0$. As componentes de $u + v$ somam\n$$(x_1 + x_2) + (y_1 + y_2) + (z_1 + z_2) = 0 + 0 = 0,$$\nlogo $u + v \\in W$.\n\n**Escalar:** para $\\alpha v$, a soma das componentes é $\\alpha(x_2 + y_2 + z_2) = \\alpha \\cdot 0 = 0$, então $\\alpha v \\in W$. As três condições valem, portanto $W$ é um subespaço de $\\mathbb{R}^3$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: um conjunto que não é subespaço\n\nSeja $S = \\{ (x, y) \\in \\mathbb{R}^2 : x + y = 1 \\}$, uma reta que **não** passa pela origem. Testando o vetor nulo: $0 + 0 = 0 \\ne 1$, então $(0, 0) \\notin S$.\n\nComo a primeira condição já falha, $S$ não é subespaço. Também poderíamos notar que $(1, 0) \\in S$ e $(0, 1) \\in S$, mas a soma $(1, 1)$ dá $1 + 1 = 2 \\ne 1$, ou seja, $S$ não é fechado para a soma. Retas e planos que não passam pela origem nunca são subespaços.",
                    },
                    {
                        type: "text",
                        value: "## Subespaços importantes\n\nAlguns subespaços aparecem com frequência:\n\n- O conjunto $\\{0\\}$ formado apenas pelo vetor nulo é sempre subespaço, chamado de **subespaço trivial**.\n- O próprio espaço $V$ é subespaço de si mesmo.\n- O espaço gerado $[v_1, \\dots, v_k]$ por quaisquer vetores é sempre um subespaço.\n- O conjunto das soluções de um sistema linear **homogêneo** $Ax = 0$ é sempre um subespaço.\n\nEsses dois últimos fatos são muito úteis: para provar que um conjunto é subespaço, muitas vezes basta reconhecê-lo como um span ou como o conjunto solução de um sistema homogêneo.",
                    },
                    {
                        type: "quote",
                        value: "Passar pela origem não é um detalhe: é a fronteira entre um conjunto que herda toda a estrutura do espaço e um que apenas mora dentro dele.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: solução de sistema homogêneo\n\nO conjunto $W = \\{ (x, y, z) \\in \\mathbb{R}^3 : 2x - y = 0 \\text{ e } z = 0 \\}$ é a solução de um sistema homogêneo, então já sabemos que é subespaço. Podemos descrevê-lo explicitamente: de $2x - y = 0$ vem $y = 2x$, e como $z = 0$,\n$$(x, y, z) = (x, 2x, 0) = x(1, 2, 0).$$\nAssim $W = [(1, 2, 0)]$, o span de um único vetor. Isso confirma que $W$ é subespaço e mostra que, geometricamente, ele é uma reta pela origem.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Um subespaço é um subconjunto que é, por si só, um espaço vetorial.\n- Basta verificar três condições: conter o vetor nulo, ser fechado para a soma e ser fechado para a multiplicação por escalar.\n- Se o vetor nulo não pertence ao conjunto, ele já não é subespaço.\n- Retas e planos que não passam pela origem não são subespaços.\n- Spans e conjuntos solução de sistemas homogêneos são sempre subespaços.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual condição é necessária para que $W$ seja subespaço de $\\mathbb{R}^n$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "conter o vetor nulo",
                                isCorrect: true,
                            },
                            {
                                text: "conter exatamente $n$ vetores",
                                isCorrect: false,
                            },
                            {
                                text: "ser um conjunto finito",
                                isCorrect: false,
                            },
                            {
                                text: "excluir o vetor nulo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O conjunto $\\{ (x, y) \\in \\mathbb{R}^2 : x + y = 1 \\}$ é subespaço de $\\mathbb{R}^2$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Não, pois não contém a origem",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, pois é uma reta do plano",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, por ser fechado para a soma",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, pois contém o ponto $(1, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual conjunto é sempre um subespaço de $\\mathbb{R}^3$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "as soluções de $Ax = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "as soluções de $Ax = b$, com $b \\ne 0$",
                                isCorrect: false,
                            },
                            {
                                text: "uma esfera centrada na origem",
                                isCorrect: false,
                            },
                            {
                                text: "o primeiro octante do espaço",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O conjunto $\\{ (x, y, z) \\in \\mathbb{R}^3 : z = 0 \\}$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "um subespaço de $\\mathbb{R}^3$",
                                isCorrect: true,
                            },
                            {
                                text: "não é subespaço, pois exclui o eixo $z$",
                                isCorrect: false,
                            },
                            {
                                text: "não é subespaço, por ser infinito",
                                isCorrect: false,
                            },
                            {
                                text: "não é subespaço, pois não contém $0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O conjunto $\\{ (x, y) \\in \\mathbb{R}^2 : y = x^2 \\}$ é um subespaço?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Não, não é fechado para a soma",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, pois contém a origem",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, por ser o gráfico de uma função",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, pois passa por $(0, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Base e dimensão",
                blocks: [
                    {
                        type: "text",
                        value: "## O conceito de base\n\nSeja $W$ um subespaço de $\\mathbb{R}^n$. Um conjunto de vetores $\\{v_1, v_2, \\dots, v_k\\}$ é uma **base** de $W$ quando cumpre duas exigências ao mesmo tempo:\n\n1. É **linearmente independente**.\n2. **Gera** $W$, ou seja, $[v_1, \\dots, v_k] = W$.\n\nA independência linear garante que não há vetores redundantes, e o fato de gerar garante que nada falta. Por isso a base é um conjunto minimal de vetores capaz de reconstruir, por combinações lineares, todo o subespaço.",
                    },
                    {
                        type: "text",
                        value: "## A base canônica\n\nO exemplo mais importante é a **base canônica** de $\\mathbb{R}^n$, formada pelos vetores\n$$e_1 = (1, 0, \\dots, 0), \\quad e_2 = (0, 1, \\dots, 0), \\quad \\dots, \\quad e_n = (0, 0, \\dots, 1).$$\nEm $\\mathbb{R}^3$, por exemplo, a base canônica é $\\{(1, 0, 0), (0, 1, 0), (0, 0, 1)\\}$. Qualquer vetor $(x, y, z)$ se escreve de modo único como\n$$(x, y, z) = x(1, 0, 0) + y(0, 1, 0) + z(0, 0, 1).$$\nUm mesmo subespaço admite infinitas bases diferentes, mas todas elas têm sempre a mesma quantidade de vetores.",
                    },
                    {
                        type: "text",
                        value: "## Dimensão\n\nA **dimensão** de um subespaço $W$, denotada $\\dim W$, é o número de vetores de qualquer base de $W$. Esse número está bem definido justamente porque todas as bases têm a mesma quantidade de vetores.\n\n- $\\dim \\mathbb{R}^n = n$, pois a base canônica tem $n$ vetores.\n- Uma reta pela origem tem dimensão $1$.\n- Um plano pela origem tem dimensão $2$.\n- O subespaço trivial $\\{0\\}$ tem dimensão $0$, pois sua base é o conjunto vazio.\n\nEm $\\mathbb{R}^n$, todo subespaço $W$ satisfaz $0 \\le \\dim W \\le n$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: base e dimensão de um subespaço\n\nVamos determinar uma base e a dimensão de\n$$W = \\{ (x, y, z) \\in \\mathbb{R}^3 : x - 2y + z = 0 \\}.$$\nIsolando uma variável, $x = 2y - z$. Assim, todo vetor de $W$ tem a forma\n$$(x, y, z) = (2y - z, \\; y, \\; z) = y(2, 1, 0) + z(-1, 0, 1),$$\ncom $y$ e $z$ livres. Isso mostra que $W$ é gerado por $(2, 1, 0)$ e $(-1, 0, 1)$. Esses dois vetores são linearmente independentes, pois nenhum é múltiplo do outro. Logo formam uma base de $W$, e concluímos que $\\dim W = 2$. Como esperado, trata-se de um plano que passa pela origem.",
                    },
                    {
                        type: "quote",
                        value: "A dimensão conta os graus de liberdade de um espaço: quantas escolhas independentes precisamos fazer para localizar qualquer um de seus vetores.",
                    },
                    {
                        type: "text",
                        value: "## Coordenadas e propriedades\n\nFixada uma base $\\{v_1, \\dots, v_k\\}$ de $W$, cada vetor $w \\in W$ se escreve de **maneira única** como\n$$w = a_1 v_1 + \\dots + a_k v_k.$$\nOs coeficientes $a_1, \\dots, a_k$ são as **coordenadas** de $w$ nessa base. Vale ainda um resultado prático em $\\mathbb{R}^n$: se um conjunto tem exatamente $n$ vetores, então ele é base de $\\mathbb{R}^n$ se, e somente se, for linearmente independente, o que equivale a dizer se, e somente se, gerar o espaço. Ou seja, com o número certo de vetores, basta verificar uma das duas condições.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma base é um conjunto linearmente independente que gera o subespaço.\n- Todas as bases de um mesmo subespaço têm a mesma quantidade de vetores.\n- A dimensão é esse número comum de vetores; $\\dim \\mathbb{R}^n = n$ e $\\dim \\{0\\} = 0$.\n- Em relação a uma base fixada, cada vetor tem coordenadas únicas.\n- Com exatamente $n$ vetores em $\\mathbb{R}^n$, ser LI já garante ser base.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a dimensão do espaço $\\mathbb{R}^4$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$4$",
                                isCorrect: true,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$16$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Uma base de um subespaço é um conjunto de vetores que:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "é LI e gera o subespaço",
                                isCorrect: true,
                            },
                            {
                                text: "apenas gera o subespaço",
                                isCorrect: false,
                            },
                            {
                                text: "apenas é linearmente independente",
                                isCorrect: false,
                            },
                            {
                                text: "tem o maior número possível de vetores",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a dimensão do subespaço trivial $\\{0\\}$, que contém só o vetor nulo?",
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
                                text: "$n$",
                                isCorrect: false,
                            },
                            {
                                text: "indefinida",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O subespaço $\\{ (x, y, z) \\in \\mathbb{R}^3 : z = 0 \\}$ tem dimensão:",
                        difficulty: "medio",
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
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O conjunto $\\{ (1, 1), (2, 2) \\}$ é base de $\\mathbb{R}^2$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Não, é linearmente dependente",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, por conter dois vetores",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, por estarem em $\\mathbb{R}^2$",
                                isCorrect: false,
                            },
                            {
                                text: "Não, por não conterem o nulo",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Transformações lineares",
        aulas: [
            {
                titulo: "Transformações lineares: definição",
                blocks: [
                    {
                        type: "text",
                        value: "## Transformações lineares\n\nUma **transformação linear** é uma função $T: V \\to W$ entre dois espaços vetoriais que preserva as duas operações fundamentais: a soma de vetores e a multiplicação por escalar. Em vez de embaralhar os vetores de qualquer maneira, ela respeita a estrutura algébrica de $V$ e a transporta para dentro de $W$ de forma controlada.\n\nQuando o domínio e o contradomínio coincidem, isto é, quando $V = W$, dizemos que $T$ é um **operador linear** sobre $V$.",
                    },
                    {
                        type: "text",
                        value: "## As duas condições\n\nUma função $T: V \\to W$ é linear quando, para todos os vetores $u, v \\in V$ e todo escalar $\\alpha$, valem:\n\n1. **Aditividade:** $T(u + v) = T(u) + T(v)$\n2. **Homogeneidade:** $T(\\alpha u) = \\alpha\\, T(u)$\n\nAs duas condições podem ser reunidas em uma só. A função $T$ é linear se, e somente se, para quaisquer escalares $\\alpha, \\beta$ e vetores $u, v$ vale\n$$T(\\alpha u + \\beta v) = \\alpha\\, T(u) + \\beta\\, T(v).$$\nEssa igualdade se estende a combinações lineares com qualquer número de parcelas: $T(\\alpha_1 v_1 + \\cdots + \\alpha_n v_n) = \\alpha_1 T(v_1) + \\cdots + \\alpha_n T(v_n)$.",
                    },
                    {
                        type: "text",
                        value: "## O teste do vetor nulo\n\nToda transformação linear leva o vetor nulo do domínio no vetor nulo do contradomínio. Basta tomar $\\alpha = 0$ na homogeneidade:\n$$T(0_V) = T(0 \\cdot v) = 0 \\cdot T(v) = 0_W.$$\nIsso fornece um teste rápido e negativo: se $T(0) \\neq 0$, então $T$ **não** é linear. Cuidado, porém, a recíproca é falsa. Existem funções com $T(0) = 0$ que ainda assim não são lineares, como veremos adiante.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: verificando a linearidade\n\nConsidere $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ definida por $T(x, y) = (2x - y,\\; x + 3y)$. Vamos conferir as duas condições. Tome $u = (x_1, y_1)$ e $v = (x_2, y_2)$, de modo que $u + v = (x_1 + x_2,\\; y_1 + y_2)$. Então\n$$T(u+v) = \\big(2(x_1+x_2) - (y_1+y_2),\\; (x_1+x_2) + 3(y_1+y_2)\\big).$$\nReorganizando as parcelas,\n$$T(u+v) = (2x_1 - y_1,\\; x_1 + 3y_1) + (2x_2 - y_2,\\; x_2 + 3y_2) = T(u) + T(v).$$\nPara a homogeneidade, com escalar $\\alpha$,\n$$T(\\alpha u) = (2\\alpha x_1 - \\alpha y_1,\\; \\alpha x_1 + 3\\alpha y_1) = \\alpha\\,(2x_1 - y_1,\\; x_1 + 3y_1) = \\alpha\\, T(u).$$\nAs duas condições valem, logo $T$ é linear.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: uma translação não é linear\n\nSeja $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ dada por $T(x, y) = (x + 1,\\; y)$, que desloca todo vetor uma unidade na horizontal. Testando o vetor nulo,\n$$T(0, 0) = (1, 0) \\neq (0, 0).$$\nComo $T(0) \\neq 0$, a translação **não** é linear. Esse é um erro clássico: deslocamentos parecem inofensivos, mas quebram a homogeneidade. De fato, $T(2 \\cdot (1,0)) = T(2,0) = (3,0)$, enquanto $2\\, T(1,0) = 2\\,(2,0) = (4,0)$, e os resultados diferem.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: quando passar no teste do nulo não basta\n\nConsidere $T: \\mathbb{R} \\to \\mathbb{R}$ com $T(x) = x^2$. Aqui $T(0) = 0$, então o teste do vetor nulo não descarta a função. Mesmo assim ela não é linear. Basta um contraexemplo na aditividade:\n$$T(1 + 1) = T(2) = 4, \\qquad T(1) + T(1) = 1 + 1 = 2.$$\nComo $4 \\neq 2$, a função falha. Isso confirma que passar no teste do vetor nulo é necessário, mas não suficiente para garantir linearidade.",
                    },
                    {
                        type: "quote",
                        value: "Uma transformação linear fica inteiramente determinada pelo que faz nos vetores de uma base. Conhecer a base já é conhecer a transformação toda.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma transformação linear $T: V \\to W$ satisfaz $T(u+v) = T(u) + T(v)$ e $T(\\alpha u) = \\alpha T(u)$.\n- Forma compacta: $T(\\alpha u + \\beta v) = \\alpha T(u) + \\beta T(v)$.\n- Consequência obrigatória: $T(0_V) = 0_W$. Se $T(0) \\neq 0$, não é linear.\n- O teste do vetor nulo é necessário, mas não suficiente: $T(x) = x^2$ tem $T(0) = 0$ e ainda assim não é linear.\n- Translações não são lineares.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Para que $T: V \\to W$ seja linear, além de $T(\\alpha u) = \\alpha T(u)$, é necessário que, para todos $u, v \\in V$:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$T(u + v) = T(u) + T(v)$",
                                isCorrect: true,
                            },
                            {
                                text: "$T(u + v) = T(u)\\cdot T(v)$",
                                isCorrect: false,
                            },
                            {
                                text: "$T(u + v) = T(u) + v$",
                                isCorrect: false,
                            },
                            {
                                text: "$T(u \\cdot v) = T(u) + T(v)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual das funções abaixo **não** é uma transformação linear?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$T(x, y) = (2x,\\; 3y)$",
                                isCorrect: false,
                            },
                            {
                                text: "$T(x, y) = (x + 2,\\; y)$",
                                isCorrect: true,
                            },
                            {
                                text: "$T(x, y) = (x - y,\\; x)$",
                                isCorrect: false,
                            },
                            {
                                text: "$T(x, y) = (0,\\; 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ linear com $T(1,0) = (2,3)$ e $T(0,1) = (-1,4)$. Então $T(2,1)$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(1,\\; 7)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(4,\\; 10)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3,\\; 10)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(3,\\; 2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre uma transformação linear $T$, qual afirmação é sempre verdadeira?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$T$ leva o vetor nulo em um vetor não nulo",
                                isCorrect: false,
                            },
                            {
                                text: "$T$ é necessariamente injetora",
                                isCorrect: false,
                            },
                            {
                                text: "$T$ preserva o produto de vetores",
                                isCorrect: false,
                            },
                            {
                                text: "$T$ leva o vetor nulo no vetor nulo",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Considere $T: \\mathbb{R}^2 \\to \\mathbb{R}$ dada por $T(x, y) = ax + by + c$. Essa função é linear:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "para qualquer valor de $c$",
                                isCorrect: false,
                            },
                            {
                                text: "apenas quando $c = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "apenas quando $c = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "apenas quando $a = b = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "A matriz de uma transformação linear",
                blocks: [
                    {
                        type: "text",
                        value: "## Toda transformação linear é uma matriz\n\nUm fato central da álgebra linear: **toda** transformação linear $T: \\mathbb{R}^n \\to \\mathbb{R}^m$ pode ser escrita como uma multiplicação por matriz. Existe uma única matriz $A$ de tamanho $m \\times n$ tal que\n$$T(x) = A x \\quad \\text{para todo } x \\in \\mathbb{R}^n.$$\nEssa matriz é chamada de **matriz canônica** (ou matriz padrão) de $T$. Ela converte perguntas sobre funções em contas com matrizes.",
                    },
                    {
                        type: "text",
                        value: "## As colunas são as imagens da base\n\nSeja $\\{e_1, e_2, \\ldots, e_n\\}$ a base canônica de $\\mathbb{R}^n$, em que $e_j$ tem $1$ na posição $j$ e $0$ nas demais. A matriz de $T$ se monta colocando $T(e_j)$ como a $j$-ésima coluna:\n$$A = [\\,T(e_1)\\;\\; T(e_2)\\;\\; \\cdots \\;\\; T(e_n)\\,].$$\nA razão é direta. Todo vetor se escreve como $x = x_1 e_1 + \\cdots + x_n e_n$, e pela linearidade $T(x) = x_1 T(e_1) + \\cdots + x_n T(e_n)$, que é exatamente o produto $A x$.",
                    },
                    {
                        type: "text",
                        value: "## O tamanho da matriz\n\nSe $T: \\mathbb{R}^n \\to \\mathbb{R}^m$, a matriz $A$ tem $m$ linhas e $n$ colunas, ou seja, é $m \\times n$. O número de **colunas** vem da dimensão do domínio, isto é, de quantas coordenadas entram; o número de **linhas** vem da dimensão do contradomínio, ou seja, de quantas coordenadas saem. Guardar essa regra evita erros de montagem.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: montando a matriz\n\nSeja $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ dada por $T(x, y) = (2x - y,\\; x + 3y)$. Calculamos a imagem de cada vetor da base canônica:\n$$T(e_1) = T(1, 0) = (2, 1), \\qquad T(e_2) = T(0, 1) = (-1, 3).$$\nColocando esses vetores como colunas, obtemos\n$$A = \\begin{pmatrix} 2 & -1 \\\\ 1 & 3 \\end{pmatrix}.$$\nConferindo, $A \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} 2x - y \\\\ x + 3y \\end{pmatrix}$, que reproduz exatamente $T$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: rotação de 90 graus\n\nA rotação $R$ do plano por $90^\\circ$ no sentido anti-horário leva $e_1 = (1,0)$ em $(0, 1)$ e $e_2 = (0,1)$ em $(-1, 0)$. Logo sua matriz canônica é\n$$A = \\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}.$$\nPara girar o vetor $(3, 2)$, basta multiplicar:\n$$A \\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix} = \\begin{pmatrix} 0 \\cdot 3 - 1 \\cdot 2 \\\\ 1 \\cdot 3 + 0 \\cdot 2 \\end{pmatrix} = \\begin{pmatrix} -2 \\\\ 3 \\end{pmatrix}.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: da matriz de volta para a fórmula\n\nSuponha que $T: \\mathbb{R}^3 \\to \\mathbb{R}^2$ tenha matriz canônica\n$$A = \\begin{pmatrix} 1 & 0 & 2 \\\\ -1 & 4 & 0 \\end{pmatrix}.$$\nComo $A$ é $2 \\times 3$, confirmamos que $T$ sai de $\\mathbb{R}^3$ e chega em $\\mathbb{R}^2$. A imagem de um vetor genérico é\n$$T(x, y, z) = (x + 2z,\\; -x + 4y),$$\ne a terceira coluna $(2, 0)$ é justamente $T(e_3) = T(0,0,1)$.",
                    },
                    {
                        type: "quote",
                        value: "Escolha uma base e a transformação vira uma tabela de números. Toda a geometria fica guardada nas colunas.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Toda transformação linear $T: \\mathbb{R}^n \\to \\mathbb{R}^m$ é da forma $T(x) = Ax$ para uma única matriz $A$.\n- As colunas de $A$ são as imagens da base canônica: a $j$-ésima coluna é $T(e_j)$.\n- O tamanho de $A$ é $m \\times n$, com $m$ linhas (contradomínio) e $n$ colunas (domínio).\n- Montar a matriz e multiplicar por um vetor recupera a fórmula de $T$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A matriz canônica de uma transformação linear $T: \\mathbb{R}^n \\to \\mathbb{R}^m$ tem por colunas:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "os próprios vetores $e_1, \\ldots, e_n$ da base canônica",
                                isCorrect: false,
                            },
                            {
                                text: "as imagens $T(e_1), \\ldots, T(e_n)$ dispostas em linhas",
                                isCorrect: false,
                            },
                            {
                                text: "as imagens $T(e_1), \\ldots, T(e_n)$ da base canônica",
                                isCorrect: true,
                            },
                            {
                                text: "os vetores da base do contradomínio $\\mathbb{R}^m$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $T: \\mathbb{R}^4 \\to \\mathbb{R}^3$ é linear, sua matriz canônica tem tamanho:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$3 \\times 4$",
                                isCorrect: true,
                            },
                            {
                                text: "$4 \\times 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$4 \\times 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$3 \\times 3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A matriz canônica de $T(x, y) = (x - 2y,\\; 3x + y)$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 1 & 3 \\\\ -2 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & -2 \\\\ 3 & 1 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 2 \\\\ 3 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 3 \\\\ 2 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A reflexão pela reta $y = x$, dada por $T(x, y) = (y, x)$, tem matriz canônica:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $T: \\mathbb{R}^3 \\to \\mathbb{R}^2$ com matriz $\\begin{pmatrix} 2 & 0 & -1 \\\\ 1 & 3 & 0 \\end{pmatrix}$. Então $T(1, 2, 3)$ vale:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$(7,\\; -1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(5,\\; 7)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-1,\\; 7)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(-1,\\; 6)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Núcleo e imagem",
                blocks: [
                    {
                        type: "text",
                        value: "## O núcleo\n\nO **núcleo** (também chamado de espaço nulo) de uma transformação linear $T: V \\to W$ é o conjunto de todos os vetores do domínio que são levados no vetor nulo:\n$$\\ker T = \\{\\, v \\in V : T(v) = 0 \\,\\}.$$\nEle mede o quanto $T$ colapsa o espaço. Quanto maior o núcleo, mais vetores distintos acabam parando no mesmo lugar.",
                    },
                    {
                        type: "text",
                        value: "## A imagem\n\nA **imagem** de $T: V \\to W$ é o conjunto de todos os vetores de $W$ que são efetivamente atingidos por algum vetor de $V$:\n$$\\operatorname{Im} T = \\{\\, w \\in W : w = T(v) \\text{ para algum } v \\in V \\,\\}.$$\nEnquanto o núcleo vive no domínio $V$, a imagem vive no contradomínio $W$. São dois conjuntos em espaços diferentes, e confundi-los é um erro frequente.",
                    },
                    {
                        type: "text",
                        value: "## Ambos são subespaços\n\nNão é coincidência que esses conjuntos tenham boa estrutura:\n\n- $\\ker T$ é um **subespaço** de $V$. Se $T(u) = 0$ e $T(v) = 0$, então $T(u + v) = 0$ e $T(\\alpha u) = 0$.\n- $\\operatorname{Im} T$ é um **subespaço** de $W$. Se $w_1 = T(u)$ e $w_2 = T(v)$, então $w_1 + w_2 = T(u+v)$ e $\\alpha w_1 = T(\\alpha u)$.\n\nComo $T$ é linear, a imagem é gerada pelas colunas da matriz: $\\operatorname{Im} T$ é o espaço gerado por $T(e_1), \\ldots, T(e_n)$.",
                    },
                    {
                        type: "text",
                        value: "## Núcleo e imagem lado a lado\n\nA tabela reúne as diferenças que mais confundem no começo:\n\n| Aspecto | Núcleo | Imagem |\n| --- | --- | --- |\n| Condição | $T(v) = 0$ | $w = T(v)$ |\n| Onde vive | domínio $V$ | contradomínio $W$ |\n| Ligado a | injetividade | sobrejetividade |\n\nGuardar em qual espaço cada objeto mora resolve boa parte das dúvidas.",
                    },
                    {
                        type: "text",
                        value: "## Núcleo e injetividade\n\nHá um critério muito útil: uma transformação linear $T$ é **injetora** se, e somente se, $\\ker T = \\{0\\}$.\n\nA ideia é curta. Se $T(u) = T(v)$, então por linearidade $T(u - v) = 0$, ou seja, $u - v \\in \\ker T$. Caso o núcleo só contenha o vetor nulo, forçamos $u = v$. Assim, para verificar a injetividade de uma transformação linear, basta olhar o núcleo, sem precisar comparar todos os pares de vetores.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: calculando o núcleo\n\nSeja $T: \\mathbb{R}^3 \\to \\mathbb{R}^2$ dada por $T(x, y, z) = (x - z,\\; y + z)$. Procurar o núcleo é resolver $T(x,y,z) = (0,0)$, ou seja,\n$$x - z = 0 \\quad\\text{e}\\quad y + z = 0.$$\nLogo $x = z$ e $y = -z$, com $z$ livre. Os vetores do núcleo têm a forma\n$$(z, -z, z) = z\\,(1, -1, 1).$$\nPortanto $\\ker T$ é a reta gerada por $(1, -1, 1)$, um subespaço de dimensão $1$. Como o núcleo não é só $\\{0\\}$, a transformação não é injetora.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: descrevendo a imagem\n\nPara a mesma $T(x,y,z) = (x - z,\\; y + z)$, a imagem é gerada pelas colunas da matriz canônica\n$$A = \\begin{pmatrix} 1 & 0 & -1 \\\\ 0 & 1 & 1 \\end{pmatrix}.$$\nAs colunas são $(1,0)$, $(0,1)$ e $(-1,1)$. As duas primeiras já geram todo o $\\mathbb{R}^2$, e a terceira é combinação delas. Assim $\\operatorname{Im} T = \\mathbb{R}^2$, um subespaço de dimensão $2$. Como a imagem é todo o contradomínio, $T$ é sobrejetora.",
                    },
                    {
                        type: "quote",
                        value: "O núcleo mora no espaço de partida e a imagem no de chegada. Perder isso de vista é o começo de metade dos erros.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $\\ker T = \\{v \\in V : T(v) = 0\\}$ vive no domínio; $\\operatorname{Im} T = \\{T(v) : v \\in V\\}$ vive no contradomínio.\n- Ambos são subespaços.\n- $T$ é injetora se, e somente se, $\\ker T = \\{0\\}$.\n- $T$ é sobrejetora se, e somente se, $\\operatorname{Im} T = W$.\n- A imagem é gerada pelas colunas da matriz de $T$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O núcleo de uma transformação linear $T: V \\to W$ é um subespaço de:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$W$, o contradomínio",
                                isCorrect: false,
                            },
                            {
                                text: "$V$, o domínio",
                                isCorrect: true,
                            },
                            {
                                text: "$V \\times W$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\mathbb{R}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Uma transformação linear $T$ é injetora se, e somente se:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\ker T = \\{0\\}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\operatorname{Im} T = \\{0\\}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\ker T = V$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\operatorname{Im} T = W$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O núcleo de $T(x, y) = (x + y,\\; 2x + 2y)$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "a reta gerada por $(1, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "apenas o vetor $(0, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "a reta gerada por $(1, -1)$",
                                isCorrect: true,
                            },
                            {
                                text: "a reta gerada por $(2, -1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A imagem de $T(x, y) = (x + y,\\; 2x + 2y)$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "todo o $\\mathbb{R}^2$",
                                isCorrect: false,
                            },
                            {
                                text: "a reta gerada por $(1, 2)$",
                                isCorrect: true,
                            },
                            {
                                text: "a reta gerada por $(1, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "apenas o vetor $(0, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $T: \\mathbb{R}^2 \\to \\mathbb{R}^3$ é uma transformação linear injetora, então sua imagem é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "todo o $\\mathbb{R}^3$, de dimensão $3$",
                                isCorrect: false,
                            },
                            {
                                text: "uma reta, de dimensão $1$",
                                isCorrect: false,
                            },
                            {
                                text: "o vetor nulo, de dimensão $0$",
                                isCorrect: false,
                            },
                            {
                                text: "um plano, de dimensão $2$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O teorema do núcleo e da imagem",
                blocks: [
                    {
                        type: "text",
                        value: "## O teorema do núcleo e da imagem\n\nEste é um dos resultados mais úteis de toda a álgebra linear. Se $T: V \\to W$ é linear e o domínio $V$ tem dimensão finita, então\n$$\\dim(\\ker T) + \\dim(\\operatorname{Im} T) = \\dim V.$$\nEm palavras: a dimensão do domínio se reparte exatamente entre o que é colapsado, medido pelo núcleo, e o que sobrevive, medido pela imagem. Nada se perde nessa conta.",
                    },
                    {
                        type: "text",
                        value: "## Posto e nulidade\n\nDuas palavras aparecem o tempo todo:\n\n- A **nulidade** de $T$ é $\\dim(\\ker T)$, a dimensão do núcleo.\n- O **posto** de $T$ é $\\dim(\\operatorname{Im} T)$, a dimensão da imagem.\n\nCom essa linguagem, o teorema vira uma frase curta:\n$$\\text{nulidade} + \\text{posto} = \\dim V.$$\nO posto também é igual ao posto da matriz de $T$, ou seja, ao número de colunas linearmente independentes.",
                    },
                    {
                        type: "text",
                        value: "## Lendo dimensões\n\nO teorema conecta três números; conhecidos dois deles, o terceiro sai de graça. A tabela mostra as leituras mais comuns:\n\n| Situação | Consequência |\n| --- | --- |\n| $T$ injetora | $\\dim(\\ker T) = 0$ |\n| $T$ sobrejetora | $\\dim(\\operatorname{Im} T) = \\dim W$ |\n| $T$ bijetora | posto $= \\dim V = \\dim W$ |\n\nMuitas vezes, em vez de calcular a imagem explicitamente, basta achar o núcleo e subtrair da dimensão do domínio.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: usando o teorema\n\nSeja $T: \\mathbb{R}^5 \\to \\mathbb{R}^3$ uma transformação linear cujo núcleo tem dimensão $2$. Qual é a dimensão da imagem? Pelo teorema, com $\\dim V = 5$,\n$$\\dim(\\ker T) + \\dim(\\operatorname{Im} T) = 5 \\;\\Rightarrow\\; 2 + \\dim(\\operatorname{Im} T) = 5.$$\nLogo $\\dim(\\operatorname{Im} T) = 3$. Como a imagem é um subespaço de $\\mathbb{R}^3$ e tem dimensão $3$, concluímos que $\\operatorname{Im} T = \\mathbb{R}^3$ e que $T$ é sobrejetora.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: lendo o núcleo pela matriz\n\nSeja $T: \\mathbb{R}^3 \\to \\mathbb{R}^3$ com matriz\n$$A = \\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 1 \\\\ 1 & 3 & 4 \\end{pmatrix}.$$\nEscalonando, a terceira linha é a soma das duas primeiras, então o posto é $2$. Pelo teorema, $\\dim(\\ker T) = 3 - 2 = 1$. Sem resolver o sistema inteiro, já sabemos que o núcleo é uma reta e que $T$ não é injetora nem sobrejetora.",
                    },
                    {
                        type: "text",
                        value: "## Uma consequência importante\n\nQuando $T: \\mathbb{R}^n \\to \\mathbb{R}^n$ é um operador, com domínio e contradomínio de mesma dimensão, o teorema força uma equivalência elegante:\n$$T \\text{ injetora} \\iff \\ker T = \\{0\\} \\iff \\dim(\\operatorname{Im} T) = n \\iff T \\text{ sobrejetora}.$$\nOu seja, para operadores em espaços de dimensão finita, ser injetora e ser sobrejetora são a mesma coisa: uma implica a outra automaticamente.",
                    },
                    {
                        type: "quote",
                        value: "Domínio de dimensão fixa funciona como um orçamento. Cada dimensão gasta no núcleo é uma dimensão a menos disponível para a imagem.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Teorema do núcleo e da imagem: $\\dim(\\ker T) + \\dim(\\operatorname{Im} T) = \\dim V$.\n- Nulidade $= \\dim(\\ker T)$ e posto $= \\dim(\\operatorname{Im} T)$.\n- Conhecendo dois dos três números, o terceiro fica determinado.\n- Para operadores $T: \\mathbb{R}^n \\to \\mathbb{R}^n$: injetora $\\iff$ sobrejetora $\\iff$ bijetora.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O teorema do núcleo e da imagem afirma que, para $T: V \\to W$ com $\\dim V$ finita:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\dim(\\ker T) + \\dim(\\operatorname{Im} T) = \\dim V$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dim(\\ker T) + \\dim(\\operatorname{Im} T) = \\dim W$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dim(\\ker T) \\cdot \\dim(\\operatorname{Im} T) = \\dim V$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dim(\\ker T) - \\dim(\\operatorname{Im} T) = \\dim V$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $T: \\mathbb{R}^4 \\to \\mathbb{R}^4$ com $\\dim(\\ker T) = 1$. Então $\\dim(\\operatorname{Im} T)$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
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
                            "Seja $T: \\mathbb{R}^6 \\to \\mathbb{R}^4$ sobrejetora. A dimensão do núcleo de $T$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$4$",
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
                            "Se $T: \\mathbb{R}^3 \\to \\mathbb{R}^5$ é injetora, então o posto de $T$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
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
                        ],
                    },
                    {
                        statement:
                            "Existe uma transformação linear injetora $T: \\mathbb{R}^4 \\to \\mathbb{R}^3$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Não, pois exigiria posto $4$",
                                isCorrect: true,
                            },
                            {
                                text: "Sim, escolhendo a matriz adequada",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, pois o domínio tem dimensão maior",
                                isCorrect: false,
                            },
                            {
                                text: "Não se pode decidir sem conhecer a matriz",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Composição e transformação inversa",
                blocks: [
                    {
                        type: "text",
                        value: "## Composição de transformações\n\nDadas transformações lineares $T: U \\to V$ e $S: V \\to W$, a **composição** $S \\circ T: U \\to W$ é definida por\n$$(S \\circ T)(u) = S\\big(T(u)\\big).$$\nPrimeiro aplica-se $T$, depois $S$. A composição de duas transformações lineares é sempre linear, o que se verifica direto: $(S \\circ T)(\\alpha u + \\beta v) = S(\\alpha T(u) + \\beta T(v)) = \\alpha (S \\circ T)(u) + \\beta (S \\circ T)(v)$.",
                    },
                    {
                        type: "text",
                        value: "## A matriz da composição é o produto\n\nSe $T$ tem matriz $B$ e $S$ tem matriz $A$, então a composição $S \\circ T$ tem matriz $A B$:\n$$(S \\circ T)(x) = S(T(x)) = A(Bx) = (AB)x.$$\nRepare na **ordem**. Como $S$ é aplicada por último, sua matriz $A$ vem primeiro no produto. A multiplicação de matrizes não é comutativa, então em geral $AB \\neq BA$: trocar a ordem das transformações muda o resultado.",
                    },
                    {
                        type: "text",
                        value: "## Transformação inversa\n\nUma transformação linear $T: V \\to W$ é **invertível** quando existe $T^{-1}: W \\to V$ tal que\n$$T^{-1} \\circ T = \\operatorname{Id}_V \\quad\\text{e}\\quad T \\circ T^{-1} = \\operatorname{Id}_W,$$\nem que $\\operatorname{Id}$ é a transformação identidade. Isso acontece exatamente quando $T$ é **bijetora**, isto é, injetora e sobrejetora ao mesmo tempo. A inversa, quando existe, também é linear.",
                    },
                    {
                        type: "text",
                        value: "## Quando existe a inversa\n\nPara um operador $T: \\mathbb{R}^n \\to \\mathbb{R}^n$ com matriz $A$, vale uma cadeia de equivalências:\n$$T \\text{ invertível} \\iff A \\text{ invertível} \\iff \\det A \\neq 0 \\iff \\ker T = \\{0\\}.$$\nE, nesse caso, a matriz de $T^{-1}$ é simplesmente $A^{-1}$. Se $\\det A = 0$, a transformação colapsa parte do espaço e não há como desfazer isso.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: compondo duas transformações\n\nSejam $T(x, y) = (x + y,\\; y)$ e $S(x, y) = (2x,\\; x - y)$, com matrizes\n$$B = \\begin{pmatrix} 1 & 1 \\\\ 0 & 1 \\end{pmatrix}, \\qquad A = \\begin{pmatrix} 2 & 0 \\\\ 1 & -1 \\end{pmatrix}.$$\nA matriz de $S \\circ T$ é o produto $AB$:\n$$AB = \\begin{pmatrix} 2 & 0 \\\\ 1 & -1 \\end{pmatrix} \\begin{pmatrix} 1 & 1 \\\\ 0 & 1 \\end{pmatrix} = \\begin{pmatrix} 2 & 2 \\\\ 1 & 0 \\end{pmatrix}.$$\nLogo $(S \\circ T)(x, y) = (2x + 2y,\\; x)$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: invertendo uma transformação\n\nSeja $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ com matriz\n$$A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}.$$\nComo $\\det A = 1 \\cdot 4 - 2 \\cdot 3 = -2 \\neq 0$, a transformação é invertível. A inversa de uma matriz $2 \\times 2$ é\n$$A^{-1} = \\frac{1}{\\det A} \\begin{pmatrix} 4 & -2 \\\\ -3 & 1 \\end{pmatrix} = \\begin{pmatrix} -2 & 1 \\\\ 3/2 & -1/2 \\end{pmatrix}.$$\nPortanto $T^{-1}(x, y) = \\big(-2x + y,\\; \\tfrac{3}{2}x - \\tfrac{1}{2}y\\big)$.",
                    },
                    {
                        type: "quote",
                        value: "Compor é encaixar duas máquinas em série. Inverter é construir a máquina que desfaz exatamente o trabalho da primeira.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Composição: $(S \\circ T)(u) = S(T(u))$, e sua matriz é o produto $AB$, com a última transformação aplicada vindo primeiro.\n- Em geral $AB \\neq BA$: a ordem importa.\n- $T$ é invertível se, e somente se, é bijetora; a inversa também é linear.\n- Para operadores: $T$ invertível $\\iff \\det A \\neq 0$, e a matriz de $T^{-1}$ é $A^{-1}$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Se $T$ tem matriz $B$ e $S$ tem matriz $A$, a matriz da composição $S \\circ T$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$BA$",
                                isCorrect: false,
                            },
                            {
                                text: "$A + B$",
                                isCorrect: false,
                            },
                            {
                                text: "$AB^{-1}$",
                                isCorrect: false,
                            },
                            {
                                text: "$AB$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma transformação linear $T$ é invertível se, e somente se, ela é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "apenas injetora",
                                isCorrect: false,
                            },
                            {
                                text: "bijetora",
                                isCorrect: true,
                            },
                            {
                                text: "apenas sobrejetora",
                                isCorrect: false,
                            },
                            {
                                text: "a transformação nula",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para um operador $T: \\mathbb{R}^n \\to \\mathbb{R}^n$ com matriz $A$, $T$ é invertível se, e somente se:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\det A \\neq 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\det A = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$A$ é simétrica",
                                isCorrect: false,
                            },
                            {
                                text: "$A$ tem alguma coluna nula",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $T$ e $S$ com matrizes $B = \\begin{pmatrix} 1 & 0 \\\\ 1 & 1 \\end{pmatrix}$ e $A = \\begin{pmatrix} 2 & 1 \\\\ 0 & 1 \\end{pmatrix}$. A matriz de $S \\circ T$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 2 & 1 \\\\ 2 & 2 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 2 & 0 \\\\ 1 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 3 & 1 \\\\ 1 & 1 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 3 & 1 \\\\ 0 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A transformação com matriz $\\begin{pmatrix} 2 & 1 \\\\ 1 & 1 \\end{pmatrix}$ tem inversa de matriz:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 2 & 1 \\\\ 1 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & -1 \\\\ -1 & 2 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 1 \\\\ 1 & 2 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} -1 & 1 \\\\ 1 & -2 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Autovalores e autovetores",
        aulas: [
            {
                titulo: "Autovalores e autovetores",
                blocks: [
                    {
                        type: "text",
                        value: "## Autovalores e autovetores\n\nQuando aplicamos uma matriz $A$ a um vetor, em geral ela muda tanto o **tamanho** quanto a **direção** desse vetor. Existem, porém, vetores especiais cuja direção permanece inalterada: a matriz apenas os estica ou encolhe. Esses vetores são os **autovetores**, e o fator de escala correspondente é o **autovalor**.\n\nFormalmente, seja $A$ uma matriz quadrada $n \\times n$. Um vetor **não nulo** $v$ é um autovetor de $A$ se existe um escalar $\\lambda$ tal que\n\n$$A v = \\lambda v.$$\n\nO número $\\lambda$ é o autovalor associado a $v$. A exigência $v \\neq 0$ é essencial: o vetor nulo satisfaria a equação para qualquer $\\lambda$ e não traria informação alguma.",
                    },
                    {
                        type: "text",
                        value: "## Interpretação geométrica\n\nPense em $A$ como uma transformação do plano. Para a maioria dos vetores, $Av$ aponta para uma direção diferente da de $v$. Um autovetor é uma direção que a transformação **preserva**.\n\nO autovalor $\\lambda$ diz o que acontece ao longo dessa direção:\n\n- se $\\lambda > 1$, o vetor é esticado;\n- se $0 < \\lambda < 1$, o vetor é encolhido;\n- se $\\lambda < 0$, o vetor troca de sentido (aponta para o lado oposto);\n- se $\\lambda = 1$, o vetor fica inalterado.\n\nEm todos os casos, o autovetor continua sobre a mesma reta que passa pela origem.",
                    },
                    {
                        type: "quote",
                        value: "Autovetores revelam os eixos naturais de uma transformação: as direções em que ela age da forma mais simples possível, apenas escalando.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nConsidere a matriz diagonal\n\n$$A = \\begin{pmatrix} 2 & 0 \\\\ 0 & 3 \\end{pmatrix}.$$\n\nTome $v = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$. Então\n\n$$A v = \\begin{pmatrix} 2 & 0 \\\\ 0 & 3 \\end{pmatrix}\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix} = \\begin{pmatrix} 2 \\\\ 0 \\end{pmatrix} = 2\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}.$$\n\nComo $Av = 2v$, o vetor $v$ é autovetor com autovalor $\\lambda = 2$. De modo análogo, $\\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}$ é autovetor com autovalor $\\lambda = 3$. Em matrizes diagonais, os autovalores são exatamente as entradas da diagonal.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nNem todo vetor é autovetor. Seja\n\n$$A = \\begin{pmatrix} 3 & 1 \\\\ 0 & 2 \\end{pmatrix}.$$\n\nTeste $v = \\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$:\n\n$$A v = \\begin{pmatrix} 3\\cdot 1 + 1\\cdot 1 \\\\ 0\\cdot 1 + 2\\cdot 1 \\end{pmatrix} = \\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix}.$$\n\nPara que $v$ fosse autovetor, $\\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix}$ teria de ser um múltiplo de $\\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$, o que não ocorre. Logo $v$ não é autovetor. Já $\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$ dá $Av = \\begin{pmatrix} 3 \\\\ 0 \\end{pmatrix} = 3\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$, sendo autovetor com autovalor $3$.",
                    },
                    {
                        type: "text",
                        value: "## Autovetores formam retas\n\nSe $v$ é autovetor de $A$ com autovalor $\\lambda$, qualquer múltiplo não nulo $cv$ também é. De fato,\n\n$$A(cv) = c\\,(Av) = c\\,(\\lambda v) = \\lambda\\,(cv).$$\n\nPor isso um autovetor nunca vem sozinho: ele representa uma reta inteira de vetores que compartilham o mesmo autovalor. Costumamos escolher um representante simples, como $\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$, para descrever essa direção.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Um autovetor é um vetor não nulo $v$ com $Av = \\lambda v$; o escalar $\\lambda$ é o autovalor.\n- Geometricamente, $A$ apenas escala o autovetor, preservando sua direção.\n- Múltiplos não nulos de um autovetor são autovetores com o mesmo autovalor.\n- Em uma matriz diagonal, os autovalores são as entradas da diagonal.\n\nNas próximas aulas veremos como **encontrar** os autovalores (polinômio característico) e os autovetores (sistemas lineares).",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Seja $A$ uma matriz $n \\times n$. Um vetor $v$ é autovetor de $A$ associado ao autovalor $\\lambda$ quando:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$Av = \\lambda v$ com $v \\neq 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$Av = \\lambda v$ para qualquer vetor $v$",
                                isCorrect: false,
                            },
                            {
                                text: "$Av = \\lambda v$ com $v = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$Av = v$ com $\\lambda \\neq 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $A = \\begin{pmatrix} 5 & 0 \\\\ 0 & -2 \\end{pmatrix}$, qual é o autovalor associado ao autovetor $\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\lambda = 5$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\lambda = -2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lambda = 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lambda = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual dos vetores abaixo é autovetor de $A = \\begin{pmatrix} 4 & 2 \\\\ 0 & 1 \\end{pmatrix}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $v$ é autovetor de $A$ com autovalor $\\lambda$, então $A(3v)$ é igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$3\\lambda v$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\lambda v$",
                                isCorrect: false,
                            },
                            {
                                text: "$3 v$",
                                isCorrect: false,
                            },
                            {
                                text: "$9\\lambda v$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual das transformações lineares do plano não possui nenhum autovetor real?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Rotação de $90^\\circ$",
                                isCorrect: true,
                            },
                            {
                                text: "Reflexão em torno do eixo $x$",
                                isCorrect: false,
                            },
                            {
                                text: "Projeção sobre o eixo $x$",
                                isCorrect: false,
                            },
                            {
                                text: "Dilatação por fator $2$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O polinômio característico",
                blocks: [
                    {
                        type: "text",
                        value: "## Como encontrar os autovalores\n\nA definição $Av = \\lambda v$ não diz, sozinha, como descobrir os autovalores. O truque é reescrever a equação. Partindo de\n\n$$A v = \\lambda v,$$\n\nsubtraímos $\\lambda v$ dos dois lados. Usando $\\lambda v = \\lambda I v$, onde $I$ é a identidade, obtemos\n\n$$A v - \\lambda I v = 0 \\quad\\Longrightarrow\\quad (A - \\lambda I)\\,v = 0.$$\n\nEstamos procurando um vetor **não nulo** $v$ que satisfaça esse sistema homogêneo.",
                    },
                    {
                        type: "text",
                        value: "## A equação característica\n\nO sistema $(A - \\lambda I)v = 0$ tem solução não nula somente quando a matriz $A - \\lambda I$ **não é invertível**, ou seja, quando seu determinante se anula:\n\n$$\\det(A - \\lambda I) = 0.$$\n\nEssa é a **equação característica** de $A$. Ao expandir o determinante, obtemos um polinômio em $\\lambda$ de grau $n$, chamado **polinômio característico** e denotado $p(\\lambda)$. Os autovalores de $A$ são exatamente as **raízes** desse polinômio.",
                    },
                    {
                        type: "text",
                        value: "## Fórmula para matrizes $2 \\times 2$\n\nPara $A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$, temos\n\n$$A - \\lambda I = \\begin{pmatrix} a - \\lambda & b \\\\ c & d - \\lambda \\end{pmatrix},$$\n\ne portanto\n\n$$p(\\lambda) = \\det(A - \\lambda I) = (a-\\lambda)(d-\\lambda) - bc = \\lambda^2 - (a+d)\\lambda + (ad - bc).$$\n\nReconhecemos aí o **traço** $\\mathrm{tr}(A) = a + d$ e o **determinante** $\\det(A) = ad - bc$:\n\n$$p(\\lambda) = \\lambda^2 - \\mathrm{tr}(A)\\,\\lambda + \\det(A).$$",
                    },
                    {
                        type: "quote",
                        value: "O polinômio característico transforma um problema sobre vetores em um problema sobre raízes: encontrar autovalores vira resolver uma equação polinomial.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nSeja\n\n$$A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}.$$\n\nAqui $\\mathrm{tr}(A) = 2 + 2 = 4$ e $\\det(A) = 2\\cdot 2 - 1\\cdot 1 = 3$. Logo\n\n$$p(\\lambda) = \\lambda^2 - 4\\lambda + 3 = (\\lambda - 1)(\\lambda - 3).$$\n\nAs raízes são $\\lambda_1 = 1$ e $\\lambda_2 = 3$: esses são os autovalores de $A$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nSeja\n\n$$A = \\begin{pmatrix} 0 & -1 \\\\ 2 & -3 \\end{pmatrix}.$$\n\nCalculando diretamente,\n\n$$\\det(A - \\lambda I) = \\det\\begin{pmatrix} -\\lambda & -1 \\\\ 2 & -3-\\lambda \\end{pmatrix} = (-\\lambda)(-3-\\lambda) - (-1)(2).$$\n\nDesenvolvendo, $(-\\lambda)(-3-\\lambda) = 3\\lambda + \\lambda^2$ e $-(-1)(2) = 2$, de modo que\n\n$$p(\\lambda) = \\lambda^2 + 3\\lambda + 2 = (\\lambda + 1)(\\lambda + 2).$$\n\nOs autovalores são $\\lambda = -1$ e $\\lambda = -2$.",
                    },
                    {
                        type: "text",
                        value: "## Traço e determinante como verificação\n\nAs raízes de $p(\\lambda) = \\lambda^2 - \\mathrm{tr}(A)\\lambda + \\det(A)$ satisfazem duas relações úteis:\n\n- a **soma** dos autovalores é igual ao traço;\n- o **produto** dos autovalores é igual ao determinante.\n\nNo exemplo anterior, $\\lambda_1 + \\lambda_2 = -1 + (-2) = -3 = \\mathrm{tr}(A)$ e $\\lambda_1 \\lambda_2 = (-1)(-2) = 2 = \\det(A)$. Essas igualdades servem como um teste rápido para conferir se os autovalores calculados estão corretos.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Autovalores são as raízes do polinômio característico $p(\\lambda) = \\det(A - \\lambda I)$.\n- Para uma matriz $2 \\times 2$: $p(\\lambda) = \\lambda^2 - \\mathrm{tr}(A)\\lambda + \\det(A)$.\n- A soma dos autovalores é o traço; o produto é o determinante.\n- Um polinômio de grau $n$ tem $n$ raízes (contando multiplicidades e possivelmente complexas), então uma matriz $n \\times n$ tem $n$ autovalores nesse sentido.",
                    },
                ],
                questions: [
                    {
                        statement: "A equação característica de uma matriz $A$ é dada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\det(A - \\lambda I) = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\det(A + \\lambda I) = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\det(A) - \\lambda = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$A - \\lambda I = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para uma matriz $2 \\times 2$, o polinômio característico é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\lambda^2 - \\mathrm{tr}(A)\\lambda + \\det(A)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\lambda^2 + \\mathrm{tr}(A)\\lambda + \\det(A)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lambda^2 - \\det(A)\\lambda + \\mathrm{tr}(A)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lambda^2 - \\mathrm{tr}(A)\\lambda - \\det(A)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o polinômio característico de $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 2 \\end{pmatrix}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\lambda^2 - 3\\lambda - 4$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\lambda^2 - 3\\lambda + 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lambda^2 + 3\\lambda - 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lambda^2 + 3\\lambda + 4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Os autovalores de $A = \\begin{pmatrix} 4 & 2 \\\\ 1 & 3 \\end{pmatrix}$ são:",
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
                                text: "$3$ e $4$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$ e $10$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma matriz $2 \\times 2$ tem traço $6$ e determinante $9$. Seus autovalores são:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\lambda = 3$ (raiz dupla)",
                                isCorrect: true,
                            },
                            {
                                text: "$\\lambda = -3$ (raiz dupla)",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lambda = 9$ e $\\lambda = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lambda = 3$ e $\\lambda = 6$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Cálculo de autovetores",
                blocks: [
                    {
                        type: "text",
                        value: "## Dos autovalores aos autovetores\n\nDepois de encontrar um autovalor $\\lambda$, precisamos dos autovetores associados a ele. Eles são exatamente as soluções não nulas do sistema homogêneo\n\n$$(A - \\lambda I)\\,v = 0.$$\n\nO conjunto de **todas** as soluções desse sistema (incluindo o vetor nulo) forma um subespaço chamado **autoespaço** de $\\lambda$, denotado $E_\\lambda$. Em outras palavras, $E_\\lambda$ é o núcleo da matriz $A - \\lambda I$. Resolver o sistema significa escalonar $A - \\lambda I$ e descrever suas soluções.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nRetomemos $A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}$, cujos autovalores são $1$ e $3$.\n\n**Para $\\lambda = 1$:**\n\n$$A - I = \\begin{pmatrix} 1 & 1 \\\\ 1 & 1 \\end{pmatrix}.$$\n\nO sistema $(A - I)v = 0$ equivale à equação $x + y = 0$, isto é, $y = -x$. Escolhendo $x = 1$, obtemos o autovetor $\\begin{pmatrix} 1 \\\\ -1 \\end{pmatrix}$.\n\n**Para $\\lambda = 3$:**\n\n$$A - 3I = \\begin{pmatrix} -1 & 1 \\\\ 1 & -1 \\end{pmatrix}.$$\n\nAgora a equação é $-x + y = 0$, ou $y = x$, e um autovetor é $\\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$.",
                    },
                    {
                        type: "quote",
                        value: "Cada autovalor abre uma porta para o seu autoespaço: resolver o sistema homogêneo é atravessá-la e encontrar as direções invariantes.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nSeja $A = \\begin{pmatrix} 0 & -1 \\\\ 2 & -3 \\end{pmatrix}$, com autovalores $-1$ e $-2$.\n\n**Para $\\lambda = -1$:**\n\n$$A - (-1)I = A + I = \\begin{pmatrix} 1 & -1 \\\\ 2 & -2 \\end{pmatrix}.$$\n\nAs duas linhas são proporcionais; a equação é $x - y = 0$, logo $y = x$ e um autovetor é $\\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$.\n\n**Para $\\lambda = -2$:**\n\n$$A + 2I = \\begin{pmatrix} 2 & -1 \\\\ 2 & -1 \\end{pmatrix}.$$\n\nA equação é $2x - y = 0$, ou seja $y = 2x$, e um autovetor é $\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$.",
                    },
                    {
                        type: "text",
                        value: "## Conferindo e interpretando\n\nÉ sempre bom verificar: para o autovetor $\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$ com $\\lambda = -2$, temos $Av = \\begin{pmatrix} -2 \\\\ -4 \\end{pmatrix} = -2\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$, como esperado.\n\nO autoespaço $E_\\lambda$ é um subespaço vetorial, e sua dimensão é chamada **multiplicidade geométrica** do autovalor. Nos exemplos acima, cada autoespaço tem dimensão $1$ (é uma reta). Como veremos, essa dimensão nem sempre coincide com a multiplicidade do autovalor como raiz do polinômio característico.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Os autovetores de $\\lambda$ são as soluções não nulas de $(A - \\lambda I)v = 0$.\n- O autoespaço $E_\\lambda$ é o núcleo de $A - \\lambda I$, um subespaço vetorial.\n- Para achar um autovetor, escalone $A - \\lambda I$ e resolva o sistema homogêneo.\n- A dimensão de $E_\\lambda$ é a multiplicidade geométrica do autovalor.\n\nSempre confira o resultado testando se $Av = \\lambda v$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Para encontrar os autovetores associados a um autovalor $\\lambda$, resolvemos o sistema:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(A - \\lambda I)v = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$(A + \\lambda I)v = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$(A - \\lambda I)v = v$",
                                isCorrect: false,
                            },
                            {
                                text: "$Av = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O autoespaço $E_\\lambda$ de um autovalor $\\lambda$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "o núcleo de $A - \\lambda I$",
                                isCorrect: true,
                            },
                            {
                                text: "a imagem de $A - \\lambda I$",
                                isCorrect: false,
                            },
                            {
                                text: "o núcleo de $A$",
                                isCorrect: false,
                            },
                            {
                                text: "o conjunto das linhas de $A$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}$, um autovetor associado a $\\lambda = 3$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 \\\\ -1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A matriz $A = \\begin{pmatrix} 3 & 0 \\\\ 8 & -1 \\end{pmatrix}$ tem $\\lambda = -1$ como autovalor. Um autovetor associado é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A matriz $A = \\begin{pmatrix} 2 & 1 \\\\ 0 & 2 \\end{pmatrix}$ tem $\\lambda = 2$ como autovalor duplo. Qual é a dimensão do autoespaço $E_2$?",
                        difficulty: "dificil",
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
                                text: "$0$",
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
                titulo: "Diagonalização",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é diagonalizar\n\nDiagonalizar uma matriz $A$ é escrevê-la na forma\n\n$$A = P D P^{-1},$$\n\nonde $D$ é uma matriz **diagonal** e $P$ é **invertível**. Quando isso é possível, dizemos que $A$ é **diagonalizável**.\n\nA mágica está no significado das peças: as colunas de $P$ são autovetores de $A$, e as entradas da diagonal de $D$ são os autovalores correspondentes, na mesma ordem. Multiplicando $A = PDP^{-1}$ por $P$ à direita, obtemos $AP = PD$, que coluna a coluna reproduz exatamente as equações $A v_i = \\lambda_i v_i$.",
                    },
                    {
                        type: "text",
                        value: "## Quando uma matriz é diagonalizável\n\nUma matriz $n \\times n$ é diagonalizável se, e somente se, ela possui $n$ autovetores **linearmente independentes**, pois eles formam as colunas de uma matriz $P$ invertível.\n\nUm critério suficiente e prático: **se todos os $n$ autovalores são distintos, a matriz é diagonalizável**. Isso vale porque autovetores associados a autovalores diferentes são sempre linearmente independentes. A recíproca não é verdadeira: uma matriz pode ter autovalores repetidos e ainda assim ser diagonalizável, desde que cada autoespaço seja grande o bastante.",
                    },
                    {
                        type: "quote",
                        value: "Diagonalizar é trocar de referencial: nas coordenadas dos autovetores, uma transformação complicada vira uma simples multiplicação eixo a eixo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: diagonalizando\n\nSeja $A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}$. Já sabemos que seus autovalores são $1$ e $3$, com autovetores $\\begin{pmatrix} 1 \\\\ -1 \\end{pmatrix}$ e $\\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$.\n\nMontamos $P$ com esses autovetores como colunas e $D$ com os autovalores na ordem correspondente:\n\n$$P = \\begin{pmatrix} 1 & 1 \\\\ -1 & 1 \\end{pmatrix}, \\qquad D = \\begin{pmatrix} 1 & 0 \\\\ 0 & 3 \\end{pmatrix}.$$\n\nComo os autovalores são distintos, os autovetores são independentes e $P$ é invertível. Logo $A = PDP^{-1}$, e a matriz está diagonalizada.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: um caso que falha\n\nNem toda matriz é diagonalizável. Considere\n\n$$A = \\begin{pmatrix} 2 & 1 \\\\ 0 & 2 \\end{pmatrix}.$$\n\nSeu único autovalor é $\\lambda = 2$ (raiz dupla). Resolvendo $(A - 2I)v = 0$, obtemos $\\begin{pmatrix} 0 & 1 \\\\ 0 & 0 \\end{pmatrix}v = 0$, cujo autoespaço tem dimensão $1$: só há uma direção de autovetores, gerada por $\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$.\n\nComo faltam autovetores independentes (temos $1$, mas precisaríamos de $2$), é impossível montar um $P$ invertível. Essa matriz **não é diagonalizável**.",
                    },
                    {
                        type: "text",
                        value: "## Detalhes importantes\n\nA ordem importa: a $i$-ésima coluna de $P$ deve ser um autovetor do autovalor que aparece na $i$-ésima posição de $D$. Se você trocar a ordem das colunas de $P$, precisa trocar as entradas de $D$ da mesma maneira.\n\nAlém disso, a fatoração não é única. Podemos escalar os autovetores ou reordená-los, obtendo diferentes pares $(P, D)$ que representam a mesma matriz $A$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $A$ é diagonalizável quando $A = PDP^{-1}$, com $D$ diagonal e $P$ invertível.\n- As colunas de $P$ são autovetores; as entradas de $D$ são os autovalores, na mesma ordem.\n- Uma matriz $n \\times n$ é diagonalizável se, e somente se, tem $n$ autovetores independentes.\n- Autovalores todos distintos garantem diagonalização; autovalores repetidos podem falhar (matriz defectiva).",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Dizer que $A$ é diagonalizável significa que podemos escrever $A$ como:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$P D P^{-1}$, com $D$ diagonal",
                                isCorrect: true,
                            },
                            {
                                text: "$P D P$, com $D$ diagonal",
                                isCorrect: false,
                            },
                            {
                                text: "$P D^{-1} P$, com $D$ diagonal",
                                isCorrect: false,
                            },
                            {
                                text: "$D P D$, com $P$ diagonal",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Na fatoração $A = PDP^{-1}$, as colunas de $P$ são:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "os autovetores de $A$",
                                isCorrect: true,
                            },
                            {
                                text: "os autovalores de $A$",
                                isCorrect: false,
                            },
                            {
                                text: "as linhas de $A$",
                                isCorrect: false,
                            },
                            {
                                text: "os autovetores de $D$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual das matrizes a seguir NÃO é diagonalizável?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 3 & 1 \\\\ 0 & 3 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 0 \\\\ 0 & 2 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 2 & 0 \\\\ 1 & 5 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam os autovetores $\\begin{pmatrix} 1 \\\\ -1 \\end{pmatrix}$ (autovalor $1$) e $\\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$ (autovalor $3$), usados como colunas de $P$ nessa ordem. A matriz $D$ correspondente é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 1 & 0 \\\\ 0 & 3 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 3 & 0 \\\\ 0 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 3 \\\\ 0 & 0 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 1 & 1 \\\\ -1 & 1 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma matriz $3 \\times 3$ possui três autovalores distintos. Sobre sua diagonalização, é correto afirmar que ela é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "sempre diagonalizável",
                                isCorrect: true,
                            },
                            {
                                text: "nunca diagonalizável",
                                isCorrect: false,
                            },
                            {
                                text: "diagonalizável só se for simétrica",
                                isCorrect: false,
                            },
                            {
                                text: "diagonalizável só se for invertível",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Aplicações da diagonalização",
                blocks: [
                    {
                        type: "text",
                        value: "## Para que serve diagonalizar\n\nA maior vantagem da diagonalização aparece ao calcular **potências** de uma matriz. Se $A = PDP^{-1}$, então\n\n$$A^2 = (PDP^{-1})(PDP^{-1}) = PD(P^{-1}P)DP^{-1} = PD^2P^{-1},$$\n\njá que $P^{-1}P = I$ no meio. O padrão se repete e, em geral,\n\n$$A^k = P D^k P^{-1}.$$\n\nIsso é ótimo porque elevar uma matriz diagonal a uma potência é trivial: basta elevar cada entrada da diagonal. Se $D = \\begin{pmatrix} \\lambda_1 & 0 \\\\ 0 & \\lambda_2 \\end{pmatrix}$, então $D^k = \\begin{pmatrix} \\lambda_1^k & 0 \\\\ 0 & \\lambda_2^k \\end{pmatrix}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: uma fórmula para $A^k$\n\nSeja $A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}$, com $P = \\begin{pmatrix} 1 & 1 \\\\ -1 & 1 \\end{pmatrix}$, $D = \\begin{pmatrix} 1 & 0 \\\\ 0 & 3 \\end{pmatrix}$ e $P^{-1} = \\frac{1}{2}\\begin{pmatrix} 1 & -1 \\\\ 1 & 1 \\end{pmatrix}$.\n\nEntão $A^k = P D^k P^{-1}$ com $D^k = \\begin{pmatrix} 1 & 0 \\\\ 0 & 3^k \\end{pmatrix}$. Efetuando os produtos,\n\n$$A^k = \\frac{1}{2}\\begin{pmatrix} 1 + 3^k & 3^k - 1 \\\\ 3^k - 1 & 3^k + 1 \\end{pmatrix}.$$\n\nConfira com $k = 2$: a fórmula dá $\\frac{1}{2}\\begin{pmatrix} 10 & 8 \\\\ 8 & 10 \\end{pmatrix} = \\begin{pmatrix} 5 & 4 \\\\ 4 & 5 \\end{pmatrix}$, que é exatamente $A^2$. Calcular $A^{20}$ agora é imediato, sem multiplicar a matriz vinte vezes.",
                    },
                    {
                        type: "quote",
                        value: "Elevar uma matriz a uma potência alta parece trabalhoso, mas nas coordenadas certas o esforço desaparece: só os autovalores são elevados à potência.",
                    },
                    {
                        type: "text",
                        value: "## Autovalores de potências e recorrências\n\nDa fórmula $A^k = PD^kP^{-1}$ segue um fato elegante: os autovalores de $A^k$ são $\\lambda^k$, onde $\\lambda$ percorre os autovalores de $A$, e os autovetores permanecem os mesmos.\n\nIsso é a chave para resolver **recorrências**. A sequência de Fibonacci, definida por $F_{n+1} = F_n + F_{n-1}$, pode ser escrita na forma matricial\n\n$$\\begin{pmatrix} F_{n+1} \\\\ F_n \\end{pmatrix} = \\begin{pmatrix} 1 & 1 \\\\ 1 & 0 \\end{pmatrix}\\begin{pmatrix} F_n \\\\ F_{n-1} \\end{pmatrix}.$$\n\nDiagonalizando essa matriz, cujos autovalores são $\\frac{1 + \\sqrt{5}}{2}$ e $\\frac{1 - \\sqrt{5}}{2}$, obtemos uma fórmula fechada para $F_n$ em função de potências dos autovalores.",
                    },
                    {
                        type: "text",
                        value: "## Comportamento de longo prazo\n\nEm sistemas que evoluem por $x_{k} = A x_{k-1}$, temos $x_k = A^k x_0$. Escrevendo $x_0$ como combinação de autovetores, cada componente é multiplicada por $\\lambda^k$ a cada passo. Para $k$ grande, o **autovalor de maior valor absoluto** (o autovalor dominante) domina o comportamento, e o estado tende a se alinhar com o autovetor correspondente.\n\nEsse princípio aparece em cadeias de Markov, onde uma matriz estocástica sempre tem o autovalor $1$, cujo autovetor descreve a distribuição de equilíbrio. Também surge em sistemas de equações diferenciais $x' = Ax$, cujas soluções envolvem fatores $e^{\\lambda t}$: o sinal da parte real dos autovalores determina se as soluções crescem ou decaem.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Potências ficam fáceis: $A^k = P D^k P^{-1}$, e $D^k$ eleva cada entrada da diagonal.\n- Os autovalores de $A^k$ são $\\lambda^k$; os autovetores não mudam.\n- Recorrências como Fibonacci viram potências de matrizes e ganham fórmulas fechadas.\n- O autovalor dominante governa o comportamento de longo prazo; matrizes estocásticas têm autovalor $1$ (equilíbrio).\n\nA diagonalização, portanto, é muito mais que uma curiosidade: é uma ferramenta central para entender sistemas que se repetem no tempo.",
                    },
                ],
                questions: [
                    {
                        statement: "Se $A = PDP^{-1}$, então a potência $A^k$ é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$P D^k P^{-1}$",
                                isCorrect: true,
                            },
                            {
                                text: "$P^k D P^{-1}$",
                                isCorrect: false,
                            },
                            {
                                text: "$P D P^{-k}$",
                                isCorrect: false,
                            },
                            {
                                text: "$P^k D^k P^{-k}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $D = \\begin{pmatrix} 2 & 0 \\\\ 0 & 5 \\end{pmatrix}$, então $D^3$ é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\begin{pmatrix} 8 & 0 \\\\ 0 & 125 \\end{pmatrix}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\begin{pmatrix} 6 & 0 \\\\ 0 & 15 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 8 & 0 \\\\ 0 & 25 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\begin{pmatrix} 2 & 0 \\\\ 0 & 125 \\end{pmatrix}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Calcular $A^k$ via $A^k = PD^kP^{-1}$ é simples porque, para obter $D^k$, basta:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "elevar cada entrada da diagonal a $k$",
                                isCorrect: true,
                            },
                            {
                                text: "multiplicar a diagonal de $D$ por $k$",
                                isCorrect: false,
                            },
                            {
                                text: "elevar a matriz $P$ à potência $k$",
                                isCorrect: false,
                            },
                            {
                                text: "inverter a matriz $D$ um total de $k$ vezes",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em um sistema dinâmico $x_k = A^k x_0$, o comportamento de longo prazo é governado principalmente:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "pelo autovalor de maior valor absoluto",
                                isCorrect: true,
                            },
                            {
                                text: "pelo autovalor de menor valor absoluto",
                                isCorrect: false,
                            },
                            {
                                text: "pelo determinante de $A$",
                                isCorrect: false,
                            },
                            {
                                text: "pelo traço de $A$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma matriz $A$ é diagonalizável e tem autovalores $2$ e $-1$. Qual dos números abaixo é autovalor de $A^3$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$8$",
                                isCorrect: true,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$-3$",
                                isCorrect: false,
                            },
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Produto interno e ortogonalidade",
        aulas: [
            {
                titulo: "Produto interno e norma",
                blocks: [
                    {
                        type: "text",
                        value: "## Produto interno em $\\mathbb{R}^n$\n\nO **produto interno** (ou produto escalar) de dois vetores $u = (u_1, u_2, \\ldots, u_n)$ e $v = (v_1, v_2, \\ldots, v_n)$ em $\\mathbb{R}^n$ é o número real\n\n$$\\langle u, v \\rangle = u_1 v_1 + u_2 v_2 + \\cdots + u_n v_n.$$\n\nTambém é comum a notação $u \\cdot v$. Repare que o resultado é um **escalar**, e não um vetor.",
                    },
                    {
                        type: "text",
                        value: "Escrevendo os vetores como colunas, o produto interno soma os produtos das entradas correspondentes:\n\n$$u = \\begin{pmatrix} u_1 \\\\ u_2 \\\\ \\vdots \\\\ u_n \\end{pmatrix}, \\qquad v = \\begin{pmatrix} v_1 \\\\ v_2 \\\\ \\vdots \\\\ v_n \\end{pmatrix}, \\qquad \\langle u, v \\rangle = \\sum_{i=1}^{n} u_i v_i.$$",
                    },
                    {
                        type: "text",
                        value: "### Propriedades\n\nPara quaisquer vetores $u$, $v$, $w$ e escalar $\\alpha$, valem:\n\n- **Simetria:** $\\langle u, v \\rangle = \\langle v, u \\rangle$\n- **Linearidade:** $\\langle \\alpha u + w, v \\rangle = \\alpha \\langle u, v \\rangle + \\langle w, v \\rangle$\n- **Positividade:** $\\langle v, v \\rangle \\geq 0$, com igualdade somente quando $v = 0$\n\nEssas três propriedades são a base de tudo o que vem a seguir.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 1\n\nSejam $u = (1, 2, 3)$ e $v = (4, -1, 2)$. Então\n\n$$\\langle u, v \\rangle = (1)(4) + (2)(-1) + (3)(2) = 4 - 2 + 6 = 8.$$\n\nO cuidado principal é com os sinais: a segunda parcela fica negativa porque $v_2 = -1$.",
                    },
                    {
                        type: "text",
                        value: "## Norma\n\nA **norma** (ou comprimento) de um vetor $v$ nasce do produto interno dele com ele mesmo:\n\n$$\\|v\\| = \\sqrt{\\langle v, v \\rangle} = \\sqrt{v_1^2 + v_2^2 + \\cdots + v_n^2}.$$\n\nA raiz quadrada é essencial: sem ela obteríamos $\\|v\\|^2$, e não o comprimento. Vale sempre a relação $\\langle v, v \\rangle = \\|v\\|^2$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 2\n\nPara $v = (3, 4)$:\n\n$$\\|v\\| = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5.$$\n\nUm vetor de norma $1$ é chamado **unitário**. Para obter o unitário na direção de $v$, dividimos pelo próprio comprimento:\n\n$$\\hat{v} = \\frac{v}{\\|v\\|} = \\frac{1}{5}(3, 4) = \\left( \\frac{3}{5}, \\frac{4}{5} \\right).$$\n\nEsse passo é a **normalização**.",
                    },
                    {
                        type: "text",
                        value: "## Distância\n\nA **distância** entre dois vetores é a norma da diferença:\n\n$$d(u, v) = \\|u - v\\|.$$\n\nPor exemplo, entre $u = (1, 2)$ e $v = (4, 6)$ temos $u - v = (-3, -4)$, logo $d(u, v) = \\sqrt{(-3)^2 + (-4)^2} = \\sqrt{25} = 5$.",
                    },
                    {
                        type: "quote",
                        value: "A norma transforma a ideia intuitiva de comprimento em algo que conseguimos calcular em qualquer dimensão.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O produto interno $\\langle u, v \\rangle = u_1 v_1 + \\cdots + u_n v_n$ devolve um escalar.\n- Ele é simétrico, linear e positivo definido.\n- A norma é $\\|v\\| = \\sqrt{\\langle v, v \\rangle}$; nunca esqueça a raiz.\n- Normalizar é dividir o vetor pela sua norma, e a distância entre $u$ e $v$ é $\\|u - v\\|$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é o produto interno $\\langle u, v \\rangle$ dos vetores $u = (2, 1, -1)$ e $v = (1, 3, 2)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$7$",
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
                        ],
                    },
                    {
                        statement: "A norma do vetor $v = (1, 2, 2)$ é igual a:",
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
                        statement: "Qual é o vetor unitário na direção de $v = (0, 3, 4)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\left( 0, \\frac{3}{5}, \\frac{4}{5} \\right)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\left( 0, \\frac{3}{25}, \\frac{4}{25} \\right)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, 3, 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\left( 0, \\frac{3}{7}, \\frac{4}{7} \\right)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A distância entre os pontos $u = (1, 0)$ e $v = (4, 4)$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$7$",
                                isCorrect: false,
                            },
                            {
                                text: "$25$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{7}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para qualquer vetor $v$, o valor de $\\langle v, v \\rangle$ é igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\|v\\|^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\|v\\|$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\|v\\|$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{\\|v\\|}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Ângulo e ortogonalidade",
                blocks: [
                    {
                        type: "text",
                        value: "## Desigualdade de Cauchy-Schwarz\n\nUm resultado central liga produto interno e normas: para quaisquer $u$ e $v$,\n\n$$|\\langle u, v \\rangle| \\leq \\|u\\| \\, \\|v\\|.$$\n\nÉ ela que garante que o quociente $\\dfrac{\\langle u, v \\rangle}{\\|u\\| \\, \\|v\\|}$ fica sempre entre $-1$ e $1$, o que permite interpretá-lo como o cosseno de um ângulo.",
                    },
                    {
                        type: "text",
                        value: "## Ângulo entre vetores\n\nO **ângulo** $\\theta$ entre dois vetores não nulos $u$ e $v$ satisfaz\n\n$$\\cos\\theta = \\frac{\\langle u, v \\rangle}{\\|u\\| \\, \\|v\\|}, \\qquad 0 \\leq \\theta \\leq \\pi.$$\n\nPara achar o ângulo, calculamos o produto interno, as duas normas, dividimos e aplicamos $\\arccos$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 1\n\nÂngulo entre $u = (1, 1, 0)$ e $v = (1, 0, 1)$. Temos\n\n$$\\langle u, v \\rangle = 1, \\qquad \\|u\\| = \\sqrt{2}, \\qquad \\|v\\| = \\sqrt{2}.$$\n\nLogo\n\n$$\\cos\\theta = \\frac{1}{\\sqrt{2} \\cdot \\sqrt{2}} = \\frac{1}{2} \\quad \\Rightarrow \\quad \\theta = 60^\\circ.$$",
                    },
                    {
                        type: "text",
                        value: "## Ortogonalidade\n\nQuando o ângulo é de $90^\\circ$, temos $\\cos\\theta = 0$, e isso ocorre exatamente quando o **produto interno se anula**. Dizemos que $u$ e $v$ são **ortogonais**, e escrevemos $u \\perp v$:\n\n$$u \\perp v \\iff \\langle u, v \\rangle = 0.$$\n\nNão é preciso calcular normas nem ângulos para testar ortogonalidade: basta verificar se o produto interno dá zero. O vetor nulo é ortogonal a todos os vetores.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 2\n\nOs vetores $u = (1, 2)$ e $v = (2, -1)$ são ortogonais, pois\n\n$$\\langle u, v \\rangle = (1)(2) + (2)(-1) = 2 - 2 = 0.$$\n\nJá para descobrir qual valor de $k$ torna $(1, k)$ ortogonal a $(2, 3)$, impomos $\\langle (1, k), (2, 3) \\rangle = 0$:\n\n$$2 + 3k = 0 \\quad \\Rightarrow \\quad k = -\\frac{2}{3}.$$",
                    },
                    {
                        type: "text",
                        value: "## Teorema de Pitágoras\n\nSe, e somente se, $u$ e $v$ são ortogonais, vale\n\n$$\\|u + v\\|^2 = \\|u\\|^2 + \\|v\\|^2.$$\n\nÉ a generalização do teorema de Pitágoras para $\\mathbb{R}^n$: quando os vetores formam ângulo reto, os quadrados das normas simplesmente se somam.",
                    },
                    {
                        type: "quote",
                        value: "Dois vetores ortogonais não compartilham nenhuma componente na direção um do outro.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Cauchy-Schwarz: $|\\langle u, v \\rangle| \\leq \\|u\\| \\, \\|v\\|$.\n- O ângulo satisfaz $\\cos\\theta = \\frac{\\langle u, v \\rangle}{\\|u\\| \\, \\|v\\|}$.\n- $u$ e $v$ são ortogonais quando $\\langle u, v \\rangle = 0$; o vetor nulo é ortogonal a todos.\n- Vetores ortogonais obedecem $\\|u + v\\|^2 = \\|u\\|^2 + \\|v\\|^2$.",
                    },
                ],
                questions: [
                    {
                        statement: "Os vetores $u = (1, 2)$ e $v = (4, -2)$ são ortogonais?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Sim, pois $\\langle u, v \\rangle = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "Não, pois $\\langle u, v \\rangle = 8$",
                                isCorrect: false,
                            },
                            {
                                text: "Não, pois $\\langle u, v \\rangle = 4$",
                                isCorrect: false,
                            },
                            {
                                text: "Sim, pois $\\langle u, v \\rangle = 6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O cosseno do ângulo entre $(1, 0)$ e $(0, 1)$ vale:",
                        difficulty: "facil",
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
                                text: "$-1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que valor de $k$ os vetores $(2, k)$ e $(3, 6)$ são ortogonais?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$k = -1$",
                                isCorrect: true,
                            },
                            {
                                text: "$k = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = -2$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = -\\frac{1}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o ângulo entre $u = (1, 1)$ e $v = (1, 0)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$45^\\circ$",
                                isCorrect: true,
                            },
                            {
                                text: "$30^\\circ$",
                                isCorrect: false,
                            },
                            {
                                text: "$60^\\circ$",
                                isCorrect: false,
                            },
                            {
                                text: "$90^\\circ$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Os vetores $u = (1, 2, 2)$ e $v = (2, a, 1)$ são ortogonais. Qual é o valor de $a$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$a = -2$",
                                isCorrect: true,
                            },
                            {
                                text: "$a = 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$a = -4$",
                                isCorrect: false,
                            },
                            {
                                text: "$a = -1$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Conjuntos ortogonais e ortonormais",
                blocks: [
                    {
                        type: "text",
                        value: "## Conjunto ortogonal\n\nUm conjunto de vetores $\\{v_1, v_2, \\ldots, v_k\\}$ é **ortogonal** quando todos são não nulos e quaisquer dois vetores distintos são ortogonais entre si:\n\n$$\\langle v_i, v_j \\rangle = 0 \\quad \\text{sempre que } i \\neq j.$$",
                    },
                    {
                        type: "text",
                        value: "## Conjunto ortonormal\n\nO conjunto é **ortonormal** quando, além de ortogonal, cada vetor tem norma $1$:\n\n$$\\langle v_i, v_j \\rangle = \\begin{cases} 0, & i \\neq j, \\\\ 1, & i = j. \\end{cases}$$\n\nOu seja: vetores mutuamente perpendiculares e todos unitários. Todo conjunto ortogonal vira ortonormal quando normalizamos cada vetor.",
                    },
                    {
                        type: "text",
                        value: "## Independência linear\n\nUm fato importante: **todo conjunto ortogonal de vetores não nulos é linearmente independente**. A ortogonalidade é uma condição forte, que por si só garante a independência. A recíproca não vale: vetores independentes não precisam ser ortogonais.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 1\n\nVamos verificar que $\\{(1, 1, 0),\\ (1, -1, 0),\\ (0, 0, 1)\\}$ é ortogonal:\n\n$$\\langle (1, 1, 0), (1, -1, 0) \\rangle = 1 - 1 + 0 = 0,$$\n\n$$\\langle (1, 1, 0), (0, 0, 1) \\rangle = 0, \\qquad \\langle (1, -1, 0), (0, 0, 1) \\rangle = 0.$$\n\nComo os três produtos internos cruzados são nulos, o conjunto é ortogonal.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 2\n\nAs normas são $\\|(1, 1, 0)\\| = \\sqrt{2}$, $\\|(1, -1, 0)\\| = \\sqrt{2}$ e $\\|(0, 0, 1)\\| = 1$. Normalizando, obtemos a base **ortonormal**\n\n$$\\left( \\frac{1}{\\sqrt{2}}, \\frac{1}{\\sqrt{2}}, 0 \\right), \\quad \\left( \\frac{1}{\\sqrt{2}}, -\\frac{1}{\\sqrt{2}}, 0 \\right), \\quad (0, 0, 1).$$",
                    },
                    {
                        type: "text",
                        value: "## Coordenadas em uma base ortogonal\n\nA grande vantagem de uma base ortogonal $\\{u_1, \\ldots, u_n\\}$ é que as coordenadas de um vetor $w$ saem por uma fórmula direta, sem resolver sistema:\n\n$$w = c_1 u_1 + \\cdots + c_n u_n, \\qquad c_i = \\frac{\\langle w, u_i \\rangle}{\\langle u_i, u_i \\rangle}.$$\n\nSe a base for ortonormal, o denominador vale $1$ e basta $c_i = \\langle w, u_i \\rangle$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 3\n\nNa base ortogonal $u_1 = (1, 1, 0)$, $u_2 = (1, -1, 0)$, $u_3 = (0, 0, 1)$, escrevamos $w = (3, 1, 5)$:\n\n$$c_1 = \\frac{\\langle w, u_1 \\rangle}{\\langle u_1, u_1 \\rangle} = \\frac{4}{2} = 2, \\qquad c_2 = \\frac{2}{2} = 1, \\qquad c_3 = \\frac{5}{1} = 5.$$\n\nDe fato, $2(1, 1, 0) + 1(1, -1, 0) + 5(0, 0, 1) = (3, 1, 5)$.",
                    },
                    {
                        type: "quote",
                        value: "Trabalhar em uma base ortonormal é como usar um sistema de eixos perfeitamente alinhado ao problema.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Conjunto **ortogonal**: vetores não nulos, dois a dois com produto interno zero.\n- Conjunto **ortonormal**: ortogonal e com todos os vetores unitários.\n- Todo conjunto ortogonal é linearmente independente.\n- Em base ortogonal, $c_i = \\frac{\\langle w, u_i \\rangle}{\\langle u_i, u_i \\rangle}$; em base ortonormal, $c_i = \\langle w, u_i \\rangle$.",
                    },
                ],
                questions: [
                    {
                        statement: "Um conjunto de vetores é ortonormal quando:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "é ortogonal e cada vetor tem norma $1$",
                                isCorrect: true,
                            },
                            {
                                text: "é ortogonal e cada vetor tem norma $0$",
                                isCorrect: false,
                            },
                            {
                                text: "todos os vetores são paralelos entre si",
                                isCorrect: false,
                            },
                            {
                                text: "a soma de todos os vetores é nula",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O conjunto $\\{(1, 2), (2, -1)\\}$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "ortogonal, mas não ortonormal",
                                isCorrect: true,
                            },
                            {
                                text: "ortonormal, mas não ortogonal",
                                isCorrect: false,
                            },
                            {
                                text: "ortogonal e ortonormal",
                                isCorrect: false,
                            },
                            {
                                text: "nem ortogonal nem ortonormal",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Todo conjunto ortogonal de vetores não nulos é necessariamente:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "linearmente independente",
                                isCorrect: true,
                            },
                            {
                                text: "linearmente dependente",
                                isCorrect: false,
                            },
                            {
                                text: "uma base ortonormal",
                                isCorrect: false,
                            },
                            {
                                text: "formado por vetores unitários",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na base ortogonal $u_1 = (1, 1)$ e $u_2 = (1, -1)$, qual é o coeficiente $c_1$ de $w = (4, 2)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$c_1 = 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$c_1 = 6$",
                                isCorrect: false,
                            },
                            {
                                text: "$c_1 = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$c_1 = 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para tornar ortonormal o conjunto ortogonal $\\{(3, 4), (4, -3)\\}$, devemos dividir cada vetor por:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$25$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$7$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O processo de Gram-Schmidt",
                blocks: [
                    {
                        type: "text",
                        value: "## Por que ortogonalizar?\n\nBases ortogonais são muito mais fáceis de usar: coordenadas viram produtos internos e projeções ficam simples. O **processo de Gram-Schmidt** pega uma base qualquer (linearmente independente) e a transforma numa base ortogonal que gera exatamente o mesmo espaço.",
                    },
                    {
                        type: "text",
                        value: "## O algoritmo\n\nDados vetores linearmente independentes $v_1, v_2, \\ldots, v_k$, construímos vetores ortogonais $u_1, u_2, \\ldots, u_k$ assim:\n\n$$u_1 = v_1,$$\n\n$$u_2 = v_2 - \\frac{\\langle v_2, u_1 \\rangle}{\\langle u_1, u_1 \\rangle} u_1,$$\n\n$$u_3 = v_3 - \\frac{\\langle v_3, u_1 \\rangle}{\\langle u_1, u_1 \\rangle} u_1 - \\frac{\\langle v_3, u_2 \\rangle}{\\langle u_2, u_2 \\rangle} u_2.$$\n\nA ideia de cada passo: tomar $v_i$ e subtrair dele as projeções sobre os vetores $u$ já construídos, sobrando só a parte ortogonal a todos eles.",
                    },
                    {
                        type: "text",
                        value: "O passo geral subtrai todas as projeções anteriores:\n\n$$u_i = v_i - \\sum_{j=1}^{i-1} \\frac{\\langle v_i, u_j \\rangle}{\\langle u_j, u_j \\rangle} u_j.$$\n\nSe quisermos uma base **ortonormal**, basta normalizar ao final: $e_i = \\frac{u_i}{\\|u_i\\|}$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 1\n\nVamos ortogonalizar $v_1 = (3, 1)$ e $v_2 = (2, 2)$.\n\nPrimeiro, $u_1 = v_1 = (3, 1)$. Em seguida calculamos o fator de projeção:\n\n$$\\frac{\\langle v_2, u_1 \\rangle}{\\langle u_1, u_1 \\rangle} = \\frac{(2)(3) + (2)(1)}{3^2 + 1^2} = \\frac{8}{10} = \\frac{4}{5}.$$",
                    },
                    {
                        type: "text",
                        value: "Logo\n\n$$u_2 = (2, 2) - \\frac{4}{5}(3, 1) = \\left( 2 - \\frac{12}{5},\\ 2 - \\frac{4}{5} \\right) = \\left( -\\frac{2}{5},\\ \\frac{6}{5} \\right).$$\n\nConferindo a ortogonalidade: $\\langle u_1, u_2 \\rangle = (3)\\left( -\\frac{2}{5} \\right) + (1)\\left( \\frac{6}{5} \\right) = -\\frac{6}{5} + \\frac{6}{5} = 0$. Perfeito.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 2\n\nPara $v_1 = (1, 1, 0)$ e $v_2 = (1, 0, 1)$, temos $u_1 = (1, 1, 0)$ e\n\n$$u_2 = (1, 0, 1) - \\frac{1}{2}(1, 1, 0) = \\left( \\frac{1}{2}, -\\frac{1}{2}, 1 \\right),$$\n\nque de fato satisfaz $\\langle u_1, u_2 \\rangle = \\frac{1}{2} - \\frac{1}{2} + 0 = 0$.",
                    },
                    {
                        type: "quote",
                        value: "Gram-Schmidt não muda o espaço gerado, apenas troca os vetores por outros mais bem comportados.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Gram-Schmidt transforma uma base qualquer em base ortogonal do mesmo espaço.\n- Começa com $u_1 = v_1$ e, a cada passo, subtrai as projeções sobre os $u_j$ anteriores.\n- Fórmula do passo: $u_i = v_i - \\sum_{j < i} \\frac{\\langle v_i, u_j \\rangle}{\\langle u_j, u_j \\rangle} u_j$.\n- Para uma base ortonormal, normalize cada $u_i$ no final.",
                    },
                ],
                questions: [
                    {
                        statement: "No processo de Gram-Schmidt, o primeiro vetor $u_1$ é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$v_1$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{v_1}{\\|v_1\\|}$",
                                isCorrect: false,
                            },
                            {
                                text: "$v_1 - v_2$",
                                isCorrect: false,
                            },
                            {
                                text: "o vetor nulo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O processo de Gram-Schmidt aplicado a uma base produz:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "uma base ortogonal do mesmo espaço",
                                isCorrect: true,
                            },
                            {
                                text: "uma base de um espaço maior",
                                isCorrect: false,
                            },
                            {
                                text: "um único vetor unitário",
                                isCorrect: false,
                            },
                            {
                                text: "um conjunto linearmente dependente",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao ortogonalizar $v_2 = (2, 2)$ em relação a $u_1 = (3, 1)$, o fator $\\frac{\\langle v_2, u_1 \\rangle}{\\langle u_1, u_1 \\rangle}$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{4}{5}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{5}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{8}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{2}{5}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $v_1 = (1, 0)$ e $v_2 = (2, 3)$. No processo de Gram-Schmidt, o vetor $u_2$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(0, 3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(2, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-2, 3)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $v_1 = (2, 1)$ e $v_2 = (1, 1)$. No processo de Gram-Schmidt, o vetor $u_2$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\left( -\\frac{1}{5}, \\frac{2}{5} \\right)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\left( -\\frac{2}{5}, \\frac{1}{5} \\right)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\left( -\\frac{1}{5}, -\\frac{2}{5} \\right)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\left( \\frac{1}{5}, \\frac{2}{5} \\right)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Projeção ortogonal",
                blocks: [
                    {
                        type: "text",
                        value: "## Projeção sobre um vetor\n\nA **projeção ortogonal** de $u$ sobre um vetor não nulo $v$ é a parte de $u$ que aponta na direção de $v$:\n\n$$\\operatorname{proj}_v u = \\frac{\\langle u, v \\rangle}{\\langle v, v \\rangle} \\, v = \\frac{\\langle u, v \\rangle}{\\|v\\|^2} \\, v.$$\n\nO fator $\\dfrac{\\langle u, v \\rangle}{\\|v\\|^2}$ é um escalar; multiplicado por $v$, devolve um vetor na direção de $v$.",
                    },
                    {
                        type: "text",
                        value: "A **componente escalar** de $u$ na direção de $v$ (a norma com sinal da projeção) é\n\n$$\\frac{\\langle u, v \\rangle}{\\|v\\|}.$$\n\nAtenção aos denominadores: na projeção **vetorial** aparece $\\|v\\|^2$ (ou $\\langle v, v \\rangle$); na componente **escalar**, apenas $\\|v\\|$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 1\n\nProjeção de $u = (2, 3)$ sobre $v = (1, 1)$:\n\n$$\\operatorname{proj}_v u = \\frac{\\langle u, v \\rangle}{\\|v\\|^2} \\, v = \\frac{2 + 3}{2}(1, 1) = \\frac{5}{2}(1, 1) = \\left( \\frac{5}{2}, \\frac{5}{2} \\right).$$",
                    },
                    {
                        type: "text",
                        value: "## Decomposição ortogonal\n\nTodo vetor $u$ se escreve como a projeção sobre $v$ mais uma parte ortogonal a $v$:\n\n$$u = \\underbrace{\\operatorname{proj}_v u}_{\\text{paralela a } v} + \\underbrace{(u - \\operatorname{proj}_v u)}_{\\text{ortogonal a } v}.$$\n\nNo exemplo anterior, a parte ortogonal é\n\n$$u - \\operatorname{proj}_v u = (2, 3) - \\left( \\frac{5}{2}, \\frac{5}{2} \\right) = \\left( -\\frac{1}{2}, \\frac{1}{2} \\right),$$\n\ne de fato $\\left\\langle (1, 1), \\left( -\\frac{1}{2}, \\frac{1}{2} \\right) \\right\\rangle = -\\frac{1}{2} + \\frac{1}{2} = 0$.",
                    },
                    {
                        type: "text",
                        value: "## Projeção sobre um subespaço\n\nSe $W$ tem uma base **ortogonal** $\\{u_1, \\ldots, u_m\\}$, a projeção de $w$ sobre $W$ é a soma das projeções sobre cada vetor da base:\n\n$$\\operatorname{proj}_W w = \\sum_{i=1}^{m} \\frac{\\langle w, u_i \\rangle}{\\langle u_i, u_i \\rangle} u_i.$$\n\nEssa fórmula só fica tão simples porque a base é ortogonal; por isso o Gram-Schmidt costuma vir antes.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 2\n\nSeja $W$ o plano gerado pela base ortogonal $u_1 = (1, 1, 0)$ e $u_2 = (1, -1, 0)$. A projeção de $w = (2, 3, 5)$ sobre $W$ é\n\n$$\\operatorname{proj}_W w = \\frac{5}{2}(1, 1, 0) + \\frac{-1}{2}(1, -1, 0) = (2, 3, 0).$$\n\nComo esperado, projetar sobre o plano $xy$ apenas zera a terceira coordenada.",
                    },
                    {
                        type: "text",
                        value: "## Melhor aproximação\n\nA projeção $\\operatorname{proj}_W w$ é o vetor de $W$ **mais próximo** de $w$: qualquer outro vetor do subespaço fica a uma distância maior. Por isso a projeção ortogonal está no coração dos mínimos quadrados e das aproximações.",
                    },
                    {
                        type: "quote",
                        value: "Projetar é encontrar, dentro de um subespaço, o ponto mais próximo daquilo que você tem.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Projeção sobre um vetor: $\\operatorname{proj}_v u = \\frac{\\langle u, v \\rangle}{\\|v\\|^2} v$.\n- Componente escalar: $\\frac{\\langle u, v \\rangle}{\\|v\\|}$ (denominador $\\|v\\|$, e não $\\|v\\|^2$).\n- $u$ se decompõe em parte paralela e parte ortogonal a $v$.\n- Sobre um subespaço com base ortogonal, some as projeções; o resultado é a melhor aproximação de $w$ em $W$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A projeção ortogonal de $u$ sobre um vetor não nulo $v$ é dada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{\\langle u, v \\rangle}{\\langle v, v \\rangle} v$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\langle u, v \\rangle}{\\langle v, v \\rangle} u$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\langle u, v \\rangle}{\\|v\\|} v$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\langle u, v \\rangle \\, v$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A projeção de $u = (4, 2)$ sobre $v = (1, 0)$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(4, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(4, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A projeção de $u = (3, 1)$ sobre $v = (1, 1)$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(2, 2)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(4, 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A componente escalar de $u = (0, 5)$ na direção de $v = (0, 1)$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$25$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{5}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $u = (2, 3)$ e $v = (1, 1)$. A parte de $u$ ortogonal a $v$, isto é $u - \\operatorname{proj}_v u$, é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\left( -\\frac{1}{2}, \\frac{1}{2} \\right)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\left( \\frac{1}{2}, -\\frac{1}{2} \\right)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\left( \\frac{5}{2}, \\frac{5}{2} \\right)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\left( -\\frac{1}{2}, -\\frac{1}{2} \\right)$",
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
