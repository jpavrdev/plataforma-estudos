// Seed da trilha Compiladores e Toolchain, estagio 6 do roadmap.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-compiladores-e-toolchain.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Compiladores e Toolchain";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "A caixa preta vira caixa de vidro: as fases da compilação, lexer, parser e AST, otimizações e o papel do undefined behavior, o linker e seus erros famosos, build systems com make e CMake, cross-compilation e as ferramentas que separam amador de profissional: sanitizers, análise estática e debugger.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - O caminho do código",
    aulas: [
        {
            titulo: "As quatro fases da compilação",
            blocks: [
                {
                    type: "text",
                    value: "# Um comando, quatro programas\n\nQuando você roda gcc ola.c -o ola, parece que um programa só faz tudo. Por baixo, o gcc é um maestro que chama quatro ferramentas em sequência: o pré-processador, o compilador propriamente dito, o assembler e o linker. Cada uma consome o produto da anterior e entrega algo novo, como estações de uma linha de montagem.\n\nO pré-processador pega o seu .c, resolve #include e #define e entrega uma unidade de tradução: código C puro, sem diretivas. O compilador traduz esse C em assembly, o texto com as instruções da sua CPU. O assembler converte o assembly em um arquivo objeto, o .o, que já é código de máquina, mas cheio de buracos: endereços que ainda não existem. O linker fecha esses buracos juntando os seus objetos com as bibliotecas e produz o executável.\n\nA boa notícia é que você pode parar a linha em qualquer estação. A flag -E para depois do pré-processador, -S para depois do compilador e te deixa ler o assembly, -c para depois do assembler e guarda o .o. Sem flag nenhuma, o gcc vai até o fim e chama o linker.",
                },
                {
                    type: "table",
                    value: '[["Fase","Consome","Produz","Flag pra parar ali"],["Pré-processador","fonte .c com diretivas","C expandido (a unidade de tradução)","-E"],["Compilador","C expandido","assembly .s","-S"],["Assembler","assembly .s","objeto .o","-c"],["Linker","objetos .o e bibliotecas","executável","nenhuma (é o fim da linha)"]]',
                },
                {
                    type: "code",
                    value: "gcc -E ola.c -o ola.i    # pré-processador: C expandido\ngcc -S ola.i -o ola.s    # compilador: assembly legível\ngcc -c ola.s -o ola.o    # assembler: objeto binário\ngcc ola.o -o ola         # linker: executável final\n\n# O atalho de todo dia dispara as quatro fases de uma vez:\ngcc ola.c -o ola",
                },
                {
                    type: "text",
                    value: "## Por que decompor importa\n\nSaber em qual fase você está muda o diagnóstico. Um erro que fala de arquivo não encontrado num #include nasceu no pré-processador. Uma mensagem como error: expected ';' before 'return' é o compilador reclamando de sintaxe. Já undefined reference to 'soma' nem é do compilador: é o linker avisando que alguém prometeu uma função que nenhum objeto entregou. Quem não conhece as fases lê tudo como erro de compilação genérico e procura a causa no lugar errado.\n\nA decomposição também é a chave dos builds grandes. Projetos reais compilam cada arquivo com -c, muitas vezes em paralelo, e só no final chamam o linker uma vez pra juntar os objetos. É isso que o make automatiza, como você vai ver no módulo 5: recompilar apenas o .o cujo fonte mudou e refazer o link, em vez de reconstruir o mundo a cada alteração.\n\nGuarde o vocabulário, porque ele volta a trilha inteira: o pré-processador expande texto, o compilador traduz pra assembly, o assembler gera objeto, o linker junta tudo. Nos próximos módulos vamos abrir cada uma dessas caixas, e esse mapa diz onde cada conceito mora.",
                },
                {
                    type: "quote",
                    value: "Dizer que deu erro de compilação é diagnóstico preguiçoso: o profissional pergunta primeiro qual das quatro fases reclamou, porque cada uma denuncia um tipo diferente de problema.",
                },
            ],
            questions: [
                {
                    statement: "No fluxo do gcc, qual ferramenta produz o executável final?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O linker, juntando os objetos e as bibliotecas",
                            isCorrect: true,
                        },
                        {
                            text: "O assembler, logo depois de traduzir o assembly",
                            isCorrect: false,
                        },
                        {
                            text: "O pré-processador, ao expandir todos os #include",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador, assim que termina a análise do fonte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a flag -c pede ao gcc?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Parar depois do assembler e guardar o objeto .o",
                            isCorrect: true,
                        },
                        {
                            text: "Parar depois do pré-processador e mostrar o C expandido",
                            isCorrect: false,
                        },
                        {
                            text: "Rodar somente o linker sobre os objetos já prontos",
                            isCorrect: false,
                        },
                        {
                            text: "Gerar o assembly comentado pra leitura no editor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você roda gcc -E programa.c e olha a saída. O que espera encontrar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Código C expandido, com os #include já colados",
                            isCorrect: true,
                        },
                        {
                            text: "As instruções assembly geradas pro processador",
                            isCorrect: false,
                        },
                        {
                            text: "A representação intermediária usada nas otimizações",
                            isCorrect: false,
                        },
                        {
                            text: "A lista de símbolos indefinidos de cada objeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A mensagem undefined reference to 'soma' aparece em qual fase e por quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "No link, porque nenhum objeto define o símbolo soma",
                            isCorrect: true,
                        },
                        {
                            text: "Na compilação, porque falta o protótipo da função soma",
                            isCorrect: false,
                        },
                        {
                            text: "No pré-processamento, porque o header não foi achado",
                            isCorrect: false,
                        },
                        {
                            text: "No assembler, porque o mnemônico soma não existe na CPU",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a compilação de main.c pode terminar sem erro mesmo que a função soma, chamada nela, não esteja definida em arquivo nenhum?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O compilador confia na declaração; quem cobra o corpo é o linker",
                            isCorrect: true,
                        },
                        {
                            text: "O gcc gera um corpo vazio provisório e remove esse stub no final",
                            isCorrect: false,
                        },
                        {
                            text: "O assembler resolve a chamada apontando pro endereço da pilha",
                            isCorrect: false,
                        },
                        {
                            text: "O pré-processador descarta chamadas sem definição visível no .c",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O pré-processador: colagem e perigos",
            blocks: [
                {
                    type: "text",
                    value: '# Tesoura e cola antes do compilador\n\nO pré-processador não sabe C. Ele enxerga texto e diretivas começadas em #, e trabalha como tesoura e cola: #include "mat.h" é literalmente substituído pelo conteúdo do arquivo mat.h, linha por linha. É por isso que um header com erro de sintaxe explode dentro do .c que o incluiu: depois da colagem, o compilador vê um arquivo único e contínuo.\n\n#define cria macros, substituição de texto pura. #define PI 3.14159 troca todo PI pelo número antes de o compilador acordar. Macros com parâmetros parecem funções, mas não são: #define DOBRO(x) x * 2 aplicado a DOBRO(1 + 2) expande pra 1 + 2 * 2, que vale 5, não 6, porque a multiplicação tem precedência. A defesa clássica é parentesizar tudo: ((x) * 2). Macro com efeito colateral é pior ainda: MAX(a++, b) pode incrementar a duas vezes, porque o argumento é colado duas vezes no texto expandido.\n\nDiretivas condicionais como #ifdef e #if compilam trechos só em certas plataformas ou configurações, e são o mecanismo por trás dos include guards.',
                },
                {
                    type: "code",
                    value: "/* mat.h protegido por include guard */\n#ifndef MAT_H\n#define MAT_H\nint soma(int a, int b);\n#endif\n\n/* Alternativa aceita por GCC, Clang e MSVC: */\n#pragma once\n\n/* O perigo clássico da macro sem parênteses: */\n#define DOBRO(x) x * 2\nint r = DOBRO(1 + 2);   /* expande pra 1 + 2 * 2 = 5, não 6 */",
                },
                {
                    type: "table",
                    value: '[["Diretiva","O que faz","Risco típico"],["#include","cola o arquivo inteiro no ponto","inclusão dupla sem guard"],["#define constante","troca de texto antes de compilar","some dos tipos e do debugger"],["#define com parâmetros","macro que imita função","precedência e efeito colateral"],["#ifdef / #if","compila o trecho condicionalmente","variantes sem teste"],["#pragma once","guard automático do arquivo","fora do padrão formal, embora universal"]]',
                },
                {
                    type: "text",
                    value: "## Guards, pragma once e o que o C++20 muda\n\nSem proteção, um header incluído duas vezes na mesma unidade de tradução é colado duas vezes, e as definições duplicadas viram erro. O include guard resolve com #ifndef MAT_H seguido de #define MAT_H: na segunda colagem o símbolo já existe e o conteúdo inteiro é pulado. #pragma once faz o mesmo em uma linha; não consta no padrão da linguagem, mas em 2026 GCC, Clang e MSVC suportam sem drama, e muita base de código o adota.\n\nA colagem tem um custo que você paga em tempo de build: cada .cpp que inclui um header gigante recompila aquele texto todo. Os módulos do C++20 atacam exatamente isso: import mat; não cola texto, importa uma interface já compilada uma única vez. Em 2026 o suporte em GCC, Clang e nos build systems ainda é desigual, então headers seguem dominando os projetos reais, mas a direção é essa.\n\nRegra prática pra fechar: prefira constantes const ou constexpr e funções inline a macros; deixe o pré-processador pros guards e pra compilação condicional de plataforma.",
                },
                {
                    type: "quote",
                    value: "Macro não é função: é texto colado às pressas. Cada dez caracteres que ela economiza são cobrados depois em parênteses, efeitos colaterais duplicados e horas de depuração.",
                },
            ],
            questions: [
                {
                    statement: 'O que o pré-processador faz ao encontrar #include "mat.h"?',
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cola o conteúdo do arquivo mat.h naquele ponto",
                            isCorrect: true,
                        },
                        {
                            text: "Anota o header pra que o linker o carregue depois",
                            isCorrect: false,
                        },
                        {
                            text: "Compila mat.h em separado e importa os símbolos",
                            isCorrect: false,
                        },
                        {
                            text: "Cria uma referência resolvida em tempo de execução",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Pra que serve um include guard?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Evitar colar o mesmo header duas vezes na mesma unidade",
                            isCorrect: true,
                        },
                        {
                            text: "Impedir que dois arquivos .c diferentes usem o header",
                            isCorrect: false,
                        },
                        {
                            text: "Esconder as funções internas do header dos outros módulos",
                            isCorrect: false,
                        },
                        {
                            text: "Acelerar o linker removendo símbolos repetidos do objeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Com #define DOBRO(x) x * 2, qual o resultado de DOBRO(1 + 2)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Vale 5: a colagem gera 1 + 2 * 2 e o produto vem antes",
                            isCorrect: true,
                        },
                        {
                            text: "Vale 6: a macro avalia o argumento antes de substituir",
                            isCorrect: false,
                        },
                        {
                            text: "Vale 4: só o primeiro termo da soma entra na expansão",
                            isCorrect: false,
                        },
                        {
                            text: "Não compila: macro não aceita expressão como argumento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual a vantagem central dos módulos do C++20 sobre o #include tradicional?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Importam interface compilada em vez de colar texto",
                            isCorrect: true,
                        },
                        {
                            text: "Eliminam a necessidade de linkar bibliotecas externas",
                            isCorrect: false,
                        },
                        {
                            text: "Permitem usar macros com segurança dentro dos headers",
                            isCorrect: false,
                        },
                        {
                            text: "Reduzem o binário final descartando código sem uso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que MAX(a++, b) com a macro clássica de máximo é perigoso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O argumento é colado duas vezes e a++ pode rodar em dobro",
                            isCorrect: true,
                        },
                        {
                            text: "A macro promove a++ pra float e perde a parte inteira",
                            isCorrect: false,
                        },
                        {
                            text: "O pré-processador proíbe operadores dentro de macros",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador sempre descarta o ++ dentro de expansões",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Unidade de tradução e a ODR",
            blocks: [
                {
                    type: "text",
                    value: "# O que o compilador enxerga de cada vez\n\nO compilador não vê o seu projeto. Ele vê uma unidade de tradução por vez: um .c ou .cpp com todos os headers já colados pelo pré-processador. Enquanto compila main.cpp, ele não sabe o que existe em mat.cpp; tudo o que conhece do resto do mundo são as declarações que os headers trouxeram. Essa visão em túnel é o que permite compilar arquivos em paralelo, e é também a origem de uma família inteira de erros.\n\nDaí a diferença sagrada entre declarar e definir. Declarar apresenta um nome e seu tipo: int soma(int, int); diz que soma existe em algum lugar. Definir cria a coisa de verdade: o corpo da função, o espaço da variável. Você pode declarar o mesmo nome quantas vezes quiser, em quantas unidades quiser; definir, não.\n\nA one definition rule, ODR, formaliza isso: cada função ou variável usada precisa de exatamente uma definição no programa inteiro. Zero definições dão undefined reference no link. Duas definições dão multiple definition, também no link.",
                },
                {
                    type: "table",
                    value: '[["Construção","Declaração ou definição?","Pode repetir entre unidades?"],["int soma(int, int);","declaração","sim, à vontade"],["int soma(int a, int b) { return a + b; }","definição","não, uma no programa"],["extern int contador;","declaração","sim, à vontade"],["int contador = 0;","definição","não, uma no programa"],["inline int quadrado(int x) { return x * x; }","definição inline","sim, se for idêntica em todas"]]',
                },
                {
                    type: "code",
                    value: "/* util.h, incluído por main.cpp e por mat.cpp */\nint contador = 0;              // definição num header: bomba armada\n\n/* No link:\n   ld: mat.o: multiple definition of 'contador';\n   main.o: first defined here                     */\n\n/* Consertos possíveis: */\nextern int contador;           // no header: só declara\nint contador = 0;              // em UM único .cpp: define\ninline int contador_v2 = 0;    // C++17: inline resolve no proprio header",
                },
                {
                    type: "text",
                    value: "## O papel do inline\n\nO inline moderno tem pouco a ver com acelerar chamadas: ele é uma licença da ODR. Marcar uma função como inline autoriza que a mesma definição apareça em várias unidades de tradução, desde que idêntica em todas, e o linker fica encarregado de manter uma só. É por isso que funções definidas dentro de headers precisam ser inline (ou estar dentro de uma classe, o que dá inline implícito): sem a licença, cada .cpp que incluísse o header criaria uma definição, e o link quebraria com multiple definition.\n\nDesde o C++17 existe também a variável inline, que finalmente permite definir constantes globais no header sem gambiarra. Outra rota é o static, que dá linkage interno: cada unidade ganha a sua cópia privada e invisível pras demais, sem conflito, mas com duplicação real.\n\nE se você violar a ODR com definições diferentes entre unidades, um quadrado(x) que soma num arquivo e multiplica no outro? O linker não é obrigado a perceber: ele pode escolher uma versão em silêncio. O padrão classifica isso como programa mal formado sem diagnóstico exigido, na prática comportamento indefinido.",
                },
                {
                    type: "quote",
                    value: "Declarar é prometer, definir é entregar. O compilador aceita promessas o dia todo; o linker é o cobrador que exige exatamente uma entrega por nome.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma unidade de tradução?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um .cpp com os headers já colados pelo pré-processador",
                            isCorrect: true,
                        },
                        {
                            text: "O conjunto de todos os fontes listados no Makefile",
                            isCorrect: false,
                        },
                        {
                            text: "Cada função compilada de forma isolada pelo back-end",
                            isCorrect: false,
                        },
                        {
                            text: "O par formado por um header e seu .cpp de implementação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a diferença essencial entre declaração e definição?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Declarar apresenta o nome; definir cria corpo ou espaço",
                            isCorrect: true,
                        },
                        {
                            text: "Declarar vale só em C; definir é o termo usado em C++",
                            isCorrect: false,
                        },
                        {
                            text: "Declarar exige inline; definir exige o extern na frente",
                            isCorrect: false,
                        },
                        {
                            text: "Declarar reserva memória; definir apenas documenta o tipo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um header com int contador = 0; é incluído por dois .cpp do projeto. O que acontece?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Erro de multiple definition na hora do link",
                            isCorrect: true,
                        },
                        {
                            text: "Erro de sintaxe apontado ainda no pré-processador",
                            isCorrect: false,
                        },
                        {
                            text: "Compila e linka: o executável ganha dois contadores",
                            isCorrect: false,
                        },
                        {
                            text: "Warning do compilador, resolvido unindo as definições",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que uma função definida num header costuma ser marcada como inline?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Autoriza a definição repetida e idêntica em várias unidades",
                            isCorrect: true,
                        },
                        {
                            text: "Garante que o compilador elimine o custo de toda chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Esconde o símbolo da tabela exportada pro linker enxergar",
                            isCorrect: false,
                        },
                        {
                            text: "Permite que o header seja incluído sem o include guard",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Duas unidades definem quadrado(x) com corpos diferentes e o programa linka sem erro. Segundo o padrão, o que você tem em mãos?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Violação da ODR: comportamento indefinido, sem aviso devido",
                            isCorrect: true,
                        },
                        {
                            text: "Um programa válido: vale a definição do primeiro objeto dado",
                            isCorrect: false,
                        },
                        {
                            text: "Um erro que o linker é obrigado a relatar na próxima build",
                            isCorrect: false,
                        },
                        {
                            text: "Overload legítimo: as duas versões convivem no executável",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Dentro de um objeto",
            blocks: [
                {
                    type: "text",
                    value: "# O .o por dentro: código e promessas\n\nUm arquivo objeto não é só código de máquina. Ele é um contêiner (no Linux, no formato ELF) com seções separadas: .text guarda as instruções, .data guarda variáveis globais inicializadas, .bss anota as zeradas. E, junto delas, duas estruturas que interessam demais: a tabela de símbolos e as entradas de relocação.\n\nA tabela de símbolos é a lista do que aquele objeto define e do que ele consome. Quando main.c chama soma e printf, o main.o registra: eu defino main; eu preciso de soma e printf, que não sei onde vivem. Símbolos definidos têm endereço dentro do objeto; os indefinidos são promessas que o linker terá de cumprir com outros objetos ou bibliotecas.\n\nA ferramenta pra enxergar isso é o nm. Rodar nm main.o lista cada símbolo com uma letra: T pra código definido na .text, U pra indefinido, D pra dado inicializado, B pra dado zerado. O nm transforma o .o de caixa preta em inventário legível, e vai ser sua lupa no módulo 4 e no projeto final.",
                },
                {
                    type: "code",
                    value: '$ gcc -c main.c\n$ nm main.o\n0000000000000000 T main\n                 U printf\n                 U soma\n\n$ gcc -c mat.c && nm mat.o\n0000000000000000 T soma\n\n# Depois do link, a promessa vira endereço:\n$ gcc main.o mat.o -o app && nm app | grep -E "main|soma"\n0000000000001139 T main\n0000000000001160 T soma',
                },
                {
                    type: "table",
                    value: '[["Letra no nm","Significado","Exemplo típico"],["T","definido na seção de código (.text)","função global do arquivo"],["t","código com linkage interno","função static do arquivo"],["U","indefinido: usado, definido em outro lugar","printf chamado no main.o"],["D","dado global inicializado (.data)","int limite = 100;"],["B","dado global zerado (.bss)","int total; sem valor inicial"]]',
                },
                {
                    type: "text",
                    value: "## Relocação: os buracos que o linker preenche\n\nQuando o assembler gera a instrução que chama soma, ele não tem como saber o endereço final da função, que talvez nem exista ainda. Então grava um espaço reservado no lugar do endereço e cria uma entrada de relocação: um bilhete dizendo que naquele deslocamento da .text existe uma chamada pendente pro símbolo soma. O objeto fica cheio desses bilhetes, um pra cada referência externa.\n\nNa hora do link, o linker junta as seções de todos os objetos, decide o endereço de cada símbolo e sai pagando os bilhetes: onde havia buraco, entra o endereço real. É por isso que um .o não roda sozinho: ele é um quebra-cabeça com peças faltando, jogável só depois que o linker encaixa tudo.\n\nEsse mecanismo explica o U do nm de um jeito concreto. U não é erro nem aviso: é o estado natural de um objeto que depende de outros. Só vira problema se, na hora do link, nenhum objeto ou biblioteca oferecer o símbolo prometido, e aí você reencontra o undefined reference da primeira aula.",
                },
                {
                    type: "quote",
                    value: "Um arquivo objeto é um contrato pela metade: assina o que entrega, lista o que espera receber. O nm é o jeito mais rápido de ler esse contrato antes de o linker cobrar.",
                },
            ],
            questions: [
                {
                    statement: "No nm, o que indica a letra U ao lado de um símbolo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Símbolo usado ali, mas definido em outro lugar",
                            isCorrect: true,
                        },
                        {
                            text: "Símbolo exclusivo do objeto, oculto dos demais",
                            isCorrect: false,
                        },
                        {
                            text: "Símbolo duplicado que o linker vai descartar",
                            isCorrect: false,
                        },
                        {
                            text: "Símbolo de dado zerado guardado na seção .bss",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Além do código de máquina, o que um arquivo objeto carrega?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Tabela de símbolos e as entradas de relocação",
                            isCorrect: true,
                        },
                        {
                            text: "O fonte original comprimido pra fins de debug",
                            isCorrect: false,
                        },
                        {
                            text: "A lista das flags usadas em todas as compilações",
                            isCorrect: false,
                        },
                        {
                            text: "Uma cópia estática das bibliotecas do sistema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "nm main.o mostra U soma. O que isso diz sobre o main.o?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele usa soma e espera que o linker a encontre",
                            isCorrect: true,
                        },
                        {
                            text: "Ele define soma e a exporta pros outros objetos",
                            isCorrect: false,
                        },
                        {
                            text: "Ele descartou soma por não haver chamada no código",
                            isCorrect: false,
                        },
                        {
                            text: "Ele contém duas versões de soma em conflito interno",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é relocação no contexto de arquivos objeto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Preencher endereços pendentes quando o linker junta tudo",
                            isCorrect: true,
                        },
                        {
                            text: "Mover o binário pra outro diretório sem recompilar nada",
                            isCorrect: false,
                        },
                        {
                            text: "Reordenar as funções do objeto pra melhorar o uso do cache",
                            isCorrect: false,
                        },
                        {
                            text: "Comprimir as seções do executável pra reduzir o tamanho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma função static int ajuda(void) definida em mat.c aparece no nm de mat.o de que forma?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Com t minúsculo: definida, mas invisível pros outros objetos",
                            isCorrect: true,
                        },
                        {
                            text: "Com U, porque o static adia a definição até a hora do link",
                            isCorrect: false,
                        },
                        {
                            text: "Com T maiúsculo, igual a qualquer outra função do arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "Não aparece: o compilador apaga funções static do objeto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Linkagem estática vs dinâmica",
            blocks: [
                {
                    type: "text",
                    value: "# Duas maneiras de emprestar código\n\nQuase nenhum programa vive só dos próprios objetos: ele empresta código de bibliotecas, e existem duas formas de empréstimo. A biblioteca estática, o .a, é um pacote de arquivos .o criado pelo ar. No link, os objetos necessários são copiados pra dentro do seu executável, e a dívida se quita ali: o binário fica autossuficiente, sem depender do arquivo .a nunca mais.\n\nA biblioteca dinâmica, o .so (shared object), fica fora do binário. O link apenas registra a dependência, e quem resolve de verdade é o carregador dinâmico, na hora de executar: ele localiza o .so, mapeia na memória e conecta os símbolos. O comando ldd mostra essa lista de dependências, e é o primeiro passo pra investigar qualquer problema de biblioteca.\n\nA escolha é um trade-off clássico. Estática dá binário maior, porém portátil e previsível: o que você testou é o que roda. Dinâmica dá binário menor, memória compartilhada entre processos e atualização centralizada, ao custo de depender do ambiente onde o programa vai rodar.",
                },
                {
                    type: "table",
                    value: '[["Critério","Estática (.a)","Dinâmica (.so)"],["Quando o código entra","no link, copiado pro binário","na execução, pelo loader"],["Tamanho do executável","maior","menor"],["Patch de segurança na lib","recompilar e reinstalar cada binário","trocar o .so conserta todos de uma vez"],["Dependência no deploy","nenhuma, binário autossuficiente","o .so certo precisa existir na máquina"],["Memória entre processos","cada um com sua cópia","código compartilhado entre eles"]]',
                },
                {
                    type: "code",
                    value: "# Estática: empacotar objetos e copiar no link\nar rcs libmat.a mat.o\ngcc main.o -L. -lmat -o app_estatico\n\n# Dinâmica: código independente de posição, .so separado\ngcc -fPIC -shared mat.c -o libmat.so\ngcc main.o -L. -lmat -o app_dinamico\n\n$ ./app_dinamico\n./app_dinamico: error while loading shared libraries:\nlibmat.so: cannot open shared object file: No such file...\n\n$ LD_LIBRARY_PATH=. ./app_dinamico   # loader acha a lib\n42",
                },
                {
                    type: "text",
                    value: "## O erro famoso e onde o loader procura\n\nO erro do exemplo acima é um clássico absoluto: o binário linkou perfeitamente, mas na execução o loader não encontrou libmat.so. Note o momento: não é erro de compilação nem de link, é erro de carga. O loader procura em diretórios padrão como /lib e /usr/lib, no cache mantido pelo ldconfig e nos caminhos gravados no próprio binário via rpath ou runpath.\n\nLD_LIBRARY_PATH é a variável de ambiente que adiciona diretórios a essa busca, na frente dos demais. É ótima pra testar uma biblioteca recém-compilada sem instalar nada, e péssima como solução permanente: um export esquecido no perfil muda qual .so todos os programas carregam, criando bugs que só existem na sua máquina. Pra distribuir, o caminho profissional é instalar a lib num diretório do sistema e rodar ldconfig, ou gravar rpath no link.\n\nO argumento decisivo da linkagem dinâmica aparece em segurança: quando sai um patch pra uma biblioteca como a OpenSSL, atualizar o .so do sistema conserta todos os programas que o usam, sem recompilar nenhum. Com linkagem estática, cada binário embute sua cópia e precisa ser reconstruído e redistribuído um a um.",
                },
                {
                    type: "quote",
                    value: "Linkagem estática congela a dependência dentro do binário; a dinâmica aposta no ambiente. As duas cobram: uma em tamanho e redistribuição, a outra em bugs do tipo funciona na minha máquina.",
                },
            ],
            questions: [
                {
                    statement: "O que é, na prática, uma biblioteca estática .a?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um pacote de arquivos objeto pronto pro linker",
                            isCorrect: true,
                        },
                        {
                            text: "Um executável auxiliar carregado junto do programa",
                            isCorrect: false,
                        },
                        {
                            text: "Um cache de headers pré-compilados pelo gcc",
                            isCorrect: false,
                        },
                        {
                            text: "Um binário mapeado na memória em tempo de execução",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando o código de uma biblioteca dinâmica entra em cena?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Na execução, trazido pelo carregador dinâmico",
                            isCorrect: true,
                        },
                        {
                            text: "No link, quando é copiado pra dentro do binário",
                            isCorrect: false,
                        },
                        {
                            text: "Na compilação, colado junto com os headers dela",
                            isCorrect: false,
                        },
                        {
                            text: "No boot do sistema, junto dos módulos do kernel",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Sai um patch de segurança pra uma biblioteca usada por dezenas de programas da máquina. Qual a vantagem da linkagem dinâmica nesse cenário?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Trocar o .so conserta todos os programas de uma vez",
                            isCorrect: true,
                        },
                        {
                            text: "O loader aplica o patch direto na memória dos processos",
                            isCorrect: false,
                        },
                        {
                            text: "Os binários estáticos se atualizam sozinhos no disco",
                            isCorrect: false,
                        },
                        {
                            text: "O linker refaz o link de cada programa autonomamente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O programa linka sem erro, mas ao rodar aparece: error while loading shared libraries: libmat.so: cannot open shared object file. O que houve?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O loader não achou a .so na hora de executar",
                            isCorrect: true,
                        },
                        {
                            text: "O linker esqueceu de copiar a .so pro binário",
                            isCorrect: false,
                        },
                        {
                            text: "A .so foi compilada sem a tabela de símbolos",
                            isCorrect: false,
                        },
                        {
                            text: "O binário perdeu a seção .text durante o strip",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o papel exato da variável LD_LIBRARY_PATH?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Acrescenta diretórios à busca de .so na execução",
                            isCorrect: true,
                        },
                        {
                            text: "Define onde o linker procura .a durante o build",
                            isCorrect: false,
                        },
                        {
                            text: "Lista as bibliotecas que o gcc deve ignorar no link",
                            isCorrect: false,
                        },
                        {
                            text: "Aponta o diretório de headers usado pelo #include",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Front-end: do texto à árvore",
    aulas: [
        {
            titulo: "Lexer: de caracteres a tokens",
            blocks: [
                {
                    type: "text",
                    value: "# A primeira leitura do seu código\n\nPro compilador, o seu arquivo é só uma fileira de caracteres: i, n, t, espaço, x. O primeiro passo do front-end é o lexer (analisador léxico), que percorre essa fileira e a agrupa em tokens: as menores unidades com significado. int vira um token de palavra-chave, x vira um identificador, = vira operador, 42 vira literal numérico, ; vira pontuação. Espaços e comentários são consumidos e jogados fora: eles separam tokens, mas não viram tokens.\n\nCada token carrega sua categoria e seu lexema, o texto original. É uma distinção importante: o lexer não sabe o que x significa, se foi declarado, se o tipo bate. Ele só sabe que x tem cara de identificador. Interpretar relações entre tokens é trabalho das fases seguintes.\n\nComo o lexer decide onde um token termina? Pela regra do bocado máximo: ele come o maior trecho que ainda forma um token válido. É por isso que a>>b lê >> como um único operador de deslocamento, e não como dois sinais de maior seguidos.",
                },
                {
                    type: "code",
                    value: 'int media = (a + b) / 2;\n\n/* O lexer enxerga a linha acima assim:\n   [keyword: int] [identificador: media] [operador: =]\n   [pontuacao: (] [identificador: a] [operador: +]\n   [identificador: b] [pontuacao: )] [operador: /]\n   [literal: 2] [pontuacao: ;]                        */\n\nint 2x = 10;   /* error: invalid suffix "x" on integer\n                  constant: o lexer engasgou no 2x    */',
                },
                {
                    type: "table",
                    value: '[["Categoria de token","Exemplos","Como o lexer reconhece"],["Palavra-chave","int, while, return","identificador que consta na lista reservada"],["Identificador","media, contador, x2","letra ou _ seguida de letras, dígitos, _"],["Literal","42, 3.14, \'a\', \\"oi\\"","dígitos, aspas e formas numéricas válidas"],["Operador","+, *, >>, ==","símbolos, sempre o bocado máximo possível"],["Pontuação","; , ( ) { }","caracteres estruturais isolados"]]',
                },
                {
                    type: "text",
                    value: '## Keywords, identificadores e o erro léxico\n\nPalavra-chave e identificador têm a mesma cara: letras. A diferença é uma lista fechada: depois de reconhecer um nome, o lexer consulta a tabela de palavras reservadas da linguagem; se o lexema está lá, o token é keyword, senão é identificador. É exatamente por isso que int int = 3; não faz sentido pro compilador e por que você não pode chamar uma variável de while.\n\nErro léxico é quando a fileira de caracteres nem chega a formar tokens válidos. Exemplos reais: um caractere fora da linguagem, como @ solto no meio do código C; uma string aberta sem a aspa final, que o gcc reporta como missing terminating \\" character; ou o clássico 2x, que o gcc rejeita com invalid suffix "x" on integer constant, porque um número não pode emendar em letra e 2x também não é um identificador válido.\n\nRepare que quase tudo que chamamos de erro de digitação no dia a dia não é léxico: esquecer um ; produz tokens perfeitamente válidos em ordem inválida. Isso é erro de sintaxe, assunto do parser, a próxima aula.',
                },
                {
                    type: "quote",
                    value: "O lexer é um leitor sem interpretação: reconhece as palavras do texto, mas não a gramática das frases. Ele diz que x é um nome; se o nome faz sentido, já não é problema dele.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a função do lexer no front-end do compilador?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Agrupar os caracteres do fonte em tokens",
                            isCorrect: true,
                        },
                        {
                            text: "Montar a árvore sintática das expressões",
                            isCorrect: false,
                        },
                        {
                            text: "Checar se os tipos das variáveis combinam",
                            isCorrect: false,
                        },
                        {
                            text: "Resolver os endereços finais das funções",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o lexer distingue uma palavra-chave de um identificador?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Consultando a lista fechada de nomes reservados",
                            isCorrect: true,
                        },
                        {
                            text: "Pelo contexto sintático da frase onde ele aparece",
                            isCorrect: false,
                        },
                        {
                            text: "Pela presença do nome na tabela de símbolos do .o",
                            isCorrect: false,
                        },
                        {
                            text: "Pelo uso de letras maiúsculas no começo do lexema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual destes problemas é um erro léxico de verdade?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma string aberta que termina sem a aspa final",
                            isCorrect: true,
                        },
                        {
                            text: "Um ponto e vírgula esquecido no fim da linha",
                            isCorrect: false,
                        },
                        {
                            text: "Uma variável usada antes de ter sido declarada",
                            isCorrect: false,
                        },
                        {
                            text: "Um int somado a um ponteiro de tipo incompatível",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Pela regra do bocado máximo, como o lexer de C lê o trecho a>>b?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Identificador a, operador >> inteiro, identificador b",
                            isCorrect: true,
                        },
                        {
                            text: "Identificador a, dois operadores > em seguida, depois b",
                            isCorrect: false,
                        },
                        {
                            text: "Um único token, já que não há espaços entre as partes",
                            isCorrect: false,
                        },
                        {
                            text: "Depende da precedência definida na gramática do parser",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Por que o gcc rejeita int 2x = 10; com a mensagem invalid suffix "x" on integer constant?',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "2x não forma token válido: número não emenda em letra",
                            isCorrect: true,
                        },
                        {
                            text: "O parser exige que toda variável comece com maiúscula",
                            isCorrect: false,
                        },
                        {
                            text: "A análise semântica veta nomes parecidos com números",
                            isCorrect: false,
                        },
                        {
                            text: "O pré-processador expande 2x antes de o lexer rodar",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Parser e gramática: nasce a árvore",
            blocks: [
                {
                    type: "text",
                    value: "# Dos tokens à estrutura\n\nO parser (analisador sintático) recebe a fila de tokens e responde a uma pergunta: essa sequência obedece à gramática da linguagem? A gramática é o conjunto de regras que define como frases válidas se formam: uma expressão pode ser um número, ou duas expressões unidas por um operador; um if exige parênteses e um comando. Se os tokens não encaixam em regra nenhuma, sai o famoso error: expected ';' before 'return': erro de sintaxe.\n\nQuando encaixam, o parser produz a AST, a árvore sintática abstrata. Cada nó interno é uma operação; as folhas são números e variáveis. Abstrata porque descarta o que era só notação: parênteses, ponto e vírgula e vírgulas não viram nós, eles apenas guiaram a montagem.\n\nA árvore é a estrutura perfeita pro que vem depois: dá pra percorrer, checar tipos, otimizar e gerar código. Texto é bom pra humanos; árvore é o formato em que o compilador pensa. Toda a mágica das próximas fases opera sobre ela.",
                },
                {
                    type: "text",
                    value: "## Precedência e associatividade\n\nConsidere 2 + 3 * 4. A fila de tokens é plana, mas o resultado precisa ser 14, não 20. Quem garante isso é a precedência embutida na gramática: multiplicação liga mais forte que soma, então o parser monta a árvore com o + na raiz, tendo como filhos o 2 e o nó do *, que por sua vez segura 3 e 4. A avaliação sobe da folha pra raiz: 3 * 4 primeiro, 2 + 12 depois. Se você escrever (2 + 3) * 4, os parênteses invertem a montagem: o * assume a raiz e a soma desce pra baixo dele.\n\nA precedência resolve operadores diferentes; a associatividade resolve o empate entre operadores iguais. 10 - 4 - 3 poderia ser (10 - 4) - 3 = 3 ou 10 - (4 - 3) = 9. A subtração associa à esquerda, então vale a primeira árvore. Já a atribuição associa à direita: a = b = 5 significa a = (b = 5), e é por isso que o encadeamento funciona.\n\nGuarde a imagem: precedência decide quem fica mais perto das folhas; associatividade decide pra que lado a árvore pende no empate. Toda expressão que você escreve vira exatamente uma árvore, sem ambiguidade.",
                },
                {
                    type: "code",
                    value: "2 + 3 * 4              (2 + 3) * 4\n\n    (+)                    (*)\n   /   \\                  /   \\\n  2    (*)              (+)    4\n      /   \\            /   \\\n     3     4          2     3\n\nAvaliando de baixo pra cima:      Com parênteses:\n3 * 4 = 12, depois 2 + 12 = 14    2 + 3 = 5, depois 5 * 4 = 20",
                },
                {
                    type: "table",
                    value: '[["Expressão","Como o parser agrupa","Regra que decidiu"],["2 + 3 * 4","2 + (3 * 4)","precedência: * liga mais forte que +"],["(2 + 3) * 4","(2 + 3) * 4","parênteses guiam a montagem da árvore"],["10 - 4 - 3","(10 - 4) - 3","subtração associa à esquerda"],["a = b = 5","a = (b = 5)","atribuição associa à direita"],["-x * y","(-x) * y","o menos unário liga mais forte que o *"]]',
                },
                {
                    type: "quote",
                    value: "A AST é a frase depois de entendida: sobra a estrutura, cai a pontuação. Parêntese não vira nó; ele só decide que árvore vai nascer, e desaparece no ato.",
                },
            ],
            questions: [
                {
                    statement: "O que o parser produz quando os tokens obedecem à gramática?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A AST, árvore que representa a estrutura do código",
                            isCorrect: true,
                        },
                        {
                            text: "A lista final de tokens com seus tipos anotados",
                            isCorrect: false,
                        },
                        {
                            text: "O código de máquina pronto pra rodar na CPU alvo",
                            isCorrect: false,
                        },
                        {
                            text: "A tabela de símbolos com os endereços resolvidos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Na árvore de 2 + 3 * 4, qual operador ocupa a raiz e por quê?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O +, porque o * liga mais forte e desce na árvore",
                            isCorrect: true,
                        },
                        {
                            text: "O *, porque precedência maior sempre fica na raiz",
                            isCorrect: false,
                        },
                        {
                            text: "O +, porque ele aparece primeiro lendo da esquerda",
                            isCorrect: false,
                        },
                        {
                            text: "O *, porque a árvore se monta da direita pra esquerda",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a AST é chamada de abstrata?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Descarta a notação, como parênteses e pontuação",
                            isCorrect: true,
                        },
                        {
                            text: "Só existe no papel, nunca na memória do compilador",
                            isCorrect: false,
                        },
                        {
                            text: "Representa o programa sem os nomes das variáveis",
                            isCorrect: false,
                        },
                        {
                            text: "Ignora os operadores e guarda somente os números",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a associatividade decide na montagem da árvore?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O agrupamento no empate entre operadores iguais",
                            isCorrect: true,
                        },
                        {
                            text: "Qual operador de tipos diferentes liga mais forte",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem em que o lexer entrega os tokens ao parser",
                            isCorrect: false,
                        },
                        {
                            text: "Se os parênteses da expressão podem ser removidos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "a = b = 5 funciona em C e deixa 5 nas duas variáveis. Que propriedade da gramática permite isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A atribuição associa à direita: vale a = (b = 5)",
                            isCorrect: true,
                        },
                        {
                            text: "A atribuição associa à esquerda: vale (a = b) = 5",
                            isCorrect: false,
                        },
                        {
                            text: "O parser reescreve a expressão em duas linhas novas",
                            isCorrect: false,
                        },
                        {
                            text: "A precedência do = é a maior de todas na linguagem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Análise semântica: sentido além da forma",
            blocks: [
                {
                    type: "text",
                    value: "# Frases corretas que não fazem sentido\n\nUma frase pode ser gramaticalmente perfeita e ainda assim absurda. O verde dorme depressa passa na sintaxe do português e falha no significado. Código é igual: x = y + 1; é sintaxe impecável, mas, se y nunca foi declarado, ou se y é uma struct, a frase não tem sentido. Verificar o sentido é o trabalho da análise semântica, a terceira etapa do front-end, que percorre a AST montada pelo parser.\n\nTrês verificações dominam. Resolução de nomes: cada uso de um identificador precisa apontar pra uma declaração visível; é aqui que nasce o gcc error: 'y' undeclared (first use in this function). Escopo: a mesma variável pode existir em blocos diferentes, e a análise decide qual declaração vale em cada ponto, sempre a do bloco mais interno. Checagem de tipos: cada operação precisa de operandos compatíveis; somar int com float promove o int, mas somar struct com int rende error: invalid operands to binary +.\n\nO produto dessa fase é uma árvore anotada: cada nó ganha seu tipo e cada nome, sua declaração.",
                },
                {
                    type: "table",
                    value: '[["Erro","Fase que acusa","Mensagem típica do gcc"],["int 2x = 10;","léxica","invalid suffix \\"x\\" on integer constant"],["int x = ;","sintática","expected expression before \';\' token"],["x = y + 1; sem declarar y","semântica","\'y\' undeclared (first use in this function)"],["somar struct com int","semântica","invalid operands to binary + ..."],["chamar soma(1) faltando argumento","semântica","too few arguments to function \'soma\'"]]',
                },
                {
                    type: "code",
                    value: 'int main(void) {\n    int total = 10;\n    {\n        int total = 99;          /* sombra: vale no bloco interno */\n        printf("%d\\n", total);   /* 99 */\n    }\n    printf("%d\\n", total);       /* 10: a sombra morreu no } */\n\n    soma = total + 1;\n    /* error: \'soma\' undeclared (first use in this function)\n       Sintaxe perfeita; o nome e que nao existe aqui.       */\n}',
                },
                {
                    type: "text",
                    value: "## Sintático ou semântico? O reflexo do diagnóstico\n\nDiferenciar as duas famílias de erro muda a sua velocidade de correção. Erro sintático é de forma: os tokens não encaixam na gramática. As mensagens falam de expected algo before algo, e o conserto costuma ser mecânico: um ; esquecido, uma chave a mais, um parêntese sem par. Erro semântico é de significado: a forma está certa, mas um nome não existe, um tipo não combina, uma chamada tem argumentos errados. As mensagens citam undeclared, invalid operands, incompatible types, e o conserto exige pensar: qual era a intenção?\n\nUm detalhe que confunde iniciantes: o compilador processa declarações de cima pra baixo dentro da unidade de tradução. Usar uma função definida mais abaixo no mesmo arquivo, sem protótipo antes, gera aviso ou erro dependendo do modo; é por isso que headers colecionam protótipos.\n\nE vale repetir o mapa da trilha: nada disso é o undefined reference. Aquele é do linker, fase posterior, e fala de símbolo sem definição em objeto nenhum. O undeclared da análise semântica fala de nome sem declaração visível na unidade atual. Mensagens parecidas, fases e consertos diferentes.",
                },
                {
                    type: "quote",
                    value: "O parser confere a forma da frase; a análise semântica confere se a frase quer dizer alguma coisa. Expected ';' é forma. Undeclared é sentido. Saber qual dos dois falou é metade do conserto.",
                },
            ],
            questions: [
                {
                    statement: "O que a análise semântica verifica que o parser não verifica?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Nomes, escopos e tipos fazendo sentido na árvore",
                            isCorrect: true,
                        },
                        {
                            text: "Se os tokens seguem a gramática oficial da linguagem",
                            isCorrect: false,
                        },
                        {
                            text: "Se todos os símbolos têm endereço final no binário",
                            isCorrect: false,
                        },
                        {
                            text: "Se os caracteres do arquivo formam tokens válidos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A mensagem 'y' undeclared (first use in this function) denuncia qual problema?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uso de um nome sem declaração visível no escopo",
                            isCorrect: true,
                        },
                        {
                            text: "Um símbolo que nenhum arquivo objeto conseguiu definir",
                            isCorrect: false,
                        },
                        {
                            text: "Uma expressão que fere a precedência dos operadores",
                            isCorrect: false,
                        },
                        {
                            text: "Uma variável declarada duas vezes no mesmo bloco",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Duas variáveis total, uma no bloco externo e outra no interno. Qual vale dentro do bloco interno?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A do bloco mais interno, que sombreia a de fora",
                            isCorrect: true,
                        },
                        {
                            text: "A do bloco externo, por ter sido declarada primeiro",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma: dois nomes iguais geram erro de compilação",
                            isCorrect: false,
                        },
                        {
                            text: "As duas ao mesmo tempo, compartilhando o mesmo valor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "int x = ; dispara expected expression before ';' token. Que tipo de erro é esse?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sintático: os tokens não encaixam na gramática",
                            isCorrect: true,
                        },
                        {
                            text: "Semântico: o tipo do valor não combina com int",
                            isCorrect: false,
                        },
                        {
                            text: "Léxico: o caractere ; não pertence à linguagem",
                            isCorrect: false,
                        },
                        {
                            text: "De link: a expressão não foi definida em objeto algum",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual a diferença de fundo entre o undeclared do compilador e o undefined reference do linker?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Um é nome sem declaração visível; outro é símbolo sem definição",
                            isCorrect: true,
                        },
                        {
                            text: "São a mesma mensagem, impressa por ferramentas de nomes distintos",
                            isCorrect: false,
                        },
                        {
                            text: "Um aparece apenas em C; o outro é exclusivo dos programas em C++",
                            isCorrect: false,
                        },
                        {
                            text: "Um é aviso que o build ignora; o outro interrompe a compilação toda",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ler erros de compilação sem pânico",
            blocks: [
                {
                    type: "text",
                    value: "# Sempre do primeiro\n\nVocê compila e a tela despeja quarenta erros. A reação de pânico é rolar até o fim e atacar o último; a técnica profissional é o oposto: leia o primeiro erro, conserte, recompile. O motivo é a cascata: depois de um erro real, o parser perde o fio da meada e passa a interpretar tokens válidos a partir de um estado quebrado, fabricando erros fantasmas. Um ; esquecido numa struct ou uma chave sem par no topo do arquivo produz dezenas de reclamações em linhas que estão perfeitas.\n\nUm exemplo clássico: esqueça o ; que fecha a definição de uma struct no header. O gcc reclama em cada arquivo que incluir aquele header, com mensagens sobre a primeira função declarada depois dela, algo como expected ';' before ou two or more data types in declaration specifiers, apontando linhas inocentes. Quem sai caçando os quarenta erros um a um perde a tarde; quem conserta o primeiro vê os outros trinta e nove evaporarem na recompilação seguinte.\n\nLeia a mensagem inteira, com arquivo e linha, e olhe também a linha ANTERIOR ao ponto indicado: erro de pontuação costuma morar logo acima de onde ele é percebido.",
                },
                {
                    type: "table",
                    value: '[["Sintoma na tela","Causa provável","Primeiro movimento"],["Dezenas de erros de uma vez","cascata de um único erro real","consertar só o primeiro e recompilar"],["expected \';\' before ...","pontuação faltando logo acima","olhar a linha anterior à apontada"],["Erro dentro de header do sistema","uso errado no SEU código","buscar required from here / note"],["Parede de texto com templates","tipo que não satisfaz a operação","ler a primeira linha e as notas"],["Erros em arquivos que nem mexeu","header quebrado incluído por eles","conferir o último header editado"]]',
                },
                {
                    type: "code",
                    value: "#include <vector>\n#include <algorithm>\nstruct Ponto { int x, y; };\n\nint main() {\n    std::vector<Ponto> v;\n    std::sort(v.begin(), v.end());\n}\n/* g++ despeja ~90 linhas citando stl_algo.h, mas o mapa esta:\n   In file included from /usr/include/c++/13/algorithm ...\n   required from here\n   error: no match for 'operator<'\n   (operand types are 'const Ponto' and 'const Ponto')\n   Traducao: Ponto nao tem operator<; defina um ou passe\n   um comparador pro sort. O erro e SEU, nao do header.  */",
                },
                {
                    type: "text",
                    value: "## A técnica pra paredes de template\n\nErros envolvendo templates da STL assustam pelo volume: o g++ imprime a pilha inteira de instanciações, com tipos de nomes quilométricos, e noventa por cento das linhas citam headers do sistema que você nunca abriu. A técnica tem três passos. Primeiro, ignore a tentação de ler tudo: vá à PRIMEIRA linha de erro e às linhas marcadas com required from here ou note:, que apontam o ponto do SEU código que disparou a instanciação. Segundo, extraia o veredito final, que costuma ser curto: no match for 'operator<', ou no matching function for call. Terceiro, traduza: quase sempre é um tipo seu que não suporta a operação exigida pelo template.\n\nDuas flags ajudam a domar o volume no gcc: -fmax-errors=1 interrompe no primeiro erro (no clang, -ferror-limit=1), e -fdiagnostics-color deixa a estrutura visível. Em 2026, vale dizer, as mensagens melhoraram muito: gcc e clang apontam o trecho com um acento gráfico embaixo e sugerem correções de nomes digitados errado.\n\nErro de compilação é feedback, não bronca. A habilidade de lê-lo com método é o que encurta o ciclo editar, compilar, corrigir.",
                },
                {
                    type: "quote",
                    value: "Quarenta erros na tela quase nunca são quarenta problemas: são um problema e trinta e nove ecos. Conserte o primeiro, recompile e deixe os fantasmas sumirem sozinhos.",
                },
            ],
            questions: [
                {
                    statement: "Por que a regra é corrigir sempre o primeiro erro da lista?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Os seguintes podem ser ecos do parser perdido",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador ordena os erros do fácil pro difícil",
                            isCorrect: false,
                        },
                        {
                            text: "Os últimos erros pertencem a outros arquivos .c",
                            isCorrect: false,
                        },
                        {
                            text: "Só o primeiro traz o número da linha exata do bug",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Num erro gigante de template, quais marcas apontam o SEU código?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "As linhas com required from here e as notas note:",
                            isCorrect: true,
                        },
                        {
                            text: "As linhas que citam os headers internos da STL",
                            isCorrect: false,
                        },
                        {
                            text: "As últimas dez linhas impressas pelo compilador",
                            isCorrect: false,
                        },
                        {
                            text: "As linhas que mostram os tipos de nome mais longo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um ; esquecido ao fim de uma struct num header gera erros em vários arquivos que estavam corretos. O que explica isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O header quebrado é colado em cada unidade que o inclui",
                            isCorrect: true,
                        },
                        {
                            text: "O linker propaga o erro de sintaxe pros demais objetos",
                            isCorrect: false,
                        },
                        {
                            text: "O make recompila tudo e corrompe os objetos antigos",
                            isCorrect: false,
                        },
                        {
                            text: "O gcc processa os arquivos em ordem alfabética invertida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "std::sort num vector de structs sem operator< falha com no match for 'operator<'. Qual o conserto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Definir operator< ou passar um comparador ao sort",
                            isCorrect: true,
                        },
                        {
                            text: "Atualizar o header stl_algo.h pra versão corrigida",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o vector por array cru, que o sort já aceita",
                            isCorrect: false,
                        },
                        {
                            text: "Compilar com -O2 pra instanciar o template completo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pra que serve -fmax-errors=1 no gcc durante uma sessão de correção?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Parar no primeiro erro e silenciar a cascata de ecos",
                            isCorrect: true,
                        },
                        {
                            text: "Transformar todos os warnings em erros de compilação",
                            isCorrect: false,
                        },
                        {
                            text: "Tentar corrigir sozinho o primeiro erro encontrado",
                            isCorrect: false,
                        },
                        {
                            text: "Limitar o build a um único arquivo fonte por chamada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Avaliar uma AST na cabeça",
            blocks: [
                {
                    type: "text",
                    value: "# O mini interpretador mental\n\nVocê já sabe que toda expressão vira árvore. Agora vem o exercício que solda esse conhecimento: avaliar a árvore de cabeça, como um interpretador faria. A regra é uma só e se chama caminhada pós-ordem: pra saber o valor de um nó, primeiro resolva o filho esquerdo, depois o direito, e só então aplique o operador do nó. Folhas são triviais: um número vale ele mesmo; uma variável vale o que a memória diz.\n\nTome (8 - 3) * (4 + 2 * 5) - 1. A raiz é o último - (associatividade à esquerda). Antes de subtrair, preciso do lado esquerdo: o *. Antes do *, seus dois filhos: 8 - 3 = 5 e, no outro ramo, 4 + 2 * 5, cuja árvore interna põe o * embaixo: 2 * 5 = 10, depois 4 + 10 = 14. Agora o * de cima: 5 * 14 = 70. Enfim a raiz: 70 - 1 = 69.\n\nRepare no que você acabou de fazer: percorreu a árvore inteira sem escrever nada, resolvendo sempre de baixo pra cima. É exatamente o algoritmo de um interpretador de expressões.",
                },
                {
                    type: "code",
                    value: "struct No {\n    char op;              // 0 quando for folha numerica\n    int valor;\n    No *esq, *dir;\n};\n\nint avaliar(const No* n) {\n    if (n->op == 0) return n->valor;      // folha: vale ela mesma\n    int e = avaliar(n->esq);              // 1: resolve a esquerda\n    int d = avaliar(n->dir);              // 2: resolve a direita\n    switch (n->op) {                      // 3: aplica o operador\n        case '+': return e + d;\n        case '-': return e - d;\n        case '*': return e * d;\n        default:  return e / d;\n    }\n}",
                },
                {
                    type: "table",
                    value: '[["Passo da pós-ordem","Subárvore resolvida","Valor obtido"],["1","8 - 3","5"],["2","2 * 5","10"],["3","4 + (2 * 5)","14"],["4","(8 - 3) * (4 + 2 * 5)","70"],["5 (raiz)","tudo acima - 1","69"]]',
                },
                {
                    type: "text",
                    value: "## Por que esse exercício vale ouro\n\nPrimeiro, ele revela que interpretar é percorrer: o coração de um interpretador de expressões são as poucas linhas recursivas do exemplo, e você acabou de rodá-las mentalmente. A recursão espelha a árvore; o caso base é a folha. Quando a trilha falar de otimização no próximo módulo, você vai reconhecer o constant folding como isso mesmo: o compilador avaliando em pós-ordem, em tempo de compilação, os ramos cujos filhos são constantes.\n\nSegundo, o hábito muda como você lê código difícil. Diante de uma expressão carregada, o amador lê da esquerda pra direita e se perde; quem pensa em árvore localiza o operador de MENOR precedência, que é a raiz, parte a expressão em duas metades e resolve cada uma. A pergunta certa nunca é qual conta vem primeiro na linha, e sim quem é a raiz desta subárvore.\n\nTreine com as suas próprias expressões: escreva uma, desenhe a árvore, avalie em pós-ordem e confira num printf. Três ou quatro rodadas bastam pra virar reflexo, e esse reflexo será cobrado no projeto do módulo 7.",
                },
                {
                    type: "quote",
                    value: "Avaliar em pós-ordem é ler como a máquina: filhos antes do pai, folhas antes de tudo. Quem domina essa caminhada nunca mais discute precedência no achismo; desenha a árvore e pronto.",
                },
            ],
            questions: [
                {
                    statement: "Na caminhada pós-ordem, quando o operador de um nó é aplicado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Só depois de resolver os dois filhos do nó",
                            isCorrect: true,
                        },
                        {
                            text: "Antes de visitar qualquer um dos filhos",
                            isCorrect: false,
                        },
                        {
                            text: "Entre a visita ao filho esquerdo e ao direito",
                            isCorrect: false,
                        },
                        {
                            text: "Somente quando a raiz inteira já foi visitada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No mini interpretador recursivo, qual é o caso base da recursão?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A folha numérica, que devolve o próprio valor",
                            isCorrect: true,
                        },
                        {
                            text: "A raiz da árvore, resolvida antes das demais",
                            isCorrect: false,
                        },
                        {
                            text: "O operador de menor precedência da expressão",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro parêntese encontrado na expressão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Avaliando 2 * 3 + 4 * 5 em pós-ordem, qual sequência de valores intermediários aparece?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "6, depois 20, e a raiz soma os dois em 26",
                            isCorrect: true,
                        },
                        {
                            text: "6, depois 10, e a raiz multiplica ambos em 60",
                            isCorrect: false,
                        },
                        {
                            text: "5, depois 9, e a raiz aplica o produto em 45",
                            isCorrect: false,
                        },
                        {
                            text: "2, 3, 4 e 5 somados um a um até chegar em 14",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pra partir uma expressão complexa em duas metades, que operador você procura?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O de menor precedência, que ocupa a raiz",
                            isCorrect: true,
                        },
                        {
                            text: "O de maior precedência, colado nas folhas",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro operador que aparece na leitura",
                            isCorrect: false,
                        },
                        {
                            text: "O operador dentro do parêntese mais interno",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Que otimização clássica corresponde a avaliar, ainda em compilação, os ramos da AST cujos filhos são constantes?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Constant folding, a dobra prévia de constantes",
                            isCorrect: true,
                        },
                        {
                            text: "Inlining, a expansão do corpo das funções",
                            isCorrect: false,
                        },
                        {
                            text: "Dead code elimination, a poda de código morto",
                            isCorrect: false,
                        },
                        {
                            text: "Loop unrolling, o desenrolar de laços fixos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Otimização",
    aulas: [
        {
            titulo: "Representação intermediária: a língua franca",
            blocks: [
                {
                    type: "text",
                    value: "# Por que existe um meio do caminho\n\nEntre a AST e o assembly, os compiladores modernos inserem mais uma camada: a representação intermediária, ou IR. É uma linguagem interna, nem C nem assembly: parecida com um assembly idealizado, com registradores infinitos e instruções simples e regulares, sem as manias de nenhuma CPU específica. A AST vira IR, a IR é otimizada dezenas de vezes, e só no fim vira o assembly do alvo.\n\nO motivo mais citado é aritmética de engenharia. Suponha N linguagens (C, C++, Rust, Swift) e M arquiteturas (x86-64, ARM64, RISC-V). Sem IR, você precisaria de N vezes M tradutores completos, cada um com suas próprias otimizações. Com uma IR no meio, bastam N front-ends que traduzem linguagem pra IR e M back-ends que traduzem IR pra máquina: N mais M peças, e as otimizações são escritas UMA vez, sobre a IR, valendo pra todas as combinações.\n\nO motivo mais profundo é que a IR é o formato certo pra otimizar: regular o bastante pra análise automática, abstrata o bastante pra não depender de CPU.",
                },
                {
                    type: "table",
                    value: '[["Camada","Formato","Boa pra quê"],["Fonte (C, C++)","texto pra humanos","expressar intenção com clareza"],["AST","árvore da sintaxe","checar tipos, nomes e escopos"],["IR (ex.: LLVM IR)","instruções simples, registradores virtuais","analisar e otimizar em série"],["Assembly","instruções da CPU alvo","extrair o máximo do hardware"],["Objeto .o","código de máquina e símbolos","ser juntado pelo linker"]]',
                },
                {
                    type: "code",
                    value: "; LLVM IR para: int dobro(int x) { return x + x; }\ndefine i32 @dobro(i32 %x) {\nentry:\n  %soma = add nsw i32 %x, %x\n  ret i32 %soma\n}\n; Clang emite isso com: clang -S -emit-llvm dobro.c\n; O gcc tem IRs proprias (GIMPLE e RTL):\n;   gcc -fdump-tree-gimple dobro.c  mostra o GIMPLE",
                },
                {
                    type: "text",
                    value: "## LLVM IR, a referência em 2026\n\nO projeto LLVM transformou essa arquitetura em plataforma. O Clang é um front-end que traduz C e C++ pra LLVM IR; Rust e Swift fazem o mesmo com seus próprios front-ends; e todos herdam de graça o mesmo pacote: o otimizador e os back-ends do LLVM pra x86-64, ARM64, RISC-V, GPUs e WebAssembly. Em 2026, LLVM IR é a representação intermediária de referência do mercado: quando alguém cria uma linguagem nova e quer desempenho competitivo, o caminho padrão é emitir LLVM IR e pegar carona na infraestrutura.\n\nO GCC segue a mesma filosofia com outras siglas: o front-end gera GIMPLE, a forma usada pelas otimizações de alto nível, que depois desce pra RTL antes de virar assembly. Os nomes mudam, a arquitetura é a mesma: front-end entende a linguagem, middle-end otimiza a IR, back-end conhece a máquina.\n\nPra você, a consequência prática é libertadora: otimização não é mágica por linguagem. O grosso do que o próximo capítulo mostra acontece na IR, e vale igual pra C, C++ ou Rust compilados pela mesma infraestrutura.",
                },
                {
                    type: "quote",
                    value: "A IR é a língua franca do compilador: os front-ends chegam falando C, C++ ou Rust, os back-ends partem falando x86 ou ARM, e no meio todos negociam no mesmo idioma.",
                },
            ],
            questions: [
                {
                    statement:
                        "Onde a representação intermediária se encaixa no fluxo de compilação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Entre a AST do front-end e o assembly do alvo",
                            isCorrect: true,
                        },
                        {
                            text: "Entre o arquivo objeto e o executável linkado",
                            isCorrect: false,
                        },
                        {
                            text: "Entre o texto do fonte e a saída do pré-processador",
                            isCorrect: false,
                        },
                        {
                            text: "Entre o executável e o carregador do sistema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com N linguagens e M arquiteturas, o que a IR muda na conta de tradutores?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Reduz de N vezes M pra N front-ends mais M back-ends",
                            isCorrect: true,
                        },
                        {
                            text: "Elimina os back-ends: a IR roda direto no processador",
                            isCorrect: false,
                        },
                        {
                            text: "Dobra o total, pois cada lado precisa de duas versões",
                            isCorrect: false,
                        },
                        {
                            text: "Nada na quantidade; só padroniza os nomes das etapas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que as otimizações são escritas sobre a IR, e não sobre o assembly final?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A IR é regular e neutra: uma análise serve a todos",
                            isCorrect: true,
                        },
                        {
                            text: "O assembly é protegido contra alterações pelo sistema",
                            isCorrect: false,
                        },
                        {
                            text: "A IR roda mais rápido que o assembly em qualquer CPU",
                            isCorrect: false,
                        },
                        {
                            text: "O assembler recusa arquivos que já foram otimizados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o papel do Clang dentro do ecossistema LLVM?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O front-end de C e C++ que emite LLVM IR",
                            isCorrect: true,
                        },
                        {
                            text: "Back-end que converte LLVM IR em x86-64",
                            isCorrect: false,
                        },
                        {
                            text: "Linker padrão de todos os projetos do LLVM",
                            isCorrect: false,
                        },
                        {
                            text: "Máquina virtual que interpreta a IR em produção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma linguagem nova quer rodar bem em x86-64, ARM64 e RISC-V sem escrever três geradores de código. Qual é o caminho padrão em 2026?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Emitir LLVM IR e herdar otimizador e back-ends prontos",
                            isCorrect: true,
                        },
                        {
                            text: "Traduzir a linguagem pra C e compilar o resultado com gcc",
                            isCorrect: false,
                        },
                        {
                            text: "Escrever um interpretador e confiar no cache da própria CPU",
                            isCorrect: false,
                        },
                        {
                            text: "Gerar assembly de x86-64 e emular esse código nos demais",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Otimizações clássicas: antes e depois",
            blocks: [
                {
                    type: "text",
                    value: "# O compilador reescreve o seu código\n\nOtimizar é reescrever preservando o comportamento observável: mesmo resultado, menos trabalho. Quatro transformações clássicas dão o tom. Constant folding (dobra de constantes): contas entre constantes são feitas em compilação; int s = 60 * 60 * 24; vira direto 86400, e o produto some do binário. Constant propagation (propagação): se x recebeu 5 e não mudou, os usos de x viram 5, o que costuma criar novas dobras em cadeia.\n\nInlining: a chamada de uma função pequena é substituída pelo próprio corpo dela. Elimina o custo da chamada, mas o efeito maior é outro: com o corpo exposto no contexto, as demais otimizações enxergam através da fronteira que antes as bloqueava. Dead code elimination (DCE): código que não afeta o resultado observável é removido, de um if (0) a uma variável calculada e nunca lida.\n\nO bonito é o efeito dominó: propagação transforma variáveis em constantes, o folding dobra as contas, condições viram falso fixo e o DCE poda o ramo inteiro. Uma otimização abre a porta da seguinte.",
                },
                {
                    type: "code",
                    value: "// Antes, como voce escreveu:\nstatic int quadrado(int x) { return x * x; }\nint f(void) {\n    int lado = 5;\n    int area = quadrado(lado);   // inlining: vira lado * lado\n    int debug = area * 2;        // nunca lido: candidato a DCE\n    if (area > 100) log_area();  // 25 > 100 e falso fixo: DCE\n    return area;\n}\n\n// Depois de propagar, dobrar e podar, o -O2 gera o\n// equivalente a:\nint f(void) { return 25; }",
                },
                {
                    type: "table",
                    value: '[["Otimização","O que faz","Antes","Depois"],["Constant folding","faz a conta em compilação","60 * 60 * 24","86400"],["Constant propagation","substitui variável de valor conhecido","x = 5; y = x + 2;","y = 7;"],["Inlining","cola o corpo no lugar da chamada","quadrado(lado)","lado * lado"],["Dead code elimination","remove o que não afeta o resultado","if (0) { ... }","nada"]]',
                },
                {
                    type: "text",
                    value: "## O contrato: comportamento observável\n\nA licença pra tudo isso é a regra do como se (as-if rule): o compilador pode reescrever à vontade, desde que o comportamento observável do programa não mude: as saídas, os acessos a variáveis volatile, as chamadas de funções cujo efeito ele não conhece. Dentro dessa cerca, variáveis somem, funções desaparecem, laços trocam de forma.\n\nIsso explica duas surpresas comuns. Primeira: no debugger, com otimização ligada, você tenta imprimir uma variável e recebe value optimized out; ela não existe mais, virou constante ou registrador. Segunda: seu benchmark ingênuo marca zero nanossegundos; o laço que só calculava algo nunca lido foi podado inteiro pelo DCE, e você mediu o nada.\n\nTambém fica claro o limite: o compilador só otimiza o que consegue PROVAR. Se a variável pode ser alterada por outro caminho, se a função chamada é opaca, se o ponteiro pode apontar pra qualquer lugar, ele recua pro caminho conservador. Código simples e local é código que o otimizador enxerga; e na próxima aula você controla o quanto ele tenta.",
                },
                {
                    type: "quote",
                    value: "O binário não é o seu código traduzido; é o seu código reescrito por um revisor obsessivo que corta tudo que não muda o resultado. Se a variável sumiu do debugger, ela provavelmente nunca precisou existir.",
                },
            ],
            questions: [
                {
                    statement: "O que o constant folding faz com a expressão 60 * 60 * 24?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Resolve a conta em compilação e grava 86400",
                            isCorrect: true,
                        },
                        {
                            text: "Reordena os fatores pra multiplicar mais rápido",
                            isCorrect: false,
                        },
                        {
                            text: "Move a multiplicação pra fora do laço principal",
                            isCorrect: false,
                        },
                        {
                            text: "Converte os fatores pra float antes de multiplicar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que acontece numa chamada de função quando o inlining é aplicado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O corpo da função é colado no lugar da chamada",
                            isCorrect: true,
                        },
                        {
                            text: "A função é movida pra uma biblioteca compartilhada",
                            isCorrect: false,
                        },
                        {
                            text: "A chamada passa a rodar numa thread em separado",
                            isCorrect: false,
                        },
                        {
                            text: "Os argumentos são convertidos em variáveis globais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o inlining costuma destravar outras otimizações?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Expõe o corpo no contexto e a análise enxerga através",
                            isCorrect: true,
                        },
                        {
                            text: "Reduz o tamanho do binário e sobra espaço no cache",
                            isCorrect: false,
                        },
                        {
                            text: "Força o compilador a repetir todas as fases anteriores",
                            isCorrect: false,
                        },
                        {
                            text: "Transforma toda variável local do corpo em constante",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Seu benchmark de um laço aritmético marcou tempo praticamente zero em -O2. Qual a explicação mais provável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O resultado nunca era lido e o DCE removeu o laço",
                            isCorrect: true,
                        },
                        {
                            text: "A CPU executou o laço em paralelo com o relógio",
                            isCorrect: false,
                        },
                        {
                            text: "O relógio de alta resolução falhou na sua máquina",
                            isCorrect: false,
                        },
                        {
                            text: "O laço rodou dentro do cache e ficou rápido demais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pela regra do como se, o que o compilador é obrigado a preservar ao otimizar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O comportamento observável, como saídas e volatile",
                            isCorrect: true,
                        },
                        {
                            text: "Todas as variáveis locais com os nomes originais",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade exata de instruções de cada função",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem das funções como aparecem no arquivo fonte",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Níveis de otimização: de O0 a Os",
            blocks: [
                {
                    type: "text",
                    value: "# O botão de esforço do compilador\n\nAs otimizações não vêm todas ligadas por padrão: você escolhe o pacote com a flag -O. Com -O0, o padrão do gcc e do clang, o compilador traduz quase literalmente: cada variável mora na memória, nada de inlining, o assembly espelha o fonte. É o modo mais rápido de compilar e o mais fiel pra depurar. -O1 liga o essencial barato. -O2 é o pacote completo de otimizações que não apostam alto em troca de espaço: o nível padrão de release na indústria, e o que os empacotadores de distribuição Linux usam em massa.\n\n-O3 vai além do -O2 com transformações mais agressivas de laço e vetorização mais ousada, que costumam inflar o código. Às vezes ganha de verdade em código numérico; às vezes empata ou até perde do -O2, porque código maior pressiona o cache de instruções. A resposta honesta é: meça no SEU programa.\n\nDuas letras completam o menu: -Os otimiza como -O2, mas priorizando tamanho, e -Og otimiza sem atrapalhar o debugger. As duas têm dono, como você vai ver a seguir.",
                },
                {
                    type: "table",
                    value: '[["Nível","Prioridade","Uso típico"],["-O0","compilar rápido, depurar fiel","desenvolvimento no dia a dia (padrão)"],["-O1","ganho básico sem custo alto","meio-termo raro na prática"],["-O2","desempenho equilibrado","release padrão da indústria"],["-O3","desempenho máximo, código maior","trechos numéricos, sempre com medição"],["-Os","menor tamanho de binário","embarcado e flash apertada"],["-Og","otimizar sem quebrar o debug","builds de desenvolvimento com gdb"]]',
                },
                {
                    type: "code",
                    value: "# O mesmo arquivo, quatro contratos diferentes:\ngcc -O0 -g app.c -o app_debug     # fiel ao fonte, gdb feliz\ngcc -O2 app.c -o app_release      # o padrao de producao\ngcc -O3 -march=native app.c -o a  # agressivo, so com medicao\ngcc -Os app.c -o app_flash        # cada byte conta\n\nsize app_release app_flash        # compare a secao .text\n#    text    data     bss     dec\n#   14232     616       8   14856  app_release\n#    9848     616       8   10472  app_flash",
                },
                {
                    type: "text",
                    value: "## Os pra caber, Og pra depurar\n\n-Os é o nível dos sistemas embarcados. Num microcontrolador com 128 KB de flash, o -O3 que desenrola laços e infla o código pode simplesmente não caber; o -Os aplica o receituário do -O2 vetando o que cresce, e ainda ganha desempenho onde código menor aproveita melhor o cache. Firmware em GCC pra ARM costuma nascer com -Os por padrão de projeto, e a régua é o tamanho da .text medido pelo size a cada build.\n\n-Og resolve outra dor: depurar com -O0 fica lento em programas grandes, mas depurar com -O2 é frustrante, com value optimized out e o cursor do gdb saltando linhas fora de ordem. O -Og liga as otimizações que não destroem a correspondência entre binário e fonte. Combine com -g, que emite os símbolos de depuração; e lembre que -g não muda o código gerado, só anexa informação, então -O2 -g é perfeitamente válido pra investigar produção.\n\nCritério pra fechar: -O0 ou -Og com -g pra desenvolver, -O2 pra entregar, -Os quando bytes valem ouro, -O3 apenas com benchmark que prove o ganho.",
                },
                {
                    type: "quote",
                    value: "Subir de -O2 pra -O3 sem medir não é otimização, é superstição: às vezes o código maior perde exatamente onde você jurava que ia ganhar.",
                },
            ],
            questions: [
                {
                    statement: "Qual nível de otimização é o padrão de release na indústria?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O -O2, pacote completo e bem equilibrado",
                            isCorrect: true,
                        },
                        {
                            text: "O -O0, por ser o padrão do compilador",
                            isCorrect: false,
                        },
                        {
                            text: "O -O3, por entregar o máximo possível",
                            isCorrect: false,
                        },
                        {
                            text: "O -Og, por facilitar o suporte em campo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a proposta da flag -Os?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Otimizar priorizando o tamanho do binário",
                            isCorrect: true,
                        },
                        {
                            text: "Otimizar priorizando a velocidade da build",
                            isCorrect: false,
                        },
                        {
                            text: "Desligar as otimizações que usam mais RAM",
                            isCorrect: false,
                        },
                        {
                            text: "Otimizar apenas as funções marcadas inline",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que -O3 às vezes perde do -O2 em programas reais?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O código inflado pressiona o cache de instruções",
                            isCorrect: true,
                        },
                        {
                            text: "O -O3 desliga o inlining pra ganhar na vetorização",
                            isCorrect: false,
                        },
                        {
                            text: "O -O3 só faz efeito em código de ponto flutuante",
                            isCorrect: false,
                        },
                        {
                            text: "O linker desfaz as otimizações extras na hora final",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Firmware pra um microcontrolador com flash apertada: qual combinação de partida faz mais sentido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "-Os, conferindo a seção .text com o comando size",
                            isCorrect: true,
                        },
                        {
                            text: "-O3 com -march=native pra extrair o máximo do chip",
                            isCorrect: false,
                        },
                        {
                            text: "-O0, porque firmware não deve ser otimizado nunca",
                            isCorrect: false,
                        },
                        {
                            text: "-O1, que é o único nível permitido em bare metal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depurar com -O0 está lento demais, mas o -O2 embaralha o gdb. Qual flag ataca exatamente esse dilema?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "-Og, que otimiza sem romper o vínculo com o fonte",
                            isCorrect: true,
                        },
                        {
                            text: "-O3, que gera símbolos de depuração mais completos",
                            isCorrect: false,
                        },
                        {
                            text: "-Os, que reduz o binário e acelera qualquer debug",
                            isCorrect: false,
                        },
                        {
                            text: "-g3, que desliga as otimizações conflitantes sozinho",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Undefined behavior: a licença do otimizador",
            blocks: [
                {
                    type: "text",
                    value: "# O contrato que você assinou sem ler\n\nO padrão do C e do C++ define o comportamento da linguagem, mas deixa buracos deliberados: situações de undefined behavior, UB, sobre as quais ele não promete NADA. Overflow de inteiro com sinal, ler além do fim de um array, desreferenciar ponteiro nulo, usar variável não inicializada: se o seu programa faz isso, o padrão lava as mãos, e qualquer resultado é conforme.\n\nO pulo do gato é entender o que o otimizador faz com esses buracos: ele assume que UB NUNCA acontece no seu programa, e usa essa suposição como axioma nas provas que autorizam otimizações. Se x é int, o compilador raciocina: x + 1 > x é verdadeiro sempre, porque se x + 1 estourasse, seria UB, e UB não acontece. A comparação inteira vira a constante true e some do binário.\n\nNão é malícia: é a outra face da velocidade que você cobra dele. Sem assumir a ausência de UB, cada soma precisaria de checagem de overflow e cada laço perderia transformações valiosas. A licença que acelera o código correto é a mesma que surpreende o incorreto.",
                },
                {
                    type: "code",
                    value: "int checa(int x) {\n    return x + 1 > x;      // overflow com sinal seria UB...\n}\n// -O2 (x86-64):\n//   checa:\n//       mov eax, 1        // ...logo o compilador responde 1\n//       ret\n\nvoid espia(int *p) {\n    int v = *p;            // desreferencia ANTES do teste\n    if (p == NULL) return; // logo p nao pode ser nulo aqui...\n    usa(v);\n}\n// -O2: o if inteiro e removido como codigo morto.\n// Caso celebre no kernel Linux (2009): a checagem sumiu\n// e virou brecha de seguranca explorada de verdade.",
                },
                {
                    type: "table",
                    value: '[["Undefined behavior","Exemplo","O que o otimizador conclui"],["Overflow de int com sinal","x + 1 com x no máximo","x + 1 > x é sempre verdadeiro"],["Desreferência de nulo","*p antes de testar p","p não é nulo; o teste vira código morto"],["Acesso fora do array","v[10] num array de 10","aquele caminho nunca executa"],["Variável sem inicializar","ler int local virgem","qualquer valor serve à prova"],["Shift além da largura","1 << 40 em int de 32 bits","a expressão nunca é avaliada"]]',
                },
                {
                    type: "text",
                    value: "## Os casos famosos e a postura profissional\n\nO exemplo do null check é história real: em 2009, um driver do kernel Linux desreferenciava o ponteiro antes de testá-lo; o gcc, corretamente, deduziu que o ponteiro não podia ser nulo e removeu o teste. A ausência da checagem virou vulnerabilidade explorável, e o episódio entrou pra toda palestra sobre UB desde então. Outro clássico: laços com contador int e comparações que o compilador reescreve assumindo que o overflow nunca vem, quebrando códigos que contavam com o estouro dar a volta.\n\nA postura profissional tem três pontas. Primeira: UB não é um erro que o compilador detecta e pune; é uma premissa que ele usa em silêncio; o programa pode até parecer funcionar em -O0 e mudar de cara em -O2, e ambos estão conformes. Segunda: não negocie com o UB; escreva a checagem ANTES do uso, use tipos sem sinal ou largura maior quando o estouro for possível. Terceira: instrumente; o UBSan, que o módulo 6 apresenta, flagra em runtime exatamente essas armadilhas.\n\nUB é o preço da performance do C e do C++. Conhecê-lo é o que separa respeito de medo.",
                },
                {
                    type: "quote",
                    value: "O otimizador não procura undefined behavior pra te punir; ele prova teoremas partindo do axioma de que UB não existe no seu código. Se o axioma é falso, a prova sai elegante e errada.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que o padrão do C promete sobre um programa que executa undefined behavior?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Nada: qualquer resultado passa a ser conforme",
                            isCorrect: true,
                        },
                        {
                            text: "Que o programa será abortado com uma mensagem",
                            isCorrect: false,
                        },
                        {
                            text: "Que o resultado repete igual em toda execução",
                            isCorrect: false,
                        },
                        {
                            text: "Que apenas o valor da expressão fica indefinido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual premissa o otimizador adota sobre UB ao transformar o código?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Que UB nunca acontece no programa compilado",
                            isCorrect: true,
                        },
                        {
                            text: "Que UB só acontece nos trechos sem otimização",
                            isCorrect: false,
                        },
                        {
                            text: "Que todo UB será visto e barrado pelo linker",
                            isCorrect: false,
                        },
                        {
                            text: "Que UB vira warning quando o -Wall está ligado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que, com x do tipo int, o -O2 compila x + 1 > x como a constante 1?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O estouro com sinal seria UB, logo é tratado como impossível",
                            isCorrect: true,
                        },
                        {
                            text: "A CPU satura somas com sinal e o resultado nunca diminui",
                            isCorrect: false,
                        },
                        {
                            text: "O padrão define que soma com sinal dá a volta no máximo",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador converte a conta pra unsigned antes de comparar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No caso do kernel em 2009, por que o gcc removeu o if (p == NULL)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O *p vinha antes, provando pro otimizador que p não era nulo",
                            isCorrect: true,
                        },
                        {
                            text: "Um bug do gcc apagava checagens de nulo em qualquer driver",
                            isCorrect: false,
                        },
                        {
                            text: "A flag -O2 remove todo teste de ponteiro por padrão de fábrica",
                            isCorrect: false,
                        },
                        {
                            text: "O linker descartou o teste ao juntar os objetos do kernel",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um programa funciona em -O0 e quebra em -O2 por causa de UB. O que isso diz sobre compilador e programa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ambas as saídas são conformes: o programa é que está errado",
                            isCorrect: true,
                        },
                        {
                            text: "O -O2 está com defeito e o caso merece um report ao GCC",
                            isCorrect: false,
                        },
                        {
                            text: "O -O0 esconde um bug do compilador que o -O2 revela ao mundo",
                            isCorrect: false,
                        },
                        {
                            text: "O programa está certo e deve ser distribuído compilado em -O0",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ver o assembly: godbolt como hábito",
            blocks: [
                {
                    type: "text",
                    value: "# A janela pro que o compilador fez\n\nTudo que este módulo afirmou sobre otimização é verificável em segundos, e a ferramenta que tornou isso um hábito mundial é o Compiler Explorer, o godbolt.org, criado por Matt Godbolt. Você cola uma função no painel esquerdo, escolhe compilador e flags, e o assembly aparece à direita, colorido por linha do fonte, atualizando a cada tecla. Em 2026 ele traz GCC e Clang em dezenas de versões e alvos, de x86-64 a ARM e RISC-V, e é gratuito no navegador.\n\nO exercício fundamental é comparar -O0 com -O2 lado a lado. Em -O0, a função soma_ate(n) vira dezenas de linhas: cada variável lida e escrita na pilha, o laço fiel ao fonte. Em -O2, o mesmo laço de soma aritmética costuma virar meia dúzia de instruções sem salto, porque o compilador reconheceu a fórmula fechada, ou um laço vetorizado. Ver isso uma vez ensina mais que dez artigos.\n\nLocalmente, o equivalente é gcc -S -O2 arquivo.c, que deixa o .s no disco; o godbolt só tira o atrito até isso virar reflexo.",
                },
                {
                    type: "code",
                    value: "int soma_ate(int n) {\n    int s = 0;\n    for (int i = 1; i <= n; i++) s += i;\n    return s;\n}\n\n# x86-64 gcc -O2 (essencia): o laco sumiu; sobrou a\n# formula n*(n+1)/2 em poucas instrucoes sem salto.\nsoma_ate:\n        test    edi, edi\n        jle     .L4\n        lea     eax, [rdi-1]\n        ...\n        ret\n.L4:    xor     eax, eax\n        ret",
                },
                {
                    type: "table",
                    value: '[["O que olhar no assembly","Como reconhecer","O que revela"],["Tamanho da função","quantidade de linhas até o ret","quanto o nível de -O enxugou"],["Acessos à pilha","mov com [rbp-...] ou [rsp+...]","-O0 guarda tudo na memória"],["Saltos e rótulos","jle, jmp, .L2, .L4","laços e ifs que sobreviveram"],["Chamadas","call nome_da_funcao","o que o inlining não absorveu"],["Vetorização","registradores xmm e ymm","o laço processando em blocos"]]',
                },
                {
                    type: "text",
                    value: "## Ler o essencial, sem virar expert em assembly\n\nVocê não precisa escrever assembly pra extrair valor daqui; precisa de meia dúzia de padrões de leitura. Instruções mov movem dados; call chama função; ret encerra; rótulos como .L3 com saltos jmp ou jle marcam laços e desvios; nomes como edi e eax são registradores, os primeiros argumentos inteiros chegam em edi e esi e o retorno sai em eax na convenção do x86-64. Com esse vocabulário mínimo, as perguntas úteis já têm resposta: a função foi inlinada? Procure o call. O laço sobreviveu? Procure rótulo com salto de volta. O if sumiu? Procure a comparação.\n\nTransforme em rotina de engenharia: antes de afirmar que uma micro-otimização no fonte melhora algo, cole as duas versões no godbolt e compare o assembly em -O2. Na maioria das vezes o compilador já fazia aquilo sozinho, e a mudança só piorou a legibilidade. A resposta está a uma aba de distância, e times maduros em 2026 tratam o link do godbolt como anexo padrão de discussão de performance.",
                },
                {
                    type: "quote",
                    value: "Discutir o que o compilador gera sem olhar o assembly é ler borra de café. O godbolt encostou a resposta na pergunta: cole a função, escolha a flag e pare de adivinhar.",
                },
            ],
            questions: [
                {
                    statement: "O que o Compiler Explorer (godbolt) mostra?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O assembly gerado pro seu código, por compilador e flags",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo de execução da função em vários processadores",
                            isCorrect: false,
                        },
                        {
                            text: "Os erros de lógica que os testes não conseguiram pegar",
                            isCorrect: false,
                        },
                        {
                            text: "A árvore sintática colorida de cada linha do programa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual comando local gera o arquivo .s pra inspeção, sem sair do terminal?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "gcc -S -O2 arquivo.c",
                            isCorrect: true,
                        },
                        {
                            text: "gcc -E -O2 arquivo.c",
                            isCorrect: false,
                        },
                        {
                            text: "nm -O2 arquivo.c",
                            isCorrect: false,
                        },
                        {
                            text: "gcc -c -g arquivo.c",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No assembly em -O2, o que a ausência de um call pra função pequena indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela foi inlinada no ponto onde era chamada",
                            isCorrect: true,
                        },
                        {
                            text: "Ela foi movida pra uma biblioteca dinâmica",
                            isCorrect: false,
                        },
                        {
                            text: "Ela será resolvida pelo linker na fase final",
                            isCorrect: false,
                        },
                        {
                            text: "Ela roda por interrupção, sem chamada direta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Comparando -O0 e -O2 no godbolt, o que os acessos constantes a [rbp-...] no -O0 revelam?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As variáveis vivem na pilha, sem alocação em registrador",
                            isCorrect: true,
                        },
                        {
                            text: "O código sofreu vetorização automática nos dois níveis",
                            isCorrect: false,
                        },
                        {
                            text: "A função depende de memória alocada dinamicamente no heap",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador inseriu canários de proteção contra overflow",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um colega propõe trocar x * 2 por x << 1 no fonte pra acelerar. Qual é a resposta de engenharia?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Comparar o assembly das duas versões em -O2 no godbolt",
                            isCorrect: true,
                        },
                        {
                            text: "Aceitar: deslocamento sempre executa mais rápido que produto",
                            isCorrect: false,
                        },
                        {
                            text: "Recusar: mexer em operadores aritméticos é proibido em C",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar só nos laços, onde o ganho do shift é multiplicado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - O linker e o binário",
    aulas: [
        {
            titulo: "Símbolos e name mangling",
            blocks: [
                {
                    type: "text",
                    value: "# Por que o C++ decora nomes\n\nEm C, a função soma vira o símbolo soma, e acabou. Em C++, a mesma função vira algo como _Z4somaii, e há um motivo sólido: sobrecarga. O C++ permite várias funções soma, uma pra int e int, outra pra double e double, e o linker, que só conhece nomes, precisa distingui-las. A solução é o name mangling: o compilador codifica no símbolo a assinatura completa, nome, namespace, tipos dos parâmetros. _Z4somaii se decompõe em: _Z prefixo do esquema, 4soma nome com o comprimento na frente, ii dois parâmetros int.\n\nO esquema é uma convenção de ABI, não parte da linguagem. GCC e Clang no Linux seguem a mesma, a Itanium C++ ABI, e por isso objetos dos dois se linkam entre si; o MSVC no Windows usa outra, incompatível.\n\nPra traduzir de volta existe o c++filt: ecoe o símbolo nele e receba a assinatura legível. O nm aceita a flag -C, que já imprime tudo demangled. Guarde essa dupla: ela transforma erros de link de C++ de hieróglifo em frase.",
                },
                {
                    type: "code",
                    value: "$ cat mat.cpp\nint soma(int a, int b)       { return a + b; }\ndouble soma(double a, double b) { return a + b; }\n\n$ g++ -c mat.cpp && nm mat.o\n0000000000000000 T _Z4somadd\n0000000000000024 T _Z4somaii\n\n$ echo _Z4somaii | c++filt\nsoma(int, int)\n\n$ nm -C mat.o        # -C ja aplica o demangle\n0000000000000000 T soma(double, double)\n0000000000000024 T soma(int, int)",
                },
                {
                    type: "table",
                    value: '[["Símbolo decorado","Leitura pelo c++filt","O que a codificação diz"],["_Z4somaii","soma(int, int)","nome soma, dois parâmetros int"],["_Z4somadd","soma(double, double)","mesmo nome, tipos diferentes"],["_ZN3geo4areaEdd","geo::area(double, double)","N...E marca o namespace geo"],["soma","soma","função C: sem decoração"],["_ZNSt6vectorIiSaIiEE9push_backERKi","std::vector<int...>::push_back(...)","templates rendem nomes longos"]]',
                },
                {
                    type: "text",
                    value: '## extern "C": a ponte entre os dois mundos\n\nO mangling cria um problema clássico de fronteira. Uma biblioteca compilada em C exporta o símbolo cru init_driver; seu programa C++ inclui o header, o compilador decora a referência pra _Z11init_driverv, e o link falha com undefined reference, mesmo com a biblioteca ali do lado. Os dois falam de funções idênticas com nomes de símbolo diferentes.\n\nA ponte é extern "C": declara que aquelas funções seguem a convenção do C, sem mangling. Por isso os headers de bibliotecas C preparados pra conviver com C++ trazem o padrão consagrado: um bloco extern "C" { ... } guardado por #ifdef __cplusplus, de modo que o mesmo header funcione nos dois compiladores. É o que você vê em praticamente todo header de sistema.\n\nO custo da ponte: funções extern "C" não podem ser sobrecarregadas, já que todas disputariam o mesmo símbolo cru. E a regra de diagnóstico fica: undefined reference com nome decorado enquanto o nm da biblioteca mostra o nome limpo (ou o contrário) grita mistura de convenções; a resposta quase sempre é um extern "C" faltando no header.',
                },
                {
                    type: "quote",
                    value: "O linker não sabe o que é sobrecarga: ele casa strings. O mangling existe pra transformar a riqueza de tipos do C++ em strings distintas, e o c++filt existe pra você ler o que o compilador escreveu.",
                },
            ],
            questions: [
                {
                    statement: "Por que o C++ precisa decorar os nomes das funções nos símbolos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pra sobrecargas virarem símbolos distintos no link",
                            isCorrect: true,
                        },
                        {
                            text: "Pra esconder os nomes das funções de descompiladores",
                            isCorrect: false,
                        },
                        {
                            text: "Pra reduzir o tamanho da tabela de símbolos do objeto",
                            isCorrect: false,
                        },
                        {
                            text: "Pra acelerar a busca de nomes na fase de compilação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual ferramenta traduz _Z4somaii de volta pra soma(int, int)?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O c++filt, ou o nm chamado com a flag -C",
                            isCorrect: true,
                        },
                        {
                            text: "O strip, aplicado com a flag de verbosidade",
                            isCorrect: false,
                        },
                        {
                            text: "O ldd, listando as dependências do binário",
                            isCorrect: false,
                        },
                        {
                            text: "O gcc -E, expandindo as macros do arquivo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: 'O que a declaração extern "C" muda numa função declarada em C++?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "O símbolo dela fica cru, na convenção do C",
                            isCorrect: true,
                        },
                        {
                            text: "Ela passa a ser compilada pelo gcc, não pelo g++",
                            isCorrect: false,
                        },
                        {
                            text: "Ela ganha uma cópia extra em cada arquivo objeto",
                            isCorrect: false,
                        },
                        {
                            text: "Ela vira inline e some da tabela de símbolos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Seu programa C++ chama uma biblioteca em C e o link falha com undefined reference to _Z11init_driverv. Qual a causa provável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: 'O header da lib foi lido sem extern "C" e o nome foi decorado',
                            isCorrect: true,
                        },
                        {
                            text: "A biblioteca foi compilada sem otimização e perdeu os símbolos",
                            isCorrect: false,
                        },
                        {
                            text: "O c++filt corrompeu a tabela de símbolos durante a inspeção",
                            isCorrect: false,
                        },
                        {
                            text: "O linker exige que bibliotecas C venham antes dos objetos C++",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Por que funções declaradas extern "C" não podem ser sobrecarregadas?',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Sem mangling, todas disputariam o mesmo símbolo cru",
                            isCorrect: true,
                        },
                        {
                            text: "O padrão do C limita cada arquivo a uma função por nome",
                            isCorrect: false,
                        },
                        {
                            text: "O linker do C ignora funções com mais de um parâmetro",
                            isCorrect: false,
                        },
                        {
                            text: "A ABI Itanium proíbe tipos diferentes em headers mistos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Undefined reference: anatomia do erro",
            blocks: [
                {
                    type: "text",
                    value: "# O erro mais famoso do link\n\nundefined reference to 'soma': nenhuma mensagem da toolchain foi mais digitada em buscadores. A anatomia é simples: algum objeto USA o símbolo soma (o U do nm), e nenhum objeto ou biblioteca do comando de link o DEFINE (o T que deveria existir). Note quem fala: não é o compilador, é o ld, geralmente via collect2 na saída do gcc. Seu código pode estar perfeito; o que falhou foi a montagem do quebra-cabeça.\n\nAs causas de verdade cabem numa lista curta. Primeira, e campeã: o objeto ou a biblioteca que define o símbolo ficou fora do comando; você compilou main.c e esqueceu mat.o. Segunda: a ordem dos argumentos; bibliotecas estáticas precisam vir DEPOIS de quem as usa, como a próxima aula destrincha. Terceira, típica de C++: a assinatura não bate; você declarou soma(int, int) no header, mas definiu soma(long, long) no .cpp, e os símbolos decorados são diferentes. Quarta: o main em C++ esqueceu que a lib era C, o caso do extern \"C\" da aula passada.\n\nCom as causas mapeadas, o diagnóstico vira rotina, e é o que o próximo bloco monta.",
                },
                {
                    type: "table",
                    value: '[["Causa","Sintoma típico","Conserto"],["Objeto ou lib fora do comando","o símbolo não aparece em nenhum arquivo linkado","adicionar o .o ou o -l que faltou"],["Ordem errada dos argumentos","a lib está no comando e o erro persiste","mover a -lbiblioteca pra depois dos objetos"],["Assinatura divergente (C++)","nm mostra símbolo parecido, decorado diferente","alinhar header e definição"],["Mistura C e C++ sem ponte","referência decorada, definição crua","extern \\"C\\" no header incluído"],["Método virtual sem corpo","undefined reference to \'vtable for Classe\'","definir os virtuais declarados"]]',
                },
                {
                    type: "code",
                    value: "$ g++ main.o -o app\n/usr/bin/ld: main.o: in function 'main':\nmain.cpp:(.text+0x1a): undefined reference to 'soma(int, int)'\ncollect2: error: ld returned 1 exit status\n\n# Passo 1: quem PRECISA do simbolo?\n$ nm -C main.o | grep soma\n                 U soma(int, int)\n\n# Passo 2: quem DEFINE o simbolo?\n$ nm -C mat.o | grep soma\n0000000000000000 T soma(long, long)   # achou o culpado:\n                                      # assinatura diferente",
                },
                {
                    type: "text",
                    value: "## O método: nm dos dois lados\n\nO diagnóstico profissional tem três passos e cabe num minuto. Passo um: leia o erro inteiro e anote o símbolo exato, com o demangle se for C++. Passo dois: confirme quem consome; nm -C sobre o objeto citado na mensagem deve mostrar o símbolo com U. Passo três: procure quem deveria fornecer; rode nm -C sobre cada .o e nm -C na biblioteca suspeita, filtrando com grep. Três finais possíveis: o símbolo não aparece com T em lugar nenhum, então falta compilar ou linkar algo; aparece com T num arquivo que não está no comando, então inclua o arquivo; aparece parecido, mas não idêntico, então a assinatura divergiu, compare com atenção os tipos.\n\nDois refinamentos fecham a aula. Se o T existe numa biblioteca estática que JÁ está no comando, desconfie da ordem dos argumentos, tema da próxima aula. E aprenda a variante vtable: undefined reference to 'vtable for Minha Classe' indica método virtual declarado e nunca definido, um clássico de quem esqueceu o corpo do destrutor. A mensagem assusta, o método resolve igual.",
                },
                {
                    type: "quote",
                    value: "Undefined reference não pede genialidade, pede método: um nm em quem consome, um nm em quem deveria fornecer, e a diferença entre os dois é o seu bug.",
                },
            ],
            questions: [
                {
                    statement: "Qual programa emite a mensagem undefined reference?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O linker ld, na montagem final do executável",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador, durante a análise semântica",
                            isCorrect: false,
                        },
                        {
                            text: "O pré-processador, ao expandir os headers",
                            isCorrect: false,
                        },
                        {
                            text: "O loader, na primeira execução do programa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a causa mais comum de um undefined reference?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O objeto ou a lib que define o símbolo ficou fora do link",
                            isCorrect: true,
                        },
                        {
                            text: "O header da função foi incluído duas vezes no mesmo .c",
                            isCorrect: false,
                        },
                        {
                            text: "O símbolo foi otimizado pra fora do binário pelo -O2",
                            isCorrect: false,
                        },
                        {
                            text: "A função foi declarada static dentro do próprio header",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No diagnóstico com nm dos dois lados, o que você procura em cada lado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O U em quem consome e o T em quem deveria definir",
                            isCorrect: true,
                        },
                        {
                            text: "O T nos dois arquivos, provando a dupla definição",
                            isCorrect: false,
                        },
                        {
                            text: "O D em ambos, confirmando que o dado foi iniciado",
                            isCorrect: false,
                        },
                        {
                            text: "O U nos dois lados, sinal de dependência circular",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Header declara soma(int, int); o .cpp define soma(long, long). Por que o link quebra em C++?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O mangling gera símbolos diferentes pras duas assinaturas",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador recusa long como tipo de parâmetro em headers",
                            isCorrect: false,
                        },
                        {
                            text: "O linker converte int pra long e perde o nome da função",
                            isCorrect: false,
                        },
                        {
                            text: "A definição com long precisa vir antes do main no comando",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que costuma provocar undefined reference to 'vtable for Classe'?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Método virtual declarado sem definição em objeto algum",
                            isCorrect: true,
                        },
                        {
                            text: "Herança múltipla, que o linker do GCC ainda não aceita",
                            isCorrect: false,
                        },
                        {
                            text: "Uso de templates fora de um header com include guard",
                            isCorrect: false,
                        },
                        {
                            text: "Excesso de métodos inline na declaração da classe base",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Bibliotecas na prática: ordem e símbolos fracos",
            blocks: [
                {
                    type: "text",
                    value: "# A ordem no comando importa\n\nEis um comportamento que já queimou horas de muita gente boa: gcc -lmat main.o falha com undefined reference, enquanto gcc main.o -lmat linka limpo. A mesma biblioteca, o mesmo objeto, só a ordem mudou. A razão é o algoritmo do linker com bibliotecas estáticas: ele processa os argumentos da ESQUERDA pra DIREITA, mantendo uma lista de símbolos pendentes, e de uma .a ele só puxa os objetos que resolvem pendências existentes NAQUELE momento.\n\nNo comando quebrado, a libmat.a é examinada primeiro, quando não há pendência nenhuma; nada é puxado, e ela é dispensada. Aí vem main.o, que registra a pendência de soma, mas a biblioteca já ficou pra trás: o linker não volta. No comando certo, main.o entra primeiro e anota a dívida; quando a libmat.a chega, o objeto com soma é puxado e a conta fecha.\n\nA regra de bolso: objetos primeiro, bibliotecas depois, e quem USA vem antes de quem FORNECE. Entre bibliotecas vale o mesmo: se liba depende de libb, escreva -la -lb, nessa ordem.",
                },
                {
                    type: "code",
                    value: "$ gcc -lmat main.o -o app          # ordem errada\n/usr/bin/ld: main.o: undefined reference to 'soma'\n\n$ gcc main.o -lmat -L. -o app      # quem usa antes de quem fornece\n$ ./app\n42\n\n# Dependencia circular entre estaticas: a resolve com b,\n# b resolve com a. Ou repete a primeira no fim...\ngcc main.o -la -lb -la -L. -o app\n# ...ou pede varredura em grupo ao linker:\ngcc main.o -Wl,--start-group -la -lb -Wl,--end-group -L. -o app",
                },
                {
                    type: "table",
                    value: '[["Situação","Comando","Resultado"],["Lib antes de quem a usa","gcc -lmat main.o","undefined reference: a .a foi dispensada cedo"],["Ordem correta","gcc main.o -lmat","linka: a pendência existia quando a .a chegou"],["a depende de b","gcc main.o -la -lb","linka: dependente antes da dependência"],["Ciclo entre a e b","gcc main.o -la -lb -la","linka: a repetição cobre a volta do ciclo"],["Ciclo, forma explícita","--start-group -la -lb --end-group","linka: o grupo é varrido até estabilizar"]]',
                },
                {
                    type: "text",
                    value: "## Símbolos fracos: o padrão que cede a vez\n\nFalta um conceito pra fechar o vocabulário do linker: o símbolo fraco. Um símbolo normal (forte) briga: dois T pro mesmo nome dão multiple definition. Um símbolo marcado como fraco, com o atributo weak do GCC e do Clang, se oferece como padrão educado: se ninguém mais definir aquele nome, vale a versão fraca; se aparecer uma definição forte, ela vence sem conflito, e o linker nem reclama.\n\nO uso clássico mora no mundo embarcado, e você vai reencontrá-lo: os arquivos de startup dos fabricantes definem cada handler de interrupção como um alias fraco pra um laço infinito padrão. Seu firmware define UART_Handler forte, e ela substitui o padrão automaticamente; as interrupções que você não tratou continuam caindo no laço seguro. Bibliotecas usam o mesmo truque pra oferecer hooks substituíveis, como um malloc padrão que um alocador customizado pode sobrepor.\n\nNo nm, fracos aparecem como W ou w em vez de T. Vale saber ler: um W inesperado explica por que a sua função foi silenciosamente trocada por outra, sem nenhum erro de duplicação no caminho.",
                },
                {
                    type: "quote",
                    value: "O linker de estáticas lê da esquerda pra direita e não olha pra trás: biblioteca examinada antes da dívida existir é biblioteca dispensada. Objetos primeiro, bibliotecas depois, dependentes antes das dependências.",
                },
            ],
            questions: [
                {
                    statement: "Por que gcc main.o -lmat funciona e gcc -lmat main.o pode falhar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A .a só entrega objetos pra pendências já anotadas",
                            isCorrect: true,
                        },
                        {
                            text: "O gcc exige flags de biblioteca no fim por sintaxe",
                            isCorrect: false,
                        },
                        {
                            text: "O main.o precisa ser o primeiro arquivo do binário",
                            isCorrect: false,
                        },
                        {
                            text: "A .a corrompe os objetos listados na frente dela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Se a liba depende da libb, qual a ordem correta no comando de link?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "-la antes de -lb: dependente antes da dependência",
                            isCorrect: true,
                        },
                        {
                            text: "-lb antes de -la: a base sempre vem na frente",
                            isCorrect: false,
                        },
                        {
                            text: "Tanto faz: o linker reordena as estáticas sozinho",
                            isCorrect: false,
                        },
                        {
                            text: "As duas antes dos objetos, pra abrir as pendências",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Duas bibliotecas estáticas dependem uma da outra. Quais saídas resolvem o link?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Repetir a primeira no fim ou usar --start-group",
                            isCorrect: true,
                        },
                        {
                            text: "Converter as duas pra .so, única forma de ciclo",
                            isCorrect: false,
                        },
                        {
                            text: "Fundir os fontes num único arquivo antes do build",
                            isCorrect: false,
                        },
                        {
                            text: "Linkar cada uma em separado e juntar com o strip",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que acontece quando um símbolo forte e um fraco de mesmo nome chegam ao linker?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O forte vence e o fraco cede sem gerar conflito",
                            isCorrect: true,
                        },
                        {
                            text: "Multiple definition, como em qualquer duplicata",
                            isCorrect: false,
                        },
                        {
                            text: "O fraco vence por ter sido registrado primeiro",
                            isCorrect: false,
                        },
                        {
                            text: "O linker escolhe pelo tamanho do corpo de cada um",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que fabricantes definem handlers de interrupção como símbolos fracos nos arquivos de startup?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Seu handler forte substitui o padrão sem tocar no startup",
                            isCorrect: true,
                        },
                        {
                            text: "Símbolos fracos ocupam menos flash que handlers comuns",
                            isCorrect: false,
                        },
                        {
                            text: "O hardware só dispara interrupções de símbolos fracos",
                            isCorrect: false,
                        },
                        {
                            text: "Handlers fortes não podem ser chamados por interrupção",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Linker script: quem decide onde cada coisa mora",
            blocks: [
                {
                    type: "text",
                    value: "# O mapa de memória tem dono\n\nAté aqui o linker pareceu um juntador de objetos, mas ele tem uma segunda função, mais silenciosa: decidir o ENDEREÇO de cada coisa. Alguém precisa determinar que a .text começa em tal ponto, que a .data vem depois, que a pilha cresce dali. Esse alguém é o linker script: um arquivo na linguagem do ld que descreve as memórias disponíveis e despacha cada seção de entrada pra uma região de saída.\n\nNo desktop você nunca o vê porque o ld usa um script padrão embutido (imprima com ld --verbose), adequado a executáveis Linux carregados pelo sistema operacional com memória virtual. As seções que você conhece do nm são exatamente o que ele organiza: .text com código, .rodata com constantes, .data com globais inicializadas, .bss com as zeradas.\n\nA sintaxe central cabe em dois blocos: MEMORY declara as regiões, com origem e tamanho; SECTIONS mapeia cada seção pra uma região. Ler um script é responder três perguntas: quais memórias existem, o que vai em cada uma, e quem copia o quê na largada.",
                },
                {
                    type: "code",
                    value: "/* Trecho tipico de linker script pra um microcontrolador */\nMEMORY\n{\n  FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 256K\n  RAM   (rwx) : ORIGIN = 0x20000000, LENGTH = 64K\n}\n\nSECTIONS\n{\n  .text  : { *(.text*) *(.rodata*) } > FLASH\n  .data  : { *(.data*) } > RAM AT > FLASH  /* copia na largada */\n  .bss   : { *(.bss*)  } > RAM            /* zerada no boot   */\n}",
                },
                {
                    type: "table",
                    value: '[["Seção","Conteúdo","Morada típica no embarcado"],[".text","código de máquina","flash, memória só de leitura"],[".rodata","constantes e strings literais","flash, junto do código"],[".data","globais inicializadas","RAM, com imagem inicial copiada da flash"],[".bss","globais zeradas","RAM, zerada pelo código de startup"],["pilha e heap","execução","RAM, nos limites que o script definir"]]',
                },
                {
                    type: "text",
                    value: "## Por que o embarcado edita esse arquivo\n\nNum microcontrolador não há sistema operacional nem loader: o binário é gravado em endereços físicos reais, e o chip liga executando do endereço de reset da flash. O mapa de memória do chip, quanta flash, quanta RAM, onde cada uma começa, precisa estar escrito em algum lugar, e esse lugar é o linker script que o fabricante entrega junto com o SDK. Trocar de chip dentro da mesma família frequentemente se resume a ajustar ORIGIN e LENGTH.\n\nO script também explica um ritual do startup embarcado: a .data precisa de valores iniciais, mas RAM desliga sem energia; então a imagem inicial mora na flash (o AT > FLASH do exemplo) e o código de startup a copia pra RAM antes do main, além de zerar a .bss. Sem entender o script, esse trecho do startup parece magia.\n\nE quando o código não cabe, o erro vem do ld e cita o script: region 'FLASH' overflowed by 1234 bytes. É o gancho da próxima aula: medir o que ocupa cada seção e emagrecer o binário.",
                },
                {
                    type: "quote",
                    value: "No desktop, o mapa de memória é herdado e invisível; no embarcado, ele é um arquivo seu, com nome, endereços e tamanho. Quem nunca leu um linker script ainda não sabe onde o próprio código mora.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o papel do linker script?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mapear as seções do programa pras regiões de memória",
                            isCorrect: true,
                        },
                        {
                            text: "Listar os arquivos objeto que o make deve recompilar",
                            isCorrect: false,
                        },
                        {
                            text: "Definir as flags de otimização usadas pelo compilador",
                            isCorrect: false,
                        },
                        {
                            text: "Descrever os símbolos exportados pra outras bibliotecas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No script, o que os blocos MEMORY e SECTIONS declaram, respectivamente?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "As regiões disponíveis e o destino de cada seção",
                            isCorrect: true,
                        },
                        {
                            text: "O tamanho da pilha e a ordem de boot dos módulos",
                            isCorrect: false,
                        },
                        {
                            text: "Os endereços das funções e os nomes dos objetos",
                            isCorrect: false,
                        },
                        {
                            text: "As permissões do executável e o dono do processo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que projetos embarcados editam o linker script e o desktop quase nunca?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem SO nem loader, o binário mora em endereços físicos do chip",
                            isCorrect: true,
                        },
                        {
                            text: "O ld do desktop não aceita nenhum script fornecido pelo usuário",
                            isCorrect: false,
                        },
                        {
                            text: "Compiladores de embarcado não trazem script padrão embutido",
                            isCorrect: false,
                        },
                        {
                            text: "No desktop as seções .text e .data ficam dentro do kernel",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pra que serve o AT > FLASH na linha da .data de um script embarcado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Guardar na flash a imagem inicial que o startup copia pra RAM",
                            isCorrect: true,
                        },
                        {
                            text: "Executar as globais inicializadas direto da memória flash",
                            isCorrect: false,
                        },
                        {
                            text: "Proibir escritas na .data durante a execução do firmware",
                            isCorrect: false,
                        },
                        {
                            text: "Duplicar a .data pra sobreviver a quedas bruscas de energia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O build falha com region 'FLASH' overflowed by 1234 bytes. O que a mensagem significa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O que foi mandado pra flash excede o LENGTH declarado",
                            isCorrect: true,
                        },
                        {
                            text: "A pilha invadiu a flash durante a execução do firmware",
                            isCorrect: false,
                        },
                        {
                            text: "O script listou a flash duas vezes no bloco de memórias",
                            isCorrect: false,
                        },
                        {
                            text: "O gravador escreveu 1234 bytes além do fim do arquivo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Tamanho do binário: medir e emagrecer",
            blocks: [
                {
                    type: "text",
                    value: "# Antes de cortar, meça\n\nSeu hello world em C++ tem centenas de KB e o do vizinho em C tem dezenas? Antes de qualquer opinião, meça. A primeira régua é o size, que mostra o total por seção: text (código e constantes), data (globais inicializadas), bss (zeradas, que ocupam RAM mas não arquivo). A segunda é o mapa de link: gcc -Wl,-Map=app.map faz o linker escrever um relatório de onde cada símbolo de cada objeto foi parar, com endereço e tamanho. É o extrato bancário do binário: ordene pelos maiores e a fonte do inchaço aparece com nome e sobrenome.\n\nPra uma visão por símbolo direto do binário, nm --size-sort -C lista as funções em ordem de tamanho, e ferramentas como o bloaty, popular em 2026, agregam por seção, por arquivo e por template.\n\nSó depois de medir vem a tesoura. E a primeira tesoura é o strip: remove a tabela de símbolos e as informações de debug, que num binário compilado com -g dominam o arquivo. O código não muda um byte; some apenas o que servia ao gdb e ao nm.",
                },
                {
                    type: "code",
                    value: '$ g++ -O2 -g app.cpp -o app\n$ size app\n   text    data     bss     dec     hex filename\n  18744    1024     280   20048    4e50 app\n\n$ ls -lh app\n-rwxrwxr-x 1 dev dev 342K app     # o -g domina o arquivo\n\n$ strip app && ls -lh app\n-rwxrwxr-x 1 dev dev  22K app     # codigo intacto, debug fora\n\n# O extrato completo, simbolo a simbolo:\n$ g++ -O2 app.cpp -Wl,-Map=app.map -o app\n$ grep -n "\\.text" app.map | head',
                },
                {
                    type: "table",
                    value: '[["Fonte de inchaço","Por que cresce","Resposta proporcional"],["Símbolos e debug (-g)","metadados pro gdb dentro do arquivo","strip no artefato final distribuído"],["Templates instanciados","uma cópia de código por combinação de tipos","medir no map; reduzir variações"],["RTTI e exceções","tabelas de tipos e de desenrolar da pilha","-fno-rtti e afins, só onde fizer sentido"],["Funções nunca usadas","o linker mantém seções inteiras por padrão","-ffunction-sections com --gc-sections"],["Inlining agressivo (-O3)","corpos duplicados em cada chamada","voltar pra -O2 ou -Os e comparar o size"]]',
                },
                {
                    type: "text",
                    value: "## O que incha um binário C++\n\nCom o mapa na mão, os suspeitos habituais de C++ ganham rosto. Templates: cada combinação de tipos instancia uma cópia completa do código; um std::map pra cinco pares de tipos são cinco maps no binário, e o map file mostra os nomes decorados gigantes se repetindo. RTTI e exceções: typeid, dynamic_cast e o desenrolar de pilha carregam tabelas; projetos embarcados costumam compilar com -fno-rtti -fno-exceptions, uma troca com consequências de linguagem, jamais um padrão universal.\n\nDuas flags fazem o linker podar de verdade: -ffunction-sections -fdata-sections na compilação põem cada função em seção própria, e -Wl,--gc-sections no link descarta as seções que ninguém referencia. Em firmware, essa dupla frequentemente corta dezenas de por cento.\n\nO critério fecha a aula: no desktop, os KB raramente valem a legibilidade; distribua com strip e pronto. No embarcado da aula anterior, cada byte disputa a flash com funcionalidades, e a dieta é engenharia de verdade. Meça com size e map, corte na fonte certa, e nunca sacrifique clareza por bytes que não fazem falta.",
                },
                {
                    type: "quote",
                    value: "Binário gordo não se resolve com opinião: o map file diz exatamente quais símbolos pesam quanto. Meça, ordene, corte o maior; repetir com fé o mesmo strip não emagrece ninguém duas vezes.",
                },
            ],
            questions: [
                {
                    statement: "O que o comando strip remove de um executável?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Tabela de símbolos e informação de depuração",
                            isCorrect: true,
                        },
                        {
                            text: "As funções que nunca chegaram a ser chamadas",
                            isCorrect: false,
                        },
                        {
                            text: "As seções .data e .bss, recriadas na execução",
                            isCorrect: false,
                        },
                        {
                            text: "As bibliotecas dinâmicas embutidas no binário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual ferramenta mostra o total de bytes por seção (text, data, bss)?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O size, aplicado ao objeto ou ao executável",
                            isCorrect: true,
                        },
                        {
                            text: "O ldd, listando as dependências dinâmicas",
                            isCorrect: false,
                        },
                        {
                            text: "O c++filt, decodificando os nomes do C++",
                            isCorrect: false,
                        },
                        {
                            text: "O ar, abrindo o índice da biblioteca estática",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pra descobrir QUAIS símbolos ocupam mais espaço no binário, qual caminho é o indicado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Gerar o map file com -Wl,-Map e ordenar pelos maiores",
                            isCorrect: true,
                        },
                        {
                            text: "Rodar o strip com -v e contar as linhas descartadas",
                            isCorrect: false,
                        },
                        {
                            text: "Comparar o ls -lh antes e depois de cada recompilação",
                            isCorrect: false,
                        },
                        {
                            text: "Abrir o binário no gdb e listar os breakpoints ativos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que templates de C++ são uma fonte clássica de inchaço?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada combinação de tipos instancia uma cópia do código",
                            isCorrect: true,
                        },
                        {
                            text: "Todo template carrega o interpretador da STL embutido",
                            isCorrect: false,
                        },
                        {
                            text: "O linker recusa juntar seções que contêm código genérico",
                            isCorrect: false,
                        },
                        {
                            text: "Templates desativam o strip nas seções em que aparecem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual dupla de flags permite ao linker descartar funções que ninguém referencia?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "-ffunction-sections na compilação e --gc-sections no link",
                            isCorrect: true,
                        },
                        {
                            text: "-Os na compilação e strip --all no artefato distribuído",
                            isCorrect: false,
                        },
                        {
                            text: "-fno-rtti na compilação e -Map=app.map na hora do link",
                            isCorrect: false,
                        },
                        {
                            text: "-flto na compilação e c++filt aplicado ao binário final",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Build systems",
    aulas: [
        {
            titulo: "Por que make existe",
            blocks: [
                {
                    type: "text",
                    value: "# O problema antes da ferramenta\n\nImagine um projeto com quarenta arquivos .c. Compilar tudo a cada mudança, gcc *.c, funciona e é um desastre: você edita uma linha e espera minutos refazendo trabalho já feito. A alternativa manual, lembrar quais arquivos mudaram e recompilar só eles, quebra no primeiro detalhe: mudou um HEADER, e agora? Todos os .c que o incluem precisam recompilar, e os que não o incluem, não. Manter esse raciocínio de cabeça não escala; esquecer um arquivo gera o pior bug: o executável montado com objetos velhos, que não corresponde a fonte nenhum.\n\nO make, criado nos anos 70 e onipresente até hoje, resolve isso com uma ideia elegante: você declara o GRAFO de dependências, quem produz o quê a partir de quê, e ele deriva o plano de build. app depende de main.o e mat.o; main.o depende de main.c e mat.h; mat.o depende de mat.c e mat.h.\n\nCom o grafo em mãos, a decisão de reconstruir usa os timestamps do sistema de arquivos: se algum pré-requisito é mais novo que o alvo, o alvo está velho e a receita roda; senão, nada a fazer.",
                },
                {
                    type: "table",
                    value: '[["Você mudou","O que o make refaz","Por quê"],["nada","nada: make responde up to date","nenhum alvo mais velho que seus pré-requisitos"],["main.c","main.o e o link de app","main.o ficou velho; app depende dele"],["mat.c","mat.o e o link de app","só a cadeia do mat.o é tocada"],["mat.h","main.o, mat.o e o link","os dois .c declaram depender do header"],["apagou main.o","main.o e o link","alvo sumido conta como desatualizado"]]',
                },
                {
                    type: "code",
                    value: "# Makefile minimo: o grafo declarado\napp: main.o mat.o\n\tgcc main.o mat.o -o app\n\nmain.o: main.c mat.h\n\tgcc -c main.c\n\nmat.o: mat.c mat.h\n\tgcc -c mat.c\n\n# $ make          -> compila o que precisa, na ordem certa\n# $ make          -> make: 'app' is up to date.\n# $ touch mat.h && make   -> recompila os dois .o e relinka",
                },
                {
                    type: "text",
                    value: "## O contrato e a pegadinha dos headers\n\nPerceba o contrato: o make não entende C, não lê seu código, não adivinha nada. Ele compara datas e executa receitas, e a inteligência inteira mora no grafo QUE VOCÊ declarou. Isso tem uma consequência traiçoeira: se main.c inclui mat.h, mas a regra de main.o não lista mat.h como pré-requisito, o make não tem como saber. Você edita o header, roda make, e ele responde up to date enquanto o binário roda a versão antiga. Esse é o clássico build quebrado que só o make clean cura, e a causa é sempre a mesma: grafo mentiroso.\n\nPor isso projetos sérios geram as dependências de headers automaticamente: o gcc faz o serviço com as flags -MMD -MP, que produzem arquivos .d listando cada header incluído, prontos pro make importar. Os build systems modernos do resto do módulo fazem isso por padrão.\n\nA ideia do grafo mais timestamps transcende o make: Ninja, CMake, Bazel e todo build system que você tocar em 2026 é uma variação dela. Entenda o make e você entende a família inteira.",
                },
                {
                    type: "quote",
                    value: "O make não sabe compilar nada: ele sabe comparar datas e obedecer um grafo. Se o grafo diz a verdade, o build incremental é seguro; se o grafo mente, o make mente junto, com toda a confiança do mundo.",
                },
            ],
            questions: [
                {
                    statement: "Qual problema central o make resolve?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Refazer só o necessário, seguindo o grafo declarado",
                            isCorrect: true,
                        },
                        {
                            text: "Encontrar erros de sintaxe antes de chamar o gcc",
                            isCorrect: false,
                        },
                        {
                            text: "Baixar as bibliotecas que o programa vai precisar",
                            isCorrect: false,
                        },
                        {
                            text: "Escolher as flags de otimização ideais do projeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o make decide se precisa reconstruir um alvo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Comparando timestamps do alvo e dos pré-requisitos",
                            isCorrect: true,
                        },
                        {
                            text: "Calculando o hash do conteúdo de cada arquivo fonte",
                            isCorrect: false,
                        },
                        {
                            text: "Perguntando ao gcc quais arquivos foram alterados",
                            isCorrect: false,
                        },
                        {
                            text: "Recompilando tudo e comparando os binários gerados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você edita mat.h, roda make e ele responde up to date. Qual é a causa clássica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As regras dos .o não listam mat.h como pré-requisito",
                            isCorrect: true,
                        },
                        {
                            text: "Headers nunca disparam recompilação em make nenhum",
                            isCorrect: false,
                        },
                        {
                            text: "O timestamp de headers é ignorado por padrão no Linux",
                            isCorrect: false,
                        },
                        {
                            text: "O make só olha arquivos passados na linha de comando",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Pra que servem as flags -MMD -MP do gcc num projeto com make?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Gerar arquivos .d com as dependências de headers",
                            isCorrect: true,
                        },
                        {
                            text: "Medir o tempo gasto em cada fase da compilação",
                            isCorrect: false,
                        },
                        {
                            text: "Compilar em múltiplos processos pra ganhar tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Marcar os objetos com a data exata da última build",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No Makefile mínimo da aula, por que editar mat.c NÃO recompila main.o?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "main.o não depende de mat.c em nenhuma regra do grafo",
                            isCorrect: true,
                        },
                        {
                            text: "O make agrupa os .c por ordem alfabética na varredura",
                            isCorrect: false,
                        },
                        {
                            text: "mat.c é pré-requisito apenas das regras de link do app",
                            isCorrect: false,
                        },
                        {
                            text: "O gcc embute mat.c dentro de mat.h na primeira build",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Makefile de verdade",
            blocks: [
                {
                    type: "text",
                    value: "# Da regra escrita à mão ao padrão\n\nO Makefile da aula passada repete gcc -c três vezes e vai repetir trinta num projeto real. A evolução vem em três recursos. Variáveis: CC define o compilador, CFLAGS as flags, OBJ a lista de objetos; mudar -O2 pra -Og passa a ser uma edição num lugar só. Regras de padrão: %.o: %.c ensina de uma vez como qualquer .o nasce do .c correspondente. E as variáveis automáticas dentro das receitas: $@ é o alvo da regra, $< é o primeiro pré-requisito, $^ é a lista completa deles.\n\nUm detalhe de sintaxe derruba iniciante até hoje: a linha de receita começa com TAB, obrigatoriamente. Espaços produzem o críptico missing separator, e todo editor decente já sabe disso ao detectar um Makefile.\n\nCom esse kit, o Makefile de dez arquivos fica do tamanho do de dois: uma lista OBJ, uma regra de link usando $^ e $@, uma regra de padrão usando $< pra compilar, e as flags -MMD -MP da aula anterior cuidando dos headers via include dos .d gerados.",
                },
                {
                    type: "code",
                    value: "CC      = gcc\nCFLAGS  = -Wall -Wextra -O2 -MMD -MP\nOBJ     = main.o mat.o es.o\n\nall: app                 # primeiro alvo = padrao do make\n\napp: $(OBJ)\n\t$(CC) $^ -o $@       # $^ = todos os .o, $@ = app\n\n%.o: %.c                 # regra de padrao pra qualquer .o\n\t$(CC) $(CFLAGS) -c $< -o $@\n\nclean:\n\trm -f $(OBJ) $(OBJ:.o=.d) app\n\n.PHONY: all clean        # alvos que nao sao arquivos\n-include $(OBJ:.o=.d)    # dependencias de headers geradas",
                },
                {
                    type: "table",
                    value: '[["Construção","Significado","Exemplo na prática"],["CC, CFLAGS, OBJ","variáveis do projeto","trocar flags num lugar só"],["%.o: %.c","regra de padrão","ensina todos os .o de uma vez"],["$@","o alvo da regra","app na regra de link"],["$<","o primeiro pré-requisito","o .c na regra de compilação"],["$^","todos os pré-requisitos","a lista de .o no link"],[".PHONY","alvo que não é arquivo","all e clean sempre executam"]]',
                },
                {
                    type: "text",
                    value: "## all, clean e o porquê do .PHONY\n\nDois alvos viraram convenção universal. all é o alvo padrão, colocado primeiro pra que um make sem argumentos construa o projeto inteiro. clean apaga os artefatos gerados, objetos, arquivos .d e o executável, devolvendo o diretório ao estado de fonte puro; é o botão de recomeçar quando você desconfia de builds inconsistentes.\n\nO .PHONY existe por causa de uma armadilha real: pro make, todo alvo é em princípio um ARQUIVO. Se alguém criar um arquivo chamado clean no diretório, o make olha, vê que o arquivo clean existe e não tem pré-requisitos mais novos, e responde 'clean' is up to date sem apagar nada. Declarar .PHONY: all clean avisa que esses alvos não correspondem a arquivos e devem executar sempre que chamados.\n\nVale fechar com honestidade sobre o alcance: pra projetos pequenos e médios, um Makefile assim é conciso e transparente, e você encontrará milhares deles em bibliotecas C consagradas. Quando o projeto cresce pra múltiplas plataformas, IDEs e dependências externas, escrever Makefiles à mão vira sofrimento, e é aí que entra o CMake da próxima aula.",
                },
                {
                    type: "quote",
                    value: "Um bom Makefile se lê em uma tela: variáveis no topo, uma regra de padrão, all e clean marcados como .PHONY. Se o seu precisa de um manual próprio, ele já devia ter virado CMake.",
                },
            ],
            questions: [
                {
                    statement: "Na receita de uma regra do make, o que são $@ e $<?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O alvo da regra e o primeiro pré-requisito",
                            isCorrect: true,
                        },
                        {
                            text: "O diretório atual e o nome do compilador",
                            isCorrect: false,
                        },
                        {
                            text: "A lista de objetos e a lista de headers",
                            isCorrect: false,
                        },
                        {
                            text: "O alvo anterior e o próximo da fila de build",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a regra de padrão %.o: %.c declara?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Como qualquer .o nasce do .c de mesmo nome",
                            isCorrect: true,
                        },
                        {
                            text: "Que todos os .c devem ser linkados num só .o",
                            isCorrect: false,
                        },
                        {
                            text: "Que arquivos .o e .c são sinônimos pro make",
                            isCorrect: false,
                        },
                        {
                            text: "Que os .o listados serão apagados pelo clean",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Alguém criou um arquivo chamado clean no diretório e agora make clean responde up to date. Qual é o conserto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Declarar clean como .PHONY, pois não é um arquivo",
                            isCorrect: true,
                        },
                        {
                            text: "Renomear a regra, já que clean é palavra reservada",
                            isCorrect: false,
                        },
                        {
                            text: "Rodar make -B clean pra ignorar o cache de regras",
                            isCorrect: false,
                        },
                        {
                            text: "Dar touch no Makefile pra ele ficar mais novo que tudo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o alvo all costuma ser o primeiro do Makefile?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O make sem argumentos executa o primeiro alvo",
                            isCorrect: true,
                        },
                        {
                            text: "O make exige ordem alfabética entre os alvos",
                            isCorrect: false,
                        },
                        {
                            text: "Alvos .PHONY só funcionam no topo do arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro alvo é o único que aceita variáveis",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O erro missing separator ao rodar make costuma denunciar o quê?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Receita indentada com espaços no lugar do TAB",
                            isCorrect: true,
                        },
                        {
                            text: "Variável usada antes de ser definida no arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "Dois alvos declarados na mesma linha de regra",
                            isCorrect: false,
                        },
                        {
                            text: "Comentário aberto com # dentro de uma receita",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "CMake moderno: targets e propriedades",
            blocks: [
                {
                    type: "text",
                    value: "# O gerador que virou padrão\n\nO CMake não compila nada: ele GERA o build system nativo, Makefiles no Linux, Ninja onde você pedir, projetos de IDE no Windows, a partir de uma descrição portável no CMakeLists.txt. Essa camada extra é o que o tornou, em 2026, o padrão de fato do mundo C++: o mesmo projeto builda no Linux com gcc, no Windows com MSVC e no embarcado com a toolchain ARM, sem reescrever nada. IDEs como CLion, VS Code e Visual Studio o consomem nativamente, e o ecossistema de dependências (vcpkg, Conan) fala CMake como língua materna.\n\nO CMake moderno, da era pós 3.0, gira em torno de TARGETS: cada executável ou biblioteca é um objeto com propriedades, seus fontes, seus diretórios de include, suas flags, e as dependências se declaram entre targets, não em variáveis globais espalhadas.\n\nO comando central é target_link_libraries(app PRIVATE mat): linka mat em app e, junto, propaga as propriedades de uso que mat declarou como públicas. Includes e flags viajam com a dependência, e o consumidor não precisa saber de nada.",
                },
                {
                    type: "code",
                    value: "cmake_minimum_required(VERSION 3.16)\nproject(calc CXX)\n\nadd_library(mat src/mat.cpp)\ntarget_include_directories(mat PUBLIC include)\ntarget_compile_features(mat PUBLIC cxx_std_17)\n\nadd_executable(app src/main.cpp)\ntarget_link_libraries(app PRIVATE mat)\n\n# Out-of-source: o build inteiro nasce em build/\n#   cmake -S . -B build\n#   cmake --build build\n# Fontes intocados; apagar build/ e o clean perfeito.",
                },
                {
                    type: "table",
                    value: '[["Comando","O que declara","Observação"],["add_executable(app ...)","um target executável","fontes listados ali mesmo"],["add_library(mat ...)","um target biblioteca","estática por padrão"],["target_include_directories","onde estão os headers do target","PUBLIC propaga a quem linka"],["target_link_libraries(app PRIVATE mat)","dependência entre targets","puxa junto o que mat expõe"],["PUBLIC / PRIVATE / INTERFACE","alcance de cada propriedade","uso próprio, dos outros, ou ambos"]]',
                },
                {
                    type: "text",
                    value: "## PUBLIC, PRIVATE e o build fora da árvore\n\nOs modificadores são o coração do modelo. PRIVATE: a propriedade vale só pra compilar o próprio target; um detalhe interno de implementação. INTERFACE: vale só pra quem consome o target; típico de biblioteca só de headers. PUBLIC: vale pros dois lados. No exemplo, o include da mat é PUBLIC porque os headers dela aparecem tanto na implementação quanto nos fontes de quem a usa; se fosse dependência interna, PRIVATE pouparia os consumidores de herdar o que não lhes diz respeito. Declarar isso direito é o que faz um projeto grande compor sem vazamento de flags.\n\nO out-of-source build é a outra disciplina: gerar tudo num diretório build/ separado, nunca misturado aos fontes. Os ganhos são concretos: git status limpo, várias configurações lado a lado (build-debug/, build-release/, build-arm/) e o clean mais confiável que existe, rm -rf build/.\n\nO fluxo de todo dia se resume a dois comandos, cmake -S . -B build pra configurar e cmake --build build pra compilar, e ele não muda seja o gerador Makefile, Ninja ou projeto de IDE.",
                },
                {
                    type: "quote",
                    value: "CMake moderno é declarar targets e o que cada um expõe, e deixar a propagação trabalhar. Quem ainda espalha flags globais está escrevendo o CMake de 2010 com a sintaxe de hoje.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o papel do CMake num projeto C++?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Gerar o build system nativo a partir de uma descrição",
                            isCorrect: true,
                        },
                        {
                            text: "Compilar os fontes diretamente, substituindo o gcc",
                            isCorrect: false,
                        },
                        {
                            text: "Executar os testes de unidade logo após cada mudança",
                            isCorrect: false,
                        },
                        {
                            text: "Formatar o código conforme o estilo definido no time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No CMake moderno, em torno de que conceito o projeto se organiza?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Targets com propriedades e dependências entre si",
                            isCorrect: true,
                        },
                        {
                            text: "Variáveis globais com as flags de cada diretório",
                            isCorrect: false,
                        },
                        {
                            text: "Scripts shell chamados na ordem de compilação",
                            isCorrect: false,
                        },
                        {
                            text: "Listas de objetos mantidas à mão pelo Makefile",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que target_link_libraries(app PRIVATE mat) faz além de linkar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Propaga pra app as propriedades públicas de uso da mat",
                            isCorrect: true,
                        },
                        {
                            text: "Copia os fontes da mat pra dentro do diretório da app",
                            isCorrect: false,
                        },
                        {
                            text: "Converte a mat em biblioteca dinâmica antes do link",
                            isCorrect: false,
                        },
                        {
                            text: "Exporta a app como dependência visível pra outros usos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma biblioteca usa zlib só na implementação; os consumidores nem sabem que ela existe. Como declarar essa dependência?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "PRIVATE: propriedade interna que não deve propagar",
                            isCorrect: true,
                        },
                        {
                            text: "PUBLIC: toda dependência precisa chegar ao consumidor",
                            isCorrect: false,
                        },
                        {
                            text: "INTERFACE: vale apenas pra quem consome a biblioteca",
                            isCorrect: false,
                        },
                        {
                            text: "GLOBAL: disponível a qualquer target do projeto todo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais ganhos práticos justificam o out-of-source build?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Fontes limpos, configurações paralelas e clean confiável",
                            isCorrect: true,
                        },
                        {
                            text: "Binários menores, já que o build comprime os objetos",
                            isCorrect: false,
                        },
                        {
                            text: "Compilação mais rápida por usar um disco em separado",
                            isCorrect: false,
                        },
                        {
                            text: "Dispensa do git ignore, pois o CMake esconde os artefatos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Cross-compilation: compilar aqui, rodar lá",
            blocks: [
                {
                    type: "text",
                    value: "# Quando o alvo não é a sua máquina\n\nTodo build até aqui assumiu uma coincidência: a máquina que compila é a que executa. Ela quebra o tempo todo: o firmware de um microcontrolador ARM é compilado no seu desktop x86-64, porque o chip não teria nem memória pra rodar o gcc; a imagem pra um roteador MIPS nasce num servidor de CI; o app pra um Raspberry Pi builda mais rápido no seu notebook. Compilar numa arquitetura pra executar em outra é cross-compilation, e exige um compilador especial: o cross-compiler, que RODA no host e GERA código pro alvo.\n\nO nome do alvo se codifica no triplet, o prefixo das ferramentas: arm-none-eabi-gcc lê arquitetura arm, fornecedor none, ABI eabi, o kit clássico pra microcontroladores sem sistema operacional (bare metal). Já aarch64-linux-gnu-gcc gera pra ARM de 64 bits com Linux e glibc. O triplet vem acompanhado do binutils inteiro: arm-none-eabi-as, arm-none-eabi-ld, arm-none-eabi-nm, os mesmos papéis que você já conhece, falando outra máquina.\n\nA regra de ouro: binário gerado pro alvo NÃO roda no host; testar exige o hardware, um emulador como o QEMU, ou muita fé.",
                },
                {
                    type: "table",
                    value: '[["Peça","O que é","Exemplo"],["Triplet","nome arquitetura-fornecedor-ABI do alvo","arm-none-eabi, aarch64-linux-gnu"],["Cross-compiler","roda no host, gera pro alvo","arm-none-eabi-gcc no seu x86-64"],["Sysroot","raiz com headers e libs DO ALVO","cabeçalhos da glibc de ARM64"],["Toolchain file","perfil do alvo entregue ao CMake","aponta compilador e sysroot"],["Emulador","executa o binário do alvo no host","qemu-arm pra testar sem placa"]]',
                },
                {
                    type: "code",
                    value: "# toolchain-arm.cmake: o perfil do alvo pro CMake\nset(CMAKE_SYSTEM_NAME      Generic)   # bare metal, sem SO\nset(CMAKE_SYSTEM_PROCESSOR arm)\nset(CMAKE_C_COMPILER   arm-none-eabi-gcc)\nset(CMAKE_CXX_COMPILER arm-none-eabi-g++)\nset(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)\nset(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)\n\n# Configura e compila sem tocar no CMakeLists do projeto:\n#   cmake -S . -B build-arm \\\n#         -DCMAKE_TOOLCHAIN_FILE=toolchain-arm.cmake\n#   cmake --build build-arm\n$ file build-arm/app.elf\napp.elf: ELF 32-bit LSB executable, ARM, EABI5",
                },
                {
                    type: "text",
                    value: "## Sysroot: o pedaço do alvo no seu disco\n\nCompilar pro alvo não é só gerar instruções dele: o código inclui headers e linka bibliotecas, e precisam ser os DO ALVO. Usar o stdio.h do seu desktop pra compilar pra um Linux ARM é receita de incompatibilidade silenciosa. A resposta é o sysroot: um diretório no host que espelha a raiz do sistema do alvo, com seus headers e suas bibliotecas, que o compilador consulta via flag --sysroot. Toolchains bare metal como a arm-none-eabi embutem o próprio mundo, com a newlib no lugar da glibc; toolchains pra Linux embarcado (Yocto, Buildroot) geram o sysroot junto com a imagem do sistema.\n\nNo CMake, tudo isso se empacota no toolchain file do exemplo: um arquivo que diz quem compila, pra qual sistema, onde procurar bibliotecas, e que instrui o find_package a procurar no sysroot, não no host. O projeto continua o mesmo; muda só o perfil passado na configuração, e é assim que o mesmo CMakeLists gera build-x86/ e build-arm/ lado a lado.\n\nFeche com a verificação de sanidade: o comando file no artefato deve dizer a arquitetura do ALVO. Se disser x86-64, o toolchain file não foi aplicado.",
                },
                {
                    type: "quote",
                    value: "Cross-compilar é manter dois mundos separados na cabeça: as ferramentas rodam no host, mas headers, bibliotecas e instruções pertencem ao alvo. Toda dor dessa área vem de misturar os dois.",
                },
            ],
            questions: [
                {
                    statement: "O que é um cross-compiler?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Compilador que roda no host e gera código pro alvo",
                            isCorrect: true,
                        },
                        {
                            text: "Compilador que traduz entre duas linguagens fonte",
                            isCorrect: false,
                        },
                        {
                            text: "Compilador embutido que roda dentro do dispositivo",
                            isCorrect: false,
                        },
                        {
                            text: "Compilador que gera código pros dois ao mesmo tempo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No triplet arm-none-eabi, o que o none indica?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Alvo sem sistema operacional, o bare metal",
                            isCorrect: true,
                        },
                        {
                            text: "Ausência de otimizações na toolchain toda",
                            isCorrect: false,
                        },
                        {
                            text: "Que o linker não será incluído no pacote",
                            isCorrect: false,
                        },
                        {
                            text: "Uso de ponto flutuante somente por software",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o papel do sysroot numa cross-compilation pra Linux ARM?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fornecer os headers e as bibliotecas do alvo no host",
                            isCorrect: true,
                        },
                        {
                            text: "Emular o processador ARM durante a fase de testes",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar as permissões de root exigidas pelo gravador",
                            isCorrect: false,
                        },
                        {
                            text: "Isolar o build numa sandbox sem acesso ao sistema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No CMake, como um mesmo projeto passa a compilar pra outro alvo sem alterar o CMakeLists?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Passando um toolchain file na etapa de configuração",
                            isCorrect: true,
                        },
                        {
                            text: "Renomeando o diretório de build pro triplet do alvo",
                            isCorrect: false,
                        },
                        {
                            text: "Instalando o CMake dentro do dispositivo de destino",
                            isCorrect: false,
                        },
                        {
                            text: "Trocando o gerador de Makefile pra Ninja no comando",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Após um build cross, o comando file mostra o executável como x86-64. O que isso indica?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O perfil do alvo não foi aplicado e o host compilou pra si",
                            isCorrect: true,
                        },
                        {
                            text: "O QEMU converteu o binário pra rodar mais rápido no host",
                            isCorrect: false,
                        },
                        {
                            text: "Comportamento esperado: o comando file sempre reporta o host",
                            isCorrect: false,
                        },
                        {
                            text: "O linker script do alvo comprimiu as seções do binário ARM",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Builds rápidos e reproduzíveis",
            blocks: [
                {
                    type: "text",
                    value: "# Tempo de build é tempo de gente\n\nUm build de vinte minutos não custa vinte minutos: custa o foco de cada pessoa que espera, vezes as vezes por dia em que espera. É a régua certa pra decidir quanto investir aqui: tempo do time economizado versus custo de mexer. Duas ferramentas dão retorno desproporcional ao esforço, e as duas se plugam no que você já tem.\n\nA primeira é o ccache: um cache de compilações. Ele se posiciona na frente do compilador e, antes de chamar o gcc, calcula a chave da compilação, o fonte pré-processado, as flags e a versão do compilador; se já viu essa chave, devolve o objeto guardado em milissegundos. O caso de brilho é o recomeço: um make clean seguido de build completo, ou a troca de branch e volta, deixa de custar minutos porque quase tudo vem do cache. Na CI, com cache persistido entre jobs, o efeito é dramático.\n\nA segunda é o Ninja: um executor de builds minimalista, feito pra ser GERADO por ferramentas como o CMake, não escrito à mão. Arranque quase nulo, paralelismo bem aproveitado; a troca custa um -G Ninja na configuração.",
                },
                {
                    type: "code",
                    value: "# Ninja como gerador do CMake:\ncmake -S . -B build -G Ninja\ncmake --build build          # o ninja assume o -j sozinho\n\n# ccache na frente do compilador via CMake:\ncmake -S . -B build -G Ninja \\\n      -DCMAKE_CXX_COMPILER_LAUNCHER=ccache\n\n$ ccache -s                  # estatisticas do cache\n  cache hit (direct)     8241\n  cache miss              913\n  hit rate              90.0 %\n\n# Recomeco barato: rm -rf build, reconfigura, rebuilda:\n# quase tudo volta do cache em segundos.",
                },
                {
                    type: "table",
                    value: '[["Investimento","Custo de adotar","Quando compensa"],["ccache","instalar e apontar o launcher","rebuilds e CI com cache persistente"],["Ninja via CMake","um -G Ninja na configuração","projetos médios e grandes, custo quase zero"],["make -j / build paralelo","lembrar do -j$(nproc)","sempre: serial é desperdício puro"],["Dividir headers gigantes","refatorar includes","quando o ccache já não segura o tempo"],["Build distribuído","infraestrutura dedicada","times grandes com builds de horas"]]',
                },
                {
                    type: "text",
                    value: "## Reprodutibilidade: o mesmo fonte, o mesmo binário\n\nBuild reproduzível é aquele em que o mesmo fonte, com a mesma toolchain, produz bytes idênticos, em qualquer máquina e em qualquer data. Parece detalhe, e é fundamento: permite verificar que o binário distribuído corresponde ao fonte auditado, base da confiança em cadeias de suprimento de software, e as distribuições Linux investiram pesado nisso na última década.\n\nOs inimigos são pequenos e conhecidos: macros __DATE__ e __TIME__ carimbando a hora da build, caminhos absolutos embutidos em símbolos de debug, ordem de arquivos dependente do sistema. As armas também: a variável SOURCE_DATE_EPOCH congela a data; -ffile-prefix-map remapeia os caminhos; e o resto é disciplina de fixar versões da toolchain.\n\nE há o bônus interesseiro: build determinístico é build cacheável. O ccache vive de entradas iguais produzirem saídas iguais; cada carimbo de hora no código é um furo no cache. O critério final do módulo: meça o tempo de build do time, ataque primeiro o que é barato (paralelismo, Ninja, ccache), e trate qualquer fonte de não determinismo como bug, não como charme.",
                },
                {
                    type: "quote",
                    value: "Build lento é imposto cobrado em atenção humana, e build irreproduzível é dívida de confiança. As duas contas se pagam com as mesmas moedas: cache, determinismo e a coragem de medir.",
                },
            ],
            questions: [
                {
                    statement: "Como o ccache consegue devolver uma compilação em milissegundos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Reusa o objeto guardado quando a chave da compilação repete",
                            isCorrect: true,
                        },
                        {
                            text: "Compila com -O0 escondido e otimiza depois, em segundo plano",
                            isCorrect: false,
                        },
                        {
                            text: "Divide cada arquivo entre os núcleos livres do processador",
                            isCorrect: false,
                        },
                        {
                            text: "Mantém o gcc residente na memória entre uma build e outra",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a proposta do Ninja?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Executor rápido de builds, gerado por ferramentas como o CMake",
                            isCorrect: true,
                        },
                        {
                            text: "Substituto do compilador com foco em mensagens mais curtas",
                            isCorrect: false,
                        },
                        {
                            text: "Um formato novo de Makefile pra ser escrito à mão pelo time",
                            isCorrect: false,
                        },
                        {
                            text: "Cache distribuído de objetos compartilhado entre máquinas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em qual cenário o ccache entrega o maior ganho?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Rebuild completo após clean ou troca de branch",
                            isCorrect: true,
                        },
                        {
                            text: "Primeira build de um projeto recém-clonado",
                            isCorrect: false,
                        },
                        {
                            text: "Link final de um executável com muitas libs",
                            isCorrect: false,
                        },
                        {
                            text: "Execução da suíte de testes de integração",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que define um build reproduzível?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mesmo fonte e toolchain geram bytes idênticos sempre",
                            isCorrect: true,
                        },
                        {
                            text: "O build termina no mesmo tempo em qualquer máquina",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer pessoa do time consegue rodar o make sem erro",
                            isCorrect: false,
                        },
                        {
                            text: "O binário roda igual em todas as distribuições Linux",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que um __DATE__ no código prejudica ao mesmo tempo a reprodutibilidade e o ccache?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A data muda a entrada: bytes diferentes e cache furado",
                            isCorrect: true,
                        },
                        {
                            text: "A macro exige rede pra sincronizar o relógio da build",
                            isCorrect: false,
                        },
                        {
                            text: "O pré-processador desativa o cache em macros de tempo",
                            isCorrect: false,
                        },
                        {
                            text: "O linker rejeita objetos compilados em dias distintos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - As ferramentas do profissional",
    aulas: [
        {
            titulo: "Warnings como contrato",
            blocks: [
                {
                    type: "text",
                    value: "# O compilador avisa; o amador ignora\n\nWarning não é decoração: é o compilador dizendo que o seu código compila, mas tem cheiro de erro. E ele costuma ter razão. if (x = 5) em vez de x == 5, comparar int com unsigned e obter um resultado surreal, retornar sem valor num caminho da função, usar variável antes de inicializar: tudo isso é legal pra gramática e fatal pra lógica, e tudo isso o gcc denuncia, desde que você peça.\n\nO pedido mínimo profissional é -Wall -Wextra. Apesar do nome, -Wall não liga todos os avisos: liga o conjunto clássico de maior valor; -Wextra soma outra camada útil. O custo de digitar as duas flags é zero, e o retorno é uma classe inteira de bugs morta antes do primeiro teste rodar.\n\nO terceiro pilar é -Werror: promove warnings a erros e quebra a build. É o que transforma aviso em CONTRATO: com -Werror na CI, nenhum warning novo entra no projeto, porque a build vermelha não deixa. Sem ele, os avisos se acumulam aos poucos até virar um ruído de centenas, e aí ninguém mais enxerga o aviso novo que importava.",
                },
                {
                    type: "code",
                    value: "int paga_bonus(int vendas) {\n    int bonus;\n    if (vendas = 100)        // queria ==, escreveu =\n        bonus = 500;\n    return bonus;            // bonus pode nao ter valor\n}\n\n$ gcc -c -Wall -Wextra bonus.c\nbonus.c:3: warning: suggest parentheses around assignment\n            used as truth value [-Wparentheses]\nbonus.c:5: warning: 'bonus' may be used uninitialized\n            [-Wmaybe-uninitialized]\n\n# Dois bugs reais achados de graca, antes de rodar.\n$ gcc -c -Wall -Wextra -Werror bonus.c   # na CI: build quebra",
                },
                {
                    type: "table",
                    value: '[["Aviso","O que ele pega","Por que paga o ingresso"],["-Wparentheses","atribuição usada como condição","o clássico = no lugar de =="],["-Wuninitialized","leitura de variável sem valor","lixo de memória virando resultado"],["-Wsign-compare","comparação entre signed e unsigned","laços que nunca terminam ou nunca rodam"],["-Wunused-variable","variável declarada e nunca usada","resto de refatoração e erro de digitação"],["-Wshadow","variável sombreando outra externa","o bug silencioso do nome repetido"]]',
                },
                {
                    type: "text",
                    value: "## Como adotar sem sofrer\n\nNum projeto novo, a receita é seca: -Wall -Wextra -Werror desde o primeiro commit, e warnings simplesmente nunca existem. Num projeto legado com quinhentos avisos acumulados, ligar -Werror de uma vez trava o time; o caminho é gradual: ligue -Wall -Wextra, zere os avisos módulo a módulo, e só então sele com -Werror pra não regredir. Ferramentas de CI ajudam marcando o número de warnings como métrica que só pode cair.\n\nDuas honestidades pra fechar. Primeira: existe falso positivo, e a resposta profissional não é desligar o aviso no projeto inteiro, é reescrever o trecho pra ficar óbvio (o próprio aviso do = vira silêncio com parênteses duplos intencionais) ou suprimir pontualmente com pragma justificado. Segunda: warnings dependem de otimização; -Wmaybe-uninitialized, por exemplo, enxerga mais com -O2, porque a análise de fluxo roda mais fundo. Rodar a CI com as mesmas flags do release não é pedantismo, é cobertura.\n\nO resumo do contrato: o compilador é o revisor mais barato que você tem. Ele trabalha de graça, em milissegundos, em todo build. Só precisa que você não o mande calar a boca.",
                },
                {
                    type: "quote",
                    value: "Time que convive com quinhentos warnings não tem quinhentos problemas: tem um, o hábito de ignorar o revisor gratuito. O aviso que importava amanhã vai nascer invisível no meio do ruído.",
                },
            ],
            questions: [
                {
                    statement: "O que a flag -Werror faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Promove warnings a erros que quebram a build",
                            isCorrect: true,
                        },
                        {
                            text: "Liga o conjunto completo de avisos do gcc",
                            isCorrect: false,
                        },
                        {
                            text: "Mostra os erros com mais contexto e cores",
                            isCorrect: false,
                        },
                        {
                            text: "Interrompe a compilação no primeiro warning",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o par de flags mínimo de avisos recomendado pra qualquer projeto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "-Wall -Wextra, o conjunto clássico de maior valor",
                            isCorrect: true,
                        },
                        {
                            text: "-w -Wfatal, que resume os avisos em uma linha só",
                            isCorrect: false,
                        },
                        {
                            text: "-O2 -g, que liga os avisos junto da otimização",
                            isCorrect: false,
                        },
                        {
                            text: "-ansi -pedantic, que confere o padrão da linguagem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que bug clássico o -Wparentheses denuncia em if (x = 5)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Atribuição onde a intenção era a comparação ==",
                            isCorrect: true,
                        },
                        {
                            text: "Comparação de ponteiro com um valor inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Excesso de parênteses anulando a condição",
                            isCorrect: false,
                        },
                        {
                            text: "Conversão implícita de inteiro pra booleano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num legado com centenas de warnings, qual é a adoção sensata do -Werror?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Zerar os avisos aos poucos e só então selar com -Werror",
                            isCorrect: true,
                        },
                        {
                            text: "Ligar de imediato e corrigir tudo num único mutirão",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicar somente nos arquivos novos criados pelo time",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir os warnings por comentários de supressão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que -Wmaybe-uninitialized pode aparecer com -O2 e ficar mudo com -O0?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A análise de fluxo aprofunda junto com a otimização",
                            isCorrect: true,
                        },
                        {
                            text: "O -O0 inicializa toda variável com zero por padrão",
                            isCorrect: false,
                        },
                        {
                            text: "O -O2 insere leituras extras que disparam o aviso",
                            isCorrect: false,
                        },
                        {
                            text: "Warnings são sorteados pra não poluir builds de debug",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Sanitizers: o bug se entrega sozinho",
            blocks: [
                {
                    type: "text",
                    value: "# Instrumentar pra flagrar\n\nWarnings pegam o que dá pra provar sem executar. Uma família inteira de bugs, porém, só se revela rodando: o acesso um byte além do array que HOJE não derruba nada, o use-after-free que corrompe silenciosamente, o overflow com sinal que o módulo 3 mostrou virar licença do otimizador. Pra esses existem os sanitizers, presentes no GCC e no Clang: o compilador INSTRUMENTA o binário, inserindo checagens ao redor de cada acesso suspeito, e o programa passa a se denunciar no momento exato do crime, com stack trace apontando o culpado.\n\nO AddressSanitizer, ASan (-fsanitize=address), cobre erros de memória: estouro de buffer no heap, na pilha e em globais, use-after-free, double free e vazamentos via LeakSanitizer embutido. O UndefinedBehaviorSanitizer, UBSan (-fsanitize=undefined), flagra UB no ato: overflow com sinal, shift inválido, desreferência de nulo, divisão por zero. O ThreadSanitizer, TSan (-fsanitize=thread), caça data races: dois acessos concorrentes sem sincronização, o bug que some quando você tenta reproduzir.\n\nA mágica tem preço, e a próxima seção diz onde pagá-lo.",
                },
                {
                    type: "code",
                    value: "int main(void) {\n    int v[10];\n    return v[10];            // um alem do fim: UB classico\n}\n\n$ gcc -g -fsanitize=address estouro.c && ./a.out\n==5231==ERROR: AddressSanitizer: stack-buffer-overflow\nREAD of size 4 at 0x7ffd63d2a3d8\n    #0 0x55e1c1 in main estouro.c:3\nAddress ... is located in stack of thread T0 at offset\n40 in frame ... 'v' <== o proprio relatorio nomeia o array\n\n# UBSan no overflow com sinal:\n$ gcc -g -fsanitize=undefined soma.c && ./a.out\nsoma.c:2:14: runtime error: signed integer overflow:\n2147483647 + 1 cannot be represented in type 'int'",
                },
                {
                    type: "table",
                    value: '[["Sanitizer","Flag","O que pega","Custo típico em runtime"],["ASan","-fsanitize=address","estouros, use-after-free, vazamentos","cerca de 2x mais lento"],["UBSan","-fsanitize=undefined","overflow com sinal, nulo, shift inválido","leve, muitas vezes irrisório"],["TSan","-fsanitize=thread","data races entre threads","5x a 15x, e mais memória"],["ASan + UBSan","flags combinadas","a dupla padrão de teste","domina o custo do ASan"]]',
                },
                {
                    type: "text",
                    value: "## Onde rodar: teste sim, produção quase nunca\n\nO custo define o lugar. ASan em torno de 2x de tempo e memória multiplicada; UBSan leve; TSan pesado, 5x a 15x, e incompatível com ASan no mesmo binário, então roda em build separada. Nada disso pertence ao binário de produção; tudo isso pertence aos TESTES. A prática consagrada em 2026: a suíte de testes roda na CI em duas variantes instrumentadas, uma com ASan e UBSan juntos, outra com TSan pra código com threads, além da build normal. Cada execução dos testes vira uma varredura de memória e UB de graça.\n\nTrês dicas de uso que economizam tarde: compile com -g pra o stack trace citar arquivo e linha; combine com -fno-omit-frame-pointer pra traces mais fiéis; e trate QUALQUER relatório como bug real, porque sanitizer praticamente não dá falso positivo: ele viu o acesso ilegal acontecer.\n\nE conecte com o módulo 3: o UBSan é a resposta prática ao capítulo do UB. Onde o otimizador assume que overflow não existe, o UBSan prova o contrário com endereço e linha. Fuzzing e produção instrumentada são refinamentos que existem, mas o hábito que muda o jogo é um só: testes sempre passam limpos sob sanitizer.",
                },
                {
                    type: "quote",
                    value: "O sanitizer transforma o bug de memória de fantasma em flagrante: em vez de corromper caladinho e explodir longe, o programa para na linha do crime com a confissão assinada.",
                },
            ],
            questions: [
                {
                    statement: "O que a flag -fsanitize=address adiciona ao binário?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Checagens de memória que flagram o acesso ilegal no ato",
                            isCorrect: true,
                        },
                        {
                            text: "Criptografia dos endereços usados pelas funções internas",
                            isCorrect: false,
                        },
                        {
                            text: "Um log de todos os mallocs gravado em disco ao final",
                            isCorrect: false,
                        },
                        {
                            text: "Proteção que impede o processo de acessar a própria pilha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual sanitizer é o indicado pra caçar data races entre threads?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O TSan, ligado com a flag -fsanitize=thread",
                            isCorrect: true,
                        },
                        {
                            text: "O ASan, ligado com a flag -fsanitize=address",
                            isCorrect: false,
                        },
                        {
                            text: "O UBSan, ligado com a flag -fsanitize=undefined",
                            isCorrect: false,
                        },
                        {
                            text: "O LSan, focado em vazamentos de memória",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a recomendação é rodar sanitizers nos testes, e não no binário de produção?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A instrumentação custa tempo e memória significativos",
                            isCorrect: true,
                        },
                        {
                            text: "Os relatórios só funcionam dentro do ambiente da CI",
                            isCorrect: false,
                        },
                        {
                            text: "Produção já conta com as mesmas checagens no kernel",
                            isCorrect: false,
                        },
                        {
                            text: "O sanitizer exige código compilado sem otimização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um relatório do ASan aponta stack-buffer-overflow com stack trace. Como tratá-lo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Como bug real: o acesso ilegal foi visto acontecer",
                            isCorrect: true,
                        },
                        {
                            text: "Como aviso estatístico, a confirmar com mais execuções",
                            isCorrect: false,
                        },
                        {
                            text: "Como falso positivo até o valgrind dar o mesmo veredito",
                            isCorrect: false,
                        },
                        {
                            text: "Como problema do compilador, reportável ao time do GCC",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que TSan costuma rodar numa build separada da build com ASan?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Os dois são incompatíveis no mesmo binário instrumentado",
                            isCorrect: true,
                        },
                        {
                            text: "O TSan exige otimização -O3 e o ASan funciona só com -O0",
                            isCorrect: false,
                        },
                        {
                            text: "O relatório de um apaga o arquivo de saída gerado pelo outro",
                            isCorrect: false,
                        },
                        {
                            text: "A licença do TSan proíbe combiná-lo com outros sanitizers",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Análise estática: bugs sem executar",
            blocks: [
                {
                    type: "text",
                    value: "# O revisor que lê tudo\n\nEntre o warning do compilador e o flagrante do sanitizer existe uma terceira camada: a análise estática dedicada, que examina o código SEM executá-lo, seguindo caminhos, valores possíveis e contratos de API com mais profundidade que a compilação normal se permite. A ferramenta de referência no ecossistema C++ em 2026 é o clang-tidy, construído sobre o front-end do Clang, com centenas de checagens organizadas em famílias: bugprone- pra padrões propensos a erro, modernize- pra sugerir C++ moderno, performance- pra cópias e alocações desnecessárias, readability- pra clareza.\n\nA diferença pro sanitizer é estrutural, não de qualidade: o sanitizer precisa que o bug ACONTEÇA num teste pra flagrar; o analisador estático enxerga o caminho perigoso mesmo que nenhum teste passe por ele. Em troca, sem executar, ele às vezes acusa caminhos impossíveis na prática: falsos positivos existem e fazem parte do trato.\n\nAlém do clang-tidy, o mercado usa o cppcheck, os analisadores dos próprios compiladores (gcc -fanalyzer) e plataformas comerciais; o critério de escolha é integração no seu fluxo, não ranking.",
                },
                {
                    type: "code",
                    value: "std::string& primeiro(std::vector<std::string>& v) {\n    std::string s = v[0];\n    return s;                 // referencia pra local morta\n}\n\n$ clang-tidy lista.cpp -- -std=c++17\nlista.cpp:3:12: warning: reference to stack memory\nassociated with local variable 's' returned\n[clang-diagnostic-return-stack-address]\n\n# Nenhum teste rodou; o caminho perigoso foi LIDO.\n# Integracao tipica: clang-tidy usa o compile_commands.json\n$ cmake -S . -B build -DCMAKE_EXPORT_COMPILE_COMMANDS=ON",
                },
                {
                    type: "table",
                    value: '[["Camada","Quando age","Precisa executar?","Falso positivo"],["Warnings (-Wall -Wextra)","em toda compilação","não","raro"],["Análise estática (clang-tidy)","sob demanda e na CI","não","existe, exige triagem"],["Sanitizers (ASan, UBSan)","rodando os testes","sim","praticamente zero"],["Debugger (gdb)","investigação dirigida","sim","não se aplica"]]',
                },
                {
                    type: "text",
                    value: "## Integrar sem virar ruído\n\nFerramenta de análise que ninguém roda não existe. A integração madura tem três degraus. Primeiro, o clang-tidy precisa saber COMO cada arquivo é compilado, flags e includes; isso vem do compile_commands.json, que o CMake exporta com uma flag e o próprio Ninja alimenta. Segundo, a configuração mora num arquivo .clang-tidy versionado na raiz do repositório: o time escolhe as famílias de checagens ligadas, e a escolha vale pra todos, no editor e na CI. Terceiro, o gatilho: no editor via clangd, que sublinha o problema enquanto você digita, e na CI rodando sobre os arquivos alterados no pull request, não sobre o repositório inteiro a cada build.\n\nO maior erro de adoção é ligar tudo no dia um: centenas de checagens sobre um legado geram milhares de apontamentos, o time se afoga e desliga a ferramenta pra sempre. O caminho que funciona: comece com bugprone- e as checagens de correção, zere, e expanda família por família, com a mesma lógica gradual do -Werror.\n\nAssim como o warning, o apontamento do analisador é conversa, não veredito: leia, entenda o cenário que ele descreve, e só então conserte ou suprima com justificativa no código.",
                },
                {
                    type: "quote",
                    value: "O sanitizer precisa que o bug aconteça; o analisador estático só precisa que ele seja possível. Um flagra no teste que passou por cima; o outro lê o caminho que nenhum teste visitou ainda.",
                },
            ],
            questions: [
                {
                    statement: "O que diferencia a análise estática dos sanitizers?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ela examina o código sem precisar executá-lo",
                            isCorrect: true,
                        },
                        {
                            text: "Ela corrige os bugs em vez de apenas apontá-los",
                            isCorrect: false,
                        },
                        {
                            text: "Ela funciona somente em código compilado com -O0",
                            isCorrect: false,
                        },
                        {
                            text: "Ela analisa apenas os headers, nunca os fontes .cpp",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual ferramenta é a referência de análise estática no ecossistema C++ em 2026?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O clang-tidy, construído sobre o front-end do Clang",
                            isCorrect: true,
                        },
                        {
                            text: "O c++filt, decodificador de símbolos da binutils",
                            isCorrect: false,
                        },
                        {
                            text: "O ccache, acelerador de compilações repetidas de build",
                            isCorrect: false,
                        },
                        {
                            text: "O gdb, com o modo de execução totalmente reversa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "De onde o clang-tidy descobre as flags e includes de cada arquivo do projeto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Do compile_commands.json exportado pelo build system",
                            isCorrect: true,
                        },
                        {
                            text: "Da primeira linha de comentário de cada arquivo fonte",
                            isCorrect: false,
                        },
                        {
                            text: "Do binário final, lendo a tabela de símbolos com o nm",
                            isCorrect: false,
                        },
                        {
                            text: "Das variáveis de ambiente CFLAGS e CXXFLAGS da sessão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que ligar todas as checagens do clang-tidy de uma vez num legado costuma fracassar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A avalanche de apontamentos afoga o time e vira ruído",
                            isCorrect: true,
                        },
                        {
                            text: "O clang-tidy trava ao passar de cem avisos por arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "As famílias de checagens conflitam e se anulam entre si",
                            isCorrect: false,
                        },
                        {
                            text: "A licença limita o número de checagens por repositório",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em qual situação a análise estática enxerga um bug que os sanitizers não veriam?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "No caminho perigoso que teste nenhum chega a executar",
                            isCorrect: true,
                        },
                        {
                            text: "No estouro de heap disparado pela carga real de produção",
                            isCorrect: false,
                        },
                        {
                            text: "Na data race que só aparece sob milhares de threads ativas",
                            isCorrect: false,
                        },
                        {
                            text: "No vazamento visível apenas após horas de uso contínuo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Debugger: gdb essencial e post-mortem",
            blocks: [
                {
                    type: "text",
                    value: "# Parar o tempo dentro do processo\n\nChega a hora em que printf não basta: você precisa parar o programa no meio do voo e olhar dentro. O gdb faz exatamente isso, e o essencial cabe em seis comandos. Compile com -g (e de preferência -Og, como o módulo 3 ensinou) e abra com gdb ./app. break main.c:42, abreviado b, planta um breakpoint; run, ou r, executa até ele. Parado, next (n) executa a linha e passa POR CIMA de chamadas de função; step (s) entra nelas. print total (p) mostra o valor de qualquer expressão no escopo; continue (c) solta o programa até o próximo breakpoint.\n\nO sexto comando é o que resolve crash: backtrace, ou bt, imprime a pilha de chamadas inteira, de onde o programa está até o main, com arquivo e linha de cada quadro. Num segmentation fault, o gdb para sozinho no ponto do estouro, e bt responde a pergunta que importa: como o programa CHEGOU aqui? Os comandos frame, up e down navegam entre os quadros pra você inspecionar as variáveis de cada nível.\n\nCom esses seis, você cobre a maior parte das sessões reais de depuração.",
                },
                {
                    type: "table",
                    value: '[["Comando","Abreviação","O que faz"],["break arquivo:linha","b","planta um ponto de parada"],["run / continue","r / c","executa até parar em algo"],["next","n","próxima linha, sem entrar em funções"],["step","s","próxima linha, entrando na função"],["print expressão","p","avalia e mostra um valor no escopo"],["backtrace","bt","a pilha de chamadas até o main"]]',
                },
                {
                    type: "code",
                    value: "$ gcc -g -Og caixa.c -o caixa\n$ ./caixa\nSegmentation fault (core dumped)\n\n# Post-mortem: o core e a cena do crime preservada\n$ coredumpctl gdb ./caixa      # systemd; ou: gdb ./caixa core\nProgram terminated with signal SIGSEGV, Segmentation fault.\n#0  0x0000561f in normaliza (s=0x0) at caixa.c:31\n31          while (*s) { ... }\n(gdb) bt\n#0  normaliza (s=0x0)        at caixa.c:31\n#1  processa  (linha=...)    at caixa.c:58\n#2  main      ()             at caixa.c:90\n(gdb) frame 1\n(gdb) print linha.nome       # de onde veio o ponteiro nulo?",
                },
                {
                    type: "text",
                    value: "## Core dump: depurar a morte depois dela\n\nNem todo crash acontece na sua frente. O programa caiu na madrugada, no servidor, na máquina do cliente; rodar de novo no gdb pode nem reproduzir. Pra isso existe o core dump: o sistema fotografa a memória do processo no instante da morte, e o gdb abre essa foto depois, o chamado post-mortem. Você não pode dar next, o processo já era, mas pode tudo que é leitura: backtrace, inspecionar variáveis de cada quadro, entender o estado exato do desastre.\n\nNa prática moderna, em distribuições com systemd, o coredumpctl lista os dumps recentes e coredumpctl gdb abre o último direto no debugger. No esquema clássico, o arquivo core aparece no diretório do processo, desde que o limite esteja aberto: ulimit -c unlimited é o interruptor da sessão. Dois requisitos pra sessão render: o binário com -g (ou os pacotes de símbolos correspondentes em produção) e o EXATO binário que gerou o dump, senão os endereços não casam com nada.\n\nJunte as pontas do módulo: o sanitizer flagra a corrupção nos testes; o core dump conta o que aconteceu quando ela escapou pra produção. As duas ferramentas contam a mesma história em tempos diferentes.",
                },
                {
                    type: "quote",
                    value: "O core dump é a caixa-preta do avião: não impede a queda, mas transforma o desastre irreproduzível numa cena de crime completa, com pilha, variáveis e a linha exata do impacto.",
                },
            ],
            questions: [
                {
                    statement: "No gdb, qual a diferença entre next e step?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O next passa por cima da chamada; o step entra nela",
                            isCorrect: true,
                        },
                        {
                            text: "O next avança dez linhas; o step avança uma por vez",
                            isCorrect: false,
                        },
                        {
                            text: "O next roda até o fim; o step para em todo warning",
                            isCorrect: false,
                        },
                        {
                            text: "O next ignora breakpoints; o step respeita todos eles",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Diante de um segmentation fault dentro do gdb, qual comando mostra como o programa chegou ao ponto do estouro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O backtrace, listando a pilha até o main",
                            isCorrect: true,
                        },
                        {
                            text: "O print, avaliando o ponteiro que falhou",
                            isCorrect: false,
                        },
                        {
                            text: "O continue, repetindo o caminho do crash",
                            isCorrect: false,
                        },
                        {
                            text: "O break, marcando a linha da falha fatal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é um core dump?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A foto da memória do processo no instante da morte",
                            isCorrect: true,
                        },
                        {
                            text: "O log de todas as linhas executadas antes do crash",
                            isCorrect: false,
                        },
                        {
                            text: "O backup do binário feito pelo kernel a cada execução",
                            isCorrect: false,
                        },
                        {
                            text: "A lista de bibliotecas carregadas na hora da falha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que você NÃO consegue fazer numa sessão post-mortem com core dump?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Continuar a execução com next ou continue",
                            isCorrect: true,
                        },
                        {
                            text: "Ler o backtrace completo da pilha de chamadas",
                            isCorrect: false,
                        },
                        {
                            text: "Inspecionar variáveis dos quadros com o print",
                            isCorrect: false,
                        },
                        {
                            text: "Navegar entre os quadros com frame, up e down",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o post-mortem exige o exato binário que gerou o dump, além dos símbolos de debug?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Sem ele os endereços da foto não casam com o código",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel criptografa o core com a assinatura do binário",
                            isCorrect: false,
                        },
                        {
                            text: "O gdb recompila o programa antes de abrir a sessão",
                            isCorrect: false,
                        },
                        {
                            text: "O coredumpctl apaga dumps de binários modificados",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Padronização: formato decidido por máquina",
            blocks: [
                {
                    type: "text",
                    value: "# A discussão que não merece humanos\n\nChaves na mesma linha ou na de baixo? Espaços ou tabs? Oitenta colunas ou cento e vinte? Times já queimaram semanas nessas guerras, e a resposta profissional em 2026 é admitir que a discussão não merece gente: escolha UMA vez, escreva a escolha num arquivo, e deixe uma máquina aplicar pra sempre. No mundo C e C++, a máquina é o clang-format, irmão do clang-tidy na família LLVM.\n\nO contrato é simples: um arquivo .clang-format na raiz do repositório, versionado junto do código, descreve o estilo: estilo base (LLVM, Google, entre outros), largura de linha, política de chaves, ordenação de includes. Qualquer pessoa roda clang-format -i e o arquivo é reescrito no padrão; o editor faz isso ao salvar, sem ninguém pensar a respeito.\n\nRepare no que isso NÃO é: o clang-format não julga nomes, não detecta bugs, não opina sobre arquitetura; ele só posiciona texto. É deliberado: formatação é a única camada onde a automação pode ser total, porque não existe caso em que a resposta dependa de contexto de negócio.",
                },
                {
                    type: "code",
                    value: '# .clang-format na raiz do repositorio\nBasedOnStyle: LLVM\nIndentWidth: 4\nColumnLimit: 100\nBreakBeforeBraces: Attach\nSortIncludes: CaseSensitive\n\n# Formatar um arquivo no lugar:\nclang-format -i src/caixa.cpp\n\n# CI: falhar se algo escapou do padrao (sem reescrever):\nclang-format --dry-run --Werror src/*.cpp\n\n# Pre-commit: formatar apenas o que esta indo no commit\ngit diff --name-only --cached | grep -E "\\.(c|h|cpp|hpp)$" \\\n  | xargs clang-format -i',
                },
                {
                    type: "table",
                    value: '[["Onde aplicar","Mecanismo","Efeito no dia a dia"],["Editor","formatar ao salvar via clangd ou plugin","ninguém digita formatação, ela acontece"],["Pre-commit","hook formatando os arquivos do commit","nada fora do padrão entra na história"],["CI","clang-format --dry-run --Werror","a build acusa o que escapou dos hooks"],["Repositório",".clang-format versionado na raiz","o estilo é um só, pra todo mundo"]]',
                },
                {
                    type: "text",
                    value: "## O efeito colateral mais valioso: o code review\n\nO ganho que justifica tudo não é estético, é social: formatação sai do code review. Sem formatador, cada pull request vira caça a espaço e vírgula: comentários sobre indentação enterram as perguntas que importavam, e o autor sai da revisão tendo defendido chaves em vez de ter discutido o design. Com o formato garantido por máquina, o diff só mostra mudança de LÓGICA, e o revisor gasta atenção onde ela rende: nomes, casos de borda, arquitetura.\n\nA adoção num legado tem uma pegadinha específica: formatar o repositório inteiro de uma vez cria um commit gigante que polui o git blame. As saídas usuais: fazer essa formatação num commit isolado e registrá-lo no .git-blame-ignore-revs, que o git sabe pular; ou formatar arquivo a arquivo, conforme forem tocados. Escolha com o time, documente, siga.\n\nE uma regra de convivência que evita atrito: o estilo escolhido não precisa ser o seu favorito, precisa ser o do TIME. A consistência vale mais que qualquer preferência individual; depois de uma semana, ninguém mais enxerga o estilo, e é exatamente essa a vitória.",
                },
                {
                    type: "quote",
                    value: "Todo minuto de code review gasto com indentação é um minuto roubado de uma pergunta sobre design. Formatação é problema resolvido: entregue à máquina e nunca mais devolva aos humanos.",
                },
            ],
            questions: [
                {
                    statement: "O que o clang-format faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Reescreve o código no estilo definido pelo arquivo do time",
                            isCorrect: true,
                        },
                        {
                            text: "Aponta bugs prováveis analisando os caminhos do programa",
                            isCorrect: false,
                        },
                        {
                            text: "Renomeia variáveis fora da convenção adotada no projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Compila o arquivo com as flags de aviso mais rigorosas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde vive a definição do estilo aplicado pelo clang-format?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No arquivo .clang-format versionado na raiz do repositório",
                            isCorrect: true,
                        },
                        {
                            text: "Nas preferências pessoais do editor de cada desenvolvedor",
                            isCorrect: false,
                        },
                        {
                            text: "No CMakeLists.txt, dentro das propriedades de cada target",
                            isCorrect: false,
                        },
                        {
                            text: "Num serviço central da empresa consultado a cada commit",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o principal ganho social de automatizar a formatação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O code review para de discutir estilo e foca no design",
                            isCorrect: true,
                        },
                        {
                            text: "Os commits ficam menores e o repositório ocupa menos disco",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador processa mais rápido o código bem indentado",
                            isCorrect: false,
                        },
                        {
                            text: "Os novatos escrevem menos bugs ao seguir o padrão visual",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual comando faz a CI acusar código fora do padrão sem reescrever nada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "clang-format --dry-run --Werror nos arquivos do projeto",
                            isCorrect: true,
                        },
                        {
                            text: "clang-format -i seguido de um git push forçado da correção",
                            isCorrect: false,
                        },
                        {
                            text: "clang-tidy com a família readability- em modo silencioso",
                            isCorrect: false,
                        },
                        {
                            text: "diff entre o repositório e uma cópia formatada à parte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Ao formatar um legado inteiro de uma vez, como evitar que o commit gigante estrague o git blame?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Isolar o commit e listá-lo no .git-blame-ignore-revs",
                            isCorrect: true,
                        },
                        {
                            text: "Fazer a formatação numa branch que nunca será mesclada",
                            isCorrect: false,
                        },
                        {
                            text: "Desativar o blame nos arquivos tocados pela formatação",
                            isCorrect: false,
                        },
                        {
                            text: "Assinar o commit com a chave do bot pra filtrá-lo depois",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Projeto: da fonte ao binário com as mãos",
    aulas: [
        {
            titulo: "O programa: duas unidades e um header",
            blocks: [
                {
                    type: "text",
                    value: "# O laboratório em três arquivos\n\nEste módulo é uma bancada: você vai pegar um programa mínimo e atravessar com ele tudo o que a trilha ensinou, fase a fase, com as próprias mãos. O programa é uma calculadora de estatísticas: mat.h declara duas funções, media e maior; mat.cpp as define; main.cpp as usa sobre um vetor fixo e imprime o resultado. Três arquivos, duas unidades de tradução, um header de fronteira: o menor cenário onde o toolchain inteiro aparece.\n\nO roteiro espelha os módulos anteriores. Nesta aula, montamos os arquivos e conferimos o mapa do que vai acontecer. Na aula 2, compilamos cada unidade em separado com -c e lemos os objetos com o nm, encontrando o símbolo indefinido que a teoria prometeu. Na aula 3, linkamos, quebramos o link de propósito pra ver o undefined reference nascer e morrer, e empacotamos a mat numa biblioteca estática. Na aula 4, comparamos O0 e O2 no assembly, medimos com -Os e fechamos com o strip.\n\nReproduza cada comando num Linux com g++ instalado. Ler é bom; digitar e ver com os próprios olhos é o que fixa.",
                },
                {
                    type: "code",
                    value: '// mat.h\n#ifndef MAT_H\n#define MAT_H\ndouble media(const int* v, int n);\nint maior(const int* v, int n);\n#endif\n\n// mat.cpp\n#include "mat.h"\ndouble media(const int* v, int n) {\n    long soma = 0;\n    for (int i = 0; i < n; i++) soma += v[i];\n    return n ? (double)soma / n : 0.0;\n}\nint maior(const int* v, int n) {\n    int m = v[0];\n    for (int i = 1; i < n; i++) if (v[i] > m) m = v[i];\n    return m;\n}\n\n// main.cpp\n#include <cstdio>\n#include "mat.h"\nint main() {\n    int notas[] = {70, 85, 90, 60, 100};\n    printf("media %.1f maior %d\\n", media(notas, 5), maior(notas, 5));\n}',
                },
                {
                    type: "table",
                    value: '[["Arquivo","Papel","O que a trilha disse sobre ele"],["mat.h","fronteira: declarações compartilhadas","colado por include nas duas unidades"],["mat.cpp","define media e maior","vira mat.o com dois símbolos T"],["main.cpp","usa as funções e imprime","vira main.o com U pendentes"],["a dupla mat.o e main.o","as peças do quebra-cabeça","o linker fecha as promessas entre elas"]]',
                },
                {
                    type: "text",
                    value: "## O mapa do que vai acontecer\n\nAntes de rodar qualquer comando, preveja com a teoria. O pré-processador vai colar mat.h dentro de cada .cpp: main.cpp fica sabendo que media e maior EXISTEM, sem ver os corpos, exatamente a visão em túnel do módulo 1. O compilador aceita as chamadas confiando nas declarações; o assembler grava em main.o as chamadas com endereço em aberto e as entradas de relocação correspondentes.\n\nPreveja o nm: main.o terá T pra main e U pra media, maior e printf, todos decorados pelo mangling do C++ que o módulo 4 apresentou; mat.o terá T pra media e maior, e nenhum U além do que a implementação precisar. O link juntará os dois, pagará as relocações, e o printf continuará U no executável, prometido pra libc dinâmica em tempo de carga, o assunto de linkagem dinâmica do módulo 1.\n\nSe cada frase desse mapa soou natural, a trilha cumpriu a metade teórica. A outra metade é ver o mapa virar realidade no terminal, e é pra lá que vamos agora.",
                },
                {
                    type: "quote",
                    value: "Engenheiro que prevê a saída antes de rodar o comando não está adivinhando: está testando o próprio modelo mental. O terminal só confirma ou corrige; quem aprende é a previsão.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o papel do mat.h no projeto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Levar as declarações compartilhadas às duas unidades",
                            isCorrect: true,
                        },
                        {
                            text: "Guardar os corpos das funções media e maior do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Listar os objetos que o linker deve juntar no binário",
                            isCorrect: false,
                        },
                        {
                            text: "Definir as flags de compilação padrão das duas unidades",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quantas unidades de tradução o projeto tem, e quais?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Duas: main.cpp e mat.cpp, cada um com o header colado",
                            isCorrect: true,
                        },
                        {
                            text: "Três: main.cpp, mat.cpp e mat.h contam separadamente",
                            isCorrect: false,
                        },
                        {
                            text: "Uma: o pré-processador funde tudo num arquivo único",
                            isCorrect: false,
                        },
                        {
                            text: "Quatro: cada função do projeto vira uma unidade própria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que main.cpp compila sem ver o corpo de media e maior?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As declarações do header bastam; o corpo é conta do link",
                            isCorrect: true,
                        },
                        {
                            text: "O g++ busca os corpos em mat.cpp de forma automática",
                            isCorrect: false,
                        },
                        {
                            text: "O pré-processador embute mat.cpp inteiro via #include",
                            isCorrect: false,
                        },
                        {
                            text: "Funções pequenas são recriadas pelo otimizador no uso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a previsão correta pro nm de main.o antes do link?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "T só pra main; U pra media, maior e printf",
                            isCorrect: true,
                        },
                        {
                            text: "T pra main, media e maior; U só pra printf",
                            isCorrect: false,
                        },
                        {
                            text: "U pra tudo, inclusive pra própria função main",
                            isCorrect: false,
                        },
                        {
                            text: "T pra main e printf; U pra media e pra maior",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois do link, por que printf segue como U no executável enquanto media vira T?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "media veio de mat.o; printf fica pra libc dinâmica na carga",
                            isCorrect: true,
                        },
                        {
                            text: "printf é macro do cstdio e nunca gera símbolo de verdade",
                            isCorrect: false,
                        },
                        {
                            text: "o linker esqueceu printf e o programa vai falhar ao rodar",
                            isCorrect: false,
                        },
                        {
                            text: "funções variádicas permanecem U por limitação do formato ELF",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Compilar separado e ler com o nm",
            blocks: [
                {
                    type: "text",
                    value: "# Duas unidades, dois objetos\n\nMãos ao terminal. g++ -c main.cpp e g++ -c mat.cpp produzem main.o e mat.o: duas compilações independentes, como num projeto grande rodariam em paralelo. Repare que main.cpp compilou limpo mesmo sem NENHUM corpo de media por perto: a promessa da declaração bastou, como previsto no mapa.\n\nAgora a lupa. nm main.o lista os símbolos decorados: _Z5mediaPKii e _Z5maiorPKii com U, printf com U, main com T. Os nomes estranhos são o mangling do módulo 4 codificando os parâmetros (PKi é ponteiro pra int const); nm -C main.o traduz de volta pra media(int const*, int) e companhia. Do outro lado, nm -C mat.o mostra as duas funções com T: definidas, com endereço dentro do objeto.\n\nEsse é o contrato pela metade do módulo 1, agora visível: main.o consome o que mat.o fornece. Nenhum dos dois roda sozinho; main.o tem chamadas apontando pro vazio, à espera da relocação. Guarde a saída dos dois nm; na próxima aula, o linker fecha as contas, e vale comparar o antes e o depois.",
                },
                {
                    type: "code",
                    value: "$ g++ -c main.cpp && g++ -c mat.cpp\n$ ls\nmain.cpp  main.o  mat.cpp  mat.h  mat.o\n\n$ nm main.o\n0000000000000000 T main\n                 U printf\n                 U _Z5maiorPKii\n                 U _Z5mediaPKii\n\n$ nm -C mat.o\n0000000000000000 T maior(int const*, int)\n0000000000000024 T media(int const*, int)\n\n$ echo _Z5mediaPKii | c++filt\nmedia(int const*, int)",
                },
                {
                    type: "table",
                    value: '[["Comando","O que mostrou","Conceito da trilha em ação"],["g++ -c main.cpp","compilou sem corpo algum de media","declaração basta pra unidade fechar"],["nm main.o","U decorados e o T de main","símbolos indefinidos são promessas"],["nm -C mat.o","media e maior com T","definições com endereço no objeto"],["c++filt","_Z5mediaPKii vira media(int const*, int)","mangling codifica a assinatura"]]',
                },
                {
                    type: "text",
                    value: "## O experimento: criar um U de propósito\n\nPra sentir o mecanismo, provoque-o. Adicione em main.cpp uma chamada a uma função que NÃO existe em lugar nenhum: declare double desvio(const int* v, int n); logo após o include e chame desvio(notas, 5) dentro do printf. Recompile só o main: g++ -c main.cpp. Compila limpo, de novo, porque declaração basta. E o nm agora mostra um terceiro U decorado: _Z6desvioPKii, uma promessa que NINGUÉM no projeto cumpre.\n\nEsse objeto está perfeitamente saudável aos olhos do compilador e fatalmente doente aos olhos do linker, e essa é a lição: o -c desloca a cobrança pra frente. Em times reais é assim que builds quebram no fim: cada arquivo compila, o link estoura, e alguém que não conhece as fases perde uma hora procurando o erro no lugar errado.\n\nDeixe o desvio aí de propósito: a próxima aula linka esse projeto, vê o erro famoso nascer com nome decorado e tudo, e o conserta em duas rodadas. Quebrar de propósito é a forma mais barata de aprender a consertar.",
                },
                {
                    type: "quote",
                    value: "O -c compila cada promessa sem conferir se alguém a cumpre; o nm é a lista de promessas. Quem lê a lista antes do link nunca é surpreendido pelo cobrador.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que main.cpp compila com -c mesmo chamando desvio, que não existe em arquivo nenhum?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A declaração satisfaz a unidade; a cobrança fica pro link",
                            isCorrect: true,
                        },
                        {
                            text: "O g++ cria um corpo provisório pra toda função ausente",
                            isCorrect: false,
                        },
                        {
                            text: "O -c desliga a checagem de tipos das chamadas externas",
                            isCorrect: false,
                        },
                        {
                            text: "O header mat.h importa o corpo de desvio da biblioteca",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o nm -C faz com o símbolo _Z5mediaPKii?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Exibe o nome traduzido: media(int const*, int)",
                            isCorrect: true,
                        },
                        {
                            text: "Marca o símbolo como corrigido na tabela do objeto",
                            isCorrect: false,
                        },
                        {
                            text: "Converte o símbolo pra convenção de chamada do C",
                            isCorrect: false,
                        },
                        {
                            text: "Remove a decoração do objeto de forma permanente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Após a compilação separada, qual par resume main.o e mat.o?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "main.o consome com U o que mat.o fornece com T",
                            isCorrect: true,
                        },
                        {
                            text: "os dois fornecem T iguais e o linker escolhe um lado",
                            isCorrect: false,
                        },
                        {
                            text: "os dois trazem U de media à espera de uma biblioteca",
                            isCorrect: false,
                        },
                        {
                            text: "main.o embute mat.o inteiro por causa do include",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No nm de main.o, por que media aparece como _Z5mediaPKii e não como media?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O mangling do C++ codifica a assinatura no símbolo",
                            isCorrect: true,
                        },
                        {
                            text: "O -c comprime os nomes pra reduzir a tabela do objeto",
                            isCorrect: false,
                        },
                        {
                            text: "O nm embaralha os nomes por segurança sem a flag -C",
                            isCorrect: false,
                        },
                        {
                            text: "O header renomeia as funções pra evitar colisões de link",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O objeto com o U de desvio está saudável pro compilador e condenado no link. O que essa assimetria ensina?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O -c adia a cobrança: cada fase valida só o próprio contrato",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador tem um bug conhecido ao validar funções externas",
                            isCorrect: false,
                        },
                        {
                            text: "O nm deveria ter recusado listar um símbolo órfão de definição",
                            isCorrect: false,
                        },
                        {
                            text: "O linker é a única fase que lê o conteúdo do header mat.h",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Linkar, quebrar e consertar",
            blocks: [
                {
                    type: "text",
                    value: "# O erro famoso, agora de propósito\n\nHora de linkar com a bomba armada da aula anterior: g++ main.o mat.o -o calc. O ld responde na lata: undefined reference to 'desvio(int const*, int)', com o collect2 fechando o cortejo. Leia com calma a anatomia estudada no módulo 4: quem fala é o linker, o símbolo vem demangled na mensagem do g++ moderno, e a causa é a lista de promessas sem cumpridor. Rode o método: nm -C main.o | grep desvio confirma o U; nenhum outro objeto tem o T. Diagnóstico fechado em segundos, porque você SABIA onde olhar.\n\nConserto um: remover a chamada e a declaração de desvio, recompilar main.cpp, linkar de novo. Build verde, ./calc imprime media 81.0 maior 100. Conserto dois, mais interessante: definir desvio em mat.cpp (e declarar em mat.h), vivendo a rotina real de evoluir a fronteira entre unidades.\n\nAgora o segundo experimento clássico: esquecer um objeto. g++ main.o -o calc, sem o mat.o, derruba o link com DUAS referências indefinidas, media e maior. O mesmo erro, outra causa da lista do módulo 4: o fornecedor ficou fora do comando.",
                },
                {
                    type: "code",
                    value: "$ g++ main.o mat.o -o calc\n/usr/bin/ld: main.o: in function 'main':\nmain.cpp:(.text+0x2f): undefined reference to\n                       'desvio(int const*, int)'\ncollect2: error: ld returned 1 exit status\n\n$ g++ main.o -o calc          # esquecendo mat.o de proposito\n/usr/bin/ld: main.o: undefined reference to\n                     'media(int const*, int)'\n/usr/bin/ld: main.o: undefined reference to\n                     'maior(int const*, int)'\n\n# Consertado o fonte e com os dois objetos:\n$ g++ main.o mat.o -o calc && ./calc\nmedia 81.0 maior 100",
                },
                {
                    type: "table",
                    value: '[["Experimento","Mensagem do ld","Causa na lista do módulo 4"],["chamar desvio sem definir","undefined reference to \'desvio(...)\'","promessa sem cumpridor em objeto algum"],["linkar sem mat.o","duas referências indefinidas de uma vez","o objeto fornecedor ficou fora do comando"],["biblioteca antes do objeto","undefined reference com a lib presente","ordem: a .a foi examinada cedo demais"],["tudo no lugar","silêncio e binário gerado","grafo de símbolos fechado"]]',
                },
                {
                    type: "text",
                    value: "## Empacotando numa biblioteca estática\n\nÚltimo degrau da aula: transformar a mat numa biblioteca de verdade. ar rcs libmat.a mat.o cria o pacote; o link vira g++ main.o -L. -lmat -o calc. Funciona idêntico, e agora você pode reencenar a lição de ordem do módulo 4 em casa: g++ -lmat main.o -L. -o calc quebra em muitas versões do toolchain, porque a biblioteca foi examinada antes de existir pendência. Se no seu Linux esse comando passar, você esbarrou nas variações de comportamento entre versões e distribuições, e vale investigar qual ld está em uso; o princípio de colocar quem usa antes de quem fornece continua sendo o único arranjo garantido.\n\nFeche a aula com o ldd no executável: ele lista a libc e o loader dinâmico, as dependências que ficarão pra hora da carga, enquanto a sua libmat.a já foi copiada pra dentro do binário, invisível ao ldd. Estática dentro, dinâmica fora: a dicotomia do módulo 1, agora no SEU binário.\n\nO ciclo completo aconteceu nas suas mãos: quebrar, ler, diagnosticar com nm, consertar por dois caminhos, empacotar. Esse musculo é o que a aula final consolida.",
                },
                {
                    type: "quote",
                    value: "Provocar o undefined reference de propósito é vacina: a primeira vez dói em ambiente controlado, e todas as seguintes, no trabalho de verdade, viram diagnóstico de trinta segundos.",
                },
            ],
            questions: [
                {
                    statement:
                        "Linkando sem o mat.o, quantas referências indefinidas o ld acusa neste projeto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Duas: media e maior ficam sem fornecedor",
                            isCorrect: true,
                        },
                        {
                            text: "Uma: o ld para de procurar no primeiro U",
                            isCorrect: false,
                        },
                        {
                            text: "Três: printf também perde a definição dele",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma: o erro só aparece ao rodar o calc",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual comando empacota mat.o numa biblioteca estática?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "ar rcs libmat.a mat.o",
                            isCorrect: true,
                        },
                        {
                            text: "g++ -shared mat.o -o libmat.a",
                            isCorrect: false,
                        },
                        {
                            text: "ld -static mat.o -o libmat.a",
                            isCorrect: false,
                        },
                        {
                            text: "strip --keep mat.o -o libmat.a",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com a mensagem undefined reference to 'desvio(...)' na tela, qual verificação fecha o diagnóstico?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "nm nos objetos: U em quem chama, T em lugar nenhum",
                            isCorrect: true,
                        },
                        {
                            text: "ldd no executável, conferindo as bibliotecas da carga",
                            isCorrect: false,
                        },
                        {
                            text: "g++ -E no main.cpp, conferindo a colagem do header",
                            isCorrect: false,
                        },
                        {
                            text: "size no main.o, conferindo o espaço da seção .text",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de linkar com a libmat.a, por que o ldd do calc não menciona a mat?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O código dela foi copiado pro binário no link estático",
                            isCorrect: true,
                        },
                        {
                            text: "O ldd só lista bibliotecas instaladas pelo sistema",
                            isCorrect: false,
                        },
                        {
                            text: "O ar esconde o pacote da inspeção de dependências",
                            isCorrect: false,
                        },
                        {
                            text: "A mat virou parte da libc na etapa final do build",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No arranjo g++ -lmat main.o -L., por que o link pode quebrar mesmo com a biblioteca presente?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A .a é examinada antes de existir pendência pra puxar",
                            isCorrect: true,
                        },
                        {
                            text: "O -L. só vale pra bibliotecas listadas depois do -o",
                            isCorrect: false,
                        },
                        {
                            text: "O ld ignora bibliotecas com menos de dois objetos",
                            isCorrect: false,
                        },
                        {
                            text: "A libmat.a precisa vir renomeada pra mat.a no comando",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Otimizar, medir e enxugar",
            blocks: [
                {
                    type: "text",
                    value: "# O0 e O2 lado a lado, no seu código\n\nPenúltima estação: ver o otimizador trabalhar sobre o SEU projeto. Gere os dois assemblies da mat: g++ -S -O0 mat.cpp -o mat_O0.s e g++ -S -O2 mat.cpp -o mat_O2.s. Abra os dois (ou cole a media no godbolt, como no módulo 3) e aplique a leitura essencial: no -O0, a função carrega e guarda variáveis na pilha a cada passo, com acessos a [rbp-...] por toda parte e o laço fielmente burocrático. No -O2, os acessos à pilha somem, a soma vive em registrador, e dependendo da versão do GCC o laço aparece vetorizado, processando blocos de elementos com registradores xmm.\n\nFaça a segunda comparação, agora de tamanho: compile o projeto inteiro três vezes, com -O0, -O2 e -Os, e rode size em cada executável. Num programa deste porte as diferenças são modestas, e é exatamente esse o aprendizado honesto: os ganhos dramáticos de -Os aparecem quando há MUITO código pra enxugar; aqui você observa o mecanismo com números pequenos e verdadeiros.\n\nAnote os três números de .text: eles são a sua primeira medição de engenharia de binário.",
                },
                {
                    type: "code",
                    value: "$ g++ -S -O0 mat.cpp -o mat_O0.s\n$ g++ -S -O2 mat.cpp -o mat_O2.s\n$ wc -l mat_O0.s mat_O2.s\n  118 mat_O0.s\n   74 mat_O2.s     # menos linhas, e sem acessos a pilha\n\n$ g++ -O2 main.cpp mat.cpp -o calc\n$ size calc\n   text    data     bss     dec     hex filename\n   2103     640       8    2751     abf calc\n\n$ g++ -O2 -g main.cpp mat.cpp -o calc && ls -lh calc\n-rwxrwxr-x 1 dev dev 27K calc      # com simbolos de debug\n$ strip calc && ls -lh calc\n-rwxrwxr-x 1 dev dev 15K calc      # so o necessario pra rodar",
                },
                {
                    type: "table",
                    value: '[["Medição no projeto","Ferramenta","O que você observa"],["assembly O0 vs O2","g++ -S e leitura, ou godbolt","pilha e burocracia dando lugar a registradores"],["tamanho por seção","size nos três executáveis",".text variando com O0, O2 e Os"],["peso dos símbolos","ls -lh antes e depois do strip","o -g dominando o tamanho do arquivo"],["dependências de carga","ldd no calc final","só a libc e o loader, como previsto"]]',
                },
                {
                    type: "text",
                    value: "## strip: o corte final\n\nFeche o ciclo com a build de entrega: g++ -O2 -g main.cpp mat.cpp -o calc, o size pra registrar as seções, ls -lh pra ver o arquivo com os símbolos de debug, e então strip calc. O executável despenca de tamanho sem mudar um byte de código executável: saiu a bagagem do gdb, como no módulo 4. Rode ./calc uma última vez pra confirmar que nada funcional se perdeu.\n\nVale explicitar o fluxo profissional que esse gesto resume: compila-se COM -g sempre, porque símbolo de debug não custa desempenho; distribui-se o binário com strip; e guarda-se a versão com símbolos (ou um arquivo de símbolos separado) pra abrir core dumps de produção, o post-mortem do módulo 6. Jogar os símbolos fora sem guardar cópia é economizar centavos hoje pra pagar caro na primeira madrugada de crash.\n\nO projeto termina aqui no aspecto técnico: você compilou separado, leu objetos, quebrou e consertou o link, empacotou biblioteca, comparou otimizações e enxugou o artefato final. A última aula não adiciona comandos; ela organiza o que essas quatro deixaram na sua mão.",
                },
                {
                    type: "quote",
                    value: "Meça antes, corte depois, confirme sempre: size, strip e um ./calc final. Otimização sem medição é fé; com medição, vira engenharia, mesmo quando os números são pequenos.",
                },
            ],
            questions: [
                {
                    statement:
                        "Comparando os assemblies, qual mudança de O0 pra O2 salta aos olhos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Os acessos constantes à pilha somem e sobram registradores",
                            isCorrect: true,
                        },
                        {
                            text: "O arquivo cresce porque cada função ganha uma cópia extra",
                            isCorrect: false,
                        },
                        {
                            text: "As instruções aparecem traduzidas pra pseudocódigo legível",
                            isCorrect: false,
                        },
                        {
                            text: "Os nomes das variáveis passam a acompanhar cada instrução",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o strip removeu do calc no experimento final?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Símbolos e informação de debug, sem tocar no código",
                            isCorrect: true,
                        },
                        {
                            text: "As funções media e maior, que já estavam inlinadas",
                            isCorrect: false,
                        },
                        {
                            text: "A seção .text inteira, recriada na primeira execução",
                            isCorrect: false,
                        },
                        {
                            text: "A dependência da libc registrada pro loader dinâmico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que as diferenças de tamanho entre O0, O2 e Os são modestas neste projeto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Há pouco código: os ganhos crescem com o volume a enxugar",
                            isCorrect: true,
                        },
                        {
                            text: "O size ignora as seções onde a otimização realmente atua",
                            isCorrect: false,
                        },
                        {
                            text: "O g++ desativa o -Os em programas com menos de mil linhas",
                            isCorrect: false,
                        },
                        {
                            text: "A libc embutida domina o binário e esconde toda variação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o fluxo profissional em torno do -g e do strip na entrega?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Compilar com -g, distribuir com strip, guardar os símbolos",
                            isCorrect: true,
                        },
                        {
                            text: "Compilar sem -g na CI e adicionar símbolos só se der crash",
                            isCorrect: false,
                        },
                        {
                            text: "Distribuir com -g ativo, pois o strip degrada o desempenho",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicar strip antes do link pra acelerar a fase de relocação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que compilar com -g não torna o programa mais lento?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O -g só anexa metadados; o código gerado é o mesmo",
                            isCorrect: true,
                        },
                        {
                            text: "O -g força -O0, e a lentidão vem do nível, não do -g",
                            isCorrect: false,
                        },
                        {
                            text: "O loader descarta os símbolos antes de iniciar o main",
                            isCorrect: false,
                        },
                        {
                            text: "O gdb compensa o custo executando o binário em cache",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fechamento: a caixa de vidro",
            blocks: [
                {
                    type: "text",
                    value: "# O que mudou entre o primeiro gcc e este\n\nNo começo desta trilha, gcc ola.c -o ola era um feitiço: texto entrava, executável saía, e qualquer erro no meio era um mistério irritante. Olhe o que esse mesmo comando significa pra você agora: um pré-processador colando headers, um compilador atravessando lexer, parser, análise semântica e uma representação intermediária otimizada, um assembler gerando objetos cheios de promessas, e um linker fechando cada uma delas num binário mensurável. A caixa preta virou caixa de vidro: as engrenagens continuam complexas, mas você as VÊ.\n\nFaça o inventário do que ficou na mão. Você lê erros pela fase que os emitiu e conserta o primeiro, não o quadragésimo. Abre objetos com nm e executáveis com ldd antes de teorizar. Trata undefined reference como diagnóstico de trinta segundos. Escolhe nível de otimização com critério e confere no godbolt o que o compilador fez. Declara builds em make ou CMake entendendo o grafo por baixo. E cerca o próprio código de warnings, sanitizers, análise estática, gdb e formatação automática.\n\nNenhum desses gestos é decorativo: cada um nasceu de um problema real que você viu acontecer.",
                },
                {
                    type: "table",
                    value: '[["Situação no trabalho","Reflexo que a trilha instalou"],["erro de build confuso","identificar a fase pela mensagem e atacar o primeiro erro"],["símbolo faltando no link","nm dos dois lados: quem consome, quem deveria fornecer"],["dúvida sobre desempenho","olhar o assembly no godbolt antes de opinar"],["bug de memória intermitente","rodar a suíte sob ASan e UBSan e ler o flagrante"],["build lento ou frágil","conferir o grafo de dependências, cache e paralelismo"],["crash em produção","core dump aberto no gdb com os símbolos guardados"]]',
                },
                {
                    type: "quote",
                    value: "Ferramenta respeitada é ferramenta compreendida: quem sabe o que o toolchain faz por baixo para de brigar com ele e começa a usá-lo como aliado.",
                },
                {
                    type: "text",
                    value: "## O hábito que fica\n\nSe um único hábito resume tudo, é este: olhar embaixo do capô como rotina, não como heroísmo. Custa segundos: um nm depois de compilar, um size depois de linkar, uma espiada no godbolt antes de discutir performance, um -Wall -Wextra em todo projeto novo que você criar. Cada espiada dessas confirma ou corrige o seu modelo mental, e é o modelo mental afiado que transforma horas de tentativa e erro em minutos de diagnóstico.\n\nSiga praticando com o que existe de verdade por aí: recompile uma biblioteca de código aberto olhando o build dela, leia o Makefile ou o CMakeLists de um projeto que você admira, abra um binário do seu sistema com nm e ldd só pra conferir o que reconhece. O material desta trilha continua à disposição pra revisita, e as ferramentas, gcc, clang, nm, make, cmake, gdb e companhia, estão instaladas ou a um comando de distância em qualquer Linux.\n\nA caixa está aberta e iluminada. Mantenha a lanterna acesa: ela é leve, e o que ela mostra vale por cada segundo do olhar.",
                },
            ],
            questions: [
                {
                    statement: "Qual imagem resume a transformação proposta pela trilha?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A caixa preta do toolchain virando caixa de vidro",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador substituído por scripts feitos à mão",
                            isCorrect: false,
                        },
                        {
                            text: "O binário final dispensando qualquer inspeção extra",
                            isCorrect: false,
                        },
                        {
                            text: "O linker unificado com o parser num passo exclusivo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Diante de um erro de build confuso, qual é o primeiro reflexo ensinado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Identificar a fase que reclamou e atacar o primeiro erro",
                            isCorrect: true,
                        },
                        {
                            text: "Recompilar tudo do zero com o cache totalmente limpo",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o nível de otimização pra obter mais contexto",
                            isCorrect: false,
                        },
                        {
                            text: "Reinstalar a toolchain antes de qualquer investigação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um colega afirma que uma micro-otimização no fonte vai acelerar o programa. Qual reflexo da trilha se aplica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Conferir o assembly gerado no godbolt antes de opinar",
                            isCorrect: true,
                        },
                        {
                            text: "Aceitar a mudança se o autor tiver mais tempo de casa",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicar a mudança e aguardar o feedback dos usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Subir o nível de otimização pra compensar a incerteza",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que olhar embaixo do capô como rotina compensa, segundo o fechamento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Segundos de inspeção afiam o modelo mental que economiza horas",
                            isCorrect: true,
                        },
                        {
                            text: "As ferramentas de inspeção corrigem os bugs de forma automática",
                            isCorrect: false,
                        },
                        {
                            text: "A inspeção frequente dispensa os testes e o code review do time",
                            isCorrect: false,
                        },
                        {
                            text: "Os binários inspecionados com nm executam com mais velocidade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual prática de estudo o fechamento recomenda pra seguir evoluindo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ler builds de código aberto e inspecionar binários do sistema",
                            isCorrect: true,
                        },
                        {
                            text: "Reescrever o próprio compilador antes de usar qualquer ferramenta",
                            isCorrect: false,
                        },
                        {
                            text: "Evitar projetos externos até dominar cada flag da documentação",
                            isCorrect: false,
                        },
                        {
                            text: "Memorizar as mensagens de erro mais comuns de cada versão do gcc",
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
