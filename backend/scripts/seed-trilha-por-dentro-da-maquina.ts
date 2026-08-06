// Seed da trilha Por Dentro da Máquina, estagio 3 do roadmap.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-por-dentro-da-maquina.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Por Dentro da Máquina";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Como o computador funciona de verdade: da representação binária e ponto flutuante aos bits na prática, a CPU por dentro, a hierarquia de memória com stack, heap e cache, o caminho do código fonte ao binário e a arte de medir desempenho sem se enganar.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Representação de dados",
    aulas: [
        {
            titulo: "Binário e hexadecimal",
            blocks: [
                {
                    type: "text",
                    value: "# Duas bases, uma linguagem\n\nTodo número do seu dia a dia está em base 10: dez símbolos, e cada posição vale dez vezes a anterior. O computador não tem dez dedos: tem transistores, e um transistor distingue com segurança apenas dois estados elétricos, ligado e desligado. Por isso a máquina conta em base 2: dois símbolos, 0 e 1, e cada posição vale o dobro da anterior.\n\nO binário 1101 se lê da direita pra esquerda com pesos 1, 2, 4 e 8: há um 1 no peso 1, zero no peso 2, um no peso 4 e um no peso 8. Somando, 8 + 4 + 0 + 1 = 13. Oito bits juntos formam um byte e cobrem de 0 a 255.\n\nO problema do binário é humano: ler 32 zeros e uns é tortura. A solução é a base 16, o hexadecimal: dígitos de 0 a 9 e letras A a F valendo 10 a 15. Como 16 é exatamente 2 elevado a 4, UM dígito hex resume QUATRO bits, sem resto e sem ambiguidade. O prefixo 0x avisa a base: 0xFF é 255, não uma variação de 99. É por isso que endereços de memória, cores e dumps aparecem sempre em hex.",
                },
                {
                    type: "table",
                    value: '[["Decimal","Binário (4 bits)","Hexadecimal"],["0","0000","0x0"],["5","0101","0x5"],["9","1001","0x9"],["10","1010","0xA"],["13","1101","0xD"],["15","1111","0xF"],["255","1111 1111","0xFF"]]',
                },
                {
                    type: "text",
                    value: "## Conversão sem sofrimento\n\nDe binário pra decimal, some os pesos das posições ligadas. De decimal pra binário, divida por 2 anotando os restos e leia de baixo pra cima: 13 dividido por 2 dá 6 resto 1, depois 3 resto 0, depois 1 resto 1, depois 0 resto 1; lendo os restos de volta, 1101.\n\nEntre binário e hex ninguém faz conta de verdade: quebra-se o número em grupos de 4 bits, os nibbles, e traduz grupo a grupo. O byte 1101 1110 vira 0xDE, porque 1101 é D e 1110 é E. No sentido inverso, 0x4A abre em 0100 1010. Essa tradução mecânica é o que faz do hex o atalho oficial do binário: compacto pra escrever, trivial pra expandir.\n\nVocê vai topar com hex em todo canto: um endereço de memória como 0x7ffee2c0, a cor CSS FF6600 (vermelho 255, verde 102, azul 0), a saída do hexdump, o MAC da placa de rede. Em todos eles, cada par de dígitos hex é exatamente um byte. Quando vir dois dígitos, pense em um byte; quando vir oito, pense em 32 bits. Esse reflexo vale pela trilha inteira.",
                },
                {
                    type: "code",
                    value: '#include <stdio.h>\n\nint main(void) {\n    int x = 0b1101;          // 13 escrito em binário\n    printf("%d\\n", x);       // 13\n    printf("%X\\n", 255);     // FF: o mesmo valor em hexadecimal\n    printf("%d\\n", 0xFF);    // 255: hex de volta pra decimal\n    printf("%d\\n", 0xDE);    // 222, que em binário é 1101 1110\n    return 0;\n}',
                },
                {
                    type: "quote",
                    value: "Hexadecimal existe pra você, não pra máquina: o processador só enxerga bits; o hex é o binário dobrado de quatro em quatro, compacto o bastante pra caber no seu olho.",
                },
            ],
            questions: [
                {
                    statement: "Por que um dígito hexadecimal resume exatamente quatro bits?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Porque 16 é 2 elevado a 4, então a tradução é exata",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o padrão hexadecimal foi criado junto com o byte",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os processadores fazem contas nativamente em base 16",
                            isCorrect: false,
                        },
                        {
                            text: "Porque cada dígito hex comprime oito bits num só símbolo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o prefixo 0x indica num literal como 0xFF?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Que o número está escrito em base hexadecimal",
                            isCorrect: true,
                        },
                        {
                            text: "Que o número é negativo em complemento de dois",
                            isCorrect: false,
                        },
                        {
                            text: "Que o valor deve ocupar exatamente dois bytes",
                            isCorrect: false,
                        },
                        {
                            text: "Que o número está escrito em notação octal antiga",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quanto vale o binário 1010 em decimal e em hexadecimal?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Vale 10 em decimal e 0xA em notação hexadecimal",
                            isCorrect: true,
                        },
                        {
                            text: "Vale 12 em decimal e 0xC em notação hexadecimal",
                            isCorrect: false,
                        },
                        {
                            text: "Vale 10 em decimal e 0x10 em notação hexadecimal",
                            isCorrect: false,
                        },
                        {
                            text: "Vale 8 em decimal e 0x8 em notação hexadecimal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que os circuitos digitais contam em base 2 e não em base 10?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dois estados elétricos se distinguem bem mesmo com ruído",
                            isCorrect: true,
                        },
                        {
                            text: "Porque números binários ocupam menos espaço físico no chip",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a base 10 gastaria dez vezes mais energia por dígito",
                            isCorrect: false,
                        },
                        {
                            text: "Porque transistores nascem sempre aos pares dentro do chip",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num dump aparece o byte E6. Como conferir de cabeça que é 1110 0110?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Traduzindo nibble a nibble: E é 1110 e 6 é 0110",
                            isCorrect: true,
                        },
                        {
                            text: "Somando os dígitos E e 6 e convertendo a soma pra binário",
                            isCorrect: false,
                        },
                        {
                            text: "Convertendo E6 pra decimal e dividindo o resultado por 2",
                            isCorrect: false,
                        },
                        {
                            text: "Invertendo os bits de E6 e lendo o complemento de dois",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Inteiros com e sem sinal",
            blocks: [
                {
                    type: "text",
                    value: "# Inteiros: o contrato dos n bits\n\nCom n bits você representa exatamente 2 elevado a n combinações; o que muda entre os tipos é o CONTRATO de leitura. Sem sinal, as combinações contam de 0 até 2 elevado a n menos 1: um uint8_t vai de 0 a 255, um uint32_t chega a 4.294.967.295.\n\nCom sinal, praticamente todo hardware em uso adota o complemento de dois: o bit mais alto entra na soma com peso NEGATIVO. Num int8_t, os pesos são -128, 64, 32, 16, 8, 4, 2 e 1. Assim, 1111 1111 vale -128 mais 127, ou seja, -1, e a faixa fica assimétrica: -128 a 127, porque o zero mora do lado positivo.\n\nA genialidade do complemento de dois está no hardware: soma e subtração usam O MESMO circuito dos números sem sinal, sem caso especial. Pra negar um número, inverta todos os bits e some 1: o 5 é 0000 0101, invertido dá 1111 1010, somando 1 fica 1111 1011, que é -5. A CPU faz isso o tempo todo; o seu trabalho é conhecer a faixa de cada tipo e respeitar o contrato que ele assina.",
                },
                {
                    type: "table",
                    value: '[["Tipo","Bits","Faixa"],["uint8_t","8","0 a 255"],["int8_t","8","-128 a 127"],["uint16_t","16","0 a 65.535"],["int16_t","16","-32.768 a 32.767"],["uint32_t","32","0 a 4.294.967.295"],["int32_t","32","-2.147.483.648 a 2.147.483.647"],["int64_t","64","cerca de -9,2 quintilhões a 9,2 quintilhões"]]',
                },
                {
                    type: "text",
                    value: "## Overflow: dois mundos diferentes\n\nEstourar a faixa tem duas caras. Sem sinal, o comportamento é DEFINIDO: a conta é feita módulo 2 elevado a n. Um uint8_t com 255 recebe mais 1 e vira 0; um contador que despenca de 0 pra 4 bilhões é o mesmo fenômeno no sentido contrário. Previsível, e às vezes útil em hashes e criptografia.\n\nCom sinal, overflow em C e C++ é COMPORTAMENTO INDEFINIDO. O compilador assume que nunca acontece e otimiza em cima dessa promessa: um teste como x + 1 > x pode ser simplificado pra sempre verdadeiro e sumir do binário. O bug clássico: somar dois int positivos grandes e obter um negativo, ou um laço que não termina nunca.\n\nA terceira armadilha é silenciosa: a promoção. Em C, operandos menores que int sobem pra int antes da conta, e comparações misturando sinais mudam de significado: em if (-1 < 1u), o -1 é convertido pra unsigned e vira 4.294.967.295, então a comparação dá FALSO. Regra prática: não misture signed e unsigned na mesma expressão, escolha o tipo pela semântica e compile com -Wall -Wextra pra ouvir o aviso antes do bug.",
                },
                {
                    type: "code",
                    value: '#include <stdint.h>\n#include <stdio.h>\n\nint main(void) {\n    uint8_t u = 255;\n    u = u + 1;                 // wrap definido: 255 + 1 vira 0 (módulo 256)\n    printf("%u\\n", u);         // 0\n\n    unsigned int limite = 10;\n    int i = -1;\n    if (i < limite) {\n        puts("nunca imprime"); // -1 promovido vira 4294967295\n    }\n    return 0;\n}',
                },
                {
                    type: "quote",
                    value: "Overflow sem sinal é aritmética de relógio: passa da meia-noite e recomeça do zero. Overflow com sinal em C é uma promessa quebrada ao compilador, e ele cobra do jeito mais caro: otimizando em cima do que você jurou que não ia acontecer.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a faixa de um inteiro sem sinal de 8 bits?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "De 0 a 255, as 256 combinações dos 8 bits",
                            isCorrect: true,
                        },
                        {
                            text: "De 1 a 256, porque a contagem começa no um",
                            isCorrect: false,
                        },
                        {
                            text: "De -128 a 127, metade pra cada lado do zero",
                            isCorrect: false,
                        },
                        {
                            text: "De 0 a 512, dois valores por bit disponível",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No complemento de dois, qual é o papel do bit mais alto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Entrar na soma dos pesos com valor negativo",
                            isCorrect: true,
                        },
                        {
                            text: "Marcar se o número é par ou ímpar na leitura",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar o resto da última soma executada",
                            isCorrect: false,
                        },
                        {
                            text: "Indicar overflow na operação mais recente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Um uint8_t vale 255 e recebe mais 1. O que acontece?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Vira 0: a conta é feita módulo 256, sem erro",
                            isCorrect: true,
                        },
                        {
                            text: "O programa recebe um sinal de erro do processador",
                            isCorrect: false,
                        },
                        {
                            text: "O valor satura e permanece parado em 255",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador converte o tipo pra uint16_t",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a comparação -1 < 1u resulta em falso em C?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O -1 é promovido pra unsigned e vira um valor gigante",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador remove comparações com números negativos",
                            isCorrect: false,
                        },
                        {
                            text: "O -1 é arredondado pra 0 antes de qualquer comparação",
                            isCorrect: false,
                        },
                        {
                            text: "A comparação entre tipos diferentes sempre retorna falso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que overflow com sinal ser indefinido é perigoso na prática?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O compilador otimiza assumindo que ele nunca acontece",
                            isCorrect: true,
                        },
                        {
                            text: "O processador trava e exige reinicialização da máquina",
                            isCorrect: false,
                        },
                        {
                            text: "O resultado vira sempre zero e corrompe os contadores",
                            isCorrect: false,
                        },
                        {
                            text: "A memória do processo inteira é marcada como inválida",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ponto flutuante e o caso 0,1 + 0,2",
            blocks: [
                {
                    type: "text",
                    value: "# IEEE 754: notação científica em base 2\n\nUm float não guarda 3,14: guarda três campos. O padrão IEEE 754, implementado por praticamente todo hardware moderno, divide os bits em SINAL, EXPOENTE e MANTISSA, e o valor é lido como notação científica em base 2: sinal vezes 1,mantissa vezes 2 elevado a (expoente menos o viés).\n\nNo float de 32 bits são 1 bit de sinal, 8 de expoente (viés 127) e 23 de mantissa; no double de 64 bits, 1, 11 (viés 1023) e 52. O 1 antes da vírgula é implícito: todo número normalizado começa com 1 em binário, então ele nem é armazenado, e a mantissa ganha um bit de graça.\n\nEssa estrutura compra FAIXA DINÂMICA: o double representa desde frações minúsculas até números com centenas de dígitos, deslocando o expoente. O preço é a precisão limitada: cerca de 7 dígitos decimais confiáveis no float, 15 a 16 no double. Alguns padrões de bits são reservados pra casos especiais: zero, infinitos, NaN (o resultado de 0 dividido por 0) e os subnormais perto do zero. Um float é sempre uma APROXIMAÇÃO com erro relativo controlado, nunca uma promessa de exatidão.",
                },
                {
                    type: "table",
                    value: '[["Campo","float (32 bits)","double (64 bits)"],["Sinal","1 bit","1 bit"],["Expoente","8 bits, viés 127","11 bits, viés 1023"],["Mantissa","23 bits (mais 1 implícito)","52 bits (mais 1 implícito)"],["Dígitos decimais","cerca de 7","15 a 16"],["Épsilon da máquina","1,19e-7","2,22e-16"]]',
                },
                {
                    type: "text",
                    value: "## Por que 0,1 + 0,2 não dá 0,3\n\nEm base 2, só têm representação finita as frações cujo denominador é potência de 2. Um décimo tem um fator 5 no denominador: em binário vira a dízima periódica 0,000110011001100... e PRECISA ser cortada em algum bit. O double mais próximo de 0,1 é um tiquinho maior que 0,1; o de 0,2 também. Somando os dois erros, o resultado impresso com precisão total é 0,30000000000000004, enquanto o double mais próximo de 0,3 é outro número. A comparação 0.1 + 0.2 == 0.3 dá falso em qualquer linguagem com IEEE 754: Python, JavaScript, C, todas.\n\nA conclusão prática: nunca compare floats com igualdade exata. Compare com TOLERÂNCIA: a diferença absoluta funciona perto de zero, a relativa (proporcional ao maior dos dois valores) funciona no resto, e código robusto combina as duas. O épsilon da máquina, 2,22e-16 no double, é o degrau relativo mínimo e serve de calibre.\n\nE dinheiro? Centavos somados milhões de vezes acumulam erro visível em relatório. Sistemas financeiros usam inteiros contando centavos, ou tipos decimais; float em saldo bancário é bug esperando a auditoria chegar.",
                },
                {
                    type: "code",
                    value: '#include <stdio.h>\n#include <math.h>\n\nint quase_igual(double a, double b) {\n    double dif = fabs(a - b);\n    double escala = fmax(fabs(a), fabs(b));\n    return dif <= 1e-9 * escala || dif <= 1e-12;  // relativa + absoluta\n}\n\nint main(void) {\n    printf("%.17f\\n", 0.1 + 0.2);                 // 0.30000000000000004\n    printf("%d\\n", 0.1 + 0.2 == 0.3);             // 0: falso\n    printf("%d\\n", quase_igual(0.1 + 0.2, 0.3));  // 1: verdadeiro\n    return 0;\n}',
                },
                {
                    type: "quote",
                    value: "O float não erra por descuido, erra por contrato: ele promete o número representável MAIS PRÓXIMO, e 0,1 simplesmente não está na lista. Quem compara com igualdade exata está cobrando uma promessa que nunca foi feita.",
                },
            ],
            questions: [
                {
                    statement: "Quais são os três campos de um número IEEE 754?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um bit de sinal, o expoente com viés e a mantissa",
                            isCorrect: true,
                        },
                        {
                            text: "Um bit de paridade, a base decimal e o arredondamento",
                            isCorrect: false,
                        },
                        {
                            text: "O numerador, o denominador e o fator de escala fixo",
                            isCorrect: false,
                        },
                        {
                            text: "A parte inteira, a parte fracionária e o separador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que 0,1 não tem representação exata em binário?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Vira dízima periódica: 1/10 tem fator 5 no denominador",
                            isCorrect: true,
                        },
                        {
                            text: "Os 23 bits da mantissa são poucos pra números pequenos",
                            isCorrect: false,
                        },
                        {
                            text: "O expoente com viés não alcança valores menores que 1",
                            isCorrect: false,
                        },
                        {
                            text: "O hardware arredonda toda fração pra economizar ciclos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que imprime 0.1 + 0.2 num double com 17 casas decimais?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "0,30000000000000004, com o erro das duas parcelas",
                            isCorrect: true,
                        },
                        {
                            text: "0,30000000000000000, porque a soma arredonda no final",
                            isCorrect: false,
                        },
                        {
                            text: "0,29999999999999999, sempre um pouco abaixo do exato",
                            isCorrect: false,
                        },
                        {
                            text: "0,33333333333333333, a dízima aparece na base decimal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o jeito correto de comparar dois doubles por igualdade?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Aceitar diferença dentro de uma tolerância relativa",
                            isCorrect: true,
                        },
                        {
                            text: "Converter os dois pra string e comparar os caracteres",
                            isCorrect: false,
                        },
                        {
                            text: "Usar == depois de arredondar os dois pra sete casas",
                            isCorrect: false,
                        },
                        {
                            text: "Comparar apenas os bits da mantissa, sem o expoente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que sistemas financeiros evitam float pra guardar saldo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O erro de arredondamento acumula ao longo das somas",
                            isCorrect: true,
                        },
                        {
                            text: "O float não representa nenhum valor acima de mil reais",
                            isCorrect: false,
                        },
                        {
                            text: "A soma de floats é dez vezes mais lenta que a de inteiros",
                            isCorrect: false,
                        },
                        {
                            text: "Bancos são proibidos por norma de usar números binários",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ponto fixo e a notação Q",
            blocks: [
                {
                    type: "text",
                    value: "# A vírgula parada onde você escolheu\n\nPonto fixo é um inteiro com uma convenção em cima: você DECIDE que os últimos n bits são a parte fracionária, e todo o sistema respeita esse acordo. A notação Q resume o contrato: Q15 é um int16 com 15 bits fracionários; Q16.16 é um int32 com 16 bits inteiros e 16 fracionários.\n\nO valor real é o inteiro armazenado dividido por 2 elevado a n. Em Q16.16, o número 1,5 vira 98.304 (que é 1,5 vezes 65.536), e a resolução é 1 sobre 65.536, cerca de 0,000015. A faixa fica fixa: Q15 cobre de -1 até quase 1; Q16.16, de -32.768 até quase 32.768. Diferente do float, não existe expoente pra deslocar a vírgula: precisão e faixa foram comprados de uma vez só, na escolha do formato.\n\nPor que alguém abriria mão do float? Porque muito processador pequeno NÃO TEM FPU: num Cortex-M0, cada operação de ponto flutuante vira uma chamada de biblioteca em software, dezenas de ciclos cada. Com ponto fixo, somar é somar inteiro: um ciclo, sempre, com consumo de energia menor e latência conhecida de antemão.",
                },
                {
                    type: "table",
                    value: '[["Formato","Container","Faixa aproximada","Resolução"],["Q7","int8","-1 a 0,992","2^-7 (0,0078)"],["Q15","int16","-1 a 0,99997","2^-15 (0,00003)"],["Q16.16","int32","-32.768 a 32.768","2^-16 (0,000015)"],["Q31","int32","-1 a quase 1","2^-31 (5e-10)"]]',
                },
                {
                    type: "text",
                    value: "## As regras do jogo e o preço delas\n\nSomar dois números no MESMO formato Q é somar os inteiros, e pronto. Multiplicar exige atenção: o produto de dois Q16.16 carrega 32 bits fracionários, então a conta sobe pra 64 bits e desce com um deslocamento de 16. Esquecer o intermediário largo é o bug número um do ponto fixo: overflow silencioso no meio da conta, resultado lixo na saída.\n\nOs ganhos são concretos. DETERMINISMO: a mesma sequência de operações produz exatamente os mesmos bits em qualquer processador, o que áudio, malhas de controle e replays de jogos agradecem. Custo: aritmética inteira de um ciclo, sem FPU, com energia menor e latência previsível, sem caminhos lentos escondidos.\n\nO preço é a faixa curta e fixa: se o sinal medido varia de milésimos a milhares, o formato que preserva o detalhe pequeno estoura no valor grande. Sem o expoente do float, quem administra a escala é você: saturação em vez de wrap nos limites, análise de pior caso nas contas intermediárias. Ponto fixo brilha quando a faixa do problema é conhecida e estreita; fora disso, o float existe por bons motivos.",
                },
                {
                    type: "code",
                    value: "#include <stdint.h>\n\ntypedef int32_t q16_16;        // 16 bits inteiros, 16 fracionários\n#define Q 16\n\nq16_16 q_de_float(float f)  { return (q16_16)(f * (1 << Q)); }\nfloat  q_pra_float(q16_16 v) { return (float)v / (1 << Q); }\n\nq16_16 q_soma(q16_16 a, q16_16 b) { return a + b; }  // soma direta\nq16_16 q_mul(q16_16 a, q16_16 b) {\n    return (q16_16)(((int64_t)a * b) >> Q);  // produto em 64 bits, desce 16\n}\n// 2,5 x 1,5 = 3,75: q_mul(163840, 98304) == 245760",
                },
                {
                    type: "quote",
                    value: "O float carrega um expoente pra vírgula viajar; o ponto fixo prega a vírgula na parede. Menos liberdade, mais previsibilidade: é o acordo certo quando o processador é pequeno e o prazo de cada conta importa.",
                },
            ],
            questions: [
                {
                    statement: "O que significa o formato Q15?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um int16 interpretado com 15 bits fracionários",
                            isCorrect: true,
                        },
                        {
                            text: "Um float de 15 bits usado em processadores antigos",
                            isCorrect: false,
                        },
                        {
                            text: "Um inteiro de 15 bits com um bit extra de paridade",
                            isCorrect: false,
                        },
                        {
                            text: "Um formato de texto com 15 casas decimais exatas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que microcontroladores sem FPU preferem ponto fixo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cada operação vira aritmética inteira de um ciclo",
                            isCorrect: true,
                        },
                        {
                            text: "O ponto fixo ocupa metade da memória flash do chip",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador converte float pra fixo sem custo algum",
                            isCorrect: false,
                        },
                        {
                            text: "A norma dos embarcados proíbe float em produção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como multiplicar dois valores Q16.16 sem perder o formato?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Produto em 64 bits e deslocamento de 16 pra direita",
                            isCorrect: true,
                        },
                        {
                            text: "Multiplicar os inteiros direto, o formato se preserva",
                            isCorrect: false,
                        },
                        {
                            text: "Somar os dois e deslocar uma vez pra esquerda no final",
                            isCorrect: false,
                        },
                        {
                            text: "Converter pra float, multiplicar e voltar pra inteiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a principal limitação do ponto fixo diante do float?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A faixa é fixa: sem expoente pra deslocar a vírgula",
                            isCorrect: true,
                        },
                        {
                            text: "A soma exige o dobro de ciclos de uma soma inteira",
                            isCorrect: false,
                        },
                        {
                            text: "Os valores negativos precisam de um bit de sinal extra",
                            isCorrect: false,
                        },
                        {
                            text: "Não existe forma de representar números negativos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que áudio e controle valorizam o determinismo do ponto fixo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A mesma conta produz os mesmos bits em qualquer chip",
                            isCorrect: true,
                        },
                        {
                            text: "O ponto fixo elimina qualquer ruído do conversor AD",
                            isCorrect: false,
                        },
                        {
                            text: "O float muda de latência conforme o volume do sinal",
                            isCorrect: false,
                        },
                        {
                            text: "Os filtros digitais só convergem com números inteiros",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Texto e bytes: ASCII e UTF-8",
            blocks: [
                {
                    type: "text",
                    value: "# Do ASCII ao Unicode\n\nTexto é convenção sobre bytes. O ASCII, de 1963, usa 7 bits e define 128 símbolos: letras sem acento, dígitos, pontuação e caracteres de controle. A letra A é 65 (0x41), a minúscula a é 97; o dígito 0 é 48, que NÃO é o número zero. Pra inglês bastava; pra ç, ideogramas e alfabetos inteiros, não.\n\nO Unicode resolveu a metade abstrata do problema: um catálogo que dá a cada caractere um número, o code point, escrito como U+0041. Faltava a metade concreta: como gravar esses números em bytes. É aí que entra o UTF-8, a codificação dominante da web: comprimento VARIÁVEL, de 1 a 4 bytes por caractere.\n\nO desenho do UTF-8 é elegante. Caracteres ASCII continuam ocupando 1 byte idêntico ao original, então todo arquivo ASCII antigo já é UTF-8 válido. Caracteres maiores começam com um byte líder (110xxxxx pra 2 bytes, 1110xxxx pra 3, 11110xxx pra 4) seguido de bytes de continuação, todos no padrão 10xxxxxx. Como líder e continuação nunca se confundem, dá pra encontrar a fronteira de um caractere partindo de qualquer byte do arquivo.",
                },
                {
                    type: "table",
                    value: '[["Caractere","Code point","Bytes em UTF-8","Tamanho"],["A","U+0041","41","1 byte"],["ç","U+00E7","C3 A7","2 bytes"],["€","U+20AC","E2 82 AC","3 bytes"],["𝄞 (clave de sol)","U+1D11E","F0 9D 84 9E","4 bytes"]]',
                },
                {
                    type: "text",
                    value: "## Quantos caracteres tem essa string?\n\nA pergunta parece simples e tem QUATRO respostas honestas. Bytes: o que disco e rede medem; em UTF-8, café ocupa 5 bytes, porque o é usa 2. Code points: o que len conta em Python; café tem 4. Unidades UTF-16: o que length devolve em JavaScript; a clave de sol, U+1D11E, vira um par substituto e conta 2. Grafemas: o que o usuário enxerga como um símbolo; um emoji de família pode juntar vários code points num desenho só.\n\nAs consequências são práticas. Truncar uma string por BYTES pode cortar um caractere no meio e corromper o texto: os bytes órfãos viram o símbolo de interrogação da decodificação falha. Um VARCHAR(10) limita 10 de quê? Depende do banco. A validação de tamanho no navegador (que conta UTF-16) pode divergir da do backend (que conta bytes), e o mesmo nome passa num lado e estoura no outro.\n\nRegra de sobrevivência: descubra QUAL unidade cada camada mede antes de comparar tamanhos, trunque por caractere e nunca por byte, e trate byte e caractere como tipos diferentes que exigem conversão consciente.",
                },
                {
                    type: "code",
                    value: 's = "café"\nprint(len(s))                  # 4 code points\nprint(len(s.encode("utf-8"))) # 5 bytes: o é ocupa 2 (C3 A9)\n\nb = s.encode("utf-8")          # b\'caf\\xc3\\xa9\'\nprint(b[:4].decode("utf-8", errors="replace"))\n# cortou o é no meio: sobra \'caf\' + byte órfão virando erro',
                },
                {
                    type: "quote",
                    value: "Byte é unidade de armazenamento; caractere é unidade de sentido. O UTF-8 é a ponte entre os dois mundos, e toda string quebrada que você já viu na vida nasceu de alguém atravessando essa ponte sem olhar.",
                },
            ],
            questions: [
                {
                    statement: "Quantos bytes um caractere ASCII ocupa em UTF-8?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um byte, idêntico ao valor ASCII original",
                            isCorrect: true,
                        },
                        {
                            text: "Dois bytes, um de marca e um com o valor",
                            isCorrect: false,
                        },
                        {
                            text: "Quatro bytes, como qualquer outro caractere",
                            isCorrect: false,
                        },
                        {
                            text: "Depende da fonte instalada no sistema operacional",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se reconhece um byte de continuação em UTF-8?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele começa sempre com o padrão de bits 10",
                            isCorrect: true,
                        },
                        {
                            text: "Ele começa sempre com o padrão de bits 11",
                            isCorrect: false,
                        },
                        {
                            text: "Ele repete o primeiro byte do caractere atual",
                            isCorrect: false,
                        },
                        {
                            text: "Ele carrega o total de bytes do caractere no fim",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em Python, len de café dá 4, mas são 5 bytes em UTF-8. Por quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "len conta code points e o é ocupa 2 bytes",
                            isCorrect: true,
                        },
                        {
                            text: "len conta bytes, mas ignora o último da string",
                            isCorrect: false,
                        },
                        {
                            text: "Python guarda um byte oculto de fim de string",
                            isCorrect: false,
                        },
                        {
                            text: "O acento é descartado na contagem de tamanho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que truncar uma string por bytes é perigoso em UTF-8?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pode cortar um caractere de vários bytes no meio",
                            isCorrect: true,
                        },
                        {
                            text: "O UTF-8 exige tamanho total múltiplo de quatro bytes",
                            isCorrect: false,
                        },
                        {
                            text: "Strings truncadas perdem o marcador de codificação",
                            isCorrect: false,
                        },
                        {
                            text: "O sistema converte o resto automaticamente pra ASCII",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em JavaScript, por que a clave de sol U+1D11E tem length 2?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O length conta unidades UTF-16, e ela usa um par",
                            isCorrect: true,
                        },
                        {
                            text: "O navegador insere um espaço invisível após o símbolo",
                            isCorrect: false,
                        },
                        {
                            text: "Símbolos musicais contam dobrado por padrão da linguagem",
                            isCorrect: false,
                        },
                        {
                            text: "O length soma os bytes que o caractere tem em UTF-8",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Bits na prática",
    aulas: [
        {
            titulo: "Operadores bit a bit",
            blocks: [
                {
                    type: "text",
                    value: "# Quatro operadores, todo o vocabulário\n\nOperadores bit a bit tratam o número como aquilo que ele é por baixo: uma fileira de bits, operados EM PARALELO, posição por posição, sem vai-um. Em C e nas linguagens que herdaram a sintaxe, são quatro: & (AND), | (OR), ^ (XOR) e ~ (NOT), mais os shifts da próxima aula.\n\nO AND só devolve 1 quando os dois bits são 1: é o operador de FILTRAR, porque zera tudo que a máscara não deixa passar. O OR devolve 1 se qualquer um dos dois for 1: é o operador de LIGAR bits sem mexer nos demais. O XOR devolve 1 quando os bits diferem: inverte o que a máscara marca, e tem propriedades preciosas, como a de que x ^ x é sempre 0. O NOT inverte todos os bits de uma vez só.\n\nCuidado com os primos falsos: & não é &&, | não é ||. Os dobrados são operadores lógicos, tratam o valor inteiro como verdadeiro ou falso e curto-circuitam; os simples operam bit a bit e sempre avaliam os dois lados. Trocar um pelo outro compila sem aviso e produz bugs discretos, do tipo que passa em metade dos testes.",
                },
                {
                    type: "table",
                    value: '[["a","b","a & b","a | b","a ^ b"],["0","0","0","0","0"],["0","1","0","1","1"],["1","0","0","1","1"],["1","1","1","1","0"]]',
                },
                {
                    type: "text",
                    value: "## Onde isso aparece no trabalho\n\nMáscaras de cor: um pixel RGB empacotado em 24 bits entrega o canal verde com (cor >> 8) & 0xFF; o shift traz o canal pra base e o AND descarta o resto. Permissões e flags: abrir arquivo com O_RDWR | O_CREAT liga dois comportamentos no mesmo inteiro, e testar se uma permissão existe é um AND. Redes: aplicar máscara de sub-rede é literalmente um AND entre endereço e máscara.\n\nO XOR merece parágrafo próprio. Como a ^ a é 0 e a ^ 0 é a, aplicar a mesma máscara duas vezes desfaz a primeira aplicação: é a base de checksums simples, de cifras de brinquedo e do truque de achar o número sem par numa lista onde todos os outros aparecem duas vezes: o XOR de tudo cancela os pares e sobra o único.\n\nExiste também o famoso swap sem variável temporária usando três XOR. Conheça, entenda, e não use: o compilador gera código melhor com a troca comum, e o revisor agradece. O valor real desses operadores está em ler e escrever máscaras com naturalidade, porque baixo nível é feito disso todos os dias.",
                },
                {
                    type: "code",
                    value: 'unsigned cor = 0xFF6600;           // laranja: R=FF, G=66, B=00\nunsigned r = (cor >> 16) & 0xFF;   // 0xFF (255)\nunsigned g = (cor >> 8) & 0xFF;    // 0x66 (102)\nunsigned b = cor & 0xFF;           // 0x00 (0)\n\nint fd = open("log.txt", O_RDWR | O_CREAT, 0644);  // liga dois modos\n\nint unico = 0;\nfor (int i = 0; i < n; i++) unico ^= v[i];  // pares se cancelam',
                },
                {
                    type: "quote",
                    value: "AND filtra, OR liga, XOR inverte, NOT vira tudo do avesso. São quatro verbos curtos, e com eles o baixo nível escreve frases inteiras: máscara, flag, permissão, checksum.",
                },
            ],
            questions: [
                {
                    statement: "Qual operador serve pra isolar bits usando uma máscara?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O AND: ele zera tudo que a máscara não marca",
                            isCorrect: true,
                        },
                        {
                            text: "O OR: ele apaga os bits fora da região marcada",
                            isCorrect: false,
                        },
                        {
                            text: "O NOT: ele remove os bits que estiverem zerados",
                            isCorrect: false,
                        },
                        {
                            text: "O XOR: ele copia só os bits iguais aos da máscara",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quanto vale 1 ^ 1 numa operação XOR?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Vale 0: bits iguais sempre se anulam no XOR",
                            isCorrect: true,
                        },
                        {
                            text: "Vale 1: o XOR preserva os bits que forem iguais",
                            isCorrect: false,
                        },
                        {
                            text: "Vale 2: o XOR soma os operandos sem o vai-um",
                            isCorrect: false,
                        },
                        {
                            text: "Depende do bit vizinho, o XOR propaga o resultado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Numa cor 0xFF6600, o que devolve (cor >> 8) & 0xFF?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "0x66: o shift alinha o verde e o AND isola o byte",
                            isCorrect: true,
                        },
                        {
                            text: "0xFF: o AND devolve sempre a máscara aplicada",
                            isCorrect: false,
                        },
                        {
                            text: "0x00: o deslocamento descarta os bits do meio",
                            isCorrect: false,
                        },
                        {
                            text: "0xFF66: o shift mantém os dois canais mais altos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre & e && em C?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O & opera bit a bit; o && é lógico e curto-circuita",
                            isCorrect: true,
                        },
                        {
                            text: "São sinônimos; o dobrado só existe por legibilidade",
                            isCorrect: false,
                        },
                        {
                            text: "O & compara inteiros e o && compara apenas booleanos",
                            isCorrect: false,
                        },
                        {
                            text: "O && opera bit a bit em pares de bytes consecutivos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Numa lista onde todo valor aparece em dupla menos um, por que o XOR de todos acha o único?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Os pares se cancelam em 0 e sobra o valor sem par",
                            isCorrect: true,
                        },
                        {
                            text: "O XOR ordena os valores e devolve o maior deles",
                            isCorrect: false,
                        },
                        {
                            text: "O XOR soma tudo e divide o total pela contagem",
                            isCorrect: false,
                        },
                        {
                            text: "O XOR marca cada repetido com o bit mais alto em 1",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Shifts, set, clear, test e toggle",
            blocks: [
                {
                    type: "text",
                    value: "# Deslocar é multiplicar, mascarar é apontar\n\nO shift à esquerda x << n desloca os bits n posições e preenche com zeros: cada posição dobra o valor, então x << 3 multiplica por 8. O shift à direita x >> n descarta os bits de baixo: num inteiro sem sinal, divide por 2 elevado a n, arredondando pra baixo. Compiladores exploram isso há décadas; você vai usar principalmente pra montar máscaras.\n\nA máscara fundamental é 1u << n: um único bit ligado, na posição n. Com ela nascem os quatro gestos que você vai repetir pela carreira inteira: ligar um bit com OR, desligar com AND do complemento, alternar com XOR e testar com shift seguido de AND. A tabela abaixo é o resumo que vale a pena decorar de verdade.\n\nRepare no sufixo u de 1u: ele torna o literal unsigned. Bits e aritmética com sinal se misturam mal, e a regra de ouro é fazer manipulação de bits SEMPRE em tipos sem sinal, de largura explícita como uint32_t, onde cada operação tem resultado definido pelo padrão da linguagem.",
                },
                {
                    type: "table",
                    value: '[["Operação","Expressão","Resultado"],["Ligar o bit n","x |= 1u << n","bit n vira 1, resto intacto"],["Desligar o bit n","x &= ~(1u << n)","bit n vira 0, resto intacto"],["Alternar o bit n","x ^= 1u << n","bit n inverte"],["Testar o bit n","(x >> n) & 1u","1 se ligado, 0 se desligado"],["Multiplicar por 8","x << 3","desloca três posições"]]',
                },
                {
                    type: "text",
                    value: "## As armadilhas do shift\n\nShift tem esquinas escuras definidas pelo padrão da linguagem. Deslocar por n maior ou igual à largura do tipo é comportamento indefinido: 1u << 32 num unsigned de 32 bits não dá zero garantido, dá qualquer coisa. Shift à esquerda de número negativo também é indefinido. E 1 << 31 num int de 32 bits estoura a faixa do int com sinal: escreva 1u << 31.\n\nO shift à direita de número NEGATIVO é o caso mais traiçoeiro: o padrão deixa a implementação escolher, e na prática os compiladores fazem shift aritmético, copiando o bit de sinal pra preencher as posições altas: -8 >> 1 dá -4, com os bits altos chegando repetidos. Se a intenção era mexer em bits, e não dividir, esse preenchimento embaralha a máscara inteira.\n\nA saída é disciplina, não memória heroica: converta pra unsigned antes de manipular bits, use tipos de largura explícita, e reserve shifts com sinal pra onde a intenção é aritmética documentada. O compilador com -Wall avisa uma parte disso; o resto é hábito seu.",
                },
                {
                    type: "code",
                    value: "#include <stdint.h>\n\nuint8_t leds = 0;\nleds |= 1u << 3;              // liga o LED 3:  0000 1000\nleds |= 1u << 0;              // liga o LED 0:  0000 1001\nleds ^= 1u << 3;              // alterna o 3:   0000 0001\nleds &= (uint8_t)~(1u << 0);  // desliga o 0:   0000 0000\n\nint ligado = (leds >> 2) & 1u;  // testa o bit 2 sem alterar nada\n\nuint32_t kb = 640;\nuint32_t bytes = kb << 10;      // x1024: 655360, shift como multiplicação",
                },
                {
                    type: "quote",
                    value: "Quando o número é quantidade, shift é aritmética; quando o número é um mapa de bits, shift é PONTARIA: 1u << n é o dedo apontando exatamente pra posição que interessa.",
                },
            ],
            questions: [
                {
                    statement: "A que operação aritmética x << 3 equivale?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Multiplicar x por 8, ou seja, por 2 elevado a 3",
                            isCorrect: true,
                        },
                        {
                            text: "Somar 3 ao valor de x três vezes consecutivas",
                            isCorrect: false,
                        },
                        {
                            text: "Dividir x por 8 com arredondamento pra baixo",
                            isCorrect: false,
                        },
                        {
                            text: "Elevar x ao cubo preservando o sinal original",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual expressão liga o bit n de x sem mexer nos demais?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "x |= 1u << n, um OR com a máscara da posição",
                            isCorrect: true,
                        },
                        {
                            text: "x &= 1u << n, um AND que força o bit pra um",
                            isCorrect: false,
                        },
                        {
                            text: "x ^= ~(1u << n), o XOR do complemento da máscara",
                            isCorrect: false,
                        },
                        {
                            text: "x += 1u << n, somando a potência de dois do bit",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como desligar apenas o bit n de x?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Com x &= ~(1u << n), AND com a máscara invertida",
                            isCorrect: true,
                        },
                        {
                            text: "Com x |= ~(1u << n), OR com a máscara invertida",
                            isCorrect: false,
                        },
                        {
                            text: "Com x >>= n, empurrando o bit pra fora do tipo",
                            isCorrect: false,
                        },
                        {
                            text: "Com x ^= 1u << n, que zera o bit incondicionalmente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que 1 << 31 é problemático num int de 32 bits?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O resultado estoura a faixa do int com sinal",
                            isCorrect: true,
                        },
                        {
                            text: "O shift ignora posições acima de 30 por padrão",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador limita shifts a 16 posições por vez",
                            isCorrect: false,
                        },
                        {
                            text: "O bit deslocado volta pela direita e suja o valor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que faz -8 >> 1 na maioria dos compiladores C?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Dá -4: o shift aritmético copia o bit de sinal",
                            isCorrect: true,
                        },
                        {
                            text: "Dá 2147483644: os bits altos entram sempre zerados",
                            isCorrect: false,
                        },
                        {
                            text: "Dá -16: o sinal negativo inverte o sentido do shift",
                            isCorrect: false,
                        },
                        {
                            text: "Dá 0: números negativos zeram em qualquer shift",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Flags, campos de bits e datasheets",
            blocks: [
                {
                    type: "text",
                    value: "# O registrador é uma tabela de bits\n\nEm hardware, configurar um periférico é escrever num REGISTRADOR mapeado: um inteiro em que cada bit ou grupo de bits é um campo com significado próprio. O datasheet do chip documenta isso como uma tabela: bit 0 liga o módulo, bit 1 habilita interrupção, bits 3:2 escolhem o modo de operação, e assim por diante.\n\nVamos usar um registrador fictício de 8 bits, CTRL, de um controlador de porta digital. A tabela abaixo segue o formato que você encontraria num datasheet real; a notação 3:2 significa do bit 3 ao bit 2, inclusive. Um valor como 0b00010101 se lê campo a campo: EN ligado, IRQ_EN desligado, MODE em 01, SPEED em 001, LOCK desligado.\n\nA leitura de datasheet é uma habilidade em si: você não lê a prosa primeiro, lê a tabela de bits, e a prosa serve pra desempatar dúvidas. Cada campo tem posição (que vira o shift) e largura (que vira a máscara), e esses dois números são tudo que o código precisa. Datasheet bem lido se transforma em meia dúzia de defines e três funções curtas de acesso.",
                },
                {
                    type: "table",
                    value: '[["Bits","Campo","Significado"],["0","EN","1 liga o periférico"],["1","IRQ_EN","1 habilita a interrupção"],["3:2","MODE","00 entrada; 01 saída; 10 função alternativa"],["6:4","SPEED","velocidade de 0 a 7"],["7","LOCK","1 trava a configuração até o reset"]]',
                },
                {
                    type: "text",
                    value: "## Ler, modificar, escrever\n\nPra extrair um campo, desloque até a base e mascare a largura: modo = (ctrl >> 2) & 0x3. Pra escrever um campo SEM destruir os vizinhos, o ritual tem três passos: limpe a região com AND do complemento, prepare o valor novo deslocado, aplique com OR. Escrever direto, sem limpar, mistura o valor novo com o antigo; escrever o registrador inteiro apaga campos que outra parte do código configurou antes.\n\nO mesmo padrão vale longe do hardware. Permissões Unix (0644), flags de abertura de arquivo, opções de socket, feature flags compactas: 32 booleanos custam 4 bytes num inteiro, contra dezenas de bytes num array de bools, e operações de conjunto viram uma instrução só.\n\nC oferece bitfields de struct pra esse empacotamento, e eles são legíveis, mas carregam uma pegadinha: o LAYOUT (ordem dos campos dentro do inteiro, padding interno) é definido pela implementação e muda entre compiladores. Pra estado interno do programa, use à vontade; pra registrador de hardware, protocolo de rede ou formato de arquivo, prefira shifts e máscaras explícitos, que produzem os mesmos bits em qualquer compilador.",
                },
                {
                    type: "code",
                    value: "#define EN        (1u << 0)\n#define IRQ_EN    (1u << 1)\n#define MODE_POS  2\n#define MODE_MASK (0x3u << MODE_POS)\n\nuint8_t ctrl = 0;\nctrl |= EN;                                     // liga o periférico\nuint8_t modo = (ctrl & MODE_MASK) >> MODE_POS;  // lê o campo MODE\n\n// escreve MODE = 01 (saída) preservando os demais campos:\nctrl = (ctrl & (uint8_t)~MODE_MASK) | (0x1u << MODE_POS);",
                },
                {
                    type: "quote",
                    value: "Datasheet não se lê como prosa, se lê como planilha: cada linha é um campo, cada campo é um intervalo de bits, e o seu trabalho é traduzir a tabela em máscaras que qualquer colega entenda sem abrir o PDF de novo.",
                },
            ],
            questions: [
                {
                    statement: "No registrador CTRL, o que testa a expressão ctrl & (1u << 0)?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Se o bit EN está ligado, sem alterar o registrador",
                            isCorrect: true,
                        },
                        {
                            text: "Se o registrador inteiro está zerado no momento",
                            isCorrect: false,
                        },
                        {
                            text: "Se algum bit qualquer do registrador está ligado",
                            isCorrect: false,
                        },
                        {
                            text: "Se o bit EN aceita escrita neste modo de operação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que empacotar 32 flags booleanas num único inteiro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Trinta e dois estados passam a custar 4 bytes",
                            isCorrect: true,
                        },
                        {
                            text: "Inteiros são imunes a corrupção de memória",
                            isCorrect: false,
                        },
                        {
                            text: "O processador só compara valores inteiros",
                            isCorrect: false,
                        },
                        {
                            text: "Booleanos separados não podem ser globais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como extrair o campo MODE (bits 3:2) do registrador ctrl?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Com (ctrl >> 2) & 0x3: desloca até a base e mascara",
                            isCorrect: true,
                        },
                        {
                            text: "Com ctrl & 0x3, aplicando a máscara direto no valor",
                            isCorrect: false,
                        },
                        {
                            text: "Com (ctrl << 2) | 0x3, subindo o campo e completando",
                            isCorrect: false,
                        },
                        {
                            text: "Com ctrl >> 4, alinhando o campo pelo lado do LOCK",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que escrever um campo exige ler, limpar e aplicar OR?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pra preservar os outros campos do mesmo registrador",
                            isCorrect: true,
                        },
                        {
                            text: "Pra evitar que a escrita dispare a interrupção do chip",
                            isCorrect: false,
                        },
                        {
                            text: "Pra dar tempo de o hardware estabilizar entre escritas",
                            isCorrect: false,
                        },
                        {
                            text: "Pra garantir que o valor caiba na largura do campo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que bitfields de C são arriscados pra protocolos e hardware?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O layout dos campos varia conforme o compilador",
                            isCorrect: true,
                        },
                        {
                            text: "Bitfields ocupam sempre um inteiro de 64 bits",
                            isCorrect: false,
                        },
                        {
                            text: "O acesso a bitfield não funciona fora de structs",
                            isCorrect: false,
                        },
                        {
                            text: "Bitfields são removidos em compilações otimizadas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Endianness: a ordem dos bytes",
            blocks: [
                {
                    type: "text",
                    value: "# A ordem dos bytes no armário\n\nUm uint32_t como 0x12345678 ocupa quatro bytes na memória, e existe uma decisão silenciosa embutida: em que ORDEM guardar esses bytes? Little-endian guarda o byte MENOS significativo primeiro: no endereço mais baixo fica 0x78. Big-endian guarda o MAIS significativo primeiro: 0x12 abre a fila.\n\nQuem usa o quê: x86-64 é little-endian; ARM roda em little por padrão em praticamente todos os sistemas; RISC-V também. Big-endian sobrevive em mainframes, em redes industriais antigas e, principalmente, como ORDEM DE REDE: os cabeçalhos dos protocolos da internet (IP, TCP, UDP) gravam seus números em big-endian por definição histórica.\n\nO ponto central: enquanto o valor mora dentro da CPU, você NUNCA percebe a ordem; registrador não tem endianness visível. A ordem só aparece quando o valor vira sequência de bytes: gravar num arquivo, enviar num socket, examinar a memória com um ponteiro de byte. É exatamente nessas fronteiras que programas quebram: o mesmo arquivo escrito por uma máquina e lido por outra, com os bytes numa ordem que ninguém combinou por escrito.",
                },
                {
                    type: "table",
                    value: '[["Endereço","Little-endian","Big-endian"],["0x1000","78","12"],["0x1001","56","34"],["0x1002","34","56"],["0x1003","12","78"]]',
                },
                {
                    type: "text",
                    value: "## Protocolos, arquivos e o jeito portátil\n\nFormatos definem sua ordem no papel: PNG e JPEG gravam inteiros em big-endian; BMP, ZIP e a maioria dos formatos nascidos no PC, em little. Rede usa big, e por isso a libc oferece htons e htonl (host pra rede) e ntohs e ntohl (rede pra host): em máquina little elas invertem os bytes, em máquina big não fazem nada.\n\nDetectar a ordem da máquina em tempo de execução é truque de uma linha: guarde 1 num uint32_t e olhe o primeiro byte com um ponteiro de uint8_t; se for 1, a máquina é little-endian.\n\nO jeito PORTÁTIL de ler um inteiro de um buffer dispensa detecção: monte o valor por shifts, byte a byte, seguindo a ordem que o FORMATO define. A expressão b[0] | b[1] << 8 | b[2] << 16 | b[3] << 24 lê little-endian em qualquer máquina, porque a ordem está no código, não na memória. O anti-padrão correspondente: gravar uma struct inteira com fwrite e ler em outra arquitetura; junta endianness com padding e produz o clássico arquivo que só abre na máquina onde nasceu.",
                },
                {
                    type: "code",
                    value: '#include <stdint.h>\n#include <stdio.h>\n\nint main(void) {\n    uint32_t x = 1;\n    uint8_t *p = (uint8_t *)&x;\n    puts(p[0] == 1 ? "little-endian" : "big-endian");\n\n    // leitura portátil de u32 little-endian, em qualquer máquina:\n    uint8_t b[4] = {0x78, 0x56, 0x34, 0x12};\n    uint32_t v = b[0] | (b[1] << 8) | (b[2] << 16) | ((uint32_t)b[3] << 24);\n    printf("0x%X\\n", v);  // 0x12345678\n    return 0;\n}',
                },
                {
                    type: "quote",
                    value: "Endianness só dói na fronteira: enquanto o valor vive na CPU, a ordem é invisível; no instante em que ele vira bytes num arquivo ou num socket, a ordem É o contrato, e contrato não combinado é bug garantido.",
                },
            ],
            questions: [
                {
                    statement: "Como o little-endian guarda o valor 0x12345678 na memória?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O byte 78 primeiro: o menos significativo abre a fila",
                            isCorrect: true,
                        },
                        {
                            text: "O byte 12 primeiro: a leitura segue a escrita humana",
                            isCorrect: false,
                        },
                        {
                            text: "Os bytes pares primeiro, depois os bytes ímpares",
                            isCorrect: false,
                        },
                        {
                            text: "Depende do compilador usado pra compilar o binário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a ordem de bytes definida como ordem de rede?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Big-endian: o byte mais significativo vai primeiro",
                            isCorrect: true,
                        },
                        {
                            text: "Little-endian: a ordem nativa dos servidores x86",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem da máquina que abriu a conexão TCP primeiro",
                            isCorrect: false,
                        },
                        {
                            text: "Alternada: cada campo do cabeçalho inverte a anterior",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que faz htonl antes de um inteiro de 32 bits ir pro socket?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Converte da ordem do host pra ordem de rede",
                            isCorrect: true,
                        },
                        {
                            text: "Comprime o inteiro pra caber em dois bytes",
                            isCorrect: false,
                        },
                        {
                            text: "Criptografa o valor antes da transmissão",
                            isCorrect: false,
                        },
                        {
                            text: "Adiciona o checksum do cabeçalho ao valor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que gravar uma struct com fwrite e ler noutra máquina falha?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Endianness e padding mudam entre arquiteturas",
                            isCorrect: true,
                        },
                        {
                            text: "O fwrite embaralha os campos por segurança",
                            isCorrect: false,
                        },
                        {
                            text: "Structs só existem durante a execução do processo",
                            isCorrect: false,
                        },
                        {
                            text: "O sistema de arquivos rejeita dados binários crus",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que montar o valor com b[0] | b[1] << 8 é portátil?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A ordem vem do código, não da memória da máquina",
                            isCorrect: true,
                        },
                        {
                            text: "Os shifts detectam a ordem da máquina em execução",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador reordena os bytes conforme o alvo",
                            isCorrect: false,
                        },
                        {
                            text: "O operador | força a conversão pra ordem de rede",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Alinhamento e padding",
            blocks: [
                {
                    type: "text",
                    value: "# Por que sizeof mente pra você\n\nCada tipo tem um ALINHAMENTO natural: um int de 4 bytes quer morar em endereço múltiplo de 4, um double de 8 bytes em múltiplo de 8. O motivo é físico: barramento e cache trabalham em blocos alinhados, e um acesso desalinhado custa mais caro; em arquiteturas antigas, ou em instruções especiais, simplesmente quebra com uma falha de hardware.\n\nO compilador honra o alinhamento inserindo PADDING nas structs. O exemplo clássico: uma struct com char a, int b e char c. A soma dos campos dá 6 bytes; o sizeof devolve 12. O compilador põe 3 bytes de enchimento depois de a (pro int cair em múltiplo de 4) e 3 bytes no final (pra que, num array, a próxima struct comece alinhada também).\n\nEsse enchimento final importa: o tamanho de uma struct é sempre múltiplo do maior alinhamento interno dela. Num struct sozinho, 6 bytes perdidos não são nada; num array com 10 milhões de elementos, o mesmo layout desperdiça 60 MB de RAM e, pior ainda, de cache: metade de cada linha carregada é enchimento sem informação.",
                },
                {
                    type: "table",
                    value: '[["Campo","Tipo","Offset","Observação"],["a","char","0","3 bytes de padding depois dele"],["b","int","4","alinhado em múltiplo de 4"],["c","char","8","3 bytes de padding no final"],["total","sizeof","12","apenas 6 bytes são úteis"]]',
                },
                {
                    type: "text",
                    value: "## Reordenar é a otimização mais barata que existe\n\nA cura raramente exige pragma: costuma bastar REORDENAR os campos do maior pro menor. O mesmo conteúdo declarado como int b, char a, char c ocupa 8 bytes: 4 do int, 1 de cada char e 2 de enchimento final. De 12 pra 8, um terço de economia, sem tocar em nenhuma outra linha do programa.\n\nQuando o layout precisa ser EXATO (mapear um cabeçalho de protocolo, um formato de arquivo), existe o empacotamento forçado: attribute packed no GCC e no Clang. O custo: os campos ficam desalinhados, cada acesso pode virar leituras extras, e guardar ponteiro pra um membro desalinhado é armadilha; em ARM antigo, acesso desalinhado derrubava o programa. Use packed na fronteira com o mundo externo, copie os valores pra structs normais e trabalhe nelas.\n\nFerramentas do ofício: o utilitário pahole lista offsets e buracos de cada struct do binário, e um static_assert com sizeof documenta a expectativa no próprio código: se alguém adicionar um campo e o layout mudar, o build quebra na hora, e não em produção três meses depois.",
                },
                {
                    type: "code",
                    value: '#include <assert.h>\n#include <stdint.h>\n\nstruct Gordo  { char a; int b; char c; };   // sizeof == 12\nstruct Enxuto { int b; char a; char c; };   // sizeof == 8\n\nstatic_assert(sizeof(struct Enxuto) == 8, "layout mudou");\n\nstruct __attribute__((packed)) Cabecalho {  // só na fronteira externa\n    char magic[4];\n    uint16_t versao;  // desalinhado de propósito: layout do arquivo\n};',
                },
                {
                    type: "quote",
                    value: "Padding é o aluguel que a struct paga pro acesso ficar alinhado, e o compilador cobra sem avisar. Reordenar campos é a única otimização que custa zero linhas de lógica e devolve memória e cache de uma vez só.",
                },
            ],
            questions: [
                {
                    statement: "Por que o sizeof de uma struct pode passar da soma dos campos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O compilador insere padding pra alinhar os campos",
                            isCorrect: true,
                        },
                        {
                            text: "A struct guarda o próprio tamanho num campo oculto",
                            isCorrect: false,
                        },
                        {
                            text: "O sizeof arredonda pra potência de dois mais próxima",
                            isCorrect: false,
                        },
                        {
                            text: "Cada campo carrega um cabeçalho de tipo em memória",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o alinhamento natural de um int de 4 bytes?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Endereço múltiplo de 4, casado com o barramento",
                            isCorrect: true,
                        },
                        {
                            text: "Endereço múltiplo de 8, o padrão de qualquer tipo",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer endereço par serve igualmente bem",
                            isCorrect: false,
                        },
                        {
                            text: "Endereço ímpar, pra não competir com ponteiros",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Reordenando char, int, char pra int, char, char, o sizeof cai de 12 pra quanto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pra 8: quatro do int, dois chars e dois de padding",
                            isCorrect: true,
                        },
                        {
                            text: "Pra 6: a soma exata dos campos, sem nenhum resto",
                            isCorrect: false,
                        },
                        {
                            text: "Pra 12: a ordem dos campos não muda o tamanho",
                            isCorrect: false,
                        },
                        {
                            text: "Pra 10: o compilador remove só o padding final",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando o uso de packed numa struct se justifica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pra casar byte a byte com um formato externo",
                            isCorrect: true,
                        },
                        {
                            text: "Pra acelerar o acesso aos campos mais usados",
                            isCorrect: false,
                        },
                        {
                            text: "Pra permitir structs maiores que uma página",
                            isCorrect: false,
                        },
                        {
                            text: "Pra impedir que o linker descarte a struct",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o custo escondido de uma struct packed?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Acessos desalinhados: mais lentos e, em ARM antigo, fatais",
                            isCorrect: true,
                        },
                        {
                            text: "O binário final cresce pra acomodar tabelas de conversão",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador desativa todas as otimizações no arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "Os campos passam a ser somente leitura em tempo de execução",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - A CPU por dentro",
    aulas: [
        {
            titulo: "O ciclo busca-decodifica-executa",
            blocks: [
                {
                    type: "text",
                    value: "# O loop eterno\n\nTire as camadas todas (framework, linguagem, sistema operacional) e o que sobra é uma máquina simples repetindo três passos pra sempre: BUSCAR a próxima instrução na memória, DECODIFICAR o que ela pede, EXECUTAR. Esse é o ciclo de instrução, e um processador de 3 GHz repete variações dele cerca de 3 bilhões de vezes por segundo, um passo a cada 0,33 nanossegundo.\n\nO maestro é um registrador especial: o PC, program counter (em x86-64 chamado RIP), que guarda o ENDEREÇO da próxima instrução. Na arquitetura de von Neumann, a dos computadores comuns, instruções e dados moram na MESMA memória: o seu programa é um monte de bytes como qualquer outro, e o PC aponta pra dentro dele.\n\nBuscar é ler a memória no endereço do PC. Decodificar é a unidade de controle interpretar os bytes: qual operação, quais operandos. Executar é acionar a ULA pra calcular, ou a unidade de memória pra ler e escrever, ou reescrever o próprio PC, que é como todo salto funciona. Se não houve salto, o PC avança pro início da instrução seguinte, e o ciclo recomeça.",
                },
                {
                    type: "table",
                    value: '[["Etapa","O que acontece","Quem age"],["Busca","lê a instrução no endereço do PC","unidade de busca e memória"],["Decodificação","identifica operação e operandos","unidade de controle"],["Execução","calcula, acessa memória ou salta","ULA e unidades de acesso"],["Avanço","PC recebe a próxima posição ou o alvo do salto","o próprio PC"]]',
                },
                {
                    type: "code",
                    value: "; o processador visto de cima, em pseudocodigo\nenquanto ligado:\n    instrucao = memoria[PC]               ; busca\n    op, operandos = decodifica(instrucao) ; decodifica\n    executa(op, operandos)                ; pode reescrever o PC (salto)\n    se nao houve salto:\n        PC = PC + tamanho(instrucao)      ; avanca pra proxima",
                },
                {
                    type: "text",
                    value: "## Código é dado, e isso muda tudo\n\nQuando você executa um programa, o sistema operacional copia o binário pra memória e aponta o PC pro ponto de entrada. A partir daí a CPU não sabe que existe um programa: ela conhece UMA instrução por vez, a que o PC aponta agora. Funções, objetos, módulos: tudo isso é organização SUA; pra máquina existe só a sequência de instruções e os saltos entre elas.\n\nDessa ideia saem consequências práticas. Um if é uma instrução de salto condicional: escolher pra onde o PC vai. Uma chamada de função é um salto que anota o endereço de volta. Um loop é um salto pra trás. E as interrupções de hardware (o teclado, o timer) funcionam desviando o PC pra uma rotina do sistema e devolvendo depois, milhares de vezes por segundo, sem o seu programa perceber nada.\n\nGuarde a régua de grandeza: um ciclo a 3 GHz dura 0,33 nanossegundo. Nas próximas aulas você vai comparar tudo com esse número, e ele vai reaparecer até o fim da trilha, porque toda conversa de desempenho começa nele.",
                },
                {
                    type: "quote",
                    value: "A CPU não conhece o seu programa: conhece uma instrução, a que o PC aponta AGORA. Todo o resto (funções, classes, arquitetura) é organização sua em cima de um loop que só sabe buscar, decodificar e executar.",
                },
            ],
            questions: [
                {
                    statement: "O que o registrador PC (program counter) guarda?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O endereço da próxima instrução a executar",
                            isCorrect: true,
                        },
                        {
                            text: "O resultado da última operação aritmética",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de ciclos gastos pelo programa",
                            isCorrect: false,
                        },
                        {
                            text: "O total de instruções que o binário contém",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na arquitetura de von Neumann, onde ficam as instruções do programa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Na mesma memória que os dados, como bytes comuns",
                            isCorrect: true,
                        },
                        {
                            text: "Numa memória exclusiva, separada e inacessível",
                            isCorrect: false,
                        },
                        {
                            text: "Dentro dos registradores, carregadas no boot",
                            isCorrect: false,
                        },
                        {
                            text: "No disco, lidas uma a uma durante a execução",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No nível da máquina, o que é um salto (jump)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma escrita de novo endereço no registrador PC",
                            isCorrect: true,
                        },
                        {
                            text: "Uma cópia do programa pra outra área da memória",
                            isCorrect: false,
                        },
                        {
                            text: "Uma pausa do processador até o próximo ciclo",
                            isCorrect: false,
                        },
                        {
                            text: "Uma troca do conteúdo entre dois registradores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa, na prática, um processador de 3 GHz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cerca de 3 bilhões de ciclos por segundo",
                            isCorrect: true,
                        },
                        {
                            text: "Três bilhões de acessos à RAM por segundo",
                            isCorrect: false,
                        },
                        {
                            text: "Três gigabytes processados a cada segundo",
                            isCorrect: false,
                        },
                        {
                            text: "O triplo da velocidade de um barramento comum",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a ideia de que código é dado importa pro funcionamento real?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O binário é carregado na memória como bytes comuns",
                            isCorrect: true,
                        },
                        {
                            text: "O processador recompila o programa a cada execução",
                            isCorrect: false,
                        },
                        {
                            text: "Os dados podem calcular resultados sem instruções",
                            isCorrect: false,
                        },
                        {
                            text: "O PC guarda uma cópia inteira do código executável",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Registradores e ULA",
            blocks: [
                {
                    type: "text",
                    value: "# A bancada de trabalho da CPU\n\nRegistradores são a memória DENTRO do processador: pouquíssimos valores, acesso no mesmo ciclo da instrução, na prática custo zero. Em x86-64 são 16 registradores de uso geral de 64 bits (rax, rbx, rcx, rdx, rsi, rdi, rbp, rsp e r8 a r15); em ARM64, 31. Compare com os bilhões de bytes da RAM, que ficam a 200 ou 300 ciclos de distância, e a assimetria salta aos olhos.\n\nPor que tão poucos? Física e formato. Rápido exige PERTO: os registradores vivem colados na ULA, com sinais elétricos percorrendo distâncias mínimas dentro do chip. E cada instrução precisa dizer QUAIS registradores usa: com 16, bastam 4 bits por operando dentro da codificação da instrução; com milhares, cada instrução incharia.\n\nA ULA (unidade lógica e aritmética) é o circuito que faz as contas: soma, subtração, AND, OR, XOR, shifts, comparações. O padrão de trabalho é claro: carregar valores da memória pra registradores, operar SEMPRE entre registradores na ULA, devolver o resultado pra memória só quando necessário. Uma soma entre registradores executa em 1 ciclo; é o degrau mais rápido que existe na máquina inteira.",
                },
                {
                    type: "table",
                    value: '[["Recurso","Quantidade","Latência de acesso"],["Registradores (x86-64)","16 de uso geral","mesmo ciclo, cerca de 0,3 ns"],["Registradores (ARM64)","31 de uso geral","mesmo ciclo"],["Cache L1","32 a 64 KiB","cerca de 4 ciclos"],["RAM","gigabytes","200 a 300 ciclos"]]',
                },
                {
                    type: "text",
                    value: "## Quem decide o que mora ali: o compilador\n\nVocê não escolhe registradores em C ou C++: quem faz a ALOCAÇÃO DE REGISTRADORES é o compilador, e essa é uma das partes mais valiosas da otimização. As variáveis mais usadas do trecho quente vivem em registradores; quando as variáveis vivas ao mesmo tempo são mais que os registradores disponíveis, o excedente DERRAMA pra pilha (spill), e cada uso vira um acesso à memória.\n\nIsso explica um fenômeno que você talvez já tenha visto: uma função pequena e enxuta, com poucas variáveis simultaneamente vivas, roda desproporcionalmente rápido, porque o miolo inteiro cabe em registradores. Funções gigantes com dezenas de variáveis vivas forçam spill, e o custo da memória aparece na conta.\n\nNo assembly, os registradores são explícitos: add rax, rbx soma rbx em rax; a ULA executa, o resultado fica em rax, nenhuma memória envolvida. Ler trechos assim (a próxima aula treina exatamente isso) revela quanta memória o compilador conseguiu EVITAR: bom código de máquina é o que quase não toca a RAM, e a diferença entre tocar e não tocar é o assunto central do módulo 4.",
                },
                {
                    type: "code",
                    value: "; soma = a + b, com a ULA operando so entre registradores\nmov rax, [a]      ; carrega a da memoria pro registrador rax\nmov rbx, [b]      ; carrega b pro registrador rbx\nadd rax, rbx      ; ULA soma: resultado em rax (1 ciclo)\nmov [soma], rax   ; devolve pra memoria apenas no final",
                },
                {
                    type: "quote",
                    value: "Registradores são o topo absoluto da hierarquia: tão rápidos que custam zero, tão poucos que viram disputa. Boa parte do trabalho de um compilador otimizador é decidir QUEM merece morar ali a cada instante.",
                },
            ],
            questions: [
                {
                    statement: "De onde a ULA pega os operandos no padrão de trabalho da CPU?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dos registradores, carregados antes da conta",
                            isCorrect: true,
                        },
                        {
                            text: "Direto do disco, pra economizar a memória RAM",
                            isCorrect: false,
                        },
                        {
                            text: "Da cache L3, o nível mais próximo da unidade",
                            isCorrect: false,
                        },
                        {
                            text: "Do program counter, que acumula os valores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quantos registradores de uso geral o x86-64 oferece?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dezesseis, de rax e parentes até r8 a r15",
                            isCorrect: true,
                        },
                        {
                            text: "Oito, herdados sem mudança do 386 original",
                            isCorrect: false,
                        },
                        {
                            text: "Sessenta e quatro, um por bit de largura",
                            isCorrect: false,
                        },
                        {
                            text: "Milhares, alocados conforme a demanda",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que os registradores são tão poucos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Rápido exige perto, e faltam bits na instrução",
                            isCorrect: true,
                        },
                        {
                            text: "O silício deles é raro e caro demais de fabricar",
                            isCorrect: false,
                        },
                        {
                            text: "O sistema operacional limita o uso por processo",
                            isCorrect: false,
                        },
                        {
                            text: "Mais registradores esquentariam o chip até queimar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é o spill de registradores?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Variáveis excedentes vão pra pilha quando falta registrador",
                            isCorrect: true,
                        },
                        {
                            text: "O vazamento elétrico entre registradores vizinhos no die",
                            isCorrect: false,
                        },
                        {
                            text: "A cópia preventiva dos registradores a cada interrupção",
                            isCorrect: false,
                        },
                        {
                            text: "O descarte do resultado sempre que a ULA detecta overflow",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que uma função com poucas variáveis vivas tende a ser rápida?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O miolo inteiro cabe em registradores, sem spill",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador remove funções pequenas do binário",
                            isCorrect: false,
                        },
                        {
                            text: "Funções curtas recebem prioridade no escalonador",
                            isCorrect: false,
                        },
                        {
                            text: "A ULA reserva um modo turbo pra blocos pequenos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Um assembly de brinquedo",
            blocks: [
                {
                    type: "text",
                    value: "# Quatro instruções bastam\n\nPra aprender a ler assembly não é preciso decorar manuais: com quatro instruções você já traça programas de verdade. Nosso processador de brinquedo tem quatro registradores, R0 a R3, e este vocabulário: MOV destino, origem copia um valor (a origem pode ser número ou registrador); ADD destino, origem soma a origem no destino; CMP a, b compara e guarda o resultado nas FLAGS; e os saltos JMP (incondicional) e JLE (salta se a comparação deu menor ou igual).\n\nO CMP merece atenção especial: ele não devolve valor em registrador nenhum. Ele faz a subtração de a menos b por baixo dos panos e liga flags como zero e negativo. O salto condicional que vem DEPOIS lê essas flags pra decidir se muda o PC. Todo if que você já escreveu na vida compila pra esse par: uma comparação, um salto condicional.\n\nAbaixo, um programa completo: somar os inteiros de 1 a 5. R0 acumula a soma, R1 é o contador. Leia linha a linha antes de olhar a tabela de rastreio; o rótulo laco marca o endereço pra onde o JLE volta.",
                },
                {
                    type: "code",
                    value: "        MOV R0, 0      ; soma comeca em zero\n        MOV R1, 1      ; contador i comeca em 1\nlaco:   ADD R0, R1     ; soma = soma + i\n        ADD R1, 1      ; i = i + 1\n        CMP R1, 5      ; compara i com 5, liga as flags\n        JLE laco       ; se i <= 5, volta pro rotulo laco\n        ; fim: R0 contem 15",
                },
                {
                    type: "table",
                    value: '[["Passada","R0 (soma) após ADD","R1 (i) após ADD","CMP R1, 5: salta?"],["1","1","2","2 <= 5, salta"],["2","3","3","3 <= 5, salta"],["3","6","4","4 <= 5, salta"],["4","10","5","5 <= 5, salta"],["5","15","6","6 > 5, segue em frente"]]',
                },
                {
                    type: "text",
                    value: "## Como traçar na mão sem se perder\n\nTraçar é fingir que você é o PC: uma linha por vez, anotando os registradores após cada instrução. A disciplina importa mais que a pressa: quem pula linhas erra o resultado, e o erro clássico é esquecer que o corpo executa uma última vez quando i chega a 5, porque 5 <= 5 é verdadeiro. O JLE ainda salta, o corpo soma o 5, e só na passada seguinte, com i valendo 6, o fluxo segue em frente com R0 valendo 15.\n\nRepare no que o exercício ensina sobre linguagens de verdade: um for é açúcar sintático pra exatamente isso: inicialização, corpo, incremento, comparação e salto pra trás. Quando o depurador mostrar o assembly de um loop em C, é essa estrutura que você vai reconhecer, com registradores reais no lugar de R0 e R1.\n\nTraçar dez linhas de assembly na mão, uma vez na vida, com tabela e lápis, vale mais que ler dez artigos sobre o assunto: o modelo mental de máquina de estados fica plantado e não sai mais.",
                },
                {
                    type: "quote",
                    value: "Traçar assembly é fingir ser o PC com um lápis na mão: uma linha, um estado novo. É lento de propósito; a lentidão é exatamente o que grava o modelo mental.",
                },
            ],
            questions: [
                {
                    statement: "O que faz a instrução MOV R0, 0 no nosso processador de brinquedo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Coloca o valor imediato 0 dentro do registrador R0",
                            isCorrect: true,
                        },
                        {
                            text: "Compara o registrador R0 com o valor 0 e liga flags",
                            isCorrect: false,
                        },
                        {
                            text: "Move o conteúdo de R0 pra posição 0 da memória principal",
                            isCorrect: false,
                        },
                        {
                            text: "Salta pra instrução de endereço 0 se R0 estiver zerado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a instrução CMP produz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Flags de comparação que o salto seguinte consulta",
                            isCorrect: true,
                        },
                        {
                            text: "Um valor booleano gravado no primeiro operando",
                            isCorrect: false,
                        },
                        {
                            text: "A diferença dos operandos gravada num registrador",
                            isCorrect: false,
                        },
                        {
                            text: "Um salto imediato pro rótulo indicado na linha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Ao final do programa de soma, qual é o valor de R0?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "R0 termina com 15, a soma dos inteiros de 1 a 5",
                            isCorrect: true,
                        },
                        {
                            text: "R0 termina com 10, porque o 5 não entra na soma",
                            isCorrect: false,
                        },
                        {
                            text: "R0 termina com 21, somando também o valor 6",
                            isCorrect: false,
                        },
                        {
                            text: "R0 termina com 5, o último valor do contador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quantas vezes o corpo do laço (o ADD R0, R1) executa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cinco vezes: com i valendo 1, 2, 3, 4 e 5",
                            isCorrect: true,
                        },
                        {
                            text: "Quatro vezes: o laço para quando i chega a 5",
                            isCorrect: false,
                        },
                        {
                            text: "Seis vezes: o corpo ainda roda com i valendo 6",
                            isCorrect: false,
                        },
                        {
                            text: "Uma vez: o JLE salta direto pro fim do programa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Trocando JLE por JL (salta só se menor), o que muda no resultado?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O laço para com i em 5 e a soma termina em 10",
                            isCorrect: true,
                        },
                        {
                            text: "Nada muda: JL e JLE são apelidos da mesma operação",
                            isCorrect: false,
                        },
                        {
                            text: "O laço vira infinito, porque a flag nunca é ligada",
                            isCorrect: false,
                        },
                        {
                            text: "A soma termina em 21, com uma passada a mais no corpo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Pipeline e previsão de desvio",
            blocks: [
                {
                    type: "text",
                    value: "# A linha de montagem de instruções\n\nExecutar uma instrução inteira antes de buscar a próxima desperdiça a fábrica: enquanto a ULA calcula, a unidade de busca está ociosa. A solução, consagrada desde os anos 80, é o PIPELINE: dividir o ciclo em estágios e processar várias instruções ao mesmo tempo, cada uma num estágio diferente, como numa linha de montagem.\n\nO pipeline clássico didático tem 5 estágios: busca (IF), decodificação (ID), execução (EX), acesso à memória (MEM) e escrita do resultado (WB). Processadores reais de 2026 usam de 14 a 20 estágios, com múltiplas instruções POR estágio (o superescalar), mas a lógica é a mesma: com o pipeline cheio, uma instrução TERMINA por ciclo, mesmo que cada uma leve vários ciclos do começo ao fim.\n\nA diferença entre vazão e latência é a alma da ideia: a latência de uma instrução continua sendo o tempo de atravessar todos os estágios; a VAZÃO é quantas terminam por segundo. O pipeline não acelera uma instrução; acelera o fluxo delas. E tudo funciona lindamente enquanto a fábrica souber QUAL é a próxima instrução, o que nos leva ao problema dos desvios.",
                },
                {
                    type: "table",
                    value: '[["Estágio","Sigla","O que faz"],["Busca","IF","lê a instrução da memória"],["Decodificação","ID","interpreta e lê registradores"],["Execução","EX","a ULA calcula"],["Memória","MEM","lê ou escreve dados"],["Escrita","WB","grava o resultado no registrador"]]',
                },
                {
                    type: "text",
                    value: "## O preço de adivinhar errado\n\nNum salto condicional, o próximo endereço só se confirma quando a comparação executa, vários estágios adiante. Esperar pararia a fábrica a cada if. A solução dos processadores modernos é APOSTAR: o previsor de desvios chuta o rumo com base no histórico daquele salto, e o pipeline segue buscando instruções do caminho apostado, especulativamente.\n\nAcertou (e em código típico o previsor acerta acima de 95%), custo zero. ERROU: tudo que entrou depois da aposta é descartado, o pipeline esvazia e recomeça do caminho certo: 15 a 20 ciclos jogados fora, o equivalente a dezenas de somas.\n\nA consequência pro seu código é direta: desvio PREVISÍVEL é quase de graça, desvio aleatório é caro. Um laço que quase sempre continua é previsível. Um if cuja condição depende de dado aleatório (metade vai, metade vem) erra o chute metade das vezes, e o custo aparece: é o famoso caso do array ordenado que filtra mais rápido que o desordenado, que o módulo 6 vai medir com números. Por ora, guarde o princípio: a CPU aposta no passado recente; padrão ajuda, caos custa.",
                },
                {
                    type: "code",
                    value: "// desvio previsivel: raros positivos, o previsor acerta quase sempre\nfor (int i = 0; i < n; i++)\n    if (v[i] < 0) raros++;        // quase nunca entra\n\n// desvio imprevisivel com dados aleatorios: 50% de erro de aposta\nfor (int i = 0; i < n; i++)\n    if (v[i] % 2 == 1) impares++; // moeda ao ar a cada iteracao",
                },
                {
                    type: "quote",
                    value: "O pipeline aposta que o futuro repete o passado. Quando o seu if depende de moeda ao ar, a CPU erra a aposta, joga fora o trabalho especulado e recomeça: quinze a vinte ciclos pagos em silêncio, milhões de vezes.",
                },
            ],
            questions: [
                {
                    statement: "O que o pipeline permite ao processador?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Várias instruções em andamento, uma por estágio",
                            isCorrect: true,
                        },
                        {
                            text: "Executar o programa inteiro dentro da cache L1",
                            isCorrect: false,
                        },
                        {
                            text: "Pular instruções repetidas sem executá-las",
                            isCorrect: false,
                        },
                        {
                            text: "Dobrar a frequência do clock em trechos quentes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o custo típico de uma previsão de desvio errada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "De 15 a 20 ciclos com o pipeline esvaziado",
                            isCorrect: true,
                        },
                        {
                            text: "Meio ciclo, absorvido pelo estágio de busca",
                            isCorrect: false,
                        },
                        {
                            text: "Uns 500 ciclos, o mesmo que um acesso a disco",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: o caminho errado também é aproveitado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o desvio condicional é um problema pro pipeline?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O próximo endereço só se confirma estágios depois",
                            isCorrect: true,
                        },
                        {
                            text: "Saltos exigem o dobro de registradores da ULA",
                            isCorrect: false,
                        },
                        {
                            text: "A comparação bloqueia toda escrita em memória por um ciclo",
                            isCorrect: false,
                        },
                        {
                            text: "O rótulo de destino precisa ser traduzido pelo SO",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual tipo de desvio é praticamente de graça?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O previsível, que quase sempre segue o mesmo rumo",
                            isCorrect: true,
                        },
                        {
                            text: "O que depende de dado aleatório bem distribuído",
                            isCorrect: false,
                        },
                        {
                            text: "O que fica dentro de funções curtas e enxutas",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro desvio executado após cada chamada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que filtrar um array ordenado pode ser bem mais rápido que um desordenado?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O padrão do desvio vira previsível e a aposta acerta",
                            isCorrect: true,
                        },
                        {
                            text: "Arrays ordenados ficam guardados na cache L1 inteira",
                            isCorrect: false,
                        },
                        {
                            text: "A ordenação compacta os elementos em menos memória",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador remove o if quando o array é ordenado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "ISAs em 2026: x86-64, ARM e RISC-V",
            blocks: [
                {
                    type: "text",
                    value: "# ISA: o contrato entre software e silício\n\nISA (instruction set architecture) é o CONTRATO: o conjunto de instruções, registradores e regras de memória que o software pode usar. Microarquitetura é a IMPLEMENTAÇÃO desse contrato em silício: quantos estágios de pipeline, quanta cache, como o previsor de desvios chuta. A mesma ISA aceita implementações radicalmente diferentes: um chip econômico de tablet e um monstro de servidor podem rodar exatamente o mesmo binário.\n\nO mapa de 2026 tem três nomes grandes. x86-64: ISA proprietária de Intel e AMD, dominante em desktops e na maior parte dos servidores, carregando décadas de compatibilidade. ARM: ISA licenciada (a Arm projeta, muitos fabricam), reinando em celulares, nos Apple Silicon e crescendo firme na nuvem, como nos Graviton da AWS. RISC-V: ISA ABERTA e livre de royalties, forte em microcontroladores e aceleradores, com ecossistema de servidor ainda amadurecendo em 2026.\n\nNúmeros pra calibrar: em 2026, praticamente todo smartphone roda ARM; a nuvem mistura x86-64 com uma fatia ARM relevante e crescente; e o RISC-V já embarca aos bilhões em controladores dentro de SSDs, GPUs e placas, muitas vezes sem o usuário saber.",
                },
                {
                    type: "table",
                    value: '[["ISA","Modelo","Onde domina em 2026"],["x86-64","proprietária; Intel e AMD fabricam","desktops, notebooks, muito servidor"],["ARM","licenciada; muitos fabricantes","celulares, Apple Silicon, nuvem em alta"],["RISC-V","aberta, sem royalties","microcontroladores, aceleradores, pesquisa"]]',
                },
                {
                    type: "text",
                    value: "## CISC contra RISC: uma guerra que acabou em fusão\n\nNos anos 80 a briga era real: CISC (instruções complexas, muitas formas de acessar memória, o x86 clássico) contra RISC (instruções simples e uniformes, acesso à memória só por load e store, o espírito de MIPS e ARM). Quatro décadas depois, a dicotomia virou história: o x86 moderno DECODIFICA suas instruções complexas em micro-operações internas bem RISC; o ARM acumulou extensões e instruções sofisticadas. Por dentro, os grandes chips se parecem muito mais do que os slogans sugerem.\n\nEntão como escolher em 2026? Por CRITÉRIO, não por torcida. Ecossistema de software: seus binários, bibliotecas e ferramentas existem pra essa ISA? Energia por operação: data center e bateria pagam essa conta todo dia. Licenciamento: royalties da Arm, abertura do RISC-V, exclusividade do x86. Domínio: um microcontrolador de centavos, um notebook e um servidor de 128 núcleos têm vencedores diferentes.\n\nA pergunta 'qual ISA é melhor' não tem resposta; 'qual serve este produto, com este software, neste custo' tem. Engenheiro maduro responde a segunda e ignora a primeira, porque ranking envelhece rápido e critério de escolha, não.",
                },
                {
                    type: "quote",
                    value: "CISC contra RISC foi o debate de uma geração, e a engenharia o dissolveu: o x86 decodifica pra micro-operações, o ARM ganhou músculo. Em 2026 a pergunta útil não é qual ISA vence, é qual ecossistema serve o seu problema.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma ISA?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O contrato de instruções entre software e hardware",
                            isCorrect: true,
                        },
                        {
                            text: "O circuito que decodifica instruções dentro do chip",
                            isCorrect: false,
                        },
                        {
                            text: "A frequência máxima que o processador sustenta",
                            isCorrect: false,
                        },
                        {
                            text: "O barramento que liga o processador à memória",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual ISA é aberta e livre de royalties?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "RISC-V, forte em controladores e aceleradores",
                            isCorrect: true,
                        },
                        {
                            text: "x86-64, mantida em conjunto por Intel e AMD",
                            isCorrect: false,
                        },
                        {
                            text: "ARM, desde a abertura do licenciamento em 2020",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma: toda ISA cobra royalties por fabricação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o x86 moderno faz com suas instruções complexas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Decodifica em micro-operações internas mais simples",
                            isCorrect: true,
                        },
                        {
                            text: "Executa cada uma inteira num único ciclo de clock",
                            isCorrect: false,
                        },
                        {
                            text: "Envia as mais pesadas pra um coprocessador externo",
                            isCorrect: false,
                        },
                        {
                            text: "Recusa as antigas e exige recompilar o binário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais critérios guiam a escolha de ISA num produto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ecossistema, energia, licenciamento e domínio de uso",
                            isCorrect: true,
                        },
                        {
                            text: "O ranking anual de desempenho bruto dos fabricantes",
                            isCorrect: false,
                        },
                        {
                            text: "A idade da ISA: quanto mais recente, melhor a escolha",
                            isCorrect: false,
                        },
                        {
                            text: "A contagem de instruções: quanto menos, mais rápido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a mesma ISA pode ter chips com desempenhos tão diferentes?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "ISA é contrato; a microarquitetura é a implementação",
                            isCorrect: true,
                        },
                        {
                            text: "Os fabricantes escondem instruções extras nos caros",
                            isCorrect: false,
                        },
                        {
                            text: "A ISA muda de versão a cada geração de processador",
                            isCorrect: false,
                        },
                        {
                            text: "O binário é reotimizado pelo firmware em cada chip",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - A memória",
    aulas: [
        {
            titulo: "A hierarquia de memória em números",
            blocks: [
                {
                    type: "text",
                    value: "# O abismo entre a CPU e os dados\n\nO processador executa uma soma em 0,33 nanossegundo, e a RAM entrega um dado em uns 80 a 100 nanossegundos. Se a CPU dependesse só da RAM, passaria a maior parte do tempo esperando. A resposta da engenharia é a HIERARQUIA DE MEMÓRIA: camadas cada vez maiores e mais lentas, com as pequenas e velozes escondendo as grandes e lentas.\n\nOs números típicos de um desktop em 2026: registradores respondem no próprio ciclo (0,3 ns). A cache L1, com 32 a 64 KiB por núcleo, responde em cerca de 4 ciclos (1 ns). A L2, com 256 KiB a 1 MiB, em uns 12 ciclos. A L3, compartilhada entre os núcleos, com 8 a 64 MiB, em 12 a 40 ns. A RAM, com gigabytes, em 80 a 100 ns. Um SSD NVMe responde em 50 a 100 MICROssegundos, e um HDD em 5 a 10 MILIssegundos.\n\nRepare no padrão: cada degrau multiplica a latência por algo entre 3 e 1000. Do registrador ao HDD, o fator passa de dez milhões: a mesma distância que separa um segundo de vários meses.",
                },
                {
                    type: "table",
                    value: '[["Nível","Latência típica","Tamanho típico"],["Registrador","0,3 ns (1 ciclo)","dezenas de valores"],["Cache L1","1 ns (4 ciclos)","32 a 64 KiB por núcleo"],["Cache L2","4 ns (cerca de 12 ciclos)","256 KiB a 1 MiB por núcleo"],["Cache L3","12 a 40 ns","8 a 64 MiB, compartilhada"],["RAM","80 a 100 ns","8 a 512 GiB"],["SSD NVMe","50 a 100 us","centenas de GiB a TiB"],["HDD","5 a 10 ms","terabytes"]]',
                },
                {
                    type: "text",
                    value: "## A escala humanizada\n\nNúmeros pequenos demais enganam a intuição, então vamos esticar tudo: imagine que um ciclo (0,33 ns) durasse UM SEGUNDO. Nessa escala, a L1 responde em 4 segundos: pegar algo na sua mesa. A L2, em 12 segundos: abrir a gaveta ao lado. A RAM, em uns 5 minutos: descer até a cozinha. O SSD NVMe, em dois ou três DIAS: esperar uma encomenda expressa. O HDD, em torno de NOVE MESES: uma gestação inteira pra buscar um dado.\n\nEssa escala explica por que a hierarquia funciona: programas reais têm LOCALIDADE. Localidade temporal: o que você acabou de usar tende a ser usado de novo em breve. Localidade espacial: os vizinhos do que você usou tendem a ser os próximos da fila. As caches apostam nessas duas tendências, guardando o recente e trazendo os vizinhos junto, e acertam com frequência altíssima em código bem comportado.\n\nO resto do módulo desce essa escada degrau por degrau: pilha, heap, cache e memória virtual. A régua de latências desta aula é a referência de tudo; volte aqui sempre que um número parecer abstrato demais.",
                },
                {
                    type: "quote",
                    value: "Se um ciclo durasse um segundo, a RAM responderia em cinco minutos e o HDD em nove meses. Toda a engenharia de cache existe pra você nunca perceber esse abismo.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a ordem correta, do acesso mais rápido pro mais lento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Registrador, caches L1 a L3, RAM, SSD NVMe e HDD",
                            isCorrect: true,
                        },
                        {
                            text: "RAM, registrador, caches L1 a L3, SSD NVMe e HDD",
                            isCorrect: false,
                        },
                        {
                            text: "Registrador, RAM, caches L1 a L3, HDD e SSD NVMe",
                            isCorrect: false,
                        },
                        {
                            text: "Caches L1 a L3, registrador, RAM, SSD NVMe e HDD",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a latência típica de um acesso à RAM num desktop?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uns 80 a 100 nanossegundos, centenas de ciclos",
                            isCorrect: true,
                        },
                        {
                            text: "Uns 80 a 100 picossegundos, menos de um ciclo",
                            isCorrect: false,
                        },
                        {
                            text: "Uns 80 a 100 microssegundos, como um SSD rápido",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 4 ciclos, empatada com a cache L1",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Aproximadamente quantas vezes a RAM é mais lenta que a cache L1?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cerca de cem vezes: uns 100 ns contra cerca de 1 ns",
                            isCorrect: true,
                        },
                        {
                            text: "Cerca de duas vezes: os dois ficam no mesmo chip",
                            isCorrect: false,
                        },
                        {
                            text: "Dez mil vezes: a RAM responde em microssegundos",
                            isCorrect: false,
                        },
                        {
                            text: "Dez por cento mais lenta, uma diferença marginal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que não fabricar toda a memória com a velocidade da L1?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Memória rápida precisa ser pequena, próxima e cara",
                            isCorrect: true,
                        },
                        {
                            text: "A L1 só funciona com os dados do sistema operacional",
                            isCorrect: false,
                        },
                        {
                            text: "O barramento aceita apenas um nível rápido por vez",
                            isCorrect: false,
                        },
                        {
                            text: "Memória rápida perde os dados quando o chip esquenta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a hierarquia de memória funciona tão bem na prática?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Programas têm localidade temporal e espacial",
                            isCorrect: true,
                        },
                        {
                            text: "Os dados são comprimidos a cada degrau da descida",
                            isCorrect: false,
                        },
                        {
                            text: "O sistema copia a RAM inteira pras caches no boot",
                            isCorrect: false,
                        },
                        {
                            text: "As caches preveem o futuro lendo o binário antes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A stack: frames de graça",
            blocks: [
                {
                    type: "text",
                    value: "# A pilha: velocidade por simplicidade\n\nCada thread ganha do sistema uma região contígua de memória chamada PILHA (stack), com uns 8 MiB por padrão no Linux. Um registrador dedicado, o rsp em x86-64, aponta pro TOPO. Quando uma função é chamada, ela empurra ali o seu FRAME: endereço de retorno, registradores a preservar e variáveis locais. Quando a função retorna, o frame evapora.\n\nO segredo da velocidade é que alocar na pilha é UMA SUBTRAÇÃO: sub rsp, 32 reserva 32 bytes, um ciclo. Liberar é a soma de volta, implícita no retorno: zero contabilidade, zero busca por espaço livre, zero fragmentação. Compare com o heap da próxima aula, que precisa procurar espaço e anotar tamanhos a cada pedido.\n\nE tem mais: como toda chamada usa o mesmo topo, essa região é REUTILIZADA o tempo inteiro e vive quente na cache L1. Variável local não é só barata de criar: é barata de acessar. É por isso que a recomendação padrão em C e C++ é preferir variáveis locais, e só sair da pilha quando o dado precisa sobreviver à função ou é grande demais pra ela.",
                },
                {
                    type: "table",
                    value: '[["Propriedade","Como a pilha se comporta"],["Alocação","subtrair o ponteiro do topo: cerca de 1 ciclo"],["Liberação","automática no retorno da função"],["Tamanho","limitado: 8 MiB por padrão no Linux"],["Vida útil do dado","termina quando a função retorna"],["Cache","topo reutilizado, quase sempre quente"]]',
                },
                {
                    type: "text",
                    value: "## Quando a pilha acaba\n\nO limite existe e cobra. ESTOURO DE PILHA (stack overflow) acontece por dois caminhos clássicos. Recursão sem caso base, ou funda demais: cada chamada empilha um frame, e milhões de frames passam dos 8 MiB; o programa morre com SIGSEGV. Variáveis locais gigantes: um int m[2000][2000] são 16 MB no frame, o dobro do limite inteiro, e a função quebra logo ao ser chamada.\n\nO sistema detecta o estouro com uma PÁGINA DE GUARDA: uma página inacessível logo além do fim da pilha; tocar nela dispara a falha na hora, em vez de deixar a pilha invadir memória alheia em silêncio.\n\nAs regras práticas que saem disso: arrays grandes vão pro heap (ou pra um std::vector, que guarda os dados no heap); recursão profunda vira iteração ou ganha limite explícito; e cada thread nova custa a própria pilha, um custo de memória que times esquecem ao criar mil threads. Quando o depurador mostrar um stack trace, você vai enxergar exatamente essa estrutura: a lista dos frames vivos, do main até a função do topo.",
                },
                {
                    type: "code",
                    value: "void quebra_por_local(void) {\n    int enorme[2000][2000];    // 16 MB num frame: estoura os 8 MiB\n    enorme[0][0] = 1;\n}\n\nint fatorial_sem_base(int n) { // sem caso base: frames sem fim\n    return n * fatorial_sem_base(n - 1);\n}\n\nint fatorial(int n) {          // com caso base: profundidade sob controle\n    return n <= 1 ? 1 : n * fatorial(n - 1);\n}",
                },
                {
                    type: "quote",
                    value: "A pilha é rápida porque é burra: alocar é subtrair um número, liberar é esquecer que ele existiu. Toda a esperteza que o heap precisa carregar (procurar espaço, anotar tamanhos), a pilha simplesmente dispensa.",
                },
            ],
            questions: [
                {
                    statement: "O que compõe o frame de uma função na pilha?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Endereço de retorno, registradores salvos e locais",
                            isCorrect: true,
                        },
                        {
                            text: "O código de máquina da função e suas constantes",
                            isCorrect: false,
                        },
                        {
                            text: "A tabela de símbolos exportados pelo executável",
                            isCorrect: false,
                        },
                        {
                            text: "Uma cópia dos argumentos de todas as chamadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o tamanho padrão da pilha de uma thread no Linux?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uns 8 MiB por padrão, ajustáveis com o ulimit",
                            isCorrect: true,
                        },
                        {
                            text: "Uns 8 KiB fixos, iguais em qualquer sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Metade da RAM, dividida entre as threads",
                            isCorrect: false,
                        },
                        {
                            text: "Ilimitado: a pilha cresce até a RAM acabar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que alocar na pilha custa cerca de um ciclo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Basta subtrair o tamanho do ponteiro do topo",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador pré-aloca tudo em tempo de build",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel reserva as páginas antes da chamada",
                            isCorrect: false,
                        },
                        {
                            text: "A pilha vive inteira dentro dos registradores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que costuma causar estouro de pilha?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Recursão funda demais ou variáveis locais gigantes",
                            isCorrect: true,
                        },
                        {
                            text: "Muitos malloc seguidos sem os free correspondentes",
                            isCorrect: false,
                        },
                        {
                            text: "Ponteiros lidos depois do free virarem inválidos",
                            isCorrect: false,
                        },
                        {
                            text: "Threads demais compartilhando os mesmos frames",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a pilha costuma estar quente na cache?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O mesmo topo é reutilizado a cada chamada e retorno",
                            isCorrect: true,
                        },
                        {
                            text: "O hardware fixa a pilha inteira dentro da cache L1",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel pré-carrega a pilha a cada troca de contexto",
                            isCorrect: false,
                        },
                        {
                            text: "As páginas da pilha nunca são enviadas pro swap em disco",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O heap e o alocador",
            blocks: [
                {
                    type: "text",
                    value: "# O heap: liberdade com contabilidade\n\nNem todo dado cabe no ciclo de vida de uma função: o objeto criado agora pode precisar viver até o fim do programa, e o tamanho pode só ser conhecido em execução. Pra isso existe o HEAP: uma região de onde você pede blocos (malloc em C, new em C++) e devolve quando quiser (free, delete).\n\nQuem administra é o ALOCADOR, uma biblioteca em espaço de usuário (ptmalloc na glibc, jemalloc, tcmalloc). Ele mantém listas de blocos livres organizadas por tamanho, divide e funde blocos vizinhos, e quando o estoque acaba pede páginas novas ao kernel (via brk ou mmap). O free devolve o bloco pro alocador, não pro sistema: o alocador guarda pra reutilizar depois.\n\nEssa contabilidade tem preço, e um preço VARIÁVEL: no caminho rápido (um bloco do tamanho certo esperando na lista), malloc custa 20 a 100 ns; no caminho lento (pedir memória nova ao kernel), microssegundos. É essa variância, mais que a média, que incomoda em código sensível a latência: o mesmo malloc que custou 30 ns numa chamada custa 3000 na pior hora.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Stack","Heap"],["Alocação","1 ciclo, subtrair ponteiro","20 a 100 ns; pior caso em us"],["Liberação","automática no retorno","manual: free ou delete"],["Tamanho","8 MiB por thread","limitado pela RAM"],["Vida útil","o escopo da função","até você liberar"],["Fragmentação","não existe","existe e cresce com o uso"]]',
                },
                {
                    type: "text",
                    value: "## Fragmentação: o imposto do tempo\n\nAloque e libere blocos de tamanhos variados por horas e o mapa do heap vira um queijo suíço. FRAGMENTAÇÃO EXTERNA: há 100 MB livres no total, mas espalhados em pedaços de 2 MB, e um malloc de 10 MB contíguos falha ou força pedir mais memória ao sistema. FRAGMENTAÇÃO INTERNA: o alocador trabalha com classes de tamanho e arredonda pra cima; você pediu 33 bytes, o bloco real tem 48, e a diferença é desperdício invisível.\n\nServiços de vida longa sentem isso como memória residente que só cresce, mesmo sem vazamento. As defesas: reutilizar buffers em vez de alocar e liberar no loop quente; pools e arenas (alocar um blocão, fatiar, liberar tudo de uma vez); dimensionar containers de antemão.\n\nE os dois pecados capitais da memória manual: o VAZAMENTO, alocar e nunca liberar, que mata o processo por exaustão; e o USE-AFTER-FREE, usar o ponteiro depois de liberar, que corrompe dados e vira vulnerabilidade de segurança. Ferramentas como AddressSanitizer e Valgrind caçam os dois, e linguagens com GC ou ownership trocam esses riscos por outros custos.",
                },
                {
                    type: "code",
                    value: "#include <stdlib.h>\n\nint *v = malloc(1000 * sizeof(int));  // caminho rapido: 20 a 100 ns\nif (v == NULL) {                      // caminho lento: pediu ao kernel\n    return 1;                         // e mesmo assim pode faltar\n}\nv[0] = 42;\nfree(v);   // devolve ao ALOCADOR; o kernel pode nem ficar sabendo\n// v agora esta pendurado: usar v[0] aqui e use-after-free",
                },
                {
                    type: "quote",
                    value: "O malloc não tem preço de tabela: às vezes é uma lista respondendo em nanossegundos, às vezes é uma viagem ao kernel. Código sensível a latência trata alocação como evento raro, não como rotina do loop.",
                },
            ],
            questions: [
                {
                    statement: "Quando o heap é a escolha certa em vez da pilha?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quando o dado precisa viver além da função",
                            isCorrect: true,
                        },
                        {
                            text: "Quando a variável é usada dentro de um laço",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o valor cabe em menos de oito bytes",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a função é chamada uma única vez",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quem administra malloc e free?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O alocador, uma biblioteca em espaço de usuário",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel, que confere cada alocação por syscall",
                            isCorrect: false,
                        },
                        {
                            text: "O hardware, com uma tabela de blocos no chip",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador, que resolve os tamanhos no build",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é fragmentação externa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Espaço livre total grande, mas espalhado em pedaços",
                            isCorrect: true,
                        },
                        {
                            text: "Blocos arredondados pra cima pelas classes de tamanho",
                            isCorrect: false,
                        },
                        {
                            text: "Páginas do heap enviadas pro swap pelo sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Memória perdida por ponteiros que nunca são liberados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o custo de um malloc varia tanto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O caminho rápido usa a lista; o lento pede ao kernel",
                            isCorrect: true,
                        },
                        {
                            text: "O tamanho pedido muda a velocidade da cópia dos dados",
                            isCorrect: false,
                        },
                        {
                            text: "O alocador sorteia a posição do bloco por segurança",
                            isCorrect: false,
                        },
                        {
                            text: "A CPU reduz a frequência durante alocações longas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que evitar malloc e free dentro de um loop de latência crítica?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O pior caso desce ao kernel e estoura o orçamento",
                            isCorrect: true,
                        },
                        {
                            text: "O malloc trava todas as outras threads do processo",
                            isCorrect: false,
                        },
                        {
                            text: "Alocações em loop são recusadas pelos alocadores",
                            isCorrect: false,
                        },
                        {
                            text: "O free dentro de laços força uma syscall por chamada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Cache na prática: linhas e localidade",
            blocks: [
                {
                    type: "text",
                    value: "# A unidade é a linha, não o byte\n\nO cache não busca o byte que você pediu: busca a LINHA de 64 bytes em que ele mora. Errou o cache (miss), a linha inteira sobe da RAM; os 63 vizinhos vêm de carona. Esse desenho aposta nas duas localidades da primeira aula: quem usou um endereço vai usar os vizinhos (espacial) e vai voltar no mesmo dado em breve (temporal).\n\nFaça a conta com um array de int (4 bytes): cabem 16 por linha. Percorrendo em sequência, um miss abastece os 15 acessos seguintes: 1 miss a cada 16. E o prefetcher de hardware, ao ver o padrão sequencial, começa a buscar as PRÓXIMAS linhas antes de você pedir, escondendo ainda mais a latência da RAM.\n\nAgora quebre o padrão: pule de 16 em 16 KiB e cada acesso cai numa linha nova e fria: 1 miss POR acesso, com o prefetcher perdido, sem padrão pra seguir. Mesma quantidade de trabalho útil, dezenas de vezes mais espera. É exatamente essa diferença que o experimento abaixo mede com uma matriz de verdade.",
                },
                {
                    type: "table",
                    value: '[["Percurso na matriz","Padrão de acesso","Misses por elemento","Tempo típico (64 MiB)"],["Por linhas","sequencial, passo de 4 bytes","1 a cada 16","cerca de 15 ms"],["Por colunas","salto de 16 KiB por acesso","cerca de 1","cerca de 120 ms"]]',
                },
                {
                    type: "code",
                    value: "#define N 4096\nstatic int m[N][N];             // 64 MiB: nao cabe em cache nenhuma\nlong soma = 0;\n\n// por LINHAS: vizinho apos vizinho, prefetcher feliz (~15 ms)\nfor (int i = 0; i < N; i++)\n    for (int j = 0; j < N; j++) soma += m[i][j];\n\n// por COLUNAS: cada acesso pula 16 KiB, quase todo acesso e miss (~120 ms)\nfor (int j = 0; j < N; j++)\n    for (int i = 0; i < N; i++) soma += m[i][j];",
                },
                {
                    type: "text",
                    value: "## O que muda no seu código\n\nOs dois laços acima fazem A MESMA conta e diferem só na ordem dos índices; numa máquina comum, o segundo é 5 a 10 vezes mais lento. Em C, matrizes vivem por linhas (row-major): m[i][j] e m[i][j+1] são vizinhos; m[i][j] e m[i+1][j] estão a 16 KiB de distância. A regra sai de graça: percorra na ordem em que a memória está arrumada, com o índice mais à direita variando mais rápido.\n\nA mesma lógica julga estruturas de dados: um array contíguo alimenta o cache; uma lista ligada com nós espalhados pelo heap transforma cada passo num possível miss (o módulo 6 põe números nisso). Structs também: campos usados juntos deviam morar juntos, pra dividirem a mesma linha de cache.\n\nPra medir em vez de supor: perf stat -e cache-misses no Linux mostra os misses do programa inteiro, e a diferença entre as duas versões do laço aparece na casa dos milhões. Rode uma vez na sua máquina; o número convence mais que qualquer parágrafo.",
                },
                {
                    type: "quote",
                    value: "O cache nunca busca o SEU byte: busca a linha de 64 em que ele mora. Programa rápido é o que usa os outros 63 antes de pedir a próxima linha.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o tamanho típico de uma cache line?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "64 bytes, a unidade que sobe da RAM de uma vez",
                            isCorrect: true,
                        },
                        {
                            text: "4 KiB, o mesmo tamanho de uma página de memória",
                            isCorrect: false,
                        },
                        {
                            text: "8 bytes, a largura de um registrador de 64 bits",
                            isCorrect: false,
                        },
                        {
                            text: "1 byte, buscado individualmente por endereço",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é localidade espacial?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A tendência de usar os vizinhos do dado recente",
                            isCorrect: true,
                        },
                        {
                            text: "A tendência de reusar o mesmo dado várias vezes",
                            isCorrect: false,
                        },
                        {
                            text: "A garantia de que arrays ficam sempre em cache",
                            isCorrect: false,
                        },
                        {
                            text: "A distância física entre a CPU e o pente de RAM",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que somar a matriz por colunas é muito mais lento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada acesso pula 16 KiB e cai numa linha fria",
                            isCorrect: true,
                        },
                        {
                            text: "A conta por colunas envolve mais multiplicações",
                            isCorrect: false,
                        },
                        {
                            text: "O processador proíbe saltos maiores que 4 KiB por acesso",
                            isCorrect: false,
                        },
                        {
                            text: "Os elementos das colunas ficam gravados no disco",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quantos ints de 4 bytes cabem numa cache line de 64 bytes?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dezesseis: um miss abastece os quinze seguintes",
                            isCorrect: true,
                        },
                        {
                            text: "Oito: metade da linha fica reservada pra tags",
                            isCorrect: false,
                        },
                        {
                            text: "Trinta e dois: a linha comprime inteiros pequenos",
                            isCorrect: false,
                        },
                        {
                            text: "Quatro: cada int ocupa dezesseis bytes alinhados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um array de 4 MiB é percorrido mil vezes numa máquina com L3 de 32 MiB. Por que as passadas seguintes são rápidas?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ele cabe na cache e as passadas seguintes reusam",
                            isCorrect: true,
                        },
                        {
                            text: "O prefetcher decora o array e responde pela RAM",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador funde as mil passadas numa única",
                            isCorrect: false,
                        },
                        {
                            text: "A primeira passada comprime os dados na memória",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Memória virtual: páginas, TLB e faults",
            blocks: [
                {
                    type: "text",
                    value: "# O endereço que o seu programa vê é virtual\n\nTodo endereço que o seu código manipula é VIRTUAL: um número num espaço privado do processo. O hardware e o kernel traduzem, por baixo, cada acesso pra um endereço FÍSICO na RAM. A tradução acontece em blocos de 4 KiB chamados PÁGINAS, e o mapa de tradução de cada processo é a TABELA DE PÁGINAS, mantida pelo kernel em vários níveis (4 ou 5 no x86-64).\n\nEsse desvio compra três coisas. ISOLAMENTO: cada processo tem seu mapa; não existe como nomear a memória alheia, o mapa nem chega lá. PERMISSÕES por página: código executável e não gravável, dados graváveis e não executáveis, e violar isso é o segfault. FLEXIBILIDADE: a mesma página física pode aparecer em vários processos (bibliotecas compartilhadas), e páginas podem nem existir em RAM ainda.\n\nTraduzir cada acesso consultando uma tabela em memória custaria caro demais, e aí entra o TLB: um cache pequeno e rapidíssimo das traduções recentes, com algumas centenas a poucos milhares de entradas. Com o TLB acertando, a tradução sai de graça; errando, o hardware caminha pela tabela: dezenas a centenas de ciclos por acesso.",
                },
                {
                    type: "table",
                    value: '[["Termo","O que é"],["Página","bloco de 4 KiB do espaço de endereços"],["Tabela de páginas","o mapa do virtual pro físico, por processo"],["TLB","cache das traduções recentes"],["Page fault","acesso a página sem mapeamento válido"],["Swap","página despejada pro disco pra liberar RAM"]]',
                },
                {
                    type: "text",
                    value: "## Page fault não é (sempre) erro\n\nAcessar uma página sem tradução válida dispara um PAGE FAULT, e o kernel decide o destino. FALTA MENOR (minor): a página é legítima, só ainda não foi mapeada; o kernel mapeia e o programa segue sem perceber. É assim que malloc de verdade funciona: pedir 1 GB é barato e quase instantâneo, porque o kernel só PROMETE as páginas; o custo real chega no primeiro toque em cada uma, falta a falta. FALTA MAIOR (major): o conteúdo está no disco, em swap ou arquivo mapeado; o kernel precisa ler, e o acesso custa milissegundos, milhões de vezes um acesso comum.\n\nE o segfault? É o page fault de um acesso ILEGÍTIMO: endereço fora de qualquer região válida, ou permissão violada. O mecanismo é o mesmo; o veredito do kernel é que muda.\n\nConsequências práticas que valem dinheiro: o primeiro toque em memória recém-alocada é mais caro que os seguintes (aquecer buffers importa em benchmark e em serviço sensível a latência); um processo pisando no swap despenca de desempenho; e percorrer memória de forma espalhada estressa também o TLB, não só o cache. A visão de cima basta por aqui; o resto é ofício de kernel.",
                },
                {
                    type: "quote",
                    value: "Todo endereço que o seu código toca é uma mentira conveniente: virtual, traduzido em silêncio pelo TLB. Você só percebe a máquina de verdade quando a tradução falha e o kernel entra em cena pra decidir se mapeia ou se mata.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o tamanho comum de uma página de memória?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "4 KiB, a unidade de tradução e permissão",
                            isCorrect: true,
                        },
                        {
                            text: "64 bytes, o mesmo tamanho da cache line",
                            isCorrect: false,
                        },
                        {
                            text: "1 MiB, o tamanho mínimo aceito pelo malloc",
                            isCorrect: false,
                        },
                        {
                            text: "8 bytes, a largura do barramento de dados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o TLB guarda?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "As traduções recentes de página virtual pra física",
                            isCorrect: true,
                        },
                        {
                            text: "As instruções decodificadas dos laços mais quentes",
                            isCorrect: false,
                        },
                        {
                            text: "Os endereços de retorno das funções em execução",
                            isCorrect: false,
                        },
                        {
                            text: "As páginas inteiras lidas do swap recentemente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre falta menor e falta maior?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A maior precisa ler do disco; a menor só mapeia",
                            isCorrect: true,
                        },
                        {
                            text: "A maior derruba o processo; a menor só avisa no log",
                            isCorrect: false,
                        },
                        {
                            text: "A maior ocorre no kernel; a menor, em user space",
                            isCorrect: false,
                        },
                        {
                            text: "A maior envolve páginas de código; a menor, de dados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que um malloc de 1 GB retorna quase instantaneamente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O kernel só promete as páginas; o custo vem no toque",
                            isCorrect: true,
                        },
                        {
                            text: "O alocador mantém 1 GB pré-zerado pra pedidos grandes",
                            isCorrect: false,
                        },
                        {
                            text: "A RAM moderna aloca blocos gigantes em um único ciclo",
                            isCorrect: false,
                        },
                        {
                            text: "O malloc devolve memória do próprio binário mapeado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como a memória virtual isola um processo do outro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cada processo enxerga apenas o próprio mapa de páginas",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel criptografa a RAM de cada processo em uso",
                            isCorrect: false,
                        },
                        {
                            text: "A CPU troca os pentes de memória entre os processos",
                            isCorrect: false,
                        },
                        {
                            text: "Os processos combinam faixas de endereço no início",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Do fonte ao binário",
    aulas: [
        {
            titulo: "As quatro fases da compilação",
            blocks: [
                {
                    type: "text",
                    value: "# gcc main.c esconde quatro programas\n\nO comando que você chama de compilar é, por baixo, um PIPELINE de quatro ferramentas, cada uma com entrada e saída próprias. O PRÉ-PROCESSADOR (cpp) trabalha com TEXTO: resolve #include colando os headers, expande macros, avalia #ifdef; sai a unidade de tradução, um C puro e gigante. O COMPILADOR propriamente dito (cc1) faz o trabalho nobre: analisa o código, otimiza e gera ASSEMBLY legível. O MONTADOR (as) traduz o assembly pra bytes de máquina num ARQUIVO OBJETO (.o), que carrega também uma tabela de símbolos: o que ele define e o que ele usa sem ter. O LINKER (ld) junta objetos e bibliotecas, resolve cada símbolo pendente e emite o executável final.\n\nVocê pode parar o trem em qualquer estação: gcc -E entrega o pré-processado, -S para no assembly, -c para no objeto. Fazer isso uma vez com um hello.c ensina mais sobre a toolchain que uma tarde de leitura: olhe o .i inchado pelos headers, o .s com o assembly da sua função, o .o já no formato ELF com sua tabela de símbolos.",
                },
                {
                    type: "table",
                    value: '[["Fase","Ferramenta","Entrada","Saída","Parar com"],["Pré-processamento","cpp","main.c","código expandido (.i)","gcc -E"],["Compilação","cc1","código expandido","assembly (.s)","gcc -S"],["Montagem","as","assembly",".o (objeto)","gcc -c"],["Ligação","ld",".o e bibliotecas","executável","padrão"]]',
                },
                {
                    type: "text",
                    value: "## Cada fase tem os próprios erros\n\nSaber qual programa falhou muda o diagnóstico. Header não encontrado: pré-processador (caminho de include errado). Erro de sintaxe ou de tipo: compilador. UNDEFINED REFERENCE: LINKER, e a confusão é clássica: o código compilou perfeitamente, a declaração prometia que a função existia em algum lugar, e na hora de juntar tudo ninguém a definiu; falta o .o ou a biblioteca na linha de comando. Símbolo duplicado: dois objetos definem a mesma função, e o linker se recusa a escolher.\n\nPor que dividir em fases? Compilação SEPARADA: cada .c vira um .o de forma independente, então mudar um arquivo recompila UM objeto e religa o resto; num projeto de mil arquivos é a diferença entre segundos e meia hora. É esse grafo (fontes viram objetos, objetos viram binário) que as ferramentas de build orquestram.\n\nA ligação ainda tem dois sabores: ESTÁTICA (a biblioteca entra copiada no binário: maior, autossuficiente) e DINÂMICA (o executável guarda só a referência; o carregador traz a .so na hora de rodar: menor, compartilhável, e a origem do famoso erro de biblioteca não encontrada em produção).",
                },
                {
                    type: "code",
                    value: "gcc -E main.c -o main.i   # so pre-processa: includes e macros expandidos\ngcc -S main.i -o main.s   # compila pra assembly legivel\ngcc -c main.s -o main.o   # monta: bytes de maquina + tabela de simbolos\ngcc main.o util.o -o app  # linka: resolve simbolos entre objetos\n\nnm main.o                 # lista os simbolos: T definidos, U pendentes",
                },
                {
                    type: "quote",
                    value: "'Undefined reference' não é erro de compilação, é erro de LINK: o compilador aceitou a promessa da declaração; quem cobra a promessa no final, com juros, é o linker.",
                },
            ],
            questions: [
                {
                    statement: "Qual fase resolve os #include e expande macros?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O pré-processador, trabalhando puramente com texto",
                            isCorrect: true,
                        },
                        {
                            text: "O linker, na hora de juntar os objetos no executável",
                            isCorrect: false,
                        },
                        {
                            text: "O montador, ao traduzir o assembly pra código de máquina",
                            isCorrect: false,
                        },
                        {
                            text: "O carregador, no momento de executar o binário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que sai do montador (as)?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um arquivo objeto com bytes de máquina e símbolos",
                            isCorrect: true,
                        },
                        {
                            text: "Um executável pronto pra rodar em qualquer máquina",
                            isCorrect: false,
                        },
                        {
                            text: "Um arquivo de assembly otimizado pelo back-end",
                            isCorrect: false,
                        },
                        {
                            text: "Uma unidade de tradução com os headers colados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em qual fase estoura o erro undefined reference?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "No link, quando nenhum objeto define o símbolo usado",
                            isCorrect: true,
                        },
                        {
                            text: "Na compilação, quando falta declarar a função no topo",
                            isCorrect: false,
                        },
                        {
                            text: "No pré-processamento, quando o include não é achado",
                            isCorrect: false,
                        },
                        {
                            text: "Na execução, quando a biblioteca dinâmica não carrega",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a compilação separada em vários .o acelera builds?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Só o arquivo alterado recompila; o resto religa",
                            isCorrect: true,
                        },
                        {
                            text: "Objetos pequenos cabem inteiros na cache do disco",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador paraleliza funções dentro de um arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "O linker guarda o executável anterior como cache",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre ligação estática e dinâmica?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Estática copia a biblioteca; dinâmica referencia a .so",
                            isCorrect: true,
                        },
                        {
                            text: "Estática roda mais devagar por checar tipos em execução",
                            isCorrect: false,
                        },
                        {
                            text: "Dinâmica embute o código e a estática usa referências",
                            isCorrect: false,
                        },
                        {
                            text: "Estática é a ligação feita antes da fase de montagem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Seções do executável",
            blocks: [
                {
                    type: "text",
                    value: "# O mapa dentro do binário\n\nUm executável ELF não é um bloco amorfo: é um mapa de SEÇÕES, cada uma com conteúdo e permissões próprias. As quatro que você precisa conhecer: .text guarda o código de máquina, e vai pra memória como leitura e execução, sem escrita. .rodata guarda constantes e literais de string: só leitura. .data guarda as variáveis globais e estáticas INICIALIZADAS com valor diferente de zero: leitura e escrita. .bss guarda as globais ZERADAS, e aqui mora um truque: o arquivo registra só o TAMANHO; os bytes nem existem no disco, porque o carregador entrega páginas zeradas na hora de subir o processo.\n\nO truque do .bss tem consequência visível: declarar um int zerado[10000000] (40 MB) quase não muda o tamanho do binário; inicializar o mesmo array com um valor move tudo pra .data e o arquivo engorda os 40 MB inteiros.\n\nO comando size lista .text, .data e .bss de qualquer objeto; readelf -S mostra o mapa completo. Vale rodar nos seus binários: ver ONDE cada linha do seu fonte foi parar transforma o executável de caixa preta em documento legível.",
                },
                {
                    type: "table",
                    value: '[["Seção","Conteúdo","Ocupa bytes no arquivo?","Permissão em memória"],["text","código de máquina","sim","ler e executar"],["rodata","constantes e literais","sim","só leitura"],["data","globais inicializadas","sim","ler e escrever"],["bss","globais zeradas","só o tamanho","ler e escrever"]]',
                },
                {
                    type: "code",
                    value: 'int zerado[1000000];        // .bss: 4 MB em execucao, quase 0 no arquivo\nint iniciado[1000] = {7};   // .data: 4000 bytes gravados no binario\nconst char *msg = "oi";     // o texto "oi" mora em .rodata\nint soma(int a, int b) {    // o codigo vai pra .text\n    return a + b;\n}\n\n// msg[0] = \'a\';  -> segfault: .rodata e pagina somente leitura',
                },
                {
                    type: "text",
                    value: "## O processo em execução: o mapa ganha vida\n\nQuando o carregador sobe o binário, as seções viram regiões de memória com as permissões da tabela, e duas áreas novas nascem. O HEAP começa logo depois do .bss e cresce pra CIMA, endereços maiores, conforme o alocador pede páginas. A PILHA nasce perto do topo do espaço de endereços e cresce pra BAIXO. Entre os dois, uma zona enorme onde o mmap coloca bibliotecas dinâmicas e alocações grandes.\n\nEsse desenho explica erros que você já viu. Escrever numa string literal: segfault, porque .rodata não aceita escrita. Executar dados: bloqueado, porque páginas de dados não têm permissão de execução (a proteção NX). Estouro de pilha: a pilha desceu além do limite e tocou a página de guarda.\n\nNo Linux, cat /proc/PID/maps mostra esse mapa ao vivo pra qualquer processo: cada linha é uma região com início, fim e permissões rwx. Ler o maps de um processo seu, com o diagrama desta aula do lado, é o exercício que solda o modelo mental inteiro de uma vez.",
                },
                {
                    type: "quote",
                    value: "O executável é um mapa de intenções: o que é código, o que é constante, o que nasce com valor e o que nasce zerado. O carregador lê o mapa e monta o processo, página por página, permissão por permissão.",
                },
            ],
            questions: [
                {
                    statement: "Em qual seção vive o código de máquina do programa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Na .text, mapeada como leitura e execução",
                            isCorrect: true,
                        },
                        {
                            text: "Na .data, junto das variáveis globais do programa",
                            isCorrect: false,
                        },
                        {
                            text: "Na .bss, carregada por páginas zeradas",
                            isCorrect: false,
                        },
                        {
                            text: "No heap, alocado pelo carregador na inicialização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a .bss quase não ocupa espaço no arquivo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Só o tamanho é registrado; as páginas chegam zeradas",
                            isCorrect: true,
                        },
                        {
                            text: "O conteúdo dela é comprimido junto com o cabeçalho",
                            isCorrect: false,
                        },
                        {
                            text: "Ela é gravada num arquivo separado do executável",
                            isCorrect: false,
                        },
                        {
                            text: "O linker move o conteúdo dela pra dentro da .data",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Um array global gigante inicializado com zeros engorda o binário?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não: ele vai pra .bss, que só registra o tamanho",
                            isCorrect: true,
                        },
                        {
                            text: "Sim: cada zero é gravado byte a byte no arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "Sim: arrays globais vão sempre pra seção .data",
                            isCorrect: false,
                        },
                        {
                            text: "Não: arrays grandes são movidos pro heap pelo linker",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que escrever numa string literal causa segfault?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O literal mora na .rodata, página somente leitura",
                            isCorrect: true,
                        },
                        {
                            text: "Literais são apagados da memória após o primeiro uso",
                            isCorrect: false,
                        },
                        {
                            text: "Strings vivem no heap e exigem free antes da escrita",
                            isCorrect: false,
                        },
                        {
                            text: "O ponteiro pra literal aponta pra fora do processo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No layout em execução, pra onde crescem heap e pilha?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O heap sobe os endereços e a pilha desce do topo",
                            isCorrect: true,
                        },
                        {
                            text: "Os dois sobem juntos, separados por uma página fixa",
                            isCorrect: false,
                        },
                        {
                            text: "A pilha sobe os endereços e o heap desce do topo",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum cresce: os tamanhos são fixados pelo linker",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Uma chamada de função por dentro",
            blocks: [
                {
                    type: "text",
                    value: "# O contrato da chamada\n\nQuando f() chama g(), as duas precisam concordar em TUDO sem nunca terem se visto: onde vão os argumentos, onde volta o resultado, quem preserva o quê. Esse acordo é a CONVENÇÃO DE CHAMADA, parte da ABI da plataforma. No Linux x86-64 (convenção System V), os seis primeiros argumentos inteiros ou ponteiros viajam nos registradores rdi, rsi, rdx, rcx, r8 e r9; o retorno volta em rax; argumentos além do sexto vão pra pilha.\n\nA instrução call faz duas coisas: empilha o endereço da PRÓXIMA instrução (o ponto de volta) e salta pro início da função. O ret desfaz: desempilha o endereço e salta de volta. Entre os dois, a função monta o frame: salva rbp se for usar, reserva espaço pros locais com sub rsp, trabalha e desmonta tudo no epílogo.\n\nA convenção também divide os registradores em dois times: os CALLER-SAVED (rax, rcx, rdx, rsi, rdi, r8 a r11), que a função chamada pode sujar à vontade, e os CALLEE-SAVED (rbx, rbp, r12 a r15), que ela precisa devolver intactos: se usar, salva antes e restaura depois.",
                },
                {
                    type: "table",
                    value: '[["Papel","Registradores no System V AMD64"],["Argumentos 1 a 6","rdi, rsi, rdx, rcx, r8, r9"],["Valor de retorno","rax"],["Topo da pilha","rsp"],["Base do frame","rbp (opcional)"],["Preservados pela função chamada","rbx, rbp, r12 a r15"]]',
                },
                {
                    type: "code",
                    value: "; int soma(int a, int b) { return a + b; }   chamada: soma(2, 3)\nmov edi, 2            ; primeiro argumento em rdi/edi\nmov esi, 3            ; segundo argumento em rsi/esi\ncall soma             ; empilha o endereco de volta e salta\n; resultado disponivel em eax a partir daqui\n\nsoma:\nlea eax, [rdi + rsi]  ; a + b direto pro registrador de retorno\nret                   ; desempilha o endereco e volta",
                },
                {
                    type: "text",
                    value: "## Por que isso te interessa\n\nPrimeiro, depuração: o stack trace do depurador é a leitura dos frames empilhados; entender call, ret e frames é entender COMO o backtrace é reconstruído, e por que um estouro de buffer que sobrescreve o endereço de retorno derruba (ou sequestra) o programa: o ret salta pra onde o atacante escreveu. É a base do exploit clássico de stack smashing e das defesas modernas: canários de pilha, NX, ASLR.\n\nSegundo, desempenho: uma chamada custa pouco (call, ret e meia dúzia de movs), mas não custa zero. Em loops quentíssimos, chamadas curtas demais pesam, e é por isso que compiladores fazem INLINE: colam o corpo da função no lugar da chamada, eliminando o overhead em troca de binário maior.\n\nTerceiro, interoperabilidade: quando duas linguagens conversam (C chamando C++, Python chamando C), o que as conecta é exatamente a convenção de chamada. Os dois lados, compilados em momentos diferentes por compiladores diferentes, funcionam juntos porque seguem o MESMO contrato de registradores e pilha. Sem convenção fixa, nada linkaria com nada.",
                },
                {
                    type: "quote",
                    value: "call e ret só combinam um detalhe: onde fica o endereço de volta. Todo o resto é convenção, e convenção quebrada não dá erro de compilação: dá corrupção silenciosa em tempo de execução.",
                },
            ],
            questions: [
                {
                    statement: "No System V AMD64, onde volta o valor de retorno inteiro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No registrador rax (eax na largura de 32 bits)",
                            isCorrect: true,
                        },
                        {
                            text: "No topo da pilha, logo acima do endereço de volta",
                            isCorrect: false,
                        },
                        {
                            text: "No registrador rdi, o primeiro da lista da ABI",
                            isCorrect: false,
                        },
                        {
                            text: "Num endereço fixo de memória acordado no link",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a instrução call faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Empilha o endereço de volta e salta pra função",
                            isCorrect: true,
                        },
                        {
                            text: "Copia os argumentos da pilha pros registradores",
                            isCorrect: false,
                        },
                        {
                            text: "Reserva o espaço de todas as variáveis locais",
                            isCorrect: false,
                        },
                        {
                            text: "Salva todos os registradores antes de saltar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Pra onde vão os argumentos do sétimo em diante?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pra pilha, na ordem que a convenção define",
                            isCorrect: true,
                        },
                        {
                            text: "Pra registradores extras criados sob demanda",
                            isCorrect: false,
                        },
                        {
                            text: "Pro heap, num bloco alocado pelo chamador",
                            isCorrect: false,
                        },
                        {
                            text: "Pra seção .data, reservada pra argumentos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que são registradores callee-saved?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os que a função chamada precisa devolver intactos",
                            isCorrect: true,
                        },
                        {
                            text: "Os que guardam o endereço de retorno da chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Os que só o sistema operacional pode escrever",
                            isCorrect: false,
                        },
                        {
                            text: "Os que o hardware zera automaticamente a cada chamada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que sobrescrever o endereço de retorno na pilha é tão grave?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O ret salta pra onde o valor corrompido apontar",
                            isCorrect: true,
                        },
                        {
                            text: "A pilha inteira é zerada e o processo reinicia",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador insere um teste que aborta o build",
                            isCorrect: false,
                        },
                        {
                            text: "Os argumentos das funções seguintes se perdem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Syscalls: a fronteira do kernel",
            blocks: [
                {
                    type: "text",
                    value: "# A fronteira entre dois mundos\n\nO seu programa roda em MODO USUÁRIO: um mundo murado onde não dá pra falar com o disco, com a placa de rede ou com a memória alheia. Quem pode tudo é o KERNEL, rodando em modo privilegiado. A ÚNICA porta entre os dois é a SYSCALL: o processo põe o número do serviço em rax (write é o número 1 no Linux x86-64), os argumentos nos registradores da convenção, e executa a instrução syscall; a CPU troca de modo, o kernel atende, e o controle volta.\n\nVocê quase nunca chama isso na mão: a libc embrulha cada syscall numa função (write, read, open, mmap), e as camadas de cima embrulham a libc: o printf formata num buffer e, lá no fim, chama write.\n\nO custo é o ponto central: uma chamada de função comum custa 1 a 2 ns; uma syscall simples, 100 a 300 ns, e as mitigações de segurança pós-2018 (Spectre e família) deixaram a travessia mais cara, não mais barata. É pouco em termos absolutos, mas são DUAS ordens de grandeza sobre uma chamada: syscall dentro de loop quente é veneno de desempenho.",
                },
                {
                    type: "table",
                    value: '[["Operação","Custo típico"],["Chamada de função comum","1 a 2 ns"],["Syscall simples (getpid)","100 a 300 ns"],["Syscall com trabalho (read do page cache)","cerca de 1 us"],["Leitura de relógio via vDSO","dezenas de ns, sem entrar no kernel"],["read que desce ao disco NVMe","50 a 100 us"]]',
                },
                {
                    type: "text",
                    value: "## Amortizar: a arte de atravessar menos\n\nSe a travessia custa caro, a resposta da engenharia é atravessar MENOS vezes carregando MAIS por viagem. É o padrão buffer: escrever 1 byte por vez num arquivo, um milhão de vezes, seriam um milhão de syscalls, dezenas a centenas de milissegundos só de travessia; com um buffer de 64 KiB, viram 16 writes. O stdio faz isso por você (por isso o printf não aparece no strace a cada chamada), e os runtimes de todas as linguagens fazem o mesmo.\n\nAlgumas operações nem atravessam mais: o Linux mapeia o vDSO em cada processo, uma paginazinha de código do kernel exposta em espaço de usuário, e leituras de relógio como gettimeofday e clock_gettime viram chamadas comuns, sem troca de modo nenhuma.\n\nFerramenta essencial: strace lista cada syscall de um processo, com argumentos e retorno. Rodar strace num programa seu é revelador duas vezes: mostra o que o runtime esconde e mostra o custo em quantidade: um printf inocente pode não gerar syscall nenhuma agora, e um log mal bufferizado pode gerar milhares por segundo. Quem lê strace enxerga a fronteira; quem enxerga a fronteira para de atravessá-la à toa.",
                },
                {
                    type: "quote",
                    value: "A syscall é a única porta entre o seu processo e o mundo real: arquivo, rede, tela, tudo passa por ela. Cara demais pra chamar à toa, essencial demais pra evitar; por isso todo runtime empilha buffers na frente dela.",
                },
            ],
            questions: [
                {
                    statement: "O que só o kernel pode fazer, e o modo usuário não?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Acessar hardware direto, como disco e rede",
                            isCorrect: true,
                        },
                        {
                            text: "Executar operações aritméticas de 64 bits",
                            isCorrect: false,
                        },
                        {
                            text: "Alocar memória com malloc e liberar com free",
                            isCorrect: false,
                        },
                        {
                            text: "Criar funções recursivas com retorno duplo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o custo típico de uma syscall simples frente a uma chamada de função?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cerca de cem vezes mais: centenas de nanossegundos",
                            isCorrect: true,
                        },
                        {
                            text: "Praticamente o mesmo: a troca de modo é gratuita",
                            isCorrect: false,
                        },
                        {
                            text: "Um milhão de vezes mais: milissegundos por chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Metade do custo: o kernel executa mais rápido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que printf não gera uma syscall a cada chamada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O stdio acumula num buffer e faz poucos writes",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel reconhece o printf e o atende em lote",
                            isCorrect: false,
                        },
                        {
                            text: "O terminal lê a memória do processo diretamente",
                            isCorrect: false,
                        },
                        {
                            text: "A saída padrão é mapeada como arquivo em disco",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual ferramenta lista as syscalls de um processo no Linux?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O strace, com argumentos e retorno de cada uma",
                            isCorrect: true,
                        },
                        {
                            text: "O gdb, no modo de inspeção de bibliotecas",
                            isCorrect: false,
                        },
                        {
                            text: "O top, na sua coluna de chamadas por segundo",
                            isCorrect: false,
                        },
                        {
                            text: "O make, com a flag de rastreamento ligada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o vDSO faz gettimeofday nem entrar no kernel?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O kernel mapeia o código no espaço do usuário",
                            isCorrect: true,
                        },
                        {
                            text: "O relógio é lido do arquivo /proc pelo processo",
                            isCorrect: false,
                        },
                        {
                            text: "A CPU tem uma instrução que devolve a data civil",
                            isCorrect: false,
                        },
                        {
                            text: "O horário chega por interrupção a cada segundo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "ABI: o contrato binário",
            blocks: [
                {
                    type: "text",
                    value: "# API é promessa no fonte; ABI, no binário\n\nAPI diz o que existe pra chamar: nomes, parâmetros, semântica, e é cobrada pelo COMPILADOR. ABI (application binary interface) diz como isso vira BYTES: tamanhos e alinhamentos de cada tipo, layout de structs, convenção de chamada, formato dos nomes de símbolo. É cobrada em EXECUÇÃO, por binários que foram compilados em momentos diferentes e precisam conversar mesmo assim.\n\nO exemplo que dói: uma biblioteca expõe uma struct pública de 12 bytes; a versão nova adiciona um campo no meio e ela vai a 16. Quem recompilou, funciona. Quem só atualizou a .so continua lendo os offsets antigos: campo errado, lixo, crash intermitente. Nenhum erro de compilação avisou, porque ninguém recompilou nada.\n\nPor isso 'quebrar ABI' é um evento sério no mundo das bibliotecas: a glibc mantém símbolos versionados há décadas pra binários de 20 anos continuarem rodando; distribuições Linux recompilam o mundo inteiro quando uma biblioteca central quebra ABI; e o comitê do C++ evita até hoje mudanças que quebrariam o layout de tipos centrais de novo (a transição da std::string em 2011 ainda é lembrada com cicatrizes).",
                },
                {
                    type: "table",
                    value: '[["Item do contrato ABI","Exemplo concreto"],["Tamanho e alinhamento de tipos","long tem 8 bytes no Linux x86-64"],["Layout de structs","offsets e padding de cada campo"],["Convenção de chamada","argumentos em rdi, rsi, rdx"],["Nomes de símbolos","soma(int, int) vira _Z4somaii"],["Versionamento","símbolos versionados da glibc"]]',
                },
                {
                    type: "text",
                    value: '## Mangling: o sobrenome que o C++ esconde\n\nEm C, a função soma vira o símbolo soma, e acabou. C++ permite sobrecarga: duas somas com tipos diferentes precisam de nomes de símbolo diferentes, e o compilador resolve DECORANDO o nome com os tipos: soma(int, int) vira _Z4somaii no Itanium ABI usado por GCC e Clang. O utilitário c++filt desfaz a decoração; o nm mostra os símbolos crus de qualquer objeto.\n\nDois pontos práticos saem daí. Primeiro, interoperabilidade: extern "C" desliga o mangling (e a sobrecarga) pra um símbolo ficar chamável de C, Python, Rust, qualquer lugar; é por isso que toda biblioteca com bindings expõe uma casca extern "C". Segundo, diagnóstico: quando o linker reclamar de um _Z4somaii ausente, você já sabe ler: é a soma de dois ints que ninguém definiu, provavelmente uma assinatura que mudou de um lado e não do outro.\n\nEsse processo de traduzir nomes e tipos em símbolos é só um aperitivo do mundo dos compiladores e linkers, que rende estudo próprio; pra esta trilha, fica a leitura essencial: mangling é ABI, e ABI é o contrato que os binários assinam entre si.',
                },
                {
                    type: "code",
                    value: '// C++: int soma(int, int) vira o simbolo _Z4somaii\n// nm app.o | grep soma      -> _Z4somaii\n// c++filt _Z4somaii         -> soma(int, int)\n\nextern "C" int soma_c(int a, int b);  // simbolo limpo: soma_c\n// chamavel de C, de Python (ctypes), de Rust (FFI)...',
                },
                {
                    type: "quote",
                    value: "API quebrada grita no compilador; ABI quebrada sussurra em produção: o binário antigo continua rodando, lendo os bytes errados com a maior confiança do mundo.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença essencial entre API e ABI?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "API é contrato no fonte; ABI é contrato no binário",
                            isCorrect: true,
                        },
                        {
                            text: "API vale em C e a ABI só existe no mundo do C++",
                            isCorrect: false,
                        },
                        {
                            text: "API descreve dados e a ABI descreve só funções",
                            isCorrect: false,
                        },
                        {
                            text: "API é do aplicativo e ABI é do sistema operacional",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: 'O que faz extern "C" numa função C++?',
                    difficulty: "facil",
                    options: [
                        {
                            text: "Desliga o mangling e expõe um símbolo limpo",
                            isCorrect: true,
                        },
                        {
                            text: "Compila a função com o padrão antigo C89",
                            isCorrect: false,
                        },
                        {
                            text: "Impede o linker de descartar o símbolo",
                            isCorrect: false,
                        },
                        {
                            text: "Torna a função visível só dentro do arquivo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que mudar uma struct pública quebra a ABI de uma biblioteca?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os offsets mudam e binários antigos leem lixo",
                            isCorrect: true,
                        },
                        {
                            text: "O nome da struct muda junto e o link falha na hora",
                            isCorrect: false,
                        },
                        {
                            text: "Structs públicas são copiadas pro executável final",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador bloqueia o uso de versões antigas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o símbolo _Z4somaii carrega codificado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O nome soma e os dois parâmetros do tipo int",
                            isCorrect: true,
                        },
                        {
                            text: "O endereço final da função dentro do executável",
                            isCorrect: false,
                        },
                        {
                            text: "A versão da biblioteca em que a função nasceu",
                            isCorrect: false,
                        },
                        {
                            text: "O checksum do corpo da função pra validação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que C funciona como língua franca de interoperabilidade?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A ABI de C é simples e estável entre compiladores",
                            isCorrect: true,
                        },
                        {
                            text: "C é a única linguagem que o kernel sabe executar",
                            isCorrect: false,
                        },
                        {
                            text: "O padrão C obriga todas as linguagens a segui-lo",
                            isCorrect: false,
                        },
                        {
                            text: "Compiladores C geram binários sem nenhuma ABI",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Medir e otimizar",
    aulas: [
        {
            titulo: "Medir antes de otimizar",
            blocks: [
                {
                    type: "text",
                    value: "# Uma medição é uma anedota\n\nRode um benchmark UMA vez e você mediu, principalmente, sorte: a primeira execução paga cache frio, page faults do primeiro toque, e o processador ainda está subindo de frequência. Rode de novo e o número muda: turbo oscilando com a temperatura, outros processos disputando os núcleos, o sistema migrando sua thread de núcleo no meio. Variação de 10 a 30% entre execuções idênticas é NORMAL num desktop comum.\n\nO protocolo honesto tem quatro regras. AQUEÇA: descarte as primeiras voltas, deixe caches e frequência estabilizarem. REPITA: dezenas de execuções, não uma. RESUMA COM MEDIANA e olhe a dispersão (p95, desvio): a média é refém de um pico isolado; a mediana conta a história típica. FIXE O AMBIENTE: feche o resto, ligue o modo performance do governor, rode sempre na mesma máquina quando for comparar alternativas.\n\nE compare SEMPRE contra uma linha de base medida no mesmo protocolo: 'ficou rápido' não significa nada; 'mediana caiu de 142 pra 96 ms, dispersão estável, mesmas entradas' é engenharia. Sem baseline, todo número é marketing.",
                },
                {
                    type: "table",
                    value: '[["Armadilha","O que distorce","Antídoto"],["Medir uma vez","cache frio e sorte","repetir dezenas de vezes"],["Ignorar aquecimento","primeiras voltas pagam faults","descartar as iniciais"],["Usar média","um pico puxa o valor","mediana e percentis"],["Ambiente solto","turbo e vizinhos mudam tudo","governor fixo, máquina quieta"],["Sem linha de base","não há com o que comparar","medir o antes no mesmo rito"]]',
                },
                {
                    type: "text",
                    value: "## O benchmark que mede nada\n\nTem um jeito de todos os cuidados acima falharem juntos: medir código que o compilador REMOVEU. Se o laço calcula uma soma que ninguém usa, o otimizador aplica eliminação de código morto e o seu benchmark mede um laço vazio, às vezes nem isso. Números bons demais pra ser verdade são o sintoma clássico.\n\nAs defesas: use o resultado (imprima, some num acumulador, devolva da função), ou use as barreiras dos frameworks de benchmark, como o DoNotOptimize do Google Benchmark. E confira o número contra uma conta de guardanapo: somar 10 milhões de inteiros a 3 GHz não pode custar menos que alguns milissegundos; se deu microssegundos, o laço morreu no build.\n\nFerramentas prontas aplicam o protocolo por você: hyperfine pra comandos de linha (aquecimento, repetições e estatística automáticos), Google Benchmark e criterion pra microbenchmarks dentro do código. Use uma delas em vez de cronometrar na mão: o rigor vem de graça, e a saída já entrega mediana, desvio e outliers marcados. Medir bem é um hábito barato; medir mal é caro exatamente porque parece que funcionou.",
                },
                {
                    type: "code",
                    value: "# hyperfine cuida de aquecimento, repeticao e estatistica\nhyperfine --warmup 3 --runs 30 './app entrada.txt'\n#   mediana ~142 ms, desvio ~3 ms em 30 execucoes: medida sadia\n\n# a versao ingenua (rodar uma vez com time) mede cache frio + sorte\ntime ./app entrada.txt",
                },
                {
                    type: "quote",
                    value: "Uma medição é uma anedota; trinta medições com mediana e dispersão são um dado. A distância entre as duas é a mesma que separa 'no meu PC ficou rápido' de engenharia.",
                },
            ],
            questions: [
                {
                    statement: "Por que descartar as primeiras execuções de um benchmark?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Elas pagam cache frio, faults e frequência baixa",
                            isCorrect: true,
                        },
                        {
                            text: "O relógio do sistema só calibra após um minuto",
                            isCorrect: false,
                        },
                        {
                            text: "As primeiras voltas rodam com o otimizador desligado",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador ainda está gerando o código nelas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que resumir com mediana em vez de média?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um pico isolado distorce a média, não a mediana",
                            isCorrect: true,
                        },
                        {
                            text: "A mediana é mais rápida de calcular que a média",
                            isCorrect: false,
                        },
                        {
                            text: "A média só funciona com número par de amostras",
                            isCorrect: false,
                        },
                        {
                            text: "A mediana soma os erros de medição e os anula",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um benchmark dá 0,000001 ms pra somar 10 milhões de números. O que provavelmente houve?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O compilador eliminou o código morto do laço",
                            isCorrect: true,
                        },
                        {
                            text: "A cache L1 respondeu por todos os elementos",
                            isCorrect: false,
                        },
                        {
                            text: "O turbo do processador dobrou a frequência",
                            isCorrect: false,
                        },
                        {
                            text: "O prefetcher carregou o array antes do laço",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais fontes de variância um benchmark honesto controla?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Turbo, governor, processos vizinhos e a máquina usada",
                            isCorrect: true,
                        },
                        {
                            text: "O fuso horário, o idioma do sistema e o nome do binário",
                            isCorrect: false,
                        },
                        {
                            text: "A marca do compilador e a cor do tema do terminal",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho do fonte e a quantidade de comentários",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o protocolo mínimo de um benchmark confiável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Aquecer, repetir dezenas de vezes e olhar a mediana",
                            isCorrect: true,
                        },
                        {
                            text: "Rodar uma vez em modo administrador com nice máximo",
                            isCorrect: false,
                        },
                        {
                            text: "Medir na máquina mais potente disponível do time",
                            isCorrect: false,
                        },
                        {
                            text: "Somar todos os tempos e dividir pelo total de runs",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Big-O encontra o hardware",
            blocks: [
                {
                    type: "text",
                    value: "# Duas O(n) com destinos diferentes\n\nPercorrer um array e percorrer uma lista ligada têm a MESMA complexidade: O(n). O hardware discorda do empate. No array, os elementos são vizinhos: o cache traz 16 ints por linha e o prefetcher, vendo o padrão sequencial, abastece as próximas linhas antes do pedido; o custo por elemento fica em 0,5 a 1 ns. Na lista, cada nó mora onde o alocador o deixou: seguir o ponteiro é um salto imprevisível, o prefetcher não tem padrão pra seguir, e cada passo pode custar um acesso à RAM: 80 a 100 ns.\n\nFaça a conta com 10 milhões de elementos: o array soma em uns 10 ms; a lista, em torno de 1 SEGUNDO. Duas ordens de grandeza entre estruturas com a mesma assinatura assintótica.\n\nA moral não é 'Big-O mentiu': é que Big-O responde COMO O CUSTO CRESCE, e o hardware responde QUANTO CADA PASSO CUSTA. As duas respostas importam. Com n gigante e algoritmo errado, nada salva (O(n²) contra O(n log n) em milhões de itens é derrota certa); com a mesma complexidade, vence quem respeita o cache.",
                },
                {
                    type: "table",
                    value: '[["Estrutura","Padrão de memória","Custo por elemento","10 milhões de itens"],["Array contíguo","vizinhos; prefetch funciona","0,5 a 1 ns","cerca de 10 ms"],["Lista ligada","nós espalhados; salto por ponteiro","80 a 100 ns na RAM","cerca de 1 s"]]',
                },
                {
                    type: "code",
                    value: "// travessia: mesma O(n), custos reais muito diferentes\nlong soma_array(const int *v, int n) {      // ~10 ms pra 10 milhoes\n    long s = 0;\n    for (int i = 0; i < n; i++) s += v[i];  // sequencial: prefetch acerta\n    return s;\n}\n\nlong soma_lista(const No *p) {              // ~1 s pra 10 milhoes\n    long s = 0;\n    for (; p; p = p->prox) s += p->valor;   // salto por ponteiro: miss atras de miss\n    return s;\n}",
                },
                {
                    type: "text",
                    value: "## Quando cada um vence\n\nA lista ligada ainda tem seu lugar: com o PONTEIRO do nó já na mão, inserir ou remover no meio é O(1) de verdade, sem deslocar ninguém; emendas de sequências e filas intrusivas usam isso bem. O ponto é que 'chegar até o nó' custa a travessia cara, então lista vale quando você já está lá, e raramente vale quando ainda precisa procurar.\n\nO mesmo raciocínio reavalia clássicos. Busca binária é O(log n) e busca linear é O(n); em arrays PEQUENOS, de até algumas dezenas de elementos, a linear costuma vencer no relógio: acesso sequencial, previsível, sem os saltos que confundem cache e previsor. Em mapas pequenos, um array varrido no braço vence hash table com frequência constrangedora.\n\nA regra de bolso pra 2026, com a memória cada vez mais distante do processador: entre estruturas de mesma complexidade, escolha a mais CONTÍGUA e PREVISÍVEL. Vector por padrão; lista, mapa espalhado e árvore de ponteiros quando o padrão de uso justificar com medida. Big-O escolhe o algoritmo; o hardware escolhe a estrutura; o benchmark da aula anterior arbitra os empates.",
                },
                {
                    type: "quote",
                    value: "Big-O responde 'como o custo cresce'; o cache responde 'quanto custa cada passo'. Engenharia precisa das duas respostas, porque n quase nunca é infinito e a constante quase nunca é um.",
                },
            ],
            questions: [
                {
                    statement: "Por que percorrer um array contíguo é tão rápido?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Vizinhos na mesma linha e prefetch acertando",
                            isCorrect: true,
                        },
                        {
                            text: "Arrays ficam gravados dentro dos registradores",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador converte o laço numa única soma",
                            isCorrect: false,
                        },
                        {
                            text: "O sistema prioriza processos que usam arrays",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Array e lista ligada são O(n) na travessia. Por que os tempos diferem tanto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A constante muda: localidade define o custo do passo",
                            isCorrect: true,
                        },
                        {
                            text: "A lista executa mais instruções por elemento somado",
                            isCorrect: false,
                        },
                        {
                            text: "O Big-O da lista é na verdade quadrático escondido",
                            isCorrect: false,
                        },
                        {
                            text: "Arrays são otimizados pelo kernel em cada leitura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o custo típico de seguir um ponteiro que cai na RAM?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "De 80 a 100 ns, centenas de ciclos parados",
                            isCorrect: true,
                        },
                        {
                            text: "De 1 a 2 ns, o mesmo que somar dois inteiros",
                            isCorrect: false,
                        },
                        {
                            text: "Uns 50 us, equivalente a uma leitura de SSD",
                            isCorrect: false,
                        },
                        {
                            text: "Zero: o ponteiro já contém o valor do próximo nó",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando a lista ligada ainda é uma boa escolha?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Inserção no meio com o ponteiro do nó já na mão",
                            isCorrect: true,
                        },
                        {
                            text: "Busca frequente por posição em coleções grandes",
                            isCorrect: false,
                        },
                        {
                            text: "Somas sequenciais de milhões de valores numéricos",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer caso: lista é sempre superior ao array",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a busca linear pode vencer a binária em arrays pequenos?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Acesso sequencial previsível vence os saltos, em n pequeno",
                            isCorrect: true,
                        },
                        {
                            text: "A binária exige ordenar o array a cada busca realizada",
                            isCorrect: false,
                        },
                        {
                            text: "A linear usa menos memória e o array cabe num registrador",
                            isCorrect: false,
                        },
                        {
                            text: "O log de n fica negativo quando n é menor que dezesseis",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Cache miss e mispredição no código real",
            blocks: [
                {
                    type: "text",
                    value: "# Os dois impostos invisíveis\n\nOlhe um perfil de código real e os vilões raramente são as contas: são as ESPERAS. As duas maiores: cache miss (a memória não chegou) e branch misprediction (a aposta do desvio falhou). Os preços em ciclos, pra ter na cabeça: acerto em L1, uns 4; L2, uns 12; L3, 30 a 40; RAM, 200 a 300. Desvio bem previsto, custo perto de zero; desvio errado, 15 a 20 ciclos de pipeline descartado.\n\nA régua muda a leitura do código. Uma soma custa 1 ciclo; um único miss até a RAM custa o mesmo que TREZENTAS somas. Um laço que faz pouca conta por elemento mas erra o cache o tempo todo é um laço de esperas com contas ocasionais no meio.\n\nOnde os impostos se escondem: perseguição de ponteiros (listas, árvores, grafos de objetos), hash maps com buckets espalhados, dispatch virtual em cadeia com cada objeto num canto do heap, branches decididos por dados aleatórios, comparações em posições imprevisíveis. Nenhum desses parece lento no código fonte; todos aparecem no perfil.",
                },
                {
                    type: "table",
                    value: '[["Evento","Custo típico em ciclos"],["Acerto na L1","cerca de 4"],["Acerto na L2","cerca de 12"],["Acerto na L3","30 a 40"],["Miss até a RAM","200 a 300"],["Desvio previsto certo","cerca de 0"],["Desvio previsto errado","15 a 20"]]',
                },
                {
                    type: "text",
                    value: "## O experimento clássico e o diagnóstico\n\nO exemplo canônico: somar só os valores maiores ou iguais a 128 num array de bytes aleatórios. Com o array DESORDENADO, o if é moeda ao ar: o previsor erra metade das vezes e paga 15 a 20 ciclos por erro. ORDENE o array antes: os falsos vêm todos juntos, depois os verdadeiros; o previsor aprende os dois blocos e passa a errar quase nunca. Ganho típico do experimento: 3 a 6 vezes, mudando APENAS a ordem dos dados.\n\nPra diagnosticar de verdade, meça com os contadores de hardware: perf stat -e cache-misses,branch-misses entrega os dois números do título. Um IPC baixo (instruções por ciclo perto de 0,5 quando o núcleo sustentaria 4) é o sinal geral: o processador está esperando, não calculando.\n\nOs remédios seguem dos diagnósticos: pra misses, dados mais contíguos, percursos na ordem da memória, structs menores e mais densas; pra mispredições, ordenar ou particionar os dados, trocar branch por aritmética quando o perfil justificar (máscaras, cmov). E sempre na ordem certa: medir, mudar UMA coisa, medir de novo.",
                },
                {
                    type: "code",
                    value: "perf stat -e cache-misses,branch-misses ./app\n\n#  1.842.003.114  cache-misses     <- o gargalo mora aqui\n#     92.114.377  branch-misses\n#  IPC 0,41: o nucleo passa a maior parte do tempo esperando",
                },
                {
                    type: "quote",
                    value: "O contador de instruções mente sobre desempenho: uma soma custa um ciclo, um miss até a RAM custa trezentos. O perf não mede o que o código diz, mede o que a máquina esperou.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o custo típico de um miss que desce até a RAM?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Entre 200 e 300 ciclos, umas trezentas somas",
                            isCorrect: true,
                        },
                        {
                            text: "Entre 2 e 3 ciclos, quase o custo de uma soma",
                            isCorrect: false,
                        },
                        {
                            text: "Uns 20 ciclos, igual a um desvio mal previsto",
                            isCorrect: false,
                        },
                        {
                            text: "Milhões de ciclos, como uma leitura de disco",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quanto custa um desvio previsto corretamente?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Praticamente zero: o pipeline nem percebe",
                            isCorrect: true,
                        },
                        {
                            text: "Uns 15 ciclos, o preço fixo de qualquer if",
                            isCorrect: false,
                        },
                        {
                            text: "Um acesso à L2 por causa da tabela de saltos",
                            isCorrect: false,
                        },
                        {
                            text: "Metade do custo de um desvio previsto errado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No experimento do filtro por 128, por que ordenar o array acelera tanto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O previsor aprende os dois blocos e quase não erra",
                            isCorrect: true,
                        },
                        {
                            text: "A ordenação aproxima os valores grandes na memória",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador vetoriza só arrays em ordem crescente",
                            isCorrect: false,
                        },
                        {
                            text: "A soma de valores ordenados evita overflow parcial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que um IPC muito baixo indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O núcleo passa a maior parte dos ciclos esperando",
                            isCorrect: true,
                        },
                        {
                            text: "O binário foi compilado sem nenhuma otimização",
                            isCorrect: false,
                        },
                        {
                            text: "O programa depende de instruções vetoriais demais",
                            isCorrect: false,
                        },
                        {
                            text: "O clock do processador está travado no mínimo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual comando mede misses de cache e de desvio no Linux?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "perf stat com os eventos cache-misses e branch-misses",
                            isCorrect: true,
                        },
                        {
                            text: "strace com a flag de estatísticas de memória ligada",
                            isCorrect: false,
                        },
                        {
                            text: "top no modo detalhado, na coluna de faltas por segundo",
                            isCorrect: false,
                        },
                        {
                            text: "gdb com breakpoints de hardware nos acessos à RAM",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "SIMD como conceito",
            blocks: [
                {
                    type: "text",
                    value: "# Uma instrução, vários dados\n\nO modelo até aqui foi escalar: uma instrução opera um dado. SIMD (single instruction, multiple data) muda o contrato: registradores LARGOS guardam vários valores lado a lado, e UMA instrução opera todos de uma vez. Um registrador AVX2 de 256 bits carrega 8 floats de 32 bits; uma única instrução vmulps multiplica os 8 pares num golpe só.\n\nAs famílias que você vai encontrar: SSE e NEON (128 bits: 4 floats), AVX2 (256 bits: 8 floats), AVX-512 (512 bits: 16 floats) no mundo x86; NEON e SVE no mundo ARM. O ganho teórico é a largura: 4x, 8x, 16x; o ganho REAL depende de os dados estarem contíguos e alinhados, e de a operação ser a mesma pra todos os elementos.\n\nOnde SIMD brilha, e não por acaso: imagem (o mesmo ajuste em cada pixel), áudio (a mesma conta em cada amostra), álgebra de vetores e matrizes (gráficos, física, redes neurais). O padrão comum: MUITOS dados homogêneos, lado a lado, com a MESMA operação. É a fila perfeita pra comprar no atacado.",
                },
                {
                    type: "table",
                    value: '[["Conjunto","Largura","floats de 32 bits por operação"],["SSE / NEON","128 bits","4"],["AVX2","256 bits","8"],["AVX-512","512 bits","16"]]',
                },
                {
                    type: "text",
                    value: "## Você raramente escreve SIMD na mão\n\nA boa notícia: o compilador AUTOVETORIZA. Com -O2 ou -O3 (e -march=native pra liberar o conjunto da sua máquina), laços simples viram instruções vetoriais sem você digitar um intrinsic. A condição é o laço ser vetorizável: iterações INDEPENDENTES (nenhuma usa o resultado da anterior), sem saída antecipada, ponteiros sem risco de se sobrepor (o restrict ajuda a prometer isso), corpo sem chamadas opacas no meio.\n\nQuando a autovetorização falha, o relatório do compilador conta o porquê (-fopt-info-vec-missed no GCC), e aí você decide: reescrever o laço pra destravar, ou descer pra intrinsics nos raros núcleos que justificam o trabalho.\n\nA ressalva que economiza decepção: SIMD multiplica CONTAS, não memória. Se o laço é dominado por cache miss, vetorizar as contas não move o ponteiro: a espera pela RAM engole o ganho. Por isso a ordem desta trilha: layout e localidade primeiro (módulo 4), medição sempre, vetorização por último, onde o perfil mostrar que a conta, e não a memória, é o gargalo. Nessa ordem, os ganhos de 2 a 8x aparecem de verdade.",
                },
                {
                    type: "code",
                    value: "// laco simples e independente: o compilador vetoriza sozinho\n// gcc -O3 -march=native  ->  corpo vira vmulps/vaddps de 256 bits\nvoid escala_soma(float *c, const float *a, const float *b, int n) {\n    for (int i = 0; i < n; i++)\n        c[i] = a[i] * 2.0f + b[i];   // 8 floats por instrucao com AVX2\n}",
                },
                {
                    type: "quote",
                    value: "SIMD é a CPU vendendo no atacado: o preço de uma instrução, oito dados servidos. Só funciona quando os dados aceitam ficar em fila, e é por isso que layout de memória vem antes de vetorização.",
                },
            ],
            questions: [
                {
                    statement: "O que significa SIMD na prática?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma instrução operando vários dados de uma vez",
                            isCorrect: true,
                        },
                        {
                            text: "Vários núcleos executando o mesmo programa",
                            isCorrect: false,
                        },
                        {
                            text: "Uma instrução dividida em vários microcódigos",
                            isCorrect: false,
                        },
                        {
                            text: "Dados espalhados por vários pentes de memória",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quantos floats de 32 bits um registrador AVX2 processa por operação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Oito: 256 bits divididos em faixas de 32",
                            isCorrect: true,
                        },
                        {
                            text: "Dois: um par por ciclo de clock da unidade",
                            isCorrect: false,
                        },
                        {
                            text: "Trinta e dois: um float por bit de largura",
                            isCorrect: false,
                        },
                        {
                            text: "Um: AVX2 só acelera inteiros, não floats",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde SIMD costuma brilhar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Imagem, áudio e álgebra de vetores e matrizes",
                            isCorrect: true,
                        },
                        {
                            text: "Percursos de árvores com ponteiros espalhados",
                            isCorrect: false,
                        },
                        {
                            text: "Chamadas de sistema em servidores de rede pesados",
                            isCorrect: false,
                        },
                        {
                            text: "Fluxos de controle cheios de ifs aninhados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que costuma impedir a autovetorização de um laço?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dependência entre iterações e ponteiros que se sobrepõem",
                            isCorrect: true,
                        },
                        {
                            text: "Usar float em vez de double no corpo do laço vetorizado",
                            isCorrect: false,
                        },
                        {
                            text: "Arrays maiores que a cache L3 da máquina de destino",
                            isCorrect: false,
                        },
                        {
                            text: "Compilar o projeto com otimizações acima do nível O1 padrão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que vetorizar um laço dominado por cache miss quase não ajuda?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A espera pela memória engole o ganho das contas",
                            isCorrect: true,
                        },
                        {
                            text: "Instruções vetoriais desligam o prefetcher do chip",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador recusa vetorizar laços com arrays grandes",
                            isCorrect: false,
                        },
                        {
                            text: "Registradores largos aumentam os misses da cache L1",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O critério de otimização",
            blocks: [
                {
                    type: "text",
                    value: "# Perfil primeiro, opinião depois\n\nDesenvolvedores chutam mal onde o tempo vai: décadas de experiência com profilers mostram times surpresos com o próprio gargalo, uma geração após a outra. A única resposta profissional é PERFILAR: rodar perf record, visualizar num flamegraph e deixar o programa confessar onde gasta. Na maioria dos sistemas, uma fração pequena do código domina o tempo; o resto é paisagem.\n\nCom o perfil na mão, entra a lei de Amdahl: o ganho total é limitado pela fatia que você acelera. Se um trecho ocupa 10% do tempo, aceleração INFINITA dele entrega no máximo 1,11x no total. Um trecho de 60% acelerado em 3x entrega 1,67x. A matemática é cruel com otimização orgulhosa no lugar errado e generosa com melhoria modesta no lugar certo.\n\nDaí o método: perfile; ataque o dominante; prefira as alavancas grandes primeiro (algoritmo certo, estrutura de dados contígua, menos trabalho) antes das pequenas (micro-otimização); MEÇA depois de cada mudança com o protocolo da primeira aula; e pare quando o requisito estiver atendido. Otimização sem critério de parada vira hobby caro.",
                },
                {
                    type: "table",
                    value: '[["Situação","Atitude madura"],["Sem medição nenhuma","perfilar antes de opinar"],["Trecho com 3% do tempo","deixar legível e em paz"],["Trecho com 60% do tempo","otimizar e medir de novo"],["Ganho de 5% ao custo de código ilegível","recusar na revisão"],["O(n²) em coleção que cresce","trocar o algoritmo primeiro"]]',
                },
                {
                    type: "text",
                    value: "## A frase de Knuth inteira\n\n'Otimização prematura é a raiz de todo mal' virou desculpa pra nunca otimizar, mas a frase de Knuth continua: não devemos abrir mão das nossas oportunidades naquele 3% crítico. As duas metades juntas formam o critério completo: NÃO otimize sem evidência; otimize COM vontade onde a evidência aponta.\n\nLegibilidade é o padrão por um motivo econômico: código é lido dezenas de vezes por cada vez que é otimizado, e o código esperto cobra juros pra sempre: mais difícil de revisar, de mudar, de depurar às 3 da manhã. Quando um trecho PRECISAR ser esperto (o perfil mandou), pague o custo direito: comente o porquê, anexe o número que justificou (antes 480 ms, depois 95 ms) e proteja com um teste, pra próxima pessoa não simplificar de volta pra versão lenta.\n\nO fluxo completo, pra fechar o módulo: requisito claro, medir, perfilar, atacar o dominante na ordem das alavancas, medir de novo, parar no requisito. Repetido com disciplina, esse ciclo transforma otimização de arte obscura em rotina de engenharia.",
                },
                {
                    type: "quote",
                    value: "Escreva pra pessoas, otimize pra máquinas, e só na ordem certa: primeiro o perfil aponta, depois o número justifica, e o comentário explica o código esperto pra quem chegar depois.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o primeiro passo de qualquer otimização séria?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Perfilar pra descobrir onde o tempo é gasto",
                            isCorrect: true,
                        },
                        {
                            text: "Reescrever os laços internos em assembly",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a linguagem por uma mais rápida",
                            isCorrect: false,
                        },
                        {
                            text: "Ativar todas as flags de otimização e torcer",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o padrão pro código que não é gargalo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Legibilidade primeiro, sem esperteza desnecessária",
                            isCorrect: true,
                        },
                        {
                            text: "Otimizar do mesmo jeito, por consistência do time",
                            isCorrect: false,
                        },
                        {
                            text: "Marcar tudo como inline pra ajudar o compilador",
                            isCorrect: false,
                        },
                        {
                            text: "Converter os tipos pra inteiros sempre que possível",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pela lei de Amdahl, acelerar infinitamente um trecho de 10% do tempo rende quanto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "No máximo 1,11x no tempo total do programa",
                            isCorrect: true,
                        },
                        {
                            text: "Um ganho de 10x, proporcional ao trecho acelerado",
                            isCorrect: false,
                        },
                        {
                            text: "Exatamente 2x, o teto teórico de qualquer trecho",
                            isCorrect: false,
                        },
                        {
                            text: "Depende do clock: quanto maior, mais ganho total",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a ordem sensata das alavancas de otimização?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Algoritmo e layout de dados antes de micro-otimização",
                            isCorrect: true,
                        },
                        {
                            text: "Micro-otimizações primeiro, porque são mais baratas",
                            isCorrect: false,
                        },
                        {
                            text: "Assembly manual primeiro, compilador não é confiável",
                            isCorrect: false,
                        },
                        {
                            text: "Paralelizar tudo antes de olhar qualquer algoritmo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando o código esperto se justifica, o que deve acompanhá-lo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O porquê comentado, o número medido e um teste",
                            isCorrect: true,
                        },
                        {
                            text: "Uma versão lenta comentada logo abaixo da esperta",
                            isCorrect: false,
                        },
                        {
                            text: "A assinatura do autor pra futuras dúvidas do time",
                            isCorrect: false,
                        },
                        {
                            text: "Um pedido de exceção no linter e no formatador",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Projeto: decodificando um formato binário",
    aulas: [
        {
            titulo: "O formato SENS e o hexdump",
            blocks: [
                {
                    type: "text",
                    value: "# Um arquivo de sensor no seu colo\n\nO cenário do projeto: um datalogger fictício, o SENS-100, mede temperatura e grava as leituras num arquivo binário .sens. Você recebeu um arquivo de 42 bytes e a especificação do fabricante; a missão do módulo é decodificar TUDO na mão, no papel, sem rodar uma linha de código. É leitura guiada: cada aula avança um pedaço do arquivo.\n\nA especificação do cabeçalho, 16 bytes: um MAGIC NUMBER de 4 bytes com os caracteres SENS (0x53 0x45 0x4E 0x53); a versão do formato em u8; um byte de flags; a contagem de registros em u16 little-endian; o instante base em u32 little-endian (segundos Unix); e 4 bytes reservados, zerados. Depois vêm os registros de 8 bytes (assunto da aula 2) e um trailer de 2 bytes com checksum (aula 3).\n\nMagic number é o RG do formato: PNG começa com 89 50 4E 47, ZIP com 50 4B, ELF com 7F 45 4C 46. O comando file identifica arquivos exatamente assim, consultando um banco de magics. Quatro bytes no offset zero respondem a pergunta mais barata e mais útil que existe: que arquivo é você?",
                },
                {
                    type: "table",
                    value: '[["Offset","Tamanho","Campo","Tipo e conteúdo"],["0","4","magic","53 45 4E 53, os caracteres SENS"],["4","1","version","u8; aqui, 01"],["5","1","flags","u8; opções do arquivo"],["6","2","count","u16 little-endian; total de registros"],["8","4","base_timestamp","u32 little-endian; segundos Unix"],["12","4","reservado","zeros, guardados pro futuro"]]',
                },
                {
                    type: "code",
                    value: "$ hexdump -C leitura.sens\n00000000  53 45 4e 53 01 00 03 00  00 00 70 69 00 00 00 00  |SENS......pi....|\n00000010  0a 00 01 00 2e 09 00 00  14 00 02 00 6c 09 00 00  |............l...|\n00000020  1e 00 01 01 6a ff 00 00  6c 04                    |....j...l.|\n0000002a",
                },
                {
                    type: "text",
                    value: "## Lendo o cabeçalho no dump\n\nConfira no hexdump, campo a campo. Offsets 0 a 3: 53 45 4E 53, e a coluna ASCII confirma SENS: o arquivo é dos nossos. Offset 4: versão 01. Offset 5: flags 00, nenhuma opção ligada. Offsets 6 e 7: a contagem, 03 00; em little-endian o byte baixo vem primeiro, então isso é 3, e não 768: o arquivo promete três registros. Offsets 8 a 11: o instante base, 00 00 70 69, que lido de trás pra frente vira 0x69700000, ou 1.768.947.712 segundos Unix: 20 de janeiro de 2026. Offsets 12 a 15: reservado, tudo zero, como manda a especificação.\n\nRepare em dois hábitos de leitura. Primeiro, a coluna ASCII é sua amiga: o SENS salta aos olhos, e o pi que aparece em 70 69 é só coincidência simpática de bytes que também são letras imprimíveis. Segundo, TODO campo multi-byte deste formato é little-endian: você vai ler de trás pra frente tantas vezes neste módulo que o gesto vira automático. É treino de verdade, e é exatamente o treino que o módulo 2 desta trilha prometeu que um dia valeria dinheiro.",
                },
                {
                    type: "quote",
                    value: "Hexdump não se lê byte a byte, se lê com o mapa do lado: primeiro o magic diz QUEM é o arquivo, depois cada offset diz o que perguntar pra ele.",
                },
            ],
            questions: [
                {
                    statement: "Pra que servem os 4 primeiros bytes (o magic number)?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Identificar o formato logo na abertura do arquivo",
                            isCorrect: true,
                        },
                        {
                            text: "Guardar o tamanho total do arquivo comprimido",
                            isCorrect: false,
                        },
                        {
                            text: "Armazenar a data em que o arquivo foi gravado",
                            isCorrect: false,
                        },
                        {
                            text: "Criptografar o restante do cabeçalho contra alterações",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O campo count traz os bytes 03 00. Quantos registros o arquivo tem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Três: em little-endian, o byte baixo vem primeiro",
                            isCorrect: true,
                        },
                        {
                            text: "Setecentos e sessenta e oito, lendo os bytes na ordem",
                            isCorrect: false,
                        },
                        {
                            text: "Trinta, somando os dois bytes do campo em decimal",
                            isCorrect: false,
                        },
                        {
                            text: "Zero: o primeiro byte diferente de zero invalida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como ler os bytes 00 00 70 69 do base_timestamp?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "De trás pra frente: 0x69700000, janeiro de 2026",
                            isCorrect: true,
                        },
                        {
                            text: "Na ordem em que estão: 0x00007069, março de 1970",
                            isCorrect: false,
                        },
                        {
                            text: "Somando os quatro valores e multiplicando por 256",
                            isCorrect: false,
                        },
                        {
                            text: "Como dois u16 separados: ano e dia do calendário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a coluna ASCII do hexdump mostra 'pi' no cabeçalho?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "0x70 e 0x69 são os códigos das letras p e i",
                            isCorrect: true,
                        },
                        {
                            text: "O formato grava a assinatura do fabricante ali",
                            isCorrect: false,
                        },
                        {
                            text: "O hexdump traduz números pra letras aleatórias",
                            isCorrect: false,
                        },
                        {
                            text: "É o resto do magic SENS gravado em minúsculas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O magic confere, então o arquivo está íntegro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Não: o magic identifica, não valida o conteúdo",
                            isCorrect: true,
                        },
                        {
                            text: "Sim: um magic válido garante o arquivo completo",
                            isCorrect: false,
                        },
                        {
                            text: "Sim, desde que a versão também seja conhecida",
                            isCorrect: false,
                        },
                        {
                            text: "Não: o magic precisa ser conferido com o count",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Offsets, alinhamento e os registros",
            blocks: [
                {
                    type: "text",
                    value: "# O registro de 8 bytes\n\nDepois dos 16 bytes de cabeçalho vêm os registros, todos com o MESMO tamanho: 8 bytes. A regularidade é uma decisão de projeto com três dividendos. Primeiro, endereçamento por aritmética: o registro i (contando do zero) começa no offset 16 + 8i, sem precisar ler os anteriores; acesso aleatório de graça. Segundo, 8 é potência de dois: multiplicar por 8 é um shift, e leitores mapeiam blocos alinhados sem padding surpresa. Terceiro, os dois bytes reservados no fim de cada registro compram futuro: campos novos sem mudar o tamanho.\n\nO layout interno também respeita alinhamento: os campos u16 caem nos offsets pares 0, 4 e 6 do registro; os u8 preenchem 2 e 3. Um leitor em C pode declarar a struct correspondente e ela casa byte a byte com o arquivo, sem nenhum enchimento inserido pelo compilador.\n\nCom a fórmula na mão, o mapa do nosso arquivo fecha: registros nos offsets 16, 24 e 32 (0x10, 0x18 e 0x20), e o trailer de 2 bytes no offset 40 (0x28). Os 42 bytes do arquivo conferem exatos.",
                },
                {
                    type: "table",
                    value: '[["Offset no registro","Tamanho","Campo","Significado"],["0","2","t_offset","segundos desde a base (u16 LE)"],["2","1","sensor_id","qual sensor mediu"],["3","1","status","0 normal; bit 0 ligado = alerta"],["4","2","value","temperatura em centésimos de grau (i16 LE)"],["6","2","reservado","zeros; mantém o registro em 8 bytes"]]',
                },
                {
                    type: "text",
                    value: "## Decodificando os três registros\n\nRegistro 0, offset 16: 0A 00 01 00 2E 09 00 00. O t_offset é 0A 00, ou seja, 10 segundos após a base; sensor_id 01; status 00, tudo normal; value 2E 09, que lido de trás pra frente é 0x092E, 2350 em decimal: como o campo guarda centésimos de grau, 23,50 graus.\n\nRegistro 1, offset 24: 14 00 02 00 6C 09 00 00. Vinte segundos após a base, sensor 2, status normal, value 0x096C igual a 2412: 24,12 graus.\n\nRegistro 2, offset 32: 1E 00 01 01 6A FF 00 00. Trinta segundos, sensor 1 de novo, e duas novidades. O status é 01: bit 0 ligado, alerta, e a tabela de bits do módulo 2 volta ao palco. E o value é 6A FF: lido como 0xFF6A, o bit mais alto está LIGADO, então este i16 é negativo: 0xFF6A vale 65.386 sem sinal; subtraindo 65.536, dá -150: a leitura é -1,50 graus. O complemento de dois do módulo 1, agora no mundo real, dentro de um arquivo de verdade.\n\nE o offset absoluto de qualquer campo é base do registro mais offset interno: o value do registro i mora em 16 + 8i + 4.",
                },
                {
                    type: "quote",
                    value: "Offset é aritmética, não mistério: cabeçalho de 16, registros de 8, o registro i começa em 16 + 8i. Quem sabe somar já navega o arquivo inteiro de olhos fechados.",
                },
            ],
            questions: [
                {
                    statement: "Onde começa o registro de índice i (contando do zero)?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No offset 16 + 8i: cabeçalho mais registros anteriores",
                            isCorrect: true,
                        },
                        {
                            text: "No offset 8 + 16i, logo depois do bloco de checksum",
                            isCorrect: false,
                        },
                        {
                            text: "No offset 16i, porque o cabeçalho conta como registro",
                            isCorrect: false,
                        },
                        {
                            text: "Depende do arquivo: cada registro anota o próprio início",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quantos bytes tem cada registro do formato SENS?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Oito bytes: seis de campos e dois reservados",
                            isCorrect: true,
                        },
                        {
                            text: "Dezesseis bytes, o mesmo tamanho do cabeçalho",
                            isCorrect: false,
                        },
                        {
                            text: "Seis bytes, sem nenhum espaço desperdiçado",
                            isCorrect: false,
                        },
                        {
                            text: "Quatro bytes, um por campo de informação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Os bytes 6C 09 no campo value representam quanto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "0x096C, ou seja, 2412: a leitura é 24,12 graus",
                            isCorrect: true,
                        },
                        {
                            text: "0x6C09, ou seja, 27657: a leitura é 276,57 graus",
                            isCorrect: false,
                        },
                        {
                            text: "0x096C, ou seja, 2412: a leitura é 2.412 graus",
                            isCorrect: false,
                        },
                        {
                            text: "0x6C09 dividido por 16, cerca de 1.728 graus",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No terceiro registro, value traz 6A FF. Qual é a temperatura?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "-1,50 graus: 0xFF6A é -150 em complemento de dois",
                            isCorrect: true,
                        },
                        {
                            text: "653,30 graus: 0xFF6A vale 65386 lido sem sinal",
                            isCorrect: false,
                        },
                        {
                            text: "27,38 graus: basta inverter os dois bytes do campo",
                            isCorrect: false,
                        },
                        {
                            text: "O campo é inválido: temperatura nunca é negativa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o papel dos dois bytes reservados de cada registro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Manter 8 bytes redondos e abrir espaço pra evoluir",
                            isCorrect: true,
                        },
                        {
                            text: "Guardar uma cópia do checksum de cada registro",
                            isCorrect: false,
                        },
                        {
                            text: "Separar visualmente os registros na saída do hexdump",
                            isCorrect: false,
                        },
                        {
                            text: "Marcar o fim da leitura pro parser do fabricante",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Integridade: checksum e CRC",
            blocks: [
                {
                    type: "text",
                    value: "# Bits mentem: verifique\n\nTodo meio de armazenamento e transmissão erra de vez em quando: um bit virado no disco, ruído num fio, um pacote mastigado no caminho. Formato sério carrega VERIFICAÇÃO DE INTEGRIDADE, e o SENS usa a mais simples: um checksum de 16 bits no trailer, definido como a soma de TODOS os bytes do cabeçalho e dos registros, módulo 65.536, gravada em little-endian.\n\nVamos conferir o nosso arquivo, por partes. Os 16 bytes do cabeçalho somam 534 (o magic sozinho contribui com 313). O registro 0 soma 66; o registro 1, 139; o registro 2, 393 (o byte FF pesa 255 sozinho). Total: 534 + 66 + 139 + 393 = 1.132, que em hexadecimal é 0x046C. O trailer diz 6C 04, little-endian pra 0x046C: CONFERE, o arquivo está consistente com a própria promessa.\n\nNa leitura, o verificador refaz essa conta e compara. Troque um único byte (o 2E do primeiro value virando 2F) e a soma vai a 1.133, 0x046D: diferente do trailer, arquivo marcado como corrompido. Um flip de bit qualquer no meio dos dados não passa despercebido.",
                },
                {
                    type: "code",
                    value: '# verificacao, em pseudocodigo\nsoma = 0\npara cada byte b do cabecalho e dos registros:\n    soma = (soma + b) % 65536\nse soma != checksum_do_trailer:\n    rejeitar("arquivo corrompido")\n\n# nosso arquivo: 534 + 66 + 139 + 393 = 1132 = 0x046C -> trailer 6C 04: ok\n# troque 2E por 2F e a soma vira 0x046D: detectado',
                },
                {
                    type: "text",
                    value: "## Da soma ao CRC: o que cada régua pega\n\nA soma tem buracos conhecidos. Ela é CEGA À ORDEM: trocar os bytes 2E 09 por 09 2E mantém a soma intacta, mas o valor lido muda de 23,50 pra 117,85 graus (0x2E09 é 11.785); o arquivo passaria na verificação contando uma mentira. E dois erros podem se compensar: um byte que sobe 1 e outro que desce 1 se anulam na soma.\n\nPra esses casos existe o CRC: trata os bits como um polinômio, divide por um polinômio gerador e guarda o RESTO da divisão. A matemática garante detecção de rajadas de erro até a largura do código e sensibilidade à ordem dos bytes; por isso PNG, ZIP e Ethernet carregam CRC-32, com custo de cálculo quase igual ao da soma graças a tabelas pré-calculadas.\n\nO limite dos dois: detectam ACIDENTE, não ATAQUE. Um adversário que altera o arquivo recalcula checksum e CRC no caminho; contra ele a régua é outra, hash criptográfico e assinatura. E onde a verificação mora: em arquivos, no trailer, cobrindo tudo que veio antes; em protocolos, por quadro ou pacote, pra descartar e repedir só o pedaço ruim.",
                },
                {
                    type: "table",
                    value: '[["Método","Detecta bem","Fica cego a","Custo"],["Soma simples","flips isolados","ordem trocada; erros compensados","mínimo"],["CRC-32","rajadas e trocas de ordem","adversário que recalcula","baixo, com tabela"],["Hash criptográfico","qualquer alteração, até maliciosa","nada relevante na prática","mais alto"]]',
                },
                {
                    type: "quote",
                    value: "Checksum não impede corrupção, denuncia: o arquivo continua podendo quebrar no disco ou no fio; a diferença é você descobrir na leitura, e não três meses depois, num relatório errado.",
                },
            ],
            questions: [
                {
                    statement: "Onde o formato SENS guarda o checksum?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No trailer, os 2 bytes finais depois dos registros",
                            isCorrect: true,
                        },
                        {
                            text: "No cabeçalho, logo depois do número mágico SENS",
                            isCorrect: false,
                        },
                        {
                            text: "Dentro de cada registro, nos bytes reservados",
                            isCorrect: false,
                        },
                        {
                            text: "Num arquivo auxiliar separado com a extensão .sum",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a soma simples de bytes detecta bem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Bits trocados isolados, o acidente mais comum",
                            isCorrect: true,
                        },
                        {
                            text: "Qualquer alteração, inclusive as maliciosas",
                            isCorrect: false,
                        },
                        {
                            text: "A troca de ordem entre dois bytes vizinhos",
                            isCorrect: false,
                        },
                        {
                            text: "Erros duplos que se compensam byte a byte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a fraqueza clássica da soma como verificação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Bytes fora de ordem produzem a mesma soma",
                            isCorrect: true,
                        },
                        {
                            text: "O cálculo é lento demais pra arquivos grandes",
                            isCorrect: false,
                        },
                        {
                            text: "A soma só funciona com arquivos de tamanho par",
                            isCorrect: false,
                        },
                        {
                            text: "O resultado depende da máquina que calcula",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que ZIP, PNG e Ethernet preferem CRC à soma simples?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O CRC pega rajadas e trocas de ordem que a soma perde",
                            isCorrect: true,
                        },
                        {
                            text: "O CRC é criptográfico e impede adulteração de dados",
                            isCorrect: false,
                        },
                        {
                            text: "O CRC comprime o arquivo enquanto calcula a verificação",
                            isCorrect: false,
                        },
                        {
                            text: "A soma simples exige percorrer o arquivo duas vezes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Checksum e CRC protegem contra um adversário que altera o arquivo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Não: quem altera de propósito recalcula o valor",
                            isCorrect: true,
                        },
                        {
                            text: "Sim, desde que o CRC use 32 bits ou mais de largura",
                            isCorrect: false,
                        },
                        {
                            text: "Sim: o polinômio do CRC é segredo do fabricante",
                            isCorrect: false,
                        },
                        {
                            text: "Não, mas dobrar o checksum resolve o problema",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Evolução do formato: versão e reservas",
            blocks: [
                {
                    type: "text",
                    value: "# Formatos vivem mais que programas\n\nO SENS-100 vai ganhar sucessor, e os arquivos antigos não vão desaparecer: formato binário é um contrato de LONGO prazo. A ferramenta central de sobrevivência é o byte de versão que está no offset 4 desde a primeira aula: ele permite que o leitor saiba, antes de interpretar qualquer campo, se fala aquele dialeto.\n\nVamos evoluir o formato de verdade. A v2 precisa gravar a taxa de amostragem e o nível de bateria. O jeito errado: enfiar os campos no meio do cabeçalho, empurrando os demais; todo leitor v1 passaria a ler lixo em todos os offsets seguintes. O jeito certo: estrear os campos NO ESPAÇO RESERVADO: os 4 bytes dos offsets 12 a 15 viram sample_rate u16 LE, battery u8 e um byte ainda reservado, e a versão sobe pra 02. Nenhum offset existente se move um milímetro.\n\nÉ por isso que a disciplina de zerar reservados na escrita, que parecia burocracia, era investimento: como todo escritor v1 gravou zeros ali, um leitor v2 abrindo arquivo v1 lê sample_rate 0 e trata como desconhecido, um default limpo e seguro.",
                },
                {
                    type: "table",
                    value: '[["Regra de evolução","Por quê"],["Nunca mover campo publicado","leitores antigos leriam lixo"],["Estrear campos no espaço reservado","offsets existentes não mudam"],["Anunciar extras em bits de flags","leitor velho ignora com segurança"],["Subir a versão em toda quebra","o leitor sabe quando recusar"],["Zerar reservados na escrita","default confiável pro futuro"]]',
                },
                {
                    type: "text",
                    value: "## As duas direções da compatibilidade\n\nCompatibilidade PRA TRÁS: o leitor novo abre arquivo velho. É a mais fácil de garantir, e o exemplo acima mostra a receita: campos novos com default sensato quando ausentes ou zerados. Compatibilidade PRA FRENTE: o leitor VELHO encontra arquivo novo. Essa só existe se o formato foi desenhado pra ela: tamanhos explícitos que permitem pular o que não se conhece, flags anunciando extras opcionais, e a regra de ouro de nunca mudar significado, tamanho ou offset de campo publicado. No SENS, um leitor v1 diante de version 02 tem uma única postura segura: recusar com mensagem clara, porque o formato não prometeu legibilidade futura.\n\nO degrau seguinte dessa escada, quando o formato cresce de verdade, é a estrutura em CHUNKS no estilo do PNG: cada bloco anuncia um tipo e um tamanho, e leitores pulam com segurança os tipos que não conhecem; é a compatibilidade pra frente institucionalizada.\n\nFica o resumo do projeto até aqui: versão governa, reservado é berço de campo novo, offsets publicados são sagrados, e cada byte zerado hoje é uma porta aberta amanhã.",
                },
                {
                    type: "quote",
                    value: "Formato bom envelhece em público: arquivos de dez anos atrás ainda abrem, leitores de dez anos atrás ainda funcionam. Cada byte reservado de hoje é a licença de crescer amanhã sem quebrar ninguém.",
                },
            ],
            questions: [
                {
                    statement: "Pra que serve o byte de versão do cabeçalho?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pro leitor decidir se sabe interpretar o arquivo",
                            isCorrect: true,
                        },
                        {
                            text: "Pra registrar quantas vezes o arquivo foi salvo",
                            isCorrect: false,
                        },
                        {
                            text: "Pra indicar a versão do sistema operacional usado",
                            isCorrect: false,
                        },
                        {
                            text: "Pra ordenar os arquivos por idade no diretório",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "De onde um campo novo deve nascer numa versão futura?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Do espaço reservado, mantendo os offsets antigos",
                            isCorrect: true,
                        },
                        {
                            text: "Do início do cabeçalho, empurrando os demais campos",
                            isCorrect: false,
                        },
                        {
                            text: "De um segundo magic number no meio do arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "Da compressão dos campos antigos em menos bytes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é compatibilidade pra trás (backward)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O leitor novo abre arquivos das versões antigas",
                            isCorrect: true,
                        },
                        {
                            text: "O leitor antigo abre arquivos das versões novas",
                            isCorrect: false,
                        },
                        {
                            text: "O escritor grava duas cópias, uma por versão",
                            isCorrect: false,
                        },
                        {
                            text: "O arquivo aceita edição sem recalcular checksum",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o escritor deve zerar os campos reservados?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pra versão futura poder confiar no valor padrão",
                            isCorrect: true,
                        },
                        {
                            text: "Pra soma de verificação do arquivo ficar menor",
                            isCorrect: false,
                        },
                        {
                            text: "Pra compressão do arquivo alcançar taxa máxima",
                            isCorrect: false,
                        },
                        {
                            text: "Pra impedir que leitores antigos leiam o campo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um leitor v1 encontra um arquivo v2 desconhecido. Qual é a postura segura?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Recusar com erro claro em vez de ler campo errado",
                            isCorrect: true,
                        },
                        {
                            text: "Ler mesmo assim: offsets antigos nunca mudam de lugar",
                            isCorrect: false,
                        },
                        {
                            text: "Converter o arquivo pra v1 apagando o que sobrar",
                            isCorrect: false,
                        },
                        {
                            text: "Ignorar a versão: o magic já validou o formato",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fechamento: o mapa mental do baixo nível",
            blocks: [
                {
                    type: "text",
                    value: "# O mapa que fica\n\nSete módulos atrás, um número era só um número. Agora você sabe que ele é um padrão de bits com um contrato de leitura (módulo 1), manipulável bit a bit (módulo 2), processado por um loop eterno que aposta no futuro (módulo 3), buscado numa hierarquia em que a distância custa ordens de grandeza (módulo 4), dentro de um binário com seções, convenções e fronteiras bem definidas (módulo 5), e que toda afirmação sobre desempenho se decide com medida, não com opinião (módulo 6). Neste módulo final, o mapa inteiro trabalhou junto: você decodificou um arquivo binário na mão, byte a byte, offset a offset.\n\nO ganho não é decorar latências: é a MUDANÇA DE LEITURA. Uma string agora é bytes com codificação. Um loop é um padrão de acesso à memória. Um if é uma aposta do previsor. Um print é um buffer na frente de uma syscall. Um sizeof é alinhamento e padding. Um arquivo é campos com offsets, endianness e uma soma de verificação no fim.\n\nEsse olhar não substitui os andares de cima; sustenta todos eles, em qualquer stack.",
                },
                {
                    type: "table",
                    value: '[["Andar","Ideia central","Pergunta que você passou a fazer"],["Representação","bits só significam por contrato","que bytes são esses, de verdade?"],["CPU","um loop que busca, decodifica e executa","esse desvio é previsível?"],["Memória","a distância custa ordens de grandeza","onde esse dado mora e quem são os vizinhos?"],["Fonte ao binário","seções, convenções e fronteiras","o que essa linha custa por baixo?"],["Medição","número antes de opinião","o que diz o perfil?"]]',
                },
                {
                    type: "text",
                    value: "## Pra manter o óculos limpo\n\nO conhecimento desta trilha se conserva com uso, e as doses são pequenas. Rode hexdump num PNG e cumprimente o magic 89 50 4E 47. Cole um loop seu no Compiler Explorer (godbolt.org) e leia o assembly com os olhos do módulo 3. Rode perf stat num programa qualquer e interprete IPC e misses. Reordene os campos de uma struct real e meça o sizeof antes e depois. Abra o cabeçalho de um BMP com a tabela do formato do lado e decodifique como fizemos aqui, no papel.\n\nNada disso exige projeto grande: são exercícios de dez minutos que mantêm o modelo mental vivo. E o modelo viaja bem: vale em qualquer linguagem, framework ou área que você escolher daqui em diante, porque TODO software, do site ao firmware, termina em bytes, ciclos e páginas.\n\nO baixo nível não é um lugar aonde se vai; é um óculos que se usa. Você montou o seu ao longo de sete módulos, peça por peça. A partir de agora, o trabalho é só não deixar o óculos guardado na gaveta.",
                },
                {
                    type: "quote",
                    value: "Você não precisa programar em assembly pra pensar como a máquina: precisa lembrar que toda abstração desce até bytes, ciclos e páginas, e que esse chão continua firme embaixo de qualquer framework.",
                },
            ],
            questions: [
                {
                    statement: "Quais são os andares do mapa mental da trilha?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Representação, CPU, memória, binário e medição",
                            isCorrect: true,
                        },
                        {
                            text: "Sintaxe, semântica, compilação, deploy e logs",
                            isCorrect: false,
                        },
                        {
                            text: "Frontend, backend, banco, rede e infraestrutura",
                            isCorrect: false,
                        },
                        {
                            text: "Hardware, firmware, driver, kernel e usuário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Diante de um programa lento, qual é o primeiro reflexo certo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Medir com perfil antes de mexer em qualquer linha",
                            isCorrect: true,
                        },
                        {
                            text: "Reescrever as partes feias na linguagem mais rápida",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a máquina até o problema desaparecer",
                            isCorrect: false,
                        },
                        {
                            text: "Adicionar threads pra dividir o trabalho lento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Depois da trilha, o que muda ao ler código que manipula strings?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Você passa a ver bytes e codificação sob o texto",
                            isCorrect: true,
                        },
                        {
                            text: "Strings passam a ser sempre convertidas pra ASCII",
                            isCorrect: false,
                        },
                        {
                            text: "Toda string deve ser comparada por ponteiro puro",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho vira sempre o número de letras visíveis",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No nível da máquina, o que um if do seu código vira?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um desvio condicional que o previsor tenta acertar",
                            isCorrect: true,
                        },
                        {
                            text: "Uma consulta ao kernel sobre o valor da condição",
                            isCorrect: false,
                        },
                        {
                            text: "Uma tabela de decisão gravada na seção de dados",
                            isCorrect: false,
                        },
                        {
                            text: "Uma nova thread pra cada um dos dois caminhos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a síntese da trilha inteira?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Toda abstração desce a bytes, ciclos e páginas",
                            isCorrect: true,
                        },
                        {
                            text: "Só código em assembly alcança desempenho real",
                            isCorrect: false,
                        },
                        {
                            text: "Abstrações modernas eliminam o custo do hardware",
                            isCorrect: false,
                        },
                        {
                            text: "Baixo nível é um lugar aonde poucos precisam ir",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

export const MODULOS: Modulo[] = [
    MODULO_1,
    MODULO_2,
    MODULO_3,
    MODULO_4,
    MODULO_5,
    MODULO_6,
    MODULO_7,
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: LEVEL,
                description: DESCRICAO,
                workloadHours: CARGA_HORARIA,
            })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    } else {
        const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
        if (existentes.length > 0) {
            console.log(
                "Trilha " + NOME + " ja tem " + existentes.length + " aulas. Nada a fazer.",
            );
            return;
        }
        await db
            .update(trails)
            .set({ workloadHours: CARGA_HORARIA, description: DESCRICAO, trailLevel: LEVEL })
            .where(eq(trails.id, trilha.id));
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
        "Seed concluido: " +
            MODULOS.length +
            " modulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questoes.",
    );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("Falha no seed:", e);
            process.exit(1);
        });
}
