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
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que critério correto atribui prioridade a uma tarefa?",
                        verso: "A criticidade temporal, não a importância aparente.",
                    },
                    {
                        frente: "Como o kernel trata tarefas prontas de mesma prioridade?",
                        verso: "Reveza por rodízio a cada tick, com o fatiamento ligado.",
                    },
                    {
                        frente: "Que tarefa vive no porão do sistema, e para quê?",
                        verso: "A ociosa, de prioridade zero, limpando recurso encerrado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quem provou a otimalidade do RMS, e quando?",
                        verso: "Liu e Layland, em 1973, entre as prioridades fixas.",
                    },
                    {
                        frente: "Que caráter o teste de utilização tem?",
                        verso: "Suficiente, não necessário: falhar não prova impossível.",
                    },
                    {
                        frente: "Que hipóteses o mundo real costuma violar no RMS?",
                        verso: "Tarefas independentes e deadline igual ao período.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que diferença de falha separa o EDF do RMS?",
                        verso: "No RMS a baixa prioridade cai; no EDF, todos podem cair.",
                    },
                    {
                        frente: "Que suporte prático o EDF tem hoje?",
                        verso: "O Zephyr e o Linux o oferecem; o FreeRTOS não traz nativo.",
                    },
                    {
                        frente: "Que custo extra o EDF cobra do kernel?",
                        verso: "Manter e comparar deadlines a cada decisão de escalonar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que sonda e que ano o caso clássico envolve?",
                        verso: "A Mars Pathfinder, em 1997, com resets diários.",
                    },
                    {
                        frente: "Que dois remédios a inversão de prioridade tem?",
                        verso: "A herança de prioridade e o teto de prioridade.",
                    },
                    {
                        frente: "Que primitiva do FreeRTOS não tem herança?",
                        verso: "O semáforo binário; exclusão mútua pede mutex.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que instrumento barato mede latência com precisão?",
                        verso: "Um pino alternado lido por osciloscópio ou analisador.",
                    },
                    {
                        frente: "Que ferramentas registram cada evento de escalonamento?",
                        verso: "Os rastreadores de RTOS, com carimbo de microssegundo.",
                    },
                    {
                        frente: "Que valor deve sempre ser registrado numa medição?",
                        verso: "O pior caso observado, nunca só a média da amostra.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que três pecados capitais o malloc comete?",
                        verso: "Tempo variável, fragmentação e falha tarde demais.",
                    },
                    {
                        frente: "Que agravante o heap global acrescenta ao problema?",
                        verso: "Ele é protegido por lock, no meio do caminho crítico.",
                    },
                    {
                        frente: "Que ganho alocar tudo na inicialização traz?",
                        verso: "A falha aparece na bancada, e não no cliente.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que preço o pool paga por blocos de tamanho fixo?",
                        verso: "A fragmentação interna, com bytes perdidos por bloco.",
                    },
                    {
                        frente: "Que conta dimensiona a quantidade de blocos?",
                        verso: "A de pior caso: quantos podem estar em uso ao mesmo tempo.",
                    },
                    {
                        frente: "Que contador revela a folga real do pool no campo?",
                        verso: "O mínimo de blocos livres já observado na operação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que ordem de escrita o produtor precisa respeitar?",
                        verso: "Primeiro o dado, depois o índice publicado ao consumidor.",
                    },
                    {
                        frente: "Que arranjo dispensa trava no ring buffer?",
                        verso: "Um produtor e um consumidor únicos, o chamado SPSC.",
                    },
                    {
                        frente: "Que sacrifício a convenção de cheio costuma fazer?",
                        verso: "Um slot, para distinguir cheio de vazio sem contador.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três vilões consomem stack sem avisar?",
                        verso: "Buffer local grande, recursão e as funções de formatação.",
                    },
                    {
                        frente: "Que hook detecta o estouro de stack no FreeRTOS?",
                        verso: "O de overflow, que registra a tarefa culpada.",
                    },
                    {
                        frente: "Que função responde a folga mínima já vista?",
                        verso: "A do high-water mark do stack daquela tarefa.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que se troca na virada, e o que nunca se copia?",
                        verso: "Trocam-se os ponteiros; o conteúdo nunca é copiado.",
                    },
                    {
                        frente: "Que par de interrupções o DMA oferece de graça?",
                        verso: "A de meia transferência e a de transferência completa.",
                    },
                    {
                        frente: "Onde a mesma ideia reaparece além do sensor?",
                        verso: "Nos displays, desenhando o quadro seguinte enquanto exibe.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que quatro regras de estilo tornam o WCET fechável?",
                        verso: "Laço com teto, sem recursão, poucos caminhos e sem opaco.",
                    },
                    {
                        frente: "Que exigência as regras do JPL fazem sobre o laço?",
                        verso: "Que uma ferramenta consiga provar o teto de iterações.",
                    },
                    {
                        frente: "Por que microcontrolador simples facilita o WCET?",
                        verso: "Sem cache, o tempo por instrução fica quase constante.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que qualidade os estímulos de medição precisam ter?",
                        verso: "Serem adversariais, provocando o pior caminho de propósito.",
                    },
                    {
                        frente: "Que caminho a análise estática de WCET percorre?",
                        verso: "Enumera caminhos do binário e modela o processador.",
                    },
                    {
                        frente: "Que três testemunhas o número de WCET maduro tem?",
                        verso: "A medição, a margem de projeto e o monitor em campo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que padrão substitui a alimentação incondicional?",
                        verso: "As tarefas críticas provam vida antes de alguém alimentar.",
                    },
                    {
                        frente: "Que defeito o watchdog com janela consegue pegar?",
                        verso: "O laço descontrolado que alimenta cedo demais.",
                    },
                    {
                        frente: "Que registrador vale ler logo na inicialização?",
                        verso: "O de causa do reset, para registrar o motivo da queda.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que quatro colunas a tabela de modos de falha tem?",
                        verso: "A falha, a detecção, a reação e o estado alvo.",
                    },
                    {
                        frente: "Que trabalho ativo a detecção de falha exige?",
                        verso: "Testes de plausibilidade sobre a leitura do sensor.",
                    },
                    {
                        frente: "Que meio-termo existe entre o normal e o desastre?",
                        verso: "A degradação controlada, com função reduzida.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quanto durou o voo inaugural do foguete do caso?",
                        verso: "Quarenta segundos, antes da destruição em voo.",
                    },
                    {
                        frente: "Que detalhe amargo o código do Ariane guardava?",
                        verso: "A função nem era necessária em voo, herdada ligada.",
                    },
                    {
                        frente: "Que lição de processo o reuso do caso deixa?",
                        verso: "Suposição herdada precisa de dono e revalidação.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que duas implementações canônicas a FSM tem?",
                        verso: "O enum com switch e a tabela de transições declarada.",
                    },
                    {
                        frente: "Que quatro hábitos tornam a FSM robusta?",
                        verso: "Evento inválido tratado, timeout como evento, um escritor e default.",
                    },
                    {
                        frente: "Quantas combinações cinco flags booleanas criam?",
                        verso: "Trinta e duas, com a maioria inválida por natureza.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três condições sustentam ficar no superloop?",
                        verso: "Poucas taxas harmônicas, nada longo bloqueando e prazo folgado.",
                    },
                    {
                        frente: "Que sinal indica a hora de migrar para o RTOS?",
                        verso: "Pegar-se construindo um escalonador artesanal na mão.",
                    },
                    {
                        frente: "Que erro cada direção da escolha comete?",
                        verso: "Kernel em termostato e superloop em drone com prazo curto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que política serve quando só o valor recente vale?",
                        verso: "Descartar o velho, sobrescrevendo a fila de uma posição.",
                    },
                    {
                        frente: "Que diagnóstico separa fila curta de consumidor lento?",
                        verso: "Transbordar em rajada contra transbordar sempre.",
                    },
                    {
                        frente: "Onde bloquear o produtor nunca é permitido?",
                        verso: "Dentro de uma ISR, que não pode esperar por nada.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que quatro degraus a escada de sincronização tem?",
                        verso: "Seção crítica, mutex, atomics e a estrutura sem trava.",
                    },
                    {
                        frente: "Que par de ordenações o SPSC correto usa?",
                        verso: "O release na publicação e o acquire na leitura.",
                    },
                    {
                        frente: "Que teste de vaidade o lock-free precisa passar?",
                        verso: "A medição mostrar o mecanismo simples sofrendo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três passos o padrão de log de tempo real segue?",
                        verso: "Registrar binário, formatar depois e transmitir longe.",
                    },
                    {
                        frente: "Que relógio o carimbo do evento precisa usar?",
                        verso: "O timer de hardware em microssegundos, não o tick.",
                    },
                    {
                        frente: "Em que prioridade a tarefa de drenagem deve rodar?",
                        verso: "Baixa por princípio: o log não compete com o controle.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que documento abre o projeto de tempo real?",
                        verso: "A tabela de requisitos com deadline, classe e origem.",
                    },
                    {
                        frente: "Que justifica os 500 Hz da malha de atitude?",
                        verso: "A dinâmica rápida do quadricóptero, em dezenas de ms.",
                    },
                    {
                        frente: "Que exercício o projeto do drone propõe?",
                        verso: "Engenharia no papel, sem placa nem solda envolvidas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como se desempata prioridade entre períodos iguais?",
                        verso: "Pela consequência do atraso, já que o RMS não desempata.",
                    },
                    {
                        frente: "Que limite o teste dá para cinco tarefas?",
                        verso: "Cerca de 0,743 de utilização somada no conjunto.",
                    },
                    {
                        frente: "Que grandeza em campo mostra a folga real respirando?",
                        verso: "O tempo da tarefa ociosa, medido durante a operação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que frase todo tamanho de fila precisa completar?",
                        verso: "Aguento tanta rajada com o consumidor parado tanto tempo.",
                    },
                    {
                        frente: "Que contraste separa o setpoint do comando de missão?",
                        verso: "O setpoint é fluxo e o comando é evento que não evapora.",
                    },
                    {
                        frente: "Quem lê os contadores de descarte, e com que ritmo?",
                        verso: "O housekeeping, uma vez por segundo na ronda.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que prazo o watchdog de hardware do drone usa?",
                        verso: "Cem milissegundos, alimentado pelo housekeeping.",
                    },
                    {
                        frente: "Que quatro itens a ronda de um hertz confere?",
                        verso: "Folga de stack, descartes, bateria e vida das tarefas.",
                    },
                    {
                        frente: "Como cada linha da tabela de falhas é ensaiada?",
                        verso: "Em bancada, com hélice removida e falha injetada.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "De que os sistemas de tempo real confiáveis nascem?",
                        verso: "De método disciplinado, e não de genialidade isolada.",
                    },
                    {
                        frente: "Que três preferências o critério final fixa?",
                        verso: "Pior caso, previsibilidade e número com origem e margem.",
                    },
                    {
                        frente: "Que kit de prática o fechamento recomenda?",
                        verso: "Placa barata, RTOS aberto e um analisador modesto.",
                    },
                ],
            },
        },
    },
};
