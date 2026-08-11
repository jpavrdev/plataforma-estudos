import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Embarcados na Prática, trilha que fecha o roadmap de C++ e
 * Baixo Nível.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o cenário e a
 * leitura de código; as cartas guardam os endereços, as listas fechadas e
 * as armadilhas de hardware que a aula enuncia de passagem.
 */
export const embarcadosNaPratica: CartasDaTrilha = {
    trilha: "Embarcados na Prática",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que duas memórias o microcontrolador divide de fábrica?",
                        verso: "A flash do programa e a RAM que evapora sem energia.",
                    },
                    {
                        frente: "Por que a memória pequena não é castigo?",
                        verso: "Ela torna o sistema inteiro compreensível byte a byte.",
                    },
                    {
                        frente: "Que faixa de preço uma placa de prática custa?",
                        verso: "Entre 30 e 80 reais, com gravador já embutido.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que frase resume o controle de hardware no Cortex-M?",
                        verso: "Controlar hardware é ler e escrever endereços de memória.",
                    },
                    {
                        frente: "Que documento define o endereço e o sentido de cada bit?",
                        verso: "O reference manual do chip, e não um tutorial de blog.",
                    },
                    {
                        frente: "Que endereços a flash e a SRAM ocupam num STM32?",
                        verso: "A flash em 0x08000000 e a SRAM em 0x20000000.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que quatro perguntas escolhem um microcontrolador?",
                        verso: "Periférico, consumo, ferramenta do time e preço do produto.",
                    },
                    {
                        frente: "Que modelo de negócio a ARM adota com o núcleo?",
                        verso: "Ela projeta e licencia o desenho a dezenas de fabricantes.",
                    },
                    {
                        frente: "Que critério a lista de escolha deliberadamente ignora?",
                        verso: "A arquitetura da moda, que não melhora o produto.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que arquivo o build entrega, e o que se extrai dele?",
                        verso: "O elf com símbolos, de onde saem o bin e o hex.",
                    },
                    {
                        frente: "Que ferramenta merece virar hábito diário no build?",
                        verso: "A que mostra o consumo de flash e de RAM do binário.",
                    },
                    {
                        frente: "Por que o verify depois da gravação não é paranoia?",
                        verso: "Gravação falha no meio e o chip fica com imagem parcial.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três gestos o blink por registrador executa?",
                        verso: "Ligar o clock, configurar o modo e alternar o bit de saída.",
                    },
                    {
                        frente: "Por que o laço principal do bare metal não termina?",
                        verso: "Não existe sistema para receber o controle de volta.",
                    },
                    {
                        frente: "Que padrão a escrita num campo de registrador segue?",
                        verso: "Limpar os bits do campo e só depois escrever o valor.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que promessa estreita o volatile realmente faz?",
                        verso: "Cada acesso acontece, no tamanho declarado e em ordem.",
                    },
                    {
                        frente: "O que o volatile não garante, apesar da fama?",
                        verso: "Atomicidade: leitura e escrita seguem separáveis.",
                    },
                    {
                        frente: "Que padrão de header o fabricante usa nos registradores?",
                        verso: "O CMSIS, com structs de campos voláteis por periférico.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que diferença separa push-pull de open-drain?",
                        verso: "O push-pull dirige os dois níveis; o outro só puxa baixo.",
                    },
                    {
                        frente: "O que uma entrada digital solta realmente lê?",
                        verso: "Ruído: o pino flutua e capta interferência como antena.",
                    },
                    {
                        frente: "Por que um aperto de botão vira dez no firmware?",
                        verso: "O contato mecânico quica por alguns milissegundos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que bloco escolhe o pino e a borda no STM32?",
                        verso: "O EXTI, ligado ao controlador de interrupções do núcleo.",
                    },
                    {
                        frente: "O que acontece se a ISR não limpar o pending?",
                        verso: "O controlador a chama de novo imediatamente, em laço.",
                    },
                    {
                        frente: "Que três regras toda ISR externa precisa seguir?",
                        verso: "Ser curta, limpar o pendente e compartilhar com cuidado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que truque honesto o PWM usa para controlar energia?",
                        verso: "Alternar rápido entre ligado e desligado, mudando a média.",
                    },
                    {
                        frente: "Que padrão o servo de modelismo espera receber?",
                        verso: "Largura de pulso, com um pulso a cada 20 milissegundos.",
                    },
                    {
                        frente: "Que regra de projeto o timer desempregado denuncia?",
                        verso: "Se o processador conta tempo em laço, delegue ao timer.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que critério define a taxa mínima de amostragem?",
                        verso: "O de Nyquist: ao menos o dobro da maior frequência.",
                    },
                    {
                        frente: "Que defesa mais barata reduz o ruído da leitura?",
                        verso: "A média de várias amostras seguidas do mesmo sinal.",
                    },
                    {
                        frente: "Que alternativa substitui o DAC quando o chip não tem?",
                        verso: "Um PWM filtrado por resistor e capacitor na saída.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que dois módulos clássicos falam UART no projeto?",
                        verso: "O console de depuração e o receptor de GPS.",
                    },
                    {
                        frente: "Onde o receptor amostra cada bit da linha?",
                        verso: "No meio do tempo de bit, contando pelo baud rate.",
                    },
                    {
                        frente: "Que cuidado elétrico a UART exige na bancada?",
                        verso: "Casar os níveis lógicos; o padrão antigo pede conversor.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que estrutura mestre e escravo formam no SPI?",
                        verso: "Dois registradores de deslocamento ligados em anel.",
                    },
                    {
                        frente: "Que duas escolhas definem os quatro modos do SPI?",
                        verso: "O nível de repouso do clock e a borda de amostragem.",
                    },
                    {
                        frente: "Que três coisas o SPI deliberadamente não tem?",
                        verso: "Endereço, confirmação de recebimento e detecção de erro.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que valor de pull-up virou padrão de fato em 3,3 V?",
                        verso: "Os 4,7k, dentro da faixa de 2,2k a 10k ohms.",
                    },
                    {
                        frente: "Que recurso educado um escravo lento pode usar?",
                        verso: "O clock stretching, segurando o sinal enquanto processa.",
                    },
                    {
                        frente: "Que dor de bancada lidera a lista do I2C?",
                        verso: "Pull-up ausente, e o barramento simplesmente não fala.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que pergunta costuma decidir sozinha o barramento?",
                        verso: "O que o componente escolhido oferece de interface.",
                    },
                    {
                        frente: "Que diagnóstico o ACK do I2C entrega de graça?",
                        verso: "Se o dispositivo está presente e respondendo na hora.",
                    },
                    {
                        frente: "Que critério desempata quando dois barramentos servem?",
                        verso: "O que simplifica o software e o time já sabe depurar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que campo funciona como seguro de futuro no frame?",
                        verso: "O byte de versão, para o novo entender o antigo.",
                    },
                    {
                        frente: "Que erro o CRC pega que a soma simples não pega?",
                        verso: "A rajada curta de bits corrompidos, típica de fio real.",
                    },
                    {
                        frente: "Por que serializar campo a campo em vez da struct?",
                        verso: "Padding e ordem de bytes variam entre compiladores.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que custo as exceções cobram mesmo sem nenhum throw?",
                        verso: "Kilobytes de tabela de unwind ocupando a flash.",
                    },
                    {
                        frente: "Que recursos do C++ ficam no subset embarcado?",
                        verso: "Classes com invariante, RAII, template e constexpr.",
                    },
                    {
                        frente: "Como o firmware devolve erro sem exceções?",
                        verso: "Com enum de retorno e o valor entregue por referência.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que ganho o pino virar parte do tipo produz?",
                        verso: "O pino errado não compila, e o erro sai do runtime.",
                    },
                    {
                        frente: "Que engrenagem faz o template virar número pronto?",
                        verso: "Os parâmetros são constantes resolvidas na compilação.",
                    },
                    {
                        frente: "Como se confere o custo zero de uma abstração?",
                        verso: "Lendo o assembly ou comparando o tamanho no map file.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que tabela clássica o constexpr costuma gerar?",
                        verso: "A de consulta do CRC, com 256 entradas prontas.",
                    },
                    {
                        frente: "Que teste mais barato o build oferece sobre valores?",
                        verso: "O static_assert, reprovando a tabela errada no build.",
                    },
                    {
                        frente: "Que moral econômica o módulo fixa sobre recursos?",
                        verso: "Flash é abundante, RAM é escassa e ciclo é disputado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que pergunta escolher o N do container força?",
                        verso: "Qual é o pior caso de itens acumulados ao mesmo tempo.",
                    },
                    {
                        frente: "Que comportamento o container estático recusa ter?",
                        verso: "Realocar em silêncio, mudando endereço e tempo.",
                    },
                    {
                        frente: "Que orçamento o sizeof desses containers revela?",
                        verso: "O de RAM, verificável já na compilação do projeto.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que recursos do C++ não emitem um byte a mais?",
                        verso: "Classe sem virtual, template, constexpr e namespace.",
                    },
                    {
                        frente: "Que biblioteca arrasta dezenas de kilobytes à flash?",
                        verso: "O iostream, com formatação e localidade embutidas.",
                    },
                    {
                        frente: "Como o tamanho vira métrica de regressão no build?",
                        verso: "Registrando flash e RAM e alertando quando engorda.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que padrão de projeto domina o produto a bateria?",
                        verso: "O duty cycling: acordar, medir, transmitir e dormir.",
                    },
                    {
                        frente: "Que métrica decide a vida útil do produto?",
                        verso: "A corrente média, dominada pelo tempo dormindo.",
                    },
                    {
                        frente: "Que três regras práticas economizam bateria?",
                        verso: "Transmitir em rajada, agrupar medidas e cortar sensor no sono.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que tratamento cada causa de reset merece?",
                        verso: "Ligar otimista no power-on e investigar no watchdog.",
                    },
                    {
                        frente: "Que defesa o chip oferece contra a queda parcial?",
                        verso: "O reset por subtensão, segurando o chip abaixo do limiar.",
                    },
                    {
                        frente: "Que valor os contadores de causa têm no campo?",
                        verso: "Revelam o padrão de reinício antes de virar reclamação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que regra de ouro amarra o firmware defensivo?",
                        verso: "Toda espera por hardware precisa ter um prazo limite.",
                    },
                    {
                        frente: "Que versão adulta o debounce bloqueante ganha?",
                        verso: "Amostragem periódica por timer, sem travar o laço.",
                    },
                    {
                        frente: "Que checagem a leitura analógica ainda merece?",
                        verso: "A de plausibilidade contra a física do fenômeno medido.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Em que unidade o apagamento da flash acontece?",
                        verso: "Por setor inteiro, nunca byte a byte como a escrita.",
                    },
                    {
                        frente: "Que solução clássica evita gastar o mesmo endereço?",
                        verso: "O log rotativo, gravando cada versão num lugar novo.",
                    },
                    {
                        frente: "Por que cada registro gravado carrega um CRC?",
                        verso: "A energia pode cair no meio e deixar o registro pela metade.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três peças a arquitetura de OTA seguro tem?",
                        verso: "Um bootloader imutável e duas partições de aplicação.",
                    },
                    {
                        frente: "Que seguro o rollback acrescenta ao fluxo?",
                        verso: "A partição nova sobe em teste antes de virar definitiva.",
                    },
                    {
                        frente: "Que padrão aberto atende o mundo Cortex-M no OTA?",
                        verso: "O MCUboot, ao lado do esquema pronto do ESP-IDF.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que problema do C as regras do MISRA tentam conter?",
                        verso: "O poder demais com aviso de menos, e o indefinido.",
                    },
                    {
                        frente: "Que degrau maior o MISRA abre no processo?",
                        verso: "A segurança funcional, com rastreabilidade e evidência.",
                    },
                    {
                        frente: "Que saída madura o MISRA oferece a uma regra ruim?",
                        verso: "O desvio, registrado com justificativa e aprovação.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três problemas testar gravando na placa tem?",
                        verso: "É lento, não escala e depende do único hardware.",
                    },
                    {
                        frente: "Que formato a pirâmide de teste embarcado tem?",
                        verso: "Base larga no host e topo estreito rodando no alvo.",
                    },
                    {
                        frente: "Que só o alvo revela, e o host jamais mostra?",
                        verso: "O timing real, a errata do periférico e o consumo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantos breakpoints de hardware o Cortex-M oferece?",
                        verso: "Poucos, tipicamente entre quatro e oito por núcleo.",
                    },
                    {
                        frente: "Que limite filosófico o breakpoint carrega?",
                        verso: "Parar o núcleo não para o motor nem o outro lado do fio.",
                    },
                    {
                        frente: "Que lente quase não distorce, mas fala pouco?",
                        verso: "O LED, que custa nanossegundos e não muda o timing.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que erro comum amarra duas versões diferentes?",
                        verso: "Confundir a do firmware com a do protocolo de comunicação.",
                    },
                    {
                        frente: "Quem deve ser a única fonte da versão?",
                        verso: "O sistema de build, gerando o header a partir da tag.",
                    },
                    {
                        frente: "Que dois consumidores a versão gravada atende?",
                        verso: "O humano no log de boot e a máquina no comando.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três perguntas o CI de firmware responde?",
                        verso: "Se ainda compila, se ainda passa e se ainda cabe.",
                    },
                    {
                        frente: "Que relatório é a métrica mais negligenciada?",
                        verso: "O de tamanho, com flash e RAM de cada alvo do build.",
                    },
                    {
                        frente: "Que artefato todo build verde precisa arquivar?",
                        verso: "O binário com a versão e o hash no próprio nome.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que corrente média um ano com 2600 mAh permite?",
                        verso: "Cerca de 0,3 miliampere, dividindo pelas horas do ano.",
                    },
                    {
                        frente: "Como os 128 KB de flash são repartidos no papel?",
                        verso: "Bootloader de 16 KB e duas partições de 48 KB.",
                    },
                    {
                        frente: "Que sensor único cobre as três grandezas do projeto?",
                        verso: "O BME280, com temperatura, umidade e pressão.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que estado é o padrão da máquina da estação?",
                        verso: "Dormindo, onde a bateria agradece o tempo todo.",
                    },
                    {
                        frente: "Que arquitetura o projeto adota, e sem o quê?",
                        verso: "O superloop com interrupções, sem sistema operacional.",
                    },
                    {
                        frente: "Quanto de dado a fila estática precisa segurar?",
                        verso: "Mais de uma hora de medidas acumuladas.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que tamanho o payload de uma medida ocupa?",
                        verso: "Doze bytes, do carimbo de tempo às três grandezas.",
                    },
                    {
                        frente: "Que ciclo de confiança o ack do gateway fecha?",
                        verso: "A estação reenvia sem ele e conta a perda no diagnóstico.",
                    },
                    {
                        frente: "Que paranoia o comando de manutenção exige?",
                        verso: "Validar faixa de argumento, por vir do mundo externo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que ensaio de bancada testa a robustez de verdade?",
                        verso: "Derrubar a alimentação mil vezes em pontos aleatórios.",
                    },
                    {
                        frente: "Com o que o limiar de subtensão é calibrado?",
                        verso: "Com a rajada do rádio, o momento de maior corrente.",
                    },
                    {
                        frente: "Que dados de diagnóstico viajam na telemetria?",
                        verso: "Resets por causa, timeouts, perdas e tentativas de OTA.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que mudou de verdade, além da lista de tópicos?",
                        verso: "O olhar: o aparelho deixou de ser uma caixa preta.",
                    },
                    {
                        frente: "Que três caminhos o leque final apresenta?",
                        verso: "Aprofundar o RTOS, descer à eletrônica ou subir ao Linux.",
                    },
                    {
                        frente: "Por que o firmware não pode pedir desculpas?",
                        verso: "Ele roda no marca-passo, no freio e no elevador.",
                    },
                ],
            },
        },
    },
};
