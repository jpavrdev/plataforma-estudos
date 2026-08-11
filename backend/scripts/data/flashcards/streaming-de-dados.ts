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
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que os acks decidem no produtor?",
                        verso: "Quanto ele espera pela durabilidade.",
                    },
                    {
                        frente: "O que o tempo de espera do lote decide?",
                        verso: "Quanto o produtor espera para ganhar throughput.",
                    },
                    {
                        frente: "Que problema o produtor idempotente resolve?",
                        verso: "A duplicata que ele mesmo criaria ao reenviar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que decisão define a garantia no consumidor?",
                        verso: "A ordem entre processar e confirmar o offset.",
                    },
                    {
                        frente: "O que confirmar depois de processar dá?",
                        verso: "At-least-once, que pode reprocessar.",
                    },
                    {
                        frente: "O que confirmar antes de processar dá?",
                        verso: "At-most-once, que pode perder a mensagem.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que dois papéis a partição acumula?",
                        verso: "Unidade de paralelismo e unidade de ordem.",
                    },
                    {
                        frente: "Quando aumentar partições aumenta o paralelismo real?",
                        verso: "Só se a chave distribuir a carga de forma equilibrada.",
                    },
                    {
                        frente: "O que uma chave concentrada provoca?",
                        verso: "Uma partição sobrecarregada e o resto ocioso.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que serializar assume, além do formato?",
                        verso: "Um contrato entre quem produz e quem consome.",
                    },
                    {
                        frente: "Para que o Schema Registry existe?",
                        verso: "Para o contrato só mudar de forma compatível.",
                    },
                    {
                        frente: "O que uma mudança incompatível quebra?",
                        verso: "Todo consumidor que ainda lê pelo schema antigo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que pergunta a retenção por tempo faz?",
                        verso: "Há quanto tempo isso foi gravado.",
                    },
                    {
                        frente: "Que pergunta o log compaction faz?",
                        verso: "Se existe uma versão mais nova desta chave.",
                    },
                    {
                        frente: "O que escolher a política errada provoca?",
                        verso: "Perder dado que ainda era necessário.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que o at-most-once troca?",
                        verso: "Confiabilidade por simplicidade.",
                    },
                    {
                        frente: "O que o at-least-once troca?",
                        verso: "Duplicidade por segurança contra perda.",
                    },
                    {
                        frente: "Alguma garantia de entrega é gratuita?",
                        verso: "Nenhuma: todas cobram em algum lugar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a idempotência elimina?",
                        verso: "O efeito da duplicata, e não a duplicata.",
                    },
                    {
                        frente: "O que pode acontecer mesmo assim?",
                        verso: "A mensagem chegar duas vezes.",
                    },
                    {
                        frente: "O que não pode variar?",
                        verso: "O estado final do destino.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o produtor idempotente evita?",
                        verso: "O duplicado gerado pelo reenvio dele mesmo.",
                    },
                    {
                        frente: "O que uma transação no Kafka agrupa?",
                        verso: "Escritas em vários tópicos, com efeito de tudo ou nada.",
                    },
                    {
                        frente: "O que a transação permite ao consumidor?",
                        verso: "Ler apenas o que foi confirmado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o exactly-once não promete?",
                        verso: "Que nada será reprocessado.",
                    },
                    {
                        frente: "O que ele promete?",
                        verso: "Que o efeito final é de um processamento só.",
                    },
                    {
                        frente: "Onde essa garantia precisa valer?",
                        verso: "No destino, de ponta a ponta.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que estrago uma poison message causa?",
                        verso: "Trava a partição e prende as boas atrás dela.",
                    },
                    {
                        frente: "Para onde a mensagem problemática deve ir?",
                        verso: "Para uma fila de mensagens mortas.",
                    },
                    {
                        frente: "O que isso libera?",
                        verso: "O fluxo, que volta a andar sem ela.",
                    },
                ],
            },
        },
    },
};
