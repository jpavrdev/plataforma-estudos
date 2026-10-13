// Seed da trilha Matemática Básica. Conteúdo autoral, quiz-only, com fórmulas em LaTeX
// ($...$ inline e $$...$$ em bloco). As resoluções passo a passo ficam em
// scripts/solucoes/matematica-basica.json e entram por mesclarSolucoes. Idempotente: se a
// trilha já tiver aulas, só atualiza as explicações.
//
// As alternativas já saem embaralhadas do gerador, com semente no enunciado. Sem
// isso a correta ficaria em position 1 em toda questão e o gabarito do e-book, que
// não passa pelo backend, sairia todo em A.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-matematica-basica.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { backfillExplicacoes, mesclarSolucoes } from "./backfill-explicacoes.ts";

const NOME = "Matemática Básica";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const HORAS = 20;
const DESCRICAO =
    "A base da matemática escolar, do começo e sem pressa: números e operações com sinal, divisibilidade, MMC e MDC, frações, decimais, porcentagem, razão e proporção, potências, raízes e notação científica, a passagem da aritmética para a álgebra (expressões, equação e inequação do primeiro grau), geometria plana (ângulos, triângulos, polígonos, circunferência, Pitágoras e Tales), medidas, área e volume, e a leitura de tabelas e gráficos. A trilha para quem precisa reconstruir o alicerce antes de encarar função, trigonometria e cálculo.";

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
        titulo: "Módulo 1 - Números e operações",
        aulas: [
            {
                titulo: "Conjuntos numéricos no dia a dia",
                blocks: [
                    {
                        type: "text",
                        value: "# Conjuntos numéricos no dia a dia\n\nVocê já usa números todos os dias: confere o troco, olha a temperatura, vê o saldo da conta ficar negativo no fim do mês. O que a matemática faz é organizar esses números em grupos, chamados **conjuntos numéricos**, para que cada tipo de problema seja resolvido com o tipo de número certo.\n\nNesta aula vamos montar esses grupos, do mais simples para o mais completo, e desenhar uma única linha em que todos eles cabem. Nada aqui depende de você lembrar da escola: cada termo vai ser nomeado na primeira vez que aparecer.",
                    },
                    {
                        type: "text",
                        value: "## Os naturais: os números de contar\n\nOs **números naturais** são os que usamos para contar coisas inteiras, uma a uma. O conjunto deles é indicado pela letra $\\mathbb{N}$:\n\n$$\\mathbb{N} = \\{0, 1, 2, 3, 4, \\dots\\}$$\n\nAs reticências querem dizer que a lista continua para sempre, sem último elemento. Repare que não há número negativo aqui, nem pedaço de número: $-2$ e meia maçã não são naturais.\n\nSe você tem $7$ cadeiras e compra $5$, passa a ter $12$: somar dois naturais sempre dá um natural. Já a subtração pode escapar do conjunto, e é por isso que precisamos do grupo seguinte.",
                    },
                    {
                        type: "text",
                        value: "## Quando o resultado fica abaixo de zero: os inteiros\n\nImagine uma conta com saldo de $120$ reais. O titular gasta $200$ reais. O saldo não deixa de existir, ele fica **abaixo de zero**: faltam $80$ reais, o que se escreve $-80$.\n\nPara dar conta disso, juntamos aos naturais os **números negativos** e formamos os **números inteiros**, indicados por $\\mathbb{Z}$:\n\n$$\\mathbb{Z} = \\{\\dots, -3, -2, -1, 0, 1, 2, 3, \\dots\\}$$\n\nAgora a lista não tem primeiro nem último elemento: é infinita nos dois sentidos. Todo natural também é inteiro, ou seja, $\\mathbb{N}$ está contido em $\\mathbb{Z}$, o que se escreve $\\mathbb{N} \\subset \\mathbb{Z}$.\n\nInteiro negativo aparece em muito lugar fora do banco: $-5$ graus na previsão do tempo, $-18$ metros na profundidade de um mergulho, $-2$ no botão do segundo subsolo de um prédio.",
                    },
                    {
                        type: "text",
                        value: "## A reta numérica\n\nA **reta numérica** é um desenho que coloca os números em fila. Para montá-la bastam três escolhas:\n\n1. um ponto qualquer para ser o **zero**, chamado de origem;\n2. um sentido para crescer, que por convenção é para a direita;\n3. um tamanho de passo, a unidade, sempre o mesmo de um número para o outro.\n\nFeito isso, cada inteiro ganha seu lugar: $1$ fica um passo à direita do zero, $2$ fica dois passos, $-1$ fica um passo à esquerda e $-3$ fica três passos à esquerda.\n\nDois números que estão à mesma distância do zero, um de cada lado, são chamados de **opostos** (ou simétricos). O oposto de $6$ é $-6$, e o oposto de $-6$ é $6$. O oposto de zero é ele mesmo.",
                    },
                    {
                        type: "text",
                        value: "## Ordem e comparação\n\nA reta dá uma regra simples e que não falha: **quem está mais à direita é o maior**. Os símbolos da comparação são estes:\n\n| Símbolo | Lê-se | Exemplo |\n| --- | --- | --- |\n| $<$ | é menor que | $-3 < 1$ |\n| $>$ | é maior que | $5 > 2$ |\n| $\\le$ | é menor ou igual a | $4 \\le 4$ |\n| $\\ge$ | é maior ou igual a | $7 \\ge 2$ |\n| $\\neq$ | é diferente de | $3 \\neq -3$ |\n\nVamos comparar $-7$ e $-2$. Na reta, $-7$ está sete passos à esquerda do zero e $-2$ está dois passos. Quem está mais à esquerda é menor, então $-7 < -2$.\n\nAqui está um tropeço que quase todo mundo dá no começo: olhar só para os algarismos, ver que sete é maior que dois e concluir que $-7 > -2$. Isso é o esperado de quem está aprendendo, e não descuido. O jeito de não cair é pensar em dívida: quem deve $7$ reais está em situação pior do que quem deve $2$.\n\nEm ordem crescente, do menor para o maior: $-5$, $-1$, $0$, $3$.",
                    },
                    {
                        type: "text",
                        value: "## Entre os inteiros ainda cabe número\n\nEntre $0$ e $1$ não existe nenhum inteiro, mas existem números: meio, um terço, três quartos. Os números que podem ser escritos como uma divisão de inteiros são chamados de **racionais**, e eles são o assunto das duas últimas aulas deste módulo.\n\nHá ainda números que não cabem em divisão nenhuma de inteiros, com casas decimais que nunca terminam e nunca repetem um padrão. Esses são os **irracionais**, e o exemplo mais famoso é $\\pi$, que vale aproximadamente $3{,}14$. Vamos trabalhar com eles quando chegarmos às raízes.\n\nPor ora, guarde só a ideia: a reta numérica não tem buraco. Os inteiros são as marcas principais e, entre duas marcas quaisquer, há infinitos outros números.",
                    },
                    {
                        type: "text",
                        value: "## Juntando tudo\n\n| Conjunto | Símbolo | Exemplos | Serve para |\n| --- | --- | --- | --- |\n| Naturais | $\\mathbb{N}$ | $0$, $7$, $25$ | contar o que é inteiro e não negativo |\n| Inteiros | $\\mathbb{Z}$ | $-80$, $-1$, $4$ | medir também o que fica abaixo de zero |\n| Racionais | $\\mathbb{Q}$ | $\\frac{1}{2}$, $\\frac{3}{4}$ | repartir, medir parte de um todo |\n| Irracionais | não tem letra própria | $\\pi$, $\\sqrt{2}$ | medir o que não cabe em divisão exata |\n\nCada conjunto da lista contém o anterior: todo natural é inteiro e todo inteiro é racional, pois $4 = \\frac{4}{1}$. O contrário não vale, e um exemplo basta para mostrar: $-80$ é inteiro e não é natural.",
                    },
                    {
                        type: "quote",
                        value: "Os números de contar formam os naturais, e incluir os negativos forma os inteiros. Na reta numérica cada número ocupa um ponto e quem está mais à direita é o maior, o que faz $-7 < -2$ mesmo que sete pareça maior que dois.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual dos números a seguir não pertence ao conjunto dos naturais?",
                        difficulty: "facil",
                        options: [
                            { text: "$-4$", isCorrect: true },
                            { text: "$0$", isCorrect: false },
                            { text: "$25$", isCorrect: false },
                            { text: "$7$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Colocando os números $-5$, $3$, $-1$ e $0$ em ordem crescente, qual sequência se obtém?",
                        difficulty: "facil",
                        options: [
                            { text: "$-1$, $-5$, $0$, $3$", isCorrect: false },
                            { text: "$3$, $0$, $-1$, $-5$", isCorrect: false },
                            { text: "$0$, $-1$, $-5$, $3$", isCorrect: false },
                            { text: "$-5$, $-1$, $0$, $3$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "O saldo de uma conta é de $120$ reais e o titular faz uma compra de $200$ reais. Qual número inteiro representa o novo saldo?",
                        difficulty: "medio",
                        options: [
                            { text: "$-80$", isCorrect: true },
                            { text: "$-320$", isCorrect: false },
                            { text: "$320$", isCorrect: false },
                            { text: "$80$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Na reta numérica, qual número está à mesma distância do zero que $-6$, mas do outro lado?",
                        difficulty: "medio",
                        options: [
                            { text: "$6$", isCorrect: true },
                            { text: "$0$", isCorrect: false },
                            { text: "$-12$", isCorrect: false },
                            { text: "$-6$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Quais são os números inteiros que ficam entre $-3$ e $2$ na reta numérica, sem contar os dois extremos?",
                        difficulty: "dificil",
                        options: [
                            { text: "$-2$, $-1$, $1$", isCorrect: false },
                            { text: "$-1$, $0$, $1$", isCorrect: false },
                            { text: "$-3$, $-2$, $-1$, $0$, $1$, $2$", isCorrect: false },
                            { text: "$-2$, $-1$, $0$, $1$", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "As quatro operações e a ordem delas",
                blocks: [
                    {
                        type: "text",
                        value: "# As quatro operações e a ordem delas\n\nDigite $2 + 3 \\times 4$ em duas calculadoras diferentes e você pode ver duas respostas: $20$ em uma mais simples e $14$ em uma científica. Só uma delas segue a convenção que o mundo todo usa em matemática, e é a que vale em prova, em planilha e em qualquer linguagem de programação.\n\nNesta aula vamos apertar dois parafusos que costumam ficar frouxos: o que fazer com os sinais de mais e de menos e em que ordem resolver uma expressão com várias operações.",
                    },
                    {
                        type: "text",
                        value: "## As quatro operações e o nome de cada parte\n\n| Operação | Como se escreve | Nome das partes | Nome do resultado |\n| --- | --- | --- | --- |\n| adição | $7 + 5 = 12$ | parcelas | soma |\n| subtração | $7 - 5 = 2$ | minuendo e subtraendo | diferença |\n| multiplicação | $7 \\times 5 = 35$ | fatores | produto |\n| divisão | $35 \\div 5 = 7$ | dividendo e divisor | quociente |\n\nNa divisão, quando a conta não fecha, sobra um **resto**. Em $17 \\div 5$ o quociente é $3$ e o resto é $2$, porque $5 \\cdot 3 + 2 = 17$. Quando o resto é zero, dizemos que a divisão é **exata**.\n\nA multiplicação também pode ser escrita com um ponto, $7 \\cdot 5$, e a divisão com uma barra de fração, $\\frac{35}{5}$. São as duas formas que mais aparecem daqui para frente.",
                    },
                    {
                        type: "text",
                        value: "## Regra de sinais na multiplicação e na divisão\n\n| Sinais dos dois números | Sinal do resultado | Exemplo |\n| --- | --- | --- |\n| os dois positivos | positivo | $4 \\cdot 3 = 12$ |\n| os dois negativos | positivo | $(-4) \\cdot (-3) = 12$ |\n| um de cada | negativo | $(-4) \\cdot 3 = -12$ |\n| um de cada, na divisão | negativo | $20 \\div (-4) = -5$ |\n\nEm uma frase: **sinais iguais dão resultado positivo, sinais diferentes dão resultado negativo**. A mesma regra serve para multiplicar e para dividir.\n\nE por que dois negativos dão positivo? Leia $(-4) \\cdot (-3)$ como tirar três vezes uma dívida de $4$ reais. Tirar dívida melhora o saldo, então o resultado tem que ser positivo: $12$.",
                    },
                    {
                        type: "text",
                        value: "## Sinais na adição e na subtração\n\nAqui a regra é outra, e misturar as duas é o escorregão mais frequente de todos. O jeito seguro é pensar em andar na reta numérica: somar é andar para a direita, subtrair é andar para a esquerda.\n\n- $-9 + 4$: começo em $-9$ e ando $4$ passos para a direita, chegando em $-5$.\n- $-9 - 4$: começo em $-9$ e ando $4$ passos para a esquerda, chegando em $-13$.\n- $7 - (-3)$: subtrair um número negativo é tirar uma dívida, ou seja, andar para a direita. O resultado é $7 + 3 = 10$.\n\nEsse último caso tem uma forma curta de dizer: **dois sinais de menos seguidos viram um mais**. Vale só quando um sinal está grudado no outro, como em $-(-3)$, e não em $-9 - 4$, onde os dois menos estão separados por um número.",
                    },
                    {
                        type: "text",
                        value: "## A ordem das operações\n\nQuando uma expressão mistura operações diferentes, a convenção é esta, de cima para baixo:\n\n1. o que está dentro de **parênteses**, sempre de dentro para fora;\n2. **potências e raízes**, que vamos estudar com calma mais adiante;\n3. **multiplicações e divisões**, na ordem em que aparecem, da esquerda para a direita;\n4. **adições e subtrações**, também da esquerda para a direita.\n\nRepare que multiplicação e divisão estão no mesmo degrau, e adição e subtração estão em outro degrau, abaixo. Não é que a multiplicação venha antes da divisão: é que as duas vêm antes da soma.\n\nVamos resolver $2 + 3 \\times 4$ com a regra:\n\n$$2 + 3 \\times 4 = 2 + 12 = 14$$\n\nPrimeiro o produto $3 \\times 4 = 12$, depois a soma com o $2$. O resultado é $14$.",
                    },
                    {
                        type: "text",
                        value: "## O erro clássico: resolver da esquerda para a direita\n\nEm $2 + 3 \\times 4$, muita gente soma primeiro, faz $2 + 3 = 5$ e depois $5 \\times 4 = 20$. O caminho parece o natural, porque é assim que lemos uma frase, da esquerda para a direita. Mas a resposta sai $20$ em vez de $14$.\n\nEsse erro não é falta de atenção: é o hábito da leitura brigando com uma convenção que quase nunca foi explicada. O jeito de desarmá-lo é mecânico: antes de começar a contar, circule no papel todas as multiplicações e divisões.\n\nOutro exemplo. Em $20 - 4 \\times 3$, da esquerda para a direita sairia $16 \\times 3 = 48$. Pela regra:\n\n$$20 - 4 \\times 3 = 20 - 12 = 8$$",
                    },
                    {
                        type: "text",
                        value: "## Parênteses, e quando eles mudam tudo\n\nO parêntese existe justamente para quebrar a ordem padrão. Compare as duas expressões, que têm os mesmos três números:\n\n$$2 + 3 \\times 4 = 14 \\qquad (2 + 3) \\times 4 = 20$$\n\nNa segunda, o parêntese obriga a soma a vir primeiro: $2 + 3 = 5$ e depois $5 \\times 4 = 20$. Quer dizer que o resultado $20$ não é errado por si, ele é a resposta de outra expressão.\n\nQuando há parênteses dentro de parênteses, resolvemos de dentro para fora. Para o desenho ficar mais claro, costuma-se trocar o de fora por colchetes. Veja passo a passo:\n\n$$20 - [3 + 2 \\cdot (7 - 4)]$$\n\nPrimeiro o parêntese mais interno, $7 - 4 = 3$. Depois o produto dentro do colchete, $2 \\cdot 3 = 6$. Depois a soma dentro do colchete, $3 + 6 = 9$. Por último a subtração de fora:\n\n$$20 - [3 + 6] = 20 - 9 = 11$$",
                    },
                    {
                        type: "text",
                        value: "## Operações do mesmo degrau: da esquerda para a direita\n\nQuando sobram só operações do mesmo degrau, a ordem de leitura volta a valer. Em $24 \\div 6 \\times 2$ as duas operações estão no mesmo degrau, então resolvemos na ordem em que aparecem:\n\n$$24 \\div 6 \\times 2 = 4 \\times 2 = 8$$\n\nQuem multiplica primeiro, fazendo $6 \\times 2 = 12$, encontra $24 \\div 12 = 2$, que não é o combinado. Se a intenção fosse dividir por $12$, a expressão precisaria do parêntese escrito: $24 \\div (6 \\times 2)$.\n\nO mesmo vale no outro degrau: $10 - 4 + 3$ dá $6 + 3 = 9$, e não $10 - 7 = 3$.",
                    },
                    {
                        type: "quote",
                        value: "Sinais iguais dão produto positivo e sinais diferentes dão produto negativo, mas na adição o que manda é andar na reta. E em qualquer expressão a ordem é parênteses, potências, multiplicação e divisão, e só então adição e subtração.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o valor da expressão $2 + 3 \\times 4$?",
                        difficulty: "facil",
                        options: [
                            { text: "$9$", isCorrect: false },
                            { text: "$24$", isCorrect: false },
                            { text: "$14$", isCorrect: true },
                            { text: "$20$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o resultado de $(-6) \\cdot (-5)$?",
                        difficulty: "facil",
                        options: [
                            { text: "$30$", isCorrect: true },
                            { text: "$-11$", isCorrect: false },
                            { text: "$-30$", isCorrect: false },
                            { text: "$11$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $7 - (-3) + (-5)$?",
                        difficulty: "medio",
                        options: [
                            { text: "$9$", isCorrect: false },
                            { text: "$15$", isCorrect: false },
                            { text: "$5$", isCorrect: true },
                            { text: "$-1$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $24 \\div 6 \\times 2$?",
                        difficulty: "medio",
                        options: [
                            { text: "$2$", isCorrect: false },
                            { text: "$8$", isCorrect: true },
                            { text: "$6$", isCorrect: false },
                            { text: "$4$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $20 - [3 + 2 \\cdot (7 - 4)]$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$11$", isCorrect: true },
                            { text: "$23$", isCorrect: false },
                            { text: "$9$", isCorrect: false },
                            { text: "$5$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Divisibilidade, fatores primos, MMC e MDC",
                blocks: [
                    {
                        type: "text",
                        value: "# Divisibilidade, fatores primos, MMC e MDC\n\nDuas perguntas bem concretas. Dois ônibus saem juntos de um terminal, um volta a cada $12$ minutos e o outro a cada $18$: quando eles saem juntos outra vez? E se você tem $48$ balas e $36$ chocolates, qual é o maior número de sacolinhas iguais que dá para montar sem sobrar nada?\n\nAs duas se resolvem olhando para o que os números têm em comum por dentro. Nesta aula vamos abrir os números em pedaços, descobrir quem divide quem e usar isso para responder as duas perguntas.",
                    },
                    {
                        type: "text",
                        value: "## Divisor, múltiplo e divisão exata\n\nUma divisão é **exata** quando o resto é zero. Quando $48 \\div 6 = 8$ sem sobrar nada, dizemos duas coisas ao mesmo tempo:\n\n- $6$ é **divisor** de $48$, porque cabe nele um número exato de vezes;\n- $48$ é **múltiplo** de $6$, porque é $6$ vezes algum inteiro.\n\nOs múltiplos de $6$ são $6$, $12$, $18$, $24$, $30$, e seguem sem fim. Os divisores de $48$ são poucos e dá para listar todos: $1$, $2$, $3$, $4$, $6$, $8$, $12$, $16$, $24$ e $48$.\n\nGuarde a diferença, porque trocar os dois nomes é comum: múltiplo é para cima e não acaba, divisor é para baixo e acaba.",
                    },
                    {
                        type: "text",
                        value: "## Critérios de divisibilidade\n\nDá para saber se uma divisão vai ser exata sem fazer a conta. Estes são os critérios mais úteis:\n\n| Divisível por | Critério | Teste com $4536$ |\n| --- | --- | --- |\n| $2$ | termina em $0$, $2$, $4$, $6$ ou $8$ | termina em $6$, passa |\n| $3$ | a soma dos algarismos é divisível por $3$ | $4 + 5 + 3 + 6 = 18$, passa |\n| $4$ | os dois últimos algarismos formam múltiplo de $4$ | $36$ é múltiplo de $4$, passa |\n| $5$ | termina em $0$ ou em $5$ | termina em $6$, não passa |\n| $6$ | é divisível por $2$ e por $3$ ao mesmo tempo | passa nos dois, passa |\n| $9$ | a soma dos algarismos é divisível por $9$ | $18$ é múltiplo de $9$, passa |\n| $10$ | termina em $0$ | termina em $6$, não passa |\n\nO critério do $3$ e o do $9$ costumam causar estranheza, porque parece mágica somar algarismos. Não é truque de salão: ele sai do fato de que $10$ deixa resto $1$ na divisão por $3$ e por $9$, e por isso cada algarismo pesa o mesmo, qualquer que seja a casa em que ele esteja.",
                    },
                    {
                        type: "text",
                        value: "## Número primo e número composto\n\nUm inteiro maior que $1$ é **primo** quando tem exatamente dois divisores: o $1$ e ele mesmo. Se tiver mais que isso, é **composto**.\n\nOs primos até $30$ são $2$, $3$, $5$, $7$, $11$, $13$, $17$, $19$, $23$ e $29$.\n\nO $2$ é o único primo par, porque qualquer outro par já tem o $2$ como divisor além do $1$ e de si mesmo. E o $1$ não é primo nem composto: ele tem um único divisor, ele mesmo.\n\nPara testar se $17$ é primo, basta tentar os primos pequenos: $2$ não divide (é ímpar), $3$ não divide (a soma dos algarismos é $8$) e com o $5$ já podemos parar, porque $5 \\cdot 5 = 25$ passa de $17$. Então $17$ é primo. Já $21$ é composto, porque $21 = 3 \\cdot 7$.",
                    },
                    {
                        type: "text",
                        value: "## Decomposição em fatores primos\n\nTodo número composto pode ser escrito como uma multiplicação de primos, e de um único jeito. Essa escrita é a **decomposição em fatores primos**, também chamada de fatoração.\n\nO método é dividir pelo menor primo possível, repetir com o resultado e parar no $1$. Para $60$:\n\n| Número | Dividido pelo primo | Resultado |\n| --- | --- | --- |\n| $60$ | $2$ | $30$ |\n| $30$ | $2$ | $15$ |\n| $15$ | $3$ | $5$ |\n| $5$ | $5$ | $1$ |\n\nOs primos da coluna do meio formam o produto:\n\n$$60 = 2 \\cdot 2 \\cdot 3 \\cdot 5 = 2^2 \\cdot 3 \\cdot 5$$\n\nO expoente $2$ em $2^2$ é só uma forma curta de dizer que o fator $2$ apareceu duas vezes. Do mesmo jeito, $48 = 2^4 \\cdot 3$ e $36 = 2^2 \\cdot 3^2$. Confira multiplicando de volta, que é o melhor jeito de ganhar confiança nessas contas.",
                    },
                    {
                        type: "text",
                        value: "## MDC: o maior divisor comum\n\nO **máximo divisor comum** (MDC) de dois números é o maior número que divide os dois ao mesmo tempo. Com as decomposições na mão, a receita é: **multiplicar os fatores primos que aparecem nos dois, cada um com o menor expoente**.\n\nVoltando às sacolinhas, com $48$ balas e $36$ chocolates:\n\n$$48 = 2^4 \\cdot 3 \\qquad 36 = 2^2 \\cdot 3^2$$\n\nO fator $2$ aparece nos dois, e o menor expoente dele é $2$. O fator $3$ também aparece nos dois, com menor expoente $1$. Então o MDC vale $2^2 \\cdot 3 = 12$.\n\nDá para montar $12$ sacolinhas iguais, cada uma com $4$ balas, porque $48 \\div 12 = 4$, e $3$ chocolates, porque $36 \\div 12 = 3$. Qualquer outro divisor comum, como $6$, também fecha sem sobra, mas dá menos sacolinhas.",
                    },
                    {
                        type: "text",
                        value: "## MMC: o menor múltiplo comum\n\nO **mínimo múltiplo comum** (MMC) de dois números é o menor número, fora do zero, que é múltiplo dos dois. A receita é quase a mesma, com duas palavras trocadas: **multiplicar todos os fatores primos que aparecem, cada um com o maior expoente**.\n\nOs ônibus, um a cada $12$ minutos e o outro a cada $18$:\n\n$$12 = 2^2 \\cdot 3 \\qquad 18 = 2 \\cdot 3^2$$\n\nOs fatores que aparecem são $2$, com maior expoente $2$, e $3$, com maior expoente $2$. Então o MMC vale $2^2 \\cdot 3^2 = 36$: eles voltam a sair juntos depois de $36$ minutos. Nesse tempo, o primeiro fez $3$ voltas e o segundo fez $2$.\n\nVale guardar uma relação que economiza conta: para dois números, o produto do MDC pelo MMC é igual ao produto dos próprios números. Com $12$ e $18$, o MDC é $6$, o MMC é $36$, e de fato $6 \\cdot 36 = 216 = 12 \\cdot 18$.",
                    },
                    {
                        type: "text",
                        value: "## O erro comum: trocar o MMC pelo MDC\n\nAs duas siglas são parecidas e aparecem em problemas do mesmo tamanho, então é normal pegar uma pensando na outra. O que decide é a pergunta, não os números:\n\n| O enunciado fala de | O que procurar | Por quê |\n| --- | --- | --- |\n| juntos de novo, ao mesmo tempo, encontro, volta a coincidir | MMC | você procura um múltiplo dos dois |\n| repartir em partes iguais, o maior pedaço possível, sem sobra | MDC | você procura um divisor dos dois |\n\nE há um teste de sanidade que pega quase todo engano: o MDC nunca é maior que o menor dos dois números, e o MMC nunca é menor que o maior dos dois. Se alguém encontrar $144$ para o MDC de $48$ e $36$, o próprio tamanho do resultado já entrega a troca.",
                    },
                    {
                        type: "quote",
                        value: "Decompor em fatores primos é o que destrava os dois cálculos: o MDC junta os fatores comuns com o menor expoente e responde a quem reparte em partes iguais, e o MMC junta todos os fatores com o maior expoente e responde a quem quer saber quando dois ciclos se encontram.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual destes números é primo?",
                        difficulty: "facil",
                        options: [
                            { text: "$21$", isCorrect: false },
                            { text: "$17$", isCorrect: true },
                            { text: "$15$", isCorrect: false },
                            { text: "$27$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual destes números é divisível por $3$?",
                        difficulty: "facil",
                        options: [
                            { text: "$122$", isCorrect: false },
                            { text: "$124$", isCorrect: false },
                            { text: "$125$", isCorrect: false },
                            { text: "$123$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A decomposição de $60$ em fatores primos é:",
                        difficulty: "medio",
                        options: [
                            { text: "$4 \\cdot 3 \\cdot 5$", isCorrect: false },
                            { text: "$2^2 \\cdot 3 \\cdot 5$", isCorrect: true },
                            { text: "$2^2 \\cdot 3^2 \\cdot 5$", isCorrect: false },
                            { text: "$2 \\cdot 3 \\cdot 10$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Dois ônibus saem juntos de um terminal. Um volta a cada $12$ minutos e o outro a cada $18$ minutos. Depois de quantos minutos eles voltam a sair juntos?",
                        difficulty: "medio",
                        options: [
                            { text: "$216$", isCorrect: false },
                            { text: "$30$", isCorrect: false },
                            { text: "$36$", isCorrect: true },
                            { text: "$6$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um marceneiro tem duas tábuas, uma de $48$ cm e outra de $36$ cm. Ele quer cortar as duas em pedaços iguais, do maior tamanho possível, sem deixar sobra. Qual é o tamanho de cada pedaço e quantos pedaços ele obtém no total?",
                        difficulty: "dificil",
                        options: [
                            { text: "$6$ cm, com $14$ pedaços", isCorrect: false },
                            { text: "$12$ cm, com $7$ pedaços", isCorrect: true },
                            { text: "$144$ cm, com $7$ pedaços", isCorrect: false },
                            { text: "$12$ cm, com $4$ pedaços", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Frações: o que elas representam",
                blocks: [
                    {
                        type: "text",
                        value: "# Frações: o que elas representam\n\nMeia hora. Três quartos de litro. Um terço do salário. A fração aparece em toda conversa em que algo é dividido e não cabe em número inteiro. Mesmo assim, muita gente passou pela escola decorando regras de fração sem nunca ter visto o desenho por trás delas, e aí tudo parece arbitrário.\n\nNesta aula vamos sem pressa: o que a fração representa, quando duas frações diferentes valem o mesmo, como deixar uma fração na forma mais enxuta e como decidir qual de duas frações é a maior.",
                    },
                    {
                        type: "text",
                        value: "## Numerador e denominador\n\nImagine uma barra de chocolate repartida em $4$ pedaços iguais. Se você come $3$ deles, comeu $\\frac{3}{4}$ da barra, que se lê três quartos.\n\nNa escrita $\\frac{3}{4}$, cada número tem nome e papel:\n\n- o de baixo, $4$, é o **denominador**: diz em quantas partes iguais o todo foi dividido;\n- o de cima, $3$, é o **numerador**: diz quantas dessas partes você tomou.\n\nA ordem importa, e não é capricho de notação: $\\frac{3}{4}$ de uma barra é quase a barra toda, enquanto $\\frac{4}{3}$ é mais do que uma barra inteira.\n\nGuarde também esta ideia, que volta várias vezes: o denominador é quem dá o tamanho do pedaço, e quanto maior ele é, menor fica cada pedaço. Dividir uma pizza entre $8$ pessoas dá fatia menor do que dividir entre $4$.",
                    },
                    {
                        type: "text",
                        value: "## Fração também é divisão\n\nA barra da fração é um sinal de divisão. Escrever $\\frac{3}{4}$ é o mesmo que escrever $3 \\div 4$.\n\nIsso tem um sentido bem concreto: se $3$ pizzas vão ser repartidas entre $4$ pessoas, cada uma recebe $\\frac{3}{4}$ de pizza. Dá no mesmo cortar cada pizza em $4$ fatias, o que forma $12$ fatias, e entregar $3$ fatias para cada pessoa.\n\nDessa leitura saem duas consequências úteis. A primeira: todo número inteiro é uma fração de denominador $1$, porque $5 = \\frac{5}{1}$, já que $5 \\div 1 = 5$. A segunda: o denominador nunca pode ser zero, porque repartir algo em zero partes não quer dizer nada.",
                    },
                    {
                        type: "text",
                        value: "## Frações equivalentes\n\nMetade de uma barra é a mesma coisa que dois quartos dela. Se você cortar cada uma das duas metades em duas, passa a ter $4$ pedaços e fica com $2$ deles. Mudou a escrita, não a quantidade:\n\n$$\\frac{1}{2} = \\frac{2}{4} = \\frac{5}{10} = \\frac{50}{100}$$\n\nFrações que representam a mesma quantidade são **equivalentes**. Para obter uma equivalente, basta **multiplicar ou dividir numerador e denominador pelo mesmo número**, desde que esse número não seja zero.\n\nPor exemplo, para escrever $\\frac{2}{3}$ com denominador $12$: como $3 \\cdot 4 = 12$, fazemos o mesmo em cima, $2 \\cdot 4 = 8$, e chegamos a $\\frac{2}{3} = \\frac{8}{12}$.\n\nO que não funciona é mexer em um dos termos só, nem somar o mesmo número nos dois. Repare que $\\frac{1}{2}$ e $\\frac{1 + 1}{2 + 1} = \\frac{2}{3}$ não são iguais, porque meio é menor que dois terços. Equivalência vem de multiplicar e dividir, nunca de somar.",
                    },
                    {
                        type: "text",
                        value: "## Simplificar até a forma irredutível\n\nSimplificar é andar no sentido contrário: dividir numerador e denominador pelo mesmo número para chegar na escrita mais enxuta. Quando não sobra nenhum divisor comum além do $1$, a fração está na **forma irredutível**.\n\nVamos simplificar $\\frac{36}{48}$. O maior número que divide os dois é o MDC, que vale $12$:\n\n$$\\frac{36}{48} = \\frac{36 \\div 12}{48 \\div 12} = \\frac{3}{4}$$\n\nSe você não enxergar o MDC de primeira, não há problema algum: dá para simplificar aos poucos. Dividindo por $2$, fica $\\frac{18}{24}$; por $2$ outra vez, $\\frac{9}{12}$; por $3$, $\\frac{3}{4}$. O destino é o mesmo, só com mais passos no caminho.",
                    },
                    {
                        type: "text",
                        value: "## Comparando frações\n\nCom o **mesmo denominador**, a comparação é direta: os pedaços têm o mesmo tamanho, então quem tem mais pedaços é maior. Logo $\\frac{5}{8} > \\frac{3}{8}$.\n\nCom o **mesmo numerador**, vale o contrário: quanto maior o denominador, menor o pedaço. Logo $\\frac{1}{3} > \\frac{1}{5}$, mesmo que $5$ seja maior que $3$. Esse é um dos tropeços mais comuns com fração, e ele vem de ler o denominador como se fosse quantidade, quando na verdade ele é tamanho de pedaço.\n\nQuando numerador e denominador são todos diferentes, reescrevemos as duas frações com um denominador comum, em geral o MMC dos denominadores. Comparando $\\frac{3}{5}$ e $\\frac{5}{8}$, o MMC de $5$ e $8$ é $40$:\n\n$$\\frac{3}{5} = \\frac{24}{40} \\qquad \\frac{5}{8} = \\frac{25}{40}$$\n\nAgora é só olhar os numeradores: $24 < 25$, então $\\frac{3}{5} < \\frac{5}{8}$. As duas são bem parecidas em tamanho, e é justamente nesses casos que o chute visual falha e a conta resolve.",
                    },
                    {
                        type: "text",
                        value: "## Fração própria, imprópria e número misto\n\nDuas palavras para classificar o que já sabemos ler:\n\n- **própria**: o numerador é menor que o denominador, e a fração vale menos que $1$. Exemplo: $\\frac{3}{4}$.\n- **imprópria**: o numerador é maior ou igual ao denominador, e a fração vale $1$ ou mais. Exemplo: $\\frac{7}{3}$.\n\nToda fração imprópria pode ser escrita como um inteiro mais uma fração própria, e essa escrita se chama **número misto**. Para converter $\\frac{7}{3}$, faça a divisão $7 \\div 3$: o quociente é $2$ e o resto é $1$. O quociente vira a parte inteira, o resto vira o novo numerador e o denominador não muda:\n\n$$\\frac{7}{3} = 2\\frac{1}{3}$$\n\nLeia como dois inteiros e um terço. Para voltar, multiplique a parte inteira pelo denominador e some o numerador: $2 \\cdot 3 + 1 = 7$, logo $2\\frac{1}{3} = \\frac{7}{3}$.\n\nNenhuma das duas formas é mais correta que a outra. A imprópria é melhor para calcular, e a mista é melhor para enxergar o tamanho: dois inteiros e um terço de pizza dá uma imagem que $\\frac{7}{3}$ não dá.",
                    },
                    {
                        type: "quote",
                        value: "O denominador diz em quantas partes o todo foi repartido e o numerador diz quantas delas você tomou. Multiplicar ou dividir os dois termos pelo mesmo número gera frações equivalentes, e é isso que permite simplificar e comparar frações de denominadores diferentes.",
                    },
                ],
                questions: [
                    {
                        statement: "Na fração $\\frac{3}{8}$, o número $8$ recebe o nome de:",
                        difficulty: "facil",
                        options: [
                            { text: "quociente", isCorrect: false },
                            { text: "denominador", isCorrect: true },
                            { text: "fator primo", isCorrect: false },
                            { text: "numerador", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual das frações a seguir é equivalente a $\\frac{1}{2}$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{10}{5}$", isCorrect: false },
                            { text: "$\\frac{1}{4}$", isCorrect: false },
                            { text: "$\\frac{2}{5}$", isCorrect: false },
                            { text: "$\\frac{5}{10}$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual é a forma irredutível da fração $\\frac{36}{48}$?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{6}{8}$", isCorrect: false },
                            { text: "$\\frac{3}{4}$", isCorrect: true },
                            { text: "$\\frac{18}{24}$", isCorrect: false },
                            { text: "$\\frac{4}{3}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A fração $\\frac{7}{3}$, escrita como número misto, fica:",
                        difficulty: "medio",
                        options: [
                            { text: "$3\\frac{1}{2}$", isCorrect: false },
                            { text: "$2\\frac{1}{7}$", isCorrect: false },
                            { text: "$2\\frac{1}{3}$", isCorrect: true },
                            { text: "$2\\frac{3}{1}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual destas frações é a maior?",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\frac{7}{12}$", isCorrect: false },
                            { text: "$\\frac{5}{8}$", isCorrect: false },
                            { text: "$\\frac{3}{5}$", isCorrect: false },
                            { text: "$\\frac{2}{3}$", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Operações com frações",
                blocks: [
                    {
                        type: "text",
                        value: "# Operações com frações\n\nUma receita pede $\\frac{1}{2}$ xícara de leite e, mais adiante, outra $\\frac{1}{3}$ de xícara. Quanto leite vai na tigela no total? A resposta não é $\\frac{2}{5}$, e entender por que não é já resolve metade dos problemas que as pessoas têm com fração.\n\nNesta aula vamos fazer as quatro operações com fração, uma por vez, sempre com um exemplo numérico levado até o fim, e no final aplicar a ordem das operações a expressões com fração.",
                    },
                    {
                        type: "text",
                        value: "## Soma e subtração com o mesmo denominador\n\nQuando os denominadores são iguais, os pedaços têm o mesmo tamanho, então basta contar quantos pedaços você tem no total. O denominador não muda, porque o tamanho do pedaço não mudou:\n\n$$\\frac{2}{7} + \\frac{3}{7} = \\frac{5}{7}$$\n\nDois sétimos mais três sétimos são cinco sétimos, do mesmo jeito que duas fatias mais três fatias são cinco fatias. A subtração segue a mesma ideia: $\\frac{5}{9} - \\frac{2}{9} = \\frac{3}{9}$, que simplificado dá $\\frac{1}{3}$.\n\nVale sempre conferir se o resultado pode ser simplificado, como nesse caso, mas repare que a conta em si já estava certa antes da simplificação.",
                    },
                    {
                        type: "text",
                        value: "## O erro clássico: somar em cima e embaixo\n\nVoltando à receita: $\\frac{1}{2} + \\frac{1}{3}$. É muito comum somar os de cima, somar os de baixo e escrever $\\frac{2}{5}$. O caminho parece simétrico e é mais ou menos o que a multiplicação vai fazer logo adiante, então o erro tem lógica, não é falta de cuidado.\n\nSó que ele não sobrevive a um teste simples de tamanho: $\\frac{2}{5}$ é **menor** que $\\frac{1}{2}$, e não faz sentido que acrescentar leite dê menos leite do que já havia. Sempre que uma soma resultar em algo menor que uma das parcelas, há erro na conta.\n\nA raiz do problema é que $\\frac{1}{2}$ e $\\frac{1}{3}$ têm pedaços de tamanhos diferentes. Não se somam coisas de tamanhos diferentes sem antes igualar o tamanho, assim como não se somam $2$ metros com $30$ centímetros sem converter uma das medidas.",
                    },
                    {
                        type: "text",
                        value: "## Soma e subtração com denominadores diferentes\n\nIgualar o tamanho dos pedaços é trocar as duas frações por equivalentes com o mesmo denominador, em geral o MMC dos denominadores. Para $\\frac{1}{2} + \\frac{1}{3}$, o MMC de $2$ e $3$ é $6$:\n\n$$\\frac{1}{2} = \\frac{3}{6} \\qquad \\frac{1}{3} = \\frac{2}{6}$$\n\n$$\\frac{1}{2} + \\frac{1}{3} = \\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$$\n\nCinco sextos de xícara, um pouco menos que uma xícara cheia, que é exatamente o tamanho que a gente espera ao olhar a receita.\n\nA subtração funciona igual. Em $\\frac{3}{4} - \\frac{2}{5}$, o MMC de $4$ e $5$ é $20$:\n\n$$\\frac{3}{4} - \\frac{2}{5} = \\frac{15}{20} - \\frac{8}{20} = \\frac{7}{20}$$\n\nO único passo novo em relação ao caso anterior é a conversão, e ela é a mesma coisa que já fizemos com frações equivalentes.",
                    },
                    {
                        type: "text",
                        value: "## Multiplicação\n\nEsta é a mais direta das quatro operações: **multiplica-se numerador por numerador e denominador por denominador**, sem precisar de denominador comum.\n\n$$\\frac{3}{4} \\cdot \\frac{2}{5} = \\frac{3 \\cdot 2}{4 \\cdot 5} = \\frac{6}{20} = \\frac{3}{10}$$\n\nRepare em algo que contraria a intuição de quem só multiplicou inteiros até aqui: o resultado, $\\frac{3}{10}$, é menor que as duas frações que entraram. Multiplicar por um número menor que $1$ sempre diminui, porque você está tomando uma parte de uma parte.\n\nDá para simplificar antes de multiplicar, cortando um fator de cima com um de baixo, e isso mantém as contas pequenas. Em $\\frac{2}{3} \\cdot \\frac{9}{10}$, o $2$ e o $10$ se dividem por $2$, o $3$ e o $9$ se dividem por $3$, e sobra $\\frac{1}{1} \\cdot \\frac{3}{5} = \\frac{3}{5}$.",
                    },
                    {
                        type: "text",
                        value: "## Fração de uma quantidade e fração de fração\n\nNa linguagem do dia a dia, a palavra de entre duas quantidades é uma multiplicação. Três quartos de $80$ reais é $\\frac{3}{4} \\cdot 80$.\n\nPara multiplicar fração por inteiro, escreva o inteiro como fração de denominador $1$:\n\n$$\\frac{3}{4} \\cdot \\frac{80}{1} = \\frac{240}{4} = 60$$\n\nTrês quartos de $80$ reais são $60$ reais. Confere com o caminho de cabeça: um quarto de $80$ é $20$, e três quartos são três vezes isso.\n\nA mesma leitura vale para fração de fração. A metade de um terço é:\n\n$$\\frac{1}{2} \\cdot \\frac{1}{3} = \\frac{1}{6}$$\n\nE o desenho explica: se você parte cada um dos três pedaços em dois, passa a ter seis pedaços, e está com um deles na mão.",
                    },
                    {
                        type: "text",
                        value: "## Divisão: multiplicar pelo inverso\n\nO **inverso** de uma fração é ela de cabeça para baixo: o inverso de $\\frac{2}{5}$ é $\\frac{5}{2}$. Dividir por uma fração é o mesmo que multiplicar pelo inverso dela:\n\n$$\\frac{3}{4} \\div \\frac{2}{5} = \\frac{3}{4} \\cdot \\frac{5}{2} = \\frac{15}{8}$$\n\nPor que isso funciona? A pergunta quanto é $\\frac{3}{4}$ dividido por $\\frac{2}{5}$ é a mesma pergunta quantas vezes $\\frac{2}{5}$ cabe em $\\frac{3}{4}$. Como $\\frac{2}{5}$ é menor que $\\frac{3}{4}$, a resposta tem que ser maior que $1$, e $\\frac{15}{8}$ é quase $2$. Se tivesse saído menos que $1$, o alerta já estaria aceso.\n\nO detalhe que mais derruba gente aqui é inverter a fração errada. Quem inverte a primeira encontra $\\frac{4}{3} \\cdot \\frac{2}{5} = \\frac{8}{15}$, que é justamente o inverso da resposta certa. **Inverte-se sempre a segunda**, a que divide.\n\nA divisão também aparece escrita como uma fração de duas frações, e é a mesma conta:\n\n$$\\frac{\\frac{1}{2}}{\\frac{3}{4}} = \\frac{1}{2} \\cdot \\frac{4}{3} = \\frac{4}{6} = \\frac{2}{3}$$",
                    },
                    {
                        type: "text",
                        value: "## A ordem das operações com fração\n\nA ordem é a mesma de sempre, e não muda só porque os números passaram a ser frações: primeiro o que está em parênteses, depois multiplicação e divisão, e por último adição e subtração.\n\nEm $\\frac{1}{2} + \\frac{1}{3} \\cdot \\frac{3}{4}$, o produto vem antes:\n\n$$\\frac{1}{3} \\cdot \\frac{3}{4} = \\frac{3}{12} = \\frac{1}{4}$$\n\n$$\\frac{1}{2} + \\frac{1}{4} = \\frac{2}{4} + \\frac{1}{4} = \\frac{3}{4}$$\n\nCom o parêntese, a conta é outra. Em $(\\frac{1}{2} + \\frac{1}{3}) \\cdot \\frac{3}{4}$ a soma vem primeiro:\n\n$$(\\frac{1}{2} + \\frac{1}{3}) \\cdot \\frac{3}{4} = \\frac{5}{6} \\cdot \\frac{3}{4} = \\frac{15}{24} = \\frac{5}{8}$$\n\nMesmos três números, resultados diferentes: $\\frac{3}{4}$ sem o parêntese e $\\frac{5}{8}$ com ele. Em expressão com fração vale a mesma precaução de antes: localize os produtos e as divisões antes de somar qualquer coisa.",
                    },
                    {
                        type: "quote",
                        value: "Para somar ou subtrair fração é preciso antes igualar os denominadores; para multiplicar, basta multiplicar em cima e embaixo; e para dividir, multiplica-se pelo inverso da segunda fração. A ordem das operações continua valendo igual, com parênteses e produto antes da soma.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o resultado de $\\frac{2}{7} + \\frac{3}{7}$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{5}{7}$", isCorrect: true },
                            { text: "$\\frac{5}{14}$", isCorrect: false },
                            { text: "$\\frac{6}{7}$", isCorrect: false },
                            { text: "$\\frac{5}{49}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o resultado de $\\frac{3}{4} \\cdot \\frac{2}{5}$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{3}{10}$", isCorrect: true },
                            { text: "$\\frac{15}{8}$", isCorrect: false },
                            { text: "$\\frac{3}{20}$", isCorrect: false },
                            { text: "$\\frac{5}{9}$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma receita pede $\\frac{1}{2}$ xícara de leite e depois mais $\\frac{1}{3}$ de xícara. Quanto leite vai na tigela no total?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{1}{6}$", isCorrect: false },
                            { text: "$\\frac{2}{6}$", isCorrect: false },
                            { text: "$\\frac{5}{6}$", isCorrect: true },
                            { text: "$\\frac{2}{5}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o resultado de $\\frac{3}{4} \\div \\frac{2}{5}$?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{8}{15}$", isCorrect: false },
                            { text: "$\\frac{10}{3}$", isCorrect: false },
                            { text: "$\\frac{3}{10}$", isCorrect: false },
                            { text: "$\\frac{15}{8}$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Qual é o valor de $\\frac{1}{2} + \\frac{1}{3} \\cdot \\frac{3}{4}$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\frac{3}{4}$", isCorrect: true },
                            { text: "$\\frac{7}{12}$", isCorrect: false },
                            { text: "$\\frac{5}{8}$", isCorrect: false },
                            { text: "$\\frac{1}{4}$", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Decimais, porcentagem e proporção",
        aulas: [
            {
                titulo: "Números decimais e as operações com eles",
                blocks: [
                    {
                        type: "text",
                        value: "# Números decimais e as operações com eles\n\nO preço na gôndola diz $4{,}79$, a bomba de combustível marca $32{,}5$ litros, a balança do açougue mostra $0{,}350$ kg. O número decimal é a forma que o dia a dia escolheu para falar de parte de um inteiro. Nesta aula vamos operar com ele sem errar a casa da vírgula, que é onde quase todo erro de conta de supermercado nasce.",
                    },
                    {
                        type: "text",
                        value: "## O que cada casa depois da vírgula vale\n\nA vírgula separa a parte inteira da parte decimal. À direita dela, cada casa vale dez vezes menos que a anterior:\n\n| Casa | Valor | Em fração |\n| --- | --- | --- |\n| décimo | $0{,}1$ | $\\frac{1}{10}$ |\n| centésimo | $0{,}01$ | $\\frac{1}{100}$ |\n| milésimo | $0{,}001$ | $\\frac{1}{1000}$ |\n\nNo número $3{,}472$ existem $3$ inteiros, $4$ décimos, $7$ centésimos e $2$ milésimos:\n\n$$3{,}472 = 3 + \\frac{4}{10} + \\frac{7}{100} + \\frac{2}{1000}$$\n\nUma consequência prática: **acrescentar zero no fim não muda o valor**. Vale $0{,}35 = 0{,}350$, do mesmo jeito que $\\frac{35}{100} = \\frac{350}{1000}$. Esse zero inofensivo vai ser o nosso aliado na comparação e na soma.",
                    },
                    {
                        type: "text",
                        value: "## Comparando decimais\n\nMuita gente compara $0{,}7$ com $0{,}65$ e diz que $0{,}65$ é maior, porque $65$ é maior que $7$. Isso falha porque os algarismos depois da vírgula não formam um número inteiro: eles são décimos, centésimos e assim por diante.\n\nO jeito seguro é **igualar a quantidade de casas com zeros** e só então comparar:\n\n$$0{,}7 = 0{,}70 \\quad \\text{e} \\quad 0{,}70 > 0{,}65$$\n\nSão $70$ centésimos contra $65$ centésimos. Para ordenar $2{,}5$, $2{,}45$ e $2{,}508$, escrevemos $2{,}500$, $2{,}450$ e $2{,}508$, e a ordem aparece sozinha: $2{,}45 < 2{,}5 < 2{,}508$.",
                    },
                    {
                        type: "text",
                        value: "## Soma e subtração: vírgula embaixo de vírgula\n\nPara somar ou subtrair, alinhe as vírgulas e complete com zeros à direita, para que cada casa encontre a sua. Somando $12{,}75$ com $3{,}4$:\n\n$$12{,}75 + 3{,}40 = 16{,}15$$\n\nO erro clássico é alinhar os números pela direita, como se fossem inteiros, e acabar somando $75$ centésimos com $4$ centésimos. Na subtração vale a mesma disciplina. Pagando uma conta de $37{,}80$ com uma nota de $50$ reais, o troco é\n\n$$50{,}00 - 37{,}80 = 12{,}20$$",
                    },
                    {
                        type: "text",
                        value: "## Multiplicação: conte as casas decimais\n\nMultiplique como se não houvesse vírgula nenhuma e, no fim, dê ao resultado tantas casas decimais quantas os dois fatores têm juntos. Em $3{,}5 \\times 2{,}4$, cada fator tem uma casa, então o resultado tem duas:\n\n$$35 \\times 24 = 840 \\quad \\text{e} \\quad 3{,}5 \\times 2{,}4 = 8{,}40 = 8{,}4$$\n\nNo posto, $32{,}5$ litros a $5{,}80$ por litro custam\n\n$$32{,}5 \\times 5{,}80 = 188{,}50$$\n\nAtenção a um fato que incomoda a intuição: multiplicar por um número menor que $1$ **diminui** o valor. Um produto de $200$ reais com fator $0{,}9$ vira $200 \\times 0{,}9 = 180$ reais. Quem acha que multiplicar sempre aumenta desconfia da própria conta nesse ponto.",
                    },
                    {
                        type: "text",
                        value: "## Divisão: tire a vírgula do divisor\n\nDividir por um número com vírgula incomoda, então **multiplicamos dividendo e divisor pela mesma potência de dez** até o divisor ficar inteiro. O quociente não muda, pelo mesmo motivo que ampliar uma fração não muda o seu valor:\n\n$$7{,}5 \\div 0{,}25 = 750 \\div 25 = 30$$\n\nE faz sentido: cabem $30$ pedaços de $0{,}25$ dentro de $7{,}5$. Repare que o resultado ficou **maior** que o dividendo, porque dividir por um número menor que $1$ aumenta.\n\nQuando o divisor já é inteiro, basta dividir e manter a vírgula na posição. Uma conta de restaurante de $48{,}60$ dividida por $4$ pessoas dá $12{,}15$ para cada uma.",
                    },
                    {
                        type: "text",
                        value: "## Multiplicar e dividir por dez: a vírgula caminha\n\nComo cada casa vale dez vezes a seguinte, multiplicar por $10$, $100$ ou $1000$ apenas empurra a vírgula para a direita, uma casa por zero, e dividir empurra para a esquerda. Quando falta casa, completa-se com zero:\n\n| Conta | Resultado |\n| --- | --- |\n| $4{,}37 \\times 10$ | $43{,}7$ |\n| $4{,}37 \\times 100$ | $437$ |\n| $4{,}37 \\div 10$ | $0{,}437$ |\n| $4{,}37 \\div 1000$ | $0{,}00437$ |\n\nEsse atalho é o que permite converter unidades de cabeça, como passar $1{,}5$ metro para $150$ centímetros, ou ler no rótulo que $750$ mililitros são $0{,}75$ litro.",
                    },
                    {
                        type: "quote",
                        value: "A vírgula marca onde começam os décimos, e toda operação com decimal se resolve respeitando o valor de cada casa: igualar casas com zeros para comparar, alinhar vírgulas para somar, contar casas para multiplicar, tirar a vírgula do divisor para dividir, e deixar a vírgula caminhar ao multiplicar ou dividir por potências de dez.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual das comparações entre números decimais está correta?",
                        difficulty: "facil",
                        options: [
                            { text: "$0{,}3 > 0{,}30$", isCorrect: false },
                            { text: "$0{,}65 > 0{,}7$", isCorrect: false },
                            { text: "$0{,}7 > 0{,}65$", isCorrect: true },
                            { text: "$1{,}5 < 1{,}45$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Multiplicando $4{,}37$ por $100$, o resultado é:",
                        difficulty: "facil",
                        options: [
                            { text: "$43{,}7$", isCorrect: false },
                            { text: "$437$", isCorrect: true },
                            { text: "$0{,}0437$", isCorrect: false },
                            { text: "$4\\,370$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma conta de $37{,}80$ foi paga com uma nota de $50$ reais. O troco é:",
                        difficulty: "medio",
                        options: [
                            { text: "$13{,}20$", isCorrect: false },
                            { text: "$12{,}80$", isCorrect: false },
                            { text: "$12{,}20$", isCorrect: true },
                            { text: "$22{,}20$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "No posto, um motorista colocou $32{,}5$ litros a $5{,}80$ reais por litro. O valor pago foi:",
                        difficulty: "medio",
                        options: [
                            { text: "$18{,}85$", isCorrect: false },
                            { text: "$1\\,885{,}00$", isCorrect: false },
                            { text: "$188{,}50$", isCorrect: true },
                            { text: "$188{,}05$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Cada bolo leva $0{,}75$ kg de farinha. Com um pacote de $5$ kg, quantos bolos completos é possível fazer e quanta farinha sobra?",
                        difficulty: "dificil",
                        options: [
                            { text: "$6$ bolos e sobram $0{,}75$ kg", isCorrect: false },
                            { text: "$7$ bolos e sobram $0{,}5$ kg", isCorrect: false },
                            { text: "$6$ bolos e sobram $0{,}5$ kg", isCorrect: true },
                            { text: "$6$ bolos e nada sobra do pacote", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Passando de fração para decimal e de volta",
                blocks: [
                    {
                        type: "text",
                        value: "# Passando de fração para decimal e de volta\n\nA calculadora mostra $0{,}375$ onde você escreveu $\\frac{3}{8}$, e mostra uma fileira de três onde você escreveu $\\frac{1}{3}$. As duas escritas falam do mesmo número, e nesta aula vamos trocar de uma para a outra nos dois sentidos, inclusive quando a parte decimal não termina nunca.",
                    },
                    {
                        type: "text",
                        value: "## De fração para decimal é só dividir\n\nA barra de fração é um sinal de divisão. Para escrever $\\frac{3}{8}$ em decimal, divide-se $3$ por $8$:\n\n$$3 \\div 8 = 0{,}375$$\n\nDo mesmo jeito, $\\frac{7}{4} = 1{,}75$ e $\\frac{1}{20} = 0{,}05$. Quando a divisão termina, com resto zero, o resultado é um **decimal exato**.\n\nIsso é o que torna a receita utilizável: ela pede $\\frac{3}{4}$ de litro de leite, e o que você mede na jarra é $0{,}75$ litro.",
                    },
                    {
                        type: "text",
                        value: "## Quando a divisão não termina\n\nDividindo $1$ por $3$, o resto $1$ reaparece a cada passo e o algarismo $3$ se repete para sempre. O resultado é uma **dízima periódica**, e a parte que se repete é o **período**, que marcamos com uma barra em cima:\n\n$$\\frac{1}{3} = 0{,}333\\dots = 0{,}\\overline{3} \\qquad \\frac{2}{11} = 0{,}1818\\dots = 0{,}\\overline{18}$$\n\nDá para prever o resultado antes de dividir. Se o denominador da fração irredutível tiver **só os fatores $2$ e $5$**, o decimal é exato, porque esses são exatamente os fatores de $10$. Qualquer outro fator primo no denominador produz dízima. Por isso $\\frac{3}{8}$ (com $8 = 2^3$) é exato, $\\frac{7}{20}$ (com $20 = 2^2 \\cdot 5$) é exato, e $\\frac{5}{6}$ (com $6 = 2 \\cdot 3$) é dízima.",
                    },
                    {
                        type: "text",
                        value: "## De decimal exato para fração\n\nLeia o número em voz alta e escreva o que você leu. Em $0{,}45$ você lê quarenta e cinco centésimos, então o denominador é $100$, e em seguida simplifica:\n\n$$0{,}45 = \\frac{45}{100} = \\frac{9}{20}$$\n\nA regra prática: o numerador é o número sem a vírgula e o denominador é $1$ seguido de tantos zeros quantas forem as casas decimais. Assim $2{,}6 = \\frac{26}{10} = \\frac{13}{5}$ e $0{,}125 = \\frac{125}{1000} = \\frac{1}{8}$.\n\nConte as casas com cuidado: um zero a mais transforma $0{,}45$ em $\\frac{45}{1000} = 0{,}045$, dez vezes menor.",
                    },
                    {
                        type: "text",
                        value: "## De dízima periódica simples para fração\n\nDízima **simples** é a que começa a repetir logo depois da vírgula. A fração que a gera tem o **período no numerador** e tantos **noves** no denominador quantos forem os algarismos do período:\n\n$$0{,}\\overline{7} = \\frac{7}{9} \\qquad 0{,}\\overline{12} = \\frac{12}{99} = \\frac{4}{33}$$\n\nConfira dividindo de volta: $7 \\div 9 = 0{,}777\\dots$, que é de onde partimos. O caso mais curioso é $0{,}\\overline{9} = \\frac{9}{9} = 1$, e não um número pouquinho menor que $1$ como a intuição sugere.\n\nSe houver parte inteira, ela fica de fora da conta e volta no fim: $2{,}\\overline{3} = 2 + \\frac{3}{9} = \\frac{7}{3}$.",
                    },
                    {
                        type: "text",
                        value: "## Dízima composta: existe uma parte que não repete\n\nEm $0{,}8\\overline{3} = 0{,}8333\\dots$ o $8$ aparece uma vez só, e apenas o $3$ se repete. É uma dízima **composta**, e a regra ganha dois ajustes: no numerador, escreva o número sem a vírgula e **desconte a parte que não repete**; no denominador, ponha um nove para cada algarismo do período e um zero para cada algarismo da parte que não repete.\n\n$$0{,}8\\overline{3} = \\frac{83 - 8}{90} = \\frac{75}{90} = \\frac{5}{6}$$\n\nOutro exemplo: $0{,}1\\overline{6} = \\frac{16 - 1}{90} = \\frac{15}{90} = \\frac{1}{6}$. Confira na divisão, $1 \\div 6 = 0{,}1666\\dots$, e note que esquecer de descontar o $1$ daria $\\frac{16}{90}$, que é outro número.",
                    },
                    {
                        type: "text",
                        value: "## Arredondamento e o critério de arredondar\n\nDinheiro para em duas casas e a dízima não para nunca, então na prática arredondamos. O critério é olhar **o primeiro algarismo que vai ser descartado**: se ele for $5$ ou mais, soma-se $1$ na última casa que fica; se for menor que $5$, a última casa permanece como está.\n\n| Número | Com duas casas | Por quê |\n| --- | --- | --- |\n| $0{,}8333\\dots$ | $0{,}83$ | o primeiro descartado é $3$, menor que $5$ |\n| $2{,}675$ | $2{,}68$ | o primeiro descartado é $5$, então sobe |\n| $7{,}996$ | $8{,}00$ | subiu e o aumento carregou para a parte inteira |\n\nArredondar não é cortar: quem responde $2{,}67$ no lugar de $2{,}68$ apenas truncou o número. E o arredondamento se acumula, por isso $100$ reais divididos por $3$ dão $33{,}33$ para cada um e sobra $1$ centavo na mesa.",
                    },
                    {
                        type: "quote",
                        value: "Toda fração é uma divisão: se o denominador irredutível só tem os fatores $2$ e $5$, ela dá decimal exato, e em qualquer outro caso dá dízima periódica. O caminho de volta usa denominador de potência de dez para o decimal exato, e noves (com zeros, quando existe parte que não repete) para a dízima. No arredondamento, a última casa sobe quando o primeiro algarismo descartado é $5$ ou mais.",
                    },
                ],
                questions: [
                    {
                        statement: "A fração $\\frac{3}{8}$ escrita em forma decimal é:",
                        difficulty: "facil",
                        options: [
                            { text: "$0{,}375$", isCorrect: true },
                            { text: "$0{,}125$", isCorrect: false },
                            { text: "$0{,}38$", isCorrect: false },
                            { text: "$2{,}667$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual fração é igual ao decimal $0{,}45$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{45}{1000}$", isCorrect: false },
                            { text: "$\\frac{9}{20}$", isCorrect: true },
                            { text: "$\\frac{4}{5}$", isCorrect: false },
                            { text: "$\\frac{45}{10}$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "A dízima periódica $0{,}\\overline{18}$ corresponde a qual fração irredutível?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{18}{100}$", isCorrect: false },
                            { text: "$\\frac{18}{90}$", isCorrect: false },
                            { text: "$\\frac{2}{11}$", isCorrect: true },
                            { text: "$\\frac{9}{50}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Arredondando $2{,}675$ para duas casas decimais, obtemos:",
                        difficulty: "medio",
                        options: [
                            { text: "$2{,}67$", isCorrect: false },
                            { text: "$2{,}68$", isCorrect: true },
                            { text: "$2{,}6$", isCorrect: false },
                            { text: "$2{,}70$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "A dízima periódica $0{,}8\\overline{3}$ corresponde a qual fração irredutível?",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\frac{5}{6}$", isCorrect: true },
                            { text: "$\\frac{83}{99}$", isCorrect: false },
                            { text: "$\\frac{83}{90}$", isCorrect: false },
                            { text: "$\\frac{3}{4}$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Porcentagem: do desconto na loja ao aumento no salário",
                blocks: [
                    {
                        type: "text",
                        value: "# Porcentagem: do desconto na loja ao aumento no salário\n\nA vitrine anuncia $30\\%$ de desconto, o salário subiu $8\\%$, a conta de luz veio $12\\%$ maior. Porcentagem é a linguagem em que o dia a dia compara valores, e por trás dela não existe nada de novo: é uma fração com denominador fixo, que já sabemos manipular.",
                    },
                    {
                        type: "text",
                        value: "## Por cento quer dizer por cada cem\n\nO símbolo $\\%$ é uma abreviação de **dividido por cem**. Toda porcentagem é, ao mesmo tempo, uma fração de denominador $100$ e um número decimal:\n\n$$25\\% = \\frac{25}{100} = \\frac{1}{4} = 0{,}25$$\n\nVale ter estas três escritas na ponta da língua, porque elas aparecem toda hora:\n\n| Porcentagem | Fração | Decimal |\n| --- | --- | --- |\n| $10\\%$ | $\\frac{1}{10}$ | $0{,}1$ |\n| $20\\%$ | $\\frac{1}{5}$ | $0{,}2$ |\n| $25\\%$ | $\\frac{1}{4}$ | $0{,}25$ |\n| $50\\%$ | $\\frac{1}{2}$ | $0{,}5$ |\n| $100\\%$ | $1$ | $1$ |\n\nPerceba que $100\\%$ é o valor inteiro, e mais de $100\\%$ é mais que o todo. Um aumento de $150\\%$ não é absurdo, mas um desconto de $150\\%$ seria a loja pagando para você levar o produto.",
                    },
                    {
                        type: "text",
                        value: "## Quanto é uma porcentagem de um valor\n\nBasta multiplicar o valor pelo decimal correspondente. Calculando $15\\%$ de $240$ reais:\n\n$$0{,}15 \\times 240 = 36$$\n\nDe cabeça dá para fazer em duas etapas, porque $10\\%$ é só andar com a vírgula e $5\\%$ é a metade disso:\n\n$$10\\% \\text{ de } 240 = 24 \\qquad 5\\% \\text{ de } 240 = 12 \\qquad 24 + 12 = 36$$\n\nO caminho inverso, descobrir qual porcentagem uma parte representa do total, é dividir a parte pelo total e ler o resultado em centésimos:\n\n$$\\frac{36}{240} = 0{,}15 = 15\\%$$",
                    },
                    {
                        type: "text",
                        value: "## Aumento e desconto em uma única multiplicação\n\nAumentar $8\\%$ é ficar com $108\\%$ do valor, e dar $30\\%$ de desconto é ficar com $70\\%$. Em vez de calcular a parte e depois somar ou subtrair, multiplique direto pelo **fator**:\n\n$$\\text{fator de aumento} = 1 + \\frac{8}{100} = 1{,}08 \\qquad \\text{fator de desconto} = 1 - \\frac{30}{100} = 0{,}70$$\n\nUm salário de $2\\,400$ reais com aumento de $8\\%$ passa a\n\n$$2\\,400 \\times 1{,}08 = 2\\,592$$\n\nE uma camisa de $80$ reais com $30\\%$ de desconto sai por\n\n$$80 \\times 0{,}70 = 56$$\n\nQuem calcula $80 \\times 0{,}30 = 24$ e para aí respondeu de quanto foi o desconto, não quanto se paga. Ler a pergunta até o fim vale meia conta.",
                    },
                    {
                        type: "text",
                        value: "## Voltando ao valor original\n\nSe o fator leva do preço cheio ao preço final, dividir pelo fator faz o caminho de volta. Uma bicicleta saiu por $560$ reais depois de $30\\%$ de desconto. O preço sem desconto era\n\n$$560 \\div 0{,}70 = 800$$\n\nO erro comum aqui é somar $30\\%$ sobre os $560$ reais, obtendo $560 \\times 1{,}30 = 728$. Não fecha, e o motivo é importante: os $30\\%$ do desconto foram calculados sobre $800$, não sobre $560$. A conferência é imediata, $800 \\times 0{,}70 = 560$, exatamente o que o enunciado diz.",
                    },
                    {
                        type: "text",
                        value: "## Acréscimos e descontos sucessivos se multiplicam\n\nQuando duas variações vêm uma depois da outra, os fatores se multiplicam, e é aí que a intuição escorrega. Um produto de $200$ reais que sobe $10\\%$ e depois cai $10\\%$ não volta aos $200$:\n\n$$200 \\times 1{,}10 = 220 \\qquad 220 \\times 0{,}90 = 198$$\n\nO fator total é $1{,}10 \\times 0{,}90 = 0{,}99$, ou seja, uma queda de $1\\%$. A razão é que o aumento de $10\\%$ incidiu sobre $200$ e valeu $20$ reais, enquanto o desconto de $10\\%$ incidiu sobre $220$ e valeu $22$ reais. **Porcentagem sempre pergunta de que valor**, e o segundo valor já não era o primeiro.",
                    },
                    {
                        type: "text",
                        value: "## Dois descontos seguidos não viram a soma\n\nUma loja oferece $20\\%$ de desconto na etiqueta e, no caixa, mais $10\\%$ sobre o valor já descontado. Isso não é $30\\%$:\n\n$$0{,}80 \\times 0{,}90 = 0{,}72$$\n\nO desconto total é de $28\\%$. Um casaco de $150$ reais sai por $150 \\times 0{,}72 = 108$ reais, e não por $105$ reais, que é o que daria um desconto único de $30\\%$.\n\nDo outro lado da moeda, dois aumentos de $10\\%$ dão $1{,}10 \\times 1{,}10 = 1{,}21$, isto é, $21\\%$, e não $20\\%$: o segundo aumento também incide sobre o primeiro. Essa é a mesma mecânica dos juros que se acumulam mês a mês.",
                    },
                    {
                        type: "quote",
                        value: "Porcentagem é fração de denominador cem, e todo cálculo fica curto com o fator multiplicativo: $1{,}08$ para subir $8\\%$, $0{,}70$ para descontar $30\\%$, e a divisão pelo fator para voltar ao valor original. Variações sucessivas multiplicam fatores, nunca somam porcentagens, porque cada uma incide sobre o valor que a anterior deixou.",
                    },
                ],
                questions: [
                    {
                        statement: "Quanto vale $15\\%$ de $240$ reais?",
                        difficulty: "facil",
                        options: [
                            { text: "$360$ reais", isCorrect: false },
                            { text: "$16$ reais", isCorrect: false },
                            { text: "$36$ reais", isCorrect: true },
                            { text: "$3{,}60$ reais", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma camisa de $80$ reais está com $30\\%$ de desconto. O preço final é:",
                        difficulty: "facil",
                        options: [
                            { text: "$56$ reais", isCorrect: true },
                            { text: "$24$ reais", isCorrect: false },
                            { text: "$50$ reais", isCorrect: false },
                            { text: "$104$ reais", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um salário de $2\\,400$ reais recebe um aumento de $8\\%$. O novo salário é:",
                        difficulty: "medio",
                        options: [
                            { text: "$2\\,480$ reais", isCorrect: false },
                            { text: "$2\\,208$ reais", isCorrect: false },
                            { text: "$192$ reais", isCorrect: false },
                            { text: "$2\\,592$ reais", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Depois de um desconto de $30\\%$, uma bicicleta saiu por $560$ reais. O preço sem desconto era:",
                        difficulty: "medio",
                        options: [
                            { text: "$392$ reais", isCorrect: false },
                            { text: "$590$ reais", isCorrect: false },
                            { text: "$800$ reais", isCorrect: true },
                            { text: "$728$ reais", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um preço sofre um aumento de $10\\%$ e, em seguida, um desconto de $10\\%$ sobre o valor já aumentado. Em relação ao preço inicial, o preço final:",
                        difficulty: "dificil",
                        options: [
                            { text: "volta ao valor inicial", isCorrect: false },
                            { text: "fica $10\\%$ menor", isCorrect: false },
                            { text: "fica $1\\%$ maior", isCorrect: false },
                            { text: "fica $1\\%$ menor", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Razão, proporção e regra de três simples",
                blocks: [
                    {
                        type: "text",
                        value: "# Razão, proporção e regra de três simples\n\nA receita serve quatro pessoas e você vai receber seis. O carro fez $540$ km com um tanque e você quer saber se chega ao destino. Perguntas assim se resolvem comparando grandezas por divisão, que é o que chamamos de razão, e completando a comparação que falta, que é a regra de três.",
                    },
                    {
                        type: "text",
                        value: "## Razão é comparar dividindo\n\nA **razão** entre dois números $a$ e $b$, com $b \\neq 0$, é o quociente $\\frac{a}{b}$. Ela responde quantas vezes um cabe no outro, e carrega a unidade da comparação.\n\nUm carro que roda $540$ km com $45$ litros tem consumo\n\n$$\\frac{540 \\text{ km}}{45 \\text{ L}} = 12 \\text{ km/L}$$\n\nA ordem importa. A razão inversa, $\\frac{45}{540} \\approx 0{,}083$, é verdadeira, mas diz litros por quilômetro, que responde outra pergunta. Em uma receita para $3$ pessoas com $2$ ovos, a razão de ovos por pessoa é $\\frac{2}{3}$, e a de pessoas por ovo é $\\frac{3}{2}$.",
                    },
                    {
                        type: "text",
                        value: "## Proporção e a propriedade fundamental\n\n**Proporção** é a igualdade entre duas razões:\n\n$$\\frac{a}{b} = \\frac{c}{d}$$\n\nNela, $a$ e $d$ são os **extremos** e $b$ e $c$ são os **meios**. A propriedade fundamental diz que o produto dos meios é igual ao produto dos extremos:\n\n$$a \\cdot d = b \\cdot c$$\n\nEm $\\frac{3}{5} = \\frac{12}{20}$, de fato $3 \\cdot 20 = 60$ e $5 \\cdot 12 = 60$. É essa propriedade que transforma uma proporção em uma multiplicação simples, e é dela que vem o apelido de multiplicar em cruz.",
                    },
                    {
                        type: "text",
                        value: "## Achando o termo que falta\n\nQuando um dos quatro termos é desconhecido, a propriedade fundamental o entrega. Em\n\n$$\\frac{3}{5} = \\frac{12}{x}$$\n\no produto dos extremos é $3 \\cdot x$ e o dos meios é $5 \\cdot 12 = 60$. Então $x$ é o número que multiplicado por $3$ dá $60$, ou seja, $x = 60 \\div 3 = 20$.\n\nRepare que o termo procurado aparece multiplicado, por isso a última etapa é sempre uma divisão. Quem multiplica em linha, fazendo $3 \\cdot 12$ contra $5 \\cdot x$, inventou outra proporção e chega a $x = 7{,}2$.",
                    },
                    {
                        type: "text",
                        value: "## Regra de três direta\n\nA **regra de três** monta uma proporção com três valores conhecidos e um procurado. Ela é **direta** quando as duas grandezas crescem juntas.\n\nSe $3$ kg de farinha rendem $24$ pães, quantos pães rendem $5$ kg? Mais farinha dá mais pão, então as razões ficam na mesma ordem:\n\n$$\\frac{3}{5} = \\frac{24}{x} \\quad \\text{e} \\quad 3 \\cdot x = 120 \\quad \\text{logo} \\quad x = 40$$\n\nUm atalho que evita montagem é achar o valor unitário: $24 \\div 3 = 8$ pães por quilo, e $8 \\times 5 = 40$ pães. O resultado precisa ser coerente com a leitura do problema, e aqui é: saiu mais pão porque entrou mais farinha.",
                    },
                    {
                        type: "text",
                        value: "## Regra de três inversa\n\nÉ **inversa** quando uma grandeza cresce e a outra diminui. Seis pintores pintam um prédio em $10$ dias. Mantido o mesmo ritmo, quatro pintores vão levar mais tempo, não menos.\n\nNa inversa, **invertemos uma das razões** antes de aplicar a propriedade fundamental:\n\n$$\\frac{6}{4} = \\frac{x}{10} \\quad \\text{e} \\quad 4 \\cdot x = 60 \\quad \\text{logo} \\quad x = 15$$\n\nExiste um caminho mais seguro, que dispensa decorar a inversão: o trabalho total é constante. São $6 \\times 10 = 60$ pintores-dia, e $60 \\div 4 = 15$ dias. Na direta é o quociente entre as grandezas que se mantém; na inversa é o produto.",
                    },
                    {
                        type: "text",
                        value: "## Antes de montar, pergunte se cresce junto\n\nO erro mais caro da regra de três não está na conta, está na escolha do tipo. Antes de escrever a proporção, responda: se eu dobrar a primeira grandeza, a segunda dobra ou cai pela metade?\n\n| Situação | Tipo | Teste |\n| --- | --- | --- |\n| litros de combustível e preço pago | direta | o dobro de litros custa o dobro |\n| quilos de carne e preço na balança | direta | o dobro do peso custa o dobro |\n| velocidade e tempo em um percurso fixo | inversa | o dobro da velocidade leva metade do tempo |\n| número de operários e dias de obra | inversa | o dobro de operários leva metade dos dias |\n\nE confira o resultado no fim. Se você aumentou a primeira grandeza e a resposta veio menor em uma situação direta, o tipo foi trocado no caminho.",
                    },
                    {
                        type: "quote",
                        value: "Razão compara duas grandezas por divisão, e proporção é a igualdade de duas razões, onde o produto dos meios é igual ao produto dos extremos. A regra de três usa essa propriedade para achar o termo que falta: mantém as razões na mesma ordem quando as grandezas crescem juntas, e inverte uma delas quando uma cresce e a outra diminui.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um carro percorreu $540$ km consumindo $45$ litros de combustível. O consumo médio foi de:",
                        difficulty: "facil",
                        options: [
                            { text: "$585$ km/L", isCorrect: false },
                            { text: "$495$ km/L", isCorrect: false },
                            { text: "$0{,}08$ km/L", isCorrect: false },
                            { text: "$12$ km/L", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Se $3$ kg de farinha rendem $24$ pães, quantos pães rendem $5$ kg?",
                        difficulty: "facil",
                        options: [
                            { text: "$72$ pães", isCorrect: false },
                            { text: "$40$ pães", isCorrect: true },
                            { text: "$14{,}4$ pães", isCorrect: false },
                            { text: "$26$ pães", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Na proporção $\\frac{3}{5} = \\frac{12}{x}$, o valor de $x$ é:",
                        difficulty: "medio",
                        options: [
                            { text: "$20$", isCorrect: true },
                            { text: "$36$", isCorrect: false },
                            { text: "$7{,}2$", isCorrect: false },
                            { text: "$15$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Seis pintores pintam um prédio em $10$ dias. Mantido o mesmo ritmo, quatro pintores pintariam o mesmo prédio em:",
                        difficulty: "medio",
                        options: [
                            { text: "$8$ dias", isCorrect: false },
                            { text: "$20$ dias", isCorrect: false },
                            { text: "$6{,}7$ dias", isCorrect: false },
                            { text: "$15$ dias", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Três máquinas iguais embalam $450$ caixas em $2$ horas. Para embalar as mesmas $450$ caixas em $90$ minutos, quantas máquinas são necessárias?",
                        difficulty: "dificil",
                        options: [
                            { text: "$5$ máquinas", isCorrect: false },
                            { text: "$4$ máquinas", isCorrect: true },
                            { text: "$6$ máquinas", isCorrect: false },
                            { text: "$2$ máquinas", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Grandezas proporcionais e regra de três composta",
                blocks: [
                    {
                        type: "text",
                        value: "# Grandezas proporcionais e regra de três composta\n\nNa vida real um problema raramente envolve só duas grandezas. A obra depende do número de pedreiros, das horas trabalhadas por dia e dos dias de prazo. Antes de montar qualquer conta, é preciso reconhecer como cada grandeza se relaciona com aquela que você procura, e é esse reconhecimento que esta aula treina.",
                    },
                    {
                        type: "text",
                        value: "## Grandezas diretamente proporcionais\n\nDuas grandezas são **diretamente proporcionais** quando, ao multiplicar uma por um número, a outra fica multiplicada pelo mesmo número. O sinal disso é que o **quociente entre elas é constante**.\n\nCombustível a $5{,}80$ reais por litro:\n\n| Litros | Preço pago |\n| --- | --- |\n| $10$ | $58{,}00$ |\n| $20$ | $116{,}00$ |\n| $30$ | $174{,}00$ |\n\nEm todas as linhas, $\\frac{\\text{preço}}{\\text{litros}} = 5{,}80$. Essa constante tem nome, **constante de proporcionalidade**, e aqui ela é o preço por litro:\n\n$$\\frac{y}{x} = k \\quad \\text{ou} \\quad y = k \\cdot x$$",
                    },
                    {
                        type: "text",
                        value: "## Grandezas inversamente proporcionais\n\nSão **inversamente proporcionais** quando multiplicar uma por um número divide a outra pelo mesmo número. Agora é o **produto entre elas que é constante**.\n\nUm percurso fixo de $240$ km:\n\n| Velocidade (km/h) | Tempo (h) |\n| --- | --- |\n| $60$ | $4$ |\n| $80$ | $3$ |\n| $120$ | $2$ |\n\nEm todas as linhas, velocidade vezes tempo dá $240$, que é a distância:\n\n$$x \\cdot y = k$$\n\nRepare que dobrar a velocidade, de $60$ para $120$, cortou o tempo pela metade, de $4$ para $2$. Aqui o quociente não é constante, e quem insiste em dividir uma grandeza pela outra não encontra padrão nenhum.",
                    },
                    {
                        type: "text",
                        value: "## Reconhecer antes de montar a conta\n\nO teste é sempre o mesmo: **dobre uma grandeza e veja o que acontece com a outra**. Se ela dobra, a proporcionalidade é direta. Se ela cai pela metade, é inversa.\n\nE existe um terceiro caso, que a escola costuma esquecer: grandezas que **não são proporcionais**. A idade e a altura de uma pessoa crescem juntas por um tempo, mas ninguém com $40$ anos tem o dobro da altura que tinha aos $20$. O mesmo vale para o lado de um quadrado e sua área, que crescem juntos e ainda assim não são proporcionais, porque dobrar o lado quadruplica a área.\n\nRegra de três só vale para grandezas proporcionais. Aplicá-la fora disso produz um número bem formatado e completamente errado.",
                    },
                    {
                        type: "text",
                        value: "## Divisão proporcional\n\nDividir uma quantia em partes proporcionais a certos números é repartir tudo em **partes iguais** e depois agrupar. Para dividir $1\\,200$ reais em partes proporcionais a $2$ e a $3$, some os números, $2 + 3 = 5$, e descubra quanto vale cada parte:\n\n$$1\\,200 \\div 5 = 240$$\n\nAs quantias são então $2 \\times 240 = 480$ reais e $3 \\times 240 = 720$ reais, e a soma confere: $480 + 720 = 1\\,200$. Conferir a soma é o jeito mais rápido de pegar erro em divisão proporcional.\n\nSe a divisão tiver que ser inversamente proporcional a $2$ e a $3$, use os inversos $\\frac{1}{2}$ e $\\frac{1}{3}$, que equivalem à razão $3$ para $2$: quem tem o número maior fica com a parte menor.",
                    },
                    {
                        type: "text",
                        value: "## Regra de três composta\n\n**Composta** é a regra de três com três grandezas ou mais. Três máquinas iguais, trabalhando $8$ horas por dia, produzem $600$ peças. Quantas peças produzem cinco máquinas trabalhando $6$ horas por dia?\n\nO método é comparar cada grandeza com a procurada, uma de cada vez, imaginando as outras congeladas:\n\n| Máquinas | Horas por dia | Peças |\n| --- | --- | --- |\n| $3$ | $8$ | $600$ |\n| $5$ | $6$ | $x$ |\n\nMais máquinas dão mais peças, relação direta. Mais horas por dia dão mais peças, relação direta também. Um caminho que dispensa decorar nada é contar o trabalho total em máquinas-hora:\n\n$$3 \\times 8 = 24 \\quad \\text{e} \\quad 600 \\div 24 = 25 \\text{ peças por máquina-hora}$$\n\nCom $5 \\times 6 = 30$ máquinas-hora, saem $30 \\times 25 = 750$ peças.",
                    },
                    {
                        type: "text",
                        value: "## Quando alguma grandeza é inversa\n\nOito pedreiros, trabalhando $6$ horas por dia, levantam um muro em $15$ dias. Em quantos dias dez pedreiros, trabalhando $8$ horas por dia, levantam o mesmo muro?\n\nAqui a grandeza procurada é o número de dias. Mais pedreiros significam menos dias, e mais horas por dia também significam menos dias: as duas relações são **inversas**.\n\nO muro é a mesma quantidade de serviço, então o total de pedreiros-hora não muda:\n\n$$8 \\times 15 \\times 6 = 720$$\n\nDez pedreiros em $8$ horas rendem $10 \\times 8 = 80$ pedreiros-hora por dia, e portanto\n\n$$720 \\div 80 = 9 \\text{ dias}$$\n\nQuem trata as duas relações como diretas chega a $25$ dias, resultado que o bom senso recusa antes da conta: com mais gente e mais horas por dia, a obra não pode demorar mais.",
                    },
                    {
                        type: "quote",
                        value: "Em grandezas diretamente proporcionais o quociente é constante, e em inversamente proporcionais o produto é constante, e é o teste de dobrar uma delas que decide a montagem antes de qualquer conta. Na regra de três composta, cada grandeza é comparada separadamente com a procurada, e contar o trabalho total costuma ser o caminho mais seguro.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Em qual das situações as duas grandezas citadas são inversamente proporcionais?",
                        difficulty: "facil",
                        options: [
                            { text: "quilos de carne e preço na balança", isCorrect: false },
                            { text: "horas trabalhadas e salário do mês", isCorrect: false },
                            { text: "litros de tinta e área pintada na parede", isCorrect: false },
                            { text: "número de pedreiros e dias de obra", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Dividindo $1\\,200$ reais em partes proporcionais a $2$ e a $3$, as partes são:",
                        difficulty: "facil",
                        options: [
                            { text: "$600$ e $600$ reais", isCorrect: false },
                            { text: "$500$ e $700$ reais", isCorrect: false },
                            { text: "$480$ e $720$ reais", isCorrect: true },
                            { text: "$400$ e $800$ reais", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um percurso de $240$ km é feito em $4$ horas a $60$ km/h. No mesmo percurso, a $80$ km/h o tempo passa a ser:",
                        difficulty: "medio",
                        options: [
                            { text: "$3$ horas", isCorrect: true },
                            { text: "$3{,}2$ horas", isCorrect: false },
                            { text: "$5{,}3$ horas", isCorrect: false },
                            { text: "$2$ horas", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Três máquinas, trabalhando $8$ horas por dia, produzem $600$ peças por dia. Quantas peças por dia produzem cinco máquinas trabalhando $6$ horas por dia?",
                        difficulty: "medio",
                        options: [
                            { text: "$1\\,000$ peças", isCorrect: false },
                            { text: "$750$ peças", isCorrect: true },
                            { text: "$600$ peças", isCorrect: false },
                            { text: "$450$ peças", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Oito pedreiros, trabalhando $6$ horas diárias, levantam um muro em $15$ dias. Dez pedreiros, trabalhando $8$ horas diárias, levantam o mesmo muro em:",
                        difficulty: "dificil",
                        options: [
                            { text: "$16$ dias", isCorrect: false },
                            { text: "$25$ dias", isCorrect: false },
                            { text: "$12$ dias", isCorrect: false },
                            { text: "$9$ dias", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Potências, raízes e notação científica",
        aulas: [
            {
                titulo: "Potenciação e suas propriedades",
                blocks: [
                    {
                        type: "text",
                        value: "# Potenciação e suas propriedades\n\nDobre uma folha de papel ao meio e você tem $2$ camadas. Dobre de novo e são $4$. Na décima dobra já são $1024$ camadas, e escrever $2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2$ toda vez é inviável. A **potenciação** existe justamente para encurtar multiplicação repetida, e com ela vêm propriedades que transformam contas gigantes em somas de expoentes.",
                    },
                    {
                        type: "text",
                        value: '## O que a potência significa\n\nDados um número $a$, chamado **base**, e um número natural $n$, chamado **expoente**, a potência $a^{n}$ é o produto de $n$ fatores iguais a $a$:\n\n$$a^{n} = \\underbrace{a \\cdot a \\cdots a}_{n \\text{ fatores}}$$\n\nLemos $a^{n}$ como "$a$ elevado a $n$". Dois casos ganharam nome próprio: $a^{2}$ é o **quadrado** de $a$ e $a^{3}$ é o **cubo** de $a$.\n\nNa memória do computador isso aparece todo dia. Um bloco de $2^{10}$ bytes é o que chamamos de um kibibyte:\n\n$$2^{10} = 2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 \\cdot 2 = 1024$$\n\nRepare no ganho de escrita: dez fatores viraram dois algarismos e um expoente.',
                    },
                    {
                        type: "text",
                        value: "## O sinal da base e a armadilha do parêntese\n\nQuando a base é negativa, o expoente decide o sinal do resultado. Expoente par devolve positivo, porque os sinais se cancelam de dois em dois; expoente ímpar sobra um sinal negativo no fim.\n\n$$(-2)^{4} = 16 \\qquad (-2)^{3} = -8$$\n\nAgora o detalhe que derruba muita gente: o parêntese muda o resultado. Em $(-2)^{4}$ a base é $-2$ e o valor é $16$. Em $-2^{4}$ a base é $2$, o expoente age só sobre ela e o sinal fica de fora, então $-2^{4} = -16$. São números opostos escritos de formas quase idênticas.",
                    },
                    {
                        type: "text",
                        value: '## Produto de potências de mesma base\n\nMultiplicar potências de mesma base é juntar os fatores de um lado com os do outro, e por isso os expoentes se somam:\n\n$$a^{m} \\cdot a^{n} = a^{m+n}$$\n\nDá para ver o porquê contando fatores: $2^{3} \\cdot 2^{2} = (2 \\cdot 2 \\cdot 2) \\cdot (2 \\cdot 2) = 2^{5}$, e de fato $8 \\cdot 4 = 32 = 2^{5}$.\n\nUm exemplo de informática. Um arquivo de um mebibyte tem $2^{10}$ blocos, e cada bloco tem $2^{10}$ bytes. O total de bytes é\n\n$$2^{10} \\cdot 2^{10} = 2^{10+10} = 2^{20} = 1\\,048\\,576$$\n\nAquele "mais ou menos um milhão" que você já viu em tela de download tem endereço exato.',
                    },
                    {
                        type: "text",
                        value: "## Quociente de potências de mesma base\n\nNa divisão os fatores se cancelam em pares, e os expoentes se subtraem (sempre com $a \\neq 0$):\n\n$$\\frac{a^{m}}{a^{n}} = a^{m-n}$$\n\nUm disco de um terabyte guarda $10^{12}$ bytes, e um arquivo de vídeo de um gigabyte ocupa $10^{9}$ bytes. Quantos vídeos cabem no disco?\n\n$$\\frac{10^{12}}{10^{9}} = 10^{12-9} = 10^{3} = 1000$$\n\nMil arquivos, sem precisar contar zero por zero. A conta inteira virou uma subtração de dois números pequenos.",
                    },
                    {
                        type: "text",
                        value: "## Potência de potência\n\nElevar uma potência a outro expoente multiplica os expoentes:\n\n$$(a^{m})^{n} = a^{m \\cdot n}$$\n\nDe novo é só contar: $(10^{3})^{2} = 10^{3} \\cdot 10^{3} = 10^{3+3} = 10^{6}$.\n\nAqui mora um erro clássico: $(2^{3})^{2}$ e $2^{3^{2}}$ não são a mesma coisa. No primeiro, o expoente de fora multiplica o de dentro e o valor é $2^{6} = 64$. No segundo, o expoente é $3^{2} = 9$, e o valor é $2^{9} = 512$. O parêntese não é decoração.",
                    },
                    {
                        type: "text",
                        value: "## Potência de um produto e de um quociente\n\nO expoente de fora se distribui sobre cada fator:\n\n$$(a \\cdot b)^{n} = a^{n} \\cdot b^{n} \\qquad \\left(\\frac{a}{b}\\right)^{n} = \\frac{a^{n}}{b^{n}}$$\n\nÉ o que permite quebrar uma potência feia em duas fáceis. Um cubo de $10$ centímetros de aresta tem volume $10^{3} = 1000$ centímetros cúbicos. E um cubo de $20$ centímetros de aresta?\n\n$$20^{3} = (2 \\cdot 10)^{3} = 2^{3} \\cdot 10^{3} = 8 \\cdot 1000 = 8000$$\n\nDobrar a aresta multiplicou o volume por $8$, não por $2$. É o mesmo motivo pelo qual uma pizza de diâmetro dobrado rende quatro vezes mais, e não duas.",
                    },
                    {
                        type: "text",
                        value: "## O erro de somar expoentes numa soma de potências\n\nTodas as propriedades acima valem para **produto**, **quociente** e **potência de potência**, e nenhuma delas vale para soma. Quem escreve $2^{3} + 2^{4} = 2^{7}$ está inventando uma regra que não existe. Confira:\n\n$$2^{3} + 2^{4} = 8 + 16 = 24 \\qquad \\text{mas} \\qquad 2^{7} = 128$$\n\nNuma soma de potências de mesma base o que se pode fazer é colocar o fator comum em evidência:\n\n$$2^{3} + 2^{4} = 2^{3} \\cdot (1 + 2) = 8 \\cdot 3 = 24$$\n\nMesmo resultado, agora por um caminho legítimo. A lição geral: expoente se soma quando as potências se multiplicam, nunca quando elas se somam.",
                    },
                    {
                        type: "text",
                        value: "## As propriedades em uma tabela\n\n| Propriedade | Regra | Exemplo |\n| --- | --- | --- |\n| Produto de mesma base | $a^{m} \\cdot a^{n} = a^{m+n}$ | $3^{2} \\cdot 3^{4} = 3^{6}$ |\n| Quociente de mesma base | $\\frac{a^{m}}{a^{n}} = a^{m-n}$ | $\\frac{5^{7}}{5^{3}} = 5^{4}$ |\n| Potência de potência | $(a^{m})^{n} = a^{m \\cdot n}$ | $(7^{2})^{3} = 7^{6}$ |\n| Potência de produto | $(a \\cdot b)^{n} = a^{n} \\cdot b^{n}$ | $(2 \\cdot 5)^{3} = 2^{3} \\cdot 5^{3}$ |\n| Potência de quociente | $\\left(\\frac{a}{b}\\right)^{n} = \\frac{a^{n}}{b^{n}}$ | $\\left(\\frac{3}{4}\\right)^{2} = \\frac{9}{16}$ |\n\nNa dúvida sobre qual regra usar, teste com números pequenos antes. Se $2^{3} \\cdot 2^{2}$ dá $32$ pelos dois caminhos, o da definição e o da propriedade, é porque a regra está sendo aplicada do jeito certo.",
                    },
                    {
                        type: "quote",
                        value: "Potência é multiplicação repetida, e suas propriedades dizem o que fazer com os expoentes: somar no produto de mesma base, subtrair no quociente, multiplicar na potência de potência e distribuir sobre produto e quociente. Em soma de potências nenhuma dessas regras vale, e o caminho é calcular cada potência ou colocar o fator comum em evidência.",
                    },
                ],
                questions: [
                    {
                        statement: "Um bloco de memória tem $2^{10}$ bytes. Quantos bytes são?",
                        difficulty: "facil",
                        options: [
                            { text: "$1024$", isCorrect: true },
                            { text: "$2048$", isCorrect: false },
                            { text: "$20$", isCorrect: false },
                            { text: "$512$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Escrito como uma única potência de base $2$, o produto $2^{10} \\cdot 2^{10}$ é igual a:",
                        difficulty: "facil",
                        options: [
                            { text: "$2^{10}$", isCorrect: false },
                            { text: "$4^{20}$", isCorrect: false },
                            { text: "$2^{100}$", isCorrect: false },
                            { text: "$2^{20}$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Um sistema de registro guarda $(10^{3})^{4}$ eventos. Esse total equivale a:",
                        difficulty: "medio",
                        options: [
                            { text: "$10^{81}$", isCorrect: false },
                            { text: "$12^{10}$", isCorrect: false },
                            { text: "$10^{12}$", isCorrect: true },
                            { text: "$10^{7}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor da soma $2^{3} + 2^{4}$?",
                        difficulty: "medio",
                        options: [
                            { text: "$128$", isCorrect: false },
                            { text: "$4096$", isCorrect: false },
                            { text: "$24$", isCorrect: true },
                            { text: "$14$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Simplificando a expressão $\\frac{2^{8} \\cdot 3^{5}}{2^{6} \\cdot 3^{7}}$, obtém-se:",
                        difficulty: "dificil",
                        options: [
                            { text: "$36$", isCorrect: false },
                            { text: "$\\frac{1}{36}$", isCorrect: false },
                            { text: "$\\frac{9}{4}$", isCorrect: false },
                            { text: "$\\frac{4}{9}$", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Expoente zero, negativo e a potência de base dez",
                blocks: [
                    {
                        type: "text",
                        value: "# Expoente zero, negativo e a potência de base dez\n\nDigite $7^{0}$ em qualquer calculadora e aparece $1$. Digite $7^{-2}$ e aparece $0{,}0204\\dots$, um número positivo e pequeno. Nada disso é capricho de fabricante: as duas respostas saem das mesmas propriedades da aula anterior, levadas um pouco mais longe. E quando a base é $10$, o resultado fica tão previsível que a conta se resolve andando com a vírgula.",
                    },
                    {
                        type: "text",
                        value: "## Por que a base elevada a zero dá um\n\nDivida uma potência por ela mesma. Pela regra do quociente, os expoentes se subtraem:\n\n$$\\frac{5^{3}}{5^{3}} = 5^{3-3} = 5^{0}$$\n\nMas essa mesma divisão, feita na mão, é $\\frac{125}{125} = 1$. Se os dois caminhos tratam do mesmo número, só há uma saída possível:\n\n$$a^{0} = 1 \\quad \\text{para todo } a \\neq 0$$\n\nNão é uma regra para decorar, é a única definição que mantém a propriedade do quociente funcionando. A exceção é a base zero: $0^{0}$ fica sem valor definido, porque o argumento acima exigiria dividir $0$ por $0$.",
                    },
                    {
                        type: "text",
                        value: "## Expoente negativo é o inverso\n\nAgora continue descendo. Se o expoente de baixo é maior que o de cima, a subtração dá negativo:\n\n$$\\frac{2^{2}}{2^{5}} = 2^{2-5} = 2^{-3}$$\n\nFazendo a mesma divisão na mão, $\\frac{4}{32} = \\frac{1}{8} = \\frac{1}{2^{3}}$. Comparando os dois resultados, chegamos à definição:\n\n$$a^{-n} = \\frac{1}{a^{n}} \\quad \\text{com } a \\neq 0$$\n\nExpoente negativo não é uma potência de outro tipo, é a potência de sempre colocada embaixo de $1$. Assim $2^{-3} = \\frac{1}{8} = 0{,}125$ e $10^{-2} = \\frac{1}{100} = 0{,}01$.",
                    },
                    {
                        type: "text",
                        value: "## O sinal do expoente não é o sinal do resultado\n\nEste é o erro mais comum do assunto: escrever $3^{-2} = -9$. O sinal de menos está no expoente, não na base, e inverter um número positivo devolve outro número positivo:\n\n$$3^{-2} = \\frac{1}{3^{2}} = \\frac{1}{9}$$\n\nRepare que $\\frac{1}{9}$ é positivo e menor que $1$. Essa é a assinatura do expoente negativo quando a base é maior que $1$: o resultado encolhe, mas não muda de lado na reta numérica.\n\nEm base fracionária existe um atalho que vale conhecer, porque inverter a fração já resolve o sinal do expoente:\n\n$$\\left(\\frac{2}{5}\\right)^{-2} = \\left(\\frac{5}{2}\\right)^{2} = \\frac{25}{4}$$",
                    },
                    {
                        type: "text",
                        value: "## A potência de base dez\n\nCom base $10$ o expoente conta zeros, e isso faz dessa base a mais útil de todas. Expoente positivo gera inteiro grande, expoente negativo gera decimal pequeno.\n\n| Potência | Valor | Em palavras |\n| --- | --- | --- |\n| $10^{3}$ | $1000$ | mil |\n| $10^{1}$ | $10$ | dez |\n| $10^{0}$ | $1$ | um |\n| $10^{-1}$ | $0{,}1$ | um décimo |\n| $10^{-3}$ | $0{,}001$ | um milésimo |\n\nNote a simetria da tabela em torno de $10^{0} = 1$: de $10^{3}$ para $10^{-3}$ o número não muda de sinal, muda de tamanho. Os dois estão à direita do zero na reta numérica, um bem longe e o outro bem perto.",
                    },
                    {
                        type: "text",
                        value: "## Multiplicar e dividir andando com a vírgula\n\nMultiplicar por $10^{n}$ com $n$ positivo empurra a vírgula $n$ casas para a direita. Multiplicar por $10^{-n}$ empurra $n$ casas para a esquerda. Na divisão acontece o contrário, porque dividir por $10^{n}$ é multiplicar por $10^{-n}$.\n\n$$3{,}2 \\times 10^{4} = 32\\,000 \\qquad 3{,}2 \\times 10^{-4} = 0{,}00032$$\n\nUm exemplo com medida de verdade: uma folha de papel comum tem $0{,}1$ milímetro de espessura. Em metros, isso é $0{,}1$ dividido por $1000$, ou seja\n\n$$0{,}1 \\cdot 10^{-3} = 1 \\times 10^{-4} \\text{ m}$$\n\nE uma resma de $500$ folhas empilhada mede $500 \\cdot 0{,}1 = 50$ milímetros, cinco centímetros de papel. Guarde esse número da folha, porque ele volta mais adiante.",
                    },
                    {
                        type: "text",
                        value: "## Os prefixos das unidades são potências de dez\n\nQuase todo prefixo de unidade é apelido de uma potência de dez. Saber esta tabela é saber converter sem decorar regra de conversão nenhuma.\n\n| Prefixo | Fator | Prefixo | Fator |\n| --- | --- | --- | --- |\n| quilo | $10^{3}$ | mili | $10^{-3}$ |\n| mega | $10^{6}$ | micro | $10^{-6}$ |\n| giga | $10^{9}$ | nano | $10^{-9}$ |\n\nQuantos nanômetros há em um micrômetro? Basta dividir os fatores:\n\n$$\\frac{10^{-6}}{10^{-9}} = 10^{-6-(-9)} = 10^{3} = 1000$$\n\nMil nanômetros em cada micrômetro, do mesmo jeito que há mil milímetros em cada metro. Repare no cuidado com o sinal: subtrair $-9$ é somar $9$, e quem esquece isso erra o expoente em dezoito unidades.",
                    },
                    {
                        type: "quote",
                        value: "Qualquer base diferente de zero elevada a zero vale um, e expoente negativo significa inverso, nunca resultado negativo. Com base dez o expoente conta casas: positivo empurra a vírgula para a direita, negativo empurra para a esquerda, e os prefixos das unidades, de quilo a nano, são só apelidos dessas potências.",
                    },
                ],
                questions: [
                    {
                        statement: "Quanto vale $7^{0}$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{1}{7}$", isCorrect: false },
                            { text: "$0$", isCorrect: false },
                            { text: "$7$", isCorrect: false },
                            { text: "$1$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Multiplicar um número por $10^{-3}$ equivale a fazer o que com a vírgula?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "multiplicar o número por três e trocar o sinal",
                                isCorrect: false,
                            },
                            { text: "deslocar a vírgula três casas à esquerda", isCorrect: true },
                            { text: "deslocar a vírgula uma casa à esquerda", isCorrect: false },
                            { text: "deslocar a vírgula três casas à direita", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $5^{-2}$?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{1}{25}$", isCorrect: true },
                            { text: "$\\frac{1}{10}$", isCorrect: false },
                            { text: "$-\\frac{1}{25}$", isCorrect: false },
                            { text: "$-25$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um vírus mede cerca de $100$ nanômetros. Escrita em metros como potência de dez, essa medida é:",
                        difficulty: "medio",
                        options: [
                            { text: "$10^{-9}$", isCorrect: false },
                            { text: "$10^{-7}$", isCorrect: true },
                            { text: "$10^{-11}$", isCorrect: false },
                            { text: "$10^{7}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor da soma $2^{-3} + 2^{-1}$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$-\\frac{5}{8}$", isCorrect: false },
                            { text: "$\\frac{5}{8}$", isCorrect: true },
                            { text: "$\\frac{1}{16}$", isCorrect: false },
                            { text: "$\\frac{1}{4}$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Raiz quadrada e raiz cúbica",
                blocks: [
                    {
                        type: "text",
                        value: "# Raiz quadrada e raiz cúbica\n\nUm piso quadrado tem $64$ metros quadrados de área. Quanto mede o lado? A pergunta inverte a potência: em vez de saber o lado e calcular a área, sabemos a área e procuramos o lado. Essa operação inversa é a **radiciação**, e ela aparece em toda medida que vem de uma área ou de um volume.",
                    },
                    {
                        type: "text",
                        value: "## A raiz quadrada e seus nomes\n\nA **raiz quadrada** de um número $a$ maior ou igual a zero é o número não negativo que, elevado ao quadrado, devolve $a$. Na expressão $\\sqrt{64}$, o sinal da raiz é o **radical** e o número de dentro é o **radicando**.\n\n$$\\sqrt{64} = 8 \\quad \\text{porque} \\quad 8^{2} = 64$$\n\nVoltando ao piso: a área é $64$ metros quadrados, então o lado mede $8$ metros.\n\nDuas observações evitam muita confusão. A primeira: $\\sqrt{25}$ vale $5$, e não $\\pm 5$. É verdade que $(-5)^{2} = 25$, mas o radical foi definido para devolver um único valor, o não negativo. A segunda: $\\sqrt{-9}$ não existe entre os números reais, porque nenhum real elevado ao quadrado resulta negativo.",
                    },
                    {
                        type: "text",
                        value: "## A raiz cúbica\n\nA **raiz cúbica** pergunta qual número, elevado ao cubo, devolve o radicando. Escrevemos o índice $3$ junto ao radical:\n\n$$\\sqrt[3]{27} = 3 \\quad \\text{porque} \\quad 3^{3} = 27$$\n\nAo contrário da raiz quadrada, a raiz cúbica aceita radicando negativo, porque um número negativo elevado ao cubo continua negativo: $\\sqrt[3]{-8} = -2$, já que $(-2)^{3} = -8$. A diferença vem do índice: índice par exige radicando não negativo, índice ímpar aceita qualquer sinal.\n\nUma medida de verdade: uma caixa cúbica de $1000$ litros tem $1000$ decímetros cúbicos de volume, e a aresta mede\n\n$$\\sqrt[3]{1000} = 10 \\text{ dm} = 1 \\text{ m}$$",
                    },
                    {
                        type: "text",
                        value: "## Simplificando radical com fatores primos\n\nNem todo radicando é quadrado perfeito, mas muitos escondem um dentro. A fatoração em primos mostra qual é. Tome $\\sqrt{72}$ e fatore o $72$:\n\n$$72 = 2^{3} \\cdot 3^{2} = 2^{2} \\cdot 3^{2} \\cdot 2$$\n\nOs fatores com expoente par saem da raiz, e o que sobra fica embaixo dela:\n\n$$\\sqrt{72} = \\sqrt{2^{2} \\cdot 3^{2} \\cdot 2} = 2 \\cdot 3 \\cdot \\sqrt{2} = 6\\sqrt{2}$$\n\nA receita é sempre a mesma: fature o radicando, agrupe os fatores iguais em pares (em trios, se a raiz for cúbica), tire um fator de cada grupo completo e deixe o resto dentro do radical. Conferindo por aproximação, $6 \\cdot 1{,}41 = 8{,}46$, e $8{,}46^{2}$ dá $71{,}57$, bem perto de $72$.",
                    },
                    {
                        type: "text",
                        value: "## Raiz de um produto e de um quociente\n\nA raiz se distribui sobre produto e sobre quociente:\n\n$$\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b} \\qquad \\sqrt{\\frac{a}{b}} = \\frac{\\sqrt{a}}{\\sqrt{b}}$$\n\ncom $a \\ge 0$ e $b > 0$ no caso do quociente. É o que permite separar a parte fácil da difícil:\n\n$$\\sqrt{\\frac{49}{100}} = \\frac{\\sqrt{49}}{\\sqrt{100}} = \\frac{7}{10} = 0{,}7$$\n\nNa prática, é isso que faz $\\sqrt{0{,}49} = 0{,}7$ parecer natural, porque $0{,}49$ é a fração $\\frac{49}{100}$ escrita em decimal. O mesmo truque resolve $\\sqrt{0{,}0004} = \\frac{2}{100} = 0{,}02$.",
                    },
                    {
                        type: "text",
                        value: "## Raiz não exata e aproximação\n\nQuando o radicando não é quadrado perfeito, a raiz é um número irracional: decimal infinito e sem período, como $\\sqrt{2} = 1{,}41421\\dots$. Não dá para escrever o valor exato em decimal, mas dá para cercá-lo entre dois inteiros e refinar.\n\nSuponha uma praça quadrada de $40$ metros quadrados. Qual é o lado?\n\nPrimeiro, os quadrados perfeitos vizinhos: $6^{2} = 36$ e $7^{2} = 49$. Como $36 < 40 < 49$, o lado está entre $6$ e $7$ metros, e mais perto de $6$, porque $40$ está mais perto de $36$. Testando um decimal, $6{,}3^{2} = 39{,}69$ e $6{,}4^{2} = 40{,}96$. Logo\n\n$$\\sqrt{40} \\approx 6{,}32$$\n\nEsse cerco entre quadrados perfeitos é a ferramenta mais útil do assunto, porque funciona de cabeça e já entrega o tamanho da resposta.",
                    },
                    {
                        type: "text",
                        value: "## O cuidado com a raiz de uma soma\n\nA raiz se distribui sobre produto e sobre quociente, e **não** sobre soma. Escrever $\\sqrt{a + b} = \\sqrt{a} + \\sqrt{b}$ é falso, e um único exemplo derruba a ideia:\n\n$$\\sqrt{9 + 16} = \\sqrt{25} = 5 \\qquad \\text{mas} \\qquad \\sqrt{9} + \\sqrt{16} = 3 + 4 = 7$$\n\nCinco não é sete. Dentro do radical, a ordem é resolver a soma primeiro e tirar a raiz depois, exatamente como o parêntese manda.\n\nEsse cuidado volta sempre que uma medida vem de uma soma debaixo da raiz, como no cálculo da diagonal de um retângulo de lados $3$ e $4$: ela mede $\\sqrt{9 + 16} = 5$, e não $7$.",
                    },
                    {
                        type: "quote",
                        value: "A raiz é a operação inversa da potência: a quadrada devolve sempre um valor não negativo e exige radicando não negativo, enquanto a cúbica aceita radicando de qualquer sinal. A fatoração em primos simplifica o radical, a raiz se distribui sobre produto e quociente mas nunca sobre soma, e cercar o radicando entre quadrados perfeitos resolve a raiz não exata de cabeça.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um piso quadrado tem $144$ metros quadrados de área. Quanto mede o lado, em metros?",
                        difficulty: "facil",
                        options: [
                            { text: "$48$", isCorrect: false },
                            { text: "$72$", isCorrect: false },
                            { text: "$288$", isCorrect: false },
                            { text: "$12$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Uma caixa cúbica tem volume de $1000$ decímetros cúbicos. Quanto mede a aresta, em decímetros?",
                        difficulty: "facil",
                        options: [
                            { text: "$333$", isCorrect: false },
                            { text: "$100$", isCorrect: false },
                            { text: "$10$", isCorrect: true },
                            { text: "$31{,}6$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A forma simplificada de $\\sqrt{72}$ é:",
                        difficulty: "medio",
                        options: [
                            { text: "$6\\sqrt{3}$", isCorrect: false },
                            { text: "$6\\sqrt{2}$", isCorrect: true },
                            { text: "$36\\sqrt{2}$", isCorrect: false },
                            { text: "$2\\sqrt{6}$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor de $\\sqrt{36 + 64}$?",
                        difficulty: "medio",
                        options: [
                            { text: "$100$", isCorrect: false },
                            { text: "$50$", isCorrect: false },
                            { text: "$10$", isCorrect: true },
                            { text: "$14$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Sem usar calculadora, entre quais inteiros consecutivos está $\\sqrt{150}$?",
                        difficulty: "dificil",
                        options: [
                            { text: "entre $13$ e $14$", isCorrect: false },
                            { text: "entre $74$ e $76$", isCorrect: false },
                            { text: "entre $11$ e $12$", isCorrect: false },
                            { text: "entre $12$ e $13$", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Notação científica",
                blocks: [
                    {
                        type: "text",
                        value: "# Notação científica\n\nA distância média da Terra ao Sol é de $149\\,600\\,000$ quilômetros. A espessura da parede de uma bolha de sabão é de $0{,}0000005$ metro. Ler, copiar e multiplicar números assim contando zero por zero é pedir para errar, e basta um zero a mais para a resposta ficar dez vezes fora. A **notação científica** resolve o problema escrevendo qualquer número como um algarismo, uma vírgula e uma potência de dez.",
                    },
                    {
                        type: "text",
                        value: "## A forma da notação científica\n\nUm número está em notação científica quando aparece como\n\n$$a \\times 10^{n}$$\n\ncom $1 \\le a < 10$ e $n$ inteiro. O fator $a$ é chamado de **mantissa** e carrega os algarismos que importam; a potência de dez carrega o tamanho.\n\nA restrição $1 \\le a < 10$ é o que torna a escrita única. O número $149\\,600\\,000$ também pode ser escrito como $14{,}96 \\times 10^{7}$ ou como $0{,}1496 \\times 10^{9}$, e todas essas formas valem o mesmo, mas só uma tem a mantissa entre $1$ e $10$:\n\n$$149\\,600\\,000 = 1{,}496 \\times 10^{8}$$\n\nAs outras duas são corretas como números e erradas como notação científica.",
                    },
                    {
                        type: "text",
                        value: "## Escrevendo um número grande\n\nA receita é direta: ande com a vírgula para a esquerda até sobrar um único algarismo antes dela, e conte quantas casas andou. Esse número de casas é o expoente, positivo.\n\nA população do Brasil é de cerca de $203\\,000\\,000$ de habitantes. A vírgula está no fim, depois do último zero. Andando até a mantissa ficar $2{,}03$, percorremos oito casas:\n\n$$203\\,000\\,000 = 2{,}03 \\times 10^{8}$$\n\nSempre confira ao contrário: $2{,}03 \\times 10^{8}$ manda a vírgula oito casas para a direita e devolve $203\\,000\\,000$. Essa conferência leva cinco segundos e pega quase todo erro de contagem de casas.",
                    },
                    {
                        type: "text",
                        value: "## Escrevendo um número pequeno\n\nPara número menor que $1$, a vírgula anda no outro sentido, para a direita, e o expoente fica negativo.\n\nA espessura de uma folha de papel é $0{,}0001$ metro. Andando com a vírgula até a mantissa ficar $1$, percorremos quatro casas:\n\n$$0{,}0001 = 1 \\times 10^{-4} \\text{ m}$$\n\nOutro exemplo, bem menor: o diâmetro de um átomo de hidrogênio é de aproximadamente $0{,}0000000001$ metro, isto é\n\n$$0{,}0000000001 = 1 \\times 10^{-10} \\text{ m}$$\n\nO sinal do expoente funciona, então, como um indicador de tamanho: positivo para número maior que $1$, negativo para número entre $0$ e $1$. E o expoente $0$ aparece quando a própria mantissa já resolve, como em $7{,}2 = 7{,}2 \\times 10^{0}$.",
                    },
                    {
                        type: "text",
                        value: "## Multiplicação e divisão\n\nAqui a notação científica mostra para que serve. Multiplicamos as mantissas entre si e aplicamos às potências de dez as propriedades de sempre: somar expoentes no produto, subtrair no quociente.\n\n$$(4 \\times 10^{5}) \\cdot (2 \\times 10^{-8}) = (4 \\cdot 2) \\times 10^{5+(-8)} = 8 \\times 10^{-3}$$\n\nQuando a mantissa do resultado sai do intervalo de $1$ a $10$, ajustamos no fim:\n\n$$(5 \\times 10^{4}) \\cdot (4 \\times 10^{3}) = 20 \\times 10^{7} = 2 \\times 10^{8}$$\n\nUma divisão com dados reais: quantos átomos de hidrogênio, em fila, cobrem um milímetro? O milímetro é $1 \\times 10^{-3}$ metro e o átomo mede $1 \\times 10^{-10}$ metro, então\n\n$$\\frac{1 \\times 10^{-3}}{1 \\times 10^{-10}} = 10^{-3-(-10)} = 10^{7}$$\n\nDez milhões de átomos por milímetro.",
                    },
                    {
                        type: "text",
                        value: "## Soma com expoentes diferentes\n\nNa soma não existe atalho de expoente: só podemos somar mantissas quando a potência de dez é a mesma. Então igualamos primeiro, e aqui vale a pena escrever o menor na potência do maior, porque assim a mantissa final já sai pronta.\n\nUma cidade tem $3{,}5 \\times 10^{6}$ habitantes e recebe $4 \\times 10^{5}$ visitantes num feriado. Qual é o total de pessoas?\n\nReescreva a segunda parcela: $4 \\times 10^{5} = 0{,}4 \\times 10^{6}$. Agora as duas combinam:\n\n$$3{,}5 \\times 10^{6} + 0{,}4 \\times 10^{6} = 3{,}9 \\times 10^{6}$$\n\nO erro a evitar é somar os expoentes e escrever $7{,}5 \\times 10^{11}$. Isso daria setecentos e cinquenta bilhões de pessoas, quase cem vezes a população do planeta, e o próprio tamanho absurdo do resultado já denuncia a conta.",
                    },
                    {
                        type: "text",
                        value: "## Lendo dado real em notação científica\n\nQuase todo dado de ciência vem escrito assim, e a leitura fica imediata quando se olha primeiro o expoente, que diz o tamanho, e só depois a mantissa, que diz o detalhe.\n\n| Grandeza | Valor |\n| --- | --- |\n| Distância da Terra à Lua | $3{,}8 \\times 10^{8}$ m |\n| Distância da Terra ao Sol | $1{,}5 \\times 10^{11}$ m |\n| Raio da Terra | $6{,}4 \\times 10^{6}$ m |\n| Velocidade da luz | $3{,}0 \\times 10^{8}$ m/s |\n| Massa de um elétron | $9{,}1 \\times 10^{-31}$ kg |\n\nCom a tabela na mão, uma pergunta clássica sai em duas linhas: quanto tempo a luz do Sol leva para chegar até nós? Tempo é distância dividida por velocidade:\n\n$$\\frac{1{,}5 \\times 10^{11}}{3{,}0 \\times 10^{8}} = 0{,}5 \\times 10^{3} = 5 \\times 10^{2} \\text{ s}$$\n\nQuinhentos segundos, pouco mais de oito minutos. A luz que você vê agora saiu do Sol antes de você começar a ler esta aula.",
                    },
                    {
                        type: "quote",
                        value: "Notação científica escreve qualquer número como uma mantissa entre um e dez multiplicada por uma potência de dez, e o expoente conta as casas que a vírgula andou, positivo para número grande e negativo para número pequeno. Em produto e quociente operamos mantissas e expoentes separadamente; em soma é preciso igualar os expoentes antes de somar.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "A distância média da Terra ao Sol é de $149\\,600\\,000$ quilômetros. Em notação científica, esse valor é:",
                        difficulty: "facil",
                        options: [
                            { text: "$1{,}496 \\times 10^{8}$", isCorrect: true },
                            { text: "$1{,}496 \\times 10^{9}$", isCorrect: false },
                            { text: "$14{,}96 \\times 10^{7}$", isCorrect: false },
                            { text: "$1{,}496 \\times 10^{-8}$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "A espessura de uma folha de papel é $0{,}0001$ metro. Em notação científica, essa medida é:",
                        difficulty: "facil",
                        options: [
                            { text: "$1 \\times 10^{-4}$", isCorrect: true },
                            { text: "$1 \\times 10^{-3}$", isCorrect: false },
                            { text: "$10 \\times 10^{-5}$", isCorrect: false },
                            { text: "$1 \\times 10^{4}$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "O produto $(4 \\times 10^{5}) \\cdot (2 \\times 10^{-8})$, escrito em notação científica, vale:",
                        difficulty: "medio",
                        options: [
                            { text: "$8 \\times 10^{13}$", isCorrect: false },
                            { text: "$8 \\times 10^{-3}$", isCorrect: true },
                            { text: "$8 \\times 10^{-40}$", isCorrect: false },
                            { text: "$6 \\times 10^{-3}$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma cidade tem $3{,}5 \\times 10^{6}$ habitantes e recebe $4 \\times 10^{5}$ visitantes num feriado. Qual é o total de pessoas, em notação científica?",
                        difficulty: "medio",
                        options: [
                            { text: "$7{,}5 \\times 10^{6}$", isCorrect: false },
                            { text: "$3{,}54 \\times 10^{6}$", isCorrect: false },
                            { text: "$7{,}5 \\times 10^{11}$", isCorrect: false },
                            { text: "$3{,}9 \\times 10^{6}$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "A luz viaja a $3{,}0 \\times 10^{8}$ metros por segundo e o Sol está a $1{,}5 \\times 10^{11}$ metros da Terra. Quanto tempo a luz do Sol leva para chegar até aqui?",
                        difficulty: "dificil",
                        options: [
                            { text: "$4{,}5 \\times 10^{19}$ s", isCorrect: false },
                            { text: "$5 \\times 10^{3}$ s", isCorrect: false },
                            { text: "$5 \\times 10^{2}$ s", isCorrect: true },
                            { text: "$2 \\times 10^{-3}$ s", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Estimativa, arredondamento e ordem de grandeza",
                blocks: [
                    {
                        type: "text",
                        value: "# Estimativa, arredondamento e ordem de grandeza\n\nO caixa do mercado passa três produtos de cerca de $20$ reais cada e a tela mostra $237$ reais. Sem fazer conta nenhuma você já sabe que algo está errado, porque $3 \\cdot 20$ é $60$. Esse reflexo tem nome: **estimativa**. Ele não substitui a conta exata, ele avisa quando a conta exata saiu do trilho.",
                    },
                    {
                        type: "text",
                        value: "## Arredondando com regra\n\nArredondar é trocar um número por outro mais simples e próximo. A regra olha o primeiro algarismo que vai ser descartado: se ele é $0$, $1$, $2$, $3$ ou $4$, o algarismo anterior fica como está; se é $5$, $6$, $7$, $8$ ou $9$, o anterior sobe uma unidade.\n\n| Número | Arredondado ao inteiro | Arredondado ao décimo |\n| --- | --- | --- |\n| $19{,}87$ | $20$ | $19{,}9$ |\n| $4{,}21$ | $4$ | $4{,}2$ |\n| $7{,}50$ | $8$ | $7{,}5$ |\n\nArredondar sempre perde informação, e é por isso que ele serve para conferir, não para responder. A resposta final sai da conta exata.",
                    },
                    {
                        type: "text",
                        value: "## Usando o arredondamento para conferir uma conta\n\nOlhe o produto $19{,}87 \\times 4{,}2$. Arredondando cada fator ao inteiro mais próximo, a estimativa é\n\n$$20 \\times 4 = 80$$\n\nEntão o resultado tem de ficar na vizinhança de $80$. A conta exata dá $83{,}454$, o que confirma a estimativa. Se a calculadora tivesse mostrado $8{,}3454$ ou $834{,}54$, a estimativa denunciaria na hora um erro de vírgula, que é o erro de digitação mais frequente que existe.\n\nRepare também em uma disciplina importante: arredonde para conferir, nunca no meio da conta. Em $\\frac{9{,}6}{3{,}2}$ o valor exato é $3$; arredondando antes, $\\frac{10}{3}$ dá $3{,}33\\dots$, e esse desvio só cresce quando a conta tem vários passos encadeados.",
                    },
                    {
                        type: "text",
                        value: "## Estimativa com potência de dez\n\nEm números grandes, arredondar para uma potência de dez transforma uma divisão impossível de cabeça em uma subtração de expoentes.\n\nUma empresa faturou $4\\,850\\,000$ reais no ano e atendeu $98\\,000$ clientes. Quanto gastou cada cliente, em média?\n\nArredonde os dois para notação científica simples: o faturamento é quase $5 \\times 10^{6}$ e o número de clientes é quase $1 \\times 10^{5}$. Então\n\n$$\\frac{5 \\times 10^{6}}{1 \\times 10^{5}} = 5 \\times 10^{1} = 50$$\n\nCerca de cinquenta reais por cliente. A conta exata dá $49{,}49\\dots$, e a estimativa acertou o tamanho da resposta sem papel nenhum, o que já basta para saber se um número que alguém falou em reunião faz sentido.",
                    },
                    {
                        type: "text",
                        value: "## Ordem de grandeza\n\nA **ordem de grandeza** de um número é a potência de dez mais próxima dele. Para encontrá-la, escreva o número como $a \\times 10^{n}$ com $1 \\le a < 10$ e compare a mantissa com $\\sqrt{10} \\approx 3{,}16$, que é o meio da escala entre uma potência e a seguinte:\n\n- se $a < 3{,}16$, a ordem de grandeza é $10^{n}$;\n- se $a \\ge 3{,}16$, a ordem de grandeza é $10^{n+1}$.\n\nA população do Brasil, $2{,}03 \\times 10^{8}$, tem mantissa menor que $3{,}16$, então sua ordem de grandeza é $10^{8}$: estamos na casa das centenas de milhões.\n\nJá uma cidade de $850\\,000$ habitantes é $8{,}5 \\times 10^{5}$, e como $8{,}5$ passa de $3{,}16$ a ordem de grandeza é $10^{6}$: essa cidade está mais perto de um milhão de habitantes do que de cem mil.",
                    },
                    {
                        type: "text",
                        value: '## Comparando por ordem de grandeza\n\nOrdem de grandeza é a ferramenta certa para a pergunta "quantas vezes maior". O raio da Terra mede $6{,}4 \\times 10^{6}$ metros e uma pessoa mede cerca de $1{,}6$ metro. A razão entre os dois é\n\n$$\\frac{6{,}4 \\times 10^{6}}{1{,}6} = 4 \\times 10^{6}$$\n\nA Terra é alguns milhões de vezes maior que uma pessoa. O valor exato importa pouco aqui: o que a resposta diz é que há seis ordens de grandeza de diferença entre as duas medidas, e esse é o tipo de informação que não se perde na memória.\n\nCompare também dois dados que já apareceram neste módulo: a distância da Terra à Lua é $3{,}8 \\times 10^{8}$ metros e a distância da Terra ao Sol é $1{,}5 \\times 10^{11}$ metros. A diferença de expoentes é $3$, e dividindo as mantissas chegamos a cerca de $400$: o Sol está quatrocentas vezes mais longe que a Lua.',
                    },
                    {
                        type: "text",
                        value: "## Estimativa de Fermi\n\nO físico Enrico Fermi ficou conhecido por responder perguntas aparentemente impossíveis quebrando-as em fatores que qualquer pessoa consegue chutar com razoável segurança. Cada chute erra um pouco, para mais ou para menos, e os erros tendem a se compensar, de modo que o resultado final costuma cair na ordem de grandeza certa.\n\nA pergunta: quantos litros de água uma pessoa bebe ao longo da vida?\n\nQuebre em fatores palpáveis:\n\n- consumo diário: cerca de $2$ litros;\n- dias por ano: cerca de $365$, que arredondamos para $4 \\times 10^{2}$;\n- anos de vida: cerca de $75$, que arredondamos para $8 \\times 10^{1}$.\n\nMultiplicando tudo:\n\n$$2 \\cdot (4 \\times 10^{2}) \\cdot (8 \\times 10^{1}) = 64 \\times 10^{3} = 6{,}4 \\times 10^{4}$$\n\nAlgo em torno de $60$ mil litros, o equivalente a trinta caixas de dois mil litros. A conta sem arredondar dá $2 \\cdot 365 \\cdot 75 = 54\\,750$ litros, confortavelmente na mesma faixa. Note o que a estimativa de Fermi promete e o que não promete: ela acerta a potência de dez da resposta, não os algarismos.",
                    },
                    {
                        type: "quote",
                        value: "Arredondar e estimar não substituem a conta exata, eles conferem se ela faz sentido: o produto de um número perto de vinte por outro perto de quatro tem de ficar perto de oitenta. A ordem de grandeza compara a mantissa com a raiz de dez para dizer em qual potência o número vive, e a estimativa de Fermi chega nessa potência quebrando o problema em fatores palpáveis.",
                    },
                ],
                questions: [
                    {
                        statement: "Arredondando $19{,}87$ para o inteiro mais próximo, obtemos:",
                        difficulty: "facil",
                        options: [
                            { text: "$18$", isCorrect: false },
                            { text: "$19{,}9$", isCorrect: false },
                            { text: "$19$", isCorrect: false },
                            { text: "$20$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Arredondando cada fator ao inteiro mais próximo, qual é a estimativa do produto $19{,}87 \\times 4{,}2$?",
                        difficulty: "facil",
                        options: [
                            { text: "$20 \\times 4 = 80$", isCorrect: true },
                            { text: "$2 \\times 4 = 8$", isCorrect: false },
                            { text: "$19 \\times 4 = 76$", isCorrect: false },
                            { text: "$20 \\times 5 = 100$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "A população de uma cidade é de $850\\,000$ habitantes. Qual é a ordem de grandeza desse número, ou seja, a potência de dez mais próxima dele?",
                        difficulty: "medio",
                        options: [
                            { text: "$10^{5}$", isCorrect: false },
                            { text: "$10^{4}$", isCorrect: false },
                            { text: "$10^{6}$", isCorrect: true },
                            { text: "$10^{7}$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "O raio da Terra mede cerca de $6{,}4 \\times 10^{6}$ metros e uma pessoa mede cerca de $1{,}6$ metro. O raio da Terra é maior que a pessoa aproximadamente quantas vezes?",
                        difficulty: "medio",
                        options: [
                            { text: "$4 \\times 10^{7}$", isCorrect: false },
                            { text: "$4 \\times 10^{5}$", isCorrect: false },
                            { text: "$1 \\times 10^{6}$", isCorrect: false },
                            { text: "$4 \\times 10^{6}$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Supondo que uma pessoa beba $2$ litros de água por dia ao longo de $80$ anos, qual é a ordem de grandeza do total de água que ela bebe na vida?",
                        difficulty: "dificil",
                        options: [
                            { text: "$10^{4}$ litros", isCorrect: false },
                            { text: "$10^{6}$ litros", isCorrect: false },
                            { text: "$10^{5}$ litros", isCorrect: true },
                            { text: "$10^{3}$ litros", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Da aritmética para a álgebra",
        aulas: [
            {
                titulo: "A linguagem algébrica: a letra que guarda um número",
                blocks: [
                    {
                        type: "text",
                        value: "# A linguagem algébrica: a letra que guarda um número\n\nAlguém diz: pensei em um número, somei $7$ e cheguei a $19$. Você provavelmente já descobriu que o número era $12$, e descobriu de cabeça, sem escrever nada. Agora troque os números: pensei em um número, multipliquei por $13$, subtraí $48$ e cheguei a $212$. A conta de cabeça trava.\n\nA álgebra existe justamente para esses casos. Em vez de adivinhar, damos um nome ao número desconhecido, escrevemos a frase em símbolos e deixamos as regras das operações trabalharem para nós. Esse nome costuma ser uma letra, e esta aula é inteira sobre aprender a ler e a escrever nessa linguagem.",
                    },
                    {
                        type: "text",
                        value: "## Por que uma letra\n\nPense no perímetro de um quadrado. Se o lado mede $3$ cm, o perímetro é $4 \\cdot 3 = 12$ cm. Se o lado mede $7{,}5$ cm, o perímetro é $4 \\cdot 7{,}5 = 30$ cm. A conta muda, mas o procedimento é sempre o mesmo: multiplicar a medida do lado por $4$.\n\nEm vez de repetir a frase multiplique o lado por quatro para cada medida possível, escrevemos uma vez só:\n\n$$P = 4a$$\n\nAqui $a$ representa a medida do lado, qualquer que seja ela. A letra não é um mistério nem um enigma: ela é um espaço reservado para um número que ainda não escolhemos.",
                    },
                    {
                        type: "text",
                        value: "## A letra como incógnita\n\nQuando a letra representa um número específico, que existe mas está escondido, ela é chamada de **incógnita**. Na primeira frase desta aula, chamando o número pensado de $x$, temos\n\n$$x + 7 = 19$$\n\nExiste um único valor de $x$ que torna essa igualdade verdadeira, e é ele que queremos encontrar. Procurar esse valor é resolver uma **equação**.\n\nNa segunda frase, a que travou a conta de cabeça, a tradução é $13x - 48 = 212$. Guarde essa igualdade: em poucas aulas ela se resolve em três linhas, e a resposta é $x = 20$.",
                    },
                    {
                        type: "text",
                        value: "## A letra como variável\n\nHá outro uso da letra, bem diferente do primeiro. Em uma padaria, o pão custa $0{,}75$ cada. O preço de $n$ pães é\n\n$$P = 0{,}75n$$\n\nAqui $n$ não está escondido: ele pode ser $1$, $10$ ou $40$, e cada escolha devolve um preço. A letra que percorre vários valores é chamada de **variável**.\n\n| $n$ (pães) | $P = 0{,}75n$ (reais) |\n| --- | --- |\n| $4$ | $3{,}00$ |\n| $10$ | $7{,}50$ |\n| $20$ | $15{,}00$ |\n\nA mesma letra, portanto, pode cumprir dois papéis: incógnita quando existe um valor escondido a descobrir, variável quando existe uma regra valendo para muitos valores. O símbolo é o mesmo, o que muda é a intenção de quem escreveu.",
                    },
                    {
                        type: "text",
                        value: "## Traduzindo frase em expressão\n\nEsta é a parte que mais trava, e ela se aprende com repetição. Chame o número desconhecido de $x$ e caminhe pela frase palavra por palavra.\n\n| Em português | Em símbolos |\n| --- | --- |\n| um número | $x$ |\n| o dobro de um número | $2x$ |\n| o triplo de um número | $3x$ |\n| a metade de um número | $\\frac{x}{2}$ |\n| a terça parte de um número | $\\frac{x}{3}$ |\n| um número aumentado em $5$ | $x + 5$ |\n| cinco a menos que um número | $x - 5$ |\n| o sucessor de um número | $x + 1$ |\n| o antecessor de um número | $x - 1$ |\n| a soma de um número com o seu dobro | $x + 2x$ |\n| a metade da soma de um número com $3$ | $\\frac{x + 3}{2}$ |\n| a soma da metade de um número com $3$ | $\\frac{x}{2} + 3$ |\n| o quadrado de um número | $x^2$ |\n\nCompare as duas penúltimas linhas com atenção, porque elas parecem iguais e não são. Em a metade da soma, a soma acontece primeiro e a divisão por dois recai sobre o resultado inteiro, por isso a barra de fração cobre todo o $x + 3$. Em a soma da metade, a divisão recai só sobre o número. Para $x = 6$, a primeira vale $\\frac{6 + 3}{2} = 4{,}5$ e a segunda vale $\\frac{6}{2} + 3 = 6$. Frases parecidas, resultados diferentes.",
                    },
                    {
                        type: "text",
                        value: "## Os dois erros de ordem\n\nSoma e multiplicação não se importam com a ordem: $x + 5$ e $5 + x$ valem o mesmo, e $3x$ é igual a $x \\cdot 3$. Subtração e divisão se importam, e é exatamente aí que a tradução escorrega.\n\nCinco a menos que um número significa partir do número e tirar cinco: $x - 5$. Muita gente escreve $5 - x$, lendo as palavras na ordem em que aparecem no papel. O teste resolve a dúvida em segundos: com $x = 12$, cinco a menos que doze é $7$, e $x - 5 = 12 - 5 = 7$ confere, enquanto $5 - x = -7$ não.\n\nO mesmo vale para divisão. Um número dividido por $3$ é $\\frac{x}{3}$, e não $\\frac{3}{x}$. Com $x = 12$, a primeira expressão dá $4$ e a segunda dá $\\frac{1}{4}$.\n\nA receita contra esse erro é sempre a mesma: troque a letra por um número fácil e veja se a expressão responde o que a frase prometia.",
                    },
                    {
                        type: "text",
                        value: "## O produto escrito sem sinal\n\nEm álgebra, o sinal de multiplicação entre um número e uma letra simplesmente desaparece:\n\n$$3 \\cdot x = 3x \\qquad a \\cdot b = ab \\qquad 5 \\cdot (x + 1) = 5(x + 1)$$\n\nHá dois motivos para essa convenção. O primeiro é economia de escrita. O segundo é que o símbolo $\\times$ se confunde com a letra $x$, que é justamente a mais usada para representar a incógnita.\n\nTrês consequências práticas, todas cobradas em prova:\n\n- Entre dois números o sinal continua obrigatório: $2 \\cdot 3$ não pode virar $23$.\n- O coeficiente $1$ não se escreve: $x$ já é $1x$, e $-x$ já é $-1x$.\n- Dois símbolos colados significam produto, nunca soma: $xy$ é $x$ vezes $y$, enquanto a soma é $x + y$.\n\nE um aviso que vale repetir: $x^2$ é $x \\cdot x$, não $2x$. Para $x = 5$, temos $x^2 = 25$ e $2x = 10$.",
                    },
                    {
                        type: "quote",
                        value: "A letra em matemática é um espaço reservado para um número: incógnita quando há um único valor escondido a descobrir, variável quando há uma regra valendo para muitos valores. Traduzir frase em expressão exige respeitar a ordem na subtração e na divisão, e o teste mais rápido é trocar a letra por um número fácil e conferir se a expressão responde o que a frase prometia.",
                    },
                ],
                questions: [
                    {
                        statement:
                            'A frase "cinco a menos que um número" é traduzida por qual expressão algébrica?',
                        difficulty: "facil",
                        options: [
                            { text: "$5 - x$", isCorrect: false },
                            { text: "$x - 5$", isCorrect: true },
                            { text: "$x + 5$", isCorrect: false },
                            { text: "$5x$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Pela convenção de escrever o produto sem sinal, o produto $3 \\cdot x$ é escrito como:",
                        difficulty: "facil",
                        options: [
                            { text: "$x^3$", isCorrect: false },
                            { text: "$\\frac{3}{x}$", isCorrect: false },
                            { text: "$3x$", isCorrect: true },
                            { text: "$3 + x$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            'Chamando o número de $x$, a expressão que representa "a metade da soma de um número com $8$" é:',
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{x}{2} + 8$", isCorrect: false },
                            { text: "$\\frac{x}{2 + 8}$", isCorrect: false },
                            { text: "$\\frac{x + 8}{2}$", isCorrect: true },
                            { text: "$2(x + 8)$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Em qual das situações a letra está funcionando como incógnita, e não como variável?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Em $P = 4a$, onde o lado do quadrado pode assumir qualquer medida positiva",
                                isCorrect: false,
                            },
                            {
                                text: "Em $P = 0{,}75n$, onde $n$ é a quantidade de pães comprados",
                                isCorrect: false,
                            },
                            {
                                text: "Em $d = 80t$, onde $t$ é o número de horas de viagem",
                                isCorrect: false,
                            },
                            {
                                text: "Em $x + 7 = 19$, onde um único valor torna a igualdade verdadeira",
                                isCorrect: true,
                            },
                        ],
                    },
                    {
                        statement:
                            "O triplo de um número, menos a metade desse mesmo número, é igual a $20$. Qual igualdade traduz essa frase?",
                        difficulty: "dificil",
                        options: [
                            { text: "$3\\left(x - \\frac{x}{2}\\right) = 20$", isCorrect: false },
                            { text: "$\\frac{3x - x}{2} = 20$", isCorrect: false },
                            { text: "$3x - \\frac{x}{2} = 20$", isCorrect: true },
                            { text: "$3x - \\frac{1}{2} = 20$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Expressões algébricas e valor numérico",
                blocks: [
                    {
                        type: "text",
                        value: "# Expressões algébricas e valor numérico\n\nUma oficina cobra $90$ reais pela visita mais $70$ reais por hora de trabalho. Em vez de refazer a conta a cada serviço, o dono escreve uma fórmula única:\n\n$$C = 90 + 70h$$\n\nCom $h = 2$, o custo é $90 + 70 \\cdot 2 = 230$ reais. Com $h = 5$, é $90 + 70 \\cdot 5 = 440$ reais. Essa fórmula é uma **expressão algébrica**, e o número que ela devolve para cada valor da letra é o **valor numérico** da expressão.\n\nNesta aula vamos aprender a arrumar uma expressão antes de calcular e a substituir valores sem errar o sinal.",
                    },
                    {
                        type: "text",
                        value: "## Termo, coeficiente e parte literal\n\nUma expressão algébrica é uma soma de **termos**. Em $5x^2 - 3xy + 7$, os termos são $5x^2$, $-3xy$ e $7$. O sinal pertence ao termo que vem depois dele, e isso importa muito na hora de somar.\n\nCada termo tem um **coeficiente**, que é a parte numérica, e uma **parte literal**, que são as letras com seus expoentes.\n\n| Termo | Coeficiente | Parte literal |\n| --- | --- | --- |\n| $5x^2$ | $5$ | $x^2$ |\n| $-3xy$ | $-3$ | $xy$ |\n| $x$ | $1$ | $x$ |\n| $-y$ | $-1$ | $y$ |\n| $7$ | $7$ | nenhuma |\n\nDuas observações que evitam confusão mais adiante: o coeficiente $1$ nunca aparece escrito, e o termo $7$, sem letra nenhuma, é chamado de **termo independente**, porque o seu valor não muda quando a letra muda.",
                    },
                    {
                        type: "text",
                        value: "## Termos semelhantes\n\nDois termos são **semelhantes** quando têm exatamente a mesma parte literal. Só o coeficiente pode ser diferente.\n\n- $3x$ e $-8x$ são semelhantes: a parte literal é $x$ nos dois.\n- $4ab$ e $9ba$ são semelhantes, porque a ordem das letras em um produto não altera o produto.\n- $3x$ e $3x^2$ **não** são semelhantes, porque o expoente faz parte da parte literal.\n- $5x$ e $5y$ **não** são semelhantes, porque as letras são diferentes.\n\nA ideia por trás disso é velha conhecida da aritmética: $3$ caixas mais $8$ caixas dão $11$ caixas, mas $3$ caixas mais $8$ garrafas não dão $11$ de nada. Em álgebra, a parte literal faz o papel da unidade.",
                    },
                    {
                        type: "text",
                        value: "## Reduzir a expressão\n\n**Reduzir** uma expressão é juntar os termos semelhantes, somando os coeficientes e mantendo a parte literal intacta:\n\n$$5x + 3y - 2x + 8y = (5 - 2)x + (3 + 8)y = 3x + 11y$$\n\nRepare que a parte literal não se soma: de $x$ com $x$ não sai $x^2$, sai $2x$.\n\nQuando há parênteses, o cuidado é com o sinal que está na frente deles. Um sinal de menos antes do parêntese troca o sinal de **todos** os termos de dentro:\n\n$$7x - (2x - 5) = 7x - 2x + 5 = 5x + 5$$\n\nMuita gente escreve $7x - 2x - 5$ e chega a $5x - 5$, porque trocou o sinal do primeiro termo e esqueceu do segundo. Para conferir, basta testar com $x = 1$: a expressão original vale $7 - (2 - 5) = 7 + 3 = 10$, e $5x + 5 = 10$ confere, enquanto $5x - 5 = 0$ não.",
                    },
                    {
                        type: "text",
                        value: "## Calcular o valor numérico\n\nPara achar o valor numérico, troque cada letra pelo número combinado e faça as contas na ordem correta das operações.\n\nVeja a expressão $2a + 3b$, para $a = 4$ e $b = 5$:\n\n$$2 \\cdot 4 + 3 \\cdot 5 = 8 + 15 = 23$$\n\nA mesma expressão muda de valor quando as letras mudam: para $a = 1$ e $b = 0$, ela vale $2$. É por isso que uma expressão algébrica não é um número: ela é uma receita de número, e só vira número quando a letra recebe um valor.",
                    },
                    {
                        type: "text",
                        value: "## O cuidado com o número negativo\n\nAqui está o erro mais frequente de toda esta aula. Ao substituir um número negativo, escreva o número **entre parênteses**. Veja a diferença em $x^2$ para $x = -3$:\n\n$$x^2 = (-3)^2 = (-3) \\cdot (-3) = 9$$\n\nQuem escreve $-3^2$ calcula primeiro a potência e só depois aplica o sinal, chegando a $-9$, que não é o valor pedido. O parêntese é o que informa que o sinal também está sendo elevado ao quadrado.\n\nOutro exemplo, com a expressão $4 - 2x$ para $x = -5$:\n\n$$4 - 2 \\cdot (-5) = 4 + 10 = 14$$\n\nO produto $-2 \\cdot (-5)$ é positivo, pela regra de sinais. Quem larga o parêntese escreve $4 - 2 \\cdot 5 = -6$ e perde o exercício.\n\nE guarde a diferença entre $(-x)^2$ e $-x^2$: para $x = 3$, o primeiro vale $9$ e o segundo vale $-9$.",
                    },
                    {
                        type: "text",
                        value: "## Reduzir antes de substituir\n\nSempre que a expressão tiver termos semelhantes, reduza primeiro e substitua depois. Compare os dois caminhos para $6x - (4x - 1) + 3x$ com $x = -2$.\n\nSubstituindo direto, aparecem seis contas com sinal, e cada uma delas é uma chance de errar. Reduzindo primeiro:\n\n$$6x - 4x + 1 + 3x = 5x + 1$$\n\nAgora a substituição cabe em uma linha: $5 \\cdot (-2) + 1 = -10 + 1 = -9$.\n\nMenos conta, menos sinal, menos erro. Esse é o ganho prático de arrumar a expressão antes de calcular, e ele cresce conforme as expressões ficam maiores.",
                    },
                    {
                        type: "quote",
                        value: "Uma expressão algébrica é uma soma de termos, cada um com seu coeficiente e sua parte literal, e só os termos de mesma parte literal podem ser somados. O valor numérico aparece ao trocar cada letra pelo seu valor, sempre com o número negativo entre parênteses, e reduzir antes de substituir é o que evita a maior parte dos erros de sinal.",
                    },
                ],
                questions: [
                    {
                        statement: "No termo $-7x^3y$, qual é o coeficiente?",
                        difficulty: "facil",
                        options: [
                            { text: "$3$", isCorrect: false },
                            { text: "$-7$", isCorrect: true },
                            { text: "$7$", isCorrect: false },
                            { text: "$-7x^3y$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Reduzindo a expressão $8x + 5 - 3x + 2$, obtemos:",
                        difficulty: "facil",
                        options: [
                            { text: "$11x + 7$", isCorrect: false },
                            { text: "$5x + 7$", isCorrect: true },
                            { text: "$12x$", isCorrect: false },
                            { text: "$5x + 3$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor numérico de $5a - 3b$ para $a = -3$ e $b = -2$?",
                        difficulty: "medio",
                        options: [
                            { text: "$-21$", isCorrect: false },
                            { text: "$9$", isCorrect: false },
                            { text: "$21$", isCorrect: false },
                            { text: "$-9$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A forma reduzida da expressão $7x - (2x - 4)$ é:",
                        difficulty: "medio",
                        options: [
                            { text: "$5x - 4$", isCorrect: false },
                            { text: "$5x$", isCorrect: false },
                            { text: "$5x + 4$", isCorrect: true },
                            { text: "$9x - 4$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o valor numérico de $x^2 - 3x$ para $x = -4$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$28$", isCorrect: true },
                            { text: "$-4$", isCorrect: false },
                            { text: "$4$", isCorrect: false },
                            { text: "$-28$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Equação do primeiro grau",
                blocks: [
                    {
                        type: "text",
                        value: "# Equação do primeiro grau\n\nUma loja anuncia: pague a entrada de $40$ reais e divida o resto em $3$ parcelas iguais. A fatura fechou em $190$ reais. Quanto vale cada parcela?\n\nChamando a parcela de $x$, a frase vira\n\n$$40 + 3x = 190$$\n\nEssa igualdade com uma letra escondida é uma **equação**. Nesta aula vamos resolver equações desse tipo de forma segura, entendendo o que cada passo faz, sem adivinhação e sem decorar regra solta.",
                    },
                    {
                        type: "text",
                        value: "## Equação, raiz e primeiro grau\n\nUma **equação** é uma igualdade que contém pelo menos uma incógnita. O número que, colocado no lugar da incógnita, torna a igualdade verdadeira é a **raiz**, também chamada de solução.\n\nEm $40 + 3x = 190$, a raiz é $50$: de fato, $40 + 3 \\cdot 50 = 190$. Já $x = 60$ não serve, porque daria $220$.\n\nA equação é do **primeiro grau** quando a incógnita aparece apenas com expoente $1$, sem quadrado, sem raiz e sem a letra no denominador. Toda equação desse tipo pode ser arrumada na forma\n\n$$ax + b = 0 \\quad (a \\neq 0)$$\n\ne tem exatamente uma raiz.\n\nGuarde a diferença entre expressão e equação: a expressão $3x + 2$ só vira número quando escolhemos o valor de $x$, enquanto a equação $3x + 2 = 11$ afirma uma igualdade e pede o valor que a torna verdadeira.",
                    },
                    {
                        type: "text",
                        value: "## A balança e o que pode ser feito nos dois lados\n\nImagine a equação como uma balança de dois pratos em equilíbrio. O sinal de igual é o fiel: os dois lados pesam o mesmo. Tudo o que você fizer em um prato tem que ser feito no outro, ou o equilíbrio se perde.\n\n| Operação nos dois lados | Mantém a igualdade? |\n| --- | --- |\n| somar o mesmo número | sim |\n| subtrair o mesmo número | sim |\n| multiplicar pelo mesmo número não nulo | sim |\n| dividir pelo mesmo número não nulo | sim |\n| mexer em um lado só | não |\n| dividir por zero | não |\n\nÉ daí que vem o famoso passa para o outro lado trocando o sinal. Em $x - 7 = 12$, somamos $7$ nos dois lados:\n\n$$x - 7 + 7 = 12 + 7 \\quad \\Rightarrow \\quad x = 19$$\n\nO $-7$ não voou para o outro lado por mágica: ele foi cancelado de um lado por uma soma feita nos dois. Entender isso é o que salva o aluno quando a equação fica mais longa e a regra decorada confunde.",
                    },
                    {
                        type: "text",
                        value: "## Resolvendo passo a passo\n\nO plano é sempre o mesmo: deixar os termos com a letra em um lado, os números no outro, e por último dividir pelo coeficiente que sobrou. Veja $5x - 8 = 2x + 7$.\n\nSubtraímos $2x$ dos dois lados:\n\n$$3x - 8 = 7$$\n\nSomamos $8$ aos dois lados:\n\n$$3x = 15$$\n\nDividimos os dois lados por $3$:\n\n$$x = 5$$\n\nSe houver parênteses, elimine-os antes de começar o plano. Em $3(x + 2) = x + 14$, primeiro distribuímos o $3$: $3x + 6 = x + 14$. Depois seguimos os mesmos passos e chegamos a $2x = 8$, ou seja, $x = 4$.",
                    },
                    {
                        type: "text",
                        value: "## Verificar a raiz\n\nResolver sem verificar é entregar o exercício no escuro. A verificação é rápida: substitua a raiz na equação **original** e confira se os dois lados devolvem o mesmo número.\n\nPara $x = 5$ em $5x - 8 = 2x + 7$:\n\n$$5 \\cdot 5 - 8 = 17 \\qquad 2 \\cdot 5 + 7 = 17$$\n\nOs dois lados valem $17$, então $5$ é mesmo a raiz. Se os valores saírem diferentes, o erro está em algum passo da conta, e a verificação acabou de avisar você antes da correção fazer isso.",
                    },
                    {
                        type: "text",
                        value: "## Equação com denominador\n\nFração em equação assusta mais do que incomoda. O truque é multiplicar os dois lados pelo MMC dos denominadores, o que faz todas as frações desaparecerem de uma vez.\n\nVeja $\\frac{x}{2} + \\frac{x - 1}{3} = 3$. O MMC de $2$ e $3$ é $6$, então multiplicamos tudo por $6$:\n\n$$6 \\cdot \\frac{x}{2} + 6 \\cdot \\frac{x - 1}{3} = 6 \\cdot 3$$\n\n$$3x + 2(x - 1) = 18$$\n\nDaqui em diante é a equação de sempre: $3x + 2x - 2 = 18$, logo $5x = 20$ e $x = 4$.\n\nO erro clássico aqui é multiplicar apenas os termos que têm fração e esquecer o $3$ do lado direito. Multiplicar os dois lados significa multiplicar **todos** os termos dos dois lados, inclusive os que não têm denominador.",
                    },
                    {
                        type: "text",
                        value: "## Quando não há raiz, e quando qualquer número serve\n\nNem toda equação do primeiro grau tem uma raiz só. Às vezes a letra desaparece no meio do caminho, e o que sobra decide a resposta.\n\nPrimeiro caso, $2x + 3 = 2x + 5$. Subtraindo $2x$ dos dois lados, sobra\n\n$$3 = 5$$\n\numa afirmação falsa. Nenhum valor de $x$ salva essa igualdade, então a equação **não tem solução**, e o conjunto solução é vazio.\n\nSegundo caso, $3(x + 2) = 3x + 6$. Distribuindo o lado esquerdo, fica $3x + 6 = 3x + 6$, e subtraindo $3x$ sobra\n\n$$6 = 6$$\n\numa afirmação sempre verdadeira. Aqui **qualquer** número real serve, e dizemos que a equação é uma identidade.\n\nA pista é a mesma nos dois casos: a incógnita se cancelou. Se o que restou é verdadeiro, serve tudo; se é falso, não serve nada. Note que $a = 0$ na forma $ax + b = 0$ é exatamente o que produz essas duas situações.",
                    },
                    {
                        type: "quote",
                        value: "Resolver uma equação do primeiro grau é manter a balança em equilíbrio: a mesma operação nos dois lados até a incógnita ficar sozinha, e a verificação na equação original para confirmar a raiz. Fração se resolve multiplicando tudo pelo MMC dos denominadores, e quando a incógnita se cancela sobra uma afirmação que decide entre nenhuma solução e todas elas.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a raiz da equação $4x - 12 = 0$?",
                        difficulty: "facil",
                        options: [
                            { text: "$x = 48$", isCorrect: false },
                            { text: "$x = 12$", isCorrect: false },
                            { text: "$x = 3$", isCorrect: true },
                            { text: "$x = -3$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Resolvendo a equação $x + 9 = 4$, obtemos:",
                        difficulty: "facil",
                        options: [
                            { text: "$x = 13$", isCorrect: false },
                            { text: "$x = -13$", isCorrect: false },
                            { text: "$x = 5$", isCorrect: false },
                            { text: "$x = -5$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual é a solução da equação $6x - 5 = 3x + 10$?",
                        difficulty: "medio",
                        options: [
                            { text: "$x = 15$", isCorrect: false },
                            { text: "$x = \\frac{5}{3}$", isCorrect: false },
                            { text: "$x = -5$", isCorrect: false },
                            { text: "$x = 5$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Qual é a raiz da equação $\\frac{x + 1}{2} = \\frac{x - 2}{3}$?",
                        difficulty: "medio",
                        options: [
                            { text: "$x = 7$", isCorrect: false },
                            { text: "$x = -1$", isCorrect: false },
                            { text: "$x = -7$", isCorrect: true },
                            { text: "$x = 1$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o conjunto solução da equação $4(x - 2) + 3 = 4x - 5$?",
                        difficulty: "dificil",
                        options: [
                            { text: "apenas o número $x = 0$", isCorrect: false },
                            { text: "apenas o número $x = -5$", isCorrect: false },
                            {
                                text: "nenhum número real, o conjunto solução é vazio",
                                isCorrect: false,
                            },
                            {
                                text: "todo número real, ou seja, $x \\in \\mathbb{R}$",
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Problemas que viram equação",
                blocks: [
                    {
                        type: "text",
                        value: "# Problemas que viram equação\n\nPerguntar quanto vale $x$ em $3x = 15$ é fácil. O difícil é ler um parágrafo em português e perceber que ele está dizendo $3x = 15$. Essa passagem do texto para o símbolo é a parte da álgebra que mais aparece em prova e na vida prática, e é também a que menos se treina.\n\nNesta aula o foco não é a conta: é o caminho que vai do enunciado até a equação, e a volta do resultado até a pergunta original.",
                    },
                    {
                        type: "text",
                        value: "## O roteiro de cinco passos\n\n| Passo | O que fazer |\n| --- | --- |\n| 1 | Ler o enunciado inteiro e marcar o que está sendo pedido |\n| 2 | Nomear a incógnita por escrito: seja $x$ a idade de Bia |\n| 3 | Escrever as outras quantidades usando essa mesma letra |\n| 4 | Montar a equação a partir da informação que amarra tudo |\n| 5 | Resolver e conferir a resposta no enunciado, não só na equação |\n\nO passo $2$ é o mais pulado, e pular custa caro: sem escrever quem é $x$, o aluno chega a um número e não sabe mais o que aquele número significa. O passo $5$ também não é enfeite, porque uma raiz pode satisfazer a equação e ainda assim ser impossível na situação descrita.",
                    },
                    {
                        type: "text",
                        value: "## Problema de idade\n\nA idade de Marcos é o triplo da idade de Bia. Juntos, os dois têm $48$ anos. Qual é a idade de cada um?\n\nSeja $x$ a idade de Bia. Então a idade de Marcos é $3x$. A informação que amarra as duas é a soma:\n\n$$x + 3x = 48$$\n\nReduzindo, $4x = 48$, logo $x = 12$. Bia tem $12$ anos e Marcos tem $3 \\cdot 12 = 36$ anos.\n\nConferindo no enunciado: $36$ é o triplo de $12$, e $12 + 36 = 48$. As duas condições do texto foram satisfeitas.\n\nDica de escolha da letra: nomeie como $x$ a **menor** quantidade, ou aquela da qual as outras dependem. Se tivéssemos chamado a idade de Marcos de $x$, a de Bia seria $\\frac{x}{3}$ e apareceria uma fração sem necessidade nenhuma.",
                    },
                    {
                        type: "text",
                        value: "## Problema de dinheiro\n\nComprei $3$ cadernos iguais e um estojo de $12$ reais, e paguei $57$ reais no total. Quanto custou cada caderno?\n\nSeja $c$ o preço de um caderno. O gasto com cadernos é $3c$, e a conta toda é\n\n$$3c + 12 = 57$$\n\nSubtraindo $12$ dos dois lados, $3c = 45$. Dividindo por $3$, $c = 15$. Cada caderno custou $15$ reais.\n\nConferindo: $3 \\cdot 15 = 45$, mais os $12$ do estojo, dá $57$. Repare que a letra não precisa ser $x$. Usar $c$ de caderno ajuda a lembrar o que ela representa quando o problema tem várias quantidades em jogo.",
                    },
                    {
                        type: "text",
                        value: "## Problema de perímetro\n\nUm terreno retangular tem o comprimento $4$ m maior que a largura, e o perímetro mede $36$ m. Quais são as dimensões?\n\nSeja $x$ a largura, em metros. O comprimento é $x + 4$. O perímetro de um retângulo é a soma dos quatro lados, isto é, duas larguras mais dois comprimentos:\n\n$$2x + 2(x + 4) = 36$$\n\n$$2x + 2x + 8 = 36$$\n\n$$4x = 28 \\quad \\Rightarrow \\quad x = 7$$\n\nA largura é $7$ m e o comprimento é $7 + 4 = 11$ m.\n\nConferindo: $2 \\cdot 7 + 2 \\cdot 11 = 14 + 22 = 36$ m. O erro comum neste tipo de problema é somar uma largura e um comprimento apenas, escrevendo $x + (x + 4) = 36$. Isso iguala o semiperímetro ao perímetro, e a resposta sai com o dobro do tamanho.",
                    },
                    {
                        type: "text",
                        value: "## Problema de mistura\n\nUm café de $30$ reais o quilo vai ser misturado com outro de $20$ reais o quilo, para dar $10$ kg de uma mistura que custe $26$ reais o quilo. Quantos quilos de cada tipo entram?\n\nSeja $x$ a quantidade, em quilos, do café de $30$ reais. Como o total é $10$ kg, o outro café entra com $10 - x$ quilos. Essa é a ideia central do problema de mistura: uma única letra dá conta das duas quantidades, porque a soma delas é conhecida.\n\nO valor total da mistura é $10 \\cdot 26 = 260$ reais, e ele tem que ser igual à soma dos valores das partes:\n\n$$30x + 20(10 - x) = 260$$\n\n$$30x + 200 - 20x = 260$$\n\n$$10x = 60 \\quad \\Rightarrow \\quad x = 6$$\n\nEntram $6$ kg do café de $30$ reais e $4$ kg do de $20$ reais.\n\nConferindo: $6 \\cdot 30 = 180$ e $4 \\cdot 20 = 80$, somando $260$ reais para $10$ kg, ou seja, $26$ reais o quilo, como o enunciado pedia.",
                    },
                    {
                        type: "text",
                        value: "## Conferir se a resposta faz sentido\n\nResolver a equação certa com a conta certa ainda pode produzir uma resposta impossível. O último passo é ler o resultado de volta no enunciado e perguntar se ele cabe na situação descrita.\n\nTrês perguntas que pegam quase todo erro:\n\n- **O sinal é possível?** Idade, massa, preço e quantidade de pessoas não são negativos. Um $x = -4$ para número de alunos quase sempre indica que a equação foi montada ao contrário.\n- **O tipo de número serve?** Encontrar $x = 2{,}5$ ônibus não resolve nada. Em problema de contagem, a resposta precisa ser um número inteiro.\n- **A resposta responde a pergunta?** No problema de idade, $x = 12$ era a idade de Bia. Quem para aí e escreve $12$ quando o enunciado pediu a idade de Marcos acerta a equação e erra o exercício.\n\nE vale sempre o teste final: substituir os valores encontrados nas frases do enunciado, uma por uma, como fizemos nos quatro exemplos desta aula.",
                    },
                    {
                        type: "quote",
                        value: "Transformar problema em equação é um roteiro, não um talento: ler o enunciado, nomear a incógnita por escrito, escrever as outras quantidades com essa mesma letra, montar a igualdade que amarra tudo e resolver. O passo que fecha o trabalho é conferir a resposta no enunciado, porque um número pode satisfazer a equação e ainda assim ser impossível na situação descrita.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Pedro tem $5$ anos mais que Ana, e juntos eles têm $31$ anos. Qual é a idade de Ana?",
                        difficulty: "facil",
                        options: [
                            { text: "$26$ anos", isCorrect: false },
                            { text: "$8$ anos", isCorrect: false },
                            { text: "$13$ anos", isCorrect: true },
                            { text: "$18$ anos", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Quatro canetas iguais e um caderno de $9$ reais custaram juntos $29$ reais. Qual é o preço de cada caneta?",
                        difficulty: "facil",
                        options: [
                            { text: "$9{,}50$ reais", isCorrect: false },
                            { text: "$7{,}25$ reais", isCorrect: false },
                            { text: "$20$ reais", isCorrect: false },
                            { text: "$5$ reais", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Em um retângulo, o comprimento é o dobro da largura e o perímetro mede $54$ cm. Quanto mede a largura?",
                        difficulty: "medio",
                        options: [
                            { text: "$27$ cm", isCorrect: false },
                            { text: "$13{,}5$ cm", isCorrect: false },
                            { text: "$18$ cm", isCorrect: false },
                            { text: "$9$ cm", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "O dobro de um número, diminuído de $7$, é igual a esse mesmo número somado a $5$. Qual equação traduz o problema?",
                        difficulty: "medio",
                        options: [
                            { text: "$2x - 7 = 5x$", isCorrect: false },
                            { text: "$2x + 7 = x - 5$", isCorrect: false },
                            { text: "$2x - 7 = x + 5$", isCorrect: true },
                            { text: "$2(x - 7) = x + 5$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma loja quer misturar bala de $18$ reais o quilo com bala de $12$ reais o quilo para obter $20$ kg de mistura a $15{,}60$ reais o quilo. Quantos quilos da bala de $18$ reais são necessários na mistura?",
                        difficulty: "dificil",
                        options: [
                            { text: "$10$ kg", isCorrect: false },
                            { text: "$14$ kg", isCorrect: false },
                            { text: "$8$ kg", isCorrect: false },
                            { text: "$12$ kg", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Inequação do primeiro grau",
                blocks: [
                    {
                        type: "text",
                        value: "# Inequação do primeiro grau\n\nNem toda pergunta de matemática tem resposta exata. Tenho $50$ reais, quantos quilômetros de táxi consigo pagar? não pede um valor, pede um limite: serve qualquer distância cujo preço caiba nos $50$ reais.\n\nQuando o sinal de igual dá lugar a um sinal de desigualdade, a igualdade vira **inequação**, e a resposta deixa de ser um número e passa a ser um conjunto de números.",
                    },
                    {
                        type: "text",
                        value: "## Os quatro sinais de desigualdade\n\n| Símbolo | Lê-se | Exemplo verdadeiro |\n| --- | --- | --- |\n| $<$ | é menor que | $2 < 7$ |\n| $>$ | é maior que | $7 > 2$ |\n| $\\le$ | é menor ou igual a | $3 \\le 3$ |\n| $\\ge$ | é maior ou igual a | $5 \\ge 4$ |\n\nOs dois últimos sinais aceitam a igualdade, e isso muda a resposta: em $x \\le 3$ o número $3$ entra, em $x < 3$ ele fica de fora.\n\nNos enunciados, as palavras avisam qual sinal usar. No máximo e pelo menos pedem $\\le$ e $\\ge$, porque admitem o valor limite. Menos de e mais de pedem $<$ e $>$, porque excluem esse valor.",
                    },
                    {
                        type: "text",
                        value: "## Resolver é quase igual a resolver equação\n\nSomar ou subtrair o mesmo número nos dois lados não mexe no sentido da desigualdade. Multiplicar ou dividir os dois lados por um número **positivo** também não. Com isso já se resolve a maioria das inequações, usando o mesmo plano das equações.\n\nVeja $3x - 4 \\le 11$. Somando $4$ nos dois lados:\n\n$$3x \\le 15$$\n\nDividindo os dois lados por $3$, que é positivo:\n\n$$x \\le 5$$\n\nA resposta é todo número menor ou igual a $5$. Vale a pena testar alguns valores: $x = 5$ dá $11 \\le 11$, verdadeiro; $x = 0$ dá $-4 \\le 11$, verdadeiro; $x = 6$ dá $14 \\le 11$, falso. O conjunto encontrado se comporta como prometido.",
                    },
                    {
                        type: "text",
                        value: "## Multiplicar por negativo inverte o sinal\n\nEsta é a única regra nova da aula, e ela não é capricho. Comece de uma desigualdade óbvia:\n\n$$3 < 5$$\n\nMultiplique os dois lados por $-1$. Os números viram $-3$ e $-5$. Na reta, $-3$ está à direita de $-5$, então\n\n$$-3 > -5$$\n\nO sinal virou. Multiplicar por um número negativo espelha a reta, e quem estava à esquerda passa a estar à direita.\n\nNa prática, em $-2x < 6$ dividimos os dois lados por $-2$ e **invertemos** o sinal:\n\n$$x > -3$$\n\nMuita gente escreve $x < -3$, mantendo o sinal original. O teste desmascara o erro na hora: $x = 0$ satisfaz $-2x < 6$, porque $0 < 6$, e o zero não é menor que $-3$. Já $x = -10$ não satisfaz, porque $20 < 6$ é falso.\n\nExiste um jeito de nunca precisar da regra: deixe a letra no lado em que o coeficiente fica positivo. Em $-2x < 6$, somando $2x$ e subtraindo $6$ nos dois lados, chega-se a $-6 < 2x$, ou seja, $-3 < x$, que é a mesma resposta $x > -3$.",
                    },
                    {
                        type: "text",
                        value: "## Na reta numérica\n\nA solução de uma inequação é um trecho da reta, e desenhar esse trecho evita confusão. A convenção é simples: bolinha **vazia** no extremo que não entra, bolinha **cheia** no extremo que entra, e a parte pintada para o lado em que a desigualdade é satisfeita.\n\n| Solução | No extremo | Para que lado pintar |\n| --- | --- | --- |\n| $x > -3$ | bolinha vazia em $-3$ | para a direita |\n| $x \\ge -3$ | bolinha cheia em $-3$ | para a direita |\n| $x < 5$ | bolinha vazia em $5$ | para a esquerda |\n| $x \\le 5$ | bolinha cheia em $5$ | para a esquerda |\n\nUm detalhe que confunde bastante: o lado a pintar não vem da aparência do símbolo, vem do que a desigualdade afirma sobre a letra. Por isso vale arrumar a resposta com a letra à esquerda, na forma $x > -3$, antes de desenhar qualquer coisa.",
                    },
                    {
                        type: "text",
                        value: "## O intervalo como resposta\n\nEscrever todo número maior que $-3$ funciona, mas existe uma notação bem mais curta. Usamos parêntese no extremo que fica de fora e colchete no extremo que entra:\n\n| Em palavras | Em conjunto | Em intervalo |\n| --- | --- | --- |\n| maior que $-3$ | $\\{x \\in \\mathbb{R} : x > -3\\}$ | $(-3, +\\infty)$ |\n| maior ou igual a $-3$ | $\\{x \\in \\mathbb{R} : x \\ge -3\\}$ | $[-3, +\\infty)$ |\n| menor que $5$ | $\\{x \\in \\mathbb{R} : x < 5\\}$ | $(-\\infty, 5)$ |\n| menor ou igual a $5$ | $\\{x \\in \\mathbb{R} : x \\le 5\\}$ | $(-\\infty, 5]$ |\n\nO símbolo $\\infty$ não é um número, é apenas a indicação de que o intervalo não termina daquele lado. Por isso o lado do infinito leva sempre parêntese, nunca colchete.",
                    },
                    {
                        type: "text",
                        value: "## Um problema do começo ao fim\n\nVolte ao táxi da abertura. A corrida custa $6$ reais de bandeirada mais $2{,}50$ reais por quilômetro, e há $50$ reais na carteira. O custo precisa caber nesse valor, e a expressão no máximo pede o sinal $\\le$:\n\n$$6 + 2{,}5k \\le 50$$\n\nSubtraindo $6$ dos dois lados:\n\n$$2{,}5k \\le 44$$\n\nDividindo os dois lados por $2{,}5$, que é positivo:\n\n$$k \\le 17{,}6$$\n\nEm intervalo, $k \\in (-\\infty, 17{,}6]$. Mas o problema cobra a leitura final: distância negativa não existe e o táxi cobra por quilômetro inteiro, então a resposta útil é $17$ km. Com $17$ km o custo é $6 + 2{,}5 \\cdot 17 = 48{,}50$ reais, e com $18$ km passaria para $51$ reais, acima do que há na carteira.",
                    },
                    {
                        type: "quote",
                        value: "Inequação se resolve como equação, com uma única diferença que decide tudo: multiplicar ou dividir os dois lados por um número negativo inverte o sinal da desigualdade. A resposta não é um número e sim um trecho da reta, escrito como conjunto ou como intervalo, com parêntese no extremo que fica de fora e colchete no extremo que entra.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o conjunto solução da inequação $x + 4 > 9$?",
                        difficulty: "facil",
                        options: [
                            { text: "$x < 5$", isCorrect: false },
                            { text: "$x > 13$", isCorrect: false },
                            { text: "$x > -5$", isCorrect: false },
                            { text: "$x > 5$", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Resolvendo a inequação $-x < 3$, obtemos:",
                        difficulty: "facil",
                        options: [
                            { text: "$x < -3$", isCorrect: false },
                            { text: "$x > 3$", isCorrect: false },
                            { text: "$x > -3$", isCorrect: true },
                            { text: "$x < 3$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a solução da inequação $5 - 2x \\ge 1$?",
                        difficulty: "medio",
                        options: [
                            { text: "$x \\le -2$", isCorrect: false },
                            { text: "$x \\ge 3$", isCorrect: false },
                            { text: "$x \\le 2$", isCorrect: true },
                            { text: "$x \\ge 2$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Em notação de intervalo, qual é o conjunto solução de $2x + 1 \\le 7$?",
                        difficulty: "medio",
                        options: [
                            { text: "$(-\\infty, 3]$", isCorrect: true },
                            { text: "$(-\\infty, 3)$", isCorrect: false },
                            { text: "$(-\\infty, 4]$", isCorrect: false },
                            { text: "$[3, +\\infty)$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma corrida de táxi custa $6$ reais de bandeirada mais $2{,}50$ reais por quilômetro. Com $50$ reais, qual é a maior distância inteira, em quilômetros, que se pode percorrer?",
                        difficulty: "dificil",
                        options: [
                            { text: "$20$ km", isCorrect: false },
                            { text: "$17$ km", isCorrect: true },
                            { text: "$18$ km", isCorrect: false },
                            { text: "$22$ km", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Geometria plana",
        aulas: [
            {
                titulo: "Ponto, reta, ângulo e retas paralelas",
                blocks: [
                    {
                        type: "text",
                        value: "# Ponto, reta, ângulo e retas paralelas\n\nUm colocador de piso precisa garantir que a primeira fileira de cerâmica saia reta e no esquadro. Se ela entrar torta um grau, no fim da parede o erro já é de vários centímetros. Para falar disso com precisão, a geometria começa definindo as peças mais simples: ponto, reta e ângulo. Nesta aula montamos esse vocabulário e aprendemos a calcular ângulos sem medir nada, só com as relações entre eles.",
                    },
                    {
                        type: "text",
                        value: "## Ponto, reta, segmento e semirreta\n\nPonto, reta e plano são aceitos sem definição: são as ideias de partida. O que fazemos é combinar como escrevê-los.\n\n- **Ponto**: letra maiúscula, como $A$ e $B$. Não tem tamanho, só posição.\n- **Reta**: letra minúscula, como $r$ e $s$. É infinita nos dois sentidos.\n- **Segmento de reta**: o pedaço da reta entre dois pontos, escrito $\\overline{AB}$. Tem comprimento.\n- **Semirreta**: começa num ponto e segue sem fim num único sentido.\n\nQuando dizemos que $AB = 8$ cm, estamos falando da medida do segmento $\\overline{AB}$. Se $M$ é o **ponto médio** de $\\overline{AB}$, então $AM = MB = 4$ cm, porque o ponto médio divide o segmento em duas partes iguais.",
                    },
                    {
                        type: "text",
                        value: "## O que é um ângulo e como ele se chama\n\nUm **ângulo** é a região entre duas semirretas que partem do mesmo ponto. Esse ponto é o **vértice** e as semirretas são os **lados**.\n\nHá três formas de nomear o mesmo ângulo:\n\n- pelos três pontos, com o vértice no meio: $\\angle AOB$, que também se escreve $A\\hat{O}B$;\n- só pelo vértice, quando não há risco de confusão: $\\hat{O}$;\n- por uma letra grega, como $\\alpha$ e $\\theta$.\n\nA medida vem em **graus**, e uma volta completa tem $360^\\circ$. Pela medida, o ângulo é classificado assim:\n\n| Nome | Medida |\n| --- | --- |\n| agudo | menor que $90^\\circ$ |\n| reto | igual a $90^\\circ$ |\n| obtuso | entre $90^\\circ$ e $180^\\circ$ |\n| raso | igual a $180^\\circ$ |\n\nUm ângulo de $130^\\circ$, por exemplo, é obtuso: passou de $90^\\circ$ mas ainda não chegou a $180^\\circ$.",
                    },
                    {
                        type: "text",
                        value: "## Ângulos adjacentes e bissetriz\n\nDois ângulos são **adjacentes** quando têm o mesmo vértice e um lado em comum, sem se sobrepor. É o caso de dois ângulos que, juntos, formam um terceiro maior.\n\nA **bissetriz** de um ângulo é a semirreta que sai do vértice e o divide em dois ângulos adjacentes de mesma medida. Se $A\\hat{O}B = 80^\\circ$ e a semirreta de origem $O$ que passa por $C$ é a bissetriz, então\n\n$$A\\hat{O}C = C\\hat{O}B = \\frac{80^\\circ}{2} = 40^\\circ$$\n\nRepare que a bissetriz divide por dois a medida do ângulo, e não o comprimento de lado nenhum.",
                    },
                    {
                        type: "text",
                        value: "## Complementares, suplementares e opostos pelo vértice\n\nTrês relações resolvem quase todo exercício de ângulo:\n\n- **Complementares**: somam $90^\\circ$. O complemento de $x$ é $90^\\circ - x$.\n- **Suplementares**: somam $180^\\circ$. O suplemento de $x$ é $180^\\circ - x$.\n- **Opostos pelo vértice**: têm a mesma medida.\n\nExemplo: um ângulo mede $35^\\circ$. Seu complemento mede $90^\\circ - 35^\\circ = 55^\\circ$ e seu suplemento mede $180^\\circ - 35^\\circ = 145^\\circ$.\n\nDá para usar essas relações ao contrário. Se o suplemento de um ângulo é o triplo dele, chamamos o ângulo de $x$ e escrevemos\n\n$$180^\\circ - x = 3x \\quad \\Rightarrow \\quad 180^\\circ = 4x \\quad \\Rightarrow \\quad x = 45^\\circ$$\n\nConferindo: o suplemento de $45^\\circ$ é $135^\\circ$, que é o triplo de $45^\\circ$.\n\nPara os opostos pelo vértice, imagine duas retas que se cruzam formando um X. Surgem quatro ângulos. Os que ficam de frente um para o outro são opostos pelo vértice e têm medidas iguais; os que ficam lado a lado são suplementares. Se um deles mede $70^\\circ$, o de frente mede $70^\\circ$ e os dois vizinhos medem $110^\\circ$ cada.",
                    },
                    {
                        type: "text",
                        value: "## Retas paralelas cortadas por uma transversal\n\nDuas retas do mesmo plano são **paralelas** quando nunca se cruzam, o que se escreve $r \\parallel s$. Agora imagine a figura: duas retas horizontais, $r$ em cima e $s$ embaixo, e uma terceira reta $t$ inclinada subindo da esquerda para a direita, cortando as duas. Essa terceira reta é a **transversal**.\n\nNo cruzamento com $r$ aparecem quatro ângulos, e no cruzamento com $s$ aparecem outros quatro: oito ao todo. Como as retas são paralelas, só existem duas medidas diferentes entre esses oito ângulos, e essas duas medidas são suplementares.\n\nOs pares recebem nome segundo a posição:\n\n| Par | Onde estão | Relação |\n| --- | --- | --- |\n| correspondentes | mesmo lado da transversal, um em cada cruzamento, na mesma posição | iguais |\n| alternos internos | lados opostos da transversal, entre as paralelas | iguais |\n| alternos externos | lados opostos da transversal, fora das paralelas | iguais |\n| colaterais internos | mesmo lado da transversal, entre as paralelas | suplementares |\n| colaterais externos | mesmo lado da transversal, fora das paralelas | suplementares |\n\nA palavra alternos avisa que o par está em lados opostos da transversal, e colaterais que está do mesmo lado. Internos é entre as paralelas, externos é fora delas.",
                    },
                    {
                        type: "text",
                        value: "## Resolvendo os oito ângulos de uma vez\n\nVoltando à figura das paralelas $r$ e $s$ com a transversal $t$, suponha que o ângulo que fica abaixo de $r$ e à direita de $t$ meça $65^\\circ$. Ele é um ângulo interno, porque está entre as duas paralelas.\n\nComo só há duas medidas possíveis, todo ângulo da figura vale $65^\\circ$ ou $180^\\circ - 65^\\circ = 115^\\circ$. Para saber qual é qual, basta olhar a posição:\n\n- o oposto pelo vértice dele (acima de $r$, à esquerda de $t$) mede $65^\\circ$;\n- o correspondente dele (abaixo de $s$, à direita de $t$) mede $65^\\circ$;\n- o alterno interno dele (acima de $s$, à esquerda de $t$) mede $65^\\circ$;\n- o colateral interno dele (acima de $s$, à direita de $t$) mede $115^\\circ$;\n- o vizinho dele no mesmo cruzamento (abaixo de $r$, à esquerda de $t$) mede $115^\\circ$.\n\nErro comum: tratar todo par como suplementar e sair somando $180^\\circ$ em tudo. Só os colaterais somam $180^\\circ$; correspondentes e alternos são iguais. E atenção, tudo isso vale porque as retas são paralelas. Se o enunciado não garante o paralelismo, nenhuma dessas igualdades pode ser usada, mesmo que o desenho pareça convincente.",
                    },
                    {
                        type: "quote",
                        value: "Ponto, reta e ângulo são o vocabulário da geometria: complementares somam $90^\\circ$, suplementares somam $180^\\circ$ e opostos pelo vértice são iguais. Quando uma transversal corta duas paralelas, os oito ângulos se reduzem a duas medidas, e a posição do par diz se ele é igual ou suplementar.",
                    },
                ],
                questions: [
                    {
                        statement: "Um ângulo mede $35^\\circ$. Quanto mede o seu complemento?",
                        difficulty: "facil",
                        options: [
                            { text: "$35^\\circ$", isCorrect: false },
                            { text: "$65^\\circ$", isCorrect: false },
                            { text: "$145^\\circ$", isCorrect: false },
                            { text: "$55^\\circ$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Duas retas se cruzam formando quatro ângulos, e um deles mede $70^\\circ$. Quanto mede o ângulo oposto pelo vértice a ele?",
                        difficulty: "facil",
                        options: [
                            { text: "$20^\\circ$", isCorrect: false },
                            { text: "$110^\\circ$", isCorrect: false },
                            { text: "$70^\\circ$", isCorrect: true },
                            { text: "$140^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "O suplemento de um ângulo é o triplo desse ângulo. Quanto mede o ângulo?",
                        difficulty: "medio",
                        options: [
                            { text: "$90^\\circ$", isCorrect: false },
                            { text: "$135^\\circ$", isCorrect: false },
                            { text: "$60^\\circ$", isCorrect: false },
                            { text: "$45^\\circ$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "As retas $r$ e $s$ são paralelas e a transversal $t$ corta as duas. Um dos ângulos colaterais internos mede $2x$ graus e o outro mede $x + 60$ graus. Qual é o valor de $x$?",
                        difficulty: "medio",
                        options: [
                            { text: "$40$", isCorrect: true },
                            { text: "$80$", isCorrect: false },
                            { text: "$30$", isCorrect: false },
                            { text: "$60$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Duas retas se cruzam e um dos ângulos formados mede $140^\\circ$. Qual é a medida do ângulo formado pela bissetriz desse ângulo e pela bissetriz de um dos ângulos adjacentes a ele?",
                        difficulty: "dificil",
                        options: [
                            { text: "$90^\\circ$", isCorrect: true },
                            { text: "$70^\\circ$", isCorrect: false },
                            { text: "$160^\\circ$", isCorrect: false },
                            { text: "$110^\\circ$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Triângulos: classificação, ângulos e congruência",
                blocks: [
                    {
                        type: "text",
                        value: "# Triângulos: classificação, ângulos e congruência\n\nOlhe a estrutura de um telhado, a treliça de uma ponte ou a barra diagonal soldada num portão de ferro. Em todas elas aparece triângulo, e não é por acaso: dados os três lados, existe um único triângulo possível. Ele não amassa nem entorta. Essa rigidez vem das propriedades que vamos estudar agora.",
                    },
                    {
                        type: "text",
                        value: "## Classificação pelos lados\n\nUm triângulo tem três lados, três vértices e três ângulos internos. Quanto aos lados, a classificação é:\n\n- **Equilátero**: os três lados iguais, como $6$, $6$ e $6$. Os três ângulos internos medem $60^\\circ$ cada.\n- **Isósceles**: pelo menos dois lados iguais, como $5$, $5$ e $8$. O lado diferente é a **base**, e os dois ângulos da base são iguais.\n- **Escaleno**: os três lados diferentes, como $3$, $5$ e $7$. Nenhum ângulo se repete.\n\nRepare que todo equilátero também é isósceles: a exigência de ter dois lados iguais fica cumprida com folga quando os três são iguais.",
                    },
                    {
                        type: "text",
                        value: "## Classificação pelos ângulos\n\nQuanto aos ângulos internos:\n\n- **Acutângulo**: os três ângulos agudos, como $50^\\circ$, $60^\\circ$ e $70^\\circ$.\n- **Retângulo**: um ângulo reto, como $90^\\circ$, $55^\\circ$ e $35^\\circ$.\n- **Obtusângulo**: um ângulo obtuso, como $120^\\circ$, $40^\\circ$ e $20^\\circ$.\n\nNo triângulo retângulo os lados ganham nome próprio: o lado oposto ao ângulo reto é a **hipotenusa**, sempre o maior dos três, e os dois lados que formam o ângulo reto são os **catetos**. Guarde esses nomes, porque eles voltam na última aula do módulo.\n\nUm triângulo não pode ter dois ângulos retos nem dois obtusos: só esses dois já estourariam o total disponível, que é $180^\\circ$, como vamos ver agora.",
                    },
                    {
                        type: "text",
                        value: "## A soma dos ângulos internos\n\nEm qualquer triângulo, a soma dos três ângulos internos vale $180^\\circ$:\n\n$$\\hat{A} + \\hat{B} + \\hat{C} = 180^\\circ$$\n\nDá para entender de onde vem esse valor usando as paralelas da aula anterior. Imagine um triângulo $ABC$ com a base $\\overline{BC}$ apoiada na horizontal e o vértice $A$ em cima, deslocado para a direita. Trace pelo ponto $A$ uma reta paralela a $\\overline{BC}$. O lado $\\overline{AB}$ é uma transversal dessas duas paralelas, então o ângulo $\\hat{B}$ reaparece junto de $A$ como alterno interno; o lado $\\overline{AC}$ faz o mesmo com $\\hat{C}$. Em torno de $A$, sobre a reta traçada, ficam lado a lado os três ângulos, formando um ângulo raso de $180^\\circ$.\n\nExemplo: os ângulos internos de um triângulo são proporcionais a $1$, $2$ e $3$, ou seja, valem $x$, $2x$ e $3x$. Então\n\n$$x + 2x + 3x = 180^\\circ \\quad \\Rightarrow \\quad 6x = 180^\\circ \\quad \\Rightarrow \\quad x = 30^\\circ$$\n\nOs ângulos medem $30^\\circ$, $60^\\circ$ e $90^\\circ$, e o triângulo é retângulo.",
                    },
                    {
                        type: "text",
                        value: "## O ângulo externo\n\nProlongue um dos lados do triângulo para além de um vértice. O ângulo entre esse prolongamento e o outro lado que sai do mesmo vértice é um **ângulo externo**.\n\nO ângulo externo e o interno do mesmo vértice são suplementares, porque juntos formam um ângulo raso. Daí sai a propriedade mais útil: o ângulo externo de um vértice é igual à soma dos dois ângulos internos não adjacentes a ele.\n\nExemplo: num triângulo $ABC$ com $\\hat{A} = 50^\\circ$ e $\\hat{B} = 60^\\circ$, o terceiro ângulo é $\\hat{C} = 180^\\circ - 50^\\circ - 60^\\circ = 70^\\circ$, e o ângulo externo no vértice $C$ mede\n\n$$180^\\circ - 70^\\circ = 110^\\circ = 50^\\circ + 60^\\circ$$\n\nOs dois caminhos dão o mesmo número, o que serve como conferência rápida da conta.",
                    },
                    {
                        type: "text",
                        value: "## Condição de existência\n\nNão é qualquer trio de medidas que fecha um triângulo. Tente com $3$, $5$ e $9$: os dois lados menores juntos somam $8$, menos que $9$, então eles não alcançam as pontas do lado grande. O triângulo não fecha.\n\nA **condição de existência** diz que cada lado tem que ser menor que a soma dos outros dois e maior que a diferença entre eles:\n\n$$|b - c| < a < b + c$$\n\nCom $3$, $5$ e $9$ falha, porque $9$ não é menor que $3 + 5 = 8$. Com $4$, $6$ e $9$ funciona: $9 < 4 + 6$, $6 < 4 + 9$ e $4 < 6 + 9$. Na prática basta testar o maior lado contra a soma dos outros dois, porque se esse passa, os outros dois passam sozinhos.\n\nQuando o enunciado dá dois lados e pede o terceiro, a desigualdade vira um intervalo. Com lados $5$ e $8$, o terceiro lado $x$ cumpre\n\n$$8 - 5 < x < 8 + 5 \\quad \\Rightarrow \\quad 3 < x < 13$$\n\nOu seja, $x$ pode ser $4$ ou $12$, mas nunca $3$ nem $13$: nos extremos o triângulo degenera em três pontos alinhados.",
                    },
                    {
                        type: "text",
                        value: "## Casos de congruência\n\nDois triângulos são **congruentes** quando têm os três lados e os três ângulos iguais, ou seja, quando um é cópia exata do outro, podendo estar girado ou espelhado. Escrevemos $\\triangle ABC \\cong \\triangle DEF$.\n\nA boa notícia é que não precisamos conferir seis medidas. Três informações bem escolhidas bastam:\n\n| Caso | O que basta ser igual nos dois |\n| --- | --- |\n| LLL | os três lados |\n| LAL | dois lados e o ângulo entre eles |\n| ALA | dois ângulos e o lado entre eles |\n| LAAo | um lado, um ângulo e o ângulo oposto a esse lado |\n\nExemplo: no triângulo $ABC$ temos $AB = 7$, $AC = 5$ e $\\hat{A} = 40^\\circ$; no triângulo $DEF$ temos $DE = 7$, $DF = 5$ e $\\hat{D} = 40^\\circ$. Nos dois casos o ângulo conhecido fica entre os dois lados conhecidos, então o caso é LAL e os triângulos são congruentes. Como consequência, $BC = EF$, sem precisar medir.\n\nDois avisos. Primeiro, LLA não é caso de congruência: com dois lados e um ângulo que não fica entre eles, podem existir dois triângulos diferentes. Segundo, três ângulos iguais não garantem congruência, só a mesma forma, porque um triângulo pode ser uma ampliação do outro. Esse é o assunto da semelhança, na última aula do módulo.",
                    },
                    {
                        type: "quote",
                        value: "Pelos lados o triângulo é equilátero, isósceles ou escaleno; pelos ângulos, acutângulo, retângulo ou obtusângulo. Os internos somam $180^\\circ$, o externo de um vértice é a soma dos dois internos não adjacentes, cada lado é menor que a soma dos outros dois, e três medidas bem escolhidas (LLL, LAL, ALA ou LAAo) já garantem congruência.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Em um triângulo, dois ângulos internos medem $50^\\circ$ e $60^\\circ$. Quanto mede o terceiro ângulo interno?",
                        difficulty: "facil",
                        options: [
                            { text: "$110^\\circ$", isCorrect: false },
                            { text: "$130^\\circ$", isCorrect: false },
                            { text: "$70^\\circ$", isCorrect: true },
                            { text: "$80^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um triângulo tem lados medindo $5$ cm, $5$ cm e $8$ cm. Como ele é classificado quanto aos lados?",
                        difficulty: "facil",
                        options: [
                            { text: "isósceles", isCorrect: true },
                            { text: "equilátero", isCorrect: false },
                            { text: "escaleno", isCorrect: false },
                            { text: "retângulo", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Dois lados de um triângulo medem $5$ cm e $8$ cm. Qual dos valores a seguir não pode ser a medida do terceiro lado?",
                        difficulty: "medio",
                        options: [
                            { text: "$12$ cm", isCorrect: false },
                            { text: "$13$ cm", isCorrect: true },
                            { text: "$10$ cm", isCorrect: false },
                            { text: "$4$ cm", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Nos triângulos $ABC$ e $DEF$ sabemos que $AB = DE = 7$ cm, $AC = DF = 5$ cm e que os ângulos $\\hat{A}$ e $\\hat{D}$ medem $40^\\circ$ cada. Qual caso garante que os dois triângulos são congruentes?",
                        difficulty: "medio",
                        options: [
                            { text: "LAAo (lado, ângulo, ângulo oposto)", isCorrect: false },
                            { text: "LLL (lado, lado, lado)", isCorrect: false },
                            { text: "ALA (ângulo, lado, ângulo)", isCorrect: false },
                            { text: "LAL (lado, ângulo, lado)", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Num triângulo isósceles de base $\\overline{BC}$, o ângulo externo no vértice $A$ mede $100^\\circ$. Quanto mede cada um dos ângulos da base?",
                        difficulty: "dificil",
                        options: [
                            { text: "$50^\\circ$", isCorrect: true },
                            { text: "$100^\\circ$", isCorrect: false },
                            { text: "$40^\\circ$", isCorrect: false },
                            { text: "$80^\\circ$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Quadriláteros e polígonos",
                blocks: [
                    {
                        type: "text",
                        value: "# Quadriláteros e polígonos\n\nUm portão de ferro feito só com quatro barras forma um quadrado, mas basta empurrar um canto para ele virar um losango torto. Por isso o serralheiro solda uma barra na diagonal: ela cria triângulos, e triângulo não entorta. Essa diferença de comportamento entre a figura de quatro lados e a de três é um bom ponto de partida para estudar os quadriláteros e, depois, os polígonos de qualquer número de lados.",
                    },
                    {
                        type: "text",
                        value: "## O quadrilátero e seus $360^\\circ$\n\n**Quadrilátero** é o polígono de quatro lados. Trace uma diagonal, ligando dois vértices opostos: ela reparte a figura em dois triângulos. Como cada triângulo contribui com $180^\\circ$, a soma dos ângulos internos de qualquer quadrilátero é\n\n$$2 \\cdot 180^\\circ = 360^\\circ$$\n\nExemplo: três ângulos internos de um quadrilátero medem $100^\\circ$, $80^\\circ$ e $95^\\circ$. O quarto mede\n\n$$360^\\circ - 100^\\circ - 80^\\circ - 95^\\circ = 85^\\circ$$\n\nEsse total de $360^\\circ$ não depende da forma: vale para o quadrado, para o trapézio e para qualquer quadrilátero amassado que você desenhar, desde que ele não seja furado nem tenha lado cruzando lado.",
                    },
                    {
                        type: "text",
                        value: "## Paralelogramo\n\n**Paralelogramo** é o quadrilátero que tem os dois pares de lados opostos paralelos. Imagine um retângulo empurrado para o lado, com os lados de cima e de baixo escorregando: é isso.\n\nDessa única exigência saem quatro propriedades:\n\n- lados opostos iguais;\n- ângulos opostos iguais;\n- ângulos consecutivos suplementares, porque são colaterais internos de duas paralelas cortadas por um lado;\n- diagonais que se cortam ao meio, ou seja, o ponto de encontro delas é ponto médio das duas.\n\nExemplo: no paralelogramo $ABCD$, com os vértices nomeados em ordem ao redor da figura, temos $AB = 9$ cm, $BC = 5$ cm e $\\hat{A} = 70^\\circ$. Então $CD = 9$ cm e $AD = 5$ cm, pelos lados opostos, e $\\hat{C} = 70^\\circ$, pelos ângulos opostos. Os outros dois saem da suplementaridade:\n\n$$\\hat{B} = \\hat{D} = 180^\\circ - 70^\\circ = 110^\\circ$$\n\nConferindo o total: $70^\\circ + 110^\\circ + 70^\\circ + 110^\\circ = 360^\\circ$.",
                    },
                    {
                        type: "text",
                        value: "## Retângulo, losango e quadrado\n\nTrês paralelogramos ganham nome próprio:\n\n- **Retângulo**: paralelogramo com os quatro ângulos retos. Além de tudo o que o paralelogramo tem, suas diagonais são iguais.\n- **Losango** (também chamado de rombo): paralelogramo com os quatro lados iguais. Suas diagonais são perpendiculares entre si, e cada uma é bissetriz dos dois ângulos que liga.\n- **Quadrado**: tem as duas coisas, quatro ângulos retos e quatro lados iguais. É retângulo e losango ao mesmo tempo.\n\nExemplo: num losango $ABCD$ o ângulo $\\hat{A}$ mede $110^\\circ$. Como os ângulos opostos são iguais e os consecutivos são suplementares, as quatro medidas são $110^\\circ$, $70^\\circ$, $110^\\circ$ e $70^\\circ$. A diagonal $\\overline{AC}$ é bissetriz de $\\hat{A}$, logo divide esse ângulo em dois de $\\frac{110^\\circ}{2} = 55^\\circ$. E como as diagonais são perpendiculares, no cruzamento delas aparecem quatro ângulos de $90^\\circ$.\n\nErro comum: achar que todo losango é quadrado. Só é quadrado o losango cujos ângulos são retos; com $110^\\circ$ e $70^\\circ$, não é.",
                    },
                    {
                        type: "text",
                        value: "## Trapézio\n\n**Trapézio** é o quadrilátero que tem exatamente um par de lados paralelos. Esses dois lados paralelos são as **bases** (uma maior e uma menor) e os outros dois são os lados não paralelos.\n\nImagine as duas bases na horizontal, a maior embaixo e a menor em cima. Cada lado não paralelo é uma transversal das duas bases, então os dois ângulos que ele forma com elas são colaterais internos: somam $180^\\circ$.\n\nExemplo: num trapézio de bases $\\overline{AB}$ e $\\overline{CD}$, em que $\\overline{AD}$ é um dos lados não paralelos, o ângulo $\\hat{A}$ mede $65^\\circ$. Logo\n\n$$\\hat{D} = 180^\\circ - 65^\\circ = 115^\\circ$$\n\nOs trapézios se dividem em três tipos: **isósceles**, com os lados não paralelos iguais, e aí os dois ângulos de cada base são iguais e as diagonais também; **retângulo**, com dois ângulos retos, que é o caso de um lado não paralelo perpendicular às bases; e **escaleno**, sem nenhuma dessas regularidades.\n\nA tabela resume quem tem o quê:\n\n| Figura | Lados paralelos | Lados iguais | Ângulos retos | Diagonais |\n| --- | --- | --- | --- | --- |\n| paralelogramo | dois pares | os opostos | nenhum | cortam-se ao meio |\n| retângulo | dois pares | os opostos | quatro | iguais |\n| losango | dois pares | os quatro | nenhum | perpendiculares |\n| quadrado | dois pares | os quatro | quatro | iguais e perpendiculares |\n| trapézio | um par | depende do tipo | zero ou dois | depende do tipo |",
                    },
                    {
                        type: "text",
                        value: "## Soma dos ângulos internos de um polígono\n\n**Polígono** é a figura plana fechada formada por segmentos de reta, chamados lados, que se encontram nos vértices. Pelo número $n$ de lados temos triângulo ($n = 3$), quadrilátero ($n = 4$), pentágono ($n = 5$), hexágono ($n = 6$), heptágono ($n = 7$), octógono ($n = 8$), eneágono ($n = 9$), decágono ($n = 10$) e dodecágono ($n = 12$).\n\nEscolha um vértice e ligue-o a todos os outros que não sejam vizinhos dele. O polígono fica repartido em $n - 2$ triângulos, e cada triângulo contribui com $180^\\circ$:\n\n$$S_i = (n - 2) \\cdot 180^\\circ$$\n\nExemplo: no octógono, $S_i = (8 - 2) \\cdot 180^\\circ = 6 \\cdot 180^\\circ = 1080^\\circ$.\n\nA fórmula também funciona de trás para frente. Se a soma dos internos é $1440^\\circ$, então\n\n$$(n - 2) \\cdot 180^\\circ = 1440^\\circ \\quad \\Rightarrow \\quad n - 2 = 8 \\quad \\Rightarrow \\quad n = 10$$\n\nO polígono tem $10$ lados. Erro comum aqui é esquecer o $-2$ e dividir $1440$ por $180$ direto, chegando a $8$ lados.",
                    },
                    {
                        type: "text",
                        value: "## Diagonais e polígono regular\n\n**Diagonal** é o segmento que liga dois vértices não vizinhos. De cada um dos $n$ vértices saem $n - 3$ diagonais, porque não vale ligar o vértice a si mesmo nem aos seus dois vizinhos. Isso dá $n(n-3)$ ligações, mas cada diagonal foi contada duas vezes, uma em cada ponta. Então\n\n$$d = \\frac{n(n-3)}{2}$$\n\nExemplo: no dodecágono, $d = \\frac{12 \\cdot 9}{2} = \\frac{108}{2} = 54$ diagonais.\n\nUm polígono é **regular** quando tem todos os lados iguais e todos os ângulos iguais. Aí cada ângulo interno vale a soma repartida igualmente:\n\n$$a_i = \\frac{(n - 2) \\cdot 180^\\circ}{n}$$\n\nE cada ângulo externo, por ser suplementar do interno do mesmo vértice, vale $\\frac{360^\\circ}{n}$. Vale guardar que a soma dos ângulos externos de qualquer polígono é sempre $360^\\circ$, não importa o valor de $n$.\n\nExemplo: no hexágono regular, $a_i = \\frac{4 \\cdot 180^\\circ}{6} = \\frac{720^\\circ}{6} = 120^\\circ$, e cada ângulo externo mede $\\frac{360^\\circ}{6} = 60^\\circ$. Somando os seis externos, $6 \\cdot 60^\\circ = 360^\\circ$, como prometido.",
                    },
                    {
                        type: "quote",
                        value: "Todo quadrilátero tem $360^\\circ$ de ângulos internos, e o paralelogramo, o retângulo, o losango, o quadrado e o trapézio se distinguem pelo paralelismo dos lados e pelo comportamento das diagonais. Num polígono de $n$ lados a soma dos internos é $(n-2) \\cdot 180^\\circ$, o número de diagonais é $\\frac{n(n-3)}{2}$ e a soma dos externos é sempre $360^\\circ$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Três ângulos internos de um quadrilátero medem $100^\\circ$, $80^\\circ$ e $95^\\circ$. Quanto mede o quarto ângulo interno?",
                        difficulty: "facil",
                        options: [
                            { text: "$95^\\circ$", isCorrect: false },
                            { text: "$85^\\circ$", isCorrect: true },
                            { text: "$105^\\circ$", isCorrect: false },
                            { text: "$75^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Qual é o número de lados do polígono cuja soma dos ângulos internos vale $1440^\\circ$?",
                        difficulty: "facil",
                        options: [
                            { text: "$12$", isCorrect: false },
                            { text: "$8$", isCorrect: false },
                            { text: "$10$", isCorrect: true },
                            { text: "$9$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Num paralelogramo $ABCD$, com os vértices nomeados em ordem ao redor da figura, o ângulo $\\hat{A}$ mede $70^\\circ$. Quanto mede o ângulo $\\hat{B}$?",
                        difficulty: "medio",
                        options: [
                            { text: "$70^\\circ$", isCorrect: false },
                            { text: "$110^\\circ$", isCorrect: true },
                            { text: "$20^\\circ$", isCorrect: false },
                            { text: "$140^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Num trapézio de bases paralelas $\\overline{AB}$ e $\\overline{CD}$, o lado $\\overline{AD}$ é um dos lados não paralelos e o ângulo $\\hat{A}$ mede $65^\\circ$. Quanto mede o ângulo $\\hat{D}$?",
                        difficulty: "medio",
                        options: [
                            { text: "$25^\\circ$", isCorrect: false },
                            { text: "$65^\\circ$", isCorrect: false },
                            { text: "$130^\\circ$", isCorrect: false },
                            { text: "$115^\\circ$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Um polígono regular tem cada ângulo interno medindo $144^\\circ$. Quantas diagonais ele tem?",
                        difficulty: "dificil",
                        options: [
                            { text: "$70$", isCorrect: false },
                            { text: "$54$", isCorrect: false },
                            { text: "$35$", isCorrect: true },
                            { text: "$20$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Circunferência e círculo",
                blocks: [
                    {
                        type: "text",
                        value: "# Circunferência e círculo\n\nA roda, o mostrador do relógio, a rotatória e a tampa da panela têm a mesma ideia por trás: todos os pontos da borda ficam à mesma distância de um centro. É só isso que define a circunferência, e é dessa única condição que saem todas as propriedades desta aula.",
                    },
                    {
                        type: "text",
                        value: "## Circunferência, círculo, raio, diâmetro e corda\n\nComece pela distinção que mais gera confusão:\n\n- **Circunferência** é a linha: o conjunto dos pontos de um plano que ficam à mesma distância de um ponto fixo.\n- **Círculo** é a região: a circunferência mais tudo o que está dentro dela.\n\nA circunferência é o aro da bicicleta, o círculo é o disco de papelão. Nos elementos:\n\n- **Centro**: o ponto fixo, em geral chamado de $O$.\n- **Raio**: o segmento que vai do centro até um ponto da circunferência, e também a medida desse segmento, indicada por $r$.\n- **Corda**: segmento que liga dois pontos quaisquer da circunferência.\n- **Diâmetro**: a corda que passa pelo centro. É a maior corda possível e mede $d = 2r$.\n\nExemplo: numa circunferência de raio $r = 7$ cm, o diâmetro mede $d = 2 \\cdot 7 = 14$ cm. Uma corda qualquer dessa circunferência pode medir $10$ cm, ou $3$ cm, ou qualquer valor entre $0$ e $14$ cm, mas nunca mais que $14$ cm.\n\nPara um ponto $P$ do plano, basta comparar a distância $OP$ com o raio: se $OP < r$, o ponto é interior; se $OP = r$, está sobre a circunferência; se $OP > r$, é exterior.",
                    },
                    {
                        type: "text",
                        value: "## Arco e semicircunferência\n\nDois pontos $A$ e $B$ de uma circunferência a dividem em dois pedaços, e cada pedaço é um **arco**. Quando os dois pedaços são diferentes, falamos do arco menor e do arco maior. Quando $\\overline{AB}$ é um diâmetro, os dois pedaços são iguais e cada um deles é uma **semicircunferência**.\n\nO arco se mede em graus, e a circunferência inteira tem $360^\\circ$. Exemplo: o mostrador de um relógio tem $12$ marcas igualmente espaçadas, então cada arco entre duas marcas vizinhas vale\n\n$$\\frac{360^\\circ}{12} = 30^\\circ$$\n\nDo $12$ até o $4$ são quatro desses arcos, ou seja, $4 \\cdot 30^\\circ = 120^\\circ$. O arco maior entre essas mesmas duas marcas, indo pelo outro lado do mostrador, mede $360^\\circ - 120^\\circ = 240^\\circ$. Repare que estamos medindo o arco em graus, e não o comprimento dele em centímetros, que depende do raio e fica para o estudo das medidas.",
                    },
                    {
                        type: "text",
                        value: "## Reta e circunferência: três posições possíveis\n\nTome uma circunferência de centro $O$ e raio $r$ e uma reta do mesmo plano. Chame de $h$ a distância do centro até a reta, medida na perpendicular, que é o caminho mais curto entre um ponto e uma reta. Só existem três situações:\n\n| Posição | Condição | Pontos em comum |\n| --- | --- | --- |\n| secante | $h < r$ | dois |\n| tangente | $h = r$ | um |\n| externa | $h > r$ | nenhum |\n\nExemplo: com $r = 5$ cm, uma reta a $3$ cm do centro é secante, porque $3 < 5$, e corta a circunferência em dois pontos; uma reta a $5$ cm é tangente, porque $5 = 5$, e toca em um único ponto; uma reta a $8$ cm é externa, porque $8 > 5$, e não toca em nenhum.\n\nGuarde a propriedade da tangente: no ponto de contato, a reta tangente é perpendicular ao raio. Então o raio traçado até o ponto de tangência forma $90^\\circ$ com a reta, o que transforma muitos problemas de tangência em problemas de triângulo retângulo.",
                    },
                    {
                        type: "text",
                        value: "## Ângulo central\n\nUm **ângulo central** tem o vértice no centro da circunferência, e seus dois lados são raios. A medida dele é igual à medida do arco que ele determina. É a relação mais direta possível: ângulo central de $130^\\circ$ enxerga arco de $130^\\circ$.\n\nExemplo: no mostrador do relógio, o ângulo central entre o raio que vai até a marca do $12$ e o raio que vai até a marca do $4$ mede $120^\\circ$, exatamente a medida do arco entre as duas marcas. Se em vez de $12$ marcas a circunferência fosse dividida em $8$ arcos iguais, cada ângulo central valeria $\\frac{360^\\circ}{8} = 45^\\circ$.",
                    },
                    {
                        type: "text",
                        value: "## Ângulo inscrito\n\nUm **ângulo inscrito** tem o vértice sobre a circunferência, e seus dois lados são cordas. Imagine a circunferência com o centro $O$, dois pontos $A$ e $B$ perto da parte de baixo e um ponto $C$ bem no alto. O ângulo $A\\hat{C}B$ é inscrito, e o arco que ele enxerga é o arco $AB$ que não contém $C$, isto é, o de baixo.\n\nA propriedade central é que o ângulo inscrito mede a metade do arco que enxerga, e portanto a metade do ângulo central que enxerga esse mesmo arco:\n\n$$\\text{inscrito} = \\frac{\\text{arco}}{2} = \\frac{\\text{central}}{2}$$\n\nExemplo: se o arco $AB$ de baixo mede $80^\\circ$, o ângulo central $A\\hat{O}B$ mede $80^\\circ$ e o ângulo inscrito $A\\hat{C}B$ mede $\\frac{80^\\circ}{2} = 40^\\circ$.\n\nDuas consequências aparecem muito:\n\n- todos os ângulos inscritos que enxergam o mesmo arco são iguais entre si, não importa onde esteja o vértice no arco oposto;\n- se $\\overline{AB}$ é um diâmetro, o arco enxergado é uma semicircunferência de $180^\\circ$, e qualquer ângulo inscrito nela mede $\\frac{180^\\circ}{2} = 90^\\circ$. Ou seja, todo triângulo com um lado sobre o diâmetro e o terceiro vértice na circunferência é retângulo.\n\nErro comum: dobrar quando era para dividir. Se o exercício dá o ângulo central e pede o inscrito, divide por dois; se dá o inscrito e pede o central ou o arco, multiplica por dois.",
                    },
                    {
                        type: "text",
                        value: "## Um exemplo com tudo junto\n\nConsidere uma circunferência de centro $O$ e raio $6$ cm, com três pontos sobre ela: $A$ e $B$ próximos da parte de baixo e $C$ no alto. Sabemos que o ângulo central $A\\hat{O}B$ mede $130^\\circ$.\n\nPrimeiro, o arco $AB$ menor mede $130^\\circ$, igual ao ângulo central. O arco maior, que passa por $C$, mede $360^\\circ - 130^\\circ = 230^\\circ$.\n\nSegundo, o ângulo inscrito $A\\hat{C}B$ enxerga o arco menor, então vale a metade dele:\n\n$$A\\hat{C}B = \\frac{130^\\circ}{2} = 65^\\circ$$\n\nTerceiro, o triângulo $AOB$ é isósceles, porque $OA = OB = 6$ cm são dois raios. Seus dois ângulos da base são iguais e valem\n\n$$\\frac{180^\\circ - 130^\\circ}{2} = \\frac{50^\\circ}{2} = 25^\\circ$$\n\nNum exercício só juntamos o ângulo central, o ângulo inscrito, o triângulo isósceles e a soma dos ângulos internos do triângulo. É assim que esses assuntos costumam aparecer.",
                    },
                    {
                        type: "quote",
                        value: "A circunferência é a linha e o círculo é a região que ela limita; o diâmetro é a maior corda e vale $2r$. Comparando a distância do centro à reta com o raio, a reta é secante, tangente ou externa, e no ponto de tangência ela é perpendicular ao raio. O ângulo central tem a medida do arco, e o inscrito tem a metade dela.",
                    },
                ],
                questions: [
                    {
                        statement: "Numa circunferência de raio $7$ cm, quanto mede o diâmetro?",
                        difficulty: "facil",
                        options: [
                            { text: "$3{,}5$ cm", isCorrect: false },
                            { text: "$14$ cm", isCorrect: true },
                            { text: "$7$ cm", isCorrect: false },
                            { text: "$49$ cm", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação distingue corretamente a circunferência do círculo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A circunferência é plana, e o círculo é um sólido de três dimensões.",
                                isCorrect: false,
                            },
                            {
                                text: "A circunferência é a linha, e o círculo é a região que ela limita.",
                                isCorrect: true,
                            },
                            {
                                text: "A circunferência é a região, e o círculo é a linha.",
                                isCorrect: false,
                            },
                            {
                                text: "A circunferência tem raio, e o círculo tem somente diâmetro definido.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A distância do centro de uma circunferência de raio $5$ cm até certa reta do mesmo plano é de $5$ cm. Qual é a posição relativa entre essa reta e a circunferência?",
                        difficulty: "medio",
                        options: [
                            { text: "secante, com dois pontos em comum", isCorrect: false },
                            { text: "tangente, com um único ponto em comum", isCorrect: true },
                            { text: "externa, sem nenhum ponto de interseção", isCorrect: false },
                            { text: "tangente, com dois pontos em comum", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um ângulo inscrito numa circunferência enxerga um arco de $80^\\circ$. Quanto mede esse ângulo inscrito?",
                        difficulty: "medio",
                        options: [
                            { text: "$20^\\circ$", isCorrect: false },
                            { text: "$40^\\circ$", isCorrect: true },
                            { text: "$160^\\circ$", isCorrect: false },
                            { text: "$80^\\circ$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Os pontos $A$ e $B$ são as extremidades de um diâmetro de uma circunferência, e $C$ é um terceiro ponto dessa circunferência, diferente de $A$ e de $B$. Quanto mede o ângulo $A\\hat{C}B$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$90^\\circ$", isCorrect: true },
                            { text: "depende da posição de $C$", isCorrect: false },
                            { text: "$180^\\circ$", isCorrect: false },
                            { text: "$45^\\circ$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Semelhança, Teorema de Tales e Teorema de Pitágoras",
                blocks: [
                    {
                        type: "text",
                        value: "# Semelhança, Teorema de Tales e Teorema de Pitágoras\n\nComo medir a altura de um poste sem subir nele? Espere o sol bater de lado, meça a sombra do poste, finque ao lado uma vara de altura conhecida e meça a sombra dela. O poste com a sua sombra e a vara com a dela formam dois triângulos de mesma forma, e a proporção entre eles entrega a altura. Esta aula é sobre isso: figuras de mesma forma e tamanhos diferentes, e os dois teoremas que mais rendem na geometria plana.",
                    },
                    {
                        type: "text",
                        value: "## Semelhança e razão de semelhança\n\nDois triângulos são **semelhantes** quando têm os três ângulos iguais e os lados correspondentes proporcionais. Escrevemos $\\triangle ABC \\sim \\triangle DEF$, e a ordem das letras importa: ela diz quem corresponde a quem, ou seja, que $A$ corresponde a $D$, $B$ a $E$ e $C$ a $F$.\n\nA constante que liga os lados é a **razão de semelhança**:\n\n$$k = \\frac{DE}{AB} = \\frac{EF}{BC} = \\frac{DF}{AC}$$\n\nExemplo: um triângulo tem lados $3$, $4$ e $5$; outro tem lados $9$, $12$ e $15$. Como\n\n$$\\frac{9}{3} = \\frac{12}{4} = \\frac{15}{5} = 3$$\n\nos dois são semelhantes com razão $k = 3$, isto é, o segundo é o primeiro ampliado três vezes. Se a razão fosse $k = 1$, os triângulos seriam congruentes: congruência é a semelhança de razão $1$.\n\nAtenção a um ponto que confunde muita gente: a razão de semelhança multiplica comprimento. Ângulo não muda com a ampliação, continua com a mesma medida nos dois triângulos.",
                    },
                    {
                        type: "text",
                        value: "## Os casos de semelhança\n\nPara garantir semelhança bastam duas informações, e não três como na congruência:\n\n| Caso | O que basta |\n| --- | --- |\n| AA | dois ângulos iguais |\n| LAL | dois lados proporcionais e o ângulo entre eles igual |\n| LLL | os três lados proporcionais |\n\nO caso AA é o mais usado, porque se dois ângulos são iguais o terceiro também é: ele é o que falta para fechar $180^\\circ$.\n\nExemplo numérico: $\\triangle ABC \\sim \\triangle DEF$, com $AB = 6$, $BC = 8$ e $DE = 9$. A razão é $k = \\frac{9}{6} = \\frac{3}{2}$, então\n\n$$EF = k \\cdot BC = \\frac{3}{2} \\cdot 8 = 12$$\n\nVoltando ao poste: uma vara de $2$ m faz sombra de $1{,}5$ m, e o poste faz sombra de $6$ m no mesmo instante. Os dois triângulos têm um ângulo reto no chão e o mesmo ângulo de inclinação do sol, então são semelhantes pelo caso AA. Chamando de $h$ a altura do poste,\n\n$$\\frac{h}{6} = \\frac{2}{1{,}5} \\quad \\Rightarrow \\quad h = 6 \\cdot \\frac{2}{1{,}5} = 8$$\n\nO poste tem $8$ m de altura, medidos sem sair do chão.",
                    },
                    {
                        type: "text",
                        value: "## Teorema de Tales\n\nImagine três retas paralelas na horizontal, uma abaixo da outra, e duas retas inclinadas cortando as três. Essas duas retas inclinadas são as transversais. O **Teorema de Tales** diz que um feixe de paralelas corta as transversais em segmentos proporcionais.\n\nChame de $a$ e $b$ os dois segmentos determinados na primeira transversal, de cima para baixo, e de $c$ e $d$ os da segunda, na mesma ordem. Então\n\n$$\\frac{a}{b} = \\frac{c}{d}$$\n\nExemplo: na primeira transversal os segmentos medem $4$ cm e $6$ cm. Na segunda, o segmento de cima mede $6$ cm e queremos o de baixo, que vamos chamar de $x$:\n\n$$\\frac{4}{6} = \\frac{6}{x} \\quad \\Rightarrow \\quad 4x = 36 \\quad \\Rightarrow \\quad x = 9$$\n\nO segmento de baixo mede $9$ cm.\n\nErro comum: trocar a ordem de um lado só, escrevendo $\\frac{4}{6} = \\frac{x}{6}$. A proporção exige que os dois numeradores sejam segmentos correspondentes, os dois de cima ou os dois de baixo, e nunca um de cada.",
                    },
                    {
                        type: "text",
                        value: "## Tales dentro do triângulo\n\nHá uma versão de Tales que vive dentro do triângulo. Imagine o triângulo $ABC$ com a base $\\overline{BC}$ na horizontal e o vértice $A$ no alto. Trace um segmento $\\overline{DE}$ paralelo à base, com $D$ sobre o lado $\\overline{AB}$ e $E$ sobre o lado $\\overline{AC}$. Esse segmento divide os dois lados em partes proporcionais:\n\n$$\\frac{AD}{DB} = \\frac{AE}{EC}$$\n\nExemplo: com $AD = 3$, $DB = 6$ e $AE = 4$, temos\n\n$$\\frac{3}{6} = \\frac{4}{EC} \\quad \\Rightarrow \\quad 3 \\cdot EC = 24 \\quad \\Rightarrow \\quad EC = 8$$\n\nDe quebra, $\\triangle ADE \\sim \\triangle ABC$ pelo caso AA: o ângulo de $A$ é comum aos dois, e os ângulos em $D$ e em $B$ são correspondentes de duas paralelas cortadas por $\\overline{AB}$. A razão de semelhança é $\\frac{AD}{AB} = \\frac{3}{9} = \\frac{1}{3}$.\n\nErro comum: misturar parte com todo. Na proporção $\\frac{AD}{DB} = \\frac{AE}{EC}$ aparecem as duas partes de cada lado. Se você preferir usar o lado inteiro, a proporção certa é $\\frac{AD}{AB} = \\frac{AE}{AC}$. O que não pode é escrever $\\frac{AD}{DB} = \\frac{AE}{AC}$, com parte de um lado e todo do outro.",
                    },
                    {
                        type: "text",
                        value: "## Teorema de Pitágoras\n\nNum triângulo retângulo de hipotenusa $a$ e catetos $b$ e $c$,\n\n$$a^2 = b^2 + c^2$$\n\nA demonstração por área é das mais bonitas da matemática. Imagine um quadrado grande de lado $b + c$. Encaixe nele quatro cópias do triângulo retângulo, uma em cada canto, todas giradas no mesmo sentido, cada uma com o cateto $b$ apoiado num lado do quadrado e o cateto $c$ no lado seguinte. No meio sobra um buraco, e esse buraco é um quadrado de lado $a$, porque cada um dos quatro lados dele é a hipotenusa de uma das cópias.\n\nAgora meça a região do quadrado grande de duas maneiras. Pelo lado dele:\n\n$$(b + c)^2 = b^2 + 2bc + c^2$$\n\nPelas partes, que são quatro triângulos de $\\frac{bc}{2}$ cada mais o quadrado do meio:\n\n$$4 \\cdot \\frac{bc}{2} + a^2 = 2bc + a^2$$\n\nAs duas contas descrevem a mesma região, então são iguais:\n\n$$b^2 + 2bc + c^2 = 2bc + a^2$$\n\nCancelando o $2bc$ que aparece nos dois lados, sobra $a^2 = b^2 + c^2$.\n\nExemplo: catetos $9$ e $12$. A hipotenusa cumpre $a^2 = 9^2 + 12^2 = 81 + 144 = 225$, logo $a = \\sqrt{225} = 15$.\n\nPara achar um cateto o teorema é o mesmo, mas a conta vira subtração. Com hipotenusa $13$ e um cateto $5$:\n\n$$13^2 = 5^2 + c^2 \\quad \\Rightarrow \\quad 169 = 25 + c^2 \\quad \\Rightarrow \\quad c^2 = 144 \\quad \\Rightarrow \\quad c = 12$$\n\nErro comum: somar tudo. Quem escreve $a^2 = 13^2 + 5^2$ está calculando a hipotenusa de outro triângulo. A hipotenusa fica sempre sozinha de um lado da igualdade, porque ela é o maior dos três lados.",
                    },
                    {
                        type: "text",
                        value: "## A recíproca de Pitágoras e os ternos\n\nO teorema vale de volta: se os três lados de um triângulo cumprem $a^2 = b^2 + c^2$, com $a$ sendo o maior deles, então o triângulo é retângulo. Essa é a recíproca de Pitágoras, e ela serve para testar um triângulo sem medir ângulo nenhum.\n\nExemplo: os lados $6$, $8$ e $10$ formam um triângulo retângulo, porque\n\n$$10^2 = 100 \\quad \\text{e} \\quad 6^2 + 8^2 = 36 + 64 = 100$$\n\nJá os lados $9$, $12$ e $16$ não formam, porque $16^2 = 256$ enquanto $9^2 + 12^2 = 81 + 144 = 225$. Como $225 < 256$, o maior ângulo passou de $90^\\circ$ e o triângulo é obtusângulo. Se a soma dos quadrados dos dois menores fosse maior que o quadrado do maior, o triângulo seria acutângulo.\n\nTrios de números inteiros que cumprem a igualdade se chamam **ternos pitagóricos**. Vale decorar os três primeiros, porque eles aparecem sem parar: $(3, 4, 5)$, $(5, 12, 13)$ e $(8, 15, 17)$. Qualquer múltiplo de um terno também é terno, como $(6, 8, 10)$ e $(9, 12, 15)$, que são o primeiro dobrado e triplicado. Reconhecer um terno de cara poupa a conta inteira.",
                    },
                    {
                        type: "quote",
                        value: "Triângulos semelhantes têm os ângulos iguais e os lados proporcionais, na razão $k$, e o caso AA costuma resolver tudo. Tales garante segmentos proporcionais em feixes de paralelas e dentro do triângulo, e Pitágoras liga os três lados do triângulo retângulo por $a^2 = b^2 + c^2$, valendo também na volta: se a igualdade vale, o triângulo é retângulo.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Num triângulo retângulo, os catetos medem $9$ cm e $12$ cm. Quanto mede a hipotenusa?",
                        difficulty: "facil",
                        options: [
                            { text: "$225$ cm", isCorrect: false },
                            { text: "$21$ cm", isCorrect: false },
                            { text: "$15$ cm", isCorrect: true },
                            { text: "$\\sqrt{21}$ cm", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um triângulo tem lados $3$, $4$ e $5$, e outro tem lados $9$, $12$ e $15$. Qual é a razão de semelhança do segundo triângulo para o primeiro?",
                        difficulty: "facil",
                        options: [
                            { text: "$6$", isCorrect: false },
                            { text: "$3$", isCorrect: true },
                            { text: "$9$", isCorrect: false },
                            { text: "$\\frac{1}{3}$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Três retas paralelas são cortadas por duas transversais. Na primeira transversal, os dois segmentos determinados medem $4$ cm e $6$ cm, de cima para baixo. Na segunda transversal, o segmento de cima mede $6$ cm. Quanto mede o segmento de baixo da segunda transversal?",
                        difficulty: "medio",
                        options: [
                            { text: "$4$ cm", isCorrect: false },
                            { text: "$12$ cm", isCorrect: false },
                            { text: "$9$ cm", isCorrect: true },
                            { text: "$8$ cm", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "No triângulo $ABC$, o segmento $\\overline{DE}$ é paralelo ao lado $\\overline{BC}$, com $D$ sobre $\\overline{AB}$ e $E$ sobre $\\overline{AC}$. Sabendo que $AD = 3$, $DB = 6$ e $AE = 4$, quanto mede $EC$?",
                        difficulty: "medio",
                        options: [
                            { text: "$8$", isCorrect: true },
                            { text: "$12$", isCorrect: false },
                            { text: "$2$", isCorrect: false },
                            { text: "$6$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um triângulo tem lados medindo $9$, $12$ e $16$. Esse triângulo é retângulo?",
                        difficulty: "dificil",
                        options: [
                            { text: "Sim, porque $9^2 + 12^2 = 16^2$", isCorrect: false },
                            {
                                text: "Não, ele é acutângulo, porque $9^2 + 12^2 > 16^2$",
                                isCorrect: false,
                            },
                            {
                                text: "Não, é obtusângulo, porque $9^2 + 12^2 < 16^2$",
                                isCorrect: true,
                            },
                            {
                                text: "Não dá para decidir apenas com as medidas dos lados",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Medidas, área e volume",
        aulas: [
            {
                titulo: "Unidades de medida e conversões",
                blocks: [
                    {
                        type: "text",
                        value: "# Unidades de medida e conversões\n\nA loja vende piso por metro quadrado, tinta por litro, cimento por quilo e cobra a entrega por hora de caminhão. Quem erra a unidade compra material a mais, paga frete duas vezes ou chega na obra com meio quarto sem piso. Nesta aula vamos organizar as unidades de comprimento, massa, capacidade e tempo, aprender a passar de uma para outra e desarmar o erro mais caro de todos: converter área e volume como se fossem comprimento.",
                    },
                    {
                        type: "text",
                        value: "## Medir é comparar com uma unidade\n\nMedir uma grandeza é escolher uma unidade e contar quantas vezes ela cabe ali. Quando você diz que o quarto tem $3{,}40$ m de largura, está dizendo que o metro cabe $3{,}40$ vezes na largura do quarto.\n\nCada grandeza tem sua unidade principal:\n\n| Grandeza | O que mede | Unidade principal | Símbolo |\n| --- | --- | --- | --- |\n| Comprimento | distância, largura, altura | metro | m |\n| Massa | a quantidade de matéria do corpo | quilograma | kg |\n| Capacidade | quanto cabe dentro de um recipiente | litro | L |\n| Tempo | duração | segundo | s |\n\nA unidade faz parte do resultado. Dizer que a parede tem $3$ não informa nada: pode ser $3$ metros, $3$ palmos ou $3$ tijolos.",
                    },
                    {
                        type: "text",
                        value: "## Os prefixos do sistema métrico\n\nO sistema métrico foi feito para que toda conversão seja uma multiplicação ou uma divisão por potência de dez. Para isso ele usa prefixos com significado fixo, que se grudam em qualquer unidade:\n\n| Prefixo | Símbolo | Significado |\n| --- | --- | --- |\n| quilo | k | $1000$ vezes a unidade |\n| hecto | h | $100$ vezes a unidade |\n| deca | da | $10$ vezes a unidade |\n| deci | d | a décima parte |\n| centi | c | a centésima parte |\n| mili | m | a milésima parte |\n\nAssim, $1\\text{ km} = 1000\\text{ m}$ e $1\\text{ m} = 100\\text{ cm}$, e o mesmo prefixo vale para massa ($1\\text{ kg} = 1000\\text{ g}$) e para capacidade ($1\\text{ mL}$ é a milésima parte do litro).\n\n**Exemplo.** Quantos centímetros mede uma trena de $2{,}5\\text{ km}$? Primeiro para metros, $2{,}5 \\cdot 1000 = 2500\\text{ m}$. Depois para centímetros, $2500 \\cdot 100 = 250\\,000\\text{ cm}$.",
                    },
                    {
                        type: "text",
                        value: "## Massa, capacidade e a ponte com o volume\n\nNa massa, as unidades do dia a dia são a tonelada, o quilograma, o grama e o miligrama:\n\n$$1\\text{ t} = 1000\\text{ kg} \\qquad 1\\text{ kg} = 1000\\text{ g} \\qquad 1\\text{ g} = 1000\\text{ mg}$$\n\nNa capacidade usamos o litro e o mililitro, com $1\\text{ L} = 1000\\text{ mL}$. A **capacidade** diz quanto cabe dentro de um recipiente e o **volume** diz quanto de espaço um corpo ocupa, então são a mesma ideia escrita em unidades diferentes. A ponte entre as duas é:\n\n$$1\\text{ L} = 1\\text{ dm}^3 \\qquad 1\\text{ m}^3 = 1000\\text{ L}$$\n\nÉ por isso que a caixa d'água de mil litros tem mais ou menos um metro de lado: um metro cúbico de água dá exatamente mil litros.\n\n**Exemplo.** O tanque de combustível de um carro popular tem capacidade de $0{,}055\\text{ m}^3$. Em litros, $0{,}055 \\cdot 1000 = 55\\text{ L}$, que é o tanque que você conhece do posto.",
                    },
                    {
                        type: "text",
                        value: "## Tempo, a unidade que não é decimal\n\nO tempo é a exceção do sistema, porque ele não anda de dez em dez:\n\n$$1\\text{ min} = 60\\text{ s} \\qquad 1\\text{ h} = 60\\text{ min} \\qquad 1\\text{ dia} = 24\\text{ h}$$\n\nPara passar de hora para minuto, multiplique por $60$; para voltar, divida por $60$.\n\n**Exemplo.** Uma betoneira trabalhou $2$ h e $45$ min. Em minutos, são $2 \\cdot 60 + 45 = 120 + 45 = 165\\text{ min}$. No sentido contrário, $150$ min dão $150 \\div 60 = 2$ h com resto $30$, ou seja, $2$ h e $30$ min.\n\nO erro comum aqui é ler o relógio como se fosse decimal. $2{,}5$ h não é duas horas e cinquenta minutos: é $2$ h mais $0{,}5 \\cdot 60 = 30$ min, isto é, $2$ h e $30$ min.",
                    },
                    {
                        type: "text",
                        value: "## O erro de converter área e volume como se fosse comprimento\n\nEsta é a armadilha que estraga orçamento de obra. É verdade que $1\\text{ m} = 100\\text{ cm}$, mas **não** é verdade que $1\\text{ m}^2 = 100\\text{ cm}^2$. O metro quadrado é um quadrado de um metro de lado, e tanto a largura quanto a altura dele valem $100$ cm:\n\n$$1\\text{ m}^2 = (100\\text{ cm})^2 = 100^2\\text{ cm}^2 = 10\\,000\\text{ cm}^2$$\n\n$$1\\text{ m}^3 = (100\\text{ cm})^3 = 100^3\\text{ cm}^3 = 1\\,000\\,000\\text{ cm}^3$$\n\nA regra é curta: em área o fator de conversão vai ao quadrado, em volume vai ao cubo.\n\n**Exemplo.** O piso de uma sala tem $18\\text{ m}^2$. Em centímetros quadrados, $18 \\cdot 10\\,000 = 180\\,000\\text{ cm}^2$. Quem multiplica por $100$ encontra $1800\\text{ cm}^2$, uma sala do tamanho de uma folha de papel, e deveria desconfiar na hora.\n\nVale o mesmo subindo de unidade: $1\\text{ km}^2$ não é $1000\\text{ m}^2$, e sim $1000^2 = 1\\,000\\,000\\text{ m}^2$.",
                    },
                    {
                        type: "quote",
                        value: "Medir é contar quantas vezes a unidade cabe na grandeza, e no sistema métrico toda conversão é multiplicar ou dividir por potência de dez. O litro é o decímetro cúbico, o tempo não é decimal, e o fator de conversão vai ao quadrado em área e ao cubo em volume.",
                    },
                ],
                questions: [
                    {
                        statement: "Quantos centímetros há em $2{,}5$ metros?",
                        difficulty: "facil",
                        options: [
                            { text: "$0{,}25\\text{ cm}$", isCorrect: false },
                            { text: "$2500\\text{ cm}$", isCorrect: false },
                            { text: "$25\\text{ cm}$", isCorrect: false },
                            { text: "$250\\text{ cm}$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Uma caixa d'água cúbica tem $1$ metro de aresta. Quantos litros de água ela guarda quando está cheia?",
                        difficulty: "facil",
                        options: [
                            { text: "$10\\,000\\text{ L}$", isCorrect: false },
                            { text: "$1000\\text{ L}$", isCorrect: true },
                            { text: "$10\\text{ L}$", isCorrect: false },
                            { text: "$100\\text{ L}$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um piso de $1\\text{ m}^2$ corresponde a quantos centímetros quadrados?",
                        difficulty: "medio",
                        options: [
                            { text: "$10\\,000\\text{ cm}^2$", isCorrect: true },
                            { text: "$1\\,000\\,000\\text{ cm}^2$", isCorrect: false },
                            { text: "$1000\\text{ cm}^2$", isCorrect: false },
                            { text: "$100\\text{ cm}^2$", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Quanto valem $2$ h e $45$ min, escritos somente em minutos?",
                        difficulty: "medio",
                        options: [
                            { text: "$147\\text{ min}$", isCorrect: false },
                            { text: "$120\\text{ min}$", isCorrect: false },
                            { text: "$165\\text{ min}$", isCorrect: true },
                            { text: "$245\\text{ min}$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma torneira enche um balde de $12$ litros em $40$ segundos. Quantos metros cúbicos de água ela despeja em meia hora?",
                        difficulty: "dificil",
                        options: [
                            { text: "$5{,}4\\text{ m}^3$", isCorrect: false },
                            { text: "$0{,}054\\text{ m}^3$", isCorrect: false },
                            { text: "$0{,}54\\text{ m}^3$", isCorrect: true },
                            { text: "$540\\text{ m}^3$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Perímetro e área das figuras planas",
                blocks: [
                    {
                        type: "text",
                        value: "# Perímetro e área das figuras planas\n\nPara trocar o piso do quarto você precisa de duas contas diferentes, e elas não se misturam: quantos metros de rodapé comprar e quantos metros quadrados de piso. A primeira é perímetro, a segunda é área. Trocar uma pela outra é o erro que faz sobrar material na obra, ou faltar na véspera da entrega.",
                    },
                    {
                        type: "text",
                        value: "## Perímetro e área não medem a mesma coisa\n\nO **perímetro** é a soma das medidas dos lados, ou seja, o comprimento do contorno da figura. Ele sai em unidade de comprimento: metro, centímetro, quilômetro. A **área** é a medida da superfície que a figura ocupa, e sai em unidade quadrada: metro quadrado, centímetro quadrado.\n\n**Exemplo.** Um quarto retangular de $3\\text{ m}$ por $4\\text{ m}$ tem perímetro $P = 3 + 4 + 3 + 4 = 14\\text{ m}$ de rodapé e área $A = 3 \\cdot 4 = 12\\text{ m}^2$ de piso.\n\nAs duas medidas são independentes de verdade. Um corredor de $1\\text{ m}$ por $6\\text{ m}$ tem o mesmo perímetro, $P = 1 + 6 + 1 + 6 = 14\\text{ m}$, mas área $A = 1 \\cdot 6 = 6\\text{ m}^2$, a metade do quarto. Mesmo rodapé, metade do piso.",
                    },
                    {
                        type: "text",
                        value: "## Retângulo e quadrado\n\nNo retângulo de base $b$ e altura $h$:\n\n$$A = b \\cdot h \\qquad P = 2(b + h)$$\n\nO quadrado é o retângulo de lados iguais. Chamando o lado de $\\ell$:\n\n$$A = \\ell^2 \\qquad P = 4\\ell$$\n\n**Exemplo.** O quarto mede $3{,}5\\text{ m}$ por $4{,}2\\text{ m}$, então o piso tem $A = 3{,}5 \\cdot 4{,}2 = 14{,}7\\text{ m}^2$. Se cada caixa de porcelanato cobre $2{,}2\\text{ m}^2$, são $14{,}7 \\div 2{,}2 \\approx 6{,}7$ caixas, e como ninguém vende caixa pela metade, compre $7$.",
                    },
                    {
                        type: "text",
                        value: "## Paralelogramo e triângulo\n\nO **paralelogramo** é o quadrilátero de lados opostos paralelos. Se você corta um triângulo de uma ponta e cola na outra, ele vira um retângulo de mesma base e mesma altura, e por isso:\n\n$$A_{\\text{paralelogramo}} = b \\cdot h$$\n\nAtenção ao que é $h$: é a **altura**, a distância perpendicular entre as duas bases, e não o lado inclinado. Usar o lado inclinado no lugar da altura é o erro mais comum do paralelogramo, e ele sempre dá uma área maior que a verdadeira.\n\nDois triângulos iguais, colados por um lado qualquer, formam um paralelogramo. Daí sai a área do triângulo, que é a metade:\n\n$$A = \\frac{b \\cdot h}{2}$$\n\n**Exemplo.** Um canteiro triangular tem base $12\\text{ m}$ e altura $7\\text{ m}$, então $A = \\frac{12 \\cdot 7}{2} = \\frac{84}{2} = 42\\text{ m}^2$.\n\nQuando a altura não vem dada, às vezes o teorema de Pitágoras a entrega. Em um triângulo isósceles de lados $5\\text{ m}$, $5\\text{ m}$ e base $6\\text{ m}$, a altura cai no meio da base e forma um triângulo retângulo de hipotenusa $5$ e cateto $3$. Então $h = \\sqrt{5^2 - 3^2} = \\sqrt{16} = 4\\text{ m}$, e a área é $A = \\frac{6 \\cdot 4}{2} = 12\\text{ m}^2$.",
                    },
                    {
                        type: "text",
                        value: "## Trapézio e losango\n\nO **trapézio** tem um único par de lados paralelos, a base maior $B$ e a base menor $b$. Sua área é a média das bases vezes a altura:\n\n$$A = \\frac{(B + b) \\cdot h}{2}$$\n\n**Exemplo.** Um canteiro em forma de trapézio tem bases de $5\\text{ m}$ e $3\\text{ m}$ e altura $2\\text{ m}$. Então $A = \\frac{(5 + 3) \\cdot 2}{2} = \\frac{16}{2} = 8\\text{ m}^2$.\n\nO **losango** é o paralelogramo de quatro lados iguais, e suas duas diagonais se cruzam no meio formando ângulo reto. Chamando as diagonais de $D$ e $d$:\n\n$$A = \\frac{D \\cdot d}{2}$$\n\n**Exemplo.** Um vitral em forma de losango tem diagonais de $10\\text{ cm}$ e $6\\text{ cm}$, logo $A = \\frac{10 \\cdot 6}{2} = 30\\text{ cm}^2$. Como o losango também é paralelogramo, a fórmula $A = b \\cdot h$ continua valendo nele, mas pelas diagonais a conta é mais curta, porque é delas que a figura costuma vir medida.",
                    },
                    {
                        type: "text",
                        value: "## Área por decomposição\n\nParede e piso de verdade raramente são um retângulo limpo. A saída é sempre a mesma: quebrar a figura em pedaços de área conhecida e somar, ou cercar a figura com um retângulo maior e subtrair o que não faz parte dela.\n\n**Exemplo por subtração.** Você vai pintar uma parede de $3\\text{ m}$ de largura por $2{,}6\\text{ m}$ de altura, e nela há uma porta de $0{,}8\\text{ m}$ por $2{,}1\\text{ m}$. A área a pintar é $A = 3 \\cdot 2{,}6 - 0{,}8 \\cdot 2{,}1 = 7{,}8 - 1{,}68 = 6{,}12\\text{ m}^2$. Se a lata rende $40\\text{ m}^2$ por demão, uma lata cobre essa parede com folga até em duas demãos.\n\n**Exemplo por decomposição.** A sala tem planta em forma de L: um retângulo de $5\\text{ m}$ por $4\\text{ m}$ com um recorte de $2\\text{ m}$ por $1{,}5\\text{ m}$ em um dos cantos. Por subtração, $A = 5 \\cdot 4 - 2 \\cdot 1{,}5 = 20 - 3 = 17\\text{ m}^2$. Cortando em dois retângulos, uma faixa de $5\\text{ m}$ por $2{,}5\\text{ m}$ e outra de $3\\text{ m}$ por $1{,}5\\text{ m}$, fica $A = 12{,}5 + 4{,}5 = 17\\text{ m}^2$.\n\nOs dois caminhos tinham que dar o mesmo número, e é exatamente assim que se confere uma área composta.",
                    },
                    {
                        type: "quote",
                        value: "Perímetro é o contorno e sai em metro; área é a superfície e sai em metro quadrado. Toda área de figura plana sai de base vezes altura, com um divisor $2$ no triângulo, no trapézio e no losango, e figura torta se resolve somando pedaços ou subtraindo o que falta de um retângulo maior.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Um quarto retangular mede $3\\text{ m}$ por $4\\text{ m}$. Quantos metros de rodapé são necessários para contornar o quarto inteiro?",
                        difficulty: "facil",
                        options: [
                            { text: "$14\\text{ m}$", isCorrect: true },
                            { text: "$24\\text{ m}$", isCorrect: false },
                            { text: "$7\\text{ m}$", isCorrect: false },
                            { text: "$12\\text{ m}$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um terreno triangular tem base $10\\text{ m}$ e altura $6\\text{ m}$. Qual é a área desse terreno?",
                        difficulty: "facil",
                        options: [
                            { text: "$30\\text{ m}^2$", isCorrect: true },
                            { text: "$16\\text{ m}^2$", isCorrect: false },
                            { text: "$60\\text{ m}^2$", isCorrect: false },
                            { text: "$15\\text{ m}^2$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um canteiro em forma de trapézio tem base maior $6\\text{ m}$, base menor $4\\text{ m}$ e altura $3\\text{ m}$. Qual é a área do canteiro?",
                        difficulty: "medio",
                        options: [
                            { text: "$18\\text{ m}^2$", isCorrect: false },
                            { text: "$12\\text{ m}^2$", isCorrect: false },
                            { text: "$30\\text{ m}^2$", isCorrect: false },
                            { text: "$15\\text{ m}^2$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "A planta de um escritório é um retângulo de $8\\text{ m}$ por $6\\text{ m}$ do qual se retira um quadrado de $2\\text{ m}$ de lado em um dos cantos. Qual é a área do escritório?",
                        difficulty: "medio",
                        options: [
                            { text: "$40\\text{ m}^2$", isCorrect: false },
                            { text: "$52\\text{ m}^2$", isCorrect: false },
                            { text: "$48\\text{ m}^2$", isCorrect: false },
                            { text: "$44\\text{ m}^2$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Um painel em forma de losango tem lados de $5\\text{ cm}$ e uma das diagonais medindo $8\\text{ cm}$. Qual é a área do painel?",
                        difficulty: "dificil",
                        options: [
                            { text: "$12\\text{ cm}^2$", isCorrect: false },
                            { text: "$20\\text{ cm}^2$", isCorrect: false },
                            { text: "$48\\text{ cm}^2$", isCorrect: false },
                            { text: "$24\\text{ cm}^2$", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Comprimento e área do círculo, e o setor circular",
                blocks: [
                    {
                        type: "text",
                        value: "# Comprimento e área do círculo, e o setor circular\n\nA tampa da caixa d'água é redonda, a pizza é redonda e o canteiro no meio do condomínio também. Para comprar a borracha de vedação da tampa você precisa de uma fórmula; para saber quanta grama cobre o canteiro, de outra. As duas envolvem o mesmo número estranho, o $\\pi$, e trocar uma pela outra é o erro clássico do círculo.",
                    },
                    {
                        type: "text",
                        value: "## O número pi\n\nPegue qualquer objeto redondo, meça o contorno com uma fita, meça o diâmetro com uma régua e divida um pelo outro. Dá sempre o mesmo número, não importa o tamanho do objeto. Esse número é o $\\pi$:\n\n$$\\pi = \\frac{C}{d} \\approx 3{,}14159\\dots$$\n\nO $\\pi$ é irracional: sua parte decimal não termina e não repete, então nenhuma fração o escreve exatamente. Nas contas de obra e de prova usamos $\\pi \\approx 3{,}14$, e é essa aproximação que vale daqui para frente.\n\nAntes de seguir, dois nomes que muita gente mistura. A **circunferência** é a linha, só o contorno redondo. O **círculo** é a região inteira, a linha mais o miolo. Comprimento é da linha, área é da região.\n\n**Exemplo.** A tampa da caixa d'água tem $1{,}1\\text{ m}$ de diâmetro. O contorno mede $C = \\pi \\cdot d = 3{,}14 \\cdot 1{,}1 = 3{,}454\\text{ m}$, então $3{,}5\\text{ m}$ de borracha de vedação dão e sobra.",
                    },
                    {
                        type: "text",
                        value: "## Comprimento da circunferência\n\nComo $\\pi = \\frac{C}{d}$, basta isolar o $C$. E como o diâmetro é o dobro do raio, a mesma fórmula tem duas caras:\n\n$$C = \\pi d = 2\\pi r$$\n\n**Exemplo.** O aro de uma bicicleta tem raio $0{,}35\\text{ m}$. Cada volta completa da roda avança $C = 2 \\cdot 3{,}14 \\cdot 0{,}35 = 2{,}198\\text{ m}$ no chão, quase $2{,}2$ metros. Em $100$ voltas a bicicleta andou cerca de $220\\text{ m}$, pouco mais de dois quarteirões.",
                    },
                    {
                        type: "text",
                        value: "## Área do círculo\n\nA área da região redonda de raio $r$ é:\n\n$$A = \\pi r^2$$\n\nRepare no que mudou: aqui o raio aparece **ao quadrado**, e o resultado sai em unidade quadrada. O erro mais comum é entrar com o diâmetro no lugar do raio, e ele não erra pouco: como o diâmetro é o dobro, a área sai quatro vezes maior que a real.\n\n**Exemplo.** Um canteiro circular tem raio $4\\text{ m}$, então $A = 3{,}14 \\cdot 4^2 = 3{,}14 \\cdot 16 = 50{,}24\\text{ m}^2$. Se a grama vem em rolo de $2\\text{ m}^2$, são $50{,}24 \\div 2 = 25{,}12$ rolos, ou seja, $26$ rolos na loja.\n\nEsse quadrado também explica a pizza. Uma pizza de $20\\text{ cm}$ de diâmetro tem $A = 3{,}14 \\cdot 10^2 = 314\\text{ cm}^2$, e uma de $40\\text{ cm}$ tem $A = 3{,}14 \\cdot 20^2 = 1256\\text{ cm}^2$. Dobrar o diâmetro não dobra a pizza: quadruplica. Duas pizzas pequenas não chegam perto de uma grande.",
                    },
                    {
                        type: "text",
                        value: "## Comprimento de arco e área de setor\n\nUma fatia de pizza é um **setor circular**: a região presa entre dois raios e o pedaço de borda que eles recortam. Esse pedaço de borda é o **arco**.\n\nA conta é pura proporção. A volta inteira tem $360^\\circ$, então um ângulo central de $\\theta$ graus fica com a fração $\\frac{\\theta}{360^\\circ}$ de tudo, tanto da borda quanto da região:\n\n$$\\ell = \\frac{\\theta}{360^\\circ} \\cdot 2\\pi r \\qquad A_{\\text{setor}} = \\frac{\\theta}{360^\\circ} \\cdot \\pi r^2$$\n\n**Exemplo.** Uma pizza de raio $20\\text{ cm}$ é cortada em $8$ fatias iguais, então cada fatia abre $360^\\circ \\div 8 = 45^\\circ$, que é $\\frac{1}{8}$ da volta. A borda de cada fatia mede $\\ell = \\frac{1}{8} \\cdot 2 \\cdot 3{,}14 \\cdot 20 = \\frac{125{,}6}{8} = 15{,}7\\text{ cm}$, e a área da fatia é $A = \\frac{1}{8} \\cdot 3{,}14 \\cdot 20^2 = \\frac{1256}{8} = 157\\text{ cm}^2$.\n\nO cuidado é não confundir as duas respostas: $15{,}7$ sai em centímetro porque é comprimento de borda, e $157$ sai em centímetro quadrado porque é região.",
                    },
                    {
                        type: "text",
                        value: "## A coroa circular\n\nA **coroa circular** é a região entre dois círculos de mesmo centro, como a calçada em volta de uma piscina redonda ou a parede de um tubo visto de cima. Sendo $R \\ge r$ os raios de fora e de dentro, a área é o círculo grande menos o pequeno:\n\n$$A = \\pi R^2 - \\pi r^2 = \\pi (R^2 - r^2)$$\n\n**Exemplo.** Uma piscina circular de raio $3\\text{ m}$ é cercada por uma calçada de $1\\text{ m}$ de largura. O raio externo é $R = 3 + 1 = 4\\text{ m}$, então a calçada tem $A = 3{,}14 \\cdot (4^2 - 3^2) = 3{,}14 \\cdot (16 - 9) = 3{,}14 \\cdot 7 = 21{,}98\\text{ m}^2$.\n\nRepare na diferença entre $\\pi(R^2 - r^2)$ e $\\pi(R - r)^2$. A segunda expressão daria $3{,}14 \\cdot 1^2 = 3{,}14\\text{ m}^2$, sete vezes menos, e quem orça a calçada por esse número vai ter uma conversa desagradável com o pedreiro. Subtraia os quadrados, não eleve a subtração.",
                    },
                    {
                        type: "quote",
                        value: "No círculo, $C = 2\\pi r$ mede a linha e sai em metro, enquanto $A = \\pi r^2$ mede a região e sai em metro quadrado. Setor e arco são a fração $\\frac{\\theta}{360^\\circ}$ dessas duas medidas, e a coroa circular é a diferença dos quadrados dos raios, nunca o quadrado da diferença.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Usando $\\pi \\approx 3{,}14$, qual é o comprimento de uma circunferência de raio $5\\text{ cm}$?",
                        difficulty: "facil",
                        options: [
                            { text: "$78{,}5\\text{ cm}$", isCorrect: false },
                            { text: "$15{,}7\\text{ cm}$", isCorrect: false },
                            { text: "$62{,}8\\text{ cm}$", isCorrect: false },
                            { text: "$31{,}4\\text{ cm}$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Uma piscina redonda tem raio $3\\text{ m}$. Usando $\\pi \\approx 3{,}14$, qual é a área da superfície da água?",
                        difficulty: "facil",
                        options: [
                            { text: "$113{,}04\\text{ m}^2$", isCorrect: false },
                            { text: "$9{,}42\\text{ m}^2$", isCorrect: false },
                            { text: "$18{,}84\\text{ m}^2$", isCorrect: false },
                            { text: "$28{,}26\\text{ m}^2$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Uma pizza de raio $15\\text{ cm}$ é cortada em $6$ fatias iguais. Usando $\\pi \\approx 3{,}14$, qual é a área de uma fatia?",
                        difficulty: "medio",
                        options: [
                            { text: "$235{,}50\\text{ cm}^2$", isCorrect: false },
                            { text: "$706{,}50\\text{ cm}^2$", isCorrect: false },
                            { text: "$117{,}75\\text{ cm}^2$", isCorrect: true },
                            { text: "$15{,}70\\text{ cm}^2$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma piscina circular de raio $5\\text{ m}$ é cercada por uma calçada de $2\\text{ m}$ de largura. Usando $\\pi \\approx 3{,}14$, qual é a área apenas da calçada?",
                        difficulty: "medio",
                        options: [
                            { text: "$75{,}36\\text{ m}^2$", isCorrect: true },
                            { text: "$12{,}56\\text{ m}^2$", isCorrect: false },
                            { text: "$78{,}50\\text{ m}^2$", isCorrect: false },
                            { text: "$153{,}86\\text{ m}^2$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "A roda de uma bicicleta tem $66\\text{ cm}$ de diâmetro. Usando $\\pi \\approx 3{,}14$, quantas voltas completas ela dá ao percorrer $1\\text{ km}$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$1515$ voltas", isCorrect: false },
                            { text: "$965$ voltas", isCorrect: false },
                            { text: "$482$ voltas", isCorrect: true },
                            { text: "$241$ voltas", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Sólidos geométricos: área da superfície e volume",
                blocks: [
                    {
                        type: "text",
                        value: "# Sólidos geométricos: área da superfície e volume\n\nA caixa d'água de mil litros, o botijão de gás, o cone de sinalização da rua e a bola de futebol ocupam espaço, e cada um de um jeito diferente. Quando o assunto é sólido, duas perguntas aparecem sempre: quanto cabe dentro, que é o **volume**, e quanto material cobre o lado de fora, que é a **área da superfície**.",
                    },
                    {
                        type: "text",
                        value: "## Os nomes dos sólidos\n\nTodo sólido tem **faces** (as superfícies que o limitam), **arestas** (onde duas faces se encontram) e **vértices** (onde as arestas se encontram).\n\nOs sólidos se separam em duas famílias. O **poliedro** tem todas as faces planas e poligonais, e por isso não rola: é o caso do cubo, do paralelepípedo, do prisma e da pirâmide. O **corpo redondo** tem alguma superfície curva: é o caso do cilindro, do cone e da esfera.\n\n| Sólido | Família | Bases |\n| --- | --- | --- |\n| Cubo | poliedro | seis faces quadradas iguais |\n| Paralelepípedo | poliedro | seis faces retangulares |\n| Prisma | poliedro | dois polígonos iguais e paralelos |\n| Pirâmide | poliedro | um polígono e um vértice no topo |\n| Cilindro | corpo redondo | dois círculos iguais |\n| Cone | corpo redondo | um círculo e um vértice |\n| Esfera | corpo redondo | nenhuma, só a superfície curva |\n\nO **prisma** é o sólido de duas bases iguais e paralelas ligadas por faces laterais: a caixa de sapato é um prisma de base retangular. A **pirâmide** tem uma base só, e todas as faces laterais sobem até um mesmo ponto.\n\nEm todo poliedro convexo vale uma relação que serve de conferência rápida, a relação de Euler, com $V$ vértices, $A$ arestas e $F$ faces:\n\n$$V - A + F = 2$$\n\n**Exemplo.** No cubo, $V = 8$, $A = 12$ e $F = 6$, e de fato $8 - 12 + 6 = 2$.",
                    },
                    {
                        type: "text",
                        value: "## Prisma: volume é área da base vezes altura\n\nEm qualquer prisma, empilhar cópias da base até a altura $h$ dá o volume:\n\n$$V = A_b \\cdot h$$\n\nNo paralelepípedo de arestas $a$, $b$ e $c$ isso vira $V = a \\cdot b \\cdot c$, e a superfície é a soma das seis faces, que se repetem duas a duas:\n\n$$A = 2(ab + ac + bc)$$\n\n**Exemplo.** Uma caixa d'água retangular mede $1{,}5\\text{ m}$ por $1\\text{ m}$ de base e $0{,}8\\text{ m}$ de altura. O volume é $V = 1{,}5 \\cdot 1 \\cdot 0{,}8 = 1{,}2\\text{ m}^3$ e, como $1\\text{ m}^3 = 1000\\text{ L}$, ela guarda $1200$ litros. Para impermeabilizar todas as faces por fora, a área é $A = 2(1{,}5 \\cdot 1 + 1{,}5 \\cdot 0{,}8 + 1 \\cdot 0{,}8) = 2(1{,}5 + 1{,}2 + 0{,}8) = 2 \\cdot 3{,}5 = 7\\text{ m}^2$.\n\nNo cubo de aresta $\\ell$ as duas fórmulas encurtam: $V = \\ell^3$ e $A = 6\\ell^2$.",
                    },
                    {
                        type: "text",
                        value: "## Cilindro\n\nO cilindro é o prisma dos redondos: duas bases circulares de raio $r$ separadas pela altura $h$. O volume segue a mesma ideia de base vezes altura, com a base valendo $\\pi r^2$:\n\n$$V = \\pi r^2 h$$\n\nPara a superfície, imagine descolar o rótulo de uma lata: ele é um retângulo de altura $h$ e base igual ao contorno da tampa, que mede $2\\pi r$. Somando esse retângulo com as duas tampas:\n\n$$A = 2\\pi r^2 + 2\\pi r h$$\n\n**Exemplo.** Uma caixa d'água cilíndrica tem $1{,}2\\text{ m}$ de diâmetro e $0{,}9\\text{ m}$ de altura, logo $r = 0{,}6\\text{ m}$. O volume é $V = 3{,}14 \\cdot 0{,}6^2 \\cdot 0{,}9 = 3{,}14 \\cdot 0{,}36 \\cdot 0{,}9 \\approx 1{,}02\\text{ m}^3$, ou cerca de $1020$ litros. A superfície total é $A = 2 \\cdot 3{,}14 \\cdot 0{,}36 + 2 \\cdot 3{,}14 \\cdot 0{,}6 \\cdot 0{,}9 \\approx 2{,}26 + 3{,}39 = 5{,}65\\text{ m}^2$ de chapa.",
                    },
                    {
                        type: "text",
                        value: "## Pirâmide e cone: o terço que ninguém pode esquecer\n\nEnchendo de areia um cone e despejando em um cilindro de mesma base e mesma altura, são necessários exatamente três cones para encher o cilindro. O mesmo acontece com a pirâmide e o prisma de mesma base e mesma altura. Daí vem o $\\frac{1}{3}$ nas duas fórmulas:\n\n$$V = \\frac{A_b \\cdot h}{3} \\qquad V_{\\text{cone}} = \\frac{\\pi r^2 h}{3}$$\n\nA primeira fórmula serve para qualquer pirâmide, com $A_b$ sendo a área da base, e a segunda é só ela com a base circular já substituída.\n\n**Exemplo com pirâmide.** Uma pirâmide de base quadrada tem $9\\text{ m}$ de lado e $5\\text{ m}$ de altura. A base mede $A_b = 9^2 = 81\\text{ m}^2$, então $V = \\frac{81 \\cdot 5}{3} = \\frac{405}{3} = 135\\text{ m}^3$.\n\n**Exemplo com cone.** Um cone de sinalização tem raio $0{,}2\\text{ m}$ e altura $0{,}75\\text{ m}$, então $V = \\frac{3{,}14 \\cdot 0{,}2^2 \\cdot 0{,}75}{3} = \\frac{0{,}0942}{3} = 0{,}0314\\text{ m}^3$, pouco mais de $31$ litros.\n\nEsquecer o divisor $3$ é o erro mais caro desta aula, porque ele triplica o resultado de uma vez.",
                    },
                    {
                        type: "text",
                        value: "## Superfície do cone e da pirâmide\n\nA superfície desses dois sólidos é a base mais os lados inclinados, e a medida que entra no lado inclinado **não** é a altura do sólido.\n\nNo cone, o lado é a **geratriz** $g$, a distância do vértice até a borda da base. Ela é a hipotenusa de um triângulo retângulo de cateto $r$ e cateto $h$, então Pitágoras a entrega: $g = \\sqrt{r^2 + h^2}$. A superfície total é a base mais a lateral:\n\n$$A = \\pi r^2 + \\pi r g$$\n\n**Exemplo.** Em um cone de raio $6\\text{ m}$ e altura $8\\text{ m}$, a geratriz é $g = \\sqrt{6^2 + 8^2} = \\sqrt{100} = 10\\text{ m}$, e a superfície total é $A = 3{,}14 \\cdot 36 + 3{,}14 \\cdot 6 \\cdot 10 = 113{,}04 + 188{,}4 = 301{,}44\\text{ m}^2$.\n\nNa pirâmide a ideia é a mesma: a superfície é a base mais os triângulos das laterais, e a altura de cada triângulo lateral também sai de Pitágoras.\n\n**Exemplo.** Em uma pirâmide de base quadrada de $6\\text{ m}$ de lado e $4\\text{ m}$ de altura, a altura de cada face é $\\sqrt{4^2 + 3^2} = \\sqrt{25} = 5\\text{ m}$, porque o cateto horizontal é metade do lado da base. Cada uma das quatro faces tem $\\frac{6 \\cdot 5}{2} = 15\\text{ m}^2$, e com a base fica $A = 4 \\cdot 15 + 36 = 96\\text{ m}^2$.\n\nQuem usa a altura do sólido no lugar da geratriz sempre encontra uma superfície menor que a verdadeira, porque a hipotenusa é maior que qualquer cateto.",
                    },
                    {
                        type: "text",
                        value: "## Esfera\n\nA esfera não tem base nem face plana, e suas duas fórmulas se decoram juntas:\n\n$$V = \\frac{4}{3}\\pi r^3 \\qquad A = 4\\pi r^2$$\n\n**Exemplo.** Uma bola de futebol tem cerca de $22\\text{ cm}$ de diâmetro, ou seja, raio $r = 11\\text{ cm}$. O volume de ar dentro dela é $V = \\frac{4}{3} \\cdot 3{,}14 \\cdot 11^3 = \\frac{4 \\cdot 3{,}14 \\cdot 1331}{3} \\approx 5572\\text{ cm}^3$, pouco mais de $5{,}5$ litros. A superfície, que é o material usado para costurá-la, mede $A = 4 \\cdot 3{,}14 \\cdot 11^2 = 4 \\cdot 3{,}14 \\cdot 121 \\approx 1520\\text{ cm}^2$.\n\nO erro frequente é entrar com o diâmetro no lugar do raio. No volume isso multiplica o resultado por $8$, porque o raio está ao cubo, e a bola de futebol passaria a comportar quase $45$ litros de ar.",
                    },
                    {
                        type: "quote",
                        value: "Volume de prisma e de cilindro é área da base vezes altura, e de pirâmide e de cone é um terço disso, porque três cones enchem o cilindro de mesma base e mesma altura. A área da superfície soma as bases com a lateral, e na lateral inclinada quem entra é a geratriz, que vem de Pitágoras, nunca a altura do sólido.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual dos sólidos a seguir é um corpo redondo?",
                        difficulty: "facil",
                        options: [
                            { text: "o cubo", isCorrect: false },
                            { text: "a pirâmide", isCorrect: false },
                            { text: "o prisma reto", isCorrect: false },
                            { text: "o cilindro", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Uma caixa d'água cilíndrica tem raio $0{,}5\\text{ m}$ e altura $1{,}2\\text{ m}$. Usando $\\pi \\approx 3{,}14$, qual é o seu volume?",
                        difficulty: "facil",
                        options: [
                            { text: "$1{,}884\\text{ m}^3$", isCorrect: false },
                            { text: "$3{,}768\\text{ m}^3$", isCorrect: false },
                            { text: "$0{,}942\\text{ m}^3$", isCorrect: true },
                            { text: "$0{,}314\\text{ m}^3$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um cone e um cilindro têm a mesma base e a mesma altura. O volume do cone corresponde a que fração do volume do cilindro?",
                        difficulty: "medio",
                        options: [
                            { text: "$\\frac{1}{2}$", isCorrect: false },
                            { text: "$\\frac{1}{6}$", isCorrect: false },
                            { text: "$\\frac{1}{3}$", isCorrect: true },
                            { text: "$\\frac{2}{3}$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma pirâmide de base quadrada tem $10\\text{ m}$ de lado na base e $6\\text{ m}$ de altura. Qual é o seu volume?",
                        difficulty: "medio",
                        options: [
                            { text: "$600\\text{ m}^3$", isCorrect: false },
                            { text: "$200\\text{ m}^3$", isCorrect: true },
                            { text: "$60\\text{ m}^3$", isCorrect: false },
                            { text: "$100\\text{ m}^3$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um cone tem raio da base $3\\text{ m}$ e altura $4\\text{ m}$. Usando $\\pi \\approx 3{,}14$, qual é a área total da sua superfície?",
                        difficulty: "dificil",
                        options: [
                            { text: "$94{,}20\\text{ m}^2$", isCorrect: false },
                            { text: "$65{,}94\\text{ m}^2$", isCorrect: false },
                            { text: "$47{,}10\\text{ m}^2$", isCorrect: false },
                            { text: "$75{,}36\\text{ m}^2$", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Escala, velocidade média e densidade",
                blocks: [
                    {
                        type: "text",
                        value: "# Escala, velocidade média e densidade\n\nA planta do apartamento diz $1:50$. O mapa da rodovia diz $1:100\\,000$. O painel do carro marca $90\\text{ km/h}$. A embalagem do óleo diz que a densidade é $0{,}92\\text{ g/cm}^3$. São informações de naturezas bem diferentes, mas todas são razões entre duas medidas, e é a mesma ideia de proporção que resolve as três contas desta aula.",
                    },
                    {
                        type: "text",
                        value: "## Escala: a razão entre o desenho e o real\n\nNenhum apartamento cabe em uma folha, então a planta reduz tudo na mesma proporção. A **escala** é a razão entre a medida no desenho e a medida real correspondente:\n\n$$E = \\frac{\\text{medida no desenho}}{\\text{medida real}}$$\n\nEscrita na forma $1:50$, ela diz que $1$ unidade no papel vale $50$ unidades na realidade, com a mesma unidade nos dois lados. Em uma planta $1:50$, um centímetro de papel são $50$ centímetros de parede, ou seja, meio metro.\n\n**Exemplo.** Na planta $1:50$, uma parede aparece com $7\\text{ cm}$. A medida real é $7 \\cdot 50 = 350\\text{ cm} = 3{,}5\\text{ m}$.\n\n**Exemplo no sentido contrário.** A sala real tem $4{,}2\\text{ m}$, que são $420\\text{ cm}$. No papel ela vai aparecer com $420 \\div 50 = 8{,}4\\text{ cm}$.\n\nO cuidado é sempre o mesmo: passe as duas medidas para a mesma unidade antes de multiplicar ou dividir. Quem divide $4{,}2$ por $50$ sem converter para centímetro encontra $0{,}084$ e desenha uma sala de menos de um milímetro.",
                    },
                    {
                        type: "text",
                        value: "## Escala no mapa, e a escala em área\n\nNo mapa o segundo número é bem maior, porque a redução é maior. Em um mapa $1:100\\,000$, cada centímetro do papel vale $100\\,000\\text{ cm}$, que são $1000\\text{ m}$, ou seja, $1\\text{ km}$. Se duas cidades aparecem a $6{,}5\\text{ cm}$ uma da outra, a distância real é de $6{,}5\\text{ km}$.\n\nAgora o ponto que derruba muita gente. A escala vale para **comprimento**. A área não segue a mesma razão: ela segue o **quadrado** da razão. Se cada comprimento real é $50$ vezes maior que no papel, cada área real é $50^2 = 2500$ vezes maior.\n\n**Exemplo.** Na planta $1:50$, o quarto aparece como um retângulo de $6\\text{ cm}$ por $7\\text{ cm}$, com área de $42\\text{ cm}^2$ no papel. A área real é $42 \\cdot 2500 = 105\\,000\\text{ cm}^2$, e como $1\\text{ m}^2 = 10\\,000\\text{ cm}^2$, isso dá $10{,}5\\text{ m}^2$.\n\nConferindo pelo caminho longo: o quarto real mede $6 \\cdot 50 = 300\\text{ cm} = 3\\text{ m}$ por $7 \\cdot 50 = 350\\text{ cm} = 3{,}5\\text{ m}$, e $3 \\cdot 3{,}5 = 10{,}5\\text{ m}^2$. Os dois caminhos fecham. Quem multiplicou a área do papel por $50$ em vez de $2500$ encontraria $0{,}21\\text{ m}^2$, um quarto do tamanho de uma caixa de pizza.",
                    },
                    {
                        type: "text",
                        value: "## Velocidade média\n\nA **velocidade média** é a razão entre a distância percorrida e o tempo gasto para percorrê-la:\n\n$$v_m = \\frac{\\Delta s}{\\Delta t}$$\n\n**Exemplo.** Um carro faz $270\\text{ km}$ em $3$ h. Então $v_m = \\frac{270\\text{ km}}{3\\text{ h}} = 90\\text{ km/h}$. Note que a unidade do resultado nasce da própria divisão: quilômetro dividido por hora é quilômetro por hora.\n\nVelocidade média **não** é a média das velocidades do trajeto, e aqui está o porquê. Um carro percorre $100\\text{ km}$ a $100\\text{ km/h}$, gastando $1$ h, e depois outros $100\\text{ km}$ a $50\\text{ km/h}$, gastando $2$ h. A média das velocidades daria $75\\text{ km/h}$, mas a velocidade média de verdade é $v_m = \\frac{200\\text{ km}}{3\\text{ h}} \\approx 66{,}7\\text{ km/h}$.\n\nO trecho lento pesa mais porque durou mais tempo. A regra que não falha é dividir a distância total pelo tempo total.",
                    },
                    {
                        type: "text",
                        value: "## De quilômetro por hora para metro por segundo\n\nUnidade composta se converte por partes: o numerador vira numerador e o denominador vira denominador.\n\n$$1\\,\\frac{\\text{km}}{\\text{h}} = \\frac{1000\\text{ m}}{3600\\text{ s}} = \\frac{1}{3{,}6}\\,\\frac{\\text{m}}{\\text{s}}$$\n\nDaí sai a regra prática: de $\\text{km/h}$ para $\\text{m/s}$ divide por $3{,}6$, e de $\\text{m/s}$ para $\\text{km/h}$ multiplica por $3{,}6$.\n\n**Exemplo.** $72\\text{ km/h}$ equivalem a $72 \\div 3{,}6 = 20\\text{ m/s}$. No sentido inverso, o atleta que corre a $8\\text{ m/s}$ está a $8 \\cdot 3{,}6 = 28{,}8\\text{ km/h}$.\n\nO jeito de nunca errar o sentido da conta é o bom senso: o número em metro por segundo é sempre **menor** que o mesmo movimento em quilômetro por hora, porque o segundo é um pedaço curto de tempo. Quem converte $72\\text{ km/h}$ e encontra $259{,}2\\text{ m/s}$ multiplicou quando devia dividir, e isso seria mais rápido que a velocidade do som.",
                    },
                    {
                        type: "text",
                        value: "## Densidade\n\nA **densidade** é a razão entre a massa de um corpo e o volume que ele ocupa:\n\n$$d = \\frac{m}{V}$$\n\nAs unidades usuais são $\\text{g/cm}^3$ e $\\text{kg/m}^3$, e a água serve de régua: ela tem $1\\text{ g/cm}^3$, que é o mesmo que $1000\\text{ kg/m}^3$, ou ainda $1$ quilograma por litro. Material com densidade menor que a da água flutua nela, e material com densidade maior afunda.\n\n**Exemplo com a fórmula direta.** Uma peça de alumínio tem volume $200\\text{ cm}^3$ e massa $540\\text{ g}$, então $d = \\frac{540\\text{ g}}{200\\text{ cm}^3} = 2{,}7\\text{ g/cm}^3$. Por ser quase três vezes mais densa que a água, a peça afunda.\n\n**Exemplo com a fórmula invertida.** O tanque do carro leva $50$ litros de gasolina, cuja densidade é de cerca de $0{,}74\\text{ kg/L}$. A massa do combustível com o tanque cheio é $m = d \\cdot V = 0{,}74 \\cdot 50 = 37\\text{ kg}$, bem menos que os $50\\text{ kg}$ que a mesma medida de água pesaria. É por isso que a gasolina flutua sobre a água de uma poça.\n\nE é a mesma conta que explica a laje reforçada: a caixa d'água de $1000$ litros cheia carrega $1000\\text{ kg}$, uma tonelada em cima do telhado.",
                    },
                    {
                        type: "quote",
                        value: "Escala, velocidade média e densidade são a mesma ferramenta em três roupas, a razão entre duas medidas. A escala vale para comprimento e vai ao quadrado quando se trata de área, a velocidade média é a distância total dividida pelo tempo total, e unidade composta se converte parte por parte, como no $\\text{km/h}$ que vira $\\text{m/s}$ dividindo por $3{,}6$.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Em uma planta na escala $1:50$, uma parede aparece desenhada com $9\\text{ cm}$. Qual é o comprimento real dessa parede?",
                        difficulty: "facil",
                        options: [
                            { text: "$90\\text{ m}$", isCorrect: false },
                            { text: "$45\\text{ m}$", isCorrect: false },
                            { text: "$0{,}18\\text{ m}$", isCorrect: false },
                            { text: "$4{,}5\\text{ m}$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Uma velocidade de $90\\text{ km/h}$ corresponde a quantos metros por segundo?",
                        difficulty: "facil",
                        options: [
                            { text: "$25\\text{ m/s}$", isCorrect: true },
                            { text: "$324\\text{ m/s}$", isCorrect: false },
                            { text: "$2{,}5\\text{ m/s}$", isCorrect: false },
                            { text: "$9\\text{ m/s}$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um carro percorre $120\\text{ km}$ a $60\\text{ km/h}$ e, em seguida, outros $120\\text{ km}$ a $40\\text{ km/h}$. Qual é a velocidade média no percurso inteiro?",
                        difficulty: "medio",
                        options: [
                            { text: "$48\\text{ km/h}$", isCorrect: true },
                            { text: "$40\\text{ km/h}$", isCorrect: false },
                            { text: "$50\\text{ km/h}$", isCorrect: false },
                            { text: "$60\\text{ km/h}$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Na planta de um apartamento na escala $1:50$, um quarto aparece como um retângulo de $8\\text{ cm}$ por $6\\text{ cm}$. Qual é a área real desse quarto?",
                        difficulty: "medio",
                        options: [
                            { text: "$120\\text{ m}^2$", isCorrect: false },
                            { text: "$0{,}24\\text{ m}^2$", isCorrect: false },
                            { text: "$12\\text{ m}^2$", isCorrect: true },
                            { text: "$1200\\text{ m}^2$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma caixa d'água cúbica de $80\\text{ cm}$ de aresta está completamente cheia de água, cuja densidade é $1$ quilograma por litro. Qual é a massa da água guardada?",
                        difficulty: "dificil",
                        options: [
                            { text: "$2400\\text{ kg}$", isCorrect: false },
                            { text: "$0{,}512\\text{ kg}$", isCorrect: false },
                            { text: "$512\\text{ kg}$", isCorrect: true },
                            { text: "$512\\,000\\text{ kg}$", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Ler dados e resolver problemas",
        aulas: [
            {
                titulo: "Tabelas e gráficos",
                blocks: [
                    {
                        type: "text",
                        value: "# Tabelas e gráficos\n\nA conta de luz chega com um gráfico de barras dos últimos seis meses. O jornal publica uma pesquisa em setores. O extrato do banco traz uma tabela com data, descrição e valor. Dado quase nunca aparece como número solto: ele aparece organizado, e quem sabe ler a organização responde em segundos uma pergunta que, no bruto, daria trabalho. Nesta aula vamos ler os quatro formatos mais comuns, escolher o certo para cada tipo de dado e, no fim, reconhecer o gráfico montado para enganar.",
                    },
                    {
                        type: "text",
                        value: '## Tabela de dupla entrada\n\nUma **tabela de dupla entrada** cruza duas informações: uma nas linhas, outra nas colunas. Cada célula responde às duas ao mesmo tempo. A lanchonete da esquina anotou as vendas de três dias:\n\n| Produto | Segunda | Terça | Quarta | Total |\n| --- | --- | --- | --- | --- |\n| Pastel | 40 | 35 | 45 | 120 |\n| Suco | 30 | 25 | 25 | 80 |\n| Total | 70 | 60 | 70 | 200 |\n\nPara achar quantos sucos saíram na terça, cruze a linha "Suco" com a coluna "Terça": $25$. A coluna **Total** soma a linha inteira ($30 + 25 + 25 = 80$), e a linha **Total** soma a coluna inteira ($40 + 30 = 70$).\n\nO número do canto, $200$, é o total geral, e ele fecha pelos dois caminhos: $120 + 80 = 200$ somando a coluna dos totais, e $70 + 60 + 70 = 200$ somando a linha dos totais. Essa conferência dupla é a primeira coisa a fazer em qualquer tabela com totais: se os dois caminhos não dão o mesmo número, o erro está na tabela ou na sua leitura.',
                    },
                    {
                        type: "text",
                        value: '## Gráfico de barras: comparar categorias\n\nO **gráfico de barras** usa o comprimento da barra para representar a quantidade. Ele serve para comparar categorias que não têm ordem natural entre si: bairros, produtos, times, matérias.\n\nPense nas barras das vendas de pastel por dia: $40$, $35$ e $45$. A barra da quarta é a mais alta, a da terça é a mais baixa, e a diferença entre elas é de $45 - 35 = 10$ pastéis. O olho compara comprimento muito bem, e é por isso que esse gráfico responde "qual é o maior" mais rápido do que a tabela.\n\nO que o gráfico de barras não mostra bem é soma. Para saber quantos pastéis saíram nos três dias, você continua precisando somar: $40 + 35 + 45 = 120$.',
                    },
                    {
                        type: "text",
                        value: "## Gráfico de linhas: acompanhar a evolução\n\nO **gráfico de linhas** liga os pontos em sequência e mostra como uma grandeza muda ao longo do tempo. Aqui a ordem do eixo horizontal importa, porque esse eixo é o tempo: dias, meses, anos.\n\nUma oficina registrou os atendimentos por mês: janeiro $120$, fevereiro $150$, março $140$ e abril $170$. A linha sobe de janeiro para fevereiro, desce um pouco em março e volta a subir em abril. A inclinação de cada trecho conta a velocidade da mudança: de janeiro para fevereiro foram $30$ atendimentos a mais, e de março para abril foram $30$ também, então os dois trechos sobem igual.\n\nAtenção a uma troca comum: variação em quantidade não é variação em porcentagem. Os mesmos $30$ atendimentos valem $\\frac{30}{120} = 25\\%$ sobre janeiro e $\\frac{30}{140} \\approx 21\\%$ sobre março.",
                    },
                    {
                        type: "text",
                        value: '## Gráfico de setores: partes de um total\n\nO **gráfico de setores**, a tal "pizza", divide um círculo em fatias, e cada fatia é uma parte do total. Ele só faz sentido quando as partes somam o todo, ou seja, $100\\%$.\n\nUm orçamento familiar ficou assim: moradia $35\\%$, alimentação $25\\%$, transporte $15\\%$, saúde $10\\%$ e outros $15\\%$. Confira a soma antes de qualquer coisa: $35 + 25 + 15 + 10 + 15 = 100$.\n\nA volta inteira do círculo tem $360^\\circ$, então o ângulo de cada setor sai de uma regra de três:\n\n$$\\text{ângulo} = \\frac{\\text{porcentagem}}{100} \\cdot 360^\\circ$$\n\nPara moradia: $\\frac{35}{100} \\cdot 360^\\circ = 126^\\circ$. Para saúde: $\\frac{10}{100} \\cdot 360^\\circ = 36^\\circ$. O caminho de volta também é útil: um setor de $90^\\circ$ ocupa $\\frac{90}{360} = \\frac{1}{4}$ do círculo, isto é, $25\\%$ do total.',
                    },
                    {
                        type: "text",
                        value: '## Escolhendo o gráfico certo\n\nO formato errado não é só feio, ele esconde a resposta. A regra prática:\n\n| O que você quer mostrar | Formato | Exemplo |\n| --- | --- | --- |\n| comparar categorias | barras | venda por produto |\n| mudança ao longo do tempo | linhas | atendimentos por mês |\n| participação no total | setores | fatia de cada despesa |\n| valor exato de cada cruzamento | tabela | venda por produto e por dia |\n\nDois erros aparecem sempre. O primeiro é usar setores para comparar coisas que não somam um total, como a nota de quatro alunos: a pizza vai sugerir que um aluno tem "parte" da nota do outro, o que não quer dizer nada. O segundo é usar linhas em categorias sem ordem, como ligar com um traço a altura de cinco cidades: o trecho de linha entre duas cidades não representa coisa alguma.',
                    },
                    {
                        type: "text",
                        value: "## O gráfico que engana\n\nNem todo gráfico é feito para informar. Três truques são os mais comuns.\n\n**Eixo que não começa no zero.** Duas barras de $48$ e de $52$, desenhadas em um eixo que começa em $45$, aparecem com alturas $3$ e $7$. A segunda parece mais que o dobro da primeira, quando o aumento real é de $\\frac{4}{48} \\approx 8\\%$. Procure sempre onde o eixo vertical começa.\n\n**Escala quebrada ou irregular.** O eixo vai de $0$ a $10$, depois de $10$ a $100$, depois de $100$ a $1000$, sempre com a mesma distância entre as marcas. Uma subida gigantesca fica parecendo suave, e uma subida pequena fica dramática.\n\n**Setor fora de proporção.** Na pizza, a fatia de $10\\%$ é desenhada do tamanho de um quarto do círculo, ou a pizza ganha perspectiva em três dimensões e a fatia da frente cresce sem motivo. Aqui a conferência é direta: setor de $10\\%$ tem $36^\\circ$, e ângulo não se discute.\n\nQuando os números estão escritos no gráfico, use os números. O desenho é só a embalagem.",
                    },
                    {
                        type: "quote",
                        value: "Tabela guarda o valor exato, barras comparam categorias, linhas mostram a evolução no tempo e setores mostram a parte do total. Antes de acreditar no desenho, confira onde o eixo começa e se as partes somam cem por cento.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Na tabela da lanchonete, o pastel vendeu $40$, $35$ e $45$ unidades na segunda, na terça e na quarta, e o suco vendeu $30$, $25$ e $25$ nos mesmos dias. Quantos sucos foram vendidos na terça?",
                        difficulty: "facil",
                        options: [
                            { text: "$35$", isCorrect: false },
                            { text: "$60$", isCorrect: false },
                            { text: "$25$", isCorrect: true },
                            { text: "$30$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Você quer mostrar quanto cada despesa representa do orçamento total do mês. Qual formato é o mais adequado?",
                        difficulty: "facil",
                        options: [
                            { text: "Gráfico de linhas", isCorrect: false },
                            { text: "Gráfico de setores", isCorrect: true },
                            { text: "Gráfico de barras", isCorrect: false },
                            { text: "Tabela de dupla entrada", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Em um gráfico de setores, a despesa de moradia representa $35\\%$ do orçamento. Qual é o ângulo do setor que representa essa despesa?",
                        difficulty: "medio",
                        options: [
                            { text: "$35^\\circ$", isCorrect: false },
                            { text: "$63^\\circ$", isCorrect: false },
                            { text: "$234^\\circ$", isCorrect: false },
                            { text: "$126^\\circ$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Um gráfico compara duas barras, uma de $48$ e outra de $52$, em um eixo vertical que começa em $45$. No desenho, a segunda barra parece mais que o dobro da primeira. Qual é o aumento real de $48$ para $52$?",
                        difficulty: "medio",
                        options: [
                            { text: "cerca de $8\\%$", isCorrect: true },
                            { text: "cerca de $133\\%$", isCorrect: false },
                            { text: "cerca de $4\\%$", isCorrect: false },
                            { text: "cerca de $92\\%$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma pesquisa com $400$ pessoas foi publicada em um gráfico de setores. O setor de quem usa transporte público ocupa $90^\\circ$. Quantas dessas pessoas usam transporte público?",
                        difficulty: "dificil",
                        options: [
                            { text: "$133$", isCorrect: false },
                            { text: "$25$", isCorrect: false },
                            { text: "$100$", isCorrect: true },
                            { text: "$90$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Média, moda e mediana",
                blocks: [
                    {
                        type: "text",
                        value: '# Média, moda e mediana\n\nSete pessoas trabalham em uma equipe e alguém pergunta: "quanto se ganha aí?" Nenhum número responde isso sozinho, porque são sete números diferentes. O que se faz é resumir o conjunto em um único valor que o represente, e existem três resumos clássicos, cada um com uma ideia diferente de valor típico. Nesta aula vamos calcular os três, ver quando cada um representa melhor o conjunto e, principalmente, ver o caso em que a média mente com a maior cara de verdade.',
                    },
                    {
                        type: "text",
                        value: '## A média aritmética\n\nA **média aritmética** distribui o total igualmente entre todos: soma tudo e divide pela quantidade de valores.\n\n$$\\bar{x} = \\frac{x_1 + x_2 + \\dots + x_n}{n}$$\n\nAs notas de um aluno em cinco provas foram $4$, $7$, $8$, $6$ e $10$. A soma é $4 + 7 + 8 + 6 + 10 = 35$, e são $5$ provas:\n\n$$\\bar{x} = \\frac{35}{5} = 7$$\n\nA média tem uma leitura concreta: se as cinco notas fossem todas iguais, cada uma valeria $7$ e o total continuaria $35$. É por isso que ela responde bem a perguntas do tipo "quanto caberia para cada um".\n\nRepare que a média não precisa ser um dos valores da lista, e pode nem ser um número inteiro: a média de $3$ e $4$ é $3{,}5$.',
                    },
                    {
                        type: "text",
                        value: "## A moda\n\nA **moda** é o valor que mais aparece. Ela não pede conta, pede contagem.\n\nUma loja vendeu sete pares de sapato nos tamanhos $38$, $38$, $38$, $41$, $42$, $43$ e $44$. O tamanho $38$ apareceu três vezes e cada um dos outros apareceu uma só, então a moda é $38$.\n\nDois cuidados. Um conjunto pode ter **mais de uma moda**: em $2$, $2$, $5$, $7$ e $7$, tanto o $2$ quanto o $7$ aparecem duas vezes, e os dois são moda. E um conjunto pode não ter moda nenhuma, quando todos os valores aparecem o mesmo número de vezes.\n\nA moda é a única das três medidas que funciona com dado que não é número. A cor mais vendida, o bairro mais citado e o sabor mais pedido são modas, e não faria sentido tirar a média de cor.",
                    },
                    {
                        type: "text",
                        value: "## A mediana\n\nA **mediana** é o valor que fica no meio quando os dados são colocados em ordem. O passo que todo mundo esquece é justamente o primeiro: **ordenar**.\n\nCom quantidade ímpar de valores existe um do meio. Em $5$, $6$, $7$, $8$ e $9$ são cinco valores, e o terceiro é o do meio, então a mediana é $7$.\n\nCom quantidade par sobram dois no meio, e a mediana é a média desses dois. Em $9$, $11$, $12$, $15$, $18$ e $20$ são seis valores, e o terceiro e o quarto são $12$ e $15$:\n\n$$\\text{mediana} = \\frac{12 + 15}{2} = 13{,}5$$\n\nA mediana divide o conjunto em duas metades: metade dos valores fica abaixo dela, metade fica acima. É isso que a torna resistente a valor extremo, como vamos ver daqui a pouco.",
                    },
                    {
                        type: "text",
                        value: "## Média ponderada\n\nNem todo valor pesa o mesmo. Quando cada valor tem uma importância diferente, usamos a **média ponderada**: multiplicamos cada valor pelo seu **peso**, somamos tudo e dividimos pela soma dos pesos.\n\n$$\\bar{x}_p = \\frac{x_1 p_1 + x_2 p_2 + \\dots + x_n p_n}{p_1 + p_2 + \\dots + p_n}$$\n\nUma disciplina tem três notas com pesos $2$, $3$ e $5$, e o aluno tirou $4$, $6$ e $8$:\n\n$$\\bar{x}_p = \\frac{4 \\cdot 2 + 6 \\cdot 3 + 8 \\cdot 5}{2 + 3 + 5} = \\frac{8 + 18 + 40}{10} = \\frac{66}{10} = 6{,}6$$\n\nO erro clássico aqui é dividir pela quantidade de notas, $3$, em vez da soma dos pesos, $10$. E existe uma conferência boa para o resultado: a média simples das três notas seria $6$, e a ponderada deu $6{,}6$ porque a nota mais alta é justamente a de maior peso. Fazia sentido subir, e subiu.",
                    },
                    {
                        type: "text",
                        value: "## Quando a média sozinha engana\n\nVolte à equipe de sete pessoas. Seis ganham $2000$ reais e uma, a dona da empresa, ganha $30000$ reais. A média:\n\n$$\\bar{x} = \\frac{6 \\cdot 2000 + 30000}{7} = \\frac{42000}{7} = 6000$$\n\nA média é $6000$ reais e **ninguém** ganha isso. Seis das sete pessoas recebem menos de um terço da média. Um único valor muito distante dos outros, chamado de **valor extremo**, puxa a média inteira para o lado dele, porque a média passa pela soma, e a soma sente o tamanho de cada parcela.\n\nAgora a mediana. Em ordem: $2000$, $2000$, $2000$, $2000$, $2000$, $2000$ e $30000$. O quarto valor é $2000$, então a mediana é $2000$, e a moda também é $2000$. As duas descrevem essa equipe muito melhor do que a média.\n\nDaí sai uma regra de leitura: quando alguém divulga só a média, pergunte pela mediana. Se as duas são próximas, os dados estão bem distribuídos. Se a média é bem maior que a mediana, existe valor alto puxando o resumo, e a média sozinha esconde essa diferença.",
                    },
                    {
                        type: "text",
                        value: "## Qual medida usar\n\n| Situação | Medida mais indicada | Por quê |\n| --- | --- | --- |\n| dados sem valor extremo | média | usa todos os valores |\n| renda, preço de imóvel, tempo de espera | mediana | não se deixa puxar pelo extremo |\n| dado que não é número (cor, sabor, bairro) | moda | é a única que conta repetição |\n| notas ou itens com importância diferente | média ponderada | respeita o peso de cada um |\n\nNenhuma das três é a certa sempre. O que resolve é olhar o conjunto antes de escolher o resumo, e desconfiar de resumo apresentado sem o conjunto.",
                    },
                    {
                        type: "quote",
                        value: "Média distribui o total, moda conta a repetição e mediana marca o meio da fila ordenada. Quando existe valor extremo no conjunto, a média se desloca na direção dele e a mediana continua representando a maioria.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "As notas de um aluno em cinco provas foram $5$, $8$, $6$, $9$ e $7$. Qual é a média aritmética dessas notas?",
                        difficulty: "facil",
                        options: [
                            { text: "$7$", isCorrect: true },
                            { text: "$8{,}75$", isCorrect: false },
                            { text: "$6$", isCorrect: false },
                            { text: "$35$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma loja vendeu sete pares de sapato nos tamanhos $37$, $37$, $37$, $40$, $41$, $42$ e $43$. Qual é a moda desses tamanhos?",
                        difficulty: "facil",
                        options: [
                            { text: "$40$", isCorrect: false },
                            { text: "$3$", isCorrect: false },
                            { text: "$43$", isCorrect: false },
                            { text: "$37$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "O tempo de espera de seis clientes, em minutos, foi $8$, $10$, $12$, $14$, $30$ e $36$. Qual é a mediana desses tempos?",
                        difficulty: "medio",
                        options: [
                            { text: "$14$", isCorrect: false },
                            { text: "$13$", isCorrect: true },
                            { text: "$12$", isCorrect: false },
                            { text: "$18{,}3$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Em uma disciplina, as notas $10$, $5$ e $6$ têm pesos $1$, $3$ e $6$, nessa ordem. Qual é a média ponderada do aluno?",
                        difficulty: "medio",
                        options: [
                            { text: "$8{,}1$", isCorrect: false },
                            { text: "$61$", isCorrect: false },
                            { text: "$6{,}1$", isCorrect: true },
                            { text: "$7$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Em uma equipe de sete pessoas, seis ganham $2000$ reais e uma ganha $23000$ reais. A média e a mediana dos salários valem, respectivamente:",
                        difficulty: "dificil",
                        options: [
                            { text: "$2000$ e $5000$", isCorrect: false },
                            { text: "$5833$ e $2000$", isCorrect: false },
                            { text: "$5000$ e $2000$", isCorrect: true },
                            { text: "$5000$ e $5000$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Noção de chance",
                blocks: [
                    {
                        type: "text",
                        value: '# Noção de chance\n\n"Qual é a chance de dar certo?" A pergunta aparece no sorteio da escola, no dado do jogo de tabuleiro, na previsão de chuva e na promoção que diz "um em cada dez ganha". Quando todos os resultados possíveis têm a mesma chance de acontecer, responder isso é só contagem: conte quantos resultados existem, conte quantos deles servem e compare os dois números. Nesta aula vamos montar essa comparação, escrevê-la como fração e como porcentagem, e ver o erro de soma que derruba quase todo mundo.',
                    },
                    {
                        type: "text",
                        value: '## Contando os casos\n\nComece listando o que pode acontecer. O conjunto de todos os resultados possíveis é o **espaço amostral**, e o tamanho dele é o número de **casos possíveis**.\n\nJogando um dado comum, os resultados são $1$, $2$, $3$, $4$, $5$ e $6$: são $6$ casos possíveis. Jogando uma moeda, são $2$. Sorteando uma bola de uma sacola com $3$ bolas azuis e $5$ vermelhas, são $3 + 5 = 8$ casos possíveis, porque cada bola é um resultado, mesmo que duas bolas tenham a mesma cor.\n\nDepois escolha o que você quer que aconteça, o **evento**, e conte quantos casos realizam esse evento: são os **casos favoráveis**. No dado, o evento "sair número par" tem como favoráveis o $2$, o $4$ e o $6$, ou seja, $3$ casos.\n\nA contagem dos favoráveis é onde quase todo erro nasce. Enquanto o conjunto for pequeno, vale escrever a lista por extenso em vez de contar de cabeça.',
                    },
                    {
                        type: "text",
                        value: "## A probabilidade como fração\n\nCom as duas contagens na mão, a **probabilidade** do evento é a fração dos favoráveis sobre os possíveis:\n\n$$P = \\frac{\\text{casos favoráveis}}{\\text{casos possíveis}}$$\n\nIsso vale quando todos os casos possíveis têm a mesma chance, o que acontece em dado honesto, moeda honesta e sorteio bem feito.\n\nNo dado, a probabilidade de sair número par é\n\n$$P = \\frac{3}{6} = \\frac{1}{2}$$\n\nNa sacola de $3$ azuis e $5$ vermelhas, a probabilidade de tirar azul é $P = \\frac{3}{8}$. Repare no denominador: ele é o total de bolas, $8$, e não o número de vermelhas. Comparar azuis com vermelhas, $3$ para $5$, é razão entre as partes, e não probabilidade.",
                    },
                    {
                        type: "text",
                        value: '## Sempre entre zero e um\n\nOs favoráveis são parte dos possíveis, então a fração nunca passa de $1$ e nunca fica negativa:\n\n$$0 \\le P \\le 1$$\n\nO evento impossível tem $P = 0$, como tirar $7$ em um dado de seis faces. O evento certo tem $P = 1$, como tirar um número menor que $7$ nesse mesmo dado. Qualquer resposta fora desse intervalo é erro de conta, e essa é uma conferência de um segundo.\n\nAs probabilidades de todos os resultados possíveis somam $1$. Daí sai o **evento complementar**, que é o "não acontecer":\n\n$$P(\\text{não } A) = 1 - P(A)$$\n\nSe a chance de tirar azul é $\\frac{3}{8}$, a chance de não tirar azul é $1 - \\frac{3}{8} = \\frac{5}{8}$, o que confere com as $5$ bolas vermelhas. Quando contar o que você quer dá trabalho, conte o contrário e subtraia de $1$.',
                    },
                    {
                        type: "text",
                        value: "## A chance em porcentagem\n\nFração, decimal e porcentagem são a mesma informação em três roupas. Para passar a probabilidade para porcentagem, divida a fração e multiplique por $100$:\n\n$$\\frac{3}{8} = 0{,}375 = 37{,}5\\%$$\n\nAssim, $P = \\frac{1}{2}$ é $50\\%$, $P = \\frac{1}{4}$ é $25\\%$ e $P = \\frac{1}{3} \\approx 0{,}333$ é cerca de $33{,}3\\%$.\n\nO caminho de volta é dividir por $100$: uma chance de $20\\%$ é $0{,}2$, que é $\\frac{1}{5}$, ou seja, uma em cinco. E cuidado com a casa da vírgula: $\\frac{3}{8}$ é $37{,}5\\%$, e não $3{,}75\\%$. A estimativa confere isso na hora, porque $\\frac{3}{8}$ é um pouco menos que a metade, então a porcentagem tem que ficar um pouco abaixo de $50\\%$.",
                    },
                    {
                        type: "text",
                        value: '## Somando chances: quando pode e quando não pode\n\nDois eventos são **exclusivos** quando não podem acontecer juntos. Nesse caso, a chance de um ou de outro é a soma das chances. No dado, "sair $2$" e "sair $5$" não acontecem na mesma jogada, então\n\n$$P = \\frac{1}{6} + \\frac{1}{6} = \\frac{2}{6} = \\frac{1}{3}$$\n\nAgora o erro. No mesmo dado, qual é a chance de sair par **ou** múltiplo de $3$? Muita gente soma: os pares são $\\frac{3}{6}$, os múltiplos de $3$ são $\\frac{2}{6}$, que são o $3$ e o $6$, e a soma daria $\\frac{5}{6}$. Está errado, e a lista mostra por quê. Os favoráveis são $2$, $4$ e $6$ pelos pares, mais $3$ e $6$ pelos múltiplos de $3$. Juntando sem repetir: $2$, $3$, $4$ e $6$, ou seja, $4$ casos.\n\n$$P = \\frac{4}{6} = \\frac{2}{3}$$\n\nO $6$ é par **e** múltiplo de $3$, e a soma contou ele duas vezes. A regra: só some probabilidades quando os eventos não tiverem nenhum caso em comum. Na dúvida, liste os favoráveis e junte sem repetir.',
                    },
                    {
                        type: "quote",
                        value: "Probabilidade é a fração dos casos favoráveis sobre os casos possíveis, fica sempre entre zero e um e pode ser escrita em porcentagem. Somar chances só vale para eventos que não podem acontecer juntos.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Jogando um dado comum de seis faces, qual é a probabilidade de sair um número maior que $4$?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{1}{2}$", isCorrect: false },
                            { text: "$\\frac{1}{6}$", isCorrect: false },
                            { text: "$\\frac{2}{3}$", isCorrect: false },
                            { text: "$\\frac{1}{3}$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Uma sacola tem $3$ bolas azuis e $5$ bolas vermelhas. Sorteando uma bola, qual é a probabilidade de ela ser vermelha?",
                        difficulty: "facil",
                        options: [
                            { text: "$\\frac{5}{3}$", isCorrect: false },
                            { text: "$\\frac{3}{8}$", isCorrect: false },
                            { text: "$\\frac{1}{5}$", isCorrect: false },
                            { text: "$\\frac{5}{8}$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "A probabilidade de um evento é $\\frac{3}{8}$. Em porcentagem, essa chance corresponde a:",
                        difficulty: "medio",
                        options: [
                            { text: "$3{,}75\\%$", isCorrect: false },
                            { text: "$38\\%$", isCorrect: false },
                            { text: "$37{,}5\\%$", isCorrect: true },
                            { text: "$62{,}5\\%$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Em uma turma de $25$ alunos, $10$ usam óculos. Sorteando um aluno dessa turma, qual é a chance de ele não usar óculos?",
                        difficulty: "medio",
                        options: [
                            { text: "$25\\%$", isCorrect: false },
                            { text: "$40\\%$", isCorrect: false },
                            { text: "$15\\%$", isCorrect: false },
                            { text: "$60\\%$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Jogando um dado comum de seis faces, qual é a probabilidade de sair um número par ou múltiplo de $3$?",
                        difficulty: "dificil",
                        options: [
                            { text: "$\\frac{5}{6}$", isCorrect: false },
                            { text: "$\\frac{2}{3}$", isCorrect: true },
                            { text: "$\\frac{1}{3}$", isCorrect: false },
                            { text: "$\\frac{1}{2}$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Problemas de várias etapas",
                blocks: [
                    {
                        type: "text",
                        value: "# Problemas de várias etapas\n\nO problema difícil quase nunca é difícil por causa da conta. Ele é difícil porque tem três contas dentro, uma depende da outra, e o enunciado conta tudo de uma vez em cinco linhas de texto. Quem tenta resolver de cabeça se perde no meio e responde um número que apareceu no caminho. Nesta aula vamos usar um método chato e eficiente: separar o que o problema dá do que ele pede, resolver por etapas e dar nome a cada resultado parcial.",
                    },
                    {
                        type: "text",
                        value: "## O método em quatro movimentos\n\n**1. Escreva o que o problema dá.** Uma linha por informação, com a unidade ao lado. Número sem unidade é meio caminho andado para o erro.\n\n**2. Escreva o que ele pede.** Em uma frase, já com a unidade da resposta: quantos litros, quantos reais, quantos minutos.\n\n**3. Quebre em etapas e dê nome a cada resultado parcial.** Área, volume, preço cheio, preço com desconto. Nome curto, sempre a mesma palavra, para não confundir dois números parecidos.\n\n**4. Confira se a última etapa responde a pergunta.** É aqui que o aluno descobre que calculou tudo certo e parou uma etapa antes do fim.\n\nEsse método não deixa o problema mais rápido. Ele deixa o problema **conferível**, porque cada etapa fica escrita e você consegue voltar e achar onde o número errado entrou.",
                    },
                    {
                        type: "text",
                        value: "## Porcentagem com área\n\n*Uma sala retangular mede $6$ m por $4$ m. O piso custa $50$ reais o metro quadrado, e o pedreiro pede $10\\%$ a mais de material para cobrir as perdas no corte. A loja dá $15\\%$ de desconto no pagamento à vista. Quanto se paga pelo piso?*\n\n**Dados:** sala de $6$ m por $4$ m; preço de $50$ reais por metro quadrado; perda de $10\\%$; desconto de $15\\%$.\n\n**Pede:** o valor pago, em reais.\n\n**Etapa 1, área da sala.** $A = 6 \\cdot 4 = 24$ metros quadrados.\n\n**Etapa 2, área a comprar.** São $10\\%$ a mais: $24 \\cdot 1{,}10 = 26{,}4$ metros quadrados.\n\n**Etapa 3, preço cheio.** $26{,}4 \\cdot 50 = 1320$ reais.\n\n**Etapa 4, preço com desconto.** Pagar com $15\\%$ de desconto é pagar $85\\%$: $1320 \\cdot 0{,}85 = 1122$ reais.\n\nResposta: paga-se $1122$ reais pelo piso. Quatro números apareceram no caminho, $24$, $26{,}4$, $1320$ e $1122$, e só o último responde a pergunta. Com as etapas nomeadas, não dá para entregar o $1320$ por engano.",
                    },
                    {
                        type: "text",
                        value: "## Proporção com volume\n\n*Uma caixa d'água tem $1{,}2$ m de comprimento, $1$ m de largura e $0{,}8$ m de altura. Uma torneira enche $8$ litros por minuto. Partindo da caixa vazia, em quanto tempo ela fica cheia?*\n\n**Dados:** caixa de $1{,}2$ m por $1$ m por $0{,}8$ m; vazão de $8$ litros por minuto.\n\n**Pede:** o tempo, em horas.\n\n**Etapa 1, volume em metros cúbicos.** $V = 1{,}2 \\cdot 1 \\cdot 0{,}8 = 0{,}96$ metro cúbico.\n\n**Etapa 2, volume em litros.** Cada metro cúbico tem $1000$ litros: $0{,}96 \\cdot 1000 = 960$ litros.\n\n**Etapa 3, tempo em minutos.** A proporção é direta, a $8$ litros por minuto: $\\frac{960}{8} = 120$ minutos.\n\n**Etapa 4, tempo em horas.** $\\frac{120}{60} = 2$ horas.\n\nA etapa 2 é a que mais some. Quem pula a conversão divide $0{,}96$ por $8$ e responde $0{,}12$, um número sem sentido para tempo de enchimento. Grandezas em unidades diferentes não se dividem: antes da divisão, os dois números têm que falar a mesma língua.",
                    },
                    {
                        type: "text",
                        value: "## Equação com medida\n\n*Um terreno retangular tem $46$ m de perímetro, e o comprimento tem $5$ m mais que a largura. Qual é a área do terreno?*\n\n**Dados:** perímetro de $46$ m; comprimento igual à largura mais $5$ m.\n\n**Pede:** a área, em metros quadrados.\n\n**Etapa 1, nomear a incógnita.** Seja $x$ a largura, em metros. O comprimento é $x + 5$.\n\n**Etapa 2, montar a equação.** O perímetro do retângulo é duas larguras mais dois comprimentos:\n\n$$2x + 2(x + 5) = 46$$\n\n**Etapa 3, resolver.** $2x + 2x + 10 = 46$, então $4x = 36$ e $x = 9$.\n\n**Etapa 4, voltar para as medidas.** Largura de $9$ m e comprimento de $9 + 5 = 14$ m. Confira no enunciado: $2 \\cdot 9 + 2 \\cdot 14 = 18 + 28 = 46$, o perímetro bate.\n\n**Etapa 5, responder o que foi pedido.** $A = 9 \\cdot 14 = 126$ metros quadrados.\n\nResolver a equação deu $x = 9$, e $9$ não é a resposta: é a largura. A pergunta era a área.",
                    },
                    {
                        type: "text",
                        value: '## O erro de responder a etapa, e não a pergunta\n\nNos três problemas acima, o número errado mais tentador foi sempre um resultado parcial correto: $1320$ em vez de $1122$, $960$ em vez de $2$, $9$ em vez de $126$. Isso não é falta de conta, é falta de leitura.\n\nDois hábitos resolvem. O primeiro é escrever a pergunta, com a unidade, antes de começar a calcular, e deixar essa linha visível ao lado das etapas. O segundo é terminar a resolução com a resposta em uma frase completa: "paga-se $1122$ reais pelo piso", "a caixa enche em $2$ horas", "a área é de $126$ metros quadrados". Frase completa não deixa passar resposta que não responde.\n\nE guarde os parciais. Quando o resultado final sai estranho, é neles que você acha o erro, sem precisar refazer o problema inteiro.',
                    },
                    {
                        type: "quote",
                        value: "Problema de várias etapas se resolve escrevendo o que o enunciado dá, o que ele pede e cada resultado parcial com nome. O último número da conta só é a resposta se ele responder exatamente a pergunta, na unidade pedida.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Uma parede de $3$ m por $2{,}5$ m vai ser pintada, e cada litro de tinta cobre $5$ metros quadrados. Quantos litros de tinta são necessários?",
                        difficulty: "facil",
                        options: [
                            { text: "$37{,}5$", isCorrect: false },
                            { text: "$3$", isCorrect: false },
                            { text: "$1{,}5$", isCorrect: true },
                            { text: "$7{,}5$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma caixa com volume de $0{,}5$ metro cúbico está sendo enchida por uma torneira que dá $10$ litros por minuto. Em quantos minutos a caixa fica cheia?",
                        difficulty: "facil",
                        options: [
                            { text: "$0{,}05$", isCorrect: false },
                            { text: "$500$", isCorrect: false },
                            { text: "$50$", isCorrect: true },
                            { text: "$5$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um piso de $5$ m por $4$ m será comprado com $10\\%$ a mais de material para cobrir as perdas, a $70$ reais o metro quadrado. Quanto custa o material, em reais?",
                        difficulty: "medio",
                        options: [
                            { text: "$1694$", isCorrect: false },
                            { text: "$1400$", isCorrect: false },
                            { text: "$1540$", isCorrect: true },
                            { text: "$22$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Um retângulo tem $36$ m de perímetro, e o comprimento é o dobro da largura. Qual é a área desse retângulo, em metros quadrados?",
                        difficulty: "medio",
                        options: [
                            { text: "$18$", isCorrect: false },
                            { text: "$12$", isCorrect: false },
                            { text: "$6$", isCorrect: false },
                            { text: "$72$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Uma piscina mede $8$ m por $4$ m por $1{,}5$ m de profundidade e está com $60\\%$ da capacidade. Uma bomba retira $200$ litros por minuto. Em quantos minutos a piscina fica vazia?",
                        difficulty: "dificil",
                        options: [
                            { text: "$96$", isCorrect: false },
                            { text: "$144$", isCorrect: true },
                            { text: "$28800$", isCorrect: false },
                            { text: "$240$", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Conferindo o resultado",
                blocks: [
                    {
                        type: "text",
                        value: "# Conferindo o resultado\n\nToda resposta errada em prova teve uma chance de ser pega antes da entrega. Não por refazer a conta inteira, que leva o mesmo tempo e tende a repetir o mesmo erro, mas por quatro conferências rápidas que atacam o resultado por fora: a estimativa, a unidade, a ordem de grandeza e o caso extremo. Depois delas vem a mais barata de todas, que é reler o enunciado. Nesta aula isso vira rotina, porque conferir não é opcional, é a última etapa da conta.",
                    },
                    {
                        type: "text",
                        value: "## Estimar antes de calcular\n\nAntes da conta exata, faça a conta redonda de cabeça. Ela não dá a resposta, dá a **faixa** em que a resposta tem que cair.\n\nPara $198 \\times 51$, arredonde: $200 \\times 50 = 10\\,000$. O resultado exato é $10\\,098$, e a estimativa já garantiu que a resposta tem cinco algarismos e começa com $1$. Se a sua conta deu $1009{,}8$ ou $100\\,980$, o erro é de casa decimal, e você acabou de achá-lo sem refazer nada.\n\nA estimativa serve igualmente para divisão: $\\frac{7320}{39}$ é aproximadamente $\\frac{7200}{40} = 180$. Qualquer resposta longe de $180$ está errada.\n\nUm refinamento útil: arredonde os dois números **para o mesmo lado** quando quiser um limite claro. Arredondando os dois fatores para cima, o produto estimado fica acima do verdadeiro, e você ganha um teto para comparar.",
                    },
                    {
                        type: "text",
                        value: "## Conferir a unidade\n\nA unidade da resposta tem que ser a unidade da pergunta, e essa conferência pega erro que o número sozinho esconde.\n\nComprimento vem em metro, área em metro quadrado, volume em metro cúbico. Se a pergunta pede área e a sua conta terminou em metro, faltou uma multiplicação. Se pede volume e o resultado saiu em metro quadrado, falta um fator de comprimento.\n\nAs conversões por potência de dez são as que mais derrubam: $1$ metro cúbico tem $1000$ litros, $1$ metro quadrado tem $10\\,000$ centímetros quadrados, $1$ hora tem $3600$ segundos. Então $0{,}96$ metro cúbico é $960$ litros, e não $96$.\n\nUma regra prática fecha a aula sobre unidade: antes de somar, subtrair ou dividir dois números, confira se eles estão na mesma unidade. Litro com metro cúbico, minuto com hora e quilômetro com metro não se juntam direto, e é dessa mistura que nasce o resultado errado por um fator de $1000$.",
                    },
                    {
                        type: "text",
                        value: "## Ordem de grandeza\n\nA **ordem de grandeza** é a potência de dez mais próxima do número, e serve para julgar se a resposta é plausível no mundo real. A altura de uma pessoa é da ordem de $10^0$ metro, a massa de uma pessoa é da ordem de $10^2$ quilogramas, a população de uma cidade média é da ordem de $10^5$ habitantes.\n\nPara achar a ordem, escreva o número em notação científica e olhe o expoente: $240$ mil habitantes é $2{,}4 \\cdot 10^5$, de ordem $10^5$.\n\nA conferência funciona assim: se você calculou a massa de uma pessoa e deu $700$ quilogramas, a ordem saiu $10^3$ no lugar de $10^2$, e existe um fator $10$ sobrando em algum lugar da conta. Se o preço de um almoço deu $3$ reais ou $3000$ reais, a ordem denuncia o erro antes de qualquer revisão linha a linha.\n\nEssa conferência só funciona com referências na cabeça, e vale guardar algumas: um prédio residencial tem dezenas de metros de altura, uma cidade grande tem milhões de habitantes, um ano tem cerca de $3 \\cdot 10^7$ segundos.",
                    },
                    {
                        type: "text",
                        value: "## Testar um caso extremo\n\nQuando a dúvida é no **raciocínio**, e não na conta, troque os números do problema por valores extremos e veja se a sua regra continua de pé. Zero, cem por cento e um valor enorme são os três melhores testes.\n\nUm aluno diz que dois descontos sucessivos, de $20\\%$ e de $30\\%$, equivalem a um desconto único de $50\\%$. Teste no extremo: dois descontos sucessivos de $100\\%$ e $100\\%$ dariam $200\\%$ de desconto, isto é, a loja pagaria duas vezes para você levar o produto. Absurdo, então somar desconto está errado. Do jeito certo, paga-se $0{,}80 \\cdot 0{,}70 = 0{,}56$ do preço, ou seja, $56\\%$, e o desconto único equivalente é de $44\\%$.\n\nOutro exemplo: a regra que você montou para tempo de enchimento tem que dar $0$ para uma caixa já cheia, e tem que dar tempo cada vez maior conforme a vazão diminui. Se a sua expressão dá tempo **menor** com vazão menor, ela está invertida.\n\nO caso extremo não prova que a sua regra está certa. Ele prova, com uma conta de cabeça, quando ela está errada.",
                    },
                    {
                        type: "text",
                        value: "## Reler o enunciado\n\nA última conferência é ler a pergunta de novo, já com a resposta na mão, e perguntar: isso responde aquilo?\n\nAs trocas que mais aparecem:\n\n| O enunciado pede | E a resposta entregue é | Como pegar |\n| --- | --- | --- |\n| a área | o lado ou o perímetro | confira a unidade |\n| o valor com desconto | o valor cheio | é o parcial de uma etapa antes |\n| quantos faltam | quantos já tem | releia o verbo da pergunta |\n| o valor por pessoa | o total do grupo | divida pelo número de pessoas |\n| o aumento | o valor final | o aumento é só a diferença |\n\nRepare que nenhuma dessas é erro de conta. São respostas corretas para perguntas que não foram feitas, e é por isso que refazer a conta não as encontra: só a releitura encontra.",
                    },
                    {
                        type: "text",
                        value: "## O que você passa a conseguir fazer\n\nEste é o fim da trilha, e vale olhar o caminho. Você organizou os números e a ordem das operações, entendeu fração e decimal como duas formas da mesma ideia, calculou porcentagem e proporção, dominou potência, raiz e notação científica, traduziu problema em equação e inequação, estudou as figuras planas e seus ângulos, mediu perímetro, área e volume, e nesta reta final aprendeu a ler dado, resumir um conjunto, estimar uma chance e conferir a própria resposta.\n\nNa prática, isso é o que permite conferir um reajuste de aluguel, comparar duas embalagens pelo preço do quilo, calcular quanto piso comprar para um quarto, entender uma pesquisa divulgada no jornal e desconfiar de um gráfico desenhado para impressionar. É também a base que sustenta qualquer assunto mais avançado, porque toda matemática que vem depois supõe exatamente estas contas resolvidas sem hesitação.\n\nSe algum módulo ficou nebuloso, voltar nele agora custa pouco e rende muito. Base elementar não é o que se aprende rápido, é o que se usa para sempre.",
                    },
                    {
                        type: "quote",
                        value: "Conferir é a última etapa da conta: estimativa para saber a faixa, unidade para saber o tipo de resposta, ordem de grandeza para saber o tamanho, caso extremo para testar o raciocínio e uma releitura do enunciado para garantir que a sua resposta responde o que foi perguntado.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a melhor estimativa rápida para o produto $198 \\times 51$?",
                        difficulty: "facil",
                        options: [
                            { text: "$10\\,000$", isCorrect: true },
                            { text: "$5\\,000$", isCorrect: false },
                            { text: "$1\\,000$", isCorrect: false },
                            { text: "$100\\,000$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma caixa tem volume de $0{,}75$ metro cúbico. Em litros, esse volume é:",
                        difficulty: "facil",
                        options: [
                            { text: "$7500$", isCorrect: false },
                            { text: "$0{,}75$", isCorrect: false },
                            { text: "$75$", isCorrect: false },
                            { text: "$750$", isCorrect: true },
                        ],
                    },
                    {
                        statement:
                            "Uma loja anuncia dois descontos sucessivos, de $20\\%$ e depois de $30\\%$. Esses dois descontos juntos equivalem a um desconto único de:",
                        difficulty: "medio",
                        options: [
                            { text: "$50\\%$", isCorrect: false },
                            { text: "$44\\%$", isCorrect: true },
                            { text: "$56\\%$", isCorrect: false },
                            { text: "$10\\%$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma cidade tem $240$ mil habitantes. Qual é a ordem de grandeza desse número de habitantes?",
                        difficulty: "medio",
                        options: [
                            { text: "$10^4$", isCorrect: false },
                            { text: "$10^5$", isCorrect: true },
                            { text: "$10^6$", isCorrect: false },
                            { text: "$10^3$", isCorrect: false },
                        ],
                    },
                    {
                        statement:
                            "Uma turma tem $40$ alunos. Na segunda-feira, $25\\%$ faltaram e, entre os alunos presentes, $20\\%$ esqueceram o material. Qual é o número de alunos presentes que estavam com o material?",
                        difficulty: "dificil",
                        options: [
                            { text: "$30$", isCorrect: false },
                            { text: "$32$", isCorrect: false },
                            { text: "$24$", isCorrect: true },
                            { text: "$6$", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
] as unknown as Modulo[];

async function seed() {
    mesclarSolucoes(MODULOS, "matematica-basica");
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
