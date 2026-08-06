// Seed da trilha Embarcados na Prática, estagio 8 do roadmap.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-embarcados-na-pratica.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Embarcados na Prática";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Onde o software encontra o hardware: o microcontrolador por dentro, registradores e volatile, GPIO, timers e interrupções, os protocolos UART, SPI e I2C, o C++ enxuto que cabe em kilobytes, energia, robustez e OTA, e a qualidade de quem escreve firmware que não pode falhar: MISRA, testes no host e CI.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - O mundo embarcado",
    aulas: [
        {
            titulo: "O que muda",
            blocks: [
                {
                    type: "text",
                    value: "# Bem-vindo ao mundo dos kilobytes\n\nNo seu notebook, um processo abre com gigabytes de memória virtual e um sistema operacional inteiro de guarda-costas. No microcontrolador que aciona um portão, mede uma estufa ou controla uma bomba de infusão, a escala muda: dezenas ou centenas de kilobytes de RAM, alguns megabytes de flash no máximo, e nenhum sistema operacional entre o seu código e o silício. O main() que você escreve é, na prática, o dono da máquina.\n\nTrês diferenças estruturais definem o jogo. Primeiro, a memória é pequena e você a conhece pelo nome: cada buffer tem tamanho pensado, cada vetor tem justificativa. Segundo, não existe MMU: nenhuma tabela de páginas isola processos, porque em geral só existe um programa rodando. Terceiro, o tempo importa por padrão: o firmware responde a eventos físicos, e atrasar a leitura de um sensor de corrente não é lentidão, é defeito do produto.\n\nEssa mudança de escala não é castigo. É ela que torna o sistema inteiro compreensível: com paciência, você consegue saber o que cada byte do seu produto está fazendo. Pouquíssimos programadores de aplicação podem dizer o mesmo do que rodam.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Aplicação num PC","Firmware num MCU"],["Memória","Gigabytes, virtual","Kilobytes, física e contada"],["Proteção","MMU isola processos","Sem MMU, espaço único"],["Sistema operacional","Sempre presente","Opcional, muitas vezes ausente"],["Tempo","Melhor esforço","Prazos físicos por padrão"],["Custo de falhar","Processo reinicia","Produto para no campo"]]',
                },
                {
                    type: "text",
                    value: "## Flash, RAM e a placa na sua mesa\n\nA memória vem dividida de fábrica: a flash guarda o programa e sobrevive sem energia; a RAM guarda os dados que mudam e evapora quando a alimentação cai. O código executa da flash, as variáveis vivem na RAM, e os dois orçamentos são contados separadamente, byte a byte, pelo próprio compilador no fim de cada build.\n\nA melhor notícia deste mundo: praticar custa pouco. Uma placa com ESP32 ou uma STM32 com gravador embutido sai entre 30 e 80 reais em 2026, e transforma cada aula desta trilha em experimento de bancada. Compre uma antes do módulo 2: o LED que pisca na sua mesa ensina mais que qualquer captura de tela. Se puder escolher, a ESP32 traz WiFi e Bluetooth de brinde; a STM32 (uma Nucleo, por exemplo) traz o depurador integrado e o ecossistema Cortex-M que domina a indústria. Qualquer uma das duas carrega a trilha inteira.\n\nNada aqui exige a placa para acompanhar, mas tudo fica mais concreto com ela. Firmware se aprende com o dedo no botão de reset e o olho no LED.",
                },
                {
                    type: "quote",
                    value: "Num PC, software errado derruba um processo e o sistema segue. Num produto embarcado, o firmware é o produto: quando ele trava, trava o portão, a bomba, a colheitadeira.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a ordem de grandeza típica da RAM de um microcontrolador?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dezenas a centenas de kilobytes, contados byte a byte",
                            isCorrect: true,
                        },
                        {
                            text: "Alguns gigabytes, como num notebook de entrada simples",
                            isCorrect: false,
                        },
                        {
                            text: "Alguns terabytes, para guardar logs extensos do produto",
                            isCorrect: false,
                        },
                        {
                            text: "Exatamente 1 megabyte, valor padronizado pela indústria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que equipamento a trilha sugere comprar para praticar em casa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma placa ESP32 ou STM32, na faixa de 30 a 80 reais",
                            isCorrect: true,
                        },
                        {
                            text: "Um Raspberry Pi 5 com fonte oficial e gabinete completo",
                            isCorrect: false,
                        },
                        {
                            text: "Uma placa de FPGA com licença de simulador profissional",
                            isCorrect: false,
                        },
                        {
                            text: "Um kit industrial certificado, na faixa de 800 reais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que muda na prática pela ausência de MMU no microcontrolador?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um ponteiro errado pode corromper qualquer área da memória",
                            isCorrect: true,
                        },
                        {
                            text: "O firmware fica proibido de usar ponteiros e vetores em C",
                            isCorrect: false,
                        },
                        {
                            text: "A RAM passa a ser apagada automaticamente a cada interrupção",
                            isCorrect: false,
                        },
                        {
                            text: "O processador perde a capacidade de executar código da flash",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa dizer que firmware é tempo real por padrão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Responder dentro de prazos previsíveis, não só ser rápido",
                            isCorrect: true,
                        },
                        {
                            text: "Executar sempre na maior frequência de clock disponível",
                            isCorrect: false,
                        },
                        {
                            text: "Manter um relógio de calendário sincronizado pela internet",
                            isCorrect: false,
                        },
                        {
                            text: "Processar os dados sem usar nenhuma estrutura de fila",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que um estouro de pilha é mais traiçoeiro num MCU do que num PC?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Sem proteção de memória, ele corrompe dados vizinhos em silêncio",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a pilha do MCU fica gravada na flash e desgasta o setor",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o compilador embarcado não consegue empilhar funções",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o MCU não tem pilha e usa apenas registradores do núcleo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O microcontrolador por dentro",
            blocks: [
                {
                    type: "text",
                    value: "# Um computador completo num chip\n\nAbra o datasheet de um STM32 ou de um ESP32 e você encontra, no mesmo pedaço de silício, tudo o que um computador precisa: um núcleo de processamento (um ARM Cortex-M4, por exemplo), a flash para o programa, a SRAM para os dados e dezenas de periféricos: controladores de pinos, timers, conversores analógicos, interfaces de comunicação. Por isso o nome é microcontrolador, e não microprocessador: a CPU é só um dos moradores do chip.\n\nLigando tudo, um barramento interno transporta leituras e escritas entre o núcleo e o resto. Quando o seu código lê uma variável, a transação vai até a SRAM; quando escreve num registrador de periférico, a mesma operação de escrita viaja pelo barramento até o bloco de hardware correspondente. Do ponto de vista do núcleo, não há diferença entre memória e periférico: há apenas endereços.\n\nGuarde essa frase, porque ela é a chave do módulo 2 inteiro: no Cortex-M, controlar hardware é ler e escrever endereços. O resto desta aula mostra onde cada coisa mora dentro do chip.",
                },
                {
                    type: "table",
                    value: '[["Bloco","O que é","Papel no chip"],["Núcleo","CPU (ex.: Cortex-M4)","Executa as instruções do firmware"],["Flash","Memória não volátil","Guarda código e constantes"],["SRAM","Memória volátil","Variáveis, pilha e heap (se houver)"],["Periféricos","Blocos de hardware","GPIO, timers, ADC, UART, SPI, I2C"],["Barramento","Interconexão interna","Leva leituras e escritas a cada bloco"],["Árvore de clock","Distribuição de relógio","Dá o ritmo ao núcleo e aos periféricos"]]',
                },
                {
                    type: "text",
                    value: "## O mapa de memória\n\nCada bloco recebe uma faixa de endereços fixa, documentada no reference manual. Num STM32 típico, a flash começa em 0x08000000, a SRAM em 0x20000000 e os periféricos aparecem a partir de 0x40000000. Esse desenho, o mapa de memória, é a planta baixa do chip: diz onde o código mora, onde os dados vivem e em que porta bater para falar com cada periférico.\n\nDuas consequências práticas. Primeira: o reference manual vira leitura de trabalho, porque é ele, e não um tutorial de blog, que define o endereço e o significado de cada bit de cada registrador do seu chip. Segunda: o linker script, aquele arquivo estranho que todo projeto embarcado carrega, existe exatamente para casar o binário com esse mapa, colocando código na faixa da flash e dados na faixa da RAM.\n\nVocê não precisa decorar endereço nenhum. Precisa saber que eles existem, onde procurá-los e que ficam estáveis dentro de uma família de chips. O trecho de código abaixo mostra o mapa virando C.",
                },
                {
                    type: "code",
                    value: "/* Faixas tipicas de um STM32 (confira no reference manual do seu chip) */\n#define FLASH_BASE   0x08000000UL  /* codigo e constantes  */\n#define SRAM_BASE    0x20000000UL  /* variaveis e pilha    */\n#define PERIPH_BASE  0x40000000UL  /* inicio dos perifericos */\n\n/* Um registrador de periferico e um endereco com significado */\n#define GPIOA_ODR  (*(volatile unsigned int *)0x48000014UL)",
                },
                {
                    type: "quote",
                    value: "O reference manual é o contrato entre você e o silício: tudo o que o chip promete está lá, endereço por endereço, bit por bit. Tutorial bom é o que ensina a lê-lo.",
                },
            ],
            questions: [
                {
                    statement: "O que diferencia um microcontrolador de um microprocessador?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele integra núcleo, memórias e periféricos no mesmo chip",
                            isCorrect: true,
                        },
                        {
                            text: "Ele executa apenas linguagens interpretadas, como Python",
                            isCorrect: false,
                        },
                        {
                            text: "Ele funciona sem clock, reagindo somente a interrupções",
                            isCorrect: false,
                        },
                        {
                            text: "Ele sempre traz um sistema operacional gravado de fábrica",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Num STM32 típico, o que existe a partir do endereço 0x40000000?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A faixa de endereços dos registradores de periféricos",
                            isCorrect: true,
                        },
                        {
                            text: "A área de pilha reservada pelo compilador ao ligar o chip",
                            isCorrect: false,
                        },
                        {
                            text: "A cópia de segurança do bootloader gravada pelo fabricante",
                            isCorrect: false,
                        },
                        {
                            text: "A memória flash onde o código do firmware fica gravado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Do ponto de vista do núcleo Cortex-M, o que é um periférico?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma faixa de endereços que aceita leituras e escritas",
                            isCorrect: true,
                        },
                        {
                            text: "Um coprocessador que roda um firmware próprio separado",
                            isCorrect: false,
                        },
                        {
                            text: "Um chip externo ligado por cabo à placa do produto final",
                            isCorrect: false,
                        },
                        {
                            text: "Uma rotina da biblioteca padrão compilada junto do main",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o papel do linker script num projeto embarcado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Casar o binário com o mapa: código na flash, dados na RAM",
                            isCorrect: true,
                        },
                        {
                            text: "Ordenar as funções por tamanho para acelerar a compilação",
                            isCorrect: false,
                        },
                        {
                            text: "Remover os comentários do código antes da gravação na placa",
                            isCorrect: false,
                        },
                        {
                            text: "Traduzir o assembly gerado para a sintaxe do depurador SWD",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o reference manual é a fonte definitiva, acima de qualquer tutorial?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Só ele define endereço e significado de cada bit do chip",
                            isCorrect: true,
                        },
                        {
                            text: "Porque tutoriais são proibidos em projetos com certificação",
                            isCorrect: false,
                        },
                        {
                            text: "Porque ele traz o código fonte completo da HAL do fabricante",
                            isCorrect: false,
                        },
                        {
                            text: "Porque ele é atualizado com mais frequência que os blogs",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Famílias em 2026",
            blocks: [
                {
                    type: "text",
                    value: "# O mapa das famílias em 2026\n\nEm 2026, o centro de gravidade do mercado é o ARM Cortex-M. A ARM projeta o núcleo e licencia o desenho: ST (STM32), NXP, Nordic, Renesas, Microchip e dezenas de outras fabricam chips diferentes em volta do mesmo miolo. Para você, isso é um superpoder: o conhecimento transfere. Aprendeu o modelo de interrupções, o SysTick e o mapa de registradores num STM32, e você reaproveita quase tudo num Nordic ou num NXP.\n\nA segunda força é a Espressif com o ESP32: WiFi e Bluetooth integrados por poucos dólares fizeram dele o padrão de fato do hobby e de muito produto conectado de verdade. As variantes mais novas, aliás, trocaram o núcleo proprietário Xtensa por RISC-V.\n\nE essa é a terceira força: RISC-V, a arquitetura de conjunto de instruções aberta e sem royalties, cresce de baixo para cima, começando por chips de entrada e por núcleos auxiliares escondidos dentro de chips maiores. Ainda não rivaliza com o Cortex-M em ferramentas e ecossistema, mas a curva aponta para cima. Nenhuma das três é resposta universal: o que esta aula ensina é o critério.",
                },
                {
                    type: "table",
                    value: '[["Família","Ponto forte","Uso típico"],["ARM Cortex-M","Ecossistema e ferramentas maduras","Produto industrial, médico, automotivo"],["ESP32","WiFi e BLE integrados, preço baixo","IoT doméstica, prototipagem conectada"],["RISC-V","ISA aberta, sem royalties","Chips de entrada, núcleos auxiliares"],["AVR e PIC","Simplicidade e legado enorme","Base instalada, produtos antigos"]]',
                },
                {
                    type: "text",
                    value: "## O critério de escolha\n\nEscolher microcontrolador é exercício de engenharia, não de torcida. Quatro perguntas resolvem a maioria dos casos reais. Primeira: os periféricos batem com o projeto? Se você precisa de CAN, USB ou de um ADC rápido, a lista de candidatos encolhe sozinha antes de qualquer benchmark. Segunda: qual é o orçamento de energia? Produto a bateria pede modos de sono profundos e corrente de fuga baixa, e as famílias diferem muito nesse quesito. Terceira: como são o toolchain e o ecossistema? Compilador maduro, depurador acessível, HAL decente e comunidade ativa valem mais que qualquer número de marketing. Quarta: preço e disponibilidade na quantidade e no prazo do seu produto, porque a crise de componentes que a indústria viveu ensinou que chip bom é chip que se compra.\n\nRepare no que não está na lista: a arquitetura da moda. Um produto que liga motor e lê botão não fica melhor por rodar o núcleo mais novo do mercado. Anote o método, não o ranking: rankings mudam todo ano, o critério de escolha fica com você a carreira inteira.",
                },
                {
                    type: "quote",
                    value: "Chip bom é o que tem o periférico que o projeto pede, o consumo que a bateria permite, a ferramenta que o time domina e o preço que o produto paga. O resto é torcida.",
                },
            ],
            questions: [
                {
                    statement: "Qual família domina o mercado de microcontroladores em 2026?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "ARM Cortex-M, licenciado a dezenas de fabricantes",
                            isCorrect: true,
                        },
                        {
                            text: "RISC-V, que já substituiu o ARM na indústria toda",
                            isCorrect: false,
                        },
                        {
                            text: "AVR de 8 bits, pela força da base instalada do Arduino",
                            isCorrect: false,
                        },
                        {
                            text: "x86 de baixo consumo, herdado dos computadores pessoais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que fez do ESP32 um padrão de fato em produtos conectados?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "WiFi e Bluetooth integrados a um preço muito baixo",
                            isCorrect: true,
                        },
                        {
                            text: "Ser o único chip do mercado programável na linguagem C",
                            isCorrect: false,
                        },
                        {
                            text: "Ter o dobro da frequência de clock dos concorrentes ARM",
                            isCorrect: false,
                        },
                        {
                            text: "Vir com um sistema operacional Linux completo de fábrica",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que torna o RISC-V atraente para quem fabrica chips?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A ISA é aberta e livre de royalties de licenciamento",
                            isCorrect: true,
                        },
                        {
                            text: "O conjunto de instruções é idêntico ao do Cortex-M",
                            isCorrect: false,
                        },
                        {
                            text: "A fundação RISC-V doa as fábricas para novos entrantes",
                            isCorrect: false,
                        },
                        {
                            text: "Todo núcleo RISC-V já vem com WiFi e Bluetooth prontos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que aprender num STM32 aproveita depois em chips de outras marcas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O núcleo Cortex-M e seu modelo se repetem entre marcas",
                            isCorrect: true,
                        },
                        {
                            text: "Os fabricantes adotam o mesmo mapa de memória por norma",
                            isCorrect: false,
                        },
                        {
                            text: "As HALs de todos os fabricantes compartilham código fonte",
                            isCorrect: false,
                        },
                        {
                            text: "O STM32 emula por software os periféricos concorrentes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num produto a bateria com sensores I2C, qual filtro corta candidatos primeiro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Periféricos necessários e consumo nos modos de sono",
                            isCorrect: true,
                        },
                        {
                            text: "A frequência máxima de clock anunciada pelo fabricante",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de núcleos disponíveis para processamento",
                            isCorrect: false,
                        },
                        {
                            text: "A idade da família, escolhendo sempre o chip mais novo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O toolchain embarcado",
            blocks: [
                {
                    type: "text",
                    value: "# Compilar aqui, rodar lá\n\nNo desenvolvimento comum, você compila e executa na mesma máquina. Em embarcados, não: o seu notebook x86 gera código para um processador ARM que nem sistema operacional tem. Isso pede um compilador cruzado (cross-compiler), e o nome do mais usado já conta a história inteira: arm-none-eabi-gcc. Alvo ARM, sistema operacional nenhum (none) e uma convenção padrão de chamada e de binário para embarcados (EABI).\n\nA saída do build é um arquivo .elf, rico em símbolos e informação de depuração, do qual se extraem os formatos de gravação: .bin, a imagem crua, ou .hex. Nesse processo, o linker script que você conheceu na aula anterior posiciona cada seção no mapa: código e constantes na faixa da flash, dados iniciais e pilha na faixa da RAM.\n\nUma ferramenta pequena merece virar hábito diário: arm-none-eabi-size, que mostra quanto de flash e de RAM o binário consome. No ESP32, o mesmo papel é do idf.py size. Firmware saudável conhece os próprios números, e essa ideia volta na trilha até virar métrica de CI no módulo 6.",
                },
                {
                    type: "code",
                    value: "# compila para Cortex-M4, sem OS, otimizando por tamanho\narm-none-eabi-gcc -mcpu=cortex-m4 -mthumb -Os -nostdlib \\\n    -T linker.ld -o firmware.elf main.c startup.c\n\n# extrai a imagem crua que vai para a flash\narm-none-eabi-objcopy -O binary firmware.elf firmware.bin\n\n# quanto custa: text (flash), data e bss (RAM)\narm-none-eabi-size firmware.elf",
                },
                {
                    type: "table",
                    value: '[["Caminho de gravação","Como funciona","Onde aparece"],["Bootloader serial","Código de fábrica recebe o binário pela UART/USB","ESP32, STM32 sem gravador"],["DFU por USB","O chip se apresenta como dispositivo de gravação","Placas com USB nativo"],["Depurador SWD/JTAG","Sonda externa escreve na flash e controla o núcleo","ST-Link, J-Link, placas Nucleo"]]',
                },
                {
                    type: "text",
                    value: "## Gravar, conferir, confiar\n\nGravar (o jargão é flashear) é copiar a imagem para a flash do chip, e dois caminhos dominam. O primeiro é o bootloader de fábrica: um código gravado em ROM que, acionado no reset, recebe o binário pela serial ou pelo USB; é assim que uma ESP32 se programa sem nenhum equipamento extra. O segundo é o depurador: uma sonda SWD ou JTAG, como o ST-Link embutido nas placas Nucleo, que escreve na flash e ainda permite parar o núcleo, inspecionar registradores e avançar instrução por instrução, assunto do módulo 6.\n\nDepois da escrita vem o verify: a ferramenta relê a flash e compara com o arquivo original. Parece paranoia até o dia em que uma gravação falha no meio, o chip fica com meia imagem e o produto passa a se comportar de um jeito que nenhuma linha do seu código explica. Gravou, conferiu: só então você tem certeza de que a placa roda o binário que você pensa que gravou. Faça do verify parte do gesto, não um extra.",
                },
                {
                    type: "quote",
                    value: "Entre o seu main.c e o LED existem quatro passos honestos: compilar cruzado, linkar no mapa certo, gravar na flash e conferir. Domine os quatro e nenhum build será mistério.",
                },
            ],
            questions: [
                {
                    statement: "O que é um compilador cruzado (cross-compiler)?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um compilador que gera código para outra arquitetura",
                            isCorrect: true,
                        },
                        {
                            text: "Um compilador que mistura C e assembly no mesmo arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "Um compilador que roda dentro do microcontrolador alvo",
                            isCorrect: false,
                        },
                        {
                            text: "Um compilador que converte C em Python automaticamente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No nome arm-none-eabi-gcc, o que o none indica?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O alvo roda sem sistema operacional por baixo",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador desativa as otimizações por padrão",
                            isCorrect: false,
                        },
                        {
                            text: "O binário gerado não tem símbolos de depuração",
                            isCorrect: false,
                        },
                        {
                            text: "A licença não permite uso comercial do código gerado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o passo de verify após a gravação do firmware?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Reler a flash e comparar com a imagem original gravada",
                            isCorrect: true,
                        },
                        {
                            text: "Assinar digitalmente o binário antes da primeira execução",
                            isCorrect: false,
                        },
                        {
                            text: "Medir a velocidade máxima de escrita da memória flash",
                            isCorrect: false,
                        },
                        {
                            text: "Apagar da flash os setores que o binário não utilizou",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a vantagem de gravar por depurador SWD em vez de bootloader?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O SWD também para o núcleo e inspeciona o chip por dentro",
                            isCorrect: true,
                        },
                        {
                            text: "O SWD grava binários maiores que o limite do bootloader",
                            isCorrect: false,
                        },
                        {
                            text: "O SWD dispensa qualquer hardware além do cabo USB comum",
                            isCorrect: false,
                        },
                        {
                            text: "O SWD converte o binário para o formato exigido pela ROM",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o arm-none-eabi-size reporta, e por que olhar em todo build?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O consumo de flash e RAM, o orçamento real do chip",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo estimado de execução de cada função compilada",
                            isCorrect: false,
                        },
                        {
                            text: "O total de linhas de código fonte de cada arquivo do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "A versão do compilador usada em cada objeto do binário",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O blink por registrador",
            blocks: [
                {
                    type: "text",
                    value: "# O hello world que explica tudo\n\nTodo ecossistema tem seu rito de iniciação, e em embarcados ele é o blink: um LED piscando. Só que nesta trilha você não vai chamar digitalWrite de biblioteca nenhuma. Vai fazer do jeito que revela a máquina: escrevendo valores nos endereços que a aula sobre o mapa de memória apresentou.\n\nO programa abaixo, completo, pisca o LED de uma placa Nucleo (pino PA5 de um STM32). Leia com calma antes da explicação: são três gestos. Ligar o clock do GPIOA, porque todo periférico nasce desligado para economizar energia. Configurar o pino 5 como saída no registrador de modo. E, no laço infinito, inverter o bit do pino e esperar um tanto.\n\nNote o for sem condição: firmware bare metal não termina, porque não existe sistema operacional para receber o controle de volta. E note o volatile no contador de espera, sem o qual o compilador apagaria o laço vazio por otimização. Esse detalhe é tão central que abre o módulo 2. Numa ESP32 os endereços mudam, o gesto é idêntico.",
                },
                {
                    type: "code",
                    value: "#include <stdint.h>\n\n#define RCC_AHB2ENR (*(volatile uint32_t *)0x4002104CUL)\n#define GPIOA_MODER (*(volatile uint32_t *)0x48000000UL)\n#define GPIOA_ODR   (*(volatile uint32_t *)0x48000014UL)\n\nint main(void) {\n    RCC_AHB2ENR |= 1u;           /* liga o clock do GPIOA        */\n    GPIOA_MODER &= ~(3u << 10);  /* limpa o modo do pino 5       */\n    GPIOA_MODER |=  (1u << 10);  /* pino 5 como saida (modo 01)  */\n    for (;;) {\n        GPIOA_ODR ^= (1u << 5);  /* inverte o LED                */\n        for (volatile uint32_t i = 0; i < 400000u; i++) { /* espera */ }\n    }\n}",
                },
                {
                    type: "table",
                    value: '[["Registrador","Endereço (exemplo)","Papel no blink"],["RCC_AHB2ENR","0x4002104C","Liga o clock do bloco GPIOA"],["GPIOA_MODER","0x48000000","Define o pino 5 como saída"],["GPIOA_ODR","0x48000014","Estado de saída: o bit 5 é o LED"]]',
                },
                {
                    type: "text",
                    value: "## Três escritas e um laço\n\nRCC_AHB2ENR |= 1 liga o clock do GPIOA. Sem isso, o bloco nem responde ao barramento e as escritas seguintes caem no vazio. Esquecer o clock do periférico é o bug número um de quem começa; grave o sintoma para a vida: registrador que lê sempre zero, como se o periférico estivesse mudo.\n\nGPIOA_MODER guarda 2 bits por pino, e o par de bits 11:10 controla o pino 5. O código primeiro limpa os dois bits e depois escreve 01, o modo saída. Repare no padrão ler-modificar-escrever com |= e &=: uma atribuição direta zeraria a configuração dos outros quinze pinos do porto, e é exatamente assim que se derruba o pino do cristal ou da UART sem entender o porquê.\n\nPor fim, GPIOA_ODR ^= (1 << 5) inverte só o bit do LED, e o laço com volatile queima ciclos para o olho humano enxergar o pisca. Espera ocupada é técnica de primeira aula: o módulo de timers aposenta esse truque com elegância e sem desperdiçar o processador.",
                },
                {
                    type: "quote",
                    value: "Do Arduino à HAL da ST, toda biblioteca de GPIO termina neste mesmo gesto: um valor escrito num endereço. Quem conhece o gesto usa a biblioteca por escolha, não por dependência.",
                },
            ],
            questions: [
                {
                    statement: "No blink por registrador, o que efetivamente acende o LED?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma escrita no bit do pino no registrador de saída ODR",
                            isCorrect: true,
                        },
                        {
                            text: "Uma chamada à função digitalWrite da biblioteca padrão",
                            isCorrect: false,
                        },
                        {
                            text: "O envio de um comando pela UART ao controlador do LED",
                            isCorrect: false,
                        },
                        {
                            text: "A leitura repetida do registrador de modo do porto GPIOA",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que é preciso ligar o clock do GPIOA antes de configurá-lo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Periféricos nascem desligados para economizar energia",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o clock apaga a configuração anterior dos pinos",
                            isCorrect: false,
                        },
                        {
                            text: "Para sincronizar o LED com a frequência da rede elétrica",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o GPIOA compartilha o cristal com o núcleo do chip",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o sintoma clássico de esquecer o clock de um periférico?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os registradores dele leem sempre zero, como se mudo",
                            isCorrect: true,
                        },
                        {
                            text: "O microcontrolador esquenta até acionar o reset térmico",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador acusa erro de endereço inválido no build",
                            isCorrect: false,
                        },
                        {
                            text: "A gravação do firmware falha na etapa de verify da flash",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que configurar o MODER com |= e &= em vez de atribuição direta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Para mudar só os bits do pino 5 e preservar os demais",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o registrador MODER só aceita operações bit a bit",
                            isCorrect: false,
                        },
                        {
                            text: "Para o código compilar sem avisos no modo pedante do GCC",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a atribuição direta é mais lenta que as bit a bit",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Sem o volatile, o que o compilador faria com o laço de espera vazio?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Removeria o laço, e o pisca ficaria rápido demais de ver",
                            isCorrect: true,
                        },
                        {
                            text: "Converteria o laço numa chamada à função de sleep do chip",
                            isCorrect: false,
                        },
                        {
                            text: "Manteria o laço, mas emitiria um erro fatal de compilação",
                            isCorrect: false,
                        },
                        {
                            text: "Trocaria o contador por uma interrupção de timer automática",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Falando com o hardware",
    aulas: [
        {
            titulo: "Registradores mapeados em memória e volatile",
            blocks: [
                {
                    type: "text",
                    value: "# A palavra-chave que separa os iniciados\n\nO módulo 1 mostrou que controlar hardware é ler e escrever endereços. Falta um detalhe que derruba todo iniciante: o compilador não sabe disso. Para o GCC, memória é memória: se o seu código lê o mesmo endereço duas vezes sem escrever nele no meio, a segunda leitura é desperdício, e o otimizador corta. Se escreve duas vezes seguidas, a primeira escrita some. Para variáveis comuns, essas transformações são exatamente o que você quer: código mais rápido, mesmo resultado.\n\nCom registradores de periférico, o modelo quebra. O registrador de status de uma UART muda sozinho quando um byte chega pelo fio: é o hardware escrevendo, fora do alcance do compilador. Uma leitura repetida nunca é desperdício, porque cada leitura pode trazer um valor novo.\n\nA ponte entre os dois mundos é a palavra-chave volatile. Ela avisa: este endereço muda por conta própria, não presuma nada, execute cada acesso de verdade e na ordem em que o código pede. Todo registrador mapeado em memória se declara volatile, sem exceção. O exemplo abaixo mostra o preço de esquecer.",
                },
                {
                    type: "code",
                    value: "/* Registrador de status da UART: o bit 0 indica byte recebido */\n#define UART_SR (*(volatile uint32_t *)0x40013800UL)\n\nuint32_t *sr = (uint32_t *)0x40013800UL;  /* versao SEM volatile */\n\n/* BUG classico: o compilador le *sr uma unica vez, conclui que\n   nada muda e transforma o teste num laco infinito.            */\nwhile ((*sr & 1u) == 0u) { }\n\n/* Correto: cada iteracao rele o registrador de verdade. */\nwhile ((UART_SR & 1u) == 0u) { }",
                },
                {
                    type: "text",
                    value: "## O que o volatile promete, e o que não\n\nA promessa é estreita e precisa: todo acesso a um objeto volatile acontece de fato, no tamanho declarado, e os acessos volatile não são reordenados entre si pelo compilador. É o suficiente para conversar com registradores e para uma flag compartilhada com uma interrupção, que você verá em duas aulas.\n\nO que o volatile não promete é igualmente importante. Ele não torna o acesso atômico: num Cortex-M de 32 bits, ler um uint32_t é uma instrução só, mas um uint64_t são duas, e uma interrupção pode cair no meio. Ele não cria exclusão mútua, não é barreira de memória para o processador e não substitui desabilitar interrupções na seção crítica. Quem trata volatile como talismã de concorrência escreve bugs raros e irreproduzíveis, os piores.\n\nNa prática profissional você raramente digita o endereço cru: os headers do fabricante (padrão CMSIS) definem structs em que cada campo é um registrador volatile, e um ponteiro para a base do periférico. A tabela abaixo resume o contrato para consulta rápida.",
                },
                {
                    type: "table",
                    value: '[["Pergunta","O volatile garante?"],["Cada leitura vai mesmo ao endereço","Sim"],["Cada escrita chega mesmo ao endereço","Sim"],["Ordem entre acessos volatile","Sim, entre si"],["Atomicidade do acesso","Não"],["Exclusão mútua com interrupções","Não"]]',
                },
                {
                    type: "quote",
                    value: "volatile não é talismã de concorrência: é só a promessa de que cada acesso acontece. Atomicidade, ordem no processador e exclusão mútua continuam sendo problema seu.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve o volatile num registrador mapeado em memória?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Obrigar o compilador a executar cada leitura e escrita",
                            isCorrect: true,
                        },
                        {
                            text: "Impedir que outras funções alterem o valor do endereço",
                            isCorrect: false,
                        },
                        {
                            text: "Marcar a variável para ser guardada na flash, não na RAM",
                            isCorrect: false,
                        },
                        {
                            text: "Acelerar o acesso usando um registrador interno do núcleo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o bug clássico de esquecer o volatile num loop de espera?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O compilador lê uma vez e o laço vira espera infinita",
                            isCorrect: true,
                        },
                        {
                            text: "O laço passa a consumir o dobro da energia calculada",
                            isCorrect: false,
                        },
                        {
                            text: "O registrador é zerado a cada iteração do laço de espera",
                            isCorrect: false,
                        },
                        {
                            text: "O binário cresce até estourar o espaço livre da flash",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o volatile NÃO garante num firmware com interrupções?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Atomicidade e exclusão mútua entre código e interrupção",
                            isCorrect: true,
                        },
                        {
                            text: "Que a leitura do registrador aconteça a cada iteração",
                            isCorrect: false,
                        },
                        {
                            text: "Que a escrita chegue de fato ao endereço do periférico",
                            isCorrect: false,
                        },
                        {
                            text: "Que acessos volatile não sejam removidos na otimização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que os headers CMSIS declaram os campos das structs de periférico como volatile?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Porque o hardware muda os registradores fora do programa",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o padrão C exige volatile em todo campo de struct",
                            isCorrect: false,
                        },
                        {
                            text: "Para o linker posicionar a struct na faixa de periféricos",
                            isCorrect: false,
                        },
                        {
                            text: "Para impedir a cópia acidental da struct por atribuição",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num Cortex-M de 32 bits, por que um contador volatile de 64 bits ainda é perigoso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O acesso usa duas instruções e a ISR pode cair no meio",
                            isCorrect: true,
                        },
                        {
                            text: "O volatile só funciona em variáveis de até 16 bits",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador guarda os 32 bits altos na flash do chip",
                            isCorrect: false,
                        },
                        {
                            text: "O barramento arredonda valores maiores que 32 bits",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "GPIO",
            blocks: [
                {
                    type: "text",
                    value: "# O pino como cidadão de vários modos\n\nGPIO significa entrada e saída de propósito geral, e o nome entrega a natureza: o mesmo pino físico serve a papéis diferentes conforme a configuração. Como entrada, ele lê o nível lógico que o mundo impõe: botão, sensor digital, sinal de outro chip. Como saída, ele impõe o nível: acende LED, aciona relé, habilita um módulo. No modo de função alternativa, você entrega o pino a um periférico interno, e ele vira TX de UART, saída de PWM ou pino de SPI sem que o seu código toque nele byte a byte. E no modo analógico a parte digital se desliga para o ADC medir tensão sem interferência.\n\nHá ainda o detalhe elétrico da saída: push-pull, em que o pino dirige ativamente tanto o nível alto quanto o baixo, e open-drain, em que ele só puxa para baixo e depende de um resistor para subir, arranjo que o I2C vai exigir no módulo 3.\n\nDominar GPIO é dominar a tabela de modos abaixo e saber qual pergunta cada projeto faz: quem define o nível deste fio quando ninguém está falando?",
                },
                {
                    type: "table",
                    value: '[["Modo","O que faz","Exemplo de uso"],["Entrada","Lê o nível lógico imposto de fora","Botão, sensor digital"],["Saída","Impõe nível alto ou baixo","LED, relé, pino de enable"],["Função alternativa","Entrega o pino a um periférico","UART TX, PWM de timer, SPI"],["Analógico","Desliga a parte digital do pino","Entrada do ADC, saída do DAC"]]',
                },
                {
                    type: "text",
                    value: "## Pull-up, pull-down e o botão que treme\n\nUma entrada digital sem nada conectado não lê zero: lê ruído. O pino flutua, captando interferência como uma antena minúscula, e o firmware enxerga uma sequência aleatória de uns e zeros. Por isso existem os resistores de pull-up e pull-down, internos na maioria dos chips modernos: eles definem o nível de descanso do pino quando ninguém o dirige. O arranjo clássico de botão usa pull-up interno com o botão ligado ao terra: solto lê 1, apertado lê 0.\n\nResolvido o repouso, aparece o segundo problema: o mundo físico treme. Um contato mecânico não fecha de uma vez; ele quica durante alguns milissegundos, gerando uma rajada de transições antes de assentar. Sem tratamento, um aperto vira dez cliques. O nome do tratamento é debounce, e a versão mais simples em software tem duas leituras: viu o nível mudar, espere uns 20 milissegundos e confirme. Se a segunda leitura mantém o valor, o evento é real.\n\nO código abaixo implementa exatamente isso. Versões mais elegantes usam timers e amostragem periódica, mas a lógica de fundo não muda: desconfie da primeira leitura.",
                },
                {
                    type: "code",
                    value: "/* Botao em PA0 com pull-up interno: solto = 1, apertado = 0 */\n#define GPIOA_IDR (*(volatile uint32_t *)0x48000010UL)\n\nbool botao_apertado(void) {\n    if ((GPIOA_IDR & 1u) == 0u) {      /* possivel aperto     */\n        delay_ms(20);                  /* espera o tremor     */\n        return (GPIOA_IDR & 1u) == 0u; /* confirma a leitura  */\n    }\n    return false;\n}",
                },
                {
                    type: "quote",
                    value: "O mundo físico treme: todo contato metálico quica antes de assentar. Firmware que ignora isso conta um aperto como dez, e o usuário jura que o produto tem vida própria.",
                },
            ],
            questions: [
                {
                    statement: "O que faz o modo de função alternativa de um pino GPIO?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Entrega o controle do pino a um periférico interno",
                            isCorrect: true,
                        },
                        {
                            text: "Alterna o pino entre entrada e saída a cada ciclo",
                            isCorrect: false,
                        },
                        {
                            text: "Permite ligar dois dispositivos no mesmo pino físico",
                            isCorrect: false,
                        },
                        {
                            text: "Inverte a lógica do pino, trocando alto por baixo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o resistor de pull-up numa entrada com botão?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Definir nível 1 estável quando o botão está solto",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar a corrente que o botão entrega ao pino",
                            isCorrect: false,
                        },
                        {
                            text: "Proteger o chip contra curto-circuito no conector",
                            isCorrect: false,
                        },
                        {
                            text: "Acelerar a leitura do pino pelo barramento interno",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que acontece com uma entrada digital deixada flutuando?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela lê valores aleatórios ao sabor do ruído elétrico",
                            isCorrect: true,
                        },
                        {
                            text: "Ela assume nível baixo por padrão em qualquer chip",
                            isCorrect: false,
                        },
                        {
                            text: "Ela desativa o porto inteiro até o próximo reset",
                            isCorrect: false,
                        },
                        {
                            text: "Ela consome a corrente máxima do regulador da placa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que um botão mecânico precisa de debounce?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O contato quica e gera vários pulsos num só aperto",
                            isCorrect: true,
                        },
                        {
                            text: "O pull-up interno demora segundos para carregar o pino",
                            isCorrect: false,
                        },
                        {
                            text: "O porto GPIO amostra o pino só uma vez por segundo",
                            isCorrect: false,
                        },
                        {
                            text: "O metal do contato acumula carga e inverte a leitura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No debounce por software da aula, por que reler o pino depois de 20 ms?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Confirma que o nível se manteve depois do tremor",
                            isCorrect: true,
                        },
                        {
                            text: "Dá tempo de o compilador atualizar o registrador",
                            isCorrect: false,
                        },
                        {
                            text: "Garante que a interrupção do pino já foi apagada",
                            isCorrect: false,
                        },
                        {
                            text: "Evita que o pull-up interno sature com a corrente",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Interrupções externas",
            blocks: [
                {
                    type: "text",
                    value: "# Quando o hardware puxa a sua manga\n\nAté aqui o firmware pergunta: lê o pino, lê de novo, lê mais uma vez. Esse padrão, polling, funciona e tem seu lugar, mas desperdiça o processador e arrisca perder eventos curtos entre uma leitura e outra. A alternativa inverte o fluxo: o hardware avisa. Configure uma interrupção externa e, no instante em que o pino muda, o núcleo suspende o que estiver fazendo, executa uma função sua e volta como se nada tivesse acontecido.\n\nNos STM32 esse bloco se chama EXTI: você escolhe o pino e a borda que dispara, de subida, de descida ou ambas. Entre o pino e o núcleo fica o NVIC, o controlador de interrupções do Cortex-M, que decide o que pode interromper o quê: cada fonte tem uma prioridade, e vale a convenção de que número menor significa urgência maior, com direito a preempção de uma ISR por outra mais prioritária.\n\nA função chamada é a ISR (rotina de serviço de interrupção), e escrever ISRs boas é uma pequena disciplina com regras que valem para qualquer arquitetura, em 2026 e daqui a vinte anos. A tabela e o código abaixo as resumem.",
                },
                {
                    type: "table",
                    value: '[["Conceito","O que é","Cuidado prático"],["EXTI","Interrupção disparada por borda num pino","Escolher a borda certa: subida, descida, ambas"],["NVIC","Controlador de interrupções do Cortex-M","Número menor de prioridade = mais urgente"],["ISR","Função chamada pelo hardware no evento","Curta, sem bloqueio, sem trabalho pesado"],["Flag de pending","Registro de que o evento ocorreu","Limpar na ISR, ou ela reentra para sempre"]]',
                },
                {
                    type: "code",
                    value: "volatile bool botao_evento = false;\n\nvoid EXTI0_IRQHandler(void) {\n    EXTI_PR = (1u << 0);    /* limpa o pending do pino 0   */\n    botao_evento = true;    /* so registra o evento        */\n}\n\nint main(void) {\n    configurar_gpio_e_exti();\n    for (;;) {\n        if (botao_evento) {\n            botao_evento = false;\n            tratar_botao();  /* trabalho pesado fora da ISR */\n        }\n    }\n}",
                },
                {
                    type: "text",
                    value: "## As regras de sempre\n\nPrimeira regra: ISR curta. Enquanto ela executa, todo o resto espera, inclusive outras interrupções de prioridade igual ou menor. O padrão profissional é o do código acima: a ISR limpa a flag de pending do hardware, registra o evento numa variável volatile e devolve o controle; o trabalho de verdade acontece no laço principal. Nada de printf, nada de esperar periférico, nada de laço demorado dentro da ISR.\n\nSegunda regra: limpe o pending. O hardware anota que o evento ocorreu; se a ISR retorna sem limpar essa anotação, o NVIC a chama de novo imediatamente, e o firmware vive um dia da marmota em que o main nunca mais roda.\n\nTerceira regra: compartilhe com cuidado. A variável que a ISR escreve e o main lê precisa ser volatile, e se tiver mais de uma palavra de largura, o main deve lê-la com as interrupções brevemente desabilitadas, a seção crítica mínima. São as regras de sempre porque toda plataforma as repete: mude o nome do registrador, a disciplina continua idêntica.",
                },
                {
                    type: "quote",
                    value: "ISR boa é bilheteira, não orquestra: registra que o evento chegou e devolve o palco. O concerto inteiro acontece no laço principal.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a vantagem da interrupção sobre o polling de um pino?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O núcleo só é acionado quando o evento acontece",
                            isCorrect: true,
                        },
                        {
                            text: "A interrupção lê o pino com maior resolução de tensão",
                            isCorrect: false,
                        },
                        {
                            text: "O polling funciona somente com o clock máximo do chip",
                            isCorrect: false,
                        },
                        {
                            text: "A interrupção dispensa a configuração do modo do pino",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No Cortex-M, qual é o papel do NVIC?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Gerenciar habilitação e prioridade das interrupções",
                            isCorrect: true,
                        },
                        {
                            text: "Converter os sinais analógicos dos pinos em digitais",
                            isCorrect: false,
                        },
                        {
                            text: "Distribuir o clock entre os periféricos do barramento",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar o codigo das ISRs numa memória mais rápida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que uma ISR deve ser curta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Enquanto ela roda, atrasa tudo de prioridade menor",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o compilador limita o tamanho do código de ISR",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a pilha usada pela ISR fica na flash, mais lenta",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o NVIC desliga o clock do núcleo durante a ISR",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que acontece se a ISR não limpar a flag de pending do EXTI?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela é chamada de novo sem parar e o main não roda",
                            isCorrect: true,
                        },
                        {
                            text: "O NVIC promove a interrupção para prioridade máxima",
                            isCorrect: false,
                        },
                        {
                            text: "O pino correspondente fica travado em nível alto",
                            isCorrect: false,
                        },
                        {
                            text: "O chip dispara imediatamente um reset por watchdog",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No NVIC do Cortex-M, o que significa um número menor de prioridade?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Urgência maior: pode preemptar as de número maior",
                            isCorrect: true,
                        },
                        {
                            text: "Urgência menor, seguindo a convenção usada no Linux",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas a ordem de configuração, sem efeito na execução",
                            isCorrect: false,
                        },
                        {
                            text: "O limite de vezes que a interrupção pode ser aninhada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Timers e PWM",
            blocks: [
                {
                    type: "text",
                    value: "# Contar tempo é trabalho de hardware\n\nO blink do módulo 1 esperava queimando ciclos num laço, e você sentiu o problema: enquanto conta, o processador não faz mais nada, e a contagem muda se o compilador ou o clock mudarem. A resposta madura é delegar o tempo a um periférico feito para isso: o timer.\n\nUm timer é um contador em hardware alimentado pelo clock do chip, com duas alavancas principais. O prescaler divide o clock antes de contar: com 16 MHz de entrada e prescaler dividindo por 16, o contador avança um milhão de vezes por segundo. O auto-reload define onde a contagem reinicia: contando até 1000 naquele ritmo, o ciclo completo dura um milissegundo. A cada reinício o timer pode disparar uma interrupção, e pronto: você tem um tique periódico e preciso, sem ocupar o núcleo. O SysTick, timer que todo Cortex-M carrega, existe exatamente para dar esse batimento ao sistema.\n\nA segunda vocação do timer é gerar sinal. Com um canal de comparação, ele vira o pino sozinho ao cruzar um valor, e disso nasce o PWM que a tabela abaixo desmonta.",
                },
                {
                    type: "table",
                    value: '[["Termo","Significado","Exemplo com clock de 16 MHz"],["Prescaler","Divide o clock antes do contador","16 MHz / 16 = 1 MHz de contagem"],["Auto-reload (ARR)","Onde o contador reinicia","1000 contagens = período de 1 ms"],["Compare (CCR)","Alvo que vira o pino no caminho","Pino alto até a contagem 250"],["Duty cycle","Fração do período em nível alto","250 de 1000 = 25% de brilho"]]',
                },
                {
                    type: "code",
                    value: "/* PWM de 1 kHz com duty de 25% (clock de 16 MHz) */\nTIM2_PSC  = 15u;    /* 16 MHz / (15+1) = 1 MHz de contagem */\nTIM2_ARR  = 999u;   /* 1 MHz / 1000 = periodo de 1 kHz     */\nTIM2_CCR1 = 250u;   /* alto durante 250 de 1000: 25%       */\nTIM2_CCER |= 1u;    /* habilita a saida do canal 1          */\nTIM2_CR1  |= 1u;    /* liga o contador                      */",
                },
                {
                    type: "text",
                    value: "## Duty cycle, LED e servo\n\nPWM é um truque honesto: o pino só conhece ligado e desligado, mas alternando rápido entre os dois você controla a energia média entregue. A fração do período em que o sinal fica alto é o duty cycle. Num LED, 25% de duty parece um quarto do brilho, porque o olho integra o pisca veloz. Num motor DC, o duty vira velocidade. E o melhor: depois de configurado, o hardware sustenta o sinal indefinidamente, com o processador dormindo ou ocupado em outra coisa.\n\nO servo motor de modelismo merece menção porque inverte a intuição: ele não quer duty proporcional, quer largura de pulso. O padrão é um pulso a cada 20 milissegundos (50 Hz), com largura entre 1 e 2 milissegundos definindo o ângulo do braço. Com a receita da tabela você monta isso em três linhas: prescaler para 1 MHz de contagem, auto-reload de 20000, compare entre 1000 e 2000.\n\nFica a regra de projeto: se o processador está contando tempo num laço, um timer está desempregado. Delegue.",
                },
                {
                    type: "quote",
                    value: "Depois que o timer assume o tempo, o processador fica livre para pensar. Deixar hardware fazer trabalho de hardware é a elegância fundamental do firmware.",
                },
            ],
            questions: [
                {
                    statement: "O que é o duty cycle de um sinal PWM?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A fração do período em que o sinal fica em nível alto",
                            isCorrect: true,
                        },
                        {
                            text: "A frequência máxima que o timer consegue alcançar",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo que o contador leva para iniciar a contagem",
                            isCorrect: false,
                        },
                        {
                            text: "A tensão de pico entregue pelo pino durante o pulso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o papel do prescaler num timer?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dividir o clock de entrada antes da contagem",
                            isCorrect: true,
                        },
                        {
                            text: "Multiplicar o clock para contagens mais finas",
                            isCorrect: false,
                        },
                        {
                            text: "Limitar a corrente entregue ao pino de saída",
                            isCorrect: false,
                        },
                        {
                            text: "Zerar o contador quando o valor máximo chega",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com clock de 16 MHz, prescaler dividindo por 16 e auto-reload de 1000, qual o período?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "1 ms: contagem a 1 MHz reiniciando a cada 1000",
                            isCorrect: true,
                        },
                        {
                            text: "1 s: o auto-reload define sempre segundos inteiros",
                            isCorrect: false,
                        },
                        {
                            text: "16 ms: o prescaler não afeta o ritmo da contagem",
                            isCorrect: false,
                        },
                        {
                            text: "62,5 ns: um ciclo do clock de entrada do periférico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que gerar PWM por hardware em vez de alternar o pino no código?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O timer mantém o sinal sozinho, sem ocupar o núcleo",
                            isCorrect: true,
                        },
                        {
                            text: "O código em C não alcança frequências acima de 1 Hz",
                            isCorrect: false,
                        },
                        {
                            text: "O pino só aceita escrita quando um timer está ligado",
                            isCorrect: false,
                        },
                        {
                            text: "O PWM por software desgasta a flash a cada transição",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual sinal de controle um servo de modelismo padrão espera?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Pulsos a 50 Hz com largura entre 1 e 2 milissegundos",
                            isCorrect: true,
                        },
                        {
                            text: "Uma tensão analógica contínua entre 0 e 5 volts fixos",
                            isCorrect: false,
                        },
                        {
                            text: "Um trem de pulsos I2C com o ângulo em dois bytes",
                            isCorrect: false,
                        },
                        {
                            text: "Pulsos de 1 kHz com duty proporcional à velocidade",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "ADC e DAC",
            blocks: [
                {
                    type: "text",
                    value: "# A ponte entre dois mundos\n\nSensores falam tensão: um termistor, um potenciômetro, um sensor de corrente entregam volts variando continuamente. O processador fala número. O tradutor é o ADC, conversor analógico-digital, e as três palavras que definem sua qualidade são resolução, referência e taxa.\n\nResolução é o número de degraus da régua: um ADC de 12 bits divide a escala em 4096 níveis. A referência (Vref) é o fundo da régua: se Vref é 3,3 V, o valor 4095 significa 3,3 V e cada degrau vale cerca de 0,8 mV. A conta de conversão é sempre a mesma regra de três: tensão = leitura vezes Vref dividido por 4095. Se a referência oscila, a régua estica e encolhe, e nenhuma resolução salva a medida: por isso placas sérias cuidam tanto da estabilidade do Vref.\n\nA taxa de amostragem diz quantas medidas por segundo o conversor tira. Para reconstruir um sinal que varia, vale o critério de Nyquist: amostre a pelo menos o dobro da frequência mais alta presente, ou o sinal aparece disfarçado de outro, o efeito de aliasing.\n\nO DAC faz o caminho inverso: recebe número, entrega tensão.",
                },
                {
                    type: "table",
                    value: '[["Parâmetro","O que define","Exemplo: ADC 12 bits, Vref 3,3 V"],["Resolução","Quantos degraus a régua tem","4096 níveis, passo de 0,8 mV"],["Referência (Vref)","O fundo de escala da régua","Leitura 4095 corresponde a 3,3 V"],["Taxa de amostragem","Medidas por segundo","Sinal de 1 kHz pede 2 ksps ou mais"],["Aliasing","Sinal disfarçado por amostrar pouco","1,9 kHz amostrado a 2 ksps vira 100 Hz"]]',
                },
                {
                    type: "code",
                    value: "/* Leitura de um sensor no canal 3 do ADC (12 bits, Vref 3,3 V) */\nADC1_SQR1 = 3u;                        /* canal 3 na sequencia */\nADC1_CR  |= ADC_ADSTART;               /* dispara a conversao  */\nwhile ((ADC1_ISR & ADC_EOC) == 0u) { } /* espera terminar      */\n\nuint16_t bruto = ADC1_DR;              /* 0..4095              */\nfloat volts = (bruto * 3.3f) / 4095.0f;",
                },
                {
                    type: "text",
                    value: "## Ler direito é mais que ler\n\nO número que sai do ADC parece exato e não é: é uma medida, com ruído em cima. A defesa mais barata é estatística: tire várias amostras seguidas e use a média, ou uma média móvel se a leitura é contínua. Dezesseis amostras médias custam microssegundos e limpam a maior parte do chuvisco; técnicas de oversampling formalizam isso e chegam a ganhar bits efetivos de resolução.\n\nDois cuidados de circuito completam a leitura honesta. Primeiro, o tempo de amostragem: o ADC carrega um capacitor interno a partir do seu sensor, e sensores de alta impedância precisam de mais tempo de carga, configurável no periférico; apresse demais e a leitura sai baixa. Segundo, o layout: trilhas analógicas longas ao lado de sinais chaveados captam interferência, tema que o módulo de robustez retoma.\n\nDo outro lado da ponte, o DAC transforma número em tensão para gerar formas de onda e áudio simples. Nem todo chip o traz, e um PWM filtrado por um resistor e um capacitor cobre boa parte dos casos com um centavo de componentes.",
                },
                {
                    type: "quote",
                    value: "O número que o ADC entrega parece exato, mas é uma medida: tem ruído, tem escala e tem contexto. Trate-o como medida e o sensor fala a verdade.",
                },
            ],
            questions: [
                {
                    statement: "O que significa um ADC ter 12 bits de resolução?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A escala de medida tem 4096 níveis possíveis",
                            isCorrect: true,
                        },
                        {
                            text: "Ele lê no máximo 12 canais diferentes por vez",
                            isCorrect: false,
                        },
                        {
                            text: "Cada conversão demora exatamente 12 ciclos",
                            isCorrect: false,
                        },
                        {
                            text: "O valor lido ocupa 12 bytes na memória RAM",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o papel da tensão de referência (Vref) do ADC?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Definir o fundo de escala: Vref é o valor máximo",
                            isCorrect: true,
                        },
                        {
                            text: "Alimentar o sensor analógico ligado à entrada",
                            isCorrect: false,
                        },
                        {
                            text: "Filtrar o ruído da fonte antes de cada conversão",
                            isCorrect: false,
                        },
                        {
                            text: "Calibrar o clock do conversor depois do reset",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pelo critério de Nyquist, um sinal de 1 kHz pede amostragem mínima de:",
                    difficulty: "medio",
                    options: [
                        {
                            text: "2000 amostras por segundo, o dobro da frequência",
                            isCorrect: true,
                        },
                        {
                            text: "1000 amostras por segundo, uma por ciclo do sinal",
                            isCorrect: false,
                        },
                        {
                            text: "500 amostras por segundo, metade já é suficiente",
                            isCorrect: false,
                        },
                        {
                            text: "Depende da resolução em bits, não da frequência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como reduzir por software o ruído de uma leitura analógica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Tirar a média de várias amostras consecutivas",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar a resolução configurada do conversor",
                            isCorrect: false,
                        },
                        {
                            text: "Ler o canal uma única vez e reaproveitar o valor",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o pino de entrada a cada nova conversão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num ADC de 12 bits com Vref de 3,3 V, a leitura 2048 indica cerca de:",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "1,65 V, metade do fundo de escala da conversão",
                            isCorrect: true,
                        },
                        {
                            text: "2,05 V, o valor bruto dividido por mil no código",
                            isCorrect: false,
                        },
                        {
                            text: "3,30 V, pois 2048 já satura a escala do conversor",
                            isCorrect: false,
                        },
                        {
                            text: "0,82 V, um quarto do fundo de escala da conversão",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Protocolos de comunicação",
    aulas: [
        {
            titulo: "UART",
            blocks: [
                {
                    type: "text",
                    value: "# A conversa mais antiga que ainda funciona\n\nA UART é o protocolo serial mais velho em uso corrente, e continua em todo projeto por um motivo: simplicidade honesta. Dois fios de sinal, TX de um lado cruzado com RX do outro, e nenhum fio de clock. Como não há clock compartilhado, a comunicação é assíncrona: os dois lados combinam de antemão a velocidade, o baud rate, e cada um cronometra os bits por conta própria.\n\nO frame é uma pequena coreografia. Em repouso, a linha fica em nível alto. Quando um byte vai partir, o transmissor derruba a linha por um tempo de bit: é o start bit, o aviso de atenção. Seguem os bits de dados, tipicamente oito, do menos significativo para o mais significativo. Pode vir então um bit de paridade opcional, conferência simples de erro, e por fim um ou dois stop bits em nível alto, devolvendo a linha ao repouso. A configuração mais comum do planeta é 8N1: oito bits de dados, sem paridade, um stop bit.\n\nO receptor, sabendo o baud rate, amostra a linha no meio de cada tempo de bit e remonta o byte. Nenhuma mágica: cronômetro e disciplina.",
                },
                {
                    type: "table",
                    value: '[["Parte do frame","Tamanho","Papel"],["Start bit","1 bit","Linha cai de 1 para 0: um byte vem aí"],["Dados","5 a 9 bits (8 é o comum)","O conteúdo, do bit menos significativo"],["Paridade","0 ou 1 bit","Conferência simples e opcional de erro"],["Stop","1 ou 2 bits","Devolve a linha ao repouso em nível 1"]]',
                },
                {
                    type: "code",
                    value: "/* UART a 115200 baud, formato 8N1 */\nUSART2_BRR  = SystemCoreClock / 115200u;   /* divisor do baud  */\nUSART2_CR1 |= USART_UE | USART_TE | USART_RE;\n\nvoid uart_putc(char c) {\n    while ((USART2_ISR & USART_TXE) == 0u) { } /* espera vaga   */\n    USART2_TDR = (uint8_t)c;\n}\n\nvoid uart_puts(const char *s) {\n    while (*s != '\\0') { uart_putc(*s++); }\n}",
                },
                {
                    type: "text",
                    value: "## Baud rate e o lugar da UART em 2026\n\nO acordo de velocidade é frágil por natureza: se um lado transmite a 115200 e o outro escuta a 9600, os bits são fatiados no lugar errado e o terminal mostra lixo aleatório. Erros de poucos por cento de clock a eletrônica tolera, porque o receptor se realinha a cada start bit; mais que isso, a conversa desanda. Quando vir caracteres estranhos no monitor serial, o primeiro suspeito é sempre o baud rate.\n\nOnde a UART brilha em 2026: no console de debug, despejando logs e printf para o seu terminal, papel que o módulo 6 explora; nos módulos GPS, que falam sentenças NMEA pela serial desde os anos 80; nos módulos de rádio, celular e Bluetooth comandados por comandos AT; e no bootloader serial que você conheceu no módulo 1. É sempre conversa de um para um, sem endereço nem seleção: para vários dispositivos no mesmo fio, os próximos protocolos servem melhor.\n\nUm aviso de bancada: os níveis lógicos precisam casar. UART de 3,3 V conversa com 3,3 V; o padrão RS-232 do PC antigo usa tensões maiores e exige conversor, e o RS-485 estica a serial por centenas de metros.",
                },
                {
                    type: "quote",
                    value: "Sem fio de clock, a UART é um acordo de cavalheiros: os dois lados prometem a mesma velocidade e cumprem. Quando um mente 5%, o que chega é lixo.",
                },
            ],
            questions: [
                {
                    statement: "O que marca o início de um frame UART?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O start bit: a linha ociosa em 1 cai para 0",
                            isCorrect: true,
                        },
                        {
                            text: "Um pulso de clock enviado pelo transmissor",
                            isCorrect: false,
                        },
                        {
                            text: "O bit de paridade enviado antes dos dados",
                            isCorrect: false,
                        },
                        {
                            text: "Um byte de sincronismo com o valor 0xFF",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que transmissor e receptor precisam combinar o baud rate?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Não há fio de clock: cada lado cronometra sozinho",
                            isCorrect: true,
                        },
                        {
                            text: "O baud define a tensão elétrica usada na linha",
                            isCorrect: false,
                        },
                        {
                            text: "O receptor rejeita frames com paridade diferente",
                            isCorrect: false,
                        },
                        {
                            text: "A norma exige velocidade igual em toda a placa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que aparece no terminal quando os baud rates dos dois lados divergem muito?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Caracteres aleatórios: os bits são fatiados errado",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: a UART detecta o erro e silencia a linha",
                            isCorrect: false,
                        },
                        {
                            text: "Os mesmos caracteres, apenas em ordem invertida",
                            isCorrect: false,
                        },
                        {
                            text: "Um aviso de erro enviado pelo próprio receptor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em quais casos a UART segue sendo a escolha natural em 2026?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Console de debug, GPS e módulos com comandos AT",
                            isCorrect: true,
                        },
                        {
                            text: "Displays rápidos que exigem dezenas de megabits",
                            isCorrect: false,
                        },
                        {
                            text: "Vários sensores endereçados num barramento único",
                            isCorrect: false,
                        },
                        {
                            text: "Sinais analógicos que precisam de amostragem fina",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa a configuração 8N1 de uma porta serial?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "8 bits de dados, sem paridade e 1 stop bit",
                            isCorrect: true,
                        },
                        {
                            text: "8 dispositivos, nenhum mestre e 1 escravo",
                            isCorrect: false,
                        },
                        {
                            text: "8 kbps de velocidade com 1 bit de paridade",
                            isCorrect: false,
                        },
                        {
                            text: "8 frames por pacote e 1 byte de checksum",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "SPI",
            blocks: [
                {
                    type: "text",
                    value: "# Velocidade a quatro fios\n\nQuando a conversa precisa de banda, o SPI entra em cena. É um barramento síncrono com papéis claros: um mestre, que comanda, e um ou mais escravos. Quatro fios fazem o serviço: SCK, o clock que o mestre gera e que dita o ritmo de cada bit; MOSI, dados do mestre para o escravo; MISO, dados do escravo para o mestre; e CS, o chip select que aponta com quem o mestre está falando, normalmente ativo em nível baixo.\n\nO mecanismo por baixo é elegante: mestre e escravo são dois registradores de deslocamento ligados em anel. A cada pulso de clock, um bit sai de um lado e um bit entra do outro, simultaneamente. Por isso o SPI é full duplex por natureza: toda transferência é uma troca. Para apenas ler, o mestre envia um byte qualquer (0xFF, por convenção) só para girar o anel; para apenas escrever, ignora o que voltou.\n\nComo há fio de clock, não existe acordo cego de velocidade: o escravo segue o ritmo imposto, e esse ritmo pode ser alto, dezenas de megahertz nos componentes comuns. Displays coloridos, cartões SD e memórias flash externas vivem de SPI por isso.",
                },
                {
                    type: "table",
                    value: '[["Fio","Nome","Papel"],["SCK","Serial Clock","O mestre dita o ritmo de cada bit"],["MOSI","Master Out, Slave In","Dados do mestre para o escravo"],["MISO","Master In, Slave Out","Dados do escravo para o mestre"],["CS (ou SS)","Chip Select","Seleciona o escravo, ativo em nível baixo"]]',
                },
                {
                    type: "code",
                    value: "uint8_t spi_troca(uint8_t enviado) {\n    SPI1_DR = enviado;                     /* alimenta o anel   */\n    while ((SPI1_SR & SPI_RXNE) == 0u) { } /* espera o retorno  */\n    return (uint8_t)SPI1_DR;               /* byte que voltou   */\n}\n\n/* Ler um registrador de um sensor SPI tipico: */\ncs_baixo();\nspi_troca(0x80 | REG_ID);   /* comando de leitura        */\nuint8_t id = spi_troca(0xFF); /* dummy so para receber   */\ncs_alto();",
                },
                {
                    type: "text",
                    value: "## Chip select, modos e o preço da simplicidade\n\nCada escravo precisa do seu próprio fio de CS: dois displays e um cartão SD são três pinos de seleção saindo do mestre, além dos três fios compartilhados. É o custo de escalar o SPI, e a razão de ele reinar em ligações com poucos dispositivos rápidos, não em redes de muitos sensores.\n\nAntes de falar com um componente novo, confira o modo. O SPI tem quatro, numerados de 0 a 3, combinando duas escolhas: CPOL, o nível de repouso do clock, e CPHA, em qual borda o dado é amostrado. O datasheet do escravo declara o modo que ele espera; configure o mestre igual ou os bytes chegam deslocados, o clássico bug do valor pela metade. Modo 0 é o mais comum, mas nunca chute.\n\nNote o que o SPI não tem: endereço, confirmação de recebimento, detecção de erro. O mestre fala com quem o CS aponta e confia. Essa ausência de cerimônia é exatamente o que compra a velocidade; quando a integridade importa, a responsabilidade sobe para a camada de aplicação, assunto da última aula deste módulo.",
                },
                {
                    type: "quote",
                    value: "SPI é uma dança de par: a cada bit que sai do mestre, um bit volta do escravo. Não existe enviar sem receber, só fingir que o retorno não interessa.",
                },
            ],
            questions: [
                {
                    statement: "Quem gera o clock num barramento SPI?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O mestre, sempre: o SCK dita o ritmo dos bits",
                            isCorrect: true,
                        },
                        {
                            text: "O escravo mais rápido conectado ao barramento",
                            isCorrect: false,
                        },
                        {
                            text: "Um cristal dedicado compartilhado pelos chips",
                            isCorrect: false,
                        },
                        {
                            text: "Cada lado alterna o clock a cada byte trocado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o fio de chip select (CS)?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Escolher qual escravo participa da conversa",
                            isCorrect: true,
                        },
                        {
                            text: "Alimentar o escravo durante a transferência",
                            isCorrect: false,
                        },
                        {
                            text: "Sinalizar erros de paridade para o mestre",
                            isCorrect: false,
                        },
                        {
                            text: "Dobrar a velocidade quando fica em nível alto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o SPI acomoda vários escravos no mesmo barramento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada escravo exige um fio de CS próprio do mestre",
                            isCorrect: true,
                        },
                        {
                            text: "Cada escravo recebe um endereço de 7 bits único",
                            isCorrect: false,
                        },
                        {
                            text: "Os escravos se revezam no clock automaticamente",
                            isCorrect: false,
                        },
                        {
                            text: "Um escravo repassa os dados ao seguinte, em anel",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o SPI alcança velocidades bem maiores que o I2C?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Linhas dedicadas, sem protocolo de endereço ou ack",
                            isCorrect: true,
                        },
                        {
                            text: "Os fios do SPI usam tensões maiores que os do I2C",
                            isCorrect: false,
                        },
                        {
                            text: "O SPI comprime os dados antes de cada transferência",
                            isCorrect: false,
                        },
                        {
                            text: "O clock do SPI vem direto do cristal, sem divisor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que definem CPOL e CPHA, os chamados modos 0 a 3 do SPI?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O repouso do clock e a borda em que o bit é lido",
                            isCorrect: true,
                        },
                        {
                            text: "A ordem dos bytes e o tamanho da palavra trocada",
                            isCorrect: false,
                        },
                        {
                            text: "A velocidade máxima e o número de escravos aceitos",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo de setup do CS e o intervalo entre frames",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "I2C",
            blocks: [
                {
                    type: "text",
                    value: "# Dois fios, muitos convidados\n\nO I2C resolve o problema oposto ao do SPI: em vez de velocidade com poucos, economia com muitos. São só dois fios para o barramento inteiro: SDA, os dados, e SCL, o clock. Nesses dois fios convivem dezenas de dispositivos, cada um com um endereço de 7 bits gravado pelo fabricante (às vezes ajustável por um pino), tipicamente a 100 ou 400 kHz.\n\nA conversa tem gramática. O mestre abre com uma condição de start, transmite o endereço do alvo mais um bit dizendo se quer escrever ou ler, e o dispositivo endereçado responde com um ACK, puxando a linha para baixo: presença confirmada. Cada byte seguinte também é confirmado. No fim, uma condição de stop libera o barramento para o próximo assunto.\n\nO detalhe elétrico é a alma do I2C: as saídas são open-drain, ou seja, cada chip só consegue puxar a linha para o nível baixo, nunca empurrá-la para cima. Quem levanta a linha são os resistores de pull-up, um em cada fio. É isso que permite vários chips na mesma linha sem briga elétrica: no pior caso, dois puxam para baixo ao mesmo tempo, o que não queima nada.",
                },
                {
                    type: "table",
                    value: '[["Característica","Como é no I2C","Consequência prática"],["Fios de sinal","2: SDA e SCL","Barato de rotear, poupa pinos"],["Endereçamento","7 bits por dispositivo","Dezenas de chips no mesmo par"],["Saída elétrica","Open-drain","Pull-ups externos obrigatórios"],["Confirmação","ACK a cada byte","O mestre sabe se alguém ouviu"],["Velocidade típica","100 ou 400 kHz","Sensores sim, vídeo não"]]',
                },
                {
                    type: "code",
                    value: "/* Ler o registrador 0x00 de um sensor no endereco 0x48 */\ni2c_start();\ni2c_envia((0x48 << 1) | 0u);   /* endereco + bit de escrita */\ni2c_envia(0x00);               /* qual registrador quero    */\ni2c_start();                   /* repeated start            */\ni2c_envia((0x48 << 1) | 1u);   /* endereco + bit de leitura */\nuint8_t temp = i2c_recebe_nack(); /* ultimo byte: NACK      */\ni2c_stop();",
                },
                {
                    type: "text",
                    value: "## Pull-ups, clock stretching e as armadilhas de bancada\n\nO valor dos pull-ups importa: entre 2,2k e 10k ohms na maioria dos casos, com 4,7k como padrão de fato em 3,3 V. Resistor alto demais deixa as bordas de subida lentas e derruba a velocidade; baixo demais exige corrente que os chips talvez não puxem. Muitos módulos prontos já trazem pull-ups soldados, e vários módulos no mesmo barramento somam resistores em paralelo, outro limite prático.\n\nO I2C tem ainda um recurso educado: clock stretching. Um escravo lento pode segurar o SCL em nível baixo enquanto processa, e o mestre, ao tentar soltar o clock e vê-lo preso, espera. Sensores que fazem conversões demoradas usam isso, e mestres implementados às pressas que ignoram o recurso colhem leituras corrompidas.\n\nAs dores clássicas de bancada, em ordem de frequência: pull-ups ausentes, e o barramento simplesmente não fala; endereço errado, porque o datasheet lista 7 bits e a biblioteca espera o valor deslocado (0x48 virando 0x90); e dois chips com o mesmo endereço, que se resolve com o pino de seleção de endereço ou um multiplexador I2C.",
                },
                {
                    type: "quote",
                    value: "I2C sem pull-up não é I2C: é dois fios soltos. Metade dos barramentos mortos em bancada se resolve com dois resistores de 4,7k.",
                },
            ],
            questions: [
                {
                    statement: "Quantos fios de sinal o I2C usa para o barramento inteiro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dois fios: SDA para dados e SCL para o clock",
                            isCorrect: true,
                        },
                        {
                            text: "Quatro: dados, clock, seleção e retorno",
                            isCorrect: false,
                        },
                        {
                            text: "Um único fio de dados com clock embutido",
                            isCorrect: false,
                        },
                        {
                            text: "Três: um de dados por sentido, mais clock",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o mestre identifica cada dispositivo no barramento I2C?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pelo endereço de 7 bits enviado após o start",
                            isCorrect: true,
                        },
                        {
                            text: "Pelo fio de chip select dedicado a cada chip",
                            isCorrect: false,
                        },
                        {
                            text: "Pela ordem física dos chips ao longo da trilha",
                            isCorrect: false,
                        },
                        {
                            text: "Pela velocidade que cada dispositivo negocia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o I2C exige resistores de pull-up nas duas linhas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As saídas open-drain só puxam a linha para baixo",
                            isCorrect: true,
                        },
                        {
                            text: "Para limitar a corrente que o mestre injeta no fio",
                            isCorrect: false,
                        },
                        {
                            text: "Para casar a impedância da trilha com o conector",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o clock exige tensão maior que a dos dados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é clock stretching no I2C?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O escravo segura o SCL baixo para ganhar tempo",
                            isCorrect: true,
                        },
                        {
                            text: "O mestre acelera o clock em rajadas curtas",
                            isCorrect: false,
                        },
                        {
                            text: "O pull-up estica a borda de subida do sinal",
                            isCorrect: false,
                        },
                        {
                            text: "Dois mestres dividem o clock em turnos iguais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um sensor I2C novo não responde (sem ACK). Qual a primeira suspeita?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Pull-ups ausentes ou endereço errado do sensor",
                            isCorrect: true,
                        },
                        {
                            text: "O núcleo do sensor queimou e precisa de troca",
                            isCorrect: false,
                        },
                        {
                            text: "O clock do mestre está rápido demais para a norma",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador removeu as chamadas de I2C do build",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Escolher o barramento",
            blocks: [
                {
                    type: "text",
                    value: "# O critério antes do catálogo\n\nVocê conhece os três dialetos; falta o julgamento. A escolha de barramento responde a perguntas concretas, e vale a pena fazê-las nesta ordem. Quantos dispositivos vão conversar? Um para um aponta UART; vários, I2C ou SPI. Que velocidade o dado exige? Um sensor de temperatura lido uma vez por segundo cabe em qualquer um; um display colorido ou um cartão SD pedem os megabits do SPI. Que distância o sinal percorre? Dentro da placa, tudo funciona; entre placas ou por cabo, a UART com transceptores (RS-485) domina. E quantos pinos sobram no seu microcontrolador? Pino é recurso escasso, e o I2C é o campeão da economia.\n\nHá ainda a pergunta que costuma decidir sozinha: o que o componente oferece? O sensor barométrico que o projeto precisa fala I2C e SPI; o GPS só fala UART; o display só SPI. O datasheet do componente reduz sua liberdade, e está tudo bem: o critério serve exatamente para escolher bem quando há escolha.\n\nA tabela abaixo é o resumo que você vai consultar por anos. Leia-a linha por linha uma vez, com calma.",
                },
                {
                    type: "table",
                    value: '[["Critério","UART","SPI","I2C"],["Fios de sinal","2 (TX e RX)","4, mais 1 CS por escravo","2 (SDA e SCL)"],["Velocidade típica","Até cerca de 1 Mbps","Dezenas de Mbps","100 a 400 kbps"],["Vários dispositivos","Não, ponto a ponto","Sim, um CS para cada um","Sim, por endereço"],["Distância confortável","Metros; RS-485 estica a centenas","Centímetros","Centímetros a poucos metros"],["Confirmação de entrega","Não tem","Não tem","ACK a cada byte"]]',
                },
                {
                    type: "text",
                    value: "## Regras de bolso honestas\n\nAlgumas combinações se repetem tanto que viram reflexo. Display gráfico, cartão SD, memória flash externa, ADC rápido: SPI, porque a banda manda. Meia dúzia de sensores lentos espalhados pela placa: I2C, todos pendurados no mesmo par de fios, cada um com seu endereço. Console de log, GPS, módulo de rádio comandado por AT, bootloader: UART. Produto de verdade usa os três ao mesmo tempo sem cerimônia: o barômetro no I2C, o rádio na UART, o flash de dados no SPI.\n\nDuas nuances completam o julgamento. O ACK do I2C dá diagnóstico de graça: o firmware sabe na hora se o sensor está presente e respondendo, coisa que no SPI exige convenção na aplicação. Em troca, o SPI degrada menos com ruído em velocidade alta e não sofre com o limite dos pull-ups.\n\nE quando dois critérios empatam, escolha o que simplifica o software: o barramento que a sua HAL já suporta bem, que o seu colega sabe depurar, que o seu analisador lógico decodifica. Arquitetura boa também é a que se conserta às três da manhã.",
                },
                {
                    type: "quote",
                    value: "Na bancada, quem escolhe o barramento costuma ser o componente: o sensor que o projeto exige fala o que fala. Seu trabalho é conhecer os três dialetos e negociar bem quando houver escolha.",
                },
            ],
            questions: [
                {
                    statement: "Qual barramento é ponto a ponto, sem endereçamento nem seleção?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A UART: um fala com um, com TX cruzado com RX",
                            isCorrect: true,
                        },
                        {
                            text: "SPI, porque o clock atende só dois chips",
                            isCorrect: false,
                        },
                        {
                            text: "O I2C, que reserva o barramento a um só par",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: os três aceitam vários dispositivos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Para um display que atualiza a tela rapidamente, qual barramento se encaixa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "SPI, pela velocidade de dezenas de megabits",
                            isCorrect: true,
                        },
                        {
                            text: "I2C, pela economia de fios no conector",
                            isCorrect: false,
                        },
                        {
                            text: "UART, pela simplicidade do frame assíncrono",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer um: a velocidade dos três é igual",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Oito sensores lentos e poucos pinos livres no chip. Qual escolha faz sentido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "I2C: todos no mesmo par de fios, por endereço",
                            isCorrect: true,
                        },
                        {
                            text: "SPI: oito fios de chip select e clock comum",
                            isCorrect: false,
                        },
                        {
                            text: "UART: uma porta serial dedicada por sensor",
                            isCorrect: false,
                        },
                        {
                            text: "Tanto faz: oito dispositivos cabem em todos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual diagnóstico o ACK do I2C oferece de graça ao firmware?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Saber na hora se o dispositivo está presente e ouviu",
                            isCorrect: true,
                        },
                        {
                            text: "Detectar qual bit do byte chegou invertido no fio",
                            isCorrect: false,
                        },
                        {
                            text: "Medir a temperatura interna do sensor endereçado",
                            isCorrect: false,
                        },
                        {
                            text: "Descobrir a velocidade máxima aceita pelo escravo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o SPI escala mal quando o número de escravos cresce?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cada escravo novo consome mais um pino de CS",
                            isCorrect: true,
                        },
                        {
                            text: "O clock se divide igualmente entre os escravos",
                            isCorrect: false,
                        },
                        {
                            text: "Os endereços de 7 bits se esgotam rapidamente",
                            isCorrect: false,
                        },
                        {
                            text: "O frame cresce um byte para cada escravo novo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Protocolos de aplicação binários",
            blocks: [
                {
                    type: "text",
                    value: "# O pão de cada dia de quem integra\n\nUART, SPI e I2C entregam bytes. Nenhum deles entrega mensagens: no fio não existe onde começa, onde termina, nem está íntegro. Quando o seu dispositivo conversa com outro sistema, um gateway, um PC, outro firmware, essas garantias precisam ser inventadas por você, na camada de aplicação. É um dos trabalhos mais recorrentes de quem integra dispositivos, e um dos que separam o protótipo do produto.\n\nA solução clássica é o frame binário com um punhado de campos. Um byte de início (magic) com valor improvável, para o receptor achar o começo de um frame no meio do fluxo. Um byte de versão, para o formato poder evoluir. Um byte de tipo, dizendo o que o payload significa: medida, comando, resposta. Um campo de comprimento, para o receptor saber quantos bytes esperar. O payload em si. E um CRC no fim, cobrindo o frame, para detectar corrupção.\n\nA tabela abaixo mostra um frame completo, byte a byte. Ele é pequeno, cabe em qualquer UART e resolve 90% das integrações reais; o projeto final da trilha usa exatamente esse desenho.",
                },
                {
                    type: "table",
                    value: '[["Campo","Tamanho","Exemplo","Papel"],["Início (magic)","1 byte","0xAA","Achar o começo do frame no fluxo"],["Versão","1 byte","0x01","Evoluir o formato sem quebrar"],["Tipo","1 byte","0x10 = medida","O que o payload significa"],["Comprimento","1 byte","0x04","Quantos bytes tem o payload"],["Payload","N bytes","Temperatura em centésimos","O dado em si"],["CRC-16","2 bytes","0x3F21","Detectar corrupção do frame"]]',
                },
                {
                    type: "code",
                    value: "typedef struct {\n    uint8_t  magic;    /* 0xAA                     */\n    uint8_t  versao;   /* 1                        */\n    uint8_t  tipo;     /* 0x10: medida de sensor   */\n    uint8_t  tamanho;  /* bytes do payload         */\n    uint8_t  payload[MAX_PAYLOAD];\n    uint16_t crc;      /* CRC-16 do frame          */\n} Frame;\n\n/* No fio, serialize campo a campo, byte a byte.\n   Nunca despeje a struct com memcpy: padding e ordem\n   de bytes mudam de compilador para compilador.      */",
                },
                {
                    type: "text",
                    value: "## CRC, versão e o parser paranoico\n\nO CRC merece respeito: diferente de uma soma simples, o CRC-16 detecta praticamente toda rajada curta de bits corrompidos, o tipo de erro que fios reais produzem. O receptor recalcula o CRC do que chegou e compara com o recebido; divergiu, o frame morre em silêncio e o parser volta a caçar o próximo magic. Essa ressincronização é o coração do parser robusto: uma máquina de estados que procura o magic, valida versão e comprimento (rejeitando tamanhos absurdos antes de alocar qualquer coisa), acumula o payload e confere o CRC. Qualquer violação descarta e recomeça, sem travar e sem confiar.\n\nO byte de versão é o seu seguro de futuro. Produtos em campo não atualizam todos no mesmo dia: o gateway novo precisa entender o firmware antigo, e vice-versa. Com versão no frame, o receptor escolhe o interpretador; sem ela, toda mudança de formato é uma migração sincronizada e arriscada.\n\nRegra final, que o código acima já avisou: serialize campo a campo. Padding de struct e endianness variam entre compiladores e arquiteturas, e o frame que funciona entre duas placas iguais quebra no dia em que o PC entra na conversa.",
                },
                {
                    type: "quote",
                    value: "No fio só existem bytes. Mensagem, versão e confiança são invenções suas, e o CRC é o juramento de que o que chegou foi o que saiu.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve o byte de início (magic) num frame binário?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Localizar o começo de um frame no fluxo de bytes",
                            isCorrect: true,
                        },
                        {
                            text: "Criptografar o payload antes do envio pela serial",
                            isCorrect: false,
                        },
                        {
                            text: "Indicar a velocidade da porta para o receptor",
                            isCorrect: false,
                        },
                        {
                            text: "Reservar espaço para campos futuros do formato",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o papel do CRC no fim do frame?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Detectar corrupção comparando com o recalculado",
                            isCorrect: true,
                        },
                        {
                            text: "Comprimir o payload para caber em menos bytes",
                            isCorrect: false,
                        },
                        {
                            text: "Autenticar o remetente com uma chave secreta",
                            isCorrect: false,
                        },
                        {
                            text: "Marcar o fim do frame no lugar do comprimento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o frame carrega um campo de comprimento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O receptor sabe quantos bytes ler antes do CRC",
                            isCorrect: true,
                        },
                        {
                            text: "O transmissor calcula o baud rate ideal com ele",
                            isCorrect: false,
                        },
                        {
                            text: "O CRC exige um tamanho par para ser calculado",
                            isCorrect: false,
                        },
                        {
                            text: "O campo dobra como contador de retransmissões",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o byte de versão do protocolo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Evoluir o formato sem quebrar aparelhos antigos",
                            isCorrect: true,
                        },
                        {
                            text: "Registrar a data de fabricação do dispositivo",
                            isCorrect: false,
                        },
                        {
                            text: "Escolher a paridade usada pela porta serial",
                            isCorrect: false,
                        },
                        {
                            text: "Indicar quantas retransmissões são permitidas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que não despejar a struct do frame direto no fio com memcpy?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Padding e endianness mudam o layout entre chips",
                            isCorrect: true,
                        },
                        {
                            text: "O memcpy corrompe structs com mais de 32 bytes",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador proíbe copiar structs com arrays",
                            isCorrect: false,
                        },
                        {
                            text: "O CRC deixa de cobrir os campos após o payload",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - C++ embarcado",
    aulas: [
        {
            titulo: "O subset",
            blocks: [
                {
                    type: "text",
                    value: "# C++ sim, mas de dieta\n\nFirmware profissional em C++ é rotina em 2026, dos drones aos carros, e quase sempre com duas flags no build: -fno-exceptions e -fno-rtti. O C++ embarcado é um subset deliberado da linguagem, e entender por que cada corte existe vale mais que decorar a lista.\n\nExceções saem por dois preços. O primeiro é flash: o mecanismo moderno de unwind carrega tabelas que ocupam kilobytes mesmo que nenhum throw jamais aconteça. O segundo é tempo: o caminho de um throw até o catch tem latência difícil de prever, veneno para sistema que promete prazos. RTTI, a identificação de tipos em execução que alimenta dynamic_cast e typeid, sai por motivo mais simples: paga-se em metadados gravados na flash por um recurso que firmware bem desenhado não usa.\n\nO heap é o corte mais debatido. malloc e new não são proibidos por lei, mas um alocador de uso geral fragmenta, e fragmentação em um sistema que roda meses sem reiniciar é uma bomba de relógio: a RAM total até sobra, mas nenhum buraco contíguo serve. A prática comum: alocar tudo estaticamente, ou permitir heap apenas na inicialização, nunca em regime.",
                },
                {
                    type: "table",
                    value: '[["Recurso","Fica ou sai?","Motivo"],["Exceções","Sai (-fno-exceptions)","Tabelas na flash e latência imprevisível"],["RTTI","Sai (-fno-rtti)","Metadados pagos sem uso no firmware"],["Heap em regime","Sai, ou só na inicialização","Fragmentação em execução longa"],["Classes e templates","Ficam","Custo zero quando bem usados"],["constexpr e enum class","Ficam","Trabalho em compilação e segurança"],["iostream","Sai","Dezenas de kilobytes de flash"]]',
                },
                {
                    type: "text",
                    value: "## O que sobra: muita coisa boa\n\nA lista do que fica é mais interessante que a dos cortes. Classes organizam drivers com estado e invariantes, e o RAII, destruidor devolvendo o recurso, funciona lindamente para travas de interrupção e transações de barramento. Templates e constexpr movem trabalho para a compilação, tema das próximas aulas. enum class dá tipos fortes a códigos de erro e estados de máquina. static_assert transforma premissas em verificação de build. Referências eliminam uma classe inteira de bugs de ponteiro nulo.\n\nE como viver sem exceções? Com retorno explícito: funções devolvem um enum de erro e entregam o valor por referência, ou usam tipos no espírito do std::expected, que carregam valor ou erro. O fluxo de falha fica visível no código, o que times de firmware consideram virtude, não limitação.\n\nA regra mental do módulo inteiro: em embarcados, cada recurso de linguagem paga a passagem em bytes de flash, bytes de RAM e microssegundos. O que compensa, embarca; o que não compensa, fica no desktop. Nas próximas aulas você verá o lado luminoso: recursos que custam exatamente zero.",
                },
                {
                    type: "code",
                    value: "enum class Erro : uint8_t { Ok, Timeout, CrcInvalido };\n\n/* Sem excecoes: erro no retorno, valor por referencia */\nErro sensor_ler(uint16_t &saida);\n\nvoid ciclo(void) {\n    uint16_t temp = 0u;\n    const Erro e = sensor_ler(temp);\n    if (e != Erro::Ok) {\n        registrar_falha(e);   /* fluxo de erro visivel */\n        return;\n    }\n    processar(temp);\n}",
                },
                {
                    type: "quote",
                    value: "O C++ embarcado não é um C++ menor: é um C++ em que cada recurso paga a passagem em bytes e microssegundos. O que compensa, embarca.",
                },
            ],
            questions: [
                {
                    statement: "Quais dois recursos o C++ embarcado tipicamente desliga no build?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Exceções e RTTI, com -fno-exceptions e -fno-rtti",
                            isCorrect: true,
                        },
                        {
                            text: "Templates e classes, por gerarem código a mais",
                            isCorrect: false,
                        },
                        {
                            text: "Funções inline e constexpr, por inflarem a RAM",
                            isCorrect: false,
                        },
                        {
                            text: "Namespaces e referências, pelo custo de execução",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o heap é evitado em firmware que roda meses sem reiniciar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A fragmentação pode inviabilizar a RAM com o tempo",
                            isCorrect: true,
                        },
                        {
                            text: "O malloc é proibido pelo padrão da linguagem C++",
                            isCorrect: false,
                        },
                        {
                            text: "A RAM estática é apagada quando o heap é criado",
                            isCorrect: false,
                        },
                        {
                            text: "O heap mora na flash e desgasta o setor de dados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que exceções incomodam em sistemas de tempo real?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O caminho do throw tem latência imprevisível",
                            isCorrect: true,
                        },
                        {
                            text: "O throw reinicia o microcontrolador por padrão",
                            isCorrect: false,
                        },
                        {
                            text: "Exceções exigem um sistema operacional embaixo",
                            isCorrect: false,
                        },
                        {
                            text: "O catch desabilita as interrupções do núcleo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Sem exceções, como o firmware costuma reportar erros?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Códigos de retorno e enums verificados no fluxo",
                            isCorrect: true,
                        },
                        {
                            text: "Mensagens de texto gravadas na flash de logs",
                            isCorrect: false,
                        },
                        {
                            text: "Um sinal elétrico enviado ao pino de reset",
                            isCorrect: false,
                        },
                        {
                            text: "Variáveis globais que o linker zera no boot",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que as tabelas de unwind das exceções custam num MCU?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Kilobytes de flash mesmo sem nenhum throw no código",
                            isCorrect: true,
                        },
                        {
                            text: "Ciclos de CPU adicionais em cada chamada de função",
                            isCorrect: false,
                        },
                        {
                            text: "Um bloqueio das interrupções durante todo o unwind",
                            isCorrect: false,
                        },
                        {
                            text: "A perda do conteúdo da pilha depois de cada retorno",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Abstração de custo zero",
            blocks: [
                {
                    type: "text",
                    value: "# A classe que evapora\n\nA promessa central do C++ embarcado cabe numa frase: você pode escrever uma interface segura e legível que compila para exatamente as mesmas instruções do registrador cru. Nem uma a mais. A classe existe para o compilador e para o colega que lê o código; para o processador, ela evapora.\n\nO exemplo canônico é o GPIO. No módulo 2 você escreveu GPIOA_ODR ^= (1u << 5) e precisou saber o endereço, o bit e a operação. O template abaixo embala esse conhecimento uma única vez: o endereço-base e o pino viram parâmetros de template, conhecidos em tempo de compilação, e cada método é uma linha sobre o registrador.\n\nO ganho não é estético. Led::alterna() não aceita pino errado, porque o pino faz parte do tipo. Um Gpio de entrada pode nem oferecer o método alto(), transformando o mau uso em erro de compilação. E o custo? Com otimização ligada, o compilador substitui a chamada pelo corpo, dobra as constantes e emite a mesma sequência de load, or e store do C cru. A aula seguinte à tabela mostra como conferir isso com os próprios olhos.",
                },
                {
                    type: "code",
                    value: "template <uint32_t Base, int Pino>\nstruct Gpio {\n    static void alto()    { reg(Base + ODR) |=  (1u << Pino); }\n    static void baixo()   { reg(Base + ODR) &= ~(1u << Pino); }\n    static void alterna() { reg(Base + ODR) ^=  (1u << Pino); }\nprivate:\n    static volatile uint32_t &reg(uint32_t end) {\n        return *reinterpret_cast<volatile uint32_t *>(end);\n    }\n};\n\nusing Led = Gpio<GPIOA_BASE, 5>;\nLed::alterna();  /* mesmas instrucoes do GPIOA_ODR ^= (1u << 5) */",
                },
                {
                    type: "table",
                    value: '[["Abordagem","Legibilidade","Erro pego em","Custo em execução"],["#define com endereço cru","Baixa","Execução, ou nunca","3 instruções"],["Função em C","Média","Execução","3 instruções, mais call se não inlinar"],["Classe template C++","Alta","Compilação","3 instruções, idênticas ao cru"]]',
                },
                {
                    type: "text",
                    value: "## Por que o custo é zero, e como conferir\n\nTrês engrenagens produzem o milagre. Primeira: os parâmetros de template são constantes de compilação, então Base + ODR e 1u << Pino viram números prontos no binário, sem cálculo em execução. Segunda: métodos static não carregam objeto, logo não existe this, não existe estado, não existe um byte de RAM. Terceira: com -O2, o inliner cola o corpo de uma linha no ponto de uso e a chamada desaparece.\n\nConferir é um hábito, não um ato de fé: compile com -S e leia o assembly das duas versões, ou olhe o tamanho no map file. Para o Cortex-M, as duas formas produzem tipicamente a mesma trinca de instruções sobre o registrador ODR; nos chips com registradores de set e reset dedicados (BSRR), uma única escrita resolve, e a classe usa isso por você.\n\nO padrão escala além do GPIO: UART tipada pelo periférico, canal de timer como tipo, transação de I2C com RAII segurando o start e o stop. Em todos, a pergunta de projeto é a mesma: o que dá para saber em compilação? Tudo o que der, o tipo carrega e o binário esquece.",
                },
                {
                    type: "quote",
                    value: "Abstração de custo zero é um contrato verificável: olhe o assembly. Se a classe custou uma instrução a mais, o contrato quebrou e o design volta para a prancheta.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza uma abstração de custo zero?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Interface melhor gerando o mesmo código de máquina",
                            isCorrect: true,
                        },
                        {
                            text: "Uma biblioteca gratuita mantida pela comunidade C++",
                            isCorrect: false,
                        },
                        {
                            text: "Uma classe cujos métodos rodam só na inicialização",
                            isCorrect: false,
                        },
                        {
                            text: "Um recurso disponível apenas em builds sem otimizar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No exemplo da aula, por que a classe Gpio não ocupa nem um byte de RAM?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Tudo se resolve em compilação: não há objeto nem estado",
                            isCorrect: true,
                        },
                        {
                            text: "O linker move os objetos da classe para a flash do chip",
                            isCorrect: false,
                        },
                        {
                            text: "A RAM é devolvida pelo construtor quando o main começa",
                            isCorrect: false,
                        },
                        {
                            text: "O padrão C++ garante RAM zero para classes com métodos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como verificar se uma abstração realmente custou zero?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Comparando o assembly gerado com o do registrador cru",
                            isCorrect: true,
                        },
                        {
                            text: "Medindo o tempo de compilação completo das duas versões",
                            isCorrect: false,
                        },
                        {
                            text: "Contando quantas linhas de fonte cada versão precisou",
                            isCorrect: false,
                        },
                        {
                            text: "Cronometrando o boot da placa com cada uma das versões",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Que vantagem a versão template tem sobre o #define com endereço cru?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Erros de uso viram erros de compilação, não de campo",
                            isCorrect: true,
                        },
                        {
                            text: "O template dobra a velocidade de escrita no registrador",
                            isCorrect: false,
                        },
                        {
                            text: "O template dispensa o volatile no acesso ao periférico",
                            isCorrect: false,
                        },
                        {
                            text: "O template liga o clock do periférico automaticamente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que os métodos do Gpio template podem ser totalmente inlined?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Base e pino são conhecidos em tempo de compilação",
                            isCorrect: true,
                        },
                        {
                            text: "Porque métodos static nunca geram chamadas reais",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o compilador ignora funções de uma linha só",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a flash é rápida demais para notar o call",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "constexpr e tabelas em flash",
            blocks: [
                {
                    type: "text",
                    value: "# Trabalho feito antes de ligar\n\nTodo cálculo que o firmware faz em execução custa ciclos, energia e, às vezes, RAM. constexpr é a alavanca para empurrar esse trabalho para trás, para a compilação, onde ciclos são grátis e a máquina é o seu notebook. Uma função constexpr pode rodar no compilador; um dado constexpr nasce pronto dentro do binário.\n\nO caso de uso clássico é a lookup table. O CRC do módulo 3 processa byte a byte usando uma tabela de 256 entradas; gerar essa tabela em execução gastaria tempo de boot e RAM. Com constexpr, o compilador executa o laço gerador e grava o resultado final na flash, na seção de dados somente leitura. O mesmo vale para tabelas de seno de um gerador de sinal, divisores de baud rate calculados a partir do clock, ganhos de calibração derivados de constantes físicas.\n\nHá um bônus de correção: static_assert testa os valores durante o build. A tabela errada nem vira binário, e essa é a forma mais barata de teste que existe: falha antes de existir firmware. O código abaixo mostra a receita completa em meia dúzia de linhas.",
                },
                {
                    type: "code",
                    value: "constexpr uint8_t crc8_passo(uint8_t v) {\n    for (int b = 0; b < 8; b++) {\n        v = (v & 0x80u) ? uint8_t((v << 1) ^ 0x07u) : uint8_t(v << 1);\n    }\n    return v;\n}\n\n/* Tabela de 256 entradas calculada pelo COMPILADOR: */\nconstexpr auto TABELA_CRC = [] {\n    std::array<uint8_t, 256> t{};\n    for (int i = 0; i < 256; i++) { t[i] = crc8_passo(uint8_t(i)); }\n    return t;\n}();\n\nstatic_assert(TABELA_CRC[0] == 0x00u);  /* valida no build */",
                },
                {
                    type: "table",
                    value: '[["Seção do binário","O que guarda","Onde vive"],[".text","Código de máquina","Flash"],[".rodata","Constantes e tabelas const","Flash"],[".data","Globais inicializadas com valor","RAM, com cópia inicial na flash"],[".bss","Globais que começam zeradas","RAM"]]',
                },
                {
                    type: "text",
                    value: "## Onde cada dado mora\n\nA tabela de seções acima é o mapa mental que faltava. Código vive em .text, na flash. Constantes de verdade, marcadas const ou constexpr, vão para .rodata, também na flash, e não custam RAM nenhuma. Globais inicializadas ficam em .data: ocupam RAM em execução e ainda uma cópia na flash, de onde o startup as restaura no boot. Globais zeradas ficam em .bss, que o startup limpa.\n\nDois tropeços clássicos merecem aviso. Primeiro: a tabela calculada no início do main, em vez de constexpr, mora na RAM e cobra tempo de boot; a versão constexpr elimina os dois custos. Segundo: esquecer o const numa tabela grande a empurra para .data, e a RAM escassa paga por dados que nunca mudam. O arm-none-eabi-size do módulo 1 mostra o estrago na hora: .rodata cresce, tudo bem; .data inchando é alerta.\n\nA moral econômica: flash é o recurso abundante, RAM o escasso, ciclo de CPU o disputado. Uma lookup table gasta flash para poupar ciclos; constexpr gasta tempo de compilação para poupar tudo o que é caro no alvo. Negocie sempre nessa direção.",
                },
                {
                    type: "quote",
                    value: "Flash é o recurso abundante; RAM, o escasso; ciclo de CPU, o disputado. constexpr é a arte de pagar as contas com a moeda que sobra.",
                },
            ],
            questions: [
                {
                    statement: "O que o constexpr permite fazer?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Calcular valores durante a compilação do programa",
                            isCorrect: true,
                        },
                        {
                            text: "Alterar constantes durante a execução do programa",
                            isCorrect: false,
                        },
                        {
                            text: "Compilar o mesmo arquivo para duas arquiteturas",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar variáveis mutáveis dentro da memória flash",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Num MCU, onde uma tabela constexpr costuma ser armazenada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Na flash, na seção de dados somente leitura",
                            isCorrect: true,
                        },
                        {
                            text: "Na RAM, junto das variáveis globais zeradas",
                            isCorrect: false,
                        },
                        {
                            text: "No heap, alocada na primeira consulta feita",
                            isCorrect: false,
                        },
                        {
                            text: "Nos registradores de propósito geral do núcleo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual a vantagem de gerar a tabela de CRC em compilação, e não no boot?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não gasta RAM nem tempo de inicialização no alvo",
                            isCorrect: true,
                        },
                        {
                            text: "O CRC calculado em compilação sai mais confiável",
                            isCorrect: false,
                        },
                        {
                            text: "A tabela pode ser editada depois pelo depurador",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador comprime a tabela antes de gravar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o static_assert junto de dados constexpr?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Validar os valores no build, antes de gravar",
                            isCorrect: true,
                        },
                        {
                            text: "Impedir o acesso à tabela fora da função main",
                            isCorrect: false,
                        },
                        {
                            text: "Medir o tamanho da tabela durante a execução",
                            isCorrect: false,
                        },
                        {
                            text: "Forçar a cópia da tabela da flash para a RAM",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que uma lookup table troca, em termos de recursos do chip?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Gasta flash para poupar ciclos de CPU na execução",
                            isCorrect: true,
                        },
                        {
                            text: "Gasta RAM para poupar espaço de flash no binário",
                            isCorrect: false,
                        },
                        {
                            text: "Gasta ciclos de boot para poupar energia depois",
                            isCorrect: false,
                        },
                        {
                            text: "Gasta pinos do chip para poupar banda do barramento",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Containers estáticos",
            blocks: [
                {
                    type: "text",
                    value: "# Vetores sem sustos\n\nO subset baniu o heap em regime, e a primeira saudade é o std::vector: crescer sob demanda é confortável. A resposta embarcada não é voltar ao array cru com índice na mão, e sim mudar o contrato: containers com capacidade fixa, decidida em compilação, com a memória embutida no próprio objeto.\n\nA referência desse estilo é a ETL, Embedded Template Library, pensada para conviver com o subset: um etl::vector<Medida, 32> tem a interface familiar (push_back, iteração, size), mas a capacidade faz parte do tipo e a memória são 32 medidas inline, alocadas onde o objeto viver, sem heap, nunca. O std::array cobre o caso mais simples, tamanho exato e fixo; a ETL cobre o resto: strings, filas, mapas, todos com N no tipo.\n\nA diferença filosófica aparece quando o container enche. O vector do desktop realoca em silêncio: endereços mudam, tempo de execução oscila, e ninguém pergunta se podia. O container estático devolve a pergunta para você: está cheio, e agora? Essa pergunta explícita é exatamente o que um produto confiável precisa responder em projeto, não descobrir em produção.",
                },
                {
                    type: "code",
                    value: '#include <etl/vector.h>\n\netl::vector<Medida, 32> fila;  /* capacidade no TIPO, memoria inline */\n\nvoid amostra_nova(const Medida &m) {\n    if (fila.full()) {\n        fila.erase(fila.begin());  /* politica SUA: cai a mais antiga */\n    }\n    fila.push_back(m);             /* nunca aloca, nunca realoca      */\n}\n\nstatic_assert(sizeof(fila) < 1024u, "fila cabe no orcamento de RAM");',
                },
                {
                    type: "table",
                    value: '[["Container","Alocação","Capacidade","Uso típico"],["std::vector","Heap, cresce sozinho","Ilimitada na teoria","Aplicação de desktop e servidor"],["std::array","Nenhuma","Fixa e exata","Buffers de tamanho conhecido"],["etl::vector<T, N>","Nenhuma","Fixa, gravada no tipo","Filas e listas de firmware"],["Pool de blocos","Pré-reservada no boot","Fixa","Objetos criados e destruídos em regime"]]',
                },
                {
                    type: "text",
                    value: "## Capacidade é decisão de projeto\n\nEscolher o N força a pergunta mais saudável da engenharia embarcada: qual é o pior caso? Quantas medidas se acumulam se a telemetria ficar muda por um minuto? Trinta e duas? Então 32, com política declarada para o transbordo: descartar a mais antiga, descartar a nova, ou contar o estouro num contador de diagnóstico que o módulo 6 vai querer ver. Qualquer uma é defensável; o indefensável é não ter decidido.\n\nOs ganhos se acumulam. sizeof conta a verdade: some os containers e você tem o orçamento de RAM em compilação, verificável por static_assert, como no código acima. O tempo de push_back é constante e curto, sem o soluço ocasional da realocação, o que mantém o pior caso de tempo (WCET) analisável. E ponteiros para os elementos permanecem válidos, porque nada muda de endereço, detalhe vital quando uma ISR produz e o laço principal consome.\n\nRegra de bolso final: se o tamanho não tem limite pensado, o problema não é o container, é o requisito. Firmware sério conhece seus máximos; o container estático só transforma esse conhecimento em tipo.",
                },
                {
                    type: "quote",
                    value: "Escolher o N do container é o momento em que o firmware encara o pior caso de frente. O desktop adia essa pergunta; o embarcado a responde no tipo.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a ideia central da ETL (Embedded Template Library)?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Containers com capacidade fixa, definida no tipo",
                            isCorrect: true,
                        },
                        {
                            text: "Containers que crescem usando a flash como heap",
                            isCorrect: false,
                        },
                        {
                            text: "Uma versão do STL compilada fora do binário final",
                            isCorrect: false,
                        },
                        {
                            text: "Templates exclusivos para os chips da linha STM32",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o std::vector comum é evitado em firmware?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele aloca no heap e realoca sem o seu controle",
                            isCorrect: true,
                        },
                        {
                            text: "Ele aceita somente tipos primitivos como itens",
                            isCorrect: false,
                        },
                        {
                            text: "Ele exige o iostream compilado junto no binário",
                            isCorrect: false,
                        },
                        {
                            text: "Ele perde os dados a cada interrupção atendida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que acontece quando um etl::vector atinge a capacidade máxima?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Nada silencioso: o transbordo é decisão do seu código",
                            isCorrect: true,
                        },
                        {
                            text: "Ele realoca o dobro do espaço numa área reservada",
                            isCorrect: false,
                        },
                        {
                            text: "Ele descarta sozinho o item mais antigo guardado",
                            isCorrect: false,
                        },
                        {
                            text: "Ele move os itens excedentes para a memória flash",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual ganho os containers estáticos dão ao orçamento de memória?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O sizeof diz em compilação quanto de RAM se gasta",
                            isCorrect: true,
                        },
                        {
                            text: "A RAM usada cai pela metade em qualquer projeto",
                            isCorrect: false,
                        },
                        {
                            text: "O linker compacta os containers vazios do binário",
                            isCorrect: false,
                        },
                        {
                            text: "O heap passa a ser desfragmentado pelo compilador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a realocação do vector é perigosa quando uma ISR consome os dados?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Endereços mudam e ponteiros antigos ficam inválidos",
                            isCorrect: true,
                        },
                        {
                            text: "O realloc desliga o NVIC durante a cópia dos dados",
                            isCorrect: false,
                        },
                        {
                            text: "A ISR não tem permissão de ler memória vinda do heap",
                            isCorrect: false,
                        },
                        {
                            text: "O heap novo nasce sem o volatile exigido pela ISR",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O mito do C++ pesado",
            blocks: [
                {
                    type: "text",
                    value: "# Colocando o mito na balança\n\nA lenda diz que C++ incha firmware, e ela sobrevive porque mistura meia verdade com medição nenhuma. A verdade inteira: recursos específicos custam caro; a linguagem, não. Quem paga o preço é quem liga exceções, RTTI e iostream, não quem escreve classes.\n\nO custo zero comprovado: classes sem funções virtuais, templates bem usados, constexpr, enum class, referências, namespaces. Nada disso emite um byte a mais que o C equivalente, como a aula da abstração de custo zero mostrou no assembly. Funções virtuais têm custo pequeno e honesto: uma vtable na flash por classe, um ponteiro por objeto e uma chamada indireta por uso; você paga onde usa, e onde o polimorfismo elimina uma selva de switch, costuma valer.\n\nOs vilões de verdade: exceções e RTTI, já cortados pelo subset; o iostream, que arrasta dezenas de kilobytes de formatação e localidade para dentro da flash, e por isso firmware imprime com printf enxuto ou loggers dedicados; e, ironia, o printf com float da libc, que puxa a formatação pesada. Cada um desses aparece com nome e tamanho no lugar certo: o map file.",
                },
                {
                    type: "table",
                    value: '[["Recurso","Custo típico","Veredito"],["Classes sem virtual","Zero","Use à vontade"],["Templates","Zero por uso; vigie instanciações demais","Use com juízo"],["constexpr","Zero em execução","Use sempre que puder"],["Funções virtuais","Vtable, ponteiro e chamada indireta","Pague onde o design ganhar"],["Exceções e RTTI","Kilobytes de flash e latência","Desligados no subset"],["iostream","Dezenas de kilobytes de flash","Nunca no MCU; printf enxuto"]]',
                },
                {
                    type: "code",
                    value: "# gere o mapa do binario no proprio link:\narm-none-eabi-gcc ... -Wl,-Map=firmware.map -o firmware.elf\n\n# os 20 maiores simbolos, com tamanho: a lista de suspeitos\narm-none-eabi-nm --size-sort --print-size firmware.elf | tail -20\n\n# o binario cresceu depois de um commit?\n# rode nos dois builds e compare as listas: o culpado aparece.",
                },
                {
                    type: "text",
                    value: "## O map file não aceita opinião\n\nO map file, gerado pelo linker com -Wl,-Map, lista cada símbolo do binário com endereço e tamanho: cada função, cada tabela, cada instância de template. É a régua definitiva do que custa o quê. Leitura recomendada da primeira vez: ordene por tamanho, olhe os dez maiores e pergunte se cada um merece os bytes que ocupa. A primeira sessão dessas costuma render surpresas educativas, como descobrir a formatação de ponto flutuante inteira dentro de um firmware que só imprime inteiros.\n\nO fluxo profissional trata tamanho como métrica de regressão: o build registra flash e RAM usados, e um commit que engorda o binário além de um limiar acende alerta, exatamente como um teste falhando. O módulo de qualidade transforma isso em regra de CI; por ora, adote o hábito de bancada: mexeu em dependência ou ligou recurso novo, olhe o size e, se estranhar, abra o map.\n\nCom a régua na mão, a discussão sobre C++ pesado morre de morte natural: não se debate folclore contra números. Firmware se discute em bytes medidos.",
                },
                {
                    type: "quote",
                    value: "Entre a lenda do C++ pesado e a régua do map file, fique com a régua: firmware se discute em bytes medidos, não em folclore de fórum.",
                },
            ],
            questions: [
                {
                    statement: "O que de fato incha um binário C++ embarcado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Recursos específicos: exceções, RTTI e iostream",
                            isCorrect: true,
                        },
                        {
                            text: "O uso de classes e namespaces em vez de funções",
                            isCorrect: false,
                        },
                        {
                            text: "A simples escolha do C++ no lugar do C, por si só",
                            isCorrect: false,
                        },
                        {
                            text: "Os comentários extensos e nomes longos de variáveis",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual arquivo lista cada símbolo do binário com o seu tamanho?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O map file gerado pelo linker durante o build",
                            isCorrect: true,
                        },
                        {
                            text: "O reference manual da família do microcontrolador",
                            isCorrect: false,
                        },
                        {
                            text: "O linker script com as seções da memória flash",
                            isCorrect: false,
                        },
                        {
                            text: "O arquivo de projeto criado pela IDE do fabricante",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o custo real de usar funções virtuais?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma vtable na flash e uma chamada indireta no uso",
                            isCorrect: true,
                        },
                        {
                            text: "A cópia do objeto inteiro a cada chamada do método",
                            isCorrect: false,
                        },
                        {
                            text: "O dobro de RAM para cada instância da classe base",
                            isCorrect: false,
                        },
                        {
                            text: "A perda do inline em todas as funções do programa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o iostream é banido de firmware?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele arrasta dezenas de kilobytes para a flash",
                            isCorrect: true,
                        },
                        {
                            text: "Ele exige um terminal gráfico ligado à placa",
                            isCorrect: false,
                        },
                        {
                            text: "Ele imprime somente em codificação UTF-16",
                            isCorrect: false,
                        },
                        {
                            text: "Ele trava as interrupções durante cada escrita",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O binário cresceu 4 KB depois de um commit. Qual o primeiro passo profissional?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Comparar os maiores símbolos no map dos dois builds",
                            isCorrect: true,
                        },
                        {
                            text: "Reverter o commit e proibir o recurso responsável",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a flash do produto na próxima revisão",
                            isCorrect: false,
                        },
                        {
                            text: "Recompilar tudo com -O3 para compensar o ganho",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Energia e robustez",
    aulas: [
        {
            titulo: "Modos de energia",
            blocks: [
                {
                    type: "text",
                    value: "# A bateria como requisito\n\nQuando o produto vive de bateria, consumo deixa de ser detalhe e vira requisito de arquitetura. A boa notícia: os microcontroladores modernos são máquinas de dormir. Em modo run, com tudo ligado, um Cortex-M consome miliamperes. Em sleep, o núcleo para e os periféricos continuam: o consumo cai a uma fração. Em stop ou deep sleep, núcleo e quase todos os clocks param, a RAM pode ficar retida, e o consumo despenca para microamperes; um ESP32 em deep sleep fica na casa de 10 µA. No extremo, standby ou shutdown desligam quase tudo, valem nanoamperes, e o preço é acordar do zero, como num reset.\n\nDormir só faz sentido se algo acorda o chip, e as fontes de wakeup são parte do projeto: uma borda num pino de wakeup (o botão, o sensor de movimento), o alarme do RTC, o relógio de tempo real que segue contando no sono, ou o watchdog. A escolha do modo é sempre a mesma negociação: quanto mais fundo o sono, menor o consumo, mais lento o despertar e menos coisas conseguem acordá-lo. A tabela abaixo organiza o mapa.",
                },
                {
                    type: "table",
                    value: '[["Modo","O que para","Corrente típica","Acorda por"],["Run","Nada","Miliamperes","Está sempre ativo"],["Sleep","Só o núcleo","Fração do run","Qualquer interrupção"],["Stop / deep sleep","Núcleo e maioria dos clocks","Microamperes","Pino de wakeup, RTC, watchdog"],["Standby / shutdown","Quase tudo; RAM pode perder","Nanoamperes a poucos µA","Pinos e RTC; reinicia do zero"]]',
                },
                {
                    type: "code",
                    value: "void ciclo_de_vida(void) {\n    acordar_perifericos();\n    Medida m = medir();      /* ~50 ms a ~20 mA           */\n    transmitir(m);           /* ~150 ms com o radio ligado */\n    dormir_profundo(60u);    /* RTC acorda em 60 s; ~5 uA  */\n}\n\n/* corrente media = (20 mA x 0,2 s + 0,005 mA x 59,8 s) / 60 s\n                  = ~72 uA\n   bateria 2000 mAh / 0,072 mA = ~27900 h = ~3 anos          */",
                },
                {
                    type: "text",
                    value: "## A conta de mAh\n\nO padrão de projeto dominante é o duty cycling: acordar, medir, transmitir, dormir, repetir. E a métrica que decide a vida do produto é a corrente média, não a de pico. A conta do código acima merece ser refeita à mão uma vez na vida. O dispositivo acorda a cada 60 segundos e fica ativo 0,2 segundo consumindo 20 mA; no resto do tempo dorme a 5 µA. A média pondera os dois: 20 mA por 0,2 s rendem 4 unidades de mA-segundo; 0,005 mA por 59,8 s rendem 0,3. Somando e dividindo pelos 60 s do ciclo: cerca de 0,072 mA, ou 72 µA.\n\nUma bateria de 2000 mAh entrega 2000 mAh divididos por 0,072 mA: aproximadamente 27900 horas, uns três anos. Refaça a conta dobrando o tempo ativo e veja a vida cair quase pela metade: é o tempo acordado que domina o orçamento, e cada milissegundo de rádio ligado custa caro.\n\nDaí as regras práticas: transmitir raramente e em rajadas curtas, agrupar medidas, cortar a corrente de sensores e divisores resistivos durante o sono, e medir o consumo real na bancada, porque um pull-up esquecido de 10k a 3,3 V já são 330 µA roubando anos da bateria.",
                },
                {
                    type: "quote",
                    value: "Produto a bateria não é o que consome pouco ligado: é o que passa a vida quase desligado. A média é dominada pelo sono, e o projeto começa por ele.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza o deep sleep (stop) de um microcontrolador?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Núcleo e clocks param; o consumo cai a microamperes",
                            isCorrect: true,
                        },
                        {
                            text: "O clock do núcleo cai para a metade da frequência",
                            isCorrect: false,
                        },
                        {
                            text: "Somente o LED de status é desligado para poupar",
                            isCorrect: false,
                        },
                        {
                            text: "A flash é apagada para reduzir a corrente de fuga",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais fontes tipicamente acordam um chip do deep sleep?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pinos de wakeup, alarme de RTC e watchdog",
                            isCorrect: true,
                        },
                        {
                            text: "Somente o desligar e religar da alimentação",
                            isCorrect: false,
                        },
                        {
                            text: "Um comando enviado pelo compilador via SWD",
                            isCorrect: false,
                        },
                        {
                            text: "A troca do cristal externo por um mais lento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num produto que fica ativo 0,2 s por minuto, o que domina o consumo médio?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A corrente de sono, presente em 99% do tempo",
                            isCorrect: true,
                        },
                        {
                            text: "A corrente de pico do rádio na transmissão",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo de carga dos capacitores da fonte",
                            isCorrect: false,
                        },
                        {
                            text: "A frequência de clock usada durante a medição",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com corrente média de 72 µA, uma bateria de 2000 mAh dura aproximadamente:",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cerca de 3 anos: 2000 mAh divididos por 0,072 mA",
                            isCorrect: true,
                        },
                        {
                            text: "Cerca de 3 meses: o pico do rádio domina a conta",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 28 dias, dividindo 2000 por 72 diretamente",
                            isCorrect: false,
                        },
                        {
                            text: "Mais de 10 anos, pois o sono não consome nada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o modo standby costuma exigir cuidado extra no firmware?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ao acordar, o chip reinicia do zero, sem a RAM",
                            isCorrect: true,
                        },
                        {
                            text: "Ele desativa o watchdog de forma permanente",
                            isCorrect: false,
                        },
                        {
                            text: "Ele corrompe a flash se durar mais de um dia",
                            isCorrect: false,
                        },
                        {
                            text: "Ele exige recalibrar o ADC a cada dez ciclos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Resets e brown-out",
            blocks: [
                {
                    type: "text",
                    value: "# Por que eu acordei?\n\nTodo boot tem uma história, e o chip a conta: um registrador de causa de reset (RCC_CSR nos STM32) guarda flags dizendo por que o firmware está começando. Energia que acabou de chegar (power-on). O pino de reset acionado, por dedo ou por gravador. O watchdog, que estourou porque o firmware travou. Um reset por software, pedido pelo próprio código, comum ao fim de um OTA. Um brown-out, a tensão que afundou. Firmware maduro começa lendo essas flags, porque cada causa pede uma reação diferente.\n\nUm power-on merece inicialização completa e otimista. Um reset de watchdog é uma cena de crime: o firmware anterior travou, e o mínimo profissional é incrementar um contador persistente e, dependendo do produto, entrar num modo cauteloso de diagnóstico. Um brown-out pede desconfiança dos dados: o que estava sendo escrito quando a tensão caiu pode estar pela metade.\n\nEsses contadores de causa, gravados na flash de diagnóstico, valem ouro no suporte de campo: um aparelho que reinicia por watchdog três vezes por semana tem um bug; um que acumula brown-outs tem um problema de fonte ou de bateria. Sem os contadores, os dois parecem o mesmo produto saudável.",
                },
                {
                    type: "table",
                    value: '[["Causa do reset","O que significa","Reação típica do firmware"],["Power-on","A energia chegou agora","Inicialização completa"],["Pino de reset","Dedo humano ou gravador agiu","Inicialização completa"],["Watchdog","O firmware travou e foi resgatado","Registrar e entrar em diagnóstico"],["Brown-out","A tensão caiu abaixo do limiar","Validar fonte e dados persistidos"],["Software","O próprio código pediu o reset","Fluxo esperado, como após um OTA"]]',
                },
                {
                    type: "code",
                    value: "void investigar_boot(void) {\n    const uint32_t causa = RCC_CSR;    /* flags de causa de reset */\n\n    if (causa & RCC_CSR_IWDGRSTF) {    /* watchdog agiu           */\n        contadores.watchdog++;\n        entrar_em_diagnostico();\n    }\n    if (causa & RCC_CSR_BORRSTF) {     /* brown-out               */\n        contadores.brownout++;\n        validar_dados_persistidos();\n    }\n    RCC_CSR |= RCC_CSR_RMVF;   /* limpa as flags para o proximo boot */\n}",
                },
                {
                    type: "text",
                    value: "## Brown-out, o inimigo silencioso\n\nBrown-out é a queda parcial: a tensão não chega a zero, só afunda abaixo do que o chip precisa. As causas são mundanas: o motor que liga e afoga a fonte, a bateria no fim, um conector oxidado. E o perigo é que, com tensão marginal, o processador não para educadamente: ele executa errado. Instruções corrompem, a RAM perde bits, e uma escrita de flash em andamento grava lixo.\n\nA defesa é o BOR, brown-out reset: um comparador em hardware que segura o chip em reset enquanto a tensão estiver abaixo de um limiar configurável. Com o BOR bem ajustado, o sistema tem só dois estados possíveis: funcionando com tensão saudável, ou parado em reset. Some o limbo do meio, que é onde nascem os bugs impossíveis de reproduzir. Configure o limiar acima do mínimo do datasheet com folga, considerando a pior queda que a sua fonte produz.\n\nE feche o ciclo com o registrador de causa: brown-outs frequentes no contador de campo são um recado da eletrônica para o firmware, e o time de hardware vai agradecer o dado. Diagnóstico bom é o que transforma acaso em estatística.",
                },
                {
                    type: "quote",
                    value: "Firmware maduro começa o dia como detetive: antes de fazer qualquer coisa, pergunta por que está acordando. A resposta muda tudo o que vem depois.",
                },
            ],
            questions: [
                {
                    statement: "O que o firmware deve fazer logo no início do boot?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ler o registrador de causa do reset e reagir a ela",
                            isCorrect: true,
                        },
                        {
                            text: "Apagar a flash de dados para começar do zero limpo",
                            isCorrect: false,
                        },
                        {
                            text: "Ligar todos os periféricos do chip para o autoteste",
                            isCorrect: false,
                        },
                        {
                            text: "Esperar dez segundos pela estabilização do clock",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é um brown-out?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Queda parcial da tensão abaixo do limiar seguro",
                            isCorrect: true,
                        },
                        {
                            text: "Um curto-circuito entre dois pinos de saída do chip",
                            isCorrect: false,
                        },
                        {
                            text: "O aquecimento do regulador acima do valor previsto",
                            isCorrect: false,
                        },
                        {
                            text: "A perda do clock externo por defeito do cristal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que operar sem BOR é perigoso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Com tensão baixa, o chip executa de forma errática",
                            isCorrect: true,
                        },
                        {
                            text: "O chip passa a consumir o dobro da corrente nominal",
                            isCorrect: false,
                        },
                        {
                            text: "A flash inteira fica ilegível até o próximo power-on",
                            isCorrect: false,
                        },
                        {
                            text: "O watchdog para de contar durante as quedas de tensão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Um reset por watchdog registrado no boot indica o quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O firmware travou e o watchdog o resgatou",
                            isCorrect: true,
                        },
                        {
                            text: "A bateria chegou ao fim da vida útil prevista",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário desligou o produto pela chave física",
                            isCorrect: false,
                        },
                        {
                            text: "A gravação anterior falhou na etapa de verify",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Após um reset por brown-out, por que validar os dados persistidos?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Escritas na flash durante a queda podem ter corrompido",
                            isCorrect: true,
                        },
                        {
                            text: "O brown-out apaga sempre o primeiro setor da flash",
                            isCorrect: false,
                        },
                        {
                            text: "O registrador de causa zera os checksums gravados",
                            isCorrect: false,
                        },
                        {
                            text: "A RAM retida perde a paridade depois de cada queda",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O mundo analógico é sujo",
            blocks: [
                {
                    type: "text",
                    value: "# Defensive firmware\n\nNo laboratório, os sinais são limpos. No campo, o seu produto divide o mundo com motores, relés, reatores de lâmpada, rádios e descargas eletrostáticas. Interferência eletromagnética (EMI) acopla nas trilhas e nos cabos, e o firmware vê o resultado: botões que disparam sozinhos, ADC oscilando sem sinal, bytes corrompidos na serial, e o clássico travamento aleatório que só acontece na fábrica do cliente, nunca na sua mesa.\n\nParte da defesa é da eletrônica: capacitores de desacoplo, filtros RC, layout cuidadoso, blindagem. Mas a última linha é sua, e tem nome: firmware defensivo. A premissa é humilde e libertadora: toda entrada física pode mentir. Botão gagueja, sensor alucina, fio inventa. O código que assume isso filtra, confere e sobrevive; o código ingênuo funciona na bancada e falha na colheita.\n\nAs armas são simples e a tabela abaixo as pareia com os sintomas: debounce e filtros para entradas digitais, média e limites de sanidade para as analógicas, CRC para as comunicações, e watchdog com BOR guardando o conjunto. Nenhuma exige hardware novo; todas exigem disciplina.",
                },
                {
                    type: "table",
                    value: '[["Sintoma no campo","Causa provável","Defesa no firmware"],["Botão dispara sozinho","EMI acoplada na trilha","Debounce por amostragem e filtro RC"],["ADC oscila sem sinal mudar","Ruído de fonte ou de trilha","Média de amostras e Vref estável"],["Bytes corrompidos na serial","Ruído no cabo comprido","CRC no protocolo e descarte do frame"],["Travamento aleatório","Pico de EMI de relé ou motor","Watchdog, BOR e código defensivo"]]',
                },
                {
                    type: "code",
                    value: "/* Debounce por amostragem: um timer chama a cada 1 ms */\nvoid amostrar_botao(void) {\n    static uint8_t historia = 0xFFu;\n    historia = (uint8_t)((historia << 1) | ler_pino());\n    if (historia == 0x00u) { estado = APERTADO; } /* 8 baixas seguidas */\n    if (historia == 0xFFu) { estado = SOLTO;    } /* 8 altas seguidas  */\n}\n\n/* Regra de ouro: toda espera por hardware tem prazo. */\nbool esperar_flag(volatile uint32_t *reg, uint32_t mask, uint32_t max_ms);",
                },
                {
                    type: "text",
                    value: "## Debounce revisitado e leituras desconfiadas\n\nO debounce do módulo 2 esperava 20 ms e relia: honesto, mas bloqueante. A versão adulta usa o timer: a cada milissegundo, uma amostra do pino entra num registrador de histórico deslizante, como no código acima. Oito amostras idênticas seguidas confirmam o estado novo. Nenhum delay, nenhum bloqueio, imunidade a pulsos curtos de ruído, e o mesmo padrão serve para qualquer entrada digital suja.\n\nPara as analógicas, além da média do módulo 2, entra a checagem de plausibilidade: temperatura ambiente não sobe 40 graus em 100 ms; se a leitura diz isso, a leitura mente, e o firmware descarta o ponto fora da curva em vez de acionar o alarme. Limites físicos do sensor, taxa máxima de variação e coerência entre sensores redundantes são réguas baratas que eliminam decisões tomadas sobre lixo.\n\nE a regra de ouro que amarra o módulo: toda espera por hardware tem timeout. O sensor I2C que não responde, a flag que nunca sobe, o rádio mudo: sem prazo, cada um é um ponto de travamento esperando o dia de EMI. Com prazo, viram erros tratados, contados e visíveis no diagnóstico.",
                },
                {
                    type: "quote",
                    value: "O firmware defensivo parte de uma premissa humilde: o mundo vai mentir para você. Sensores mentem, fios mentem, botões gaguejam. Confiança se constrói com filtro, prazo e conferência.",
                },
            ],
            questions: [
                {
                    statement: "Qual premissa define o firmware defensivo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Entradas físicas podem mentir e precisam de filtro",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador corrige leituras erradas sozinho",
                            isCorrect: false,
                        },
                        {
                            text: "O hardware atual não produz ruído eletromagnético",
                            isCorrect: false,
                        },
                        {
                            text: "Os erros analógicos desaparecem com um clock maior",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual defesa combate bytes corrompidos num cabo serial ruidoso?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "CRC no protocolo e descarte do frame inválido",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar o baud rate para escapar do ruído",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a UART pelo I2C usando o mesmo cabo",
                            isCorrect: false,
                        },
                        {
                            text: "Transmitir cada frame com o dobro da tensão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como funciona o debounce por amostragem periódica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "N amostras iguais seguidas confirmam o novo estado",
                            isCorrect: true,
                        },
                        {
                            text: "O pino é lido uma vez após um atraso aleatório",
                            isCorrect: false,
                        },
                        {
                            text: "A interrupção do pino fica desligada por um minuto",
                            isCorrect: false,
                        },
                        {
                            text: "O timer inverte a leitura a cada borda recebida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é uma checagem de plausibilidade numa leitura de sensor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Rejeitar valores fisicamente impossíveis no contexto",
                            isCorrect: true,
                        },
                        {
                            text: "Comparar a leitura com a média de fábrica do lote",
                            isCorrect: false,
                        },
                        {
                            text: "Repetir a leitura até o valor esperado aparecer",
                            isCorrect: false,
                        },
                        {
                            text: "Converter a leitura para inteiro antes de validar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que todo laço de espera por hardware precisa de timeout?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Sem prazo, uma falha externa trava o firmware inteiro",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador remove laços que esperam tempo demais",
                            isCorrect: false,
                        },
                        {
                            text: "O watchdog só conta quando existe timeout declarado",
                            isCorrect: false,
                        },
                        {
                            text: "Laços de espera longos saturam o barramento interno",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Flash por dentro",
            blocks: [
                {
                    type: "text",
                    value: "# A memória que se gasta\n\nA flash parece um disco: grava, lê, persiste. Por dentro, é outra criatura, com três regras que todo firmware de produto precisa respeitar. Primeira: escrever só muda bits de 1 para 0. Uma célula apagada lê 1; a escrita derruba os bits escolhidos. Para voltar um bit a 1, só apagando. Segunda: o apagamento não é por byte, é por página ou setor inteiro, blocos de centenas de bytes a dezenas de kilobytes. Atualizar um único byte de configuração custa, na prática, apagar e reescrever o setor. Terceira: cada setor aguenta um número finito de ciclos de apagamento, a endurance, tipicamente entre 10 mil e 100 mil.\n\nJunte as três e o desenho de perigo aparece: o firmware ingênuo que regrava a configuração no mesmo endereço a cada mudança está consumindo a vida daquele setor. Dez gravações por dia contra 10 mil ciclos são três anos até o setor começar a falhar, e ele falha do jeito mais cruel: aos poucos, com bits que não seguram o valor.\n\nSome o detalhe operacional, escrita lenta e apagamento mais lento ainda, na casa dos milissegundos, e fica claro: persistência em flash se projeta, não se improvisa.",
                },
                {
                    type: "table",
                    value: '[["Propriedade","Regra","Consequência prática"],["Escrita","Só muda bits de 1 para 0","Escrever exige área previamente apagada"],["Apagamento","Por página ou setor inteiro","Atualizar 1 byte custa o setor todo"],["Endurance","10 mil a 100 mil ciclos por setor","Gravar sempre no mesmo lugar mata o setor"],["Retenção","Anos, com margem de projeto","Dado crítico pede checksum mesmo assim"],["Velocidade","Escrita lenta; apagar, mais ainda","Nunca dentro de ISR; planejar o tempo"]]',
                },
                {
                    type: "code",
                    value: "typedef struct {\n    uint32_t seq;    /* numero de sequencia crescente   */\n    Config   cfg;    /* o dado util                     */\n    uint16_t crc;    /* CRC-16 de seq + cfg             */\n} Registro;\n\n/* Log rotativo num setor dedicado:\n   - cada gravacao vai para o PROXIMO slot livre;\n   - no boot, varrer os slots, validar CRC e ficar\n     com o registro valido de maior seq;\n   - setor cheio: apagar uma vez e recomecar do slot 0.\n   O desgaste cai por N (numero de slots por setor).   */",
                },
                {
                    type: "text",
                    value: "## Wear leveling caseiro e conferência\n\nA solução clássica cabe num setor e está esboçada no código acima: o log rotativo. Em vez de reescrever a configuração no mesmo endereço, cada versão nova é anexada no próximo slot livre, com um número de sequência e um CRC. O boot varre o setor, ignora slots corrompidos e adota o registro válido mais recente. O setor só é apagado quando enche, então o desgaste se divide pelo número de slots: um setor de 4 KB com registros de 64 bytes vive 64 vezes mais. É wear leveling caseiro, e resolve a maioria dos produtos.\n\nO CRC em cada registro não é enfeite: energia cai no meio de escrita, e o brown-out da aula anterior deixa registros pela metade. Com CRC, o registro rasgado é ignorado e o anterior vale; para configurações vitais, duas cópias alternadas (ping-pong) garantem que sempre exista uma íntegra.\n\nQuando o volume cresce, a indústria em 2026 sobe um degrau: EEPROM emulada dos fabricantes, sistemas de arquivos com wear leveling como o LittleFS, ou um chip de FRAM para dados que mudam o tempo todo. O princípio, porém, é o mesmo do seu setor rotativo: espalhar o desgaste e nunca confiar numa escrita sem conferência.",
                },
                {
                    type: "quote",
                    value: "A flash não esquece de repente: ela se gasta em silêncio, um apagamento por vez. Quem grava no mesmo endereço todos os dias está cavando o próprio bug de campo.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a regra fundamental de escrita da memória flash?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Escrever só muda bits de 1 para 0; apagar restaura",
                            isCorrect: true,
                        },
                        {
                            text: "Escrever alterna os bits conforme a paridade do byte",
                            isCorrect: false,
                        },
                        {
                            text: "Escrever exige o dobro da tensão da leitura comum",
                            isCorrect: false,
                        },
                        {
                            text: "Escrever funciona apenas em endereços múltiplos de 4",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa a endurance de 10 mil ciclos de um setor?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O setor aguenta cerca de 10 mil apagamentos",
                            isCorrect: true,
                        },
                        {
                            text: "O setor lê no máximo 10 mil vezes por segundo",
                            isCorrect: false,
                        },
                        {
                            text: "O chip funciona por 10 mil horas contínuas",
                            isCorrect: false,
                        },
                        {
                            text: "O setor guarda até 10 mil bytes de registros",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que atualizar um único byte pode custar um setor inteiro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É preciso apagar o setor antes de reescrever nele",
                            isCorrect: true,
                        },
                        {
                            text: "O barramento da flash só transfere setores cheios",
                            isCorrect: false,
                        },
                        {
                            text: "O CRC do setor precisa ser refeito pelo hardware",
                            isCorrect: false,
                        },
                        {
                            text: "A flash converte bytes isolados em blocos de 4 KB",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o log rotativo espalha o desgaste da flash?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada gravação vai para o próximo slot, não o mesmo",
                            isCorrect: true,
                        },
                        {
                            text: "Ele comprime os registros antes de cada gravação",
                            isCorrect: false,
                        },
                        {
                            text: "Ele alterna as gravações entre a flash e a RAM",
                            isCorrect: false,
                        },
                        {
                            text: "Ele reduz a tensão de escrita a cada novo ciclo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que todo registro persistido leva CRC, mesmo com a flash saudável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A energia pode cair no meio da escrita do registro",
                            isCorrect: true,
                        },
                        {
                            text: "O CRC acelera a leitura sequencial dos registros",
                            isCorrect: false,
                        },
                        {
                            text: "A norma MISRA exige CRC em toda struct gravada",
                            isCorrect: false,
                        },
                        {
                            text: "Sem o CRC o setor não aceita novos apagamentos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Bootloader e OTA",
            blocks: [
                {
                    type: "text",
                    value: "# Atualizar sem virar tijolo\n\nEm 2026, atualizar firmware pelo ar (OTA) deixou de ser luxo: produto conectado sem OTA é produto com bug eterno. Mas o OTA carrega o risco mais assustador do ofício: se a atualização der errado no meio, queda de energia, imagem corrompida, bug na nova versão, o dispositivo pode virar tijolo a mil quilômetros da sua mesa.\n\nA arquitetura que domesticou esse risco tem três peças. Um bootloader pequeno e imutável, que roda primeiro e decide qual firmware iniciar. E duas partições de aplicação, A e B: uma executa, a outra é o alvo da atualização. O firmware novo é gravado por inteiro na partição inativa, enquanto a ativa continua rodando o produto normalmente. Só depois de a imagem completa ser validada, CRC ou hash conferido, assinatura verificada nos produtos que levam segurança a sério, a flag de boot passa a apontar para a partição nova.\n\nRepare no que essa ordem compra: em nenhum instante o sistema fica sem um firmware íntegro. A energia pode cair durante o download, durante a gravação, durante a validação: o bootloader encontra a partição antiga intacta e a vida continua.",
                },
                {
                    type: "table",
                    value: '[["Peça","Papel","Regra de ouro"],["Bootloader","Escolhe e valida a partição de boot","Pequeno, estável, quase nunca muda"],["Partição A","Firmware em execução","Nunca sobrescrita enquanto ativa"],["Partição B","Destino da imagem nova","Gravada e validada por completo"],["Flag de boot","Aponta a partição que vale","Trocada só após validar a imagem"],["Confirmação","O firmware novo se declara saudável","Sem ela, rollback automático"]]',
                },
                {
                    type: "text",
                    value: "## A coreografia completa\n\nO fluxo maduro acrescenta um último seguro: o rollback. Ao trocar a flag, o bootloader marca a partição nova como em teste. O firmware novo sobe, roda seus autotestes, confirma que o rádio conecta e os sensores respondem, e então grava a confirmação definitiva. Se ele travar antes disso, o watchdog reinicia o chip, o bootloader vê a partição em teste sem confirmação e volta, sozinho, para a versão anterior. O bug que passou pelo seu CI não mata o produto: custa um reboot e um alerta de telemetria.\n\nDetalhes de execução que separam o OTA de verdade do improviso: baixar em blocos com CRC por bloco e retomada, porque redes caem; validar versão e compatibilidade de hardware antes de gravar, para o firmware do modelo novo não parar no modelo velho; e jamais aceitar imagem sem verificação de origem, porque OTA sem assinatura é uma porta de entrada com tapete de boas-vindas.\n\nNada disso precisa nascer do zero: o ESP-IDF traz o esquema A/B pronto, e o MCUboot é o padrão aberto do mundo Cortex-M. O seu trabalho é entender a coreografia para configurá-la com juízo, e é isso que o projeto final vai exigir.",
                },
                {
                    type: "quote",
                    value: "A pergunta que projeta um OTA não é como gravar o firmware novo: é o que acontece se a energia cair agora. Em cada passo do fluxo, a resposta precisa ser: nada de grave.",
                },
            ],
            questions: [
                {
                    statement: "Por que o OTA usa duas partições (A/B)?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A antiga fica intacta enquanto a nova é gravada",
                            isCorrect: true,
                        },
                        {
                            text: "Duas partições dobram a velocidade da gravação",
                            isCorrect: false,
                        },
                        {
                            text: "O rádio exige uma partição dedicada só para ele",
                            isCorrect: false,
                        },
                        {
                            text: "A flash só permite leitura em metades separadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando a flag de boot deve passar a apontar para a partição nova?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Só depois de a imagem completa ser validada",
                            isCorrect: true,
                        },
                        {
                            text: "Assim que o primeiro bloco chegar pelo rádio",
                            isCorrect: false,
                        },
                        {
                            text: "Antes do download, para reservar o espaço",
                            isCorrect: false,
                        },
                        {
                            text: "No máximo um minuto após o início do OTA",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o rollback automático detecta que o firmware novo é ruim?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem confirmação após o boot, volta-se à antiga",
                            isCorrect: true,
                        },
                        {
                            text: "O bootloader compara o tamanho das duas imagens",
                            isCorrect: false,
                        },
                        {
                            text: "O servidor de OTA envia um comando de reversão",
                            isCorrect: false,
                        },
                        {
                            text: "A partição nova se apaga sozinha ao dar falha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o papel do bootloader no esquema A/B?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Escolher e validar a partição que vai executar",
                            isCorrect: true,
                        },
                        {
                            text: "Baixar a imagem nova diretamente do servidor",
                            isCorrect: false,
                        },
                        {
                            text: "Comprimir o firmware antigo para liberar espaço",
                            isCorrect: false,
                        },
                        {
                            text: "Medir o desgaste da flash antes de cada gravação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o bootloader deve ser pequeno e quase nunca mudar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ele é o único código sem plano B se corromper",
                            isCorrect: true,
                        },
                        {
                            text: "Ele roda na RAM, que é menor do que a flash",
                            isCorrect: false,
                        },
                        {
                            text: "Ele precisa caber no cache de instruções do chip",
                            isCorrect: false,
                        },
                        {
                            text: "Ele é regravado a cada OTA junto com a imagem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Qualidade em firmware",
    aulas: [
        {
            titulo: "MISRA e por quê",
            blocks: [
                {
                    type: "text",
                    value: "# Cortando a corda bamba\n\nC e C++ dão poder demais e avisam de menos: comportamento indefinido, conversões implícitas que perdem valor em silêncio, variáveis que nascem com lixo de RAM. Num site, esses deslizes custam um bug report; num controlador de freio ou numa bomba de insulina, custam outra coisa. Foi da indústria automotiva que veio a resposta com mais tração: o MISRA C (e o MISRA C++), um conjunto de regras que restringe a linguagem a um subset onde as armadilhas conhecidas ficam do lado de fora.\n\nO espírito importa mais que o decoreba: as regras não são sobre estética, são sobre eliminar classes inteiras de erro. Tipos de largura explícita (uint32_t, nunca um int de tamanho incerto) matam surpresas entre compiladores. A proibição de alocação dinâmica em regime mata a fragmentação. A exigência de inicializar tudo mata o lixo de RAM virando decisão. A restrição a expressões com efeitos colaterais duplos mata a dependência de ordem de avaliação que o padrão não garante.\n\nNa prática, ninguém confere isso no olho: analisadores estáticos varrem o código a cada build e apontam cada violação, com número de regra e linha. A tabela abaixo dá o sabor das regras mais formadoras.",
                },
                {
                    type: "table",
                    value: '[["Regra (espírito)","Risco que corta","Exemplo prático"],["Tipos de largura explícita","Tamanhos que variam entre chips","uint32_t no lugar de int"],["Sem conversão implícita perigosa","Perda silenciosa de valor","Cast explícito e verificado"],["Toda variável inicializada","Lixo de RAM virando decisão","Valor definido na declaração"],["Sem alocação dinâmica em regime","Fragmentação e malloc falhando","Buffers e pools estáticos"],["Sem efeitos colaterais duplos","Ordem de avaliação indefinida","i++ fora de expressões compostas"]]',
                },
                {
                    type: "text",
                    value: "## Segurança funcional como panorama\n\nO MISRA é o degrau de entrada de um edifício maior: a segurança funcional, a disciplina de provar que um sistema eletrônico falha de forma segura. Cada indústria tem sua norma. A ISO 26262 rege o automotivo e classifica funções por ASIL, de A a D, conforme o perigo: quanto mais alto, mais rigor de processo, análise e teste. A DO-178C rege o software aeronáutico com seus níveis DAL, do E ao A, onde o nível A significa que falha catastrófica exige evidência quase matemática. A IEC 61508, mãe industrial de todas, fala em SIL.\n\nVocê não precisa decorar essas siglas para escrever bom firmware; precisa saber que elas existem, que definem processo além de código (requisitos rastreáveis, cobertura de teste, revisões independentes) e que empregos inteiros vivem nesse mundo. Se a sua carreira apontar para automotivo, médico ou aeroespacial, elas viram o seu dia a dia.\n\nUm detalhe maduro do MISRA fecha a aula: o desvio. Regra atrapalhando um caso legítimo pode ser quebrada, desde que a exceção seja registrada com justificativa técnica e aprovação. Disciplina não é cegueira: é rastro escrito de cada escolha.",
                },
                {
                    type: "quote",
                    value: "MISRA não existe para agradar: existe porque o C deixa você andar na corda bamba sem avisar. As regras são o corrimão que times de freio e marca-passo decidiram não dispensar.",
                },
            ],
            questions: [
                {
                    statement: "O que é o MISRA C?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um conjunto de regras que restringe o C a um subset seguro",
                            isCorrect: true,
                        },
                        {
                            text: "Um compilador certificado para uso na indústria automotiva",
                            isCorrect: false,
                        },
                        {
                            text: "Um sistema operacional de tempo real para carros e aviões",
                            isCorrect: false,
                        },
                        {
                            text: "Uma norma que define o hardware dos módulos automotivos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como as regras MISRA são verificadas na prática?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Por analisadores estáticos rodando sobre o código",
                            isCorrect: true,
                        },
                        {
                            text: "Por revisões manuais semanais do time de firmware",
                            isCorrect: false,
                        },
                        {
                            text: "Pelo próprio chip, ao executar o binário gravado",
                            isCorrect: false,
                        },
                        {
                            text: "Por um conjunto de flags dentro do linker script",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o espírito comum das regras MISRA?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Eliminar classes inteiras de comportamento indefinido",
                            isCorrect: true,
                        },
                        {
                            text: "Padronizar a indentação e os nomes das variáveis",
                            isCorrect: false,
                        },
                        {
                            text: "Reduzir o tamanho do binário gerado pelo compilador",
                            isCorrect: false,
                        },
                        {
                            text: "Acelerar a compilação dos projetos grandes da área",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que são a ISO 26262 e a DO-178C?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Normas de segurança funcional: automotiva e aeronáutica",
                            isCorrect: true,
                        },
                        {
                            text: "Padrões de conector e cabo para gravadores SWD e JTAG",
                            isCorrect: false,
                        },
                        {
                            text: "Protocolos de comunicação entre os módulos de um carro",
                            isCorrect: false,
                        },
                        {
                            text: "Certificações de eficiência energética para novos MCUs",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é um desvio (deviation) no processo MISRA?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Quebra de regra registrada com justificativa técnica",
                            isCorrect: true,
                        },
                        {
                            text: "Um bug de campo confirmado pelo time de qualidade",
                            isCorrect: false,
                        },
                        {
                            text: "A margem de erro aceita pelo analisador estático",
                            isCorrect: false,
                        },
                        {
                            text: "Uma regra nova proposta pelo fornecedor do silício",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Testar sem hardware",
            blocks: [
                {
                    type: "text",
                    value: "# A lógica não precisa da placa\n\nO reflexo de testar firmware gravando na placa tem três problemas: é lento, não escala e prende o teste ao único exemplar de hardware sobre a mesa. A saída é arquitetural, e é a decisão de design mais importante deste módulo: separar o código que pensa do código que toca registrador.\n\nA fronteira é uma HAL fina: uma interface mínima com só o que a lógica precisa do hardware, como ler um registrador do sensor ou enviar um frame. A lógica de negócio, o parser do protocolo, a máquina de estados, a conversão de unidades, o filtro, recebe essa interface por injeção de dependência e nunca inclui um header de fabricante. No produto, a implementação real fala I2C; no teste, um fake em RAM devolve bytes roteirizados, inclusive os maus: timeouts, CRC errado, valores absurdos.\n\nO prêmio é enorme: essa lógica compila para o seu próprio computador, o host, e roda milhares de casos em milissegundos, dentro de qualquer framework de teste comum. O bug de parser que na placa exigiria uma tarde com o gravador aparece num teste que roda a cada salvamento de arquivo. O código abaixo mostra o desenho mínimo.",
                },
                {
                    type: "code",
                    value: "struct IBarramento {            /* HAL fina: so o que a logica usa */\n    virtual bool ler(uint8_t reg, uint8_t &v) = 0;\n};\n\nclass SensorTemp {\npublic:\n    explicit SensorTemp(IBarramento &bus) : bus_(bus) {}\n    Erro ler_celsius(float &out);   /* logica pura, testavel */\nprivate:\n    IBarramento &bus_;\n};\n\n/* No alvo: implementacao I2C de verdade.\n   No teste: um fake que devolve bytes roteirizados,\n   inclusive falhas de timeout e CRC invalido.       */",
                },
                {
                    type: "table",
                    value: '[["Camada","Onde roda","O que pega","Velocidade"],["Unitária","Host (seu PC)","Lógica, parser, máquina de estados","Milissegundos"],["Integração com fakes","Host","Interação entre os módulos","Segundos"],["HIL na placa","Alvo real","Timing, periférico real, consumo","Minutos"],["Piloto em campo","Produto real","O que ninguém previu","Semanas"]]',
                },
                {
                    type: "text",
                    value: "## A pirâmide de testes do firmware\n\nA tabela acima é uma pirâmide: larga na base, estreita no topo. A base são os testes de unidade no host, numerosos e instantâneos, cobrindo a lógica onde mora a maioria dos bugs. O meio são integrações ainda no host, módulos conversando entre si sobre fakes, o protocolo inteiro testado contra frames corrompidos byte a byte. O topo é o HIL, hardware in the loop: a placa real, com periféricos reais, executando cenários de ponta a ponta, poucos e valiosos.\n\nCada andar pega o que o de baixo não alcança. Só o alvo revela o timing verdadeiro, o periférico com erratas, o consumo em microamperes, a ISR que chega no pior momento. Mas note a proporção madura: se um bug de conversão de unidades só aparece no HIL, ele está no andar errado, custando minutos onde deveria custar milissegundos.\n\nEssa arquitetura tem um efeito colateral virtuoso: código testável no host é código com fronteiras limpas, dependências explícitas e acoplamento baixo, exatamente o que o capítulo de CI vai automatizar. Testabilidade, em firmware, não é um luxo de processo: é um indicador de design.",
                },
                {
                    type: "quote",
                    value: "Se a sua lógica só roda na placa, ela não tem teste: tem demonstração. Separar o que pensa do que toca o hardware é o que torna firmware testável.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma HAL fina no contexto de testes?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma interface mínima isolando o acesso ao hardware",
                            isCorrect: true,
                        },
                        {
                            text: "Uma biblioteca gráfica para simular a placa no PC",
                            isCorrect: false,
                        },
                        {
                            text: "Uma camada que acelera o barramento durante testes",
                            isCorrect: false,
                        },
                        {
                            text: "O driver oficial completo fornecido pelo fabricante",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde rodam os testes unitários da lógica do firmware?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No host, compilados para a máquina do desenvolvedor",
                            isCorrect: true,
                        },
                        {
                            text: "Na placa, gravados junto com o binário de produção",
                            isCorrect: false,
                        },
                        {
                            text: "No bootloader, antes de o firmware principal subir",
                            isCorrect: false,
                        },
                        {
                            text: "No servidor do fabricante, pela ferramenta da IDE",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como a injeção de dependência ajuda a testar um driver de sensor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O teste entrega um fake do barramento à classe",
                            isCorrect: true,
                        },
                        {
                            text: "O teste desativa o construtor da classe testada",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador injeta valores válidos no registrador",
                            isCorrect: false,
                        },
                        {
                            text: "O linker troca a RAM do alvo pela memória do host",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que os testes na placa (HIL) pegam que o host não pega?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Timing real, periféricos de verdade e consumo",
                            isCorrect: true,
                        },
                        {
                            text: "Erros de sintaxe que o compilador deixou passar",
                            isCorrect: false,
                        },
                        {
                            text: "Vazamentos de memória da biblioteca padrão do C",
                            isCorrect: false,
                        },
                        {
                            text: "Diferenças de indentação entre os arquivos fonte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a base da pirâmide fica no host, e não na placa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Milhares de casos rodam em segundos, sem gravação",
                            isCorrect: true,
                        },
                        {
                            text: "O hardware de teste é proibido pelas normas MISRA",
                            isCorrect: false,
                        },
                        {
                            text: "A placa não consegue executar código de teste em C",
                            isCorrect: false,
                        },
                        {
                            text: "Os fakes são mais fiéis que os periféricos reais",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Debug em placa",
            blocks: [
                {
                    type: "text",
                    value: "# Ver o chip por dentro\n\nQuando o bug sobrevive aos testes de host, é hora de olhar dentro do silício, e a porta de entrada é a mesma sonda que grava o firmware. O SWD, padrão do Cortex-M com apenas dois fios (SWDIO e SWCLK), e o JTAG, seu ancestral mais largo, dão à sonda ST-Link ou J-Link acesso ao núcleo: parar a execução onde quiser, ler e escrever registradores e memória, avançar instrução por instrução.\n\nOs breakpoints de hardware param o programa num endereço exato sem modificar o código gravado; o Cortex-M oferece poucos, tipicamente de quatro a oito, e a IDE administra o estoque. Mais raros e mais preciosos são os watchpoints: param quando um endereço de dados é lido ou escrito. É a ferramenta definitiva para o clássico quem está corrompendo minha variável: arme o watchpoint no endereço e o culpado aparece com a mão na massa, com pilha de chamadas e tudo.\n\nO poder tem um limite filosófico: parar o núcleo não para o mundo. O motor continua girando, o sensor continua enviando, o protocolo do outro lado estoura timeout. Em sistemas vivos, o breakpoint muda o comportamento que você investiga, e é aí que entram as técnicas da tabela.",
                },
                {
                    type: "table",
                    value: '[["Ferramenta","O que dá","Limite honesto"],["SWD com sonda","Parar, inspecionar, passo a passo","Parar o núcleo distorce sistemas vivos"],["Breakpoint de hardware","Parada exata sem tocar a flash","Poucos disponíveis, de 4 a 8"],["Watchpoint","Flagra quem acessa um endereço","Mais raros ainda, de 2 a 4"],["printf pela UART","Rastro temporal do fluxo real","Custa milissegundos e muda o timing"],["LED de status","Sinal de vida a custo quase nulo","Um bit de informação por LED"]]',
                },
                {
                    type: "text",
                    value: "## printf, LED e o custo de observar\n\nO printf pela UART é o rastro que não congela o sistema, e tem seu preço em tempo: a 115200 baud, cada caractere leva perto de 87 microssegundos; uma linha de 50 caracteres custa mais de 4 milissegundos com o firmware parado esperando, se a escrita for bloqueante. Isso basta para mascarar um bug de corrida ou estourar um prazo. As mitigação de gente grande: log em buffer despachado por interrupção ou DMA, mensagens curtas e em código binário, níveis de log compilados fora do build de produção. E a regra inegociável: printf dentro de ISR, jamais.\n\nNo degrau mais humilde, o LED segue imbatível: custa nanossegundos, não muda timing nenhum e responde as perguntas mais básicas: estou vivo (pisca lento), travei aqui (padrão de piscadas como código de erro), cheguei neste ramo do código (acende e apaga). Todo produto sério embarca um LED de status, e todo veterano já fechou bug difícil com ele.\n\nA síntese do ofício: cada lente distorce de um jeito. Breakpoint congela, printf atrasa, LED quase não mente mas fala pouco. Escolha a lente pela pergunta, e desconfie sempre do que a própria observação muda.",
                },
                {
                    type: "quote",
                    value: "Observar muda o observado: o printf atrasa, o breakpoint congela, o LED quase não mente. Debug embarcado é escolher a lente que menos distorce o que você precisa ver.",
                },
            ],
            questions: [
                {
                    statement: "O que o SWD permite fazer com o núcleo do microcontrolador?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Parar, inspecionar registradores e executar passo a passo",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar a frequência de clock durante a depuração longa",
                            isCorrect: false,
                        },
                        {
                            text: "Gravar a flash sem nenhuma ferramenta conectada à placa",
                            isCorrect: false,
                        },
                        {
                            text: "Medir o consumo de corrente de cada instrução executada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o papel do LED como ferramenta de debug?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dar sinal de vida e códigos de erro com custo quase nulo",
                            isCorrect: true,
                        },
                        {
                            text: "Substituir o depurador SWD nos produtos certificados",
                            isCorrect: false,
                        },
                        {
                            text: "Indicar a versão do firmware durante a inicialização",
                            isCorrect: false,
                        },
                        {
                            text: "Iluminar a placa para a inspeção visual dos conectores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quanto custa um printf bloqueante de 50 caracteres a 115200 baud?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Alguns milissegundos, o bastante para mudar o timing",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: a UART transmite em paralelo com o programa",
                            isCorrect: false,
                        },
                        {
                            text: "Alguns nanossegundos, abaixo de qualquer relevância",
                            isCorrect: false,
                        },
                        {
                            text: "Um segundo inteiro, pelo overhead fixo da biblioteca",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é um watchpoint?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma parada disparada pelo acesso a um endereço",
                            isCorrect: true,
                        },
                        {
                            text: "Um breakpoint que expira depois de dez passagens",
                            isCorrect: false,
                        },
                        {
                            text: "Um timer que mede o tempo entre duas funções",
                            isCorrect: false,
                        },
                        {
                            text: "Um LED virtual exibido na tela do depurador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que breakpoints são perigosos num sistema controlando um motor?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Congelar o núcleo não congela o mundo físico junto",
                            isCorrect: true,
                        },
                        {
                            text: "O breakpoint apaga o setor de flash onde ele cai",
                            isCorrect: false,
                        },
                        {
                            text: "O motor absorve a corrente da sonda de depuração",
                            isCorrect: false,
                        },
                        {
                            text: "O NVIC descarta as interrupções depois da parada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Versionar firmware",
            blocks: [
                {
                    type: "text",
                    value: "# Que firmware está rodando aí?\n\nA primeira pergunta de todo chamado de suporte é essa, e um produto profissional a responde sozinho. A base é a versão semântica, MAJOR.MINOR.PATCH, gravada dentro do binário como constante: PATCH sobe em correção, MINOR em funcionalidade compatível, MAJOR quando algo quebra compatibilidade com o mundo externo. Junto dela viajam o hash curto do commit e, se couber, a data do build.\n\nEssas informações têm dois consumidores. O humano: a versão sai no log de boot pela UART e aparece na etiqueta do OTA. E a máquina: um comando do protocolo devolve a versão, para o gateway saber com quem fala antes de decidir qualquer coisa. Em campo, essa resposta transforma um chamado nebuloso (o aparelho está estranho) num dado técnico (roda a 2.4.1, o bug foi corrigido na 2.4.2).\n\nRegra de fabricação: a versão tem uma única fonte de verdade, o sistema de build, que gera o header a partir da tag do repositório. Editar número de versão na mão é convite para o pior bug de gestão que existe: dois binários diferentes respondendo o mesmo nome. Versão que já saiu não se reusa, nunca.",
                },
                {
                    type: "code",
                    value: '/* versao.h GERADO no build a partir da tag do git */\n#define FW_VERSAO_MAJOR 2u\n#define FW_VERSAO_MINOR 4u\n#define FW_VERSAO_PATCH 1u\n#define FW_GIT_HASH     "a3f9c21"\n\ntypedef struct {\n    uint8_t major, minor, patch;\n    char    hash[8];\n} VersaoFw;\n\n/* respondida pelo comando 0x01 do protocolo:\n   o gateway sempre sabe com quem esta falando */',
                },
                {
                    type: "table",
                    value: '[["Prática","Regra","Por quê"],["Semver no binário","MAJOR.MINOR.PATCH em constante","Suporte e OTA sabem o que roda"],["Hash do commit junto","Curto, gravado pelo build","Reconstruir o binário exato"],["Versão de protocolo separada","Muda só quando o frame muda","Firmware evolui sem quebrar o gateway"],["Changelog de campo","Uma linha por mudança visível","A operação decide quando atualizar"],["Tag no repositório","Uma tag por release publicado","Binário rastreável até o fonte"]]',
                },
                {
                    type: "text",
                    value: "## Compatibilidade e changelog de campo\n\nUm erro comum é amarrar a versão do firmware à versão do protocolo do módulo 3. São coisas diferentes com ritmos diferentes: o firmware muda toda semana; o formato do frame, poucas vezes por ano. Por isso o frame carrega o próprio byte de versão, e o contrato é claro: firmware novo pode manter o protocolo antigo, e o gateway precisa falar todas as versões de protocolo que a frota ainda usa, porque frota não atualiza em bloco: OTA acontece em ondas, aparelho desligado não atualiza, e sempre haverá três gerações vivas ao mesmo tempo.\n\nO changelog de campo é o irmão pobre e valioso da documentação: uma linha por mudança visível para quem opera, em linguagem de operação, não de commit. Corrige leitura congelada após brown-out. Novo comando 0x14 de diagnóstico. É ele que a equipe de suporte lê para decidir se a atualização resolve o chamado, e o que o cliente corporativo exige antes de autorizar o OTA na frota dele.\n\nFechando o ciclo com a aula anterior de OTA: quem decide qual versão vai para qual aparelho é o servidor, e ele decide comparando exatamente os números que você gravou no binário. Versionar bem é o que torna a frota governável.",
                },
                {
                    type: "quote",
                    value: "Firmware sem versão legível é um estranho na sua própria frota: ninguém sabe o que ele faz, e a primeira pergunta do suporte já nasce sem resposta.",
                },
            ],
            questions: [
                {
                    statement: "O que deve estar gravado dentro do binário de firmware?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A versão semântica e o hash do commit que o gerou",
                            isCorrect: true,
                        },
                        {
                            text: "O nome completo do desenvolvedor que fez o release",
                            isCorrect: false,
                        },
                        {
                            text: "A lista completa dos testes que passaram no CI",
                            isCorrect: false,
                        },
                        {
                            text: "O código fonte compactado para auditoria futura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Numa versão semântica, quando o número MAJOR sobe?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quando há quebra de compatibilidade com o externo",
                            isCorrect: true,
                        },
                        {
                            text: "Quando o binário cresce mais de dez por cento",
                            isCorrect: false,
                        },
                        {
                            text: "A cada nova gravação feita na linha de produção",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o time troca a IDE ou o compilador usado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a versão do protocolo é separada da versão do firmware?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O firmware muda muito; o frame, só às vezes",
                            isCorrect: true,
                        },
                        {
                            text: "O protocolo pertence ao fabricante do gateway",
                            isCorrect: false,
                        },
                        {
                            text: "A norma exige numerações independentes por lei",
                            isCorrect: false,
                        },
                        {
                            text: "O campo de versão do frame só tem quatro bits",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o hash do commit gravado no binário?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Reconstruir o fonte exato de um binário de campo",
                            isCorrect: true,
                        },
                        {
                            text: "Verificar a integridade da flash em todos os boots",
                            isCorrect: false,
                        },
                        {
                            text: "Autenticar o dispositivo perante o servidor OTA",
                            isCorrect: false,
                        },
                        {
                            text: "Impedir a engenharia reversa do código gravado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um gateway atende firmwares de três gerações na frota. O que isso exige dele?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Falar as versões de protocolo que a frota ainda usa",
                            isCorrect: true,
                        },
                        {
                            text: "Forçar a atualização imediata da frota instalada",
                            isCorrect: false,
                        },
                        {
                            text: "Recusar conexões de firmwares com mais de um ano",
                            isCorrect: false,
                        },
                        {
                            text: "Manter três gateways físicos, um para cada geração",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "CI pra firmware",
            blocks: [
                {
                    type: "text",
                    value: "# O robô que compila para todos os alvos\n\nTudo o que o módulo construiu converge para uma rotina: a cada push, um robô responde se o firmware ainda compila, ainda passa e ainda cabe. O CI de firmware tem as mesmas engrenagens do CI de backend, com duas particularidades que mudam o desenho.\n\nA primeira é a matriz de alvos. Um produto embarcado raramente é um binário só: são duas revisões de placa, um bootloader, uma variante de cliente, cada uma com seus defines e seu linker script. Um commit inocente pode compilar perfeitamente para a placa nova e quebrar a antiga, e ninguém percebe até a linha de produção reclamar. A matriz compila todos os alvos em paralelo, a cada push, e transforma essa quebra silenciosa em vermelho imediato.\n\nA segunda é que o teste que roda no CI é o de host, da aula de testes: unidade e integração com fakes, sem placa nenhuma no servidor. A análise estática roda junto, com as regras MISRA, e falha o build em violação nova sem desvio documentado. Placas reais entram, quando entram, num estágio noturno de HIL com um rack dedicado, valioso e raro; o feedback de cada commit vem das camadas de baixo da pirâmide.",
                },
                {
                    type: "code",
                    value: "# esqueleto de pipeline de firmware\njobs:\n  build:\n    strategy:\n      matrix:\n        alvo: [placa_a, placa_b, bootloader]\n    steps:\n      - cmake --preset ${alvo} && cmake --build build/${alvo}\n      - arm-none-eabi-size build/${alvo}/firmware.elf > size.txt\n      - ./compara_size size.txt limites.json   # falha se estourar\n      - guardar_artefatos build/${alvo}/firmware.{elf,bin}\n\n  testes-host:\n    steps: [ctest --output-on-failure]\n\n  analise-estatica:\n    steps: [analisador-misra src/]",
                },
                {
                    type: "table",
                    value: '[["Etapa do CI","O que faz","Sinal de falha"],["Build matrix","Compila cada alvo e variante","Um alvo quebrou com o commit"],["Testes de host","Roda unidade e integração","A lógica regrediu"],["Análise estática","Regras MISRA e avisos do compilador","Violação nova sem desvio"],["Relatório de size","Compara flash e RAM aos limites","Orçamento de memória estourado"],["Artefatos","Guarda .elf e .bin por commit","Release sem binário rastreável"]]',
                },
                {
                    type: "text",
                    value: "## Tamanho como métrica de regressão\n\nO relatório de size merece destaque porque é a métrica mais barata e mais negligenciada do embarcado. O pipeline roda o arm-none-eabi-size de cada alvo e compara com um arquivo de limites: flash máxima, RAM máxima, e um delta tolerado por commit. Estourou o limite, build vermelho, como um teste falhando; cresceu além do delta, aviso para o revisor perguntar o porquê. O map file do módulo 4 responde. Com isso, o crescimento do binário deixa de ser surpresa de véspera de release e vira curva acompanhada commit a commit, e o dia em que a flash acaba nunca chega sem aviso.\n\nOs artefatos fecham o sistema: todo build verde arquiva o .elf e o .bin com versão e hash no nome. O binário que foi para qualquer aparelho da frota é localizável e reproduzível, o que a aula de versionamento prometeu e o CI cumpre. O release deixa de ser um ritual manual: uma tag no repositório dispara o mesmo pipeline, que gera a imagem assinada para o OTA.\n\nCom o robô de guarda, o time embarcado ganha o que o resto do software já tinha: coragem de mudar código com rede de proteção embaixo.",
                },
                {
                    type: "quote",
                    value: "O CI de firmware responde todo dia à pergunta mais cara do embarcado: isso ainda compila, ainda passa e ainda cabe? Quem responde só no release descobre tarde.",
                },
            ],
            questions: [
                {
                    statement: "Por que o CI de firmware compila uma matriz de alvos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um commit pode quebrar uma variante sem tocar outra",
                            isCorrect: true,
                        },
                        {
                            text: "Cada compilação extra deixa o binário mais otimizado",
                            isCorrect: false,
                        },
                        {
                            text: "A licença do compilador exige builds em paralelo",
                            isCorrect: false,
                        },
                        {
                            text: "O linker soma as flashes de todas as placas juntas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais testes rodam a cada push no pipeline de firmware?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Os de host: unidade e integração com fakes",
                            isCorrect: true,
                        },
                        {
                            text: "Os de campo, executados na frota de clientes",
                            isCorrect: false,
                        },
                        {
                            text: "Somente os manuais, feitos pelo time de QA",
                            isCorrect: false,
                        },
                        {
                            text: "Os de bancada, com um técnico gravando placas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o tamanho do binário vira métrica de regressão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O CI compara flash e RAM contra limites por alvo",
                            isCorrect: true,
                        },
                        {
                            text: "O linker recusa binários maiores que o anterior",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho é postado no chat do time toda sexta",
                            isCorrect: false,
                        },
                        {
                            text: "A placa mede o binário na primeira inicialização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que guardar os artefatos (.elf e .bin) de cada build verde?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Rastrear o binário exato que foi para cada aparelho",
                            isCorrect: true,
                        },
                        {
                            text: "Economizar tempo de compilação nos builds futuros",
                            isCorrect: false,
                        },
                        {
                            text: "Cumprir a cota de armazenamento do servidor de CI",
                            isCorrect: false,
                        },
                        {
                            text: "Permitir a edição manual do binário em emergências",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual achado da análise estática deve falhar o pipeline?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Violação nova de regra MISRA sem desvio documentado",
                            isCorrect: true,
                        },
                        {
                            text: "Qualquer comentário escrito fora do padrão do time",
                            isCorrect: false,
                        },
                        {
                            text: "Funções com mais de dez linhas de código no corpo",
                            isCorrect: false,
                        },
                        {
                            text: "O uso de bibliotecas de terceiros no código do alvo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Projeto: estação meteorológica com telemetria",
    aulas: [
        {
            titulo: "Requisitos e orçamento",
            blocks: [
                {
                    type: "text",
                    value: "# O projeto que costura a trilha\n\nEste módulo é uma leitura guiada: você vai acompanhar o projeto de uma estação meteorológica remota do jeito que um engenheiro embarcado o conduziria, decisão por decisão, usando tudo o que a trilha construiu. O produto: uma caixa no meio do campo medindo temperatura, umidade e pressão, transmitindo por um rádio serial para um gateway distante, alimentada por uma bateria que ninguém quer visitar.\n\nO hardware é deliberadamente simples. Um microcontrolador Cortex-M de entrada, com 128 KB de flash. Um sensor único, o clássico BME280, entregando as três grandezas pelo barramento I2C, com os pull-ups da praxe. Um módulo de rádio que conversa por UART, recebendo frames e cuspindo-os no ar. Uma bateria de 2600 mAh. Se você comprou a placa do módulo 1, a de 30 a 80 reais, tem quase tudo para montar uma versão de bancada: o BME280 custa uns poucos reais a mais, e o rádio pode começar sendo um cabo serial até o seu notebook.\n\nAntes de qualquer linha de código, o projeto fixa requisitos com número, na tabela abaixo. Cada um tem origem: física do fenômeno, custo de manutenção, preço do chip.",
                },
                {
                    type: "table",
                    value: '[["Requisito","Valor alvo","De onde vem"],["Grandezas medidas","Temperatura, umidade, pressão","Um BME280 no barramento I2C"],["Período de amostragem","1 medida por minuto","Fenômeno lento; economia domina"],["Telemetria","1 rajada a cada 5 minutos","O rádio é o maior gasto de energia"],["Vida de bateria","Mais de 1 ano com 2600 mAh","Visita de manutenção é cara"],["Memória","Caber em 128 KB de flash","Custo e disponibilidade do chip"]]',
                },
                {
                    type: "text",
                    value: "## Os dois orçamentos\n\nO orçamento de energia começa pelo teto: 2600 mAh para um ano são 2600 divididos por 8760 horas, cerca de 0,3 mA de corrente média. Agora a soma das parcelas, no estilo do módulo 5: sono profundo a 5 µA quase o tempo todo; a medida, uns 10 mA por 50 ms a cada minuto, contribui menos de 10 µA de média; o rádio, 30 mA durante 1 segundo a cada 5 minutos, pesa 100 µA. Total: perto de 0,12 mA, metade do teto. A folga é proposital: bateria degrada, o frio rouba capacidade, e o consumo real sempre encontra um jeito de superar o planejado. Projeto que fecha no limite já nasceu estourado.\n\nO orçamento de memória divide os 128 KB de flash no papel: 16 KB para o bootloader, duas partições de aplicação de 48 KB para o OTA A/B do módulo 5, e 8 KB para o setor de log rotativo e configuração. Sobram alguns kilobytes de respiro. A RAM segue a mesma disciplina: fila de medidas, buffers de frame e pilha dimensionados com os containers estáticos do módulo 4, somados por sizeof e vigiados por static_assert.\n\nCom os números fixados, as próximas aulas desenham o software que cabe neles.",
                },
                {
                    type: "quote",
                    value: "Requisito sem número é desejo. A estação nasce com dois orçamentos fechados, energia e memória, e cada linha de código daqui em diante presta contas aos dois.",
                },
            ],
            questions: [
                {
                    statement: "Qual barramento liga o sensor de temperatura, umidade e pressão?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "I2C: um sensor único (BME280) no par de fios",
                            isCorrect: true,
                        },
                        {
                            text: "SPI, com um chip select para cada grandeza",
                            isCorrect: false,
                        },
                        {
                            text: "UART, com uma porta dedicada só ao sensor",
                            isCorrect: false,
                        },
                        {
                            text: "PWM, lendo o duty cycle do pino do sensor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a telemetria sai em rajadas a cada 5 minutos, e não contínua?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O rádio é o maior gasto: ligá-lo pouco poupa bateria",
                            isCorrect: true,
                        },
                        {
                            text: "O protocolo serial não suporta o envio contínuo",
                            isCorrect: false,
                        },
                        {
                            text: "O sensor perde precisão se o rádio ficar ligado",
                            isCorrect: false,
                        },
                        {
                            text: "A antena esquenta se transmitir por muito tempo seguido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Com 2600 mAh e alvo de 1 ano, qual é o teto de corrente média?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cerca de 0,3 mA: 2600 mAh por 8760 horas",
                            isCorrect: true,
                        },
                        {
                            text: "Cerca de 3 mA: 2600 dividido por 876 horas",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 26 mA: um centésimo da capacidade",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 0,05 mA: dez vezes o consumo do sono",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a flash de 128 KB é orçada por partições no papel, antes do código?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "OTA A/B exige duas imagens cabendo juntas no chip",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador exige saber as seções antes do build",
                            isCorrect: false,
                        },
                        {
                            text: "A flash só grava depois de particionada de fábrica",
                            isCorrect: false,
                        },
                        {
                            text: "O sensor reserva metade da flash para calibração",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que mirar o dobro da vida de bateria que o requisito pede?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Margem para frio, degradação e consumos imprevistos",
                            isCorrect: true,
                        },
                        {
                            text: "Porque baterias dobram de capacidade no segundo ano",
                            isCorrect: false,
                        },
                        {
                            text: "Para vender o produto na categoria industrial acima",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o requisito oficial sempre dobra na entrega",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Arquitetura",
            blocks: [
                {
                    type: "text",
                    value: "# Tarefas, fila e o desenho do fluxo\n\nA estação tem três atividades com ritmos e urgências diferentes, e reconhecer isso é o primeiro gesto de arquitetura. A amostragem roda uma vez por minuto e não pode atrasar: medida fora de hora fura a série histórica que o cliente vai plotar. O processamento roda logo após cada amostra: média das leituras do ADC interno de tensão, checagem de plausibilidade do módulo 5, carimbo de tempo. A telemetria roda a cada cinco minutos e pode atrasar sem drama: se o rádio estiver ocupado ou o gateway mudo, as medidas esperam.\n\nQuem concilia os ritmos é uma fila de medidas, um ring buffer estático no espírito do módulo 4, dimensionado para segurar mais de uma hora de dados: a amostragem produz numa ponta, a telemetria consome na outra, e nenhuma conhece os detalhes da outra. O acoplamento entre elas é o tipo Medida, mais nada.\n\nSem sistema operacional: o projeto usa o superloop com interrupções que a trilha inteira praticou. O RTC acorda o chip a cada minuto, a ISR só registra o evento, e o laço principal despacha o trabalho na ordem de prioridade. Um RTOS resolveria também, e com mais tarefas seria a escolha; aqui, seria bala de canhão em pardal.",
                },
                {
                    type: "table",
                    value: '[["Tarefa","Ritmo","Prioridade","Pode atrasar?"],["Amostragem","1 vez por minuto","Alta: pontualidade da série","Não: fura a série histórica"],["Processamento","Após cada amostra","Média","Um pouco, sem acumular"],["Telemetria","A cada 5 minutos","Baixa","Sim: a fila segura as medidas"],["Manutenção e OTA","Sob comando externo","Mínima","Sim, fora das janelas de medida"]]',
                },
                {
                    type: "code",
                    value: "typedef enum { DORMINDO, MEDINDO, PROCESSANDO,\n               TRANSMITINDO, MANUTENCAO, ATUALIZANDO } Estado;\n\nvoid passo(Evento ev) {\n    switch (estado) {\n    case DORMINDO:\n        if (ev == EV_RTC_MINUTO) { estado = MEDINDO; }\n        break;\n    case MEDINDO:\n        if (ev == EV_MEDIDA_OK) { estado = PROCESSANDO; }\n        if (ev == EV_TIMEOUT)   { registrar_falha(); estado = DORMINDO; }\n        break;\n    /* ... cada transicao explicita; todo estado tem timeout ... */\n    }\n}",
                },
                {
                    type: "text",
                    value: "## A máquina de estados de operação\n\nO coração do firmware é a máquina de estados esboçada acima. DORMINDO é o estado padrão, onde a bateria agradece. O alarme do RTC leva a MEDINDO, que fala com o BME280 sob timeout; sucesso leva a PROCESSANDO, que valida, carimba e enfileira; se for o quinto minuto, TRANSMITINDO liga o rádio, despeja a fila em frames e espera a confirmação do gateway, também sob prazo. MANUTENCAO atende comandos chegados pelo rádio, e ATUALIZANDO conduz a coreografia de OTA do módulo 5, com direito a rollback.\n\nDuas disciplinas fazem essa máquina ser de produto, e não de protótipo. Primeira: toda transição é explícita e está no código num único lugar, o switch; nada de flags espalhadas que combinadas formam estados fantasmas. Segunda: todo estado tem timeout de saída, a regra de ouro do módulo 5; não existe estado em que uma falha externa possa pendurar o firmware para sempre.\n\nO prêmio aparece na manutenção: qualquer colega lê o enum e o switch e enxerga o sistema inteiro. Quando a telemetria reportar que a estação passou a noite presa em TRANSMITINDO, o diagnóstico já vem com o nome do suspeito.",
                },
                {
                    type: "quote",
                    value: "Arquitetura de firmware é coreografia de ritmos diferentes: quem não pode atrasar produz, quem pode atrasar consome, e a fila entre os dois transforma pressa em paciência.",
                },
            ],
            questions: [
                {
                    statement: "Qual estrutura desacopla a amostragem da telemetria?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma fila de medidas: uma produz, a outra consome",
                            isCorrect: true,
                        },
                        {
                            text: "Uma variável global protegida por comentário",
                            isCorrect: false,
                        },
                        {
                            text: "Um arquivo temporário gravado na flash de log",
                            isCorrect: false,
                        },
                        {
                            text: "Duas cópias do sensor, uma para cada tarefa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a amostragem tem prioridade sobre a telemetria?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Atrasar a medida fura a série; o envio pode esperar",
                            isCorrect: true,
                        },
                        {
                            text: "O sensor I2C exige resposta em poucos nanossegundos",
                            isCorrect: false,
                        },
                        {
                            text: "O rádio transmite melhor com o núcleo em espera",
                            isCorrect: false,
                        },
                        {
                            text: "A fila obriga a tarefa consumidora a rodar antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que acontece se a telemetria atrasar um ciclo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Nada grave: a fila segura as medidas até o envio",
                            isCorrect: true,
                        },
                        {
                            text: "As medidas do período são perdidas para sempre",
                            isCorrect: false,
                        },
                        {
                            text: "A estação reinicia pelo watchdog imediatamente",
                            isCorrect: false,
                        },
                        {
                            text: "O sensor interrompe as medições até a fila zerar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que cada estado da máquina tem timeout de saída?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Nenhuma falha externa pode prender o firmware ali",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador exige limites em todo switch de enum",
                            isCorrect: false,
                        },
                        {
                            text: "O RTC só aceita programar alarmes com prazo fixo",
                            isCorrect: false,
                        },
                        {
                            text: "Estados longos consomem mais RAM a cada minuto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O projeto usa superloop com interrupções, sem RTOS. Quando um RTOS entraria?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Com mais tarefas concorrentes e prazos para conciliar",
                            isCorrect: true,
                        },
                        {
                            text: "No dia em que o produto passasse a ser escrito em C++",
                            isCorrect: false,
                        },
                        {
                            text: "Assim que o binário passasse dos 64 KB de flash usada",
                            isCorrect: false,
                        },
                        {
                            text: "Nunca: RTOS não roda em microcontroladores Cortex-M",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O protocolo",
            blocks: [
                {
                    type: "text",
                    value: "# O frame da estação, byte a byte\n\nO link entre estação e gateway é serial, ruidoso e sem garantias, exatamente o cenário para o frame binário do módulo 3. O desenho: magic 0xAA abrindo, um byte de versão, um byte de tipo, um byte de comprimento, o payload e um CRC-16 fechando. Três tipos bastam para o produto: 0x01, resposta de versão de firmware; 0x10, pacote de medida; 0x20, comando de manutenção vindo do gateway.\n\nO payload da medida ocupa 12 bytes: quatro de timestamp em época Unix, dois de temperatura em centésimos de grau, dois de umidade em centésimos de ponto percentual e quatro de pressão em pascals. Números inteiros, escalas fixas, ordem de bytes big-endian declarada em documento: qualquer pessoa com a especificação e um analisador lógico decodifica um frame na mão, e é assim que o protocolo é depurado na bancada.\n\nA tabela abaixo disseca um frame real capturado do fio, byte a byte. Leia-a devagar uma vez: depois dela, telemetria binária deixa de ser abstração e vira aritmética de bolso, e você percebe que 21 bytes carregam uma medida completa com integridade conferida.",
                },
                {
                    type: "table",
                    value: '[["Bytes (hex)","Campo","Valor decodificado"],["AA","Magic","Início de frame"],["01","Versão","Protocolo v1"],["10","Tipo","Pacote de medida"],["0C","Comprimento","12 bytes de payload"],["68 3F 2A 10","Timestamp","Época Unix da medida"],["09 C4","Temperatura","2500 centésimos = 25,00 graus"],["12 8E","Umidade","4750 centésimos = 47,50%"],["00 01 8A 9E","Pressão","101022 Pa = 1010,22 hPa"],["7B 4D","CRC-16","Confere o frame inteiro"]]',
                },
                {
                    type: "text",
                    value: "## Decisões que parecem detalhe e não são\n\nPor que inteiros em centésimos, e não float? Porque ponto flutuante no fio traz dois problemas dispensáveis: representação que varia conforme compilador e FPU, e quatro bytes onde dois bastam. O inteiro com escala fixa é exato, curto e idêntico dos dois lados. A regra vale em 2026 e valia há trinta anos: no fio, prefira inteiros com unidade documentada.\n\nA confirmação fecha o ciclo de confiança: o gateway responde cada rajada com um ack curto; sem ack, a estação reenvia até um limite e conta a perda num contador de diagnóstico. Telemetria tolera perder um pacote, mas o projeto quer saber quantos perde, porque a taxa de perda é um sensor da saúde do link.\n\nO tipo 0x20, comando de manutenção, merece a paranoia do módulo 5: ele chega do mundo externo. Além do CRC, cada comando valida faixa de argumentos e estado atual antes de agir, e comandos destrutivos exigem confirmação em dois passos. E o byte de versão compra o futuro: quando o payload ganhar um campo novo na v2, o gateway seguirá entendendo a frota v1 que ainda estiver no campo.",
                },
                {
                    type: "quote",
                    value: "Um protocolo bom se lê com um analisador lógico e uma folha de papel: cada byte tem nome, cada valor tem unidade, e nada depende de adivinhar como o outro lado representa números.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que a temperatura viaja como inteiro em centésimos, e não como float?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Representação exata, curta e igual nos dois lados",
                            isCorrect: true,
                        },
                        {
                            text: "Float é bloqueado pelo CRC-16 dos frames seriais",
                            isCorrect: false,
                        },
                        {
                            text: "Números inteiros viajam mais rápido pela UART",
                            isCorrect: false,
                        },
                        {
                            text: "O gateway não tem unidade de ponto flutuante",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o campo tipo (0x10, 0x20) permite ao receptor?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Saber como interpretar o payload daquele frame",
                            isCorrect: true,
                        },
                        {
                            text: "Medir a prioridade elétrica do sinal recebido",
                            isCorrect: false,
                        },
                        {
                            text: "Escolher o baud rate adequado para a resposta",
                            isCorrect: false,
                        },
                        {
                            text: "Calcular o CRC sem percorrer o frame inteiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a ordem de bytes (endianness) é declarada no protocolo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Chips diferentes representam inteiros de formas diferentes",
                            isCorrect: true,
                        },
                        {
                            text: "A UART embaralha a ordem dos bytes em velocidade alta",
                            isCorrect: false,
                        },
                        {
                            text: "O algoritmo do CRC-16 exige a ordem big-endian por definição",
                            isCorrect: false,
                        },
                        {
                            text: "Os frames precisam chegar em ordem crescente de tipo e tamanho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como a estação trata um comando (tipo 0x20) vindo pelo rádio?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Valida com rigor extra: o frame vem do mundo externo",
                            isCorrect: true,
                        },
                        {
                            text: "Executa direto: o CRC já garante a segurança total",
                            isCorrect: false,
                        },
                        {
                            text: "Ignora qualquer comando, pois telemetria é só saída",
                            isCorrect: false,
                        },
                        {
                            text: "Reinicia por precaução antes de cada comando novo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O gateway v2 ainda aceita frames v1. Que princípio isso ilustra?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Compatibilidade com a frota que ainda não atualizou",
                            isCorrect: true,
                        },
                        {
                            text: "A redundância dupla exigida pela norma do rádio",
                            isCorrect: false,
                        },
                        {
                            text: "O retrocesso automático do CRC de 16 para 8 bits",
                            isCorrect: false,
                        },
                        {
                            text: "Balanceamento de carga entre as versões do frame",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Robustez",
            blocks: [
                {
                    type: "text",
                    value: "# A lista do que pode dar errado\n\nA estação vai morar num poste, longe de qualquer botão de reset, então o projeto termina onde produto de verdade se decide: na lista do que pode dar errado no campo, com uma defesa nomeada para cada item. Tempestade despejando EMI e travando o processador. Bateria morrendo aos poucos, com a tensão afundando devagar. O sensor travando o barramento I2C num dia de umidade. O gateway sumindo por horas. A flash de log envelhecendo apagamento a apagamento. E a energia caindo bem no meio de uma atualização de firmware.\n\nNenhum item é hipótese acadêmica: cada um é estatística conhecida de quem opera frota embarcada. E nenhuma defesa é nova para você: todas vieram dos módulos anteriores, e o trabalho do projeto é conectá-las num sistema coerente, como mostra a tabela.\n\nO teste de robustez é um ensaio geral do desastre, na bancada: um script derruba a alimentação mil vezes em pontos aleatórios do ciclo; um relé chaveando ao lado da placa simula EMI; o sensor é desconectado a quente no meio da leitura. A estação que sobrevive à semana de tortura ganha o direito de subir no poste.",
                },
                {
                    type: "table",
                    value: '[["Risco de campo","Sintoma","Defesa embarcada"],["EMI de tempestade","Travamento aleatório","Watchdog independente e BOR"],["Bateria no fim","Tensão afundando aos poucos","BOR e telemetria da tensão"],["Sensor trava o I2C","Leitura pendurada no barramento","Timeout e reinício do barramento"],["Gateway mudo","Fila de medidas enchendo","Política de fila e contadores"],["Desgaste da flash de log","Registros corrompidos","Log rotativo com CRC por registro"],["Energia cai no OTA","Imagem gravada pela metade","A/B: a partição antiga permanece"]]',
                },
                {
                    type: "text",
                    value: "## Watchdog bem alimentado\n\nO watchdog independente (IWDG) é o seguro de vida da estação, e o jeito de alimentá-lo define se ele protege ou apenas decora. A regra: um único ponto de alimentação, no fim de cada volta do laço principal, depois de a máquina de estados dar um passo saudável. Nunca dentro de uma ISR, porque interrupção de timer continua viva mesmo com o laço principal travado, e o watchdog assistiria ao coma do sistema achando tudo bem. Nunca dentro de laços de espera, pelo mesmo motivo.\n\nO limiar do BOR é calibrado com o rádio em mente: a rajada de transmissão é o momento de maior corrente, a tensão da bateria afunda junto, e o limiar precisa ficar abaixo desse vale saudável, senão a estação reinicia toda vez que tenta falar. Medir esse vale na bancada, com a bateria mais fraca aceitável, é tarefa do ensaio geral.\n\nPor fim, os contadores de diagnóstico do módulo 5 (resets por causa, timeouts de I2C, frames perdidos, tentativas de OTA) entram no protocolo como um tipo de frame periódico. A operação enxerga a saúde da frota inteira num painel, e a estação que começa a adoecer avisa antes de morrer.",
                },
                {
                    type: "quote",
                    value: "No campo ninguém aperta reset. Cada defesa desta lista existe porque alguém, um dia, dirigiu quatro horas para apertar um botão que o firmware devia ter apertado sozinho.",
                },
            ],
            questions: [
                {
                    statement: "Onde o watchdog da estação deve ser alimentado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Num único ponto do laço principal do firmware",
                            isCorrect: true,
                        },
                        {
                            text: "Dentro da ISR mais rápida, para nunca atrasar",
                            isCorrect: false,
                        },
                        {
                            text: "Em todos os laços de espera dos barramentos",
                            isCorrect: false,
                        },
                        {
                            text: "No boot, uma vez, antes de configurar o clock",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "A energia cai no meio do OTA. Por que a estação sobrevive?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A partição antiga permanece intacta e volta a rodar",
                            isCorrect: true,
                        },
                        {
                            text: "O rádio reenvia a imagem inteira automaticamente",
                            isCorrect: false,
                        },
                        {
                            text: "A flash desfaz sozinha a gravação parcial ao religar",
                            isCorrect: false,
                        },
                        {
                            text: "O bootloader reconstrói a imagem a partir do log",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que não alimentar o watchdog dentro de uma ISR de timer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A ISR seguiria viva mesmo com o laço principal travado",
                            isCorrect: true,
                        },
                        {
                            text: "ISRs não têm permissão de escrever nesse registrador",
                            isCorrect: false,
                        },
                        {
                            text: "O watchdog só aceita escrita em modo de baixa energia",
                            isCorrect: false,
                        },
                        {
                            text: "A alimentação na ISR dobraria o consumo da estação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O sensor trava o barramento I2C no campo. O que o firmware faz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Timeout, reinício do barramento e falha contada",
                            isCorrect: true,
                        },
                        {
                            text: "Espera o sensor voltar, sem limite de tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Desliga a estação até a próxima manutenção",
                            isCorrect: false,
                        },
                        {
                            text: "Apaga o log para liberar espaço de diagnóstico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o limiar do BOR considera a rajada do rádio?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A transmissão afunda a tensão e não pode causar reset",
                            isCorrect: true,
                        },
                        {
                            text: "O rádio exige tensão maior que a do resto do chip",
                            isCorrect: false,
                        },
                        {
                            text: "O BOR precisa desligar o rádio quando a bateria enche",
                            isCorrect: false,
                        },
                        {
                            text: "A antena capta o BOR como interferência de clock",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fechamento da jornada",
            blocks: [
                {
                    type: "text",
                    value: "# De bits a firmware no campo\n\nOlhe a distância percorrida. Você abriu o microcontrolador e encontrou um mapa de endereços. Escreveu num registrador e um LED acendeu. Entendeu por que o volatile existe, ouviu o hardware por interrupção, mediu o mundo pelo ADC e falou com sensores por três protocolos. Aprendeu o C++ que cabe em kilobytes, fez a conta de mAh que decide anos de bateria, respeitou a flash que se gasta, atualizou firmware sem medo de tijolo, e viu a qualidade virar processo: regras, testes no host, CI vigiando cada byte. No fim, costurou tudo numa estação que aguenta tempestade.\n\nO que mudou de verdade não está na lista de tópicos: está no seu olhar. O aparelho na sua mão deixou de ser caixa preta. Atrás de cada botão que responde, cada display que acende, cada sensor que mede, você agora enxerga o mecanismo: um registrador escrito, uma ISR curta, uma fila, uma máquina de estados, um frame com CRC. O que era mágica virou engenharia legível.\n\nE se a placa de 30 a 80 reais do primeiro módulo estiver na sua mesa, ela deixou de ser brinquedo: é um laboratório completo, e a estação deste módulo é um projeto real à sua altura. Monte, meça, erre, conserte. É assim que esse ofício se aprende de verdade.",
                },
                {
                    type: "table",
                    value: '[["Caminho de aprofundamento","O que aprofunda","Para quem faz sentido"],["RTOS a fundo","Escalonamento, filas, prioridades formais","Sistemas com muitas tarefas e prazos"],["Hardware e eletrônica","Esquemático, layout, instrumentação","Quem quer desenhar a própria placa"],["Segurança funcional","ISO 26262, DO-178C, processo e evidência","Automotivo, médico, aeroespacial"],["Segurança (security)","Boot seguro, criptografia embarcada","Produtos conectados e expostos"],["Linux embarcado","Do MCU ao SoC com MMU e sistema completo","Produtos que pedem mais computação"]]',
                },
                {
                    type: "text",
                    value: "## O ofício e o respeito\n\nDaqui, os caminhos se abrem em leque, e a tabela acima apresenta alguns sem hierarquia: aprofundar RTOS, descer para a eletrônica, subir para o Linux embarcado, entrar no mundo das certificações ou da segurança. Nenhum é o próximo passo obrigatório; todos ficam mais fáceis para quem chegou até aqui, porque o alicerce, saber ler a máquina, é o mesmo em todos. Escolha pelo problema que der vontade de resolver, que é como as boas carreiras se montam.\n\nFica, por fim, o respeito. O firmware é o software que não pode pedir desculpas: ele roda no marca-passo, no freio, no elevador, na sonda que pousa em outro planeta, escrito por gente que fez as mesmas perguntas que você aprendeu a fazer: e se a energia cair agora? E se o sensor mentir? E se o usuário nunca puder apertar reset? Engenharia embarcada é a arte de responder essas perguntas antes que o mundo as faça.\n\nVocê aprendeu a ler a máquina, do bit ao produto no campo. É uma alfabetização rara, que poucos programadores têm e que nenhuma camada de abstração torna obsoleta: alguém sempre precisa entender o que acontece embaixo. Agora esse alguém é você. Boa estrada, e bons firmwares.",
                },
                {
                    type: "quote",
                    value: "O elevador, o marca-passo, a sonda em outro planeta: tudo carrega um firmware escrito por quem aprendeu a ler a máquina. Agora você é uma dessas pessoas, e no fim do fio sempre há um pedaço do mundo confiando no seu código.",
                },
            ],
            questions: [
                {
                    statement: "O que a trilha usou como fio condutor da prática?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma placa barata, de 30 a 80 reais, na sua mesa",
                            isCorrect: true,
                        },
                        {
                            text: "Um simulador em nuvem mantido pela comunidade",
                            isCorrect: false,
                        },
                        {
                            text: "Um kit industrial emprestado pelos fabricantes",
                            isCorrect: false,
                        },
                        {
                            text: "Uma bancada com osciloscópio de quatro canais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Depois da trilha, o que deixou de ser mágica no blink de um LED?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "É uma escrita num registrador mapeado em memória",
                            isCorrect: true,
                        },
                        {
                            text: "É um comando exclusivo da biblioteca do Arduino",
                            isCorrect: false,
                        },
                        {
                            text: "É um sinal analógico gerado pelo cristal da placa",
                            isCorrect: false,
                        },
                        {
                            text: "É uma rotina gravada de fábrica na ROM do chip",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual caminho aprofunda escalonamento e prioridades formais?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Estudar um RTOS a fundo, com filas e tarefas",
                            isCorrect: true,
                        },
                        {
                            text: "Migrar todos os firmwares para Linux embarcado",
                            isCorrect: false,
                        },
                        {
                            text: "Adotar só interrupções, abolindo o laço principal",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o C++ por linguagens de descrição de hardware",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Para quem os caminhos de segurança funcional (ISO 26262, DO-178C) pesam mais?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quem mira automotivo, médico ou aeroespacial",
                            isCorrect: true,
                        },
                        {
                            text: "Quem faz apenas protótipos rápidos de bancada",
                            isCorrect: false,
                        },
                        {
                            text: "Quem trabalha somente com aplicativos móveis",
                            isCorrect: false,
                        },
                        {
                            text: "Quem pretende deixar o firmware em pouco tempo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a marca de quem aprendeu a ler a máquina?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Descer de camada até o registrador quando preciso",
                            isCorrect: true,
                        },
                        {
                            text: "Ter decorado o mapa de memória de todos os chips",
                            isCorrect: false,
                        },
                        {
                            text: "Recusar bibliotecas e HALs em todos os projetos",
                            isCorrect: false,
                        },
                        {
                            text: "Programar exclusivamente em assembly otimizado",
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
