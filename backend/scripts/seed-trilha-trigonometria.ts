// Seed da trilha Trigonometria. Conteúdo autoral, quiz-only, com fórmulas em LaTeX
// ($...$ inline e $$...$$ em bloco). As resoluções passo a passo ficam em
// scripts/solucoes/trigonometria.json e entram por mesclarSolucoes. Idempotente: se a
// trilha já tiver aulas, só atualiza as explicações.
//
// As alternativas já saem embaralhadas do gerador, com semente no enunciado. Sem
// isso a correta ficaria em position 1 em toda questão e o gabarito do e-book, que
// não passa pelo backend, sairia todo em A.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-trigonometria.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { backfillExplicacoes, mesclarSolucoes } from "./backfill-explicacoes.ts";

const NOME = "Trigonometria";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const HORAS = 20;
const DESCRICAO =
    "Trigonometria do triângulo ao ciclo, na ordem em que ela faz sentido: seno, cosseno e tangente como razões entre lados, resolução de triângulo retângulo, lei dos senos e lei dos cossenos para triângulos quaisquer, área pelo seno, a passagem de grau para radiano, o ciclo trigonométrico quadrante por quadrante, as funções seno, cosseno e tangente com período, amplitude e gráfico, as identidades (relação fundamental, soma e diferença de arcos, arco duplo), equações e inequações trigonométricas, e as aplicações que deram origem a tudo isso: altura inacessível, rampa, navegação e fenômeno periódico.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    explanation?: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULOS = [
    {
        titulo: "Módulo 1 - Trigonometria no triângulo retângulo",
        aulas: [
            {
                titulo: "O que a trigonometria resolve",
                blocks: [
                    {
                        type: "text",
                        value: "# O que a trigonometria resolve\n\nQual é a altura daquela árvore? E do prédio da esquina? Ninguém vai subir até o topo com uma trena na mão para descobrir, e mesmo assim a resposta sai com precisão a partir de duas medidas feitas no chão: a distância até o pé da árvore e a inclinação do olhar quando miramos o topo.\n\nA trigonometria nasceu exatamente disso, de medir o que não se alcança. A palavra vem do grego e significa medida do triângulo. Nesta aula vamos entender a propriedade que torna esse truque possível, e ela é mais simples do que parece.",
                    },
                    {
                        type: "text",
                        value: "## Dois triângulos retângulos com o mesmo ângulo são semelhantes\n\nUm **triângulo retângulo** é o que tem um ângulo de $90^\\circ$. Os dois lados que formam esse ângulo reto são os **catetos**, e o lado oposto a ele, sempre o maior dos três, é a **hipotenusa**. Como a soma dos ângulos internos de qualquer triângulo é $180^\\circ$, os outros dois ângulos somam $90^\\circ$: são os **ângulos agudos**, cada um menor que $90^\\circ$.\n\nDois triângulos são **semelhantes** quando têm os mesmos ângulos e os lados correspondentes proporcionais, ou seja, quando um é a ampliação ou a redução do outro. O **caso AA** garante a semelhança com apenas dois ângulos iguais, porque o terceiro vem de graça da soma $180^\\circ$.\n\nEm triângulo retângulo isso fica fácil: o ângulo de $90^\\circ$ já é comum aos dois. Basta então **um** ângulo agudo igual para que os triângulos sejam semelhantes.",
                    },
                    {
                        type: "text",
                        value: "## A razão entre dois lados só depende do ângulo\n\nSemelhança significa lados proporcionais. Se o segundo triângulo é a ampliação do primeiro por um fator $k$, cada lado dele é $k$ vezes o lado correspondente. E aqui está o ponto: ao dividir um lado pelo outro, o fator $k$ aparece em cima e embaixo, e vai embora.\n\n$$\\frac{k \\cdot \\text{cateto}}{k \\cdot \\text{hipotenusa}} = \\frac{\\text{cateto}}{\\text{hipotenusa}}$$\n\nOu seja: a razão entre dois lados de um triângulo retângulo **não depende do tamanho do triângulo**, só do ângulo agudo escolhido. Triângulo grande ou pequeno, se o ângulo é o mesmo, a razão é a mesma. É essa constância que justifica dar nome a essas razões, o que faremos na próxima aula.",
                    },
                    {
                        type: "text",
                        value: "## Um exemplo com três tamanhos\n\nConsidere um triângulo retângulo de catetos $3$ e $4$ e hipotenusa $5$, e chame de $\\theta$ o ângulo agudo oposto ao cateto de $3$. Agora dobre e triplique todos os lados:\n\n| Triângulo | Cateto oposto a $\\theta$ | Hipotenusa | Razão |\n| --- | --- | --- | --- |\n| original | $3$ | $5$ | $\\frac{3}{5} = 0{,}6$ |\n| dobrado | $6$ | $10$ | $\\frac{6}{10} = 0{,}6$ |\n| triplicado | $9$ | $15$ | $\\frac{9}{15} = 0{,}6$ |\n\nOs três triângulos têm o mesmo ângulo $\\theta$ e a mesma razão $0{,}6$. O tamanho mudou, a razão não.",
                    },
                    {
                        type: "text",
                        value: "## Voltando à árvore\n\nAgora o problema da abertura. Ana quer medir uma árvore. Ela se afasta $12$ metros do tronco e mira o topo a partir do nível do chão. Com uma cartolina ela recorta um triângulo retângulo pequeno que tenha exatamente o mesmo ângulo de visada, e mede os catetos do recorte: $3$ cm na vertical e $4$ cm na horizontal.\n\nOs dois triângulos, o de cartolina e o da árvore, têm o ângulo reto e o ângulo de visada em comum, então são semelhantes e a razão vertical sobre horizontal é a mesma nos dois:\n\n$$\\frac{\\text{altura}}{12} = \\frac{3}{4} = 0{,}75$$\n\nLogo a altura é $0{,}75 \\cdot 12 = 9$ metros. Ana mediu a árvore sem sair do chão, e o recorte de cartolina fez o papel de uma tabela trigonométrica.",
                    },
                    {
                        type: "text",
                        value: "## O erro de achar que a razão depende do tamanho\n\nMuita gente, ao ver dois triângulos de tamanhos diferentes, conclui que o maior tem razão maior. O que o triângulo maior tem é **cada lado** maior, e os dois crescem juntos, na mesma proporção. Dobrar o cateto oposto sem dobrar a hipotenusa não produz um triângulo semelhante: produz um triângulo com outro ângulo.\n\nOutro deslize comum é esquecer **de qual ângulo** se está falando. No triângulo de lados $3$, $4$ e $5$ existem dois ângulos agudos. Para um deles a razão cateto oposto sobre hipotenusa vale $\\frac{3}{5} = 0{,}6$, e para o outro vale $\\frac{4}{5} = 0{,}8$. A razão é constante para cada ângulo, e não para o triângulo todo.",
                    },
                    {
                        type: "quote",
                        value: "Dois triângulos retângulos que compartilham um ângulo agudo são semelhantes, e por isso a razão entre dois de seus lados depende só do ângulo, nunca do tamanho. É essa constância que permite medir uma árvore com um recorte de cartolina.",
                    },
                ],
                questions: [
                    {
                        statement: "Dois triângulos retângulos têm, cada um, um ângulo agudo de $35^\\circ$. O que garante que eles são semelhantes?",
                        difficulty: "facil",
                        options: [
                            { text: "Garante apenas se as hipotenusas dos dois tiverem a mesma medida.", isCorrect: false },
                            { text: "Nada garante, porque dois ângulos iguais não bastam para a semelhança.", isCorrect: false },
                            { text: "Garante apenas depois de medir os três lados de cada triângulo.", isCorrect: false },
                            { text: "O caso AA, porque além do ângulo reto eles têm um ângulo agudo igual.", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Num triângulo retângulo, o cateto oposto ao ângulo $\\theta$ mede $3$ e a hipotenusa mede $5$. Em outro triângulo retângulo com o mesmo ângulo $\\theta$, a hipotenusa mede $20$. Quanto mede o cateto oposto a $\\theta$ nesse segundo triângulo?",
                        difficulty: "facil",
                        options: [
                            { text: "$12$", isCorrect: true },
                            { text: "$4$", isCorrect: false },
                            { text: "$10$", isCorrect: false },
                            { text: "$15$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em um triângulo retângulo, a razão entre o cateto oposto a $\\theta$ e o cateto adjacente a $\\theta$ vale $0{,}75$. Triplicando todos os lados desse triângulo, essa razão passa a valer:",
                        difficulty: "medio",
                        options: [
                            { text: "$3$, porque o fator de ampliação vira a razão", isCorrect: false },
                            { text: "$0{,}25$, porque a razão fica dividida por três", isCorrect: false },
                            { text: "$0{,}75$, porque a razão não depende do tamanho", isCorrect: true },
                            { text: "$2{,}25$, porque os dois lados foram triplicados", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Bruno mira o topo de um poste a partir do chão, a $18$ metros da base dele. Para o ângulo de visada de Bruno, a razão entre o cateto oposto e o cateto adjacente vale $0{,}5$. Qual é a altura do poste?",
                        difficulty: "medio",
                        options: [
                            { text: "$18$ metros", isCorrect: false },
                            { text: "$4{,}5$ metros", isCorrect: false },
                            { text: "$36$ metros", isCorrect: false },
                            { text: "$9$ metros", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um triângulo retângulo tem lados $9$, $12$ e $15$. Um segundo triângulo retângulo, semelhante a ele, tem hipotenusa $25$. Qual é o perímetro do segundo triângulo?",
                        difficulty: "dificil",
                        options: [
                            { text: "$36$", isCorrect: false },
                            { text: "$100$", isCorrect: false },
                            { text: "$60$", isCorrect: true },
                            { text: "$66$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Seno, cosseno e tangente de um ângulo agudo",
                blocks: [
                    {
                        type: "text",
                        value: "# Seno, cosseno e tangente de um ângulo agudo\n\nJá sabemos que a razão entre dois lados de um triângulo retângulo depende só do ângulo agudo escolhido. Falta o passo que transforma essa descoberta em ferramenta de cálculo: dar nome às razões e fixar, para cada ângulo, o valor delas.\n\nSão três razões principais, e os nomes vêm da astronomia antiga: **seno**, **cosseno** e **tangente**. Nesta aula elas são definidas, calculadas em um triângulo concreto e ligadas umas às outras.",
                    },
                    {
                        type: "text",
                        value: "## Primeiro escolha o ângulo, depois nomeie os lados\n\nAntes de qualquer conta é preciso escolher **qual** dos dois ângulos agudos vai ser estudado. Chame esse ângulo de $\\theta$. Em relação a ele, os três lados ganham nome:\n\n- **hipotenusa**: o lado oposto ao ângulo reto. É sempre o maior, e não muda de nome nunca.\n- **cateto oposto** a $\\theta$: o cateto que não toca o ângulo $\\theta$, o que fica do outro lado.\n- **cateto adjacente** a $\\theta$: o cateto que forma o ângulo $\\theta$ junto com a hipotenusa.\n\nA hipotenusa é a referência fixa do triângulo. Já oposto e adjacente são papéis, e trocam de lado quando trocamos de ângulo.",
                    },
                    {
                        type: "text",
                        value: "## As três razões\n\nCom os lados nomeados, as definições são estas:\n\n$$\\sin \\theta = \\frac{\\text{cateto oposto}}{\\text{hipotenusa}} \\qquad \\cos \\theta = \\frac{\\text{cateto adjacente}}{\\text{hipotenusa}} \\qquad \\tan \\theta = \\frac{\\text{cateto oposto}}{\\text{cateto adjacente}}$$\n\nEscrevemos $\\sin \\theta$, $\\cos \\theta$ e $\\tan \\theta$, que se leem seno de teta, cosseno de teta e tangente de teta. Como a hipotenusa é maior que qualquer cateto, o seno e o cosseno de um ângulo agudo ficam sempre entre $0$ e $1$. A tangente não tem esse teto: ela compara dois catetos, e passa de $1$ quando o cateto oposto é o maior dos dois.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo com a terna 3-4-5\n\nTome o triângulo retângulo de catetos $3$ e $4$ e hipotenusa $5$, que fecha Pitágoras: $3^2 + 4^2 = 9 + 16 = 25 = 5^2$. Chame de $\\theta$ o ângulo agudo oposto ao cateto de $3$ e de $\\alpha$ o outro ângulo agudo.\n\nPara $\\theta$, o cateto oposto é $3$ e o adjacente é $4$:\n\n$$\\sin \\theta = \\frac{3}{5} = 0{,}6 \\qquad \\cos \\theta = \\frac{4}{5} = 0{,}8 \\qquad \\tan \\theta = \\frac{3}{4} = 0{,}75$$\n\nPara $\\alpha$ os papéis se invertem, porque agora o oposto é $4$ e o adjacente é $3$:\n\n$$\\sin \\alpha = \\frac{4}{5} = 0{,}8 \\qquad \\cos \\alpha = \\frac{3}{5} = 0{,}6 \\qquad \\tan \\alpha = \\frac{4}{3} \\approx 1{,}33$$\n\nRepare que a tangente de $\\alpha$ passou de $1$, e isso é normal: o cateto oposto a $\\alpha$ é maior que o adjacente.",
                    },
                    {
                        type: "text",
                        value: "## O erro clássico: oposto não é um lado fixo\n\nO engano mais comum da trigonometria inicial é tratar cateto oposto como se fosse um lado batizado de uma vez por todas, do tipo o de baixo ou o da esquerda. No triângulo acima, o cateto de $3$ é o oposto a $\\theta$ e o adjacente a $\\alpha$. É o mesmo lado em dois papéis diferentes.\n\nA consequência prática: quem escreve $\\sin \\alpha = \\frac{3}{5}$ não errou a fórmula do seno, errou o ângulo. Antes de montar a razão, aponte o dedo no ângulo escolhido e veja qual cateto toca esse ângulo e qual não toca.",
                    },
                    {
                        type: "text",
                        value: "## O seno de um ângulo é o cosseno do complementar\n\nRepare nos valores do exemplo: $\\sin \\theta = 0{,}6$ e $\\cos \\alpha = 0{,}6$. Não é coincidência. Os dois ângulos agudos de um triângulo retângulo somam $90^\\circ$, isto é, são **complementares**, e vale $\\alpha = 90^\\circ - \\theta$. Como o cateto oposto a um é o adjacente ao outro, temos\n\n$$\\sin \\theta = \\cos(90^\\circ - \\theta) \\qquad \\cos \\theta = \\sin(90^\\circ - \\theta)$$\n\nÉ daí que vem o co de cosseno, de complemento. Por exemplo, $\\sin 37^\\circ = \\cos 53^\\circ$, porque $37^\\circ + 53^\\circ = 90^\\circ$. Saber o seno de um ângulo é saber, de graça, o cosseno do complementar dele.",
                    },
                    {
                        type: "text",
                        value: "## A tangente é o seno dividido pelo cosseno\n\nDivida o seno pelo cosseno do mesmo ângulo e acompanhe o que acontece com a hipotenusa:\n\n$$\\frac{\\sin \\theta}{\\cos \\theta} = \\frac{\\frac{\\text{oposto}}{\\text{hipotenusa}}}{\\frac{\\text{adjacente}}{\\text{hipotenusa}}} = \\frac{\\text{oposto}}{\\text{adjacente}} = \\tan \\theta$$\n\nA hipotenusa aparece nos dois denominadores e se cancela. Sobra a relação\n\n$$\\tan \\theta = \\frac{\\sin \\theta}{\\cos \\theta}$$\n\nConferindo com o exemplo: $\\frac{0{,}6}{0{,}8} = 0{,}75$, exatamente a tangente que calculamos lá atrás. Quem sabe o seno e o cosseno de um ângulo já tem a tangente dele.",
                    },
                    {
                        type: "quote",
                        value: "Escolhido o ângulo agudo, o seno é o cateto oposto sobre a hipotenusa, o cosseno é o adjacente sobre a hipotenusa e a tangente é o oposto sobre o adjacente, igual ao seno dividido pelo cosseno. Oposto e adjacente são papéis, e mudam quando o ângulo muda.",
                    },
                ],
                questions: [
                    {
                        statement: "Num triângulo retângulo de catetos $3$ cm e $4$ cm e hipotenusa $5$ cm, seja $\\theta$ o ângulo agudo oposto ao cateto de $3$ cm. Quanto vale $\\tan \\theta$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{3}{5}$", isCorrect: false },
                            { text: "$\\frac{4}{5}$", isCorrect: false },
                            { text: "$\\frac{4}{3}$", isCorrect: false },
                            { text: "$\\frac{3}{4}$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Num triângulo retângulo de catetos $5$ cm e $12$ cm e hipotenusa $13$ cm, seja $\\alpha$ o ângulo agudo oposto ao cateto de $12$ cm. Quais são os valores de $\\sin \\alpha$ e $\\cos \\alpha$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\sin \\alpha = \\frac{12}{13}$ e $\\cos \\alpha = \\frac{5}{13}$", isCorrect: true },
                            { text: "$\\sin \\alpha = \\frac{12}{13}$ e $\\cos \\alpha = \\frac{5}{12}$", isCorrect: false },
                            { text: "$\\sin \\alpha = \\frac{5}{12}$ e $\\cos \\alpha = \\frac{12}{13}$", isCorrect: false },
                            { text: "$\\sin \\alpha = \\frac{5}{13}$ e $\\cos \\alpha = \\frac{12}{13}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Sabendo que $\\sin 37^\\circ \\approx 0{,}60$, quanto vale $\\cos 53^\\circ$?",
                        difficulty: "medio",
                        options: [
                            { text: "$0{,}40$, porque é o que falta para chegar a $1$", isCorrect: false },
                            { text: "$0{,}80$, porque esse é o cosseno de $37^\\circ$", isCorrect: false },
                            { text: "$0{,}60$, porque os ângulos são complementares", isCorrect: true },
                            { text: "$0{,}75$, porque esse é o valor da tangente", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um ângulo agudo $\\theta$ de um triângulo retângulo tem $\\sin \\theta = 0{,}6$ e $\\cos \\theta = 0{,}8$. Quanto vale $\\tan \\theta$?",
                        difficulty: "medio",
                        options: [
                            { text: "$0{,}75$", isCorrect: true },
                            { text: "$0{,}48$", isCorrect: false },
                            { text: "$1{,}4$", isCorrect: false },
                            { text: "$1{,}33$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num triângulo retângulo, o ângulo agudo $\\theta$ satisfaz $\\tan \\theta = \\frac{3}{4}$ e a hipotenusa mede $20$ cm. Quanto medem os catetos?",
                        difficulty: "dificil",
                        options: [
                            { text: "$6$ cm e $8$ cm", isCorrect: false },
                            { text: "$3$ cm e $4$ cm", isCorrect: false },
                            { text: "$12$ cm e $16$ cm", isCorrect: true },
                            { text: "$12$ cm e $15$ cm", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Os arcos notáveis de 30, 45 e 60 graus",
                blocks: [
                    {
                        type: "text",
                        value: "# Os arcos notáveis de $30^\\circ$, $45^\\circ$ e $60^\\circ$\n\nAs razões do triângulo retângulo só servem na prática se soubermos o valor delas para o ângulo do problema. Para a maioria dos ângulos esse valor vem de tabela ou de calculadora, e é um decimal infinito sem padrão nenhum.\n\nTrês ângulos fogem disso: $30^\\circ$, $45^\\circ$ e $60^\\circ$. Para eles o valor sai de duas figuras que qualquer pessoa desenha, o quadrado e o triângulo equilátero, e sai exato, escrito com raiz. São os **arcos notáveis**, e vale a pena saber os nove valores de cor.",
                    },
                    {
                        type: "text",
                        value: "## O quadrado de lado 1 e o ângulo de 45 graus\n\nDesenhe um quadrado de lado $1$ e trace uma diagonal. Ela corta o quadrado em dois triângulos retângulos iguais, cada um com catetos $1$ e $1$. Como os dois catetos são iguais, os dois ângulos agudos também são, e como somam $90^\\circ$, cada um mede $45^\\circ$.\n\nA diagonal é a hipotenusa, e Pitágoras dá o valor dela:\n\n$$d^2 = 1^2 + 1^2 = 2 \\qquad \\text{logo} \\qquad d = \\sqrt{2}$$\n\nDaí saem as três razões de $45^\\circ$:\n\n$$\\sin 45^\\circ = \\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2} \\qquad \\cos 45^\\circ = \\frac{\\sqrt{2}}{2} \\qquad \\tan 45^\\circ = \\frac{1}{1} = 1$$\n\nSeno e cosseno dão o mesmo valor porque $45^\\circ$ é o seu próprio complementar, e a tangente vale $1$ porque os catetos são iguais. A passagem de $\\frac{1}{\\sqrt{2}}$ para $\\frac{\\sqrt{2}}{2}$ é a racionalização, feita multiplicando numerador e denominador por $\\sqrt{2}$.",
                    },
                    {
                        type: "text",
                        value: "## O equilátero cortado pela altura, e os ângulos de 30 e 60 graus\n\nAgora desenhe um triângulo equilátero de lado $2$, cujos três ângulos medem $60^\\circ$. Trace a altura a partir de um vértice: ela corta o lado de baixo exatamente no meio, em dois pedaços de $1$, e divide o ângulo do topo em dois de $30^\\circ$.\n\nSobra um triângulo retângulo de hipotenusa $2$, cateto menor $1$ e ângulos de $30^\\circ$, $60^\\circ$ e $90^\\circ$. A altura vem de Pitágoras:\n\n$$h^2 = 2^2 - 1^2 = 3 \\qquad \\text{logo} \\qquad h = \\sqrt{3}$$\n\nEm relação ao ângulo de $30^\\circ$, o cateto oposto é $1$ e o adjacente é $\\sqrt{3}$:\n\n$$\\sin 30^\\circ = \\frac{1}{2} \\qquad \\cos 30^\\circ = \\frac{\\sqrt{3}}{2} \\qquad \\tan 30^\\circ = \\frac{1}{\\sqrt{3}} = \\frac{\\sqrt{3}}{3}$$\n\nEm relação ao ângulo de $60^\\circ$ os papéis se invertem, e por isso os valores também:\n\n$$\\sin 60^\\circ = \\frac{\\sqrt{3}}{2} \\qquad \\cos 60^\\circ = \\frac{1}{2} \\qquad \\tan 60^\\circ = \\frac{\\sqrt{3}}{1} = \\sqrt{3}$$",
                    },
                    {
                        type: "text",
                        value: "## A tabela dos nove valores\n\n| Razão | $30^\\circ$ | $45^\\circ$ | $60^\\circ$ |\n| --- | --- | --- | --- |\n| $\\sin$ | $\\frac{1}{2}$ | $\\frac{\\sqrt{2}}{2}$ | $\\frac{\\sqrt{3}}{2}$ |\n| $\\cos$ | $\\frac{\\sqrt{3}}{2}$ | $\\frac{\\sqrt{2}}{2}$ | $\\frac{1}{2}$ |\n| $\\tan$ | $\\frac{\\sqrt{3}}{3}$ | $1$ | $\\sqrt{3}$ |\n\nDuas leituras ajudam a memorizar. A linha do seno cresce da esquerda para a direita e pode ser escrita como $\\frac{\\sqrt{1}}{2}$, $\\frac{\\sqrt{2}}{2}$, $\\frac{\\sqrt{3}}{2}$. E a linha do cosseno é a mesma linha lida de trás para frente, que é a relação do complementar aparecendo na tabela.\n\nEm decimais, só para conferir ordem de grandeza: $\\frac{1}{2} = 0{,}5$, $\\frac{\\sqrt{2}}{2} \\approx 0{,}71$, $\\frac{\\sqrt{3}}{2} \\approx 0{,}87$, $\\frac{\\sqrt{3}}{3} \\approx 0{,}58$ e $\\sqrt{3} \\approx 1{,}73$. Nas contas, prefira sempre a forma exata com raiz, que não acumula erro de arredondamento.",
                    },
                    {
                        type: "text",
                        value: "## Por que o seno de 30 graus é exatamente um meio\n\nNada foi arredondado para chegar a $\\sin 30^\\circ = \\frac{1}{2}$. O cateto oposto ao ângulo de $30^\\circ$ é **metade do lado** do equilátero por construção, porque a altura corta a base no meio, e a hipotenusa é o lado inteiro. A razão é exatamente $\\frac{1}{2}$, qualquer que seja o lado escolhido: com lado $2$ fica $\\frac{1}{2}$, com lado $10$ fica $\\frac{5}{10}$, que é o mesmo número.\n\nEsse é o único dos nove valores que é um racional simples. Os outros carregam raiz justamente porque vêm de Pitágoras, e $\\sqrt{2}$ e $\\sqrt{3}$ são irracionais: $0{,}71$ e $0{,}87$ são aproximações, não os valores.",
                    },
                    {
                        type: "text",
                        value: "## Dobrar o ângulo não dobra o seno\n\nComo $\\sin 30^\\circ = \\frac{1}{2}$, é tentador escrever $\\sin 60^\\circ = 2 \\cdot \\frac{1}{2} = 1$. Está errado, e dá para perceber sem conta nenhuma: seno igual a $1$ significaria cateto oposto do mesmo tamanho da hipotenusa, ou seja, um triângulo achatado, sem o terceiro lado. O valor verdadeiro é $\\sin 60^\\circ = \\frac{\\sqrt{3}}{2} \\approx 0{,}87$, menor que $1$.\n\nO seno **não é proporcional ao ângulo**. De $30^\\circ$ para $45^\\circ$ ele sobe de $0{,}5$ para cerca de $0{,}71$, e de $45^\\circ$ para $60^\\circ$ sobe de $0{,}71$ para cerca de $0{,}87$: o mesmo acréscimo de $15^\\circ$ no ângulo produz ganhos diferentes no seno. Quanto mais o ângulo se aproxima de $90^\\circ$, mais devagar o seno cresce, porque ele está chegando no teto $1$.",
                    },
                    {
                        type: "text",
                        value: "## Um exemplo com a tabela\n\nUm triângulo retângulo tem hipotenusa $10$ cm e um ângulo agudo de $30^\\circ$. Quanto medem os catetos?\n\nO cateto oposto ao ângulo de $30^\\circ$ sai do seno. De $\\sin 30^\\circ = \\frac{\\text{oposto}}{10}$ e $\\sin 30^\\circ = \\frac{1}{2}$ vem\n\n$$\\text{oposto} = 10 \\cdot \\frac{1}{2} = 5 \\text{ cm}$$\n\nO cateto adjacente sai do cosseno:\n\n$$\\text{adjacente} = 10 \\cdot \\cos 30^\\circ = 10 \\cdot \\frac{\\sqrt{3}}{2} = 5\\sqrt{3} \\approx 8{,}66 \\text{ cm}$$\n\nConfere com a figura: a hipotenusa é o maior lado, e o maior cateto é o que está de frente para o maior ângulo agudo, que aqui é o de $60^\\circ$.",
                    },
                    {
                        type: "quote",
                        value: "Do quadrado de lado $1$ sai o ângulo de $45^\\circ$, e do equilátero cortado pela altura saem $30^\\circ$ e $60^\\circ$. Os nove valores que resultam dessas duas figuras são exatos, e dobrar o ângulo não dobra o seno.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o valor exato de $\\sin 60^\\circ$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{\\sqrt{2}}{2}$", isCorrect: false },
                            { text: "$\\frac{\\sqrt{3}}{2}$", isCorrect: true },
                            { text: "$\\frac{1}{2}$", isCorrect: false },
                            { text: "$\\frac{\\sqrt{3}}{3}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor exato de $\\cos 45^\\circ$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{\\sqrt{3}}{2}$", isCorrect: false },
                            { text: "$\\frac{1}{2}$", isCorrect: false },
                            { text: "$\\frac{\\sqrt{3}}{3}$", isCorrect: false },
                            { text: "$\\frac{\\sqrt{2}}{2}$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Por que $\\sin 60^\\circ$ não é igual a $2 \\cdot \\sin 30^\\circ$?",
                        difficulty: "medio",
                        options: [
                            { text: "Porque essa falta de proporção acontece apenas com a tangente, que compara dois catetos.", isCorrect: false },
                            { text: "Porque o seno não é proporcional ao ângulo, e seno $1$ pediria cateto igual à hipotenusa.", isCorrect: true },
                            { text: "Porque $\\sin 30^\\circ$ vale $\\frac{\\sqrt{3}}{2}$, e assim o dobro passaria de $1$, o que o seno não permite.", isCorrect: false },
                            { text: "Porque o seno dobra junto com o ângulo somente no intervalo de $0^\\circ$ até $45^\\circ$.", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num triângulo retângulo, a hipotenusa mede $14$ cm e um dos ângulos agudos mede $30^\\circ$. Quanto mede o cateto adjacente a esse ângulo de $30^\\circ$?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{14\\sqrt{3}}{3}$ cm", isCorrect: false },
                            { text: "$7\\sqrt{3}$ cm", isCorrect: true },
                            { text: "$7\\sqrt{2}$ cm", isCorrect: false },
                            { text: "$7$ cm", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num triângulo retângulo, o ângulo agudo $\\theta$ tem $\\tan \\theta = \\sqrt{3}$ e o cateto adjacente a $\\theta$ mede $5$ cm. Qual é o perímetro desse triângulo?",
                        difficulty: "dificil",
                        options: [
                            { text: "$10 + 5\\sqrt{3}$ cm", isCorrect: false },
                            { text: "$5 + 5\\sqrt{3}$ cm", isCorrect: false },
                            { text: "$15 + 5\\sqrt{3}$ cm", isCorrect: true },
                            { text: "$10 + 10\\sqrt{3}$ cm", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Resolvendo o triângulo retângulo",
                blocks: [
                    {
                        type: "text",
                        value: "# Resolvendo o triângulo retângulo\n\n**Resolver** um triângulo é descobrir as seis medidas dele: os três lados e os três ângulos. No triângulo retângulo o trabalho já começa adiantado, porque um dos ângulos é $90^\\circ$ e os outros dois somam $90^\\circ$, de modo que conhecer um ângulo agudo é conhecer os dois.\n\nCom as três razões, com Pitágoras e com a tabela dos arcos notáveis, dois tipos de informação bastam para resolver qualquer triângulo retângulo: um lado mais um ângulo agudo, ou dois lados. Esta aula trata dos dois casos e de como escolher a razão certa em cada um.",
                    },
                    {
                        type: "text",
                        value: "## Caso 1: um lado e um ângulo agudo\n\nConhecendo um ângulo agudo e um lado, cada um dos outros dois lados sai de uma razão.\n\nExemplo: a hipotenusa mede $20$ cm e um ângulo agudo mede $60^\\circ$. O cateto oposto a esse ângulo vem do seno,\n\n$$\\text{oposto} = 20 \\cdot \\sin 60^\\circ = 20 \\cdot \\frac{\\sqrt{3}}{2} = 10\\sqrt{3} \\approx 17{,}32 \\text{ cm}$$\n\ne o cateto adjacente vem do cosseno,\n\n$$\\text{adjacente} = 20 \\cdot \\cos 60^\\circ = 20 \\cdot \\frac{1}{2} = 10 \\text{ cm}$$\n\nOs ângulos ficam completos sem conta nenhuma: $90^\\circ$, $60^\\circ$ e $30^\\circ$. O triângulo está resolvido.",
                    },
                    {
                        type: "text",
                        value: "## Escolhendo a razão certa\n\nA escolha da razão não é adivinhação: ela responde à pergunta o que eu tenho e o que eu quero.\n\n| Tenho | Quero | Razão |\n| --- | --- | --- |\n| hipotenusa | cateto oposto | $\\sin$ |\n| hipotenusa | cateto adjacente | $\\cos$ |\n| um cateto | o outro cateto | $\\tan$ |\n| um cateto | hipotenusa | $\\sin$ ou $\\cos$ |\n\nQuando o lado procurado está no numerador da razão, multiplicamos; quando está no denominador, dividimos. De $\\sin \\theta = \\frac{\\text{oposto}}{\\text{hipotenusa}}$ tiramos tanto $\\text{oposto} = \\text{hipotenusa} \\cdot \\sin \\theta$ quanto $\\text{hipotenusa} = \\frac{\\text{oposto}}{\\sin \\theta}$.",
                    },
                    {
                        type: "text",
                        value: "## Caso 2: dois lados, e a tabela lida de trás para frente\n\nQuando os dados são dois lados, o caminho se inverte: primeiro calculamos a razão, depois procuramos qual ângulo tem aquele valor.\n\nExemplo: o cateto oposto a $\\theta$ mede $7$ cm e a hipotenusa mede $14$ cm. Então\n\n$$\\sin \\theta = \\frac{7}{14} = \\frac{1}{2}$$\n\ne a pergunta passa a ser: qual é o ângulo agudo cujo seno vale $\\frac{1}{2}$? Pela tabela dos arcos notáveis, $\\theta = 30^\\circ$. O outro ângulo agudo mede $90^\\circ - 30^\\circ = 60^\\circ$.\n\nEssa leitura de trás para frente fecha em valor conhecido quando o problema foi montado com arco notável. Se der $\\sin \\theta = 0{,}4$, por exemplo, o ângulo existe, mas não é nenhum dos nove valores da tabela, e seria preciso uma tabela maior para nomeá-lo.",
                    },
                    {
                        type: "text",
                        value: "## Pitágoras fechando a conta\n\nO terceiro lado não precisa de razão nenhuma: ele sai do teorema de Pitágoras, válido em qualquer triângulo retângulo,\n\n$$a^2 = b^2 + c^2$$\n\nem que $a$ é a hipotenusa e $b$ e $c$ são os catetos. Duas ternas de inteiros aparecem tanto que vale reconhecê-las de imediato: $3$, $4$, $5$ e $5$, $12$, $13$. Os múltiplos delas também fecham, como $6$, $8$, $10$, como $9$, $12$, $15$ e como $10$, $24$, $26$.\n\nExemplo: os catetos medem $5$ cm e $12$ cm. Então $a^2 = 25 + 144 = 169$ e a hipotenusa mede $13$ cm. Para o ângulo $\\theta$ oposto ao cateto de $5$ cm,\n\n$$\\sin \\theta = \\frac{5}{13} \\qquad \\cos \\theta = \\frac{12}{13} \\qquad \\tan \\theta = \\frac{5}{12}$$\n\nCuidado com um erro frequente: a hipotenusa **não** é a soma dos catetos. Aqui ela vale $13$, e não $17$.",
                    },
                    {
                        type: "text",
                        value: "## Conferindo o resultado\n\nTrês conferências rápidas pegam quase todo erro de conta:\n\n- a hipotenusa é o maior lado, sempre. Se um cateto saiu maior que ela, a conta está errada.\n- o maior cateto é o que fica de frente para o maior ângulo agudo. Com $30^\\circ$ e $60^\\circ$, o lado oposto ao de $60^\\circ$ é o maior dos catetos.\n- seno e cosseno de ângulo agudo ficam entre $0$ e $1$. Um seno igual a $1{,}2$ denuncia razão invertida.\n\nVale também recolocar os valores em Pitágoras. No exemplo do caso 1, $10^2 + (10\\sqrt{3})^2 = 100 + 300 = 400 = 20^2$, o que confirma a hipotenusa de $20$ cm.",
                    },
                    {
                        type: "text",
                        value: "## Um triângulo resolvido do começo ao fim\n\nUm triângulo retângulo tem hipotenusa $26$ cm e um cateto de $10$ cm. Vamos achar o resto.\n\nO outro cateto vem de Pitágoras: $26^2 - 10^2 = 676 - 100 = 576$, e $\\sqrt{576} = 24$ cm. Repare que $10$, $24$, $26$ é a terna $5$, $12$, $13$ dobrada.\n\nPara o ângulo $\\theta$ oposto ao cateto de $10$ cm,\n\n$$\\sin \\theta = \\frac{10}{26} = \\frac{5}{13} \\approx 0{,}38 \\qquad \\cos \\theta = \\frac{24}{26} = \\frac{12}{13} \\qquad \\tan \\theta = \\frac{10}{24} = \\frac{5}{12}$$\n\nO valor $\\frac{5}{13}$ não é de arco notável, então esse ângulo não sai da tabela. Mesmo assim os lados estão todos resolvidos, e as conferências fecham: $24$ é menor que $26$, e o seno ficou menor que $1$.",
                    },
                    {
                        type: "quote",
                        value: "Um lado com um ângulo agudo, ou dois lados: qualquer um desses pares resolve o triângulo retângulo. No primeiro caso a razão entrega o lado que falta, no segundo a razão calculada entrega o ângulo, e Pitágoras fecha o terceiro lado.",
                    },
                ],
                questions: [
                    {
                        statement: "Num triângulo retângulo, o cateto adjacente ao ângulo de $60^\\circ$ mede $4$ cm. Quanto mede o cateto oposto a esse ângulo? Use $\\tan 60^\\circ = \\sqrt{3}$.",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{4\\sqrt{3}}{3}$ cm", isCorrect: false },
                            { text: "$4\\sqrt{3}$ cm", isCorrect: true },
                            { text: "$2\\sqrt{3}$ cm", isCorrect: false },
                            { text: "$12$ cm", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num triângulo retângulo, o cateto oposto ao ângulo $\\theta$ mede $9$ cm e a hipotenusa mede $18$ cm. Quanto mede o ângulo $\\theta$?",
                        difficulty: "facil",
                        options: [
                            { text: "não dá para saber sem o outro cateto", isCorrect: false },
                            { text: "$45^\\circ$", isCorrect: false },
                            { text: "$30^\\circ$", isCorrect: true },
                            { text: "$60^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num triângulo retângulo, os catetos medem $9$ cm e $12$ cm. Quanto vale o cosseno do ângulo agudo oposto ao cateto de $9$ cm?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{4}{5}$", isCorrect: true },
                            { text: "$\\frac{3}{5}$", isCorrect: false },
                            { text: "$\\frac{3}{4}$", isCorrect: false },
                            { text: "$\\frac{12}{21}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num triângulo retângulo isósceles, cada cateto mede $7$ cm. Quanto mede a hipotenusa e quanto medem os ângulos agudos?",
                        difficulty: "medio",
                        options: [
                            { text: "$7\\sqrt{3}$ cm, e cada ângulo agudo mede $45^\\circ$", isCorrect: false },
                            { text: "$14$ cm, e cada ângulo agudo mede $45^\\circ$", isCorrect: false },
                            { text: "$7\\sqrt{2}$ cm, e cada ângulo agudo mede $45^\\circ$", isCorrect: true },
                            { text: "$7\\sqrt{2}$ cm, e os ângulos agudos medem $30^\\circ$ e $60^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A hipotenusa de um triângulo retângulo mede $25$ cm e um dos catetos mede $15$ cm. Chame de $\\theta$ o ângulo agudo oposto ao cateto de $15$ cm. Quanto vale $\\sin \\theta$ e quanto mede o outro cateto?",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\sin \\theta = \\frac{3}{4}$ e o outro cateto mede $20$ cm", isCorrect: false },
                            { text: "$\\sin \\theta = \\frac{3}{5}$ e o outro cateto mede $10$ cm", isCorrect: false },
                            { text: "$\\sin \\theta = \\frac{4}{5}$ e o outro cateto mede $20$ cm", isCorrect: false },
                            { text: "$\\sin \\theta = \\frac{3}{5}$ e o outro cateto mede $20$ cm", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Ângulo de elevação, rampa e sombra",
                blocks: [
                    {
                        type: "text",
                        value: "# Ângulo de elevação, rampa e sombra\n\nAs três situações do título são o uso mais antigo e mais comum da trigonometria fora da escola: saber a altura de algo olhando para cima, projetar uma rampa que uma cadeira de rodas consiga subir e estimar a altura de um poste pela sombra que ele faz no chão.\n\nEm todas elas o triângulo é o mesmo: um lado vertical, um lado horizontal e a linha inclinada que liga os dois. O que muda de problema para problema é qual lado é conhecido e qual é a pergunta.",
                    },
                    {
                        type: "text",
                        value: "## Ângulo de elevação e ângulo de depressão\n\nOs dois ângulos são medidos a partir da **horizontal**, e é aí que começa a maioria dos erros.\n\n- **ângulo de elevação**: o ângulo entre a linha horizontal que sai do olho e a linha de visada, quando o objeto está acima de quem olha.\n- **ângulo de depressão**: o mesmo, com o objeto abaixo de quem olha, como o barco visto do alto de um farol.\n\nNos dois casos o lado horizontal é o cateto adjacente ao ângulo, o lado vertical é o cateto oposto e a linha de visada é a hipotenusa.\n\nUm aviso que vale ouro: ângulo medido a partir da **vertical**, de uma parede ou de um mastro, não é ângulo de elevação, e usar um no lugar do outro troca o seno pelo cosseno. Se o enunciado diz que a escada forma $70^\\circ$ com a parede, o ângulo dela com o chão é $90^\\circ - 70^\\circ = 20^\\circ$.",
                    },
                    {
                        type: "text",
                        value: "## A escada apoiada na parede\n\nUma escada de $10$ metros está apoiada numa parede e forma $60^\\circ$ com o chão. A que altura ela toca a parede, e a que distância o pé dela está da parede?\n\nA escada é a hipotenusa. A altura é o cateto oposto ao ângulo de $60^\\circ$ e a distância até a parede é o cateto adjacente:\n\n$$\\text{altura} = 10 \\cdot \\sin 60^\\circ = 10 \\cdot \\frac{\\sqrt{3}}{2} = 5\\sqrt{3} \\approx 8{,}66 \\text{ m}$$\n\n$$\\text{distância} = 10 \\cdot \\cos 60^\\circ = 10 \\cdot \\frac{1}{2} = 5 \\text{ m}$$\n\nFaz sentido: quanto mais em pé a escada, maior a altura alcançada e menor a distância até a parede. Com $30^\\circ$ no lugar de $60^\\circ$ os dois resultados se trocariam, porque $30^\\circ$ e $60^\\circ$ são complementares.",
                    },
                    {
                        type: "text",
                        value: "## A altura do prédio pelo ângulo de elevação\n\nUma pessoa de $1{,}60$ m de altura está a $30$ metros da base de um prédio e vê o topo dele sob ângulo de elevação de $30^\\circ$. Qual é a altura do prédio?\n\nO triângulo útil tem o vértice no olho da pessoa, e não no pé dela. O cateto adjacente é a distância de $30$ m e o cateto oposto é a altura que está **acima do nível dos olhos**:\n\n$$\\text{acima dos olhos} = 30 \\cdot \\tan 30^\\circ = 30 \\cdot \\frac{\\sqrt{3}}{3} = 10\\sqrt{3} \\approx 17{,}32 \\text{ m}$$\n\nA altura do prédio é esse valor somado à altura dos olhos: $17{,}32 + 1{,}60 \\approx 18{,}92$ metros. Esquecer de somar a altura do observador é o erro mais comum nesse tipo de problema. Quando o enunciado diz que a visada é feita do chão, essa soma não existe.",
                    },
                    {
                        type: "text",
                        value: "## Ângulo de depressão: o barco visto do farol\n\nDo alto de um farol de $24$ metros, o faroleiro vê um barco sob ângulo de depressão de $30^\\circ$. Qual é a distância horizontal do barco até o farol?\n\nAgora o lado conhecido é o vertical, os $24$ m, que é o cateto oposto ao ângulo de depressão, e o procurado é o horizontal. A tangente relaciona os dois:\n\n$$\\tan 30^\\circ = \\frac{24}{d} \\qquad \\text{logo} \\qquad d = \\frac{24}{\\tan 30^\\circ} = \\frac{24}{\\frac{\\sqrt{3}}{3}} = \\frac{72}{\\sqrt{3}} = 24\\sqrt{3} \\approx 41{,}57 \\text{ m}$$\n\nRepare que o lado procurado estava no denominador, então foi preciso **dividir**. Quem multiplica por $\\tan 30^\\circ$ em vez de dividir chega a $8\\sqrt{3} \\approx 13{,}86$ m, exatamente um terço do valor correto.",
                    },
                    {
                        type: "text",
                        value: "## A rampa e a inclinação em porcentagem\n\nA placa de estrada que anuncia $10\\%$ não está falando de ângulo, está falando de razão: a estrada sobe $10$ metros na vertical a cada $100$ metros de avanço na horizontal. Isso é a definição da tangente:\n\n$$\\text{inclinação} = \\tan \\theta = \\frac{\\text{subida vertical}}{\\text{avanço horizontal}}$$\n\nEntão $10\\%$ de inclinação significa $\\tan \\theta = 0{,}1$, e não $\\theta = 10^\\circ$. Para passar de porcentagem para razão, divida por $100$; para voltar, multiplique por $100$.\n\nExemplo: uma rampa de acesso sobe $0{,}9$ metro ao longo de $12$ metros de piso. A inclinação dela é\n\n$$\\tan \\theta = \\frac{0{,}9}{12} = 0{,}075 = 7{,}5\\%$$\n\nA norma brasileira de acessibilidade admite cerca de $8{,}33\\%$ nas rampas comuns, que é a razão $\\frac{1}{12}$, então essa rampa está dentro do limite. Para comparar: uma rampa de $45^\\circ$ teria $\\tan 45^\\circ = 1$, isto é, $100\\%$ de inclinação, o que na prática é uma parede.",
                    },
                    {
                        type: "text",
                        value: "## A sombra e a altura\n\nO Sol projeta sombra porque a luz dele chega inclinada. O ângulo de elevação do Sol, a altura do objeto e o comprimento da sombra formam um triângulo retângulo em que\n\n$$\\tan(\\text{elevação do Sol}) = \\frac{\\text{altura}}{\\text{sombra}}$$\n\nExemplo: um poste projeta sombra de $12$ metros no instante em que o Sol está a $30^\\circ$ de elevação. A altura dele é\n\n$$\\text{altura} = 12 \\cdot \\tan 30^\\circ = 12 \\cdot \\frac{\\sqrt{3}}{3} = 4\\sqrt{3} \\approx 6{,}93 \\text{ m}$$\n\nDois fatos úteis. Quando o Sol está a $45^\\circ$, a sombra tem exatamente o tamanho da altura, porque $\\tan 45^\\circ = 1$. E quanto mais baixo o Sol, mais comprida a sombra, porque a tangente diminui junto com o ângulo. Além disso, dois objetos medidos no mesmo instante têm a mesma razão altura sobre sombra, que é a semelhança da primeira aula aparecendo de novo.",
                    },
                    {
                        type: "quote",
                        value: "Elevação e depressão são ângulos medidos a partir da horizontal, e nos dois casos é a tangente que liga o lado vertical ao horizontal. Inclinação em porcentagem é tangente multiplicada por cem, e no instante em que a sombra é medida a razão entre altura e sombra é a mesma para todos os objetos.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma placa indica que certa estrada tem inclinação de $10\\%$. Quanto vale a tangente do ângulo que essa estrada forma com a horizontal?",
                        difficulty: "facil",
                        options: [
                            { text: "$0{,}01$", isCorrect: false },
                            { text: "$0{,}9$", isCorrect: false },
                            { text: "$0{,}1$", isCorrect: true },
                            { text: "$10$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma escada de $8$ metros está apoiada numa parede e forma $60^\\circ$ com o chão. A que altura do chão a escada toca a parede? Use $\\sin 60^\\circ = \\frac{\\sqrt{3}}{2}$.",
                        difficulty: "facil",
                        options: [
                            { text: "$4\\sqrt{3}$ m", isCorrect: true },
                            { text: "$4$ m", isCorrect: false },
                            { text: "$4\\sqrt{2}$ m", isCorrect: false },
                            { text: "$\\frac{8\\sqrt{3}}{3}$ m", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um poste projeta uma sombra de $15$ metros no instante em que o ângulo de elevação do Sol é $30^\\circ$. Qual é a altura do poste? Use $\\tan 30^\\circ = \\frac{\\sqrt{3}}{3}$.",
                        difficulty: "medio",
                        options: [
                            { text: "$15\\sqrt{3}$ m", isCorrect: false },
                            { text: "$\\frac{15\\sqrt{3}}{2}$ m", isCorrect: false },
                            { text: "$7{,}5$ m", isCorrect: false },
                            { text: "$5\\sqrt{3}$ m", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Do alto de um farol de $18$ metros acima do nível do mar, um barco é visto sob ângulo de depressão de $30^\\circ$. Qual é a distância horizontal entre o barco e o farol? Use $\\tan 30^\\circ = \\frac{\\sqrt{3}}{3}$.",
                        difficulty: "medio",
                        options: [
                            { text: "$18$ m", isCorrect: false },
                            { text: "$9$ m", isCorrect: false },
                            { text: "$18\\sqrt{3}$ m", isCorrect: true },
                            { text: "$\\frac{18\\sqrt{3}}{3}$ m", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma rampa de acesso precisa vencer um degrau de $0{,}9$ metro de altura e vai ser construída com $12$ metros de projeção horizontal. Qual é a inclinação dessa rampa em porcentagem, e ela respeita o limite de $8{,}33\\%$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$75\\%$, e a rampa passa do limite", isCorrect: false },
                            { text: "$7{,}5\\%$, e a rampa respeita o limite", isCorrect: true },
                            { text: "$0{,}075\\%$, e a rampa respeita o limite", isCorrect: false },
                            { text: "$13{,}3\\%$, e a rampa passa do limite", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Triângulos quaisquer",
        aulas: [
            {
                titulo: "Quando não existe ângulo reto: cortando pela altura",
                blocks: [
                    {
                        type: "text",
                        value: "# Quando não existe ângulo reto\n\nUm terreno triangular tem dois lados medindo $8$ m e $5$ m, e o canto entre eles abre $60^\\circ$. Quanto de cerca é preciso comprar para o terceiro lado?\n\nOutra pergunta do mesmo tipo: você está em um ponto da margem, vê duas árvores do outro lado do rio e quer saber a distância entre elas. Nos dois casos o triângulo não tem canto reto nenhum.\n\nNo triângulo retângulo a conta seria rápida, porque seno é cateto oposto sobre hipotenusa, cosseno é cateto adjacente sobre hipotenusa, tangente é oposto sobre adjacente, e Pitágoras amarra os três lados. O problema é que essas razões foram definidas dentro de um triângulo retângulo, e aqui não há um. A saída é construir o ângulo reto que falta.",
                    },
                    {
                        type: "text",
                        value: "## A altura corta o triângulo em dois\n\nEscolha um vértice e baixe a **altura** dele sobre o lado oposto: o segmento que sai do vértice e chega perpendicular a esse lado. O ponto onde a altura encontra o lado é o **pé da altura**, que vamos chamar de $H$.\n\nEssa única perpendicular parte o triângulo em **dois triângulos retângulos** que dividem a altura entre si. Dentro de cada metade valem o seno, o cosseno e Pitágoras, e o problema volta a ser o do triângulo retângulo.\n\nA receita é sempre a mesma, em três movimentos: calcular a altura, calcular em que pedaços ela divide o lado em que caiu, e recompor o lado que faltava com Pitágoras.",
                    },
                    {
                        type: "text",
                        value: "## Resolvendo o terreno pela altura\n\nNo triângulo $ABC$ temos $AB = 8$ m, $AC = 5$ m, e o ângulo do vértice $A$, que daqui em diante escrevemos $\\hat{A}$, mede $60^\\circ$. Baixamos a altura de $C$ sobre o lado $AB$, com pé em $H$.\n\nNo triângulo retângulo $AHC$ o ângulo em $A$ mede $60^\\circ$ e a hipotenusa é $AC = 5$, então\n\n$$AH = 5 \\cos 60^\\circ = 5 \\cdot \\frac{1}{2} = 2{,}5 \\qquad CH = 5 \\sin 60^\\circ = 5 \\cdot \\frac{\\sqrt{3}}{2} = \\frac{5\\sqrt{3}}{2}$$\n\nComo o ângulo em $A$ é agudo, $H$ cai entre $A$ e $B$, e sobra $HB = 8 - 2{,}5 = 5{,}5$. O triângulo retângulo $CHB$ agora tem os dois catetos conhecidos, e Pitágoras fecha a conta:\n\n$$BC^2 = CH^2 + HB^2 = \\frac{75}{4} + \\frac{121}{4} = \\frac{196}{4} = 49$$\n\nLogo $BC = 7$ m. Repare que nenhum valor fora dos arcos notáveis foi necessário.",
                    },
                    {
                        type: "text",
                        value: "## Quando o ângulo é obtuso, o pé cai fora\n\nUm ângulo **obtuso** é o que mede mais de $90^\\circ$ e menos de $180^\\circ$. Todo triângulo tem no máximo um ângulo assim, porque a soma dos três é $180^\\circ$ e dois obtusos já passariam desse total.\n\nSe o ângulo em $A$ é obtuso e baixamos a altura de $C$ sobre a reta $AB$, o pé $H$ não cai entre $A$ e $B$: ele cai do outro lado de $A$, no prolongamento do lado. O triângulo retângulo que aparece é $AHC$, e o ângulo dele no vértice $A$ não é o ângulo do triângulo original, é o **suplementar** dele, isto é, $180^\\circ$ menos o ângulo original.\n\nEsquecer que o pé saiu do segmento é o erro mais comum deste assunto. Quem trata $H$ como se estivesse entre $A$ e $B$ subtrai $AH$ de $AB$ quando o certo era somar, e chega a um triângulo que não existe.",
                    },
                    {
                        type: "text",
                        value: "## Seno e cosseno do ângulo suplementar\n\nO triângulo retângulo auxiliar guarda a informação do ângulo obtuso. A altura que ele produz é a mesma de antes, não importa para que lado o pé caiu, mas a projeção sobre a reta aponta para o lado contrário. Daí saem as duas relações que fazem o triângulo obtusângulo fechar:\n\n$$\\sin(180^\\circ - x) = \\sin x \\qquad \\cos(180^\\circ - x) = -\\cos x$$\n\nO seno não sente a troca: $\\sin 150^\\circ = \\sin 30^\\circ = \\frac{1}{2}$ e $\\sin 120^\\circ = \\sin 60^\\circ = \\frac{\\sqrt{3}}{2}$.\n\nO cosseno sente, e troca de sinal: $\\cos 150^\\circ = -\\cos 30^\\circ = -\\frac{\\sqrt{3}}{2}$ e $\\cos 120^\\circ = -\\cos 60^\\circ = -\\frac{1}{2}$.\n\nGuarde a leitura geométrica, que vai valer para o resto do módulo: **cosseno negativo é a assinatura do ângulo obtuso**.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo com ângulo obtuso\n\nAgora $AB = 5$, $AC = 3$ e $\\hat{A} = 120^\\circ$. A altura de $C$ sobre a reta $AB$ tem pé $H$ fora do segmento, e o ângulo $H\\hat{A}C$ mede $180^\\circ - 120^\\circ = 60^\\circ$:\n\n$$AH = 3 \\cos 60^\\circ = 1{,}5 \\qquad CH = 3 \\sin 60^\\circ = \\frac{3\\sqrt{3}}{2}$$\n\nComo $H$ está fora, o cateto horizontal do triângulo $CHB$ é a **soma** $HB = 1{,}5 + 5 = 6{,}5$, e não a diferença. Então\n\n$$BC^2 = \\frac{27}{4} + \\frac{169}{4} = \\frac{196}{4} = 49$$\n\ne $BC = 7$. Quem subtraísse acharia $HB = 3{,}5$ e um terceiro lado de $\\sqrt{19} \\approx 4{,}4$, menor que o lado de $5$. Isso é impossível: com $120^\\circ$ abertos entre os dois lados dados, o lado da frente tem de ser o maior do triângulo.",
                    },
                    {
                        type: "text",
                        value: "## Vale sempre, mas dá trabalho\n\nO método da altura resolve qualquer triângulo, e a sua força é justamente não exigir nada novo: só o triângulo retângulo do módulo anterior. O preço é o tempo. É preciso escolher de qual vértice baixar a altura, decidir se o pé cai dentro ou fora, e refazer a conta inteira em cada problema.\n\nAs próximas aulas empacotam esse trabalho em duas fórmulas que já trazem a altura embutida. Antes de chegar nelas, fixe o quadro dos três casos:\n\n| Ângulo em $A$ | Onde cai o pé $H$ | Cateto horizontal |\n| --- | --- | --- |\n| agudo | entre $A$ e $B$ | $HB = AB - AH$ |\n| reto | sobre o próprio $A$ | Pitágoras direto, sem altura auxiliar |\n| obtuso | fora, no prolongamento | $HB = AB + AH$ |",
                    },
                    {
                        type: "quote",
                        value: "Sem ângulo reto, a altura cria dois: ela corta o triângulo em duas metades retângulas onde seno, cosseno e Pitágoras voltam a valer. Se o ângulo é obtuso, o pé da altura cai fora do lado, e aí entram $\\sin(180^\\circ - x) = \\sin x$, com o seno intacto, e $\\cos(180^\\circ - x) = -\\cos x$, com o cosseno trocando de sinal.",
                    },
                ],
                questions: [
                    {
                        statement: "Usando a relação do ângulo suplementar, quanto vale $\\sin 150^\\circ$?",
                        difficulty: "facil",
                        options: [
                            { text: "$-\\frac{\\sqrt{3}}{2}$", isCorrect: false },
                            { text: "$-\\frac{1}{2}$", isCorrect: false },
                            { text: "$\\frac{1}{2}$", isCorrect: true },
                            { text: "$\\frac{\\sqrt{3}}{2}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Quanto vale $\\cos 120^\\circ$?",
                        difficulty: "facil",
                        options: [
                            { text: "$-\\frac{\\sqrt{3}}{2}$", isCorrect: false },
                            { text: "$\\frac{1}{2}$", isCorrect: false },
                            { text: "$-\\frac{1}{2}$", isCorrect: true },
                            { text: "$\\frac{\\sqrt{3}}{2}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em um triângulo $ABC$, o ângulo em $A$ mede $45^\\circ$ e $AC = 8$ cm. Baixando a altura de $C$ sobre a reta $AB$, com pé em $H$, quanto mede $CH$?",
                        difficulty: "medio",
                        options: [
                            { text: "$4$ cm", isCorrect: false },
                            { text: "$8\\sqrt{2}$ cm", isCorrect: false },
                            { text: "$4\\sqrt{2}$ cm", isCorrect: true },
                            { text: "$4\\sqrt{3}$ cm", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em um triângulo $ABC$ com $\\hat{A} = 120^\\circ$ e $AC = 6$, baixa-se a altura de $C$ sobre a reta $AB$, com pé em $H$. O que se pode afirmar sobre $AH$ e sobre a posição de $H$?",
                        difficulty: "medio",
                        options: [
                            { text: "$AH = 6$, com $H$ entre $A$ e $B$", isCorrect: false },
                            { text: "$AH = 3$, com $H$ fora do segmento $AB$", isCorrect: true },
                            { text: "$AH = 3\\sqrt{3}$, com $H$ fora do segmento $AB$", isCorrect: false },
                            { text: "$AH = 3$, com $H$ entre $A$ e $B$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em um triângulo $ABC$, $\\hat{B} = 45^\\circ$, $\\hat{C} = 30^\\circ$ e a altura baixada de $A$ sobre o lado $BC$ mede $6$ cm. Quanto mede o lado $BC$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$6 + 6\\sqrt{3}$ cm", isCorrect: true },
                            { text: "$12$ cm", isCorrect: false },
                            { text: "$6\\sqrt{3}$ cm", isCorrect: false },
                            { text: "$6 + 2\\sqrt{3}$ cm", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Lei dos senos",
                blocks: [
                    {
                        type: "text",
                        value: "# Lei dos senos\n\nBaixar a altura funciona, mas é demorado, e em todo problema a conta recomeça do zero. Vale a pena fazer esse trabalho uma única vez, na forma geral, e guardar o resultado como fórmula.\n\nAntes disso, um acordo de notação que vale para todo o módulo: os vértices são $A$, $B$ e $C$, e cada lado recebe a letra minúscula do vértice que está na frente dele. Assim $a$ é o lado oposto ao ângulo $\\hat{A}$, $b$ é o oposto a $\\hat{B}$ e $c$ é o oposto a $\\hat{C}$. Lado e ângulo com a mesma letra formam um **par oposto**, e é desse par que esta aula vive.",
                    },
                    {
                        type: "text",
                        value: "## O enunciado\n\nEm qualquer triângulo, cada lado é proporcional ao seno do ângulo oposto a ele, e a razão é a mesma para os três pares:\n\n$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}$$\n\nA fórmula tem três igualdades de uma vez, mas na prática você usa só duas frações por conta, escolhendo a dupla em que apareça uma única incógnita.\n\nUma leitura rápida já sai dela: quanto maior o ângulo, maior o seno dele até $90^\\circ$, e o lado da frente acompanha. Daí a regra de coerência que serve de conferência em todo problema deste módulo: **o maior lado fica em frente ao maior ângulo**.",
                    },
                    {
                        type: "text",
                        value: "## De onde ela vem\n\nA demonstração é a aula anterior escrita com letras. Baixe a altura $h$ do vértice $C$ sobre o lado $AB$. Ela parte o triângulo em dois retângulos e, em cada um, $h$ é o cateto oposto ao ângulo da base:\n\n$$h = b \\sin A \\qquad \\text{e} \\qquad h = a \\sin B$$\n\nComo é a mesma altura, $b \\sin A = a \\sin B$. Dividindo os dois lados por $\\sin A \\sin B$, chega-se a\n\n$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B}$$\n\nRepetindo o processo com a altura baixada de outro vértice, entra a terceira fração. E se um dos ângulos for obtuso, o triângulo auxiliar fica com o suplementar dele, mas $\\sin(180^\\circ - x) = \\sin x$ devolve o mesmo seno, então a fórmula continua valendo sem mudança nenhuma.",
                    },
                    {
                        type: "text",
                        value: "## Quando ela serve: o par completo\n\nPara usar a lei dos senos é preciso ter **um lado e o ângulo oposto a ele**, porque é esse par que fecha uma das frações e dá o valor da razão. Com a razão conhecida, qualquer outro lado ou ângulo sai de uma regra de três.\n\nExemplo: $\\hat{A} = 30^\\circ$, o lado oposto $a = 10$ e $\\hat{B} = 45^\\circ$. Queremos $b$.\n\n$$\\frac{10}{\\sin 30^\\circ} = \\frac{b}{\\sin 45^\\circ} \\quad \\Rightarrow \\quad b = \\frac{10 \\sin 45^\\circ}{\\sin 30^\\circ} = \\frac{10 \\cdot \\frac{\\sqrt{2}}{2}}{\\frac{1}{2}} = 10\\sqrt{2}$$\n\nIsto é, $b = 10\\sqrt{2} \\approx 14{,}1$. Dividir por $\\frac{1}{2}$ é o mesmo que multiplicar por $2$, e é aí que mora o deslize mais frequente: inverter a fração e achar $5\\sqrt{2}$, um valor menor que $a$, quando o ângulo de $45^\\circ$ é maior que o de $30^\\circ$ e o lado da frente dele tinha de ser maior.",
                    },
                    {
                        type: "text",
                        value: "## Os casos ALA e AAL\n\nOs dados de um triângulo costumam ser descritos pela ordem em que lados ($L$) e ângulos ($A$) aparecem ao percorrer a figura. Dois deles caem na lei dos senos:\n\n- **AAL**: dois ângulos e um lado que não está entre eles. O par oposto já vem pronto, e a lei dos senos resolve direto.\n- **ALA**: dois ângulos e o lado entre eles. Aqui o lado conhecido não é oposto a nenhum dos ângulos dados, então primeiro se acha o terceiro ângulo pela soma $180^\\circ$, o que monta o par, e depois se aplica a lei.\n\nExemplo de ALA, em medição: para saber a distância de um ponto $A$ até uma ilha $I$, o topógrafo marca na margem um ponto $B$ com $AB = 24$ m e mede os dois ângulos da base, $I\\hat{A}B = 105^\\circ$ e $I\\hat{B}A = 45^\\circ$.\n\nO terceiro ângulo é $\\hat{I} = 180^\\circ - 105^\\circ - 45^\\circ = 30^\\circ$, e ele é o oposto ao lado conhecido $AB$. O lado $AI$ é o oposto ao ângulo de $45^\\circ$, então\n\n$$AI = \\frac{24 \\sin 45^\\circ}{\\sin 30^\\circ} = 24\\sqrt{2} \\approx 33{,}9 \\text{ m}$$\n\nTudo com arcos notáveis: o ângulo de $105^\\circ$ entrou na soma, mas o seno dele nunca foi preciso.",
                    },
                    {
                        type: "text",
                        value: "## O erro de forçar a lei dos senos\n\nSuponha $b = 7$, $c = 9$ e o ângulo entre esses dois lados medindo $50^\\circ$, ou seja, $\\hat{A} = 50^\\circ$. É tentador escrever a lei dos senos, mas olhe o que acontece com cada fração:\n\n$$\\frac{a}{\\sin 50^\\circ} = \\frac{7}{\\sin B} = \\frac{9}{\\sin C}$$\n\nNa primeira, o lado $a$ é desconhecido. Na segunda e na terceira, os ângulos são desconhecidos. Nenhuma fração está completa, então não existe razão para igualar, e a lei dos senos não tem por onde começar.\n\nO motivo é simples: o ângulo dado não é oposto a nenhum lado dado. Esse é o caso **LAL**, e ele é território da lei dos cossenos, que é o assunto da próxima aula. A regra prática: antes de escrever a lei dos senos, procure um par lado e ângulo oposto. Se ele não existir, a ferramenta é outra.",
                    },
                    {
                        type: "text",
                        value: "## Segundo exemplo e a conferência\n\nEm um triângulo, $\\hat{A} = 120^\\circ$, o lado oposto $a = 6\\sqrt{3}$ e $\\hat{B} = 30^\\circ$. O par $(a, \\hat{A})$ está completo, então é AAL e a lei dos senos resolve:\n\n$$b = \\frac{a \\sin B}{\\sin A} = \\frac{6\\sqrt{3} \\cdot \\frac{1}{2}}{\\frac{\\sqrt{3}}{2}} = \\frac{3\\sqrt{3}}{\\frac{\\sqrt{3}}{2}} = 6$$\n\nNote que $\\sin 120^\\circ = \\sin 60^\\circ = \\frac{\\sqrt{3}}{2}$, pela relação do suplementar.\n\nAgora a conferência: $a = 6\\sqrt{3} \\approx 10{,}4$ está em frente ao maior ângulo, $120^\\circ$, e é o maior lado. O lado $b = 6$ está em frente ao menor ângulo. O terceiro ângulo é $180^\\circ - 120^\\circ - 30^\\circ = 30^\\circ$, igual a $\\hat{B}$, então o triângulo é isósceles e $c$ também vale $6$. Tudo coerente.",
                    },
                    {
                        type: "quote",
                        value: "A lei dos senos diz que $\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}$ em qualquer triângulo, e ela só arranca quando se conhece um lado junto com o ângulo oposto a ele. É a ferramenta dos casos AAL e ALA, e não serve quando o ângulo dado está entre os dois lados conhecidos.",
                    },
                ],
                questions: [
                    {
                        statement: "Em um triângulo, $\\hat{A} = 30^\\circ$, o lado oposto mede $a = 6$ e $\\hat{B} = 45^\\circ$. Quanto mede o lado $b$?",
                        difficulty: "facil",
                        options: [
                            { text: "$3\\sqrt{2}$", isCorrect: false },
                            { text: "$6\\sqrt{3}$", isCorrect: false },
                            { text: "$6$", isCorrect: false },
                            { text: "$6\\sqrt{2}$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Para que a lei dos senos possa ser aplicada, é indispensável conhecer:",
                        difficulty: "facil",
                        options: [
                            { text: "um ângulo reto em algum dos vértices", isCorrect: false },
                            { text: "os três lados do triângulo", isCorrect: false },
                            { text: "dois lados e o ângulo formado entre eles", isCorrect: false },
                            { text: "um lado e o ângulo oposto a esse lado", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Em um triângulo, $\\hat{A} = 120^\\circ$, o lado oposto mede $a = 6\\sqrt{3}$ e $\\hat{B} = 30^\\circ$. Quanto mede o lado $b$?",
                        difficulty: "medio",
                        options: [
                            { text: "$18$", isCorrect: false },
                            { text: "$6\\sqrt{3}$", isCorrect: false },
                            { text: "$6$", isCorrect: true },
                            { text: "$3\\sqrt{3}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Conhecemos $b = 7$, $c = 9$ e o ângulo $\\hat{A} = 50^\\circ$ formado entre esses dois lados. Por que a lei dos senos não resolve esse triângulo de imediato?",
                        difficulty: "medio",
                        options: [
                            { text: "Porque a lei dos senos exige que o triângulo tenha algum ângulo reto para funcionar", isCorrect: false },
                            { text: "Porque $50^\\circ$ não é arco notável e o seno dele não é exato", isCorrect: false },
                            { text: "Porque o lado oposto ao ângulo conhecido é justamente o desconhecido", isCorrect: true },
                            { text: "Porque a lei dos senos vale só quando o ângulo dado é obtuso", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em um triângulo $ABC$, $\\hat{A} = 135^\\circ$, $a = 10$ e $b = 5\\sqrt{2}$. Quanto mede o ângulo $\\hat{B}$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$45^\\circ$", isCorrect: false },
                            { text: "$30^\\circ$", isCorrect: true },
                            { text: "$15^\\circ$", isCorrect: false },
                            { text: "$150^\\circ$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Lei dos cossenos",
                blocks: [
                    {
                        type: "text",
                        value: "# Lei dos cossenos\n\nA aula anterior terminou em um impasse: conhecidos dois lados e o ângulo entre eles, a lei dos senos não arranca, porque nenhum par lado e ângulo oposto está completo. E esse caso, chamado de LAL, é dos mais comuns na prática.\n\nDuas estradas saem da mesma cidade formando $120^\\circ$ entre si. Pela primeira, uma vila fica a $6$ km; pela segunda, outra vila fica a $10$ km. Qual é a distância entre as duas vilas em linha reta?\n\nA fórmula desta aula responde isso em uma linha.",
                    },
                    {
                        type: "text",
                        value: "## O enunciado\n\nEm qualquer triângulo,\n\n$$a^2 = b^2 + c^2 - 2bc \\cos A$$\n\nEm palavras: o quadrado de um lado é a soma dos quadrados dos outros dois, menos o termo $2bc \\cos A$, em que $\\hat{A}$ é o ângulo **entre** esses outros dois lados.\n\nA fórmula tem três versões, uma para cada lado, e o desenho delas é o mesmo. O que muda é qual ângulo entra, e ele é sempre o oposto ao lado que está sozinho do lado esquerdo:\n\n$$b^2 = a^2 + c^2 - 2ac \\cos B \\qquad c^2 = a^2 + b^2 - 2ab \\cos C$$\n\nErrar esse emparelhamento, usando um ângulo que não é o oposto ao lado procurado, é o erro mais caro da aula, porque a conta sai inteira e o resultado parece legítimo.",
                    },
                    {
                        type: "text",
                        value: "## É Pitágoras com um termo de correção\n\nCompare as duas fórmulas lado a lado. Pitágoras diz $a^2 = b^2 + c^2$, e a lei dos cossenos diz a mesma coisa com um desconto: $-2bc \\cos A$.\n\nSe $\\hat{A} = 90^\\circ$, então $\\cos 90^\\circ = 0$, o termo de correção morre e sobra exatamente Pitágoras. Ou seja, Pitágoras é o caso particular em que o ângulo é reto, e a lei dos cossenos é a versão geral.\n\nO termo de correção também diz para que lado a fórmula puxa:\n\n- ângulo agudo, cosseno positivo, o termo é subtraído de verdade e o lado da frente fica **menor** que o de Pitágoras;\n- ângulo obtuso, cosseno negativo, subtrair um número negativo é somar, e o lado da frente fica **maior**.\n\nIsso casa com a intuição: abrir mais o ângulo entre dois lados afasta as pontas.",
                    },
                    {
                        type: "text",
                        value: "## Caso LAL: achar o terceiro lado\n\nVoltando às duas vilas. Os lados conhecidos são $b = 6$ e $c = 10$, com $\\hat{A} = 120^\\circ$ entre eles, e o lado procurado é $a$. Como $\\cos 120^\\circ = -\\frac{1}{2}$,\n\n$$a^2 = 6^2 + 10^2 - 2 \\cdot 6 \\cdot 10 \\cdot \\left(-\\frac{1}{2}\\right) = 36 + 100 + 60 = 196$$\n\nLogo $a = 14$ km.\n\nRepare nos dois sinais. O da fórmula é menos, o do cosseno de um ângulo obtuso é menos, e menos com menos dá mais: o termo entra somando. Quem esquece o sinal do cosseno obtém $136 - 60 = 76$ e um lado de cerca de $8{,}7$ km, menor que a estrada de $10$ km. Impossível, porque o lado oposto ao maior ângulo tem de ser o maior lado.",
                    },
                    {
                        type: "text",
                        value: "## Caso LLL: achar um ângulo\n\nQuando os três lados são conhecidos, a mesma fórmula serve de volta. Isolando o cosseno em $a^2 = b^2 + c^2 - 2bc \\cos A$:\n\n$$\\cos A = \\frac{b^2 + c^2 - a^2}{2bc}$$\n\nExemplo: um triângulo de lados $5$, $7$ e $8$. Qual é o ângulo oposto ao lado $7$? Chamando $a = 7$, $b = 5$ e $c = 8$,\n\n$$\\cos A = \\frac{25 + 64 - 49}{2 \\cdot 5 \\cdot 8} = \\frac{40}{80} = \\frac{1}{2}$$\n\nO arco notável com cosseno $\\frac{1}{2}$ é $60^\\circ$, então $\\hat{A} = 60^\\circ$. Na montagem, o lado que vai sozinho no numerador com sinal negativo é sempre o oposto ao ângulo procurado. Trocar esse lado de lugar troca o ângulo encontrado.",
                    },
                    {
                        type: "text",
                        value: "## O sinal do cosseno classifica o ângulo\n\nO numerador $b^2 + c^2 - a^2$ carrega o sinal, porque $2bc$ é sempre positivo. Então basta comparar $a^2$ com $b^2 + c^2$:\n\n| Comparação | Sinal de $\\cos A$ | O ângulo $\\hat{A}$ é |\n| --- | --- | --- |\n| $a^2 < b^2 + c^2$ | positivo | agudo |\n| $a^2 = b^2 + c^2$ | zero | reto |\n| $a^2 > b^2 + c^2$ | negativo | obtuso |\n\nExemplo: no triângulo de lados $3$, $5$ e $7$, o maior ângulo está em frente ao lado $7$. Como $7^2 = 49$ e $3^2 + 5^2 = 34$, já se sabe que ele é obtuso. A conta confirma:\n\n$$\\cos A = \\frac{9 + 25 - 49}{2 \\cdot 3 \\cdot 5} = \\frac{-15}{30} = -\\frac{1}{2}$$\n\nE $-\\frac{1}{2}$ é o cosseno de $120^\\circ$, pela relação $\\cos(180^\\circ - x) = -\\cos x$ vista na primeira aula. Cosseno negativo nunca é erro de conta: é o aviso de que o ângulo passou de $90^\\circ$.",
                    },
                    {
                        type: "text",
                        value: "## Os três tropeços clássicos\n\n1. **Esquecer o fator $2$** e escrever $-bc \\cos A$. No exemplo das vilas isso daria $136 + 30 = 166$ e um lado de cerca de $12{,}9$ km, em vez de $14$.\n2. **Ignorar o sinal do cosseno obtuso**, que encurta o lado procurado quando ele deveria crescer.\n3. **Usar o ângulo errado**, que não é o oposto ao lado isolado. A fórmula só é verdadeira com o ângulo entre os dois lados que aparecem no produto.\n\nUma conferência rápida fecha a aula, e serve para qualquer resultado deste módulo: ordene os lados e os ângulos. O maior lado tem de estar em frente ao maior ângulo, e cada lado tem de ser menor que a soma dos outros dois.",
                    },
                    {
                        type: "quote",
                        value: "A lei dos cossenos, $a^2 = b^2 + c^2 - 2bc \\cos A$, é Pitágoras mais um termo de correção que mede o quanto o ângulo se afasta de $90^\\circ$. Ela resolve o caso LAL, achando o terceiro lado, e o caso LLL, achando um ângulo, e o sinal do cosseno encontrado diz na hora se esse ângulo é agudo ou obtuso.",
                    },
                ],
                questions: [
                    {
                        statement: "Dois lados de um triângulo medem $8$ e $15$ e formam entre si um ângulo de $60^\\circ$. Quanto mede o terceiro lado?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\sqrt{409}$", isCorrect: false },
                            { text: "$\\sqrt{229}$", isCorrect: false },
                            { text: "$13$", isCorrect: true },
                            { text: "$17$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que se diz que a lei dos cossenos contém o teorema de Pitágoras como caso particular?",
                        difficulty: "facil",
                        options: [
                            { text: "Porque com $\\hat{A} = 90^\\circ$ temos $\\cos A = 0$ e o termo de correção desaparece", isCorrect: true },
                            { text: "Porque com $\\hat{A} = 90^\\circ$ temos $\\cos A = 1$ e o termo de correção dobra de valor", isCorrect: false },
                            { text: "Porque o termo de correção é sempre negativo e por isso pode ser ignorado", isCorrect: false },
                            { text: "Porque a lei dos cossenos só pode ser aplicada em triângulos retângulos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Os lados de um triângulo medem $7$, $8$ e $13$. Quanto mede o maior ângulo desse triângulo?",
                        difficulty: "medio",
                        options: [
                            { text: "$120^\\circ$", isCorrect: true },
                            { text: "$90^\\circ$", isCorrect: false },
                            { text: "$60^\\circ$", isCorrect: false },
                            { text: "$150^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em um triângulo de lados $4$, $6$ e $9$, o maior ângulo é agudo, reto ou obtuso?",
                        difficulty: "medio",
                        options: [
                            { text: "Agudo, porque $4^2 + 6^2 > 9^2$", isCorrect: false },
                            { text: "Reto, porque $4^2 + 6^2 = 9^2$", isCorrect: false },
                            { text: "Agudo, porque $9 < 4 + 6$ e o triângulo existe", isCorrect: false },
                            { text: "Obtuso, porque $4^2 + 6^2 < 9^2$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Em um triângulo, o lado $a = 7$ é oposto ao ângulo $\\hat{A} = 120^\\circ$, e um dos outros lados mede $b = 3$. Quanto mede o lado $c$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$2\\sqrt{10}$", isCorrect: false },
                            { text: "$\\sqrt{58}$", isCorrect: false },
                            { text: "$8$", isCorrect: false },
                            { text: "$5$", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Área do triângulo pelo seno",
                blocks: [
                    {
                        type: "text",
                        value: "# Área do triângulo pelo seno\n\nUm terreno triangular tem dois lados medindo $8$ m e $10$ m, com $30^\\circ$ entre eles. Qual é a área?\n\nA fórmula que todo mundo sabe é base vezes altura dividido por dois. O problema é que a altura não foi dada, e medir altura em terreno é justamente o que ninguém quer fazer: ela não coincide com nenhuma cerca, cai em diagonal no meio do lote e, se o ângulo for obtuso, cai fora dele.\n\nO seno resolve isso, porque ele é exatamente a máquina que transforma um lado em altura.",
                    },
                    {
                        type: "text",
                        value: "## De onde vem a fórmula\n\nTome o triângulo $ABC$ e baixe a altura $h$ do vértice $A$ sobre o lado $a$, que é o lado $BC$. No triângulo retângulo que se forma junto do vértice $C$, $h$ é o cateto oposto ao ângulo $\\hat{C}$ e o lado $b$ é a hipotenusa, então $h = b \\sin C$.\n\nSubstituindo na área de sempre, com base $a$:\n\n$$S = \\frac{a \\cdot h}{2} = \\frac{a \\cdot b \\sin C}{2} = \\frac{1}{2} a b \\sin C$$\n\nEm palavras: **metade do produto de dois lados pelo seno do ângulo entre eles**. Como as três alturas dão a mesma área, valem as três versões, e você escolhe a que combina com os dados:\n\n$$S = \\frac{1}{2} a b \\sin C = \\frac{1}{2} a c \\sin B = \\frac{1}{2} b c \\sin A$$\n\nEm cada uma delas, o ângulo é o que fica **entre** os dois lados do produto. Usar um ângulo que não está entre eles é o erro silencioso desta fórmula.",
                    },
                    {
                        type: "text",
                        value: "## O terreno do começo\n\nCom $a = 8$, $b = 10$ e $\\hat{C} = 30^\\circ$ entre eles:\n\n$$S = \\frac{1}{2} \\cdot 8 \\cdot 10 \\cdot \\sin 30^\\circ = 40 \\cdot \\frac{1}{2} = 20 \\text{ m}^2$$\n\nA altura nunca foi medida, e ainda assim ela está ali: $h = b \\sin C = 10 \\sin 30^\\circ = 5$ m é a altura relativa ao lado de $8$ m, e $\\frac{8 \\cdot 5}{2} = 20$ devolve a mesma área.\n\nEsse é o sentido da fórmula. Ela não é uma regra nova, é a antiga com a altura calculada para você.",
                    },
                    {
                        type: "text",
                        value: "## Com ângulo obtuso funciona igual\n\nAgora um triângulo com lados $12$ e $5$ e um ângulo de $150^\\circ$ entre eles. Pela relação da primeira aula, $\\sin 150^\\circ = \\sin 30^\\circ = \\frac{1}{2}$, então\n\n$$S = \\frac{1}{2} \\cdot 12 \\cdot 5 \\cdot \\frac{1}{2} = 15$$\n\nDuas observações valem ouro aqui. A primeira: se a área fosse calculada pela base e pela altura, seria preciso notar que a altura cai fora do triângulo, e a conta ficaria mais longa. A fórmula do seno não se importa com isso.\n\nA segunda: entre $0^\\circ$ e $180^\\circ$ o seno é sempre positivo, então a área nunca sai negativa. É o cosseno que troca de sinal com o ângulo obtuso, não o seno. Quem aplica aqui a troca de sinal do cosseno acha uma área negativa e deveria desconfiar na hora.",
                    },
                    {
                        type: "text",
                        value: "## Caso LLL: a fórmula de Heron\n\nE se não houver ângulo nenhum, só os três lados? Dá para achar um ângulo pela lei dos cossenos e depois usar o seno, mas existe um caminho direto. Chamando de $s$ o **semiperímetro**, que é metade da soma dos lados,\n\n$$s = \\frac{a + b + c}{2} \\qquad S = \\sqrt{s(s-a)(s-b)(s-c)}$$\n\nExemplo com lados $13$, $14$ e $15$. O perímetro é $42$, então $s = 21$, e\n\n$$S = \\sqrt{21 \\cdot 8 \\cdot 7 \\cdot 6} = \\sqrt{7056} = 84$$\n\nUm teste de confiança: no triângulo de lados $6$, $8$ e $10$, que é retângulo, Heron dá $s = 12$ e $S = \\sqrt{12 \\cdot 6 \\cdot 4 \\cdot 2} = \\sqrt{576} = 24$, o mesmo que $\\frac{6 \\cdot 8}{2}$.\n\nOs dois descuidos comuns são usar o perímetro no lugar do semiperímetro e parar no produto, esquecendo de extrair a raiz.",
                    },
                    {
                        type: "text",
                        value: "## De passagem: a área do paralelogramo\n\nUm paralelogramo é cortado por uma diagonal em dois triângulos iguais. Se os lados dele medem $a$ e $b$ e o ângulo entre eles é $\\theta$, a área é o dobro da do triângulo:\n\n$$S = a b \\sin \\theta$$\n\nA mesma fórmula, sem o $\\frac{1}{2}$. Exemplo: lados $8$ e $6$ com $45^\\circ$ entre eles dão $S = 48 \\cdot \\frac{\\sqrt{2}}{2} = 24\\sqrt{2} \\approx 33{,}9$.\n\nE não faz diferença qual dos dois ângulos do paralelogramo você usar: eles são suplementares, e $\\sin(180^\\circ - x) = \\sin x$ garante o mesmo seno. Trocar $45^\\circ$ por $135^\\circ$ aqui não muda nada.",
                    },
                    {
                        type: "text",
                        value: "## Qual fórmula de área usar\n\n| O que foi dado | Fórmula de área |\n| --- | --- |\n| Base e altura | $S = \\frac{b h}{2}$ |\n| Dois lados e o ângulo entre eles | $S = \\frac{1}{2} a b \\sin C$ |\n| Os três lados | Heron, ou lei dos cossenos e depois o seno |\n| Dois lados de um paralelogramo e o ângulo | $S = a b \\sin \\theta$ |\n\nA fórmula do seno é a que mais aparece, porque dois lados e um ângulo é o conjunto de dados que uma medição em campo produz naturalmente: duas distâncias a partir de um ponto e a abertura entre elas.",
                    },
                    {
                        type: "quote",
                        value: "A área de um triângulo é $S = \\frac{1}{2} a b \\sin C$, metade do produto de dois lados pelo seno do ângulo entre eles, porque $b \\sin C$ já é a altura. Quando só os três lados são conhecidos, Heron resolve com o semiperímetro, e o paralelogramo é a mesma fórmula sem a metade.",
                    },
                ],
                questions: [
                    {
                        statement: "Um triângulo tem dois lados medindo $9$ cm e $4$ cm, com um ângulo de $30^\\circ$ entre eles. Qual é a área, em cm$^2$?",
                        difficulty: "facil",
                        options: [
                            { text: "$9$", isCorrect: true },
                            { text: "$9\\sqrt{3}$", isCorrect: false },
                            { text: "$18$", isCorrect: false },
                            { text: "$36$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Na fórmula $S = \\frac{1}{2} a b \\sin C$, qual é o papel do fator $\\sin C$?",
                        difficulty: "facil",
                        options: [
                            { text: "Corrigir o resultado quando o triângulo é obtusângulo e a altura cai fora dele", isCorrect: false },
                            { text: "Garantir que a área nunca passe do produto $a b$", isCorrect: false },
                            { text: "Transformar o lado $b$ na altura relativa ao lado $a$", isCorrect: true },
                            { text: "Transformar o lado $a$ no perímetro do triângulo", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Os lados de um triângulo medem $9$, $10$ e $17$. Usando a fórmula de Heron, qual é a área?",
                        difficulty: "medio",
                        options: [
                            { text: "$18$", isCorrect: false },
                            { text: "$72$", isCorrect: false },
                            { text: "$36$", isCorrect: true },
                            { text: "$1296$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um paralelogramo tem lados medindo $7$ cm e $10$ cm, e um de seus ângulos mede $150^\\circ$. Qual é a área, em cm$^2$?",
                        difficulty: "medio",
                        options: [
                            { text: "$35$", isCorrect: true },
                            { text: "$70$", isCorrect: false },
                            { text: "$17{,}5$", isCorrect: false },
                            { text: "$35\\sqrt{3}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Dois lados de um triângulo medem $8$ e $10$, e a área vale $20$. Sabendo que o ângulo formado entre esses dois lados é obtuso, quanto ele mede?",
                        difficulty: "dificil",
                        options: [
                            { text: "$150^\\circ$", isCorrect: true },
                            { text: "$60^\\circ$", isCorrect: false },
                            { text: "$120^\\circ$", isCorrect: false },
                            { text: "$30^\\circ$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Escolhendo a lei certa",
                blocks: [
                    {
                        type: "text",
                        value: "# Escolhendo a lei certa\n\nVocê já tem as ferramentas: altura, lei dos senos, lei dos cossenos, área pelo seno e Heron. A dificuldade que sobra não é calcular, é decidir. Diante de um triângulo com três informações, qual delas abre o problema?\n\nA resposta depende só de **como** os dados estão distribuídos, e para falar disso existe um código curto: $L$ para cada lado conhecido e $A$ para cada ângulo conhecido, escritos na ordem em que aparecem ao percorrer o triângulo. Assim LAL quer dizer lado, ângulo, lado, com o ângulo entre os dois lados, e LLA quer dizer dois lados e um ângulo que não está entre eles.",
                    },
                    {
                        type: "text",
                        value: "## A tabela de decisão\n\n| O que foi dado | Caso | Ferramenta que resolve |\n| --- | --- | --- |\n| Os três lados | LLL | Lei dos cossenos para um ângulo, Heron para a área |\n| Dois lados e o ângulo entre eles | LAL | Lei dos cossenos para o terceiro lado, e $\\frac{1}{2} a b \\sin C$ para a área |\n| Dois ângulos e o lado entre eles | ALA | Soma $180^\\circ$ para o terceiro ângulo, depois lei dos senos |\n| Dois ângulos e um lado fora deles | AAL | Lei dos senos direto |\n| Dois lados e um ângulo fora deles | LLA | Lei dos senos, com o cuidado do caso ambíguo |\n| Os três ângulos | AAA | Nenhuma: a forma fica definida, o tamanho não |\n\nA leitura em uma frase: **ângulo entre os lados pede cosseno, ângulo em frente a um lado pede seno**. Os casos LLL e LAL, em que o ângulo conhecido está entre lados conhecidos ou não há ângulo nenhum, são da lei dos cossenos. Os casos ALA, AAL e LLA, em que dá para montar um par lado e ângulo oposto, são da lei dos senos.",
                    },
                    {
                        type: "text",
                        value: "## Por que AAA não resolve\n\nConhecer os três ângulos não determina o triângulo. Dois triângulos com os mesmos três ângulos são **semelhantes**, isto é, têm a mesma forma e podem ter tamanhos diferentes: um triângulo de ângulos $30^\\circ$, $60^\\circ$ e $90^\\circ$ pode ter lados $3$, $3\\sqrt{3}$ e $6$, ou o dobro disso, ou o triplo.\n\nExiste uma infinidade de triângulos AAA, e a lei dos senos confirma: ela só dá razões entre lados, e sem um lado conhecido para fixar a escala, nada tem medida.\n\nÉ por isso que toda lista de casos que resolve um triângulo tem pelo menos um lado. Três informações, das quais pelo menos uma seja um lado, é o mínimo.",
                    },
                    {
                        type: "text",
                        value: "## O caso ambíguo LLA\n\nO LLA é o único caso em que os dados podem combinar com mais de um triângulo, e a razão é geométrica. Fixe o ângulo $\\hat{A} = 30^\\circ$ e o lado $b = 10$ saindo de $A$. A ponta livre de $b$ é o vértice $C$, e dele sai o lado $a$, que precisa alcançar a reta onde fica o lado $AB$. A altura de $C$ até essa reta vale $b \\sin A = 10 \\cdot \\frac{1}{2} = 5$.\n\nAgora varie o comprimento de $a$:\n\n| Valor de $a$ | $\\sin B = \\frac{b \\sin A}{a}$ | Quantos triângulos |\n| --- | --- | --- |\n| $a = 4$, menor que a altura | $1{,}25$, impossível | nenhum |\n| $a = 5$, igual à altura | $1$, logo $\\hat{B} = 90^\\circ$ | um, retângulo |\n| $a = 5\\sqrt{2}$, entre $5$ e $10$ | $\\frac{\\sqrt{2}}{2}$ | dois |\n| $a = 12$, maior que $b$ | $\\frac{5}{12}$ | um |\n\nA conta que decide é sempre a mesma: calcular $\\sin B$ pela lei dos senos e olhar o resultado antes de seguir.",
                    },
                    {
                        type: "text",
                        value: "## Quando existem dois triângulos\n\nPegue a terceira linha da tabela: $\\hat{A} = 30^\\circ$, $a = 5\\sqrt{2}$ e $b = 10$. Pela lei dos senos,\n\n$$\\sin B = \\frac{b \\sin A}{a} = \\frac{10 \\cdot \\frac{1}{2}}{5\\sqrt{2}} = \\frac{5}{5\\sqrt{2}} = \\frac{\\sqrt{2}}{2}$$\n\nDois ângulos entre $0^\\circ$ e $180^\\circ$ têm esse seno, $45^\\circ$ e $135^\\circ$, porque $\\sin(180^\\circ - x) = \\sin x$. E os dois cabem, porque somados a $30^\\circ$ ainda deixam espaço:\n\n- se $\\hat{B} = 45^\\circ$, então $\\hat{C} = 105^\\circ$;\n- se $\\hat{B} = 135^\\circ$, então $\\hat{C} = 15^\\circ$.\n\nSão dois triângulos de verdade, bem diferentes. Usando $\\sin 105^\\circ \\approx 0{,}97$ e $\\sin 15^\\circ \\approx 0{,}26$ na lei dos senos, o terceiro lado vale cerca de $13{,}7$ no primeiro e cerca de $3{,}7$ no segundo.\n\nO erro clássico é parar na primeira solução, a aguda, que é a que a calculadora devolve. No LLA, sempre teste também o suplementar, e aceite os dois se a soma dos ângulos permitir.",
                    },
                    {
                        type: "text",
                        value: "## Quando não existe triângulo nenhum\n\nAgora a primeira linha: $\\hat{A} = 30^\\circ$, $a = 4$ e $b = 10$. A mesma conta dá\n\n$$\\sin B = \\frac{10 \\cdot \\frac{1}{2}}{4} = \\frac{5}{4} = 1{,}25$$\n\nE isso é impossível, porque o seno de qualquer ângulo fica entre $-1$ e $1$. Não houve erro de conta: os dados simplesmente não descrevem um triângulo.\n\nA leitura geométrica é a mais útil: o lado $a$ tem de vencer a distância da ponta de $b$ até a reta de $AB$, que é a altura $b \\sin A = 5$. Com $a = 4$, o lado é curto demais e nunca toca a reta, então a figura não fecha.\n\nSeno maior que $1$ é, portanto, informação, e não motivo para refazer a conta: é a resposta de que o triângulo não existe.",
                    },
                    {
                        type: "text",
                        value: "## Roteiro de decisão\n\n1. Conte o que você tem. Com menos de três informações, ou com três ângulos e nenhum lado, o triângulo não fica determinado.\n2. O ângulo conhecido está entre dois lados conhecidos, ou não há ângulo nenhum? Comece pela lei dos cossenos. Esses são os casos LAL e LLL.\n3. Existe um lado com o ângulo oposto a ele conhecido? A lei dos senos resolve. Nos casos ALA, ache primeiro o terceiro ângulo pela soma $180^\\circ$.\n4. Se o par veio de dois lados e um ângulo fora deles (LLA), calcule $\\sin B$ e pare para contar: maior que $1$ não existe triângulo, igual a $1$ existe um retângulo, e menor que $1$ pode haver dois, se o suplementar também couber na soma.\n5. Para a área, use $\\frac{1}{2} a b \\sin C$ se tiver dois lados e o ângulo entre eles, e Heron se tiver os três lados.\n6. Confira: maior lado em frente ao maior ângulo, soma dos ângulos igual a $180^\\circ$, e cada lado menor que a soma dos outros dois.",
                    },
                    {
                        type: "quote",
                        value: "Ângulo entre os lados pede lei dos cossenos, ângulo em frente a um lado pede lei dos senos, e três ângulos sem nenhum lado não determinam triângulo algum. O único caso que exige contagem é o LLA, em que o seno encontrado pode apontar nenhum triângulo, um, ou dois, dependendo de o suplementar caber na soma dos ângulos.",
                    },
                ],
                questions: [
                    {
                        statement: "Você conhece os três lados de um triângulo e quer descobrir um de seus ângulos. Qual ferramenta resolve?",
                        difficulty: "facil",
                        options: [
                            { text: "A soma dos ângulos internos, que vale $180^\\circ$", isCorrect: false },
                            { text: "A lei dos cossenos, isolando o cosseno do ângulo", isCorrect: true },
                            { text: "A lei dos senos, isolando o seno do ângulo", isCorrect: false },
                            { text: "O teorema de Pitágoras aplicado ao maior lado", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em um triângulo são conhecidos dois ângulos e o lado que fica entre eles, o caso ALA. Qual é o caminho para resolvê-lo?",
                        difficulty: "facil",
                        options: [
                            { text: "Nada a fazer, porque dois ângulos e um lado não determinam o triângulo", isCorrect: false },
                            { text: "Calcular a área primeiro e dela tirar os dois lados que faltam", isCorrect: false },
                            { text: "Aplicar a lei dos cossenos duas vezes, uma para cada um dos lados que faltam", isCorrect: false },
                            { text: "Achar o terceiro ângulo pela soma $180^\\circ$ e aplicar a lei dos senos", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Em um triângulo, $\\hat{A} = 30^\\circ$, $a = 4$ e $b = 10$. Quantos triângulos satisfazem esses dados?",
                        difficulty: "medio",
                        options: [
                            { text: "Um único triângulo é possível", isCorrect: false },
                            { text: "Uma infinidade de triângulos", isCorrect: false },
                            { text: "Nenhum triângulo é possível", isCorrect: true },
                            { text: "Dois triângulos diferentes", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em um triângulo, $\\hat{A} = 30^\\circ$, $a = 5\\sqrt{2}$ e $b = 10$. Quais são os valores possíveis de $\\hat{B}$?",
                        difficulty: "medio",
                        options: [
                            { text: "$45^\\circ$ ou $135^\\circ$", isCorrect: true },
                            { text: "somente $135^\\circ$", isCorrect: false },
                            { text: "$30^\\circ$ ou $150^\\circ$", isCorrect: false },
                            { text: "somente $45^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Os lados de um triângulo medem $5$, $7$ e $8$. Qual é a área desse triângulo?",
                        difficulty: "dificil",
                        options: [
                            { text: "$10\\sqrt{3}$", isCorrect: true },
                            { text: "$20\\sqrt{3}$", isCorrect: false },
                            { text: "$300$", isCorrect: false },
                            { text: "$10$", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Do grau ao radiano e o ciclo trigonométrico",
        aulas: [
            {
                titulo: "Medindo ângulo: grau, minuto e segundo",
                blocks: [
                    {
                        type: "text",
                        value: "# Medindo ângulo: grau, minuto e segundo\n\nUm aplicativo de mapas mostra a posição de um ponto como latitude $23^\\circ 33' 01''$ sul. Um topógrafo lê no teodolito uma visada de $127^\\circ 18' 40''$. Nos dois casos aparece a mesma coisa: um ângulo escrito com três números, e não com um só.\n\nEsta aula explica de onde vêm esses três números, como passar deles para o grau decimal que a calculadora aceita e como voltar. E começa por uma pergunta que quase ninguém faz na escola: por que a volta completa tem $360$ partes, e não $100$?",
                    },
                    {
                        type: "text",
                        value: "## Por que a volta tem $360$ partes\n\nA resposta curta é herança: a divisão vem dos babilônios, que contavam em base $60$ e dividiam o círculo do céu em $360$ partes, perto do número de dias do ano. A resposta longa é conveniência, e é a que importa de verdade.\n\nO número $360$ tem $24$ divisores: $1$, $2$, $3$, $4$, $5$, $6$, $8$, $9$, $10$, $12$, $15$, $18$, $20$, $24$, $30$, $36$, $40$, $45$, $60$, $72$, $90$, $120$, $180$ e $360$. Isso significa que a volta pode ser cortada em metades, terços, quartos, quintos, sextos, oitavos, nonos, décimos e doze avos sem sobrar casa decimal: $\\frac{360}{3} = 120$, $\\frac{360}{8} = 45$, $\\frac{360}{9} = 40$, $\\frac{360}{12} = 30$.\n\nO número $100$ teria só $9$ divisores. Um terço de volta seria $33{,}333\\dots$ unidades, e quase nada ficaria redondo. Foi a facilidade de repartir que fez o $360$ sobreviver por quatro mil anos.",
                    },
                    {
                        type: "text",
                        value: "## O grau subdividido: minuto e segundo\n\nUm grau é grande demais para medida fina, então ele foi repartido do mesmo jeito que a volta: em $60$ partes, e cada parte em outras $60$.\n\n$$1^\\circ = 60' \\qquad 1' = 60'' \\qquad 1^\\circ = 3600''$$\n\nO apóstrofo simples marca o minuto de arco, e o duplo marca o segundo de arco. Os nomes vêm do latim: minuto é a primeira parte miúda do grau, e segundo é a segunda parte miúda. Cuidado para não confundir com minuto e segundo de tempo, que só têm em comum a mesma base $60$.\n\nUm detalhe que dá a escala dessas unidades: $1'$ de latitude na superfície da Terra corresponde, por definição, a uma milha náutica, que são $1852$ metros. O segundo de arco vale, então, cerca de $31$ metros.",
                    },
                    {
                        type: "text",
                        value: "## De grau, minuto e segundo para grau decimal\n\nA conta é uma soma de três parcelas: os graus inteiros, mais os minutos divididos por $60$, mais os segundos divididos por $3600$.\n\n$$d^\\circ \\, m' \\, s'' = d + \\frac{m}{60} + \\frac{s}{3600}$$\n\nExemplo resolvido com $32^\\circ 15' 36''$:\n\n- os minutos dão $\\frac{15}{60} = 0{,}25$;\n- os segundos dão $\\frac{36}{3600} = 0{,}01$;\n- a soma é $32 + 0{,}25 + 0{,}01 = 32{,}26$.\n\nPortanto $32^\\circ 15' 36'' = 32{,}26^\\circ$. Repare que os segundos contribuem pouco, mas contribuem: ignorá-los seria errar na segunda casa decimal.",
                    },
                    {
                        type: "text",
                        value: "## Do grau decimal de volta para grau, minuto e segundo\n\nAqui o caminho é o inverso, e são dois passos iguais: multiplique a parte decimal por $60$, guarde a parte inteira, e repita com o que sobrou.\n\nExemplo resolvido com $32{,}26^\\circ$:\n\n- a parte inteira já é o grau, $32^\\circ$;\n- $0{,}26 \\cdot 60 = 15{,}6$, então $15'$;\n- $0{,}6 \\cdot 60 = 36$, então $36''$.\n\nResultado: $32^\\circ 15' 36''$, exatamente de onde partimos na seção anterior. Ida e volta fechando é a melhor conferência que existe nesse assunto.\n\nO erro mais comum do tema é ler $32^\\circ 15'$ como $32{,}15^\\circ$. Não funciona, porque $15'$ é um quarto de grau, e um quarto vale $0{,}25$. A diferença entre $32{,}15^\\circ$ e $32{,}25^\\circ$ parece desprezível, mas em latitude são mais de $11$ quilômetros de erro.",
                    },
                    {
                        type: "text",
                        value: "## Onde esse formato aparece de verdade\n\nTrês lugares em que ele é o padrão, e não uma curiosidade de livro:\n\n- **Latitude e longitude.** Uma carta náutica ou aeronáutica traz a posição em grau, minuto e segundo. A latitude vai de $0^\\circ$ no equador a $90^\\circ$ nos polos, e a longitude de $0^\\circ$ a $180^\\circ$ para leste e para oeste.\n- **Instrumento de medição.** O teodolito e a estação total do topógrafo leem ângulo até o segundo, e é nessa casa que mora a precisão de uma obra. Um desvio de $1'$ numa visada de $1$ quilômetro desloca o alvo em cerca de $29$ centímetros.\n- **Astronomia.** O diâmetro aparente da Lua vista da Terra mede perto de $31'$, e as posições de estrelas são tabeladas em segundo de arco e frações dele.\n\nPor isso a conversão para grau decimal é tão útil na prática: o instrumento fala em grau, minuto e segundo, e a planilha fala em grau decimal.",
                    },
                    {
                        type: "text",
                        value: "## Somar e subtrair ângulos nesse formato\n\nFunciona como soma de hora: arme as colunas e carregue de $60$ em $60$, não de $10$ em $10$.\n\n**Soma.** $38^\\circ 47' 25'' + 15^\\circ 22' 48''$\n\n- segundos: $25 + 48 = 73$, e $73'' = 1' 13''$, então fica $13''$ e vai $1'$;\n- minutos: $47 + 22 + 1 = 70$, e $70' = 1^\\circ 10'$, então fica $10'$ e vai $1^\\circ$;\n- graus: $38 + 15 + 1 = 54$.\n\nResultado: $54^\\circ 10' 13''$.\n\n**Subtração.** $127^\\circ 18' 40'' - 64^\\circ 35' 55''$\n\n- $40'' - 55''$ não dá, então empresta $1'$, que vale $60''$: $100'' - 55'' = 45''$;\n- sobraram $17'$, e $17' - 35'$ não dá, então empresta $1^\\circ$, que vale $60'$: $77' - 35' = 42'$;\n- sobraram $126^\\circ$, e $126 - 64 = 62$.\n\nResultado: $62^\\circ 42' 45''$. Vale guardar o truque do ângulo redondo: $90^\\circ = 89^\\circ 59' 60''$, e com ele qualquer subtração a partir do ângulo reto sai sem pensar no empréstimo.",
                    },
                    {
                        type: "quote",
                        value: "O grau não é decimal por acidente: ele carrega uma contagem de base $60$, e é por isso que $15'$ valem $0{,}25^\\circ$ e não $0{,}15^\\circ$. Quem guarda $1^\\circ = 60' = 3600''$ converte nos dois sentidos sem decorar fórmula nenhuma.",
                    },
                ],
                questions: [
                    {
                        statement: "Quanto vale $26^\\circ 48'$ em grau decimal?",
                        difficulty: "facil",
                        options: [
                            { text: "$26{,}48^\\circ$", isCorrect: false },
                            { text: "$26{,}08^\\circ$", isCorrect: false },
                            { text: "$74^\\circ$", isCorrect: false },
                            { text: "$26{,}8^\\circ$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Quantos segundos de arco cabem em $1^\\circ$?",
                        difficulty: "facil",
                        options: [
                            { text: "$600$ segundos", isCorrect: false },
                            { text: "$120$ segundos", isCorrect: false },
                            { text: "$21600$ segundos", isCorrect: false },
                            { text: "$3600$ segundos", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Escrevendo $41{,}36^\\circ$ na forma grau, minuto e segundo, obtemos:",
                        difficulty: "medio",
                        options: [
                            { text: "$41^\\circ 3' 6''$", isCorrect: false },
                            { text: "$41^\\circ 21' 6''$", isCorrect: false },
                            { text: "$41^\\circ 21' 36''$", isCorrect: true },
                            { text: "$41^\\circ 36' 21''$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o resultado da soma $38^\\circ 47' 25'' + 15^\\circ 22' 48''$, na forma reduzida, com minuto e segundo menores que $60$?",
                        difficulty: "medio",
                        options: [
                            { text: "$53^\\circ 69' 73''$", isCorrect: false },
                            { text: "$53^\\circ 70' 13''$", isCorrect: false },
                            { text: "$54^\\circ 10' 13''$", isCorrect: true },
                            { text: "$54^\\circ 70' 13''$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um teodolito registra duas visadas a partir da mesma referência, uma de $127^\\circ 18' 40''$ e outra de $64^\\circ 35' 55''$. Qual é o ângulo entre as duas visadas?",
                        difficulty: "dificil",
                        options: [
                            { text: "$63^\\circ 17' 15''$", isCorrect: false },
                            { text: "$62^\\circ 42' 45''$", isCorrect: true },
                            { text: "$62^\\circ 43' 45''$", isCorrect: false },
                            { text: "$62^\\circ 42' 15''$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "O radiano e a conversão nos dois sentidos",
                blocks: [
                    {
                        type: "text",
                        value: "# O radiano e a conversão nos dois sentidos\n\nO grau funciona, mas é uma escolha humana: alguém decidiu cortar a volta em $360$ partes, e podia ter decidido outra coisa. Existe uma unidade de ângulo que não depende de escolha nenhuma, porque sai da própria figura.\n\nImagine uma circunferência e um pedaço de corda do tamanho exato do raio. Deite a corda sobre a circunferência, a partir de um ponto, e olhe o ângulo central que ela abre. Esse ângulo é sempre o mesmo, numa roda de bicicleta ou na órbita de um planeta. Ele é $1$ radiano.",
                    },
                    {
                        type: "text",
                        value: "## A definição honesta: arco sobre raio\n\nO radiano mede o ângulo comparando o arco que ele determina com o raio da circunferência:\n\n$$\\theta = \\frac{s}{r}$$\n\nonde $s$ é o comprimento do arco e $r$ é o raio, medidos na mesma unidade. Um ângulo de $1$ radiano é aquele cujo arco mede exatamente um raio.\n\nExemplo resolvido: numa circunferência de raio $6$ cm, um arco de $15$ cm determina um ângulo central de\n\n$$\\theta = \\frac{15}{6} = 2{,}5 \\text{ radianos}$$\n\nE o resultado não depende do tamanho da figura. Num círculo de raio $2$ m, um arco de $5$ m dá $\\frac{5}{2} = 2{,}5$ radianos também: é o mesmo ângulo, visto em outra escala.",
                    },
                    {
                        type: "text",
                        value: "## Por que a volta vale $2\\pi$ radianos\n\nO comprimento de uma circunferência de raio $r$ é $2\\pi r$. Então o arco de uma volta completa mede $2\\pi r$, e a definição entrega\n\n$$\\theta = \\frac{2\\pi r}{r} = 2\\pi$$\n\nO $r$ cancela e sobra um número puro. A volta completa vale $2\\pi$ radianos, pouco mais de $6{,}28$ raios de arco.\n\nE de onde vem esse $\\pi$? Ele é, por definição, a razão entre o comprimento de uma circunferência e o seu diâmetro, cerca de $3{,}14159$. Não foi inventado para a trigonometria: já estava ali, na figura, antes de qualquer unidade de ângulo existir.\n\nMeia volta é a metade disso, e aí nasce a ponte que resolve toda conversão:\n\n$$180^\\circ = \\pi \\text{ rad}$$\n\nDividindo os dois lados por $\\pi$, sai $1$ rad $= \\frac{180^\\circ}{\\pi} \\approx 57{,}3^\\circ$. É um ângulo bem aberto, maior que o de $45^\\circ$.",
                    },
                    {
                        type: "text",
                        value: "## O radiano é um número puro\n\nNa conta $\\theta = \\frac{s}{r}$ dividimos centímetro por centímetro, ou metro por metro. A unidade cancela, e o que sobra é um número sem unidade.\n\nIsso tem duas consequências práticas. A primeira: escrever \"rad\" é só um lembrete de qual régua está em uso, não uma unidade de verdade como o metro. A segunda: um ângulo em radiano pode aparecer sozinho numa expressão, como $x = \\frac{\\pi}{3}$, e continuar sendo ângulo.\n\nO erro que nasce daí é tratar $\\frac{\\pi}{3}$ como se fosse um comprimento. O arco tem comprimento, dado por $s = r\\theta$; o ângulo não tem. Numa circunferência de raio $3$ cm, o arco do ângulo $\\frac{\\pi}{3}$ mede $3 \\cdot \\frac{\\pi}{3} = \\pi \\approx 3{,}14$ cm. O ângulo é $\\frac{\\pi}{3}$, o comprimento é $\\pi$ cm, e os dois números são diferentes justamente porque são coisas diferentes.",
                    },
                    {
                        type: "text",
                        value: "## A regra de três da conversão\n\nTudo sai de $180^\\circ = \\pi$ rad. Monte a proporção e o resto é aritmética:\n\n$$\\frac{\\text{medida em grau}}{180} = \\frac{\\text{medida em radiano}}{\\pi}$$\n\nNa prática, dois fatores inversos um do outro:\n\n- de grau para radiano, multiplique por $\\frac{\\pi}{180}$;\n- de radiano para grau, multiplique por $\\frac{180}{\\pi}$.\n\n**Exemplo 1, de grau para radiano.** Converter $150^\\circ$:\n\n$$150 \\cdot \\frac{\\pi}{180} = \\frac{150\\pi}{180} = \\frac{5\\pi}{6}$$\n\nA simplificação foi dividir $150$ e $180$ por $30$.\n\n**Exemplo 2, de radiano para grau.** Converter $\\frac{7\\pi}{10}$ radianos:\n\n$$\\frac{7\\pi}{10} \\cdot \\frac{180}{\\pi} = \\frac{7 \\cdot 180}{10} = \\frac{1260}{10} = 126^\\circ$$\n\nO $\\pi$ do numerador cancela com o do denominador, e sobra conta de número inteiro.",
                    },
                    {
                        type: "text",
                        value: "## A tabela dos arcos notáveis\n\nEsta é a tabela que vale fixar. Nenhuma linha dela traz conta nova: cada uma é a regra de três aplicada uma vez.\n\n| Grau | Radiano |\n| --- | --- |\n| $0^\\circ$ | $0$ |\n| $30^\\circ$ | $\\frac{\\pi}{6}$ |\n| $45^\\circ$ | $\\frac{\\pi}{4}$ |\n| $60^\\circ$ | $\\frac{\\pi}{3}$ |\n| $90^\\circ$ | $\\frac{\\pi}{2}$ |\n| $120^\\circ$ | $\\frac{2\\pi}{3}$ |\n| $135^\\circ$ | $\\frac{3\\pi}{4}$ |\n| $150^\\circ$ | $\\frac{5\\pi}{6}$ |\n| $180^\\circ$ | $\\pi$ |\n| $210^\\circ$ | $\\frac{7\\pi}{6}$ |\n| $225^\\circ$ | $\\frac{5\\pi}{4}$ |\n| $240^\\circ$ | $\\frac{4\\pi}{3}$ |\n| $270^\\circ$ | $\\frac{3\\pi}{2}$ |\n| $300^\\circ$ | $\\frac{5\\pi}{3}$ |\n| $315^\\circ$ | $\\frac{7\\pi}{4}$ |\n| $330^\\circ$ | $\\frac{11\\pi}{6}$ |\n| $360^\\circ$ | $2\\pi$ |\n\nUm padrão ajuda a memória: o denominador $6$ aparece nos múltiplos de $30^\\circ$, o denominador $4$ nos múltiplos de $45^\\circ$ e o denominador $3$ nos múltiplos de $60^\\circ$.",
                    },
                    {
                        type: "text",
                        value: "## Dois erros que custam caro\n\n**Tratar $\\pi$ como se fosse $180$ em toda conta.** A igualdade $\\pi$ rad $= 180^\\circ$ diz que duas medidas descrevem o mesmo ângulo em réguas diferentes. Ela não diz que o número $\\pi$ vale $180$, porque $\\pi \\approx 3{,}14$. A troca dá certo por sorte quando o objetivo é justamente converter, como em $\\frac{\\pi}{3}$ virando $\\frac{180^\\circ}{3} = 60^\\circ$, e desanda em qualquer outro lugar: trocar $\\pi$ por $180$ em $2\\pi r$ daria a uma circunferência de raio $1$ o comprimento $360$, quando o valor certo é $2\\pi \\approx 6{,}28$.\n\n**Converter para o lado errado.** Confira a ordem de grandeza antes de entregar a resposta. Ângulo em radiano é número pequeno, porque a volta inteira é só $6{,}28$; ângulo em grau vai até $360$. Se você converteu $60^\\circ$ e apareceu $10800$, multiplicou por $180$ em vez de dividir, e a resposta certa é $\\frac{\\pi}{3} \\approx 1{,}05$.",
                    },
                    {
                        type: "quote",
                        value: "O radiano não é unidade exótica: é o ângulo medido pelo próprio arco, em unidades de raio, e por isso a volta dá $2\\pi$. Com $180^\\circ = \\pi$ rad na memória, converter é multiplicar por $\\frac{\\pi}{180}$ ou por $\\frac{180}{\\pi}$, e a escolha certa se confere pela ordem de grandeza do resultado.",
                    },
                ],
                questions: [
                    {
                        statement: "Convertendo $150^\\circ$ para radiano, obtemos:",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{5\\pi}{6}$ radianos", isCorrect: true },
                            { text: "$\\frac{5\\pi}{3}$ radianos", isCorrect: false },
                            { text: "$\\frac{2\\pi}{3}$ radianos", isCorrect: false },
                            { text: "$\\frac{6\\pi}{5}$ radianos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A quantos graus corresponde $\\frac{3\\pi}{4}$ radianos?",
                        difficulty: "facil",
                        options: [
                            { text: "$240^\\circ$", isCorrect: false },
                            { text: "$540^\\circ$", isCorrect: false },
                            { text: "$135^\\circ$", isCorrect: true },
                            { text: "$45^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa circunferência de raio $6$ cm, um arco mede $15$ cm. Qual é a medida, em radianos, do ângulo central que determina esse arco?",
                        difficulty: "medio",
                        options: [
                            { text: "$1{,}25$ radianos", isCorrect: false },
                            { text: "$2{,}5$ radianos", isCorrect: true },
                            { text: "$5$ radianos", isCorrect: false },
                            { text: "$0{,}4$ radianos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um arco mede $\\frac{7\\pi}{10}$ radianos. Qual é a sua medida em grau?",
                        difficulty: "medio",
                        options: [
                            { text: "$1260^\\circ$", isCorrect: false },
                            { text: "$126^\\circ$", isCorrect: true },
                            { text: "$252^\\circ$", isCorrect: false },
                            { text: "$63^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um ângulo mede $\\frac{2\\pi}{9}$ radianos e outro mede $32^\\circ$. Qual é a medida da soma dos dois, expressa em radianos?",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\frac{5\\pi}{27}$ radianos", isCorrect: false },
                            { text: "$\\frac{2\\pi}{5}$ radianos", isCorrect: true },
                            { text: "$\\frac{2\\pi}{41}$ radianos", isCorrect: false },
                            { text: "$\\frac{8\\pi}{45}$ radianos", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "O ciclo trigonométrico: arco, quadrante e sentido",
                blocks: [
                    {
                        type: "text",
                        value: "# O ciclo trigonométrico: arco, quadrante e sentido\n\nNo triângulo retângulo o ângulo estudado é sempre agudo, entre $0^\\circ$ e $90^\\circ$, porque fora dessa faixa o triângulo não fecha. Mas a roda-gigante gira $400^\\circ$, o parafuso volta $-90^\\circ$ e o ponteiro do relógio passa por todo ângulo imaginável.\n\nPara que todo ângulo caiba em algum lugar, a trigonometria mudou de palco: saiu do triângulo e foi para uma circunferência desenhada no plano cartesiano. Esse palco é o ciclo trigonométrico, e é dentro dele que acontece o resto do assunto.",
                    },
                    {
                        type: "text",
                        value: "## A circunferência de raio $1$\n\nO ciclo trigonométrico é a circunferência de raio $1$ com centro na origem do plano cartesiano. O raio $1$ não é capricho: ele simplifica duas coisas de uma vez.\n\nA primeira é o comprimento do arco. Pela definição do radiano, $s = r\\theta$; com $r = 1$, o arco e o ângulo passam a ser o mesmo número. Um ângulo central de $\\frac{\\pi}{4}$ determina um arco de comprimento $\\frac{\\pi}{4}$, sem fator de correção nenhum.\n\nA segunda é o tamanho do próprio ciclo: ele mede $2\\pi \\cdot 1 = 2\\pi$ de comprimento, e qualquer ponto dele está a distância $1$ do centro. Essa distância constante vai render bastante mais adiante.",
                    },
                    {
                        type: "text",
                        value: "## A origem dos arcos e o sentido do giro\n\nTodo arco do ciclo começa no mesmo lugar: o ponto $A = (1, 0)$, onde a circunferência cruza o eixo horizontal à direita. Ele é a origem dos arcos, o marco zero.\n\nDa origem sai-se para um dos dois lados, e o sinal do arco diz qual:\n\n- **sentido positivo é o anti-horário**, o que sobe primeiro, em direção ao ponto $(0, 1)$;\n- **sentido negativo é o horário**, o que desce primeiro, em direção ao ponto $(0, -1)$.\n\nAssim, o arco de $90^\\circ$ termina em $(0, 1)$, e o arco de $-90^\\circ$ termina em $(0, -1)$. São arcos do mesmo tamanho com extremidades opostas, e o que os separa é só o sinal.\n\nA convenção parece arbitrária, mas é a mesma do plano cartesiano: girar do eixo $x$ positivo para o eixo $y$ positivo é o giro positivo.",
                    },
                    {
                        type: "text",
                        value: "## Os quatro quadrantes\n\nOs dois eixos cortam o ciclo em quatro pedaços iguais, cada um com um quarto de volta, ou seja $90^\\circ$, que em radiano é $\\frac{\\pi}{2}$.\n\n| Quadrante | Em grau | Em radiano | Sinais do ponto |\n| --- | --- | --- | --- |\n| Primeiro | de $0^\\circ$ a $90^\\circ$ | de $0$ a $\\frac{\\pi}{2}$ | abscissa $+$, ordenada $+$ |\n| Segundo | de $90^\\circ$ a $180^\\circ$ | de $\\frac{\\pi}{2}$ a $\\pi$ | abscissa $-$, ordenada $+$ |\n| Terceiro | de $180^\\circ$ a $270^\\circ$ | de $\\pi$ a $\\frac{3\\pi}{2}$ | abscissa $-$, ordenada $-$ |\n| Quarto | de $270^\\circ$ a $360^\\circ$ | de $\\frac{3\\pi}{2}$ a $2\\pi$ | abscissa $+$, ordenada $-$ |\n\nOs arcos que caem exatamente sobre um eixo, como $0^\\circ$, $90^\\circ$, $180^\\circ$, $270^\\circ$ e $360^\\circ$, não pertencem a quadrante nenhum: eles são a fronteira entre dois quadrantes vizinhos.",
                    },
                    {
                        type: "text",
                        value: "## Localizar um arco dado\n\nEm grau é comparação direta. O arco de $205^\\circ$ está entre $180^\\circ$ e $270^\\circ$, logo termina no terceiro quadrante.\n\nEm radiano há dois caminhos. O primeiro é converter: $\\frac{5\\pi}{6} = \\frac{5 \\cdot 180}{6} = 150^\\circ$, que está entre $90^\\circ$ e $180^\\circ$, no segundo quadrante.\n\nO segundo caminho dispensa a conversão e fica mais rápido com prática: escreva as fronteiras com o mesmo denominador do arco. Para denominador $6$, as fronteiras são $\\frac{\\pi}{2} = \\frac{3\\pi}{6}$, depois $\\pi = \\frac{6\\pi}{6}$ e depois $\\frac{3\\pi}{2} = \\frac{9\\pi}{6}$. Como $\\frac{3\\pi}{6} < \\frac{5\\pi}{6} < \\frac{6\\pi}{6}$, o arco está no segundo quadrante. Com denominador igual, basta comparar numeradores.",
                    },
                    {
                        type: "text",
                        value: "## Arco negativo\n\nArco negativo não é arco inexistente: é arco percorrido no sentido horário. Para localizar a extremidade, o caminho mais seguro é somar uma volta completa, o que não muda o ponto de chegada.\n\nExemplo resolvido com $-130^\\circ$. Somando uma volta, $-130^\\circ + 360^\\circ = 230^\\circ$, e $230^\\circ$ está entre $180^\\circ$ e $270^\\circ$: terceiro quadrante. Dá no mesmo acompanhar o giro passo a passo. Descendo $90^\\circ$ chega-se ao ponto $(0, -1)$, e os $40^\\circ$ restantes avançam para dentro do terceiro quadrante.\n\nDois erros aparecem sempre aqui. O primeiro é ignorar o sinal e responder segundo quadrante, porque $130^\\circ$ está no segundo. O segundo é supor que todo arco negativo cai no quarto quadrante, o que só vale para os arcos entre $-90^\\circ$ e $0^\\circ$.",
                    },
                    {
                        type: "text",
                        value: "## Arco e ângulo central são a mesma informação\n\nDizer \"arco de $60^\\circ$\" e dizer \"ângulo central de $60^\\circ$\" é dizer a mesma coisa. O ângulo com vértice no centro, formado pelo raio que vai até a origem dos arcos e pelo raio que vai até a extremidade, tem exatamente a medida do arco que ele recorta. Por isso os dois nomes se alternam nos enunciados sem aviso, e nenhuma informação se perde no caminho.\n\nHá uma diferença que vale notar. O ângulo desenhado na figura nunca passa de uma volta: no papel, $30^\\circ$ e $390^\\circ$ têm o mesmo desenho. O arco, por outro lado, guarda o trajeto, e $390^\\circ$ significa uma volta inteira mais $30^\\circ$. É essa diferença entre o trajeto percorrido e o ponto de chegada que o estudo dos arcos côngruos vai organizar.",
                    },
                    {
                        type: "quote",
                        value: "O ciclo trigonométrico é a circunferência de raio $1$ centrada na origem, com os arcos começando em $(1, 0)$, positivos no sentido anti-horário e negativos no horário. Localizar um arco é descobrir entre quais fronteiras ele cai, e o sinal faz parte do enunciado, nunca um detalhe a ignorar.",
                    },
                ],
                questions: [
                    {
                        statement: "Em qual quadrante do ciclo trigonométrico termina o arco de $\\frac{5\\pi}{6}$ radianos?",
                        difficulty: "facil",
                        options: [
                            { text: "No segundo quadrante", isCorrect: true },
                            { text: "No primeiro quadrante", isCorrect: false },
                            { text: "No quarto quadrante", isCorrect: false },
                            { text: "No terceiro quadrante", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No ciclo trigonométrico, qual ponto é a origem dos arcos?",
                        difficulty: "facil",
                        options: [
                            { text: "O ponto $(0, 1)$", isCorrect: false },
                            { text: "O ponto $(0, 0)$", isCorrect: false },
                            { text: "O ponto $(1, 0)$", isCorrect: true },
                            { text: "O ponto $(-1, 0)$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em qual quadrante do ciclo termina o arco de $-130^\\circ$?",
                        difficulty: "medio",
                        options: [
                            { text: "Primeiro quadrante", isCorrect: false },
                            { text: "Quarto quadrante", isCorrect: false },
                            { text: "Segundo quadrante", isCorrect: false },
                            { text: "Terceiro quadrante", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual intervalo, em radianos, descreve os arcos do terceiro quadrante?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{\\pi}{2} < x < \\pi$", isCorrect: false },
                            { text: "$\\frac{\\pi}{2} < x < \\frac{3\\pi}{2}$", isCorrect: false },
                            { text: "$\\pi < x < \\frac{3\\pi}{2}$", isCorrect: true },
                            { text: "$\\frac{3\\pi}{2} < x < 2\\pi$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um ponto parte da origem dos arcos e percorre o ciclo trigonométrico descrevendo um arco de $-290^\\circ$. Onde ele para, e qual é o arco positivo de mesma extremidade?",
                        difficulty: "dificil",
                        options: [
                            { text: "No segundo quadrante, arco de $110^\\circ$", isCorrect: false },
                            { text: "No quarto quadrante, arco de $70^\\circ$", isCorrect: false },
                            { text: "No primeiro quadrante, arco de $70^\\circ$", isCorrect: true },
                            { text: "No quarto quadrante, arco de $290^\\circ$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Arcos côngruos, voltas completas e redução ao primeiro quadrante",
                blocks: [
                    {
                        type: "text",
                        value: "# Arcos côngruos, voltas completas e redução ao primeiro quadrante\n\nUma roda-gigante gira e para depois de descrever um arco de $1110^\\circ$. A cadeira parou em algum lugar que se consegue apontar no desenho, e esse lugar é um dos pontos do ciclo, entre $0^\\circ$ e $360^\\circ$.\n\nDuas perguntas nascem daí: qual é o ponto de chegada, e quantas voltas inteiras foram dadas antes dele? E depois vem uma terceira, que é a mais útil de todas: dado um arco de qualquer quadrante, qual é o arco do primeiro quadrante que carrega os mesmos valores?",
                    },
                    {
                        type: "text",
                        value: "## Arcos côngruos\n\nDois arcos são **côngruos** quando têm a mesma origem e a mesma extremidade, diferindo apenas por um número inteiro de voltas completas. Como a volta vale $360^\\circ$, a família de todos os arcos côngruos a um arco $\\alpha$ se escreve assim:\n\n$$\\alpha + k \\cdot 360^\\circ, \\quad k \\in \\mathbb{Z}$$\n\nEm radiano, com a volta valendo $2\\pi$:\n\n$$\\alpha + 2k\\pi, \\quad k \\in \\mathbb{Z}$$\n\nO $k$ é um inteiro qualquer: positivo para somar voltas, negativo para tirar, zero para ficar onde está. Com $\\alpha = 30^\\circ$, a família inclui $30^\\circ$ (com $k = 0$), $390^\\circ$ (com $k = 1$), $750^\\circ$ (com $k = 2$) e $-330^\\circ$ (com $k = -1$). Os quatro terminam no mesmo ponto do ciclo.\n\nRepare que esquecer o $k$ muda tudo: $30^\\circ + 360^\\circ$ é um arco só, e $30^\\circ + k \\cdot 360^\\circ$ são infinitos arcos.",
                    },
                    {
                        type: "text",
                        value: "## A primeira determinação positiva\n\nEntre os infinitos arcos côngruos, exatamente um fica de $0^\\circ$ (incluído) a $360^\\circ$ (excluído). Ele é a **primeira determinação positiva**, o representante da família. Achá-lo é dividir por $360$ e ficar com o resto.\n\nExemplo resolvido com os $1110^\\circ$ da roda-gigante:\n\n- $1110 \\div 360$ dá quociente $3$, porque $3 \\cdot 360 = 1080$ e $4 \\cdot 360 = 1440$ já passa;\n- o resto é $1110 - 1080 = 30$.\n\nOu seja, $1110^\\circ = 3 \\cdot 360^\\circ + 30^\\circ$. A cadeira deu **três voltas completas** e parou no mesmo ponto do arco de $30^\\circ$, e a primeira determinação positiva é $30^\\circ$.\n\nParar cedo é o erro comum aqui. Quem tira só duas voltas chega a $1110^\\circ - 720^\\circ = 390^\\circ$, que é côngruo ao arco original mas não é a primeira determinação, porque ainda passa de $360^\\circ$.",
                    },
                    {
                        type: "text",
                        value: "## Arco negativo: somar voltas até ficar positivo\n\nCom arco negativo o processo é o mesmo, só que somando voltas em vez de tirando.\n\nExemplo resolvido com $-1000^\\circ$:\n\n- $-1000 + 360 = -640$, ainda negativo;\n- $-640 + 360 = -280$, ainda negativo;\n- $-280 + 360 = 80$, e aí para.\n\nForam três voltas somadas, e a primeira determinação positiva é $80^\\circ$, no primeiro quadrante. O atalho é dividir o módulo: $1000 \\div 360$ deixa resto $280$, então $-1000^\\circ$ é côngruo a $-280^\\circ$, e $360^\\circ - 280^\\circ = 80^\\circ$.\n\nDois erros aparecem com frequência. Um é parar em $-280^\\circ$, que é côngruo mas não é positivo. O outro é ignorar o sinal e responder $280^\\circ$, que é um ponto do terceiro quadrante, bem longe dos $80^\\circ$ do primeiro.",
                    },
                    {
                        type: "text",
                        value: "## Em radiano, a volta é $2\\pi$\n\nTudo se repete com $2\\pi$ no lugar de $360^\\circ$. O truque é escrever a volta com o mesmo denominador do arco, e aí a conta vira subtração de numeradores.\n\nExemplo resolvido com $\\frac{37\\pi}{6}$ radianos. A volta é $2\\pi = \\frac{12\\pi}{6}$, então:\n\n- $\\frac{37\\pi}{6} - \\frac{12\\pi}{6} = \\frac{25\\pi}{6}$, ainda maior que uma volta;\n- $\\frac{25\\pi}{6} - \\frac{12\\pi}{6} = \\frac{13\\pi}{6}$, ainda maior;\n- $\\frac{13\\pi}{6} - \\frac{12\\pi}{6} = \\frac{\\pi}{6}$, e agora sim.\n\nTrês voltas completas, e primeira determinação $\\frac{\\pi}{6}$. Dá no mesmo dividir direto: $37 \\div 12$ dá quociente $3$ e resto $1$, logo $\\frac{37\\pi}{6} = 3 \\cdot 2\\pi + \\frac{\\pi}{6}$.\n\nA conferência em grau fecha: $\\frac{37\\pi}{6} = \\frac{37 \\cdot 180}{6} = 1110^\\circ$, o mesmo arco da roda-gigante, e $\\frac{\\pi}{6} = 30^\\circ$. O erro de contar cada $\\pi$ como uma volta levaria a seis voltas, e volta é $2\\pi$, não $\\pi$.",
                    },
                    {
                        type: "text",
                        value: "## Redução ao primeiro quadrante\n\nOs valores que se decoram em trigonometria são os de $30^\\circ$, $45^\\circ$ e $60^\\circ$, todos do primeiro quadrante. Reduzir ao primeiro quadrante é escrever um arco qualquer em função de um arco $a$ do primeiro, para reaproveitar esses valores.\n\n| Quadrante do arco $x$ | Forma em grau | Forma em radiano | Como achar $a$ |\n| --- | --- | --- | --- |\n| Segundo | $x = 180^\\circ - a$ | $x = \\pi - a$ | $a = 180^\\circ - x$ |\n| Terceiro | $x = 180^\\circ + a$ | $x = \\pi + a$ | $a = x - 180^\\circ$ |\n| Quarto | $x = 360^\\circ - a$ | $x = 2\\pi - a$ | $a = 360^\\circ - x$ |\n\nTrês exemplos com o mesmo $a = 30^\\circ$, um por quadrante:\n\n- $150^\\circ = 180^\\circ - 30^\\circ$, no segundo quadrante;\n- $210^\\circ = 180^\\circ + 30^\\circ$, no terceiro quadrante;\n- $330^\\circ = 360^\\circ - 30^\\circ$, no quarto quadrante.\n\nE um exemplo com conta: $214^\\circ$ está entre $180^\\circ$ e $270^\\circ$, logo é do terceiro quadrante, e $a = 214^\\circ - 180^\\circ = 34^\\circ$.",
                    },
                    {
                        type: "text",
                        value: "## Os dois tropeços da redução\n\n**Reduzir sem olhar o quadrante.** Aplicar $a = 180^\\circ - x$ num arco do terceiro quadrante dá $180^\\circ - 214^\\circ = -34^\\circ$. Nenhum arco do primeiro quadrante é negativo, e o sinal de menos é justamente o aviso de que a relação escolhida foi a errada. A ordem correta é identificar o quadrante primeiro e escolher a linha da tabela depois.\n\n**Reduzir antes de achar a primeira determinação.** Não existe redução direta de $1110^\\circ$, porque esse arco nem cabe numa volta. A sequência é: primeira determinação, depois quadrante, depois redução. Para $1110^\\circ$, a primeira determinação é $30^\\circ$, que já está no primeiro quadrante, e portanto não há nada a reduzir. Para $740^\\circ$, a primeira determinação é $740^\\circ - 720^\\circ = 20^\\circ$, também do primeiro quadrante.",
                    },
                    {
                        type: "quote",
                        value: "Arcos côngruos diferem por voltas inteiras, e a família toda cabe em $\\alpha + k \\cdot 360^\\circ$. Achar a primeira determinação positiva é tirar ou somar voltas até cair entre $0^\\circ$ e $360^\\circ$, e só depois disso faz sentido reduzir ao primeiro quadrante.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a primeira determinação positiva do arco de $1110^\\circ$?",
                        difficulty: "facil",
                        options: [
                            { text: "$110^\\circ$", isCorrect: false },
                            { text: "$330^\\circ$", isCorrect: false },
                            { text: "$30^\\circ$", isCorrect: true },
                            { text: "$390^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um arco tem primeira determinação positiva igual a $47^\\circ$. Qual expressão representa todos os arcos côngruos a ele, com $k \\in \\mathbb{Z}$?",
                        difficulty: "facil",
                        options: [
                            { text: "$k \\cdot 360^\\circ - 47^\\circ$", isCorrect: false },
                            { text: "$47^\\circ + k \\cdot 180^\\circ$", isCorrect: false },
                            { text: "$47^\\circ + k \\cdot 360^\\circ$", isCorrect: true },
                            { text: "$47^\\circ + 360^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a primeira determinação positiva do arco de $-1000^\\circ$?",
                        difficulty: "medio",
                        options: [
                            { text: "$80^\\circ$", isCorrect: true },
                            { text: "$260^\\circ$", isCorrect: false },
                            { text: "$280^\\circ$", isCorrect: false },
                            { text: "$440^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O arco de $214^\\circ$ está no terceiro quadrante. Escrevendo-o na forma $180^\\circ + a$, qual é o valor de $a$?",
                        difficulty: "medio",
                        options: [
                            { text: "$a = 34^\\circ$", isCorrect: true },
                            { text: "$a = -34^\\circ$", isCorrect: false },
                            { text: "$a = 56^\\circ$", isCorrect: false },
                            { text: "$a = 146^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Considere o arco de $\\frac{37\\pi}{6}$ radianos. Qual é a sua primeira determinação positiva, e quantas voltas completas ele descreve?",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\frac{\\pi}{6}$ e $6$ voltas", isCorrect: false },
                            { text: "$\\frac{25\\pi}{6}$ e $1$ volta", isCorrect: false },
                            { text: "$\\frac{\\pi}{6}$ e $3$ voltas", isCorrect: true },
                            { text: "$\\frac{13\\pi}{6}$ e $2$ voltas", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Seno, cosseno e tangente no ciclo",
                blocks: [
                    {
                        type: "text",
                        value: "# Seno, cosseno e tangente no ciclo\n\nNo triângulo retângulo, seno e cosseno eram razões entre lados, e o ângulo tinha que ser agudo para o triângulo existir. Em $180^\\circ$ não há triângulo nenhum, e ainda assim faz sentido perguntar quanto vale $\\cos 180^\\circ$.\n\nA saída é parar de olhar lados e começar a olhar coordenadas. No ciclo trigonométrico, seno e cosseno deixam de ser razões entre medidas e passam a ser as duas coordenadas de um ponto, o que funciona para qualquer arco, de qualquer tamanho, positivo ou negativo.",
                    },
                    {
                        type: "text",
                        value: "## Cosseno é a abscissa, seno é a ordenada\n\nSeja $P$ a extremidade do arco $x$ no ciclo trigonométrico. Então\n\n$$P = (\\cos x, \\; \\sin x)$$\n\nO cosseno é a primeira coordenada, a abscissa, lida no eixo horizontal. O seno é a segunda, a ordenada, lida no eixo vertical.\n\nIsso não briga com a definição do triângulo retângulo, é a mesma coisa vista de outro ângulo. Com $P$ no primeiro quadrante, baixe a perpendicular de $P$ até o eixo horizontal: aparece um triângulo retângulo cuja hipotenusa é o raio, que vale $1$. O cateto adjacente ao arco é a abscissa, e $\\cos x = \\frac{\\text{adjacente}}{1}$ é a própria abscissa. O cateto oposto é a ordenada, e $\\sin x = \\frac{\\text{oposto}}{1}$ é a própria ordenada. O ciclo apenas estendeu a definição para onde o triângulo não alcançava.\n\nPara não trocar os dois, vale a frase: o seno sobe, o cosseno deita.",
                    },
                    {
                        type: "text",
                        value: "## Por que o seno e o cosseno moram entre $-1$ e $1$\n\nO ponto $P$ está sobre uma circunferência de raio $1$ centrada na origem. Nenhum ponto dessa circunferência tem abscissa ou ordenada maior que $1$, nem menor que $-1$, porque o próprio raio é $1$. Daí sai, direto da figura:\n\n$$-1 \\le \\sin x \\le 1 \\qquad -1 \\le \\cos x \\le 1$$\n\nOs extremos acontecem de verdade, nos pontos em que o ciclo encosta nos eixos: $\\sin 90^\\circ = 1$, $\\cos 180^\\circ = -1$ e $\\sin 270^\\circ = -1$.\n\nIsso entrega um teste de sanidade de graça. Qualquer conta que termine em $\\sin x = 1{,}4$ ou em $\\cos x = -2$ está errada, sem exceção, e nem é preciso revisar a conta para saber disso.",
                    },
                    {
                        type: "text",
                        value: "## A tangente e o eixo das tangentes\n\nTrace a reta vertical que passa pela origem dos arcos, o ponto $(1, 0)$. Ela toca o ciclo num ponto só, e por isso é chamada de eixo das tangentes.\n\nPara achar $\\tan x$, prolongue a reta que passa pelo centro e pela extremidade $P$ até encontrar esse eixo. A ordenada do ponto de encontro é a tangente do arco. Isso equivale à razão\n\n$$\\tan x = \\frac{\\sin x}{\\cos x}$$\n\nExemplo resolvido: para $x = 45^\\circ$, a extremidade é $P = \\left( \\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{2}}{2} \\right)$, e a razão dá $\\tan 45^\\circ = \\frac{\\sqrt{2}/2}{\\sqrt{2}/2} = 1$. No desenho, o ponto de encontro no eixo das tangentes é $(1, 1)$, de ordenada $1$, exatamente o mesmo valor.\n\nDuas diferenças em relação ao seno e ao cosseno. A tangente não fica presa entre $-1$ e $1$: quanto mais o arco se aproxima de $90^\\circ$, mais alto sobe o ponto de encontro, sem limite. E há arcos em que ela simplesmente não existe.",
                    },
                    {
                        type: "text",
                        value: "## O sinal de cada uma por quadrante\n\nO sinal não precisa ser decorado, ele se lê na figura. O seno acompanha a coordenada vertical e é positivo acima do eixo horizontal; o cosseno acompanha a horizontal e é positivo à direita do eixo vertical; a tangente é o quociente dos dois, e é positiva onde eles têm o mesmo sinal.\n\n| Quadrante | $\\sin x$ | $\\cos x$ | $\\tan x$ |\n| --- | --- | --- | --- |\n| Primeiro | $+$ | $+$ | $+$ |\n| Segundo | $+$ | $-$ | $-$ |\n| Terceiro | $-$ | $-$ | $+$ |\n| Quarto | $-$ | $+$ | $-$ |\n\nA linha do terceiro quadrante é a que mais pega gente. Lá o seno e o cosseno são os dois negativos, e por isso a tangente é **positiva**: menos dividido por menos dá mais.",
                    },
                    {
                        type: "text",
                        value: "## Os arcos que caem sobre os eixos\n\nNesses arcos a extremidade é um ponto com uma coordenada nula, e os valores saem de simplesmente olhar o ponto:\n\n| Arco | Extremidade | $\\sin$ | $\\cos$ | $\\tan$ |\n| --- | --- | --- | --- | --- |\n| $0^\\circ$ | $(1, 0)$ | $0$ | $1$ | $0$ |\n| $90^\\circ$ | $(0, 1)$ | $1$ | $0$ | não existe |\n| $180^\\circ$ | $(-1, 0)$ | $0$ | $-1$ | $0$ |\n| $270^\\circ$ | $(0, -1)$ | $-1$ | $0$ | não existe |\n| $360^\\circ$ | $(1, 0)$ | $0$ | $1$ | $0$ |\n\nA tangente não existe em $90^\\circ$ nem em $270^\\circ$ porque nesses arcos $\\cos x = 0$, e a razão $\\frac{\\sin x}{\\cos x}$ pediria uma divisão por zero. Na figura dá na mesma: a reta que passa pelo centro e pela extremidade fica vertical, paralela ao eixo das tangentes, e duas paralelas distintas não se encontram.\n\nO erro comum é responder que $\\tan 90^\\circ$ vale $0$, trocando com $\\cos 90^\\circ$, ou dizer que vale infinito como se infinito fosse um número. O correto é dizer que não existe.",
                    },
                    {
                        type: "text",
                        value: "## Os arcos notáveis nos quatro quadrantes\n\nAqui a redução ao primeiro quadrante trabalha para nós. O valor absoluto se repete de quadrante em quadrante, e só o sinal muda, de acordo com a tabela da seção anterior.\n\n| Arco | Radiano | $\\sin$ | $\\cos$ | $\\tan$ |\n| --- | --- | --- | --- | --- |\n| $30^\\circ$ | $\\frac{\\pi}{6}$ | $\\frac{1}{2}$ | $\\frac{\\sqrt{3}}{2}$ | $\\frac{\\sqrt{3}}{3}$ |\n| $45^\\circ$ | $\\frac{\\pi}{4}$ | $\\frac{\\sqrt{2}}{2}$ | $\\frac{\\sqrt{2}}{2}$ | $1$ |\n| $60^\\circ$ | $\\frac{\\pi}{3}$ | $\\frac{\\sqrt{3}}{2}$ | $\\frac{1}{2}$ | $\\sqrt{3}$ |\n| $120^\\circ$ | $\\frac{2\\pi}{3}$ | $\\frac{\\sqrt{3}}{2}$ | $-\\frac{1}{2}$ | $-\\sqrt{3}$ |\n| $135^\\circ$ | $\\frac{3\\pi}{4}$ | $\\frac{\\sqrt{2}}{2}$ | $-\\frac{\\sqrt{2}}{2}$ | $-1$ |\n| $150^\\circ$ | $\\frac{5\\pi}{6}$ | $\\frac{1}{2}$ | $-\\frac{\\sqrt{3}}{2}$ | $-\\frac{\\sqrt{3}}{3}$ |\n| $210^\\circ$ | $\\frac{7\\pi}{6}$ | $-\\frac{1}{2}$ | $-\\frac{\\sqrt{3}}{2}$ | $\\frac{\\sqrt{3}}{3}$ |\n| $225^\\circ$ | $\\frac{5\\pi}{4}$ | $-\\frac{\\sqrt{2}}{2}$ | $-\\frac{\\sqrt{2}}{2}$ | $1$ |\n| $240^\\circ$ | $\\frac{4\\pi}{3}$ | $-\\frac{\\sqrt{3}}{2}$ | $-\\frac{1}{2}$ | $\\sqrt{3}$ |\n| $300^\\circ$ | $\\frac{5\\pi}{3}$ | $-\\frac{\\sqrt{3}}{2}$ | $\\frac{1}{2}$ | $-\\sqrt{3}$ |\n| $315^\\circ$ | $\\frac{7\\pi}{4}$ | $-\\frac{\\sqrt{2}}{2}$ | $\\frac{\\sqrt{2}}{2}$ | $-1$ |\n| $330^\\circ$ | $\\frac{11\\pi}{6}$ | $-\\frac{1}{2}$ | $\\frac{\\sqrt{3}}{2}$ | $-\\frac{\\sqrt{3}}{3}$ |\n\nExemplo resolvido de como obter uma linha sem consultar a tabela. Quanto vale $\\cos 240^\\circ$? O arco está entre $180^\\circ$ e $270^\\circ$, no terceiro quadrante, e $240^\\circ = 180^\\circ + 60^\\circ$, então $a = 60^\\circ$. O cosseno de $60^\\circ$ vale $\\frac{1}{2}$, e no terceiro quadrante o cosseno é negativo. Logo $\\cos 240^\\circ = -\\frac{1}{2}$.",
                    },
                    {
                        type: "quote",
                        value: "No ciclo, a extremidade do arco $x$ é o ponto $(\\cos x, \\sin x)$: cosseno na horizontal, seno na vertical, os dois presos entre $-1$ e $1$. A tangente é o quociente dos dois, positiva no primeiro e no terceiro quadrante, e inexistente em $90^\\circ$ e $270^\\circ$, onde o cosseno zera.",
                    },
                ],
                questions: [
                    {
                        statement: "No ciclo trigonométrico, o cosseno de um arco corresponde a qual elemento do ponto que é a extremidade desse arco?",
                        difficulty: "facil",
                        options: [
                            { text: "À ordenada do ponto", isCorrect: false },
                            { text: "À distância ao centro", isCorrect: false },
                            { text: "Ao comprimento do arco", isCorrect: false },
                            { text: "À abscissa do ponto", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Por que $\\tan 90^\\circ$ não existe?",
                        difficulty: "facil",
                        options: [
                            { text: "Porque $\\sin 90^\\circ = 0$ e a razão fica nula", isCorrect: false },
                            { text: "Porque $\\cos 90^\\circ = 0$ e não se divide por zero", isCorrect: true },
                            { text: "Porque a tangente só existe no primeiro quadrante", isCorrect: false },
                            { text: "Porque $90^\\circ$ fica fora do ciclo trigonométrico", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um arco termina no terceiro quadrante do ciclo trigonométrico. Quais são os sinais do seu seno, do seu cosseno e da sua tangente, nessa ordem?",
                        difficulty: "medio",
                        options: [
                            { text: "Negativo, negativo e positivo", isCorrect: true },
                            { text: "Negativo, negativo e negativo", isCorrect: false },
                            { text: "Positivo, negativo e negativo", isCorrect: false },
                            { text: "Negativo, positivo e negativo", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\sin 150^\\circ + \\cos 240^\\circ + \\tan 225^\\circ$?",
                        difficulty: "medio",
                        options: [
                            { text: "$0$", isCorrect: false },
                            { text: "$1$", isCorrect: true },
                            { text: "$2$", isCorrect: false },
                            { text: "$-1$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Entre os arcos de $\\frac{2\\pi}{3}$, $\\frac{7\\pi}{6}$, $\\frac{5\\pi}{4}$ e $\\frac{5\\pi}{3}$ radianos, em qual deles o seno e a tangente têm o mesmo sinal?",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\frac{2\\pi}{3}$ radianos", isCorrect: false },
                            { text: "$\\frac{7\\pi}{6}$ radianos", isCorrect: false },
                            { text: "$\\frac{5\\pi}{4}$ radianos", isCorrect: false },
                            { text: "$\\frac{5\\pi}{3}$ radianos", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - As funções trigonométricas",
        aulas: [
            {
                titulo: "A função seno: domínio, imagem, período e a senoide",
                blocks: [
                    {
                        type: "text",
                        value: "# A função seno\n\nNo ciclo trigonométrico você marcava um arco e lia a ordenada do ponto correspondente. A pergunta era sempre pontual: quanto vale o seno de $\\frac{\\pi}{6}$? Agora a pergunta muda de natureza: o que acontece com o seno quando o arco cresce sem parar?\n\nA resposta é uma função. A cada número real $x$ corresponde um único valor $\\sin x$, e essa correspondência tem domínio, imagem, gráfico e comportamento próprios.\n\nDaqui para a frente $x$ é número real medido em radianos, que é a unidade natural da função. O radiano é o que permite tratar o arco como número puro: dá sentido a $\\sin 2$, a $\\sin(x + 3)$ e a somar o arco com qualquer outra quantidade, sem carregar o símbolo de grau. Se em algum exemplo aparecer grau, o enunciado avisa.",
                    },
                    {
                        type: "text",
                        value: "## Domínio e imagem\n\nO domínio de $f(x) = \\sin x$ é o conjunto de todos os reais:\n\n$$D(f) = \\mathbb{R}$$\n\nNão existe número real proibido. Qualquer $x$ corresponde a um ponto do ciclo, mesmo que para chegar nele seja preciso dar várias voltas, ou girar no sentido negativo.\n\nA imagem é o intervalo fechado de $-1$ a $1$:\n\n$$\\text{Im}(f) = [-1, 1]$$\n\nO motivo é geométrico. O valor $\\sin x$ é a ordenada de um ponto da circunferência de raio $1$, e nenhum ponto dessa circunferência tem ordenada maior que $1$ nem menor que $-1$. Guarde isso: é a defesa contra uma conta que termina em $\\sin x = 1{,}4$, resultado que denuncia erro antes de qualquer conferência.",
                    },
                    {
                        type: "text",
                        value: "## A tabela que dá para plotar de cabeça\n\nEstes são os valores do seno nos arcos notáveis de uma volta completa. A coluna aproximada serve para você imaginar a altura de cada ponto, não para substituir a forma exata.\n\n| $x$ | $\\sin x$ | aproximado |\n| --- | --- | --- |\n| $0$ | $0$ | $0$ |\n| $\\frac{\\pi}{6}$ | $\\frac{1}{2}$ | $0{,}50$ |\n| $\\frac{\\pi}{3}$ | $\\frac{\\sqrt{3}}{2}$ | $0{,}87$ |\n| $\\frac{\\pi}{2}$ | $1$ | $1{,}00$ |\n| $\\frac{2\\pi}{3}$ | $\\frac{\\sqrt{3}}{2}$ | $0{,}87$ |\n| $\\frac{5\\pi}{6}$ | $\\frac{1}{2}$ | $0{,}50$ |\n| $\\pi$ | $0$ | $0$ |\n| $\\frac{7\\pi}{6}$ | $-\\frac{1}{2}$ | $-0{,}50$ |\n| $\\frac{4\\pi}{3}$ | $-\\frac{\\sqrt{3}}{2}$ | $-0{,}87$ |\n| $\\frac{3\\pi}{2}$ | $-1$ | $-1{,}00$ |\n| $\\frac{5\\pi}{3}$ | $-\\frac{\\sqrt{3}}{2}$ | $-0{,}87$ |\n| $\\frac{11\\pi}{6}$ | $-\\frac{1}{2}$ | $-0{,}50$ |\n| $2\\pi$ | $0$ | $0$ |\n\nMarque esses treze pontos num par de eixos e ligue com uma curva suave: está desenhado um ciclo da senoide.",
                    },
                    {
                        type: "text",
                        value: "## A senoide descrita em palavras\n\nImagine o gráfico sendo traçado da esquerda para a direita, a partir da origem.\n\n- Em $x = 0$ a curva passa pela altura $0$.\n- Ela sobe, cada vez mais devagar, até o topo $1$ em $x = \\frac{\\pi}{2}$.\n- Desce de volta ao $0$ em $x = \\pi$, continua descendo e atinge o fundo $-1$ em $x = \\frac{3\\pi}{2}$.\n- Sobe de novo e volta à altura $0$ em $x = 2\\pi$.\n\nNesse ponto o desenho está completo e passa a se repetir: o trecho de $2\\pi$ a $4\\pi$ é cópia exata do trecho de $0$ a $2\\pi$, e o mesmo vale para a esquerda, com $x$ negativo. Esse comprimento de repetição é o período:\n\n$$\\sin(x + 2\\pi) = \\sin x$$\n\nA curva é suave, sem bico e sem salto, e vive inteira na faixa horizontal entre as alturas $-1$ e $1$, tocando a borda apenas nos picos e nos vales.",
                    },
                    {
                        type: "text",
                        value: "## Zeros, máximo e mínimo\n\nCom $k$ representando um número inteiro qualquer (positivo, negativo ou zero):\n\n- Zeros: $\\sin x = 0$ em $x = k\\pi$, ou seja, em $\\dots, -\\pi, 0, \\pi, 2\\pi, 3\\pi, \\dots$ Os zeros estão espaçados de $\\pi$, e não de $2\\pi$, porque a curva corta a altura zero duas vezes por ciclo, uma subindo e outra descendo.\n- Máximo: o valor $1$ aparece em $x = \\frac{\\pi}{2} + 2k\\pi$, isto é, em $\\frac{\\pi}{2}$, em $\\frac{5\\pi}{2}$, em $-\\frac{3\\pi}{2}$ e assim por diante.\n- Mínimo: o valor $-1$ aparece em $x = \\frac{3\\pi}{2} + 2k\\pi$.\n\nRepare na diferença: os zeros se repetem a cada $\\pi$, mas máximo e mínimo se repetem a cada $2\\pi$, porque cada ciclo tem um único pico e um único vale.",
                    },
                    {
                        type: "text",
                        value: "## Onde cresce e onde decresce\n\nDentro de um ciclo, de $0$ a $2\\pi$:\n\n- cresce em $\\left[0, \\frac{\\pi}{2}\\right]$ e em $\\left[\\frac{3\\pi}{2}, 2\\pi\\right]$;\n- decresce em $\\left[\\frac{\\pi}{2}, \\frac{3\\pi}{2}\\right]$.\n\nNa forma geral, o seno é crescente em cada intervalo $\\left[-\\frac{\\pi}{2} + 2k\\pi, \\frac{\\pi}{2} + 2k\\pi\\right]$ e decrescente em cada intervalo $\\left[\\frac{\\pi}{2} + 2k\\pi, \\frac{3\\pi}{2} + 2k\\pi\\right]$.\n\nCuidado com um intervalo como $[0, \\pi]$: ali o seno não é crescente nem decrescente, porque sobe até $\\frac{\\pi}{2}$ e depois desce. Muita gente responde que ele cresce de $0$ a $\\pi$ por associar o $\\pi$ ao fim da metade de cima do ciclo, mas o pico está no meio desse intervalo.",
                    },
                    {
                        type: "text",
                        value: "## Uma função ímpar\n\nTrocar $x$ por $-x$ é refletir o ponto do ciclo em relação ao eixo horizontal: a abscissa fica igual e a ordenada troca de sinal. Como o seno é a ordenada:\n\n$$\\sin(-x) = -\\sin x$$\n\nFunção com essa propriedade se chama ímpar, e o gráfico dela é simétrico em relação à origem. Por exemplo:\n\n$$\\sin\\left(-\\frac{\\pi}{6}\\right) = -\\sin\\left(\\frac{\\pi}{6}\\right) = -\\frac{1}{2}$$\n\ne, do mesmo modo, $\\sin\\left(-\\frac{\\pi}{2}\\right) = -1$. Vale o aviso: ímpar aqui não tem nada a ver com número ímpar, é só o nome dado a esse tipo de simetria.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nQuanto vale $\\sin\\left(\\frac{9\\pi}{2}\\right)$?\n\nO arco passa de uma volta, então primeiro procuramos um arco côngruo dentro de $[0, 2\\pi]$ descontando voltas completas:\n\n$$\\frac{9\\pi}{2} - 4\\pi = \\frac{9\\pi}{2} - \\frac{8\\pi}{2} = \\frac{\\pi}{2}$$\n\nComo o período é $2\\pi$ e descontamos duas voltas inteiras, o seno não mudou:\n\n$$\\sin\\left(\\frac{9\\pi}{2}\\right) = \\sin\\left(\\frac{\\pi}{2}\\right) = 1$$\n\nAgora um arco negativo: $\\sin\\left(-\\frac{7\\pi}{6}\\right)$. Somando uma volta, $-\\frac{7\\pi}{6} + 2\\pi = \\frac{5\\pi}{6}$, e $\\sin\\left(\\frac{5\\pi}{6}\\right) = \\frac{1}{2}$.\n\nO erro mais comum desta aula é achar que a função seno só existe de $0$ a $2\\pi$. O período se repetir não significa que a função termine: o domínio é $\\mathbb{R}$, e os dois exemplos acima mostram que arco maior que uma volta e arco negativo entram na conta sem problema.",
                    },
                    {
                        type: "quote",
                        value: "A função seno leva cada número real a um valor entre $-1$ e $1$, repete o desenho a cada $2\\pi$, zera nos múltiplos de $\\pi$ e é ímpar. Com esses quatro fatos dá para descrever a senoide inteira sem precisar de um único ponto novo.",
                    },
                ],
                questions: [
                    {
                        statement: "Quais são, respectivamente, o domínio e a imagem da função $f(x) = \\sin x$?",
                        difficulty: "facil",
                        options: [
                            { text: "domínio $\\mathbb{R}$ e imagem $[-1, 1]$", isCorrect: true },
                            { text: "domínio $[-1, 1]$ e imagem $\\mathbb{R}$", isCorrect: false },
                            { text: "domínio $[0, 2\\pi]$ e imagem $[-1, 1]$", isCorrect: false },
                            { text: "domínio $\\mathbb{R}$ e imagem $\\mathbb{R}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O período da função $f(x) = \\sin x$ é o menor número positivo $p$ tal que $\\sin(x + p) = \\sin x$ para todo real $x$. Quanto vale esse $p$?",
                        difficulty: "facil",
                        options: [
                            { text: "$4\\pi$", isCorrect: false },
                            { text: "$2\\pi$", isCorrect: true },
                            { text: "$\\frac{\\pi}{2}$", isCorrect: false },
                            { text: "$\\pi$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para quais valores reais de $x$ a função $f(x) = \\sin x$ vale zero, sendo $k$ um número inteiro qualquer?",
                        difficulty: "medio",
                        options: [
                            { text: "$x = \\frac{\\pi}{2} + k\\pi$", isCorrect: false },
                            { text: "$x = 2k\\pi$", isCorrect: false },
                            { text: "$x = k\\pi$", isCorrect: true },
                            { text: "$x = \\frac{\\pi}{2} + 2k\\pi$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em qual destes intervalos a função $f(x) = \\sin x$ é crescente em toda a extensão?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\left[\\frac{\\pi}{2}, \\frac{3\\pi}{2}\\right]$", isCorrect: false },
                            { text: "$\\left[0, \\pi\\right]$", isCorrect: false },
                            { text: "$\\left[\\frac{\\pi}{2}, \\pi\\right]$", isCorrect: false },
                            { text: "$\\left[0, \\frac{\\pi}{2}\\right]$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\sin\\left(-\\frac{13\\pi}{6}\\right)$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\frac{1}{2}$", isCorrect: false },
                            { text: "$-\\frac{\\sqrt{2}}{2}$", isCorrect: false },
                            { text: "$-\\frac{\\sqrt{3}}{2}$", isCorrect: false },
                            { text: "$-\\frac{1}{2}$", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "A função cosseno: gráfico e a defasagem em relação ao seno",
                blocks: [
                    {
                        type: "text",
                        value: "# A função cosseno\n\nSe o seno é a ordenada do ponto do ciclo, o cosseno é a abscissa do mesmo ponto. Isso levanta uma suspeita razoável: o cosseno é uma função nova, ou é o seno visto de outro jeito?\n\nA resposta curta é que quase tudo se repete. Domínio, imagem e período são idênticos aos do seno, e a diferença mora num único lugar, que é onde a curva começa. Esta aula troca em miúdos o que é igual e o que é diferente, porque é aí que o erro costuma nascer.",
                    },
                    {
                        type: "text",
                        value: "## Domínio, imagem e período\n\nPara $g(x) = \\cos x$, com $x$ em radianos:\n\n- domínio: $D(g) = \\mathbb{R}$, pois todo arco existe no ciclo;\n- imagem: $\\text{Im}(g) = [-1, 1]$, pois a abscissa de um ponto da circunferência de raio $1$ não passa de $1$ nem fica abaixo de $-1$;\n- período: $2\\pi$, porque depois de uma volta completa o ponto retorna à mesma posição, e com ela à mesma abscissa.\n\n$$\\cos(x + 2\\pi) = \\cos x$$\n\nOu seja: os três primeiros itens da ficha do seno valem palavra por palavra para o cosseno.",
                    },
                    {
                        type: "text",
                        value: "## A tabela de valores\n\n| $x$ | $\\cos x$ | aproximado |\n| --- | --- | --- |\n| $0$ | $1$ | $1{,}00$ |\n| $\\frac{\\pi}{6}$ | $\\frac{\\sqrt{3}}{2}$ | $0{,}87$ |\n| $\\frac{\\pi}{3}$ | $\\frac{1}{2}$ | $0{,}50$ |\n| $\\frac{\\pi}{2}$ | $0$ | $0$ |\n| $\\frac{2\\pi}{3}$ | $-\\frac{1}{2}$ | $-0{,}50$ |\n| $\\frac{5\\pi}{6}$ | $-\\frac{\\sqrt{3}}{2}$ | $-0{,}87$ |\n| $\\pi$ | $-1$ | $-1{,}00$ |\n| $\\frac{7\\pi}{6}$ | $-\\frac{\\sqrt{3}}{2}$ | $-0{,}87$ |\n| $\\frac{4\\pi}{3}$ | $-\\frac{1}{2}$ | $-0{,}50$ |\n| $\\frac{3\\pi}{2}$ | $0$ | $0$ |\n| $\\frac{5\\pi}{3}$ | $\\frac{1}{2}$ | $0{,}50$ |\n| $\\frac{11\\pi}{6}$ | $\\frac{\\sqrt{3}}{2}$ | $0{,}87$ |\n| $2\\pi$ | $1$ | $1{,}00$ |\n\nCompare com a tabela do seno: são os mesmos números, na mesma ordem, começando em outro ponto da lista.",
                    },
                    {
                        type: "text",
                        value: "## A curva começa no alto\n\nTraçando da esquerda para a direita a partir de $x = 0$:\n\n- em $x = 0$ a curva já está no topo, na altura $1$;\n- desce até a altura $0$ em $x = \\frac{\\pi}{2}$;\n- continua descendo até o fundo $-1$ em $x = \\pi$;\n- sobe de volta ao $0$ em $x = \\frac{3\\pi}{2}$;\n- fecha o ciclo no topo $1$ em $x = 2\\pi$.\n\nÉ a mesma onda suave do seno, com a mesma altura e a mesma largura de ciclo, só que começando no pico em vez de começar no meio da subida. Em um ciclo de $0$ a $2\\pi$, o cosseno decresce em $[0, \\pi]$ e cresce em $[\\pi, 2\\pi]$.\n\nOs pontos de destaque, com $k$ inteiro, ficam assim:\n\n- Zeros: $\\cos x = 0$ em $x = \\frac{\\pi}{2} + k\\pi$, ou seja, em $\\frac{\\pi}{2}$, $\\frac{3\\pi}{2}$, $-\\frac{\\pi}{2}$ e assim por diante. São exatamente os arcos em que o seno atinge pico ou vale.\n- Máximo: $\\cos x = 1$ em $x = 2k\\pi$, nos múltiplos de volta inteira.\n- Mínimo: $\\cos x = -1$ em $x = \\pi + 2k\\pi$.\n\nComo no seno, os zeros se repetem a cada $\\pi$ e os extremos a cada $2\\pi$.",
                    },
                    {
                        type: "text",
                        value: "## A defasagem de um quarto de volta\n\nColocando as duas curvas lado a lado, a do cosseno é a do seno arrastada $\\frac{\\pi}{2}$ para a esquerda. Em símbolos:\n\n$$\\cos x = \\sin\\left(x + \\frac{\\pi}{2}\\right)$$\n\nConfira em três pontos:\n\n- $x = 0$: $\\sin\\left(\\frac{\\pi}{2}\\right) = 1 = \\cos 0$;\n- $x = \\frac{\\pi}{2}$: $\\sin(\\pi) = 0 = \\cos\\left(\\frac{\\pi}{2}\\right)$;\n- $x = \\pi$: $\\sin\\left(\\frac{3\\pi}{2}\\right) = -1 = \\cos \\pi$.\n\nEssa distância de $\\frac{\\pi}{2}$ entre as duas curvas se chama defasagem. É um quarto de volta, e o cosseno está sempre adiantado em relação ao seno: por isso o pico de um cai no zero do outro.",
                    },
                    {
                        type: "text",
                        value: "## Uma função par\n\nTrocar $x$ por $-x$ reflete o ponto do ciclo em relação ao eixo horizontal, e nessa reflexão a abscissa não se altera. Como o cosseno é a abscissa:\n\n$$\\cos(-x) = \\cos x$$\n\nFunção com essa propriedade se chama par, e o gráfico é simétrico em relação ao eixo vertical. Exemplo:\n\n$$\\cos\\left(-\\frac{\\pi}{3}\\right) = \\cos\\left(\\frac{\\pi}{3}\\right) = \\frac{1}{2}$$\n\nAqui está a primeira diferença de natureza entre as duas funções: o seno é ímpar e troca de sinal junto com o arco, o cosseno é par e não troca.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: lendo o cosseno nos quadrantes\n\nO sinal do cosseno segue o sinal da abscissa: positivo nos quadrantes I e IV, que ficam no lado direito do ciclo, e negativo nos quadrantes II e III, do lado esquerdo. Com isso, basta reduzir o arco ao primeiro quadrante e colocar o sinal.\n\n- $\\cos\\left(\\frac{2\\pi}{3}\\right)$: o arco está no quadrante II, cuja referência é $\\pi - \\frac{2\\pi}{3} = \\frac{\\pi}{3}$. O valor é $-\\cos\\left(\\frac{\\pi}{3}\\right) = -\\frac{1}{2}$.\n- $\\cos\\left(\\frac{5\\pi}{4}\\right)$: quadrante III, referência $\\frac{5\\pi}{4} - \\pi = \\frac{\\pi}{4}$ e sinal negativo, o que dá $-\\frac{\\sqrt{2}}{2}$.\n- $\\cos\\left(\\frac{5\\pi}{3}\\right)$: quadrante IV, referência $2\\pi - \\frac{5\\pi}{3} = \\frac{\\pi}{3}$ e sinal positivo, o que dá $\\frac{1}{2}$.\n\nRepare no contraste com o seno: em $\\frac{5\\pi}{3}$ o seno é negativo e o cosseno é positivo, porque o ponto está embaixo e à direita.",
                    },
                    {
                        type: "text",
                        value: "## O que muda e o que não muda\n\n| propriedade | $\\sin x$ | $\\cos x$ |\n| --- | --- | --- |\n| domínio | $\\mathbb{R}$ | $\\mathbb{R}$ |\n| imagem | $[-1, 1]$ | $[-1, 1]$ |\n| período | $2\\pi$ | $2\\pi$ |\n| valor em $x = 0$ | $0$ | $1$ |\n| zeros | $k\\pi$ | $\\frac{\\pi}{2} + k\\pi$ |\n| paridade | ímpar | par |\n\nTrês linhas idênticas e três diferentes. As três diferenças de posição vêm todas do mesmo fato, a defasagem de $\\frac{\\pi}{2}$ entre as curvas, e a paridade é a única distinção que não se explica por deslocamento.",
                    },
                    {
                        type: "quote",
                        value: "Cosseno e seno são a mesma onda com partidas diferentes: mesmo domínio, mesma imagem, mesmo período e um quarto de volta de defasagem entre eles. A diferença que não é só de posição é a paridade, com o cosseno par e o seno ímpar.",
                    },
                ],
                questions: [
                    {
                        statement: "A função cosseno é par. Por isso, para todo número real $x$, o valor de $\\cos(-x)$ é igual a qual expressão?",
                        difficulty: "facil",
                        options: [
                            { text: "$-\\sin x$", isCorrect: false },
                            { text: "$\\sin x$", isCorrect: false },
                            { text: "$\\cos x$", isCorrect: true },
                            { text: "$-\\cos x$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para quais valores reais de $x$ a função $g(x) = \\cos x$ vale zero, sendo $k$ um número inteiro?",
                        difficulty: "facil",
                        options: [
                            { text: "$x = 2k\\pi$", isCorrect: false },
                            { text: "$x = \\frac{\\pi}{2} + k\\pi$", isCorrect: true },
                            { text: "$x = \\frac{\\pi}{2} + 2k\\pi$", isCorrect: false },
                            { text: "$x = k\\pi$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\cos\\left(\\frac{5\\pi}{4}\\right)$?",
                        difficulty: "medio",
                        options: [
                            { text: "$-\\frac{\\sqrt{2}}{2}$", isCorrect: true },
                            { text: "$\\frac{\\sqrt{2}}{2}$", isCorrect: false },
                            { text: "$-\\frac{\\sqrt{3}}{2}$", isCorrect: false },
                            { text: "$-\\frac{1}{2}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Comparando $f(x) = \\sin x$ com $g(x) = \\cos x$, o que realmente muda de uma função para a outra?",
                        difficulty: "medio",
                        options: [
                            { text: "a imagem, que no cosseno fica reduzida a $[0, 1]$", isCorrect: false },
                            { text: "o período, que no cosseno cai para a metade, $\\pi$", isCorrect: false },
                            { text: "a posição: o cosseno é o seno deslocado $\\frac{\\pi}{2}$ à esquerda", isCorrect: true },
                            { text: "o domínio, que no cosseno exclui os múltiplos ímpares de $\\frac{\\pi}{2}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A igualdade $\\cos x = \\sin\\left(x + \\frac{\\pi}{2}\\right)$ vale para todo número real $x$. Usando ela com $x = \\frac{2\\pi}{3}$, qual é o valor de $\\sin\\left(\\frac{7\\pi}{6}\\right)$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$-\\frac{1}{2}$", isCorrect: true },
                            { text: "$\\frac{1}{2}$", isCorrect: false },
                            { text: "$-\\frac{\\sqrt{3}}{2}$", isCorrect: false },
                            { text: "$-\\frac{\\sqrt{2}}{2}$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "A função tangente: domínio restrito e assíntotas",
                blocks: [
                    {
                        type: "text",
                        value: "# A função tangente\n\nSeno e cosseno existem para todo número real. A tangente não, e o motivo é simples: ela é um quociente.\n\n$$\\tan x = \\frac{\\sin x}{\\cos x}$$\n\nQuociente tem denominador, e denominador zerado não tem resultado. É dessa única frase que saem todas as esquisitices da tangente: o domínio com buracos, as assíntotas, a imagem sem limite e o período menor que o das outras duas funções.",
                    },
                    {
                        type: "text",
                        value: "## O domínio tem buracos\n\nO denominador é $\\cos x$, que zera em $x = \\frac{\\pi}{2} + k\\pi$, com $k$ inteiro. Nesses arcos a tangente não existe, e o domínio é o conjunto dos reais com esses pontos retirados:\n\n$$x \\neq \\frac{\\pi}{2} + k\\pi$$\n\nNa prática, a lista dos arcos proibidos é $\\dots, -\\frac{\\pi}{2}, \\frac{\\pi}{2}, \\frac{3\\pi}{2}, \\frac{5\\pi}{2}, \\dots$, espaçados de $\\pi$ em $\\pi$. Um teste rápido: se o arco for um múltiplo ímpar de $\\frac{\\pi}{2}$, a tangente não existe ali.",
                    },
                    {
                        type: "text",
                        value: "## Tabela de valores em um ramo\n\nA tabela cobre o trecho entre dois arcos proibidos seguidos, de $-\\frac{\\pi}{2}$ a $\\frac{\\pi}{2}$. A sigla ND marca o arco em que a tangente não está definida.\n\n| $x$ | $\\tan x$ | aproximado |\n| --- | --- | --- |\n| $-\\frac{\\pi}{2}$ | ND | ND |\n| $-\\frac{\\pi}{3}$ | $-\\sqrt{3}$ | $-1{,}73$ |\n| $-\\frac{\\pi}{4}$ | $-1$ | $-1{,}00$ |\n| $-\\frac{\\pi}{6}$ | $-\\frac{\\sqrt{3}}{3}$ | $-0{,}58$ |\n| $0$ | $0$ | $0$ |\n| $\\frac{\\pi}{6}$ | $\\frac{\\sqrt{3}}{3}$ | $0{,}58$ |\n| $\\frac{\\pi}{4}$ | $1$ | $1{,}00$ |\n| $\\frac{\\pi}{3}$ | $\\sqrt{3}$ | $1{,}73$ |\n| $\\frac{\\pi}{2}$ | ND | ND |\n\nRepare na velocidade da subida: de $-1{,}73$ a $1{,}73$ em pouco mais de $2$ radianos, e fica ainda mais íngreme perto das pontas, que é onde a tabela para.",
                    },
                    {
                        type: "text",
                        value: "## A imagem é todo o conjunto dos reais\n\nPense no que acontece quando $x$ se aproxima de $\\frac{\\pi}{2}$ por valores menores. O numerador $\\sin x$ vai para $1$, e o denominador $\\cos x$ vai para $0$ por valores positivos. Dividir um número perto de $1$ por um número positivo minúsculo dá um resultado enorme, e a tangente cresce sem limite.\n\nPelo outro lado, com $x$ um pouco maior que $\\frac{\\pi}{2}$, o cosseno é negativo e minúsculo, e a tangente despenca para valores muito negativos.\n\nComo a função assume valores tão grandes e tão pequenos quanto se queira, e não dá saltos dentro de cada ramo, a imagem é\n\n$$\\text{Im}(\\tan) = \\mathbb{R}$$",
                    },
                    {
                        type: "text",
                        value: "## Assíntotas verticais\n\nA reta vertical $x = \\frac{\\pi}{2}$ funciona como uma parede: a curva encosta nela de um lado e do outro sem nunca tocá-la, porque naquele arco a função não existe. Reta com esse papel se chama assíntota vertical.\n\nA tangente tem infinitas assíntotas, uma em cada arco proibido:\n\n$$x = \\frac{\\pi}{2} + k\\pi$$\n\nEntre duas assíntotas vizinhas fica um ramo da curva, que sobe de valores muito negativos até valores muito positivos, cortando o eixo horizontal no meio do caminho. O gráfico inteiro é a repetição desse mesmo ramo, para sempre, nos dois sentidos.",
                    },
                    {
                        type: "text",
                        value: "## O período é a metade do período do seno\n\nAqui está o fato que mais surpreende: o período da tangente é $\\pi$, e não $2\\pi$.\n\n$$\\tan(x + \\pi) = \\tan x$$\n\nO motivo sai da definição. Avançar meia volta troca o sinal do seno e também o do cosseno, porque o ponto vai para o lado diametralmente oposto do ciclo:\n\n$$\\tan(x + \\pi) = \\frac{-\\sin x}{-\\cos x} = \\frac{\\sin x}{\\cos x} = \\tan x$$\n\nOs dois sinais de menos se cancelam no quociente. Confira com números: $\\tan\\left(\\frac{\\pi}{6}\\right) = \\frac{\\sqrt{3}}{3}$ e $\\tan\\left(\\frac{7\\pi}{6}\\right) = \\frac{\\sqrt{3}}{3}$, o mesmo valor com meia volta de diferença, enquanto $\\sin\\left(\\frac{\\pi}{6}\\right) = \\frac{1}{2}$ e $\\sin\\left(\\frac{7\\pi}{6}\\right) = -\\frac{1}{2}$ são diferentes.",
                    },
                    {
                        type: "text",
                        value: "## Crescente em cada ramo, e ímpar\n\nDentro de um ramo a tangente é sempre crescente, do começo ao fim. Vale o cuidado de dizer em cada ramo separadamente, e não no domínio todo, porque no ramo seguinte ela recomeça lá embaixo, em valores muito negativos.\n\nA tangente também é ímpar:\n\n$$\\tan(-x) = \\frac{\\sin(-x)}{\\cos(-x)} = \\frac{-\\sin x}{\\cos x} = -\\tan x$$\n\nO seno é ímpar e leva o sinal, o cosseno é par e não leva, então o quociente troca de sinal. Exemplos: $\\tan\\left(-\\frac{\\pi}{4}\\right) = -1$ e $\\tan\\left(-\\frac{\\pi}{3}\\right) = -\\sqrt{3}$.",
                    },
                    {
                        type: "text",
                        value: "## O erro de achar que a tangente tem máximo\n\nPerguntado pelo valor máximo da tangente, muita gente responde $1$. O erro tem duas origens. A primeira é a confusão com o seno e o cosseno, cujos valores ficam presos em $[-1, 1]$. A segunda é a lembrança de que $\\tan\\left(\\frac{\\pi}{4}\\right) = 1$, valor que marca o ângulo em que os catetos ficam iguais e que acaba guardado na memória como se fosse um teto.\n\nBasta um contraexemplo para derrubar as duas ideias: $\\tan\\left(\\frac{\\pi}{3}\\right) = \\sqrt{3}$, que vale cerca de $1{,}73$ e já passa de $1$. E não existe recorde a bater, porque perto da assíntota a função supera qualquer número que se escolha. A tangente não tem máximo nem mínimo.",
                    },
                    {
                        type: "quote",
                        value: "A tangente é o quociente do seno pelo cosseno, e tudo nela vem disso: não existe onde o cosseno zera, tem assíntota vertical nesses arcos, imagem igual a $\\mathbb{R}$, sem máximo nem mínimo, e período $\\pi$, porque os dois sinais trocados se cancelam na divisão.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o domínio da função $f(x) = \\tan x$, com $k$ representando um número inteiro?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\mathbb{R}$ sem os arcos $\\frac{\\pi}{2} + k\\pi$", isCorrect: true },
                            { text: "$\\mathbb{R}$ sem os arcos $k\\pi$, com $k$ inteiro", isCorrect: false },
                            { text: "$\\mathbb{R}$ inteiro, sem arco nenhum de fora", isCorrect: false },
                            { text: "$\\mathbb{R}$ sem os arcos $\\frac{\\pi}{4} + k\\pi$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o período da função $f(x) = \\tan x$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\pi$", isCorrect: true },
                            { text: "$4\\pi$", isCorrect: false },
                            { text: "$2\\pi$", isCorrect: false },
                            { text: "$\\frac{\\pi}{2}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\tan\\left(\\frac{3\\pi}{4}\\right)$?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\sqrt{3}$", isCorrect: false },
                            { text: "$1$", isCorrect: false },
                            { text: "$-1$", isCorrect: true },
                            { text: "$-\\sqrt{3}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual afirmação sobre a imagem da função $f(x) = \\tan x$ está correta?",
                        difficulty: "medio",
                        options: [
                            { text: "a imagem exclui os valores entre $-1$ e $1$", isCorrect: false },
                            { text: "a imagem é $[0, 1]$ e o mínimo vale $0$", isCorrect: false },
                            { text: "a imagem é $[-1, 1]$ e o máximo vale $1$", isCorrect: false },
                            { text: "a imagem é $\\mathbb{R}$ e não existe máximo", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\tan\\left(-\\frac{5\\pi}{3}\\right)$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$-\\sqrt{3}$", isCorrect: false },
                            { text: "$\\sqrt{3}$", isCorrect: true },
                            { text: "$-\\frac{\\sqrt{3}}{3}$", isCorrect: false },
                            { text: "$\\frac{\\sqrt{3}}{3}$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Amplitude, período e deslocamento",
                blocks: [
                    {
                        type: "text",
                        value: "# A onda com botões de ajuste\n\nA senoide pura é bonita, mas pouco flexível: amplitude $1$, centro na altura zero, um ciclo a cada $2\\pi$ e partida sempre no mesmo lugar. A família abaixo resolve isso de uma vez:\n\n$$f(x) = a + b\\sin(cx + d)$$\n\ncom $a$, $b$, $c$ e $d$ números reais, $b \\neq 0$ e $c \\neq 0$. São quatro botões de ajuste, e cada um tem um efeito só seu. Esta aula treina os dois caminhos: ler a função e dizer o que ela faz, e partir do que a onda precisa fazer para montar a função.",
                    },
                    {
                        type: "text",
                        value: "## Os quatro parâmetros em uma tabela\n\n| parâmetro | nome | efeito |\n| --- | --- | --- |\n| $a$ | deslocamento vertical | sobe ou desce a curva inteira |\n| $b$ | amplitude com sinal | estica na vertical, e inverte se for negativo |\n| $c$ | fator de frequência | comprime ou alonga na horizontal |\n| $d$ | fase | desloca a curva na horizontal |\n\nAs três grandezas que o enunciado costuma pedir saem daí: a amplitude é $|b|$, o período é $\\frac{2\\pi}{|c|}$ e a imagem é $[a - |b|, a + |b|]$. O resto da aula mostra de onde vem cada uma.",
                    },
                    {
                        type: "text",
                        value: "## A amplitude é o módulo de b\n\nMultiplicar o seno por $b$ multiplica toda a altura da onda por $b$. Como $\\sin(cx + d)$ varia entre $-1$ e $1$, o produto $b\\sin(cx + d)$ varia entre $-|b|$ e $|b|$. Esse $|b|$ é a amplitude: a distância do centro da onda até o pico, ou seja, metade da variação total.\n\nCom $b$ negativo a curva é espelhada na horizontal, porque pico e vale trocam de lugar, mas a amplitude continua $|b|$ e a imagem não muda. Por isso $f(x) = 4 - 3\\sin x$ e $g(x) = 4 + 3\\sin x$ têm a mesma amplitude $3$ e a mesma imagem $[1, 7]$.",
                    },
                    {
                        type: "text",
                        value: "## O parâmetro a é a linha do meio\n\nSomar $a$ levanta a curva inteira. A onda deixa de oscilar em torno da altura zero e passa a oscilar em torno da reta horizontal de altura $a$, que é a linha do meio da figura. Daí sai a imagem:\n\n$$\\text{Im}(f) = [a - |b|, a + |b|]$$\n\nA leitura serve nos dois sentidos. Com $a$ e $b$ na mão, o máximo é $a + |b|$ e o mínimo é $a - |b|$. Chamando o máximo de $M$ e o mínimo de $m$, vale o caminho inverso:\n\n$$a = \\frac{M + m}{2} \\qquad |b| = \\frac{M - m}{2}$$\n\nEm palavras: a linha do meio é a média dos extremos, e a amplitude é a metade da diferença entre eles.",
                    },
                    {
                        type: "text",
                        value: "## O período sai do fator c\n\nO seno completa um ciclo quando o que está dentro dele avança $2\\pi$. Dentro temos $cx + d$, que avança $2\\pi$ quando $x$ avança $\\frac{2\\pi}{|c|}$. Esse é o período:\n\n$$T = \\frac{2\\pi}{|c|}$$\n\nA leitura intuitiva ajuda: $c$ é um multiplicador de velocidade. Com $c = 2$ o argumento corre duas vezes mais rápido, cabe o dobro de ciclos no mesmo espaço e cada ciclo fica com metade da largura, $\\pi$. Com $c = \\frac{1}{2}$ o argumento corre na metade da velocidade, e o ciclo fica com o dobro da largura, $4\\pi$.\n\nQuanto ao $d$, escrevendo $cx + d = c\\left(x + \\frac{d}{c}\\right)$ fica visível que a curva está deslocada $\\frac{d}{c}$ para a esquerda. Na prática, para achar onde o ciclo começa basta resolver $cx + d = 0$, que é o ponto em que o argumento zera.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: da função para as propriedades\n\nConsidere\n\n$$f(x) = 3 + 2\\sin(4x - \\pi)$$\n\nLendo os parâmetros: $a = 3$, $b = 2$, $c = 4$ e $d = -\\pi$.\n\n- Amplitude: $|b| = 2$.\n- Linha do meio: a altura $a = 3$.\n- Imagem: $[3 - 2, 3 + 2] = [1, 5]$, com máximo $5$ e mínimo $1$.\n- Período: $\\frac{2\\pi}{4} = \\frac{\\pi}{2}$, então cabem quatro ciclos completos entre $0$ e $2\\pi$.\n- Início do ciclo: de $4x - \\pi = 0$ sai $x = \\frac{\\pi}{4}$, ou seja, a curva está deslocada $\\frac{\\pi}{4}$ para a direita.\n\nConferindo com dois valores: $f\\left(\\frac{\\pi}{4}\\right) = 3 + 2\\sin 0 = 3$, que é a linha do meio, e $f\\left(\\frac{3\\pi}{8}\\right) = 3 + 2\\sin\\left(\\frac{\\pi}{2}\\right) = 5$, que é o máximo, um quarto de período depois.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: das propriedades para a função\n\nAgora o caminho inverso. Queremos uma função dessa família com máximo $9$, mínimo $1$ e período $4\\pi$.\n\nA linha do meio é a média dos extremos:\n\n$$a = \\frac{9 + 1}{2} = 5$$\n\nA amplitude é a metade da variação total:\n\n$$|b| = \\frac{9 - 1}{2} = 4$$\n\nE o fator $c$ sai do período:\n\n$$\\frac{2\\pi}{|c|} = 4\\pi \\ \\Rightarrow \\ |c| = \\frac{2\\pi}{4\\pi} = \\frac{1}{2}$$\n\nEscolhendo os valores positivos e $d = 0$, uma resposta é\n\n$$f(x) = 5 + 4\\sin\\left(\\frac{x}{2}\\right)$$\n\nConferindo: $f(0) = 5$, $f(\\pi) = 5 + 4 = 9$ no máximo, $f(3\\pi) = 5 - 4 = 1$ no mínimo e $f(4\\pi) = 5$, fechando o ciclo em $4\\pi$. Outras respostas são possíveis, trocando o sinal de $b$ ou mexendo em $d$, porque o enunciado não fixou onde o ciclo começa.",
                    },
                    {
                        type: "text",
                        value: "## O erro de confundir c com o período\n\nA resposta errada mais frequente desta aula é dizer que $f(x) = \\sin(3x)$ tem período $3$. O $3$ não é o período, é o fator que acelera o argumento: com ele o ciclo fica três vezes mais estreito, e o período é\n\n$$\\frac{2\\pi}{3} \\approx 2{,}09$$\n\nDois sinais de alerta pegam o erro na hora. O primeiro é a forma da resposta: período de função trigonométrica quase sempre traz $\\pi$, e um período sem $\\pi$ merece desconfiança. O segundo é a direção do efeito: $c$ grande significa onda apertada, logo período pequeno, então $c$ e período variam em sentidos opostos. Quem multiplica $2\\pi$ por $c$ em vez de dividir encontra uma onda mais larga justamente quando ela deveria ficar mais estreita.\n\nVale guardar que essa família é a ferramenta padrão para descrever qualquer coisa que oscila em torno de um valor médio, com $a$ marcando o nível de referência, $|b|$ o tamanho da oscilação e $\\frac{2\\pi}{|c|}$ a duração de um ciclo.",
                    },
                    {
                        type: "quote",
                        value: "Em $f(x) = a + b\\sin(cx + d)$, o $a$ dá a linha do meio, o $|b|$ dá a amplitude, o $\\frac{2\\pi}{|c|}$ dá o período e o $d$ escorrega a curva na horizontal. A imagem é $[a - |b|, a + |b|]$, e o $c$ nunca é o período.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a amplitude da função $f(x) = 5 + 3\\sin(2x)$?",
                        difficulty: "facil",
                        options: [
                            { text: "$5$", isCorrect: false },
                            { text: "$3$", isCorrect: true },
                            { text: "$8$", isCorrect: false },
                            { text: "$6$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o período da função $f(x) = \\sin(3x)$?",
                        difficulty: "facil",
                        options: [
                            { text: "$6\\pi$", isCorrect: false },
                            { text: "$\\frac{\\pi}{3}$", isCorrect: false },
                            { text: "$\\frac{3}{2\\pi}$", isCorrect: false },
                            { text: "$\\frac{2\\pi}{3}$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual é a imagem da função $f(x) = -1 + 4\\sin\\left(x + \\frac{\\pi}{3}\\right)$?",
                        difficulty: "medio",
                        options: [
                            { text: "$[-1, 4]$", isCorrect: false },
                            { text: "$[-4, 4]$", isCorrect: false },
                            { text: "$[-5, 3]$", isCorrect: true },
                            { text: "$[-3, 5]$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual destas funções tem máximo $7$, mínimo $3$ e período $\\pi$?",
                        difficulty: "medio",
                        options: [
                            { text: "$f(x) = 2 + 5\\sin(2x)$", isCorrect: false },
                            { text: "$f(x) = 5 + 4\\sin(2x)$", isCorrect: false },
                            { text: "$f(x) = 5 + 2\\sin(2x)$", isCorrect: true },
                            { text: "$f(x) = 5 + 2\\sin\\left(\\frac{x}{2}\\right)$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Considere a função $f(x) = 4 - 3\\sin\\left(\\frac{2x}{3}\\right)$. Quais são o período e a imagem dessa função?",
                        difficulty: "dificil",
                        options: [
                            { text: "período $3\\pi$ e imagem $[-3, 3]$", isCorrect: false },
                            { text: "período $\\frac{4\\pi}{3}$ e imagem $[1, 7]$", isCorrect: false },
                            { text: "período $\\frac{2\\pi}{3}$ e imagem $[1, 7]$", isCorrect: false },
                            { text: "período $3\\pi$ e imagem $[1, 7]$", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Secante, cossecante e cotangente",
                blocks: [
                    {
                        type: "text",
                        value: "# As três recíprocas\n\nSeno, cosseno e tangente dão conta de quase tudo, mas em várias contas aparece o inverso delas, e vale dar nome a esses inversos. Dividindo $1$ por cada uma das três nascem a secante, a cossecante e a cotangente.\n\nNada aqui é assunto novo de verdade: toda pergunta sobre essas três se resolve voltando para seno e cosseno. O que exige atenção é o par certo de cada nome e o domínio de cada uma, porque agora o denominador muda de lugar.",
                    },
                    {
                        type: "text",
                        value: "## As definições, e o par certo de cada nome\n\n$$\\sec x = \\frac{1}{\\cos x}$$\n\n$$\\csc x = \\frac{1}{\\sin x}$$\n\n$$\\cot x = \\frac{1}{\\tan x} = \\frac{\\cos x}{\\sin x}$$\n\nO \"co\" do nome é o que confunde, e a regra é que ele cruza: a secante, que não tem \"co\", é a recíproca do cosseno, que tem; a cossecante, que tem \"co\", é a recíproca do seno, que não tem. A cotangente é a única que casa com o nome parecido, sendo a recíproca da tangente.\n\nNa cotangente as duas formas têm uso. A expressão $\\frac{\\cos x}{\\sin x}$ é a que vale sempre que $\\sin x \\neq 0$, e é a que usamos para calcular. A forma $\\frac{1}{\\tan x}$ explica o nome, com a ressalva de não fazer sentido literal nos arcos em que a tangente não existe. Nesses arcos, como $\\frac{\\pi}{2}$, o quociente $\\frac{\\cos x}{\\sin x}$ dá $\\frac{0}{1} = 0$, e esse é o valor aceito: $\\cot\\left(\\frac{\\pi}{2}\\right) = 0$.",
                    },
                    {
                        type: "text",
                        value: "## Os domínios: onde o denominador zera\n\nA regra é sempre a mesma, só muda quem está embaixo. Com $k$ inteiro em todos os casos:\n\n- $\\sec x = \\frac{1}{\\cos x}$ não existe onde $\\cos x = 0$, ou seja, em $x = \\frac{\\pi}{2} + k\\pi$. É o mesmo domínio da tangente, o que faz sentido, porque as duas dividem pelo cosseno.\n- $\\csc x = \\frac{1}{\\sin x}$ não existe onde $\\sin x = 0$, ou seja, em $x = k\\pi$.\n- $\\cot x = \\frac{\\cos x}{\\sin x}$ também não existe em $x = k\\pi$, pelo mesmo motivo da cossecante.\n\nA cotangente, como a tangente, tem período $\\pi$ e imagem igual a $\\mathbb{R}$, e tem assíntotas verticais em $x = k\\pi$, meia volta deslocadas em relação às da tangente.",
                    },
                    {
                        type: "text",
                        value: "## A imagem da secante e da cossecante\n\nNo domínio da secante, $\\cos x$ é diferente de zero e tem módulo no máximo $1$. Dividir $1$ por um número de módulo menor ou igual a $1$ só pode dar resultado de módulo maior ou igual a $1$:\n\n$$|\\cos x| \\le 1 \\ \\Rightarrow \\ |\\sec x| = \\frac{1}{|\\cos x|} \\ge 1$$\n\nO mesmo argumento, com o seno no lugar do cosseno, dá $|\\csc x| \\ge 1$. Em palavras: a imagem das duas é formada pelos números maiores ou iguais a $1$ junto com os menores ou iguais a $-1$. A faixa aberta entre $-1$ e $1$ fica vazia, e o zero em particular nunca aparece, porque $\\frac{1}{\\cos x}$ só seria zero se $\\cos x$ pudesse ser infinitamente grande.\n\nA consequência prática é direta: resultado como $\\sec x = 0{,}8$ ou $\\csc x = -\\frac{1}{2}$ denuncia conta errada, do mesmo jeito que $\\sin x = 1{,}4$ denuncia.",
                    },
                    {
                        type: "text",
                        value: "## Valores nos arcos notáveis\n\n| $x$ | $\\sec x$ | $\\csc x$ | $\\cot x$ |\n| --- | --- | --- | --- |\n| $0$ | $1$ | ND | ND |\n| $\\frac{\\pi}{6}$ | $\\frac{2\\sqrt{3}}{3}$ | $2$ | $\\sqrt{3}$ |\n| $\\frac{\\pi}{4}$ | $\\sqrt{2}$ | $\\sqrt{2}$ | $1$ |\n| $\\frac{\\pi}{3}$ | $2$ | $\\frac{2\\sqrt{3}}{3}$ | $\\frac{\\sqrt{3}}{3}$ |\n| $\\frac{\\pi}{2}$ | ND | $1$ | $0$ |\n\nVale conferir uma linha para pegar o método. Em $x = \\frac{\\pi}{6}$ temos $\\cos\\left(\\frac{\\pi}{6}\\right) = \\frac{\\sqrt{3}}{2}$, então\n\n$$\\sec\\left(\\frac{\\pi}{6}\\right) = \\frac{1}{\\frac{\\sqrt{3}}{2}} = \\frac{2}{\\sqrt{3}} = \\frac{2\\sqrt{3}}{3}$$\n\ne, como $\\sin\\left(\\frac{\\pi}{6}\\right) = \\frac{1}{2}$, sai $\\csc\\left(\\frac{\\pi}{6}\\right) = 2$. Repare na simetria da tabela: a coluna da secante lida de cima para baixo é a coluna da cossecante lida de baixo para cima, porque $\\frac{\\pi}{6}$ e $\\frac{\\pi}{3}$ são arcos complementares, e o mesmo vale para $0$ e $\\frac{\\pi}{2}$.",
                    },
                    {
                        type: "text",
                        value: "## O erro clássico de trocar o par\n\nO erro mais comum com essas três funções é escrever\n\n$$\\sec x = \\frac{1}{\\sin x}$$\n\nO nome engana, porque \"secante\" e \"seno\" começam parecidos. Um teste rápido desmonta a confusão: em $x = 0$ temos $\\cos 0 = 1$ e $\\sin 0 = 0$. Pela definição correta, $\\sec 0 = \\frac{1}{1} = 1$, um valor que existe. Pela definição trocada cairia $\\frac{1}{0}$, e a secante deixaria de existir em $0$, o que é falso.\n\nQuem troca o par erra também os domínios em bloco, porque passa a excluir $x = k\\pi$ da secante em vez de excluir $x = \\frac{\\pi}{2} + k\\pi$. Na dúvida, volte ao \"co\" que cruza, ou teste em $x = 0$, que resolve na hora.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido\n\nCalcule $\\sec\\left(\\frac{2\\pi}{3}\\right)$, $\\csc\\left(\\frac{7\\pi}{6}\\right)$ e $\\cot\\left(\\frac{5\\pi}{6}\\right)$.\n\nO método é sempre o mesmo: calcule a função que está no denominador e inverta.\n\n- $\\cos\\left(\\frac{2\\pi}{3}\\right) = -\\frac{1}{2}$, logo $\\sec\\left(\\frac{2\\pi}{3}\\right) = -2$.\n- $\\sin\\left(\\frac{7\\pi}{6}\\right) = -\\frac{1}{2}$, logo $\\csc\\left(\\frac{7\\pi}{6}\\right) = -2$.\n- $\\cos\\left(\\frac{5\\pi}{6}\\right) = -\\frac{\\sqrt{3}}{2}$ e $\\sin\\left(\\frac{5\\pi}{6}\\right) = \\frac{1}{2}$, logo $\\cot\\left(\\frac{5\\pi}{6}\\right) = \\frac{-\\frac{\\sqrt{3}}{2}}{\\frac{1}{2}} = -\\sqrt{3}$.\n\nNos três casos o sinal veio do quadrante, e os dois primeiros resultados têm módulo $2$, maior que $1$, como a imagem exige.",
                    },
                    {
                        type: "quote",
                        value: "Secante, cossecante e cotangente não pedem decoreba nova: identifique quem está no denominador, exclua os arcos que o anulam e inverta o valor conhecido. O \"co\" do nome cruza, e secante e cossecante nunca têm módulo menor que $1$.",
                    },
                ],
                questions: [
                    {
                        statement: "A secante de um número real $x$ é definida como qual quociente?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\sec x = \\frac{1}{\\sin x}$", isCorrect: false },
                            { text: "$\\sec x = \\frac{\\sin x}{\\cos x}$", isCorrect: false },
                            { text: "$\\sec x = \\frac{1}{\\cos x}$", isCorrect: true },
                            { text: "$\\sec x = \\frac{1}{\\tan x}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para quais valores reais de $x$ a função $g(x) = \\csc x$ não está definida, sendo $k$ um número inteiro?",
                        difficulty: "facil",
                        options: [
                            { text: "$x = \\frac{\\pi}{2} + k\\pi$", isCorrect: false },
                            { text: "$x = 2k\\pi$", isCorrect: false },
                            { text: "$x = \\frac{\\pi}{2} + 2k\\pi$", isCorrect: false },
                            { text: "$x = k\\pi$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\sec\\left(\\frac{\\pi}{6}\\right)$?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{2\\sqrt{3}}{9}$", isCorrect: false },
                            { text: "$\\frac{\\sqrt{3}}{2}$", isCorrect: false },
                            { text: "$\\frac{2\\sqrt{3}}{3}$", isCorrect: true },
                            { text: "$2$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que não existe número real $x$ com $\\sec x = \\frac{1}{2}$?",
                        difficulty: "medio",
                        options: [
                            { text: "porque $|\\sec x| \\ge 1$ em todo o domínio da secante", isCorrect: true },
                            { text: "porque a secante só assume valores maiores ou iguais a $1$", isCorrect: false },
                            { text: "porque $\\frac{1}{2}$ não pertence ao domínio da secante", isCorrect: false },
                            { text: "porque a secante tem imagem igual a $[-1, 1]$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\cot\\left(\\frac{2\\pi}{3}\\right)$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\frac{\\sqrt{3}}{3}$", isCorrect: false },
                            { text: "$-\\frac{\\sqrt{3}}{2}$", isCorrect: false },
                            { text: "$-\\sqrt{3}$", isCorrect: false },
                            { text: "$-\\frac{\\sqrt{3}}{3}$", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Identidades e transformações",
        aulas: [
            {
                titulo: "A relação fundamental e as que saem dela",
                blocks: [
                    {
                        type: "text",
                        value: "# A relação fundamental e as que saem dela\n\nUma medição devolve $\\sin x = \\frac{3}{5}$ para um arco, e o cálculo seguinte precisa do cosseno desse mesmo arco. Não há tabela por perto, nem calculadora. Ainda assim o cosseno está determinado, porque seno e cosseno de um mesmo arco não são livres um do outro: eles obedecem a uma amarra que vale para todo arco, sem exceção.\n\nEssa amarra é a relação fundamental da trigonometria, e dela saem outras duas. Esta aula mostra de onde ela vem, o que se consegue com ela e por que o quadrante do arco é parte da resposta, não um detalhe de acabamento.",
                    },
                    {
                        type: "text",
                        value: "## Pitágoras dentro do ciclo de raio 1\n\nNo ciclo trigonométrico, o arco $x$ determina um ponto $P$ sobre a circunferência de raio $1$, e as coordenadas de $P$ são exatamente $(\\cos x, \\sin x)$. Baixando a perpendicular de $P$ até o eixo horizontal, aparece um triângulo retângulo com:\n\n- cateto horizontal de medida $|\\cos x|$,\n- cateto vertical de medida $|\\sin x|$,\n- hipotenusa igual ao raio, de medida $1$.\n\nPitágoras nesse triângulo dá $|\\cos x|^2 + |\\sin x|^2 = 1^2$. Como o quadrado apaga o sinal, o módulo pode cair, e fica a **relação fundamental**:\n\n$$\\sin^2 x + \\cos^2 x = 1$$\n\nO argumento não depende de onde $P$ caiu: em qualquer quadrante os catetos têm essas medidas e a hipotenusa continua valendo $1$. E nos eixos, onde o triângulo degenera, a igualdade se verifica direto, como em $\\sin 0 = 0$ e $\\cos 0 = 1$, que dão $0 + 1 = 1$.",
                    },
                    {
                        type: "text",
                        value: "## Dividindo a fundamental: as duas que saem dela\n\nNão é preciso decorar mais identidades. As duas seguintes nascem de dividir a fundamental por um quadrado.\n\nDividindo tudo por $\\cos^2 x$, com $\\cos x \\neq 0$:\n\n$$\\frac{\\sin^2 x}{\\cos^2 x} + \\frac{\\cos^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x}$$\n\nÀ esquerda, o primeiro termo é $\\tan^2 x$ e o segundo é $1$; à direita fica $\\sec^2 x$, porque a secante é o inverso do cosseno. Ou seja:\n\n$$1 + \\tan^2 x = \\sec^2 x$$\n\nDividindo tudo por $\\sin^2 x$, com $\\sin x \\neq 0$, o mesmo movimento produz a cotangente e a cossecante:\n\n$$1 + \\cot^2 x = \\csc^2 x$$\n\nAs restrições não são enfeite. A identidade $1 + \\tan^2 x = \\sec^2 x$ só faz sentido onde tangente e secante existem, isto é, fora de $90^\\circ$, $270^\\circ$ e dos arcos côngruos a esses. A outra exige $\\sin x \\neq 0$, ou seja, fora de $0^\\circ$ e $180^\\circ$.",
                    },
                    {
                        type: "text",
                        value: "## O uso prático: do seno para o cosseno\n\nIsolando o cosseno na fundamental, $\\cos^2 x = 1 - \\sin^2 x$, e daí\n\n$$\\cos x = \\pm\\sqrt{1 - \\sin^2 x}$$\n\nO $\\pm$ está aí porque extrair a raiz de $\\cos^2 x$ devolve duas possibilidades, e a conta sozinha não sabe qual delas é a certa. **Quem decide o sinal é o quadrante do arco**, lido no ciclo:\n\n| Quadrante | $\\sin x$ | $\\cos x$ | $\\tan x$ |\n| --- | --- | --- | --- |\n| 1º | positivo | positivo | positivo |\n| 2º | positivo | negativo | negativo |\n| 3º | negativo | negativo | positivo |\n| 4º | negativo | positivo | negativo |\n\nO roteiro tem três passos, nessa ordem: eleve ao quadrado e isole, extraia a raiz com o $\\pm$, e só então olhe o quadrante para escolher um dos dois sinais. Pular o terceiro passo é entregar meia resposta.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: arco do segundo quadrante\n\nUm arco $x$ do segundo quadrante tem $\\sin x = \\frac{3}{5}$. Qual é o cosseno?\n\n$$\\cos^2 x = 1 - \\left(\\frac{3}{5}\\right)^2 = 1 - \\frac{9}{25} = \\frac{16}{25}$$\n\nLogo $\\cos x = \\pm\\frac{4}{5}$. No segundo quadrante o cosseno é negativo, então $\\cos x = -\\frac{4}{5}$.\n\nCom os dois valores na mão, a tangente sai de graça:\n\n$$\\tan x = \\frac{\\sin x}{\\cos x} = \\frac{3/5}{-4/5} = -\\frac{3}{4}$$\n\nE o sinal confere com a tabela: tangente negativa no segundo quadrante.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: arco do terceiro quadrante\n\nAgora $\\cos x = -\\frac{12}{13}$ e $x$ está no terceiro quadrante. Qual é o seno?\n\n$$\\sin^2 x = 1 - \\left(-\\frac{12}{13}\\right)^2 = 1 - \\frac{144}{169} = \\frac{25}{169}$$\n\nDaí $\\sin x = \\pm\\frac{5}{13}$, e no terceiro quadrante o seno é negativo: $\\sin x = -\\frac{5}{13}$.\n\nRepare que o sinal do dado de entrada não se repassa para a resposta por simpatia. O cosseno era negativo, e o seno também é, mas não porque o cosseno era: é porque o arco está no terceiro quadrante. A tangente, aliás, sai positiva:\n\n$$\\tan x = \\frac{-5/13}{-12/13} = \\frac{5}{12}$$\n\ncom os dois sinais se cancelando. E a secante, que é o inverso do cosseno, vale $-\\frac{13}{12}$.",
                    },
                    {
                        type: "text",
                        value: "## O erro que mais cai: esquecer o sinal\n\nA conta da relação fundamental é curta, e é justamente por isso que o erro aparece. Quem resolve no automático escreve $\\cos x = \\sqrt{1 - \\sin^2 x}$ sem o $\\pm$, acha $\\frac{4}{5}$ no Exemplo 1 e entrega um cosseno positivo para um arco do segundo quadrante, onde ele não pode ser positivo.\n\nTrês sintomas de que o sinal escapou:\n\n- o enunciado informou o quadrante e o quadrante não foi usado em momento nenhum;\n- a resposta saiu com o mesmo sinal do dado de entrada sem que ninguém tenha verificado isso;\n- o seno ou o cosseno achado passou de $1$ em módulo, o que é impossível, já que o ponto vive num ciclo de raio $1$.\n\nUma conferência rápida que custa poucos segundos: substitua os dois valores em $\\sin^2 x + \\cos^2 x$ e veja se dá $1$. Com $\\frac{3}{5}$ e $-\\frac{4}{5}$: $\\frac{9}{25} + \\frac{16}{25} = 1$. Mas atenção ao limite dessa conferência: ela pega erro de conta e não pega erro de sinal, porque o quadrado apaga o sinal justamente. Para o sinal, só o quadrante decide.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- A relação fundamental é $\\sin^2 x + \\cos^2 x = 1$, e vem de Pitágoras no ciclo de raio $1$.\n- Dividindo por $\\cos^2 x$ sai $1 + \\tan^2 x = \\sec^2 x$; dividindo por $\\sin^2 x$ sai $1 + \\cot^2 x = \\csc^2 x$.\n- Dado o seno, o cosseno fica determinado a menos do sinal: $\\cos x = \\pm\\sqrt{1 - \\sin^2 x}$.\n- O $\\pm$ se resolve pelo quadrante do arco, nunca pelo sinal do dado de entrada.",
                    },
                    {
                        type: "quote",
                        value: "A relação fundamental entrega o valor, e o quadrante entrega o sinal. Quem usa só a primeira metade acerta o número e erra a resposta.",
                    },
                ],
                questions: [
                    {
                        statement: "Um arco $x$ do primeiro quadrante tem $\\sin x = \\frac{4}{5}$. Quanto vale $\\cos x$?",
                        difficulty: "facil",
                        options: [
                            { text: "$-\\frac{3}{5}$", isCorrect: false },
                            { text: "$\\frac{1}{5}$", isCorrect: false },
                            { text: "$\\frac{3}{5}$", isCorrect: true },
                            { text: "$\\frac{9}{25}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Dividindo os dois lados de $\\sin^2 x + \\cos^2 x = 1$ por $\\cos^2 x$, qual identidade aparece?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\tan^2 x + \\sec^2 x = 1$", isCorrect: false },
                            { text: "$1 + \\cot^2 x = \\csc^2 x$", isCorrect: false },
                            { text: "$1 + \\tan^2 x = \\csc^2 x$", isCorrect: false },
                            { text: "$1 + \\tan^2 x = \\sec^2 x$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um arco $x$ do terceiro quadrante tem $\\sin x = -\\frac{3}{5}$. Quanto vale $\\cos x$?",
                        difficulty: "medio",
                        options: [
                            { text: "$-\\frac{4}{5}$", isCorrect: true },
                            { text: "$\\frac{4}{5}$", isCorrect: false },
                            { text: "$\\frac{16}{25}$", isCorrect: false },
                            { text: "$-\\frac{3}{4}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um arco $x$ do primeiro quadrante tem $\\tan x = 2$. Quanto vale $\\sec x$?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\sqrt{3}$", isCorrect: false },
                            { text: "$-\\sqrt{5}$", isCorrect: false },
                            { text: "$\\sqrt{5}$", isCorrect: true },
                            { text: "$\\frac{\\sqrt{5}}{2}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um arco $x$ do segundo quadrante tem $\\cos x = -\\frac{4}{5}$. Quanto vale $\\sin x + \\tan x$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$-\\frac{27}{20}$", isCorrect: false },
                            { text: "$\\frac{27}{20}$", isCorrect: false },
                            { text: "$\\frac{3}{20}$", isCorrect: false },
                            { text: "$-\\frac{3}{20}$", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Seno e cosseno da soma e da diferença de arcos",
                blocks: [
                    {
                        type: "text",
                        value: "# Seno e cosseno da soma e da diferença de arcos\n\n$75^\\circ$ não é arco notável, e por isso não aparece em nenhuma das tabelas que se decoram. Mas $75^\\circ = 45^\\circ + 30^\\circ$, e esses dois pedaços são notáveis. Se existisse uma regra para o seno de uma soma, o valor exato de $\\sin 75^\\circ$ sairia sem tabela e sem calculadora.\n\nEssa regra existe, e é a ferramenta mais usada de toda a trigonometria depois da relação fundamental. O que ela não é, e é aí que mora o erro desta aula, é uma distributiva.",
                    },
                    {
                        type: "text",
                        value: "## As quatro fórmulas\n\nPara quaisquer arcos $a$ e $b$:\n\n$$\\sin(a + b) = \\sin a \\cos b + \\cos a \\sin b$$\n\n$$\\sin(a - b) = \\sin a \\cos b - \\cos a \\sin b$$\n\n$$\\cos(a + b) = \\cos a \\cos b - \\sin a \\sin b$$\n\n$$\\cos(a - b) = \\cos a \\cos b + \\sin a \\sin b$$\n\nSão quatro, mas na prática duas, porque a de diferença é a de soma com o sinal do meio trocado. E há um padrão que vale decorar junto, porque é ele que evita a confusão:\n\n- no **seno**, os termos são cruzados (seno de um com cosseno do outro) e o sinal do meio **acompanha** o sinal do arco: soma dá mais, diferença dá menos;\n- no **cosseno**, os termos são casados (cosseno com cosseno, seno com seno) e o sinal do meio **inverte**: soma dá menos, diferença dá mais.\n\nEm forma compacta, com o sinal de cima para a soma e o de baixo para a diferença:\n\n$$\\cos(a \\pm b) = \\cos a \\cos b \\mp \\sin a \\sin b$$\n\nO cosseno inverter o sinal é a parte que mais escapa, e vale repetir em voz alta até virar reflexo: cosseno da soma leva menos.",
                    },
                    {
                        type: "text",
                        value: "## O erro clássico: o seno da soma não é a soma dos senos\n\nA tentação é escrever $\\sin(a + b) = \\sin a + \\sin b$, por analogia com a distributiva da multiplicação. Isso é falso, e um único exemplo numérico derruba a ideia.\n\nTome $a = 30^\\circ$ e $b = 30^\\circ$. Pela esquerda:\n\n$$\\sin(30^\\circ + 30^\\circ) = \\sin 60^\\circ = \\frac{\\sqrt{3}}{2} \\approx 0{,}87$$\n\nPela direita:\n\n$$\\sin 30^\\circ + \\sin 30^\\circ = \\frac{1}{2} + \\frac{1}{2} = 1$$\n\nE $0{,}87$ não é $1$, portanto a igualdade não vale.\n\nHá um argumento ainda mais curto, que dispensa até a conta. Tome $a = b = 90^\\circ$. A soma dos senos daria $1 + 1 = 2$, e nenhum seno chega a $2$: o seno vive entre $-1$ e $1$. Ou seja, $\\sin a + \\sin b$ pode sair fora do alcance do seno, enquanto $\\sin(a + b)$ nunca sai. São objetos diferentes.\n\nA razão de fundo é que $\\sin$ não é um fator multiplicando o parêntese, é o nome de uma função aplicada ao que está dentro dele. Pelo mesmo motivo, $\\cos(a + b)$ não é $\\cos a + \\cos b$, e $\\tan(a + b)$ não é $\\tan a + \\tan b$.",
                    },
                    {
                        type: "text",
                        value: "## Valor exato do seno e do cosseno de 75 graus\n\nEscrevendo $75^\\circ = 45^\\circ + 30^\\circ$ e usando a fórmula da soma:\n\n$$\\sin 75^\\circ = \\sin 45^\\circ \\cos 30^\\circ + \\cos 45^\\circ \\sin 30^\\circ$$\n\n$$\\sin 75^\\circ = \\frac{\\sqrt{2}}{2} \\cdot \\frac{\\sqrt{3}}{2} + \\frac{\\sqrt{2}}{2} \\cdot \\frac{1}{2} = \\frac{\\sqrt{6}}{4} + \\frac{\\sqrt{2}}{4} = \\frac{\\sqrt{6} + \\sqrt{2}}{4}$$\n\nPara o cosseno, a fórmula da soma inverte o sinal do meio:\n\n$$\\cos 75^\\circ = \\cos 45^\\circ \\cos 30^\\circ - \\sin 45^\\circ \\sin 30^\\circ = \\frac{\\sqrt{6}}{4} - \\frac{\\sqrt{2}}{4} = \\frac{\\sqrt{6} - \\sqrt{2}}{4}$$\n\nDuas conferências valem o tempo que custam. A primeira é de ordem de grandeza: $\\frac{\\sqrt{6} + \\sqrt{2}}{4} \\approx \\frac{2{,}45 + 1{,}41}{4} \\approx 0{,}97$, seno plausível para um arco perto de $90^\\circ$, enquanto $\\cos 75^\\circ \\approx 0{,}26$ é pequeno, como se espera. A segunda é a relação fundamental, que os dois valores têm que satisfazer, e satisfazem:\n\n$$\\frac{8 + 4\\sqrt{3}}{16} + \\frac{8 - 4\\sqrt{3}}{16} = \\frac{16}{16} = 1$$",
                    },
                    {
                        type: "text",
                        value: "## Valor exato do seno e do cosseno de 15 graus\n\nAgora $15^\\circ = 45^\\circ - 30^\\circ$, e entra a fórmula da diferença:\n\n$$\\sin 15^\\circ = \\sin 45^\\circ \\cos 30^\\circ - \\cos 45^\\circ \\sin 30^\\circ = \\frac{\\sqrt{6}}{4} - \\frac{\\sqrt{2}}{4} = \\frac{\\sqrt{6} - \\sqrt{2}}{4}$$\n\n$$\\cos 15^\\circ = \\cos 45^\\circ \\cos 30^\\circ + \\sin 45^\\circ \\sin 30^\\circ = \\frac{\\sqrt{6}}{4} + \\frac{\\sqrt{2}}{4} = \\frac{\\sqrt{6} + \\sqrt{2}}{4}$$\n\nCompare com a seção anterior: o seno de $15^\\circ$ deu o cosseno de $75^\\circ$, e o cosseno de $15^\\circ$ deu o seno de $75^\\circ$. Não é coincidência, e sim o fato de $15^\\circ$ e $75^\\circ$ serem arcos complementares, que somam $90^\\circ$. Essa troca entre seno e cosseno de arcos complementares é uma boa conferência: se a sua conta não respeitar isso, há erro em algum dos dois lados.\n\nRepare também que a única diferença entre as duas contas foi o sinal do meio. Trocar soma por diferença na hora errada é o jeito mais fácil de responder $\\sin 15^\\circ$ quando a questão pediu $\\sin 75^\\circ$: os dois valores estão ali, lado a lado, e só um sinal os separa.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: cosseno da diferença com seno e cosseno conhecidos\n\nNem sempre os arcos são notáveis. Muitas vezes o enunciado entrega seno e cosseno de cada um, e aí basta substituir. Sejam $a$ e $b$ dois arcos do primeiro quadrante com\n\n$$\\sin a = \\frac{3}{5}, \\quad \\cos a = \\frac{4}{5}, \\quad \\sin b = \\frac{5}{13}, \\quad \\cos b = \\frac{12}{13}$$\n\nPara $\\cos(a - b)$, a fórmula pede cosseno com cosseno **mais** seno com seno:\n\n$$\\cos(a - b) = \\frac{4}{5} \\cdot \\frac{12}{13} + \\frac{3}{5} \\cdot \\frac{5}{13} = \\frac{48}{65} + \\frac{15}{65} = \\frac{63}{65}$$\n\nO valor dá $\\frac{63}{65} \\approx 0{,}97$, perto de $1$, o que faz sentido: os dois arcos são próximos, então a diferença entre eles é um arco pequeno, e cosseno de arco pequeno fica perto de $1$.\n\nCom os mesmos dados sai todo o resto, e vale escrever os três restantes para ver como um sinal trocado muda a resposta por completo:\n\n$$\\cos(a + b) = \\frac{33}{65}, \\quad \\sin(a + b) = \\frac{56}{65}, \\quad \\sin(a - b) = \\frac{16}{65}$$\n\nQuatro resultados diferentes, todos com denominador $65$ e todos vindos dos mesmos quatro números. Por isso a leitura do enunciado importa tanto quanto a conta.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $\\sin(a \\pm b) = \\sin a \\cos b \\pm \\cos a \\sin b$: termos cruzados, e o sinal acompanha o do arco.\n- $\\cos(a \\pm b) = \\cos a \\cos b \\mp \\sin a \\sin b$: termos casados, e o sinal inverte.\n- $\\sin(a + b)$ não é $\\sin a + \\sin b$: com $a = b = 30^\\circ$, um lado dá $\\frac{\\sqrt{3}}{2}$ e o outro dá $1$.\n- Arco não notável que se escreve como soma ou diferença de notáveis tem valor exato: $\\sin 75^\\circ = \\frac{\\sqrt{6} + \\sqrt{2}}{4}$ e $\\sin 15^\\circ = \\frac{\\sqrt{6} - \\sqrt{2}}{4}$.",
                    },
                    {
                        type: "quote",
                        value: "Seno e cosseno de uma soma se calculam com quatro ingredientes, nunca com dois. No dia em que a conta parecer curta demais, é provável que a distributiva tenha entrado escondida.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a fórmula correta de $\\cos(a + b)$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\cos a \\cos b + \\sin a \\sin b$", isCorrect: false },
                            { text: "$\\sin a \\cos b + \\cos a \\sin b$", isCorrect: false },
                            { text: "$\\cos a \\cos b - \\cos a \\sin b$", isCorrect: false },
                            { text: "$\\cos a \\cos b - \\sin a \\sin b$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Com $a = 30^\\circ$ e $b = 30^\\circ$, quanto vale $\\sin(a + b)$ e quanto vale $\\sin a + \\sin b$, nessa ordem?",
                        difficulty: "facil",
                        options: [
                            { text: "$1$ e $\\frac{\\sqrt{3}}{2}$", isCorrect: false },
                            { text: "$\\frac{1}{2}$ e $1$", isCorrect: false },
                            { text: "$\\frac{\\sqrt{3}}{2}$ e $\\frac{\\sqrt{3}}{2}$", isCorrect: false },
                            { text: "$\\frac{\\sqrt{3}}{2}$ e $1$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual é o valor exato de $\\sin 75^\\circ$?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{\\sqrt{6}}{4}$", isCorrect: false },
                            { text: "$\\frac{\\sqrt{6} + \\sqrt{2}}{4}$", isCorrect: true },
                            { text: "$\\frac{\\sqrt{3} + 1}{4}$", isCorrect: false },
                            { text: "$\\frac{\\sqrt{6} - \\sqrt{2}}{4}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Dois arcos $a$ e $b$ do primeiro quadrante têm $\\sin a = \\frac{3}{5}$, $\\cos a = \\frac{4}{5}$, $\\sin b = \\frac{5}{13}$ e $\\cos b = \\frac{12}{13}$. Quanto vale $\\cos(a - b)$?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{16}{65}$", isCorrect: false },
                            { text: "$\\frac{63}{65}$", isCorrect: true },
                            { text: "$\\frac{56}{65}$", isCorrect: false },
                            { text: "$\\frac{33}{65}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um arco $a$ do segundo quadrante tem $\\sin a = \\frac{4}{5}$. Quanto vale $\\sin(a + 30^\\circ)$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\frac{4\\sqrt{3} + 3}{10}$", isCorrect: false },
                            { text: "$\\frac{4\\sqrt{3} - 3}{5}$", isCorrect: false },
                            { text: "$\\frac{4\\sqrt{3} - 3}{10}$", isCorrect: true },
                            { text: "$\\frac{4 - 3\\sqrt{3}}{10}$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Tangente da soma e da diferença",
                blocks: [
                    {
                        type: "text",
                        value: "# Tangente da soma e da diferença\n\nA tangente tem fórmula própria para soma e diferença, e é a única das três que não se parece com as outras: no lugar de uma soma de produtos, aparece uma fração com a soma no numerador e um produto no denominador.\n\n$$\\tan(a + b) = \\frac{\\tan a + \\tan b}{1 - \\tan a \\tan b}$$\n\n$$\\tan(a - b) = \\frac{\\tan a - \\tan b}{1 + \\tan a \\tan b}$$\n\nEm forma compacta, com o sinal de cima valendo para a soma e o de baixo para a diferença:\n\n$$\\tan(a \\pm b) = \\frac{\\tan a \\pm \\tan b}{1 \\mp \\tan a \\tan b}$$\n\nO sinal do numerador acompanha o do arco, e o do denominador é sempre o oposto. Essa fórmula tem uma aplicação geométrica direta, que fecha a aula: o ângulo entre duas retas.",
                    },
                    {
                        type: "text",
                        value: "## De onde a fórmula sai\n\nNão há nada a decorar aqui que já não esteja na aula anterior, porque a tangente é o quociente do seno pelo cosseno:\n\n$$\\tan(a + b) = \\frac{\\sin(a + b)}{\\cos(a + b)} = \\frac{\\sin a \\cos b + \\cos a \\sin b}{\\cos a \\cos b - \\sin a \\sin b}$$\n\nEssa fração já está correta, mas está escrita em seno e cosseno, e o que se quer são tangentes. O movimento é dividir numerador e denominador pelo mesmo número, $\\cos a \\cos b$, o que não altera o valor da fração:\n\n$$\\tan(a + b) = \\frac{\\frac{\\sin a \\cos b}{\\cos a \\cos b} + \\frac{\\cos a \\sin b}{\\cos a \\cos b}}{\\frac{\\cos a \\cos b}{\\cos a \\cos b} - \\frac{\\sin a \\sin b}{\\cos a \\cos b}}$$\n\nCortando o que repete em cada parcela, o primeiro termo de cima vira $\\tan a$, o segundo vira $\\tan b$, o primeiro de baixo vira $1$ e o segundo vira $\\tan a \\tan b$:\n\n$$\\tan(a + b) = \\frac{\\tan a + \\tan b}{1 - \\tan a \\tan b}$$\n\nA de diferença sai igual, trocando $b$ por $-b$ e lembrando que $\\tan(-b) = -\\tan b$.",
                    },
                    {
                        type: "text",
                        value: "## A condição de existência\n\nEssa fórmula tem letras miúdas, e é a única identidade do módulo que falha de verdade em certos casos. São duas condições:\n\n1. **Cada arco precisa ter tangente.** Se $a = 90^\\circ$, não existe $\\tan a$, e a fórmula não tem o que substituir. A tangente de um arco só existe quando o cosseno dele não é zero, isto é, fora de $90^\\circ$, $270^\\circ$ e dos arcos côngruos a esses.\n2. **O denominador não pode zerar.** Se $\\tan a \\tan b = 1$, então $1 - \\tan a \\tan b$ dá zero, e a divisão não existe.\n\nA segunda condição não é defeito da fórmula, é a fórmula dizendo a verdade. Tome $a = 60^\\circ$ e $b = 30^\\circ$:\n\n$$\\tan 60^\\circ \\cdot \\tan 30^\\circ = \\sqrt{3} \\cdot \\frac{\\sqrt{3}}{3} = 1$$\n\ne o denominador zera. Mas $a + b = 90^\\circ$, e $\\tan 90^\\circ$ realmente não existe. O denominador zerar é justamente o aviso de que a soma caiu num arco sem tangente.\n\nNa prática, então, denominador zero não se conserta: ele se interpreta. A resposta é \"não existe\", e foi a fórmula que contou.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: tangente de 75 graus\n\nCom $75^\\circ = 45^\\circ + 30^\\circ$, $\\tan 45^\\circ = 1$ e $\\tan 30^\\circ = \\frac{\\sqrt{3}}{3}$:\n\n$$\\tan 75^\\circ = \\frac{1 + \\frac{\\sqrt{3}}{3}}{1 - 1 \\cdot \\frac{\\sqrt{3}}{3}} = \\frac{\\frac{3 + \\sqrt{3}}{3}}{\\frac{3 - \\sqrt{3}}{3}} = \\frac{3 + \\sqrt{3}}{3 - \\sqrt{3}}$$\n\nA resposta já está certa, mas com raiz no denominador. Racionalizando, isto é, multiplicando numerador e denominador por $3 + \\sqrt{3}$:\n\n$$\\tan 75^\\circ = \\frac{(3 + \\sqrt{3})^2}{(3 - \\sqrt{3})(3 + \\sqrt{3})} = \\frac{9 + 6\\sqrt{3} + 3}{9 - 3} = \\frac{12 + 6\\sqrt{3}}{6} = 2 + \\sqrt{3}$$\n\nConferindo a ordem de grandeza: $2 + \\sqrt{3} \\approx 3{,}73$. Faz sentido, porque $75^\\circ$ está perto de $90^\\circ$, onde a tangente cresce sem limite, e já passou de $\\tan 60^\\circ = \\sqrt{3} \\approx 1{,}73$.\n\nA mesma conta com o sinal trocado dá a tangente de $15^\\circ$:\n\n$$\\tan 15^\\circ = \\frac{1 - \\frac{\\sqrt{3}}{3}}{1 + \\frac{\\sqrt{3}}{3}} = \\frac{3 - \\sqrt{3}}{3 + \\sqrt{3}} = 2 - \\sqrt{3} \\approx 0{,}27$$\n\nE repare numa conferência bonita: $(2 + \\sqrt{3})(2 - \\sqrt{3}) = 4 - 3 = 1$, ou seja, as tangentes de arcos complementares são inversas uma da outra.",
                    },
                    {
                        type: "text",
                        value: "## O ângulo entre duas retas\n\nAqui a fórmula da tangente deixa de ser conta e passa a resolver geometria. O coeficiente angular de uma reta é a tangente do ângulo que ela faz com o eixo horizontal: se a reta $r$ tem coeficiente $m_1$ e faz ângulo $\\alpha$ com o eixo, então $m_1 = \\tan \\alpha$, e o mesmo vale para a reta $s$, com $m_2 = \\tan \\beta$.\n\nO ângulo $\\theta$ entre as duas retas é a diferença entre esses dois ângulos, $\\theta = \\beta - \\alpha$. Aplicando a fórmula da diferença:\n\n$$\\tan \\theta = \\frac{\\tan \\beta - \\tan \\alpha}{1 + \\tan \\beta \\tan \\alpha} = \\frac{m_2 - m_1}{1 + m_1 m_2}$$\n\nDuas retas que se cruzam formam um par de ângulos agudos e um par de obtusos. Para ficar sempre com o agudo, que é o que se costuma pedir, basta tomar o módulo:\n\n$$\\tan \\theta = \\left| \\frac{m_2 - m_1}{1 + m_1 m_2} \\right|$$\n\nDois casos valem anotar. Se $m_1 = m_2$, o numerador zera, $\\tan \\theta = 0$ e as retas são paralelas. Se $1 + m_1 m_2 = 0$, o denominador zera, não há tangente, e o ângulo é de $90^\\circ$: é o caso das retas perpendiculares, em que $m_1 m_2 = -1$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: duas retas de inclinações conhecidas\n\nAs retas $r$ e $s$ têm coeficientes angulares $m_1 = \\frac{1}{2}$ e $m_2 = 3$. Qual é o ângulo agudo entre elas?\n\n$$\\tan \\theta = \\left| \\frac{3 - \\frac{1}{2}}{1 + \\frac{1}{2} \\cdot 3} \\right| = \\left| \\frac{\\frac{5}{2}}{\\frac{5}{2}} \\right| = 1$$\n\nTangente igual a $1$ e ângulo agudo dão $\\theta = 45^\\circ$.\n\nVale um segundo caso, com inclinações notáveis, para ver a fórmula se conferir sozinha. Se $m_1 = \\sqrt{3}$ e $m_2 = 1$, a reta $r$ faz $60^\\circ$ com o eixo e a reta $s$ faz $45^\\circ$, então o ângulo entre elas deveria ser $15^\\circ$. A fórmula confirma:\n\n$$\\tan \\theta = \\left| \\frac{1 - \\sqrt{3}}{1 + \\sqrt{3}} \\right| = \\frac{\\sqrt{3} - 1}{\\sqrt{3} + 1} = \\frac{(\\sqrt{3} - 1)^2}{2} = \\frac{4 - 2\\sqrt{3}}{2} = 2 - \\sqrt{3}$$\n\nE $2 - \\sqrt{3}$ é exatamente $\\tan 15^\\circ$, o valor calculado antes. A fórmula do ângulo entre retas e a fórmula da tangente da diferença são a mesma coisa vista de dois jeitos.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $\\tan(a \\pm b) = \\frac{\\tan a \\pm \\tan b}{1 \\mp \\tan a \\tan b}$, e o sinal de baixo é sempre o oposto do de cima.\n- A fórmula sai de dividir $\\sin(a + b)$ por $\\cos(a + b)$ e depois dividir tudo por $\\cos a \\cos b$.\n- Ela exige que cada arco tenha tangente e que $\\tan a \\tan b \\neq 1$; denominador zero avisa que a soma caiu em $90^\\circ$ ou num côngruo dele.\n- O ângulo agudo entre retas de coeficientes $m_1$ e $m_2$ sai de $\\tan \\theta = \\left| \\frac{m_2 - m_1}{1 + m_1 m_2} \\right|$, com perpendicularidade quando $m_1 m_2 = -1$.",
                    },
                    {
                        type: "quote",
                        value: "A tangente da soma não é a soma das tangentes, e o denominador dela não é enfeite: quando ele zera, a fórmula está avisando que o arco somado não tem tangente nenhuma.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a fórmula de $\\tan(a + b)$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{\\tan a + \\tan b}{1 - \\tan a \\tan b}$", isCorrect: true },
                            { text: "$\\frac{\\tan a + \\tan b}{1 + \\tan a \\tan b}$", isCorrect: false },
                            { text: "$\\frac{\\tan a - \\tan b}{1 - \\tan a \\tan b}$", isCorrect: false },
                            { text: "$\\frac{\\tan a + \\tan b}{\\tan a \\tan b - 1}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor exato de $\\tan 75^\\circ$?",
                        difficulty: "facil",
                        options: [
                            { text: "$2 + \\sqrt{3}$", isCorrect: true },
                            { text: "$2 - \\sqrt{3}$", isCorrect: false },
                            { text: "$\\sqrt{3}$", isCorrect: false },
                            { text: "$1 + \\frac{\\sqrt{3}}{3}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que a fórmula da tangente da soma não produz valor para $\\tan(60^\\circ + 30^\\circ)$?",
                        difficulty: "medio",
                        options: [
                            { text: "O denominador zera, pois $\\tan 60^\\circ \\tan 30^\\circ = 1$, e $90^\\circ$ não tem tangente", isCorrect: true },
                            { text: "A fórmula da soma só vale quando os dois arcos somados são agudos e iguais entre si", isCorrect: false },
                            { text: "Os arcos $60^\\circ$ e $30^\\circ$ não têm tangente definida, então nada pode ser substituído", isCorrect: false },
                            { text: "O numerador zera, pois $\\tan 60^\\circ + \\tan 30^\\circ = 0$, e a fração resulta em zero", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Duas retas têm coeficientes angulares $m_1 = \\sqrt{3}$ e $m_2 = 1$. Qual é o ângulo agudo entre elas?",
                        difficulty: "medio",
                        options: [
                            { text: "$15^\\circ$", isCorrect: true },
                            { text: "$45^\\circ$", isCorrect: false },
                            { text: "$30^\\circ$", isCorrect: false },
                            { text: "$75^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Os arcos $a$ e $b$ são do primeiro quadrante, com $\\tan a = 2$ e $\\tan b = 3$. Quanto vale $\\tan(a + b)$ e em que quadrante está $a + b$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$-1$, com $a + b$ no quarto quadrante", isCorrect: false },
                            { text: "$\\frac{5}{7}$, com $a + b$ no primeiro quadrante", isCorrect: false },
                            { text: "$5$, com $a + b$ no primeiro quadrante", isCorrect: false },
                            { text: "$-1$, com $a + b$ no segundo quadrante", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Arco duplo e arco metade",
                blocks: [
                    {
                        type: "text",
                        value: "# Arco duplo e arco metade\n\nAs fórmulas de soma da aula anterior ganham um caso particular muito usado: basta fazer $b = a$. O arco $a + a$ é o arco duplo $2a$, e a conta encurta, porque os dois arcos passam a ter o mesmo seno e o mesmo cosseno.\n\nO caminho de volta também existe, e é menos óbvio: a partir do cosseno de um arco, chegar ao seno e ao cosseno da metade dele. Aí aparece uma raiz quadrada e, com ela, um $\\pm$ que só o quadrante resolve.",
                    },
                    {
                        type: "text",
                        value: "## Seno do arco duplo\n\nNa fórmula $\\sin(a + b) = \\sin a \\cos b + \\cos a \\sin b$, troque $b$ por $a$:\n\n$$\\sin 2a = \\sin a \\cos a + \\cos a \\sin a = 2 \\sin a \\cos a$$\n\nOs dois termos ficaram iguais, e somar dois iguais é multiplicar por $2$. Daí o $2$ da fórmula, que não vem de dobrar o seno, e sim de duas parcelas idênticas se somando.\n\nExemplo rápido, com arco notável para conferir. Tome $a = 30^\\circ$:\n\n$$\\sin 60^\\circ = 2 \\sin 30^\\circ \\cos 30^\\circ = 2 \\cdot \\frac{1}{2} \\cdot \\frac{\\sqrt{3}}{2} = \\frac{\\sqrt{3}}{2}$$\n\nE $\\frac{\\sqrt{3}}{2}$ é mesmo o valor de $\\sin 60^\\circ$, o que a tabela dos notáveis confirma.",
                    },
                    {
                        type: "text",
                        value: "## As três formas do cosseno do arco duplo\n\nCom $b = a$ em $\\cos(a + b) = \\cos a \\cos b - \\sin a \\sin b$:\n\n$$\\cos 2a = \\cos^2 a - \\sin^2 a$$\n\nEssa é a forma de origem, e dela saem outras duas pela relação fundamental. Trocando $\\cos^2 a$ por $1 - \\sin^2 a$:\n\n$$\\cos 2a = (1 - \\sin^2 a) - \\sin^2 a = 1 - 2\\sin^2 a$$\n\nTrocando, em vez disso, $\\sin^2 a$ por $1 - \\cos^2 a$:\n\n$$\\cos 2a = \\cos^2 a - (1 - \\cos^2 a) = 2\\cos^2 a - 1$$\n\nAs três são a mesma identidade, e escolher bem economiza trabalho:\n\n| Forma | Quando é a mais útil |\n| --- | --- |\n| $\\cos^2 a - \\sin^2 a$ | quando o enunciado já deu seno **e** cosseno |\n| $1 - 2\\sin^2 a$ | quando só o **seno** é conhecido |\n| $2\\cos^2 a - 1$ | quando só o **cosseno** é conhecido |\n\nExemplo: se $\\sin a = \\frac{1}{4}$ e ninguém falou do cosseno, a segunda forma resolve sem precisar achar $\\cos a$:\n\n$$\\cos 2a = 1 - 2 \\cdot \\left(\\frac{1}{4}\\right)^2 = 1 - \\frac{2}{16} = 1 - \\frac{1}{8} = \\frac{7}{8}$$\n\nRepare que o quadrante de $a$ nem foi perguntado, e com razão: essa forma usa só $\\sin^2 a$, e o quadrado apaga o sinal. O cosseno do arco duplo sai igual para o arco do primeiro e para o do segundo quadrante que tenham o mesmo seno.",
                    },
                    {
                        type: "text",
                        value: "## Tangente do arco duplo\n\nMesma substituição em $\\tan(a + b) = \\frac{\\tan a + \\tan b}{1 - \\tan a \\tan b}$, com $b = a$:\n\n$$\\tan 2a = \\frac{\\tan a + \\tan a}{1 - \\tan a \\tan a} = \\frac{2\\tan a}{1 - \\tan^2 a}$$\n\nVale a mesma letra miúda da aula anterior: a fórmula pede que $\\tan a$ exista e que $\\tan^2 a \\neq 1$. Esse segundo caso acontece em $a = 45^\\circ$, por exemplo, e aí $2a = 90^\\circ$, que de fato não tem tangente.\n\nExemplo: se $\\tan a = \\frac{1}{3}$, então\n\n$$\\tan 2a = \\frac{2 \\cdot \\frac{1}{3}}{1 - \\frac{1}{9}} = \\frac{\\frac{2}{3}}{\\frac{8}{9}} = \\frac{2}{3} \\cdot \\frac{9}{8} = \\frac{3}{4}$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo com os três de uma vez\n\nUm arco $a$ do segundo quadrante tem $\\sin a = \\frac{3}{5}$. Vamos calcular $\\sin 2a$, $\\cos 2a$ e $\\tan 2a$.\n\nPrimeiro o cosseno de $a$, pela relação fundamental: $\\cos^2 a = 1 - \\frac{9}{25} = \\frac{16}{25}$, e no segundo quadrante o cosseno é negativo, então $\\cos a = -\\frac{4}{5}$.\n\n$$\\sin 2a = 2 \\cdot \\frac{3}{5} \\cdot \\left(-\\frac{4}{5}\\right) = -\\frac{24}{25}$$\n\n$$\\cos 2a = 1 - 2 \\cdot \\frac{9}{25} = 1 - \\frac{18}{25} = \\frac{7}{25}$$\n\n$$\\tan 2a = \\frac{\\sin 2a}{\\cos 2a} = \\frac{-24/25}{7/25} = -\\frac{24}{7}$$\n\nAgora a leitura do resultado, que é a parte que ensina. O arco $2a$ tem seno negativo e cosseno positivo, o que o põe no quarto quadrante. E confere: $a$ está no segundo quadrante, um pouco acima de $135^\\circ$, então $2a$ passou de $270^\\circ$ e ainda não completou a volta.\n\nMas note o ponto principal: dobrar um arco do segundo quadrante não cai no quarto por regra alguma. Não existe tabela de \"quadrante do dobro\". O quadrante de $2a$ se descobre pelos sinais de $\\sin 2a$ e $\\cos 2a$, depois de calculados.",
                    },
                    {
                        type: "text",
                        value: "## O arco metade e o sinal que o quadrante decide\n\nAs fórmulas do arco metade saem das do arco duplo, lidas de trás para frente. Em $\\cos 2a = 1 - 2\\sin^2 a$, isole o seno e depois chame $2a$ de $x$, de modo que $a = \\frac{x}{2}$:\n\n$$\\sin \\frac{x}{2} = \\pm\\sqrt{\\frac{1 - \\cos x}{2}}$$\n\nDe $\\cos 2a = 2\\cos^2 a - 1$, do mesmo jeito:\n\n$$\\cos \\frac{x}{2} = \\pm\\sqrt{\\frac{1 + \\cos x}{2}}$$\n\nE a tangente é o quociente das duas:\n\n$$\\tan \\frac{x}{2} = \\pm\\sqrt{\\frac{1 - \\cos x}{1 + \\cos x}}$$\n\nA diferença entre o seno e o cosseno é só o sinal de dentro da raiz: **menos** no seno, **mais** no cosseno. E o $\\pm$ de fora não é opcional nem decorativo: **quem o resolve é o quadrante de $\\frac{x}{2}$, não o de $x$**. Esse é o detalhe que derruba a maior parte das respostas.\n\nExemplo sem pegadinha, para fixar a fórmula. Com $x = 60^\\circ$, a metade é $30^\\circ$, que está no primeiro quadrante, onde o cosseno é positivo:\n\n$$\\cos 30^\\circ = \\sqrt{\\frac{1 + \\cos 60^\\circ}{2}} = \\sqrt{\\frac{1 + \\frac{1}{2}}{2}} = \\sqrt{\\frac{3}{4}} = \\frac{\\sqrt{3}}{2}$$\n\nAgora o exemplo que cobra o sinal. Seja $x = 240^\\circ$, com $\\cos x = -\\frac{1}{2}$. A metade é $120^\\circ$, que está no **segundo** quadrante, onde o cosseno é negativo:\n\n$$\\cos 120^\\circ = -\\sqrt{\\frac{1 + \\left(-\\frac{1}{2}\\right)}{2}} = -\\sqrt{\\frac{1}{4}} = -\\frac{1}{2}$$\n\nQuem não olhou o quadrante da metade responde $\\frac{1}{2}$, que é o valor certo com o sinal errado. E repare: $x = 240^\\circ$ está no terceiro quadrante enquanto $\\frac{x}{2} = 120^\\circ$ está no segundo, ou seja, o quadrante do arco original não serve de pista.",
                    },
                    {
                        type: "text",
                        value: "## O erro de escrever o dobro do seno\n\nO erro mais frequente deste assunto é escrever $\\sin 2a = 2 \\sin a$, cortando o cosseno. Ele acontece porque o $2$ da fórmula parece ser um fator multiplicando o seno, quando na verdade ele vem de duas parcelas iguais que se somaram.\n\nUm valor derruba a ideia. Com $a = 30^\\circ$:\n\n$$\\sin 2a = \\sin 60^\\circ = \\frac{\\sqrt{3}}{2} \\approx 0{,}87 \\qquad \\text{e} \\qquad 2 \\sin 30^\\circ = 2 \\cdot \\frac{1}{2} = 1$$\n\nOs dois não batem. E com $a = 90^\\circ$ a falha fica escandalosa: $\\sin 180^\\circ = 0$, enquanto $2 \\sin 90^\\circ = 2$, um número que nenhum seno alcança.\n\nA mesma advertência vale para as outras duas: $\\cos 2a$ não é $2 \\cos a$, e $\\tan 2a$ não é $2 \\tan a$. Dobrar o arco não dobra o valor da função, porque o arco mora dentro do parêntese, e multiplicar o resultado é outra operação.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $\\sin 2a = 2 \\sin a \\cos a$, e o $2$ vem de duas parcelas iguais, não de dobrar o seno.\n- $\\cos 2a$ tem três formas, $\\cos^2 a - \\sin^2 a$, $1 - 2\\sin^2 a$ e $2\\cos^2 a - 1$; escolha a que usa o dado que você tem.\n- $\\tan 2a = \\frac{2\\tan a}{1 - \\tan^2 a}$, com $\\tan^2 a \\neq 1$.\n- No arco metade, $\\sin \\frac{x}{2} = \\pm\\sqrt{\\frac{1 - \\cos x}{2}}$ e $\\cos \\frac{x}{2} = \\pm\\sqrt{\\frac{1 + \\cos x}{2}}$, e o sinal sai do quadrante de $\\frac{x}{2}$.",
                    },
                    {
                        type: "quote",
                        value: "Arco duplo é a fórmula da soma com os dois arcos iguais, e arco metade é a mesma fórmula lida de trás para frente. A novidade do caminho de volta é a raiz, e com ela o sinal, que só o quadrante da metade sabe dizer.",
                    },
                ],
                questions: [
                    {
                        statement: "A fórmula do seno do arco duplo, $\\sin 2a$, é igual a:",
                        difficulty: "facil",
                        options: [
                            { text: "$2\\sin a$", isCorrect: false },
                            { text: "$2\\sin a \\cos a$", isCorrect: true },
                            { text: "$\\cos^2 a - \\sin^2 a$", isCorrect: false },
                            { text: "$\\sin a \\cos a$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um arco $a$ tem $\\sin a = \\frac{1}{4}$. Usando a forma $\\cos 2a = 1 - 2\\sin^2 a$, quanto vale $\\cos 2a$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{1}{2}$", isCorrect: false },
                            { text: "$\\frac{15}{16}$", isCorrect: false },
                            { text: "$\\frac{7}{8}$", isCorrect: true },
                            { text: "$-\\frac{7}{8}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um arco $a$ do segundo quadrante tem $\\sin a = \\frac{3}{5}$. Quanto vale $\\sin 2a$?",
                        difficulty: "medio",
                        options: [
                            { text: "$-\\frac{12}{25}$", isCorrect: false },
                            { text: "$-\\frac{24}{25}$", isCorrect: true },
                            { text: "$\\frac{7}{25}$", isCorrect: false },
                            { text: "$\\frac{24}{25}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Usando a fórmula do arco metade com $x = 30^\\circ$, qual é o valor exato de $\\cos 15^\\circ$?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{\\sqrt{2 + \\sqrt{3}}}{2}$", isCorrect: true },
                            { text: "$-\\frac{\\sqrt{2 + \\sqrt{3}}}{2}$", isCorrect: false },
                            { text: "$\\frac{2 + \\sqrt{3}}{4}$", isCorrect: false },
                            { text: "$\\frac{\\sqrt{2 - \\sqrt{3}}}{2}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um arco $x$ do terceiro quadrante tem $\\cos x = -\\frac{1}{2}$, com $180^\\circ < x < 270^\\circ$. Quanto vale $\\cos \\frac{x}{2}$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$-\\frac{\\sqrt{3}}{2}$", isCorrect: false },
                            { text: "$\\frac{\\sqrt{3}}{2}$", isCorrect: false },
                            { text: "$-\\frac{1}{2}$", isCorrect: true },
                            { text: "$\\frac{1}{2}$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Simplificar expressão e provar identidade",
                blocks: [
                    {
                        type: "text",
                        value: "# Simplificar expressão e provar identidade\n\nAté aqui as identidades foram ferramenta: cada uma servia para calcular um valor. Nesta aula elas passam a ser o próprio objetivo. Dada uma expressão embolada, o trabalho é mostrar que ela é igual a outra, mais simples, e isso se faz com movimentos de álgebra guiados pelas identidades já conhecidas.\n\nO que muda não é a matemática, é o tipo de pergunta. Não se procura nenhum valor de $x$, e nenhuma resposta numérica aparece no fim. O que se produz é uma cadeia de igualdades válida para todo $x$ do domínio.",
                    },
                    {
                        type: "text",
                        value: "## A estratégia da casa, em três movimentos\n\nQuase toda simplificação sai com três movimentos, nessa ordem.\n\n**1. Passe tudo para seno e cosseno.** Tangente, cotangente, secante e cossecante são todas quocientes:\n\n$$\\tan x = \\frac{\\sin x}{\\cos x}, \\quad \\cot x = \\frac{\\cos x}{\\sin x}, \\quad \\sec x = \\frac{1}{\\cos x}, \\quad \\csc x = \\frac{1}{\\sin x}$$\n\nCom tudo em duas funções em vez de seis, o que era uma expressão trigonométrica vira uma expressão algébrica comum, e as ferramentas de fração e de fatoração voltam a funcionar.\n\n**2. Fatore.** Fator comum, diferença de quadrados, quadrado da soma. É aqui que um $\\sin x$ repetido sai para fora do parêntese e que um $1 - \\cos^2 x$ se revela um produto.\n\n**3. Use a relação fundamental para fechar.** Ela serve nas duas direções, conforme interessar:\n\n$$1 - \\sin^2 x = \\cos^2 x, \\qquad 1 - \\cos^2 x = \\sin^2 x, \\qquad \\sin^2 x + \\cos^2 x = 1$$\n\nExemplo com os três movimentos de uma vez:\n\n$$\\frac{\\sin^3 x + \\sin x \\cos^2 x}{\\sin x}$$\n\nFatorando $\\sin x$ no numerador, fica $\\frac{\\sin x (\\sin^2 x + \\cos^2 x)}{\\sin x}$. O $\\sin x$ corta, desde que $\\sin x \\neq 0$, e sobra $\\sin^2 x + \\cos^2 x$, que é $1$. A expressão toda vale $1$, qualquer que seja o $x$ do domínio.",
                    },
                    {
                        type: "text",
                        value: "## Provar identidade não é resolver equação\n\nOs dois enunciados se parecem na aparência, porque ambos trazem um sinal de igual e um $x$. São tarefas opostas.\n\n| Aspecto | Equação | Identidade |\n| --- | --- | --- |\n| A igualdade é | verdadeira só para certos $x$ | verdadeira para todo $x$ do domínio |\n| O que se procura | o valor de $x$ | nada, o fim já é conhecido |\n| O resultado | um conjunto de soluções | uma cadeia de igualdades |\n| Supor a igualdade | pode, ela é o dado | não pode, ela é o que falta mostrar |\n\nEm $\\sin x = \\frac{1}{2}$, a igualdade é falsa para quase todo $x$ e verdadeira para alguns, que é justamente o que se quer achar. Em $\\sin^2 x + \\cos^2 x = 1$, a igualdade nunca falha, e não há nada para achar.\n\nDaí sai o método: **para provar uma identidade, escolha um lado e trabalhe só nele até ele virar o outro**. Em geral vale começar pelo lado mais complicado, que é onde há o que simplificar. Cada passo da conta é uma reescrita do mesmo valor, nunca uma operação feita nos dois lados ao mesmo tempo.",
                    },
                    {
                        type: "text",
                        value: "## Demonstração 1: dois quadrados que somam constante\n\nProvar que, para todo $x$ real,\n\n$$(\\sin x + \\cos x)^2 + (\\sin x - \\cos x)^2 = 2$$\n\nComeçando pelo lado esquerdo, que é o complicado, e abrindo os dois quadrados:\n\n$$(\\sin^2 x + 2\\sin x \\cos x + \\cos^2 x) + (\\sin^2 x - 2\\sin x \\cos x + \\cos^2 x)$$\n\nOs termos $2\\sin x \\cos x$ aparecem com sinais opostos e se cancelam, e sobra\n\n$$2\\sin^2 x + 2\\cos^2 x = 2(\\sin^2 x + \\cos^2 x) = 2 \\cdot 1 = 2$$\n\nque é o lado direito. Identidade provada, e o domínio é todo o conjunto dos reais, porque em nenhum momento houve divisão.\n\nVale uma conferência numérica, que não substitui a prova mas pega erro de conta: para um arco com $\\sin x = \\frac{3}{5}$ e $\\cos x = \\frac{4}{5}$, o lado esquerdo dá $\\left(\\frac{7}{5}\\right)^2 + \\left(-\\frac{1}{5}\\right)^2 = \\frac{49}{25} + \\frac{1}{25} = 2$.",
                    },
                    {
                        type: "text",
                        value: "## Demonstração 2: duas frações que viram uma\n\nProvar que, para $\\sin x \\neq 0$,\n\n$$\\frac{1}{1 + \\cos x} + \\frac{1}{1 - \\cos x} = \\frac{2}{\\sin^2 x}$$\n\nLado esquerdo, somando as frações com denominador comum $(1 + \\cos x)(1 - \\cos x)$:\n\n$$\\frac{(1 - \\cos x) + (1 + \\cos x)}{(1 + \\cos x)(1 - \\cos x)} = \\frac{2}{1 - \\cos^2 x}$$\n\nO numerador fechou em $2$, porque os cossenos se cancelaram, e o denominador é uma diferença de quadrados. Agora entra a relação fundamental, na direção $1 - \\cos^2 x = \\sin^2 x$:\n\n$$\\frac{2}{1 - \\cos^2 x} = \\frac{2}{\\sin^2 x}$$\n\nque é o lado direito. A restrição $\\sin x \\neq 0$ não é detalhe burocrático: ela exclui $0^\\circ$, $180^\\circ$ e os côngruos deles, onde as frações originais perdem sentido. Identidade vale no domínio, e dizer qual é o domínio faz parte da prova.",
                    },
                    {
                        type: "text",
                        value: "## Demonstração 3: quando o atalho é multiplicar pelo conjugado\n\nProvar que, para $\\cos x \\neq 0$,\n\n$$\\frac{\\cos x}{1 - \\sin x} = \\sec x + \\tan x$$\n\nO lado direito já está quase em seno e cosseno, então vale traduzi-lo primeiro, para saber onde se quer chegar:\n\n$$\\sec x + \\tan x = \\frac{1}{\\cos x} + \\frac{\\sin x}{\\cos x} = \\frac{1 + \\sin x}{\\cos x}$$\n\nAgora o lado esquerdo. Fatorar não leva a nada aqui, porque $1 - \\sin x$ não é diferença de quadrados. O movimento que destrava é multiplicar numerador e denominador por $1 + \\sin x$, o conjugado do denominador, o que não altera o valor da fração:\n\n$$\\frac{\\cos x}{1 - \\sin x} = \\frac{\\cos x (1 + \\sin x)}{(1 - \\sin x)(1 + \\sin x)} = \\frac{\\cos x (1 + \\sin x)}{1 - \\sin^2 x}$$\n\nO conjugado serviu exatamente para fabricar o $1 - \\sin^2 x$, que a relação fundamental troca por $\\cos^2 x$:\n\n$$\\frac{\\cos x (1 + \\sin x)}{\\cos^2 x} = \\frac{1 + \\sin x}{\\cos x}$$\n\nOs dois lados chegaram à mesma expressão, e a identidade está provada. Trabalhar cada lado separadamente até os dois caírem numa terceira expressão comum é tão legítimo quanto levar um lado até o outro: o que não se pode é operar atravessando o sinal de igual, e isso não aconteceu em nenhum dos dois cálculos.\n\nGuarde o movimento: quando aparece $1 - \\sin x$ ou $1 + \\cos x$ num denominador, o conjugado quase sempre é o caminho, porque ele fabrica o quadrado que a relação fundamental sabe trocar.",
                    },
                    {
                        type: "text",
                        value: "## O erro de passar para o outro lado\n\nDiante de \"prove que $\\frac{\\cos x}{1 - \\sin x} = \\sec x + \\tan x$\", é comum ver a conta começar assim: multiplica os dois lados por $1 - \\sin x$, passa o $\\sec x$ para a esquerda, e segue mexendo na igualdade como se fosse uma equação. No fim aparece algo como $1 = 1$, e vem a conclusão de que está provado.\n\nO problema não é a álgebra, é a lógica. Mexer nos dois lados ao mesmo tempo só é legítimo quando a igualdade já é um dado, que é o caso da equação. Numa identidade, a igualdade é a conclusão, e usá-la como ponto de partida é supor verdadeiro aquilo que se quer demonstrar.\n\nQue isso não vale como prova fica claro num exemplo que dá errado de propósito. Suponha que alguém queira \"provar\" a falsidade $\\sin x = -\\sin x$. Elevando os dois lados ao quadrado, chega-se a $\\sin^2 x = \\sin^2 x$, uma verdade. Mas a igualdade de partida é falsa para quase todo $x$: a conta chegou numa verdade sem provar nada, porque elevar ao quadrado perdeu o sinal pelo caminho.\n\nA regra prática é simples. Numa demonstração, só um lado se move por vez, e nenhuma operação atravessa o sinal de igual. Se os dois lados forem trabalhados, cada um é trabalhado por conta própria, até os dois caírem na mesma expressão.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Simplificar é passar tudo para seno e cosseno, fatorar, e fechar com a relação fundamental.\n- A relação fundamental serve nas duas direções: $1 - \\sin^2 x = \\cos^2 x$ e $1 - \\cos^2 x = \\sin^2 x$.\n- Identidade vale para todo $x$ do domínio e não tem nada a achar; equação vale só para certos $x$, e são esses $x$ a resposta.\n- Prova-se trabalhando um lado por vez, sem nenhuma operação atravessando o sinal de igual.\n- Denominador com $1 - \\sin x$ ou $1 + \\cos x$ pede o conjugado, que fabrica o quadrado que a relação fundamental troca.",
                    },
                    {
                        type: "quote",
                        value: "Numa equação a igualdade é o dado, e numa identidade ela é a conclusão. Essa única diferença é o que separa uma demonstração correta de uma conta que anda em círculo.",
                    },
                ],
                questions: [
                    {
                        statement: "Para $\\cos x \\neq 0$, a expressão $\\frac{1 - \\sin^2 x}{\\cos x}$ simplifica para:",
                        difficulty: "facil",
                        options: [
                            { text: "$\\cos x$", isCorrect: true },
                            { text: "$\\frac{1}{\\cos x}$", isCorrect: false },
                            { text: "$\\sin x$", isCorrect: false },
                            { text: "$\\cos^2 x$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a diferença entre provar uma identidade e resolver uma equação trigonométrica?",
                        difficulty: "facil",
                        options: [
                            { text: "A identidade só admite seno e cosseno, enquanto a equação aceita qualquer função trigonométrica", isCorrect: false },
                            { text: "A identidade vale para todo $x$ do domínio; a equação vale só para certos $x$, que são a resposta", isCorrect: true },
                            { text: "A equação vale para todo $x$ do domínio; a identidade vale só para certos $x$, que são a resposta", isCorrect: false },
                            { text: "Não há diferença de fundo, porque as duas pedem o valor de $x$ que torna a igualdade verdadeira", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para $\\sin x \\neq 0$, a expressão $\\frac{\\sin^2 x - \\sin^4 x}{\\sin^2 x}$ simplifica para:",
                        difficulty: "medio",
                        options: [
                            { text: "$\\sin^2 x$", isCorrect: false },
                            { text: "$\\cos^2 x$", isCorrect: true },
                            { text: "$1 - \\sin^4 x$", isCorrect: false },
                            { text: "$\\cos^4 x$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa demonstração de identidade, qual destes movimentos não é permitido?",
                        difficulty: "medio",
                        options: [
                            { text: "Abrir o quadrado de uma soma no lado esquerdo e deixar o lado direito como estava", isCorrect: false },
                            { text: "Multiplicar numerador e denominador de uma fração pelo conjugado do denominador", isCorrect: false },
                            { text: "Trocar $1 - \\cos^2 x$ por $\\sin^2 x$ dentro de um dos lados, sem tocar no outro lado", isCorrect: false },
                            { text: "Multiplicar os dois lados pelo mesmo fator, supondo verdadeira a igualdade a provar", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual movimento destrava a prova de que $\\frac{\\cos x}{1 - \\sin x} = \\sec x + \\tan x$?",
                        difficulty: "dificil",
                        options: [
                            { text: "Multiplicar numerador e denominador por $1 + \\sin x$ e usar $1 - \\sin^2 x = \\cos^2 x$", isCorrect: true },
                            { text: "Multiplicar numerador e denominador por $1 - \\sin x$ e usar $1 + \\sin^2 x = \\cos^2 x$", isCorrect: false },
                            { text: "Trocar $\\cos x$ por $1 - \\sin^2 x$ no numerador e cortar com o denominador da fração", isCorrect: false },
                            { text: "Passar $1 - \\sin x$ multiplicando para o lado direito e cancelar o $\\cos x$ dos dois lados", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Equações e inequações trigonométricas",
        aulas: [
            {
                titulo: "Equações com seno: a volta e a solução geral",
                blocks: [
                    {
                        type: "text",
                        value: "## Uma equação com infinitas respostas\n\nResolver $2x + 1 = 5$ dá uma resposta só, $x = 2$. Resolver $\\sin x = \\frac{1}{2}$ é outra história. No ciclo, o seno de um arco é a ordenada do ponto onde o arco termina, ou seja, a altura desse ponto. Perguntar quais arcos têm seno $\\frac{1}{2}$ é perguntar quais pontos do ciclo estão na altura $\\frac{1}{2}$.\n\nOlhando o desenho, são dois pontos nessa altura, não um. E como somar uma volta inteira não muda o ponto de chegada, cada um deles vira uma família infinita de arcos. Daí a pergunta que toda questão do assunto precisa responder: a solução é pedida em qual intervalo?",
                    },
                    {
                        type: "text",
                        value: "## Por que duas soluções em uma volta\n\nMarcar a altura $a$ no ciclo é traçar a reta horizontal daquela altura. Quando $-1 < a < 1$ e $a \\neq 0$, essa reta corta a circunferência em dois pontos distintos, simétricos em relação ao eixo vertical. Os dois arcos que terminam nesses pontos têm o mesmo seno, e é essa a razão de $\\sin x = a$ ter duas soluções em uma volta.\n\nSe um deles é $x_0$, o outro é o suplementar $\\pi - x_0$. Com $a > 0$, um cai no 1º quadrante e o outro no 2º. Com $a < 0$, um cai no 3º e o outro no 4º. Em todos os casos a dupla é $x_0$ e $\\pi - x_0$, com a ressalva de trocar o segundo por um arco côngruo quando ele cair fora do intervalo pedido.",
                    },
                    {
                        type: "text",
                        value: "## Quando não existe solução\n\nA imagem da função seno é $[-1, 1]$: nenhum ponto do ciclo tem altura maior que $1$ nem menor que $-1$. Antes de procurar quadrante, olhe o valor.\n\n$$\\sin x = a \\ \\text{ tem solução} \\iff -1 \\le a \\le 1$$\n\nPor isso $\\sin x = \\frac{5}{4}$ e $2\\sin x = 3$ têm conjunto solução vazio, e dizer isso já é a resposta completa. A reta da altura $\\frac{5}{4}$ passa acima do ciclo e não o encontra em lugar nenhum.",
                    },
                    {
                        type: "text",
                        value: "## Do intervalo para a solução geral\n\nResolva primeiro em $[0, 2\\pi)$, que é uma volta. Depois, para escrever todos os arcos reais que servem, some as voltas completas a cada solução encontrada. Se $x_0$ resolve $\\sin x = a$, a solução geral é\n\n$$x = x_0 + 2k\\pi \\quad \\text{ou} \\quad x = \\pi - x_0 + 2k\\pi, \\quad k \\in \\mathbb{Z}$$\n\nO $k$ varre os inteiros, positivos e negativos: $k = 0$ devolve a volta de referência, $k = 1$ a volta seguinte, $k = -1$ a anterior. São duas famílias porque são dois pontos no ciclo, e escrever só a primeira é o deslize mais comum do assunto.",
                    },
                    {
                        type: "text",
                        value: "## Os três casos de borda\n\nQuando a reta horizontal tangencia o ciclo, os dois pontos viram um só:\n\n- $\\sin x = 1$: a reta toca o ciclo apenas no topo. Em $[0, 2\\pi)$ a única solução é $x = \\frac{\\pi}{2}$, e a geral é $x = \\frac{\\pi}{2} + 2k\\pi$. A fórmula confirma, porque $\\pi - \\frac{\\pi}{2} = \\frac{\\pi}{2}$ devolve a mesma solução.\n- $\\sin x = -1$: só o ponto de baixo. Em $[0, 2\\pi)$, $x = \\frac{3\\pi}{2}$, e a geral é $x = \\frac{3\\pi}{2} + 2k\\pi$.\n- $\\sin x = 0$: aqui são dois pontos, $x = 0$ e $x = \\pi$, mas eles distam $\\pi$ um do outro. As duas famílias $2k\\pi$ e $\\pi + 2k\\pi$ se juntam numa só, $x = k\\pi$, com $k \\in \\mathbb{Z}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: $2\\sin x = \\sqrt{3}$\n\nPrimeiro isole o seno:\n\n$$\\sin x = \\frac{\\sqrt{3}}{2}$$\n\nO valor está entre $-1$ e $1$, então há solução, e é positivo, então os dois pontos ficam acima do eixo horizontal, no 1º e no 2º quadrantes. O arco notável de seno $\\frac{\\sqrt{3}}{2}$ é $x_0 = \\frac{\\pi}{3}$, e o suplementar é $\\pi - \\frac{\\pi}{3} = \\frac{2\\pi}{3}$. Em $[0, 2\\pi)$:\n\n$$x = \\frac{\\pi}{3} \\quad \\text{ou} \\quad x = \\frac{2\\pi}{3}$$\n\nA solução geral, em $\\mathbb{R}$, é $x = \\frac{\\pi}{3} + 2k\\pi$ ou $x = \\frac{2\\pi}{3} + 2k\\pi$, com $k \\in \\mathbb{Z}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: $\\sin x = -\\frac{1}{2}$\n\nO valor é negativo, logo os dois pontos estão abaixo do eixo horizontal, no 3º e no 4º quadrantes. O arco cujo seno vale $\\frac{1}{2}$ é $\\frac{\\pi}{6}$, e ele serve de referência. No 3º quadrante, $x = \\pi + \\frac{\\pi}{6} = \\frac{7\\pi}{6}$. No 4º, $x = 2\\pi - \\frac{\\pi}{6} = \\frac{11\\pi}{6}$. Conferindo o primeiro: $\\sin \\frac{7\\pi}{6} = -\\sin \\frac{\\pi}{6} = -\\frac{1}{2}$.\n\nA solução geral fica $x = \\frac{7\\pi}{6} + 2k\\pi$ ou $x = \\frac{11\\pi}{6} + 2k\\pi$, com $k \\in \\mathbb{Z}$. A fórmula do suplementar dá o mesmo resultado, porque $\\pi - \\frac{7\\pi}{6} = -\\frac{\\pi}{6}$, que é côngruo a $\\frac{11\\pi}{6}$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $\\sin x = a$ só tem solução se $-1 \\le a \\le 1$.\n- Com $-1 < a < 1$ e $a \\neq 0$, são duas soluções por volta: $x_0$ e $\\pi - x_0$.\n- A solução geral é $x = x_0 + 2k\\pi$ ou $x = \\pi - x_0 + 2k\\pi$, com $k \\in \\mathbb{Z}$.\n- Em $\\sin x = 1$ e $\\sin x = -1$ sobra uma solução por volta; em $\\sin x = 0$ as duas famílias se fundem em $x = k\\pi$.",
                    },
                    {
                        type: "quote",
                        value: "Antes de procurar quadrante, olhe o valor: fora de $[-1, 1]$ não há o que resolver. Dentro, conte duas soluções por volta e só considere a questão encerrada quando as duas estiverem escritas.",
                    },
                ],
                questions: [
                    {
                        statement: "No intervalo $[0, 2\\pi)$, quantas soluções tem a equação $\\sin x = \\frac{\\sqrt{3}}{2}$?",
                        difficulty: "facil",
                        options: [
                            { text: "duas", isCorrect: true },
                            { text: "nenhuma", isCorrect: false },
                            { text: "uma", isCorrect: false },
                            { text: "três", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em $\\mathbb{R}$, qual é o conjunto solução da equação $2\\sin x = 3$?",
                        difficulty: "facil",
                        options: [
                            { text: "$x = \\frac{3}{2} + 2k\\pi$, com $k \\in \\mathbb{Z}$", isCorrect: false },
                            { text: "todos os reais", isCorrect: false },
                            { text: "o conjunto vazio", isCorrect: true },
                            { text: "$x = \\frac{\\pi}{3} + 2k\\pi$, com $k \\in \\mathbb{Z}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "As soluções de $\\sin x = -\\frac{\\sqrt{2}}{2}$ no intervalo $[0, 2\\pi)$ são:",
                        difficulty: "medio",
                        options: [
                            { text: "$x = \\frac{7\\pi}{6}$ e $x = \\frac{11\\pi}{6}$", isCorrect: false },
                            { text: "$x = \\frac{3\\pi}{4}$ e $x = \\frac{5\\pi}{4}$", isCorrect: false },
                            { text: "$x = \\frac{\\pi}{4}$ e $x = \\frac{3\\pi}{4}$", isCorrect: false },
                            { text: "$x = \\frac{5\\pi}{4}$ e $x = \\frac{7\\pi}{4}$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual é a solução geral, em $\\mathbb{R}$, da equação $\\sin x = \\frac{1}{2}$, com $k \\in \\mathbb{Z}$?",
                        difficulty: "medio",
                        options: [
                            { text: "$x = \\frac{\\pi}{3} + 2k\\pi$ ou $x = \\frac{2\\pi}{3} + 2k\\pi$", isCorrect: false },
                            { text: "$x = \\pm\\frac{\\pi}{6} + 2k\\pi$", isCorrect: false },
                            { text: "$x = \\frac{\\pi}{6} + k\\pi$", isCorrect: false },
                            { text: "$x = \\frac{\\pi}{6} + 2k\\pi$ ou $x = \\frac{5\\pi}{6} + 2k\\pi$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Para quais valores reais de $m$ a equação $\\sin x = 2m - 1$ tem solução em $\\mathbb{R}$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$-\\frac{1}{2} \\le m \\le \\frac{1}{2}$", isCorrect: false },
                            { text: "$0 \\le m \\le 2$", isCorrect: false },
                            { text: "$0 \\le m \\le 1$", isCorrect: true },
                            { text: "$-1 \\le m \\le 1$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Equações com cosseno e com tangente",
                blocks: [
                    {
                        type: "text",
                        value: "## O cosseno é a abscissa, e isso muda a simetria\n\nNo ciclo, o cosseno de um arco é a abscissa do ponto de chegada, ou seja, o quanto esse ponto está à direita ou à esquerda. Resolver $\\cos x = a$ é procurar os pontos com aquela abscissa, e a reta que se traça para isso é vertical, não horizontal.\n\nUma reta vertical corta a circunferência em dois pontos simétricos em relação ao eixo horizontal, um acima dele e outro abaixo. Essa única diferença gera todas as outras: no seno a dupla é suplementar ($x_0$ e $\\pi - x_0$), no cosseno a dupla é oposta ($x_0$ e $-x_0$).",
                    },
                    {
                        type: "text",
                        value: "## A solução geral de $\\cos x = a$\n\nSe $x_0$ resolve $\\cos x = a$, então $-x_0$ também resolve, porque refletir o ponto no eixo horizontal troca o sinal da ordenada e mantém a abscissa. Reunindo as voltas:\n\n$$x = \\pm x_0 + 2k\\pi, \\quad k \\in \\mathbb{Z}$$\n\nEm $[0, 2\\pi)$ a dupla aparece como $x_0$ e $2\\pi - x_0$, que é o arco côngruo de $-x_0$. Exemplo: $\\cos x = \\frac{\\sqrt{2}}{2}$ tem $x_0 = \\frac{\\pi}{4}$, então as soluções da volta são $\\frac{\\pi}{4}$ e $2\\pi - \\frac{\\pi}{4} = \\frac{7\\pi}{4}$, e a geral é $x = \\pm\\frac{\\pi}{4} + 2k\\pi$.\n\nA condição de existência é a mesma do seno, porque a imagem do cosseno também é $[-1, 1]$.",
                    },
                    {
                        type: "text",
                        value: "## Valor negativo e os casos de borda\n\nCom $a < 0$ os dois pontos ficam à esquerda do eixo vertical, no 2º e no 3º quadrantes. Em $\\cos x = -\\frac{\\sqrt{3}}{2}$ a referência é $\\frac{\\pi}{6}$, e o arco do 2º quadrante é $x_0 = \\pi - \\frac{\\pi}{6} = \\frac{5\\pi}{6}$. O outro é $2\\pi - \\frac{5\\pi}{6} = \\frac{7\\pi}{6}$, e a solução geral é $x = \\pm\\frac{5\\pi}{6} + 2k\\pi$, com $k \\in \\mathbb{Z}$.\n\nNas bordas a reta vertical tangencia o ciclo:\n\n- $\\cos x = 1$ dá só $x = 0$ na volta, e a geral é $x = 2k\\pi$.\n- $\\cos x = -1$ dá só $x = \\pi$, e a geral é $x = \\pi + 2k\\pi$.\n- $\\cos x = 0$ dá $x = \\frac{\\pi}{2}$ e $x = \\frac{3\\pi}{2}$, que distam $\\pi$: a geral junta as duas em $x = \\frac{\\pi}{2} + k\\pi$.",
                    },
                    {
                        type: "text",
                        value: "## A tangente sempre tem solução\n\nA tangente de um arco é $\\tan x = \\frac{\\sin x}{\\cos x}$, e sua imagem são todos os reais: para qualquer $a$, por grande que seja, existe arco com $\\tan x = a$. Aqui não há condição de existência para conferir, diferente do seno e do cosseno.\n\nEm troca, o período da tangente é $\\pi$, e não $2\\pi$: arcos que diferem de meia volta têm a mesma tangente, porque o seno e o cosseno trocam de sinal juntos e o quociente fica igual. Logo a solução geral é\n\n$$x = x_0 + k\\pi, \\quad k \\in \\mathbb{Z}$$\n\nExemplo: $\\tan x = \\sqrt{3}$ tem $x_0 = \\frac{\\pi}{3}$, e a geral é $x = \\frac{\\pi}{3} + k\\pi$. Em $[0, 2\\pi)$ aparecem dois valores, $\\frac{\\pi}{3}$ e $\\frac{\\pi}{3} + \\pi = \\frac{4\\pi}{3}$.",
                    },
                    {
                        type: "text",
                        value: "## Tangente negativa\n\nEm $\\tan x = -1$ a referência é $\\frac{\\pi}{4}$, e a tangente é negativa no 2º e no 4º quadrantes. O arco do 2º quadrante é $\\pi - \\frac{\\pi}{4} = \\frac{3\\pi}{4}$, então a solução geral é $x = \\frac{3\\pi}{4} + k\\pi$, e em $[0, 2\\pi)$ as soluções são $\\frac{3\\pi}{4}$ e $\\frac{7\\pi}{4}$.\n\nRepare que a resposta é uma família só, com passo $\\pi$, ainda que apareçam duas soluções em uma volta. Escrever $x = \\frac{3\\pi}{4} + 2k\\pi$ perde metade delas.",
                    },
                    {
                        type: "text",
                        value: "## As três formas lado a lado\n\n| Equação | Soluções em $[0, 2\\pi)$ | Solução geral | Existe sempre? |\n| --- | --- | --- | --- |\n| $\\sin x = a$ | $x_0$ e $\\pi - x_0$ | $x = x_0 + 2k\\pi$ ou $x = \\pi - x_0 + 2k\\pi$ | só se $-1 \\le a \\le 1$ |\n| $\\cos x = a$ | $x_0$ e $2\\pi - x_0$ | $x = \\pm x_0 + 2k\\pi$ | só se $-1 \\le a \\le 1$ |\n| $\\tan x = a$ | $x_0$ e $x_0 + \\pi$ | $x = x_0 + k\\pi$ | sempre |\n\nEm todas as linhas $k \\in \\mathbb{Z}$, e $x_0$ é a solução de referência, tirada do arco notável. A última coluna é a primeira coisa a conferir: no seno e no cosseno, valor fora de $[-1, 1]$ encerra o problema.",
                    },
                    {
                        type: "text",
                        value: "## O erro de aplicar ao cosseno a regra do seno\n\nÉ o tropeço mais frequente do assunto. Em $\\cos x = \\frac{1}{2}$, quem repete o hábito do seno escreve $\\frac{\\pi}{3}$ e $\\pi - \\frac{\\pi}{3} = \\frac{2\\pi}{3}$. Só que $\\cos \\frac{2\\pi}{3} = -\\frac{1}{2}$, e não $\\frac{1}{2}$: o arco suplementar guarda o mesmo seno, não o mesmo cosseno. A resposta certa é $\\frac{\\pi}{3}$ e $\\frac{5\\pi}{3}$.\n\nO erro espelhado também aparece, que é usar $x = \\pm x_0 + 2k\\pi$ numa equação de seno. Em $\\sin x = \\frac{1}{2}$ isso ofereceria $-\\frac{\\pi}{6}$, cujo seno vale $-\\frac{1}{2}$.\n\nUm teste de dez segundos evita os dois: substitua cada solução na equação antes de entregar a resposta.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo: duas equações até o fim\n\nPrimeira: $2\\cos x + \\sqrt{3} = 0$ em $[0, 2\\pi)$. Isolando, $\\cos x = -\\frac{\\sqrt{3}}{2}$. Valor negativo, 2º e 3º quadrantes, referência $\\frac{\\pi}{6}$:\n\n$$x = \\frac{5\\pi}{6} \\quad \\text{ou} \\quad x = \\frac{7\\pi}{6}$$\n\nSegunda: $3\\tan x = \\sqrt{3}$ em $[0, 2\\pi)$. Isolando, $\\tan x = \\frac{\\sqrt{3}}{3}$, que é a tangente de $\\frac{\\pi}{6}$. A solução geral é $x = \\frac{\\pi}{6} + k\\pi$, com $k \\in \\mathbb{Z}$, e na volta pedida ficam $\\frac{\\pi}{6}$ e $\\frac{7\\pi}{6}$.",
                    },
                    {
                        type: "quote",
                        value: "O seno pede o arco suplementar, o cosseno pede o arco oposto, e a tangente pede meia volta de passo. Quem decora as três sem decorar de onde elas vêm acaba usando a do seno no lugar errado.",
                    },
                ],
                questions: [
                    {
                        statement: "As soluções de $\\cos x = \\frac{\\sqrt{2}}{2}$ no intervalo $[0, 2\\pi)$ são:",
                        difficulty: "facil",
                        options: [
                            { text: "$x = \\frac{\\pi}{4}$ e $x = \\frac{5\\pi}{4}$", isCorrect: false },
                            { text: "$x = \\frac{\\pi}{4}$ e $x = \\frac{3\\pi}{4}$", isCorrect: false },
                            { text: "$x = \\frac{\\pi}{4}$ e $x = \\frac{7\\pi}{4}$", isCorrect: true },
                            { text: "$x = \\frac{\\pi}{3}$ e $x = \\frac{5\\pi}{3}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a solução geral, em $\\mathbb{R}$, da equação $\\tan x = 1$, com $k \\in \\mathbb{Z}$?",
                        difficulty: "facil",
                        options: [
                            { text: "$x = \\pm\\frac{\\pi}{4} + k\\pi$", isCorrect: false },
                            { text: "$x = \\frac{\\pi}{2} + k\\pi$", isCorrect: false },
                            { text: "$x = \\frac{\\pi}{4} + 2k\\pi$", isCorrect: false },
                            { text: "$x = \\frac{\\pi}{4} + k\\pi$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "No intervalo $[0, 360^\\circ)$, as soluções de $\\cos x = -\\frac{1}{2}$ são:",
                        difficulty: "medio",
                        options: [
                            { text: "$x = 120^\\circ$ e $x = 300^\\circ$", isCorrect: false },
                            { text: "$x = 120^\\circ$ e $x = 240^\\circ$", isCorrect: true },
                            { text: "$x = 60^\\circ$ e $x = 120^\\circ$", isCorrect: false },
                            { text: "$x = 60^\\circ$ e $x = 300^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Quantas soluções a equação $\\tan x = \\sqrt{3}$ tem no intervalo $[0, 4\\pi)$?",
                        difficulty: "medio",
                        options: [
                            { text: "$2$ soluções", isCorrect: false },
                            { text: "$8$ soluções", isCorrect: false },
                            { text: "$4$ soluções", isCorrect: true },
                            { text: "$3$ soluções", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a solução geral, em $\\mathbb{R}$, da equação $2\\cos x = -\\sqrt{3}$, com $k \\in \\mathbb{Z}$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$x = \\pm\\frac{5\\pi}{6} + 2k\\pi$", isCorrect: true },
                            { text: "$x = \\pm\\frac{\\pi}{6} + 2k\\pi$", isCorrect: false },
                            { text: "$x = \\frac{5\\pi}{6} + 2k\\pi$ apenas", isCorrect: false },
                            { text: "$x = \\pm\\frac{5\\pi}{6} + k\\pi$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Equações que caem no segundo grau",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando a função aparece ao quadrado\n\nAté aqui a função trigonométrica aparecia uma vez só, e bastava isolar. Agora olhe para $2\\sin^2 x - \\sin x - 1 = 0$. Não há como isolar o seno de uma vez, porque ele aparece ao quadrado e também sozinho.\n\nO jeito é reconhecer a forma. Trocando $\\sin x$ por uma letra nova, digamos $u$, a equação vira $2u^2 - u - 1 = 0$, uma equação do segundo grau comum. Resolvemos em $u$, voltamos para $x$ e caímos nas equações simples que já sabemos resolver.",
                    },
                    {
                        type: "text",
                        value: "## O roteiro da substituição\n\nSão quatro passos, e nenhum deles pode ser pulado:\n\n1. Escolha a substituição, $u = \\sin x$ ou $u = \\cos x$, conforme a função que aparece.\n2. Resolva a equação do segundo grau em $u$, por Bhaskara ou por soma e produto.\n3. **Descarte as raízes fora de $[-1, 1]$**, porque seno e cosseno não assumem esses valores.\n4. Para cada raiz que sobrou, resolva a equação trigonométrica correspondente e junte as soluções.\n\nEm $2u^2 - u - 1 = 0$ o discriminante é $\\Delta = 1 + 8 = 9$, e as raízes são $u = \\frac{1 \\pm 3}{4}$, ou seja, $u = 1$ e $u = -\\frac{1}{2}$. As duas estão em $[-1, 1]$, então as duas valem. De $\\sin x = 1$ vem $x = \\frac{\\pi}{2}$, e de $\\sin x = -\\frac{1}{2}$ vêm $\\frac{7\\pi}{6}$ e $\\frac{11\\pi}{6}$. Em $[0, 2\\pi)$ são três soluções, não quatro, porque $\\sin x = 1$ é caso de borda.",
                    },
                    {
                        type: "text",
                        value: "## O descarte da raiz impossível\n\nEm $2\\cos^2 x + 5\\cos x - 3 = 0$, com $u = \\cos x$, fica $2u^2 + 5u - 3 = 0$. O discriminante é $\\Delta = 25 + 24 = 49$, e as raízes são $u = \\frac{-5 \\pm 7}{4}$, isto é, $u = \\frac{1}{2}$ e $u = -3$.\n\nA raiz $u = -3$ tem que ser descartada, e não por ser negativa: $-\\frac{1}{2}$ é negativa e serve. Ela cai fora porque nenhum arco tem cosseno $-3$, já que a imagem do cosseno é $[-1, 1]$. Quem não faz o descarte tenta resolver $\\cos x = -3$ e acaba inventando solução.\n\nSobra $\\cos x = \\frac{1}{2}$, que dá $x = \\frac{\\pi}{3}$ e $x = \\frac{5\\pi}{3}$ em $[0, 2\\pi)$.",
                    },
                    {
                        type: "text",
                        value: "## Duas funções na mesma equação\n\nQuando seno e cosseno aparecem juntos, a equação não é do segundo grau em nada: primeiro é preciso deixá-la com uma função só. A ferramenta é a relação fundamental, $\\sin^2 x + \\cos^2 x = 1$, usada na forma que convém:\n\n$$\\cos^2 x = 1 - \\sin^2 x \\qquad \\text{ou} \\qquad \\sin^2 x = 1 - \\cos^2 x$$\n\nA regra prática é trocar o termo que está ao quadrado e manter o que aparece no primeiro grau. Em $2\\sin^2 x + 3\\cos x = 3$ quem está ao quadrado é o seno, então use $\\sin^2 x = 1 - \\cos^2 x$:\n\n$$2(1 - \\cos^2 x) + 3\\cos x = 3 \\implies -2\\cos^2 x + 3\\cos x - 1 = 0 \\implies 2\\cos^2 x - 3\\cos x + 1 = 0$$\n\nCom $u = \\cos x$: $\\Delta = 9 - 8 = 1$ e $u = \\frac{3 \\pm 1}{4}$, logo $u = 1$ e $u = \\frac{1}{2}$. Em $[0, 2\\pi)$ as soluções são $x = 0$, $x = \\frac{\\pi}{3}$ e $x = \\frac{5\\pi}{3}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: $2\\sin^2 x - 3\\sin x + 1 = 0$\n\nCom $u = \\sin x$: $2u^2 - 3u + 1 = 0$, $\\Delta = 9 - 8 = 1$ e $u = \\frac{3 \\pm 1}{4}$, ou seja, $u = 1$ e $u = \\frac{1}{2}$. Nenhuma passa de $1$, então as duas ficam.\n\nDe $\\sin x = 1$, caso de borda, sai uma família: $x = \\frac{\\pi}{2} + 2k\\pi$.\n\nDe $\\sin x = \\frac{1}{2}$ saem duas: $x = \\frac{\\pi}{6} + 2k\\pi$ ou $x = \\frac{5\\pi}{6} + 2k\\pi$.\n\nA solução geral é a união das três famílias, com $k \\in \\mathbb{Z}$. Em $[0, 2\\pi)$ seriam $\\frac{\\pi}{6}$, $\\frac{\\pi}{2}$ e $\\frac{5\\pi}{6}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: $4\\sin^2 x = 3$\n\nAqui não há termo do primeiro grau, e dá para isolar direto:\n\n$$\\sin^2 x = \\frac{3}{4} \\implies \\sin x = \\pm\\frac{\\sqrt{3}}{2}$$\n\nO $\\pm$ não é enfeite: são duas equações. De $\\sin x = \\frac{\\sqrt{3}}{2}$ vêm $\\frac{\\pi}{3}$ e $\\frac{2\\pi}{3}$; de $\\sin x = -\\frac{\\sqrt{3}}{2}$ vêm $\\frac{4\\pi}{3}$ e $\\frac{5\\pi}{3}$. São quatro soluções em $[0, 2\\pi)$, e como cada par dista meia volta, a solução geral pode ser escrita compacta:\n\n$$x = \\frac{\\pi}{3} + k\\pi \\quad \\text{ou} \\quad x = \\frac{2\\pi}{3} + k\\pi, \\quad k \\in \\mathbb{Z}$$\n\nO erro clássico aqui é extrair a raiz quadrada e guardar só o valor positivo, perdendo metade das soluções.",
                    },
                    {
                        type: "text",
                        value: "## Dois descuidos que custam a questão\n\nO primeiro é parar em $u$. A pergunta é sobre $x$: responder $u = \\frac{1}{2}$ é responder ao passo intermediário, não à equação. Volte sempre, troque $u$ pela função e resolva a equação trigonométrica que sobrou.\n\nO segundo é trocar o termo errado na relação fundamental. Em $2\\cos^2 x + \\sin x = 1$, quem substitui $\\sin x$ por $\\sqrt{1 - \\cos^2 x}$ cria uma raiz quadrada e um problema de sinal, porque $\\sqrt{1 - \\cos^2 x}$ vale $\\sin x$ apenas quando o seno não é negativo. Trocando $\\cos^2 x$ por $1 - \\sin^2 x$ a equação fica $2 - 2\\sin^2 x + \\sin x = 1$, ou seja, $2\\sin^2 x - \\sin x - 1 = 0$, exatamente a equação da abertura desta aula.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Reconheça a forma do segundo grau e substitua, com $u = \\sin x$ ou $u = \\cos x$.\n- Resolva em $u$ e descarte toda raiz fora de $[-1, 1]$, que é o passo mais esquecido.\n- Com seno e cosseno juntos, use a relação fundamental para trocar o termo que está ao quadrado.\n- Volte para $x$ em cada raiz que sobrou e junte as famílias de soluções.",
                    },
                    {
                        type: "quote",
                        value: "A substituição transforma a equação trigonométrica numa do segundo grau, mas não transforma $-3$ num cosseno possível. Resolver em $u$ é meio caminho: o outro meio é descartar o impossível e voltar para $x$.",
                    },
                ],
                questions: [
                    {
                        statement: "Na equação $2\\cos^2 x + 5\\cos x - 3 = 0$, a substituição $u = \\cos x$ leva a $2u^2 + 5u - 3 = 0$, de raízes $u = \\frac{1}{2}$ e $u = -3$. O que fazer com essas raízes?",
                        difficulty: "facil",
                        options: [
                            { text: "descartar $u = -3$, porque o cosseno nunca é menor que $-1$", isCorrect: true },
                            { text: "usar as duas, porque as duas resolvem a equação em $u$", isCorrect: false },
                            { text: "descartar $u = \\frac{1}{2}$, porque não é um arco notável do ciclo", isCorrect: false },
                            { text: "descartar $u = -3$, porque toda raiz negativa deve ser cortada", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Quantas soluções a equação $4\\sin^2 x - 1 = 0$ tem no intervalo $[0, 2\\pi)$?",
                        difficulty: "facil",
                        options: [
                            { text: "$2$ soluções", isCorrect: false },
                            { text: "$8$ soluções", isCorrect: false },
                            { text: "$1$ solução", isCorrect: false },
                            { text: "$4$ soluções", isCorrect: true },
                        ],
                    },
                    {
                        statement: "No intervalo $[0, 2\\pi)$, as soluções de $2\\cos^2 x - \\cos x - 1 = 0$ são:",
                        difficulty: "medio",
                        options: [
                            { text: "$0$, $\\frac{2\\pi}{3}$ e $\\frac{4\\pi}{3}$", isCorrect: true },
                            { text: "$0$, $\\frac{\\pi}{3}$ e $\\frac{2\\pi}{3}$", isCorrect: false },
                            { text: "$\\frac{2\\pi}{3}$ e $\\frac{4\\pi}{3}$, somente", isCorrect: false },
                            { text: "$\\pi$, $\\frac{\\pi}{3}$ e $\\frac{5\\pi}{3}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para resolver $2\\cos^2 x + \\sin x = 1$, qual troca deixa a equação com uma função só?",
                        difficulty: "medio",
                        options: [
                            { text: "trocar $\\cos^2 x$ por $1 - \\sin^2 x$", isCorrect: true },
                            { text: "trocar $\\sin x$ por $1 - \\cos^2 x$", isCorrect: false },
                            { text: "dividir os dois lados por $\\cos^2 x$", isCorrect: false },
                            { text: "trocar $\\cos^2 x$ por $1 + \\sin^2 x$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a solução geral, em $\\mathbb{R}$, da equação $2\\cos^2 x - 3\\cos x + 1 = 0$, com $k \\in \\mathbb{Z}$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$x = k\\pi$ ou $x = \\pm\\frac{\\pi}{3} + 2k\\pi$", isCorrect: false },
                            { text: "$x = \\pm\\frac{\\pi}{3} + 2k\\pi$, somente", isCorrect: false },
                            { text: "$x = 2k\\pi$ ou $x = \\pm\\frac{\\pi}{3} + 2k\\pi$", isCorrect: true },
                            { text: "$x = 2k\\pi$ ou $x = \\pm\\frac{\\pi}{6} + 2k\\pi$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Equações que pedem identidade antes",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando os arcos não são o mesmo\n\nOlhe $\\sin 2x = \\sin x$. Dos dois lados há seno, mas de arcos diferentes, $2x$ e $x$. É tentador cancelar o seno e escrever $2x = x$, o que daria $x = 0$ e mais nada. A equação, porém, tem quatro soluções em uma volta.\n\nFunção não se cancela como se fosse fator. Para resolver, primeiro é preciso deixar todos os termos no mesmo arco, e quem faz isso são as identidades: a relação fundamental, as de soma e diferença de arcos e, principalmente, as de arco duplo.",
                    },
                    {
                        type: "text",
                        value: "## A ordem de trabalho\n\nSão quatro passos, nessa ordem:\n\n1. **Identidade**: troque os arcos múltiplos por expressões no arco $x$. As de arco duplo são $\\sin 2x = 2\\sin x \\cos x$ e $\\cos 2x = 2\\cos^2 x - 1$.\n2. **Tudo de um lado**: passe os termos para um só membro, deixando zero do outro.\n3. **Fatore**: coloque o fator comum em evidência, ou reconheça a equação do segundo grau.\n4. **Cada fator igual a zero**: um produto é zero quando um dos fatores é zero, e cada fator gera uma equação simples.\n\nO passo 2 é o que protege contra o erro mais caro desta aula, que é dividir os dois lados por uma expressão que pode valer zero.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: $\\sin 2x = \\sin x$ em $[0, 2\\pi)$\n\nIdentidade do arco duplo e tudo de um lado:\n\n$$2\\sin x \\cos x - \\sin x = 0$$\n\nO fator comum é $\\sin x$:\n\n$$\\sin x\\,(2\\cos x - 1) = 0$$\n\nAgora cada fator:\n\n- $\\sin x = 0$ dá $x = 0$ e $x = \\pi$.\n- $2\\cos x - 1 = 0$ dá $\\cos x = \\frac{1}{2}$, logo $x = \\frac{\\pi}{3}$ e $x = \\frac{5\\pi}{3}$.\n\nO conjunto solução é $\\left\\{0, \\frac{\\pi}{3}, \\pi, \\frac{5\\pi}{3}\\right\\}$. Conferindo $x = \\pi$: $\\sin 2\\pi = 0$ e $\\sin \\pi = 0$, igualdade verdadeira.",
                    },
                    {
                        type: "text",
                        value: "## O erro de dividir por $\\sin x$\n\nDiante de $2\\sin x \\cos x = \\sin x$, é comum dividir os dois lados por $\\sin x$ e concluir $2\\cos x = 1$, ou seja, $x = \\frac{\\pi}{3}$ e $x = \\frac{5\\pi}{3}$. Metade da resposta desapareceu no caminho: $x = 0$ e $x = \\pi$ também resolvem a equação, e são exatamente os arcos em que $\\sin x = 0$.\n\nDividir por $\\sin x$ supõe $\\sin x \\neq 0$, e essa suposição elimina sem aviso todos os arcos em que o seno zera. A regra é curta: **nunca divida os dois lados por uma expressão que contém a incógnita**. Coloque em evidência e iguale cada fator a zero, que é o mesmo trabalho sem a perda.\n\nSe em algum problema dividir parecer inevitável, separe antes o caso $\\sin x = 0$ e resolva os dois caminhos.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: $\\cos 2x + \\cos x = 0$ em $[0, 2\\pi)$\n\nAqui não aparece fator comum, mas a identidade do arco duplo escolhida com cuidado faz a equação cair no segundo grau. Com $\\cos 2x = 2\\cos^2 x - 1$:\n\n$$2\\cos^2 x - 1 + \\cos x = 0$$\n\nCom $u = \\cos x$: $2u^2 + u - 1 = 0$, $\\Delta = 1 + 8 = 9$ e $u = \\frac{-1 \\pm 3}{4}$, ou seja, $u = \\frac{1}{2}$ e $u = -1$.\n\n- $\\cos x = \\frac{1}{2}$ dá $x = \\frac{\\pi}{3}$ e $x = \\frac{5\\pi}{3}$.\n- $\\cos x = -1$ dá $x = \\pi$, caso de borda com uma solução por volta.\n\nO conjunto solução é $\\left\\{\\frac{\\pi}{3}, \\pi, \\frac{5\\pi}{3}\\right\\}$, e a solução geral é $x = \\pm\\frac{\\pi}{3} + 2k\\pi$ ou $x = \\pi + 2k\\pi$, com $k \\in \\mathbb{Z}$.",
                    },
                    {
                        type: "text",
                        value: "## Quando $\\sin x + \\cos x$ aparece\n\nA soma $\\sin x + \\cos x$ não se simplifica sozinha, mas o seu quadrado se arruma:\n\n$$(\\sin x + \\cos x)^2 = \\sin^2 x + 2\\sin x \\cos x + \\cos^2 x = 1 + \\sin 2x$$\n\nVamos usar isso em $\\sin x + \\cos x = 1$, em $[0, 2\\pi)$. Elevando os dois lados ao quadrado, $1 + \\sin 2x = 1$, logo $\\sin 2x = 0$. Daí $2x = k\\pi$, ou seja, $x = \\frac{k\\pi}{2}$, o que na volta dá quatro candidatos: $0$, $\\frac{\\pi}{2}$, $\\pi$ e $\\frac{3\\pi}{2}$.\n\nElevar ao quadrado pode criar solução falsa, então **todo candidato tem que ser testado na equação original**:\n\n- $x = 0$: $0 + 1 = 1$, serve.\n- $x = \\frac{\\pi}{2}$: $1 + 0 = 1$, serve.\n- $x = \\pi$: $0 - 1 = -1$, não serve.\n- $x = \\frac{3\\pi}{2}$: $-1 + 0 = -1$, não serve.\n\nO conjunto solução é $\\left\\{0, \\frac{\\pi}{2}\\right\\}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: $\\cos 2x = \\cos x$, até a solução geral\n\nCom $\\cos 2x = 2\\cos^2 x - 1$, a equação vira $2\\cos^2 x - \\cos x - 1 = 0$. Em $u = \\cos x$: $u = \\frac{1 \\pm 3}{4}$, ou seja, $u = 1$ e $u = -\\frac{1}{2}$.\n\nDe $\\cos x = 1$ sai $x = 2k\\pi$. De $\\cos x = -\\frac{1}{2}$, a referência é $\\frac{\\pi}{3}$, o arco do 2º quadrante é $\\frac{2\\pi}{3}$, e a família é $x = \\pm\\frac{2\\pi}{3} + 2k\\pi$.\n\nA solução geral, com $k \\in \\mathbb{Z}$, é $x = 2k\\pi$ ou $x = \\pm\\frac{2\\pi}{3} + 2k\\pi$. Em $[0, 2\\pi)$ isso dá $0$, $\\frac{2\\pi}{3}$ e $\\frac{4\\pi}{3}$.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Arcos diferentes na mesma equação pedem identidade antes de qualquer conta.\n- Depois da identidade: tudo de um lado, fatorar, e cada fator igual a zero.\n- Dividir os dois lados por $\\sin x$ (ou por $\\cos x$) apaga as raízes em que aquela função zera.\n- Elevar ao quadrado pode criar raiz falsa, então teste cada candidato na equação original.",
                    },
                    {
                        type: "quote",
                        value: "Fatorar e dividir parecem o mesmo atalho, e não são: a fatoração guarda as raízes em que o fator zera, a divisão joga essas raízes fora. Diante de um produto igual a zero, iguale cada fator a zero e conte quantas soluções apareceram.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o primeiro passo para resolver a equação $\\sin 2x = \\sin x$ no intervalo $[0, 2\\pi)$?",
                        difficulty: "facil",
                        options: [
                            { text: "elevar os dois lados ao quadrado e aplicar a relação fundamental", isCorrect: false },
                            { text: "cancelar o seno dos dois lados e resolver a equação $2x = x$", isCorrect: false },
                            { text: "dividir os dois lados por $\\sin x$ e resolver $2\\cos x = 1$", isCorrect: false },
                            { text: "escrever $\\sin 2x = 2\\sin x \\cos x$, deixando tudo no arco $x$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Ao resolver $\\sin 2x = \\sin x$ em $[0, 2\\pi)$, dividir os dois lados por $\\sin x$ faz perder quais soluções?",
                        difficulty: "facil",
                        options: [
                            { text: "$x = 0$ e $x = \\pi$, onde $\\sin x = 0$", isCorrect: true },
                            { text: "$x = \\frac{\\pi}{2}$ e $x = \\frac{3\\pi}{2}$, onde $\\cos x = 0$", isCorrect: false },
                            { text: "$x = \\frac{\\pi}{3}$ e $x = \\frac{5\\pi}{3}$, onde $\\cos x = \\frac{1}{2}$", isCorrect: false },
                            { text: "nenhuma, a divisão é segura", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No intervalo $[0, 2\\pi)$, o conjunto solução de $\\sin 2x = \\sin x$ é formado por:",
                        difficulty: "medio",
                        options: [
                            { text: "$0$, $\\frac{\\pi}{3}$, $\\pi$ e $\\frac{5\\pi}{3}$", isCorrect: true },
                            { text: "$\\frac{\\pi}{3}$ e $\\frac{5\\pi}{3}$, somente", isCorrect: false },
                            { text: "$0$, $\\frac{\\pi}{3}$, $\\pi$ e $\\frac{2\\pi}{3}$", isCorrect: false },
                            { text: "$0$ e $\\pi$, somente", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No intervalo $[0, 2\\pi)$, o conjunto solução de $\\cos 2x + \\cos x = 0$ é formado por:",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{\\pi}{3}$ e $\\frac{5\\pi}{3}$, somente", isCorrect: false },
                            { text: "$\\frac{\\pi}{3}$, $\\pi$ e $\\frac{5\\pi}{3}$", isCorrect: true },
                            { text: "$\\frac{2\\pi}{3}$, $\\pi$ e $\\frac{4\\pi}{3}$", isCorrect: false },
                            { text: "$\\frac{\\pi}{3}$, $\\frac{2\\pi}{3}$ e $\\pi$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No intervalo $[0, 2\\pi)$, o conjunto solução de $\\sin x + \\cos x = 1$ é formado por:",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\frac{\\pi}{2}$ e $\\frac{3\\pi}{2}$", isCorrect: false },
                            { text: "$0$ e $\\frac{\\pi}{2}$", isCorrect: true },
                            { text: "$0$, $\\frac{\\pi}{2}$, $\\pi$ e $\\frac{3\\pi}{2}$", isCorrect: false },
                            { text: "$0$ e $\\pi$, somente", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Inequações trigonométricas no ciclo",
                blocks: [
                    {
                        type: "text",
                        value: "## De um ponto para um arco\n\nResolver $\\sin x = \\frac{1}{2}$ devolve pontos, dois por volta. Resolver $\\sin x > \\frac{1}{2}$ devolve um pedaço do ciclo, um arco inteiro com infinitos pontos dentro. A resposta deixa de ser uma lista e passa a ser um intervalo.\n\nO método, porém, começa igual. Primeiro achamos os arcos em que vale a igualdade, que são a fronteira. Depois decidimos de que lado da fronteira a desigualdade é verdadeira, e isso se lê no próprio ciclo.",
                    },
                    {
                        type: "text",
                        value: "## O roteiro em quatro passos\n\n1. Isole a função trigonométrica, com o cuidado de sempre: multiplicar ou dividir uma desigualdade por número negativo inverte o sentido dela.\n2. Resolva a igualdade e marque no ciclo os dois arcos de fronteira.\n3. Leia no ciclo o arco que satisfaz a desigualdade. No seno pense em altura, acima ou abaixo de uma reta horizontal; no cosseno pense em posição horizontal, à direita ou à esquerda de uma reta vertical.\n4. Escreva o intervalo e, se o enunciado pedir a solução em $\\mathbb{R}$, some as voltas nas duas pontas, com $k \\in \\mathbb{Z}$.\n\nUm detalhe que decide questão: desigualdade estrita ($<$ ou $>$) deixa as pontas de fora, e desigualdade com igual ($\\le$ ou $\\ge$) inclui as pontas.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: $\\sin x > \\frac{1}{2}$\n\nA igualdade $\\sin x = \\frac{1}{2}$ dá $\\frac{\\pi}{6}$ e $\\frac{5\\pi}{6}$, que são as fronteiras. A reta horizontal de altura $\\frac{1}{2}$ divide o ciclo em duas partes, e queremos a de cima, onde a ordenada é maior que $\\frac{1}{2}$: é o arco que vai de $\\frac{\\pi}{6}$ a $\\frac{5\\pi}{6}$ passando pelo topo, em $\\frac{\\pi}{2}$.\n\nEm $[0, 2\\pi)$:\n\n$$\\frac{\\pi}{6} < x < \\frac{5\\pi}{6}$$\n\nAs pontas ficam de fora porque a desigualdade é estrita. Em $\\mathbb{R}$, basta somar as voltas nas duas pontas:\n\n$$\\frac{\\pi}{6} + 2k\\pi < x < \\frac{5\\pi}{6} + 2k\\pi, \\quad k \\in \\mathbb{Z}$$\n\nUm teste rápido fecha a conferência: $\\frac{\\pi}{2}$ está no intervalo e $\\sin \\frac{\\pi}{2} = 1$, que é maior que $\\frac{1}{2}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: $\\cos x \\le -\\frac{\\sqrt{2}}{2}$\n\nA igualdade $\\cos x = -\\frac{\\sqrt{2}}{2}$ dá $\\frac{3\\pi}{4}$ e $\\frac{5\\pi}{4}$. Agora a fronteira é a reta vertical dessa abscissa, e queremos o lado esquerdo, onde o cosseno é menor. Esse arco passa por $\\pi$:\n\n$$\\frac{3\\pi}{4} \\le x \\le \\frac{5\\pi}{4}$$\n\nOs extremos entram, porque o sinal é $\\le$ e neles vale a igualdade. Em $\\mathbb{R}$ a resposta é $\\frac{3\\pi}{4} + 2k\\pi \\le x \\le \\frac{5\\pi}{4} + 2k\\pi$, com $k \\in \\mathbb{Z}$.\n\nConfira a ponta e o meio: $\\cos \\frac{3\\pi}{4} = -\\frac{\\sqrt{2}}{2}$, que satisfaz a desigualdade por igualdade, e $\\cos \\pi = -1$, que satisfaz com folga. Se o enunciado trouxesse $<$ em vez de $\\le$, as duas pontas sairiam.",
                    },
                    {
                        type: "text",
                        value: "## O arco que atravessa o zero\n\nEm $\\cos x > \\frac{\\sqrt{3}}{2}$ as fronteiras são $\\frac{\\pi}{6}$ e $\\frac{11\\pi}{6}$, e o arco que serve é o da direita, em volta do zero. Dentro de $[0, 2\\pi)$ ele chega ao fim do intervalo e recomeça no início, então a resposta vira uma união:\n\n$$0 \\le x < \\frac{\\pi}{6} \\quad \\text{ou} \\quad \\frac{11\\pi}{6} < x < 2\\pi$$\n\nEscrita assim parece dois arcos; no ciclo é um só, que passa pelo zero. Por isso a forma geral fica mais simples do que a resposta no intervalo:\n\n$$-\\frac{\\pi}{6} + 2k\\pi < x < \\frac{\\pi}{6} + 2k\\pi, \\quad k \\in \\mathbb{Z}$$\n\nUsar o arco negativo $-\\frac{\\pi}{6}$ como ponta esquerda é o truque que evita a união. O sentido positivo do ciclo é o anti-horário, e $-\\frac{\\pi}{6}$ é o mesmo ponto de $\\frac{11\\pi}{6}$, uma volta antes.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 3: $\\tan x > 1$\n\nA tangente não tem teto nem piso, e não existe nos arcos em que $\\cos x = 0$. Entre duas assíntotas seguidas ela só cresce, de valores muito negativos a valores muito grandes. A igualdade $\\tan x = 1$ dá $\\frac{\\pi}{4}$ no primeiro ramo, e a assíntota seguinte está em $\\frac{\\pi}{2}$, então nesse ramo a resposta é\n\n$$\\frac{\\pi}{4} < x < \\frac{\\pi}{2}$$\n\nO período da tangente é $\\pi$, então a forma geral soma $k\\pi$, e não $2k\\pi$:\n\n$$\\frac{\\pi}{4} + k\\pi < x < \\frac{\\pi}{2} + k\\pi, \\quad k \\in \\mathbb{Z}$$\n\nEm $[0, 2\\pi)$ isso dá dois trechos, de $\\frac{\\pi}{4}$ a $\\frac{\\pi}{2}$ e de $\\frac{5\\pi}{4}$ a $\\frac{3\\pi}{2}$. Cuidado com a tentação de escrever $\\frac{\\pi}{4} < x < \\frac{3\\pi}{4}$: nesse caminho a assíntota de $\\frac{\\pi}{2}$ é atravessada, e logo depois dela a tangente é negativa. Em $\\frac{3\\pi}{4}$, por exemplo, $\\tan x = -1$, que não é maior que $1$.",
                    },
                    {
                        type: "text",
                        value: "## O erro de inverter o sentido da desigualdade\n\nAo passar do intervalo para a forma geral, só uma coisa acontece: as duas pontas ganham $2k\\pi$ (ou $k\\pi$, na tangente). A ordem das pontas não muda. Quem troca a ordem e escreve\n\n$$\\frac{5\\pi}{6} + 2k\\pi < x < \\frac{\\pi}{6} + 2k\\pi$$\n\nescreveu um intervalo vazio, porque nenhum número é ao mesmo tempo maior que $\\frac{5\\pi}{6}$ e menor que $\\frac{\\pi}{6}$. O arco menor fica à esquerda, sempre.\n\nO lugar em que o sentido realmente muda é no passo de isolar a função. Em $-2\\sin x > -1$, dividir por $-2$ inverte o sinal:\n\n$$\\sin x < \\frac{1}{2}$$\n\nInverter ali é obrigatório; inverter depois, na hora de somar as voltas, é erro.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 4: $1 - 2\\cos x < 0$ em $[0, 2\\pi)$\n\nIsolando, $-2\\cos x < -1$, e dividindo por $-2$ com a inversão do sinal, $\\cos x > \\frac{1}{2}$.\n\nA igualdade $\\cos x = \\frac{1}{2}$ dá $\\frac{\\pi}{3}$ e $\\frac{5\\pi}{3}$. Queremos o lado direito da reta vertical de abscissa $\\frac{1}{2}$, que é o arco em volta do zero. Na volta pedida:\n\n$$0 \\le x < \\frac{\\pi}{3} \\quad \\text{ou} \\quad \\frac{5\\pi}{3} < x < 2\\pi$$\n\nDois testes: $x = 0$ dá $1 - 2 = -1$, menor que zero, serve; $x = \\frac{\\pi}{2}$ dá $1 - 0 = 1$, que não é menor que zero, e de fato $\\frac{\\pi}{2}$ ficou fora da resposta.",
                    },
                    {
                        type: "quote",
                        value: "Em inequação trigonométrica a igualdade é só a fronteira, e quem responde é o arco. Ache as pontas, leia no ciclo de que lado a desigualdade vale, confira se as pontas entram, e some as voltas sem mexer na ordem delas.",
                    },
                ],
                questions: [
                    {
                        statement: "No intervalo $[0, 2\\pi)$, o conjunto solução de $\\sin x > \\frac{1}{2}$ é:",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{\\pi}{3} < x < \\frac{2\\pi}{3}$", isCorrect: false },
                            { text: "$\\frac{\\pi}{6} < x < \\frac{11\\pi}{6}$", isCorrect: false },
                            { text: "$\\frac{\\pi}{6} < x < \\frac{5\\pi}{6}$", isCorrect: true },
                            { text: "$\\frac{\\pi}{6} \\le x \\le \\frac{5\\pi}{6}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o primeiro passo para resolver a inequação $\\cos x \\le -\\frac{\\sqrt{2}}{2}$?",
                        difficulty: "facil",
                        options: [
                            { text: "resolver $\\cos x = -\\frac{\\sqrt{2}}{2}$ e marcar os arcos no ciclo", isCorrect: true },
                            { text: "trocar o cosseno pelo seno do arco complementar e resolver", isCorrect: false },
                            { text: "dividir os dois lados por $-\\frac{\\sqrt{2}}{2}$, invertendo o sinal", isCorrect: false },
                            { text: "elevar os dois lados ao quadrado para fazer a raiz desaparecer", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No intervalo $[0, 2\\pi)$, o conjunto solução de $\\cos x \\le -\\frac{\\sqrt{2}}{2}$ é:",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{\\pi}{4} \\le x \\le \\frac{3\\pi}{4}$", isCorrect: false },
                            { text: "$\\frac{3\\pi}{4} < x < \\frac{5\\pi}{4}$", isCorrect: false },
                            { text: "$\\frac{3\\pi}{4} \\le x \\le \\frac{5\\pi}{4}$", isCorrect: true },
                            { text: "$\\frac{5\\pi}{4} \\le x \\le \\frac{7\\pi}{4}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a solução de $\\tan x > 1$ em $\\mathbb{R}$, com $k \\in \\mathbb{Z}$?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{\\pi}{4} + k\\pi < x < \\frac{3\\pi}{4} + k\\pi$", isCorrect: false },
                            { text: "$\\frac{\\pi}{4} + k\\pi \\le x < \\frac{\\pi}{2} + k\\pi$", isCorrect: false },
                            { text: "$\\frac{\\pi}{4} + k\\pi < x < \\frac{\\pi}{2} + k\\pi$", isCorrect: true },
                            { text: "$\\frac{\\pi}{4} + 2k\\pi < x < \\frac{\\pi}{2} + 2k\\pi$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No intervalo $[0, 2\\pi)$, o conjunto solução de $1 - 2\\cos x < 0$ é:",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\frac{\\pi}{3} < x < \\frac{5\\pi}{3}$", isCorrect: false },
                            { text: "$0 \\le x \\le \\frac{\\pi}{3}$ ou $\\frac{5\\pi}{3} \\le x < 2\\pi$", isCorrect: false },
                            { text: "$0 \\le x < \\frac{\\pi}{3}$ ou $\\frac{2\\pi}{3} < x < 2\\pi$", isCorrect: false },
                            { text: "$0 \\le x < \\frac{\\pi}{3}$ ou $\\frac{5\\pi}{3} < x < 2\\pi$", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Trigonometria aplicada",
        aulas: [
            {
                titulo: "Medindo o que não se alcança",
                blocks: [
                    {
                        type: "text",
                        value: "# Medindo o que não se alcança\n\nUma trena mede o comprimento de uma sala, mas não mede a altura de um morro, nem a largura de um rio, nem a distância até uma ilha. Em todos esses casos existe um ponto onde não se consegue chegar com a fita esticada.\n\nA trigonometria resolve isso com uma troca: em vez de medir o que está longe, medimos o que está perto (uma distância no chão) e um ou dois ângulos. O resto é conta. Daqui para a frente este módulo só aplica o que a trilha já construiu.",
                    },
                    {
                        type: "text",
                        value: "## A visada e o ângulo de elevação\n\nUma visada é o ato de apontar um instrumento (um teodolito, um clinômetro ou mesmo um celular com aplicativo de nível) para um alvo e ler o ângulo que a linha de visão faz com a horizontal. Esse ângulo é o ângulo de elevação quando o alvo está acima do observador.\n\nCom uma visada só já se resolve o caso fácil: se dá para chegar à base do morro e medir a distância $x$ até ela, a altura sai direto de $\\tan\\alpha = \\frac{h}{x}$.\n\nO problema aparece quando a base é inacessível, porque há um lago, uma mata ou um prédio no caminho. Aí $x$ também é desconhecido, e uma equação com duas incógnitas não decide nada. A saída é fazer uma segunda visada.",
                    },
                    {
                        type: "text",
                        value: "## O método das duas visadas\n\nEscolha dois pontos $A$ e $B$ no chão plano, alinhados com a base do morro, e meça a distância $d$ entre eles. De $A$, que está mais longe, o ângulo de elevação do topo é $\\alpha$. De $B$, mais perto, ele é $\\beta$, necessariamente maior.\n\nChamando de $x$ a distância de $B$ até a base e de $h$ a altura procurada:\n\n$$\\tan\\beta = \\frac{h}{x} \\quad \\text{e} \\quad \\tan\\alpha = \\frac{h}{x+d}$$\n\nIsolando $x$ nas duas igualdades e subtraindo, a incógnita incômoda desaparece e sobra uma equação só com $h$:\n\n$$\\frac{h}{\\tan\\alpha} - \\frac{h}{\\tan\\beta} = d$$\n\nCom $\\alpha = 30^\\circ$ e $\\beta = 60^\\circ$ a conta fica redonda, porque $\\frac{1}{\\tan 30^\\circ} = \\sqrt{3}$ e $\\frac{1}{\\tan 60^\\circ} = \\frac{\\sqrt{3}}{3}$:\n\n$$h\\left(\\sqrt{3} - \\frac{\\sqrt{3}}{3}\\right) = d \\Rightarrow h \\cdot \\frac{2\\sqrt{3}}{3} = d \\Rightarrow h = \\frac{d\\sqrt{3}}{2}$$",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: a altura do morro\n\nDe um ponto $A$ de terreno plano, o ângulo de elevação do topo de um morro é $30^\\circ$. Andando $60$ m em linha reta na direção do morro, até o ponto $B$, o ângulo passa a $60^\\circ$. A base do morro é inacessível.\n\nPela relação obtida acima, com $d = 60$ m:\n\n$$h = \\frac{60\\sqrt{3}}{2} = 30\\sqrt{3} \\approx 52 \\text{ m}$$\n\nVale conferir por outro caminho. Se $h = 30\\sqrt{3}$, a distância de $B$ à base é $x = \\frac{h}{\\tan 60^\\circ} = \\frac{30\\sqrt{3}}{\\sqrt{3}} = 30$ m, e a de $A$ à base é $30 + 60 = 90$ m. Testando a primeira visada: $90 \\cdot \\tan 30^\\circ = 90 \\cdot \\frac{\\sqrt{3}}{3} = 30\\sqrt{3}$. As duas visadas dão a mesma altura, então a conta fecha.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: a largura do rio\n\nUma árvore $T$ está na margem oposta de um rio de margens paralelas. Da margem de cá, marcamos o ponto $A$ de frente para a árvore, de modo que $AT$ fique perpendicular à margem, e caminhamos $40$ m pela margem até $B$. De $B$, o ângulo entre a margem e a linha de visão até a árvore mede $60^\\circ$.\n\nO triângulo $ABT$ é retângulo em $A$. Visto de $B$, o cateto oposto ao ângulo de $60^\\circ$ é a largura $AT$, e o cateto adjacente é $AB = 40$ m:\n\n$$\\tan 60^\\circ = \\frac{AT}{40} \\Rightarrow AT = 40\\sqrt{3} \\approx 69 \\text{ m}$$\n\nO erro comum aqui é usar o seno. O seno de $60^\\circ$ liga a largura à linha de visão $BT$, que ninguém mediu. Quem tem os dois catetos em jogo usa tangente.",
                    },
                    {
                        type: "quote",
                        value: "Nenhuma dessas contas mede o que está longe. Elas medem o que está perto, uma distância no chão e um ângulo, e deixam a semelhança de triângulos levar a medida até onde o braço não chega.",
                    },
                    {
                        type: "text",
                        value: "## Triangulação: a ideia geral\n\nQuando o alvo não está acima do observador, mas do outro lado de um lago, o método é o mesmo com outro nome. Meça uma base $AB$ acessível e, de cada ponta dela, o ângulo até o alvo $C$. O terceiro ângulo sai de graça, porque a soma dos três é $180^\\circ$, e então a lei dos senos dá os lados que faltam.\n\nExemplo: $A$ e $B$ estão na mesma margem, com $AB = 80$ m. Mede-se $C\\hat{A}B = 30^\\circ$ e $A\\hat{B}C = 120^\\circ$, logo $A\\hat{C}B = 30^\\circ$. Pela lei dos senos, com o lado $AB$ oposto ao ângulo em $C$:\n\n$$\\frac{AC}{\\sin 120^\\circ} = \\frac{80}{\\sin 30^\\circ} \\Rightarrow AC = \\frac{80 \\cdot \\frac{\\sqrt{3}}{2}}{\\frac{1}{2}} = 80\\sqrt{3} \\approx 139 \\text{ m}$$\n\nJá $BC = \\frac{80 \\cdot \\sin 30^\\circ}{\\sin 30^\\circ} = 80$ m, igual à base, como era de esperar num triângulo com dois ângulos de $30^\\circ$. É assim que se mapeia uma cadeia de montanhas: uma base medida no chão, muitos ângulos e nenhuma trena no alvo.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Base acessível: uma visada basta, e $\\tan\\alpha = \\frac{h}{x}$ resolve.\n- Base inacessível: duas visadas alinhadas, separadas por $d$, e a relação $\\frac{h}{\\tan\\alpha} - \\frac{h}{\\tan\\beta} = d$.\n- Com $\\alpha = 30^\\circ$ e $\\beta = 60^\\circ$, a altura fica $h = \\frac{d\\sqrt{3}}{2}$.\n- Largura de rio: marque o ponto de frente para o alvo, ande pela margem e use a tangente, não o seno.\n- Alvo do outro lado: base medida, dois ângulos, o terceiro por soma $180^\\circ$ e lei dos senos.\n- Confira refazendo a conta pela outra visada: as duas têm que devolver a mesma altura.",
                    },
                    {
                        type: "quote",
                        value: "Medir o inacessível não é truque. É escolher bem o que se pode medir e confiar que o ângulo carrega o resto da informação.",
                    },
                ],
                questions: [
                    {
                        statement: "Para medir a largura de um rio de margens paralelas, um topógrafo marca o ponto $A$ de frente para uma árvore $T$ da margem oposta, de modo que $AT$ fique perpendicular à margem. Depois caminha $40$ m pela margem até $B$ e mede $A\\hat{B}T = 60^\\circ$. Qual é a largura do rio?",
                        difficulty: "facil",
                        options: [
                            { text: "$80$ m", isCorrect: false },
                            { text: "$\\frac{40\\sqrt{3}}{3}$ m", isCorrect: false },
                            { text: "$40\\sqrt{3}$ m", isCorrect: true },
                            { text: "$20\\sqrt{3}$ m", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um topógrafo quer a altura de um morro cuja base é inacessível. Para aplicar o método das duas visadas, o que ele precisa medir?",
                        difficulty: "facil",
                        options: [
                            { text: "Apenas um ângulo de elevação e a distância do observador até a base do morro", isCorrect: false },
                            { text: "Os dois ângulos de elevação, sem precisar de nenhuma medida de distância", isCorrect: false },
                            { text: "A distância entre os dois pontos de visada e apenas o maior dos ângulos", isCorrect: false },
                            { text: "A distância entre os dois pontos de visada e os dois ângulos de elevação", isCorrect: true },
                        ],
                    },
                    {
                        statement: "De um ponto $A$ de terreno plano, o ângulo de elevação do topo de um morro é $30^\\circ$. Caminhando $90$ m em linha reta na direção do morro, até o ponto $B$, o ângulo de elevação passa a $60^\\circ$. Qual é a altura do morro?",
                        difficulty: "medio",
                        options: [
                            { text: "$45$ m", isCorrect: false },
                            { text: "$30\\sqrt{3}$ m", isCorrect: false },
                            { text: "$90\\sqrt{3}$ m", isCorrect: false },
                            { text: "$45\\sqrt{3}$ m", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Para achar a distância entre o ponto $B$, numa margem de lago, e o ponto $C$, na margem oposta, mede-se a base $AB = 60$ m na margem de $B$, o ângulo $C\\hat{A}B = 120^\\circ$ e o ângulo $A\\hat{B}C = 30^\\circ$. Qual é a distância de $B$ a $C$?",
                        difficulty: "medio",
                        options: [
                            { text: "$60$ m", isCorrect: false },
                            { text: "$20\\sqrt{3}$ m", isCorrect: false },
                            { text: "$60\\sqrt{3}$ m", isCorrect: true },
                            { text: "$30\\sqrt{3}$ m", isCorrect: false },
                        ],
                    },
                    {
                        statement: "De um ponto $A$, o ângulo de elevação do topo de uma torre de observação é $45^\\circ$. Andando $30$ m em linha reta na direção da torre, até o ponto $B$, o ângulo passa a $60^\\circ$. Usando $\\sqrt{3} \\approx 1{,}73$ e arredondando para o metro, qual é a altura da torre?",
                        difficulty: "dificil",
                        options: [
                            { text: "$30$ m", isCorrect: false },
                            { text: "$41$ m", isCorrect: false },
                            { text: "$71$ m", isCorrect: true },
                            { text: "$52$ m", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Direção, rumo e deslocamento",
                blocks: [
                    {
                        type: "text",
                        value: "# Direção, rumo e deslocamento\n\nUm barco sai do porto, navega um trecho, muda de direção e navega outro. No fim, a pergunta do comandante é simples: a que distância estamos do porto, e em que direção ele ficou?\n\nPara responder, duas coisas precisam de linguagem precisa: a direção e a distância. A distância é só um número com unidade. A direção, em navegação e em topografia, é dada sempre em relação ao norte.",
                    },
                    {
                        type: "text",
                        value: "## O rumo: ângulo medido a partir do norte\n\nO rumo de uma direção é o ângulo agudo que ela faz com a linha norte-sul, dito junto com os dois lados para os quais ele aponta. A notação é direta:\n\n- N $30^\\circ$ L: partindo do norte, gire $30^\\circ$ para o leste.\n- S $45^\\circ$ O: partindo do sul, gire $45^\\circ$ para o oeste.\n- N $0^\\circ$ é o norte puro, e uma direção leste pura é N $90^\\circ$ L.\n\nO detalhe que mais confunde é este: o ângulo do rumo é medido desde o norte (ou desde o sul), e não desde o leste. Quem mede a partir do leste troca seno por cosseno em todas as contas seguintes.",
                    },
                    {
                        type: "text",
                        value: "## Duas pernas e o ângulo entre elas\n\nUm trajeto de duas pernas desenha um triângulo: o ponto de partida $P$, o ponto do giro $Q$ e o ponto de chegada $C$. Os lados $PQ$ e $QC$ são conhecidos (são as distâncias navegadas) e o lado $PC$ é o que se quer.\n\nFalta o ângulo interno em $Q$, e aqui está o cuidado principal. Visto de $Q$, o porto $P$ ficou para trás, na direção oposta à da primeira perna. Se o barco girou $\\theta$ (o desvio de rota), o ângulo interno do triângulo em $Q$ é o suplemento desse desvio:\n\n$$Q = 180^\\circ - \\theta$$\n\nUm giro de $60^\\circ$ para a direita deixa $120^\\circ$ dentro do triângulo. Com dois lados e o ângulo entre eles em mãos, o caso é LAL, e quem resolve é a lei dos cossenos.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: a que distância está o porto\n\nUm navio parte do porto $P$, navega $30$ km rumo norte até $Q$, gira $60^\\circ$ para a direita (passando ao rumo N $60^\\circ$ L) e navega mais $50$ km até $C$.\n\nO ângulo interno em $Q$ é $180^\\circ - 60^\\circ = 120^\\circ$, e $\\cos 120^\\circ = -\\frac{1}{2}$:\n\n$$PC^2 = 30^2 + 50^2 - 2 \\cdot 30 \\cdot 50 \\cdot \\left(-\\frac{1}{2}\\right) = 900 + 2500 + 1500 = 4900$$\n\nLogo $PC = 70$ km. Repare no efeito do sinal: como o ângulo é obtuso, o cosseno é negativo e o termo entra somando, o que deixa a distância maior do que os $\\sqrt{30^2+50^2} \\approx 58$ km que um ângulo reto daria. Quem esquece o sinal do cosseno obtuso encontra $\\sqrt{1900} \\approx 44$ km e nem desconfia.",
                    },
                    {
                        type: "text",
                        value: "## O ângulo de retorno\n\nSabida a distância, a direção de volta sai da lei dos senos. No exemplo acima, o ângulo em $P$ é oposto ao lado $QC = 50$ km:\n\n$$\\frac{\\sin P}{50} = \\frac{\\sin 120^\\circ}{70} \\Rightarrow \\sin P = \\frac{50 \\cdot \\frac{\\sqrt{3}}{2}}{70} = \\frac{5\\sqrt{3}}{14} \\approx 0{,}62$$\n\nUma tabela de senos devolve $P \\approx 38^\\circ$. Como a primeira perna apontava para o norte, o ponto de chegada está a N $38^\\circ$ L do porto, e o rumo de volta, de $C$ para $P$, é o oposto: S $38^\\circ$ O.\n\nQuando as duas pernas têm o mesmo comprimento tudo fica exato. Com $20$ km, giro de $60^\\circ$ e outros $20$ km, o triângulo é isósceles com ângulo de $120^\\circ$ entre lados iguais, então os outros dois ângulos medem $30^\\circ$ cada, a chegada está a N $30^\\circ$ L do porto e a distância é $20\\sqrt{3} \\approx 35$ km. Cuidado para não generalizar: a direção só é a média dos dois rumos porque as pernas são iguais.",
                    },
                    {
                        type: "quote",
                        value: "O rumo responde para onde, a distância responde quanto, e o ângulo interno do triângulo é o suplemento do giro. Com esses três cuidados, a lei dos cossenos faz o resto.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: separando o deslocamento em norte e leste\n\nMuitas vezes interessa saber quanto o trajeto avançou em cada direção cardinal. Um avião voa $200$ km na direção N $60^\\circ$ L. Desenhe o triângulo retângulo cujo cateto vertical aponta para o norte e o horizontal para o leste: o deslocamento é a hipotenusa, e o ângulo de $60^\\circ$ está entre a hipotenusa e o cateto norte.\n\nLogo o cateto norte é o adjacente e o leste é o oposto:\n\n$$\\text{norte} = 200 \\cos 60^\\circ = 100 \\text{ km} \\quad \\text{e} \\quad \\text{leste} = 200 \\sin 60^\\circ = 100\\sqrt{3} \\approx 173 \\text{ km}$$\n\nA regra que evita a troca: a componente na direção de onde o ângulo foi medido usa cosseno. Como o rumo mede a partir do norte, o norte fica com o cosseno. Confira com Pitágoras: $100^2 + (100\\sqrt{3})^2 = 10\\,000 + 30\\,000 = 200^2$, exatamente a distância voada.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Rumo é ângulo medido a partir do norte ou do sul, com o lado indicado: N $30^\\circ$ L, S $45^\\circ$ O.\n- Num trajeto de duas pernas, o ângulo interno no ponto do giro é $180^\\circ$ menos o desvio de rota.\n- Dois lados e o ângulo entre eles: lei dos cossenos para a distância total.\n- Depois dela, lei dos senos para o ângulo que dá a direção de ida e a de volta.\n- Em ângulo obtuso o cosseno é negativo e o termo entra somando, aumentando a distância.\n- Para decompor um deslocamento: cosseno na direção de referência (o norte), seno na perpendicular (o leste).",
                    },
                    {
                        type: "quote",
                        value: "Trajeto com duas pernas é triângulo disfarçado. Achado o ângulo no ponto do giro, a navegação vira um exercício de lei dos cossenos.",
                    },
                ],
                questions: [
                    {
                        statement: "Um avião voa $100$ km na direção N $60^\\circ$ L, ou seja, $60^\\circ$ a leste do norte. Quantos quilômetros ele avançou na direção norte?",
                        difficulty: "facil",
                        options: [
                            { text: "$50$ km", isCorrect: true },
                            { text: "$50\\sqrt{3}$ km", isCorrect: false },
                            { text: "$25$ km", isCorrect: false },
                            { text: "$100$ km", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um barco segue rumo norte e, num certo ponto, gira $45^\\circ$ para a direita, passando ao rumo N $45^\\circ$ L. No triângulo formado pela partida, pelo ponto do giro e pela chegada, quanto mede o ângulo interno no ponto do giro?",
                        difficulty: "facil",
                        options: [
                            { text: "$45^\\circ$", isCorrect: false },
                            { text: "$90^\\circ$", isCorrect: false },
                            { text: "$135^\\circ$", isCorrect: true },
                            { text: "$120^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um veleiro parte do ponto $P$, navega $8$ km rumo norte até $Q$, gira $60^\\circ$ para a direita e navega mais $7$ km até $C$. Qual é a distância de $P$ a $C$?",
                        difficulty: "medio",
                        options: [
                            { text: "cerca de $10{,}6$ km", isCorrect: false },
                            { text: "$15$ km", isCorrect: false },
                            { text: "$13$ km", isCorrect: true },
                            { text: "cerca de $7{,}6$ km", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um barco parte de $P$, navega $20$ km rumo norte até $Q$, gira $60^\\circ$ para a direita e navega outros $20$ km até $C$. Em que direção está $C$ visto de $P$?",
                        difficulty: "medio",
                        options: [
                            { text: "S $30^\\circ$ O", isCorrect: false },
                            { text: "N $30^\\circ$ L", isCorrect: true },
                            { text: "N $60^\\circ$ L", isCorrect: false },
                            { text: "N $30^\\circ$ O", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um barco navega $40$ km rumo norte e, em seguida, $60$ km na direção N $60^\\circ$ L. Usando $\\sqrt{3} \\approx 1{,}73$ e arredondando para o quilômetro, quanto o trajeto todo avançou para o norte e quanto avançou para o leste?",
                        difficulty: "dificil",
                        options: [
                            { text: "$70$ km ao norte e $30$ km a leste", isCorrect: false },
                            { text: "$40$ km ao norte e cerca de $52$ km a leste", isCorrect: false },
                            { text: "$70$ km ao norte e cerca de $52$ km a leste", isCorrect: true },
                            { text: "cerca de $92$ km ao norte e $30$ km a leste", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Fenômeno periódico: do máximo e do mínimo ao modelo",
                blocks: [
                    {
                        type: "text",
                        value: "# Fenômeno periódico: do máximo e do mínimo ao modelo\n\nA maré sobe e desce duas vezes por dia. A temperatura média de uma cidade sobe e desce uma vez por ano. A cabine de uma roda-gigante sobe e desce a cada volta. Uma nota musical é a pressão do ar subindo e descendo centenas de vezes por segundo.\n\nSão fenômenos muito diferentes, mas têm a mesma assinatura: repetem o mesmo ciclo em intervalos iguais e oscilam entre um valor máximo e um valor mínimo. É exatamente o que a função seno faz, e por isso ela é o molde desses fenômenos.",
                    },
                    {
                        type: "text",
                        value: "## O molde\n\nO modelo padrão de um fenômeno periódico é\n\n$$h(t) = a + b \\sin(ct + d)$$\n\ncom os quatro parâmetros fazendo papéis distintos, já estudados nas funções trigonométricas:\n\n- $a$ é o nível médio, o eixo em volta do qual a oscilação acontece.\n- $|b|$ é a amplitude, o quanto o valor sobe (e desce) a partir desse eixo.\n- $c$ comanda a velocidade do ciclo: o período é $T = \\frac{2\\pi}{c}$.\n- $d$ é a fase, que desloca o gráfico no tempo e decide onde o ciclo começa.\n\nNa prática não se recebem os parâmetros, e sim as medidas: o maior valor, o menor valor, quanto tempo leva um ciclo e um instante conhecido. Montar o modelo é traduzir essas quatro informações.",
                    },
                    {
                        type: "text",
                        value: "## As três contas que montam o modelo\n\nChamando de $M$ o máximo e de $m$ o mínimo do fenômeno, e de $T$ o período:\n\n$$a = \\frac{M+m}{2} \\quad \\text{e} \\quad |b| = \\frac{M-m}{2} \\quad \\text{e} \\quad c = \\frac{2\\pi}{T}$$\n\nO eixo é a média entre máximo e mínimo, e a amplitude é a metade da variação total. Note que a variação total $M-m$ é o dobro da amplitude, e confundir uma com a outra é o erro mais comum deste assunto.\n\nA fase sai de um instante conhecido. O seno vale $1$ quando o seu argumento é $\\frac{\\pi}{2}$ e vale $-1$ quando é $-\\frac{\\pi}{2}$. Então, se o fenômeno atinge o máximo em $t = t_M$, basta impor $c\\,t_M + d = \\frac{\\pi}{2}$; se atinge o mínimo em $t = t_m$, impor $c\\,t_m + d = -\\frac{\\pi}{2}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: a maré\n\nNum canal, a profundidade varia entre $2$ m na maré baixa e $8$ m na maré alta, o ciclo completo leva $12$ horas e a maré alta ocorre às $3$ horas. Com $t$ em horas:\n\n$$a = \\frac{8+2}{2} = 5 \\quad |b| = \\frac{8-2}{2} = 3 \\quad c = \\frac{2\\pi}{12} = \\frac{\\pi}{6}$$\n\nA fase: o máximo em $t = 3$ pede $\\frac{\\pi}{6} \\cdot 3 + d = \\frac{\\pi}{2}$, ou seja, $\\frac{\\pi}{2} + d = \\frac{\\pi}{2}$, portanto $d = 0$. O modelo é $h(t) = 5 + 3\\sin\\left(\\frac{\\pi t}{6}\\right)$.\n\nQual a profundidade em $t = 1$ h? $h(1) = 5 + 3\\sin\\frac{\\pi}{6} = 5 + 3 \\cdot \\frac{1}{2} = 6{,}5$ m.\n\nE quando a profundidade é de $6{,}5$ m? Resolvendo $\\sin\\left(\\frac{\\pi t}{6}\\right) = \\frac{1}{2}$ dentro do primeiro ciclo, o arco vale $\\frac{\\pi}{6}$ ou $\\frac{5\\pi}{6}$, o que dá $t = 1$ h e $t = 5$ h: uma vez na subida e outra na descida, simétricas em torno da maré alta das $3$ horas.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: a roda-gigante\n\nUma roda-gigante tem $40$ m de diâmetro, o ponto mais baixo fica a $2$ m do chão e ela completa uma volta em $60$ s. A cabine embarca no ponto mais baixo, em $t = 0$.\n\nO ponto mais alto está a $2 + 40 = 42$ m, então $a = \\frac{42+2}{2} = 22$ e $|b| = \\frac{42-2}{2} = 20$. O período é $60$ s, logo $c = \\frac{2\\pi}{60} = \\frac{\\pi}{30}$. O mínimo em $t = 0$ pede $d = -\\frac{\\pi}{2}$:\n\n$$h(t) = 22 + 20\\sin\\left(\\frac{\\pi t}{30} - \\frac{\\pi}{2}\\right)$$\n\nDepois de $10$ s: o argumento é $\\frac{\\pi}{3} - \\frac{\\pi}{2} = -\\frac{\\pi}{6}$, e $\\sin\\left(-\\frac{\\pi}{6}\\right) = -\\frac{1}{2}$, então $h(10) = 22 - 10 = 12$ m.\n\nQuando a cabine passa pelos $32$ m? De $22 + 20\\sin(\\cdot) = 32$ vem $\\sin(\\cdot) = \\frac{1}{2}$, e o argumento é $\\frac{\\pi}{6}$ ou $\\frac{5\\pi}{6}$. O primeiro caso dá $\\frac{\\pi t}{30} = \\frac{\\pi}{6} + \\frac{\\pi}{2} = \\frac{2\\pi}{3}$, isto é, $t = 20$ s; o segundo dá $t = 40$ s, na descida. E em $t = 30$ s, meia volta, a cabine está no ponto mais alto: $h(30) = 42$ m.",
                    },
                    {
                        type: "quote",
                        value: "Máximo e mínimo dão o eixo e a amplitude. O período dá o $c$. Um instante conhecido dá a fase. Com essas três perguntas, qualquer oscilação cabe no molde.",
                    },
                    {
                        type: "text",
                        value: "## O erro de pôr o período no lugar de $c$\n\nÉ tentador escrever $h(t) = 5 + 3\\sin(12t)$ para uma maré de período $12$ horas, porque o $12$ aparece no enunciado. Mas $c$ não é o período: é $\\frac{2\\pi}{T}$. Com $c = 12$, o período do modelo passa a $\\frac{2\\pi}{12} \\approx 0{,}52$ hora, pouco mais de meia hora de maré, o que o bom senso recusa na hora.\n\nO teste rápido é avaliar o modelo em $t = T$: ao fim de um período, o fenômeno tem que estar de novo no mesmo valor de $t = 0$. No modelo correto, $h(12) = 5 + 3\\sin(2\\pi) = 5 = h(0)$, como se espera.\n\nSe o argumento estiver em graus, e não em radianos, a conta de $c$ muda para $\\frac{360}{T}$. Misturar as duas convenções no mesmo modelo é receita de resultado sem sentido, por isso vale fixar o radiano e manter.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Modelo padrão: $h(t) = a + b\\sin(ct+d)$.\n- $a = \\frac{M+m}{2}$ (média entre máximo e mínimo) e $|b| = \\frac{M-m}{2}$ (metade da variação).\n- $c = \\frac{2\\pi}{T}$, nunca o próprio período.\n- Fase: máximo em $t_M$ pede $c\\,t_M + d = \\frac{\\pi}{2}$; mínimo em $t_m$ pede $c\\,t_m + d = -\\frac{\\pi}{2}$.\n- Para avaliar o modelo, calcule o argumento primeiro e depois o seno.\n- Para saber quando o fenômeno atinge um valor, resolva a equação trigonométrica e lembre que, em cada ciclo, há em geral dois instantes: um na subida e outro na descida.",
                    },
                    {
                        type: "quote",
                        value: "Maré, temperatura, roda-gigante e som não têm nada em comum na aparência, mas cabem na mesma função de quatro parâmetros. É essa economia que faz da trigonometria uma ferramenta, e não uma coleção de fórmulas.",
                    },
                ],
                questions: [
                    {
                        statement: "A profundidade da água num cais varia entre $2$ m, na maré baixa, e $8$ m, na maré alta. No modelo $h(t) = a + b\\sin(ct+d)$, quanto vale a amplitude $|b|$?",
                        difficulty: "facil",
                        options: [
                            { text: "$5$ m", isCorrect: false },
                            { text: "$3$ m", isCorrect: true },
                            { text: "$6$ m", isCorrect: false },
                            { text: "$8$ m", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A maré de um porto repete o seu ciclo a cada $12$ horas. No modelo $h(t) = a + b\\sin(ct+d)$, com $t$ em horas e o argumento do seno em radianos, quanto vale $c$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{6}{\\pi}$", isCorrect: false },
                            { text: "$\\frac{\\pi}{12}$", isCorrect: false },
                            { text: "$\\frac{\\pi}{6}$", isCorrect: true },
                            { text: "$24\\pi$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A profundidade de um canal, em metros, é dada por $h(t) = 5 + 3\\sin\\left(\\frac{\\pi t}{6}\\right)$, com $t$ em horas. Qual é a profundidade em $t = 1$ h?",
                        difficulty: "medio",
                        options: [
                            { text: "$6{,}5$ m", isCorrect: true },
                            { text: "$8$ m", isCorrect: false },
                            { text: "$5$ m", isCorrect: false },
                            { text: "$3{,}5$ m", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma roda-gigante tem $40$ m de diâmetro, o seu ponto mais baixo fica a $2$ m do chão e ela completa uma volta em $60$ s. Uma cabine embarca no ponto mais baixo, em $t = 0$. Qual função dá a altura da cabine, em metros, depois de $t$ segundos?",
                        difficulty: "medio",
                        options: [
                            { text: "$h(t) = 22 + 20\\sin\\left(\\frac{\\pi t}{30} + \\frac{\\pi}{2}\\right)$", isCorrect: false },
                            { text: "$h(t) = 20 + 22\\sin\\left(\\frac{\\pi t}{30} - \\frac{\\pi}{2}\\right)$", isCorrect: false },
                            { text: "$h(t) = 22 + 20\\sin\\left(\\frac{\\pi t}{60} - \\frac{\\pi}{2}\\right)$", isCorrect: false },
                            { text: "$h(t) = 22 + 20\\sin\\left(\\frac{\\pi t}{30} - \\frac{\\pi}{2}\\right)$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A altura de uma cabine de roda-gigante, em metros, é $h(t) = 22 + 20\\sin\\left(\\frac{\\pi t}{30} - \\frac{\\pi}{2}\\right)$, com $t$ em segundos contados do embarque, no ponto mais baixo. Em que instante a cabine passa pela primeira vez pela altura de $32$ m?",
                        difficulty: "dificil",
                        options: [
                            { text: "$40$ s", isCorrect: false },
                            { text: "$22{,}5$ s", isCorrect: false },
                            { text: "$20$ s", isCorrect: true },
                            { text: "$5$ s", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Arco, setor e movimento circular",
                blocks: [
                    {
                        type: "text",
                        value: "# Arco, setor e movimento circular\n\nQuanto de fio se gasta para contornar uma curva de raio conhecido? Qual a área que um aspersor molha ao varrer um pedaço de círculo? A que velocidade anda um carrinho cuja roda gira a tantas rotações por minuto?\n\nAs três perguntas caem nas mesmas duas fórmulas, e nelas o radiano deixa de ser uma curiosidade e passa a ser a unidade obrigatória. Aqui aparece o pagamento do trabalho feito ao estudar a conversão entre grau e radiano.",
                    },
                    {
                        type: "text",
                        value: "## Comprimento de arco: $s = r\\theta$\n\nNum círculo de raio $r$, o arco determinado por um ângulo central de $\\theta$ radianos tem comprimento\n\n$$s = r\\theta$$\n\nA fórmula é a própria definição de radiano, escrita ao contrário: o radiano foi criado como arco dividido por raio, então arco é raio vezes ângulo. O teste de sanidade é a volta completa: com $\\theta = 2\\pi$, sai $s = 2\\pi r$, o comprimento da circunferência, como tem que ser.\n\nExemplo: num círculo de raio $6$ cm, o arco de $60^\\circ$ mede quanto? Primeiro a conversão, que é obrigatória: $60^\\circ = \\frac{\\pi}{3}$. Então $s = 6 \\cdot \\frac{\\pi}{3} = 2\\pi \\approx 6{,}3$ cm.",
                    },
                    {
                        type: "text",
                        value: "## Área do setor: $A = \\frac{1}{2}r^2\\theta$\n\nSetor circular é a fatia de pizza: a região entre dois raios e o arco que os une. A área sai de uma proporção simples. O círculo inteiro tem área $\\pi r^2$ e corresponde a $2\\pi$ radianos, então a fatia de $\\theta$ radianos fica com a fração $\\frac{\\theta}{2\\pi}$ disso:\n\n$$A = \\frac{\\theta}{2\\pi} \\cdot \\pi r^2 = \\frac{1}{2} r^2 \\theta$$\n\nExemplo: no mesmo círculo de raio $6$ cm, o setor de $60^\\circ = \\frac{\\pi}{3}$ tem área $A = \\frac{1}{2} \\cdot 36 \\cdot \\frac{\\pi}{3} = 6\\pi \\approx 18{,}8$ cm². Confere com a proporção: $60^\\circ$ é um sexto da volta, e um sexto de $36\\pi$ é $6\\pi$.\n\nHá ainda uma relação prática entre as duas fórmulas: $A = \\frac{1}{2} s r$. Quem já achou o arco não precisa de voltar ao ângulo.",
                    },
                    {
                        type: "text",
                        value: "## O que acontece se alguém esquecer de converter\n\nSuponha que, naquele arco, o $60$ fosse usado direto, em grau: $s = 6 \\cdot 60 = 360$ cm. Como a circunferência inteira do círculo de raio $6$ cm mede $12\\pi \\approx 37{,}7$ cm, um arco de $360$ cm equivaleria a quase dez voltas, para um ângulo que é um sexto de volta. Absurdo visível a olho nu.\n\nO fator do engano é sempre o mesmo: $\\frac{180}{\\pi} \\approx 57{,}3$. Usar grau no lugar de radiano infla o resultado em cerca de $57$ vezes no arco, e na área também, porque o $\\theta$ entra uma vez só em cada fórmula.\n\nA regra é dura e vale a pena memorizar: em $s = r\\theta$, em $A = \\frac{1}{2}r^2\\theta$ e em tudo o que vem a seguir nesta aula, $\\theta$ está em radianos. Se o enunciado deu grau, converta antes de qualquer outra coisa.",
                    },
                    {
                        type: "text",
                        value: "## Velocidade angular e velocidade linear\n\nNum movimento circular, a velocidade angular é o ângulo varrido por unidade de tempo:\n\n$$\\omega = \\frac{\\theta}{t}$$\n\nmedida em radianos por segundo (ou por minuto). Um ponto a distância $r$ do centro percorre o arco $s = r\\theta$ no mesmo tempo, então a sua velocidade ao longo da trajetória, chamada velocidade linear, é\n\n$$v = \\frac{s}{t} = \\frac{r\\theta}{t} = \\omega r$$\n\nRotação costuma vir em rotações por minuto (rpm), e aí a conversão é obrigatória: uma rotação é $2\\pi$ radianos e um minuto tem $60$ s, logo $1$ rpm $= \\frac{2\\pi}{60} = \\frac{\\pi}{30}$ radiano por segundo.\n\nExemplo: a roda de uma bicicleta tem raio $35$ cm e gira a $120$ rpm. Então $\\omega = 120 \\cdot \\frac{\\pi}{30} = 4\\pi \\approx 12{,}6$ radianos por segundo, e $v = \\omega r = 4\\pi \\cdot 0{,}35 = 1{,}4\\pi \\approx 4{,}4$ m/s. Repare que o raio entrou em metros, para a velocidade sair em metros por segundo.",
                    },
                    {
                        type: "quote",
                        value: "Em $s = r\\theta$, em $A = \\frac{1}{2}r^2\\theta$ e em $v = \\omega r$, o ângulo é sempre em radianos. Grau nessas fórmulas não é questão de estilo: é erro de conta.",
                    },
                    {
                        type: "text",
                        value: "## A engrenagem, a polia e o ponteiro do relógio\n\nDuas polias ligadas por uma correia que não escorrega têm a mesma velocidade linear na borda, porque a correia é a mesma. Então\n\n$$\\omega_1 r_1 = \\omega_2 r_2$$\n\nou seja, a polia menor gira mais rápido, na razão inversa dos raios. Com engrenagens dentadas a conclusão é a mesma, e o número de dentes faz o papel do raio.\n\nExemplo: uma polia de raio $10$ cm gira a $60$ rpm e arrasta outra de raio $4$ cm. Então $60 \\cdot 10 = n \\cdot 4$, logo $n = 150$ rpm. A menor gira duas vezes e meia mais rápido, como a razão $\\frac{10}{4}$ anuncia.\n\nO ponteiro dos minutos é outro caso pronto: ele varre $2\\pi$ em $60$ minutos, logo $\\omega = \\frac{\\pi}{30}$ radiano por minuto. Num relógio com ponteiro de $14$ cm, em $20$ minutos o ângulo varrido é $\\theta = \\frac{\\pi}{30} \\cdot 20 = \\frac{2\\pi}{3}$, e a ponta percorre $s = 14 \\cdot \\frac{2\\pi}{3} = \\frac{28\\pi}{3} \\approx 29{,}3$ cm.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- $s = r\\theta$ e $A = \\frac{1}{2}r^2\\theta$, com $\\theta$ em radianos, sempre.\n- Atalho útil: $A = \\frac{1}{2} s r$.\n- Grau esquecido na fórmula infla o resultado em cerca de $57$ vezes, e o absurdo aparece na comparação com a volta completa.\n- $\\omega = \\frac{\\theta}{t}$ e $v = \\omega r$, com $r$ na unidade em que se quer a velocidade.\n- De rpm para radiano por segundo: multiplique por $\\frac{2\\pi}{60} = \\frac{\\pi}{30}$.\n- Polias ou engrenagens acopladas: $\\omega_1 r_1 = \\omega_2 r_2$, a menor gira mais rápido.",
                    },
                    {
                        type: "quote",
                        value: "O radiano não foi inventado para complicar a conversão: foi inventado para que arco, área de setor e velocidade caibam em fórmulas sem nenhum fator de correção.",
                    },
                ],
                questions: [
                    {
                        statement: "Num círculo de raio $9$ cm, qual é o comprimento do arco correspondente a um ângulo central de $\\frac{\\pi}{3}$ radianos?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{27}{\\pi}$ cm", isCorrect: false },
                            { text: "$540$ cm", isCorrect: false },
                            { text: "$\\frac{27\\pi}{2}$ cm", isCorrect: false },
                            { text: "$3\\pi$ cm", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um eixo gira a $90$ rotações por minuto. Qual é a sua velocidade angular em radianos por segundo?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{3\\pi}{2}$ rad/s", isCorrect: false },
                            { text: "$180\\pi$ rad/s", isCorrect: false },
                            { text: "$6\\pi$ rad/s", isCorrect: false },
                            { text: "$3\\pi$ rad/s", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma pizza de raio $10$ cm é cortada em cinco fatias iguais, cada uma com ângulo central de $72^\\circ$. Qual é a área de uma fatia?",
                        difficulty: "medio",
                        options: [
                            { text: "$20\\pi$ cm²", isCorrect: true },
                            { text: "$3600$ cm²", isCorrect: false },
                            { text: "$40\\pi$ cm²", isCorrect: false },
                            { text: "$4\\pi$ cm²", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A roda de um carrinho tem raio de $40$ cm e gira a $300$ rotações por minuto, sem escorregar no chão. Qual é a velocidade do carrinho, em metros por segundo?",
                        difficulty: "medio",
                        options: [
                            { text: "$4\\pi$ m/s", isCorrect: true },
                            { text: "$120$ m/s", isCorrect: false },
                            { text: "$25\\pi$ m/s", isCorrect: false },
                            { text: "$400\\pi$ m/s", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Duas polias estão ligadas por uma correia que não escorrega. A maior tem raio $15$ cm e gira a $80$ rotações por minuto; a menor tem raio $6$ cm. A quantas rotações por minuto gira a polia menor?",
                        difficulty: "dificil",
                        options: [
                            { text: "$80$ rpm", isCorrect: false },
                            { text: "$2{,}5$ rpm", isCorrect: false },
                            { text: "$200$ rpm", isCorrect: true },
                            { text: "$32$ rpm", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Problema de várias etapas e a conferência do resultado",
                blocks: [
                    {
                        type: "text",
                        value: "# Problema de várias etapas e a conferência do resultado\n\nProblema de verdade não vem com a etiqueta use a lei dos senos. Em geral ele pede duas ferramentas em sequência: uma para achar o que falta, outra para responder o que foi perguntado. E, no fim, pede uma coisa que a escola raramente cobra: conferir.\n\nEsta aula é sobre essas duas habilidades. Encadear ferramentas e desconfiar do próprio resultado é o que separa quem sabe trigonometria de quem decorou fórmulas.",
                    },
                    {
                        type: "text",
                        value: "## A conferência: cinco perguntas rápidas\n\nAntes de entregar uma resposta, passe por esta lista:\n\n1. **A unidade do ângulo está certa?** Em $s = r\\theta$, em $A = \\frac{1}{2}r^2\\theta$ e em $v = \\omega r$, só radiano serve. Em seno, cosseno e tangente de ângulo de triângulo, grau é o usual, e o $^\\circ$ precisa aparecer.\n2. **O seno saiu entre $-1$ e $1$?** Se deu $1{,}4$, há erro de conta ou os dados não formam triângulo. Cosseno obedece ao mesmo limite.\n3. **O maior lado está oposto ao maior ângulo?** Essa correspondência nunca falha num triângulo, e pega troca de lado com ângulo na hora.\n4. **A ordem de grandeza faz sentido?** Um arco não pode passar a circunferência, uma altura de morro não tem $4$ km, um carrinho não anda a $1\\,200$ m/s.\n5. **O caso extremo se comporta como esperado?** Faça o ângulo tender a zero, ou a $90^\\circ$, e veja se a fórmula devolve o que a geometria manda.",
                    },
                    {
                        type: "text",
                        value: "## Problema 1: do lado desconhecido até a área\n\nUm terreno triangular $ABC$ tem o lado $AB = 40$ m, o ângulo em $A$ medindo $30^\\circ$ e o ângulo em $B$ medindo $120^\\circ$. Qual é a área do terreno?\n\n**Etapa 1, lei dos senos.** O terceiro ângulo é $C = 180^\\circ - 30^\\circ - 120^\\circ = 30^\\circ$. O lado $AB$ é oposto a $C$, e o lado $BC$ é oposto a $A$:\n\n$$\\frac{BC}{\\sin 30^\\circ} = \\frac{40}{\\sin 30^\\circ} \\Rightarrow BC = 40 \\text{ m}$$\n\nTambém dá para achar $AC = \\frac{40 \\sin 120^\\circ}{\\sin 30^\\circ} = 40\\sqrt{3} \\approx 69{,}3$ m.\n\n**Etapa 2, área pelo seno.** Com os dois lados que cercam o ângulo em $B$:\n\n$$A = \\frac{1}{2} \\cdot BA \\cdot BC \\cdot \\sin 120^\\circ = \\frac{1}{2} \\cdot 40 \\cdot 40 \\cdot \\frac{\\sqrt{3}}{2} = 400\\sqrt{3} \\approx 693 \\text{ m}^2$$\n\n**Conferência.** O maior lado é $AC \\approx 69{,}3$ m e está oposto ao maior ângulo, os $120^\\circ$ em $B$. A área também sai por base e altura: tomando $AC$ como base, a altura é $AB \\sin 30^\\circ = 20$ m, e $\\frac{1}{2} \\cdot 69{,}3 \\cdot 20 \\approx 693$ m². Dois caminhos, o mesmo número.",
                    },
                    {
                        type: "text",
                        value: "## Problema 2: triângulo retângulo e depois setor circular\n\nUm holofote está no topo de um poste de $9$ m e ilumina o chão. Do bordo da região iluminada, o ângulo de elevação até o holofote é $30^\\circ$. O holofote varre $120^\\circ$ na horizontal. Qual é a área iluminada?\n\n**Etapa 1, triângulo retângulo.** O alcance $r$ no chão é o cateto adjacente ao ângulo de elevação, e a altura do poste é o oposto:\n\n$$\\tan 30^\\circ = \\frac{9}{r} \\Rightarrow r = \\frac{9}{\\tan 30^\\circ} = 9\\sqrt{3} \\approx 15{,}6 \\text{ m}$$\n\n**Etapa 2, setor circular.** Convertendo o ângulo, $120^\\circ = \\frac{2\\pi}{3}$, e usando $r^2 = (9\\sqrt{3})^2 = 243$:\n\n$$A = \\frac{1}{2} \\cdot 243 \\cdot \\frac{2\\pi}{3} = 81\\pi \\approx 254 \\text{ m}^2$$\n\n**Conferência.** Os $120^\\circ$ são um terço da volta. O círculo todo de raio $9\\sqrt{3}$ tem área $243\\pi \\approx 763$ m², e um terço disso é $81\\pi$. Confere. Caso extremo: se o holofote girasse $360^\\circ$, a fórmula daria $\\frac{1}{2} \\cdot 243 \\cdot 2\\pi = 243\\pi$, o círculo inteiro, como manda a geometria.",
                    },
                    {
                        type: "text",
                        value: "## Problema 3: três lados, um ângulo e duas conferências\n\nUm terreno triangular tem lados de $5$ m, $7$ m e $8$ m. Qual é o ângulo oposto ao lado de $7$ m, e qual é a área?\n\n**Etapa 1, lei dos cossenos.** Chamando de $\\beta$ o ângulo oposto ao lado $7$, que fica entre os lados $5$ e $8$:\n\n$$\\cos\\beta = \\frac{5^2 + 8^2 - 7^2}{2 \\cdot 5 \\cdot 8} = \\frac{25 + 64 - 49}{80} = \\frac{40}{80} = \\frac{1}{2}$$\n\nLogo $\\beta = 60^\\circ$, um arco notável, sinal de que o problema foi montado para fechar.\n\n**Etapa 2, área pelo seno.** Os lados $5$ e $8$ cercam $\\beta$:\n\n$$A = \\frac{1}{2} \\cdot 5 \\cdot 8 \\cdot \\sin 60^\\circ = 20 \\cdot \\frac{\\sqrt{3}}{2} = 10\\sqrt{3} \\approx 17{,}3 \\text{ m}^2$$\n\n**Conferência 1, por Heron.** Com semiperímetro $p = \\frac{5+7+8}{2} = 10$: $\\sqrt{10 \\cdot 5 \\cdot 3 \\cdot 2} = \\sqrt{300} = 10\\sqrt{3}$. O mesmo valor, por um caminho que não usa ângulo nenhum.\n\n**Conferência 2, maior lado e maior ângulo.** O ângulo oposto ao lado $8$ tem $\\cos = \\frac{25+49-64}{2 \\cdot 5 \\cdot 7} = \\frac{1}{7}$, positivo e pequeno, então esse ângulo é agudo e perto de $90^\\circ$, o maior dos três. Coerente com $8^2 = 64 < 5^2 + 7^2 = 74$, que já anunciava triângulo acutângulo.",
                    },
                    {
                        type: "quote",
                        value: "Duas rotas que chegam ao mesmo número valem mais do que uma rota feita com pressa.",
                    },
                    {
                        type: "text",
                        value: "## Quando o resultado não passa na conferência\n\nReprovar na conferência é bom: significa que o erro foi pego antes de valer nota. A ordem de revisão que mais resolve é esta:\n\n- **Releia o que foi pedido.** Muita resposta errada é um passo intermediário correto: a questão pediu a altura e foi entregue a hipotenusa, ou pediu o arco e foi entregue o ângulo.\n- **Confira a unidade do ângulo.** Resultado cerca de $57$ vezes maior que o esperado é a assinatura do grau usado onde pede radiano.\n- **Confira quem é oposto a quem.** Na lei dos senos, cada lado emparelha com o ângulo oposto a ele, não com o ângulo vizinho.\n- **Confira o sinal do cosseno.** Ângulo obtuso tem cosseno negativo, e na lei dos cossenos esse sinal faz o termo somar em vez de subtrair.\n- **Refaça por outro caminho.** Área por Heron contra área pelo seno, ou a segunda visada contra a primeira.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Problema de várias etapas: identifique o que falta, escolha a ferramenta que acha isso e só depois responda à pergunta.\n- Lei dos senos ou lei dos cossenos para completar o triângulo, área pelo seno ou setor circular para fechar.\n- Cinco perguntas de conferência: unidade do ângulo, seno entre $-1$ e $1$, maior lado oposto ao maior ângulo, ordem de grandeza e caso extremo.\n- Heron contra área pelo seno é a conferência mais barata que existe em triângulo com três lados conhecidos.\n- Dado impossível também existe: seno maior que $1$ denuncia enunciado ou conta errada.\n- Guardar o valor exato (com $\\sqrt{3}$, com $\\pi$) e arredondar só no fim evita que o erro de arredondamento se acumule.",
                    },
                    {
                        type: "quote",
                        value: "A trigonometria termina onde começou: medindo o que não se alcança. O que se aprende no caminho é o hábito de perguntar se a medida faz sentido, hábito que segue útil mais adiante, no estudo de funções e em cálculo, quando seno e cosseno voltam em outro papel.",
                    },
                ],
                questions: [
                    {
                        statement: "Resolvendo um triângulo pela lei dos senos, um aluno chegou a $\\sin \\alpha = 1{,}4$. O que isso indica?",
                        difficulty: "facil",
                        options: [
                            { text: "Que basta subtrair $1$ do resultado e seguir com $\\sin \\alpha = 0{,}4$", isCorrect: false },
                            { text: "Que o ângulo é obtuso, caso em que o seno passa de $1$", isCorrect: false },
                            { text: "Que a conta tem erro ou os dados não formam triângulo", isCorrect: true },
                            { text: "Que o triângulo é retângulo, com $\\alpha$ medindo $90^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para achar a área de um setor circular de raio $6$ cm e ângulo central de $30^\\circ$, um aluno escreveu $\\frac{1}{2} \\cdot 6^2 \\cdot 30 = 540$ cm². O que está errado e qual é a área correta?",
                        difficulty: "facil",
                        options: [
                            { text: "Ele usou grau na fórmula; com $\\theta = \\frac{\\pi}{6}$, a área é $6\\pi$ cm²", isCorrect: false },
                            { text: "Nada está errado, porque a fórmula aceita grau; a área é $540$ cm²", isCorrect: false },
                            { text: "Ele esqueceu de elevar o raio ao quadrado; a área é $90$ cm²", isCorrect: false },
                            { text: "Ele usou grau na fórmula; com $\\theta = \\frac{\\pi}{6}$, a área é $3\\pi$ cm²", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Num terreno triangular $ABC$, o lado $AB$ mede $20$ m e os ângulos em $A$ e em $B$ medem $45^\\circ$ cada. Qual é a área do terreno?",
                        difficulty: "medio",
                        options: [
                            { text: "$100$ m²", isCorrect: true },
                            { text: "$100\\sqrt{2}$ m²", isCorrect: false },
                            { text: "$50\\sqrt{2}$ m²", isCorrect: false },
                            { text: "$200$ m²", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um refletor está no topo de uma torre de $12$ m e ilumina o chão num setor circular. Do bordo da região iluminada, o ângulo de elevação até o refletor é $60^\\circ$, e o refletor varre $90^\\circ$ na horizontal. Qual é a área iluminada?",
                        difficulty: "medio",
                        options: [
                            { text: "$108\\pi$ m²", isCorrect: false },
                            { text: "$24\\pi$ m²", isCorrect: false },
                            { text: "$48\\pi$ m²", isCorrect: false },
                            { text: "$12\\pi$ m²", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um terreno triangular tem lados de $6$ m, $10$ m e $14$ m. Qual é a área desse terreno?",
                        difficulty: "dificil",
                        options: [
                            { text: "$15\\sqrt{3}$ m²", isCorrect: true },
                            { text: "$30\\sqrt{3}$ m²", isCorrect: false },
                            { text: "$15$ m²", isCorrect: false },
                            { text: "$42$ m²", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
] as unknown as Modulo[];

async function seed() {
    mesclarSolucoes(MODULOS, "trigonometria");
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO, workloadHours: HORAS })
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
