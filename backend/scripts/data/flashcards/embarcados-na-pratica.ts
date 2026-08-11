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
    },
};
