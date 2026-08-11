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
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que o event time marca?",
                        verso: "O instante em que o fato aconteceu na origem.",
                    },
                    {
                        frente: "O que o processing time marca?",
                        verso: "O instante em que o pipeline viu o evento.",
                    },
                    {
                        frente: "Qual dos dois a agregação de negócio costuma usar?",
                        verso: "O event time.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que duas ordens diferentes existem em streaming?",
                        verso: "A de chegada e a de acontecimento.",
                    },
                    {
                        frente: "O que o pipeline precisa decidir?",
                        verso: "O que fazer quando as duas ordens discordam.",
                    },
                    {
                        frente: "O que causa o evento fora de ordem?",
                        verso: "A rede, a partição e o caminho que cada evento fez.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o watermark não promete?",
                        verso: "Que nenhum evento vai chegar atrasado.",
                    },
                    {
                        frente: "O que o watermark define?",
                        verso: "O ponto em que o pipeline para de esperar.",
                    },
                    {
                        frente: "Que risco o watermark assume?",
                        verso: "Não ver mais nada que chegar depois dele.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que define a janela certa?",
                        verso: "A pergunta que a agregação precisa responder.",
                    },
                    {
                        frente: "Que janela um relógio fixo pede?",
                        verso: "Tumbling ou sliding.",
                    },
                    {
                        frente: "Que janela um comportamento contínuo por chave pede?",
                        verso: "A janela de sessão.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que toda agregação em streaming promete?",
                        verso: "Guardar alguma coisa em memória até poder soltar.",
                    },
                    {
                        frente: "Quem diz que chegou a hora de soltar?",
                        verso: "O watermark.",
                    },
                    {
                        frente: "Que risco o estado sem limite traz?",
                        verso: "Crescer sem parar até estourar a memória.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "O que o Structured Streaming não troca?",
                        verso: "A API de DataFrame por uma nova.",
                    },
                    {
                        frente: "O que ele faz com a mesma consulta?",
                        verso: "Reaplica em fatias incrementais.",
                    },
                    {
                        frente: "Que tabela o modelo imagina?",
                        verso: "Uma que nunca termina de crescer.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a leitura em streaming substitui?",
                        verso: "A leitura estática, passando a acompanhar a fonte.",
                    },
                    {
                        frente: "O que a escrita em streaming exige a mais?",
                        verso: "Um destino e um gatilho de disparo definidos.",
                    },
                    {
                        frente: "O que a consulta faz depois de iniciada?",
                        verso: "Continua rodando até ser parada.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que modo de saída é natural sem agregação?",
                        verso: "O append.",
                    },
                    {
                        frente: "Que pergunta decide o modo com agregação?",
                        verso: "Se o destino aguenta a tabela inteira a cada ciclo.",
                    },
                    {
                        frente: "O que o modo update entrega?",
                        verso: "Só as linhas que mudaram no ciclo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o checkpoint transforma?",
                        verso: "Uma consulta que reinicia do zero em uma que retoma.",
                    },
                    {
                        frente: "O que o checkpoint não é?",
                        verso: "Um detalhe operacional opcional.",
                    },
                    {
                        frente: "O que ele guarda entre execuções?",
                        verso: "O progresso e o estado da consulta.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a função de janela diz?",
                        verso: "Por qual intervalo agrupar.",
                    },
                    {
                        frente: "O que o watermark diz, ao lado dela?",
                        verso: "Até quando vale a pena esperar um atrasado.",
                    },
                    {
                        frente: "O que acontece quando o intervalo fecha?",
                        verso: "O resultado sai e o estado é liberado.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que o Kafka carrega?",
                        verso: "O evento enquanto ele está em trânsito.",
                    },
                    {
                        frente: "O que o lakehouse guarda?",
                        verso: "O evento depois que ele já aconteceu.",
                    },
                    {
                        frente: "Que papel o Kafka cumpre na arquitetura?",
                        verso: "O de espinha dorsal entre os sistemas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "No que o Kafka Connect transforma a integração?",
                        verso: "Em configuração.",
                    },
                    {
                        frente: "O que já existe pronto nele?",
                        verso: "O código de mover o dado.",
                    },
                    {
                        frente: "O que resta descrever?",
                        verso: "De onde vem e para onde vai.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que uma tabela é, na dualidade?",
                        verso: "Um retrato de um stream num instante.",
                    },
                    {
                        frente: "O que um stream é, na dualidade?",
                        verso: "A tabela contada evento a evento.",
                    },
                    {
                        frente: "O que essa dualidade permite?",
                        verso: "Ir de um para o outro sem perder informação.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a dupla Kafka e Spark é nesta trilha?",
                        verso: "A referência, e não a única resposta certa.",
                    },
                    {
                        frente: "De que depende a ferramenta certa?",
                        verso: "Do requisito, e não da popularidade.",
                    },
                    {
                        frente: "Que alternativas a aula cita?",
                        verso: "Flink, Kinesis e Pulsar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Streaming é o padrão sempre que existe um evento?",
                        verso: "Não é.",
                    },
                    {
                        frente: "Quando o streaming é a resposta certa?",
                        verso: "Quando o tempo entre evento e decisão precisa ser curto.",
                    },
                    {
                        frente: "Que sinais o monitoramento de streaming acompanha?",
                        verso: "Atraso do consumidor, taxa de erro e tamanho do estado.",
                    },
                ],
            },
        },
    },
};
