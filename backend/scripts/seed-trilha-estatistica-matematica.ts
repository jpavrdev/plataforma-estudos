// Seed da trilha Estatística Matemática (probabilidade e estatística com rigor).
// Distinta da trilha "Estatística e Probabilidade" (mais aplicada, de Ciência de Dados).
// Conteúdo autoral, quiz-only, com fórmulas em LaTeX. Idempotente: se a trilha já
// tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-estatistica-matematica.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Estatística Matemática";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Probabilidade e estatística com rigor matemático, a teoria por trás dos dados: os axiomas de probabilidade e a combinatória, as variáveis aleatórias (discretas e contínuas) com esperança, variância e momentos, as principais distribuições (binomial, Poisson, uniforme, exponencial e normal), os vetores aleatórios (distribuição conjunta, covariância e independência), os teoremas limite (lei dos grandes números e teorema central do limite), a teoria da estimação (método dos momentos, máxima verossimilhança e intervalos de confiança) e os testes de hipóteses. O alicerce formal de estatística, ciência de dados e machine learning.";

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
        titulo: "Módulo 1 - Fundamentos de probabilidade",
        aulas: [
            {
                titulo: "Espaço amostral e eventos",
                blocks: [
                    {
                        type: "text",
                        value: "## Experimento aleatório e espaço amostral\n\nUm **experimento aleatório** é um procedimento cujo resultado não pode ser previsto com certeza, ainda que as condições de realização sejam conhecidas e o procedimento possa ser repetido. O conjunto de todos os resultados possíveis desse experimento é o **espaço amostral**, denotado por $\\Omega$.\n\nCada elemento $\\omega \\in \\Omega$ é chamado de **ponto amostral**, ou resultado elementar. O espaço amostral pode ser finito, infinito enumerável ou infinito não enumerável, e essa classificação orienta toda a construção teórica que vem a seguir.",
                    },
                    {
                        type: "text",
                        value: "## Eventos\n\nUm **evento** é qualquer subconjunto do espaço amostral, isto é, $A \\subseteq \\Omega$. Dizemos que o evento $A$ **ocorre** quando o resultado observado $\\omega$ pertence a $A$.\n\nDois eventos recebem nomes próprios. O **evento certo** é o próprio $\\Omega$, pois ocorre em qualquer realização do experimento. O **evento impossível** é o conjunto vazio $\\varnothing$, que nunca ocorre. Quando $A = \\{\\omega\\}$ é formado por um único ponto amostral, dizemos que $A$ é um **evento elementar**.",
                    },
                    {
                        type: "text",
                        value: "## Operações com eventos\n\nComo eventos são conjuntos, as operações da teoria de conjuntos ganham leitura probabilística direta. Sejam $A$ e $B$ eventos de $\\Omega$.\n\nA **união** $A \\cup B$ ocorre quando $A$ ocorre, ou $B$ ocorre, ou ambos. A **interseção** $A \\cap B$ ocorre quando $A$ e $B$ ocorrem ao mesmo tempo. O **complemento** $A^c = \\Omega \\setminus A$ ocorre exatamente quando $A$ não ocorre. A **diferença** $A \\setminus B = A \\cap B^c$ ocorre quando $A$ ocorre mas $B$ não.\n\nA inclusão $A \\subseteq B$ tem a leitura: a ocorrência de $A$ garante a ocorrência de $B$.",
                    },
                    {
                        type: "text",
                        value: "## Relações importantes\n\nDizemos que $A$ e $B$ são **mutuamente exclusivos**, ou disjuntos, quando não podem ocorrer juntos, isto é, $A \\cap B = \\varnothing$.\n\nUma coleção de eventos $A_1, A_2, \\ldots, A_n$ forma uma **partição** de $\\Omega$ quando é composta por eventos dois a dois disjuntos cuja união é o espaço todo:\n$$A_i \\cap A_j = \\varnothing \\quad (i \\neq j) \\qquad \\text{e} \\qquad \\bigcup_{i=1}^{n} A_i = \\Omega.$$\n\nAs **leis de De Morgan** conectam complemento, união e interseção:\n$$(A \\cup B)^c = A^c \\cap B^c, \\qquad (A \\cap B)^c = A^c \\cup B^c.$$",
                    },
                    {
                        type: "text",
                        value: "## A classe dos eventos: a $\\sigma$-álgebra\n\nEm espaços amostrais não enumeráveis nem sempre é possível atribuir probabilidade a todo subconjunto de $\\Omega$ de forma coerente. Por isso, no tratamento rigoroso, os eventos não são todos os subconjuntos, mas os elementos de uma família $\\mathcal{F}$ de subconjuntos de $\\Omega$ chamada **$\\sigma$-álgebra**, que satisfaz três condições.\n\nPrimeira: $\\Omega \\in \\mathcal{F}$. Segunda: se $A \\in \\mathcal{F}$, então $A^c \\in \\mathcal{F}$, ou seja, é fechada por complemento. Terceira: se $A_1, A_2, \\ldots \\in \\mathcal{F}$, então $\\bigcup_{i=1}^{\\infty} A_i \\in \\mathcal{F}$, isto é, é fechada por união enumerável.\n\nO par $(\\Omega, \\mathcal{F})$ é chamado **espaço mensurável**. Quando $\\Omega$ é finito ou enumerável, costuma-se tomar $\\mathcal{F} = 2^{\\Omega}$, o conjunto de todos os subconjuntos.",
                    },
                    {
                        type: "text",
                        value: '## Exemplo resolvido: lançamento de dois dados\n\nConsidere o lançamento simultâneo de dois dados honestos distinguíveis. O espaço amostral é\n$$\\Omega = \\{(i, j) : i, j \\in \\{1, 2, 3, 4, 5, 6\\}\\},$$\ncom $|\\Omega| = 36$ pontos amostrais. Seja $A$ o evento "a soma dos dados é $7$" e $B$ o evento "o primeiro dado é $6$". Então\n$$A = \\{(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)\\},$$\n$$B = \\{(6,1), (6,2), (6,3), (6,4), (6,5), (6,6)\\}.$$\nA interseção é $A \\cap B = \\{(6,1)\\}$, um único ponto amostral, pois só há uma forma de o primeiro dado ser $6$ e a soma ser $7$.',
                    },
                    {
                        type: "text",
                        value: '## Exemplo resolvido: descrevendo eventos por operações\n\nNo mesmo experimento dos dois dados, seja $C$ o evento "sai pelo menos um $6$". Chamando de $D_1$ o evento "o primeiro dado é $6$" e $D_2$ o evento "o segundo dado é $6$", temos $C = D_1 \\cup D_2$.\n\nO evento complementar "nenhum dado é $6$" pode ser escrito, pela lei de De Morgan, como\n$$C^c = (D_1 \\cup D_2)^c = D_1^c \\cap D_2^c,$$\nisto é, "o primeiro não é $6$ e o segundo não é $6$". Essa reescrita costuma simplificar contagens, porque o complementar em geral é mais fácil de enumerar do que o evento original.',
                    },
                    {
                        type: "quote",
                        value: "Descrever bem um evento como combinação de uniões, interseções e complementos é metade do trabalho; a probabilidade vem depois, quase de graça.",
                    },
                    {
                        type: "text",
                        value: '## Resumo\n\n- O **espaço amostral** $\\Omega$ reúne todos os resultados possíveis de um experimento aleatório, e cada resultado é um ponto amostral $\\omega$.\n- Um **evento** é um subconjunto de $\\Omega$; o próprio $\\Omega$ é o evento certo e $\\varnothing$ o impossível.\n- As operações $\\cup$, $\\cap$, complemento e $\\setminus$ traduzem "ou", "e", "não" e "mas não".\n- Eventos disjuntos satisfazem $A \\cap B = \\varnothing$, e uma **partição** cobre $\\Omega$ com disjuntos.\n- As leis de De Morgan, $(A \\cup B)^c = A^c \\cap B^c$, ligam as operações entre si.\n- No tratamento rigoroso, os eventos vivem numa **$\\sigma$-álgebra** $\\mathcal{F}$, e $(\\Omega, \\mathcal{F})$ é o espaço mensurável.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "No lançamento de um dado honesto de seis faces, qual é o espaço amostral $\\Omega$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\{0, 1, 2, 3, 4, 5\\}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\{1, 2, 3, 4, 5, 6\\}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\{1, 2, 3, 4, 5\\}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\{2, 4, 6\\}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $\\Omega = \\{1, 2, 3, 4, 5, 6\\}$ e $A = \\{2, 4, 6\\}$. O evento complementar $A^c$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\{2, 4, 6\\}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\{1, 2, 3, 4, 5, 6\\}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\{1, 3, 5\\}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\varnothing$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Pela lei de De Morgan, o evento $(A \\cup B)^c$ é igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$A^c \\cup B^c$",
                                isCorrect: false,
                            },
                            {
                                text: "$A \\cap B$",
                                isCorrect: false,
                            },
                            {
                                text: "$A^c \\cup B$",
                                isCorrect: false,
                            },
                            {
                                text: "$A^c \\cap B^c$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "Dois eventos $A$ e $B$ são mutuamente exclusivos quando:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$A \\cup B = \\Omega$",
                                isCorrect: false,
                            },
                            {
                                text: "$A \\cap B = \\varnothing$",
                                isCorrect: true,
                            },
                            {
                                text: "$A \\cap B = \\Omega$",
                                isCorrect: false,
                            },
                            {
                                text: "$A = B$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No experimento com dois eventos $A$ e $B$, o evento 'ocorre exatamente um dos dois' é descrito por:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$(A \\cap B) \\cup (A^c \\cap B^c)$",
                                isCorrect: false,
                            },
                            {
                                text: "$A \\cup B$",
                                isCorrect: false,
                            },
                            {
                                text: "$(A \\cap B^c) \\cup (A^c \\cap B)$",
                                isCorrect: true,
                            },
                            {
                                text: "$A \\cap B$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Axiomas e propriedades da probabilidade",
                blocks: [
                    {
                        type: "text",
                        value: '## A função de probabilidade\n\nDado um espaço mensurável $(\\Omega, \\mathcal{F})$, uma **medida de probabilidade** é uma função\n$$P : \\mathcal{F} \\to [0, 1]$$\nque associa a cada evento um número, sua probabilidade, respeitando três exigências mínimas. Essas exigências, propostas por Kolmogorov em 1933, são a base axiomática de toda a teoria: nada é dito sobre "chances" de modo intuitivo, tudo decorre dos axiomas. A tripla $(\\Omega, \\mathcal{F}, P)$ é o **espaço de probabilidade**.',
                    },
                    {
                        type: "text",
                        value: "## Os axiomas de Kolmogorov\n\n**Axioma 1 (não negatividade).** Para todo evento $A \\in \\mathcal{F}$, vale $P(A) \\ge 0$.\n\n**Axioma 2 (normalização).** A probabilidade do evento certo é $P(\\Omega) = 1$.\n\n**Axioma 3 ($\\sigma$-aditividade).** Para toda sequência $A_1, A_2, \\ldots$ de eventos dois a dois disjuntos,\n$$P\\!\\left(\\bigcup_{i=1}^{\\infty} A_i\\right) = \\sum_{i=1}^{\\infty} P(A_i).$$\n\nO terceiro axioma, formulado para uniões enumeráveis, é o que dá poder à teoria em espaços infinitos. Dele se obtém, como caso particular, a aditividade finita, e ainda a continuidade da probabilidade em sequências monótonas de eventos.",
                    },
                    {
                        type: "text",
                        value: "## Primeiras propriedades\n\nA partir dos axiomas deduzem-se, sem apelar à intuição, as propriedades operacionais.\n\n**Probabilidade do vazio.** Tomando todos os $A_i = \\varnothing$ no Axioma 3, conclui-se que $P(\\varnothing) = 0$.\n\n**Aditividade finita.** Se $A_1, \\ldots, A_n$ são disjuntos dois a dois, então $P\\!\\left(\\bigcup_{i=1}^{n} A_i\\right) = \\sum_{i=1}^{n} P(A_i)$.\n\n**Regra do complemento.** Como $A$ e $A^c$ são disjuntos e $A \\cup A^c = \\Omega$, segue que $P(A^c) = 1 - P(A)$. Em particular, $0 \\le P(A) \\le 1$ para todo evento.",
                    },
                    {
                        type: "text",
                        value: "## Monotonicidade, adição e a cota da união\n\n**Monotonicidade.** Se $A \\subseteq B$, então $P(A) \\le P(B)$. De fato, $B = A \\cup (B \\cap A^c)$ é união disjunta, logo $P(B) = P(A) + P(B \\cap A^c) \\ge P(A)$.\n\n**Regra da adição (inclusão-exclusão).** Para eventos quaisquer $A$ e $B$, não necessariamente disjuntos,\n$$P(A \\cup B) = P(A) + P(B) - P(A \\cap B),$$\nem que o termo $-P(A \\cap B)$ corrige a dupla contagem da região comum. Para três eventos,\n$$P(A \\cup B \\cup C) = P(A) + P(B) + P(C) - P(A \\cap B) - P(A \\cap C) - P(B \\cap C) + P(A \\cap B \\cap C).$$\n\n**Desigualdade de Boole.** Como toda interseção tem probabilidade não negativa, a regra da adição implica a cota da união $P\\!\\left(\\bigcup_{i=1}^{n} A_i\\right) \\le \\sum_{i=1}^{n} P(A_i)$, válida mesmo quando os eventos se sobrepõem.",
                    },
                    {
                        type: "text",
                        value: "## O modelo clássico\n\nQuando $\\Omega$ é finito e há razões de simetria para supor todos os pontos amostrais igualmente prováveis, cada resultado tem probabilidade $1/|\\Omega|$, e para qualquer evento $A$,\n$$P(A) = \\frac{|A|}{|\\Omega|},$$\nisto é, a razão entre o número de casos favoráveis a $A$ e o número de casos possíveis. Esse é o **modelo clássico** de Laplace, que reduz o cálculo de probabilidades a um problema de **contagem**, tema da próxima aula. Atenção: a fórmula só vale sob equiprobabilidade, hipótese que precisa ser justificada, não presumida.",
                    },
                    {
                        type: "text",
                        value: '## Exemplo resolvido: aplicando a regra da adição\n\nSorteia-se ao acaso uma carta de um baralho de $52$ cartas. Seja $A$ o evento "a carta é de copas" e $B$ o evento "a carta é uma figura" (valete, dama ou rei). Há $13$ cartas de copas, $12$ figuras e $3$ figuras de copas. Pelo modelo clássico, $P(A) = \\frac{13}{52}$, $P(B) = \\frac{12}{52}$ e $P(A \\cap B) = \\frac{3}{52}$.\n\nA probabilidade de a carta ser de copas ou figura é\n$$P(A \\cup B) = \\frac{13}{52} + \\frac{12}{52} - \\frac{3}{52} = \\frac{22}{52} = \\frac{11}{26}.$$\nSomar $13 + 12$ sem descontar as $3$ figuras de copas contaria essas cartas duas vezes.',
                    },
                    {
                        type: "text",
                        value: '## Exemplo resolvido: usando o complemento\n\nLançam-se três moedas honestas. Qual a probabilidade de sair **pelo menos uma** cara? O espaço tem $|\\Omega| = 2^3 = 8$ resultados igualmente prováveis.\n\nEm vez de somar os casos com uma, duas e três caras, é mais rápido usar o complemento. O evento complementar de "pelo menos uma cara" é "nenhuma cara", que ocorre num único resultado, logo $P(\\text{nenhuma cara}) = \\frac{1}{8}$. Portanto,\n$$P(\\text{pelo menos uma cara}) = 1 - \\frac{1}{8} = \\frac{7}{8}.$$',
                    },
                    {
                        type: "quote",
                        value: "Nos axiomas de Kolmogorov, a probabilidade deixa de ser uma opinião sobre o acaso e passa a ser consequência lógica de três regras.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma **probabilidade** é uma função $P : \\mathcal{F} \\to [0,1]$ que cumpre três axiomas: não negatividade, $P(\\Omega) = 1$ e $\\sigma$-aditividade.\n- Deles decorrem $P(\\varnothing) = 0$, $P(A^c) = 1 - P(A)$ e a monotonicidade $A \\subseteq B \\Rightarrow P(A) \\le P(B)$.\n- A **regra da adição** é $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$; para disjuntos, o último termo desaparece.\n- A **desigualdade de Boole** limita a probabilidade de uma união pela soma das probabilidades.\n- No **modelo clássico**, $P(A) = |A|/|\\Omega|$ sob equiprobabilidade, ligando probabilidade a contagem.",
                    },
                ],
                questions: [
                    {
                        statement: "Se $P(A) = 0{,}3$, então $P(A^c)$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$0{,}7$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}3$",
                                isCorrect: false,
                            },
                            {
                                text: "$1{,}3$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual das afirmações abaixo é um dos axiomas de Kolmogorov?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$P(\\varnothing) = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$P(\\Omega) = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$P(A) \\le 0$ para todo evento $A$",
                                isCorrect: false,
                            },
                            {
                                text: "$P(\\Omega) = 1$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $P(A) = 0{,}5$, $P(B) = 0{,}4$ e $P(A \\cap B) = 0{,}2$. Então $P(A \\cup B)$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0{,}9$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}7$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}2$",
                                isCorrect: false,
                            },
                            {
                                text: "$1{,}1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $P(A) = 0{,}6$, $P(B) = 0{,}5$ e $P(A \\cup B) = 0{,}9$. Então $P(A \\cap B)$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1{,}1$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}4$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}2$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $P(A) = 0{,}4$, $P(B) = 0{,}3$ e $P(A \\cap B) = 0{,}1$. Qual é $P(A^c \\cap B^c)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$0{,}6$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}2$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}9$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}4$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Contagem e combinatória",
                blocks: [
                    {
                        type: "text",
                        value: '## Princípios da contagem\n\nO modelo clássico reduz probabilidades a contar casos, e a contagem se apoia em dois princípios.\n\n**Princípio multiplicativo.** Se uma tarefa se decompõe em etapas sucessivas, a primeira com $n_1$ possibilidades, a segunda com $n_2$, e assim por diante até a $k$-ésima com $n_k$, então o número total de resultados é\n$$n_1 \\cdot n_2 \\cdots n_k.$$\n\n**Princípio aditivo.** Se uma tarefa pode ser realizada por um entre dois modos mutuamente exclusivos, com $n_1$ e $n_2$ possibilidades, o total é $n_1 + n_2$. Multiplicamos etapas encadeadas ("e"); somamos alternativas excludentes ("ou").',
                    },
                    {
                        type: "text",
                        value: "## Permutações\n\nUma **permutação** de $n$ objetos distintos é uma ordenação desses objetos em fila. Pela regra multiplicativa, há $n$ escolhas para a primeira posição, $n - 1$ para a segunda, e assim por diante, o que resulta em\n$$P_n = n! = n \\cdot (n-1) \\cdot (n-2) \\cdots 2 \\cdot 1,$$\ncom a convenção $0! = 1$. Por exemplo, as letras $A$, $B$ e $C$ admitem $3! = 6$ ordenações distintas.",
                    },
                    {
                        type: "text",
                        value: "## Arranjos\n\nUm **arranjo** de $k$ objetos tomados entre $n$ distintos é uma escolha **ordenada** de $k$ deles, sem repetição. Há $n$ modos de escolher o primeiro, $n - 1$ o segundo, até $n - k + 1$ para o $k$-ésimo:\n$$A_{n,k} = n \\cdot (n-1) \\cdots (n-k+1) = \\frac{n!}{(n-k)!}.$$\nA ordem importa: as sequências $(A, B)$ e $(B, A)$ são arranjos diferentes. O caso $k = n$ recupera as permutações, pois $A_{n,n} = n!$.",
                    },
                    {
                        type: "text",
                        value: '## Combinações\n\nUma **combinação** de $k$ objetos tomados entre $n$ distintos é uma escolha **não ordenada**, isto é, um subconjunto de tamanho $k$. Como cada subconjunto de $k$ elementos pode ser ordenado de $k!$ maneiras, dividimos o número de arranjos por $k!$:\n$$\\binom{n}{k} = \\frac{A_{n,k}}{k!} = \\frac{n!}{k!\\,(n-k)!}.$$\nO símbolo $\\binom{n}{k}$ lê-se "combinação de $n$, $k$ a $k$", ou coeficiente binomial. A distinção central de toda a combinatória é esta: arranjo quando a ordem importa, combinação quando não importa.',
                    },
                    {
                        type: "text",
                        value: "## Quando há repetição\n\n**Permutações com elementos repetidos.** Se entre os $n$ objetos há grupos indistinguíveis com $n_1, n_2, \\ldots, n_r$ repetições, com $n_1 + \\cdots + n_r = n$, o número de ordenações distintas cai para\n$$\\frac{n!}{n_1!\\,n_2! \\cdots n_r!}.$$\n\n**Combinações com repetição.** O número de formas de escolher $k$ objetos entre $n$ tipos, permitindo repetir e sem importar a ordem, é\n$$\\binom{n + k - 1}{k}.$$",
                    },
                    {
                        type: "text",
                        value: "## Propriedades do coeficiente binomial\n\nOs coeficientes binomiais satisfazem identidades úteis. A **simetria** $\\binom{n}{k} = \\binom{n}{n-k}$ vale porque escolher quem entra equivale a escolher quem fica de fora. A **relação de Pascal** é $\\binom{n}{k} = \\binom{n-1}{k-1} + \\binom{n-1}{k}$.\n\nO **teorema binomial** organiza esses coeficientes numa única identidade:\n$$(x + y)^n = \\sum_{k=0}^{n} \\binom{n}{k} x^k y^{n-k}.$$\nFazendo $x = y = 1$, obtém-se $\\sum_{k=0}^{n} \\binom{n}{k} = 2^n$, que é o total de subconjuntos de um conjunto com $n$ elementos.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: probabilidade por contagem\n\nDe um grupo de $10$ pessoas, sendo $4$ mulheres e $6$ homens, sorteia-se ao acaso uma comissão de $3$ pessoas. Qual a probabilidade de a comissão ter exatamente $2$ mulheres?\n\nO número de comissões possíveis é $\\binom{10}{3} = 120$. As comissões com exatamente $2$ mulheres escolhem $2$ das $4$ mulheres e $1$ dos $6$ homens:\n$$\\binom{4}{2} \\cdot \\binom{6}{1} = 6 \\cdot 6 = 36.$$\nComo todas as comissões são igualmente prováveis,\n$$P = \\frac{36}{120} = \\frac{3}{10}.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: arranjo contra combinação\n\nUma senha de $3$ dígitos distintos é formada com os algarismos de $1$ a $9$. Quantas senhas existem, e quantos são os subconjuntos de $3$ algarismos possíveis?\n\nComo a ordem dos dígitos importa na senha, contamos arranjos:\n$$A_{9,3} = 9 \\cdot 8 \\cdot 7 = 504.$$\nJá o número de conjuntos de $3$ algarismos, em que a ordem não importa, é uma combinação:\n$$\\binom{9}{3} = \\frac{9 \\cdot 8 \\cdot 7}{3!} = 84.$$\nA razão entre os dois resultados é exatamente $3! = 6$, o número de ordenações de cada trio.",
                    },
                    {
                        type: "text",
                        value: '## Resumo\n\n- O **princípio multiplicativo** combina etapas encadeadas; o **aditivo**, alternativas excludentes.\n- **Permutações** ordenam $n$ objetos: $n!$. **Arranjos** ordenam $k$ entre $n$: $A_{n,k} = \\frac{n!}{(n-k)!}$.\n- **Combinações** escolhem $k$ entre $n$ sem ordem: $\\binom{n}{k} = \\frac{n!}{k!\\,(n-k)!}$.\n- A pergunta decisiva é sempre "a ordem importa?". Se sim, arranjo; se não, combinação.\n- Coeficientes binomiais são simétricos, obedecem à relação de Pascal e somam $2^n$.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "De quantas maneiras distintas $5$ pessoas podem ser dispostas em uma fila?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$120$",
                                isCorrect: true,
                            },
                            {
                                text: "$25$",
                                isCorrect: false,
                            },
                            {
                                text: "$5$",
                                isCorrect: false,
                            },
                            {
                                text: "$3125$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quanto vale $\\binom{5}{2}$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$20$",
                                isCorrect: false,
                            },
                            {
                                text: "$10$",
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
                        ],
                    },
                    {
                        statement:
                            "De um grupo de $8$ pessoas, quantas comissões de $3$ membros, sem cargos definidos, podem ser formadas?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$336$",
                                isCorrect: false,
                            },
                            {
                                text: "$512$",
                                isCorrect: false,
                            },
                            {
                                text: "$56$",
                                isCorrect: true,
                            },
                            {
                                text: "$24$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "De quantas formas podemos escolher, entre $8$ candidatos, um presidente, um vice e um secretário, todos com cargos distintos?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$336$",
                                isCorrect: true,
                            },
                            {
                                text: "$56$",
                                isCorrect: false,
                            },
                            {
                                text: "$24$",
                                isCorrect: false,
                            },
                            {
                                text: "$512$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quantos anagramas distintos possui a palavra $ARARA$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$120$",
                                isCorrect: false,
                            },
                            {
                                text: "$10$",
                                isCorrect: true,
                            },
                            {
                                text: "$60$",
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
                titulo: "Probabilidade condicional",
                blocks: [
                    {
                        type: "text",
                        value: "## Probabilidade condicional\n\nMuitas vezes recebemos uma informação parcial sobre o resultado de um experimento e queremos atualizar a probabilidade de um evento à luz dela. A **probabilidade condicional de $A$ dado $B$**, definida quando $P(B) > 0$, é\n$$P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}.$$\nA ideia é restringir o espaço amostral ao que se sabe ter ocorrido: sabendo que $B$ ocorreu, $B$ passa a fazer o papel de novo espaço, e medimos que fração dele também está em $A$. Quando $P(B) = 0$, a expressão fica indefinida e o condicionamento exige tratamento à parte.",
                    },
                    {
                        type: "text",
                        value: "## A condicional é uma probabilidade\n\nFixado um evento $B$ com $P(B) > 0$, a função $A \\mapsto P(A \\mid B)$ é, ela própria, uma medida de probabilidade sobre $(\\Omega, \\mathcal{F})$, pois satisfaz os três axiomas de Kolmogorov. Em particular,\n$$P(\\Omega \\mid B) = 1, \\qquad P(A^c \\mid B) = 1 - P(A \\mid B).$$\nIsso é mais do que uma curiosidade: garante que todas as regras já demonstradas, como complemento, adição e monotonicidade, continuam valendo quando tudo é condicionado ao mesmo evento $B$.",
                    },
                    {
                        type: "text",
                        value: "## Regra do produto\n\nIsolando a interseção na definição, obtém-se a **regra do produto**, também chamada regra da multiplicação:\n$$P(A \\cap B) = P(A \\mid B)\\, P(B) = P(B \\mid A)\\, P(A).$$\nEla é a ferramenta natural para experimentos em etapas, em que a probabilidade de cada estágio depende do anterior. Ao retirar cartas sem reposição, por exemplo, a probabilidade da segunda carta depende de qual foi a primeira.",
                    },
                    {
                        type: "text",
                        value: "## Regra da cadeia\n\nA regra do produto generaliza-se para vários eventos. Para $A_1, A_2, \\ldots, A_n$ com $P(A_1 \\cap \\cdots \\cap A_{n-1}) > 0$,\n$$P(A_1 \\cap \\cdots \\cap A_n) = P(A_1)\\, P(A_2 \\mid A_1)\\, P(A_3 \\mid A_1 \\cap A_2) \\cdots P(A_n \\mid A_1 \\cap \\cdots \\cap A_{n-1}).$$\nCada fator condiciona ao acúmulo dos anteriores. Essa **regra da cadeia** é o motor do cálculo de probabilidades em processos sequenciais.",
                    },
                    {
                        type: "text",
                        value: "## Lei da probabilidade total\n\nSeja $\\{B_1, B_2, \\ldots, B_n\\}$ uma **partição** de $\\Omega$ com $P(B_i) > 0$ para todo $i$. Como qualquer evento $A$ se decompõe em pedaços disjuntos $A \\cap B_i$, a $\\sigma$-aditividade combinada com a regra do produto fornece a **lei da probabilidade total**:\n$$P(A) = \\sum_{i=1}^{n} P(A \\cap B_i) = \\sum_{i=1}^{n} P(A \\mid B_i)\\, P(B_i).$$\nEla calcula a probabilidade de $A$ como uma média das probabilidades condicionais $P(A \\mid B_i)$, ponderada pelos pesos $P(B_i)$ de cada cenário da partição.",
                    },
                    {
                        type: "text",
                        value: '## Exemplo resolvido: condicional num dado\n\nLança-se um dado honesto. Seja $A$ o evento "o resultado é maior que $3$" e $B$ o evento "o resultado é par". Queremos $P(A \\mid B)$.\n\nTemos $B = \\{2, 4, 6\\}$, logo $P(B) = \\frac{3}{6}$. A interseção é $A \\cap B = \\{4, 6\\}$, com $P(A \\cap B) = \\frac{2}{6}$. Portanto,\n$$P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{2/6}{3/6} = \\frac{2}{3}.$$\nSem a informação de paridade, teríamos $P(A) = \\frac{3}{6} = \\frac{1}{2}$. Saber que o número é par elevou a probabilidade de ele ser maior que $3$.',
                    },
                    {
                        type: "text",
                        value: '## Exemplo resolvido: lei da probabilidade total\n\nUma fábrica usa duas máquinas. A máquina $I$ produz $60\\%$ das peças, com taxa de defeito de $2\\%$; a máquina $II$ produz os outros $40\\%$, com taxa de $5\\%$. Qual a probabilidade de uma peça retirada ao acaso ser defeituosa?\n\nSejam $B_1$ e $B_2$ os eventos "peça da máquina $I$" e "peça da máquina $II$", e $D$ o evento "peça defeituosa". Os dados são $P(B_1) = 0{,}6$, $P(B_2) = 0{,}4$, $P(D \\mid B_1) = 0{,}02$ e $P(D \\mid B_2) = 0{,}05$. Pela lei da probabilidade total,\n$$P(D) = P(D \\mid B_1) P(B_1) + P(D \\mid B_2) P(B_2) = 0{,}02 \\cdot 0{,}6 + 0{,}05 \\cdot 0{,}4 = 0{,}032.$$',
                    },
                    {
                        type: "quote",
                        value: "Condicionar é trocar de espaço amostral: o que era certeza vira o novo mundo, e tudo se remede lá dentro.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A **probabilidade condicional** é $P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}$, definida quando $P(B) > 0$.\n- Fixado $B$, a função $P(\\cdot \\mid B)$ é uma probabilidade legítima e herda todas as propriedades dos axiomas.\n- **Regra do produto:** $P(A \\cap B) = P(A \\mid B) P(B)$, com versão geral na **regra da cadeia**.\n- **Lei da probabilidade total:** numa partição $\\{B_i\\}$, vale $P(A) = \\sum_i P(A \\mid B_i) P(B_i)$.\n- Cuidado com a ordem: $P(A \\mid B)$ e $P(B \\mid A)$ são, em geral, diferentes.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Se $P(A \\cap B) = 0{,}2$ e $P(B) = 0{,}5$, então $P(A \\mid B)$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$0{,}4$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}1$",
                                isCorrect: false,
                            },
                            {
                                text: "$2{,}5$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}7$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $P(B) = 0{,}5$ e $P(A \\mid B) = 0{,}6$, então $P(A \\cap B)$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1{,}1$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}83$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}3$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}12$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Lança-se um dado honesto. Qual a probabilidade de o resultado ser maior que $3$, dado que saiu um número par?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{2}{3}$",
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
                        ],
                    },
                    {
                        statement:
                            "As máquinas $I$ e $II$ produzem, respectivamente, $60\\%$ e $40\\%$ das peças, com defeitos em $2\\%$ e $5\\%$ dos casos. Qual a probabilidade de uma peça tomada ao acaso ser defeituosa?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0{,}032$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}07$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}035$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}05$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma urna tem $4$ bolas brancas e $6$ pretas. Retiram-se $2$ bolas sem reposição. Qual a probabilidade de ambas serem brancas?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\frac{4}{25}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{2}{9}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{5}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{2}{15}$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Independência e o teorema de Bayes",
                blocks: [
                    {
                        type: "text",
                        value: "## Independência\n\nDois eventos $A$ e $B$ são **independentes** quando a ocorrência de um não altera a probabilidade do outro. Formalmente,\n$$P(A \\cap B) = P(A)\\, P(B).$$\nEssa é a definição, e ela é simétrica em $A$ e $B$. Quando $P(B) > 0$, a definição equivale a $P(A \\mid B) = P(A)$, que traduz literalmente a ideia de que saber da ocorrência de $B$ não muda a chance de $A$. A forma com produto é preferida por permanecer válida mesmo quando alguma probabilidade é nula.",
                    },
                    {
                        type: "text",
                        value: "## Independência não é exclusão mútua\n\nÉ um erro comum confundir eventos **independentes** com eventos **mutuamente exclusivos**. São ideias opostas em espírito.\n\nSe $A$ e $B$ são mutuamente exclusivos, então $A \\cap B = \\varnothing$ e $P(A \\cap B) = 0$. Se, além disso, $P(A) > 0$ e $P(B) > 0$, então $P(A) P(B) > 0$, que é diferente de $0 = P(A \\cap B)$; logo os eventos **não** são independentes.\n\nA intuição: no caso disjunto, saber que $A$ ocorreu informa que $B$ certamente não ocorreu, uma alteração drástica, o oposto de independência.",
                    },
                    {
                        type: "text",
                        value: "## Independência de vários eventos\n\nPara uma coleção $A_1, \\ldots, A_n$, exige-se mais do que independência aos pares. Os eventos são **mutuamente independentes** quando, para todo subconjunto de índices $\\{i_1, \\ldots, i_k\\}$,\n$$P(A_{i_1} \\cap \\cdots \\cap A_{i_k}) = P(A_{i_1}) \\cdots P(A_{i_k}).$$\nA independência **dois a dois**, que exige a igualdade apenas para os pares, é mais fraca: existem eventos dois a dois independentes que não são mutuamente independentes. A distinção importa em construções mais finas da teoria.",
                    },
                    {
                        type: "text",
                        value: "## O teorema de Bayes\n\nA regra do produto escreve $P(A \\cap B)$ de duas maneiras, $P(A \\mid B) P(B)$ e $P(B \\mid A) P(A)$. Igualando-as e isolando, obtém-se o **teorema de Bayes**:\n$$P(A \\mid B) = \\frac{P(B \\mid A)\\, P(A)}{P(B)}, \\qquad P(B) > 0.$$\nEle **inverte o condicionamento**: converte a condicional que se conhece, $P(B \\mid A)$, na que se deseja, $P(A \\mid B)$. Na linguagem da inferência, $P(A)$ é a probabilidade **a priori**, $P(A \\mid B)$ é a **a posteriori** e $P(B \\mid A)$ é a **verossimilhança**.",
                    },
                    {
                        type: "text",
                        value: "## Forma expandida\n\nQuando o denominador $P(B)$ não é dado diretamente, calcula-se por meio de uma partição $\\{A_1, \\ldots, A_n\\}$, usando a lei da probabilidade total. O teorema de Bayes assume então a forma\n$$P(A_j \\mid B) = \\frac{P(B \\mid A_j)\\, P(A_j)}{\\sum_{i=1}^{n} P(B \\mid A_i)\\, P(A_i)}.$$\nNo caso mais simples, com a partição em dois eventos $A$ e $A^c$,\n$$P(A \\mid B) = \\frac{P(B \\mid A)\\, P(A)}{P(B \\mid A)\\, P(A) + P(B \\mid A^c)\\, P(A^c)}.$$",
                    },
                    {
                        type: "text",
                        value: '## Exemplo resolvido: teste diagnóstico\n\nUma doença atinge $1\\%$ de certa população. Um teste detecta corretamente a doença em $99\\%$ dos doentes (sensibilidade) e dá negativo em $95\\%$ dos sadios, ou seja, acusa falso positivo em $5\\%$ deles. Se uma pessoa sorteada ao acaso testa positivo, qual a probabilidade de estar realmente doente?\n\nSeja $D$ o evento "doente" e $+$ o evento "teste positivo". Temos $P(D) = 0{,}01$, $P(+ \\mid D) = 0{,}99$ e $P(+ \\mid D^c) = 0{,}05$. O denominador, pela lei da probabilidade total, é\n$$P(+) = 0{,}99 \\cdot 0{,}01 + 0{,}05 \\cdot 0{,}99 = 0{,}0099 + 0{,}0495 = 0{,}0594.$$\nPelo teorema de Bayes,\n$$P(D \\mid +) = \\frac{0{,}99 \\cdot 0{,}01}{0{,}0594} = \\frac{0{,}0099}{0{,}0594} \\approx 0{,}167.$$\nApesar de o teste ser muito bom, a probabilidade de doença dado positivo é de apenas cerca de $17\\%$, porque a doença é rara. É o efeito da baixa probabilidade a priori sobre a leitura de um resultado positivo.',
                    },
                    {
                        type: "text",
                        value: '## Exemplo resolvido: verificando independência\n\nNo lançamento de dois dados honestos, seja $A$ o evento "o primeiro dado é $2$" e $B$ o evento "a soma é $7$". Esses eventos são independentes?\n\nTemos $P(A) = \\frac{6}{36} = \\frac{1}{6}$ e $P(B) = \\frac{6}{36} = \\frac{1}{6}$, pois há seis somas iguais a $7$. A interseção "primeiro dado $2$ e soma $7$" ocorre apenas em $(2, 5)$, logo $P(A \\cap B) = \\frac{1}{36}$. Comparando,\n$$P(A)\\, P(B) = \\frac{1}{6} \\cdot \\frac{1}{6} = \\frac{1}{36} = P(A \\cap B).$$\nComo o produto coincide com a probabilidade da interseção, $A$ e $B$ são independentes, um resultado que costuma surpreender a intuição.',
                    },
                    {
                        type: "quote",
                        value: "O teorema de Bayes não cria informação: ele apenas obriga a probabilidade a priori e a evidência a conversarem com honestidade.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $A$ e $B$ são **independentes** quando $P(A \\cap B) = P(A) P(B)$; se $P(B) > 0$, isso equivale a $P(A \\mid B) = P(A)$.\n- Independência **não** é exclusão mútua: eventos disjuntos com probabilidade positiva são dependentes.\n- A independência mútua de vários eventos exige a fatoração para **todo** subconjunto, mais forte que a independência aos pares.\n- **Teorema de Bayes:** $P(A \\mid B) = \\frac{P(B \\mid A) P(A)}{P(B)}$, invertendo o condicionamento.\n- Com o denominador via probabilidade total, Bayes combina a **a priori** e a **verossimilhança** na **a posteriori**.",
                    },
                ],
                questions: [
                    {
                        statement: "Dois eventos $A$ e $B$ são independentes quando:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$P(A \\cap B) = P(A)\\, P(B)$",
                                isCorrect: true,
                            },
                            {
                                text: "$P(A \\cap B) = P(A) + P(B)$",
                                isCorrect: false,
                            },
                            {
                                text: "$P(A \\cap B) = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$P(A \\cup B) = P(A)\\, P(B)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $A$ e $B$ são independentes com $P(A) = 0{,}5$ e $P(B) = 0{,}4$, então $P(A \\cap B)$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$0{,}9$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}2$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}1$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}45$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $P(A) = 0{,}3$, $P(B \\mid A) = 0{,}4$ e $P(B) = 0{,}2$. Pelo teorema de Bayes, $P(A \\mid B)$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0{,}6$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}12$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}4$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}27$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre eventos de probabilidade positiva, qual afirmação é verdadeira?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Eventos disjuntos são sempre independentes",
                                isCorrect: false,
                            },
                            {
                                text: "Independência é o mesmo que exclusão mútua",
                                isCorrect: false,
                            },
                            {
                                text: "Eventos disjuntos são dependentes",
                                isCorrect: true,
                            },
                            {
                                text: "Todo par de eventos é independente",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma doença atinge $1\\%$ da população. Um teste dá positivo em $99\\%$ dos doentes e em $5\\%$ dos sadios. Qual a probabilidade aproximada de uma pessoa estar doente, dado que testou positivo?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$0{,}99$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}17$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}50$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}05$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Variáveis aleatórias",
        aulas: [
            {
                titulo: "Variáveis aleatórias e função de distribuição",
                blocks: [
                    {
                        type: "text",
                        value: "## Variáveis aleatórias\n\nSeja $(\\Omega, \\mathcal{F}, P)$ um espaço de probabilidade, em que $\\Omega$ é o espaço amostral, $\\mathcal{F}$ é uma $\\sigma$-álgebra de eventos e $P$ é uma medida de probabilidade. Uma **variável aleatória** (VA) é uma função $X : \\Omega \\to \\mathbb{R}$ que a cada resultado $\\omega \\in \\Omega$ associa um número real $X(\\omega)$.\n\nA exigência central não é apenas que $X$ seja uma função, mas que ela seja **mensurável**: para todo $x \\in \\mathbb{R}$, o conjunto\n$$\\{\\omega \\in \\Omega : X(\\omega) \\le x\\}$$\ndeve pertencer a $\\mathcal{F}$. Só assim faz sentido perguntar pela probabilidade de que $X$ não ultrapasse um valor dado.",
                    },
                    {
                        type: "text",
                        value: "## Mensurabilidade e a $\\sigma$-álgebra de Borel\n\nA condição $\\{X \\le x\\} \\in \\mathcal{F}$ garante que possamos calcular $P(X \\le x)$ para qualquer $x$. Pode-se mostrar que ela equivale a exigir que a pré-imagem de qualquer conjunto de Borel seja um evento, isto é,\n$$X^{-1}(B) = \\{\\omega : X(\\omega) \\in B\\} \\in \\mathcal{F}, \\qquad \\forall\\, B \\in \\mathcal{B}(\\mathbb{R}),$$\nonde $\\mathcal{B}(\\mathbb{R})$ é a $\\sigma$-álgebra de Borel da reta, gerada pelos intervalos. Uma VA transporta, portanto, a estrutura de probabilidade de $\\Omega$ para a reta, induzindo uma nova medida $P_X(B) = P(X^{-1}(B))$, chamada **distribuição** ou **lei** de $X$.",
                    },
                    {
                        type: "quote",
                        value: "Uma variável aleatória não é aleatória nem variável: é uma função que traduz o acaso do espaço amostral para a linguagem dos números reais.",
                    },
                    {
                        type: "text",
                        value: "## Função de distribuição\n\nA maneira mais econômica de descrever a lei de $X$ é a **função de distribuição acumulada** (FDA), definida por\n$$F_X(x) = P(X \\le x) = P(\\{\\omega \\in \\Omega : X(\\omega) \\le x\\}), \\qquad x \\in \\mathbb{R}.$$\nEscrevemos apenas $F$ quando não houver ambiguidade. A FDA existe para toda variável aleatória, seja ela discreta, contínua ou mista, e por isso é o objeto unificador do estudo das distribuições.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades da FDA\n\nToda função de distribuição $F$ satisfaz três propriedades:\n\n1. **Monotonicidade:** se $a \\le b$, então $F(a) \\le F(b)$; ou seja, $F$ é não decrescente.\n2. **Limites nas pontas:** $\\lim_{x \\to -\\infty} F(x) = 0$ e $\\lim_{x \\to +\\infty} F(x) = 1$.\n3. **Continuidade à direita:** $\\lim_{x \\to a^+} F(x) = F(a)$ para todo $a$.\n\nReciprocamente, toda função com essas três propriedades é a FDA de alguma variável aleatória. Delas seguem duas identidades fundamentais:\n$$P(a < X \\le b) = F(b) - F(a), \\qquad P(X = a) = F(a) - F(a^-),$$\nem que $F(a^-) = \\lim_{x \\to a^-} F(x)$ é o limite pela esquerda. O tamanho do salto de $F$ em $a$ é exatamente a probabilidade concentrada no ponto $a$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: dado honesto\n\nSeja $X$ o resultado do lançamento de um dado honesto, com valores em $\\{1,2,3,4,5,6\\}$ e cada face com probabilidade $1/6$. A FDA é uma função em escada: vale $F(x) = 0$ para $x < 1$; vale $F(x) = k/6$ no intervalo $k \\le x < k+1$, com $k = 1,\\dots,5$; e vale $F(x) = 1$ para $x \\ge 6$.\n\nPara obter $P(2 < X \\le 5)$ aplicamos a identidade $P(a < X \\le b) = F(b) - F(a)$:\n$$P(2 < X \\le 5) = F(5) - F(2) = \\frac{5}{6} - \\frac{2}{6} = \\frac{1}{2}.$$\nO valor confere com a contagem direta, pois o evento é $X \\in \\{3,4,5\\}$, três faces em seis.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: uma distribuição mista\n\nConsidere $F(x) = 0$ para $x < 0$, $F(x) = \\tfrac{x}{2}$ para $0 \\le x < 1$ e $F(x) = 1$ para $x \\ge 1$. Essa função é não decrescente, tem os limites corretos e é contínua à direita, logo é uma FDA legítima.\n\nRepare que $F$ cresce continuamente em $[0,1)$ mas dá um salto em $x = 1$, pois\n$$F(1^-) = \\lim_{x \\to 1^-} \\frac{x}{2} = \\frac{1}{2}, \\qquad F(1) = 1.$$\nO salto revela um átomo de probabilidade: $P(X = 1) = F(1) - F(1^-) = 1 - \\tfrac{1}{2} = \\tfrac{1}{2}$. Metade da massa está espalhada continuamente em $[0,1)$ e a outra metade está concentrada no ponto $1$. Distribuições assim, nem puramente discretas nem puramente contínuas, mostram por que a FDA é a ferramenta unificadora.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma variável aleatória é uma função mensurável $X : \\Omega \\to \\mathbb{R}$, isto é, $\\{X \\le x\\} \\in \\mathcal{F}$ para todo $x$.\n- A lei de $X$ é resumida pela FDA $F(x) = P(X \\le x)$.\n- $F$ é não decrescente, contínua à direita e satisfaz $\\lim_{x\\to-\\infty}F(x)=0$ e $\\lim_{x\\to+\\infty}F(x)=1$.\n- $P(a < X \\le b) = F(b) - F(a)$ e $P(X = a) = F(a) - F(a^-)$; saltos de $F$ correspondem a massa pontual.\n- A FDA descreve qualquer VA, discreta, contínua ou mista, servindo de base para todo o módulo.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Para uma função de distribuição $F_X$, quanto vale $\\lim_{x \\to +\\infty} F_X(x)$?",
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
                                text: "$\\tfrac{1}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No lançamento de um dado honesto de FDA em escada, quanto vale $P(2 < X \\le 5) = F(5) - F(2)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\tfrac{1}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tfrac{2}{3}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tfrac{1}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\tfrac{5}{6}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em termos da FDA, a probabilidade $P(X = a)$ concentrada no ponto $a$ é dada por:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$F(a^-) - F(a)$",
                                isCorrect: false,
                            },
                            {
                                text: "$F(a) - F(a^-)$",
                                isCorrect: true,
                            },
                            {
                                text: "$F(a^+) - F(a)$",
                                isCorrect: false,
                            },
                            {
                                text: "$F(a)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Se a FDA $F$ é contínua no ponto $a$, então $P(X = a)$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$F(a)$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tfrac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $F(x) = 0$ para $x < 0$, $F(x) = x/2$ para $0 \\le x < 1$ e $F(x) = 1$ para $x \\ge 1$. Quanto vale $P(X = 1)$?",
                        difficulty: "dificil",
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
                                text: "$\\tfrac{1}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\tfrac{1}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Variáveis discretas e a função de probabilidade",
                blocks: [
                    {
                        type: "text",
                        value: "## Variáveis aleatórias discretas\n\nUma variável aleatória $X$ é **discreta** quando o conjunto de seus valores possíveis é finito ou infinito enumerável. Isto é, existe um conjunto $\\{x_1, x_2, x_3, \\dots\\}$, no máximo enumerável, tal que $P(X \\in \\{x_1, x_2, \\dots\\}) = 1$. Toda a massa de probabilidade está concentrada nesses pontos, e a FDA correspondente é uma função em escada, constante entre os valores e com saltos em cada $x_i$.",
                    },
                    {
                        type: "text",
                        value: "## Função de probabilidade\n\nA lei de uma VA discreta é descrita pela **função de probabilidade** (também chamada função massa de probabilidade, fmp),\n$$p(x) = P(X = x).$$\nEla é caracterizada por duas propriedades:\n\n1. **Não negatividade:** $p(x_i) \\ge 0$ para todo $i$, e $p(x) = 0$ fora do conjunto de valores.\n2. **Normalização:** $\\sum_i p(x_i) = 1$.\n\nQualquer função com essas duas propriedades define a lei de alguma variável aleatória discreta. Note a diferença essencial em relação à FDA: $p(x)$ é a probabilidade exata do ponto $x$, enquanto $F(x)$ acumula probabilidade até $x$.",
                    },
                    {
                        type: "text",
                        value: "## Da função de probabilidade para a FDA\n\nConhecida a fmp, a função de distribuição se obtém acumulando as massas:\n$$F(x) = P(X \\le x) = \\sum_{x_i \\le x} p(x_i).$$\nReciprocamente, o salto de $F$ em cada ponto recupera a fmp: $p(x_i) = F(x_i) - F(x_i^-)$. Confundir $p$ com $F$ é um erro comum: a fmp responde qual a chance de sair exatamente $x_i$, ao passo que a FDA responde qual a chance de sair no máximo $x$.",
                    },
                    {
                        type: "quote",
                        value: "A função de probabilidade responde a uma pergunta pontual; a função de distribuição responde a uma pergunta acumulada. Trocar uma pela outra é trocar o exato pelo até aqui.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: uma fmp em tabela\n\nConsidere $X$ com valores em $\\{1,2,3,4\\}$ e função de probabilidade $p(x) = \\dfrac{x}{10}$. Os valores são:\n\n| $x$ | $1$ | $2$ | $3$ | $4$ |\n|-----|-----|-----|-----|-----|\n| $p(x)$ | $0{,}1$ | $0{,}2$ | $0{,}3$ | $0{,}4$ |\n\nA soma das probabilidades é $0{,}1 + 0{,}2 + 0{,}3 + 0{,}4 = 1$, confirmando que $p$ é uma fmp válida. Usaremos essa mesma distribuição nas aulas de esperança e variância.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: achando a constante\n\nSuponha que $X$ assuma os valores $\\{1,2,3,4\\}$ com $p(x) = c\\,x$, para uma constante $c > 0$. Para que $p$ seja uma fmp legítima, impomos a normalização:\n$$\\sum_{x=1}^{4} c\\,x = c(1 + 2 + 3 + 4) = 10c = 1 \\;\\Longrightarrow\\; c = \\frac{1}{10}.$$\nCom isso, $p(1) = 0{,}1$, $p(2) = 0{,}2$, $p(3) = 0{,}3$ e $p(4) = 0{,}4$, recuperando a tabela anterior. O passo decisivo é sempre forçar a soma total a valer $1$.",
                    },
                    {
                        type: "text",
                        value: "## Modelos discretos fundamentais\n\nAlguns modelos aparecem repetidamente:\n\n- **Bernoulli$(p)$:** $X \\in \\{0,1\\}$ com $P(X=1) = p$ e $P(X=0) = 1-p$.\n- **Binomial$(n,p)$:** número de sucessos em $n$ ensaios independentes, $p(k) = \\binom{n}{k} p^k (1-p)^{n-k}$, para $k = 0,\\dots,n$.\n- **Poisson$(\\lambda)$:** contagens num intervalo fixo, $p(k) = e^{-\\lambda}\\dfrac{\\lambda^k}{k!}$, para $k = 0,1,2,\\dots$\n- **Geométrica$(p)$:** número de ensaios até o primeiro sucesso, $p(k) = (1-p)^{k-1}p$, para $k = 1,2,\\dots$\n\nEm todos, verifica-se que $\\sum_k p(k) = 1$, o que decorre respectivamente do binômio de Newton e das séries exponencial e geométrica.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: acumulando probabilidade\n\nAinda com $p(x) = x/10$ em $\\{1,2,3,4\\}$, calculemos $P(X \\le 2)$ e a FDA em alguns pontos. Acumulando:\n$$P(X \\le 2) = p(1) + p(2) = 0{,}1 + 0{,}2 = 0{,}3.$$\nDa mesma forma, $F(1) = 0{,}1$, $F(3) = 0{,}6$ e $F(4) = 1$. Entre dois valores consecutivos $F$ permanece constante; por exemplo, $F(2{,}7) = F(2) = 0{,}3$. Fica explícito o caráter em escada da FDA de uma VA discreta.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma VA discreta assume valores num conjunto enumerável, com toda a massa concentrada nesses pontos.\n- A função de probabilidade $p(x) = P(X = x)$ satisfaz $p(x) \\ge 0$ e $\\sum_i p(x_i) = 1$.\n- A FDA é a soma acumulada $F(x) = \\sum_{x_i \\le x} p(x_i)$, uma função em escada.\n- Normalizar, isto é, impor soma $1$, é o método para determinar constantes desconhecidas.\n- Bernoulli, binomial, Poisson e geométrica são os modelos discretos básicos.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Para a função de probabilidade $p$ de uma VA discreta com valores $\\{x_1, x_2, \\dots\\}$, quanto vale $\\sum_i p(x_i)$?",
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
                                text: "depende de $X$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $X$ assume os valores $\\{1,2,3,4\\}$ com $p(x) = c\\,x$, qual o valor de $c$ que torna $p$ uma fmp?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\tfrac{1}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tfrac{1}{10}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\tfrac{1}{16}$",
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
                            "Com $p(x) = x/10$ em $\\{1,2,3,4\\}$, quanto vale $P(X \\le 2)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0{,}1$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}2$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}6$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}3$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para uma VA discreta, a função de distribuição se relaciona com a fmp por:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$F(x) = \\sum_{x_i \\le x} p(x_i)$",
                                isCorrect: true,
                            },
                            {
                                text: "$F(x) = p(x)$",
                                isCorrect: false,
                            },
                            {
                                text: "$F(x) = \\int_{-\\infty}^{x} p(t)\\,dt$",
                                isCorrect: false,
                            },
                            {
                                text: "$F(x) = 1 - p(x)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $X$ com valores $\\{1,2,3,\\dots\\}$ e $p(x) = c\\,(1/3)^x$. Qual valor de $c$ normaliza a distribuição?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\tfrac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
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
                ],
            },
            {
                titulo: "Variáveis contínuas e a função densidade",
                blocks: [
                    {
                        type: "text",
                        value: "## Variáveis aleatórias contínuas\n\nUma variável aleatória $X$ é (absolutamente) **contínua** quando sua FDA pode ser escrita como a integral de uma função não negativa. Precisamente, existe $f \\ge 0$ tal que\n$$F(x) = \\int_{-\\infty}^{x} f(t)\\,dt, \\qquad x \\in \\mathbb{R}.$$\nNesse caso $F$ é contínua, sem saltos, de modo que não há massa concentrada em pontos isolados. Essa é a diferença estrutural em relação ao caso discreto: a probabilidade se distribui ao longo de um contínuo de valores.",
                    },
                    {
                        type: "text",
                        value: "## Função densidade de probabilidade\n\nA função $f$ acima é a **função densidade de probabilidade** (fdp) de $X$. Ela é caracterizada por:\n\n1. **Não negatividade:** $f(x) \\ge 0$ para todo $x$.\n2. **Normalização:** $\\int_{-\\infty}^{\\infty} f(x)\\,dx = 1$.\n\nÉ crucial não interpretar $f(x)$ como uma probabilidade. De fato, $f(x)$ pode ser maior que $1$; o que tem significado probabilístico é a área sob o gráfico. Em particular, para todo ponto $a$,\n$$P(X = a) = \\int_a^a f(x)\\,dx = 0.$$\nNum modelo contínuo, todo ponto individual tem probabilidade nula.",
                    },
                    {
                        type: "text",
                        value: "## Probabilidade como área\n\nA probabilidade de $X$ cair num intervalo é a área correspondente sob a densidade:\n$$P(a \\le X \\le b) = \\int_a^b f(x)\\,dx = F(b) - F(a).$$\nComo $P(X = a) = 0$, tanto faz usar desigualdades estritas ou não: $P(a \\le X \\le b) = P(a < X < b)$. Essa é outra distinção marcante frente ao caso discreto, em que incluir ou não os extremos altera o resultado.",
                    },
                    {
                        type: "quote",
                        value: "No mundo contínuo, nenhum ponto isolado carrega probabilidade: o que pesa é a área sob a curva, não a altura dela num ponto.",
                    },
                    {
                        type: "text",
                        value: "## Densidade como derivada da FDA\n\nNos pontos em que $F$ é diferenciável, o Teorema Fundamental do Cálculo fornece\n$$f(x) = F'(x).$$\nAssim, densidade e FDA são as duas faces da mesma lei: integra-se $f$ para obter $F$ e deriva-se $F$ para recuperar $f$. A densidade mede a **taxa** com que a probabilidade se acumula: onde $f$ é grande, a probabilidade cresce rapidamente na vizinhança daquele valor.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: achando a constante\n\nSeja $f(x) = c\\,x^2$ para $0 \\le x \\le 2$ e $f(x) = 0$ fora desse intervalo. Para que $f$ seja densidade, impomos a normalização:\n$$\\int_0^2 c\\,x^2\\,dx = c\\left[\\frac{x^3}{3}\\right]_0^2 = c\\cdot\\frac{8}{3} = 1 \\;\\Longrightarrow\\; c = \\frac{3}{8}.$$\nO erro típico é esquecer o fator $1/3$ da integral e concluir $c = 1/8$. Com o valor correto, calculamos por exemplo\n$$P(X \\le 1) = \\int_0^1 \\frac{3}{8}x^2\\,dx = \\frac{3}{8}\\cdot\\frac{1}{3} = \\frac{1}{8}.$$\nUsaremos essa densidade nas próximas aulas.",
                    },
                    {
                        type: "text",
                        value: "## Modelos contínuos fundamentais\n\n- **Uniforme$(a,b)$:** densidade constante $f(x) = \\dfrac{1}{b-a}$ em $[a,b]$ e zero fora.\n- **Exponencial$(\\lambda)$:** $f(x) = \\lambda e^{-\\lambda x}$ para $x \\ge 0$, com FDA $F(x) = 1 - e^{-\\lambda x}$.\n- **Normal$(\\mu, \\sigma^2)$:** $f(x) = \\dfrac{1}{\\sigma\\sqrt{2\\pi}}\\,e^{-(x-\\mu)^2/(2\\sigma^2)}$, definida em toda a reta.\n\nA exponencial modela tempos de espera sem memória; a normal é o modelo central da estatística, justificado pelo Teorema Central do Limite.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: exponencial\n\nSeja $X \\sim \\text{Exponencial}(\\lambda)$ com $\\lambda = 2$, isto é, $f(x) = 2e^{-2x}$ para $x \\ge 0$. A probabilidade de $X$ ultrapassar $1$ é\n$$P(X > 1) = \\int_1^{\\infty} 2e^{-2x}\\,dx = e^{-2} \\approx 0{,}135.$$\nEquivalentemente, pela FDA, $P(X > 1) = 1 - F(1) = 1 - (1 - e^{-2}) = e^{-2}$. Um erro comum é responder $1 - e^{-2}$, que na verdade é $P(X \\le 1)$. Vale ainda notar a ausência de memória: $P(X > s + t \\mid X > s) = P(X > t)$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Uma VA contínua tem FDA da forma $F(x) = \\int_{-\\infty}^{x} f(t)\\,dt$, sem saltos.\n- A densidade $f$ satisfaz $f(x) \\ge 0$ e $\\int_{-\\infty}^{\\infty} f(x)\\,dx = 1$; não é probabilidade e pode passar de $1$.\n- Probabilidades são áreas: $P(a \\le X \\le b) = \\int_a^b f(x)\\,dx$, e $P(X = a) = 0$.\n- Vale $f(x) = F'(x)$ nos pontos de diferenciabilidade.\n- Uniforme, exponencial e normal são os modelos contínuos de referência.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Se $X$ é uma variável aleatória contínua, quanto vale $P(X = a)$ para um ponto fixo $a$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$0$",
                                isCorrect: true,
                            },
                            {
                                text: "$f(a)$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$F(a)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Além de $f(x) \\ge 0$, uma função densidade $f$ deve satisfazer:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\int_{-\\infty}^{\\infty} f(x)\\,dx = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int_{-\\infty}^{\\infty} f(x)\\,dx = 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sum_x f(x) = 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$f(x) \\le 1$ sempre",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para que $f(x) = c\\,x^2$ em $[0,2]$, e zero fora, seja densidade, o valor de $c$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\tfrac{1}{8}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tfrac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tfrac{3}{8}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\tfrac{3}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com a densidade $f(x) = \\tfrac{3}{8}x^2$ em $[0,2]$, quanto vale $P(X \\le 1)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\tfrac{1}{8}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\tfrac{3}{8}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tfrac{1}{2}$",
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
                            "Seja $X \\sim \\text{Exponencial}(2)$, com $f(x) = 2e^{-2x}$ para $x \\ge 0$. Quanto vale $P(X > 1)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$1 - e^{-2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^{-1/2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2e^{-2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^{-2}$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Esperança",
                blocks: [
                    {
                        type: "text",
                        value: "## Esperança de uma variável aleatória\n\nA **esperança** (ou valor esperado, ou média) de $X$ resume sua distribuição num único número, o centro de massa da probabilidade. Para uma VA discreta com fmp $p$,\n$$E[X] = \\sum_{x} x\\,p(x),$$\ndesde que a soma convirja absolutamente, isto é, $\\sum_x |x|\\,p(x) < \\infty$. A convergência absoluta garante que o valor não dependa da ordem em que os termos são somados.",
                    },
                    {
                        type: "text",
                        value: "## O caso contínuo\n\nPara uma VA contínua com densidade $f$, a soma se torna integral:\n$$E[X] = \\int_{-\\infty}^{\\infty} x\\,f(x)\\,dx,$$\nnovamente sob a condição de convergência absoluta $\\int_{-\\infty}^{\\infty} |x|\\,f(x)\\,dx < \\infty$. Quando essa condição falha, dizemos que a esperança não existe. O exemplo clássico é a distribuição de Cauchy, cuja densidade decai devagar demais e cuja média não está definida, apesar da simetria do gráfico.",
                    },
                    {
                        type: "quote",
                        value: "A esperança é o centro de gravidade da distribuição: o ponto onde a massa de probabilidade se equilibraria sobre um fio.",
                    },
                    {
                        type: "text",
                        value: "## Esperança de uma função: LOTUS\n\nFrequentemente queremos a média não de $X$, mas de uma transformação $g(X)$. A **lei do estatístico inconsciente** (LOTUS) permite calcular sem antes achar a distribuição de $g(X)$:\n$$E[g(X)] = \\sum_x g(x)\\,p(x) \\quad (\\text{discreto}), \\qquad E[g(X)] = \\int_{-\\infty}^{\\infty} g(x)\\,f(x)\\,dx \\quad (\\text{contínuo}).$$\nUm caso especial vital é $g(x) = x^2$, que fornece $E[X^2]$ e será peça central no cálculo da variância.",
                    },
                    {
                        type: "text",
                        value: "## Linearidade da esperança\n\nA esperança é um operador **linear**. Para constantes $a, b$ e variáveis $X, Y$ com esperanças finitas,\n$$E[aX + b] = a\\,E[X] + b, \\qquad E[X + Y] = E[X] + E[Y].$$\nA segunda identidade vale mesmo quando $X$ e $Y$ são dependentes, o que a torna extremamente útil. Note ainda que a esperança de uma constante é ela mesma: $E[b] = b$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: caso discreto\n\nRetomando $p(x) = x/10$ em $\\{1,2,3,4\\}$, a esperança é\n$$E[X] = \\sum_{x=1}^{4} x\\cdot\\frac{x}{10} = \\frac{1}{10}\\sum_{x=1}^{4} x^2 = \\frac{1 + 4 + 9 + 16}{10} = \\frac{30}{10} = 3.$$\nRepare que $E[X] = 3$ não coincide com a média simples $2{,}5$ dos valores $\\{1,2,3,4\\}$: os valores maiores têm peso maior e puxam o centro de massa para a direita.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: caso contínuo\n\nCom a densidade $f(x) = \\tfrac{3}{8}x^2$ em $[0,2]$,\n$$E[X] = \\int_0^2 x\\cdot\\frac{3}{8}x^2\\,dx = \\frac{3}{8}\\int_0^2 x^3\\,dx = \\frac{3}{8}\\left[\\frac{x^4}{4}\\right]_0^2 = \\frac{3}{8}\\cdot 4 = \\frac{3}{2}.$$\nO valor $E[X] = 3/2$ fica à direita do meio do intervalo $[0,2]$, coerente com o fato de a densidade $\\tfrac{3}{8}x^2$ ser crescente e, portanto, concentrar mais massa perto de $2$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A esperança é o centro de massa da distribuição: $E[X] = \\sum_x x\\,p(x)$ (discreto) ou $E[X] = \\int_{-\\infty}^{\\infty} x\\,f(x)\\,dx$ (contínuo).\n- Ela existe quando há convergência absoluta; caso contrário, como na Cauchy, não está definida.\n- LOTUS calcula $E[g(X)]$ diretamente com a lei de $X$, sem obter a distribuição de $g(X)$.\n- A esperança é linear: $E[aX + b] = a\\,E[X] + b$ e $E[X + Y] = E[X] + E[Y]$.\n- Nos nossos exemplos, $E[X] = 3$ (discreto) e $E[X] = 3/2$ (contínuo).",
                    },
                ],
                questions: [
                    {
                        statement: "Para uma VA discreta com fmp $p$, a esperança é dada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sum_x p(x)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum_x x\\,p(x)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sum_x x^2\\,p(x)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\int x\\,p(x)\\,dx$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Pela linearidade da esperança, $E[aX + b]$ é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$a\\,E[X] + b$",
                                isCorrect: true,
                            },
                            {
                                text: "$a\\,E[X]$",
                                isCorrect: false,
                            },
                            {
                                text: "$E[X] + b$",
                                isCorrect: false,
                            },
                            {
                                text: "$a\\,E[X] + ab$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Com $p(x) = x/10$ em $\\{1,2,3,4\\}$, o valor de $E[X]$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2{,}5$",
                                isCorrect: false,
                            },
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: true,
                            },
                            {
                                text: "$10$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para a densidade $f(x) = \\tfrac{3}{8}x^2$ em $[0,2]$, quanto vale $E[X]$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1$",
                                isCorrect: false,
                            },
                            {
                                text: "$2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tfrac{3}{8}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tfrac{3}{2}$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com $p(x) = x/10$ em $\\{1,2,3,4\\}$, use LOTUS para obter $E[X^2]$:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$9$",
                                isCorrect: false,
                            },
                            {
                                text: "$10$",
                                isCorrect: true,
                            },
                            {
                                text: "$30$",
                                isCorrect: false,
                            },
                            {
                                text: "$100$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Variância e momentos",
                blocks: [
                    {
                        type: "text",
                        value: "## Variância\n\nA esperança localiza o centro da distribuição, mas nada diz sobre sua dispersão. A **variância** mede o espalhamento em torno da média $\\mu = E[X]$ como o valor esperado do desvio quadrático:\n$$\\operatorname{Var}(X) = E\\big[(X - \\mu)^2\\big].$$\nPor ser a média de um quadrado, a variância é sempre não negativa, e vale $\\operatorname{Var}(X) = 0$ apenas quando $X$ é constante, igual a $\\mu$, com probabilidade $1$.",
                    },
                    {
                        type: "text",
                        value: "## Fórmula de cálculo\n\nExpandindo o quadrado e usando a linearidade da esperança, obtemos uma fórmula muito mais prática:\n$$\\operatorname{Var}(X) = E[(X-\\mu)^2] = E[X^2 - 2\\mu X + \\mu^2] = E[X^2] - 2\\mu E[X] + \\mu^2.$$\nComo $\\mu = E[X]$, os dois últimos termos se combinam em $-\\mu^2$, resultando em\n$$\\operatorname{Var}(X) = E[X^2] - (E[X])^2.$$\nO erro mais frequente é esquecer o quadrado e escrever $E[X^2] - E[X]$; a fórmula correta subtrai o **quadrado** da esperança.",
                    },
                    {
                        type: "quote",
                        value: "A esperança diz onde a distribuição mora; a variância diz o quanto ela se espalha pela vizinhança desse endereço.",
                    },
                    {
                        type: "text",
                        value: "## Desvio padrão e propriedades\n\nComo a variância vem em unidades ao quadrado, define-se o **desvio padrão** $\\sigma = \\sqrt{\\operatorname{Var}(X)}$, que retorna à escala original de $X$. Sob transformações afins, a variância se comporta assim:\n$$\\operatorname{Var}(aX + b) = a^2\\,\\operatorname{Var}(X).$$\nA constante aditiva $b$ desaparece, pois deslocar a distribuição não altera sua dispersão; já o fator $a$ entra ao quadrado. Em particular, $\\operatorname{Var}(X) \\ge 0$ sempre, e $\\operatorname{Var}(b) = 0$ para $b$ constante.",
                    },
                    {
                        type: "text",
                        value: "## Momentos\n\nOs **momentos** generalizam esperança e variância. O momento de ordem $k$ em torno da origem é $E[X^k]$, e o **momento central** de ordem $k$ é $E[(X - \\mu)^k]$. Assim, $E[X]$ é o primeiro momento e $\\operatorname{Var}(X)$ é o segundo momento central.\n\nMomentos superiores descrevem a forma da distribuição: o terceiro momento central, normalizado, mede a **assimetria**, e o quarto mede a **curtose**, ligada ao peso das caudas. Quando existe, a **função geradora de momentos** $M_X(t) = E[e^{tX}]$ codifica todos os momentos de uma vez, pois $E[X^k] = M_X^{(k)}(0)$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: variância no caso discreto\n\nCom $p(x) = x/10$ em $\\{1,2,3,4\\}$, já temos $E[X] = 3$. Falta $E[X^2]$, obtido por LOTUS:\n$$E[X^2] = \\sum_{x=1}^{4} x^2\\cdot\\frac{x}{10} = \\frac{1}{10}\\sum_{x=1}^4 x^3 = \\frac{1 + 8 + 27 + 64}{10} = \\frac{100}{10} = 10.$$\nLogo,\n$$\\operatorname{Var}(X) = E[X^2] - (E[X])^2 = 10 - 3^2 = 10 - 9 = 1,$$\ne o desvio padrão é $\\sigma = \\sqrt{1} = 1$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: variância no caso contínuo\n\nCom $f(x) = \\tfrac{3}{8}x^2$ em $[0,2]$, já vimos que $E[X] = 3/2$. Calculamos $E[X^2]$:\n$$E[X^2] = \\int_0^2 x^2\\cdot\\frac{3}{8}x^2\\,dx = \\frac{3}{8}\\int_0^2 x^4\\,dx = \\frac{3}{8}\\cdot\\frac{32}{5} = \\frac{12}{5}.$$\nPortanto,\n$$\\operatorname{Var}(X) = \\frac{12}{5} - \\left(\\frac{3}{2}\\right)^2 = \\frac{12}{5} - \\frac{9}{4} = \\frac{48 - 45}{20} = \\frac{3}{20}.$$\nRepare como a fórmula $E[X^2] - (E[X])^2$ organiza o cálculo: basta o momento de ordem $2$ e a esperança já conhecida.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A variância mede dispersão: $\\operatorname{Var}(X) = E[(X - \\mu)^2]$, sempre não negativa.\n- Fórmula de cálculo: $\\operatorname{Var}(X) = E[X^2] - (E[X])^2$; nunca esqueça o quadrado da esperança.\n- O desvio padrão $\\sigma = \\sqrt{\\operatorname{Var}(X)}$ volta à escala de $X$, e $\\operatorname{Var}(aX + b) = a^2\\operatorname{Var}(X)$.\n- Momentos $E[X^k]$ e momentos centrais $E[(X-\\mu)^k]$ descrevem a forma; a fgm $M_X(t) = E[e^{tX}]$ gera todos.\n- Nos exemplos: variância $1$ (discreto) e $3/20$ (contínuo).",
                    },
                ],
                questions: [
                    {
                        statement: "A fórmula prática para a variância de $X$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$E[X^2] - (E[X])^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$E[X^2] - E[X]$",
                                isCorrect: false,
                            },
                            {
                                text: "$(E[X])^2 - E[X^2]$",
                                isCorrect: false,
                            },
                            {
                                text: "$E[X^2] + (E[X])^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para constantes $a$ e $b$, quanto vale $\\operatorname{Var}(aX + b)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$a^2\\operatorname{Var}(X)$",
                                isCorrect: true,
                            },
                            {
                                text: "$a\\operatorname{Var}(X)$",
                                isCorrect: false,
                            },
                            {
                                text: "$a^2\\operatorname{Var}(X) + b$",
                                isCorrect: false,
                            },
                            {
                                text: "$a^2\\operatorname{Var}(X) + b^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $E[X] = 3$ e $E[X^2] = 10$, então $\\operatorname{Var}(X)$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$7$",
                                isCorrect: false,
                            },
                            {
                                text: "$91$",
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
                        statement: "Se $\\operatorname{Var}(X) = 9$, o desvio padrão $\\sigma$ é:",
                        difficulty: "medio",
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
                                text: "$81$",
                                isCorrect: false,
                            },
                            {
                                text: "$4{,}5$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f(x) = \\tfrac{3}{8}x^2$ em $[0,2]$, com $E[X] = 3/2$ e $E[X^2] = 12/5$, a variância é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\tfrac{9}{10}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tfrac{3}{20}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\tfrac{3}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tfrac{12}{5}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Principais distribuições",
        aulas: [
            {
                titulo: "Bernoulli e binomial",
                blocks: [
                    {
                        type: "text",
                        value: "## Ensaios de Bernoulli\n\nUm **ensaio de Bernoulli** é um experimento aleatório com apenas dois resultados possíveis, chamados de *sucesso* e *fracasso*. Dizemos que $X \\sim \\text{Bernoulli}(p)$, com $p \\in [0,1]$, quando\n\n$$P(X = 1) = p, \\qquad P(X = 0) = 1 - p,$$\n\nou, de forma compacta, $P(X = k) = p^k (1-p)^{1-k}$ para $k \\in \\{0, 1\\}$.\n\nComo $X$ assume apenas os valores $0$ e $1$, a esperança sai direto da definição: $E[X] = 0 \\cdot (1-p) + 1 \\cdot p = p$. Além disso $X^2 = X$, de modo que $E[X^2] = p$ e\n\n$$\\text{Var}(X) = E[X^2] - (E[X])^2 = p - p^2 = p(1-p).$$\n\nA variância é máxima em $p = \\tfrac{1}{2}$, quando a incerteza sobre o resultado é maior, e nula quando o resultado é determinístico ($p = 0$ ou $p = 1$). Apesar de simples, a Bernoulli é o tijolo elementar a partir do qual construímos várias outras distribuições discretas.",
                    },
                    {
                        type: "text",
                        value: "## A distribuição binomial\n\nConsidere $n$ ensaios de Bernoulli **independentes**, todos com a mesma probabilidade de sucesso $p$. Seja $X$ o número total de sucessos. Então $X$ segue uma distribuição **binomial** de parâmetros $n$ e $p$, e escrevemos $X \\sim \\text{Binomial}(n, p)$.\n\nFormalmente, se $X_1, X_2, \\dots, X_n$ são variáveis independentes e identicamente distribuídas com $X_i \\sim \\text{Bernoulli}(p)$, então\n\n$$X = \\sum_{i=1}^{n} X_i.$$\n\nEssa decomposição como soma de Bernoullis independentes é a chave para deduzir quase todas as propriedades da binomial.",
                    },
                    {
                        type: "text",
                        value: "## Função de probabilidade\n\nA probabilidade de observar exatamente $k$ sucessos em $n$ ensaios é\n\n$$P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}, \\qquad k = 0, 1, \\dots, n.$$\n\nA interpretação de cada fator é direta. O termo $p^k$ corresponde aos $k$ sucessos, $(1-p)^{n-k}$ aos $n-k$ fracassos, e o coeficiente binomial $\\binom{n}{k} = \\frac{n!}{k!\\,(n-k)!}$ conta de quantas maneiras distintas os $k$ sucessos podem se distribuir entre os $n$ ensaios. Esquecer esse coeficiente é o erro mais comum: ele é o que transforma a probabilidade de *uma* sequência específica na probabilidade de *qualquer* sequência com $k$ sucessos.\n\nPelo teorema binomial, a soma das probabilidades é $\\sum_{k=0}^{n} \\binom{n}{k} p^k (1-p)^{n-k} = (p + (1-p))^n = 1$, como esperado.",
                    },
                    {
                        type: "text",
                        value: "## Esperança e variância da binomial\n\nUsando a decomposição $X = \\sum_{i=1}^n X_i$ e a linearidade da esperança,\n\n$$E[X] = \\sum_{i=1}^{n} E[X_i] = \\sum_{i=1}^{n} p = np.$$\n\nComo os ensaios são independentes, a variância da soma é a soma das variâncias:\n\n$$\\text{Var}(X) = \\sum_{i=1}^{n} \\text{Var}(X_i) = \\sum_{i=1}^{n} p(1-p) = np(1-p).$$\n\nNote como a estrutura de soma de Bernoullis torna essas contas quase imediatas, dispensando manipulações diretas com o coeficiente binomial. Guarde a distinção: a média é $np$ e a variância é $np(1-p)$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nUma moeda honesta é lançada $10$ vezes. Qual a probabilidade de obtermos exatamente $6$ caras?\n\nCada lançamento é um ensaio de Bernoulli com $p = \\tfrac{1}{2}$, e os lançamentos são independentes, então o número de caras $X \\sim \\text{Binomial}(10, \\tfrac{1}{2})$. Aplicando a função de probabilidade com $k = 6$:\n\n$$P(X = 6) = \\binom{10}{6} \\left(\\tfrac{1}{2}\\right)^6 \\left(\\tfrac{1}{2}\\right)^{4} = \\binom{10}{6} \\left(\\tfrac{1}{2}\\right)^{10}.$$\n\nComo $\\binom{10}{6} = 210$ e $2^{10} = 1024$, obtemos\n\n$$P(X = 6) = \\frac{210}{1024} \\approx 0{,}205.$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nUm componente eletrônico funciona corretamente com probabilidade $0{,}9$, de forma independente entre unidades. Em um lote de $5$ componentes, qual a probabilidade de que **pelo menos $4$** funcionem?\n\nSeja $X \\sim \\text{Binomial}(5,\\ 0{,}9)$ o número de componentes que funcionam. Queremos $P(X \\ge 4) = P(X = 4) + P(X = 5)$:\n\n$$P(X = 4) = \\binom{5}{4} (0{,}9)^4 (0{,}1)^1 = 5 \\cdot 0{,}6561 \\cdot 0{,}1 = 0{,}32805,$$\n\n$$P(X = 5) = \\binom{5}{5} (0{,}9)^5 (0{,}1)^0 = 0{,}59049.$$\n\nSomando, $P(X \\ge 4) = 0{,}32805 + 0{,}59049 = 0{,}91854$, ou seja, cerca de $91{,}9\\%$ de chance.",
                    },
                    {
                        type: "text",
                        value: "## Função geradora de momentos e soma\n\nA função geradora de momentos de uma Bernoulli é $M_X(t) = E[e^{tX}] = (1-p) + p e^{t}$. Como a binomial é soma de $n$ Bernoullis independentes, sua função geradora de momentos é o produto:\n\n$$M_X(t) = \\left( (1-p) + p e^{t} \\right)^{n}.$$\n\nUma consequência imediata é a **propriedade de soma**: se $X \\sim \\text{Binomial}(n, p)$ e $Y \\sim \\text{Binomial}(m, p)$ são independentes e compartilham o mesmo $p$, então $X + Y \\sim \\text{Binomial}(n + m, p)$. Isso é intuitivo, pois somar os sucessos de $n$ ensaios com os de outros $m$ ensaios equivale a contar sucessos em $n + m$ ensaios.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n| Distribuição | Suporte | Parâmetros | Média | Variância |\n| --- | --- | --- | --- | --- |\n| Bernoulli$(p)$ | $\\{0, 1\\}$ | $p$ | $p$ | $p(1-p)$ |\n| Binomial$(n, p)$ | $\\{0, 1, \\dots, n\\}$ | $n,\\ p$ | $np$ | $np(1-p)$ |\n\nA binomial é a soma de $n$ Bernoullis independentes de mesmo parâmetro. As duas quantidades média ($np$) e variância ($np(1-p)$) coincidem apenas no caso degenerado, e o coeficiente binomial $\\binom{n}{k}$ é indispensável na função de probabilidade.",
                    },
                    {
                        type: "quote",
                        value: "Toda distribuição binomial nasce da repetição independente do mais simples dos experimentos aleatórios: o cara ou coroa.",
                    },
                ],
                questions: [
                    {
                        statement: "Seja $X \\sim \\text{Bernoulli}(p)$. Qual é o valor de $E[X]$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$1 - p$",
                                isCorrect: false,
                            },
                            {
                                text: "$p$",
                                isCorrect: true,
                            },
                            {
                                text: "$p(1 - p)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{p}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $X \\sim \\text{Binomial}(n, p)$. Para $k = 0, 1, \\dots, n$, a função de probabilidade $P(X = k)$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\binom{n}{k} p^{n-k} (1-p)^{k}$",
                                isCorrect: false,
                            },
                            {
                                text: "$p^k (1-p)^{n-k}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\binom{n}{k} p^k (1-p)^{n-k}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\binom{n}{k} p^k (1-p)^{k}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $X \\sim \\text{Binomial}(n, p)$, então $\\text{Var}(X)$ é igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$np(1-p)$",
                                isCorrect: true,
                            },
                            {
                                text: "$np$",
                                isCorrect: false,
                            },
                            {
                                text: "$np(1-p)^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$p(1-p)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma moeda honesta é lançada $4$ vezes. Qual a probabilidade de obter exatamente $2$ caras?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\dfrac{1}{16}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{3}{8}$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $X \\sim \\text{Binomial}(n, p)$ e $Y \\sim \\text{Binomial}(m, p)$ independentes, com o mesmo $p$. Então $X + Y$ segue a distribuição:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\text{Binomial}(nm,\\ p)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\text{Binomial}(n + m,\\ p)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\text{Binomial}(n + m,\\ 2p)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\text{Binomial}(n + m,\\ p^2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Geométrica e Poisson",
                blocks: [
                    {
                        type: "text",
                        value: "## A distribuição geométrica\n\nA distribuição **geométrica** modela o número de ensaios de Bernoulli independentes, cada um com probabilidade de sucesso $p$, necessários até (e incluindo) o **primeiro sucesso**. Se $X$ conta esse número de tentativas, escrevemos $X \\sim \\text{Geométrica}(p)$ e temos suporte $\\{1, 2, 3, \\dots\\}$ com\n\n$$P(X = k) = (1-p)^{k-1} p, \\qquad k = 1, 2, 3, \\dots$$\n\nA ideia é direta: para que o primeiro sucesso ocorra na $k$-ésima tentativa, os $k-1$ ensaios anteriores devem ser fracassos (probabilidade $(1-p)^{k-1}$) e o $k$-ésimo, um sucesso (probabilidade $p$). A probabilidade de o primeiro sucesso demorar mais que $k$ tentativas é\n\n$$P(X > k) = (1-p)^{k},$$\n\npois isso equivale a $k$ fracassos consecutivos.",
                    },
                    {
                        type: "text",
                        value: "## Esperança, variância e falta de memória\n\nPara a geométrica que conta tentativas até o primeiro sucesso,\n\n$$E[X] = \\frac{1}{p}, \\qquad \\text{Var}(X) = \\frac{1-p}{p^2}.$$\n\nO valor $E[X] = 1/p$ é intuitivo: se cada tentativa tem chance $p$ de sucesso, em média são necessárias $1/p$ tentativas. Por exemplo, para $p = 1/6$ (obter um seis em um dado), esperam-se $6$ lançamentos.\n\nA geométrica é a **única distribuição discreta sem memória**: para inteiros $m, n \\ge 0$,\n\n$$P(X > m + n \\mid X > m) = P(X > n).$$\n\nEm palavras, se já houve $m$ fracassos, a distribuição do número adicional de tentativas até o sucesso é a mesma do início. O processo não guarda memória do passado.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: geométrica\n\nUm dado honesto é lançado repetidamente até que saia o primeiro $6$. Qual a probabilidade de que isso ocorra exatamente no terceiro lançamento? E qual o número esperado de lançamentos?\n\nAqui $p = \\tfrac{1}{6}$ e $X \\sim \\text{Geométrica}(\\tfrac{1}{6})$. Para $k = 3$:\n\n$$P(X = 3) = \\left(\\tfrac{5}{6}\\right)^{2} \\cdot \\tfrac{1}{6} = \\frac{25}{216} \\approx 0{,}116.$$\n\nO número esperado de lançamentos é $E[X] = 1/p = 6$. Já a probabilidade de precisar de mais de $3$ lançamentos é $P(X > 3) = \\left(\\tfrac{5}{6}\\right)^3 = \\frac{125}{216} \\approx 0{,}579$.",
                    },
                    {
                        type: "text",
                        value: "## A distribuição de Poisson\n\nA distribuição de **Poisson** modela o número de ocorrências de um evento em um intervalo fixo de tempo, espaço ou volume, quando esses eventos acontecem de forma independente e a uma taxa média constante $\\lambda > 0$. Escrevemos $X \\sim \\text{Poisson}(\\lambda)$, com suporte $\\{0, 1, 2, \\dots\\}$ e\n\n$$P(X = k) = \\frac{\\lambda^{k} e^{-\\lambda}}{k!}, \\qquad k = 0, 1, 2, \\dots$$\n\nO parâmetro $\\lambda$ é o número médio de ocorrências no intervalo considerado. A normalização é garantida pela série de Taylor da exponencial, $\\sum_{k=0}^{\\infty} \\frac{\\lambda^k}{k!} = e^{\\lambda}$, de modo que $\\sum_{k=0}^{\\infty} P(X = k) = e^{-\\lambda} e^{\\lambda} = 1$.",
                    },
                    {
                        type: "text",
                        value: "## Esperança, variância e soma\n\nUma característica marcante da Poisson é que a média e a variância coincidem:\n\n$$E[X] = \\lambda, \\qquad \\text{Var}(X) = \\lambda.$$\n\nEssa igualdade é usada como teste rápido: se em um conjunto de dados de contagem a variância amostral for muito maior que a média, o modelo de Poisson provavelmente é inadequado (fenômeno de superdispersão).\n\nA Poisson também goza de uma **propriedade de soma**: se $X \\sim \\text{Poisson}(\\lambda_1)$ e $Y \\sim \\text{Poisson}(\\lambda_2)$ são independentes, então\n\n$$X + Y \\sim \\text{Poisson}(\\lambda_1 + \\lambda_2).$$",
                    },
                    {
                        type: "text",
                        value: "## Poisson como limite da binomial\n\nA Poisson surge naturalmente como aproximação da binomial quando o número de ensaios $n$ é grande e a probabilidade de sucesso $p$ é pequena, de modo que o produto $\\lambda = np$ permaneça moderado. Formalmente, mantendo $np = \\lambda$ fixo,\n\n$$\\lim_{n \\to \\infty} \\binom{n}{k} p^{k} (1-p)^{n-k} = \\frac{\\lambda^{k} e^{-\\lambda}}{k!}.$$\n\nPor isso a Poisson é chamada de **lei dos eventos raros**: ela descreve a contagem de ocorrências raras em um número grande de oportunidades independentes. Na prática, a aproximação já é boa quando $n \\ge 20$ e $p \\le 0{,}05$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: Poisson\n\nUma central telefônica recebe, em média, $3$ chamadas por minuto, seguindo uma distribuição de Poisson. Qual a probabilidade de não receber nenhuma chamada em um dado minuto? E de receber exatamente duas?\n\nAqui $\\lambda = 3$ e $X \\sim \\text{Poisson}(3)$. Para $k = 0$:\n\n$$P(X = 0) = \\frac{3^{0} e^{-3}}{0!} = e^{-3} \\approx 0{,}0498.$$\n\nPara $k = 2$:\n\n$$P(X = 2) = \\frac{3^{2} e^{-3}}{2!} = \\frac{9 e^{-3}}{2} \\approx 0{,}224.$$\n\nAssim, há cerca de $5\\%$ de chance de nenhuma chamada e $22{,}4\\%$ de chance de exatamente duas chamadas no minuto.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n| Distribuição | Suporte | Média | Variância |\n| --- | --- | --- | --- |\n| Geométrica$(p)$ | $\\{1, 2, 3, \\dots\\}$ | $\\dfrac{1}{p}$ | $\\dfrac{1-p}{p^2}$ |\n| Poisson$(\\lambda)$ | $\\{0, 1, 2, \\dots\\}$ | $\\lambda$ | $\\lambda$ |\n\nA geométrica conta tentativas até o primeiro sucesso e é a única discreta sem memória. A Poisson conta ocorrências em um intervalo, tem média igual à variância e aparece como limite da binomial para eventos raros.",
                    },
                    {
                        type: "quote",
                        value: "A geométrica pergunta quando o primeiro sucesso chega; a Poisson pergunta quantos eventos cabem em um intervalo.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Seja $X \\sim \\text{Geométrica}(p)$, contando o número de tentativas até o primeiro sucesso. Então $E[X]$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\dfrac{1}{p}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{1}{1 - p}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1 - p}{p^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$p$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $X \\sim \\text{Poisson}(\\lambda)$. Qual é a variância $\\text{Var}(X)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sqrt{\\lambda}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lambda$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\lambda^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{\\lambda}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Chamadas chegam a uma central segundo uma Poisson com média $\\lambda = 2$ por minuto. Qual a probabilidade de nenhuma chamada em um minuto?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2 e^{-2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$1 - e^{-2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^{-2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{e^{-2}}{2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $X \\sim \\text{Geométrica}(p)$ (tentativas até o primeiro sucesso). Para $k = 1, 2, \\dots$, a função de probabilidade $P(X = k)$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(1-p)^{k} p$",
                                isCorrect: false,
                            },
                            {
                                text: "$p^{k-1} (1-p)$",
                                isCorrect: false,
                            },
                            {
                                text: "$(1-p)^{k-1} p$",
                                isCorrect: true,
                            },
                            {
                                text: "$(1-p)^{k-1}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $X \\sim \\text{Poisson}(\\lambda_1)$ e $Y \\sim \\text{Poisson}(\\lambda_2)$ independentes. Então $X + Y$ segue a distribuição:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\text{Poisson}(\\lambda_1 + \\lambda_2)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\text{Poisson}(\\lambda_1 \\lambda_2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\text{Poisson}(\\sqrt{\\lambda_1 \\lambda_2})$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\text{Poisson}\\left(\\dfrac{\\lambda_1 + \\lambda_2}{2}\\right)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Uniforme e exponencial",
                blocks: [
                    {
                        type: "text",
                        value: "## A distribuição uniforme contínua\n\nUma variável aleatória $X$ tem distribuição **uniforme** no intervalo $[a, b]$, com $a < b$, quando sua densidade é constante dentro do intervalo e nula fora dele. Escrevemos $X \\sim U(a, b)$, com\n\n$$f(x) = \\frac{1}{b - a} \\quad \\text{para } a \\le x \\le b, \\qquad f(x) = 0 \\text{ caso contrário.}$$\n\nA função de distribuição acumulada cresce linearmente:\n\n$$F(x) = \\frac{x - a}{b - a}, \\qquad a \\le x \\le b,$$\n\ncom $F(x) = 0$ para $x < a$ e $F(x) = 1$ para $x > b$. Todos os subintervalos de mesmo comprimento dentro de $[a, b]$ têm a mesma probabilidade, o que traduz a ideia de completa ausência de preferência.",
                    },
                    {
                        type: "text",
                        value: "## Esperança e variância da uniforme\n\nPor simetria em torno do ponto médio, a esperança é\n\n$$E[X] = \\frac{a + b}{2}.$$\n\nPara a variância, calculamos $E[X^2] = \\int_a^b \\frac{x^2}{b-a}\\, dx = \\frac{b^3 - a^3}{3(b - a)} = \\frac{a^2 + ab + b^2}{3}$. Subtraindo o quadrado da média:\n\n$$\\text{Var}(X) = \\frac{a^2 + ab + b^2}{3} - \\left(\\frac{a + b}{2}\\right)^{2} = \\frac{(b - a)^2}{12}.$$\n\nRepare que a variância depende apenas do comprimento $b - a$ do intervalo, e não de sua posição.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: uniforme\n\nUm ônibus passa em um ponto a cada $12$ minutos. Um passageiro chega ao ponto em um instante aleatório, sem conhecer o horário. Modelamos o tempo de espera $X$, em minutos, por $X \\sim U(0, 12)$.\n\nO tempo médio de espera é\n\n$$E[X] = \\frac{0 + 12}{2} = 6 \\text{ minutos},$$\n\ne a variância é $\\text{Var}(X) = \\frac{(12 - 0)^2}{12} = 12$. A probabilidade de esperar mais de $9$ minutos é\n\n$$P(X > 9) = \\frac{12 - 9}{12} = \\frac{1}{4}.$$",
                    },
                    {
                        type: "text",
                        value: "## A distribuição exponencial\n\nA distribuição **exponencial** modela o tempo de espera até a ocorrência de um evento em um processo sem memória, como o tempo até a próxima falha de um equipamento ou até a chegada do próximo cliente. Escrevemos $X \\sim \\text{Exponencial}(\\lambda)$, com taxa $\\lambda > 0$, suporte $[0, \\infty)$ e densidade\n\n$$f(x) = \\lambda e^{-\\lambda x}, \\qquad x \\ge 0.$$\n\nA função de distribuição acumulada é\n\n$$F(x) = 1 - e^{-\\lambda x}, \\qquad x \\ge 0,$$\n\nde modo que a probabilidade de o evento demorar mais que $x$ é a cauda\n\n$$P(X > x) = e^{-\\lambda x}.$$",
                    },
                    {
                        type: "text",
                        value: "## Esperança e variância da exponencial\n\nIntegrando por partes, a esperança é\n\n$$E[X] = \\int_0^{\\infty} x\\, \\lambda e^{-\\lambda x}\\, dx = \\frac{1}{\\lambda},$$\n\ne um cálculo análogo para o segundo momento dá $E[X^2] = \\frac{2}{\\lambda^2}$, de onde\n\n$$\\text{Var}(X) = E[X^2] - (E[X])^2 = \\frac{2}{\\lambda^2} - \\frac{1}{\\lambda^2} = \\frac{1}{\\lambda^2}.$$\n\nA taxa $\\lambda$ e a média $1/\\lambda$ são inversas: quanto maior a taxa de ocorrência, menor o tempo médio de espera. Observe ainda que o desvio padrão $\\sqrt{\\text{Var}(X)} = 1/\\lambda$ é igual à média.",
                    },
                    {
                        type: "text",
                        value: "## Falta de memória e conexão com Poisson\n\nA exponencial é a **única distribuição contínua sem memória**: para $s, t \\ge 0$,\n\n$$P(X > s + t \\mid X > s) = P(X > t).$$\n\nOu seja, um componente que já funcionou por $s$ horas tem a mesma distribuição de vida residual de um componente novo. Essa propriedade é o análogo contínuo da falta de memória da geométrica.\n\nHá ainda uma ligação profunda com a Poisson: se os eventos ocorrem segundo um **processo de Poisson** de taxa $\\lambda$, isto é, a contagem em cada intervalo é Poisson, então os tempos entre eventos consecutivos são independentes e seguem uma $\\text{Exponencial}(\\lambda)$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: exponencial\n\nO tempo de vida de certo tipo de lâmpada, em horas, segue uma distribuição exponencial com média de $1000$ horas. Qual a probabilidade de uma lâmpada durar mais de $2000$ horas?\n\nSe a média é $1000$, então $1/\\lambda = 1000$, ou seja, $\\lambda = \\tfrac{1}{1000}$. A probabilidade pedida é a cauda da exponencial:\n\n$$P(X > 2000) = e^{-\\lambda \\cdot 2000} = e^{-2000/1000} = e^{-2} \\approx 0{,}135.$$\n\nPela falta de memória, uma lâmpada que já funcionou por $500$ horas tem probabilidade $P(X > 2500 \\mid X > 500) = P(X > 2000) = e^{-2}$ de durar outras $2000$ horas, exatamente como uma lâmpada nova.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n| Distribuição | Suporte | Média | Variância |\n| --- | --- | --- | --- |\n| Uniforme$(a, b)$ | $[a, b]$ | $\\dfrac{a + b}{2}$ | $\\dfrac{(b - a)^2}{12}$ |\n| Exponencial$(\\lambda)$ | $[0, \\infty)$ | $\\dfrac{1}{\\lambda}$ | $\\dfrac{1}{\\lambda^2}$ |\n\nA uniforme distribui probabilidade igualmente ao longo de um intervalo e tem variância dependente apenas do comprimento. A exponencial modela tempos de espera, é a única contínua sem memória e está ligada ao processo de Poisson.",
                    },
                    {
                        type: "quote",
                        value: "A uniforme não tem preferências dentro do intervalo; a exponencial não guarda memória do tempo já decorrido.",
                    },
                ],
                questions: [
                    {
                        statement: "Seja $X \\sim U(a, b)$ uniforme contínua. Qual é $E[X]$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\dfrac{b - a}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{a + b}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{b - a}{12}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{a + b}{12}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $X \\sim \\text{Exponencial}(\\lambda)$. Qual é a esperança $E[X]$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\lambda$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{\\lambda}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{1}{\\lambda^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\lambda^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $X \\sim \\text{Exponencial}(\\lambda)$. Para $a > 0$, quanto vale $P(X > a)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1 - e^{-\\lambda a}$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^{-\\lambda a}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\lambda e^{-\\lambda a}$",
                                isCorrect: false,
                            },
                            {
                                text: "$e^{-a/\\lambda}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Seja $X \\sim U(0, 12)$. Qual é a variância $\\text{Var}(X)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$36$",
                                isCorrect: false,
                            },
                            {
                                text: "$12$",
                                isCorrect: true,
                            },
                            {
                                text: "$144$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A exponencial é a única distribuição contínua sem memória. Para $s, t \\ge 0$, quanto vale $P(X > s + t \\mid X > s)$?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$P(X > s + t)$",
                                isCorrect: false,
                            },
                            {
                                text: "$P(X > s)$",
                                isCorrect: false,
                            },
                            {
                                text: "$P(X > t)$",
                                isCorrect: true,
                            },
                            {
                                text: "$P(X > s)\\, P(X > t)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "A distribuição normal",
                blocks: [
                    {
                        type: "text",
                        value: "## A distribuição normal\n\nA distribuição **normal** (ou gaussiana) é a mais importante da estatística. Escrevemos $X \\sim N(\\mu, \\sigma^2)$ quando $X$ tem densidade\n\n$$f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\, e^{-\\frac{(x - \\mu)^2}{2\\sigma^2}}, \\qquad x \\in \\mathbb{R}.$$\n\nO gráfico é a clássica curva em forma de sino, simétrica em torno de $\\mu$. Os dois parâmetros têm interpretação direta: $\\mu$ é o centro (posição do pico) e $\\sigma > 0$ controla a dispersão (largura do sino). A constante $\\frac{1}{\\sigma \\sqrt{2\\pi}}$ garante que a área total sob a curva seja $1$.",
                    },
                    {
                        type: "text",
                        value: "## Parâmetros, esperança e variância\n\nPara a normal, os próprios parâmetros são a média e a variância:\n\n$$E[X] = \\mu, \\qquad \\text{Var}(X) = \\sigma^2.$$\n\nPortanto $\\sigma$ é o desvio padrão. Essa é uma das razões da conveniência da normal: uma vez conhecidos $\\mu$ e $\\sigma^2$, a distribuição está completamente determinada, sem necessidade de outros momentos. A densidade é simétrica em torno de $\\mu$, então média, mediana e moda coincidem nesse ponto.",
                    },
                    {
                        type: "text",
                        value: "## Normal padrão e padronização\n\nA normal com $\\mu = 0$ e $\\sigma^2 = 1$ é chamada de **normal padrão**, denotada por $Z \\sim N(0, 1)$, e sua função de distribuição acumulada recebe o símbolo $\\Phi$. Qualquer normal pode ser reduzida à padrão pela transformação de **padronização**:\n\n$$Z = \\frac{X - \\mu}{\\sigma} \\sim N(0, 1).$$\n\nIsso permite calcular probabilidades de qualquer $N(\\mu, \\sigma^2)$ usando uma única tabela (ou rotina) para $\\Phi$. Por exemplo,\n\n$$P(X \\le x) = P\\left(Z \\le \\frac{x - \\mu}{\\sigma}\\right) = \\Phi\\left(\\frac{x - \\mu}{\\sigma}\\right).$$",
                    },
                    {
                        type: "text",
                        value: "## Transformações lineares e somas\n\nA família normal é fechada sob transformações lineares e somas independentes, o que a torna especialmente maleável. Se $X \\sim N(\\mu, \\sigma^2)$ e $Y = aX + b$ com $a \\neq 0$, então\n\n$$Y \\sim N\\left(a\\mu + b,\\ a^2 \\sigma^2\\right).$$\n\nSe $X \\sim N(\\mu_1, \\sigma_1^2)$ e $Y \\sim N(\\mu_2, \\sigma_2^2)$ são independentes, então a soma também é normal:\n\n$$X + Y \\sim N\\left(\\mu_1 + \\mu_2,\\ \\sigma_1^2 + \\sigma_2^2\\right).$$\n\nAs médias sempre se somam; as variâncias se somam quando as variáveis são independentes.",
                    },
                    {
                        type: "text",
                        value: "## A regra empírica 68-95-99,7\n\nPara qualquer normal, a probabilidade concentrada em torno da média a uma, duas e três distâncias de desvio padrão é aproximadamente fixa:\n\n$$P(\\mu - \\sigma < X < \\mu + \\sigma) \\approx 0{,}68,$$\n\n$$P(\\mu - 2\\sigma < X < \\mu + 2\\sigma) \\approx 0{,}95,$$\n\n$$P(\\mu - 3\\sigma < X < \\mu + 3\\sigma) \\approx 0{,}997.$$\n\nEssa regra empírica é útil para uma leitura rápida da dispersão: quase toda a massa de probabilidade (cerca de $99{,}7\\%$) está a menos de três desvios padrão da média.",
                    },
                    {
                        type: "text",
                        value: "## Por que a normal é onipresente\n\nA centralidade da normal vem do **teorema central do limite**: sob condições bastante gerais, a soma (ou a média) de um grande número de variáveis aleatórias independentes, cada uma com contribuição pequena, tem distribuição aproximadamente normal, qualquer que seja a distribuição original das parcelas.\n\nIsso explica por que tantas grandezas do mundo real, como erros de medição, ruídos e médias amostrais, são bem descritas pela normal: elas resultam do acúmulo de muitos efeitos pequenos e independentes. Em particular, a $\\text{Binomial}(n, p)$ é aproximadamente normal para $n$ grande, resultado conhecido como teorema de de Moivre-Laplace.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: padronização\n\nAs notas de uma prova seguem, aproximadamente, uma normal com média $\\mu = 70$ e desvio padrão $\\sigma = 10$. Qual a probabilidade de um aluno tirar mais de $90$?\n\nPadronizamos o valor $90$:\n\n$$Z = \\frac{90 - 70}{10} = 2.$$\n\nLogo $P(X > 90) = P(Z > 2)$. Pela regra empírica, cerca de $95\\%$ da massa está entre $-2$ e $2$ desvios, sobrando $5\\%$ nas duas caudas; por simetria, cada cauda tem cerca de $2{,}5\\%$. Assim,\n\n$$P(X > 90) = P(Z > 2) \\approx 0{,}025.$$\n\nO valor mais preciso, obtido por tabela, é $0{,}0228$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n| Distribuição | Suporte | Parâmetros | Média | Variância |\n| --- | --- | --- | --- | --- |\n| Normal$(\\mu, \\sigma^2)$ | $\\mathbb{R}$ | $\\mu,\\ \\sigma^2$ | $\\mu$ | $\\sigma^2$ |\n\nA normal é simétrica em torno de $\\mu$, completamente determinada por média e variância, e fechada sob combinações lineares e somas independentes. A padronização $Z = (X - \\mu)/\\sigma$ reduz qualquer normal à normal padrão, e o teorema central do limite explica sua onipresença.",
                    },
                    {
                        type: "quote",
                        value: "Some muitos acasos pequenos e independentes e, no limite, sempre reencontrará a curva em forma de sino.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Seja $X \\sim N(\\mu, \\sigma^2)$. Qual é a variância $\\text{Var}(X)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sigma$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sigma^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\mu$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{\\sigma}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para padronizar $X \\sim N(\\mu, \\sigma^2)$, transformando-a em uma normal padrão, usamos:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$Z = \\dfrac{X - \\mu}{\\sigma^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$Z = \\dfrac{X - \\mu}{\\sigma}$",
                                isCorrect: true,
                            },
                            {
                                text: "$Z = \\dfrac{X - \\sigma}{\\mu}$",
                                isCorrect: false,
                            },
                            {
                                text: "$Z = \\dfrac{X - \\mu}{\\sqrt{\\mu}}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $X \\sim N(\\mu, \\sigma^2)$. Aproximadamente, quanto vale $P(\\mu - \\sigma < X < \\mu + \\sigma)$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$95\\%$",
                                isCorrect: false,
                            },
                            {
                                text: "$68\\%$",
                                isCorrect: true,
                            },
                            {
                                text: "$99{,}7\\%$",
                                isCorrect: false,
                            },
                            {
                                text: "$50\\%$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $X \\sim N(\\mu_1, \\sigma_1^2)$ e $Y \\sim N(\\mu_2, \\sigma_2^2)$ independentes. Então $X + Y$ segue:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$N(\\mu_1 + \\mu_2,\\ \\sigma_1^2 + \\sigma_2^2)$",
                                isCorrect: true,
                            },
                            {
                                text: "$N(\\mu_1 + \\mu_2,\\ \\sigma_1^2 - \\sigma_2^2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$N(\\mu_1 \\mu_2,\\ \\sigma_1^2 \\sigma_2^2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$N(\\mu_1 + \\mu_2,\\ \\sigma_1 + \\sigma_2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $X \\sim N(\\mu, \\sigma^2)$ e defina $Y = aX + b$ com $a \\neq 0$. Então $Y$ segue:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$N(a\\mu + b,\\ a \\sigma^2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$N(a\\mu + b,\\ a^2 \\sigma^2)$",
                                isCorrect: true,
                            },
                            {
                                text: "$N(a\\mu,\\ a^2 \\sigma^2 + b)$",
                                isCorrect: false,
                            },
                            {
                                text: "$N(a\\mu + b,\\ a^2 \\sigma^2 + b^2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Escolhendo a distribuição certa",
                blocks: [
                    {
                        type: "text",
                        value: "## Modelar é escolher uma distribuição\n\nBoa parte do trabalho estatístico começa com uma pergunta de modelagem: qual distribuição descreve bem o fenômeno em estudo? A escolha não é arbitrária. Ela decorre de características concretas do experimento, como a natureza da variável (contagem ou medida), a presença de independência, a existência de uma taxa constante ou de falta de memória.\n\nNesta aula, organizamos as distribuições vistas no módulo em um roteiro de decisão e revisamos as relações que as conectam. O objetivo é que, diante de um problema novo, você consiga identificar rapidamente o modelo mais adequado.",
                    },
                    {
                        type: "text",
                        value: "## Primeira pergunta: discreta ou contínua?\n\nO primeiro divisor de águas é o tipo de valor que a variável assume.\n\nUma variável **discreta** assume valores isolados, tipicamente resultado de uma **contagem**: número de sucessos, de tentativas, de ocorrências. Candidatas naturais são a Bernoulli, a binomial, a geométrica e a Poisson.\n\nUma variável **contínua** assume valores em um intervalo da reta, tipicamente resultado de uma **medida**: tempo, comprimento, peso, erro. Candidatas naturais são a uniforme, a exponencial e a normal.",
                    },
                    {
                        type: "text",
                        value: "## Roteiro das distribuições discretas\n\nIdentificado o caráter discreto, as perguntas seguintes refinam a escolha.\n\n- **Bernoulli$(p)$**: há um único ensaio com dois resultados possíveis (sucesso ou fracasso)? A variável indica apenas se o sucesso ocorreu.\n- **Binomial$(n, p)$**: conta-se o número de sucessos em um número **fixo** $n$ de ensaios independentes, todos com a mesma probabilidade $p$?\n- **Geométrica$(p)$**: conta-se o número de ensaios independentes **até o primeiro sucesso**? Aqui o número de tentativas não é fixo.\n- **Poisson$(\\lambda)$**: conta-se o número de ocorrências em um intervalo fixo de tempo ou espaço, com taxa média $\\lambda$ e eventos raros e independentes?",
                    },
                    {
                        type: "text",
                        value: "## Roteiro das distribuições contínuas\n\nPara variáveis contínuas, as características decisivas são a forma da densidade e a presença de propriedades especiais.\n\n- **Uniforme$(a, b)$**: todos os valores de um intervalo $[a, b]$ são igualmente prováveis, sem qualquer preferência? A densidade é constante.\n- **Exponencial$(\\lambda)$**: mede-se um **tempo de espera** até um evento em um processo sem memória, como vida útil ou intervalo entre chegadas?\n- **Normal$(\\mu, \\sigma^2)$**: a grandeza resulta do acúmulo de muitos efeitos pequenos e independentes, ou é uma soma ou média de muitas parcelas? A densidade é simétrica em forma de sino.",
                    },
                    {
                        type: "text",
                        value: "## Tabela de referência\n\n| Distribuição | Tipo | Suporte | Média | Variância |\n| --- | --- | --- | --- | --- |\n| Bernoulli$(p)$ | Discreta | $\\{0, 1\\}$ | $p$ | $p(1-p)$ |\n| Binomial$(n, p)$ | Discreta | $\\{0, \\dots, n\\}$ | $np$ | $np(1-p)$ |\n| Geométrica$(p)$ | Discreta | $\\{1, 2, \\dots\\}$ | $\\dfrac{1}{p}$ | $\\dfrac{1-p}{p^2}$ |\n| Poisson$(\\lambda)$ | Discreta | $\\{0, 1, \\dots\\}$ | $\\lambda$ | $\\lambda$ |\n| Uniforme$(a, b)$ | Contínua | $[a, b]$ | $\\dfrac{a+b}{2}$ | $\\dfrac{(b-a)^2}{12}$ |\n| Exponencial$(\\lambda)$ | Contínua | $[0, \\infty)$ | $\\dfrac{1}{\\lambda}$ | $\\dfrac{1}{\\lambda^2}$ |\n| Normal$(\\mu, \\sigma^2)$ | Contínua | $\\mathbb{R}$ | $\\mu$ | $\\sigma^2$ |",
                    },
                    {
                        type: "text",
                        value: "## Exemplos de classificação\n\nVejamos como o roteiro se aplica a situações concretas.\n\n- Número de peças defeituosas em um lote de $50$, cada uma defeituosa com probabilidade $0{,}02$, de forma independente: número fixo de ensaios, contagem de sucessos, portanto **Binomial$(50,\\ 0{,}02)$** e, como $n$ é grande e $p$ pequeno, bem aproximada por uma **Poisson$(1)$**.\n- Número de acessos a um site por segundo, eventos raros e independentes a uma taxa média: **Poisson**.\n- Tempo até a próxima falha de um servidor que não envelhece: **Exponencial**.\n- Altura de adultos de uma população, acúmulo de muitos fatores: **Normal**.\n- Número de lançamentos de uma moeda até sair a primeira cara: **Geométrica**.\n- Posição de um ponto escolhido ao acaso sobre um segmento: **Uniforme**.",
                    },
                    {
                        type: "text",
                        value: "## Relações entre as distribuições\n\nAs sete distribuições não são ilhas isoladas; várias se conectam.\n\n- A **binomial** é a soma de $n$ Bernoullis independentes de mesmo $p$.\n- A **Poisson** é o limite da binomial quando $n \\to \\infty$ e $p \\to 0$ com $np = \\lambda$ fixo (lei dos eventos raros).\n- A **exponencial** é o análogo contínuo da geométrica: ambas são as únicas sem memória, uma no tempo contínuo, outra no discreto.\n- Os tempos entre eventos de um processo de **Poisson** são **exponenciais** de mesma taxa.\n- Pelo **teorema central do limite**, somas e médias de muitas variáveis independentes tendem à **normal**; em particular, a binomial se aproxima da normal para $n$ grande.",
                    },
                    {
                        type: "text",
                        value: "## Um roteiro em três passos\n\nDiante de um problema, siga três perguntas.\n\nPrimeiro, a variável é uma **contagem** (discreta) ou uma **medida** (contínua)? Segundo, quais são as **condições do experimento**: há um número fixo de ensaios, uma espera até o primeiro sucesso, uma taxa constante de eventos raros, uma densidade constante, uma falta de memória, um acúmulo de muitos efeitos? Terceiro, os **parâmetros** do modelo escolhido podem ser estimados a partir de média e variância conhecidas?\n\nCom esse roteiro e a tabela de referência, a escolha da distribuição deixa de ser um chute e passa a ser uma dedução a partir da estrutura do problema.",
                    },
                    {
                        type: "quote",
                        value: "A distribuição certa não se adivinha: ela se deduz da estrutura do experimento e das perguntas que fazemos sobre ele.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Conta-se o número de sucessos em $n$ ensaios independentes, cada um com probabilidade $p$ de sucesso. A distribuição adequada é a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Poisson",
                                isCorrect: false,
                            },
                            {
                                text: "Binomial",
                                isCorrect: true,
                            },
                            {
                                text: "Geométrica",
                                isCorrect: false,
                            },
                            {
                                text: "Exponencial",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O número de e-mails que chegam a um servidor por hora, tratados como eventos raros e independentes a uma taxa média, é bem modelado pela:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Poisson",
                                isCorrect: true,
                            },
                            {
                                text: "Binomial",
                                isCorrect: false,
                            },
                            {
                                text: "Normal",
                                isCorrect: false,
                            },
                            {
                                text: "Uniforme",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual distribuição contínua atribui a mesma probabilidade a quaisquer dois subintervalos de igual comprimento?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Exponencial",
                                isCorrect: false,
                            },
                            {
                                text: "Uniforme",
                                isCorrect: true,
                            },
                            {
                                text: "Normal",
                                isCorrect: false,
                            },
                            {
                                text: "Geométrica",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para qual das distribuições a média é igual à variância?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Binomial",
                                isCorrect: false,
                            },
                            {
                                text: "Normal",
                                isCorrect: false,
                            },
                            {
                                text: "Poisson",
                                isCorrect: true,
                            },
                            {
                                text: "Exponencial",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A $\\text{Binomial}(n, p)$ é bem aproximada por uma $\\text{Poisson}(\\lambda)$ quando:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$n$ é pequeno e $p$ é grande, com $\\lambda = np$",
                                isCorrect: false,
                            },
                            {
                                text: "$n$ é grande e $p$ é pequeno, com $\\lambda = np$",
                                isCorrect: true,
                            },
                            {
                                text: "$n$ é grande e $p$ é grande, com $\\lambda = n/p$",
                                isCorrect: false,
                            },
                            {
                                text: "$n$ é pequeno e $p$ é pequeno, com $\\lambda = p/n$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Vetores aleatórios",
        aulas: [
            {
                titulo: "Distribuição conjunta",
                blocks: [
                    {
                        type: "text",
                        value: "## Vetor aleatório\n\nUm **vetor aleatório** é uma função $(X,Y): \\Omega \\to \\mathbb{R}^2$ definida sobre o mesmo espaço de probabilidade, cujas componentes $X$ e $Y$ são variáveis aleatórias reais. Estudar $X$ e $Y$ isoladamente ignora como elas variam em conjunto; a **distribuição conjunta** captura exatamente essa informação, descrevendo a probabilidade de eventos que envolvem as duas ao mesmo tempo.\n\nNesta aula tratamos o caso bidimensional $(X,Y)$, mas tudo se estende a $(X_1, \\dots, X_n)$ em $\\mathbb{R}^n$ sem mudanças conceituais.",
                    },
                    {
                        type: "text",
                        value: "## Função de distribuição conjunta\n\nA **função de distribuição acumulada conjunta** de $(X,Y)$ é\n$$ F_{X,Y}(x,y) = P(X \\le x,\\, Y \\le y), \\qquad (x,y) \\in \\mathbb{R}^2. $$\nEla determina completamente a distribuição do vetor. Suas propriedades fundamentais são:\n\n- é não decrescente em cada argumento;\n- é contínua à direita em cada argumento;\n- $\\lim_{x \\to -\\infty} F_{X,Y}(x,y) = 0$ e $\\lim_{y \\to -\\infty} F_{X,Y}(x,y) = 0$;\n- $\\lim_{x,\\, y \\to +\\infty} F_{X,Y}(x,y) = 1$.\n\nAlém disso vale a **desigualdade do retângulo**: para $a_1 \\le b_1$ e $a_2 \\le b_2$,\n$$ P(a_1 < X \\le b_1,\\, a_2 < Y \\le b_2) = F(b_1,b_2) - F(a_1,b_2) - F(b_1,a_2) + F(a_1,a_2) \\ge 0. $$\nEssa condição não é consequência da monotonicidade em cada eixo e precisa ser exigida à parte.",
                    },
                    {
                        type: "text",
                        value: "## Caso discreto: função de probabilidade conjunta\n\nQuando $(X,Y)$ assume valores num conjunto finito ou enumerável, a distribuição é descrita pela **função de probabilidade conjunta**\n$$ p_{X,Y}(x,y) = P(X = x,\\, Y = y). $$\nEla satisfaz $p_{X,Y}(x,y) \\ge 0$ e $\\sum_{x} \\sum_{y} p_{X,Y}(x,y) = 1$, onde a soma percorre todos os pares do suporte. A probabilidade de qualquer evento $A \\subseteq \\mathbb{R}^2$ é obtida somando a massa dos pontos de $A$:\n$$ P\\big((X,Y) \\in A\\big) = \\sum_{(x,y) \\in A} p_{X,Y}(x,y). $$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo discreto\n\nSejam $X \\in \\{0,1\\}$ e $Y \\in \\{0,1,2\\}$ com a função de probabilidade conjunta dada pela tabela, em que cada célula é $p_{X,Y}(x,y)$:\n\n| $X \\backslash Y$ | $0$ | $1$ | $2$ |\n|:---:|:---:|:---:|:---:|\n| $\\mathbf{0}$ | $0{,}1$ | $0{,}2$ | $0{,}1$ |\n| $\\mathbf{1}$ | $0{,}2$ | $0{,}3$ | $0{,}1$ |\n\nA soma de todas as entradas é $0{,}1+0{,}2+0{,}1+0{,}2+0{,}3+0{,}1 = 1$, então a tabela define de fato uma distribuição. Para calcular, por exemplo, $P(X \\le 0,\\, Y \\le 1)$, somamos as células com $x = 0$ e $y \\in \\{0,1\\}$:\n$$ P(X \\le 0,\\, Y \\le 1) = p_{X,Y}(0,0) + p_{X,Y}(0,1) = 0{,}1 + 0{,}2 = 0{,}3. $$",
                    },
                    {
                        type: "text",
                        value: "## Caso contínuo: densidade conjunta\n\nO vetor $(X,Y)$ é **absolutamente contínuo** quando existe uma função $f_{X,Y} \\ge 0$, a **densidade conjunta**, tal que\n$$ F_{X,Y}(x,y) = \\int_{-\\infty}^{x} \\int_{-\\infty}^{y} f_{X,Y}(u,v)\\, dv\\, du. $$\nNos pontos de continuidade vale $f_{X,Y}(x,y) = \\dfrac{\\partial^2 F_{X,Y}}{\\partial x\\, \\partial y}(x,y)$. A densidade integra $1$ sobre o plano,\n$$ \\int_{-\\infty}^{\\infty} \\int_{-\\infty}^{\\infty} f_{X,Y}(x,y)\\, dx\\, dy = 1, $$\ne a probabilidade de uma região $A$ é o volume sob a densidade:\n$$ P\\big((X,Y) \\in A\\big) = \\iint_{A} f_{X,Y}(x,y)\\, dx\\, dy. $$\nDiferente do caso discreto, $f_{X,Y}(x,y)$ não é uma probabilidade e pode ser maior que $1$; probabilidades surgem apenas após integrar.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo contínuo\n\nConsidere $f_{X,Y}(x,y) = c\\,(x + y)$ para $(x,y) \\in [0,1]^2$ e zero fora. Para achar a constante $c$, impomos que a integral total valha $1$:\n$$ \\int_0^1 \\int_0^1 c\\,(x+y)\\, dx\\, dy = c \\int_0^1 \\Big( \\tfrac{1}{2} + y \\Big)\\, dy = c \\Big( \\tfrac{1}{2} + \\tfrac{1}{2} \\Big) = c. $$\nLogo $c = 1$ e $f_{X,Y}(x,y) = x + y$ no quadrado unitário. Como aplicação, a probabilidade da região $\\{X < \\tfrac{1}{2},\\, Y < \\tfrac{1}{2}\\}$ é\n$$ \\int_0^{1/2} \\int_0^{1/2} (x+y)\\, dx\\, dy = \\int_0^{1/2} \\Big( \\tfrac{1}{8} + \\tfrac{y}{2} \\Big) dy = \\tfrac{1}{16} + \\tfrac{1}{16} = \\tfrac{1}{8}. $$",
                    },
                    {
                        type: "quote",
                        value: "A distribuição conjunta é o objeto primário: dela se extraem as marginais e as condicionais, nunca o contrário.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Um vetor aleatório reúne várias variáveis definidas no mesmo espaço; a distribuição conjunta descreve seu comportamento simultâneo.\n- A distribuição acumulada conjunta $F_{X,Y}$ vale para qualquer tipo de vetor e determina toda a distribuição.\n- No caso discreto usamos a função de probabilidade conjunta $p_{X,Y}$, com soma $1$; no caso contínuo, a densidade conjunta $f_{X,Y}$, com integral $1$.\n- Probabilidades de eventos vêm de somar (discreto) ou integrar (contínuo) sobre a região de interesse.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Para que uma tabela de valores $p_{X,Y}(x,y)$ defina uma função de probabilidade conjunta, é necessário e suficiente que:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "cada valor seja não negativo e a soma de todos eles seja igual a $1$",
                                isCorrect: true,
                            },
                            {
                                text: "cada valor esteja entre $0$ e $1$ e a soma de cada linha seja igual a $1$",
                                isCorrect: false,
                            },
                            {
                                text: "cada valor seja não negativo e a soma de cada coluna seja igual a $1$",
                                isCorrect: false,
                            },
                            {
                                text: "cada valor seja positivo e o maior deles seja igual a $1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre a densidade conjunta $f_{X,Y}$ de um vetor contínuo, é correto afirmar que:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "pode assumir valores maiores que $1$, pois só integrais dela são probabilidades",
                                isCorrect: true,
                            },
                            {
                                text: "nunca ultrapassa $1$, uma vez que ela própria já é uma probabilidade",
                                isCorrect: false,
                            },
                            {
                                text: "é sempre igual a $1$ em todos os pontos do seu suporte",
                                isCorrect: false,
                            },
                            {
                                text: "coincide com $P(X = x,\\, Y = y)$ em cada ponto do plano",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $f_{X,Y}(x,y) = c\\,xy$ para $(x,y) \\in [0,1]^2$ e zero fora, então a constante $c$ vale:",
                        difficulty: "medio",
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
                                text: "$\\tfrac{1}{4}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com $X \\in \\{0,1\\}$, $Y \\in \\{0,1,2\\}$ e $p_{X,Y}(1,0)=0{,}2$, $p_{X,Y}(1,1)=0{,}3$, $p_{X,Y}(1,2)=0{,}1$, o valor de $P(X = 1,\\, Y \\ge 1)$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0{,}4$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}6$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}3$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para um vetor $(X,Y)$ com distribuição acumulada conjunta $F$, a probabilidade $P(a_1 < X \\le b_1,\\, a_2 < Y \\le b_2)$, com $a_1 \\le b_1$ e $a_2 \\le b_2$, é igual a:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$F(b_1,b_2) - F(a_1,b_2) - F(b_1,a_2) + F(a_1,a_2)$",
                                isCorrect: true,
                            },
                            {
                                text: "$F(b_1,b_2) - F(a_1,b_2) - F(b_1,a_2) - F(a_1,a_2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$F(b_1,b_2) + F(a_1,b_2) + F(b_1,a_2) - F(a_1,a_2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$F(b_1,b_2) - F(a_1,a_2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Distribuições marginais e condicionais",
                blocks: [
                    {
                        type: "text",
                        value: "## Das conjuntas às marginais\n\nA partir da distribuição conjunta de $(X,Y)$ podemos recuperar a distribuição de cada componente isoladamente, chamada **distribuição marginal**. O nome vem das tabelas de dupla entrada, em que essas distribuições apareciam somadas nas margens. A ideia central é acumular toda a probabilidade sobre a variável que queremos descartar.",
                    },
                    {
                        type: "text",
                        value: "## Marginais no caso discreto\n\nSe $(X,Y)$ tem função de probabilidade conjunta $p_{X,Y}$, a **marginal de $X$** é obtida somando sobre todos os valores de $Y$:\n$$ p_X(x) = \\sum_{y} p_{X,Y}(x,y), $$\ne analogamente $p_Y(y) = \\sum_{x} p_{X,Y}(x,y)$. Cada marginal é uma função de probabilidade legítima em uma variável. Observe que as marginais são determinadas pela conjunta, mas a recíproca é falsa: conjuntas diferentes podem ter exatamente as mesmas marginais.",
                    },
                    {
                        type: "text",
                        value: "## Marginais no caso contínuo\n\nPara um vetor contínuo com densidade $f_{X,Y}$, integra-se a variável indesejada:\n$$ f_X(x) = \\int_{-\\infty}^{\\infty} f_{X,Y}(x,y)\\, dy, \\qquad f_Y(y) = \\int_{-\\infty}^{\\infty} f_{X,Y}(x,y)\\, dx. $$\nO papel que a soma tinha no caso discreto passa a ser da integral. O resultado $f_X$ é uma densidade em uma variável, com $\\int_{-\\infty}^{\\infty} f_X(x)\\, dx = 1$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: marginais de $f_{X,Y}(x,y) = x + y$\n\nCom $f_{X,Y}(x,y) = x + y$ em $[0,1]^2$, a marginal de $X$, para $x \\in [0,1]$, é\n$$ f_X(x) = \\int_0^1 (x + y)\\, dy = \\Big[ xy + \\tfrac{y^2}{2} \\Big]_0^1 = x + \\tfrac{1}{2}. $$\nPor simetria, $f_Y(y) = y + \\tfrac{1}{2}$ em $[0,1]$. Verifica-se $\\int_0^1 \\big( x + \\tfrac{1}{2} \\big)\\, dx = \\tfrac{1}{2} + \\tfrac{1}{2} = 1$, como esperado de uma densidade.",
                    },
                    {
                        type: "text",
                        value: "## Distribuições condicionais: caso discreto\n\nA **função de probabilidade condicional** de $Y$ dado $X = x$, definida para todo $x$ com $p_X(x) > 0$, é\n$$ p_{Y \\mid X}(y \\mid x) = \\frac{p_{X,Y}(x,y)}{p_X(x)}. $$\nFixado $x$, isso é uma função de probabilidade legítima em $y$: é não negativa e\n$$ \\sum_y p_{Y \\mid X}(y \\mid x) = \\frac{\\sum_y p_{X,Y}(x,y)}{p_X(x)} = \\frac{p_X(x)}{p_X(x)} = 1. $$\nNa prática, ela reescala a linha correspondente da tabela para que volte a somar $1$.",
                    },
                    {
                        type: "text",
                        value: "## Distribuições condicionais: caso contínuo\n\nPara vetores contínuos, define-se a **densidade condicional** de $Y$ dado $X = x$, nos pontos com $f_X(x) > 0$, por\n$$ f_{Y \\mid X}(y \\mid x) = \\frac{f_{X,Y}(x,y)}{f_X(x)}. $$\nNote que condicionamos no evento $\\{X = x\\}$, que tem probabilidade zero no caso contínuo; ainda assim a definição é consistente, pois $f_{Y \\mid X}(\\cdot \\mid x)$ integra $1$ em $y$ para cada $x$ fixado. Vale ainda a fatoração $f_{X,Y}(x,y) = f_X(x)\\, f_{Y \\mid X}(y \\mid x)$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo contínuo de condicional\n\nAinda com $f_{X,Y}(x,y) = x + y$ e $f_X(x) = x + \\tfrac{1}{2}$, a densidade condicional de $Y$ dado $X = x$, para $y \\in [0,1]$, é\n$$ f_{Y \\mid X}(y \\mid x) = \\frac{x + y}{x + \\tfrac{1}{2}}. $$\nPara $x = 0$, por exemplo, obtém-se $f_{Y \\mid X}(y \\mid 0) = \\dfrac{y}{1/2} = 2y$, uma densidade triangular em $[0,1]$. Repare que a condicional depende de $x$, sinal de que $X$ e $Y$ não são independentes, tema da próxima aula.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo discreto de condicional\n\nRetomando a tabela da aula anterior, a marginal de $X$ é $p_X(0) = 0{,}4$ e $p_X(1) = 0{,}6$. A condicional de $Y$ dado $X = 0$ divide a primeira linha por $0{,}4$:\n$$ p_{Y \\mid X}(0 \\mid 0) = \\frac{0{,}1}{0{,}4} = 0{,}25, \\quad p_{Y \\mid X}(1 \\mid 0) = \\frac{0{,}2}{0{,}4} = 0{,}5, \\quad p_{Y \\mid X}(2 \\mid 0) = \\frac{0{,}1}{0{,}4} = 0{,}25, $$\nvalores que de fato somam $1$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Marginais se obtêm eliminando a outra variável: somando no caso discreto, integrando no caso contínuo.\n- As marginais são determinadas pela conjunta, mas não a determinam de volta.\n- As condicionais renormalizam a conjunta pela marginal daquilo que foi condicionado: $p_{Y \\mid X} = p_{X,Y}/p_X$ e $f_{Y \\mid X} = f_{X,Y}/f_X$.\n- Vale sempre a fatoração: conjunta igual a marginal vezes condicional.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A distribuição marginal $p_X(x)$ a partir da conjunta $p_{X,Y}$ é obtida por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sum_{y} p_{X,Y}(x,y)$, somando sobre todos os valores de $Y$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sum_{x} p_{X,Y}(x,y)$, somando sobre todos os valores de $X$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\prod_{y} p_{X,Y}(x,y)$, multiplicando sobre os valores de $Y$",
                                isCorrect: false,
                            },
                            {
                                text: "$p_{X,Y}(x,y)$ dividido pela marginal $p_Y(y)$ correspondente",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para um vetor contínuo com densidade $f_{X,Y}$, a densidade marginal $f_Y(y)$ é dada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\int_{-\\infty}^{\\infty} f_{X,Y}(x,y)\\, dx$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\int_{-\\infty}^{\\infty} f_{X,Y}(x,y)\\, dy$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{f_{X,Y}(x,y)}{f_X(x)}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{\\partial^2 F_{X,Y}}{\\partial x\\, \\partial y}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A densidade condicional $f_{Y \\mid X}(y \\mid x)$, nos pontos com $f_X(x) > 0$, é definida como:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\dfrac{f_{X,Y}(x,y)}{f_X(x)}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{f_{X,Y}(x,y)}{f_Y(y)}$",
                                isCorrect: false,
                            },
                            {
                                text: "$f_{X,Y}(x,y)\\, f_X(x)$",
                                isCorrect: false,
                            },
                            {
                                text: "$f_X(x)\\, f_Y(y)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $f_{X,Y}(x,y) = x + y$ em $[0,1]^2$, então a densidade marginal $f_X(x)$, para $x \\in [0,1]$, é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$x + \\tfrac{1}{2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$x + 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\tfrac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$2x$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com $p_{X,Y}(0,0)=0{,}1$, $p_{X,Y}(0,1)=0{,}2$ e $p_{X,Y}(0,2)=0{,}1$ na linha $X=0$, a probabilidade condicional $p_{Y \\mid X}(1 \\mid 0)$ vale:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$0{,}5$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}2$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}25$",
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
            {
                titulo: "Independência de variáveis aleatórias",
                blocks: [
                    {
                        type: "text",
                        value: "## Definição de independência\n\nDuas variáveis aleatórias $X$ e $Y$ são **independentes** quando a distribuição acumulada conjunta se fatora no produto das marginais em todos os pontos:\n$$ F_{X,Y}(x,y) = F_X(x)\\, F_Y(y), \\qquad \\forall\\, (x,y) \\in \\mathbb{R}^2. $$\nIntuitivamente, saber o valor de uma delas não altera a distribuição da outra. Essa é a definição geral, válida para qualquer tipo de vetor; nas próximas seções traduzimos a condição para os casos discreto e contínuo.",
                    },
                    {
                        type: "text",
                        value: "## Independência no caso discreto\n\nNo caso discreto, $X$ e $Y$ são independentes se, e somente se, a função de probabilidade conjunta se fatora:\n$$ p_{X,Y}(x,y) = p_X(x)\\, p_Y(y) \\qquad \\text{para todo par } (x,y). $$\nA exigência vale para **todos** os pares. Basta uma única célula em que $p_{X,Y}(x,y) \\ne p_X(x)\\, p_Y(y)$ para que $X$ e $Y$ sejam dependentes.",
                    },
                    {
                        type: "text",
                        value: "## Independência no caso contínuo\n\nPara vetores contínuos, a independência equivale à fatoração da densidade conjunta:\n$$ f_{X,Y}(x,y) = f_X(x)\\, f_Y(y) \\qquad \\text{quase sempre}. $$\nDe modo equivalente, $X$ e $Y$ são independentes exatamente quando a densidade condicional coincide com a marginal, $f_{Y \\mid X}(y \\mid x) = f_Y(y)$; ou seja, condicionar em $X$ não muda a distribuição de $Y$.",
                    },
                    {
                        type: "text",
                        value: "## Critério da fatoração\n\nMuitas vezes verificar independência não exige calcular as marginais. Vale o seguinte critério: se a densidade (ou a função de probabilidade) conjunta se escreve como\n$$ f_{X,Y}(x,y) = g(x)\\, h(y) $$\npara funções não negativas $g$ e $h$, **e** o suporte é um retângulo, isto é, um produto de um conjunto de valores de $x$ por um de $y$, então $X$ e $Y$ são independentes. As marginais são $g$ e $h$ a menos de constantes de normalização. A condição sobre o suporte é essencial e costuma ser esquecida.",
                    },
                    {
                        type: "text",
                        value: "## Consequências da independência\n\nSe $X$ e $Y$ são independentes, então, para funções $g$ e $h$ adequadas, vale a **fatoração da esperança**:\n$$ E[\\, g(X)\\, h(Y)\\, ] = E[\\, g(X)\\, ]\\; E[\\, h(Y)\\, ], $$\nsempre que as esperanças existam. Em particular $E[XY] = E[X]\\, E[Y]$, fato que usaremos na próxima aula para concluir que variáveis independentes têm covariância nula. A recíproca não vale: covariância nula não garante independência.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: variáveis independentes\n\nSeja $f_{X,Y}(x,y) = 4xy$ em $[0,1]^2$. As marginais são\n$$ f_X(x) = \\int_0^1 4xy\\, dy = 2x, \\qquad f_Y(y) = \\int_0^1 4xy\\, dx = 2y, $$\nambas em $[0,1]$. Como $f_X(x)\\, f_Y(y) = 4xy = f_{X,Y}(x,y)$ e o suporte é o quadrado $[0,1]^2$, concluímos que $X$ e $Y$ são independentes. O critério da fatoração já anteciparia isso, pois $4xy = (2x)(2y)$ num suporte retangular.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: dependência apesar da aparência\n\nPrimeiro, $f_{X,Y}(x,y) = x + y$ em $[0,1]^2$ tem marginais $f_X(x) = x + \\tfrac{1}{2}$ e $f_Y(y) = y + \\tfrac{1}{2}$. Como $\\big( x + \\tfrac{1}{2} \\big)\\big( y + \\tfrac{1}{2} \\big) \\ne x + y$ em geral, as variáveis são dependentes.\n\nUm caso mais sutil: $f_{X,Y}(x,y) = 8xy$ no triângulo $0 \\le x \\le y \\le 1$. A expressão $8xy$ parece um produto de algo em $x$ por algo em $y$, mas o suporte não é retangular, pois o limite de $x$ depende de $y$. De fato,\n$$ f_X(x) = \\int_x^1 8xy\\, dy = 4x(1 - x^2), \\qquad f_Y(y) = \\int_0^y 8xy\\, dx = 4y^3, $$\ne o produto dessas marginais não é $8xy$. Logo $X$ e $Y$ são dependentes, apesar da aparência de fatoração.",
                    },
                    {
                        type: "quote",
                        value: "Independência é uma afirmação sobre toda a distribuição conjunta, não sobre um único número resumo como a covariância.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $X$ e $Y$ são independentes quando a conjunta se fatora nas marginais: $F_{X,Y} = F_X F_Y$, e de forma equivalente $p_{X,Y} = p_X p_Y$ ou $f_{X,Y} = f_X f_Y$.\n- Pelo critério da fatoração, basta escrever a conjunta como $g(x)\\, h(y)$ com suporte retangular.\n- Independência implica $E[g(X)h(Y)] = E[g(X)] E[h(Y)]$ e condicional igual à marginal.\n- Fatoração aparente sem suporte retangular não garante independência.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Variáveis aleatórias discretas $X$ e $Y$ são independentes se, e somente se, para todo par $(x,y)$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$p_{X,Y}(x,y) = p_X(x)\\, p_Y(y)$",
                                isCorrect: true,
                            },
                            {
                                text: "$p_{X,Y}(x,y) = p_X(x) + p_Y(y)$",
                                isCorrect: false,
                            },
                            {
                                text: "$p_{X,Y}(x,y) = p_X(x)\\, /\\, p_Y(y)$",
                                isCorrect: false,
                            },
                            {
                                text: "$p_X(x) = p_Y(y)$ sempre que $x = y$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $X$ e $Y$ são independentes e têm esperanças finitas, então necessariamente:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$E[XY] = E[X]\\, E[Y]$",
                                isCorrect: true,
                            },
                            {
                                text: "$E[X + Y] = E[X]\\, E[Y]$",
                                isCorrect: false,
                            },
                            {
                                text: "$E[XY] = E[X] + E[Y]$",
                                isCorrect: false,
                            },
                            {
                                text: "$E[X]\\, E[Y] = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre o critério que conclui independência a partir de $f_{X,Y}(x,y) = g(x)\\, h(y)$, é correto afirmar que:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "ele exige, além da fatoração, que o suporte seja retangular",
                                isCorrect: true,
                            },
                            {
                                text: "ele vale sempre que a densidade se fatora, qualquer que seja o formato do suporte",
                                isCorrect: false,
                            },
                            {
                                text: "ele se aplica apenas a variáveis discretas, nunca a variáveis contínuas",
                                isCorrect: false,
                            },
                            {
                                text: "ele garante que a covariância entre as variáveis seja diferente de zero",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $f_{X,Y}(x,y) = 4xy$ em $[0,1]^2$, com marginais $f_X(x) = 2x$ e $f_Y(y) = 2y$, as variáveis $X$ e $Y$ são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "independentes, pois $f_X(x)\\, f_Y(y)$ reproduz $f_{X,Y}(x,y)$",
                                isCorrect: true,
                            },
                            {
                                text: "dependentes, porque a densidade conjunta envolve ao mesmo tempo $x$ e $y$",
                                isCorrect: false,
                            },
                            {
                                text: "independentes, porque a covariância entre elas resulta positiva",
                                isCorrect: false,
                            },
                            {
                                text: "dependentes, porque o suporte é o quadrado unitário $[0,1]^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação sobre independência e covariância é correta em geral?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "independência implica covariância nula, mas covariância nula não implica independência",
                                isCorrect: true,
                            },
                            {
                                text: "covariância nula implica independência, mas independência não implica covariância nula",
                                isCorrect: false,
                            },
                            {
                                text: "independência e covariância nula são condições sempre equivalentes entre si",
                                isCorrect: false,
                            },
                            {
                                text: "independência implica covariância estritamente positiva entre as variáveis",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Covariância e correlação",
                blocks: [
                    {
                        type: "text",
                        value: "## Covariância\n\nA **covariância** entre $X$ e $Y$, com médias $\\mu_X = E[X]$ e $\\mu_Y = E[Y]$, é\n$$ \\operatorname{Cov}(X,Y) = E\\big[ (X - \\mu_X)(Y - \\mu_Y) \\big]. $$\nEla mede a tendência conjunta de desvio em relação às médias: é positiva quando $X$ e $Y$ tendem a estar acima (ou abaixo) da média ao mesmo tempo, e negativa quando um estar acima costuma vir acompanhado do outro abaixo. É uma medida de associação **linear**.",
                    },
                    {
                        type: "text",
                        value: "## Fórmula de cálculo\n\nExpandindo o produto e usando a linearidade da esperança, obtém-se a fórmula mais prática:\n$$ \\operatorname{Cov}(X,Y) = E[XY] - E[X]\\, E[Y]. $$\nDe fato, $E[(X - \\mu_X)(Y - \\mu_Y)] = E[XY] - \\mu_X E[Y] - \\mu_Y E[X] + \\mu_X \\mu_Y = E[XY] - \\mu_X \\mu_Y$. Em particular, $\\operatorname{Cov}(X,X) = E[X^2] - (E[X])^2 = \\operatorname{Var}(X)$: a variância é um caso particular de covariância.",
                    },
                    {
                        type: "text",
                        value: "## Propriedades\n\nA covariância é **simétrica** e **bilinear**:\n\n- $\\operatorname{Cov}(X,Y) = \\operatorname{Cov}(Y,X)$;\n- $\\operatorname{Cov}(aX + b,\\, cY + d) = ac\\,\\operatorname{Cov}(X,Y)$, isto é, constantes aditivas não afetam e fatores multiplicativos saem;\n- $\\operatorname{Cov}(X + Z,\\, Y) = \\operatorname{Cov}(X,Y) + \\operatorname{Cov}(Z,Y)$.\n\nDessas propriedades decorre quase toda a álgebra de variâncias de somas, tema da próxima aula.",
                    },
                    {
                        type: "text",
                        value: "## Independência e covariância\n\nSe $X$ e $Y$ são independentes, então $E[XY] = E[X]\\, E[Y]$ e portanto\n$$ \\operatorname{Cov}(X,Y) = 0. $$\nVariáveis com covariância nula são chamadas **não correlacionadas**. A recíproca é falsa: existem variáveis dependentes com covariância nula. Um exemplo clássico: seja $X$ uniforme em $\\{-1, 0, 1\\}$ e $Y = X^2$. Então $E[X] = 0$ e $E[XY] = E[X^3] = 0$, logo $\\operatorname{Cov}(X,Y) = 0$; mas $Y$ é função determinística de $X$, então são claramente dependentes. A covariância só enxerga associação linear.",
                    },
                    {
                        type: "text",
                        value: "## Coeficiente de correlação\n\nPara tornar a medida adimensional e comparável, define-se o **coeficiente de correlação**\n$$ \\rho_{X,Y} = \\frac{\\operatorname{Cov}(X,Y)}{\\sigma_X\\, \\sigma_Y}, $$\ncom $\\sigma_X, \\sigma_Y > 0$. Pela desigualdade de Cauchy-Schwarz, $|\\operatorname{Cov}(X,Y)| \\le \\sigma_X \\sigma_Y$, de modo que\n$$ -1 \\le \\rho_{X,Y} \\le 1. $$\nAlém disso, $|\\rho_{X,Y}| = 1$ se, e somente se, existe relação afim $Y = aX + b$ quase certamente, com o sinal de $\\rho$ igual ao sinal de $a$. Valores próximos de $0$ indicam ausência de associação **linear**, não necessariamente ausência de dependência.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nSejam $X, Y \\in \\{0,1\\}$ com a conjunta:\n\n| $X \\backslash Y$ | $0$ | $1$ |\n|:---:|:---:|:---:|\n| $\\mathbf{0}$ | $0{,}4$ | $0{,}1$ |\n| $\\mathbf{1}$ | $0{,}1$ | $0{,}4$ |\n\nAs marginais dão $E[X] = E[Y] = 0{,}5$. Como só o par $(1,1)$ contribui para $E[XY]$, temos $E[XY] = 1 \\cdot 1 \\cdot 0{,}4 = 0{,}4$, logo\n$$ \\operatorname{Cov}(X,Y) = 0{,}4 - 0{,}5 \\cdot 0{,}5 = 0{,}15. $$\nComo $\\operatorname{Var}(X) = \\operatorname{Var}(Y) = 0{,}5 - 0{,}25 = 0{,}25$, ou seja $\\sigma_X = \\sigma_Y = 0{,}5$, o coeficiente de correlação é\n$$ \\rho_{X,Y} = \\frac{0{,}15}{0{,}5 \\cdot 0{,}5} = 0{,}6. $$\nO sinal positivo confirma que $X$ e $Y$ tendem a coincidir, já que a massa se concentra em $(0,0)$ e $(1,1)$.",
                    },
                    {
                        type: "quote",
                        value: "A covariância mede apenas o alinhamento linear; toda estrutura curva entre as variáveis passa despercebida por ela.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $\\operatorname{Cov}(X,Y) = E[XY] - E[X] E[Y]$ mede associação linear, e seu sinal indica o sentido da relação.\n- É simétrica, bilinear e satisfaz $\\operatorname{Cov}(X,X) = \\operatorname{Var}(X)$.\n- Independência implica covariância nula, mas variáveis não correlacionadas podem ser dependentes.\n- O coeficiente $\\rho = \\operatorname{Cov}(X,Y)/(\\sigma_X \\sigma_Y)$ fica em $[-1,1]$, e os extremos correspondem a relação afim perfeita.",
                    },
                ],
                questions: [
                    {
                        statement: "A fórmula de cálculo da covariância entre $X$ e $Y$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\operatorname{Cov}(X,Y) = E[XY] - E[X]\\, E[Y]$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\operatorname{Cov}(X,Y) = E[XY] + E[X]\\, E[Y]$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\operatorname{Cov}(X,Y) = E[X]\\, E[Y] - E[XY]$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\operatorname{Cov}(X,Y) = E[X^2] - E[Y^2]$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para qualquer variável $X$ com variância finita, $\\operatorname{Cov}(X,X)$ é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\operatorname{Var}(X)$",
                                isCorrect: true,
                            },
                            {
                                text: "$E[X]$",
                                isCorrect: false,
                            },
                            {
                                text: "$(E[X])^2$",
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
                            "Se $\\operatorname{Cov}(X,Y) = 3$, então $\\operatorname{Cov}(2X + 5,\\, Y)$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$6$",
                                isCorrect: true,
                            },
                            {
                                text: "$11$",
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
                        statement:
                            "Sobre o coeficiente de correlação $\\rho_{X,Y}$, é correto afirmar que ele:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "está sempre contido no intervalo $[-1, 1]$",
                                isCorrect: true,
                            },
                            {
                                text: "pode assumir qualquer valor real, sem cota superior ou inferior",
                                isCorrect: false,
                            },
                            {
                                text: "é sempre igual à própria covariância $\\operatorname{Cov}(X,Y)$",
                                isCorrect: false,
                            },
                            {
                                text: "é positivo para qualquer par de variáveis $X$ e $Y$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $\\operatorname{Cov}(X,Y) = 0{,}15$, $\\operatorname{Var}(X) = 0{,}25$ e $\\operatorname{Var}(Y) = 0{,}25$, então a correlação $\\rho_{X,Y}$ vale:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$0{,}6$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}15$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}3$",
                                isCorrect: false,
                            },
                            {
                                text: "$2{,}4$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Esperança e variância de somas",
                blocks: [
                    {
                        type: "text",
                        value: "## Linearidade da esperança\n\nA esperança é **linear**, e isso vale sem qualquer hipótese sobre a relação entre as variáveis:\n$$ E[X + Y] = E[X] + E[Y], \\qquad E\\Big[ \\sum_{i=1}^{n} a_i X_i \\Big] = \\sum_{i=1}^{n} a_i\\, E[X_i]. $$\nNão é preciso independência nem covariância nula. Essa robustez faz da linearidade uma das ferramentas mais usadas em toda a probabilidade, inclusive para calcular médias de somas complicadas decompondo em parcelas simples.",
                    },
                    {
                        type: "text",
                        value: "## Variância de uma soma\n\nPara a variância a situação é diferente, pois surge um termo de covariância. Partindo da definição,\n$$ \\operatorname{Var}(X + Y) = E\\big[ (X + Y - \\mu_X - \\mu_Y)^2 \\big] = E\\big[ ((X - \\mu_X) + (Y - \\mu_Y))^2 \\big]. $$\nExpandindo o quadrado e usando a linearidade,\n$$ \\operatorname{Var}(X + Y) = \\operatorname{Var}(X) + \\operatorname{Var}(Y) + 2\\,\\operatorname{Cov}(X,Y). $$\nO termo $2\\,\\operatorname{Cov}(X,Y)$ é justamente o que falta a quem soma variâncias de forma ingênua.",
                    },
                    {
                        type: "text",
                        value: "## Somas de várias variáveis\n\nPara $n$ variáveis, a variância da soma é a soma de todas as covariâncias entre pares, incluindo os pares $(i,i)$, que dão as variâncias:\n$$ \\operatorname{Var}\\Big( \\sum_{i=1}^{n} X_i \\Big) = \\sum_{i=1}^{n} \\operatorname{Var}(X_i) + 2 \\sum_{i < j} \\operatorname{Cov}(X_i, X_j) = \\sum_{i=1}^{n} \\sum_{j=1}^{n} \\operatorname{Cov}(X_i, X_j). $$\nA forma de duplo somatório é compacta e deixa claro que a diagonal contribui com as variâncias e os termos fora dela, com as covariâncias.",
                    },
                    {
                        type: "text",
                        value: "## Caso não correlacionado\n\nQuando as variáveis são **não correlacionadas** duas a duas, o que ocorre em particular quando são independentes, todas as covariâncias cruzadas se anulam e a variância da soma vira simplesmente a soma das variâncias:\n$$ \\operatorname{Var}\\Big( \\sum_{i=1}^{n} X_i \\Big) = \\sum_{i=1}^{n} \\operatorname{Var}(X_i). $$\nVale a pena insistir: para essa simplificação basta covariância nula, não é preciso a hipótese mais forte de independência.",
                    },
                    {
                        type: "text",
                        value: "## Cuidado com a diferença\n\nUm erro frequente é supor que a variância da diferença subtrai as variâncias. Na verdade,\n$$ \\operatorname{Var}(X - Y) = \\operatorname{Var}(X) + \\operatorname{Var}(Y) - 2\\,\\operatorname{Cov}(X,Y). $$\nAs variâncias continuam **somando**; quem muda de sinal é apenas o termo de covariância. Isso decorre de escrever $X - Y = X + (-Y)$ e usar $\\operatorname{Var}(-Y) = \\operatorname{Var}(Y)$ e $\\operatorname{Cov}(X, -Y) = -\\operatorname{Cov}(X,Y)$. Se $X$ e $Y$ forem não correlacionadas, $\\operatorname{Var}(X - Y) = \\operatorname{Var}(X) + \\operatorname{Var}(Y)$, igual à variância da soma.",
                    },
                    {
                        type: "text",
                        value: "## Combinações lineares\n\nCombinando a bilinearidade da covariância com o que vimos, a variância de $aX + bY$ é\n$$ \\operatorname{Var}(aX + bY) = a^2 \\operatorname{Var}(X) + b^2 \\operatorname{Var}(Y) + 2ab\\, \\operatorname{Cov}(X,Y). $$\nOs coeficientes entram ao quadrado nos termos de variância e como produto $ab$ no termo cruzado. Fazendo $a = 1$ e $b = -1$ recupera-se a fórmula da diferença; fazendo $\\operatorname{Cov}(X,Y) = 0$, some o último termo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nRetome o vetor da aula anterior, com $\\operatorname{Var}(X) = \\operatorname{Var}(Y) = 0{,}25$ e $\\operatorname{Cov}(X,Y) = 0{,}15$. Então\n$$ \\operatorname{Var}(X + Y) = 0{,}25 + 0{,}25 + 2 \\cdot 0{,}15 = 0{,}8, $$\nenquanto\n$$ \\operatorname{Var}(X - Y) = 0{,}25 + 0{,}25 - 2 \\cdot 0{,}15 = 0{,}2. $$\nA soma tem variância maior que a diferença exatamente porque a covariância é positiva: os desvios de $X$ e $Y$ se reforçam ao somar e se cancelam ao subtrair.",
                    },
                    {
                        type: "text",
                        value: "## Aplicação: variância da média amostral\n\nSejam $X_1, \\dots, X_n$ independentes e identicamente distribuídas, com variância comum $\\sigma^2$. Como as covariâncias cruzadas se anulam,\n$$ \\operatorname{Var}\\Big( \\sum_{i=1}^{n} X_i \\Big) = n\\,\\sigma^2, $$\ne para a média amostral $\\bar{X} = \\tfrac{1}{n} \\sum_{i=1}^{n} X_i$, usando $\\operatorname{Var}(aX) = a^2 \\operatorname{Var}(X)$,\n$$ \\operatorname{Var}(\\bar{X}) = \\frac{1}{n^2} \\cdot n\\,\\sigma^2 = \\frac{\\sigma^2}{n}. $$\nÉ o resultado que fundamenta por que médias de amostras maiores são mais estáveis, base da lei dos grandes números.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A esperança é sempre linear: $E[\\sum a_i X_i] = \\sum a_i E[X_i]$, sem hipóteses adicionais.\n- $\\operatorname{Var}(X + Y) = \\operatorname{Var}(X) + \\operatorname{Var}(Y) + 2\\operatorname{Cov}(X,Y)$; não esqueça o termo de covariância.\n- Na diferença as variâncias ainda somam: só o termo $2\\operatorname{Cov}$ troca de sinal.\n- Se as variáveis são não correlacionadas, a variância da soma é a soma das variâncias, e $\\operatorname{Var}(\\bar{X}) = \\sigma^2/n$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Para quaisquer variáveis $X$ e $Y$ com esperanças finitas, $E[X + Y]$ é igual a:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$E[X] + E[Y]$, sem necessidade de independência",
                                isCorrect: true,
                            },
                            {
                                text: "$E[X] + E[Y]$, apenas quando $X$ e $Y$ são independentes",
                                isCorrect: false,
                            },
                            {
                                text: "$E[X]\\, E[Y]$, em qualquer situação",
                                isCorrect: false,
                            },
                            {
                                text: "$E[X] + E[Y] + 2\\operatorname{Cov}(X,Y)$, em qualquer situação",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A variância da soma $\\operatorname{Var}(X + Y)$ é dada por:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\operatorname{Var}(X) + \\operatorname{Var}(Y) + 2\\operatorname{Cov}(X,Y)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\operatorname{Var}(X)\\,\\operatorname{Var}(Y) + 2\\operatorname{Cov}(X,Y)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\operatorname{Var}(X) + \\operatorname{Var}(Y) + \\operatorname{Cov}(X,Y)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\operatorname{Var}(X) + \\operatorname{Var}(Y)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $X$ e $Y$ têm covariância $\\operatorname{Cov}(X,Y)$, então $\\operatorname{Var}(X - Y)$ é igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\operatorname{Var}(X) + \\operatorname{Var}(Y) - 2\\operatorname{Cov}(X,Y)$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\operatorname{Var}(X) - \\operatorname{Var}(Y) - 2\\operatorname{Cov}(X,Y)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\operatorname{Var}(X) + \\operatorname{Var}(Y) + 2\\operatorname{Cov}(X,Y)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\operatorname{Var}(X) - \\operatorname{Var}(Y)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $X$ e $Y$ são independentes com $\\operatorname{Var}(X) = 2$ e $\\operatorname{Var}(Y) = 3$, então $\\operatorname{Var}(X + Y)$ vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sqrt{5}$",
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
                            "Para $X_1, \\dots, X_n$ independentes e identicamente distribuídas com variância $\\sigma^2$, a variância da média amostral $\\bar{X} = \\tfrac{1}{n}\\sum_{i=1}^{n} X_i$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\dfrac{\\sigma^2}{n}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sigma^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$n\\,\\sigma^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{\\sigma^2}{n^2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Teoremas limite e distribuições amostrais",
        aulas: [
            {
                titulo: "A desigualdade de Chebyshev",
                blocks: [
                    {
                        type: "text",
                        value: "# A desigualdade de Chebyshev\n\nEm muitas situações conhecemos a média $\\mu$ e a variância $\\sigma^2$ de uma variável aleatória, mas não a sua distribuição completa. A desigualdade de Chebyshev é uma das ferramentas mais poderosas da estatística matemática justamente porque permite **limitar probabilidades** usando apenas esses dois momentos, sem nenhuma hipótese sobre a forma da distribuição.\n\nAntes de enunciá-la, vamos estabelecer o resultado mais básico do qual ela decorre: a desigualdade de Markov.",
                    },
                    {
                        type: "text",
                        value: "## A desigualdade de Markov\n\nSeja $X$ uma variável aleatória **não negativa** ($X \\ge 0$) com esperança finita. Então, para todo $a > 0$,\n\n$$P(X \\ge a) \\le \\frac{E[X]}{a}.$$\n\n**Demonstração.** Como $X \\ge 0$, podemos escrever\n\n$$E[X] = \\int_0^{\\infty} x\\, f(x)\\, dx \\ge \\int_a^{\\infty} x\\, f(x)\\, dx \\ge \\int_a^{\\infty} a\\, f(x)\\, dx = a\\, P(X \\ge a).$$\n\nDividindo por $a > 0$ obtemos a desigualdade. A ideia é simples: apenas a cauda acima de $a$ já contribui com pelo menos $a\\, P(X \\ge a)$ para a média.",
                    },
                    {
                        type: "text",
                        value: "## O enunciado de Chebyshev\n\nSeja $X$ uma variável aleatória com média $\\mu = E[X]$ e variância $\\sigma^2 = \\text{Var}(X)$ finitas. Então, para todo $k > 0$,\n\n$$P(|X - \\mu| \\ge k\\sigma) \\le \\frac{1}{k^2}.$$\n\nEscrevendo o desvio em unidades absolutas, com $\\varepsilon = k\\sigma$, a forma equivalente é\n\n$$P(|X - \\mu| \\ge \\varepsilon) \\le \\frac{\\sigma^2}{\\varepsilon^2}.$$",
                    },
                    {
                        type: "text",
                        value: "## Demonstração\n\nBasta aplicar a desigualdade de Markov à variável não negativa $Y = (X - \\mu)^2$, com o limiar $a = k^2\\sigma^2$:\n\n$$P\\big((X - \\mu)^2 \\ge k^2\\sigma^2\\big) \\le \\frac{E[(X - \\mu)^2]}{k^2\\sigma^2} = \\frac{\\sigma^2}{k^2\\sigma^2} = \\frac{1}{k^2}.$$\n\nO passo final usa que $E[(X - \\mu)^2] = \\sigma^2$, a própria definição de variância. Como o evento $(X - \\mu)^2 \\ge k^2\\sigma^2$ é idêntico a $|X - \\mu| \\ge k\\sigma$, a demonstração está concluída.",
                    },
                    {
                        type: "text",
                        value: "## Leitura complementar\n\nTomando o complementar, obtemos uma cota **inferior** para a probabilidade de $X$ ficar próximo da média:\n\n$$P(|X - \\mu| < k\\sigma) \\ge 1 - \\frac{1}{k^2}.$$\n\nA tabela abaixo mostra a cota da cauda e a cobertura mínima garantida para alguns valores de $k$:\n\n| k | Cota 1/k² | Cobertura mínima |\n|---|---|---|\n| 1 | 1,000 | 0% |\n| 2 | 0,250 | 75% |\n| 3 | 0,111 | 88,9% |\n| 4 | 0,063 | 93,75% |\n\nRepare que a cota só é informativa para $k > 1$; para $k \\le 1$ ela fornece um valor maior ou igual a $1$, o que é trivialmente verdadeiro.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nO número de acessos por minuto a um servidor tem média $\\mu = 50$ e desvio padrão $\\sigma = 5$. Sem conhecer a distribuição, o que podemos afirmar sobre a probabilidade de haver entre $40$ e $60$ acessos?\n\nO intervalo $[40, 60]$ corresponde a $|X - 50| < 10$. Como $10 = 2 \\times 5 = 2\\sigma$, temos $k = 2$. Por Chebyshev,\n\n$$P(|X - 50| < 10) \\ge 1 - \\frac{1}{2^2} = \\frac{3}{4}.$$\n\nLogo, em pelo menos $75\\%$ dos minutos há entre $40$ e $60$ acessos, seja qual for a distribuição real.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nQuão longe da média é preciso ir para capturar pelo menos $90\\%$ da massa? Impomos $1 - \\frac{1}{k^2} \\ge 0{,}90$, ou seja, $\\frac{1}{k^2} \\le 0{,}10$, o que dá $k \\ge \\sqrt{10} \\approx 3{,}16$.\n\nCompare com a distribuição normal, na qual cerca de $95\\%$ da massa está a menos de $1{,}96\\sigma$ da média. A folga entre $3{,}16$ e $1{,}96$ revela que Chebyshev é **conservadora**: como precisa valer para toda distribuição, ela se ajusta ao pior caso possível.",
                    },
                    {
                        type: "quote",
                        value: "A força de Chebyshev não está em ser precisa para uma distribuição em particular, e sim em ser verdadeira para todas elas ao mesmo tempo.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A **desigualdade de Markov** limita a cauda de uma variável não negativa: $P(X \\ge a) \\le \\frac{E[X]}{a}$.\n- A **desigualdade de Chebyshev** decorre dela e limita o desvio em torno da média: $P(|X - \\mu| \\ge k\\sigma) \\le \\frac{1}{k^2}$.\n- É uma cota **universal**, válida sem hipótese sobre a forma da distribuição, porém **conservadora**.\n- É a peça central na demonstração da lei fraca dos grandes números, tema da próxima aula.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Segundo a desigualdade de Chebyshev, para $k > 0$, a probabilidade $P(|X - \\mu| \\ge k\\sigma)$ é limitada superiormente por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{1}{k^2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{k}$",
                                isCorrect: false,
                            },
                            {
                                text: "$k^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$1 - \\frac{1}{k^2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para qualquer distribuição com média $\\mu$ e desvio $\\sigma$, ao menos que fração da massa está no intervalo $(\\mu - 2\\sigma,\\ \\mu + 2\\sigma)$?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{3}{4}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{4}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{8}{9}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $X \\ge 0$ com $E[X] = 10$. Pela desigualdade de Markov, $P(X \\ge 40)$ é no máximo:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{4}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{40}$",
                                isCorrect: false,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{10}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma variável tem $\\mu = 100$ e $\\sigma^2 = 25$. A desigualdade de Chebyshev garante que $P(|X - 100| \\ge 10)$ é no máximo:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\frac{1}{4}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{1}{2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{1}{20}$",
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
                            "Para que Chebyshev garanta que ao menos $90\\%$ da massa esteja em $(\\mu - k\\sigma,\\ \\mu + k\\sigma)$, o menor valor de $k$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\sqrt{10}$",
                                isCorrect: true,
                            },
                            {
                                text: "$10$",
                                isCorrect: false,
                            },
                            {
                                text: "$3$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{0{,}1}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "A lei dos grandes números",
                blocks: [
                    {
                        type: "text",
                        value: "# A lei dos grandes números\n\nA intuição de que a média de muitas repetições se aproxima do valor esperado é uma das ideias fundadoras da probabilidade. A **lei dos grandes números** (LGN) transforma essa intuição em teorema. Ela aparece em duas versões, a **lei fraca** e a **lei forte**, que diferem no tipo de convergência que garantem.",
                    },
                    {
                        type: "text",
                        value: "## O cenário\n\nSeja $X_1, X_2, \\ldots$ uma sequência de variáveis aleatórias independentes e identicamente distribuídas (i.i.d.), com média $E[X_i] = \\mu$ e variância $\\text{Var}(X_i) = \\sigma^2 < \\infty$. Defina a **média amostral**\n\n$$\\bar{X}_n = \\frac{1}{n}\\sum_{i=1}^{n} X_i.$$\n\nPor linearidade e independência, $E[\\bar{X}_n] = \\mu$ e $\\text{Var}(\\bar{X}_n) = \\frac{\\sigma^2}{n}$. A variância da média encolhe quando $n$ cresce, e é isso que faz $\\bar{X}_n$ se concentrar em torno de $\\mu$.",
                    },
                    {
                        type: "text",
                        value: "## A lei fraca dos grandes números\n\n**Enunciado.** Para todo $\\varepsilon > 0$,\n\n$$\\lim_{n \\to \\infty} P(|\\bar{X}_n - \\mu| \\ge \\varepsilon) = 0.$$\n\nDizemos que $\\bar{X}_n$ **converge em probabilidade** para $\\mu$, e escrevemos $\\bar{X}_n \\xrightarrow{P} \\mu$. Em palavras: fixada qualquer tolerância $\\varepsilon$, a chance de a média amostral se afastar de $\\mu$ mais do que $\\varepsilon$ tende a zero conforme a amostra cresce.",
                    },
                    {
                        type: "text",
                        value: "## Demonstração pela desigualdade de Chebyshev\n\nApliquemos Chebyshev à média amostral, que tem média $\\mu$ e variância $\\frac{\\sigma^2}{n}$:\n\n$$P(|\\bar{X}_n - \\mu| \\ge \\varepsilon) \\le \\frac{\\text{Var}(\\bar{X}_n)}{\\varepsilon^2} = \\frac{\\sigma^2}{n\\,\\varepsilon^2}.$$\n\nCom $\\varepsilon$ fixo, o lado direito tende a zero quando $n \\to \\infty$. Como a probabilidade é não negativa, ela fica espremida até zero, o que prova a lei fraca.",
                    },
                    {
                        type: "text",
                        value: "## A lei forte dos grandes números\n\nA lei forte faz uma afirmação mais profunda:\n\n$$P\\Big(\\lim_{n \\to \\infty} \\bar{X}_n = \\mu\\Big) = 1.$$\n\nDizemos que $\\bar{X}_n$ **converge quase certamente** para $\\mu$, e escrevemos $\\bar{X}_n \\xrightarrow{q.c.} \\mu$. Enquanto a lei fraca diz que, para cada $n$ grande, é improvável que $\\bar{X}_n$ esteja longe de $\\mu$, a lei forte afirma que a própria trajetória da sequência converge para $\\mu$ com probabilidade $1$.\n\nA convergência quase certa **implica** a convergência em probabilidade, mas não vale a recíproca; por isso a lei forte tem a fraca como consequência. Vale registrar que a lei forte, na forma de Kolmogorov, exige apenas $E[|X_i|] < \\infty$, dispensando a hipótese de variância finita usada na prova da lei fraca.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nLançamos uma moeda honesta repetidamente e definimos $X_i = 1$ para cara e $X_i = 0$ para coroa. Então $\\mu = E[X_i] = 0{,}5$, e a proporção de caras em $n$ lançamentos é exatamente $\\bar{X}_n$. A LGN garante que essa proporção converge para $0{,}5$.\n\nAtenção a um mal-entendido comum: isso **não** significa que o número de caras menos o de coroas tenda a zero. Apenas a **proporção** se estabiliza em $\\frac{1}{2}$; a diferença absoluta pode até crescer sem limite.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nNo caso da moeda, $\\sigma^2 = p(1-p) = 0{,}25$. Quantos lançamentos garantem, por Chebyshev, que $P(|\\bar{X}_n - 0{,}5| \\ge 0{,}05) \\le 0{,}05$?\n\nImpomos $\\frac{\\sigma^2}{n\\,\\varepsilon^2} \\le 0{,}05$:\n\n$$n \\ge \\frac{0{,}25}{0{,}05 \\times (0{,}05)^2} = \\frac{0{,}25}{0{,}000125} = 2000.$$\n\nBastam $2000$ lançamentos para essa garantia. O número é grande porque a cota de Chebyshev é conservadora; o teorema central do limite dará uma estimativa bem menor.",
                    },
                    {
                        type: "quote",
                        value: "A lei dos grandes números não promete regularidade em cada tentativa isolada, e sim no acúmulo de muitas delas.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A **lei fraca** garante convergência em probabilidade, $\\bar{X}_n \\xrightarrow{P} \\mu$, e sai diretamente de Chebyshev.\n- A **lei forte** garante convergência quase certa, $\\bar{X}_n \\xrightarrow{q.c.} \\mu$, uma afirmação sobre a trajetória inteira.\n- A convergência quase certa implica a em probabilidade, mas não o contrário.\n- A LGN diz **para onde** $\\bar{X}_n$ converge; a próxima aula, com o teorema central do limite, dirá **como** ela flutua em torno desse limite.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A lei fraca dos grandes números afirma que a média amostral $\\bar{X}_n$ converge para $\\mu$ em qual sentido?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Em probabilidade",
                                isCorrect: true,
                            },
                            {
                                text: "Quase certamente",
                                isCorrect: false,
                            },
                            {
                                text: "Em distribuição para a normal",
                                isCorrect: false,
                            },
                            {
                                text: "Em média quadrática apenas",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $n$ variáveis i.i.d. com variância $\\sigma^2$, a variância da média amostral $\\bar{X}_n$ vale:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{\\sigma^2}{n}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sigma^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sigma^2}{\\sqrt{n}}$",
                                isCorrect: false,
                            },
                            {
                                text: "$n\\sigma^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual expressão traduz a lei **forte** dos grandes números?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$P\\big(\\lim_n \\bar{X}_n = \\mu\\big) = 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\lim_n P(|\\bar{X}_n - \\mu| \\ge \\varepsilon) = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\bar{X}_n$ tem distribuição normal exata",
                                isCorrect: false,
                            },
                            {
                                text: "$\\text{Var}(\\bar{X}_n) = \\sigma^2$ para todo $n$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sobre a relação entre os modos de convergência da LGN, é correto afirmar que:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A convergência quase certa implica a em probabilidade",
                                isCorrect: true,
                            },
                            {
                                text: "A convergência em probabilidade implica a quase certa",
                                isCorrect: false,
                            },
                            {
                                text: "As duas convergências são sempre equivalentes",
                                isCorrect: false,
                            },
                            {
                                text: "Nenhuma delas implica a outra em geral",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com $\\sigma^2 = 1$, o menor $n$ que garante, por Chebyshev, $P(|\\bar{X}_n - \\mu| \\ge 0{,}1) \\le 0{,}04$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$2500$",
                                isCorrect: true,
                            },
                            {
                                text: "$250$",
                                isCorrect: false,
                            },
                            {
                                text: "$25000$",
                                isCorrect: false,
                            },
                            {
                                text: "$625$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O teorema central do limite",
                blocks: [
                    {
                        type: "text",
                        value: "# O teorema central do limite\n\nA lei dos grandes números diz que $\\bar{X}_n$ se aproxima de $\\mu$, mas nada afirma sobre a **forma** das flutuações em torno de $\\mu$. O teorema central do limite (TCL) preenche essa lacuna: depois de padronizada, a soma (ou a média) de muitas variáveis independentes tem distribuição aproximadamente **normal**, qualquer que seja a distribuição de origem. É o resultado que explica a onipresença da curva gaussiana.",
                    },
                    {
                        type: "text",
                        value: "## Enunciado\n\nSeja $X_1, X_2, \\ldots$ i.i.d. com média $\\mu$ e variância $0 < \\sigma^2 < \\infty$. Defina a soma padronizada\n\n$$Z_n = \\frac{\\sum_{i=1}^n X_i - n\\mu}{\\sigma\\sqrt{n}} = \\frac{\\bar{X}_n - \\mu}{\\sigma/\\sqrt{n}}.$$\n\nEntão, para todo $z \\in \\mathbb{R}$,\n\n$$\\lim_{n \\to \\infty} P(Z_n \\le z) = \\Phi(z),$$\n\nonde $\\Phi$ é a função de distribuição acumulada da normal padrão $N(0,1)$. Dizemos que $Z_n$ **converge em distribuição** para $N(0,1)$.",
                    },
                    {
                        type: "text",
                        value: "## A forma prática\n\nPara $n$ grande, as aproximações usadas na prática são\n\n$$\\sum_{i=1}^n X_i \\approx N\\big(n\\mu,\\ n\\sigma^2\\big), \\qquad \\bar{X}_n \\approx N\\left(\\mu,\\ \\frac{\\sigma^2}{n}\\right).$$\n\nO ponto notável é que **não importa** a distribuição de cada $X_i$: discreta ou contínua, simétrica ou assimétrica, o formato normal emerge da soma. A velocidade da convergência depende da assimetria da distribuição de origem; uma regra de bolso frequente é $n \\ge 30$, embora distribuições muito assimétricas exijam mais.",
                    },
                    {
                        type: "text",
                        value: "## Por que a normal aparece\n\nUma justificativa rigorosa usa **funções características**. Pela independência, a função característica de $Z_n$ é um produto, e uma expansão de Taylor de segunda ordem em torno da origem mostra que\n\n$$\\varphi_{Z_n}(t) \\to e^{-t^2/2},$$\n\nque é exatamente a função característica da $N(0,1)$. O termo de segunda ordem, ligado à variância, é o que sobrevive no limite; por isso apenas $\\mu$ e $\\sigma^2$ entram no resultado, e não os momentos de ordem superior.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nUma fábrica produz peças cujo peso tem média $\\mu = 20$ g e desvio $\\sigma = 4$ g, com distribuição desconhecida. Qual a probabilidade aproximada de que $n = 100$ peças pesem, no total, mais de $2050$ g?\n\nA soma $S = \\sum X_i$ tem $E[S] = 100 \\times 20 = 2000$ e $\\text{Var}(S) = 100 \\times 16 = 1600$, logo desvio $\\sqrt{1600} = 40$. Padronizando,\n\n$$P(S > 2050) = P\\left(Z > \\frac{2050 - 2000}{40}\\right) = P(Z > 1{,}25) \\approx 0{,}106.$$\n\nCerca de $10{,}6\\%$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nCom os mesmos dados, qual a probabilidade de que o **peso médio** das $100$ peças seja inferior a $19{,}5$ g?\n\nAgora usamos $\\bar{X} \\approx N\\left(20,\\ \\frac{16}{100}\\right)$, isto é, erro padrão $\\frac{4}{\\sqrt{100}} = 0{,}4$. Então\n\n$$P(\\bar{X} < 19{,}5) = P\\left(Z < \\frac{19{,}5 - 20}{0{,}4}\\right) = P(Z < -1{,}25) \\approx 0{,}106.$$\n\nOs dois exemplos dão o mesmo número porque, após padronizar, as duas perguntas são idênticas.",
                    },
                    {
                        type: "text",
                        value: "## Correção de continuidade\n\nQuando aproximamos uma variável **discreta**, como uma binomial, por uma normal, convém ajustar os limites em $0{,}5$ para compensar a passagem do discreto ao contínuo. Por exemplo, para uma binomial de parâmetros $n$ e $p$,\n\n$$P(X \\le m) \\approx P\\left(Z \\le \\frac{m + 0{,}5 - np}{\\sqrt{np(1-p)}}\\right).$$\n\nEsse ajuste, chamado **correção de continuidade**, melhora bastante a aproximação quando $n$ é apenas moderado.",
                    },
                    {
                        type: "quote",
                        value: "O teorema central do limite é a razão pela qual a curva em sino aparece onde menos se espera: ela é o destino comum das somas.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O **TCL** afirma que $\\frac{\\bar{X}_n - \\mu}{\\sigma/\\sqrt{n}}$ converge em distribuição para a $N(0,1)$.\n- Vale para **qualquer** distribuição de origem com variância finita e positiva.\n- Na prática, $\\bar{X}_n \\approx N\\left(\\mu, \\frac{\\sigma^2}{n}\\right)$ e $\\sum X_i \\approx N(n\\mu, n\\sigma^2)$.\n- Para variáveis discretas, use a **correção de continuidade**.\n- A distribuição **exata** da média quando a origem já é normal é o tema da próxima aula.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O teorema central do limite afirma que $\\frac{\\bar{X}_n - \\mu}{\\sigma/\\sqrt{n}}$ converge em distribuição para:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A normal padrão $N(0,1)$",
                                isCorrect: true,
                            },
                            {
                                text: "A distribuição $t$ de Student",
                                isCorrect: false,
                            },
                            {
                                text: "A distribuição qui-quadrado",
                                isCorrect: false,
                            },
                            {
                                text: "A distribuição uniforme",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Pelo TCL, para $n$ grande, a soma $\\sum_{i=1}^n X_i$ de i.i.d. com média $\\mu$ e variância $\\sigma^2$ é aproximadamente:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$N(n\\mu,\\ n\\sigma^2)$",
                                isCorrect: true,
                            },
                            {
                                text: "$N(\\mu,\\ \\sigma^2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$N(n\\mu,\\ \\sigma^2)$",
                                isCorrect: false,
                            },
                            {
                                text: "$N(\\mu,\\ n\\sigma^2)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Peças têm $\\mu = 20$ e $\\sigma = 4$. Para $n = 100$, o desvio padrão da soma $\\sum X_i$ usado no TCL é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$40$",
                                isCorrect: true,
                            },
                            {
                                text: "$4$",
                                isCorrect: false,
                            },
                            {
                                text: "$400$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Suponha $\\bar{X} \\approx N(50, \\frac{\\sigma^2}{n})$ com erro padrão igual a $2$. A probabilidade $P(\\bar{X} > 54)$ equivale a $P(Z > z)$ com $z$ igual a:",
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
                                text: "$0{,}5$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual a diferença essencial entre a lei dos grandes números e o teorema central do limite?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "A LGN dá o limite de $\\bar{X}_n$; o TCL, as flutuações",
                                isCorrect: true,
                            },
                            {
                                text: "O TCL dá o limite de $\\bar{X}_n$; a LGN, as flutuações",
                                isCorrect: false,
                            },
                            {
                                text: "Ambos afirmam exatamente a mesma convergência",
                                isCorrect: false,
                            },
                            {
                                text: "A LGN exige distribuição de origem normal",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "A distribuição amostral da média",
                blocks: [
                    {
                        type: "text",
                        value: "# A distribuição amostral da média\n\nQuando coletamos uma amostra e calculamos $\\bar{X}$, esse valor é apenas uma realização de uma variável aleatória: outra amostra daria outro $\\bar{X}$. A distribuição de todos os valores possíveis de $\\bar{X}$ é a **distribuição amostral da média**. Entendê-la é a base da inferência estatística, pois é ela que informa o quanto $\\bar{X}$ costuma variar em torno do parâmetro $\\mu$ que queremos estimar.",
                    },
                    {
                        type: "text",
                        value: "## Média e variância de $\\bar{X}$\n\nPara uma amostra i.i.d. $X_1, \\ldots, X_n$ com média $\\mu$ e variância $\\sigma^2$, valem sempre, sem qualquer hipótese de normalidade,\n\n$$E[\\bar{X}] = \\mu, \\qquad \\text{Var}(\\bar{X}) = \\frac{\\sigma^2}{n}.$$\n\nA primeira igualdade diz que $\\bar{X}$ é um **estimador não viesado** de $\\mu$. A segunda mostra que a dispersão de $\\bar{X}$ diminui à medida que a amostra cresce.",
                    },
                    {
                        type: "text",
                        value: "## O erro padrão\n\nO desvio padrão da distribuição amostral da média tem nome próprio: **erro padrão** da média,\n\n$$\\text{EP}(\\bar{X}) = \\frac{\\sigma}{\\sqrt{n}}.$$\n\nRepare no $\\sqrt{n}$ no denominador. Ele impõe retornos decrescentes à amostragem: para reduzir o erro padrão pela metade é preciso **quadruplicar** o tamanho da amostra. Confundir $\\sigma$ com $\\frac{\\sigma}{\\sqrt{n}}$ é um dos erros mais comuns da inferência; o primeiro mede a variabilidade dos **dados**, e o segundo, a variabilidade da **média**.",
                    },
                    {
                        type: "text",
                        value: "## Amostra de uma população normal\n\nSe a população é normal, $X_i \\sim N(\\mu, \\sigma^2)$, então a média amostral é **exatamente** normal para qualquer $n$, mesmo pequeno:\n\n$$\\bar{X} \\sim N\\left(\\mu,\\ \\frac{\\sigma^2}{n}\\right).$$\n\nIsso decorre de que combinações lineares de normais independentes são normais. Aqui não há aproximação alguma. Padronizando,\n\n$$Z = \\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}} \\sim N(0,1).$$",
                    },
                    {
                        type: "text",
                        value: "## População não normal\n\nSe a população não é normal, $\\bar{X}$ não é exatamente normal, mas o **teorema central do limite** garante que ela é aproximadamente $N\\left(\\mu, \\frac{\\sigma^2}{n}\\right)$ para $n$ grande. Assim, a fórmula $\\bar{X} \\approx N\\left(\\mu, \\frac{\\sigma^2}{n}\\right)$ é o pano de fundo comum: **exata** sob normalidade e **aproximada** no caso geral, sempre com o mesmo centro $\\mu$ e o mesmo erro padrão $\\frac{\\sigma}{\\sqrt{n}}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nO tempo de vida de uma lâmpada é normal com $\\mu = 1000$ h e $\\sigma = 100$ h. Tomamos uma amostra de $n = 25$ lâmpadas. Qual a probabilidade de que a **média** da amostra exceda $1040$ h?\n\nO erro padrão é $\\frac{100}{\\sqrt{25}} = \\frac{100}{5} = 20$. Então\n\n$$P(\\bar{X} > 1040) = P\\left(Z > \\frac{1040 - 1000}{20}\\right) = P(Z > 2) \\approx 0{,}0228.$$\n\nCerca de $2{,}3\\%$. Uma **lâmpada** individual acima de $1040$ h teria $P(Z > 0{,}4) \\approx 0{,}345$, muito mais provável: a média é bem menos dispersa que os dados brutos.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nAinda com $\\sigma = 100$, qual $n$ garante um erro padrão de no máximo $10$ h?\n\nImpomos $\\frac{100}{\\sqrt{n}} \\le 10$, ou seja, $\\sqrt{n} \\ge 10$, logo $n \\ge 100$. Para baixar o erro padrão de $20$ (obtido com $n = 25$) para $10$, é preciso ir de $25$ a $100$ lâmpadas: quadruplicar a amostra para reduzir o erro pela metade, exatamente como o $\\sqrt{n}$ antecipava.",
                    },
                    {
                        type: "quote",
                        value: "Toda estatística calculada a partir de uma amostra é, ela própria, uma variável aleatória, com a sua própria distribuição.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A **distribuição amostral da média** descreve como $\\bar{X}$ varia de uma amostra para outra.\n- Valem sempre $E[\\bar{X}] = \\mu$ e $\\text{Var}(\\bar{X}) = \\frac{\\sigma^2}{n}$.\n- O **erro padrão** é $\\frac{\\sigma}{\\sqrt{n}}$; reduzi-lo pela metade custa quadruplicar $n$.\n- Sob população normal, $\\bar{X} \\sim N\\left(\\mu, \\frac{\\sigma^2}{n}\\right)$ **exatamente**; caso contrário, aproximadamente, via TCL.\n- Tudo isso supõe $\\sigma$ conhecido. Quando o estimamos pela amostra, surge a distribuição $t$, tema da próxima aula.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O erro padrão da média amostral, para uma amostra de tamanho $n$ de uma população com desvio $\\sigma$, é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{\\sigma}{\\sqrt{n}}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sigma$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sigma}{n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\sigma^2}{n}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para uma amostra i.i.d. de uma população com média $\\mu$, o valor esperado da média amostral $\\bar{X}$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\mu$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{\\mu}{n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$n\\mu$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{\\mu}{\\sqrt{n}}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma população tem $\\sigma = 30$. Para uma amostra de tamanho $n = 36$, o erro padrão da média vale:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$5$",
                                isCorrect: true,
                            },
                            {
                                text: "$30$",
                                isCorrect: false,
                            },
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}83$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $X \\sim N(1000, 100^2)$ e $n = 25$, de modo que o erro padrão é $20$. A probabilidade $P(\\bar{X} > 1040)$ equivale a $P(Z > z)$ com $z$ igual a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$2$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}4$",
                                isCorrect: false,
                            },
                            {
                                text: "$40$",
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
                            "Com $\\sigma = 100$, o erro padrão para $n = 25$ é $20$. Para que o erro padrão passe a valer $10$, o tamanho da amostra deve ser:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$100$",
                                isCorrect: true,
                            },
                            {
                                text: "$50$",
                                isCorrect: false,
                            },
                            {
                                text: "$200$",
                                isCorrect: false,
                            },
                            {
                                text: "$400$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "As distribuições qui-quadrado e t de Student",
                blocks: [
                    {
                        type: "text",
                        value: "# As distribuições qui-quadrado e $t$ de Student\n\nAté aqui supusemos $\\sigma$ conhecido, o que quase nunca ocorre na prática: em geral precisamos estimá-lo pela amostra, com a variância amostral $S^2$. Duas distribuições nascem dessa necessidade. A **qui-quadrado** descreve somas de quadrados de normais e, em particular, o comportamento de $S^2$. A **$t$ de Student** descreve a média padronizada quando $\\sigma$ é substituído por $S$. Ambas são indexadas por um parâmetro chamado **graus de liberdade**.",
                    },
                    {
                        type: "text",
                        value: "## A distribuição qui-quadrado\n\nSe $Z_1, \\ldots, Z_k$ são normais padrão independentes, então a soma dos seus quadrados\n\n$$V = \\sum_{i=1}^k Z_i^2$$\n\ntem distribuição **qui-quadrado com $k$ graus de liberdade**, denotada $V \\sim \\chi^2_k$. Suas características principais são\n\n$$E[V] = k, \\qquad \\text{Var}(V) = 2k.$$\n\nÉ uma distribuição contínua, com suporte nos reais positivos e assimétrica à direita; a assimetria diminui conforme $k$ cresce.",
                    },
                    {
                        type: "text",
                        value: "## A variância amostral\n\nDefina a variância amostral por\n\n$$S^2 = \\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\bar{X})^2.$$\n\nSe $X_1, \\ldots, X_n \\sim N(\\mu, \\sigma^2)$, então\n\n$$\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2_{n-1}.$$\n\nAparecem $n-1$ graus de liberdade, e não $n$: um grau se perde porque os desvios $X_i - \\bar{X}$ somam zero, então apenas $n-1$ deles são livres. Como $E[\\chi^2_{n-1}] = n-1$, segue que $E[S^2] = \\sigma^2$; é por isso que o divisor é $n-1$, e não $n$, pois assim $S^2$ fica não viesado.",
                    },
                    {
                        type: "text",
                        value: "## A distribuição $t$ de Student\n\nSe $Z \\sim N(0,1)$ e $V \\sim \\chi^2_k$ são **independentes**, então\n\n$$T = \\frac{Z}{\\sqrt{V/k}}$$\n\ntem **distribuição $t$ de Student com $k$ graus de liberdade**, denotada $T \\sim t_k$. Sua densidade é simétrica em torno de zero e lembra a normal padrão, porém com **caudas mais pesadas**, o que reflete a incerteza adicional de estimar a dispersão a partir dos dados.",
                    },
                    {
                        type: "text",
                        value: "## A média padronizada com $\\sigma$ desconhecido\n\nEis o resultado central para a inferência sobre médias. Para uma amostra $X_1, \\ldots, X_n \\sim N(\\mu, \\sigma^2)$, ao substituir $\\sigma$ por $S$ obtemos\n\n$$T = \\frac{\\bar{X} - \\mu}{S/\\sqrt{n}} \\sim t_{n-1}.$$\n\nCompare com o caso de $\\sigma$ conhecido, em que $\\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}} \\sim N(0,1)$. Trocar o parâmetro $\\sigma$ pela estimativa $S$ troca a normal pela $t_{n-1}$, de caudas mais largas. Essa largura extra é o preço, agora quantificado, de não conhecer $\\sigma$.",
                    },
                    {
                        type: "text",
                        value: "## Relação com a normal\n\nÀ medida que os graus de liberdade crescem, a $t_k$ se aproxima da normal padrão: $t_k \\to N(0,1)$ quando $k \\to \\infty$. A intuição é que, com uma amostra grande, $S$ estima $\\sigma$ com muita precisão, e a incerteza adicional praticamente desaparece. Na prática, para $k$ acima de $30$ ou $40$ as duas distribuições já são muito próximas, o que reconecta esta aula ao teorema central do limite.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nUma amostra de $n = 10$ medições de uma população normal fornece $\\bar{X} = 52$ e $S = 6$. Que estatística usar para testar a hipótese $\\mu = 50$, e com quantos graus de liberdade?\n\nComo $\\sigma$ é desconhecido e foi estimado por $S$, usamos a estatística $t$ com $n - 1 = 9$ graus de liberdade:\n\n$$T = \\frac{\\bar{X} - \\mu_0}{S/\\sqrt{n}} = \\frac{52 - 50}{6/\\sqrt{10}} = \\frac{2}{1{,}897} \\approx 1{,}05.$$\n\nComparamos $1{,}05$ com a distribuição $t_9$. Usar $\\sigma = 6$ na normal, neste caso, subestimaria a incerteza presente nas caudas.",
                    },
                    {
                        type: "quote",
                        value: "Quando a dispersão precisa ser estimada a partir dos próprios dados, a incerteza dessa estimativa se paga na forma de caudas mais largas.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A **qui-quadrado** $\\chi^2_k$ é a soma de $k$ quadrados de normais padrão independentes, com $E[\\chi^2_k] = k$ e $\\text{Var} = 2k$.\n- Para amostra normal, $\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2_{n-1}$, com um grau de liberdade perdido na estimação da média.\n- A **$t$ de Student** surge de $T = \\frac{Z}{\\sqrt{V/k}}$ e tem caudas mais pesadas que a normal.\n- Com $\\sigma$ desconhecido, $\\frac{\\bar{X} - \\mu}{S/\\sqrt{n}} \\sim t_{n-1}$; e $t_k \\to N(0,1)$ quando $k \\to \\infty$.\n- Essas distribuições são a base dos testes e intervalos de confiança para média e variância.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Se $Z_1, \\ldots, Z_k$ são normais padrão independentes, então $\\sum_{i=1}^k Z_i^2$ tem distribuição:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Qui-quadrado com $k$ graus de liberdade",
                                isCorrect: true,
                            },
                            {
                                text: "$t$ de Student com $k$ graus de liberdade",
                                isCorrect: false,
                            },
                            {
                                text: "Normal com variância igual a $k$",
                                isCorrect: false,
                            },
                            {
                                text: "Qui-quadrado com $k-1$ graus de liberdade",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para uma amostra normal de tamanho $n$, a estatística $\\frac{(n-1)S^2}{\\sigma^2}$ segue:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\chi^2_{n-1}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\chi^2_{n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$t_{n-1}$",
                                isCorrect: false,
                            },
                            {
                                text: "$N(0,1)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Numa amostra normal com $\\sigma$ desconhecido, a estatística $\\frac{\\bar{X} - \\mu}{S/\\sqrt{n}}$ segue:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$t_{n-1}$",
                                isCorrect: true,
                            },
                            {
                                text: "$N(0,1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$t_{n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\chi^2_{n-1}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma amostra normal tem $n = 10$. Os graus de liberdade da estatística $t$ para a média são:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$9$",
                                isCorrect: true,
                            },
                            {
                                text: "$10$",
                                isCorrect: false,
                            },
                            {
                                text: "$8$",
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
                            "Por que a distribuição $t$ de Student tem caudas mais pesadas que a normal padrão?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque estimar $\\sigma$ por $S$ acrescenta incerteza",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a média amostral é sempre enviesada",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a $\\chi^2_k$ tem média igual a $2k$",
                                isCorrect: false,
                            },
                            {
                                text: "Porque $S$ é sempre menor do que $\\sigma$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Estimação",
        aulas: [
            {
                titulo: "Estimadores pontuais",
                blocks: [
                    {
                        type: "text",
                        value: "## Estimadores pontuais\n\nNo problema de estimação partimos de um **modelo estatístico**: uma família de distribuições $\\{f(x; \\theta) : \\theta \\in \\Theta\\}$ indexada por um parâmetro $\\theta$ (escalar ou vetorial) que vive no **espaço paramétrico** $\\Theta$. O parâmetro é desconhecido e fixo, e nosso objetivo é usar os dados para produzir um palpite numérico sobre ele.\n\nOs dados são uma **amostra aleatória** $X_1, \\ldots, X_n$, isto é, variáveis independentes e identicamente distribuídas (i.i.d.) com densidade ou função de massa $f(x; \\theta)$.",
                    },
                    {
                        type: "text",
                        value: "### Estatística e estimador\n\nUma **estatística** é qualquer função mensurável $T = T(X_1, \\ldots, X_n)$ da amostra que não depende de $\\theta$. Por ser função de variáveis aleatórias, uma estatística é ela mesma uma variável aleatória, com sua própria distribuição, chamada **distribuição amostral**.\n\nUm **estimador pontual** de $\\theta$ é uma estatística $\\hat{\\theta} = T(X_1, \\ldots, X_n)$ cujos valores são usados como aproximação de $\\theta$. O estimador é a regra, ou seja, a função; a **estimativa** é o número $\\hat{\\theta}(x_1, \\ldots, x_n)$ obtido depois de observar os dados.",
                    },
                    {
                        type: "text",
                        value: "### Estimador versus estimativa\n\nA distinção é sutil, mas essencial. Antes de coletar os dados, $\\hat{\\theta}$ é uma variável aleatória: podemos falar de sua esperança $E[\\hat{\\theta}]$, de sua variância $\\mathrm{Var}(\\hat{\\theta})$ e de sua distribuição. Depois de observar $X_1 = x_1, \\ldots, X_n = x_n$, obtemos um único número, a estimativa.\n\nÉ a distribuição amostral do estimador que nos permite avaliar sua qualidade. Um mesmo parâmetro admite muitos estimadores concorrentes, e precisamos de critérios para compará-los.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo: a média amostral\n\nSeja $X_1, \\ldots, X_n$ uma amostra i.i.d. com média $E[X_i] = \\mu$ e variância $\\mathrm{Var}(X_i) = \\sigma^2$. O estimador natural de $\\mu$ é a **média amostral**\n\n$$\\bar{X} = \\frac{1}{n} \\sum_{i=1}^{n} X_i.$$\n\nPela linearidade da esperança,\n\n$$E[\\bar{X}] = \\frac{1}{n} \\sum_{i=1}^{n} E[X_i] = \\frac{1}{n} \\cdot n \\mu = \\mu.$$\n\nComo as observações são independentes,\n\n$$\\mathrm{Var}(\\bar{X}) = \\frac{1}{n^2} \\sum_{i=1}^{n} \\mathrm{Var}(X_i) = \\frac{\\sigma^2}{n}.$$\n\nA variância cai com $n$: amostras maiores concentram a distribuição amostral em torno de $\\mu$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo: proporção em um modelo Bernoulli\n\nSeja $X_1, \\ldots, X_n$ i.i.d. $\\mathrm{Bernoulli}(p)$, com $P(X_i = 1) = p$. O parâmetro $p$ é a probabilidade de sucesso, e um estimador natural é a **proporção amostral**\n\n$$\\hat{p} = \\frac{1}{n} \\sum_{i=1}^{n} X_i = \\bar{X}.$$\n\nComo $E[X_i] = p$ e $\\mathrm{Var}(X_i) = p(1-p)$, temos $E[\\hat{p}] = p$ e $\\mathrm{Var}(\\hat{p}) = \\frac{p(1-p)}{n}$. O total $\\sum_{i} X_i$ segue uma $\\mathrm{Binomial}(n, p)$, o que descreve por completo a distribuição amostral de $\\hat{p}$.",
                    },
                    {
                        type: "text",
                        value: "### Critérios de qualidade\n\nComo há muitos estimadores possíveis, a teoria estabelece critérios para escolher entre eles. Os principais são:\n\n- **Não-viesamento**: em média, o estimador acerta o alvo, $E[\\hat{\\theta}] = \\theta$.\n- **Variância pequena**: pouca dispersão em torno do alvo.\n- **Consistência**: $\\hat{\\theta}$ se aproxima de $\\theta$ conforme $n$ cresce.\n- **Eficiência**: menor variância possível dentro de uma classe.\n- **Suficiência**: o estimador resume toda a informação amostral sobre $\\theta$.\n\nOs módulos seguintes formalizam viés, variância e consistência, e apresentam dois métodos gerais de construção: momentos e máxima verossimilhança.",
                    },
                    {
                        type: "quote",
                        value: "A estatística não elimina a incerteza; ela a organiza em uma distribuição que podemos estudar e da qual podemos extrair conclusões controladas.",
                    },
                    {
                        type: "text",
                        value: "### Resumo\n\nUm estimador pontual é uma estatística $\\hat{\\theta} = T(X_1, \\ldots, X_n)$ usada para aproximar um parâmetro desconhecido $\\theta$. Por ser função da amostra, é uma variável aleatória com distribuição amostral própria; a estimativa é o valor numérico que ele assume nos dados observados. A média amostral estima $\\mu$ com $E[\\bar{X}] = \\mu$ e $\\mathrm{Var}(\\bar{X}) = \\sigma^2/n$, e a proporção amostral estima $p$ no modelo Bernoulli. A qualidade de um estimador é julgada por viés, variância, consistência, eficiência e suficiência.",
                    },
                ],
                questions: [
                    {
                        statement: "Em inferência, o que caracteriza uma **estatística**?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma função que depende do parâmetro $\\theta$ desconhecido.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma função da amostra que não depende de $\\theta$.",
                                isCorrect: true,
                            },
                            {
                                text: "O valor fixo e desconhecido do parâmetro populacional.",
                                isCorrect: false,
                            },
                            {
                                text: "A distribuição de probabilidade da população amostrada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a diferença entre um estimador $\\hat{\\theta}$ e uma estimativa?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O estimador é um número fixo; a estimativa é uma variável aleatória.",
                                isCorrect: false,
                            },
                            {
                                text: "Ambos são variáveis aleatórias com a mesma distribuição amostral.",
                                isCorrect: false,
                            },
                            {
                                text: "O estimador é uma variável aleatória; a estimativa é um número.",
                                isCorrect: true,
                            },
                            {
                                text: "O estimador depende de $\\theta$; a estimativa não depende dele.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para uma amostra i.i.d. com variância $\\sigma^2$, quanto vale $\\mathrm{Var}(\\bar{X})$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\dfrac{\\sigma^2}{n}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sigma^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{\\sigma^2}{\\sqrt{n}}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{\\sigma}{n}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $\\hat{p} = \\bar{X}$ com dados i.i.d. $\\mathrm{Bernoulli}(p)$. Quanto vale $\\mathrm{Var}(\\hat{p})$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$p(1-p)$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{p(1-p)}{\\sqrt{n}}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{p(1-p)}{n}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{p}{n}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Sejam $X_1, \\ldots, X_n$ i.i.d. com média $\\mu$ e seja $\\hat{\\mu} = \\frac{1}{n+1}\\sum_{i=1}^{n} X_i$. Então $E[\\hat{\\mu}]$ é igual a:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\dfrac{n}{n+1}\\,\\mu$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\mu$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{n+1}{n}\\,\\mu$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{\\mu}{n+1}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Viés, variância e consistência",
                blocks: [
                    {
                        type: "text",
                        value: "## Viés, variância e consistência\n\nDois estimadores do mesmo parâmetro podem ter comportamentos muito diferentes. Para compará-los precisamos de medidas quantitativas de erro, e a primeira delas é o **viés** (ou vício).\n\nO viés de um estimador $\\hat{\\theta}$ de $\\theta$ é\n\n$$B(\\hat{\\theta}) = E[\\hat{\\theta}] - \\theta.$$\n\nDizemos que $\\hat{\\theta}$ é **não-viesado** quando $B(\\hat{\\theta}) = 0$ para todo $\\theta \\in \\Theta$, ou seja, $E[\\hat{\\theta}] = \\theta$. Intuitivamente, um estimador não-viesado acerta o alvo em média, ainda que raramente acerte em uma amostra específica.",
                    },
                    {
                        type: "text",
                        value: "### Variância\n\nNão basta acertar em média: um estimador não-viesado com variância enorme é inútil na prática, pois cada estimativa individual pode cair muito longe de $\\theta$. A **variância** $\\mathrm{Var}(\\hat{\\theta}) = E\\big[(\\hat{\\theta} - E[\\hat{\\theta}])^2\\big]$ mede a dispersão da distribuição amostral em torno de seu centro.\n\nHá em geral um compromisso entre viés e variância: aceitar um pequeno viés pode reduzir bastante a variância, e vice-versa. Precisamos de uma medida que combine os dois.",
                    },
                    {
                        type: "text",
                        value: "### Erro quadrático médio\n\nO **erro quadrático médio** (EQM) resume viés e variância em uma única quantidade:\n\n$$\\mathrm{EQM}(\\hat{\\theta}) = E\\big[(\\hat{\\theta} - \\theta)^2\\big].$$\n\nSomando e subtraindo $E[\\hat{\\theta}]$ dentro do quadrado, obtemos a decomposição fundamental\n\n$$\\mathrm{EQM}(\\hat{\\theta}) = \\mathrm{Var}(\\hat{\\theta}) + \\big[B(\\hat{\\theta})\\big]^2.$$\n\nDe fato, escrevendo $\\hat{\\theta} - \\theta = (\\hat{\\theta} - E[\\hat{\\theta}]) + (E[\\hat{\\theta}] - \\theta)$ e elevando ao quadrado, o termo cruzado tem esperança nula porque $E[\\hat{\\theta} - E[\\hat{\\theta}]] = 0$, restando a variância mais o quadrado do viés. Para um estimador não-viesado, $\\mathrm{EQM}(\\hat{\\theta}) = \\mathrm{Var}(\\hat{\\theta})$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo: a variância amostral\n\nConsidere estimar $\\sigma^2$ a partir de uma amostra i.i.d. com média $\\mu$ e variância $\\sigma^2$. Um candidato é\n\n$$\\hat{\\sigma}^2_n = \\frac{1}{n} \\sum_{i=1}^{n} (X_i - \\bar{X})^2.$$\n\nUsando a identidade $\\sum_{i} (X_i - \\bar{X})^2 = \\sum_{i} (X_i - \\mu)^2 - n(\\bar{X} - \\mu)^2$ e tomando esperanças, com $E[(X_i - \\mu)^2] = \\sigma^2$ e $E[(\\bar{X} - \\mu)^2] = \\sigma^2/n$, resulta\n\n$$E[\\hat{\\sigma}^2_n] = \\frac{1}{n}\\left(n\\sigma^2 - n \\cdot \\frac{\\sigma^2}{n}\\right) = \\frac{n-1}{n}\\,\\sigma^2.$$\n\nLogo $\\hat{\\sigma}^2_n$ é viesado, com viés $-\\sigma^2/n$. Dividindo por $n-1$ em vez de $n$ obtemos a **variância amostral**\n\n$$S^2 = \\frac{1}{n-1} \\sum_{i=1}^{n} (X_i - \\bar{X})^2,$$\n\nque satisfaz $E[S^2] = \\sigma^2$ e é, portanto, não-viesada.",
                    },
                    {
                        type: "text",
                        value: "### Consistência\n\nEnquanto viés e variância descrevem o desempenho a $n$ fixo, a **consistência** descreve o comportamento assintótico. Uma sequência de estimadores $\\hat{\\theta}_n$ é (fracamente) consistente para $\\theta$ se converge em probabilidade a $\\theta$, isto é, para todo $\\varepsilon > 0$,\n\n$$\\lim_{n \\to \\infty} P\\big(|\\hat{\\theta}_n - \\theta| > \\varepsilon\\big) = 0.$$\n\nUma condição suficiente cômoda vem do EQM: se $\\mathrm{EQM}(\\hat{\\theta}_n) \\to 0$, ou seja, se tanto o viés quanto a variância tendem a zero, então $\\hat{\\theta}_n$ é consistente. Isso segue da desigualdade de Chebyshev aplicada a $\\hat{\\theta}_n - \\theta$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo: consistência da média amostral\n\nPara $\\bar{X}_n$ com dados i.i.d. de média $\\mu$ e variância $\\sigma^2 < \\infty$, temos $B(\\bar{X}_n) = 0$ e $\\mathrm{Var}(\\bar{X}_n) = \\sigma^2/n$. Assim\n\n$$\\mathrm{EQM}(\\bar{X}_n) = \\frac{\\sigma^2}{n} \\longrightarrow 0 \\quad (n \\to \\infty),$$\n\ne portanto $\\bar{X}_n$ é consistente para $\\mu$. Este é exatamente o conteúdo da lei fraca dos grandes números, aqui obtida pela rota do erro quadrático médio.",
                    },
                    {
                        type: "quote",
                        value: "Um bom estimador não precisa acertar sempre; precisa errar cada vez menos à medida que os dados se acumulam.",
                    },
                    {
                        type: "text",
                        value: "### Resumo\n\nO viés $B(\\hat{\\theta}) = E[\\hat{\\theta}] - \\theta$ mede o erro sistemático e a variância mede a dispersão. O erro quadrático médio combina ambos: $\\mathrm{EQM}(\\hat{\\theta}) = \\mathrm{Var}(\\hat{\\theta}) + [B(\\hat{\\theta})]^2$. A variância amostral com divisor $n$ é viesada, com esperança $\\frac{n-1}{n}\\sigma^2$; o divisor $n-1$ corrige o viés. A consistência é uma propriedade assintótica de convergência em probabilidade, garantida sempre que o EQM tende a zero, como ocorre com $\\bar{X}_n$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O viés de um estimador $\\hat{\\theta}$ de $\\theta$ é definido como:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$E[\\hat{\\theta}] + \\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$E[\\hat{\\theta}] - \\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$E[(\\hat{\\theta} - \\theta)^2]$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\hat{\\theta} - E[\\theta]$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um estimador $\\hat{\\theta}$ é não-viesado quando, para todo $\\theta$:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\mathrm{Var}(\\hat{\\theta}) = 0$",
                                isCorrect: false,
                            },
                            {
                                text: "$E[\\hat{\\theta}] = \\theta$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\hat{\\theta} = \\theta$",
                                isCorrect: false,
                            },
                            {
                                text: "$E[\\hat{\\theta}] = 0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "A decomposição do erro quadrático médio de $\\hat{\\theta}$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\mathrm{Var}(\\hat{\\theta}) + [B(\\hat{\\theta})]^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\mathrm{Var}(\\hat{\\theta}) - [B(\\hat{\\theta})]^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\mathrm{Var}(\\hat{\\theta}) + B(\\hat{\\theta})$",
                                isCorrect: false,
                            },
                            {
                                text: "$[\\mathrm{Var}(\\hat{\\theta})]^2 + [B(\\hat{\\theta})]^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual estimador de $\\sigma^2$ é não-viesado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\dfrac{1}{n}\\sum_{i=1}^{n} (X_i - \\bar{X})^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{n-1}\\sum_{i=1}^{n} (X_i - \\mu)^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{n-1}\\sum_{i=1}^{n} (X_i - \\bar{X})^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{1}{n+1}\\sum_{i=1}^{n} (X_i - \\bar{X})^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O estimador $\\hat{\\sigma}^2_n = \\frac{1}{n}\\sum_{i=1}^{n} (X_i - \\bar{X})^2$ tem viés igual a:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$-\\dfrac{\\sigma^2}{n}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{\\sigma^2}{n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$-\\dfrac{\\sigma^2}{n-1}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{\\sigma^2}{n-1}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Método dos momentos",
                blocks: [
                    {
                        type: "text",
                        value: "## Método dos momentos\n\nConhecer as propriedades desejáveis de um estimador não diz como construí-lo. Precisamos de **métodos gerais** que, dado um modelo, produzam um estimador de forma sistemática. O mais antigo deles, devido a Karl Pearson, é o **método dos momentos**.\n\nA ideia é simples e intuitiva: os momentos teóricos da distribuição dependem de $\\theta$, e os momentos amostrais são estimativas naturais desses momentos teóricos. Igualando teóricos a amostrais e resolvendo para $\\theta$, obtemos um estimador.",
                    },
                    {
                        type: "text",
                        value: "### O princípio\n\nO método baseia-se na ideia de que os momentos populacionais são funções conhecidas do parâmetro. O $k$-ésimo **momento populacional** é\n\n$$\\mu_k' = E[X^k] = \\mu_k'(\\theta),$$\n\ne o $k$-ésimo **momento amostral** é\n\n$$m_k = \\frac{1}{n} \\sum_{i=1}^{n} X_i^k.$$\n\nSe $\\theta$ tem dimensão $p$, montamos o sistema $\\mu_k'(\\theta) = m_k$ para $k = 1, \\ldots, p$ e o resolvemos em $\\theta$. A solução $\\hat{\\theta}$ é o **estimador pelo método dos momentos**. A justificativa é que $m_k$ estima consistentemente $\\mu_k'$ pela lei dos grandes números.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo: distribuição exponencial\n\nSeja $X_1, \\ldots, X_n$ i.i.d. com densidade $f(x; \\lambda) = \\lambda e^{-\\lambda x}$, $x > 0$. Há um único parâmetro, então igualamos apenas o primeiro momento. Como $E[X] = 1/\\lambda$, a equação de momentos é\n\n$$\\bar{X} = \\frac{1}{\\lambda},$$\n\ncuja solução é o estimador de momentos\n\n$$\\hat{\\lambda} = \\frac{1}{\\bar{X}}.$$\n\nEle é consistente para $\\lambda$ pela lei dos grandes números, mas é viesado: por ser função convexa de $\\bar{X}$, a desigualdade de Jensen dá $E[1/\\bar{X}] > 1/E[\\bar{X}] = \\lambda$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplos: Bernoulli e uniforme\n\nPara $X_i \\sim \\mathrm{Bernoulli}(p)$, temos $E[X] = p$, logo a equação de momentos $\\bar{X} = p$ fornece $\\hat{p} = \\bar{X}$, a proporção amostral.\n\nPara $X_i \\sim \\mathrm{Uniforme}(0, \\theta)$, temos $E[X] = \\theta/2$. A equação $\\bar{X} = \\theta/2$ dá\n\n$$\\hat{\\theta} = 2\\bar{X}.$$\n\nEste exemplo revela uma fragilidade do método: é possível observar um valor máximo $x_{(n)} > 2\\bar{x}$, de modo que a estimativa $\\hat{\\theta} = 2\\bar{x}$ ficaria abaixo do maior dado observado, algo logicamente impossível para o suporte $(0, \\theta)$.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo: normal com dois parâmetros\n\nQuando $\\theta = (\\mu, \\sigma^2)$ tem dimensão dois, usamos os dois primeiros momentos. Para $X_i \\sim N(\\mu, \\sigma^2)$,\n\n$$E[X] = \\mu, \\qquad E[X^2] = \\mu^2 + \\sigma^2.$$\n\nIgualando aos momentos amostrais $m_1 = \\bar{X}$ e $m_2 = \\frac{1}{n}\\sum_{i} X_i^2$:\n\n$$\\hat{\\mu} = \\bar{X}, \\qquad \\hat{\\mu}^2 + \\hat{\\sigma}^2 = m_2.$$\n\nDaí\n\n$$\\hat{\\sigma}^2 = m_2 - \\bar{X}^2 = \\frac{1}{n} \\sum_{i=1}^{n} (X_i - \\bar{X})^2.$$\n\nNote que o estimador de momentos da variância usa divisor $n$, sendo portanto viesado, como vimos no módulo anterior.",
                    },
                    {
                        type: "text",
                        value: "### Propriedades e limitações\n\nOs estimadores de momentos têm virtudes claras: são fáceis de calcular, quase sempre existem em forma fechada e, sob condições brandas, são consistentes, pois combinam de modo contínuo momentos amostrais consistentes.\n\nPor outro lado, costumam ser menos eficientes que os de máxima verossimilhança, nem sempre são não-viesados e, como no caso uniforme, podem produzir estimativas fora do espaço paramétrico ou incoerentes com os dados. Ainda assim, servem frequentemente como ponto de partida para métodos mais refinados.",
                    },
                    {
                        type: "quote",
                        value: "Igualar o que a teoria prevê ao que a amostra mostra é talvez a mais antiga receita da inferência estatística.",
                    },
                    {
                        type: "text",
                        value: "### Resumo\n\nO método dos momentos iguala momentos populacionais a momentos amostrais e resolve o sistema resultante para o parâmetro. Com um parâmetro, basta $\\bar{X} = E[X]$: para a exponencial obtém-se $\\hat{\\lambda} = 1/\\bar{X}$, para a Bernoulli $\\hat{p} = \\bar{X}$ e para a uniforme $\\hat{\\theta} = 2\\bar{X}$. Com dois parâmetros, usam-se os dois primeiros momentos, como na normal, onde $\\hat{\\mu} = \\bar{X}$ e $\\hat{\\sigma}^2 = \\frac{1}{n}\\sum_{i}(X_i - \\bar{X})^2$. O método é simples e consistente, mas pode ser ineficiente e viesado.",
                    },
                ],
                questions: [
                    {
                        statement: "O método dos momentos consiste em:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "maximizar a função de verossimilhança da amostra.",
                                isCorrect: false,
                            },
                            {
                                text: "igualar momentos amostrais aos populacionais.",
                                isCorrect: true,
                            },
                            {
                                text: "minimizar a soma dos quadrados dos resíduos.",
                                isCorrect: false,
                            },
                            {
                                text: "igualar a mediana amostral à média teórica.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $X_i$ i.i.d. com $E[X] = 1/\\lambda$, o estimador de momentos de $\\lambda$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\hat{\\lambda} = \\bar{X}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\hat{\\lambda} = 1/\\bar{X}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\hat{\\lambda} = 1/\\bar{X}^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\hat{\\lambda} = \\bar{X}/n$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $X_i \\sim \\mathrm{Uniforme}(0, \\theta)$, com $E[X] = \\theta/2$, o estimador de momentos é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\hat{\\theta} = \\bar{X}/2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\hat{\\theta} = 2\\bar{X}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\hat{\\theta} = \\bar{X}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\hat{\\theta} = \\max_{i} X_i$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No modelo $N(\\mu, \\sigma^2)$, o estimador de momentos de $\\sigma^2$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\dfrac{1}{n}\\sum_{i=1}^{n} (X_i - \\bar{X})^2$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\dfrac{1}{n-1}\\sum_{i=1}^{n} (X_i - \\bar{X})^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\bar{X}^2 - \\dfrac{1}{n}\\sum_{i=1}^{n} X_i^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\dfrac{1}{n}\\sum_{i=1}^{n} X_i^2$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $X_i \\sim \\mathrm{Uniforme}(-\\theta, \\theta)$, tem-se $E[X] = 0$ e $E[X^2] = \\theta^2/3$. O estimador de momentos de $\\theta$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\hat{\\theta} = \\sqrt{\\dfrac{1}{n}\\sum_{i=1}^{n} X_i^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\hat{\\theta} = \\sqrt{\\dfrac{3}{n}\\sum_{i=1}^{n} X_i^2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\hat{\\theta} = \\dfrac{3}{n}\\sum_{i=1}^{n} X_i^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\hat{\\theta} = 2\\bar{X}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Máxima verossimilhança",
                blocks: [
                    {
                        type: "text",
                        value: "## Máxima verossimilhança\n\nO **método da máxima verossimilhança** é o procedimento de estimação mais importante da estatística. A ideia central é escolher o valor do parâmetro que torna os dados observados os mais prováveis possíveis.\n\nDada uma amostra i.i.d. com densidade ou função de massa $f(x; \\theta)$, a **função de verossimilhança** é a densidade conjunta vista como função de $\\theta$, com os dados fixos:\n\n$$L(\\theta) = \\prod_{i=1}^{n} f(x_i; \\theta).$$\n\nO **estimador de máxima verossimilhança** (EMV) é o valor $\\hat{\\theta}$ que maximiza $L(\\theta)$ sobre $\\Theta$.",
                    },
                    {
                        type: "text",
                        value: "### Log-verossimilhança\n\nComo o logaritmo é estritamente crescente, maximizar $L(\\theta)$ equivale a maximizar a **log-verossimilhança**\n\n$$\\ell(\\theta) = \\ln L(\\theta) = \\sum_{i=1}^{n} \\ln f(x_i; \\theta).$$\n\nTrabalhar com a soma é bem mais cômodo que com o produto. Quando $\\ell$ é diferenciável e o máximo é interior, o EMV resolve a **equação de verossimilhança**\n\n$$\\ell'(\\theta) = \\frac{\\partial}{\\partial \\theta} \\ell(\\theta) = 0,$$\n\nsujeita à condição de segunda ordem $\\ell''(\\hat{\\theta}) < 0$, que confirma tratar-se de um máximo. Nem sempre há solução fechada; muitas vezes o EMV é obtido numericamente.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo: modelo Bernoulli\n\nSeja $X_1, \\ldots, X_n$ i.i.d. $\\mathrm{Bernoulli}(p)$, com $f(x; p) = p^x (1-p)^{1-x}$ para $x \\in \\{0, 1\\}$. Escrevendo $s = \\sum_{i=1}^{n} x_i$, a log-verossimilhança é\n\n$$\\ell(p) = \\sum_{i=1}^{n} \\big[x_i \\ln p + (1 - x_i)\\ln(1-p)\\big] = s \\ln p + (n - s)\\ln(1-p).$$\n\nDerivando e igualando a zero,\n\n$$\\ell'(p) = \\frac{s}{p} - \\frac{n - s}{1 - p} = 0 \\;\\Longrightarrow\\; \\hat{p} = \\frac{s}{n} = \\bar{X}.$$\n\nComo $\\ell''(p) = -s/p^2 - (n-s)/(1-p)^2 < 0$, trata-se de fato de um máximo. O EMV de $p$ é a proporção amostral.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo: distribuição exponencial\n\nPara $X_i$ i.i.d. com densidade $f(x; \\lambda) = \\lambda e^{-\\lambda x}$, $x > 0$, a log-verossimilhança é\n\n$$\\ell(\\lambda) = \\sum_{i=1}^{n} \\big(\\ln \\lambda - \\lambda x_i\\big) = n \\ln \\lambda - \\lambda \\sum_{i=1}^{n} x_i.$$\n\nDerivando,\n\n$$\\ell'(\\lambda) = \\frac{n}{\\lambda} - \\sum_{i=1}^{n} x_i = 0 \\;\\Longrightarrow\\; \\hat{\\lambda} = \\frac{n}{\\sum_{i} x_i} = \\frac{1}{\\bar{X}}.$$\n\nComo $\\ell''(\\lambda) = -n/\\lambda^2 < 0$, é um máximo. Aqui o EMV coincide com o estimador de momentos, o que nem sempre ocorre.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo: modelo Poisson\n\nSeja $X_i$ i.i.d. $\\mathrm{Poisson}(\\lambda)$, com $f(x; \\lambda) = e^{-\\lambda}\\lambda^x / x!$. A log-verossimilhança, ignorando o termo constante $-\\sum_{i} \\ln(x_i!)$, é\n\n$$\\ell(\\lambda) = -n\\lambda + \\ln \\lambda \\sum_{i=1}^{n} x_i.$$\n\nDerivando e igualando a zero, $\\ell'(\\lambda) = -n + \\frac{1}{\\lambda}\\sum_{i} x_i = 0$, o que dá $\\hat{\\lambda} = \\bar{X}$. No modelo normal $N(\\mu, \\sigma^2)$ com ambos os parâmetros desconhecidos, um cálculo análogo com derivadas parciais fornece $\\hat{\\mu} = \\bar{X}$ e $\\hat{\\sigma}^2 = \\frac{1}{n}\\sum_{i} (X_i - \\bar{X})^2$.",
                    },
                    {
                        type: "text",
                        value: "### Propriedades assintóticas\n\nSob condições de regularidade, o EMV possui propriedades notáveis que explicam sua centralidade:\n\n- **Invariância**: se $\\hat{\\theta}$ é o EMV de $\\theta$, então $g(\\hat{\\theta})$ é o EMV de $g(\\theta)$, para qualquer função $g$.\n- **Consistência**: $\\hat{\\theta}_n$ converge em probabilidade a $\\theta$.\n- **Normalidade assintótica**: $\\sqrt{n}(\\hat{\\theta}_n - \\theta)$ converge em distribuição a uma normal de média zero e variância $1/I(\\theta)$, o inverso da informação de Fisher.\n- **Eficiência assintótica**: essa variância atinge o limite inferior de Cramér-Rao, tornando o EMV assintoticamente ótimo.\n\nO EMV pode ser viesado em amostras finitas, mas seu viés tende a zero e suas garantias assintóticas o tornam o padrão de referência.",
                    },
                    {
                        type: "quote",
                        value: "Entre todos os valores possíveis do parâmetro, a verossimilhança elege aquele sob o qual o que de fato aconteceu era o mais esperado.",
                    },
                    {
                        type: "text",
                        value: "### Resumo\n\nA máxima verossimilhança escolhe $\\hat{\\theta}$ que maximiza $L(\\theta) = \\prod_{i} f(x_i; \\theta)$, o que em geral se faz maximizando a log-verossimilhança $\\ell(\\theta) = \\sum_{i} \\ln f(x_i; \\theta)$ e resolvendo $\\ell'(\\theta) = 0$. No modelo Bernoulli o EMV é $\\hat{p} = \\bar{X}$; na exponencial, $\\hat{\\lambda} = 1/\\bar{X}$; na Poisson, $\\hat{\\lambda} = \\bar{X}$. Sob regularidade, o EMV é invariante, consistente, assintoticamente normal com variância $1/I(\\theta)$ e assintoticamente eficiente, ainda que possa ser viesado em amostras finitas.",
                    },
                ],
                questions: [
                    {
                        statement: "A função de verossimilhança de uma amostra i.i.d. é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$L(\\theta) = \\sum_{i=1}^{n} f(x_i; \\theta)$",
                                isCorrect: false,
                            },
                            {
                                text: "$L(\\theta) = \\prod_{i=1}^{n} f(x_i; \\theta)$",
                                isCorrect: true,
                            },
                            {
                                text: "$L(\\theta) = \\prod_{i=1}^{n} \\ln f(x_i; \\theta)$",
                                isCorrect: false,
                            },
                            {
                                text: "$L(\\theta) = \\dfrac{1}{n}\\sum_{i=1}^{n} f(x_i; \\theta)$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Maximizar $\\ell(\\theta) = \\ln L(\\theta)$ equivale a maximizar $L(\\theta)$ porque o logaritmo é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "uma função estritamente crescente.",
                                isCorrect: true,
                            },
                            {
                                text: "uma função par em torno da origem.",
                                isCorrect: false,
                            },
                            {
                                text: "uma função sempre limitada.",
                                isCorrect: false,
                            },
                            {
                                text: "sempre negativo quando $L < 1$.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $X_i$ i.i.d. $\\mathrm{Bernoulli}(p)$, o estimador de máxima verossimilhança de $p$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\hat{p} = \\bar{X}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\hat{p} = 1/\\bar{X}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\hat{p} = \\sum_{i=1}^{n} X_i$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\hat{p} = \\bar{X}/n$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Para $X_i$ i.i.d. com $f(x; \\lambda) = \\lambda e^{-\\lambda x}$, o EMV de $\\lambda$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\hat{\\lambda} = \\bar{X}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\hat{\\lambda} = 1/\\bar{X}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\hat{\\lambda} = n/\\sum_{i} X_i^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\hat{\\lambda} = \\ln \\bar{X}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Se $\\hat{\\lambda} = 1/\\bar{X}$ é o EMV de $\\lambda$, então pela invariância o EMV da média $\\mu = 1/\\lambda$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$\\hat{\\mu} = 1/\\bar{X}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\hat{\\mu} = \\bar{X}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\hat{\\mu} = 1/\\bar{X}^2$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\hat{\\mu} = \\ln \\bar{X}$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Intervalos de confiança",
                blocks: [
                    {
                        type: "text",
                        value: "## Intervalos de confiança\n\nUma estimativa pontual entrega um único número, sem indicar quão confiável ele é. A **estimação por intervalo** corrige isso, fornecendo uma faixa de valores plausíveis para $\\theta$ acompanhada de um grau de confiança.\n\nUm **intervalo de confiança** de nível $1 - \\alpha$ para $\\theta$ é um par de estatísticas $L = L(X_1, \\ldots, X_n)$ e $U = U(X_1, \\ldots, X_n)$ tais que\n\n$$P\\big(L \\le \\theta \\le U\\big) = 1 - \\alpha.$$\n\nO número $1 - \\alpha$ é o **nível de confiança**, tipicamente $0{,}90$, $0{,}95$ ou $0{,}99$.",
                    },
                    {
                        type: "text",
                        value: "### Interpretação\n\nA interpretação correta é frequentista e exige cuidado. O parâmetro $\\theta$ é fixo e desconhecido; quem é aleatório é o intervalo $[L, U]$, pois depende da amostra. A afirmação $P(L \\le \\theta \\le U) = 1 - \\alpha$ diz que, em repetidas amostragens, uma fração $1 - \\alpha$ dos intervalos construídos conterá o verdadeiro $\\theta$.\n\nÉ incorreto dizer que 'há 95% de probabilidade de theta estar no intervalo observado': uma vez calculado, o intervalo $[l, u]$ é fixo e ou contém $\\theta$ ou não. A probabilidade refere-se ao procedimento, não a um intervalo particular já obtido.",
                    },
                    {
                        type: "text",
                        value: "### Quantidades pivotais\n\nO método mais comum de construção usa uma **quantidade pivotal**: uma função $Q(X_1, \\ldots, X_n; \\theta)$ que depende dos dados e do parâmetro, mas cuja distribuição **não depende de $\\theta$**.\n\nConhecida essa distribuição, encontramos valores $a$ e $b$ com $P(a \\le Q \\le b) = 1 - \\alpha$ e, invertendo as desigualdades para isolar $\\theta$, obtemos o intervalo. A arte está em achar um pivô adequado para cada modelo.",
                    },
                    {
                        type: "text",
                        value: "### Média com variância conhecida\n\nSeja $X_1, \\ldots, X_n$ i.i.d. $N(\\mu, \\sigma^2)$ com $\\sigma^2$ conhecida. Como $\\bar{X} \\sim N(\\mu, \\sigma^2/n)$, a quantidade\n\n$$Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}} \\sim N(0, 1)$$\n\né pivotal: sua distribuição é normal padrão, independente de $\\mu$. Sendo $z_{\\alpha/2}$ o quantil que deixa $\\alpha/2$ na cauda superior, temos $P(-z_{\\alpha/2} \\le Z \\le z_{\\alpha/2}) = 1 - \\alpha$. Isolando $\\mu$,\n\n$$\\bar{X} - z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}} \\le \\mu \\le \\bar{X} + z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}},$$\n\nou seja, o intervalo $\\bar{X} \\pm z_{\\alpha/2}\\, \\dfrac{\\sigma}{\\sqrt{n}}$. Mesmo sem normalidade exata, o teorema central do limite justifica esse intervalo de forma aproximada para $n$ grande.",
                    },
                    {
                        type: "text",
                        value: "### Exemplo numérico\n\nSuponha $n = 100$ observações com $\\bar{x} = 50$ e desvio padrão populacional conhecido $\\sigma = 8$. Para um nível de confiança de $95\\%$, usamos $z_{0{,}025} = 1{,}96$. A margem de erro é\n\n$$z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}} = 1{,}96 \\times \\frac{8}{\\sqrt{100}} = 1{,}96 \\times 0{,}8 = 1{,}568.$$\n\nO intervalo de confiança de $95\\%$ para $\\mu$ é\n\n$$50 \\pm 1{,}568, \\quad \\text{isto é,} \\quad [48{,}43,\\; 51{,}57].$$\n\nSe quiséssemos $99\\%$ de confiança, trocaríamos $1{,}96$ por $2{,}576$, obtendo um intervalo mais largo: maior confiança custa maior imprecisão.",
                    },
                    {
                        type: "text",
                        value: "### Média com variância desconhecida\n\nNa prática $\\sigma$ raramente é conhecida. Substituímos $\\sigma$ pelo desvio padrão amostral $S = \\sqrt{\\frac{1}{n-1}\\sum_{i} (X_i - \\bar{X})^2}$. Para dados normais, o pivô resultante\n\n$$T = \\frac{\\bar{X} - \\mu}{S / \\sqrt{n}}$$\n\nnão é mais normal padrão, e sim uma distribuição **$t$ de Student com $n - 1$ graus de liberdade**. O intervalo passa a ser\n\n$$\\bar{X} \\pm t_{n-1,\\, \\alpha/2}\\, \\frac{S}{\\sqrt{n}}.$$\n\nOs quantis $t_{n-1,\\alpha/2}$ são maiores que os de $z$, refletindo a incerteza extra por estimar $\\sigma$; para $n$ grande a $t$ se aproxima da normal e os dois intervalos praticamente coincidem.",
                    },
                    {
                        type: "text",
                        value: "### O que determina a largura\n\nA largura do intervalo $\\bar{X} \\pm z_{\\alpha/2}\\,\\sigma/\\sqrt{n}$ mostra três forças em jogo:\n\n- **Tamanho amostral $n$**: a largura cai com $\\sqrt{n}$; para reduzi-la à metade é preciso quadruplicar $n$.\n- **Nível de confiança**: exigir mais confiança aumenta $z_{\\alpha/2}$ e alarga o intervalo.\n- **Variabilidade $\\sigma$**: populações mais dispersas geram intervalos mais largos.\n\nO fator $\\sqrt{n}$ no denominador é essencial: é ele que garante que o intervalo encolha à medida que coletamos mais dados.",
                    },
                    {
                        type: "quote",
                        value: "Um intervalo de confiança não afirma onde o parâmetro está; descreve a confiabilidade do método que o produziu.",
                    },
                    {
                        type: "text",
                        value: "### Resumo\n\nUm intervalo de confiança de nível $1 - \\alpha$ é um intervalo aleatório que cobre o parâmetro fixo $\\theta$ com probabilidade $1 - \\alpha$ sob repetidas amostragens, construído tipicamente por uma quantidade pivotal. Para a média com $\\sigma$ conhecida, o pivô $Z = (\\bar{X} - \\mu)/(\\sigma/\\sqrt{n})$ leva a $\\bar{X} \\pm z_{\\alpha/2}\\,\\sigma/\\sqrt{n}$; com $\\sigma$ desconhecida, usa-se $S$ e a distribuição $t_{n-1}$, resultando em $\\bar{X} \\pm t_{n-1,\\alpha/2}\\, S/\\sqrt{n}$. A largura diminui com $\\sqrt{n}$ e aumenta com o nível de confiança e com $\\sigma$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um intervalo de confiança de $95\\%$ para $\\theta$ significa que:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "há $95\\%$ de probabilidade de $\\theta$ estar no intervalo obtido.",
                                isCorrect: false,
                            },
                            {
                                text: "em repetidas amostras, $95\\%$ dos intervalos contêm $\\theta$.",
                                isCorrect: true,
                            },
                            {
                                text: "cerca de $95\\%$ dos dados caem dentro do intervalo calculado.",
                                isCorrect: false,
                            },
                            {
                                text: "o parâmetro $\\theta$ varia dentro do intervalo em $95\\%$ do tempo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma quantidade pivotal é uma função dos dados e de $\\theta$ cuja:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "esperança é sempre igual a $\\theta$.",
                                isCorrect: false,
                            },
                            {
                                text: "distribuição não depende de $\\theta$.",
                                isCorrect: true,
                            },
                            {
                                text: "variância não depende de $n$.",
                                isCorrect: false,
                            },
                            {
                                text: "distribuição é sempre a normal padrão $N(0,1)$.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O intervalo de confiança para $\\mu$ com $\\sigma$ conhecida é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$\\bar{X} \\pm z_{\\alpha/2}\\, \\sigma$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\bar{X} \\pm z_{\\alpha/2}\\, \\dfrac{\\sigma}{\\sqrt{n}}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\bar{X} \\pm z_{\\alpha/2}\\, \\dfrac{\\sigma}{n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\bar{X} \\pm z_{\\alpha/2}\\, \\dfrac{\\sigma^2}{\\sqrt{n}}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Ao estimar $\\mu$ com $\\sigma$ desconhecida e dados normais, o intervalo baseia-se na:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "distribuição normal padrão $N(0,1)$.",
                                isCorrect: false,
                            },
                            {
                                text: "distribuição $t$ de Student com $n - 1$ graus de liberdade.",
                                isCorrect: true,
                            },
                            {
                                text: "distribuição $t$ de Student com $n$ graus de liberdade.",
                                isCorrect: false,
                            },
                            {
                                text: "distribuição qui-quadrado com $n - 1$ graus de liberdade.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Com $n = 64$, $\\sigma = 16$ e $z_{\\alpha/2} = 1{,}96$, a margem de erro $z_{\\alpha/2}\\,\\sigma/\\sqrt{n}$ vale aproximadamente:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$0{,}49$",
                                isCorrect: false,
                            },
                            {
                                text: "$3{,}92$",
                                isCorrect: true,
                            },
                            {
                                text: "$31{,}36$",
                                isCorrect: false,
                            },
                            {
                                text: "$2{,}00$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Testes de hipóteses",
        aulas: [
            {
                titulo: "Hipóteses e tipos de erro",
                blocks: [
                    {
                        type: "text",
                        value: "## O que é um teste de hipóteses\n\nUm **teste de hipóteses** é um procedimento de inferência estatística que confronta duas afirmações concorrentes sobre a distribuição de uma variável aleatória. Em geral, supomos que os dados $X_1, \\dots, X_n$ formam uma amostra de uma distribuição pertencente a uma família $\\{ P_\\theta : \\theta \\in \\Theta \\}$, indexada por um parâmetro $\\theta$ que vive no espaço paramétrico $\\Theta$.\n\nUma **hipótese estatística** é uma afirmação sobre o valor de $\\theta$, ou seja, uma restrição da forma $\\theta \\in \\Theta_0$ para algum subconjunto $\\Theta_0 \\subset \\Theta$. Testar hipóteses significa decidir, com base na amostra, se os dados são compatíveis com essa restrição.",
                    },
                    {
                        type: "text",
                        value: "## Hipótese nula e hipótese alternativa\n\nUm problema de teste parte de uma partição do espaço paramétrico em dois conjuntos disjuntos, $\\Theta_0$ e $\\Theta_1$, com $\\Theta_0 \\cup \\Theta_1 = \\Theta$. A elas associamos:\n\n- a **hipótese nula** $H_0: \\theta \\in \\Theta_0$;\n- a **hipótese alternativa** $H_1: \\theta \\in \\Theta_1$.\n\nA hipótese nula costuma representar o *status quo*, a ausência de efeito ou a afirmação que se deseja contestar. A alternativa carrega aquilo que o pesquisador espera evidenciar.\n\nDizemos que uma hipótese é **simples** quando especifica completamente a distribuição, isto é, quando o conjunto correspondente tem um único ponto (por exemplo $H_0: \\theta = \\theta_0$). Caso contrário, ela é **composta** (por exemplo $H_1: \\theta > \\theta_0$).",
                    },
                    {
                        type: "quote",
                        value: "A hipótese nula é levada a julgamento: nunca a provamos verdadeira, apenas decidimos se há evidência suficiente para rejeitá-la.",
                    },
                    {
                        type: "text",
                        value: "## Regra de decisão e região crítica\n\nUm **teste** é uma regra de decisão que, a cada amostra possível, associa uma de duas conclusões: rejeitar $H_0$ ou não rejeitar $H_0$. Essa regra é descrita por uma **região crítica** (ou região de rejeição) $R$, um subconjunto do espaço amostral: se o vetor observado cai em $R$, rejeitamos $H_0$; caso contrário, não rejeitamos.\n\nNa prática, a região crítica é definida por meio de uma **estatística de teste** $T = T(X_1, \\dots, X_n)$, uma função da amostra cuja distribuição sob $H_0$ é conhecida. O teste assume então a forma: rejeitar $H_0$ quando $T$ cai em certa faixa de valores considerados improváveis sob a hipótese nula.",
                    },
                    {
                        type: "text",
                        value: "## Os dois tipos de erro\n\nComo a decisão se baseia em uma amostra aleatória, todo teste está sujeito a erros. Há exatamente duas maneiras de errar:\n\n- **Erro do tipo I**: rejeitar $H_0$ quando $H_0$ é verdadeira;\n- **Erro do tipo II**: não rejeitar $H_0$ quando $H_0$ é falsa.\n\nO quadro abaixo resume as quatro combinações possíveis entre a decisão e o estado verdadeiro da natureza:\n\n| Decisão | $H_0$ verdadeira | $H_0$ falsa |\n|---|---|---|\n| Não rejeitar $H_0$ | Decisão correta | Erro do tipo II |\n| Rejeitar $H_0$ | Erro do tipo I | Decisão correta |\n\nAs probabilidades desses erros são denotadas por $\\alpha = P(\\text{erro tipo I})$ e $\\beta = P(\\text{erro tipo II})$.",
                    },
                    {
                        type: "text",
                        value: "## Função poder\n\nFormalmente, definimos a **função poder** do teste como a probabilidade de rejeitar $H_0$ em função do parâmetro:\n\n$$\\pi(\\theta) = P_\\theta(\\text{rejeitar } H_0) = P_\\theta(T \\in R).$$\n\nPara valores de $\\theta$ em $\\Theta_0$, $\\pi(\\theta)$ é a probabilidade de erro tipo I; para $\\theta$ em $\\Theta_1$, temos $\\pi(\\theta) = 1 - \\beta(\\theta)$, o **poder** do teste, isto é, a probabilidade de detectar corretamente a alternativa. Assim,\n\n$$\\alpha = \\sup_{\\theta \\in \\Theta_0} \\pi(\\theta), \\qquad \\text{poder} = 1 - \\beta.$$\n\nUm bom teste mantém $\\alpha$ pequeno e, ao mesmo tempo, poder alto. Há um conflito inerente: reduzir $\\alpha$ tende a aumentar $\\beta$, de modo que os dois erros não podem ser minimizados simultaneamente com $n$ fixo.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: formulando as hipóteses\n\nUma fábrica afirma que a vida útil média de suas lâmpadas é de pelo menos $1000$ horas. Um órgão de defesa do consumidor desconfia que a média real seja menor. Denotando por $\\mu$ a vida útil média, o teste natural é\n\n$$H_0: \\mu \\ge 1000 \\quad \\text{contra} \\quad H_1: \\mu < 1000.$$\n\nColoca-se em $H_0$ a afirmação do fabricante, pois só faz sentido acusá-lo se houver evidência forte contra ela. Nesse contexto:\n\n- o **erro tipo I** é concluir que as lâmpadas duram menos de $1000$ horas quando na verdade cumprem o prometido;\n- o **erro tipo II** é não detectar a falha quando a vida útil real é de fato inferior a $1000$ horas.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: calculando $\\alpha$ e $\\beta$\n\nSeja $X \\sim N(\\mu, 4)$ uma única medição, com variância conhecida $\\sigma^2 = 4$. Considere o teste simples contra simples\n\n$$H_0: \\mu = 10 \\quad \\text{contra} \\quad H_1: \\mu = 13,$$\n\ncom a regra: rejeitar $H_0$ se $X > 12$.\n\n**Erro tipo I.** Sob $H_0$, $X \\sim N(10, 4)$, logo\n\n$$\\alpha = P(X > 12 \\mid \\mu = 10) = P\\left(Z > \\frac{12 - 10}{2}\\right) = P(Z > 1) \\approx 0{,}1587.$$\n\n**Erro tipo II.** Sob $H_1$, $X \\sim N(13, 4)$, logo\n\n$$\\beta = P(X \\le 12 \\mid \\mu = 13) = P\\left(Z \\le \\frac{12 - 13}{2}\\right) = P(Z \\le -0{,}5) \\approx 0{,}3085.$$\n\nO poder do teste é $1 - \\beta \\approx 0{,}6915$. Note que deslocar o corte para a direita reduziria $\\alpha$, mas aumentaria $\\beta$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Um teste confronta $H_0: \\theta \\in \\Theta_0$ e $H_1: \\theta \\in \\Theta_1$ por meio de uma estatística de teste e de uma região crítica.\n- O **erro tipo I** (rejeitar $H_0$ verdadeira) tem probabilidade $\\alpha$; o **erro tipo II** (não rejeitar $H_0$ falsa) tem probabilidade $\\beta$.\n- O **poder** $1 - \\beta$ mede a capacidade de detectar a alternativa.\n- Com $n$ fixo, diminuir $\\alpha$ em geral aumenta $\\beta$; equilibrar os dois erros é o cerne do projeto de um teste.",
                    },
                ],
                questions: [
                    {
                        statement: "Em um teste de hipóteses, o **erro do tipo I** ocorre quando:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "não rejeitamos $H_0$ sendo $H_0$ falsa",
                                isCorrect: false,
                            },
                            {
                                text: "rejeitamos $H_0$ sendo $H_0$ verdadeira",
                                isCorrect: true,
                            },
                            {
                                text: "não rejeitamos $H_0$ sendo $H_0$ verdadeira",
                                isCorrect: false,
                            },
                            {
                                text: "rejeitamos $H_0$ sendo $H_0$ falsa",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A probabilidade de cometer o erro do tipo II é habitualmente denotada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\alpha$",
                                isCorrect: false,
                            },
                            {
                                text: "$1 - \\beta$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\beta$",
                                isCorrect: true,
                            },
                            {
                                text: "$1 - \\alpha$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um teste diagnóstico avalia $H_0$: o paciente está saudável, contra $H_1$: o paciente está doente. O erro do tipo I corresponde a:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "diagnosticar como saudável um paciente doente",
                                isCorrect: false,
                            },
                            {
                                text: "diagnosticar como saudável um paciente saudável",
                                isCorrect: false,
                            },
                            {
                                text: "diagnosticar como doente um paciente doente",
                                isCorrect: false,
                            },
                            {
                                text: "diagnosticar como doente um paciente saudável",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement: "O poder de um teste de hipóteses é definido como:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$1 - \\beta$",
                                isCorrect: true,
                            },
                            {
                                text: "$1 - \\alpha$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\beta$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\alpha$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Seja $X \\sim N(\\mu, 4)$ uma única observação. Para testar $H_0: \\mu = 10$ contra $H_1: \\mu = 13$, rejeita-se $H_0$ se $X > 12$. Sabendo que $P(Z \\le -0{,}5) \\approx 0{,}31$, a probabilidade do erro do tipo II vale aproximadamente:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$0{,}69$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}16$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}31$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}50$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Nível de significância e p-valor",
                blocks: [
                    {
                        type: "text",
                        value: "## Nível de significância\n\nAo projetar um teste, fixamos de antemão um limite superior tolerável para a probabilidade de erro tipo I. Esse limite é o **nível de significância**, denotado por $\\alpha$, tipicamente $0{,}10$, $0{,}05$ ou $0{,}01$.\n\nMais precisamente, o **tamanho** de um teste com região crítica $R$ é\n\n$$\\sup_{\\theta \\in \\Theta_0} P_\\theta(T \\in R),$$\n\nou seja, a maior probabilidade de erro tipo I sobre toda a hipótese nula. Dizemos que o teste tem nível $\\alpha$ quando seu tamanho não excede $\\alpha$. A escolha de $\\alpha$ reflete o quanto estamos dispostos a arriscar uma rejeição indevida de $H_0$.",
                    },
                    {
                        type: "text",
                        value: "## Valores críticos e região de rejeição\n\nQuando a estatística de teste tem distribuição $N(0,1)$ sob $H_0$, a região crítica é construída a partir de **valores críticos** da normal padrão. Seja $z_\\alpha$ o ponto tal que $P(Z > z_\\alpha) = \\alpha$. As três configurações usuais são:\n\n- **Unilateral à direita** ($H_1: \\theta > \\theta_0$): rejeita-se se $Z > z_\\alpha$;\n- **Unilateral à esquerda** ($H_1: \\theta < \\theta_0$): rejeita-se se $Z < -z_\\alpha$;\n- **Bilateral** ($H_1: \\theta \\ne \\theta_0$): rejeita-se se $|Z| > z_{\\alpha/2}$.\n\nPara $\\alpha = 0{,}05$, tem-se $z_{0{,}05} \\approx 1{,}645$ e $z_{0{,}025} \\approx 1{,}96$. No caso bilateral, a massa $\\alpha$ é dividida igualmente entre as duas caudas.",
                    },
                    {
                        type: "quote",
                        value: "Um resultado estatisticamente significativo responde se um efeito existe, não se ele é grande ou importante.",
                    },
                    {
                        type: "text",
                        value: "## O p-valor\n\nO **p-valor** é uma medida de quão incompatível a amostra observada é com a hipótese nula. Formalmente, é a probabilidade, calculada **sob $H_0$**, de obter uma estatística de teste tão ou mais extrema que a efetivamente observada, na direção indicada por $H_1$.\n\nSe $t_{obs}$ é o valor observado e o teste rejeita para valores grandes de $T$ (cauda à direita), então\n\n$$p = P_{H_0}(T \\ge t_{obs}).$$\n\nPara um teste bilateral baseado em $|T|$, temos $p = P_{H_0}(|T| \\ge |t_{obs}|)$. Quanto menor o p-valor, mais forte a evidência contra $H_0$.",
                    },
                    {
                        type: "text",
                        value: "## Regra de decisão pelo p-valor\n\nO p-valor conecta-se ao nível de significância por uma regra simples:\n\n$$\\text{rejeitar } H_0 \\iff p \\le \\alpha.$$\n\nEssa regra é **equivalente** a verificar se a estatística caiu na região crítica de nível $\\alpha$: o p-valor é exatamente o menor nível de significância para o qual a amostra observada levaria à rejeição de $H_0$. Assim, reportar o p-valor é mais informativo do que apenas dizer se rejeitamos ou não, pois permite ao leitor aplicar o próprio $\\alpha$.",
                    },
                    {
                        type: "text",
                        value: "## O que o p-valor não é\n\nO p-valor é frequentemente mal interpretado. Convém fixar o que ele **não** significa:\n\n- **Não** é a probabilidade de $H_0$ ser verdadeira. A quantidade $P(H_0)$ sequer é definida na abordagem frequentista, pois $\\theta$ não é aleatório.\n- **Não** é a probabilidade de os dados terem ocorrido por acaso.\n- Um p-valor grande **não** prova que $H_0$ é verdadeira; apenas indica ausência de evidência suficiente contra ela.\n\nAlém disso, significância estatística não implica relevância prática: com $n$ muito grande, diferenças minúsculas produzem p-valores minúsculos.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: p-valor em teste unilateral\n\nUma amostra de $n = 25$ observações de uma $N(\\mu, \\sigma^2)$ com $\\sigma = 10$ conhecido fornece média $\\bar{x} = 103{,}6$. Testamos\n\n$$H_0: \\mu = 100 \\quad \\text{contra} \\quad H_1: \\mu > 100.$$\n\nA estatística de teste é\n\n$$z = \\frac{\\bar{x} - \\mu_0}{\\sigma / \\sqrt{n}} = \\frac{103{,}6 - 100}{10 / \\sqrt{25}} = \\frac{3{,}6}{2} = 1{,}8.$$\n\nComo o teste é à direita, o p-valor é $p = P(Z \\ge 1{,}8) \\approx 0{,}036$. A um nível $\\alpha = 0{,}05$, como $0{,}036 \\le 0{,}05$, **rejeitamos** $H_0$. Já a $\\alpha = 0{,}01$, como $0{,}036 > 0{,}01$, **não** rejeitamos. O mesmo dado leva a conclusões diferentes conforme o $\\alpha$ adotado.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: p-valor em teste bilateral\n\nMantendo $\\sigma = 10$ e $n = 25$, suponha agora $\\bar{x} = 104{,}2$ e o teste bilateral\n\n$$H_0: \\mu = 100 \\quad \\text{contra} \\quad H_1: \\mu \\ne 100.$$\n\nA estatística vale\n\n$$z = \\frac{104{,}2 - 100}{10 / \\sqrt{25}} = \\frac{4{,}2}{2} = 2{,}1.$$\n\nPor ser bilateral, contam-se as duas caudas:\n\n$$p = 2\\,P(Z \\ge 2{,}1) \\approx 2 \\times 0{,}0179 = 0{,}0358.$$\n\nComo $p \\approx 0{,}036 \\le 0{,}05$, rejeitamos $H_0$ ao nível de $5\\%$. Perceba que esquecer de dobrar a cauda levaria a um p-valor pela metade e a uma conclusão possivelmente equivocada.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- O **nível de significância** $\\alpha$ é o limite superior fixado a priori para a probabilidade de erro tipo I; o **tamanho** do teste é o supremo dessa probabilidade sobre $H_0$.\n- Os valores críticos $z_\\alpha$ (unilateral) e $z_{\\alpha/2}$ (bilateral) delimitam a região de rejeição.\n- O **p-valor** é a probabilidade, sob $H_0$, de um resultado tão ou mais extremo que o observado; rejeita-se $H_0$ quando $p \\le \\alpha$.\n- O p-valor **não** é a probabilidade de $H_0$ ser verdadeira, e significância estatística não equivale a importância prática.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A regra de decisão baseada no p-valor determina que devemos rejeitar $H_0$ quando:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$p \\le \\alpha$",
                                isCorrect: true,
                            },
                            {
                                text: "$p > \\alpha$",
                                isCorrect: false,
                            },
                            {
                                text: "$p \\le \\beta$",
                                isCorrect: false,
                            },
                            {
                                text: "$p > \\beta$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O nível de significância $\\alpha$ de um teste representa:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "a maior probabilidade tolerada de erro tipo II",
                                isCorrect: false,
                            },
                            {
                                text: "a probabilidade de $H_0$ ser verdadeira",
                                isCorrect: false,
                            },
                            {
                                text: "o poder do teste sob a alternativa",
                                isCorrect: false,
                            },
                            {
                                text: "a maior probabilidade tolerada de erro tipo I",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em um teste bilateral com estatística $Z \\sim N(0,1)$ sob $H_0$, observa-se $z = 2{,}1$. Usando $P(Z \\ge 2{,}1) \\approx 0{,}018$, o p-valor é aproximadamente:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0{,}018$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}036$",
                                isCorrect: true,
                            },
                            {
                                text: "$0{,}009$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}982$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um teste fornece p-valor $p = 0{,}08$. Ao nível de significância $\\alpha = 0{,}05$, a decisão correta é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "rejeitar $H_0$, pois $p < \\alpha$",
                                isCorrect: false,
                            },
                            {
                                text: "rejeitar $H_0$, pois $p > \\alpha$",
                                isCorrect: false,
                            },
                            {
                                text: "não rejeitar $H_0$, pois $p > \\alpha$",
                                isCorrect: true,
                            },
                            {
                                text: "não rejeitar $H_0$, pois $p < \\alpha$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma amostra de $n = 25$ de uma $N(\\mu, \\sigma^2)$ com $\\sigma = 10$ tem média $\\bar{x} = 103{,}6$. Para $H_0: \\mu = 100$ contra $H_1: \\mu > 100$, a estatística $z$ vale:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$0{,}36$",
                                isCorrect: false,
                            },
                            {
                                text: "$9{,}0$",
                                isCorrect: false,
                            },
                            {
                                text: "$3{,}6$",
                                isCorrect: false,
                            },
                            {
                                text: "$1{,}8$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Teste para a média",
                blocks: [
                    {
                        type: "text",
                        value: "## Testando a média de uma população\n\nO problema mais clássico de teste de hipóteses diz respeito à média $\\mu$ de uma população. Dispomos de uma amostra $X_1, \\dots, X_n$ e queremos confrontar\n\n$$H_0: \\mu = \\mu_0 \\quad \\text{contra} \\quad H_1: \\mu \\ne \\mu_0$$\n\n(ou uma das versões unilaterais). A forma da estatística de teste depende de uma questão crucial: a variância populacional $\\sigma^2$ é **conhecida** ou **desconhecida**?",
                    },
                    {
                        type: "text",
                        value: "## Variância conhecida: o teste $z$\n\nSuponha $X_1, \\dots, X_n$ independentes com distribuição $N(\\mu, \\sigma^2)$ e $\\sigma^2$ **conhecido**. Sob $H_0: \\mu = \\mu_0$, a média amostral satisfaz $\\bar{X} \\sim N(\\mu_0, \\sigma^2/n)$, de modo que a estatística padronizada\n\n$$z = \\frac{\\bar{X} - \\mu_0}{\\sigma / \\sqrt{n}}$$\n\ntem distribuição $N(0,1)$ exata sob a hipótese nula. Rejeitamos $H_0$ quando $z$ se afasta de zero mais do que o valor crítico permite. O denominador $\\sigma / \\sqrt{n}$ é o **erro padrão** da média; note a presença de $\\sqrt{n}$, que não pode ser omitida.",
                    },
                    {
                        type: "quote",
                        value: "Trocar o desvio conhecido pela estimativa amostral tem um preço: caudas mais pesadas e menos certeza sobre a média.",
                    },
                    {
                        type: "text",
                        value: "## Variância desconhecida: o teste $t$\n\nNa prática, raramente conhecemos $\\sigma^2$. Substituímos então $\\sigma$ pela raiz da **variância amostral**\n\n$$S^2 = \\frac{1}{n-1} \\sum_{i=1}^{n} (X_i - \\bar{X})^2,$$\n\nque usa o divisor $n-1$ para ser um estimador não viesado. A estatística resultante,\n\n$$t = \\frac{\\bar{X} - \\mu_0}{S / \\sqrt{n}},$$\n\n**não** é mais normal: sob $H_0$, e supondo a população normal, ela segue a distribuição $t$ de Student com $n-1$ graus de liberdade. Essa distribuição é simétrica e tem caudas mais pesadas que a normal, refletindo a incerteza extra por estimar $\\sigma$. Para $n$ grande, $t_{n-1}$ aproxima-se da $N(0,1)$.",
                    },
                    {
                        type: "text",
                        value: "## Regiões de rejeição\n\nAs regras de decisão têm a mesma estrutura nos dois casos, trocando-se o valor crítico da normal pelo da $t$. Para o teste bilateral $H_1: \\mu \\ne \\mu_0$ ao nível $\\alpha$:\n\n- teste $z$: rejeita-se se $|z| > z_{\\alpha/2}$;\n- teste $t$: rejeita-se se $|t| > t_{n-1,\\,\\alpha/2}$.\n\nNos testes unilaterais, usa-se uma única cauda, com valor crítico $z_\\alpha$ ou $t_{n-1,\\,\\alpha}$. Em qualquer caso, a decisão equivale a comparar o p-valor com $\\alpha$: rejeita-se $H_0$ quando $p \\le \\alpha$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: teste $z$ (variância conhecida)\n\nO peso médio histórico de um pacote é $\\mu_0 = 500$ g, com desvio padrão conhecido $\\sigma = 12$ g. Uma amostra de $n = 36$ pacotes recém-produzidos tem média $\\bar{x} = 495$ g. Testamos, a $\\alpha = 0{,}05$,\n\n$$H_0: \\mu = 500 \\quad \\text{contra} \\quad H_1: \\mu \\ne 500.$$\n\nA estatística é\n\n$$z = \\frac{495 - 500}{12 / \\sqrt{36}} = \\frac{-5}{2} = -2{,}5.$$\n\nComo $|z| = 2{,}5 > z_{0{,}025} \\approx 1{,}96$, **rejeitamos** $H_0$: há evidência de que o peso médio mudou. O p-valor é $p = 2\\,P(Z \\ge 2{,}5) \\approx 0{,}0124$, confirmando a rejeição a $5\\%$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: teste $t$ (variância desconhecida)\n\nUm novo método promete tempo médio de execução inferior a $30$ s. Coletamos $n = 16$ medições, obtendo $\\bar{x} = 28{,}4$ s e desvio padrão amostral $s = 4$ s. Supondo normalidade, testamos, a $\\alpha = 0{,}05$,\n\n$$H_0: \\mu = 30 \\quad \\text{contra} \\quad H_1: \\mu < 30.$$\n\nA estatística é\n\n$$t = \\frac{28{,}4 - 30}{4 / \\sqrt{16}} = \\frac{-1{,}6}{1} = -1{,}6.$$\n\nCom $n - 1 = 15$ graus de liberdade, o valor crítico unilateral é $t_{15,\\,0{,}05} \\approx 1{,}753$. Como $-1{,}6 > -1{,}753$, isto é, $|t|$ não ultrapassa o crítico, **não rejeitamos** $H_0$: a redução observada não é significativa a $5\\%$.",
                    },
                    {
                        type: "text",
                        value: "## Amostras grandes e populações não normais\n\nA suposição de normalidade é essencial para que $t$ tenha distribuição $t$ de Student **exata**. Quando a população não é normal, mas $n$ é grande, o Teorema Central do Limite garante que\n\n$$\\frac{\\bar{X} - \\mu_0}{S / \\sqrt{n}} \\approx N(0,1)$$\n\nsob $H_0$, de modo que o teste $z$ (usando $S$ no lugar de $\\sigma$) permanece aproximadamente válido. Como regra prática, $n \\ge 30$ costuma bastar para amostras moderadamente assimétricas. Para $n$ pequeno e população claramente não normal, recomenda-se cautela ou métodos não paramétricos.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Para testar $H_0: \\mu = \\mu_0$ em população normal com $\\sigma$ **conhecido**, usa-se $z = \\dfrac{\\bar{X} - \\mu_0}{\\sigma / \\sqrt{n}} \\sim N(0,1)$.\n- Com $\\sigma$ **desconhecido**, substitui-se por $S$ e usa-se $t = \\dfrac{\\bar{X} - \\mu_0}{S / \\sqrt{n}} \\sim t_{n-1}$.\n- A distribuição $t$ tem caudas mais pesadas; converge para a normal quando $n$ cresce.\n- Rejeita-se $H_0$ comparando o módulo da estatística ao valor crítico apropriado ou, de modo equivalente, verificando se $p \\le \\alpha$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Ao testar a média de uma população normal com **variância conhecida**, a estatística de teste apropriada é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$z = \\frac{\\bar{x} - \\mu_0}{\\sigma}$",
                                isCorrect: false,
                            },
                            {
                                text: "$t = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}}$",
                                isCorrect: false,
                            },
                            {
                                text: "$z = \\frac{\\bar{x} - \\mu_0}{\\sigma / \\sqrt{n}}$",
                                isCorrect: true,
                            },
                            {
                                text: "$z = \\frac{\\bar{x} - \\mu_0}{\\sigma / n}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quando a variância populacional é **desconhecida**, o teste para a média usa a distribuição:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "normal padrão $N(0,1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$t$ de Student com $n - 1$ graus de liberdade",
                                isCorrect: true,
                            },
                            {
                                text: "$t$ de Student com $n$ graus de liberdade",
                                isCorrect: false,
                            },
                            {
                                text: "qui-quadrado com $n - 1$ graus de liberdade",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma amostra de $n = 36$ de uma população com $\\sigma = 12$ conhecido tem $\\bar{x} = 495$. Para $H_0: \\mu = 500$, o valor da estatística $z$ é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$-2{,}5$",
                                isCorrect: true,
                            },
                            {
                                text: "$-0{,}42$",
                                isCorrect: false,
                            },
                            {
                                text: "$-5{,}0$",
                                isCorrect: false,
                            },
                            {
                                text: "$-15{,}0$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em um teste $t$ bilateral com $n = 16$ observações ao nível $\\alpha = 0{,}05$, o número de graus de liberdade da distribuição de referência é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$16$",
                                isCorrect: false,
                            },
                            {
                                text: "$14$",
                                isCorrect: false,
                            },
                            {
                                text: "$17$",
                                isCorrect: false,
                            },
                            {
                                text: "$15$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Coletam-se $n = 16$ medições com $\\bar{x} = 28{,}4$ e desvio padrão amostral $s = 4$. Para testar $H_0: \\mu = 30$, o valor da estatística $t$ é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$-0{,}4$",
                                isCorrect: false,
                            },
                            {
                                text: "$-1{,}6$",
                                isCorrect: true,
                            },
                            {
                                text: "$-6{,}4$",
                                isCorrect: false,
                            },
                            {
                                text: "$-0{,}1$",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Testes para proporção e variância",
                blocks: [
                    {
                        type: "text",
                        value: "## Teste para uma proporção\n\nMuitos problemas envolvem uma **proporção populacional** $p$: a fração de eleitores que apoiam um candidato, a taxa de peças defeituosas, a probabilidade de sucesso de um tratamento. Observamos $X$ sucessos em $n$ ensaios independentes, com $X \\sim \\text{Binomial}(n, p)$, e estimamos $p$ pela proporção amostral $\\hat{p} = X / n$.\n\nPara testar $H_0: p = p_0$, apoiamo-nos no Teorema Central do Limite. Sob $H_0$, para $n$ grande,\n\n$$z = \\frac{\\hat{p} - p_0}{\\sqrt{\\dfrac{p_0(1 - p_0)}{n}}} \\approx N(0,1).$$",
                    },
                    {
                        type: "text",
                        value: "## Erro padrão e validade\n\nUm ponto sutil merece destaque: no denominador usamos $p_0$, o valor sob a hipótese nula, e **não** $\\hat{p}$. Como estamos calculando probabilidades supondo $H_0$ verdadeira, o erro padrão correto é $\\sqrt{p_0(1 - p_0)/n}$.\n\nA aproximação normal é confiável quando a amostra é suficientemente grande para que a binomial se comporte como normal; uma regra usual exige $n p_0 \\ge 5$ e $n(1 - p_0) \\ge 5$ (alguns autores pedem $10$). As regiões de rejeição são as mesmas do teste $z$ para a média: $|z| > z_{\\alpha/2}$ no caso bilateral e uma única cauda nos casos unilaterais.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: teste para proporção\n\nUm fornecedor garante que no máximo $5\\%$ das peças são defeituosas. Em uma inspeção de $n = 400$ peças, encontram-se $28$ defeituosas, ou seja, $\\hat{p} = 28 / 400 = 0{,}07$. Testamos, a $\\alpha = 0{,}05$,\n\n$$H_0: p = 0{,}05 \\quad \\text{contra} \\quad H_1: p > 0{,}05.$$\n\nO erro padrão sob $H_0$ é $\\sqrt{\\dfrac{0{,}05 \\times 0{,}95}{400}} \\approx 0{,}0109$. Logo\n\n$$z = \\frac{0{,}07 - 0{,}05}{0{,}0109} \\approx 1{,}835.$$\n\nComo o teste é à direita e $1{,}835 > z_{0{,}05} \\approx 1{,}645$, **rejeitamos** $H_0$: há evidência de que a taxa de defeitos excede $5\\%$.",
                    },
                    {
                        type: "quote",
                        value: "A variância também é hipótese testável: às vezes o que importa não é onde o processo está centrado, mas o quanto ele oscila.",
                    },
                    {
                        type: "text",
                        value: "## Teste para a variância de uma população normal\n\nQuando o interesse recai sobre a **dispersão**, testamos hipóteses sobre $\\sigma^2$. Seja $X_1, \\dots, X_n$ uma amostra de uma população $N(\\mu, \\sigma^2)$ e $S^2$ a variância amostral. Um resultado fundamental afirma que, sob $H_0: \\sigma^2 = \\sigma_0^2$,\n\n$$\\chi^2 = \\frac{(n-1) S^2}{\\sigma_0^2}$$\n\ntem distribuição **qui-quadrado com $n - 1$ graus de liberdade**. Diferentemente da normal e da $t$, a distribuição qui-quadrado é assimétrica e assume apenas valores positivos, por ser uma soma de quadrados.",
                    },
                    {
                        type: "text",
                        value: "## Regiões de rejeição para a variância\n\nComo a distribuição qui-quadrado não é simétrica, as duas caudas exigem valores críticos distintos. Denote por $\\chi^2_{n-1,\\,\\gamma}$ o ponto que deixa área $\\gamma$ à direita. Ao nível $\\alpha$:\n\n- **Bilateral** ($H_1: \\sigma^2 \\ne \\sigma_0^2$): rejeita-se se $\\chi^2 < \\chi^2_{n-1,\\,1 - \\alpha/2}$ ou $\\chi^2 > \\chi^2_{n-1,\\,\\alpha/2}$;\n- **Unilateral à direita** ($H_1: \\sigma^2 > \\sigma_0^2$): rejeita-se se $\\chi^2 > \\chi^2_{n-1,\\,\\alpha}$;\n- **Unilateral à esquerda** ($H_1: \\sigma^2 < \\sigma_0^2$): rejeita-se se $\\chi^2 < \\chi^2_{n-1,\\,1 - \\alpha}$.\n\nValores de $\\chi^2$ muito acima de $n - 1$ indicam variância maior que a hipotética; muito abaixo, menor.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: teste para a variância\n\nUm processo de enchimento é considerado sob controle se a variância do volume não passa de $\\sigma_0^2 = 4$. Uma amostra de $n = 20$ frascos apresenta variância amostral $s^2 = 6{,}5$. Testamos, a $\\alpha = 0{,}05$,\n\n$$H_0: \\sigma^2 = 4 \\quad \\text{contra} \\quad H_1: \\sigma^2 > 4.$$\n\nA estatística é\n\n$$\\chi^2 = \\frac{(20 - 1) \\times 6{,}5}{4} = \\frac{123{,}5}{4} \\approx 30{,}9.$$\n\nCom $19$ graus de liberdade, o valor crítico à direita é $\\chi^2_{19,\\,0{,}05} \\approx 30{,}14$. Como $30{,}9 > 30{,}14$, **rejeitamos** $H_0$: a variância do processo excede o limite tolerado.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Para uma **proporção**, sob $H_0: p = p_0$ e $n$ grande, usa-se $z = \\dfrac{\\hat{p} - p_0}{\\sqrt{p_0(1 - p_0)/n}} \\approx N(0,1)$, com $p_0$ no erro padrão.\n- Para a **variância** de uma população normal, sob $H_0: \\sigma^2 = \\sigma_0^2$, usa-se $\\chi^2 = \\dfrac{(n-1) S^2}{\\sigma_0^2} \\sim \\chi^2_{n-1}$.\n- A distribuição qui-quadrado é assimétrica e positiva, exigindo valores críticos diferentes em cada cauda.\n- Em ambos os casos, a decisão segue comparando a estatística ao valor crítico ou o p-valor a $\\alpha$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "No teste para uma proporção com $H_0: p = p_0$, o erro padrão usado no denominador da estatística $z$ é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sqrt{\\frac{\\hat{p}(1 - \\hat{p})}{n}}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{p_0(1 - p_0)}{n}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{\\frac{p_0(1 - p_0)}{\\sqrt{n}}}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sqrt{\\frac{p_0(1 - p_0)}{n}}$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "A estatística de teste para a variância de uma população normal, sob $H_0: \\sigma^2 = \\sigma_0^2$, é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\frac{(n-1)S^2}{\\sigma_0^2}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\frac{(n-1)S^2}{\\sigma_0}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{n S^2}{\\sigma_0^2}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\frac{(n-1)S}{\\sigma_0^2}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A estatística $\\chi^2 = \\frac{(n-1)S^2}{\\sigma_0^2}$ para a variância, sob $H_0$, segue distribuição qui-quadrado com quantos graus de liberdade quando $n = 20$?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$20$",
                                isCorrect: false,
                            },
                            {
                                text: "$18$",
                                isCorrect: false,
                            },
                            {
                                text: "$19$",
                                isCorrect: true,
                            },
                            {
                                text: "$21$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma inspeção de $n = 400$ peças tem $\\hat{p} = 0{,}07$. Para $H_0: p = 0{,}05$ com erro padrão $\\approx 0{,}0109$, a estatística $z$ vale aproximadamente:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$0{,}02$",
                                isCorrect: false,
                            },
                            {
                                text: "$1{,}84$",
                                isCorrect: true,
                            },
                            {
                                text: "$1{,}65$",
                                isCorrect: false,
                            },
                            {
                                text: "$18{,}4$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Uma amostra de $n = 20$ tem $s^2 = 6{,}5$. Para testar $H_0: \\sigma^2 = 4$, o valor da estatística qui-quadrado é aproximadamente:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$32{,}5$",
                                isCorrect: false,
                            },
                            {
                                text: "$7{,}7$",
                                isCorrect: false,
                            },
                            {
                                text: "$123{,}5$",
                                isCorrect: false,
                            },
                            {
                                text: "$30{,}9$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O teste qui-quadrado",
                blocks: [
                    {
                        type: "text",
                        value: "## A estatística qui-quadrado de Pearson\n\nOs testes vistos até aqui tratavam de parâmetros como média, proporção ou variância. O **teste qui-quadrado de Pearson** muda o foco: compara **frequências observadas** com **frequências esperadas** sob uma hipótese, sendo a principal ferramenta para dados categóricos.\n\nOrganizando os dados em $k$ categorias, sejam $O_i$ a frequência observada e $E_i$ a frequência esperada sob $H_0$ na categoria $i$. A estatística de teste é\n\n$$\\chi^2 = \\sum_{i=1}^{k} \\frac{(O_i - E_i)^2}{E_i}.$$\n\nEla mede a discrepância total entre o observado e o esperado: vale zero quando há concordância perfeita e cresce à medida que os desvios aumentam. Sob $H_0$ e para $n$ grande, sua distribuição é aproximadamente qui-quadrado.",
                    },
                    {
                        type: "text",
                        value: "## Teste de aderência\n\nO **teste de aderência** (ou de ajuste) verifica se os dados são compatíveis com uma distribuição especificada. A hipótese nula fixa as probabilidades $p_{10}, \\dots, p_{k0}$ de cada categoria:\n\n$$H_0: p_i = p_{i0} \\text{ para todo } i \\quad \\text{contra} \\quad H_1: p_i \\ne p_{i0} \\text{ para algum } i.$$\n\nAs frequências esperadas são $E_i = n\\,p_{i0}$, onde $n = \\sum_i O_i$ é o total de observações. Sob $H_0$, a estatística segue aproximadamente uma qui-quadrado com\n\n$$\\text{graus de liberdade} = k - 1 - m,$$\n\nem que $k$ é o número de categorias e $m$ é o número de parâmetros estimados a partir dos dados. Quando as probabilidades são totalmente especificadas ($m = 0$), os graus de liberdade são $k - 1$.",
                    },
                    {
                        type: "quote",
                        value: "O teste qui-quadrado nunca aponta a favor da hipótese nula: só sabe medir o tamanho da discrepância contra ela.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: um dado é honesto?\n\nUm dado é lançado $n = 120$ vezes, com as seguintes frequências por face:\n\n| Face | 1 | 2 | 3 | 4 | 5 | 6 |\n|---|---|---|---|---|---|---|\n| $O_i$ | 15 | 22 | 18 | 25 | 17 | 23 |\n\nSob $H_0$ (dado honesto), cada face tem probabilidade $1/6$, logo $E_i = 120 \\times \\frac{1}{6} = 20$ para toda face. A estatística é\n\n$$\\chi^2 = \\frac{(15-20)^2 + (22-20)^2 + (18-20)^2 + (25-20)^2 + (17-20)^2 + (23-20)^2}{20}.$$\n\nO numerador vale $25 + 4 + 4 + 25 + 9 + 9 = 76$, de modo que $\\chi^2 = 76 / 20 = 3{,}8$. Com $k - 1 = 5$ graus de liberdade e $\\alpha = 0{,}05$, o valor crítico é $\\chi^2_{5,\\,0{,}05} \\approx 11{,}07$. Como $3{,}8 < 11{,}07$, **não rejeitamos** $H_0$: os dados são compatíveis com um dado honesto.",
                    },
                    {
                        type: "text",
                        value: "## Teste de independência\n\nO teste qui-quadrado também avalia se duas variáveis categóricas são **independentes**. Os dados formam uma **tabela de contingência** com $r$ linhas e $c$ colunas, e testamos\n\n$$H_0: \\text{as variáveis são independentes} \\quad \\text{contra} \\quad H_1: \\text{há associação}.$$\n\nSob independência, a frequência esperada na célula $(i,j)$ é estimada por\n\n$$E_{ij} = \\frac{(\\text{total da linha } i)(\\text{total da coluna } j)}{n}.$$\n\nA estatística $\\chi^2 = \\sum_{i,j} \\frac{(O_{ij} - E_{ij})^2}{E_{ij}}$ segue, sob $H_0$, uma qui-quadrado com $(r-1)(c-1)$ graus de liberdade.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: tabela de contingência\n\nInvestiga-se se a preferência por um produto depende do sexo. Observou-se:\n\n| | Prefere | Não prefere | Total |\n|---|---|---|---|\n| Homens | 30 | 30 | 60 |\n| Mulheres | 50 | 30 | 80 |\n| Total | 80 | 60 | 140 |\n\nSob independência, a esperada da primeira célula é $E_{11} = \\frac{60 \\times 80}{140} \\approx 34{,}29$. As quatro esperadas são $34{,}29$, $25{,}71$, $45{,}71$ e $34{,}29$. A estatística fica\n\n$$\\chi^2 = \\frac{(30 - 34{,}29)^2}{34{,}29} + \\frac{(30 - 25{,}71)^2}{25{,}71} + \\frac{(50 - 45{,}71)^2}{45{,}71} + \\frac{(30 - 34{,}29)^2}{34{,}29} \\approx 2{,}19.$$\n\nOs graus de liberdade são $(2-1)(2-1) = 1$ e $\\chi^2_{1,\\,0{,}05} \\approx 3{,}84$. Como $2{,}19 < 3{,}84$, **não rejeitamos** $H_0$: não há evidência de associação entre sexo e preferência.",
                    },
                    {
                        type: "text",
                        value: "## Condições de validade e natureza do teste\n\nDois pontos merecem atenção. Primeiro, a distribuição qui-quadrado é apenas uma **aproximação**, válida quando as frequências esperadas não são pequenas; a regra prática exige $E_i \\ge 5$ em cada categoria. Quando alguma esperada é baixa, agrupam-se categorias ou recorre-se a testes exatos.\n\nSegundo, o teste qui-quadrado de aderência e de independência é sempre **unilateral à direita**: só desvios grandes, que inflam $\\sum (O - E)^2 / E$, contam como evidência contra $H_0$. Valores pequenos da estatística indicam boa concordância e nunca levam à rejeição. Por isso, a região crítica é $\\chi^2 > \\chi^2_{gl,\\,\\alpha}$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A estatística de Pearson $\\chi^2 = \\sum \\dfrac{(O_i - E_i)^2}{E_i}$ compara frequências observadas e esperadas.\n- No **teste de aderência**, $E_i = n\\,p_{i0}$ e os graus de liberdade são $k - 1 - m$, sendo $m$ o número de parâmetros estimados.\n- No **teste de independência**, $E_{ij} = \\dfrac{(\\text{total linha})(\\text{total coluna})}{n}$ e os graus de liberdade são $(r-1)(c-1)$.\n- O teste é unilateral à direita e exige frequências esperadas suficientemente grandes ($E_i \\ge 5$).",
                    },
                ],
                questions: [
                    {
                        statement: "A estatística qui-quadrado de Pearson é dada por:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$\\sum \\frac{(O - E)^2}{O}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum \\frac{(O - E)^2}{E}$",
                                isCorrect: true,
                            },
                            {
                                text: "$\\sum \\frac{(O - E)}{E}$",
                                isCorrect: false,
                            },
                            {
                                text: "$\\sum \\frac{O - E}{\\sqrt{E}}$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em um teste de aderência com $k$ categorias e nenhum parâmetro estimado, o número de graus de liberdade é:",
                        difficulty: "facil",
                        options: [
                            {
                                text: "$k$",
                                isCorrect: false,
                            },
                            {
                                text: "$k - 2$",
                                isCorrect: false,
                            },
                            {
                                text: "$k - 1$",
                                isCorrect: true,
                            },
                            {
                                text: "$k + 1$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Em uma tabela de contingência com $r$ linhas e $c$ colunas, o número de graus de liberdade do teste de independência é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$(r - 1)(c - 1)$",
                                isCorrect: true,
                            },
                            {
                                text: "$r c - 1$",
                                isCorrect: false,
                            },
                            {
                                text: "$(r - 1) + (c - 1)$",
                                isCorrect: false,
                            },
                            {
                                text: "$r c$",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um dado é lançado $120$ vezes. Sob a hipótese de dado honesto, a frequência esperada de cada face é:",
                        difficulty: "medio",
                        options: [
                            {
                                text: "$6$",
                                isCorrect: false,
                            },
                            {
                                text: "$60$",
                                isCorrect: false,
                            },
                            {
                                text: "$12$",
                                isCorrect: false,
                            },
                            {
                                text: "$20$",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um dado lançado $120$ vezes produz frequências $15, 22, 18, 25, 17, 23$ nas seis faces, com esperada $E_i = 20$ em cada. O valor da estatística qui-quadrado é:",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "$3{,}8$",
                                isCorrect: true,
                            },
                            {
                                text: "$76$",
                                isCorrect: false,
                            },
                            {
                                text: "$0{,}63$",
                                isCorrect: false,
                            },
                            {
                                text: "$12{,}67$",
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
