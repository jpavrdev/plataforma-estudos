// Seed da trilha Geometria Analítica (vetores, reta, plano, cônicas). Conteúdo
// autoral, quiz-only, com fórmulas em LaTeX. Idempotente: se a trilha já tiver aulas,
// não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-geometria-analitica.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { backfillExplicacoes, mesclarSolucoes } from "./backfill-explicacoes.ts";

const NOME = "Geometria Analítica";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Geometria Analítica, a ponte entre a álgebra e a geometria: vetores no plano e no espaço com suas operações, o produto escalar (ângulos e projeções), o produto vetorial e o misto (áreas e volumes), as equações da reta e do plano com suas posições relativas, distâncias e ângulos, e as cônicas (circunferência, elipse, parábola e hipérbole). Companheira da Álgebra Linear e base para o cálculo de várias variáveis, a computação gráfica e a física.";

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
        titulo: "Módulo 1 - Vetores no plano e no espaço",
        aulas: [
            {
                titulo: "O conceito de vetor e suas coordenadas",
                blocks: [
                    {
                        type: "text",
                        value: "## O que e um vetor\n\nNa fisica e na matematica, muitas grandezas ficam completamente descritas por um unico numero. A massa de um corpo, a temperatura de uma sala ou o tempo de uma viagem sao exemplos de **grandezas escalares**: para conhece-las, basta um valor.\n\nOutras grandezas, porem, exigem mais informacao. Para descrever uma forca, um deslocamento ou uma velocidade, nao basta dizer *quanto*: precisamos dizer tambem *em que direcao* e *para que lado*. Essas sao as **grandezas vetoriais**, e o objeto matematico que as representa e o **vetor**.\n\nUm vetor reune tres informacoes ao mesmo tempo:\n\n- **modulo** (ou intensidade): o tamanho da grandeza;\n- **direcao**: a reta suporte sobre a qual o vetor age;\n- **sentido**: para que lado, dentro daquela direcao, ele aponta.",
                    },
                    {
                        type: "text",
                        value: "## Representacao geometrica\n\nGeometricamente, representamos um vetor por um **segmento de reta orientado**, ou seja, uma seta. O comprimento da seta indica o modulo, a reta que a contem indica a direcao e a ponta da seta indica o sentido.\n\nUm ponto essencial: o vetor **nao** esta preso a uma posicao do plano. Duas setas com o mesmo modulo, a mesma direcao e o mesmo sentido representam o **mesmo vetor**, ainda que desenhadas em lugares diferentes. Dizemos que esses segmentos orientados sao **equipolentes**.\n\nE por isso que podemos transportar um vetor livremente pelo plano, desde que nao alteremos seu modulo, sua direcao nem seu sentido.",
                    },
                    {
                        type: "quote",
                        value: "Um vetor nao pergunta onde voce o desenhou: so se importa com quanto, para onde e em que sentido ele aponta.",
                    },
                    {
                        type: "text",
                        value: "## Coordenadas de um vetor no plano\n\nNo plano cartesiano e muito mais pratico descrever um vetor por suas **coordenadas**. Fixado o sistema de eixos, todo vetor $\\vec{u}$ do plano se escreve como um par ordenado:\n\n$$\\vec{u} = (x, y)$$\n\nOs numeros $x$ e $y$ sao as **componentes** do vetor. A componente $x$ mede o deslocamento na horizontal e a componente $y$, na vertical.\n\nQuando o vetor tem origem em $O = (0, 0)$, suas componentes coincidem com as coordenadas de sua extremidade. Esse e o **vetor posicao** do ponto.",
                    },
                    {
                        type: "text",
                        value: "## Vetor determinado por dois pontos\n\nDados dois pontos $A = (x_A, y_A)$ e $B = (x_B, y_B)$, o vetor que vai de $A$ ate $B$ e obtido subtraindo as coordenadas da origem das coordenadas da extremidade:\n\n$$\\vec{AB} = B - A = (x_B - x_A, y_B - y_A)$$\n\nRepare na ordem: sempre **extremidade menos origem**. Trocar a ordem inverte o sentido do vetor, ou seja, $\\vec{BA} = -\\vec{AB}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nVamos encontrar as coordenadas de $\\vec{AB}$ sabendo que $A = (2, 1)$ e $B = (5, 7)$.\n\n**Passo 1.** Identificamos a origem $A = (2, 1)$ e a extremidade $B = (5, 7)$.\n\n**Passo 2.** Aplicamos a regra extremidade menos origem, componente a componente:\n\n$$\\vec{AB} = (5 - 2, 7 - 1)$$\n\n**Passo 3.** Efetuamos as subtracoes:\n\n$$\\vec{AB} = (3, 6)$$\n\nOu seja, para ir de $A$ ate $B$ avancamos $3$ unidades na horizontal e $6$ na vertical. Ja $\\vec{BA}$ valeria $(-3, -6)$: o mesmo vetor, com sentido oposto.",
                    },
                    {
                        type: "text",
                        value: "## Vetores especiais e resumo\n\nDois vetores sao **iguais** quando tem exatamente as mesmas componentes: $(x_1, y_1) = (x_2, y_2)$ somente se $x_1 = x_2$ e $y_1 = y_2$. O **vetor nulo**, $\\vec{0} = (0, 0)$, e o unico sem direcao e sentido definidos.\n\nPara fixar:\n\n- um vetor reune modulo, direcao e sentido;\n- no plano, e um par ordenado $\\vec{u} = (x, y)$;\n- o vetor entre dois pontos e $\\vec{AB} = B - A$, extremidade menos origem;\n- inverter a ordem troca o sinal: $\\vec{BA} = -\\vec{AB}$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Dados os pontos $A = (1, 2)$ e $B = (4, 6)$, as coordenadas de $\\vec{AB}$ sao:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(4, 6)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(5, 8)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 4)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(-3, -4)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O vetor nulo do plano e representado pelas coordenadas:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(1, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, 0)$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Dados $A = (-2, 3)$ e $B = (1, -1)$, o vetor $\\vec{AB}$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(-3, 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, -4)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(3, 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-1, 2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sabendo que $\\vec{AB} = (2, -3)$ e que $A = (1, 4)$, as coordenadas de $B$ sao:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(-1, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 7)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(-1, 7)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O vetor $\\vec{AB}$, com $A = (0, 5)$ e $B = (5, 0)$, tem coordenadas:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(5, 5)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(5, -5)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(-5, 5)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-5, -5)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Soma de vetores e multiplicacao por escalar",
                blocks: [
                    {
                        type: "text",
                        value: "## Somando vetores geometricamente\n\nA soma de dois vetores $\\vec{u}$ e $\\vec{v}$ e um novo vetor, $\\vec{u} + \\vec{v}$. Geometricamente ha duas construcoes equivalentes.\n\nNa **regra do triangulo**, colocamos a origem de $\\vec{v}$ na extremidade de $\\vec{u}$; o vetor soma liga a origem de $\\vec{u}$ a extremidade de $\\vec{v}$.\n\nNa **regra do paralelogramo**, desenhamos $\\vec{u}$ e $\\vec{v}$ a partir de uma origem comum; o vetor soma e a diagonal do paralelogramo formado por eles. As duas construcoes dao o mesmo resultado.",
                    },
                    {
                        type: "text",
                        value: "## Soma em coordenadas\n\nA vantagem das coordenadas e transformar a construcao geometrica em uma conta simples. Se $\\vec{u} = (x_1, y_1)$ e $\\vec{v} = (x_2, y_2)$, somamos componente a componente:\n\n$$\\vec{u} + \\vec{v} = (x_1 + x_2, y_1 + y_2)$$\n\nPor exemplo, $(2, 3) + (1, 4) = (3, 7)$. Nada de somar modulos: a soma ocorre coordenada por coordenada.",
                    },
                    {
                        type: "text",
                        value: "## Multiplicacao por escalar\n\nMultiplicar um vetor $\\vec{u}$ por um numero real $k$ (um **escalar**) produz o vetor $k\\vec{u}$, obtido multiplicando cada componente por $k$:\n\n$$k\\vec{u} = (kx, ky)$$\n\nO efeito geometrico depende de $k$:\n\n- se $|k| > 1$, o vetor estica; se $0 < |k| < 1$, encolhe;\n- se $k > 0$, o sentido se mantem; se $k < 0$, o sentido se inverte;\n- se $k = 0$, obtemos o vetor nulo $\\vec{0}$.\n\nTodo vetor da forma $k\\vec{u}$ tem a mesma direcao de $\\vec{u}$: por isso dizemos que sao **paralelos**.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades das operacoes\n\nA soma e a multiplicacao por escalar seguem regras parecidas com as dos numeros reais. Sendo $\\vec{u}$, $\\vec{v}$, $\\vec{w}$ vetores e $a$, $b$ escalares:\n\n- comutatividade: $\\vec{u} + \\vec{v} = \\vec{v} + \\vec{u}$;\n- associatividade: $(\\vec{u} + \\vec{v}) + \\vec{w} = \\vec{u} + (\\vec{v} + \\vec{w})$;\n- elemento neutro: $\\vec{u} + \\vec{0} = \\vec{u}$;\n- distributividade: $a(\\vec{u} + \\vec{v}) = a\\vec{u} + a\\vec{v}$.\n\nEssas regras permitem manipular expressoes vetoriais quase como expressoes algebricas comuns.",
                    },
                    {
                        type: "text",
                        value: "## Subtracao como soma do oposto\n\nO **vetor oposto** de $\\vec{u}$ e $-\\vec{u} = (-x, -y)$: mesmo modulo e direcao, sentido contrario. A subtracao e apenas a soma com o oposto:\n\n$$\\vec{u} - \\vec{v} = \\vec{u} + (-\\vec{v}) = (x_1 - x_2, y_1 - y_2)$$\n\nGeometricamente, $\\vec{u} - \\vec{v}$ e o vetor que vai da extremidade de $\\vec{v}$ ate a extremidade de $\\vec{u}$, quando ambos partem da mesma origem.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nSejam $\\vec{u} = (3, -1)$ e $\\vec{v} = (2, 4)$. Vamos calcular $2\\vec{u} - 3\\vec{v}$.\n\n**Passo 1.** Multiplicamos cada vetor pelo seu escalar:\n\n$$2\\vec{u} = (2 \\cdot 3, 2 \\cdot (-1)) = (6, -2)$$\n\n$$3\\vec{v} = (3 \\cdot 2, 3 \\cdot 4) = (6, 12)$$\n\n**Passo 2.** Subtraimos componente a componente:\n\n$$2\\vec{u} - 3\\vec{v} = (6 - 6, -2 - 12)$$\n\n**Passo 3.** Efetuamos as contas:\n\n$$2\\vec{u} - 3\\vec{v} = (0, -14)$$\n\nO resultado e um vetor vertical, apontando para baixo.",
                    },
                    {
                        type: "quote",
                        value: "Somar vetores e combinar deslocamentos; multiplicar por escalar e so mudar o quanto de cada deslocamento voce toma.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A soma e feita componente a componente: $\\vec{u} + \\vec{v} = (x_1 + x_2, y_1 + y_2)$.\n- A multiplicacao por escalar multiplica cada componente: $k\\vec{u} = (kx, ky)$.\n- O oposto de $\\vec{u}$ e $-\\vec{u}$, e $\\vec{u} - \\vec{v} = \\vec{u} + (-\\vec{v})$.\n- Vetores do tipo $k\\vec{u}$ sao paralelos a $\\vec{u}$.\n- As operacoes sao comutativas, associativas e distributivas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Dados $\\vec{u} = (2, 3)$ e $\\vec{v} = (1, 4)$, o vetor $\\vec{u} + \\vec{v}$ e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(-1, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 12)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 7)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(1, -1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Dado $\\vec{u} = (3, -2)$, o vetor $2\\vec{u}$ e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(6, 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(6, -2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(5, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(6, -4)$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Dados $\\vec{u} = (1, 2)$ e $\\vec{v} = (3, 1)$, o vetor $2\\vec{u} - \\vec{v}$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(1, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-1, 3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(-4, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(5, 5)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Dados $\\vec{u} = (4, -1)$ e $\\vec{v} = (2, 3)$, o vetor $\\vec{u} - \\vec{v}$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(6, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-2, 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, -4)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(2, 4)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O vetor oposto de $\\vec{u} = (-5, 2)$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(5, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-5, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-5, -2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(5, -2)$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Modulo (norma) e versor",
                blocks: [
                    {
                        type: "text",
                        value: "## O modulo de um vetor\n\nO **modulo** de um vetor, tambem chamado de **norma** ou **comprimento**, mede o tamanho da seta que o representa. Para $\\vec{u} = (x, y)$ no plano, o modulo vem do Teorema de Pitagoras, ja que as componentes $x$ e $y$ funcionam como catetos de um triangulo retangulo:\n\n$$\\|\\vec{u}\\| = \\sqrt{x^2 + y^2}$$\n\nAs barras duplas $\\|\\ \\|$ indicam o modulo. O resultado e sempre um numero maior ou igual a zero, e vale zero apenas para o vetor nulo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: calculando um modulo\n\nVamos calcular o modulo de $\\vec{u} = (3, 4)$.\n\n**Passo 1.** Elevamos cada componente ao quadrado:\n\n$$3^2 = 9 \\qquad 4^2 = 16$$\n\n**Passo 2.** Somamos os quadrados e extraimos a raiz:\n\n$$\\|\\vec{u}\\| = \\sqrt{9 + 16} = \\sqrt{25}$$\n\n**Passo 3.** Calculamos a raiz:\n\n$$\\|\\vec{u}\\| = 5$$\n\nUm erro comum e somar as componentes direto, escrevendo $3 + 4 = 7$. Esta errado: a soma acontece **dentro** da raiz e com os quadrados.",
                    },
                    {
                        type: "text",
                        value: "## Distancia entre dois pontos\n\nComo o vetor $\\vec{AB}$ liga $A$ a $B$, o modulo desse vetor e exatamente a **distancia** entre os dois pontos. Sendo $A = (x_A, y_A)$ e $B = (x_B, y_B)$:\n\n$$d(A, B) = \\|\\vec{AB}\\| = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$$\n\nE a mesma formula da norma, aplicada as componentes de $\\vec{AB}$.",
                    },
                    {
                        type: "text",
                        value: "## Versor: o vetor unitario\n\nUm vetor de modulo $1$ e um **vetor unitario**. Dado qualquer vetor nao nulo $\\vec{u}$, podemos obter um unitario que aponta na mesma direcao e sentido: o **versor** de $\\vec{u}$. Basta dividir o vetor pelo proprio modulo:\n\n$$\\hat{u} = \\frac{\\vec{u}}{\\|\\vec{u}\\|}$$\n\nComo dividir por um numero e multiplicar pelo seu inverso, cada componente e dividida pelo modulo. O versor guarda a **direcao** e o **sentido** de $\\vec{u}$, mas descarta o tamanho, pois passa a medir exatamente $1$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: encontrando um versor\n\nVamos determinar o versor de $\\vec{u} = (3, 4)$.\n\n**Passo 1.** Calculamos o modulo:\n\n$$\\|\\vec{u}\\| = \\sqrt{3^2 + 4^2} = 5$$\n\n**Passo 2.** Dividimos cada componente pelo modulo:\n\n$$\\hat{u} = \\frac{1}{5}(3, 4) = \\left(\\frac{3}{5}, \\frac{4}{5}\\right)$$\n\n**Passo 3.** Conferimos calculando o modulo do versor:\n\n$$\\|\\hat{u}\\| = \\sqrt{\\left(\\frac{3}{5}\\right)^2 + \\left(\\frac{4}{5}\\right)^2} = \\sqrt{\\frac{9 + 16}{25}} = \\sqrt{1} = 1$$\n\nComo esperado, o versor tem modulo $1$.",
                    },
                    {
                        type: "quote",
                        value: "O modulo diz o tamanho; o versor guarda o rumo. Juntos, eles reconstroem o vetor inteiro.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades e resumo\n\nUma propriedade util relaciona modulo e escalar: para qualquer escalar $k$,\n\n$$\\|k\\vec{u}\\| = |k| \\cdot \\|\\vec{u}\\|$$\n\nou seja, multiplicar um vetor por $k$ multiplica seu modulo por $|k|$ (o valor absoluto, pois comprimento nunca e negativo).\n\nPontos centrais:\n\n- o modulo no plano e $\\|\\vec{u}\\| = \\sqrt{x^2 + y^2}$;\n- a distancia entre dois pontos e o modulo de $\\vec{AB}$;\n- o versor e $\\hat{u} = \\frac{\\vec{u}}{\\|\\vec{u}\\|}$ e sempre tem modulo $1$;\n- vale $\\|k\\vec{u}\\| = |k| \\cdot \\|\\vec{u}\\|$.",
                    },
                ],
                questions: [
                    {
                        statement: "O modulo do vetor $\\vec{u} = (3, 4)$ e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sqrt{7}$",
                                isCorrect: false,
                            },
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
                        ],
                    },
                    {
                        statement: "O modulo do vetor $\\vec{v} = (6, 8)$ e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sqrt{14}$",
                                isCorrect: false,
                            },
                            {
                                text: "$14$",
                                isCorrect: false,
                            },
                            {
                                text: "$100$",
                                isCorrect: false,
                            },
                            {
                                text: "$10$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "O versor do vetor $\\vec{u} = (3, 4)$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(3, 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\left(\\frac{4}{5}, \\frac{3}{5}\\right)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\left(\\frac{3}{5}, \\frac{4}{5}\\right)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\left(\\frac{3}{25}, \\frac{4}{25}\\right)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A distancia entre os pontos $A = (1, 2)$ e $B = (4, 6)$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$7$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$25$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Se $\\vec{u} = (1, -2)$, o valor de $\\|3\\vec{u}\\|$ e:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\sqrt{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$45$",
                                isCorrect: false,
                            },
                            {
                                text: "$9\\sqrt{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$3\\sqrt{5}$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Combinacao linear e dependencia de vetores",
                blocks: [
                    {
                        type: "text",
                        value: "## Combinacao linear\n\nDados vetores $\\vec{u}_1, \\vec{u}_2, \\dots, \\vec{u}_n$ e escalares $a_1, a_2, \\dots, a_n$, chamamos de **combinacao linear** desses vetores toda expressao da forma:\n\n$$a_1 \\vec{u}_1 + a_2 \\vec{u}_2 + \\dots + a_n \\vec{u}_n$$\n\nEm palavras, uma combinacao linear e o resultado de esticar, encolher, inverter e somar vetores. Dizer que $\\vec{w}$ **e combinacao linear** de outros significa que existem escalares que, aplicados aqueles vetores, reproduzem exatamente $\\vec{w}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: escrevendo uma combinacao linear\n\nConsidere $\\vec{u} = (1, 0)$ e $\\vec{v} = (0, 1)$. Vamos escrever $\\vec{w} = (3, 5)$ como combinacao linear de $\\vec{u}$ e $\\vec{v}$.\n\n**Passo 1.** Procuramos escalares $a$ e $b$ com $a\\vec{u} + b\\vec{v} = \\vec{w}$:\n\n$$a(1, 0) + b(0, 1) = (a, b)$$\n\n**Passo 2.** Igualamos componente a componente a $(3, 5)$:\n\n$$a = 3 \\qquad b = 5$$\n\n**Passo 3.** Concluimos:\n\n$$\\vec{w} = 3\\vec{u} + 5\\vec{v}$$\n\nIsso mostra por que $(1, 0)$ e $(0, 1)$ sao tao uteis: qualquer vetor do plano se escreve facilmente em funcao deles.",
                    },
                    {
                        type: "text",
                        value: "## Dependencia e independencia linear\n\nUm conjunto de vetores e **linearmente dependente** (LD) quando pelo menos um deles pode ser escrito como combinacao linear dos outros. Caso contrario, e **linearmente independente** (LI).\n\nPara **dois** vetores no plano, o criterio fica bem visual:\n\n- sao LD quando **paralelos**, isto e, quando um e multiplo do outro, $\\vec{v} = k\\vec{u}$;\n- sao LI quando **nao** sao paralelos, apontando para direcoes diferentes.",
                    },
                    {
                        type: "text",
                        value: "## Criterio pratico para dois vetores\n\nComo verificar se $\\vec{u} = (x_1, y_1)$ e $\\vec{v} = (x_2, y_2)$ sao paralelos sem adivinhar o escalar $k$? Basta comparar a proporcao das componentes, o que equivale a calcular o **determinante**:\n\n$$x_1 y_2 - x_2 y_1$$\n\nSe esse valor for **zero**, os vetores sao paralelos (LD). Se for **diferente de zero**, sao LI. Por exemplo, para $(2, 3)$ e $(4, 6)$ temos $2 \\cdot 6 - 4 \\cdot 3 = 0$, confirmando o paralelismo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: os vetores sao paralelos?\n\nVamos decidir se $\\vec{u} = (2, -1)$ e $\\vec{v} = (-6, 3)$ sao paralelos.\n\n**Passo 1.** Calculamos o determinante $x_1 y_2 - x_2 y_1$:\n\n$$2 \\cdot 3 - (-6) \\cdot (-1) = 6 - 6 = 0$$\n\n**Passo 2.** Como o determinante e zero, os vetores sao paralelos, logo linearmente dependentes.\n\n**Passo 3.** De fato, $\\vec{v} = -3\\vec{u}$, pois $-3(2, -1) = (-6, 3)$, o que confirma o resultado.",
                    },
                    {
                        type: "quote",
                        value: "Uma base e um par de direcoes independentes; a partir delas, o plano inteiro se reconstroi.",
                    },
                    {
                        type: "text",
                        value: "## Base do plano e resumo\n\nDois vetores linearmente independentes formam uma **base** do plano: com eles, qualquer outro vetor se escreve de maneira unica como combinacao linear. A mais usada e a **base canonica**, formada por $\\vec{i} = (1, 0)$ e $\\vec{j} = (0, 1)$.\n\nResumindo:\n\n- combinacao linear e somar multiplos escalares de vetores;\n- dois vetores sao LD quando paralelos ($\\vec{v} = k\\vec{u}$) e LI caso contrario;\n- o teste rapido e o determinante $x_1 y_2 - x_2 y_1$: zero indica paralelismo;\n- dois vetores LI formam uma base do plano.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Para que $\\vec{u} = (2, 3)$ e $\\vec{v} = (4, k)$ sejam paralelos, $k$ deve valer:",
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
                                text: "$8$",
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
                            "Dados $\\vec{u} = (1, 0)$ e $\\vec{v} = (0, 1)$, o vetor $(3, 5)$ escreve-se como:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$3\\vec{u} + 5\\vec{v}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\vec{u} + \\vec{v}$",
                                isCorrect: false,
                            },
                            {
                                text: "$5\\vec{u} + 3\\vec{v}$",
                                isCorrect: false,
                            },
                            {
                                text: "$3\\vec{u} - 5\\vec{v}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Os vetores $\\vec{u} = (2, -1)$ e $\\vec{v} = (-6, 3)$ satisfazem a relacao:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\vec{u} = 3\\vec{v}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{v} = -3\\vec{u}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\vec{v} = 3\\vec{u}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{v} = -2\\vec{u}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que $\\vec{u} = (m, 4)$ e $\\vec{v} = (3, 6)$ sejam paralelos, $m$ deve valer:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$12$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$8$",
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
                            "Se $\\vec{w} = (5, 4)$ se escreve como $a\\vec{u} + b\\vec{v}$, com $\\vec{u} = (1, 2)$ e $\\vec{v} = (2, 1)$, entao:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$a = 1,\\ b = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$a = 2,\\ b = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$a = 3,\\ b = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$a = 1,\\ b = 2$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Vetores no espaco",
                blocks: [
                    {
                        type: "text",
                        value: "## Do plano para o espaco\n\nTudo o que construimos no plano se estende naturalmente ao **espaco tridimensional**. A diferenca e que agora cada ponto e cada vetor precisam de **tres** coordenadas, uma para cada eixo: $x$, $y$ e $z$. Escrevemos:\n\n$$\\vec{u} = (x, y, z)$$\n\nO conjunto de todos esses vetores e denotado por $\\mathbb{R}^3$, assim como o plano e $\\mathbb{R}^2$. O terceiro eixo, $z$, costuma representar a profundidade ou a altura, conforme a orientacao do sistema.",
                    },
                    {
                        type: "text",
                        value: "## Vetor entre pontos e operacoes\n\nAs regras continuam identicas, apenas com uma coordenada a mais. Dados $A = (x_A, y_A, z_A)$ e $B = (x_B, y_B, z_B)$:\n\n$$\\vec{AB} = B - A = (x_B - x_A, y_B - y_A, z_B - z_A)$$\n\nA soma e a multiplicacao por escalar tambem agem componente a componente. Com $\\vec{u} = (x_1, y_1, z_1)$ e $\\vec{v} = (x_2, y_2, z_2)$:\n\n$$\\vec{u} + \\vec{v} = (x_1 + x_2, y_1 + y_2, z_1 + z_2)$$\n\n$$k\\vec{u} = (kx_1, ky_1, kz_1)$$",
                    },
                    {
                        type: "text",
                        value: "## Modulo no espaco\n\nO modulo ganha um termo a mais dentro da raiz. Para $\\vec{u} = (x, y, z)$:\n\n$$\\|\\vec{u}\\| = \\sqrt{x^2 + y^2 + z^2}$$\n\nA formula vem de aplicar o Teorema de Pitagoras duas vezes: uma no plano da base e outra subindo ate a altura $z$. A distancia entre dois pontos segue a mesma ideia, com as componentes de $\\vec{AB}$:\n\n$$d(A, B) = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2 + (z_B - z_A)^2}$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nSejam $A = (1, 0, 2)$ e $B = (3, 2, 5)$. Vamos encontrar $\\vec{AB}$ e o seu modulo.\n\n**Passo 1.** Calculamos extremidade menos origem:\n\n$$\\vec{AB} = (3 - 1, 2 - 0, 5 - 2) = (2, 2, 3)$$\n\n**Passo 2.** Elevamos cada componente ao quadrado e somamos:\n\n$$2^2 + 2^2 + 3^2 = 4 + 4 + 9 = 17$$\n\n**Passo 3.** Extraimos a raiz:\n\n$$\\|\\vec{AB}\\| = \\sqrt{17}$$\n\nComo $17$ nao e quadrado perfeito, deixamos a resposta na forma exata $\\sqrt{17}$, que e a distancia entre $A$ e $B$.",
                    },
                    {
                        type: "text",
                        value: "## Base canonica do espaco\n\nAssim como no plano, o espaco tem uma base canonica, agora com **tres** vetores unitarios, cada um sobre um eixo:\n\n$$\\vec{i} = (1, 0, 0) \\qquad \\vec{j} = (0, 1, 0) \\qquad \\vec{k} = (0, 0, 1)$$\n\nComo consequencia, todo vetor $\\vec{u} = (x, y, z)$ pode ser escrito como:\n\n$$\\vec{u} = x\\vec{i} + y\\vec{j} + z\\vec{k}$$\n\nPor exemplo, $(2, -3, 5) = 2\\vec{i} - 3\\vec{j} + 5\\vec{k}$. Essa notacao e muito usada em fisica para separar as contribuicoes de cada eixo.",
                    },
                    {
                        type: "quote",
                        value: "O espaco nao traz regras novas: traz apenas mais uma coordenada para as mesmas ideias do plano.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- No espaco, um vetor tem tres componentes: $\\vec{u} = (x, y, z)$, e vive em $\\mathbb{R}^3$.\n- Soma, subtracao e multiplicacao por escalar agem componente a componente.\n- O modulo e $\\|\\vec{u}\\| = \\sqrt{x^2 + y^2 + z^2}$.\n- A base canonica e $\\vec{i}, \\vec{j}, \\vec{k}$, e $\\vec{u} = x\\vec{i} + y\\vec{j} + z\\vec{k}$.\n- Todas as ideias do plano continuam valendo, so que com uma coordenada a mais.",
                    },
                ],
                questions: [
                    {
                        statement: "O modulo do vetor $\\vec{u} = (1, 2, 2)$ e:",
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
                                text: "$5$",
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
                            "Dados $A = (1, 0, 2)$ e $B = (3, 2, 5)$, o vetor $\\vec{AB}$ e:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(4, 2, 7)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 2, 3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(2, -2, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-2, -2, -3)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Dados $\\vec{u} = (1, -1, 2)$ e $\\vec{v} = (3, 0, 1)$, o vetor $\\vec{u} + \\vec{v}$ e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(3, 0, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-2, -1, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(4, 1, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(4, -1, 3)$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "O vetor $\\vec{u} = (2, -3, 5)$ escrito na base canonica e:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2\\vec{i} - 3\\vec{j} - 5\\vec{k}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\vec{i} - 3\\vec{j} + 5\\vec{k}$",
                                isCorrect: true,
                            },
                            {
                                text: "$-2\\vec{i} - 3\\vec{j} + 5\\vec{k}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\vec{i} + 3\\vec{j} + 5\\vec{k}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A distancia entre os pontos $A = (1, 2, 2)$ e $B = (3, 3, 4)$ e:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$9$",
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
                            {
                                text: "$\\sqrt{5}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Produto escalar",
        aulas: [
            {
                titulo: "Definição do produto escalar",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é o produto escalar\n\nO **produto escalar** (ou produto interno) é uma operação que recebe dois vetores e devolve um **número real**, e não um novo vetor. Essa é a diferença fundamental em relação a outras operações vetoriais: o resultado de $\\vec{u} \\cdot \\vec{v}$ é sempre um escalar.\n\nDados dois vetores no plano, $\\vec{u} = (u_1, u_2)$ e $\\vec{v} = (v_1, v_2)$, definimos o produto escalar pela soma dos produtos das coordenadas correspondentes:\n\n$$\\vec{u} \\cdot \\vec{v} = u_1 v_1 + u_2 v_2$$",
                    },
                    {
                        type: "text",
                        value: "No espaço, com $\\vec{u} = (u_1, u_2, u_3)$ e $\\vec{v} = (v_1, v_2, v_3)$, a ideia é a mesma, somando também o produto das terceiras coordenadas:\n\n$$\\vec{u} \\cdot \\vec{v} = u_1 v_1 + u_2 v_2 + u_3 v_3$$\n\nRepare que multiplicamos coordenada com coordenada e **somamos tudo**. Um erro comum é multiplicar coordenada a coordenada e manter o resultado como um vetor, do tipo $(u_1 v_1,\\, u_2 v_2)$. Isso não é produto escalar.",
                    },
                    {
                        type: "quote",
                        value: "O produto escalar transforma geometria em aritmética: ângulos, comprimentos e perpendicularismo passam a ser contas simples entre coordenadas.",
                    },
                    {
                        type: "text",
                        value: "## Forma geométrica\n\nO produto escalar também pode ser escrito em função dos comprimentos dos vetores e do ângulo $\\theta$ entre eles:\n\n$$\\vec{u} \\cdot \\vec{v} = \\|\\vec{u}\\|\\,\\|\\vec{v}\\|\\cos\\theta$$\n\nEssa forma mostra por que o produto escalar carrega informação geométrica. Quando os vetores apontam para o mesmo lado, $\\cos\\theta > 0$ e o resultado é positivo; quando são perpendiculares, $\\cos\\theta = 0$ e o produto se anula.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades\n\nPara quaisquer vetores $\\vec{u}$, $\\vec{v}$, $\\vec{w}$ e escalar $\\alpha$, valem:\n\n- Comutativa: $\\vec{u} \\cdot \\vec{v} = \\vec{v} \\cdot \\vec{u}$\n- Distributiva: $\\vec{u} \\cdot (\\vec{v} + \\vec{w}) = \\vec{u} \\cdot \\vec{v} + \\vec{u} \\cdot \\vec{w}$\n- Homogeneidade: $(\\alpha\\vec{u}) \\cdot \\vec{v} = \\alpha(\\vec{u} \\cdot \\vec{v})$\n- Relação com a norma: $\\vec{u} \\cdot \\vec{u} = \\|\\vec{u}\\|^2 \\geq 0$\n\nA última propriedade é muito útil: o produto escalar de um vetor por ele mesmo é o quadrado do seu comprimento.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nSejam $\\vec{u} = (2, 3)$ e $\\vec{v} = (4, -1)$. Aplicando a definição:\n\n$$\\vec{u} \\cdot \\vec{v} = 2 \\cdot 4 + 3 \\cdot (-1) = 8 - 3 = 5$$\n\nO resultado é o número $5$, um escalar. Como ele é positivo, já sabemos que o ângulo entre os vetores é agudo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nNo espaço, considere $\\vec{u} = (1, 2, -2)$ e $\\vec{v} = (3, 0, 1)$:\n\n$$\\vec{u} \\cdot \\vec{v} = 1 \\cdot 3 + 2 \\cdot 0 + (-2) \\cdot 1 = 3 + 0 - 2 = 1$$\n\nPreste atenção ao sinal da terceira parcela. Trocar $(-2) \\cdot 1 = -2$ por $+2$ é um deslize frequente que levaria ao resultado errado $5$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3\n\nVamos usar a relação $\\vec{u} \\cdot \\vec{u} = \\|\\vec{u}\\|^2$ para obter a norma de $\\vec{u} = (3, 4)$:\n\n$$\\vec{u} \\cdot \\vec{u} = 3 \\cdot 3 + 4 \\cdot 4 = 9 + 16 = 25$$\n\nLogo $\\|\\vec{u}\\|^2 = 25$ e, portanto, $\\|\\vec{u}\\| = \\sqrt{25} = 5$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O produto escalar devolve um **número**, não um vetor.\n- Forma algébrica: $\\vec{u} \\cdot \\vec{v} = u_1 v_1 + u_2 v_2 (+\\, u_3 v_3)$.\n- Forma geométrica: $\\vec{u} \\cdot \\vec{v} = \\|\\vec{u}\\|\\,\\|\\vec{v}\\|\\cos\\theta$.\n- $\\vec{u} \\cdot \\vec{u} = \\|\\vec{u}\\|^2$, o que conecta produto escalar e comprimento.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Sejam $\\vec{u} = (2, 3)$ e $\\vec{v} = (4, -1)$. Qual o valor de $\\vec{u} \\cdot \\vec{v}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$11$",
                                isCorrect: false,
                            },
                            {
                                text: "$-5$",
                                isCorrect: false,
                            },
                            {
                                text: "$(8, -3)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Considere $\\vec{u} = (1, 2, -2)$ e $\\vec{v} = (3, 0, 1)$. O produto escalar $\\vec{u} \\cdot \\vec{v}$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$-1$",
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
                            "Se $\\vec{u} = (3, 4)$, use a relação $\\vec{u} \\cdot \\vec{u} = \\|\\vec{u}\\|^2$ para determinar $\\|\\vec{u}\\|$.",
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
                                text: "$7$",
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
                            "Para qualquer vetor $\\vec{u}$, a que é igual o produto escalar $\\vec{u} \\cdot \\vec{u}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\|\\vec{u}\\|^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\|\\vec{u}\\|$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\|\\vec{u}\\|$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $\\vec{u} = (x, 2)$ e $\\vec{v} = (3, -1)$. Sabendo que $\\vec{u} \\cdot \\vec{v} = 4$, qual o valor de $x$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{2}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-2$",
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
                titulo: "Ângulo entre vetores",
                blocks: [
                    {
                        type: "text",
                        value: "## Do produto escalar ao ângulo\n\nA forma geométrica do produto escalar, $\\vec{u} \\cdot \\vec{v} = \\|\\vec{u}\\|\\,\\|\\vec{v}\\|\\cos\\theta$, permite isolar o cosseno do ângulo entre dois vetores não nulos:\n\n$$\\cos\\theta = \\frac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{u}\\|\\,\\|\\vec{v}\\|}$$\n\nO ângulo $\\theta$ é então recuperado por $\\theta = \\arccos\\left(\\dfrac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{u}\\|\\,\\|\\vec{v}\\|}\\right)$, sempre no intervalo $0 \\leq \\theta \\leq \\pi$ (de $0°$ a $180°$).",
                    },
                    {
                        type: "text",
                        value: "## Atenção à normalização\n\nO passo mais esquecido é **dividir pelas normas**. O numerador sozinho, $\\vec{u} \\cdot \\vec{v}$, não é o cosseno: ele precisa ser comparado ao produto dos comprimentos $\\|\\vec{u}\\|\\,\\|\\vec{v}\\|$. Sem essa divisão, o valor obtido pode até ser maior que $1$, o que nunca acontece com um cosseno de verdade.",
                    },
                    {
                        type: "text",
                        value: "## O sinal do produto escalar\n\nComo as normas são sempre positivas, o sinal de $\\vec{u} \\cdot \\vec{v}$ é o mesmo sinal de $\\cos\\theta$. Isso classifica o ângulo de imediato:\n\n| Sinal de $\\vec{u} \\cdot \\vec{v}$ | Ângulo $\\theta$ | Classificação |\n| --- | --- | --- |\n| positivo | $0° \\leq \\theta < 90°$ | agudo |\n| zero | $\\theta = 90°$ | reto |\n| negativo | $90° < \\theta \\leq 180°$ | obtuso |",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nQual o ângulo entre $\\vec{u} = (1, 0)$ e $\\vec{v} = (1, 1)$?\n\nPrimeiro o produto escalar: $\\vec{u} \\cdot \\vec{v} = 1 \\cdot 1 + 0 \\cdot 1 = 1$. Depois as normas: $\\|\\vec{u}\\| = 1$ e $\\|\\vec{v}\\| = \\sqrt{1^2 + 1^2} = \\sqrt{2}$. Assim:\n\n$$\\cos\\theta = \\frac{1}{1 \\cdot \\sqrt{2}} = \\frac{\\sqrt{2}}{2}$$\n\nPortanto $\\theta = 45°$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nAgora $\\vec{u} = (1, 2)$ e $\\vec{v} = (-2, 1)$. O produto escalar é:\n\n$$\\vec{u} \\cdot \\vec{v} = 1 \\cdot (-2) + 2 \\cdot 1 = -2 + 2 = 0$$\n\nComo deu zero, temos $\\cos\\theta = 0$ e $\\theta = 90°$, sem precisar calcular as normas. Os vetores são perpendiculares.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3\n\nSejam $\\vec{u} = (1, \\sqrt{3})$ e $\\vec{v} = (1, 0)$. Temos $\\vec{u} \\cdot \\vec{v} = 1$, $\\|\\vec{u}\\| = \\sqrt{1 + 3} = 2$ e $\\|\\vec{v}\\| = 1$. Logo:\n\n$$\\cos\\theta = \\frac{1}{2 \\cdot 1} = \\frac{1}{2}$$\n\ne o ângulo é $\\theta = 60°$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O cosseno do ângulo é $\\cos\\theta = \\dfrac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{u}\\|\\,\\|\\vec{v}\\|}$, sempre com a normalização.\n- O sinal de $\\vec{u} \\cdot \\vec{v}$ indica se o ângulo é agudo, reto ou obtuso.\n- Se $\\vec{u} \\cdot \\vec{v} = 0$, então $\\theta = 90°$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é o ângulo entre os vetores $\\vec{i} = (1, 0)$ e $\\vec{j} = (0, 1)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$90°$",
                                isCorrect: true,
                            },
                            {
                                text: "$0°$",
                                isCorrect: false,
                            },
                            {
                                text: "$45°$",
                                isCorrect: false,
                            },
                            {
                                text: "$180°$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $\\vec{u} = (1, 1)$ e $\\vec{v} = (1, 0)$. Qual o valor de $\\cos\\theta$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\dfrac{\\sqrt{2}}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{\\sqrt{3}}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O ângulo entre $\\vec{u} = (1, 2)$ e $\\vec{v} = (-2, 1)$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$90°$",
                                isCorrect: true,
                            },
                            {
                                text: "$45°$",
                                isCorrect: false,
                            },
                            {
                                text: "$0°$",
                                isCorrect: false,
                            },
                            {
                                text: "$180°$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se o produto escalar de dois vetores não nulos é negativo, o ângulo entre eles é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "obtuso",
                                isCorrect: true,
                            },
                            {
                                text: "agudo",
                                isCorrect: false,
                            },
                            {
                                text: "reto",
                                isCorrect: false,
                            },
                            {
                                text: "nulo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Determine o ângulo entre $\\vec{u} = (1, \\sqrt{3})$ e $\\vec{v} = (1, 0)$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$60°$",
                                isCorrect: true,
                            },
                            {
                                text: "$30°$",
                                isCorrect: false,
                            },
                            {
                                text: "$45°$",
                                isCorrect: false,
                            },
                            {
                                text: "$90°$",
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
                        value: "## A ideia de projeção\n\nProjetar $\\vec{u}$ sobre $\\vec{v}$ é encontrar a sombra de $\\vec{u}$ na direção de $\\vec{v}$, como se uma luz incidisse perpendicularmente sobre a reta que contém $\\vec{v}$. Essa sombra é um vetor paralelo a $\\vec{v}$, chamado de **projeção ortogonal** de $\\vec{u}$ sobre $\\vec{v}$.",
                    },
                    {
                        type: "text",
                        value: "## Componente escalar\n\nO **comprimento com sinal** dessa sombra é a componente escalar de $\\vec{u}$ na direção de $\\vec{v}$:\n\n$$\\text{comp}_{\\vec{v}}\\,\\vec{u} = \\frac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{v}\\|}$$\n\nSe o resultado for positivo, a sombra aponta no mesmo sentido de $\\vec{v}$; se for negativo, no sentido oposto.",
                    },
                    {
                        type: "text",
                        value: "## Vetor projeção\n\nPara obter o vetor projeção em si, multiplicamos a direção de $\\vec{v}$ pela quantidade certa. A fórmula é:\n\n$$\\text{proj}_{\\vec{v}}\\,\\vec{u} = \\frac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{v}\\|^2}\\,\\vec{v}$$\n\nObserve o denominador $\\|\\vec{v}\\|^2$, e não $\\|\\vec{v}\\|$. Como $\\|\\vec{v}\\|^2 = \\vec{v} \\cdot \\vec{v}$, também é comum escrever $\\text{proj}_{\\vec{v}}\\,\\vec{u} = \\dfrac{\\vec{u} \\cdot \\vec{v}}{\\vec{v} \\cdot \\vec{v}}\\,\\vec{v}$.",
                    },
                    {
                        type: "text",
                        value: "## Cuidados comuns\n\nDois erros aparecem com frequência. O primeiro é dividir por $\\|\\vec{v}\\|$ em vez de $\\|\\vec{v}\\|^2$ ao calcular o **vetor** projeção. O segundo é esquecer de multiplicar por $\\vec{v}$ no final, parando no escalar. Guarde a distinção: a componente é um número, a projeção é um vetor.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nProjete $\\vec{u} = (3, 4)$ sobre $\\vec{v} = (1, 0)$. Temos $\\vec{u} \\cdot \\vec{v} = 3$ e $\\|\\vec{v}\\|^2 = 1$. Logo:\n\n$$\\text{proj}_{\\vec{v}}\\,\\vec{u} = \\frac{3}{1}\\,(1, 0) = (3, 0)$$\n\nA sombra de $(3, 4)$ sobre o eixo horizontal é $(3, 0)$, exatamente a primeira coordenada, como esperado.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nAgora projete $\\vec{u} = (2, 3)$ sobre $\\vec{v} = (1, 1)$. Calculamos $\\vec{u} \\cdot \\vec{v} = 2 + 3 = 5$ e $\\|\\vec{v}\\|^2 = 1^2 + 1^2 = 2$. Então:\n\n$$\\text{proj}_{\\vec{v}}\\,\\vec{u} = \\frac{5}{2}\\,(1, 1) = \\left(\\frac{5}{2},\\, \\frac{5}{2}\\right)$$\n\nSe alguém dividisse por $\\|\\vec{v}\\| = \\sqrt{2}$ em vez de $2$, chegaria a um vetor errado. O denominador correto é o quadrado da norma.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3\n\nNo espaço, projete $\\vec{u} = (1, 2, 2)$ sobre $\\vec{v} = (2, 0, 0)$. Aqui $\\vec{u} \\cdot \\vec{v} = 2$ e $\\|\\vec{v}\\|^2 = 4$. Assim:\n\n$$\\text{proj}_{\\vec{v}}\\,\\vec{u} = \\frac{2}{4}\\,(2, 0, 0) = (1, 0, 0)$$",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Componente escalar: $\\text{comp}_{\\vec{v}}\\,\\vec{u} = \\dfrac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{v}\\|}$ (um número).\n- Vetor projeção: $\\text{proj}_{\\vec{v}}\\,\\vec{u} = \\dfrac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{v}\\|^2}\\,\\vec{v}$ (um vetor).\n- O denominador do vetor projeção é $\\|\\vec{v}\\|^2$, nunca $\\|\\vec{v}\\|$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A projeção ortogonal de $\\vec{u} = (3, 4)$ sobre $\\vec{v} = (1, 0)$ é o vetor:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(3, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(0, 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(4, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 4)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A componente escalar $\\dfrac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{v}\\|}$ de $\\vec{u} = (3, 4)$ na direção de $\\vec{v} = (0, 1)$ vale:",
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
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A projeção ortogonal de $\\vec{u} = (2, 3)$ sobre $\\vec{v} = (1, 1)$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\left(\\dfrac{5}{2}, \\dfrac{5}{2}\\right)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(5, 5)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\left(\\dfrac{5}{\\sqrt{2}}, \\dfrac{5}{\\sqrt{2}}\\right)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 3)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual expressão fornece o vetor projeção de $\\vec{u}$ sobre $\\vec{v}$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\dfrac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{v}\\|^2}\\,\\vec{v}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{v}\\|}\\,\\vec{v}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{v}\\|^2}\\,\\vec{u}$",
                                isCorrect: false,
                            },
                            {
                                text: "$(\\vec{u} \\cdot \\vec{v})\\,\\vec{v}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No espaço, a projeção ortogonal de $\\vec{u} = (1, 2, 2)$ sobre $\\vec{v} = (2, 0, 0)$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$(1, 0, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(2, 0, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\left(\\dfrac{1}{2}, 0, 0\\right)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 2, 2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Ortogonalidade",
                blocks: [
                    {
                        type: "text",
                        value: "## Vetores perpendiculares\n\nDois vetores são **ortogonais** (perpendiculares) quando o ângulo entre eles é de $90°$. Como $\\cos 90° = 0$, a forma geométrica do produto escalar mostra que, nesse caso, $\\vec{u} \\cdot \\vec{v} = 0$. Vale também a volta, o que nos dá um critério simples:\n\n$$\\vec{u} \\perp \\vec{v} \\iff \\vec{u} \\cdot \\vec{v} = 0$$",
                    },
                    {
                        type: "text",
                        value: "## O vetor nulo\n\nPor convenção, o vetor nulo $\\vec{0}$ é ortogonal a **todo** vetor, já que $\\vec{0} \\cdot \\vec{v} = 0$ para qualquer $\\vec{v}$. Fora esse caso, verificar ortogonalidade é apenas conferir se o produto escalar zera.",
                    },
                    {
                        type: "quote",
                        value: "Testar perpendicularismo, que geometricamente exigiria medir um ângulo, vira uma única conta: basta ver se o produto escalar dá zero.",
                    },
                    {
                        type: "text",
                        value: "## Achar um vetor perpendicular\n\nNo plano, um jeito rápido de obter um vetor perpendicular a $(a, b)$ é trocar as coordenadas de lugar e inverter o sinal de uma delas, chegando a $(-b, a)$ ou $(b, -a)$. De fato:\n\n$$(a, b) \\cdot (-b, a) = -ab + ab = 0$$\n\nPor exemplo, um vetor perpendicular a $(1, 2)$ é $(-2, 1)$, ou ainda $(2, -1)$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nOs vetores $\\vec{u} = (2, 3)$ e $\\vec{v} = (3, -2)$ são ortogonais? Basta calcular:\n\n$$\\vec{u} \\cdot \\vec{v} = 2 \\cdot 3 + 3 \\cdot (-2) = 6 - 6 = 0$$\n\nComo o produto escalar é zero, sim, eles são perpendiculares.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nPara que valor de $k$ os vetores $\\vec{u} = (1, 2)$ e $\\vec{v} = (k, -1)$ são ortogonais? Impomos $\\vec{u} \\cdot \\vec{v} = 0$:\n\n$$1 \\cdot k + 2 \\cdot (-1) = 0 \\implies k - 2 = 0 \\implies k = 2$$\n\nEntão $k = 2$ deixa os vetores perpendiculares.",
                    },
                    {
                        type: "text",
                        value: "## Teorema de Pitágoras vetorial\n\nQuando $\\vec{u}$ e $\\vec{v}$ são ortogonais, o termo cruzado some ao expandir $\\|\\vec{u} + \\vec{v}\\|^2$, e sobra a relação de Pitágoras:\n\n$$\\|\\vec{u} + \\vec{v}\\|^2 = \\|\\vec{u}\\|^2 + \\|\\vec{v}\\|^2$$\n\nEsse é o mesmo teorema da geometria plana, agora escrito com vetores.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Critério de ortogonalidade: $\\vec{u} \\perp \\vec{v} \\iff \\vec{u} \\cdot \\vec{v} = 0$.\n- O vetor nulo é ortogonal a todos os vetores.\n- No plano, $(-b, a)$ é perpendicular a $(a, b)$.\n- Vetores ortogonais satisfazem $\\|\\vec{u} + \\vec{v}\\|^2 = \\|\\vec{u}\\|^2 + \\|\\vec{v}\\|^2$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Dois vetores não nulos $\\vec{u}$ e $\\vec{v}$ são ortogonais quando:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\vec{u} \\cdot \\vec{v} = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\vec{u} \\cdot \\vec{v} = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{u} \\cdot \\vec{v} = \\|\\vec{u}\\|\\,\\|\\vec{v}\\|$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{u} = \\vec{v}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual dos vetores abaixo é ortogonal a $\\vec{u} = (1, 2)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(2, -1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(2, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, -2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que valor de $k$ os vetores $\\vec{u} = (3, k)$ e $\\vec{v} = (2, 4)$ são ortogonais?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-\\dfrac{3}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{3}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-6$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual vetor é ortogonal a $\\vec{u} = (1, 1, 1)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(1, -1, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(1, 1, -1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 0, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 1, 1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que valor de $m$ os vetores $\\vec{u} = (m, 2, 1)$ e $\\vec{v} = (3, m, -5)$ são ortogonais?",
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
                                text: "$5$",
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
                titulo: "Aplicações do produto escalar",
                blocks: [
                    {
                        type: "text",
                        value: "## Por que o produto escalar é tão útil\n\nO produto escalar aparece sempre que precisamos relacionar direção e intensidade. Nesta aula reunimos as aplicações mais comuns: cálculo de trabalho na física, medição de ângulos internos de figuras, teste de perpendicularismo e decomposição de vetores. Todas se apoiam nas fórmulas que já vimos nas aulas anteriores.",
                    },
                    {
                        type: "text",
                        value: "## Trabalho de uma força\n\nNa física, o **trabalho** realizado por uma força constante $\\vec{F}$ ao longo de um deslocamento $\\vec{d}$ é justamente o produto escalar entre os dois:\n\n$$W = \\vec{F} \\cdot \\vec{d} = \\|\\vec{F}\\|\\,\\|\\vec{d}\\|\\cos\\theta$$\n\nSe a força for perpendicular ao deslocamento, $\\cos 90° = 0$ e o trabalho é nulo. Isso explica por que uma força vertical não realiza trabalho sobre um corpo que se move na horizontal.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1\n\nUma força $\\vec{F} = (3, 4)$ N desloca um corpo por $\\vec{d} = (5, 0)$ m. O trabalho é:\n\n$$W = \\vec{F} \\cdot \\vec{d} = 3 \\cdot 5 + 4 \\cdot 0 = 15 \\text{ J}$$\n\nMesmo a força tendo componente vertical, só a parte alinhada ao deslocamento contribui para o trabalho.",
                    },
                    {
                        type: "text",
                        value: "## Ângulos internos de uma figura\n\nPara achar o ângulo interno em um vértice, montamos os vetores dos dois lados que saem dele e aplicamos a fórmula do cosseno. Considere o triângulo de vértices $A = (0, 0)$, $B = (1, 0)$ e $C = (1, 1)$. No vértice $A$, os lados são $\\overrightarrow{AB} = (1, 0)$ e $\\overrightarrow{AC} = (1, 1)$:\n\n$$\\cos A = \\frac{\\overrightarrow{AB} \\cdot \\overrightarrow{AC}}{\\|\\overrightarrow{AB}\\|\\,\\|\\overrightarrow{AC}\\|} = \\frac{1}{1 \\cdot \\sqrt{2}} = \\frac{\\sqrt{2}}{2}$$\n\nLogo o ângulo em $A$ mede $45°$.",
                    },
                    {
                        type: "text",
                        value: "## Decomposição de um vetor\n\nUsando a projeção, todo vetor $\\vec{u}$ pode ser escrito como a soma de uma parte paralela a $\\vec{v}$ e uma parte perpendicular a $\\vec{v}$. A parte paralela é $\\text{proj}_{\\vec{v}}\\,\\vec{u}$; a perpendicular é o que sobra:\n\n$$\\vec{u} = \\text{proj}_{\\vec{v}}\\,\\vec{u} + \\left(\\vec{u} - \\text{proj}_{\\vec{v}}\\,\\vec{u}\\right)$$\n\nPor exemplo, decompondo $\\vec{u} = (3, 3)$ na direção de $\\vec{v} = (1, 0)$: a projeção é $(3, 0)$ e a parte perpendicular é $(3, 3) - (3, 0) = (0, 3)$.",
                    },
                    {
                        type: "text",
                        value: "## Desigualdade de Cauchy-Schwarz\n\nComo $|\\cos\\theta| \\leq 1$, a forma geométrica leva diretamente a uma desigualdade central da matemática:\n\n$$|\\vec{u} \\cdot \\vec{v}| \\leq \\|\\vec{u}\\|\\,\\|\\vec{v}\\|$$\n\nA igualdade só ocorre quando os vetores são paralelos. Ela garante, entre outras coisas, que a fração usada para calcular $\\cos\\theta$ nunca escapa do intervalo $[-1, 1]$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2\n\nUma força de módulo $\\|\\vec{F}\\| = 10$ N puxa um bloco por uma distância de $5$ m, formando $60°$ com o deslocamento. O trabalho é:\n\n$$W = \\|\\vec{F}\\|\\,\\|\\vec{d}\\|\\cos\\theta = 10 \\cdot 5 \\cdot \\cos 60° = 10 \\cdot 5 \\cdot \\frac{1}{2} = 25 \\text{ J}$$",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Trabalho: $W = \\vec{F} \\cdot \\vec{d}$; força perpendicular ao deslocamento não realiza trabalho.\n- Ângulos de figuras: monte os vetores dos lados e use $\\cos\\theta = \\dfrac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{u}\\|\\,\\|\\vec{v}\\|}$.\n- Decomposição: $\\vec{u}$ se separa em parte paralela ($\\text{proj}_{\\vec{v}}\\,\\vec{u}$) e perpendicular.\n- Cauchy-Schwarz: $|\\vec{u} \\cdot \\vec{v}| \\leq \\|\\vec{u}\\|\\,\\|\\vec{v}\\|$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma força $\\vec{F} = (3, 4)$ desloca um corpo por $\\vec{d} = (5, 0)$. O trabalho realizado é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$15$",
                                isCorrect: true,
                            },
                            {
                                text: "$20$",
                                isCorrect: false,
                            },
                            {
                                text: "$35$",
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
                            "Se uma força é perpendicular ao deslocamento, o trabalho que ela realiza é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\|\\vec{F}\\|\\,\\|\\vec{d}\\|$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\|\\vec{F}\\| + \\|\\vec{d}\\|$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\|\\vec{F}\\|$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No triângulo de vértices $A = (0, 0)$, $B = (1, 0)$ e $C = (1, 1)$, o ângulo interno no vértice $A$ mede:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$45°$",
                                isCorrect: true,
                            },
                            {
                                text: "$30°$",
                                isCorrect: false,
                            },
                            {
                                text: "$60°$",
                                isCorrect: false,
                            },
                            {
                                text: "$90°$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Decompondo $\\vec{u} = (3, 3)$ na direção de $\\vec{v} = (1, 0)$, a parte de $\\vec{u}$ perpendicular a $\\vec{v}$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(0, 3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(3, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma força de módulo $10$ N atua ao longo de $5$ m formando $60°$ com o deslocamento. O trabalho realizado é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$25 \\text{ J}$",
                                isCorrect: true,
                            },
                            {
                                text: "$50 \\text{ J}$",
                                isCorrect: false,
                            },
                            {
                                text: "$25\\sqrt{3} \\text{ J}$",
                                isCorrect: false,
                            },
                            {
                                text: "$43{,}3 \\text{ J}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Produto vetorial e produto misto",
        aulas: [
            {
                titulo: "O produto vetorial",
                blocks: [
                    {
                        type: "text",
                        value: "# O produto vetorial\n\nNo módulo anterior você estudou o **produto escalar**, que combina dois vetores e devolve um número. Agora vamos conhecer uma operação de natureza diferente: o **produto vetorial**, que combina dois vetores do espaço $\\mathbb{R}^3$ e devolve **outro vetor**.\n\nDados $\\vec{u}$ e $\\vec{v}$ em $\\mathbb{R}^3$, o produto vetorial $\\vec{u} \\times \\vec{v}$ é um vetor **perpendicular** ao plano determinado por $\\vec{u}$ e $\\vec{v}$. Essa característica faz do produto vetorial uma ferramenta central para achar vetores normais a planos, calcular áreas e estudar orientação no espaço.\n\nUma observação importante: o produto vetorial só está definido em $\\mathbb{R}^3$. Não existe uma versão dele em $\\mathbb{R}^2$ com as mesmas propriedades.",
                    },
                    {
                        type: "text",
                        value: "## Definição pela forma de determinante\n\nA maneira mais prática de calcular o produto vetorial usa um **determinante simbólico** $3 \\times 3$. Colocamos os vetores da base canônica $\\vec{i}, \\vec{j}, \\vec{k}$ na primeira linha, as componentes de $\\vec{u} = (u_1, u_2, u_3)$ na segunda e as de $\\vec{v} = (v_1, v_2, v_3)$ na terceira:\n\n$$\\vec{u} \\times \\vec{v} = \\begin{vmatrix} \\vec{i} & \\vec{j} & \\vec{k} \\\\ u_1 & u_2 & u_3 \\\\ v_1 & v_2 & v_3 \\end{vmatrix}$$\n\nAqui a ordem importa muito: $\\vec{u}$ vem antes de $\\vec{v}$, então as componentes de $\\vec{u}$ ocupam a segunda linha. Trocar as duas linhas troca o sinal do resultado.",
                    },
                    {
                        type: "text",
                        value: "## Fórmula em componentes\n\nDesenvolvendo o determinante pela primeira linha, chegamos à fórmula fechada:\n\n$$\\vec{u} \\times \\vec{v} = (u_2 v_3 - u_3 v_2,\\ u_3 v_1 - u_1 v_3,\\ u_1 v_2 - u_2 v_1)$$\n\nRepare no padrão de cada componente: nenhuma delas usa o índice correspondente. A componente do $x$ só envolve os índices $2$ e $3$; a do $y$ envolve $3$ e $1$ nessa ordem; a do $z$ envolve $1$ e $2$. Atenção especial à componente do meio: por causa do sinal do desenvolvimento, ela é a que mais gera erro. Uma forma segura de lembrar é $u_3 v_1 - u_1 v_3$, e não $u_1 v_3 - u_3 v_1$.",
                    },
                    {
                        type: "quote",
                        value: "O produto escalar mede o quanto dois vetores apontam na mesma direção; o produto vetorial mede o quanto eles se abrem no espaço.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nCalcule $\\vec{u} \\times \\vec{v}$ para $\\vec{u} = (1, 2, 3)$ e $\\vec{v} = (4, 5, 6)$.\n\nAplicando a fórmula componente a componente:\n\n- Componente $x$: $u_2 v_3 - u_3 v_2 = 2 \\cdot 6 - 3 \\cdot 5 = 12 - 15 = -3$\n- Componente $y$: $u_3 v_1 - u_1 v_3 = 3 \\cdot 4 - 1 \\cdot 6 = 12 - 6 = 6$\n- Componente $z$: $u_1 v_2 - u_2 v_1 = 1 \\cdot 5 - 2 \\cdot 4 = 5 - 8 = -3$\n\nPortanto $\\vec{u} \\times \\vec{v} = (-3, 6, -3)$.\n\nPodemos conferir a perpendicularidade com o produto escalar: $\\vec{u} \\cdot (\\vec{u} \\times \\vec{v}) = 1(-3) + 2(6) + 3(-3) = -3 + 12 - 9 = 0$. Como o resultado é zero, o vetor obtido é de fato perpendicular a $\\vec{u}$, e o mesmo vale para $\\vec{v}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nAgora calcule $\\vec{u} \\times \\vec{v}$ para $\\vec{u} = (2, -1, 3)$ e $\\vec{v} = (1, 0, -2)$, prestando atenção aos sinais.\n\n- Componente $x$: $u_2 v_3 - u_3 v_2 = (-1)(-2) - (3)(0) = 2 - 0 = 2$\n- Componente $y$: $u_3 v_1 - u_1 v_3 = (3)(1) - (2)(-2) = 3 + 4 = 7$\n- Componente $z$: $u_1 v_2 - u_2 v_1 = (2)(0) - (-1)(1) = 0 + 1 = 1$\n\nLogo $\\vec{u} \\times \\vec{v} = (2, 7, 1)$.\n\nSe tivéssemos calculado $\\vec{v} \\times \\vec{u}$, obteríamos $(-2, -7, -1)$, ou seja, exatamente o oposto. Isso ilustra a propriedade anticomutativa que veremos a seguir.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades\n\nSejam $\\vec{u}, \\vec{v}, \\vec{w}$ vetores de $\\mathbb{R}^3$ e $\\lambda$ um escalar. As principais propriedades são:\n\n| Propriedade | Expressão |\n| --- | --- |\n| Anticomutatividade | $\\vec{v} \\times \\vec{u} = -(\\vec{u} \\times \\vec{v})$ |\n| Vetor por ele mesmo | $\\vec{u} \\times \\vec{u} = \\vec{0}$ |\n| Distributiva | $\\vec{u} \\times (\\vec{v} + \\vec{w}) = \\vec{u} \\times \\vec{v} + \\vec{u} \\times \\vec{w}$ |\n| Fator escalar | $(\\lambda \\vec{u}) \\times \\vec{v} = \\lambda (\\vec{u} \\times \\vec{v})$ |\n| Vetores paralelos | Se $\\vec{u} \\parallel \\vec{v}$, então $\\vec{u} \\times \\vec{v} = \\vec{0}$ |\n\nUm cuidado: o produto vetorial **não é associativo**. Em geral, $(\\vec{u} \\times \\vec{v}) \\times \\vec{w} \\neq \\vec{u} \\times (\\vec{v} \\times \\vec{w})$.",
                    },
                    {
                        type: "text",
                        value: "## Direção, sentido e a regra da mão direita\n\nO vetor $\\vec{u} \\times \\vec{v}$ tem três características geométricas:\n\n1. **Direção**: é perpendicular ao plano gerado por $\\vec{u}$ e $\\vec{v}$.\n2. **Sentido**: dado pela **regra da mão direita**. Aponte os dedos de $\\vec{u}$ girando na direção de $\\vec{v}$; o polegar indica o sentido de $\\vec{u} \\times \\vec{v}$.\n3. **Comprimento**: proporcional à área que $\\vec{u}$ e $\\vec{v}$ determinam, assunto da próxima aula.\n\nOs vetores da base canônica ilustram bem o sentido: $\\vec{i} \\times \\vec{j} = \\vec{k}$, $\\vec{j} \\times \\vec{k} = \\vec{i}$ e $\\vec{k} \\times \\vec{i} = \\vec{j}$. Seguindo a ordem cíclica $\\vec{i} \\to \\vec{j} \\to \\vec{k} \\to \\vec{i}$ o resultado é positivo; contra essa ordem, negativo.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O produto vetorial $\\vec{u} \\times \\vec{v}$ existe em $\\mathbb{R}^3$ e devolve um **vetor** perpendicular a $\\vec{u}$ e a $\\vec{v}$.\n- Calcula-se pelo determinante simbólico com $\\vec{i}, \\vec{j}, \\vec{k}$ na primeira linha, ou pela fórmula $(u_2 v_3 - u_3 v_2,\\ u_3 v_1 - u_1 v_3,\\ u_1 v_2 - u_2 v_1)$.\n- É anticomutativo: trocar a ordem troca o sinal.\n- Vetores paralelos têm produto vetorial nulo.\n- O sentido segue a regra da mão direita.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O produto vetorial $\\vec{i} \\times \\vec{j}$ dos vetores da base canônica é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\vec{k}$",
                                isCorrect: true,
                            },
                            {
                                text: "$-\\vec{k}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{i}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{0}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $\\vec{u} = (1, 2, 3)$ e $\\vec{v} = (4, 5, 6)$. O produto vetorial $\\vec{u} \\times \\vec{v}$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(3, -6, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-3, 6, -3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(-3, -6, -3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-3, 6, 3)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $\\vec{u} = (2, -1, 3)$ e $\\vec{v} = (1, 0, -2)$. O produto vetorial $\\vec{u} \\times \\vec{v}$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(2, 7, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(-2, -7, -1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, -7, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 7, -1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre o produto vetorial de $\\vec{u}$ e $\\vec{v}$ em $\\mathbb{R}^3$, qual afirmação é verdadeira?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\vec{u} \\times \\vec{v} = \\vec{v} \\times \\vec{u}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{u} \\times \\vec{v}$ é paralelo a $\\vec{u}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{u} \\times \\vec{v} = -(\\vec{v} \\times \\vec{u})$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\vec{u} \\times \\vec{v}$ é perpendicular só a $\\vec{u}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para qual valor de $m$ o produto vetorial $\\vec{u} \\times \\vec{v}$ é o vetor nulo, sendo $\\vec{u} = (m, 2, 4)$ e $\\vec{v} = (3, 6, 12)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$m = 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$m = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$m = 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$m = 6$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Módulo do produto vetorial e área",
                blocks: [
                    {
                        type: "text",
                        value: "# Módulo do produto vetorial e área\n\nNa aula anterior vimos **como** calcular $\\vec{u} \\times \\vec{v}$ e que ele é perpendicular a $\\vec{u}$ e $\\vec{v}$. Falta entender o **comprimento** desse vetor, que carrega uma informação geométrica valiosa.\n\nSe $\\theta$ é o ângulo entre $\\vec{u}$ e $\\vec{v}$, com $0 \\leq \\theta \\leq \\pi$, então:\n\n$$\\|\\vec{u} \\times \\vec{v}\\| = \\|\\vec{u}\\|\\,\\|\\vec{v}\\|\\sin\\theta$$\n\nCompare com o produto escalar, que usa $\\cos\\theta$. Enquanto o produto escalar se anula quando os vetores são perpendiculares, o módulo do produto vetorial se anula quando eles são **paralelos**, pois $\\sin 0 = 0$.",
                    },
                    {
                        type: "text",
                        value: "## Interpretação: área do paralelogramo\n\nO significado geométrico de $\\|\\vec{u} \\times \\vec{v}\\|$ é direto: ele é igual à **área do paralelogramo** construído sobre $\\vec{u}$ e $\\vec{v}$.\n\n$$A_{\\text{paralelogramo}} = \\|\\vec{u} \\times \\vec{v}\\|$$\n\nA justificativa vem da própria fórmula. Um paralelogramo de lados $\\|\\vec{u}\\|$ e $\\|\\vec{v}\\|$ tem área igual a base vezes altura, e a altura é $\\|\\vec{v}\\|\\sin\\theta$. Logo a área é $\\|\\vec{u}\\|\\,\\|\\vec{v}\\|\\sin\\theta$, que é exatamente $\\|\\vec{u} \\times \\vec{v}\\|$.",
                    },
                    {
                        type: "text",
                        value: "## Área do triângulo\n\nUm triângulo de lados $\\vec{u}$ e $\\vec{v}$, a partir de um vértice comum, é exatamente **metade** do paralelogramo correspondente. Portanto:\n\n$$A_{\\text{triângulo}} = \\frac{1}{2}\\|\\vec{u} \\times \\vec{v}\\|$$\n\nEsse fator $\\frac{1}{2}$ é a fonte de erro mais comum nesse tipo de problema. Se o enunciado pede a área de um **triângulo** e você esquece de dividir por dois, obtém a área do paralelogramo, ou seja, o dobro do valor correto.",
                    },
                    {
                        type: "quote",
                        value: "O comprimento do produto vetorial é uma área disfarçada de vetor.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nCalcule a área do paralelogramo determinado por $\\vec{u} = (1, 2, 3)$ e $\\vec{v} = (4, 5, 6)$.\n\nJá calculamos na aula anterior que $\\vec{u} \\times \\vec{v} = (-3, 6, -3)$. Basta tomar o módulo:\n\n$$\\|\\vec{u} \\times \\vec{v}\\| = \\sqrt{(-3)^2 + 6^2 + (-3)^2} = \\sqrt{9 + 36 + 9} = \\sqrt{54} = 3\\sqrt{6}$$\n\nPortanto a área do paralelogramo é $3\\sqrt{6}$ unidades de área. Se quiséssemos a área do triângulo de lados $\\vec{u}$ e $\\vec{v}$, seria a metade: $\\frac{3\\sqrt{6}}{2}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nDetermine a área do triângulo de vértices $A = (1, 0, 0)$, $B = (0, 2, 0)$ e $C = (0, 0, 3)$.\n\nPrimeiro montamos dois vetores a partir de um mesmo vértice, digamos $A$:\n\n$$\\vec{AB} = B - A = (-1, 2, 0), \\qquad \\vec{AC} = C - A = (-1, 0, 3)$$\n\nEm seguida calculamos o produto vetorial:\n\n- Componente $x$: $(2)(3) - (0)(0) = 6$\n- Componente $y$: $(0)(-1) - (-1)(3) = 3$\n- Componente $z$: $(-1)(0) - (2)(-1) = 2$\n\nEntão $\\vec{AB} \\times \\vec{AC} = (6, 3, 2)$ e $\\|\\vec{AB} \\times \\vec{AC}\\| = \\sqrt{36 + 9 + 4} = \\sqrt{49} = 7$.\n\nComo se trata de um triângulo, dividimos por dois:\n\n$$A_{\\text{triângulo}} = \\frac{1}{2} \\cdot 7 = \\frac{7}{2}$$",
                    },
                    {
                        type: "text",
                        value: "## Usando a área para achar o ângulo\n\nA fórmula do módulo também serve para calcular o ângulo entre dois vetores. Isolando $\\sin\\theta$:\n\n$$\\sin\\theta = \\frac{\\|\\vec{u} \\times \\vec{v}\\|}{\\|\\vec{u}\\|\\,\\|\\vec{v}\\|}$$\n\nNa prática, para achar o ângulo costuma-se preferir o produto escalar, que dá o cosseno e distingue ângulos agudos de obtusos. Ainda assim, é útil saber que o produto vetorial fornece o seno do ângulo, e que os dois juntos determinam $\\theta$ sem ambiguidade.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O módulo do produto vetorial vale $\\|\\vec{u} \\times \\vec{v}\\| = \\|\\vec{u}\\|\\,\\|\\vec{v}\\|\\sin\\theta$.\n- Ele é igual à **área do paralelogramo** de lados $\\vec{u}$ e $\\vec{v}$.\n- A **área do triângulo** é a metade: $\\frac{1}{2}\\|\\vec{u} \\times \\vec{v}\\|$.\n- Para vértices $A, B, C$, use $\\vec{AB}$ e $\\vec{AC}$ e não esqueça de dividir por dois.\n- O módulo se anula quando os vetores são paralelos.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Se $\\|\\vec{u} \\times \\vec{v}\\| = 10$, a área do paralelogramo de lados $\\vec{u}$ e $\\vec{v}$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$10$",
                                isCorrect: true,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$20$",
                                isCorrect: false,
                            },
                            {
                                text: "$100$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $\\|\\vec{u} \\times \\vec{v}\\| = 10$, a área do triângulo de lados $\\vec{u}$ e $\\vec{v}$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$10$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$15$",
                                isCorrect: false,
                            },
                            {
                                text: "$20$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sabendo que $\\vec{u} \\times \\vec{v} = (2, 3, 6)$, a área do paralelogramo de lados $\\vec{u}$ e $\\vec{v}$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$49$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{7}$",
                                isCorrect: false,
                            },
                            {
                                text: "$7$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{7}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O produto vetorial dos lados de um triângulo é $\\vec{AB} \\times \\vec{AC} = (0, 4, 3)$. A área desse triângulo é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{5}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{25}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$25$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A área do triângulo de vértices $A = (0, 0, 0)$, $B = (1, 2, 2)$ e $C = (2, -2, 1)$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{9}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{81}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$81$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O produto misto",
                blocks: [
                    {
                        type: "text",
                        value: "# O produto misto\n\nO **produto misto** combina as duas operações que já conhecemos: o produto vetorial e o produto escalar. Dados três vetores $\\vec{u}, \\vec{v}, \\vec{w}$ de $\\mathbb{R}^3$, definimos:\n\n$$[\\vec{u}, \\vec{v}, \\vec{w}] = \\vec{u} \\cdot (\\vec{v} \\times \\vec{w})$$\n\nPrimeiro calculamos o produto vetorial $\\vec{v} \\times \\vec{w}$, que é um vetor, e depois fazemos o produto escalar com $\\vec{u}$, que devolve um número. Por isso, **o produto misto é um escalar**, não um vetor. A notação $[\\vec{u}, \\vec{v}, \\vec{w}]$ é uma abreviação prática para essa combinação.",
                    },
                    {
                        type: "text",
                        value: "## Cálculo por determinante\n\nA grande vantagem do produto misto é que ele pode ser calculado diretamente por um **determinante** $3 \\times 3$ cujas linhas são as componentes dos três vetores, na ordem:\n\n$$[\\vec{u}, \\vec{v}, \\vec{w}] = \\begin{vmatrix} u_1 & u_2 & u_3 \\\\ v_1 & v_2 & v_3 \\\\ w_1 & w_2 & w_3 \\end{vmatrix}$$\n\nA primeira linha traz as componentes de $\\vec{u}$, a segunda as de $\\vec{v}$ e a terceira as de $\\vec{w}$. Diferente do determinante simbólico do produto vetorial, aqui **todas** as entradas são números, então o resultado é um número.",
                    },
                    {
                        type: "text",
                        value: "## Desenvolvendo o determinante\n\nUma forma de desenvolver é pela primeira linha, usando cofatores:\n\n$$[\\vec{u}, \\vec{v}, \\vec{w}] = u_1 (v_2 w_3 - v_3 w_2) - u_2 (v_1 w_3 - v_3 w_1) + u_3 (v_1 w_2 - v_2 w_1)$$\n\nRepare que os termos entre parênteses são exatamente as componentes de $\\vec{v} \\times \\vec{w}$, o que confirma a definição $[\\vec{u}, \\vec{v}, \\vec{w}] = \\vec{u} \\cdot (\\vec{v} \\times \\vec{w})$. Preste atenção ao **sinal negativo** do termo do meio: ele é a origem mais frequente de erro no cálculo.",
                    },
                    {
                        type: "quote",
                        value: "O produto misto pega três vetores e resume, em um único número, toda a geometria que eles formam no espaço.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nComece com um caso simples: $\\vec{u} = (1, 0, 0)$, $\\vec{v} = (0, 1, 0)$ e $\\vec{w} = (0, 0, 1)$, os próprios vetores da base canônica.\n\n$$[\\vec{u}, \\vec{v}, \\vec{w}] = \\begin{vmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{vmatrix} = 1$$\n\nO resultado $1$ não é coincidência: veremos na próxima aula que ele corresponde ao volume do cubo unitário gerado por esses três vetores.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nCalcule $[\\vec{u}, \\vec{v}, \\vec{w}]$ para $\\vec{u} = (2, 1, 0)$, $\\vec{v} = (1, 3, 1)$ e $\\vec{w} = (0, 2, 4)$.\n\nMontamos o determinante e desenvolvemos pela primeira linha:\n\n$$\\begin{vmatrix} 2 & 1 & 0 \\\\ 1 & 3 & 1 \\\\ 0 & 2 & 4 \\end{vmatrix} = 2\\begin{vmatrix} 3 & 1 \\\\ 2 & 4 \\end{vmatrix} - 1\\begin{vmatrix} 1 & 1 \\\\ 0 & 4 \\end{vmatrix} + 0\\begin{vmatrix} 1 & 3 \\\\ 0 & 2 \\end{vmatrix}$$\n\nCalculando cada menor:\n\n- $2(3 \\cdot 4 - 1 \\cdot 2) = 2(12 - 2) = 20$\n- $-1(1 \\cdot 4 - 1 \\cdot 0) = -1(4) = -4$\n- o terceiro termo é multiplicado por $0$, então se anula\n\nSomando: $[\\vec{u}, \\vec{v}, \\vec{w}] = 20 - 4 + 0 = 16$.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades\n\nO produto misto herda o comportamento do determinante diante de trocas de linhas:\n\n| Operação | Efeito |\n| --- | --- |\n| Permutação cíclica | $[\\vec{u}, \\vec{v}, \\vec{w}] = [\\vec{v}, \\vec{w}, \\vec{u}] = [\\vec{w}, \\vec{u}, \\vec{v}]$ |\n| Trocar dois vetores | inverte o sinal |\n| Dois vetores iguais | o produto misto é $0$ |\n\nDa permutação cíclica sai uma identidade elegante: $\\vec{u} \\cdot (\\vec{v} \\times \\vec{w}) = (\\vec{u} \\times \\vec{v}) \\cdot \\vec{w}$. Ou seja, dá para trocar o ponto pelo produto vetorial sem alterar o resultado.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O produto misto é $[\\vec{u}, \\vec{v}, \\vec{w}] = \\vec{u} \\cdot (\\vec{v} \\times \\vec{w})$ e resulta em um **número**.\n- Calcula-se pelo determinante $3 \\times 3$ com os vetores nas linhas, na ordem $\\vec{u}, \\vec{v}, \\vec{w}$.\n- Permutações cíclicas não mudam o valor; trocar dois vetores inverte o sinal.\n- Se dois dos vetores forem iguais, o produto misto é zero.\n- No cálculo, cuidado com o sinal negativo do termo central.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O resultado do produto misto $[\\vec{u}, \\vec{v}, \\vec{w}]$ de três vetores de $\\mathbb{R}^3$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "um vetor perpendicular aos três",
                                isCorrect: false,
                            },
                            {
                                text: "um número real (escalar)",
                                isCorrect: true,
                            },
                            {
                                text: "um vetor no plano de $\\vec{v}$ e $\\vec{w}$",
                                isCorrect: false,
                            },
                            {
                                text: "sempre igual a zero",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Calcule $[\\vec{u}, \\vec{v}, \\vec{w}]$ para $\\vec{u} = (2, 0, 0)$, $\\vec{v} = (0, 3, 0)$ e $\\vec{w} = (0, 0, 5)$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$30$",
                                isCorrect: true,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$10$",
                                isCorrect: false,
                            },
                            {
                                text: "$-30$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Calcule $[\\vec{u}, \\vec{v}, \\vec{w}]$ para $\\vec{u} = (1, 2, 1)$, $\\vec{v} = (0, 1, 3)$ e $\\vec{w} = (2, 0, 1)$.",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-11$",
                                isCorrect: false,
                            },
                            {
                                text: "$11$",
                                isCorrect: true,
                            },
                            {
                                text: "$-13$",
                                isCorrect: false,
                            },
                            {
                                text: "$-1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sabendo que $[\\vec{u}, \\vec{v}, \\vec{w}] = 7$, o valor de $[\\vec{v}, \\vec{w}, \\vec{u}]$ é:",
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
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$14$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Calcule o produto misto $[\\vec{u}, \\vec{v}, \\vec{w}]$ para $\\vec{u} = (1, -1, 2)$, $\\vec{v} = (3, 0, 1)$ e $\\vec{w} = (-1, 2, 1)$.",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$14$",
                                isCorrect: true,
                            },
                            {
                                text: "$-14$",
                                isCorrect: false,
                            },
                            {
                                text: "$10$",
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
                titulo: "Produto misto e volume",
                blocks: [
                    {
                        type: "text",
                        value: "# Produto misto e volume\n\nNa aula anterior aprendemos a calcular o produto misto. Agora vem a interpretação geométrica que o torna tão útil: **o módulo do produto misto é o volume do paralelepípedo** construído sobre os três vetores.\n\n$$V_{\\text{paralelepípedo}} = \\bigl| [\\vec{u}, \\vec{v}, \\vec{w}] \\bigr|$$\n\nAssim como $\\|\\vec{u} \\times \\vec{v}\\|$ media uma área, $\\bigl|[\\vec{u}, \\vec{v}, \\vec{w}]\\bigr|$ mede um volume. Usamos o **módulo** porque o produto misto pode ser negativo, dependendo da orientação dos vetores, mas volume é sempre uma quantidade não negativa.",
                    },
                    {
                        type: "text",
                        value: "## Por que funciona\n\nO paralelepípedo tem como base o paralelogramo de lados $\\vec{v}$ e $\\vec{w}$, cuja área é $\\|\\vec{v} \\times \\vec{w}\\|$. O volume é a área da base vezes a altura $h$, e a altura é a projeção de $\\vec{u}$ na direção perpendicular à base, ou seja, na direção de $\\vec{v} \\times \\vec{w}$.\n\nJuntando as duas ideias, o produto escalar $\\vec{u} \\cdot (\\vec{v} \\times \\vec{w})$ multiplica a área da base pela componente de $\\vec{u}$ nessa direção. O resultado, em módulo, é exatamente o volume. Esse é o significado geométrico da definição $[\\vec{u}, \\vec{v}, \\vec{w}] = \\vec{u} \\cdot (\\vec{v} \\times \\vec{w})$.",
                    },
                    {
                        type: "text",
                        value: "## Volume do tetraedro\n\nQuatro pontos não coplanares determinam um **tetraedro**. Seu volume é uma fração do volume do paralelepípedo correspondente. Especificamente:\n\n$$V_{\\text{tetraedro}} = \\frac{1}{6}\\bigl| [\\vec{u}, \\vec{v}, \\vec{w}] \\bigr|$$\n\nO fator $\\frac{1}{6}$ aparece porque o tetraedro cabe seis vezes no paralelepípedo. É o análogo tridimensional do $\\frac{1}{2}$ que relacionava o triângulo ao paralelogramo. Guarde a diferença: para **área** de triângulo dividimos por $2$; para **volume** de tetraedro dividimos por $6$.",
                    },
                    {
                        type: "quote",
                        value: "Uma área vira volume, e o determinante continua sendo a régua que mede tudo isso.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nCalcule o volume do paralelepípedo determinado por $\\vec{u} = (1, 2, 1)$, $\\vec{v} = (2, 1, 0)$ e $\\vec{w} = (1, 1, 2)$.\n\nMontamos o determinante:\n\n$$[\\vec{u}, \\vec{v}, \\vec{w}] = \\begin{vmatrix} 1 & 2 & 1 \\\\ 2 & 1 & 0 \\\\ 1 & 1 & 2 \\end{vmatrix} = 1(1 \\cdot 2 - 0 \\cdot 1) - 2(2 \\cdot 2 - 0 \\cdot 1) + 1(2 \\cdot 1 - 1 \\cdot 1)$$\n\nCalculando: $1(2) - 2(4) + 1(1) = 2 - 8 + 1 = -5$.\n\nO produto misto deu $-5$. Como volume é o módulo, temos:\n\n$$V = |-5| = 5 \\text{ unidades de volume}$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nDetermine o volume do tetraedro de vértices $A = (1, 1, 1)$, $B = (2, 3, 2)$, $C = (3, 2, 1)$ e $D = (2, 2, 3)$.\n\nA partir do vértice $A$, montamos três vetores:\n\n$$\\vec{AB} = (1, 2, 1), \\quad \\vec{AC} = (2, 1, 0), \\quad \\vec{AD} = (1, 1, 2)$$\n\nSão os mesmos vetores do exemplo anterior, então já sabemos que $[\\vec{AB}, \\vec{AC}, \\vec{AD}] = -5$. Aplicando a fórmula do tetraedro:\n\n$$V = \\frac{1}{6}|-5| = \\frac{5}{6} \\text{ unidades de volume}$$\n\nRepare como o mesmo produto misto serviu para os dois sólidos: o paralelepípedo tem volume $5$ e o tetraedro correspondente, $\\frac{5}{6}$.",
                    },
                    {
                        type: "text",
                        value: "## O sinal do produto misto\n\nO produto misto pode ser positivo, negativo ou nulo, e cada caso tem um significado:\n\n- **Positivo**: os vetores $\\vec{u}, \\vec{v}, \\vec{w}$ formam um triedro **positivo**, com a mesma orientação da base canônica pela regra da mão direita.\n- **Negativo**: formam um triedro **negativo**, com orientação invertida.\n- **Nulo**: os três vetores são coplanares e o paralelepípedo é achatado, com volume zero.\n\nPara volume, o sinal é descartado pelo módulo. Mas em outras aplicações, como orientação e o critério de coplanaridade da próxima aula, o sinal carrega informação importante.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O volume do paralelepípedo é $V = \\bigl|[\\vec{u}, \\vec{v}, \\vec{w}]\\bigr|$.\n- O volume do tetraedro é $V = \\frac{1}{6}\\bigl|[\\vec{u}, \\vec{v}, \\vec{w}]\\bigr|$.\n- Use sempre o **módulo**, pois volume não é negativo.\n- O sinal do produto misto indica a orientação do triedro.\n- Produto misto igual a zero significa volume zero, ou seja, vetores coplanares.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Se $[\\vec{u}, \\vec{v}, \\vec{w}] = -8$, o volume do paralelepípedo determinado por $\\vec{u}, \\vec{v}, \\vec{w}$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$8$",
                                isCorrect: true,
                            },
                            {
                                text: "$-8$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{4}{3}$",
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
                            "O produto misto de três vetores vale $12$. O volume do tetraedro que eles determinam é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$12$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
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
                        ],
                    },
                    {
                        statement:
                            "O volume do paralelepípedo de arestas $\\vec{u} = (2, 0, 1)$, $\\vec{v} = (1, 2, 0)$ e $\\vec{w} = (0, 1, 3)$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$11$",
                                isCorrect: false,
                            },
                            {
                                text: "$13$",
                                isCorrect: true,
                            },
                            {
                                text: "$12$",
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
                            "Três arestas de um tetraedro, a partir de um vértice, são $\\vec{u} = (1, 0, 0)$, $\\vec{v} = (1, 4, 0)$ e $\\vec{w} = (1, 2, 6)$. Seu volume é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$24$",
                                isCorrect: false,
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
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "O volume do tetraedro de vértices $A = (1, 0, 2)$, $B = (2, 1, 1)$, $C = (0, 2, 3)$ e $D = (1, 1, 0)$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$1$",
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
                                text: "$\\frac{1}{6}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Coplanaridade e aplicações",
                blocks: [
                    {
                        type: "text",
                        value: "# Coplanaridade e aplicações\n\nChegamos à aplicação mais elegante do produto misto. Três vetores são **coplanares** quando estão contidos em um mesmo plano, pensando neles como vetores livres. Geometricamente, isso significa que o paralelepípedo que eles formariam é achatado, com volume zero.\n\nComo o volume é $\\bigl|[\\vec{u}, \\vec{v}, \\vec{w}]\\bigr|$, temos o critério:\n\n$$\\vec{u}, \\vec{v}, \\vec{w} \\text{ coplanares} \\iff [\\vec{u}, \\vec{v}, \\vec{w}] = 0$$\n\nEsse é um teste puramente algébrico para uma propriedade geométrica: basta calcular um determinante e verificar se ele é nulo.",
                    },
                    {
                        type: "text",
                        value: "## Coplanaridade de quatro pontos\n\nO critério se estende naturalmente para pontos. Quatro pontos $A, B, C, D$ do espaço são coplanares quando pertencem a um mesmo plano. Para testar, formamos três vetores a partir de um deles e verificamos o produto misto:\n\n$$A, B, C, D \\text{ coplanares} \\iff [\\vec{AB}, \\vec{AC}, \\vec{AD}] = 0$$\n\nSe o produto misto for diferente de zero, os quatro pontos **não** são coplanares e determinam um tetraedro de volume positivo. Vale notar que a escolha do ponto de partida não altera o resultado do teste.",
                    },
                    {
                        type: "quote",
                        value: "Coplanaridade é volume zero: quando o espaço colapsa em um plano, o produto misto anuncia com um simples zero.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nVerifique se os vetores $\\vec{u} = (1, 2, 3)$, $\\vec{v} = (2, 1, 1)$ e $\\vec{w} = (4, 5, 7)$ são coplanares.\n\nCalculamos o produto misto:\n\n$$\\begin{vmatrix} 1 & 2 & 3 \\\\ 2 & 1 & 1 \\\\ 4 & 5 & 7 \\end{vmatrix} = 1(1 \\cdot 7 - 1 \\cdot 5) - 2(2 \\cdot 7 - 1 \\cdot 4) + 3(2 \\cdot 5 - 1 \\cdot 4)$$\n\nDesenvolvendo: $1(7 - 5) - 2(14 - 4) + 3(10 - 4) = 1(2) - 2(10) + 3(6) = 2 - 20 + 18 = 0$.\n\nComo o produto misto é zero, os três vetores **são coplanares**. De fato, dá para verificar que $\\vec{w} = 2\\vec{u} + \\vec{v}$, ou seja, $\\vec{w}$ é combinação linear dos outros dois.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nOs pontos $A = (1, 0, 0)$, $B = (0, 1, 0)$, $C = (0, 0, 1)$ e $D = (1, 1, -1)$ são coplanares?\n\nMontamos os vetores a partir de $A$:\n\n$$\\vec{AB} = (-1, 1, 0), \\quad \\vec{AC} = (-1, 0, 1), \\quad \\vec{AD} = (0, 1, -1)$$\n\nE calculamos o produto misto:\n\n$$\\begin{vmatrix} -1 & 1 & 0 \\\\ -1 & 0 & 1 \\\\ 0 & 1 & -1 \\end{vmatrix} = -1(0 \\cdot (-1) - 1 \\cdot 1) - 1((-1)(-1) - 1 \\cdot 0) + 0$$\n\nIsso dá $-1(0 - 1) - 1(1 - 0) + 0 = -1(-1) - 1(1) = 1 - 1 = 0$.\n\nO produto misto é zero, então os quatro pontos **são coplanares**: todos pertencem ao plano $x + y + z = 1$.",
                    },
                    {
                        type: "text",
                        value: "## Aplicação: distância de um ponto a um plano\n\nO produto misto e o produto vetorial se combinam para calcular a distância de um ponto $D$ ao plano que passa por $A$, $B$ e $C$. A ideia parte de escrever o volume do tetraedro de duas formas.\n\nDe um lado, $V = \\frac{1}{6}\\bigl|[\\vec{AB}, \\vec{AC}, \\vec{AD}]\\bigr|$. De outro, $V = \\frac{1}{3} A_{\\text{base}}\\, h$, com base no triângulo $ABC$. Igualando e isolando a altura $h$, que é justamente a distância procurada:\n\n$$h = \\frac{\\bigl|[\\vec{AB}, \\vec{AC}, \\vec{AD}]\\bigr|}{\\|\\vec{AB} \\times \\vec{AC}\\|}$$\n\nO numerador é seis vezes o volume do tetraedro e o denominador é duas vezes a área da base; a razão entrega a altura diretamente.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo de aplicação\n\nCalcule a distância do ponto $D = (0, 0, 0)$ ao plano que passa por $A = (1, 0, 0)$, $B = (0, 2, 0)$ e $C = (0, 0, 3)$.\n\nUsando $A$ como referência, temos $\\vec{AB} = (-1, 2, 0)$, $\\vec{AC} = (-1, 0, 3)$ e $\\vec{AD} = (-1, 0, 0)$.\n\nDa aula sobre área, já sabemos que $\\vec{AB} \\times \\vec{AC} = (6, 3, 2)$, logo $\\|\\vec{AB} \\times \\vec{AC}\\| = 7$. O produto misto vale $[\\vec{AB}, \\vec{AC}, \\vec{AD}] = -6$, cujo módulo é $6$.\n\nAplicando a fórmula da distância:\n\n$$h = \\frac{\\bigl|[\\vec{AB}, \\vec{AC}, \\vec{AD}]\\bigr|}{\\|\\vec{AB} \\times \\vec{AC}\\|} = \\frac{6}{7}$$\n\nO mesmo valor sai da fórmula tradicional de distância de ponto a plano, o que confirma o resultado.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Três vetores são coplanares se, e somente se, $[\\vec{u}, \\vec{v}, \\vec{w}] = 0$.\n- Quatro pontos $A, B, C, D$ são coplanares se, e somente se, $[\\vec{AB}, \\vec{AC}, \\vec{AD}] = 0$.\n- Produto misto não nulo significa tetraedro de volume positivo, com pontos não coplanares.\n- A distância de um ponto a um plano sai de $h = \\dfrac{\\bigl|[\\vec{AB}, \\vec{AC}, \\vec{AD}]\\bigr|}{\\|\\vec{AB} \\times \\vec{AC}\\|}$.\n- Coplanaridade equivale à dependência linear dos três vetores.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Três vetores $\\vec{u}, \\vec{v}, \\vec{w}$ de $\\mathbb{R}^3$ são coplanares se, e somente se:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$[\\vec{u}, \\vec{v}, \\vec{w}] = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$[\\vec{u}, \\vec{v}, \\vec{w}] > 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$[\\vec{u}, \\vec{v}, \\vec{w}] = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{u} \\times \\vec{v} = \\vec{0}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Os vetores $\\vec{u} = (1, 1, 0)$, $\\vec{v} = (0, 1, 1)$ e $\\vec{w} = (1, 0, -1)$ são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "não coplanares (produto misto $= 2$)",
                                isCorrect: false,
                            },
                            {
                                text: "coplanares (produto misto $= 0$)",
                                isCorrect: true,
                            },
                            {
                                text: "não coplanares (produto misto $= -2$)",
                                isCorrect: false,
                            },
                            {
                                text: "coplanares (produto misto $= 1$)",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que valor de $k$ os vetores $\\vec{u} = (1, 2, 1)$, $\\vec{v} = (2, 1, 0)$ e $\\vec{w} = (0, 3, k)$ são coplanares?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$k = 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$k = -2$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = 6$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = 3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre os pontos $A = (0, 0, 0)$, $B = (1, 0, 0)$, $C = (0, 1, 0)$ e $D = (0, 0, 1)$, é correto afirmar que:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "são coplanares (produto misto $= 0$)",
                                isCorrect: false,
                            },
                            {
                                text: "não são coplanares (produto misto $= 1$)",
                                isCorrect: true,
                            },
                            {
                                text: "não são coplanares (produto misto $= 3$)",
                                isCorrect: false,
                            },
                            {
                                text: "são coplanares (produto misto $= 1$)",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Os pontos $A = (0, 0, 0)$, $B = (1, 2, 0)$, $C = (0, 1, 2)$ e $D = (1, 1, m)$ são coplanares. Qual é o valor de $m$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$m = -2$",
                                isCorrect: true,
                            },
                            {
                                text: "$m = 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$m = -1$",
                                isCorrect: false,
                            },
                            {
                                text: "$m = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - A reta",
        aulas: [
            {
                titulo: "Equação vetorial e paramétrica da reta",
                blocks: [
                    {
                        type: "text",
                        value: "## A reta por um ponto e uma direção\n\nNo espaço, uma reta fica completamente definida quando conhecemos **um ponto** por onde ela passa e **uma direção** que ela segue. Essa direção é dada por um vetor não nulo $\\vec{v}$, chamado de vetor diretor da reta.\n\nSeja $P_0 = (x_0, y_0, z_0)$ um ponto da reta $r$ e $\\vec{v} = (a, b, c)$ um vetor diretor. Um ponto qualquer $P = (x, y, z)$ pertence a $r$ se, e somente se, o vetor $\\vec{P_0P}$ for paralelo a $\\vec{v}$, ou seja, se existir um número real $t$ tal que $\\vec{P_0P} = t\\,\\vec{v}$.",
                    },
                    {
                        type: "text",
                        value: "## Equação vetorial\n\nComo $\\vec{P_0P} = P - P_0$, a condição $\\vec{P_0P} = t\\,\\vec{v}$ vira $P - P_0 = t\\,\\vec{v}$, isto é,\n\n$$P = P_0 + t\\,\\vec{v}, \\qquad t \\in \\mathbb{R}.$$\n\nUsando os vetores posição $\\vec{r} = (x, y, z)$ e $\\vec{r_0} = (x_0, y_0, z_0)$, obtemos a forma mais usual da **equação vetorial**:\n\n$$\\vec{r} = \\vec{r_0} + t\\,\\vec{v}.$$\n\nO número $t$ é o parâmetro. Cada valor de $t$ devolve um ponto da reta, e percorrendo todos os reais obtemos a reta inteira.",
                    },
                    {
                        type: "text",
                        value: "## Equações paramétricas\n\nEscrevendo a equação vetorial coordenada a coordenada, com $\\vec{v} = (a, b, c)$, chegamos às **equações paramétricas**:\n\n$$\\begin{cases} x = x_0 + a\\,t \\\\ y = y_0 + b\\,t \\\\ z = z_0 + c\\,t \\end{cases}, \\qquad t \\in \\mathbb{R}.$$\n\nOs coeficientes que multiplicam $t$ são exatamente as componentes do vetor diretor, e os termos independentes são as coordenadas do ponto $P_0$. Trocar o ponto pela direção é um erro clássico: o ponto entra como constante, a direção entra multiplicando $t$.",
                    },
                    {
                        type: "quote",
                        value: "Uma reta é o rastro de um ponto que caminha sempre na mesma direção: o ponto diz onde começar, o vetor diretor diz para onde seguir.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: ponto e vetor diretor\n\nVamos escrever as equações da reta $r$ que passa por $A = (1, 2, 3)$ e tem a direção de $\\vec{v} = (2, -1, 4)$.\n\nBasta usar $A$ como ponto base e as componentes de $\\vec{v}$ como coeficientes de $t$:\n\n$$\\vec{r} = (1, 2, 3) + t\\,(2, -1, 4).$$\n\nEm forma paramétrica:\n\n$$\\begin{cases} x = 1 + 2t \\\\ y = 2 - t \\\\ z = 3 + 4t \\end{cases}.$$\n\nPara $t = 1$, por exemplo, obtemos o ponto $(3, 1, 7)$, que também está em $r$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: reta por dois pontos\n\nQuando a reta é dada por dois pontos $A$ e $B$, podemos tomar como vetor diretor $\\vec{AB} = B - A$.\n\nSejam $A = (1, 0, 2)$ e $B = (3, 1, -1)$. Então\n\n$$\\vec{AB} = (3 - 1,\\; 1 - 0,\\; -1 - 2) = (2, 1, -3).$$\n\nUsando $A$ como ponto base:\n\n$$\\begin{cases} x = 1 + 2t \\\\ y = t \\\\ z = 2 - 3t \\end{cases}.$$\n\nPoderíamos usar $B$ como base ou $\\vec{BA}$ como direção: a reta seria a mesma, apenas com outra parametrização.",
                    },
                    {
                        type: "text",
                        value: "## Um ponto pertence à reta?\n\nPara decidir se um ponto pertence à reta, verificamos se existe um **único** valor de $t$ que satisfaz as três equações paramétricas ao mesmo tempo.\n\nNa reta do Exemplo 2, o ponto $Q = (5, 2, -4)$ pertence a ela? Da primeira equação, $1 + 2t = 5$ dá $t = 2$. Da segunda, $y = t = 2$, coerente. Da terceira, $z = 2 - 3(2) = -4$, também coerente. Como o mesmo $t = 2$ serve para todas, $Q$ pertence à reta.\n\n### Resumo\n- Uma reta precisa de um ponto $P_0$ e de um vetor diretor $\\vec{v} \\neq \\vec{0}$.\n- Equação vetorial: $\\vec{r} = \\vec{r_0} + t\\,\\vec{v}$.\n- Paramétricas: $x = x_0 + at$, $y = y_0 + bt$, $z = z_0 + ct$.\n- O ponto base vira constante; o vetor diretor multiplica o parâmetro $t$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A reta que passa por $P_0 = (2, -1, 5)$ com vetor diretor $\\vec{v} = (3, 4, -2)$ tem equações paramétricas:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = 3 + 2t,\\; y = 4 + t,\\; z = 2 + 5t$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 3 + 2t,\\; y = 4 - t,\\; z = -2 + 5t$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 2 + 3t,\\; y = -1 + 4t,\\; z = 5 - 2t$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 2 + 3t,\\; y = -1 - 4t,\\; z = 5 + 2t$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A reta passa por $A = (1, 3, 0)$ e $B = (4, 1, 2)$. Um vetor diretor dessa reta é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(5, 4, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, -2, -2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(4, 1, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, -2, 2)$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Considere a reta $x = 1 + 2t,\\; y = -1 + t,\\; z = 3t$. O ponto $(5, 1, 6)$:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "não pertence, pois cada equação exige um $t$ diferente",
                                isCorrect: false,
                            },
                            {
                                text: "pertence, pois $t = 2$ resolve as três equações",
                                isCorrect: true,
                            },
                            {
                                text: "não pertence, pois não é o ponto base da reta",
                                isCorrect: false,
                            },
                            {
                                text: "pertence, mas somente para $t = 3$ nas três equações",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A reta determinada por $A = (0, 2, 1)$ e $B = (2, 0, 5)$ pode ser escrita como:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x = 2t,\\; y = 2 - 2t,\\; z = 1 - 4t$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 2 + 2t,\\; y = 2 - 2t,\\; z = 5 + 4t$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 2t,\\; y = 2 - 2t,\\; z = 1 + 4t$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 2t,\\; y = 2 + 2t,\\; z = 1 + 4t$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na reta $x = 3 - t,\\; y = 2 + 2t,\\; z = -1 + t$, o ponto $(1, k, 1)$ pertence a ela. O valor de $k$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$k = 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = 6$",
                                isCorrect: true,
                            },
                            {
                                text: "$k = 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = -6$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Equações simétricas da reta",
                blocks: [
                    {
                        type: "text",
                        value: "## Isolando o parâmetro\n\nAs equações paramétricas descrevem a reta com a ajuda de um parâmetro $t$. Muitas vezes é útil eliminar esse $t$ e obter relações diretas entre $x$, $y$ e $z$. É o que fazem as **equações simétricas**.\n\nPartindo de $x = x_0 + at$, $y = y_0 + bt$ e $z = z_0 + ct$, se as três componentes do vetor diretor forem não nulas ($a, b, c \\neq 0$), podemos isolar $t$ em cada uma:\n\n$$t = \\frac{x - x_0}{a}, \\qquad t = \\frac{y - y_0}{b}, \\qquad t = \\frac{z - z_0}{c}.$$",
                    },
                    {
                        type: "text",
                        value: "## As equações simétricas\n\nComo esses três quocientes valem o mesmo $t$, eles são iguais entre si. Daí vem a forma **simétrica** da reta:\n\n$$\\frac{x - x_0}{a} = \\frac{y - y_0}{b} = \\frac{z - z_0}{c}.$$\n\nNo numerador aparece a coordenada menos o valor correspondente do ponto base; no denominador, a componente do vetor diretor. A informação é a mesma das paramétricas, apenas reorganizada: dá para ler o ponto $P_0 = (x_0, y_0, z_0)$ e o vetor $\\vec{v} = (a, b, c)$ direto da expressão.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: das paramétricas às simétricas\n\nConsidere a reta por $(1, 2, 3)$ com vetor diretor $(2, -1, 4)$. Suas paramétricas são $x = 1 + 2t$, $y = 2 - t$ e $z = 3 + 4t$.\n\nIsolando $t$ em cada equação e igualando:\n\n$$\\frac{x - 1}{2} = \\frac{y - 2}{-1} = \\frac{z - 3}{4}.$$\n\nÉ comum reescrever $\\frac{y - 2}{-1}$ como $2 - y$, mas manter o $-1$ no denominador deixa o vetor diretor visível na expressão.",
                    },
                    {
                        type: "quote",
                        value: "As equações simétricas são a mesma reta contada sem o intermediário: some o parâmetro e ficam só as coordenadas conversando entre si.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: das simétricas de volta aos pontos\n\nDada a reta $\\frac{x + 1}{3} = \\frac{y}{2} = \\frac{z - 4}{-1}$, lemos direto o ponto base $P_0 = (-1, 0, 4)$ e o vetor diretor $\\vec{v} = (3, 2, -1)$.\n\nPara gerar pontos, igualamos as frações a um valor $t$. Com $t = 1$:\n\n$$x = -1 + 3(1) = 2, \\qquad y = 0 + 2(1) = 2, \\qquad z = 4 - 1(1) = 3.$$\n\nLogo $(2, 2, 3)$ pertence à reta. Repetindo com outros valores de $t$, obtemos quantos pontos quisermos.",
                    },
                    {
                        type: "text",
                        value: "## Quando uma componente é zero\n\nSe alguma componente do vetor diretor é nula, não dá para dividir por ela, e a forma simétrica completa não vale. Nesse caso, isolamos $t$ apenas nas componentes não nulas e escrevemos a coordenada parada como uma equação à parte.\n\nPor exemplo, para a reta por $(1, 5, 0)$ com vetor diretor $(3, 0, 2)$, a componente $y$ é constante. A forma simétrica fica\n\n$$\\frac{x - 1}{3} = \\frac{z}{2}, \\qquad y = 5.$$\n\nO trecho $y = 5$ avisa que a reta vive inteira no plano $y = 5$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Forma simétrica (com $a, b, c \\neq 0$): $\\frac{x - x_0}{a} = \\frac{y - y_0}{b} = \\frac{z - z_0}{c}$.\n- Os numeradores trazem o ponto base; os denominadores trazem o vetor diretor.\n- Passar de paramétrica para simétrica é isolar e igualar $t$; o caminho de volta é igualar as frações a $t$.\n- Se uma componente do diretor é zero, essa variável vira uma equação separada (como $y = y_0$) e as demais formam a igualdade de frações.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "As equações simétricas da reta $x = 4 + t,\\; y = -1 + 3t,\\; z = 2 - 2t$ são:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{x - 4}{1} = \\frac{y - 1}{3} = \\frac{z - 2}{-2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{x + 4}{1} = \\frac{y + 1}{3} = \\frac{z + 2}{-2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{x - 4}{1} = \\frac{y + 1}{3} = \\frac{z - 2}{-2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{x - 1}{4} = \\frac{y - 3}{-1} = \\frac{z + 2}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na reta $\\frac{x - 2}{5} = \\frac{y + 3}{-1} = \\frac{z}{4}$, um ponto e um vetor diretor são:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$P = (5, -1, 4)$ e $\\vec{v} = (2, -3, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$P = (-2, 3, 0)$ e $\\vec{v} = (5, 1, 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$P = (2, 3, 0)$ e $\\vec{v} = (5, -1, 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$P = (2, -3, 0)$ e $\\vec{v} = (5, -1, 4)$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre o ponto $(7, 2, 0)$ e a reta $\\frac{x - 1}{2} = \\frac{y + 1}{1} = \\frac{z - 3}{-1}$, é correto dizer que:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "o ponto não pertence, pois nenhuma fração se anula",
                                isCorrect: false,
                            },
                            {
                                text: "o ponto pertence à reta, pois as frações valem $3$",
                                isCorrect: true,
                            },
                            {
                                text: "o ponto pertence à reta, pois as frações valem $1$",
                                isCorrect: false,
                            },
                            {
                                text: "o ponto não pertence, pois as frações dão valores diferentes",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A reta que passa por $(2, 4, -1)$ com vetor diretor $(0, 3, 5)$ tem forma simétrica:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{x - 2}{0} = \\frac{y - 4}{3} = \\frac{z + 1}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{y - 4}{3} = \\frac{z + 1}{5},\\; x = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{y - 4}{3} = \\frac{z + 1}{5},\\; x = 2$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{x - 4}{3} = \\frac{z + 1}{5},\\; y = 2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A reta $\\frac{x - 1}{2} = \\frac{y + 2}{-1} = \\frac{z}{3}$ corta o plano $xy$ (onde $z = 0$) no ponto:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$(3, -3, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, -1, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 2, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, -2, 0)$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "A reta no plano",
                blocks: [
                    {
                        type: "text",
                        value: "## Retas no plano\n\nTudo o que vimos para o espaço vale, com uma coordenada a menos, para retas no plano $\\mathbb{R}^2$. Uma reta ainda fica definida por um ponto $P_0 = (x_0, y_0)$ e um vetor diretor $\\vec{v} = (a, b) \\neq \\vec{0}$, com equação vetorial\n\n$$\\vec{r} = \\vec{r_0} + t\\,\\vec{v}.$$\n\nA novidade do plano é que a reta ganha também uma descrição implícita muito prática, a equação geral, ligada a um vetor perpendicular a ela.",
                    },
                    {
                        type: "text",
                        value: "## Formas paramétrica e simétrica\n\nCoordenada a coordenada, com $\\vec{v} = (a, b)$:\n\n$$\\begin{cases} x = x_0 + a\\,t \\\\ y = y_0 + b\\,t \\end{cases}.$$\n\nSe $a$ e $b$ são não nulos, isolamos $t$ e obtemos a forma simétrica no plano:\n\n$$\\frac{x - x_0}{a} = \\frac{y - y_0}{b}.$$\n\nDela sai a inclinação da reta: o coeficiente angular é $m = \\frac{b}{a}$, a razão entre a variação vertical e a horizontal do vetor diretor.",
                    },
                    {
                        type: "text",
                        value: "## Equação geral e vetor normal\n\nMultiplicando em cruz a forma simétrica, chegamos a uma equação do tipo\n\n$$A x + B y + C = 0,$$\n\na **equação geral** da reta. Aqui aparece um personagem importante: o vetor $\\vec{n} = (A, B)$ é **perpendicular** à reta, por isso chamado de vetor normal. Enquanto o diretor $\\vec{v} = (a, b)$ aponta ao longo da reta, o normal aponta para fora dela, e vale sempre $\\vec{n} \\cdot \\vec{v} = 0$.\n\nA partir de um vetor diretor $\\vec{v} = (a, b)$, um vetor normal é $\\vec{n} = (-b, a)$, pois $\\vec{v} \\cdot \\vec{n} = a(-b) + b(a) = 0$.",
                    },
                    {
                        type: "quote",
                        value: "No plano, toda reta carrega duas setas: uma que corre por dentro dela e outra que a atravessa em ângulo reto. Conhecer uma é conhecer a outra.",
                    },
                    {
                        type: "text",
                        value: "## Forma reduzida\n\nQuando a reta não é vertical (isto é, $B \\neq 0$), isolamos $y$ na equação geral e obtemos a **forma reduzida**:\n\n$$y = m x + n,$$\n\nem que $m$ é o coeficiente angular e $n$ é o coeficiente linear, a ordenada do ponto onde a reta cruza o eixo $y$. A ligação com a equação geral é $m = -\\frac{A}{B}$ e $n = -\\frac{C}{B}$.\n\nUma reta vertical, do tipo $x = k$, não tem forma reduzida: seu coeficiente angular não existe, pois seria uma divisão por zero.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: passando por todas as formas\n\nSeja a reta por $P_0 = (2, 1)$ com vetor diretor $\\vec{v} = (3, 2)$.\n\nParamétrica: $x = 2 + 3t$, $y = 1 + 2t$.\n\nSimétrica: $\\frac{x - 2}{3} = \\frac{y - 1}{2}$.\n\nGeral: multiplicando em cruz, $2(x - 2) = 3(y - 1)$, ou seja, $2x - 3y - 1 = 0$.\n\nReduzida: isolando $y$, $y = \\frac{2}{3}x - \\frac{1}{3}$, logo $m = \\frac{2}{3}$.\n\nDa geral lemos o vetor normal $\\vec{n} = (2, -3)$. Conferindo, $\\vec{n} \\cdot \\vec{v} = (2)(3) + (-3)(2) = 0$, como esperado.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- No plano, a reta tem as formas vetorial, paramétrica, simétrica, geral e reduzida.\n- Geral: $A x + B y + C = 0$, com vetor normal $\\vec{n} = (A, B) \\perp$ reta.\n- Diretor $(a, b)$ e normal $(-b, a)$ são sempre perpendiculares: $\\vec{n} \\cdot \\vec{v} = 0$.\n- Reduzida: $y = m x + n$, com $m = \\frac{b}{a} = -\\frac{A}{B}$; retas verticais não têm forma reduzida.",
                    },
                ],
                questions: [
                    {
                        statement: "Um vetor normal à reta $3x - 5y + 7 = 0$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\vec{n} = (-5, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{n} = (3, -5)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\vec{n} = (5, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{n} = (3, 5)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O coeficiente angular da reta $3x - y - 2 = 0$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$m = -\\frac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$m = -3$",
                                isCorrect: false,
                            },
                            {
                                text: "$m = \\frac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$m = 3$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "A equação geral da reta $x = 1 + 2t,\\; y = 3 - t$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x - 2y + 5 = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x + 2y + 7 = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x + 2y - 7 = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$2x - y + 1 = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O ponto $(4, -1)$ e a reta $3x + 2y - 10 = 0$: o ponto pertence à reta?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "não, pois a substituição não dá zero",
                                isCorrect: false,
                            },
                            {
                                text: "não, pois o ponto não é a origem",
                                isCorrect: false,
                            },
                            {
                                text: "sim, pois $12 - 2 - 10 = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "sim, pois $12 + 2 - 10 = 4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A reta que passa por $(1, 2)$ e tem $\\vec{n} = (3, -1)$ como vetor normal tem equação geral:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$x + 3y - 7 = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$3x - y - 5 = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$3x - y + 1 = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$3x - y - 1 = 0$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Posições relativas entre retas",
                blocks: [
                    {
                        type: "text",
                        value: "## Como duas retas se relacionam\n\nDuas retas no espaço podem se encaixar de quatro maneiras. Elas podem ser **coincidentes** (a mesma reta), **paralelas distintas** (nunca se tocam, mas apontam na mesma direção), **concorrentes** (cruzam-se em um único ponto) ou **reversas** (não se cruzam nem são paralelas, por estarem em planos diferentes).\n\nA classificação responde a duas perguntas: os vetores diretores são paralelos? As retas estão em um mesmo plano, ou seja, são coplanares?",
                    },
                    {
                        type: "text",
                        value: "## Direções paralelas: coincidentes ou paralelas distintas\n\nSejam $r_1$ com diretor $\\vec{v_1}$ e $r_2$ com diretor $\\vec{v_2}$. Se $\\vec{v_1} \\parallel \\vec{v_2}$, isto é, se um é múltiplo do outro, as retas têm a mesma direção.\n\nPara separar os dois casos, tomamos um ponto $P_1$ de $r_1$ e testamos se ele pertence a $r_2$:\n\n- se $P_1 \\in r_2$, as retas são **coincidentes** (têm todos os pontos em comum);\n- se $P_1 \\notin r_2$, são **paralelas distintas** (não têm ponto em comum).",
                    },
                    {
                        type: "text",
                        value: "## Direções não paralelas: concorrentes ou reversas\n\nQuando $\\vec{v_1}$ e $\\vec{v_2}$ não são paralelos, resta decidir se as retas estão em um mesmo plano. O teste usa o **produto misto** entre os diretores e o vetor $\\vec{P_1P_2}$, que liga um ponto de cada reta:\n\n$$\\det \\begin{pmatrix} \\vec{v_1} \\\\ \\vec{v_2} \\\\ \\vec{P_1P_2} \\end{pmatrix}.$$\n\n- Se o determinante é **zero**, os vetores são coplanares e as retas se cruzam: são **concorrentes**.\n- Se o determinante é **diferente de zero**, as retas estão em planos distintos: são **reversas**.\n\nRetas reversas só existem no espaço; no plano, duas retas nunca são reversas.",
                    },
                    {
                        type: "quote",
                        value: "Retas reversas são como duas estradas em viadutos diferentes: cruzam a mesma região, seguem rumos distintos e mesmo assim jamais se encontram.",
                    },
                    {
                        type: "text",
                        value: '## Quadro-resumo\n\nA tabela reúne os quatro casos. Dizemos que as retas são coplanares quando cabem em um mesmo plano.\n\n| Posição | Direções | Coplanares? | Pontos em comum |\n|---|---|---|---|\n| Coincidentes | paralelas | sim | infinitos |\n| Paralelas distintas | paralelas | sim | nenhum |\n| Concorrentes | não paralelas | sim | exatamente um |\n| Reversas | não paralelas | não | nenhum |\n\nNote que "nenhum ponto em comum" aparece em dois casos bem diferentes: paralelas distintas e reversas. O que separa um do outro é a direção.',
                    },
                    {
                        type: "text",
                        value: "## Exemplo: um caso de reversas\n\nSejam $r_1$ passando por $P_1 = (0, 0, 0)$ com $\\vec{v_1} = (1, 1, 0)$ e $r_2$ passando por $P_2 = (1, 0, 0)$ com $\\vec{v_2} = (0, 1, 1)$.\n\nOs diretores não são múltiplos um do outro, então as retas não são paralelas. Com $\\vec{P_1P_2} = (1, 0, 0)$, o produto misto é\n\n$$\\det \\begin{pmatrix} 1 & 1 & 0 \\\\ 0 & 1 & 1 \\\\ 1 & 0 & 0 \\end{pmatrix} = 1(0 - 0) - 1(0 - 1) + 0 = 1.$$\n\nComo o determinante é $1 \\neq 0$, as retas são **reversas**.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: paralelas distintas\n\nAgora sejam $r_1: (x, y, z) = (1, 0, 2) + t(2, 1, 3)$ e $r_2: (x, y, z) = (0, 1, 0) + s(4, 2, 6)$.\n\nComo $\\vec{v_2} = (4, 2, 6) = 2(2, 1, 3) = 2\\,\\vec{v_1}$, os diretores são paralelos. Falta ver se as retas coincidem. O ponto $P_1 = (1, 0, 2)$ pertence a $r_2$? Precisaríamos de $0 + 4s = 1$, ou seja, $s = \\frac{1}{4}$; mas aí $y = 1 + 2 \\cdot \\frac{1}{4} = \\frac{3}{2} \\neq 0$. Como $P_1 \\notin r_2$, as retas são **paralelas distintas**.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "As retas de vetores diretores $\\vec{v_1} = (2, -4, 6)$ e $\\vec{v_2} = (1, -2, 3)$ têm direções:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "paralelas, pois $\\vec{v_1} = 2\\,\\vec{v_2}$",
                                isCorrect: true,
                            },
                            {
                                text: "não paralelas, pois os vetores diferem",
                                isCorrect: false,
                            },
                            {
                                text: "perpendiculares, pois $\\vec{v_1} \\cdot \\vec{v_2} = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "paralelas, pois $\\vec{v_1} \\cdot \\vec{v_2} = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Duas retas no espaço não têm ponto em comum e seus vetores diretores não são paralelos. Elas são:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "reversas",
                                isCorrect: true,
                            },
                            {
                                text: "coincidentes",
                                isCorrect: false,
                            },
                            {
                                text: "concorrentes",
                                isCorrect: false,
                            },
                            {
                                text: "paralelas distintas",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $r_1: (1, 0, 0) + t(1, 1, 0)$ e $r_2: (0, 0, 0) + s(1, -1, 0)$. O produto misto com $\\vec{P_1P_2}$ é zero e as direções não são paralelas. As retas são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "coincidentes",
                                isCorrect: false,
                            },
                            {
                                text: "concorrentes",
                                isCorrect: true,
                            },
                            {
                                text: "reversas",
                                isCorrect: false,
                            },
                            {
                                text: "paralelas distintas",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "As retas $r_1: (1, 2, 3) + t(1, 0, 2)$ e $r_2: (2, 2, 5) + s(2, 0, 4)$ têm diretores paralelos, e $(1, 2, 3) \\in r_2$. Logo são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "reversas",
                                isCorrect: false,
                            },
                            {
                                text: "coincidentes",
                                isCorrect: true,
                            },
                            {
                                text: "concorrentes",
                                isCorrect: false,
                            },
                            {
                                text: "paralelas distintas",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Classifique as retas $r_1: (0, 0, 0) + t(1, 2, 1)$ e $r_2: (1, 1, 0) + s(2, 1, 0)$:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "coincidentes",
                                isCorrect: false,
                            },
                            {
                                text: "concorrentes",
                                isCorrect: false,
                            },
                            {
                                text: "paralelas distintas",
                                isCorrect: false,
                            },
                            {
                                text: "reversas",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Interseção de retas",
                blocks: [
                    {
                        type: "text",
                        value: "## Encontrar o ponto de encontro\n\nQuando duas retas são concorrentes, elas se cruzam em um único ponto. Achar esse ponto é resolver um sistema: procuramos valores dos parâmetros que produzam as **mesmas coordenadas** nas duas retas.\n\nComo cada reta tem o seu próprio parâmetro, usamos letras diferentes, digamos $t$ para $r_1$ e $s$ para $r_2$, e impomos que os pontos coincidam.",
                    },
                    {
                        type: "text",
                        value: "## Interseção no plano\n\nNo plano, o caminho mais rápido costuma ser usar as equações gerais e resolver o sistema linear. Dadas\n\n$$r_1: A_1 x + B_1 y + C_1 = 0 \\qquad \\text{e} \\qquad r_2: A_2 x + B_2 y + C_2 = 0,$$\n\nresolvemos as duas equações ao mesmo tempo. Há três desfechos:\n\n- **uma solução**: as retas são concorrentes, e a solução é o ponto de interseção;\n- **nenhuma solução**: são paralelas distintas;\n- **infinitas soluções**: são coincidentes.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo no plano\n\nVamos achar a interseção de $r_1: 2x - y - 1 = 0$ e $r_2: x + y - 5 = 0$.\n\nSomando as duas equações, o $y$ some: $(2x - y) + (x + y) = 1 + 5$, ou seja, $3x = 6$, logo $x = 2$. Voltando em $r_2$, temos $2 + y - 5 = 0$, dando $y = 3$.\n\nO ponto de interseção é $(2, 3)$. Conferindo em $r_1$: $2(2) - 3 - 1 = 0$. Confere.",
                    },
                    {
                        type: "quote",
                        value: "Resolver a interseção de duas retas é perguntar em que instante dois caminhantes, cada um no seu ritmo, pisam exatamente no mesmo lugar.",
                    },
                    {
                        type: "text",
                        value: "## Interseção no espaço\n\nNo espaço, igualamos as paramétricas das duas retas coordenada a coordenada:\n\n$$\\begin{cases} x_1 + a_1 t = x_2 + a_2 s \\\\ y_1 + b_1 t = y_2 + b_2 s \\\\ z_1 + c_1 t = z_2 + c_2 s \\end{cases}.$$\n\nSão **três equações e apenas duas incógnitas** ($t$ e $s$). Resolvemos duas delas, achamos $t$ e $s$ e então **testamos na terceira**. Se a terceira também for satisfeita, o sistema é compatível e existe interseção; se falhar, as retas não se cruzam (são paralelas distintas ou reversas).",
                    },
                    {
                        type: "text",
                        value: "## Exemplo no espaço\n\nSejam $r_1: (x, y, z) = (0, 0, 0) + t(1, 1, 1)$ e $r_2: (x, y, z) = (2, 0, 1) + s(-1, 1, 0)$.\n\nIgualando coordenada a coordenada:\n\n$$\\begin{cases} t = 2 - s \\\\ t = s \\\\ t = 1 \\end{cases}.$$\n\nDa terceira equação, $t = 1$. Da segunda, $s = t = 1$. Testamos na primeira: $2 - s = 2 - 1 = 1 = t$. Confere. Substituindo $t = 1$ em $r_1$, o ponto de interseção é $(1, 1, 1)$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Interseção significa mesmos pontos: iguale as coordenadas usando um parâmetro para cada reta.\n- No plano, resolva o sistema das equações gerais; uma solução única é o ponto procurado.\n- No espaço, o sistema tem três equações e duas incógnitas: resolva duas e confirme na terceira.\n- Sistema compatível indica que as retas se cruzam; incompatível indica que não há interseção.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A interseção das retas $x + y - 4 = 0$ e $x - y - 2 = 0$ é o ponto:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(3, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(3, -1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao resolver o sistema de duas retas do plano, obtêm-se infinitas soluções. As retas são:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "concorrentes",
                                isCorrect: false,
                            },
                            {
                                text: "coincidentes",
                                isCorrect: true,
                            },
                            {
                                text: "reversas",
                                isCorrect: false,
                            },
                            {
                                text: "paralelas distintas",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "As retas $r_1: y = 2x - 1$ e $r_2: y = -x + 5$ se cruzam no ponto:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(1, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 5)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 3)$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "As retas $r_1: (1, 0, 0) + t(1, 1, 0)$ e $r_2: (0, 1, 0) + s(1, 0, 0)$ se intersectam em:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(2, 1, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 1, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(1, 2, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 1, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "As retas $r_1: (1, 1, 0) + t(2, 1, 1)$ e $r_2: (0, 0, 1) + s(3, 2, 0)$ se cruzam no ponto:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$(1, 1, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 2, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(2, 1, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 2, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - O plano",
        aulas: [
            {
                titulo: "Equação vetorial e paramétrica do plano",
                blocks: [
                    {
                        type: "text",
                        value: "## O que determina um plano\n\nUm ponto sozinho não define um plano, e um único vetor apenas aponta uma direção, o que geraria uma reta. Para fixar um plano no espaço precisamos de um **ponto de apoio** $A$ e de **duas direções independentes**, dadas por dois vetores $\\vec{u}$ e $\\vec{v}$ que não sejam paralelos entre si.\n\nA exigência de que $\\vec{u}$ e $\\vec{v}$ sejam **linearmente independentes**, ou seja, não paralelos, é o que garante que eles abram uma superfície de duas dimensões, e não apenas uma reta. Chamamos $\\vec{u}$ e $\\vec{v}$ de **vetores diretores** do plano.",
                    },
                    {
                        type: "text",
                        value: "## A equação vetorial\n\nQualquer ponto $P = (x, y, z)$ do plano pode ser alcançado partindo de $A$, caminhando uma quantidade $\\lambda$ na direção de $\\vec{u}$ e uma quantidade $\\mu$ na direção de $\\vec{v}$. Essa é a **equação vetorial do plano**:\n$$P = A + \\lambda \\vec{u} + \\mu \\vec{v}, \\qquad \\lambda, \\mu \\in \\mathbb{R}$$\n\nEm coordenadas, com $A = (x_0, y_0, z_0)$, $\\vec{u} = (u_1, u_2, u_3)$ e $\\vec{v} = (v_1, v_2, v_3)$:\n$$(x, y, z) = (x_0, y_0, z_0) + \\lambda (u_1, u_2, u_3) + \\mu (v_1, v_2, v_3)$$\n\nOs escalares $\\lambda$ e $\\mu$ são os **parâmetros**: cada par de valores devolve um ponto do plano, e todo ponto do plano corresponde a algum par.",
                    },
                    {
                        type: "text",
                        value: "## As equações paramétricas\n\nSeparando cada coordenada da equação vetorial, obtemos as **equações paramétricas do plano**:\n$$\\begin{cases} x = x_0 + \\lambda u_1 + \\mu v_1 \\\\ y = y_0 + \\lambda u_2 + \\mu v_2 \\\\ z = z_0 + \\lambda u_3 + \\mu v_3 \\end{cases}$$\n\nO fato de haver **dois** parâmetros livres é a assinatura de um objeto de dimensão dois. Uma reta, por comparação, tem apenas um parâmetro, e um ponto não tem nenhum.",
                    },
                    {
                        type: "text",
                        value: "## Plano a partir de três pontos\n\nMuitas vezes o plano é dado por **três pontos não colineares** $A$, $B$ e $C$. Nesse caso construímos os vetores diretores a partir das diferenças:\n$$\\vec{u} = \\vec{AB} = B - A, \\qquad \\vec{v} = \\vec{AC} = C - A$$\n\nComo os três pontos não estão sobre uma mesma reta, $\\vec{AB}$ e $\\vec{AC}$ não são paralelos e servem como vetores diretores. Basta então usar $A$ como ponto de apoio.",
                    },
                    {
                        type: "quote",
                        value: "Um plano fica determinado assim que fixamos um ponto de apoio e duas direções independentes para deslizar sobre ele.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: ponto e dois vetores\n\nDeterminar a equação vetorial e as paramétricas do plano que passa por $A = (1, 2, 1)$ com vetores diretores $\\vec{u} = (1, 0, 1)$ e $\\vec{v} = (0, 1, 2)$.\n\nComo $\\vec{u}$ e $\\vec{v}$ não são paralelos, a equação vetorial é imediata:\n$$(x, y, z) = (1, 2, 1) + \\lambda (1, 0, 1) + \\mu (0, 1, 2)$$\n\nSeparando as coordenadas, chegamos às equações paramétricas:\n$$\\begin{cases} x = 1 + \\lambda \\\\ y = 2 + \\mu \\\\ z = 1 + \\lambda + 2\\mu \\end{cases}$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: três pontos\n\nEncontrar as equações paramétricas do plano que passa por $A = (1, 1, 1)$, $B = (2, 3, 1)$ e $C = (0, 1, 2)$.\n\nPrimeiro os vetores diretores:\n$$\\vec{AB} = B - A = (1, 2, 0), \\qquad \\vec{AC} = C - A = (-1, 0, 1)$$\n\nEles não são paralelos, então o plano existe e fica:\n$$\\begin{cases} x = 1 + \\lambda - \\mu \\\\ y = 1 + 2\\lambda \\\\ z = 1 + \\mu \\end{cases}$$\n\nConferindo: com $\\lambda = 1$ e $\\mu = 0$ obtemos $(2, 3, 1) = B$, e com $\\lambda = 0$ e $\\mu = 1$ obtemos $(0, 1, 2) = C$. Os dados batem.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Um plano é descrito por um **ponto** e **dois vetores diretores não paralelos**.\n- **Equação vetorial:** $P = A + \\lambda \\vec{u} + \\mu \\vec{v}$, com dois parâmetros $\\lambda$ e $\\mu$.\n- **Equações paramétricas:** distribuem essa soma coordenada a coordenada.\n- A presença de dois parâmetros reflete a dimensão dois do plano.\n- Quando o plano vem de três pontos não colineares, os vetores diretores saem de $\\vec{AB}$ e $\\vec{AC}$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Para determinar um plano pela equação vetorial, além de um ponto de apoio, são necessários:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "dois vetores diretores não paralelos",
                                isCorrect: true,
                            },
                            {
                                text: "dois vetores diretores paralelos entre si",
                                isCorrect: false,
                            },
                            {
                                text: "um único vetor diretor",
                                isCorrect: false,
                            },
                            {
                                text: "três vetores linearmente independentes",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O plano passa por $A = (2, 0, 1)$ e tem vetores diretores $\\vec{u} = (1, 1, 0)$ e $\\vec{v} = (0, 2, 1)$. Suas equações paramétricas são:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = 2 + \\lambda,\\ y = \\lambda + 2\\mu,\\ z = 1 + \\mu$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 2 + \\lambda,\\ y = 2\\lambda + \\mu,\\ z = 1 + \\mu$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 1 + \\lambda,\\ y = \\lambda + 2\\mu,\\ z = 2 + \\mu$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = 2 + 2\\lambda,\\ y = \\lambda + \\mu,\\ z = 1 + \\mu$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Dados $A = (1, 0, 2)$, $B = (3, 1, 2)$ e $C = (1, 2, 3)$, um par válido de vetores diretores do plano que passa por eles é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(2, 1, 0)$ e $(0, 2, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(3, 1, 2)$ e $(1, 2, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 1, 0)$ e $(2, 2, 5)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(4, 3, 4)$ e $(2, 2, 1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um plano tem equações paramétricas $x = 1 + \\lambda,\\ y = \\mu,\\ z = 2 + \\lambda - \\mu$. Qual dos pontos abaixo pertence a esse plano?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(1, 0, 2)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(2, 1, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, 1, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 2, 1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual par de vetores NÃO pode servir como vetores diretores de um mesmo plano?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$(1, 2, 3)$ e $(2, 4, 6)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(1, 0, 0)$ e $(0, 1, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 1, 0)$ e $(0, 1, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 1, 3)$ e $(1, 2, 1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Equação geral do plano e o vetor normal",
                blocks: [
                    {
                        type: "text",
                        value: "## O vetor normal\n\nA forma paramétrica é ótima para gerar pontos do plano, mas pouco prática para **testar** se um ponto pertence a ele. Para isso existe uma descrição mais compacta, construída em torno de um vetor especial: o **vetor normal**.\n\nO vetor normal $\\vec{n} = (a, b, c)$ é qualquer vetor **perpendicular ao plano**, isto é, perpendicular a todo vetor contido nele. Enquanto os diretores $\\vec{u}$ e $\\vec{v}$ vivem dentro do plano, o normal aponta para fora dele.",
                    },
                    {
                        type: "text",
                        value: "## A equação geral\n\nSeja $A = (x_0, y_0, z_0)$ um ponto do plano e $\\vec{n} = (a, b, c)$ seu normal. Um ponto $P = (x, y, z)$ pertence ao plano exatamente quando $\\vec{AP}$ é perpendicular a $\\vec{n}$, ou seja, quando o produto escalar se anula:\n$$\\vec{n} \\cdot \\vec{AP} = 0 \\ \\Longrightarrow\\ a(x - x_0) + b(y - y_0) + c(z - z_0) = 0$$\n\nDistribuindo e reunindo o termo constante, chegamos à **equação geral do plano**:\n$$ax + by + cz + d = 0, \\qquad d = -(a x_0 + b y_0 + c z_0)$$",
                    },
                    {
                        type: "text",
                        value: "## Ler o normal na equação\n\nO ponto central desta aula: na equação geral $ax + by + cz + d = 0$, os **coeficientes de $x$, $y$ e $z$ são exatamente as componentes do vetor normal**.\n$$\\vec{n} = (a, b, c)$$\n\nAssim, olhar a equação de um plano já revela sua direção perpendicular. Por exemplo, o plano $2x - y + 3z - 5 = 0$ tem normal $\\vec{n} = (2, -1, 3)$. O termo independente $d$ não entra no normal: ele apenas desloca o plano paralelamente a si mesmo.",
                    },
                    {
                        type: "quote",
                        value: "O vetor normal resume o plano inteiro em uma única direção: a que aponta para fora dele.",
                    },
                    {
                        type: "text",
                        value: "## Do diretor ao normal\n\nE quando temos apenas os vetores diretores $\\vec{u}$ e $\\vec{v}$? O **produto vetorial** fornece um vetor perpendicular aos dois de uma vez:\n$$\\vec{n} = \\vec{u} \\times \\vec{v} = \\begin{vmatrix} \\vec{i} & \\vec{j} & \\vec{k} \\\\ u_1 & u_2 & u_3 \\\\ v_1 & v_2 & v_3 \\end{vmatrix}$$\n\nEsse é o elo entre as duas formas: o produto vetorial dos diretores devolve o normal, e o normal mais um ponto devolvem a equação geral.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: ponto e normal\n\nEscrever a equação geral do plano que passa por $A = (1, 2, 3)$ e tem normal $\\vec{n} = (2, -1, 4)$.\n\nPartimos de $a(x - x_0) + b(y - y_0) + c(z - z_0) = 0$:\n$$2(x - 1) - 1(y - 2) + 4(z - 3) = 0$$\n$$2x - 2 - y + 2 + 4z - 12 = 0$$\n$$2x - y + 4z - 12 = 0$$\n\nO termo independente confere: $d = -(2\\cdot 1 - 1\\cdot 2 + 4\\cdot 3) = -(2 - 2 + 12) = -12$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: três pontos via produto vetorial\n\nDeterminar a equação geral do plano por $A = (1, 0, 0)$, $B = (0, 1, 0)$ e $C = (0, 0, 1)$.\n\nVetores diretores:\n$$\\vec{AB} = (-1, 1, 0), \\qquad \\vec{AC} = (-1, 0, 1)$$\n\nVetor normal pelo produto vetorial:\n$$\\vec{n} = \\vec{AB} \\times \\vec{AC} = (1\\cdot 1 - 0\\cdot 0,\\ \\ 0\\cdot(-1) - (-1)\\cdot 1,\\ \\ (-1)\\cdot 0 - 1\\cdot(-1)) = (1, 1, 1)$$\n\nUsando $A = (1, 0, 0)$: $\\ 1(x - 1) + 1(y) + 1(z) = 0$, ou seja\n$$x + y + z - 1 = 0$$\n\nOs três pontos satisfazem essa equação, como se verifica substituindo cada um.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- **Equação geral:** $ax + by + cz + d = 0$, com **vetor normal** $\\vec{n} = (a, b, c)$ lido direto dos coeficientes.\n- Com um ponto $A$ e o normal $\\vec{n}$: use $a(x - x_0) + b(y - y_0) + c(z - z_0) = 0$, com $d = -(a x_0 + b y_0 + c z_0)$.\n- O termo $d$ não faz parte do normal; ele apenas posiciona o plano.\n- Se só há vetores diretores, o normal vem do **produto vetorial** $\\vec{u} \\times \\vec{v}$.",
                    },
                ],
                questions: [
                    {
                        statement: "O vetor normal do plano $2x - y + 3z = 5$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\vec{n} = (2, -1, 3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\vec{n} = (2, 1, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{n} = (2, -1, 5)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{n} = (-1, 2, 3)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A equação geral do plano que passa pela origem e tem vetor normal $\\vec{n} = (1, 2, -1)$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x + 2y - z = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$x + 2y - z + 1 = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x + 2y + z = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$2x + y - z = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A equação geral do plano que passa por $A = (1, 1, 2)$ e tem normal $\\vec{n} = (3, 0, -1)$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$3x - z - 1 = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$3x - z + 1 = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$3x + z - 1 = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$3x - y - z - 1 = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um plano contém os vetores $\\vec{u} = (1, 0, 0)$ e $\\vec{v} = (0, 1, 0)$. Um vetor normal a esse plano é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(0, 0, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(1, 1, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1, 0, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, 1, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A equação geral do plano que passa por $A = (1, 0, 1)$, $B = (2, 1, 1)$ e $C = (0, 1, 2)$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$x - y + 2z - 3 = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$x - y + 2z + 3 = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x + y + 2z - 3 = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$x - y + 2z - 1 = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Posições relativas entre reta e plano",
                blocks: [
                    {
                        type: "text",
                        value: "## Os três casos possíveis\n\nConsidere uma reta $r$ com vetor diretor $\\vec{v}$ e um plano $\\pi: ax + by + cz + d = 0$, de vetor normal $\\vec{n} = (a, b, c)$. Como eles se posicionam um em relação ao outro? Há exatamente três possibilidades:\n\n1. a reta **corta** o plano em um único ponto (concorrentes);\n2. a reta é **paralela** ao plano e não o toca;\n3. a reta está **contida** no plano.",
                    },
                    {
                        type: "text",
                        value: "## O critério do produto escalar\n\nA chave para distinguir os casos é comparar a direção da reta, $\\vec{v}$, com o normal do plano, $\\vec{n}$, pelo **produto escalar**.\n\nSe $\\vec{v} \\cdot \\vec{n} \\neq 0$, a direção da reta tem componente perpendicular ao plano, então a reta o **atravessa** em um ponto. Se $\\vec{v} \\cdot \\vec{n} = 0$, a direção é perpendicular ao normal, logo $\\vec{v}$ é paralelo ao plano, e a reta será paralela a ele ou estará contida nele. Para decidir entre esses dois subcasos, basta testar um ponto da reta na equação do plano.",
                    },
                    {
                        type: "text",
                        value: "## Tabela dos casos\n\n| Condição | Posição relativa |\n|---|---|\n| $\\vec{v} \\cdot \\vec{n} \\neq 0$ | reta e plano concorrentes (um ponto) |\n| $\\vec{v} \\cdot \\vec{n} = 0$ e $A \\notin \\pi$ | reta paralela ao plano |\n| $\\vec{v} \\cdot \\vec{n} = 0$ e $A \\in \\pi$ | reta contida no plano |\n\nAqui $A$ é um ponto qualquer da reta.",
                    },
                    {
                        type: "text",
                        value: "## O caso perpendicular\n\nDentro do caso concorrente há um subcaso importante: a reta é **perpendicular** ao plano quando sua direção $\\vec{v}$ é **paralela** ao normal $\\vec{n}$, ou seja, $\\vec{v} = k\\,\\vec{n}$ para algum escalar $k$.\n\nNote o contraste, que é fonte de confusão: $\\vec{v} \\perp \\vec{n}$ dá reta **paralela** ao plano, enquanto $\\vec{v} \\parallel \\vec{n}$ dá reta **perpendicular** ao plano. Trocar essas duas condições é o erro mais comum do assunto.",
                    },
                    {
                        type: "quote",
                        value: "Comparar a direção da reta com a normal do plano responde, sozinha, quase toda pergunta sobre a posição entre os dois.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: reta concorrente\n\nClassificar a reta $r: (x, y, z) = (1, 0, 2) + t(1, 2, 1)$ em relação ao plano $\\pi: 2x - y + 3z - 1 = 0$.\n\nTemos $\\vec{v} = (1, 2, 1)$ e $\\vec{n} = (2, -1, 3)$. O produto escalar:\n$$\\vec{v} \\cdot \\vec{n} = 1\\cdot 2 + 2\\cdot(-1) + 1\\cdot 3 = 2 - 2 + 3 = 3 \\neq 0$$\n\nComo o produto é diferente de zero, a reta corta o plano em **um único ponto**: são concorrentes.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: reta paralela\n\nClassificar a reta $r: (x, y, z) = (0, 1, 0) + t(1, 1, 1)$ em relação ao plano $\\pi: x + y - 2z + 3 = 0$.\n\nAqui $\\vec{v} = (1, 1, 1)$ e $\\vec{n} = (1, 1, -2)$:\n$$\\vec{v} \\cdot \\vec{n} = 1 + 1 - 2 = 0$$\n\nEntão a reta é paralela ao plano ou está contida nele. Testamos o ponto $A = (0, 1, 0)$ na equação:\n$$0 + 1 - 2\\cdot 0 + 3 = 4 \\neq 0$$\n\nComo $A$ não satisfaz a equação, $A \\notin \\pi$, e a reta é **paralela ao plano**.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Tudo se decide pelo produto escalar $\\vec{v} \\cdot \\vec{n}$.\n- Se $\\vec{v} \\cdot \\vec{n} \\neq 0$: reta e plano **concorrentes** (um ponto).\n- Se $\\vec{v} \\cdot \\vec{n} = 0$: **paralela** (se um ponto da reta não está em $\\pi$) ou **contida** (se está).\n- Caso **perpendicular**: ocorre quando $\\vec{v}$ é paralelo a $\\vec{n}$.\n- Cuidado com a troca: $\\vec{v} \\perp \\vec{n}$ é paralela ao plano; $\\vec{v} \\parallel \\vec{n}$ é perpendicular ao plano.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma reta de vetor diretor $\\vec{v}$ é paralela a um plano de normal $\\vec{n}$, ou está contida nele, exatamente quando:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\vec{v} \\cdot \\vec{n} = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\vec{v} \\cdot \\vec{n} \\neq 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{v} = \\vec{n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{v} \\times \\vec{n} = \\vec{0}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma reta de vetor diretor $\\vec{v}$ é perpendicular a um plano de vetor normal $\\vec{n}$ quando:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\vec{v}$ é paralelo a $\\vec{n}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\vec{v}$ é ortogonal a $\\vec{n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{v} \\cdot \\vec{n} = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{v}$ e $\\vec{n}$ têm o mesmo módulo",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A reta de vetor diretor $\\vec{v} = (1, 2, 1)$ em relação ao plano $2x - y + 3z + 5 = 0$ está na posição:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "concorrentes em um ponto",
                                isCorrect: true,
                            },
                            {
                                text: "paralelos, sem ponto comum",
                                isCorrect: false,
                            },
                            {
                                text: "a reta está contida no plano",
                                isCorrect: false,
                            },
                            {
                                text: "perpendiculares entre si",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Classifique a reta $r: (x, y, z) = (1, 1, 1) + t(2, 1, -1)$ em relação ao plano $x - y + z - 1 = 0$:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "a reta está contida no plano",
                                isCorrect: true,
                            },
                            {
                                text: "a reta é paralela ao plano, sem tocá-lo",
                                isCorrect: false,
                            },
                            {
                                text: "a reta corta o plano em um ponto",
                                isCorrect: false,
                            },
                            {
                                text: "a reta é perpendicular ao plano",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que uma reta seja perpendicular ao plano $2x - y + 2z + 1 = 0$, seu vetor diretor pode ser:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$(2, -1, 2)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(1, 2, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 1, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-1, 2, 2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Posições relativas entre planos",
                blocks: [
                    {
                        type: "text",
                        value: "## Comparando dois planos\n\nAgora comparamos **dois planos**:\n$$\\pi_1: a_1 x + b_1 y + c_1 z + d_1 = 0, \\qquad \\pi_2: a_2 x + b_2 y + c_2 z + d_2 = 0$$\n\ncom normais $\\vec{n_1} = (a_1, b_1, c_1)$ e $\\vec{n_2} = (a_2, b_2, c_2)$. Só existem três situações: os planos são **paralelos e distintos**, são **coincidentes** (o mesmo plano) ou são **secantes**, cruzando-se ao longo de uma reta.",
                    },
                    {
                        type: "text",
                        value: "## O teste dos normais\n\nO primeiro teste é sobre os normais. Se $\\vec{n_1}$ e $\\vec{n_2}$ são **paralelos**, os planos apontam para o mesmo lado e não podem se cruzar em uma reta: são paralelos distintos ou coincidentes. Se os normais **não são paralelos**, os planos são secantes.\n\nPara separar paralelos distintos de coincidentes, comparamos as proporções dos coeficientes, incluindo o termo independente:\n$$\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2} = \\frac{d_1}{d_2} \\ \\Rightarrow\\ \\text{coincidentes}$$\n\nSe a igualdade vale para $a$, $b$, $c$ mas **falha** em $d$, os planos são paralelos distintos.",
                    },
                    {
                        type: "text",
                        value: "## Tabela dos casos\n\n| Condição | Posição relativa |\n|---|---|\n| $\\vec{n_1} \\parallel \\vec{n_2}$, proporção falha em $d$ | paralelos e distintos |\n| $\\vec{n_1} \\parallel \\vec{n_2}$, proporção vale em $d$ | coincidentes |\n| $\\vec{n_1}$ e $\\vec{n_2}$ não paralelos | secantes (reta comum) |",
                    },
                    {
                        type: "text",
                        value: "## Ângulo e perpendicularidade\n\nDentro do caso secante há um subcaso notável: os planos são **perpendiculares** quando seus normais são perpendiculares, ou seja, quando o produto escalar se anula:\n$$\\vec{n_1} \\cdot \\vec{n_2} = 0$$\n\nDe modo geral, o ângulo $\\theta$ entre dois planos é o ângulo entre seus normais:\n$$\\cos\\theta = \\frac{|\\vec{n_1} \\cdot \\vec{n_2}|}{|\\vec{n_1}|\\,|\\vec{n_2}|}$$",
                    },
                    {
                        type: "quote",
                        value: "Dois planos só têm três destinos possíveis: correr lado a lado, coincidir por completo ou se cruzar ao longo de uma reta.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: paralelos distintos\n\nClassificar $\\pi_1: 2x - y + 3z - 1 = 0$ e $\\pi_2: 4x - 2y + 6z + 5 = 0$.\n\nOs normais são $\\vec{n_1} = (2, -1, 3)$ e $\\vec{n_2} = (4, -2, 6)$. Como $\\vec{n_2} = 2\\,\\vec{n_1}$, eles são paralelos. Verificando a proporção com o termo independente:\n$$\\frac{2}{4} = \\frac{-1}{-2} = \\frac{3}{6} = \\frac{1}{2}, \\qquad \\text{mas} \\qquad \\frac{-1}{5} \\neq \\frac{1}{2}$$\n\nA proporção falha em $d$, logo os planos são **paralelos e distintos**.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: secantes e perpendiculares\n\nClassificar $\\pi_1: x + 2y - z = 0$ e $\\pi_2: 2x - y + 0z = 0$.\n\nNormais: $\\vec{n_1} = (1, 2, -1)$ e $\\vec{n_2} = (2, -1, 0)$. Eles não são paralelos, então os planos são **secantes**. Testando a perpendicularidade:\n$$\\vec{n_1} \\cdot \\vec{n_2} = 1\\cdot 2 + 2\\cdot(-1) + (-1)\\cdot 0 = 2 - 2 + 0 = 0$$\n\nO produto escalar é nulo, portanto os planos são secantes e ainda **perpendiculares** entre si.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Comece pelos normais. Se $\\vec{n_1} \\parallel \\vec{n_2}$: paralelos distintos ou coincidentes.\n- A proporção dos coeficientes **com $d$** separa os dois: vale tudo, coincidentes; falha em $d$, paralelos distintos.\n- Se os normais **não** são paralelos: planos **secantes**, com uma reta comum.\n- O **ângulo** entre planos é o ângulo entre os normais; **perpendiculares** quando $\\vec{n_1} \\cdot \\vec{n_2} = 0$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Dois planos são paralelos (distintos ou coincidentes) quando seus vetores normais são:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "paralelos entre si",
                                isCorrect: true,
                            },
                            {
                                text: "perpendiculares entre si",
                                isCorrect: false,
                            },
                            {
                                text: "ortogonais, com produto escalar nulo",
                                isCorrect: false,
                            },
                            {
                                text: "de módulos iguais",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Dois planos de normais $\\vec{n_1}$ e $\\vec{n_2}$ são perpendiculares quando:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\vec{n_1} \\cdot \\vec{n_2} = 0$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\vec{n_1} \\parallel \\vec{n_2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{n_1} = \\vec{n_2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{n_1} \\times \\vec{n_2} = \\vec{0}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Os planos $\\pi_1: x - 2y + z = 0$ e $\\pi_2: 2x - 4y + 2z - 3 = 0$ são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "paralelos e distintos",
                                isCorrect: true,
                            },
                            {
                                text: "coincidentes (o mesmo plano)",
                                isCorrect: false,
                            },
                            {
                                text: "secantes, com reta comum",
                                isCorrect: false,
                            },
                            {
                                text: "perpendiculares",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Os planos $\\pi_1: x + y + z = 1$ e $\\pi_2: x - y + 2z = 3$ são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "secantes, com reta comum",
                                isCorrect: true,
                            },
                            {
                                text: "paralelos e distintos, sem ponto comum",
                                isCorrect: false,
                            },
                            {
                                text: "coincidentes (mesmo plano)",
                                isCorrect: false,
                            },
                            {
                                text: "perpendiculares entre si",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que valor de $m$ os planos $\\pi_1: x + 2y + mz = 0$ e $\\pi_2: 2x + 4y - 6z + 1 = 0$ são paralelos?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$m = -3$",
                                isCorrect: true,
                            },
                            {
                                text: "$m = -6$",
                                isCorrect: false,
                            },
                            {
                                text: "$m = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$m = 6$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Interseção de planos",
                blocks: [
                    {
                        type: "text",
                        value: "## A interseção é uma reta\n\nQuando dois planos são secantes, sua interseção é sempre uma **reta**. Esta aula mostra como encontrá-la a partir das equações gerais dos planos. Há dois caminhos equivalentes: resolver o sistema formado pelas duas equações, ou usar o produto vetorial dos normais. Em geral, vale a pena combinar os dois.",
                    },
                    {
                        type: "text",
                        value: "## Direção e ponto da reta\n\n**Direção.** A reta de interseção está contida nos dois planos ao mesmo tempo, então sua direção $\\vec{v}$ é perpendicular a $\\vec{n_1}$ e a $\\vec{n_2}$ simultaneamente. O vetor que faz isso é o **produto vetorial** dos normais:\n$$\\vec{v} = \\vec{n_1} \\times \\vec{n_2}$$\n\n**Um ponto.** O sistema tem duas equações e três incógnitas, restando um grau de liberdade. Fixamos uma variável, por exemplo $z = 0$, e resolvemos as duas equações restantes para obter um ponto de apoio.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: direção e ponto\n\nEncontrar a reta de interseção de $\\pi_1: x + y + z = 1$ e $\\pi_2: 2x - y + z = 2$.\n\nNormais: $\\vec{n_1} = (1, 1, 1)$ e $\\vec{n_2} = (2, -1, 1)$. A direção da reta é\n$$\\vec{v} = \\vec{n_1} \\times \\vec{n_2} = (1\\cdot 1 - 1\\cdot(-1),\\ \\ 1\\cdot 2 - 1\\cdot 1,\\ \\ 1\\cdot(-1) - 1\\cdot 2) = (2, 1, -3)$$\n\nPara um ponto, fazemos $z = 0$ e resolvemos $x + y = 1$ e $2x - y = 2$. Somando, $3x = 3$, logo $x = 1$ e $y = 0$. Um ponto é $(1, 0, 0)$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: forma final\n\nCom o ponto $(1, 0, 0)$ e a direção $(2, 1, -3)$, a reta de interseção é\n$$(x, y, z) = (1, 0, 0) + t(2, 1, -3)$$\n\nVale conferir que a direção é paralela aos dois planos, testando o produto escalar com cada normal:\n$$\\vec{v} \\cdot \\vec{n_1} = 2 + 1 - 3 = 0, \\qquad \\vec{v} \\cdot \\vec{n_2} = 4 - 1 - 3 = 0$$\n\nAmbos se anulam, como esperado para uma reta contida em cada plano.",
                    },
                    {
                        type: "quote",
                        value: "Onde dois planos se encontram, nasce sempre uma reta, e o produto vetorial das normais aponta a direção dela.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: pelo sistema\n\nEncontrar a reta de interseção de $\\pi_1: x + 2y - z = 3$ e $\\pi_2: 2x - y + z = 1$ resolvendo o sistema por parâmetro.\n\nSomando as duas equações eliminamos $z$: $\\ 3x + y = 4$, portanto $y = 4 - 3x$. Fazendo $x = t$, temos $y = 4 - 3t$. Da primeira equação,\n$$z = x + 2y - 3 = t + 2(4 - 3t) - 3 = 5 - 5t$$\n\nA reta em forma paramétrica fica\n$$\\begin{cases} x = t \\\\ y = 4 - 3t \\\\ z = 5 - 5t \\end{cases}$$\n\ncom ponto de apoio $(0, 4, 5)$ e direção $(1, -3, -5)$. O produto vetorial $\\vec{n_1} \\times \\vec{n_2}$ devolve exatamente $(1, -3, -5)$, confirmando o resultado.",
                    },
                    {
                        type: "text",
                        value: "## Três planos\n\nAo juntar um terceiro plano, o sistema passa a ter três equações e três incógnitas, e a interseção comum pode ser:\n\n- um **único ponto**, quando o sistema tem solução única;\n- uma **reta**, quando os três se cruzam ao longo de uma reta comum;\n- o **conjunto vazio**, quando o sistema é incompatível, por exemplo com dois planos paralelos distintos.\n\nA análise se reduz, então, a discutir o sistema linear.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A interseção de dois planos secantes é uma **reta**.\n- Sua **direção** é $\\vec{v} = \\vec{n_1} \\times \\vec{n_2}$.\n- Um **ponto** sai fixando uma variável e resolvendo o sistema $2 \\times 3$ restante.\n- Alternativamente, elimina-se uma incógnita e parametriza-se por uma das variáveis.\n- Com **três planos**, a interseção comum pode ser um ponto, uma reta ou o conjunto vazio, conforme o sistema.",
                    },
                ],
                questions: [
                    {
                        statement: "A interseção de dois planos secantes é sempre:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "uma reta",
                                isCorrect: true,
                            },
                            {
                                text: "um único ponto",
                                isCorrect: false,
                            },
                            {
                                text: "um outro plano",
                                isCorrect: false,
                            },
                            {
                                text: "o conjunto vazio",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O vetor diretor da reta de interseção de dois planos de normais $\\vec{n_1}$ e $\\vec{n_2}$ é dado por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\vec{n_1} \\times \\vec{n_2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\tfrac{1}{2}(\\vec{n_1} + \\vec{n_2})$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{n_1} \\cdot \\vec{n_2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\vec{n_1} + \\vec{n_2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um vetor diretor da reta de interseção de $\\pi_1: x + y + z = 1$ e $\\pi_2: 2x - y + z = 2$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(2, 1, -3)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(-1, 2, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(3, 0, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(2, 1, 3)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual ponto pertence à reta de interseção de $\\pi_1: x + y + z = 1$ e $\\pi_2: 2x - y + z = 2$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(1, 0, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(1, 1, -1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, 0, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, 1, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A reta de interseção de $\\pi_1: x + 2y - z = 3$ e $\\pi_2: 2x - y + z = 1$ pode ser escrita como:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$(x, y, z) = (0, 4, 5) + t(1, -3, -5)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(x, y, z) = (3, 1, 1) + t(1, -3, -5)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x, y, z) = (0, 4, 5) + t(1, 2, -1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x, y, z) = (0, 4, 5) + t(3, 1, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Distâncias e ângulos",
        aulas: [
            {
                titulo: "Distância entre pontos e de ponto a reta no plano",
                blocks: [
                    {
                        type: "text",
                        value: "# Distância entre pontos e de ponto a reta no plano\n\nNeste módulo vamos medir distâncias e ângulos com as ferramentas da geometria analítica. Comecamos pelo caso mais simples e mais usado: distâncias no plano $\\mathbb{R}^2$.\n\nDuas perguntas guiam esta aula. Qual é a distância entre dois pontos dados por suas coordenadas? E qual é a menor distância entre um ponto e uma reta? Ambas têm fórmula fechada e direta.",
                    },
                    {
                        type: "text",
                        value: "## Distância entre dois pontos\n\nDados $A = (x_1, y_1)$ e $B = (x_2, y_2)$, a distância entre eles vem direto do teorema de Pitágoras aplicado ao triângulo retângulo de catetos $|x_2 - x_1|$ e $|y_2 - y_1|$:\n\n$$d(A, B) = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$\n\nComo as diferencas aparecem ao quadrado, a ordem dos pontos não altera o resultado: $d(A, B) = d(B, A)$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 1\n\nVamos calcular a distância entre $A = (1, 2)$ e $B = (4, 6)$.\n\nAs diferencas de coordenadas são $x_2 - x_1 = 4 - 1 = 3$ e $y_2 - y_1 = 6 - 2 = 4$. Logo:\n\n$$d(A, B) = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$$\n\nA distância é de $5$ unidades.",
                    },
                    {
                        type: "text",
                        value: "## Distância de um ponto a uma reta\n\nSeja a reta $r$ de equação geral $ax + by + c = 0$ e um ponto $P = (x_0, y_0)$. A menor distância de $P$ até $r$, medida na perpendicular, é:\n\n$$d(P, r) = \\frac{|a x_0 + b y_0 + c|}{\\sqrt{a^2 + b^2}}$$\n\nRepare em dois detalhes que costumam gerar erro. No numerador há um módulo: distância nunca é negativa. No denominador está $\\sqrt{a^2 + b^2}$, a norma do vetor normal $\\vec{n} = (a, b)$ da reta, e não $a + b$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 2\n\nQual a distância do ponto $P = (2, -1)$ à reta $r: 3x + 4y - 5 = 0$?\n\nAqui $a = 3$, $b = 4$ e $c = -5$. Substituindo:\n\n$$d(P, r) = \\frac{|3 \\cdot 2 + 4 \\cdot (-1) - 5|}{\\sqrt{3^2 + 4^2}} = \\frac{|6 - 4 - 5|}{\\sqrt{25}} = \\frac{|-3|}{5} = \\frac{3}{5}$$\n\nA distância vale $\\frac{3}{5}$ de unidade.",
                    },
                    {
                        type: "text",
                        value: "## Cuidado com a forma da equação\n\nA fórmula exige a reta na forma geral $ax + by + c = 0$, com tudo de um lado só. Se ela vier na forma reduzida $y = mx + n$, reescreva antes como $mx - y + n = 0$, identificando $a = m$, $b = -1$ e $c = n$. Esquecer esse passo é a fonte de erro mais comum.",
                    },
                    {
                        type: "quote",
                        value: "A distância de um ponto a uma reta é sempre medida ao longo da perpendicular, nunca por um caminho oblíquo.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nEntre dois pontos, a distância é a raiz da soma dos quadrados das diferencas de coordenadas. Do ponto à reta, use $d = \\frac{|a x_0 + b y_0 + c|}{\\sqrt{a^2 + b^2}}$, com a reta na forma geral. Nunca esqueca o módulo no numerador nem a raiz no denominador.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a distância entre os pontos $A = (0, 0)$ e $B = (6, 8)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$14$",
                                isCorrect: false,
                            },
                            {
                                text: "$2\\sqrt{7}$",
                                isCorrect: false,
                            },
                            {
                                text: "$100$",
                                isCorrect: false,
                            },
                            {
                                text: "$10$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "A distância entre $A = (1, 1)$ e $B = (4, 5)$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sqrt{7}$",
                                isCorrect: false,
                            },
                            {
                                text: "$25$",
                                isCorrect: false,
                            },
                            {
                                text: "$7$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual a distância da origem $(0, 0)$ à reta $3x + 4y - 10 = 0$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$-2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{10}{\\sqrt{7}}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{10}{7}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A distância do ponto $P = (3, 4)$ à reta $x + y - 1 = 0$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{7\\sqrt{2}}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$3\\sqrt{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual a distância do ponto $P = (2, 3)$ à reta $y = 2x + 1$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{2}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{8\\sqrt{5}}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{2\\sqrt{5}}{5}$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Distância de ponto a reta no espaço",
                blocks: [
                    {
                        type: "text",
                        value: "# Distância de ponto a reta no espaço\n\nNo plano usamos a fórmula com o vetor normal da reta. No espaço $\\mathbb{R}^3$ uma reta não tem um único vetor normal, então precisamos de outra ideia: o produto vetorial.",
                    },
                    {
                        type: "text",
                        value: "## A reta no espaço\n\nUma reta $r$ no espaço fica determinada por um ponto conhecido $A$ e um vetor diretor $\\vec{v}$. Para medir a distância de um ponto $P$ até $r$, considere o vetor $\\vec{AP}$, que liga $A$ a $P$.\n\nOs vetores $\\vec{AP}$ e $\\vec{v}$ formam um paralelogramo. A área desse paralelogramo é $\\|\\vec{AP} \\times \\vec{v}\\|$, a norma do produto vetorial.",
                    },
                    {
                        type: "text",
                        value: "## A fórmula\n\nA área do paralelogramo também é base vezes altura. Tomando $\\vec{v}$ como base, de comprimento $\\|\\vec{v}\\|$, a altura é exatamente a distância procurada. Isolando a altura:\n\n$$d(P, r) = \\frac{\\|\\vec{AP} \\times \\vec{v}\\|}{\\|\\vec{v}\\|}$$\n\nO numerador é a área do paralelogramo; o denominador é o comprimento da base. A distância é a altura relativa a essa base.",
                    },
                    {
                        type: "text",
                        value: "## Lembrete: produto vetorial\n\nSe $\\vec{u} = (u_1, u_2, u_3)$ e $\\vec{w} = (w_1, w_2, w_3)$, então:\n\n$$\\vec{u} \\times \\vec{w} = (u_2 w_3 - u_3 w_2,\\ u_3 w_1 - u_1 w_3,\\ u_1 w_2 - u_2 w_1)$$\n\nE a norma de um vetor $(p, q, s)$ é $\\|(p, q, s)\\| = \\sqrt{p^2 + q^2 + s^2}$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo\n\nCalcule a distância de $P = (1, 1, 1)$ à reta que passa por $A = (0, 0, 0)$ com vetor diretor $\\vec{v} = (1, 0, 0)$.\n\nPrimeiro, $\\vec{AP} = P - A = (1, 1, 1)$. Agora o produto vetorial:\n\n$$\\vec{AP} \\times \\vec{v} = (1 \\cdot 0 - 1 \\cdot 0,\\ 1 \\cdot 1 - 1 \\cdot 0,\\ 1 \\cdot 0 - 1 \\cdot 1) = (0, 1, -1)$$\n\nSua norma é $\\|(0, 1, -1)\\| = \\sqrt{0 + 1 + 1} = \\sqrt{2}$. Como $\\|\\vec{v}\\| = 1$:\n\n$$d(P, r) = \\frac{\\sqrt{2}}{1} = \\sqrt{2}$$\n\nO resultado confere: a reta é o eixo $x$, e a distância de $(1, 1, 1)$ ao eixo $x$ é $\\sqrt{1^2 + 1^2} = \\sqrt{2}$.",
                    },
                    {
                        type: "quote",
                        value: "No espaço, a distância de um ponto a uma reta é a altura de um paralelogramo: a área dividida pela base.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nCom a reta dada por um ponto $A$ e uma direção $\\vec{v}$, e um ponto externo $P$, a distância é $d = \\frac{\\|\\vec{AP} \\times \\vec{v}\\|}{\\|\\vec{v}\\|}$. Monte $\\vec{AP}$, calcule o produto vetorial com $\\vec{v}$, tome as normas e divida. Usar o produto escalar no lugar do vetorial é um erro clássico.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A distância de um ponto $P$ a uma reta que passa por $A$ com direção $\\vec{v}$ é dada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{|\\vec{AP} \\cdot \\vec{v}|}{\\|\\vec{v}\\|}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\|\\vec{AP} \\times \\vec{v}\\|}{\\|\\vec{AP}\\| \\, \\|\\vec{v}\\|}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\|\\vec{AP} \\times \\vec{v}\\|}{\\|\\vec{v}\\|}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\|\\vec{AP} \\times \\vec{v}\\|}{\\|\\vec{AP}\\|}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $\\vec{AP} \\times \\vec{v} = (0, 3, 4)$ e $\\|\\vec{v}\\| = 5$, a distância de $P$ à reta é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$25$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{7}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\sqrt{7}}{5}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual a distância de $P = (2, 0, 0)$ à reta por $A = (0, 0, 0)$ com direção $\\vec{v} = (1, 1, 0)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\sqrt{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\sqrt{2}}{2}$",
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
                            "Com $\\vec{AP} = (1, 2, 2)$, $\\vec{v} = (0, 0, 1)$ e $\\|\\vec{v}\\| = 1$, a distância de $P$ à reta é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{5}$",
                                isCorrect: true,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual a distância de $P = (1, 2, 3)$ à reta por $A = (0, 0, 0)$ com direção $\\vec{v} = (1, 1, 1)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$2\\sqrt{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{6}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\sqrt{6}}{3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Distância de ponto a plano",
                blocks: [
                    {
                        type: "text",
                        value: "# Distância de ponto a plano\n\nEsta é a extensão natural, para o espaço, da fórmula de distância de ponto a reta no plano. Onde antes havia duas coordenadas, agora há três, e o vetor normal ganha uma terceira componente.",
                    },
                    {
                        type: "text",
                        value: "## A fórmula\n\nSeja o plano $\\pi: ax + by + cz + d = 0$ e o ponto $P = (x_0, y_0, z_0)$. A distância de $P$ ao plano é:\n\n$$d(P, \\pi) = \\frac{|a x_0 + b y_0 + c z_0 + d|}{\\sqrt{a^2 + b^2 + c^2}}$$\n\nO vetor $\\vec{n} = (a, b, c)$ é o vetor normal do plano, e o denominador $\\sqrt{a^2 + b^2 + c^2}$ é justamente $\\|\\vec{n}\\|$. Como sempre, o numerador vem com módulo.",
                    },
                    {
                        type: "text",
                        value: "## De onde vem a fórmula\n\nSubstituir as coordenadas de $P$ na expressão $ax + by + cz + d$ dá zero quando $P$ está sobre o plano. Quanto mais longe do plano, maior o valor absoluto dessa expressão. Dividir por $\\|\\vec{n}\\|$ transforma esse número na distância geométrica de verdade, medida na direção perpendicular ao plano.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 1\n\nDistância de $P = (1, 2, 2)$ ao plano $\\pi: 2x + y - 2z + 5 = 0$.\n\nTemos $a = 2$, $b = 1$, $c = -2$ e $d = 5$. No numerador:\n\n$$|2 \\cdot 1 + 1 \\cdot 2 - 2 \\cdot 2 + 5| = |2 + 2 - 4 + 5| = |5| = 5$$\n\nNo denominador, $\\sqrt{2^2 + 1^2 + (-2)^2} = \\sqrt{4 + 1 + 4} = \\sqrt{9} = 3$. Portanto:\n\n$$d(P, \\pi) = \\frac{5}{3}$$",
                    },
                    {
                        type: "text",
                        value: "### Exemplo 2\n\nDistância da origem $O = (0, 0, 0)$ ao plano $\\pi: x + 2y + 2z - 6 = 0$.\n\nCom $P$ na origem, o numerador é só o termo independente: $|0 + 0 + 0 - 6| = 6$. O denominador é $\\sqrt{1^2 + 2^2 + 2^2} = \\sqrt{9} = 3$. Assim:\n\n$$d(O, \\pi) = \\frac{6}{3} = 2$$",
                    },
                    {
                        type: "text",
                        value: "## Distância entre planos paralelos\n\nDois planos paralelos têm o mesmo vetor normal. Para achar a distância entre eles, basta tomar um ponto qualquer de um dos planos e calcular a distância desse ponto ao outro plano com a fórmula acima.",
                    },
                    {
                        type: "quote",
                        value: "Substituir o ponto na equação do plano mede o quanto ele desobedece à equação; dividir pela norma do normal converte isso em distância.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nA distância de $P = (x_0, y_0, z_0)$ ao plano $ax + by + cz + d = 0$ é $\\frac{|a x_0 + b y_0 + c z_0 + d|}{\\sqrt{a^2 + b^2 + c^2}}$. Identifique $a$, $b$, $c$ e $d$, substitua com atenção aos sinais, aplique o módulo no numerador e divida pela norma do vetor normal.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual a distância da origem $(0, 0, 0)$ ao plano $x + 2y + 2z - 9 = 0$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{9}{\\sqrt{5}}$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{9}{5}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A distância de $P = (1, 1, 1)$ ao plano $x + y + z - 6 = 0$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{\\sqrt{3}}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{3}$",
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
                            "Qual a distância de $P = (2, -1, 3)$ ao plano $2x - 2y + z + 1 = 0$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{10}{3}$",
                                isCorrect: true,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{10}{9}$",
                                isCorrect: false,
                            },
                            {
                                text: "$10$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A distância entre os planos paralelos $x + 2y + 2z - 3 = 0$ e $x + 2y + 2z + 6 = 0$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{9}{\\sqrt{5}}$",
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
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para qual valor de $k$ o ponto $P = (1, 1, 1)$ fica a distância $2$ do plano $2x + y + 2z + k = 0$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$k = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = -1$ ou $k = 11$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = 6$ ou $k = -6$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = 1$ ou $k = -11$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Distância entre retas reversas",
                blocks: [
                    {
                        type: "text",
                        value: "# Distância entre retas reversas\n\nDuas retas no espaço podem ser concorrentes, paralelas ou reversas. Retas reversas não se cruzam e não são paralelas: estão em planos diferentes. Ainda assim existe uma menor distância entre elas, medida ao longo da perpendicular comum.",
                    },
                    {
                        type: "text",
                        value: "## Os dados do problema\n\nSejam $r_1$ passando por $A_1$ com direção $\\vec{v_1}$, e $r_2$ passando por $A_2$ com direção $\\vec{v_2}$. Forme o vetor $\\vec{A_1 A_2}$, que liga um ponto de cada reta.\n\nQuando $\\vec{v_1}$ e $\\vec{v_2}$ não são paralelos, o produto vetorial $\\vec{v_1} \\times \\vec{v_2}$ é um vetor perpendicular às duas retas ao mesmo tempo. Essa é a direção da perpendicular comum.",
                    },
                    {
                        type: "text",
                        value: "## A fórmula\n\nA distância entre as retas reversas é:\n\n$$d = \\frac{|\\vec{A_1 A_2} \\cdot (\\vec{v_1} \\times \\vec{v_2})|}{\\|\\vec{v_1} \\times \\vec{v_2}\\|}$$\n\nO numerador é o módulo do produto misto dos três vetores, que equivale ao volume do paralelepípedo formado por $\\vec{A_1 A_2}$, $\\vec{v_1}$ e $\\vec{v_2}$. O denominador é a área da base desse paralelepípedo. Volume dividido por área da base dá a altura, que é a distância entre as retas.",
                    },
                    {
                        type: "text",
                        value: "## Um teste embutido\n\nSe o produto misto no numerador der zero, o volume é zero e os três vetores são coplanares: as retas não são reversas, e sim concorrentes ou paralelas. A mesma fórmula, portanto, detecta quando as retas se cruzam.",
                    },
                    {
                        type: "text",
                        value: "## Lembrete: produto misto\n\nO produto misto $\\vec{a} \\cdot (\\vec{b} \\times \\vec{c})$ é um número real. Calcule primeiro $\\vec{b} \\times \\vec{c}$ e depois faca o produto escalar com $\\vec{a}$. Ele pode ser positivo ou negativo, e por isso a fórmula usa o módulo.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo\n\nConsidere $r_1$ pelo ponto $A_1 = (0, 0, 0)$ com $\\vec{v_1} = (1, 0, 0)$, e $r_2$ pelo ponto $A_2 = (0, 0, 1)$ com $\\vec{v_2} = (0, 1, 0)$.\n\nO vetor entre os pontos é $\\vec{A_1 A_2} = (0, 0, 1)$. O produto vetorial dos diretores:\n\n$$\\vec{v_1} \\times \\vec{v_2} = (1, 0, 0) \\times (0, 1, 0) = (0, 0, 1)$$\n\nO produto misto é $\\vec{A_1 A_2} \\cdot (\\vec{v_1} \\times \\vec{v_2}) = (0, 0, 1) \\cdot (0, 0, 1) = 1$. E $\\|\\vec{v_1} \\times \\vec{v_2}\\| = \\|(0, 0, 1)\\| = 1$. Logo:\n\n$$d = \\frac{|1|}{1} = 1$$\n\nO resultado confere: as retas são o eixo $x$ e uma reta paralela ao eixo $y$ um nível acima, e a distância entre elas é $1$.",
                    },
                    {
                        type: "quote",
                        value: "A perpendicular comum é a única reta que corta as duas retas reversas formando ângulo reto com ambas; seu comprimento é a distância entre elas.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nPara retas reversas, $d = \\frac{|\\vec{A_1 A_2} \\cdot (\\vec{v_1} \\times \\vec{v_2})|}{\\|\\vec{v_1} \\times \\vec{v_2}\\|}$. Escolha um ponto em cada reta para montar $\\vec{A_1 A_2}$, calcule $\\vec{v_1} \\times \\vec{v_2}$, faca o produto misto no numerador com módulo e divida pela norma do produto vetorial. Produto misto nulo significa que as retas não são reversas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A distância entre duas retas reversas $r_1$ e $r_2$ é dada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{|\\vec{A_1 A_2} \\cdot (\\vec{v_1} \\times \\vec{v_2})|}{\\|\\vec{v_1} \\times \\vec{v_2}\\|}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\|\\vec{A_1 A_2} \\times (\\vec{v_1} \\times \\vec{v_2})\\|}{\\|\\vec{v_1} \\times \\vec{v_2}\\|}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{|\\vec{A_1 A_2} \\cdot (\\vec{v_1} \\times \\vec{v_2})|}{\\|\\vec{A_1 A_2}\\|}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{|\\vec{A_1 A_2} \\cdot (\\vec{v_1} \\times \\vec{v_2})|}{\\|\\vec{v_1}\\| \\, \\|\\vec{v_2}\\|}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se o produto misto vale $12$ e $\\|\\vec{v_1} \\times \\vec{v_2}\\| = 4$, a distância entre as retas é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$48$",
                                isCorrect: false,
                            },
                            {
                                text: "$16$",
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
                            "Com $\\vec{A_1 A_2} = (0, 0, 2)$ e $\\vec{v_1} \\times \\vec{v_2} = (0, 0, 4)$, a distância entre as retas é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$8$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
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
                        ],
                    },
                    {
                        statement:
                            "Sejam $r_1$ por $A_1 = (0, 0, 0)$ com $\\vec{v_1} = (1, 0, 0)$ e $r_2$ por $A_2 = (0, 2, 0)$ com $\\vec{v_2} = (0, 0, 1)$. A distância entre elas é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{2}$",
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
                            "Sejam $r_1$ por $A_1 = (1, 0, 0)$ com $\\vec{v_1} = (1, 1, 0)$ e $r_2$ por $A_2 = (0, 1, 0)$ com $\\vec{v_2} = (0, 0, 1)$. A distância entre elas é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sqrt{2}}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Ângulos entre retas e planos",
                blocks: [
                    {
                        type: "text",
                        value: "# Ângulos entre retas e planos\n\nFechamos o módulo medindo ângulos. A ferramenta central é o produto escalar, que relaciona o cosseno do ângulo entre dois vetores com suas componentes. O módulo aparece em todas as fórmulas para garantir o ângulo agudo, que é a convenção usual.",
                    },
                    {
                        type: "text",
                        value: "## Ângulo entre duas retas\n\nO ângulo entre duas retas depende apenas de seus vetores diretores $\\vec{v_1}$ e $\\vec{v_2}$:\n\n$$\\cos\\theta = \\frac{|\\vec{v_1} \\cdot \\vec{v_2}|}{\\|\\vec{v_1}\\| \\, \\|\\vec{v_2}\\|}$$\n\nO módulo no numerador assegura $0 \\le \\theta \\le 90^\\circ$. Se $\\vec{v_1} \\cdot \\vec{v_2} = 0$, as retas são perpendiculares.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo com retas\n\nÂngulo entre as retas de diretores $\\vec{v_1} = (1, 1, 0)$ e $\\vec{v_2} = (1, 0, 1)$.\n\nProduto escalar: $\\vec{v_1} \\cdot \\vec{v_2} = 1 \\cdot 1 + 1 \\cdot 0 + 0 \\cdot 1 = 1$. Normas: $\\|\\vec{v_1}\\| = \\sqrt{2}$ e $\\|\\vec{v_2}\\| = \\sqrt{2}$. Assim:\n\n$$\\cos\\theta = \\frac{|1|}{\\sqrt{2} \\cdot \\sqrt{2}} = \\frac{1}{2}$$\n\nPortanto $\\theta = 60^\\circ$.",
                    },
                    {
                        type: "text",
                        value: "## Ângulo entre dois planos\n\nO ângulo entre dois planos é o ângulo entre seus vetores normais $\\vec{n_1}$ e $\\vec{n_2}$:\n\n$$\\cos\\theta = \\frac{|\\vec{n_1} \\cdot \\vec{n_2}|}{\\|\\vec{n_1}\\| \\, \\|\\vec{n_2}\\|}$$\n\nA forma é idêntica à das retas, trocando os diretores pelos normais. Planos perpendiculares têm normais perpendiculares.",
                    },
                    {
                        type: "text",
                        value: "## Ângulo entre reta e plano\n\nAqui há uma troca importante: usamos o seno, não o cosseno. Com $\\vec{v}$ o diretor da reta e $\\vec{n}$ o normal do plano:\n\n$$\\sin\\theta = \\frac{|\\vec{v} \\cdot \\vec{n}|}{\\|\\vec{v}\\| \\, \\|\\vec{n}\\|}$$\n\nA razão é geométrica: o ângulo entre a reta e o plano é o complemento do ângulo entre a reta e o vetor normal. Como $\\cos(90^\\circ - \\theta) = \\sin\\theta$, o cosseno do ângulo com o normal vira o seno do ângulo com o plano.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo com reta e plano\n\nÂngulo entre a reta de diretor $\\vec{v} = (0, 0, 1)$ e o plano de normal $\\vec{n} = (0, 0, 1)$.\n\nProduto escalar: $\\vec{v} \\cdot \\vec{n} = 1$. As duas normas valem $1$. Então:\n\n$$\\sin\\theta = \\frac{|1|}{1 \\cdot 1} = 1$$\n\no que dá $\\theta = 90^\\circ$. Faz sentido: a reta é paralela ao normal, logo perpendicular ao plano.",
                    },
                    {
                        type: "quote",
                        value: "Retas e planos comparam-se por seus vetores característicos: diretor para a reta, normal para o plano; o produto escalar cuida do resto.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nEntre retas, $\\cos\\theta = \\frac{|\\vec{v_1} \\cdot \\vec{v_2}|}{\\|\\vec{v_1}\\| \\, \\|\\vec{v_2}\\|}$. Entre planos, a mesma fórmula com os normais. Entre reta e plano, troque o cosseno pelo seno: $\\sin\\theta = \\frac{|\\vec{v} \\cdot \\vec{n}|}{\\|\\vec{v}\\| \\, \\|\\vec{n}\\|}$. O módulo garante sempre o ângulo agudo.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual o ângulo entre as retas de diretores $\\vec{v_1} = (1, 0, 0)$ e $\\vec{v_2} = (0, 1, 0)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$0^\\circ$",
                                isCorrect: false,
                            },
                            {
                                text: "$45^\\circ$",
                                isCorrect: false,
                            },
                            {
                                text: "$90^\\circ$",
                                isCorrect: true,
                            },
                            {
                                text: "$60^\\circ$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O ângulo entre uma reta de diretor $\\vec{v}$ e um plano de normal $\\vec{n}$ é calculado por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sin\\theta = \\frac{|\\vec{v} \\cdot \\vec{n}|}{\\|\\vec{v}\\| \\, \\|\\vec{n}\\|}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\cos\\theta = \\frac{|\\vec{v} \\cdot \\vec{n}|}{\\|\\vec{v}\\| \\, \\|\\vec{n}\\|}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tan\\theta = \\frac{|\\vec{v} \\cdot \\vec{n}|}{\\|\\vec{v}\\| \\, \\|\\vec{n}\\|}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sin\\theta = \\frac{|\\vec{v} \\times \\vec{n}|}{\\|\\vec{v}\\| \\, \\|\\vec{n}\\|}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual o ângulo entre os planos de normais $\\vec{n_1} = (1, 0, 0)$ e $\\vec{n_2} = (1, 1, 0)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$45^\\circ$",
                                isCorrect: true,
                            },
                            {
                                text: "$90^\\circ$",
                                isCorrect: false,
                            },
                            {
                                text: "$30^\\circ$",
                                isCorrect: false,
                            },
                            {
                                text: "$60^\\circ$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual o ângulo entre as retas de diretores $\\vec{v_1} = (1, 1, 0)$ e $\\vec{v_2} = (-1, 0, 1)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$60^\\circ$",
                                isCorrect: true,
                            },
                            {
                                text: "$120^\\circ$",
                                isCorrect: false,
                            },
                            {
                                text: "$90^\\circ$",
                                isCorrect: false,
                            },
                            {
                                text: "$45^\\circ$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para a reta de diretor $\\vec{v} = (2, 2, 1)$ e o plano de normal $\\vec{n} = (1, 2, 2)$, o valor de $\\sin\\theta$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{8}{6}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{8}{9}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{8}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{8}{81}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Cônicas",
        aulas: [
            {
                titulo: "A circunferência",
                blocks: [
                    {
                        type: "text",
                        value: "# A circunferência\n\nEntre todas as cônicas, a circunferência é a mais familiar e a mais simples de descrever. Ela aparece quando cortamos um cone com um plano perpendicular ao seu eixo, mas na Geometria Analítica preferimos defini-la por uma propriedade de distância, que traduz diretamente para uma equação.\n\nUma **circunferência** é o conjunto de todos os pontos do plano que estão a uma mesma distância de um ponto fixo. O ponto fixo é o **centro**, que indicaremos por $C = (a, b)$, e a distância constante é o **raio** $r > 0$. Tudo o que veremos nesta aula decorre dessa única frase.",
                    },
                    {
                        type: "text",
                        value: "## A equação reduzida\n\nSeja $P = (x, y)$ um ponto qualquer da circunferência. Dizer que $P$ dista $r$ do centro $C = (a, b)$ é dizer que a distância entre eles vale $r$:\n\n$$\\sqrt{(x - a)^2 + (y - b)^2} = r$$\n\nElevando os dois lados ao quadrado, eliminamos a raiz e chegamos à **equação reduzida** da circunferência:\n\n$$(x - a)^2 + (y - b)^2 = r^2$$\n\nQuando o centro é a origem, $a = b = 0$, e a equação assume a forma mais enxuta $x^2 + y^2 = r^2$.",
                    },
                    {
                        type: "text",
                        value: "## Os elementos: centro e raio\n\nA circunferência tem apenas dois elementos, e ambos ficam à mostra na equação reduzida. O **centro** é lido diretamente dos parênteses, com o sinal trocado: em $(x - a)^2$ o valor da abscissa do centro é $a$, e em $(y - b)^2$ a ordenada é $b$. O **raio** é a raiz quadrada do número isolado no lado direito.\n\nPor exemplo, em $(x + 4)^2 + (y - 1)^2 = 49$ reescrevemos $(x + 4)$ como $(x - (-4))$, de modo que o centro é $(-4, 1)$ e o raio é $\\sqrt{49} = 7$. O detalhe do sinal trocado é a fonte de erro mais comum, então vale a atenção redobrada.",
                    },
                    {
                        type: "text",
                        value: "## A equação geral\n\nSe desenvolvermos os quadrados da equação reduzida, obtemos uma expressão sem parênteses, chamada **equação geral**:\n\n$$x^2 + y^2 + Dx + Ey + F = 0$$\n\nRepare que os coeficientes de $x^2$ e $y^2$ são iguais a $1$ e não há termo em $xy$. Para voltar do geral ao reduzido usamos o **completamento de quadrados**. O centro fica em $\\left(-\\frac{D}{2}, -\\frac{E}{2}\\right)$ e o raio é dado por\n\n$$r = \\sqrt{\\left(\\frac{D}{2}\\right)^2 + \\left(\\frac{E}{2}\\right)^2 - F}$$\n\nA equação só representa uma circunferência de verdade quando o número dentro da raiz é positivo. Se for zero, a curva degenera em um único ponto; se for negativo, não há ponto real nenhum.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: lendo a equação reduzida\n\nConsidere $(x - 3)^2 + (y + 2)^2 = 25$. Vamos identificar centro e raio.\n\nO termo $(x - 3)^2$ informa que a abscissa do centro é $3$. O termo $(y + 2)^2$, reescrito como $(y - (-2))^2$, informa que a ordenada é $-2$. Logo o centro é $C = (3, -2)$.\n\nO lado direito vale $25$, então $r^2 = 25$ e o raio é $r = \\sqrt{25} = 5$. Note que o raio é $5$, e não $25$: confundir $r$ com $r^2$ é outro deslize frequente.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: da equação geral à reduzida\n\nVamos identificar a circunferência $x^2 + y^2 - 6x + 4y - 12 = 0$ completando quadrados.\n\nAgrupamos os termos em $x$ e os termos em $y$: $(x^2 - 6x) + (y^2 + 4y) = 12$. Para completar o quadrado em $x$, metade de $-6$ é $-3$, e $(-3)^2 = 9$. Para o quadrado em $y$, metade de $4$ é $2$, e $2^2 = 4$. Somamos $9$ e $4$ aos dois lados:\n\n$$(x^2 - 6x + 9) + (y^2 + 4y + 4) = 12 + 9 + 4$$\n\nO lado esquerdo vira dois quadrados perfeitos e o direito soma $25$:\n\n$$(x - 3)^2 + (y + 2)^2 = 25$$\n\nChegamos à mesma circunferência do exemplo anterior: centro $(3, -2)$ e raio $5$.",
                    },
                    {
                        type: "quote",
                        value: "Toda circunferência guarda um segredo curto: um centro e uma distância. Fixe esses dois dados e a curva inteira já está decidida.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nA circunferência é o lugar dos pontos que distam $r$ de um centro $C = (a, b)$. Sua equação reduzida é $(x - a)^2 + (y - b)^2 = r^2$, de onde lemos o centro (com sinais trocados) e o raio (a raiz do lado direito). A forma geral $x^2 + y^2 + Dx + Ey + F = 0$ tem coeficientes iguais em $x^2$ e $y^2$ e nenhum termo em $xy$; para interpretá-la, completamos quadrados. Nas próximas aulas veremos que basta esticar essa ideia para obter as demais cônicas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é o centro e o raio da circunferência $(x - 3)^2 + (y + 2)^2 = 25$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Centro $(3, -2)$ e raio $5$",
                                isCorrect: true,
                            },
                            {
                                text: "Centro $(-3, 2)$ e raio $5$",
                                isCorrect: false,
                            },
                            {
                                text: "Centro $(3, -2)$ e raio $25$",
                                isCorrect: false,
                            },
                            {
                                text: "Centro $(-3, 2)$ e raio $25$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A circunferência de centro $(2, -1)$ e raio $4$ tem equação:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(x - 2)^2 + (y + 1)^2 = 16$",
                                isCorrect: true,
                            },
                            {
                                text: "$(x - 2)^2 + (y + 1)^2 = 4$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x + 2)^2 + (y - 1)^2 = 16$",
                                isCorrect: false,
                            },
                            {
                                text: "$(x - 2)^2 + (y - 1)^2 = 16$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Completando quadrados em $x^2 + y^2 - 6x + 4y - 12 = 0$, o centro e o raio são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Centro $(3, -2)$ e raio $5$",
                                isCorrect: true,
                            },
                            {
                                text: "Centro $(-3, 2)$ e raio $5$",
                                isCorrect: false,
                            },
                            {
                                text: "Centro $(3, -2)$ e raio $25$",
                                isCorrect: false,
                            },
                            {
                                text: "Centro $(6, -4)$ e raio $5$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A equação $x^2 + y^2 - 10x + 16 = 0$ representa a circunferência de:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Centro $(5, 0)$ e raio $3$",
                                isCorrect: true,
                            },
                            {
                                text: "Centro $(-5, 0)$ e raio $3$",
                                isCorrect: false,
                            },
                            {
                                text: "Centro $(5, 0)$ e raio $9$",
                                isCorrect: false,
                            },
                            {
                                text: "Centro $(10, 0)$ e raio $3$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que valor de $k$ a equação $x^2 + y^2 - 4x + 2y + k = 0$ representa uma circunferência de raio $4$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$k = -11$",
                                isCorrect: true,
                            },
                            {
                                text: "$k = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = -16$",
                                isCorrect: false,
                            },
                            {
                                text: "$k = 21$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "A elipse",
                blocks: [
                    {
                        type: "text",
                        value: "# A elipse\n\nA elipse é a cônica que aparece quando inclinamos o plano de corte no cone, sem chegar a cortá-lo de lado a lado. Do ponto de vista da Geometria Analítica, ela nasce de uma condição sobre **duas** distâncias, não apenas uma.\n\nUma **elipse** é o conjunto dos pontos do plano cuja soma das distâncias a dois pontos fixos é constante. Os pontos fixos são os **focos** $F_1$ e $F_2$, e a soma constante costuma ser escrita como $2a$. Se você prender um barbante nos dois focos e esticá-lo com a ponta de um lápis, a curva que o lápis desenha é exatamente uma elipse.",
                    },
                    {
                        type: "text",
                        value: "## A equação reduzida\n\nCom o centro na origem e os focos sobre o eixo $x$, a condição da soma constante se traduz na equação reduzida\n\n$$\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1, \\quad a > b > 0$$\n\nAqui $a$ é o semieixo maior e $b$ é o semieixo menor. Quando os focos estão sobre o eixo $y$, os papéis dos denominadores se invertem e a equação fica $\\frac{x^2}{b^2} + \\frac{y^2}{a^2} = 1$, com o maior denominador $a^2$ sempre embaixo da variável do eixo que contém os focos.\n\nA distância do centro a cada foco é $c$, e vale a relação fundamental $c^2 = a^2 - b^2$. Guarde bem esse sinal de menos: ele é o que distingue a elipse da hipérbole.",
                    },
                    {
                        type: "text",
                        value: "## Os elementos\n\nTomando a elipse com focos no eixo $x$, os elementos são:\n\nO **centro** é a origem $(0, 0)$. Os **vértices** sobre o eixo maior são $(\\pm a, 0)$, e as extremidades do eixo menor são $(0, \\pm b)$. Os **focos** ficam em $(\\pm c, 0)$. O **eixo maior** mede $2a$, o **eixo menor** mede $2b$ e a **distância focal** vale $2c$.\n\nA **excentricidade** mede o quanto a elipse é achatada e é definida por $e = \\frac{c}{a}$, com $0 < e < 1$. Quando $e$ se aproxima de zero, a elipse fica quase circular; quando $e$ se aproxima de $1$, ela fica bem alongada.",
                    },
                    {
                        type: "text",
                        value: "## Elementos nas duas orientações\n\nA tabela reúne os elementos conforme o eixo maior esteja sobre $x$ ou sobre $y$, sempre com $a > b$ e $c^2 = a^2 - b^2$.\n\n| Elemento | Eixo maior em $x$ | Eixo maior em $y$ |\n| --- | --- | --- |\n| Equação | $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ | $\\frac{x^2}{b^2} + \\frac{y^2}{a^2} = 1$ |\n| Vértices | $(\\pm a, 0)$ | $(0, \\pm a)$ |\n| Focos | $(\\pm c, 0)$ | $(0, \\pm c)$ |\n| Excentricidade | $e = \\frac{c}{a}$ | $e = \\frac{c}{a}$ |",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: extraindo os elementos\n\nSeja a elipse $\\frac{x^2}{25} + \\frac{y^2}{9} = 1$. Como o maior denominador está sob $x^2$, o eixo maior é horizontal.\n\nTemos $a^2 = 25$, logo $a = 5$, e $b^2 = 9$, logo $b = 3$. Pela relação $c^2 = a^2 - b^2 = 25 - 9 = 16$, obtemos $c = 4$.\n\nAssim, os vértices são $(\\pm 5, 0)$, as extremidades do eixo menor são $(0, \\pm 3)$ e os focos são $(\\pm 4, 0)$. A excentricidade vale $e = \\frac{c}{a} = \\frac{4}{5} = 0{,}8$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: montando a equação\n\nQueremos a equação de uma elipse com focos $(\\pm 3, 0)$ e semieixo maior $a = 5$.\n\nOs focos estão no eixo $x$, então o eixo maior é horizontal e $c = 3$. Da relação $c^2 = a^2 - b^2$ isolamos $b^2 = a^2 - c^2 = 25 - 9 = 16$.\n\nSubstituindo $a^2 = 25$ e $b^2 = 16$ na forma reduzida, a equação é\n\n$$\\frac{x^2}{25} + \\frac{y^2}{16} = 1$$",
                    },
                    {
                        type: "quote",
                        value: "Uma elipse depende de duas âncoras: some as distâncias aos dois focos e o total nunca muda, por mais que o ponto passeie pela curva.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nA elipse é o lugar dos pontos cuja soma das distâncias a dois focos é constante e igual a $2a$. Na forma reduzida $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$, o semieixo maior é $a$, o menor é $b$ e a distância focal vem de $c^2 = a^2 - b^2$. Vértices, focos e excentricidade $e = \\frac{c}{a}$ se leem diretamente desses três números. O eixo maior acompanha o maior denominador, e a relação com o sinal de menos é o que separa a elipse da hipérbole que veremos adiante.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Na elipse $\\frac{x^2}{25} + \\frac{y^2}{9} = 1$, os semieixos valem:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$a = 5$ e $b = 3$",
                                isCorrect: true,
                            },
                            {
                                text: "$a = 25$ e $b = 9$",
                                isCorrect: false,
                            },
                            {
                                text: "$a = 3$ e $b = 5$",
                                isCorrect: false,
                            },
                            {
                                text: "$a = 9$ e $b = 25$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Os focos da elipse $\\frac{x^2}{25} + \\frac{y^2}{9} = 1$ são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(\\pm 4, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(0, \\pm 4)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(\\pm \\sqrt{34}, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(\\pm 16, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A excentricidade de uma elipse com $a = 5$ e $c = 4$ é:",
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
                                text: "$\\frac{3}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{4}{3}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na elipse $\\frac{x^2}{9} + \\frac{y^2}{25} = 1$, o eixo maior está sobre:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "o eixo $y$, com vértices $(0, \\pm 5)$",
                                isCorrect: true,
                            },
                            {
                                text: "o eixo $x$, com vértices $(\\pm 5, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "o eixo $y$, com vértices $(0, \\pm 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "o eixo $x$, com vértices $(\\pm 3, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma elipse tem focos $(0, \\pm 3)$ e eixo maior de comprimento $10$. Sua equação é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{x^2}{16} + \\frac{y^2}{25} = 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{x^2}{25} + \\frac{y^2}{16} = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{x^2}{9} + \\frac{y^2}{25} = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{x^2}{34} + \\frac{y^2}{25} = 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "A parábola",
                blocks: [
                    {
                        type: "text",
                        value: "# A parábola\n\nA parábola é a cônica do equilíbrio perfeito entre um ponto e uma reta. Ela surge quando o plano de corte fica paralelo a uma geratriz do cone, e tem aplicações que vão das antenas às trajetórias de projéteis.\n\nUma **parábola** é o conjunto dos pontos do plano que estão à mesma distância de um ponto fixo e de uma reta fixa. O ponto fixo é o **foco** $F$ e a reta fixa é a **diretriz** $d$. Para cada ponto da curva, a distância até o foco é igual à distância até a diretriz.",
                    },
                    {
                        type: "text",
                        value: "## A equação reduzida\n\nCom o vértice na origem e o eixo de simetria sobre o eixo $x$, a igualdade de distâncias leva à equação reduzida\n\n$$y^2 = 4px$$\n\nO número $p$ é a distância do vértice ao foco (e também do vértice à diretriz). Se $p > 0$ a parábola abre para a direita; se $p < 0$, para a esquerda. Quando o eixo de simetria é o eixo $y$, a equação vira $x^2 = 4py$, abrindo para cima se $p > 0$ e para baixo se $p < 0$.\n\nDiferente da elipse, a parábola não tem centro. O coeficiente $4p$ também mede o comprimento da corda focal perpendicular ao eixo, conhecida como latus rectum.",
                    },
                    {
                        type: "text",
                        value: "## Os elementos\n\nTomando $y^2 = 4px$ com $p > 0$, temos: o **vértice** na origem $(0, 0)$; o **foco** em $(p, 0)$; a **diretriz** na reta vertical $x = -p$; e o **eixo de simetria** sobre o eixo $x$, isto é, a reta $y = 0$.\n\nO vértice fica sempre a meio caminho entre o foco e a diretriz, um de cada lado. Por isso, achar $p$ resolve a curva inteira: foco e diretriz ficam a uma distância $p$ do vértice, em direções opostas ao longo do eixo.",
                    },
                    {
                        type: "text",
                        value: "## As quatro orientações\n\nCom o vértice na origem e $p > 0$, a tabela mostra as quatro formas possíveis conforme a abertura.\n\n| Equação | Abertura | Foco | Diretriz |\n| --- | --- | --- | --- |\n| $y^2 = 4px$ | direita | $(p, 0)$ | $x = -p$ |\n| $y^2 = -4px$ | esquerda | $(-p, 0)$ | $x = p$ |\n| $x^2 = 4py$ | cima | $(0, p)$ | $y = -p$ |\n| $x^2 = -4py$ | baixo | $(0, -p)$ | $y = p$ |",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: lendo a equação\n\nConsidere a parábola $y^2 = 12x$. Como está na forma $y^2 = 4px$ com coeficiente positivo, ela abre para a direita.\n\nIgualando $4p = 12$, obtemos $p = 3$. Logo o vértice é $(0, 0)$, o foco é $(3, 0)$ e a diretriz é a reta $x = -3$. O eixo de simetria é o eixo $x$.\n\nUm erro comum é tomar o foco como $(12, 0)$, esquecendo de dividir o coeficiente por $4$. O valor que interessa é $p$, não $4p$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: montando a equação\n\nQueremos a parábola de vértice na origem e foco $(0, 2)$.\n\nO foco está sobre o eixo $y$, acima do vértice, então a parábola abre para cima e tem a forma $x^2 = 4py$. Como o foco é $(0, p)$, concluímos que $p = 2$.\n\nSubstituindo, $4p = 8$, e a equação fica\n\n$$x^2 = 8y$$\n\nA diretriz correspondente é a reta horizontal $y = -2$.",
                    },
                    {
                        type: "quote",
                        value: "Na parábola, foco e diretriz disputam cada ponto em pé de igualdade. A curva é o acordo exato entre um ponto fixo e uma reta fixa.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nA parábola é o lugar dos pontos equidistantes de um foco e de uma diretriz. Na forma reduzida $y^2 = 4px$ (eixo horizontal) ou $x^2 = 4py$ (eixo vertical), o número $p$ é a distância do vértice ao foco e determina tudo: o foco fica a uma distância $p$ do vértice e a diretriz, do lado oposto, à mesma distância. O sinal do coeficiente decide o lado da abertura, e o valor absoluto $4p$ é o comprimento do latus rectum. Ao contrário da elipse, a parábola não tem centro.",
                    },
                ],
                questions: [
                    {
                        statement: "O foco da parábola $y^2 = 12x$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(3, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(0, 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(12, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(-3, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A diretriz da parábola $y^2 = 12x$ é a reta:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$x = -3$",
                                isCorrect: true,
                            },
                            {
                                text: "$x = 3$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = -3$",
                                isCorrect: false,
                            },
                            {
                                text: "$x = -12$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A parábola de vértice na origem e foco $(0, 2)$ tem equação:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x^2 = 8y$",
                                isCorrect: true,
                            },
                            {
                                text: "$y^2 = 8x$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^2 = 2y$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^2 = 4y$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Sobre a parábola $x^2 = -8y$, é correto afirmar que ela:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "abre para baixo, com foco $(0, -2)$",
                                isCorrect: true,
                            },
                            {
                                text: "abre para cima, com foco $(0, 2)$",
                                isCorrect: false,
                            },
                            {
                                text: "abre para baixo, com foco $(0, -4)$",
                                isCorrect: false,
                            },
                            {
                                text: "abre para a esquerda, com foco $(-2, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A parábola de vértice na origem, com eixo sobre o eixo $x$, passa por $(2, 4)$. Sua equação é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$y^2 = 8x$",
                                isCorrect: true,
                            },
                            {
                                text: "$y^2 = 2x$",
                                isCorrect: false,
                            },
                            {
                                text: "$x^2 = 8y$",
                                isCorrect: false,
                            },
                            {
                                text: "$y^2 = 16x$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "A hipérbole",
                blocks: [
                    {
                        type: "text",
                        value: "# A hipérbole\n\nA hipérbole fecha o grupo das cônicas e é a única formada por dois ramos separados. Ela aparece quando o plano corta as duas folhas do cone. Sua definição lembra a da elipse, mas com uma troca decisiva: onde a elipse soma, a hipérbole subtrai.\n\nUma **hipérbole** é o conjunto dos pontos do plano cujo valor absoluto da diferença das distâncias a dois pontos fixos é constante. Os pontos fixos são os **focos** $F_1$ e $F_2$, e a diferença constante é escrita como $2a$. O módulo garante que os dois ramos, um perto de cada foco, entrem na mesma curva.",
                    },
                    {
                        type: "text",
                        value: "## A equação reduzida\n\nCom o centro na origem e os focos sobre o eixo $x$, a equação reduzida da hipérbole é\n\n$$\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$$\n\nO sinal de menos entre as frações é a marca registrada da hipérbole. Aqui $a$ é o semieixo real (ou transverso) e $b$ é o semieixo imaginário (ou conjugado). A distância do centro a cada foco é $c$, e vale a relação fundamental $c^2 = a^2 + b^2$.\n\nCompare com a elipse: lá tínhamos $c^2 = a^2 - b^2$; aqui é $c^2 = a^2 + b^2$. Na hipérbole, $a^2$ é sempre o denominador do termo **positivo**, mesmo que não seja o maior dos dois. Quando os focos estão no eixo $y$, a equação fica $\\frac{y^2}{a^2} - \\frac{x^2}{b^2} = 1$.",
                    },
                    {
                        type: "text",
                        value: "## Os elementos e as assíntotas\n\nPara $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$: o **centro** é a origem $(0, 0)$; os **vértices** são $(\\pm a, 0)$; os **focos** são $(\\pm c, 0)$. O eixo real mede $2a$ e o eixo conjugado mede $2b$.\n\nAs **assíntotas** são as retas às quais os ramos se aproximam sem tocar, dadas por $y = \\pm \\frac{b}{a} x$. A **excentricidade** é $e = \\frac{c}{a}$, sempre maior que $1$, já que $c > a$ nessa cônica. Quando os focos estão no eixo $y$, as assíntotas passam a ser $y = \\pm \\frac{a}{b} x$.",
                    },
                    {
                        type: "text",
                        value: "## Elementos nas duas orientações\n\nA tabela resume os elementos conforme o eixo real esteja sobre $x$ ou sobre $y$, sempre com $c^2 = a^2 + b^2$.\n\n| Elemento | Eixo real em $x$ | Eixo real em $y$ |\n| --- | --- | --- |\n| Equação | $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ | $\\frac{y^2}{a^2} - \\frac{x^2}{b^2} = 1$ |\n| Vértices | $(\\pm a, 0)$ | $(0, \\pm a)$ |\n| Focos | $(\\pm c, 0)$ | $(0, \\pm c)$ |\n| Assíntotas | $y = \\pm \\frac{b}{a} x$ | $y = \\pm \\frac{a}{b} x$ |",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: extraindo os elementos\n\nSeja a hipérbole $\\frac{x^2}{9} - \\frac{y^2}{16} = 1$. O termo positivo é o de $x$, então o eixo real é horizontal.\n\nTemos $a^2 = 9$, logo $a = 3$, e $b^2 = 16$, logo $b = 4$. Pela relação $c^2 = a^2 + b^2 = 9 + 16 = 25$, obtemos $c = 5$.\n\nPortanto, os vértices são $(\\pm 3, 0)$, os focos são $(\\pm 5, 0)$ e as assíntotas são $y = \\pm \\frac{4}{3} x$. A excentricidade vale $e = \\frac{c}{a} = \\frac{5}{3}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: montando a equação\n\nQueremos a hipérbole com focos $(\\pm 5, 0)$ e vértices $(\\pm 3, 0)$.\n\nOs focos e vértices estão no eixo $x$, então o eixo real é horizontal, $c = 5$ e $a = 3$. Da relação $c^2 = a^2 + b^2$ isolamos $b^2 = c^2 - a^2 = 25 - 9 = 16$.\n\nSubstituindo $a^2 = 9$ e $b^2 = 16$ na forma reduzida, a equação é\n\n$$\\frac{x^2}{9} - \\frac{y^2}{16} = 1$$",
                    },
                    {
                        type: "quote",
                        value: "A hipérbole troca a soma pela diferença. O que ela conserva não é quanto o ponto se afasta dos dois focos somados, e sim o contraste entre essas distâncias.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nA hipérbole é o lugar dos pontos cujo módulo da diferença das distâncias a dois focos é constante e igual a $2a$. Na forma reduzida $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$, o sinal de menos e a relação $c^2 = a^2 + b^2$ a distinguem da elipse. O semieixo real $a$ acompanha sempre o termo positivo; os vértices ficam a $a$ do centro, os focos a $c$, e os ramos seguem as assíntotas $y = \\pm \\frac{b}{a} x$. A excentricidade $e = \\frac{c}{a}$ é sempre maior que $1$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Os vértices da hipérbole $\\frac{x^2}{9} - \\frac{y^2}{16} = 1$ são:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$(\\pm 3, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(\\pm 4, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(0, \\pm 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(\\pm 5, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Os focos da hipérbole $\\frac{x^2}{9} - \\frac{y^2}{16} = 1$ são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(\\pm 5, 0)$",
                                isCorrect: true,
                            },
                            {
                                text: "$(0, \\pm 5)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(\\pm \\sqrt{7}, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(\\pm 25, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "As assíntotas da hipérbole $\\frac{x^2}{9} - \\frac{y^2}{16} = 1$ são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$y = \\pm \\frac{4}{3} x$",
                                isCorrect: true,
                            },
                            {
                                text: "$y = \\pm \\frac{3}{4} x$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = \\pm \\frac{4}{9} x$",
                                isCorrect: false,
                            },
                            {
                                text: "$y = \\pm \\frac{16}{9} x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Na hipérbole $\\frac{y^2}{16} - \\frac{x^2}{9} = 1$, o eixo real está sobre:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "o eixo $y$, com vértices $(0, \\pm 4)$",
                                isCorrect: true,
                            },
                            {
                                text: "o eixo $x$, com vértices $(\\pm 4, 0)$",
                                isCorrect: false,
                            },
                            {
                                text: "o eixo $y$, com vértices $(0, \\pm 3)$",
                                isCorrect: false,
                            },
                            {
                                text: "o eixo $x$, com vértices $(\\pm 3, 0)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma hipérbole tem focos $(\\pm 5, 0)$ e vértices $(\\pm 3, 0)$. Sua equação é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{x^2}{9} - \\frac{y^2}{16} = 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{x^2}{25} - \\frac{y^2}{16} = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{x^2}{9} - \\frac{y^2}{25} = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{x^2}{16} - \\frac{y^2}{9} = 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Identificando cônicas",
                blocks: [
                    {
                        type: "text",
                        value: "# Identificando cônicas\n\nNas aulas anteriores, cada cônica veio com nome e sobrenome. Na prática, porém, uma equação chega sem etiqueta, e o primeiro trabalho é descobrir de qual cônica se trata. Esta aula reúne as ferramentas para essa classificação.\n\nToda cônica pode ser escrita na forma geral do segundo grau\n\n$$Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0$$\n\nO termo $Bxy$ indica que a cônica está girada em relação aos eixos. Quando não há esse termo, isto é, quando $B = 0$, a cônica tem eixos paralelos aos eixos coordenados, e a classificação fica bem direta.",
                    },
                    {
                        type: "text",
                        value: "## Classificando pelos coeficientes de $x^2$ e $y^2$\n\nSuponha $B = 0$, de modo que a equação é $Ax^2 + Cy^2 + Dx + Ey + F = 0$. Comparando os coeficientes $A$ e $C$, temos quatro casos.\n\nSe $A = C$ (e ambos não nulos), a cônica é uma **circunferência**. Se $A$ e $C$ têm o mesmo sinal mas são diferentes, é uma **elipse**. Se $A$ e $C$ têm sinais opostos, é uma **hipérbole**. E se exatamente um deles é zero, sobra um único termo quadrático e a cônica é uma **parábola**.",
                    },
                    {
                        type: "text",
                        value: "## Tabela por sinais dos coeficientes\n\nAinda no caso $B = 0$, a tabela resume a regra prática.\n\n| Condição sobre $A$ e $C$ | Cônica |\n| --- | --- |\n| $A = C \\neq 0$ | circunferência |\n| mesmo sinal, com $A \\neq C$ | elipse |\n| sinais opostos | hipérbole |\n| exatamente um deles é zero | parábola |",
                    },
                    {
                        type: "text",
                        value: "## O discriminante $B^2 - 4AC$\n\nExiste um critério que funciona mesmo com o termo $Bxy$, útil quando a cônica está girada. Ele usa o **discriminante** $B^2 - 4AC$:\n\n| Valor de $B^2 - 4AC$ | Cônica |\n| --- | --- |\n| $B^2 - 4AC < 0$ | elipse (ou circunferência) |\n| $B^2 - 4AC = 0$ | parábola |\n| $B^2 - 4AC > 0$ | hipérbole |\n\nQuando $B = 0$, o discriminante vira $-4AC$, e o sinal passa a depender só do produto $AC$: produto positivo dá elipse, produto nulo dá parábola e produto negativo dá hipérbole. É a mesma regra da tabela anterior, escrita de outro jeito.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: completando quadrados\n\nClassifique $9x^2 + 4y^2 + 18x - 16y - 11 = 0$. Como $A = 9$ e $C = 4$ têm o mesmo sinal e são diferentes, já esperamos uma elipse. Vamos confirmar reduzindo a equação.\n\nAgrupando e colocando em evidência: $9(x^2 + 2x) + 4(y^2 - 4y) = 11$. Completando os quadrados, $9(x + 1)^2 - 9 + 4(y - 2)^2 - 16 = 11$, ou seja, $9(x + 1)^2 + 4(y - 2)^2 = 36$. Dividindo por $36$:\n\n$$\\frac{(x + 1)^2}{4} + \\frac{(y - 2)^2}{9} = 1$$\n\nÉ de fato uma elipse, de centro $(-1, 2)$ e eixo maior vertical.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: usando o discriminante\n\nClassifique $x^2 - 4y^2 - 4 = 0$. Aqui $A = 1$, $C = -4$ e $B = 0$, então $B^2 - 4AC = 0 - 4 \\cdot 1 \\cdot (-4) = 16 > 0$: é uma hipérbole. Reescrevendo, $\\frac{x^2}{4} - y^2 = 1$, o que confirma o resultado.\n\nVale um alerta sobre casos **degenerados**. Nem toda equação do segundo grau é uma cônica de verdade: $x^2 + y^2 = 0$ representa só o ponto $(0, 0)$; $x^2 - y^2 = 0$ representa o par de retas $y = \\pm x$; e $x^2 + y^2 = -1$ não tem ponto real algum. Por isso, quando o resultado parecer estranho, convém reduzir a equação até o fim.",
                    },
                    {
                        type: "quote",
                        value: "Antes de resolver, classifique. Saber se a equação esconde uma elipse, uma parábola ou uma hipérbole costuma poupar metade do trabalho.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\nUma cônica sem rotação aparece como $Ax^2 + Cy^2 + Dx + Ey + F = 0$. Comparando $A$ e $C$: iguais dão circunferência; mesmo sinal e diferentes dão elipse; sinais opostos dão hipérbole; um deles nulo dá parábola. O discriminante $B^2 - 4AC$ estende o critério para cônicas giradas: negativo indica elipse, nulo indica parábola e positivo indica hipérbole. Para localizar centro ou vértice, completamos quadrados, sempre atentos aos casos degenerados, em que a equação encolhe para um ponto, um par de retas ou o conjunto vazio.",
                    },
                ],
                questions: [
                    {
                        statement: "A equação $\\frac{x^2}{16} + \\frac{y^2}{9} = 1$ representa:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "uma elipse",
                                isCorrect: true,
                            },
                            {
                                text: "uma circunferência",
                                isCorrect: false,
                            },
                            {
                                text: "uma parábola",
                                isCorrect: false,
                            },
                            {
                                text: "uma hipérbole",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A equação $y^2 = 8x$ representa:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "uma parábola",
                                isCorrect: true,
                            },
                            {
                                text: "uma elipse",
                                isCorrect: false,
                            },
                            {
                                text: "uma hipérbole",
                                isCorrect: false,
                            },
                            {
                                text: "uma circunferência",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A equação $4x^2 - y^2 = 16$ representa:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "uma hipérbole",
                                isCorrect: true,
                            },
                            {
                                text: "uma elipse",
                                isCorrect: false,
                            },
                            {
                                text: "uma parábola",
                                isCorrect: false,
                            },
                            {
                                text: "uma circunferência",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Analisando os coeficientes, a equação $3x^2 + 3y^2 - 12 = 0$ representa:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "circunferência, pois $A = C$",
                                isCorrect: true,
                            },
                            {
                                text: "elipse, pois $A$ e $C$ têm o mesmo sinal e são diferentes",
                                isCorrect: false,
                            },
                            {
                                text: "hipérbole, pois $A$ e $C$ diferem",
                                isCorrect: false,
                            },
                            {
                                text: "parábola, pois falta um termo quadrático",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Reduzindo $9x^2 - 4y^2 - 54x + 8y + 113 = 0$, obtemos:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "uma hipérbole de centro $(3, 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "uma elipse de centro $(3, 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "uma hipérbole de centro $(-3, -1)$",
                                isCorrect: false,
                            },
                            {
                                text: "uma parábola de vértice $(3, 1)$",
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
    mesclarSolucoes(MODULOS, "geometria-analitica");
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
