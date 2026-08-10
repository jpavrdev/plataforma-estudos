import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Sistemas Operacionais e Concorrência, quinta trilha do
 * roadmap de C++ e Baixo Nível.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento do
 * cenário; as cartas guardam os nomes próprios, as listas fechadas e as
 * armadilhas que a aula enuncia de passagem.
 */
export const sistemasOperacionaisEConcorrencia: CartasDaTrilha = {
    trilha: "Sistemas Operacionais e Concorrência",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que nome o PCB recebe dentro do Linux?",
                        verso: "A task_struct, com PID, estado e registradores.",
                    },
                    {
                        frente: "Quem impõe o isolamento entre os processos?",
                        verso: "O kernel, com ajuda do hardware, não a boa vontade.",
                    },
                    {
                        frente: "Como o kernel sustenta a ilusão de CPU exclusiva?",
                        verso: "Revezando em fatias de milissegundos, com troca de contexto.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que papel o exec cumpre depois do fork?",
                        verso: "Trocar a imagem do processo pelo programa novo.",
                    },
                    {
                        frente: "Que sequência o shell executa ao rodar um comando?",
                        verso: "Fork do próprio shell, exec no filho e wait no pai.",
                    },
                    {
                        frente: "Que faixa de código de saída indica erro?",
                        verso: "De 1 a 255; o zero é o único que diz sucesso.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que limite padrão a pilha tem no Linux?",
                        verso: "Uns 8 MB, ajustáveis pelo ulimit do sistema.",
                    },
                    {
                        frente: "Por que um ponteiro não atravessa dois processos?",
                        verso: "O endereço é virtual e só vale dentro daquele mapa.",
                    },
                    {
                        frente: "Que camada garante o erro claro ao violar uma região?",
                        verso: "A permissão por região, checada a cada acesso.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que risco um handler de sinal corre ao chamar malloc?",
                        verso: "Ele pode ter interrompido a própria função e corromper.",
                    },
                    {
                        frente: "Que dois sinais não podem ser tratados de jeito nenhum?",
                        verso: "O de matar e o de parar, entregues direto ao kernel.",
                    },
                    {
                        frente: "Que sujeira o encerramento imediato deixa para trás?",
                        verso: "Locks, arquivos temporários e transações pela metade.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três perguntas decidem o mecanismo de IPC?",
                        verso: "Fluxo ou mensagem, o volume e quem precisa falar com quem.",
                    },
                    {
                        frente: "Que exigência a FIFO remove em relação ao pipe?",
                        verso: "O parentesco: processos sem laço também se conectam.",
                    },
                    {
                        frente: "Que exemplo real usa memória compartilhada de fato?",
                        verso: "O PostgreSQL, com o cache de páginas entre os backends.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que custo separa criar thread de criar processo?",
                        verso: "Dezenas de microssegundos contra centenas ou milissegundos.",
                    },
                    {
                        frente: "Que exemplo famoso escolhe processo pelo isolamento?",
                        verso: "O Chrome, com cada aba num processo separado.",
                    },
                    {
                        frente: "Que propriedade torna a thread rápida e perigosa?",
                        verso: "A memória compartilhada, vista dos dois lados.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que escolha é padrão entre join e detach?",
                        verso: "O join; a thread solta não pode mais ser esperada.",
                    },
                    {
                        frente: "O que o construtor de thread faz com os argumentos?",
                        verso: "Copia por padrão, para cada thread ter a própria cópia.",
                    },
                    {
                        frente: "Que erro clássico a lambda entregue a uma thread comete?",
                        verso: "Capturar local por referência e sobreviver ao escopo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que resultado o experimento das duas threads espera?",
                        verso: "Dois milhões, e entrega bem menos na prática.",
                    },
                    {
                        frente: "Que três passos o incremento esconde no hardware?",
                        verso: "Ler da memória, somar no registrador e escrever de volta.",
                    },
                    {
                        frente: "Por que o programa com corrida passa nos testes?",
                        verso: "Com pouca carga o entrelaçamento fatal pode não ocorrer.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o mutex realmente protege, afinal?",
                        verso: "Um trecho de código; a ligação com o dado é convenção.",
                    },
                    {
                        frente: "Que caminhos o lock manual deixa descoberto?",
                        verso: "O return antecipado e a exceção no meio da seção.",
                    },
                    {
                        frente: "Que troca a granularidade do cadeado impõe?",
                        verso: "Grosso é simples e serializa; fino é rápido e arriscado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que nome as quatro condições do deadlock recebem?",
                        verso: "As condições de Coffman, que precisam valer juntas.",
                    },
                    {
                        frente: "Que técnica de prevenção ataca a espera circular?",
                        verso: "Uma ordem global de cadeados, seguida em todo o código.",
                    },
                    {
                        frente: "Que ferramenta diagnostica um deadlock em produção?",
                        verso: "O gdb anexado, ou as pilhas coletadas por fora.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que diferença de posse separa semáforo de mutex?",
                        verso: "O mutex tem dono; o semáforo qualquer um libera.",
                    },
                    {
                        frente: "Com que valores os dois semáforos do buffer começam?",
                        verso: "Vagas no tamanho do buffer e itens em zero.",
                    },
                    {
                        frente: "O que os semáforos não dispensam no buffer limitado?",
                        verso: "O mutex protegendo a estrutura em si por fora.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que a espera sempre usa um predicado em laço?",
                        verso: "Pelo acordar espúrio, que ocorre sem notificação.",
                    },
                    {
                        frente: "O que acontece com a notificação sem ninguém esperando?",
                        verso: "Ela evapora: a variável de condição não guarda estado.",
                    },
                    {
                        frente: "Que efeito o notify_all provoca com um item só?",
                        verso: "O estouro de manada, acordando todos para nada.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que critério decide entre atomic e mutex?",
                        verso: "Se a invariante cabe numa variável e numa operação.",
                    },
                    {
                        frente: "Onde o custo do atomic se posiciona entre os dois?",
                        verso: "Entre o acesso comum e o mutex, com poucos nanossegundos.",
                    },
                    {
                        frente: "Que parâmetro extra as operações atômicas aceitam?",
                        verso: "A ordenação de memória, do relaxado ao sequencial.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que ordem o push segue entre travar e notificar?",
                        verso: "Insere com o cadeado e notifica depois de soltá-lo.",
                    },
                    {
                        frente: "O que o fechamento da fila interrompe, e o que não?",
                        verso: "Interrompe as entradas, não o esvaziamento do que há.",
                    },
                    {
                        frente: "Por que notificar fora do cadeado costuma ser melhor?",
                        verso: "A thread acordada não esbarra no cadeado ainda preso.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que aposta o spinlock faz ao girar?",
                        verso: "Que a espera será menor que dois chaveamentos de contexto.",
                    },
                    {
                        frente: "Por que o spinlock funciona dentro do kernel?",
                        verso: "Ele controla a preempção enquanto segura a trava.",
                    },
                    {
                        frente: "Que desenho as implementações modernas de mutex usam?",
                        verso: "Híbrido: giram um pouco e só depois dormem.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que custo real a troca de contexto cobra a mais?",
                        verso: "Voltar para cache e TLB frios, com milhares de misses.",
                    },
                    {
                        frente: "Que mundo depende da boa vontade de cada programa?",
                        verso: "O cooperativo, em que um laço infinito congela tudo.",
                    },
                    {
                        frente: "Que peça a mais a troca entre processos exige?",
                        verso: "A troca da tabela de páginas do espaço de endereços.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que grandeza o escalonador do Linux acumula por thread?",
                        verso: "O vruntime, o tempo virtual já consumido de CPU.",
                    },
                    {
                        frente: "Por que o terminal responde rápido durante uma compilação?",
                        verso: "Ele dormiu esperando e tem vruntime bem mais baixo.",
                    },
                    {
                        frente: "Que promessa o fair share não faz?",
                        verso: "A de prazo: ele garante proporção, não o instante.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que métrica denuncia a starvation numa fila?",
                        verso: "A idade do item mais velho, não a vazão do sistema.",
                    },
                    {
                        frente: "Que modo de falha a prioridade estrita cria?",
                        verso: "Estrutural: um fluxo alto constante afoga o resto.",
                    },
                    {
                        frente: "Onde a lição de starvation reaparece fora da CPU?",
                        verso: "Nas filas de trabalho com classes de prioridade.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que casos legítimos justificam fixar a CPU?",
                        verso: "Benchmark reprodutível e sistema de latência crítica.",
                    },
                    {
                        frente: "Que efeito fixar CPU tem no desempenho, afinal?",
                        verso: "Deixa mais previsível, e não necessariamente mais rápido.",
                    },
                    {
                        frente: "Que risco a afinidade explícita cria no escalonador?",
                        verso: "Amarrar as mãos dele, com núcleo ocioso ao lado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que trade a duração do quantum controla?",
                        verso: "Curto favorece a latência; longo, a vazão do sistema.",
                    },
                    {
                        frente: "Que pergunta classifica a carga antes de otimizar?",
                        verso: "Se alguém espera cada resposta individualmente.",
                    },
                    {
                        frente: "Que mudança de pergunta o tempo real impõe?",
                        verso: "Não é ser rápido em média, é nunca passar do prazo.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Por que a tabela de páginas não pode ser plana?",
                        verso: "Seriam 68 bilhões de páginas por processo em 48 bits.",
                    },
                    {
                        frente: "Que combinação de bits impede a pilha de executar?",
                        verso: "A de escrita com a de não executável na página.",
                    },
                    {
                        frente: "Quem confere as permissões a cada acesso de memória?",
                        verso: "O hardware, lendo os bits da tabela sem custo visível.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantos acessos extras a tradução custaria sem o TLB?",
                        verso: "Quatro, um por nível da tabela de páginas.",
                    },
                    {
                        frente: "Por que a localidade paga duas vezes no desempenho?",
                        verso: "Ela acerta o cache do dado e o TLB da tradução.",
                    },
                    {
                        frente: "Quanto uma hugepage cobre a mais por entrada de TLB?",
                        verso: "Quinhentas e doze vezes mais, com página de 2 MB.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que estratégia evita ler o executável inteiro no exec?",
                        verso: "O demand paging, materializando página só quando usada.",
                    },
                    {
                        frente: "O que o fork realmente copia, e o que ele adia?",
                        verso: "Copia o mapa; a página só é copiada na primeira escrita.",
                    },
                    {
                        frente: "Que distância a alocação preguiçosa explica?",
                        verso: "A do prometido no virtual contra o residente na RAM.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que uso de swap é sinal de máquina saudável?",
                        verso: "Guardar páginas realmente frias e liberar RAM para cache.",
                    },
                    {
                        frente: "Que círculo vicioso o thrashing estabelece?",
                        verso: "Cada página trazida despeja outra que já era necessária.",
                    },
                    {
                        frente: "Que três saídas o thrashing admite, em ordem?",
                        verso: "Reduzir o conjunto de trabalho, somar RAM ou aceitar o limite.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que cópia extra o caminho tradicional do read faz?",
                        verso: "A do cache do kernel para o buffer do seu processo.",
                    },
                    {
                        frente: "O que dois processos ganham ao mapear compartilhado?",
                        verso: "As mesmas molduras físicas nas duas tabelas de páginas.",
                    },
                    {
                        frente: "Que problema o mapeamento compartilhado traz junto?",
                        verso: "A corrida: sincronizar vira responsabilidade sua.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que uniformidade o descritor traz ao Unix?",
                        verso: "Arquivo, pipe, socket e dispositivo com a mesma interface.",
                    },
                    {
                        frente: "Onde o shell faz a cirurgia do redirecionamento?",
                        verso: "Entre o fork e o exec, na tabela do processo filho.",
                    },
                    {
                        frente: "Que limite clássico o número de descritores tem?",
                        verso: "Mil e vinte e quatro por processo, elevável na config.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que duas salas de espera separam o print do disco?",
                        verso: "O buffer da biblioteca e o cache de páginas do kernel.",
                    },
                    {
                        frente: "Que faixa de custo o fsync cobra em cada mídia?",
                        verso: "Uns dois milissegundos no SSD e até vinte no disco.",
                    },
                    {
                        frente: "Por que o log some no crash, e onde ele estava?",
                        verso: "Preso no buffer da biblioteca, que ainda não escoou.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Onde o custo do modelo bloqueante realmente aparece?",
                        verso: "Na arquitetura: uma thread reservada por conexão aberta.",
                    },
                    {
                        frente: "Que erro o retorno de indisponível convida a cometer?",
                        verso: "Chamar de novo em laço, queimando CPU à toa.",
                    },
                    {
                        frente: "Que meio-termo o mundo real usa o tempo todo?",
                        verso: "Threads bloqueantes num pool de tamanho controlado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que mudança estrutural o epoll traz sobre o select?",
                        verso: "Registra uma vez e devolve só os descritores prontos.",
                    },
                    {
                        frente: "Que cláusula dura o contrato do event loop impõe?",
                        verso: "Nenhum handler pode demorar, ou o loop inteiro atrasa.",
                    },
                    {
                        frente: "Que fronteira o io_uring representa hoje?",
                        verso: "Duas filas compartilhadas, com menos syscalls no caminho.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que recurso domina o tempo em sistema de informação?",
                        verso: "A entrada e saída, quase nunca o cálculo da CPU.",
                    },
                    {
                        frente: "Que pergunta abre a investigação de lentidão?",
                        verso: "Quantas idas a disco e rede aquele caminho faz.",
                    },
                    {
                        frente: "Que problema clássico vira aritmética com essa régua?",
                        verso: "O N mais um, com 101 consultas onde cabiam duas.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que contrato de atomicidade o log precisa cumprir?",
                        verso: "Cada linha aparecendo inteira, sem se misturar com outra.",
                    },
                    {
                        frente: "Que abordagem a aula recusa para resolver as corridas?",
                        verso: "Band-aid local em cada uma, em vez de mudar o desenho.",
                    },
                    {
                        frente: "Onde as corridas custam barato de achar?",
                        verso: "No papel, antes de virarem chamado de madrugada.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que princípio o desenho da fila aplica?",
                        verso: "O confinamento: o recurso tem uma dona única.",
                    },
                    {
                        frente: "Que custo o mutex em volta do write imporia?",
                        verso: "Cada thread pagaria a syscall e o disco sob o cadeado.",
                    },
                    {
                        frente: "Onde cada lado paga o custo no desenho da fila?",
                        verso: "O produtor em nanossegundos e a escritora na E/S lenta.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que política o projeto adota por classe de mensagem?",
                        verso: "Erro e auditoria nunca se perdem; depuração pode cair.",
                    },
                    {
                        frente: "Que desfecho a fila sem teto agenda para o pico?",
                        verso: "O estouro de memória, levando junto os logs do incidente.",
                    },
                    {
                        frente: "Onde a mesma decisão de backpressure reaparece?",
                        verso: "Em brokers, proxies e roteadores com buffer limitado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que prazo o orquestrador costuma dar antes do kill?",
                        verso: "Cerca de dez segundos entre o pedido e a execução.",
                    },
                    {
                        frente: "Que plano B a drenagem precisa ter no desligamento?",
                        verso: "Um limite de tempo, para não travar além do prazo.",
                    },
                    {
                        frente: "Que teste o desligamento merece, como o caminho feliz?",
                        verso: "Mandar o sinal sob carga e conferir o arquivo depois.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que primeira pergunta o mapa de decisões faz?",
                        verso: "Se dá para compartilhar menos, com dado imutável ou próprio.",
                    },
                    {
                        frente: "Que transformação confinar mais fila produz?",
                        verso: "Concorrência vira troca de mensagem, mais fácil de seguir.",
                    },
                    {
                        frente: "Que aparência a concorrência bem feita costuma ter?",
                        verso: "Quase nada compartilhado, e o pouco com dono claro.",
                    },
                ],
            },
        },
    },
};
