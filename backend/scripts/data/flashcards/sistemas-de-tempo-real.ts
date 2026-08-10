import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Sistemas de Tempo Real, sétima trilha do roadmap de C++ e
 * Baixo Nível.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento do
 * cenário; as cartas guardam os números fechados, as listas de regra e as
 * distinções que a aula enuncia de passagem.
 */
export const sistemasDeTempoReal: CartasDaTrilha = {
    trilha: "Sistemas de Tempo Real",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "De onde o deadline de uma malha de controle vem?",
                        verso: "Da frequência: 500 Hz dá 2 milissegundos por ciclo.",
                    },
                    {
                        frente: "Que diferença separa período de deadline?",
                        verso: "O período diz de quanto em quanto; o deadline, até quando.",
                    },
                    {
                        frente: "Que forma um requisito temporal precisa ter?",
                        verso: "Número e unidade, com a origem física declarada.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três classes de deadline a aula separa?",
                        verso: "Hard, firm e soft, pela consequência do atraso.",
                    },
                    {
                        frente: "Que exemplo mostra as três classes num produto só?",
                        verso: "O drone: estabilização hard e telemetria soft.",
                    },
                    {
                        frente: "O que o resultado firm perde ao chegar atrasado?",
                        verso: "Todo o valor, mas sem catástrofe no mundo físico.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que métrica assina contrato em tempo real?",
                        verso: "O pior caso; a média é material de marketing.",
                    },
                    {
                        frente: "Que conta mostra que raridade não salva ninguém?",
                        verso: "A 500 Hz são 1,8 milhão de ciclos por hora de operação.",
                    },
                    {
                        frente: "Que percentil a pergunta certa procura?",
                        verso: "O de cem por cento, onde o pior caso realmente mora.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que quatro fontes de variância a aula lista?",
                        verso: "Cache, interrupção, alocação dinâmica e runtime.",
                    },
                    {
                        frente: "Por que o tempo do malloc depende do passado?",
                        verso: "Ele percorre blocos livres formados pelas alocações.",
                    },
                    {
                        frente: "Que regra decide o que entra no caminho crítico?",
                        verso: "Só código cujo pior caso você consegue explicar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que prazo o ABS de um carro moderno respeita?",
                        verso: "Entre 5 e 10 milissegundos por recálculo de pressão.",
                    },
                    {
                        frente: "Que faixa de buffer o áudio ao vivo costuma usar?",
                        verso: "De 2 a 10 milissegundos antes de o público ouvir.",
                    },
                    {
                        frente: "Que conhecimento transfere entre domínios de tempo real?",
                        verso: "Escalonamento, pior caso, memória e medição.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que conjunto mínimo um RTOS oferece, e em que tamanho?",
                        verso: "Tarefa, escalonador, fila, semáforo e timer em dezenas de KB.",
                    },
                    {
                        frente: "Que latência de pior caso o Linux de tempo real dá?",
                        verso: "Centenas de microssegundos em hardware decente.",
                    },
                    {
                        frente: "Que casos o Linux de tempo real ainda não cobre?",
                        verso: "Prazo de microssegundos, certificação e consumo mínimo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que quatro estados uma tarefa do RTOS percorre?",
                        verso: "Executando, pronta, bloqueada e suspensa.",
                    },
                    {
                        frente: "Que regra única o escalonador aplica sem exceção?",
                        verso: "A tarefa pronta de maior prioridade executa.",
                    },
                    {
                        frente: "Que alternativa em ascensão traz devicetree e stacks?",
                        verso: "O Zephyr, da Linux Foundation, com build unificado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que quatro regras toda ISR precisa cumprir?",
                        verso: "Ser curta, não bloquear, não alocar e só sinalizar.",
                    },
                    {
                        frente: "Que nome o padrão de adiar o trabalho recebe?",
                        verso: "Trabalho adiado, com metade de cima e de baixo no Linux.",
                    },
                    {
                        frente: "Que produto forma o orçamento de uma interrupção?",
                        verso: "A duração dela vezes a taxa com que ela dispara.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três pontes ligam a interrupção à tarefa?",
                        verso: "Semáforo binário, fila com dado e notificação direta.",
                    },
                    {
                        frente: "Quando a notificação direta é a melhor ponte?",
                        verso: "Quando o consumidor é sempre uma tarefa específica.",
                    },
                    {
                        frente: "Que higiene básica toda fila alimentada por ISR exige?",
                        verso: "Um contador de descartes para quando ela encher.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Por que um delay de um tick pode dormir quase nada?",
                        verso: "A chamada caiu no meio do intervalo até o próximo tick.",
                    },
                    {
                        frente: "Onde o callback de um timer de software executa?",
                        verso: "Na tarefa daemon do kernel, e não numa interrupção.",
                    },
                    {
                        frente: "Que contador mede microssegundos com precisão?",
                        verso: "O de ciclos do processador, com aritmética sem sinal.",
                    },
                ],
            },
        },
    },
};
