import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de System Design, trilha avulsa e avançada.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento do
 * cenário; as cartas guardam o que a aula ensina e o quiz não cabe cobrar: os
 * números de referência, as fórmulas, os nomes próprios dos sintomas e o preço
 * declarado de cada escolha.
 */
export const systemDesign: CartasDaTrilha = {
    trilha: "System Design",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que três coisas um desenho de System Design decide?",
                        verso: "Quais peças entram, como se ligam e por que essa combinação.",
                    },
                    {
                        frente: "Que três assuntos aparecem quando a conversa vira System Design?",
                        verso: "Rede, falha parcial e números.",
                    },
                    {
                        frente: "Que três perguntas a régua de 2026 cobra de toda decisão?",
                        verso: "Quanto custa, como falha e quanto dá de trabalho operar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantas funcionalidades centrais escolher ao cortar escopo?",
                        verso: "De três a cinco, dizendo em voz alta o que ficou de fora.",
                    },
                    {
                        frente: "Quais seis eixos não funcionais mais mexem no desenho?",
                        verso: "Escala, latência, disponibilidade, consistência, durabilidade e custo.",
                    },
                    {
                        frente: "Por que propor a suposição em vez de perguntar a escala?",
                        verso: "Fixa um número para calcular e mostra quais números importam.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quanto de parada por mês cabe em 99,9%?",
                        verso: "Cerca de 44 minutos.",
                    },
                    {
                        frente: "Quanto de parada por mês cabe em 99,99%?",
                        verso: "Cerca de 4 minutos e meio.",
                    },
                    {
                        frente: "Qual é a diferença entre SLI, SLO e SLA?",
                        verso: "SLI mede, SLO é a meta interna, SLA é o contrato com penalidade.",
                    },
                    {
                        frente: "O que é o error budget e para que serve enquanto sobra?",
                        verso: "A folga de falha do período; autoriza arriscar deploy e mudança.",
                    },
                    {
                        frente: "O que acontece com a disponibilidade de peças em série?",
                        verso: "Multiplica e piora: cinco de 99,9% dão cerca de 99,5%.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quais são as seis etapas do roteiro de uma sessão de design?",
                        verso: "Requisitos, estimativas, interface e dados, desenho, aprofundar, avaliar.",
                    },
                    {
                        frente: "Como organizar o desenho de alto nível sem espalhar caixas?",
                        verso: "Seguindo o caminho de uma requisição do começo ao fim.",
                    },
                    {
                        frente: "Que três partes tem uma boa declaração de trade-off?",
                        verso: "As opções, a escolha feita e o preço que ela cobra.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que pergunta fazer sobre cada peça ao fechar o desenho?",
                        verso: "Se esta peça cair agora, o que o usuário vê?",
                    },
                    {
                        frente: "Qual é a ordem certa ao responder sobre uma solução técnica?",
                        verso: "Conceito primeiro, produto ou marca depois e só se perguntarem.",
                    },
                    {
                        frente: "Quando mudar de ideia demonstra senioridade numa sessão?",
                        verso: "Quando existe motivo novo e ele é declarado em voz alta.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Quantos segundos tem um dia na conta de guardanapo?",
                        verso: "Cem mil, arredondando os 86.400 reais.",
                    },
                    {
                        frente: "Quanto custa uma leitura de memória e uma de SSD?",
                        verso: "Cerca de 100 nanossegundos e 100 microssegundos, mil vezes mais.",
                    },
                    {
                        frente: "Quanto custa uma ida e volta entre continentes?",
                        verso: "Cerca de 150 milissegundos, um milhão de vezes a leitura de memória.",
                    },
                    {
                        frente: "Que multiplicador de pico cobre a variação diária normal?",
                        verso: "De duas a três vezes a média.",
                    },
                    {
                        frente: "Como se resolve pico de dez vezes ou mais a média?",
                        verso: "Com fila, limitação de taxa e sala de espera, não com máquina maior.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a cadeia da conta de requisições por segundo?",
                        verso: "Usuários ativos por dia vezes ações, dividido por cem mil, vezes o pico.",
                    },
                    {
                        frente: "Quantas requisições por segundo assumir por instância?",
                        verso: "Mil, de forma conservadora, declarando a suposição.",
                    },
                    {
                        frente: "Para onde vai o desenho quando a escrita supera a leitura?",
                        verso: "Fila na entrada, escrita em lote, particionamento e agregação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a cadeia da conta de armazenamento?",
                        verso: "Escritas por dia vezes tamanho do registro vezes dias de retenção.",
                    },
                    {
                        frente: "O que costuma faltar na conta e a deixa abaixo do real?",
                        verso: "O espaço dos índices e das réplicas, que facilmente triplica o disco.",
                    },
                    {
                        frente: "Qual é a alavanca mais barata quando o armazenamento assusta?",
                        verso: "Negociar retenção, antes de comprimir ou trocar de banco.",
                    },
                    {
                        frente: "Qual é o tamanho típico de um registro de texto com metadados?",
                        verso: "Cerca de 1 KB, sendo o texto a menor parte dele.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Como se estima a banda de saída de um serviço?",
                        verso: "Requisições por segundo vezes o tamanho médio da resposta.",
                    },
                    {
                        frente: "Sobre qual conjunto se dimensiona a memória de um cache?",
                        verso: "Sobre o conjunto quente, a fatia mais acessada, e não sobre o total.",
                    },
                    {
                        frente: "Como se calcula quanto o cache alivia o banco?",
                        verso: "Requisições por segundo vezes a taxa de acerto que se espera.",
                    },
                    {
                        frente: "O que é a avalanche de cache?",
                        verso: "A taxa de acerto despencar e toda a carga cair de uma vez no banco.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é o uso mais valioso de uma estimativa numa sessão?",
                        verso: "Descartar o componente que a carga não justifica.",
                    },
                    {
                        frente: "A partir de quanto de saída a CDN deixa de ser opcional?",
                        verso: "Na casa de dezenas de gigabits por segundo.",
                    },
                    {
                        frente: "O que costuma quebrar primeiro quando a escala cresce muito?",
                        verso: "A leitura do banco, antes da escrita e antes da banda.",
                    },
                    {
                        frente: "Qual item de custo mais surpreende em sistema com mídia?",
                        verso: "A saída de dados da nuvem, cobrada por byte que sai.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que o TTL de uma resposta DNS governa?",
                        verso: "Quanto tempo ela fica em cache, e quanto demora para uma troca valer.",
                    },
                    {
                        frente: "Qual é o limite de balancear carga alternando IPs no DNS?",
                        verso: "Ele não enxerga se a máquina daquele endereço está viva.",
                    },
                    {
                        frente: "Que TTL se usa em nome que participa de failover?",
                        verso: "Curto, na casa de 60 segundos, aceitando mais consultas e custo.",
                    },
                    {
                        frente: "Qual é a vantagem do anycast sobre o failover por DNS?",
                        verso: "A troca não espera cache de resolução expirar em ninguém.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que dois problemas a CDN resolve, e qual costuma custar mais?",
                        verso: "Latência e banda; a banda e a carga é que pesam no bolso.",
                    },
                    {
                        frente: "Quem paga a latência da origem no modelo pull da CDN?",
                        verso: "O primeiro usuário a pedir aquele conteúdo em cada região.",
                    },
                    {
                        frente: "Qual é a solução padrão para não precisar invalidar na borda?",
                        verso: "Versionar o nome do arquivo com o hash do conteúdo.",
                    },
                    {
                        frente: "Que regra decide o que sai pela borda e o que sai pela aplicação?",
                        verso: "Estático e repetido sai pela borda; personalizado, pela aplicação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a função de cada uma das três peças de entrada?",
                        verso: "Balanceador escolhe a instância, proxy é a porta, gateway aplica regra.",
                    },
                    {
                        frente: "O que a camada 7 permite que a camada 4 não permite?",
                        verso: "Rotear por caminho e mandar parte do tráfego para uma versão nova.",
                    },
                    {
                        frente: "Quando o algoritmo de menor número de conexões ganha do round robin?",
                        verso: "Quando o custo por requisição varia muito entre as chamadas.",
                    },
                    {
                        frente: "Qual é a diferença entre teste de vivacidade e de prontidão?",
                        verso: "Um diz se o processo está de pé; o outro, se pode receber tráfego.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde mora o arquivo e o que o banco guarda dele?",
                        verso: "O arquivo vai para blob storage e o banco guarda só o endereço.",
                    },
                    {
                        frente: "Quais são os passos do upload por URL assinada?",
                        verso: "A API valida e assina, o cliente envia direto ao blob e avisa a API.",
                    },
                    {
                        frente: "Qual é a alternativa a apagar dado antigo que incomoda no custo?",
                        verso: "Mover para uma classe de armazenamento mais fria por ciclo de vida.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quem recebe a mensagem numa fila e num tópico de pub/sub?",
                        verso: "Na fila, um consumidor; no tópico, todos os assinantes.",
                    },
                    {
                        frente: "Por que publicar um fato desacopla mais do que enfileirar uma ordem?",
                        verso: "Quem produz deixa de decidir o que acontece depois.",
                    },
                    {
                        frente: "Que quatro preços o modelo de eventos cobra?",
                        verso: "Rastreio difícil, ordem não garantida, repetição e consistência eventual.",
                    },
                    {
                        frente: "Quando transformar chamada síncrona em evento é decisão errada?",
                        verso: "Quando quem chamou precisa do resultado naquele momento.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Qual é o risco de cada modo de replicação?",
                        verso: "Assíncrona pode perder escrita; síncrona trava se o seguidor travar.",
                    },
                    {
                        frente: "Quais são os três sintomas do atraso de replicação?",
                        verso: "Não ler a própria escrita, leitura não monotônica e prefixo quebrado.",
                    },
                    {
                        frente: "Como se corrige o usuário não ver o que acabou de escrever?",
                        verso: "Mandando essas leituras dele para o líder por um tempo curto.",
                    },
                    {
                        frente: "O que é cérebro dividido numa troca de líder?",
                        verso: "Dois nós aceitando escrita ao mesmo tempo, o que costuma corromper dado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que problema o particionamento resolve e a replicação não?",
                        verso: "O dado não caber em uma única máquina.",
                    },
                    {
                        frente: "Por que particionar por faixa de data cria ponto quente?",
                        verso: "Quase toda escrita é do período recente e cai no mesmo pedaço.",
                    },
                    {
                        frente: "Que quatro coisas o particionamento tira de você?",
                        verso: "Transação entre pedaços, junção, unicidade global e consulta fora da chave.",
                    },
                    {
                        frente: "Que critério escolhe a chave de partição?",
                        verso: "O valor que aparece na maioria das consultas mais frequentes.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que o resto da divisão pelo número de nós é ruim?",
                        verso: "Mudar a quantidade de nós remapeia quase todas as chaves de uma vez.",
                    },
                    {
                        frente: "No anel, a qual nó pertence uma chave?",
                        verso: "Ao primeiro nó encontrado andando pelo círculo, sempre no mesmo sentido.",
                    },
                    {
                        frente: "Quantas chaves mudam de lugar ao somar um nó ao anel?",
                        verso: "Cerca de um sobre n: com dez nós, subir para onze move uns 10%.",
                    },
                    {
                        frente: "Que dois defeitos os nós virtuais corrigem?",
                        verso: "A distribuição desigual e a carga do nó caído indo toda para o vizinho.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que o CAP não é escolher dois entre três?",
                        verso: "Tolerar partição não é opcional: a escolha só existe durante ela.",
                    },
                    {
                        frente: "O que o PACELC acrescenta ao CAP?",
                        verso: "Fora da partição, a escolha entre latência e consistência.",
                    },
                    {
                        frente: "Como se classifica quem prefere disponibilidade e depois latência?",
                        verso: "Como PA/EL, o oposto do PC/EC de saldo e estoque.",
                    },
                    {
                        frente: "Qual é a forma madura de aplicar CAP numa sessão?",
                        verso: "Decidir por operação, e não classificar o sistema inteiro de uma vez.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que condição de quórum garante enxergar a escrita mais recente?",
                        verso: "W mais R maior que N, para os conjuntos se sobreporem.",
                    },
                    {
                        frente: "Qual arranjo de quórum é o mais comum com três réplicas?",
                        verso: "W igual a dois e R igual a dois, equilibrando escrita e leitura.",
                    },
                    {
                        frente: "O que o quórum não resolve sozinho?",
                        verso: "A ordem entre escritas concorrentes na mesma chave.",
                    },
                    {
                        frente: "Qual é o defeito de resolver conflito por última escrita vence?",
                        verso: "Ele descarta uma das escritas em silêncio.",
                    },
                    {
                        frente: "O que a consistência eventual promete, e o que não promete?",
                        verso: "Promete convergência sem escritas novas; não promete prazo nenhum.",
                    },
                    {
                        frente: "Para que se usa consenso, dado o custo dele?",
                        verso: "Para decisão estrutural, como eleger líder e guardar configuração.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que duas decisões vêm antes de escolher o algoritmo de limitação?",
                        verso: "Por quem se limita e o que acontece quando o limite estoura.",
                    },
                    {
                        frente: "Qual é o defeito da janela fixa?",
                        verso: "Aceita quase o dobro do limite na virada de uma janela para a outra.",
                    },
                    {
                        frente: "Como a janela deslizante por contagem corrige a virada?",
                        verso: "Ponderando a janela anterior pela fração de tempo que ainda vale.",
                    },
                    {
                        frente: "Por que o balde de fichas é o mais usado em API pública?",
                        verso: "Separa a taxa média sustentada da rajada que se quer tolerar.",
                    },
                    {
                        frente: "O que fazer quando o cache dos contadores compartilhados cai?",
                        verso: "Liberar as requisições: limitador indisponível não derruba o serviço.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Além de único, que propriedade o identificador precisa ter?",
                        verso: "Ser ordenável no tempo, para a escrita no índice ficar sequencial.",
                    },
                    {
                        frente: "Qual é o efeito de usar identificador aleatório como chave?",
                        verso: "As inserções se espalham pelo índice e fragmentam as páginas dele.",
                    },
                    {
                        frente: "O que o UUID versão 7 faz de diferente do versão 4?",
                        verso: "Coloca o carimbo de tempo nos bits mais significativos.",
                    },
                    {
                        frente: "Como o Snowflake divide os 64 bits?",
                        verso: "Um de sinal, 41 de tempo, 10 de máquina e 12 de sequência.",
                    },
                    {
                        frente: "Que dois problemas o Snowflake traz?",
                        verso: "Relógio andando para trás e vazar o volume criado entre dois ids.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que um índice invertido mapeia?",
                        verso: "Cada termo para a lista de documentos onde ele aparece.",
                    },
                    {
                        frente: "Que propriedade vem de o índice de busca ser derivado?",
                        verso: "Pode ser jogado fora e refeito a partir do banco de origem.",
                    },
                    {
                        frente: "Que estrutura resolve sugestão enquanto se digita?",
                        verso: "Uma árvore de prefixos em memória, com as sugestões já prontas.",
                    },
                    {
                        frente: "Que dois cortes de front-end derrubam a carga de sugestão?",
                        verso: "Exigir um mínimo de letras e atrasar o disparo da consulta.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde fica o custo do feed em cada um dos dois modelos?",
                        verso: "No pull, em toda leitura; no push, na escrita de quem publica.",
                    },
                    {
                        frente: "O que é o problema da celebridade no fan-out na escrita?",
                        verso: "Uma publicação vira milhões de escritas de caixa de uma só vez.",
                    },
                    {
                        frente: "Como o modelo híbrido de feed divide as contas?",
                        verso: "Push para contas comuns e pull para as muito grandes, mesclando na leitura.",
                    },
                    {
                        frente: "Que otimização evita trabalho inútil no fan-out?",
                        verso: "Não distribuir para contas inativas, montando o feed delas sob demanda.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que significa uma operação ser idempotente?",
                        verso: "Repeti-la não produz efeito adicional além do da primeira vez.",
                    },
                    {
                        frente: "Por que entrega exatamente uma vez não existe?",
                        verso: "Quem envia não distingue perda da mensagem de perda da confirmação.",
                    },
                    {
                        frente: "Que combinação equivale a processar exatamente uma vez?",
                        verso: "Entrega ao menos uma vez somada a processamento idempotente.",
                    },
                    {
                        frente: "O que precisa ser atômico ao usar chave de idempotência?",
                        verso: "Gravar a chave e aplicar o efeito, na mesma transação.",
                    },
                    {
                        frente: "Em que três lugares o padrão de idempotência volta a aparecer?",
                        verso: "Consumidor de fila, retentativa automática e integração com terceiros.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Por que gerar o código curto a partir de um contador?",
                        verso: "Garante unicidade sem precisar verificar colisão a cada criação.",
                    },
                    {
                        frente: "Quantas combinações dão sete caracteres em base 62?",
                        verso: "Cerca de 3,5 trilhões, folga enorme para a escala estimada.",
                    },
                    {
                        frente: "Qual é o preço de responder o redirecionamento com 301?",
                        verso: "O navegador para de consultar o servidor, e some a contagem de clique.",
                    },
                    {
                        frente: "Que medida evita muitas chaves de cache vencerem juntas?",
                        verso: "Distribuir o vencimento delas em vez de usar o mesmo prazo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que peça permite entregar mensagem a quem está em outro servidor?",
                        verso: "Um registro de presença dizendo em qual servidor cada usuário está.",
                    },
                    {
                        frente: "Por que o WebSocket ganha dos eventos enviados pelo servidor no chat?",
                        verso: "Porque o tráfego precisa ir nos dois sentidos, e não só de volta.",
                    },
                    {
                        frente: "Por que particionar mensagens pelo identificador da conversa?",
                        verso: "Abrir uma conversa passa a tocar um pedaço só do armazenamento.",
                    },
                    {
                        frente: "Por que não ordenar mensagens pelo relógio do servidor?",
                        verso: "Servidores diferentes discordam entre si na casa dos milissegundos.",
                    },
                    {
                        frente: "O que acontece quando o destinatário está offline?",
                        verso: "A mensagem fica guardada, vai notificação push e ele sincroniza ao voltar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que a caixa de entrada guarda referência e não conteúdo?",
                        verso: "Para o conteúdo existir num lugar só e a exclusão ser um registro.",
                    },
                    {
                        frente: "O que acontece quando o usuário aperta publicar?",
                        verso: "O sistema grava, confirma na hora e enfileira o trabalho de distribuição.",
                    },
                    {
                        frente: "Por que o worker de fan-out precisa ser idempotente?",
                        verso: "Uma falha devolve a mensagem à fila e ela é processada de novo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que vantagem o envio em partes traz para arquivo grande?",
                        verso: "Permite retomar de onde parou, sem recomeçar o arquivo inteiro.",
                    },
                    {
                        frente: "O que a divisão em segmentos com manifesto viabiliza?",
                        verso: "Trocar de qualidade entre um segmento e o seguinte, conforme a conexão.",
                    },
                    {
                        frente: "Como se transcodifica um vídeo longo sem prender uma máquina?",
                        verso: "Dividindo em pedaços, processando em paralelo e reunindo no fim.",
                    },
                    {
                        frente: "Qual é a métrica financeira central de um sistema de vídeo?",
                        verso: "A taxa de acerto da CDN, porque a saída de dados é o maior custo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como se evita calcular a distância de todos os pontos?",
                        verso: "Dividindo o mapa em células e buscando por chave de célula.",
                    },
                    {
                        frente: "Por que a busca por proximidade lê também as células vizinhas?",
                        verso: "Porque o ponto pode estar na borda, com o mais perto do outro lado.",
                    },
                    {
                        frente: "Qual é o trade-off no tamanho da célula?",
                        verso: "Célula grande devolve gente demais; pequena obriga a consultar mais.",
                    },
                    {
                        frente: "Qual operação de um app de carona exige consistência forte?",
                        verso: "Atribuir o motorista à corrida, com reserva atômica condicional.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que métrica o usuário sente numa resposta transmitida em fluxo?",
                        verso: "O tempo até o primeiro pedaço, e não o tempo total da geração.",
                    },
                    {
                        frente: "Quais são as três formas de cache numa API de inferência?",
                        verso: "Cache exato da entrada, cache semântico e cache de prefixo.",
                    },
                    {
                        frente: "Qual forma de cache reduz custo sem risco de resposta trocada?",
                        verso: "O cache de prefixo, que reaproveita o trecho longo já processado.",
                    },
                    {
                        frente: "Qual é a escada de resposta quando o provedor do modelo falha?",
                        verso: "Retentativa com backoff, modelo de reserva e degradação declarada.",
                    },
                    {
                        frente: "Por que o cancelamento precisa chegar até quem está gerando?",
                        verso: "Continuar gerando para uma aba fechada queima GPU e dinheiro.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é o trade-off de aumentar o tamanho do lote na GPU?",
                        verso: "Sobe o total processado por segundo e piora a latência individual.",
                    },
                    {
                        frente: "Que defeito o agrupamento contínuo corrige no lote fixo?",
                        verso: "O lote inteiro ficar preso esperando a requisição mais lenta terminar.",
                    },
                    {
                        frente: "O que fazer quando a espera estimada passa do limite aceitável?",
                        verso: "Recusar na entrada com mensagem honesta, em vez de aceitar e expirar.",
                    },
                    {
                        frente: "Qual alavanca mais reduz o custo por token?",
                        verso: "Encurtar o contexto enviado, já que se cobra entrada e saída.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quais são os dois caminhos independentes de um sistema de RAG?",
                        verso: "A ingestão, assíncrona e em lote, e a consulta, síncrona e no caminho.",
                    },
                    {
                        frente: "Por que a busca vetorial precisa ser combinada com busca por termo?",
                        verso: "Ela erra em sigla, nome próprio, número e código de produto.",
                    },
                    {
                        frente: "Qual é a lógica do passo de reordenação?",
                        verso: "Um filtro barato reduz o universo e um caro escolhe entre os poucos.",
                    },
                    {
                        frente: "Onde entra o filtro de permissão, e por quê?",
                        verso: "Na busca, porque depois o modelo já leu o trecho e pode repeti-lo.",
                    },
                    {
                        frente: "O que acontece ao trocar o modelo que gera os vetores?",
                        verso: "Todo o índice vetorial precisa ser reconstruído do zero.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que substitui o teste que passa ou falha em sistema de IA?",
                        verso: "Um conjunto de avaliação com nota, tratado como métrica de sistema.",
                    },
                    {
                        frente: "Que evento externo precisa disparar a avaliação?",
                        verso: "A troca de versão do modelo feita pelo provedor por baixo.",
                    },
                    {
                        frente: "O que os guardrails cobram para existir no caminho?",
                        verso: "Latência e, quando usam outro modelo, custo por chamada.",
                    },
                    {
                        frente: "O que registrar por requisição para investigar resposta ruim?",
                        verso: "Instrução e versão, trechos, modelo, tokens, custo e os controles.",
                    },
                    {
                        frente: "Qual é a fonte mais barata de casos novos de avaliação?",
                        verso: "O feedback do próprio usuário, coletado na interface.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que seis perguntas sobrevivem a qualquer enunciado de design?",
                        verso: "O que e para quantos, leitura x escrita, dado velho, falha, custo e escopo.",
                    },
                    {
                        frente: "O que os cinco estudos de caso mostram quando lidos juntos?",
                        verso: "Que recombinam as mesmas decisões, em proporções que os números guiam.",
                    },
                    {
                        frente: "Que parte da habilidade a prática solitária não treina?",
                        verso: "Defender a escolha enquanto outra pessoa questiona.",
                    },
                ],
            },
        },
    },
};
