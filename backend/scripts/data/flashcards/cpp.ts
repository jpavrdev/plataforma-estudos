import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de C++, segunda trilha do roadmap de C++ e Baixo Nível.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra saída de código
 * e escolha de construção; as cartas guardam os nomes próprios, as listas
 * fechadas e os detalhes que a aula enuncia de passagem.
 */
export const cpp: CartasDaTrilha = {
    trilha: "C++",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quem criou o C++, e em que década?",
                        verso: "Bjarne Stroustrup, nos anos 1980, estendendo o C.",
                    },
                    {
                        frente: "Que duas etapas o build de um programa percorre?",
                        verso: "O compilador traduz e o linker junta as bibliotecas.",
                    },
                    {
                        frente: "Que duas peças não existem entre o código e o hardware?",
                        verso: "A máquina virtual e o coletor de lixo automático.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o main devolve, e o que o zero significa?",
                        verso: "Um int ao sistema; o zero indica sucesso na execução.",
                    },
                    {
                        frente: "Que operador o cin usa para ler do usuário?",
                        verso: "O de extração, escrito com dois sinais de maior.",
                    },
                    {
                        frente: "O que o endl faz além de aparecer no fim da linha?",
                        verso: "Ele pula uma linha na saída padrão.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que projetos grandes evitam o using namespace?",
                        verso: "Ele traz tudo e pode causar colisão difícil de rastrear.",
                    },
                    {
                        frente: "Em que tipo de programa o using costuma ser aceito?",
                        verso: "Nos pequenos e de estudo, onde a colisão é improvável.",
                    },
                    {
                        frente: "Que namespace a biblioteca padrão do C++ ocupa?",
                        verso: "O std, onde vivem o cout, o cin e o endl.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que forma geral a declaração de variável segue?",
                        verso: "Tipo, nome e o valor inicial, nessa ordem.",
                    },
                    {
                        frente: "Que cabeçalho o texto exige, e o que ele substitui?",
                        verso: "O string, no lugar dos arrays de caractere herdados do C.",
                    },
                    {
                        frente: "Que duas coisas o tipo define sobre a variável?",
                        verso: "Que valores ela guarda e quanto espaço ela ocupa.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Desde que versão o auto existe, e o que ele não muda?",
                        verso: "Desde o C++11; o tipo continua estático e fixo.",
                    },
                    {
                        frente: "Onde o auto é mais útil no dia a dia?",
                        verso: "Com tipos longos, como os iteradores da biblioteca.",
                    },
                    {
                        frente: "O que o static_cast faz ao converter double para int?",
                        verso: "Trunca a parte decimal, sem arredondar o valor.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três famílias de operador a aula lista?",
                        verso: "Os aritméticos, os relacionais e os lógicos.",
                    },
                    {
                        frente: "Que mudança faz 7 dividido por 2 dar 3,5?",
                        verso: "Um dos operandos precisa ser double na conta.",
                    },
                    {
                        frente: "Que atalhos combinam operação e atribuição?",
                        verso: "O mais igual e os equivalentes de menos, vezes e divisão.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que nome o comportamento de cair no próximo case tem?",
                        verso: "Fall-through, causado por esquecer o break.",
                    },
                    {
                        frente: "Que tipos de valor o switch aceita comparar?",
                        verso: "Um inteiro ou um caractere, não qualquer expressão.",
                    },
                    {
                        frente: "Que cláusula do switch cobre os casos restantes?",
                        verso: "O default, executado quando nenhum case casa.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que dois comandos controlam o fluxo dentro do laço?",
                        verso: "O break, que interrompe, e o continue, que pula a volta.",
                    },
                    {
                        frente: "Que garantia o while não dá sobre o bloco?",
                        verso: "Que ele rode ao menos uma vez, se a condição já for falsa.",
                    },
                    {
                        frente: "Que cuidado evita o laço infinito?",
                        verso: "Garantir que algo avance em direção ao fim da condição.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três partes o for clássico reúne numa linha?",
                        verso: "A inicialização, a condição e o passo de cada volta.",
                    },
                    {
                        frente: "Que forma percorre sem copiar cada elemento?",
                        verso: "A referência constante no range-based for.",
                    },
                    {
                        frente: "Desde que versão o range-based for existe?",
                        verso: "Desde o C++11, lendo como para cada elemento em.",
                    },
                ],
            },
        },
    },
};
