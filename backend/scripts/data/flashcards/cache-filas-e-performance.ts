import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Cache, Filas e Performance, sexta trilha do roadmap de Back-end.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a leitura de
 * cenário e as contas; as cartas ficam com as definições, as listas fechadas
 * e os nomes próprios que sustentam esses julgamentos.
 */
export const cacheFilasEPerformance: CartasDaTrilha = {
    trilha: "Cache, Filas e Performance",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que três coisas concretas a performance afeta?",
                        verso: "Experiência do usuário, custo de servidor e capacidade de atender gente.",
                    },
                    {
                        frente: "Que pista denuncia um gargalo de I/O de banco?",
                        verso: "O tempo de resposta cresce junto com o tamanho dos dados.",
                    },
                    {
                        frente: "Que pista denuncia trabalho síncrono pesado?",
                        verso: "Uma rota lenta derruba o throughput de todas as outras.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Em que unidades latência e throughput são medidos?",
                        verso: "Milissegundos na latência e requisições por segundo no throughput.",
                    },
                    {
                        frente: "Que dois exemplos mostram latência e throughput competindo?",
                        verso: "Processar em lote e concorrência disputando os mesmos recursos.",
                    },
                    {
                        frente: "Quando a latência do Node trava mesmo o throughput?",
                        verso: "Quando o tempo é CPU pura: o processo faz uma coisa de cada vez.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que média sai de 99 requisições de 50ms e uma de 5000ms?",
                        verso: "Cerca de 99,5ms, que não é a experiência de ninguém ali.",
                    },
                    {
                        frente: "Que outro nome o p50 tem?",
                        verso: "Mediana: metade das requisições foi mais rápida que ele.",
                    },
                    {
                        frente: "Por que a chance de cair na cauda lenta cresce por usuário?",
                        verso: "Ele faz várias requisições numa sessão, e basta uma cair lá.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quem disse que otimização prematura é a raiz de todo mal?",
                        verso: "Donald Knuth, ainda nos anos 1970.",
                    },
                    {
                        frente: "O que Knuth realmente quis dizer com aquela frase?",
                        verso: "Não otimize o que parece lento sem antes medir se é o problema.",
                    },
                    {
                        frente: "Que três ferramentas de profiling a aula cita?",
                        verso: "A flag de prof do Node, o Chrome DevTools via inspect e o clinic.js.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que duas fontes concentram a maioria dos gargalos em Node?",
                        verso: "O banco de dados e trabalho síncrono pesado dentro da requisição.",
                    },
                    {
                        frente: "Por que o banco esconde gargalo melhor que serviço externo?",
                        verso: "A query ruim se esconde atrás de um await; a integração lenta todos sabem.",
                    },
                    {
                        frente: "Que duas coisas medir de novo depois da otimização entrega?",
                        verso: "Confirma que a mudança funcionou e revela qual é o próximo gargalo.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que o cache muda e o que ele não muda na resposta?",
                        verso: "Muda de onde ela vem; o conteúdo deveria continuar o mesmo.",
                    },
                    {
                        frente: "Que quatro trabalhos caros valem a pena cachear?",
                        verso: "Query pesada, chamada externa, cálculo caro e o total de um N+1.",
                    },
                    {
                        frente: "O que o cache não substitui?",
                        verso: "Um índice ruim; e ele não resolve um N+1 por conta própria.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que dois serviços exemplificam cache distribuído?",
                        verso: "Redis e Memcached, rodando fora do processo da aplicação.",
                    },
                    {
                        frente: "Que custo o cache distribuído tem que o em memória não tem?",
                        verso: "A ida e volta pela rede até o serviço de cache.",
                    },
                    {
                        frente: "Por que esse custo de rede costuma compensar?",
                        verso: "Ele é bem menor que o de uma consulta pesada no banco.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que cuidado extra o cache de dado por usuário exige?",
                        verso: "A chave nunca pode misturar o dado de um usuário com o de outro.",
                    },
                    {
                        frente: "Que exemplos clássicos respondem sim às três perguntas?",
                        verso: "Lista de categorias, perfil público e relatório agregado diário.",
                    },
                    {
                        frente: "O que colocar cache sem critério adiciona?",
                        verso: "Complexidade e mais um jeito de mostrar dado errado, sem ganho.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a sigla TTL quer dizer?",
                        verso: "Time to live: o tempo de vida de uma entrada de cache.",
                    },
                    {
                        frente: "O que acontece com um cache sem nenhum TTL?",
                        verso: "Vira fonte permanentemente desatualizada até alguém apagar na mão.",
                    },
                    {
                        frente: "Que dois lados o TTL equilibra?",
                        verso: "Frescor contra reuso: curto atualiza mais, longo reaproveita mais.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que outro nome o padrão cache-aside tem?",
                        verso: "Lazy loading, porque só carrega o dado quando alguém pede.",
                    },
                    {
                        frente: "De onde vem o aside no nome do padrão?",
                        verso: "O cache fica ao lado do fluxo, e a aplicação é quem o consulta.",
                    },
                    {
                        frente: "O que o cache-aside troca, em uma frase?",
                        verso: "A certeza do dado atual por alta chance de resposta rápida.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que cinco usos comuns o Redis costuma cobrir?",
                        verso: "Cache, sessão, contador, rate limit e fila de jobs.",
                    },
                    {
                        frente: "Que porta o Redis escuta por padrão?",
                        verso: "A 6379, geralmente subida por Docker em desenvolvimento.",
                    },
                    {
                        frente: "Que relação o Redis tem com o banco relacional?",
                        verso: "Não substitui: guarda um subconjunto pensado pra acesso repetido.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três coisas o ioredis entrega ao conectar no Redis?",
                        verso: "Quase todos os comandos, Promises e reconexão automática.",
                    },
                    {
                        frente: "Qual é o padrão de criação da instância do ioredis?",
                        verso: "Uma vez só, num módulo próprio, importada onde precisar.",
                    },
                    {
                        frente: "Por que reaproveitar a conexão importa tanto quanto no banco?",
                        verso: "Manter aberta é bem mais barato que abrir uma nova por requisição.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre EXPIRE e TTL no Redis?",
                        verso: "O EXPIRE define o tempo de vida; o TTL consulta quanto falta.",
                    },
                    {
                        frente: "Que comando sustenta contador e rate limit no Redis?",
                        verso: "O INCR, que soma um de forma atômica na chave.",
                    },
                    {
                        frente: "O que o Redis guarda de fato num SET simples?",
                        verso: "Sempre uma string; objeto vira texto inútil sem serializar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que quatro passos o cache-aside com Redis executa?",
                        verso: "Monta a chave, tenta o get, parseia no hit e grava com EX no miss.",
                    },
                    {
                        frente: "O que o cache-aside nunca deve guardar?",
                        verso: "A ausência do dado: ele guarda o resultado bom, não o vazio.",
                    },
                    {
                        frente: "Que cuidado a resposta de erro pede no cache-aside?",
                        verso: "Não cachear: senão a rota erra até a chave expirar sozinha.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que parâmetro configura a política de descarte do Redis?",
                        verso: "O maxmemory-policy, que decide o que sai quando a memória enche.",
                    },
                    {
                        frente: "O que a política padrão do Redis faz quando a memória enche?",
                        verso: "A noeviction recusa novas escritas em vez de descartar algo.",
                    },
                    {
                        frente: "Qual é a diferença entre allkeys-lru e volatile-lru?",
                        verso: "A volatile só descarta entre as chaves que têm TTL definido.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "De quem é a frase sobre as duas coisas difíceis em computação?",
                        verso: "De Phil Karlton: invalidar cache e nomear coisas.",
                    },
                    {
                        frente: "Onde está o bug quando o cache serve preço velho?",
                        verso: "Em ninguém ter avisado o Redis; ele fez o que foi mandado.",
                    },
                    {
                        frente: "Quem constrói a ponte entre o UPDATE e o cache?",
                        verso: "O código da aplicação: nenhuma ferramenta faz isso sozinha.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que vantagem o TTL puro tem sobre invalidar na escrita?",
                        verso: "Menos código e nenhum risco de alguém esquecer de chamar o DEL.",
                    },
                    {
                        frente: "Quando o TTL sozinho já basta como estratégia?",
                        verso: "Quando um pouco de atraso não quebra nada no produto.",
                    },
                    {
                        frente: "Que risco um TTL curto demais traz?",
                        verso: "O cache quase não ajuda a poupar o banco, de tanto recarregar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quanto tempo o dado fica errado ao invalidar na escrita?",
                        verso: "Milissegundos: só entre o commit no banco e o DEL no Redis.",
                    },
                    {
                        frente: "Que nome tem escrever o valor novo no cache logo após o banco?",
                        verso: "Write-through: escrever através do cache, sem passar por miss.",
                    },
                    {
                        frente: "Que rota além do UPDATE também precisa invalidar?",
                        verso: "A de exclusão, senão o registro apagado sobrevive no cache.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que cache por id é o caso fácil de invalidar?",
                        verso: "A chave carrega o id, então o UPDATE sabe qual apagar.",
                    },
                    {
                        frente: "O que faz a chave de lista se multiplicar tanto?",
                        verso: "Cada combinação de filtro, ordenação e página vira uma nova.",
                    },
                    {
                        frente: "Que estratégia sobra para chave de lista, na prática?",
                        verso: "Só expirar: escolher um TTL curto o bastante pra doer pouco.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que opção do SET implementa o cadeado contra stampede?",
                        verso: "A NX, que só grava se a chave ainda não existir.",
                    },
                    {
                        frente: "Que paralelo o stampede tem com o rate limit?",
                        verso: "O rate limit barra tráfego externo; aqui o pico é interno, no banco.",
                    },
                    {
                        frente: "Que problema o jitter no TTL resolve exatamente?",
                        verso: "Chaves que venceriam juntas passam a expirar espalhadas no tempo.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que distinção separa o problema que a fila resolve do cache?",
                        verso: "A rota precisa fazer algo novo, não só buscar o que já foi feito.",
                    },
                    {
                        frente: "Que quatro trabalhos pesados aparecem dentro de uma rota?",
                        verso: "Enviar email, gerar PDF, processar imagem e chamar API externa.",
                    },
                    {
                        frente: "Por que o cache não resolve o envio de um email?",
                        verso: "É uma ação única por usuário, não uma leitura que se repete.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quais são as três peças de uma arquitetura com fila?",
                        verso: "O job, o produtor que enfileira e o consumidor que processa.",
                    },
                    {
                        frente: "Onde a fila em si fica guardada?",
                        verso: "No Redis, entre o momento de criar o job e o de processar.",
                    },
                    {
                        frente: "Que analogia a aula usa para explicar a fila?",
                        verso: "Tirar senha e sentar, em vez de esperar em pé no balcão.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o 202 promete, e o que ele não promete?",
                        verso: "Promete o início do trabalho, nunca que ele já terminou.",
                    },
                    {
                        frente: "Que tempo sobra na rota depois de enfileirar?",
                        verso: "Só salvar no banco e colocar o job no Redis, questão de milissegundos.",
                    },
                    {
                        frente: "Qual é a diferença entre 201 e 202 na resposta?",
                        verso: "O 201 diz que o recurso já existe; o 202, que ainda vai processar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o BullMQ usa por baixo para guardar os jobs?",
                        verso: "O Redis, o mesmo que já serve de cache na aplicação.",
                    },
                    {
                        frente: "O que o nome da fila liga na arquitetura?",
                        verso: "O produtor ao consumidor: o worker só pega o que está na dela.",
                    },
                    {
                        frente: "Por que separar filas por tipo de trabalho?",
                        verso: "Fica claro o que cada uma faz e dá pra escalar cada uma diferente.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três ganhos a fila entrega?",
                        verso: "O usuário não espera, o job resiste à queda e dá pra controlar a vazão.",
                    },
                    {
                        frente: "Que três custos a fila cobra?",
                        verso: "Mais peças no ar, resultado não imediato e mais um lugar pra depurar.",
                    },
                    {
                        frente: "Que pergunta decide se vale a pena enfileirar algo?",
                        verso: "Esse trabalho deixa a requisição lenta ou frágil de um jeito que se sente?",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Quais são os cinco estados de um job no BullMQ?",
                        verso: "waiting, delayed, active, completed e failed.",
                    },
                    {
                        frente: "O que a separação entre API e worker protege?",
                        verso: "Se um cai, o outro segue: os jobs ficam guardados no Redis.",
                    },
                    {
                        frente: "Por que a concorrência funciona num processo Node só?",
                        verso: "Enviar email é I/O: o processo espera a rede em vez de calcular.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como o backoff exponential espaça as tentativas?",
                        verso: "Dobrando a cada vez: um, dois, quatro e oito segundos.",
                    },
                    {
                        frente: "Que opção configura o retry uma vez só, na criação da fila?",
                        verso: "O defaultJobOptions, herdado por todo job daquela fila.",
                    },
                    {
                        frente: "Por que falhar não é motivo pra desistir de um job?",
                        verso: "A falha pode ser do serviço externo, e daria certo minutos depois.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que duas situações fazem um job rodar mais de uma vez?",
                        verso: "O retry depois da falha e o worker que cai antes de confirmar.",
                    },
                    {
                        frente: "Que operação é idempotente por natureza, entre as da aula?",
                        verso: "Marcar o pedido como pago: repetir deixa no mesmo estado.",
                    },
                    {
                        frente: "Como é a chave de idempotência no Redis?",
                        verso: "Um SET com EX e NX antes de processar a parte arriscada.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três informações o job em failed guarda pra investigar?",
                        verso: "O failedReason, o stacktrace e quantas tentativas já foram feitas.",
                    },
                    {
                        frente: "Que opção limita quantos jobs failed ficam guardados?",
                        verso: "O removeOnFail, já que o padrão é manter todos no Redis.",
                    },
                    {
                        frente: "Que duas decisões o time toma depois de corrigir a causa raiz?",
                        verso: "Reprocessar os jobs ou descartar, se já não fazem mais sentido.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em que estado um job com delay espera?",
                        verso: "Em delayed, até o tempo passar e ele virar waiting.",
                    },
                    {
                        frente: "Que vantagem o repeat tem sobre um cron tradicional?",
                        verso: "A recorrência vive na fila, com os mesmos workers e visibilidade.",
                    },
                    {
                        frente: "Que ferramenta comum mostra as filas do BullMQ num painel?",
                        verso: "O bull-board, no lugar de um console de log manual.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que pré-requisito a escala horizontal exige?",
                        verso: "Aplicação sem estado local e um load balancer na frente.",
                    },
                    {
                        frente: "Como o load balancer costuma distribuir as requisições?",
                        verso: "Em rodízio, ou por alguma métrica de carga das instâncias.",
                    },
                    {
                        frente: "Como o load balancer descobre que uma instância caiu?",
                        verso: "Batendo periodicamente num endpoint de health check.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que nome tem a técnica que prende o cliente à mesma instância?",
                        verso: "Sticky session, que amarra as requisições a um servidor só.",
                    },
                    {
                        frente: "O que torna o JWT compatível com escala horizontal?",
                        verso: "Ser auto-contido: qualquer instância verifica a assinatura sozinha.",
                    },
                    {
                        frente: "Qual é a regra prática sobre estado compartilhado?",
                        verso: "Não vai pra variável do processo; vai pro Redis, que todas veem.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três custos abrir uma conexão nova com o banco tem?",
                        verso: "Handshake, autenticação e alocação de recurso do lado do banco.",
                    },
                    {
                        frente: "O que a réplica de leitura resolve, sem duplicar a escrita?",
                        verso: "Tira a carga das consultas pesadas do banco principal.",
                    },
                    {
                        frente: "Por que o banco fica mais visível como gargalo ao escalar?",
                        verso: "Não é uma instância batendo nele, são várias ao mesmo tempo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três ferramentas protegem o sistema, além de escalar?",
                        verso: "Rate limit, timeout e degradação elegante.",
                    },
                    {
                        frente: "Que cascata a falta de timeout desencadeia sob carga?",
                        verso: "O pool esgota, requisição nova não começa e tudo cai junto.",
                    },
                    {
                        frente: "Que três formas de degradar com elegância existem?",
                        verso: "Versão reduzida, dado de cache um pouco velho ou aviso claro.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que problema cada peça deixa para a próxima resolver?",
                        verso: "Cache não ajuda no síncrono; fila só até uma instância aguentar.",
                    },
                    {
                        frente: "Que efeito colateral a trilha inteira produziu no sistema?",
                        verso: "Ele ficou mais complexo, com mais formas de quebrar sem perceber.",
                    },
                    {
                        frente: "O que um teste automatizado não faz pelo sistema?",
                        verso: "Deixá-lo mais rápido ou escalável: ele garante que não quebrou.",
                    },
                ],
            },
        },
    },
};
