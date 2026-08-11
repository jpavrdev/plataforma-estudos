import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Streaming de Dados, do roadmap de Engenharia de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * projeto do pipeline; as cartas guardam as definições fechadas, os nomes
 * dos componentes do Kafka e as regras que a aula enuncia de passagem.
 */
export const streamingDeDados: CartasDaTrilha = {
    trilha: "Streaming de Dados",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que inversão separa batch de streaming?",
                        verso: "Em batch o dado espera; em streaming o processamento espera.",
                    },
                    {
                        frente: "O que essa inversão afeta?",
                        verso: "A forma de projetar o pipeline inteiro.",
                    },
                    {
                        frente: "O que é dado em movimento?",
                        verso: "O que ainda está a caminho, processado conforme chega.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quando o streaming compensa?",
                        verso: "Quando chegar atrasado custa mais que manter o processo ligado.",
                    },
                    {
                        frente: "O que o streaming vira fora desse caso?",
                        verso: "Complexidade sem retorno.",
                    },
                    {
                        frente: "Que custo extra o streaming sempre traz?",
                        verso: "Um processo rodando sem parar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o tempo real cobra?",
                        verso: "Infraestrutura ligada, engenharia e operação mais exigentes.",
                    },
                    {
                        frente: "Qual não é a pergunta certa sobre tempo real?",
                        verso: "Se dá para fazer.",
                    },
                    {
                        frente: "Qual é a pergunta certa?",
                        verso: "Se o ganho paga o custo permanente.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o produtor não precisa saber?",
                        verso: "Quem consome o evento.",
                    },
                    {
                        frente: "O que esse desacoplamento permite?",
                        verso: "Somar um consumidor novo sem tocar no produtor.",
                    },
                    {
                        frente: "O que circula numa arquitetura orientada a eventos?",
                        verso: "O fato de que algo aconteceu.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o micro-batch não é?",
                        verso: "Streaming fraco.",
                    },
                    {
                        frente: "O que o micro-batch é, então?",
                        verso: "Equilíbrio entre a simplicidade do batch e a agilidade do streaming.",
                    },
                    {
                        frente: "Que agilidade o streaming verdadeiro traz?",
                        verso: "Processar evento a evento, sem esperar por uma fatia.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que o Kafka faz com a mensagem entregue?",
                        verso: "Guarda: ela pode ser lida e relida depois.",
                    },
                    {
                        frente: "O que o Kafka é, na definição da aula?",
                        verso: "Um log distribuído de eventos.",
                    },
                    {
                        frente: "Em que ritmo cada consumidor lê?",
                        verso: "No ritmo que precisar, sem travar os outros.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um tópico é, de verdade?",
                        verso: "Um conjunto de logs paralelos, um por partição.",
                    },
                    {
                        frente: "Onde a ordem existe no Kafka?",
                        verso: "Só dentro de cada partição.",
                    },
                    {
                        frente: "O que o offset marca?",
                        verso: "A posição de um evento dentro da partição.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a chave de particionamento decide?",
                        verso: "Se dois eventos relacionados caem na mesma partição.",
                    },
                    {
                        frente: "Que consequência essa decisão tem?",
                        verso: "Define se os dois mantêm a ordem entre si.",
                    },
                    {
                        frente: "O que a chave não é?",
                        verso: "Um detalhe qualquer do payload.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que um consumidor a mais que as partições faz?",
                        verso: "Nada: fica esperando uma partição que nunca chega.",
                    },
                    {
                        frente: "O que o consumer group divide entre seus membros?",
                        verso: "As partições do tópico.",
                    },
                    {
                        frente: "Quando o rebalanceamento acontece?",
                        verso: "Quando um consumidor entra ou sai do grupo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "De onde vem a durabilidade no Kafka?",
                        verso: "De cópias do mesmo dado em brokers diferentes.",
                    },
                    {
                        frente: "De onde ela não vem?",
                        verso: "De gravar em disco uma vez só.",
                    },
                    {
                        frente: "O que a retenção define?",
                        verso: "Por quanto tempo o evento continua disponível.",
                    },
                ],
            },
        },
    },
};
