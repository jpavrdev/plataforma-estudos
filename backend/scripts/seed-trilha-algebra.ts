// Seed da trilha Álgebra. Conteúdo autoral, quiz-only, com fórmulas em LaTeX
// ($...$ inline e $$...$$ em bloco). As resoluções passo a passo ficam em
// scripts/solucoes/algebra.json e entram por mesclarSolucoes. Idempotente: se a
// trilha já tiver aulas, só atualiza as explicações.
//
// As alternativas já saem embaralhadas do gerador, com semente no enunciado. Sem
// isso a correta ficaria em position 1 em toda questão e o gabarito do e-book, que
// não passa pelo backend, sairia todo em A.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-algebra.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { backfillExplicacoes, mesclarSolucoes } from "./backfill-explicacoes.ts";

const NOME = "Álgebra";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const HORAS = 20;
const DESCRICAO =
    "A álgebra do ensino médio inteira, da letra ao determinante: linguagem algébrica, produtos notáveis e fatoração, equações e sistemas do primeiro e do segundo grau, inequações (produto, quociente e módulo), polinômios com divisão, teorema do resto e relações de Girard, progressões aritmética e geométrica, análise combinatória e binômio de Newton, e números complexos na forma algébrica e na trigonométrica. Cada assunto entra pelo problema que ele resolve, com a conta aparecendo e com resolução passo a passo em toda questão.";

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
        titulo: "Módulo 1 - A linguagem algébrica",
        aulas: [
            {
                titulo: "Por que letra: padrão, incógnita e variável",
                blocks: [
                    {
                        type: "text",
                        value: "# Por que letra: padrão, incógnita e variável\n\nMonte uma fileira de quadrados com palitos de sorvete. O primeiro quadrado gasta $4$ palitos. Para o segundo, você não precisa de outros $4$: o lado que ele divide com o primeiro já está no lugar, então bastam $3$ palitos novos. O terceiro também pede $3$, e assim por diante.\n\n| Quadrados na fileira | Palitos usados |\n| --- | --- |\n| $1$ | $4$ |\n| $2$ | $7$ |\n| $3$ | $10$ |\n| $4$ | $13$ |\n\nA pergunta que interessa não é quantos palitos tem a fileira de $4$ quadrados, que dá para contar na mão. É quantos palitos tem a fileira de $50$ quadrados, ou de $n$ quadrados, sem montar nenhuma delas. Para responder isso em uma linha só, a matemática usa letra.",
                    },
                    {
                        type: "text",
                        value: "## A letra que generaliza um padrão\n\nOlhe a tabela com atenção: de uma linha para a outra o total cresce sempre $3$. Começamos com $4$ palitos e acrescentamos $3$ para cada quadrado depois do primeiro, ou seja, $n - 1$ vezes:\n\n$$P = 4 + 3 \\cdot (n - 1)$$\n\nAbrindo a conta, $4 + 3n - 3 = 3n + 1$, de modo que\n\n$$P = 3n + 1$$\n\nOutra forma de ver a mesma coisa: cada um dos $n$ quadrados entra com $3$ palitos (o de cima, o de baixo e o da direita), e sobra um palito solto na ponta esquerda, o primeiro de todos. Daí $3n + 1$.\n\nVale conferir nos casos que já conhecemos: para $n = 1$, temos $3 \\cdot 1 + 1 = 4$; para $n = 3$, temos $3 \\cdot 3 + 1 = 10$; para $n = 4$, temos $3 \\cdot 4 + 1 = 13$. Bate com a tabela inteira. E a fileira de $50$ quadrados agora sai de cabeça: $3 \\cdot 50 + 1 = 151$ palitos.\n\nRepare no que a letra $n$ é aqui. Ela não esconde um número específico: ela vale por todos de uma vez. É a letra que **generaliza um padrão**.",
                    },
                    {
                        type: "text",
                        value: "## A letra como incógnita\n\nAgora um uso bem diferente. Alguém pensou num número, multiplicou por $4$, tirou $3$ do resultado e chegou a $25$. Qual era o número?\n\nEsse número existe, é um só, e nós não sabemos qual é. Chamá-lo de $x$ permite escrever o enunciado inteiro em uma linha:\n\n$$4x - 3 = 25$$\n\nA letra aqui é uma **incógnita**: o nome provisório de um valor fixo e desconhecido. Traduzir o problema para essa linha já é boa parte do trabalho, porque transforma uma história em uma sentença matemática.\n\nDá até para testar um palpite. Com $x = 7$ temos $4 \\cdot 7 - 3 = 28 - 3 = 25$, e a sentença fica verdadeira, então $7$ serve. As técnicas para achar esse valor sem depender de palpite vêm mais adiante; nesta aula o que importa é saber nomear o desconhecido e escrever a sentença certa.",
                    },
                    {
                        type: "text",
                        value: "## A letra como variável\n\nUma oficina cobra $40$ reais pela visita mais $30$ reais por hora de trabalho. O valor $V$ de um serviço de $h$ horas é\n\n$$V = 40 + 30h$$\n\nAqui $h$ não é um valor desconhecido que alguém precisa descobrir: é um valor que **varia** conforme o caso. Cada escolha de $h$ devolve um $V$. Um serviço de $2$ horas custa $40 + 30 \\cdot 2 = 100$ reais, e um de $3$ horas custa $40 + 30 \\cdot 3 = 130$ reais.\n\nEssa é a letra como **variável**, o papel que ela cumpre dentro de uma fórmula. O mesmo acontece em $P = 2(b + a)$ para o perímetro do retângulo de base $b$ e altura $a$, ou em $d = vt$ para a distância percorrida: a fórmula vale para qualquer valor, e quem usa escolhe quais entram.",
                    },
                    {
                        type: "text",
                        value: "## As convenções da escrita algébrica\n\nA escrita algébrica economiza sinais, e essa economia tem regras fixas:\n\n- O sinal de multiplicação entre número e letra desaparece: $3x$ significa $3 \\cdot x$. Entre dois números ele continua, senão $3 \\cdot 5$ viraria $35$.\n- O número que multiplica as letras é o **coeficiente**, e o conjunto das letras com seus expoentes é a **parte literal**.\n- Coeficiente $1$ não se escreve: $x$ é o mesmo que $1x$. Coeficiente $-1$ aparece só como sinal: $-x$ é $-1 \\cdot x$.\n- Letra multiplicada por ela mesma vira potência: $x \\cdot x = x^2$.\n- Dividir por um número é multiplicar pela fração: $\\frac{x}{2}$ é o mesmo que $\\frac{1}{2}x$.\n\n| Expressão | Coeficiente | Parte literal |\n| --- | --- | --- |\n| $5x^3$ | $5$ | $x^3$ |\n| $-7a^2b$ | $-7$ | $a^2b$ |\n| $xy$ | $1$ | $xy$ |\n| $\\frac{2m}{3}$ | $\\frac{2}{3}$ | $m$ |",
                    },
                    {
                        type: "text",
                        value: "## O erro de ler $2x$ como \"vinte e tanto\"\n\nNo nosso jeito de escrever números, algarismos lado a lado se somam por valor de posição: $23$ é $20 + 3$. Letra ao lado de número não segue essa regra. Ali a operação é multiplicação, e só multiplicação.\n\nEntão $2x$ com $x = 5$ vale $2 \\cdot 5 = 10$, e não $25$. Quem lê $2x$ como \"vinte e $x$\" erra em toda substituição que fizer depois, e o estrago aparece longe da origem.\n\nA mesma confusão ataca $xy$, que é $x$ vezes $y$ e nunca um número de dois algarismos. E ataca o número misto: na aritmética escolar $2\\frac{1}{2}$ significa $2 + \\frac{1}{2}$, mas em álgebra essa escrita seria lida como produto. Por isso, em álgebra, número misto não se usa: escreve-se $\\frac{5}{2}$.",
                    },
                    {
                        type: "text",
                        value: "## Os três papéis lado a lado\n\n| Papel da letra | O que ela representa | Exemplo |\n| --- | --- | --- |\n| Padrão | qualquer caso de uma família | $P = 3n + 1$ |\n| Incógnita | um valor fixo e desconhecido | $4x - 3 = 25$ |\n| Variável | um valor que você escolhe | $V = 40 + 30h$ |\n\nReconhecer o papel muda a pergunta que você faz. Diante de um padrão, você quer a expressão. Diante de uma incógnita, você quer o valor. Diante de uma variável, você quer o resultado para o valor que interessa naquele momento. A letra é a mesma; o que muda é o que se espera dela.",
                    },
                    {
                        type: "quote",
                        value: "A letra em álgebra faz três trabalhos: generaliza um padrão, nomeia uma incógnita e representa a variável de uma fórmula. O que não muda nunca é a convenção de escrita, em que número junto de letra multiplica e jamais forma um número de dois algarismos.",
                    },
                ],
                questions: [
                    {
                        statement: "Numa fileira de quadrados feitos com palitos, o total de palitos de $n$ quadrados é $3n + 1$. Quantos palitos tem a fileira de $10$ quadrados?",
                        difficulty: "facil",
                        options: [
                            { text: "$40$", isCorrect: false },
                            { text: "$30$", isCorrect: false },
                            { text: "$31$", isCorrect: true },
                            { text: "$13$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Na expressão $-9m^3n$, o coeficiente e a parte literal são, respectivamente:",
                        difficulty: "facil",
                        options: [
                            { text: "$-9$ e $m^3n$", isCorrect: true },
                            { text: "$-9$ e $3n$", isCorrect: false },
                            { text: "$9$ e $-m^3n$", isCorrect: false },
                            { text: "$3$ e $-9mn$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Alguém pensou num número, multiplicou por $5$, somou $2$ ao resultado e obteve $37$. Chamando o número de $x$, qual sentença traduz esse enunciado?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{x}{5} + 2 = 37$", isCorrect: false },
                            { text: "$5(x + 2) = 37$", isCorrect: false },
                            { text: "$5x - 2 = 37$", isCorrect: false },
                            { text: "$5x + 2 = 37$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma oficina cobra $40$ reais de visita mais $30$ reais por hora de trabalho, de modo que o valor de um serviço de $h$ horas é $V = 40 + 30h$. Quanto custa um serviço de $4$ horas?",
                        difficulty: "medio",
                        options: [
                            { text: "$74$ reais", isCorrect: false },
                            { text: "$280$ reais", isCorrect: false },
                            { text: "$160$ reais", isCorrect: true },
                            { text: "$120$ reais", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Ainda na fileira de palitos, em que $P = 3n + 1$, a fileira de $5$ quadrados usa $16$ palitos. Qual afirmação sobre a fileira de $10$ quadrados está correta?",
                        difficulty: "dificil",
                        options: [
                            { text: "Usa $30$ palitos, pois basta triplicar o número $10$", isCorrect: false },
                            { text: "Usa $40$ palitos, pois cada quadrado gasta $4$ deles", isCorrect: false },
                            { text: "Usa $31$ palitos, um a menos do que o dobro de $16$", isCorrect: true },
                            { text: "Usa $32$ palitos, exatamente o dobro de $16$ palitos", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Expressões algébricas e valor numérico",
                blocks: [
                    {
                        type: "text",
                        value: "# Expressões algébricas e valor numérico\n\nUma expressão algébrica é uma receita de conta escrita com letras. Enquanto as letras estão lá, a receita vale para todos os casos de uma vez. Quando você troca cada letra por um número, a receita executa e devolve um resultado: esse resultado é o **valor numérico** da expressão.\n\nPor exemplo, o custo de uma festa com $x$ convidados, a $8$ reais por pessoa, mais $50$ reais fixos de aluguel do salão, é $8x + 50$. Para $x = 20$, o valor numérico é $8 \\cdot 20 + 50 = 210$, ou seja, $210$ reais. Trocar $20$ por qualquer outro número dá o custo daquele outro caso, sem refazer o raciocínio uma única vez.\n\nNesta aula aprendemos a ler uma expressão por dentro (quais são as suas partes, qual é o seu grau, o que nela pode ser encurtado) e a calcular o valor numérico sem errar o sinal, que é onde quase todo mundo escorrega.",
                    },
                    {
                        type: "text",
                        value: "## Monômio: coeficiente e parte literal\n\n**Monômio** é uma expressão formada só por multiplicações entre um número e potências de letras com expoente natural. O número é o **coeficiente** e o bloco de letras é a **parte literal**.\n\nSão monômios: $5x^3$, que tem coeficiente $5$ e parte literal $x^3$; $-7a^2b$, com coeficiente $-7$ e parte literal $a^2b$; $\\frac{2m}{3}$, com coeficiente $\\frac{2}{3}$; e até $9$, que é um monômio sem parte literal.\n\nNão são monômios: $x + 1$, porque tem soma e não apenas produto; $\\frac{3}{x}$, porque a letra está no denominador; e $\\sqrt{x}$, porque o expoente não é um número natural.\n\nUma soma de monômios é um **polinômio**, e cada monômio dessa soma é um **termo** dele. Em $2x^3y - 5x^2 + 7$ existem três termos.",
                    },
                    {
                        type: "text",
                        value: "## Grau de um monômio e de um polinômio\n\nO **grau de um monômio** é a soma dos expoentes da parte literal. Em $-6x^3y^2$ somamos $3 + 2$, então o grau é $5$. Em $5x$ o expoente é $1$, e o grau é $1$. Em $9$ não há letra nenhuma, e o grau é $0$.\n\nO **grau de um polinômio** é o maior grau entre os seus termos. Veja $2x^3y - 5x^2 + 7$:\n\n| Termo | Soma dos expoentes | Grau |\n| --- | --- | --- |\n| $2x^3y$ | $3 + 1$ | $4$ |\n| $-5x^2$ | $2$ | $2$ |\n| $7$ | nenhum | $0$ |\n\nO maior é $4$, então o polinômio tem grau $4$. Repare que o coeficiente não entra nessa conta: o $2$ de $2x^3y$ não acrescenta nada ao grau, e o $-5$ de $-5x^2$ também não.",
                    },
                    {
                        type: "text",
                        value: "## Termos semelhantes e a redução deles\n\nDois termos são **semelhantes** quando têm exatamente a mesma parte literal, isto é, as mesmas letras com os mesmos expoentes. O coeficiente pode ser qualquer um.\n\n- $5x^2$ e $-2x^2$ são semelhantes, porque a parte literal dos dois é $x^2$.\n- $5x^2$ e $5x^3$ não são semelhantes, porque $x^2$ e $x^3$ são partes literais diferentes.\n- $4x^2y$ e $4xy^2$ não são semelhantes: as letras são as mesmas, mas os expoentes estão trocados de lugar.\n\nTermos semelhantes se juntam somando apenas os coeficientes e repetindo a parte literal. É a mesma ideia de somar $5$ caixas com $3$ caixas e obter $8$ caixas: o que se soma é a quantidade, não a caixa.\n\n$$7a - 3b + 2a + 5b = (7 + 2)a + (-3 + 5)b = 9a + 2b$$\n\nTermos que não são semelhantes ficam como estão. Em $3x + 2y$ não há nada a reduzir, e escrever $5xy$ ali é erro grave, porque muda a expressão.",
                    },
                    {
                        type: "text",
                        value: "## Um exemplo de redução com duas letras\n\nReduza a expressão $4x^2y + 3xy^2 - x^2y + 5xy^2$.\n\nSepare os termos por parte literal. Os termos em $x^2y$ são $4x^2y$ e $-x^2y$, e aqui vale lembrar que $-x^2y$ tem coeficiente $-1$:\n\n$$4x^2y - x^2y = (4 - 1)x^2y = 3x^2y$$\n\nOs termos em $xy^2$ são $3xy^2$ e $5xy^2$:\n\n$$3xy^2 + 5xy^2 = (3 + 5)xy^2 = 8xy^2$$\n\nO resultado é $3x^2y + 8xy^2$, e a redução para aí, porque $x^2y$ e $xy^2$ não são semelhantes. Quem trata os quatro termos como semelhantes soma $4 + 3 - 1 + 5$ e chega a um único termo, o que está errado: a expressão original tem duas partes literais diferentes e a resposta tem que ter duas também.",
                    },
                    {
                        type: "text",
                        value: "## Calculando o valor numérico, com parênteses\n\nPara achar o valor numérico, troque cada letra pelo número e faça a conta respeitando a ordem das operações: potência antes de multiplicação, multiplicação antes de soma.\n\nCalcule $E = 2a^2 - 3ab$ para $a = 3$ e $b = -2$. A regra de ouro é escrever o número negativo entre parênteses na hora de substituir:\n\n$$E = 2 \\cdot (3)^2 - 3 \\cdot (3) \\cdot (-2)$$\n\n$$E = 2 \\cdot 9 + 18 = 18 + 18 = 36$$\n\nO segundo termo merece atenção: $-3 \\cdot 3 \\cdot (-2)$ dá $+18$, porque menos vezes menos dá mais. Quem substitui $b$ por $2$ e perde o sinal pelo caminho chega a $18 - 18 = 0$, um resultado redondo e convincente, só que errado.",
                    },
                    {
                        type: "text",
                        value: "## $-x^2$ e $(-x)^2$ não são a mesma coisa\n\nEsta é a confusão de sinal que mais custa ponto em prova, e vale olhar devagar.\n\nO expoente gruda apenas no símbolo imediatamente à esquerda dele. Em $-x^2$, o expoente pertence ao $x$, e o sinal de menos é aplicado depois, ao resultado da potência. Em $(-x)^2$, o parêntese faz o expoente valer para $-x$ inteiro.\n\nSubstitua $x = -3$ nos dois e compare:\n\n$$-x^2 = -(-3)^2 = -(9) = -9$$\n\n$$(-x)^2 = (-(-3))^2 = (3)^2 = 9$$\n\nUm dá $-9$ e o outro dá $9$. A mesma diferença aparece com números soltos: $-3^2 = -9$, mas $(-3)^2 = 9$.\n\nA moral prática é dupla. Primeiro: ao substituir, ponha o número entre parênteses sempre, mesmo quando parecer exagero. Segundo: não acrescente nem apague os parênteses que já estavam na expressão, porque eles é que decidem o alcance do expoente.",
                    },
                    {
                        type: "text",
                        value: "## Segundo exemplo, com o sinal no lugar certo\n\nCalcule $E = -x^2 + 5x$ para $x = -2$.\n\nSubstituindo com parênteses:\n\n$$E = -(-2)^2 + 5 \\cdot (-2)$$\n\nPrimeiro a potência: $(-2)^2 = 4$. O sinal de menos da frente age sobre esse $4$, então a primeira parcela é $-4$. A segunda parcela é $5 \\cdot (-2) = -10$. Somando:\n\n$$E = -4 - 10 = -14$$\n\nVeja os dois desvios possíveis. Quem deixa o menos entrar no quadrado obtém $+4$ na primeira parcela e termina em $4 - 10 = -6$. Quem esquece o sinal de $x$ no segundo termo termina em $-4 + 10 = 6$. Os três resultados parecem razoáveis à primeira vista, e só o cuidado com o parêntese separa o certo dos outros dois.",
                    },
                    {
                        type: "quote",
                        value: "Monômio tem coeficiente e parte literal, e seu grau é a soma dos expoentes das letras. Só se reduzem termos semelhantes, ou seja, de parte literal idêntica. E ao substituir um valor negativo o parêntese não é enfeite: $-x^2$ e $(-x)^2$ dão resultados diferentes.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o grau do monômio $-4a^5b^3$?",
                        difficulty: "facil",
                        options: [
                            { text: "$3$", isCorrect: false },
                            { text: "$12$", isCorrect: false },
                            { text: "$8$", isCorrect: true },
                            { text: "$5$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual dos pares a seguir é formado por termos semelhantes?",
                        difficulty: "facil",
                        options: [
                            { text: "$6m^3n$ e $-m^3n$", isCorrect: true },
                            { text: "$6m^3n$ e $-4mn^3$", isCorrect: false },
                            { text: "$2p^2$ e $-2p^3$", isCorrect: false },
                            { text: "$7xy^2$ e $7x$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Reduzindo os termos semelhantes de $7a^2b - 2ab^2 - 3a^2b + 6ab^2$, obtém-se:",
                        difficulty: "medio",
                        options: [
                            { text: "$8a^3b^3$", isCorrect: false },
                            { text: "$4a^2b - 8ab^2$", isCorrect: false },
                            { text: "$10a^2b + 4ab^2$", isCorrect: false },
                            { text: "$4a^2b + 4ab^2$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O valor numérico de $3a^2 - 2ab$ para $a = -2$ e $b = 5$ é:",
                        difficulty: "medio",
                        options: [
                            { text: "$8$", isCorrect: false },
                            { text: "$56$", isCorrect: false },
                            { text: "$32$", isCorrect: true },
                            { text: "$-8$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para $x = -5$, os valores de $-x^2$ e de $(-x)^2$ são, respectivamente:",
                        difficulty: "dificil",
                        options: [
                            { text: "$-25$ e $-25$", isCorrect: false },
                            { text: "$-25$ e $25$", isCorrect: true },
                            { text: "$25$ e $25$", isCorrect: false },
                            { text: "$25$ e $-25$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Somando e multiplicando expressões",
                blocks: [
                    {
                        type: "text",
                        value: "# Somando e multiplicando expressões\n\nUm terreno retangular tem $x$ metros de frente e $x + 4$ metros de fundo. Para achar a área, você multiplica a frente pelo fundo e escreve $x(x + 4)$. Para saber quanto mede a cerca, você soma os quatro lados. Em nenhum dos dois casos você sabe quanto vale $x$, e em nenhum dos dois isso impede a conta: o que você precisa é saber somar e multiplicar expressões.\n\nNesta aula fazemos exatamente isso, e o personagem principal é o sinal. A maior parte dos erros de álgebra não está na multiplicação dos números: está no sinal que se perde pelo caminho, sobretudo quando há um menos na frente de um parêntese.",
                    },
                    {
                        type: "text",
                        value: "## Somar é reduzir termos semelhantes\n\nPara somar dois polinômios, tire os parênteses e junte os termos semelhantes. Quando o parêntese vem precedido de sinal de mais, nada muda dentro dele:\n\n$$(3x^2 - 5x + 2) + (x^2 + 2x - 7)$$\n\n$$= 3x^2 - 5x + 2 + x^2 + 2x - 7$$\n\nAgora os semelhantes, um grupo por vez: $3x^2 + x^2 = 4x^2$, depois $-5x + 2x = -3x$, e por fim $2 - 7 = -5$. O resultado é\n\n$$4x^2 - 3x - 5$$\n\nExiste um jeito rápido e honesto de conferir: escolha um número, por exemplo $x = 1$, e calcule os dois lados. À esquerda, $(3 - 5 + 2) + (1 + 2 - 7) = 0 + (-4) = -4$. À direita, $4 - 3 - 5 = -4$. Confere. Esse teste não prova a igualdade para todo $x$, mas pega quase todo erro de conta.",
                    },
                    {
                        type: "text",
                        value: "## O menos na frente do parêntese troca tudo\n\nSubtrair um polinômio é somar o oposto dele, e o oposto troca o sinal de **todos** os termos, não só do primeiro:\n\n$$(5a - 3b) - (2a - 7b) = 5a - 3b - 2a + 7b$$\n\nRepare no $-7b$, que virou $+7b$. Reduzindo: $5a - 2a = 3a$ e $-3b + 7b = 4b$, de modo que\n\n$$(5a - 3b) - (2a - 7b) = 3a + 4b$$\n\nO erro mais comum da álgebra inteira é trocar o sinal do primeiro termo e esquecer o resto, chegando a $3a - 10b$. Teste com $a = 0$ e $b = 1$: o lado esquerdo vale $(-3) - (-7) = 4$, e $3a + 4b$ dá $4$, enquanto $3a - 10b$ daria $-10$. O teste numérico pega esse erro na hora.\n\nUm truque de escrita que ajuda: antes de tirar o parêntese, imagine um $-1$ multiplicando tudo o que está dentro. Aí a distributiva faz o trabalho e nenhum sinal fica para trás.",
                    },
                    {
                        type: "text",
                        value: "## A propriedade distributiva\n\nMultiplicar uma soma por um fator é multiplicar cada parcela por esse fator:\n\n$$a(b + c) = ab + ac$$\n\nCom números isso é a conta de sempre: $3 \\cdot (10 + 2) = 30 + 6 = 36$. Com letras vale igual, e aí o sinal do fator precisa chegar a todos os termos:\n\n$$-3x(2x^2 - 4x + 5)$$\n\n$$= (-3x)(2x^2) + (-3x)(-4x) + (-3x)(5)$$\n\n$$= -6x^3 + 12x^2 - 15x$$\n\nOs três sinais saíram diferentes dos originais porque o fator é negativo: menos vezes mais dá menos, e menos vezes menos dá mais. Quem copia os sinais de dentro do parêntese sem pensar escreve $-6x^3 - 12x^2 + 15x$ e erra dois dos três termos.",
                    },
                    {
                        type: "text",
                        value: "## O produto de dois binômios\n\nUm **binômio** é um polinômio de dois termos. Para multiplicar dois deles, aplique a distributiva duas vezes: cada termo do primeiro multiplica cada termo do segundo, o que dá quatro produtos.\n\n$$(2x + 3)(x - 5)$$\n\n$$= 2x \\cdot x + 2x \\cdot (-5) + 3 \\cdot x + 3 \\cdot (-5)$$\n\n$$= 2x^2 - 10x + 3x - 15$$\n\nOs dois termos do meio são semelhantes e se juntam: $-10x + 3x = -7x$. Então\n\n$$(2x + 3)(x - 5) = 2x^2 - 7x - 15$$\n\nQuem multiplica só o primeiro pelo primeiro e o último pelo último chega a $2x^2 - 15$ e perde os dois termos do meio. Conferindo em $x = 2$: à esquerda, $(4 + 3)(2 - 5) = 7 \\cdot (-3) = -21$; à direita, $8 - 14 - 15 = -21$. O resultado errado daria $8 - 15 = -7$, bem longe.",
                    },
                    {
                        type: "text",
                        value: "## Produto e divisão de monômios\n\nPara multiplicar monômios, multiplique coeficiente com coeficiente e junte as letras usando as propriedades da potência de mesma base:\n\n$$a^m \\cdot a^n = a^{m + n} \\qquad \\frac{a^m}{a^n} = a^{m - n}$$\n\nMultiplicando $4x^3y^2$ por $-3x^2y$, lembrando que o expoente de $y$ no segundo fator é $1$:\n\n$$(4x^3y^2)(-3x^2y) = (4 \\cdot (-3)) \\cdot x^{3 + 2} \\cdot y^{2 + 1} = -12x^5y^3$$\n\nNote que os expoentes se **somam**, nunca se multiplicam: quem multiplica chega a $-12x^6y^2$, que está errado.\n\nNa divisão, divida os coeficientes e subtraia os expoentes:\n\n$$\\frac{18x^5y^3}{6x^2y^3} = 3x^{5 - 2}y^{3 - 3} = 3x^3y^0 = 3x^3$$\n\nAqui apareceu $y^0 = 1$, que é o que sobra quando a letra se cancela por completo. A letra não desaparece por mágica: ela vira $1$, e $1$ multiplicando não se escreve.",
                    },
                    {
                        type: "text",
                        value: "## Um exemplo que junta distributiva e sinal\n\nSimplifique $2(x - 3) - 3(2x - 5)$.\n\nFaça cada distributiva separada, sem pressa. No segundo produto o fator é $-3$, e esse menos vai para os dois termos do parêntese:\n\n$$2(x - 3) = 2x - 6$$\n\n$$-3(2x - 5) = -6x + 15$$\n\nSomando os dois resultados e reduzindo os semelhantes:\n\n$$2x - 6 - 6x + 15 = -4x + 9$$\n\nConferência em $x = 1$: a expressão original vale $2 \\cdot (-2) - 3 \\cdot (-3) = -4 + 9 = 5$, e $-4 \\cdot 1 + 9 = 5$. Confere. Quem não leva o menos até o $-5$ obtém $-4x - 21$, que em $x = 1$ daria $-25$. Dois minutos de conferência numérica valem mais do que reler a conta três vezes.",
                    },
                    {
                        type: "quote",
                        value: "Somar e subtrair expressões é reduzir termos semelhantes, e o menos na frente do parêntese troca o sinal de todos os termos de dentro. Multiplicar é distribuir cada termo sobre cada termo, somando os expoentes das letras de mesma base. Na dúvida, teste com um número: a conta certa bate nos dois lados.",
                    },
                ],
                questions: [
                    {
                        statement: "Somando $(4x^2 - 3x + 5) + (2x^2 + 7x - 9)$ e reduzindo os termos semelhantes, obtém-se:",
                        difficulty: "facil",
                        options: [
                            { text: "$6x^2 - 4x - 4$", isCorrect: false },
                            { text: "$6x^2 + 4x - 4$", isCorrect: true },
                            { text: "$6x^4 + 4x - 4$", isCorrect: false },
                            { text: "$6x^2 + 4x + 14$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O produto $(5a^4b)(-2a^2b^3)$ é igual a:",
                        difficulty: "facil",
                        options: [
                            { text: "$10a^6b^4$", isCorrect: false },
                            { text: "$3a^6b^4$", isCorrect: false },
                            { text: "$-10a^8b^3$", isCorrect: false },
                            { text: "$-10a^6b^4$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A expressão $(7m - 4n) - (3m - 9n)$, com os termos reduzidos, é igual a:",
                        difficulty: "medio",
                        options: [
                            { text: "$10m - 13n$", isCorrect: false },
                            { text: "$4m + 5n$", isCorrect: true },
                            { text: "$4m - 5n$", isCorrect: false },
                            { text: "$4m - 13n$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O produto $(3x - 2)(x + 4)$ é igual a:",
                        difficulty: "medio",
                        options: [
                            { text: "$3x^2 - 8$", isCorrect: false },
                            { text: "$3x^2 + 10x - 8$", isCorrect: true },
                            { text: "$3x^2 - 10x - 8$", isCorrect: false },
                            { text: "$3x^2 + 14x - 8$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Simplificando $5(x - 2) - 2(3x - 4)$, o resultado é:",
                        difficulty: "dificil",
                        options: [
                            { text: "$-x - 6$", isCorrect: false },
                            { text: "$-x + 2$", isCorrect: false },
                            { text: "$-x - 18$", isCorrect: false },
                            { text: "$-x - 2$", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Produtos notáveis",
                blocks: [
                    {
                        type: "text",
                        value: "# Produtos notáveis\n\nQuanto é $102^2$? Montar a conta no papel funciona, mas existe um caminho mais curto: $102$ é $100 + 2$, e o quadrado de uma soma tem uma forma fixa que sai de cabeça. No fim desta aula você faz $102^2$ sem papel.\n\n**Produto notável** é um produto que aparece tantas vezes que vale decorar o resultado em vez de refazer a distributiva toda hora. São quatro os que mais pesam, e nenhum deles é mágica: todos saem da distributiva que você já sabe. Vamos fazer cada conta uma vez, justamente para que depois você possa não fazer mais.",
                    },
                    {
                        type: "text",
                        value: "## O quadrado da soma\n\n$(a + b)^2$ significa $(a + b)(a + b)$. Aplicando a distributiva, cada termo do primeiro parêntese multiplica cada termo do segundo:\n\n$$(a + b)(a + b) = a \\cdot a + a \\cdot b + b \\cdot a + b \\cdot b$$\n\n$$= a^2 + ab + ab + b^2$$\n\nOs dois termos do meio são semelhantes e somam $2ab$. Chegamos à primeira identidade:\n\n$$(a + b)^2 = a^2 + 2ab + b^2$$\n\nEm palavras, que é como se decora: o quadrado do primeiro, mais duas vezes o produto dos dois, mais o quadrado do segundo.\n\nAplicando em $(x + 5)^2$, com $a = x$ e $b = 5$: o quadrado do primeiro é $x^2$, o dobro do produto é $2 \\cdot x \\cdot 5 = 10x$ e o quadrado do segundo é $25$. Logo $(x + 5)^2 = x^2 + 10x + 25$.",
                    },
                    {
                        type: "text",
                        value: "## O erro clássico: $(a + b)^2$ não é $a^2 + b^2$\n\nMuita gente distribui o expoente pelos termos da soma e escreve $(a + b)^2 = a^2 + b^2$. Isso está errado, e dá para mostrar com dois números pequenos.\n\nTome $a = 3$ e $b = 4$. O lado esquerdo é\n\n$$(3 + 4)^2 = 7^2 = 49$$\n\ne o lado direito seria\n\n$$3^2 + 4^2 = 9 + 16 = 25$$\n\nAgora compare: $49$ não é $25$. A diferença entre os dois resultados é exatamente $24$, que é o termo esquecido, já que $2ab = 2 \\cdot 3 \\cdot 4 = 24$.\n\nO expoente só se distribui sobre **produto**, nunca sobre soma. Vale $(ab)^2 = a^2b^2$, mas não existe nada parecido para $(a + b)^2$. Quando a dúvida bater numa prova, teste com $3$ e $4$: são dois segundos de conta e encerram a discussão.",
                    },
                    {
                        type: "text",
                        value: "## O quadrado da diferença\n\nA mesma distributiva, agora com um sinal de menos:\n\n$$(a - b)(a - b) = a^2 - ab - ab + b^2 = a^2 - 2ab + b^2$$\n\n$$(a - b)^2 = a^2 - 2ab + b^2$$\n\nSó o termo do meio troca de sinal. O último continua positivo, porque $(-b)(-b) = +b^2$, e esquecer isso é o segundo erro mais comum da aula.\n\nEm $(2x - 3)^2$, temos $a = 2x$ e $b = 3$. O quadrado do primeiro é $(2x)^2 = 4x^2$, e repare que aqui o expoente vale também para o coeficiente $2$. O dobro do produto é $2 \\cdot 2x \\cdot 3 = 12x$, com sinal negativo. O quadrado do segundo é $9$. Então\n\n$$(2x - 3)^2 = 4x^2 - 12x + 9$$",
                    },
                    {
                        type: "text",
                        value: "## O produto da soma pela diferença\n\nAgora dois parênteses com sinais opostos:\n\n$$(a + b)(a - b) = a^2 - ab + ab - b^2$$\n\nOs termos do meio são opostos e se cancelam, deixando a **diferença de quadrados**:\n\n$$(a + b)(a - b) = a^2 - b^2$$\n\nEsse é o único dos quatro em que o termo do meio desaparece de verdade, e é exatamente por isso que ele é tão útil, tanto para desenvolver quanto para fatorar.\n\nEm $(3x + 7)(3x - 7)$, o primeiro ao quadrado é $(3x)^2 = 9x^2$ e o segundo ao quadrado é $49$:\n\n$$(3x + 7)(3x - 7) = 9x^2 - 49$$\n\nCuidado com o coeficiente: o quadrado de $3x$ é $9x^2$, e não $3x^2$. O expoente alcança tudo o que está dentro do parêntese.",
                    },
                    {
                        type: "text",
                        value: "## O cubo da soma\n\nPara $(a + b)^3$, use o que já temos: $(a + b)^3 = (a + b)(a + b)^2 = (a + b)(a^2 + 2ab + b^2)$. Distribuindo, cada termo do binômio multiplica os três termos do trinômio:\n\n$$a(a^2 + 2ab + b^2) = a^3 + 2a^2b + ab^2$$\n\n$$b(a^2 + 2ab + b^2) = a^2b + 2ab^2 + b^3$$\n\nSomando os dois e reduzindo os semelhantes, $2a^2b + a^2b = 3a^2b$ e $ab^2 + 2ab^2 = 3ab^2$:\n\n$$(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$$\n\nTrocando $b$ por $-b$ sai a versão com menos, em que os sinais se alternam:\n\n$$(a - b)^3 = a^3 - 3a^2b + 3ab^2 - b^3$$\n\nEm $(x + 2)^3$, com $a = x$ e $b = 2$: $a^3 = x^3$, depois $3a^2b = 3 \\cdot x^2 \\cdot 2 = 6x^2$, depois $3ab^2 = 3 \\cdot x \\cdot 4 = 12x$ e por fim $b^3 = 8$. Logo\n\n$$(x + 2)^3 = x^3 + 6x^2 + 12x + 8$$\n\nConferindo em $x = 1$: à esquerda, $3^3 = 27$; à direita, $1 + 6 + 12 + 8 = 27$. O erro frequente é usar $3ab^2$ como $3 \\cdot 2$ em vez de $3 \\cdot 2^2$, terminando com $6x$ no lugar de $12x$.",
                    },
                    {
                        type: "text",
                        value: "## Produto notável em conta de cabeça\n\nVolte ao $102^2$. Escreva $102 = 100 + 2$ e use o quadrado da soma:\n\n$$102^2 = (100 + 2)^2 = 100^2 + 2 \\cdot 100 \\cdot 2 + 2^2$$\n\n$$= 10000 + 400 + 4 = 10404$$\n\nPara um número logo abaixo de uma potência de dez, use o quadrado da diferença:\n\n$$98^2 = (100 - 2)^2 = 10000 - 400 + 4 = 9604$$\n\nE para o produto de dois números igualmente distantes de um número redondo, a diferença de quadrados resolve:\n\n$$99 \\cdot 101 = (100 - 1)(100 + 1) = 100^2 - 1^2 = 10000 - 1 = 9999$$\n\nO mesmo truque dá $97 \\cdot 103 = 100^2 - 3^2 = 10000 - 9 = 9991$. O que estava no caminho era apenas reconhecer a forma do produto notável escondida atrás dos números.",
                    },
                    {
                        type: "quote",
                        value: "São quatro formas que valem decorar: $(a+b)^2 = a^2 + 2ab + b^2$, $(a-b)^2 = a^2 - 2ab + b^2$, $(a+b)(a-b) = a^2 - b^2$ e $(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$. Todas saem da distributiva, e nenhuma delas permite distribuir o expoente pela soma: o termo do meio existe e não pode ser esquecido.",
                    },
                ],
                questions: [
                    {
                        statement: "O desenvolvimento de $(x + 7)^2$ é:",
                        difficulty: "facil",
                        options: [
                            { text: "$x^2 + 49$", isCorrect: false },
                            { text: "$x^2 + 7x + 49$", isCorrect: false },
                            { text: "$x^2 + 14x + 14$", isCorrect: false },
                            { text: "$x^2 + 14x + 49$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O produto $(5x + 2)(5x - 2)$ é igual a:",
                        difficulty: "facil",
                        options: [
                            { text: "$25x^2 - 20x - 4$", isCorrect: false },
                            { text: "$25x^2 + 4$", isCorrect: false },
                            { text: "$25x^2 - 4$", isCorrect: true },
                            { text: "$5x^2 - 4$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O desenvolvimento de $(3x - 4)^2$ é:",
                        difficulty: "medio",
                        options: [
                            { text: "$9x^2 - 16$", isCorrect: false },
                            { text: "$9x^2 - 24x + 16$", isCorrect: true },
                            { text: "$9x^2 - 24x - 16$", isCorrect: false },
                            { text: "$9x^2 + 24x + 16$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Escrevendo $102 = 100 + 2$ e usando o quadrado da soma, o valor de $102^2$ é:",
                        difficulty: "medio",
                        options: [
                            { text: "$10400$", isCorrect: false },
                            { text: "$10404$", isCorrect: true },
                            { text: "$10004$", isCorrect: false },
                            { text: "$10204$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O desenvolvimento de $(x + 3)^3$ é:",
                        difficulty: "dificil",
                        options: [
                            { text: "$x^3 + 27$", isCorrect: false },
                            { text: "$x^3 + 9x^2 + 9x + 27$", isCorrect: false },
                            { text: "$x^3 + 9x^2 + 27x + 27$", isCorrect: true },
                            { text: "$x^3 + 27x^2 + 9x + 27$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Fatoração e frações algébricas",
                blocks: [
                    {
                        type: "text",
                        value: "# Fatoração e frações algébricas\n\nSimplificar $\\frac{12}{18}$ é fácil porque você sabe escrever $12 = 6 \\cdot 2$ e $18 = 6 \\cdot 3$: o $6$ aparece como fator nos dois e vai embora, deixando $\\frac{2}{3}$. Com letras a ideia é exatamente a mesma, só que antes é preciso transformar somas em produtos.\n\n**Fatorar** é isso: reescrever uma soma como um produto. É o caminho inverso do que fizemos nas aulas anteriores, e serve para simplificar frações com letras, para enxergar quando uma expressão vale zero e para encurtar contas que de outro modo seriam longas.\n\nA boa notícia é que existe uma ordem de tentativas. Nesta aula ela aparece caso a caso, e no fim vira um roteiro curto.",
                    },
                    {
                        type: "text",
                        value: "## Caso 1: fator comum em evidência\n\nÉ a primeira coisa a tentar, sempre. Procure o que aparece em todos os termos, número e letras, e coloque isso em evidência.\n\nEm $6x^3 - 9x^2$, o maior número que divide $6$ e $9$ é $3$, e a menor potência de $x$ presente nos dois termos é $x^2$. O fator comum é $3x^2$. Dividindo cada termo por ele, $6x^3 : 3x^2 = 2x$ e $9x^2 : 3x^2 = 3$:\n\n$$6x^3 - 9x^2 = 3x^2(2x - 3)$$\n\nA conferência é obrigatória e custa uma linha: multiplique de volta. $3x^2 \\cdot 2x = 6x^3$ e $3x^2 \\cdot (-3) = -9x^2$, o que devolve a expressão original.\n\nTire sempre o fator **máximo**. Parar em $3x(2x^2 - 3x)$ não é uma igualdade falsa, mas deixa o trabalho pela metade, e numa fração isso significa não simplificar tudo o que havia para simplificar.",
                    },
                    {
                        type: "text",
                        value: "## Caso 2: agrupamento\n\nQuando a expressão tem quatro termos e nenhum fator comum a todos eles, tente separar em dois pares e colocar um fator em evidência dentro de cada par. Se os parênteses que sobrarem forem iguais, você pode evidenciá-los também.\n\n$$x^3 + 2x^2 + 5x + 10$$\n\nNo primeiro par, $x^2$ é comum: $x^3 + 2x^2 = x^2(x + 2)$. No segundo par, $5$ é comum: $5x + 10 = 5(x + 2)$. Ficamos com\n\n$$x^2(x + 2) + 5(x + 2)$$\n\nAgora $(x + 2)$ é fator comum dos dois pedaços e sai em evidência:\n\n$$x^3 + 2x^2 + 5x + 10 = (x + 2)(x^2 + 5)$$\n\nMultiplicando de volta para conferir: $x \\cdot x^2 + x \\cdot 5 + 2 \\cdot x^2 + 2 \\cdot 5 = x^3 + 5x + 2x^2 + 10$, que é a expressão original com os termos em outra ordem.",
                    },
                    {
                        type: "text",
                        value: "## Caso 3: diferença de quadrados\n\nDois termos, ambos quadrados perfeitos, separados por um menos. Então vale a identidade da aula anterior, lida da direita para a esquerda:\n\n$$a^2 - b^2 = (a + b)(a - b)$$\n\nEm $9x^2 - 25$, temos $9x^2 = (3x)^2$ e $25 = 5^2$, logo\n\n$$9x^2 - 25 = (3x + 5)(3x - 5)$$\n\nÀs vezes o caso se repete. Em $x^4 - 16$, primeiro note que $x^4 = (x^2)^2$ e $16 = 4^2$:\n\n$$x^4 - 16 = (x^2 + 4)(x^2 - 4)$$\n\ne o segundo parêntese ainda é uma diferença de quadrados:\n\n$$x^4 - 16 = (x^2 + 4)(x + 2)(x - 2)$$\n\nAtenção: **soma** de quadrados não fatora desse jeito. O fator $x^2 + 4$ fica como está.",
                    },
                    {
                        type: "text",
                        value: "## Casos 4 e 5: os dois trinômios\n\nTrês termos pedem dois testes, nesta ordem.\n\nO **trinômio quadrado perfeito** tem o primeiro e o último termos quadrados perfeitos e positivos, e o do meio igual ao dobro do produto das raízes deles. É o quadrado da soma ou da diferença lido de trás para frente:\n\n$$a^2 + 2ab + b^2 = (a + b)^2 \\qquad a^2 - 2ab + b^2 = (a - b)^2$$\n\nEm $x^2 + 12x + 36$, as raízes dos extremos são $x$ e $6$, e o dobro do produto é $2 \\cdot x \\cdot 6 = 12x$, que é o termo do meio. Confirmado: $x^2 + 12x + 36 = (x + 6)^2$. Em $4x^2 - 20x + 25$, as raízes são $2x$ e $5$, e $2 \\cdot 2x \\cdot 5 = 20x$, que aparece com menos, então $4x^2 - 20x + 25 = (2x - 5)^2$.\n\nO teste do termo do meio não é opcional. Em $x^2 + 10x + 36$ os extremos continuam quadrados, mas o dobro do produto seria $12x$ e não $10x$: esse trinômio não é quadrado perfeito.\n\nQuando o trinômio tem $x^2$ com coeficiente $1$ e não é quadrado perfeito, use a **soma e produto**: procure dois números $p$ e $q$ cuja soma seja $S$ e cujo produto seja $P$, porque\n\n$$x^2 + Sx + P = (x + p)(x + q)$$\n\nA razão aparece ao multiplicar de volta: $(x + p)(x + q) = x^2 + (p + q)x + pq$.\n\nEm $x^2 + 7x + 12$, queremos soma $7$ e produto $12$. Os pares de produto $12$ são $1$ e $12$, $2$ e $6$, $3$ e $4$; o que soma $7$ é $3$ e $4$, logo $x^2 + 7x + 12 = (x + 3)(x + 4)$.\n\nEm $x^2 - x - 6$, a soma é $-1$ e o produto é $-6$. Produto negativo pede sinais diferentes, e com $-3$ e $2$ temos produto $-6$ e soma $-1$, de modo que $x^2 - x - 6 = (x - 3)(x + 2)$. Conferindo: $x^2 + 2x - 3x - 6 = x^2 - x - 6$.",
                    },
                    {
                        type: "text",
                        value: "## O roteiro de tentativas\n\n| Quando olhar | Quantos termos | O que tentar |\n| --- | --- | --- |\n| sempre, antes de tudo | qualquer | fator comum em evidência |\n| sobrou uma diferença | $2$ termos | diferença de quadrados |\n| sobrou um trinômio | $3$ termos | quadrado perfeito, depois soma e produto |\n| sobraram quatro termos | $4$ termos | agrupamento |\n\nDepois de fatorar uma vez, olhe de novo: quase sempre dá para fatorar mais. Em $2x^2 - 18$, o fator comum $2$ sai primeiro e deixa $2(x^2 - 9)$, que ainda é diferença de quadrados, terminando em $2(x + 3)(x - 3)$. Parar no meio do caminho é o erro mais frequente de todos.",
                    },
                    {
                        type: "text",
                        value: "## Simplificar fração algébrica, e dizer a restrição\n\nFração algébrica é uma fração com letra no denominador. A primeira coisa a dizer sobre ela é que **o denominador não pode ser zero**: divisão por zero não existe, então os valores que anulam o denominador ficam de fora, e isso se escreve junto com a resposta, não depois.\n\nTome $\\frac{x^2 - 9}{x^2 + 6x + 9}$ e fatore o numerador e o denominador:\n\n$$\\frac{x^2 - 9}{x^2 + 6x + 9} = \\frac{(x + 3)(x - 3)}{(x + 3)^2}$$\n\nO denominador original zera quando $x + 3 = 0$, isto é, em $x = -3$. Com essa restrição dita, podemos cancelar o fator $(x + 3)$:\n\n$$\\frac{x^2 - 9}{x^2 + 6x + 9} = \\frac{x - 3}{x + 3}, \\quad x \\neq -3$$\n\nOutro exemplo: $\\frac{2x + 6}{x^2 - 9} = \\frac{2(x + 3)}{(x + 3)(x - 3)} = \\frac{2}{x - 3}$, válido para $x \\neq -3$ e $x \\neq 3$, porque os dois valores anulam o denominador de partida.\n\nE aqui vem a regra que mais se viola: **só se cancela fator, nunca termo**. Em $\\frac{x + 3}{3}$ não há nada a cancelar, porque o $3$ de cima é um termo da soma e não um fator do numerador inteiro. Prova com número: em $x = 3$ essa fração vale $\\frac{6}{3} = 2$, e não $3$, que é o que daria o cancelamento indevido.",
                    },
                    {
                        type: "text",
                        value: "## Somar frações algébricas\n\nComo em qualquer fração, só se somam numeradores depois de igualar os denominadores. Fatorar ajuda a achar o denominador comum.\n\nSome $\\frac{3}{x - 2} + \\frac{2}{x + 2}$, com $x \\neq 2$ e $x \\neq -2$.\n\nOs dois denominadores não têm fator comum, então o denominador comum é o produto deles, que por diferença de quadrados vale $(x - 2)(x + 2) = x^2 - 4$. Multiplique cada numerador pelo fator que falta no seu denominador:\n\n$$\\frac{3(x + 2)}{x^2 - 4} + \\frac{2(x - 2)}{x^2 - 4} = \\frac{3x + 6 + 2x - 4}{x^2 - 4}$$\n\nReduzindo os semelhantes no numerador, $3x + 2x = 5x$ e $6 - 4 = 2$:\n\n$$\\frac{3}{x - 2} + \\frac{2}{x + 2} = \\frac{5x + 2}{x^2 - 4}, \\quad x \\neq 2 \\text{ e } x \\neq -2$$\n\nConferindo em $x = 0$: à esquerda, $\\frac{3}{-2} + \\frac{2}{2} = -\\frac{3}{2} + 1 = -\\frac{1}{2}$; à direita, $\\frac{2}{-4} = -\\frac{1}{2}$. Confere. O erro frequente aqui é distribuir o segundo numerador como $2(x + 2)$, por inércia, e terminar em $\\frac{5x + 10}{x^2 - 4}$.",
                    },
                    {
                        type: "quote",
                        value: "Fatorar é transformar soma em produto, e a ordem de tentativa é fator comum, agrupamento, diferença de quadrados, quadrado perfeito e soma e produto. Em fração algébrica cancela-se fator e nunca termo, e a restrição de denominador diferente de zero faz parte da resposta.",
                    },
                ],
                questions: [
                    {
                        statement: "Colocando o maior fator comum em evidência, a expressão $8x^3 - 20x^2$ fica:",
                        difficulty: "facil",
                        options: [
                            { text: "$4x^2(2x - 5)$", isCorrect: true },
                            { text: "$4x^2(2x - 20)$", isCorrect: false },
                            { text: "$4x(2x - 5)$", isCorrect: false },
                            { text: "$4x^2(2x - 5x)$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A forma fatorada de $16x^2 - 81$ é:",
                        difficulty: "facil",
                        options: [
                            { text: "$(16x + 9)(16x - 9)$", isCorrect: false },
                            { text: "$(4x + 9)(4x - 9)$", isCorrect: true },
                            { text: "$(4x - 9)^2$", isCorrect: false },
                            { text: "$(4x + 9)^2$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Fatorando $x^2 - 2x - 15$ pela soma e produto, obtém-se:",
                        difficulty: "medio",
                        options: [
                            { text: "$(x - 5)(x - 3)$", isCorrect: false },
                            { text: "$(x - 15)(x + 1)$", isCorrect: false },
                            { text: "$(x + 5)(x - 3)$", isCorrect: false },
                            { text: "$(x - 5)(x + 3)$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Fatorando numerador e denominador, a fração $\\frac{x^2 - 9}{x^2 + 6x + 9}$ se simplifica em $\\frac{x - 3}{x + 3}$. Qual restrição acompanha essa simplificação, com $x$ real?",
                        difficulty: "medio",
                        options: [
                            { text: "$x \\neq 3$", isCorrect: false },
                            { text: "$x \\neq -3$", isCorrect: true },
                            { text: "$x \\neq 3$ e $x \\neq -3$", isCorrect: false },
                            { text: "nenhuma, vale para todo $x$ real", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A soma $\\frac{4}{x - 3} + \\frac{1}{x + 3}$, com $x \\neq 3$ e $x \\neq -3$, é igual a:",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\frac{5}{x^2 - 9}$", isCorrect: false },
                            { text: "$\\frac{5x + 15}{x^2 - 9}$", isCorrect: false },
                            { text: "$\\frac{5x + 9}{x^2 - 9}$", isCorrect: true },
                            { text: "$\\frac{3x + 15}{x^2 - 9}$", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Equações e sistemas",
        aulas: [
            {
                titulo: "Equação do primeiro grau",
                blocks: [
                    {
                        type: "text",
                        value: "## A pergunta que uma equação faz\n\nUma balança está em equilíbrio. Em um dos pratos há um pacote fechado e um peso de $1$ kg; no outro, um peso de $4$ kg. Quanto pesa o pacote? Chamando de $x$ a massa desconhecida, o equilíbrio vira uma igualdade:\n\n$$x + 1 = 4.$$\n\n**Resolver** essa equação é achar o valor de $x$ que torna a igualdade verdadeira. Aqui esse valor é $3$, porque $3 + 1 = 4$. Esse número se chama **raiz** (ou solução) da equação, e o conjunto de todas as raízes é o **conjunto solução**, escrito $S = \\{3\\}$.\n\nUma **equação do primeiro grau** na incógnita $x$ é toda equação que pode ser escrita na forma $ax + b = 0$, com $a \\neq 0$. A exigência sobre $a$ é o que garante que ainda existe letra para descobrir.",
                    },
                    {
                        type: "text",
                        value: "## O princípio que autoriza cada passo\n\nA balança já explica a única regra de que você precisa: o que se faz de um lado tem que ser feito do outro, senão o equilíbrio se perde.\n\n- Somar ou subtrair o mesmo número nos dois lados mantém a igualdade.\n- Multiplicar ou dividir os dois lados pelo mesmo número **diferente de zero** mantém a igualdade.\n\nA ressalva do zero não é preciosismo. Multiplicando os dois lados de $x = 5$ por zero, sobra $0 = 0$, que é verdade para qualquer $x$: a informação se perdeu. E divisão por zero não existe. Por isso, logo adiante, multiplicar os dois lados por uma expressão com letra (como $x - 2$) vai exigir cuidado, porque essa expressão pode valer zero.\n\nVeja o princípio em ação em $x + 1 = 4$: subtraindo $1$ dos dois lados, $x + 1 - 1 = 4 - 1$, isto é, $x = 3$. Na prática a gente resume dizendo que o $1$ passou para o outro lado trocando de sinal, mas o que está por trás é a subtração feita dos dois lados.",
                    },
                    {
                        type: "text",
                        value: "## O roteiro de quatro passos\n\nPara qualquer equação do primeiro grau, a ordem que dá menos trabalho é esta:\n\n1. **Elimine os denominadores**, multiplicando os dois lados pelo MMC deles.\n2. **Abra os parênteses** com a distributiva, cuidando do sinal de menos na frente.\n3. **Junte os termos com a letra** de um lado e os números do outro.\n4. **Isole a incógnita**, dividindo pelo coeficiente que sobrou.\n\nO passo 1 tem uma armadilha: o MMC multiplica **todos** os termos, inclusive os que não têm denominador. Em $\\frac{x}{2} = 3$, multiplicar por $2$ dá $x = 6$, e não $x = 3$.\n\nO passo 2 tem outra: em $-2(x - 3)$ o menos multiplica os dois termos, resultando $-2x + 6$. Quem escreve $-2x - 6$ perde o sinal e erra a equação inteira sem notar.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: com denominador e parêntese\n\nResolver em $\\mathbb{R}$:\n\n$$\\frac{x + 1}{3} + \\frac{x - 3}{2} = 3.$$\n\nO MMC de $3$ e $2$ é $6$. Multiplicando os dois lados por $6$, sem esquecer o lado direito:\n\n$$2(x + 1) + 3(x - 3) = 18.$$\n\nAbrindo os parênteses, $2x + 2 + 3x - 9 = 18$. Juntando os termos, $5x - 7 = 18$, logo $5x = 25$ e $x = 5$.\n\n**Verificação na equação original:** $\\frac{5 + 1}{3} + \\frac{5 - 3}{2} = \\frac{6}{3} + \\frac{2}{2} = 2 + 1 = 3$. Confere, então $S = \\{5\\}$. Repare que a verificação é feita no enunciado, e não na equação já transformada: se o MMC tivesse sido aplicado errado, a equação transformada concordaria com o erro.",
                    },
                    {
                        type: "text",
                        value: "## Quando a letra está no denominador\n\nEm $\\frac{2}{x - 1} + \\frac{1}{2} = \\frac{3}{x - 1}$ a incógnita aparece no denominador, e aí surge uma pergunta nova: para que valores de $x$ essa equação faz sentido? Denominador zero não existe, então é preciso ter $x - 1 \\neq 0$, ou seja, $x \\neq 1$. Essa é a **restrição de domínio**, e ela se escreve antes de qualquer conta.\n\nO risco é concreto. Ao multiplicar os dois lados por $x - 1$, você multiplica por uma expressão que pode ser zero, e o princípio da igualdade só autoriza fator diferente de zero. Por isso, em equação fracionária, **toda raiz encontrada precisa ser conferida na equação original**: se ela cair justamente no valor proibido, não é raiz, e sim um candidato descartado.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: equação fracionária, com verificação\n\nResolver em $\\mathbb{R}$:\n\n$$\\frac{2}{x - 1} + \\frac{1}{2} = \\frac{3}{x - 1}, \\qquad x \\neq 1.$$\n\nO MMC dos denominadores é $2(x - 1)$. Multiplicando os dois lados por ele:\n\n$$4 + (x - 1) = 6.$$\n\nDaí $x + 3 = 6$ e $x = 3$. O candidato $3$ está no domínio, porque é diferente de $1$, e a verificação fecha: $\\frac{2}{2} + \\frac{1}{2} = 1 + 0{,}5 = 1{,}5$, e o lado direito é $\\frac{3}{2} = 1{,}5$. Logo $S = \\{3\\}$.",
                    },
                    {
                        type: "text",
                        value: "## O caso em que não sobra raiz\n\nAgora resolva $\\frac{x}{x - 3} - \\frac{3}{x - 3} = 2$, com $x \\neq 3$. Multiplicando os dois lados por $x - 3$:\n\n$$x - 3 = 2(x - 3) \\Rightarrow x - 3 = 2x - 6 \\Rightarrow 3 = x.$$\n\nO único candidato é $x = 3$, que é exatamente o valor proibido. Ele não pode nem ser substituído na equação original, porque produziria $\\frac{3}{0}$. Não existe raiz, e a resposta é $S = \\emptyset$.\n\nDá para ver o mesmo por outro caminho, que serve de conferência: juntando as frações da esquerda, $\\frac{x - 3}{x - 3} = 1$ para todo $x \\neq 3$, e $1$ nunca é igual a $2$. Quem não escreve a restrição responde $S = \\{3\\}$ e entrega uma solução que não existe.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Resolver é achar o valor que torna a igualdade verdadeira; conferir é substituir esse valor na equação original.\n- A igualdade se mantém somando o mesmo número nos dois lados, e multiplicando ou dividindo os dois lados pelo mesmo número diferente de zero.\n- Roteiro: MMC em todos os termos, parênteses, letras de um lado, isolar.\n- Com a letra no denominador, escreva a restrição antes e descarte o candidato que cair no valor proibido.",
                    },
                    {
                        type: "quote",
                        value: "Toda raiz tem que voltar para a equação original e passar no teste. Em equação fracionária, esse teste é parte da resolução, e não um capricho.",
                    },
                ],
                questions: [
                    {
                        statement: "Resolvendo em $\\mathbb{R}$ a equação $5x - 8 = 3x + 10$, qual é o valor de $x$?",
                        difficulty: "facil",
                        options: [
                            { text: "$x = -9$", isCorrect: false },
                            { text: "$x = 1$", isCorrect: false },
                            { text: "$x = 9$", isCorrect: true },
                            { text: "$x = 18$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $x$ que resolve, em $\\mathbb{R}$, a equação $\\frac{x}{3} + \\frac{x}{4} = 7$?",
                        difficulty: "facil",
                        options: [
                            { text: "$x = 12$", isCorrect: true },
                            { text: "$x = 14$", isCorrect: false },
                            { text: "$x = 84$", isCorrect: false },
                            { text: "$x = 49$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Resolva em $\\mathbb{R}$ a equação $\\frac{2x - 1}{5} - \\frac{x - 3}{2} = 1$. Qual é o valor de $x$?",
                        difficulty: "medio",
                        options: [
                            { text: "$x = 3$", isCorrect: true },
                            { text: "$x = -3$", isCorrect: false },
                            { text: "$x = 12$", isCorrect: false },
                            { text: "$x = -27$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Resolvendo em $\\mathbb{R}$ a equação $\\frac{5}{x - 1} = \\frac{3}{x + 1}$, qual é o conjunto solução?",
                        difficulty: "medio",
                        options: [
                            { text: "$S = \\{-1\\}$", isCorrect: false },
                            { text: "$S = \\{4\\}$", isCorrect: false },
                            { text: "$S = \\{-4\\}$", isCorrect: true },
                            { text: "$S = \\{1, -1\\}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o conjunto solução, em $\\mathbb{R}$, da equação $\\frac{x}{x - 2} = \\frac{2}{x - 2} + 3$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$S = \\mathbb{R} - \\{2\\}$", isCorrect: false },
                            { text: "$S = \\{3\\}$", isCorrect: false },
                            { text: "$S = \\emptyset$", isCorrect: true },
                            { text: "$S = \\{2\\}$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Problemas que viram equação",
                blocks: [
                    {
                        type: "text",
                        value: "## O passo que trava, e não é a conta\n\nPergunte a um estudante onde ele empaca num problema e a resposta quase nunca é na conta. É antes: ler a frase e não saber o que escrever. A conta de uma equação do primeiro grau você já faz; o que falta é a **tradução** do português para a igualdade.\n\nTraduzir tem um roteiro, e ele não muda de problema para problema:\n\n1. Veja o que o problema pergunta e **dê nome a uma única quantidade desconhecida**.\n2. Escreva as outras quantidades **em função dessa letra**.\n3. Ache a frase que diz que duas coisas são iguais e escreva a igualdade.\n4. Resolva a equação.\n5. **Volte ao enunciado** e veja se a resposta faz sentido.",
                    },
                    {
                        type: "text",
                        value: "## Um pequeno dicionário\n\nO vocabulário dos problemas se repete muito:\n\n| Frase em português | Em linguagem algébrica |\n| --- | --- |\n| um número qualquer | $x$ |\n| o dobro, o triplo | $2x$, $3x$ |\n| a metade, a terça parte | $\\frac{x}{2}$, $\\frac{x}{3}$ |\n| cinco mais que o número | $x + 5$ |\n| cinco menos que o número | $x - 5$ |\n| o consecutivo de um inteiro | $x + 1$ |\n| o número aumentado em $20$ por cento | $1{,}2x$ |\n| daqui a $t$ anos, a idade | $x + t$ |\n\nDuas armadilhas de leitura. A primeira: cinco menos que o número é $x - 5$, e não $5 - x$. A segunda: o dobro do número, mais $3$, é $2x + 3$, enquanto o dobro da soma do número com $3$ é $2(x + 3)$. Quando a frase admite as duas leituras, quem decide é o passo 5, porque só uma delas dá resposta compatível com o enunciado.",
                    },
                    {
                        type: "text",
                        value: "## Escolher bem a incógnita poupa conta\n\nQuando há duas quantidades desconhecidas ligadas por uma frase, chame de letra a mais simples delas e escreva a outra a partir dessa.\n\nNa frase \"Marina tem hoje o triplo da idade de Bruno\", se $b$ é a idade de Bruno, então Marina tem $3b$, e sobra uma letra só. Quem chama a idade de Marina de $m$ fica com $m$ e $\\frac{m}{3}$ e carrega uma fração até o fim, sem necessidade.",
                    },
                    {
                        type: "text",
                        value: "## Problema 1: idades\n\n*Marina tem hoje o triplo da idade de Bruno. Daqui a $8$ anos, ela terá o dobro da idade dele. Quantos anos cada um tem hoje?*\n\nSeja $b$ a idade de Bruno hoje; Marina tem $3b$. Daqui a $8$ anos, Bruno terá $b + 8$ e Marina terá $3b + 8$, porque o tempo passa para os dois. A frase sobre o dobro é a igualdade:\n\n$$3b + 8 = 2(b + 8).$$\n\nResolvendo: $3b + 8 = 2b + 16$, logo $b = 8$. Bruno tem $8$ anos e Marina tem $3 \\cdot 8 = 24$.\n\n**De volta ao enunciado:** daqui a $8$ anos eles terão $16$ e $32$ anos, e $32$ é o dobro de $16$. Confere. O erro clássico desse tipo é somar os $8$ anos só na idade de um deles.",
                    },
                    {
                        type: "text",
                        value: "## Problema 2: dinheiro\n\n*Ana gastou $\\frac{1}{3}$ do dinheiro que tinha na feira e, depois, $\\frac{1}{4}$ do valor inicial na padaria. Sobraram $50$ reais. Quanto ela tinha?*\n\nSeja $x$ o valor inicial, em reais. A feira levou $\\frac{x}{3}$ e a padaria levou $\\frac{x}{4}$, as duas frações calculadas sobre o mesmo $x$, porque o enunciado diz \"do valor inicial\". O que sobrou é o inicial menos os dois gastos:\n\n$$x - \\frac{x}{3} - \\frac{x}{4} = 50.$$\n\nMultiplicando tudo por $12$: $12x - 4x - 3x = 600$, isto é, $5x = 600$ e $x = 120$.\n\n**De volta ao enunciado:** $40$ reais na feira, $30$ na padaria, e $120 - 40 - 30 = 50$. Confere, ela tinha $120$ reais. Se o enunciado dissesse \"um quarto do que restou\", a segunda parcela seria $\\frac{1}{4}$ de $x - \\frac{x}{3}$, e a equação mudaria.",
                    },
                    {
                        type: "text",
                        value: "## Problema 3: perímetro\n\n*Um retângulo tem $64$ cm de perímetro, e o comprimento mede $4$ cm mais que o triplo da largura. Quais são suas dimensões?*\n\nSeja $L$ a largura, em centímetros; o comprimento é $3L + 4$. O perímetro soma os quatro lados:\n\n$$2L + 2(3L + 4) = 64.$$\n\nEntão $2L + 6L + 8 = 64$, ou $8L = 56$, e $L = 7$. O comprimento é $3 \\cdot 7 + 4 = 25$.\n\n**De volta ao enunciado:** $2 \\cdot 7 + 2 \\cdot 25 = 14 + 50 = 64$ cm, e $25$ é $4$ mais que $21 = 3 \\cdot 7$. Confere: largura de $7$ cm e comprimento de $25$ cm.",
                    },
                    {
                        type: "text",
                        value: "## A resposta tem que caber no enunciado\n\nO passo 5 não é formalidade. A equação é obediente: ela devolve o número que você pediu, inclusive quando esse número não existe no mundo do problema.\n\n*Em uma caixa há $30$ moedas, de $10$ e de $25$ centavos, totalizando $4{,}50$ reais. Quantas são de $10$ centavos?* Se $d$ é esse número, as outras são $30 - d$, e\n\n$$0{,}10d + 0{,}25(30 - d) = 4{,}50 \\Rightarrow 7{,}50 - 0{,}15d = 4{,}50 \\Rightarrow d = 20.$$\n\nSão $20$ moedas de $10$ centavos e $10$ de $25$, o que dá $2 + 2{,}50 = 4{,}50$ reais. Confere.\n\nAgora troque o total para $9$ reais, mantendo as $30$ moedas. A mesma montagem dá $0{,}15d = -1{,}50$, ou seja, $d = -20$. Número negativo de moedas não existe: a conclusão correta é que esse enunciado é impossível, e não que a resposta seja negativa. O mesmo valendo para idade negativa, meia pessoa ou lado de medida zero.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Nomeie uma incógnita só e escreva as demais quantidades a partir dela.\n- Cada informação do enunciado é uma expressão; a igualdade vem da frase que compara duas quantidades.\n- Resolva e volte ao enunciado, substituindo a resposta nas frases originais. Se a montagem estiver errada, a equação vai concordar com o erro, e só o enunciado denuncia.\n- Resposta sem sentido no contexto significa tradução errada ou enunciado impossível.",
                    },
                    {
                        type: "quote",
                        value: "O difícil de um problema é a primeira linha: dizer quem é $x$. Depois dela, é a equação de sempre.",
                    },
                ],
                questions: [
                    {
                        statement: "O dobro de um número real $x$, somado a $7$, é igual a $31$. Qual é o valor de $x$?",
                        difficulty: "facil",
                        options: [
                            { text: "$x = 38$", isCorrect: false },
                            { text: "$x = 12$", isCorrect: true },
                            { text: "$x = 19$", isCorrect: false },
                            { text: "$x = 24$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A soma de dois números inteiros consecutivos é $73$. Qual é o maior deles?",
                        difficulty: "facil",
                        options: [
                            { text: "$37$", isCorrect: true },
                            { text: "$36{,}5$", isCorrect: false },
                            { text: "$38$", isCorrect: false },
                            { text: "$36$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Pedro tem $42$ anos e seu filho tem $12$. Em quantos anos a idade de Pedro será o dobro da idade do filho?",
                        difficulty: "medio",
                        options: [
                            { text: "$9$ anos", isCorrect: false },
                            { text: "$30$ anos", isCorrect: false },
                            { text: "$24$ anos", isCorrect: false },
                            { text: "$18$ anos", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um triângulo isósceles tem $50$ cm de perímetro, e cada um dos dois lados iguais mede $4$ cm mais que a base. Quanto mede a base?",
                        difficulty: "medio",
                        options: [
                            { text: "$18$ cm", isCorrect: false },
                            { text: "$23$ cm", isCorrect: false },
                            { text: "$42$ cm", isCorrect: false },
                            { text: "$14$ cm", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Em uma turma, $\\frac{1}{3}$ dos alunos pratica apenas futebol, $\\frac{1}{4}$ pratica apenas vôlei, $5$ alunos praticam os dois esportes e $20$ não praticam nenhum. Quantos alunos tem a turma?",
                        difficulty: "dificil",
                        options: [
                            { text: "$35$ alunos", isCorrect: false },
                            { text: "$60$ alunos", isCorrect: true },
                            { text: "$300$ alunos", isCorrect: false },
                            { text: "$48$ alunos", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Equação do segundo grau",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando a incógnita aparece ao quadrado\n\nUm terreno retangular tem $3$ m mais de comprimento que de largura e área de $40$ m². Chamando a largura de $x$, a área é $x(x + 3) = 40$, isto é,\n\n$$x^2 + 3x - 40 = 0.$$\n\nAgora a incógnita aparece elevada ao quadrado, e o roteiro da equação do primeiro grau não dá conta: não existe um isolar o $x$ direto, porque ele aparece em dois graus diferentes.\n\nUma **equação do segundo grau** na incógnita $x$ é toda equação que pode ser escrita como\n\n$$ax^2 + bx + c = 0, \\qquad a \\neq 0,$$\n\nonde $a$, $b$ e $c$ são números reais chamados de coeficientes. A exigência $a \\neq 0$ é o que garante que o termo quadrático existe. Quando $b = 0$ ou $c = 0$, a equação é **incompleta**, e esses dois casos se resolvem na mão, sem fórmula.",
                    },
                    {
                        type: "text",
                        value: "## Incompleta sem o termo em $x$: isolar o quadrado\n\nEm $ax^2 + c = 0$ basta isolar $x^2$ e extrair a raiz, **com os dois sinais**:\n\n$$3x^2 - 27 = 0 \\Rightarrow 3x^2 = 27 \\Rightarrow x^2 = 9 \\Rightarrow x = \\pm 3.$$\n\nAs duas raízes são $-3$ e $3$, porque $(-3)^2 = 9$ também. Esquecer o sinal negativo é o erro número um desse caso, e a verificação pega: $3 \\cdot (-3)^2 - 27 = 0$.\n\nE se o quadrado der negativo? Em $2x^2 + 8 = 0$ temos $x^2 = -4$, e nenhum número real elevado ao quadrado resulta negativo. Resolvendo em $\\mathbb{R}$, a resposta é $S = \\emptyset$: a equação **não tem raiz real**.",
                    },
                    {
                        type: "text",
                        value: "## Incompleta sem o termo independente: fator comum\n\nEm $ax^2 + bx = 0$ o $x$ é fator comum, e a fatoração resolve:\n\n$$x^2 - 5x = 0 \\Rightarrow x(x - 5) = 0.$$\n\nUm produto só é zero quando um dos fatores é zero. Logo $x = 0$ ou $x - 5 = 0$, e $S = \\{0, 5\\}$.\n\nAqui mora um erro grave e muito comum: dividir os dois lados por $x$ para simplificar, escrever $x - 5 = 0$ e responder só $x = 5$. Dividir por $x$ é dividir por algo que pode ser zero, o que o princípio da igualdade não autoriza, e a raiz $x = 0$ desaparece no caminho. Quando falta o termo independente, $x = 0$ é sempre raiz.",
                    },
                    {
                        type: "text",
                        value: "## A fórmula resolutiva e o discriminante\n\nPara a equação completa, vale a fórmula\n\n$$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}, \\qquad \\Delta = b^2 - 4ac.$$\n\nO número $\\Delta$ é o **discriminante**, e só o sinal dele já responde quantas raízes reais existem:\n\n- $\\Delta > 0$: duas raízes reais distintas.\n- $\\Delta = 0$: uma única raiz real, chamada de raiz dupla, igual a $-\\frac{b}{2a}$.\n- $\\Delta < 0$: nenhuma raiz real, porque não existe raiz quadrada real de número negativo. Em $\\mathbb{R}$, $S = \\emptyset$, e não há mais conta a fazer.\n\nAntes de usar a fórmula, escreva $a$, $b$ e $c$ **com os sinais**, e lembre que o numerador começa com $-b$. Em $x^2 - 6x + 5 = 0$ o coeficiente $b$ vale $-6$, então $-b = 6$ e as raízes saem $5$ e $1$. Quem escreve $-6$ no lugar de $-b$ encontra $-5$ e $-1$, as raízes com o sinal trocado.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: duas raízes\n\nResolver em $\\mathbb{R}$: $2x^2 - 7x + 3 = 0$.\n\nOs coeficientes são $a = 2$, $b = -7$ e $c = 3$, logo\n\n$$\\Delta = (-7)^2 - 4 \\cdot 2 \\cdot 3 = 49 - 24 = 25.$$\n\nComo $\\Delta > 0$, existem duas raízes reais:\n\n$$x = \\frac{7 \\pm 5}{4} \\Rightarrow x_1 = \\frac{12}{4} = 3, \\qquad x_2 = \\frac{2}{4} = \\frac{1}{2}.$$\n\n**Verificação na equação original:** com $x = 3$, $2 \\cdot 9 - 21 + 3 = 0$; com $x = \\frac{1}{2}$, $0{,}5 - 3{,}5 + 3 = 0$. Então $S = \\left\\{\\frac{1}{2},\\, 3\\right\\}$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: raiz dupla e sem raiz real\n\nResolver em $\\mathbb{R}$: $x^2 - 6x + 9 = 0$. Aqui $a = 1$, $b = -6$ e $c = 9$, e\n\n$$\\Delta = 36 - 36 = 0 \\Rightarrow x = \\frac{6}{2} = 3.$$\n\nA equação tem uma única raiz real, $S = \\{3\\}$, e de fato $9 - 18 + 9 = 0$. Note que $x^2 - 6x + 9$ é o quadrado perfeito $(x - 3)^2$, o que explica a raiz repetida.\n\nAgora $x^2 + 2x + 5 = 0$, com $\\Delta = 4 - 20 = -16$. Como $\\Delta < 0$, **não existe raiz real** e $S = \\emptyset$. Quem insiste e escreve $x = \\frac{-2 \\pm 4}{2}$, trocando $\\sqrt{-16}$ por $4$, encontra $1$ e $-3$, que não resolvem nada: $1 + 2 + 5 = 8$.",
                    },
                    {
                        type: "text",
                        value: "## Soma e produto das raízes\n\nSe $x_1$ e $x_2$ são as raízes de $ax^2 + bx + c = 0$, então\n\n$$x_1 + x_2 = -\\frac{b}{a}, \\qquad x_1 \\cdot x_2 = \\frac{c}{a}.$$\n\nEssas duas relações servem para duas coisas. A primeira é achar raízes de cabeça quando elas são inteiras e pequenas: em $x^2 - 7x + 10 = 0$ a soma é $7$ e o produto é $10$, e os números que somam $7$ e multiplicam $10$ são $2$ e $5$. A verificação é imediata: $4 - 14 + 10 = 0$ e $25 - 35 + 10 = 0$.\n\nA segunda é conferir raízes achadas pela fórmula, sem refazer a conta. As raízes do Exemplo 1 eram $3$ e $\\frac{1}{2}$: a soma dá $\\frac{7}{2} = -\\frac{-7}{2}$ e o produto dá $\\frac{3}{2}$, exatamente $-\\frac{b}{a}$ e $\\frac{c}{a}$.\n\nUm aviso: soma e produto não substituem o discriminante. Se nenhum par de números fecha as duas condições ao mesmo tempo, é sinal de que as raízes não são inteiras, ou de que $\\Delta < 0$ e não há raiz real nenhuma para procurar.",
                    },
                    {
                        type: "text",
                        value: "## Montando a equação a partir das raízes\n\nO caminho inverso também serve. Se a soma das raízes é $S_r$ e o produto é $P$, uma equação que tem exatamente essas raízes é\n\n$$x^2 - S_r x + P = 0.$$\n\nCom raízes $-3$ e $5$: a soma é $2$ e o produto é $-15$, logo a equação é $x^2 - 2x - 15 = 0$. Conferindo as duas: $9 + 6 - 15 = 0$ e $25 - 10 - 15 = 0$.\n\nCuidado com o sinal, porque entra $-S_r$, e não $+S_r$. Quem escreve $x^2 + 2x - 15 = 0$ obtém as raízes $3$ e $-5$, que são as originais com os sinais invertidos.",
                    },
                    {
                        type: "quote",
                        value: "O discriminante decide quantas raízes existem antes de qualquer conta, e soma e produto conferem as raízes que você encontrou.",
                    },
                ],
                questions: [
                    {
                        statement: "Resolvendo em $\\mathbb{R}$, qual é o conjunto solução da equação $x^2 - 49 = 0$?",
                        difficulty: "facil",
                        options: [
                            { text: "$S = \\{-49, 49\\}$", isCorrect: false },
                            { text: "$S = \\{7\\}$", isCorrect: false },
                            { text: "$S = \\{-7, 7\\}$", isCorrect: true },
                            { text: "$S = \\{-7\\}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Resolvendo em $\\mathbb{R}$, qual é o conjunto solução da equação $x^2 - 8x = 0$?",
                        difficulty: "facil",
                        options: [
                            { text: "$S = \\{8\\}$", isCorrect: false },
                            { text: "$S = \\{-8, 8\\}$", isCorrect: false },
                            { text: "$S = \\{0, 8\\}$", isCorrect: true },
                            { text: "$S = \\{0, -8\\}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Resolva a equação $2x^2 - 5x - 3 = 0$ em $\\mathbb{R}$. Qual é a maior das raízes?",
                        difficulty: "medio",
                        options: [
                            { text: "$x = -3$", isCorrect: false },
                            { text: "$x = -\\frac{1}{2}$", isCorrect: false },
                            { text: "$x = 3$", isCorrect: true },
                            { text: "$x = \\frac{1}{2}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Quantas raízes reais tem a equação $2x^2 - 3x + 4 = 0$?",
                        difficulty: "medio",
                        options: [
                            { text: "Nenhuma raiz real, pois $\\Delta = -23$.", isCorrect: true },
                            { text: "Duas raízes reais, pois $\\Delta = 23$.", isCorrect: false },
                            { text: "Duas raízes reais, $1$ e $\\frac{1}{2}$.", isCorrect: false },
                            { text: "Uma raiz real dupla, pois $\\Delta = 0$.", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma das raízes reais da equação $x^2 - kx + 12 = 0$ é $3$. Qual é a outra raiz e qual é o valor de $k$?",
                        difficulty: "dificil",
                        options: [
                            { text: "A outra raiz é $-4$ e $k = -1$.", isCorrect: false },
                            { text: "A outra raiz é $9$ e $k = 12$.", isCorrect: false },
                            { text: "A outra raiz é $4$ e $k = -7$.", isCorrect: false },
                            { text: "A outra raiz é $4$ e $k = 7$.", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Equações redutíveis ao segundo grau",
                blocks: [
                    {
                        type: "text",
                        value: "## Equações que não são do segundo grau, mas viram\n\nNem toda equação chega pronta na forma $ax^2 + bx + c = 0$. Três tipos aparecem muito e têm o mesmo destino: com uma troca de roupa, cada um vira uma equação do segundo grau já conhecida.\n\n- A **biquadrada**, com $x^4$ e $x^2$, como $x^4 - 13x^2 + 36 = 0$.\n- A **irracional**, com a incógnita dentro de um radical, como $\\sqrt{x + 7} = x + 1$.\n- A **fracionária**, com a incógnita no denominador, como $\\frac{x}{x - 2} + \\frac{3}{x} = 2$.\n\nO que muda de um para o outro é o cuidado no caminho de volta. Nos três, **a última etapa é conferir cada candidato na equação original**, e não na equação transformada.",
                    },
                    {
                        type: "text",
                        value: "## Biquadrada: a substituição $u = x^2$\n\nUma equação **biquadrada** tem a forma $ax^4 + bx^2 + c = 0$, só com expoentes pares. Como $x^4 = (x^2)^2$, chamando $u = x^2$ a equação fica do segundo grau em $u$.\n\nEm $x^4 - 13x^2 + 36 = 0$, com $u = x^2$:\n\n$$u^2 - 13u + 36 = 0, \\qquad \\Delta = 169 - 144 = 25, \\qquad u = \\frac{13 \\pm 5}{2}.$$\n\nIsso dá $u_1 = 9$ e $u_2 = 4$. Agora vem o passo que mais se esquece: **$u$ não é a resposta**. Voltando para $x$, de $x^2 = 9$ saem $x = \\pm 3$ e de $x^2 = 4$ saem $x = \\pm 2$. A equação é de grau quatro e tem quatro raízes: $S = \\{-3, -2, 2, 3\\}$. Conferindo $x = 2$ na original, $16 - 52 + 36 = 0$.\n\nParar em $u$ e responder $S = \\{4, 9\\}$ é o erro característico desse tipo, e a substituição denuncia na hora: para $x = 9$, $6561 - 1053 + 36 = 5544$.",
                    },
                    {
                        type: "text",
                        value: "## Quando um dos valores de $u$ é negativo\n\nEm $x^4 - 5x^2 - 36 = 0$, com $u = x^2$:\n\n$$u^2 - 5u - 36 = 0, \\qquad \\Delta = 25 + 144 = 169, \\qquad u = \\frac{5 \\pm 13}{2}.$$\n\nIsso dá $u_1 = 9$ e $u_2 = -4$. O segundo valor tem que ser **descartado**: $u$ foi definido como $x^2$, e nenhum número real elevado ao quadrado dá $-4$. Resolvendo em $\\mathbb{R}$, só $u = 9$ sobrevive, e $S = \\{-3, 3\\}$, que confere: $81 - 45 - 36 = 0$.\n\nVeja que isso não é erro de conta. O valor $u = -4$ é raiz legítima da equação em $u$; ele só não produz $x$ real. Quem aceita $u = -4$ e escreve $x = \\pm 2$ erra duas vezes, e a verificação mostra: $16 - 20 - 36 = -40$, diferente de zero.",
                    },
                    {
                        type: "text",
                        value: "## Irracional: elevar ao quadrado cria raiz estranha\n\nNa equação **irracional** a incógnita aparece sob o radical. A saída é isolar a raiz e elevar os dois lados ao quadrado. Só que essa operação não é reversível: elevar ao quadrado apaga o sinal, e as igualdades $a = b$ e $a = -b$ viram a mesma equação. Por isso o processo pode criar soluções que não servem na equação original, chamadas de **raízes estranhas**.\n\nResolver em $\\mathbb{R}$: $\\sqrt{x + 7} = x + 1$. Elevando os dois lados ao quadrado,\n\n$$x + 7 = x^2 + 2x + 1 \\Rightarrow x^2 + x - 6 = 0 \\Rightarrow x = 2 \\text{ ou } x = -3.$$\n\n**Verificação obrigatória na equação original:**\n\n- $x = 2$: $\\sqrt{9} = 3$ e $2 + 1 = 3$. Confere.\n- $x = -3$: $\\sqrt{4} = 2$, mas $-3 + 1 = -2$. Como $2 \\neq -2$, esse valor não é raiz.\n\nLogo $S = \\{2\\}$. O $-3$ é a raiz estranha: ele resolve $x + 7 = (x + 1)^2$, e não a equação com o radical. A pista aparece antes da conta: $\\sqrt{x + 7}$ nunca é negativo, então qualquer candidato que torne $x + 1$ negativo já está condenado.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: $\\sqrt{2x + 3} = x$\n\nElevando os dois lados ao quadrado, $2x + 3 = x^2$, ou seja, $x^2 - 2x - 3 = 0$, cujas raízes são $x = 3$ e $x = -1$.\n\n- $x = 3$: $\\sqrt{9} = 3$, igual ao lado direito. Confere.\n- $x = -1$: $\\sqrt{1} = 1$, e o lado direito é $-1$. Não confere, é raiz estranha.\n\nEntão $S = \\{3\\}$. Repare no desenho do erro: quem resolve a equação do segundo grau, acha as duas raízes e responde $S = \\{-1, 3\\}$ está certo na álgebra e errado na equação. Em equação irracional, a verificação não é conferência opcional, é parte da resolução.",
                    },
                    {
                        type: "text",
                        value: "## Fracionária que cai no segundo grau\n\nCom a incógnita no denominador, primeiro vem a restrição de domínio e depois o MMC. Resolver em $\\mathbb{R}$:\n\n$$\\frac{x}{x - 2} + \\frac{3}{x} = 2, \\qquad x \\neq 0, \\; x \\neq 2.$$\n\nMultiplicando os dois lados por $x(x - 2)$:\n\n$$x^2 + 3(x - 2) = 2x(x - 2) \\Rightarrow x^2 + 3x - 6 = 2x^2 - 4x \\Rightarrow x^2 - 7x + 6 = 0.$$\n\nAs raízes são $x = 1$ e $x = 6$, as duas dentro do domínio. Verificando na equação original: com $x = 1$, $\\frac{1}{-1} + \\frac{3}{1} = -1 + 3 = 2$; com $x = 6$, $\\frac{6}{4} + \\frac{3}{6} = 1{,}5 + 0{,}5 = 2$. Logo $S = \\{1, 6\\}$.",
                    },
                    {
                        type: "text",
                        value: "## E quando a raiz cai no valor proibido\n\nA restrição não é enfeite. Resolva $\\frac{x^2}{x - 4} = \\frac{16}{x - 4}$, com $x \\neq 4$.\n\nOs denominadores são iguais, então $x^2 = 16$ e os candidatos são $x = 4$ e $x = -4$. O candidato $x = 4$ é exatamente o valor que anula o denominador: substituído na equação original, produz $\\frac{16}{0}$, que não existe. Ele é descartado, e sobra $S = \\{-4\\}$, que confere, porque $\\frac{16}{-8} = -2$ nos dois lados.\n\nOs três cuidados, juntos: na biquadrada, volte de $u$ para $x$ e descarte $u$ negativo; na irracional, teste cada candidato na equação com o radical; na fracionária, escreva a restrição antes de começar e descarte quem cair nela.",
                    },
                    {
                        type: "quote",
                        value: "Elevar ao quadrado e multiplicar pelo denominador abrem portas que a equação original mantinha fechadas. A verificação é quem fecha essas portas de novo.",
                    },
                ],
                questions: [
                    {
                        statement: "Resolvendo em $\\mathbb{R}$ a equação biquadrada $x^4 - 10x^2 + 9 = 0$, qual é o conjunto solução?",
                        difficulty: "facil",
                        options: [
                            { text: "$S = \\{1, 3\\}$", isCorrect: false },
                            { text: "$S = \\{-3, -1, 1, 3\\}$", isCorrect: true },
                            { text: "$S = \\{1, 9\\}$", isCorrect: false },
                            { text: "$S = \\{-9, -1, 1, 9\\}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Resolvendo em $\\mathbb{R}$ a equação irracional $\\sqrt{x - 2} = 4$, qual é o valor de $x$?",
                        difficulty: "facil",
                        options: [
                            { text: "$x = 16$", isCorrect: false },
                            { text: "$x = 14$", isCorrect: false },
                            { text: "$x = 6$", isCorrect: false },
                            { text: "$x = 18$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Resolvendo em $\\mathbb{R}$ a equação $x^4 + 3x^2 - 4 = 0$, qual é o conjunto solução?",
                        difficulty: "medio",
                        options: [
                            { text: "$S = \\{-4, 1\\}$", isCorrect: false },
                            { text: "$S = \\{-2, -1, 1, 2\\}$", isCorrect: false },
                            { text: "$S = \\{1\\}$", isCorrect: false },
                            { text: "$S = \\{-1, 1\\}$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Resolvendo em $\\mathbb{R}$ a equação $\\sqrt{x + 5} = x - 1$, qual é o conjunto solução?",
                        difficulty: "medio",
                        options: [
                            { text: "$S = \\{4\\}$", isCorrect: true },
                            { text: "$S = \\{-1, 4\\}$", isCorrect: false },
                            { text: "$S = \\{-1\\}$", isCorrect: false },
                            { text: "$S = \\emptyset$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Resolva em $\\mathbb{R}$ a equação $\\frac{x}{x - 1} + \\frac{2}{x} = 3$. Qual é a soma das raízes?",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\frac{1}{2}$", isCorrect: false },
                            { text: "$\\frac{5}{2}$", isCorrect: true },
                            { text: "$2$", isCorrect: false },
                            { text: "$-\\frac{5}{2}$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Sistemas de duas equações",
                blocks: [
                    {
                        type: "text",
                        value: "## Duas condições ao mesmo tempo\n\nDois ingressos de cinema e um refrigerante custaram $52$ reais. Um ingresso e dois refrigerantes custaram $41$ reais. Quanto custa cada coisa?\n\nNenhuma das frases resolve sozinha. A primeira, escrita como $2i + r = 52$, tem infinitas possibilidades: ingresso a $20$ e refrigerante a $12$, ingresso a $25$ e refrigerante a $2$, e assim por diante. É o conjunto das duas condições que fixa a resposta.\n\nUm **sistema de duas equações com duas incógnitas** se escreve com chave:\n\n$$\\begin{cases} 2i + r = 52 \\\\ i + 2r = 41 \\end{cases}$$\n\nA **solução do sistema** é o par ordenado que satisfaz as duas equações **ao mesmo tempo**. Aqui esse par é $(21, 10)$: $2 \\cdot 21 + 10 = 52$ e $21 + 2 \\cdot 10 = 41$. Um par que fecha só uma das equações não é solução, e daí vem boa parte dos erros: conferir a resposta em uma equação e esquecer a outra.",
                    },
                    {
                        type: "text",
                        value: "## Método da substituição\n\nIsole uma incógnita em uma das equações e leve essa expressão para a outra, que passa a ter uma letra só.\n\n$$\\begin{cases} x + 2y = 11 \\\\ 3x - y = 5 \\end{cases}$$\n\nA segunda equação entrega o $y$ quase de graça: $y = 3x - 5$. Substituindo na primeira:\n\n$$x + 2(3x - 5) = 11 \\Rightarrow x + 6x - 10 = 11 \\Rightarrow 7x = 21 \\Rightarrow x = 3.$$\n\nCom $x = 3$, $y = 3 \\cdot 3 - 5 = 4$, e a solução é o par $(3, 4)$.\n\n**Verificação nas duas equações originais:** $3 + 2 \\cdot 4 = 11$ e $3 \\cdot 3 - 4 = 5$. Confere. Note que a expressão isolada tem que ir para a **outra** equação: substituir $y = 3x - 5$ na própria segunda equação só produz $0 = 0$, sem informação nova.",
                    },
                    {
                        type: "text",
                        value: "## Método da adição\n\nSomar as duas equações membro a membro é legítimo, e compensa quando uma das incógnitas aparece com coeficientes opostos.\n\n$$\\begin{cases} 2x + 3y = 16 \\\\ 5x - 3y = 19 \\end{cases}$$\n\nSomando, o $3y$ cancela com o $-3y$: $7x = 35$, logo $x = 5$. Levando esse valor em qualquer uma delas, $10 + 3y = 16$ dá $y = 2$. A solução é $(5, 2)$, e as duas equações confirmam: $10 + 6 = 16$ e $25 - 6 = 19$.\n\nQuando os coeficientes não são opostos, multiplique uma equação (ou as duas) por um número para torná-los opostos. Em $\\begin{cases} 3x + 2y = 18 \\\\ x - y = 1 \\end{cases}$, multiplicando a segunda por $2$ aparece $2x - 2y = 2$, e a soma elimina o $y$: $5x = 20$, logo $x = 4$ e $y = 3$. Conferindo: $12 + 6 = 18$ e $4 - 3 = 1$.",
                    },
                    {
                        type: "text",
                        value: "## Qual método dá menos trabalho\n\nOs dois sempre funcionam, mas o trabalho muda:\n\n- **Substituição**, quando alguma incógnita já está isolada ou tem coeficiente $1$, como em $y = 2x - 3$ ou $x + 4y = 9$.\n- **Adição**, quando as duas equações estão na forma $ax + by = c$ e os coeficientes de uma das letras são iguais ou opostos, ou ficam assim com uma multiplicação simples.\n\nEm $\\begin{cases} y = 4 - x \\\\ 2x + 3y = 9 \\end{cases}$ a substituição é imediata: $2x + 3(4 - x) = 9$, logo $12 - x = 9$ e $x = 3$, com $y = 1$. Conferindo: $3 + 1 = 4$ e $6 + 3 = 9$.\n\nJá em $\\begin{cases} 4x + 5y = 7 \\\\ 4x - 3y = 15 \\end{cases}$, isolar produziria fração na primeira linha. Subtraindo a segunda equação da primeira, o $4x$ desaparece: $8y = -8$, então $y = -1$, e $4x + 5 \\cdot (-1) = 7$ dá $x = 3$. O par $(3, -1)$ confere nas duas.",
                    },
                    {
                        type: "text",
                        value: "## Sistema impossível e sistema com infinitas soluções\n\nÀs vezes a conta elimina as duas letras de uma vez, e o que sobra é um aviso.\n\n$$\\begin{cases} x + y = 5 \\\\ 2x + 2y = 13 \\end{cases}$$\n\nMultiplicando a primeira equação por $2$, vem $2x + 2y = 10$. Comparando com a segunda, seria preciso ter $10 = 13$, o que é falso. Nenhum par pode ter soma $5$ e, ao mesmo tempo, dobro da soma igual a $13$. O sistema é **impossível**, e $S = \\emptyset$.\n\nAgora o outro extremo:\n\n$$\\begin{cases} x - y = 2 \\\\ 3x - 3y = 6 \\end{cases}$$\n\nA segunda equação é a primeira multiplicada por $3$: ela não traz informação nova. Substituindo $x = y + 2$ na segunda, $3(y + 2) - 3y = 6$ dá $6 = 6$, verdade para qualquer $y$. O sistema tem **infinitas soluções**, todos os pares da forma $(y + 2,\\, y)$, como $(2, 0)$, $(3, 1)$ e $(5, 3)$.\n\nA leitura da conta distingue os dois casos: igualdade falsa, do tipo $0 = 3$, significa sistema impossível; igualdade sempre verdadeira, do tipo $0 = 0$, significa infinitas soluções.",
                    },
                    {
                        type: "text",
                        value: "## Quando uma das equações é do segundo grau\n\nO método não muda: isole numa equação e substitua na outra. O que muda é que a equação final é do segundo grau, e por isso pode haver dois pares de solução.\n\n$$\\begin{cases} x + y = 7 \\\\ xy = 12 \\end{cases}$$\n\nDa primeira, $y = 7 - x$. Substituindo na segunda:\n\n$$x(7 - x) = 12 \\Rightarrow 7x - x^2 = 12 \\Rightarrow x^2 - 7x + 12 = 0,$$\n\ncujas raízes são $x = 3$ e $x = 4$. Para $x = 3$ vem $y = 4$; para $x = 4$ vem $y = 3$. O sistema tem duas soluções, $(3, 4)$ e $(4, 3)$, e ambas conferem nas duas equações.\n\nDois avisos. Primeiro, cada valor de $x$ tem o seu $y$: não vale misturar e escrever $(3, 3)$. Segundo, o contexto pode descartar um par. Em $\\begin{cases} x - y = 1 \\\\ xy = 6 \\end{cases}$, de $x = y + 1$ vem $y^2 + y - 6 = 0$, com $y = 2$ ou $y = -3$, e os pares são $(3, 2)$ e $(-2, -3)$; se $x$ e $y$ fossem medidas de lados, só o primeiro serviria.",
                    },
                    {
                        type: "text",
                        value: "## Um problema que vira sistema\n\n*Em uma sessão de cinema foram vendidos $150$ ingressos, entre inteiras a $20$ reais e meias a $12$ reais, com arrecadação de $2440$ reais. Quantas meias foram vendidas?*\n\nDuas quantidades desconhecidas e duas informações. Sejam $i$ o número de inteiras e $m$ o de meias:\n\n$$\\begin{cases} i + m = 150 \\\\ 20i + 12m = 2440 \\end{cases}$$\n\nA primeira equação tem coeficientes $1$, então a substituição é natural: $i = 150 - m$. Na segunda,\n\n$$20(150 - m) + 12m = 2440 \\Rightarrow 3000 - 8m = 2440 \\Rightarrow 8m = 560 \\Rightarrow m = 70,$$\n\ne então $i = 80$.\n\n**De volta ao enunciado:** $80 + 70 = 150$ ingressos, e $80 \\cdot 20 + 70 \\cdot 12 = 1600 + 840 = 2440$ reais. Confere, foram $70$ meias. Repare que a pergunta era sobre as meias: responder $80$ é resolver o sistema certo e entregar a resposta errada.",
                    },
                    {
                        type: "quote",
                        value: "Solução de sistema é par, e par só é solução quando passa nas duas equações. Quando as letras desaparecem na conta, leia o que sobrou: $0 = 3$ é impossível, $0 = 0$ é infinito.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual par ordenado $(x, y)$ é a solução, em $\\mathbb{R}$, do sistema $\\begin{cases} x + y = 9 \\\\ x - y = 3 \\end{cases}$?",
                        difficulty: "facil",
                        options: [
                            { text: "$(6, -3)$", isCorrect: false },
                            { text: "$(6, 3)$", isCorrect: true },
                            { text: "$(6{,}5; 2{,}5)$", isCorrect: false },
                            { text: "$(3, 6)$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No sistema $\\begin{cases} y = 2x \\\\ x + y = 12 \\end{cases}$, resolvido em $\\mathbb{R}$, qual é o valor de $y$?",
                        difficulty: "facil",
                        options: [
                            { text: "$y = 4$", isCorrect: false },
                            { text: "$y = 8$", isCorrect: true },
                            { text: "$y = 6$", isCorrect: false },
                            { text: "$y = 24$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Resolvido em $\\mathbb{R}$, qual é o conjunto solução do sistema $\\begin{cases} 2x + 3y = 7 \\\\ 4x + 6y = 20 \\end{cases}$?",
                        difficulty: "medio",
                        options: [
                            { text: "A única solução é o par $(5, -1)$.", isCorrect: false },
                            { text: "Há infinitas soluções, uma para cada $x$ real.", isCorrect: false },
                            { text: "Não existe solução: o sistema é impossível.", isCorrect: true },
                            { text: "A única solução é o par $(2, 1)$.", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A soma de dois números reais é $9$ e o produto é $20$. Quais são esses números?",
                        difficulty: "medio",
                        options: [
                            { text: "$3$ e $6$", isCorrect: false },
                            { text: "$4$ e $5$", isCorrect: true },
                            { text: "$1$ e $20$", isCorrect: false },
                            { text: "$2$ e $10$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em uma lanchonete, $2$ sucos e $3$ salgados saem por $31$ reais, e $1$ suco com $2$ salgados sai por $18$ reais. Qual é o preço de um salgado?",
                        difficulty: "dificil",
                        options: [
                            { text: "$6$ reais", isCorrect: false },
                            { text: "$8$ reais", isCorrect: false },
                            { text: "$13$ reais", isCorrect: false },
                            { text: "$5$ reais", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Inequações e módulo",
        aulas: [
            {
                titulo: "Desigualdade e inequação do primeiro grau",
                blocks: [
                    {
                        type: "text",
                        value: "# Desigualdade e inequação do primeiro grau\n\nNum parque de diversões cada rodada no carrinho custa $4$ reais e você levou $30$ reais. Quantas rodadas cabem? A pergunta não pede um número exato: pede todos os valores possíveis. Se $n$ é a quantidade de rodadas, o gasto é $4n$ e a condição é\n\n$$4n \\le 30.$$\n\nIsso não é uma equação, porque os dois lados não precisam ser iguais. É uma **inequação**. Dividindo por $4$, chegamos a $n \\le 7{,}5$ e, como a quantidade de rodadas é um número inteiro, no máximo $7$ rodadas. Nesta aula a gente aprende a resolver inequações como essa com segurança.",
                    },
                    {
                        type: "text",
                        value: "## As quatro relações de ordem\n\nComparar dois números reais tem quatro formas, e cada uma tem o seu símbolo:\n\n| Símbolo | Leitura | Exemplo verdadeiro |\n| --- | --- | --- |\n| $<$ | é menor que | $-5 < 2$ |\n| $\\le$ | é menor que ou igual a | $3 \\le 3$ |\n| $>$ | é maior que | $7 > 0$ |\n| $\\ge$ | é maior que ou igual a | $-1 \\ge -4$ |\n\nO detalhe que confunde é o traço embaixo. Em $x \\le 3$ o valor $3$ serve; em $x < 3$ não serve. Essa diferença de um único ponto decide boa parte das respostas deste módulo.\n\nUma **desigualdade** é uma comparação desse tipo entre números já conhecidos, como $-5 < 2$, que é verdadeira. Uma **inequação** é uma comparação em que aparece uma incógnita, como $2x + 1 < 7$, e aí a comparação é verdadeira para alguns valores de $x$ e falsa para outros.",
                    },
                    {
                        type: "text",
                        value: "## Resolver é achar todos os valores\n\nResolver a equação $2x + 1 = 7$ dá um valor só, $x = 3$. Resolver a inequação $2x + 1 < 7$ é diferente: $x = 0$ serve, $x = 2$ serve, $x = 2{,}9$ serve, $x = -100$ serve. Nenhum deles é a resposta. A resposta é o **conjunto solução**, o conjunto de todos os valores que tornam a comparação verdadeira.\n\nEscrevemos esse conjunto de duas formas equivalentes, e as duas aparecem em prova:\n\n$$S = \\{x \\in \\mathbb{R} \\mid x < 3\\} \\qquad \\text{ou} \\qquad S = (-\\infty, 3).$$\n\nNa notação de intervalo, parêntese exclui o extremo e colchete inclui. Então $x \\le 3$ vira $(-\\infty, 3]$ e $x > -2$ vira $(-2, +\\infty)$. Do lado do infinito o sinal é sempre parêntese, porque $+\\infty$ não é um número que se possa alcançar.",
                    },
                    {
                        type: "text",
                        value: "## As três propriedades que usamos\n\n**Somar (ou subtrair) o mesmo número nos dois lados mantém o sentido.** De $x - 4 < 1$ passamos para $x < 5$ somando $4$ nos dois lados, e o $<$ continua $<$.\n\n**Multiplicar (ou dividir) os dois lados por um número positivo mantém o sentido.** De $3x < 12$ passamos para $x < 4$ dividindo por $3$.\n\n**Multiplicar (ou dividir) os dois lados por um número negativo inverte o sentido.** Aqui está o erro número um do assunto, então vale ver por que com números na mão. Comece de uma desigualdade verdadeira:\n\n$$4 < 10.$$\n\nMultiplique os dois lados por $-1$. À esquerda sai $-4$, à direita sai $-10$. E $-4$ é maior que $-10$, porque na reta o $-4$ está à direita do $-10$. Ou seja:\n\n$$4 < 10 \\quad \\Longrightarrow \\quad -4 > -10.$$\n\nQuem mantivesse o sentido escreveria $-4 < -10$, que é falso. Multiplicar por negativo troca a ordem dos dois números na reta, e por isso o símbolo tem de trocar também.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nResolver em $\\mathbb{R}$ a inequação $3x - 5 < 7$.\n\nSomamos $5$ nos dois lados: $3x < 12$. Dividimos por $3$, que é positivo, então o sentido se mantém: $x < 4$.\n\n$$S = \\{x \\in \\mathbb{R} \\mid x < 4\\} = (-\\infty, 4).$$\n\nVale conferir com valores. Em $x = 0$ temos $-5 < 7$, verdadeiro, e o $0$ está no conjunto. Em $x = 4$ temos $7 < 7$, falso, e de fato o $4$ ficou de fora.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nResolver em $\\mathbb{R}$ a inequação $2 - 4x \\le 14$.\n\nSubtraímos $2$ dos dois lados: $-4x \\le 12$. Agora dividimos por $-4$, que é negativo, e **o $\\le$ vira $\\ge$**:\n\n$$x \\ge -3.$$\n\n$$S = \\{x \\in \\mathbb{R} \\mid x \\ge -3\\} = [-3, +\\infty).$$\n\nConferindo em $x = 0$: $2 - 0 = 2 \\le 14$, verdadeiro, e o $0$ está no conjunto. Em $x = -10$: $2 + 40 = 42 \\le 14$, falso, e o $-10$ está fora, como deveria. Quem esquece de inverter escreve $x \\le -3$ e fica exatamente com os valores errados.",
                    },
                    {
                        type: "text",
                        value: "## Inequação dupla\n\nÀs vezes a incógnita está presa entre dois limites de uma vez, como em\n\n$$-3 < 2x + 1 \\le 7.$$\n\nEssa é a abreviação de duas inequações ao mesmo tempo: $2x + 1 > -3$ **e** $2x + 1 \\le 7$. Dá para resolver as duas juntas, operando nos três lados.\n\nSubtraímos $1$ em todos: $-4 < 2x \\le 6$. Dividimos todos por $2$, que é positivo:\n\n$$-2 < x \\le 3, \\qquad S = \\{x \\in \\mathbb{R} \\mid -2 < x \\le 3\\} = (-2, 3].$$\n\nNote que cada borda guardou o seu símbolo: o $-2$ saiu de um $<$ e continua de fora, o $3$ saiu de um $\\le$ e continua dentro. Quem para no passo $-4 < 2x \\le 6$ e responde $(-4, 6]$ esqueceu de dividir por $2$.",
                    },
                    {
                        type: "text",
                        value: "## Quando aparecem frações\n\nA estratégia é a mesma da equação: multiplicar tudo pelo mínimo comum múltiplo dos denominadores, que é um número **positivo**, e por isso o sentido não muda.\n\nResolver $\\dfrac{x-1}{2} - \\dfrac{2x+1}{3} > 1$. O mínimo comum múltiplo de $2$ e $3$ é $6$, e multiplicando os três termos por $6$:\n\n$$3(x-1) - 2(2x+1) > 6.$$\n\nAbrindo: $3x - 3 - 4x - 2 > 6$, isto é, $-x - 5 > 6$. Somando $5$: $-x > 11$. Agora multiplicamos por $-1$ e invertemos o sentido:\n\n$$x < -11, \\qquad S = \\{x \\in \\mathbb{R} \\mid x < -11\\} = (-\\infty, -11).$$\n\nConferindo em $x = -12$: o lado esquerdo vale $\\frac{-13}{2} - \\frac{-23}{3}$, ou seja, cerca de $1{,}17$, que é maior que $1$. Em $x = 0$ o lado esquerdo vale $-\\frac{1}{2} - \\frac{1}{3}$, negativo, e o $0$ ficou de fora com razão.",
                    },
                    {
                        type: "quote",
                        value: "Resolver uma inequação do primeiro grau é isolar a incógnita como numa equação, com um cuidado a mais: multiplicar ou dividir por um número negativo inverte o sentido da desigualdade. A resposta não é um valor, é um conjunto, escrito como $\\{x \\in \\mathbb{R} \\mid \\dots\\}$ ou como intervalo.",
                    },
                ],
                questions: [
                    {
                        statement: "Resolvendo $3x - 5 < 7$ em $\\mathbb{R}$, o conjunto solução, escrito em notação de intervalo, é:",
                        difficulty: "facil",
                        options: [
                            { text: "$(-\\infty, 4]$", isCorrect: false },
                            { text: "$(4, +\\infty)$", isCorrect: false },
                            { text: "$\\left(-\\infty, \\frac{2}{3}\\right)$", isCorrect: false },
                            { text: "$(-\\infty, 4)$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Multiplicando os dois lados da desigualdade $x > 5$ por $-1$, obtemos:",
                        difficulty: "facil",
                        options: [
                            { text: "$-x < 5$", isCorrect: false },
                            { text: "$-x > 5$", isCorrect: false },
                            { text: "$-x < -5$", isCorrect: true },
                            { text: "$-x > -5$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O conjunto solução de $2 - 4x \\le 14$ em $\\mathbb{R}$ é:",
                        difficulty: "medio",
                        options: [
                            { text: "$\\{x \\in \\mathbb{R} \\mid x \\le -3\\}$", isCorrect: false },
                            { text: "$\\{x \\in \\mathbb{R} \\mid x \\le 3\\}$", isCorrect: false },
                            { text: "$\\{x \\in \\mathbb{R} \\mid x \\ge 3\\}$", isCorrect: false },
                            { text: "$\\{x \\in \\mathbb{R} \\mid x \\ge -3\\}$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A inequação dupla $-3 < 2x + 1 \\le 7$ tem conjunto solução, em notação de intervalo:",
                        difficulty: "medio",
                        options: [
                            { text: "$(-2, 3]$", isCorrect: true },
                            { text: "$(-4, 6]$", isCorrect: false },
                            { text: "$[-2, 3)$", isCorrect: false },
                            { text: "$(-2, 3)$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Resolvendo $\\dfrac{x-1}{2} - \\dfrac{2x+1}{3} > 1$ em $\\mathbb{R}$, os valores de $x$ que satisfazem a inequação são:",
                        difficulty: "dificil",
                        options: [
                            { text: "$x < 11$", isCorrect: false },
                            { text: "$x > -11$", isCorrect: false },
                            { text: "$x < -11$", isCorrect: true },
                            { text: "$x > 11$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Inequação do segundo grau e estudo do sinal",
                blocks: [
                    {
                        type: "text",
                        value: "# Inequação do segundo grau e estudo do sinal\n\nPense num número cuja soma com o próprio quadrado não passa de $12$. Quais números servem? A condição é $x^2 + x \\le 12$, ou seja, $x^2 + x - 12 \\le 0$. Aqui não dá para isolar o $x$ como no primeiro grau, porque ele aparece elevado ao quadrado e também sozinho. A saída é outra: descobrir em quais trechos da reta a expressão $x^2 + x - 12$ é positiva, negativa ou zero. Esse é o **estudo do sinal**, e é o assunto desta aula.",
                    },
                    {
                        type: "text",
                        value: "## A regra do sinal do trinômio\n\nChamamos de **trinômio do segundo grau** a expressão $ax^2 + bx + c$, com $a \\neq 0$. Para estudar o sinal dele, primeiro procuramos as **raízes**, que são os valores de $x$ que anulam a expressão, achadas como de hábito por $\\Delta = b^2 - 4ac$ e\n\n$$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}.$$\n\nCom $\\Delta > 0$ há duas raízes distintas, $x_1 < x_2$, e vale a regra:\n\n| Onde está $x$ | Sinal de $ax^2 + bx + c$ |\n| --- | --- |\n| $x < x_1$ ou $x > x_2$ (fora das raízes) | o mesmo sinal de $a$ |\n| $x_1 < x < x_2$ (entre as raízes) | o sinal contrário ao de $a$ |\n| $x = x_1$ ou $x = x_2$ | zero |\n\nGuardar isso fica fácil com a frase: **fora das raízes, o sinal de $a$; entre elas, o contrário**. Como o sinal só pode mudar nas raízes, basta testar um valor em cada trecho para confirmar.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nResolver em $\\mathbb{R}$ a inequação $x^2 - 5x + 6 > 0$.\n\nAs raízes: $\\Delta = (-5)^2 - 4 \\cdot 1 \\cdot 6 = 25 - 24 = 1$, logo $x = \\frac{5 \\pm 1}{2}$, isto é, $x_1 = 2$ e $x_2 = 3$.\n\nAqui $a = 1$, que é positivo. Então o trinômio é positivo fora das raízes e negativo entre elas. Como queremos $> 0$, ficamos com a parte de fora, sem as raízes, porque nelas o trinômio vale zero e zero não é maior que zero:\n\n$$S = \\{x \\in \\mathbb{R} \\mid x < 2 \\text{ ou } x > 3\\} = (-\\infty, 2) \\cup (3, +\\infty).$$\n\nTestando: em $x = 0$ o trinômio vale $6$, positivo, e o $0$ está na resposta; em $x = 2{,}5$ vale $6{,}25 - 12{,}5 + 6 = -0{,}25$, negativo, e esse valor ficou fora mesmo.",
                    },
                    {
                        type: "text",
                        value: "## Quando $a$ é negativo\n\nResolver $-x^2 + 4 \\ge 0$. As raízes saem de $x^2 = 4$, ou seja, $x = -2$ e $x = 2$. Agora $a = -1$, negativo. Fora das raízes o trinômio tem o sinal de $a$, logo é negativo; entre as raízes é positivo.\n\nQueremos $\\ge 0$, isto é, positivo ou zero, então ficamos com o trecho de dentro, agora **com** as bordas, porque nas raízes o trinômio vale zero e zero satisfaz $\\ge 0$:\n\n$$S = \\{x \\in \\mathbb{R} \\mid -2 \\le x \\le 2\\} = [-2, 2].$$\n\nQuem ignora o sinal de $a$ responde \"fora das raízes\" por reflexo e erra o conjunto inteiro. Em $x = 0$ o trinômio vale $4$, positivo, e o $0$ está dentro: é o teste que resolve a dúvida em dois segundos.",
                    },
                    {
                        type: "text",
                        value: "## O caso $\\Delta = 0$\n\nCom $\\Delta = 0$ existe uma raiz só, chamada **raiz dupla**, e o trinômio tem o sinal de $a$ em toda a reta, exceto nessa raiz, onde vale zero. Tome $x^2 - 6x + 9$, com $\\Delta = 36 - 36 = 0$ e raiz dupla $x = 3$. Como $a = 1 > 0$, o trinômio é positivo em todo lugar menos em $x = 3$. As quatro inequações possíveis saem de graça:\n\n| Inequação | Conjunto solução |\n| --- | --- |\n| $x^2 - 6x + 9 > 0$ | $\\mathbb{R} - \\{3\\}$ |\n| $x^2 - 6x + 9 \\ge 0$ | $\\mathbb{R}$ |\n| $x^2 - 6x + 9 < 0$ | $\\varnothing$ |\n| $x^2 - 6x + 9 \\le 0$ | $\\{3\\}$ |\n\nO símbolo $\\varnothing$ é o conjunto vazio: nenhum real serve. Repare como um único ponto separa a primeira linha da segunda, e como o mesmo ponto é a resposta inteira da quarta.",
                    },
                    {
                        type: "text",
                        value: "## O caso $\\Delta < 0$\n\nCom $\\Delta < 0$ não existe raiz real nenhuma e, sem raiz, o sinal não tem onde mudar: o trinômio tem o sinal de $a$ para todo $x$ real. Em $x^2 + x + 3$ temos $\\Delta = 1 - 12 = -11$ e $a = 1 > 0$, então essa expressão é positiva sempre. Daí:\n\n$$x^2 + x + 3 > 0 \\text{ tem } S = \\mathbb{R}, \\qquad x^2 + x + 3 < 0 \\text{ tem } S = \\varnothing.$$\n\nDá para enxergar isso sem fórmula nenhuma, completando o quadrado:\n\n$$x^2 + x + 3 = \\left(x + \\frac{1}{2}\\right)^2 + \\frac{11}{4}.$$\n\nUm quadrado é sempre maior que ou igual a zero, e somado a $\\frac{11}{4}$ nunca chega a zero. Em $x = -\\frac{1}{2}$, onde o valor é o menor possível, a expressão vale $\\frac{11}{4} = 2{,}75$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nResolver em $\\mathbb{R}$ a inequação $-2x^2 + 3x - 5 \\ge 0$.\n\nO discriminante: $\\Delta = 3^2 - 4 \\cdot (-2) \\cdot (-5) = 9 - 40 = -31$, negativo. Então não há raiz real, e o trinômio tem o sinal de $a = -2$ em toda a reta: é **negativo sempre**. Nunca chega a zero nem fica positivo, então nenhum valor real satisfaz $\\ge 0$:\n\n$$S = \\varnothing.$$\n\nPara confirmar, em $x = 0$ a expressão vale $-5$ e, em $x = \\frac{3}{4}$, onde ela é a maior possível, vale $-2 \\cdot \\frac{9}{16} + \\frac{9}{4} - 5 = -3{,}875$, ainda negativo. O erro comum é parar em \"$\\Delta < 0$, logo sem raiz, logo serve todo real\": isso só valeria com $a$ positivo.",
                    },
                    {
                        type: "text",
                        value: "## Voltando ao problema da abertura\n\nA condição era $x^2 + x - 12 \\le 0$. As raízes: $\\Delta = 1 + 48 = 49$, logo $x = \\frac{-1 \\pm 7}{2}$, isto é, $x_1 = -4$ e $x_2 = 3$. Com $a = 1 > 0$, o trinômio é negativo entre as raízes, e o $\\le$ inclui as bordas:\n\n$$S = \\{x \\in \\mathbb{R} \\mid -4 \\le x \\le 3\\} = [-4, 3].$$\n\nDois cuidados fecham a aula. O primeiro é a borda: $\\le$ e $\\ge$ incluem as raízes, $<$ e $>$ não. O segundo é a palavra que liga os pedaços: quando a resposta é a parte de fora, ela se escreve com **ou** ($x < -4$ ou $x > 3$), nunca com **e**, porque nenhum número é ao mesmo tempo menor que $-4$ e maior que $3$.",
                    },
                    {
                        type: "quote",
                        value: "Inequação do segundo grau se resolve pelo sinal do trinômio: ache as raízes, lembre que fora delas vale o sinal de $a$ e entre elas o contrário, e escolha os trechos que a desigualdade pede. Sem raiz real, o sinal de $a$ vale em toda a reta, e a resposta é $\\mathbb{R}$ ou o conjunto vazio.",
                    },
                ],
                questions: [
                    {
                        statement: "O conjunto solução de $x^2 - 7x + 10 > 0$ em $\\mathbb{R}$, em notação de intervalo, é:",
                        difficulty: "facil",
                        options: [
                            { text: "$(-\\infty, 2) \\cup (5, +\\infty)$", isCorrect: true },
                            { text: "$(-\\infty, 2] \\cup [5, +\\infty)$", isCorrect: false },
                            { text: "$(2, 5)$", isCorrect: false },
                            { text: "$[2, 5]$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em $\\mathbb{R}$, o conjunto solução de $x^2 - 9 \\le 0$, em notação de intervalo, é:",
                        difficulty: "facil",
                        options: [
                            { text: "$[0, 3]$", isCorrect: false },
                            { text: "$(-3, 3)$", isCorrect: false },
                            { text: "$(-\\infty, -3] \\cup [3, +\\infty)$", isCorrect: false },
                            { text: "$[-3, 3]$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Resolvendo $x^2 + 8x + 16 > 0$ em $\\mathbb{R}$, o conjunto solução é:",
                        difficulty: "medio",
                        options: [
                            { text: "$\\mathbb{R}$", isCorrect: false },
                            { text: "$\\varnothing$", isCorrect: false },
                            { text: "$\\mathbb{R} - \\{-4\\}$", isCorrect: true },
                            { text: "$\\{x \\in \\mathbb{R} \\mid x > -4\\}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O conjunto solução de $-x^2 + 4x - 3 \\ge 0$ em $\\mathbb{R}$, em notação de intervalo, é:",
                        difficulty: "medio",
                        options: [
                            { text: "$[-3, -1]$", isCorrect: false },
                            { text: "$(-\\infty, 1] \\cup [3, +\\infty)$", isCorrect: false },
                            { text: "$[1, 3]$", isCorrect: true },
                            { text: "$(1, 3)$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Quais números reais satisfazem $-x^2 + 2x - 5 > 0$?",
                        difficulty: "dificil",
                        options: [
                            { text: "todo real serve, $S = \\mathbb{R}$", isCorrect: false },
                            { text: "só $x = 1$ serve, $S = \\{1\\}$", isCorrect: false },
                            { text: "servem os $x \\le 1$, $S = (-\\infty, 1]$", isCorrect: false },
                            { text: "nenhum real serve, $S = \\varnothing$", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Inequação produto e inequação quociente",
                blocks: [
                    {
                        type: "text",
                        value: "# Inequação produto e inequação quociente\n\nQuando é que o produto de dois números é negativo? Só quando os dois têm sinais diferentes, um positivo e o outro negativo. É essa observação simples que resolve inequações como $(x - 2)(x + 3) > 0$. A tentação é abrir a multiplicação, mas não precisa: o produto já está fatorado, e fator fatorado é fator cujo sinal a gente sabe estudar. Nesta aula montamos o quadro de sinais, que organiza esse trabalho, e vemos o cuidado extra que a divisão exige.",
                    },
                    {
                        type: "text",
                        value: "## A regra dos sinais, de novo\n\nPara um produto de dois fatores, a tabela é a de sempre:\n\n| Sinal do primeiro | Sinal do segundo | Sinal do produto |\n| --- | --- | --- |\n| $+$ | $+$ | $+$ |\n| $+$ | $-$ | $-$ |\n| $-$ | $+$ | $-$ |\n| $-$ | $-$ | $+$ |\n\nA divisão segue exatamente a mesma tabela: $\\frac{+}{+}$ e $\\frac{-}{-}$ dão positivo, $\\frac{+}{-}$ e $\\frac{-}{+}$ dão negativo. Então produto e quociente se estudam juntos, com uma única diferença, que aparece no meio da aula: no quociente o denominador não pode ser zero.",
                    },
                    {
                        type: "text",
                        value: "## O quadro de sinais\n\nO procedimento tem quatro passos:\n\n1. Achar a raiz de cada fator, separadamente.\n2. Marcar essas raízes na reta, que fica dividida em trechos.\n3. Escrever o sinal de cada fator em cada trecho, uma linha por fator.\n4. Multiplicar os sinais coluna por coluna e ler os trechos que a inequação pede.\n\n**Exemplo resolvido 1.** Resolver $(2x - 6)(x + 1) \\le 0$ em $\\mathbb{R}$.\n\nAs raízes: $2x - 6 = 0$ dá $x = 3$, e $x + 1 = 0$ dá $x = -1$. A reta fica em três trechos, e testamos um valor dentro de cada um ($x = -2$, $x = 0$ e $x = 4$):\n\n| Fator | $x < -1$ | $x = -1$ | $-1 < x < 3$ | $x = 3$ | $x > 3$ |\n| --- | --- | --- | --- | --- | --- |\n| $2x - 6$ | $-$ | $-$ | $-$ | $0$ | $+$ |\n| $x + 1$ | $-$ | $0$ | $+$ | $+$ | $+$ |\n| produto | $+$ | $0$ | $-$ | $0$ | $+$ |\n\nQueremos o produto $\\le 0$, isto é, negativo ou zero. Isso acontece no trecho do meio e também nas duas raízes:\n\n$$S = \\{x \\in \\mathbb{R} \\mid -1 \\le x \\le 3\\} = [-1, 3].$$\n\nEm $x = -2$ o produto vale $(-10)(-1) = 10$, positivo, e esse valor ficou fora com razão.",
                    },
                    {
                        type: "text",
                        value: "## Um fator de segundo grau no quadro\n\nO quadro aceita fator de segundo grau sem mudança nenhuma: o sinal dele sai da regra da aula anterior, fora das raízes o sinal de $a$ e entre elas o contrário.\n\nResolver $(x^2 - 4)(x - 5) > 0$. O fator $x^2 - 4$ tem raízes $-2$ e $2$, com $a = 1 > 0$: é positivo fora delas e negativo entre elas. O fator $x - 5$ é negativo antes de $5$ e positivo depois. As raízes de todos os fatores juntas, $-2$, $2$ e $5$, cortam a reta em quatro trechos:\n\n| Fator | $x < -2$ | $-2 < x < 2$ | $2 < x < 5$ | $x > 5$ |\n| --- | --- | --- | --- | --- |\n| $x^2 - 4$ | $+$ | $-$ | $+$ | $+$ |\n| $x - 5$ | $-$ | $-$ | $-$ | $+$ |\n| produto | $-$ | $+$ | $-$ | $+$ |\n\nQueremos o produto $> 0$ e, como a desigualdade é estrita, as raízes ficam de fora:\n\n$$S = (-2, 2) \\cup (5, +\\infty).$$\n\nEm $x = 0$ o produto vale $(-4)(-5) = 20$, positivo, e o $0$ está no conjunto. Em $x = 3$ vale $(5)(-2) = -10$, negativo, e o $3$ ficou fora.",
                    },
                    {
                        type: "text",
                        value: "## Inequação quociente: o denominador manda\n\nNuma inequação quociente, como $\\frac{x - 1}{x + 2} \\ge 0$, o quadro de sinais é o mesmo, mas existe uma regra a mais, e ela não tem exceção: **o denominador não pode ser zero**. O valor que anula o denominador fica fora do conjunto solução sempre, inclusive quando a desigualdade é $\\le$ ou $\\ge$, porque ali a expressão simplesmente não existe.\n\nCompare as duas bordas desse exemplo. O $1$ anula o numerador, a fração vale $0$, e $0 \\ge 0$ é verdadeiro, então o $1$ entra. O $-2$ anula o denominador, a fração não existe, e o $-2$ fica de fora mesmo com o traço embaixo do sinal. Na resposta isso aparece como colchete de um lado e parêntese do outro.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nResolver $\\dfrac{x - 1}{x + 2} \\ge 0$ em $\\mathbb{R}$.\n\nRaiz do numerador: $x = 1$. Raiz do denominador: $x = -2$, que já sabemos estar excluída. Testando $x = -3$, $x = 0$ e $x = 2$:\n\n| Parte | $x < -2$ | $-2 < x < 1$ | $x > 1$ |\n| --- | --- | --- | --- |\n| $x - 1$ | $-$ | $-$ | $+$ |\n| $x + 2$ | $-$ | $+$ | $+$ |\n| quociente | $+$ | $-$ | $+$ |\n\nA fração é positiva ou nula em $x < -2$ e em $x \\ge 1$. Logo:\n\n$$S = \\{x \\in \\mathbb{R} \\mid x < -2 \\text{ ou } x \\ge 1\\} = (-\\infty, -2) \\cup [1, +\\infty).$$\n\nConferindo: em $x = -3$ a fração vale $\\frac{-4}{-1} = 4$, positiva; em $x = 0$ vale $\\frac{-1}{2} = -0{,}5$, negativa; em $x = 1$ vale $0$, que satisfaz $\\ge 0$.",
                    },
                    {
                        type: "text",
                        value: "## O erro grave: multiplicar os dois lados pelo denominador\n\nOlhando $\\frac{x - 1}{x + 2} \\ge 0$, é tentador multiplicar os dois lados por $x + 2$ e escrever $x - 1 \\ge 0$, ou seja, $x \\ge 1$. Está errado, e o motivo é a propriedade da primeira aula: multiplicar por um número negativo inverte o sentido da desigualdade, e **não sabemos o sinal de $x + 2$**, que depende do próprio $x$ que estamos procurando.\n\nA perda é visível: $x = -3$ satisfaz a inequação original, pois ali a fração vale $4$, mas não aparece na resposta $x \\ge 1$. Metade do conjunto solução foi jogada fora. Com o quadro de sinais esse risco não existe, porque cada fator é estudado com o seu próprio sinal, trecho por trecho.",
                    },
                    {
                        type: "text",
                        value: "## Mais uma borda: quando o zero do numerador entra\n\nResolver $\\dfrac{x + 4}{x - 2} \\le 0$. O numerador zera em $-4$ e o denominador em $2$. Os sinais:\n\n| Parte | $x < -4$ | $-4 < x < 2$ | $x > 2$ |\n| --- | --- | --- | --- |\n| $x + 4$ | $-$ | $+$ | $+$ |\n| $x - 2$ | $-$ | $-$ | $+$ |\n| quociente | $+$ | $-$ | $+$ |\n\nA fração é negativa no trecho do meio. O $-4$ entra, porque ali ela vale $0$ e o enunciado aceita o zero. O $2$ não entra, porque ali ela não existe. Então uma borda é fechada e a outra é aberta:\n\n$$S = \\{x \\in \\mathbb{R} \\mid -4 \\le x < 2\\} = [-4, 2).$$\n\nEssa assimetria entre as duas bordas é a marca da inequação quociente, e vale reler a resposta sempre perguntando: qual borda veio do numerador e qual veio do denominador?",
                    },
                    {
                        type: "quote",
                        value: "Produto e quociente se resolvem pelo mesmo quadro: o sinal de cada fator trecho por trecho e a multiplicação dos sinais coluna por coluna. No quociente, o valor que anula o denominador fica fora da resposta mesmo com $\\le$ ou $\\ge$, e nunca se multiplica a inequação pelo denominador sem conhecer o sinal dele.",
                    },
                ],
                questions: [
                    {
                        statement: "O conjunto solução de $(x - 2)(x + 3) > 0$ em $\\mathbb{R}$, em notação de intervalo, é:",
                        difficulty: "facil",
                        options: [
                            { text: "$(-3, 2)$", isCorrect: false },
                            { text: "$(-\\infty, -2) \\cup (3, +\\infty)$", isCorrect: false },
                            { text: "$(-\\infty, -3) \\cup (2, +\\infty)$", isCorrect: true },
                            { text: "$[-3, 2]$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em $\\mathbb{R}$, o conjunto solução de $(x - 1)(x - 4) \\le 0$, em notação de intervalo, é:",
                        difficulty: "facil",
                        options: [
                            { text: "$[1, 4]$", isCorrect: true },
                            { text: "$(1, 4)$", isCorrect: false },
                            { text: "$(-\\infty, 1] \\cup [4, +\\infty)$", isCorrect: false },
                            { text: "$[-4, -1]$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Resolvendo $\\dfrac{x + 1}{x - 3} \\ge 0$ em $\\mathbb{R}$, o conjunto solução, em notação de intervalo, é:",
                        difficulty: "medio",
                        options: [
                            { text: "$[-1, 3)$", isCorrect: false },
                            { text: "$(-\\infty, -1] \\cup (3, +\\infty)$", isCorrect: true },
                            { text: "$(-\\infty, -1] \\cup [3, +\\infty)$", isCorrect: false },
                            { text: "$[-1, +\\infty)$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O conjunto solução de $\\dfrac{x - 3}{x + 1} \\le 0$ em $\\mathbb{R}$, em notação de intervalo, é:",
                        difficulty: "medio",
                        options: [
                            { text: "$[-1, 3]$", isCorrect: false },
                            { text: "$(-\\infty, -1) \\cup [3, +\\infty)$", isCorrect: false },
                            { text: "$(-1, 3]$", isCorrect: true },
                            { text: "$(-1, 3)$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em $\\mathbb{R}$, o conjunto solução de $(x^2 - 1)(x - 4) < 0$, em notação de intervalo, é:",
                        difficulty: "dificil",
                        options: [
                            { text: "$(-1, 1) \\cup (4, +\\infty)$", isCorrect: false },
                            { text: "$(1, 4)$", isCorrect: false },
                            { text: "$(-\\infty, -1] \\cup [1, 4]$", isCorrect: false },
                            { text: "$(-\\infty, -1) \\cup (1, 4)$", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Módulo de um número real e equação com módulo",
                blocks: [
                    {
                        type: "text",
                        value: "# Módulo de um número real e equação com módulo\n\nUm termostato deve manter a sala a $20$ graus. Se o termômetro marca $23$, o desvio é de $3$ graus; se marca $17$, o desvio também é de $3$ graus. Para quem controla o aparelho, o que importa é o tamanho do desvio, não o lado para onde ele foi. A operação que apaga o sinal e guarda só o tamanho é o **módulo**, ou valor absoluto, escrito entre barras: $|3| = 3$ e $|-3| = 3$. Nesta aula vemos a definição, as propriedades e como resolver equações em que a incógnita aparece dentro das barras.",
                    },
                    {
                        type: "text",
                        value: "## A definição por partes\n\nO módulo de um número real $x$ é definido assim:\n\n$$|x| = \\begin{cases} x, & \\text{se } x \\ge 0 \\\\ -x, & \\text{se } x < 0 \\end{cases}$$\n\nA segunda linha costuma assustar: \"$-x$ não é negativo?\". Não necessariamente. O $-x$ é o **oposto** de $x$ e, quando $x$ já é negativo, o oposto dele é positivo. Veja com números. Para $x = -7$ caímos na segunda linha, e $|-7| = -(-7) = 7$. Para $x = 7$ caímos na primeira, e $|7| = 7$. Para $x = 0$ também caímos na primeira, e $|0| = 0$.\n\nDaí sai a conclusão que vale guardar: o módulo nunca é negativo, e só vale zero quando o número é zero.",
                    },
                    {
                        type: "text",
                        value: "## Módulo é distância\n\nNa reta real, $|x|$ é a **distância de $x$ até a origem**. O $7$ e o $-7$ estão os dois a sete unidades do zero, um de cada lado, e por isso têm o mesmo módulo.\n\nA versão geral é ainda mais útil: a distância entre dois pontos $a$ e $b$ da reta é\n\n$$|a - b| = |b - a|.$$\n\nEntão $|x - 3|$ é a distância de $x$ até $3$. Essa leitura resolve equações quase sem conta: $|x - 3| = 5$ pergunta quais pontos estão a cinco unidades de distância do $3$. Andando cinco para a direita chegamos em $8$; andando cinco para a esquerda, em $-2$. São essas as duas soluções, e logo abaixo a gente chega nas mesmas pela conta.",
                    },
                    {
                        type: "text",
                        value: "## As propriedades usadas na prática\n\nO módulo nunca é negativo: $|x| \\ge 0$ para todo real $x$, e $|x| = 0$ acontece só quando $x = 0$.\n\nO sinal de dentro não muda o módulo: $|-x| = |x|$, e por isso $|-4| = |4| = 4$.\n\nO quadrado apaga o módulo: $|x|^2 = x^2$. De fato, $|-4|^2 = 4^2 = 16$ e $(-4)^2 = 16$. Na mesma linha, $\\sqrt{x^2} = |x|$, e não $x$: veja que $\\sqrt{(-4)^2} = \\sqrt{16} = 4$, que é $|-4|$.\n\nO módulo se distribui no produto e no quociente: $|ab| = |a| \\cdot |b|$ e $\\left|\\dfrac{a}{b}\\right| = \\dfrac{|a|}{|b|}$ com $b \\neq 0$. Por exemplo, $|(-3) \\cdot 5| = |-15| = 15$ e $|-3| \\cdot |5| = 3 \\cdot 5 = 15$.\n\nE falta a que **não** vale: $|a + b|$ em geral não é $|a| + |b|$. Com $a = 5$ e $b = -3$, o lado esquerdo é $|2| = 2$ e o direito é $5 + 3 = 8$. Módulo não se distribui na soma.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1: os dois casos\n\nResolver $|x - 3| = 5$ em $\\mathbb{R}$.\n\nSe o módulo de algo vale $5$, esse algo é $5$ ou $-5$. Nada mais. Então abrimos dois casos:\n\nCaso 1: $x - 3 = 5$, que dá $x = 8$.\n\nCaso 2: $x - 3 = -5$, que dá $x = -2$.\n\nAs duas soluções passam pelo teste no enunciado original: $|8 - 3| = |5| = 5$ e $|-2 - 3| = |-5| = 5$. Logo\n\n$$S = \\{-2, 8\\},$$\n\nque é exatamente o par encontrado pela leitura de distância. O erro mais comum aqui é resolver só o caso 1 e responder $x = 8$: perde-se metade da resposta.",
                    },
                    {
                        type: "text",
                        value: "## Módulo nos dois lados\n\nResolver $|2x + 1| = |x - 4|$ em $\\mathbb{R}$.\n\nSe dois números têm o mesmo módulo, eles são iguais ou são opostos. Daí os dois casos:\n\nCaso 1: $2x + 1 = x - 4$, que dá $x = -5$.\n\nCaso 2: $2x + 1 = -(x - 4)$, isto é, $2x + 1 = -x + 4$, logo $3x = 3$ e $x = 1$.\n\nVerificando no enunciado original: para $x = -5$, $|2 \\cdot (-5) + 1| = |-9| = 9$ e $|-5 - 4| = |-9| = 9$, confere; para $x = 1$, $|2 + 1| = 3$ e $|1 - 4| = |-3| = 3$, confere também. Então\n\n$$S = \\{-5, 1\\}.$$\n\nNo caso 2 o parêntese em $-(x - 4)$ é obrigatório. Quem escreve $2x + 1 = -x - 4$ troca o sinal só do primeiro termo e encontra $x = -\\frac{5}{3}$, que não resolve nada: ali os módulos valem $\\frac{7}{3}$ e $\\frac{17}{3}$, bem diferentes.",
                    },
                    {
                        type: "text",
                        value: "## Quando não existe solução\n\nA equação $|x| = -2$ não tem solução nenhuma, e nem precisa de conta: o módulo nunca é negativo, e nenhum real tem módulo $-2$. Escrevemos $S = \\varnothing$.\n\nO mesmo aparece disfarçado. Em $|x - 1| + 5 = 2$, isolamos o módulo e chegamos a $|x - 1| = -3$: impossível, $S = \\varnothing$. Quem ignora o sinal e resolve $|x - 1| = 3$ responde $\\{-2, 4\\}$, e nenhum dos dois serve, porque $|-2 - 1| + 5 = 8$ e $|4 - 1| + 5 = 8$, nunca $2$.\n\nNo outro extremo, $|x - 1| = 0$ tem solução única, $x = 1$, porque o módulo só se anula quando o que está dentro é zero.",
                    },
                    {
                        type: "text",
                        value: "## Quando a incógnita também aparece fora: verifique\n\nResolver $|x - 2| = 3x$ em $\\mathbb{R}$.\n\nCaso 1: $x - 2 = 3x$, que dá $-2 = 2x$, logo $x = -1$.\n\nCaso 2: $x - 2 = -3x$, que dá $4x = 2$, logo $x = \\frac{1}{2}$.\n\nAgora a verificação deixa de ser formalidade e passa a ser parte da conta. Para $x = -1$, o lado esquerdo é $|-1 - 2| = 3$ e o direito é $3 \\cdot (-1) = -3$. Não confere, e o motivo é estrutural: o lado esquerdo é um módulo, nunca negativo, então $3x$ precisa ser maior que ou igual a zero, o que exclui qualquer $x$ negativo. Esse $-1$ é uma **raiz estranha**, que apareceu no meio do processo e não resolve a equação original.\n\nPara $x = \\frac{1}{2}$, o esquerdo é $\\left|\\frac{1}{2} - 2\\right| = \\frac{3}{2}$ e o direito é $3 \\cdot \\frac{1}{2} = \\frac{3}{2}$. Confere. Logo\n\n$$S = \\left\\{\\frac{1}{2}\\right\\}.$$",
                    },
                    {
                        type: "quote",
                        value: "O módulo apaga o sinal e guarda a distância: $|x|$ é a distância de $x$ até a origem e $|x - a|$ é a distância de $x$ até $a$. Equação com módulo se resolve abrindo os dois casos, e toda raiz encontrada volta ao enunciado original para ser verificada.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o valor numérico de $|-7| + |2 - 9|$?",
                        difficulty: "facil",
                        options: [
                            { text: "$14$", isCorrect: true },
                            { text: "$0$", isCorrect: false },
                            { text: "$9$", isCorrect: false },
                            { text: "$-14$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O conjunto solução da equação $|x + 2| = 6$ em $\\mathbb{R}$ é:",
                        difficulty: "facil",
                        options: [
                            { text: "$S = \\{-6, 6\\}$", isCorrect: false },
                            { text: "$S = \\{-8, 4\\}$", isCorrect: true },
                            { text: "$S = \\{4\\}$", isCorrect: false },
                            { text: "$S = \\{-4, 8\\}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Resolvendo $|3x - 1| = |x + 5|$ em $\\mathbb{R}$, obtemos o conjunto solução:",
                        difficulty: "medio",
                        options: [
                            { text: "$S = \\{3\\}$", isCorrect: false },
                            { text: "$S = \\{-1, 3\\}$", isCorrect: true },
                            { text: "$S = \\{1, -3\\}$", isCorrect: false },
                            { text: "$S = \\left\\{3, \\frac{3}{2}\\right\\}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Quantas soluções reais tem a equação $|2x - 7| + 4 = 1$?",
                        difficulty: "medio",
                        options: [
                            { text: "duas", isCorrect: false },
                            { text: "infinitas", isCorrect: false },
                            { text: "uma", isCorrect: false },
                            { text: "nenhuma", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O conjunto solução da equação $|x - 6| = 2x$ em $\\mathbb{R}$ é:",
                        difficulty: "dificil",
                        options: [
                            { text: "$S = \\{-6, 2\\}$", isCorrect: false },
                            { text: "$S = \\varnothing$", isCorrect: false },
                            { text: "$S = \\{-6\\}$", isCorrect: false },
                            { text: "$S = \\{2\\}$", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Inequação com módulo",
                blocks: [
                    {
                        type: "text",
                        value: "# Inequação com módulo\n\nUma empacotadora enche pacotes de café de $500$ gramas, e a norma aceita uma diferença de até $5$ gramas, para mais ou para menos. Se $m$ é a massa de um pacote, o desvio em relação ao valor nominal é $|m - 500|$, e a condição de aceitação é\n\n$$|m - 500| \\le 5.$$\n\nResolver isso é descobrir todas as massas aprovadas. Nesta aula a gente aprende as duas regras que transformam uma inequação com módulo em inequações sem módulo, e por que uma delas produz um intervalo e a outra produz dois pedaços separados.",
                    },
                    {
                        type: "text",
                        value: "## A regra do \"menor que\": um intervalo em volta da origem\n\nPara $a > 0$:\n\n$$|x| < a \\quad \\Longleftrightarrow \\quad -a < x < a.$$\n\nA leitura de distância explica sozinha: $|x| < a$ diz que a distância de $x$ até a origem é menor que $a$, e os pontos assim são exatamente os que ficam entre $-a$ e $a$. Por exemplo, $|x| < 3$ tem solução $-3 < x < 3$, ou seja, o intervalo $(-3, 3)$.\n\nCom $\\le$ a regra é a mesma, com as bordas incluídas: $|x| \\le 3$ equivale a $-3 \\le x \\le 3$, isto é, $[-3, 3]$. Repare que a resposta é um pedaço só da reta, e as duas condições valem ao mesmo tempo, ligadas por **e**.",
                    },
                    {
                        type: "text",
                        value: "## A regra do \"maior que\": dois pedaços\n\nAinda com $a > 0$:\n\n$$|x| > a \\quad \\Longleftrightarrow \\quad x < -a \\quad \\text{ou} \\quad x > a.$$\n\nAgora pedimos os pontos cuja distância até a origem passa de $a$, e eles estão nas duas pontas da reta, longe do zero pelos dois lados. Com $|x| > 3$, a solução é $x < -3$ ou $x > 3$, que em intervalo se escreve $(-\\infty, -3) \\cup (3, +\\infty)$.\n\nAqui não existe um intervalo único: a resposta tem dois pedaços, e eles se juntam por **união**. Do mesmo jeito, $|x| \\ge 3$ dá $(-\\infty, -3] \\cup [3, +\\infty)$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1\n\nResolver $|x - 5| \\le 2$ em $\\mathbb{R}$.\n\nA regra do \"menor que\" se aplica ao que está dentro das barras, por inteiro:\n\n$$-2 \\le x - 5 \\le 2.$$\n\nÉ uma inequação dupla como as da primeira aula. Somando $5$ nos três lados:\n\n$$3 \\le x \\le 7, \\qquad S = \\{x \\in \\mathbb{R} \\mid 3 \\le x \\le 7\\} = [3, 7].$$\n\nA leitura de distância confirma: queremos os pontos a no máximo duas unidades do $5$, e eles vão de $3$ a $7$. Conferindo as bordas, $|3 - 5| = 2 \\le 2$ e $|7 - 5| = 2 \\le 2$, as duas entram. Já $x = 8$ dá $|3| = 3$, que não serve.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2\n\nResolver $|3x + 1| > 4$ em $\\mathbb{R}$.\n\nA regra do \"maior que\" abre dois casos, e os dois ficam na resposta:\n\n$$3x + 1 < -4 \\qquad \\text{ou} \\qquad 3x + 1 > 4.$$\n\nNo primeiro, $3x < -5$, logo $x < -\\frac{5}{3}$. No segundo, $3x > 3$, logo $x > 1$. Juntando por união:\n\n$$S = \\left(-\\infty, -\\frac{5}{3}\\right) \\cup (1, +\\infty).$$\n\nTestando: $x = -2$ dá $|-5| = 5 > 4$, verdadeiro, e o $-2$ está no primeiro pedaço. $x = 0$ dá $|1| = 1$, que não passa de $4$, e o $0$ ficou de fora mesmo. $x = 2$ dá $|7| = 7 > 4$, e está no segundo pedaço. Nas bordas, $x = 1$ dá $|4| = 4$, que não é maior que $4$: por isso parêntese.",
                    },
                    {
                        type: "text",
                        value: "## Os dois erros que mais aparecem\n\n**Esquecer o segundo caso.** Em $|3x + 1| > 4$, quem resolve só $3x + 1 > 4$ responde $(1, +\\infty)$ e perde todo o pedaço da esquerda. O teste de um valor pega o problema na hora: $x = -2$ satisfaz a inequação original e não está nessa resposta.\n\n**Trocar \"ou\" por \"e\".** A resposta do \"maior que\" é $x < -\\frac{5}{3}$ **ou** $x > 1$. Escrever \"e\" no lugar pede um número que seja ao mesmo tempo menor que $-\\frac{5}{3}$ e maior que $1$, e nenhum número é as duas coisas: a resposta viraria $\\varnothing$. Vale a regra prática: o \"menor que\" dá um intervalo e usa \"e\"; o \"maior que\" dá dois pedaços e usa \"ou\".\n\nHá ainda os casos em que o lado direito não é positivo, e aí nem se abre caso nenhum: $|x| < -1$ é impossível, com $S = \\varnothing$, porque módulo nunca é negativo; $|x| > -1$ vale sempre, com $S = \\mathbb{R}$; e $|x| \\le 0$ aceita só $x = 0$.",
                    },
                    {
                        type: "text",
                        value: "## As duas regras lado a lado\n\n| Inequação | Inequação sem módulo | Forma da resposta |\n| --- | --- | --- |\n| $\\lvert x \\rvert < a$ | $-a < x < a$ | um intervalo aberto |\n| $\\lvert x \\rvert \\le a$ | $-a \\le x \\le a$ | um intervalo fechado |\n| $\\lvert x \\rvert > a$ | $x < -a$ ou $x > a$ | dois pedaços, união |\n| $\\lvert x \\rvert \\ge a$ | $x \\le -a$ ou $x \\ge a$ | dois pedaços fechados |\n\nA tabela vale para $a > 0$ e, mais importante, vale com qualquer expressão no lugar do $x$: em $\\lvert 3x + 1 \\rvert > 4$ o papel do $x$ é feito por $3x + 1$ inteiro, e o do $a$ pelo $4$.",
                    },
                    {
                        type: "text",
                        value: "## De volta aos pacotes de café\n\nA condição era $|m - 500| \\le 5$. Pela regra do \"menor que\":\n\n$$-5 \\le m - 500 \\le 5.$$\n\nSomando $500$ nos três lados, $495 \\le m \\le 505$, ou seja, $S = [495, 505]$ em gramas. Um pacote de $496{,}5$ gramas passa, porque o desvio é $3{,}5$. Um de $505$ gramas passa raspando, porque o desvio é exatamente $5$ e a norma aceita o $5$. Um de $494{,}5$ gramas é rejeitado, porque o desvio é $5{,}5$.\n\nFica claro por que o tipo de borda importa tanto num problema de tolerância: trocar o $\\le$ por $<$ reprovaria o pacote de $505$ gramas, que a norma aprova.",
                    },
                    {
                        type: "quote",
                        value: "Inequação com módulo se resolve por duas regras: $|x| < a$ vira $-a < x < a$ e dá um intervalo em volta da origem, enquanto $|x| > a$ vira $x < -a$ ou $x > a$ e dá dois pedaços unidos. Esquecer o segundo caso do \"maior que\", ou trocar o \"ou\" por \"e\", é o que mais custa ponto aqui.",
                    },
                ],
                questions: [
                    {
                        statement: "Em $\\mathbb{R}$, o conjunto solução de $|x| \\le 4$, em notação de intervalo, é:",
                        difficulty: "facil",
                        options: [
                            { text: "$[-4, 4]$", isCorrect: true },
                            { text: "$[0, 4]$", isCorrect: false },
                            { text: "$(-4, 4)$", isCorrect: false },
                            { text: "$(-\\infty, -4] \\cup [4, +\\infty)$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O conjunto solução de $|x - 4| < 3$ em $\\mathbb{R}$, em notação de intervalo, é:",
                        difficulty: "facil",
                        options: [
                            { text: "$(-3, 3)$", isCorrect: false },
                            { text: "$(-7, -1)$", isCorrect: false },
                            { text: "$[1, 7]$", isCorrect: false },
                            { text: "$(1, 7)$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Resolvendo $|2x - 1| \\ge 5$ em $\\mathbb{R}$, o conjunto solução, em notação de intervalo, é:",
                        difficulty: "medio",
                        options: [
                            { text: "$[3, +\\infty)$", isCorrect: false },
                            { text: "$\\varnothing$", isCorrect: false },
                            { text: "$(-\\infty, -2] \\cup [3, +\\infty)$", isCorrect: true },
                            { text: "$(-\\infty, -2) \\cup (3, +\\infty)$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa linha de envase, o pacote é aprovado quando a sua massa $m$, em gramas, satisfaz $|m - 500| \\le 5$. Qual das massas abaixo é reprovada?",
                        difficulty: "medio",
                        options: [
                            { text: "$504{,}5$ gramas", isCorrect: false },
                            { text: "$496{,}5$ gramas", isCorrect: false },
                            { text: "$499{,}5$ gramas", isCorrect: false },
                            { text: "$494{,}5$ gramas", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Em $\\mathbb{R}$, o conjunto solução de $|5 - 2x| \\le 3$, em notação de intervalo, é:",
                        difficulty: "dificil",
                        options: [
                            { text: "$(-\\infty, 1] \\cup [4, +\\infty)$", isCorrect: false },
                            { text: "$[-4, -1]$", isCorrect: false },
                            { text: "$(1, 4)$", isCorrect: false },
                            { text: "$[1, 4]$", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Polinômios",
        aulas: [
            {
                titulo: "Polinômio: grau, valor numérico e identidade",
                blocks: [
                    {
                        type: "text",
                        value: "# Polinômio: grau, valor numérico e identidade\n\nUma loja descobre que o lucro mensal, em milhares de reais, depende do preço $x$ de venda segundo a expressão $-2x^2 + 24x - 54$. Com o preço em $7$ reais, o lucro é $-2 \\cdot 49 + 24 \\cdot 7 - 54 = 16$, ou seja, $16$ mil reais. Expressões como essa, feitas só de potências de $x$ multiplicadas por números e somadas, são **polinômios**. Saber somar, multiplicar, dividir e encontrar as raízes delas é o que abre a porta das equações de grau maior que dois.",
                    },
                    {
                        type: "text",
                        value: "## Do que é feito um polinômio\n\nUm **polinômio na variável $x$** é toda expressão que pode ser escrita na forma\n\n$$P(x) = a_n x^n + a_{n-1} x^{n-1} + \\dots + a_1 x + a_0,$$\n\nem que os números $a_n, a_{n-1}, \\dots, a_0$ são os **coeficientes** e os expoentes de $x$ são números naturais. Nada de expoente negativo, nada de variável dentro de raiz: $\\frac{1}{x} + 3$ e $\\sqrt{x} - 1$ não são polinômios.\n\nQuando $a_n \\neq 0$, o número $n$ é o **grau** de $P$, o coeficiente $a_n$ é o **coeficiente dominante** e $a_0$ é o **termo independente**. Vale notar que $a_0 = P(0)$.\n\nEm $P(x) = 7x^4 - 3x^2 - x + 5$:\n\n| parte | valor |\n| --- | --- |\n| grau | $4$ |\n| coeficiente dominante | $7$ |\n| coeficiente de $x^3$ | $0$ |\n| termo independente | $5$ |\n\nO coeficiente de $x^3$ é zero porque esse termo não aparece escrito. Guardar esse zero é o que salva a divisão de polinômios mais adiante.",
                    },
                    {
                        type: "text",
                        value: "## Valor numérico e raiz\n\nO **valor numérico** de $P$ em $x = a$, escrito $P(a)$, é o número que sai quando se troca cada $x$ por $a$. Para $P(x) = 2x^3 - 5x^2 + x - 3$:\n\n$$P(2) = 2 \\cdot 2^3 - 5 \\cdot 2^2 + 2 - 3 = 16 - 20 + 2 - 3 = -5.$$\n\nO deslize mais comum aqui é calcular $5 \\cdot 2$ no lugar de $5 \\cdot 2^2$: a potência vem antes da multiplicação.\n\nUma **raiz** de $P$ é todo valor $a$ com $P(a) = 0$, isto é, o valor que anula o polinômio. Em $Q(x) = x^2 - 5x + 6$ temos $Q(2) = 4 - 10 + 6 = 0$, então $2$ é raiz de $Q$; já $Q(1) = 1 - 5 + 6 = 2$, diferente de zero, então $1$ não é raiz.",
                    },
                    {
                        type: "text",
                        value: "## Polinômio nulo e identidade\n\nO **polinômio nulo** é aquele com todos os coeficientes iguais a zero. Ele vale zero para qualquer $x$, e por convenção não se define grau para ele.\n\nDois polinômios são **idênticos** quando valem o mesmo número para todo $x$ real, e isso acontece exatamente quando os coeficientes de cada grau coincidem:\n\n$$a_n x^n + \\dots + a_0 \\equiv b_n x^n + \\dots + b_0 \\iff a_n = b_n, \\ \\dots, \\ a_0 = b_0.$$\n\nÉ essa equivalência que autoriza a manobra mais usada do assunto: igualar duas expressões, comparar coeficiente com coeficiente e cair num sistema de equações que entrega as constantes procuradas.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: achar constantes comparando coeficientes\n\nDetermine $a$ e $b$ para que $(a + b)x^2 + (a - b)x - 4$ seja idêntico a $8x^2 + 2x - 4$.\n\nComparando grau por grau, o coeficiente de $x^2$ dá $a + b = 8$ e o coeficiente de $x$ dá $a - b = 2$. Somando as duas equações, $2a = 10$, logo $a = 5$, e daí $b = 3$.\n\nConferindo: $a + b = 5 + 3 = 8$ e $a - b = 5 - 3 = 2$, e o termo independente já era $-4$ nos dois lados.\n\nRepare que a identidade não foi resolvida escolhendo um valor conveniente de $x$. Comparar coeficientes resolve para todo $x$ de uma vez, e é por isso que o método é seguro.",
                    },
                    {
                        type: "text",
                        value: "## Soma, subtração e o grau do resultado\n\nSomar ou subtrair polinômios é juntar os termos semelhantes, grau com grau. Com $A(x) = 3x^3 - x + 2$ e $B(x) = -3x^3 + x^2 + 5$:\n\n$$A(x) + B(x) = (3 - 3)x^3 + x^2 - x + 7 = x^2 - x + 7.$$\n\nOs dois têm grau $3$, mas a soma tem grau $2$, porque os termos de maior grau se cancelaram. A regra honesta é: o grau da soma é **no máximo** o maior dos dois graus, e pode cair.\n\nJá $A(x) - B(x) = 6x^3 - x^2 - x - 3$, de grau $3$. Na subtração, o sinal de menos vale para todos os termos do segundo polinômio, inclusive para o $+5$, que vira $-5$ e se junta ao $+2$.",
                    },
                    {
                        type: "text",
                        value: "## Multiplicação de polinômios\n\nNa multiplicação, cada termo do primeiro multiplica cada termo do segundo, e depois se juntam os semelhantes:\n\n$$(x^2 - 3x + 2)(2x + 1) = 2x^3 + x^2 - 6x^2 - 3x + 4x + 2 = 2x^3 - 5x^2 + x + 2.$$\n\nAqui o grau não escapa. O termo de maior grau do produto vem do produto dos coeficientes dominantes, $1 \\cdot 2 = 2$, que é diferente de zero. Então o grau do produto é sempre a **soma** dos graus, neste caso $2 + 1 = 3$. Diferente da soma, na multiplicação não existe cancelamento possível no topo.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Polinômio é uma soma de termos $a_k x^k$ com expoente natural, e o grau é o maior expoente de coeficiente não nulo.\n- $P(a)$ é o valor numérico em $x = a$, e $a$ é raiz quando $P(a) = 0$.\n- Dois polinômios são idênticos quando os coeficientes de cada grau coincidem, e comparar coeficientes é o que permite achar constantes.\n- O grau da soma é no máximo o maior dos graus, e pode cair por cancelamento; o grau do produto é sempre a soma dos graus.",
                    },
                    {
                        type: "quote",
                        value: "Comparar coeficientes grau por grau é a ferramenta mais barata do assunto: transforma uma igualdade entre expressões num sistema de números.",
                    },
                ],
                questions: [
                    {
                        statement: "No polinômio $P(x) = 5 - 3x^2 + 7x^4 - x$, qual é o grau e qual é o coeficiente dominante?",
                        difficulty: "facil",
                        options: [
                            { text: "grau $5$ e coeficiente dominante $7$", isCorrect: false },
                            { text: "grau $4$ e coeficiente dominante $7$", isCorrect: true },
                            { text: "grau $2$ e coeficiente dominante $-3$", isCorrect: false },
                            { text: "grau $4$ e coeficiente dominante $5$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Sendo $P(x) = 2x^3 - 5x^2 + x - 3$, qual é o valor numérico $P(2)$?",
                        difficulty: "facil",
                        options: [
                            { text: "$-5$", isCorrect: true },
                            { text: "$-7$", isCorrect: false },
                            { text: "$1$", isCorrect: false },
                            { text: "$5$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Os polinômios $P(x) = (a - 1)x^2 + 3x + b$ e $Q(x) = 4x^2 + 3x - 5$ são idênticos. Quais são os valores de $a$ e $b$?",
                        difficulty: "medio",
                        options: [
                            { text: "$a = 5$ e $b = 5$", isCorrect: false },
                            { text: "$a = 3$ e $b = -5$", isCorrect: false },
                            { text: "$a = 5$ e $b = -5$", isCorrect: true },
                            { text: "$a = 4$ e $b = -5$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a forma reduzida do produto $(2x^2 - x + 3)(x - 4)$?",
                        difficulty: "medio",
                        options: [
                            { text: "$2x^3 - 9x^2 + 4x - 12$", isCorrect: false },
                            { text: "$2x^3 - 9x^2 + 7x - 12$", isCorrect: true },
                            { text: "$2x^3 - 9x^2 - 7x - 12$", isCorrect: false },
                            { text: "$2x^3 - 7x^2 + 7x - 12$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Se $2x^2 - x + 3 = a(x - 1)^2 + b(x - 1) + c$ para todo $x$ real, qual é o valor de $a + b + c$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$5$", isCorrect: false },
                            { text: "$9$", isCorrect: true },
                            { text: "$4$", isCorrect: false },
                            { text: "$1$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Divisão de polinômios pelo método da chave",
                blocks: [
                    {
                        type: "text",
                        value: "# Divisão de polinômios pelo método da chave\n\nDividir $37$ por $5$ dá quociente $7$ e resto $2$, e a conta se confere multiplicando de volta: $5 \\cdot 7 + 2 = 37$. Com polinômios o funcionamento é o mesmo, incluindo a conferência. E é essa divisão que depois vai permitir fatorar um polinômio de grau três a partir de uma raiz conhecida.",
                    },
                    {
                        type: "text",
                        value: "## A identidade da divisão\n\nDados o dividendo $P$ e o divisor $D$, com $D$ não nulo, existe um único par de polinômios $Q$ (o quociente) e $R$ (o resto) tal que\n\n$$P(x) = D(x) \\cdot Q(x) + R(x),$$\n\ncom o grau de $R$ menor que o grau de $D$. São as duas exigências juntas que tornam o quociente e o resto únicos: sem a condição sobre o grau do resto qualquer coisa serviria, porque bastaria parar a divisão antes da hora e chamar o que sobrou de resto.\n\nDessa identidade sai também o grau do quociente. Como $D \\cdot Q$ precisa alcançar o grau de $P$, o grau de $Q$ é o grau de $P$ menos o grau de $D$. Dividindo um polinômio de grau $5$ por um de grau $2$, o quociente tem grau $3$ e o resto tem grau no máximo $1$.",
                    },
                    {
                        type: "text",
                        value: "## O algoritmo da chave, passo a passo\n\nA conta é a mesma da divisão de números, com quatro movimentos que se repetem:\n\n1. divida o termo de maior grau do que sobrou pelo termo de maior grau do divisor, e escreva o resultado no quociente;\n2. multiplique esse resultado por todo o divisor;\n3. subtraia o produto do que sobrou, com atenção ao sinal de cada termo;\n4. repita enquanto o grau do que sobrou for maior ou igual ao grau do divisor.\n\nO que sobra quando a repetição para é o resto. O passo $3$ é onde o sinal mais atrapalha: subtrair $-4x$ significa somar $+4x$.",
                    },
                    {
                        type: "text",
                        value: "## A precaução que evita quase todo erro: complete com zero\n\nAntes de começar, escreva o dividendo em ordem decrescente de grau e **complete com coeficiente zero todo grau que não aparece**. O dividendo $x^4 - 3x^2 + 5$ se escreve\n\n$$x^4 + 0x^3 - 3x^2 + 0x + 5.$$\n\nSem esses dois zeros, os termos desalinham na hora da subtração e o $-3x^2$ acaba usado como se fosse o termo de grau $3$. Quase todo erro de divisão de polinômios nasce aí, e não na divisão em si. Vale para o divisor também: ao dividir por $x^2 - 2$, pense nele como $x^2 + 0x - 2$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: divisão exata\n\nDivida $P(x) = 2x^3 - 5x^2 - 7x + 12$ por $D(x) = x - 3$.\n\n- $2x^3 \\div x = 2x^2$. Multiplicando, $2x^2(x - 3) = 2x^3 - 6x^2$. Subtraindo, $-5x^2 - (-6x^2) = x^2$, e sobra $x^2 - 7x + 12$.\n- $x^2 \\div x = x$. Multiplicando, $x(x - 3) = x^2 - 3x$. Subtraindo, $-7x - (-3x) = -4x$, e sobra $-4x + 12$.\n- $-4x \\div x = -4$. Multiplicando, $-4(x - 3) = -4x + 12$. Subtraindo, sobra $0$.\n\nEntão $Q(x) = 2x^2 + x - 4$ e $R(x) = 0$: a divisão é exata. Conferindo pela identidade, $(x - 3)(2x^2 + x - 4) = 2x^3 - 5x^2 - 7x + 12$, que é o dividendo de volta.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: com resto e com termo faltando\n\nDivida $P(x) = x^4 - 3x^2 + 5$ por $D(x) = x^2 + x - 1$. Completando, o dividendo é $x^4 + 0x^3 - 3x^2 + 0x + 5$.\n\n- $x^4 \\div x^2 = x^2$. Produto: $x^2(x^2 + x - 1) = x^4 + x^3 - x^2$. Subtraindo, sobra $-x^3 - 2x^2 + 0x + 5$.\n- $-x^3 \\div x^2 = -x$. Produto: $-x(x^2 + x - 1) = -x^3 - x^2 + x$. Subtraindo, sobra $-x^2 - x + 5$.\n- $-x^2 \\div x^2 = -1$. Produto: $-1(x^2 + x - 1) = -x^2 - x + 1$. Subtraindo, sobra $4$.\n\nO que sobrou é a constante $4$, de grau $0$, menor que o grau $2$ do divisor, então a conta termina: $Q(x) = x^2 - x - 1$ e $R(x) = 4$.\n\nConferindo: $(x^2 + x - 1)(x^2 - x - 1) = x^4 - 3x^2 + 1$, e somando o resto, $x^4 - 3x^2 + 1 + 4 = x^4 - 3x^2 + 5$. Fecha com o dividendo.",
                    },
                    {
                        type: "text",
                        value: "## Quando parar, e que cara o resto pode ter\n\nA divisão para quando o grau do que sobrou fica **menor** que o grau do divisor, e não quando a conta fica feia. Dividindo por $x - 3$, de grau $1$, o resto é sempre uma constante. Dividindo por um divisor de grau $2$, o resto pode ser uma constante ou algo da forma $mx + n$.\n\nPor exemplo, na divisão de $2x^3 + x - 6$ por $x^2 - 2$, o primeiro passo dá $2x$ no quociente e o produto $2x(x^2 - 2) = 2x^3 - 4x$. Subtraindo, sobra $x - (-4x) = 5x$ no grau $1$, ou seja, $5x - 6$. Como $5x - 6$ tem grau $1$, menor que $2$, a conta acaba: $Q(x) = 2x$ e $R(x) = 5x - 6$. Quem soma em vez de subtrair obtém $-3x - 6$ e erra o resto.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Toda divisão obedece a $P = D \\cdot Q + R$ com o grau de $R$ menor que o grau de $D$, e é essa condição que torna $Q$ e $R$ únicos.\n- O grau do quociente é o grau do dividendo menos o grau do divisor.\n- Complete o dividendo com zeros nos graus que faltam antes de montar a chave.\n- A divisão é exata quando $R = 0$, e a conferência é sempre a mesma: multiplicar $D$ por $Q$, somar $R$ e ver se volta o dividendo.",
                    },
                    {
                        type: "quote",
                        value: "Antes de dividir, complete o dividendo com os zeros que faltam. O algoritmo da chave não erra; quem erra é o alinhamento das colunas.",
                    },
                ],
                questions: [
                    {
                        statement: "Na divisão de um polinômio $P$ de grau $5$ por um polinômio $D$ de grau $2$, qual é o grau do quociente e qual é o maior grau possível para o resto?",
                        difficulty: "facil",
                        options: [
                            { text: "quociente de grau $5$ e resto de grau no máximo $2$", isCorrect: false },
                            { text: "quociente de grau $3$ e resto de grau no máximo $1$", isCorrect: true },
                            { text: "quociente de grau $7$ e resto de grau no máximo $1$", isCorrect: false },
                            { text: "quociente de grau $3$ e resto de grau no máximo $2$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Dividindo $P(x) = 3x^3 - 5x^2 - 7x + 10$ por $x - 2$ pelo método da chave, qual é o quociente?",
                        difficulty: "facil",
                        options: [
                            { text: "$3x^2 - 11x + 15$", isCorrect: false },
                            { text: "$3x^2 - x - 5$", isCorrect: false },
                            { text: "$3x^2 + x + 5$", isCorrect: false },
                            { text: "$3x^2 + x - 5$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Para dividir $P(x) = 3x^5 - x^2 + 4$ por $x^2 - x + 2$ pelo método da chave, o primeiro cuidado é escrever o dividendo completo. Qual é essa forma completa de $P$?",
                        difficulty: "medio",
                        options: [
                            { text: "$3x^5 + x^4 + x^3 - x^2 + x + 4$", isCorrect: false },
                            { text: "$3x^5 + 0x^4 + 0x^3 - x^2 + 0x + 4$", isCorrect: true },
                            { text: "$3x^5 + 0x^4 - x^2 + 0x + 4$", isCorrect: false },
                            { text: "$3x^5 + 0x^4 + 0x^3 + 0x^2 - x + 4$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o resto da divisão de $P(x) = 3x^3 - 2x + 7$ por $D(x) = x^2 + 1$?",
                        difficulty: "medio",
                        options: [
                            { text: "$-5x - 7$", isCorrect: false },
                            { text: "$x + 7$", isCorrect: false },
                            { text: "$-2x + 7$", isCorrect: false },
                            { text: "$-5x + 7$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Numa divisão de polinômios, o divisor é $D(x) = x^2 - 3x + 1$, o quociente é $Q(x) = x + 2$ e o resto é $R(x) = 4x - 5$. Qual é o dividendo $P(x)$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$x^3 - x^2 - x - 3$", isCorrect: true },
                            { text: "$x^3 - x^2 - 5x + 2$", isCorrect: false },
                            { text: "$x^3 - x^2 - 9x + 7$", isCorrect: false },
                            { text: "$x^3 + 5x^2 + 11x - 3$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Teorema do resto, D'Alembert e Briot-Ruffini",
                blocks: [
                    {
                        type: "text",
                        value: "# Teorema do resto, D'Alembert e Briot-Ruffini\n\nPara saber o resto da divisão de $x^3 - 4x^2 + 2x + 5$ por $x - 3$, o método da chave funciona, mas dá trabalho. Existe um atalho de uma linha: basta calcular $P(3)$. E quando esse valor dá zero, ganha-se de graça uma fatoração do polinômio. Esta aula é sobre esses dois atalhos e sobre o dispositivo que faz a divisão por $x - a$ em uma única linha de contas.",
                    },
                    {
                        type: "text",
                        value: "## O teorema do resto\n\n**O resto da divisão de $P(x)$ por $x - a$ é $P(a)$.**\n\nA razão está na identidade da divisão. Como o divisor $x - a$ tem grau $1$, o resto tem grau $0$ ou é nulo, isto é, o resto é um número $r$:\n\n$$P(x) = (x - a) \\cdot Q(x) + r.$$\n\nEssa igualdade vale para todo $x$, então vale em particular para $x = a$:\n\n$$P(a) = (a - a) \\cdot Q(a) + r = 0 \\cdot Q(a) + r = r.$$\n\nO fator $x - a$ zera, o quociente desaparece da conta e sobra só o resto. É por isso que não é preciso dividir nada para saber o resto.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: o resto sem dividir\n\nQual é o resto da divisão de $P(x) = x^3 - 4x^2 + 2x + 5$ por $x - 3$?\n\n$$P(3) = 27 - 36 + 6 + 5 = 2.$$\n\nO resto é $2$. Pela chave, o quociente sairia $x^2 - x - 1$, e a conferência fecha: $(x - 3)(x^2 - x - 1) + 2 = x^3 - 4x^2 + 2x + 5$.\n\nAtenção ao divisor: para $x + 2$, o valor a usar é $a = -2$, porque $x + 2 = x - (-2)$. Em $P(x) = x^3 + 2x^2 - 5x + 3$, o resto da divisão por $x + 2$ é $P(-2) = -8 + 8 + 10 + 3 = 13$. Quem usa $a = 2$ por distração obtém $P(2) = 9$, que é o resto de outra divisão, não desta.",
                    },
                    {
                        type: "text",
                        value: "## O teorema de D'Alembert\n\nJuntando o teorema do resto com a definição de divisão exata, sai o resultado mais útil do módulo:\n\n**$P(x)$ é divisível por $x - a$ se e somente se $P(a) = 0$**, ou seja, se e somente se $a$ é raiz de $P$.\n\nOs dois lados são imediatos. Se a divisão é exata, o resto é zero, e o resto é $P(a)$, logo $P(a) = 0$. E se $P(a) = 0$, então o resto é zero e a divisão é exata.\n\nEsse vai e volta é o que transforma uma raiz em um fator. Como $1$ é raiz de $P(x) = x^3 + 3x^2 - 4$, pois $P(1) = 1 + 3 - 4 = 0$, já se sabe, sem dividir nada, que $x - 1$ é um fator desse polinômio.\n\nO teorema também serve para achar coeficiente. Para que $P(x) = x^3 + kx^2 - 5x + 2$ seja divisível por $x - 1$, é preciso $P(1) = 0$, isto é, $1 + k - 5 + 2 = 0$, logo $k = 2$.",
                    },
                    {
                        type: "text",
                        value: "## O dispositivo de Briot-Ruffini\n\nQuando o divisor é do tipo $x - a$, existe um esquema que entrega quociente e resto só com multiplicações e somas. Para dividir $P(x) = 2x^3 + 7x^2 + x - 10$ por $x + 2$, use $a = -2$ e os coeficientes de $P$ em ordem, sem esquecer os zeros dos graus que faltam:\n\n- escreva $a = -2$ à esquerda e os coeficientes $2$, $7$, $1$, $-10$ à direita;\n- baixe o primeiro coeficiente, que é $2$;\n- multiplique por $a$ e some ao coeficiente seguinte: $7 + (-2) \\cdot 2 = 3$;\n- repita: $1 + (-2) \\cdot 3 = -5$;\n- repita: $-10 + (-2) \\cdot (-5) = 0$.\n\n| $a = -2$ | $2$ | $7$ | $1$ | $-10$ |\n| --- | --- | --- | --- | --- |\n| | $2$ | $3$ | $-5$ | $0$ |\n\nOs primeiros números da última linha são os coeficientes do quociente, que tem um grau menos que $P$, e o último número é o resto. Então $Q(x) = 2x^2 + 3x - 5$ e $R = 0$. Conferindo, $(x + 2)(2x^2 + 3x - 5) = 2x^3 + 7x^2 + x - 10$.",
                    },
                    {
                        type: "text",
                        value: "## O cuidado do sinal\n\nO dispositivo divide por $x - a$, então o número que entra é a **raiz do divisor**, não o número que aparece escrito nele. Para $x + 2$, escreve-se $x + 2 = x - (-2)$ e usa-se $a = -2$. Para $x - 5$, usa-se $a = 5$.\n\nNo exemplo anterior, quem usa $a = 2$ obtém a última linha $2$, $11$, $23$, $36$, ou seja, quociente $2x^2 + 11x + 23$ e resto $36$. O resto diferente de zero é o aviso de que algo saiu do lugar: $x - 2$ não divide aquele polinômio, e a conta foi feita para o divisor errado.\n\nQuando o enunciado pede a divisão por $x + 2$ e o resto que sai não é $P(-2)$, o erro é sempre esse.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: raiz, fator e grau que cai\n\nVerifique que $-2$ é raiz de $P(x) = x^3 + 4x^2 + x - 6$ e escreva $P$ como produto de $x + 2$ por um polinômio de grau $2$.\n\nPrimeiro o teste: $P(-2) = -8 + 16 - 2 - 6 = 0$, então $-2$ é raiz e, por D'Alembert, $x + 2$ divide $P$.\n\nAgora Briot-Ruffini com $a = -2$ sobre os coeficientes $1$, $4$, $1$, $-6$:\n\n- baixa o $1$;\n- $4 + (-2) \\cdot 1 = 2$;\n- $1 + (-2) \\cdot 2 = -3$;\n- $-6 + (-2) \\cdot (-3) = 0$.\n\nO resto é $0$, como D'Alembert prometia, e o quociente é $x^2 + 2x - 3$. Logo $P(x) = (x + 2)(x^2 + 2x - 3)$, e multiplicando de volta sai $x^3 + 4x^2 + x - 6$. Uma raiz conhecida baixou o problema de grau três para grau dois, que já se sabe resolver.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Teorema do resto: o resto da divisão de $P(x)$ por $x - a$ é $P(a)$.\n- Teorema de D'Alembert: $P$ é divisível por $x - a$ exatamente quando $P(a) = 0$.\n- Briot-Ruffini divide por $x - a$ em uma linha: baixa o primeiro coeficiente e repete multiplicar por $a$ e somar.\n- Para o divisor $x + 2$ usa-se $a = -2$. Confundir esse sinal é o erro mais frequente do dispositivo, e o resto fora do esperado denuncia.",
                    },
                    {
                        type: "quote",
                        value: "O resto da divisão por $x - a$ é $P(a)$, e quando esse valor dá zero a raiz vira fator. É esse par de resultados que derruba o grau de um polinômio.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o resto da divisão de $P(x) = x^3 - 3x^2 + 4x - 1$ por $x - 2$?",
                        difficulty: "facil",
                        options: [
                            { text: "$27$", isCorrect: false },
                            { text: "$0$", isCorrect: false },
                            { text: "$3$", isCorrect: true },
                            { text: "$-1$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para que o polinômio $P(x) = 2x^3 + kx^2 - x - 6$ seja divisível por $x - 2$, qual deve ser o valor de $k$?",
                        difficulty: "facil",
                        options: [
                            { text: "$5$", isCorrect: false },
                            { text: "$2$", isCorrect: false },
                            { text: "$-2$", isCorrect: true },
                            { text: "$-4$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o resto da divisão de $P(x) = x^3 - 3x^2 + 2x - 4$ por $x + 2$?",
                        difficulty: "medio",
                        options: [
                            { text: "$28$", isCorrect: false },
                            { text: "$-10$", isCorrect: false },
                            { text: "$-28$", isCorrect: true },
                            { text: "$-4$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Dividindo $P(x) = x^3 + x^2 - 2x + 12$ por $x + 3$ com o dispositivo de Briot-Ruffini, qual é o quociente?",
                        difficulty: "medio",
                        options: [
                            { text: "$x^2 - 2x + 4$", isCorrect: true },
                            { text: "$x^2 - 2x - 4$", isCorrect: false },
                            { text: "$x^2 + 4x + 10$", isCorrect: false },
                            { text: "$x^3 - 2x^2 + 4x$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O polinômio $P(x) = x^3 + ax^2 + bx - 6$ deixa resto $0$ na divisão por $x - 1$ e resto $-8$ na divisão por $x + 1$. Quais são os valores de $a$ e $b$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$a = 3$ e $b = 2$", isCorrect: false },
                            { text: "$a = 2$ e $b = 3$", isCorrect: true },
                            { text: "$a = 2$ e $b = -5$", isCorrect: false },
                            { text: "$a = -1$ e $b = 6$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Raízes, multiplicidade e fatoração",
                blocks: [
                    {
                        type: "text",
                        value: "# Raízes, multiplicidade e fatoração\n\nUma equação do segundo grau tem no máximo duas raízes, e o discriminante diz quantas são reais. Para $x^3 - 2x^2 - 5x + 6 = 0$ não existe fórmula de uso prático, mas existe um caminho: achar uma raiz por tentativa organizada, usar essa raiz para baixar o grau e terminar com uma equação do segundo grau, que já se sabe resolver.",
                    },
                    {
                        type: "text",
                        value: "## Quantas raízes tem um polinômio\n\nUm polinômio de grau $n \\ge 1$ tem exatamente $n$ raízes, contadas com multiplicidade, e pode ser escrito na **forma fatorada**\n\n$$P(x) = a_n(x - r_1)(x - r_2) \\cdots (x - r_n),$$\n\nem que $a_n$ é o coeficiente dominante e $r_1, r_2, \\dots, r_n$ são as raízes. Nem toda raiz é um número real, e este módulo trabalha apenas com as raízes reais.\n\nDuas leituras imediatas da forma fatorada. Cada fator $x - r$ entrega a raiz $r$, com o sinal invertido em relação ao que está escrito: o fator $x + 3$ corresponde à raiz $-3$. E o número $a_n$ que multiplica tudo na frente **não é raiz**. Em $P(x) = 5(x - 2)(x + 3)$, as raízes são $2$ e $-3$, e o $5$ não entra na lista.",
                    },
                    {
                        type: "text",
                        value: "## Multiplicidade\n\nQuando o mesmo fator aparece repetido, a raiz correspondente é contada tantas vezes quanto o expoente do fator. Esse expoente é a **multiplicidade** da raiz. Em\n\n$$P(x) = (x - 1)(x - 2)^2,$$\n\no grau é $1 + 2 = 3$, a raiz $1$ tem multiplicidade $1$ (é uma raiz **simples**) e a raiz $2$ tem multiplicidade $2$ (é uma raiz **dupla**). São três raízes contadas com multiplicidade, embora existam só dois valores distintos.\n\nO erro frequente é contar a raiz dupla uma única vez e concluir que esse polinômio de grau $3$ tem apenas duas raízes. O conjunto das raízes é $\\{1, 2\\}$, com dois elementos, mas a contagem com multiplicidade dá três, e é essa contagem que casa com o grau.",
                    },
                    {
                        type: "text",
                        value: "## O teste das raízes racionais\n\nPara achar a primeira raiz de um polinômio de coeficientes inteiros, não se chuta no vazio. Se a fração irredutível $\\frac{p}{q}$ é raiz de\n\n$$a_n x^n + \\dots + a_1 x + a_0,$$\n\nentão $p$ é divisor do termo independente $a_0$ e $q$ é divisor do coeficiente dominante $a_n$.\n\nEm $P(x) = x^3 - 2x^2 - 5x + 6$, o dominante é $1$ e o termo independente é $6$. As candidatas são os divisores de $6$: $\\pm 1$, $\\pm 2$, $\\pm 3$ e $\\pm 6$. Testando a primeira, $P(1) = 1 - 2 - 5 + 6 = 0$, e já se tem uma raiz.\n\nQuando o dominante não é $1$, entram as frações. Em $P(x) = 2x^3 - x^2 - 8x + 4$, as candidatas são os divisores de $4$ sobre os divisores de $2$: $\\pm 1$, $\\pm 2$, $\\pm 4$ e $\\pm \\frac{1}{2}$. O teste não garante que exista raiz racional; ele apenas reduz a uma lista finita o que vale a pena testar.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 1: resolvendo uma equação de grau três\n\nResolva $x^3 - 2x^2 - 5x + 6 = 0$ em $\\mathbb{R}$.\n\nJá vimos que $1$ é raiz. Por D'Alembert, $x - 1$ divide $P$, e Briot-Ruffini com $a = 1$ sobre $1$, $-2$, $-5$, $6$ dá a última linha $1$, $-1$, $-6$, $0$: o quociente é $x^2 - x - 6$ e o resto é $0$, como esperado.\n\nAgora é uma equação do segundo grau. Em $x^2 - x - 6 = 0$ temos $\\Delta = 1 + 24 = 25$, logo $x = \\frac{1 \\pm 5}{2}$, ou seja, $x = 3$ e $x = -2$.\n\nEntão $S = \\{-2, 1, 3\\}$ e $P(x) = (x - 1)(x - 3)(x + 2)$. Multiplicando de volta, o produto devolve $x^3 - 2x^2 - 5x + 6$, e substituir cada raiz no polinômio original dá zero nas três.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo 2: coeficiente dominante diferente de $1$\n\nResolva $2x^3 - x^2 - 8x + 4 = 0$ em $\\mathbb{R}$.\n\nAs candidatas racionais são $\\pm 1$, $\\pm 2$, $\\pm 4$ e $\\pm \\frac{1}{2}$. Testando: $P(1) = -3$, $P(-1) = 9$ e $P(2) = 16 - 4 - 16 + 4 = 0$. Pronto, $2$ é raiz.\n\nBriot-Ruffini com $a = 2$ sobre $2$, $-1$, $-8$, $4$: baixa o $2$; $-1 + 2 \\cdot 2 = 3$; $-8 + 2 \\cdot 3 = -2$; $4 + 2 \\cdot (-2) = 0$. O quociente é $2x^2 + 3x - 2$.\n\nResolvendo $2x^2 + 3x - 2 = 0$: $\\Delta = 9 + 16 = 25$ e $x = \\frac{-3 \\pm 5}{4}$, o que dá $x = \\frac{1}{2}$ e $x = -2$.\n\nEntão $S = \\left\\{-2, \\frac{1}{2}, 2\\right\\}$ e a forma fatorada é $P(x) = 2(x - 2)\\left(x - \\frac{1}{2}\\right)(x + 2)$. Como $2\\left(x - \\frac{1}{2}\\right) = 2x - 1$, fica mais limpo escrever $P(x) = (2x - 1)(x - 2)(x + 2)$.",
                    },
                    {
                        type: "text",
                        value: "## Quando sobra um fator sem raiz real\n\nNem sempre a equação do segundo grau que sobra tem solução real. Ao resolver $x^3 - 3x^2 + 4x - 12 = 0$, o teste das candidatas dá $P(3) = 27 - 27 + 12 - 12 = 0$, e Briot-Ruffini com $a = 3$ deixa o quociente $x^2 + 4$.\n\nMas $x^2 + 4 = 0$ tem $\\Delta = 0 - 16 = -16$, negativo: **não existe número real** cujo quadrado seja $-4$. As duas raízes que faltam não são reais, e por aqui o assunto para. Em $\\mathbb{R}$, a única raiz é $x = 3$, e a fatoração que se escreve é $P(x) = (x - 3)(x^2 + 4)$.\n\nO erro perigoso nesse ponto é resolver $x^2 + 4 = 0$ como se fosse $x^2 - 4 = 0$ e anunciar as raízes $2$ e $-2$. A verificação denuncia na hora: $P(2) = 8 - 12 + 8 - 12 = -8$, diferente de zero.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- Um polinômio de grau $n$ tem $n$ raízes contadas com multiplicidade, e a forma fatorada é $P(x) = a_n(x - r_1) \\cdots (x - r_n)$.\n- A multiplicidade de uma raiz é o expoente do fator correspondente, e a raiz dupla conta duas vezes.\n- O teste das raízes racionais procura as candidatas entre os divisores do termo independente sobre os divisores do coeficiente dominante.\n- Achada uma raiz, Briot-Ruffini baixa o grau; com o quociente de grau $2$, se $\\Delta < 0$ as duas raízes que faltam não são reais.",
                    },
                    {
                        type: "quote",
                        value: "Uma raiz vale mais do que parece: ela vira um fator, o fator baixa o grau, e o que sobra do polinômio de grau três é uma equação do segundo grau.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o conjunto das raízes do polinômio $P(x) = 3(x - 1)(x + 4)(x - 2)$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\{1, 4, 2\\}$", isCorrect: false },
                            { text: "$\\{3, 1, -4, 2\\}$", isCorrect: false },
                            { text: "$\\{1, -4, 2\\}$", isCorrect: true },
                            { text: "$\\{-1, 4, -2\\}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No polinômio $P(x) = (x - 3)^2(x + 1)$, qual é o grau de $P$ e qual é a multiplicidade da raiz $3$?",
                        difficulty: "facil",
                        options: [
                            { text: "grau $2$ e multiplicidade $2$", isCorrect: false },
                            { text: "grau $3$ e multiplicidade $2$", isCorrect: true },
                            { text: "grau $4$ e multiplicidade $2$", isCorrect: false },
                            { text: "grau $3$ e multiplicidade $1$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Pelo teste das raízes racionais, quais são as únicas candidatas a raiz racional de $P(x) = 3x^3 + 2x^2 - 7x + 2$?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\pm 1$, $\\pm 2$, $\\pm \\frac{1}{2}$ e $\\pm \\frac{3}{2}$", isCorrect: false },
                            { text: "$\\pm 1$ e $\\pm 2$", isCorrect: false },
                            { text: "$\\pm 1$, $\\pm 2$, $\\pm \\frac{1}{3}$ e $\\pm \\frac{2}{3}$", isCorrect: true },
                            { text: "$\\pm 1$, $\\pm 2$, $\\pm 3$ e $\\pm \\frac{1}{3}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o conjunto das raízes reais da equação $x^3 - 4x^2 + x + 6 = 0$?",
                        difficulty: "medio",
                        options: [
                            { text: "$S = \\{2, 3\\}$", isCorrect: false },
                            { text: "$S = \\{-1, 2, 3\\}$", isCorrect: true },
                            { text: "$S = \\{1, -2, -3\\}$", isCorrect: false },
                            { text: "$S = \\{-1, -2, 3\\}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Resolvendo em $\\mathbb{R}$, qual é o conjunto das raízes da equação $x^3 + 2x^2 + x + 2 = 0$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$S = \\{-2\\}$, só uma raiz real", isCorrect: true },
                            { text: "$S = \\{2\\}$, só uma raiz real", isCorrect: false },
                            { text: "$S = \\{-2, -1\\}$, duas raízes reais", isCorrect: false },
                            { text: "$S = \\{-2, 1, -1\\}$, três raízes reais", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Relações de Girard",
                blocks: [
                    {
                        type: "text",
                        value: "# Relações de Girard\n\nDois números somam $4$ e multiplicam $3$: quais são? Quem já resolveu equação do segundo grau conhece esse atalho, porque soma e produto das raízes saem direto dos coeficientes, sem calcular raiz nenhuma. Para o grau três existe o mesmo tipo de relação, com três igualdades no lugar de duas, e elas resolvem em poucas linhas problemas que de outro jeito dariam um sistema enorme.",
                    },
                    {
                        type: "text",
                        value: "## O caso do grau dois, em uma frase\n\nSe $r_1$ e $r_2$ são as raízes de $ax^2 + bx + c = 0$, com $a \\neq 0$, então $r_1 + r_2 = -\\frac{b}{a}$ e $r_1 \\cdot r_2 = \\frac{c}{a}$.\n\nEm $3x^2 - 12x + 9 = 0$, a soma é $-\\frac{-12}{3} = 4$ e o produto é $\\frac{9}{3} = 3$. As raízes são $1$ e $3$, que de fato somam $4$ e multiplicam $3$.",
                    },
                    {
                        type: "text",
                        value: "## As três relações do grau três\n\nSeja $ax^3 + bx^2 + cx + d = 0$, com $a \\neq 0$, e sejam $r_1$, $r_2$ e $r_3$ as suas três raízes, contadas com multiplicidade. Então:\n\n$$r_1 + r_2 + r_3 = -\\frac{b}{a},$$\n\n$$r_1 r_2 + r_1 r_3 + r_2 r_3 = \\frac{c}{a},$$\n\n$$r_1 r_2 r_3 = -\\frac{d}{a}.$$\n\nA segunda é a soma dos **produtos dois a dois**, e com três raízes existem exatamente três desses produtos. Note o padrão dos sinais: menos, mais, menos, alternando a cada relação.\n\nConferindo em $x^3 - 7x^2 + 14x - 8 = 0$, cujas raízes são $1$, $2$ e $4$: a soma é $1 + 2 + 4 = 7 = -\\frac{-7}{1}$; a soma dois a dois é $1 \\cdot 2 + 1 \\cdot 4 + 2 \\cdot 4 = 14 = \\frac{14}{1}$; e o produto é $1 \\cdot 2 \\cdot 4 = 8 = -\\frac{-8}{1}$.",
                    },
                    {
                        type: "text",
                        value: "## O erro de sinal nas somas alternadas\n\nO tropeço mais comum de Girard não é na conta, é no sinal. A soma das raízes é $-\\frac{b}{a}$, **com o menos na frente**, e o produto das três é $-\\frac{d}{a}$, também com menos; só a soma dois a dois entra positiva.\n\nEm $x^3 - 7x^2 + 14x - 8 = 0$, a soma das raízes é $-\\frac{-7}{1} = 7$, e não $-7$. Já em $x^3 + 5x^2 + 2x - 3 = 0$, a soma é $-\\frac{5}{1} = -5$ e o produto é $-\\frac{-3}{1} = 3$.\n\nDuas defesas práticas. Primeira: o sinal do coeficiente já vem embutido em $b$ e em $d$, então substitua o número com o sinal dele e deixe o menos da fórmula agir depois. Segunda: achadas as raízes, some e multiplique para conferir. Se a soma não voltar em $-\\frac{b}{a}$, alguma raiz está errada ou está faltando.",
                    },
                    {
                        type: "text",
                        value: "## Uso 1: achar as raízes com uma informação extra\n\nAs raízes de $x^3 - 9x^2 + 23x - 15 = 0$ estão em progressão aritmética. Quais são?\n\nEstando em progressão aritmética, elas podem ser escritas como $m - t$, $m$ e $m + t$. A soma das três é $3m$, e Girard diz que essa soma vale $-\\frac{-9}{1} = 9$. Logo $3m = 9$ e $m = 3$: a raiz do meio é $3$, sem resolver equação nenhuma.\n\nO produto das três é $-\\frac{-15}{1} = 15$, isto é, $(3 - t) \\cdot 3 \\cdot (3 + t) = 15$, ou $3(9 - t^2) = 15$, o que dá $9 - t^2 = 5$ e $t^2 = 4$, logo $t = 2$ (o sinal de $t$ só troca a ordem das raízes).\n\nAs raízes são $1$, $3$ e $5$. Conferindo na relação do meio: $1 \\cdot 3 + 1 \\cdot 5 + 3 \\cdot 5 = 3 + 5 + 15 = 23$, que é o coeficiente $c$, como tinha que ser.",
                    },
                    {
                        type: "text",
                        value: "## Uso 2: achar um coeficiente a partir das raízes\n\nAs raízes de $x^3 + bx^2 + cx + 8 = 0$ são $-1$, $2$ e $4$. Quais são os valores de $b$ e $c$?\n\nA soma das raízes é $-1 + 2 + 4 = 5$, e Girard diz que essa soma vale $-\\frac{b}{1} = -b$. Então $-b = 5$ e $b = -5$.\n\nA soma dois a dois é $(-1) \\cdot 2 + (-1) \\cdot 4 + 2 \\cdot 4 = -2 - 4 + 8 = 2$, e essa soma vale $\\frac{c}{1} = c$. Então $c = 2$.\n\nFalta usar o termo independente como conferência: o produto das raízes é $(-1) \\cdot 2 \\cdot 4 = -8$, e a relação pede $-\\frac{8}{1} = -8$. Bate. O polinômio é $x^3 - 5x^2 + 2x + 8$, e multiplicar $(x + 1)(x - 2)(x - 4)$ chega exatamente nele.",
                    },
                    {
                        type: "text",
                        value: "## Uso 3: uma raiz dada, as outras por Girard\n\nSabendo que $3$ é raiz de $x^3 - 4x^2 - 3x + 18 = 0$, quais são as outras duas?\n\nChame as outras de $r_2$ e $r_3$. A soma das três é $-\\frac{-4}{1} = 4$, então $r_2 + r_3 = 4 - 3 = 1$. O produto das três é $-\\frac{18}{1} = -18$, então $3 \\cdot r_2 \\cdot r_3 = -18$ e $r_2 r_3 = -6$.\n\nDois números com soma $1$ e produto $-6$ são as raízes de $t^2 - t - 6 = 0$, que fatora em $(t - 3)(t + 2)$. Logo $r_2 = 3$ e $r_3 = -2$: a raiz $3$ é dupla, e o polinômio é $(x - 3)^2(x + 2)$.\n\nRepare que o valor $3$ apareceu duas vezes, e isso não é erro de conta. Girard conta as raízes com multiplicidade, e é justamente por isso que as três relações continuam valendo quando há raiz repetida.",
                    },
                    {
                        type: "text",
                        value: "## Resumo\n\n- No grau dois, a soma das raízes é $-\\frac{b}{a}$ e o produto é $\\frac{c}{a}$.\n- No grau três, a soma é $-\\frac{b}{a}$, a soma dos produtos dois a dois é $\\frac{c}{a}$ e o produto das três é $-\\frac{d}{a}$.\n- Os sinais alternam, menos e mais e menos, e esse é o ponto em que mais se erra.\n- Girard resolve rápido quando o enunciado dá uma informação extra sobre as raízes, e serve para achar coeficiente quando as raízes são conhecidas.",
                    },
                    {
                        type: "quote",
                        value: "Girard troca raízes por coeficientes nos dois sentidos. O preço é a atenção aos sinais que alternam: menos na soma, mais nos produtos dois a dois, menos no produto das três.",
                    },
                ],
                questions: [
                    {
                        statement: "Quais são a soma e o produto das raízes da equação $2x^2 - 10x + 8 = 0$?",
                        difficulty: "facil",
                        options: [
                            { text: "soma $10$ e produto $8$", isCorrect: false },
                            { text: "soma $5$ e produto $-4$", isCorrect: false },
                            { text: "soma $5$ e produto $4$", isCorrect: true },
                            { text: "soma $-5$ e produto $4$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a soma das raízes da equação $2x^3 - 6x^2 + 5x - 1 = 0$?",
                        difficulty: "facil",
                        options: [
                            { text: "$3$", isCorrect: true },
                            { text: "$\\frac{1}{2}$", isCorrect: false },
                            { text: "$6$", isCorrect: false },
                            { text: "$-3$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "As raízes da equação $x^3 + px^2 + qx + 24 = 0$ são $2$, $-3$ e $4$. Quais são os valores de $p$ e $q$?",
                        difficulty: "medio",
                        options: [
                            { text: "$p = -3$ e $q = -24$", isCorrect: false },
                            { text: "$p = -3$ e $q = -10$", isCorrect: true },
                            { text: "$p = 3$ e $q = -10$", isCorrect: false },
                            { text: "$p = -3$ e $q = 10$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "As raízes da equação $x^3 - 6x^2 + 11x - 6 = 0$ estão em progressão aritmética. Qual é a raiz do meio?",
                        difficulty: "medio",
                        options: [
                            { text: "$3$", isCorrect: false },
                            { text: "$2$", isCorrect: true },
                            { text: "$6$", isCorrect: false },
                            { text: "$-2$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Sabendo que $2$ é raiz da equação $2x^3 - 11x^2 + 17x - 6 = 0$, qual é o conjunto de todas as raízes dessa equação?",
                        difficulty: "dificil",
                        options: [
                            { text: "$S = \\{2, 3\\}$", isCorrect: false },
                            { text: "$S = \\left\\{-2, 3, \\frac{1}{2}\\right\\}$", isCorrect: false },
                            { text: "$S = \\left\\{2, 3, -\\frac{1}{2}\\right\\}$", isCorrect: false },
                            { text: "$S = \\left\\{2, 3, \\frac{1}{2}\\right\\}$", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Progressões",
        aulas: [
            {
                titulo: "Sequências e leis de formação",
                blocks: [
                    {
                        type: "text",
                        value: "# Sequências e leis de formação\n\nUma academia cobra $80$ reais de matrícula e $120$ reais por mês. Ao fim do primeiro mês você gastou $200$ reais, ao fim do segundo $320$, ao fim do terceiro $440$. Esses números não são um conjunto solto: eles vêm em ordem, cada um na sua posição, e existe uma regra que diz como passar de um para o seguinte.\n\nEssa é a ideia de **sequência**. Nesta aula vamos aprender a nomear os termos de uma sequência e a escrever a regra que a gera, de duas formas bem diferentes: a que entrega qualquer termo direto e a que entrega cada termo a partir do anterior.",
                    },
                    {
                        type: "text",
                        value: "## Sequência e a notação $a_n$\n\nUma **sequência** é uma lista ordenada de números. O que importa é a posição: a sequência $(2, 5, 8)$ não é a mesma coisa que $(5, 2, 8)$.\n\nCada número da lista é um **termo**. Indicamos o termo que está na posição $n$ por $a_n$, e lemos \"a índice $n$\". Nesta trilha o primeiro termo é sempre $a_1$, nunca $a_0$.\n\nNa sequência $(7, 11, 15, 19, 23)$ temos $a_1 = 7$, $a_2 = 11$, $a_3 = 15$, $a_4 = 19$ e $a_5 = 23$. A letra $n$ é a **posição**, sempre um número natural ($1, 2, 3, \\dots$), e $a_n$ é o **valor** que ocupa essa posição. Confundir posição com valor é a origem de boa parte dos erros em progressões, e vamos voltar a esse ponto várias vezes.",
                    },
                    {
                        type: "text",
                        value: "## Lei explícita: o termo direto da posição\n\nUma **lei explícita** (também chamada de termo geral) é uma fórmula que recebe a posição $n$ e devolve o termo $a_n$, sem precisar de nenhum outro termo.\n\n$$a_n = 2n + 3$$\n\n**Exemplo resolvido.** Vamos listar os quatro primeiros termos dessa sequência e depois achar $a_{50}$.\n\nSubstituindo $n = 1, 2, 3, 4$:\n\n$$a_1 = 2 \\cdot 1 + 3 = 5 \\qquad a_2 = 2 \\cdot 2 + 3 = 7$$\n\n$$a_3 = 2 \\cdot 3 + 3 = 9 \\qquad a_4 = 2 \\cdot 4 + 3 = 11$$\n\nA sequência é $(5, 7, 9, 11, \\dots)$. E para a posição $50$ não precisamos listar nada: $a_{50} = 2 \\cdot 50 + 3 = 103$. É essa a vantagem da lei explícita, pular direto para a posição pedida.",
                    },
                    {
                        type: "text",
                        value: "## Recorrência: cada termo a partir do anterior\n\nNa **recorrência**, a regra diz como passar de um termo para o seguinte, e por isso precisa de um ponto de partida. Por exemplo:\n\n$$a_1 = 3 \\qquad a_{n+1} = a_n + 2$$\n\nA primeira igualdade dá o começo, a segunda diz \"o próximo é o atual mais $2$\". Então $a_2 = 3 + 2 = 5$, $a_3 = 5 + 2 = 7$, $a_4 = 7 + 2 = 9$, e a sequência é $(3, 5, 7, 9, 11, \\dots)$.\n\n**Exemplo resolvido.** Dados $a_1 = 2$ e $a_{n+1} = 3a_n - 1$, qual é $a_4$?\n\n$$a_2 = 3 \\cdot 2 - 1 = 5$$\n\n$$a_3 = 3 \\cdot 5 - 1 = 14$$\n\n$$a_4 = 3 \\cdot 14 - 1 = 41$$\n\nLogo $a_4 = 41$. Repare no preço da recorrência: para chegar ao termo de posição $4$ passamos obrigatoriamente pelos de posição $2$ e $3$. Se a pergunta fosse $a_{100}$, seriam $99$ contas em fila. A lei explícita não cobra esse preço, mas nem toda sequência tem lei explícita simples.",
                    },
                    {
                        type: "text",
                        value: "## Fibonacci, a recorrência mais famosa\n\nA sequência de Fibonacci começa com dois termos iguais a $1$ e, daí em diante, cada termo é a soma dos dois anteriores:\n\n$$a_1 = 1, \\qquad a_2 = 1, \\qquad a_{n+2} = a_{n+1} + a_n$$\n\nGerando termo a termo: $a_3 = 1 + 1 = 2$, $a_4 = 1 + 2 = 3$, $a_5 = 2 + 3 = 5$, $a_6 = 3 + 5 = 8$, $a_7 = 5 + 8 = 13$ e $a_8 = 8 + 13 = 21$.\n\n$$(1, 1, 2, 3, 5, 8, 13, 21, 34, 55, \\dots)$$\n\nEla aparece em contagens de pares de coelhos, em arranjos de pétalas e em um monte de problemas de contagem. E é o exemplo perfeito de sequência que se define com facilidade por recorrência e com muita dificuldade por lei explícita: existe uma fórmula fechada para o $n$-ésimo termo de Fibonacci, mas ela é bem pior que a recorrência de uma linha.",
                    },
                    {
                        type: "text",
                        value: "## Reconhecer o padrão pelos primeiros termos\n\nQuando a sequência vem escrita apenas pelos primeiros termos, o caminho é olhar o que acontece de um termo para o outro: a diferença, o quociente, o sinal.\n\n| Sequência | O que acontece de um termo para o outro | Lei provável |\n| --- | --- | --- |\n| $(5, 8, 11, 14, \\dots)$ | soma $3$ a cada passo | $a_n = 3n + 2$ |\n| $(3, 6, 12, 24, \\dots)$ | dobra a cada passo | $a_n = 3 \\cdot 2^{n-1}$ |\n| $(1, 4, 9, 16, \\dots)$ | são os quadrados perfeitos | $a_n = n^2$ |\n| $(1, -1, 1, -1, \\dots)$ | troca de sinal a cada passo | $a_n = (-1)^{n+1}$ |\n\n**Exemplo resolvido.** De onde sai o $a_n = 3n + 2$ da primeira linha? A diferença entre termos consecutivos é $3$, então a lei tem a forma $a_n = 3n + c$. Para que $a_1$ valha $5$, precisamos de $3 \\cdot 1 + c = 5$, ou seja, $c = 2$. Conferindo: $a_2 = 3 \\cdot 2 + 2 = 8$ e $a_3 = 3 \\cdot 3 + 2 = 11$, como queríamos.\n\nQuem escreve $a_n = 3n + 5$, usando o primeiro termo como constante, gera $(8, 11, 14, \\dots)$ e começa um termo adiante. É o erro de tratar o primeiro termo como se ele estivesse na posição zero.",
                    },
                    {
                        type: "text",
                        value: "## Alguns primeiros termos não determinam a sequência\n\nAqui vale um aviso honesto. Olhe a sequência que começa com $(1, 4, 9, \\dots)$. Parece $a_n = n^2$, e nesse caso o quarto termo seria $16$. Mas a lei\n\n$$b_n = n^2 + (n - 1)(n - 2)(n - 3)$$\n\ndá exatamente $b_1 = 1$, $b_2 = 4$ e $b_3 = 9$, porque em cada um desses três casos um dos fatores do produto é zero. E o quarto termo dela é $b_4 = 16 + 3 \\cdot 2 \\cdot 1 = 22$, não $16$.\n\nOu seja: três termos nunca obrigam uma lei, e o truque funciona sempre, basta somar um produto que se anule nas posições dadas. Por isso um enunciado bem escrito ou **diz a lei** (por exemplo, \"considere $a_n = 2n + 3$\"), ou **diz o tipo de sequência** (\"considere a progressão aritmética cujos primeiros termos são...\"), ou pede claramente o padrão mais natural, aquele que qualquer pessoa reconheceria. Ao resolver uma questão desse tipo, assuma o padrão mais simples que explica todos os termos dados, e deixe explícito qual foi.",
                    },
                    {
                        type: "quote",
                        value: "Sequência é lista com posição, e $a_n$ é o termo que ocupa a posição $n$. A lei explícita entrega qualquer termo de uma vez; a recorrência entrega o próximo a partir do atual, e por isso exige um ponto de partida.",
                    },
                ],
                questions: [
                    {
                        statement: "Considere a sequência de lei explícita $a_n = 2n + 3$, em que o primeiro termo é $a_1$. Qual é o valor de $a_5$?",
                        difficulty: "facil",
                        options: [
                            { text: "$15$", isCorrect: false },
                            { text: "$13$", isCorrect: true },
                            { text: "$11$", isCorrect: false },
                            { text: "$10$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma sequência é dada pela recorrência $a_1 = 5$ e $a_{n+1} = a_n + 4$. Qual é o valor de $a_4$?",
                        difficulty: "facil",
                        options: [
                            { text: "$13$", isCorrect: false },
                            { text: "$20$", isCorrect: false },
                            { text: "$21$", isCorrect: false },
                            { text: "$17$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A sequência $(5, 8, 11, 14, \\dots)$ segue o padrão mais natural, somando sempre a mesma quantidade. Qual lei explícita gera exatamente esses termos, considerando $a_1 = 5$?",
                        difficulty: "medio",
                        options: [
                            { text: "$a_n = 3n + 5$", isCorrect: false },
                            { text: "$a_n = 5n + 3$", isCorrect: false },
                            { text: "$a_n = 3n + 2$", isCorrect: true },
                            { text: "$a_n = 2n + 3$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Na sequência de Fibonacci definida por $a_1 = 1$, $a_2 = 1$ e $a_{n+2} = a_{n+1} + a_n$, qual é o valor de $a_8$?",
                        difficulty: "medio",
                        options: [
                            { text: "$34$", isCorrect: false },
                            { text: "$13$", isCorrect: false },
                            { text: "$16$", isCorrect: false },
                            { text: "$21$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma sequência começa com os termos $2$, $4$ e $8$, nessa ordem, e nada mais é informado sobre ela. Qual das afirmações a seguir é correta?",
                        difficulty: "dificil",
                        options: [
                            { text: "Não dá para afirmar a lei: $a_n = 2^n$ e $a_n = n^2 - n + 2$ geram esses três termos.", isCorrect: true },
                            { text: "Três termos já bastam para fixar a lei, e a única lei possível aqui é $a_n = 2^n$.", isCorrect: false },
                            { text: "A sequência só pode ser $a_n = 2^n$, porque cada termo listado é exatamente o dobro do anterior.", isCorrect: false },
                            { text: "A sequência só pode ser $a_n = 2n$, porque ela começa exatamente no número $2$.", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Progressão aritmética: termo geral",
                blocks: [
                    {
                        type: "text",
                        value: "# Progressão aritmética: termo geral\n\nUm táxi cobra $6$ reais de bandeirada e mais $3$ reais por quilômetro rodado. A corrida de $1$, $2$, $3$ e $4$ quilômetros custa $9$, $12$, $15$ e $18$ reais. De um valor para o seguinte soma-se sempre a mesma coisa.\n\nEsse \"sempre a mesma coisa\" é o que define a progressão aritmética, a sequência mais comum em problema de prova. Nesta aula vamos aprender a achar qualquer termo dela sem precisar listar todos os anteriores.",
                    },
                    {
                        type: "text",
                        value: "## O que é uma PA e quem é a razão\n\nUma **progressão aritmética** (PA) é uma sequência em que a diferença entre cada termo e o anterior é sempre a mesma. Essa diferença constante é a **razão**, indicada por $r$:\n\n$$r = a_{n+1} - a_n$$\n\nPara testar se uma sequência é PA, calcule as diferenças consecutivas. Em $(4, 9, 14, 19, 24)$:\n\n$$9 - 4 = 5 \\qquad 14 - 9 = 5 \\qquad 19 - 14 = 5 \\qquad 24 - 19 = 5$$\n\nTodas iguais a $5$, então é uma PA de razão $r = 5$. Já $(1, 2, 4, 8)$ não é PA, porque as diferenças são $1$, $2$ e $4$.\n\nRepare que a razão se calcula sempre como **o termo de depois menos o de antes**. Invertendo a ordem você acha $-r$, e a PA inteira sai com o sinal trocado.",
                    },
                    {
                        type: "text",
                        value: "## Deduzindo o termo geral\n\nComece em $a_1$ e some $r$ a cada passo:\n\n$$a_2 = a_1 + r$$\n\n$$a_3 = a_2 + r = a_1 + 2r$$\n\n$$a_4 = a_3 + r = a_1 + 3r$$\n\n$$a_5 = a_4 + r = a_1 + 4r$$\n\nOlhe a quantidade de $r$ somados: para chegar em $a_2$ demos $1$ passo, em $a_3$ demos $2$ passos, em $a_5$ demos $4$. Sempre um passo menos que a posição, porque ficar parado em $a_1$ não custa passo nenhum. Daí o **termo geral** da PA:\n\n$$a_n = a_1 + (n - 1)r$$\n\n**Exemplo resolvido.** Numa PA, $a_1 = 7$ e $r = 4$. Qual é $a_{20}$?\n\n$$a_{20} = 7 + (20 - 1) \\cdot 4 = 7 + 19 \\cdot 4 = 7 + 76 = 83$$\n\nEntão $a_{20} = 83$. Conferindo pelo começo da PA, $(7, 11, 15, 19, 23, \\dots)$, cada termo é $4$ maior que o anterior, e são $19$ saltos de $4$ para sair do $7$ e chegar à vigésima casa.",
                    },
                    {
                        type: "text",
                        value: "## O atalho a partir de qualquer termo\n\nO mesmo raciocínio funciona partindo de um termo qualquer, não só do primeiro. De $a_m$ até $a_n$ são $n - m$ saltos de tamanho $r$, logo\n\n$$a_n = a_m + (n - m)r$$\n\nIsso poupa o trabalho de achar $a_1$ quando a questão nem pede $a_1$.\n\n**Exemplo resolvido.** Numa PA, $a_5 = 23$ e $a_{12} = 58$. Qual é a razão?\n\nDe $a_5$ até $a_{12}$ são $12 - 5 = 7$ saltos:\n\n$$58 = 23 + 7r$$\n\nDaí $7r = 35$ e $r = 5$.\n\nE se quisermos também $a_1$, voltamos $4$ saltos a partir de $a_5$: $a_1 = 23 - 4 \\cdot 5 = 3$. A PA é $(3, 8, 13, 18, 23, \\dots)$, e de fato $a_{12} = 3 + 11 \\cdot 5 = 58$.",
                    },
                    {
                        type: "text",
                        value: "## Crescente, decrescente ou constante: o sinal de r\n\nO comportamento de uma PA é decidido só pelo sinal da razão.\n\n| Sinal da razão | Comportamento | Exemplo |\n| --- | --- | --- |\n| $r > 0$ | crescente, cada termo é maior que o anterior | $(2, 6, 10, 14, \\dots)$ com $r = 4$ |\n| $r < 0$ | decrescente, cada termo é menor que o anterior | $(20, 17, 14, 11, \\dots)$ com $r = -3$ |\n| $r = 0$ | constante, todos os termos são iguais | $(9, 9, 9, 9, \\dots)$ com $r = 0$ |\n\nNa PA decrescente da tabela, $a_{10} = 20 + 9 \\cdot (-3) = 20 - 27 = -7$. Nada impede que uma PA que começa positiva fique negativa, e as fórmulas funcionam igual: só não esqueça o parêntese ao substituir razão negativa, porque $20 + 9 \\cdot (-3)$ é bem diferente de $20 + 9 - 3$.",
                    },
                    {
                        type: "text",
                        value: "## Quantos termos tem uma PA\n\nSe a PA é finita e você conhece o primeiro termo, o último e a razão, o termo geral vira uma equação do primeiro grau com a posição como incógnita.\n\n**Exemplo resolvido.** Quantos termos tem a PA $(5, 9, 13, \\dots, 101)$?\n\nA razão é $r = 9 - 5 = 4$ e o último termo vale $101$. Então $101$ ocupa alguma posição $n$:\n\n$$101 = 5 + (n - 1) \\cdot 4$$\n\n$$96 = (n - 1) \\cdot 4$$\n\n$$n - 1 = 24$$\n\n$$n = 25$$\n\nA PA tem $25$ termos. Uma forma de lembrar: a conta $\\frac{101 - 5}{4} = 24$ conta os **saltos**, e a quantidade de termos é sempre um a mais que a de saltos. Esquecer esse $+1$ é um dos erros mais frequentes da matéria.",
                    },
                    {
                        type: "text",
                        value: "## Interpolar meios aritméticos\n\n**Interpolar** (ou inserir) meios aritméticos entre dois números é completar o caminho entre eles com termos que formem uma PA. Os dois números dados passam a ser os extremos dessa PA.\n\n**Exemplo resolvido.** Insira $4$ meios aritméticos entre $3$ e $23$.\n\nCom $4$ meios mais os $2$ extremos, a PA terá $6$ termos, sendo $a_1 = 3$ e $a_6 = 23$. De $a_1$ até $a_6$ são $5$ saltos:\n\n$$23 = 3 + 5r$$\n\n$$5r = 20$$\n\n$$r = 4$$\n\nA PA é $(3, 7, 11, 15, 19, 23)$, e os meios inseridos são $7$, $11$, $15$ e $19$.\n\nCuidado com o denominador: são $5$ saltos, não $4$. Quem divide $20$ pelo número de meios acha $r = 5$ e monta $(3, 8, 13, 18, 23, 28)$, que nem termina em $23$. O número de saltos é sempre o número de meios mais um.",
                    },
                    {
                        type: "text",
                        value: "## O erro de usar n no lugar de n menos 1\n\nÉ o erro número um em progressões, e vale ver a conta dos dois lados. Na PA de $a_1 = 7$ e $r = 4$, o vigésimo termo é\n\n$$a_{20} = 7 + (20 - 1) \\cdot 4 = 83$$\n\nQuem escreve $a_n = a_1 + nr$ calcula $7 + 20 \\cdot 4 = 87$ e erra por exatamente $4$, ou seja, por uma razão inteira de diferença. O resultado não é absurdo, é só um termo adiante: $87$ é o $a_{21}$ dessa mesma PA.\n\nÉ isso que torna o erro perigoso, ele não parece erro. A defesa é lembrar da origem da fórmula: o primeiro termo já está lá, de graça, antes de qualquer salto. Para chegar à posição $n$ dando passos a partir de $a_1$, são $n - 1$ passos.\n\nVale o mesmo cuidado na forma $a_n = a_m + (n - m)r$: de $a_3$ até $a_7$ são $4$ saltos, não $5$, embora o trecho de $a_3$ a $a_7$ tenha $5$ termos.",
                    },
                    {
                        type: "quote",
                        value: "Numa PA a diferença entre termos consecutivos é a razão $r$, e o termo geral é $a_n = a_1 + (n - 1)r$. O $n - 1$ não é detalhe de notação: ele conta os saltos, e saltos são sempre um menos que termos.",
                    },
                ],
                questions: [
                    {
                        statement: "Numa progressão aritmética, o primeiro termo é $a_1 = 4$ e a razão é $r = 6$. Qual é o valor de $a_{15}$?",
                        difficulty: "facil",
                        options: [
                            { text: "$82$", isCorrect: false },
                            { text: "$94$", isCorrect: false },
                            { text: "$90$", isCorrect: false },
                            { text: "$88$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Considere a progressão aritmética $(3, 10, 17, 24, \\dots)$, cujo primeiro termo é $a_1 = 3$. Qual é o valor de $a_{12}$?",
                        difficulty: "facil",
                        options: [
                            { text: "$84$", isCorrect: false },
                            { text: "$73$", isCorrect: false },
                            { text: "$87$", isCorrect: false },
                            { text: "$80$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Numa progressão aritmética, $a_4 = 19$ e $a_9 = 44$. Qual é o valor do primeiro termo $a_1$?",
                        difficulty: "medio",
                        options: [
                            { text: "$9$", isCorrect: false },
                            { text: "$4$", isCorrect: true },
                            { text: "$14$", isCorrect: false },
                            { text: "$-1$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Quantos termos tem a progressão aritmética finita $(7, 11, 15, \\dots, 99)$?",
                        difficulty: "medio",
                        options: [
                            { text: "$24$ termos", isCorrect: true },
                            { text: "$22$ termos", isCorrect: false },
                            { text: "$23$ termos", isCorrect: false },
                            { text: "$25$ termos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa progressão aritmética, $a_3 = 12$ e $a_7 = 32$. Qual é a posição ocupada pelo termo igual a $97$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$n = 24$", isCorrect: false },
                            { text: "$n = 20$", isCorrect: true },
                            { text: "$n = 21$", isCorrect: false },
                            { text: "$n = 19$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Soma dos termos de uma PA",
                blocks: [
                    {
                        type: "text",
                        value: "# Soma dos termos de uma PA\n\nConta-se que o professor de uma turma de crianças, querendo alguns minutos de silêncio, mandou os alunos somarem todos os números de $1$ até $100$. Em pouco tempo um aluno chamado Carl Friedrich Gauss entregou a resposta: $5050$.\n\nEle não somou cem números um a um. Ele percebeu uma simetria na lista, e é exatamente essa simetria que dá a fórmula da soma de qualquer progressão aritmética.",
                    },
                    {
                        type: "text",
                        value: "## O truque de emparelhar as pontas\n\nEscreva a soma de $1$ até $100$ duas vezes, a segunda de trás para frente, e some coluna por coluna:\n\n$$S = 1 + 2 + 3 + \\dots + 98 + 99 + 100$$\n\n$$S = 100 + 99 + 98 + \\dots + 3 + 2 + 1$$\n\nCada coluna dá o mesmo total: $1 + 100 = 101$, $2 + 99 = 101$, $3 + 98 = 101$, e assim até o fim. São $100$ colunas valendo $101$, e isso é $2S$, porque escrevemos a soma duas vezes:\n\n$$2S = 100 \\cdot 101 = 10100$$\n\n$$S = \\frac{10100}{2} = 5050$$\n\nO que faz todas as colunas darem o mesmo valor é justamente a PA: quando um lado anda $r$ para cima, o outro anda $r$ para baixo, e a soma da coluna não muda.",
                    },
                    {
                        type: "text",
                        value: "## A fórmula da soma\n\nO mesmo argumento, com $a_1$ no lugar do $1$, $a_n$ no lugar do $100$ e $n$ termos no total, dá a **soma dos $n$ primeiros termos de uma PA**:\n\n$$S_n = \\frac{(a_1 + a_n)n}{2}$$\n\nEm palavras: soma as pontas, multiplica pela quantidade de termos, divide por dois. O dois vem de termos escrito a soma duas vezes, e esquecer dele dobra a resposta.\n\n**Exemplo resolvido.** Qual é a soma dos $15$ primeiros termos da PA $(4, 10, 16, \\dots)$?\n\nPrimeiro o décimo quinto termo, com $a_1 = 4$ e $r = 6$:\n\n$$a_{15} = 4 + 14 \\cdot 6 = 4 + 84 = 88$$\n\nAgora a soma:\n\n$$S_{15} = \\frac{(4 + 88) \\cdot 15}{2} = \\frac{92 \\cdot 15}{2} = \\frac{1380}{2} = 690$$\n\nA soma dos $15$ primeiros termos vale $690$.",
                    },
                    {
                        type: "text",
                        value: "## Quando o último termo não é dado\n\nSe a questão dá $a_1$, $r$ e $n$, mas não dá $a_n$, não é preciso calcular $a_n$ em separado. Substituindo $a_n = a_1 + (n - 1)r$ na fórmula, fica\n\n$$S_n = \\frac{[2a_1 + (n - 1)r]n}{2}$$\n\n**Exemplo resolvido.** Some os $12$ primeiros termos da PA de $a_1 = 5$ e $r = 3$.\n\n$$S_{12} = \\frac{[2 \\cdot 5 + 11 \\cdot 3] \\cdot 12}{2} = \\frac{(10 + 33) \\cdot 12}{2} = \\frac{43 \\cdot 12}{2} = 258$$\n\nDá $258$. Conferindo pelo outro caminho: $a_{12} = 5 + 11 \\cdot 3 = 38$, e então $S_{12} = \\frac{(5 + 38) \\cdot 12}{2} = \\frac{43 \\cdot 12}{2} = 258$. As duas fórmulas são a mesma coisa, escrita de dois jeitos.",
                    },
                    {
                        type: "text",
                        value: "## Dois casos que vale guardar\n\n**A soma dos $n$ primeiros naturais positivos.** É a PA de $a_1 = 1$, razão $1$ e último termo $a_n = n$:\n\n$$1 + 2 + 3 + \\dots + n = \\frac{(1 + n)n}{2}$$\n\nPara $n = 100$ isso devolve os $5050$ de Gauss, e para $n = 10$ dá $\\frac{11 \\cdot 10}{2} = 55$.\n\n**A soma dos $n$ primeiros ímpares.** Os ímpares formam a PA $(1, 3, 5, 7, \\dots)$, de razão $2$, cujo termo de posição $n$ é $a_n = 1 + (n - 1) \\cdot 2 = 2n - 1$. Logo\n\n$$1 + 3 + 5 + \\dots + (2n - 1) = \\frac{(1 + 2n - 1)n}{2} = \\frac{2n \\cdot n}{2} = n^2$$\n\nA soma dos $n$ primeiros ímpares é exatamente $n^2$. Com $n = 5$: $1 + 3 + 5 + 7 + 9 = 25$, e $5^2 = 25$.",
                    },
                    {
                        type: "text",
                        value: "## Um problema de contexto\n\n**Exemplo resolvido.** Um teatro tem $15$ fileiras de poltronas. A primeira fileira tem $12$ poltronas e cada fileira seguinte tem $3$ poltronas mais que a anterior. Quantas poltronas tem o teatro?\n\nAs quantidades por fileira formam uma PA com $a_1 = 12$, $r = 3$ e $n = 15$. A última fileira tem\n\n$$a_{15} = 12 + 14 \\cdot 3 = 12 + 42 = 54$$\n\ne o total de poltronas é a soma de todas as fileiras:\n\n$$S_{15} = \\frac{(12 + 54) \\cdot 15}{2} = \\frac{66 \\cdot 15}{2} = \\frac{990}{2} = 495$$\n\nSão $495$ poltronas no teatro. Note que $54$ também é um número tentador, mas ele responde a outra pergunta: quantas poltronas tem a última fileira. Leia sempre se o enunciado pede um **termo** ou a **soma** dos termos.",
                    },
                    {
                        type: "text",
                        value: "## Achar a quantidade de termos a partir da soma\n\nQuando a soma é o dado e $n$ é a incógnita, a fórmula vira uma equação do segundo grau, porque $n$ aparece duas vezes.\n\n**Exemplo resolvido.** Na PA $(3, 7, 11, \\dots)$, quantos termos somam $300$?\n\nCom $a_1 = 3$ e $r = 4$:\n\n$$\\frac{[2 \\cdot 3 + (n - 1) \\cdot 4]n}{2} = 300$$\n\n$$\\frac{(4n + 2)n}{2} = 300$$\n\n$$2n^2 + n = 300$$\n\n$$2n^2 + n - 300 = 0$$\n\nO discriminante é $1 + 2400 = 2401$, e $\\sqrt{2401} = 49$. Então\n\n$$n = \\frac{-1 \\pm 49}{4}$$\n\no que dá $n = 12$ ou $n = -12{,}5$. A segunda raiz resolve a equação, mas não resolve o problema: $n$ é uma **quantidade de termos**, logo um número natural. Raiz negativa ou fracionária se descarta na hora, e a resolução traz essa justificativa escrita.\n\nConferindo a raiz que ficou: $a_{12} = 3 + 11 \\cdot 4 = 47$ e $S_{12} = \\frac{(3 + 47) \\cdot 12}{2} = \\frac{600}{2} = 300$.",
                    },
                    {
                        type: "quote",
                        value: "A soma de uma PA é a soma das pontas repetida $n$ vezes e dividida por dois: $S_n = \\frac{(a_1 + a_n)n}{2}$. O dois do denominador vem do emparelhamento, e quando a soma é o dado quem vira incógnita é $n$, com a raiz negativa descartada por não ser natural.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a soma de todos os números naturais de $1$ até $50$?",
                        difficulty: "facil",
                        options: [
                            { text: "$1275$", isCorrect: true },
                            { text: "$2550$", isCorrect: false },
                            { text: "$1250$", isCorrect: false },
                            { text: "$1225$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa progressão aritmética, $a_1 = 6$ e $a_{12} = 50$. Qual é a soma dos $12$ primeiros termos dessa PA?",
                        difficulty: "facil",
                        options: [
                            { text: "$286$", isCorrect: false },
                            { text: "$390$", isCorrect: false },
                            { text: "$672$", isCorrect: false },
                            { text: "$336$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um auditório tem $18$ fileiras de poltronas. A primeira fileira tem $14$ poltronas e cada fileira seguinte tem $4$ poltronas mais que a anterior. Quantas poltronas tem o auditório ao todo?",
                        difficulty: "medio",
                        options: [
                            { text: "$864$ poltronas", isCorrect: true },
                            { text: "$82$ poltronas", isCorrect: false },
                            { text: "$1728$ poltronas", isCorrect: false },
                            { text: "$782$ poltronas", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa progressão aritmética de primeiro termo $a_1 = 7$ e razão $r = 5$, qual é a soma dos $20$ primeiros termos?",
                        difficulty: "medio",
                        options: [
                            { text: "$1090$", isCorrect: true },
                            { text: "$1140$", isCorrect: false },
                            { text: "$988$", isCorrect: false },
                            { text: "$2180$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Na progressão aritmética $(2, 5, 8, 11, \\dots)$, a soma dos $n$ primeiros termos vale $155$. Qual é o valor de $n$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$n = 10$", isCorrect: true },
                            { text: "$n = 52$", isCorrect: false },
                            { text: "$n = 11$", isCorrect: false },
                            { text: "$n = 9$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Progressão geométrica: termo geral",
                blocks: [
                    {
                        type: "text",
                        value: "# Progressão geométrica: termo geral\n\nUma folha de papel tem espessura pequena, mas dobre ela ao meio e a espessura dobra. Dobre de novo e dobra outra vez. Depois de $10$ dobras a espessura foi multiplicada por $2^{10} = 1024$, e depois de $20$ dobras por $2^{20}$, que passa de um milhão.\n\nQuando o que é constante não é a diferença entre os termos, mas o **quociente**, a sequência não cresce somando, cresce multiplicando. Essa é a progressão geométrica, e é com ela que se descrevem juros, população e decaimento radioativo.",
                    },
                    {
                        type: "text",
                        value: "## O que é uma PG e quem é a razão\n\nUma **progressão geométrica** (PG) é uma sequência em que o quociente entre cada termo e o anterior é sempre o mesmo. Esse quociente constante é a **razão**, indicada por $q$:\n\n$$q = \\frac{a_{n+1}}{a_n}$$\n\nPara testar, divida cada termo pelo anterior. Em $(5, 10, 20, 40, 80)$:\n\n$$\\frac{10}{5} = 2 \\qquad \\frac{20}{10} = 2 \\qquad \\frac{40}{20} = 2 \\qquad \\frac{80}{40} = 2$$\n\nTodos iguais a $2$, então é uma PG de razão $q = 2$. Já $(3, 6, 9, 12)$ não é PG, porque os quocientes são $2$, $1{,}5$ e $1{,}3333\\dots$ (aquela é uma PA, de razão $3$).\n\nNa PA a pergunta é \"quanto eu somei\", na PG a pergunta é \"por quanto eu multipliquei\". Confundir as duas perguntas é o erro mais caro desta aula.",
                    },
                    {
                        type: "text",
                        value: "## Deduzindo o termo geral\n\nComece em $a_1$ e multiplique por $q$ a cada passo:\n\n$$a_2 = a_1 q$$\n\n$$a_3 = a_2 q = a_1 q^2$$\n\n$$a_4 = a_3 q = a_1 q^3$$\n\nO expoente conta as multiplicações feitas, e de novo é um menos que a posição, pelo mesmo motivo de antes: ficar em $a_1$ não custa multiplicação nenhuma. O **termo geral** da PG é\n\n$$a_n = a_1 q^{\\,n-1}$$\n\n**Exemplo resolvido.** Na PG $(3, 6, 12, 24, \\dots)$, qual é $a_8$?\n\nA razão é $q = \\frac{6}{3} = 2$ e o primeiro termo é $a_1 = 3$:\n\n$$a_8 = 3 \\cdot 2^{8-1} = 3 \\cdot 2^7 = 3 \\cdot 128 = 384$$\n\nEntão $a_8 = 384$. Listando para conferir: $(3, 6, 12, 24, 48, 96, 192, 384)$, e o $384$ está de fato na oitava casa.",
                    },
                    {
                        type: "text",
                        value: "## O atalho a partir de qualquer termo\n\nEntre $a_m$ e $a_n$ há $n - m$ multiplicações por $q$, então\n\n$$a_n = a_m q^{\\,n-m}$$\n\n**Exemplo resolvido.** Numa PG de termos positivos, $a_3 = 20$ e $a_6 = 160$. Quais são a razão e o primeiro termo?\n\nDe $a_3$ até $a_6$ são $3$ saltos:\n\n$$160 = 20 \\cdot q^3$$\n\n$$q^3 = 8$$\n\n$$q = 2$$\n\nCom a razão na mão, volte os $2$ saltos de $a_3$ até $a_1$, agora dividindo:\n\n$$a_1 = \\frac{20}{q^2} = \\frac{20}{4} = 5$$\n\nA PG é $(5, 10, 20, 40, 80, 160, \\dots)$. Note a regra do caminho: para **avançar** se multiplica por $q$, para **voltar** se divide. Quem multiplica na volta acha $20 \\cdot 4 = 80$, que não é $a_1$ e sim $a_5$.",
                    },
                    {
                        type: "text",
                        value: "## O comportamento da PG conforme a razão\n\nCom primeiro termo positivo, o sinal e o tamanho de $q$ decidem tudo.\n\n| Razão | Comportamento | Exemplo |\n| --- | --- | --- |\n| $q > 1$ | crescente, e cresce cada vez mais rápido | $(2, 6, 18, 54, \\dots)$ com $q = 3$ |\n| $0 < q < 1$ | decrescente, se aproximando de zero | $(80, 40, 20, 10, \\dots)$ com $q = \\frac{1}{2}$ |\n| $q = 1$ | constante, todos os termos iguais | $(7, 7, 7, 7, \\dots)$ com $q = 1$ |\n| $q < 0$ | alternada, trocando de sinal a cada termo | $(1, -2, 4, -8, \\dots)$ com $q = -2$ |\n\nDois cuidados. Primeiro: numa PG de razão negativa não faz sentido perguntar se ela é crescente ou decrescente, porque ela sobe e desce alternando. Segundo: $q = 0$ não vale, porque zeraria todos os termos daí em diante e o quociente $\\frac{a_{n+1}}{a_n}$ deixaria de existir no passo seguinte. Numa PG nenhum termo é zero.",
                    },
                    {
                        type: "text",
                        value: "## Juros compostos, população e meia-vida\n\nA PG é o modelo de tudo que cresce ou decresce por **porcentagem fixa** aplicada sobre o valor atual.\n\n**Juros compostos.** Um capital de $5000$ reais rende $20\\%$ por período. A cada período o valor é multiplicado por $1{,}2$, então os saldos formam uma PG de $a_1 = 5000$ e $q = 1{,}2$:\n\n$$(5000, \\; 6000, \\; 7200, \\; 8640, \\; 10368, \\; \\dots)$$\n\nAqui $a_1$ é o saldo no instante inicial, então o saldo depois de $4$ períodos é $a_5 = 5000 \\cdot 1{,}2^4 = 10368$ reais. Diga sempre qual índice representa o instante zero, senão a resposta sai um período deslocada.\n\n**Crescimento populacional.** Uma cultura de bactérias que dobra a cada hora, começando com $400$ indivíduos, forma a PG $(400, 800, 1600, 3200, \\dots)$ com $q = 2$, em que $a_1$ é a contagem na hora zero e $a_n$ é a contagem após $n - 1$ horas.\n\n**Meia-vida.** Uma substância radioativa com meia-vida de $4$ horas perde metade da massa a cada $4$ horas. Começando com $160$ mg, as massas formam a PG de razão $q = \\frac{1}{2}$:\n\n$$(160, \\; 80, \\; 40, \\; 20, \\; 10, \\; \\dots)$$\n\nDepois de $16$ horas passaram-se $4$ meias-vidas, e a massa é $a_5 = 160 \\cdot \\left(\\frac{1}{2}\\right)^4 = \\frac{160}{16} = 10$ mg. Repare que dividir $160$ por $4$, o número de meias-vidas, daria $40$ mg, que está errado: meia-vida divide pela metade quatro vezes, e isso é dividir por $16$.",
                    },
                    {
                        type: "text",
                        value: "## Interpolar meios geométricos\n\nInterpolar meios geométricos entre dois números é completar o caminho entre eles com termos que formem uma PG, tomando os números dados como extremos.\n\n**Exemplo resolvido.** Insira $3$ meios geométricos positivos entre $2$ e $162$.\n\nCom $3$ meios mais os $2$ extremos, a PG terá $5$ termos, com $a_1 = 2$ e $a_5 = 162$. De $a_1$ até $a_5$ são $4$ multiplicações:\n\n$$162 = 2 \\cdot q^4$$\n\n$$q^4 = 81$$\n\n$$q = 3$$\n\nComo os termos pedidos são positivos, ficamos com $q = 3$ e descartamos $q = -3$, que também satisfaz $q^4 = 81$. A PG é $(2, 6, 18, 54, 162)$, e os meios inseridos são $6$, $18$ e $54$.\n\nMesmo cuidado da interpolação aritmética: são $4$ saltos, não $3$. E quem interpola somando, fazendo $\\frac{162 - 2}{4} = 40$, monta $(2, 42, 82, 122, 162)$, que é uma PA e não uma PG.",
                    },
                    {
                        type: "text",
                        value: "## Os dois erros clássicos\n\n**Expoente $n$ no lugar de $n - 1$.** Na PG de $a_1 = 3$ e $q = 2$, o oitavo termo é $3 \\cdot 2^7 = 384$. Quem escreve $a_n = a_1 q^{\\,n}$ calcula $3 \\cdot 2^8 = 768$, que é o dobro do valor certo e corresponde a $a_9$. Na PA o mesmo descuido errava por uma razão somada; na PG ele erra por um fator inteiro de $q$, e o estrago cresce com o expoente.\n\n**Fórmula da PA aplicada na PG.** Na mesma PG, quem calcula $3 + 7 \\cdot 2 = 17$ confundiu o modelo: aqui não se soma a razão sete vezes, se multiplica por ela sete vezes. Uma triagem rápida antes de escolher a fórmula: se as diferenças entre termos consecutivos são iguais, é PA; se os quocientes são iguais, é PG.",
                    },
                    {
                        type: "quote",
                        value: "Numa PG o quociente entre termos consecutivos é a razão $q$, e o termo geral é $a_n = a_1 q^{\\,n-1}$. O expoente conta multiplicações, e multiplicações são sempre uma menos que a posição.",
                    },
                ],
                questions: [
                    {
                        statement: "Numa progressão geométrica, o primeiro termo é $a_1 = 2$ e a razão é $q = 3$. Qual é o valor de $a_6$?",
                        difficulty: "facil",
                        options: [
                            { text: "$1458$", isCorrect: false },
                            { text: "$17$", isCorrect: false },
                            { text: "$162$", isCorrect: false },
                            { text: "$486$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Considere a progressão geométrica $(5, 10, 20, 40, \\dots)$, cujo primeiro termo é $a_1 = 5$. Qual é o valor de $a_7$?",
                        difficulty: "facil",
                        options: [
                            { text: "$640$", isCorrect: false },
                            { text: "$160$", isCorrect: false },
                            { text: "$320$", isCorrect: true },
                            { text: "$35$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa progressão geométrica de termos positivos, $a_2 = 12$ e $a_5 = 324$. Qual é o valor do primeiro termo $a_1$?",
                        difficulty: "medio",
                        options: [
                            { text: "$12$", isCorrect: false },
                            { text: "$36$", isCorrect: false },
                            { text: "$108$", isCorrect: false },
                            { text: "$4$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma amostra de $240$ mg de um isótopo tem meia-vida de $3$ horas. Tomando $a_1 = 240$ como a massa no instante inicial e $a_n$ como a massa após $n - 1$ meias-vidas, qual é a massa da amostra depois de $12$ horas?",
                        difficulty: "medio",
                        options: [
                            { text: "$15$ mg", isCorrect: true },
                            { text: "$7{,}5$ mg", isCorrect: false },
                            { text: "$30$ mg", isCorrect: false },
                            { text: "$60$ mg", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa progressão geométrica, $a_1 = 3$ e a razão é $q = 2$. Qual é a posição ocupada pelo termo igual a $192$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$n = 7$", isCorrect: true },
                            { text: "$n = 6$", isCorrect: false },
                            { text: "$n = 8$", isCorrect: false },
                            { text: "$n = 64$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Soma da PG, finita e infinita",
                blocks: [
                    {
                        type: "text",
                        value: "# Soma da PG, finita e infinita\n\nNa lenda do tabuleiro de xadrez, o inventor do jogo pede como pagamento $1$ grão de trigo na primeira casa, $2$ na segunda, $4$ na terceira, dobrando até a casa $64$. O rei acha o pedido modesto e aceita na hora. O total passa de $18$ quintilhões de grãos, mais trigo do que o mundo produz em séculos.\n\nSomar os termos de uma PG é bem diferente de somar os de uma PA, e tem um resultado surpreendente no fim: às vezes somar infinitos termos dá um número finito.",
                    },
                    {
                        type: "text",
                        value: "## A soma dos n primeiros termos\n\nEscreva a soma, e logo abaixo a mesma soma multiplicada por $q$:\n\n$$S_n = a_1 + a_1 q + a_1 q^2 + \\dots + a_1 q^{\\,n-1}$$\n\n$$q S_n = a_1 q + a_1 q^2 + \\dots + a_1 q^{\\,n-1} + a_1 q^{\\,n}$$\n\nQuase tudo aparece nas duas linhas. Subtraindo a primeira da segunda, todo o meio se cancela e sobram só as pontas:\n\n$$q S_n - S_n = a_1 q^{\\,n} - a_1$$\n\n$$S_n (q - 1) = a_1 (q^{\\,n} - 1)$$\n\nE dividindo por $q - 1$:\n\n$$S_n = a_1 \\cdot \\frac{q^{\\,n} - 1}{q - 1}$$\n\nEssa divisão só é válida se $q \\neq 1$, e é justamente por isso que o caso $q = 1$ fica de fora e é tratado à parte.",
                    },
                    {
                        type: "text",
                        value: "## O caso da razão igual a 1, e um exemplo com a fórmula\n\nSe $q = 1$, todos os termos são iguais a $a_1$, e somar é simplesmente multiplicar:\n\n$$S_n = n \\, a_1$$\n\nPor exemplo, a PG $(7, 7, 7, \\dots)$ tem $S_{10} = 10 \\cdot 7 = 70$. Quem insiste na fórmula geral nesse caso cai em $\\frac{0}{0}$, que não quer dizer nada.\n\n**Exemplo resolvido.** Qual é a soma dos $6$ primeiros termos da PG $(3, 6, 12, \\dots)$?\n\nAqui $a_1 = 3$ e $q = 2$:\n\n$$S_6 = 3 \\cdot \\frac{2^6 - 1}{2 - 1} = 3 \\cdot \\frac{64 - 1}{1} = 3 \\cdot 63 = 189$$\n\nConferindo na mão: $3 + 6 + 12 + 24 + 48 + 96 = 189$.\n\n**Outro exemplo resolvido.** Some os $5$ primeiros termos da PG de $a_1 = 2$ e $q = 3$:\n\n$$S_5 = 2 \\cdot \\frac{3^5 - 1}{3 - 1} = 2 \\cdot \\frac{243 - 1}{2} = 2 \\cdot \\frac{242}{2} = 242$$\n\nDe novo na mão: $2 + 6 + 18 + 54 + 162 = 242$.",
                    },
                    {
                        type: "text",
                        value: "## A soma infinita, e a condição que a permite\n\nOlhe as somas parciais da PG $(8, 4, 2, 1, \\dots)$, de razão $q = \\frac{1}{2}$:\n\n$$8 \\qquad 12 \\qquad 14 \\qquad 15 \\qquad 15{,}5 \\qquad 15{,}75 \\qquad \\dots$$\n\nOs termos somados estão encolhendo pela metade a cada passo, e as somas parciais vão se aproximando de $16$ sem nunca passar dele. Cada termo novo acrescenta menos que o anterior, e a partir de certo ponto o que entra é desprezível diante do total. Dizemos então que a soma dos infinitos termos vale $16$.\n\nNa fórmula da soma finita, o pedaço $q^{\\,n}$ fica minúsculo quando $|q| < 1$ e $n$ cresce: por exemplo, $\\left(\\frac{1}{2}\\right)^{20}$ já é menor que um milionésimo. Abandonando esse pedaço e arrumando os sinais, sobra\n\n$$S = \\frac{a_1}{1 - q}$$\n\nfórmula válida **apenas quando** $|q| < 1$. Conferindo o caso de cima: $S = \\frac{8}{1 - \\frac{1}{2}} = \\frac{8}{\\frac{1}{2}} = 16$.\n\nA condição $|q| < 1$ é parte da fórmula, não uma observação de rodapé. Fora dela a soma infinita simplesmente não existe como número.",
                    },
                    {
                        type: "text",
                        value: "## O que acontece quando a condição é ignorada\n\nPegue a PG $(3, 6, 12, 24, \\dots)$, de razão $q = 2$, e aplique a fórmula da soma infinita sem olhar a condição:\n\n$$\\frac{3}{1 - 2} = \\frac{3}{-1} = -3$$\n\nUma soma de infinitos números positivos não pode dar $-3$. O resultado absurdo é o aviso de que a fórmula foi usada fora do lugar: com $q = 2$ os termos crescem, as somas parciais são $3$, $9$, $21$, $45$, $93$, e passam de qualquer número que você escolher.\n\nCom $q = 1$ a soma infinita também não existe: somar $5 + 5 + 5 + \\dots$ cresce sem parar. E com $q = -2$ as somas parciais ficam pulando cada vez mais longe, alternando de sinal. Só com $|q| < 1$ é que os termos encolhem o suficiente para o total se acomodar num número.",
                    },
                    {
                        type: "text",
                        value: "## Uso bonito 1: a dízima periódica vira fração\n\nA dízima $0{,}2222\\dots$ é literalmente uma soma infinita:\n\n$$0{,}2222\\dots = \\frac{2}{10} + \\frac{2}{100} + \\frac{2}{1000} + \\dots$$\n\nCada parcela é a anterior dividida por $10$, então as parcelas formam uma PG de $a_1 = \\frac{2}{10}$ e $q = \\frac{1}{10}$. Como $|q| < 1$, a fórmula vale:\n\n$$S = \\frac{\\frac{2}{10}}{1 - \\frac{1}{10}} = \\frac{\\frac{2}{10}}{\\frac{9}{10}} = \\frac{2}{9}$$\n\nE $\\frac{2}{9}$ é de fato $0{,}2222\\dots$\n\n**Com período de dois algarismos.** Em $0{,}363636\\dots$ as parcelas são $\\frac{36}{100}$, $\\frac{36}{10000}$, e assim por diante, com razão $q = \\frac{1}{100}$:\n\n$$S = \\frac{\\frac{36}{100}}{1 - \\frac{1}{100}} = \\frac{\\frac{36}{100}}{\\frac{99}{100}} = \\frac{36}{99} = \\frac{4}{11}$$\n\nÉ daqui que vem aquela regra decorada na escola: o período sobre tantos noves quantos forem os algarismos do período.",
                    },
                    {
                        type: "text",
                        value: "## Uso bonito 2: áreas que se reduzem pela metade\n\nNum quadrado de lado $8$ cm, ligue os pontos médios dos quatro lados. O quadrado menor que aparece tem exatamente metade da área do original. Repita o processo dentro dele, e de novo, infinitamente.\n\nA área do primeiro quadrado é $8^2 = 64$, em centímetros quadrados, e as áreas formam a PG\n\n$$(64, \\; 32, \\; 16, \\; 8, \\; 4, \\; \\dots)$$\n\nde razão $q = \\frac{1}{2}$. A soma de todas as áreas é\n\n$$S = \\frac{64}{1 - \\frac{1}{2}} = \\frac{64}{\\frac{1}{2}} = 128$$\n\nou seja, $128$ centímetros quadrados, o dobro da área do quadrado inicial. Infinitas figuras, área total finita. É o mesmo fenômeno das somas parciais que se acomodam, agora com um desenho por trás. O mesmo vale para perímetros que caem pela metade, trocando apenas o valor de $a_1$.",
                    },
                    {
                        type: "quote",
                        value: "A soma de $n$ termos de uma PG é $S_n = a_1 \\cdot \\frac{q^n - 1}{q - 1}$, com o caso $q = 1$ tratado à parte. A soma infinita $S = \\frac{a_1}{1 - q}$ só existe quando $|q| < 1$, e é essa condição que transforma infinitas parcelas num número finito.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a soma dos $6$ primeiros termos da progressão geométrica $(2, 4, 8, 16, \\dots)$?",
                        difficulty: "facil",
                        options: [
                            { text: "$62$", isCorrect: false },
                            { text: "$126$", isCorrect: true },
                            { text: "$254$", isCorrect: false },
                            { text: "$64$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma progressão geométrica infinita tem primeiro termo $a_1 = 6$ e razão $q = \\frac{1}{3}$. Qual é a soma de todos os seus termos?",
                        difficulty: "facil",
                        options: [
                            { text: "$2$", isCorrect: false },
                            { text: "$4$", isCorrect: false },
                            { text: "$18$", isCorrect: false },
                            { text: "$9$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Escrevendo a dízima periódica $0{,}5555\\dots$ como a soma dos infinitos termos de uma progressão geométrica, qual fração se obtém?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{1}{2}$", isCorrect: false },
                            { text: "$\\frac{5}{99}$", isCorrect: false },
                            { text: "$\\frac{5}{9}$", isCorrect: true },
                            { text: "$\\frac{50}{9}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um triângulo equilátero tem lado $16$ cm, e portanto perímetro $48$ cm. Unindo os pontos médios de seus lados obtém-se um novo triângulo equilátero de lado igual à metade, e o processo se repete infinitamente. Qual é a soma dos perímetros de todos esses triângulos, contando o primeiro?",
                        difficulty: "medio",
                        options: [
                            { text: "$96$ cm", isCorrect: true },
                            { text: "$24$ cm", isCorrect: false },
                            { text: "$64$ cm", isCorrect: false },
                            { text: "$48$ cm", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Entre as progressões geométricas infinitas a seguir, qual é a única cuja soma de todos os termos pode ser calculada pela fórmula $S = \\frac{a_1}{1 - q}$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$5 + 5 + 5 + \\dots$, de razão $q = 1$", isCorrect: false },
                            { text: "$6 + 9 + \\frac{27}{2} + \\dots$, de razão $q = \\frac{3}{2}$", isCorrect: false },
                            { text: "$4 - 8 + 16 - \\dots$, de razão $q = -2$", isCorrect: false },
                            { text: "$16 + 8 + 4 + \\dots$, de razão $q = \\frac{1}{2}$", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Contagem e binômio de Newton",
        aulas: [
            {
                titulo: "Princípio multiplicativo",
                blocks: [
                    {
                        type: "text",
                        value: "# Princípio multiplicativo\n\nUma lanchonete vende $4$ tipos de sanduíche e $3$ tipos de suco, e o combo do dia é um sanduíche com um suco. Quantos combos diferentes o cardápio oferece? Com números pequenos dá para listar todos no papel, e no começo vale listar mesmo, mas quando o cardápio cresce a lista vira um trabalho sem fim. Esta aula ensina a contar sem listar, habilidade que também serve de base para o estudo das chances mais adiante.",
                    },
                    {
                        type: "text",
                        value: "## A árvore de possibilidades\n\nComece com um caso pequeno: $2$ camisas (branca e azul) e $3$ calças (jeans, preta e bege). Montar a roupa é escolher a camisa e depois a calça. Desenhando as escolhas:\n\n- camisa **branca**\n    - com a calça jeans\n    - com a calça preta\n    - com a calça bege\n- camisa **azul**\n    - com a calça jeans\n    - com a calça preta\n    - com a calça bege\n\nO desenho tem $2$ galhos, e cada galho se abre em $3$ ramos, o que dá $2 \\cdot 3 = 6$ pontas. Cada ponta é uma roupa. A multiplicação não é um truque decorado: ela conta as pontas da árvore, porque as $3$ opções de calça se repetem inteiras para cada camisa.",
                    },
                    {
                        type: "text",
                        value: "## O princípio multiplicativo\n\n**Princípio multiplicativo**: se uma decisão é tomada em duas etapas, a primeira com $m$ possibilidades e a segunda com $n$ possibilidades para cada escolha da primeira, então o total de resultados é $m \\cdot n$. Com mais etapas o raciocínio se repete e os números se multiplicam:\n\n$$n_1 \\cdot n_2 \\cdot n_3 \\cdot \\dots \\cdot n_k$$\n\nUm detalhe que a fórmula esconde: a segunda etapa precisa ter o **mesmo número** de opções, qualquer que tenha sido a escolha da primeira. Quando isso não acontece, a conta vira uma divisão em casos, assunto que aparece mais adiante neste módulo.\n\nExemplo: com $3$ camisas, $2$ calças e $2$ pares de sapato, o número de roupas completas é $3 \\cdot 2 \\cdot 2 = 12$.",
                    },
                    {
                        type: "text",
                        value: "## Etapas multiplicam, casos somam\n\nEssa é a distinção que organiza todo o assunto. Pergunte: as escolhas acontecem **todas**, uma depois da outra, ou a resposta é de **um tipo ou de outro**?\n\n- etapas em sequência, ligadas por um **e**: multiplique;\n- casos alternativos, que se excluem, ligados por um **ou**: some.\n\nExemplo: da cidade A até a cidade B existem $3$ voos e $2$ ônibus; de B até a cidade C existem $4$ voos. Ir de A até C passando por B é fazer o primeiro trecho **e** o segundo, então os trechos se multiplicam. Mas dentro do primeiro trecho é voo **ou** ônibus, e aí as opções se somam:\n\n$$(3 + 2) \\cdot 4 = 20$$\n\nQuem escreve $3 \\cdot 2 \\cdot 4 = 24$ trata voo e ônibus como duas etapas diferentes, e acaba viajando o mesmo trecho duas vezes.",
                    },
                    {
                        type: "text",
                        value: "## Repetição permitida ou proibida\n\nAntes de multiplicar, decida se um elemento já usado pode aparecer de novo.\n\nUma senha de três dígitos, cada um de $0$ a $9$, com **repetição permitida**, tem $10 \\cdot 10 \\cdot 10 = 1000$ possibilidades: o estoque de dígitos continua inteiro em cada etapa. Se a senha exigir os **três dígitos diferentes**, o estoque diminui de um em um, $10 \\cdot 9 \\cdot 8 = 720$.\n\nA diferença entre $1000$ e $720$ é grande, e é o enunciado que decide qual das duas é a resposta. Em contagem, ler se a repetição é permitida vale metade da nota.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1: a placa\n\nUma placa de identificação tem duas letras, escolhidas num alfabeto de $26$ letras, seguidas de dois dígitos de $0$ a $9$. As duas letras precisam ser diferentes entre si, e os dois dígitos podem repetir. Quantas placas existem?\n\nQuatro etapas, na ordem em que a placa é escrita:\n\n- primeira letra: $26$ opções;\n- segunda letra: $25$ opções, porque uma letra já foi gasta;\n- primeiro dígito: $10$ opções;\n- segundo dígito: $10$ opções, porque dígito pode repetir.\n\n$$26 \\cdot 25 \\cdot 10 \\cdot 10 = 65000$$\n\nSão $65000$ placas. Se as letras também pudessem repetir, daria $26 \\cdot 26 \\cdot 100 = 67600$, e essa diferença de $2600$ placas é exatamente o peso da palavra diferentes no enunciado.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2: números de três algarismos\n\nQuantos números de três algarismos, de $100$ a $999$, têm os três algarismos distintos?\n\nA restrição aqui é dupla: o primeiro algarismo não pode ser zero, senão o número não tem três algarismos, e nenhum algarismo repete. Comece pela etapa mais apertada, a da centena:\n\n- centena: $9$ opções, de $1$ a $9$;\n- dezena: $9$ opções, porque o zero volta a valer, mas o algarismo da centena está fora;\n- unidade: $8$ opções, fora os dois já usados.\n\n$$9 \\cdot 9 \\cdot 8 = 648$$\n\nQuem começa a contagem pela unidade se enrola, porque o número de opções da centena passaria a depender de o zero ter sido usado ou não. A ordem das etapas é escolha de quem resolve, e a etapa mais restrita vem primeiro.",
                    },
                    {
                        type: "quote",
                        value: "Contar em etapas é multiplicar: cada etapa entra como um fator, e o cuidado está em saber quantas opções sobram em cada uma. Etapas que acontecem em sequência se multiplicam, casos que se excluem se somam.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma lanchonete tem $4$ tipos de sanduíche e $3$ tipos de suco. Um combo é formado por um sanduíche e um suco. Quantos combos diferentes são possíveis?",
                        difficulty: "facil",
                        options: [
                            { text: "$24$", isCorrect: false },
                            { text: "$9$", isCorrect: false },
                            { text: "$12$", isCorrect: true },
                            { text: "$7$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma senha tem três dígitos escolhidos de $0$ a $9$, e os três têm de ser diferentes entre si. A ordem dos dígitos importa, porque $123$ e $321$ são senhas distintas. Quantas senhas assim existem?",
                        difficulty: "facil",
                        options: [
                            { text: "$27$", isCorrect: false },
                            { text: "$720$", isCorrect: true },
                            { text: "$1000$", isCorrect: false },
                            { text: "$999$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma placa é formada por duas letras de um alfabeto de $26$ letras, seguidas de dois dígitos de $0$ a $9$. As duas letras precisam ser diferentes entre si, e os dois dígitos podem repetir. Quantas placas diferentes existem?",
                        difficulty: "medio",
                        options: [
                            { text: "$65000$", isCorrect: true },
                            { text: "$6500$", isCorrect: false },
                            { text: "$67600$", isCorrect: false },
                            { text: "$58500$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para ir da cidade A até a cidade B existem $3$ voos e $2$ ônibus. Para ir de B até a cidade C existem $4$ voos. De quantas maneiras diferentes alguém pode ir de A até C passando por B?",
                        difficulty: "medio",
                        options: [
                            { text: "$9$", isCorrect: false },
                            { text: "$24$", isCorrect: false },
                            { text: "$14$", isCorrect: false },
                            { text: "$20$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Quantos números de três algarismos, de $100$ a $999$, têm os três algarismos distintos entre si?",
                        difficulty: "dificil",
                        options: [
                            { text: "$900$", isCorrect: false },
                            { text: "$648$", isCorrect: true },
                            { text: "$720$", isCorrect: false },
                            { text: "$504$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Fatorial e permutação",
                blocks: [
                    {
                        type: "text",
                        value: "# Fatorial e permutação\n\nTrês livros numerados, $1$, $2$ e $3$, vão para uma prateleira. As ordens possíveis são $123$, $132$, $213$, $231$, $312$ e $321$: seis ordens, e a lista acaba rápido. Agora imagine a mesma pergunta com dez livros. A lista é impossível, mas a conta é curta, e ela tem nome: fatorial.",
                    },
                    {
                        type: "text",
                        value: "## O fatorial\n\nPelo princípio multiplicativo, enfileirar $n$ objetos distintos é escolher quem fica na primeira posição ($n$ opções), depois na segunda ($n - 1$ opções, porque um objeto já saiu), e assim por diante até sobrar um. Esse produto recebe um nome e um símbolo, o **fatorial** de $n$:\n\n$$n! = n \\cdot (n-1) \\cdot (n-2) \\cdot \\dots \\cdot 2 \\cdot 1$$\n\n| $n$ | $n!$ |\n| --- | --- |\n| $0$ | $1$ |\n| $1$ | $1$ |\n| $2$ | $2$ |\n| $3$ | $6$ |\n| $4$ | $24$ |\n| $5$ | $120$ |\n| $6$ | $720$ |\n| $7$ | $5040$ |\n\nRepare na velocidade: $7!$ já passa de cinco mil. E repare na linha de cima, a convenção $0! = 1$. Ela não é capricho: existe exatamente **uma** maneira de enfileirar nada, a fila vazia, e é esse valor que faz as fórmulas das próximas aulas funcionarem sem exceção.",
                    },
                    {
                        type: "text",
                        value: "## Simplificando quocientes de fatoriais\n\nQuase nunca é preciso calcular o fatorial inteiro. O truque é abrir o maior deles até encontrar o menor e cancelar:\n\n$$\\frac{10!}{8!} = \\frac{10 \\cdot 9 \\cdot 8!}{8!} = 10 \\cdot 9 = 90$$\n\nDa mesma forma, $\\frac{(n+1)!}{n!} = n + 1$ e $\\frac{n!}{(n-2)!} = n \\cdot (n-1)$.\n\nDois erros comuns aqui. O primeiro é escrever $\\frac{10!}{8!} = \\left(\\frac{10}{8}\\right)!$, o que não existe: fatorial não se distribui em fração. O segundo é responder $2!$, como se o quociente virasse a diferença dos índices. Confira com números pequenos sempre que a dúvida aparecer: $\\frac{3!}{2!} = \\frac{6}{2} = 3$, e não $1!$.",
                    },
                    {
                        type: "text",
                        value: "## Permutação simples\n\nUma **permutação** de $n$ objetos distintos é uma ordem possível para esses objetos, usando todos eles. O número de permutações é\n\n$$P_n = n!$$\n\nExemplo: Ana, Bruno, Carla, Diogo e Elisa vão se sentar numa fileira de cinco cadeiras. São $5! = 120$ arrumações diferentes. Note que as pessoas têm nome, isto é, são distinguíveis: trocar Ana com Bruno produz uma fila diferente, e é por isso que a ordem conta.",
                    },
                    {
                        type: "text",
                        value: "## Quando há elementos repetidos\n\nUm **anagrama** é qualquer reordenação das letras de uma palavra, com ou sem sentido. Quantos anagramas tem ARARA?\n\nSão $5$ letras, logo a tentação é responder $5! = 120$. Mas as três letras A são iguais, e trocar uma A de lugar com outra A não produz palavra nova. Para enxergar o problema, finja que as letras repetidas são diferentes: $A_1$, $A_2$, $A_3$, $R_1$, $R_2$. Aí sim existem $120$ filas. Cada anagrama verdadeiro aparece nessa lista várias vezes: uma vez para cada ordem das três letras A ($3!$ ordens) combinada com cada ordem das duas letras R ($2!$ ordens), ou seja, $3! \\cdot 2! = 12$ vezes. Então\n\n$$\\frac{5!}{3! \\cdot 2!} = \\frac{120}{12} = 10$$\n\nNo geral, se entre $n$ elementos um se repete $n_1$ vezes, outro $n_2$ vezes, e assim por diante, o número de ordens distintas é\n\n$$\\frac{n!}{n_1! \\cdot n_2! \\cdot \\dots \\cdot n_r!}$$\n\nTeste a ideia num caso minúsculo: OVO tem $\\frac{3!}{2!} = 3$ anagramas (OVO, OOV, VOO), e dá para listar e confirmar.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1: a fila de seis\n\nSeis pessoas diferentes vão formar uma fila única no caixa. Quantas filas distintas podem se formar?\n\nTodas as seis entram na fila e a ordem importa, então é permutação simples de seis elementos:\n\n$$P_6 = 6! = 720$$\n\nSe a pergunta fosse sobre as três primeiras posições da fila apenas, a conta mudaria para $6 \\cdot 5 \\cdot 4 = 120$, que é o assunto da próxima aula. Use todos os elementos e você está em permutação; use parte deles e já é outra história.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2: anagramas de BANANA\n\nA palavra BANANA tem $6$ letras, sendo A três vezes, N duas vezes e B uma vez. Quantos anagramas ela tem?\n\nDivida o fatorial total pelos fatoriais das repetições:\n\n$$\\frac{6!}{3! \\cdot 2! \\cdot 1!} = \\frac{720}{6 \\cdot 2 \\cdot 1} = \\frac{720}{12} = 60$$\n\nSão $60$ anagramas. Quem responde $720$ trata as três letras A como se fossem distinguíveis e conta a mesma palavra doze vezes. Quem divide só por $3!$ e responde $120$ lembrou das letras A e esqueceu das letras N: toda letra repetida cobra a sua divisão.",
                    },
                    {
                        type: "quote",
                        value: "O fatorial $n!$ conta as ordens possíveis de $n$ objetos distintos, com $0! = 1$ por convenção, e quocientes de fatoriais se simplificam por cancelamento, sem calcular nada. Quando há elementos repetidos, divide-se pelo fatorial de cada repetição, porque trocar iguais de lugar não cria ordem nova.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o valor de $0! + 3!$?",
                        difficulty: "facil",
                        options: [
                            { text: "$7$", isCorrect: true },
                            { text: "$4$", isCorrect: false },
                            { text: "$1$", isCorrect: false },
                            { text: "$6$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Ana, Bruno, Carla e Diogo vão formar uma fila, um atrás do outro. Como são quatro pessoas diferentes, trocar duas de lugar muda a fila. Quantas filas diferentes eles podem formar?",
                        difficulty: "facil",
                        options: [
                            { text: "$12$", isCorrect: false },
                            { text: "$24$", isCorrect: true },
                            { text: "$4$", isCorrect: false },
                            { text: "$16$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Simplificando o quociente sem calcular os fatoriais por inteiro, qual é o valor de $\\frac{10!}{8!}$?",
                        difficulty: "medio",
                        options: [
                            { text: "$10$", isCorrect: false },
                            { text: "$2$", isCorrect: false },
                            { text: "$90$", isCorrect: true },
                            { text: "$45$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Quantos anagramas (reordenações das seis letras, com ou sem sentido) tem a palavra BANANA?",
                        difficulty: "medio",
                        options: [
                            { text: "$360$", isCorrect: false },
                            { text: "$720$", isCorrect: false },
                            { text: "$120$", isCorrect: false },
                            { text: "$60$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Quantos anagramas (reordenações das sete letras, com ou sem sentido) tem a palavra CASCATA?",
                        difficulty: "dificil",
                        options: [
                            { text: "$5040$", isCorrect: false },
                            { text: "$420$", isCorrect: true },
                            { text: "$2520$", isCorrect: false },
                            { text: "$840$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Arranjo e combinação: quando a ordem importa",
                blocks: [
                    {
                        type: "text",
                        value: "# Arranjo e combinação: quando a ordem importa\n\nDez atletas disputam uma prova. Duas perguntas parecidas:\n\n- de quantos modos pode ficar o pódio, com ouro, prata e bronze?\n- de quantos modos pode ser escolhida uma comissão de três atletas para conversar com a imprensa?\n\nOs dois enunciados escolhem três entre dez, e as respostas são diferentes: $720$ e $120$. A diferença está em uma coisa só, e é ela que esta aula ensina a identificar.",
                    },
                    {
                        type: "text",
                        value: "## A pergunta que decide\n\nAntes de qualquer fórmula, responda:\n\n> Trocar a ordem dos escolhidos dá um resultado diferente?\n\nNo pódio, sim: ouro para Ana e prata para Bruno não é a mesma coisa que prata para Ana e ouro para Bruno. Quando a ordem muda o resultado, o agrupamento se chama **arranjo**.\n\nNa comissão, não: o grupo formado por Ana, Bruno e Carla é a mesma comissão, não importa em que ordem os nomes foram ditos. Quando a ordem não muda o resultado, o agrupamento se chama **combinação**.\n\nUm atalho de leitura: cargo, posição, pódio, senha e número costumam indicar arranjo; comissão, equipe, grupo, dupla e conjunto costumam indicar combinação. O atalho ajuda, mas quem decide é sempre a pergunta acima.",
                    },
                    {
                        type: "text",
                        value: "## Arranjo\n\nO **arranjo** de $n$ elementos tomados $p$ a $p$ conta as sequências de $p$ elementos distintos, escolhidos entre $n$, em que a ordem importa:\n\n$$A_{n, p} = \\frac{n!}{(n-p)!}$$\n\nA fórmula é só o princípio multiplicativo escrito de forma curta. No pódio de três entre dez: $10$ opções para o ouro, $9$ para a prata, $8$ para o bronze, ou seja, $10 \\cdot 9 \\cdot 8 = 720$. E pela fórmula:\n\n$$A_{10, 3} = \\frac{10!}{7!} = 10 \\cdot 9 \\cdot 8 = 720$$",
                    },
                    {
                        type: "text",
                        value: "## Combinação\n\nA **combinação** de $n$ elementos tomados $p$ a $p$ conta os subconjuntos de $p$ elementos escolhidos entre $n$, sem ordem:\n\n$$C_{n, p} = \\frac{n!}{p! \\cdot (n-p)!}$$\n\nDe onde vem o $p!$ do denominador? Da contagem do arranjo. Na lista das $720$ sequências do pódio, a comissão formada por Ana, Bruno e Carla aparece $3! = 6$ vezes, uma para cada ordem: ABC, ACB, BAC, BCA, CAB, CBA. Como toda comissão foi contada $6$ vezes, basta dividir:\n\n$$C_{10, 3} = \\frac{A_{10, 3}}{3!} = \\frac{720}{6} = 120$$\n\nGuarde essa relação, que é mais útil que a fórmula decorada:\n\n$$C_{n, p} = \\frac{A_{n, p}}{p!}$$\n\nA combinação é o arranjo dividido pelas $p!$ ordens que não deveriam ter sido contadas.",
                    },
                    {
                        type: "text",
                        value: "## O mesmo contexto, duas perguntas\n\n| Pergunta sobre os $10$ atletas | A ordem importa? | Conta | Resultado |\n| --- | --- | --- | --- |\n| pódio com ouro, prata e bronze | sim, cada medalha é um cargo | $A_{10, 3} = \\frac{10!}{7!}$ | $720$ |\n| comissão de três, sem cargos | não, o grupo é o mesmo | $C_{10, 3} = \\frac{10!}{3! \\cdot 7!}$ | $120$ |\n\nO arranjo é sempre maior ou igual à combinação, nunca menor, porque ele conta cada grupo várias vezes. Se a sua resposta de combinação ficou maior que a de arranjo no mesmo contexto, há erro na conta.",
                    },
                    {
                        type: "text",
                        value: "## A propriedade da simetria\n\nEscolher quem entra é a mesma coisa que escolher quem fica fora. Daí sai\n\n$$C_{n, p} = C_{n,\\,n-p}$$\n\nPor exemplo, $C_{10, 7} = C_{10, 3} = 120$: escolher $7$ atletas entre $10$ equivale a escolher os $3$ que ficam de fora. Isso encurta muita conta, porque sempre dá para trabalhar com o índice menor.\n\nDois casos extremos valem a pena: $C_{n, 0} = 1$ (há uma única forma de não escolher ninguém, e é aqui que o $0! = 1$ faz falta) e $C_{n, n} = 1$ (há uma única forma de escolher todos).",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 1: os apertos de mão\n\nOito pessoas chegam a uma reunião e cada uma aperta a mão de todas as outras, exatamente uma vez. Quantos apertos de mão acontecem?\n\nUm aperto de mão envolve duas pessoas, e o aperto entre Ana e Bruno é o mesmo que entre Bruno e Ana: a ordem não importa, então é combinação.\n\n$$C_{8, 2} = \\frac{8 \\cdot 7}{2} = 28$$\n\nSão $28$ apertos. Quem responde $56$ usou $A_{8, 2} = 8 \\cdot 7$ e contou cada aperto duas vezes, uma da mão de cada pessoa.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2: duas etapas, cada uma com a sua conta\n\nUma turma tem $4$ rapazes e $3$ moças. Quantas comissões de três pessoas, sem cargos, podem ser formadas com exatamente dois rapazes e uma moça?\n\nA comissão não tem cargos, então cada escolha é combinação. E são duas escolhas em sequência, uma de rapazes e outra de moças, então elas se multiplicam:\n\n$$C_{4, 2} \\cdot C_{3, 1} = 6 \\cdot 3 = 18$$\n\nSão $18$ comissões. Dois cuidados: quem soma, $6 + 3 = 9$, trata etapas em sequência como casos alternativos; e quem calcula $C_{7, 3} = 35$ responde outra pergunta, a das comissões de três pessoas quaisquer, sem a exigência de dois rapazes e uma moça.",
                    },
                    {
                        type: "quote",
                        value: "Arranjo e combinação se separam por uma única pergunta: trocar a ordem dos escolhidos muda o resultado? Se muda, é arranjo, $A_{n, p} = \\frac{n!}{(n-p)!}$; se não muda, é combinação, $C_{n, p} = \\frac{A_{n, p}}{p!}$, e vale a simetria $C_{n, p} = C_{n,\\,n-p}$.",
                    },
                ],
                questions: [
                    {
                        statement: "Oito atletas (Ana, Bia, Caio, Duda, Elis, Fábio, Gil e Hugo) disputam uma prova. De quantos modos diferentes pode ser formado o pódio, isto é, a escolha de quem fica em primeiro, em segundo e em terceiro lugar?",
                        difficulty: "facil",
                        options: [
                            { text: "$56$", isCorrect: false },
                            { text: "$512$", isCorrect: false },
                            { text: "$336$", isCorrect: true },
                            { text: "$24$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa sala há $6$ pessoas, todas diferentes. Quantas duplas podem ser formadas, sabendo que as duas pessoas da dupla têm o mesmo papel, de modo que a dupla Ana e Bruno é a mesma que a dupla Bruno e Ana?",
                        difficulty: "facil",
                        options: [
                            { text: "$36$", isCorrect: false },
                            { text: "$12$", isCorrect: false },
                            { text: "$30$", isCorrect: false },
                            { text: "$15$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Usando a propriedade $C_{n, p} = C_{n,\\,n-p}$, qual é o valor de $C_{9, 7}$?",
                        difficulty: "medio",
                        options: [
                            { text: "$36$", isCorrect: true },
                            { text: "$72$", isCorrect: false },
                            { text: "$126$", isCorrect: false },
                            { text: "$84$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma turma tem $5$ meninos e $4$ meninas, todos com nomes diferentes. Quantas comissões de $4$ pessoas, sem cargos, podem ser formadas com exatamente $2$ meninos e $2$ meninas?",
                        difficulty: "medio",
                        options: [
                            { text: "$16$", isCorrect: false },
                            { text: "$60$", isCorrect: true },
                            { text: "$126$", isCorrect: false },
                            { text: "$240$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um campeonato tem $10$ times e é disputado em turno e returno: cada par de times joga duas vezes, uma na casa de cada um. Quantos jogos tem o campeonato?",
                        difficulty: "dificil",
                        options: [
                            { text: "$180$", isCorrect: false },
                            { text: "$90$", isCorrect: true },
                            { text: "$45$", isCorrect: false },
                            { text: "$100$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Contagem com restrição",
                blocks: [
                    {
                        type: "text",
                        value: "# Contagem com restrição\n\nCinco pessoas numa fila dão $5! = 120$ filas. Agora acrescente uma condição: Ana e Bruno querem ficar lado a lado. O total cai, e a pergunta é para quanto. Enunciado com restrição é a parte do assunto em que mais gente erra, não por falta de fórmula, mas por falta de método. Esta aula apresenta três métodos, e cada um resolve um tipo de restrição.",
                    },
                    {
                        type: "text",
                        value: "## Técnica do bloco: quando dois têm de ficar juntos\n\nSe dois elementos precisam ficar grudados, **amarre os dois num só** e conte as ordens do que sobrou. Depois multiplique pelas ordens internas do bloco, porque dentro dele ainda há escolha.\n\nExemplo com quatro pessoas, A, B, C e D, em que A e B ficam lado a lado. Trate $[AB]$ como um único elemento: sobram três elementos para enfileirar, $[AB]$, C e D, o que dá $3! = 6$ ordens. Em cada uma delas, o bloco pode ser lido como AB ou como BA, o que dobra a conta:\n\n$$3! \\cdot 2! = 6 \\cdot 2 = 12$$\n\nAs seis filas com o bloco na ordem AB são ABCD, ABDC, CABD, DABC, CDAB e DCAB; as outras seis são as mesmas com BA no lugar de AB. Listando, confirma-se o $12$.\n\nO erro clássico é parar em $3! = 6$ e esquecer as ordens internas. Amarrou o bloco, lembre-se de desamarrar no fim.",
                    },
                    {
                        type: "text",
                        value: "## Técnica do complementar: quando se pede pelo menos um ou não juntos\n\nÀs vezes é muito mais fácil contar o que **não** serve. A ideia é\n\n$$\\text{casos que servem} = \\text{total} - \\text{casos que não servem}$$\n\nAinda com as quatro pessoas A, B, C e D: em quantas filas A e B **não** ficam lado a lado? O total de filas é $4! = 24$ e já sabemos que em $12$ delas eles ficam juntos, então sobram $24 - 12 = 12$ filas.\n\nO mesmo vale para o pedido **pelo menos um**. Pelo menos uma mulher na comissão significa todas as comissões, menos as que não têm mulher nenhuma. Pelo menos um acerto significa todos os casos, menos os de nenhum acerto. A frase pelo menos é o sinal de que o complementar vai ser mais curto, porque contar diretamente obrigaria a somar os casos de exatamente uma, exatamente duas, e assim por diante.",
                    },
                    {
                        type: "text",
                        value: "## Divisão em casos: quando a restrição depende de uma escolha anterior\n\nQuando o número de opções de uma etapa muda conforme o que foi escolhido antes, o princípio multiplicativo puro não serve. A saída é separar em casos que não se misturam, contar cada um e somar no fim.\n\nQuantos números de três algarismos distintos são pares? O algarismo da unidade tem de ser $0$, $2$, $4$, $6$ ou $8$, e o da centena não pode ser zero. Essas duas exigências brigam entre si, então separe:\n\n- **caso 1**, a unidade é $0$: a centena tem $9$ opções (de $1$ a $9$) e a dezena tem $8$, dando $9 \\cdot 8 = 72$ números;\n- **caso 2**, a unidade é $2$, $4$, $6$ ou $8$: são $4$ opções para a unidade, $8$ para a centena (fora o zero e fora o algarismo da unidade) e $8$ para a dezena, dando $4 \\cdot 8 \\cdot 8 = 256$ números.\n\n$$72 + 256 = 328$$\n\nQuem tenta resolver de uma vez e escreve $5 \\cdot 8 \\cdot 8 = 320$ trata os cinco valores de unidade como equivalentes, mas o caso da unidade zero libera uma opção a mais na centena. Casos diferentes, contas diferentes.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: o bloco em uma fila maior\n\nSeis amigos, entre eles Ana e Bruno, vão formar uma fila. Em quantas filas Ana e Bruno aparecem lado a lado?\n\nAmarre o par: sobram cinco elementos para enfileirar, o bloco e os outros quatro amigos, o que dá $5! = 120$ ordens. Multiplique pelas $2!$ ordens internas:\n\n$$5! \\cdot 2! = 120 \\cdot 2 = 240$$\n\nSão $240$ filas. Como o total é $6! = 720$, em $720 - 240 = 480$ filas eles ficam separados. Vale conferir pelo complementar, que fecha a conta: as $240$ filas com os dois juntos mais as $480$ filas com os dois separados dão exatamente as $720$ filas possíveis.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: o complementar em uma comissão\n\nUm grupo tem $4$ homens e $3$ mulheres. Quantas comissões de três pessoas, sem cargos, têm **pelo menos uma mulher**?\n\nO caminho curto é o complementar. Todas as comissões possíveis são $C_{7, 3} = 35$. As que não servem são as formadas só por homens, $C_{4, 3} = 4$. Então\n\n$$35 - 4 = 31$$\n\nSão $31$ comissões. O caminho longo chega ao mesmo lugar e mostra por que o complementar vale a pena: comissões com exatamente uma mulher, $C_{3, 1} \\cdot C_{4, 2} = 3 \\cdot 6 = 18$; com exatamente duas, $C_{3, 2} \\cdot C_{4, 1} = 3 \\cdot 4 = 12$; com três, $C_{3, 3} = 1$. Somando, $18 + 12 + 1 = 31$. Três contas em vez de uma subtração.",
                    },
                    {
                        type: "text",
                        value: "## O erro de contar duas vezes o mesmo agrupamento\n\nQuando os casos se sobrepõem, somar sem pensar conta alguém duas vezes.\n\nQuantas senhas de três letras distintas, escolhidas entre A, B, C, D e E, começam por vogal **ou** terminam por vogal? As vogais disponíveis são A e E.\n\n- começam por vogal: $2 \\cdot 4 \\cdot 3 = 24$;\n- terminam por vogal: $2 \\cdot 4 \\cdot 3 = 24$.\n\nA soma ingênua dá $48$, e está errada: as senhas que começam **e** terminam por vogal, como AEB ou ECA, entraram nas duas listas. Essas são $2 \\cdot 1 \\cdot 3 = 6$ (uma vogal no começo, a outra no fim, qualquer das três consoantes no meio). Descontando a repetição:\n\n$$24 + 24 - 6 = 42$$\n\nA regra geral: só se somam casos que **não se cruzam**. Se eles se cruzam, subtraia a interseção, ou redivida o problema em casos realmente separados.",
                    },
                    {
                        type: "quote",
                        value: "Restrição se resolve com método: amarre os elementos que têm de ficar juntos num bloco e multiplique pelas ordens internas; conte pelo complementar quando o enunciado pede pelo menos um ou não juntos; e divida em casos quando o número de opções de uma etapa depende da escolha anterior, somando apenas casos que não se cruzam.",
                    },
                ],
                questions: [
                    {
                        statement: "Ana, Bruno, Carla, Diogo e Elisa vão formar uma fila, um atrás do outro. De quantos modos diferentes eles podem se posicionar se Ana e Bruno ficarem lado a lado?",
                        difficulty: "facil",
                        options: [
                            { text: "$48$", isCorrect: true },
                            { text: "$72$", isCorrect: false },
                            { text: "$120$", isCorrect: false },
                            { text: "$24$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com as mesmas cinco pessoas (Ana, Bruno, Carla, Diogo e Elisa) em fila, de quantos modos diferentes elas podem se posicionar se Ana e Bruno não ficarem lado a lado?",
                        difficulty: "facil",
                        options: [
                            { text: "$48$", isCorrect: false },
                            { text: "$72$", isCorrect: true },
                            { text: "$120$", isCorrect: false },
                            { text: "$96$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Quantos números de três algarismos distintos, todos escolhidos entre os dígitos $1$, $2$, $3$, $4$ e $5$, são pares?",
                        difficulty: "medio",
                        options: [
                            { text: "$24$", isCorrect: true },
                            { text: "$60$", isCorrect: false },
                            { text: "$30$", isCorrect: false },
                            { text: "$32$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um grupo tem $7$ pessoas, entre elas Ana. Quantas comissões de $3$ pessoas, sem cargos, podem ser formadas incluindo obrigatoriamente Ana?",
                        difficulty: "medio",
                        options: [
                            { text: "$20$", isCorrect: false },
                            { text: "$15$", isCorrect: true },
                            { text: "$35$", isCorrect: false },
                            { text: "$21$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma empresa tem $5$ homens e $4$ mulheres, todos com nomes diferentes. Quantas comissões de $3$ pessoas, sem cargos, podem ser formadas com pelo menos uma mulher?",
                        difficulty: "dificil",
                        options: [
                            { text: "$74$", isCorrect: true },
                            { text: "$112$", isCorrect: false },
                            { text: "$40$", isCorrect: false },
                            { text: "$84$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Triângulo de Pascal e binômio de Newton",
                blocks: [
                    {
                        type: "text",
                        value: "# Triângulo de Pascal e binômio de Newton\n\nDesenvolver $(a + b)^2$ é rotina. Desenvolver $(a + b)^3$ dá trabalho. Desenvolver $(a + b)^7$ na mão, multiplicando parêntese por parêntese, é meia folha de conta e um erro de sinal esperando acontecer. Acontece que os coeficientes desse desenvolvimento são exatamente as combinações que acabamos de estudar, e eles se organizam num triângulo que se monta somando vizinhos. Com ele, a potência sai direto.",
                    },
                    {
                        type: "text",
                        value: "## Números binomiais\n\nO **número binomial** é outra notação para a combinação:\n\n$$\\binom{n}{p} = C_{n, p} = \\frac{n!}{p! \\cdot (n-p)!}$$\n\nLê-se $n$ escolhe $p$. O de cima, $n$, é o numerador, e o de baixo, $p$, é a classe. Por exemplo,\n\n$$\\binom{5}{2} = \\frac{5 \\cdot 4}{2} = 10$$\n\nValem os mesmos casos extremos de antes: $\\binom{n}{0} = 1$, $\\binom{n}{n} = 1$ e $\\binom{n}{1} = n$. E vale a simetria $\\binom{n}{p} = \\binom{n}{n-p}$, que agora vai aparecer desenhada.",
                    },
                    {
                        type: "text",
                        value: "## O triângulo de Pascal\n\nOrganize os números binomiais em linhas, a linha $n$ contendo $\\binom{n}{0}, \\binom{n}{1}, \\dots, \\binom{n}{n}$:\n\n| Linha | Elementos |\n| --- | --- |\n| $n = 0$ | $1$ |\n| $n = 1$ | $1 \\quad 1$ |\n| $n = 2$ | $1 \\quad 2 \\quad 1$ |\n| $n = 3$ | $1 \\quad 3 \\quad 3 \\quad 1$ |\n| $n = 4$ | $1 \\quad 4 \\quad 6 \\quad 4 \\quad 1$ |\n| $n = 5$ | $1 \\quad 5 \\quad 10 \\quad 10 \\quad 5 \\quad 1$ |\n| $n = 6$ | $1 \\quad 6 \\quad 15 \\quad 20 \\quad 15 \\quad 6 \\quad 1$ |\n\nDuas coisas saltam aos olhos. A primeira é a **simetria**: cada linha lida de trás para frente é igual a si mesma, o que é $\\binom{n}{p} = \\binom{n}{n-p}$ em forma de desenho.\n\nA segunda é como a linha de baixo nasce da de cima: cada número é a **soma dos dois vizinhos imediatamente acima**. Na linha $5$, o $10$ é $4 + 6$. Essa é a **relação de Stifel**:\n\n$$\\binom{n}{p} = \\binom{n-1}{p-1} + \\binom{n-1}{p}$$\n\nCom ela, montar o triângulo até a linha que você precisa é só somar, sem calcular fatorial nenhum.",
                    },
                    {
                        type: "text",
                        value: "## O binômio de Newton\n\nO **binômio de Newton** é a fórmula do desenvolvimento de uma potência de soma:\n\n$$(a + b)^n = \\binom{n}{0} a^n + \\binom{n}{1} a^{n-1} b + \\binom{n}{2} a^{n-2} b^2 + \\dots + \\binom{n}{n} b^n$$\n\nOs expoentes se comportam de um jeito fácil de lembrar: o de $a$ cai de $n$ até $0$, o de $b$ sobe de $0$ até $n$, e a soma dos dois é sempre $n$. Os coeficientes são a linha $n$ do triângulo.\n\nVale conferir contra a conta feita à mão, para $n = 3$. Multiplicando passo a passo:\n\n$$(a+b)^2 = a^2 + 2ab + b^2$$\n\n$$(a^2 + 2ab + b^2)(a + b) = a^3 + a^2 b + 2a^2 b + 2ab^2 + ab^2 + b^3$$\n\nJuntando os termos semelhantes, $a^3 + 3a^2 b + 3ab^2 + b^3$, cujos coeficientes são $1$, $3$, $3$, $1$, exatamente a linha $n = 3$ do triângulo. A fórmula não inventa nada: ela só poupa a multiplicação.",
                    },
                    {
                        type: "text",
                        value: "## O termo geral\n\nQuando a questão pede **um** termo, desenvolver tudo é desperdício. O termo de ordem $k+1$ do desenvolvimento de $(a + b)^n$, nas potências decrescentes de $a$, é\n\n$$T_{k+1} = \\binom{n}{k} a^{\\,n-k} b^{\\,k}$$\n\ncom $k$ variando de $0$ a $n$. Repare no índice: o primeiro termo tem $k = 0$, o segundo tem $k = 1$, e o **quarto termo tem $k = 3$**. Essa defasagem de um é a armadilha mais cobrada do assunto: quem quer o quarto termo e usa $k = 4$ entrega o quinto.\n\nExemplo: qual é o terceiro termo de $(x + 3)^5$? Terceiro termo significa $k = 2$:\n\n$$T_3 = \\binom{5}{2} x^{3} \\cdot 3^{2} = 10 \\cdot 9 \\cdot x^3 = 90x^3$$",
                    },
                    {
                        type: "text",
                        value: "## Quando o segundo termo é negativo ou tem coeficiente\n\nA fórmula não muda, desde que $a$ e $b$ sejam identificados com cuidado, sinal e coeficiente incluídos.\n\nEm $(2x - 1)^5$, tome $a = 2x$ e $b = -1$. Qual é o coeficiente de $x^2$? A potência de $x$ vem só de $a^{\\,n-k} = (2x)^{5-k}$, então $5 - k = 2$, ou seja, $k = 3$:\n\n$$T_4 = \\binom{5}{3} (2x)^2 (-1)^3 = 10 \\cdot 4x^2 \\cdot (-1) = -40x^2$$\n\nO coeficiente é $-40$. Dois cuidados que valem a questão inteira:\n\n- o coeficiente de $a$ também é elevado: $(2x)^2 = 4x^2$, e não $2x^2$;\n- a potência de $b$ carrega o sinal, e $(-1)^k$ é negativo para $k$ ímpar e positivo para $k$ par. É por isso que, com $b$ negativo, os sinais do desenvolvimento alternam: $(2x-1)^5 = 32x^5 - 80x^4 + 80x^3 - 40x^2 + 10x - 1$.",
                    },
                    {
                        type: "text",
                        value: "## A soma de uma linha\n\nQuanto dá somar todos os números binomiais de uma linha? Basta tomar $a = b = 1$ no binômio de Newton, porque aí todas as potências valem $1$ e só sobram os coeficientes:\n\n$$\\binom{n}{0} + \\binom{n}{1} + \\dots + \\binom{n}{n} = (1 + 1)^n = 2^n$$\n\nConfira na linha $4$: $1 + 4 + 6 + 4 + 1 = 16 = 2^4$. E na linha $5$: $1 + 5 + 10 + 10 + 5 + 1 = 32 = 2^5$.\n\nEsse resultado tem leitura de contagem: escolher um subconjunto de um conjunto de $n$ elementos é escolher nenhum, ou um, ou dois, e assim por diante, o que soma a linha inteira; por outro lado, cada elemento entra ou não entra, o que dá $2^n$. Duas contagens do mesmo fato.\n\nUm aviso para não confundir: a soma $2^n$ é a dos **números binomiais**. Se o binômio tiver outros termos, os coeficientes carregam as potências deles. Em $(x+2)^5 = x^5 + 10x^4 + 40x^3 + 80x^2 + 80x + 32$, a soma dos coeficientes é $243$, que é $(1+2)^5$, e não $2^5$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido: achar um termo sem desenvolver\n\nQual é o termo em $x^3$ no desenvolvimento de $(x + 2)^5$?\n\nTome $a = x$ e $b = 2$. A potência de $x$ é $a^{\\,5-k}$, então $5 - k = 3$ e $k = 2$:\n\n$$T_3 = \\binom{5}{2} x^3 \\cdot 2^2 = 10 \\cdot 4 \\cdot x^3 = 40x^3$$\n\nO desenvolvimento completo, só para conferir, é $x^5 + 10x^4 + 40x^3 + 80x^2 + 80x + 32$, e o termo em $x^3$ está lá. Note que o trabalho foi uma combinação e uma potência, contra cinco multiplicações de parênteses. Dois erros rondam esse tipo de item: esquecer de elevar o $2$, respondendo $10x^3$, e errar o índice, trocando $k = 2$ por $k = 3$ e entregando $80x^2$, que é o termo seguinte.",
                    },
                    {
                        type: "quote",
                        value: "Os números binomiais $\\binom{n}{p}$ são as combinações, e arrumados em linhas formam o triângulo de Pascal, em que cada elemento é a soma dos dois vizinhos de cima. Eles são os coeficientes de $(a+b)^n$, o termo de ordem $k+1$ é $\\binom{n}{k} a^{\\,n-k} b^{\\,k}$, e a soma de uma linha vale $2^n$.",
                    },
                ],
                questions: [
                    {
                        statement: "Pela relação de Stifel, $\\binom{8}{3} = \\binom{7}{2} + \\binom{7}{3}$. Sabendo que $\\binom{7}{2} = 21$ e $\\binom{7}{3} = 35$, qual é o valor de $\\binom{8}{3}$?",
                        difficulty: "facil",
                        options: [
                            { text: "$56$", isCorrect: true },
                            { text: "$735$", isCorrect: false },
                            { text: "$14$", isCorrect: false },
                            { text: "$28$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o desenvolvimento completo de $(x + 2)^3$?",
                        difficulty: "facil",
                        options: [
                            { text: "$x^3 + 8$", isCorrect: false },
                            { text: "$x^3 + 12x^2 + 6x + 8$", isCorrect: false },
                            { text: "$x^3 + 2x^2 + 4x + 8$", isCorrect: false },
                            { text: "$x^3 + 6x^2 + 12x + 8$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A linha $n = 7$ do triângulo de Pascal é $1$, $7$, $21$, $35$, $35$, $21$, $7$, $1$. Qual é a soma de todos os elementos dessa linha?",
                        difficulty: "medio",
                        options: [
                            { text: "$128$", isCorrect: true },
                            { text: "$49$", isCorrect: false },
                            { text: "$256$", isCorrect: false },
                            { text: "$64$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No desenvolvimento de $(x - 3)^4$, qual é o coeficiente de $x^2$?",
                        difficulty: "medio",
                        options: [
                            { text: "$54$", isCorrect: true },
                            { text: "$-108$", isCorrect: false },
                            { text: "$-54$", isCorrect: false },
                            { text: "$-12$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No desenvolvimento de $(x + 2)^6$, escrito em potências decrescentes de $x$, qual é o quarto termo?",
                        difficulty: "dificil",
                        options: [
                            { text: "$240x^2$", isCorrect: false },
                            { text: "$160x^3$", isCorrect: true },
                            { text: "$20x^3$", isCorrect: false },
                            { text: "$60x^4$", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Números complexos",
        aulas: [
            {
                titulo: "A unidade imaginária e a forma algébrica",
                blocks: [
                    {
                        type: "text",
                        value: "# A unidade imaginária e a forma algébrica\n\nResolva em $\\mathbb{R}$ a equação $x^2 + 1 = 0$. Você passa o $1$ para o outro lado e chega a $x^2 = -1$. Agora pare e pense: existe número real que, elevado ao quadrado, dê resultado negativo? Não existe. O quadrado de um positivo é positivo, o quadrado de um negativo também é positivo, e o quadrado de zero é zero. Em $\\mathbb{R}$ a resposta é $S = \\emptyset$.\n\nIsso incomodou os matemáticos por séculos, e não por capricho. Uma equação do segundo grau deveria ter duas raízes, uma do terceiro grau deveria ter três, e assim por diante. Só que, quando o discriminante é negativo, a equação não entrega raiz nenhuma, e a álgebra fica cheia de buracos. A saída foi inventar um número novo, exatamente como quem inventou o $-1$ para dar conta de $x + 5 = 2$ e o $\\frac{1}{2}$ para dar conta de $2x = 1$.",
                    },
                    {
                        type: "text",
                        value: "## A unidade imaginária\n\nA **unidade imaginária** é o número, indicado pela letra $i$, cujo quadrado vale $-1$:\n\n$$i^2 = -1$$\n\nEssa é a definição inteira, e vale a pena guardá-la assim, pela igualdade do quadrado. Dela sai a leitura usual $i = \\sqrt{-1}$, mas a forma que você vai usar na conta, dezenas de vezes, é a de cima: sempre que $i^2$ aparecer num cálculo, troque por $-1$.\n\nCom o $i$ em mãos, a equação $x^2 + 1 = 0$ ganha raiz. Testando $x = i$:\n\n$$i^2 + 1 = -1 + 1 = 0$$\n\nE testando $x = -i$, lembrando que $(-i)^2 = (-1)^2 \\cdot i^2 = 1 \\cdot (-1) = -1$:\n\n$$(-i)^2 + 1 = -1 + 1 = 0$$\n\nSão duas raízes, como se esperava de uma equação do segundo grau. O conjunto solução é $S = \\{i,\\ -i\\}$.",
                    },
                    {
                        type: "text",
                        value: "## A forma algébrica\n\nUm **número complexo** é todo número que se escreve na forma\n\n$$z = a + bi$$\n\ncom $a$ e $b$ reais. Essa escrita é a **forma algébrica**, e o conjunto de todos esses números é indicado por $\\mathbb{C}$.\n\nDentro dela, $a$ é a **parte real** de $z$ e $b$ é a **parte imaginária** de $z$. As notações são $\\mathrm{Re}(z) = a$ e $\\mathrm{Im}(z) = b$.\n\nRepare bem na parte imaginária, porque aqui mora o erro mais comum do assunto: a parte imaginária de $z = 3 + 5i$ é $5$, e não $5i$. Ela é um número **real**, o coeficiente que acompanha o $i$. Quem responde $5i$ não está errando a conta, está errando a definição, e isso custa questão em prova.\n\n| Número | Parte real | Parte imaginária |\n| --- | --- | --- |\n| $3 + 5i$ | $3$ | $5$ |\n| $-2 + i$ | $-2$ | $1$ |\n| $7 - 4i$ | $7$ | $-4$ |\n| $6i$ | $0$ | $6$ |\n| $-8$ | $-8$ | $0$ |\n\nNa segunda linha, note que a parte imaginária de $-2 + i$ é $1$, porque $i$ é o mesmo que $1 \\cdot i$.",
                    },
                    {
                        type: "text",
                        value: "## Quando o complexo é real e quando é imaginário puro\n\nAs duas últimas linhas da tabela merecem nome próprio.\n\nQuando $b = 0$, sobra $z = a$, que é um número real de sempre. Ou seja, **todo número real também é um número complexo**, com parte imaginária zero: $\\mathbb{R}$ está contido em $\\mathbb{C}$, o que se escreve $\\mathbb{R} \\subset \\mathbb{C}$. O número $-8$ é real e, ao mesmo tempo, complexo.\n\nQuando $a = 0$ e $b \\neq 0$, sobra $z = bi$, e esse complexo é chamado de **imaginário puro**. O número $6i$ é imaginário puro. O $3 + 5i$ não é, porque tem parte real; e o $0$ também não é, porque sua parte imaginária é zero.\n\nGuarde as duas condições, e principalmente a exigência $b \\neq 0$ do imaginário puro, que é a que mais escapa. Sem ela, o próprio zero entraria na lista, e zero é um número real.",
                    },
                    {
                        type: "text",
                        value: "## Raiz quadrada de número negativo\n\nCom $i^2 = -1$, a raiz quadrada de número negativo passa a ter sentido. O caminho é separar o sinal:\n\n$$\\sqrt{-4} = \\sqrt{4 \\cdot (-1)} = \\sqrt{4} \\cdot \\sqrt{-1} = 2i$$\n\nDo mesmo jeito, $\\sqrt{-9} = 3i$, $\\sqrt{-25} = 5i$ e $\\sqrt{-2} = i\\sqrt{2}$.\n\n**Exemplo resolvido 1.** Resolver $x^2 + 4 = 0$ em $\\mathbb{C}$.\n\nIsolando o $x^2$, vem $x^2 = -4$, e daí $x = \\pm 2i$. Conferindo as duas raízes no enunciado original: $(2i)^2 + 4 = 4i^2 + 4 = -4 + 4 = 0$, e também $(-2i)^2 + 4 = 4i^2 + 4 = 0$. Logo $S = \\{2i,\\ -2i\\}$.\n\nDois tropeços aparecem aqui. Um é passar o $4$ para o outro lado sem trocar o sinal, resolver $x^2 = 4$ e responder $\\pm 2$. O outro é parar em $x^2 = -4$ e dizer que não há solução, o que seria correto em $\\mathbb{R}$ e não é o que a questão pede. Por isso o universo tem de estar dito: resolver em $\\mathbb{R}$ e resolver em $\\mathbb{C}$ são perguntas diferentes.",
                    },
                    {
                        type: "text",
                        value: "## A equação do segundo grau com discriminante negativo\n\nAquela equação que você aprendeu a abandonar quando $\\Delta < 0$ agora tem resposta. A fórmula é a mesma; o que muda é que a raiz do discriminante negativo sai com $i$.\n\n**Exemplo resolvido 2.** Resolver $x^2 - 6x + 13 = 0$ em $\\mathbb{C}$.\n\nO discriminante é $\\Delta = (-6)^2 - 4 \\cdot 1 \\cdot 13 = 36 - 52 = -16$. Em $\\mathbb{R}$ a conversa terminaria aqui. Em $\\mathbb{C}$, $\\sqrt{-16} = 4i$, e a fórmula segue:\n\n$$x = \\frac{6 \\pm 4i}{2} = 3 \\pm 2i$$\n\nAtenção ao dividir: o $2$ do denominador divide os **dois** termos, a parte real e a parte imaginária. Quem divide só o $6$ chega a $3 \\pm 4i$, que não é raiz. Conferindo $x = 3 + 2i$ no enunciado original, com $(3 + 2i)^2 = 9 + 12i + 4i^2 = 5 + 12i$:\n\n$$(5 + 12i) - 6(3 + 2i) + 13 = 5 + 12i - 18 - 12i + 13 = 0$$\n\nAs duas raízes, $3 + 2i$ e $3 - 2i$, têm a mesma parte real e partes imaginárias opostas. Isso vale sempre: **as raízes não reais de um polinômio de coeficientes reais aparecem em pares** desse tipo, nunca sozinhas. É por isso que uma equação de coeficientes reais não pode ter exatamente uma raiz não real.",
                    },
                    {
                        type: "text",
                        value: "## Igualdade de complexos\n\nDois números complexos são iguais quando a parte real de um é igual à parte real do outro e, ao mesmo tempo, a parte imaginária de um é igual à parte imaginária do outro:\n\n$$a + bi = c + di \\quad \\text{se e somente se} \\quad a = c \\ \\text{e} \\ b = d$$\n\nParece óbvio, e é exatamente por ser óbvio que funciona tão bem: uma igualdade de complexos vale por **duas** equações reais, e é assim que se descobrem incógnitas escondidas.\n\n**Exemplo.** Determinar os números reais $x$ e $y$ tais que $(x + 2) + (y - 3)i = 5 - i$.\n\nComparando as partes reais: $x + 2 = 5$, logo $x = 3$. Comparando as partes imaginárias: $y - 3 = -1$, logo $y = 2$. Conferindo na igualdade original: $(3 + 2) + (2 - 3)i = 5 - i$, que é o lado direito.\n\nO detalhe que derruba gente é a leitura do lado direito: a parte imaginária de $5 - i$ é $-1$, e não $-i$ nem $1$. É o coeficiente, com o sinal dele.",
                    },
                    {
                        type: "quote",
                        value: "O número $i$, definido por $i^2 = -1$, completa a álgebra: toda equação do segundo grau passa a ter raiz, inclusive quando $\\Delta < 0$. Todo complexo se escreve como $z = a + bi$, em que a parte imaginária é o número real $b$ e não $bi$, e dois complexos só são iguais quando as duas partes coincidem.",
                    },
                ],
                questions: [
                    {
                        statement: "Considere o número complexo $z = -3 + 5i$. Qual é a parte imaginária de $z$, escrita como número real?",
                        difficulty: "facil",
                        options: [
                            { text: "$-5$", isCorrect: false },
                            { text: "$5i$", isCorrect: false },
                            { text: "$-3$", isCorrect: false },
                            { text: "$5$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual é o conjunto solução da equação $x^2 + 4 = 0$ em $\\mathbb{C}$?",
                        difficulty: "facil",
                        options: [
                            { text: "$S = \\emptyset$", isCorrect: false },
                            { text: "$S = \\{4i,\\ -4i\\}$", isCorrect: false },
                            { text: "$S = \\{2,\\ -2\\}$", isCorrect: false },
                            { text: "$S = \\{2i,\\ -2i\\}$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Resolvendo a equação $x^2 - 6x + 13 = 0$ em $\\mathbb{C}$, quais são as duas raízes na forma algébrica $a + bi$?",
                        difficulty: "medio",
                        options: [
                            { text: "$6 + 2i$ e $6 - 2i$", isCorrect: false },
                            { text: "$3 + 2i$ e $3 - 2i$", isCorrect: true },
                            { text: "$3 + 4i$ e $3 - 4i$", isCorrect: false },
                            { text: "$-3 + 2i$ e $-3 - 2i$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para quais números reais $x$ e $y$ vale a igualdade $(2x - 1) + (y + 4)i = 7 - 3i$?",
                        difficulty: "medio",
                        options: [
                            { text: "$x = 4$ e $y = 1$", isCorrect: false },
                            { text: "$x = 4$ e $y = -7$", isCorrect: true },
                            { text: "$x = 8$ e $y = -7$", isCorrect: false },
                            { text: "$x = 4$ e $y = -3$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para que valores reais de $k$ o número complexo $z = (k^2 - 9) + (k + 3)i$ é imaginário puro? Dê todos os valores de $k$ que servem.",
                        difficulty: "dificil",
                        options: [
                            { text: "apenas $k = 3$", isCorrect: true },
                            { text: "apenas $k = -3$", isCorrect: false },
                            { text: "$k = 3$ ou $k = -3$", isCorrect: false },
                            { text: "nenhum valor real de $k$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Operações e as potências de $i$",
                blocks: [
                    {
                        type: "text",
                        value: "# Operações e as potências de $i$\n\nUm número novo só serve para algo se der para calcular com ele. Na aula passada apareceu $3 + 2i$ como raiz de uma equação, e conferir essa raiz exigiu elevar ao quadrado e multiplicar por $6$. Essas contas saíram de algum lugar, e é desse lugar que a aula trata.\n\nA boa notícia é que não há regra nova para memorizar. Você trata o $i$ como se fosse uma letra qualquer, aplica a distributiva de sempre e, no fim, troca todo $i^2$ que apareceu por $-1$. É isso.",
                    },
                    {
                        type: "text",
                        value: "## Soma e subtração: parte com parte\n\nSomar dois complexos é somar as partes reais entre si e as partes imaginárias entre si:\n\n$$(a + bi) + (c + di) = (a + c) + (b + d)i$$\n\nÉ o mesmo que juntar termos semelhantes numa expressão algébrica: $3$ e $2$ são semelhantes, $5i$ e $-8i$ são semelhantes, e $3$ com $5i$ não são.\n\n$$(3 + 5i) + (2 - 8i) = (3 + 2) + (5 - 8)i = 5 - 3i$$\n\nNa subtração, o cuidado é o de sempre: o sinal de menos atinge os dois termos do segundo parêntese.\n\n$$(4 - i) - (6 + 3i) = 4 - i - 6 - 3i = -2 - 4i$$\n\nQuem esquece de distribuir o menos chega a $-2 + 2i$, porque trocou o sinal só do primeiro termo. O resultado da soma e da subtração sempre volta na forma $a + bi$, com $a$ e $b$ reais.",
                    },
                    {
                        type: "text",
                        value: "## Multiplicação: distributiva e a troca de $i^2$\n\nNa multiplicação, aplique a distributiva (cada termo do primeiro parêntese por cada termo do segundo) e só então troque $i^2$ por $-1$.\n\n**Exemplo resolvido 1.** Calcular $(2 + 3i)(4 - 5i)$.\n\n$$(2 + 3i)(4 - 5i) = 8 - 10i + 12i - 15i^2$$\n\nAgora vem o passo que define o assunto: $-15i^2 = -15 \\cdot (-1) = +15$. Juntando as partes:\n\n$$8 + 15 + (-10 + 12)i = 23 + 2i$$\n\nDois erros moram aqui. O primeiro é multiplicar parte por parte, como se fosse soma, e escrever $8 - 15i$. O segundo é fazer a distributiva certa e esquecer a troca, deixando $-15i^2$ como $-15$, o que leva a $-7 + 2i$. Perceba o tamanho do estrago: a parte real pula de $-7$ para $23$ por causa de um sinal.",
                    },
                    {
                        type: "text",
                        value: "## O quadrado de um binômio complexo\n\nO produto notável continua valendo, com $bi$ no lugar do segundo termo:\n\n$$(a + bi)^2 = a^2 + 2abi + b^2i^2 = (a^2 - b^2) + 2abi$$\n\nVale a pena ler o resultado com calma: no quadrado de um complexo, a parte real é $a^2 - b^2$, com **menos**, porque o $b^2i^2$ virou $-b^2$.\n\n**Exemplo resolvido 2.** Calcular $(3 + 2i)^2$.\n\n$$(3 + 2i)^2 = 9 + 12i + 4i^2 = 9 - 4 + 12i = 5 + 12i$$\n\nEra essa a conta usada na aula passada para conferir a raiz $3 + 2i$. E note o distrator clássico: quem troca $(a + bi)^2$ por $a^2 + b^2i^2$, esquecendo o termo do meio, chega a $5$ e perde o $12i$ inteiro.",
                    },
                    {
                        type: "text",
                        value: "## As potências de $i$ e o ciclo de quatro\n\nComece pelas primeiras potências e veja o que acontece:\n\n$$i^0 = 1 \\qquad i^1 = i \\qquad i^2 = -1 \\qquad i^3 = i^2 \\cdot i = -i$$\n\nE a quarta fecha o ciclo:\n\n$$i^4 = i^2 \\cdot i^2 = (-1)(-1) = 1$$\n\nChegamos de volta ao $1$, que era o ponto de partida. Daí em diante tudo se repete de quatro em quatro: $i^5 = i$, $i^6 = -1$, $i^7 = -i$, $i^8 = 1$, e assim por diante. São só **quatro** valores possíveis para uma potência de $i$ com expoente natural.\n\n| Resto da divisão do expoente por $4$ | $0$ | $1$ | $2$ | $3$ |\n| --- | --- | --- | --- | --- |\n| Valor da potência | $1$ | $i$ | $-1$ | $-i$ |",
                    },
                    {
                        type: "text",
                        value: "## A regra prática: divida o expoente por quatro\n\nComo o ciclo tem tamanho quatro, só o **resto** da divisão do expoente por $4$ importa. Divida, olhe o resto e leia a tabela.\n\n**Exemplo.** Calcular $i^{2026}$.\n\nDividindo $2026$ por $4$: como $4 \\cdot 506 = 2024$, o quociente é $506$ e o resto é $2$. Resto $2$ significa $i^{2026} = i^2 = -1$.\n\n**Exemplo.** Calcular $i^{35} + i^{18}$.\n\nPara o $35$: $4 \\cdot 8 = 32$, resto $3$, então $i^{35} = -i$. Para o $18$: $4 \\cdot 4 = 16$, resto $2$, então $i^{18} = -1$. Somando os dois, $i^{35} + i^{18} = -1 - i$.\n\nUm atalho de bolso: para dividir por $4$, basta olhar os **dois últimos algarismos** do expoente. Em $2026$, olhe o $26$, que deixa resto $2$. Num expoente terminado em $00$, o resto é $0$ e a potência vale $1$. E o erro a evitar numa soma de potências é mexer nos expoentes: $i^{35} + i^{18}$ não é $i^{53}$, porque soma de potências não soma expoentes.",
                    },
                    {
                        type: "text",
                        value: "## O erro de multiplicar duas raízes negativas\n\nOlhe esta conta, que parece inofensiva:\n\n$$\\sqrt{-4} \\cdot \\sqrt{-9} = \\sqrt{(-4)(-9)} = \\sqrt{36} = 6$$\n\nEla está errada, e o resultado certo tem o sinal trocado. Faça do jeito correto, convertendo cada raiz **antes** de multiplicar:\n\n$$\\sqrt{-4} \\cdot \\sqrt{-9} = 2i \\cdot 3i = 6i^2 = -6$$\n\nO que falhou foi a propriedade $\\sqrt{x} \\cdot \\sqrt{y} = \\sqrt{xy}$, que só vale quando $x \\ge 0$ e $y \\ge 0$. Com radicando negativo ela deixa de valer, e usá-la mesmo assim produz um sinal errado.\n\nA regra prática é curta e resolve: **troque toda raiz de número negativo por $i$ primeiro**, e só depois multiplique. Assim nenhuma propriedade é usada fora do lugar dela.",
                    },
                    {
                        type: "quote",
                        value: "Soma de complexos é parte com parte, e multiplicação é a distributiva de sempre com a troca de $i^2$ por $-1$ no fim. As potências de $i$ repetem $1$, $i$, $-1$ e $-i$ de quatro em quatro, então o resto da divisão do expoente por $4$ já entrega a resposta.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o resultado de $(5 - 2i) + (-3 + 7i)$ na forma algébrica $a + bi$?",
                        difficulty: "facil",
                        options: [
                            { text: "$2 + 5i$", isCorrect: true },
                            { text: "$2 + 9i$", isCorrect: false },
                            { text: "$2 - 5i$", isCorrect: false },
                            { text: "$8 + 5i$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor da potência $i^{30}$ na forma algébrica?",
                        difficulty: "facil",
                        options: [
                            { text: "$i$", isCorrect: false },
                            { text: "$1$", isCorrect: false },
                            { text: "$-i$", isCorrect: false },
                            { text: "$-1$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Efetuando o produto $(2 + 3i)(4 - 5i)$, qual é o resultado na forma algébrica $a + bi$?",
                        difficulty: "medio",
                        options: [
                            { text: "$23 + 2i$", isCorrect: true },
                            { text: "$8 - 15i$", isCorrect: false },
                            { text: "$23 - 2i$", isCorrect: false },
                            { text: "$-7 + 2i$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o resultado de $(1 - 3i)^2$ na forma algébrica $a + bi$?",
                        difficulty: "medio",
                        options: [
                            { text: "$-8$", isCorrect: false },
                            { text: "$10 - 6i$", isCorrect: false },
                            { text: "$-8 - 6i$", isCorrect: true },
                            { text: "$-8 + 6i$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor da expressão $i^{103} + i^{50} - i^{17}$, escrito na forma algébrica $a + bi$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$-1 - 2i$", isCorrect: true },
                            { text: "$-3i$", isCorrect: false },
                            { text: "$1$", isCorrect: false },
                            { text: "$-1 + 2i$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Conjugado, divisão e módulo",
                blocks: [
                    {
                        type: "text",
                        value: "# Conjugado, divisão e módulo\n\nSomar, subtrair e multiplicar complexos saiu de graça na aula passada: era a álgebra de sempre com uma troca no fim. Dividir é outra história. Tente escrever $\\frac{5 + i}{1 + i}$ na forma $a + bi$ e você trava, porque não há como separar as partes com um $i$ embaixo da fração.\n\nO problema é justamente o $i$ no denominador, e a saída é um truque que você já viu com raízes: multiplicar em cima e embaixo por algo que limpe o de baixo. Para isso existe o conjugado, que é o personagem desta aula e também o caminho para medir o tamanho de um número complexo.",
                    },
                    {
                        type: "text",
                        value: "## O conjugado\n\nO **conjugado** de $z = a + bi$ é o complexo que tem a mesma parte real e a parte imaginária com o sinal trocado. Ele se escreve com uma barra em cima:\n\n$$\\bar{z} = a - bi$$\n\nSó o sinal do termo com $i$ muda. A parte real fica exatamente como estava, e é aí que mora o escorregão: o conjugado de $-6 + 2i$ é $-6 - 2i$, e não $6 - 2i$.\n\n| $z$ | $\\bar{z}$ |\n| --- | --- |\n| $3 - 7i$ | $3 + 7i$ |\n| $-6 + 2i$ | $-6 - 2i$ |\n| $5$ | $5$ |\n| $4i$ | $-4i$ |\n\nAs duas últimas linhas valem comentário. Um número real é igual ao próprio conjugado, porque não há sinal de $i$ para trocar. E o conjugado de um imaginário puro é o oposto dele.",
                    },
                    {
                        type: "text",
                        value: "## O produto de $z$ pelo conjugado é um número real\n\nAqui está a propriedade que faz o conjugado valer a pena. Multiplique $z$ por $\\bar{z}$ e veja o que sai:\n\n$$z \\cdot \\bar{z} = (a + bi)(a - bi) = a^2 - abi + abi - b^2i^2 = a^2 + b^2$$\n\nOs dois termos com $i$ se cancelam, e o $-b^2i^2$ vira $+b^2$. O resultado, $a^2 + b^2$, é soma de dois quadrados de números reais: é um **número real**, e nunca negativo.\n\nTestando com $z = 2 + 5i$:\n\n$$(2 + 5i)(2 - 5i) = 4 + 25 = 29$$\n\nNo fundo é a diferença de quadrados de sempre, $(x + y)(x - y) = x^2 - y^2$, com $y = bi$ e $y^2 = -b^2$, o que faz o menos virar mais.",
                    },
                    {
                        type: "text",
                        value: "## A divisão\n\nAgora o truque fica evidente. Para dividir por um complexo, multiplique numerador e denominador pelo **conjugado do denominador**: o de baixo vira real, e aí basta dividir cada parte por esse número.\n\n**Exemplo resolvido 1.** Escrever $\\frac{5 + i}{1 + i}$ na forma algébrica.\n\nO conjugado do denominador é $1 - i$. Multiplicando em cima e embaixo por ele:\n\n$$\\frac{5 + i}{1 + i} = \\frac{(5 + i)(1 - i)}{(1 + i)(1 - i)}$$\n\nNo numerador: $(5 + i)(1 - i) = 5 - 5i + i - i^2 = 5 + 1 - 4i = 6 - 4i$. No denominador, pela propriedade da seção anterior: $1^2 + 1^2 = 2$. Logo\n\n$$\\frac{6 - 4i}{2} = 3 - 2i$$\n\nConferindo pela multiplicação, que é a operação inversa: $(1 + i)(3 - 2i) = 3 - 2i + 3i - 2i^2 = 3 + 2 + i = 5 + i$, que é o numerador original.\n\nO erro grosso aqui é dividir parte por parte, escrevendo $\\frac{5}{1} + \\frac{1}{1}i$. Isso não é divisão de complexos, e tal regra não existe.",
                    },
                    {
                        type: "text",
                        value: "## O inverso de um número complexo\n\nDividir $1$ por $z$ é o mesmo procedimento, e o resultado tem uma forma bonita. Multiplicando numerador e denominador por $\\bar{z}$:\n\n$$\\frac{1}{z} = \\frac{\\bar{z}}{z \\cdot \\bar{z}} = \\frac{a - bi}{a^2 + b^2}$$\n\nOu seja, o inverso de $z$ é o conjugado dividido por $a^2 + b^2$. Com $z = 2 - i$, por exemplo:\n\n$$\\frac{1}{2 - i} = \\frac{2 + i}{4 + 1} = \\frac{2}{5} + \\frac{1}{5}i$$\n\nConferindo pela multiplicação: $(2 - i)\\left(\\frac{2}{5} + \\frac{1}{5}i\\right) = \\frac{4}{5} + \\frac{2}{5}i - \\frac{2}{5}i - \\frac{1}{5}i^2 = \\frac{4}{5} + \\frac{1}{5} = 1$.\n\nIsso vale para todo $z \\neq 0$, e é o que permite dizer que em $\\mathbb{C}$ se divide por qualquer número diferente de zero, do mesmo jeito que em $\\mathbb{R}$.",
                    },
                    {
                        type: "text",
                        value: "## O módulo\n\nO **módulo** de $z = a + bi$ é o número real não negativo\n\n$$|z| = \\sqrt{a^2 + b^2}$$\n\nCompare com a propriedade de duas seções atrás e repare que $z \\cdot \\bar{z} = a^2 + b^2$ é exatamente o que está dentro da raiz. Ou seja:\n\n$$|z|^2 = z \\cdot \\bar{z}$$\n\nEssa igualdade é prática, porque dá o módulo ao quadrado sem raiz nenhuma, só multiplicando pelo conjugado.\n\n**Exemplo resolvido 2.** Calcular $|z|$ para $z = -3 + 4i$.\n\n$$|z| = \\sqrt{(-3)^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$$\n\nDois cuidados. O primeiro: os dois números entram **ao quadrado**, então o sinal da parte real desaparece; quem usa o $-3$ direto e faz $-9 + 16$ chega a $\\sqrt{7}$. O segundo: quem soma $3 + 4$ chega a $7$, e módulo não é soma, é hipotenusa. A próxima aula traz o desenho em que $|z|$ é literalmente a distância de $z$ até a origem.",
                    },
                    {
                        type: "text",
                        value: "## O módulo do produto\n\nO módulo tem uma propriedade que economiza muita conta:\n\n$$|z_1 \\cdot z_2| = |z_1| \\cdot |z_2|$$\n\nO módulo do produto é o **produto** dos módulos, nunca a soma deles. Guarde também a frase ao contrário, porque somar os módulos é o erro padrão do assunto.\n\n**Exemplo.** Com $z_1 = 3 + 4i$ e $z_2 = 1 - 2i$, calcular $|z_1 z_2|$.\n\nPelo caminho curto: $|z_1| = \\sqrt{9 + 16} = 5$ e $|z_2| = \\sqrt{1 + 4} = \\sqrt{5}$, então $|z_1 z_2| = 5\\sqrt{5}$.\n\nPelo caminho longo, para conferir: $(3 + 4i)(1 - 2i) = 3 - 6i + 4i - 8i^2 = 3 + 8 - 2i = 11 - 2i$, e $|11 - 2i| = \\sqrt{121 + 4} = \\sqrt{125} = 5\\sqrt{5}$. Os dois caminhos fecham no mesmo valor. Quem somasse os módulos responderia $5 + \\sqrt{5}$, que é cerca de $7{,}24$, bem longe do valor certo, perto de $11{,}18$.",
                    },
                    {
                        type: "quote",
                        value: "O conjugado $\\bar{z} = a - bi$ troca apenas o sinal da parte imaginária, e $z \\cdot \\bar{z} = a^2 + b^2$ é sempre real, o que faz da multiplicação pelo conjugado do denominador o jeito de dividir complexos. O módulo $|z| = \\sqrt{a^2 + b^2}$ mede o tamanho de $z$, satisfaz $|z|^2 = z\\bar{z}$ e se multiplica no produto: $|z_1 z_2| = |z_1| |z_2|$.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o conjugado do número complexo $z = -6 + 2i$, na forma algébrica $a + bi$?",
                        difficulty: "facil",
                        options: [
                            { text: "$6 + 2i$", isCorrect: false },
                            { text: "$-6 + 2i$", isCorrect: false },
                            { text: "$6 - 2i$", isCorrect: false },
                            { text: "$-6 - 2i$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual é o módulo do número complexo $z = -3 + 4i$?",
                        difficulty: "facil",
                        options: [
                            { text: "$25$", isCorrect: false },
                            { text: "$5$", isCorrect: true },
                            { text: "$\\sqrt{7}$", isCorrect: false },
                            { text: "$7$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Escrevendo o quociente $\\frac{5 + 5i}{2 - i}$ na forma algébrica $a + bi$, qual é o resultado?",
                        difficulty: "medio",
                        options: [
                            { text: "$1 - 3i$", isCorrect: false },
                            { text: "$3 + 3i$", isCorrect: false },
                            { text: "$1 + 3i$", isCorrect: true },
                            { text: "$\\frac{5}{2} - 5i$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Dados $z_1 = 3 + 4i$ e $z_2 = 1 - 2i$, qual é o valor do módulo $|z_1 \\cdot z_2|$?",
                        difficulty: "medio",
                        options: [
                            { text: "$5\\sqrt{5}$", isCorrect: true },
                            { text: "$125$", isCorrect: false },
                            { text: "$5 + \\sqrt{5}$", isCorrect: false },
                            { text: "$\\sqrt{29}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o número real $k$ para o qual o quociente $\\frac{k + 2i}{1 - i}$ é um imaginário puro?",
                        difficulty: "dificil",
                        options: [
                            { text: "$k = -2$", isCorrect: false },
                            { text: "nenhum valor real de $k$ serve", isCorrect: false },
                            { text: "$k = 2$", isCorrect: true },
                            { text: "$k = 0$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "O plano de Argand-Gauss e a forma trigonométrica",
                blocks: [
                    {
                        type: "text",
                        value: "# O plano de Argand-Gauss e a forma trigonométrica\n\nUm número real tem lugar na reta numérica: $-3$ fica três passos à esquerda do zero, e pronto. Onde fica $3 + 5i$? A reta não serve, porque um complexo carrega **dois** números de uma vez, a parte real e a parte imaginária.\n\nPar de números pede duas dimensões. A ideia, que apareceu na virada do século XVIII para o XIX com Argand e Gauss, foi usar um plano no lugar de uma reta. Essa mudança de desenho não é enfeite: ela transforma módulo em distância, dá significado geométrico ao argumento e, na próxima aula, vai tornar fácil uma potência que na forma algébrica seria insuportável.",
                    },
                    {
                        type: "text",
                        value: "## O plano de Argand-Gauss\n\nO **plano de Argand-Gauss** é um plano com dois eixos perpendiculares que se cruzam na origem:\n\n- o **eixo real**, horizontal, onde se marca a parte real;\n- o **eixo imaginário**, vertical, onde se marca a parte imaginária.\n\nCada complexo $z = a + bi$ vira o ponto de coordenadas $(a,\\ b)$, chamado de **afixo** de $z$. A correspondência é perfeita nos dois sentidos: cada complexo tem um ponto, e cada ponto do plano tem um complexo.\n\n| Número | Afixo | Onde fica |\n| --- | --- | --- |\n| $3 + 5i$ | $(3,\\ 5)$ | primeiro quadrante |\n| $-2 + 2i$ | $(-2,\\ 2)$ | segundo quadrante |\n| $-4$ | $(-4,\\ 0)$ | sobre o eixo real |\n| $3i$ | $(0,\\ 3)$ | sobre o eixo imaginário |\n\nRepare nas duas últimas linhas: os números **reais** ficam todos sobre o eixo horizontal, e os **imaginários puros** ficam todos sobre o eixo vertical. A reta numérica de antes continua ali dentro, é o eixo real.\n\nA ordem das coordenadas importa, e trocá-las é o erro mais frequente: o afixo de $-5 + 2i$ é $(-5,\\ 2)$, e não $(2,\\ -5)$.",
                    },
                    {
                        type: "text",
                        value: "## O módulo é uma distância\n\nCom o desenho na mão, o módulo deixa de ser fórmula decorada. O afixo $(a,\\ b)$, a origem e o pé da perpendicular baixada ao eixo real formam um triângulo retângulo de cateto horizontal $|a|$ e cateto vertical $|b|$. A hipotenusa é a distância da origem até o afixo, e Pitágoras dá:\n\n$$|z| = \\sqrt{a^2 + b^2}$$\n\nÉ exatamente a fórmula da aula passada. Então **o módulo de $z$ é a distância do afixo de $z$ até a origem**, e é por isso que ele nunca é negativo.\n\nIsso também explica uma coisa bonita: os complexos de módulo $5$, por exemplo, são os pontos de uma circunferência de centro na origem e raio $5$. Ali estão $3 + 4i$, $-3 + 4i$, $5$, $-5$, $5i$ e infinitos outros, todos à mesma distância do centro.",
                    },
                    {
                        type: "text",
                        value: "## O argumento\n\nPara localizar o afixo bastam o módulo e mais uma informação: a direção. Ela é dada pelo **argumento** de $z$, o ângulo $\\theta$ medido do semieixo real positivo até o segmento que liga a origem ao afixo, no sentido anti-horário.\n\nNesta trilha o argumento sempre vem em **graus**, no intervalo\n\n$$0^\\circ \\le \\theta < 360^\\circ$$\n\nDo triângulo retângulo da seção anterior saem as duas relações que ligam tudo:\n\n$$\\cos \\theta = \\frac{a}{|z|} \\qquad \\sin \\theta = \\frac{b}{|z|}$$\n\nOu, lidas ao contrário, $a = |z| \\cos \\theta$ e $b = |z| \\sin \\theta$. Só o $z = 0$ fica de fora da conversa: ele tem módulo zero e nenhum argumento definido, porque não aponta para direção alguma.",
                    },
                    {
                        type: "text",
                        value: "## Os arcos notáveis, de volta à mesa\n\nPara escrever e ler forma trigonométrica você só precisa de seno e cosseno de alguns ângulos. Eles estão todos aqui, nos quatro quadrantes, para a aula não depender de mais nada.\n\n| $\\theta$ | $\\cos \\theta$ | $\\sin \\theta$ | Posição |\n| --- | --- | --- | --- |\n| $0^\\circ$ | $1$ | $0$ | eixo real positivo |\n| $30^\\circ$ | $\\frac{\\sqrt{3}}{2}$ | $\\frac{1}{2}$ | primeiro quadrante |\n| $45^\\circ$ | $\\frac{\\sqrt{2}}{2}$ | $\\frac{\\sqrt{2}}{2}$ | primeiro quadrante |\n| $60^\\circ$ | $\\frac{1}{2}$ | $\\frac{\\sqrt{3}}{2}$ | primeiro quadrante |\n| $90^\\circ$ | $0$ | $1$ | eixo imaginário positivo |\n| $120^\\circ$ | $-\\frac{1}{2}$ | $\\frac{\\sqrt{3}}{2}$ | segundo quadrante |\n| $135^\\circ$ | $-\\frac{\\sqrt{2}}{2}$ | $\\frac{\\sqrt{2}}{2}$ | segundo quadrante |\n| $150^\\circ$ | $-\\frac{\\sqrt{3}}{2}$ | $\\frac{1}{2}$ | segundo quadrante |\n| $180^\\circ$ | $-1$ | $0$ | eixo real negativo |\n| $210^\\circ$ | $-\\frac{\\sqrt{3}}{2}$ | $-\\frac{1}{2}$ | terceiro quadrante |\n| $225^\\circ$ | $-\\frac{\\sqrt{2}}{2}$ | $-\\frac{\\sqrt{2}}{2}$ | terceiro quadrante |\n| $240^\\circ$ | $-\\frac{1}{2}$ | $-\\frac{\\sqrt{3}}{2}$ | terceiro quadrante |\n| $270^\\circ$ | $0$ | $-1$ | eixo imaginário negativo |\n| $300^\\circ$ | $\\frac{1}{2}$ | $-\\frac{\\sqrt{3}}{2}$ | quarto quadrante |\n| $315^\\circ$ | $\\frac{\\sqrt{2}}{2}$ | $-\\frac{\\sqrt{2}}{2}$ | quarto quadrante |\n| $330^\\circ$ | $\\frac{\\sqrt{3}}{2}$ | $-\\frac{1}{2}$ | quarto quadrante |\n\nDuas leituras rápidas poupam esforço. O **cosseno é positivo à direita** (primeiro e quarto quadrantes) e negativo à esquerda; o **seno é positivo acima** (primeiro e segundo) e negativo abaixo. E os valores se repetem: todo ângulo da lista usa $0$, $\\frac{1}{2}$, $\\frac{\\sqrt{2}}{2}$, $\\frac{\\sqrt{3}}{2}$ ou $1$, mudando apenas os sinais.",
                    },
                    {
                        type: "text",
                        value: "## A forma trigonométrica\n\nSubstituindo $a = |z|\\cos\\theta$ e $b = |z|\\sin\\theta$ em $z = a + bi$ e colocando $|z|$ em evidência:\n\n$$z = |z|(\\cos \\theta + i \\sin \\theta)$$\n\nEssa é a **forma trigonométrica** de $z$. Ela carrega a mesma informação que a forma algébrica, dita de outro jeito: em vez de \"ande $a$ para o lado e $b$ para cima\", ela diz \"ande $|z|$ nesta direção\".\n\n**Exemplo resolvido 1.** Escrever $z = 1 + i$ na forma trigonométrica.\n\nO módulo é $|z| = \\sqrt{1 + 1} = \\sqrt{2}$. Para o argumento:\n\n$$\\cos \\theta = \\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2} \\qquad \\sin \\theta = \\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2}$$\n\nNa tabela, o único ângulo com esses dois valores é $\\theta = 45^\\circ$, e o afixo $(1,\\ 1)$ está mesmo no primeiro quadrante. Logo\n\n$$z = \\sqrt{2}(\\cos 45^\\circ + i \\sin 45^\\circ)$$\n\nCuidado para não deixar o módulo como $2$: a raiz faz parte dele, porque $|z| = \\sqrt{2}$ e não $\\sqrt{2}^2$.",
                    },
                    {
                        type: "text",
                        value: "## O quadrante decide, a tangente não\n\nDividindo as duas relações, o módulo some e sobra $\\tan \\theta = \\frac{b}{a}$. É tentador usar só isso, e é aqui que a maioria erra.\n\nOlhe dois números diferentes com a mesma tangente:\n\n- $z_1 = -2 + 2i$, em que $\\frac{b}{a} = \\frac{2}{-2} = -1$;\n- $z_2 = 2 - 2i$, em que $\\frac{b}{a} = \\frac{-2}{2} = -1$.\n\nA tangente vale $-1$ nos dois casos, mas $z_1$ está no segundo quadrante e $z_2$ no quarto. Os argumentos são diferentes: $135^\\circ$ para $z_1$ e $315^\\circ$ para $z_2$. A tangente não distingue os dois, porque ela não vê os sinais separados, só o sinal do quociente.\n\n**Exemplo resolvido 2.** Escrever $z = -2 + 2i$ na forma trigonométrica.\n\nO módulo é $|z| = \\sqrt{4 + 4} = \\sqrt{8} = 2\\sqrt{2}$. Então\n\n$$\\cos \\theta = \\frac{-2}{2\\sqrt{2}} = -\\frac{\\sqrt{2}}{2} \\qquad \\sin \\theta = \\frac{2}{2\\sqrt{2}} = \\frac{\\sqrt{2}}{2}$$\n\nCosseno negativo e seno positivo: segundo quadrante, e a tabela dá $\\theta = 135^\\circ$. Logo $z = 2\\sqrt{2}(\\cos 135^\\circ + i \\sin 135^\\circ)$.\n\nO método seguro é sempre este: calcule o módulo, calcule **os dois**, seno e cosseno, e deixe os sinais dizerem o quadrante.",
                    },
                    {
                        type: "text",
                        value: "## Da trigonométrica para a algébrica\n\nO caminho de volta é mais curto: troque seno e cosseno pelos valores da tabela e multiplique pelo módulo.\n\n**Exemplo.** Escrever $z = 4(\\cos 240^\\circ + i \\sin 240^\\circ)$ na forma algébrica.\n\nDa tabela, $\\cos 240^\\circ = -\\frac{1}{2}$ e $\\sin 240^\\circ = -\\frac{\\sqrt{3}}{2}$. Então\n\n$$z = 4 \\cdot \\left(-\\frac{1}{2}\\right) + 4 \\cdot \\left(-\\frac{\\sqrt{3}}{2}\\right)i = -2 - 2\\sqrt{3}i$$\n\nConferindo o módulo do resultado: $\\sqrt{4 + 12} = \\sqrt{16} = 4$, que é o módulo de partida. Essa conferência é rápida e pega erro de sinal na hora.\n\nDois casos saem de cabeça e vale guardar: $-4$ tem módulo $4$ e argumento $180^\\circ$, porque seu afixo está no eixo real negativo; e $3i$ tem módulo $3$ e argumento $90^\\circ$, porque seu afixo está no eixo imaginário positivo.",
                    },
                    {
                        type: "quote",
                        value: "No plano de Argand-Gauss, $z = a + bi$ é o ponto $(a,\\ b)$: o módulo $|z|$ é a distância dele até a origem e o argumento $\\theta$ é o ângulo com o semieixo real positivo, o que dá a forma trigonométrica $z = |z|(\\cos \\theta + i \\sin \\theta)$. Para achar $\\theta$, olhe os sinais de seno e cosseno e decida pelo quadrante, porque a tangente sozinha não distingue $135^\\circ$ de $315^\\circ$.",
                    },
                ],
                questions: [
                    {
                        statement: "No plano de Argand-Gauss, qual é o par de coordenadas do afixo de $z = -5 + 2i$?",
                        difficulty: "facil",
                        options: [
                            { text: "$(5,\\ 2)$", isCorrect: false },
                            { text: "$(2,\\ -5)$", isCorrect: false },
                            { text: "$(-5,\\ 2)$", isCorrect: true },
                            { text: "$(-5,\\ -2)$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o argumento de $z = 3i$, em graus, no intervalo $0^\\circ \\le \\theta < 360^\\circ$?",
                        difficulty: "facil",
                        options: [
                            { text: "$270^\\circ$", isCorrect: false },
                            { text: "$0^\\circ$", isCorrect: false },
                            { text: "$90^\\circ$", isCorrect: true },
                            { text: "$180^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a forma trigonométrica de $z = 1 + i$, com o argumento em graus no intervalo $0^\\circ \\le \\theta < 360^\\circ$?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\sqrt{2}(\\cos 45^\\circ + i \\sin 45^\\circ)$", isCorrect: true },
                            { text: "$\\sqrt{2}(\\cos 225^\\circ + i \\sin 225^\\circ)$", isCorrect: false },
                            { text: "$\\sqrt{2}(\\cos 135^\\circ + i \\sin 135^\\circ)$", isCorrect: false },
                            { text: "$2(\\cos 45^\\circ + i \\sin 45^\\circ)$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Escrevendo $z = 4(\\cos 240^\\circ + i \\sin 240^\\circ)$ na forma algébrica $a + bi$, qual é o resultado?",
                        difficulty: "medio",
                        options: [
                            { text: "$-2 + 2\\sqrt{3}i$", isCorrect: false },
                            { text: "$2 + 2\\sqrt{3}i$", isCorrect: false },
                            { text: "$-2 - 2\\sqrt{3}i$", isCorrect: true },
                            { text: "$-2\\sqrt{3} - 2i$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a forma trigonométrica de $z = \\sqrt{3} - 3i$, com o argumento em graus no intervalo $0^\\circ \\le \\theta < 360^\\circ$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$2\\sqrt{3}(\\cos 60^\\circ + i \\sin 60^\\circ)$", isCorrect: false },
                            { text: "$12(\\cos 300^\\circ + i \\sin 300^\\circ)$", isCorrect: false },
                            { text: "$2\\sqrt{3}(\\cos 300^\\circ + i \\sin 300^\\circ)$", isCorrect: true },
                            { text: "$2\\sqrt{3}(\\cos 240^\\circ + i \\sin 240^\\circ)$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Potência e raiz na forma trigonométrica",
                blocks: [
                    {
                        type: "text",
                        value: "# Potência e raiz na forma trigonométrica\n\nCalcule $(1 + i)^{12}$. Na forma algébrica, o caminho honesto é elevar ao quadrado, multiplicar pelo resultado, multiplicar de novo, e repetir até cansar: são onze multiplicações, cada uma com quatro produtos e uma troca de $i^2$. Dá para fazer, e dá para errar em qualquer linha.\n\nA forma trigonométrica resolve isso em duas linhas. O motivo é que ela separa o complexo em duas informações independentes, módulo e argumento, e cada operação age sobre elas de um jeito simples. Esta aula mostra como, e fecha com um problema que a forma algébrica nem sabe enunciar bem: achar **todas** as raízes de índice $n$ de um número complexo.",
                    },
                    {
                        type: "text",
                        value: "## Multiplicar: módulos multiplicam, argumentos somam\n\nSejam $z_1 = r_1(\\cos \\alpha + i \\sin \\alpha)$ e $z_2 = r_2(\\cos \\beta + i \\sin \\beta)$. Ao multiplicar os dois, acontece o seguinte:\n\n$$z_1 \\cdot z_2 = r_1 r_2 \\left[\\cos(\\alpha + \\beta) + i \\sin(\\alpha + \\beta)\\right]$$\n\nEm palavras: **os módulos se multiplicam e os argumentos se somam**. Na divisão vale o espelho disso, com $z_2 \\neq 0$:\n\n$$\\frac{z_1}{z_2} = \\frac{r_1}{r_2}\\left[\\cos(\\alpha - \\beta) + i \\sin(\\alpha - \\beta)\\right]$$\n\nOs módulos se dividem e os argumentos se subtraem. Se o argumento resultante sair do intervalo de $0^\\circ$ a $360^\\circ$, some ou subtraia $360^\\circ$ até cair dentro: o ângulo é o mesmo, só está escrito com outra volta.\n\n**Exemplo.** Com $z_1 = 2(\\cos 30^\\circ + i \\sin 30^\\circ)$ e $z_2 = 3(\\cos 60^\\circ + i \\sin 60^\\circ)$:\n\n$$z_1 z_2 = 2 \\cdot 3 \\left[\\cos(30^\\circ + 60^\\circ) + i \\sin(30^\\circ + 60^\\circ)\\right] = 6(\\cos 90^\\circ + i \\sin 90^\\circ) = 6i$$\n\nConferindo na forma algébrica: $z_1 = \\sqrt{3} + i$ e $z_2 = \\frac{3}{2} + \\frac{3\\sqrt{3}}{2}i$, e o produto dos dois dá $6i$ mesmo. Os erros a evitar são somar os módulos, respondendo $5$ no lugar de $6$, e multiplicar os argumentos, chegando a $1800^\\circ$.",
                    },
                    {
                        type: "text",
                        value: "## A potência\n\nElevar à potência $n$ é multiplicar o número por si mesmo $n$ vezes, ou seja, multiplicar o módulo por si mesmo $n$ vezes e somar o mesmo argumento $n$ vezes. Daí sai a fórmula:\n\n$$z^n = |z|^n \\left(\\cos n\\theta + i \\sin n\\theta\\right)$$\n\nO módulo vai à potência $n$ e o argumento é multiplicado por $n$. Depois, reduza $n\\theta$ ao intervalo de $0^\\circ$ a $360^\\circ$ tirando as voltas completas de $360^\\circ$.\n\n**Exemplo resolvido 1.** Calcular $(1 + i)^{12}$.\n\nDa aula passada, $1 + i = \\sqrt{2}(\\cos 45^\\circ + i \\sin 45^\\circ)$. Aplicando a fórmula:\n\n- módulo: $(\\sqrt{2})^{12} = 2^6 = 64$;\n- argumento: $12 \\cdot 45^\\circ = 540^\\circ$, e $540^\\circ - 360^\\circ = 180^\\circ$.\n\nEntão $(1 + i)^{12} = 64(\\cos 180^\\circ + i \\sin 180^\\circ) = 64 \\cdot (-1) + 64 \\cdot 0 \\cdot i = -64$.\n\nDuas linhas de conta no lugar de onze multiplicações, e o resultado é um número real. Repare no cálculo do módulo: $(\\sqrt{2})^{12} = (2^{\\frac{1}{2}})^{12} = 2^6 = 64$. Quem escreve $2^{12} = 4096$ esqueceu que o módulo era a raiz de dois, não o dois.",
                    },
                    {
                        type: "text",
                        value: "## As $n$ raízes de índice $n$\n\nEm $\\mathbb{R}$, a raiz cúbica de $8$ é $2$ e acabou. Em $\\mathbb{C}$ a história muda: **todo complexo diferente de zero tem exatamente $n$ raízes de índice $n$**, todas distintas.\n\nIsso faz sentido se você pensar na pergunta por trás: achar raiz de índice $n$ de $z$ é achar todo $w$ com $w^n = z$. Pela fórmula da potência, esse $w$ precisa ter módulo $\\sqrt[n]{|z|}$ e um argumento que, multiplicado por $n$, caia em $\\theta$ ou em $\\theta$ mais um número inteiro de voltas. Isso dá:\n\n$$\\theta_k = \\frac{\\theta + k \\cdot 360^\\circ}{n}, \\quad k = 0,\\ 1,\\ 2,\\ \\dots,\\ n - 1$$\n\nTrês consequências que valem ler devagar:\n\n1. **todas as raízes têm o mesmo módulo**, que é $\\sqrt[n]{|z|}$;\n2. os argumentos são separados por $\\frac{360^\\circ}{n}$, porque é isso que o argumento ganha a cada passo de $k$;\n3. logo, no plano de Argand-Gauss, os $n$ afixos ficam sobre uma mesma circunferência, igualmente espaçados: eles são os vértices de um **polígono regular** de $n$ lados.\n\nEm $k = n$ a conta recomeça, caindo de volta na raiz de $k = 0$ depois de uma volta completa. É por isso que $k$ para em $n - 1$.",
                    },
                    {
                        type: "text",
                        value: "## Exemplo resolvido 2: as três raízes cúbicas de $8$\n\nComece escrevendo o $8$ na forma trigonométrica. Ele é real positivo, então seu afixo é $(8,\\ 0)$, com módulo $8$ e argumento $0^\\circ$:\n\n$$8 = 8(\\cos 0^\\circ + i \\sin 0^\\circ)$$\n\nO módulo das três raízes é $\\sqrt[3]{8} = 2$, igual para todas. Os argumentos saem de $\\theta_k = \\frac{0^\\circ + k \\cdot 360^\\circ}{3}$, com $k = 0,\\ 1,\\ 2$: são $0^\\circ$, $120^\\circ$ e $240^\\circ$, separados por $\\frac{360^\\circ}{3} = 120^\\circ$.\n\nPassando para a forma algébrica, com a tabela da aula passada:\n\n- $k = 0$: $2(\\cos 0^\\circ + i \\sin 0^\\circ) = 2$;\n- $k = 1$: $2\\left(-\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i\\right) = -1 + \\sqrt{3}i$;\n- $k = 2$: $2\\left(-\\frac{1}{2} - \\frac{\\sqrt{3}}{2}i\\right) = -1 - \\sqrt{3}i$.\n\nConfira a segunda elevando ao cubo pela forma trigonométrica: módulo $2^3 = 8$ e argumento $3 \\cdot 120^\\circ = 360^\\circ$, que é o mesmo que $0^\\circ$. Volta ao $8$, como tinha de ser.\n\nOs três afixos, $(2,\\ 0)$, $(-1,\\ \\sqrt{3})$ e $(-1,\\ -\\sqrt{3})$, estão todos a distância $2$ da origem e a $120^\\circ$ um do outro: são os vértices de um triângulo equilátero. Note também que duas das três raízes não são reais, e é por isso que $\\mathbb{R}$ mostrava só uma.",
                    },
                    {
                        type: "text",
                        value: "## As quatro raízes quartas de $16$\n\nO mesmo roteiro, agora com $n = 4$. O número $16$ tem módulo $16$ e argumento $0^\\circ$. O módulo das raízes é $\\sqrt[4]{16} = 2$, e os argumentos são separados por $\\frac{360^\\circ}{4} = 90^\\circ$: ficam $0^\\circ$, $90^\\circ$, $180^\\circ$ e $270^\\circ$. Na forma algébrica, isso dá\n\n$$2, \\quad 2i, \\quad -2, \\quad -2i$$\n\nConfira o $2i$: $(2i)^4 = 16i^4 = 16 \\cdot 1 = 16$. Confere. E confira o $-2$: $(-2)^4 = 16$. Também confere.\n\nOs quatro afixos, $(2,\\ 0)$, $(0,\\ 2)$, $(-2,\\ 0)$ e $(0,\\ -2)$, formam um quadrado de centro na origem. Em $\\mathbb{R}$ a equação $x^4 = 16$ tinha duas soluções, $2$ e $-2$; em $\\mathbb{C}$ ela tem quatro, e as outras duas são imaginários puros.",
                    },
                    {
                        type: "text",
                        value: "## Os três tropeços de sempre\n\n**Somar os módulos ao multiplicar.** A operação no módulo acompanha a operação nos números: multiplicação de complexos multiplica módulos, divisão divide. Quem soma troca o $6$ por $5$ no exemplo da segunda seção.\n\n**Esquecer de reduzir o argumento.** Dizer que $(1 + i)^{12}$ tem argumento $540^\\circ$ não erra o valor do número, mas sai do intervalo combinado. Tire $360^\\circ$ e escreva $180^\\circ$, que é a forma pedida nesta trilha.\n\n**Dar uma raiz quando existem $n$.** Esta é a pior, porque responde menos do que a questão pede. Se o enunciado fala em raízes cúbicas, são três; se fala em raízes quartas, são quatro. Deixar as não reais de fora é responder em $\\mathbb{R}$ uma pergunta feita em $\\mathbb{C}$.",
                    },
                    {
                        type: "quote",
                        value: "Na forma trigonométrica a potência fica fácil: $z^n$ tem módulo $|z|^n$ e argumento $n\\theta$, porque multiplicar multiplica os módulos e soma os argumentos. E a raiz de índice $n$ não é uma, são $n$, todas com módulo $\\sqrt[n]{|z|}$ e argumentos separados por $\\frac{360^\\circ}{n}$, nos vértices de um polígono regular. Com isso a álgebra se fecha: toda equação polinomial passa a ter raiz, e você já tem as duas escritas, a algébrica e a trigonométrica, para trabalhar com elas aqui, mais adiante no estudo de funções e em cálculo.",
                    },
                ],
                questions: [
                    {
                        statement: "Sejam $z_1 = 2(\\cos 30^\\circ + i \\sin 30^\\circ)$ e $z_2 = 5(\\cos 90^\\circ + i \\sin 90^\\circ)$. Qual é o produto $z_1 \\cdot z_2$ na forma trigonométrica?",
                        difficulty: "facil",
                        options: [
                            { text: "$10(\\cos 60^\\circ + i \\sin 60^\\circ)$", isCorrect: false },
                            { text: "$10(\\cos 2700^\\circ + i \\sin 2700^\\circ)$", isCorrect: false },
                            { text: "$10(\\cos 120^\\circ + i \\sin 120^\\circ)$", isCorrect: true },
                            { text: "$7(\\cos 120^\\circ + i \\sin 120^\\circ)$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Se $z = 2(\\cos 45^\\circ + i \\sin 45^\\circ)$, qual é a potência $z^3$ na forma trigonométrica?",
                        difficulty: "facil",
                        options: [
                            { text: "$8(\\cos 135^\\circ + i \\sin 135^\\circ)$", isCorrect: true },
                            { text: "$8(\\cos 45^\\circ + i \\sin 45^\\circ)$", isCorrect: false },
                            { text: "$2(\\cos 135^\\circ + i \\sin 135^\\circ)$", isCorrect: false },
                            { text: "$6(\\cos 135^\\circ + i \\sin 135^\\circ)$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $(\\sqrt{3} + i)^6$ na forma algébrica $a + bi$?",
                        difficulty: "medio",
                        options: [
                            { text: "$-64$", isCorrect: true },
                            { text: "$-12$", isCorrect: false },
                            { text: "$64$", isCorrect: false },
                            { text: "$-64i$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Quais são as três raízes cúbicas de $-8$ em $\\mathbb{C}$, escritas na forma algébrica?",
                        difficulty: "medio",
                        options: [
                            { text: "$-2$, $1 + \\sqrt{3}i$ e $1 - \\sqrt{3}i$", isCorrect: true },
                            { text: "apenas $-2$, que é a única raiz real", isCorrect: false },
                            { text: "$2$, $-1 + \\sqrt{3}i$ e $-1 - \\sqrt{3}i$", isCorrect: false },
                            { text: "$-2$, $-1 + \\sqrt{3}i$ e $-1 - \\sqrt{3}i$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o menor expoente natural $n$, com $n \\ge 1$, para o qual a potência $(1 + i)^n$ é um número real negativo?",
                        difficulty: "dificil",
                        options: [
                            { text: "$n = 2$", isCorrect: false },
                            { text: "$n = 6$", isCorrect: false },
                            { text: "$n = 8$", isCorrect: false },
                            { text: "$n = 4$", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
] as unknown as Modulo[];

async function seed() {
    mesclarSolucoes(MODULOS, "algebra");
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
